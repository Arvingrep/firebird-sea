// 契约护栏（不是临时自检）：用例锁定迁移文件解析与执行顺序的语义。改实现前先看这里；
// 合并前不要按临时文件删。
package migrate

import (
	"strings"
	"testing"
)

func TestSelfCheckSplitStatements(t *testing.T) {
	script := "-- 头部注释\n" +
		"CREATE TABLE a (id INT) ENGINE=InnoDB;\n" +
		"# 井号注释\n" +
		"/* 块注释; 含分号 */\n" +
		"CREATE TABLE b (`name` VARCHAR(8) DEFAULT 'a;b');\n" +
		"\n" +
		"INSERT INTO b VALUES ('x\\'y;z');\n"

	statements := splitStatements(script)
	if len(statements) != 3 {
		t.Fatalf("want 3 statements, got %d: %#v", len(statements), statements)
	}
	if !strings.HasPrefix(statements[0], "CREATE TABLE a") {
		t.Fatalf("first statement: %q", statements[0])
	}
	if !strings.Contains(statements[1], "'a;b'") {
		t.Fatalf("semicolon inside quotes must be preserved: %q", statements[1])
	}
	if !strings.Contains(statements[2], `'x\'y;z'`) {
		t.Fatalf("escaped quote must be preserved: %q", statements[2])
	}
	for i, statement := range statements {
		if strings.Contains(statement, "--") || strings.Contains(statement, "#") || strings.Contains(statement, "/*") {
			t.Fatalf("statement %d still has comments: %q", i, statement)
		}
	}
}

func TestSelfCheckSplitEmptyScript(t *testing.T) {
	if got := splitStatements("-- nothing\n"); len(got) != 0 {
		t.Fatalf("comment-only script should yield nothing, got %#v", got)
	}
	if got := splitStatements(""); len(got) != 0 {
		t.Fatalf("empty script should yield nothing, got %#v", got)
	}
}

func TestSelfCheckLoadRealMigrations(t *testing.T) {
	// 相对路径按包目录解析：internal/migrate → services/api/migrations
	migrations, err := Load("../../../api/migrations")
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if len(migrations) != 3 {
		t.Fatalf("want 3 migration files, got %d", len(migrations))
	}
	wantOrder := []string{"001_fbs_tables.sql", "002_tma_shared_state.sql", "003_addr_share.sql"}
	for i, want := range wantOrder {
		if migrations[i].Name != want {
			t.Fatalf("order: want %q at %d, got %q", want, i, migrations[i].Name)
		}
	}

	total := 0
	for _, m := range migrations {
		statements := splitStatements(m.SQL)
		total += len(statements)
		for _, statement := range statements {
			if !strings.HasPrefix(strings.ToUpper(statement), "CREATE TABLE IF NOT EXISTS ") {
				t.Fatalf("%s: unexpected statement %q", m.Name, truncateForTest(statement))
			}
		}
	}
	// 001 有 10 张表，002 有 3 张，003 有 1 张。
	if total != 14 {
		t.Fatalf("want 14 statements, got %d", total)
	}
}

func truncateForTest(s string) string {
	if len(s) <= 80 {
		return s
	}
	return s[:80] + "..."
}
