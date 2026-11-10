// Package merchant 是商家侧 Telegram 免密入口（方案 A）的 Go 版移植。
//
// 已移植三条（Node 侧都在 merchantRoute.js 里）：
//   - **GET /tg-api/merchant/bind**（落地页，page.go）
//   - **POST /tg-api/merchant/bind**（initData 验签 → 手机号归一 → 网关 merchant_bind →
//     merchant_session → Set-Cookie + 302 /wmsj/，bind.go）
//   - **POST /tg-api/merchant/session**（已绑定商家换会员会话，JSON 形态，bind.go）
//
// 真值来源固定为三份，改任何一行前都必须读原文，不许凭印象：
//   - services/api/src/merchantRoute.js（safeRedirect / getLanding / postBind /
//     sendBindError / session 与两个页面模板）
//   - docs/api/openapi.yaml 的 /tg-api/merchant/bind 与 /tg-api/merchant/session
//   - webroot/api/fbs/index.php 的 merchant_bind / merchant_session（cookie 与映射
//     表的写入方，Go 侧只做验签与透传，绝不写任何表）
//
// 与骑手（internal/rider）的四处实质差异，写死在注释里防止被"顺手同构"掉：
//  1. **无一次性 token**：商家登录态 = 火鸟会员 cookie（HN_login_user），由 PHP 网关的
//     fbs_bridge_build_session_cookies 生成后**原样透传**（不增、不删、不改属性、不重排），
//     绑定成功后直接 302 /wmsj/ —— cookie 靠 Set-Cookie 生效，不需要 ql.html 中转。
//  2. **无 DB 字段**：映射查询全在 PHP（fbs_merchant_map 的读、fbs_member_map 的"绝不写"）。
//     Go 侧做 DB 直查既绕过 waimai_shop_manager 鉴权、又多出一条双读路径，禁止。
//  3. **302 目标是站内路径**（/wmsj/），不是网关签出的绝对 URL：校验走 SafeRedirect
//     （拒协议相对路径、反斜杠、控制字符、超长），不是 rider 的 https + host 白名单。
//  4. **Set-Cookie 必须在 WriteHeader 之前写入**：Go 的 http.Redirect 会触发 WriteHeader，
//     顺序错了 cookie 静默丢失，表现为「绑定成功但后台仍游客」——与 entry.php 二次
//     fetch 覆盖 cookie 的事故表象相同，极易误诊。
//
// 铁律（与 Node 逐条一致）：
//   - initData 只从 POST body 取，不接受 query 传参（短期凭证不进 URL/访问日志）；
//   - initData 原文、手机号、init_data_hash 一律不进日志，日志只记错误消息（截断 300）；
//   - **绝不写 fbs_member_map**（收银台归属底账）；会员解析只读，绝不建号。
package merchant

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"os"
	"regexp"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/htmlpage"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/tgauth"
)

const (
	// MerchantHome 是商家后台入口：/wmsj/ 的 index.php 自己会跳 order/waimaiOrder.php
	// （多店在页面内按 waimai_shop_manager 列表自选）。SafeRedirect 的兜底值。
	MerchantHome = "/wmsj/"

	// maxSafeInteger 等价 JS 的 Number.MAX_SAFE_INTEGER（2^53-1）。
	maxSafeInteger = 1<<53 - 1
	// logMessageLimit 与 Node 的 `.slice(0, 300)` 一致。
	logMessageLimit = 300
	// maxRedirectLength 与 Node safeRedirect 的 `s.length > 200` 一致（见 SafeRedirect）。
	maxRedirectLength = 200
)

// digitsPattern 对应 Node 的 /^\d+$/：tgUserId 只允许纯数字。
var digitsPattern = regexp.MustCompile(`^\d+$`)

// Gateway 是商家链路用到的两个网关动作。生产装配 internal/gateway + Config，
// 测试注入 httptest 或假实现。
//
// 两个动作放在同一个接口里（Node 侧也是同一个 gateway 对象上的两个方法）：
// merchant_bind 与 merchant_session 是「绑定 → 换会话」的同一条链路，拆成两个接口
// 只会让「只接上一半」的装配错误编译得过去。
type Gateway interface {
	MerchantBind(ctx context.Context, params map[string]any) (map[string]any, error)
	MerchantSession(ctx context.Context, params map[string]any) (map[string]any, error)
}

// Dep 注入全部依赖，测试逐项替换。**无 DB**（见包注释差异 2）。
type Dep struct {
	// BotToken 用于 initData 验签（Node 从 TELEGRAM_BOT_TOKEN 取）。
	BotToken string
	// ValidateInitData 可注入；nil 时走 tgauth.Validate（1h 时效，与 Node 的
	// telegramAuth 的 MAX_AUTH_AGE_SECONDS = 3600 一致）。
	ValidateInitData func(initData, botToken string) tgauth.Result
	// Gateway 为 nil 表示 FBS_GATEWAY_URL / FBS_GATEWAY_SECRET 没配齐
	// （Node 的 `merchantGateway = env && secret ? {...} : null`）。
	Gateway Gateway
	// Allow 是 POST /merchant/bind 的固定窗口限频，入参是客户端 IP（见 ClientKey）。
	// nil 表示不限（Node 的 `allow && !allow(req.ip)`）。生产由 token.NewLimiter
	// 按 TMA_MERCHANT_MAX（默认 10）次 / 60 秒装配。
	Allow func(key string) bool
	// TrustProxyHops 决定 ClientKey 是否采信 X-Forwarded-For，与 httpapi 的
	// TRUST_PROXY_HOPS 同源。必须与其它 handler 取同一个值：限流分桶键不一致时，
	// 同一客户端会在两个桶里各占额度。
	TrustProxyHops int
	// Nonce 生成落地页的 CSP nonce；nil 时用 htmlpage.NewNonce
	// （= Node 的 crypto.randomBytes(16).toString('base64')）。
	// 注入点只为测试固定 nonce（黄金样本逐字节比对），生产装配不设置。
	Nonce func() (string, error)
	// Logf 接收一行结构化日志（默认写 stderr）。
	Logf func(line string)
}

// Route 是一次构造、多请求复用的处理器。除构造期确定的字段外无可变状态。
type Route struct {
	botToken string
	validate func(initData, botToken string) tgauth.Result
	gateway  Gateway
	// allow 是 POST /merchant/bind 的限频器（nil = 不限）。
	allow func(key string) bool
	// hops 是限流分桶用的信任代理跳数（见 ClientKey）。
	hops int
	// nonce 生成落地页的 CSP nonce（每次请求现生成，不复用）。
	nonce func() (string, error)
	logf  func(line string)
	// notConfigured 为 true 时端点统一 503（进程不因此退出）。
	notConfigured bool
}

// New 构造商家入口处理器。缺配置不返回 error：Node 也是构造出一个
// notConfigured 的 route 继续挂载，由端点自己 503，这样 /health 仍可探活、
// 其它路由不受影响。
func New(d Dep) *Route {
	logf := d.Logf
	if logf == nil {
		logf = func(line string) { fmt.Fprintln(os.Stderr, line) }
	}
	validate := d.ValidateInitData
	if validate == nil {
		validate = func(initData, botToken string) tgauth.Result {
			return tgauth.Validate(initData, botToken, tgauth.Options{})
		}
	}
	nonce := d.Nonce
	if nonce == nil {
		nonce = htmlpage.NewNonce
	}

	// 缺失项清单与 Node 同序（Node: botToken → validateInitData → gateway）。
	var missing []string
	if d.BotToken == "" {
		missing = append(missing, "TELEGRAM_BOT_TOKEN")
	}
	if d.Gateway == nil {
		missing = append(missing, "FBS_GATEWAY_URL / FBS_GATEWAY_SECRET")
	}

	route := &Route{
		botToken:      d.BotToken,
		validate:      validate,
		gateway:       d.Gateway,
		allow:         d.Allow,
		hops:          d.TrustProxyHops,
		nonce:         nonce,
		logf:          logf,
		notConfigured: len(missing) > 0,
	}
	if route.notConfigured {
		route.warn("warn", "商家入口未配置，端点将返回 503", missing)
	}
	return route
}

// NotConfigured 暴露构造期判定，供装配层/测试断言。
func (r *Route) NotConfigured() bool { return r.notConfigured }

// SafeRedirect 复刻 Node merchantRoute.js 的 safeRedirect：
//
//	function safeRedirect(value) {
//	  if (typeof value !== 'string') return MERCHANT_HOME;
//	  const s = value.trim();
//	  if (s === '' || s.length > 200) return MERCHANT_HOME;
//	  if (s[0] !== '/' || s[1] === '/' || s[1] === '\\') return MERCHANT_HOME;
//	  if (/[\\\u0000-\u001f]/.test(s)) return MERCHANT_HOME;
//	  return s;
//	}
//
// 302/Location 目标只接受站内绝对路径：单斜杠开头、不含协议、不含反斜杠与控制字符。
// 网关返回值也走这里——「来自内部」不等于「可信」，开放重定向在登录链路上是直接可利用的。
//
// 与 Node 的已知差异：`s.length` 是 UTF-16 代码单元数，这里按 rune 数近似（对 ASCII
// 完全一致；超出 200 的多字节重定向本身就不是网关会返回的形态）。它也从 merchantRoute
// 被 tgLogin.js 复用（Node 是 require），Go 侧 tglogin 同样 import 本包取这一份 ——
// 归一契约只能有一处实现。
func SafeRedirect(value string) string {
	s := strings.TrimSpace(value)
	if s == "" || len([]rune(s)) > maxRedirectLength {
		return MerchantHome
	}
	if s[0] != '/' || s[1] == '/' || s[1] == '\\' {
		return MerchantHome
	}
	for _, char := range s {
		if char == '\\' || char < 0x20 {
			return MerchantHome
		}
	}
	return s
}

// tgIDString 复刻 Node 的：
//
//	const tgUserId = String(Number(v.user.id));
//	if (!/^\d+$/.test(tgUserId)) → 401 INVALID_INIT_DATA 'Invalid initData user'
//
// （postBind 里没有这层校验，直接用 String(v.user.id)；session 里有。两边都以
// tgauth 保证的正安全整数为基础，这里统一取同一份实现。）
func tgIDString(verified tgauth.Result) (string, bool) {
	if verified.User == nil {
		return "", false
	}
	tgID := fmt.Sprintf("%d", verified.User.ID)
	if !digitsPattern.MatchString(tgID) {
		return "", false
	}
	return tgID, true
}

// ClientKey 取客户端 IP，供 POST /merchant/bind 的限频分桶与网关 ip 参数共用。
//
// 语义与 httpapi.Server.clientKey / rider.Route.ClientKey 完全一致：
// TrustProxyHops > 0 时按 express 的 `trust proxy = n` 取「X-Forwarded-For + RemoteAddr」
// 链条里倒数第 hops+1 个地址；否则只认 RemoteAddr —— 裸奔部署下 XFF 是客户端可伪造的。
//
// 为什么不直接复用：httpapi 依赖本包（装配层 import merchant），反向 import 会成环；
// rider 那份同理。多份是有意的（与 addrshare 同款），改动时必须多处同步。
func (r *Route) ClientKey(req *http.Request) string {
	remote := hostOnly(req.RemoteAddr)
	if r.hops <= 0 {
		return remote
	}
	chain := make([]string, 0, 8)
	for _, part := range strings.Split(req.Header.Get("X-Forwarded-For"), ",") {
		if trimmed := strings.TrimSpace(part); trimmed != "" {
			chain = append(chain, trimmed)
		}
	}
	if remote != "" {
		chain = append(chain, remote)
	}
	index := len(chain) - 1 - r.hops
	if index < 0 || index >= len(chain) {
		return remote
	}
	return chain[index]
}

// hostOnly 去掉 RemoteAddr 里的端口；裸 IP 或空串原样返回。
func hostOnly(address string) string {
	if address == "" {
		return ""
	}
	if host, _, err := net.SplitHostPort(address); err == nil {
		return host
	}
	return address
}

// warn 写一行结构化日志。fields 只允许放「环境变量名」这类诊断信息，
// 绝不允许放 initData、手机号或任何凭证。
//
// Route 取模块级 "merchant"（Node 的前缀同样是 [merchant]）：同一个 Route 实例现在服务
// GET/POST /merchant/bind 与 POST /merchant/session 三个端点，写死某一个端点会误导排查。
func (r *Route) warn(level, message string, missing []string) {
	entry := struct {
		Level   string   `json:"level"`
		Route   string   `json:"route"`
		Message string   `json:"message"`
		Missing []string `json:"missing,omitempty"`
	}{Level: level, Route: "merchant", Message: message, Missing: missing}
	line, err := json.Marshal(entry)
	if err != nil {
		return
	}
	r.logf(string(line))
}

// logFailure 只记错误消息（截断 300），不记 initData / 手机号。
func (r *Route) logFailure(prefix string, err error) {
	r.warn("error", prefix+truncate(err.Error(), logMessageLimit), nil)
}

// payloadErrorCode 取网关错误体里的 payload.error.code。
// 非对象、缺字段、非字符串、空串一律视为「没有码」，由调用方落各自的兜底码。
func payloadErrorCode(payload any) (string, bool) {
	envelope, ok := payload.(map[string]any)
	if !ok {
		return "", false
	}
	detail, ok := envelope["error"].(map[string]any)
	if !ok {
		return "", false
	}
	code, ok := detail["code"].(string)
	if !ok || code == "" {
		return "", false
	}
	return code, true
}

// boundMemberID 复刻 Node 的
//
//	const memberId = bind && bind.success === true && Number(bind.data && bind.data.member_id);
//	if (!Number.isSafeInteger(memberId) || memberId <= 0) throw ...
//
// `success === true` 是**严格**等于；member_id 非整数、0、负数、缺失都要拒。
func boundMemberID(bind map[string]any) (int64, bool) {
	success, isBool := bind["success"].(bool)
	if !isBool || !success {
		return 0, false
	}
	data, ok := bind["data"].(map[string]any)
	if !ok {
		return 0, false
	}
	memberID, ok := gatewayInt(data, "member_id")
	if !ok {
		return 0, false
	}
	if memberID <= 0 || memberID > maxSafeInteger {
		return 0, false
	}
	return memberID, true
}

// sessionCookies 校验 merchant_session 的响应形状，返回原序 Cookie 列表、member_id、
// shop_ids 与站内 redirect。对应 Node 的：
//
//	if (!session || session.success !== true || !session.data
//	    || !Array.isArray(session.data.set_cookies) || session.data.set_cookies.length === 0) throw
//	if (!Number.isSafeInteger(Number(session.data.member_id)) || ... <= 0) throw
//
// set_cookies 由 PHP 生成，这里只透传：任何一条不是字符串都按契约违约处理（返回 false），
// 绝不静默丢弃 —— cookie 少一条，/wmsj 就少一份登录态。
func sessionCookies(session map[string]any) (cookies []string, memberID int64, shopIDs []int64, redirect string, ok bool) {
	success, isBool := session["success"].(bool)
	if !isBool || !success {
		return nil, 0, nil, "", false
	}
	data, isMap := session["data"].(map[string]any)
	if !isMap {
		return nil, 0, nil, "", false
	}
	rawCookies, isArray := data["set_cookies"].([]any)
	if !isArray || len(rawCookies) == 0 {
		return nil, 0, nil, "", false
	}
	cookies = make([]string, 0, len(rawCookies))
	for _, entry := range rawCookies {
		text, isString := entry.(string)
		if !isString {
			return nil, 0, nil, "", false
		}
		cookies = append(cookies, text)
	}
	memberID, ok = gatewayInt(data, "member_id")
	if !ok || memberID <= 0 || memberID > maxSafeInteger {
		return nil, 0, nil, "", false
	}
	// Node: shop_ids: Array.isArray(r.data.shop_ids) ? r.data.shop_ids : []。
	// 缺失/形态不对都回落空数组，不视为契约违约（shop_ids 只是展示信息）。
	if rawShops, isArray := data["shop_ids"].([]any); isArray {
		shopIDs = make([]int64, 0, len(rawShops))
		for _, entry := range rawShops {
			if id, isInt := gatewayNumber(entry); isInt {
				shopIDs = append(shopIDs, id)
			}
		}
	}
	redirect, _ = data["redirect"].(string)
	return cookies, memberID, shopIDs, redirect, true
}

// gatewayInt / gatewayNumber 把 encoding/json 解出的 float64（及测试常塞的 int/int64/
// json.Number/数字字符串）统一收口成 int64。internal/gateway 已有一组，但那会引入
// merchant → gateway 的额外 import（本包其余部分不需要 gateway 类型），
// 与「响应字段读取收口」同款实现就地保留一份。
func gatewayInt(m map[string]any, key string) (int64, bool) {
	v, ok := m[key]
	if !ok {
		return 0, false
	}
	return gatewayNumber(v)
}

func gatewayNumber(v any) (int64, bool) {
	switch n := v.(type) {
	case float64:
		if n != float64(int64(n)) {
			return 0, false
		}
		return int64(n), true
	case int:
		return int64(n), true
	case int32:
		return int64(n), true
	case int64:
		return n, true
	case json.Number:
		i, err := n.Int64()
		return i, err == nil
	case string:
		var parsed int64
		_, err := fmt.Sscanf(strings.TrimSpace(n), "%d", &parsed)
		return parsed, err == nil
	}
	return 0, false
}

// —— 响应体 ——
//
// 字段顺序按 Node 的 res.json 落地顺序写（success → data{bound, member_id, shop_ids, redirect}），
// 这样逐字节比对时有可比性。

type errorDetail struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type failureBody struct {
	Success bool        `json:"success"`
	Error   errorDetail `json:"error"`
}

// sessionData 的 omitempty 是刻意的：未绑定分支 Node 返回的 data 只有 bound 一个键。
// （绑定时 member_id 必 > 0，所以不会被 omit 掉。）
type sessionData struct {
	Bound    bool    `json:"bound"`
	MemberID int64   `json:"member_id,omitempty"`
	ShopIDs  []int64 `json:"shop_ids,omitempty"`
	Redirect string  `json:"redirect,omitempty"`
}

type successBody struct {
	Success bool        `json:"success"`
	Data    sessionData `json:"data"`
}

func truncate(value string, limit int) string {
	runes := []rune(value)
	if len(runes) <= limit {
		return value
	}
	return string(runes[:limit])
}
