const test = require('node:test');
const assert = require('node:assert');
const { createCheckout, baseMicro, CheckoutError } = require('../src/checkout');

const NOW = Date.parse('2026-01-01T00:00:00Z');
const fresh = () => Promise.resolve({ rate_str: '62.5', rate_at: NOW - 1000 });

// 真实 MariaDB 10.5 样例（生成列唯一键冲突的报错文本，测试据此核对匹配正则）。
const REAL_TAIL_ERR =
  "ERROR 1062 (23000) at line 1: Duplicate entry '424242' for key 'uq_fbs_charge_tail'";

// 内存假连接：模拟 fbs_charge 的 tail_key / ordernum 唯一约束。
// existingRow：findExisting SELECT 的一行（id..state 制表符分隔）；forUpdateRow 缺省同上。
function fakeConn({ occupiedTails = [], base = 0, afterSelect, existingRow, forUpdateRow, failFirstInsert, realTailError = false } = {}) {
  const rows = occupiedTails.map((t) => ({ tail: t, payable: base + t * 10000 }));
  const inserts = [];
  const updates = [];
  const calls = [];
  return {
    rows,
    inserts,
    updates,
    calls,
    async query(sql) {
      calls.push(sql);
      if (/^(BEGIN|COMMIT|ROLLBACK)/.test(sql)) return '';
      if (/FOR UPDATE/.test(sql)) return (forUpdateRow === undefined ? existingRow : forUpdateRow) || '';
      if (/^SELECT id, ordernum/.test(sql)) return existingRow || '';
      if (sql.startsWith('UPDATE')) {
        updates.push(sql);
        return '';
      }
      if (sql.startsWith('SELECT')) {
        const out = rows.map((r) => r.payable).join('\n');
        if (afterSelect) afterSelect(rows);
        return out;
      }
      inserts.push(sql);
      const payable = Number(/, (\d+), '62\.5'/.exec(sql)[1]);
      if (failFirstInsert && inserts.length === 1) {
        // 确定性并发冲突：对首次选中的尾数，另一请求已抢先落库
        rows.push({ tail: (payable % 1000000) / 10000, payable });
      }
      if (rows.some((r) => r.payable === payable)) {
        throw new Error(realTailError ? REAL_TAIL_ERR : `Duplicate entry '${payable}' for key 'uq_fbs_charge_tail'`);
      }
      rows.push({ tail: (payable % 1000000) / 10000, payable });
      return '';
    },
  };
}

const args = (o = {}) => ({ ordernum: 'ORD1', serverCentavos: 12500, getRate: fresh, now: () => NOW, address: 'TADDR', ...o });

test('AC1 应付金额 = ceil(centavos*1e4/rate) + tail*1e4，返回快照字段（rate_at 为落库秒精度）', async () => {
  assert.strictEqual(baseMicro(12500, '62.5'), 2000000n);
  assert.strictEqual(baseMicro(100, '62.88'), 15904n); // ceil(1000000/62.88)
  const conn = fakeConn();
  const r = await createCheckout(conn, args());
  const tail = r.payable_micro - 2000000;
  assert.ok(tail >= 10000 && tail <= 900000 && tail % 10000 === 0);
  assert.strictEqual(r.rate_str, '62.5');
  assert.strictEqual(r.rate_at, '2025-12-31T23:59:59Z');
  assert.strictEqual(r.expires_at, '2026-01-01T00:15:00Z');
  assert.match(conn.inserts[0], /'2025-12-31 23:59:59'/);
});

test('金额必须来自服务端读数：非正整数或非法值直接 BAD_REQUEST（不接受客户端提交）', async () => {
  for (const bad of [undefined, null, 0, -5, 12.5, '12500', 1n]) {
    await assert.rejects(createCheckout(fakeConn(), args({ serverCentavos: bad })), { code: 'BAD_REQUEST' });
  }
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

test('AC4 撞尾数的判定正则匹配真实 MariaDB 报错文本', async () => {
  const conn = fakeConn({ failFirstInsert: true, realTailError: true });
  const r = await createCheckout(conn, args());
  assert.strictEqual(conn.inserts.length, 2);
  assert.ok(r.payable_micro > 2000000);
});

test('AC4 跨基础金额占用同一 payable 区间：只剩一个尾数时仍分配成功', async () => {
  // 其他基础金额的订单占用了 2000000 + 1e4..89e4，只剩尾数 90
  const conn = fakeConn();
  for (let t = 1; t <= 89; t++) conn.rows.push({ tail: 0, payable: 2000000 + t * 10000 });
  const r = await createCheckout(conn, args());
  assert.strictEqual(r.payable_micro, 2000000 + 90 * 10000);
});

test('幂等：ordernum 重复且未过期时返回已有收银台，且不再取汇率', async () => {
  const row = '7\tORD1\t2310000\t62.5\t2025-12-31 23:59:00\t2026-01-01 00:15:00\tpending';
  const conn = fakeConn({ existingRow: row });
  let rateCalls = 0;
  const r = await createCheckout(conn, args({ getRate: () => { rateCalls++; return fresh(); } }));
  assert.strictEqual(r.payable_micro, 2310000);
  assert.strictEqual(r.rate_at, '2025-12-31T23:59:00Z');
  assert.strictEqual(rateCalls, 0); // 幂等先于取价（minor 2）
});

test('幂等返回与首次创建的 rate_at 精度一致（均为落库秒精度）', async () => {
  const created = await createCheckout(fakeConn(), args());
  const storedRateAt = created.rate_at.slice(0, 19).replace('T', ' '); // 落库为无 Z 的 DATETIME
  const row = `7\tORD1\t${created.payable_micro}\t62.5\t${storedRateAt}\t2026-01-01 00:15:00\tpending`;
  const again = await createCheckout(fakeConn({ existingRow: row }), args());
  assert.strictEqual(again.rate_at, created.rate_at);
  assert.strictEqual(again.payable_micro, created.payable_micro);
});

test('major 1：同 ordernum 过期后可复用旧行续期（UPDATE，不新增行）', async () => {
  const expiredRow = '7\tORD1\t2310000\t62.5\t2025-12-31 23:00:00\t2025-12-31 23:15:00\tpending';
  const conn = fakeConn({ existingRow: expiredRow });
  const r = await createCheckout(conn, args());
  assert.strictEqual(conn.inserts.length, 0);
  const rowUpdates = conn.updates.filter((u) => /WHERE id='/.test(u));
  assert.strictEqual(rowUpdates.length, 1);
  assert.match(rowUpdates[0], /WHERE id='7'/);
  assert.match(rowUpdates[0], /state='pending', holds_tail=1/);
  assert.match(rowUpdates[0], /expires_at='2026-01-01 00:15:00'/);
  const tail = r.payable_micro - 2000000;
  assert.ok(tail >= 10000 && tail <= 900000);
  assert.strictEqual(r.expires_at, '2026-01-01T00:15:00Z');
});

test('major 1：expired 状态旧行同样可复用', async () => {
  const row = '9\tORD1\t2310000\t62.5\t2025-12-31 23:00:00\t2025-12-31 23:15:00\texpired';
  const conn = fakeConn({ existingRow: row });
  const r = await createCheckout(conn, args());
  assert.strictEqual(conn.updates.filter((u) => /WHERE id='/.test(u)).length, 1);
  assert.ok(r.payable_micro > 2000000);
});

test('major 1：事务内重读发现并发请求已续期 → 幂等返回其结果，不再 UPDATE', async () => {
  const expiredRow = '7\tORD1\t2310000\t62.5\t2025-12-31 23:00:00\t2025-12-31 23:15:00\tpending';
  const renewedRow = '7\tORD1\t2320000\t62.5\t2025-12-31 23:59:59\t2026-01-01 00:14:59\tpending';
  const conn = fakeConn({ existingRow: expiredRow, forUpdateRow: renewedRow });
  const r = await createCheckout(conn, args());
  assert.strictEqual(conn.updates.filter((u) => /WHERE id='/.test(u)).length, 0);
  assert.strictEqual(r.payable_micro, 2320000);
});

test('matched 终态不得复用重建（资金安全守卫）', async () => {
  const row = '7\tORD1\t2310000\t62.5\t2025-12-31 23:00:00\t2026-01-01 00:15:00\tmatched';
  await assert.rejects(createCheckout(fakeConn({ existingRow: row }), args()), { code: 'ORDER_EXISTS' });
});

test('rate_str 保留原始价格字符串（高精度小数）', () => {
  assert.strictEqual(baseMicro(100, '0.00000001'), 100000000000000n); // 100*1e4/1e-8
});

test('major 1（第 5 轮）：取尾数前先释放过期 pending 占用，再扫描占用区间', async () => {
  const conn = fakeConn();
  await createCheckout(conn, args());
  assert.strictEqual(conn.updates.length, 1);
  assert.match(conn.updates[0], /SET state='expired', holds_tail=0/);
  assert.match(conn.updates[0], /state='pending' AND holds_tail=1 AND expires_at <= '2026-01-01 00:00:00'/);
  const sweepIdx = conn.calls.findIndex((q) => /SET state='expired'/.test(q));
  const scanIdx = conn.calls.findIndex((q) => /SELECT payable_micro FROM fbs_charge/.test(q));
  assert.ok(sweepIdx >= 0 && scanIdx > sweepIdx, '清理必须发生在占用扫描之前');
});

test('major 2（第 5 轮）：幂等键命中他人订单时拒绝，不返回他人收银台', async () => {
  const foreign = '7	OTHER-ORD	2310000	62.5	2025-12-31 23:59:00	2026-01-01 00:15:00	pending';
  const conn = fakeConn({ existingRow: foreign });
  await assert.rejects(
    createCheckout(conn, args({ idempotencyKey: 'IDEM-B' })),
    (e) => e instanceof CheckoutError && e.code === 'ORDER_EXISTS' && /其他订单/.test(e.message),
  );
  assert.strictEqual(conn.inserts.length, 0);
  assert.strictEqual(conn.updates.length, 0);
});

test('minor（第 5 轮）：rate_at 晚于当前时间（未来时间戳）按汇率过期处理', async () => {
  const conn = fakeConn();
  await assert.rejects(
    createCheckout(conn, args({ getRate: () => Promise.resolve({ rate_str: '62.5', rate_at: NOW + 60000 }) })),
    { code: 'RATE_STALE' },
  );
  assert.strictEqual(conn.inserts.length, 0);
});
