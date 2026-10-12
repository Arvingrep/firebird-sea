const test = require('node:test');
const assert = require('node:assert');
const { createTokenService, createLimiter } = require('../src/tmaToken');

const SECRET = 'unit-test-secret-0123456789';

function svc(over = {}) {
  let t = 1000;
  const s = createTokenService({ secret: SECRET, env: 'canary', ttlSeconds: 60, now: () => t, ...over });
  return { s, tick: (n) => { t += n; } };
}

test('签发的令牌可验证并携带 tg_id、会员 id、env', () => {
  const { s } = svc();
  const { token } = s.issue({ tgId: 42, memberId: 7 });
  const r = s.verify(token);
  assert.strictEqual(r.valid, true);
  assert.strictEqual(r.claims.sub, '42');
  assert.strictEqual(r.claims.mid, 7);
  assert.strictEqual(r.claims.env, 'canary');
});

test('篡改载荷或签名被拒绝', () => {
  const { s } = svc();
  const { token } = s.issue({ tgId: 42, memberId: 7 });
  const [body, sig] = token.split('.');
  const evil = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(body, 'base64url')), mid: 1 })).toString('base64url');
  assert.strictEqual(s.verify(`${evil}.${sig}`).valid, false);
  assert.strictEqual(s.verify(`${body}.${sig.slice(0, -2)}AA`).valid, false);
  assert.strictEqual(s.verify('garbage').valid, false);
  assert.strictEqual(s.verify(undefined).valid, false);
});

test('过期令牌被拒绝', () => {
  const { s, tick } = svc();
  const { token } = s.issue({ tgId: 1, memberId: 1 });
  tick(61);
  assert.strictEqual(s.verify(token).error, 'expired');
});

test('吊销后立即失效', () => {
  const { s } = svc();
  const { token } = s.issue({ tgId: 1, memberId: 1 });
  assert.strictEqual(s.revoke(token), true);
  assert.strictEqual(s.verify(token).error, 'revoked');
});

test('canary 令牌在 prod 环境无效（反之亦然）', () => {
  let t = 1000;
  const canary = createTokenService({ secret: SECRET, env: 'canary', now: () => t });
  const prod = createTokenService({ secret: SECRET, env: 'prod', now: () => t });
  const { token } = canary.issue({ tgId: 1, memberId: 1 });
  assert.strictEqual(prod.verify(token).error, 'wrong_env');
  assert.strictEqual(prod.issue({ tgId: 1, memberId: 1 }).token === token, false);
});

test('缺失密钥或环境时拒绝创建服务', () => {
  assert.throws(() => createTokenService({ secret: 'short', env: 'canary' }));
  assert.throws(() => createTokenService({ secret: SECRET }));
});

test('限频：窗口内超过上限返回 false，窗口过后恢复', () => {
  let t = 0;
  const allow = createLimiter({ max: 2, windowSeconds: 10, now: () => t });
  assert.strictEqual(allow('a'), true);
  assert.strictEqual(allow('a'), true);
  assert.strictEqual(allow('a'), false);
  assert.strictEqual(allow('b'), true);
  t = 11;
  assert.strictEqual(allow('a'), true);
});
