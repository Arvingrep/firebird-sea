// Package state 是跨副本共享状态（MariaDB）：令牌吊销、initData 重放计数、幂等占位。
//
// 接口与进程内实现保持一致，调用方不感知后端（AD-18：api 多副本 + 状态入库）。
// 所有值一律用 `?` 占位绑定参数；唯一需要拼接的标识符只出现在本包之外的表名场景。
package state

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"regexp"
	"strings"
	"sync"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/token"
)

// defaultRefreshEvery 与 Node 版 refreshMs=5000 一致。
const defaultRefreshEvery = 5 * time.Second

var (
	// jtiPattern：UUID 形态，防止把任意字符串写进吊销表（也顺便拒绝注入载荷）。
	jtiPattern = regexp.MustCompile(`^[0-9a-f-]{36}$`)
	// hex64Pattern：initData hash 必须是 64 位小写十六进制。
	hex64Pattern = regexp.MustCompile(`^[0-9a-f]{64}$`)
)

// 编译期确认两个实现的接口兼容性：后端可互换是调用方最依赖的性质。
var (
	_ token.Revoker = (*RevocationStore)(nil)
	_ IdemStore     = (*IdempotencyStore)(nil)
	_ IdemStore     = (*MemoryIdempotencyStore)(nil)
)

func nowSeconds(now func() time.Time) func() int64 {
	if now == nil {
		now = time.Now
	}
	return func() int64 { return now().Unix() }
}

// ---------------------------------------------------------------------------
// 令牌吊销
// ---------------------------------------------------------------------------

// RevocationDep 注入吊销存储的依赖。RefreshEvery 为零取 5s。
type RevocationDep struct {
	DB           *sql.DB
	RefreshEvery time.Duration
	Now          func() time.Time
}

// RevocationStore 满足 token.Revoker：验证路径只读本地快照，
// 每 RefreshEvery 从库刷新一次，Revoke 同时写库并立刻写本地（本副本立即生效）。
type RevocationStore struct {
	db      *sql.DB
	every   time.Duration
	now     func() int64
	mu      sync.RWMutex
	local   map[string]int64
	stop    chan struct{}
	stopped bool
	stopMu  sync.Mutex
}

func NewRevocationStore(d RevocationDep) *RevocationStore {
	every := d.RefreshEvery
	if every <= 0 {
		every = defaultRefreshEvery
	}
	return &RevocationStore{
		db:    d.DB,
		every: every,
		now:   nowSeconds(d.Now),
		local: make(map[string]int64),
	}
}

func (s *RevocationStore) IsRevoked(jti string) bool {
	s.mu.RLock()
	defer s.mu.RUnlock()
	_, ok := s.local[jti]
	return ok
}

// Revoke 写库用 INSERT IGNORE：并发重复吊销同一 jti 不应报错，幂等语义更贴合调用方预期。
func (s *RevocationStore) Revoke(jti string, exp int64) error {
	if !jtiPattern.MatchString(jti) || exp <= 0 {
		return errors.New("invalid revoke args")
	}
	s.mu.Lock()
	s.local[jti] = exp
	s.mu.Unlock()

	// token.Revoker 的签名不带 ctx（验签路径上的同步调用），这里自带超时兜底，
	// 避免库连接抖动把吊销写操作挂死。
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_, err := s.db.ExecContext(ctx,
		"INSERT IGNORE INTO fbs_token_revoked (jti, exp) VALUES (?, ?)", jti, exp)
	return err
}

// Refresh 拉取未过期吊销项、清理库内过期行，并剔除本地已过期项。
// 顺序与 Node 版一致：先补新、再删过期、最后扫本地。
func (s *RevocationStore) Refresh(ctx context.Context) error {
	now := s.now()
	rows, err := s.db.QueryContext(ctx, "SELECT jti, exp FROM fbs_token_revoked WHERE exp > ?", now)
	if err != nil {
		return err
	}
	fresh := make(map[string]int64)
	for rows.Next() {
		var (
			jti string
			exp int64
		)
		if err := rows.Scan(&jti, &exp); err != nil {
			_ = rows.Close()
			return err
		}
		if jtiPattern.MatchString(jti) {
			fresh[jti] = exp
		}
	}
	if err := rows.Err(); err != nil {
		_ = rows.Close()
		return err
	}
	_ = rows.Close()

	if _, err := s.db.ExecContext(ctx,
		"DELETE FROM fbs_token_revoked WHERE exp <= ?", now-60); err != nil {
		return err
	}

	s.mu.Lock()
	for jti, exp := range fresh {
		s.local[jti] = exp
	}
	for jti, exp := range s.local {
		if exp <= now {
			delete(s.local, jti)
		}
	}
	s.mu.Unlock()
	return nil
}

// Start 周期性刷新；单次失败只影响新鲜度，因此吞掉错误继续下一轮。
func (s *RevocationStore) Start(ctx context.Context) {
	s.stopMu.Lock()
	if s.stopped {
		s.stopMu.Unlock()
		return
	}
	stop := make(chan struct{})
	s.stop = stop
	s.stopMu.Unlock()

	_ = s.Refresh(ctx)
	go func() {
		ticker := time.NewTicker(s.every)
		defer ticker.Stop()
		for {
			select {
			case <-stop:
				return
			case <-ctx.Done():
				return
			case <-ticker.C:
				_ = s.Refresh(ctx)
			}
		}
	}()
}

func (s *RevocationStore) Stop() {
	s.stopMu.Lock()
	defer s.stopMu.Unlock()
	if s.stopped {
		return
	}
	s.stopped = true
	if s.stop != nil {
		close(s.stop)
	}
}

// ---------------------------------------------------------------------------
// initData 重放计数
// ---------------------------------------------------------------------------

// ReplayDep 注入重放计数器依赖。TTL 是计数窗口，必须显式给（与 Node 版一致：
// 窗口长度由调用方按 initData 有效期决定，这里不设默认值以免掩盖配置错误）。
type ReplayDep struct {
	DB  *sql.DB
	Max int
	TTL time.Duration
	Now func() time.Time
}

// ReplayCounter 让每个 initData hash 在 TTL 内最多被换发 Max 次，跨副本共享计数。
type ReplayCounter struct {
	db  *sql.DB
	max int
	ttl int64
	now func() int64
}

func NewReplayCounter(d ReplayDep) *ReplayCounter {
	return &ReplayCounter{db: d.DB, max: d.Max, ttl: int64(d.TTL / time.Second), now: nowSeconds(d.Now)}
}

// Allow 是 loginService 的 allowReplay 注入点。key 允许带 "h:" 前缀（与 Node 调用约定一致）。
// 删过期 + 占位自增 + 读回计数必须在一个事务里：否则并发的「删过期」会清掉别人刚写下的计数。
func (r *ReplayCounter) Allow(ctx context.Context, key string) (bool, error) {
	if r.db == nil {
		return false, errors.New("replay counter: db not configured")
	}
	hash := strings.TrimPrefix(key, "h:")
	if !hex64Pattern.MatchString(hash) {
		return false, nil
	}
	now := r.now()
	exp := now + r.ttl

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return false, err
	}
	defer func() { _ = tx.Rollback() }()

	if _, err := tx.ExecContext(ctx, "DELETE FROM fbs_replay WHERE expires_at <= ?", now); err != nil {
		return false, err
	}
	if _, err := tx.ExecContext(ctx,
		"INSERT INTO fbs_replay (hash, cnt, expires_at) VALUES (?, 1, ?) ON DUPLICATE KEY UPDATE cnt = cnt + 1",
		hash, exp); err != nil {
		return false, err
	}
	var cnt int64
	if err := tx.QueryRowContext(ctx, "SELECT cnt FROM fbs_replay WHERE hash = ?", hash).Scan(&cnt); err != nil {
		return false, err
	}
	if err := tx.Commit(); err != nil {
		return false, err
	}
	return cnt <= int64(r.max), nil
}

// ---------------------------------------------------------------------------
// 幂等占位
// ---------------------------------------------------------------------------

// IdemStatus 与 Node 版 status 字符串一致。
type IdemStatus string

const (
	IdemNew     IdemStatus = "new"
	IdemPending IdemStatus = "pending"
	IdemDone    IdemStatus = "done"
)

// IdemResult 是 Begin 的结果；Body 仅在 done 时非空，保存首次响应原文。
type IdemResult struct {
	Status IdemStatus
	Body   json.RawMessage
}

// IdemStore 是 fbProxy 依赖的幂等接口（进程内与入库实现可互换）。
type IdemStore interface {
	Begin(ctx context.Context, key string) (IdemResult, error)
	Finish(ctx context.Context, key string, body any) error
	Abort(ctx context.Context, key string) error
}

// IdempotencyDep 注入入库幂等存储依赖。
type IdempotencyDep struct {
	DB  *sql.DB
	TTL time.Duration
	Now func() time.Time
}

type IdempotencyStore struct {
	db  *sql.DB
	ttl int64
	now func() int64
}

// defaultIdemTTL 与 Node 版 ttlSeconds=600 一致：占位活太久会让同键重试永远拿不到机会。
const defaultIdemTTL = 10 * time.Minute

func NewIdempotencyStore(d IdempotencyDep) *IdempotencyStore {
	ttl := d.TTL
	if ttl <= 0 {
		ttl = defaultIdemTTL
	}
	return &IdempotencyStore{db: d.DB, ttl: int64(ttl / time.Second), now: nowSeconds(d.Now)}
}

// Begin 先占位再读状态。「删过期 + INSERT IGNORE + SELECT」放同一事务，
// 保证观察到的是「本次插入成功」与「他人已占位」二者之一，不会出现两者都成立。
func (s *IdempotencyStore) Begin(ctx context.Context, key string) (IdemResult, error) {
	if s.db == nil {
		return IdemResult{}, errors.New("idempotency store: db not configured")
	}
	now := s.now()
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return IdemResult{}, err
	}
	defer func() { _ = tx.Rollback() }()

	if _, err := tx.ExecContext(ctx,
		"DELETE FROM fbs_idem WHERE idem_key = ? AND expires_at <= ?", key, now); err != nil {
		return IdemResult{}, err
	}
	res, err := tx.ExecContext(ctx,
		"INSERT IGNORE INTO fbs_idem (idem_key, state, expires_at) VALUES (?, 'pending', ?)",
		key, now+s.ttl)
	if err != nil {
		return IdemResult{}, err
	}
	inserted, err := res.RowsAffected()
	if err != nil {
		return IdemResult{}, err
	}
	if inserted == 1 {
		if err := tx.Commit(); err != nil {
			return IdemResult{}, err
		}
		return IdemResult{Status: IdemNew}, nil
	}

	var (
		state    string
		response sql.NullString
	)
	err = tx.QueryRowContext(ctx,
		"SELECT state, response FROM fbs_idem WHERE idem_key = ? LIMIT 1", key).Scan(&state, &response)
	if errors.Is(err, sql.ErrNoRows) {
		// 占位行在两步之间被 abort 掉：按「仍在处理」处理，让调用方复用等待语义。
		if err := tx.Commit(); err != nil {
			return IdemResult{}, err
		}
		return IdemResult{Status: IdemPending}, nil
	}
	if err != nil {
		return IdemResult{}, err
	}
	if err := tx.Commit(); err != nil {
		return IdemResult{}, err
	}
	if state == string(IdemDone) && response.Valid && response.String != "" {
		if json.Valid([]byte(response.String)) {
			return IdemResult{Status: IdemDone, Body: json.RawMessage(response.String)}, nil
		}
		// 历史脏数据不是「已完成」的证据，退回 pending 让请求重走上游。
		return IdemResult{Status: IdemPending}, nil
	}
	return IdemResult{Status: IdemPending}, nil
}

// encodeJSON 与 Node 的 JSON.stringify 对齐：不转义 <、>、&，也不补结尾换行。
//
// 幂等回放要求「第二次响应与第一次逐字节相同」。用默认编码器会把 `<` 写成 \u003c：
// JSON 语义等价，但同一请求第一次与第二次拿到的字节不同 —— 逐字节比对、前端缓存键、
// 以及「原样透传上游字节」的承诺都会在这里破功。
func encodeJSON(body any) ([]byte, error) {
	buf := &bytes.Buffer{}
	encoder := json.NewEncoder(buf)
	encoder.SetEscapeHTML(false)
	if err := encoder.Encode(body); err != nil {
		return nil, err
	}
	return bytes.TrimSuffix(buf.Bytes(), []byte("\n")), nil
}

func (s *IdempotencyStore) Finish(ctx context.Context, key string, body any) error {
	encoded, err := encodeJSON(body)
	if err != nil {
		return err
	}
	_, err = s.db.ExecContext(ctx,
		"UPDATE fbs_idem SET state = 'done', response = ? WHERE idem_key = ?", string(encoded), key)
	return err
}

func (s *IdempotencyStore) Abort(ctx context.Context, key string) error {
	_, err := s.db.ExecContext(ctx, "DELETE FROM fbs_idem WHERE idem_key = ?", key)
	return err
}

// MemoryIdempotencyDep 注入进程内幂等存储依赖（无库配置时的回退，仅单副本语义）。
type MemoryIdempotencyDep struct {
	TTL time.Duration
	Now func() time.Time
}

type memoryEntry struct {
	at    time.Time
	state IdemStatus
	body  any
}

// MemoryIdempotencyStore 供单测与本地无库运行使用。
type MemoryIdempotencyStore struct {
	ttl time.Duration
	now func() time.Time
	mu  sync.Mutex
	m   map[string]memoryEntry
}

func NewMemoryIdempotencyStore(d MemoryIdempotencyDep) *MemoryIdempotencyStore {
	ttl := d.TTL
	if ttl <= 0 {
		ttl = 10 * time.Minute
	}
	now := d.Now
	if now == nil {
		now = time.Now
	}
	return &MemoryIdempotencyStore{ttl: ttl, now: now, m: make(map[string]memoryEntry)}
}

func (s *MemoryIdempotencyStore) Begin(_ context.Context, key string) (IdemResult, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if e, ok := s.m[key]; ok && s.now().Sub(e.at) <= s.ttl {
		if e.state == IdemDone {
			// 与 Finish 用同一套编码口径，否则回放体会被二次转义（见 encodeJSON 注释）。
			body, err := encodeJSON(e.body)
			if err != nil {
				return IdemResult{}, err
			}
			return IdemResult{Status: IdemDone, Body: body}, nil
		}
		return IdemResult{Status: IdemPending}, nil
	}
	s.m[key] = memoryEntry{at: s.now(), state: IdemPending}
	return IdemResult{Status: IdemNew}, nil
}

func (s *MemoryIdempotencyStore) Finish(_ context.Context, key string, body any) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.m[key] = memoryEntry{at: s.now(), state: IdemDone, body: body}
	return nil
}

func (s *MemoryIdempotencyStore) Abort(_ context.Context, key string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.m, key)
	return nil
}
