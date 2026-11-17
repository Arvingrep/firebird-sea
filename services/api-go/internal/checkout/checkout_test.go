package checkout

import (
	"context"
	"database/sql"
	"errors"
	"regexp"
	"strings"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/go-sql-driver/mysql"
)

// 逐条翻译自 services/api/test/checkout.test.js（18 条）。
//
// 与 Node 版假 conn 的形态差异：Node 注入「返回 stdout 文本」的 cliConn，Go 侧用 sqlmock
// 精确匹配语句与绑定参数。sqlmock 默认带顺序校验，因此下面每个用例的期望顺序
// 就是实现的真实执行顺序：FindExisting → 事务外释放过期占用 → BEGIN → 扫占用区间 →
// INSERT/条件 UPDATE → （续期时）读回 → COMMIT。
//
// 尾数随机取值会让 INSERT 的 tail_cents / payable_micro 无法用 WithArgs 精确断言，
// 所以需要精确参数时先用「占用除目标尾数之外的全部尾数」把 PickTail 逼成唯一解。

const (
	addOrdernum = "ORD1"
	addAddress  = "TADDR"
	addRateStr  = "62.5"
)

// addNow 与 Node 的 NOW = Date.parse('2026-01-01T00:00:00Z') 对齐。
var addNow = time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)

const (
	sqlFindByOrdernum = "SELECT id, ordernum, payable_micro, rate_str, rate_at, expires_at, state FROM fbs_charge WHERE ordernum = ? LIMIT 1"
	sqlFindByEither   = "SELECT id, ordernum, payable_micro, rate_str, rate_at, expires_at, state FROM fbs_charge WHERE ordernum = ? OR idempotency_key = ? LIMIT 1"
	sqlReleaseExpired = "UPDATE fbs_charge SET state = 'expired', holds_tail = 0 WHERE state = 'pending' AND holds_tail = 1 AND expires_at <= ?"
	sqlScanOccupied   = "SELECT payable_micro FROM fbs_charge WHERE holds_tail = 1 AND payable_micro BETWEEN ? AND ?"
	sqlInsert         = "INSERT INTO fbs_charge (ordernum, idempotency_key, php_centavos, tail_cents, payable_micro, rate_str, rate_at, state, expires_at, holds_tail) " +
		"VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, 1)"
	sqlReuseUpdate = "UPDATE fbs_charge SET php_centavos = ?, tail_cents = ?, payable_micro = ?, rate_str = ?, rate_at = ?, expires_at = ?, " +
		"state = 'pending', holds_tail = 1, idempotency_key = ? WHERE id = ? AND state IN ('pending','expired')"
	sqlReadBack = "SELECT id, ordernum, payable_micro, rate_str, rate_at, expires_at, state FROM fbs_charge WHERE id = ?"
)

// 落库形态（秒精度、UTC、无 Z），与 SqlTime 一致。
const (
	rateAtSQL    = "2025-12-31 23:59:59"
	expiresAtSQL = "2026-01-01 00:15:00"
)

// freshRate 与 Node 的 fresh() 等价：rate_at = NOW - 1s。
func freshRate() Rate { return Rate{RateStr: addRateStr, RateAt: addNow.Add(-time.Second)} }

func newMock(t *testing.T) (*sql.DB, sqlmock.Sqlmock) {
	t.Helper()
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("sqlmock: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })
	return db, mock
}

func addReq() Req {
	return Req{
		Ordernum:       addOrdernum,
		ServerCentavos: 12500,
		GetRate:        func(context.Context) (Rate, error) { return freshRate(), nil },
		Address:        addAddress,
		Now:            func() time.Time { return addNow },
	}
}

// allTails 返回 1..90 的全部尾数。
func allTails() []int {
	out := make([]int, 0, TailMax)
	for tail := TailMin; tail <= TailMax; tail++ {
		out = append(out, tail)
	}
	return out
}

// tailsExcept 返回除排除项之外的全部尾数。
func tailsExcept(excluded ...int) []int {
	skip := make(map[int]bool, len(excluded))
	for _, tail := range excluded {
		skip[tail] = true
	}
	out := make([]int, 0, TailMax)
	for tail := TailMin; tail <= TailMax; tail++ {
		if !skip[tail] {
			out = append(out, tail)
		}
	}
	return out
}

// occupiedRows 构造「这些尾数已被占用」的扫描结果，payable = base + tail*1e4。
func occupiedRows(base int64, tails []int) *sqlmock.Rows {
	rows := sqlmock.NewRows([]string{"payable_micro"})
	for _, tail := range tails {
		rows.AddRow(base + int64(tail)*TailUnitMicro)
	}
	return rows
}

// rowOf 构造 FindExisting / 读回的一行。
func rowOf(id int64, ordernum string, payable int64, rateAt, expiresAt, state string) *sqlmock.Rows {
	return sqlmock.NewRows([]string{"id", "ordernum", "payable_micro", "rate_str", "rate_at", "expires_at", "state"}).
		AddRow(id, ordernum, payable, addRateStr, rateAt, expiresAt, state)
}

// expectFind 声明 FindExisting 的查询（无幂等键）。
func expectFind(mock sqlmock.Sqlmock, rows *sqlmock.Rows) {
	mock.ExpectQuery(regexp.QuoteMeta(sqlFindByOrdernum)).WithArgs(addOrdernum).WillReturnRows(rows)
}

// expectFindFor 是 expectFind 的可指定 ordernum 版本（限流用例要连打多个订单号）。
func expectFindFor(mock sqlmock.Sqlmock, ordernum string, rows *sqlmock.Rows) {
	mock.ExpectQuery(regexp.QuoteMeta(sqlFindByOrdernum)).WithArgs(ordernum).WillReturnRows(rows)
}

// expectReleaseAt 声明事务外的「释放过期占用」语句，now 是 NOW 的落库文本。
func expectReleaseAt(mock sqlmock.Sqlmock, now string) {
	mock.ExpectExec(regexp.QuoteMeta(sqlReleaseExpired)).
		WithArgs(now).
		WillReturnResult(sqlmock.NewResult(0, 1))
}

// expectAllocate 声明一次分配事务：扫占用 → INSERT → COMMIT。
func expectAllocate(mock sqlmock.Sqlmock, request Req, base int64, occupied *sqlmock.Rows, tail int, idem any) {
	payable := base + int64(tail)*TailUnitMicro
	mock.ExpectBegin()
	mock.ExpectQuery(regexp.QuoteMeta(sqlScanOccupied)).
		WithArgs(base+TailUnitMicro*TailMin, base+TailUnitMicro*TailMax).
		WillReturnRows(occupied)
	mock.ExpectExec(regexp.QuoteMeta(sqlInsert)).
		WithArgs(request.Ordernum, idem, request.ServerCentavos, tail, payable, addRateStr, rateAtSQL, expiresAtSQL).
		WillReturnResult(sqlmock.NewResult(1, 1))
	mock.ExpectCommit()
}

func mustCreate(t *testing.T, db *sql.DB, request Req) Data {
	t.Helper()
	data, err := CreateCheckout(context.Background(), db, request)
	if err != nil {
		t.Fatalf("CreateCheckout: %v", err)
	}
	return data
}

func wantCode(t *testing.T, err error, code string) {
	t.Helper()
	if err == nil {
		t.Fatalf("期望错误码 %s，实际成功", code)
	}
	var checkoutErr *Error
	if !errors.As(err, &checkoutErr) {
		t.Fatalf("期望 *checkout.Error，实际 %T: %v", err, err)
	}
	if checkoutErr.Code != code {
		t.Fatalf("期望错误码 %s，实际 %s（%s）", code, checkoutErr.Code, checkoutErr.Message)
	}
}

// TestCheckout 对应 checkout.test.js 的 18 条用例。
func TestCheckout(t *testing.T) {
	t.Run("AC1 应付金额 = ceil(centavos*1e4/rate) + tail*1e4，返回快照字段（rate_at 为落库秒精度）", func(t *testing.T) {
		if got, err := BaseMicro(12500, "62.5"); err != nil || got != 2000000 {
			t.Fatalf("BaseMicro(12500, 62.5) = %d, %v; want 2000000", got, err)
		}
		if got, err := BaseMicro(100, "62.88"); err != nil || got != 15904 {
			t.Fatalf("BaseMicro(100, 62.88) = %d, %v; want 15904", got, err)
		}

		db, mock := newMock(t)
		request := addReq()
		// 只留尾数 90：把随机取尾数逼成唯一解，才能精确断言绑定参数。
		const tail, payable = 90, 2000000 + 90*TailUnitMicro
		expectFind(mock, sqlmock.NewRows([]string{"id", "ordernum", "payable_micro", "rate_str", "rate_at", "expires_at", "state"}))
		expectReleaseAt(mock, "2026-01-01 00:00:00")
		expectAllocate(mock, request, 2000000, occupiedRows(2000000, tailsExcept(90)), tail, nil)

		data := mustCreate(t, db, request)
		if data.PayableMicro != payable {
			t.Fatalf("payable_micro = %d, want %d", data.PayableMicro, payable)
		}
		if diff := data.PayableMicro - 2000000; diff < TailUnitMicro || diff > 90*TailUnitMicro || diff%TailUnitMicro != 0 {
			t.Fatalf("尾数 %d 不在 1~90 个 cent 区间内", diff)
		}
		if data.RateStr != addRateStr {
			t.Fatalf("rate_str = %q", data.RateStr)
		}
		if data.RateAt != "2025-12-31T23:59:59Z" {
			t.Fatalf("rate_at = %q, want 2025-12-31T23:59:59Z（落库秒精度）", data.RateAt)
		}
		if data.ExpiresAt != "2026-01-01T00:15:00Z" {
			t.Fatalf("expires_at = %q", data.ExpiresAt)
		}
		if data.Address != addAddress {
			t.Fatalf("address = %q", data.Address)
		}
		// INSERT 里的 rate_at 必须是 DATETIME 形态（无 T 无 Z）。
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("未满足的 SQL 期望：%v", err)
		}
	})

	t.Run("金额必须来自服务端读数：非正整数或非法值直接 BAD_REQUEST（不接受客户端提交）", func(t *testing.T) {
		// Node 的 undefined/null/12.5/'12500'/1n 在 Go 侧由「int64 静态类型 + 显式 >0 校验」挡住：
		// 不可构造的值在编译期就被排除，可执行分支是 0 与负数。
		for _, bad := range []int64{0, -5} {
			db, mock := newMock(t)
			_, err := CreateCheckout(context.Background(), db, Req{Ordernum: addOrdernum, ServerCentavos: bad})
			wantCode(t, err, "BAD_REQUEST")
			if err := mock.ExpectationsWereMet(); err != nil {
				t.Fatalf("金额非法时不得触达数据库：%v", err)
			}
		}
	})

	t.Run("AC2 90 个尾数全被占用时拒绝并提示稍后再试", func(t *testing.T) {
		db, mock := newMock(t)
		request := addReq()
		expectFind(mock, sqlmock.NewRows([]string{"id", "ordernum", "payable_micro", "rate_str", "rate_at", "expires_at", "state"}))
		expectReleaseAt(mock, "2026-01-01 00:00:00")
		mock.ExpectBegin()
		mock.ExpectQuery(regexp.QuoteMeta(sqlScanOccupied)).
			WithArgs(2000000+TailUnitMicro*TailMin, 2000000+TailUnitMicro*TailMax).
			WillReturnRows(occupiedRows(2000000, allTails()))
		mock.ExpectRollback()

		_, err := CreateCheckout(context.Background(), db, request)
		wantCode(t, err, "TAIL_EXHAUSTED")
		var checkoutErr *Error
		_ = errors.As(err, &checkoutErr)
		if !strings.Contains(checkoutErr.Message, "稍后再试") {
			t.Fatalf("文案应提示稍后再试，实际 %q", checkoutErr.Message)
		}
		// 没有声明 INSERT 期望：一旦落库 sqlmock 就会报「未预期的调用」。
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("尾数耗尽时不得写库：%v", err)
		}
	})

	t.Run("AC3 汇率获取失败或快照超过 60 秒：不写库并返回明确错误", func(t *testing.T) {
		db, mock := newMock(t)
		expectFind(mock, sqlmock.NewRows([]string{"id", "ordernum", "payable_micro", "rate_str", "rate_at", "expires_at", "state"}))
		request := addReq()
		request.GetRate = func(context.Context) (Rate, error) { return Rate{}, errors.New("boom") }
		_, err := CreateCheckout(context.Background(), db, request)
		wantCode(t, err, "RATE_UNAVAILABLE")

		db2, mock2 := newMock(t)
		expectFind(mock2, sqlmock.NewRows([]string{"id", "ordernum", "payable_micro", "rate_str", "rate_at", "expires_at", "state"}))
		request2 := addReq()
		request2.GetRate = func(context.Context) (Rate, error) {
			return Rate{RateStr: addRateStr, RateAt: addNow.Add(-61 * time.Second)}, nil
		}
		_, err = CreateCheckout(context.Background(), db2, request2)
		wantCode(t, err, "RATE_STALE")

		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("汇率失败时不得写库：%v", err)
		}
		if err := mock2.ExpectationsWereMet(); err != nil {
			t.Fatalf("汇率过期时不得写库：%v", err)
		}
	})

	t.Run("AC4 并发算出相同 payable_micro：唯一约束拒绝一方，其重新分配尾数", func(t *testing.T) {
		db, mock := newMock(t)
		request := addReq()
		expectFind(mock, sqlmock.NewRows([]string{"id", "ordernum", "payable_micro", "rate_str", "rate_at", "expires_at", "state"}))
		expectReleaseAt(mock, "2026-01-01 00:00:00")

		// 第一轮：只剩尾数 90，落库撞唯一键（另一请求抢先）。
		mock.ExpectBegin()
		mock.ExpectQuery(regexp.QuoteMeta(sqlScanOccupied)).
			WithArgs(2000000+TailUnitMicro*TailMin, 2000000+TailUnitMicro*TailMax).
			WillReturnRows(occupiedRows(2000000, tailsExcept(90)))
		mock.ExpectExec(regexp.QuoteMeta(sqlInsert)).
			WithArgs(addOrdernum, nil, int64(12500), 90, 2000000+90*TailUnitMicro, addRateStr, rateAtSQL, expiresAtSQL).
			WillReturnError(&mysql.MySQLError{Number: 1062, Message: "Duplicate entry '2900000' for key 'uq_fbs_charge_tail'"})
		mock.ExpectRollback()

		// 第二轮：并发那条在两次尝试之间消失（只回 1..88），只剩尾数 89 —— 与首次不同的尾数。
		mock.ExpectBegin()
		mock.ExpectQuery(regexp.QuoteMeta(sqlScanOccupied)).
			WithArgs(2000000+TailUnitMicro*TailMin, 2000000+TailUnitMicro*TailMax).
			WillReturnRows(occupiedRows(2000000, tailsExcept(89, 90)))
		mock.ExpectExec(regexp.QuoteMeta(sqlInsert)).
			WithArgs(addOrdernum, nil, int64(12500), 89, 2000000+89*TailUnitMicro, addRateStr, rateAtSQL, expiresAtSQL).
			WillReturnResult(sqlmock.NewResult(1, 1))
		mock.ExpectCommit()

		data := mustCreate(t, db, request)
		// 两次 INSERT 的绑定参数不同（90 → 89）已由上面两条 WithArgs 精确钉住；
		// 返回值必须是被接受的那一次。
		if data.PayableMicro != 2000000+89*TailUnitMicro {
			t.Fatalf("payable_micro = %d, want %d（重新分配后的尾数）", data.PayableMicro, 2000000+89*TailUnitMicro)
		}
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("未满足的 SQL 期望：%v", err)
		}
	})

	t.Run("AC4 撞尾数的判定正则匹配真实 MariaDB 报错文本", func(t *testing.T) {
		// 真实 MariaDB 10.5 报错文本：
		//   "ERROR 1062 (23000) at line 1: Duplicate entry '424242' for key 'uq_fbs_charge_tail'"
		// Go 侧按 mysql.MySQLError.Number + Message 里的键名分类（比 Node 的整串正则更准）。
		db, mock := newMock(t)
		request := addReq()
		expectFind(mock, sqlmock.NewRows([]string{"id", "ordernum", "payable_micro", "rate_str", "rate_at", "expires_at", "state"}))
		expectReleaseAt(mock, "2026-01-01 00:00:00")

		mock.ExpectBegin()
		mock.ExpectQuery(regexp.QuoteMeta(sqlScanOccupied)).
			WithArgs(2000000+TailUnitMicro*TailMin, 2000000+TailUnitMicro*TailMax).
			WillReturnRows(occupiedRows(2000000, tailsExcept(90)))
		mock.ExpectExec(regexp.QuoteMeta(sqlInsert)).
			WithArgs(addOrdernum, nil, int64(12500), 90, 2000000+90*TailUnitMicro, addRateStr, rateAtSQL, expiresAtSQL).
			WillReturnError(&mysql.MySQLError{
				Number:  1062,
				Message: "Duplicate entry '424242' for key 'uq_fbs_charge_tail'",
			})
		mock.ExpectRollback()

		mock.ExpectBegin()
		mock.ExpectQuery(regexp.QuoteMeta(sqlScanOccupied)).
			WithArgs(2000000+TailUnitMicro*TailMin, 2000000+TailUnitMicro*TailMax).
			WillReturnRows(occupiedRows(2000000, tailsExcept(89, 90)))
		mock.ExpectExec(regexp.QuoteMeta(sqlInsert)).
			WithArgs(addOrdernum, nil, int64(12500), 89, 2000000+89*TailUnitMicro, addRateStr, rateAtSQL, expiresAtSQL).
			WillReturnResult(sqlmock.NewResult(1, 1))
		mock.ExpectCommit()

		data := mustCreate(t, db, request)
		if data.PayableMicro <= 2000000 {
			t.Fatalf("payable_micro = %d, want > 2000000", data.PayableMicro)
		}
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("未满足的 SQL 期望：%v", err)
		}
	})

	t.Run("AC4 跨基础金额占用同一 payable 区间：只剩一个尾数时仍分配成功", func(t *testing.T) {
		db, mock := newMock(t)
		request := addReq()
		expectFind(mock, sqlmock.NewRows([]string{"id", "ordernum", "payable_micro", "rate_str", "rate_at", "expires_at", "state"}))
		expectReleaseAt(mock, "2026-01-01 00:00:00")
		// 1..89 已被「别的基础金额」占满：实现按差值反推尾数，不依赖占用行的来源订单。
		expectAllocate(mock, request, 2000000, occupiedRows(2000000, tailsExcept(90)), 90, nil)

		data := mustCreate(t, db, request)
		if data.PayableMicro != 2000000+90*TailUnitMicro {
			t.Fatalf("payable_micro = %d, want %d", data.PayableMicro, 2000000+90*TailUnitMicro)
		}
	})

	t.Run("幂等：ordernum 重复且未过期时返回已有收银台，且不再取汇率", func(t *testing.T) {
		db, mock := newMock(t)
		expectFind(mock, rowOf(7, addOrdernum, 2310000, "2025-12-31 23:59:00", "2026-01-01 00:15:00", "pending"))

		rateCalls := 0
		request := addReq()
		// 汇率源整个不可用也必须返回已有的收银台：幂等判定发生在取汇率之前。
		// 否则一次行情抖动就会把「重复点击」变成用户可见的失败。
		request.GetRate = func(context.Context) (Rate, error) {
			rateCalls++
			return Rate{}, errors.New("rate source down")
		}
		data := mustCreate(t, db, request)
		if data.PayableMicro != 2310000 {
			t.Fatalf("payable_micro = %d, want 2310000", data.PayableMicro)
		}
		if data.RateAt != "2025-12-31T23:59:00Z" {
			t.Fatalf("rate_at = %q", data.RateAt)
		}
		if rateCalls != 0 {
			t.Fatalf("幂等命中时不得取汇率，实际调用 %d 次", rateCalls)
		}
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("幂等命中时只应有一次查询：%v", err)
		}
	})

	t.Run("幂等返回与首次创建的 rate_at 精度一致（均为落库秒精度）", func(t *testing.T) {
		db, mock := newMock(t)
		request := addReq()
		expectFind(mock, sqlmock.NewRows([]string{"id", "ordernum", "payable_micro", "rate_str", "rate_at", "expires_at", "state"}))
		expectReleaseAt(mock, "2026-01-01 00:00:00")
		expectAllocate(mock, request, 2000000, occupiedRows(2000000, tailsExcept(90)), 90, nil)
		created := mustCreate(t, db, request)

		// 把首次创建返回的 rate_at 按落库形态写回，再走一次幂等读取。
		storedRateAt := strings.Replace(strings.TrimSuffix(created.RateAt, "Z"), "T", " ", 1)
		db2, mock2 := newMock(t)
		expectFind(mock2, rowOf(7, addOrdernum, created.PayableMicro, storedRateAt, expiresAtSQL, "pending"))
		again := mustCreate(t, db2, request)

		if again.RateAt != created.RateAt {
			t.Fatalf("幂等返回的 rate_at = %q，首次为 %q（必须同为秒精度）", again.RateAt, created.RateAt)
		}
		if again.PayableMicro != created.PayableMicro {
			t.Fatalf("幂等返回的 payable_micro = %d，首次为 %d", again.PayableMicro, created.PayableMicro)
		}
	})

	t.Run("major 1：同 ordernum 过期后可复用旧行续期（UPDATE，不新增行）", func(t *testing.T) {
		db, mock := newMock(t)
		request := addReq()
		expectFind(mock, rowOf(7, addOrdernum, 2310000, "2025-12-31 23:00:00", "2025-12-31 23:15:00", "pending"))
		expectReleaseAt(mock, "2026-01-01 00:00:00")

		const payable = 2000000 + 90*TailUnitMicro
		mock.ExpectBegin()
		mock.ExpectQuery(regexp.QuoteMeta(sqlScanOccupied)).
			WithArgs(2000000+TailUnitMicro*TailMin, 2000000+TailUnitMicro*TailMax).
			WillReturnRows(occupiedRows(2000000, tailsExcept(90)))
		mock.ExpectExec(regexp.QuoteMeta(sqlReuseUpdate)).
			WithArgs(int64(12500), 90, payable, addRateStr, rateAtSQL, expiresAtSQL, nil, int64(7)).
			WillReturnResult(sqlmock.NewResult(0, 1))
		mock.ExpectQuery(regexp.QuoteMeta(sqlReadBack)).
			WithArgs(int64(7)).
			WillReturnRows(rowOf(7, addOrdernum, payable, rateAtSQL, expiresAtSQL, "pending"))
		mock.ExpectCommit()

		data := mustCreate(t, db, request)
		if data.PayableMicro != payable {
			t.Fatalf("payable_micro = %d, want %d", data.PayableMicro, payable)
		}
		if data.ExpiresAt != "2026-01-01T00:15:00Z" {
			t.Fatalf("expires_at = %q", data.ExpiresAt)
		}
		// 没有 INSERT 期望：续期不得新增行。
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("续期路径不得 INSERT：%v", err)
		}
	})

	t.Run("major 1：expired 状态旧行同样可复用", func(t *testing.T) {
		db, mock := newMock(t)
		request := addReq()
		expectFind(mock, rowOf(9, addOrdernum, 2310000, "2025-12-31 23:00:00", "2025-12-31 23:15:00", "expired"))
		expectReleaseAt(mock, "2026-01-01 00:00:00")

		const payable = 2000000 + 90*TailUnitMicro
		mock.ExpectBegin()
		mock.ExpectQuery(regexp.QuoteMeta(sqlScanOccupied)).
			WithArgs(2000000+TailUnitMicro*TailMin, 2000000+TailUnitMicro*TailMax).
			WillReturnRows(occupiedRows(2000000, tailsExcept(90)))
		mock.ExpectExec(regexp.QuoteMeta(sqlReuseUpdate)).
			WithArgs(int64(12500), 90, payable, addRateStr, rateAtSQL, expiresAtSQL, nil, int64(9)).
			WillReturnResult(sqlmock.NewResult(0, 1))
		mock.ExpectQuery(regexp.QuoteMeta(sqlReadBack)).
			WithArgs(int64(9)).
			WillReturnRows(rowOf(9, addOrdernum, payable, rateAtSQL, expiresAtSQL, "pending"))
		mock.ExpectCommit()

		data := mustCreate(t, db, request)
		if data.PayableMicro <= 2000000 {
			t.Fatalf("payable_micro = %d, want > 2000000", data.PayableMicro)
		}
	})

	t.Run("并发续期：读回发现另一请求后写 → 两个调用方都以库中同一 payable 为准", func(t *testing.T) {
		db, mock := newMock(t)
		request := addReq()
		expectFind(mock, rowOf(7, addOrdernum, 2310000, "2025-12-31 23:00:00", "2025-12-31 23:15:00", "pending"))
		expectReleaseAt(mock, "2026-01-01 00:00:00")

		const localPayable = 2000000 + 90*TailUnitMicro
		const winnerPayable = 2320000
		mock.ExpectBegin()
		mock.ExpectQuery(regexp.QuoteMeta(sqlScanOccupied)).
			WithArgs(2000000+TailUnitMicro*TailMin, 2000000+TailUnitMicro*TailMax).
			WillReturnRows(occupiedRows(2000000, tailsExcept(90)))
		mock.ExpectExec(regexp.QuoteMeta(sqlReuseUpdate)).
			WithArgs(int64(12500), 90, localPayable, addRateStr, rateAtSQL, expiresAtSQL, nil, int64(7)).
			WillReturnResult(sqlmock.NewResult(0, 1))
		// 读回时库里已是另一个请求写下的值（rate_at 也换成它的）。
		mock.ExpectQuery(regexp.QuoteMeta(sqlReadBack)).
			WithArgs(int64(7)).
			WillReturnRows(rowOf(7, addOrdernum, winnerPayable, "2025-12-31 23:59:59", "2026-01-01 00:14:59", "pending"))
		mock.ExpectCommit()

		data := mustCreate(t, db, request)
		if data.PayableMicro != winnerPayable {
			t.Fatalf("payable_micro = %d, want %d（必须返回库中现值而不是本地算出的金额）", data.PayableMicro, winnerPayable)
		}
		if data.ExpiresAt != "2026-01-01T00:14:59Z" {
			t.Fatalf("expires_at = %q（应取库中现值）", data.ExpiresAt)
		}
	})

	t.Run("major 2（第 6 轮）：续期 UPDATE 带 state 守卫，读回已是 matched 则拒绝覆盖", func(t *testing.T) {
		db, mock := newMock(t)
		request := addReq()
		expectFind(mock, rowOf(7, addOrdernum, 2310000, "2025-12-31 23:00:00", "2025-12-31 23:15:00", "pending"))
		expectReleaseAt(mock, "2026-01-01 00:00:00")

		const payable = 2000000 + 90*TailUnitMicro
		mock.ExpectBegin()
		mock.ExpectQuery(regexp.QuoteMeta(sqlScanOccupied)).
			WithArgs(2000000+TailUnitMicro*TailMin, 2000000+TailUnitMicro*TailMax).
			WillReturnRows(occupiedRows(2000000, tailsExcept(90)))
		// sqlReuseUpdate 的文本里已含 "AND state IN ('pending','expired')"，
		// 一旦实现去掉守卫，这条 QuoteMeta 精确匹配就会直接失败。
		mock.ExpectExec(regexp.QuoteMeta(sqlReuseUpdate)).
			WithArgs(int64(12500), 90, payable, addRateStr, rateAtSQL, expiresAtSQL, nil, int64(7)).
			WillReturnResult(sqlmock.NewResult(0, 1))
		mock.ExpectQuery(regexp.QuoteMeta(sqlReadBack)).
			WithArgs(int64(7)).
			WillReturnRows(rowOf(7, addOrdernum, 2310000, "2025-12-31 23:00:00", "2026-01-01 00:15:00", "matched"))
		mock.ExpectRollback()

		_, err := CreateCheckout(context.Background(), db, request)
		wantCode(t, err, "ORDER_EXISTS")
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("未满足的 SQL 期望：%v", err)
		}
	})

	t.Run("matched 终态不得复用重建（资金安全守卫）", func(t *testing.T) {
		db, mock := newMock(t)
		expectFind(mock, rowOf(7, addOrdernum, 2310000, "2025-12-31 23:00:00", "2026-01-01 00:15:00", "matched"))

		_, err := CreateCheckout(context.Background(), db, addReq())
		wantCode(t, err, "ORDER_EXISTS")
		var checkoutErr *Error
		_ = errors.As(err, &checkoutErr)
		if !strings.Contains(checkoutErr.Message, "状态不允许重建") {
			t.Fatalf("文案应说明状态不允许重建，实际 %q", checkoutErr.Message)
		}
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("终态行不得被更新或重建：%v", err)
		}
	})

	t.Run("rate_str 保留原始价格字符串（高精度小数）", func(t *testing.T) {
		got, err := BaseMicro(100, "0.00000001")
		if err != nil {
			t.Fatalf("BaseMicro: %v", err)
		}
		if got != 100000000000000 {
			t.Fatalf("BaseMicro(100, 0.00000001) = %d, want 100000000000000", got)
		}
	})

	t.Run("major 1（第 5 轮）：取尾数前先释放过期 pending 占用，再扫描占用区间", func(t *testing.T) {
		// sqlmock 默认顺序校验 + 下面的期望声明顺序，就是「释放语句必须先于占用扫描」
		// 这条断言的等价物：实现若把两步对调，mock 会直接报语句顺序不符。
		db, mock := newMock(t)
		request := addReq()
		expectFind(mock, sqlmock.NewRows([]string{"id", "ordernum", "payable_micro", "rate_str", "rate_at", "expires_at", "state"}))
		expectReleaseAt(mock, "2026-01-01 00:00:00")
		expectAllocate(mock, request, 2000000, occupiedRows(2000000, tailsExcept(90)), 90, nil)

		_ = mustCreate(t, db, request)
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("未满足的 SQL 期望：%v", err)
		}
	})

	t.Run("major 2（第 5 轮）：幂等键命中他人订单时拒绝，不返回他人收银台", func(t *testing.T) {
		db, mock := newMock(t)
		idem := "IDEM-B"
		mock.ExpectQuery(regexp.QuoteMeta(sqlFindByEither)).
			WithArgs(addOrdernum, idem).
			WillReturnRows(rowOf(7, "OTHER-ORD", 2310000, "2025-12-31 23:59:00", expiresAtSQL, "pending"))

		request := addReq()
		request.IdempotencyKey = &idem
		_, err := CreateCheckout(context.Background(), db, request)
		wantCode(t, err, "ORDER_EXISTS")
		var checkoutErr *Error
		_ = errors.As(err, &checkoutErr)
		if !strings.Contains(checkoutErr.Message, "其他订单") {
			t.Fatalf("文案应说明幂等键绑定了其他订单，实际 %q", checkoutErr.Message)
		}
		// 未声明任何 UPDATE / INSERT 期望：命中他人订单后既不能写也不能续期。
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("命中他人订单时不得写库：%v", err)
		}
	})

	t.Run("minor（第 5 轮）：rate_at 晚于当前时间（未来时间戳）按汇率过期处理", func(t *testing.T) {
		db, mock := newMock(t)
		expectFind(mock, sqlmock.NewRows([]string{"id", "ordernum", "payable_micro", "rate_str", "rate_at", "expires_at", "state"}))

		request := addReq()
		request.GetRate = func(context.Context) (Rate, error) {
			return Rate{RateStr: addRateStr, RateAt: addNow.Add(60 * time.Second)}, nil
		}
		_, err := CreateCheckout(context.Background(), db, request)
		wantCode(t, err, "RATE_STALE")
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("未来时间戳时不得写库：%v", err)
		}
	})
}
