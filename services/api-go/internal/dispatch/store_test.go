// Store 的生产实现（sqlStore）用例：证明四条 SQL 真的走 `?` 绑定参数，
// 且「撞唯一键」判的是驱动给的 1062 而不是匹配错误文案。
//
// 为什么单独一份：dispatch_test.go 注入的是内存 Store（为了让 591 行 Node 用例的翻译
// 保持可读、不依赖 sqlmock 的严格调用顺序——投递是异步的，多条投递并发时 SQL 顺序
// 本就不确定）。但那样一来「真实 SQL 是否参数化」就没人验了，所以这里用 sqlmock 补上。
package dispatch

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/go-sql-driver/mysql"
)

func newSQLStore(t *testing.T) (sqlStore, sqlmock.Sqlmock) {
	t.Helper()
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("sqlmock: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })
	return sqlStore{db: db}, mock
}

// TestSQLStoreUsesBoundParameters 钉住参数化：事件与两个 id 都必须是绑定参数，
// 不许拼进 SQL 文本（Node 靠白名单 + 数字保证安全，Go 侧不需要也不允许拼）。
func TestSQLStoreUsesBoundParameters(t *testing.T) {
	store, mock := newSQLStore(t)
	mock.ExpectExec("INSERT INTO fbs_dispatch_dedup").
		WithArgs("new_order", int64(1001), int64(9)).
		WillReturnResult(sqlmock.NewResult(0, 1))

	claimed, duplicate, err := store.Claim(context.Background(), "new_order", 1001, 9)
	if err != nil {
		t.Fatalf("Claim 不该报错: %v", err)
	}
	if !claimed || duplicate {
		t.Fatalf("插入成功应 claimed=true/duplicate=false，实得 claimed=%v duplicate=%v", claimed, duplicate)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("SQL 与绑定参数不符: %v", err)
	}

	// 释放同样必须是三元组绑定参数。
	mock.ExpectExec("DELETE FROM fbs_dispatch_dedup WHERE event = \\? AND order_id = \\? AND courier_id = \\?").
		WithArgs("new_order", int64(1001), int64(9)).
		WillReturnResult(sqlmock.NewResult(0, 1))
	if err := store.Release(context.Background(), "new_order", 1001, 9); err != nil {
		t.Fatalf("Release 不该报错: %v", err)
	}

	mock.ExpectExec("DELETE FROM fbs_dispatch_dedup WHERE created_at").
		WillReturnResult(sqlmock.NewResult(0, 3))
	if err := store.PruneExpired(context.Background()); err != nil {
		t.Fatalf("PruneExpired 不该报错: %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("SQL 与绑定参数不符: %v", err)
	}
}

// TestClaimMapsDuplicateKeyToDuplicate 是去重语义的核心：
// MySQL 1062（ER_DUP_ENTRY）→ duplicate=true 且 err=nil（Node 的 /duplicate/i 分支）。
// 包装一层 errors 也要认得（驱动/中间层加 wrapper 时不能失明）。
func TestClaimMapsDuplicateKeyToDuplicate(t *testing.T) {
	store, mock := newSQLStore(t)
	mock.ExpectExec("INSERT INTO fbs_dispatch_dedup").
		WillReturnError(&mysql.MySQLError{
			Number:   mysqlDuplicateEntry,
			Message:  "Duplicate entry 'new_order-1001-9' for key 'PRIMARY'",
			SQLState: [5]byte{'2', '3', '0', '0', '0'},
		})

	claimed, duplicate, err := store.Claim(context.Background(), "new_order", 1001, 9)
	if err != nil {
		t.Fatalf("撞唯一键不该当成错误返回: %v", err)
	}
	if claimed || !duplicate {
		t.Fatalf("撞唯一键应 claimed=false/duplicate=true，实得 claimed=%v duplicate=%v", claimed, duplicate)
	}

	// 包装一层：错误码判定必须穿透 wrapper。
	wrapped, wrappedMock := newSQLStore(t)
	wrappedMock.ExpectExec("INSERT INTO fbs_dispatch_dedup").
		WillReturnError(fmt.Errorf("driver wrapped: %w", &mysql.MySQLError{Number: mysqlDuplicateEntry}))
	if _, isDup, err := wrapped.Claim(context.Background(), "grab", 1, 2); err != nil || !isDup {
		t.Fatalf("包装后的 1062 也应判为 duplicate，实得 duplicate=%v err=%v", isDup, err)
	}
}

// TestClaimOtherErrorIsReported 对应 Node「去重占位写库异常（非 duplicate）→ 不阻断投递」：
// Store 把错误原样交出去，由 Route 决定「记日志 + 继续投递」（见 dispatch_test.go）。
func TestClaimOtherErrorIsReported(t *testing.T) {
	store, mock := newSQLStore(t)
	boom := errors.New("db boom: cannot connect")
	mock.ExpectExec("INSERT INTO fbs_dispatch_dedup").WillReturnError(boom)

	claimed, duplicate, err := store.Claim(context.Background(), "new_order", 1001, 9)
	if !errors.Is(err, boom) {
		t.Fatalf("非 1062 的错误必须原样返回，实得 %v", err)
	}
	if claimed || duplicate {
		t.Fatalf("失败时 claimed/duplicate 都应为 false，实得 %v/%v", claimed, duplicate)
	}
}

// TestTelegramUserReadsFirstInt 复刻 Node 的 firstInt 口径：
// 列是 VARCHAR(32)，按文本取「首行首整数前缀 + 安全正整数」，其余一律「未绑定」。
func TestTelegramUserReadsFirstInt(t *testing.T) {
	cases := map[string]struct {
		setup    func(sqlmock.Sqlmock)
		wantID   int64
		wantBind bool
	}{
		"正常数字": {
			setup: func(mock sqlmock.Sqlmock) {
				mock.ExpectQuery("SELECT tg_user_id FROM fbs_courier_map").WithArgs(int64(9)).
					WillReturnRows(sqlmock.NewRows([]string{"tg_user_id"}).AddRow("555000111"))
			},
			wantID:   testTGUser,
			wantBind: true,
		},
		"无行": {
			setup: func(mock sqlmock.Sqlmock) {
				mock.ExpectQuery("SELECT tg_user_id FROM fbs_courier_map").
					WillReturnRows(sqlmock.NewRows([]string{"tg_user_id"}))
			},
		},
		"NULL": {
			setup: func(mock sqlmock.Sqlmock) {
				mock.ExpectQuery("SELECT tg_user_id FROM fbs_courier_map").
					WillReturnRows(sqlmock.NewRows([]string{"tg_user_id"}).AddRow(nil))
			},
		},
		"非数字": {
			setup: func(mock sqlmock.Sqlmock) {
				mock.ExpectQuery("SELECT tg_user_id FROM fbs_courier_map").
					WillReturnRows(sqlmock.NewRows([]string{"tg_user_id"}).AddRow("abc"))
			},
		},
		"数字前缀（parseInt 语义）": {
			setup: func(mock sqlmock.Sqlmock) {
				mock.ExpectQuery("SELECT tg_user_id FROM fbs_courier_map").
					WillReturnRows(sqlmock.NewRows([]string{"tg_user_id"}).AddRow("555000111\n"))
			},
			wantID:   testTGUser,
			wantBind: true,
		},
	}
	for label, item := range cases {
		t.Run(label, func(t *testing.T) {
			store, mock := newSQLStore(t)
			item.setup(mock)
			tgUserID, bound, err := store.TelegramUser(context.Background(), 9)
			if err != nil {
				t.Fatalf("查询不该报错: %v", err)
			}
			if bound != item.wantBind {
				t.Fatalf("bound 应为 %v，实得 %v", item.wantBind, bound)
			}
			if tgUserID != item.wantID {
				t.Fatalf("tg_user_id 应为 %d，实得 %d", item.wantID, tgUserID)
			}
		})
	}
}

// TestTelegramUserQueryErrorIsReported 查询故障要能区分「未绑定」与「查询失败」
// （Node 两条日志不同：courier_map lookup failed vs skip: courier not bound）。
func TestTelegramUserQueryErrorIsReported(t *testing.T) {
	store, mock := newSQLStore(t)
	mock.ExpectQuery("SELECT tg_user_id FROM fbs_courier_map").WillReturnError(errors.New("connection refused"))

	if _, bound, err := store.TelegramUser(context.Background(), 9); err == nil || bound {
		t.Fatalf("查询故障应返回 err 且 bound=false，实得 bound=%v err=%v", bound, err)
	}
}

// TestNoDBStoreFailsEveryCall 钉住「没有连接池」时的降级形态：
// 四个方法都返回错误（Route 因此 202 + 异步失败落日志，而不是 503）。
func TestNoDBStoreFailsEveryCall(t *testing.T) {
	var store Store = noDBStore{}
	ctx := context.Background()

	if _, _, err := store.Claim(ctx, "new_order", 1, 2); !errors.Is(err, errNoDatabase) {
		t.Fatalf("Claim 应返回 errNoDatabase，实得 %v", err)
	}
	if err := store.Release(ctx, "new_order", 1, 2); !errors.Is(err, errNoDatabase) {
		t.Fatalf("Release 应返回 errNoDatabase，实得 %v", err)
	}
	if _, bound, err := store.TelegramUser(ctx, 2); !errors.Is(err, errNoDatabase) || bound {
		t.Fatalf("TelegramUser 应返回 errNoDatabase，实得 bound=%v err=%v", bound, err)
	}
	if err := store.PruneExpired(ctx); !errors.Is(err, errNoDatabase) {
		t.Fatalf("PruneExpired 应返回 errNoDatabase，实得 %v", err)
	}
}

// TestDedupHitEndToEndThroughSQL 把「1062 → dedup:true」接到处理器上跑一遍：
// store_test 里的 Claim 用例只证明 Store 认得 1062，dispatch_test 用的是内存 Store；
// 这条用 sqlmock 驱动**真实的** sqlStore，证明 Route 真的把它翻成 202 dedup:true 且不重发。
func TestDedupHitEndToEndThroughSQL(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("sqlmock: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })
	mock.ExpectExec("INSERT INTO fbs_dispatch_dedup").
		WithArgs("new_order", int64(1001), int64(9)).
		WillReturnError(&mysql.MySQLError{Number: mysqlDuplicateEntry, Message: "Duplicate entry 'x' for key 'PRIMARY'"})

	sends := 0
	route := New(Dep{
		Secret:      testSecret,
		BotToken:    testBotToken,
		DB:          db,
		Now:         func() time.Time { return testNow },
		Logf:        func(string) {},
		SendMessage: func(context.Context, Message) error { sends++; return nil },
		Gateway:     &fakeGateway{},
	})
	raw := []byte(`{"event":"new_order","order_id":1001,"courier_id":9}`)
	recorder := postSigned(t, route, testNow, raw)
	drainRoute(t, route)

	if recorder.Code != http.StatusAccepted {
		t.Fatalf("撞唯一键应 202，实得 %d（body=%s）", recorder.Code, recorder.Body.String())
	}
	var body acceptedBody
	if err := json.Unmarshal(recorder.Body.Bytes(), &body); err != nil {
		t.Fatalf("响应不是 JSON: %v", err)
	}
	if !body.Dedup {
		t.Fatalf("撞唯一键必须 dedup:true，实得 %+v", body)
	}
	if sends != 0 {
		t.Fatalf("dedup 命中不得重发，实得 %d 次", sends)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("SQL 期望未满足: %v", err)
	}
}

// 编译期确认两种实现都满足 Store（新增方法时两边都会红）。
var (
	_ Store = sqlStore{}
	_ Store = noDBStore{}
	_ Store = (*memStore)(nil)
)

// 避免 "database/sql" 只在类型断言里被用到而误删导入。
var _ = sql.ErrNoRows
