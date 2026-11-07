package dispatch

import (
	"context"
	"database/sql"
	"errors"
	"strconv"
	"strings"

	"github.com/go-sql-driver/mysql"
)

// 四条 SQL。全部走 `?` 绑定参数 —— Node 是字符串拼接 + 白名单/数字保证安全，
// Go 侧不需要也不允许为了「跟原文长得一样」去拼 SQL。
const (
	claimSQL   = "INSERT INTO fbs_dispatch_dedup (event, order_id, courier_id) VALUES (?, ?, ?)"
	releaseSQL = "DELETE FROM fbs_dispatch_dedup WHERE event = ? AND order_id = ? AND courier_id = ?"
	courierSQL = "SELECT tg_user_id FROM fbs_courier_map WHERE courier_id = ? LIMIT 1"
	// pruneSQL 的 TTL 是 1 天（语义等同 Redis SET NX EX 86400，见 005 迁移注释）。
	pruneSQL = "DELETE FROM fbs_dispatch_dedup WHERE created_at < NOW() - INTERVAL 1 DAY"
)

// mysqlDuplicateEntry 是 MySQL/MariaDB 的 ER_DUP_ENTRY。
//
// Node 侧靠 /duplicate/i 匹配 cliConn 的 stderr 文本（"Duplicate entry '...' for key
// 'PRIMARY'"）；Go 侧有驱动给出的结构化错误码，用 1062 判等价且更稳
// （不依赖错误文案的语言/版本，也不会把「连接串里恰好带 duplicate」之类的文本误判）。
const mysqlDuplicateEntry = 1062

// Store 是 dispatch 需要的四条 SQL 语义。
//
// 生产实现是 sqlStore（*sql.DB）；测试注入内存实现（等价 Node 用例里的 makeConn）。
// 分出来的是「语义」而不是「SQL 文本」，这样测试不必依赖 sqlmock 的严格调用顺序 ——
// 投递是异步的，多条投递并发时 SQL 顺序本就不确定。
type Store interface {
	// Claim 写去重占位。duplicate=true 表示撞唯一键（同键已有副本在发/已发过）。
	Claim(ctx context.Context, event string, orderID, courierID int64) (claimed bool, duplicate bool, err error)
	// Release 删掉自己写的占位（投递最终失败时用）。
	Release(ctx context.Context, event string, orderID, courierID int64) error
	// TelegramUser 查骑手绑定的 tg_user_id。bound=false 含「无行/NULL/不是正的安全整数」。
	TelegramUser(ctx context.Context, courierID int64) (tgUserID int64, bound bool, err error)
	// PruneExpired 清理过期去重行（每次投递成功后顺手跑，失败忽略）。
	PruneExpired(ctx context.Context) error
}

// sqlStore 是 Store 的生产实现。
type sqlStore struct{ db *sql.DB }

func (s sqlStore) Claim(ctx context.Context, event string, orderID, courierID int64) (bool, bool, error) {
	_, err := s.db.ExecContext(ctx, claimSQL, event, orderID, courierID)
	if err != nil {
		if isDuplicateKey(err) {
			return false, true, nil
		}
		return false, false, err
	}
	return true, false, nil
}

func (s sqlStore) Release(ctx context.Context, event string, orderID, courierID int64) error {
	_, err := s.db.ExecContext(ctx, releaseSQL, event, orderID, courierID)
	return err
}

func (s sqlStore) TelegramUser(ctx context.Context, courierID int64) (int64, bool, error) {
	// tg_user_id 是 VARCHAR(32)（004 迁移），按文本读再走 firstInt，
	// 与 Node 从 cliConn 的 stdout 里 parseInt 的口径一致。
	var raw sql.NullString
	err := s.db.QueryRowContext(ctx, courierSQL, courierID).Scan(&raw)
	if errors.Is(err, sql.ErrNoRows) {
		// Node 的 cliConn 在 0 行时 stdout 是空串 → parseInt('') 是 NaN → 未绑定。
		return 0, false, nil
	}
	if err != nil {
		return 0, false, err
	}
	if !raw.Valid {
		// NULL 列：Node 的文本输出是 "NULL" → parseInt 失败 → 未绑定。
		return 0, false, nil
	}
	tgUserID, ok := firstInt(raw.String)
	return tgUserID, ok, nil
}

func (s sqlStore) PruneExpired(ctx context.Context) error {
	_, err := s.db.ExecContext(ctx, pruneSQL)
	return err
}

// noDBStore 是「没有连接池」（DB_HOST 未设置）时的 Store：每次调用都失败。
//
// 为什么这**不是** 503 门禁：Node 的 conn 在生产装配里恒非空 —— server.js:458 传的是
// cliConn()，它无条件返回一个 query 对象（migrate.js:37-52），缺库只在真正 spawn 时 reject。
// 于是缺 DB_HOST 时 Node 的对外行为是：去重占位写库失败（记日志、不阻断）→ 202 accepted
// → 异步查绑定失败 → 记日志后放弃。Go 侧必须同形，否则会凭空多出一条 Node 没有的 503
// （rider 那次就是这么被抓到的：缺 DB 时 Node 200 / Go 503，见 internal/rider 的注释）。
type noDBStore struct{}

var errNoDatabase = errors.New("db not configured")

func (noDBStore) Claim(context.Context, string, int64, int64) (bool, bool, error) {
	return false, false, errNoDatabase
}

func (noDBStore) Release(context.Context, string, int64, int64) error { return errNoDatabase }

func (noDBStore) TelegramUser(context.Context, int64) (int64, bool, error) {
	return 0, false, errNoDatabase
}

func (noDBStore) PruneExpired(context.Context) error { return errNoDatabase }

// isDuplicateKey 判唯一键冲突（MySQL 1062）。errors.As 能穿透驱动/包装层的 *mysql.MySQLError。
func isDuplicateKey(err error) bool {
	var mysqlErr *mysql.MySQLError
	return errors.As(err, &mysqlErr) && mysqlErr.Number == mysqlDuplicateEntry
}

// firstInt 复刻 Node 的 firstInt：
//
//	const n = parseInt(String(out || '').split('\n')[0].trim(), 10);
//	return Number.isSafeInteger(n) && n > 0 ? n : null;
//
// 为什么要复刻 parseInt 的「数字前缀」语义而不是直接用 strconv.Atoi：
// cliConn 回的是文本，"9天"/"9\n" 这类脏值在 Node 里会被读成 9，Atoi 会报错。
func firstInt(out string) (int64, bool) {
	line, _, _ := strings.Cut(out, "\n")
	text := strings.TrimSpace(line)
	sign := int64(1)
	if text != "" && (text[0] == '+' || text[0] == '-') {
		if text[0] == '-' {
			sign = -1
		}
		text = text[1:]
	}
	end := 0
	for end < len(text) && text[end] >= '0' && text[end] <= '9' {
		end++
	}
	if end == 0 {
		return 0, false
	}
	value, err := strconv.ParseInt(text[:end], 10, 64)
	if err != nil {
		return 0, false
	}
	value *= sign
	if value <= 0 || value > maxSafeInteger {
		return 0, false
	}
	return value, true
}
