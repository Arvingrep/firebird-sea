// 逐条翻译自 services/api/test/migrate.test.js（4 条 + 1 条真实库集成）。
//
// Node 用 fakeConn 记录 SQL；Go 用 go-sqlmock 精确匹配「建记录表 → 查已应用 → 逐语句执行 → 参数化记账」
// 的完整序列，因此「第二次运行零迁移」是硬断言而不是靠日志观察。
package migrate

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	_ "github.com/go-sql-driver/mysql"
)

// ttDir 是 Node 侧同一份迁移目录（只读引用，Go 侧不复制一份以免两处漂移）。
const ttDir = "../../../api/migrations"

// ttAD5Tables 对应 Node 的 TABLES 常量加上共享状态表与地址分享表。
var ttAD5Tables = []string{
	"fbs_charge", "fbs_chain_tx", "fbs_cursor", "fbs_refund", "fbs_audit",
	"fbs_role", "fbs_member_map", "fbs_draft_item", "fbs_i18n", "fbs_outbox",
	"fbs_token_revoked", "fbs_idem", "fbs_replay", "fbs_addr_share",
}

func ttLoad(t *testing.T) []Migration {
	t.Helper()
	migrations, err := Load(ttDir)
	if err != nil {
		t.Fatalf("读取迁移目录 %s 失败: %v", ttDir, err)
	}
	if len(migrations) == 0 {
		t.Fatalf("迁移目录 %s 下没有迁移文件", ttDir)
	}
	return migrations
}

func ttStatements(migrations []Migration) []string {
	var out []string
	for _, m := range migrations {
		out = append(out, splitStatements(m.SQL)...)
	}
	return out
}

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

// ttExpectEmptyRun 声明「空库首次执行」的全部期望。
func ttExpectEmptyRun(mock sqlmock.Sqlmock, migrations []Migration) {
	mock.ExpectExec(regexp.QuoteMeta(recordTableSQL)).WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectQuery(regexp.QuoteMeta("SELECT name FROM fbs_migrations")).
		WillReturnRows(sqlmock.NewRows([]string{"name"}))
	for _, m := range migrations {
		for _, statement := range splitStatements(m.SQL) {
			mock.ExpectExec(regexp.QuoteMeta(statement)).WillReturnResult(sqlmock.NewResult(0, 0))
		}
		mock.ExpectExec(regexp.QuoteMeta("INSERT INTO fbs_migrations (name) VALUES (?)")).
			WithArgs(m.Name).
			WillReturnResult(sqlmock.NewResult(0, 1))
	}
}

func TestMigrate(t *testing.T) {
	ctx := context.Background()

	t.Run("AC1: migration creates all AD-5 tables", func(t *testing.T) {
		db, mock := ttMock(t)
		migrations := ttLoad(t)
		ttExpectEmptyRun(mock, migrations)

		ran, err := Run(ctx, db, ttDir)
		if err != nil {
			t.Fatalf("空库迁移应成功，实际 %v", err)
		}
		want := []string{"001_fbs_tables.sql", "002_tma_shared_state.sql", "003_addr_share.sql"}
		if len(ran) != len(want) {
			t.Fatalf("应执行 %v，实际 %v", want, ran)
		}
		for i := range want {
			if ran[i] != want[i] {
				t.Fatalf("第 %d 个迁移应为 %s，实际 %s", i+1, want[i], ran[i])
			}
		}

		executed := strings.Join(ttStatements(migrations), "\n")
		for _, table := range ttAD5Tables {
			if !strings.Contains(executed, "CREATE TABLE IF NOT EXISTS "+table+" (") {
				t.Errorf("迁移缺少建表语句: %s", table)
			}
		}
	})

	t.Run("AC1: chain_tx unique (txid,event_index); charge holds_tail + tail unique; role shop_id not null", func(t *testing.T) {
		var builder strings.Builder
		for _, m := range ttLoad(t) {
			builder.WriteString(m.SQL)
			builder.WriteString("\n")
		}
		allSQL := builder.String()

		checks := []struct {
			name    string
			pattern string
		}{
			{"chain_tx 唯一键 (txid, event_index)", `UNIQUE KEY \w+ \(txid, event_index\)`},
			{"charge.holds_tail 可空", `holds_tail TINYINT NULL`},
			{"charge.tail_key 生成列", `tail_key BIGINT AS \(IF\(holds_tail = 1, payable_micro, NULL\)\) STORED`},
			{"charge.tail_key 唯一键", `UNIQUE KEY \w+ \(tail_key\)`},
			{"role.shop_id 非空默认 0", `shop_id BIGINT NOT NULL DEFAULT 0`},
		}
		for _, check := range checks {
			if !regexp.MustCompile(check.pattern).MatchString(allSQL) {
				t.Errorf("缺少约束：%s（pattern=%s）", check.name, check.pattern)
			}
		}
	})

	t.Run("AC2: second run applies nothing; migration has no destructive/DML statements", func(t *testing.T) {
		db, mock := ttMock(t)
		migrations := ttLoad(t)
		ttExpectEmptyRun(mock, migrations)
		if _, err := Run(ctx, db, ttDir); err != nil {
			t.Fatalf("首次迁移应成功，实际 %v", err)
		}

		// 第二次运行：只应发生「建记录表 + 查已应用列表」两次调用。
		applied := sqlmock.NewRows([]string{"name"})
		for _, m := range migrations {
			applied.AddRow(m.Name)
		}
		mock.ExpectExec(regexp.QuoteMeta(recordTableSQL)).WillReturnResult(sqlmock.NewResult(0, 0))
		mock.ExpectQuery(regexp.QuoteMeta("SELECT name FROM fbs_migrations")).WillReturnRows(applied)

		second, err := Run(ctx, db, ttDir)
		if err != nil {
			t.Fatalf("第二次迁移应成功，实际 %v", err)
		}
		if len(second) != 0 {
			t.Fatalf("第二次运行不应执行任何迁移，实际 %v", second)
		}

		// 只匹配语句起始的破坏性/DML 关键字，避免误伤列定义里的 ON UPDATE CURRENT_TIMESTAMP。
		var builder strings.Builder
		for _, m := range migrations {
			builder.WriteString(m.SQL)
			builder.WriteString("\n")
		}
		destructive := regexp.MustCompile(`(?im)^\s*(DROP|TRUNCATE|DELETE|INSERT|UPDATE)\b`)
		if match := destructive.FindString(builder.String()); match != "" {
			t.Fatalf("迁移文件不应含破坏性/DML 语句，实际命中 %q", match)
		}
	})

	t.Run("AC3: no mysql2 dependency; decision documented", func(t *testing.T) {
		for _, path := range []string{"../../go.mod", "../../go.sum"} {
			content, err := os.ReadFile(path)
			if err != nil {
				t.Fatalf("读取 %s 失败: %v", path, err)
			}
			if strings.Contains(string(content), "mysql2") {
				t.Fatalf("%s 不应引入 mysql2（Go 侧零 Node 驱动依赖）", path)
			}
		}

		// 决定记录在代码里：不开启 multiStatements，而是按分号拆分逐条 Exec。
		source, err := os.ReadFile("migrate.go")
		if err != nil {
			t.Fatalf("读取 migrate.go 失败: %v", err)
		}
		if strings.Contains(string(source), "multiStatements=true") {
			t.Fatal("不应开启 multiStatements（决定：按分号拆分逐条执行）")
		}

		doc, err := os.ReadFile(filepath.Join("..", "..", "..", "..", "docs", "internal", "DB_MIGRATIONS.md"))
		if err != nil {
			t.Fatalf("读取迁移文档失败: %v", err)
		}
		for _, want := range []string{"mysql2", "Zero-Dep"} {
			if !strings.Contains(string(doc), want) {
				t.Fatalf("迁移文档应记录依赖决定，缺少 %q", want)
			}
		}
	})

	t.Run("integration: real MariaDB migrate twice keeps data, constraints enforced", func(t *testing.T) {
		host, user, name := os.Getenv("DB_HOST"), os.Getenv("DB_USER"), os.Getenv("DB_NAME")
		if host == "" || user == "" || name == "" {
			t.Skip("DB_HOST/DB_USER/DB_NAME 缺失，跳过真实 MariaDB 集成测试")
		}
		port := os.Getenv("DB_PORT")
		if port == "" {
			port = "3306"
		}
		dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true&multiStatements=false",
			user, os.Getenv("DB_PASSWORD"), host, port, name)
		db, err := sql.Open("mysql", dsn)
		if err != nil {
			t.Fatalf("连接数据库失败: %v", err)
		}
		defer func() { _ = db.Close() }()
		if err := db.Ping(); err != nil {
			t.Fatalf("数据库不可用: %v", err)
		}

		if _, err := Run(ctx, db, ttDir); err != nil {
			t.Fatalf("首次迁移失败: %v", err)
		}
		if _, err := db.ExecContext(ctx,
			"INSERT INTO fbs_cursor (name, block_number) VALUES ('mig_test', 7) ON DUPLICATE KEY UPDATE block_number = 7"); err != nil {
			t.Fatalf("写入 cursor 失败: %v", err)
		}
		second, err := Run(ctx, db, ttDir)
		if err != nil {
			t.Fatalf("第二次迁移失败: %v", err)
		}
		if len(second) != 0 {
			t.Fatalf("第二次运行不应执行任何迁移，实际 %v", second)
		}
		var blockNumber int64
		if err := db.QueryRowContext(ctx,
			"SELECT block_number FROM fbs_cursor WHERE name = 'mig_test'").Scan(&blockNumber); err != nil {
			t.Fatalf("读取 cursor 失败: %v", err)
		}
		if blockNumber != 7 {
			t.Fatalf("迁移不应改动已有数据，block_number=%d", blockNumber)
		}

		txSQL := "INSERT INTO fbs_chain_tx (txid, event_index, from_address, to_address, contract, amount_micro, block_number, block_time) " +
			"VALUES ('mig_test_tx', 0, 'a', 'b', 'c', 1, 1, NOW())"
		chargeSQL := func(ordernum string, hold string) string {
			return "INSERT INTO fbs_charge (ordernum, php_centavos, tail_cents, payable_micro, rate_str, rate_at, expires_at, holds_tail) " +
				"VALUES ('" + ordernum + "', 100, 1, 424242, '58', NOW(), NOW(), " + hold + ")"
		}
		defer func() {
			_, _ = db.ExecContext(ctx, "DELETE FROM fbs_chain_tx WHERE txid = 'mig_test_tx'")
			_, _ = db.ExecContext(ctx, "DELETE FROM fbs_charge WHERE ordernum LIKE 'mig_test_%'")
			_, _ = db.ExecContext(ctx, "DELETE FROM fbs_cursor WHERE name = 'mig_test'")
		}()

		if _, err := db.ExecContext(ctx, txSQL); err != nil {
			t.Fatalf("写入 chain_tx 失败: %v", err)
		}
		if _, err := db.ExecContext(ctx, txSQL); err == nil {
			t.Fatal("(txid, event_index) 重复插入必须报错")
		}
		if _, err := db.ExecContext(ctx, chargeSQL("mig_test_o1", "1")); err != nil {
			t.Fatalf("写入 charge 失败: %v", err)
		}
		if _, err := db.ExecContext(ctx, chargeSQL("mig_test_o2", "1")); err == nil {
			t.Fatal("两笔 holds_tail=1 的相同 payable_micro 必须报错")
		}
		if _, err := db.ExecContext(ctx, chargeSQL("mig_test_o3", "NULL")); err != nil {
			t.Fatalf("holds_tail=NULL 不应受唯一约束限制: %v", err)
		}
	})
}
