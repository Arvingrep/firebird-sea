package fbproxy

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/token"
)

// 逐条翻译自 services/api/test/fb-proxy.test.js（17 条）。
//
// Node 注入 `fetchImpl` 打桩；Go 侧用 httptest 起一个「假火鸟 ajax.php」，把每次请求的
// URL/方法/表单体/请求头都记下来 —— 「有没有真的转发出去」「转发时带了什么」都靠这份记录断言。

const (
	stubSecret = "proxy-test-secret-0123"
	// stubCookie 是服务端为该会员注入的凭证。
	stubCookie = "login_user=SERVERSIDE"
)

var stubNow = time.Date(2026, 11, 6, 12, 0, 0, 0, time.UTC)

// stubRequest 是一次上游请求的快照。
type stubRequest struct {
	Method string
	Query  url.Values
	Form   url.Values
	Header http.Header
	// Path 保留原始请求路径，用于断言上游端点没被改写。
	Path string
}

// phpStub 是可控的假火鸟端点。
type phpStub struct {
	mu       sync.Mutex
	requests []stubRequest
	handler  func(index int, w http.ResponseWriter, r *http.Request)
	server   *httptest.Server
}

func newPHPStub(t *testing.T) *phpStub {
	t.Helper()
	stub := &phpStub{}
	stub.server = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = r.ParseForm()
		record := stubRequest{
			Method: r.Method,
			Query:  r.URL.Query(),
			Form:   r.PostForm,
			Header: r.Header.Clone(),
			Path:   r.URL.Path,
		}
		// 表单体只对 POST 有意义；ParseForm 已把 body 读进 PostForm。
		stub.mu.Lock()
		stub.requests = append(stub.requests, record)
		index := len(stub.requests)
		handler := stub.handler
		stub.mu.Unlock()

		if handler != nil {
			handler(index, w, r)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"state":100,"info":[]}`))
	}))
	t.Cleanup(stub.server.Close)
	return stub
}

func (s *phpStub) respond(handler func(index int, w http.ResponseWriter, r *http.Request)) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.handler = handler
}

func (s *phpStub) base() string {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.server.URL + "/ajax.php"
}

func (s *phpStub) count() int {
	s.mu.Lock()
	defer s.mu.Unlock()
	return len(s.requests)
}

func (s *phpStub) at(index int) stubRequest {
	s.mu.Lock()
	defer s.mu.Unlock()
	if index >= len(s.requests) {
		return stubRequest{}
	}
	return s.requests[index]
}

// newStubProxy 构造代理，Dep 由调用方按用例覆盖。
func newStubProxy(t *testing.T, stub *phpStub, dep Dep) (*Proxy, *token.Service) {
	t.Helper()
	service, err := token.NewService(token.Dep{Secret: stubSecret, Env: "canary", Now: func() time.Time { return stubNow }})
	if err != nil {
		t.Fatalf("token service: %v", err)
	}
	dep.Tokens = service
	dep.UpstreamBase = stub.base()
	if dep.Now == nil {
		dep.Now = func() time.Time { return stubNow }
	}
	proxy, err := New(dep)
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	return proxy, service
}

// bearer 签发一个会员令牌并返回 authorization 头值。
func bearer(service *token.Service, memberID int64) string {
	return "Bearer " + service.Issue(1, memberID).Token
}

// bodyJSON 把 Result.Body 统一成 map（可能是 json.RawMessage 或已解码的 map）。
func bodyJSON(t *testing.T, body any) map[string]any {
	t.Helper()
	switch typed := body.(type) {
	case json.RawMessage:
		var decoded map[string]any
		if err := json.Unmarshal(typed, &decoded); err != nil {
			t.Fatalf("body 不是 JSON 对象：%v（%s）", err, typed)
		}
		return decoded
	case map[string]any:
		return typed
	case failureBody:
		raw, _ := json.Marshal(typed)
		var decoded map[string]any
		_ = json.Unmarshal(raw, &decoded)
		return decoded
	case []byte:
		var decoded map[string]any
		if err := json.Unmarshal(typed, &decoded); err != nil {
			t.Fatalf("body 不是 JSON 对象：%v", err)
		}
		return decoded
	}
	t.Fatalf("未预期的 body 类型 %T", body)
	return nil
}

// errorCodeOf 取 failureBody 的错误码。
func errorCodeOf(t *testing.T, body any) string {
	t.Helper()
	raw, err := json.Marshal(body)
	if err != nil {
		t.Fatalf("marshal body: %v", err)
	}
	var decoded struct {
		Error struct {
			Code string `json:"code"`
		} `json:"error"`
	}
	if err := json.Unmarshal(raw, &decoded); err != nil {
		t.Fatalf("decode body: %v", err)
	}
	return decoded.Error.Code
}

// TestFBProxy 对应 fb-proxy.test.js 的 17 条用例。
func TestFBProxy(t *testing.T) {
	t.Run("白名单外的 service+action 返回 403 且不转发", func(t *testing.T) {
		stub := newPHPStub(t)
		proxy, _ := newStubProxy(t, stub, Dep{})
		for _, pair := range [][2]string{
			{"article", "orderDetail"}, {"waimai", "getAddressDetail"}, {"member", "login"},
			{"siteConfig", "config"}, {"waimai", "paySuccess"}, {"waimai", "pay"},
		} {
			status, body := proxy.Handle(context.Background(), Req{Service: pair[0], Action: pair[1], Method: http.MethodGet})
			if status != http.StatusForbidden {
				t.Fatalf("%s:%s status = %d, want 403", pair[0], pair[1], status)
			}
			if code := errorCodeOf(t, body); code != "NOT_ALLOWED" {
				t.Fatalf("%s:%s code = %q, want NOT_ALLOWED", pair[0], pair[1], code)
			}
		}
		if stub.count() != 0 {
			t.Fatalf("白名单外的请求不得转发，实际转发 %d 次", stub.count())
		}
	})

	t.Run("展示类白名单：8 个匿名只读接口，shopList/shopType 声明参数白名单", func(t *testing.T) {
		whitelist := DefaultWhitelist()
		var anonymous, member []string
		for key, rule := range whitelist {
			switch rule.Auth {
			case "anonymous":
				anonymous = append(anonymous, key)
			case "member":
				member = append(member, key)
				if rule.Params == nil {
					t.Fatalf("%s 必须声明参数白名单", key)
				}
			}
		}
		sort.Strings(anonymous)
		sort.Strings(member)
		wantAnonymous := []string{
			"article:alist", "article:detail", "article:type", "waimai:food", "waimai:foodType",
			"waimai:shopList", "waimai:shopType", "waimai:storeDetail",
		}
		wantMember := []string{
			"waimai:cancelOrder", "waimai:deal", "waimai:delAddress", "waimai:getCourierLocation",
			"waimai:getMemberAddress", "waimai:operAddress", "waimai:order", "waimai:orderDetail",
		}
		if strings.Join(anonymous, ",") != strings.Join(wantAnonymous, ",") {
			t.Fatalf("匿名白名单 = %v, want %v", anonymous, wantAnonymous)
		}
		if strings.Join(member, ",") != strings.Join(wantMember, ",") {
			t.Fatalf("会员白名单 = %v, want %v", member, wantMember)
		}

		// 轨迹接口上游只按 orderid 查、无归属条件，必须靠预检兜住。
		precheck := whitelist["waimai:getCourierLocation"].OwnershipPrecheck
		if precheck == nil || precheck.Action != "orderDetail" || precheck.IDParam != "orderid" {
			t.Fatalf("getCourierLocation 预检配置 = %+v", precheck)
		}
		if _, exists := whitelist["article:orderDetail"]; exists {
			t.Fatal("article:orderDetail 无登录校验，不得进白名单")
		}
		// 首页搜索开始透传 keywords，必须走白名单；同时挡住注入面参数。
		shopParams := whitelist["waimai:shopList"].Params
		if shopParams == nil {
			t.Fatal("shopList 必须声明参数白名单")
		}
		for _, bad := range []string{"ids", "lng", "lat", "cityid", "u"} {
			if containsString(shopParams, bad) {
				t.Fatalf("shopList 不得透传 %s", bad)
			}
		}
		if !whitelist["waimai:deal"].Idempotent {
			t.Fatal("waimai:deal 必须是幂等规则")
		}
	})

	t.Run("shopList 只透传搜索/分页/筛选参数，注入面参数被丢弃", func(t *testing.T) {
		stub := newPHPStub(t)
		proxy, _ := newStubProxy(t, stub, Dep{})
		status, body := proxy.Handle(context.Background(), Req{
			Service: "waimai", Action: "shopList", Method: http.MethodGet,
			Query: map[string]string{
				"page": "2", "pageSize": "20", "keywords": "鸡排", "orderby": "2", "typeid": "7",
				"ids": "1,2,3", "lng": "121", "lat": "31", "cityid": "5", "u": "9",
			},
		})
		if status != http.StatusOK {
			t.Fatalf("status = %d, want 200（body=%v）", status, body)
		}
		query := stub.at(0).Query
		for key, want := range map[string]string{"page": "2", "pageSize": "20", "keywords": "鸡排", "orderby": "2", "typeid": "7"} {
			if got := query.Get(key); got != want {
				t.Fatalf("%s = %q, want %q", key, got, want)
			}
		}
		for _, bad := range []string{"ids", "lng", "lat", "cityid", "u"} {
			if query.Has(bad) {
				t.Fatalf("%s 不得转发，实际 query=%v", bad, query)
			}
		}
	})

	t.Run("shopType 匿名可读，只透传 nav", func(t *testing.T) {
		stub := newPHPStub(t)
		proxy, _ := newStubProxy(t, stub, Dep{})
		status, _ := proxy.Handle(context.Background(), Req{
			Service: "waimai", Action: "shopType", Method: http.MethodGet,
			Query: map[string]string{"nav": "1", "userkey": "x"},
		})
		if status != http.StatusOK {
			t.Fatalf("status = %d, want 200", status)
		}
		query := stub.at(0).Query
		if query.Get("nav") != "1" {
			t.Fatalf("nav = %q, want 1", query.Get("nav"))
		}
		if query.Has("userkey") {
			t.Fatalf("userkey 是身份旁路参数，不得转发：%v", query)
		}
	})

	t.Run("身份与旁路参数被剥离，不带客户端 Cookie，强制 platform_name=tma", func(t *testing.T) {
		stub := newPHPStub(t)
		proxy, _ := newStubProxy(t, stub, Dep{})
		status, _ := proxy.Handle(context.Background(), Req{
			Service: "waimai", Action: "shopList", Method: http.MethodGet,
			Query: map[string]string{
				"page": "1", "userkey": "x", "access_token": "y", "platform_userid": "1",
				"platform_name": "ios", "HN_login_user": "c", "forcelogout": "1",
				"rsaEncrypt": "1", "uid": "5",
			},
			// 客户端自带的 Cookie 绝不能被转发（否则等于让调用方自证身份）。
			Headers: map[string]string{"cookie": "login_user=evil"},
		})
		if status != http.StatusOK {
			t.Fatalf("status = %d, want 200", status)
		}
		request := stub.at(0)
		if request.Query.Get("page") != "1" {
			t.Fatalf("page = %q, want 1", request.Query.Get("page"))
		}
		if got := request.Query.Get("platform_name"); got != "tma" {
			t.Fatalf("platform_name = %q, want tma（必须被强制覆盖）", got)
		}
		for _, key := range []string{"userkey", "access_token", "platform_userid", "HN_login_user", "forcelogout", "rsaEncrypt", "uid"} {
			if request.Query.Has(key) {
				t.Fatalf("%s 不得转发：%v", key, request.Query)
			}
		}
		if cookie := request.Header.Get("Cookie"); cookie != "" {
			t.Fatalf("匿名请求不得带 Cookie，实际 %q", cookie)
		}
	})

	t.Run("匿名读接口照常转发但受限流约束", func(t *testing.T) {
		stub := newPHPStub(t)
		allow := token.NewLimiter(2, 60*time.Second, func() time.Time { return stubNow })
		proxy, _ := newStubProxy(t, stub, Dep{Allow: allow})
		request := Req{Service: "article", Action: "alist", Method: http.MethodGet, ClientKey: "ip1"}
		for i := 0; i < 2; i++ {
			if status, _ := proxy.Handle(context.Background(), request); status != http.StatusOK {
				t.Fatalf("第 %d 次 status = %d, want 200", i+1, status)
			}
		}
		status, body := proxy.Handle(context.Background(), request)
		if status != http.StatusTooManyRequests {
			t.Fatalf("第 3 次 status = %d, want 429", status)
		}
		if code := errorCodeOf(t, body); code != "RATE_LIMITED" {
			t.Fatalf("code = %q, want RATE_LIMITED", code)
		}
	})

	t.Run("member 接口：无令牌 401；有令牌才注入凭证；缺凭证提供者 503", func(t *testing.T) {
		whitelist := Whitelist{"waimai:getMemberAddress": {Auth: "member"}}
		stub := newPHPStub(t)
		noProvider, service := newStubProxy(t, stub, Dep{Whitelist: whitelist})
		auth := map[string]string{"authorization": bearer(service, 5)}

		if status, body := noProvider.Handle(context.Background(), Req{Service: "waimai", Action: "getMemberAddress", Method: http.MethodGet}); status != http.StatusUnauthorized {
			t.Fatalf("无令牌 status = %d, want 401（body=%v）", status, body)
		}
		status, body := noProvider.Handle(context.Background(), Req{
			Service: "waimai", Action: "getMemberAddress", Method: http.MethodGet, Headers: auth,
		})
		if status != http.StatusServiceUnavailable {
			t.Fatalf("缺凭证提供者 status = %d, want 503（body=%v）", status, body)
		}
		if code := errorCodeOf(t, body); code != "CREDENTIALS_NOT_CONFIGURED" {
			t.Fatalf("code = %q, want CREDENTIALS_NOT_CONFIGURED", code)
		}

		stub2 := newPHPStub(t)
		seen := make([]int64, 0, 1)
		withProvider, service2 := newStubProxy(t, stub2, Dep{
			Whitelist: whitelist,
			CredentialProvider: func(_ context.Context, memberID int64) (string, error) {
				seen = append(seen, memberID)
				return stubCookie, nil
			},
		})
		status, body = withProvider.Handle(context.Background(), Req{
			Service: "waimai", Action: "getMemberAddress", Method: http.MethodGet,
			Headers: map[string]string{"authorization": bearer(service2, 5)},
		})
		if status != http.StatusOK {
			t.Fatalf("有凭证提供者 status = %d, want 200（body=%v）", status, body)
		}
		if len(seen) != 1 || seen[0] != 5 {
			t.Fatalf("凭证提供者收到的会员 id = %v, want [5]", seen)
		}
		if cookie := stub2.at(0).Header.Get("Cookie"); cookie != stubCookie {
			t.Fatalf("上游 Cookie = %q, want %q", cookie, stubCookie)
		}
	})

	t.Run("幂等：缺 Idempotency-Key 返回 400；重复键返回首次结果且只转发一次", func(t *testing.T) {
		whitelist := Whitelist{"waimai:deal": {Auth: "member", Idempotent: true}}
		stub := newPHPStub(t)
		stub.respond(func(index int, w http.ResponseWriter, _ *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"state":100,"info":{"ordernum":"O` + strconv.Itoa(index) + `"}}`))
		})
		proxy, service := newStubProxy(t, stub, Dep{
			Whitelist:          whitelist,
			CredentialProvider: func(context.Context, int64) (string, error) { return "c=1", nil },
		})
		base := Req{Service: "waimai", Action: "deal", Method: http.MethodPost, Body: map[string]any{"x": "1"}}

		base.Headers = map[string]string{"authorization": bearer(service, 5)}
		if status, body := proxy.Handle(context.Background(), base); status != http.StatusBadRequest {
			t.Fatalf("缺幂等键 status = %d, want 400（body=%v）", status, body)
		}

		base.Headers = map[string]string{"authorization": bearer(service, 5), "idempotency-key": "key-12345678"}
		first := proxy.Execute(context.Background(), base)
		second := proxy.Execute(context.Background(), base)
		if stub.count() != 1 {
			t.Fatalf("同键重复请求只应转发 1 次，实际 %d 次", stub.count())
		}
		if !second.Replayed {
			t.Fatal("第二次必须是回放")
		}
		firstRaw, _ := json.Marshal(first.Body)
		secondRaw, _ := json.Marshal(second.Body)
		if string(firstRaw) != string(secondRaw) {
			t.Fatalf("回放体必须与首次一致：%s vs %s", firstRaw, secondRaw)
		}
	})

	// 任务书点名的高危点（Node 侧由 res.json 的行为隐式保证，没有独立用例）：
	// 代理承诺「原样回写上游字节」，而 Go 的 encoding/json 默认会把 <、>、& 改写成
	// \u003c 之类，并给 Encode 结果补一个结尾换行。两种偏差 JSON 语义都等价，所以
	// 只能比对真实写到 HTTP 上的字节 —— 解码后比结构对它们视而不见。
	t.Run("逐字节透传：< > & 不被转义、结尾不补换行", func(t *testing.T) {
		first, _ := runBytePassthrough(t)
		for _, escaped := range []string{`\u003c`, `\u003e`, `\u0026`} {
			if bytes.Contains(first, []byte(escaped)) {
				t.Fatalf("响应体不得含转义序列 %s，实得 %s", escaped, first)
			}
		}
		if !bytes.Equal(first, []byte(bytePassthroughBody)) {
			t.Fatalf("上游字节未被原样回写：\n got: %s\nwant: %s", first, bytePassthroughBody)
		}
		if bytes.HasSuffix(first, []byte("\n")) {
			t.Fatalf("响应体不得以换行结尾（Node 的 res.json 不补换行），实得 %q", first)
		}
	})

	t.Run("幂等回放体与首次逐字节相同", func(t *testing.T) {
		first, second := runBytePassthrough(t)
		if !bytes.Equal(first, second) {
			t.Fatalf("幂等回放体必须与首次逐字节相同：\n first: %s\nsecond: %s", first, second)
		}
	})

	t.Run("sanitizeParams 丢弃数组、对象及 JSON 容器值（上游对其跳过转义）", func(t *testing.T) {
		got := SanitizeAny(map[string]any{
			"a": "1",
			"b": map[string]any{"$ne": 1},
			"c": []any{"x", "y"},
			"d": []any{map[string]any{}},
			"e": `[{"a":1}]`,
			"f": `[1]`,
			"g": `{"a":1}`,
			"h": "plain [text",
		}, nil)
		want := map[string]string{"a": "1", "h": "plain [text"}
		if len(got) != len(want) {
			t.Fatalf("sanitize 结果 = %v, want %v", got, want)
		}
		for key, value := range want {
			if got[key] != value {
				t.Fatalf("sanitize[%s] = %q, want %q（完整结果 %v）", key, got[key], value, got)
			}
		}
	})

	t.Run("上游异常返回 502 而非抛出", func(t *testing.T) {
		stub := newPHPStub(t)
		stub.respond(func(_ int, w http.ResponseWriter, _ *http.Request) {
			// 上游返回 HTML（前端控制器接管）：解析失败按上游异常处理。
			w.Header().Set("Content-Type", "text/html")
			_, _ = w.Write([]byte("<html>down</html>"))
		})
		proxy, _ := newStubProxy(t, stub, Dep{})
		status, body := proxy.Handle(context.Background(), Req{Service: "article", Action: "type", Method: http.MethodGet})
		if status != http.StatusBadGateway {
			t.Fatalf("status = %d, want 502", status)
		}
		if code := errorCodeOf(t, body); code != "UPSTREAM_UNAVAILABLE" {
			t.Fatalf("code = %q, want UPSTREAM_UNAVAILABLE", code)
		}
	})

	t.Run("idempotent 规则必须配 auth=member，否则构造即失败", func(t *testing.T) {
		service, err := token.NewService(token.Dep{Secret: stubSecret, Env: "canary"})
		if err != nil {
			t.Fatalf("token service: %v", err)
		}
		_, err = New(Dep{
			UpstreamBase: "http://example.invalid/a",
			Tokens:       service,
			Whitelist:    Whitelist{"a:b": {Auth: "anonymous", Idempotent: true}},
		})
		if err == nil {
			t.Fatal("幂等规则未要求登录时必须构造失败")
		}
	})

	t.Run("幂等只缓存 state=100 的响应，失败可用同一键重试", func(t *testing.T) {
		responses := []string{`{"state":200,"info":"busy"}`, `{"state":100,"info":{"ordernum":"O1"}}`}
		stub := newPHPStub(t)
		stub.respond(func(index int, w http.ResponseWriter, _ *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(responses[index-1]))
		})
		whitelist := Whitelist{"waimai:deal": {Auth: "member", Idempotent: true}}
		proxy, service := newStubProxy(t, stub, Dep{
			Whitelist:          whitelist,
			CredentialProvider: func(context.Context, int64) (string, error) { return "c=1", nil },
		})
		request := Req{
			Service: "waimai", Action: "deal", Method: http.MethodPost, Body: map[string]any{},
			Headers: map[string]string{"authorization": bearer(service, 5), "idempotency-key": "retry-key-1234"},
		}
		if first := proxy.Execute(context.Background(), request); bodyJSON(t, first.Body)["state"] != float64(200) {
			t.Fatalf("首次响应 state = %v, want 200（未成功的响应必须原样回给调用方）", bodyJSON(t, first.Body)["state"])
		}
		if second := proxy.Execute(context.Background(), request); bodyJSON(t, second.Body)["state"] != float64(100) {
			t.Fatalf("重试响应 state = %v, want 100（失败已释放占位）", bodyJSON(t, second.Body)["state"])
		}
		third := proxy.Execute(context.Background(), request)
		if !third.Replayed {
			t.Fatal("第三次必须是回放")
		}
		if stub.count() != 2 {
			t.Fatalf("上游应被调用 2 次（失败 + 成功），实际 %d 次", stub.count())
		}
	})

	t.Run("上游请求带超时信号", func(t *testing.T) {
		const timeout = 1500 * time.Millisecond
		stub := newPHPStub(t)
		// 上游看到的 server 侧 context 不带客户端 deadline，所以必须在出站 RoundTripper
		// 上采样 —— 这是 Node 的 `init.signal instanceof AbortSignal` 的直接等价物。
		var (
			hasDeadline bool
			remaining   time.Duration
		)
		client := &http.Client{Transport: roundTripFunc(func(req *http.Request) (*http.Response, error) {
			if deadline, ok := req.Context().Deadline(); ok {
				hasDeadline = true
				remaining = time.Until(deadline)
			}
			return http.DefaultTransport.RoundTrip(req)
		})}
		proxy, _ := newStubProxy(t, stub, Dep{Timeout: timeout, HTTPClient: client})
		if status, _ := proxy.Handle(context.Background(), Req{Service: "article", Action: "type", Method: http.MethodGet}); status != http.StatusOK {
			t.Fatalf("status = %d, want 200", status)
		}
		if !hasDeadline {
			t.Fatal("上游请求必须带超时截止时间")
		}
		if remaining <= 0 || remaining > timeout {
			t.Fatalf("上游请求剩余时限 = %v，必须 >0 且 ≤ %v", remaining, timeout)
		}
		if stub.count() != 1 {
			t.Fatalf("上游应被调用 1 次，实际 %d 次", stub.count())
		}
	})

	t.Run("规则级 params 白名单：未列出的参数（含 userid/store）不会透传，GET 与 POST 均适用", func(t *testing.T) {
		whitelist := Whitelist{"waimai:order": {Auth: "member", Params: []string{"page", "pageSize", "state"}}}
		stub := newPHPStub(t)
		proxy, service := newStubProxy(t, stub, Dep{
			Whitelist:          whitelist,
			CredentialProvider: func(context.Context, int64) (string, error) { return "c=1", nil },
		})
		headers := map[string]string{"authorization": bearer(service, 5)}

		if status, body := proxy.Handle(context.Background(), Req{
			Service: "waimai", Action: "order", Method: http.MethodGet, Headers: headers,
			Query: map[string]string{"page": "1", "userid": "9", "store": "3", "state": "1"},
		}); status != http.StatusOK {
			t.Fatalf("GET status = %d, want 200（body=%v）", status, body)
		}
		keys := make([]string, 0, len(stub.at(0).Query))
		for key := range stub.at(0).Query {
			keys = append(keys, key)
		}
		sort.Strings(keys)
		if strings.Join(keys, ",") != "action,page,platform_name,service,state" {
			t.Fatalf("GET 转发参数 = %v, want [action page platform_name service state]", keys)
		}

		if status, body := proxy.Handle(context.Background(), Req{
			Service: "waimai", Action: "order", Method: http.MethodPost, Headers: headers,
			Body: map[string]any{"page": "2", "userid": "9"},
		}); status != http.StatusOK {
			t.Fatalf("POST status = %d, want 200（body=%v）", status, body)
		}
		form := stub.at(1).Form
		if form.Has("userid") {
			t.Fatalf("POST 表单不得带 userid：%v", form)
		}
		if form.Get("page") != "2" {
			t.Fatalf("POST 表单 page = %q, want 2", form.Get("page"))
		}
	})

	// ── 货到付款收口（2026-10「下单后订单被 cron 判超时取消」事故回归）──────────
	t.Run("货到付款收口：deal 返回 delivery|<ordernum> 时补调 pay，且只对客户端暴露订单号", func(t *testing.T) {
		stub := newPHPStub(t)
		stub.respond(func(index int, w http.ResponseWriter, _ *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			if index == 1 {
				_, _ = w.Write([]byte(`{"state":100,"info":"delivery|ORD1"}`))
				return
			}
			_, _ = w.Write([]byte(`{"state":100,"info":"http://x/orderdetail"}`))
		})
		whitelist := Whitelist{"waimai:deal": {Auth: "member", Idempotent: true}}
		proxy, service := newStubProxy(t, stub, Dep{
			Whitelist:          whitelist,
			CredentialProvider: func(context.Context, int64) (string, error) { return "c=1", nil },
		})
		request := Req{
			Service: "waimai", Action: "deal", Method: http.MethodPost, Body: map[string]any{},
			Headers: map[string]string{"authorization": bearer(service, 5), "idempotency-key": "cod-key-1234"},
		}
		result := proxy.Execute(context.Background(), request)
		if result.Status != http.StatusOK {
			t.Fatalf("status = %d, want 200", result.Status)
		}
		if info := bodyJSON(t, result.Body)["info"]; info != "ORD1" {
			t.Fatalf("body.info = %v，前端不应看到 \"delivery|\" 前缀", info)
		}
		if stub.count() != 2 {
			t.Fatalf("应补一次 pay 调用，实际上游调用 %d 次", stub.count())
		}
		settle := stub.at(1)
		if settle.Query.Get("action") != "pay" {
			t.Fatalf("收口动作 = %q, want pay", settle.Query.Get("action"))
		}
		if settle.Form.Get("paytype") != "delivery" {
			t.Fatalf("paytype = %q, want delivery", settle.Form.Get("paytype"))
		}
		if settle.Form.Get("ordernum") != "ORD1" {
			t.Fatalf("ordernum = %q, want ORD1", settle.Form.Get("ordernum"))
		}
		// pay() 在 paytype=delivery 且 !isMobile() 时 header('location') 后 die，必须带移动端 UA。
		if userAgent := settle.Header.Get("User-Agent"); !strings.Contains(userAgent, "Mobile") {
			t.Fatalf("收口请求 UA = %q，必须伪装移动端", userAgent)
		}

		// 幂等重放：返回的也必须是已归一化的订单号，且不再转发。
		replay := proxy.Execute(context.Background(), request)
		if !replay.Replayed {
			t.Fatal("同键重放必须标记 Replayed")
		}
		if info := bodyJSON(t, replay.Body)["info"]; info != "ORD1" {
			t.Fatalf("重放 body.info = %v, want ORD1", info)
		}
		if stub.count() != 2 {
			t.Fatalf("重放不得再次转发，实际上游调用 %d 次", stub.count())
		}
	})

	t.Run("货到付款收口失败不阻塞下单：仍返回订单号（订单已创建）", func(t *testing.T) {
		stub := newPHPStub(t)
		stub.respond(func(index int, w http.ResponseWriter, _ *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			if index == 1 {
				_, _ = w.Write([]byte(`{"state":100,"info":"delivery|ORD2"}`))
				return
			}
			_, _ = w.Write([]byte(`{"state":200,"info":"订单不存在或已支付"}`))
		})
		var warned []string
		whitelist := Whitelist{"waimai:deal": {Auth: "member", Idempotent: true}}
		proxy, service := newStubProxy(t, stub, Dep{
			Whitelist:          whitelist,
			CredentialProvider: func(context.Context, int64) (string, error) { return "c=1", nil },
			Warn: func(value any) {
				line, _ := json.Marshal(value)
				warned = append(warned, string(line))
			},
		})
		result := proxy.Execute(context.Background(), Req{
			Service: "waimai", Action: "deal", Method: http.MethodPost, Body: map[string]any{},
			Headers: map[string]string{"authorization": bearer(service, 5), "idempotency-key": "cod-key-5678"},
		})
		if result.Status != http.StatusOK {
			t.Fatalf("status = %d, want 200", result.Status)
		}
		if info := bodyJSON(t, result.Body)["info"]; info != "ORD2" {
			t.Fatalf("body.info = %v, want ORD2（订单已创建，必须把订单号给前端）", info)
		}
		if !strings.Contains(strings.Join(warned, "\n"), "cod_settle_failed") {
			t.Fatalf("收口失败必须留痕，实际告警：%v", warned)
		}
	})

	t.Run("非货到付款返回（在线支付表单）不触发收口", func(t *testing.T) {
		stub := newPHPStub(t)
		stub.respond(func(_ int, w http.ResponseWriter, _ *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"state":100,"info":{"ordernum":"O1","orderurl":"u"}}`))
		})
		whitelist := Whitelist{"waimai:deal": {Auth: "member", Idempotent: true}}
		proxy, service := newStubProxy(t, stub, Dep{
			Whitelist:          whitelist,
			CredentialProvider: func(context.Context, int64) (string, error) { return "c=1", nil },
		})
		result := proxy.Execute(context.Background(), Req{
			Service: "waimai", Action: "deal", Method: http.MethodPost, Body: map[string]any{},
			Headers: map[string]string{"authorization": bearer(service, 5), "idempotency-key": "cod-key-9999"},
		})
		info, ok := bodyJSON(t, result.Body)["info"].(map[string]any)
		if !ok {
			t.Fatalf("body.info 应为对象，实际 %T", bodyJSON(t, result.Body)["info"])
		}
		if info["ordernum"] != "O1" || info["orderurl"] != "u" {
			t.Fatalf("在线支付表单应原样透传，实际 %v", info)
		}
		if stub.count() != 1 {
			t.Fatalf("非货到付款不得补调 pay，实际上游调用 %d 次", stub.count())
		}
	})
}

// roundTripFunc 让测试在出站请求真正发出前采样它（Node 的 fetch init 参数等价物）。
type roundTripFunc func(*http.Request) (*http.Response, error)

func (f roundTripFunc) RoundTrip(request *http.Request) (*http.Response, error) { return f(request) }

// bytePassthroughBody 是刻意带 <、>、& 的上游响应：这三个字符是 encoding/json
// 默认会转义、而 Node 的 res.json 不会转义的全部差异面。
const bytePassthroughBody = `{"state":100,"info":{"title":"a<b>c&d","ordernum":"O1"}}`

// runBytePassthrough 跑一次「同一幂等键的两次请求」，返回两次真实写到 HTTP 上的字节。
//
// 断言必须落在字节上：fbproxy.WriteJSON 关掉了 HTML 转义并裁掉结尾换行，
// 解码成结构再比对会把这两处行为差异全部掩盖掉。
func runBytePassthrough(t *testing.T) (first, second []byte) {
	t.Helper()
	stub := newPHPStub(t)
	stub.respond(func(_ int, w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(bytePassthroughBody))
	})
	proxy, service := newStubProxy(t, stub, Dep{
		Whitelist:          Whitelist{"waimai:deal": {Auth: "member", Idempotent: true}},
		CredentialProvider: func(context.Context, int64) (string, error) { return "c=1", nil },
	})
	request := Req{
		Service: "waimai", Action: "deal", Method: http.MethodPost, Body: map[string]any{},
		Headers: map[string]string{"authorization": bearer(service, 5), "idempotency-key": "bytes-key-1234"},
	}
	write := func(result Result) []byte {
		recorder := httptest.NewRecorder()
		WriteJSON(recorder, result.Status, result.Body)
		return recorder.Body.Bytes()
	}
	first = write(proxy.Execute(context.Background(), request))
	second = write(proxy.Execute(context.Background(), request))
	if stub.count() != 1 {
		t.Fatalf("同键只应转发 1 次，实际 %d 次", stub.count())
	}
	return first, second
}
