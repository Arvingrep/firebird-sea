// Story 2.1 路由层测试（QA 第 4 轮 minor 3）：直接挂载 createCheckoutRouter，注入假连接与假验签。
// 覆盖 CHECKOUT_ENABLED 开关、401 鉴权、429 限流、服务端金额/归属（major 2）、错误码到 HTTP 状态映射。
const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const express = require('express');
const { createCheckoutRouter } = require('../src/checkoutRoute');

const NOW = Date.parse('2026-01-01T00:00:00Z');
const fresh = () => Promise.resolve({ rate_str: '62.5', rate_at: NOW - 1000 });

// 假连接：pay_log 金额 125.00 → 12500 centavos，归属会员 4242；fbs_charge 空库。
function fakeDb({ member = '4242', payLogRow = '125.00\t4242\t0' } = {}) {
  return {
    async query(sql) {
      if (sql.includes('pay_log')) return payLogRow;
      if (sql.includes('fbs_member_map')) return member;
      return '';
    },
  };
}

function startApp({ enabled = true, valid = true, db = fakeDb() } = {}) {
  const app = express();
  app.use(express.json());
  app.post('/tg-api/checkout', createCheckoutRouter({
    env: { CHECKOUT_ENABLED: enabled ? '1' : '0', TRON_MASTER_RECEIVE_ADDRESS: 'TADDR' },
    conn: () => db,
    getRate: fresh,
    now: () => NOW,
    validateInitData: (initData) => (initData === 'good' && valid
      ? { valid: true, user: { id: 100200 } }
      : { valid: false, error: 'bad' }),
    botToken: 'BOT',
  }));
  return new Promise((resolve) => {
    const server = app.listen(0, () => resolve({ server, port: server.address().port }));
  });
}

function post(port, body, initData = 'good') {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request(
      { host: '127.0.0.1', port, path: '/tg-api/checkout', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload), 'x-telegram-init-data': initData } },
      (res) => {
        let data = '';
        res.on('data', (c) => { data += c; });
        res.on('end', () => resolve({ status: res.statusCode, json: JSON.parse(data) }));
      },
    );
    req.on('error', reject);
    req.end(payload);
  });
}

test('CHECKOUT_ENABLED 未开启：503 CHECKOUT_DISABLED', async () => {
  const { server, port } = await startApp({ enabled: false });
  try {
    const r = await post(port, { ordernum: 'ORD1' });
    assert.strictEqual(r.status, 503);
    assert.strictEqual(r.json.error.code, 'CHECKOUT_DISABLED');
  } finally { server.close(); }
});

test('initData 非法：401 UNAUTHORIZED', async () => {
  const { server, port } = await startApp();
  try {
    const r = await post(port, { ordernum: 'ORD1' }, 'tampered');
    assert.strictEqual(r.status, 401);
    assert.strictEqual(r.json.error.code, 'UNAUTHORIZED');
  } finally { server.close(); }
});

test('major 2：金额来自服务端 pay_log 读数，客户端提交的 phpCentavos 被忽略', async () => {
  const { server, port } = await startApp();
  try {
    const r = await post(port, { ordernum: 'ORD1', phpCentavos: 1 });
    assert.strictEqual(r.status, 200);
    // 125.00 PHP × 100 = 12500 centavos → base 2000000 micro；绝不允许 1 centavo 的 base(160n 级)。
    assert.ok(r.json.data.payable_micro >= 2000000 + 10000 && r.json.data.payable_micro <= 2000000 + 900000);
    assert.strictEqual(r.json.data.address, 'TADDR');
  } finally { server.close(); }
});

test('major 2：归属不符（fbs_member_map 与 pay_log.uid 不同域）：403 ORDER_FORBIDDEN', async () => {
  const { server, port } = await startApp({ db: fakeDb({ member: '9999' }) });
  try {
    const r = await post(port, { ordernum: 'ORD1' });
    assert.strictEqual(r.status, 403);
    assert.strictEqual(r.json.error.code, 'ORDER_FORBIDDEN');
  } finally { server.close(); }
});

test('订单不存在：403 ORDER_NOT_FOUND；已支付：403 ORDER_NOT_PAYABLE', async () => {
  const a = await startApp({ db: fakeDb({ payLogRow: '' }) });
  try {
    const r = await post(a.port, { ordernum: 'ORD1' });
    assert.strictEqual(r.status, 403);
    assert.strictEqual(r.json.error.code, 'ORDER_NOT_FOUND');
  } finally { a.server.close(); }
  const b = await startApp({ db: fakeDb({ payLogRow: '125.00\t4242\t1' }) });
  try {
    const r = await post(b.port, { ordernum: 'ORD1' });
    assert.strictEqual(r.status, 403);
    assert.strictEqual(r.json.error.code, 'ORDER_NOT_PAYABLE');
  } finally { b.server.close(); }
});

test('限流：同一用户第 6 次请求 429 RATE_LIMITED', async () => {
  const { server, port } = await startApp();
  try {
    let last;
    for (let i = 0; i < 6; i++) last = await post(port, { ordernum: `ORD${i}` });
    assert.strictEqual(last.status, 429);
    assert.strictEqual(last.json.error.code, 'RATE_LIMITED');
  } finally { server.close(); }
});

test('ordernum 非法：400 BAD_REQUEST', async () => {
  const { server, port } = await startApp();
  try {
    const r = await post(port, { ordernum: "ORD'1" });
    assert.strictEqual(r.status, 400);
    assert.strictEqual(r.json.error.code, 'BAD_REQUEST');
  } finally { server.close(); }
});
