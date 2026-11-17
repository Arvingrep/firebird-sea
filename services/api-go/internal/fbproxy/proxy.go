package fbproxy

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/state"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/token"
)

const (
	// DefaultTimeout 与 Node 的 timeoutMs=8000 一致。
	DefaultTimeout = 8 * time.Second
	// DefaultIdempotencyTTL 与 Node 的 idempotencyTtlSeconds=600 一致。
	DefaultIdempotencyTTL = 10 * time.Minute
	// 幂等键最小 8 位：太短容易被同名键撞上，导致误回放别人的响应。
	idempotencyKeyPattern = `^[A-Za-z0-9_-]{8,64}$`
	// paytype=delivery 且非移动端时上游会 header('location') 后 die，必须伪装移动端 UA。
	mobileUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"
)

var (
	idempotencyKeyRe = regexp.MustCompile(idempotencyKeyPattern)
	codInfoPattern   = regexp.MustCompile(`^delivery\|(.+)$`)
	shopIDRe         = regexp.MustCompile(`^[1-9][0-9]{0,9}$`)
	paytypeRe        = regexp.MustCompile(`^[0-9]{1,2}$`)
	peitypeRe        = regexp.MustCompile(`^[0-2]$`)
	phoneRe          = regexp.MustCompile(`^[0-9]{0,15}$`)
	deskRe           = regexp.MustCompile(`^[0-9A-Za-z]{0,20}$`)
	coordRe          = regexp.MustCompile(`^-?[0-9]{1,3}(\.[0-9]{1,10})?$`)
	selftimeRe       = regexp.MustCompile(`^[0-9 :\-]{0,30}$`)
	orderTimeRe      = regexp.MustCompile(`^[0-9]{0,12}$`)
)

// Dep 注入代理依赖。生产由 server 装配，测试逐项替换。
type Dep struct {
	UpstreamBase string
	Tokens       *token.Service
	Whitelist    Whitelist
	Allow        func(key string) bool
	AllowWrite   func(key string) bool
	// CredentialProvider 返回该会员的火鸟会话 Cookie（`name=value`）。为 nil 时会员级接口返回 503。
	CredentialProvider func(ctx context.Context, memberID int64) (string, error)
	IdempotencyStore   state.IdemStore
	Timeout            time.Duration
	HTTPClient         *http.Client
	Now                func() time.Time
	// Warn 接收一行结构化告警（默认写 stderr）。
	Warn func(value any)
}

// Proxy 是白名单代理。并发安全：唯一可变状态是「空订单列表」告警槽。
type Proxy struct {
	upstream  string
	tokens    *token.Service
	whitelist Whitelist
	allow     func(string) bool
	allowW    func(string) bool
	creds     func(context.Context, int64) (string, error)
	idem      state.IdemStore
	timeout   time.Duration
	client    *http.Client
	now       func() time.Time
	warn      func(any)

	mu       sync.Mutex
	warnSlot string
}

// Req 是一次代理调用。Headers 用小写键（authorization / idempotency-key），与 Node 一致。
type Req struct {
	Service   string
	Action    string
	Query     map[string]string
	Method    string
	Body      map[string]any
	Headers   map[string]string
	ClientKey string
}

// Result 比 (status, body) 多一个 Replayed 标记，供测试与调用方区分「回放」与「首次」。
type Result struct {
	Status   int
	Body     any
	Replayed bool
}

type errorDetail struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type failureBody struct {
	Success bool        `json:"success"`
	Error   errorDetail `json:"error"`
}

func failure(status int, code, message string) Result {
	return Result{Status: status, Body: failureBody{Error: errorDetail{Code: code, Message: message}}}
}

// New 构造代理；白名单非法（幂等规则未要求登录）时直接失败，避免带着坏配置上线。
func New(d Dep) (*Proxy, error) {
	whitelist := d.Whitelist
	if whitelist == nil {
		whitelist = DefaultWhitelist()
	}
	if err := whitelist.Validate(); err != nil {
		return nil, err
	}
	if d.Tokens == nil {
		return nil, errors.New("fbproxy: tokens required")
	}
	now := d.Now
	if now == nil {
		now = time.Now
	}
	timeout := d.Timeout
	if timeout <= 0 {
		timeout = DefaultTimeout
	}
	allow := d.Allow
	if allow == nil {
		allow = func(string) bool { return true }
	}
	idem := d.IdempotencyStore
	if idem == nil {
		idem = state.NewMemoryIdempotencyStore(state.MemoryIdempotencyDep{
			TTL: DefaultIdempotencyTTL,
			Now: now,
		})
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
	return &Proxy{
		upstream:  d.UpstreamBase,
		tokens:    d.Tokens,
		whitelist: whitelist,
		allow:     allow,
		allowW:    d.AllowWrite,
		creds:     d.CredentialProvider,
		idem:      idem,
		timeout:   timeout,
		client:    d.HTTPClient,
		now:       now,
		warn:      warn,
	}, nil
}

// Handle 是路由层使用的入口，返回 (HTTP 状态, 响应体)。
func (p *Proxy) Handle(ctx context.Context, req Req) (int, any) {
	result := p.Execute(ctx, req)
	return result.Status, result.Body
}

// WriteJSON 是代理结果的唯一出口。必须关掉 HTML 转义：默认编码器会把 <、>、&
// 改写成 \u003c 之类的转义序列，虽然 JSON 语义等价，但「原样回写上游字节」的承诺
// 在字节层面就失效了，前端做内容 diff 也会莫名其妙。
//
// 额外注意：不用 json.Encoder.Encode —— 它会在末尾补一个换行，而 Node 的 res.json
// 不补；多出这一个 0x0a 就已经不是字节级透传了。
func WriteJSON(w http.ResponseWriter, status int, body any) {
	payload, err := encodeBody(body)
	if err != nil {
		payload = []byte(`{"success":false,"error":{"code":"INTERNAL_ERROR","message":"Proxy failed"}}`)
		status = http.StatusInternalServerError
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_, _ = w.Write(payload)
}

// encodeBody 序列化但不去掉 <、>、& 的转义，也不追加换行。
func encodeBody(body any) ([]byte, error) {
	buf := &bytes.Buffer{}
	encoder := json.NewEncoder(buf)
	encoder.SetEscapeHTML(false)
	if err := encoder.Encode(body); err != nil {
		return nil, err
	}
	return bytes.TrimSuffix(buf.Bytes(), []byte("\n")), nil
}

// Execute 是 Handle 的完整版本（带 Replayed 标记）。
func (p *Proxy) Execute(ctx context.Context, req Req) Result {
	rule, ok := p.whitelist[req.Service+":"+req.Action]
	if !ok {
		return failure(http.StatusForbidden, "NOT_ALLOWED", "Endpoint not allowed")
	}

	var claims *token.Claims
	if rule.Auth == "member" {
		raw := req.Headers["authorization"]
		matched := bearerPattern.FindStringSubmatch(raw)
		if matched == nil {
			return failure(http.StatusUnauthorized, "UNAUTHORIZED", "Login required")
		}
		parsed, err := p.tokens.Verify(matched[1])
		if err != nil {
			return failure(http.StatusUnauthorized, "UNAUTHORIZED", "Login required")
		}
		claims = &parsed
	}

	limiter := p.allow
	if rule.Write && p.allowW != nil {
		limiter = p.allowW
	}
	identity := req.ClientKey
	if claims != nil {
		identity = "m:" + strconv.FormatInt(claims.Mid, 10)
	}
	kind := req.Service + ":" + req.Action
	if rule.Write {
		kind = "w"
	}
	if !limiter(identity + ":" + kind) {
		return failure(http.StatusTooManyRequests, "RATE_LIMITED", "Too many requests")
	}

	// merged：GET 只看 query；POST 以 body 覆盖 query（与 Node 的 {...query, ...body} 一致）。
	merged := make(map[string]any, len(req.Query)+len(req.Body))
	for key, value := range req.Query {
		merged[key] = value
	}
	if req.Method == http.MethodPost {
		for key, value := range req.Body {
			merged[key] = value
		}
	}
	params := SanitizeAny(merged, rule.Params)

	if rule.Validate == "deal" {
		if rejected := validateDeal(merged, params); rejected != nil {
			return *rejected
		}
	}

	idemKey := ""
	if rule.Idempotent {
		key := req.Headers["idempotency-key"]
		if !idempotencyKeyRe.MatchString(key) {
			return failure(http.StatusBadRequest, "IDEMPOTENCY_KEY_REQUIRED", "Idempotency-Key required")
		}
		// 幂等键必须带会员维度：否则两个人用同一个 key 会互相回放对方的响应。
		idemKey = strconv.FormatInt(claims.Mid, 10) + ":" + req.Service + ":" + req.Action + ":" + key
		slot, err := p.idem.Begin(ctx, idemKey)
		if err != nil {
			return p.internal(ctx, idemKey, "idempotency begin: "+err.Error())
		}
		switch slot.Status {
		case state.IdemDone:
			return Result{Status: http.StatusOK, Body: slot.Body, Replayed: true}
		case state.IdemPending:
			return failure(http.StatusConflict, "REQUEST_IN_PROGRESS", "A request with this key is in progress")
		}
	}

	cookie := ""
	if claims != nil {
		if p.creds == nil {
			return p.fail(ctx, idemKey, http.StatusServiceUnavailable, "CREDENTIALS_NOT_CONFIGURED", "Not available")
		}
		value, err := p.creds(ctx, claims.Mid)
		if err != nil {
			return p.fail(ctx, idemKey, http.StatusBadGateway, "CREDENTIALS_UNAVAILABLE", "Not available")
		}
		cookie = value
	}

	isPost := req.Method == http.MethodPost

	// 归属预检：编辑/删除他人资源前先用同一会员凭证读取该资源，读不到即视为无权（404），不转发写操作。
	if rule.OwnershipPrecheck != nil {
		if target, exists := params[rule.OwnershipPrecheck.IDParam]; exists && target != "" {
			_, decoded, err := p.callUpstream(ctx, cookie, req.Service, rule.OwnershipPrecheck.Action,
				map[string]string{"id": target}, false, nil)
			if err != nil {
				return p.fail(ctx, idemKey, http.StatusBadGateway, "UPSTREAM_UNAVAILABLE", "Upstream unavailable")
			}
			if !precheckPassed(decoded) {
				return p.denied(ctx, idemKey, rule.DenyStatus, infoOf(decoded))
			}
		}
	}

	raw, decoded, err := p.callUpstream(ctx, cookie, req.Service, req.Action, params, isPost, nil)
	if err != nil {
		// 结果未知：订单可能已写入。幂等写接口保留占位至 TTL，同键重试得到 409，避免重复下单。
		if idemKey != "" {
			return Result{Status: http.StatusGatewayTimeout, Body: failureBody{Error: errorDetail{
				Code:    "UPSTREAM_TIMEOUT",
				Message: "Order status unknown; do not resubmit, check your orders",
			}}}
		}
		return p.fail(ctx, "", http.StatusBadGateway, "UPSTREAM_UNAVAILABLE", "Upstream unavailable")
	}
	if !isJSONObjectLike(decoded) {
		return p.fail(ctx, idemKey, http.StatusBadGateway, "UPSTREAM_INVALID", "Upstream returned invalid data")
	}

	succeeded := stateIs100(decoded)

	// 客户端响应默认原样回写上游字节：unmarshal 再 marshal 会改写大整数与数字格式，
	// 前端拿到的 ordernum/金额可能被静默改值。
	clientBody := any(json.RawMessage(raw))

	if succeeded && req.Service == "waimai" && req.Action == "deal" {
		if info, isString := infoOf(decoded).(string); isString {
			if matched := codInfoPattern.FindStringSubmatch(strings.TrimSpace(info)); matched != nil {
				ordernum := matched[1]
				clientBody = p.settleCashOnDelivery(ctx, cookie, decoded, ordernum, clientBody)
			}
		}
	}

	if succeeded && req.Service == "waimai" && req.Action == "order" && claims != nil {
		p.maybeWarnEmptyOrders(decoded, params, claims.Mid)
	}

	if idemKey != "" {
		if succeeded {
			_ = p.idem.Finish(ctx, idemKey, clientBody)
		} else {
			_ = p.idem.Abort(ctx, idemKey)
		}
	}
	// 带 denyStatus 的规则：上游拒绝一律映射为 404 且不返回上游 body（不泄露数据）。
	if !succeeded && rule.DenyStatus != 0 {
		return p.denied(ctx, idemKey, rule.DenyStatus, infoOf(decoded))
	}
	return Result{Status: http.StatusOK, Body: clientBody}
}

var bearerPattern = regexp.MustCompile(`^Bearer (.+)$`)

// settleCashOnDelivery 处理「货到付款收口」：上游 deal() 对 paytype=1 只返回 "delivery|<ordernum>"
// 并早返回，订单仍是 state=0；不收口的话 30 分钟后 cron 会把它当「超时未支付」取消。
// 这里紧接着用同一会员凭证调 pay(paytype=delivery) 把订单推到 state=2。
func (p *Proxy) settleCashOnDelivery(ctx context.Context, cookie string, decoded any, ordernum string, clientBody any) any {
	_, settled, err := p.callUpstream(ctx, cookie, "waimai", "pay",
		map[string]string{"ordernum": ordernum, "paytype": "delivery"}, true,
		map[string]string{"User-Agent": mobileUserAgent})
	if err != nil {
		p.warn(struct {
			Evt      string `json:"evt"`
			Ordernum string `json:"ordernum"`
			Msg      string `json:"msg"`
		}{Evt: "cod_settle_error", Ordernum: ordernum, Msg: err.Error()})
	} else if !stateIs100(settled) {
		p.warn(struct {
			Evt           string `json:"evt"`
			Ordernum      string `json:"ordernum"`
			UpstreamState any    `json:"upstreamState"`
		}{Evt: "cod_settle_failed", Ordernum: ordernum, UpstreamState: stateOf(settled)})
	}
	// 无论收口成败都只对客户端暴露订单号，避免 "delivery|xxx" 污染 UI。
	if object, isMap := decoded.(map[string]any); isMap {
		object["info"] = ordernum
		return object
	}
	return clientBody
}

func (p *Proxy) maybeWarnEmptyOrders(decoded any, params map[string]string, mid int64) {
	object, isMap := decoded.(map[string]any)
	if !isMap {
		return
	}
	info, isMap := object["info"].(map[string]any)
	if !isMap {
		return
	}
	pageInfo, isMap := info["pageInfo"].(map[string]any)
	if !isMap {
		return
	}
	if total, ok := numberField(pageInfo, "totalCount"); !ok || total != 0 {
		return
	}
	page := 1.0
	if value, exists := params["page"]; exists {
		// 非数字 page 在 Node 里得到 NaN，`NaN <= 1` 为假 → 不告警。这里必须同款地跳过，
		// 否则会给「翻页参数乱填」的请求发假告警。
		parsed, err := strconv.ParseFloat(value, 64)
		if err != nil {
			return
		}
		page = parsed
	}
	if page > 1 {
		return
	}

	// 合并表（MRG_MyISAM）UNION 成员缺失时订单列表恒为空，与「新用户确实没订单」无法区分。
	// 按会员每小时最多告警一次：留痕但不刷屏，也不阻断请求。
	slot := strconv.FormatInt(mid, 10) + ":" + strconv.FormatInt(p.now().UnixMilli()/3600000, 10)
	p.mu.Lock()
	already := p.warnSlot == slot
	if !already {
		p.warnSlot = slot
	}
	p.mu.Unlock()
	if already {
		return
	}
	p.warn(struct {
		Evt  string `json:"evt"`
		Mid  int64  `json:"mid"`
		Hint string `json:"hint"`
	}{
		Evt:  "order_list_empty",
		Mid:  mid,
		Hint: "若该会员确有历史订单：SHOW CREATE TABLE huoniao_waimai_order_all 检查是否含 UNION=",
	})
}

func (p *Proxy) fail(ctx context.Context, idemKey string, status int, code, message string) Result {
	if idemKey != "" {
		_ = p.idem.Abort(ctx, idemKey)
	}
	return failure(status, code, message)
}

func (p *Proxy) denied(ctx context.Context, idemKey string, status int, info any) Result {
	if status == 0 {
		status = http.StatusNotFound
	}
	message := "Not found"
	if text, ok := info.(string); ok {
		message = truncateRunes(text, 100)
	}
	return p.fail(ctx, idemKey, status, "NOT_FOUND_OR_DENIED", message)
}

func (p *Proxy) internal(ctx context.Context, idemKey, reason string) Result {
	p.warn(struct {
		Evt    string `json:"evt"`
		Reason string `json:"reason"`
	}{Evt: "fbproxy_internal", Reason: truncateRunes(reason, 300)})
	return p.fail(ctx, idemKey, http.StatusInternalServerError, "INTERNAL", "Internal error")
}

// validateDeal 是 waimai:deal 的专用校验：order_content 结构、preset 只能是 []、标量格式。
// 任一不合规直接 400——此时还没占位，客户端可修正后重试。
func validateDeal(merged map[string]any, params map[string]string) *Result {
	orderContent := ""
	if value, exists := merged["order_content"]; exists {
		switch typed := value.(type) {
		case string:
			orderContent = typed
		case float64:
			orderContent = orderIDString(typed)
		case nil:
			orderContent = ""
		default:
			orderContent = "{}"
		}
	}
	oc, ok := ValidateOrderContent(orderContent)
	if !ok {
		return &Result{Status: http.StatusBadRequest, Body: failureBody{Error: errorDetail{Code: "INVALID_ORDER", Message: "Invalid order parameters"}}}
	}
	if !shopIDRe.MatchString(params["shop"]) || !shopIDRe.MatchString(params["address"]) {
		return &Result{Status: http.StatusBadRequest, Body: failureBody{Error: errorDetail{Code: "INVALID_ORDER", Message: "Invalid order parameters"}}}
	}
	if !scalarOK(params, "paytype", paytypeRe) || !scalarOK(params, "peitype", peitypeRe) ||
		!scalarOK(params, "phone", phoneRe) || !scalarOK(params, "desk", deskRe) ||
		!scalarOK(params, "lng", coordRe) || !scalarOK(params, "lat", coordRe) ||
		!scalarOK(params, "selftime", selftimeRe) || !scalarOK(params, "orderTime", orderTimeRe) {
		return &Result{Status: http.StatusBadRequest, Body: failureBody{Error: errorDetail{Code: "INVALID_ORDER", Message: "Invalid order parameters"}}}
	}
	if value, exists := merged["preset"]; exists && value != nil {
		text, isString := value.(string)
		if !isString || (text != "" && text != "[]") {
			return &Result{Status: http.StatusBadRequest, Body: failureBody{Error: errorDetail{Code: "INVALID_ORDER", Message: "Invalid order parameters"}}}
		}
	}
	params["order_content"] = oc
	if _, exists := merged["preset"]; exists {
		params["preset"] = "[]"
	}
	return nil
}

// scalarOK：参数缺省视为通过；存在时必须匹配正则。
func scalarOK(params map[string]string, key string, pattern *regexp.Regexp) bool {
	value, exists := params[key]
	return !exists || pattern.MatchString(value)
}

type queryPair struct{ key, value string }

// callUpstream 发起一次上游调用。
// Cookie 只可能是服务端为该会员注入的凭证——客户端 Cookie 从不进入这个函数。
func (p *Proxy) callUpstream(
	ctx context.Context, cookie, service, action string,
	params map[string]string, post bool, extraHeaders map[string]string,
) ([]byte, any, error) {
	if p.upstream == "" {
		return nil, nil, errors.New("fbproxy: upstream base not configured")
	}

	pairs := make([]queryPair, 0, len(params)+3)
	if !post {
		for _, key := range sortedKeys(params) {
			pairs = append(pairs, queryPair{key: key, value: params[key]})
		}
	}
	pairs = append(pairs,
		queryPair{key: "service", value: service},
		queryPair{key: "action", value: action},
		queryPair{key: "platform_name", value: "tma"},
	)

	endpoint := p.upstream + "?" + encodePairs(pairs)
	reqCtx, cancel := context.WithTimeout(ctx, p.timeout)
	defer cancel()

	var body io.Reader
	if post {
		form := make([]queryPair, 0, len(params))
		for _, key := range sortedKeys(params) {
			form = append(form, queryPair{key: key, value: params[key]})
		}
		body = strings.NewReader(encodePairs(form))
	}

	method := http.MethodGet
	if post {
		method = http.MethodPost
	}
	request, err := http.NewRequestWithContext(reqCtx, method, endpoint, body)
	if err != nil {
		return nil, nil, err
	}
	request.Header.Set("Accept", "application/json")
	if post {
		request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	}
	if cookie != "" {
		request.Header.Set("Cookie", cookie)
	}
	for key, value := range extraHeaders {
		request.Header.Set(key, value)
	}

	client := p.client
	if client == nil {
		client = &http.Client{Timeout: p.timeout}
	}
	response, err := client.Do(request)
	if err != nil {
		return nil, nil, err
	}
	defer func() { _ = response.Body.Close() }()

	raw, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, nil, err
	}
	var decoded any
	if err := json.Unmarshal(raw, &decoded); err != nil {
		// 上游返回 HTML（前端控制器接管）或空响应时到这里：按上游异常处理，不做猜测。
		return nil, nil, fmt.Errorf("fbproxy: upstream returned invalid json: %w", err)
	}
	return raw, decoded, nil
}

func encodePairs(pairs []queryPair) string {
	parts := make([]string, 0, len(pairs))
	for _, pair := range pairs {
		parts = append(parts, url.QueryEscape(pair.key)+"="+url.QueryEscape(pair.value))
	}
	return strings.Join(parts, "&")
}

func sortedKeys(params map[string]string) []string {
	keys := make([]string, 0, len(params))
	for key := range params {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	return keys
}

func precheckPassed(decoded any) bool {
	object, ok := decoded.(map[string]any)
	if !ok {
		return false
	}
	if code, ok := numberField(object, "state"); !ok || code != 100 {
		return false
	}
	switch object["info"].(type) {
	case map[string]any, []any:
		return true
	}
	return false
}

func isJSONObjectLike(decoded any) bool {
	switch decoded.(type) {
	case map[string]any, []any:
		return true
	}
	return false
}

func stateOf(decoded any) any {
	object, ok := decoded.(map[string]any)
	if !ok {
		return nil
	}
	return object["state"]
}

func stateIs100(decoded any) bool {
	object, ok := decoded.(map[string]any)
	if !ok {
		return false
	}
	code, ok := numberField(object, "state")
	return ok && code == 100
}

func infoOf(decoded any) any {
	object, ok := decoded.(map[string]any)
	if !ok {
		return nil
	}
	return object["info"]
}

func numberField(object map[string]any, key string) (float64, bool) {
	switch value := object[key].(type) {
	case float64:
		return value, true
	case int:
		return float64(value), true
	case int64:
		return float64(value), true
	case json.Number:
		parsed, err := value.Float64()
		return parsed, err == nil
	}
	return 0, false
}

func truncateRunes(value string, limit int) string {
	runes := []rune(value)
	if len(runes) <= limit {
		return value
	}
	return string(runes[:limit])
}
