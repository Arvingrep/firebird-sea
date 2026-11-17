// Package rider 是骑手侧 Telegram 接口的 Go 版移植。
//
// 已移植三条（Node 侧都在 riderRoute.js 里）：
//   - **GET /tg-api/rider/bind**（落地页，page.go）
//   - **POST /tg-api/rider/bind**（initData 验签 → 手机号归一 → 网关 rider_bind →
//     rider_ql → 302 工作台，bind.go）
//   - **POST /tg-api/rider/session**（已绑定骑手换工作台直达 URL，本文件）
//
// 尚未移植：POST /tg-api/internal/dispatch（不在本次范围）。
//
// 真值来源固定为三份，改任何一行前都必须读原文，不许凭印象：
//   - services/api/src/riderRoute.js 的 postBind()（第 199-241 行）、sendBindError()
//     （第 176-197 行）、normalizePhone()（第 23-29 行）、session()（第 245-265 行）、
//     getLanding()（第 158-170 行）、renderLandingPage / renderErrorPage（第 33-98 行）
//     与 isAllowedTarget()（第 143-149 行）
//   - docs/api/openapi.yaml 的 /tg-api/rider/bind 与 /tg-api/rider/session
//   - services/api/test/rider-route.test.js 里标 bind / session / 落地页的用例
//
// 硬约束（与 Node 逐条一致）：
//   - initData 只从 POST body 取，不接受 query 传参：它是短期凭证，一旦进 URL 就会进
//     访问日志 / Referer / 浏览器历史。
//   - initData 原文、手机号、工作台直达 URL（含一次性 token）**一律不进日志**，
//     日志只记错误消息（截断 300）。
//   - 302/Location 那套白名单校验在这里用于「回给调用方的 url」：只接受 https，且
//     白名单非空时 host 必须在白名单内；白名单为空时只校验 https（fail-open，
//     Node 刻意如此，生产属配置风险，构造期会 warn 一行）。
package rider

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"strconv"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/gateway"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/htmlpage"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/httpbody"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/tgauth"
)

const (
	// 错误码与 Node 逐字一致（前端/bot 侧按码分支，不按文案匹配）。
	CodeNotConfigured   = "RIDER_NOT_CONFIGURED"
	CodeInvalidInitData = "INVALID_INIT_DATA"
	CodeFailed          = "RIDER_FAILED"

	// sessionSQL 与 Node 的
	// `SELECT courier_id FROM fbs_courier_map WHERE tg_user_id = ${tgId} LIMIT 1`
	// 语义等价：唯一差别是把字符串拼接换成 ? 绑定参数。
	// Go 侧**必须**参数化，不允许为了「跟原文长得一样」去拼 SQL。
	sessionSQL = "SELECT courier_id FROM fbs_courier_map WHERE tg_user_id = ? LIMIT 1"

	// maxSafeInteger 等价 JS 的 Number.MAX_SAFE_INTEGER（2^53-1）。
	maxSafeInteger = 1<<53 - 1
	// logMessageLimit 与 Node 的 `.slice(0, 300)` 一致。
	logMessageLimit = 300
)

// digitsPattern 对应 Node 的 /^\d+$/：tgId 只允许纯数字。
var digitsPattern = regexp.MustCompile(`^\d+$`)

// Gateway 是骑手侧用到的两个网关动作。生产装配 internal/gateway + Config，
// 测试注入 httptest 或假实现。
//
// 两个动作放在同一个接口里（Node 侧也是同一个 gateway 对象上的两个方法）：
// rider_bind 与 rider_ql 是「绑定 → 换直达 URL」的同一条链路，拆成两个接口只会
// 让「只接上一半」的装配错误编译得过去。
type Gateway interface {
	RiderBind(ctx context.Context, params map[string]any) (map[string]any, error)
	RiderQL(ctx context.Context, params map[string]any) (map[string]any, error)
}

// Dep 注入全部依赖，测试逐项替换。
type Dep struct {
	// BotToken 用于 initData 验签（Node 从 TELEGRAM_BOT_TOKEN 取）。
	BotToken string
	// ValidateInitData 可注入；nil 时走 tgauth.Validate（1h 时效，与 Node 的
	// telegramAuth 的 MAX_AUTH_AGE_SECONDS = 3600 一致）。
	ValidateInitData func(initData, botToken string) tgauth.Result
	// DB 是 fbs_courier_map 的只读连接池。nil **不是**「未配置」：Node 的 cliConn()
	// 不管有没有 DB_HOST 都会返回一个 query 对象（migrate.js:37-52），缺库只在真正
	// spawn 时失败，于是 riderRoute.js:128 的 `if (!conn)` 在生产装配里是死代码。
	// Go 侧同理——nil 只让查询失败（见 courierID），端点不会因此 503。
	DB *sql.DB
	// Gateway 为 nil 表示 FBS_GATEWAY_URL / FBS_GATEWAY_SECRET 没配齐
	// （Node 的 `process.env.X && process.env.Y ? {...} : null`）。
	Gateway Gateway
	// AllowedHosts 是工作台 URL 的域名白名单，由 CORS_ORIGINS 推导（见
	// AllowedHostsFromOrigins）。空 = 只校验 https，不校验域名。
	AllowedHosts []string
	// Allow 是 POST /rider/bind 的固定窗口限频，入参是客户端 IP（见 ClientKey）。
	// nil 表示不限（Node 的 `allow && !allow(req.ip)`）。生产由 token.NewLimiter
	// 按 TMA_RIDER_MAX（默认 10）次 / 60 秒装配。
	Allow func(key string) bool
	// TrustProxyHops 决定 ClientKey 是否采信 X-Forwarded-For，与 httpapi 的
	// TRUST_PROXY_HOPS 同源（0 = 只认 RemoteAddr，等价于 express 未配 trust proxy）。
	// 必须与其它 handler 取同一个值：限流分桶键不一致时，同一客户端会在两个桶里各占额度。
	TrustProxyHops int
	// Env 只为复刻 Node 构造期那条「prod + 白名单为空」的告警判定。
	Env func(string) string
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
	db       *sql.DB
	gateway  Gateway
	// hosts 是**已小写**的白名单集合（Node 构造期就 map 成小写再塞进 Set）。
	hosts map[string]struct{}
	// allow 是 POST /rider/bind 的限频器（nil = 不限）。
	allow func(key string) bool
	// hops 是限流分桶用的信任代理跳数（见 ClientKey）。
	hops int
	// nonce 生成落地页的 CSP nonce（每次请求现生成，不复用）。
	nonce func() (string, error)
	logf  func(line string)
	// notConfigured 为 true 时端点统一 503（进程不因此退出）。
	notConfigured bool
}

// New 构造骑手 session 处理器。缺配置不返回 error：Node 也是构造出一个
// notConfigured 的 route 继续挂载，由端点自己 503，这样 /health 仍可探活、
// 其它路由不受影响。
func New(d Dep) *Route {
	env := d.Env
	if env == nil {
		env = os.Getenv
	}
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

	// 缺失项清单与 Node 同序（Node: botToken → validateInitData → gateway → conn），
	// 但四条里只有前两条在两侧都真实可达：
	//   - 「initData 验签模块未装」：Go 的 validate 永远有默认实现（tgauth.Validate），
	//     nil 表示「用默认」而不是「没装」；Node 那条 `if (!validateInitData)` 只对应
	//     「模块没 require 到」。
	//   - 「DB 空」：Node 的 conn 恒非空——server.js:458 传的是 cliConn()，它无条件
	//     返回一个 query 对象（migrate.js:37-52）。缺 DB_HOST 时 Node 给的是 200（GET）
	//     和 502（session 查询失败），riderRoute.js:128 的 `if (!conn)` 是死代码。
	//     这条曾经被做成门禁，凭空多出一条 Node 没有的 503，已被真双进程对拍抓到
	//     （缺 DB：Node 200 / Go 503），别再改回去。
	var missing []string
	if d.BotToken == "" {
		missing = append(missing, "TELEGRAM_BOT_TOKEN")
	}
	if d.Gateway == nil {
		missing = append(missing, "FBS_GATEWAY_URL / FBS_GATEWAY_SECRET")
	}

	// 白名单条目一律小写（Node: allowedHosts.map(h => String(h).toLowerCase())）。
	hosts := make(map[string]struct{}, len(d.AllowedHosts))
	for _, host := range d.AllowedHosts {
		hosts[strings.ToLower(host)] = struct{}{}
	}

	route := &Route{
		botToken:      d.BotToken,
		validate:      validate,
		db:            d.DB,
		gateway:       d.Gateway,
		hosts:         hosts,
		allow:         d.Allow,
		hops:          d.TrustProxyHops,
		nonce:         nonce,
		logf:          logf,
		notConfigured: len(missing) > 0,
	}
	if route.notConfigured {
		route.warn("warn", "骑手绑定未配置，端点将返回 503", missing)
	} else if len(hosts) == 0 && (env("TMA_ENV") == "prod" || env("NODE_ENV") == "production") {
		// N7：白名单为空 = 只校验 https 不校验域名（fail-open），dev 敞开是刻意的；
		// 但 prod 下属于配置风险，warn 一行提醒补 CORS_ORIGINS。
		route.warn("warn", "allowedHosts 为空且运行在 production：工作台 URL 仅校验 https，不校验域名（fail-open）", nil)
	}
	return route
}

// NotConfigured 暴露构造期判定，供装配层/测试断言。
func (r *Route) NotConfigured() bool { return r.notConfigured }

// Session 是 POST /tg-api/rider/session 的处理器。
func (r *Route) Session(w http.ResponseWriter, req *http.Request) {
	// 进入函数第一件事就是 no-store，且在 notConfigured 判断**之前**：
	// 503/401/502 的响应体同样不能被缓存（m5 用例断言含失败分支）。
	w.Header().Set("Cache-Control", "no-store")

	if r.notConfigured {
		writeJSON(w, http.StatusServiceUnavailable, failureBody{
			Error: errorDetail{Code: CodeNotConfigured, Message: "rider session not configured"},
		})
		return
	}

	// 【安全】initData 只认 POST body（Node: `(req.body && req.body.initData) || ''`）。
	// 刻意**不**读 query：initData 是短期凭证，走 query 会落进访问日志、Referer
	// 与浏览器历史（Node 侧 m5 用例专门钉住这条）。
	initData := httpbody.Text(httpbody.FieldsOf(req), "initData")
	verified := r.validate(initData, r.botToken)
	if !verified.Valid {
		writeJSON(w, http.StatusUnauthorized, failureBody{
			Error: errorDetail{Code: CodeInvalidInitData, Message: "Invalid or missing initData"},
		})
		return
	}

	data, err := r.lookup(req.Context(), verified)
	if err != nil {
		// 只记消息：err 与请求体可能携带 initData / 工作台 URL（含 token），
		// 不能整体进日志（Node: String(err.message).slice(0, 300)）。
		r.logFailure(err)
		writeJSON(w, http.StatusBadGateway, failureBody{
			Error: errorDetail{Code: CodeFailed, Message: "Service temporarily unavailable"},
		})
		return
	}
	writeJSON(w, http.StatusOK, successBody{Success: true, Data: data})
}

// lookup 是 Node session() 里 try 块的整体：数字身份 → 查绑定 → 换工作台 URL。
func (r *Route) lookup(ctx context.Context, verified tgauth.Result) (sessionData, error) {
	tgID, err := tgIDString(verified)
	if err != nil {
		return sessionData{}, err
	}
	// 已过 \d+ 且来自 tgauth 的安全整数，转 int64 不会溢出；
	// 传数字（而不是字符串）是为了让绑定参数的类型与 Node 拼进 SQL 的数字字面量一致。
	numericID, err := strconv.ParseInt(tgID, 10, 64)
	if err != nil {
		return sessionData{}, errors.New("invalid tg id")
	}
	courierID, bound, err := r.courierID(ctx, numericID)
	if err != nil {
		return sessionData{}, err
	}
	if !bound {
		return sessionData{Bound: false}, nil
	}
	target, err := r.workbenchURL(ctx, courierID)
	if err != nil {
		return sessionData{}, err
	}
	return sessionData{Bound: true, CourierID: courierID, URL: target}, nil
}

// tgIDString 复刻 `String(Number(v.user.id))` + `/^\d+$/` 校验。
//
// 数字身份只从**验签结果**取，不接受请求里的任何 id 字段。tgauth 已保证
// user.id 是正的安全整数，所以这里只剩「非正数」这一种异常形态
// （String(-5) 是 "-5"，过不了 \d+），与 Node 一样走 502。
func tgIDString(verified tgauth.Result) (string, error) {
	if verified.User == nil {
		// Node 在这一步是 `v.user.id` 抛 TypeError → catch → 502。
		return "", errors.New("invalid tg id")
	}
	tgID := strconv.FormatInt(verified.User.ID, 10)
	if !digitsPattern.MatchString(tgID) {
		return "", errors.New("invalid tg id")
	}
	return tgID, nil
}

// courierID 查 fbs_courier_map 得到 courier_id。第二个返回值为 false 表示「未绑定」
// （含无行、NULL、值不是正的安全整数三种形态，与 Node 的 firstInt 一致）。
func (r *Route) courierID(ctx context.Context, tgUserID int64) (int64, bool, error) {
	// 没有连接池 = Node 里 cliConn 的 spawn 失败（可执行文件缺失 / 非 0 退出）。
	// 那条路径在 Node 是 Promise reject → session 的 catch → 502，不是 503；
	// 这里必须跟着走 502，否则把「查询故障」错报成「未配置」。
	if r.db == nil {
		return 0, false, errors.New("db not configured")
	}
	var raw sql.NullString
	// tg_user_id 走 ? 绑定参数：Node 靠「只可能是数字」的正则保证安全（把数字直接拼进
	// SQL），Go 侧改成绑定参数，两条路都堵上。参数类型是 int64，与 Node 的数字字面量同型。
	err := r.db.QueryRowContext(ctx, sessionSQL, tgUserID).Scan(&raw)
	if errors.Is(err, sql.ErrNoRows) {
		// Node 的 cliConn 在 0 行时 stdout 是空串 → parseInt('') 是 NaN → 未绑定。
		return 0, false, nil
	}
	if err != nil {
		return 0, false, err
	}
	if !raw.Valid {
		// NULL 列：Node 的文本输出是 "NULL" → parseInt 失败 → 未绑定。
		return 0, false, nil
	}
	courierID, ok := parseFirstInt(raw.String)
	return courierID, ok, nil
}

// parseFirstInt 复刻 Node 的 firstInt：
//
//	const n = parseInt(String(out || '').split('\n')[0].trim(), 10);
//	return Number.isSafeInteger(n) && n > 0 ? n : null;
//
// 为什么要复刻 parseInt 的「数字前缀」语义而不是直接用 strconv.Atoi：
// cliConn 回的是文本，"9天" / "9.7" 这类脏值在 Node 里会被读成 9，Atoi 会报错。
// 这里按 parseInt(base 10) 的规则取最长数字前缀，再要求正的安全整数。
func parseFirstInt(out string) (int64, bool) {
	line, _, _ := strings.Cut(out, "\n")
	value, ok := parseIntPrefix(strings.TrimSpace(line))
	if !ok {
		return 0, false
	}
	if value <= 0 || value > maxSafeInteger {
		return 0, false
	}
	return value, true
}

// parseIntPrefix 复刻 parseInt(s, 10)：允许前导正负号，遇到非数字即停止；
// 一个数字都没有时失败。溢出（超出 int64）也按失败处理——
// JS 在那种量级上早已不是 safe integer。
func parseIntPrefix(raw string) (int64, bool) {
	s := strings.TrimLeft(raw, " \t\n\r\v\f")
	sign := int64(1)
	if s != "" && (s[0] == '+' || s[0] == '-') {
		if s[0] == '-' {
			sign = -1
		}
		s = s[1:]
	}
	end := 0
	for end < len(s) && s[end] >= '0' && s[end] <= '9' {
		end++
	}
	if end == 0 {
		return 0, false
	}
	value, err := strconv.ParseInt(s[:end], 10, 64)
	if err != nil {
		return 0, false
	}
	return sign * value, true
}

// workbenchURL 调网关 rider_ql 换一次性工作台直达 URL。
func (r *Route) workbenchURL(ctx context.Context, courierID int64) (string, error) {
	result, err := r.gateway.RiderQL(ctx, map[string]any{"courier_id": courierID})
	if err != nil {
		return "", err
	}
	// Node 写的是 `ql && ql.success === true` —— **严格**等于 true，不是「真值」。
	// 所以这里不能用 gateway.Bool（它把 "0"/非空字符串都当 true），必须断言 bool 且为 true。
	success, isBool := result["success"].(bool)
	if !isBool || !success {
		return "", errors.New("rider_ql failed")
	}
	data, ok := gateway.Map(result, "data")
	if !ok {
		return "", errors.New("rider_ql returned no data")
	}
	// Node: `typeof url !== 'string' || !isAllowedTarget(url)`。
	target, ok := gateway.Str(data, "url")
	if !ok {
		return "", errors.New("rider_ql returned invalid url")
	}
	if !isAllowedTarget(target, r.hosts) {
		return "", errors.New("rider_ql returned invalid url")
	}
	return target, nil
}

// isAllowedTarget 复刻 Node 的 isAllowedTarget（m7）：
//  1. 必须是 https（其余 scheme 一律拒）；
//  2. 白名单为空时**放行任意 https 主机**——Node 刻意 fail-open，dev 敞开；
//  3. 白名单非空时比对 host（含端口）或 hostname，两侧都小写。
//
// host 为空也要拒：Node 的 `new URL('https://')` 直接抛错、返回 false，
// 而 Go 的 url.Parse 会给出一个 Host 为空的「合法」URL —— 少了这道判断，
// fail-open 分支就会把空主机放行。
func isAllowedTarget(target string, hosts map[string]struct{}) bool {
	parsed, err := url.Parse(target)
	if err != nil || parsed.Host == "" {
		return false
	}
	if !strings.EqualFold(parsed.Scheme, "https") {
		return false
	}
	if len(hosts) == 0 {
		return true
	}
	if _, ok := hosts[strings.ToLower(parsed.Host)]; ok {
		return true
	}
	_, ok := hosts[strings.ToLower(parsed.Hostname())]
	return ok
}

// whatwgDefaultPorts 是 WHATWG 里「特殊 scheme」的默认端口：`new URL(o).host` 会把
// 默认端口从 host 里省略掉（https://x:443 → "x"），非默认端口保留（→ "x:8443"）。
var whatwgDefaultPorts = map[string]string{
	"http":  "80",
	"https": "443",
	"ws":    "80",
	"wss":   "443",
	"ftp":   "21",
}

// AllowedHostsFromOrigins 复刻 server.js 的白名单取法：
//
//	allowedHosts: corsOrigins.map((o) => { try { return new URL(o).host } catch { return '' } }).filter(Boolean)
//
// 解析不出绝对 URL 的项直接丢弃（Node 里 new URL 抛错 → 回落空串 → 被 filter 掉）。
//
// 两处容易漏的 WHATWG 归一，漏了会让合法配置全线 502：
//  1. 默认端口被省略——`CORS_ORIGINS=https://h:443` 的 .host 是 "h"，不是 "h:443"。
//     只取 url.Parse(origin).Host 会保留 ":443"，而网关签出的 url 经 new URL 归一后
//     主机不带端口，于是 host 通道与 hostname 通道**同时**落空 → 所有 bound:true 请求 502，
//     日志只说 "rider_ql returned invalid url"，排查会一路指向 PHP 网关。
//  2. 主机一律小写（.host 是归一化结果），IPv6 保留方括号（"https://[::1]:443" → "[::1]"）。
func AllowedHostsFromOrigins(origins []string) []string {
	hosts := make([]string, 0, len(origins))
	for _, origin := range origins {
		parsed, err := url.Parse(strings.TrimSpace(origin))
		if err != nil || parsed.Scheme == "" || parsed.Host == "" {
			continue
		}
		name := strings.ToLower(parsed.Hostname())
		if strings.Contains(name, ":") {
			name = "[" + name + "]"
		}
		if port := parsed.Port(); port != "" && port != whatwgDefaultPorts[strings.ToLower(parsed.Scheme)] {
			name += ":" + port
		}
		hosts = append(hosts, name)
	}
	return hosts
}

// logFailure 只记错误消息（截断 300），不记 initData / URL。
func (r *Route) logFailure(err error) {
	r.warn("error", truncate(err.Error(), logMessageLimit), nil)
}

// ClientKey 取客户端 IP，供 POST /rider/bind 的限频分桶与网关 ip 参数共用。
//
// 语义与 httpapi.Server.clientKey / addrshare.Router.ClientKey 完全一致：
// TrustProxyHops > 0 时按 express 的 `trust proxy = n` 取「X-Forwarded-For + RemoteAddr」
// 链条里倒数第 hops+1 个地址；否则只认 RemoteAddr —— 裸奔部署下 XFF 是客户端可伪造的，
// 采信它等于把限流桶交给攻击者挑。
//
// 为什么不直接复用 httpapi 里的那份：httpapi 依赖本包（装配层 import rider），
// 反向 import 会成环。三处各一份是有意的（与 addrshare 同款），改动时必须三处同步。
//
// 对齐的 Node 语义：express 未配 trust proxy 时 `req.ip` 就是 socket 地址
// （见 server.js:42 的 `if (process.env.TRUST_PROXY_HOPS) app.set('trust proxy', ...)`）。
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
// 绝不允许放 initData、网关返回的 URL、或任何凭证。
//
// Route 取模块级 "rider"（Node 的前缀同样是 [rider]）：同一个 Route 实例现在服务
// GET /rider/bind 与 POST /rider/session 两个端点，写死某一个端点会误导排查。
func (r *Route) warn(level, message string, missing []string) {
	entry := struct {
		Level   string   `json:"level"`
		Route   string   `json:"route"`
		Message string   `json:"message"`
		Missing []string `json:"missing,omitempty"`
	}{Level: level, Route: "rider", Message: message, Missing: missing}
	line, err := json.Marshal(entry)
	if err != nil {
		return
	}
	r.logf(string(line))
}

// —— 响应体 ——
//
// 字段顺序按 Node 的 res.json 落地顺序写（success → data{bound, courier_id, url}），
// 这样逐字节比对时有可比性。

type errorDetail struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type failureBody struct {
	Success bool        `json:"success"`
	Error   errorDetail `json:"error"`
}

type successBody struct {
	Success bool        `json:"success"`
	Data    sessionData `json:"data"`
}

// sessionData 的 omitempty 是刻意的：未绑定分支 Node 返回的 data 只有 bound 一个键。
// （命中绑定时 courier_id 必 > 0、url 必非空，所以不会被 omit 掉。）
type sessionData struct {
	Bound     bool   `json:"bound"`
	CourierID int64  `json:"courier_id,omitempty"`
	URL       string `json:"url,omitempty"`
}

// writeJSON 与 Node 的 res.json 对齐：不转义 <、>、&，也不追加结尾换行。
// 不导出也不跨包复用：checkout / tglogin 各自有一份同样的实现（同为路由包），
// httpapi 那份是包的私有函数，跨包引用会形成反向依赖。
func writeJSON(w http.ResponseWriter, status int, body any) {
	buf := &bytes.Buffer{}
	encoder := json.NewEncoder(buf)
	encoder.SetEscapeHTML(false)
	if err := encoder.Encode(body); err != nil {
		http.Error(w, `{"success":false,"error":{"code":"RIDER_FAILED","message":"encode failed"}}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_, _ = w.Write(bytes.TrimSuffix(buf.Bytes(), []byte("\n")))
}

func truncate(value string, limit int) string {
	runes := []rune(value)
	if len(runes) <= limit {
		return value
	}
	return string(runes[:limit])
}
