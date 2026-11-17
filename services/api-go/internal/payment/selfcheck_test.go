// 本文件是契约护栏，不是临时自检。
//
// `TestSelfCheckNaNSerializesAsNull` 目前是「金额为 NaN / ±Inf 时必须序列化成 null」
// 这条契约的唯一覆盖 —— 期望值取自真实 node 的 `JSON.stringify`，不是手写推测。
// 正式套件补齐前不要删；补齐后也保留双份（它们做的是逐字节比对，与结构性断言互补）。
package payment

import (
	"bytes"
	"encoding/json"
	"math"
	"math/rand"
	"strconv"
	"testing"
	"time"
)

func TestSelfCheckTailAllocationRange(t *testing.T) {
	clock := time.Unix(1700000000, 0)
	manager := New(Dep{Now: func() time.Time { return clock }})
	empty := ""
	charge := manager.CreatePaymentCharge("ORD_RANGE", 15, &empty)

	if charge.AmountToPay < 15.01 || charge.AmountToPay > 15.9 {
		t.Fatalf("amount out of tail range: %v", charge.AmountToPay)
	}
	if charge.AmountToPay != round2(charge.AmountToPay) {
		t.Fatalf("amount must keep two decimals: %v", charge.AmountToPay)
	}
	// 显式空串必须原样保留：Node 的默认参数只对 undefined 生效，
	// 这里回落到 TRC-20 会让响应里凭空多出一条前端没要求的链类型。
	if charge.Status != StatusPending || charge.Currency != "USDT" || charge.Network != "" {
		t.Fatalf("unexpected charge fields: %+v", charge)
	}
	if charge.TxHash != nil {
		t.Fatal("txHash must start as null")
	}
	if charge.ExpiresAt-charge.CreatedAt != int64(DefaultWindow/time.Millisecond) {
		t.Fatalf("window mismatch: %d", charge.ExpiresAt-charge.CreatedAt)
	}
}

// TestSelfCheckNetworkDefaultOnlyWhenAbsent 钉住默认值的生效边界：
// nil（= 调用方没给 network）→ TRC-20；非 nil（含空串）→ 原样使用。
func TestSelfCheckNetworkDefaultOnlyWhenAbsent(t *testing.T) {
	clock := time.Unix(1700000000, 0)
	manager := New(Dep{Now: func() time.Time { return clock }})

	absent := manager.CreatePaymentCharge("ORD_ABSENT", 10, nil)
	if absent.Network != DefaultNetwork {
		t.Fatalf("network 缺省应回落 %s，实得 %q", DefaultNetwork, absent.Network)
	}

	empty := ""
	if got := manager.CreatePaymentCharge("ORD_EMPTY", 11, &empty); got.Network != "" {
		t.Fatalf("显式空串必须原样使用，实得 %q", got.Network)
	}

	explicit := "BEP-20"
	if got := manager.CreatePaymentCharge("ORD_EXPLICIT", 12, &explicit); got.Network != "BEP-20" {
		t.Fatalf("显式值必须原样使用，实得 %q", got.Network)
	}
}

func TestSelfCheckAmountsStayUnique(t *testing.T) {
	clock := time.Unix(1700000000, 0)
	source := rand.New(rand.NewSource(7))
	manager := New(Dep{
		Now:  func() time.Time { return clock },
		Rand: source.Float64,
	})
	seen := make(map[float64]struct{}, 50)
	for i := 0; i < 50; i++ {
		charge := manager.CreatePaymentCharge("ORD_UNIQ", 100, nil)
		if _, dup := seen[charge.AmountToPay]; dup {
			t.Fatalf("duplicate amount %v", charge.AmountToPay)
		}
		seen[charge.AmountToPay] = struct{}{}
	}
	if len(seen) != 50 {
		t.Fatalf("expected 50 unique amounts, got %d", len(seen))
	}
}

func TestSelfCheckMatchAndConfirm(t *testing.T) {
	clock := time.Unix(1700000000, 0)
	manager := New(Dep{Now: func() time.Time { return clock }})
	charge := manager.CreatePaymentCharge("ORD_MATCH", 7, nil)

	found := manager.FindPendingChargeByAmount(charge.AmountToPay + 0.00005)
	if found == nil || found.ChargeID != charge.ChargeID {
		t.Fatalf("expected to match charge within tolerance, got %+v", found)
	}

	result := manager.ConfirmChargePaid(charge.ChargeID, "tx_hash_1")
	if !result.Success || result.Charge == nil || result.Charge.Status != StatusPaid || result.Charge.TxHash == nil {
		t.Fatalf("confirm failed: %+v", result)
	}
	if got := manager.GetCharge(charge.ChargeID); got == nil || got.Status != StatusPaid {
		t.Fatalf("expected PAID after confirm, got %+v", got)
	}
	if again := manager.FindPendingChargeByAmount(charge.AmountToPay); again != nil {
		t.Fatalf("paid charge must not match: %+v", again)
	}
}

func TestSelfCheckConfirmMissing(t *testing.T) {
	manager := New(Dep{})
	result := manager.ConfirmChargePaid("CHG_NONE", "tx")
	if result.Success || result.Error != "Charge not found" || result.Charge != nil {
		t.Fatalf("unexpected result: %+v", result)
	}
	if manager.GetCharge("CHG_NONE") != nil {
		t.Fatal("unknown charge should be nil")
	}
}

func TestSelfCheckExpiryReleasesAmount(t *testing.T) {
	clock := time.Unix(1700000000, 0)
	manager := New(Dep{Now: func() time.Time { return clock }})
	charge := manager.CreatePaymentCharge("ORD_EXPIRE", 5, nil)
	amount := charge.AmountToPay

	clock = clock.Add(DefaultWindow + time.Second)
	got := manager.GetCharge(charge.ChargeID)
	if got == nil || got.Status != StatusExpired {
		t.Fatalf("expected EXPIRED, got %+v", got)
	}
	if _, taken := manager.occupied[amount]; taken {
		t.Fatalf("amount should be released, %v still occupied", amount)
	}
}

func TestSelfCheckCopyIsolation(t *testing.T) {
	manager := New(Dep{})
	charge := manager.CreatePaymentCharge("ORD_COPY", 3, nil)
	charge.Status = StatusPaid
	if stored := manager.GetCharge(charge.ChargeID); stored.Status != StatusPending {
		t.Fatalf("mutating the returned struct must not affect the pool: %+v", stored)
	}
}

// TestSelfCheckNaNSerializesAsNull 钉住「非有限数 → null」这条与 Node 的契约。
//
// Node：JSON.stringify({baseAmount: NaN}) 得 {"baseAmount":null}，
// 所以 `POST /payment/create-charge` 传 amountUsdt:"abc" 时照样 200，只是金额字段是 null。
// Go：encoding/json 对 NaN 直接报错 `json: unsupported value: NaN`，writeJSON 的兜底会把它
// 变成 500 —— 状态码与 Node 不同，还会诱导客户端重试一个本应成功的请求。
func TestSelfCheckNaNSerializesAsNull(t *testing.T) {
	manager := New(Dep{})
	charge := manager.CreatePaymentCharge("ORD_NAN", math.NaN(), nil)

	payload, err := marshalNoEscape(t, charge)
	if err != nil {
		t.Fatalf("NaN 金额必须能序列化成 null，实际报错：%v", err)
	}
	want := `{"chargeId":"` + charge.ChargeID + `","orderId":"ORD_NAN","baseAmount":null,` +
		`"amountToPay":null,"currency":"USDT","network":"TRC-20","receiveAddress":"` +
		DefaultMasterAddress + `","status":"PENDING","createdAt":` +
		strconv.FormatInt(charge.CreatedAt, 10) + `,"expiresAt":` +
		strconv.FormatInt(charge.ExpiresAt, 10) + `,"txHash":null}`
	if string(payload) != want {
		t.Fatalf("序列化结果与 Node 不一致：\n got=%s\nwant=%s", payload, want)
	}
}

// TestSelfCheckMarshalKeepsFieldOrderAndEscaping 守住两个易被 MarshalJSON 改坏的字节级细节：
// 字段顺序（与 Node 返回对象一致）与「不转义 <、>、&」（res.json 不转义）。
// 注意 Charge.MarshalJSON 的返回值只被外层 appendCompact 压缩、不会反转义，
// 所以内层编码器一旦开了转义就会永久留在字节里 —— 这条用例就是防它。
func TestSelfCheckMarshalKeepsFieldOrderAndEscaping(t *testing.T) {
	txHash := "0xabc"
	charge := Charge{
		ChargeID:       "CHG_1",
		OrderID:        "ORD_1",
		BaseAmount:     10,
		AmountToPay:    10.01,
		Currency:       "USDT",
		Network:        "<script>",
		ReceiveAddress: "TADDR",
		Status:         StatusPaid,
		CreatedAt:      1700000000000,
		ExpiresAt:      1700000900000,
		TxHash:         &txHash,
		PaidAt:         1700000100000,
	}
	payload, err := marshalNoEscape(t, charge)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	want := `{"chargeId":"CHG_1","orderId":"ORD_1","baseAmount":10,"amountToPay":10.01,` +
		`"currency":"USDT","network":"<script>","receiveAddress":"TADDR","status":"PAID",` +
		`"createdAt":1700000000000,"expiresAt":1700000900000,"txHash":"0xabc","paidAt":1700000100000}`
	if string(payload) != want {
		t.Fatalf("字段顺序或转义与 Node 不一致：\n got=%s\nwant=%s", payload, want)
	}
}

// marshalNoEscape 复刻 httpapi.marshalJSON 的编码口径（不转义 HTML、不补结尾换行），
// 而不是直接用 json.Marshal —— 后者默认转义，与本包在生产里的实际序列化路径不同。
func marshalNoEscape(t *testing.T, body any) ([]byte, error) {
	t.Helper()
	buf := &bytes.Buffer{}
	encoder := json.NewEncoder(buf)
	encoder.SetEscapeHTML(false)
	if err := encoder.Encode(body); err != nil {
		return nil, err
	}
	return bytes.TrimSuffix(buf.Bytes(), []byte("\n")), nil
}
