// Package bridge 实现 Telegram 登录桥（TAPD 1162017416001000002）：
// TG 内打开 → 落地页取 initData → 表单 POST → 复用登录编排 → 网关 issue_session
// 换取火鸟进程内签发的会话凭证 → Set-Cookie + 302 跳站内目标页。
//
// 硬约束（与 Node 版逐条一致）：
//   - 桥**不**自签任何凭证，也不调令牌服务；loginService 返回的 token 在这里丢弃，只取 memberId。
//   - 凭证值不进日志、不进错误信息、不进 HTML。
//   - 浏览器永远看不到 Node/Go 自签的 token —— 它只拿到 PHP 网关下发的 Cookie。
package bridge

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"strings"
	"time"
	"unicode/utf16"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/httpbody"
)

const (
	// defaultMaxAge 与 Node 的 86400 一致：需与火鸟 onlinetime 对齐。
	defaultMaxAge = 86400
	// defaultTarget / defaultPostPath 对应 Node 的默认参数。
	defaultTarget   = "/"
	defaultPostPath = "/tg-api/auth/bridge"
	// maxTargetLen：Location 只接受短路径，超长一律回落默认页。
	maxTargetLen = 200
)

var (
	// cookieDomainPattern：Domain 格式非法时浏览器会静默丢弃整条 Set-Cookie
	// （表现为「点了没反应」），所以必须在构造期拦下。
	cookieDomainPattern = regexp.MustCompile(`^\.?[A-Za-z0-9.-]+$`)
	// credentialPattern：credentialProvider 已约束过 name/value，这里再兜一道防头注入——
	// 上游实现若变化把分号/换行带进来，宁可 502 也不能把脏值写进 Set-Cookie。
	credentialPattern = regexp.MustCompile(`^[A-Za-z0-9_]+=[A-Za-z0-9+/=]+$`)
	// controlChars：Location 里出现 CRLF 会造成响应拆分/头注入。
	controlChars = regexp.MustCompile(`[\x00-\x1f\x7f]`)
	// refererHostPattern 从 Referer 里取 host（含端口），语义同 Node 的 /^https?:\/\/([^/?#]+)/i。
	refererHostPattern = regexp.MustCompile(`(?i)^https?://([^/?#]+)`)
)

// LoginService 是既有登录编排（验签 + 限频 + 防重放 + 会员查建 + 审计）。
// 桥不重写这些逻辑，只消费它的 (状态码, 响应体)。
type LoginService interface {
	Login(ctx context.Context, initData string) (int, any)
}

// Dep 注入全部依赖，测试逐项替换。
type Dep struct {
	BotToken           string
	LoginService       LoginService
	CredentialProvider func(ctx context.Context, memberID int64) (string, error)
	CookieDomain       string
	// MaxAge 是 Cookie 的 Max-Age（秒）。非正整数回落 86400。
	MaxAge int
	// ForceSecure 为 true 时无视请求协议一律加 Secure（无 HttpOnly 的 24h 凭证不允许裸奔）。
	// 调用方负责给默认值 true（main 用 `env != "false"`）。
	ForceSecure bool
	// IsSecure 判定「这个请求是不是走 https」，仅在 ForceSecure 为 false 时用到。
	// 为 nil 时回落 r.TLS != nil。
	//
	// 为什么要注入而不是自己判：Node 用 express 的 `req.secure`，在配置了
	// `trust proxy` 后它会读 X-Forwarded-Proto。生产链路上 TLS 在 Traefik 终止，
	// 到容器的请求永远是明文 http —— 只看 r.TLS 会让「代理配置正确」的场景也漏掉
	// Secure，正是 Node 源码注释里专门要防的「凭证裸奔」。
	// 信任跳数与限流分桶共用同一套 TRUST_PROXY_HOPS 语义，由装配层注入。
	IsSecure      func(*http.Request) bool
	DefaultTarget string
	PostPath      string
	Now           func() time.Time
	// Warn 接收一行结构化告警（默认写 stderr）。
	Warn func(value any)
}

// Route 持有两个 handler。除构造期确定的字段外无可变状态（nonce 每次请求现生成）。
type Route struct {
	botToken     string
	login        LoginService
	credentials  func(ctx context.Context, memberID int64) (string, error)
	cookieDomain string
	maxAge       int
	forceSecure  bool
	isSecure     func(*http.Request) bool
	fallback     string
	postPath     string
	now          func() time.Time
	warn         func(any)
	// notConfigured 为 true 时两个端点统一 503（不崩进程）。
	notConfigured bool
}

// New 构造登录桥。缺配置不返回 error：调用方（main）需要进程继续启动，
// 由端点自身降级为 503，这样 /health 仍可探活、其它路由不受影响。
func New(d Dep) (*Route, error) {
	now := d.Now
	if now == nil {
		now = time.Now
	}
	warn := d.Warn
	if warn == nil {
		warn = func(value any) {
			line, err := json.Marshal(value)
			if err != nil {
				return
			}
			fmt.Fprintln(os.Stderr, string(line))
		}
	}

	// 环境变量名（内部拓扑）只进日志，不回给公网页面：
	// 公网无认证入口不应免费暴露依赖清单。
	var missing []string
	if d.BotToken == "" {
		missing = append(missing, "TELEGRAM_BOT_TOKEN")
	}
	if d.LoginService == nil {
		missing = append(missing, "FBS_GATEWAY_URL / FBS_GATEWAY_SECRET / DB_HOST（TMA 登录模块未装配）")
	}
	if d.CredentialProvider == nil {
		missing = append(missing, "FBS_GATEWAY_URL / FBS_GATEWAY_SECRET（凭证模块未装配）")
	}
	if d.CookieDomain == "" {
		missing = append(missing, "TMA_BRIDGE_COOKIE_DOMAIN")
	}
	if d.CookieDomain != "" && !cookieDomainPattern.MatchString(d.CookieDomain) {
		missing = append(missing, "TMA_BRIDGE_COOKIE_DOMAIN（格式非法，只允许字母/数字/点/连字符，可选前导点）")
	}

	maxAge := d.MaxAge
	if maxAge <= 0 {
		// 配置写坏时宁可回到默认值，也不要下发 Max-Age=NaN/0。
		maxAge = defaultMaxAge
	}
	postPath := d.PostPath
	if postPath == "" {
		postPath = defaultPostPath
	}
	target := d.DefaultTarget
	if target == "" {
		target = defaultTarget
	}

	route := &Route{
		botToken:      d.BotToken,
		login:         d.LoginService,
		credentials:   d.CredentialProvider,
		cookieDomain:  d.CookieDomain,
		maxAge:        maxAge,
		forceSecure:   d.ForceSecure,
		isSecure:      isSecureFunc(d.IsSecure),
		fallback:      SanitizeTarget(target, defaultTarget),
		postPath:      postPath,
		now:           now,
		warn:          warn,
		notConfigured: len(missing) > 0,
	}
	if route.notConfigured {
		route.warn(struct {
			Level   string   `json:"level"`
			Route   string   `json:"route"`
			Message string   `json:"message"`
			Missing []string `json:"missing"`
		}{
			Level:   "warn",
			Route:   "auth/bridge",
			Message: "登录桥未配置，端点将返回 503",
			Missing: missing,
		})
	}
	return route, nil
}

// NotConfigured 暴露构造期判定，供装配层决定是否注册路由（当前总是注册，端点自降级）。
func (r *Route) NotConfigured() bool { return r.notConfigured }

// SanitizeTarget 只放行站内相对路径，杜绝开放重定向。
//
// 规则：以单个 / 开头、不得以 // 或 /\ 开头、不得含 \、不得含协议或 @、不得含控制字符、
// 长度 ≤ 200。不合法一律回落 fallback 而不是报错——避免把攻击探测变成用户可见的 4xx。
func SanitizeTarget(raw, fallback string) string {
	if raw == "" || utf16Len(raw) > maxTargetLen {
		return fallback
	}
	if raw[0] != '/' {
		return fallback
	}
	// scheme-relative（//evil.com）与反斜杠变体（/\evil.com）在浏览器里等价于跳外域。
	if len(raw) > 1 && (raw[1] == '/' || raw[1] == '\\') {
		return fallback
	}
	if strings.Contains(raw, `\`) {
		return fallback
	}
	// userinfo@host 形式可把域名伪装成合法路径。
	if strings.Contains(raw, "@") {
		return fallback
	}
	if strings.Contains(raw, "://") {
		return fallback
	}
	if controlChars.MatchString(raw) {
		return fallback
	}
	return raw
}

// utf16Len 复刻 JS 的 string.length（UTF-16 码元数），避免把 emoji 路径误判为超长。
func utf16Len(value string) int { return len(utf16.Encode([]rune(value))) }

// EscapeHTML 复刻 Node 版的 escapeHtml：五个实体逐字一致。
//
// 不用 html.EscapeString —— 它把 `"` 转成 `&#34;`，而 Node 用 `&quot;`。
// 两者浏览器解码一致，但落地页要求与 Node 逐字节相同（前端有快照比对）。
func EscapeHTML(s string) string {
	var b strings.Builder
	b.Grow(len(s))
	for _, r := range s {
		switch r {
		case '&':
			b.WriteString("&amp;")
		case '<':
			b.WriteString("&lt;")
		case '>':
			b.WriteString("&gt;")
		case '"':
			b.WriteString("&quot;")
		case '\'':
			b.WriteString("&#39;")
		default:
			b.WriteRune(r)
		}
	}
	return b.String()
}

// renderLandingPage / renderErrorPage 是服务端拼接的静态模板，
// 外部输入只有 to（已先过 SanitizeTarget）与 code/message，统一做 HTML 转义防反射 XSS。
const landingTemplate = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>正在登录…</title>
<!-- 依赖说明：POST 提交必须携带浏览器代填的 Origin / Sec-Fetch-Site 头（现代浏览器对
     导航式 POST 均发送），服务端以此做登录 CSRF 来源闸门；无这些头的极老 WebView 会被 403 -->
<script src="https://telegram.org/js/telegram-web-app.js"></script>
</head>
<body>
<p id="msg">正在登录，请稍候…</p>
<form id="f" method="POST" action="{{POST_PATH}}">
<input type="hidden" name="initData" id="initData" value="">
<input type="hidden" name="to" value="{{TO}}">
</form>
<noscript><p>请在 Telegram 内打开本页面。</p></noscript>
<script nonce="{{NONCE}}">
(function () {
  var tg = window.Telegram && window.Telegram.WebApp;
  var data = tg && tg.initData;
  if (data) {
    if (tg.ready) tg.ready();
    document.getElementById('initData').value = data;
    // 必须用真实表单提交而非 fetch：只有导航式 POST 才会跟随服务端的 302 + Set-Cookie
    document.getElementById('f').submit();
  } else {
    document.getElementById('msg').textContent = '请从 Telegram 内打开本页面';
    var f = document.getElementById('f');
    if (f && f.parentNode) f.parentNode.removeChild(f);
  }
})();
</script>
</body>
</html>`

const errorTemplate = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>登录失败</title>
</head>
<body>
<p>登录失败（{{CODE}}）</p>
<p>{{MESSAGE}}</p>
</body>
</html>`

func renderLandingPage(nonce, postPath, to string) string {
	return strings.NewReplacer(
		"{{POST_PATH}}", EscapeHTML(postPath),
		"{{TO}}", EscapeHTML(to),
		"{{NONCE}}", nonce,
	).Replace(landingTemplate)
}

func renderErrorPage(code, message string) string {
	return strings.NewReplacer(
		"{{CODE}}", EscapeHTML(code),
		"{{MESSAGE}}", EscapeHTML(message),
	).Replace(errorTemplate)
}

// GetLanding 返回落地页。
func (r *Route) GetLanding(w http.ResponseWriter, req *http.Request) {
	if r.notConfigured {
		r.sendError(w, http.StatusServiceUnavailable, "BRIDGE_NOT_CONFIGURED", "服务暂未配置，请稍后重试")
		return
	}
	// /tg-api 前缀没有全局 CSP 中间件（CSP 只挂在 /tma），落地页必须自带：
	// 脚本仅限自身与 telegram.org（telegram-web-app.js），内联脚本用一次性 nonce 放行，
	// form-action 收紧到自身（form-action 不从 default-src 继承），
	// frame-ancestors 放行 Telegram 域，否则 TG 内嵌直接白屏。
	nonce, err := newNonce()
	if err != nil {
		r.sendError(w, http.StatusInternalServerError, "BRIDGE_FAILED", "登录暂时不可用，请稍后重试")
		return
	}
	w.Header().Set("Content-Security-Policy",
		"default-src 'none'; script-src 'self' https://telegram.org 'nonce-"+nonce+"'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors https://web.telegram.org https://*.telegram.org; base-uri 'none'")
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("Referrer-Policy", "no-referrer")
	w.Header().Set("X-Content-Type-Options", "nosniff")

	to := SanitizeTarget(queryValue(req, "to"), r.fallback)
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(renderLandingPage(nonce, r.postPath, to)))
}

// PostBridge 是桥端点：来源闸门 → 登录 → 换凭证 → Set-Cookie + 302。
func (r *Route) PostBridge(w http.ResponseWriter, req *http.Request) {
	if r.notConfigured {
		r.sendError(w, http.StatusServiceUnavailable, "BRIDGE_NOT_CONFIGURED", "服务暂未配置，请稍后重试")
		return
	}
	// 来源闸门先于一切鉴权/业务逻辑：跨站请求不值得消耗 HMAC 与网关往返。
	if reason := r.checkOrigin(req); reason != "" {
		r.logBlocked(req, reason)
		r.sendError(w, http.StatusForbidden, "CROSS_SITE_BLOCKED", "请从 Telegram 内重新打开本页面")
		return
	}

	// 只认 body 里的 initData（Node 读 req.body.initData）：query 里的不算，
	// 否则 initData 会出现在 URL / Referer / 代理日志里。
	//
	// body 用装配层已解析好的结果（httpbody）：Node 的 req.body 由全局
	// express.json + express.urlencoded 产出，**表单与 JSON 一视同仁**。之前这里只 ParseForm，
	// 于是发 JSON 体的调用方会被静默降级成「没有 initData」→ 401，属于可观测偏差。
	// 非字符串值（对象/数组）按 Node 行为视为不可用：httpbody.Text 只认字符串。
	// 解析失败也不单独报错：initData 缺失会一路走到 loginService 的 401，
	// 与 Node 一样不新增契约外的状态码。
	fields := httpbody.FieldsOf(req)
	initData := httpbody.Text(fields, "initData")
	// to 优先取 body 字段，兼容落地页把目标页放在 query 的场景。
	rawTo := httpbody.Text(fields, "to")
	if rawTo == "" {
		rawTo = queryValue(req, "to")
	}
	target := SanitizeTarget(rawTo, r.fallback)

	status, body := r.login.Login(req.Context(), initData)
	memberID, ok := successfulMemberID(status, body)
	if !ok {
		// Node 的 loginService.login 在后端故障时是**抛错**（不是返回 429），
		// 由 bridge 的 catch 统一成 502 BRIDGE_FAILED；Go 的等价信号是「登录编排返回 502」。
		// 不能退化成放行：防重放失效时下发凭证正是要防的那件事。
		if status == http.StatusBadGateway {
			r.fail(w, "login backend failed")
			return
		}
		code, message := failureOf(body, status)
		// loginService 的 401/429 等按原状态码与错误体转成错误页：不 302、不下发 Cookie。
		r.sendError(w, status, code, message)
		return
	}

	cookie, err := r.credentials(req.Context(), memberID)
	if err != nil || !credentialPattern.MatchString(cookie) {
		r.fail(w, "issue_session failed")
		return
	}

	// 不设 HttpOnly：火鸟原生 login_user 即非 HttpOnly，H5 多处 JS 要读它（与现状一致）。
	// Secure：默认强制；仅显式关闭（本地 http 调试）才按请求协议判定——
	// 代理链路配置错误时不能静默裸奔。
	secure := r.forceSecure || r.isSecure(req)
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("Set-Cookie",
		cookie+"; Path=/; Domain="+r.cookieDomain+"; Max-Age="+itoa(r.maxAge)+"; SameSite=Lax"+secureSuffix(secure))
	http.Redirect(w, req, target, http.StatusFound)
}

// fail 是防御兜底：header 已设置后（如 302 阶段）出错时，不能留下「502 + 合法凭证」的组合，
// 因此先清掉 Set-Cookie 再写错误页。只记消息不记 err 对象——
// err 与请求体可能携带 initData/凭证，不能整体进日志。
func (r *Route) fail(w http.ResponseWriter, reason string) {
	w.Header().Del("Set-Cookie")
	r.warn(struct {
		Level   string `json:"level"`
		Route   string `json:"route"`
		Message string `json:"message"`
	}{Level: "error", Route: "auth/bridge", Message: truncate(reason, 300)})
	r.sendError(w, http.StatusBadGateway, "BRIDGE_FAILED", "登录暂时不可用，请稍后重试")
}

func (r *Route) sendError(w http.ResponseWriter, status int, code, message string) {
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("Referrer-Policy", "no-referrer")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(status)
	_, _ = w.Write([]byte(renderErrorPage(code, message)))
}

// allowedHosts 由 cookieDomain（根域 + www）与请求 Host 推导本站集合。
// Host 只在本域/子域时收录，杜绝「任意 Host 自证」。
func (r *Route) allowedHosts(req *http.Request) map[string]struct{} {
	domain := strings.ToLower(strings.TrimPrefix(r.cookieDomain, "."))
	hosts := map[string]struct{}{domain: {}, "www." + domain: {}}
	host := strings.ToLower(req.Host)
	if host != "" && (host == domain || strings.HasSuffix(host, "."+domain)) {
		hosts[host] = struct{}{}
	}
	return hosts
}

// checkOrigin 是登录 CSRF 闸门：跨站表单 POST 可把受害者登录成攻击者的会员。
// 三级判定顺序不能变：
//  1. Origin 存在 → 必须属于本站集合；
//  2. Origin 缺失且 Sec-Fetch-Site 存在 → cross-site 拒，其余放行；
//  3. 两者都缺失（iOS ≤16.3 的 TG WebView 对同源 form POST 可能不发 Origin，
//     且 Sec-Fetch-Site 在 iOS 16.4 前不存在）→ Referer 兜底。
//
// Referer 兜底不是绕过：攻击者可用 referrerpolicy="no-referrer" 抹掉 Referer，
// 但抹不掉 Origin —— 跨源 POST 在现代浏览器必带 Origin，会被第 1 级先拦。
// 返回空串表示放行，否则是拒绝原因枚举（供结构化打点）。
func (r *Route) checkOrigin(req *http.Request) string {
	origin := req.Header.Get("Origin")
	site := req.Header.Get("Sec-Fetch-Site")
	hosts := r.allowedHosts(req)

	if origin != "" {
		parsed, err := url.Parse(origin)
		if err != nil || parsed.Host == "" {
			// 含 `Origin: null`：无法解析出 host，一律拒绝。
			return "origin_unparseable"
		}
		if _, ok := hosts[strings.ToLower(parsed.Host)]; ok {
			return ""
		}
		return "origin_mismatch"
	}
	if site != "" {
		if strings.ToLower(site) == "cross-site" {
			return "sec_fetch_cross_site"
		}
		return ""
	}
	matched := refererHostPattern.FindStringSubmatch(req.Header.Get("Referer"))
	if matched == nil {
		return "no_origin_headers"
	}
	if _, ok := hosts[strings.ToLower(matched[1])]; ok {
		return ""
	}
	return "referer_mismatch"
}

// logBlocked 只记 reason 枚举、host 与来源头存在性，
// 不记 initData / 凭证 / 完整 UA。
func (r *Route) logBlocked(req *http.Request, reason string) {
	r.warn(struct {
		Event           string `json:"event"`
		Reason          string `json:"reason"`
		Host            string `json:"host"`
		HasOrigin       bool   `json:"hasOrigin"`
		HasSecFetchSite bool   `json:"hasSecFetchSite"`
		HasReferer      bool   `json:"hasReferer"`
	}{
		Event:           "bridge_blocked",
		Reason:          reason,
		Host:            req.Host,
		HasOrigin:       req.Header.Get("Origin") != "",
		HasSecFetchSite: req.Header.Get("Sec-Fetch-Site") != "",
		HasReferer:      req.Header.Get("Referer") != "",
	})
}

// successfulMemberID 从 loginService 的 (状态码, 响应体) 里取 memberId。
//
// 走一次 JSON 往返而不是断言具体类型：loginService 的响应结构体是它自己的私有类型，
// 桥只需要 success / data.memberId —— 依赖 JSON 形状（那是对外契约）比依赖 Go 类型更稳。
func successfulMemberID(status int, body any) (int64, bool) {
	if status != http.StatusOK {
		return 0, false
	}
	raw, err := json.Marshal(body)
	if err != nil {
		return 0, false
	}
	var decoded struct {
		Success bool `json:"success"`
		Data    struct {
			MemberID int64 `json:"memberId"`
		} `json:"data"`
	}
	if err := json.Unmarshal(raw, &decoded); err != nil {
		return 0, false
	}
	if !decoded.Success || decoded.Data.MemberID <= 0 {
		return 0, false
	}
	return decoded.Data.MemberID, true
}

// failureOf 取登录失败时的 (code, message)，缺省值与 Node 逐字一致。
func failureOf(body any, status int) (string, string) {
	code, message := "LOGIN_FAILED", "登录失败，请从 Telegram 重新进入"
	raw, err := json.Marshal(body)
	if err != nil {
		return code, message
	}
	var decoded struct {
		Error struct {
			Code    string `json:"code"`
			Message string `json:"message"`
		} `json:"error"`
	}
	if err := json.Unmarshal(raw, &decoded); err != nil {
		return code, message
	}
	if decoded.Error.Code != "" {
		code = decoded.Error.Code
	}
	if decoded.Error.Message != "" {
		message = decoded.Error.Message
	}
	return code, message
}

func newNonce() (string, error) {
	buf := make([]byte, 16)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(buf), nil
}

// isSecureFunc 把可选的 IsSecure 归一成非 nil 函数，避免每次请求都判空。
func isSecureFunc(provided func(*http.Request) bool) func(*http.Request) bool {
	if provided != nil {
		return provided
	}
	return func(req *http.Request) bool { return req.TLS != nil }
}

func secureSuffix(secure bool) string {
	if secure {
		return "; Secure"
	}
	return ""
}

func queryValue(req *http.Request, key string) string {
	return req.URL.Query().Get(key)
}

func itoa(value int) string {
	return fmt.Sprintf("%d", value)
}

func truncate(value string, limit int) string {
	runes := []rune(value)
	if len(runes) <= limit {
		return value
	}
	return string(runes[:limit])
}
