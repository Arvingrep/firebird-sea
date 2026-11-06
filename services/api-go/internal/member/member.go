// Package member 负责 Telegram 用户 → 火鸟会员的映射（T2.3）。
//
// 映射只由服务端写入 fbs_member_map（AD-5/AD-8）：客户端提交的会员 id 一律不采信，
// 否则任何人都能把自己绑到别人的火鸟账号上。
package member

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strconv"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/gateway"
)

// ErrInvalidTgID 对应 Node 的 'invalid tg id'。tg id 必须是正整数，
// 因为它是 fbs_member_map 的主键且常用于审计，负数/0 只可能是伪造。
var ErrInvalidTgID = errors.New("invalid tg id")

// ErrGatewayFailed 对应 Node 的 'gateway member_find_or_create failed'。
var ErrGatewayFailed = errors.New("gateway member_find_or_create failed")

// MemberGateway 是网关建号动作的最小接口，gateway.Client 的调用可用一行适配器满足。
// 返回 map[string]any 是为了与 gateway.Call 的响应形态直连。
type MemberGateway interface {
	MemberFindOrCreate(ctx context.Context, params map[string]any) (map[string]any, error)
}

// Dep 注入映射表的依赖。
type Dep struct {
	DB      *sql.DB
	Gateway MemberGateway
}

// Map 是映射服务，并发安全依赖 MySQL 唯一约束而不是进程内锁——多副本下锁不住。
type Map struct {
	db *sql.DB
	gw MemberGateway
}

// 编译期确认 *Map 满足登录编排所需的最小接口。
var _ LoginMembers = (*Map)(nil)

func NewMap(d Dep) *Map {
	return &Map{db: d.DB, gw: d.Gateway}
}

func (m *Map) tgIDString(tgID int64) (string, error) {
	if tgID <= 0 {
		return "", ErrInvalidTgID
	}
	return strconv.FormatInt(tgID, 10), nil
}

// Lookup 返回已映射的会员 id。未映射返回 (0, nil)（等价 Node 返回 null），
// 调用方用 0 判断「没有映射」，不必区分「查不到」与「值为空」。
func (m *Map) Lookup(ctx context.Context, tgID int64) (int64, error) {
	tg, err := m.tgIDString(tgID)
	if err != nil {
		return 0, err
	}
	var memberID int64
	err = m.db.QueryRowContext(ctx,
		"SELECT member_id FROM fbs_member_map WHERE tg_user_id = ? LIMIT 1", tg).Scan(&memberID)
	if errors.Is(err, sql.ErrNoRows) {
		return 0, nil
	}
	if err != nil {
		return 0, err
	}
	if memberID <= 0 {
		return 0, nil
	}
	return memberID, nil
}

// FindOrCreate 返回 (memberId, created)。
//
// 幂等性来自两层：先查映射表（绝大多数命中走这里，不打网关），
// 再靠 fbs_member_map 的唯一约束兜住并发首次登录——两个副本同时建号时，
// INSERT IGNORE 只有一条生效，双方最终都读到同一个 member_id。
func (m *Map) FindOrCreate(ctx context.Context, tgID int64) (int64, bool, error) {
	tg, err := m.tgIDString(tgID)
	if err != nil {
		return 0, false, err
	}
	existing, err := m.Lookup(ctx, tgID)
	if err != nil {
		return 0, false, err
	}
	if existing > 0 {
		return existing, false, nil
	}

	res, err := m.gw.MemberFindOrCreate(ctx, map[string]any{"tg_id": tg})
	if err != nil {
		return 0, false, err
	}
	state, _ := gateway.Int(res, "state")
	info, _ := gateway.Map(res, "info")
	memberID, ok := gateway.Int(info, "member_id")
	if state != 100 || !ok || memberID <= 0 {
		return 0, false, ErrGatewayFailed
	}
	created := gateway.Bool(info, "created")

	// 与 Node 的失败路径差异（有意，不是遗漏）：
	//
	// Node 版是两条独立 query —— 先 INSERT fbs_member_map，再 INSERT fbs_member_audit。
	// 审计写失败时映射**已经落库**，用户下次登录会走「已存在」分支、但审计里缺这一条；
	// Go 版把两者放进同一事务，审计失败就一起回滚，调用方拿到 502 可以重试，重试后
	// 映射与审计都完整。这里换来的是「要么都成功、要么都不成功」，代价是多占一会儿行锁。
	// 之所以值得偏离：映射是登录的持久副作用，审计是合规凭据，只留一半的状态没有谁能修回来。
	tx, err := m.db.BeginTx(ctx, nil)
	if err != nil {
		return 0, false, err
	}
	defer func() { _ = tx.Rollback() }()

	insert, err := tx.ExecContext(ctx,
		"INSERT IGNORE INTO fbs_member_map (tg_user_id, member_id) VALUES (?, ?)", tg, memberID)
	if err != nil {
		return 0, false, err
	}
	resolved := memberID
	if affected, err := insert.RowsAffected(); err == nil && affected == 0 {
		var bound int64
		err := tx.QueryRowContext(ctx,
			"SELECT member_id FROM fbs_member_map WHERE tg_user_id = ? LIMIT 1", tg).Scan(&bound)
		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			return 0, false, err
		}
		if bound > 0 {
			resolved = bound
		}
	}

	action := "member_map"
	if created {
		action = "member_create"
	}
	if err := insertAudit(ctx, tx, tgID, action, fmt.Sprintf("member:%d", resolved), ""); err != nil {
		return 0, false, err
	}
	if err := tx.Commit(); err != nil {
		return 0, false, err
	}
	return resolved, created, nil
}

// Audit 写一条审计记录。审计失败不能静默：它是事后追责与风控的唯一线索。
func (m *Map) Audit(ctx context.Context, tgID int64, action, target, detail string) error {
	if _, err := m.tgIDString(tgID); err != nil {
		return err
	}
	return insertAudit(ctx, m.db, tgID, action, target, detail)
}

// execer 是 *sql.DB 与 *sql.Tx 的公共子集，让审计语句在事务内外复用同一份 SQL。
type execer interface {
	ExecContext(ctx context.Context, query string, args ...any) (sql.Result, error)
}

func insertAudit(ctx context.Context, db execer, tgID int64, action, target, detail string) error {
	_, err := db.ExecContext(ctx,
		"INSERT INTO fbs_audit (actor_role, actor_id, action, target, detail) VALUES ('customer', ?, ?, ?, ?)",
		strconv.FormatInt(tgID, 10), action, target, detail)
	return err
}
