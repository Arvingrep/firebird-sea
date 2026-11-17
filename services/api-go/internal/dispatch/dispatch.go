// Package dispatch 是 POST /tg-api/internal/dispatch（T7 骑手派单 Telegram 通知）的 Go 版移植。
//
// 真值来源（改任何一行前必须回原文，不许凭印象）：
//   - services/api/src/dispatchRoute.js 整篇 247 行（EVENTS / EVENT_TEXT / sendTelegramMessage /
//     firstInt / verify / postDispatch / deliver / drain）
//   - services/api/src/server.js:467-500 的装配，以及 50-52 行 express.json 的 verify 钩子
//     （只对 /tg-api/internal/* 存 req.rawBody）
//   - services/api/test/dispatch-route.test.js 591 行（用例逐条翻译进 dispatch_test.go）
//   - docs/api/openapi.yaml 的 /tg-api/internal/dispatch
//   - 迁移 005/006/008 里 fbs_dispatch_dedup 的建表与唯一键（只读，不改）
//
// 四条硬口径：
//  1. **收下即返回**（M3）：验签 + 去重占位写库后立刻 202 accepted，sendMessage 与重试全部在
//     响应之后异步执行。202 只代表「已受理」；之后的查绑定/换 URL/发消息失败一律只落日志，
//     并在最终失败时释放去重占位，让下一次同键事件能重发。
//  2. **签名覆盖原始字节**：PHP json_encode 的转义形态与 JSON.stringify 重序列化不保证相同，
//     所以必须用 httpbody.RawOf 拿到的原始字节参与 HMAC（见 rawBodyOf）。
//  3. **去重键是三元组** (event, order_id, courier_id)：二元组会把「同一订单改派给第二位
//     骑手」的通知静默吞掉（006 迁移修的就是这个 bug）。
//  4. **日志卫生**：每条日志都带 event/order_id/courier_id 供按单号 grep；bot token、
//     签名、工作台直达 URL 一律不进日志（见 Route.log 的注释）。
package dispatch

import (
	"bytes"
	"context"
	"crypto/subtle"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/gateway"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/httpbody"
)

const (
	// 错误码与 Node 逐字一致（PHP 挂点按码分支，不按文案匹配）。
	CodeNotConfigured = "DISPATCH_NOT_CONFIGURED"
	CodeBadSignature  = "BAD_SIGNATURE"
	CodeInvalidEvent  = "INVALID_EVENT"
	CodeInvalidParam  = "INVALID_PARAM"

	// action 是签名串里的动作常量（gatewayClient.sign 的同一套口径，方向反转：PHP→Node）。
	action = "dispatch"

	// signatureWindowSeconds 是时间戳的容忍窗口（与网关非凭证动作一致）。
	signatureWindowSeconds = 60

	// maxBackoffSeconds / retryDelaySeconds 对应 Node 的 MAX_BACKOFF_SEC 与固定重试延迟：
	// 429 带 retry_after 时按它退避，其余一律 1s，上限 5s（避免一个 429 把队列压死）。
	maxBackoffSeconds  = 5
	retryDelaySeconds  = 1
	defaultSendTimeout = 5 * time.Second

	// logMessageLimit 对齐 Node 的 slice(0, 200)（个别调用点 Node 截 120，见 describeSendError）。
	logMessageLimit = 200

	// maxSafeInteger 等价 JS 的 Number.MAX_SAFE_INTEGER（2^53-1）。
	maxSafeInteger = 1<<53 - 1

	// eventReclaim 是唯一不带按钮的事件（订单被客服收回，原骑手已无该单）。
	eventReclaim = "reclaim"
)

// Events 是合法事件白名单。错误文案由它拼出（Node m2：加事件时不会忘记改文案），
// 所以这里**不许**在别处硬编码事件列表。
var Events = []string{"new_order", "grab", "reassign", "reclaim"}

// eventText 是四种事件的区分文案。键必须与 Events 一一对应（TestEventsAndTextAreInSync 钉住）。
var eventText = map[string]string{
	"new_order": "🛵 您有新的配送订单",
	"grab":      "✅ 抢单成功，订单已分配给您",
	"reassign":  "🔁 订单已改派给您",
	"reclaim":   "📤 订单已被客服收回，无需继续配送",
}

var (
	// digitsPattern 对应 Node 的 /^\d+$/（时间戳只允许纯数字，"-1"/"12.5"/"" 都不行）。
	digitsPattern = regexp.MustCompile(`^\d+$`)
	// signaturePattern 对应 Node 的 /^[0-9a-f]{64}$/（小写十六进制，长度 64）。
	signaturePattern = regexp.MustCompile(`^[0-9a-f]{64}$`)
)

// Gateway 是派单通知唯一用到的网关动作（rider_notify_url）。
// 生产装配 internal/gateway + Config；测试注入假实现。
type Gateway interface {
	RiderNotifyURL(ctx context.Context, params map[string]any) (map[string]any, error)
}

// SendFunc 是 sendMessage 的可注入形态（Node 的 deps.sendMessage）。payload 里已含
// chat_id / text / reply_markup，实现方只管把它发出去。
type SendFunc func(ctx context.Context, message Message) error

// Dep 注入全部依赖，测试逐项替换。
type Dep struct {
	// Secret 是 HMAC 密钥（FBS_GATEWAY_SECRET，与 PHP 侧共享，不引入新密钥）。
	Secret string
	// BotToken 是 TELEGRAM_BOT_TOKEN（PHP 容器不持有它，这正是走中转的原因）。
	BotToken string
	// DB 是 fbs_courier_map 读 / fbs_dispatch_dedup 读写的连接池。
	// 为 nil **不是**「未配置」——见 noDBStore 的注释（Node 的 conn 恒非空）。
	DB *sql.DB
	// Gateway 为 nil 表示 FBS_GATEWAY_URL / FBS_GATEWAY_SECRET 没配齐
	// （Node 的 `process.env.X && process.env.Y ? {...} : null`），此时降级为纯文本无按钮。
	Gateway Gateway
	// SendMessage 可注入；nil 时走 SendTelegram（真实 Bot API，5s 超时）。
	SendMessage SendFunc
	// SendTimeout 是默认发送超时（Node 的 sendTimeoutMs = 5000）。
	SendTimeout time.Duration
	// HTTPClient 只给默认发送实现用（测试用自定义 Transport 拦截，URL 仍是真实端点）。
	HTTPClient *http.Client
	// Wait 是重试退避（Node 的 deps.wait）。测试注入以便瞬返，不要真睡。
	Wait func(d time.Duration)
	// Now 是验签窗口用的时钟（Node 的 deps.now，秒级）。
	Now func() time.Time
	// Logf 接收一行结构化日志（默认写 stderr）。
	Logf func(line string)

	// store 是 Store 的测试注入点（等价 Node 用例里的 makeConn）。
	// 生产一律由 DB 构造（sqlStore），留这个字段而不是导出一个 Store 依赖，
	// 是为了不把「到底走 DB 还是走注入」变成调用方要判断的第二套装配语义。
	store Store
}

// Route 是一次构造、多请求复用的处理器。
type Route struct {
	secret  string
	store   Store
	gateway Gateway
	send    SendFunc
	wait    func(time.Duration)
	now     func() time.Time
	logf    func(line string)
	// notConfigured 为 true 时端点统一 503（进程不因此退出）。
	notConfigured bool
	// inflight 是在飞投递任务的计数，Drain 用它排空（Node 的 inflight Set + drain()）。
	inflight sync.WaitGroup
}

// delivery 是一次异步投递的任务描述。claimed 表示「去重占位是本次写进去的」，
// 只有 claimed 时失败才需要释放（否则释放的是别人占的位）。
type delivery struct {
	event     string
	orderID   int64
	courierID int64
	claimed   bool
}

// New 构造派单通知处理器。缺配置不返回 error：Node 也是构造出一个 notConfigured 的
// route 继续挂载，由端点自己 503，这样 /health 仍可探活、其它路由不受影响。
func New(d Dep) *Route {
	now := d.Now
	if now == nil {
		now = time.Now
	}
	logf := d.Logf
	if logf == nil {
		logf = func(line string) { _, _ = os.Stderr.WriteString(line + "\n") }
	}
	wait := d.Wait
	if wait == nil {
		wait = time.Sleep
	}
	timeout := d.SendTimeout
	if timeout <= 0 {
		timeout = defaultSendTimeout
	}

	// 缺失项清单与 Node 同序：FBS_GATEWAY_SECRET → TELEGRAM_BOT_TOKEN → DB_HOST。
	// 第三条在两侧**都是死代码**：Node 的 conn 恒非空（server.js:458 传 cliConn()，
	// migrate.js:37-52 无条件返回一个 query 对象，缺库只在真正 spawn 时 reject），
	// 所以生产装配里 `if (!conn)` 永远不成立。Go 侧同理——没有连接池时用 noDBStore
	// （每次查询都失败），端点仍然 202 + 异步失败落日志，不凭空多出一条 Node 没有的 503。
	// 这条口径在 rider 上踩过：做成门禁后被真双进程对拍抓到（缺 DB：Node 200 / Go 503）。
	missing := make([]string, 0, 3)
	if d.Secret == "" {
		missing = append(missing, "FBS_GATEWAY_SECRET")
	}
	if d.BotToken == "" {
		missing = append(missing, "TELEGRAM_BOT_TOKEN")
	}

	store := d.store
	if store == nil {
		if d.DB != nil {
			store = sqlStore{db: d.DB}
		} else {
			store = noDBStore{}
		}
	}

	send := d.SendMessage
	if send == nil {
		botToken := d.BotToken
		client := d.HTTPClient
		send = func(ctx context.Context, message Message) error {
			return SendTelegram(ctx, botToken, message, SendOptions{Timeout: timeout, Client: client})
		}
	}

	route := &Route{
		secret:        d.Secret,
		store:         store,
		gateway:       d.Gateway,
		send:          send,
		wait:          wait,
		now:           now,
		logf:          logf,
		notConfigured: len(missing) > 0,
	}
	if route.notConfigured {
		// 只点名缺哪个环境变量（排障需要），绝不打印变量值。
		route.log("warn", "派单通知未配置，端点将返回 503，缺失项："+strings.Join(missing, "；"), "", "")
	}
	return route
}

// NotConfigured 暴露构造期判定，供装配层/测试断言。
func (r *Route) NotConfigured() bool { return r.notConfigured }

// Drain 等在飞投递排空。ctx 到期时返回 ctx.Err()（生产装配用它做 8s 上限）。
//
// Node 的 drain() 是 `while (inflight.size > 0) await Promise.all(...)`：能兜住
// 「排空过程中又新起一个任务」。Go 的 WaitGroup.Wait 在计数归零时就返回，理论上
// 排空途中新起的任务可能落在 Wait 之后 —— 生产上那一刻 HTTP 监听已经在关
// （见 cmd/api 的 SIGTERM 顺序），新任务只可能来自 shutdown 之前那几毫秒的在途请求，
// 上限 8s 的排空窗口足够。这个差异写在这里，别当成等价。
func (r *Route) Drain(ctx context.Context) error {
	done := make(chan struct{})
	go func() {
		r.inflight.Wait()
		close(done)
	}()
	select {
	case <-done:
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

// Dispatch 是 POST /tg-api/internal/dispatch 的处理器。
func (r *Route) Dispatch(w http.ResponseWriter, req *http.Request) {
	if r.notConfigured {
		writeJSON(w, http.StatusServiceUnavailable, failureBody{Error: errorDetail{
			Code:    CodeNotConfigured,
			Message: "dispatch notify not configured",
		}})
		return
	}

	fields := httpbody.FieldsOf(req)
	if !r.verify(req, rawBodyOf(req, fields)) {
		writeJSON(w, http.StatusUnauthorized, failureBody{Error: errorDetail{
			Code:    CodeBadSignature,
			Message: "invalid timestamp or signature",
		}})
		return
	}

	// event 先判、参数后判：Node 的顺序如此（{event:'evil', order_id:0} 给的是
	// INVALID_EVENT 而不是 INVALID_PARAM），别调换。
	event := httpbody.Text(fields, "event")
	if !isEvent(event) {
		writeJSON(w, http.StatusBadRequest, failureBody{Error: errorDetail{
			Code: CodeInvalidEvent,
			// 文案由 Events 拼出（Node m2），别硬编码列表。
			Message: "event must be one of " + strings.Join(Events, "|"),
		}})
		return
	}
	orderID, orderOK := positiveSafeInt(fields["order_id"])
	courierID, courierOK := positiveSafeInt(fields["courier_id"])
	if !orderOK || !courierOK {
		writeJSON(w, http.StatusBadRequest, failureBody{Error: errorDetail{
			Code:    CodeInvalidParam,
			Message: "order_id / courier_id must be positive integers",
		}})
		return
	}

	// 去重占位：INSERT 成功 = 本次由我们负责发；撞唯一键 = 已有副本在发/已发过。
	// 其它写库异常（DB 抖动）不阻断投递——宁可重发不可漏发，只是失去本轮去重保护。
	claimed, duplicate, err := r.store.Claim(req.Context(), event, orderID, courierID)
	if err != nil {
		r.log("error", "dedup claim failed", contextTag(event, orderID, courierID), err.Error())
	}
	if duplicate {
		writeJSON(w, http.StatusAccepted, acceptedBody{Success: true, Accepted: true, Dedup: true})
		return
	}

	// 收下即返回：从这里往下不再影响 HTTP 响应（M3）。
	writeJSON(w, http.StatusAccepted, acceptedBody{Success: true, Accepted: true})

	task := delivery{event: event, orderID: orderID, courierID: courierID, claimed: claimed}
	// 投递必须脱离请求生命周期：Node 在响应之后继续跑（请求早已结束），
	// 沿用 req.Context() 会让投递跟着连接一起被取消。WithoutCancel 保留 context 里的值、
	// 丢掉取消信号与 deadline，等价于 Node 的「响应后独立异步」。
	ctx := context.WithoutCancel(req.Context())
	r.inflight.Add(1)
	go func() {
		defer r.inflight.Done()
		r.deliver(ctx, task)
	}()
}

// verify 复刻 Node 的 verify()：timestamp 必须 ^\d+$ 且在 ±60 秒内，
// signature 必须 ^[0-9a-f]{64}$，签名串 ts + "\n" + "dispatch" + "\n" + rawBody，
// HMAC-SHA256(secret) 取十六进制，最后**常量时间**比较。
func (r *Route) verify(req *http.Request, rawBody string) bool {
	timestamp := req.Header.Get("x-fbs-timestamp")
	signature := req.Header.Get("x-fbs-signature")
	if !digitsPattern.MatchString(timestamp) {
		return false
	}
	stamp, err := strconv.ParseInt(timestamp, 10, 64)
	if err != nil {
		// 位数多到溢出 int64：JS 那边是 Number(ts) 变成巨大值，|now - ts| > 60 → false。
		return false
	}
	if drift := r.now().Unix() - stamp; drift > signatureWindowSeconds || drift < -signatureWindowSeconds {
		return false
	}
	if !signaturePattern.MatchString(signature) {
		return false
	}
	// 复用 gateway.Sign：它就是 ts\naction\nbody 的 HMAC-SHA256 十六进制，
	// 与 gatewayClient.js 的 sign() 同一份算法（这里是反向使用）。
	expected := gateway.Sign(r.secret, timestamp, action, rawBody)
	// 两侧长度都已被 signaturePattern 固定为 64，ConstantTimeCompare 不会因长度不同提前返回。
	// （Node 用 crypto.timingSafeEqual，同样的口径。）
	return subtle.ConstantTimeCompare([]byte(expected), []byte(signature)) == 1
}

// rawBodyOf 取参与签名的原始字节。
//
// Node 用 express.json 的 verify 钩子「只对 /tg-api/internal/*」把原文存进 req.rawBody；
// Go 侧的等价物是装配层中间件 httpbody.With（internal/httpapi/server.go 的 wrap()）。
// 那条中间件对**所有**请求都写（不限前缀，只是条件更宽、语义不变），所以正常请求
// RawOf 一定有值。
//
// 没经过中间件时（包级测试直接调处理器）退回「重新序列化字段表」，与 Node 的
// `JSON.stringify(req.body || {})` 兜底同构：两条兜底都拿不到 PHP 签的那份字节，
// 所以都会验签失败 —— 这不是绕过，而是把「没有原文就等于验不过」这件事写清楚。
func rawBodyOf(req *http.Request, fields map[string]any) string {
	if raw := httpbody.RawOf(req); raw != nil {
		return string(raw)
	}
	encoded, err := encodeJSONNoEscape(fields)
	if err != nil {
		return "{}"
	}
	return string(encoded)
}

// deliver 是 Node deliver() 的整体：查绑定 → 换一次性直达 URL → sendMessage（失败重试 1 次）
// → 顺手清理过期去重行。任何最终失败都释放占位（仅当 claimed）。
func (r *Route) deliver(ctx context.Context, task delivery) {
	tag := contextTag(task.event, task.orderID, task.courierID)
	// Node 的最外层 try/catch：整段崩了也要释放占位。Go 里显式错误分支已覆盖所有已知
	// 失败形态，recover 只是兜住「没预料到的 panic」，语义与 Node 的 catch 对齐。
	defer func() {
		if recovered := recover(); recovered != nil {
			r.log("error", "deliver crashed", tag, fmt.Sprint(recovered))
			r.releaseIfClaimed(ctx, task)
		}
	}()

	// 查绑定：查不到（或查失败）就没法发，释放占位让下次能重试。
	tgUserID, bound, err := r.store.TelegramUser(ctx, task.courierID)
	if err != nil {
		r.log("error", "courier_map lookup failed", tag, err.Error())
	}
	if !bound {
		r.log("warn", "skip: courier not bound", tag, "")
		r.releaseIfClaimed(ctx, task)
		return
	}

	// 一次性工作台直达 URL（打开即该订单详情）；网关失败降级为无按钮纯文本。
	// reclaim 是「订单已被收回」的通知，原骑手已无该订单，生成详情按钮只会误导。
	target := ""
	if task.event != eventReclaim {
		target = r.notifyURL(ctx, task, tag)
	}

	message := Message{
		ChatID: tgUserID,
		Text:   eventText[task.event] + "\n订单号：" + strconv.FormatInt(task.orderID, 10),
	}
	if target != "" {
		message.ReplyMarkup = &ReplyMarkup{InlineKeyboard: [][]InlineButton{{{Text: "查看订单", URL: target}}}}
	}

	if !r.sendWithRetry(ctx, message, task, tag) {
		return
	}
	// 顺手清理过期去重行（TTL 1 天），失败不影响本次投递（008 迁移为这条 DELETE 建了索引）。
	_ = r.store.PruneExpired(ctx)
}

// notifyURL 调网关 rider_notify_url 换一次性订单直达 URL。
// 成功形态（canary 新契约）：200 {success:true, data:{url}}；非 2xx 由 gatewayClient reject。
// 任何不符都返回空串（= 降级纯文本），URL 绝不进日志。
func (r *Route) notifyURL(ctx context.Context, task delivery, tag string) string {
	if r.gateway == nil {
		// FBS_GATEWAY_URL / FBS_GATEWAY_SECRET 没配齐：Node 那边 gateway 就是 null，
		// 连调用都不发生（不是「调用失败」），所以这里也不打日志。
		return ""
	}
	result, err := r.gateway.RiderNotifyURL(ctx, map[string]any{
		"order_id":   task.orderID,
		"courier_id": task.courierID,
	})
	if err != nil {
		r.log("error", "rider_notify_url failed", tag, err.Error())
		return ""
	}
	// Node 写的是 `r.success === true` —— **严格**等于 true，不是「真值」，
	// 所以不能用 gateway.Bool（它把 "0"/非空字符串都当 true）。
	success, isBool := result["success"].(bool)
	if !isBool || !success {
		return ""
	}
	data, ok := gateway.Map(result, "data")
	if !ok {
		return ""
	}
	target, ok := gateway.Str(data, "url")
	if !ok || !strings.HasPrefix(target, "https://") {
		// Node: /^https:\/\//.test(url)，http:// 之类一律不接受（也保证恶意 URL 进不了按钮）。
		return ""
	}
	return target
}

// sendWithRetry 发一次，失败按退避重试一次；两次都失败就释放占位并返回 false。
func (r *Route) sendWithRetry(ctx context.Context, message Message, task delivery, tag string) bool {
	if err := r.send(ctx, message); err != nil {
		// m9：429 按其 retry_after 退避，其余给固定 1s；退避上限 MAX_BACKOFF_SEC。
		backoff := backoffSeconds(err)
		r.log("error", "sendMessage attempt 1 failed"+fmt.Sprintf(" backoff=%ds", backoff), tag, describeSendError(err))
		r.wait(time.Duration(backoff) * time.Second)
		if retryErr := r.send(ctx, message); retryErr != nil {
			r.log("error", "sendMessage failed twice", tag, describeSendError(retryErr))
			r.releaseIfClaimed(ctx, task)
			return false
		}
	}
	return true
}

// releaseIfClaimed 只在「占位是本次写的」时释放，避免把别的副本占的位删掉。
func (r *Route) releaseIfClaimed(ctx context.Context, task delivery) {
	if !task.claimed {
		return
	}
	if err := r.store.Release(ctx, task.event, task.orderID, task.courierID); err != nil {
		// 释放失败只影响「同键重发要等 TTL 清理」，不影响本次投递。
		r.log("error", "release dedup failed", contextTag(task.event, task.orderID, task.courierID), err.Error())
	}
}

// backoffSeconds 复刻 `Math.min(Number(err.retryAfter) || 1, MAX_BACKOFF_SEC)`。
func backoffSeconds(err error) int {
	retryAfter := 0
	var sendErr *SendError
	if errors.As(err, &sendErr) {
		retryAfter = sendErr.RetryAfter
	}
	if retryAfter <= 0 {
		retryAfter = retryDelaySeconds
	}
	return min(retryAfter, maxBackoffSeconds)
}

// describeSendError 拼日志用的错误描述：错误消息截 120（Node 口径）+ 响应原文片段截 200。
// 只放 telegram 的响应片段，不放请求 URL（URL 里有 bot token）。
func describeSendError(err error) string {
	detail := truncate(err.Error(), 120)
	var sendErr *SendError
	if errors.As(err, &sendErr) && sendErr.Snippet != "" {
		detail += " resp: " + truncate(sendErr.Snippet, logMessageLimit)
	}
	return detail
}

// contextTag 拼「按单号 grep」用的上下文（Node 的 ctx()）。日志里必须有它。
func contextTag(event string, orderID, courierID int64) string {
	return fmt.Sprintf("event=%s order_id=%d courier_id=%d", event, orderID, courierID)
}

// log 写一行结构化日志。
//
// 两条纪律：
//   - message 后面强制拼上 event/order_id/courier_id（Node 的 ctx()），线上按订单号就能 grep；
//   - message 与 detail 里绝不允许出现 bot token、签名、或完整工作台 URL ——
//     调用方传入的 detail 只来自数据库/telegram 的错误文本，不来自请求头或 URL。
func (r *Route) log(level, message, tag, detail string) {
	entry := struct {
		Level   string `json:"level"`
		Route   string `json:"route"`
		Message string `json:"message"`
		Detail  string `json:"detail,omitempty"`
	}{
		Level:   level,
		Route:   "dispatch",
		Message: truncate(strings.TrimSpace(message+" "+tag), logMessageLimit),
		Detail:  truncate(detail, logMessageLimit),
	}
	line, err := encodeJSONNoEscape(entry)
	if err != nil {
		return
	}
	r.logf(string(line))
}

// isEvent 判事件是否在白名单内（顺序与 Events 声明一致）。
func isEvent(event string) bool {
	for _, candidate := range Events {
		if candidate == event {
			return true
		}
	}
	return false
}

// positiveSafeInt 复刻 `Number.isSafeInteger(v) && v > 0`，其中 v = Number(fields[key])。
// 注意 Number() 的强制转换：JSON 里的 "1001"（字符串）在 Node 是合法 order_id，
// 所以这里也必须先按 JS 口径转数字再判正整数（见 jsNumber）。
func positiveSafeInt(value any) (int64, bool) {
	number, ok := jsNumber(value)
	if !ok {
		return 0, false
	}
	if math.Abs(number) > maxSafeInteger || number != math.Trunc(number) || number <= 0 {
		return 0, false
	}
	return int64(number), true
}

// encodeJSONNoEscape 与 Node 的 JSON.stringify 对齐：不转义 <、>、&，也不追加结尾换行。
func encodeJSONNoEscape(value any) ([]byte, error) {
	buffer := &bytes.Buffer{}
	encoder := json.NewEncoder(buffer)
	encoder.SetEscapeHTML(false)
	if err := encoder.Encode(value); err != nil {
		return nil, err
	}
	return bytes.TrimSuffix(buffer.Bytes(), []byte("\n")), nil
}

// truncate 按 rune 截断，避免把多字节字符截成半个导致日志里出现乱码。
func truncate(value string, limit int) string {
	runes := []rune(value)
	if len(runes) <= limit {
		return value
	}
	return string(runes[:limit])
}

// —— 响应体 ——
//
// 字段顺序按 Node 的 res.json 落地顺序写（success → accepted → dedup），逐字节比对时有可比性。

type errorDetail struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type failureBody struct {
	Success bool        `json:"success"`
	Error   errorDetail `json:"error"`
}

// acceptedBody 是 202 的唯一形态：dedup=false 表示本次负责投递，true 表示同键已在投递/已投递。
type acceptedBody struct {
	Success  bool `json:"success"`
	Accepted bool `json:"accepted"`
	Dedup    bool `json:"dedup"`
}

// writeJSON 与 Node 的 res.json 对齐：不转义 <、>、&，也不追加结尾换行。
// 不导出也不跨包复用：rider / checkout / tglogin 各自有一份同样的实现（同为路由包），
// 跨包引用会形成反向依赖。
func writeJSON(w http.ResponseWriter, status int, body any) {
	encoded, err := encodeJSONNoEscape(body)
	if err != nil {
		http.Error(w, `{"success":false,"error":{"code":"DISPATCH_NOT_CONFIGURED","message":"encode failed"}}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_, _ = w.Write(encoded)
}
