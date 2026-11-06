package fbproxy

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/token"
)

// 逐条翻译自 services/api/test/fb-proxy-ownership.test.js 的 19 条 BEHAVIOR 用例
// （原文件第 15/16 条是对 JS/PHP 源码的静态断言，不在 Go 重写范围，故不翻）。
//
// Node 用一个「行为等价的火鸟替身」按注入的 Cookie 识别会员、按 uid 过滤，并模拟
// 两个真实后门（courier Cookie 旁路、userid 参数透传）。Go 侧照做，另把每次上游请求的
// action/参数/Cookie/请求头全记下来 —— 「预检是否真的拦住了写操作」靠这份记录断言。

const (
	ownerMemberA = 100
	ownerMemberB = 200
	// ownerValidOC 是能通过 ValidateOrderContent 的最小订单内容。
	ownerValidOC = `[{"id":"5","count":1}]`
)

// ownerRequest 是一次上游请求的快照。
type ownerRequest struct {
	Action string
	Params map[string]string
	Cookie string
	Header http.Header
}

// fakeFirebird 是「假火鸟 ajax.php」：按 uid 收口，并留出两个真实后门。
type fakeFirebird struct {
	mu        sync.Mutex
	addresses map[string]struct {
		uid    int64
		person string
	}
	orders map[string]struct {
		uid      int64
		ordernum string
		state    int
		path     string
	}
	requests  []ownerRequest
	mutations []string
}

func newFakeFirebird() *fakeFirebird {
	fake := &fakeFirebird{
		addresses: map[string]struct {
			uid    int64
			person string
		}{
			"1": {uid: ownerMemberA, person: "A"},
			"2": {uid: ownerMemberB, person: "B-secret"},
		},
		orders: map[string]struct {
			uid      int64
			ordernum string
			state    int
			path     string
		}{
			"10": {uid: ownerMemberA, ordernum: "OA", state: 0, path: "120.1,14.1;120.2,14.2"},
			"20": {uid: ownerMemberB, ordernum: "OB-secret", state: 0, path: "SECRET_PATH"},
		},
	}
	return fake
}

var loginUserRe = regexp.MustCompile(`login_user=(\d+)`)

// notLogin 是上游未登录时的固定回复。
func notLogin() map[string]any {
	return map[string]any{"state": 200, "info": "未登录或登录超时！"}
}

// wrapReply 复刻 handlers.class.php getHandle 的包装语义。
func wrapReply(reply map[string]any) map[string]any {
	state, hasState := reply["state"]
	_, hasInfo := reply["info"]
	if hasState {
		if code, ok := state.(int); ok && (code == 200 || code == 101) {
			return map[string]any{"state": 101, "info": reply["info"]}
		}
	}
	if hasState && hasInfo {
		return reply
	}
	return map[string]any{"state": 100, "info": reply}
}

// orderRef 返回订单行的可读视图（避免在多处重复写匿名结构体）。
func (f *fakeFirebird) orderState(id string) (int, bool) {
	f.mu.Lock()
	defer f.mu.Unlock()
	order, exists := f.orders[id]
	return order.state, exists
}

func (f *fakeFirebird) addressPerson(id string) (string, bool) {
	f.mu.Lock()
	defer f.mu.Unlock()
	address, exists := f.addresses[id]
	return address.person, exists
}

func (f *fakeFirebird) requestActions() []string {
	f.mu.Lock()
	defer f.mu.Unlock()
	out := make([]string, 0, len(f.requests))
	for _, request := range f.requests {
		out = append(out, request.Action)
	}
	return out
}

func (f *fakeFirebird) mutationList() []string {
	f.mu.Lock()
	defer f.mu.Unlock()
	out := make([]string, 0, len(f.mutations))
	out = append(out, f.mutations...)
	return out
}

func (f *fakeFirebird) firstRequest() ownerRequest {
	f.mu.Lock()
	defer f.mu.Unlock()
	if len(f.requests) == 0 {
		return ownerRequest{}
	}
	return f.requests[0]
}

func (f *fakeFirebird) requestCount() int {
	f.mu.Lock()
	defer f.mu.Unlock()
	return len(f.requests)
}

// serve 是假火鸟的 HTTP 入口。
func (f *fakeFirebird) serve(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, "bad form", http.StatusBadRequest)
		return
	}
	params := map[string]string{}
	for key := range r.URL.Query() {
		params[key] = r.URL.Query().Get(key)
	}
	for key := range r.PostForm {
		params[key] = r.PostForm.Get(key)
	}
	cookie := r.Header.Get("Cookie")

	f.mu.Lock()
	f.requests = append(f.requests, ownerRequest{
		Action: params["action"],
		Params: params,
		Cookie: cookie,
		Header: r.Header.Clone(),
	})
	f.mu.Unlock()

	var uid int64
	loggedIn := false
	if matched := loginUserRe.FindStringSubmatch(cookie); matched != nil {
		parsed, err := strconv.ParseInt(matched[1], 10, 64)
		if err == nil {
			uid, loggedIn = parsed, true
		}
	}
	// 旁路：骑手 Cookie 可匿名读订单详情。
	courier := regexp.MustCompile(`(^|;\s*)courier=`).MatchString(cookie)

	// getCourierLocation 用 orderid，其余用 id。
	idText := params["id"]
	if idText == "" {
		idText = params["orderid"]
	}

	var reply map[string]any
	switch params["action"] {
	case "getAddressDetail":
		f.mu.Lock()
		address, exists := f.addresses[idText]
		f.mu.Unlock()
		switch {
		case !loggedIn:
			reply = notLogin()
		case exists && address.uid == uid:
			reply = map[string]any{"state": 100, "info": address}
		default:
			reply = map[string]any{"state": 200, "info": "信息不存在"}
		}
	case "operAddress":
		if !loggedIn {
			reply = notLogin()
			break
		}
		f.mu.Lock()
		address, exists := f.addresses[idText]
		switch {
		case idText != "" && exists && address.uid == uid:
			f.mutations = append(f.mutations, "edit:"+idText)
		case idText != "":
			// 真实 handler：UPDATE ... AND uid 命中 0 行仍返回保存成功。
			f.mutations = append(f.mutations, "edit-noop:"+idText)
		}
		f.mu.Unlock()
		reply = map[string]any{"state": 100, "info": "保存成功"}
	case "delAddress":
		if !loggedIn {
			reply = notLogin()
			break
		}
		f.mu.Lock()
		address, exists := f.addresses[idText]
		if exists && address.uid == uid {
			f.mutations = append(f.mutations, "del:"+idText)
		} else {
			f.mutations = append(f.mutations, "del-noop:"+idText)
		}
		f.mu.Unlock()
		reply = map[string]any{"state": 100, "info": "删除成功"}
	case "getMemberAddress":
		if !loggedIn {
			reply = notLogin()
			break
		}
		f.mu.Lock()
		list := make([]any, 0, len(f.addresses))
		for _, address := range f.addresses {
			if address.uid == uid {
				list = append(list, address)
			}
		}
		f.mu.Unlock()
		reply = map[string]any{"state": 100, "info": map[string]any{"list": list}}
	case "order":
		if !loggedIn {
			reply = notLogin()
			break
		}
		who := uid
		if value := params["userid"]; value != "" {
			// 后门：未剥离时 userid 可越权。
			if parsed, err := strconv.ParseInt(value, 10, 64); err == nil {
				who = parsed
			}
		}
		f.mu.Lock()
		list := make([]any, 0, len(f.orders))
		for _, order := range f.orders {
			if order.uid == who {
				list = append(list, order)
			}
		}
		f.mu.Unlock()
		reply = map[string]any{"state": 100, "info": map[string]any{"list": list}}
	case "orderDetail":
		if !loggedIn && !courier {
			reply = map[string]any{"state": 200, "info": "请先登录！"}
			break
		}
		f.mu.Lock()
		order, exists := f.orders[idText]
		f.mu.Unlock()
		if exists && (courier || order.uid == uid) {
			reply = map[string]any{"state": 100, "info": order}
		} else {
			reply = map[string]any{"state": 200, "info": "订单不存在"}
		}
	case "getCourierLocation":
		// 真实 handler：SELECT peisongpath WHERE id = $id —— 不校验登录、不校验归属。
		f.mu.Lock()
		order, exists := f.orders[idText]
		f.mu.Unlock()
		path := ""
		if exists {
			path = order.path
		}
		reply = map[string]any{"state": 100, "info": path}
	case "cancelOrder":
		if !loggedIn {
			reply = map[string]any{"state": 200, "info": "登录超时，请重新登录！"}
			break
		}
		f.mu.Lock()
		order, exists := f.orders[idText]
		if exists && order.uid == uid {
			order.state = 6
			f.orders[idText] = order
			f.mutations = append(f.mutations, "cancel:"+idText)
			f.mu.Unlock()
			reply = map[string]any{"state": 100, "info": "取消成功"}
			break
		}
		f.mu.Unlock()
		reply = map[string]any{"state": 200, "info": "订单不存在"}
	case "deal":
		if !loggedIn {
			reply = notLogin()
			break
		}
		f.mu.Lock()
		address, exists := f.addresses[params["address"]]
		owned := exists && address.uid == uid
		if owned {
			f.mutations = append(f.mutations, "deal:"+params["address"])
		}
		f.mu.Unlock()
		if !owned {
			reply = map[string]any{"state": 200, "info": "地址不存在"}
			break
		}
		reply = map[string]any{"state": 100, "info": map[string]any{"ordernum": "NEW1"}}
	default:
		reply = map[string]any{"state": 200, "info": "unknown"}
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(wrapReply(reply))
}

// ownerSetup 是一套「假火鸟 + 代理 + 会员 A 的令牌」。
type ownerSetup struct {
	fake  *fakeFirebird
	proxy *Proxy
	token *token.Service
}

func newOwnerSetup(t *testing.T, dep Dep) *ownerSetup {
	t.Helper()
	fake := newFakeFirebird()
	server := httptest.NewServer(http.HandlerFunc(fake.serve))
	t.Cleanup(server.Close)

	service, err := token.NewService(token.Dep{Secret: stubSecret, Env: "canary", Now: func() time.Time { return stubNow }})
	if err != nil {
		t.Fatalf("token service: %v", err)
	}
	dep.Tokens = service
	dep.UpstreamBase = server.URL + "/ajax.php"
	if dep.CredentialProvider == nil {
		dep.CredentialProvider = func(_ context.Context, memberID int64) (string, error) {
			return "login_user=" + strconv.FormatInt(memberID, 10), nil
		}
	}
	if dep.Now == nil {
		dep.Now = func() time.Time { return stubNow }
	}
	proxy, err := New(dep)
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	return &ownerSetup{fake: fake, proxy: proxy, token: service}
}

// call 以会员 A 的身份发起一次代理调用（默认 GET，与 Node 的 call 一致）。
func (s *ownerSetup) call(t *testing.T, action string, request Req) (int, any) {
	t.Helper()
	request.Service = "waimai"
	request.Action = action
	if request.Method == "" {
		request.Method = http.MethodGet
	}
	if request.Headers == nil {
		request.Headers = map[string]string{}
	}
	if _, exists := request.Headers["authorization"]; !exists {
		request.Headers["authorization"] = bearer(s.token, ownerMemberA)
	}
	return s.proxy.Handle(context.Background(), request)
}

// leaks 判断响应体里是否出现了不该出现的秘密值。
func leaks(body any, secret string) bool {
	raw, err := json.Marshal(body)
	if err != nil {
		return false
	}
	return strings.Contains(string(raw), secret)
}

// TestFBProxyOwnership 对应 fb-proxy-ownership.test.js 的 19 条 BEHAVIOR 用例。
func TestFBProxyOwnership(t *testing.T) {
	t.Run("orderDetail：A 查 B 的订单 → 404，不含数据", func(t *testing.T) {
		setup := newOwnerSetup(t, Dep{})
		status, body := setup.call(t, "orderDetail", Req{Query: map[string]string{"id": "20"}})
		if status != http.StatusNotFound {
			t.Fatalf("status = %d, want 404（body=%v）", status, body)
		}
		if leaks(body, "OB-secret") {
			t.Fatalf("404 响应泄露了 B 的订单号：%v", body)
		}
		// 对照：自己的订单可读。
		if status, body := setup.call(t, "orderDetail", Req{Query: map[string]string{"id": "10"}}); status != http.StatusOK {
			t.Fatalf("自己的订单 status = %d, want 200（body=%v）", status, body)
		}
	})

	t.Run("cancelOrder：A 取消 B 的订单 → 404，订单状态不变", func(t *testing.T) {
		setup := newOwnerSetup(t, Dep{})
		status, body := setup.call(t, "cancelOrder", Req{Query: map[string]string{"id": "20"}})
		if status != http.StatusNotFound {
			t.Fatalf("status = %d, want 404（body=%v）", status, body)
		}
		if state, _ := setup.fake.orderState("20"); state != 0 {
			t.Fatalf("B 的订单状态 = %d, want 0（不得被取消）", state)
		}
		if mutations := setup.fake.mutationList(); len(mutations) != 0 {
			t.Fatalf("不得产生任何写入，实际 %v", mutations)
		}
	})

	t.Run("delAddress：A 删除 B 的地址 → 404，预检拦截，上游不收到删除请求", func(t *testing.T) {
		setup := newOwnerSetup(t, Dep{})
		status, body := setup.call(t, "delAddress", Req{Query: map[string]string{"id": "2"}})
		if status != http.StatusNotFound {
			t.Fatalf("status = %d, want 404（body=%v）", status, body)
		}
		for _, action := range setup.fake.requestActions() {
			if action == "delAddress" {
				t.Fatalf("预检不通过时上游不得收到删除请求，实际动作序列 %v", setup.fake.requestActions())
			}
		}
		if person, exists := setup.fake.addressPerson("2"); !exists || person != "B-secret" {
			t.Fatalf("B 的地址必须仍存在，实际 person=%q exists=%v", person, exists)
		}
	})

	t.Run("operAddress：A 编辑 B 的地址 → 404，预检拦截，不产生任何写", func(t *testing.T) {
		setup := newOwnerSetup(t, Dep{})
		status, body := setup.call(t, "operAddress", Req{
			Method: http.MethodPost,
			Body:   map[string]any{"id": "2", "person": "hacked", "tel": "1", "address": "x"},
		})
		if status != http.StatusNotFound {
			t.Fatalf("status = %d, want 404（body=%v）", status, body)
		}
		if mutations := setup.fake.mutationList(); len(mutations) != 0 {
			t.Fatalf("不得产生任何写入，实际 %v", mutations)
		}
		if person, _ := setup.fake.addressPerson("2"); person != "B-secret" {
			t.Fatalf("B 的地址被改写为 %q", person)
		}
	})

	t.Run("getMemberAddress：携带 B 的 id/userid/uid 参数仍只返回 A 的地址（参数不透传）", func(t *testing.T) {
		setup := newOwnerSetup(t, Dep{})
		status, body := setup.call(t, "getMemberAddress", Req{
			Query: map[string]string{"id": "2", "userid": strconv.Itoa(ownerMemberB), "uid": strconv.Itoa(ownerMemberB), "cityid": "1"},
		})
		if status != http.StatusOK {
			t.Fatalf("status = %d, want 200（body=%v）", status, body)
		}
		if leaks(body, "B-secret") {
			t.Fatalf("响应泄露了 B 的地址：%v", body)
		}
		sent := setup.fake.firstRequest().Params
		for _, key := range []string{"userid", "uid", "id"} {
			if value, exists := sent[key]; exists {
				t.Fatalf("上游收到了 %s=%q（身份参数必须被剥离）", key, value)
			}
		}
	})

	t.Run("交叉传输面：id 改走另一侧通道（POST body / query），A 访问 B 的对象仍 404 且无写入", func(t *testing.T) {
		cases := []struct {
			action  string
			request Req
		}{
			{"orderDetail", Req{Method: http.MethodPost, Body: map[string]any{"id": "20"}}},
			{"cancelOrder", Req{Method: http.MethodPost, Body: map[string]any{"id": "20"}}},
			{"delAddress", Req{Method: http.MethodPost, Body: map[string]any{"id": "2"}}},
			{"operAddress", Req{Query: map[string]string{"id": "2", "person": "hacked", "tel": "1", "address": "x"}}},
		}
		for _, item := range cases {
			setup := newOwnerSetup(t, Dep{})
			status, body := setup.call(t, item.action, item.request)
			if status != http.StatusNotFound {
				t.Fatalf("%s 换通道后 status = %d, want 404（body=%v）", item.action, status, body)
			}
			if leaks(body, "OB-secret") || leaks(body, "B-secret") {
				t.Fatalf("%s 泄露了 B 的数据：%v", item.action, body)
			}
			if mutations := setup.fake.mutationList(); len(mutations) != 0 {
				t.Fatalf("%s 产生了写入：%v", item.action, mutations)
			}
			if state, _ := setup.fake.orderState("20"); state != 0 {
				t.Fatalf("%s 改动了 B 的订单状态", item.action)
			}
			if person, _ := setup.fake.addressPerson("2"); person != "B-secret" {
				t.Fatalf("%s 改写了 B 的地址", item.action)
			}
		}
	})

	t.Run("预检跳过路径的兜底：id 被净化丢弃（数组 / 大小写变体）时绝不触及 B 的行", func(t *testing.T) {
		// Node 的「数组形态 id」在 Go 侧由 Req.Query/Req.Body 的 map[string]string 静态类型排除
		// （非字符串值在 SanitizeAny 里本来就会被丢弃），可构造的分支是大小写变体。
		cases := []struct {
			action  string
			request Req
		}{
			{"delAddress", Req{Query: map[string]string{"ID": "2"}}},
			{"orderDetail", Req{Query: map[string]string{"ID": "20"}}},
			{"cancelOrder", Req{Query: map[string]string{"ID": "20"}}},
			{"operAddress", Req{Method: http.MethodPost, Body: map[string]any{"ID": "2", "person": "hacked", "tel": "1", "address": "x"}}},
		}
		for _, item := range cases {
			setup := newOwnerSetup(t, Dep{})
			_, body := setup.call(t, item.action, item.request)
			if leaks(body, "OB-secret") || leaks(body, "B-secret") {
				t.Fatalf("%s 泄露了 B 的数据：%v", item.action, body)
			}
			if _, exists := setup.fake.addressPerson("2"); !exists {
				t.Fatalf("%s 删掉了 B 的地址", item.action)
			}
			if person, _ := setup.fake.addressPerson("2"); person != "B-secret" {
				t.Fatalf("%s 改写了 B 的地址", item.action)
			}
			if state, _ := setup.fake.orderState("20"); state != 0 {
				t.Fatalf("%s 取消了 B 的订单", item.action)
			}
			for _, request := range setup.fake.requests {
				if request.Params["id"] == "2" || request.Params["id"] == "20" {
					t.Fatalf("%s 上游收到了 B 的 id=%s（id 丢失只能退化为不带 id）", item.action, request.Params["id"])
				}
			}
		}
	})

	t.Run("order：携带 userid=B / store 参数仍只返回 A 的订单", func(t *testing.T) {
		setup := newOwnerSetup(t, Dep{})
		status, body := setup.call(t, "order", Req{
			Query: map[string]string{"userid": strconv.Itoa(ownerMemberB), "store": "1", "page": "1"},
		})
		if status != http.StatusOK {
			t.Fatalf("status = %d, want 200（body=%v）", status, body)
		}
		if leaks(body, "OB-secret") {
			t.Fatalf("响应泄露了 B 的订单：%v", body)
		}
		sent := setup.fake.firstRequest().Params
		if value, exists := sent["userid"]; exists {
			t.Fatalf("上游收到了 userid=%q", value)
		}
		if value, exists := sent["store"]; exists {
			t.Fatalf("上游收到了 store=%q", value)
		}
	})

	t.Run("deal：使用 B 的地址 ID 下单 → 404，不创建订单；价格类参数不透传", func(t *testing.T) {
		setup := newOwnerSetup(t, Dep{})
		base := map[string]string{"authorization": bearer(setup.token, ownerMemberA), "idempotency-key": "key-attack-0001"}
		status, body := setup.proxy.Handle(context.Background(), Req{
			Service: "waimai", Action: "deal", Method: http.MethodPost, Headers: base,
			Body: map[string]any{
				"shop": "1", "address": "2", "order_content": ownerValidOC,
				"tprice": "0", "quanid": "9", "usePinput": "1", "peerpay": "1",
			},
		})
		if status != http.StatusNotFound {
			t.Fatalf("status = %d, want 404（body=%v）", status, body)
		}
		if mutations := setup.fake.mutationList(); len(mutations) != 0 {
			t.Fatalf("不得创建订单，实际写入 %v", mutations)
		}
		sent := setup.fake.firstRequest().Params
		for _, key := range []string{"tprice", "quanid", "usePinput", "peerpay"} {
			if value, exists := sent[key]; exists {
				t.Fatalf("价格类参数 %s=%q 不得透传", key, value)
			}
		}

		// 失败不占位：同一幂等键改用自己的地址可成功。
		status, body = setup.proxy.Handle(context.Background(), Req{
			Service: "waimai", Action: "deal", Method: http.MethodPost, Headers: base,
			Body: map[string]any{"shop": "1", "address": "1", "order_content": ownerValidOC},
		})
		if status != http.StatusOK {
			t.Fatalf("改用自己的地址 status = %d, want 200（body=%v）", status, body)
		}
		if mutations := setup.fake.mutationList(); len(mutations) != 1 || mutations[0] != "deal:1" {
			t.Fatalf("写入记录 = %v, want [deal:1]", mutations)
		}
	})

	t.Run("getCourierLocation：A 查 B 的轨迹 → 404，不含轨迹数据", func(t *testing.T) {
		setup := newOwnerSetup(t, Dep{})
		status, body := setup.call(t, "getCourierLocation", Req{Query: map[string]string{"orderid": "20"}})
		if status != http.StatusNotFound {
			t.Fatalf("status = %d, want 404（body=%v）", status, body)
		}
		if leaks(body, "SECRET_PATH") {
			t.Fatalf("404 响应泄露了 B 的轨迹：%v", body)
		}
	})

	t.Run("getCourierLocation：查自己的订单可读轨迹；不存在的订单号同样 404", func(t *testing.T) {
		setup := newOwnerSetup(t, Dep{})
		status, body := setup.call(t, "getCourierLocation", Req{Query: map[string]string{"orderid": "10"}})
		if status != http.StatusOK {
			t.Fatalf("status = %d, want 200（body=%v）", status, body)
		}
		decoded := bodyJSON(t, body)
		if decoded["info"] != "120.1,14.1;120.2,14.2" {
			t.Fatalf("info = %v, want 轨迹原文", decoded["info"])
		}
		// 预检一次 + 正式一次。
		if actions := setup.fake.requestActions(); strings.Join(actions, ",") != "orderDetail,getCourierLocation" {
			t.Fatalf("上游动作序列 = %v, want [orderDetail getCourierLocation]", actions)
		}

		missing, _ := setup.call(t, "getCourierLocation", Req{Query: map[string]string{"orderid": "999"}})
		if missing != http.StatusNotFound {
			t.Fatalf("不存在的订单号 status = %d, want 404", missing)
		}
	})

	t.Run("getCourierLocation：预检不通过就不转发（上游不会被调用第二次）", func(t *testing.T) {
		setup := newOwnerSetup(t, Dep{})
		_, _ = setup.call(t, "getCourierLocation", Req{Query: map[string]string{"orderid": "20"}})
		if actions := setup.fake.requestActions(); strings.Join(actions, ",") != "orderDetail" {
			t.Fatalf("上游动作序列 = %v, want 仅 [orderDetail]", actions)
		}
	})

	t.Run("getCourierLocation：orderid 之外的参数被丢弃，伪造 uid 无效", func(t *testing.T) {
		setup := newOwnerSetup(t, Dep{})
		_, _ = setup.call(t, "getCourierLocation", Req{
			Query: map[string]string{"orderid": "10", "uid": "200", "userid": "200"},
		})
		var hit ownerRequest
		found := false
		for _, request := range setup.fake.requests {
			if request.Action == "getCourierLocation" {
				hit, found = request, true
			}
		}
		if !found {
			t.Fatalf("上游未收到 getCourierLocation，动作序列 %v", setup.fake.requestActions())
		}
		if hit.Params["orderid"] != "10" {
			t.Fatalf("orderid = %q, want 10", hit.Params["orderid"])
		}
		for _, key := range []string{"uid", "userid"} {
			if value, exists := hit.Params[key]; exists {
				t.Fatalf("%s=%q 必须被剥离", key, value)
			}
		}
	})

	t.Run("orderDetail 骑手旁路：客户端 Cookie/courier 参数不会被转发，匿名路径拿不到数据", func(t *testing.T) {
		setup := newOwnerSetup(t, Dep{})
		// 1) 匿名（无令牌）：在代理层即 401，根本不触达上游。
		status, _ := setup.proxy.Handle(context.Background(), Req{
			Service: "waimai", Action: "orderDetail", Method: http.MethodGet,
			Query:   map[string]string{"id": "20", "courier": "1"},
			Headers: map[string]string{"cookie": "courier=evil"},
		})
		if status != http.StatusUnauthorized {
			t.Fatalf("匿名 status = %d, want 401", status)
		}
		if count := setup.fake.requestCount(); count != 0 {
			t.Fatalf("匿名请求不得触达上游，实际 %d 次", count)
		}

		// 2) 带令牌但夹带骑手 Cookie / 参数：上游只会看到服务端注入的会员凭证。
		status, body := setup.proxy.Handle(context.Background(), Req{
			Service: "waimai", Action: "orderDetail", Method: http.MethodGet,
			Query: map[string]string{"id": "20", "courier": "1", "HN_courier": "x"},
			Headers: map[string]string{
				"authorization": bearer(setup.token, ownerMemberA),
				"cookie":        "courier=evil; login_user=200",
			},
		})
		if status != http.StatusNotFound {
			t.Fatalf("status = %d, want 404（body=%v）", status, body)
		}
		if leaks(body, "OB-secret") {
			t.Fatalf("响应泄露了 B 的订单：%v", body)
		}
		upstream := setup.fake.requests[setup.fake.requestCount()-1]
		if upstream.Cookie != "login_user=100" {
			t.Fatalf("上游 Cookie = %q，只允许服务端注入的 login_user=100", upstream.Cookie)
		}
		if value, exists := upstream.Params["courier"]; exists {
			t.Fatalf("courier=%q 不得转发（骑手旁路参数）", value)
		}
		if value, exists := upstream.Params["HN_courier"]; exists {
			t.Fatalf("HN_courier=%q 不得转发（hn_ 前缀必须剥离）", value)
		}
	})

	t.Run("F2 回归：自己的地址经真实包装 {state:100,info:row} 预检通过，编辑/删除可用", func(t *testing.T) {
		setup := newOwnerSetup(t, Dep{})
		status, body := setup.call(t, "operAddress", Req{
			Method: http.MethodPost,
			Body:   map[string]any{"id": "1", "person": "A2", "tel": "123456", "address": "x"},
		})
		if status != http.StatusOK {
			t.Fatalf("编辑自己的地址 status = %d, want 200（body=%v）", status, body)
		}
		if mutations := setup.fake.mutationList(); len(mutations) != 1 || mutations[0] != "edit:1" {
			t.Fatalf("写入记录 = %v, want [edit:1]", mutations)
		}
		status, body = setup.call(t, "delAddress", Req{Query: map[string]string{"id": "1"}})
		if status != http.StatusOK {
			t.Fatalf("删除自己的地址 status = %d, want 200（body=%v）", status, body)
		}
	})

	t.Run("F1：order_content 注入与改价被拦截（400，上游不收到请求）", func(t *testing.T) {
		setup := newOwnerSetup(t, Dep{})
		headers := map[string]string{"authorization": bearer(setup.token, ownerMemberA), "idempotency-key": "key-f1-attack-1"}
		bad := []string{
			`[{"id":"0 UNION SELECT password FROM x","count":1}]`,
			`[{"id":"5","count":-1}]`,
			`[{"id":"5","count":0}]`,
			`[{"id":"5","count":100}]`,
			`[{"id":"5","count":1.5}]`,
			`[{"id":"5","count":1,"ntitle":"x' OR '1'='1"}]`,
			`[]`,
			`{"id":"5","count":1}`,
			`[{"id":"5","count":1}`,
			`not json`,
		}
		for _, orderContent := range bad {
			status, body := setup.proxy.Handle(context.Background(), Req{
				Service: "waimai", Action: "deal", Method: http.MethodPost, Headers: headers,
				Body: map[string]any{"shop": "1", "address": "1", "order_content": orderContent},
			})
			if status != http.StatusBadRequest {
				t.Fatalf("order_content=%s status = %d, want 400（body=%v）", orderContent, status, body)
			}
		}
		if count := setup.fake.requestCount(); count != 0 {
			t.Fatalf("校验失败时上游不得收到请求，实际 %d 次", count)
		}

		// 非法 preset / 非数字 shop 同样拒绝；失败请求不占用幂等键。
		for _, payload := range []map[string]any{
			{"shop": "1", "address": "1", "order_content": ownerValidOC, "preset": `[{"title":"x"}]`},
			{"shop": "1 OR 1=1", "address": "1", "order_content": ownerValidOC},
		} {
			status, body := setup.proxy.Handle(context.Background(), Req{
				Service: "waimai", Action: "deal", Method: http.MethodPost, Headers: headers, Body: payload,
			})
			if status != http.StatusBadRequest {
				t.Fatalf("payload=%v status = %d, want 400（body=%v）", payload, status, body)
			}
		}
		status, body := setup.proxy.Handle(context.Background(), Req{
			Service: "waimai", Action: "deal", Method: http.MethodPost, Headers: headers,
			Body: map[string]any{"shop": "1", "address": "1", "order_content": ownerValidOC},
		})
		if status != http.StatusOK {
			t.Fatalf("合法请求 status = %d, want 200（body=%v）", status, body)
		}
	})

	t.Run("F1：额外键被丢弃、数量字符串被规整；note 中的 JSON 容器/[{ 不会透传", func(t *testing.T) {
		setup := newOwnerSetup(t, Dep{})
		headers := map[string]string{"authorization": bearer(setup.token, ownerMemberA), "idempotency-key": "key-f1-clean-001"}
		status, body := setup.proxy.Handle(context.Background(), Req{
			Service: "waimai", Action: "deal", Method: http.MethodPost, Headers: headers,
			Body: map[string]any{
				"shop": "1", "address": "1",
				"note":          `[{"x":"' OR 1=1 --"}]`,
				"order_content": `[{"id":5,"count":"2","price":"0.01","evil":"x"}]`,
			},
		})
		if status != http.StatusOK {
			t.Fatalf("status = %d, want 200（body=%v）", status, body)
		}
		sent := setup.fake.firstRequest().Params
		if sent["order_content"] != `[{"id":"5","count":2}]` {
			t.Fatalf("上送的 order_content = %s，额外键必须丢弃、数量必须规整为数字", sent["order_content"])
		}
		if value, exists := sent["note"]; exists {
			t.Fatalf("note=%q 含 JSON 容器，不得透传", value)
		}
	})

	t.Run("F3：超时结果未知，不释放幂等占位；同键重试得到 409 而不是第二笔订单", func(t *testing.T) {
		// 上游返回 HTML：callUpstream 判定为「结果未知」的等价形态（Node 用 fetch throw 模拟）。
		stub := newPHPStub(t)
		stub.respond(func(_ int, w http.ResponseWriter, _ *http.Request) {
			w.Header().Set("Content-Type", "text/html")
			_, _ = w.Write([]byte("<html>timeout</html>"))
		})
		proxy, service := newStubProxy(t, stub, Dep{
			CredentialProvider: func(context.Context, int64) (string, error) {
				return "login_user=100", nil
			},
		})
		request := Req{
			Service: "waimai", Action: "deal", Method: http.MethodPost,
			Body: map[string]any{"shop": "1", "address": "1", "order_content": ownerValidOC},
			Headers: map[string]string{
				"authorization":   bearer(service, ownerMemberA),
				"idempotency-key": "key-f3-timeout-1",
			},
		}
		if status, body := proxy.Handle(context.Background(), request); status != http.StatusGatewayTimeout {
			t.Fatalf("首次 status = %d, want 504（body=%v）", status, body)
		}
		if status, body := proxy.Handle(context.Background(), request); status != http.StatusConflict {
			t.Fatalf("同键重试 status = %d, want 409（body=%v）", status, body)
		}
		if stub.count() != 1 {
			t.Fatalf("结果未知时不得重放上游，实际调用 %d 次", stub.count())
		}
	})

	t.Run("F5：写接口使用独立更紧的限流，不影响读接口", func(t *testing.T) {
		writeLimiter := token.NewLimiter(1, 60*time.Second, func() time.Time { return stubNow })
		setup := newOwnerSetup(t, Dep{
			Allow:      func(string) bool { return true },
			AllowWrite: writeLimiter,
		})
		headers := map[string]string{"authorization": bearer(setup.token, ownerMemberA)}
		if status, body := setup.proxy.Handle(context.Background(), Req{
			Service: "waimai", Action: "cancelOrder", Method: http.MethodGet, Query: map[string]string{"id": "10"}, Headers: headers,
		}); status != http.StatusOK {
			t.Fatalf("第 1 次写 status = %d, want 200（body=%v）", status, body)
		}
		if status, _ := setup.proxy.Handle(context.Background(), Req{
			Service: "waimai", Action: "cancelOrder", Method: http.MethodGet, Query: map[string]string{"id": "10"}, Headers: headers,
		}); status != http.StatusTooManyRequests {
			t.Fatalf("第 2 次写 status = %d, want 429", status)
		}
		if status, body := setup.proxy.Handle(context.Background(), Req{
			Service: "waimai", Action: "order", Method: http.MethodGet, Headers: headers,
		}); status != http.StatusOK {
			t.Fatalf("读接口 status = %d, want 200（body=%v）", status, body)
		}
	})
}
