const test = require('node:test');
const assert = require('node:assert');
const { createCheckout, baseMicro, CheckoutError } = require('../src/checkout');

const NOW = Date.parse('2026-01-01T00:00:00Z');
const fresh = () => Promise.resolve({ rate_str: '62.5', rate_at: NOW - 1000 });

// 内存假连接：模拟 fbs_charge 的 tail_key 唯一约束；hook 可在 SELECT 之后注入并发写入。
function fakeConn({ occupiedTails = [], base = 0, afterSelect } = {}) {
  const rows = occupiedTails.map((t) => ({ tail: t, payable: base + t * 10000 }));
  const inserts = [];
  return {
    rows,
    inserts,
    async query(sql) {
      if (sql.startsWith('UPDATE')) return '';
      if (sql.startsWith('SELECT')) {
        const out = rows.map((r) => r.tail).join('\n');
        if (afterSelect) afterSelect(rows);
        return out;
      }
      inserts.push(sql);
      const payable = Number(/, (\d+), '62\.5'/.exec(sql)[1]);
      if (rows.some((r) => r.payable === payable)) {
        throw new Error("ERROR 1062 (23000): Duplicate entry '" + payable + "' for key 'uq_fbs_charge_tail'");
      }
      rows.push({ tail: (payable % 1000000) / 10000, payable });
      return '';
    },
  };
}

const args = (o = {}) => ({ ordernum: 'ORD1', phpCentavos: 12500, getRate: fresh, now: () => NOW, address: 'TADDR', ...o });

test('AC1 应付金额 = ceil(centavos*1e4/rate) + tail*1e4，返回快照字段', async () => {
  assert.strictEqual(baseMicro(12500, '62.5'), 2000000n);
  assert.strictEqual(baseMicro(100, '62.88'), 159033n); // ceil(1000000/62.88)
  const conn = fakeConn();
  const r = await createCheckout(conn, args());
  const tail = r.payable_micro - 2000000;
  assert.ok(tail >= 10000 && tail <= 900000 && tail % 10000 === 0);
  assert.strictEqual(r.rate_str, '62.5');
  assert.strictEqual(r.rate_at, new Date(NOW - 1000).toISOString());
  assert.match(conn.inserts[0], /'2025-12-31 23:59:59'/);
});

test('AC2 90 个尾数全被占用时拒绝并提示稍后再试', async () => {
  const all = Array.from({ length: 90 }, (_, i) => i + 1);
  const conn = fakeConn({ occupiedTails: all, base: 2000000 });
  await assert.rejects(createCheckout(conn, args()), (e) => e instanceof CheckoutError && e.code === 'TAIL_EXHAUSTED' && /稍后再试/.test(e.message));
  assert.strictEqual(conn.inserts.length, 0);
});

test('AC3 汇率获取失败或快照超过 60 秒：不写库并返回明确错误', async () => {
  const conn = fakeConn();
  await assert.rejects(createCheckout(conn, args({ getRate: () => Promise.reject(new Error('boom')) })), { code: 'RATE_UNAVAILABLE' });
  const stale = () => Promise.resolve({ rate_str: '62.5', rate_at: NOW - 61000 });
  await assert.rejects(createCheckout(conn, args({ getRate: stale })), { code: 'RATE_STALE' });
  assert.strictEqual(conn.inserts.length, 0);
});

test('AC4 并发算出相同 payable_micro：唯一约束拒绝一方，其重新分配尾数', async () => {
  let injected = false;
  const conn = fakeConn({
    afterSelect: (rows) => {
      if (injected) return;
      injected = true;
      // 另一请求在本请求 SELECT 之后抢占了尾数 1..45；若本请求恰选中其一，INSERT 撞唯一约束后重选
      for (let t = 1; t <= 45; t++) rows.push({ tail: t, payable: 2000000 + t * 10000 });
    },
  });
  const r = await createCheckout(conn, args());
  assert.ok(conn.inserts.length >= 1);
  const payables = conn.rows.map((x) => x.payable);
  assert.strictEqual(new Set(payables).size, payables.length);
  assert.ok(payables.includes(r.payable_micro));
});
