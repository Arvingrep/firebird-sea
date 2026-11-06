const test = require('node:test');
const assert = require('node:assert');
const { createFbProxy, sanitizeParams, WHITELIST } = require('../src/fbProxy');
const { createTokenService, createLimiter } = require('../src/tmaToken');

const tokens = createTokenService({ secret: 'proxy-test-secret-0123', env: 'canary' });
const okJson = (obj) => ({ json: async () => obj });

function proxyWith(over = {}) {
  const calls = [];
  const fetchImpl = async (url, init) => { calls.push({ url, init }); return okJson({ state: 100, info: [] }); };
  const p = createFbProxy({ upstreamBase: 'http://php/include/ajax.php', fetchImpl, tokens, ...over });
  return { p, calls };
}

test('白名单外的 service+action 返回 403 且不转发', async () => {
  const { p, calls } = proxyWith();
  for (const [service, action] of [['article', 'orderDetail'], ['waimai', 'getAddressDetail'], ['member', 'login'], ['siteConfig', 'config'], ['waimai', 'paySuccess'], ['waimai', 'pay']]) {
    const r = await p.handle({ service, action, query: {} });
    assert.strictEqual(r.status, 403, `${service}:${action}`);
  }
  assert.strictEqual(calls.length, 0);
});

test('展示类白名单：8 个匿名只读接口，shopList/shopType 声明参数白名单', () => {
  const anon = Object.entries(WHITELIST).filter(([, r]) => r.auth === 'anonymous').map(([k]) => k).sort();
  assert.deepStrictEqual(anon, [
    'article:alist', 'article:detail', 'article:type', 'waimai:food', 'waimai:foodType',
    'waimai:shopList', 'waimai:shopType', 'waimai:storeDetail',
  ]);
  const member = Object.entries(WHITELIST).filter(([, r]) => r.auth === 'member').map(([k]) => k).sort();
  assert.deepStrictEqual(member, [
    'waimai:cancelOrder', 'waimai:deal', 'waimai:delAddress', 'waimai:getCourierLocation',
    'waimai:getMemberAddress', 'waimai:operAddress', 'waimai:order', 'waimai:orderDetail',
  ]);
  // 轨迹接口上游只按 orderid 查、无归属条件，必须靠预检兜住
  assert.deepStrictEqual(WHITELIST['waimai:getCourierLocation'].ownershipPrecheck, { action: 'orderDetail', idParam: 'orderid' });
  assert.strictEqual(WHITELIST['article:orderDetail'], undefined);
  for (const [k, r] of Object.entries(WHITELIST)) if (r.auth === 'member') assert.ok(Array.isArray(r.params), `${k} 必须声明参数白名单`);
  // 首页搜索开始透传 keywords，必须走白名单；同时挡住三个注入面
  assert.ok(Array.isArray(WHITELIST['waimai:shopList'].params), 'shopList 必须声明参数白名单');
  for (const bad of ['ids', 'lng', 'lat', 'cityid', 'u']) {
    assert.ok(!WHITELIST['waimai:shopList'].params.includes(bad), `shopList 不得透传 ${bad}`);
  }
  assert.strictEqual(WHITELIST['waimai:deal'].idempotent, true);
});

test('shopList 只透传搜索/分页/筛选参数，注入面参数被丢弃', async () => {
  const { p, calls } = proxyWith();
  const r = await p.handle({
    service: 'waimai', action: 'shopList',
    query: { page: '2', pageSize: '20', keywords: '鸡排', orderby: '2', typeid: '7', ids: '1,2,3', lng: '121', lat: '31', cityid: '5', u: '9' },
  });
  assert.strictEqual(r.status, 200);
  const url = new URL(calls[0].url);
  assert.strictEqual(url.searchParams.get('page'), '2');
  assert.strictEqual(url.searchParams.get('pageSize'), '20');
  assert.strictEqual(url.searchParams.get('keywords'), '鸡排');
  assert.strictEqual(url.searchParams.get('orderby'), '2');
  assert.strictEqual(url.searchParams.get('typeid'), '7');
  for (const bad of ['ids', 'lng', 'lat', 'cityid', 'u']) {
    assert.strictEqual(url.searchParams.get(bad), null, `${bad} 不得转发`);
  }
});

test('shopType 匿名可读，只透传 nav', async () => {
  const { p, calls } = proxyWith();
  const r = await p.handle({ service: 'waimai', action: 'shopType', query: { nav: '1', userkey: 'x' } });
  assert.strictEqual(r.status, 200);
  const url = new URL(calls[0].url);
  assert.strictEqual(url.searchParams.get('nav'), '1');
  assert.strictEqual(url.searchParams.get('userkey'), null);
});

test('身份与旁路参数被剥离，不带客户端 Cookie，强制 platform_name=tma', async () => {
  const { p, calls } = proxyWith();
  await p.handle({
    service: 'waimai', action: 'shopList',
    query: { page: '1', userkey: 'x', access_token: 'y', platform_userid: '1', platform_name: 'ios', HN_login_user: 'c', forcelogout: '1', rsaEncrypt: '1', uid: '5' },
    headers: { cookie: 'login_user=evil' },
  });
  const u = new URL(calls[0].url);
  assert.strictEqual(u.searchParams.get('page'), '1');
  assert.strictEqual(u.searchParams.get('platform_name'), 'tma');
  for (const k of ['userkey', 'access_token', 'platform_userid', 'HN_login_user', 'forcelogout', 'rsaEncrypt', 'uid']) {
    assert.strictEqual(u.searchParams.has(k), false, k);
  }
  assert.strictEqual(calls[0].init.headers.Cookie, undefined);
});

test('匿名读接口照常转发但受限流约束', async () => {
  const { p } = proxyWith({ allow: createLimiter({ max: 2, windowSeconds: 60 }) });
  const q = { service: 'article', action: 'alist', query: {}, clientKey: 'ip1' };
  assert.strictEqual((await p.handle(q)).status, 200);
  assert.strictEqual((await p.handle(q)).status, 200);
  assert.strictEqual((await p.handle(q)).status, 429);
});

test('member 接口：无令牌 401；有令牌才注入凭证；缺凭证提供者 503', async () => {
  const wl = { 'waimai:getMemberAddress': { auth: 'member' } };
  const noProvider = proxyWith({ whitelist: wl });
  assert.strictEqual((await noProvider.p.handle({ service: 'waimai', action: 'getMemberAddress', query: {} })).status, 401);
  const { token } = tokens.issue({ tgId: 1, memberId: 5 });
  const auth = { authorization: `Bearer ${token}` };
  assert.strictEqual((await noProvider.p.handle({ service: 'waimai', action: 'getMemberAddress', query: {}, headers: auth })).status, 503);

  const seen = [];
  const withProvider = proxyWith({ whitelist: wl, credentialProvider: async (mid) => { seen.push(mid); return 'login_user=SERVERSIDE'; } });
  const r = await withProvider.p.handle({ service: 'waimai', action: 'getMemberAddress', query: {}, headers: auth });
  assert.strictEqual(r.status, 200);
  assert.deepStrictEqual(seen, [5]);
  assert.strictEqual(withProvider.calls[0].init.headers.Cookie, 'login_user=SERVERSIDE');
});

test('幂等：缺 Idempotency-Key 返回 400；重复键返回首次结果且只转发一次', async () => {
  const wl = { 'waimai:deal': { auth: 'member', idempotent: true } };
  const { token } = tokens.issue({ tgId: 1, memberId: 5 });
  let n = 0;
  const fetchImpl = async () => { n += 1; return okJson({ state: 100, info: { ordernum: `O${n}` } }); };
  const p = createFbProxy({ upstreamBase: 'http://php/a', fetchImpl, tokens, whitelist: wl, credentialProvider: async () => 'c=1' });
  const base = { service: 'waimai', action: 'deal', method: 'POST', body: { x: '1' } };
  assert.strictEqual((await p.handle({ ...base, headers: { authorization: `Bearer ${token}` } })).status, 400);
  const h = { authorization: `Bearer ${token}`, 'idempotency-key': 'key-12345678' };
  const a = await p.handle({ ...base, headers: h });
  const b = await p.handle({ ...base, headers: h });
  assert.strictEqual(n, 1);
  assert.deepStrictEqual(a.body, b.body);
  assert.strictEqual(b.replayed, true);
});

test('sanitizeParams 丢弃数组、对象及 JSON 容器值（上游对其跳过转义）', () => {
  assert.deepStrictEqual(sanitizeParams({ a: '1', b: { $ne: 1 }, c: ['x', 'y'], d: [{}], e: '[{"a":1}]', f: '[1]', g: '{"a":1}', h: 'plain [text' }), { a: '1', h: 'plain [text' });
});

test('上游异常返回 502 而非抛出', async () => {
  const p = createFbProxy({ upstreamBase: 'http://php/a', fetchImpl: async () => { throw new Error('down'); }, tokens });
  assert.strictEqual((await p.handle({ service: 'article', action: 'type', query: {} })).status, 502);
});

test('idempotent 规则必须配 auth=member，否则构造即失败', () => {
  assert.throws(() => createFbProxy({ upstreamBase: 'http://x', tokens, whitelist: { 'a:b': { auth: 'anonymous', idempotent: true } } }));
});

test('幂等只缓存 state=100 的响应，失败可用同一键重试', async () => {
  const wl = { 'waimai:deal': { auth: 'member', idempotent: true } };
  const { token } = tokens.issue({ tgId: 1, memberId: 5 });
  const results = [{ state: 200, info: 'busy' }, { state: 100, info: { ordernum: 'O1' } }];
  let n = 0;
  const p = createFbProxy({ upstreamBase: 'http://php/a', fetchImpl: async () => okJson(results[n++]), tokens, whitelist: wl, credentialProvider: async () => 'c=1' });
  const req = { service: 'waimai', action: 'deal', method: 'POST', body: {}, headers: { authorization: `Bearer ${token}`, 'idempotency-key': 'retry-key-1234' } };
  assert.strictEqual((await p.handle(req)).body.state, 200);
  assert.strictEqual((await p.handle(req)).body.state, 100);
  assert.strictEqual((await p.handle(req)).replayed, true);
  assert.strictEqual(n, 2);
});

test('上游请求带超时信号', async () => {
  let signal;
  const p = createFbProxy({ upstreamBase: 'http://php/a', fetchImpl: async (u, init) => { signal = init.signal; return okJson({ state: 100 }); }, tokens });
  await p.handle({ service: 'article', action: 'type', query: {} });
  assert.ok(signal instanceof AbortSignal);
});

test('规则级 params 白名单：未列出的参数（含 userid/store）不会透传，GET 与 POST 均适用', async () => {
  const wl = { 'waimai:order': { auth: 'member', params: ['page', 'pageSize', 'state'] } };
  const { token } = tokens.issue({ tgId: 1, memberId: 5 });
  const seen = [];
  const p = createFbProxy({ upstreamBase: 'http://php/a', tokens, whitelist: wl, credentialProvider: async () => 'c=1',
    fetchImpl: async (url, init) => { seen.push({ url, body: init.body }); return okJson({ state: 100 }); } });
  const h = { authorization: `Bearer ${token}` };
  await p.handle({ service: 'waimai', action: 'order', query: { page: '1', userid: '9', store: '3', state: '1' }, headers: h });
  const u = new URL(seen[0].url);
  assert.deepStrictEqual([...u.searchParams.keys()].sort(), ['action', 'page', 'platform_name', 'service', 'state']);
  await p.handle({ service: 'waimai', action: 'order', method: 'POST', body: { page: '2', userid: '9' }, headers: h });
  assert.strictEqual(new URLSearchParams(seen[1].body).has('userid'), false);
  assert.strictEqual(new URLSearchParams(seen[1].body).get('page'), '2');
});

// ── 货到付款收口（2026-10「下单后订单被 cron 判超时取消」事故回归）──────────────
// 上游 deal() 对 paytype=1 只返回字符串 "delivery|<ordernum>" 并早返回
// （waimai.class.php:3686），订单此时仍是 state=0。若不收口，
// include/cron/waimai_updateOrderState.php 会在 30 分钟后把它判为「订单超时未支付」。
test('货到付款收口：deal 返回 delivery|<ordernum> 时补调 pay，且只对客户端暴露订单号', async () => {
  const wl = { 'waimai:deal': { auth: 'member', idempotent: true } };
  const { token } = tokens.issue({ tgId: 1, memberId: 5 });
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    if (calls.length === 1) return okJson({ state: 100, info: 'delivery|ORD1' });
    return okJson({ state: 100, info: 'http://x/orderdetail' });
  };
  const p = createFbProxy({ upstreamBase: 'http://php/a', fetchImpl, tokens, whitelist: wl, credentialProvider: async () => 'c=1' });
  const h = { authorization: `Bearer ${token}`, 'idempotency-key': 'cod-key-1234' };
  const r = await p.handle({ service: 'waimai', action: 'deal', method: 'POST', body: {}, headers: h });

  assert.strictEqual(r.status, 200);
  assert.strictEqual(r.body.info, 'ORD1', '前端不应看到 "delivery|" 前缀');
  assert.strictEqual(calls.length, 2, '应补一次 pay 调用');
  assert.match(calls[1].url, /action=pay/);
  assert.match(String(calls[1].init.body), /paytype=delivery/);
  assert.match(String(calls[1].init.body), /ordernum=ORD1/);
  // pay() 在 paytype=delivery 且 !isMobile() 时 header('location') 后 die，必须带移动端 UA
  assert.match(String(calls[1].init.headers['User-Agent']), /Mobile/);

  // 幂等重放：返回的也必须是已归一化的订单号，且不再转发
  const r2 = await p.handle({ service: 'waimai', action: 'deal', method: 'POST', body: {}, headers: h });
  assert.strictEqual(r2.replayed, true);
  assert.strictEqual(r2.body.info, 'ORD1');
  assert.strictEqual(calls.length, 2);
});

test('货到付款收口失败不阻塞下单：仍返回订单号（订单已创建）', async () => {
  const wl = { 'waimai:deal': { auth: 'member', idempotent: true } };
  const { token } = tokens.issue({ tgId: 1, memberId: 5 });
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    if (calls.length === 1) return okJson({ state: 100, info: 'delivery|ORD2' });
    return okJson({ state: 200, info: '订单不存在或已支付' });
  };
  const warned = [];
  const origWarn = console.warn;
  console.warn = (m) => warned.push(String(m));
  try {
    const p = createFbProxy({ upstreamBase: 'http://php/a', fetchImpl, tokens, whitelist: wl, credentialProvider: async () => 'c=1' });
    const r = await p.handle({ service: 'waimai', action: 'deal', method: 'POST', body: {}, headers: { authorization: `Bearer ${token}`, 'idempotency-key': 'cod-key-5678' } });
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.info, 'ORD2');
    assert.ok(warned.some((w) => w.includes('cod_settle_failed')), '收口失败必须留痕');
  } finally {
    console.warn = origWarn;
  }
});

test('非货到付款返回（在线支付表单）不触发收口', async () => {
  const wl = { 'waimai:deal': { auth: 'member', idempotent: true } };
  const { token } = tokens.issue({ tgId: 1, memberId: 5 });
  const calls = [];
  const fetchImpl = async (url, init) => { calls.push({ url, init }); return okJson({ state: 100, info: { ordernum: 'O1', orderurl: 'u' } }); };
  const p = createFbProxy({ upstreamBase: 'http://php/a', fetchImpl, tokens, whitelist: wl, credentialProvider: async () => 'c=1' });
  const r = await p.handle({ service: 'waimai', action: 'deal', method: 'POST', body: {}, headers: { authorization: `Bearer ${token}`, 'idempotency-key': 'cod-key-9999' } });
  assert.deepStrictEqual(r.body.info, { ordernum: 'O1', orderurl: 'u' });
  assert.strictEqual(calls.length, 1);
});
