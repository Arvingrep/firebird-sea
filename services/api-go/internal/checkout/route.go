package checkout

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/coins"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/httpbody"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/order"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/tgauth"
)

// 限流参数与 Node 版一致：同一 tg 用户 60s 内最多 5 次收银台请求。
const (
	CheckoutLimit  = 5
	CheckoutWindow = 60 * time.Second
)

// StatusFor 把业务码映射成 HTTP 状态（照搬 checkoutRoute.js 的 statusFor）。
func StatusFor(code string) int {
	switch code {
	case "BAD_REQUEST":
		return http.StatusBadRequest
	case "UNAUTHORIZED":
		return http.StatusUnauthorized
	case "ORDER_EXISTS":
		return http.StatusConflict
	case "ORDER_NOT_FOUND", "ORDER_FORBIDDEN", "ORDER_NOT_PAYABLE", "ORDER_INVALID":
		return http.StatusForbidden
	default:
		// RATE_* / TAIL_EXHAUSTED / EXPIRED 等一律 503（上游依赖不可用，可重试）。
		return http.StatusServiceUnavailable
	}
}

// RouteDep 注入收银台路由的依赖。测试可替换每一个字段。
type RouteDep struct {
	Env              func(string) string
	DB               *sql.DB
	GetRate          RateSource
	CoinsClient      *coins.Client
	ValidateInitData func(initData, botToken string) tgauth.Result
	BotToken         string
	Now              func() time.Time
	// Logger 接收未识别异常的一行 JSON（默认写 stderr）。
	Logger func(line string)
}

type apiErrorDetail struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type failureBody struct {
	Success bool           `json:"success"`
	Error   apiErrorDetail `json:"error"`
}

type successBody struct {
	Success bool `json:"success"`
	Data    Data `json:"data"`
}

type route struct {
	env      func(string) string
	db       *sql.DB
	getRate  RateSource
	validate func(initData, botToken string) tgauth.Result
	botToken string
	now      func() time.Time
	logf     func(string)

	mu   sync.Mutex
	hits map[int64][]time.Time
}

// NewRoute 返回可直接挂到 mux 的 http.HandlerFunc（Node: router.post('/checkout', ...)）。
func NewRoute(d RouteDep) http.HandlerFunc {
	env := d.Env
	if env == nil {
		env = os.Getenv
	}
	now := d.Now
	if now == nil {
		now = time.Now
	}
	validate := d.ValidateInitData
	if validate == nil {
		validate = func(initData, botToken string) tgauth.Result {
			return tgauth.Validate(initData, botToken, tgauth.Options{Now: now})
		}
	}
	getRate := d.GetRate
	if getRate == nil && d.CoinsClient != nil {
		getRate = CoinsRateSource(d.CoinsClient, now)
	}
	logf := d.Logger
	if logf == nil {
		logf = func(line string) { fmt.Fprintln(os.Stderr, line) }
	}

	r := &route{
		env:      env,
		db:       d.DB,
		getRate:  getRate,
		validate: validate,
		botToken: d.BotToken,
		now:      now,
		logf:     logf,
		hits:     make(map[int64][]time.Time),
	}
	return r.serve
}

func (r *route) serve(w http.ResponseWriter, req *http.Request) {
	if r.env("CHECKOUT_ENABLED") != "1" {
		writeJSON(w, http.StatusServiceUnavailable, failureBody{
			Error: apiErrorDetail{Code: "CHECKOUT_DISABLED", Message: "收银台暂未开放"},
		})
		return
	}

	body := parseBody(req)
	// 头部优先：TMA 前端的 initData 走自定义头，body 里的 initData 只是兼容旧调用。
	initData := req.Header.Get("X-Telegram-Init-Data")
	if initData == "" {
		initData = body.InitData
	}

	auth := r.validate(initData, r.botToken)
	if !auth.Valid || auth.User == nil || auth.User.ID <= 0 {
		message := auth.Error
		if message == "" {
			message = "invalid initData"
		}
		writeJSON(w, http.StatusUnauthorized, failureBody{Error: apiErrorDetail{Code: "UNAUTHORIZED", Message: message}})
		return
	}

	if !r.allow(auth.User.ID) {
		writeJSON(w, http.StatusTooManyRequests, failureBody{
			Error: apiErrorDetail{Code: "RATE_LIMITED", Message: "请求过于频繁，请稍后再试"},
		})
		return
	}

	ctx := req.Context()
	prefix := r.env("DB_TABLE_PREFIX")
	if prefix == "" {
		prefix = "huoniao_"
	}

	centavos, memberID, err := order.ReadPayOrder(ctx, r.db, body.Ordernum, prefix)
	if err == nil {
		err = order.AssertOwnership(ctx, r.db, fmt.Sprintf("%d", auth.User.ID), memberID)
	}
	var data Data
	if err == nil {
		var idem *string
		if body.IdempotencyKey != "" {
			key := body.IdempotencyKey
			idem = &key
		}
		data, err = CreateCheckout(ctx, r.db, Req{
			Ordernum:       body.Ordernum,
			ServerCentavos: centavos,
			IdempotencyKey: idem,
			GetRate:        r.getRate,
			Address:        r.env("TRON_MASTER_RECEIVE_ADDRESS"),
			Now:            r.now,
		})
	}
	if err != nil {
		r.fail(w, body.Ordernum, err)
		return
	}
	writeJSON(w, http.StatusOK, successBody{Success: true, Data: data})
}

// fail 统一错误出口：业务码 → statusFor；未识别异常 → 500 + 一行结构化日志（不含 initData）。
func (r *route) fail(w http.ResponseWriter, ordernum string, err error) {
	if checkoutErr, ok := err.(*Error); ok {
		writeJSON(w, StatusFor(checkoutErr.Code), failureBody{
			Error: apiErrorDetail{Code: checkoutErr.Code, Message: checkoutErr.Message},
		})
		return
	}
	if orderErr, ok := err.(*order.OrderError); ok {
		writeJSON(w, StatusFor(orderErr.Code), failureBody{
			Error: apiErrorDetail{Code: orderErr.Code, Message: orderErr.Message},
		})
		return
	}
	line, _ := json.Marshal(struct {
		Level    string `json:"level"`
		Route    string `json:"route"`
		Ordernum string `json:"ordernum"`
		Message  string `json:"message"`
	}{Level: "error", Route: "checkout", Ordernum: ordernum, Message: err.Error()})
	r.logf(string(line))
	writeJSON(w, http.StatusInternalServerError, failureBody{
		Error: apiErrorDetail{Code: "INTERNAL", Message: "checkout failed"},
	})
}

// allow 是 per-tg 的滑动窗口限流（多副本不共享，与 Node 版同一已知缺口）。
func (r *route) allow(tgID int64) bool {
	now := r.now()
	r.mu.Lock()
	defer r.mu.Unlock()

	recent := r.hits[tgID][:0]
	for _, t := range r.hits[tgID] {
		if now.Sub(t) < CheckoutWindow {
			recent = append(recent, t)
		}
	}
	if len(recent) >= CheckoutLimit {
		r.hits[tgID] = recent
		return false
	}
	r.hits[tgID] = append(recent, now)
	// 顺带清掉窗口外的键，避免被扫号时 map 无界增长。
	for uid, times := range r.hits {
		if len(times) == 0 || now.Sub(times[len(times)-1]) >= CheckoutWindow {
			delete(r.hits, uid)
		}
	}
	return true
}

type requestFields struct {
	Ordernum       string `json:"ordernum"`
	IdempotencyKey string `json:"idempotencyKey"`
	InitData       string `json:"initData"`
}

// parseBody 取请求体字段，口径与 Node 的 express.json + express.urlencoded 一致：
// 解析方式由 Content-Type 决定，不按首字节嗅探（原来那样会把 `text/plain` 的 JSON
// 也当成合法 body，等于放宽了类型契约）。
// 非字符串值一律视为缺失：Node 里 `req.body.ordernum` 若是对象，schema 校验同样判无效。
func parseBody(req *http.Request) requestFields {
	fields := httpbody.FieldsOf(req)
	return requestFields{
		Ordernum:       httpbody.Text(fields, "ordernum"),
		IdempotencyKey: httpbody.Text(fields, "idempotencyKey"),
		InitData:       httpbody.Text(fields, "initData"),
	}
}

// writeJSON 与 Node 的 res.json 对齐：不转义 <、>、&，也不追加结尾换行。
// 默认编码器会把 `<` 写成 `\u003c` 并在末尾补 0x0a —— 两者对 JSON 语义无影响，
// 但会让「与 Node 逐字节比对」的验收手段失效，排障时也多出一处噪音。
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
