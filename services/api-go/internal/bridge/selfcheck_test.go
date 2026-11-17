// 契约护栏（不是临时自检）：用例锁定与 Node 版逐字对齐的对外行为 —— 状态码、错误码、
// JSON 字段名与字段顺序、空数组形态。改实现前先看这里；合并前不要按临时文件删。
package bridge

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"regexp"
	"strings"
	"testing"
)

type fakeLogin struct {
	status int
	body   any
	got    string
}

func (f *fakeLogin) Login(_ context.Context, initData string) (int, any) {
	f.got = initData
	return f.status, f.body
}

func newTestRoute(t *testing.T, login LoginService, creds func(context.Context, int64) (string, error)) *Route {
	t.Helper()
	route, err := New(Dep{
		BotToken:           "123456:TEST",
		LoginService:       login,
		CredentialProvider: creds,
		CookieDomain:       ".example.com",
		MaxAge:             86400,
		ForceSecure:        true,
		DefaultTarget:      "/",
		Warn:               func(any) {},
	})
	if err != nil {
		t.Fatalf("构造登录桥失败: %v", err)
	}
	return route
}

// loginBodyOK 是登录成功的响应体（含一个不该被透给浏览器的 token）。
func loginBodyOK(memberID int64) any {
	return map[string]any{
		"success": true,
		"data":    map[string]any{"token": "SHOULD_NOT_LEAK", "memberId": memberID, "expiresAt": 1},
	}
}

func TestSelfCheckSanitizeTargetRejectsOpenRedirect(t *testing.T) {
	cases := map[string]string{
		"//evil.com":                    "/",
		"/\\evil.com":                   "/",
		"/a\\b":                         "/",
		"https://evil.com":              "/",
		"/redirect?to=https://evil.com": "/", // 含 :// 一律回落
		"/@evil.com":                    "/",
		"evil.com/path":                 "/",
		"":                              "/",
		"/\x00x":                        "/",
		"/order/1":                      "/order/1",
		"/":                             "/",
	}
	for input, want := range cases {
		if got := SanitizeTarget(input, "/"); got != want {
			t.Fatalf("SanitizeTarget(%q) = %q，期望 %q", input, got, want)
		}
	}
	// 长度按 UTF-16 码元算：200 个 ASCII 放行，201 个回落。
	if got := SanitizeTarget("/"+strings.Repeat("a", 199), "/"); got == "/" {
		t.Fatal("200 字符的路径应放行")
	}
	if got := SanitizeTarget("/"+strings.Repeat("a", 200), "/"); got != "/" {
		t.Fatal("201 字符的路径必须回落")
	}
}

func TestSelfCheckEscapeHTMLMatchesNodeEntities(t *testing.T) {
	// 五个实体必须与 Node 的 escapeHtml 逐字一致：`"` 是 &quot; 而不是 &#34;。
	got := EscapeHTML(`<a href="x">'&'</a>`)
	want := `&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;`
	if got != want {
		t.Fatalf("EscapeHTML = %q，期望 %q", got, want)
	}
}

func TestSelfCheckNotConfiguredReturns503(t *testing.T) {
	route, err := New(Dep{Warn: func(any) {}})
	if err != nil {
		t.Fatalf("缺配置不该返回 error（要能降级启动）: %v", err)
	}
	if !route.NotConfigured() {
		t.Fatal("缺全部配置时必须标成 notConfigured")
	}

	recorder := httptest.NewRecorder()
	route.GetLanding(recorder, httptest.NewRequest(http.MethodGet, "/tg-api/auth/bridge", nil))
	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("落地页应 503，实得 %d", recorder.Code)
	}
	// 公网页面里不能出现环境变量名：那是内部拓扑。
	if strings.Contains(recorder.Body.String(), "TMA_BRIDGE_COOKIE_DOMAIN") {
		t.Fatal("错误页不得暴露环境变量名")
	}
	if body := recorder.Body.String(); !strings.Contains(body, "BRIDGE_NOT_CONFIGURED") {
		t.Fatalf("错误页应带码 BRIDGE_NOT_CONFIGURED，实得 %q", body)
	}
}

func TestSelfCheckLandingPageHeadersAndNonce(t *testing.T) {
	route := newTestRoute(t, &fakeLogin{}, func(context.Context, int64) (string, error) { return "", nil })

	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/tg-api/auth/bridge?to=/order/9", nil)
	route.GetLanding(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("落地页应 200，实得 %d", recorder.Code)
	}
	headers := recorder.Header()
	if headers.Get("Cache-Control") != "no-store" {
		t.Fatalf("Cache-Control 应为 no-store，实得 %q", headers.Get("Cache-Control"))
	}
	if headers.Get("Referrer-Policy") != "no-referrer" {
		t.Fatalf("Referrer-Policy 应为 no-referrer，实得 %q", headers.Get("Referrer-Policy"))
	}
	if headers.Get("X-Content-Type-Options") != "nosniff" {
		t.Fatalf("X-Content-Type-Options 应为 nosniff")
	}
	if !strings.HasPrefix(headers.Get("Content-Type"), "text/html") {
		t.Fatalf("Content-Type 应为 text/html，实得 %q", headers.Get("Content-Type"))
	}

	csp := headers.Get("Content-Security-Policy")
	matched := regexp.MustCompile(`'nonce-([^']+)'`).FindStringSubmatch(csp)
	if matched == nil {
		t.Fatalf("CSP 里应带 nonce，实得 %q", csp)
	}
	nonce := matched[1]
	decoded, err := base64.StdEncoding.DecodeString(nonce)
	if err != nil || len(decoded) != 16 {
		t.Fatalf("nonce 必须是 16 字节 base64.StdEncoding，实得 %q（err=%v）", nonce, err)
	}
	if !strings.Contains(recorder.Body.String(), `nonce="`+nonce+`"`) {
		t.Fatal("页面里的 nonce 必须与 CSP 头一致")
	}
	if !strings.Contains(recorder.Body.String(), `value="/order/9"`) {
		t.Fatal("to 应回填进表单")
	}

	// 每次请求换新 nonce：复用会让「一次 XSS 永久可用」。
	second := httptest.NewRecorder()
	route.GetLanding(second, httptest.NewRequest(http.MethodGet, "/tg-api/auth/bridge", nil))
	if second.Header().Get("Content-Security-Policy") == csp {
		t.Fatal("nonce 必须每次请求重新生成")
	}
}

func TestSelfCheckLandingPageRejectsOffsiteTarget(t *testing.T) {
	route := newTestRoute(t, &fakeLogin{}, func(context.Context, int64) (string, error) { return "", nil })
	recorder := httptest.NewRecorder()
	route.GetLanding(recorder, httptest.NewRequest(http.MethodGet, "/tg-api/auth/bridge?to=//evil.com", nil))
	if strings.Contains(recorder.Body.String(), "evil.com") {
		t.Fatal("越界 to 必须回落默认页，不能出现在 HTML 里")
	}
}

func postBridge(t *testing.T, route *Route, form url.Values, headers map[string]string) *httptest.ResponseRecorder {
	t.Helper()
	request := httptest.NewRequest(http.MethodPost, "/tg-api/auth/bridge", strings.NewReader(form.Encode()))
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	request.Host = "canary.example.com"
	for key, value := range headers {
		request.Header.Set(key, value)
	}
	recorder := httptest.NewRecorder()
	route.PostBridge(recorder, request)
	return recorder
}

func TestSelfCheckBlockedReasons(t *testing.T) {
	login := &fakeLogin{status: http.StatusOK, body: loginBodyOK(42)}
	route := newTestRoute(t, login, func(context.Context, int64) (string, error) { return "login_user=abc", nil })

	cases := []struct {
		name    string
		headers map[string]string
	}{
		{"origin_mismatch", map[string]string{"Origin": "https://evil.com"}},
		{"origin_null", map[string]string{"Origin": "null"}},
		{"sec_fetch_cross_site", map[string]string{"Sec-Fetch-Site": "cross-site"}},
		{"referer_mismatch", map[string]string{"Referer": "https://evil.com/x"}},
		{"no_origin_headers", map[string]string{}},
	}
	for _, item := range cases {
		recorder := postBridge(t, route, url.Values{"initData": {"x"}}, item.headers)
		if recorder.Code != http.StatusForbidden {
			t.Fatalf("%s 应 403，实得 %d", item.name, recorder.Code)
		}
		if recorder.Header().Get("Set-Cookie") != "" {
			t.Fatalf("%s 不得下发 Cookie", item.name)
		}
		if !strings.Contains(recorder.Body.String(), "CROSS_SITE_BLOCKED") {
			t.Fatalf("%s 的错误页应带 CROSS_SITE_BLOCKED", item.name)
		}
	}
	// 被拦下的请求不该消耗 loginService（HMAC + 网关往返都是成本）。
	if login.got != "" {
		t.Fatal("跨站请求不得调用 loginService")
	}
}

func TestSelfCheckSuccessSetsCookieAndRedirects(t *testing.T) {
	login := &fakeLogin{status: http.StatusOK, body: loginBodyOK(42)}
	route := newTestRoute(t, login, func(_ context.Context, memberID int64) (string, error) {
		if memberID != 42 {
			t.Fatalf("应把 memberId 透给凭证提供者，实得 %d", memberID)
		}
		return "HN_login_user=YWJj", nil
	})

	recorder := postBridge(t, route,
		url.Values{"initData": {"hash=abc"}, "to": {"/order/7"}},
		map[string]string{"Origin": "https://canary.example.com"})

	if recorder.Code != http.StatusFound {
		t.Fatalf("成功应 302，实得 %d（body=%q）", recorder.Code, recorder.Body.String())
	}
	if location := recorder.Header().Get("Location"); location != "/order/7" {
		t.Fatalf("Location 应为 /order/7，实得 %q", location)
	}
	cookie := recorder.Header().Get("Set-Cookie")
	want := "HN_login_user=YWJj; Path=/; Domain=.example.com; Max-Age=86400; SameSite=Lax; Secure"
	if cookie != want {
		t.Fatalf("Set-Cookie = %q\n期望 %q", cookie, want)
	}
	// 火鸟 login_user 非 HttpOnly（H5 多处 JS 要读它），这里必须没有 HttpOnly。
	if strings.Contains(cookie, "HttpOnly") {
		t.Fatal("Set-Cookie 不得带 HttpOnly")
	}
	// 桥只取 memberId，loginService 签发的 token 必须丢弃。
	if strings.Contains(recorder.Body.String(), "SHOULD_NOT_LEAK") ||
		strings.Contains(cookie, "SHOULD_NOT_LEAK") ||
		strings.Contains(recorder.Header().Get("Location"), "SHOULD_NOT_LEAK") {
		t.Fatal("桥不得把 loginService 的 token 透给浏览器")
	}
	if login.got != "hash=abc" {
		t.Fatalf("initData 应原样交给 loginService，实得 %q", login.got)
	}
}

func TestSelfCheckInitDataMustComeFromBody(t *testing.T) {
	login := &fakeLogin{status: http.StatusOK, body: loginBodyOK(42)}
	route := newTestRoute(t, login, func(context.Context, int64) (string, error) { return "login_user=abc", nil })

	// query 里的 initData 不算：它一定会进 URL / Referer / 代理日志。
	request := httptest.NewRequest(http.MethodPost, "/tg-api/auth/bridge?initData=leaky", strings.NewReader(""))
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	request.Header.Set("Origin", "https://canary.example.com")
	request.Host = "canary.example.com"
	recorder := httptest.NewRecorder()
	route.PostBridge(recorder, request)

	if login.got != "" {
		t.Fatalf("query 里的 initData 不得被采信，实得 %q", login.got)
	}
}

func TestSelfCheckLoginFailureMapsToErrorPage(t *testing.T) {
	login := &fakeLogin{
		status: http.StatusUnauthorized,
		body: map[string]any{
			"success": false,
			"error":   map[string]any{"code": "INVALID_INIT_DATA", "message": "登录校验失败，请重新打开"},
		},
	}
	route := newTestRoute(t, login, func(context.Context, int64) (string, error) {
		t.Fatal("登录失败时不该去换凭证")
		return "", nil
	})

	recorder := postBridge(t, route, url.Values{"initData": {"x"}},
		map[string]string{"Origin": "https://canary.example.com"})

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("应按 loginService 的状态码转错误页，实得 %d", recorder.Code)
	}
	if recorder.Header().Get("Set-Cookie") != "" {
		t.Fatal("登录失败不得下发 Cookie")
	}
	if location := recorder.Header().Get("Location"); location != "" {
		t.Fatalf("登录失败不得 302，实得 Location=%q", location)
	}
	body := recorder.Body.String()
	if !strings.Contains(body, "INVALID_INIT_DATA") || !strings.Contains(body, "登录校验失败") {
		t.Fatalf("错误页应带 code 与 message，实得 %q", body)
	}
}

func TestSelfCheckCredentialFailureIsFatalButClean(t *testing.T) {
	badCookies := map[string]string{
		"带分号": "login_user=abc; Domain=evil.com",
		"带换行": "login_user=abc\r\nX-Injected: 1",
		"空值":  "",
		"无等号": "login_user",
	}
	for name, cookie := range badCookies {
		login := &fakeLogin{status: http.StatusOK, body: loginBodyOK(42)}
		route := newTestRoute(t, login, func(context.Context, int64) (string, error) { return cookie, nil })

		recorder := postBridge(t, route, url.Values{"initData": {"x"}},
			map[string]string{"Origin": "https://canary.example.com"})

		if recorder.Code != http.StatusBadGateway {
			t.Fatalf("%s 应 502，实得 %d", name, recorder.Code)
		}
		if recorder.Header().Get("Set-Cookie") != "" {
			t.Fatalf("%s：502 不能和合法凭证同时出现", name)
		}
		if !strings.Contains(recorder.Body.String(), "BRIDGE_FAILED") {
			t.Fatalf("%s 的错误页应带 BRIDGE_FAILED", name)
		}
	}
}

func TestSelfCheckSecureDependsOnForceSecure(t *testing.T) {
	login := &fakeLogin{status: http.StatusOK, body: loginBodyOK(42)}
	route, err := New(Dep{
		BotToken:           "123456:TEST",
		LoginService:       login,
		CredentialProvider: func(context.Context, int64) (string, error) { return "login_user=abc", nil },
		CookieDomain:       ".example.com",
		ForceSecure:        false,
		Warn:               func(any) {},
	})
	if err != nil {
		t.Fatalf("构造失败: %v", err)
	}
	recorder := postBridge(t, route, url.Values{"initData": {"x"}},
		map[string]string{"Origin": "https://canary.example.com"})
	if strings.Contains(recorder.Header().Get("Set-Cookie"), "Secure") {
		t.Fatal("forceSecure=false 且非 https 时不该加 Secure（本地 http 调试）")
	}
}

// TestSelfCheckInjectedIsSecureAddsSecure 覆盖「TLS 在反代终止」的生产链路：
// 到容器的连接是明文 http，但 X-Forwarded-Proto 说 https，凭证必须带 Secure。
func TestSelfCheckInjectedIsSecureAddsSecure(t *testing.T) {
	route, err := New(Dep{
		BotToken:           "123456:TEST",
		LoginService:       &fakeLogin{status: http.StatusOK, body: loginBodyOK(42)},
		CredentialProvider: func(context.Context, int64) (string, error) { return "login_user=abc", nil },
		CookieDomain:       ".example.com",
		ForceSecure:        false,
		// 装配层注入的实现：信任代理后读 X-Forwarded-Proto。
		IsSecure: func(req *http.Request) bool {
			return strings.EqualFold(req.Header.Get("X-Forwarded-Proto"), "https")
		},
		Warn: func(any) {},
	})
	if err != nil {
		t.Fatalf("构造失败: %v", err)
	}

	secure := postBridge(t, route, url.Values{"initData": {"x"}},
		map[string]string{"Origin": "https://canary.example.com", "X-Forwarded-Proto": "https"})
	if !strings.Contains(secure.Header().Get("Set-Cookie"), "Secure") {
		t.Fatalf("X-Forwarded-Proto=https 时凭证必须带 Secure，实得 %q", secure.Header().Get("Set-Cookie"))
	}

	plain := postBridge(t, route, url.Values{"initData": {"x"}},
		map[string]string{"Origin": "https://canary.example.com", "X-Forwarded-Proto": "http"})
	if strings.Contains(plain.Header().Get("Set-Cookie"), "Secure") {
		t.Fatalf("X-Forwarded-Proto=http 时不该加 Secure，实得 %q", plain.Header().Get("Set-Cookie"))
	}
}

// TestSelfCheckForceSecureOverridesIsSecure：ForceSecure 为 true 时无视一切协议判定。
func TestSelfCheckForceSecureOverridesIsSecure(t *testing.T) {
	route := newTestRoute(t, &fakeLogin{status: http.StatusOK, body: loginBodyOK(42)},
		func(context.Context, int64) (string, error) { return "login_user=abc", nil })
	recorder := postBridge(t, route, url.Values{"initData": {"x"}},
		map[string]string{"Origin": "https://canary.example.com", "X-Forwarded-Proto": "http"})
	if !strings.Contains(recorder.Header().Get("Set-Cookie"), "Secure") {
		t.Fatalf("forceSecure=true 时必须带 Secure，实得 %q", recorder.Header().Get("Set-Cookie"))
	}
}

func TestSelfCheckInvalidCookieDomainIsRejectedAtConstruction(t *testing.T) {
	// 格式非法的 Domain 会被浏览器静默丢整条 Set-Cookie（表现是「点了没反应」），
	// 所以必须降级成 notConfigured 而不是照常下发。
	route, err := New(Dep{
		BotToken:           "123456:TEST",
		LoginService:       &fakeLogin{},
		CredentialProvider: func(context.Context, int64) (string, error) { return "", nil },
		CookieDomain:       "evil.com; Domain=other.com",
		Warn:               func(any) {},
	})
	if err != nil {
		t.Fatalf("不该返回 error: %v", err)
	}
	if !route.NotConfigured() {
		t.Fatal("非法 Cookie Domain 必须标成 notConfigured")
	}
}

func TestSelfCheckBlockedLogCarriesNoSecrets(t *testing.T) {
	var logged []byte
	route, err := New(Dep{
		BotToken:           "123456:TEST",
		LoginService:       &fakeLogin{},
		CredentialProvider: func(context.Context, int64) (string, error) { return "", nil },
		CookieDomain:       ".example.com",
		Warn:               func(value any) { logged, _ = json.Marshal(value) },
	})
	if err != nil {
		t.Fatalf("构造失败: %v", err)
	}
	postBridge(t, route, url.Values{"initData": {"SECRET_INIT_DATA"}},
		map[string]string{"Origin": "https://evil.com", "User-Agent": "SomeBrowser/1.0"})

	line := string(logged)
	if !strings.Contains(line, "bridge_blocked") || !strings.Contains(line, "origin_mismatch") {
		t.Fatalf("打点应带 event/reason，实得 %q", line)
	}
	for _, forbidden := range []string{"SECRET_INIT_DATA", "SomeBrowser", "123456:TEST"} {
		if strings.Contains(line, forbidden) {
			t.Fatalf("打点不得包含 %q，实得 %q", forbidden, line)
		}
	}
}

// TestSelfCheckLoginBackendFailureIsBridgeFailed 钉住「登录编排后端故障 → 502 BRIDGE_FAILED」。
//
// Node 里 loginService.login 在重放计数/member 映射/审计失败时是**抛错**，由 bridge 的
// catch 统一成 502 BRIDGE_FAILED；Go 的登录编排把这些情况收敛成「返回 502 + LOGIN_FAILED」，
// 所以桥必须把 502 翻译成 BRIDGE_FAILED，而不是把 LOGIN_FAILED 原样透出去。
// 同时确认：失败路径先清 Set-Cookie —— 502 配一个合法凭证是最糟的组合。
func TestSelfCheckLoginBackendFailureIsBridgeFailed(t *testing.T) {
	login := &fakeLogin{
		status: http.StatusBadGateway,
		body:   map[string]any{"success": false, "error": map[string]any{"code": "LOGIN_FAILED", "message": "Login temporarily unavailable"}},
	}
	route := newTestRoute(t, login, func(context.Context, int64) (string, error) { return "login_user=abc", nil })

	recorder := postBridge(t, route, url.Values{"initData": {"x"}},
		map[string]string{"Origin": "https://canary.example.com"})
	if recorder.Code != http.StatusBadGateway {
		t.Fatalf("应 502，实得 %d（%s）", recorder.Code, recorder.Body.String())
	}
	if recorder.Header().Get("Set-Cookie") != "" {
		t.Fatal("失败路径不得下发 Cookie")
	}
	body := recorder.Body.String()
	if !strings.Contains(body, "BRIDGE_FAILED") {
		t.Fatalf("错误页应带 BRIDGE_FAILED（Node 的 catch 分支），实得 %q", body)
	}
	if strings.Contains(body, "LOGIN_FAILED") {
		t.Fatal("LOGIN_FAILED 是 /auth/telegram 的口径，桥侧不该透出")
	}
}

// TestSelfCheckBridgeAcceptsJSONBody 钉住「JSON 体与表单同等对待」。
//
// Node 的 req.body 由全局 express.json + express.urlencoded 产出，桥不关心调用方用哪种；
// 之前 Go 侧只 ParseForm，发 JSON 的调用方会被静默降级成「没有 initData」→ 401。
func TestSelfCheckBridgeAcceptsJSONBody(t *testing.T) {
	login := &fakeLogin{status: http.StatusOK, body: loginBodyOK(42)}
	route := newTestRoute(t, login, func(context.Context, int64) (string, error) { return "login_user=abc", nil })

	request := httptest.NewRequest(http.MethodPost, "/tg-api/auth/bridge",
		strings.NewReader(`{"initData":"from-json","to":"/order/1"}`))
	request.Header.Set("Content-Type", "application/json")
	request.Host = "canary.example.com"
	request.Header.Set("Origin", "https://canary.example.com")
	recorder := httptest.NewRecorder()
	route.PostBridge(recorder, request)

	if login.got != "from-json" {
		t.Fatalf("JSON 体里的 initData 必须被读到，实得 %q（状态码 %d）", login.got, recorder.Code)
	}
	if recorder.Code != http.StatusFound {
		t.Fatalf("合法请求应 302，实得 %d（%s）", recorder.Code, recorder.Body.String())
	}
	if location := recorder.Header().Get("Location"); location != "/order/1" {
		t.Fatalf("应跳到 body 里的 to，实得 %q", location)
	}
}

// TestSelfCheckBridgeIgnoresNonStringInitData 记录「非字符串值视为不可用」。
func TestSelfCheckBridgeIgnoresNonStringInitData(t *testing.T) {
	login := &fakeLogin{status: http.StatusUnauthorized,
		body: map[string]any{"success": false, "error": map[string]any{"code": "INVALID_INIT_DATA", "message": "bad"}}}
	route := newTestRoute(t, login, func(context.Context, int64) (string, error) { return "login_user=abc", nil })

	request := httptest.NewRequest(http.MethodPost, "/tg-api/auth/bridge",
		strings.NewReader(`{"initData":{"query_id":"x"}}`))
	request.Header.Set("Content-Type", "application/json")
	request.Host = "canary.example.com"
	request.Header.Set("Origin", "https://canary.example.com")
	recorder := httptest.NewRecorder()
	route.PostBridge(recorder, request)

	if login.got != "" {
		t.Fatalf("对象形态的 initData 应视为缺失，实得 %q", login.got)
	}
	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("应 401，实得 %d", recorder.Code)
	}
}
