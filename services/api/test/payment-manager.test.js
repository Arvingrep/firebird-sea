const test = require('node:test');
const assert = require('node:assert');
const pm = require('../src/paymentManager');

test('尾数分配：金额落在 base+0.01 ~ base+0.90 且保留两位小数', () => {
  const c = pm.createPaymentCharge('ORD_RANGE', 15);
  assert.ok(c.amountToPay >= 15.01 && c.amountToPay <= 15.9);
  assert.strictEqual(c.amountToPay, Number(c.amountToPay.toFixed(2)));
  assert.strictEqual(c.status, 'PENDING');
});

test('尾数分配：并发挂起订单金额互不相同', () => {
  const amounts = new Set();
  for (let i = 0; i < 50; i++) {
    amounts.add(pm.createPaymentCharge(`ORD_UNIQ_${i}`, 100).amountToPay);
  }
  assert.strictEqual(amounts.size, 50);
});

test('按精确金额匹配挂起订单，确认支付后不再匹配并释放金额', () => {
  const c = pm.createPaymentCharge('ORD_MATCH', 7);
  assert.strictEqual(pm.findPendingChargeByAmount(c.amountToPay).chargeId, c.chargeId);
  const r = pm.confirmChargePaid(c.chargeId, 'tx_hash_1');
  assert.strictEqual(r.success, true);
  assert.strictEqual(pm.getCharge(c.chargeId).status, 'PAID');
  assert.strictEqual(pm.findPendingChargeByAmount(c.amountToPay), null);
});

test('确认不存在的订单返回失败', () => {
  assert.strictEqual(pm.confirmChargePaid('CHG_NONE', 'tx').success, false);
});
