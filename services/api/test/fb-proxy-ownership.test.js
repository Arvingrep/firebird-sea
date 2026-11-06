// 7 个 waimai 会员级接口的归属校验对抗测试（Arvin 验收条件）：
// 会员 A 携带会员 B 的订单/地址 ID 调用，必须 403/404，不得返回数据，且不得产生写入。
// 上游用"行为等价的火鸟替身"：按注入的 Cookie 识别会员，按 uid 过滤；并模拟 courier Cookie 旁路与 userid 参数后门。
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { createFbProxy } = require('../src/fbProxy');
const { createTokenService } = require('../src/tmaToken');

const tokens = createTokenService({ secret: 'ownership-test-secret-01', env: 'canary' });
const A = 100;
const B = 200;
const VALID_OC = JSON.stringify([{ id: '5', count: 1 }]);

function fakeFirebird() {
  const addresses = { 1: { id: 1, uid: A, person: 'A' }, 2: { id: 2, uid: B, person: 'B-secret' } };
  const orders = { 10: { id: 10, uid: A, ordernum: 'OA', path: '120.1,14.1;120.2,14.2' }, 20: { id: 20, uid: B, ordernum: 'OB-secret', state: 0, path: 'SECRET_PATH' } };
  const log = { requests: [], mutations: [] };
  const NOLOGIN = { state: 200, info: '未登录或登录超时！' };

  async function fetchImpl(url, init) {
    const u = new URL(url);
    const p = Object.fromEntries(u.searchParams.entries());
    if (init.body) for (const [k, v] of new URLSearchParams(init.body).entries()) p[k] = v;
    const cookie = init.headers.Cookie || '';
    log.requests.push({ action: p.action, params: p, cookie, headers: init.headers });
    const m = /login_user=(\d+)/.exec(cookie);
    const uid = m ? Number(m[1]) : null;
    const courier = /(^|;\s*)courier=/.test(cookie); // 旁路：骑手 Cookie 可匿名读订单详情
    // getCourierLocation 用 orderid，其余用 id
    const id = Number(p.id || p.orderid);
    let out;
    switch (p.action) {
      case 'getAddressDetail':
        out = uid === null ? NOLOGIN : (addresses[id] && addresses[id].uid === uid ? addresses[id] : { state: 200, info: '信息不存在' });
        break;
      case 'operAddress':
        if (uid === null) { out = NOLOGIN; break; }
        if (p.id && addresses[id] && addresses[id].uid === uid) { log.mutations.push(['edit', id]); }
        else if (p.id) { log.mutations.push(['edit-noop', id]); } // 真实 handler：UPDATE ... AND uid 命中 0 行仍返回保存成功
        out = { state: 100, info: '保存成功' };
        break;
      case 'delAddress':
        if (uid === null) { out = NOLOGIN; break; }
        if (addresses[id] && addresses[id].uid === uid) { log.mutations.push(['del', id]); out = { state: 100, info: '删除成功' }; }
        else { log.mutations.push(['del-noop', id]); out = { state: 100, info: '删除成功' }; }
        break;
      case 'getMemberAddress': {
        if (uid === null) { out = NOLOGIN; break; }
        out = { state: 100, info: { list: Object.values(addresses).filter((a) => a.uid === uid) } };
        break;
      }
      case 'order': {
        if (uid === null) { out = NOLOGIN; break; }
        const who = p.userid ? Number(p.userid) : uid; // 后门：未剥离时 userid 可越权
        out = { state: 100, info: { list: Object.values(orders).filter((o) => o.uid === who) } };
        break;
      }
      case 'orderDetail':
        if (uid === null && !courier) { out = { state: 200, info: '请先登录！' }; break; }
        out = orders[id] && (courier || orders[id].uid === uid) ? { state: 100, info: orders[id] } : { state: 200, info: '订单不存在' };
        break;
      case 'getCourierLocation':
        // 真实 handler：SELECT peisongpath WHERE id = $id —— 不校验登录、不校验归属
        out = { state: 100, info: (orders[id] && orders[id].path) || '' };
        break;
      case 'cancelOrder':
        if (uid === null) { out = { state: 200, info: '登录超时，请重新登录！' }; break; }
        if (orders[id] && orders[id].uid === uid) { orders[id].state = 6; log.mutations.push(['cancel', id]); out = { state: 100, info: '取消成功' }; }
        else out = { state: 200, info: '订单不存在' };
        break;
      case 'deal':
        if (uid === null) { out = NOLOGIN; break; }
        if (!addresses[Number(p.address)] || addresses[Number(p.address)].uid !== uid) { out = { state: 200, info: '地址不存在' }; break; }
        log.mutations.push(['deal', Number(p.address)]);
        out = { state: 100, info: { ordernum: 'NEW1' } };
        break;
      default:
        out = { state: 200, info: 'unknown' };
    }
    // 复刻 handlers.class.php getHandle 的包装语义
    let wrapped;
    if (out && (out.state === 200 || out.state === 101)) wrapped = { state: 101, info: out.info };
    else if (out && out.state !== undefined && out.info !== undefined) wrapped = out;
    else wrapped = { state: 100, info: out };
    return { json: async () => wrapped };
  }
  return { fetchImpl, log, addresses, orders };
}

function setup() {
  const fx = fakeFirebird();
  const proxy = createFbProxy({
    upstreamBase: 'http://php/include/ajax.php',
    fetchImpl: fx.fetchImpl,
    tokens,
    credentialProvider: async (mid) => `login_user=${mid}`,
  });
  const token = tokens.issue({ tgId: 1, memberId: A }).token;
  const call = (action, over = {}) => proxy.handle({
    service: 'waimai', action, method: 'GET', query: {}, headers: { authorization: `Bearer ${token}` }, ...over,
  });
  return { fx, proxy, token, call };
}
const leaks = (res, secret) => JSON.stringify(res.body).includes(secret);

test('orderDetail：A 查 B 的订单 → 404，不含数据', async () => {
  const { call } = setup();
  const r = await call('orderDetail', { query: { id: '20' } });
  assert.strictEqual(r.status, 404);
  assert.strictEqual(leaks(r, 'OB-secret'), false);
  assert.strictEqual((await call('orderDetail', { query: { id: '10' } })).status, 200); // 对照：自己的订单可读
});

test('cancelOrder：A 取消 B 的订单 → 404，订单状态不变', async () => {
  const { call, fx } = setup();
  const r = await call('cancelOrder', { query: { id: '20' } });
  assert.strictEqual(r.status, 404);
  assert.strictEqual(fx.orders[20].state, 0);
  assert.deepStrictEqual(fx.log.mutations, []);
});

test('delAddress：A 删除 B 的地址 → 404，预检拦截，上游不收到删除请求', async () => {
  const { call, fx } = setup();
  const r = await call('delAddress', { query: { id: '2' } });
  assert.strictEqual(r.status, 404);
  assert.strictEqual(fx.log.requests.some((q) => q.action === 'delAddress'), false);
  assert.ok(fx.addresses[2]);
});

test('operAddress：A 编辑 B 的地址 → 404，预检拦截，不产生任何写', async () => {
  const { call, fx } = setup();
  const r = await call('operAddress', { method: 'POST', body: { id: '2', person: 'hacked', tel: '1', address: 'x' } });
  assert.strictEqual(r.status, 404);
  assert.deepStrictEqual(fx.log.mutations, []);
  assert.strictEqual(fx.addresses[2].person, 'B-secret');
});

test('getMemberAddress：携带 B 的 id/userid/uid 参数仍只返回 A 的地址（参数不透传）', async () => {
  const { call, fx } = setup();
  const r = await call('getMemberAddress', { query: { id: '2', userid: String(B), uid: String(B), cityid: '1' } });
  assert.strictEqual(r.status, 200);
  assert.strictEqual(leaks(r, 'B-secret'), false);
  const sent = fx.log.requests[0].params;
  assert.strictEqual(sent.userid, undefined);
  assert.strictEqual(sent.uid, undefined);
  assert.strictEqual(sent.id, undefined);
});

// T6.1 补充：上面逐接口的用例各自只走了一条传输通道（orderDetail/cancelOrder/delAddress 走 query，
// operAddress 走 POST body）。fbProxy 的 merged = POST ? { ...query, ...body } : query，
// 归属判定不得依赖 id 从哪一侧进来；否则该合并逻辑回归时四个接口都没有用例兜底。
test('交叉传输面：id 改走另一侧通道（POST body / query），A 访问 B 的对象仍 404 且无写入', async () => {
  const cases = [
    ['orderDetail', { method: 'POST', body: { id: '20' } }],
    ['cancelOrder', { method: 'POST', body: { id: '20' } }],
    ['delAddress', { method: 'POST', body: { id: '2' } }],
    ['operAddress', { query: { id: '2', person: 'hacked', tel: '1', address: 'x' } }],
  ];
  for (const [action, over] of cases) {
    const { call, fx } = setup();
    const r = await call(action, over);
    assert.strictEqual(r.status, 404, action);
    assert.strictEqual(leaks(r, 'OB-secret'), false, action);
    assert.strictEqual(leaks(r, 'B-secret'), false, action);
    assert.deepStrictEqual(fx.log.mutations, [], action);
    assert.strictEqual(fx.orders[20].state, 0, action);
    assert.strictEqual(fx.addresses[2].person, 'B-secret', action);
  }
});

// T6.1 补充：fbProxy.js 的归属预检是条件式的 —— `if (rule.ownershipPrecheck && clientParams[idParam])`。
// 净化会丢弃数组值与不在 params 白名单里的大小写变体，此时预检静默跳过、写操作仍然转发上游。
// 当前不可越权（上游仍按会话 uid 收口），但这是个脆弱不变量，必须有用例锁住：
// id 丢失只能退化为「不带 id」，绝不能退化为「带着 B 的 id 透传」。
test('预检跳过路径的兜底：id 被净化丢弃（数组 / 大小写变体）时绝不触及 B 的行', async () => {
  const cases = [
    ['delAddress', { query: { id: ['1', '2'] } }],
    ['delAddress', { query: { ID: '2' } }],
    ['orderDetail', { query: { ID: '20' } }],
    ['cancelOrder', { query: { ID: '20' } }],
    ['operAddress', { method: 'POST', body: { id: ['1', '2'], person: 'hacked', tel: '1', address: 'x' } }],
    ['operAddress', { method: 'POST', body: { ID: '2', person: 'hacked', tel: '1', address: 'x' } }],
  ];
  for (const [action, over] of cases) {
    const { call, fx } = setup();
    const r = await call(action, over);
    assert.strictEqual(leaks(r, 'OB-secret'), false, action);
    assert.strictEqual(leaks(r, 'B-secret'), false, action);
    assert.ok(fx.addresses[2], action);                                  // B 的地址未被删除
    assert.strictEqual(fx.addresses[2].person, 'B-secret', action);      // B 的地址未被改写
    assert.strictEqual(fx.orders[20].state, 0, action);                  // B 的订单未被取消
    for (const q of fx.log.requests) {
      assert.notStrictEqual(q.params.id, '2', `${action} 上游收到了 B 的地址 id`);
      assert.notStrictEqual(q.params.id, '20', `${action} 上游收到了 B 的订单 id`);
    }
  }
});

test('order：携带 userid=B / store 参数仍只返回 A 的订单', async () => {
  const { call, fx } = setup();
  const r = await call('order', { query: { userid: String(B), store: '1', page: '1' } });
  assert.strictEqual(r.status, 200);
  assert.strictEqual(leaks(r, 'OB-secret'), false);
  assert.strictEqual(fx.log.requests[0].params.userid, undefined);
  assert.strictEqual(fx.log.requests[0].params.store, undefined);
});

test('deal：使用 B 的地址 ID 下单 → 404，不创建订单；价格类参数不透传', async () => {
  const { proxy, token, fx } = setup();
  const base = { service: 'waimai', action: 'deal', method: 'POST', headers: { authorization: `Bearer ${token}`, 'idempotency-key': 'key-attack-0001' } };
  const r = await proxy.handle({ ...base, body: { shop: '1', address: '2', order_content: VALID_OC, tprice: '0', quanid: '9', usePinput: '1', peerpay: '1' } });
  assert.strictEqual(r.status, 404);
  assert.deepStrictEqual(fx.log.mutations, []);
  const sent = fx.log.requests[0].params;
  for (const k of ['tprice', 'quanid', 'usePinput', 'peerpay']) assert.strictEqual(sent[k], undefined, k);
  // 失败不占位：同一幂等键改用自己的地址可成功
  const ok = await proxy.handle({ ...base, body: { shop: '1', address: '1', order_content: VALID_OC } });
  assert.strictEqual(ok.status, 200);
  assert.deepStrictEqual(fx.log.mutations, [['deal', 1]]);
});

test('getCourierLocation：A 查 B 的轨迹 → 404，不含轨迹数据', async () => {
  const { call } = setup();
  const r = await call('getCourierLocation', { query: { orderid: '20' } });
  assert.strictEqual(r.status, 404);
  assert.strictEqual(leaks(r, 'SECRET_PATH'), false);
});

test('getCourierLocation：查自己的订单可读轨迹；不存在的订单号同样 404', async () => {
  const { call, fx } = setup();
  const ok = await call('getCourierLocation', { query: { orderid: '10' } });
  assert.strictEqual(ok.status, 200);
  assert.strictEqual(ok.body.info, '120.1,14.1;120.2,14.2');
  // 预检一次 + 正式一次
  assert.deepStrictEqual(fx.log.requests.map((x) => x.action), ['orderDetail', 'getCourierLocation']);

  const missing = await call('getCourierLocation', { query: { orderid: '999' } });
  assert.strictEqual(missing.status, 404);
});

test('getCourierLocation：预检不通过就不转发（上游不会被调用第二次）', async () => {
  const { call, fx } = setup();
  await call('getCourierLocation', { query: { orderid: '20' } });
  assert.deepStrictEqual(fx.log.requests.map((x) => x.action), ['orderDetail']);
});

test('getCourierLocation：orderid 之外的参数被丢弃，伪造 uid 无效', async () => {
  const { call, fx } = setup();
  await call('getCourierLocation', { query: { orderid: '10', uid: '200', userid: '200' } });
  const hit = fx.log.requests.find((x) => x.action === 'getCourierLocation');
  assert.strictEqual(hit.params.orderid, '10');
  assert.strictEqual(hit.params.uid, undefined);
  assert.strictEqual(hit.params.userid, undefined);
});

test('orderDetail 骑手旁路：客户端 Cookie/courier 参数不会被转发，匿名路径拿不到数据', async () => {
  const { proxy, token, fx } = setup();
  // 1) 匿名（无令牌）：在代理层即 401，根本不触达上游
  const anon = await proxy.handle({ service: 'waimai', action: 'orderDetail', query: { id: '20', courier: '1' }, headers: { cookie: 'courier=evil' } });
  assert.strictEqual(anon.status, 401);
  assert.strictEqual(fx.log.requests.length, 0);
  // 2) 带令牌但夹带骑手 Cookie / 参数：上游只会看到服务端注入的会员凭证
  const r = await proxy.handle({
    service: 'waimai', action: 'orderDetail', query: { id: '20', courier: '1', HN_courier: 'x' },
    headers: { authorization: `Bearer ${token}`, cookie: 'courier=evil; login_user=200' },
  });
  assert.strictEqual(r.status, 404);
  assert.strictEqual(leaks(r, 'OB-secret'), false);
  const up = fx.log.requests[0];
  assert.strictEqual(up.cookie, `login_user=${A}`);
  assert.deepStrictEqual(Object.keys(up.headers).sort(), ['Accept', 'Cookie']);
  assert.strictEqual(up.params.courier, undefined);
});

test('防回归：代理与路由层源码不得读取或转发客户端 Cookie', () => {
  const read = (f) => fs.readFileSync(path.join(__dirname, '../src', f), 'utf8');
  const proxySrc = read('fbProxy.js');
  // 排除 `init.headers.Cookie`（写入服务端注入凭证）；匹配的是读取入站 headers 的 cookie
  assert.doesNotMatch(proxySrc, /(?<![\w.])headers\.cookie|(?<![\w.])headers\[['"]cookie['"]\]|get\('cookie'\)|req\.cookies|req\.headers/i);
  const serverSrc = read('server.js');
  const routeBlock = serverSrc.slice(serverSrc.indexOf("router.all('/fb/:service/:action'"), serverSrc.indexOf("// 3. 东南亚 MVP"));
  assert.match(routeBlock, /headers: \{ authorization: req\.get\('authorization'\), 'idempotency-key': req\.get\('idempotency-key'\) \}/);
  assert.doesNotMatch(routeBlock, /cookie/i);
});

test('上游 handler 源码：7 个接口均按会话会员 uid 做归属过滤（对抗测试的依据）', () => {
  const src = fs.readFileSync(path.join(__dirname, '../../../webroot/api/handlers/waimai.class.php'), 'utf8');
  const body = (name) => {
    const start = src.indexOf(`public function ${name}(`);
    assert.ok(start > 0, name);
    const next = src.indexOf('\n    public function ', start + 10);
    return src.slice(start, next > 0 ? next : undefined);
  };
  assert.match(body('getMemberAddress'), /WHERE `uid` = \$uid/);
  assert.match(body('operAddress'), /UPDATE `#@__waimai_address` SET [^"]*WHERE `id` = \$id AND `uid` = \$uid/);
  assert.match(body('delAddress'), /DELETE FROM `#@__waimai_address` WHERE `id` = \$id AND `uid` = \$uid/);
  assert.match(body('getAddressDetail'), /WHERE `id` = \$id AND `uid` = \$uid/);
  assert.match(body('deal'), /FROM `#@__waimai_address` WHERE `uid` = \$uid AND `id` = \$address/);
  assert.match(body('cancelOrder'), /o\.`id` = '\$id' AND o\.`uid` = '\$uid'/);
  assert.match(body('orderDetail'), /WHERE `id` = \$id AND `uid` = \$userid/);
  assert.match(body('order'), /o\.`uid` = \$uid/);
});

test('F2 回归：自己的地址经真实包装 {state:100,info:row} 预检通过，编辑/删除可用', async () => {
  const { call, fx } = setup();
  const e = await call('operAddress', { method: 'POST', body: { id: '1', person: 'A2', tel: '123456', address: 'x' } });
  assert.strictEqual(e.status, 200);
  assert.deepStrictEqual(fx.log.mutations, [['edit', 1]]);
  const d = await call('delAddress', { query: { id: '1' } });
  assert.strictEqual(d.status, 200);
});

test('F1：order_content 注入与改价被拦截（400，上游不收到请求）', async () => {
  const { proxy, token, fx } = setup();
  const h = { authorization: `Bearer ${token}`, 'idempotency-key': 'key-f1-attack-1' };
  const base = { service: 'waimai', action: 'deal', method: 'POST', headers: h };
  const bad = [
    JSON.stringify([{ id: '0 UNION SELECT password FROM x', count: 1 }]),
    JSON.stringify([{ id: '5', count: -1 }]),
    JSON.stringify([{ id: '5', count: 0 }]),
    JSON.stringify([{ id: '5', count: 100 }]),
    JSON.stringify([{ id: '5', count: 1.5 }]),
    JSON.stringify([{ id: '5', count: 1, ntitle: "x' OR '1'='1" }]),
    JSON.stringify([]),
    JSON.stringify({ id: '5', count: 1 }),
    '[{"id":"5","count":1}',
    'not json',
  ];
  for (const oc of bad) {
    const r = await proxy.handle({ ...base, body: { shop: '1', address: '1', order_content: oc } });
    assert.strictEqual(r.status, 400, oc);
  }
  assert.strictEqual(fx.log.requests.length, 0);
  // 非法 preset / 非数字 shop 同样拒绝；失败请求不占用幂等键
  assert.strictEqual((await proxy.handle({ ...base, body: { shop: '1', address: '1', order_content: VALID_OC, preset: '[{"title":"x"}]' } })).status, 400);
  assert.strictEqual((await proxy.handle({ ...base, body: { shop: '1 OR 1=1', address: '1', order_content: VALID_OC } })).status, 400);
  assert.strictEqual((await proxy.handle({ ...base, body: { shop: '1', address: '1', order_content: VALID_OC } })).status, 200);
});

test('F1：额外键被丢弃、数量字符串被规整；note 中的 JSON 容器/[{ 不会透传', async () => {
  const { proxy, token, fx } = setup();
  const h = { authorization: `Bearer ${token}`, 'idempotency-key': 'key-f1-clean-001' };
  await proxy.handle({ service: 'waimai', action: 'deal', method: 'POST', headers: h, body: {
    shop: '1', address: '1', note: '[{"x":"\' OR 1=1 --"}]',
    order_content: JSON.stringify([{ id: 5, count: '2', price: '0.01', evil: 'x' }]),
  } });
  const sent = fx.log.requests[0].params;
  assert.deepStrictEqual(JSON.parse(sent.order_content), [{ id: '5', count: 2 }]);
  assert.strictEqual(sent.note, undefined);
});

test('F3：超时结果未知，不释放幂等占位；同键重试得到 409 而不是第二笔订单', async () => {
  const tokens2 = tokens;
  const { token } = tokens2.issue({ tgId: 1, memberId: A });
  let upstream = 0;
  const proxy = createFbProxy({ upstreamBase: 'http://x', tokens: tokens2, credentialProvider: async () => `login_user=${A}`,
    fetchImpl: async () => { upstream += 1; throw new Error('timeout'); } });
  const req = { service: 'waimai', action: 'deal', method: 'POST', body: { shop: '1', address: '1', order_content: VALID_OC },
    headers: { authorization: `Bearer ${token}`, 'idempotency-key': 'key-f3-timeout-1' } };
  assert.strictEqual((await proxy.handle(req)).status, 504);
  assert.strictEqual((await proxy.handle(req)).status, 409);
  assert.strictEqual(upstream, 1);
});

test('F5：写接口使用独立更紧的限流，不影响读接口', async () => {
  const { limiterFor } = { limiterFor: (max) => { let n = 0; return () => { n += 1; return n <= max; }; } };
  const fx = fakeFirebird();
  const { token } = tokens.issue({ tgId: 1, memberId: A });
  const proxy = createFbProxy({ upstreamBase: 'http://x', tokens, fetchImpl: fx.fetchImpl, credentialProvider: async (m) => `login_user=${m}`,
    allow: () => true, allowWrite: limiterFor(1) });
  const h = { authorization: `Bearer ${token}` };
  assert.strictEqual((await proxy.handle({ service: 'waimai', action: 'cancelOrder', query: { id: '10' }, headers: h })).status, 200);
  assert.strictEqual((await proxy.handle({ service: 'waimai', action: 'cancelOrder', query: { id: '10' }, headers: h })).status, 429);
  assert.strictEqual((await proxy.handle({ service: 'waimai', action: 'order', query: {}, headers: h })).status, 200);
});
