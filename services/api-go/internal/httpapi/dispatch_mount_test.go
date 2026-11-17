// 派单通知的挂载用例：证明 POST /tg-api/internal/dispatch 真的接在 mux 上，
// 且中间件链把「原始字节」交给了处理器（这是本端点验签的全部前提）。
//
// 为什么单独一条：internal/dispatch 的用例直接调 Route.Dispatch，自己把 raw 塞进
// httpbody 的 context（等价中间件）。如果装配层没挂、或 httpapi.wrap 忘了 httpbody.With，
// 包级测试全绿而线上每个请求都 401 —— 这类缺口只有走真实 handler 链才看得见。
package httpapi

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/dispatch"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/gateway"
)

const mountSecret = "test-gateway-secret-0123456789abcdef"

// TestDispatchMountedPostOnly 断言挂载点与方法：未配置时 503（不是 404），GET 被 method 挡住。
func TestDispatchMountedPostOnly(t *testing.T) {
	server := pcServer(t, func(dep *Dep) {
		// 空依赖 = notConfigured，端点固定 503；这条只验「挂载与方法」。
		dep.Dispatch = dispatch.New(dispatch.Dep{Logf: func(string) {}})
	})

	request := httptest.NewRequest(http.MethodPost, "/tg-api/internal/dispatch", strings.NewReader(`{"event":"new_order"}`))
	request.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()
	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("应已挂载并返回 503（未配置），实际 %d（body=%s）", recorder.Code, recorder.Body.String())
	}
	want := `{"success":false,"error":{"code":"DISPATCH_NOT_CONFIGURED","message":"dispatch notify not configured"}}`
	if got := recorder.Body.String(); got != want {
		t.Fatalf("响应体不符\n got=%s\nwant=%s", got, want)
	}

	// 只挂 POST（Node 是 router.post('/internal/dispatch')）。
	getRecorder := httptest.NewRecorder()
	server.Handler().ServeHTTP(getRecorder, httptest.NewRequest(http.MethodGet, "/tg-api/internal/dispatch", nil))
	if getRecorder.Code != http.StatusMethodNotAllowed {
		t.Fatalf("GET 应为 405（只挂 POST），实际 %d", getRecorder.Code)
	}
}

// TestDispatchMountedSignsRawBody 走完整中间件链，用「键序非字母序」的 body 验签：
// 若 wrap() 没有把原始字节写进 context，处理器只能重新序列化（Go 的 map 按字母序），
// 签名必然对不上 → 401。这条同时钉住「rawBody 在所有请求上都被中间件填充」。
func TestDispatchMountedSignsRawBody(t *testing.T) {
	now := time.Unix(1700000000, 0)
	var route *dispatch.Route
	server := pcServer(t, func(dep *Dep) {
		dep.Dispatch = dispatch.New(dispatch.Dep{
			Secret:   mountSecret,
			BotToken: "test-bot-token-not-a-secret",
			Now:      func() time.Time { return now },
			Logf:     func(string) {},
		})
		route = dep.Dispatch
	})

	// 键序刻意不是字母序（字母序应为 courier_id → event → order_id）。
	raw := `{"event":"new_order","courier_id":9,"order_id":1001}`
	timestamp := strconv.FormatInt(now.Unix(), 10)
	request := httptest.NewRequest(http.MethodPost, "/tg-api/internal/dispatch", strings.NewReader(raw))
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("x-fbs-timestamp", timestamp)
	request.Header.Set("x-fbs-signature", gateway.Sign(mountSecret, timestamp, "dispatch", raw))

	recorder := httptest.NewRecorder()
	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusAccepted {
		t.Fatalf("原始字节参与验签时应 202，实际 %d（body=%s）", recorder.Code, recorder.Body.String())
	}
	want := `{"success":true,"accepted":true,"dedup":false}`
	if got := recorder.Body.String(); got != want {
		t.Fatalf("响应体不符\n got=%s\nwant=%s", got, want)
	}

	// 无 DB 时投递会异步失败（noDBStore），等它排空，避免 goroutine 跑出测试边界。
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := route.Drain(ctx); err != nil {
		t.Fatalf("Drain: %v", err)
	}
}
