// 逐条翻译自 services/api/test/member-map.test.js 的 5 条 BEHAVIOR 用例
// （该文件第 6 条是对 webroot/api/fbs/index.php 的 PHP 源码静态断言，不在 Go 重写范围，未翻译）。
//
// Node 用 fakeConn 模拟 fbs_member_map / fbs_audit；Go 用 go-sqlmock 精确匹配 SQL 文本，
// 并用 WithArgs 断言「tg_user_id 走绑定参数」——这正是「SQL 全部参数化」要求的验证点。
package member

import (
	"context"
	"database/sql"
	"errors"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
)

const (
	ttSelectMapping = "SELECT member_id FROM fbs_member_map WHERE tg_user_id = ? LIMIT 1"
	ttInsertMapping = "INSERT IGNORE INTO fbs_member_map (tg_user_id, member_id) VALUES (?, ?)"
	ttInsertAudit   = "INSERT INTO fbs_audit (actor_role, actor_id, action, target, detail) " +
		"VALUES ('customer', ?, ?, ?, ?)"
)

// ttGateway 是 MemberGateway 的替身，记录调用次数与参数（对应 Node 的 gateway 对象）。
type ttGateway struct {
	calls  int
	params []map[string]any
	res    map[string]any
	err    error
}

func (g *ttGateway) MemberFindOrCreate(_ context.Context, params map[string]any) (map[string]any, error) {
	g.calls++
	g.params = append(g.params, params)
	if g.err != nil {
		return nil, g.err
	}
	return g.res, nil
}

func ttNewMock(t *testing.T) (*sql.DB, sqlmock.Sqlmock) {
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

func ttFoundMember(memberID int) map[string]any {
	return map[string]any{
		"state": 100,
		"info":  map[string]any{"member_id": memberID, "created": true},
	}
}

func TestMemberMap(t *testing.T) {
	t.Run("首次登录创建会员并写映射与审计", func(t *testing.T) {
		db, mock := ttNewMock(t)
		gateway := &ttGateway{res: ttFoundMember(9)}

		mock.ExpectQuery(regexp.QuoteMeta(ttSelectMapping)).
			WithArgs("42").
			WillReturnError(sql.ErrNoRows)
		mock.ExpectBegin()
		mock.ExpectExec(regexp.QuoteMeta(ttInsertMapping)).
			WithArgs("42", 9).
			WillReturnResult(sqlmock.NewResult(0, 1))
		mock.ExpectExec(regexp.QuoteMeta(ttInsertAudit)).
			WithArgs("42", "member_create", "member:9", "").
			WillReturnResult(sqlmock.NewResult(0, 1))
		mock.ExpectCommit()

		memberID, created, err := NewMap(Dep{DB: db, Gateway: gateway}).FindOrCreate(context.Background(), 42)
		if err != nil {
			t.Fatalf("首次登录应成功，实际 %v", err)
		}
		if memberID != 9 || !created {
			t.Fatalf("应返回 {memberId:9, created:true}，实际 {%d, %v}", memberID, created)
		}
		if gateway.calls != 1 {
			t.Fatalf("应调用网关 1 次，实际 %d", gateway.calls)
		}
		if got, _ := gateway.params[0]["tg_id"].(string); got != "42" {
			t.Fatalf("网关参数 tg_id 应为字符串 \"42\"，实际 %#v", gateway.params[0]["tg_id"])
		}
	})

	t.Run("已有映射再次登录不调用网关、不创建第二个会员", func(t *testing.T) {
		db, mock := ttNewMock(t)
		gateway := &ttGateway{err: errors.New("should not be called")}

		mock.ExpectQuery(regexp.QuoteMeta(ttSelectMapping)).
			WithArgs("42").
			WillReturnRows(sqlmock.NewRows([]string{"member_id"}).AddRow(9))

		memberID, created, err := NewMap(Dep{DB: db, Gateway: gateway}).FindOrCreate(context.Background(), 42)
		if err != nil {
			t.Fatalf("已有映射应直接返回，实际 %v", err)
		}
		if memberID != 9 || created {
			t.Fatalf("应返回 {memberId:9, created:false}，实际 {%d, %v}", memberID, created)
		}
		if gateway.calls != 0 {
			t.Fatalf("已有映射不得调用网关，实际 %d 次", gateway.calls)
		}
	})

	t.Run("并发重复登录：唯一约束兜底，只产生一条映射且返回同一会员", func(t *testing.T) {
		// Node 用 Promise.all 造并发；sqlmock 的期望队列对真并发不安全，
		// 因此用「第二个副本先查不到、INSERT IGNORE 影响 0 行、再回读既有映射」的
		// 确定性两阶段形式，断言点与 Node 一致：两个调用拿到同一 memberId，且只有一条映射。
		db, mock := ttNewMock(t)
		gateway := &ttGateway{res: ttFoundMember(9)}
		service := NewMap(Dep{DB: db, Gateway: gateway})
		ctx := context.Background()

		mock.ExpectQuery(regexp.QuoteMeta(ttSelectMapping)).
			WithArgs("42").
			WillReturnError(sql.ErrNoRows)
		mock.ExpectBegin()
		mock.ExpectExec(regexp.QuoteMeta(ttInsertMapping)).
			WithArgs("42", 9).
			WillReturnResult(sqlmock.NewResult(0, 1))
		mock.ExpectExec(regexp.QuoteMeta(ttInsertAudit)).
			WithArgs("42", "member_create", "member:9", "").
			WillReturnResult(sqlmock.NewResult(0, 1))
		mock.ExpectCommit()

		firstID, _, err := service.FindOrCreate(ctx, 42)
		if err != nil {
			t.Fatalf("第一个副本建号失败: %v", err)
		}

		// 第二个副本：自己的 lookup 还没看到对方的写入，走 INSERT IGNORE，被唯一约束挡下（0 行）。
		mock.ExpectQuery(regexp.QuoteMeta(ttSelectMapping)).
			WithArgs("42").
			WillReturnError(sql.ErrNoRows)
		mock.ExpectBegin()
		mock.ExpectExec(regexp.QuoteMeta(ttInsertMapping)).
			WithArgs("42", 9).
			WillReturnResult(sqlmock.NewResult(0, 0))
		mock.ExpectQuery(regexp.QuoteMeta(ttSelectMapping)).
			WithArgs("42").
			WillReturnRows(sqlmock.NewRows([]string{"member_id"}).AddRow(9))
		mock.ExpectExec(regexp.QuoteMeta(ttInsertAudit)).
			WithArgs("42", "member_create", "member:9", "").
			WillReturnResult(sqlmock.NewResult(0, 1))
		mock.ExpectCommit()

		secondID, _, err := service.FindOrCreate(ctx, 42)
		if err != nil {
			t.Fatalf("第二个副本建号失败: %v", err)
		}
		if firstID != 9 || secondID != 9 {
			t.Fatalf("两个调用应返回同一会员 9，实际 %d / %d", firstID, secondID)
		}
	})

	t.Run("网关失败或返回非法数据时抛错且不写映射", func(t *testing.T) {
		db, mock := ttNewMock(t)
		gateway := &ttGateway{res: map[string]any{"state": 500, "info": "create failed"}}

		mock.ExpectQuery(regexp.QuoteMeta(ttSelectMapping)).
			WithArgs("42").
			WillReturnError(sql.ErrNoRows)
		// 不期望任何 INSERT：期望队列里没有写语句，一旦落库就会报「调用未预期」。

		_, _, err := NewMap(Dep{DB: db, Gateway: gateway}).FindOrCreate(context.Background(), 42)
		if !errors.Is(err, ErrGatewayFailed) {
			t.Fatalf("网关失败应返回 ErrGatewayFailed，实际 %v", err)
		}
	})

	t.Run("非法 tg id 被拒绝（防 SQL 拼接）", func(t *testing.T) {
		// Node 的非法值里 "1' OR '1'='1" / 1.5 / NaN / null / undefined 在 Go 侧由
		// int64 静态类型直接挡住（无法构造），可执行的分支是负数与 0。
		db, mock := ttNewMock(t)
		service := NewMap(Dep{DB: db, Gateway: &ttGateway{res: ttFoundMember(9)}})
		for _, bad := range []int64{-1, 0} {
			if _, _, err := service.FindOrCreate(context.Background(), bad); !errors.Is(err, ErrInvalidTgID) {
				t.Fatalf("tg id %d 应被拒绝，实际 %v", bad, err)
			}
		}
		// 没有任何期望：非法 id 必须在碰数据库之前就被拦下。
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("非法 id 不应触达数据库: %v", err)
		}
	})
}
