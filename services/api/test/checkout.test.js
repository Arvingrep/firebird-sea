const test = require('node:test');
const assert = require('node:assert');
const { createCheckout, baseMicro, CheckoutError } = require('../src/checkout');

const NOW = Date.parse('2026-01-01T00:00:00Z');
const fresh = () => Promise.resolve({ rate_str: '62.5', rate_at: NOW - 1000 });

// 内存假连接：模拟 fbs_charge 的 tail_key 唯一约束；hook 可在 SELECT 之后注入并发写入。
function fakeConn({ occupiedTails = [], base = 0, afterSelect, existing, failFirstInsert } = {}) {
  const rows = occupiedTails.map((t) => ({ tail: t, payable: base + t * 10000 }));
  const inserts = [];
  return {
    rows,
    inserts,
    async query(sql) {
      if (sql.startsWith('UPDATE')) return '';
      if (sql.startsWith('SELECT ordernum')) return existing || '';
      if (sql.startsWith('SELECT')) {
        const out = rows.map((r) => r.payable).join('\n');
        if (afterSelect) afterSelect(rows);
        return out;
      }
      inserts.push(sql);
      if (existing) throw new Error("ERROR 1062 (23000): Duplicate entry 'ORD1' for key 'uq_fbs_charge_ordernum'");
      const payable = Number(/, (\d+), '62\.5'/.exec(sql)[1]);
      if (failFirstInsert && inserts.length === 1) {
        // 确定性并发冲突：对首次选中的尾数，另一请求已抢先落库
        rows.push({ tail: (payable % 1000000) / 10000, payable });
      }
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
  assert.strictEqual(baseMicro(100, '62.88'), 15904n); // ceil(1000000/62.88)
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
  const conn = fakeConn({ failFirstInsert: true });
  const r = await createCheckout(conn, args());
  assert.strictEqual(conn.inserts.length, 2); // 首次撞约束 → 重选 → 成功
  assert.notStrictEqual(conn.inserts[0], conn.inserts[1]);
  const payables = conn.rows.map((x) => x.payable);
  assert.strictEqual(new Set(payables).size, payables.length);
  assert.ok(payables.includes(r.payable_micro));
});

test('AC4 跨基础金额占用同一 payable 区间：只剩一个尾数时仍分配成功', async () => {
  // 其他基础金额的订单占用了 2000000 + 1e4..89e4，只剩尾数 90
  const conn = fakeConn();
  for (let t = 1; t <= 89; t++) conn.rows.push({ tail: 0, payable: 2000000 + t * 10000 });
  const r = await createCheckout(conn, args());
  assert.strictEqual(r.payable_micro, 2000000 + 90 * 10000);
});

test('幂等：ordernum 重复时返回已有收银台而非 ORDER_EXISTS', async () => {
  const conn = fakeConn({ existing: 'ORD1\t2310000\t62.5\t2025-12-31 23:59:59\t2026-01-01 00:15:00\tpending' });
  const r = await createCheckout(conn, args());
  assert.strictEqual(r.payable_micro, 2310000);
  assert.strictEqual(r.rate_at, '2025-12-31T23:59:59.000Z');
});

test('幂等命中已过期 / 非 pending 收银台：返回 EXPIRED 而非旧金额', async () => {
  for (const row of [
    'ORD1\t2310000\t62.5\t2025-12-31 23:00:00\t2025-12-31 23:15:00\tpending',
    'ORD1\t2310000\t62.5\t2025-12-31 23:59:59\t2026-01-01 00:15:00\texpired',
  ]) {
    await assert.rejects(createCheckout(fakeConn({ existing: row }), args()), { code: 'EXPIRED' });
  }
});

test('rate_str 保留原始价格字符串（高精度小数）', () => {
  assert.strictEqual(baseMicro(100, '0.00000001'), 100000000000000n); // 100*1e4/1e-8
});
