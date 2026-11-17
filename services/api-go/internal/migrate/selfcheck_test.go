// 契约护栏（不是临时自检）：用例锁定迁移文件解析与执行顺序的语义。改实现前先看这里；
// 合并前不要按临时文件删。
package migrate

import (
	"os"
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

// nonIdempotentMigrations 登记不含 `IF NOT EXISTS` 的迁移。
//
// 这些文件重跑一次就直接报错（duplicate column / duplicate key），所以它们能安全执行
// 完全依赖 fbs_migrations 记账表「按文件名只执行一次」。新增 ALTER 却不登记，
// 通常说明作者以为迁移目录里的 DDL 都是可重复执行的——那会掩盖一次真实的启动失败。
var nonIdempotentMigrations = map[string]string{
	"006_fbs_dispatch_dedup_courier.sql":     "ALTER ... DROP PRIMARY KEY, ADD PRIMARY KEY：重跑报 duplicate column `courier_id`",
	"008_fbs_dispatch_dedup_created_idx.sql": "ALTER ... ADD KEY：重跑报 duplicate key name",
}

func TestSelfCheckLoadRealMigrations(t *testing.T) {
	// 相对路径按包目录解析：internal/migrate → services/api/migrations
	const dir = "../../../api/migrations"

	migrations, err := Load(dir)
	if err != nil {
		t.Fatalf("Load: %v", err)
	}

	// 数量必须等于目录里真实的 *.sql 个数。执行逻辑按 Load 的结果自洽，
	// 少读一个文件（扩展名判断、排序丢项）意味着线上少建表却全绿——
	// 这是唯一能把「漏读」和「正常」区分开的位置。
	entries, err := os.ReadDir(dir)
	if err != nil {
		t.Fatalf("ReadDir: %v", err)
	}
	sqlCount := 0
	for _, entry := range entries {
		if !entry.IsDir() && strings.HasSuffix(entry.Name(), ".sql") {
			sqlCount++
		}
	}
	if len(migrations) != sqlCount {
		t.Fatalf("目录里 %d 个 .sql，Load 只读出 %d 个：%v", sqlCount, len(migrations), migrationNames(migrations))
	}

	// 顺序必须是文件名字典序：有依赖关系的 DDL（先建表再加列加索引）靠这个顺序。
	for i := 1; i < len(migrations); i++ {
		if migrations[i-1].Name >= migrations[i].Name {
			t.Fatalf("迁移未按文件名升序：%q 排在 %q 之前", migrations[i-1].Name, migrations[i].Name)
		}
	}

	// 001–003 是基线。改名或删除会让存量库 fbs_migrations 里已有的记录失配，
	// 于是整份迁移在存量库上重跑一遍——恰恰是最不该发生的场景。
	for _, want := range []string{"001_fbs_tables.sql", "002_tma_shared_state.sql", "003_addr_share.sql"} {
		if !containsMigration(migrations, want) {
			t.Fatalf("基线迁移 %s 不见了（改名或删除会让存量库的记账失配）", want)
		}
	}

	seen := make(map[string]struct{}, len(nonIdempotentMigrations))
	for _, m := range migrations {
		statements := splitStatements(m.SQL)
		if len(statements) == 0 {
			t.Fatalf("%s 解析出 0 条语句（注释把正文吃掉了？）", m.Name)
		}
		for _, statement := range statements {
			upper := strings.ToUpper(statement)
			switch {
			case strings.HasPrefix(upper, "CREATE TABLE IF NOT EXISTS "):
				// 幂等，重复执行安全。
			case strings.HasPrefix(upper, "ALTER TABLE "):
				seen[m.Name] = struct{}{}
			default:
				t.Fatalf("%s: 未预期的语句类型 %q（迁移只允许幂等建表与非幂等 ALTER，后者必须登记在 nonIdempotentMigrations）",
					m.Name, truncateForTest(statement))
			}
		}
	}

	// 双向核对：登记的必须真存在，存在的必须已登记。只查一个方向会在删掉语句后留下僵尸条目。
	for name := range nonIdempotentMigrations {
		if _, ok := seen[name]; !ok {
			t.Fatalf("%s 里已经没有 ALTER 语句了，从 nonIdempotentMigrations 删掉", name)
		}
	}
	for name := range seen {
		if _, ok := nonIdempotentMigrations[name]; !ok {
			t.Fatalf("%s 含非幂等 ALTER，必须加进 nonIdempotentMigrations 并写明重跑会报什么错", name)
		}
	}
}

func migrationNames(migrations []Migration) []string {
	names := make([]string, 0, len(migrations))
	for _, m := range migrations {
		names = append(names, m.Name)
	}
	return names
}

func containsMigration(migrations []Migration, name string) bool {
	for _, m := range migrations {
		if m.Name == name {
			return true
		}
	}
	return false
}

func truncateForTest(s string) string {
	if len(s) <= 80 {
		return s
	}
	return s[:80] + "..."
}
