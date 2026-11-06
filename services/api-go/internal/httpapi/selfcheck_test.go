// 本文件是契约护栏，不是临时自检。
//
// 其中两条目前是「唯一覆盖」，正式套件补齐前不要删（补齐后也保留双份）：
//   - `TestSelfCheckOrderBookEmptyArraysNotNil`：盘口为空时必须输出 `[]` 而不是 `null`；
//   - `TestSelfCheckTMACSPMatchesNodeSource`：CSP 与 server.js 逐字一致（正则从 Node 源抽串比对）。
//
// 其余用例锁定状态码 / 错误码 / JSON 字段名与字段顺序，同样是改实现前必须先看的口径。
package httpapi

import (
	"context"
	"encoding/json"
	"io"
	"math"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"regexp"
	"strings"
	"testing"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/calltest"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/coins"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/fbproxy"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/payment"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/tgauth"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/token"
)

func envFrom(values map[string]string) func(string) string {
	return func(key string) string { return values[key] }
}

func validInitData(string, string) tgauth.Result {
	return tgauth.Result{
		Valid:    true,
		AuthDate: 1700000000,
		User:     &tgauth.User{ID: 777, Raw: json.RawMessage(`{"id":777,"first_name":"Metro"}`)},
	}
}

func newServer(t *testing.T, mutate func(*Dep)) *Server {
	t.Helper()
	dep := Dep{
		Env:              envFrom(map[string]string{"NODE_ENV": "test"}),
		Now:              func() time.Time { return time.Unix(1700000000, 0) },
		BotToken:         "123456:TEST",
		ValidateInitData: validInitData,
		Logf:             func(string) {},
	}
	if mutate != nil {
		mutate(&dep)
	}
	return NewServer(dep)
}

func call(server *Server, request *http.Request) *httptest.ResponseRecorder {
	recorder := httptest.NewRecorder()
	server.Handler().ServeHTTP(recorder, request)
	return recorder
}

func get(server *Server, target string, headers map[string]string) *httptest.ResponseRecorder {
	request := httptest.NewRequest(http.MethodGet, target, nil)
	for key, value := range headers {
		request.Header.Set(key, value)
	}
	return call(server, request)
}

func postJSON(server *Server, target, body string) *httptest.ResponseRecorder {
	request := httptest.NewRequest(http.MethodPost, target, strings.NewReader(body))
	request.Header.Set("Content-Type", "application/json")
	return call(server, request)
}

// TestSelfCheckRouteTableIsExact 钉住路由条数：多一条少一条都要让契约检查与评审同时察觉。
func TestSelfCheckRouteTableIsExact(t *testing.T) {
	server := newServer(t, nil)
	routes := server.Routes()
	if len(routes) != 23 {
		t.Fatalf("路由表应为 23 条，实际 %d 条：%v", len(routes), routes)
	}
	seen := map[string]bool{}
	for _, route := range routes {
		key := route.Method + " " + route.Path
		if seen[key] {
			t.Fatalf("路由重复声明：%s", key)
		}
		seen[key] = true
	}
	for _, key := range []string{"GET /", "ALL /tg-api/fb/{service}/{action}", "GET /tma/"} {
		if !seen[key] {
			t.Fatalf("路由表缺少 %s", key)
		}
	}
}

// TestSelfCheckRootIsExact 是最容易踩的一处：把 `GET /{$}` 写成 `GET /` 会吞掉所有
// 未匹配路径，404 变成 200，上游排障时完全看不出「路由没注册」。
func TestSelfCheckRootIsExact(t *testing.T) {
	server := newServer(t, nil)

	root := get(server, "/", nil)
	if root.Code != http.StatusOK {
		t.Fatalf("GET / 应 200，实得 %d", root.Code)
	}
	for _, path := range []string{"/nope", "/tg-api/nope", "/tg-api/", "/tg-apix"} {
		if got := get(server, path, nil); got.Code != http.StatusNotFound {
			t.Fatalf("%s 应 404，实得 %d", path, got.Code)
		}
	}
}

func TestSelfCheckHealthShape(t *testing.T) {
	server := newServer(t, nil)
	recorder := get(server, "/health", nil)
	if recorder.Code != http.StatusOK {
		t.Fatalf("应 200，实得 %d", recorder.Code)
	}
	// 与 Node 的 new Date().toISOString() 同形：毫秒三位 + Z。
	if !strings.Contains(recorder.Body.String(), `"timestamp":"2023-11-14T22:13:20.000Z"`) {
		t.Fatalf("timestamp 应为 ISO 形态，实得 %q", recorder.Body.String())
	}
	var body map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &body); err != nil {
		t.Fatalf("响应不是合法 JSON: %v", err)
	}
	if body["status"] != "online" || body["service"] != "Firebird-SEA-Core-API" ||
		body["region"] != "Philippines (Manila/Cebu)" {
		t.Fatalf("字段值与 Node 不一致：%v", body)
	}
	// 结尾不能有换行：Node 的 res.json 不补。
	if strings.HasSuffix(recorder.Body.String(), "\n") {
		t.Fatal("响应体结尾不该有换行")
	}
	// 三条健康检查路径都要在。
	for _, path := range []string{"/tg-api/health"} {
		if got := get(server, path, nil); got.Code != http.StatusOK {
			t.Fatalf("%s 应 200，实得 %d", path, got.Code)
		}
	}
}

func TestSelfCheckMockWebhookIsProductionGated(t *testing.T) {
	development := newServer(t, func(dep *Dep) {
		dep.Env = envFrom(map[string]string{"NODE_ENV": "development"})
		dep.Payments = payment.New(payment.Dep{Now: func() time.Time { return time.Unix(1700000000, 0) }})
	})
	create := postJSON(development, "/tg-api/payment/create-charge", `{"orderId":"ORD1","amountUsdt":15}`)
	if create.Code != http.StatusOK {
		t.Fatalf("create-charge 应 200，实得 %d（%s）", create.Code, create.Body.String())
	}
	var created struct {
		Data struct {
			ChargeID string `json:"chargeId"`
		} `json:"data"`
	}
	if err := json.Unmarshal(create.Body.Bytes(), &created); err != nil {
		t.Fatalf("响应解析失败: %v", err)
	}
	hook := postJSON(development, "/tg-api/payment/mock-webhook",
		`{"chargeId":"`+created.Data.ChargeID+`"}`)
	if hook.Code != http.StatusOK {
		t.Fatalf("非生产环境 mock-webhook 应 200，实得 %d（%s）", hook.Code, hook.Body.String())
	}

	production := newServer(t, func(dep *Dep) {
		dep.Env = envFrom(map[string]string{"NODE_ENV": "production"})
		dep.Payments = payment.New(payment.Dep{})
	})
	if got := postJSON(production, "/tg-api/payment/mock-webhook", `{"chargeId":"x"}`); got.Code != http.StatusNotFound {
		t.Fatalf("生产环境 mock-webhook 必须不存在（404），实得 %d", got.Code)
	}
}

func TestSelfCheckCreateChargeValidation(t *testing.T) {
	server := newServer(t, func(dep *Dep) { dep.Payments = payment.New(payment.Dep{}) })
	cases := []struct {
		body   string
		status int
	}{
		{`{"orderId":"ORD1","amountUsdt":15}`, http.StatusOK},
		{`{"orderId":"","amountUsdt":15}`, http.StatusBadRequest},
		{`{"amountUsdt":15}`, http.StatusBadRequest},
		{`{"orderId":"ORD1","amountUsdt":0}`, http.StatusBadRequest},
		{`{"orderId":"ORD1","amountUsdt":-1}`, http.StatusBadRequest},
		{`{"orderId":"ORD1","amountUsdt":null}`, http.StatusBadRequest},
		{`{"orderId":"ORD1","amountUsdt":""}`, http.StatusBadRequest},
		// network 缺省才用 TRC-20；显式给值就照用。
		{`{"orderId":"ORD2","amountUsdt":"12.5","network":"BEP-20"}`, http.StatusOK},
	}
	for _, item := range cases {
		got := postJSON(server, "/tg-api/payment/create-charge", item.body)
		if got.Code != item.status {
			t.Fatalf("%s 应 %d，实得 %d（%s）", item.body, item.status, got.Code, got.Body.String())
		}
	}
}

// TestSelfCheckCreateChargeNetworkDefaultScope 钉住「字段缺省」与「显式空串」的区别：
// Node 的解构默认值 `network = 'TRC-20'` 只对 undefined 生效，所以
// `{"network":""}` 必须原样吐出 `"network":""`，不能被悄悄改成 TRC-20。
func TestSelfCheckCreateChargeNetworkDefaultScope(t *testing.T) {
	server := newServer(t, func(dep *Dep) { dep.Payments = payment.New(payment.Dep{}) })

	networkOf := func(body string) string {
		t.Helper()
		recorder := postJSON(server, "/tg-api/payment/create-charge", body)
		if recorder.Code != http.StatusOK {
			t.Fatalf("%s 应 200，实得 %d（%s）", body, recorder.Code, recorder.Body.String())
		}
		var decoded struct {
			Data struct {
				Network string `json:"network"`
			} `json:"data"`
		}
		if err := json.Unmarshal(recorder.Body.Bytes(), &decoded); err != nil {
			t.Fatalf("响应解析失败: %v", err)
		}
		return decoded.Data.Network
	}

	if got := networkOf(`{"orderId":"A","amountUsdt":1}`); got != "TRC-20" {
		t.Fatalf("字段缺省应回落 TRC-20，实得 %q", got)
	}
	if got := networkOf(`{"orderId":"B","amountUsdt":1,"network":""}`); got != "" {
		t.Fatalf("显式空串必须原样输出空串（Node 的默认值只对 undefined 生效），实得 %q", got)
	}
	if got := networkOf(`{"orderId":"C","amountUsdt":1,"network":"TON"}`); got != "TON" {
		t.Fatalf("显式值应原样使用，实得 %q", got)
	}
	// null / 非字符串在 Node 里都取默认值。
	if got := networkOf(`{"orderId":"D","amountUsdt":1,"network":null}`); got != "TRC-20" {
		t.Fatalf("network=null 应回落 TRC-20，实得 %q", got)
	}
}

func TestSelfCheckCORSBehavior(t *testing.T) {
	// CORS_ORIGINS 未配置 → `*`（保持既有调用方可用）。
	openServer := newServer(t, nil)
	recorder := get(openServer, "/health", nil)
	if got := recorder.Header().Get("Access-Control-Allow-Origin"); got != "*" {
		t.Fatalf("未配置白名单时应回 *，实得 %q", got)
	}

	// 配置了白名单 → 命中回显 Origin 并加 Vary；未命中不发 ACAO。
	strict := newServer(t, func(dep *Dep) {
		dep.Env = envFrom(map[string]string{
			"NODE_ENV":     "test",
			"CORS_ORIGINS": "https://a.example.com, https://b.example.com",
		})
	})
	hit := get(strict, "/health", map[string]string{"Origin": "https://b.example.com"})
	if got := hit.Header().Get("Access-Control-Allow-Origin"); got != "https://b.example.com" {
		t.Fatalf("命中白名单应回显 Origin，实得 %q", got)
	}
	if !strings.Contains(strings.Join(hit.Header().Values("Vary"), ","), "Origin") {
		t.Fatalf("命中白名单必须加 Vary: Origin，实得 %v", hit.Header().Values("Vary"))
	}
	miss := get(strict, "/health", map[string]string{"Origin": "https://evil.com"})
	if got := miss.Header().Get("Access-Control-Allow-Origin"); got != "" {
		t.Fatalf("未命中白名单不该发 ACAO，实得 %q", got)
	}

	// 预检直接 204，不进路由；并回显请求头。
	preflight := httptest.NewRequest(http.MethodOptions, "/tg-api/services", nil)
	preflight.Header.Set("Origin", "https://a.example.com")
	preflight.Header.Set("Access-Control-Request-Headers", "x-telegram-init-data")
	result := call(strict, preflight)
	if result.Code != http.StatusNoContent {
		t.Fatalf("预检应 204，实得 %d", result.Code)
	}
	if !strings.Contains(result.Header().Get("Access-Control-Allow-Methods"), "POST") {
		t.Fatalf("预检应声明 Allow-Methods，实得 %q", result.Header().Get("Access-Control-Allow-Methods"))
	}
	if got := result.Header().Get("Access-Control-Allow-Headers"); got != "x-telegram-init-data" {
		t.Fatalf("预检应回显请求头，实得 %q", got)
	}
}

func TestSelfCheckBodyLimit(t *testing.T) {
	server := newServer(t, nil)

	// 恰好 100KB 放行（会被字段校验拒掉，但不能是 413）。
	atLimit := `{"initData":"` + strings.Repeat("a", MaxBodyBytes-20) + `"}`
	if got := postJSON(server, "/tg-api/auth/tg-verify", atLimit); got.Code == http.StatusRequestEntityTooLarge {
		t.Fatalf("恰好 100KB 不该 413，实得 %d", got.Code)
	}

	overLimit := `{"initData":"` + strings.Repeat("a", MaxBodyBytes+10) + `"}`
	got := postJSON(server, "/tg-api/auth/tg-verify", overLimit)
	if got.Code != http.StatusRequestEntityTooLarge {
		t.Fatalf("超过 100KB 应 413，实得 %d", got.Code)
	}
}

func TestSelfCheckTgVerify(t *testing.T) {
	// 开发环境 + mock_test_user 走固定 mock。
	development := newServer(t, func(dep *Dep) {
		dep.Env = envFrom(map[string]string{"NODE_ENV": "development"})
	})
	mock := postJSON(development, "/tg-api/auth/tg-verify", `{"initData":"mock_test_user"}`)
	if mock.Code != http.StatusOK || !strings.Contains(mock.Body.String(), `"mode":"mock_development"`) {
		t.Fatalf("开发环境 mock 应生效，实得 %d（%s）", mock.Code, mock.Body.String())
	}

	// 生产环境同样的输入必须走真实验签（默认 tgauth 实现）→ 401。
	// 错误是字符串形而不是对象形 —— 旧接口调用方按 {success,error:"..."} 解析。
	production := newServer(t, func(dep *Dep) { dep.ValidateInitData = nil })
	rejected := postJSON(production, "/tg-api/auth/tg-verify", `{"initData":"mock_test_user"}`)
	if rejected.Code != http.StatusUnauthorized {
		t.Fatalf("生产环境 mock_test_user 必须 401，实得 %d", rejected.Code)
	}
	var body struct {
		Success bool   `json:"success"`
		Error   string `json:"error"`
	}
	if err := json.Unmarshal(rejected.Body.Bytes(), &body); err != nil {
		t.Fatalf("响应解析失败: %v", err)
	}
	if body.Error == "" {
		t.Fatalf("旧接口必须是字符串形 error，实得 %s", rejected.Body.String())
	}

	missing := postJSON(production, "/tg-api/auth/tg-verify", `{}`)
	if missing.Code != http.StatusBadRequest {
		t.Fatalf("缺 initData 应 400，实得 %d", missing.Code)
	}

	// 成功时返回 user 原文 + authDate（用注入了验签实现的 server）。
	ok := postJSON(newServer(t, nil), "/tg-api/auth/tg-verify", `{"initData":"whatever"}`)
	if ok.Code != http.StatusOK || !strings.Contains(ok.Body.String(), `"authDate":1700000000`) {
		t.Fatalf("验签成功应回 authDate，实得 %d（%s）", ok.Code, ok.Body.String())
	}
}

func TestSelfCheckTgVerifyRateLimit(t *testing.T) {
	server := newServer(t, nil)
	var last *httptest.ResponseRecorder
	for index := 0; index < 31; index++ {
		last = postJSON(server, "/tg-api/auth/tg-verify", `{}`)
	}
	if last.Code != http.StatusTooManyRequests {
		t.Fatalf("第 31 次应 429，实得 %d", last.Code)
	}
}

func TestSelfCheckRatesConvertParseFloatSemantics(t *testing.T) {
	// parseFloat 的宽容是 Node 的既有行为："12abc" 等价 12，不能被移植成 400。
	cases := map[string]float64{
		"12":     12,
		"12abc":  12,
		" 12.5":  12.5,
		"12.5e2": 1250,
		".5":     0.5,
		"+3":     3,
		"abc":    math.NaN(),
		"":       math.NaN(),
		"0":      0,
		"-1":     -1,
		"1.2.3":  1.2,
		// parseFloat 读到 `1` 后遇到残缺指数就停，返回 1（不是 NaN）。
		"1e":   1,
		"0x10": 0,
	}
	for input, want := range cases {
		got := jsParseFloat(input)
		if math.IsNaN(want) {
			if !math.IsNaN(got) {
				t.Fatalf("jsParseFloat(%q) = %v，期望 NaN", input, got)
			}
			continue
		}
		if got != want {
			t.Fatalf("jsParseFloat(%q) = %v，期望 %v", input, got, want)
		}
	}

	// 非法金额 400；合法金额走到「coins 未配置」的 500，说明确实过了参数校验。
	server := newServer(t, nil)
	if got := get(server, "/tg-api/rates/convert?php=0", nil); got.Code != http.StatusBadRequest {
		t.Fatalf("php=0 应 400，实得 %d", got.Code)
	}
	if got := get(server, "/tg-api/rates/convert", nil); got.Code != http.StatusBadRequest {
		t.Fatalf("缺 php 应 400，实得 %d", got.Code)
	}
	if got := get(server, "/tg-api/rates/convert?php=12abc", nil); got.Code == http.StatusBadRequest {
		t.Fatalf("php=12abc 不该 400（parseFloat 语义），实得 %d", got.Code)
	}

	// php=abc：parseFloat 得 NaN，而 Node 的守卫是 `php <= 0` —— NaN 参与比较恒为 false，
	// 于是放行；换算得到 NaN，由 res.json（JSON.stringify）写成 null，最终 **200**。
	// 这条原先断言 400，是照着 Go 的 `!(php > 0)` 写的，等于把实现锁在错误的一侧。
	// 要断言 200 就得有能算出结果的 coins 客户端，否则会停在「coins 未配置」的 500。
	nanServer := newServer(t, func(dep *Dep) {
		dep.Coins = coins.New(coins.Dep{
			HTTPClient: &http.Client{Transport: fakeCoinsTransport{}},
			Now:        func() time.Time { return time.Unix(1700000000, 0) },
		})
	})
	got := get(nanServer, "/tg-api/rates/convert?php=abc", nil)
	if got.Code != http.StatusOK {
		t.Fatalf("php=abc 应 200（NaN 放行），实得 %d %s", got.Code, got.Body.String())
	}
	if body := got.Body.String(); !strings.Contains(body, `"php":null`) || !strings.Contains(body, `"usdt":null`) {
		t.Fatalf("NaN 必须序列化成 null，实得 %s", body)
	}
}

func TestSelfCheckWalletFailureIs400WithTip(t *testing.T) {
	server := newServer(t, func(dep *Dep) {
		// 指向一个必然失败的上游：缺 key/secret 时客户端会报配置错。
		dep.Coins = coins.New(coins.Dep{BaseURL: "http://127.0.0.1:1", Now: time.Now})
	})
	got := get(server, "/tg-api/wallet/coins-ph/balance", nil)
	if got.Code != http.StatusBadRequest {
		t.Fatalf("余额接口失败应 400（不是 500），实得 %d", got.Code)
	}
	var body struct {
		Success bool   `json:"success"`
		Error   string `json:"error"`
		Tip     string `json:"tip"`
	}
	if err := json.Unmarshal(got.Body.Bytes(), &body); err != nil {
		t.Fatalf("响应解析失败: %v", err)
	}
	if body.Error == "" {
		t.Fatalf("必须带具体原因，实得 %s", got.Body.String())
	}
	if !strings.Contains(body.Tip, "COINS_PH_API_KEY") {
		t.Fatalf("必须带配置提示，实得 %q", body.Tip)
	}
}

func TestSelfCheckCallTestStates(t *testing.T) {
	server := newServer(t, nil)
	// 缺 initData → 401 对象形错误。
	unauthorized := postJSON(server, "/tg-api/call-test", `{}`)
	if unauthorized.Code != http.StatusUnauthorized ||
		!strings.Contains(unauthorized.Body.String(), `"code":"UNAUTHORIZED"`) {
		t.Fatalf("缺 initData 应 401 UNAUTHORIZED，实得 %d（%s）", unauthorized.Code, unauthorized.Body.String())
	}

	// 有 initData 但 CALL_TEST_URL 未配置 → 503。
	notConfigured := postJSON(server, "/tg-api/call-test", `{"initData":"x"}`)
	if notConfigured.Code != http.StatusServiceUnavailable ||
		!strings.Contains(notConfigured.Body.String(), `"code":"CALL_TEST_NOT_CONFIGURED"`) {
		t.Fatalf("未配置应 503，实得 %d（%s）", notConfigured.Code, notConfigured.Body.String())
	}

	// 单飞：另一个请求正在跑时直接 429。
	configured := newServer(t, func(dep *Dep) {
		dep.Env = envFrom(map[string]string{"NODE_ENV": "test", "CALL_TEST_URL": "http://127.0.0.1:1"})
		dep.RunCallTest = func(context.Context, string, any, calltest.Options) calltest.Result {
			return calltest.Result{Attempts: 3, Error: "no answer"}
		}
	})
	callTestBusy.Store(true)
	defer callTestBusy.Store(false)
	busy := postJSON(configured, "/tg-api/call-test", `{"initData":"x"}`)
	if busy.Code != http.StatusTooManyRequests ||
		!strings.Contains(busy.Body.String(), `"code":"CALL_TEST_BUSY"`) {
		t.Fatalf("单飞冲突应 429，实得 %d（%s）", busy.Code, busy.Body.String())
	}
}

func TestSelfCheckCallTestFailureCarriesAttempts(t *testing.T) {
	server := newServer(t, func(dep *Dep) {
		dep.Env = envFrom(map[string]string{"NODE_ENV": "test", "CALL_TEST_URL": "http://example.invalid"})
		dep.RunCallTest = func(context.Context, string, any, calltest.Options) calltest.Result {
			return calltest.Result{Attempts: 3, Error: "no answer"}
		}
	})
	got := postJSON(server, "/tg-api/call-test", `{"initData":"x"}`)
	if got.Code != http.StatusBadGateway {
		t.Fatalf("呼叫失败应 502，实得 %d", got.Code)
	}
	if !strings.Contains(got.Body.String(), `"attempts":3`) ||
		!strings.Contains(got.Body.String(), `"code":"CALL_TEST_FAILED"`) {
		t.Fatalf("失败体应带 attempts 与 code，实得 %s", got.Body.String())
	}
}

// TestSelfCheckProxyDoesNotEscapeUpstreamJSON 是最容易漏的一处：
// 代理结果必须走 fbproxy.WriteJSON，否则上游 JSON 里的 <、>、& 会被转成 \u003c，
// 「字节级透传」当场失效。
func TestSelfCheckProxyDoesNotEscapeUpstreamJSON(t *testing.T) {
	upstreamPayload := `{"success":true,"data":{"title":"<b>A & B</b>"}}`
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(upstreamPayload))
	}))
	defer upstream.Close()

	tokens, err := token.NewService(token.Dep{Secret: "0123456789abcdef", Env: "test"})
	if err != nil {
		t.Fatalf("构造令牌服务失败: %v", err)
	}
	proxy, err := fbproxy.New(fbproxy.Dep{
		UpstreamBase: upstream.URL + "/include/ajax.php",
		Tokens:       tokens,
		Warn:         func(any) {},
	})
	if err != nil {
		t.Fatalf("构造代理失败: %v", err)
	}

	server := newServer(t, func(dep *Dep) { dep.FBProxy = proxy })
	got := get(server, "/tg-api/fb/article/alist", nil)
	if got.Code != http.StatusOK {
		t.Fatalf("匿名只读代理应 200，实得 %d（%s）", got.Code, got.Body.String())
	}
	body := got.Body.String()
	if strings.Contains(body, `\u003c`) || strings.Contains(body, `\u003e`) || strings.Contains(body, `\u0026`) {
		t.Fatalf("上游 JSON 被 HTML 转义了：%s", body)
	}
	if !strings.Contains(body, "<b>A & B</b>") {
		t.Fatalf("上游内容应原样回写，实得 %s", body)
	}
	if strings.HasSuffix(body, "\n") {
		t.Fatal("响应体结尾不该有换行")
	}

	// 非 GET/POST 一律 405（Node 的 router.all + 方法闸门）。
	request := httptest.NewRequest(http.MethodPut, "/tg-api/fb/article/alist", nil)
	if put := call(server, request); put.Code != http.StatusMethodNotAllowed {
		t.Fatalf("PUT 应 405，实得 %d", put.Code)
	}

	// 不在白名单的动作必须 403，且不打上游。
	denied := get(server, "/tg-api/fb/member/userInfo", nil)
	if denied.Code != http.StatusForbidden {
		t.Fatalf("白名单外动作应 403，实得 %d", denied.Code)
	}
}

func TestSelfCheckProxyNotRegisteredWithoutUpstream(t *testing.T) {
	server := newServer(t, nil) // FBProxy 为 nil
	if got := get(server, "/tg-api/fb/article/alist", nil); got.Code != http.StatusNotFound {
		t.Fatalf("FB_UPSTREAM_URL 未配置时 /fb 必须不存在（404），实得 %d", got.Code)
	}
}

func TestSelfCheckAddrRoutesNeedAuth(t *testing.T) {
	withoutAuth := newServer(t, nil)
	if got := postJSON(withoutAuth, "/tg-api/addr/share", `{}`); got.Code != http.StatusNotFound {
		t.Fatalf("auth 未装配时 /addr 整段应为 404，实得 %d", got.Code)
	}
	if got := get(withoutAuth, "/tg-api/addr/shared/abc", nil); got.Code != http.StatusNotFound {
		t.Fatalf("auth 未装配时读取端点也应 404，实得 %d", got.Code)
	}
}

func TestSelfCheckAuthNotConfigured(t *testing.T) {
	server := newServer(t, nil)
	for _, item := range []struct{ path, body string }{
		{"/tg-api/auth/telegram", `{"initData":"x"}`},
		{"/tg-api/auth/logout", `{}`},
	} {
		got := postJSON(server, item.path, item.body)
		if got.Code != http.StatusServiceUnavailable {
			t.Fatalf("%s 在 auth 未装配时应 503，实得 %d", item.path, got.Code)
		}
		if !strings.Contains(got.Body.String(), `"code":"AUTH_NOT_CONFIGURED"`) {
			t.Fatalf("%s 应带 AUTH_NOT_CONFIGURED，实得 %s", item.path, got.Body.String())
		}
	}
}

func TestSelfCheckTmaStaticNeedsExistingDir(t *testing.T) {
	server := newServer(t, func(dep *Dep) {
		dep.TMAStaticDir = "/definitely/not/here"
	})
	if got := get(server, "/tma", nil); got.Code != http.StatusNotFound {
		t.Fatalf("目录不存在时 /tma 应 404，实得 %d", got.Code)
	}
}

func TestSelfCheckServicesShape(t *testing.T) {
	server := newServer(t, nil)
	got := get(server, "/tg-api/services", nil)
	if got.Code != http.StatusOK {
		t.Fatalf("应 200，实得 %d", got.Code)
	}
	if !strings.Contains(got.Body.String(), `"priceUsdt":21.5`) {
		t.Fatalf("浮点价格必须原样输出（不能变 21.500000 或 21）：%s", got.Body.String()[:200])
	}
	if !strings.Contains(got.Body.String(), `"priceUsdt":800`) {
		t.Fatalf("整数值不该带上 .0：%s", got.Body.String()[:200])
	}
}

func TestSelfCheckSecureRequestFollowsTrustProxy(t *testing.T) {
	request := httptest.NewRequest(http.MethodPost, "/tg-api/auth/bridge", nil)
	request.Header.Set("X-Forwarded-Proto", "https")

	// 不信任代理时 XFP 是客户端可伪造的头，必须无视。
	if SecureRequest(0)(request) {
		t.Fatal("hops=0 时不得采信 X-Forwarded-Proto")
	}
	if !SecureRequest(1)(request) {
		t.Fatal("hops>0 时应采信 X-Forwarded-Proto: https")
	}

	// 没有 XFP 时回落到连接本身（httptest 默认明文 http）。
	bare := httptest.NewRequest(http.MethodPost, "/tg-api/auth/bridge", nil)
	if SecureRequest(1)(bare) {
		t.Fatal("无 X-Forwarded-Proto 应回落 r.TLS（明文 http → false）")
	}

	// 列表取最左项（与 express 的 req.protocol 一致）。
	list := httptest.NewRequest(http.MethodPost, "/tg-api/auth/bridge", nil)
	list.Header.Set("X-Forwarded-Proto", "https, http")
	if !SecureRequest(1)(list) {
		t.Fatal("XFP 列表应以最左项为准")
	}
	httpFirst := httptest.NewRequest(http.MethodPost, "/tg-api/auth/bridge", nil)
	httpFirst.Header.Set("X-Forwarded-Proto", "http, https")
	if SecureRequest(1)(httpFirst) {
		t.Fatal("XFP 最左项是 http 时不应判成 https")
	}

	// 大小写不敏感（HTTP/1.1 里协议名大小写无意义）。
	upper := httptest.NewRequest(http.MethodPost, "/tg-api/auth/bridge", nil)
	upper.Header.Set("X-Forwarded-Proto", "HTTPS")
	if !SecureRequest(1)(upper) {
		t.Fatal("协议名应大小写不敏感")
	}
}

func TestSelfCheckClientKeyFollowsTrustProxy(t *testing.T) {
	plain := newServer(t, nil)
	request := httptest.NewRequest(http.MethodGet, "/tg-api/health", nil)
	request.RemoteAddr = "10.0.0.9:5555"
	request.Header.Set("X-Forwarded-For", "203.0.113.7")
	if got := plain.clientKey(request); got != "10.0.0.9" {
		t.Fatalf("未配置 trust proxy 时应只认 RemoteAddr，实得 %q", got)
	}

	trusted := newServer(t, func(dep *Dep) { dep.TrustProxyHops = 1 })
	if got := trusted.clientKey(request); got != "203.0.113.7" {
		t.Fatalf("信任 1 跳时应取 XFF 最后一个，实得 %q", got)
	}

	twoHops := httptest.NewRequest(http.MethodGet, "/tg-api/health", nil)
	twoHops.RemoteAddr = "10.0.0.9:5555"
	twoHops.Header.Set("X-Forwarded-For", "198.51.100.1, 203.0.113.7")
	if got := trusted.clientKey(twoHops); got != "203.0.113.7" {
		t.Fatalf("信任 1 跳时取链条倒数第二个（最近一跳代理写入的），实得 %q", got)
	}
}

func TestSelfCheckQueryStringsDropsRepeats(t *testing.T) {
	// Node 的 req.query 对重复 key 给数组，sanitizeParams 会丢弃非字符串值 ——
	// 所以「出现多次」的 key 在这里也要整个丢掉，两边过滤结果才一致。
	values, err := url.ParseQuery("a=1&a=2&b=3")
	if err != nil {
		t.Fatalf("解析失败: %v", err)
	}
	got := queryStrings(values)
	if _, exists := got["a"]; exists {
		t.Fatalf("重复 key 应被丢弃，实得 %v", got)
	}
	if got["b"] != "3" {
		t.Fatalf("单值 key 应保留，实得 %v", got)
	}
}

// TestSelfCheckCreateChargeMatchesNodeOnNonFiniteAmount 钉住两条「Node 与 Go 状态码不同」的分支。
//
//  1. 金额是「非数字字符串」→ Node 得 NaN，`NaN <= 0` 为 false 所以放行并回 200，
//     JSON.stringify 把 NaN 写成 null。Go 若让 NaN 进 encoding/json 会直接报错、
//     被 writeJSON 兜底成 500 —— 调用方能观测到状态码差异。
//  2. 金额是数组 → Node 的 Number([]) 是 0（空串），`0 <= 0` 为真 → 400；
//     Go 若把数组当 NaN 就会错误地放行。
func TestSelfCheckCreateChargeMatchesNodeOnNonFiniteAmount(t *testing.T) {
	server := newServer(t, func(dep *Dep) { dep.Payments = payment.New(payment.Dep{}) })

	// 非数字字符串：200 + null。
	recorder := postJSON(server, "/tg-api/payment/create-charge", `{"orderId":"NAN_1","amountUsdt":"abc"}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("amountUsdt=\"abc\" 应 200（Node 语义），实得 %d（%s）", recorder.Code, recorder.Body.String())
	}
	body := recorder.Body.String()
	if !strings.Contains(body, `"baseAmount":null`) || !strings.Contains(body, `"amountToPay":null`) {
		t.Fatalf("非有限金额必须序列化成 null，实际 %s", body)
	}

	// 对象：Number({}) 是 NaN → 同上，200 + null。
	recorder = postJSON(server, "/tg-api/payment/create-charge", `{"orderId":"NAN_2","amountUsdt":{}}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("amountUsdt={} 应 200，实得 %d（%s）", recorder.Code, recorder.Body.String())
	}

	// 空数组：Number([]) 是 0 → 400（不是 NaN，不能放行）。
	recorder = postJSON(server, "/tg-api/payment/create-charge", `{"orderId":"NAN_3","amountUsdt":[]}`)
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("amountUsdt=[] 应 400（Number([]) === 0），实得 %d（%s）", recorder.Code, recorder.Body.String())
	}

	// 单元素数组：Number([5]) 是 5 → 200，且 baseAmount 为 5。
	recorder = postJSON(server, "/tg-api/payment/create-charge", `{"orderId":"NAN_4","amountUsdt":[5]}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("amountUsdt=[5] 应 200（Number([5]) === 5），实得 %d（%s）", recorder.Code, recorder.Body.String())
	}
	if !strings.Contains(recorder.Body.String(), `"baseAmount":5`) {
		t.Fatalf("amountUsdt=[5] 的 baseAmount 应为 5，实际 %s", recorder.Body.String())
	}
}

// fakeCoinsTransport 让 coins.Client 打到固定响应，不用改 Dep 的注入面。
type fakeCoinsTransport struct{ depthBody string }

func (f fakeCoinsTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	body := `{"symbol":"USDTPHP","price":"62.5"}`
	if strings.Contains(req.URL.Path, "depth") {
		body = f.depthBody
	}
	return &http.Response{
		StatusCode: http.StatusOK,
		Header:     http.Header{"Content-Type": []string{"application/json"}},
		Body:       io.NopCloser(strings.NewReader(body)),
		Request:    req,
	}, nil
}

// TestSelfCheckOrderBookEmptyArraysNotNil 守住「空数组必须是 []」这条 brief 硬契约。
// Node 是 `(res.bids || []).map(...)`，上游给 null / 缺字段 / 类型不对时恒输出 []；
// Go 留 nil 会被写成 null，前端 `depth.bids[0]` 直接抛错。
func TestSelfCheckOrderBookEmptyArraysNotNil(t *testing.T) {
	cases := map[string]string{
		"null":    `{"symbol":"USDTPHP","lastUpdateId":1,"bids":null,"asks":null}`,
		"missing": `{"symbol":"USDTPHP","lastUpdateId":1}`,
		"wrong":   `{"symbol":"USDTPHP","lastUpdateId":1,"bids":"oops","asks":42}`,
	}
	for name, depthBody := range cases {
		t.Run(name, func(t *testing.T) {
			server := newServer(t, func(dep *Dep) {
				dep.Coins = coins.New(coins.Dep{
					HTTPClient: &http.Client{Transport: fakeCoinsTransport{depthBody: depthBody}},
				})
			})
			recorder := get(server, "/tg-api/rates/coins-ph", nil)
			if recorder.Code != http.StatusOK {
				t.Fatalf("应 200，实得 %d（%s）", recorder.Code, recorder.Body.String())
			}
			body := recorder.Body.String()
			if !strings.Contains(body, `"bids":[]`) || !strings.Contains(body, `"asks":[]`) {
				t.Fatalf("盘口空值必须输出 []，实际 %s", body)
			}
		})
	}
}

// TestSelfCheckTMACSPMatchesNodeSource 把「与 server.js 的 TMA_CSP 逐字一致」这句注释变成机器校验。
//
// 为什么要读 Node 源文件而不是抄一份字面量：抄字面量等于自己跟自己比，改一处错仍会全绿。
// 这条 CSP 的 style-src 曾经少一个 'self'（Node 是 `style-src 'self' 'unsafe-inline' ...`），
// 一旦启用 TMA_STATIC_DIR，同域 CSS 会被浏览器整段拦掉，表现是「页面能出但完全没样式」。
func TestSelfCheckTMACSPMatchesNodeSource(t *testing.T) {
	raw, err := os.ReadFile("../../../api/src/server.js")
	if err != nil {
		t.Fatalf("读取 Node 源失败（parity 校验需要它）：%v", err)
	}
	pattern := regexp.MustCompile(`(?s)const TMA_CSP = "([^"]*)"\s*\+\s*\n\s*"([^"]*)"`)
	matched := pattern.FindStringSubmatch(string(raw))
	if len(matched) != 3 {
		t.Fatal("没能在 server.js 里定位 TMA_CSP，parity 校验失效（先修正则，别删这条用例）")
	}
	want := matched[1] + matched[2]
	if tmaCSP != want {
		t.Fatalf("CSP 与 Node 不一致：\n node=%s\n   go=%s", want, tmaCSP)
	}
}

// TestSelfCheckTMARedirectCarriesHeaders 钉住「/tma 的 301 也要过 tmaHeaders」。
//
// Node 的 `app.use('/tma', ...)` 挂在 static 之前，对 redirect 同样加 CSP；
// Go 侧原来把 301 裸挂在 mux 上，浏览器跳转拿到的是一个没有 CSP 的响应。
func TestSelfCheckTMARedirectCarriesHeaders(t *testing.T) {
	dir := t.TempDir()
	if err := os.WriteFile(dir+"/index.html", []byte("<!doctype html><title>tma</title>"), 0o600); err != nil {
		t.Fatalf("准备静态目录失败: %v", err)
	}
	server := newServer(t, func(dep *Dep) { dep.TMAStaticDir = dir })

	recorder := get(server, "/tma", nil)
	if recorder.Code != http.StatusMovedPermanently {
		t.Fatalf("/tma 应 301，实得 %d", recorder.Code)
	}
	if location := recorder.Header().Get("Location"); location != "/tma/" {
		t.Fatalf("应跳 /tma/，实得 %q", location)
	}
	headers := recorder.Header()
	if headers.Get("Content-Security-Policy") != tmaCSP {
		t.Fatalf("301 也必须带 CSP，实得 %q", headers.Get("Content-Security-Policy"))
	}
	if headers.Get("X-Content-Type-Options") != "nosniff" {
		t.Fatal("301 也必须带 X-Content-Type-Options: nosniff")
	}
	if headers.Get("Cache-Control") != "no-cache" {
		t.Fatalf("301 落到入口页，Cache-Control 应为 no-cache，实得 %q", headers.Get("Cache-Control"))
	}
}

// TestSelfCheckBodyParsingFollowsContentType 是第 6 项（按 Content-Type 解析）的 e2e 证据。
//
// 同一个 JSON body：带 application/json → 正常建单；标成 text/plain → body 视为空 → 400。
// Node 的行为就是这样（express.json 只在类型匹配时接管），之前的首字节嗅探看不出差别。
func TestSelfCheckBodyParsingFollowsContentType(t *testing.T) {
	server := newServer(t, func(dep *Dep) { dep.Payments = payment.New(payment.Dep{}) })
	const body = `{"orderId":"BODY_1","amountUsdt":10}`

	jsonReq := httptest.NewRequest(http.MethodPost, "/tg-api/payment/create-charge", strings.NewReader(body))
	jsonReq.Header.Set("Content-Type", "application/json; charset=utf-8")
	if recorder := call(server, jsonReq); recorder.Code != http.StatusOK {
		t.Fatalf("application/json 应 200，实得 %d（%s）", recorder.Code, recorder.Body.String())
	}

	plainReq := httptest.NewRequest(http.MethodPost, "/tg-api/payment/create-charge", strings.NewReader(body))
	plainReq.Header.Set("Content-Type", "text/plain")
	if recorder := call(server, plainReq); recorder.Code != http.StatusBadRequest {
		t.Fatalf("text/plain 的 body 不该被解析（应 400），实得 %d（%s）", recorder.Code, recorder.Body.String())
	}

	// 表单体：url.ParseQuery 解析后同样是字符串字段。
	formReq := httptest.NewRequest(http.MethodPost, "/tg-api/payment/create-charge",
		strings.NewReader("orderId=BODY_2&amountUsdt=10"))
	formReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	if recorder := call(server, formReq); recorder.Code != http.StatusOK {
		t.Fatalf("表单体应 200，实得 %d（%s）", recorder.Code, recorder.Body.String())
	}
}

// zeroPriceTransport 让行情返回 0，从而把 /rates/convert 逼到「除零得 +Inf」那条路。
type zeroPriceTransport struct{}

func (zeroPriceTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	body := `{"symbol":"USDTPHP","price":"0"}`
	if strings.Contains(req.URL.Path, "depth") {
		body = `{"symbol":"USDTPHP","lastUpdateId":1,"bids":[["62.50","1"]],"asks":[]}`
	}
	return &http.Response{
		StatusCode: http.StatusOK,
		Header:     http.Header{"Content-Type": []string{"application/json"}},
		Body:       io.NopCloser(strings.NewReader(body)),
		Request:    req,
	}, nil
}

// TestSelfCheckRatesConvertInfBecomesNull 钉住「除零得 Inf → null」。
//
// Node：`1/0` 是 Infinity，JSON.stringify 写成 null（200）。
// Go：encoding/json 对 Inf 直接报错，落到 writeJSON 兜底就是 500 —— 同一个请求两种状态码。
func TestSelfCheckRatesConvertInfBecomesNull(t *testing.T) {
	server := newServer(t, func(dep *Dep) {
		dep.Coins = coins.New(coins.Dep{HTTPClient: &http.Client{Transport: zeroPriceTransport{}}})
	})
	recorder := get(server, "/tg-api/rates/convert?php=100", nil)
	if recorder.Code != http.StatusOK {
		t.Fatalf("应 200（Node 语义），实得 %d（%s）", recorder.Code, recorder.Body.String())
	}
	body := recorder.Body.String()
	if !strings.Contains(body, `"usdt":null`) {
		t.Fatalf("Inf 必须序列化成 null，实际 %s", body)
	}
}
