package httpapi

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/calltest"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/fbproxy"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/tgauth"
)

// 响应体分两种形状，**不能**统一：
//   - 顾客侧新功能（checkout / call-test / telegram / bridge）用对象形 {code,message}；
//   - /auth/tg-verify、/payment/*、/rates/*、/wallet/* 等旧接口用字符串形 {error:"..."}。
//
// 前端已按各自形状解析，统一成一种会直接把旧接口调用方打挂。
type stringError struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
	// Tip 只在 /wallet 的失败分支出现。
	Tip string `json:"tip,omitempty"`
}

type errorDetail struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type objectError struct {
	Success bool        `json:"success"`
	Error   errorDetail `json:"error"`
	// Data 只在 /call-test 失败分支出现（带重试次数）。
	Data any `json:"data,omitempty"`
}

type successData struct {
	Success bool `json:"success"`
	Data    any  `json:"data"`
}

// writeJSON 一律关掉 HTML 转义：Node 的 res.json（JSON.stringify）不转义 `<`/`>`/`&`，
// 打开转义会让含这些字符的用户名/上游内容在字节层面与 Node 不同。
//
// 刻意不用 json.Encoder：Encode 会在末尾补一个换行，而 res.json 不补，
// 逐字节比对时会多出一个 0x0a。
func writeJSON(w http.ResponseWriter, status int, body any) {
	payload, err := marshalJSON(body)
	if err != nil {
		payload = []byte(`{"success":false,"error":"Internal error"}`)
		status = http.StatusInternalServerError
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_, _ = w.Write(payload)
}

// marshalJSON 是保留 <、>、& 原样的 json.Marshal。
func marshalJSON(body any) ([]byte, error) {
	buf := &bytes.Buffer{}
	encoder := json.NewEncoder(buf)
	encoder.SetEscapeHTML(false)
	if err := encoder.Encode(body); err != nil {
		return nil, err
	}
	// Encode 追加的单个换行不是 JSON 的一部分，去掉它。
	return bytes.TrimSuffix(buf.Bytes(), []byte("\n")), nil
}

// health 返回与 Node 逐字一致的四个字段（timestamp 用 toISOString 形态）。
func (s *Server) health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, struct {
		Status    string `json:"status"`
		Timestamp string `json:"timestamp"`
		Service   string `json:"service"`
		Region    string `json:"region"`
	}{
		Status:    "online",
		Timestamp: s.now().UTC().Format("2006-01-02T15:04:05.000") + "Z",
		Service:   "Firebird-SEA-Core-API",
		Region:    "Philippines (Manila/Cebu)",
	})
}

// tgVerify 是旧版 initData 校验接口：限流 30 次/分钟/IP，响应体是字符串形错误。
func (s *Server) tgVerify(w http.ResponseWriter, req *http.Request) {
	if !s.verifyLimiter(s.clientKey(req)) {
		writeJSON(w, http.StatusTooManyRequests, stringError{Error: "Too many requests"})
		return
	}
	fields := BodyOf(req)
	initData := stringField(fields, "initData")
	if !jsTruthy(fields["initData"]) {
		writeJSON(w, http.StatusBadRequest, stringError{Error: "Missing initData"})
		return
	}
	// 开发环境允许固定 mock：仅 NODE_ENV=development + 精确匹配时才生效，
	// 生产环境即使有人传这个值也走真实验签。
	if s.env("NODE_ENV") == "development" && initData == "mock_test_user" {
		writeJSON(w, http.StatusOK, struct {
			Success bool `json:"success"`
			User    struct {
				ID           int64  `json:"id"`
				FirstName    string `json:"first_name"`
				Username     string `json:"username"`
				LanguageCode string `json:"language_code"`
			} `json:"user"`
			Mode string `json:"mode"`
		}{
			Success: true,
			User: struct {
				ID           int64  `json:"id"`
				FirstName    string `json:"first_name"`
				Username     string `json:"username"`
				LanguageCode string `json:"language_code"`
			}{ID: 88888888, FirstName: "MetroManila", Username: "firebird_tester", LanguageCode: "en"},
			Mode: "mock_development",
		})
		return
	}

	verified := s.validate(initData, s.botToken)
	if !verified.Valid {
		writeJSON(w, http.StatusUnauthorized, stringError{Error: verified.Error})
		return
	}
	var user any = json.RawMessage(`{}`)
	if verified.User != nil && len(verified.User.Raw) > 0 {
		user = json.RawMessage(verified.User.Raw)
	}
	writeJSON(w, http.StatusOK, struct {
		Success  bool  `json:"success"`
		User     any   `json:"user"`
		AuthDate int64 `json:"authDate"`
	}{Success: true, User: user, AuthDate: verified.AuthDate})
}

// authTelegram 直接转出登录编排的 (状态码, 响应体)，不做二次包装。
func (s *Server) authTelegram(w http.ResponseWriter, req *http.Request) {
	if s.auth == nil || s.auth.Login == nil {
		writeJSON(w, http.StatusServiceUnavailable, objectError{
			Error: errorDetail{Code: "AUTH_NOT_CONFIGURED", Message: "TMA auth not configured"},
		})
		return
	}
	status, body := s.auth.Login.Login(req.Context(), stringField(BodyOf(req), "initData"))
	writeJSON(w, status, body)
}

// authLogout 吊销 Bearer 令牌。revoke 失败与「本来就没有令牌」都按 401 处理。
func (s *Server) authLogout(w http.ResponseWriter, req *http.Request) {
	if s.auth == nil || s.auth.Tokens == nil {
		writeJSON(w, http.StatusServiceUnavailable, objectError{
			Error: errorDetail{Code: "AUTH_NOT_CONFIGURED", Message: "TMA auth not configured"},
		})
		return
	}
	matched := bearerPattern.FindStringSubmatch(req.Header.Get("Authorization"))
	revoked := false
	if matched != nil {
		ok, err := s.auth.Tokens.RevokeAsync(req.Context(), matched[1])
		if err != nil {
			writeJSON(w, http.StatusBadGateway, objectError{
				Error: errorDetail{Code: "LOGOUT_FAILED", Message: "Please retry"},
			})
			return
		}
		revoked = ok
	}
	status := http.StatusUnauthorized
	if revoked {
		status = http.StatusOK
	}
	writeJSON(w, status, struct {
		Success bool `json:"success"`
	}{Success: revoked})
}

var bearerPattern = regexp.MustCompile(`^Bearer (.+)$`)

// fbProxyHandle 是白名单代理入口。只接受 GET/POST（Node 的 router.all + 方法闸门）。
func (s *Server) fbProxyHandle(w http.ResponseWriter, req *http.Request) {
	if req.Method != http.MethodGet && req.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, struct {
			Success bool `json:"success"`
		}{Success: false})
		return
	}
	headers := map[string]string{
		"authorization":   req.Header.Get("Authorization"),
		"idempotency-key": req.Header.Get("Idempotency-Key"),
	}
	status, body := s.fbProxy.Handle(req.Context(), fbproxy.Req{
		Service:   req.PathValue("service"),
		Action:    req.PathValue("action"),
		Query:     queryStrings(req.URL.Query()),
		Method:    req.Method,
		Body:      BodyOf(req),
		Headers:   headers,
		ClientKey: s.clientKey(req),
	})
	// 必须用 fbproxy.WriteJSON：默认编码器会把上游 JSON 里的 <、>、& 转成 \u003c，
	// 「原样回写上游字节」的承诺就在字节层面失效了。
	fbproxy.WriteJSON(w, status, body)
}

// createCharge 创建 USDT 收款单。
//
// 校验顺序与 Node 的 `!orderId || !amountUsdt || amountUsdt <= 0` 逐项对齐：
// 先在原始值上做真值判断（0 / null / 空串都算假），再用 Number() 转成数值比大小。
// 注意 Number("abc") 是 NaN，`NaN <= 0` 为 false —— Node 会放行（历史行为），
// 这里保持放行，不在移植时偷偷加强校验。
//
// network 走指针传：Node 的解构默认值 `network = 'TRC-20'` 只对 undefined 生效，
// 所以「字段缺省」与「显式空串」必须产出不同响应（TRC-20 vs ""）。
func (s *Server) createCharge(w http.ResponseWriter, req *http.Request) {
	fields := BodyOf(req)
	orderID := stringField(fields, "orderId")
	// 只有「字段存在且是字符串」才传非 nil：其余情况（缺省 / null / 非字符串）
	// 在 Node 里都取默认值 TRC-20。
	var network *string
	if raw, provided := fields["network"]; provided {
		if typed, isString := raw.(string); isString {
			network = &typed
		}
	}
	if !jsTruthy(fields["orderId"]) || !jsTruthy(fields["amountUsdt"]) {
		writeJSON(w, http.StatusBadRequest, stringError{Error: "Invalid orderId or amount"})
		return
	}
	amount := jsNumber(fields["amountUsdt"])
	if amount <= 0 {
		writeJSON(w, http.StatusBadRequest, stringError{Error: "Invalid orderId or amount"})
		return
	}
	if s.payments == nil {
		writeJSON(w, http.StatusInternalServerError, stringError{Error: "payment manager not configured"})
		return
	}
	writeJSON(w, http.StatusOK, successData{Success: true, Data: s.payments.CreatePaymentCharge(orderID, amount, network)})
}

func (s *Server) paymentStatus(w http.ResponseWriter, req *http.Request) {
	if s.payments == nil {
		writeJSON(w, http.StatusNotFound, stringError{Error: "Charge not found"})
		return
	}
	charge := s.payments.GetCharge(req.PathValue("chargeId"))
	if charge == nil {
		writeJSON(w, http.StatusNotFound, stringError{Error: "Charge not found"})
		return
	}
	writeJSON(w, http.StatusOK, successData{Success: true, Data: charge})
}

// mockWebhook 仅非生产注册（缺交易哈希时自动造一个），用于无链上手续费时联调。
func (s *Server) mockWebhook(w http.ResponseWriter, req *http.Request) {
	if s.payments == nil {
		writeJSON(w, http.StatusBadRequest, stringError{Error: "payment manager not configured"})
		return
	}
	fields := BodyOf(req)
	txHash := stringField(fields, "txHash")
	if txHash == "" {
		txHash = fmt.Sprintf("mock_tx_%d_%s", s.now().UnixMilli(), randomBase36(7))
	}
	result := s.payments.ConfirmChargePaid(stringField(fields, "chargeId"), txHash)
	if !result.Success {
		writeJSON(w, http.StatusBadRequest, result)
		return
	}
	writeJSON(w, http.StatusOK, struct {
		Success bool   `json:"success"`
		Message string `json:"message"`
		Charge  any    `json:"charge"`
	}{Success: true, Message: "Payment simulated successfully", Charge: result.Charge})
}

// ratesTicker 返回行情 + 五档盘口。symbol 回显上游响应里的 symbol（不是请求参数）。
func (s *Server) ratesTicker(w http.ResponseWriter, req *http.Request) {
	if s.coins == nil {
		writeJSON(w, http.StatusInternalServerError, stringError{Error: "coins client not configured"})
		return
	}
	symbol := QueryOf(req, "symbol")
	if symbol == "" {
		symbol = "USDTPHP"
	}
	ticker, err := s.coins.TickerPrice(req.Context(), symbol)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, stringError{Error: err.Error()})
		return
	}
	depth, err := s.coins.OrderBook(req.Context(), symbol, 5)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, stringError{Error: err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, successData{Success: true, Data: struct {
		Symbol    string  `json:"symbol"`
		Price     float64 `json:"price"`
		OrderBook any     `json:"orderBook"`
	}{Symbol: ticker.Symbol, Price: ticker.Price, OrderBook: depth}})
}

// ratesConvert 用 JS parseFloat 的语义解析 php：取最长数字前缀，
// 因此 "12abc" 与 "12" 等价（Node 的 parseFloat 就是这么宽容）。
//
// 两处「看起来可以写得更严谨、但必须照抄 Node」的细节：
//
//  1. 缺省/空串先落成 "0"：Node 是 `parseFloat(req.query.php || '0')`，`||` 在空串上兜底，
//     所以 `?php=` 与完全不带 php 都得到 0 → 400。少了这一步，缺省会变成 parseFloat("") = NaN，
//     再被下面那条放行，最终 500（coins 未配置）—— 与 Node 的 400 不同。
//  2. 守卫写 `php <= 0`，不能写 `!(php > 0)`：两者只在 NaN 上不同。NaN 参与任何比较都为 false，
//     于是非数字金额**放行**，走到 `(NaN/rate).toFixed(2)` → "NaN" → `Number("NaN")` → NaN，
//     由 `res.json`（JSON.stringify）写成 null，**200**。写成 `!(php > 0)` 会让 NaN 变成 400 ——
//     同一个输入类在 /payment/create-charge 上给 200+null、在这里给 400，这种不一致比 Node
//     的宽松本身更难解释。所以这是**刻意的等价复刻**，不是容错；NaN→null 的序列化由
//     coins.Conversion.MarshalJSON 负责（走 jsonfloat），不是这里的事。
func (s *Server) ratesConvert(w http.ResponseWriter, req *http.Request) {
	raw := QueryOf(req, "php")
	if raw == "" {
		raw = "0"
	}
	php := jsParseFloat(raw)
	if php <= 0 {
		writeJSON(w, http.StatusBadRequest, stringError{Error: "Invalid php amount"})
		return
	}
	if s.coins == nil {
		writeJSON(w, http.StatusInternalServerError, stringError{Error: "coins client not configured"})
		return
	}
	result, err := s.coins.ConvertPHPToUSDT(req.Context(), php)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, stringError{Error: err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, successData{Success: true, Data: result})
}

// walletBalance 失败时是 400 + tip（配置缺失的诊断提示），不是 500。
func (s *Server) walletBalance(w http.ResponseWriter, req *http.Request) {
	if s.coins == nil {
		writeJSON(w, http.StatusBadRequest, stringError{
			Error: "coins client not configured",
			Tip:   "请在 .env 中正确配置 COINS_PH_API_KEY 与 COINS_PH_API_SECRET",
		})
		return
	}
	balance, err := s.coins.AccountBalance(req.Context(), "", "")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, stringError{
			Error: err.Error(),
			Tip:   "请在 .env 中正确配置 COINS_PH_API_KEY 与 COINS_PH_API_SECRET",
		})
		return
	}
	writeJSON(w, http.StatusOK, successData{Success: true, Data: balance})
}

// callTest 是全局单飞的语音呼叫自测：同一时刻只允许一个，失败带重试次数。
func (s *Server) callTest(w http.ResponseWriter, req *http.Request) {
	fields := BodyOf(req)
	initData := stringField(fields, "initData")
	// Node：`const auth = initData ? validate(initData, BOT_TOKEN) : { valid: false }`
	// —— initData 为空时不做验签，直接 401。
	verified := tgauth.Result{}
	if jsTruthy(fields["initData"]) {
		verified = s.validate(initData, s.botToken)
	}
	if !verified.Valid {
		writeJSON(w, http.StatusUnauthorized, objectError{
			Error: errorDetail{Code: "UNAUTHORIZED", Message: "Invalid or missing initData"},
		})
		return
	}
	target := s.env("CALL_TEST_URL")
	if target == "" {
		writeJSON(w, http.StatusServiceUnavailable, objectError{
			Error: errorDetail{Code: "CALL_TEST_NOT_CONFIGURED", Message: "CALL_TEST_URL is not set"},
		})
		return
	}
	if !callTestBusy.CompareAndSwap(false, true) {
		writeJSON(w, http.StatusTooManyRequests, objectError{
			Error: errorDetail{Code: "CALL_TEST_BUSY", Message: "A call test is already running"},
		})
		return
	}
	defer callTestBusy.Store(false)

	// undefined 字段在 JSON.stringify 里会被丢掉，这里也只放非空值，
	// 免得给上游送一个 "to":null 让对端误判。
	payload := map[string]any{}
	if to := stringField(fields, "to"); to != "" {
		payload["to"] = to
	}
	if message := stringField(fields, "message"); message != "" {
		payload["message"] = message
	}

	// 呼叫是外部副作用：即使调用方断开也要跑完，故用 Background 而不是 req.Context()。
	result := s.runCallTest(contextWithoutCancel(req), target, payload, calltest.Options{})
	if !result.Passed {
		writeJSON(w, http.StatusBadGateway, struct {
			Success bool        `json:"success"`
			Error   errorDetail `json:"error"`
			Data    struct {
				Attempts int `json:"attempts"`
			} `json:"data"`
		}{
			Error: errorDetail{Code: "CALL_TEST_FAILED", Message: result.Error},
			Data: struct {
				Attempts int `json:"attempts"`
			}{Attempts: result.Attempts},
		})
		return
	}
	writeJSON(w, http.StatusOK, successData{Success: true, Data: struct {
		Attempts int `json:"attempts"`
	}{Attempts: result.Attempts}})
}

// —— 小工具 ——

func stringField(fields map[string]any, key string) string {
	value, ok := fields[key].(string)
	if !ok {
		return ""
	}
	return value
}

// jsTruthy 复刻 JS 的 `if (!raw)` 判定。Node 里写的是 `if (!initData)` /
// `if (!orderId || !amountUsdt || amountUsdt <= 0)`，判定发生在原始值上而不是
// 字符串化之后：数字 0 与 null 算假，空字符串算假，其余算真。
func jsTruthy(value any) bool {
	switch typed := value.(type) {
	case nil:
		return false
	case bool:
		return typed
	case float64:
		return typed != 0 && !math.IsNaN(typed)
	case string:
		return typed != ""
	}
	return true
}

// jsNumber 复刻 JS 的 Number(v)：空白与空串是 0，非法字符串是 NaN，
// 布尔转 0/1。与 parseFloat 不同 —— Number("12abc") 是 NaN 而不是 12。
func jsNumber(value any) float64 {
	switch typed := value.(type) {
	case nil:
		return 0
	case bool:
		if typed {
			return 1
		}
		return 0
	case float64:
		return typed
	case int:
		return float64(typed)
	case int64:
		return float64(typed)
	case json.Number:
		parsed, err := typed.Float64()
		if err != nil {
			return math.NaN()
		}
		return parsed
	case string:
		trimmed := strings.TrimSpace(typed)
		if trimmed == "" {
			return 0
		}
		parsed, err := strconv.ParseFloat(trimmed, 64)
		if err != nil {
			return math.NaN()
		}
		return parsed
	case []any:
		// Number(数组) 在 JS 里走 String(数组) = 元素用 "," 连接：
		// Number([]) === 0（空串）、Number([5]) === 5、Number([1,2]) === NaN（"1,2"）。
		// 复刻它是因为 `amountUsdt: []` 在 Node 得到 0 → 400，而落到 NaN 会变成 200 + null
		// 甚至 500 —— 两条完全不同的对外分支。
		parts := make([]string, 0, len(typed))
		for _, item := range typed {
			parts = append(parts, jsString(item))
		}
		return jsNumber(strings.Join(parts, ","))
	case map[string]any:
		// Number(对象) 恒为 NaN（String({}) 是 "[object Object]"）。
		return math.NaN()
	}
	return math.NaN()
}

// jsString 复刻 Array.prototype.join 把元素转成字符串的形态，
// 只需覆盖 JSON 解码能产出的类型（null 在 join 里是空串，不是 "null"）。
func jsString(value any) string {
	switch typed := value.(type) {
	case nil:
		return ""
	case bool:
		if typed {
			return "true"
		}
		return "false"
	case float64:
		return strconv.FormatFloat(typed, 'g', -1, 64)
	case int:
		return strconv.Itoa(typed)
	case int64:
		return strconv.FormatInt(typed, 10)
	case json.Number:
		return typed.String()
	case string:
		return typed
	}
	return "[object Object]"
}

// floatField 复刻 JS 的 Number(fields[key])。
func floatField(fields map[string]any, key string) float64 {
	value, ok := fields[key]
	if !ok {
		return math.NaN()
	}
	return jsNumber(value)
}

// numberPrefix 对应 JS parseFloat 的扫描规则：可选符号 + 十进制/指数，遇到非法字符即停。
var numberPrefix = regexp.MustCompile(`^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?`)

func jsParseFloat(raw string) float64 {
	trimmed := trimLeftSpace(raw)
	matched := numberPrefix.FindString(trimmed)
	if matched == "" {
		return math.NaN()
	}
	value, err := strconv.ParseFloat(matched, 64)
	if err != nil {
		return math.NaN()
	}
	return value
}

func trimLeftSpace(value string) string {
	for index, char := range value {
		if char != ' ' && char != '\t' && char != '\n' && char != '\r' {
			return value[index:]
		}
	}
	return ""
}

// randomBase36 复刻 Math.random().toString(36).substring(7) 的形状（7 位字母数字）。
func randomBase36(length int) string {
	const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz"
	buf := make([]byte, length)
	if _, err := rand.Read(buf); err != nil {
		return strconv.FormatInt(time.Now().UnixNano(), 36)
	}
	for index := range buf {
		buf[index] = alphabet[int(buf[index])%len(alphabet)]
	}
	return string(buf)
}

// contextWithoutCancel 保留 values（trace 等）但去掉取消信号。
func contextWithoutCancel(req *http.Request) context.Context {
	return context.WithoutCancel(req.Context())
}
