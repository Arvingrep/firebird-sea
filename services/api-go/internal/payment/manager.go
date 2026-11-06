// Package payment 是 USDT 收银台的内存订单池：单一收款主地址 + 动态微小尾数，
// 用「金额唯一」代替「一人一地址」，避免为每个用户生成冷热私钥。
//
// 局限（与 Node 版一致）：状态在进程内存里，重启即丢、多副本不共享。
// 生产切 Redis 之前，本包只适合单副本或「重启即让用户重新下单」的场景。
package payment

import (
	"bytes"
	"encoding/json"
	"math"
	"math/rand"
	"strconv"
	"sync"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/jsonfloat"
)

// 默认参数与 Node 版一致。
const (
	// DefaultMasterAddress 是占位地址，生产必须由 TRON_MASTER_RECEIVE_ADDRESS 覆盖。
	DefaultMasterAddress = "TW4Q8tq6U1z3wWkEXAMPLETRONADDR9999"
	// DefaultWindow 是支付倒计时窗口。
	DefaultWindow = 15 * time.Minute
	// tailCentsRange 是尾数上限（0.01 ~ 0.90，共 90 个可用尾数）。
	tailCentsRange = 90
	// allocateAttempts 是尾数分配的尝试上限，超过就退回基础金额（与 Node 行为一致）。
	allocateAttempts = 100
	// matchTolerance 是链上金额匹配容差。
	matchTolerance = 1e-4
)

// Charge 的字段名与顺序与 Node 版返回对象一致（JSON 逐字对齐）。
type Charge struct {
	ChargeID       string  `json:"chargeId"`
	OrderID        string  `json:"orderId"`
	BaseAmount     float64 `json:"baseAmount"`
	AmountToPay    float64 `json:"amountToPay"`
	Currency       string  `json:"currency"`
	Network        string  `json:"network"`
	ReceiveAddress string  `json:"receiveAddress"`
	Status         string  `json:"status"`
	CreatedAt      int64   `json:"createdAt"`
	ExpiresAt      int64   `json:"expiresAt"`
	TxHash         *string `json:"txHash"`
	// PaidAt 只在确认支付后出现，因此 omitempty；Node 是动态挂字段。
	PaidAt int64 `json:"paidAt,omitempty"`
}

// MarshalJSON 让 Charge 的序列化与 res.json 逐字一致（含字段顺序）。
//
// 两个金额字段走 jsonfloat.Float：Node 的 JSON.stringify 把 NaN / ±Inf 写成 null
// （`POST /payment/create-charge` 传 amountUsdt:"abc" 时 jsNumber 得 NaN，`NaN <= 0` 为 false
// 所以 Node 照样建单并回 200 + null），而 encoding/json 对非有限数是硬错误，
// writeJSON 的兜底会把它变成 500 —— 状态码不同，还会诱导客户端重试本应成功的请求。
//
// 必须在类型上做而不是在 handler 里做：NaN 会留在 Manager 内存里的 charge 上，于是
// /payment/create-charge、/payment/status/{id}、/payment/mock-webhook 三条路径拿到同一个
// 对象都会炸；在序列化入口收口才能一次覆盖。
//
// 这里自己开 Encoder 而不是 json.Marshal，是为了不把 <、>、& 转成 \u003c ——
// MarshalJSON 的返回值只会被外层 appendCompact 压缩、不会反转义，内层一开转义就永久留在字节里。
// （`network: "<x>"` 这种输入在 Node 是原样输出。）
func (c Charge) MarshalJSON() ([]byte, error) {
	buf := &bytes.Buffer{}
	encoder := json.NewEncoder(buf)
	encoder.SetEscapeHTML(false)
	err := encoder.Encode(struct {
		ChargeID       string          `json:"chargeId"`
		OrderID        string          `json:"orderId"`
		BaseAmount     jsonfloat.Float `json:"baseAmount"`
		AmountToPay    jsonfloat.Float `json:"amountToPay"`
		Currency       string          `json:"currency"`
		Network        string          `json:"network"`
		ReceiveAddress string          `json:"receiveAddress"`
		Status         string          `json:"status"`
		CreatedAt      int64           `json:"createdAt"`
		ExpiresAt      int64           `json:"expiresAt"`
		TxHash         *string         `json:"txHash"`
		PaidAt         int64           `json:"paidAt,omitempty"`
	}{
		ChargeID:       c.ChargeID,
		OrderID:        c.OrderID,
		BaseAmount:     jsonfloat.Float(c.BaseAmount),
		AmountToPay:    jsonfloat.Float(c.AmountToPay),
		Currency:       c.Currency,
		Network:        c.Network,
		ReceiveAddress: c.ReceiveAddress,
		Status:         c.Status,
		CreatedAt:      c.CreatedAt,
		ExpiresAt:      c.ExpiresAt,
		TxHash:         c.TxHash,
		PaidAt:         c.PaidAt,
	})
	if err != nil {
		return nil, err
	}
	// Encode 追加的换行不是 JSON 的一部分。
	return bytes.TrimSuffix(buf.Bytes(), []byte("\n")), nil
}

// 状态机：PENDING → PAID / EXPIRED，不可逆。
const (
	StatusPending = "PENDING"
	StatusPaid    = "PAID"
	StatusExpired = "EXPIRED"
)

// Dep 注入时钟与随机源。生产用默认值，测试用固定序列以覆盖尾数碰撞分支。
type Dep struct {
	MasterAddress string
	Window        time.Duration
	Now           func() time.Time
	// Rand 返回 [0,1) 的随机数，语义同 Math.random。
	Rand func() float64
}

// Manager 是并发安全的内存订单池。
type Manager struct {
	master string
	window time.Duration
	now    func() time.Time
	rand   func() float64

	mu       sync.Mutex
	active   map[string]*Charge
	occupied map[float64]struct{}
}

func New(d Dep) *Manager {
	master := d.MasterAddress
	if master == "" {
		master = DefaultMasterAddress
	}
	window := d.Window
	if window <= 0 {
		window = DefaultWindow
	}
	now := d.Now
	if now == nil {
		now = time.Now
	}
	randFloat := d.Rand
	if randFloat == nil {
		randFloat = rand.Float64
	}
	return &Manager{
		master:   master,
		window:   window,
		now:      now,
		rand:     randFloat,
		active:   make(map[string]*Charge),
		occupied: make(map[float64]struct{}),
	}
}

// DefaultNetwork 是「调用方没给 network」时的默认链类型。
const DefaultNetwork = "TRC-20"

// CreatePaymentCharge 创建支付单并占用一个唯一金额。
//
// network 用指针而不是字符串，是为了复刻 Node 默认参数的生效范围：
// `function createPaymentCharge(orderId, baseAmountUsdt, network = 'TRC-20')`
// 只在参数为 **undefined** 时套默认值。显式传空串（前端 `network: ""`）时 Node 会把
// 空串原样写进 charge.network，用 `string` + 空串回落会在响应里凭空变成 "TRC-20" ——
// 那是可观测的对外行为差异。
//
// 因此：nil → DefaultNetwork；非 nil 一律原样使用（含空串）。
func (m *Manager) CreatePaymentCharge(orderID string, baseAmount float64, network *string) *Charge {
	chosen := DefaultNetwork
	if network != nil {
		chosen = *network
	}
	m.mu.Lock()
	defer m.mu.Unlock()

	m.cleanExpiredLocked()

	// 找未被占用的动态尾数：base + 0.01 ~ base + 0.90。
	// 尾数必须唯一，否则两笔待支付订单的链上转账无法区分归属。
	allocated := baseAmount
	for attempt := 0; attempt < allocateAttempts; attempt++ {
		randomCent := float64(int(m.rand()*tailCentsRange)+1) / 100
		candidate := round2(baseAmount + randomCent)
		if _, taken := m.occupied[candidate]; !taken {
			allocated = candidate
			m.occupied[candidate] = struct{}{}
			break
		}
	}

	now := m.now()
	charge := &Charge{
		ChargeID:       "CHG_" + strconv.FormatInt(now.UnixMilli(), 10) + "_" + strconv.Itoa(int(m.rand()*1000)),
		OrderID:        orderID,
		BaseAmount:     baseAmount,
		AmountToPay:    allocated,
		Currency:       "USDT",
		Network:        chosen,
		ReceiveAddress: m.master,
		Status:         StatusPending,
		CreatedAt:      now.UnixMilli(),
		ExpiresAt:      now.Add(m.window).UnixMilli(),
		TxHash:         nil,
	}
	m.active[charge.ChargeID] = charge
	return copyCharge(charge)
}

// GetCharge 返回支付单；过期的 PENDING 会被就地标记 EXPIRED 并释放金额占用。
func (m *Manager) GetCharge(chargeID string) *Charge {
	m.mu.Lock()
	defer m.mu.Unlock()

	charge, ok := m.active[chargeID]
	if !ok {
		return nil
	}
	m.expireIfNeededLocked(charge)
	return copyCharge(charge)
}

// ConfirmChargePaid 标记支付成功（由链上监听或 webhook 触发）。
func (m *Manager) ConfirmChargePaid(chargeID, txHash string) ConfirmResult {
	m.mu.Lock()
	defer m.mu.Unlock()

	charge, ok := m.active[chargeID]
	if !ok {
		return ConfirmResult{Success: false, Error: "Charge not found"}
	}
	charge.Status = StatusPaid
	charge.TxHash = &txHash
	charge.PaidAt = m.now().UnixMilli()
	delete(m.occupied, charge.AmountToPay)
	return ConfirmResult{Success: true, Charge: copyCharge(charge)}
}

// ConfirmResult 对应 Node 的 {success, charge} / {success:false, error:'Charge not found'}。
type ConfirmResult struct {
	Success bool    `json:"success"`
	Charge  *Charge `json:"charge,omitempty"`
	Error   string  `json:"error,omitempty"`
}

// FindPendingChargeByAmount 按链上转账金额精确寻找挂起订单（容差 1e-4）。
func (m *Manager) FindPendingChargeByAmount(amount float64) *Charge {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.cleanExpiredLocked()
	for _, charge := range m.active {
		if charge.Status == StatusPending && math.Abs(charge.AmountToPay-amount) < matchTolerance {
			return copyCharge(charge)
		}
	}
	return nil
}

func (m *Manager) cleanExpiredLocked() {
	for _, charge := range m.active {
		m.expireIfNeededLocked(charge)
	}
}

func (m *Manager) expireIfNeededLocked(charge *Charge) {
	if charge.Status == StatusPending && m.now().UnixMilli() > charge.ExpiresAt {
		charge.Status = StatusExpired
		delete(m.occupied, charge.AmountToPay)
	}
}

// round2 等价 Number(x.toFixed(2))：金额对外只保留两位小数，
// 否则浮点累加会让「15.01」变成「15.010000000000002」而无法与链上金额匹配。
func round2(v float64) float64 {
	return math.Round(v*100) / 100
}

// copyCharge 返回副本：调用方拿到的是快照，不会绕过锁改到内存池里的状态。
func copyCharge(c *Charge) *Charge {
	clone := *c
	if c.TxHash != nil {
		tx := *c.TxHash
		clone.TxHash = &tx
	}
	return &clone
}
