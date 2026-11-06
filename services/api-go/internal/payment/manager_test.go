// 逐条翻译自 services/api/test/payment-manager.test.js（4 条，全部 BEHAVIOR）。
//
// 时钟注入成「每次调用推进 1ms」的序列，保证同一测试内 chargeId 不撞车；
// 随机源保持真实 rand（与 Node 用 Math.random 一致），因此只断言范围与唯一性。
package payment

import (
	"sync"
	"testing"
	"time"
)

// ttSequentialClock 每次调用返回 base 往后递增 1ms 的时间。
type ttSequentialClock struct {
	mu   sync.Mutex
	base time.Time
	n    int64
}

func newTTClock() *ttSequentialClock {
	return &ttSequentialClock{base: time.Unix(1700000000, 0)}
}

func (c *ttSequentialClock) now() time.Time {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.n++
	return c.base.Add(time.Duration(c.n) * time.Millisecond)
}

func TestPaymentManager(t *testing.T) {
	t.Run("尾数分配：金额落在 base+0.01 ~ base+0.90 且保留两位小数", func(t *testing.T) {
		manager := New(Dep{Now: newTTClock().now})
		charge := manager.CreatePaymentCharge("ORD_RANGE", 15, nil)
		if charge.AmountToPay < 15.01 || charge.AmountToPay > 15.9 {
			t.Fatalf("金额应落在 15.01~15.9，实际 %v", charge.AmountToPay)
		}
		if charge.AmountToPay != round2(charge.AmountToPay) {
			t.Fatalf("金额应保留两位小数，实际 %v", charge.AmountToPay)
		}
		if charge.Status != "PENDING" {
			t.Fatalf("新建支付单状态应为 PENDING，实际 %q", charge.Status)
		}
	})

	t.Run("尾数分配：并发挂起订单金额互不相同", func(t *testing.T) {
		manager := New(Dep{Now: newTTClock().now})
		amounts := make(map[float64]struct{}, 50)
		for i := 0; i < 50; i++ {
			amounts[manager.CreatePaymentCharge("ORD_UNIQ_"+itoa(i), 100, nil).AmountToPay] = struct{}{}
		}
		if len(amounts) != 50 {
			t.Fatalf("50 笔挂起订单应有 50 个不同金额，实际 %d", len(amounts))
		}
	})

	t.Run("按精确金额匹配挂起订单，确认支付后不再匹配并释放金额", func(t *testing.T) {
		manager := New(Dep{Now: newTTClock().now})
		charge := manager.CreatePaymentCharge("ORD_MATCH", 7, nil)

		matched := manager.FindPendingChargeByAmount(charge.AmountToPay)
		if matched == nil || matched.ChargeID != charge.ChargeID {
			t.Fatalf("按金额应命中 %q，实际 %+v", charge.ChargeID, matched)
		}

		result := manager.ConfirmChargePaid(charge.ChargeID, "tx_hash_1")
		if !result.Success {
			t.Fatalf("确认支付应成功，实际 %+v", result)
		}
		if got := manager.GetCharge(charge.ChargeID); got == nil || got.Status != "PAID" {
			t.Fatalf("确认后状态应为 PAID，实际 %+v", got)
		}
		if got := manager.FindPendingChargeByAmount(charge.AmountToPay); got != nil {
			t.Fatalf("已支付订单不应再被匹配，实际 %+v", got)
		}
	})

	t.Run("确认不存在的订单返回失败", func(t *testing.T) {
		manager := New(Dep{Now: newTTClock().now})
		if result := manager.ConfirmChargePaid("CHG_NONE", "tx"); result.Success {
			t.Fatalf("确认不存在的订单必须失败，实际 %+v", result)
		}
	})

	// Node 的签名是 createPaymentCharge(orderID, baseAmount, network = 'TRC-20')：
	// 省略/undefined → 默认链；显式传（哪怕空串）→ 原样使用。
	// Go 侧用 *string 区分这两种意图 —— nil ≙ undefined，非 nil ≙ 显式传值。
	// 原用例里那三个 "" 已被改成 nil（调用方的意图都是「不指定」），此用例专门钉住
	// 「显式传空串仍是显式」这半边语义，避免指针改造把区分能力丢掉。
	t.Run("network：nil 取默认链，显式传值（含空串）原样保留", func(t *testing.T) {
		manager := New(Dep{Now: newTTClock().now})

		if got := manager.CreatePaymentCharge("ORD_NIL", 10, nil).Network; got != DefaultNetwork {
			t.Fatalf("nil 应回落默认链 %q，实际 %q", DefaultNetwork, got)
		}

		empty := ""
		if got := manager.CreatePaymentCharge("ORD_EMPTY", 10, &empty).Network; got != "" {
			t.Fatalf("显式空串必须原样保留（Node 的 network='' 语义），实际 %q", got)
		}

		other := "BEP-20"
		if got := manager.CreatePaymentCharge("ORD_OTHER", 10, &other).Network; got != "BEP-20" {
			t.Fatalf("显式链类型应原样使用，实际 %q", got)
		}
	})
}

func itoa(v int) string {
	if v == 0 {
		return "0"
	}
	var digits []byte
	for v > 0 {
		digits = append([]byte{byte('0' + v%10)}, digits...)
		v /= 10
	}
	return string(digits)
}
