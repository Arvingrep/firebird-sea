// 逐条翻译自 services/api/test/shared-state.test.js（4 条，全部 BEHAVIOR）。
//
// Node 的第 3、4 条经 fbProxy 端到端验证幂等占位；Go 侧 fbProxy 属 B2 未建包，
// 因此落到本包的 IdemStore 三态契约上（new / pending / done回放 / abort后重试），
// 断言点保持不变：并发第二个请求得 pending、完成后再来拿到首次结果、业务失败可重试、
// 结果未知（不释放）则同键继续 pending。
package state

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"regexp"
	"strings"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/token"
)

const (
	ttInsertRevoked = "INSERT IGNORE INTO fbs_token_revoked (jti, exp) VALUES (?, ?)"
	ttSelectRevoked = "SELECT jti, exp FROM fbs_token_revoked WHERE exp > ?"
	ttDeleteRevoked = "DELETE FROM fbs_token_revoked WHERE exp <= ?"

	ttDeleteIdem = "DELETE FROM fbs_idem WHERE idem_key = ? AND expires_at <= ?"
	ttInsertIdem = "INSERT IGNORE INTO fbs_idem (idem_key, state, expires_at) VALUES (?, 'pending', ?)"
	ttSelectIdem = "SELECT state, response FROM fbs_idem WHERE idem_key = ? LIMIT 1"
	ttFinishIdem = "UPDATE fbs_idem SET state = 'done', response = ? WHERE idem_key = ?"
)

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

func TestSharedState(t *testing.T) {
	ctx := context.Background()

	t.Run("吊销跨副本生效：副本 A 登出，副本 B 刷新后拒绝该令牌", func(t *testing.T) {
		clock := time.Unix(1000, 0)
		now := func() time.Time { return clock }
		db, mock := ttMock(t)

		storeA := NewRevocationStore(RevocationDep{DB: db, Now: now})
		storeB := NewRevocationStore(RevocationDep{DB: db, Now: now})
		replicaA, err := token.NewService(token.Dep{
			Secret: "shared-secret-0123456", Env: "canary", Now: now, Revocation: storeA,
		})
		if err != nil {
			t.Fatalf("构造副本 A 失败: %v", err)
		}
		replicaB, err := token.NewService(token.Dep{
			Secret: "shared-secret-0123456", Env: "canary", Now: now, Revocation: storeB,
		})
		if err != nil {
			t.Fatalf("构造副本 B 失败: %v", err)
		}

		issued := replicaA.Issue(1, 2)
		if _, err := replicaB.Verify(issued.Token); err != nil {
			t.Fatalf("副本 B 应能验证新令牌，实际 %v", err)
		}

		// 吊销写库（INSERT IGNORE）由 mock 断言参数，jti 取自签发结果。
		mock.ExpectExec(regexp.QuoteMeta(ttInsertRevoked)).
			WithArgs(issued.JTI, issued.ExpiresAt).
			WillReturnResult(sqlmock.NewResult(0, 1))

		revoked, err := replicaA.RevokeAsync(ctx, issued.Token)
		if err != nil || !revoked {
			t.Fatalf("吊销应成功，实际 revoked=%v err=%v", revoked, err)
		}

		// 副本 B 尚未刷新本地快照：此时仍认为令牌可用（与 Node 一致）。
		if _, err := replicaB.Verify(issued.Token); err != nil {
			t.Fatalf("未刷新前副本 B 不应感知吊销，实际 %v", err)
		}

		mock.ExpectQuery(regexp.QuoteMeta(ttSelectRevoked)).
			WithArgs(clock.Unix()).
			WillReturnRows(sqlmock.NewRows([]string{"jti", "exp"}).AddRow(issued.JTI, issued.ExpiresAt))
		mock.ExpectExec(regexp.QuoteMeta(ttDeleteRevoked)).
			WithArgs(clock.Unix() - 60).
			WillReturnResult(sqlmock.NewResult(0, 0))

		if err := storeB.Refresh(ctx); err != nil {
			t.Fatalf("刷新吊销快照失败: %v", err)
		}
		if _, err := replicaB.Verify(issued.Token); !errors.Is(err, token.ErrRevoked) {
			t.Fatalf("刷新后应拒绝该令牌，实际 %v", err)
		}
	})

	t.Run("重放计数跨副本一致，且拒绝非法 hash", func(t *testing.T) {
		clock := time.Unix(1000, 0)
		now := func() time.Time { return clock }
		db, mock := ttMock(t)

		counterA := NewReplayCounter(ReplayDep{DB: db, Max: 2, TTL: 3600 * time.Second, Now: now})
		counterB := NewReplayCounter(ReplayDep{DB: db, Max: 2, TTL: 3600 * time.Second, Now: now})
		key := "h:" + strings.Repeat("a", 64)
		hash := strings.Repeat("a", 64)
		exp := clock.Unix() + 3600

		// 三个计数器事务：各自的 SQL 序列相同，参数与「读回的第几次」不同。
		expectCount := func(count int64) {
			mock.ExpectBegin()
			mock.ExpectExec(regexp.QuoteMeta("DELETE FROM fbs_replay WHERE expires_at <= ?")).
				WithArgs(clock.Unix()).
				WillReturnResult(sqlmock.NewResult(0, 0))
			mock.ExpectExec(regexp.QuoteMeta(
				"INSERT INTO fbs_replay (hash, cnt, expires_at) VALUES (?, 1, ?) ON DUPLICATE KEY UPDATE cnt = cnt + 1")).
				WithArgs(hash, exp).
				WillReturnResult(sqlmock.NewResult(0, 1))
			mock.ExpectQuery(regexp.QuoteMeta("SELECT cnt FROM fbs_replay WHERE hash = ?")).
				WithArgs(hash).
				WillReturnRows(sqlmock.NewRows([]string{"cnt"}).AddRow(count))
			mock.ExpectCommit()
		}

		expectCount(1)
		if allowed, err := counterA.Allow(ctx, key); err != nil || !allowed {
			t.Fatalf("副本 A 首次应放行，实际 %v / %v", allowed, err)
		}
		expectCount(2)
		if allowed, err := counterB.Allow(ctx, key); err != nil || !allowed {
			t.Fatalf("副本 B 第 2 次应放行（跨副本累计），实际 %v / %v", allowed, err)
		}
		expectCount(3)
		if allowed, err := counterA.Allow(ctx, key); err != nil || allowed {
			t.Fatalf("跨副本累计到第 3 次应拒绝，实际 %v / %v", allowed, err)
		}

		// 非法 hash 必须在碰数据库之前就被拒绝（无任何期望）。
		allowed, err := counterA.Allow(ctx, "h:x'; DROP TABLE fbs_replay;--")
		if allowed || err != nil {
			t.Fatalf("非法 hash 应直接拒绝且不查库，实际 %v / %v", allowed, err)
		}
	})

	t.Run("幂等占位：并发第二个请求得到 pending(409)，完成后重复请求回放首次结果", func(t *testing.T) {
		clock := time.Unix(1000, 0)
		now := func() time.Time { return clock }
		db, mock := ttMock(t)
		store := NewIdempotencyStore(IdempotencyDep{DB: db, Now: now})
		const key = "key-abcdefgh"
		exp := clock.Unix() + 600

		// 首次：占位成功（INSERT IGNORE 影响 1 行）→ new（上游可以执行）。
		mock.ExpectBegin()
		mock.ExpectExec(regexp.QuoteMeta(ttDeleteIdem)).
			WithArgs(key, clock.Unix()).
			WillReturnResult(sqlmock.NewResult(0, 0))
		mock.ExpectExec(regexp.QuoteMeta(ttInsertIdem)).
			WithArgs(key, exp).
			WillReturnResult(sqlmock.NewResult(0, 1))
		mock.ExpectCommit()

		first, err := store.Begin(ctx, key)
		if err != nil || first.Status != IdemNew {
			t.Fatalf("首次 Begin 应为 new，实际 %+v / %v", first, err)
		}

		// 并发的第二个请求：占位已被占用 → pending（路由层映射 409）。
		mock.ExpectBegin()
		mock.ExpectExec(regexp.QuoteMeta(ttDeleteIdem)).
			WithArgs(key, clock.Unix()).
			WillReturnResult(sqlmock.NewResult(0, 0))
		mock.ExpectExec(regexp.QuoteMeta(ttInsertIdem)).
			WithArgs(key, exp).
			WillReturnResult(sqlmock.NewResult(0, 0))
		mock.ExpectQuery(regexp.QuoteMeta(ttSelectIdem)).
			WithArgs(key).
			WillReturnRows(sqlmock.NewRows([]string{"state", "response"}).AddRow("pending", nil))
		mock.ExpectCommit()

		second, err := store.Begin(ctx, key)
		if err != nil || second.Status != IdemPending {
			t.Fatalf("并发第二个请求应为 pending，实际 %+v / %v", second, err)
		}

		// 上游完成：写入首次响应。
		upstream := map[string]any{"state": 100, "info": map[string]any{"ordernum": "O1"}}
		encoded, err := json.Marshal(upstream)
		if err != nil {
			t.Fatalf("序列化首次响应失败: %v", err)
		}
		mock.ExpectExec(regexp.QuoteMeta(ttFinishIdem)).
			WithArgs(string(encoded), key).
			WillReturnResult(sqlmock.NewResult(0, 1))
		if err := store.Finish(ctx, key, upstream); err != nil {
			t.Fatalf("Finish 失败: %v", err)
		}

		// 第三次：回放首次结果，不再打上游。
		mock.ExpectBegin()
		mock.ExpectExec(regexp.QuoteMeta(ttDeleteIdem)).
			WithArgs(key, clock.Unix()).
			WillReturnResult(sqlmock.NewResult(0, 0))
		mock.ExpectExec(regexp.QuoteMeta(ttInsertIdem)).
			WithArgs(key, exp).
			WillReturnResult(sqlmock.NewResult(0, 0))
		mock.ExpectQuery(regexp.QuoteMeta(ttSelectIdem)).
			WithArgs(key).
			WillReturnRows(sqlmock.NewRows([]string{"state", "response"}).AddRow("done", string(encoded)))
		mock.ExpectCommit()

		third, err := store.Begin(ctx, key)
		if err != nil {
			t.Fatalf("第三次 Begin 失败: %v", err)
		}
		if third.Status != IdemDone {
			t.Fatalf("完成后重复请求应回放，实际状态 %q", third.Status)
		}
		var replayed map[string]any
		if err := json.Unmarshal(third.Body, &replayed); err != nil {
			t.Fatalf("回放体应为 JSON: %v", err)
		}
		if state, _ := replayed["state"].(float64); state != 100 {
			t.Fatalf("回放体应等于首次响应，实际 %s", string(third.Body))
		}
	})

	t.Run("上游业务失败(state!=100)释放占位，同键可重试；网络超时结果未知，保留占位", func(t *testing.T) {
		ctx := context.Background()
		const key = "key-retry-1234"

		// 业务失败 → Abort 释放占位 → 同键可再次 begin 成 new（可重试）。
		retryStore := NewMemoryIdempotencyStore(MemoryIdempotencyDep{})
		if result, err := retryStore.Begin(ctx, key); err != nil || result.Status != IdemNew {
			t.Fatalf("首次 Begin 应为 new，实际 %+v / %v", result, err)
		}
		if err := retryStore.Abort(ctx, key); err != nil {
			t.Fatalf("Abort 失败: %v", err)
		}
		if result, err := retryStore.Begin(ctx, key); err != nil || result.Status != IdemNew {
			t.Fatalf("释放后同键应可重试（new），实际 %+v / %v", result, err)
		}

		// 结果未知（网络异常，不 Abort）→ 占位保留 → 同键仍是 pending。
		holdStore := NewMemoryIdempotencyStore(MemoryIdempotencyDep{})
		const downKey = "key-down-12345"
		if result, err := holdStore.Begin(ctx, downKey); err != nil || result.Status != IdemNew {
			t.Fatalf("首次 Begin 应为 new，实际 %+v / %v", result, err)
		}
		if result, err := holdStore.Begin(ctx, downKey); err != nil || result.Status != IdemPending {
			t.Fatalf("结果未知时占位应保留（pending），实际 %+v / %v", result, err)
		}
	})
}
