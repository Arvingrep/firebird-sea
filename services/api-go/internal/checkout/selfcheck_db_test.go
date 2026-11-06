// 契约护栏（需要真实 MariaDB，不是临时自检）：这里跑的是 checkout 的核心承诺 ——
// 事务内尾数分配、幂等复用、并发不撞车。这些只有在真库上才验证得了，缺 `FBS_TEST_DSN`
// 时自动 skip；合并前不要按临时文件删。
package checkout

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"testing"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/migrate"
	_ "github.com/go-sql-driver/mysql"
)

const selfRate = "56.5"
const selfOrderPrefix = "selfcheck-"

func selfNow() time.Time {
	return time.Date(2026, 11, 6, 12, 0, 0, 0, time.UTC)
}

func selfRateSource(now time.Time) RateSource {
	return func(context.Context) (Rate, error) {
		return Rate{RateStr: selfRate, RateAt: now}, nil
	}
}

func openTestDB(t *testing.T) *sql.DB {
	t.Helper()
	dsn := os.Getenv("FBS_TEST_DSN")
	if dsn == "" {
		t.Skip("FBS_TEST_DSN 未设置，跳过集成自检")
	}
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		t.Fatalf("open db: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })
	if err := db.Ping(); err != nil {
		t.Fatalf("ping db: %v", err)
	}
	dir, err := filepath.Abs(filepath.Join("..", "..", "..", "api", "migrations"))
	if err != nil {
		t.Fatalf("resolve migrations: %v", err)
	}
	if _, err := migrate.Run(context.Background(), db, dir); err != nil {
		t.Fatalf("migrate: %v", err)
	}
	cleanup(t, db)
	t.Cleanup(func() { cleanup(t, db) })
	return db
}

func cleanup(t *testing.T, db *sql.DB) {
	t.Helper()
	if _, err := db.Exec("DELETE FROM fbs_charge WHERE ordernum LIKE ?", selfOrderPrefix+"%"); err != nil {
		t.Fatalf("cleanup: %v", err)
	}
}

// dbTimeText 把 DATETIME 列读成 "2006-01-02 15:04:05" 文本，屏蔽驱动形态差异。
//
// 为什么要这个：DATETIME 扫描出来的 Go 类型由 DSN 的 parseTime 决定 ——
// parseTime=false（生产 DSN 写死在 main.go 的 dsnFor 里）给 []byte/string，
// parseTime=true 给 time.Time。测试不该假定 DSN 形状，否则换一条带 parseTime=true 的
// 验证用 DSN 就假红，而红的是「驱动配置」而不是「被测代码」。断言仍然落在同一份文本上，
// 因为 SqlTime 写进去的就是这个布局。
func dbTimeText(t *testing.T, value any) string {
	t.Helper()
	switch typed := value.(type) {
	case time.Time:
		return typed.UTC().Format("2006-01-02 15:04:05")
	case []byte:
		return string(typed)
	case string:
		return typed
	case nil:
		return ""
	default:
		t.Fatalf("无法识别的 DATETIME 列类型 %T", value)
		return ""
	}
}

func newReq(now time.Time, ordernum string, centavos int64, idem *string) Req {
	return Req{
		Ordernum:       ordernum,
		ServerCentavos: centavos,
		IdempotencyKey: idem,
		GetRate:        selfRateSource(now),
		Address:        "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
		Now:            func() time.Time { return now },
	}
}

func TestSelfCheckCreateAndIdempotentReturn(t *testing.T) {
	db := openTestDB(t)
	ctx := context.Background()
	now := selfNow()

	first, err := CreateCheckout(ctx, db, newReq(now, selfOrderPrefix+"idem", 100, nil))
	if err != nil {
		t.Fatalf("create: %v", err)
	}
	base, err := BaseMicro(100, selfRate)
	if err != nil {
		t.Fatalf("base: %v", err)
	}
	if first.PayableMicro < base+TailUnitMicro || first.PayableMicro > base+TailMax*TailUnitMicro {
		t.Fatalf("payable %d out of tail range for base %d", first.PayableMicro, base)
	}
	if first.RateAt != "2026-11-06T12:00:00Z" || first.ExpiresAt != "2026-11-06T12:15:00Z" {
		t.Fatalf("timestamps: %+v", first)
	}
	if first.Address != "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t" {
		t.Fatalf("address: %q", first.Address)
	}

	// 同一 ordernum 再来一次：必须原样返回，不换尾数、不续期。
	later := now.Add(2 * time.Minute)
	second, err := CreateCheckout(ctx, db, newReq(later, selfOrderPrefix+"idem", 100, nil))
	if err != nil {
		t.Fatalf("idempotent: %v", err)
	}
	if second != first {
		t.Fatalf("idempotent return differs:\n first: %+v\nsecond: %+v", first, second)
	}

	// 幂等键同样幂等。
	key := "selfcheck-key-1"
	third, err := CreateCheckout(ctx, db, newReq(now, selfOrderPrefix+"idemkey", 100, &key))
	if err != nil {
		t.Fatalf("create with key: %v", err)
	}
	replay, err := CreateCheckout(ctx, db, newReq(later, selfOrderPrefix+"idemkey", 100, &key))
	if err != nil {
		t.Fatalf("replay with key: %v", err)
	}
	if replay != third {
		t.Fatalf("key replay differs:\n third: %+v\nreplay: %+v", third, replay)
	}
}

// 幂等键撞到别人的订单：必须拒绝，不能把别人的收银台返回出去。
func TestSelfCheckIdempotencyKeyBoundToOtherOrder(t *testing.T) {
	db := openTestDB(t)
	ctx := context.Background()
	now := selfNow()
	key := "selfcheck-key-shared"

	if _, err := CreateCheckout(ctx, db, newReq(now, selfOrderPrefix+"owner", 100, &key)); err != nil {
		t.Fatalf("create owner: %v", err)
	}
	_, err := CreateCheckout(ctx, db, newReq(now, selfOrderPrefix+"thief", 100, &key))
	if err == nil {
		t.Fatal("reusing another order's idempotency key must fail")
	}
	checkoutErr, ok := err.(*Error)
	if !ok || checkoutErr.Code != "ORDER_EXISTS" {
		t.Fatalf("want ORDER_EXISTS, got %v", err)
	}
}

// 不同订单在同一基础金额下必须拿到不同尾数（尾数唯一约束的直接体现）。
func TestSelfCheckTailUniqueAcrossOrders(t *testing.T) {
	db := openTestDB(t)
	ctx := context.Background()
	now := selfNow()

	seen := map[int64]string{}
	for i := 0; i < 8; i++ {
		ordernum := fmt.Sprintf("%stail-%d", selfOrderPrefix, i)
		data, err := CreateCheckout(ctx, db, newReq(now, ordernum, 500, nil))
		if err != nil {
			t.Fatalf("create %d: %v", i, err)
		}
		if previous, exists := seen[data.PayableMicro]; exists {
			t.Fatalf("%s and %s share payable %d", previous, ordernum, data.PayableMicro)
		}
		seen[data.PayableMicro] = ordernum
	}
}

// 并发下单：12 个订单必须全部成功且尾数互不相同。
func TestSelfCheckConcurrentAllocation(t *testing.T) {
	db := openTestDB(t)
	ctx := context.Background()
	now := selfNow()
	const workers = 12

	results := make([]Data, workers)
	errs := make([]error, workers)
	var wg sync.WaitGroup
	for i := 0; i < workers; i++ {
		wg.Add(1)
		go func(index int) {
			defer wg.Done()
			ordernum := fmt.Sprintf("%srace-%d", selfOrderPrefix, index)
			results[index], errs[index] = CreateCheckout(ctx, db, newReq(now, ordernum, 700, nil))
		}(i)
	}
	wg.Wait()

	seen := map[int64]string{}
	for i, err := range errs {
		if err != nil {
			t.Fatalf("worker %d failed: %v", i, err)
		}
		if previous, exists := seen[results[i].PayableMicro]; exists {
			t.Fatalf("workers %s and worker %d share payable %d", previous, i, results[i].PayableMicro)
		}
		seen[results[i].PayableMicro] = fmt.Sprintf("worker-%d", i)
	}
}

// 过期行必须被复用（同一 id 换新尾数、续期），而不是新建一行。
func TestSelfCheckReuseExpiredRow(t *testing.T) {
	db := openTestDB(t)
	ctx := context.Background()
	now := selfNow()
	ordernum := selfOrderPrefix + "reuse"

	base, err := BaseMicro(100, selfRate)
	if err != nil {
		t.Fatalf("base: %v", err)
	}
	res, err := db.Exec(
		"INSERT INTO fbs_charge (ordernum, php_centavos, tail_cents, payable_micro, rate_str, rate_at, state, expires_at, holds_tail) "+
			"VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, 1)",
		ordernum, 100, 3, base+3*TailUnitMicro, selfRate, SqlTime(now.Add(-time.Hour)), SqlTime(now.Add(-time.Minute)))
	if err != nil {
		t.Fatalf("seed expired row: %v", err)
	}
	id, _ := res.LastInsertId()

	data, err := CreateCheckout(ctx, db, newReq(now, ordernum, 100, nil))
	if err != nil {
		t.Fatalf("reuse: %v", err)
	}
	if data.ExpiresAt != "2026-11-06T12:15:00Z" {
		t.Fatalf("expires_at not renewed: %+v", data)
	}
	var (
		rows   int
		state  string
		rawExp any // 不直接扫进 string：DATETIME 的 Go 形态由 DSN 的 parseTime 决定
	)
	if err := db.QueryRow("SELECT COUNT(*), MAX(state), MAX(expires_at) FROM fbs_charge WHERE ordernum = ?", ordernum).
		Scan(&rows, &state, &rawExp); err != nil {
		t.Fatalf("inspect: %v", err)
	}
	expAt := dbTimeText(t, rawExp)
	if rows != 1 || state != "pending" || expAt != SqlTime(now.Add(Window)) {
		t.Fatalf("reuse should update in place: rows=%d state=%s exp=%s", rows, state, expAt)
	}
	var actualID int64
	if err := db.QueryRow("SELECT id FROM fbs_charge WHERE ordernum = ?", ordernum).Scan(&actualID); err != nil {
		t.Fatalf("id: %v", err)
	}
	if actualID != id {
		t.Fatalf("row was recreated instead of reused: %d -> %d", id, actualID)
	}
}

// 资金终态（matched / void）绝不允许被覆盖重建——否则等于重复收款。
func TestSelfCheckTerminalStateRejected(t *testing.T) {
	db := openTestDB(t)
	ctx := context.Background()
	now := selfNow()

	for _, state := range []string{"matched", "void"} {
		ordernum := selfOrderPrefix + "final-" + state
		if _, err := db.Exec(
			"INSERT INTO fbs_charge (ordernum, php_centavos, tail_cents, payable_micro, rate_str, rate_at, state, expires_at, holds_tail) "+
				"VALUES (?, 100, 2, 100000, ?, ?, ?, ?, 0)",
			ordernum, selfRate, SqlTime(now.Add(-time.Minute)), state, SqlTime(now.Add(-time.Second))); err != nil {
			t.Fatalf("seed %s: %v", state, err)
		}
		_, err := CreateCheckout(ctx, db, newReq(now, ordernum, 100, nil))
		if err == nil {
			t.Fatalf("%s must not be rebuilt", state)
		}
		if checkoutErr, ok := err.(*Error); !ok || checkoutErr.Code != "ORDER_EXISTS" {
			t.Fatalf("%s: want ORDER_EXISTS, got %v", state, err)
		}
	}
}

// 90 个尾数全被占：返回 TAIL_EXHAUSTED，而不是死循环。
func TestSelfCheckTailExhausted(t *testing.T) {
	db := openTestDB(t)
	ctx := context.Background()
	now := selfNow()
	centavos := int64(12345)

	base, err := BaseMicro(centavos, selfRate)
	if err != nil {
		t.Fatalf("base: %v", err)
	}
	for tail := TailMin; tail <= TailMax; tail++ {
		ordernum := fmt.Sprintf("%sexhaust-%d", selfOrderPrefix, tail)
		if _, err := db.Exec(
			"INSERT INTO fbs_charge (ordernum, php_centavos, tail_cents, payable_micro, rate_str, rate_at, state, expires_at, holds_tail) "+
				"VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, 1)",
			ordernum, centavos, tail, base+int64(tail)*TailUnitMicro, selfRate,
			SqlTime(now), SqlTime(now.Add(Window))); err != nil {
			t.Fatalf("seed tail %d: %v", tail, err)
		}
	}

	_, err = CreateCheckout(ctx, db, newReq(now, selfOrderPrefix+"exhaust-new", centavos, nil))
	if err == nil {
		t.Fatal("all tails occupied should fail")
	}
	if checkoutErr, ok := err.(*Error); !ok || checkoutErr.Code != "TAIL_EXHAUSTED" {
		t.Fatalf("want TAIL_EXHAUSTED, got %v", err)
	}
}

// 汇率过期 / 未来时间必须 RATE_STALE。
func TestSelfCheckRateFreshness(t *testing.T) {
	db := openTestDB(t)
	ctx := context.Background()
	now := selfNow()

	stale := newReq(now, selfOrderPrefix+"stale", 100, nil)
	stale.GetRate = func(context.Context) (Rate, error) {
		return Rate{RateStr: selfRate, RateAt: now.Add(-RateMaxAge - time.Second)}, nil
	}
	if _, err := CreateCheckout(ctx, db, stale); err == nil {
		t.Fatal("stale rate must be rejected")
	} else if checkoutErr, ok := err.(*Error); !ok || checkoutErr.Code != "RATE_STALE" {
		t.Fatalf("want RATE_STALE, got %v", err)
	}

	future := newReq(now, selfOrderPrefix+"future", 100, nil)
	future.GetRate = func(context.Context) (Rate, error) {
		return Rate{RateStr: selfRate, RateAt: now.Add(RateFutureTolerance + time.Second)}, nil
	}
	if _, err := CreateCheckout(ctx, db, future); err == nil {
		t.Fatal("future rate must be rejected")
	} else if checkoutErr, ok := err.(*Error); !ok || checkoutErr.Code != "RATE_STALE" {
		t.Fatalf("want RATE_STALE, got %v", err)
	}

	// 汇率源直接报错 → RATE_UNAVAILABLE（可重试，不占尾数）。
	broken := newReq(now, selfOrderPrefix+"broken", 100, nil)
	broken.GetRate = func(context.Context) (Rate, error) { return Rate{}, fmt.Errorf("boom") }
	if _, err := CreateCheckout(ctx, db, broken); err == nil {
		t.Fatal("rate source failure must be rejected")
	} else if checkoutErr, ok := err.(*Error); !ok || checkoutErr.Code != "RATE_UNAVAILABLE" {
		t.Fatalf("want RATE_UNAVAILABLE, got %v", err)
	}

	// 非法 ordernum / 金额在取价之前就该被拒。
	if _, err := CreateCheckout(ctx, db, newReq(now, "bad order", 100, nil)); err == nil {
		t.Fatal("unsafe ordernum must be rejected")
	} else if checkoutErr, ok := err.(*Error); !ok || checkoutErr.Code != "BAD_REQUEST" {
		t.Fatalf("want BAD_REQUEST, got %v", err)
	}
	if _, err := CreateCheckout(ctx, db, newReq(now, selfOrderPrefix+"zero", 0, nil)); err == nil {
		t.Fatal("zero amount must be rejected")
	}
}
