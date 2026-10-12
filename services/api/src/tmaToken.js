'use strict';
// T2.2：TMA 会话令牌（HMAC-SHA256 签名，零依赖）。绑定 tg_id、会员 id 与环境。
// 令牌格式：base64url(payload).base64url(sig)。吊销与重放状态保存在进程内（单副本，AD-18）。
const crypto = require('node:crypto');

const b64 = (buf) => Buffer.from(buf).toString('base64url');

function createTokenService({ secret, env, ttlSeconds = 900, now = () => Math.floor(Date.now() / 1000) }) {
  if (!secret || String(secret).length < 16) throw new Error('TMA_TOKEN_SECRET 缺失或过短');
  if (!env) throw new Error('TMA_ENV 缺失');
  const revoked = new Map(); // jti -> exp（过期后清理）

  const sig = (data) => crypto.createHmac('sha256', secret).update(data).digest();

  function purge() {
    const t = now();
    for (const [jti, exp] of revoked) if (exp <= t) revoked.delete(jti);
  }

  function issue({ tgId, memberId }) {
    const iat = now();
    const payload = { sub: String(tgId), mid: Number(memberId), env, iat, exp: iat + ttlSeconds, jti: crypto.randomUUID() };
    const body = b64(JSON.stringify(payload));
    return { token: `${body}.${b64(sig(body))}`, expiresAt: payload.exp, jti: payload.jti };
  }

  function verify(token) {
    if (typeof token !== 'string') return { valid: false, error: 'missing' };
    const parts = token.split('.');
    if (parts.length !== 2) return { valid: false, error: 'malformed' };
    const expected = sig(parts[0]);
    let given;
    try { given = Buffer.from(parts[1], 'base64url'); } catch (e) { return { valid: false, error: 'malformed' }; }
    if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return { valid: false, error: 'bad_signature' };
    let p;
    try { p = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')); } catch (e) { return { valid: false, error: 'malformed' }; }
    if (p.env !== env) return { valid: false, error: 'wrong_env' };
    if (!(p.exp > now())) return { valid: false, error: 'expired' };
    purge();
    if (revoked.has(p.jti)) return { valid: false, error: 'revoked' };
    return { valid: true, claims: p };
  }

  function revoke(token) {
    const r = verify(token);
    if (!r.valid) return false;
    revoked.set(r.claims.jti, r.claims.exp);
    return true;
  }

  return { issue, verify, revoke };
}

// 固定窗口计数器：key 在 windowSeconds 内最多 max 次
function createLimiter({ max, windowSeconds, now = () => Math.floor(Date.now() / 1000) }) {
  const hits = new Map(); // key -> { count, resetAt }
  return function allow(key) {
    const t = now();
    const h = hits.get(key);
    if (!h || h.resetAt <= t) {
      hits.set(key, { count: 1, resetAt: t + windowSeconds });
      if (hits.size > 10000) for (const [k, v] of hits) if (v.resetAt <= t) hits.delete(k);
      return true;
    }
    if (h.count >= max) return false;
    h.count += 1;
    return true;
  };
}

module.exports = { createTokenService, createLimiter };
