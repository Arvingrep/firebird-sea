// Package migrate 执行 services/api/migrations 下的 SQL 迁移并记账（fbs_migrations）。
//
// 与 Node 版的关键差异：Node 通过 mariadb 命令行把整个文件喂给服务端（天然支持多语句），
// Go 的 go-sql-driver/mysql 默认禁止一次多语句（multiStatements=false）。这里选择
// 「按分号拆分后逐条 Exec」而不是打开 multiStatements：
//   - multiStatements 会把注入面从「单条语句」扩大到「任意语句串」，而我们并不需要它；
//   - 拆分后每条语句独立报错，定位坏语句比拿到一个整体失败更直接。
//
// 拆分只做词法级裁剪（去注释、识别引号/反引号），不解析 SQL 语法——迁移文件由本仓库维护，
// 不承担「执行任意第三方 SQL」的职责。
package migrate

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

// DefaultDir 是镜像内的默认迁移目录（go.mod 位于 services/api-go）。
const DefaultDir = "migrations"

// recordTableSQL 与 Node 版逐字一致：只记文件名与执行时间，不记内容哈希。
const recordTableSQL = "CREATE TABLE IF NOT EXISTS fbs_migrations (" +
	"name VARCHAR(128) NOT NULL PRIMARY KEY, " +
	"applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"

var migrationFile = regexp.MustCompile(`^\d+_.*\.sql$`)

// Migration 是一个待执行的迁移文件。
type Migration struct {
	Name string
	SQL  string
}

// Load 读取目录下形如 `001_xxx.sql` 的文件，按文件名排序（文件名即顺序契约）。
func Load(dir string) ([]Migration, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	names := make([]string, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		if migrationFile.MatchString(entry.Name()) {
			names = append(names, entry.Name())
		}
	}
	sort.Strings(names)

	migrations := make([]Migration, 0, len(names))
	for _, name := range names {
		content, err := os.ReadFile(filepath.Join(dir, name))
		if err != nil {
			return nil, err
		}
		migrations = append(migrations, Migration{Name: name, SQL: string(content)})
	}
	return migrations, nil
}

// Run 执行未应用的迁移并返回本次实际执行的文件名列表（顺序即执行顺序）。
// 迁移文件内的 DDL 全是 IF NOT EXISTS，因此「应用到一半失败」重跑是安全的。
func Run(ctx context.Context, db *sql.DB, dir string) ([]string, error) {
	if _, err := db.ExecContext(ctx, recordTableSQL); err != nil {
		return nil, err
	}

	rows, err := db.QueryContext(ctx, "SELECT name FROM fbs_migrations")
	if err != nil {
		return nil, err
	}
	applied := make(map[string]struct{})
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			_ = rows.Close()
			return nil, err
		}
		applied[strings.TrimSpace(name)] = struct{}{}
	}
	if err := rows.Err(); err != nil {
		_ = rows.Close()
		return nil, err
	}
	_ = rows.Close()

	migrations, err := Load(dir)
	if err != nil {
		return nil, err
	}

	ran := make([]string, 0, len(migrations))
	for _, m := range migrations {
		if _, ok := applied[m.Name]; ok {
			continue
		}
		// DDL 在 MySQL 里是隐式提交，包事务没有原子性收益，因此逐条 Exec。
		for index, statement := range splitStatements(m.SQL) {
			if _, err := db.ExecContext(ctx, statement); err != nil {
				return ran, fmt.Errorf("migrate %s (statement %d): %w", m.Name, index+1, err)
			}
		}
		// 记账必须参数化：文件名虽然来自本地目录，也不该成为 SQL 拼接口子。
		if _, err := db.ExecContext(ctx, "INSERT INTO fbs_migrations (name) VALUES (?)", m.Name); err != nil {
			return ran, fmt.Errorf("migrate %s: record: %w", m.Name, err)
		}
		ran = append(ran, m.Name)
	}
	return ran, nil
}

// splitStatements 按分号拆分语句，跳过注释，并正确跨过 '...'、"..."、`...` 内部的字面内容。
// 注释不进入输出：迁移文件里的注释是给人看的，执行时丢掉可以避免「只有注释的语句」报空查询。
func splitStatements(script string) []string {
	var (
		out []string
		b   strings.Builder
	)
	i := 0
	flush := func() {
		if statement := strings.TrimSpace(b.String()); statement != "" {
			out = append(out, statement)
		}
		b.Reset()
	}
	for i < len(script) {
		c := script[i]
		switch {
		case c == '-' && i+1 < len(script) && script[i+1] == '-':
			for i < len(script) && script[i] != '\n' {
				i++
			}
		case c == '#':
			for i < len(script) && script[i] != '\n' {
				i++
			}
		case c == '/' && i+1 < len(script) && script[i+1] == '*':
			i += 2
			for i+1 < len(script) && !(script[i] == '*' && script[i+1] == '/') {
				i++
			}
			if i+1 < len(script) {
				i += 2
			}
		case c == '\'' || c == '"' || c == '`':
			quote := c
			b.WriteByte(c)
			i++
			for i < len(script) {
				ch := script[i]
				// 反引号（标识符）不支持反斜杠转义，只支持 `` 双写。
				if ch == '\\' && quote != '`' && i+1 < len(script) {
					b.WriteByte(ch)
					b.WriteByte(script[i+1])
					i += 2
					continue
				}
				if ch == quote {
					if i+1 < len(script) && script[i+1] == quote {
						b.WriteByte(ch)
						b.WriteByte(ch)
						i += 2
						continue
					}
					b.WriteByte(ch)
					i++
					break
				}
				b.WriteByte(ch)
				i++
			}
		case c == ';':
			flush()
			i++
		default:
			b.WriteByte(c)
			i++
		}
	}
	flush()
	return out
}
