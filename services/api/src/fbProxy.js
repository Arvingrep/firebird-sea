'use strict';
// T3.1/T3.3：TMA → 火鸟 ajax.php 的白名单代理（AD-20）。默认拒绝；剥离客户端身份参数；写接口限流与幂等。
// 首轮白名单仅含纯展示类只读接口（Arvin 2026-10-12 拍板）；orderDetail 等涉订单/资金路径的接口须单独评审后加入。

// auth: 'anonymous' 无需令牌；'member' 需有效令牌（T3.2 注入凭证）。idempotent: 要求 Idempotency-Key。
// params（可选）：该接口允许透传的参数名白名单；设置后其余参数一律丢弃（防越权类参数如 userid、store）。
const { createMemoryIdempotencyStore } = require('./sharedState');

const WHITELIST = Object.freeze({
  'waimai:shopList': { auth: 'anonymous' },
  'waimai:storeDetail': { auth: 'anonymous' },
  'waimai:food': { auth: 'anonymous' },
  'waimai:foodType': { auth: 'anonymous' },
  'article:type': { auth: 'anonymous' },
  'article:alist': { auth: 'anonymous' },
  'article:detail': { auth: 'anonymous' },
});

// 客户端不得自带的身份/旁路参数（Spike S2）：精确名 + 前缀
const STRIPPED_EXACT = new Set([
  'userkey', 'access_token', 'refresh_token', 'token', 'forcelogout', 'rsaencrypt',
  'service', 'action', 'callback', '_', 'userid', 'uid', 'login_user',
]);
const STRIPPED_PREFIXES = ['platform_', 'hn_'];

function sanitizeParams(query, allowed = null) {
  const out = {};
  for (const [k, v] of Object.entries(query || {})) {
    if (allowed && !allowed.includes(k)) continue;
    const lk = k.toLowerCase();
    if (STRIPPED_EXACT.has(lk) || STRIPPED_PREFIXES.some((p) => lk.startsWith(p))) continue;
    if (typeof v === 'string') out[k] = v;
    else if (Array.isArray(v) && v.every((x) => typeof x === 'string')) out[k] = v;
  }
  return out;
}

function createFbProxy({
  upstreamBase, fetchImpl = globalThis.fetch, tokens, whitelist = WHITELIST,
  allow = () => true, credentialProvider = null, idempotencyTtlSeconds = 600, now = () => Date.now(),
  timeoutMs = 8000, idempotencyStore = null,
}) {
  const idemStore = idempotencyStore || createMemoryIdempotencyStore({ ttlSeconds: idempotencyTtlSeconds, now });
  for (const [name, rule] of Object.entries(whitelist)) {
    if (rule.idempotent && rule.auth !== 'member') throw new Error(`白名单 ${name}: idempotent 规则必须 auth=member`);
  }
  // 返回 { status, body }，由路由层写出
  async function handle({ service, action, query, method = 'GET', body, headers = {}, clientKey = 'anon' }) {
    const rule = whitelist[`${service}:${action}`];
    if (!rule) return { status: 403, body: { success: false, error: { code: 'NOT_ALLOWED', message: 'Endpoint not allowed' } } };

    let claims = null;
    if (rule.auth === 'member') {
      const m = /^Bearer (.+)$/.exec(headers.authorization || '');
      const v = m ? tokens.verify(m[1]) : { valid: false };
      if (!v.valid) return { status: 401, body: { success: false, error: { code: 'UNAUTHORIZED', message: 'Login required' } } };
      claims = v.claims;
    }

    if (!allow(`${claims ? `m:${claims.mid}` : clientKey}:${service}:${action}`)) {
      return { status: 429, body: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } } };
    }

    let idemKey = null;
    if (rule.idempotent) {
      const k = headers['idempotency-key'];
      if (!k || !/^[A-Za-z0-9_-]{8,64}$/.test(k)) {
        return { status: 400, body: { success: false, error: { code: 'IDEMPOTENCY_KEY_REQUIRED', message: 'Idempotency-Key required' } } };
      }
      idemKey = `${claims.mid}:${service}:${action}:${k}`;
      const slot = await idemStore.begin(idemKey);
      if (slot.status === 'done') return { status: 200, body: slot.body, replayed: true };
      if (slot.status === 'pending') {
        return { status: 409, body: { success: false, error: { code: 'REQUEST_IN_PROGRESS', message: 'A request with this key is in progress' } } };
      }
    }

    const params = { ...sanitizeParams(query, rule.params), service, action, platform_name: 'tma' };
    let cookie = null;
    if (claims) {
      if (!credentialProvider) {
        if (idemKey) await idemStore.abort(idemKey);
        return { status: 503, body: { success: false, error: { code: 'CREDENTIALS_NOT_CONFIGURED', message: 'Not available' } } };
      }
      try {
        cookie = await credentialProvider(claims.mid); // T3.2：即时生成，不落盘、不写日志
      } catch (e) {
        if (idemKey) await idemStore.abort(idemKey);
        return { status: 502, body: { success: false, error: { code: 'CREDENTIALS_UNAVAILABLE', message: 'Not available' } } };
      }
    }

    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) (Array.isArray(v) ? v : [v]).forEach((x) => qs.append(k, x));
    const init = { method: method === 'POST' ? 'POST' : 'GET', headers: { Accept: 'application/json' } };
    if (cookie) init.headers.Cookie = cookie;
    let url = `${upstreamBase}?${qs.toString()}`;
    if (init.method === 'POST') {
      const form = new URLSearchParams();
      for (const [k, v] of Object.entries(sanitizeParams(body, rule.params))) (Array.isArray(v) ? v : [v]).forEach((x) => form.append(k, x));
      init.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      init.body = form.toString();
      url = `${upstreamBase}?${new URLSearchParams({ service, action, platform_name: 'tma' }).toString()}`;
    }

    let res;
    try { res = await fetchImpl(url, { ...init, signal: AbortSignal.timeout(timeoutMs) }); } catch (e) {
      if (idemKey) await idemStore.abort(idemKey);
      return { status: 502, body: { success: false, error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Upstream unavailable' } } };
    }
    let json;
    try { json = await res.json(); } catch (e) {
      if (idemKey) await idemStore.abort(idemKey);
      return { status: 502, body: { success: false, error: { code: 'UPSTREAM_INVALID', message: 'Upstream returned invalid data' } } };
    }
    // 仅保留确认成功（火鸟 state=100）的响应，失败释放占位，客户端可用同一键重试
    if (idemKey) {
      if (json && json.state === 100) await idemStore.finish(idemKey, json);
      else await idemStore.abort(idemKey);
    }
    return { status: 200, body: json };
  }

  return { handle };
}

module.exports = { createFbProxy, sanitizeParams, WHITELIST };
