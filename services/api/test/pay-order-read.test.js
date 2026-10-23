const test = require('node:test');
const assert = require('node:assert');
const { readPayOrder, assertOwnership, centavosFromDecimal, OrderReadError } = require('../src/payOrderRead');

// 假连接：按 SQL 前缀返回预置行。
function connFor({ payLog, memberMap }) {
  return {
    async query(sql) {
      if (sql.includes('pay_log')) return payLog === null ? '' : payLog;
      if (sql.includes('fbs_member_map')) return memberMap || '';
      throw new Error(`unexpected sql: ${sql}`);
    },
  };
}

test('centavosFromDecimal：decimal(8,2) 文本 → 整数 centavos，无浮点误差', () => {
  assert.strictEqual(centavosFromDecimal('125.00'), 12500);
  assert.strictEqual(centavosFromDecimal('0.01'), 1);
  assert.strictEqual(centavosFromDecimal('999999.99'), 99999999);
  for (const bad of ['125', '125.0', '125.000', '-1.00', 'abc']) {
    assert.throws(() => centavosFromDecimal(bad), (e) => e instanceof OrderReadError && e.code === 'ORDER_INVALID');
  }
});

test('readPayOrder：待支付订单返回金额（centavos）与火鸟会员 id', async () => {
  const conn = connFor({ payLog: '125.00\t4242\t0' });
  const r = await readPayOrder('ORD1', conn, 'huoniao_');
  assert.strictEqual(r.centavos, 12500);
  assert.strictEqual(r.memberId, 4242);
});

test('readPayOrder：SQL 只读、表名带前缀、ordernum 白名单校验', async () => {
  const seen = [];
  const conn = { async query(sql) { seen.push(sql); return '1.00\t2\t0'; } };
  await readPayOrder('ORD-9_x', conn, 'hs_');
  assert.match(seen[0], /^SELECT amount, uid, state FROM `hs_pay_log` WHERE ordernum='ORD-9_x'/);
  for (const bad of ["ORD'1", 'ORD 1', ';DROP', '', 'x'.repeat(65)]) {
    await assert.rejects(readPayOrder(bad, conn), (e) => e instanceof OrderReadError && e.code === 'BAD_REQUEST');
  }
  await assert.rejects(readPayOrder('ORD1', conn, 'bad;prefix'), { code: 'ORDER_INVALID' });
});

test('readPayOrder：订单不存在 / 已支付 / uid 非法分别拒绝', async () => {
  await assert.rejects(readPayOrder('ORD1', connFor({ payLog: null })), { code: 'ORDER_NOT_FOUND' });
  await assert.rejects(readPayOrder('ORD1', connFor({ payLog: '125.00\t4242\t1' })), { code: 'ORDER_NOT_PAYABLE' });
  await assert.rejects(readPayOrder('ORD1', connFor({ payLog: '125.00\t0\t0' })), { code: 'ORDER_INVALID' });
});

test('assertOwnership：fbs_member_map 命中订单 uid 才放行', async () => {
  await assertOwnership(connFor({ memberMap: '4242' }), '100200', 4242);
  await assert.rejects(assertOwnership(connFor({ memberMap: '9999' }), '100200', 4242), { code: 'ORDER_FORBIDDEN' });
  await assert.rejects(assertOwnership(connFor({ memberMap: '' }), '100200', 4242), { code: 'ORDER_FORBIDDEN' });
  await assert.rejects(assertOwnership(connFor({ memberMap: '4242' }), 'x;1', 4242), { code: 'UNAUTHORIZED' });
});
