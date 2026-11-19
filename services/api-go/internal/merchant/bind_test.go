// POST /tg-api/merchant/bind 与 POST /tg-api/merchant/session 的测试套件。
//
// 结构与 internal/rider/bind_test.go 同构；替身层同样用「真实 gateway.Call 打
// httptest 假网关」（签名、action 名、响应解析都跑生产代码，非 2xx 的
// *gateway.Error 形态也是真的），不手搓 map 绕过。
//
// 翻译来源：
//   - services/api/src/merchantRoute.js 的 postBind / sendBindError / session
//   - docs/api/openapi.yaml 的 POST /tg-api/merchant/bind 与 /tg-api/merchant/session
package merchant

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/gateway"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/tgauth"
)

const (
	bgBotToken = "test-bot-token-not-a-secret"
	bgRemote   = "1.2.3.4:5678"
	// bgBrowserAccept 是 Telegram WebView 提交表单时的典型 Accept。
	bgBrowserAccept = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
)

// bgValidate 是 initData 验签替身：signed:77 → 有效用户 77；expired → 过期；其余无效。
func bgValidate(initData, _ string) tgauth.Result {
	if initData == "expired" {
		return tgauth.Result{Error: "initData expired"}
	}
	if initData != "signed:77" {
		return tgauth.Result{Error: "Hash mismatch: Potential tampering detected"}
	}
	return tgauth.Result{
		Valid:    true,
		AuthDate: 1700000000,
		User:     &tgauth.User{ID: 77, Raw: json.RawMessage(`{"id":77}`)},
	}
}

// —— 测试替身 ——

// bgCall 是一次网关调用（action + 参数），断言参数形状用。
type bgCall struct {
	Action string
	Params map[string]any
}

// bgReply 是假网关的一次响应；Status 为 0 按 200。
type bgReply struct {
	Status int
	Body   string
}

// bgGateway 用真实 gateway.Call 打 httptest 假网关。
type bgGateway struct{ cfg gateway.Config }

func (g bgGateway) MerchantBind(ctx context.Context, params map[string]any) (map[string]any, error) {
	return gateway.Call(ctx, g.cfg, "merchant_bind", params)
}

func (g bgGateway) MerchantSession(ctx context.Context, params map[string]any) (map[string]any, error) {
	return gateway.Call(ctx, g.cfg, "merchant_session", params)
}

// bgFakeGateway 起假 PHP 网关，按 action 分派脚本并记录每次调用。
func bgFakeGateway(t *testing.T, script func(bgCall) bgReply) (Gateway, *[]bgCall) {
	t.Helper()
	calls := &[]bgCall{}
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		var body struct {
			Action string         `json:"action"`
			Params map[string]any `json:"params"`
		}
		if err := json.NewDecoder(req.Body).Decode(&body); err != nil {
			t.Errorf("网关请求体不是 JSON: %v", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		call := bgCall{Action: body.Action, Params: body.Params}
		*calls = append(*calls, call)
		reply := script(call)
		status := reply.Status
		if status == 0 {
			status = http.StatusOK
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(status)
		_, _ = w.Write([]byte(reply.Body))
	}))
	t.Cleanup(server.Close)
	return bgGateway{cfg: gateway.Config{BaseURL: server.URL, Secret: "gw-secret", Timeout: 2 * time.Second}}, calls
}

// bgCookies 是网关 merchant_session 签出的假 cookie 头（属性由 PHP 定死，这里只透传）。
var bgCookies = []string{
	"HN_login_user=YWJjZGVm; Path=/; Domain=.example.com; HttpOnly",
	"HN_tg=1; Path=/; Domain=.example.com; Max-Age=2592000",
}

// bgOKScript 是默认脚本：merchant_bind 成功、merchant_session 签出 cookie + /wmsj/。
func bgOKScript(call bgCall) bgReply {
	if call.Action == "merchant_bind" {
		return bgReply{Body: `{"success":true,"data":{"member_id":2,"shop_ids":[1,5]}}`}
	}
	return bgReply{Body: `{"success":true,"data":{"member_id":2,"shop_ids":[1,5],"redirect":"/wmsj/","set_cookies":["` +
		strings.ReplaceAll(bgCookies[0], `"`, `\"`) + `","` + strings.ReplaceAll(bgCookies[1], `"`, `\"`) + `"]}}`}
}

// bgBindReply / bgSessionReply 让脚本只关心一个动作，另一个动作保持成功默认值。
func bgBindReply(reply bgReply) func(bgCall) bgReply {
	return func(call bgCall) bgReply {
		if call.Action == "merchant_bind" {
			return reply
		}
		return bgOKScript(call)
	}
}

func bgSessionReply(reply bgReply) func(bgCall) bgReply {
	return func(call bgCall) bgReply {
		if call.Action == "merchant_session" {
			return reply
		}
		return bgOKScript(call)
	}
}

// bgRoute 按「全配置」装配一个 Route；mutate 可逐项拆掉依赖。
func bgRoute(t *testing.T, script func(bgCall) bgReply, mutate func(*Dep)) *Route {
	t.Helper()
	if script == nil {
		script = bgOKScript
	}
	gatewayStub, _ := bgFakeGateway(t, script)
	dep := Dep{
		BotToken:         bgBotToken,
		ValidateInitData: bgValidate,
		Gateway:          gatewayStub,
		Logf:             func(string) {},
	}
	if mutate != nil {
		mutate(&dep)
	}
	return New(dep)
}

// bgRouteCalls 同 bgRoute，但把调用记录也交出来。
func bgRouteCalls(t *testing.T, script func(bgCall) bgReply, mutate func(*Dep)) (*Route, *[]bgCall) {
	t.Helper()
	if script == nil {
		script = bgOKScript
	}
	gatewayStub, calls := bgFakeGateway(t, script)
	dep := Dep{
		BotToken:         bgBotToken,
		ValidateInitData: bgValidate,
		Gateway:          gatewayStub,
		Logf:             func(string) {},
	}
	if mutate != nil {
		mutate(&dep)
	}
	return New(dep), calls
}

// bgForm 表单编码一次 POST /merchant/bind。
func bgForm(initData, phone string) *http.Request {
	form := url.Values{"initData": {initData}, "phone": {phone}}
	request := httptest.NewRequest(http.MethodPost, "/tg-api/merchant/bind", strings.NewReader(form.Encode()))
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	request.Header.Set("Accept", bgBrowserAccept)
	request.RemoteAddr = bgRemote
	return request
}

// bgServe 发一次请求并返回 recorder。
func bgServe(t *testing.T, route *Route, request *http.Request) *httptest.ResponseRecorder {
	t.Helper()
	recorder := httptest.NewRecorder()
	route.PostBind(recorder, request)
	return recorder
}

// bgServeJSON 发一次 JSON POST /merchant/session。
func bgServeJSON(t *testing.T, route *Route, body string) *httptest.ResponseRecorder {
	t.Helper()
	request := httptest.NewRequest(http.MethodPost, "/tg-api/merchant/session", strings.NewReader(body))
	request.Header.Set("Content-Type", "application/json")
	request.RemoteAddr = bgRemote
	recorder := httptest.NewRecorder()
	route.Session(recorder, request)
	return recorder
}

// bgCalls 取某个 action 的调用记录。
func bgCalls(calls *[]bgCall, action string) []bgCall {
	out := make([]bgCall, 0, len(*calls))
	for _, call := range *calls {
		if call.Action == action {
			out = append(out, call)
		}
	}
	return out
}

// bgAssertErrorPage 断言错误页的统一形态（Node 的 sendError：三件安全头 + text/html）。
func bgAssertErrorPage(t *testing.T, label string, recorder *httptest.ResponseRecorder, status int) {
	t.Helper()
	if recorder.Code != status {
		t.Fatalf("%s：状态码应为 %d，实际 %d（body=%s）", label, status, recorder.Code, recorder.Body.String())
	}
	if got := recorder.Header().Get("Content-Type"); got != "text/html; charset=utf-8" {
		t.Fatalf("%s：Content-Type 应为 text/html; charset=utf-8，实际 %q", label, got)
	}
	if got := recorder.Header().Get("Cache-Control"); got != "no-store" {
		t.Fatalf("%s：Cache-Control 应为 no-store，实际 %q", label, got)
	}
	if got := recorder.Header().Get("Referrer-Policy"); got != "no-referrer" {
		t.Fatalf("%s：Referrer-Policy 应为 no-referrer，实际 %q", label, got)
	}
	if got := recorder.Header().Get("X-Content-Type-Options"); got != "nosniff" {
		t.Fatalf("%s：X-Content-Type-Options 应为 nosniff，实际 %q", label, got)
	}
	if location := recorder.Header().Get("Location"); location != "" {
		t.Fatalf("%s：错误分支不得带 Location（会让人以为绑定成功），实际 %q", label, location)
	}
	if got := recorder.Header().Get("Set-Cookie"); got != "" {
		t.Fatalf("%s：错误分支不得下发 Cookie，实际 %q", label, got)
	}
}

// —— 1. notConfigured → 503 ——

func TestMerchantBindNotConfiguredReturns503(t *testing.T) {
	route := bgRoute(t, nil, func(dep *Dep) { dep.Gateway = nil })
	recorder := bgServe(t, route, bgForm("signed:77", "09178889999"))
	bgAssertErrorPage(t, "缺网关", recorder, http.StatusServiceUnavailable)
	body := recorder.Body.String()
	if !strings.Contains(body, "MERCHANT_NOT_CONFIGURED") || !strings.Contains(body, "服务暂未配置，请稍后重试") {
		t.Fatalf("503 错误页文案不符：%s", body)
	}
}

// —— 2. initData / 手机号 → 401 / 400，且不触达网关 ——

func TestMerchantBindInvalidInitDataReturns401(t *testing.T) {
	for _, initData := range []string{"", "forged"} {
		route, calls := bgRouteCalls(t, nil, nil)
		recorder := bgServe(t, route, bgForm(initData, "09178889999"))
		bgAssertErrorPage(t, "initData="+initData, recorder, http.StatusUnauthorized)
		body := recorder.Body.String()
		if !strings.Contains(body, "INVALID_INIT_DATA") || !strings.Contains(body, "请从 Telegram 内重新打开本页面") {
			t.Fatalf("401 文案不符：%s", body)
		}
		if len(*calls) != 0 {
			t.Fatalf("验签失败不得触达网关，实际 %d 次", len(*calls))
		}
	}
}

func TestMerchantBindInvalidPhoneReturns400(t *testing.T) {
	route, calls := bgRouteCalls(t, nil, nil)
	recorder := bgServe(t, route, bgForm("signed:77", "12345"))
	bgAssertErrorPage(t, "手机号非法", recorder, http.StatusBadRequest)
	body := recorder.Body.String()
	if !strings.Contains(body, "INVALID_PHONE") || !strings.Contains(body, "手机号格式不正确") {
		t.Fatalf("400 文案不符：%s", body)
	}
	if len(*calls) != 0 {
		t.Fatalf("归一失败不得触达网关，实际 %d 次", len(*calls))
	}
}

// —— 3. 本地限频 → 429 ——

func TestMerchantBindRateLimitedLocally(t *testing.T) {
	route := bgRoute(t, nil, func(dep *Dep) { dep.Allow = func(string) bool { return false } })
	recorder := bgServe(t, route, bgForm("signed:77", "09178889999"))
	bgAssertErrorPage(t, "本地限频", recorder, http.StatusTooManyRequests)
	if !strings.Contains(recorder.Body.String(), "RATE_LIMITED") {
		t.Fatalf("429 错误页应含 RATE_LIMITED：%s", recorder.Body.String())
	}
}

// —— 4. 网关参数形状 ——

func TestMerchantBindGatewayParams(t *testing.T) {
	route, calls := bgRouteCalls(t, nil, nil)
	recorder := bgServe(t, route, bgForm("signed:77", "+63 (917) 888-9999"))
	if recorder.Code != http.StatusFound {
		t.Fatalf("成功应 302，实际 %d（body=%s）", recorder.Code, recorder.Body.String())
	}
	binds := bgCalls(calls, "merchant_bind")
	if len(binds) != 1 {
		t.Fatalf("merchant_bind 应恰好调一次，实际 %d", len(binds))
	}
	// tg_user_id 是字符串（Node: String(v.user.id)），phone 是归一结果，ip 来自 RemoteAddr。
	if got, _ := binds[0].Params["tg_user_id"].(string); got != "77" {
		t.Fatalf("merchant_bind.tg_user_id 应为字符串 \"77\"，实得 %#v", binds[0].Params["tg_user_id"])
	}
	if got, _ := binds[0].Params["phone"].(string); got != "09178889999" {
		t.Fatalf("merchant_bind.phone 应为归一后的 09178889999，实得 %#v", binds[0].Params["phone"])
	}
	if got, _ := binds[0].Params["ip"].(string); got != "1.2.3.4" {
		t.Fatalf("merchant_bind.ip 应为 1.2.3.4，实得 %#v", binds[0].Params["ip"])
	}
	sessions := bgCalls(calls, "merchant_session")
	if len(sessions) != 1 {
		t.Fatalf("merchant_session 应恰好调一次，实际 %d", len(sessions))
	}
	if got, _ := sessions[0].Params["init_data_hash"].(string); got != sha256Hex("signed:77") {
		t.Fatalf("merchant_session 必须带 initData 的 sha256，实得 %#v", sessions[0].Params["init_data_hash"])
	}
}

// —— 5. 成功：Set-Cookie 透传 + 302 ——

func TestMerchantBindSuccessSetsCookiesAndRedirects(t *testing.T) {
	route := bgRoute(t, nil, nil)
	recorder := bgServe(t, route, bgForm("signed:77", "09178889999"))

	if recorder.Code != http.StatusFound {
		t.Fatalf("成功应 302，实际 %d（body=%s）", recorder.Code, recorder.Body.String())
	}
	if got := recorder.Header().Get("Location"); got != "/wmsj/" {
		t.Fatalf("Location 应为 /wmsj/，实际 %q", got)
	}
	// Cookie 原样透传：不增、不删、不改属性、不重排。
	got := recorder.Header()["Set-Cookie"]
	if len(got) != len(bgCookies) {
		t.Fatalf("Set-Cookie 条数应为 %d，实得 %d：%v", len(bgCookies), len(got), got)
	}
	for index, want := range bgCookies {
		if got[index] != want {
			t.Fatalf("第 %d 条 Cookie 被改写：%q → %q", index+1, want, got[index])
		}
	}
	for header, want := range map[string]string{
		"Cache-Control":          "no-store",
		"Referrer-Policy":        "no-referrer",
		"X-Content-Type-Options": "nosniff",
	} {
		if got := recorder.Header().Get(header); got != want {
			t.Fatalf("302 的 %s 应为 %q，实际 %q", header, want, got)
		}
	}
}

// TestMerchantBindRedirectPassthrough 钉住 redirect 过 SafeRedirect 的两个分支。
func TestMerchantBindRedirectPassthrough(t *testing.T) {
	cases := []struct {
		name     string
		redirect string
		want     string
	}{
		{"站内深路径", "/wmsj/order/waimaiOrder.php", "/wmsj/order/waimaiOrder.php"},
		{"协议相对路径回兜底", "//evil.example.com/x", "/wmsj/"},
		{"绝对 URL 回兜底", "https://evil.example.com/", "/wmsj/"},
		{"缺失回兜底", "", "/wmsj/"},
	}
	for _, item := range cases {
		t.Run(item.name, func(t *testing.T) {
			script := bgSessionReply(bgReply{Body: `{"success":true,"data":{"member_id":2,"redirect":"` +
				strings.ReplaceAll(item.redirect, `"`, `\"`) + `","set_cookies":["a=1"]}}`})
			route := bgRoute(t, script, nil)
			recorder := bgServe(t, route, bgForm("signed:77", "09178889999"))
			if recorder.Code != http.StatusFound {
				t.Fatalf("应 302，实际 %d（body=%s）", recorder.Code, recorder.Body.String())
			}
			if got := recorder.Header().Get("Location"); got != item.want {
				t.Fatalf("Location = %q，want %q", got, item.want)
			}
		})
	}
}

// —— 6. 网关差异化失败 → 错误页 ——

func TestMerchantBindGatewayErrorPages(t *testing.T) {
	cases := []struct {
		name       string
		status     int
		body       string
		wantStatus int
		wantCode   string
		wantText   string
	}{
		{
			name: "TG 已绑别的商家", status: http.StatusConflict,
			body:       `{"success":false,"error":{"code":"TG_ALREADY_BOUND","message":"x"}}`,
			wantStatus: http.StatusConflict, wantCode: "TG_ALREADY_BOUND",
			wantText: "当前 Telegram 已绑定其他商家账号，原绑定保持不变",
		},
		{
			name: "商家已被别的 TG 绑定", status: http.StatusConflict,
			body:       `{"success":false,"error":{"code":"MERCHANT_ALREADY_BOUND","message":"x"}}`,
			wantStatus: http.StatusConflict, wantCode: "MERCHANT_ALREADY_BOUND",
			wantText: "该商家账号已被其他 Telegram 绑定，原绑定保持不变",
		},
		{
			name: "手机号歧义", status: http.StatusConflict,
			body:       `{"success":false,"error":{"code":"MERCHANT_AMBIGUOUS","message":"x"}}`,
			wantStatus: http.StatusConflict, wantCode: "MERCHANT_AMBIGUOUS",
			wantText: "该手机号匹配到多个商家账号，无法自动绑定",
		},
		{
			name: "未知冲突码落兜底文案", status: http.StatusConflict,
			body:       `{"success":false,"error":{"code":"SOMETHING_ELSE","message":"x"}}`,
			wantStatus: http.StatusConflict, wantCode: "SOMETHING_ELSE",
			wantText: "该手机号或当前账号已存在绑定关系，如需换绑请联系运营",
		},
		{
			name: "查不到商家", status: http.StatusNotFound,
			body:       `{"success":false,"error":{"code":"MERCHANT_NOT_FOUND","message":"x"}}`,
			wantStatus: http.StatusNotFound, wantCode: "MERCHANT_NOT_FOUND",
			wantText: "未找到该手机号对应的商家账号",
		},
		{
			name: "无店铺", status: http.StatusNotFound,
			body:       `{"success":false,"error":{"code":"MERCHANT_NO_SHOP","message":"x"}}`,
			wantStatus: http.StatusNotFound, wantCode: "MERCHANT_NO_SHOP",
			wantText: "还没有被分配外卖店铺",
		},
		{
			name: "会员停用", status: http.StatusForbidden,
			body:       `{"success":false,"error":{"code":"MEMBER_DISABLED","message":"x"}}`,
			wantStatus: http.StatusForbidden, wantCode: "MEMBER_DISABLED",
			wantText: "该商家账号当前不可用",
		},
		{
			name: "网关限频", status: http.StatusTooManyRequests,
			body:       `{"success":false,"error":{"code":"BIND_RATE_LIMITED","message":"x"}}`,
			wantStatus: http.StatusTooManyRequests, wantCode: "BIND_RATE_LIMITED",
			wantText: "操作过于频繁，请稍后再试",
		},
		{
			name: "审计不可用 fail-closed", status: http.StatusServiceUnavailable,
			body:       `{"success":false,"error":{"code":"AUDIT_UNAVAILABLE","message":"x"}}`,
			wantStatus: http.StatusServiceUnavailable, wantCode: "AUDIT_UNAVAILABLE",
			wantText: "服务暂时不可用，请稍后重试",
		},
	}
	for _, item := range cases {
		t.Run(item.name, func(t *testing.T) {
			route := bgRoute(t, bgBindReply(bgReply{Status: item.status, Body: item.body}), nil)
			recorder := bgServe(t, route, bgForm("signed:77", "09178889999"))
			bgAssertErrorPage(t, item.name, recorder, item.wantStatus)
			body := recorder.Body.String()
			if !strings.Contains(body, item.wantCode) || !strings.Contains(body, item.wantText) {
				t.Fatalf("错误页应含 %q 与 %q，实际 %s", item.wantCode, item.wantText, body)
			}
		})
	}
}

// TestMerchantBindFallback502OnTransportError 钉住「超时/网络/坏 JSON 一律 502 兜底」。
func TestMerchantBindFallback502OnTransportError(t *testing.T) {
	route, calls := bgRouteCalls(t, nil, func(dep *Dep) {
		// 把网关指到一个立刻关闭的端口上（BaseURL 无效）。
		dep.Gateway = bgGateway{cfg: gateway.Config{BaseURL: "http://127.0.0.1:1", Secret: "k", Timeout: 500 * time.Millisecond}}
	})
	recorder := bgServe(t, route, bgForm("signed:77", "09178889999"))
	bgAssertErrorPage(t, "传输失败", recorder, http.StatusBadGateway)
	if !strings.Contains(recorder.Body.String(), "MERCHANT_FAILED") {
		t.Fatalf("502 错误页应含 MERCHANT_FAILED：%s", recorder.Body.String())
	}
	if len(*calls) != 0 {
		t.Fatal("假网关不该被记录到调用（这条用例根本没打假网关）")
	}
}

// TestMerchantBindInvalid2xxPayload 钉住「2xx 但形状不对绝不静默成功」。
func TestMerchantBindInvalid2xxPayload(t *testing.T) {
	for _, body := range []string{
		`{"success":false,"data":{"member_id":2}}`,
		`{"success":true,"data":{"member_id":0}}`,
		`{"success":true,"data":{"member_id":9.5}}`,
		`{"success":true,"data":{}}`,
	} {
		route := bgRoute(t, bgBindReply(bgReply{Body: body}), nil)
		recorder := bgServe(t, route, bgForm("signed:77", "09178889999"))
		bgAssertErrorPage(t, body, recorder, http.StatusBadGateway)
		if !strings.Contains(recorder.Body.String(), "MERCHANT_FAILED") {
			t.Fatalf("应含 MERCHANT_FAILED：%s", recorder.Body.String())
		}
	}
}

// —— 7. 绑定成功后会话失败 → MERCHANT_SESSION_FAILED（G-8）——

func TestMerchantBindSessionFailureAfterBind(t *testing.T) {
	route, calls := bgRouteCalls(t, bgSessionReply(bgReply{
		Status: http.StatusInternalServerError,
		Body:   `{"success":false,"error":{"code":"INTERNAL_ERROR","message":"x"}}`,
	}), nil)
	recorder := bgServe(t, route, bgForm("signed:77", "09178889999"))
	bgAssertErrorPage(t, "会话失败", recorder, http.StatusBadGateway)
	body := recorder.Body.String()
	if !strings.Contains(body, "MERCHANT_SESSION_FAILED") {
		t.Fatalf("错误页应含 MERCHANT_SESSION_FAILED：%s", body)
	}
	// 文案必须是「绑定已生效」：报「绑定失败」会诱导换号重绑 → 撞 TG_ALREADY_BOUND。
	if !strings.Contains(body, "绑定已生效") {
		t.Fatalf("文案必须是「绑定已生效…」：%s", body)
	}
	// 绑定确实发生过（幂等重试是安全的，但文案不能撒谎）。
	if got := len(bgCalls(calls, "merchant_bind")); got != 1 {
		t.Fatalf("merchant_bind 应已调用 1 次，实际 %d", got)
	}
}

// TestMerchantBindSessionInvalidPayloadAfterBind 同上，但失败形态是 2xx 坏载荷。
func TestMerchantBindSessionInvalidPayloadAfterBind(t *testing.T) {
	for _, body := range []string{
		`{"success":true,"data":{"member_id":2}}`,
		`{"success":true,"data":{"member_id":2,"set_cookies":[]}}`,
		`{"success":true,"data":{"member_id":2,"set_cookies":[42]}}`,
	} {
		route := bgRoute(t, bgSessionReply(bgReply{Body: body}), nil)
		recorder := bgServe(t, route, bgForm("signed:77", "09178889999"))
		bgAssertErrorPage(t, body, recorder, http.StatusBadGateway)
		if !strings.Contains(recorder.Body.String(), "MERCHANT_SESSION_FAILED") {
			t.Fatalf("应含 MERCHANT_SESSION_FAILED：%s", recorder.Body.String())
		}
	}
}

// —— 8. POST /merchant/session ——

func TestMerchantSessionBound(t *testing.T) {
	route, calls := bgRouteCalls(t, nil, nil)
	recorder := bgServeJSON(t, route, `{"initData":"signed:77"}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("已绑定应 200，实际 %d（body=%s）", recorder.Code, recorder.Body.String())
	}
	// Set-Cookie 原样透传（Node: res.setHeader('Set-Cookie', ...)）。
	got := recorder.Header()["Set-Cookie"]
	if len(got) != len(bgCookies) {
		t.Fatalf("Set-Cookie 条数应为 %d，实得 %d：%v", len(bgCookies), len(got), got)
	}
	for index, want := range bgCookies {
		if got[index] != want {
			t.Fatalf("第 %d 条 Cookie 被改写：%q → %q", index+1, want, got[index])
		}
	}
	if got := recorder.Header().Get("Cache-Control"); got != "no-store" {
		t.Fatalf("Cache-Control 应为 no-store，实际 %q", got)
	}
	want := `{"success":true,"data":{"bound":true,"member_id":2,"shop_ids":[1,5],"redirect":"/wmsj/"}}`
	if got := recorder.Body.String(); got != want {
		t.Fatalf("响应体不符\n got=%s\nwant=%s", got, want)
	}
	sessions := bgCalls(calls, "merchant_session")
	if len(sessions) != 1 {
		t.Fatalf("merchant_session 应恰好调一次，实际 %d", len(sessions))
	}
	if got, _ := sessions[0].Params["init_data_hash"].(string); got != sha256Hex("signed:77") {
		t.Fatalf("merchant_session 必须带 initData 的 sha256，实得 %#v", sessions[0].Params["init_data_hash"])
	}
}

func TestMerchantSessionNotBoundIsNotAnError(t *testing.T) {
	route := bgRoute(t, bgSessionReply(bgReply{
		Status: http.StatusNotFound,
		Body:   `{"success":false,"error":{"code":"MERCHANT_NOT_BOUND","message":"x"}}`,
	}), nil)
	recorder := bgServeJSON(t, route, `{"initData":"signed:77"}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("未绑定应 200 {bound:false}，实际 %d（body=%s）", recorder.Code, recorder.Body.String())
	}
	want := `{"success":true,"data":{"bound":false}}`
	if got := recorder.Body.String(); got != want {
		t.Fatalf("响应体不符\n got=%s\nwant=%s", got, want)
	}
	if got := recorder.Header().Get("Set-Cookie"); got != "" {
		t.Fatalf("未绑定不得下发 Cookie，实际 %q", got)
	}
}

func TestMerchantSessionNoShopIs403(t *testing.T) {
	route := bgRoute(t, bgSessionReply(bgReply{
		Status: http.StatusNotFound,
		Body:   `{"success":false,"error":{"code":"MERCHANT_NO_SHOP","message":"x"}}`,
	}), nil)
	recorder := bgServeJSON(t, route, `{"initData":"signed:77"}`)
	if recorder.Code != http.StatusForbidden {
		t.Fatalf("无店铺应 403，实际 %d（body=%s）", recorder.Code, recorder.Body.String())
	}
	if !strings.Contains(recorder.Body.String(), "MERCHANT_NO_SHOP") {
		t.Fatalf("应含 MERCHANT_NO_SHOP：%s", recorder.Body.String())
	}
}

func TestMerchantSessionInvalidInitData(t *testing.T) {
	for _, body := range []string{`{}`, `{"initData":"forged"}`} {
		route := bgRoute(t, nil, nil)
		recorder := bgServeJSON(t, route, body)
		if recorder.Code != http.StatusUnauthorized {
			t.Fatalf("%s 应 401，实际 %d", body, recorder.Code)
		}
		if !strings.Contains(recorder.Body.String(), "INVALID_INIT_DATA") {
			t.Fatalf("应含 INVALID_INIT_DATA：%s", recorder.Body.String())
		}
	}
}

func TestMerchantSessionFallback502(t *testing.T) {
	route := bgRoute(t, bgSessionReply(bgReply{
		Status: http.StatusInternalServerError,
		Body:   `{"success":false,"error":{"code":"INTERNAL_ERROR","message":"x"}}`,
	}), nil)
	recorder := bgServeJSON(t, route, `{"initData":"signed:77"}`)
	if recorder.Code != http.StatusBadGateway {
		t.Fatalf("其余网关失败应 502，实际 %d（body=%s）", recorder.Code, recorder.Body.String())
	}
	if !strings.Contains(recorder.Body.String(), "MERCHANT_FAILED") {
		t.Fatalf("应含 MERCHANT_FAILED：%s", recorder.Body.String())
	}
}
