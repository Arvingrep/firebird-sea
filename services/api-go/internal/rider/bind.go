package rider

// 本文件是 **POST /tg-api/rider/bind**（T6 骑手绑定）的移植：
//
//	PostBind        ← riderRoute.js:199-241（= postBind）
//	sendBindError   ← riderRoute.js:176-197
//	redirectToWorkbench / negotiateRedirect ← express res.redirect(302, url) 的真实形态
//
// 链路：initData 验签 → 手机号归一 → 网关 rider_bind（PHP 查唯一骑手、冲突 409、
// 三维度限频、写审计）→ 网关 rider_ql（签一次性工作台直达 URL）→ 302。
//
// 几条不能"顺手优化"的约束（每条都有对应的 Node 用例或线上事故背景）：
//   - **绝不静默成功**：网关 2xx 但 success !== true、或 courier_id 不是正的安全整数，
//     一律按失败处理（502 RIDER_FAILED），不能当成功去签工作台 URL。
//   - **绝不静默顶替**：冲突（409）原样呈现给用户并引导自解绑，Node/PHP 两侧都不做
//     覆盖式重绑；Go 侧更不写任何表（绑定写入只发生在 PHP 网关）。
//   - **两段失败文案必须区分**（G-8）：rider_bind 失败 → 「服务暂时不可用」；
//     rider_ql 失败时绑定已成立 → 「绑定已生效，获取工作台链接暂时失败…」。
//     文案混用会诱导用户反复重绑，重绑还会撞 PHP 的 tg 维度限频变 429。
//   - **日志只记错误消息**（截断 300）：initData 是短期凭证、手机号是个人信息、
//     工作台 URL 带一次性 token，三者都不能进日志。
//
// 与 Node 的差异只在错误页/302 的响应头层面，见各自函数的注释。

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/gateway"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/htmlpage"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/httpbody"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/tgauth"
)

const (
	// 错误码与 Node 逐字一致（前端/bot 侧按码分支，不按文案匹配）。
	//
	// 注意 409 的码有两个来源：网关返回的 COURIER_ALREADY_BOUND / TG_ALREADY_BOUND
	// 原样透出（用户要按码区分「该骑手被绑」还是「该 TG 已绑别人」），网关没给码时
	// 落 BIND_CONFLICT 兜底。
	CodeRateLimited        = "RATE_LIMITED"
	CodeInvalidPhone       = "INVALID_PHONE"
	CodeBindConflict       = "BIND_CONFLICT"
	CodeBindRateLimited    = "BIND_RATE_LIMITED"
	CodeCourierNotFound    = "COURIER_NOT_FOUND"
	CodeAuditUnavailable   = "AUDIT_UNAVAILABLE"
	CodeWorkbenchURLFailed = "WORKBENCH_URL_FAILED"

	// 错误页文案：全部与 riderRoute.js 逐字一致（含标点与全角句号）。
	rateLimitedMessage        = "操作过于频繁，请稍后再试"
	invalidInitDataMessage    = "请从 Telegram 内重新打开本页面"
	invalidPhoneMessage       = "手机号格式不正确。支持 09171234567 或 +639171234567 等写法。"
	conflictFallbackMessage   = "该手机号或当前账号已存在绑定关系，请先解绑后再试。"
	courierNotFoundMessage    = "未找到该手机号对应的骑手账号。请确认号码与站点登记的骑手手机号一致后重试。"
	serviceUnavailableMessage = "服务暂时不可用，请稍后重试"
	// workbenchFailedMessage 是 G-8 的核心：绑定已经生效，不能复述「服务暂时不可用」。
	workbenchFailedMessage = "绑定已生效，获取工作台链接暂时失败，请稍后从 bot 重新打开"

	// redirectStatusMessage 是 express 里 statuses.message[302]（"Found"），
	// 会出现在 302 的响应体里；不要改成 http.StatusText(302) 之外的任何东西。
	redirectStatusMessage = "Found. Redirecting to "

	// bindLogPrefix / qlLogPrefix 与 Node 的 console.error 前缀一致，用于区分
	// 「绑定失败」与「绑定成功但换 URL 失败」两类线上问题。
	bindLogPrefix = "rider/bind failed: "
	qlLogPrefix   = "rider/bind bind ok but ql failed: "
)

// conflictMessages 对应 Node 的 CONFLICT_MESSAGES：409 冲突码 → 用户可执行的提示。
// 刻意不写「联系管理员」这类甩锅文案 —— 能自己解绑的引导自解绑。
//
// 与 Node 的唯一差别：JS 是普通对象查表，`CONFLICT_MESSAGES['constructor']` 会命中原型链
// 拿到一个函数（Node 在那种输入下会渲染出奇怪内容）；Go 用 map 查表，未知码一律落兜底文案。
var conflictMessages = map[string]string{
	"COURIER_ALREADY_BOUND": "该骑手账号已被其他 Telegram 绑定。如这是你的账号，请先在原 Telegram 内打开工作台解绑后再试。",
	"TG_ALREADY_BOUND":      "当前 Telegram 已绑定其他骑手账号。请先在该工作台内解绑，再绑定新的手机号。",
}

// PostBind 是 POST /tg-api/rider/bind 的处理器（Node: postBind）。
//
// 校验顺序与 Node 逐行一致，**限频在验签之前**：验签要算 HMAC，先挡住超频请求
// 才谈得上防刷；反过来则任何人都能用无效 initData 白嫖一次签名计算。
func (r *Route) PostBind(w http.ResponseWriter, req *http.Request) {
	// ① 配置门禁在一切业务判断之前（Node: postBind 第一行）。
	if r.notConfigured {
		r.sendErrorPage(w, http.StatusServiceUnavailable, CodeNotConfigured, notConfiguredMessage)
		return
	}

	// ② 限频：key 是客户端 IP（Node: `allow(req.ip)`）。
	if r.allow != nil && !r.allow(r.ClientKey(req)) {
		r.sendErrorPage(w, http.StatusTooManyRequests, CodeRateLimited, rateLimitedMessage)
		return
	}

	// ③ initData 只认 POST body（`req.body && req.body.initData`）。
	//    刻意**不**读 query：短期凭证一旦进 URL 就会落进访问日志 / Referer / 浏览器历史。
	fields := httpbody.FieldsOf(req)
	verified := r.validate(httpbody.Text(fields, "initData"), r.botToken)
	if !verified.Valid {
		r.sendErrorPage(w, http.StatusUnauthorized, CodeInvalidInitData, invalidInitDataMessage)
		return
	}

	// ④ 手机号归一：失败即 400，且在触达网关之前就挡住（PHP 那边 phone 是查询条件）。
	phone, ok := normalizePhone(httpbody.Text(fields, "phone"))
	if !ok {
		r.sendErrorPage(w, http.StatusBadRequest, CodeInvalidPhone, invalidPhoneMessage)
		return
	}

	r.bindAndRedirect(w, req, verified, phone)
}

// bindAndRedirect 是 Node postBind 里 try 块的整体：绑 → 校验 → 换 URL → 302。
func (r *Route) bindAndRedirect(w http.ResponseWriter, req *http.Request, verified tgauth.Result, phone string) {
	tgID, err := tgIDString(verified)
	if err != nil {
		// 数字身份只从验签结果取；拿不到就是异常（Node 在这一步抛 TypeError）。
		r.logBindFailure(err)
		r.sendErrorPage(w, http.StatusBadGateway, CodeFailed, serviceUnavailableMessage)
		return
	}

	bind, err := r.gateway.RiderBind(req.Context(), map[string]any{
		// Node: String(v.user.id) —— 字符串进网关，PHP 侧按字符串拼审计与限频键。
		"tg_user_id": tgID,
		"phone":      phone,
		// Node: req.ip || '' —— 只为 PHP 侧的 ip 维度限频与审计，不进日志。
		"ip": r.ClientKey(req),
	})
	if err != nil {
		// 非 2xx 的差异化还原全在 sendBindError 里（409/429/404/503 → 502 兜底）。
		r.sendBindError(w, err)
		return
	}

	courierID, ok := boundCourierID(bind)
	if !ok {
		// 2xx 但 success !== true 或 courier_id 非法：绝不静默成功（Node 是 throw 进外层 catch）。
		r.logBindFailure(errors.New("rider_bind failed"))
		r.sendErrorPage(w, http.StatusBadGateway, CodeFailed, serviceUnavailableMessage)
		return
	}

	target, err := r.workbenchURL(req.Context(), courierID)
	if err != nil {
		// G-8：绑定已生效，这里的文案必须是「绑定已生效 …」，不能复用 RIDER_FAILED。
		r.logWorkbenchFailure(err)
		r.sendErrorPage(w, http.StatusBadGateway, CodeWorkbenchURLFailed, workbenchFailedMessage)
		return
	}

	redirectToWorkbench(w, req, target)
}

// sendBindError 复刻 sendBindError：把网关的差异化结果码还原成 B1 的用户提示。
//
// 只有 409/429/404/503 这四种是「业务失败」；其余（超时、网络、5xx、坏 JSON）
// 一律 502 兜底并落一行日志。注意：这四种业务失败**不写日志**（Node 原文如此）——
// 冲突与限频是正常业务事件，天天刷 error 日志只会把真正的故障淹掉。
func (r *Route) sendBindError(w http.ResponseWriter, err error) {
	var gatewayErr *gateway.Error
	if errors.As(err, &gatewayErr) && gatewayErr.Code == gateway.CodeHTTPError {
		code, _ := payloadErrorCode(gatewayErr.Payload)
		switch gatewayErr.Status {
		case http.StatusConflict:
			conflictCode := code
			if conflictCode == "" {
				conflictCode = CodeBindConflict
			}
			message, known := conflictMessages[conflictCode]
			if !known {
				message = conflictFallbackMessage
			}
			r.sendErrorPage(w, http.StatusConflict, conflictCode, message)
			return
		case http.StatusTooManyRequests:
			// PHP 侧三维度限频（tg/phone/ip）到顶：码固定为 BIND_RATE_LIMITED，
			// 与 Node 本地 IP 限频的 RATE_LIMITED 区分，便于前端/日志分辨是哪一层拦的。
			r.sendErrorPage(w, http.StatusTooManyRequests, CodeBindRateLimited, rateLimitedMessage)
			return
		case http.StatusNotFound:
			r.sendErrorPage(w, http.StatusNotFound, CodeCourierNotFound, courierNotFoundMessage)
			return
		case http.StatusServiceUnavailable:
			// 网关审计/限频底账不可用是 fail-closed；原样透传错误码，保持信号不稀释。
			auditCode := code
			if auditCode == "" {
				auditCode = CodeAuditUnavailable
			}
			r.sendErrorPage(w, http.StatusServiceUnavailable, auditCode, serviceUnavailableMessage)
			return
		}
	}
	r.logBindFailure(err)
	r.sendErrorPage(w, http.StatusBadGateway, CodeFailed, serviceUnavailableMessage)
}

// boundCourierID 复刻 Node 的
//
//	const courierId = bind && bind.success === true && Number(bind.data && bind.data.courier_id);
//	if (!Number.isSafeInteger(courierId) || courierId <= 0) throw ...
//
// 三个容易踩的点：
//   - `success === true` 是**严格**等于，字符串 "true" / 数字 1 都不算；
//   - `Number(...)` 会把数字字符串转成数字，所以 courier_id: "9" 在 Node 里是合法的，
//     这里必须同样接受（gateway.Int 已覆盖字符串形态）；
//   - 非整数（9.5）、0、负数、缺失都要拒 —— 否则会拿一个假 id 去签工作台 URL。
//
// 与 Node 的已知差异：`Number(true)` 是 1，JS 会把 courier_id: true 当成 1；Go 侧
// gateway.Int 对布尔返回 false，于是走 502。PHP 不会返回布尔，这个方向是「更严格」，
// 见实现报告 OPEN 一节。
func boundCourierID(bind map[string]any) (int64, bool) {
	success, isBool := bind["success"].(bool)
	if !isBool || !success {
		return 0, false
	}
	data, ok := gateway.Map(bind, "data")
	if !ok {
		return 0, false
	}
	courierID, ok := gateway.Int(data, "courier_id")
	if !ok {
		return 0, false
	}
	if courierID <= 0 || courierID > maxSafeInteger {
		return 0, false
	}
	return courierID, true
}

// payloadErrorCode 取网关错误体里的 payload.error.code。
//
// 对应 Node 的 `err.payload && err.payload.error` + `(gerr && gerr.code)`：
// 非对象、缺字段、非字符串、空串一律视为「没有码」，由调用方落各自的兜底码。
// （JS 里空串是假值，`(gerr && gerr.code) || 'X'` 同样会落兜底，两边一致。）
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

func (r *Route) logBindFailure(err error) {
	r.warn("error", bindLogPrefix+truncate(err.Error(), logMessageLimit), nil)
}

func (r *Route) logWorkbenchFailure(err error) {
	r.warn("error", qlLogPrefix+truncate(err.Error(), logMessageLimit), nil)
}

// —— 302 的响应形态 ——
//
// 这里**不用** http.Redirect：它对 POST 不写响应体、也不写 Content-Type，与 Express
// 的 res.redirect(302, url) 在字节层面不一致，而这条 302 是用户实际看到的最终响应。
//
// Express 4 的真实形态（本机起真进程用真 riderRoute.js 抓的，见实现报告 REDIRECT 一节）：
//
//	HTTP/1.1 302 Found
//	Cache-Control: no-store
//	Location: https://canary.fbird.men/ql.html?token=FAKE
//	Vary: Accept
//	Content-Type: text/html; charset=utf-8      ← 由请求的 Accept 协商决定
//	Content-Length: 72
//
//	<p>Found. Redirecting to https://canary.fbird.men/ql.html?token=FAKE</p>
//
// 同一个 URL 在 Accept: */* 或 text/plain 下 body 是纯文本
// `Found. Redirecting to …`（65 字节，Content-Type: text/plain; charset=utf-8）；
// 在 Accept: application/json 下既不设 Content-Type，body 也是空串（Content-Length: 0）。
//
// 与 Node 的已知差异（都不影响浏览器/WebView 的实际跳转，且不是本路由能修的）：
//   - X-Powered-By: Express 是 express app 级头，Go 全站都不发（既有全局差异）；
//   - Location 不做 express 的 encodeurl 处理：网关签出的 URL 是纯 ASCII，
//     encodeurl 对它是恒等变换；万一出现非 ASCII，Node 会百分号编码而这里原样发出。
func redirectToWorkbench(w http.ResponseWriter, req *http.Request, target string) {
	// Node 在 redirect 之前显式设了 no-store（riderRoute.js:230）：302 的 Location
	// 里带一次性 token，任何缓存都可能把别人的工作台凭证发给这个用户。
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("Location", target)

	// res.format 无条件加 Vary: Accept（哪怕最终落 default 分支）。
	// 用 Add 而不是 Set：httpapi 的 CORS 中间件可能已经写过 Vary: Origin。
	w.Header().Add("Vary", "Accept")

	body := ""
	switch negotiateRedirect(req.Header.Get("Accept")) {
	case redirectHTML:
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		// Node: '<p>' + 'Found. Redirecting to ' + escapeHtml(address) + '</p>'
		escaped := htmlpage.EscapeHTML(target)
		body = "<p>" + redirectStatusMessage + escaped + "</p>"
	case redirectText:
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		// Node: 'Found. Redirecting to ' + address（text 分支不转义）
		body = redirectStatusMessage + target
	}
	// Content-Length 必须显式写：先 WriteHeader 再写 body 时 Go 无法回头补算，
	// 会退化成 chunked，与 Node 的定长响应不一致。
	w.Header().Set("Content-Length", strconv.Itoa(len(body)))
	w.WriteHeader(http.StatusFound)
	_, _ = w.Write([]byte(body))
}

// redirectKind 是 Express res.format 的两个候选项（keys = ['text','html']）。
type redirectKind int

const (
	// redirectNone 对应 default 分支：没有可接受的类型 → 不设 Content-Type、body 为空。
	redirectNone redirectKind = iota
	redirectText
	redirectHTML
)

// redirectCandidates 是 res.format 的候选顺序（text 在前），顺序决定并列时的胜者。
var redirectCandidates = []struct {
	kind redirectKind
	typ  string
	sub  string
}{
	{redirectText, "text", "plain"},
	{redirectHTML, "text", "html"},
}

// negotiateRedirect 复刻 `req.accepts(['text','html'])` 的结果。
//
// 实现口径（足够覆盖浏览器 / curl / WebView 的实际取值）：
//   - 无 Accept 头时按 `*/*` 处理（与 negotiator 一致）；
//   - 媒体范围的 q 值决定优先级，q 相同则比匹配精度（精确 > type/* > */*），
//     再相同则按候选顺序取前者；
//   - 全部候选的 q 为 0（或没有任何匹配）时返回 redirectNone。
//
// 未复刻的部分：negotiator 对媒体类型参数的匹配（如 `text/plain;level=1`）与
// 部分畸形 Accept 串的容错。这条 302 的消费方是浏览器，宁可保持可读的实现。
func negotiateRedirect(accept string) redirectKind {
	ranges := parseAccept(accept)
	bestKind := redirectNone
	bestQuality := 0.0
	bestSpecificity := -1
	for _, candidate := range redirectCandidates {
		quality, specificity, matched := matchQuality(ranges, candidate.typ, candidate.sub)
		if !matched || quality <= 0 {
			continue
		}
		// 严格大于才替换：并列时保留先出现的候选（text 优先），与 negotiator 一致。
		if quality > bestQuality || (quality == bestQuality && specificity > bestSpecificity) {
			bestKind = candidate.kind
			bestQuality = quality
			bestSpecificity = specificity
		}
	}
	return bestKind
}

// acceptRange 是一个解析后的媒体范围（type/subtype 已小写）。
type acceptRange struct {
	typ string
	sub string
	q   float64
}

// parseAccept 把 Accept 头拆成媒体范围列表。空串按 `*/*` 处理。
func parseAccept(accept string) []acceptRange {
	trimmed := strings.TrimSpace(accept)
	if trimmed == "" {
		return []acceptRange{{typ: "*", sub: "*", q: 1}}
	}
	ranges := make([]acceptRange, 0, 4)
	for _, part := range strings.Split(trimmed, ",") {
		pieces := strings.Split(part, ";")
		mediaType := strings.ToLower(strings.TrimSpace(pieces[0]))
		if mediaType == "" {
			continue
		}
		typ, sub, found := strings.Cut(mediaType, "/")
		if !found {
			continue
		}
		quality := 1.0
		for _, parameter := range pieces[1:] {
			name, value, ok := strings.Cut(strings.TrimSpace(parameter), "=")
			if !ok || !strings.EqualFold(strings.TrimSpace(name), "q") {
				continue
			}
			if parsed, err := strconv.ParseFloat(strings.TrimSpace(value), 64); err == nil {
				quality = parsed
			}
		}
		ranges = append(ranges, acceptRange{typ: strings.TrimSpace(typ), sub: strings.TrimSpace(sub), q: quality})
	}
	if len(ranges) == 0 {
		return []acceptRange{{typ: "*", sub: "*", q: 1}}
	}
	return ranges
}

// matchQuality 返回候选类型在所有范围里的最优 (q, 匹配精度)。
// 精度：2 = 精确匹配，1 = type/*，0 = */*。
func matchQuality(ranges []acceptRange, typ, sub string) (float64, int, bool) {
	bestQuality := 0.0
	bestSpecificity := -1
	matched := false
	for _, item := range ranges {
		specificity := -1
		switch {
		case item.typ == typ && item.sub == sub:
			specificity = 2
		case item.typ == typ && item.sub == "*":
			specificity = 1
		case item.typ == "*":
			specificity = 0
		}
		if specificity < 0 {
			continue
		}
		if !matched || item.q > bestQuality || (item.q == bestQuality && specificity > bestSpecificity) {
			bestQuality = item.q
			bestSpecificity = specificity
			matched = true
		}
	}
	return bestQuality, bestSpecificity, matched
}
