// 骑手 session 的挂载用例：证明它真的接在 mux 上，而不只是出现在 Routes() 的清单里。
//
// 为什么单独一条：internal/rider 的用例直接调 Route.Session，覆盖的是处理器行为；
// 如果装配层忘了把它挂进 build()（或 method 写错），包级测试全绿而线上 404 ——
// 这与 B1「少填一个字段就静默降级」是同一类缺口。
package httpapi

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/rider"
)

// TestRiderSessionMountedPostOnly 断言两件事：
//  1. POST /tg-api/rider/session 命中处理器（未配置 → 503，**不是** 404）；
//  2. 只挂 POST —— GET 被 mux 的 method 匹配挡住。
//
// 注意（别把这条当「已与 Node 对齐」的证据）：Node 侧 `router.post('/rider/session')`
// 对 GET 是落到最终 404 兜底（HTML "Cannot GET …"），Go 1.22 mux 给的是 405。
// 状态码 404 vs 405 的差异是本项目已接受的既有偏差，不在本路由职责内；
// 这条用例只证明「GET 不会进到处理器里」。
func TestRiderSessionMountedPostOnly(t *testing.T) {
	server := pcServer(t, func(dep *Dep) {
		// 空依赖 = notConfigured，端点固定 503；这样这条用例只验「挂载与方法」。
		dep.Rider = rider.New(rider.Dep{Logf: func(string) {}})
	})

	request := httptest.NewRequest(http.MethodPost, "/tg-api/rider/session",
		strings.NewReader(`{"initData":"x"}`))
	request.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()
	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("POST /tg-api/rider/session 应已挂载并返回 503（未配置），实际 %d（body=%s）",
			recorder.Code, recorder.Body.String())
	}
	if got := recorder.Header().Get("Cache-Control"); got != "no-store" {
		t.Fatalf("Cache-Control 应为 no-store，实际 %q", got)
	}
	want := `{"success":false,"error":{"code":"RIDER_NOT_CONFIGURED","message":"rider session not configured"}}`
	if got := recorder.Body.String(); got != want {
		t.Fatalf("响应体不符\n got=%s\nwant=%s", got, want)
	}

	// initData 不接受 query 传参：这条只证明「GET 根本没挂」，配合 rider 包的
	// 「query 传参 → 401」用例，两条一起钉住 Node 的 m5 约束。
	getRecorder := httptest.NewRecorder()
	server.Handler().ServeHTTP(getRecorder, httptest.NewRequest(http.MethodGet, "/tg-api/rider/session", nil))
	if getRecorder.Code != http.StatusMethodNotAllowed {
		t.Fatalf("GET /tg-api/rider/session 应为 405（只挂 POST），实际 %d", getRecorder.Code)
	}
}
