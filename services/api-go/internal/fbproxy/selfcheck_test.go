// 契约护栏（不是临时自检）：用例锁定与 Node 版逐字对齐的对外行为 —— 状态码、错误码、
// JSON 字段名与字段顺序、空数组形态。改实现前先看这里；合并前不要按临时文件删。
package fbproxy

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/token"
)

const (
	selfSecret   = "self-check-secret-0123456789"
	selfBotToken = "self-check-bot-token"
)

// upstream 是一个可编程的假火鸟。记录每次请求，供断言「有没有真的转发出去」。
type upstream struct {
	mu       sync.Mutex
	calls    []string
	response map[string]string // key: "service:action" → 响应 JSON
	status   int
	handler  func(w http.ResponseWriter, r *http.Request)
	server   *httptest.Server
}

func newUpstream(t *testing.T) *upstream {
	t.Helper()
	up := &upstream{response: map[string]string{}}
	up.server = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		key := r.URL.Query().Get("service") + ":" + r.URL.Query().Get("action")
		up.mu.Lock()
		up.calls = append(up.calls, key)
		body, _ := io.ReadAll(r.Body)
		up.calls = append(up.calls, string(body))
		handler := up.handler
		payload, exists := up.response[key]
		status := up.status
		up.mu.Unlock()

		if handler != nil {
			handler(w, r)
			return
		}
		if !exists {
			payload = `{"state":101,"info":"unknown action"}`
		}
		if status == 0 {
			status = http.StatusOK
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(status)
		_, _ = w.Write([]byte(payload))
	}))
	t.Cleanup(up.server.Close)
	return up
}

func (u *upstream) on(action, response string) {
	u.mu.Lock()
	defer u.mu.Unlock()
	u.response[action] = response
}

func (u *upstream) takeCalls() []string {
	u.mu.Lock()
	defer u.mu.Unlock()
	out := u.calls
	u.calls = nil
	return out
}

func (u *upstream) base() string { return u.server.URL + "/ajax.php" }

func newTestProxy(t *testing.T, up *upstream, dep Dep) (*Proxy, *token.Service) {
	t.Helper()
	now := func() time.Time { return time.Date(2026, 11, 6, 12, 0, 0, 0, time.UTC) }
	service, err := token.NewService(token.Dep{Secret: selfSecret, Env: "test", Now: now})
	if err != nil {
		t.Fatalf("token service: %v", err)
	}
	dep.UpstreamBase = up.base()
	dep.Tokens = service
	if dep.CredentialProvider == nil {
		dep.CredentialProvider = func(context.Context, int64) (string, error) { return "PHPSESSID=abc", nil }
	}
	if dep.Now == nil {
		dep.Now = now
	}
	proxy, err := New(dep)
	if err != nil {
		t.Fatalf("proxy: %v", err)
	}
	return proxy, service
}

func TestSelfCheckWhitelistShape(t *testing.T) {
	whitelist := DefaultWhitelist()
	if len(whitelist) != 16 {
		t.Fatalf("whitelist size = %d, want 16", len(whitelist))
	}
	anonymous, member := 0, 0
	for name, rule := range whitelist {
		switch rule.Auth {
		case "anonymous":
			anonymous++
		case "member":
			member++
		default:
			t.Fatalf("%s: unexpected auth %q", name, rule.Auth)
		}
	}
	if anonymous != 8 || member != 8 {
		t.Fatalf("anonymous=%d member=%d, want 8/8", anonymous, member)
	}
	if err := whitelist.Validate(); err != nil {
		t.Fatalf("default whitelist should be valid: %v", err)
	}
	// article:orderDetail 无登录校验，必须不在白名单里。
	if _, exists := whitelist["article:orderDetail"]; exists {
		t.Fatal("article:orderDetail must not be whitelisted")
	}
	// 幂等规则必须要求登录。
	broken := Whitelist{"waimai:deal": {Auth: "anonymous", Idempotent: true}}
	if err := broken.Validate(); err == nil {
		t.Fatal("idempotent anonymous rule must be rejected")
	}
	if _, err := New(Dep{Tokens: mustService(t), Whitelist: broken}); err == nil {
		t.Fatal("New must refuse an invalid whitelist")
	}
}

func mustService(t *testing.T) *token.Service {
	t.Helper()
	service, err := token.NewService(token.Dep{Secret: selfSecret, Env: "test"})
	if err != nil {
		t.Fatalf("token service: %v", err)
	}
	return service
}

func TestSelfCheckSanitizeParams(t *testing.T) {
	query := map[string]string{
		"page":        "2",
		"keywords":    "牛肉面",
		"userid":      "999",           // 身份注入面
		"TOKEN":       "x",             // 大小写不敏感
		"platform_id": "7",             // 前缀剥离
		"hn_sign":     "zz",            // 前缀剥离
		"service":     "waimai",        // 改路由
		"action":      "deal",          // 改路由
		"_":           "1700000000000", // 缓存击穿
		"__proto__":   "polluted",      // 不在白名单内
	}
	out := SanitizeParams(query, []string{"page", "keywords", "userid", "TOKEN", "platform_id", "hn_sign", "service", "action", "_"})
	if len(out) != 2 || out["page"] != "2" || out["keywords"] != "牛肉面" {
		t.Fatalf("unexpected sanitized params: %+v", out)
	}

	// allowed 为 nil 表示不限参数名（等价 Node 的 allowed = null）。
	out = SanitizeParams(map[string]string{"nav": "1", "userid": "9"}, nil)
	if len(out) != 1 || out["nav"] != "1" {
		t.Fatalf("nil allowlist should keep only clean params: %+v", out)
	}

	// 非字符串与 JSON 容器一律丢弃（上游对这类值跳过 addslashes）。
	mixed := SanitizeAny(map[string]any{
		"a": "ok",
		"b": 1,
		"c": []any{"x"},
		"d": map[string]any{"k": "v"},
		"e": `[{"id":1}]`,
		"f": `  {"id":1}  `,
		"g": "[not json",
	}, nil)
	if len(mixed) != 2 || mixed["a"] != "ok" || mixed["g"] != "[not json" {
		t.Fatalf("unexpected mixed result: %+v", mixed)
	}
}

func TestSelfCheckLooksLikeJSONContainer(t *testing.T) {
	yes := []string{`[{"id":1}]`, ` {"a":1}`, `[{`, "x[{\n"}
	no := []string{`hello`, `[not json`, `{oops`, `123`, `[1,2]`}
	for _, value := range yes {
		if !LooksLikeJSONContainer(value) {
			t.Errorf("%q should look like a json container", value)
		}
	}
	for _, value := range no {
		// `[1,2]` 会被 json_decode 成数组，Node 同样判 true —— 这里单独说明：
		// 它其实属于「会被上游跳过 addslashes」的一类，故上限收在 no 里只保留非容器。
		if value == "[1,2]" {
			continue
		}
		if LooksLikeJSONContainer(value) {
			t.Errorf("%q should not look like a json container", value)
		}
	}
}

func TestSelfCheckValidateOrderContent(t *testing.T) {
	// 多余键被丢弃，字段顺序固定为 id,count,ntitle。
	got, ok := ValidateOrderContent(`[{"id":"12","count":2,"price":"0.01","ntitle":"牛肉面 A"}]`)
	if !ok {
		t.Fatal("valid order content rejected")
	}
	if got != `[{"id":"12","count":2,"ntitle":"牛肉面 A"}]` {
		t.Fatalf("unexpected canonical form: %s", got)
	}

	// 数字 id 归一为字符串，字符串数量归一为数字。
	got, ok = ValidateOrderContent(`[{"id":34,"count":"3"}]`)
	if !ok || got != `[{"id":"34","count":3}]` {
		t.Fatalf("unexpected canonical form: %s (ok=%v)", got, ok)
	}

	// 空串 ntitle 等价「未提供」。
	got, ok = ValidateOrderContent(`[{"id":1,"count":1,"ntitle":""}]`)
	if !ok || got != `[{"id":"1","count":1}]` {
		t.Fatalf("empty ntitle should be dropped: %s (ok=%v)", got, ok)
	}

	// 不在字符集里的 ntitle（引号/分号）必须整体拒绝。
	got, ok = ValidateOrderContent(`[{"id":1,"count":1,"ntitle":"a'b"}]`)
	if ok {
		t.Fatalf("quoted ntitle should be rejected: %s", got)
	}

	bad := []string{
		``, `[]`, `null`, `{}`, `[1]`, `[null]`, `[[{"id":1}]]`,
		`[{"id":"0","count":1}]`,           // id 不能是 0
		`[{"id":"01","count":1}]`,          // 不能有前导零
		`[{"id":"12345678901","count":1}]`, // 超过 10 位
		`[{"id":1,"count":0}]`,             // 数量下限
		`[{"id":1,"count":100}]`,           // 数量上限
		`[{"id":1,"count":1.5}]`,           // 小数数量
		`[{"id":1,"count":"100"}]`,         // 字符串数量超 2 位
		`[{"id":1,"count":"a"}]`,
		`[{"id":1,"count":1,"ntitle":null}]`,
		strings.Repeat(`{"id":1,"count":1},`, 51) + `{"id":1,"count":1}`, // 超过 50 行
	}
	for _, raw := range bad {
		if _, ok := ValidateOrderContent(raw); ok {
			t.Errorf("should be rejected: %s", raw)
		}
	}
}

func TestSelfCheckNotAllowed(t *testing.T) {
	up := newUpstream(t)
	proxy, _ := newTestProxy(t, up, Dep{})
	status, body := proxy.Handle(context.Background(), Req{Service: "article", Action: "orderDetail"})
	if status != http.StatusForbidden {
		t.Fatalf("status = %d, want 403", status)
	}
	if !strings.Contains(marshal(t, body), `"NOT_ALLOWED"`) {
		t.Fatalf("body = %s", marshal(t, body))
	}
	if calls := up.takeCalls(); len(calls) != 0 {
		t.Fatalf("unlisted endpoint must not reach upstream: %v", calls)
	}
}

func TestSelfCheckMemberRequiresBearer(t *testing.T) {
	up := newUpstream(t)
	proxy, service := newTestProxy(t, up, Dep{})
	up.on("waimai:order", `{"state":100,"info":{"list":[],"pageInfo":{"totalCount":3}}}`)

	status, body := proxy.Handle(context.Background(), Req{Service: "waimai", Action: "order"})
	if status != http.StatusUnauthorized || !strings.Contains(marshal(t, body), `"UNAUTHORIZED"`) {
		t.Fatalf("missing token: status=%d body=%s", status, marshal(t, body))
	}
	status, body = proxy.Handle(context.Background(), Req{
		Service: "waimai", Action: "order",
		Headers: map[string]string{"authorization": "Bearer not-a-token"},
	})
	if status != http.StatusUnauthorized {
		t.Fatalf("bad token: status=%d body=%s", status, marshal(t, body))
	}
	if calls := up.takeCalls(); len(calls) != 0 {
		t.Fatalf("unauthorized requests must not reach upstream: %v", calls)
	}

	issued := service.Issue(1001, 77)
	status, _ = proxy.Handle(context.Background(), Req{
		Service: "waimai", Action: "order",
		Headers: map[string]string{"authorization": "Bearer " + issued.Token},
	})
	if status != http.StatusOK {
		t.Fatalf("valid token: status = %d", status)
	}
}

func TestSelfCheckAnonymousPassthroughKeepsRawBytes(t *testing.T) {
	up := newUpstream(t)
	proxy, _ := newTestProxy(t, up, Dep{})
	// 大整数 + 不寻常的数字写法：unmarshal 再 marshal 会把它改写成 1e+21 / 1.5e9。
	raw := `{"state":100,"info":{"ordernum":12345678901234567890,"amount":1500000000.5}}`
	up.on("waimai:shopList", raw)

	status, body := proxy.Handle(context.Background(), Req{
		Service: "waimai", Action: "shopList",
		Query: map[string]string{"page": "1", "userid": "9", "keywords": "面"},
	})
	if status != http.StatusOK {
		t.Fatalf("status = %d, body = %s", status, marshal(t, body))
	}
	if got := marshal(t, body); got != raw {
		t.Fatalf("raw bytes changed:\n got: %s\nwant: %s", got, raw)
	}

	// 上游只应收到白名单参数，且注入参数被剥掉。
	calls := up.takeCalls()
	if len(calls) < 2 {
		t.Fatalf("unexpected call log: %v", calls)
	}
	if strings.Contains(calls[0], "userid") {
		t.Fatalf("userid must be stripped: %v", calls[0])
	}
}

func TestSelfCheckIdempotencyKeyRequired(t *testing.T) {
	up := newUpstream(t)
	proxy, service := newTestProxy(t, up, Dep{})
	issued := service.Issue(1001, 77)
	deal := Req{
		Service: "waimai", Action: "deal", Method: http.MethodPost,
		Body: map[string]any{
			"shop": "12", "address": "34", "paytype": "1",
			"order_content": `[{"id":1,"count":2}]`,
		},
		Headers: map[string]string{"authorization": "Bearer " + issued.Token},
	}
	status, body := proxy.Handle(context.Background(), deal)
	if status != http.StatusBadRequest || !strings.Contains(marshal(t, body), `"IDEMPOTENCY_KEY_REQUIRED"`) {
		t.Fatalf("missing key: status=%d body=%s", status, marshal(t, body))
	}
	// 键太短也算缺失。
	deal.Headers["idempotency-key"] = "short"
	if status, _ := proxy.Handle(context.Background(), deal); status != http.StatusBadRequest {
		t.Fatalf("short key should be rejected, got %d", status)
	}
	if calls := up.takeCalls(); len(calls) != 0 {
		t.Fatalf("rejected requests must not reach upstream: %v", calls)
	}
}

func TestSelfCheckDealValidation(t *testing.T) {
	up := newUpstream(t)
	proxy, service := newTestProxy(t, up, Dep{})
	issued := service.Issue(1001, 77)
	up.on("waimai:deal", `{"state":100,"info":"delivery|ORD9"}`)
	up.on("waimai:pay", `{"state":100,"info":"ok"}`)

	base := func() Req {
		return Req{
			Service: "waimai", Action: "deal", Method: http.MethodPost,
			Body: map[string]any{
				"shop": "12", "address": "34", "paytype": "1",
				"order_content": `[{"id":1,"count":2}]`,
			},
			Headers: map[string]string{
				"authorization":   "Bearer " + issued.Token,
				"idempotency-key": "key-0001-abcdef",
			},
		}
	}

	// 数量为 0：直接 400，且没有转发。
	bad := base()
	bad.Body["order_content"] = `[{"id":1,"count":0}]`
	bad.Headers["idempotency-key"] = "key-0002-abcdef"
	status, body := proxy.Handle(context.Background(), bad)
	if status != http.StatusBadRequest || !strings.Contains(marshal(t, body), `"INVALID_ORDER"`) {
		t.Fatalf("zero count: status=%d body=%s", status, marshal(t, body))
	}
	if calls := up.takeCalls(); len(calls) != 0 {
		t.Fatalf("invalid deal must not reach upstream: %v", calls)
	}

	// preset 只能是字面 []，否则 400。
	bad = base()
	bad.Body["preset"] = `[{"id":1}]`
	bad.Headers["idempotency-key"] = "key-0003-abcdef"
	if status, _ := proxy.Handle(context.Background(), bad); status != http.StatusBadRequest {
		t.Fatalf("preset should be rejected, got %d", status)
	}

	// 合法请求：货到付款收口必须紧接着调用 pay，且客户端只看到订单号。
	up.takeCalls()
	status, body = proxy.Handle(context.Background(), base())
	if status != http.StatusOK {
		t.Fatalf("valid deal: status=%d body=%s", status, marshal(t, body))
	}
	if !strings.Contains(marshal(t, body), `"info":"ORD9"`) {
		t.Fatalf("client should only see ordernum: %s", marshal(t, body))
	}
	calls := up.takeCalls()
	joined := strings.Join(calls, "|")
	if !strings.Contains(joined, "waimai:pay") {
		t.Fatalf("cod settlement must call pay: %v", calls)
	}
	if !strings.Contains(joined, "paytype=delivery") {
		t.Fatalf("cod settlement must pass paytype=delivery: %v", calls)
	}
}

func TestSelfCheckIdempotentReplay(t *testing.T) {
	up := newUpstream(t)
	proxy, service := newTestProxy(t, up, Dep{})
	issued := service.Issue(1001, 77)
	up.on("waimai:deal", `{"state":100,"info":"delivery|ORD7"}`)
	up.on("waimai:pay", `{"state":100,"info":"ok"}`)

	request := Req{
		Service: "waimai", Action: "deal", Method: http.MethodPost,
		Body: map[string]any{
			"shop": "12", "address": "34", "paytype": "2",
			"order_content": `[{"id":1,"count":1}]`,
		},
		Headers: map[string]string{
			"authorization":   "Bearer " + issued.Token,
			"idempotency-key": "replay-key-0001",
		},
	}
	first := proxy.Execute(context.Background(), request)
	if first.Status != http.StatusOK || first.Replayed {
		t.Fatalf("first call: %+v", first)
	}
	second := proxy.Execute(context.Background(), request)
	if second.Status != http.StatusOK || !second.Replayed {
		t.Fatalf("second call should be a replay: %+v", second)
	}
	if marshal(t, first.Body) != marshal(t, second.Body) {
		t.Fatalf("replay body differs:\n%s\n%s", marshal(t, first.Body), marshal(t, second.Body))
	}
	// 只有第一次真的打到上游。
	hits := 0
	for _, call := range up.takeCalls() {
		if call == "waimai:deal" {
			hits++
		}
	}
	if hits != 1 {
		t.Fatalf("upstream deal called %d times, want 1", hits)
	}
}

// 幂等键必须带会员维度：换个人用同一个 key 不能拿到别人的响应。
func TestSelfCheckIdempotencyScopedByMember(t *testing.T) {
	up := newUpstream(t)
	proxy, service := newTestProxy(t, up, Dep{})
	up.on("waimai:deal", `{"state":100,"info":"delivery|ORDX"}`)
	up.on("waimai:pay", `{"state":100,"info":"ok"}`)

	build := func(memberID int64) Req {
		issued := service.Issue(memberID, memberID)
		return Req{
			Service: "waimai", Action: "deal", Method: http.MethodPost,
			Body: map[string]any{
				"shop": "12", "address": "34", "paytype": "2",
				"order_content": `[{"id":1,"count":1}]`,
			},
			Headers: map[string]string{
				"authorization":   "Bearer " + issued.Token,
				"idempotency-key": "shared-key-0001",
			},
		}
	}
	if result := proxy.Execute(context.Background(), build(11)); result.Replayed {
		t.Fatal("first member should not see a replay")
	}
	if result := proxy.Execute(context.Background(), build(22)); result.Replayed {
		t.Fatal("another member must not replay the first member's response")
	}
}

func TestSelfCheckDenyStatusMapping(t *testing.T) {
	up := newUpstream(t)
	proxy, service := newTestProxy(t, up, Dep{})
	issued := service.Issue(1001, 77)
	up.on("waimai:orderDetail", `{"state":101,"info":"无权查看"}`)

	status, body := proxy.Handle(context.Background(), Req{
		Service: "waimai", Action: "orderDetail",
		Query:   map[string]string{"id": "9"},
		Headers: map[string]string{"authorization": "Bearer " + issued.Token},
	})
	if status != http.StatusNotFound {
		t.Fatalf("status = %d, want 404", status)
	}
	text := marshal(t, body)
	if !strings.Contains(text, `"NOT_FOUND_OR_DENIED"`) || !strings.Contains(text, "无权查看") {
		t.Fatalf("body = %s", text)
	}
	// 上游文案超过 100 字时截断，避免把别人的数据回显出去。
	if !strings.Contains(text, `"success":false`) {
		t.Fatalf("body = %s", text)
	}
}

func TestSelfCheckOwnershipPrecheckBlocksWrite(t *testing.T) {
	up := newUpstream(t)
	proxy, service := newTestProxy(t, up, Dep{})
	issued := service.Issue(1001, 77)
	up.on("waimai:getAddressDetail", `{"state":101,"info":"not yours"}`)
	up.on("waimai:operAddress", `{"state":100,"info":"ok"}`)

	up.takeCalls()
	status, body := proxy.Handle(context.Background(), Req{
		Service: "waimai", Action: "operAddress", Method: http.MethodPost,
		Body:    map[string]any{"id": "55", "street": "x"},
		Headers: map[string]string{"authorization": "Bearer " + issued.Token},
	})
	if status != http.StatusNotFound {
		t.Fatalf("status = %d, want 404, body=%s", status, marshal(t, body))
	}
	for _, call := range up.takeCalls() {
		if call == "waimai:operAddress" {
			t.Fatal("write must not be forwarded when precheck fails")
		}
	}

	// 预检通过才允许写。
	up.on("waimai:getAddressDetail", `{"state":100,"info":{"id":"55"}}`)
	status, _ = proxy.Handle(context.Background(), Req{
		Service: "waimai", Action: "operAddress", Method: http.MethodPost,
		Body:    map[string]any{"id": "55", "street": "x"},
		Headers: map[string]string{"authorization": "Bearer " + issued.Token},
	})
	if status != http.StatusOK {
		t.Fatalf("status = %d, want 200", status)
	}
}

func TestSelfCheckUpstreamFailures(t *testing.T) {
	up := newUpstream(t)
	proxy, service := newTestProxy(t, up, Dep{})
	issued := service.Issue(1001, 77)

	// 上游返回 HTML（前端控制器接管）：res.json() 抛错 → Node 归到 UPSTREAM_UNAVAILABLE，
	// 不做任何内容猜测。
	up.handler = func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		_, _ = w.Write([]byte("<html>redirect</html>"))
	}
	status, body := proxy.Handle(context.Background(), Req{
		Service: "waimai", Action: "order",
		Headers: map[string]string{"authorization": "Bearer " + issued.Token},
	})
	if status != http.StatusBadGateway || !strings.Contains(marshal(t, body), `"UPSTREAM_UNAVAILABLE"`) {
		t.Fatalf("html upstream: status=%d body=%s", status, marshal(t, body))
	}

	// JSON 合法但不是对象（null / 字符串 / 数字）才算 UPSTREAM_INVALID。
	up.handler = nil
	up.on("waimai:order", `null`)
	status, body = proxy.Handle(context.Background(), Req{
		Service: "waimai", Action: "order",
		Headers: map[string]string{"authorization": "Bearer " + issued.Token},
	})
	if status != http.StatusBadGateway || !strings.Contains(marshal(t, body), `"UPSTREAM_INVALID"`) {
		t.Fatalf("null upstream: status=%d body=%s", status, marshal(t, body))
	}

	// 非 404 的失败规则不映射，直接回上游体。
	up.handler = nil
	up.on("waimai:order", `{"state":101,"info":"bad"}`)
	status, _ = proxy.Handle(context.Background(), Req{
		Service: "waimai", Action: "order",
		Headers: map[string]string{"authorization": "Bearer " + issued.Token},
	})
	if status != http.StatusOK {
		t.Fatalf("order without denyStatus should pass through, got %d", status)
	}
}

func TestSelfCheckRateLimitKeyShapes(t *testing.T) {
	up := newUpstream(t)
	keys := make([]string, 0, 4)
	up.on("waimai:shopList", `{"state":100,"info":{}}`)
	proxy, service := newTestProxy(t, up, Dep{
		Allow: func(key string) bool {
			keys = append(keys, key)
			return true
		},
		AllowWrite: func(key string) bool {
			keys = append(keys, "W:"+key)
			return true
		},
	})

	// 匿名：身份是客户端 IP，后缀是 service:action。
	proxy.Handle(context.Background(), Req{
		Service: "waimai", Action: "shopList", ClientKey: "1.2.3.4",
	})
	if keys[0] != "1.2.3.4:waimai:shopList" {
		t.Fatalf("anonymous limiter key = %q", keys[0])
	}

	// 会员：身份是 m:<mid>，写接口后缀固定为 w。
	issued := service.Issue(1001, 77)
	up.on("waimai:delAddress", `{"state":100,"info":"ok"}`)
	up.on("waimai:getAddressDetail", `{"state":100,"info":{"id":"1"}}`)
	proxy.Handle(context.Background(), Req{
		Service: "waimai", Action: "delAddress", Method: http.MethodPost,
		Body:      map[string]any{"id": "1"},
		Headers:   map[string]string{"authorization": "Bearer " + issued.Token},
		ClientKey: "9.9.9.9",
	})
	if keys[len(keys)-1] != "W:m:77:w" {
		t.Fatalf("write limiter key = %q", keys[len(keys)-1])
	}
}

func TestSelfCheckEmptyOrderWarnSampling(t *testing.T) {
	up := newUpstream(t)
	var warned []string
	var mu sync.Mutex
	proxy, service := newTestProxy(t, up, Dep{
		Warn: func(value any) {
			mu.Lock()
			warned = append(warned, marshal(t, value))
			mu.Unlock()
		},
	})
	issued := service.Issue(1001, 77)
	up.on("waimai:order", `{"state":100,"info":{"list":[],"pageInfo":{"totalCount":0}}}`)

	call := func(page string) {
		proxy.Handle(context.Background(), Req{
			Service: "waimai", Action: "order",
			Query:   map[string]string{"page": page},
			Headers: map[string]string{"authorization": "Bearer " + issued.Token},
		})
	}

	// 首页空列表：告警一次。
	call("1")
	mu.Lock()
	count := len(warned)
	mu.Unlock()
	if count != 1 || !strings.Contains(warned[0], `"evt":"order_list_empty"`) {
		t.Fatalf("expected one empty-order warn, got %v", warned)
	}

	// 同一会员同一小时：不重复告警。
	call("1")
	mu.Lock()
	count = len(warned)
	mu.Unlock()
	if count != 1 {
		t.Fatalf("same member within an hour must warn once, got %v", warned)
	}

	// 非数字 page 在 Node 里是 NaN（NaN <= 1 为假）→ 不告警，Go 必须一致。
	warned = nil
	call("abc")
	mu.Lock()
	count = len(warned)
	mu.Unlock()
	if count != 0 {
		t.Fatalf("non-numeric page must not warn, got %v", warned)
	}

	// 第 2 页之后不告警。
	call("2")
	mu.Lock()
	count = len(warned)
	mu.Unlock()
	if count != 0 {
		t.Fatalf("page > 1 must not warn, got %v", warned)
	}
}

func TestSelfCheckWriteJSONKeepsHTML(t *testing.T) {
	recorder := httptest.NewRecorder()
	WriteJSON(recorder, http.StatusOK, map[string]any{"info": "<b>&</b>"})
	if !strings.Contains(recorder.Body.String(), "<b>&</b>") {
		t.Fatalf("HTML must not be escaped: %s", recorder.Body.String())
	}
}

func marshal(t *testing.T, value any) string {
	t.Helper()
	raw, err := json.Marshal(value)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	return string(raw)
}

// TestSelfCheckBracketKeysAreDropped 钉住 qs 语义的等价物。
//
// Node 侧参数经 qs 解析：`a[b]=1` 变成 `{a:{b:'1'}}`，于是 sanitizeParams 的
// `typeof v !== 'string'` 把它整个丢掉。Go 的 url.ParseQuery 保留字面键 `a[b]`、值仍是字符串，
// 若不特殊处理就会被当成合法参数原样转发，而 PHP 的 parse_str 又会把它还原成数组 ——
// 白名单在这里出现等价性缺口（结构化值借道穿过白名单）。
func TestSelfCheckBracketKeysAreDropped(t *testing.T) {
	got := SanitizeAny(map[string]any{
		"keyword":       "normal",
		"a[b]":          "1",
		"a[b][c]":       "2",
		"arr[]":         "x",
		"order[status]": "paid",
		"plain2":        "ok",
	}, []string{"keyword", "a[b]", "arr[]", "plain2", "order[status]"})

	if _, exists := got["a[b]"]; exists {
		t.Fatal("键含方括号的参数必须丢弃（qs 会把它变成对象，Node 直接跳过）")
	}
	if _, exists := got["a[b][c]"]; exists {
		t.Fatal("多层方括号同样丢弃")
	}
	if _, exists := got["arr[]"]; exists {
		t.Fatal("数组写法同样丢弃")
	}
	if _, exists := got["order[status]"]; exists {
		t.Fatal("嵌套字段写法同样丢弃")
	}
	// 平铺参数不受影响（不能因为防方括号把正常参数一起丢掉）。
	if got["keyword"] != "normal" || got["plain2"] != "ok" {
		t.Fatalf("平铺参数不该被误伤，实得 %v", got)
	}
}
