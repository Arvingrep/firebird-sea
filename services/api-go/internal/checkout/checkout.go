// Package checkout 实现 Story 2.1 收银台：汇率快照 + 动态尾数分配（AD-5 / AD-6）。
//
// 与 Node 版的关键差异（有意为之）：Node 经 mariadb CLI 执行，每条 SQL 一个新进程，
// BEGIN/FOR UPDATE 形同虚设；Go 版用真实的 BeginTx，让「释放过期占用 → 扫描占用区间 →
// 落库」处在同一事务里，尾数唯一约束仍是最后一道并发防线。
//
// 金额全程整数（micro-USDT / centavos）：任何 float64 参与金额计算都会在
// 「15.01 变成 15.010000000000002」这类地方让链上对账失败。
package checkout

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"math/big"
	"math/rand"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/coins"
	"github.com/go-sql-driver/mysql"
)

const (
	// TailMin / TailMax：尾数 0.01 ~ 0.90 USDT，共 90 个可用值。
	TailMin = 1
	TailMax = 90
	// TailUnitMicro：1 cent = 10000 micro-USDT。
	TailUnitMicro = 10000
	// RateMaxAge：汇率快照最长可用 60s。
	RateMaxAge = 60 * time.Second
	// RateFutureTolerance：rate_at 允许比当前时间快 1s（上游与本地时钟微差）。
	RateFutureTolerance = time.Second
	// Window：支付窗口 15 分钟。
	Window = 15 * time.Minute
	// MaxRetry：尾数冲突重试上限。
	MaxRetry = 5
)

// SafeIDPattern 与 checkout.js 的 SAFE_ID 一致：ordernum / idempotencyKey 的字符集上限。
const SafeIDPattern = `^[A-Za-z0-9_-]{1,64}$`

var (
	safeID      = regexp.MustCompile(SafeIDPattern)
	ratePattern = regexp.MustCompile(`^(\d+)(?:\.(\d{1,18}))?$`)
)

// Error 是带业务码的收银台错误（等价 Node 的 CheckoutError）。
type Error struct {
	Code    string
	Message string
}

func (e *Error) Error() string { return e.Message }

func newError(code, message string) *Error { return &Error{Code: code, Message: message} }

// Rate 是一次汇率快照。RateAt 用 time.Time 而不是毫秒数：Go 侧所有时间都应该是可比较的时间值，
// 落库精度（秒）在 SqlTime / DBISO 里显式处理。
type Rate struct {
	RateStr string
	RateAt  time.Time
}

// RateSource 由调用方注入（生产是 Coins.ph 买价，测试可固定）。带 ctx 才能让取价超时可取消。
type RateSource func(ctx context.Context) (Rate, error)

// Data 是收银台响应体，字段名与 Node 版逐字一致。
type Data struct {
	Ordernum     string `json:"ordernum"`
	PayableMicro int64  `json:"payable_micro"`
	RateStr      string `json:"rate_str"`
	RateAt       string `json:"rate_at"`
	ExpiresAt    string `json:"expires_at"`
	Address      string `json:"address"`
}

// Row 是 fbs_charge 的一行（只取收银台需要的列）。
type Row struct {
	ID           int64
	Ordernum     string
	PayableMicro int64
	RateStr      string
	RateAt       time.Time
	ExpiresAt    time.Time
	State        string
}

// Req 是 CreateCheckout 的入参。ServerCentavos 只能来自服务端读 pay_log。
type Req struct {
	Ordernum       string
	ServerCentavos int64
	IdempotencyKey *string
	GetRate        RateSource
	Address        string
	Now            func() time.Time
}

// SafeID 判断字符串是否满足 SAFE_ID（ordernum / idempotencyKey 共用）。
func SafeID(s string) bool { return safeID.MatchString(s) }

// SqlTime 把时间格式化成 MySQL DATETIME（UTC，秒精度），与 Node 的 sqlTime 一致。
func SqlTime(t time.Time) string { return t.UTC().Format("2006-01-02 15:04:05") }

// DBISO 把时间格式化成 Node dbIso 的形态：toISOString().slice(0,19)+'Z'。
func DBISO(t time.Time) string { return t.UTC().Format("2006-01-02T15:04:05") + "Z" }

// BaseMicro 计算 ceil(php_centavos * 1e4 / rate)，单位 micro-USDT。
//
// 必须用 big.Int：Node 用 BigInt，rate 小数位最多 18 位时中间乘积会远超 int64
// （例：100 centavos × 1e8 缩放 = 1e14，再乘以 1e4 后已经接近 int64 上限）。
func BaseMicro(phpCentavos int64, rateStr string) (int64, error) {
	m := ratePattern.FindStringSubmatch(rateStr)
	if m == nil {
		return 0, newError("RATE_INVALID", "汇率无效")
	}
	digits := m[1] + m[2]
	num, ok := new(big.Int).SetString(digits, 10)
	if !ok || num.Sign() <= 0 {
		return 0, newError("RATE_INVALID", "汇率无效")
	}
	scale := new(big.Int).Exp(big.NewInt(10), big.NewInt(int64(len(m[2]))), nil)

	n := new(big.Int).Mul(big.NewInt(phpCentavos), big.NewInt(10000))
	n.Mul(n, scale)
	// ceil(a/b) = (a + b - 1) / b，全程非负整数。
	n.Add(n, new(big.Int).Sub(num, big.NewInt(1)))
	n.Quo(n, num)
	if !n.IsInt64() {
		return 0, newError("RATE_INVALID", "汇率无效")
	}
	return n.Int64(), nil
}

// PickTail 在 0.01~0.90 里挑一个未被占用的尾数。
func PickTail(occupied map[int]bool) (int, error) {
	free := make([]int, 0, TailMax)
	for tail := TailMin; tail <= TailMax; tail++ {
		if !occupied[tail] {
			free = append(free, tail)
		}
	}
	if len(free) == 0 {
		return 0, newError("TAIL_EXHAUSTED", "当前支付繁忙，请稍后再试")
	}
	return free[rand.Intn(len(free))], nil
}

// RowUsable：pending 且未过期才可幂等返回。判定统一用秒精度（与落库一致）。
func RowUsable(row *Row, now time.Time) bool {
	return row.State == "pending" && row.ExpiresAt.Unix() > now.Unix()
}

// RowReusable：只允许复用 pending（已超时）或 expired；matched/void 等资金终态不得覆盖。
func RowReusable(row *Row) bool {
	return row.State == "pending" || row.State == "expired"
}

// RowToData 输出响应快照；rate_at / expires_at 为落库秒精度，保证幂等返回与首次返回一致。
func RowToData(row *Row, address string) Data {
	return Data{
		Ordernum:     row.Ordernum,
		PayableMicro: row.PayableMicro,
		RateStr:      row.RateStr,
		RateAt:       DBISO(row.RateAt),
		ExpiresAt:    DBISO(row.ExpiresAt),
		Address:      address,
	}
}

// Queryer 是 *sql.DB 与 *sql.Tx 的公共子集，便于 FindExisting 在事务内外复用。
type Queryer interface {
	QueryRowContext(ctx context.Context, query string, args ...any) *sql.Row
}

// FindExisting 查同一 ordernum 或同一幂等键已有的收银台行。
// 命中行必须属于本次 ordernum：幂等键撞到别人的订单时不得返回他人的收银台。
func FindExisting(ctx context.Context, q Queryer, ordernum string, idempotencyKey *string) (*Row, error) {
	query := "SELECT id, ordernum, payable_micro, rate_str, rate_at, expires_at, state FROM fbs_charge WHERE ordernum = ?"
	args := []any{ordernum}
	if idempotencyKey != nil {
		query += " OR idempotency_key = ?"
		args = append(args, *idempotencyKey)
	}
	query += " LIMIT 1"

	row, err := scanRow(q.QueryRowContext(ctx, query, args...))
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	if row.Ordernum != ordernum {
		return nil, newError("ORDER_EXISTS", "幂等键已绑定其他订单")
	}
	return row, nil
}

func scanRow(row *sql.Row) (*Row, error) {
	var (
		out       Row
		rateAt    string
		expiresAt string
	)
	if err := row.Scan(&out.ID, &out.Ordernum, &out.PayableMicro, &out.RateStr, &rateAt, &expiresAt, &out.State); err != nil {
		return nil, err
	}
	var err error
	if out.RateAt, err = parseDBTime(rateAt); err != nil {
		return nil, err
	}
	if out.ExpiresAt, err = parseDBTime(expiresAt); err != nil {
		return nil, err
	}
	return &out, nil
}

// parseDBTime 兼容驱动可能返回的几种时间文本（parseTime 关闭时是 DATETIME 字符串）。
func parseDBTime(value string) (time.Time, error) {
	layouts := []string{
		"2006-01-02 15:04:05",
		"2006-01-02 15:04:05.999999",
		time.RFC3339Nano,
	}
	for _, layout := range layouts {
		if parsed, err := time.Parse(layout, value); err == nil {
			return parsed.UTC(), nil
		}
	}
	return time.Time{}, fmt.Errorf("checkout: unrecognized datetime %q", value)
}

// CreateCheckout 创建或复用收银台。
func CreateCheckout(ctx context.Context, db *sql.DB, req Req) (Data, error) {
	if !SafeID(req.Ordernum) || (req.IdempotencyKey != nil && !SafeID(*req.IdempotencyKey)) {
		return Data{}, newError("BAD_REQUEST", "ordernum / idempotencyKey 格式无效")
	}
	// 金额只接受服务端读数：客户端提交的金额一律不采信（否则 100 元订单能改成 1 元）。
	if req.ServerCentavos <= 0 {
		return Data{}, newError("BAD_REQUEST", "订单金额无效")
	}
	now := req.Now
	if now == nil {
		now = time.Now
	}
	t0 := now()

	// 幂等先于取价：已有可用收银台时，汇率失败也照常返回（用户不必因为行情抖动重试）。
	existing, err := FindExisting(ctx, db, req.Ordernum, req.IdempotencyKey)
	if err != nil {
		return Data{}, err
	}
	if existing != nil && RowUsable(existing, t0) {
		return RowToData(existing, req.Address), nil
	}
	if existing != nil && !RowReusable(existing) {
		return Data{}, newError("ORDER_EXISTS", "该订单已有收银台记录，状态不允许重建")
	}

	rate, err := fetchRate(ctx, req.GetRate)
	if err != nil {
		return Data{}, err
	}
	if rate.RateAt.After(t0.Add(RateFutureTolerance)) || t0.Sub(rate.RateAt) > RateMaxAge {
		return Data{}, newError("RATE_STALE", "汇率已过期，请稍后再试")
	}
	base, err := BaseMicro(req.ServerCentavos, rate.RateStr)
	if err != nil {
		return Data{}, err
	}

	collided := make(map[int]bool)
	expiresAt := t0.Add(Window)

	// 释放过期占用：放在事务外、每次创建只做一次。
	//
	// 这条 UPDATE 的 WHERE（state / holds_tail / expires_at）在 fbs_charge 上没有索引，
	// InnoDB 会整表扫描并锁住扫描到的所有行。把它放进分配事务里，两个并发下单就会
	// 在「全表锁 vs 插入意向锁」上互相死锁（实测 Error 1213）。
	// 释放本身幂等、且与本次分配无因果，挪到事务外既消除死锁又把锁窗口压到单条语句。
	// 不清理则 holds_tail 会累积到 90 个后让所有新订单误报 TAIL_EXHAUSTED。
	if _, err := db.ExecContext(ctx,
		"UPDATE fbs_charge SET state = 'expired', holds_tail = 0 WHERE state = 'pending' AND holds_tail = 1 AND expires_at <= ?",
		SqlTime(t0)); err != nil {
		return Data{}, err
	}

	for attempt := 0; attempt < MaxRetry; attempt++ {
		outcome, err := tryAllocate(ctx, db, allocateInput{
			Req:       req,
			Existing:  existing,
			Rate:      rate,
			Base:      base,
			Collided:  collided,
			NowFn:     now,
			ExpiresAt: expiresAt,
		})
		if err != nil {
			var tail *tailCollision
			if errors.As(err, &tail) {
				// 尾数撞车：排除该尾数后重来（事务已在内部回滚，重试会重新开一个新事务）。
				collided[tail.tail] = true
				continue
			}
			var dupe *duplicateOrder
			if errors.As(err, &dupe) {
				// ordernum / 幂等键唯一冲突：重查已有行，决定幂等返回、续期还是拒绝。
				again, findErr := FindExisting(ctx, db, req.Ordernum, req.IdempotencyKey)
				if findErr != nil {
					return Data{}, findErr
				}
				if again != nil && RowUsable(again, now()) {
					return RowToData(again, req.Address), nil
				}
				if again != nil && RowReusable(again) {
					existing = again
					continue
				}
				return Data{}, newError("ORDER_EXISTS", "订单已存在收银台")
			}
			return Data{}, err
		}
		return outcome, nil
	}
	return Data{}, newError("TAIL_EXHAUSTED", "当前支付繁忙，请稍后再试")
}

func fetchRate(ctx context.Context, source RateSource) (Rate, error) {
	if source == nil {
		return Rate{}, newError("RATE_UNAVAILABLE", "汇率获取失败，请稍后再试")
	}
	rate, err := source(ctx)
	if err != nil {
		return Rate{}, newError("RATE_UNAVAILABLE", "汇率获取失败，请稍后再试")
	}
	if rate.RateStr == "" {
		return Rate{}, newError("RATE_UNAVAILABLE", "汇率获取失败，请稍后再试")
	}
	return rate, nil
}

// tailCollision / duplicateOrder 是内部重试信号，不外泄给调用方。
type tailCollision struct{ tail int }

func (e *tailCollision) Error() string { return "tail collision" }

type duplicateOrder struct{}

func (e *duplicateOrder) Error() string { return "duplicate order" }

type allocateInput struct {
	Req       Req
	Existing  *Row
	Rate      Rate
	Base      int64
	Collided  map[int]bool
	NowFn     func() time.Time
	ExpiresAt time.Time
}

// tryAllocate 跑一轮「事务内分配」：扫占用 → 选尾数 → INSERT 或条件 UPDATE → 读回 → 提交。
func tryAllocate(ctx context.Context, db *sql.DB, in allocateInput) (Data, error) {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return Data{}, err
	}
	defer func() { _ = tx.Rollback() }()

	lo := in.Base + TailUnitMicro*TailMin
	hi := in.Base + TailUnitMicro*TailMax
	rows, err := tx.QueryContext(ctx,
		"SELECT payable_micro FROM fbs_charge WHERE holds_tail = 1 AND payable_micro BETWEEN ? AND ?", lo, hi)
	if err != nil {
		return Data{}, err
	}
	occupied := make(map[int]bool, len(in.Collided))
	for tail := range in.Collided {
		occupied[tail] = true
	}
	for rows.Next() {
		var payable int64
		if err := rows.Scan(&payable); err != nil {
			_ = rows.Close()
			return Data{}, err
		}
		// 不同基础金额也可能算出同一 payable_micro，必须按「差值能被 1 cent 整除」反推尾数。
		diff := payable - in.Base
		if diff%TailUnitMicro != 0 {
			continue
		}
		if tail := int(diff / TailUnitMicro); tail >= TailMin && tail <= TailMax {
			occupied[tail] = true
		}
	}
	if err := rows.Err(); err != nil {
		_ = rows.Close()
		return Data{}, err
	}
	_ = rows.Close()

	tail, err := PickTail(occupied)
	if err != nil {
		return Data{}, err
	}
	payable := in.Base + int64(tail)*TailUnitMicro

	if in.Existing != nil {
		return reuseRow(ctx, tx, in, tail, payable)
	}
	return insertRow(ctx, tx, in, tail, payable)
}

// idempotencyArg 把 *string 转成可绑定参数（nil → SQL NULL，保持幂等键「未提供」的语义）。
func idempotencyArg(key *string) any {
	if key == nil {
		return nil
	}
	return *key
}

func insertRow(ctx context.Context, tx *sql.Tx, in allocateInput, tail int, payable int64) (Data, error) {
	_, err := tx.ExecContext(ctx,
		"INSERT INTO fbs_charge (ordernum, idempotency_key, php_centavos, tail_cents, payable_micro, rate_str, rate_at, state, expires_at, holds_tail) "+
			"VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, 1)",
		in.Req.Ordernum, idempotencyArg(in.Req.IdempotencyKey), in.Req.ServerCentavos, tail, payable,
		in.Rate.RateStr, SqlTime(in.Rate.RateAt), SqlTime(in.ExpiresAt))
	if err != nil {
		_ = tx.Rollback()
		return Data{}, classifyWriteError(err, tail)
	}
	if err := tx.Commit(); err != nil {
		return Data{}, err
	}
	return Data{
		Ordernum:     in.Req.Ordernum,
		PayableMicro: payable,
		RateStr:      in.Rate.RateStr,
		RateAt:       DBISO(in.Rate.RateAt),
		ExpiresAt:    DBISO(in.ExpiresAt),
		Address:      in.Req.Address,
	}, nil
}

func reuseRow(ctx context.Context, tx *sql.Tx, in allocateInput, tail int, payable int64) (Data, error) {
	// WHERE 带 state 守卫：读行到写行之间可能已进入 matched/void 等资金终态，
	// 无守卫会覆盖终态导致重复收款。
	if _, err := tx.ExecContext(ctx,
		"UPDATE fbs_charge SET php_centavos = ?, tail_cents = ?, payable_micro = ?, rate_str = ?, rate_at = ?, expires_at = ?, "+
			"state = 'pending', holds_tail = 1, idempotency_key = ? WHERE id = ? AND state IN ('pending','expired')",
		in.Req.ServerCentavos, tail, payable, in.Rate.RateStr, SqlTime(in.Rate.RateAt), SqlTime(in.ExpiresAt),
		idempotencyArg(in.Req.IdempotencyKey), in.Existing.ID); err != nil {
		_ = tx.Rollback()
		return Data{}, classifyWriteError(err, tail)
	}

	// 读回确认：并发续期时后写者胜，两个调用方一律以库中现值为准。
	after, err := scanRow(tx.QueryRowContext(ctx,
		"SELECT id, ordernum, payable_micro, rate_str, rate_at, expires_at, state FROM fbs_charge WHERE id = ?",
		in.Existing.ID))
	if err != nil {
		_ = tx.Rollback()
		if errors.Is(err, sql.ErrNoRows) {
			return Data{}, newError("ORDER_EXISTS", "该订单收银台记录不存在")
		}
		return Data{}, err
	}
	if !RowReusable(after) {
		_ = tx.Rollback()
		return Data{}, newError("ORDER_EXISTS", "该订单已有收银台记录，状态不允许重建")
	}
	if err := tx.Commit(); err != nil {
		return Data{}, err
	}
	if after.PayableMicro == payable && after.RateStr == in.Rate.RateStr {
		return Data{
			Ordernum:     in.Req.Ordernum,
			PayableMicro: payable,
			RateStr:      in.Rate.RateStr,
			RateAt:       DBISO(in.Rate.RateAt),
			ExpiresAt:    DBISO(in.ExpiresAt),
			Address:      in.Req.Address,
		}, nil
	}
	if RowUsable(after, in.NowFn()) {
		return RowToData(after, in.Req.Address), nil
	}
	return Data{}, newError("ORDER_EXISTS", "该订单收银台正在续期，请稍后重试")
}

// classifyWriteError 区分「尾数唯一键冲突」（换尾数可重试）与「订单/幂等键唯一冲突」（需重查已有行）。
// 判据是 MySQL 1062 报错文本里的键名——这是唯一能把两类冲突分开的信息。
//
// 1213（死锁）/ 1205（锁等待超时）同样按可重试处理：事务已被数据库回滚，
// 换一个尾数重来既安全也比把 500 抛给用户好。
func classifyWriteError(err error, tail int) error {
	var mysqlErr *mysql.MySQLError
	if !errors.As(err, &mysqlErr) {
		return err
	}
	switch mysqlErr.Number {
	case 1213, 1205:
		return &tailCollision{tail: tail}
	case 1062:
		// Duplicate entry '...' for key 'uq_fbs_charge_tail'
		if strings.Contains(mysqlErr.Message, "uq_fbs_charge_tail") {
			return &tailCollision{tail: tail}
		}
		return &duplicateOrder{}
	}
	return err
}

// CoinsRateSource 是默认汇率源：Coins.ph 深度里最高买价（bid[0]）。
// rate_str 用上游原始字符串，避免二次格式化改变精度（MySQL 里 rate_str 是 VARCHAR）。
func CoinsRateSource(client DepthClient, now func() time.Time) RateSource {
	if now == nil {
		now = time.Now
	}
	return func(ctx context.Context) (Rate, error) {
		book, err := client.OrderBook(ctx, "USDTPHP", 5)
		if err != nil {
			return Rate{}, err
		}
		// 这里的 `!(price > 0)` 与 /rates/convert 的 `php <= 0` 形态相反，但两边都是**逐字翻译 Node**，
		// 不是笔误：Node `checkout.js:205` 原句是 `if (!bid || !(bid.price > 0)) throw`，
		// 而 `server.js:358` 是 `if (php <= 0)`。同一个 NaN 在两处的历史行为本就不同 ——
		// 取价侧拒绝（抛 empty order book），换算侧放行（200 + null）。改任一处都会背离 Node，
		// 所以「统一成同一种写法」在这里恰恰是错的。
		if len(book.Bids) == 0 || !(book.Bids[0].Price > 0) {
			return Rate{}, errors.New("empty order book")
		}
		rateStr := book.Bids[0].PriceStr
		if rateStr == "" {
			rateStr = strconv.FormatFloat(book.Bids[0].Price, 'f', -1, 64)
		}
		return Rate{RateStr: rateStr, RateAt: now()}, nil
	}
}

// DepthClient 是汇率源需要的最小客户端能力（*coins.Client 满足它，测试可注入假实现）。
type DepthClient interface {
	OrderBook(ctx context.Context, symbol string, limit int) (coins.OrderBook, error)
}
