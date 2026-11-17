// 契约护栏（不是临时自检）：用例锁定与 Node 版逐字对齐的对外行为 —— 状态码、错误码、
// JSON 字段名与字段顺序、空数组形态。改实现前先看这里；合并前不要按临时文件删。
package checkout

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/tgauth"
	"github.com/go-sql-driver/mysql"
)

func TestSelfCheckBaseMicro(t *testing.T) {
	// 期望值由 Node 版 baseMicro（BigInt 实现）逐项算出，Go 侧必须逐字相同。
	cases := []struct {
		centavos int64
		rate     string
		want     int64
	}{
		{100, "56.5", 17700},
		{100, "56", 17858},
		// 18 位小数：中间乘积超过 int64，必须靠 big.Int 才不丢精度。
		{12345, "56.123456789012345678", 2199616},
		{1, "60", 167},
		{999999, "7", 1428570000},
		{1, "0.000001", 10000000000},
	}
	for _, c := range cases {
		got, err := BaseMicro(c.centavos, c.rate)
		if err != nil {
			t.Errorf("BaseMicro(%d,%q): unexpected error %v", c.centavos, c.rate, err)
			continue
		}
		if got != c.want {
			t.Errorf("BaseMicro(%d,%q) = %d, want %d", c.centavos, c.rate, got, c.want)
		}
	}

	for _, rate := range []string{"", "abc", "0", "0.0", "-5", "56.", ".5", "56.1234567890123456789"} {
		_, err := BaseMicro(100, rate)
		if err == nil {
			t.Errorf("BaseMicro with rate %q should be rejected", rate)
			continue
		}
		var checkoutErr *Error
		if !errors.As(err, &checkoutErr) || checkoutErr.Code != "RATE_INVALID" {
			t.Errorf("rate %q: want RATE_INVALID, got %v", rate, err)
		}
	}
}

func TestSelfCheckPickTail(t *testing.T) {
	occupied := make(map[int]bool, TailMax)
	for tail := TailMin; tail <= TailMax; tail++ {
		occupied[tail] = true
	}
	if _, err := PickTail(occupied); err == nil {
		t.Fatal("all tails occupied should fail")
	} else if checkoutErr, ok := err.(*Error); !ok || checkoutErr.Code != "TAIL_EXHAUSTED" {
		t.Fatalf("want TAIL_EXHAUSTED, got %v", err)
	}

	// 只留 7：必须选 7。
	occupied[7] = false
	got, err := PickTail(occupied)
	if err != nil || got != 7 {
		t.Fatalf("only free tail is 7, got %d (%v)", got, err)
	}

	// 全空时随机结果必须落在 [1,90]。
	for i := 0; i < 200; i++ {
		tail, err := PickTail(map[int]bool{})
		if err != nil || tail < TailMin || tail > TailMax {
			t.Fatalf("free pick out of range: %d (%v)", tail, err)
		}
	}
}

func TestSelfCheckRowStateGuards(t *testing.T) {
	now := time.Date(2026, 11, 6, 12, 0, 0, 0, time.UTC)
	future := now.Add(30 * time.Second)
	// 判定是按秒的严格大于（Node: `expires_at秒 > now秒`），所以「同一秒到期」已经不可用。
	// 这条边界必须钉住：差一秒就会让幂等返回与过期释放的时机整体偏移。
	nextSecond := now.Add(time.Second)
	sameSecond := now.Add(500 * time.Millisecond)

	cases := []struct {
		name     string
		row      Row
		usable   bool
		reusable bool
	}{
		{"pending-fresh", Row{State: "pending", ExpiresAt: future}, true, true},
		{"pending-next-second", Row{State: "pending", ExpiresAt: nextSecond}, true, true},
		{"pending-same-second", Row{State: "pending", ExpiresAt: sameSecond}, false, true},
		{"pending-expired", Row{State: "pending", ExpiresAt: now.Add(-time.Second)}, false, true},
		{"expired", Row{State: "expired", ExpiresAt: future}, false, true},
		{"matched", Row{State: "matched", ExpiresAt: future}, false, false},
		{"void", Row{State: "void", ExpiresAt: future}, false, false},
	}
	for _, c := range cases {
		if got := RowUsable(&c.row, now); got != c.usable {
			t.Errorf("%s: RowUsable = %v, want %v", c.name, got, c.usable)
		}
		if got := RowReusable(&c.row); got != c.reusable {
			t.Errorf("%s: RowReusable = %v, want %v", c.name, got, c.reusable)
		}
	}
}

func TestSelfCheckTimeFormatting(t *testing.T) {
	// 毫秒必须截断而不是四舍五入：Node 用 toISOString().slice(0,19)。
	stamp := time.Date(2026, 11, 6, 12, 34, 56, 789_000_000, time.UTC)
	if got := SqlTime(stamp); got != "2026-11-06 12:34:56" {
		t.Errorf("SqlTime = %q", got)
	}
	if got := DBISO(stamp); got != "2026-11-06T12:34:56Z" {
		t.Errorf("DBISO = %q", got)
	}
	// 带时区的时间必须先归一到 UTC，否则落库时间会整体偏移 8 小时。
	shifted := time.Date(2026, 11, 6, 20, 34, 56, 0, time.FixedZone("CST", 8*3600))
	if got := DBISO(shifted); got != "2026-11-06T12:34:56Z" {
		t.Errorf("DBISO should normalize to UTC, got %q", got)
	}
}

func TestSelfCheckRowToData(t *testing.T) {
	row := &Row{
		Ordernum:     "ord-1",
		PayableMicro: 17700 + 5*TailUnitMicro,
		RateStr:      "56.5",
		RateAt:       time.Date(2026, 11, 6, 12, 0, 0, 0, time.UTC),
		ExpiresAt:    time.Date(2026, 11, 6, 12, 15, 0, 0, time.UTC),
	}
	data := RowToData(row, "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t")
	if data.Ordernum != "ord-1" || data.PayableMicro != 17700+5*TailUnitMicro {
		t.Fatalf("unexpected data: %+v", data)
	}
	if data.RateAt != "2026-11-06T12:00:00Z" || data.ExpiresAt != "2026-11-06T12:15:00Z" {
		t.Fatalf("unexpected timestamps: %+v", data)
	}
	if data.Address != "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t" {
		t.Fatalf("unexpected address: %q", data.Address)
	}
}

func TestSelfCheckSafeID(t *testing.T) {
	ok := []string{"a", "A1_-", strings.Repeat("x", 64)}
	for _, value := range ok {
		if !SafeID(value) {
			t.Errorf("%q should be a safe id", value)
		}
	}
	bad := []string{"", strings.Repeat("x", 65), "a b", "a/b", "订单1", "a'b", "a;b"}
	for _, value := range bad {
		if SafeID(value) {
			t.Errorf("%q should be rejected", value)
		}
	}
}

func TestSelfCheckClassifyWriteError(t *testing.T) {
	tailErr := &mysql.MySQLError{Number: 1062, Message: "Duplicate entry '17705' for key 'uq_fbs_charge_tail'"}
	var collision *tailCollision
	if err := classifyWriteError(tailErr, 5); !errors.As(err, &collision) {
		t.Fatalf("tail collision should be retryable, got %v", err)
	} else if collision.tail != 5 {
		t.Fatalf("collision tail = %d, want 5", collision.tail)
	}

	orderErr := &mysql.MySQLError{Number: 1062, Message: "Duplicate entry 'ord-1' for key 'uq_fbs_charge_ordernum'"}
	var dupe *duplicateOrder
	if err := classifyWriteError(orderErr, 5); !errors.As(err, &dupe) {
		t.Fatalf("order duplicate must not be retried as tail collision, got %v", err)
	}

	plain := errors.New("connection reset")
	if got := classifyWriteError(plain, 5); got != plain {
		t.Fatalf("non-1062 errors must pass through, got %v", got)
	}

	// 死锁 / 锁等待超时：数据库已回滚事务，换尾数重试比把 500 抛给用户好。
	for _, code := range []uint16{1213, 1205} {
		var retry *tailCollision
		if err := classifyWriteError(&mysql.MySQLError{Number: code, Message: "lock"}, 5); !errors.As(err, &retry) {
			t.Fatalf("%d should be retryable, got %v", code, err)
		}
	}

	// 其他 MySQL 错误（表不存在、字段缺失）必须原样上抛，不能被当成并发冲突吞掉。
	other := &mysql.MySQLError{Number: 1146, Message: "Table 'x.fbs_charge' doesn't exist"}
	if got := classifyWriteError(other, 5); got != other {
		t.Fatalf("1146 must pass through, got %v", got)
	}
}

func TestSelfCheckStatusFor(t *testing.T) {
	cases := map[string]int{
		"BAD_REQUEST":       http.StatusBadRequest,
		"UNAUTHORIZED":      http.StatusUnauthorized,
		"ORDER_EXISTS":      http.StatusConflict,
		"ORDER_NOT_FOUND":   http.StatusForbidden,
		"ORDER_FORBIDDEN":   http.StatusForbidden,
		"ORDER_NOT_PAYABLE": http.StatusForbidden,
		"ORDER_INVALID":     http.StatusForbidden,
		"RATE_STALE":        http.StatusServiceUnavailable,
		"RATE_INVALID":      http.StatusServiceUnavailable,
		"RATE_UNAVAILABLE":  http.StatusServiceUnavailable,
		"TAIL_EXHAUSTED":    http.StatusServiceUnavailable,
	}
	for code, want := range cases {
		if got := StatusFor(code); got != want {
			t.Errorf("StatusFor(%q) = %d, want %d", code, got, want)
		}
	}
}

// 限流窗口：60s 内第 6 次必须被拒，窗口滑过后恢复。按 tg id 分桶，互不影响。
func TestSelfCheckRateLimitWindow(t *testing.T) {
	current := time.Date(2026, 11, 6, 12, 0, 0, 0, time.UTC)
	r := &route{
		now:  func() time.Time { return current },
		hits: make(map[int64][]time.Time),
	}
	for i := 0; i < CheckoutLimit; i++ {
		if !r.allow(42) {
			t.Fatalf("request %d should be allowed", i+1)
		}
	}
	if r.allow(42) {
		t.Fatalf("request %d should be rate limited", CheckoutLimit+1)
	}
	if !r.allow(43) {
		t.Fatal("another tg user must have its own bucket")
	}
	current = current.Add(CheckoutWindow + time.Second)
	if !r.allow(42) {
		t.Fatal("after window the bucket should reset")
	}
}

func TestSelfCheckParseBody(t *testing.T) {
	// 解析方式由 Content-Type 决定（与 express.json / express.urlencoded 一致），
	// 不看 body 首字节。
	jsonReq := httptest.NewRequest(http.MethodPost, "/checkout",
		strings.NewReader(`{"ordernum":"o1","idempotencyKey":"k1","initData":"i1"}`))
	jsonReq.Header.Set("Content-Type", "application/json")
	got := parseBody(jsonReq)
	if got.Ordernum != "o1" || got.IdempotencyKey != "k1" || got.InitData != "i1" {
		t.Fatalf("json body: %+v", got)
	}

	formReq := httptest.NewRequest(http.MethodPost, "/checkout",
		strings.NewReader("ordernum=o2&idempotencyKey=k2&initData=i2"))
	formReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	got = parseBody(formReq)
	if got.Ordernum != "o2" || got.IdempotencyKey != "k2" || got.InitData != "i2" {
		t.Fatalf("form body: %+v", got)
	}

	// 没带 Content-Type 的 body 一律视为空 —— 这是 Node 的行为（express 只在类型匹配时解析），
	// 也是这次从「首字节嗅探」改过来的原因。
	noType := httptest.NewRequest(http.MethodPost, "/checkout",
		strings.NewReader(`{"ordernum":"o3"}`))
	if got := parseBody(noType); got.Ordernum != "" {
		t.Fatalf("无 Content-Type 时不该解析出字段，实际 %+v", got)
	}
	// 明确是 text/plain 的 JSON 同样不解析。
	textReq := httptest.NewRequest(http.MethodPost, "/checkout",
		strings.NewReader(`{"ordernum":"o4"}`))
	textReq.Header.Set("Content-Type", "text/plain")
	if got := parseBody(textReq); got.Ordernum != "" {
		t.Fatalf("text/plain 不该按 JSON 解析，实际 %+v", got)
	}

	// 坏 JSON 不单独报错：后续参数校验会以 BAD_REQUEST 收口。
	badReq := httptest.NewRequest(http.MethodPost, "/checkout", strings.NewReader(`{oops`))
	badReq.Header.Set("Content-Type", "application/json")
	if got := parseBody(badReq); got.Ordernum != "" || got.IdempotencyKey != "" {
		t.Fatalf("broken json should parse to empty fields, got %+v", got)
	}
	// 非字符串值（对象）按 Node 行为视为缺失。
	objectReq := httptest.NewRequest(http.MethodPost, "/checkout",
		strings.NewReader(`{"ordernum":{"x":1},"initData":"i5"}`))
	objectReq.Header.Set("Content-Type", "application/json")
	if got := parseBody(objectReq); got.Ordernum != "" || got.InitData != "i5" {
		t.Fatalf("非字符串字段应视为缺失，实际 %+v", got)
	}
	emptyReq := httptest.NewRequest(http.MethodPost, "/checkout", strings.NewReader(""))
	emptyReq.Header.Set("Content-Type", "application/json")
	if got := parseBody(emptyReq); got.Ordernum != "" {
		t.Fatalf("empty body should parse to empty fields, got %+v", got)
	}
}

// 未开启收银台时必须 503 CHECKOUT_DISABLED，且不读 body、不碰 DB。
func TestSelfCheckRouteDisabled(t *testing.T) {
	handler := NewRoute(RouteDep{Env: func(string) string { return "" }})
	recorder := httptest.NewRecorder()
	handler(recorder, httptest.NewRequest(http.MethodPost, "/checkout", strings.NewReader(`{"ordernum":"o1"}`)))

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("status = %d, want 503", recorder.Code)
	}
	if !strings.Contains(recorder.Body.String(), `"CHECKOUT_DISABLED"`) {
		t.Fatalf("body = %s", recorder.Body.String())
	}
}

// 未登录必须 401，且 initData 优先取 X-Telegram-Init-Data 头。
func TestSelfCheckRouteUnauthorized(t *testing.T) {
	seen := ""
	handler := NewRoute(RouteDep{
		Env: func(key string) string {
			if key == "CHECKOUT_ENABLED" {
				return "1"
			}
			return ""
		},
		ValidateInitData: func(initData, botToken string) tgauth.Result {
			seen = initData
			return tgauth.Result{Error: "bad signature"}
		},
	})
	request := httptest.NewRequest(http.MethodPost, "/checkout",
		strings.NewReader(`{"ordernum":"o1","initData":"from-body"}`))
	request.Header.Set("X-Telegram-Init-Data", "from-header")
	recorder := httptest.NewRecorder()
	handler(recorder, request)

	if seen != "from-header" {
		t.Fatalf("header should win, got %q", seen)
	}
	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want 401", recorder.Code)
	}
	if !strings.Contains(recorder.Body.String(), `"UNAUTHORIZED"`) {
		t.Fatalf("body = %s", recorder.Body.String())
	}
}
