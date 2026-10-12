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

test('首轮白名单仅含 7 个纯展示接口，且全部匿名', () => {
  const anon = Object.entries(WHITELIST).filter(([, r]) => r.auth === 'anonymous').map(([k]) => k).sort();
  assert.deepStrictEqual(anon, [
    'article:alist', 'article:detail', 'article:type', 'waimai:food', 'waimai:foodType', 'waimai:shopList', 'waimai:storeDetail',
  ]);
  const member = Object.entries(WHITELIST).filter(([, r]) => r.auth === 'member').map(([k]) => k).sort();
  assert.deepStrictEqual(member, [
    'waimai:cancelOrder', 'waimai:deal', 'waimai:delAddress', 'waimai:getMemberAddress', 'waimai:operAddress', 'waimai:order', 'waimai:orderDetail',
  ]);
  assert.strictEqual(WHITELIST['article:orderDetail'], undefined);
  for (const [k, r] of Object.entries(WHITELIST)) if (r.auth === 'member') assert.ok(Array.isArray(r.params), `${k} 必须声明参数白名单`);
  assert.strictEqual(WHITELIST['waimai:deal'].idempotent, true);
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
