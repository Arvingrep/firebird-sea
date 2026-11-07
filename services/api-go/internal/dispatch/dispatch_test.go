// POST /tg-api/internal/dispatch 的测试套件。
//
// 翻译来源：services/api/test/dispatch-route.test.js（591 行）里的**全部**用例，
// 每条 Go 测试的注释开头标出对应关系；另补 Node 侧没有单测、但行为清单要求的分支
// （默认 sendMessage 的 HTTP 契约、SQL 参数化、优雅退出接线）。
//
// 与 Node 用例的映射要点：
//   - Node 注入 fakeConn（内存 Set + 抛 "Duplicate entry"）；Go 侧同样注入内存 Store，
//     但「撞唯一键」返回的是驱动级的 *mysql.MySQLError{Number:1062} —— 这样内存实现
//     与生产实现走的是同一条 dup 判定（store_test.go 另外用 sqlmock 验真实 SQL）。
//   - Node 直接构造 req stub（req.get() 返回签名）；Go 侧发真实 *http.Request，
//     签名用**真实的** gateway.Sign 算，并把原始字节塞进 httpbody 的 context
//     （等价装配层中间件 httpbody.With）。
//   - 时间一律用注入的 Now 固定；退避一律用注入的 Wait 记录，不让测试真睡。
package dispatch

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/gateway"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/httpbody"
)

const (
	testSecret   = "test-gateway-secret-0123456789abcdef"
	testBotToken = "test-bot-token-not-a-secret"
	testTGUser   = 555000111
	testTGUser2  = 555000222
	testQLURL    = "https://canary.fbird.men/ql.html?token=FAKE"
	testPath     = "/tg-api/internal/dispatch"
)

// testNow 是验签窗口的基准时刻（固定值，避免用例随真实时间漂）。
var testNow = time.Unix(1700000000, 0)

// —— 内存 Store（等价 Node 用例里的 makeConn） ——

type memStore struct {
	mu sync.Mutex
	// rows 是 fbs_dispatch_dedup 的内存替身：键 = event:order_id:courier_id。
	rows map[string]struct{}
	// bindings 是 fbs_courier_map 的替身：courier_id → tg_user_id 文本。
	// 为 nil 表示「所有骑手都绑定 testTGUser」（等价 Node 的 courierBound: true）。
	bindings map[int64]string
	// unbound 为 true 表示所有骑手都未绑定（等价 courierBound: false）。
	unbound bool

	failLookup error
	failClaim  error

	claims   int
	releases int
	prunes   int
}

func newMemStore() *memStore {
	return &memStore{rows: map[string]struct{}{}}
}

func dedupKey(event string, orderID, courierID int64) string {
	return fmt.Sprintf("%s:%d:%d", event, orderID, courierID)
}

func (s *memStore) Claim(_ context.Context, event string, orderID, courierID int64) (bool, bool, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.claims++
	if s.failClaim != nil {
		return false, false, s.failClaim
	}
	key := dedupKey(event, orderID, courierID)
	if _, exists := s.rows[key]; exists {
		// 生产实现从驱动拿到 1062；内存替身返回同一个类型，让两条路共用 isDuplicateKey。
		return false, true, nil
	}
	s.rows[key] = struct{}{}
	return true, false, nil
}

func (s *memStore) Release(_ context.Context, event string, orderID, courierID int64) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.releases++
	delete(s.rows, dedupKey(event, orderID, courierID))
	return nil
}

func (s *memStore) TelegramUser(_ context.Context, courierID int64) (int64, bool, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.failLookup != nil {
		return 0, false, s.failLookup
	}
	if s.unbound {
		return 0, false, nil
	}
	if s.bindings != nil {
		text, ok := s.bindings[courierID]
		if !ok {
			return 0, false, nil
		}
		tgUserID, bound := firstInt(text)
		return tgUserID, bound, nil
	}
	return testTGUser, true, nil
}

func (s *memStore) PruneExpired(context.Context) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.prunes++
	return nil
}

func (s *memStore) has(event string, orderID, courierID int64) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	_, ok := s.rows[dedupKey(event, orderID, courierID)]
	return ok
}

func (s *memStore) size() int {
	s.mu.Lock()
	defer s.mu.Unlock()
	return len(s.rows)
}

// —— 日志捕获 ——

type logSink struct {
	mu    sync.Mutex
	lines []string
}

func (s *logSink) add(line string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.lines = append(s.lines, line)
}

func (s *logSink) all() string {
	s.mu.Lock()
	defer s.mu.Unlock()
	return strings.Join(s.lines, "\n")
}

// —— 假网关（等价 Node 用例里 riderNotifyUrl 的默认实现） ——

type fakeGateway struct {
	mu    sync.Mutex
	calls []map[string]any
	// respond 返回网关响应；err 非空时模拟 gatewayClient reject（非 2xx）。
	respond map[string]any
	err     error
}

func (g *fakeGateway) RiderNotifyURL(_ context.Context, params map[string]any) (map[string]any, error) {
	g.mu.Lock()
	defer g.mu.Unlock()
	g.calls = append(g.calls, params)
	if g.err != nil {
		return nil, g.err
	}
	if g.respond != nil {
		return g.respond, nil
	}
	return map[string]any{"success": true, "data": map[string]any{"url": testQLURL}}, nil
}

func (g *fakeGateway) callCount() int {
	g.mu.Lock()
	defer g.mu.Unlock()
	return len(g.calls)
}

func (g *fakeGateway) firstCall() map[string]any {
	g.mu.Lock()
	defer g.mu.Unlock()
	if len(g.calls) == 0 {
		return nil
	}
	return g.calls[0]
}

// —— 测试夹具（等价 Node 的 makeRoute） ——

type harness struct {
	route   *Route
	store   *memStore
	gateway *fakeGateway
	logs    logSink

	mu    sync.Mutex
	sent  []Message
	waits []time.Duration

	now time.Time
}

func newHarness(t *testing.T, mutate func(*Dep)) *harness {
	t.Helper()
	h := &harness{store: newMemStore(), gateway: &fakeGateway{}, now: testNow}
	dep := Dep{
		Secret:      testSecret,
		BotToken:    testBotToken,
		Gateway:     h.gateway,
		Now:         func() time.Time { return h.now },
		SendMessage: func(_ context.Context, message Message) error { h.recordSend(message); return nil },
		Wait:        func(d time.Duration) { h.recordWait(d) },
		Logf:        h.logs.add,
		store:       h.store,
	}
	if mutate != nil {
		mutate(&dep)
	}
	h.route = New(dep)
	return h
}

func (h *harness) recordSend(message Message) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.sent = append(h.sent, message)
}

func (h *harness) recordWait(d time.Duration) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.waits = append(h.waits, d)
}

func (h *harness) sentMessages() []Message {
	h.mu.Lock()
	defer h.mu.Unlock()
	return append([]Message(nil), h.sent...)
}

func (h *harness) waited() []time.Duration {
	h.mu.Lock()
	defer h.mu.Unlock()
	return append([]time.Duration(nil), h.waits...)
}

// signedRequest 构造一条与 PHP 挂点同形的请求：签名覆盖 body 的**原始字节**，
// 并把同一份字节挂进 context（等价装配层中间件 httpbody.With 的产物）。
func (h *harness) signedRequest(t *testing.T, raw []byte, mutate func(*http.Request)) *http.Request {
	t.Helper()
	request := httptest.NewRequest(http.MethodPost, testPath, strings.NewReader(string(raw)))
	request.Header.Set("Content-Type", "application/json")
	timestamp := strconv.FormatInt(h.now.Unix(), 10)
	request.Header.Set("x-fbs-timestamp", timestamp)
	request.Header.Set("x-fbs-signature", gateway.Sign(testSecret, timestamp, action, string(raw)))
	if mutate != nil {
		mutate(request)
	}
	return httpbody.With(request, raw, httpbody.Parse("application/json", raw))
}

// postJSON 发一条事件请求，返回响应记录器（等价 Node 的 postDispatch + makeRes）。
func (h *harness) postJSON(t *testing.T, body any) *httptest.ResponseRecorder {
	t.Helper()
	raw, err := json.Marshal(body)
	if err != nil {
		t.Fatalf("序列化请求体失败: %v", err)
	}
	return h.postRaw(t, raw)
}

func (h *harness) postRaw(t *testing.T, raw []byte) *httptest.ResponseRecorder {
	t.Helper()
	recorder := httptest.NewRecorder()
	h.route.Dispatch(recorder, h.signedRequest(t, raw, nil))
	return recorder
}

// drain 等在飞投递结束；用带超时的 ctx，避免实现写错时测试挂死。
func (h *harness) drain(t *testing.T) {
	t.Helper()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := h.route.Drain(ctx); err != nil {
		t.Fatalf("Drain 未能在 5s 内排空在飞投递: %v", err)
	}
}

// postSigned 用给定的 Route 发一条「原始字节已签名」的请求。
// 与 harness 的差别只是不依赖内存 Store，好让 sqlmock 驱动的 Store 也能走同一条链路。
func postSigned(t *testing.T, route *Route, now time.Time, raw []byte) *httptest.ResponseRecorder {
	t.Helper()
	timestamp := strconv.FormatInt(now.Unix(), 10)
	request := httptest.NewRequest(http.MethodPost, testPath, strings.NewReader(string(raw)))
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("x-fbs-timestamp", timestamp)
	request.Header.Set("x-fbs-signature", gateway.Sign(testSecret, timestamp, action, string(raw)))
	request = httpbody.With(request, raw, httpbody.Parse("application/json", raw))
	recorder := httptest.NewRecorder()
	route.Dispatch(recorder, request)
	return recorder
}

// drainRoute 等这个 Route 的在飞投递结束。
func drainRoute(t *testing.T, route *Route) {
	t.Helper()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := route.Drain(ctx); err != nil {
		t.Fatalf("Drain 未能在 5s 内排空在飞投递: %v", err)
	}
}

// okBody / okEvent 是 Node 的 OK_BODY()。
func okBody(event string) map[string]any {
	return map[string]any{"event": event, "order_id": 1001, "courier_id": 9}
}

// decodeBody 解 202 响应体。
func decodeAccepted(t *testing.T, recorder *httptest.ResponseRecorder) acceptedBody {
	t.Helper()
	var body acceptedBody
	if err := json.Unmarshal(recorder.Body.Bytes(), &body); err != nil {
		t.Fatalf("响应不是合法 JSON（%v）：%s", err, recorder.Body.String())
	}
	return body
}

func decodeFailure(t *testing.T, recorder *httptest.ResponseRecorder) failureBody {
	t.Helper()
	var body failureBody
	if err := json.Unmarshal(recorder.Body.Bytes(), &body); err != nil {
		t.Fatalf("响应不是合法 JSON（%v）：%s", err, recorder.Body.String())
	}
	return body
}

// —— 验签 ——

// 对应 Node「缺失/过期时间戳或错误签名 → 401，不占去重位、不发送」。
func TestVerifyRejectsBadSignature(t *testing.T) {
	cases := map[string]func(*http.Request){
		"无头": func(request *http.Request) {
			request.Header.Del("x-fbs-timestamp")
			request.Header.Del("x-fbs-signature")
		},
		"过期时间戳": func(request *http.Request) {
			stale := strconv.FormatInt(testNow.Unix()-120, 10)
			request.Header.Set("x-fbs-timestamp", stale)
			request.Header.Set("x-fbs-signature", gateway.Sign(testSecret, stale, action, `{"event":"new_order","order_id":1,"courier_id":1}`))
		},
		"错误密钥": func(request *http.Request) {
			timestamp := request.Header.Get("x-fbs-timestamp")
			request.Header.Set("x-fbs-signature",
				gateway.Sign("wrong-secret-0123456789abcdef", timestamp, action, `{"event":"new_order","order_id":1,"courier_id":1}`))
		},
	}
	for label, mutate := range cases {
		t.Run(label, func(t *testing.T) {
			h := newHarness(t, nil)
			raw := []byte(`{"event":"new_order","order_id":1,"courier_id":1}`)
			recorder := httptest.NewRecorder()
			h.route.Dispatch(recorder, h.signedRequest(t, raw, mutate))
			h.drain(t)

			if recorder.Code != http.StatusUnauthorized {
				t.Fatalf("应 401，实得 %d（body=%s）", recorder.Code, recorder.Body.String())
			}
			if body := decodeFailure(t, recorder); body.Error.Code != CodeBadSignature {
				t.Fatalf("错误码应为 %s，实得 %q", CodeBadSignature, body.Error.Code)
			}
			if sent := h.sentMessages(); len(sent) != 0 {
				t.Fatalf("验签失败不该发消息，实得 %d 条", len(sent))
			}
			if h.store.size() != 0 {
				t.Fatalf("验签失败不该占去重位，实得 %d 条", h.store.size())
			}
		})
	}
}

// 对应 Node「时间戳格式非法（非数字/负数/小数/空）→ 401 BAD_SIGNATURE」。
func TestVerifyRejectsMalformedTimestamp(t *testing.T) {
	for _, timestamp := range []string{"abc", "-1", "12.5", ""} {
		t.Run("ts="+timestamp, func(t *testing.T) {
			h := newHarness(t, nil)
			raw := []byte(`{"event":"new_order","order_id":1,"courier_id":1}`)
			recorder := httptest.NewRecorder()
			h.route.Dispatch(recorder, h.signedRequest(t, raw, func(request *http.Request) {
				request.Header.Set("x-fbs-timestamp", timestamp)
				// 签名按这个畸形时间戳算，证明拒绝的原因是格式而不是签名不匹配。
				request.Header.Set("x-fbs-signature", gateway.Sign(testSecret, timestamp, action, string(raw)))
			}))
			h.drain(t)

			if recorder.Code != http.StatusUnauthorized {
				t.Fatalf("ts=%q 应 401，实得 %d", timestamp, recorder.Code)
			}
			if sent := h.sentMessages(); len(sent) != 0 {
				t.Fatalf("ts=%q 不该发消息", timestamp)
			}
		})
	}
}

// 对应 Node「时间戳 ±60 秒窗口边界」——Node 没单独测，行为清单要求。
func TestVerifyAcceptsInsideWindowRejectsOutside(t *testing.T) {
	for _, delta := range []int64{-60, 60} {
		t.Run(fmt.Sprintf("边界 %ds", delta), func(t *testing.T) {
			h := newHarness(t, nil)
			stamp := testNow.Add(time.Duration(delta) * time.Second)
			raw := []byte(`{"event":"grab","order_id":1001,"courier_id":9}`)
			timestamp := strconv.FormatInt(stamp.Unix(), 10)
			request := httptest.NewRequest(http.MethodPost, testPath, strings.NewReader(string(raw)))
			request.Header.Set("Content-Type", "application/json")
			request.Header.Set("x-fbs-timestamp", timestamp)
			request.Header.Set("x-fbs-signature", gateway.Sign(testSecret, timestamp, action, string(raw)))
			request = httpbody.With(request, raw, httpbody.Parse("application/json", raw))

			recorder := httptest.NewRecorder()
			h.route.Dispatch(recorder, request)
			h.drain(t)
			if recorder.Code != http.StatusAccepted {
				t.Fatalf("%d 秒偏移仍在窗口内，应 202，实得 %d", delta, recorder.Code)
			}
		})
	}
	// 61 秒必须被拒。
	h := newHarness(t, nil)
	raw := []byte(`{"event":"grab","order_id":1001,"courier_id":9}`)
	timestamp := strconv.FormatInt(testNow.Unix()-61, 10)
	request := httptest.NewRequest(http.MethodPost, testPath, strings.NewReader(string(raw)))
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("x-fbs-timestamp", timestamp)
	request.Header.Set("x-fbs-signature", gateway.Sign(testSecret, timestamp, action, string(raw)))
	request = httpbody.With(request, raw, httpbody.Parse("application/json", raw))
	recorder := httptest.NewRecorder()
	h.route.Dispatch(recorder, request)
	h.drain(t)
	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("61 秒偏移应 401，实得 %d", recorder.Code)
	}
}

// 钉住「签名覆盖原始字节」：PHP 发来的键序与 Go 重序列化（map 按字母序）不同，
// 只有用 RawOf 拿到的原始字节才验得过。这条是行为清单第一条硬约束的机器校验。
func TestVerifyUsesRawBodyNotReserializedJSON(t *testing.T) {
	h := newHarness(t, nil)
	// 键序刻意不是字母序：重序列化会变成 courier_id → event → order_id。
	raw := []byte(`{"event":"new_order","courier_id":9,"order_id":1001}`)
	recorder := h.postRaw(t, raw)
	h.drain(t)
	if recorder.Code != http.StatusAccepted {
		t.Fatalf("原始字节参与验签时应 202，实得 %d（body=%s）", recorder.Code, recorder.Body.String())
	}

	// 同一份字段、换成「重序列化后」的字节去签名 → 必须验不过（证明没走 JSON.stringify 那条路）。
	reserialized := []byte(`{"courier_id":9,"event":"new_order","order_id":1001}`)
	h2 := newHarness(t, nil)
	request := httptest.NewRequest(http.MethodPost, testPath, strings.NewReader(string(reserialized)))
	request.Header.Set("Content-Type", "application/json")
	timestamp := strconv.FormatInt(testNow.Unix(), 10)
	request.Header.Set("x-fbs-timestamp", timestamp)
	request.Header.Set("x-fbs-signature", gateway.Sign(testSecret, timestamp, action, string(raw)))
	request = httpbody.With(request, reserialized, httpbody.Parse("application/json", reserialized))
	rejected := httptest.NewRecorder()
	h2.route.Dispatch(rejected, request)
	h2.drain(t)
	if rejected.Code != http.StatusUnauthorized {
		t.Fatalf("签名与原文不一致时必须 401，实得 %d", rejected.Code)
	}
}

// —— 参数校验 ——

// 对应 Node「m2：非法事件 → 400，文案由 EVENTS 生成（四种事件全列出）」。
func TestInvalidEventListsAllEvents(t *testing.T) {
	h := newHarness(t, nil)
	recorder := h.postJSON(t, map[string]any{"event": "evil", "order_id": 1, "courier_id": 1})
	h.drain(t)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("应 400，实得 %d", recorder.Code)
	}
	body := decodeFailure(t, recorder)
	if body.Error.Code != CodeInvalidEvent {
		t.Fatalf("错误码应为 %s，实得 %q", CodeInvalidEvent, body.Error.Code)
	}
	for _, event := range Events {
		if !strings.Contains(body.Error.Message, event) {
			t.Fatalf("文案缺 %s：%q", event, body.Error.Message)
		}
	}
	if want := "event must be one of " + strings.Join(Events, "|"); body.Error.Message != want {
		t.Fatalf("文案应由 Events 拼出\n got=%q\nwant=%q", body.Error.Message, want)
	}
	if sent := h.sentMessages(); len(sent) != 0 {
		t.Fatalf("非法事件不该发消息")
	}
}

// 对应 Node「非法参数（0 / 负数 / 非数字）→ 400 INVALID_PARAM」。
func TestInvalidParamsRejected(t *testing.T) {
	cases := map[string]map[string]any{
		"order_id=0":    {"event": "new_order", "order_id": 0, "courier_id": 1},
		"courier_id=-1": {"event": "new_order", "order_id": 1, "courier_id": -1},
		"order_id=abc":  {"event": "new_order", "order_id": "abc", "courier_id": 1},
		// Node 的 Number(undefined) 是 NaN → 同样 400；JSON 里缺键就等价于这条。
		"缺 courier_id": {"event": "new_order", "order_id": 1},
	}
	for label, body := range cases {
		t.Run(label, func(t *testing.T) {
			h := newHarness(t, nil)
			recorder := h.postJSON(t, body)
			h.drain(t)
			if recorder.Code != http.StatusBadRequest {
				t.Fatalf("应 400，实得 %d（body=%s）", recorder.Code, recorder.Body.String())
			}
			if failure := decodeFailure(t, recorder); failure.Error.Code != CodeInvalidParam {
				t.Fatalf("错误码应为 %s，实得 %q", CodeInvalidParam, failure.Error.Code)
			}
			if sent := h.sentMessages(); len(sent) != 0 {
				t.Fatalf("非法参数不该发消息")
			}
		})
	}
}

// Node 的 Number() 强制转换口径：字符串数字与 true 在 Node 是合法参数，
// 这里钉住「不能被 Go 的严格类型断言吃掉」（否则双进程对拍会出现 202 vs 400）。
func TestParamsFollowJSNumberCoercion(t *testing.T) {
	cases := map[string]map[string]any{
		"字符串数字":   {"event": "new_order", "order_id": "1001", "courier_id": "9"},
		"布尔 true": {"event": "new_order", "order_id": true, "courier_id": 9},
	}
	for label, body := range cases {
		t.Run(label, func(t *testing.T) {
			h := newHarness(t, nil)
			recorder := h.postJSON(t, body)
			h.drain(t)
			if recorder.Code != http.StatusAccepted {
				t.Fatalf("应 202（Node 的 Number() 口径），实得 %d（body=%s）", recorder.Code, recorder.Body.String())
			}
		})
	}
	// 小数与超安全整数必须被拒。
	for label, value := range map[string]any{"小数": 1001.5, "超安全整数": float64(1 << 60)} {
		t.Run(label, func(t *testing.T) {
			h := newHarness(t, nil)
			recorder := h.postJSON(t, map[string]any{"event": "new_order", "order_id": value, "courier_id": 9})
			h.drain(t)
			if recorder.Code != http.StatusBadRequest {
				t.Fatalf("%s 应 400，实得 %d", label, recorder.Code)
			}
		})
	}
}

// —— M3：收下即返回 ——

// 对应 Node「M3：sendMessage 还挂着时 HTTP 已经是 202 accepted:true」。
func TestAcceptedBeforeSendCompletes(t *testing.T) {
	started := make(chan struct{}, 1)
	gate := make(chan struct{})
	h := newHarness(t, func(dep *Dep) {
		dep.SendMessage = func(_ context.Context, _ Message) error {
			started <- struct{}{}
			<-gate
			return nil
		}
	})

	recorder := h.postJSON(t, okBody("new_order"))
	// 这一行能返回本身就是证明：若处理器同步等 sendMessage，gate 未放行就会挂死。
	if recorder.Code != http.StatusAccepted {
		t.Fatalf("必须在发送前就返回 202，实得 %d", recorder.Code)
	}
	if body := decodeAccepted(t, recorder); !body.Success || !body.Accepted || body.Dedup {
		t.Fatalf("响应体应为 {success:true,accepted:true,dedup:false}，实得 %+v", body)
	}
	select {
	case <-started:
	case <-time.After(2 * time.Second):
		t.Fatal("响应返回后投递应已启动")
	}
	close(gate)
	h.drain(t)
}

// 对应 Node「M3：响应前已写入去重占位（并发副本/重复触发在响应那一刻就被挡住）」。
func TestDedupClaimHappensBeforeResponse(t *testing.T) {
	h := newHarness(t, nil)
	var rowsAtResponse int
	recorder := &hookRecorder{ResponseRecorder: httptest.NewRecorder()}
	recorder.onWriteHeader = func() {
		rowsAtResponse = h.store.size()
	}

	raw, err := json.Marshal(okBody("new_order"))
	if err != nil {
		t.Fatalf("序列化失败: %v", err)
	}
	h.route.Dispatch(recorder, h.signedRequest(t, raw, nil))
	if recorder.Code != http.StatusAccepted {
		t.Fatalf("应 202，实得 %d", recorder.Code)
	}
	if rowsAtResponse != 1 {
		t.Fatalf("写 202 的那一刻去重占位必须已写入，实得 %d 条", rowsAtResponse)
	}
	h.drain(t)
}

// hookRecorder 在 WriteHeader 的瞬间回调，用来断言「响应写出时的世界状态」。
type hookRecorder struct {
	*httptest.ResponseRecorder
	onWriteHeader func()
}

func (r *hookRecorder) WriteHeader(status int) {
	if r.onWriteHeader != nil {
		hook := r.onWriteHeader
		r.onWriteHeader = nil
		hook()
	}
	r.ResponseRecorder.WriteHeader(status)
}

// —— 成功路径 ——

// 对应 Node「成功路径：查绑定 → rider_notify_url → sendMessage 带「查看订单」按钮」。
func TestSuccessfulDeliveryCarriesOrderButton(t *testing.T) {
	h := newHarness(t, nil)
	recorder := h.postJSON(t, okBody("new_order"))
	h.drain(t)

	if recorder.Code != http.StatusAccepted {
		t.Fatalf("应 202，实得 %d", recorder.Code)
	}
	call := h.gateway.firstCall()
	if call["order_id"] != int64(1001) && call["order_id"] != float64(1001) {
		t.Fatalf("网关参数 order_id 应为 1001，实得 %v", call["order_id"])
	}
	if call["courier_id"] != int64(9) && call["courier_id"] != float64(9) {
		t.Fatalf("网关参数 courier_id 应为 9，实得 %v", call["courier_id"])
	}
	sent := h.sentMessages()
	if len(sent) != 1 {
		t.Fatalf("应发 1 条，实得 %d 条", len(sent))
	}
	if sent[0].ChatID != testTGUser {
		t.Fatalf("chat_id 应为 %d，实得 %d", testTGUser, sent[0].ChatID)
	}
	if !strings.Contains(sent[0].Text, "新的配送订单") || !strings.Contains(sent[0].Text, "订单号：1001") {
		t.Fatalf("文案不符：%q", sent[0].Text)
	}
	if sent[0].ReplyMarkup == nil {
		t.Fatal("带 URL 时必须带 inline 按钮")
	}
	button := sent[0].ReplyMarkup.InlineKeyboard[0][0]
	if button.Text != "查看订单" || button.URL != testQLURL {
		t.Fatalf("按钮应为 {查看订单, %s}，实得 %+v", testQLURL, button)
	}
}

// 对应 Node「四种事件文案区分」。
func TestEventTextsDiffer(t *testing.T) {
	cases := map[string]string{
		"new_order": "新的配送订单",
		"grab":      "抢单成功",
		"reassign":  "改派给您",
		"reclaim":   "已被客服收回",
	}
	for event, want := range cases {
		t.Run(event, func(t *testing.T) {
			h := newHarness(t, nil)
			recorder := h.postJSON(t, map[string]any{"event": event, "order_id": 7, "courier_id": 9})
			h.drain(t)
			if recorder.Code != http.StatusAccepted {
				t.Fatalf("%s 应 202，实得 %d", event, recorder.Code)
			}
			sent := h.sentMessages()
			if len(sent) != 1 {
				t.Fatalf("%s 应发 1 条，实得 %d", event, len(sent))
			}
			if !strings.Contains(sent[0].Text, want) {
				t.Fatalf("%s 文案应含 %q，实得 %q", event, want, sent[0].Text)
			}
		})
	}
}

// 对应 Node「reclaim → 不带按钮、不调 rider_notify_url，文案为「无需继续配送」」。
func TestReclaimHasNoButtonAndNoURL(t *testing.T) {
	h := newHarness(t, nil)
	recorder := h.postJSON(t, map[string]any{"event": "reclaim", "order_id": 1001, "courier_id": 9})
	h.drain(t)

	if recorder.Code != http.StatusAccepted {
		t.Fatalf("应 202，实得 %d", recorder.Code)
	}
	sent := h.sentMessages()
	if len(sent) != 1 {
		t.Fatalf("应发 1 条，实得 %d", len(sent))
	}
	if sent[0].ReplyMarkup != nil {
		t.Fatalf("被摘单通知不得带查看订单按钮，实得 %+v", sent[0].ReplyMarkup)
	}
	if !strings.Contains(sent[0].Text, "无需继续配送") {
		t.Fatalf("文案不符：%q", sent[0].Text)
	}
	if count := h.gateway.callCount(); count != 0 {
		t.Fatalf("reclaim 不应生成详情直达 URL，实际调用网关 %d 次", count)
	}
}

// 对应 Node「网关 rider_notify_url 失败 → 降级发纯文本（无按钮），仍投递」。
func TestGatewayFailureDegradesToPlainText(t *testing.T) {
	h := newHarness(t, func(dep *Dep) {
		dep.Gateway = &fakeGateway{err: fmt.Errorf("gateway boom")}
	})
	recorder := h.postJSON(t, okBody("new_order"))
	h.drain(t)

	if recorder.Code != http.StatusAccepted {
		t.Fatalf("应 202，实得 %d", recorder.Code)
	}
	sent := h.sentMessages()
	if len(sent) != 1 {
		t.Fatalf("应发 1 条，实得 %d", len(sent))
	}
	if sent[0].ReplyMarkup != nil {
		t.Fatalf("网关失败必须降级为无按钮，实得 %+v", sent[0].ReplyMarkup)
	}
	if !strings.Contains(h.logs.all(), "rider_notify_url failed") {
		t.Fatalf("网关失败应落日志，实得：%s", h.logs.all())
	}
}

// 对应 Node「rider_notify_url 失败/异常包络 → 降级纯文本，URL 不进消息（canary 新契约）」。
func TestGatewayEnvelopeVariantsDegrade(t *testing.T) {
	cases := map[string]map[string]any{
		"2xx 但 success:false": {"success": false, "error": map[string]any{"code": "INTERNAL_ERROR"}},
		"2xx 但 data 缺 url":    {"success": true, "data": map[string]any{}},
		"url 非 https":         {"success": true, "data": map[string]any{"url": "http://evil.example/ql"}},
	}
	for label, respond := range cases {
		t.Run(label, func(t *testing.T) {
			h := newHarness(t, func(dep *Dep) { dep.Gateway = &fakeGateway{respond: respond} })
			recorder := h.postJSON(t, okBody("new_order"))
			h.drain(t)
			if recorder.Code != http.StatusAccepted {
				t.Fatalf("应 202，实得 %d", recorder.Code)
			}
			sent := h.sentMessages()
			if len(sent) != 1 {
				t.Fatalf("应发 1 条，实得 %d", len(sent))
			}
			if sent[0].ReplyMarkup != nil {
				t.Fatalf("%s 必须降级为无按钮，实得 %+v", label, sent[0].ReplyMarkup)
			}
			if strings.Contains(sent[0].Text, "evil.example") {
				t.Fatalf("%s 的 URL 不得进消息正文", label)
			}
		})
	}
}

// 网关没配齐（FBS_GATEWAY_URL / SECRET 缺一）时 Node 的 gateway 是 null：
// 不是「调用失败」，压根不调，也不该落 error 日志。
func TestGatewayNilSkipsURLWithoutErrorLog(t *testing.T) {
	h := newHarness(t, func(dep *Dep) { dep.Gateway = nil })
	recorder := h.postJSON(t, okBody("grab"))
	h.drain(t)

	if recorder.Code != http.StatusAccepted {
		t.Fatalf("应 202，实得 %d", recorder.Code)
	}
	sent := h.sentMessages()
	if len(sent) != 1 || sent[0].ReplyMarkup != nil {
		t.Fatalf("无网关时应发纯文本，实得 %+v", sent)
	}
	if strings.Contains(h.logs.all(), "rider_notify_url failed") {
		t.Fatalf("gateway 为 nil 不该记「调用失败」：%s", h.logs.all())
	}
}

// —— 异步失败语义：只记日志 + 释放占位 ——

// 对应 Node「M2/M3：骑手未绑定 → 202 但静默不发；日志带 event/order_id/courier_id」。
func TestUnboundCourierSkipsAndReleases(t *testing.T) {
	h := newHarness(t, nil)
	h.store.unbound = true
	recorder := h.postJSON(t, okBody("new_order"))
	h.drain(t)

	if recorder.Code != http.StatusAccepted {
		t.Fatalf("应 202，实得 %d", recorder.Code)
	}
	if sent := h.sentMessages(); len(sent) != 0 {
		t.Fatalf("未绑定不该发消息，实得 %d 条", len(sent))
	}
	logs := h.logs.all()
	for _, want := range []string{"not bound", "event=new_order", "order_id=1001", "courier_id=9"} {
		if !strings.Contains(logs, want) {
			t.Fatalf("日志缺 %q：%s", want, logs)
		}
	}
	if h.store.size() != 0 {
		t.Fatalf("未发送必须释放占位，实得 %d 条", h.store.size())
	}
}

// 对应 Node「M3：courier_map 查询异常 → 不发送、释放占位、日志可定位」。
func TestCourierLookupFailureSkipsAndReleases(t *testing.T) {
	h := newHarness(t, nil)
	h.store.failLookup = fmt.Errorf("courier_map boom")
	recorder := h.postJSON(t, okBody("new_order"))
	h.drain(t)

	if recorder.Code != http.StatusAccepted {
		t.Fatalf("应 202，实得 %d", recorder.Code)
	}
	if sent := h.sentMessages(); len(sent) != 0 {
		t.Fatalf("查询失败不该发消息")
	}
	logs := h.logs.all()
	if !strings.Contains(logs, "courier_map lookup failed") || !strings.Contains(logs, "order_id=1001") {
		t.Fatalf("日志应含 courier_map lookup failed 与单号上下文：%s", logs)
	}
	if h.store.size() != 0 {
		t.Fatalf("必须释放占位，实得 %d 条", h.store.size())
	}
}

// 对应 Node「M3：发送两次都失败 → 释放占位，日志含响应原文片段与订单上下文」。
func TestSendFailureTwiceReleasesClaim(t *testing.T) {
	attempts := 0
	h := newHarness(t, func(dep *Dep) {
		dep.SendMessage = func(_ context.Context, _ Message) error {
			attempts++
			return &SendError{
				Message:    "telegram HTTP 500",
				HTTPStatus: 500,
				Snippet:    `{"ok":false,"description":"Internal Server Error"}`,
			}
		}
	})
	recorder := h.postJSON(t, okBody("new_order"))
	h.drain(t)

	if recorder.Code != http.StatusAccepted {
		t.Fatalf("投递失败不影响已返回的 202，实得 %d", recorder.Code)
	}
	if attempts != 2 {
		t.Fatalf("必须恰好重试一次（共 2 次），实得 %d 次", attempts)
	}
	if waits := h.waited(); len(waits) != 1 || waits[0] != time.Second {
		t.Fatalf("无 retry_after 时应退避 1s，实得 %v", waits)
	}
	logs := h.logs.all()
	if !strings.Contains(logs, "sendMessage failed twice") || !strings.Contains(logs, "order_id=1001") ||
		!strings.Contains(logs, "Internal Server Error") {
		t.Fatalf("日志应含失败标记、单号上下文与响应片段：%s", logs)
	}
	if h.store.size() != 0 {
		t.Fatalf("最终失败必须释放占位，实得 %d 条", h.store.size())
	}
}

// 对应 Node「m9：429 带 retry_after → 按其值退避（秒级，上限 5s）而非固定 1s」。
func TestBackoffFollowsRetryAfterWithCap(t *testing.T) {
	attempts := 0
	// 先声明再赋值：闭包在构造期就要引用 h（Go 的短变量声明作用域从语句结束才开始）。
	var h *harness
	h = newHarness(t, func(dep *Dep) {
		dep.SendMessage = func(_ context.Context, message Message) error {
			attempts++
			if attempts == 1 {
				return &SendError{Message: "telegram HTTP 429", HTTPStatus: 429, RetryAfter: 3}
			}
			h.recordSend(message)
			return nil
		}
	})
	h.postJSON(t, okBody("new_order"))
	h.drain(t)

	if waits := h.waited(); len(waits) != 1 || waits[0] != 3*time.Second {
		t.Fatalf("retry_after=3 应等 3000ms，实得 %v", waits)
	}
	if sent := h.sentMessages(); len(sent) != 1 {
		t.Fatalf("退避后重试成功，应发 1 条，实得 %d", len(sent))
	}

	// retry_after 过大要截到上限 5s。
	huge := newHarness(t, func(dep *Dep) {
		dep.SendMessage = func(context.Context, Message) error {
			return &SendError{Message: "telegram HTTP 429", HTTPStatus: 429, RetryAfter: 999}
		}
	})
	huge.postJSON(t, map[string]any{"event": "grab", "order_id": 2, "courier_id": 9})
	huge.drain(t)
	if waits := huge.waited(); len(waits) != 1 || waits[0] != 5*time.Second {
		t.Fatalf("retry_after 过大要截到 5s，实得 %v", waits)
	}
}

// 对应 Node「发送首次失败重试成功 → 占位保留，同键再来命中 dedup（不重复打扰骑手）」。
func TestRetrySuccessKeepsClaimAndBlocksDuplicate(t *testing.T) {
	attempts := 0
	var h *harness
	h = newHarness(t, func(dep *Dep) {
		dep.SendMessage = func(_ context.Context, message Message) error {
			attempts++
			if attempts == 1 {
				return &SendError{Message: "telegram HTTP 500", HTTPStatus: 500}
			}
			h.recordSend(message)
			return nil
		}
	})

	first := h.postJSON(t, okBody("new_order"))
	h.drain(t)
	if first.Code != http.StatusAccepted {
		t.Fatalf("应 202，实得 %d", first.Code)
	}
	if attempts != 2 {
		t.Fatalf("首次失败后必须重试（共 2 次），实得 %d", attempts)
	}
	if !h.store.has("new_order", 1001, 9) {
		t.Fatal("投递成功后占位必须保留")
	}

	second := h.postJSON(t, okBody("new_order"))
	h.drain(t)
	if second.Code != http.StatusAccepted {
		t.Fatalf("应 202，实得 %d", second.Code)
	}
	if body := decodeAccepted(t, second); !body.Dedup {
		t.Fatalf("第二次应 dedup:true，实得 %+v", body)
	}
	if attempts != 2 {
		t.Fatalf("第二次不得再发，实得 %d 次发送", attempts)
	}
}

// —— 去重 ——

// 对应 Node「去重：同键第二次 → 202 dedup:true，不重发」。
func TestDuplicateKeyReturnsDedupTrue(t *testing.T) {
	h := newHarness(t, nil)
	first := h.postJSON(t, okBody("new_order"))
	h.drain(t)
	if body := decodeAccepted(t, first); body.Dedup {
		t.Fatalf("首次应 dedup:false，实得 %+v", body)
	}

	second := h.postJSON(t, okBody("new_order"))
	h.drain(t)
	if second.Code != http.StatusAccepted {
		t.Fatalf("应 202，实得 %d", second.Code)
	}
	if body := decodeAccepted(t, second); !body.Dedup {
		t.Fatalf("第二次应 dedup:true，实得 %+v", body)
	}
	if sent := h.sentMessages(); len(sent) != 1 {
		t.Fatalf("第二次不得重发，实得 %d 条", len(sent))
	}
}

// 对应 Node「去重按三元组：同单不同事件（new_order 后 grab）→ 两次都发」。
//
// 断言不按数组下标：两条投递各在自己的 goroutine 里跑（Node 是单线程事件循环，
// 顺序看起来稳定；Go 不能这么假设），所以只断言「两条都在、文案各自区分」。
func TestDistinctEventsSameOrderBothDelivered(t *testing.T) {
	h := newHarness(t, nil)
	h.postJSON(t, map[string]any{"event": "new_order", "order_id": 1001, "courier_id": 9})
	h.postJSON(t, map[string]any{"event": "grab", "order_id": 1001, "courier_id": 9})
	h.drain(t)

	sent := h.sentMessages()
	if len(sent) != 2 {
		t.Fatalf("应按事件各发一条（共 2 条），实得 %d", len(sent))
	}
	texts := map[string]bool{}
	for _, message := range sent {
		texts[message.Text] = true
	}
	for _, want := range []string{
		eventText["new_order"] + "\n订单号：1001",
		eventText["grab"] + "\n订单号：1001",
	} {
		if !texts[want] {
			t.Fatalf("两条文案应各自区分，缺 %q（实得 %v）", want, sent)
		}
	}
}

// 对应 Node「去重按三元组：同单改派给第二位骑手 → 第二位也收到通知（P2-2 修复的 bug）」。
func TestReassignToSecondCourierIsNotDeduped(t *testing.T) {
	h := newHarness(t, nil)
	first := h.postJSON(t, map[string]any{"event": "reassign", "order_id": 1001, "courier_id": 9})
	second := h.postJSON(t, map[string]any{"event": "reassign", "order_id": 1001, "courier_id": 10})
	h.drain(t)

	if body := decodeAccepted(t, first); body.Dedup {
		t.Fatalf("第一位骑手应 dedup:false")
	}
	if body := decodeAccepted(t, second); body.Dedup {
		t.Fatalf("换骑手的改派不得被同单去重吞掉，实得 dedup:true")
	}
	if sent := h.sentMessages(); len(sent) != 2 {
		t.Fatalf("两位骑手各收一条，实得 %d 条", len(sent))
	}
	if !h.store.has("reassign", 1001, 9) || !h.store.has("reassign", 1001, 10) {
		t.Fatalf("两条占位应各自独立，实得 %d 条", h.store.size())
	}
}

// 对应 Node「去重占位写库异常（非 duplicate）→ 不阻断投递，日志有上下文」。
func TestClaimFailureDoesNotBlockDelivery(t *testing.T) {
	h := newHarness(t, nil)
	h.store.failClaim = fmt.Errorf("db boom: cannot connect")
	recorder := h.postJSON(t, okBody("new_order"))
	h.drain(t)

	if recorder.Code != http.StatusAccepted {
		t.Fatalf("应 202，实得 %d", recorder.Code)
	}
	if body := decodeAccepted(t, recorder); body.Dedup {
		t.Fatalf("写库异常时 dedup 必须为 false，实得 %+v", body)
	}
	if sent := h.sentMessages(); len(sent) != 1 {
		t.Fatalf("宁可重发不可漏发：应仍发 1 条，实得 %d", len(sent))
	}
	logs := h.logs.all()
	if !strings.Contains(logs, "dedup claim failed") || !strings.Contains(logs, "order_id=1001") {
		t.Fatalf("日志应含 dedup claim failed 与单号上下文：%s", logs)
	}
	// claimed=false 时失败不释放（释放的是别人占的位）：这条路径不该产生 release。
	if h.store.releases != 0 {
		t.Fatalf("claimed=false 不该释放占位，实际释放 %d 次", h.store.releases)
	}
}

// —— 日志卫生 ——

// 对应 Node「失败路径日志不含密钥与签名」。
func TestLogsNeverContainSecrets(t *testing.T) {
	h := newHarness(t, func(dep *Dep) {
		dep.SendMessage = func(context.Context, Message) error { return &SendError{Message: "boom"} }
	})
	h.postJSON(t, okBody("new_order"))
	h.drain(t)

	logs := h.logs.all()
	if strings.Contains(logs, testSecret) {
		t.Fatalf("日志不得含密钥：%s", logs)
	}
	if strings.Contains(strings.ToLower(logs), "x-fbs-signature") {
		t.Fatalf("日志不得含签名头：%s", logs)
	}
	if strings.Contains(logs, testBotToken) {
		t.Fatalf("日志不得含 bot token：%s", logs)
	}
	if strings.Contains(logs, testQLURL) {
		t.Fatalf("日志不得含一次性直达 URL：%s", logs)
	}
}

// —— 配置缺失 ——

// 对应 Node「配置缺失（secret/botToken/conn 空）→ 503 DISPATCH_NOT_CONFIGURED」。
func TestNotConfiguredReturns503(t *testing.T) {
	h := &harness{store: newMemStore(), gateway: &fakeGateway{}, now: testNow}
	// 全部依赖都空：等价 Node 的 createDispatchRoute({secret:'',botToken:'',conn:null})。
	h.route = New(Dep{Logf: h.logs.add})
	raw := []byte(`{"event":"new_order","order_id":1001,"courier_id":9}`)
	recorder := httptest.NewRecorder()
	h.route.Dispatch(recorder, h.signedRequest(t, raw, nil))

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("应 503，实得 %d", recorder.Code)
	}
	body := decodeFailure(t, recorder)
	if body.Error.Code != CodeNotConfigured {
		t.Fatalf("错误码应为 %s，实得 %q", CodeNotConfigured, body.Error.Code)
	}
	if body.Error.Message != "dispatch notify not configured" {
		t.Fatalf("文案不符：%q", body.Error.Message)
	}
	if want := `{"success":false,"error":{"code":"DISPATCH_NOT_CONFIGURED","message":"dispatch notify not configured"}}`; recorder.Body.String() != want {
		t.Fatalf("响应体应逐字节一致\n got=%s\nwant=%s", recorder.Body.String(), want)
	}
}

// 缺 DB **不是** 503：Node 的 conn 恒非空（cliConn 无条件返回对象），缺库时 Node 给的是
// 202 + 异步失败落日志。这条钉住「不凭空多一条 Node 没有的 503」（rider 那次踩过）。
func TestMissingDatabaseIsNotA503(t *testing.T) {
	route := New(Dep{
		Secret:   testSecret,
		BotToken: testBotToken,
		DB:       nil,
		Now:      func() time.Time { return testNow },
		Logf:     func(string) {},
	})
	if route.NotConfigured() {
		t.Fatal("缺 DB 不该是 notConfigured（Node 的 conn 恒非空，缺库只让查询失败）")
	}
	raw := []byte(`{"event":"new_order","order_id":1001,"courier_id":9}`)
	timestamp := strconv.FormatInt(testNow.Unix(), 10)
	request := httptest.NewRequest(http.MethodPost, testPath, strings.NewReader(string(raw)))
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("x-fbs-timestamp", timestamp)
	request.Header.Set("x-fbs-signature", gateway.Sign(testSecret, timestamp, action, string(raw)))
	request = httpbody.With(request, raw, httpbody.Parse("application/json", raw))

	recorder := httptest.NewRecorder()
	route.Dispatch(recorder, request)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := route.Drain(ctx); err != nil {
		t.Fatalf("Drain: %v", err)
	}
	if recorder.Code != http.StatusAccepted {
		t.Fatalf("缺 DB 应 202（与 Node 同形），实得 %d（body=%s）", recorder.Code, recorder.Body.String())
	}
}

// —— 修复轮 2 补测：reclaim/reassign 配对矩阵、reclaim 未绑定释放占位、429 重试再失败 ——

// 对应 Node「reclaim 矩阵：同单改派 —— 原骑手收 reclaim（无按钮），新骑手收 reassign（带按钮）」。
func TestReclaimAndReassignMatrix(t *testing.T) {
	h := newHarness(t, nil)
	h.store.bindings = map[int64]string{9: strconv.Itoa(testTGUser), 10: strconv.Itoa(testTGUser2)}

	// ① 原骑手 9：订单被收回，只收到「无需继续配送」，不带按钮。
	h.postJSON(t, map[string]any{"event": "reclaim", "order_id": 1001, "courier_id": 9})
	h.drain(t)
	sent := h.sentMessages()
	if len(sent) != 1 {
		t.Fatalf("原骑手应收到 1 条，实得 %d", len(sent))
	}
	if sent[0].ChatID != testTGUser {
		t.Fatalf("reclaim 必须发给原骑手 %d，实得 %d", testTGUser, sent[0].ChatID)
	}
	if !strings.Contains(sent[0].Text, "已被客服收回") {
		t.Fatalf("文案不符：%q", sent[0].Text)
	}
	if sent[0].ReplyMarkup != nil {
		t.Fatal("原骑手已无该单，不得带查看订单按钮")
	}

	// ② 新骑手 10：同一订单改派过来，收到带按钮的 reassign。
	h.postJSON(t, map[string]any{"event": "reassign", "order_id": 1001, "courier_id": 10})
	h.drain(t)
	sent = h.sentMessages()
	if len(sent) != 2 {
		t.Fatalf("应共 2 条，实得 %d", len(sent))
	}
	if sent[1].ChatID != testTGUser2 {
		t.Fatalf("reassign 必须发给新骑手 %d，实得 %d", testTGUser2, sent[1].ChatID)
	}
	if !strings.Contains(sent[1].Text, "改派给您") {
		t.Fatalf("文案不符：%q", sent[1].Text)
	}
	if sent[1].ReplyMarkup == nil || sent[1].ReplyMarkup.InlineKeyboard[0][0].URL != testQLURL {
		t.Fatalf("新骑手应带查看订单按钮，实得 %+v", sent[1].ReplyMarkup)
	}

	// 只有 reassign 换 URL（reclaim 不该为已收回的单签直达 URL）。
	if call := h.gateway.firstCall(); call["courier_id"] != int64(10) && call["courier_id"] != float64(10) {
		t.Fatalf("网关只应被 reassign 调用一次（courier_id=10），实得 %v", call)
	}
	if count := h.gateway.callCount(); count != 1 {
		t.Fatalf("网关应只被调用 1 次，实得 %d", count)
	}
	if !h.store.has("reclaim", 1001, 9) || !h.store.has("reassign", 1001, 10) {
		t.Fatalf("两条通知应各自独立占坑，实得 %d 条", h.store.size())
	}
}

// 对应 Node「reclaim 给未绑定骑手 → 202 静默不发并释放占位」。
func TestReclaimUnboundReleasesClaim(t *testing.T) {
	h := newHarness(t, nil)
	h.store.unbound = true
	recorder := h.postJSON(t, map[string]any{"event": "reclaim", "order_id": 1001, "courier_id": 9})
	h.drain(t)

	if recorder.Code != http.StatusAccepted {
		t.Fatalf("应 202，实得 %d", recorder.Code)
	}
	if sent := h.sentMessages(); len(sent) != 0 {
		t.Fatalf("未绑定不该发消息")
	}
	if !strings.Contains(h.logs.all(), "event=reclaim") {
		t.Fatalf("日志应带 event=reclaim：%s", h.logs.all())
	}
	if h.store.size() != 0 {
		t.Fatalf("未投递必须释放占位，实得 %d 条", h.store.size())
	}
}

// 对应 Node「429 退避后第二次仍 429 → 释放占位，退避按 retry_after」。
func TestRetryAfterTwice429ReleasesClaim(t *testing.T) {
	attempts := 0
	h := newHarness(t, func(dep *Dep) {
		dep.SendMessage = func(context.Context, Message) error {
			attempts++
			return &SendError{
				Message:    "telegram HTTP 429",
				HTTPStatus: 429,
				RetryAfter: 2,
				Snippet:    `{"ok":false,"description":"Too Many Requests","parameters":{"retry_after":2}}`,
			}
		}
	})
	recorder := h.postJSON(t, okBody("new_order"))
	h.drain(t)

	if recorder.Code != http.StatusAccepted {
		t.Fatalf("已返回的 202 不因异步失败改变，实得 %d", recorder.Code)
	}
	if attempts != 2 {
		t.Fatalf("429 也必须重试一次，实得 %d 次", attempts)
	}
	if waits := h.waited(); len(waits) != 1 || waits[0] != 2*time.Second {
		t.Fatalf("退避应取 retry_after=2s，实得 %v", waits)
	}
	logs := h.logs.all()
	if !strings.Contains(logs, "sendMessage failed twice") || !strings.Contains(logs, "Too Many Requests") {
		t.Fatalf("日志应含失败标记与响应片段：%s", logs)
	}
	if h.store.size() != 0 {
		t.Fatalf("两次都失败必须释放占位，实得 %d 条", h.store.size())
	}
}

// 投递成功后顺手清理过期去重行（对应 Node 的 `DELETE ... created_at < NOW() - INTERVAL 1 DAY`）。
// Node 只用源码断言覆盖过这条，这里做成行为断言。
func TestPruneRunsAfterSuccessfulDelivery(t *testing.T) {
	h := newHarness(t, nil)
	h.postJSON(t, okBody("new_order"))
	h.drain(t)

	h.store.mu.Lock()
	prunes := h.store.prunes
	h.store.mu.Unlock()
	if prunes != 1 {
		t.Fatalf("投递成功后应清理 1 次过期行，实得 %d 次", prunes)
	}

	// 失败投递不该触发清理（Node 的清理在 send 成功之后）。
	failing := newHarness(t, func(dep *Dep) {
		dep.SendMessage = func(context.Context, Message) error { return &SendError{Message: "boom"} }
	})
	failing.postJSON(t, okBody("new_order"))
	failing.drain(t)
	failing.store.mu.Lock()
	failPrunes := failing.store.prunes
	failing.store.mu.Unlock()
	if failPrunes != 0 {
		t.Fatalf("投递失败不该清理过期行，实得 %d 次", failPrunes)
	}
}

// —— 源码约束（对应 Node 的两条「源码约束」用例） ——

// 对应 Node「源码约束：EVENTS 四种事件；去重键三元组；禁用 courier_pushed；响应先于发送」。
//
// 「响应先于发送」由 TestAcceptedBeforeSendCompletes 与 TestDedupClaimHappensBeforeResponse
// 两条行为用例证明（比读源码正则更强）；这里保留另外三条结构性事实。
func TestSourceConstraints(t *testing.T) {
	want := []string{"new_order", "grab", "reassign", "reclaim"}
	if len(Events) != len(want) {
		t.Fatalf("事件应为 4 种，实际 %v", Events)
	}
	for index, event := range want {
		if Events[index] != event {
			t.Fatalf("事件顺序/内容不符：%v", Events)
		}
	}

	source := readSource(t, "dispatch.go") + readSource(t, "store.go")
	if strings.Contains(source, "courier_pushed") {
		t.Fatal("禁止使用被 App 推送占用的 courier_pushed 字段做去重")
	}
	// 去重键必须是三元组：三条 SQL 都要带 event + order_id + courier_id。
	for _, fragment := range []string{
		"INSERT INTO fbs_dispatch_dedup (event, order_id, courier_id)",
		"DELETE FROM fbs_dispatch_dedup WHERE event = ? AND order_id = ? AND courier_id = ?",
	} {
		if !strings.Contains(source, fragment) {
			t.Fatalf("去重 SQL 必须是三元组，缺片段：%s", fragment)
		}
	}
}

// 投递用的 context 必须脱离请求生命周期：Node 在响应之后继续跑，
// 沿用 req.Context() 会让投递跟着连接被取消（这是异步化最容易踩的坑）。
func TestDeliverySurvivesRequestContextCancel(t *testing.T) {
	completed := make(chan struct{})
	h := newHarness(t, func(dep *Dep) {
		dep.SendMessage = func(ctx context.Context, _ Message) error {
			defer close(completed)
			if ctx.Err() != nil {
				return fmt.Errorf("投递 context 已被取消: %v", ctx.Err())
			}
			return nil
		}
	})

	requestCtx, cancel := context.WithCancel(context.Background())
	raw, err := json.Marshal(okBody("new_order"))
	if err != nil {
		t.Fatalf("序列化失败: %v", err)
	}
	// WithContext 会换掉整个 ctx（context 里的值不继承），所以换完要重新挂一次 raw/fields。
	request := h.signedRequest(t, raw, nil).WithContext(requestCtx)
	request = httpbody.With(request, raw, httpbody.Parse("application/json", raw))
	recorder := httptest.NewRecorder()
	h.route.Dispatch(recorder, request)
	// 模拟「响应写完，连接关闭 / 请求 ctx 取消」。
	cancel()

	if recorder.Code != http.StatusAccepted {
		t.Fatalf("应 202，实得 %d（body=%s）", recorder.Code, recorder.Body.String())
	}
	select {
	case <-completed:
	case <-time.After(2 * time.Second):
		t.Fatal("投递没能完成（应脱离开请求 ctx）")
	}
	h.drain(t)
	if logs := h.logs.all(); strings.Contains(logs, "sendMessage") {
		t.Fatalf("不该走失败重试路径：%s", logs)
	}
}

// Drain 的上限语义：在飞任务永远不结束时，Drain 必须按 ctx 截止返回错误（生产用它做 8s 兜底）。
func TestDrainRespectsContextDeadline(t *testing.T) {
	gate := make(chan struct{})
	h := newHarness(t, func(dep *Dep) {
		dep.SendMessage = func(context.Context, Message) error {
			<-gate
			return nil
		}
	})
	h.postJSON(t, okBody("new_order"))

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Millisecond)
	defer cancel()
	if err := h.route.Drain(ctx); err == nil {
		t.Fatal("投递未结束时 Drain 应返回 ctx 错误")
	}
	close(gate)
	h.drain(t)
}
