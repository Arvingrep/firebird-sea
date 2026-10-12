'use strict';
// T3.1/T3.3：TMA → 火鸟 ajax.php 的白名单代理（AD-20）。默认拒绝；剥离客户端身份参数；写接口限流与幂等。
// 白名单分两段：匿名只读展示类（7 个）与会员级 waimai 订单/地址类（7 个，Arvin 2026-10-12 按资金路径标准评审通过）。
// article:orderDetail 无登录校验，明确排除。新增条目必须随 PR 审核白名单 diff。

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

  // —— 会员级（Arvin 2026-10-12 评审通过，资金路径标准）：仅登录会员、参数白名单、归属校验失败映射 404 ——
  // article:orderDetail 无登录校验，明确不在白名单。
  'waimai:getMemberAddress': { auth: 'member', params: ['cityid', 'gettype', 'lat', 'lng', 'shopid'] },
  'waimai:operAddress': {
    auth: 'member',
    params: ['id', 'address', 'addressname', 'areaCode', 'default', 'lat', 'lng', 'mobile', 'people', 'person', 'street', 'tel'],
    denyStatus: 404,
    ownershipPrecheck: { action: 'getAddressDetail', idParam: 'id' },
  },
  'waimai:delAddress': {
    auth: 'member',
    params: ['id'],
    denyStatus: 404,
    ownershipPrecheck: { action: 'getAddressDetail', idParam: 'id' },
  },
  // deal：货到付款下单。不透传价格/优惠/积分类参数（quanid、quantype、openlevel、level、usePinput、tprice、peerpay）
  'waimai:deal': {
    auth: 'member',
    idempotent: true,
    denyStatus: 404,
    params: ['shop', 'address', 'paytype', 'order_content', 'preset', 'note', 'peitype', 'phone', 'desk', 'lng', 'lat', 'selftime', 'orderTime'],
  },
  'waimai:order': { auth: 'member', params: ['page', 'pageSize', 'state', 'iscomment'] },
  'waimai:orderDetail': { auth: 'member', params: ['id'], denyStatus: 404 },
  'waimai:cancelOrder': { auth: 'member', params: ['id'], denyStatus: 404 },
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

    const clientParams = sanitizeParams(method === 'POST' ? { ...(query || {}), ...(body || {}) } : query, rule.params);
    const fail = async (status, code, message) => {
      if (idemKey) await idemStore.abort(idemKey);
      return { status, body: { success: false, error: { code, message } } };
    };

    let cookie = null;
    if (claims) {
      if (!credentialProvider) return fail(503, 'CREDENTIALS_NOT_CONFIGURED', 'Not available');
      try {
        cookie = await credentialProvider(claims.mid); // T3.2：即时生成，不落盘、不写日志
      } catch (e) {
        return fail(502, 'CREDENTIALS_UNAVAILABLE', 'Not available');
      }
    }

    // 对上游发起一次调用；Cookie 只可能是服务端为该会员注入的凭证，客户端 Cookie 从不进入此函数
    async function callUpstream(svc, act, params, post) {
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries({ ...(post ? {} : params), service: svc, action: act, platform_name: 'tma' })) {
        (Array.isArray(v) ? v : [v]).forEach((x) => qs.append(k, x));
      }
      const init = { method: post ? 'POST' : 'GET', headers: { Accept: 'application/json' } };
      if (cookie) init.headers.Cookie = cookie;
      let url = `${upstreamBase}?${qs.toString()}`;
      if (post) {
        const form = new URLSearchParams();
        for (const [k, v] of Object.entries(params)) (Array.isArray(v) ? v : [v]).forEach((x) => form.append(k, x));
        init.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        init.body = form.toString();
      }
      const res = await fetchImpl(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
      return res.json();
    }

    const isPost = method === 'POST';
    const denied = (info) => fail(rule.denyStatus, 'NOT_FOUND_OR_DENIED', typeof info === 'string' ? info.slice(0, 100) : 'Not found');

    // 归属预检：编辑/删除他人资源前先用同一会员凭证读取该资源，读不到即视为无权（404），不再转发写操作
    if (rule.ownershipPrecheck && clientParams[rule.ownershipPrecheck.idParam]) {
      let pre;
      try {
        pre = await callUpstream(service, rule.ownershipPrecheck.action, { id: clientParams[rule.ownershipPrecheck.idParam] }, false);
      } catch (e) {
        return fail(502, 'UPSTREAM_UNAVAILABLE', 'Upstream unavailable');
      }
      if (!pre || typeof pre !== 'object' || pre.state !== undefined) return denied(pre && pre.info);
    }

    let json;
    try {
      json = await callUpstream(service, action, clientParams, isPost);
    } catch (e) {
      return fail(502, 'UPSTREAM_UNAVAILABLE', 'Upstream unavailable');
    }
    if (json === null || typeof json !== 'object') return fail(502, 'UPSTREAM_INVALID', 'Upstream returned invalid data');

    // 仅保留确认成功（火鸟 state=100）的响应，失败释放占位，客户端可用同一键重试
    const ok = json.state === 100;
    if (idemKey) {
      if (ok) await idemStore.finish(idemKey, json);
      else await idemStore.abort(idemKey);
    }
    // 带 denyStatus 的规则：上游拒绝一律映射为 HTTP 404 且不返回上游 body（不泄露数据）
    if (!ok && rule.denyStatus) return denied(json.info);
    return { status: 200, body: json };
  }

  return { handle };
}

module.exports = { createFbProxy, sanitizeParams, WHITELIST };
