// 逐条翻译自 services/api/test/pay-order-read.test.js（5 条，全部 BEHAVIOR）。
//
// Node 用 fakeConn 按 SQL 前缀返回预置行；Go 用 go-sqlmock 精确匹配「只读 SELECT」，
// 并用 WithArgs 断言 ordernum / tg_user_id 走绑定参数（前缀只允许白名单字符）。
package order

import (
	"context"
	"database/sql"
	"errors"
	"regexp"
	"strings"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
)

// ttPayOrderSQL 与实现必须逐字一致：只读、带前缀反引号、ordernum 绑定参数。
func ttPayOrderSQL(prefix string) string {
	return "SELECT amount, uid, state FROM `" + prefix + "pay_log` WHERE ordernum = ? ORDER BY id DESC LIMIT 1"
}

const ttOwnershipSQL = "SELECT member_id FROM fbs_member_map WHERE tg_user_id = ? LIMIT 1"

func ttMock(t *testing.T) (*sql.DB, sqlmock.Sqlmock) {
	t.Helper()
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("创建 sqlmock 失败: %v", err)
	}
	t.Cleanup(func() {
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("SQL 期望未满足: %v", err)
		}
		_ = db.Close()
	})
	return db, mock
}

// ttCode 断言错误是 *OrderError 且码值匹配。
func ttCode(t *testing.T, err error, want string) {
	t.Helper()
	var orderErr *OrderError
	if !errors.As(err, &orderErr) {
		t.Fatalf("期望 *OrderError(%s)，实际 %v", want, err)
	}
	if orderErr.Code != want {
		t.Fatalf("错误码应为 %s，实际 %s", want, orderErr.Code)
	}
}

func TestPayOrderRead(t *testing.T) {
	ctx := context.Background()

	t.Run("centavosFromDecimal：decimal(8,2) 文本 → 整数 centavos，无浮点误差", func(t *testing.T) {
		for input, want := range map[string]int64{
			"125.00":    12500,
			"0.01":      1,
			"999999.99": 99999999,
		} {
			got, err := CentavosFromDecimal(input)
			if err != nil || got != want {
				t.Fatalf("%q 应换算为 %d，实际 %d / %v", input, want, got, err)
			}
		}
		for _, bad := range []string{"125", "125.0", "125.000", "-1.00", "abc"} {
			if _, err := CentavosFromDecimal(bad); err == nil {
				t.Fatalf("%q 应被拒绝", bad)
			} else {
				ttCode(t, err, CodeInvalid)
			}
		}
	})

	t.Run("readPayOrder：待支付订单返回金额（centavos）与火鸟会员 id", func(t *testing.T) {
		db, mock := ttMock(t)
		mock.ExpectQuery(regexp.QuoteMeta(ttPayOrderSQL("huoniao_"))).
			WithArgs("ORD1").
			WillReturnRows(sqlmock.NewRows([]string{"amount", "uid", "state"}).AddRow("125.00", 4242, "0"))

		centavos, memberID, err := ReadPayOrder(ctx, db, "ORD1", "huoniao_")
		if err != nil {
			t.Fatalf("读取待支付订单应成功，实际 %v", err)
		}
		if centavos != 12500 {
			t.Fatalf("centavos 应为 12500，实际 %d", centavos)
		}
		if memberID != 4242 {
			t.Fatalf("memberId 应为 4242，实际 %d", memberID)
		}
	})

	t.Run("readPayOrder：SQL 只读、表名带前缀、ordernum 白名单校验", func(t *testing.T) {
		db, mock := ttMock(t)
		// 期望本身就是断言：SQL 必须以 SELECT 开头、只查带前缀的 pay_log、ordernum 走占位符。
		mock.ExpectQuery(`^SELECT amount, uid, state FROM ` + "`" + `hs_pay_log` + "`" +
			` WHERE ordernum = \? ORDER BY id DESC LIMIT 1$`).
			WithArgs("ORD-9_x").
			WillReturnRows(sqlmock.NewRows([]string{"amount", "uid", "state"}).AddRow("1.00", 2, "0"))

		if _, _, err := ReadPayOrder(ctx, db, "ORD-9_x", "hs_"); err != nil {
			t.Fatalf("合法 ordernum 应可读取，实际 %v", err)
		}

		for _, bad := range []string{"ORD'1", "ORD 1", ";DROP", "", strings.Repeat("x", 65)} {
			if _, _, err := ReadPayOrder(ctx, db, bad, "hs_"); err == nil {
				t.Fatalf("非法 ordernum %q 应被拒绝", bad)
			} else {
				ttCode(t, err, CodeBadRequest)
			}
		}

		if _, _, err := ReadPayOrder(ctx, db, "ORD1", "bad;prefix"); err == nil {
			t.Fatal("非法表前缀必须被拒绝")
		} else {
			ttCode(t, err, CodeInvalid)
		}
		// 非法输入一律在碰数据库之前拒绝：上面只声明了一条期望，且已在上半段消耗完。
	})

	t.Run("readPayOrder：订单不存在 / 已支付 / uid 非法分别拒绝", func(t *testing.T) {
		db, mock := ttMock(t)
		mock.ExpectQuery(regexp.QuoteMeta(ttPayOrderSQL("huoniao_"))).
			WithArgs("ORD1").
			WillReturnError(sql.ErrNoRows)
		if _, _, err := ReadPayOrder(ctx, db, "ORD1", "huoniao_"); err == nil {
			t.Fatal("订单不存在必须被拒绝")
		} else {
			ttCode(t, err, CodeNotFound)
		}
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("订单不存在用例的 SQL 期望未满足: %v", err)
		}

		db2, mock2 := ttMock(t)
		mock2.ExpectQuery(regexp.QuoteMeta(ttPayOrderSQL("huoniao_"))).
			WithArgs("ORD1").
			WillReturnRows(sqlmock.NewRows([]string{"amount", "uid", "state"}).AddRow("125.00", 4242, "1"))
		if _, _, err := ReadPayOrder(ctx, db2, "ORD1", "huoniao_"); err == nil {
			t.Fatal("已支付订单必须被拒绝")
		} else {
			ttCode(t, err, CodeNotPayable)
		}

		db3, mock3 := ttMock(t)
		mock3.ExpectQuery(regexp.QuoteMeta(ttPayOrderSQL("huoniao_"))).
			WithArgs("ORD1").
			WillReturnRows(sqlmock.NewRows([]string{"amount", "uid", "state"}).AddRow("125.00", 0, "0"))
		if _, _, err := ReadPayOrder(ctx, db3, "ORD1", "huoniao_"); err == nil {
			t.Fatal("uid 非法必须被拒绝")
		} else {
			ttCode(t, err, CodeInvalid)
		}
	})

	t.Run("assertOwnership：fbs_member_map 命中订单 uid 才放行", func(t *testing.T) {
		db, mock := ttMock(t)
		mock.ExpectQuery(regexp.QuoteMeta(ttOwnershipSQL)).
			WithArgs("100200").
			WillReturnRows(sqlmock.NewRows([]string{"member_id"}).AddRow(4242))
		if err := AssertOwnership(ctx, db, "100200", 4242); err != nil {
			t.Fatalf("归属匹配应放行，实际 %v", err)
		}

		db2, mock2 := ttMock(t)
		mock2.ExpectQuery(regexp.QuoteMeta(ttOwnershipSQL)).
			WithArgs("100200").
			WillReturnRows(sqlmock.NewRows([]string{"member_id"}).AddRow(9999))
		if err := AssertOwnership(ctx, db2, "100200", 4242); err == nil {
			t.Fatal("归属不匹配必须拒绝")
		} else {
			ttCode(t, err, CodeForbidden)
		}

		db3, mock3 := ttMock(t)
		mock3.ExpectQuery(regexp.QuoteMeta(ttOwnershipSQL)).
			WithArgs("100200").
			WillReturnError(sql.ErrNoRows)
		if err := AssertOwnership(ctx, db3, "100200", 4242); err == nil {
			t.Fatal("无映射必须拒绝")
		} else {
			ttCode(t, err, CodeForbidden)
		}

		db4, _ := ttMock(t)
		// 非法 tg_user_id 必须在查库之前被拒绝（无任何期望）。
		if err := AssertOwnership(ctx, db4, "x;1", 4242); err == nil {
			t.Fatal("非法 tg_user_id 必须拒绝")
		} else {
			ttCode(t, err, CodeUnauthorized)
		}
	})
}
