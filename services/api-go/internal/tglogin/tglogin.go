// Package tglogin 是 Telegram 顾客免密登录桥的「方案甲：Node/Go 中转 PHP 网关」实现。
//
// 链路：bot 菜单打开 /tg/entry?role=customer → 落地页取 initData →
// POST /tg-api/auth/telegram-web → 验签（1 小时时效）→ 网关 member_find_or_create +
// issue_session → 把网关给的完整 Set-Cookie 原样透传 → 落地页跳 /。
//
// 防重放：initData 在有效期内本身可以无限次重放（Telegram 不提供一次性 nonce），
// 所以 issue_session 带上 sha256(initData) 让网关记账（bridge.php 的 5 次/2h 配额）。
// 只传 hash，不传原文 —— 原文里有用户资料，没必要扩大暴露面。
//
// 为什么不自拼 Cookie：HN_login_user 的值是 base64(RenrenCrypt::php_encrypt("<id>&<password>"))，
// 双重 base64 且依赖火鸟运行时的 cookieDomain / httpSecureAccess / onlinetime。这些只在 PHP 侧
// 有一份权威实现（bridge.php 的 fbs_bridge_build_session_cookies）。重新拼属性必然随配置漂移，
// 一旦 domain 或 SameSite 差一个字符，浏览器不认账而 PHP 认账，表现为「登录成功但首页仍是游客」。
// 故 set_cookies 由 PHP 生成，这里只做 header 透传，不增、不删、不改属性、不重排。
package tglogin

import (
	"bytes"
	"context"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/gateway"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/httpbody"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/merchant"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/tgauth"
)

// MaxAgeSeconds 是登录用 initData 的时效：1 小时；收银台仍走各自默认值。
//
// ⚠ 这个值必须 ≤ 网关的防重放窗口 FBS_BRIDGE_REPLAY_TTL（bridge.php = 7200s）：
// 计数窗口从「首次成功使用 initData」起算，只有时效 ≤ 窗口，5 次/份才覆盖 initData 的
// 整个可用期。调大这里会静默放宽重放额度。
const MaxAgeSeconds = 3600

// DefaultStatus 是未识别业务码的兜底。
//
// 刻意**不**复用 checkout 的 StatusFor()：那张表兜底 503，而登录场景里 503 会让客户端自动
// 重试，只会放大重放与限流压力，所以这里兜底 500。
const DefaultStatus = 500

// statusByCode 是登录专属的 code → HTTP 码表（与 Node 版逐条一致）。
var statusByCode = map[string]int{
	// —— 网关契约码（webroot/api/fbs/index.php）——
	"INVALID_SIGNATURE":             http.StatusUnauthorized,
	"MISSING_PARAM":                 http.StatusBadRequest,
	"MEMBER_DISABLED":               http.StatusForbidden,
	"MEMBER_CANCELLED":              http.StatusForbidden,
	"REPLAY_LIMITED":                http.StatusTooManyRequests,
	"GATEWAY_UNAVAILABLE":           http.StatusBadGateway,
	"GATEWAY_SECRET_NOT_CONFIGURED": http.StatusInternalServerError, // 静态配置错，重试无用
	"CONFIG_MISSING":                http.StatusInternalServerError,
	"CONFIG_INVALID":                http.StatusInternalServerError,
	"MEMBER_CREATE_FAILED":          http.StatusInternalServerError,
	"DB_QUERY_FAILED":               http.StatusInternalServerError,
	"UNKNOWN_ACTION":                http.StatusInternalServerError,
	"INTERNAL_ERROR":                http.StatusInternalServerError,
	// —— merchant 分支（方案 A）：网关 merchant_session 的契约码，HTTP 码与 PHP 侧一致 ——
	"MERCHANT_NOT_BOUND":     http.StatusNotFound,
	"MERCHANT_NOT_FOUND":     http.StatusNotFound,
	"MERCHANT_NO_SHOP":       http.StatusNotFound,
	"MERCHANT_AMBIGUOUS":     http.StatusConflict,
	"MERCHANT_ALREADY_BOUND": http.StatusConflict,
	"TG_ALREADY_BOUND":       http.StatusConflict,
	"BIND_RATE_LIMITED":      http.StatusTooManyRequests,
	"AUDIT_UNAVAILABLE":      http.StatusServiceUnavailable,
	"BIND_FAILED":            http.StatusInternalServerError,
	// 有意改判：PHP 侧 db_unavailable 是 500，但对外按「重试有没有用」判据应为 503 ——
	// 连不上库是瞬态依赖故障，重试有效。看到 PHP 侧是 500 不要当 bug 改回去。
	"DB_UNAVAILABLE": http.StatusServiceUnavailable,
	// —— 本路由自有 ——
	"INVALID_INIT_DATA":  http.StatusUnauthorized,
	"EXPIRED_INIT_DATA":  http.StatusUnauthorized,
	"ROLE_NOT_SUPPORTED": http.StatusNotImplemented,
}

// messageByCode 是与 Node 版逐字一致的中文文案。
var messageByCode = map[string]string{
	"INVALID_SIGNATURE":             "登录校验失败，请重新打开",
	"MISSING_PARAM":                 "登录参数缺失",
	"MEMBER_DISABLED":               "账号已停用，请联系站点",
	"MEMBER_CANCELLED":              "账号已申请注销，请联系站点",
	"REPLAY_LIMITED":                "请求过于频繁，请稍后再试",
	"GATEWAY_SECRET_NOT_CONFIGURED": "登录服务未正确配置",
	"CONFIG_MISSING":                "登录服务未正确配置",
	"CONFIG_INVALID":                "登录服务未正确配置",
	"MEMBER_CREATE_FAILED":          "账号创建失败，请稍后再试",
	"DB_QUERY_FAILED":               "登录服务暂不可用，请稍后再试",
	"INVALID_INIT_DATA":             "登录信息校验失败",
	"EXPIRED_INIT_DATA":             "登录信息已过期，请重新打开",
	// merchant 分支：文案给可执行动作（找运营做什么），不写「联系管理员」这类没有落点的句子
	"MERCHANT_NOT_BOUND":     "尚未绑定商家账号，请在机器人里发送 /merchant 完成绑定",
	"MERCHANT_NOT_FOUND":     "未找到该手机号对应的商家账号，请确认号码与站点登记的会员手机号一致",
	"MERCHANT_NO_SHOP":       "该商家账号还没有被分配外卖店铺，请联系运营在后台分配后再试",
	"MERCHANT_AMBIGUOUS":     "该手机号匹配到多个商家账号，无法自动登录，请联系运营核对",
	"MERCHANT_ALREADY_BOUND": "该商家账号已被其他 Telegram 绑定，如需换绑请联系运营",
	"TG_ALREADY_BOUND":       "当前 Telegram 已绑定其他商家账号，如需换绑请联系运营",
	"BIND_RATE_LIMITED":      "操作过于频繁，请稍后再试",
	"AUDIT_UNAVAILABLE":      "服务暂时不可用，请稍后再试",
	"ROLE_NOT_SUPPORTED":     "该身份暂未开放",
}

const defaultMessage = "登录服务暂不可用，请稍后再试"

// expiredPattern：tgauth 的英文原文靠这个归类成 EXPIRED_INIT_DATA。
var expiredPattern = regexp.MustCompile(`(?i)expired|stale`)

// StatusForCode 把业务码映射成 HTTP 状态（未识别一律 500）。
func StatusForCode(code string) int {
	if status, ok := statusByCode[code]; ok {
		return status
	}
	return DefaultStatus
}

// MessageForCode 取文案（未识别用默认文案）。
func MessageForCode(code string) string {
	if message, ok := messageByCode[code]; ok {
		return message
	}
	return defaultMessage
}

// Gateway 是登录桥用到的网关动作。生产接线 gateway 包 + Config，测试注入假实现。
//
// merchant 分支只用 MerchantSession（绑定走 /tg-api/merchant/bind 的落地页，
// 不经过本端点——与 Node 的 gatewayClient.merchantSession 同一形态）。
type Gateway interface {
	MemberFindOrCreate(ctx context.Context, params map[string]any) (map[string]any, error)
	IssueSession(ctx context.Context, params map[string]any) (map[string]any, error)
	MerchantSession(ctx context.Context, params map[string]any) (map[string]any, error)
}

// Dep 注入全部依赖，测试逐项替换。
type Dep struct {
	Env func(string) string
	DB  *sql.DB
	// BotToken 用于验签；ValidateInitData 为 nil 时才用到。
	BotToken string
	// ValidateInitData 可注入（默认 tgauth.Validate，且强制 MaxAgeSeconds=MaxAgeSeconds）。
	ValidateInitData func(initData, botToken string) tgauth.Result
	Gateway          Gateway
	Now              func() time.Time
	// Logf 接收一行结构化日志（默认写 stderr）。
	Logf func(line string)
}

type handler struct {
	env      func(string) string
	db       *sql.DB
	botToken string
	validate func(string, string) tgauth.Result
	gateway  Gateway
	now      func() time.Time
	logf     func(string)
}

type errorDetail struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type errorBody struct {
	Success bool        `json:"success"`
	Error   errorDetail `json:"error"`
}

type loginData struct {
	MemberID        int64  `json:"member_id"`
	Redirect        string `json:"redirect"`
	MemberMapSynced bool   `json:"member_map_synced"`
	At              int64  `json:"at"`
}

type loginBody struct {
	Success bool      `json:"success"`
	Data    loginData `json:"data"`
}

// New 构造 handler。ValidateInitData 缺失时用 tgauth 默认实现，
// 但**显式**传 MaxAgeSeconds —— 不能落回 tgauth 的包内默认值，
// 否则那条默认值一动，登录时效就跟着漂移而没人察觉。
func New(d Dep) http.HandlerFunc {
	env := d.Env
	if env == nil {
		env = os.Getenv
	}
	now := d.Now
	if now == nil {
		now = time.Now
	}
	logf := d.Logf
	if logf == nil {
		logf = func(line string) { fmt.Fprintln(os.Stderr, line) }
	}
	validate := d.ValidateInitData
	if validate == nil {
		validate = func(initData, botToken string) tgauth.Result {
			return tgauth.Validate(initData, botToken, tgauth.Options{MaxAgeSeconds: MaxAgeSeconds, Now: now})
		}
	}
	h := &handler{
		env:      env,
		db:       d.DB,
		botToken: d.BotToken,
		validate: validate,
		gateway:  d.Gateway,
		now:      now,
		logf:     logf,
	}
	return h.serve
}

func (h *handler) serve(w http.ResponseWriter, req *http.Request) {
	baseURL := h.env("FBS_GATEWAY_URL")
	secret := h.env("FBS_GATEWAY_SECRET")
	if baseURL == "" || secret == "" {
		h.logError("FBS_GATEWAY_URL / FBS_GATEWAY_SECRET 未配置，登录桥不可用")
		h.sendError(w, "GATEWAY_SECRET_NOT_CONFIGURED", "")
		return
	}

	fields := bodyFields(req)
	initData := req.Header.Get("x-telegram-init-data")
	if initData == "" {
		initData = stringField(fields, "initData")
	}
	if initData == "" {
		h.sendError(w, "MISSING_PARAM", "缺少 initData")
		return
	}

	verified := h.validate(initData, h.botToken)
	var tgUserID int64
	if verified.User != nil {
		tgUserID = verified.User.ID
	}
	if !verified.Valid || tgUserID <= 0 {
		if expiredPattern.MatchString(verified.Error) {
			h.sendError(w, "EXPIRED_INIT_DATA", "")
			return
		}
		h.sendError(w, "INVALID_INIT_DATA", "")
		return
	}

	role := stringField(fields, "role")
	if role == "" {
		role = "customer"
	}
	if role != "customer" && role != "merchant" {
		// 白名单：customer（顾客）/ merchant（商家，方案 A）。骑手不走本端点
		// （rider/bind 落地页），其余未知 role 一律 501，且不触达网关。
		h.sendError(w, "ROLE_NOT_SUPPORTED", "")
		return
	}

	params := map[string]any{"tg_user_id": tgUserID}
	for _, key := range []string{"first_name", "last_name", "username"} {
		if value, ok := profileField(verified.User, key); ok {
			params[key] = value
		}
	}

	// 只把 hash 交给网关记账，原文不出进程。
	sum := sha256.Sum256([]byte(initData))
	initDataHash := hex.EncodeToString(sum[:])

	if h.gateway == nil {
		h.logError("网关客户端未装配")
		h.sendError(w, "GATEWAY_UNAVAILABLE", "")
		return
	}

	// 商家分支（方案 A）：与顾客分支共享的只有「验签 + Set-Cookie 原样透传」，
	// 其余刻意不同构（见 serveMerchant 注释）。
	if role == "merchant" {
		h.serveMerchant(w, req, tgUserID, initDataHash)
		return
	}

	member, err := h.gateway.MemberFindOrCreate(req.Context(), params)
	if err != nil {
		code := GatewayFailureCode(err)
		h.logError("网关调用失败 code=" + code + " err=" + err.Error())
		h.sendError(w, code, "")
		return
	}
	// 网关 200 也可能是 success:false（防御式，正常实现不会）。
	if _, ok := memberResponseID(member); !ok {
		h.logError("member_find_or_create 返回异常: " + compactJSON(member))
		h.sendError(w, "GATEWAY_UNAVAILABLE", "")
		return
	}

	session, err := h.gateway.IssueSession(req.Context(), map[string]any{
		"tg_user_id":     tgUserID,
		"init_data_hash": initDataHash,
	})
	if err != nil {
		code := GatewayFailureCode(err)
		h.logError("网关调用失败 code=" + code + " err=" + err.Error())
		h.sendError(w, code, "")
		return
	}
	cookies, sessionMemberID, ok := sessionResponse(session)
	if !ok {
		h.logError("issue_session 未返回 set_cookies 或 member_id 非法")
		h.sendError(w, "GATEWAY_UNAVAILABLE", "")
		return
	}

	// Cookie 原样透传：不增、不删、不改属性、不重新排序。
	w.Header()["Set-Cookie"] = cookies

	// fail-open：写失败不阻断登录（登录态已由 cookie 建立），但必须留痕 ——
	// 这是「登录成功但收银台 403」的唯一线索。
	synced := true
	if err := h.upsertMemberMap(req.Context(), tgUserID, sessionMemberID); err != nil {
		synced = false
		h.log(struct {
			Level    string `json:"level"`
			Route    string `json:"route"`
			Event    string `json:"event"`
			TgUserID int64  `json:"tg_user_id"`
			MemberID int64  `json:"member_id"`
			Reason   string `json:"reason"`
		}{
			Level:    "error",
			Route:    "auth/telegram-web",
			Event:    "member_map_sync_failed",
			TgUserID: tgUserID,
			MemberID: sessionMemberID,
			Reason:   err.Error(),
		})
	}

	// 200 + JSON 而不是 302：落地页用 fetch 调本接口，跨重定向的 Set-Cookie 在部分 WebView 上
	// 不被采纳（Safari/iOS WebView 差异），200 响应上的 Set-Cookie 一定生效。
	writeJSON(w, http.StatusOK, loginBody{
		Success: true,
		Data: loginData{
			MemberID:        sessionMemberID,
			Redirect:        "/",
			MemberMapSynced: synced,
			At:              h.now().UnixMilli(),
		},
	})
}

// serveMerchant 是 role=merchant 的处理分支（Node: merchantLogin，tgLogin.js）。
//
// 与顾客分支共享的只有「验签 + Set-Cookie 原样透传」，其余刻意不同构：
//  1. **会员解析只读** —— merchant_session 内部查 fbs_merchant_map 拿既有会员，**绝不建号**；
//     issue_session 的 resolve_member（index.php）会在 username=tg_<id> 不存在时插空会员，
//     商家拿到「有 cookie 无店铺」，/wmsj 立刻弹「您没有外卖店铺权限」。
//  2. **不写 fbs_member_map** —— 那是收银台归属校验的唯一依据（payOrderRead.js），
//     写进去会把该 TG 的顾客下单归属永久改掉；member_map_synced 恒 false。
//  3. **redirect 是商家后台 /wmsj/**（多店由页面按 waimai_shop_manager 列表自选），不是 '/'。
//     网关返回值过 merchant.SafeRedirect 后透传（开放重定向在登录链路上直接可利用）；
//     SafeRedirect 从 merchant 包 import（Node 的 tgLogin.js 也 require merchantRoute），
//     归一契约只能有一处实现。
func (h *handler) serveMerchant(w http.ResponseWriter, req *http.Request, tgUserID int64, initDataHash string) {
	session, err := h.gateway.MerchantSession(req.Context(), map[string]any{
		"tg_user_id":     tgUserID,
		"init_data_hash": initDataHash,
	})
	if err != nil {
		code := GatewayFailureCode(err)
		h.logError("网关调用失败 role=merchant code=" + code + " err=" + err.Error())
		h.sendError(w, code, "")
		return
	}
	cookies, memberID, redirect, ok := merchantSessionResponse(session)
	if !ok {
		h.logError("merchant_session 未返回 set_cookies 或 member_id 非法")
		h.sendError(w, "GATEWAY_UNAVAILABLE", "")
		return
	}

	// Cookie 原样透传：不增、不删、不改属性、不重新排序。
	w.Header()["Set-Cookie"] = cookies

	// 200 + JSON 而不是 302：同顾客分支的理由（fetch 跨重定向的 Set-Cookie 在部分
	// WebView 上不被采纳），由落地页自行 location.replace。
	writeJSON(w, http.StatusOK, loginBody{
		Success: true,
		Data: loginData{
			MemberID:        memberID,
			Redirect:        merchant.SafeRedirect(redirect),
			MemberMapSynced: false,
			At:              h.now().UnixMilli(),
		},
	})
}

// merchantSessionResponse 校验 merchant_session 的响应形状（对应 Node merchantLogin 里的
// 内联校验）。与顾客侧 sessionResponse 的差异：**不校验顺序无关的 redirect 缺失**——
// redirect 缺失时由 SafeRedirect 回落 /wmsj/，不算契约违约。
func merchantSessionResponse(session map[string]any) ([]string, int64, string, bool) {
	if session == nil || !gateway.Bool(session, "success") {
		return nil, 0, "", false
	}
	data, ok := gateway.Map(session, "data")
	if !ok {
		return nil, 0, "", false
	}
	rawCookies, ok := data["set_cookies"].([]any)
	if !ok || len(rawCookies) == 0 {
		return nil, 0, "", false
	}
	cookies := make([]string, 0, len(rawCookies))
	for _, entry := range rawCookies {
		text, ok := entry.(string)
		if !ok {
			return nil, 0, "", false
		}
		cookies = append(cookies, text)
	}
	// member_id 会原样回给前端：非正整数一律按契约违约处理。
	memberID, ok := gateway.Int(data, "member_id")
	if !ok || memberID <= 0 {
		return nil, 0, "", false
	}
	redirect, _ := data["redirect"].(string)
	return cookies, memberID, redirect, true
}

// upsertMemberMap 维护 fbs_member_map（tg_user_id ↔ 火鸟会员 id），收银台的归属校验读这张表。
//
// 表名**不带** DB_TABLE_PREFIX：fbs_* 是我们自己的表，由 migrations 以裸名创建，
// 读方（order 包读 pay_log 之外的部分）也是裸名。DB_TABLE_PREFIX 只服务于火鸟原生表。
// 曾误写成带前缀，会让写入恒定 1146 失败 → 表永远为空 → 收银台归属校验恒 403。
func (h *handler) upsertMemberMap(ctx context.Context, tgUserID, memberID int64) error {
	if h.db == nil {
		// 没接连接对象视为未接线，返回 nil 以免误报 member_map_synced=false。
		return nil
	}
	// 网关返回值也走这里：'来自内部' 不等于 '可信'。
	if tgUserID <= 0 {
		return fmt.Errorf("tg_user_id is not a positive integer")
	}
	if memberID <= 0 {
		return fmt.Errorf("member_id is not a positive integer")
	}
	_, err := h.db.ExecContext(ctx,
		"INSERT INTO `fbs_member_map` (tg_user_id, member_id) VALUES (?, ?) "+
			"ON DUPLICATE KEY UPDATE member_id = VALUES(member_id)",
		strconv.FormatInt(tgUserID, 10), memberID)
	return err
}

// sendError 统一错误出口。503 是「重试有用」的瞬态故障：给 Retry-After 让客户端有据可依。
// 落地页本身不自动重试（同一份 initData 每次重试都扣一次重放额度）。
func (h *handler) sendError(w http.ResponseWriter, code, message string) {
	status := StatusForCode(code)
	if message == "" {
		message = MessageForCode(code)
	}
	if status == http.StatusServiceUnavailable {
		w.Header().Set("Retry-After", "60")
	}
	writeJSON(w, status, errorBody{Success: false, Error: errorDetail{Code: code, Message: message}})
}

func (h *handler) logError(message string) {
	h.log(struct {
		Level   string `json:"level"`
		Route   string `json:"route"`
		Message string `json:"message"`
	}{Level: "error", Route: "auth/telegram-web", Message: truncate(message, 300)})
}

func (h *handler) log(value any) {
	line, err := json.Marshal(value)
	if err != nil {
		return
	}
	h.logf(string(line))
}

// GatewayFailureCode 把网关失败归一成契约码（透传，不压成 INTERNAL_ERROR）。
func GatewayFailureCode(err error) string {
	var gatewayErr *gateway.Error
	if errors.As(err, &gatewayErr) {
		if payload, ok := gatewayErr.Payload.(map[string]any); ok {
			if detail, ok := payload["error"].(map[string]any); ok {
				if code, ok := detail["code"].(string); ok && code != "" {
					// 网关 success:false 的 code 原样透传。
					return code
				}
			}
		}
		switch gatewayErr.Code {
		case gateway.CodeTimeout, gateway.CodeBadJSON:
			return "GATEWAY_UNAVAILABLE"
		}
	}
	return "GATEWAY_UNAVAILABLE"
}

// memberResponseID 校验 member_find_or_create 的响应形状。
func memberResponseID(member map[string]any) (int64, bool) {
	if member == nil || !gateway.Bool(member, "success") {
		return 0, false
	}
	data, ok := gateway.Map(member, "data")
	if !ok {
		return 0, false
	}
	return gateway.Int(data, "member_id")
}

// sessionResponse 校验 issue_session 的响应形状，返回原序的 Cookie 列表与 member_id。
func sessionResponse(session map[string]any) ([]string, int64, bool) {
	if session == nil || !gateway.Bool(session, "success") {
		return nil, 0, false
	}
	data, ok := gateway.Map(session, "data")
	if !ok {
		return nil, 0, false
	}
	rawCookies, ok := data["set_cookies"].([]any)
	if !ok || len(rawCookies) == 0 {
		return nil, 0, false
	}
	cookies := make([]string, 0, len(rawCookies))
	for _, entry := range rawCookies {
		text, ok := entry.(string)
		if !ok {
			return nil, 0, false
		}
		cookies = append(cookies, text)
	}
	// member_id 会被写进 fbs_member_map 并原样回给前端：非正整数一律按契约违约处理。
	memberID, ok := gateway.Int(data, "member_id")
	if !ok || memberID <= 0 {
		return nil, 0, false
	}
	return cookies, memberID, true
}

// profileField 从 tgauth.User 的原始 JSON 里取资料字段。
func profileField(user *tgauth.User, key string) (string, bool) {
	if user == nil || len(user.Raw) == 0 {
		return "", false
	}
	var fields map[string]any
	if err := json.Unmarshal(user.Raw, &fields); err != nil {
		return "", false
	}
	value, ok := fields[key].(string)
	if !ok || value == "" {
		return "", false
	}
	return value, true
}

// bodyFields 取请求体字段，口径与 Node 的 express.json + express.urlencoded 一致：
// 解析方式由 Content-Type 决定（application/json / +json / x-www-form-urlencoded），
// 其它类型 body 视为空 —— 不再按首字节嗅探。
//
// 装配层的中间件已经解析过一次并挂进 context，这里直接复用；直接调用处理函数时
// httpbody 会按同一套规则现解析，两条路径的行为一致。
func bodyFields(req *http.Request) map[string]any {
	return httpbody.FieldsOf(req)
}

// stringField 取字符串字段；非字符串一律当作缺失（Node 的 body.role 也只接受字符串）。
func stringField(fields map[string]any, key string) string {
	value, ok := fields[key].(string)
	if !ok {
		return ""
	}
	return value
}

func compactJSON(value any) string {
	raw, err := json.Marshal(value)
	if err != nil {
		return "<unmarshalable>"
	}
	return truncate(string(raw), 300)
}

func truncate(value string, limit int) string {
	runes := []rune(value)
	if len(runes) <= limit {
		return value
	}
	return string(runes[:limit])
}

// writeJSON 与 Node 的 res.json 对齐：不转义 <、>、&，也不追加结尾换行。
// 默认编码器会把 `<` 写成 `\u003c` 并在末尾补 0x0a —— 两者对 JSON 语义无影响，
// 但会让「与 Node 逐字节比对」的验收手段失效。
func writeJSON(w http.ResponseWriter, status int, body any) {
	buf := &bytes.Buffer{}
	encoder := json.NewEncoder(buf)
	encoder.SetEscapeHTML(false)
	if err := encoder.Encode(body); err != nil {
		http.Error(w, `{"success":false,"error":{"code":"INTERNAL_ERROR","message":"encode failed"}}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_, _ = w.Write(bytes.TrimSuffix(buf.Bytes(), []byte("\n")))
}
