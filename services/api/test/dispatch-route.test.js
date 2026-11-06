'use strict';
// T7 派单通知测试（照 bridge-route.test.js 风格：依赖注入 + 最小 req/res stub，
// 不发真实网络请求、不使用真实密钥/token）。
// 修复轮 2 · M3 起本端点「收下即返回」：HTTP 202 只代表已受理，投递在响应之后异步进行，
// 因此断言投递结果一律先 await route.drain()。
const test = require('node:test');
const assert = require('node:assert');
const crypto = require('node:crypto');
const { createDispatchRoute, EVENTS } = require('../src/dispatchRoute');

const SECRET = 'test-gateway-secret-0123456789abcdef';
const BOT_TOKEN = 'test-bot-token-not-a-secret';
const TG_USER = 555000111;
const QL_URL = 'https://canary.fbird.men/ql.html?token=FAKE';

// 与 gatewayClient.js sign() 同算法（action 常量 'dispatch'）
function signPayload(body, ts, secret = SECRET) {
  return crypto.createHmac('sha256', secret).update(`${ts}\ndispatch\n${body}`).digest('hex');
}

function makeReq(body, { ts = String(Math.floor(Date.now() / 1000)), secret = SECRET } = {}) {
  const raw = JSON.stringify(body);
  return {
    body,
    rawBody: Buffer.from(raw),
    get: (name) => {
      const h = String(name).toLowerCase();
      if (h === 'x-fbs-timestamp') return ts;
      if (h === 'x-fbs-signature') return signPayload(raw, ts, secret);
      return undefined;
    },
  };
}

function makeRes() {
  return {
    statusCode: 200,
    jsonBody: null,
    status(code) { this.statusCode = code; return this; },
    json(b) { this.jsonBody = b; return this; },
  };
}

// 模拟 fbs_dispatch_dedup：内存 Set 存 (event, order_id, courier_id)，INSERT 撞唯一键抛 duplicate
function makeConn({ courierBound = true, failCourierLookup = false, failDedupInsert = null } = {}) {
  const dedupRows = new Set();
  const calls = [];
  return {
    dedupRows, calls,
    async query(sql) {
      calls.push(sql);
      let m;
      if (sql.startsWith('INSERT INTO fbs_dispatch_dedup')) {
        if (failDedupInsert) throw new Error(failDedupInsert);
        m = sql.match(/VALUES \('(\w+)', (\d+), (\d+)\)/);
        const key = `${m[1]}:${m[2]}:${m[3]}`;
        if (dedupRows.has(key)) throw new Error(`Duplicate entry '${key}' for key 'PRIMARY'`);
        dedupRows.add(key);
        return '';
      }
      if (sql.startsWith('DELETE FROM fbs_dispatch_dedup WHERE event')) {
        m = sql.match(/event = '(\w+)' AND order_id = (\d+) AND courier_id = (\d+)/);
        dedupRows.delete(`${m[1]}:${m[2]}:${m[3]}`);
        return '';
      }
      if (sql.startsWith('DELETE FROM fbs_dispatch_dedup WHERE created_at')) return '';
      if (sql.startsWith('SELECT tg_user_id FROM fbs_courier_map')) {
        if (failCourierLookup) throw new Error('courier_map boom');
        return courierBound ? `${TG_USER}\n` : '';
      }
      return '';
    },
  };
}

function makeRoute(overrides = {}) {
  const sent = [];
  const waits = [];
  const deps = {
    secret: SECRET,
    botToken: BOT_TOKEN,
    conn: makeConn(),
    gateway: { async riderNotifyUrl() { return { success: true, data: { url: QL_URL } }; } },
    sendMessage: async (payload) => { sent.push(payload); },
    wait: async (ms) => { waits.push(ms); },
    ...overrides,
  };
  return { route: createDispatchRoute(deps), deps, sent, waits };
}

const OK_BODY = () => ({ event: 'new_order', order_id: 1001, courier_id: 9 });
const OK_REQ = () => makeReq(OK_BODY());

async function captureErrors(fn) {
  const captured = [];
  const orig = console.error;
  const origWarn = console.warn;
  console.error = (...a) => captured.push(a.map(String).join(' '));
  console.warn = (...a) => captured.push(a.map(String).join(' '));
  try { await fn(); } finally { console.error = orig; console.warn = origWarn; }
  return captured.join('\n');
}

// ---- 验签 ----

test('缺失/过期时间戳或错误签名 → 401，不占去重位、不发送', async () => {
  for (const [label, req] of [
    ['无头', { body: { event: 'new_order', order_id: 1, courier_id: 1 }, rawBody: '{}', get: () => undefined }],
    ['过期时间戳', makeReq({ event: 'new_order', order_id: 1, courier_id: 1 }, { ts: String(Math.floor(Date.now() / 1000) - 120) })],
    ['错误密钥', makeReq({ event: 'new_order', order_id: 1, courier_id: 1 }, { secret: 'wrong-secret-0123456789abcdef' })],
  ]) {
    const conn = makeConn();
    const { route, sent } = makeRoute({ conn });
    const res = makeRes();
    await route.postDispatch(req, res);
    await route.drain();
    assert.strictEqual(res.statusCode, 401, label);
    assert.strictEqual(res.jsonBody.error.code, 'BAD_SIGNATURE', label);
    assert.strictEqual(sent.length, 0, label);
    assert.strictEqual(conn.dedupRows.size, 0, label);
  }
});

test('时间戳格式非法（非数字/负数/小数/空）→ 401 BAD_SIGNATURE', async () => {
  for (const ts of ['abc', '-1', '12.5', '']) {
    const { route, sent } = makeRoute();
    const res = makeRes();
    await route.postDispatch(makeReq({ event: 'new_order', order_id: 1, courier_id: 1 }, { ts }), res);
    await route.drain();
    assert.strictEqual(res.statusCode, 401, `ts=${ts}`);
    assert.strictEqual(sent.length, 0, `ts=${ts}`);
  }
});

// ---- 参数校验 ----

test('m2：非法事件 → 400，文案由 EVENTS 生成（四种事件全列出）', async () => {
  const { route, sent } = makeRoute();
  const res = makeRes();
  await route.postDispatch(makeReq({ event: 'evil', order_id: 1, courier_id: 1 }), res);
  await route.drain();
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.jsonBody.error.code, 'INVALID_EVENT');
  for (const e of EVENTS) assert.ok(res.jsonBody.error.message.includes(e), `文案缺 ${e}`);
  assert.strictEqual(sent.length, 0);
});

test('非法参数（0 / 负数 / 非数字）→ 400 INVALID_PARAM', async () => {
  for (const body of [
    { event: 'new_order', order_id: 0, courier_id: 1 },
    { event: 'new_order', order_id: 1, courier_id: -1 },
    { event: 'new_order', order_id: 'abc', courier_id: 1 },
  ]) {
    const { route, sent } = makeRoute();
    const res = makeRes();
    await route.postDispatch(makeReq(body), res);
    await route.drain();
    assert.strictEqual(res.statusCode, 400, JSON.stringify(body));
    assert.strictEqual(res.jsonBody.error.code, 'INVALID_PARAM');
    assert.strictEqual(sent.length, 0);
  }
});

// ---- M3：收下即返回 ----

test('M3：sendMessage 还挂着时 HTTP 已经是 202 accepted:true（不阻塞派单路径）', async () => {
  let release;
  const gate = new Promise((r) => { release = r; });
  const { route, sent } = makeRoute({ sendMessage: async (p) => { sent.push(p); await gate; } });
  const res = makeRes();
  // 这一行能返回本身就是证明：若 postDispatch 还同步等 sendMessage，gate 未放行就会挂死
  await route.postDispatch(OK_REQ(), res);
  assert.strictEqual(res.statusCode, 202, '必须在发送前就返回');
  assert.deepStrictEqual(res.jsonBody, { success: true, accepted: true, dedup: false });
  for (let i = 0; i < 10 && sent.length === 0; i++) await new Promise((r) => setImmediate(r));
  assert.strictEqual(sent.length, 1, '响应返回后投递应已启动');
  release();
  await route.drain();
});

test('M3：响应前已写入去重占位（并发副本/重复触发在响应那一刻就被挡住）', async () => {
  const conn = makeConn();
  const { route } = makeRoute({ conn });
  let rowsAtResponse = null;
  const res = {
    statusCode: 200,
    jsonBody: null,
    status(code) { this.statusCode = code; return this; },
    json(b) { rowsAtResponse = new Set(conn.dedupRows); this.jsonBody = b; return this; },
  };
  await route.postDispatch(OK_REQ(), res);
  assert.strictEqual(res.statusCode, 202);
  assert.ok(rowsAtResponse.has('new_order:1001:9'), '响应时去重占位必须已写入');
  await route.drain();
});

// ---- 成功路径 ----

test('成功路径：查绑定 → rider_notify_url → sendMessage 带「查看订单」按钮', async () => {
  const gwCalls = [];
  const { route, sent } = makeRoute({
    gateway: { async riderNotifyUrl(p) { gwCalls.push(p); return { success: true, data: { url: QL_URL } }; } },
  });
  const res = makeRes();
  await route.postDispatch(OK_REQ(), res);
  await route.drain();
  assert.strictEqual(res.statusCode, 202);
  assert.deepStrictEqual(gwCalls[0], { order_id: 1001, courier_id: 9 });
  assert.strictEqual(sent.length, 1);
  assert.strictEqual(sent[0].chat_id, TG_USER);
  assert.match(sent[0].text, /新的配送订单/);
  assert.strictEqual(sent[0].reply_markup.inline_keyboard[0][0].text, '查看订单');
  assert.strictEqual(sent[0].reply_markup.inline_keyboard[0][0].url, QL_URL);
});

test('四种事件文案区分', async () => {
  for (const [event, pattern] of [
    ['new_order', /新的配送订单/],
    ['grab', /抢单成功/],
    ['reassign', /改派给您/],
    ['reclaim', /已被客服收回/],
  ]) {
    const { route, sent } = makeRoute();
    const res = makeRes();
    await route.postDispatch(makeReq({ event, order_id: 7, courier_id: 9 }), res);
    await route.drain();
    assert.strictEqual(res.statusCode, 202, event);
    assert.match(sent[0].text, pattern, event);
  }
});

test('reclaim（订单被客服收回）→ 不带按钮、不调 rider_notify_url，文案为「无需继续配送」', async () => {
  const gwCalls = [];
  const { route, sent } = makeRoute({
    gateway: { async riderNotifyUrl(p) { gwCalls.push(p); return { success: true, data: { url: QL_URL } }; } },
  });
  const res = makeRes();
  await route.postDispatch(makeReq({ event: 'reclaim', order_id: 1001, courier_id: 9 }), res);
  await route.drain();
  assert.strictEqual(res.statusCode, 202);
  assert.strictEqual(sent.length, 1);
  assert.strictEqual(sent[0].reply_markup, undefined, '被摘单通知不得带查看订单按钮');
  assert.match(sent[0].text, /无需继续配送/);
  assert.strictEqual(gwCalls.length, 0, 'reclaim 不应生成详情直达 URL');
});

test('网关 rider_notify_url 失败 → 降级发纯文本（无按钮），仍投递', async () => {
  const { route, sent } = makeRoute({ gateway: { async riderNotifyUrl() { throw new Error('gateway boom'); } } });
  const res = makeRes();
  await route.postDispatch(OK_REQ(), res);
  await route.drain();
  assert.strictEqual(res.statusCode, 202);
  assert.strictEqual(sent.length, 1);
  assert.strictEqual(sent[0].reply_markup, undefined);
});

test('rider_notify_url 失败/异常包络 → 降级纯文本，URL 不进消息（canary 新契约）', async () => {
  // gatewayClient 对非 2xx 统一 reject（GATEWAY_HTTP_ERROR + status + payload）
  const httpReject = () => {
    const e = new Error('网关返回 HTTP 404');
    e.code = 'GATEWAY_HTTP_ERROR';
    e.status = 404;
    e.payload = { success: false, error: { code: 'COURIER_NOT_FOUND', message: 'courier not found' } };
    return e;
  };
  for (const [label, gw] of [
    ['reject（非 2xx）', { async riderNotifyUrl() { throw httpReject(); } }],
    ['2xx 但 success:false', { async riderNotifyUrl() { return { success: false, error: { code: 'INTERNAL_ERROR', message: 'boom' } }; } }],
    ['2xx 但 data 缺 url', { async riderNotifyUrl() { return { success: true, data: {} }; } }],
    ['url 非 https', { async riderNotifyUrl() { return { success: true, data: { url: 'http://evil.example/ql' } }; } }],
  ]) {
    const { route, sent } = makeRoute({ gateway: gw });
    const res = makeRes();
    await route.postDispatch(OK_REQ(), res);
    await route.drain();
    assert.strictEqual(res.statusCode, 202, label);
    assert.strictEqual(sent.length, 1, label);
    assert.strictEqual(sent[0].reply_markup, undefined, label);
    assert.ok(!sent[0].text.includes('evil.example'), label);
  }
});

// ---- 异步失败语义（M3）：只记日志 + 释放占位 ----

test('M2/M3：骑手未绑定 → 202 但静默不发；日志带 event/order_id/courier_id 可按单号 grep，占位已释放', async () => {
  const conn = makeConn({ courierBound: false });
  const { route, sent } = makeRoute({ conn });
  const res = makeRes();
  const logs = await captureErrors(async () => {
    await route.postDispatch(OK_REQ(), res);
    await route.drain();
  });
  assert.strictEqual(res.statusCode, 202);
  assert.strictEqual(sent.length, 0);
  assert.match(logs, /not bound/);
  assert.match(logs, /event=new_order/);
  assert.match(logs, /order_id=1001/);
  assert.match(logs, /courier_id=9/);
  assert.strictEqual(conn.dedupRows.size, 0, '未发送必须释放占位，允许下次重发');
});

test('M3：courier_map 查询异常 → 不发送、释放占位、日志可定位', async () => {
  const conn = makeConn({ failCourierLookup: true });
  const { route, sent } = makeRoute({ conn });
  const res = makeRes();
  const logs = await captureErrors(async () => {
    await route.postDispatch(OK_REQ(), res);
    await route.drain();
  });
  assert.strictEqual(res.statusCode, 202);
  assert.strictEqual(sent.length, 0);
  assert.match(logs, /courier_map lookup failed/);
  assert.match(logs, /order_id=1001/);
  assert.strictEqual(conn.dedupRows.size, 0);
});

test('M3：发送两次都失败 → 释放占位（允许后续重发），日志含响应原文片段与订单上下文', async () => {
  let n = 0;
  const conn = makeConn();
  const { route, waits } = makeRoute({
    conn,
    sendMessage: async () => {
      n += 1;
      const e = new Error(`telegram HTTP 500`);
      e.httpStatus = 500;
      e.snippet = '{"ok":false,"description":"Internal Server Error"}';
      throw e;
    },
  });
  const res = makeRes();
  const logs = await captureErrors(async () => {
    await route.postDispatch(OK_REQ(), res);
    await route.drain();
  });
  assert.strictEqual(res.statusCode, 202, '投递失败不影响已返回的 202');
  assert.strictEqual(n, 2, '必须恰好重试一次');
  assert.strictEqual(waits.length, 1);
  assert.match(logs, /sendMessage failed twice/);
  assert.match(logs, /order_id=1001/);
  assert.match(logs, /Internal Server Error/);
  assert.strictEqual(conn.dedupRows.size, 0, '最终失败必须释放占位');
});

test('m9：429 带 retry_after → 按其值退避（秒级，上限 5s）而非固定 1s', async () => {
  let n = 0;
  const { route, waits, sent } = makeRoute({
    sendMessage: async (p) => {
      n += 1;
      if (n === 1) { const e = new Error('telegram HTTP 429'); e.httpStatus = 429; e.retryAfter = 3; throw e; }
      sent.push(p);
    },
  });
  await route.postDispatch(OK_REQ(), makeRes());
  await route.drain();
  assert.deepStrictEqual(waits, [3000], 'retry_after=3 应等 3000ms');
  assert.strictEqual(sent.length, 1, '退避后重试成功');

  const huge = makeRoute({
    sendMessage: async () => { const e = new Error('telegram HTTP 429'); e.retryAfter = 999; throw e; },
  });
  await huge.route.postDispatch(makeReq({ event: 'grab', order_id: 2, courier_id: 9 }), makeRes());
  await huge.route.drain();
  assert.deepStrictEqual(huge.waits, [5000], 'retry_after 过大要截到上限 5s');
});

test('发送首次失败重试成功 → 占位保留，同键再来命中 dedup（不重复打扰骑手）', async () => {
  let n = 0;
  const conn = makeConn();
  const { route, sent } = makeRoute({
    conn,
    sendMessage: async (p) => { n += 1; if (n === 1) throw new Error('telegram HTTP 500'); sent.push(p); },
  });
  const r1 = makeRes();
  await route.postDispatch(OK_REQ(), r1);
  await route.drain();
  assert.strictEqual(r1.statusCode, 202);
  assert.strictEqual(n, 2, '首次失败后必须重试');
  assert.ok(conn.dedupRows.has('new_order:1001:9'), '成功后占位必须保留');

  const r2 = makeRes();
  await route.postDispatch(OK_REQ(), r2);
  await route.drain();
  assert.strictEqual(r2.statusCode, 202);
  assert.strictEqual(r2.jsonBody.dedup, true);
  assert.strictEqual(n, 2, '第二次不得再发');
});

// ---- 去重 ----

test('去重：同键第二次 → 202 dedup:true，不重发', async () => {
  const conn = makeConn();
  const { route, sent } = makeRoute({ conn });
  const r1 = makeRes();
  await route.postDispatch(OK_REQ(), r1);
  await route.drain();
  assert.strictEqual(r1.jsonBody.dedup, false);
  const r2 = makeRes();
  await route.postDispatch(OK_REQ(), r2);
  await route.drain();
  assert.strictEqual(r2.statusCode, 202);
  assert.strictEqual(r2.jsonBody.dedup, true);
  assert.strictEqual(sent.length, 1, '第二次不得重发');
});

test('去重按三元组：同单不同事件（new_order 后 grab）→ 两次都发', async () => {
  const conn = makeConn();
  const { route, sent } = makeRoute({ conn });
  await route.postDispatch(makeReq({ event: 'new_order', order_id: 1001, courier_id: 9 }), makeRes());
  await route.postDispatch(makeReq({ event: 'grab', order_id: 1001, courier_id: 9 }), makeRes());
  await route.drain();
  assert.strictEqual(sent.length, 2);
  assert.match(sent[0].text, /新的配送订单/);
  assert.match(sent[1].text, /抢单成功/);
});

test('去重按三元组：同单改派给第二位骑手 → 第二位也收到通知（P2-2 修复的 bug）', async () => {
  const conn = makeConn();
  const { route, sent } = makeRoute({ conn });
  const r1 = makeRes();
  await route.postDispatch(makeReq({ event: 'reassign', order_id: 1001, courier_id: 9 }), r1);
  const r2 = makeRes();
  await route.postDispatch(makeReq({ event: 'reassign', order_id: 1001, courier_id: 10 }), r2);
  await route.drain();
  assert.strictEqual(r1.jsonBody.dedup, false);
  assert.strictEqual(r2.jsonBody.dedup, false, '换骑手的改派不得被同单去重吞掉');
  assert.strictEqual(sent.length, 2);
  assert.ok(conn.dedupRows.has('reassign:1001:9'));
  assert.ok(conn.dedupRows.has('reassign:1001:10'));
});

test('去重占位写库异常（非 duplicate）→ 不阻断投递（宁可重发不可漏发），日志有上下文', async () => {
  const conn = makeConn({ failDedupInsert: 'db boom: cannot connect' });
  const { route, sent } = makeRoute({ conn });
  const res = makeRes();
  const logs = await captureErrors(async () => {
    await route.postDispatch(OK_REQ(), res);
    await route.drain();
  });
  assert.strictEqual(res.statusCode, 202);
  assert.strictEqual(res.jsonBody.dedup, false);
  assert.strictEqual(sent.length, 1);
  assert.match(logs, /dedup claim failed/);
  assert.match(logs, /order_id=1001/);
});

// ---- 日志卫生 ----

test('失败路径日志不含密钥与签名', async () => {
  const logs = await captureErrors(async () => {
    const { route } = makeRoute({ sendMessage: async () => { throw new Error('boom'); } });
    await route.postDispatch(OK_REQ(), makeRes());
    await route.drain();
  });
  assert.ok(!logs.includes(SECRET), '日志不得含密钥');
  assert.ok(!/x-fbs-signature/i.test(logs), '日志不得含签名');
});

// ---- 配置缺失 ----

test('配置缺失（secret/botToken/conn 空）→ 503 DISPATCH_NOT_CONFIGURED', async () => {
  const res = makeRes();
  await createDispatchRoute({ secret: '', botToken: '', conn: null }).postDispatch(OK_REQ(), res);
  assert.strictEqual(res.statusCode, 503);
  assert.strictEqual(res.jsonBody.error.code, 'DISPATCH_NOT_CONFIGURED');
});

// ---- 修复轮 2 补测：reclaim/reassign 配对矩阵、reclaim 未绑定释放占位、429 重试再失败 ----

// 每个骑手各自的 TG 绑定（原骑手 9 → TG_OLD，新骑手 10 → TG_NEW），用于验证「改派」两侧通知分开投递
function makePerCourierConn(map = { 9: TG_USER, 10: 555000222 }) {
  const dedupRows = new Set();
  const calls = [];
  return {
    dedupRows, calls,
    async query(sql) {
      calls.push(sql);
      let m;
      if (sql.startsWith('INSERT INTO fbs_dispatch_dedup')) {
        m = sql.match(/VALUES \('(\w+)', (\d+), (\d+)\)/);
        const key = `${m[1]}:${m[2]}:${m[3]}`;
        if (dedupRows.has(key)) throw new Error(`Duplicate entry '${key}' for key 'PRIMARY'`);
        dedupRows.add(key);
        return '';
      }
      if (sql.startsWith('DELETE FROM fbs_dispatch_dedup WHERE event')) {
        m = sql.match(/event = '(\w+)' AND order_id = (\d+) AND courier_id = (\d+)/);
        dedupRows.delete(`${m[1]}:${m[2]}:${m[3]}`);
        return '';
      }
      if (sql.startsWith('DELETE FROM fbs_dispatch_dedup WHERE created_at')) return '';
      if (sql.startsWith('SELECT tg_user_id FROM fbs_courier_map')) {
        m = sql.match(/courier_id = (\d+)/);
        const tg = map[m[1]];
        return tg ? `${tg}\n` : '';
      }
      return '';
    },
  };
}

test('reclaim 矩阵：同单改派 —— 原骑手收 reclaim（无按钮），新骑手收 reassign（带按钮）', async () => {
  const conn = makePerCourierConn({ 9: TG_USER, 10: 555000222 });
  const gwCalls = [];
  const { route, sent } = makeRoute({
    conn,
    gateway: { async riderNotifyUrl(p) { gwCalls.push(p); return { success: true, data: { url: QL_URL } }; } },
  });

  // ① 原骑手 9：订单被收回，只收到「无需继续配送」，不带查看订单按钮
  await route.postDispatch(makeReq({ event: 'reclaim', order_id: 1001, courier_id: 9 }), makeRes());
  await route.drain();
  assert.strictEqual(sent.length, 1);
  assert.strictEqual(sent[0].chat_id, TG_USER, 'reclaim 必须发给原骑手');
  assert.match(sent[0].text, /已被客服收回/);
  assert.strictEqual(sent[0].reply_markup, undefined, '原骑手已无该单，不得带查看订单按钮');

  // ② 新骑手 10：同一订单改派过来，收到带按钮的 reassign
  await route.postDispatch(makeReq({ event: 'reassign', order_id: 1001, courier_id: 10 }), makeRes());
  await route.drain();
  assert.strictEqual(sent.length, 2);
  assert.strictEqual(sent[1].chat_id, 555000222, 'reassign 必须发给新骑手');
  assert.match(sent[1].text, /改派给您/);
  assert.strictEqual(sent[1].reply_markup.inline_keyboard[0][0].text, '查看订单');
  assert.strictEqual(sent[1].reply_markup.inline_keyboard[0][0].url, QL_URL);

  // 两条通知各自独立占坑；只有 reassign 换 URL（reclaim 不该为已收回的单签直达 URL）
  assert.deepStrictEqual(gwCalls, [{ order_id: 1001, courier_id: 10 }]);
  assert.ok(conn.dedupRows.has('reclaim:1001:9'));
  assert.ok(conn.dedupRows.has('reassign:1001:10'));
});

test('reclaim 给未绑定骑手 → 202 静默不发并释放占位（不让 reclaim 被永久吞掉）', async () => {
  const conn = makeConn({ courierBound: false });
  const { route, sent } = makeRoute({ conn });
  const res = makeRes();
  const logs = await captureErrors(async () => {
    await route.postDispatch(makeReq({ event: 'reclaim', order_id: 1001, courier_id: 9 }), res);
    await route.drain();
  });
  assert.strictEqual(res.statusCode, 202);
  assert.strictEqual(sent.length, 0);
  assert.match(logs, /event=reclaim/);
  assert.strictEqual(conn.dedupRows.size, 0, '未投递必须释放占位');
});

test('429 退避后第二次仍 429 → 释放占位（允许 TTL 内同键重发），退避按 retry_after', async () => {
  let n = 0;
  const conn = makeConn();
  const { route, waits } = makeRoute({
    conn,
    sendMessage: async () => {
      n += 1;
      const e = new Error('telegram HTTP 429');
      e.httpStatus = 429;
      e.retryAfter = 2;
      e.snippet = '{"ok":false,"description":"Too Many Requests","parameters":{"retry_after":2}}';
      throw e;
    },
  });
  const res = makeRes();
  const logs = await captureErrors(async () => {
    await route.postDispatch(OK_REQ(), res);
    await route.drain();
  });
  assert.strictEqual(res.statusCode, 202, '已返回的 202 不因异步失败改变');
  assert.strictEqual(n, 2, '429 也必须重试一次');
  assert.deepStrictEqual(waits, [2000], '退避取 retry_after=2s');
  assert.match(logs, /sendMessage failed twice/);
  assert.match(logs, /Too Many Requests/);
  assert.strictEqual(conn.dedupRows.size, 0, '两次都失败必须释放占位');
});

// ---- 源码约束 ----

test('源码约束：EVENTS 四种事件；去重键三元组；禁用 courier_pushed；响应先于发送', () => {
  const src = require('node:fs').readFileSync(require('node:path').join(__dirname, '../src/dispatchRoute.js'), 'utf8');
  assert.match(src, /\['new_order', 'grab', 'reassign', 'reclaim'\]/);
  assert.ok(!src.includes('courier_pushed'), '禁止使用被 App 推送占用的 courier_pushed 字段做去重');
  const iRes = src.indexOf('res.status(202)');
  const iTrack = src.indexOf('track(deliver(');
  assert.ok(iRes > 0 && iTrack > iRes, '必须先回 202 再启动投递（M3 收下即返回）');
});

// N3：SIGTERM 优雅退出接线（发版时在飞通知不被杀死、去重位不留 1 天孤位）
test('源码约束（N3）：server.js 注册 SIGTERM → drain（8s 上限）→ close 退出', () => {
  const src = require('node:fs').readFileSync(require('node:path').join(__dirname, '../src/server.js'), 'utf8');
  assert.match(src, /process\.on\('SIGTERM'/, '必须注册 SIGTERM 处理');
  assert.match(src, /dispatch\.drain\(\)/, '退出前必须排空在飞投递任务');
  assert.match(src, /SIGTERM_DRAIN_MS = 8000/, 'drain 必须有 8s 上限（给 terminationGracePeriod 留余量）');
  assert.match(src, /httpServer\.close/, 'drain 后必须关闭 HTTP 监听再退出');
});
