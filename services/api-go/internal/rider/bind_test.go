// POST /tg-api/rider/bind 的测试套件。
//
// 翻译来源（逐条对应写在每个 Test 的注释里）：
//   - services/api/test/rider-route.test.js 全部 bind 用例（153-411、436-586 行）
//   - services/api/src/riderRoute.js 的 postBind（199-241）、sendBindError（176-197）、
//     CONFLICT_MESSAGES（106-109）
//   - docs/api/openapi.yaml 的 POST /tg-api/rider/bind（状态码与响应体）
//   - 302 的响应形态：本机起真 express + 真 riderRoute.js 抓的原始响应（见实现报告
//     REDIRECT 一节的完整抓包记录），断言里的 72 / 65 字节与 Content-Type 都来自实测
//
// 与 Node 用例的差异只在替身层：Node 用 makeRes/makeGateway，Go 侧用
// httptest.ResponseRecorder + 一个**真实走 gateway.Call** 的假 PHP 网关
// （签名、action 名、响应解析都跑生产代码，非 2xx 的 *gateway.Error 形态也是真的）。
package rider

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/gateway"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/token"
)

const (
	// bdBotToken 与 rider_test.go 的 rwBotToken 同值：两者共用 rwValidate 替身。
	bdBotToken = "test-bot-token-not-a-secret"
	// bdWorkbench 与 Node 用例的 WORKBENCH_URL 逐字一致，也是实测 302 时用的那个 URL
	// （长度 43 → HTML body 72 字节 / 纯文本 body 65 字节）。
	bdWorkbench = "https://canary.fbird.men/ql.html?token=FAKE"
	// bdRemote 是默认的客户端地址（Node 用例里 makeReq 的 ip 是 1.2.3.4）。
	bdRemote = "1.2.3.4:5678"
	// bdBrowserAccept 是 Telegram WebView 提交表单时的典型 Accept。
	bdBrowserAccept = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"

	// 实测到的错误页字节数（真 Node 进程的 Content-Length）。
	// 它们同时校验模板与文案：文案里多一个全角句号就会差 3 个字节。
	bdNodeLen503NotConfigured = 854
	bdNodeLen409CourierBound  = 947
	bdNodeLen502Workbench     = 901
)

// —— 测试替身 ——

// bdCall 是一次网关调用（action + 参数），断言参数形状用。
type bdCall struct {
	Action string
	Params map[string]any
}

// bdReply 是假网关的一次响应；Status 为 0 按 200。
type bdReply struct {
	Status int
	Body   string
}

// bdGateway 用真实 gateway.Call 打 httptest 假网关。
type bdGateway struct{ cfg gateway.Config }

func (g bdGateway) RiderBind(ctx context.Context, params map[string]any) (map[string]any, error) {
	return gateway.Call(ctx, g.cfg, "rider_bind", params)
}

func (g bdGateway) RiderQL(ctx context.Context, params map[string]any) (map[string]any, error) {
	return gateway.Call(ctx, g.cfg, "rider_ql", params)
}

// bdFakeGateway 起假 PHP 网关，按 action 分派脚本并记录每次调用。
func bdFakeGateway(t *testing.T, script func(bdCall) bdReply) (Gateway, *[]bdCall) {
	t.Helper()
	calls := &[]bdCall{}
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
		call := bdCall{Action: body.Action, Params: body.Params}
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
	return bdGateway{cfg: gateway.Config{BaseURL: server.URL, Secret: "gw-secret", Timeout: 2 * time.Second}}, calls
}

// bdOKScript 是默认脚本：rider_bind 成功、rider_ql 签出白名单内的 URL。
func bdOKScript(call bdCall) bdReply {
	if call.Action == "rider_bind" {
		return bdReply{Body: `{"success":true,"data":{"courier_id":9}}`}
	}
	return bdReply{Body: `{"success":true,"data":{"courier_id":9,"url":"` + bdWorkbench + `"}}`}
}

// bdBindReply / bdQLReply 让脚本只关心一个动作，另一个动作保持成功默认值。
func bdBindReply(reply bdReply) func(bdCall) bdReply {
	return func(call bdCall) bdReply {
		if call.Action == "rider_bind" {
			return reply
		}
		return bdOKScript(call)
	}
}

func bdQLReply(reply bdReply) func(bdCall) bdReply {
	return func(call bdCall) bdReply {
		if call.Action == "rider_ql" {
			return reply
		}
		return bdOKScript(call)
	}
}

// bdRoute 按「全配置」装配一个 Route；mutate 可逐项拆掉依赖。
// 不注入 DB：绑定链路不查库（绑定写入只发生在 PHP 网关），nil 只影响 session。
func bdRoute(t *testing.T, script func(bdCall) bdReply, mutate func(*Dep)) (*Route, *[]bdCall) {
	t.Helper()
	if script == nil {
		script = bdOKScript
	}
	gatewayStub, calls := bdFakeGateway(t, script)
	dep := Dep{
		BotToken:         bdBotToken,
		ValidateInitData: rwValidate,
		Gateway:          gatewayStub,
		AllowedHosts:     []string{"canary.fbird.men"},
		Logf:             rwSilentLogfn,
	}
	if mutate != nil {
		mutate(&dep)
	}
	return New(dep), calls
}

// bdPost 发一次表单 POST；headers 覆盖默认值（例如把 Accept 置空）。
func bdPost(t *testing.T, route *Route, initData, phone string, headers map[string]string) *httptest.ResponseRecorder {
	t.Helper()
	form := url.Values{"initData": {initData}, "phone": {phone}}
	request := httptest.NewRequest(http.MethodPost, "/tg-api/rider/bind", strings.NewReader(form.Encode()))
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	request.Header.Set("Accept", bdBrowserAccept)
	for key, value := range headers {
		request.Header.Set(key, value)
	}
	request.RemoteAddr = bdRemote
	recorder := httptest.NewRecorder()
	route.PostBind(recorder, request)
	return recorder
}

// bdPostOK 是「合法 initData + 合法手机号」的常规请求。
func bdPostOK(t *testing.T, route *Route) *httptest.ResponseRecorder {
	t.Helper()
	return bdPost(t, route, "signed:77", "0912345678", nil)
}

// bdCalls 取某个 action 的调用记录。
func bdCalls(calls *[]bdCall, action string) []bdCall {
	out := make([]bdCall, 0, len(*calls))
	for _, call := range *calls {
		if call.Action == action {
			out = append(out, call)
		}
	}
	return out
}

// bdAssertErrorPage 断言错误页的统一形态（Node 的 sendError：三件安全头 + text/html）。
func bdAssertErrorPage(t *testing.T, label string, recorder *httptest.ResponseRecorder, status int) {
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
}

// —— 1. notConfigured → 503（行为清单第 1 条；Node 用例第 350-360 行）——

func TestBindNotConfiguredReturns503(t *testing.T) {
	cases := map[string]func(*Dep){
		"缺 botToken": func(dep *Dep) { dep.BotToken = "" },
		"缺网关":        func(dep *Dep) { dep.Gateway = nil },
	}
	for name, mutate := range cases {
		t.Run(name, func(t *testing.T) {
			route, calls := bdRoute(t, nil, mutate)
			recorder := bdPostOK(t, route)
			bdAssertErrorPage(t, name, recorder, http.StatusServiceUnavailable)
			body := recorder.Body.String()
			if !strings.Contains(body, "RIDER_NOT_CONFIGURED") {
				t.Fatalf("错误页应含 RIDER_NOT_CONFIGURED，实际 %s", body)
			}
			// 503 文案与 Node getLanding 第一行完全相同（riderRoute.js:159）。
			if !strings.Contains(body, "服务暂未配置，请稍后重试") {
				t.Fatalf("503 文案不符：%s", body)
			}
			// 字节数与真 Node 进程的 Content-Length 一致（实测 854）。
			if got := recorder.Body.Len(); got != bdNodeLen503NotConfigured {
				t.Fatalf("503 错误页应 %d 字节（Node 实测 Content-Length），实际 %d", bdNodeLen503NotConfigured, got)
			}
			if len(*calls) != 0 {
				t.Fatalf("未配置不该触达网关，实际 %d 次", len(*calls))
			}
		})
	}
}

// —— 2. initData 缺失/伪造/过期 → 401，且不触达网关 ——

// TestBindInvalidInitDataReturns401 对应 Node「缺失或伪造 initData → 401」。
func TestBindInvalidInitDataReturns401(t *testing.T) {
	for _, initData := range []string{"", "auth_date=1&hash=deadbeef", "forged"} {
		route, calls := bdRoute(t, nil, nil)
		recorder := bdPost(t, route, initData, "0912345678", nil)
		bdAssertErrorPage(t, "initData="+initData, recorder, http.StatusUnauthorized)
		body := recorder.Body.String()
		if !strings.Contains(body, "INVALID_INIT_DATA") {
			t.Fatalf("错误页应含 INVALID_INIT_DATA，实际 %s", body)
		}
		if !strings.Contains(body, "请从 Telegram 内重新打开本页面") {
			t.Fatalf("401 文案不符：%s", body)
		}
		if len(*calls) != 0 {
			t.Fatalf("验签失败不得触达网关，实际 %d 次", len(*calls))
		}
	}
}

// TestBindInitDataOnlyFromBody 钉住 m5：initData 是短期凭证，不接受 query 传参。
func TestBindInitDataOnlyFromBody(t *testing.T) {
	route, calls := bdRoute(t, nil, nil)
	form := url.Values{"phone": {"0912345678"}} // body 里没有 initData
	request := httptest.NewRequest(http.MethodPost,
		"/tg-api/rider/bind?initData="+url.QueryEscape("signed:77"), strings.NewReader(form.Encode()))
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	request.RemoteAddr = bdRemote
	recorder := httptest.NewRecorder()
	route.PostBind(recorder, request)

	bdAssertErrorPage(t, "query 传 initData", recorder, http.StatusUnauthorized)
	if len(*calls) != 0 {
		t.Fatalf("query 里的 initData 不该被采信，实际触达网关 %d 次", len(*calls))
	}
}

// TestBindExpiredInitDataReturns401 对应 Node「initData 过期（auth_date 超过 1 小时）→ 401」。
// 这条**不注入** ValidateInitData，走 tgauth.Validate 的真实 HMAC + 时效校验。
func TestBindExpiredInitDataReturns401(t *testing.T) {
	route, calls := bdRoute(t, nil, func(dep *Dep) { dep.ValidateInitData = nil })

	stale := rwSignInitData(t, 77, bdBotToken, time.Now().Add(-3601*time.Second))
	recorder := bdPost(t, route, stale, "0912345678", nil)
	bdAssertErrorPage(t, "过期 initData", recorder, http.StatusUnauthorized)
	if len(*calls) != 0 {
		t.Fatalf("过期 initData 不得触达网关，实际 %d 次", len(*calls))
	}

	// 对照组：同一套真实验签，新鲜的 initData 必须走通整条链路 → 302。
	fresh := rwSignInitData(t, 77, bdBotToken, time.Now())
	if code := bdPost(t, route, fresh, "0912345678", nil).Code; code != http.StatusFound {
		t.Fatalf("新鲜 initData 应 302，实际 %d", code)
	}
}

// —— 3. 手机号非法 → 400，且不触达网关 ——

func TestBindInvalidPhoneReturns400(t *testing.T) {
	for _, phone := range []string{"", "0912'; DROP TABLE x", "abc", "1"} {
		route, calls := bdRoute(t, nil, nil)
		recorder := bdPost(t, route, "signed:77", phone, nil)
		bdAssertErrorPage(t, "phone="+phone, recorder, http.StatusBadRequest)
		body := recorder.Body.String()
		if !strings.Contains(body, "INVALID_PHONE") {
			t.Fatalf("错误页应含 INVALID_PHONE，实际 %s", body)
		}
		// 400 文案要告诉用户能输什么（M4）。
		if !strings.Contains(body, "09171234567") || !strings.Contains(body, "+639171234567") {
			t.Fatalf("400 文案要给出可接受写法，实际 %s", body)
		}
		if len(*calls) != 0 {
			t.Fatalf("手机号非法不得触达网关，实际 %d 次", len(*calls))
		}
	}
}

// —— 4. 成功路径 → 302（Node 用例第 182-192 行）——

func TestBindSuccessRedirectsToWorkbench(t *testing.T) {
	route, calls := bdRoute(t, nil, nil)
	recorder := bdPostOK(t, route)

	if recorder.Code != http.StatusFound {
		t.Fatalf("成功应 302，实际 %d（body=%s）", recorder.Code, recorder.Body.String())
	}
	if got := recorder.Header().Get("Location"); got != bdWorkbench {
		t.Fatalf("Location 应为 %q，实际 %q", bdWorkbench, got)
	}
	if got := recorder.Header().Get("Cache-Control"); got != "no-store" {
		t.Fatalf("302 必须 no-store（Location 里带一次性 token），实际 %q", got)
	}

	binds := bdCalls(calls, "rider_bind")
	if len(binds) != 1 {
		t.Fatalf("rider_bind 应调用 1 次，实际 %d 次", len(binds))
	}
	// 参数形状逐字对齐 Node：tg_user_id 是**字符串**、phone 已归一、ip 来自 req.ip。
	wantParams := map[string]any{"tg_user_id": "77", "phone": "0912345678", "ip": "1.2.3.4"}
	for key, want := range wantParams {
		if got := binds[0].Params[key]; got != want {
			t.Fatalf("rider_bind 参数 %s 应为 %#v，实际 %#v（全部：%v）", key, want, got, binds[0].Params)
		}
	}
	if len(binds[0].Params) != len(wantParams) {
		t.Fatalf("rider_bind 参数不应有多余字段，实际 %v", binds[0].Params)
	}

	qlCalls := bdCalls(calls, "rider_ql")
	if len(qlCalls) != 1 {
		t.Fatalf("rider_ql 应调用 1 次，实际 %d 次", len(qlCalls))
	}
	if got, ok := gateway.Int(qlCalls[0].Params, "courier_id"); !ok || got != 9 {
		t.Fatalf("rider_ql 参数 courier_id 应为 9，实际 %v", qlCalls[0].Params)
	}
}

// TestBindNormalizesPhoneBeforeGateway 对应 Node「+63 写法在进网关前已归一（M4 端到端）」。
func TestBindNormalizesPhoneBeforeGateway(t *testing.T) {
	cases := map[string]string{
		"+63 917 123 4567": "09171234567",
		"+639171234567":    "09171234567",
		"63-917-123-4567":  "09171234567",
		"(0917) 123 4567":  "09171234567",
		"  09171234567  ":  "09171234567",
	}
	for input, want := range cases {
		route, calls := bdRoute(t, nil, nil)
		recorder := bdPost(t, route, "signed:77", input, nil)
		if recorder.Code != http.StatusFound {
			t.Fatalf("phone=%q 应 302，实际 %d（body=%s）", input, recorder.Code, recorder.Body.String())
		}
		binds := bdCalls(calls, "rider_bind")
		if len(binds) != 1 || binds[0].Params["phone"] != want {
			t.Fatalf("phone=%q 进网关前应归一为 %q，实际 %v", input, want, binds)
		}
	}
}

// —— 5. 冲突 409：绝不静默顶替（B1）——

func TestBindConflictReturns409(t *testing.T) {
	cases := map[string]string{
		"COURIER_ALREADY_BOUND": "该骑手账号已被其他 Telegram 绑定。如这是你的账号，请先在原 Telegram 内打开工作台解绑后再试。",
		"TG_ALREADY_BOUND":      "当前 Telegram 已绑定其他骑手账号。请先在该工作台内解绑，再绑定新的手机号。",
	}
	for code, message := range cases {
		t.Run(code, func(t *testing.T) {
			route, calls := bdRoute(t, bdBindReply(bdReply{
				Status: http.StatusConflict,
				Body:   `{"success":false,"error":{"code":"` + code + `","message":"conflict"}}`,
			}), nil)
			recorder := bdPostOK(t, route)

			bdAssertErrorPage(t, code, recorder, http.StatusConflict)
			body := recorder.Body.String()
			if !strings.Contains(body, code) {
				t.Fatalf("错误页应透出网关的冲突码 %s，实际 %s", code, body)
			}
			if !strings.Contains(body, message) {
				t.Fatalf("%s 的文案不符：%s", code, body)
			}
			// 冲突文案必须给用户可执行动作（自解绑），而不是「联系管理员」。
			if !strings.Contains(body, "解绑") {
				t.Fatalf("%s 文案要引导用户自己解绑：%s", code, body)
			}
			// 冲突时不得签工作台令牌（否则等于给了别人账号的入口）。
			if len(bdCalls(calls, "rider_ql")) != 0 {
				t.Fatal("冲突时不得调用 rider_ql")
			}
			if code == "COURIER_ALREADY_BOUND" {
				// 字节数与真 Node 进程的 Content-Length 一致（实测 947）。
				if got := recorder.Body.Len(); got != bdNodeLen409CourierBound {
					t.Fatalf("409 错误页应 %d 字节（Node 实测 Content-Length），实际 %d",
						bdNodeLen409CourierBound, got)
				}
			}
		})
	}
}

// TestBindConflictCopyAvoidsBlameShifting 对应 Node「冲突/失败文案一律不给联系管理员这类甩锅动作」。
func TestBindConflictCopyAvoidsBlameShifting(t *testing.T) {
	cases := []struct {
		label string
		reply bdReply
	}{
		{"COURIER_ALREADY_BOUND", bdReply{Status: 409, Body: `{"success":false,"error":{"code":"COURIER_ALREADY_BOUND"}}`}},
		{"TG_ALREADY_BOUND", bdReply{Status: 409, Body: `{"success":false,"error":{"code":"TG_ALREADY_BOUND"}}`}},
		{"BIND_RATE_LIMITED", bdReply{Status: 429, Body: `{"success":false,"error":{"code":"BIND_RATE_LIMITED"}}`}},
		{"COURIER_NOT_FOUND", bdReply{Status: 404, Body: `{"success":false,"error":{"code":"COURIER_NOT_FOUND","message":"courier not found or unavailable"}}`}},
	}
	for _, item := range cases {
		t.Run(item.label, func(t *testing.T) {
			route, _ := bdRoute(t, bdBindReply(item.reply), nil)
			recorder := bdPostOK(t, route)
			if recorder.Code < 400 {
				t.Fatalf("%s 应 >= 400，实际 %d", item.label, recorder.Code)
			}
			body := recorder.Body.String()
			for _, forbidden := range []string{"联系管理员", "联系站点运营"} {
				if strings.Contains(body, forbidden) {
					t.Fatalf("%s 文案不得出现 %q：%s", item.label, forbidden, body)
				}
			}
		})
	}
}

// TestBindConflictFallsBackWhenCodeMissing 对应 Node「网关未给已知 code 也要 409 兜底，不静默成功」。
func TestBindConflictFallsBackWhenCodeMissing(t *testing.T) {
	cases := map[string]string{
		"完全没给 error 字段":  `{"success":false}`,
		"error 里没有 code": `{"success":false,"error":{"message":"conflict"}}`,
		"code 是空串":       `{"success":false,"error":{"code":""}}`,
	}
	for name, body := range cases {
		t.Run(name, func(t *testing.T) {
			route, calls := bdRoute(t, bdBindReply(bdReply{Status: http.StatusConflict, Body: body}), nil)
			recorder := bdPostOK(t, route)
			bdAssertErrorPage(t, name, recorder, http.StatusConflict)
			page := recorder.Body.String()
			if !strings.Contains(page, "BIND_CONFLICT") {
				t.Fatalf("缺码时应落兜底码 BIND_CONFLICT，实际 %s", page)
			}
			if !strings.Contains(page, "该手机号或当前账号已存在绑定关系，请先解绑后再试。") {
				t.Fatalf("兜底文案不符：%s", page)
			}
			if len(bdCalls(calls, "rider_ql")) != 0 {
				t.Fatal("兜底 409 同样不得签工作台令牌")
			}
		})
	}
}

// TestBindConflictUnknownCodeUsesFallbackMessage 覆盖「网关给了未知 code」：
// 码原样透出（前端按码分支），文案落兜底（Node: CONFLICT_MESSAGES[code] || 兜底）。
func TestBindConflictUnknownCodeUsesFallbackMessage(t *testing.T) {
	route, _ := bdRoute(t, bdBindReply(bdReply{
		Status: http.StatusConflict,
		Body:   `{"success":false,"error":{"code":"SOME_NEW_CONFLICT"}}`,
	}), nil)
	recorder := bdPostOK(t, route)
	bdAssertErrorPage(t, "未知冲突码", recorder, http.StatusConflict)
	page := recorder.Body.String()
	if !strings.Contains(page, "SOME_NEW_CONFLICT") {
		t.Fatalf("未知冲突码应原样透出，实际 %s", page)
	}
	if !strings.Contains(page, "该手机号或当前账号已存在绑定关系，请先解绑后再试。") {
		t.Fatalf("未知冲突码应落兜底文案，实际 %s", page)
	}
}

// —— 6. 网关 429 / 404 / 503 ——

// TestBindGatewayRateLimited429 对应 Node「网关 429（双维度限频）→ 429 BIND_RATE_LIMITED」。
func TestBindGatewayRateLimited429(t *testing.T) {
	route, calls := bdRoute(t, bdBindReply(bdReply{
		Status: http.StatusTooManyRequests,
		Body:   `{"success":false,"error":{"code":"BIND_RATE_LIMITED"}}`,
	}), nil)
	recorder := bdPostOK(t, route)

	bdAssertErrorPage(t, "网关 429", recorder, http.StatusTooManyRequests)
	page := recorder.Body.String()
	if !strings.Contains(page, "BIND_RATE_LIMITED") {
		t.Fatalf("网关 429 的码应固定为 BIND_RATE_LIMITED，实际 %s", page)
	}
	if !strings.Contains(page, "操作过于频繁，请稍后再试") {
		t.Fatalf("429 文案不符：%s", page)
	}
	if len(bdCalls(calls, "rider_ql")) != 0 {
		t.Fatal("限频时不得签工作台令牌")
	}
}

// TestBindCourierNotFound404 对应 Node「手机号未匹配骑手 → 404 COURIER_NOT_FOUND」。
func TestBindCourierNotFound404(t *testing.T) {
	route, calls := bdRoute(t, bdBindReply(bdReply{
		Status: http.StatusNotFound,
		Body:   `{"success":false,"error":{"code":"COURIER_NOT_FOUND","message":"courier not found or unavailable"}}`,
	}), nil)
	recorder := bdPostOK(t, route)

	bdAssertErrorPage(t, "网关 404", recorder, http.StatusNotFound)
	page := recorder.Body.String()
	if !strings.Contains(page, "COURIER_NOT_FOUND") {
		t.Fatalf("错误页应含 COURIER_NOT_FOUND，实际 %s", page)
	}
	if !strings.Contains(page, "未找到该手机号对应的骑手账号") {
		t.Fatalf("404 文案不符：%s", page)
	}
	if len(bdCalls(calls, "rider_ql")) != 0 {
		t.Fatal("未匹配骑手时不得签工作台令牌")
	}
}

// TestBindAuditUnavailable503 覆盖网关 503 的两种形态：
// 给了码就原样透出（保持信号不稀释），没给码落 AUDIT_UNAVAILABLE。
func TestBindAuditUnavailable503(t *testing.T) {
	cases := map[string]struct {
		body string
		code string
	}{
		"网关给了 AUDIT_UNAVAILABLE": {
			body: `{"success":false,"error":{"code":"AUDIT_UNAVAILABLE"}}`,
			code: "AUDIT_UNAVAILABLE",
		},
		"网关没给码": {
			body: `{"success":false}`,
			code: "AUDIT_UNAVAILABLE",
		},
		"网关给了别的码": {
			body: `{"success":false,"error":{"code":"AUDIT_DB_DOWN"}}`,
			code: "AUDIT_DB_DOWN",
		},
	}
	for name, item := range cases {
		t.Run(name, func(t *testing.T) {
			route, _ := bdRoute(t, bdBindReply(bdReply{Status: http.StatusServiceUnavailable, Body: item.body}), nil)
			recorder := bdPostOK(t, route)
			bdAssertErrorPage(t, name, recorder, http.StatusServiceUnavailable)
			page := recorder.Body.String()
			if !strings.Contains(page, item.code) {
				t.Fatalf("应透出码 %s，实际 %s", item.code, page)
			}
			if !strings.Contains(page, "服务暂时不可用，请稍后重试") {
				t.Fatalf("503 文案不符：%s", page)
			}
		})
	}
}

// —— 7. 其余网关失败 → 502 RIDER_FAILED ——

func TestBindOtherGatewayFailuresAre502(t *testing.T) {
	cases := map[string]bdReply{
		"网关 500":    {Status: http.StatusInternalServerError, Body: `{"success":false,"error":{"code":"DB_UNAVAILABLE"}}`},
		"网关 400":    {Status: http.StatusBadRequest, Body: `{"success":false,"error":{"code":"BAD_REQUEST"}}`},
		"非 JSON":    {Body: `<html>front controller</html>`},
		"空响应体":      {Body: ``},
		"2xx 但不是对象": {Body: `[1,2,3]`},
	}
	for name, reply := range cases {
		t.Run(name, func(t *testing.T) {
			route, _ := bdRoute(t, bdBindReply(reply), nil)
			recorder := bdPostOK(t, route)
			bdAssertErrorPage(t, name, recorder, http.StatusBadGateway)
			page := recorder.Body.String()
			if !strings.Contains(page, "RIDER_FAILED") {
				t.Fatalf("应落 RIDER_FAILED，实际 %s", page)
			}
			if !strings.Contains(page, "服务暂时不可用，请稍后重试") {
				t.Fatalf("502 文案不符：%s", page)
			}
		})
	}
}

// TestBindTransportErrorIs502 对应 Node 的 fake gateway 直接抛 Error。
func TestBindTransportErrorIs502(t *testing.T) {
	route := New(Dep{
		BotToken:         bdBotToken,
		ValidateInitData: rwValidate,
		Gateway:          bdBrokenGateway{},
		AllowedHosts:     []string{"canary.fbird.men"},
		Logf:             rwSilentLogfn,
	})
	recorder := bdPostOK(t, route)
	bdAssertErrorPage(t, "网关抛错", recorder, http.StatusBadGateway)
	if !strings.Contains(recorder.Body.String(), "RIDER_FAILED") {
		t.Fatalf("应落 RIDER_FAILED，实际 %s", recorder.Body.String())
	}
}

// bdBrokenGateway 让 rider_bind 直接返回传输层错误（非 *gateway.Error）。
type bdBrokenGateway struct{}

func (bdBrokenGateway) RiderBind(context.Context, map[string]any) (map[string]any, error) {
	return nil, errors.New("gateway boom")
}

func (bdBrokenGateway) RiderQL(context.Context, map[string]any) (map[string]any, error) {
	return nil, errors.New("gateway boom")
}

// —— 8. 2xx 但业务不成功：绝不静默成功 ——

func TestBind2xxWithoutSuccessIs502(t *testing.T) {
	cases := map[string]string{
		"success=false":       `{"success":false,"data":{"courier_id":9}}`,
		"success 是字符串 true":   `{"success":"true","data":{"courier_id":9}}`,
		"success 是数字 1":       `{"success":1,"data":{"courier_id":9}}`,
		"缺 success":           `{"data":{"courier_id":9}}`,
		"缺 data":              `{"success":true}`,
		"courier_id 缺失":       `{"success":true,"data":{}}`,
		"courier_id 为 0":      `{"success":true,"data":{"courier_id":0}}`,
		"courier_id 为负数":      `{"success":true,"data":{"courier_id":-9}}`,
		"courier_id 非整数":      `{"success":true,"data":{"courier_id":9.5}}`,
		"courier_id 非数字串":     `{"success":true,"data":{"courier_id":"9abc"}}`,
		"courier_id 超出安全整数":   `{"success":true,"data":{"courier_id":9007199254740992}}`,
		"courier_id 是布尔 true": `{"success":true,"data":{"courier_id":true}}`,
	}
	for name, body := range cases {
		t.Run(name, func(t *testing.T) {
			route, calls := bdRoute(t, bdBindReply(bdReply{Body: body}), nil)
			recorder := bdPostOK(t, route)
			bdAssertErrorPage(t, name, recorder, http.StatusBadGateway)
			if !strings.Contains(recorder.Body.String(), "RIDER_FAILED") {
				t.Fatalf("%s 应落 RIDER_FAILED，实际 %s", name, recorder.Body.String())
			}
			// **绝不静默成功**：没有合法 courier_id 就不得去签工作台 URL。
			if len(bdCalls(calls, "rider_ql")) != 0 {
				t.Fatalf("%s 不该调用 rider_ql（会拿假 id 签 URL）", name)
			}
		})
	}
}

// TestBind2xxAcceptsNumericStringCourierID 钉住 Node 的 `Number(...)` 语义：
// courier_id 是数字字符串 "9" 时 Node 会转成 9 继续走，Go 也必须接受。
// 这条与上一条方向相反，两边一起才能锁住「既不放宽也不收紧」。
func TestBind2xxAcceptsNumericStringCourierID(t *testing.T) {
	route, calls := bdRoute(t, bdBindReply(bdReply{
		Body: `{"success":true,"data":{"courier_id":"9"}}`,
	}), nil)
	recorder := bdPostOK(t, route)
	if recorder.Code != http.StatusFound {
		t.Fatalf("courier_id 数字字符串应视为 9 并 302，实际 %d（body=%s）", recorder.Code, recorder.Body.String())
	}
	qlCalls := bdCalls(calls, "rider_ql")
	if len(qlCalls) != 1 {
		t.Fatalf("rider_ql 应调用 1 次，实际 %d", len(qlCalls))
	}
	if got, ok := gateway.Int(qlCalls[0].Params, "courier_id"); !ok || got != 9 {
		t.Fatalf("rider_ql 的 courier_id 应为 9，实际 %v", qlCalls[0].Params)
	}
}

// —— 9. 第二段（rider_ql）失败 → 502 WORKBENCH_URL_FAILED，文案必须区分（G-8）——

func TestBindWorkbenchFailuresUseDistinctCopy(t *testing.T) {
	cases := map[string]bdReply{
		"rider_ql 非 2xx": {
			Status: http.StatusNotFound,
			Body:   `{"success":false,"error":{"code":"COURIER_NOT_FOUND","message":"骑手不存在或状态不可用"}}`,
		},
		"rider_ql success=false": {Body: `{"success":false,"error":{"code":"COURIER_NOT_FOUND"}}`},
		"返回 http URL":            {Body: `{"success":true,"data":{"url":"http://evil.example/ql"}}`},
		"返回白名单外 https URL":       {Body: `{"success":true,"data":{"url":"https://evil.example/ql?token=FAKE"}}`},
		"url 不是字符串":              {Body: `{"success":true,"data":{"url":123}}`},
		"缺 url":                  {Body: `{"success":true,"data":{}}`},
	}
	for name, reply := range cases {
		t.Run(name, func(t *testing.T) {
			route, calls := bdRoute(t, bdQLReply(reply), nil)
			recorder := bdPostOK(t, route)

			bdAssertErrorPage(t, name, recorder, http.StatusBadGateway)
			page := recorder.Body.String()
			if !strings.Contains(page, "WORKBENCH_URL_FAILED") {
				t.Fatalf("应落 WORKBENCH_URL_FAILED，实际 %s", page)
			}
			// G-8：绑定已生效，文案不能与绑定失败相同（否则诱导用户反复重绑）。
			if !strings.Contains(page, "绑定已生效") {
				t.Fatalf("文案应提示绑定已生效，实际 %s", page)
			}
			if strings.Contains(page, "RIDER_FAILED") {
				t.Fatalf("ql 失败不得复用 RIDER_FAILED（用户会误判绑定失败）：%s", page)
			}
			if got := recorder.Body.Len(); got != bdNodeLen502Workbench {
				t.Fatalf("502 错误页应 %d 字节（Node 实测 Content-Length），实际 %d",
					bdNodeLen502Workbench, got)
			}
			// 绑定已经调到网关（且确实成功了），ql 也调了一次；只是结果不能用。
			if len(bdCalls(calls, "rider_bind")) != 1 || len(bdCalls(calls, "rider_ql")) != 1 {
				t.Fatalf("两段都应各调一次，实际 %v", *calls)
			}
		})
	}
}

// —— 10. 本地 IP 限频（Node 用例第 396-405 行）——

func TestBindLocalRateLimitReturns429(t *testing.T) {
	var mu sync.Mutex
	calls := 0
	// 第一次放行、之后拒绝（Node 用例的 `() => (n++ === 0)` 同款）。
	allow := func(string) bool {
		mu.Lock()
		defer mu.Unlock()
		calls++
		return calls == 1
	}
	route, gatewayCalls := bdRoute(t, nil, func(dep *Dep) { dep.Allow = allow })

	first := bdPostOK(t, route)
	if first.Code != http.StatusFound {
		t.Fatalf("第一次应 302，实际 %d（body=%s）", first.Code, first.Body.String())
	}

	second := bdPostOK(t, route)
	bdAssertErrorPage(t, "第二次", second, http.StatusTooManyRequests)
	page := second.Body.String()
	if !strings.Contains(page, "RATE_LIMITED") {
		t.Fatalf("本地限频的码是 RATE_LIMITED（与网关的 BIND_RATE_LIMITED 区分），实际 %s", page)
	}
	if strings.Contains(page, "BIND_RATE_LIMITED") {
		t.Fatalf("本地限频不该冒用网关键的码：%s", page)
	}
	if len(bdCalls(gatewayCalls, "rider_bind")) != 1 {
		t.Fatalf("被限频后不得触达网关，实际 %d 次", len(bdCalls(gatewayCalls, "rider_bind")))
	}
}

// TestBindRateLimitWindowBoundary 钉住定长窗口的边界：第 N 次放行、第 N+1 次拒绝，
// 窗口过去后重新放行。用 token.NewLimiter（生产同款）而不是手搓计数器。
func TestBindRateLimitWindowBoundary(t *testing.T) {
	var mu sync.Mutex
	current := time.Unix(1700000000, 0)
	now := func() time.Time {
		mu.Lock()
		defer mu.Unlock()
		return current
	}
	advance := func(d time.Duration) {
		mu.Lock()
		defer mu.Unlock()
		current = current.Add(d)
	}

	route, gatewayCalls := bdRoute(t, nil, func(dep *Dep) {
		dep.Allow = token.NewLimiter(2, 60*time.Second, now)
	})

	// 同一 IP 前两次放行。
	for i := 1; i <= 2; i++ {
		if code := bdPostOK(t, route).Code; code != http.StatusFound {
			t.Fatalf("第 %d 次应放行（max=2），实际 %d", i, code)
		}
	}
	// 第 3 次（N+1）拒绝。
	if code := bdPostOK(t, route).Code; code != http.StatusTooManyRequests {
		t.Fatalf("第 3 次应 429，实际 %d", code)
	}
	// 换 IP 不受影响（分桶键是客户端 IP）：证明限的是桶而不是全局。
	otherRecorder := httptest.NewRecorder()
	otherRequest := httptest.NewRequest(http.MethodPost, "/tg-api/rider/bind",
		strings.NewReader(url.Values{"initData": {"signed:77"}, "phone": {"0912345678"}}.Encode()))
	otherRequest.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	otherRequest.RemoteAddr = "9.9.9.9:1234"
	route.PostBind(otherRecorder, otherRequest)
	if otherRecorder.Code != http.StatusFound {
		t.Fatalf("不同 IP 应各自计数（窗口内仍放行），实际 %d", otherRecorder.Code)
	}

	// 窗口过去（60s）后原 IP 重新放行。
	advance(60 * time.Second)
	if code := bdPostOK(t, route).Code; code != http.StatusFound {
		t.Fatalf("窗口过后应重新放行，实际 %d", code)
	}

	// 网关调用次数：2（前两次）+ 1（另一个 IP）+ 1（窗口后）= 4。
	if got := len(bdCalls(gatewayCalls, "rider_bind")); got != 4 {
		t.Fatalf("网关应被调用 4 次，实际 %d", got)
	}
}

// TestBindClientKeyFollowsTrustProxy 钉住限流键与网关 ip 参数的取法：
// 必须与 httpapi.clientKey 同语义（hops=0 只认 RemoteAddr；hops=n 取 XFF 链条倒数第 n+1 个）。
func TestBindClientKeyFollowsTrustProxy(t *testing.T) {
	cases := []struct {
		name string
		hops int
		xff  string
		want string
	}{
		{"不信任代理：忽略 XFF", 0, "1.1.1.1, 2.2.2.2", "1.2.3.4"},
		{"信任 1 跳：取链条倒数第 2 个", 1, "1.1.1.1, 2.2.2.2", "2.2.2.2"},
		{"信任 2 跳：取链条倒数第 3 个", 2, "1.1.1.1, 2.2.2.2", "1.1.1.1"},
		{"跳数超过链条长度：回落 RemoteAddr", 9, "1.1.1.1", "1.2.3.4"},
	}
	for _, item := range cases {
		t.Run(item.name, func(t *testing.T) {
			route, calls := bdRoute(t, nil, func(dep *Dep) { dep.TrustProxyHops = item.hops })
			recorder := bdPost(t, route, "signed:77", "0912345678", map[string]string{"X-Forwarded-For": item.xff})
			if recorder.Code != http.StatusFound {
				t.Fatalf("应 302，实际 %d（body=%s）", recorder.Code, recorder.Body.String())
			}
			binds := bdCalls(calls, "rider_bind")
			if len(binds) != 1 {
				t.Fatalf("rider_bind 应调用 1 次，实际 %d", len(binds))
			}
			if got := binds[0].Params["ip"]; got != item.want {
				t.Fatalf("网关 ip 参数应为 %q，实际 %#v", item.want, got)
			}
		})
	}
}

// —— 11. 幂等重绑 / 换号重绑（Node 用例第 380-401 行）——

func TestBindIdempotentRebind(t *testing.T) {
	route, calls := bdRoute(t, nil, nil)
	for i := 1; i <= 2; i++ {
		recorder := bdPostOK(t, route)
		if recorder.Code != http.StatusFound {
			t.Fatalf("第 %d 次绑定也应成功重定向（同对幂等），实际 %d", i, recorder.Code)
		}
		if got := recorder.Header().Get("Location"); got != bdWorkbench {
			t.Fatalf("第 %d 次 Location 应为 %q，实际 %q", i, bdWorkbench, got)
		}
	}
	binds := bdCalls(calls, "rider_bind")
	if len(binds) != 2 {
		t.Fatalf("两次都应触达网关，实际 %d 次", len(binds))
	}
	if binds[0].Params["phone"] != binds[1].Params["phone"] {
		t.Fatalf("同对重绑的网关参数应一致，实际 %v vs %v", binds[0].Params, binds[1].Params)
	}
}

// TestBindPhoneChangeRebindIsJudgedByGateway 对应 Node「换手机号重绑：Node 不拦，
// 是换绑还是冲突由 PHP 判」。Go 侧同样不做任何本地判定。
func TestBindPhoneChangeRebindIsJudgedByGateway(t *testing.T) {
	script := func(call bdCall) bdReply {
		if call.Action == "rider_bind" && call.Params["phone"] == "0987654321" {
			return bdReply{Status: http.StatusConflict, Body: `{"success":false,"error":{"code":"TG_ALREADY_BOUND"}}`}
		}
		return bdOKScript(call)
	}
	route, calls := bdRoute(t, script, nil)

	if code := bdPost(t, route, "signed:77", "0912345678", nil).Code; code != http.StatusFound {
		t.Fatalf("首次绑定应 302，实际 %d", code)
	}
	second := bdPost(t, route, "signed:77", "0987654321", nil)
	bdAssertErrorPage(t, "换号重绑", second, http.StatusConflict)
	if !strings.Contains(second.Body.String(), "TG_ALREADY_BOUND") {
		t.Fatalf("换号被 PHP 拦成 409 时应透出 TG_ALREADY_BOUND，实际 %s", second.Body.String())
	}
	binds := bdCalls(calls, "rider_bind")
	if len(binds) != 2 || binds[1].Params["phone"] != "0987654321" {
		t.Fatalf("第二次应以新号码触达网关，实际 %v", binds)
	}
}

// —— 12. 日志纪律：只记错误消息，不记 initData / 手机号 / URL ——

func TestBindLogsNeverCarryCredentials(t *testing.T) {
	const (
		initData = "signed:77"
		phone    = "0912345678"
		leakyURL = "https://evil.example.com/ql.html?token=SECRET-TOKEN"
	)
	var mu sync.Mutex
	var lines []string
	route, _ := bdRoute(t, bdQLReply(bdReply{
		Body: `{"success":true,"data":{"url":"` + leakyURL + `"}}`,
	}), func(dep *Dep) {
		dep.Logf = func(line string) {
			mu.Lock()
			defer mu.Unlock()
			lines = append(lines, line)
		}
	})

	recorder := bdPost(t, route, initData, phone, nil)
	bdAssertErrorPage(t, "ql 白名单外 URL", recorder, http.StatusBadGateway)

	mu.Lock()
	joined := strings.Join(lines, "\n")
	mu.Unlock()
	if len(lines) == 0 {
		t.Fatal("失败分支应写一行日志（否则线上无从排查）")
	}
	for _, forbidden := range []string{initData, phone, leakyURL, "SECRET-TOKEN"} {
		if strings.Contains(joined, forbidden) {
			t.Fatalf("日志不得包含 %q：%s", forbidden, joined)
		}
	}
	// 只记消息：错误消息本身要留下，否则日志没有诊断价值。
	if !strings.Contains(joined, "invalid url") {
		t.Fatalf("日志应记录错误消息，实际：%s", joined)
	}
	// 两段失败的日志前缀必须能区分（Node: failed / bind ok but ql failed）。
	if !strings.Contains(joined, "bind ok but ql failed") {
		t.Fatalf("ql 失败应带专属前缀，实际：%s", joined)
	}
}

// TestBindConflictDoesNotLog 钉住 Node 的「业务失败不写 error 日志」：
// 冲突/限频/未找到是正常业务事件，天天刷 error 会把真故障淹掉。
func TestBindConflictDoesNotLog(t *testing.T) {
	var mu sync.Mutex
	var lines []string
	route, _ := bdRoute(t, bdBindReply(bdReply{
		Status: http.StatusConflict,
		Body:   `{"success":false,"error":{"code":"COURIER_ALREADY_BOUND"}}`,
	}), func(dep *Dep) {
		dep.Logf = func(line string) {
			mu.Lock()
			defer mu.Unlock()
			lines = append(lines, line)
		}
	})

	if code := bdPostOK(t, route).Code; code != http.StatusConflict {
		t.Fatalf("应 409，实际 %d", code)
	}
	mu.Lock()
	defer mu.Unlock()
	if len(lines) != 0 {
		t.Fatalf("409 冲突不该写 error 日志，实际：%v", lines)
	}
}

// TestBindErrorPageDoesNotEchoInitData 对应 Node「错误响应不回显 initData」。
func TestBindErrorPageDoesNotEchoInitData(t *testing.T) {
	const initData = "signed:77"
	// 400：手机号非法（initData 合法，已通过验签）。
	route, _ := bdRoute(t, nil, nil)
	bad := bdPost(t, route, initData, "bad", nil)
	bdAssertErrorPage(t, "400", bad, http.StatusBadRequest)
	if strings.Contains(bad.Body.String(), initData) {
		t.Fatalf("错误页不得回显 initData：%s", bad.Body.String())
	}

	// 502：网关失败（错误消息里可能带凭证，也不能透给用户）。
	route502, _ := bdRoute(t, bdBindReply(bdReply{Status: 500, Body: `{"error":{"message":"` + initData + `"}}`}), nil)
	failed := bdPost(t, route502, initData, "0912345678", nil)
	bdAssertErrorPage(t, "502", failed, http.StatusBadGateway)
	if strings.Contains(failed.Body.String(), initData) {
		t.Fatalf("502 错误页不得回显 initData：%s", failed.Body.String())
	}
}

// —— 13. 302 的响应形态（与真 Node 进程逐字节对齐）——

// TestBindRedirectShapeMatchesExpress 是本文件最重要的用例：302 是用户实际看到的
// 最终响应，它由 express 的 res.redirect 生成，**不是** http.Redirect 的形态。
//
// 期望值来自实测（真 express 4.21 + 真 riderRoute.js，curl/node 客户端抓包）：
//
//	Accept: text/html,... → 302, Content-Type: text/html; charset=utf-8,
//	                        Content-Length: 72,
//	                        body: <p>Found. Redirecting to {url}</p>
//	Accept: */* 或 text/plain → Content-Type: text/plain; charset=utf-8,
//	                        Content-Length: 65, body: Found. Redirecting to {url}
//	Accept: application/json → 无 Content-Type，Content-Length: 0，body 为空
//
// Content-Length 的 72 / 65 直接来自抓包，且与本文件 bdWorkbench 的长度耦合
// （url 43 字节）：改动 fixture URL 时这两条要一起改。
func TestBindRedirectShapeMatchesExpress(t *testing.T) {
	cases := []struct {
		name       string
		accept     string
		wantType   string
		wantLength string
		wantBody   string
	}{
		{
			name:       "浏览器表单（TG WebView）",
			accept:     bdBrowserAccept,
			wantType:   "text/html; charset=utf-8",
			wantLength: "72",
			wantBody:   "<p>Found. Redirecting to " + bdWorkbench + "</p>",
		},
		{
			name:       "curl 默认 */*",
			accept:     "*/*",
			wantType:   "text/plain; charset=utf-8",
			wantLength: "65",
			wantBody:   "Found. Redirecting to " + bdWorkbench,
		},
		{
			name:       "显式 text/plain",
			accept:     "text/plain",
			wantType:   "text/plain; charset=utf-8",
			wantLength: "65",
			wantBody:   "Found. Redirecting to " + bdWorkbench,
		},
		{
			name:       "无 Accept 头（按 */* 处理）",
			accept:     "",
			wantType:   "text/plain; charset=utf-8",
			wantLength: "65",
			wantBody:   "Found. Redirecting to " + bdWorkbench,
		},
		{
			name:       "只接受 json（两个候选都不可接受）",
			accept:     "application/json",
			wantType:   "",
			wantLength: "0",
			wantBody:   "",
		},
	}
	for _, item := range cases {
		t.Run(item.name, func(t *testing.T) {
			route, _ := bdRoute(t, nil, nil)
			recorder := bdPost(t, route, "signed:77", "0912345678", map[string]string{"Accept": item.accept})

			if recorder.Code != http.StatusFound {
				t.Fatalf("状态行应为 302，实际 %d（body=%s）", recorder.Code, recorder.Body.String())
			}
			if got := recorder.Header().Get("Location"); got != bdWorkbench {
				t.Fatalf("Location 应为 %q，实际 %q", bdWorkbench, got)
			}
			if got := recorder.Header().Get("Content-Type"); got != item.wantType {
				t.Fatalf("Content-Type 应为 %q，实际 %q", item.wantType, got)
			}
			if got := recorder.Header().Get("Content-Length"); got != item.wantLength {
				t.Fatalf("Content-Length 应为 %q，实际 %q", item.wantLength, got)
			}
			// Vary: Accept 是 res.format 无条件加的（哪怕落 default 分支）。
			if vary := recorder.Header().Values("Vary"); !containsValue(vary, "Accept") {
				t.Fatalf("302 应带 Vary: Accept（实测如此），实际 %v", vary)
			}
			if got := recorder.Header().Get("Cache-Control"); got != "no-store" {
				t.Fatalf("Cache-Control 应为 no-store，实际 %q", got)
			}
			if got := recorder.Body.String(); got != item.wantBody {
				t.Fatalf("302 body 不符\n got=%q\nwant=%q", got, item.wantBody)
			}
			// 反面证据：http.Redirect 的形态（<a href="...">Found</a>）绝不能出现。
			if strings.Contains(recorder.Body.String(), "<a href=") {
				t.Fatalf("302 body 不该是 http.Redirect 的形态：%q", recorder.Body.String())
			}
		})
	}
}

// TestBindRedirectEscapesURLInHTMLBody 钉住 html 分支的转义（express 用 escape-html）。
// Location 保持原文（只做 header 编码），body 里的 & < > " ' 必须转义 ——
// 否则网关签出的 URL 里一个引号就能打断 HTML。
func TestBindRedirectEscapesURLInHTMLBody(t *testing.T) {
	const target = `https://canary.fbird.men/ql.html?token=A&x="y"&z=<b>`
	route, _ := bdRoute(t, bdQLReply(bdReply{
		Body: `{"success":true,"data":{"url":` + jsonString(target) + `}}`,
	}), nil)

	recorder := bdPostOK(t, route)
	if recorder.Code != http.StatusFound {
		t.Fatalf("白名单内的 https URL 应 302，实际 %d（body=%s）", recorder.Code, recorder.Body.String())
	}
	if got := recorder.Header().Get("Location"); got != target {
		t.Fatalf("Location 应为原文 %q，实际 %q", target, got)
	}
	body := recorder.Body.String()
	for _, entity := range []string{"&amp;", "&quot;", "&lt;", "&gt;"} {
		if !strings.Contains(body, entity) {
			t.Fatalf("html 分支必须转义 %s，实际 body=%s", entity, body)
		}
	}
	if strings.Contains(body, `"y"`) || strings.Contains(body, "<b>") {
		t.Fatalf("body 里不该出现未转义的原文：%s", body)
	}
}

// TestBindRedirectHTTPStatusIsFound 单独钉住状态码 302（不是 301/303/307）。
func TestBindRedirectHTTPStatusIsFound(t *testing.T) {
	route, _ := bdRoute(t, nil, nil)
	recorder := bdPostOK(t, route)
	if recorder.Code != http.StatusFound {
		t.Fatalf("应 302 Found，实际 %d", recorder.Code)
	}
}

// TestBindRedirectOverRealTCP 走**真实 TCP 回环**再验一次 302 的线上形态。
//
// 为什么 recorder 之外还要这一条：ResponseRecorder 不参与 net/http 的写出逻辑，
// 「Content-Length 是否真的出现在线上」只有真 server 能证明（先 WriteHeader 再写
// body 时，若没显式设 CL，Go 会退化成 chunked —— recorder 看不出来）。
// 这条与实测 Node 的抓包逐字段对齐（status-line / Cache-Control / Location /
// Vary / Content-Type / Content-Length / body 字节）。
func TestBindRedirectOverRealTCP(t *testing.T) {
	route, _ := bdRoute(t, nil, nil)
	server := httptest.NewServer(http.HandlerFunc(route.PostBind))
	t.Cleanup(server.Close)

	form := url.Values{"initData": {"signed:77"}, "phone": {"0912345678"}}
	request, err := http.NewRequest(http.MethodPost, server.URL+"/tg-api/rider/bind", strings.NewReader(form.Encode()))
	if err != nil {
		t.Fatalf("构造请求失败: %v", err)
	}
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	request.Header.Set("Accept", bdBrowserAccept)

	// 302 默认会被跟随，必须显式关掉。
	client := &http.Client{CheckRedirect: func(*http.Request, []*http.Request) error {
		return http.ErrUseLastResponse
	}}
	response, err := client.Do(request)
	if err != nil {
		t.Fatalf("请求失败: %v", err)
	}
	defer func() { _ = response.Body.Close() }()
	body, err := io.ReadAll(response.Body)
	if err != nil {
		t.Fatalf("读取响应体失败: %v", err)
	}

	if response.StatusCode != http.StatusFound {
		t.Fatalf("状态码应为 302，实际 %d（body=%s）", response.StatusCode, body)
	}
	if got := response.Header.Get("Location"); got != bdWorkbench {
		t.Fatalf("Location 应为 %q，实际 %q", bdWorkbench, got)
	}
	if got := response.Header.Get("Cache-Control"); got != "no-store" {
		t.Fatalf("Cache-Control 应为 no-store，实际 %q", got)
	}
	if got := response.Header.Get("Content-Type"); got != "text/html; charset=utf-8" {
		t.Fatalf("Content-Type 应为 text/html; charset=utf-8，实际 %q", got)
	}
	if got := response.Header.Get("Content-Length"); got != "72" {
		t.Fatalf("线上 Content-Length 应为 72（定长，不是 chunked），实际 %q", got)
	}
	want := "<p>Found. Redirecting to " + bdWorkbench + "</p>"
	if string(body) != want {
		t.Fatalf("线上 302 body 不符\n got=%q\nwant=%q", body, want)
	}
}

// —— 14. 源码护栏（Node 用例第 573-580 行）——

// TestBindSourceHasNoWrites 是 Node「rider 侧无 DELETE / REPLACE / INSERT / UPDATE」
// 的 Go 等价物：绑定的写入只发生在 PHP 网关，Go 侧连 SQL 都不该有。
func TestBindSourceHasNoWrites(t *testing.T) {
	for _, name := range []string{"bind.go", "phone.go"} {
		raw, err := os.ReadFile(name)
		if err != nil {
			t.Fatalf("读取 %s 失败: %v", name, err)
		}
		source := strings.ToUpper(string(raw))
		for _, forbidden := range []string{"INSERT INTO", "REPLACE INTO", "DELETE FROM", "UPDATE "} {
			if strings.Contains(source, forbidden) {
				t.Fatalf("%s 不得包含写操作 %q（绑定写入只发生在 PHP 网关）", name, forbidden)
			}
		}
		for _, forbidden := range []string{"QueryRowContext(", "ExecContext(", "db.Begin"} {
			if strings.Contains(string(raw), forbidden) {
				t.Fatalf("%s 不该有数据库访问（绑定链路不查库），发现 %s", name, forbidden)
			}
		}
	}
}

// —— 小工具 ——

// containsValue 判断逗号分隔或多值的头里是否含某个 token。
func containsValue(values []string, want string) bool {
	for _, value := range values {
		for _, part := range strings.Split(value, ",") {
			if strings.EqualFold(strings.TrimSpace(part), want) {
				return true
			}
		}
	}
	return false
}

// jsonString 把字符串编码成 JSON 字面量（构造网关响应体用）。
func jsonString(value string) string {
	encoded, err := json.Marshal(value)
	if err != nil {
		panic(err)
	}
	return string(encoded)
}
