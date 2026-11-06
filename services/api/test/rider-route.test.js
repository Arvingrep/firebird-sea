'use strict';
// T6 骑手绑定与登录测试（照 bridge-route.test.js 风格：依赖注入 + 最小 req/res stub，
// 不启真实 server、不发真实网络请求、不使用真实 bot token）。
const test = require('node:test');
const assert = require('node:assert');
const crypto = require('node:crypto');
const { createRiderRoute, normalizePhone } = require('../src/riderRoute');

const BOT_TOKEN = 'test-bot-token-not-a-secret';
const WORKBENCH_URL = 'https://canary.fbird.men/ql.html?token=FAKE';
const SESSION_SQL_77 = 'SELECT courier_id FROM fbs_courier_map WHERE tg_user_id = 77 LIMIT 1';

// 与 telegramAuth 同算法的 initData 签名（仅测试用）
function signInitData(userId, token = BOT_TOKEN) {
  const fields = { auth_date: String(Math.floor(Date.now() / 1000)), user: JSON.stringify({ id: userId, first_name: 'R' }) };
  const check = Object.keys(fields).sort().map((k) => `${k}=${fields[k]}`).join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
  const hash = crypto.createHmac('sha256', secret).update(check).digest('hex');
  return new URLSearchParams({ ...fields, hash }).toString();
}

// ---- 最小 req/res stub ----

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

// ---- stub 工厂 ----

function makeGateway({ bindScript, qlScript, bindCalls = [], qlCalls = [] } = {}) {
  return {
    bindCalls, qlCalls,
    async riderBind(p) { bindCalls.push(p); return typeof bindScript === 'function' ? bindScript(p) : (bindScript || { state: 100, info: { courier_id: 9 } }); },
    async riderQl(p) { qlCalls.push(p); return typeof qlScript === 'function' ? qlScript(p) : (qlScript || { state: 100, info: { courier_id: 9, url: WORKBENCH_URL } }); },
  };
}

function makeConn({ rows = {} } = {}) {
  return { query: async (sql) => (rows[sql] !== undefined ? rows[sql] : '') };
}

function makeDeps(overrides = {}) {
  return {
    botToken: BOT_TOKEN,
    validateInitData: require('../src/telegramAuth').validateTelegramInitData,
    gateway: makeGateway(),
    conn: makeConn(),
    allow: () => true,
    allowedHosts: ['canary.fbird.men'],
    ...overrides,
  };
}

// ---- 手机号归一（M4）----

test('normalizePhone：+63 / 63 前缀 / 空格横线括号点号 都归一成 0 开头的本地写法', () => {
  const cases = [
    ['09171234567', '09171234567'],
    ['+639171234567', '09171234567'],
    ['+63 917 123 4567', '09171234567'],
    ['63-917-123-4567', '09171234567'],
    ['(0917) 123 4567', '09171234567'],
    ['0917.123.4567', '09171234567'],
    ['  09171234567  ', '09171234567'],
    ['0912345678', '0912345678'], // 10 位历史存量也要过
  ];
  for (const [input, want] of cases) {
    assert.strictEqual(normalizePhone(input), want, `input=${JSON.stringify(input)}`);
  }
});

test('normalizePhone：非法输入返回 null（非数字、长度不符、非 0 开头、注入串）', () => {
  const bad = ['', '   ', 'abc', '1', '9171234567', '009171234567', "0912'; DROP TABLE x", '091712345678901', null, undefined, {}];
  for (const input of bad) {
    assert.strictEqual(normalizePhone(input), null, `input=${JSON.stringify(input)}`);
  }
});

// ---- GET 落地页 ----

test('落地页 GET：text/html，含 telegram-web-app.js、表单 POST 到绑定端点、手机号输入与格式说明', () => {
  const rider = createRiderRoute(makeDeps());
  const res = makeRes();
  rider.getLanding(makeReq(), res);
  assert.strictEqual(res.statusCode, 200);
  assert.match(res.headers['content-type'], /text\/html/);
  assert.ok(res.body.includes('https://telegram.org/js/telegram-web-app.js'), res.body);
  assert.ok(res.body.includes('method="POST"'), res.body);
  assert.ok(res.body.includes('action="/tg-api/rider/bind"'), res.body);
  assert.ok(res.body.includes('name="initData"'), res.body);
  assert.ok(res.body.includes('name="phone"'), res.body);
  assert.ok(res.body.includes('请从 Telegram 内打开'), '无 initData 的非 TG 环境要有提示文案');
  assert.strictEqual(res.headers['cache-control'], 'no-store');
  const csp = res.headers['content-security-policy'] || '';
  assert.match(csp, /script-src 'self' https:\/\/telegram\.org 'nonce-/);
  assert.match(csp, /frame-ancestors https:\/\/web\.telegram\.org/);
  assert.match(csp, /form-action 'self'/);
  const nonce = csp.match(/'nonce-([^']+)'/)[1];
  assert.ok(res.body.includes(`nonce="${nonce}"`), 'script 标签须带同一 nonce');
});

test('落地页：明确列出可接受的手机号写法（M4 说明），pattern 收得比 before 更紧', () => {
  const res = makeRes();
  createRiderRoute(makeDeps()).getLanding(makeReq(), res);
  assert.match(res.body, /09171234567/, '示例写法要出现在页面上');
  assert.match(res.body, /\+639171234567/, '+63 写法要有示例');
  assert.match(res.body, /空格横线括号会自动忽略/, '要解释归一行为');
});

// ---- POST 绑定 ----

test('缺失或伪造 initData → 401，不触达网关', async () => {
  const gw = makeGateway();
  const rider = createRiderRoute(makeDeps({ gateway: gw }));
  for (const initData of ['', 'auth_date=1&hash=deadbeef']) {
    const res = makeRes();
    await rider.postBind(makeReq({ body: { initData, phone: '0912345678' } }), res);
    assert.strictEqual(res.statusCode, 401, `initData=${initData}`);
    assert.strictEqual(gw.bindCalls.length, 0, '验签失败不得触达网关');
  }
});

test('手机号格式非法 → 400 且文案给出可接受写法，不触达网关', async () => {
  const gw = makeGateway();
  const rider = createRiderRoute(makeDeps({ gateway: gw }));
  for (const phone of ['', "0912'; DROP TABLE x", 'abc', '1']) {
    const res = makeRes();
    await rider.postBind(makeReq({ body: { initData: signInitData(77), phone } }), res);
    assert.strictEqual(res.statusCode, 400, `phone=${phone}`);
    assert.match(res.body, /INVALID_PHONE/);
    assert.match(res.body, /09171234567/, '400 文案要告诉用户能输什么');
    assert.strictEqual(gw.bindCalls.length, 0);
  }
});

test('成功路径：initData 验签 → rider_bind(tg_user_id, phone, ip) → rider_ql(courier_id) → 302 工作台', async () => {
  const gw = makeGateway();
  const rider = createRiderRoute(makeDeps({ gateway: gw }));
  const res = makeRes();
  await rider.postBind(makeReq({ body: { initData: signInitData(77), phone: '0912345678' }, ip: '1.2.3.4' }), res);
  assert.strictEqual(res.statusCode, 302);
  assert.strictEqual(res.redirectUrl, WORKBENCH_URL);
  // ip 进网关只为限频与审计（B1 补偿），不进日志
  assert.deepStrictEqual(gw.bindCalls[0], { tg_user_id: '77', phone: '0912345678', ip: '1.2.3.4' });
  assert.deepStrictEqual(gw.qlCalls[0], { courier_id: 9 });
});

test('成功路径：+63 写法在进网关前已归一（M4 端到端）', async () => {
  const gw = makeGateway();
  const rider = createRiderRoute(makeDeps({ gateway: gw }));
  const res = makeRes();
  await rider.postBind(makeReq({ body: { initData: signInitData(77), phone: '+63 917 123 4567' } }), res);
  assert.strictEqual(res.statusCode, 302);
  assert.strictEqual(gw.bindCalls[0].phone, '09171234567');
});

// ---- B1：冲突绝不静默顶替 ----

test('B1 冲突：骑手已被别的 TG 绑定 → 409 COURIER_ALREADY_BOUND，无 302、不发令牌', async () => {
  const gw = makeGateway({ bindScript: { state: 409, info: { code: 'COURIER_ALREADY_BOUND' } } });
  const rider = createRiderRoute(makeDeps({ gateway: gw }));
  const res = makeRes();
  await rider.postBind(makeReq({ body: { initData: signInitData(77), phone: '0912345678' } }), res);
  assert.strictEqual(res.statusCode, 409);
  assert.strictEqual(res.redirectUrl, null, '冲突时不得重定向到工作台');
  assert.strictEqual(gw.qlCalls.length, 0, '冲突时不得签工作台令牌');
  assert.match(res.body, /COURIER_ALREADY_BOUND/);
});

test('B1 冲突：当前 TG 已绑别的骑手 → 409 TG_ALREADY_BOUND，无 302、不发令牌', async () => {
  const gw = makeGateway({ bindScript: { state: 409, info: { code: 'TG_ALREADY_BOUND' } } });
  const rider = createRiderRoute(makeDeps({ gateway: gw }));
  const res = makeRes();
  await rider.postBind(makeReq({ body: { initData: signInitData(77), phone: '0912345678' } }), res);
  assert.strictEqual(res.statusCode, 409);
  assert.strictEqual(res.redirectUrl, null);
  assert.strictEqual(gw.qlCalls.length, 0);
  assert.match(res.body, /TG_ALREADY_BOUND/);
});

test('B1 冲突/失败文案一律不给「联系管理员」这类甩锅动作', async () => {
  const cases = [
    ['COURIER_ALREADY_BOUND', { state: 409, info: { code: 'COURIER_ALREADY_BOUND' } }],
    ['TG_ALREADY_BOUND', { state: 409, info: { code: 'TG_ALREADY_BOUND' } }],
    ['BIND_RATE_LIMITED', { state: 429, info: { code: 'BIND_RATE_LIMITED' } }],
    ['COURIER_NOT_FOUND', { state: 404, info: 'courier not found or unavailable' }],
  ];
  for (const [label, script] of cases) {
    const rider = createRiderRoute(makeDeps({ gateway: makeGateway({ bindScript: script }) }));
    const res = makeRes();
    await rider.postBind(makeReq({ body: { initData: signInitData(77), phone: '0912345678' } }), res);
    assert.ok(res.statusCode >= 400, label);
    assert.ok(!res.body.includes('联系管理员'), `${label} 文案不得引导联系管理员`);
    assert.ok(!res.body.includes('联系站点运营'), `${label} 文案不得把问题推给运营`);
  }
});

test('B1 冲突文案：给用户可执行动作（自解绑）', async () => {
  for (const code of ['COURIER_ALREADY_BOUND', 'TG_ALREADY_BOUND']) {
    const rider = createRiderRoute(makeDeps({ gateway: makeGateway({ bindScript: { state: 409, info: { code } } }) }));
    const res = makeRes();
    await rider.postBind(makeReq({ body: { initData: signInitData(77), phone: '0912345678' } }), res);
    assert.strictEqual(res.statusCode, 409, code);
    assert.match(res.body, /解绑/, `${code} 文案要引导用户自己解绑`);
  }
});

test('B1 冲突：网关未给已知 code 也要 409 兜底，不静默成功', async () => {
  const rider = createRiderRoute(makeDeps({ gateway: makeGateway({ bindScript: { state: 409, info: {} } }) }));
  const res = makeRes();
  await rider.postBind(makeReq({ body: { initData: signInitData(77), phone: '0912345678' } }), res);
  assert.strictEqual(res.statusCode, 409);
  assert.strictEqual(res.redirectUrl, null);
});

test('B1 限频：网关 429（双维度限频）→ 429 BIND_RATE_LIMITED，无 302', async () => {
  const gw = makeGateway({ bindScript: { state: 429, info: { code: 'BIND_RATE_LIMITED' } } });
  const rider = createRiderRoute(makeDeps({ gateway: gw }));
  const res = makeRes();
  await rider.postBind(makeReq({ body: { initData: signInitData(77), phone: '0912345678' } }), res);
  assert.strictEqual(res.statusCode, 429);
  assert.strictEqual(res.redirectUrl, null);
  assert.strictEqual(gw.qlCalls.length, 0);
  assert.match(res.body, /BIND_RATE_LIMITED/);
});

test('手机号未匹配骑手（网关 404 语义）→ 404 COURIER_NOT_FOUND，无 302', async () => {
  const gw = makeGateway({ bindScript: { state: 404, info: 'courier not found or unavailable' } });
  const rider = createRiderRoute(makeDeps({ gateway: gw }));
  const res = makeRes();
  await rider.postBind(makeReq({ body: { initData: signInitData(77), phone: '0912345678' } }), res);
  assert.strictEqual(res.statusCode, 404);
  assert.strictEqual(res.redirectUrl, null);
  assert.match(res.body, /COURIER_NOT_FOUND/);
  assert.match(res.body, /未找到该手机号对应的骑手账号/);
});

test('rider_ql 返回非 https URL / 非 100 → 502，不重定向', async () => {
  const bad1 = makeGateway({ qlScript: { state: 200, info: '骑手不存在或状态不可用' } });
  const r1 = makeRes();
  await createRiderRoute(makeDeps({ gateway: bad1 })).postBind(makeReq({ body: { initData: signInitData(1), phone: '0912345678' } }), r1);
  assert.strictEqual(r1.statusCode, 502);
  assert.strictEqual(r1.redirectUrl, null);

  const bad2 = makeGateway({ qlScript: { state: 100, info: { url: 'http://evil.example/ql' } } });
  const r2 = makeRes();
  await createRiderRoute(makeDeps({ gateway: bad2 })).postBind(makeReq({ body: { initData: signInitData(1), phone: '0912345678' } }), r2);
  assert.strictEqual(r2.statusCode, 502);
  assert.strictEqual(r2.redirectUrl, null);
});

test('302 目标域名白名单（m7）：https 但不在 CORS_ORIGINS 派生白名单内 → 502，不重定向', async () => {
  const gw = makeGateway({ qlScript: { state: 100, info: { url: 'https://evil.example/ql?token=FAKE' } } });
  const rider = createRiderRoute(makeDeps({ gateway: gw, allowedHosts: ['canary.fbird.men'] }));
  const res = makeRes();
  await rider.postBind(makeReq({ body: { initData: signInitData(1), phone: '0912345678' } }), res);
  assert.strictEqual(res.statusCode, 502);
  assert.strictEqual(res.redirectUrl, null);
});

test('网关抛错 → 502；initData 与手机号不进日志', async () => {
  const captured = [];
  const orig = console.error;
  console.error = (...a) => captured.push(a.map(String).join(' '));
  try {
    const gw = makeGateway({ bindScript: async () => { throw new Error('gateway boom'); } });
    const res = makeRes();
    await createRiderRoute(makeDeps({ gateway: gw })).postBind(
      makeReq({ body: { initData: signInitData(1), phone: '0912345678' } }), res);
    assert.strictEqual(res.statusCode, 502);
    assert.strictEqual(res.redirectUrl, null);
    const all = captured.join('\n');
    assert.ok(!all.includes('initData'), 'initData 字段不得整体进日志');
    assert.ok(!all.includes('0912345678'), '手机号不得进日志');
  } finally {
    console.error = orig;
  }
});

test('网关调用计数限频 → 429，不触达网关', async () => {
  let n = 0;
  const gw = makeGateway();
  const rider = createRiderRoute(makeDeps({ gateway: gw, allow: () => (n++ === 0) }));
  const res1 = makeRes();
  await rider.postBind(makeReq({ body: { initData: signInitData(1), phone: '0912345678' } }), res1);
  assert.strictEqual(res1.statusCode, 302);
  const res2 = makeRes();
  await rider.postBind(makeReq({ body: { initData: signInitData(1), phone: '0912345678' } }), res2);
  assert.strictEqual(res2.statusCode, 429);
  assert.strictEqual(gw.bindCalls.length, 1, '限频后不得触达网关');
});

test('错误响应不回显 initData', async () => {
  const rider = createRiderRoute(makeDeps({ gateway: makeGateway({ bindScript: { state: 500, info: 'boom' } }) }));
  const initData = signInitData(1);
  const res = makeRes();
  await rider.postBind(makeReq({ body: { initData, phone: 'bad' } }), res);
  assert.ok(!res.body.includes(initData));
});

// ---- 配置缺失 ----

test('配置缺失（gateway null / botToken 空 / conn 空）→ GET 与 POST 均 503，进程不崩', async () => {
  const rider = createRiderRoute({ botToken: BOT_TOKEN, validateInitData: () => ({ valid: true }), gateway: null, conn: makeConn() });
  const resGet = makeRes();
  rider.getLanding(makeReq(), resGet);
  const resPost = makeRes();
  await rider.postBind(makeReq({ body: { initData: signInitData(1), phone: '0912345678' } }), resPost);
  assert.strictEqual(resGet.statusCode, 503);
  assert.strictEqual(resPost.statusCode, 503);
  assert.match(resGet.body, /RIDER_NOT_CONFIGURED/);
  assert.match(resPost.body, /RIDER_NOT_CONFIGURED/);
});

// ---- 补充边界：initData 过期 / 幂等重绑 ----

// 与 signInitData 同算法，但 auth_date 可指定（验证 telegramAuth 的 1 小时有效期分支）
function signInitDataAt(userId, authDate, token = BOT_TOKEN) {
  const fields = { auth_date: String(authDate), user: JSON.stringify({ id: userId, first_name: 'R' }) };
  const check = Object.keys(fields).sort().map((k) => `${k}=${fields[k]}`).join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
  const hash = crypto.createHmac('sha256', secret).update(check).digest('hex');
  return new URLSearchParams({ ...fields, hash }).toString();
}

test('initData 过期（auth_date 超过 1 小时）→ 401，不触达网关', async () => {
  const gw = makeGateway();
  const rider = createRiderRoute(makeDeps({ gateway: gw }));
  const stale = signInitDataAt(77, Math.floor(Date.now() / 1000) - 3601);
  const res = makeRes();
  await rider.postBind(makeReq({ body: { initData: stale, phone: '0912345678' } }), res);
  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(gw.bindCalls.length, 0, '过期 initData 不得触达网关');
});

test('同一对 (TG, 骑手) 重绑 = 幂等成功：两次均 302，网关收到相同参数（冲突判定在 PHP）', async () => {
  const gw = makeGateway();
  const rider = createRiderRoute(makeDeps({ gateway: gw }));
  const initData = signInitData(77);
  for (let i = 0; i < 2; i++) {
    const res = makeRes();
    await rider.postBind(makeReq({ body: { initData, phone: '0912345678' } }), res);
    assert.strictEqual(res.statusCode, 302, `第 ${i + 1} 次绑定也应成功重定向（同对幂等）`);
    assert.strictEqual(res.redirectUrl, WORKBENCH_URL);
  }
  assert.strictEqual(gw.bindCalls.length, 2);
  assert.deepStrictEqual(gw.bindCalls[0], gw.bindCalls[1]);
});

test('换手机号重绑：Node 不拦（是换绑还是冲突由 PHP 判，跨骑手必然 409）', async () => {
  const gw = makeGateway({
    bindScript: (p) => (p.phone === '0987654321'
      ? { state: 409, info: { code: 'TG_ALREADY_BOUND' } }
      : { state: 100, info: { courier_id: 9 } }),
  });
  const rider = createRiderRoute(makeDeps({ gateway: gw }));
  const r1 = makeRes();
  await rider.postBind(makeReq({ body: { initData: signInitData(77), phone: '0912345678' } }), r1);
  assert.strictEqual(r1.statusCode, 302);
  const r2 = makeRes();
  await rider.postBind(makeReq({ body: { initData: signInitData(77), phone: '0987654321' } }), r2);
  assert.strictEqual(r2.statusCode, 409, '已绑其他骑手的 TG 换号必须被 PHP 拦成 409');
  assert.strictEqual(gw.bindCalls[1].phone, '0987654321');
});

// ---- 补充边界：session 异常分支 ----

test('session：DB 查询异常 → 502 JSON RIDER_FAILED，不泄漏 SQL', async () => {
  const rider = createRiderRoute(makeDeps({
    conn: { query: async () => { throw new Error('db boom: SELECT ... secret'); } },
  }));
  const res = makeRes();
  await rider.session(makeReq({ body: { initData: signInitData(77) } }), res);
  assert.strictEqual(res.statusCode, 502);
  assert.strictEqual(res.jsonBody.error.code, 'RIDER_FAILED');
  assert.ok(!res.body.includes('boom: SELECT'), '错误详情不得回显给客户端');
});

test('session：完全不带 initData → 401', async () => {
  const rider = createRiderRoute(makeDeps());
  const res = makeRes();
  await rider.session(makeReq({ body: {} }), res);
  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(res.jsonBody.error.code, 'INVALID_INIT_DATA');
});

// ---- 源码约束 ----

test('源码约束：bind 路径 SQL 不允许拼接 phone（phone 只走网关，不进 fbs_courier_map 查询）', () => {
  const src = require('node:fs').readFileSync(require('node:path').join(__dirname, '../src/riderRoute.js'), 'utf8');
  // session 里的唯一 SQL 只允许按 tg_user_id（数字化后的字符串）查询
  const sqls = src.match(/conn\.query\(([^)]+)\)/g) || [];
  assert.strictEqual(sqls.length, 1, 'riderRoute 只允许一条 SQL（session 查绑定）');
  assert.ok(sqls[0].includes('tg_user_id'), sqls[0]);
  assert.ok(!sqls[0].includes('phone'), 'phone 不得进 SQL');
});

// ---- /rider/session ----

test('session：已绑定 → {bound:true, courier_id, url}；未绑定 → {bound:false}', async () => {
  const gw = makeGateway();
  const bound = createRiderRoute(makeDeps({
    gateway: gw,
    conn: makeConn({ rows: { [SESSION_SQL_77]: '9\n' } }),
  }));
  const resBound = makeRes();
  await bound.session(makeReq({ body: { initData: signInitData(77) } }), resBound);
  assert.strictEqual(resBound.statusCode, 200);
  assert.deepStrictEqual(resBound.jsonBody, { success: true, data: { bound: true, courier_id: 9, url: WORKBENCH_URL } });
  assert.strictEqual(gw.qlCalls[0].courier_id, 9);

  const resUnbound = makeRes();
  await bound.session(makeReq({ body: { initData: signInitData(88) } }), resUnbound);
  assert.deepStrictEqual(resUnbound.jsonBody, { success: true, data: { bound: false } });
});

test('m5：session 只认 POST body.initData，query 传参一律忽略（401）', async () => {
  const rider = createRiderRoute(makeDeps({
    conn: makeConn({ rows: { [SESSION_SQL_77]: '9\n' } }),
  }));
  const resQuery = makeRes();
  await rider.session(makeReq({ query: { initData: signInitData(77) } }), resQuery);
  assert.strictEqual(resQuery.statusCode, 401, 'initData 是短期凭证，不允许进 URL/访问日志');
  assert.strictEqual(resQuery.jsonBody.error.code, 'INVALID_INIT_DATA');

  const res401 = makeRes();
  await rider.session(makeReq({ body: { initData: 'forged' } }), res401);
  assert.strictEqual(res401.statusCode, 401);
});

test('m5：session 响应带 Cache-Control: no-store（含失败分支）', async () => {
  const rider = createRiderRoute(makeDeps({ conn: makeConn({ rows: { [SESSION_SQL_77]: '9\n' } }) }));
  const ok = makeRes();
  await rider.session(makeReq({ body: { initData: signInitData(77) } }), ok);
  assert.strictEqual(ok.statusCode, 200);
  assert.strictEqual(ok.headers['cache-control'], 'no-store');

  const bad = makeRes();
  await rider.session(makeReq({ body: { initData: 'forged' } }), bad);
  assert.strictEqual(bad.headers['cache-control'], 'no-store');
});

test('m4：session 的 tg_user_id 走数字化拼接（只可能出现数字），源码不用字符串引号包裹', () => {
  const src = require('node:fs').readFileSync(require('node:path').join(__dirname, '../src/riderRoute.js'), 'utf8');
  assert.ok(!/tg_user_id = '\$\{/.test(src), 'tg_user_id 不得用字符串引号拼接');
  assert.match(src, /tg_user_id = \$\{tgId\}/);
});

test('session：rider_ql 失败 → 502 JSON，无 URL 泄漏', async () => {
  const rider = createRiderRoute(makeDeps({
    gateway: makeGateway({ qlScript: { state: 200, info: '骑手不存在或状态不可用' } }),
    conn: makeConn({ rows: { [SESSION_SQL_77]: '9\n' } }),
  }));
  const res = makeRes();
  await rider.session(makeReq({ body: { initData: signInitData(77) } }), res);
  assert.strictEqual(res.statusCode, 502);
  assert.ok(!res.body.includes('ql.html'));
});
