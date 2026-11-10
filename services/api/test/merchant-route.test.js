'use strict';
// 商家免密入口测试（照 rider-route.test.js 风格：依赖注入 + 最小 req/res stub，
// 不启真实 server、不发真实网络请求、不使用真实 bot token）。
// 覆盖：落地页 / 验签失败 / 手机号非法 / 成功 302 + Set-Cookie 原样透传 / 冲突不顶替 /
//       限频 / 审计 fail-closed / 会话失败的「绑定已生效」文案 / redirect 净化 / 配置缺失 /
//       源码护栏（绝不写 fbs_member_map、无任何写表 SQL）。
const test = require('node:test');
const assert = require('node:assert');
const crypto = require('node:crypto');
const { createMerchantRoute, normalizePhone, safeRedirect, MERCHANT_HOME } = require('../src/merchantRoute');

const BOT_TOKEN = 'test-bot-token-not-a-secret';
const COOKIES = [
  'HN_login_user=QUJD; expires=Sun, 19 Nov 2023 02:13:20 GMT; Max-Age=360000; path=/; domain=fbird.men; secure; SameSite=None',
  'HN_userid=4242; expires=Sun, 19 Nov 2023 02:13:20 GMT; Max-Age=360000; path=/; domain=fbird.men; secure; SameSite=None',
  'HN_tg=1; expires=Thu, 14 Dec 2023 22:13:20 GMT; Max-Age=2592000; path=/; domain=fbird.men; secure; SameSite=None'
];

// 与 telegramAuth 同算法的 initData 签名（仅测试用）
function signInitData(userId, token = BOT_TOKEN) {
  const fields = { auth_date: String(Math.floor(Date.now() / 1000)), user: JSON.stringify({ id: userId, first_name: 'M' }) };
  const check = Object.keys(fields).sort().map((k) => `${k}=${fields[k]}`).join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
  const hash = crypto.createHmac('sha256', secret).update(check).digest('hex');
  return new URLSearchParams({ ...fields, hash }).toString();
}

// ---- 最小 req/res stub（同 rider-route.test.js）----

function makeReq({ body = {}, query = {}, ip = '1.2.3.4' } = {}) {
  return { body, query, ip };
}

function makeRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: '',
    redirectUrl: null,
    jsonBody: null,
    setHeader(k, v) { this.headers[String(k).toLowerCase()] = v; },
    removeHeader(k) { delete this.headers[String(k).toLowerCase()]; },
    status(code) { this.statusCode = code; return this; },
    type(t) {
      this.headers['content-type'] = t === 'html' ? 'text/html; charset=utf-8' : t;
      return this;
    },
    send(b) { this.body = String(b); return this; },
    json(b) { this.jsonBody = b; this.body = JSON.stringify(b); return this; },
    redirect(code, url) {
      if (url === undefined) { url = code; code = 302; }
      this.statusCode = code;
      this.redirectUrl = url;
      this.headers.location = url;
      return this;
    },
  };
  return res;
}

// 模拟 canary gatewayClient 的非 2xx reject 形态：GATEWAY_HTTP_ERROR + status + payload
function httpError(status, code, message = 'gateway error') {
  const e = new Error(`网关返回 HTTP ${status}`);
  e.code = 'GATEWAY_HTTP_ERROR';
  e.status = status;
  e.payload = { success: false, error: { code, message } };
  return e;
}

function makeGateway({ bindScript, sessionScript, bindCalls = [], sessionCalls = [] } = {}) {
  const settle = (script, fallback, p) => {
    const out = typeof script === 'function' ? script(p) : (script || fallback);
    return out instanceof Error ? Promise.reject(out) : out;
  };
  return {
    bindCalls, sessionCalls,
    async merchantBind(p) { bindCalls.push(p); return settle(bindScript, { success: true, data: { member_id: 4242, shop_ids: [1, 2, 3] } }, p); },
    async merchantSession(p) { sessionCalls.push(p); return settle(sessionScript, { success: true, data: { member_id: 4242, shop_ids: [1, 2, 3], redirect: '/wmsj/', set_cookies: COOKIES } }, p); },
  };
}

function makeDeps(overrides = {}) {
  return {
    botToken: BOT_TOKEN,
    validateInitData: require('../src/telegramAuth').validateTelegramInitData,
    gateway: makeGateway(),
    allow: () => true,
    ...overrides,
  };
}

// ---- 手机号归一：与 riderRoute 共用同一实现（契约只能有一处）----

test('normalizePhone：与骑手侧逐字节同源（同一函数，不是复制体）', () => {
  const rider = require('../src/riderRoute');
  assert.strictEqual(normalizePhone, rider.normalizePhone, '必须复用 riderRoute.normalizePhone，不得另写一份');
  assert.strictEqual(normalizePhone('+63 917 888 9999'), '09178889999');
  assert.strictEqual(normalizePhone('abc'), null);
});

// ---- GET 落地页 ----

test('落地页 GET：text/html，含 telegram-web-app.js、表单 POST、手机号输入与商家文案', () => {
  const merchant = createMerchantRoute(makeDeps());
  const res = makeRes();
  merchant.getLanding(makeReq(), res);
  assert.strictEqual(res.statusCode, 200);
  assert.match(res.headers['content-type'], /text\/html/);
  assert.ok(res.body.includes('https://telegram.org/js/telegram-web-app.js'), res.body);
  assert.ok(res.body.includes('method="POST"'), res.body);
  assert.ok(res.body.includes('action="/tg-api/merchant/bind"'), res.body);
  assert.ok(res.body.includes('name="initData"'), res.body);
  assert.ok(res.body.includes('name="phone"'), res.body);
  assert.ok(res.body.includes('请从 Telegram 内打开'), '无 initData 的非 TG 环境要有提示文案');
  assert.ok(res.body.includes('商家'), '文案要面向商家而不是骑手');
  assert.strictEqual(res.headers['cache-control'], 'no-store');
  const csp = res.headers['content-security-policy'] || '';
  assert.match(csp, /script-src 'self' https:\/\/telegram\.org 'nonce-/);
  assert.match(csp, /frame-ancestors https:\/\/web\.telegram\.org/);
  assert.match(csp, /form-action 'self'/);
  const nonce = csp.match(/'nonce-([^']+)'/)[1];
  assert.ok(res.body.includes(`nonce="${nonce}"`), 'script 标签须带同一 nonce');
});

// ---- POST 绑定 ----

test('缺失或伪造 initData → 401，不触达网关', async () => {
  const gw = makeGateway();
  const merchant = createMerchantRoute(makeDeps({ gateway: gw }));
  for (const initData of ['', 'auth_date=1&hash=deadbeef']) {
    const res = makeRes();
    await merchant.postBind(makeReq({ body: { initData, phone: '09178889999' } }), res);
    assert.strictEqual(res.statusCode, 401, `initData=${initData}`);
    assert.strictEqual(gw.bindCalls.length, 0, '验签失败不得触达网关');
    assert.strictEqual(gw.sessionCalls.length, 0);
  }
});

test('手机号格式非法 → 400 且文案给出可接受写法，不触达网关', async () => {
  const gw = makeGateway();
  const merchant = createMerchantRoute(makeDeps({ gateway: gw }));
  for (const phone of ['', "0912'; DROP TABLE x", 'abc', '1']) {
    const res = makeRes();
    await merchant.postBind(makeReq({ body: { initData: signInitData(77), phone } }), res);
    assert.strictEqual(res.statusCode, 400, `phone=${phone}`);
    assert.match(res.body, /INVALID_PHONE/);
    assert.match(res.body, /09178889999/, '400 文案要告诉用户能输什么');
    assert.strictEqual(gw.bindCalls.length, 0);
  }
});

test('成功路径：merchant_bind(tg_user_id, phone, ip) → merchant_session(只带 tg_user_id + hash) → 302 /wmsj/ + Set-Cookie 原样透传', async () => {
  const gw = makeGateway();
  const merchant = createMerchantRoute(makeDeps({ gateway: gw }));
  const initData = signInitData(77);
  const res = makeRes();
  await merchant.postBind(makeReq({ body: { initData, phone: '09178889999' }, ip: '1.2.3.4' }), res);
  assert.strictEqual(res.statusCode, 302);
  assert.strictEqual(res.redirectUrl, '/wmsj/', '商家落点必须是 /wmsj/（后台首页自跳订单页）');
  assert.deepStrictEqual(res.headers['set-cookie'], COOKIES, 'Set-Cookie 必须逐字节等于网关返回值');
  assert.deepStrictEqual(gw.bindCalls[0], { tg_user_id: '77', phone: '09178889999', ip: '1.2.3.4' });
  // 只传 initData 的 sha256，原文不出 Node
  assert.deepStrictEqual(gw.sessionCalls[0], { tg_user_id: '77', init_data_hash: crypto.createHash('sha256').update(initData).digest('hex') });
  assert.ok(!JSON.stringify(gw.sessionCalls[0]).includes('hash='), '不得把 initData 原文传给网关');
});

test('成功路径：+63 写法在进网关前已归一', async () => {
  const gw = makeGateway();
  const merchant = createMerchantRoute(makeDeps({ gateway: gw }));
  const res = makeRes();
  await merchant.postBind(makeReq({ body: { initData: signInitData(77), phone: '+63 917 888 9999' } }), res);
  assert.strictEqual(res.statusCode, 302);
  assert.strictEqual(gw.bindCalls[0].phone, '09178889999');
});

// ---- 冲突绝不静默顶替 ----

test('冲突：会员已被别的 TG 绑定 → 409 MERCHANT_ALREADY_BOUND，无 302、无 Cookie', async () => {
  const gw = makeGateway({ bindScript: httpError(409, 'MERCHANT_ALREADY_BOUND') });
  const merchant = createMerchantRoute(makeDeps({ gateway: gw }));
  const res = makeRes();
  await merchant.postBind(makeReq({ body: { initData: signInitData(77), phone: '09178889999' } }), res);
  assert.strictEqual(res.statusCode, 409);
  assert.strictEqual(res.redirectUrl, null, '冲突时不得重定向');
  assert.strictEqual(res.headers['set-cookie'], undefined, '冲突时不得下发任何 Cookie');
  assert.strictEqual(gw.sessionCalls.length, 0, '冲突时不得签会话');
  assert.match(res.body, /MERCHANT_ALREADY_BOUND/);
});

test('冲突：当前 TG 已绑别的会员 → 409 TG_ALREADY_BOUND，原绑定保持不动', async () => {
  const gw = makeGateway({ bindScript: httpError(409, 'TG_ALREADY_BOUND') });
  const merchant = createMerchantRoute(makeDeps({ gateway: gw }));
  const res = makeRes();
  await merchant.postBind(makeReq({ body: { initData: signInitData(77), phone: '09178889999' } }), res);
  assert.strictEqual(res.statusCode, 409);
  assert.strictEqual(res.redirectUrl, null);
  assert.match(res.body, /TG_ALREADY_BOUND/);
});

test('冲突：同手机号命中多个会员 → 409 MERCHANT_AMBIGUOUS（手机号无唯一索引，绝不猜）', async () => {
  const gw = makeGateway({ bindScript: httpError(409, 'MERCHANT_AMBIGUOUS') });
  const merchant = createMerchantRoute(makeDeps({ gateway: gw }));
  const res = makeRes();
  await merchant.postBind(makeReq({ body: { initData: signInitData(77), phone: '09178889999' } }), res);
  assert.strictEqual(res.statusCode, 409);
  assert.match(res.body, /MERCHANT_AMBIGUOUS/);
  assert.match(res.body, /运营/, '歧义只能靠运营按手机号排查，文案要写明');
});

test('404：手机号未匹配 / 无店铺归属；无店铺的文案必须可执行（找运营分配）', async () => {
  const merchant = createMerchantRoute(makeDeps({ gateway: makeGateway({ bindScript: httpError(404, 'MERCHANT_NOT_FOUND') }) }));
  const res = makeRes();
  await merchant.postBind(makeReq({ body: { initData: signInitData(77), phone: '09178889999' } }), res);
  assert.strictEqual(res.statusCode, 404);
  assert.match(res.body, /MERCHANT_NOT_FOUND/);
  assert.match(res.body, /会员手机号/, '文案要提示核对登记的手机号');
  assert.strictEqual(res.redirectUrl, null);

  const m2 = createMerchantRoute(makeDeps({ gateway: makeGateway({ bindScript: httpError(404, 'MERCHANT_NO_SHOP') }) }));
  const res2 = makeRes();
  await m2.postBind(makeReq({ body: { initData: signInitData(77), phone: '09178889999' } }), res2);
  assert.strictEqual(res2.statusCode, 404);
  assert.match(res2.body, /MERCHANT_NO_SHOP/);
  assert.match(res2.body, /运营.*分配|分配.*运营/, '无店铺是运营补数据的问题，文案必须可执行');
  assert.strictEqual(res2.redirectUrl, null);
});

test('403：会员停用/注销原样透传；503：审计 fail-closed（AUDIT_UNAVAILABLE）不降级成 502', async () => {
  const m403 = createMerchantRoute(makeDeps({ gateway: makeGateway({ bindScript: httpError(403, 'MEMBER_DISABLED') }) }));
  const r403 = makeRes();
  await m403.postBind(makeReq({ body: { initData: signInitData(1), phone: '09178889999' } }), r403);
  assert.strictEqual(r403.statusCode, 403);
  assert.match(r403.body, /MEMBER_DISABLED/);

  const m503 = createMerchantRoute(makeDeps({ gateway: makeGateway({ bindScript: httpError(503, 'AUDIT_UNAVAILABLE') }) }));
  const r503 = makeRes();
  await m503.postBind(makeReq({ body: { initData: signInitData(1), phone: '09178889999' } }), r503);
  assert.strictEqual(r503.statusCode, 503);
  assert.match(r503.body, /AUDIT_UNAVAILABLE/);
});

test('限频：网关 429 → 429 BIND_RATE_LIMITED，无 302；Node 侧计数限频 → 429 且不触达网关', async () => {
  const gw = makeGateway({ bindScript: httpError(429, 'BIND_RATE_LIMITED') });
  const merchant = createMerchantRoute(makeDeps({ gateway: gw }));
  const res = makeRes();
  await merchant.postBind(makeReq({ body: { initData: signInitData(77), phone: '09178889999' } }), res);
  assert.strictEqual(res.statusCode, 429);
  assert.strictEqual(res.redirectUrl, null);
  assert.match(res.body, /BIND_RATE_LIMITED/);

  let n = 0;
  const gw2 = makeGateway();
  const merchant2 = createMerchantRoute(makeDeps({ gateway: gw2, allow: () => (n++ === 0) }));
  const ok = makeRes();
  await merchant2.postBind(makeReq({ body: { initData: signInitData(1), phone: '09178889999' } }), ok);
  assert.strictEqual(ok.statusCode, 302);
  const limited = makeRes();
  await merchant2.postBind(makeReq({ body: { initData: signInitData(1), phone: '09178889999' } }), limited);
  assert.strictEqual(limited.statusCode, 429);
  assert.strictEqual(gw2.bindCalls.length, 1, '限频后不得触达网关');
});

// ---- G-8 同款教训：绑定已生效但换会话失败 ----

test('绑定成功但 merchant_session 失败 → 502 MERCHANT_SESSION_FAILED，文案区分「绑定已生效」', async () => {
  const gw = makeGateway({ sessionScript: httpError(500, 'INTERNAL_ERROR', 'boom') });
  const merchant = createMerchantRoute(makeDeps({ gateway: gw }));
  const res = makeRes();
  await merchant.postBind(makeReq({ body: { initData: signInitData(1), phone: '09178889999' } }), res);
  assert.strictEqual(res.statusCode, 502);
  assert.strictEqual(res.redirectUrl, null);
  assert.strictEqual(res.headers['set-cookie'], undefined);
  assert.ok(res.body.includes('MERCHANT_SESSION_FAILED'), `错误码应为 MERCHANT_SESSION_FAILED：${res.body}`);
  assert.ok(res.body.includes('绑定已生效'), '文案必须说明绑定已生效，避免诱导换号重绑');
  assert.ok(!res.body.includes('MERCHANT_FAILED'), '不得复用 MERCHANT_FAILED（用户会误判绑定失败）');
});

test('网关返回空 set_cookies / 非法 member_id → 502，不下发半截登录态', async () => {
  for (const bad of [
    { sessionScript: { success: true, data: { member_id: 4242, redirect: '/wmsj/', set_cookies: [] } } },
    { sessionScript: { success: true, data: { member_id: 0, redirect: '/wmsj/', set_cookies: COOKIES } } },
    { sessionScript: { success: false, error: { code: 'INTERNAL_ERROR', message: 'boom' } } },
  ]) {
    const merchant = createMerchantRoute(makeDeps({ gateway: makeGateway(bad) }));
    const res = makeRes();
    await merchant.postBind(makeReq({ body: { initData: signInitData(1), phone: '09178889999' } }), res);
    assert.strictEqual(res.statusCode, 502);
    assert.strictEqual(res.headers['set-cookie'], undefined);
  }
});

// ---- redirect 净化 ----

test('safeRedirect：只接受站内绝对路径，//、\\、协议、控制字符、超长一律回落 /wmsj/', () => {
  assert.strictEqual(safeRedirect('/wmsj/'), '/wmsj/');
  assert.strictEqual(safeRedirect('/wmsj/order/waimaiOrder.php?sid=1'), '/wmsj/order/waimaiOrder.php?sid=1');
  for (const bad of ['', '   ', null, undefined, 123, '//evil.com', '/\\evil', 'https://evil.com', 'http://x/y', '/a\r\nb', '/' + 'a'.repeat(201)]) {
    assert.strictEqual(safeRedirect(bad), MERCHANT_HOME, `input=${JSON.stringify(bad)}`);
  }
});

test('网关返回恶意 redirect → 302 仍落到 /wmsj/，不外跳', async () => {
  const gw = makeGateway({ sessionScript: { success: true, data: { member_id: 4242, redirect: 'https://evil.example/', set_cookies: COOKIES } } });
  const merchant = createMerchantRoute(makeDeps({ gateway: gw }));
  const res = makeRes();
  await merchant.postBind(makeReq({ body: { initData: signInitData(1), phone: '09178889999' } }), res);
  assert.strictEqual(res.statusCode, 302);
  assert.strictEqual(res.redirectUrl, '/wmsj/');
});

// ---- /merchant/session ----

test('session：已绑定 → Set-Cookie + {bound:true, member_id, shop_ids, redirect}；未绑定 → {bound:false}', async () => {
  const initData = signInitData(77);
  const gw = makeGateway({
    sessionScript: (p) => (p.tg_user_id === '77'
      ? { success: true, data: { member_id: 4242, shop_ids: [1, 2, 3], redirect: '/wmsj/', set_cookies: COOKIES } }
      : httpError(404, 'MERCHANT_NOT_BOUND')),
  });
  const merchant = createMerchantRoute(makeDeps({ gateway: gw }));
  const bound = makeRes();
  await merchant.session(makeReq({ body: { initData } }), bound);
  assert.strictEqual(bound.statusCode, 200);
  assert.deepStrictEqual(bound.jsonBody, { success: true, data: { bound: true, member_id: 4242, shop_ids: [1, 2, 3], redirect: '/wmsj/' } });
  assert.deepStrictEqual(bound.headers['set-cookie'], COOKIES);
  assert.deepStrictEqual(gw.sessionCalls[0], { tg_user_id: '77', init_data_hash: crypto.createHash('sha256').update(initData).digest('hex') });

  const unbound = makeRes();
  await merchant.session(makeReq({ body: { initData: signInitData(88) } }), unbound);
  assert.strictEqual(unbound.statusCode, 200);
  assert.deepStrictEqual(unbound.jsonBody, { success: true, data: { bound: false } });
});

test('session：MERCHANT_NOT_BOUND 以 200 bound:false 表达（不是错误），MERCHANT_NO_SHOP → 403', async () => {
  const gw = makeGateway({ sessionScript: (p) => (p.tg_user_id === '88'
    ? httpError(404, 'MERCHANT_NOT_BOUND')
    : httpError(404, 'MERCHANT_NO_SHOP')) });
  const merchant = createMerchantRoute(makeDeps({ gateway: gw }));
  const nb = makeRes();
  await merchant.session(makeReq({ body: { initData: signInitData(88) } }), nb);
  assert.strictEqual(nb.statusCode, 200);
  assert.strictEqual(nb.jsonBody.data.bound, false);

  const ns = makeRes();
  await merchant.session(makeReq({ body: { initData: signInitData(77) } }), ns);
  assert.strictEqual(ns.statusCode, 403);
  assert.strictEqual(ns.jsonBody.error.code, 'MERCHANT_NO_SHOP');
});

test('m5：session 只认 POST body.initData，query 传参一律忽略（401）；响应带 no-store（含失败分支）', async () => {
  const merchant = createMerchantRoute(makeDeps());
  const resQuery = makeRes();
  await merchant.session(makeReq({ query: { initData: signInitData(77) } }), resQuery);
  assert.strictEqual(resQuery.statusCode, 401, 'initData 是短期凭证，不允许进 URL/访问日志');

  const ok = makeRes();
  await merchant.session(makeReq({ body: { initData: signInitData(77) } }), ok);
  assert.strictEqual(ok.statusCode, 200);
  assert.strictEqual(ok.headers['cache-control'], 'no-store');
  const bad = makeRes();
  await merchant.session(makeReq({ body: { initData: 'forged' } }), bad);
  assert.strictEqual(bad.headers['cache-control'], 'no-store');
});

// ---- 配置缺失 / 日志卫生 ----

test('配置缺失（gateway null / botToken 空）→ GET 与 POST 均 503，进程不崩', async () => {
  const merchant = createMerchantRoute({ botToken: '', validateInitData: () => ({ valid: true }), gateway: null });
  const resGet = makeRes();
  merchant.getLanding(makeReq(), resGet);
  const resPost = makeRes();
  await merchant.postBind(makeReq({ body: { initData: signInitData(1), phone: '09178889999' } }), resPost);
  assert.strictEqual(resGet.statusCode, 503);
  assert.strictEqual(resPost.statusCode, 503);
  assert.match(resGet.body, /MERCHANT_NOT_CONFIGURED/);
  assert.match(resPost.body, /MERCHANT_NOT_CONFIGURED/);
});

test('错误响应不回显 initData；网关抛错时 initData 与手机号不进日志', async () => {
  const captured = [];
  const orig = console.error;
  console.error = (...a) => captured.push(a.map(String).join(' '));
  try {
    const initData = signInitData(1);
    const merchant = createMerchantRoute(makeDeps({ gateway: makeGateway({ bindScript: async () => { throw new Error('gateway boom'); } }) }));
    const res = makeRes();
    await merchant.postBind(makeReq({ body: { initData, phone: '09178889999' } }), res);
    assert.strictEqual(res.statusCode, 502);
    assert.ok(!res.body.includes(initData), '错误页不得回显 initData');
    const all = captured.join('\n');
    assert.ok(!all.includes('initData='), 'initData 字段不得整体进日志');
    assert.ok(!all.includes('09178889999'), '手机号不得进日志');
  } finally {
    console.error = orig;
  }
});

// ---- 源码护栏 ----

test('源码护栏：Node 侧无任何写表语句，且代码（除注释外）不出现 fbs_member_map（铁律）', () => {
  const src = require('node:fs').readFileSync(require('node:path').join(__dirname, '../src/merchantRoute.js'), 'utf8');
  // 剥掉注释后检查：铁律约束的是「代码行为」，注释里的警示文案是允许（且希望）存在的
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  assert.ok(!/INSERT\s+INTO/i.test(code), '映射写入只发生在 PHP 网关，Node 侧不得写表');
  assert.ok(!/DELETE\s+FROM/i.test(code), 'B1 冲突语义不允许用 DELETE 顶替原绑定');
  assert.ok(!/REPLACE\s+INTO/i.test(code), '不得用 REPLACE INTO 隐式顶替');
  assert.ok(!/UPDATE\s+\w+\s+SET/i.test(code), 'Node 侧不得改任何映射表');
  assert.ok(!code.includes('fbs_member_map'), '商家分支绝不触碰 fbs_member_map（收银台归属底账）');
  assert.ok(!code.includes('fbs_merchant_map'), 'Node 侧也不读 fbs_merchant_map（查绑定在网关 merchant_session 内做）');
  // initData 只进 sha256 后交给网关，原文不得出现在任何出站参数名里
  assert.match(src, /createHash\('sha256'\)\.update\(initData\)/);
  // R2：有效期必须复用 telegramAuth 的 1 小时常量，不得另写字面量（与 tgLogin 的登录口径一致）
  assert.match(src, /maxAgeSeconds: MAX_AUTH_AGE_SECONDS/g);
  assert.strictEqual(src.match(/maxAgeSeconds:/g).length, 2, 'postBind 与 session 两处都必须收窄到 1h');
});

// ---- R2：initData 有效期与顾客桥对齐（1 小时）----

// 与 signInitData 同算法，但 auth_date 可指定
function signInitDataAt(userId, authDate, token = BOT_TOKEN) {
  const fields = { auth_date: String(authDate), user: JSON.stringify({ id: userId, first_name: 'M' }) };
  const check = Object.keys(fields).sort().map((k) => `${k}=${fields[k]}`).join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
  const hash = crypto.createHmac('sha256', secret).update(check).digest('hex');
  return new URLSearchParams({ ...fields, hash }).toString();
}

test('initData 过期（auth_date 超过 1 小时）→ 401，不触达网关（与 tgLogin 同口径）', async () => {
  const gw = makeGateway();
  const merchant = createMerchantRoute(makeDeps({ gateway: gw }));
  const stale = signInitDataAt(77, Math.floor(Date.now() / 1000) - 3601);
  const res = makeRes();
  await merchant.postBind(makeReq({ body: { initData: stale, phone: '09178889999' } }), res);
  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(gw.bindCalls.length, 0, '过期 initData 不得触达网关');

  const resSession = makeRes();
  await merchant.session(makeReq({ body: { initData: stale } }), resSession);
  assert.strictEqual(resSession.statusCode, 401);
  assert.strictEqual(gw.sessionCalls.length, 0);
});
