// 登录桥（TAPD 1162017416001000002）的正式测试套件。
// 逐条翻译自 services/api/test/bridge-route.test.js 的 27 条行为用例
// （第 28 条是 Node 源码级正则，Go 侧无对应物，改由「包内不引用 token 服务」的结构性事实保证）。
//
// 与 Node 版的映射：
//   - Node 用 req/res stub；Go 用 httptest.NewRecorder + 真实 *http.Request，
//     状态码、Set-Cookie、Location 都从真实 header 读，比 stub 的自建对象更硬。
//   - Node 的 `forceSecure` 默认 true 在 createBridgeRoute 内部；Go 把它放在装配层
//     （cmd/api/main.go 的 TMA_BRIDGE_FORCE_SECURE != "false"），所以 brDefaultDep 显式置 true，
//     否则默认零值 false 会让「Secure 必须存在」这条断言失去意义。
//   - Node 的 console.* 捕获在 Go 侧对应 Dep.Warn：这是包内唯一的日志出口。
package bridge

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"net/url"
	"regexp"
	"strings"
	"testing"
)

// 假值，绝不使用真实 bot token / 真实凭证（与 Node 同名同值）。
const (
	brCookie     = "HN_login_user=QUJD+/=="
	brNodeToken  = "NODE_FAKE_TOKEN_SHOULD_NEVER_REACH_BROWSER"
	brDomain     = "fbird.men"
	brSiteOrigin = "https://" + brDomain
	brMemberID   = int64(5)
	// brHost 是 Node makeReq 里的「没有 Host 头」：httptest 默认 example.com，
	// 它不属于 fbird.men 集合，等价于空值。
	brHost = "example.com"
)

// stubLogin 是 loginService 的替身：记录每次 initData，可按脚本返回。
type stubLogin struct {
	calls []string
	fn    func(initData string) (int, any)
}

func (s *stubLogin) Login(_ context.Context, initData string) (int, any) {
	s.calls = append(s.calls, initData)
	if s.fn != nil {
		return s.fn(initData)
	}
	return http.StatusOK, brOKBody()
}

func (s *stubLogin) count() int { return len(s.calls) }

// brOKBody 是登录成功的响应体：里面那个 token 必须被桥丢弃，不得到达浏览器。
func brOKBody() any {
	return map[string]any{
		"success": true,
		"data": map[string]any{
			"token":     brNodeToken,
			"expiresAt": "2099-01-01",
			"memberId":  brMemberID,
		},
	}
}

// brFailBody 是 loginService 的失败体（Node 用同样的 code/message）。
func brFailBody(code, message string) any {
	return map[string]any{
		"success": false,
		"error":   map[string]any{"code": code, "message": message},
	}
}

// brDefaultDep 对应 Node 的 makeDeps()：每一项都可被用例覆盖。
func brDefaultDep() Dep {
	return Dep{
		BotToken:           "FAKE_BOT_TOKEN",
		LoginService:       &stubLogin{},
		CredentialProvider: func(context.Context, int64) (string, error) { return brCookie, nil },
		CookieDomain:       brDomain,
		// Node createBridgeRoute 的默认值；装配层的等价物见 cmd/api/main.go。
		ForceSecure: true,
		Warn:        func(any) {},
	}
}

func brBuild(t *testing.T, dep Dep) *Route {
	t.Helper()
	route, err := New(dep)
	if err != nil {
		t.Fatalf("构造登录桥失败: %v", err)
	}
	return route
}

// brResponse 是一次请求的全部可观测结果。
type brResponse struct {
	status  int
	headers http.Header
	body    string
}

func (r brResponse) cookie() string   { return r.headers.Get("Set-Cookie") }
func (r brResponse) location() string { return r.headers.Get("Location") }

// brPost 发一次桥上 POST。headers 里的 "Host" 键写进 req.Host（对应 Node stub 的 headers.host）。
func brPost(t *testing.T, route *Route, form url.Values, headers map[string]string) brResponse {
	t.Helper()
	request := httptest.NewRequest(http.MethodPost, "http://"+brHost+defaultPostPath, strings.NewReader(form.Encode()))
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	for key, value := range headers {
		if strings.EqualFold(key, "Host") {
			request.Host = value
			continue
		}
		request.Header.Set(key, value)
	}
	recorder := httptest.NewRecorder()
	route.PostBridge(recorder, request)
	return brResponse{status: recorder.Code, headers: recorder.Header(), body: recorder.Body.String()}
}

// brSitePost 带本站 Origin 的 POST：现代浏览器的站内表单提交就是这种形态。
func brSitePost(t *testing.T, route *Route, form url.Values) brResponse {
	t.Helper()
	return brPost(t, route, form, map[string]string{"Origin": brSiteOrigin})
}

func brGet(t *testing.T, route *Route, query url.Values) brResponse {
	t.Helper()
	target := "http://" + brHost + defaultPostPath
	if encoded := query.Encode(); encoded != "" {
		target += "?" + encoded
	}
	recorder := httptest.NewRecorder()
	route.GetLanding(recorder, httptest.NewRequest(http.MethodGet, target, nil))
	return brResponse{status: recorder.Code, headers: recorder.Header(), body: recorder.Body.String()}
}

// brBlocked 断言「被来源闸门拦下」的完整后果：403 + 无凭证 + 无跳转 + 不消耗登录编排。
//
// 最后一条（loginService 调用次数为 0）是这套闸门的核心价值：
// 跨站请求不该消耗 HMAC 校验与网关往返。
func brBlocked(t *testing.T, response brResponse, login *stubLogin) {
	t.Helper()
	if response.status != http.StatusForbidden {
		t.Fatalf("status = %d, want 403（body=%q）", response.status, response.body)
	}
	if cookie := response.cookie(); cookie != "" {
		t.Fatalf("闸门拦截后不得下发 Set-Cookie，实得 %q", cookie)
	}
	if location := response.location(); location != "" {
		t.Fatalf("闸门拦截后不得 302，实得 Location=%q", location)
	}
	if !strings.Contains(response.body, "CROSS_SITE_BLOCKED") {
		t.Fatalf("错误页应带 CROSS_SITE_BLOCKED，实得 %q", response.body)
	}
	if login.count() != 0 {
		t.Fatalf("闸门拦截后不得触达 loginService，实际调用了 %d 次（initData=%q）", login.count(), login.calls)
	}
}

// brRedirect 断言成功路径的状态与跳转目标。
func brRedirect(t *testing.T, response brResponse, want string) {
	t.Helper()
	if response.status != http.StatusFound {
		t.Fatalf("status = %d, want 302（body=%q）", response.status, response.body)
	}
	if location := response.location(); location != want {
		t.Fatalf("Location = %q, want %q", location, want)
	}
}

// brForm 是「只带 initData」的最简表单，对应 Node 的 { body: { initData: 'x' } }。
func brForm(initData string) url.Values { return url.Values{"initData": {initData}} }

// errIssueSession 模拟网关 issue_session 失败：桥只记固定消息，不记 err 对象。
var errIssueSession = errors.New("issue_session failed")

func TestBridgeRoute(t *testing.T) {
	t.Run("跨站 Origin（https://evil.example）→ 403，无 Set-Cookie、无 302", func(t *testing.T) {
		login := &stubLogin{}
		dep := brDefaultDep()
		dep.LoginService = login
		route := brBuild(t, dep)

		response := brPost(t, route, brForm("x"), map[string]string{"Origin": "https://evil.example"})
		brBlocked(t, response, login)
	})

	t.Run("Origin 缺失 + Sec-Fetch-Site: cross-site → 403，无 Set-Cookie、无 302", func(t *testing.T) {
		login := &stubLogin{}
		dep := brDefaultDep()
		dep.LoginService = login
		route := brBuild(t, dep)

		response := brPost(t, route, brForm("x"), map[string]string{"Sec-Fetch-Site": "cross-site"})
		brBlocked(t, response, login)
	})

	t.Run("Origin 与 Sec-Fetch-Site 全缺 → fail-closed 403，无 Set-Cookie、无 302", func(t *testing.T) {
		login := &stubLogin{}
		dep := brDefaultDep()
		dep.LoginService = login
		route := brBuild(t, dep)

		response := brPost(t, route, brForm("x"), nil)
		brBlocked(t, response, login)

		// 任务书点名要求：`Origin: null` 必须 403。沙箱 iframe / file:// 会发这个值，
		// url.Parse 拿不到 Host，走 origin_unparseable 分支，不能被当成「没有 Origin」。
		nullOrigin := brPost(t, route, brForm("x"), map[string]string{"Origin": "null"})
		brBlocked(t, nullOrigin, login)
	})

	t.Run("同站 Origin（根域 / www / 请求 Host / http 变体）放行 → 302", func(t *testing.T) {
		for _, origin := range []string{brSiteOrigin, "http://" + brDomain, "https://www." + brDomain} {
			response := brPost(t, brBuild(t, brDefaultDep()), brForm("x"), map[string]string{"Origin": origin})
			if response.status != http.StatusFound {
				t.Fatalf("origin=%s：status = %d, want 302（body=%q）", origin, response.status, response.body)
			}
		}
		// 请求 Host 本身在本域下时，它也进允许集合（api.fbird.men 反向代理场景）。
		response := brPost(t, brBuild(t, brDefaultDep()), brForm("x"),
			map[string]string{"Origin": "https://api." + brDomain, "Host": "api." + brDomain})
		if response.status != http.StatusFound {
			t.Fatalf("Host=api.%s：status = %d, want 302（body=%q）", brDomain, response.status, response.body)
		}
	})

	t.Run("无 Origin、无 Sec-Fetch-Site、Referer 同站 → Referer 兜底放行 302 + Set-Cookie", func(t *testing.T) {
		route := brBuild(t, brDefaultDep())
		response := brPost(t, route, brForm("x"), map[string]string{"Referer": "https://" + brDomain + "/some/page"})
		brRedirect(t, response, "/")
		if cookie := response.cookie(); !strings.Contains(cookie, brCookie) {
			t.Fatalf("Referer 兜底放行后必须下发凭证，实得 Set-Cookie = %q", cookie)
		}
	})

	t.Run("无 Origin、无 Sec-Fetch-Site、Referer 跨站（https://evil.example/x）→ 403，无 Cookie/无 Location", func(t *testing.T) {
		login := &stubLogin{}
		dep := brDefaultDep()
		dep.LoginService = login
		response := brPost(t, brBuild(t, dep), brForm("x"), map[string]string{"Referer": "https://evil.example/x"})
		brBlocked(t, response, login)
	})

	t.Run("无 Origin、Sec-Fetch-Site: same-origin → 放行 302", func(t *testing.T) {
		response := brPost(t, brBuild(t, brDefaultDep()), brForm("x"),
			map[string]string{"Sec-Fetch-Site": "same-origin"})
		if response.status != http.StatusFound {
			t.Fatalf("status = %d, want 302（body=%q）", response.status, response.body)
		}
	})

	t.Run("无 Origin、Sec-Fetch-Site: same-site → 放行 302", func(t *testing.T) {
		response := brPost(t, brBuild(t, brDefaultDep()), brForm("x"),
			map[string]string{"Sec-Fetch-Site": "same-site"})
		if response.status != http.StatusFound {
			t.Fatalf("status = %d, want 302（body=%q）", response.status, response.body)
		}
	})

	t.Run("Host 伪装：前缀伪装 fbird.men.evil.com → 403；Origin 伪子域 evil.fbird.men（Host 正常）→ 403；合法子域 canary.fbird.men → 302", func(t *testing.T) {
		// 前缀伪装：fbird.men.evil.com 不以 .fbird.men 结尾，不进允许集合。
		prefixLogin := &stubLogin{}
		prefixDep := brDefaultDep()
		prefixDep.LoginService = prefixLogin
		prefix := brPost(t, brBuild(t, prefixDep), brForm("x"),
			map[string]string{"Host": "fbird.men.evil.com", "Origin": "https://fbird.men.evil.com"})
		brBlocked(t, prefix, prefixLogin)

		// 后缀形 Origin 但集合里没有 evil.fbird.men：靠「不许任意子域自证」拦下。
		suffixLogin := &stubLogin{}
		suffixDep := brDefaultDep()
		suffixDep.LoginService = suffixLogin
		suffix := brPost(t, brBuild(t, suffixDep), brForm("x"),
			map[string]string{"Host": brDomain, "Origin": "https://evil." + brDomain})
		brBlocked(t, suffix, suffixLogin)

		// 合法子域自报 Host：它在 .fbird.men 下，收录进集合并放行。
		canary := brPost(t, brBuild(t, brDefaultDep()), brForm("x"),
			map[string]string{"Host": "canary." + brDomain, "Origin": "https://canary." + brDomain})
		if canary.status != http.StatusFound {
			t.Fatalf("canary 子域：status = %d, want 302（body=%q）", canary.status, canary.body)
		}
	})

	t.Run("拒绝响应（403）不含 initData 与凭证值（抽查 Referer 跨站形态）", func(t *testing.T) {
		route := brBuild(t, brDefaultDep())
		response := brPost(t, route, brForm("SECRET_INITDATA_LEAK_PROBE"),
			map[string]string{"Referer": "https://evil.example/x"})
		if response.status != http.StatusForbidden {
			t.Fatalf("status = %d, want 403", response.status)
		}
		for _, forbidden := range []string{"SECRET_INITDATA_LEAK_PROBE", "QUJD+/==", brNodeToken} {
			if strings.Contains(response.body, forbidden) {
				t.Fatalf("403 页不得出现 %q，实得 %q", forbidden, response.body)
			}
		}
	})

	t.Run("无 Origin、无 Sec-Fetch-Site、Referer 也缺 → 三级全失败 403", func(t *testing.T) {
		login := &stubLogin{}
		dep := brDefaultDep()
		dep.LoginService = login
		brBlocked(t, brPost(t, brBuild(t, dep), brForm("x"), nil), login)
	})

	t.Run("loginService 返回 401（验签失败）→ 透传 401，无 Set-Cookie、无 302", func(t *testing.T) {
		dep := brDefaultDep()
		dep.LoginService = &stubLogin{fn: func(string) (int, any) {
			return http.StatusUnauthorized, brFailBody("INVALID_INIT_DATA", "签名校验失败")
		}}
		response := brSitePost(t, brBuild(t, dep), brForm("fake-init-data"))
		if response.status != http.StatusUnauthorized {
			t.Fatalf("status = %d, want 401", response.status)
		}
		if cookie := response.cookie(); cookie != "" {
			t.Fatalf("登录失败不得下发 Set-Cookie，实得 %q", cookie)
		}
		if location := response.location(); location != "" {
			t.Fatalf("登录失败不得 302，实得 Location=%q", location)
		}
		if !strings.Contains(response.body, "INVALID_INIT_DATA") {
			t.Fatalf("错误页应带 INVALID_INIT_DATA，实得 %q", response.body)
		}
	})

	t.Run("loginService 返回 429（限频/重放）→ 透传 429，无 Set-Cookie、无 302", func(t *testing.T) {
		dep := brDefaultDep()
		dep.LoginService = &stubLogin{fn: func(string) (int, any) {
			return http.StatusTooManyRequests, brFailBody("RATE_LIMITED", "请求过于频繁")
		}}
		response := brSitePost(t, brBuild(t, dep), brForm("fake-init-data"))
		if response.status != http.StatusTooManyRequests {
			t.Fatalf("status = %d, want 429", response.status)
		}
		if cookie := response.cookie(); cookie != "" {
			t.Fatalf("限频分支不得下发 Set-Cookie，实得 %q", cookie)
		}
		if location := response.location(); location != "" {
			t.Fatalf("限频分支不得 302，实得 Location=%q", location)
		}
		if !strings.Contains(response.body, "RATE_LIMITED") {
			t.Fatalf("错误页应带 RATE_LIMITED，实得 %q", response.body)
		}
	})

	t.Run("成功路径（FORCE_SECURE 默认 true + http）→ 302 + Set-Cookie 含 Secure 与完整属性，无 HttpOnly", func(t *testing.T) {
		login := &stubLogin{}
		dep := brDefaultDep()
		dep.LoginService = login
		route := brBuild(t, dep)

		response := brSitePost(t, route,
			url.Values{"initData": {"fake-init-data"}, "to": {"/member/user.html"}})
		brRedirect(t, response, "/member/user.html")

		if login.count() != 1 || login.calls[0] != "fake-init-data" {
			t.Fatalf("initData 应原样交给 loginService，实得 %q", login.calls)
		}

		cookie := response.cookie()
		if !strings.HasPrefix(cookie, brCookie+"; ") {
			t.Fatalf("Cookie 名值必须是 credentialProvider 返回串，实得 %q", cookie)
		}
		for _, want := range []string{"Path=/", "Domain=" + brDomain, "Max-Age=86400", "SameSite=Lax", "; Secure"} {
			if !strings.Contains(cookie, want) {
				t.Fatalf("Set-Cookie 缺少 %q，实得 %q", want, cookie)
			}
		}
		if strings.Contains(cookie, "HttpOnly") {
			t.Fatalf("不得下发 HttpOnly（与火鸟 login_user 现状一致），实得 %q", cookie)
		}
		if got := response.headers.Get("Cache-Control"); got != "no-store" {
			t.Fatalf("Cache-Control = %q, want no-store", got)
		}

		// 响应体 / Location 都不得出现 loginService 的 token 或凭证值；Cookie 里出现凭证是应该的，
		// 但 Node 自签的 token 同样不许借 Cookie 漏给浏览器。
		// 注意：Go 的 http.Redirect 对非 GET 不写 body（Node 的 stub 会写一行 "Found. ..."），
		// 这里把三处一起断言，比只看 body 更完整。
		for _, surface := range []struct{ name, value string }{
			{"body", response.body},
			{"Location", response.location()},
			{"Set-Cookie", cookie},
		} {
			if strings.Contains(surface.value, brNodeToken) {
				t.Fatalf("%s 不得出现 loginService 的 token，实得 %q", surface.name, surface.value)
			}
		}
		for _, surface := range []struct{ name, value string }{
			{"body", response.body},
			{"Location", response.location()},
		} {
			if strings.Contains(surface.value, "QUJD+/==") {
				t.Fatalf("%s 不得出现凭证值，实得 %q", surface.name, surface.value)
			}
		}
		if strings.Contains(response.body, "token") {
			t.Fatalf("响应体不得含 token 字样，实得 %q", response.body)
		}
	})

	t.Run("无 to 字段 → Location 回落默认目标 /", func(t *testing.T) {
		response := brSitePost(t, brBuild(t, brDefaultDep()), brForm("fake-init-data"))
		brRedirect(t, response, "/")
	})

	t.Run("FORCE_SECURE 显式 false：http 无 Secure，https（req.secure）有 Secure", func(t *testing.T) {
		dmz := brDefaultDep()
		dmz.ForceSecure = false
		// IsSecure 为 nil 时回落 req.TLS != nil：httptest 的请求没有 TLS，等价 Node 的 req.secure === false。
		httpResponse := brSitePost(t, brBuild(t, dmz), brForm("x"))
		if httpResponse.status != http.StatusFound {
			t.Fatalf("http：status = %d, want 302", httpResponse.status)
		}
		if strings.Contains(httpResponse.cookie(), "Secure") {
			t.Fatalf("forceSecure=false 且 http 时不该带 Secure，实得 %q", httpResponse.cookie())
		}

		dmzTLS := brDefaultDep()
		dmzTLS.ForceSecure = false
		dmzTLS.IsSecure = func(*http.Request) bool { return true }
		httpsResponse := brSitePost(t, brBuild(t, dmzTLS), brForm("x"))
		if httpsResponse.status != http.StatusFound {
			t.Fatalf("https：status = %d, want 302", httpsResponse.status)
		}
		if !strings.Contains(httpsResponse.cookie(), "; Secure") {
			t.Fatalf("https 时凭证必须带 Secure，实得 %q", httpsResponse.cookie())
		}
	})

	t.Run("开放重定向：//evil.com、/\\evil、https://evil.com 回落默认目标，/ok/path 按原样放行", func(t *testing.T) {
		for _, evil := range []string{"//evil.com", `/\evil`, "https://evil.com"} {
			response := brSitePost(t, brBuild(t, brDefaultDep()),
				url.Values{"initData": {"x"}, "to": {evil}})
			brRedirect(t, response, "/")
		}
		ok := brSitePost(t, brBuild(t, brDefaultDep()), url.Values{"initData": {"x"}, "to": {"/ok/path"}})
		brRedirect(t, ok, "/ok/path")
	})

	t.Run("sanitizeTarget：javascript:、@userinfo、CRLF、超长、非 / 开头一律回落", func(t *testing.T) {
		const fallback = "/"
		for _, bad := range []string{
			"javascript:alert(1)",
			"/a@evil.com",
			"/x\r\nSet-Cookie: a=1",
			"/" + strings.Repeat("a", 201),
			"relative",
			"",
		} {
			if got := SanitizeTarget(bad, fallback); got != fallback {
				t.Fatalf("SanitizeTarget(%q) = %q, want %q", bad, got, fallback)
			}
		}
		if got := SanitizeTarget("/ok", fallback); got != "/ok" {
			t.Fatalf(`SanitizeTarget("/ok") = %q, want "/ok"`, got)
		}
	})

	t.Run("credentialProvider 抛错（网关 4xx/5xx）→ 502，无 Set-Cookie、无 302、响应不含凭证值", func(t *testing.T) {
		dep := brDefaultDep()
		dep.CredentialProvider = func(context.Context, int64) (string, error) {
			return "", errIssueSession
		}
		response := brSitePost(t, brBuild(t, dep), brForm("x"))
		if response.status != http.StatusBadGateway {
			t.Fatalf("status = %d, want 502（body=%q）", response.status, response.body)
		}
		if cookie := response.cookie(); cookie != "" {
			t.Fatalf("502 不得下发 Set-Cookie，实得 %q", cookie)
		}
		if location := response.location(); location != "" {
			t.Fatalf("502 不得 302，实得 Location=%q", location)
		}
		if strings.Contains(response.body, "QUJD+/==") {
			t.Fatalf("502 页不得含凭证值，实得 %q", response.body)
		}
	})

	t.Run("credentialProvider 返回非法格式（分号注入）→ 502，脏值不得写入 Set-Cookie", func(t *testing.T) {
		dep := brDefaultDep()
		dep.CredentialProvider = func(context.Context, int64) (string, error) {
			return "HN_login_user=abc; Domain=evil.com", nil
		}
		response := brSitePost(t, brBuild(t, dep), brForm("x"))
		if response.status != http.StatusBadGateway {
			t.Fatalf("status = %d, want 502（body=%q）", response.status, response.body)
		}
		if cookie := response.cookie(); cookie != "" {
			t.Fatalf("脏凭证必须整条丢弃，实得 Set-Cookie = %q", cookie)
		}
		if location := response.location(); location != "" {
			t.Fatalf("不得 302，实得 Location=%q", location)
		}
	})

	t.Run("凭证值不进日志：console.error/console.log 捕获后均不含凭证值与 Node token", func(t *testing.T) {
		// Go 侧的日志出口只有 Dep.Warn（Node 的 console.*）；把每行都收集起来再统一断言。
		var lines []string
		capture := func(value any) {
			raw, err := json.Marshal(value)
			if err != nil {
				t.Fatalf("日志行不是合法 JSON: %v", err)
			}
			lines = append(lines, string(raw))
		}

		failing := brDefaultDep()
		failing.Warn = capture
		failing.CredentialProvider = func(context.Context, int64) (string, error) { return "", errIssueSession }
		brSitePost(t, brBuild(t, failing), brForm("init-data-should-not-leak"))

		okay := brDefaultDep()
		okay.Warn = capture
		brSitePost(t, brBuild(t, okay), brForm("init-data-should-not-leak"))

		all := strings.Join(lines, "\n")
		for _, forbidden := range []string{"QUJD+/==", brNodeToken, "init-data-should-not-leak"} {
			if strings.Contains(all, forbidden) {
				t.Fatalf("日志不得出现 %q，实得 %q", forbidden, all)
			}
		}
	})

	t.Run("配置缺失（cookieDomain 为空）→ POST 503 BRIDGE_NOT_CONFIGURED，无 Set-Cookie", func(t *testing.T) {
		dep := brDefaultDep()
		dep.CookieDomain = ""
		response := brPost(t, brBuild(t, dep), brForm("x"), nil)
		if response.status != http.StatusServiceUnavailable {
			t.Fatalf("status = %d, want 503（body=%q）", response.status, response.body)
		}
		if cookie := response.cookie(); cookie != "" {
			t.Fatalf("503 不得下发 Set-Cookie，实得 %q", cookie)
		}
		if !strings.Contains(response.body, "BRIDGE_NOT_CONFIGURED") {
			t.Fatalf("错误页应带 BRIDGE_NOT_CONFIGURED，实得 %q", response.body)
		}
		if !strings.Contains(response.body, "服务暂未配置") {
			t.Fatalf("错误页应带收敛后的文案，实得 %q", response.body)
		}
	})

	t.Run("配置缺失（botToken 为空）→ GET 503，进程不崩", func(t *testing.T) {
		dep := brDefaultDep()
		dep.BotToken = ""
		route := brBuild(t, dep)
		if !route.NotConfigured() {
			t.Fatal("缺 botToken 时必须标成 notConfigured")
		}
		response := brGet(t, route, nil)
		if response.status != http.StatusServiceUnavailable {
			t.Fatalf("status = %d, want 503", response.status)
		}
		if !strings.Contains(response.body, "BRIDGE_NOT_CONFIGURED") {
			t.Fatalf("错误页应带 BRIDGE_NOT_CONFIGURED，实得 %q", response.body)
		}
	})

	t.Run("503 错误页不暴露任何环境变量名（TMA_/FBS_/DB_/TELEGRAM_ 前缀零命中）", func(t *testing.T) {
		// 一次性构造「全缺」实例：环境变量名只允许进日志，不允许出现在公网页面。
		var warned []string
		route := brBuild(t, Dep{Warn: func(value any) {
			raw, _ := json.Marshal(value)
			warned = append(warned, string(raw))
		}})

		responses := map[string]brResponse{
			"POST": brPost(t, route, brForm("x"), nil),
			"GET":  brGet(t, route, nil),
		}
		leakPatterns := map[string]*regexp.Regexp{
			"TMA_*":      regexp.MustCompile(`TMA_[A-Z_]+`),
			"FBS_*":      regexp.MustCompile(`FBS_[A-Z_]+`),
			"DB_*":       regexp.MustCompile(`DB_[A-Z_]+`),
			"TELEGRAM_*": regexp.MustCompile(`TELEGRAM_[A-Z_]+`),
		}
		for label, response := range responses {
			if response.status != http.StatusServiceUnavailable {
				t.Fatalf("%s：status = %d, want 503", label, response.status)
			}
			for name, pattern := range leakPatterns {
				if pattern.MatchString(response.body) {
					t.Fatalf("%s 页不得含 %s 变量名，实得 %q", label, name, response.body)
				}
			}
			if strings.Contains(response.body, "TELEGRAM_BOT_TOKEN") {
				t.Fatalf("%s 页不得含 TELEGRAM_BOT_TOKEN，实得 %q", label, response.body)
			}
		}

		// 反面确认：变量名确实进了日志（否则上面的断言可能只是「压根没记录」）。
		joined := strings.Join(warned, "\n")
		if !strings.Contains(joined, "TELEGRAM_BOT_TOKEN") || !strings.Contains(joined, "TMA_BRIDGE_COOKIE_DOMAIN") {
			t.Fatalf("缺配置项必须进结构化告警，实得 %q", joined)
		}
	})

	t.Run("Max-Age 非法配置（0）回落默认 86400", func(t *testing.T) {
		dep := brDefaultDep()
		dep.MaxAge = 0
		response := brSitePost(t, brBuild(t, dep), brForm("x"))
		if cookie := response.cookie(); !strings.Contains(cookie, "Max-Age=86400") {
			t.Fatalf("Max-Age 非法时应回落 86400，实得 %q", cookie)
		}
	})

	t.Run("落地页 GET：text/html，含 telegram-web-app.js、表单 POST 到桥端点、initData 字段与提示文案", func(t *testing.T) {
		route := brBuild(t, brDefaultDep())
		response := brGet(t, route, url.Values{"to": {"/member/user.html"}})

		if response.status != http.StatusOK {
			t.Fatalf("status = %d, want 200", response.status)
		}
		if got := response.headers.Get("Content-Type"); !strings.Contains(got, "text/html") {
			t.Fatalf("Content-Type = %q, want text/html", got)
		}
		for _, want := range []string{
			"https://telegram.org/js/telegram-web-app.js",
			`method="POST"`,
			`action="/tg-api/auth/bridge"`,
			`name="initData"`,
			`value="/member/user.html"`,
			"请从 Telegram 内打开",
		} {
			if !strings.Contains(response.body, want) {
				t.Fatalf("落地页应包含 %q", want)
			}
		}
		if got := response.headers.Get("Cache-Control"); got != "no-store" {
			t.Fatalf("Cache-Control = %q, want no-store", got)
		}

		// CSP：内联脚本走一次性 nonce，脚本源限 self + telegram.org，
		// form-action 收紧到自身，frame-ancestors 放行 Telegram（否则 TG 内嵌白屏）。
		csp := response.headers.Get("Content-Security-Policy")
		noncePattern := regexp.MustCompile(`'nonce-([^']+)'`)
		for _, want := range []string{
			"script-src 'self' https://telegram.org 'nonce-",
			"frame-ancestors https://web.telegram.org",
			"form-action 'self'",
		} {
			if !strings.Contains(csp, want) {
				t.Fatalf("CSP 缺少 %q，实得 %q", want, csp)
			}
		}
		matched := noncePattern.FindStringSubmatch(csp)
		if matched == nil {
			t.Fatalf("CSP 里应带 nonce，实得 %q", csp)
		}
		if !strings.Contains(response.body, `nonce="`+matched[1]+`"`) {
			t.Fatalf("script 标签须带与 CSP 一致的 nonce %q", matched[1])
		}
	})

	t.Run("落地页 to=//evil.com → 隐藏字段回落 /", func(t *testing.T) {
		response := brGet(t, brBuild(t, brDefaultDep()), url.Values{"to": {"//evil.com"}})
		if response.status != http.StatusOK {
			t.Fatalf("status = %d, want 200", response.status)
		}
		if !strings.Contains(response.body, `value="/"`) {
			t.Fatalf("隐藏字段应回落为 /，实得 %q", response.body)
		}
		if strings.Contains(response.body, "evil.com") {
			t.Fatalf("越界 to 不得出现在 HTML 里，实得 %q", response.body)
		}
	})
}
