const test = require('node:test');
const assert = require('node:assert');
const crypto = require('node:crypto');
const { createLoginService } = require('../src/loginService');
const { createTokenService, createLimiter } = require('../src/tmaToken');

const BOT = 'login-test-bot-token';
const nowSec = () => Math.floor(Date.now() / 1000);

function sign(fields) {
  const check = Object.keys(fields).sort().map((k) => `${k}=${fields[k]}`).join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(BOT).digest();
  const hash = crypto.createHmac('sha256', secret).update(check).digest('hex');
  return new URLSearchParams({ ...fields, hash }).toString();
}
const initFor = (id, extra = {}) => sign({ auth_date: String(nowSec()), user: JSON.stringify({ id }), ...extra });

function build(over = {}) {
  const auditLog = [];
  const memberMap = {
    async findOrCreate(tgId) { return { memberId: 100 + (tgId % 10), created: true }; },
    async audit(tgId, action) { auditLog.push(`${tgId}:${action}`); },
  };
  const tokens = createTokenService({ secret: 'login-test-secret-0123', env: 'canary' });
  const svc = createLoginService({
    botToken: BOT, tokens, memberMap,
    allowLogin: createLimiter({ max: 3, windowSeconds: 60 }),
    allowReplay: createLimiter({ max: 2, windowSeconds: 3600 }),
    ...over,
  });
  return { svc, tokens, auditLog };
}

test('有效 initData 登录成功并签发可验证令牌', async () => {
  const { svc, tokens, auditLog } = build();
  const r = await svc.login(initFor(55));
  assert.strictEqual(r.status, 200);
  const v = tokens.verify(r.body.data.token);
  assert.strictEqual(v.valid, true);
  assert.strictEqual(v.claims.sub, '55');
  assert.ok(auditLog.includes('55:login'));
});

test('篡改或缺字段的 initData 返回 401', async () => {
  const { svc } = build();
  const good = initFor(55);
  assert.strictEqual((await svc.login(good.replace('55', '56'))).status, 401);
  assert.strictEqual((await svc.login('')).status, 401);
  assert.strictEqual((await svc.login(sign({ user: JSON.stringify({ id: 1 }) }))).status, 401);
});

test('同一 tg_id 高频登录返回 429 并写审计', async () => {
  const { svc, auditLog } = build();
  for (let i = 0; i < 3; i += 1) assert.strictEqual((await svc.login(initFor(77, { query_id: `q${i}` }))).status, 200);
  const r = await svc.login(initFor(77, { query_id: 'q9' }));
  assert.strictEqual(r.status, 429);
  assert.ok(auditLog.includes('77:login_rate_limited'));
});

test('限流审计采样：窗口内重复 429 只写一条审计', async () => {
  const { svc, auditLog } = build();
  for (let i = 0; i < 3; i += 1) await svc.login(initFor(66, { query_id: `q${i}` }));
  for (let i = 0; i < 5; i += 1) await svc.login(initFor(66, { query_id: `x${i}` }));
  assert.strictEqual(auditLog.filter((a) => a === '66:login_rate_limited').length, 1);
});

test('同一 initData 重复换发超过上限返回 429', async () => {
  const { svc } = build();
  const data = initFor(88);
  assert.strictEqual((await svc.login(data)).status, 200);
  assert.strictEqual((await svc.login(data)).status, 200);
  const r = await svc.login(data);
  assert.strictEqual(r.status, 429);
  assert.strictEqual(r.body.error.code, 'REPLAY_LIMITED');
});
