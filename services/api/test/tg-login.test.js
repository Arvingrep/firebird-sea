// Telegram 顾客免密登录桥路由测试：直接挂载 createTgLoginRouter，注入假验签与假网关（不连真库、不连真网关）。
// 覆盖：验签失败 401 / 过期 401（1 小时）/ happy path 200 + Set-Cookie 原样透传 /
//       网关未配置 503 / 网关故障 503 / role=courier 501 / 缺 initData 400 / fbs_member_map 幂等 upsert。
const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const crypto = require('node:crypto');
const express = require('express');
const { createTgLoginRouter, LOGIN_MAX_AGE_SECONDS } = require('../src/tgLogin');
const { validateTelegramInitData } = require('../src/telegramAuth');

const BOT_TOKEN = 'test-bot-token-not-a-secret';
const nowSec = () => Math.floor(Date.now() / 1000);

function signInitData(fields, token = BOT_TOKEN) {
  const check = Object.keys(fields).sort().map((k) => `${k}=${fields[k]}`).join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
  const hash = crypto.createHmac('sha256', secret).update(check).digest('hex');
  return new URLSearchParams({ ...fields, hash }).toString();
}

const COOKIES = [
  'HN_login_user=QUJD; expires=Sun, 19 Nov 2023 02:13:20 GMT; Max-Age=360000; path=/; domain=fbird.men; secure; SameSite=None',
  'HN_userid=4242; expires=Sun, 19 Nov 2023 02:13:20 GMT; Max-Age=360000; path=/; domain=fbird.men; secure; SameSite=None',
  'HN_tg=1; expires=Thu, 14 Dec 2023 22:13:20 GMT; Max-Age=2592000; path=/; domain=fbird.men; secure; SameSite=None'
];

function okGateway(overrides = {}) {
  const calls = { member: [], session: [] };
  return {
    calls,
    memberFindOrCreate: async (cfg, params) => { calls.member.push({ cfg, params }); return { code: 0, member_id: 4242, created: true, ...(overrides.member || {}) }; },
    issueSession: async (cfg, params) => { calls.session.push({ cfg, params }); return { code: 0, member_id: 4242, set_cookies: COOKIES, ...(overrides.session || {}) }; }
  };
}

// 假连接：记录所有 SQL，返回空结果
function fakeDb() {
  const sqls = [];
  return { sqls, query: async (sql) => { sqls.push(sql); return ''; } };
}

function startApp({ env = {}, gateway = okGateway(), db = fakeDb(), validateInitData = null, botToken = BOT_TOKEN } = {}) {
  const app = express();
  app.use(express.json());
  const router = express.Router();
  router.post('/auth/telegram-web', createTgLoginRouter({
    env: { FBS_GATEWAY_URL: 'http://gw.local/api/fbs', FBS_GATEWAY_SECRET: 'gw-secret', ...env },
    validateInitData: validateInitData || ((initData, token, options) => (initData === 'good'
      ? { valid: true, user: { id: 100200, first_name: 'M', username: 'mm' }, authDate: nowSec(), options }
      : { valid: false, error: 'Hash mismatch: Potential tampering detected' })),
    botToken,
    gateway,
    conn: () => db,
    now: () => 1700000000000
  }));
  app.use('/tg-api', router);
  return new Promise((resolve) => {
    const server = app.listen(0, () => resolve({ server, port: server.address().port, gateway, db }));
  });
}

function post(port, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request(
      { host: '127.0.0.1', port, path: '/tg-api/auth/telegram-web', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } },
      (res) => {
        let data = '';
        res.on('data', (c) => { data += c; });
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, json: JSON.parse(data) }));
      }
    );
    req.on('error', reject);
    req.end(payload);
  });
}

test('happy path：200 + Set-Cookie 原样透传（不增不删不改）+ redirect=/', async () => {
  const gw = okGateway();
  const { server, port } = await startApp({ gateway: gw });
  try {
    const r = await post(port, { initData: 'good', role: 'customer' });
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.json.code, 0);
    assert.strictEqual(r.json.member_id, 4242);
    assert.strictEqual(r.json.redirect, '/');
    assert.deepStrictEqual(r.headers['set-cookie'], COOKIES, 'Set-Cookie 必须逐字节等于网关返回值');
    assert.strictEqual(gw.calls.member.length, 1);
    assert.strictEqual(gw.calls.session.length, 1);
    assert.deepStrictEqual(gw.calls.session[0].params, { tg_user_id: 100200 }, 'issue_session 入参只允许 tg_user_id');
    assert.strictEqual(gw.calls.member[0].params.first_name, 'M');
    assert.strictEqual(gw.calls.member[0].cfg.secret, 'gw-secret');
  } finally { server.close(); }
});

test('role 默认 customer，且只支持 customer', async () => {
  const { server, port } = await startApp();
  try {
    const r = await post(port, { initData: 'good' });
    assert.strictEqual(r.status, 200);
  } finally { server.close(); }
});

test('role=courier：501 ROLE_NOT_SUPPORTED，且不触达网关', async () => {
  const gw = okGateway();
  const { server, port } = await startApp({ gateway: gw });
  try {
    const r = await post(port, { initData: 'good', role: 'courier' });
    assert.strictEqual(r.status, 501);
    assert.strictEqual(r.json.error.code, 'ROLE_NOT_SUPPORTED');
    assert.strictEqual(gw.calls.member.length, 0);
    assert.strictEqual(gw.calls.session.length, 0);
  } finally { server.close(); }
});

test('缺 initData：400 MISSING_INIT_DATA', async () => {
  const { server, port } = await startApp();
  try {
    const r = await post(port, {});
    assert.strictEqual(r.status, 400);
    assert.strictEqual(r.json.error.code, 'MISSING_INIT_DATA');
  } finally { server.close(); }
});

test('验签失败：401 INVALID_INIT_DATA，不下发 Cookie', async () => {
  const { server, port } = await startApp();
  try {
    const r = await post(port, { initData: 'tampered' });
    assert.strictEqual(r.status, 401);
    assert.strictEqual(r.json.error.code, 'INVALID_INIT_DATA');
    assert.strictEqual(r.headers['set-cookie'], undefined);
  } finally { server.close(); }
});

test('真验签：超过 1 小时的 initData 401 EXPIRED_INIT_DATA（收银台仍按 24h，见下一条）', async () => {
  const twoHoursAgo = signInitData({ auth_date: String(nowSec() - 7200), user: JSON.stringify({ id: 100200 }) });
  const app = express();
  app.use(express.json());
  const router = express.Router();
  router.post('/auth/telegram-web', createTgLoginRouter({
    env: { FBS_GATEWAY_URL: 'http://gw.local/api/fbs', FBS_GATEWAY_SECRET: 'gw-secret' },
    validateInitData: validateTelegramInitData,
    botToken: BOT_TOKEN,
    gateway: okGateway(),
    conn: () => fakeDb()
  }));
  app.use('/tg-api', router);
  const server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  try {
    const port = server.address().port;
    const r1 = await post(port, { initData: twoHoursAgo });
    assert.strictEqual(r1.status, 401);
    assert.strictEqual(r1.json.error.code, 'EXPIRED_INIT_DATA');

    // 同一份 initData 在收银台的默认 24h 口径下仍然有效 —— 证明默认口径未被改动
    assert.strictEqual(validateTelegramInitData(twoHoursAgo, BOT_TOKEN).valid, true);
    assert.strictEqual(validateTelegramInitData(twoHoursAgo, BOT_TOKEN, { maxAgeSeconds: LOGIN_MAX_AGE_SECONDS }).valid, false);
    assert.match(validateTelegramInitData(twoHoursAgo, BOT_TOKEN, { maxAgeSeconds: LOGIN_MAX_AGE_SECONDS }).error, /expired/);

    // 新鲜（5 分钟前）的 initData 在 1 小时口径下仍然有效
    const recent = signInitData({ auth_date: String(nowSec() - 300), user: JSON.stringify({ id: 100200 }) });
    assert.strictEqual(validateTelegramInitData(recent, BOT_TOKEN, { maxAgeSeconds: LOGIN_MAX_AGE_SECONDS }).valid, true);
  } finally { server.close(); }
});

test('网关未配置（缺 URL/SECRET）：503 GATEWAY_NOT_CONFIGURED，进程不受影响', async () => {
  const { server, port } = await startApp({ env: { FBS_GATEWAY_URL: '', FBS_GATEWAY_SECRET: '' } });
  try {
    const r = await post(port, { initData: 'good' });
    assert.strictEqual(r.status, 503);
    assert.strictEqual(r.json.error.code, 'GATEWAY_NOT_CONFIGURED');
  } finally { server.close(); }
});

test('网关 503 / 超时：503 GATEWAY_UNAVAILABLE，不把网关原文透给前端', async () => {
  const httpErr = new Error('网关返回 HTTP 503');
  httpErr.code = 'GATEWAY_HTTP_ERROR';
  httpErr.status = 503;
  httpErr.payload = { code: 503, error: 'gateway_not_configured', message: 'gateway secret is not configured' };
  const { server, port } = await startApp({
    gateway: { memberFindOrCreate: async () => { throw httpErr; }, issueSession: async () => { throw httpErr; } }
  });
  try {
    const r = await post(port, { initData: 'good' });
    assert.strictEqual(r.status, 503);
    assert.strictEqual(r.json.error.code, 'GATEWAY_NOT_CONFIGURED');
    assert.ok(!JSON.stringify(r.json).includes('gateway secret is not configured'));
  } finally { server.close(); }

  const to = new Error('timeout');
  to.code = 'GATEWAY_TIMEOUT';
  const b = await startApp({ gateway: { memberFindOrCreate: async () => { throw to; }, issueSession: async () => { throw to; } } });
  try {
    const r = await post(b.port, { initData: 'good' });
    assert.strictEqual(r.status, 503);
    assert.strictEqual(r.json.error.code, 'GATEWAY_UNAVAILABLE');
  } finally { b.server.close(); }
});

test('会员被禁用（网关 403 member_disabled）：403 MEMBER_DISABLED', async () => {
  const err = new Error('网关返回 HTTP 403');
  err.code = 'GATEWAY_HTTP_ERROR';
  err.status = 403;
  err.payload = { code: 403, error: 'member_disabled' };
  const { server, port } = await startApp({ gateway: { memberFindOrCreate: async () => { throw err; }, issueSession: async () => { throw err; } } });
  try {
    const r = await post(port, { initData: 'good' });
    assert.strictEqual(r.status, 403);
    assert.strictEqual(r.json.error.code, 'MEMBER_DISABLED');
  } finally { server.close(); }
});

test('网关返回空 set_cookies：503，不返回半截登录态', async () => {
  const { server, port } = await startApp({ gateway: okGateway({ session: { set_cookies: [] } }) });
  try {
    const r = await post(port, { initData: 'good' });
    assert.strictEqual(r.status, 503);
    assert.strictEqual(r.headers['set-cookie'], undefined);
  } finally { server.close(); }
});

test('fbs_member_map 幂等 upsert：两次登录都执行 ON DUPLICATE KEY UPDATE', async () => {
  const db = fakeDb();
  const { server, port } = await startApp({ db });
  try {
    await post(port, { initData: 'good' });
    await post(port, { initData: 'good' });
    const mapSqls = db.sqls.filter((s) => s.includes('fbs_member_map'));
    assert.strictEqual(mapSqls.length, 2, '每次登录都要落一条 map 记录');
    for (const sql of mapSqls) {
      assert.match(sql, /INSERT INTO `huoniao_fbs_member_map`/);
      assert.match(sql, /VALUES \('100200', 4242\)/);
      assert.match(sql, /ON DUPLICATE KEY UPDATE member_id = VALUES\(member_id\)/);
    }
  } finally { server.close(); }
});

test('fbs_member_map 写失败不影响登录态（cookie 已下发）', async () => {
  const db = { sqls: [], query: async () => { throw new Error('db down'); } };
  const { server, port } = await startApp({ db });
  try {
    const r = await post(port, { initData: 'good' });
    assert.strictEqual(r.status, 200);
    assert.deepStrictEqual(r.headers['set-cookie'], COOKIES);
  } finally { server.close(); }
});
