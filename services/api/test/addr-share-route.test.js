// 地址分享路由测试：鉴权、入参裁剪、快照存读、token 格式、过期、限流、bot 用户名缺失时的降级。
const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const express = require('express');
const { createAddrShareRouter } = require('../src/addrShareRoute');

const NOW = 1_700_000_000;
const VALID_TOKEN = 'a'.repeat(32);

function startApp({ validToken = true, mid = 4242, db, botToken = '', shareMax = 10, limitRead = null } = {}) {
  const calls = [];
  const store = db || (async (sql) => {
    calls.push(sql);
    if (sql.includes('SELECT payload')) return JSON.stringify({ person: 'Alex', street: 'A', lat: '1', lng: '2' });
    return '';
  });
  const app = express();
  app.use(express.json());
  app.use('/tg-api/addr', createAddrShareRouter({
    conn: { query: store },
    tokens: { verify: (t) => (validToken && t === 'good' ? { valid: true, claims: { mid } } : { valid: false }) },
    botToken,
    now: () => NOW,
    allowCreate: (() => { let n = 0; return () => ++n <= shareMax; })(),
    allowRead: limitRead,
  }));
  return new Promise((resolve) => {
    const server = app.listen(0, () => resolve({ server, port: server.address().port, calls }));
  });
}

function req(port, path, { method = 'GET', body, auth } = {}) {
  return new Promise((resolve, reject) => {
    const payload = body === undefined ? null : JSON.stringify(body);
    const headers = {};
    if (payload) { headers['Content-Type'] = 'application/json'; headers['Content-Length'] = Buffer.byteLength(payload); }
    if (auth) headers.Authorization = auth;
    const r = http.request({ host: '127.0.0.1', port, path, method, headers }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => { let json = null; try { json = JSON.parse(data); } catch (e) { /* 非 JSON */ } resolve({ status: res.statusCode, json }); });
    });
    r.on('error', reject);
    r.end(payload);
  });
}

const GOOD = { person: 'Alex', tel: '@alex', street: '1450 Ala Moana Blvd', address: '1450 Ala Moana Blvd，5B', lat: '21.28', lng: '-157.83' };

test('分享：缺令牌返回 401', async () => {
  const { server, port } = await startApp({});
  try {
    const r = await req(port, '/tg-api/addr/share', { method: 'POST', body: GOOD });
    assert.strictEqual(r.status, 401);
    assert.strictEqual(r.json.error.code, 'UNAUTHORIZED');
  } finally { server.close(); }
});

test('分享：缺坐标返回 400', async () => {
  const { server, port } = await startApp({});
  try {
    const r = await req(port, '/tg-api/addr/share', { method: 'POST', auth: 'Bearer good', body: { street: 'X' } });
    assert.strictEqual(r.status, 400);
    assert.strictEqual(r.json.error.code, 'INVALID');
  } finally { server.close(); }
});

test('分享：mid 非法返回 403', async () => {
  const { server, port } = await startApp({ mid: 0 });
  try {
    const r = await req(port, '/tg-api/addr/share', { method: 'POST', auth: 'Bearer good', body: GOOD });
    assert.strictEqual(r.status, 403);
  } finally { server.close(); }
});

test('分享：成功返回 32 位 hex token 并写库，botToken 缺失时 url 为 null', async () => {
  const { server, port, calls } = await startApp({});
  try {
    const r = await req(port, '/tg-api/addr/share', { method: 'POST', auth: 'Bearer good', body: GOOD });
    assert.strictEqual(r.status, 200);
    assert.match(r.json.data.token, /^[0-9a-f]{32}$/);
    assert.strictEqual(r.json.data.url, null);
    assert.strictEqual(r.json.data.expiresAt, NOW + 7 * 24 * 3600);
    const insert = calls.find((s) => s.includes('INSERT INTO fbs_addr_share'));
    assert.ok(insert, '应写入 fbs_addr_share');
    assert.ok(insert.includes('1450 Ala Moana Blvd'), '快照应带上地址正文');
  } finally { server.close(); }
});

test('分享：超长与换行内容被裁剪成单行', async () => {
  const { server, port, calls } = await startApp({});
  try {
    const r = await req(port, '/tg-api/addr/share', {
      method: 'POST', auth: 'Bearer good',
      body: { street: 'A\nB\tC'.repeat(200), lat: '1', lng: '2' },
    });
    assert.strictEqual(r.status, 200);
    const insert = calls.find((s) => s.includes('INSERT INTO fbs_addr_share'));
    assert.ok(!insert.includes('\\n'), '不应写入换行');
    assert.ok(insert.length < 1200, '街道应被截断到 300 字符内');
  } finally { server.close(); }
});

test('读取：合法 token 返回快照', async () => {
  const { server, port } = await startApp({});
  try {
    const r = await req(port, `/tg-api/addr/shared/${VALID_TOKEN}`);
    assert.strictEqual(r.status, 200);
    assert.deepStrictEqual(r.json.data, { person: 'Alex', street: 'A', lat: '1', lng: '2' });
  } finally { server.close(); }
});

test('读取：token 格式非法直接 404，不查库', async () => {
  const seen = [];
  const { server, port } = await startApp({ db: async (sql) => { seen.push(sql); return ''; } });
  try {
    for (const bad of ['short', 'Z'.repeat(32), '../etc/passwd']) {
      const r = await req(port, `/tg-api/addr/shared/${encodeURIComponent(bad)}`);
      assert.strictEqual(r.status, 404);
    }
    assert.strictEqual(seen.length, 0, '非法 token 不应触达数据库');
  } finally { server.close(); }
});

test('读取：库中无记录（过期或不存在）返回 404', async () => {
  const { server, port } = await startApp({ db: async () => '' });
  try {
    const r = await req(port, `/tg-api/addr/shared/${VALID_TOKEN}`);
    assert.strictEqual(r.status, 404);
  } finally { server.close(); }
});

test('读取：快照损坏返回 502 CORRUPT', async () => {
  const { server, port } = await startApp({ db: async () => 'not-json' });
  try {
    const r = await req(port, `/tg-api/addr/shared/${VALID_TOKEN}`);
    assert.strictEqual(r.status, 502);
    assert.strictEqual(r.json.error.code, 'CORRUPT');
  } finally { server.close(); }
});

test('读取：限流触发 429', async () => {
  const { server, port } = await startApp({ limitRead: () => false });
  try {
    const r = await req(port, `/tg-api/addr/shared/${VALID_TOKEN}`);
    assert.strictEqual(r.status, 429);
  } finally { server.close(); }
});
