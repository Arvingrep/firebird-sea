package merchant

// 本文件是 **POST /tg-api/merchant/bind** 与 **POST /tg-api/merchant/session** 的移植：
//
//	PostBind        ← merchantRoute.js（postBind）
//	sendBindError   ← merchantRoute.js（sendBindError）
//	Session         ← merchantRoute.js（session）
//
// 链路：initData 验签 → 手机号归一 → 网关 merchant_bind（PHP 按归一后手机号查唯一商家
// 会员、校验 waimai_shop_manager 归属、冲突 409、三维限频、写审计、写 fbs_merchant_map）→
// 网关 merchant_session（只读 fbs_merchant_map → 会员 → 签火鸟会员 cookie）→
// Set-Cookie 原样透传 + 302 /wmsj/。
//
// 几条不能"顺手优化"的约束（每条都有对应的 Node 用例或线上事故背景）：
//   - **绝不静默成功**：网关 2xx 但 success !== true、或 member_id 不是正的安全整数，
//     一律按失败处理（502 MERCHANT_FAILED），不能当成功去签会话。
//   - **绝不静默顶替**：冲突（409）原样呈现给用户，Node/PHP 两侧都不做覆盖式重绑；
//     Go 侧更不写任何表（映射写入只发生在 PHP 网关）。
//   - **两段失败文案必须区分**（G-8 同款教训）：merchant_bind 失败 →「服务暂时不可用」；
//     merchant_session 失败时绑定已成立 → 「绑定已生效，…」。文案混用会诱导用户换号重绑，
//     重绑会撞 TG_ALREADY_BOUND。
//   - **302 之前必须先写 Set-Cookie**：Go 的 http.Redirect（或任何 WriteHeader）之后再写
//     header 就晚了 —— 顺序错了 cookie 静默丢失，表现为「绑定成功但后台仍游客」。
//   - **日志只记错误消息**（截断 300）：initData 是短期凭证、手机号是个人信息，都不能进日志。

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/gateway"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/httpbody"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/tgauth"
)

const (
	// 错误码与 Node 逐字一致（前端/bot 侧按码分支，不按文案匹配）。
	CodeNotConfigured    = "MERCHANT_NOT_CONFIGURED"
	CodeInvalidInitData  = "INVALID_INIT_DATA"
	CodeRateLimited      = "RATE_LIMITED"
	CodeInvalidPhone     = "INVALID_PHONE"
	CodeFailed           = "MERCHANT_FAILED"
	CodeBindConflict     = "BIND_CONFLICT"
	CodeBindRateLimited  = "BIND_RATE_LIMITED"
	CodeMerchantNotFound = "MERCHANT_NOT_FOUND"
	CodeMerchantNoShop   = "MERCHANT_NO_SHOP"
	CodeMemberDisabled   = "MEMBER_DISABLED"
	CodeAuditUnavailable = "AUDIT_UNAVAILABLE"
	CodeSessionFailed    = "MERCHANT_SESSION_FAILED"

	// 错误页文案：全部与 merchantRoute.js 逐字一致（含标点与全角引号）。
	rateLimitedMessage        = "操作过于频繁，请稍后再试"
	invalidInitDataMessage    = "请从 Telegram 内重新打开本页面"
	invalidPhoneMessage       = "手机号格式不正确。支持 09178889999 或 +639178889999 等写法。"
	serviceUnavailableMessage = "服务暂时不可用，请稍后重试"
	// sessionFailedMessage 是 G-8 的核心：绑定已经生效，不能复述「服务暂时不可用」，
	// 更不能诱导用户换号重绑（会撞 TG_ALREADY_BOUND）。
	sessionFailedMessage = "绑定已生效，但进入商家后台暂时失败，请稍后从 Telegram 重新打开"
	notFoundMessage      = "未找到该手机号对应的商家账号。请确认号码与站点登记的会员手机号一致后重试。"
	noShopMessage        = "该商家账号还没有被分配外卖店铺。请联系运营在后台「外卖 → 店铺 → 管理会员」里分配后再试。"
	disabledMessage      = "该商家账号当前不可用（已停用或已申请注销），请联系运营核实。"
	conflictFallback     = "该手机号或当前账号已存在绑定关系，如需换绑请联系运营。"

	// 日志前缀与 Node 的 console.error 前缀一致，用于区分「绑定失败」与
	// 「绑定成功但换会话失败」两类线上问题。
	bindLogPrefix   = "[merchant/bind] failed: "
	sessionOKPrefix = "[merchant/bind] bind ok but session failed: "
	sessLogPrefix   = "[merchant/session] failed: "
)

// conflictMessages 对应 Node 的 BIND_MESSAGES：409 冲突码 → 用户可执行的提示。
// 刻意不写「请联系管理员」这类没有落点的句子 —— 能自己换的（重输手机号）就让他换；
// 只有运营能解的就明确写出「找运营做什么」。
//
// 与 Node 的唯一差别：JS 是普通对象查表，原型链键会命中函数；Go 用 map 查表，
// 未知码一律落兜底文案（conflictFallback）。
var conflictMessages = map[string]string{
	"MERCHANT_ALREADY_BOUND": "该商家账号已被其他 Telegram 绑定，原绑定保持不变。如需换绑，请联系运营在后台解除后再试。",
	"TG_ALREADY_BOUND":       "当前 Telegram 已绑定其他商家账号，原绑定保持不变。如需换绑，请联系运营在后台解除后再试。",
	"MERCHANT_AMBIGUOUS":     "该手机号匹配到多个商家账号，无法自动绑定。请联系运营核对会员手机号后再试。",
}

// PostBind 是 POST /tg-api/merchant/bind 的处理器（Node: postBind）。
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

	r.bindAndRedirect(w, req, verified, httpbody.Text(fields, "initData"), phone)
}

// bindAndRedirect 是 Node postBind 里两个 try 块的整体：绑 → 换会话 → Set-Cookie + 302。
func (r *Route) bindAndRedirect(w http.ResponseWriter, req *http.Request, verified tgauth.Result, initData, phone string) {
	tgID, ok := tgIDString(verified)
	if !ok {
		// 数字身份只从验签结果取；拿不到就是异常（tgauth 保证 user.id 是正安全整数，
		// 这条分支实际不可达，保留它是为了与 Node 的「异常输入必失败」口径对齐）。
		r.logFailure(bindLogPrefix, errors.New("merchant_bind failed"))
		r.sendErrorPage(w, http.StatusBadGateway, CodeFailed, serviceUnavailableMessage)
		return
	}

	// 只把 hash 交给网关记账，原文不出进程（原文含用户资料，且网关不需要它）。
	initDataHash := sha256Hex(initData)

	// 1) 绑定：PHP 按归一后手机号查唯一商家会员 → 校验店铺归属 → 冲突检查（绝不静默顶替）
	//    → 三维度限频 → 写审计 → 写 fbs_merchant_map。
	bind, err := r.gateway.MerchantBind(req.Context(), map[string]any{
		// Node: String(v.user.id) —— 字符串进网关，PHP 侧按字符串拼审计与限频键。
		"tg_user_id": tgID,
		"phone":      phone,
		// Node: req.ip || '' —— 只为 PHP 侧的 ip 维度限频与审计，不进日志。
		"ip": r.ClientKey(req),
	})
	if err != nil {
		// 非 2xx 的差异化还原全在 sendBindError 里（409/429/404/403/503 → 502 兜底）。
		r.sendBindError(w, err)
		return
	}
	if _, ok := boundMemberID(bind); !ok {
		// 2xx 但 success !== true 或 member_id 非法：绝不静默成功（Node 是 throw 进 catch）。
		r.logFailure(bindLogPrefix, errors.New("merchant_bind failed"))
		r.sendErrorPage(w, http.StatusBadGateway, CodeFailed, serviceUnavailableMessage)
		return
	}

	// 2) 换会话：PHP 只读 fbs_merchant_map → 会员 → 签会员 cookie（HN_login_user + HN_tg 等）。
	session, err := r.gateway.MerchantSession(req.Context(), map[string]any{
		"tg_user_id":     tgID,
		"init_data_hash": initDataHash,
	})
	if err != nil {
		r.logFailure(sessionOKPrefix, err)
		r.sendErrorPage(w, http.StatusBadGateway, CodeSessionFailed, sessionFailedMessage)
		return
	}
	cookies, _, _, redirect, ok := sessionCookies(session)
	if !ok {
		// 绑定已经成立，会话失败不能再报「绑定失败」（会诱导用户换号重绑 → 撞 TG_ALREADY_BOUND）。
		r.logFailure(sessionOKPrefix, errors.New("merchant_session returned invalid payload"))
		r.sendErrorPage(w, http.StatusBadGateway, CodeSessionFailed, sessionFailedMessage)
		return
	}

	// Cookie 原样透传：不增、不删、不改属性、不重新排序。
	// 必须在 302（WriteHeader）之前写 —— 见文件头注释第 4 条。
	w.Header()["Set-Cookie"] = cookies
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("Referrer-Policy", "no-referrer")
	w.Header().Set("X-Content-Type-Options", "nosniff")

	// 302 与 Set-Cookie 同时下发：表单 POST 的重定向响应上浏览器一定采纳 Set-Cookie
	// （经典登录写法）。目标过 SafeRedirect：网关返回值也不可信（开放重定向）。
	redirectToMerchant(w, req, SafeRedirect(redirect))
}

// sendBindError 复刻 sendBindError：把网关的差异化结果码还原成可执行的提示。
//
// 409/429/404/403/503 是「业务失败」；其余（超时、网络、5xx、坏 JSON）一律 502 兜底
// 并落一行日志。注意：这五种业务失败**不写日志**（Node 原文如此）——
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
				message = conflictFallback
			}
			r.sendErrorPage(w, http.StatusConflict, conflictCode, message)
			return
		case http.StatusTooManyRequests:
			// PHP 侧三维度限频（tg/phone/ip）到顶：码固定为 BIND_RATE_LIMITED，
			// 与本地 IP 限频的 RATE_LIMITED 区分，便于前端/日志分辨是哪一层拦的。
			r.sendErrorPage(w, http.StatusTooManyRequests, CodeBindRateLimited, rateLimitedMessage)
			return
		case http.StatusNotFound:
			if code == CodeMerchantNoShop {
				r.sendErrorPage(w, http.StatusNotFound, code, noShopMessage)
				return
			}
			notFoundCode := code
			if notFoundCode == "" {
				notFoundCode = CodeMerchantNotFound
			}
			r.sendErrorPage(w, http.StatusNotFound, notFoundCode, notFoundMessage)
			return
		case http.StatusForbidden:
			// MEMBER_DISABLED / MEMBER_CANCELLED：账号状态问题，用户自己改不了。
			disabledCode := code
			if disabledCode == "" {
				disabledCode = CodeMemberDisabled
			}
			r.sendErrorPage(w, http.StatusForbidden, disabledCode, disabledMessage)
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
	r.logFailure(bindLogPrefix, err)
	r.sendErrorPage(w, http.StatusBadGateway, CodeFailed, serviceUnavailableMessage)
}

// Session 是 POST /tg-api/merchant/session 的处理器（Node: session，JSON 形态，
// 供 bot/n8n 侧对接）。
func (r *Route) Session(w http.ResponseWriter, req *http.Request) {
	// 进入函数第一件事就是 no-store，且在 notConfigured 判断**之前**：
	// 503/401/502 的响应体同样不能被缓存。
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("Referrer-Policy", "no-referrer")

	if r.notConfigured {
		writeJSON(w, http.StatusServiceUnavailable, failureBody{
			Error: errorDetail{Code: CodeNotConfigured, Message: "merchant entry not configured"},
		})
		return
	}

	// 【安全】initData 只认 POST body（Node: `(req.body && req.body.initData) || ''`）。
	// 刻意**不**读 query：initData 是短期凭证，走 query 会落进访问日志、Referer
	// 与浏览器历史（rider m5 同口径）。
	initData := httpbody.Text(httpbody.FieldsOf(req), "initData")
	verified := r.validate(initData, r.botToken)
	if !verified.Valid {
		writeJSON(w, http.StatusUnauthorized, failureBody{
			Error: errorDetail{Code: CodeInvalidInitData, Message: "Invalid or missing initData"},
		})
		return
	}
	tgID, ok := tgIDString(verified)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, failureBody{
			Error: errorDetail{Code: CodeInvalidInitData, Message: "Invalid initData user"},
		})
		return
	}
	initDataHash := sha256Hex(initData)

	session, err := r.gateway.MerchantSession(req.Context(), map[string]any{
		"tg_user_id":     tgID,
		"init_data_hash": initDataHash,
	})
	if err != nil {
		var gatewayErr *gateway.Error
		if errors.As(err, &gatewayErr) && gatewayErr.Code == gateway.CodeHTTPError {
			code, _ := payloadErrorCode(gatewayErr.Payload)
			// 未绑定不是错误：调用方（bot/n8n）据此决定是否引导去绑定页。
			if gatewayErr.Status == http.StatusNotFound && code == "MERCHANT_NOT_BOUND" {
				writeJSON(w, http.StatusOK, successBody{Success: true, Data: sessionData{Bound: false}})
				return
			}
			if gatewayErr.Status == http.StatusNotFound && code == CodeMerchantNoShop {
				writeJSON(w, http.StatusForbidden, failureBody{
					Error: errorDetail{Code: code, Message: "该商家账号还没有被分配外卖店铺"},
				})
				return
			}
		}
		// 只记消息：err 与请求体可能携带 initData / 手机号，不能整体进日志。
		r.logFailure(sessLogPrefix, err)
		writeJSON(w, http.StatusBadGateway, failureBody{
			Error: errorDetail{Code: CodeFailed, Message: "Service temporarily unavailable"},
		})
		return
	}
	cookies, memberID, shopIDs, redirect, ok := sessionCookies(session)
	if !ok {
		r.logFailure(sessLogPrefix, errors.New("merchant_session returned invalid payload"))
		writeJSON(w, http.StatusBadGateway, failureBody{
			Error: errorDetail{Code: CodeFailed, Message: "Service temporarily unavailable"},
		})
		return
	}

	// Cookie 原样透传：不增、不删、不改属性、不重新排序。
	w.Header()["Set-Cookie"] = cookies
	writeJSON(w, http.StatusOK, successBody{
		Success: true,
		Data: sessionData{
			Bound:    true,
			MemberID: memberID,
			ShopIDs:  shopIDs,
			Redirect: SafeRedirect(redirect),
		},
	})
}

// sha256Hex 与 Node 的 crypto.createHash('sha256').update(initData).digest('hex') 一致。
func sha256Hex(value string) string {
	sum := sha256.Sum256([]byte(value))
	return hex.EncodeToString(sum[:])
}

// writeJSON 与 Node 的 res.json 对齐：不转义 <、>、&，也不追加结尾换行。
// 不导出也不跨包复用：tglogin / rider / checkout 各自有一份同样的实现（同为路由包）。
func writeJSON(w http.ResponseWriter, status int, body any) {
	buf := &bytes.Buffer{}
	encoder := json.NewEncoder(buf)
	encoder.SetEscapeHTML(false)
	if err := encoder.Encode(body); err != nil {
		http.Error(w, `{"success":false,"error":{"code":"MERCHANT_FAILED","message":"encode failed"}}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_, _ = w.Write(bytes.TrimSuffix(buf.Bytes(), []byte("\n")))
}
