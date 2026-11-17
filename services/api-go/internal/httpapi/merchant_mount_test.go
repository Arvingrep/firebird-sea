// 商家入口的挂载用例：证明三条 /tg-api/merchant/* 路由真的接在 mux 上。
//
// 结构照 rider_mount_test.go：internal/merchant 的用例直接调 Route 方法，覆盖的是
// 处理器行为；如果装配层忘了挂进 build()（或 method 写错），包级测试全绿而线上 404。
package httpapi

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/merchant"
)

// TestMerchantSessionMountedPostOnly 断言两件事：
//  1. POST /tg-api/merchant/session 命中处理器（未配置 → 503，**不是** 404）；
//  2. 只挂 POST —— GET 被 mux 的 method 匹配挡住（405 vs Node 404 是既有已接受偏差，
//     同 rider/session 的口径）。
func TestMerchantSessionMountedPostOnly(t *testing.T) {
	server := pcServer(t, func(dep *Dep) {
		dep.Merchant = merchant.New(merchant.Dep{Logf: func(string) {}})
	})

	request := httptest.NewRequest(http.MethodPost, "/tg-api/merchant/session",
		strings.NewReader(`{"initData":"x"}`))
	request.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()
	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("POST /tg-api/merchant/session 应已挂载并返回 503（未配置），实际 %d（body=%s）",
			recorder.Code, recorder.Body.String())
	}
	if got := recorder.Header().Get("Cache-Control"); got != "no-store" {
		t.Fatalf("Cache-Control 应为 no-store，实际 %q", got)
	}
	want := `{"success":false,"error":{"code":"MERCHANT_NOT_CONFIGURED","message":"merchant entry not configured"}}`
	if got := recorder.Body.String(); got != want {
		t.Fatalf("响应体不符\n got=%s\nwant=%s", got, want)
	}

	getRecorder := httptest.NewRecorder()
	server.Handler().ServeHTTP(getRecorder, httptest.NewRequest(http.MethodGet, "/tg-api/merchant/session", nil))
	if getRecorder.Code != http.StatusMethodNotAllowed {
		t.Fatalf("GET /tg-api/merchant/session 应为 405（只挂 POST），实际 %d", getRecorder.Code)
	}
}

// TestMerchantLandingMounted 证明 GET /tg-api/merchant/bind（落地页）真的接在 mux 上，
// 且方法与挂载点都对（Node 是 router.get('/merchant/bind')）。
func TestMerchantLandingMounted(t *testing.T) {
	// ① 未配置：挂上了就该 503 HTML，而不是 404。
	unconfigured := pcServer(t, func(dep *Dep) {
		dep.Merchant = merchant.New(merchant.Dep{Logf: func(string) {}})
	})
	recorder := httptest.NewRecorder()
	unconfigured.Handler().ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/tg-api/merchant/bind", nil))

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("GET /tg-api/merchant/bind 应已挂载并返回 503（未配置），实际 %d（body=%s）",
			recorder.Code, recorder.Body.String())
	}
	if got := recorder.Header().Get("Content-Type"); got != "text/html; charset=utf-8" {
		t.Fatalf("落地页/错误页 Content-Type = %q", got)
	}
	if !strings.Contains(recorder.Body.String(), "MERCHANT_NOT_CONFIGURED") {
		t.Fatalf("503 错误页应含错误码，实际 body=%s", recorder.Body.String())
	}

	// ② 配置齐备：走整条中间件链（CORS + body 上限 + mux）仍然是 200 + 自带 CSP。
	configured := pcServer(t, func(dep *Dep) {
		dep.Merchant = merchant.New(merchant.Dep{
			BotToken: "test-bot-token-not-a-secret",
			Gateway:  merchantLandingGateway{},
			Logf:     func(string) {},
		})
	})
	okRecorder := httptest.NewRecorder()
	configured.Handler().ServeHTTP(okRecorder, httptest.NewRequest(http.MethodGet, "/tg-api/merchant/bind", nil))

	if okRecorder.Code != http.StatusOK {
		t.Fatalf("配置齐备时落地页应为 200，实际 %d（body=%s）", okRecorder.Code, okRecorder.Body.String())
	}
	csp := okRecorder.Header().Get("Content-Security-Policy")
	if !strings.Contains(csp, "frame-ancestors https://web.telegram.org") {
		t.Fatalf("/tg-api 前缀没有全局 CSP，落地页必须自带，实际 %q", csp)
	}
	if got := okRecorder.Header().Get("Cache-Control"); got != "no-store" {
		t.Fatalf("Cache-Control 应为 no-store，实际 %q", got)
	}

	// ③ POST 已挂载：空 initData 走真实验签 → 401 错误页。
	postRecorder := httptest.NewRecorder()
	postRequest := httptest.NewRequest(http.MethodPost, "/tg-api/merchant/bind", strings.NewReader("phone=09178889999"))
	postRequest.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	configured.Handler().ServeHTTP(postRecorder, postRequest)
	if postRecorder.Code != http.StatusUnauthorized {
		t.Fatalf("POST /tg-api/merchant/bind（空 initData）应 401，实际 %d（body=%s）",
			postRecorder.Code, postRecorder.Body.String())
	}
	if !strings.Contains(postRecorder.Body.String(), "INVALID_INIT_DATA") {
		t.Fatalf("401 错误页应含错误码 INVALID_INIT_DATA，实际 body=%s", postRecorder.Body.String())
	}
}

// TestMerchantBindPostMounted 证明 POST /tg-api/merchant/bind 真的接在 mux 上。
func TestMerchantBindPostMounted(t *testing.T) {
	unconfigured := pcServer(t, func(dep *Dep) {
		dep.Merchant = merchant.New(merchant.Dep{Logf: func(string) {}})
	})
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodPost, "/tg-api/merchant/bind",
		strings.NewReader("initData=x&phone=09178889999"))
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	unconfigured.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("POST /tg-api/merchant/bind 应已挂载并返回 503（未配置），实际 %d（body=%s）",
			recorder.Code, recorder.Body.String())
	}
	if !strings.Contains(recorder.Body.String(), "MERCHANT_NOT_CONFIGURED") {
		t.Fatalf("503 错误页应含错误码，实际 body=%s", recorder.Body.String())
	}
}

// merchantLandingGateway 只为让 merchant.Route 过「网关已配置」这道门禁；
// GET 落地页与 POST 的 401 分支都不会调用它（merchant 包里的用例证明网关未被触达）。
type merchantLandingGateway struct{}

func (merchantLandingGateway) MerchantBind(context.Context, map[string]any) (map[string]any, error) {
	return nil, errors.New("落地页不该调用网关")
}

func (merchantLandingGateway) MerchantSession(context.Context, map[string]any) (map[string]any, error) {
	return nil, errors.New("空 initData 不该触达网关")
}
