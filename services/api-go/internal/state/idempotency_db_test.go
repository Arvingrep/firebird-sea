// D1 的 DB 回放路径字节级断言（T3 补口，不翻译自 Node —— Node 侧没有入库回放用例）。
//
// 内存实现已在 state_test.go「幂等占位」那条里覆盖过，但入库路径此前是空白，
// 而真实缺陷恰好只在这条路径上：写库时若用默认 json 编码器，`<` / `>` / `&` 会被烧成
// \u003c / \u003e / \u0026 落进 response 列，于是回放出来的字节与首次响应不同。
// JSON 语义等价、逐字节不等 —— 前端缓存键、代理「原样透传上游字节」的承诺、
// 以及「第二次请求必须看到和第一次一模一样的响应」这条幂等本义都会在这里破功。
//
// 需要真实 MySQL/MariaDB：设置 FBS_TEST_DSN 才跑，否则跳过。
package state

import (
	"context"
	"database/sql"
	"os"
	"path/filepath"
	"strings"
	"testing"

	_ "github.com/go-sql-driver/mysql"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/migrate"
)

// idemDBKey 只用于本用例；用固定键便于清理，也不会撞上真实业务的幂等键。
const idemDBKey = "t3-idem-byte-replay"

// idemDBFirstBody 是「首次响应应当写出的字节」。这里写死期望值而不是调用 encodeJSON：
// 用被测实现的函数当 oracle，转义一旦烧进写库路径就永远测不出来。
//
// 取值刻意含 `<`、`>`、`&`、`"`：前三个是 HTML 转义开关的判定字符，`"` 是 JSON 必需转义。
const idemDBFirstBody = `{"info":"<script>&\"x\""}`

func TestIdempotencyStoreReplaysByteIdenticalBody(t *testing.T) {
	dsn := os.Getenv("FBS_TEST_DSN")
	if dsn == "" {
		t.Skip("FBS_TEST_DSN 未设置，跳过 fbs_idem 入库回放用例")
	}
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		t.Fatalf("打开测试库失败: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })
	if err := db.Ping(); err != nil {
		t.Fatalf("连接测试库失败: %v", err)
	}
	dir, err := filepath.Abs(filepath.Join("..", "..", "..", "api", "migrations"))
	if err != nil {
		t.Fatalf("解析迁移目录失败: %v", err)
	}
	if _, err := migrate.Run(context.Background(), db, dir); err != nil {
		t.Fatalf("执行迁移失败: %v", err)
	}

	cleanup := func() {
		if _, err := db.Exec("DELETE FROM fbs_idem WHERE idem_key = ?", idemDBKey); err != nil {
			t.Fatalf("清理 fbs_idem 失败: %v", err)
		}
	}
	cleanup()
	t.Cleanup(cleanup)

	ctx := context.Background()
	store := NewIdempotencyStore(IdempotencyDep{DB: db})

	// 第一次：占位成功，上游可以执行。
	first, err := store.Begin(ctx, idemDBKey)
	if err != nil {
		t.Fatalf("首次 Begin 失败: %v", err)
	}
	if first.Status != IdemNew {
		t.Fatalf("首次 Begin 应为 new，实得 %q", first.Status)
	}

	// 上游拿到结果：写库（这一步是转义缺陷的现场）。
	payload := map[string]any{"info": `<script>&"x"`}
	if err := store.Finish(ctx, idemDBKey, payload); err != nil {
		t.Fatalf("Finish 失败: %v", err)
	}

	// 落在库里的原文就已经必须是未转义形态，否则回放必然与首次不同。
	var stored sql.NullString
	if err := db.QueryRow("SELECT response FROM fbs_idem WHERE idem_key = ?", idemDBKey).Scan(&stored); err != nil {
		t.Fatalf("读取 response 列失败: %v", err)
	}
	if !stored.Valid || stored.String != idemDBFirstBody {
		t.Fatalf("写库内容 = %q，期望 %q（写库时被 HTML 转义了）", stored.String, idemDBFirstBody)
	}

	// 第二次：回放。必须与首次逐字节相同。
	second, err := store.Begin(ctx, idemDBKey)
	if err != nil {
		t.Fatalf("第二次 Begin 失败: %v", err)
	}
	if second.Status != IdemDone {
		t.Fatalf("完成后重复请求应为 done，实得 %q", second.Status)
	}
	if string(second.Body) != idemDBFirstBody {
		t.Fatalf("回放体 = %q，首次响应 = %q，两者必须逐字节相同", string(second.Body), idemDBFirstBody)
	}
	for _, escaped := range []string{`\u003c`, `\u003e`, `\u0026`} {
		if strings.Contains(string(second.Body), escaped) {
			t.Fatalf("回放体含 HTML 转义序列 %s：%q", escaped, string(second.Body))
		}
	}
}
