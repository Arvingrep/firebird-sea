import test from 'node:test';
import assert from 'node:assert';
import { createFbClient, FbError } from '../src/lib/fbClient.js';

const res = (status, body) => ({ ok: status < 400, status, json: async () => body });

function make(over = {}) {
  const calls = [];
  const authClient = { async request(path, init) { calls.push({ path, init }); return over.auth ? over.auth(path, init) : res(200, { state: 100, info: { ok: 1 } }); } };
  const anonymousFetch = async (url) => { calls.push({ path: url }); return over.anon ? over.anon(url) : res(200, { state: 100, info: [1, 2] }); };
  return { fb: createFbClient({ authClient, anonymousFetch }), calls };
}

test('匿名读：拼 service/action 并追加 platform_name=tma，返回 info', async () => {
  const { fb, calls } = make();
  const info = await fb.get('waimai', 'shopList', { page: 1, pageSize: 10, skip: undefined }, { anonymous: true });
  assert.deepStrictEqual(info, [1, 2]);
  const u = new URL(calls[0].path, 'http://x');
  assert.strictEqual(u.pathname, '/tg-api/fb/waimai/shopList');
  assert.strictEqual(u.searchParams.get('platform_name'), 'tma');
  assert.strictEqual(u.searchParams.get('page'), '1');
  assert.strictEqual(u.searchParams.has('skip'), false);
});

test('火鸟 state != 100 抛 FbError 并携带信息', async () => {
  const { fb } = make({ anon: () => res(200, { state: 101, info: '请求错误，请重试！' }) });
  await assert.rejects(() => fb.get('waimai', 'food', {}, { anonymous: true }), (e) => e instanceof FbError && e.state === 101 && e.message === '请求错误，请重试！');
});

test('火鸟空数据惯例返回 null 而非抛错（真实响应 state=101）', async () => {
  // 线上实测：article/alist 空分类 → {state:101, info:"暂无数据！"}（handlers::getHandle 把 handler 的 200 归一成 101）
  const { fb } = make({ anon: () => res(200, { state: 101, info: '暂无数据！' }) });
  assert.strictEqual(await fb.get('article', 'alist', { typeid: 2 }, { anonymous: true }), null);
  // handler 直出的 200 形态同样兼容
  const { fb: fb2 } = make({ anon: () => res(200, { state: 200, info: '暂无数据！' }) });
  assert.strictEqual(await fb2.get('article', 'alist', { typeid: 3 }, { anonymous: true }), null);
  // 其他 101 文案仍抛出
  const { fb: fb3 } = make({ anon: () => res(200, { state: 101, info: '请先登录' }) });
  await assert.rejects(() => fb3.get('waimai', 'order', {}, { anonymous: true }), (e) => e instanceof FbError && e.state === 101);
});

test('403 / 429 / 409 映射为稳定错误码', async () => {
  for (const [status, code] of [[403, 'NOT_ALLOWED'], [429, 'RATE_LIMITED'], [409, 'IN_PROGRESS']]) {
    const { fb } = make({ anon: () => res(status, {}) });
    await assert.rejects(() => fb.get('a', 'b', {}, { anonymous: true }), (e) => e.code === code);
  }
});

test('写操作自动带 Idempotency-Key，并可复用同一键重试', async () => {
  const { fb, calls } = make();
  await fb.post('waimai', 'deal', { shop: 1 });
  const k1 = calls[0].init.headers['Idempotency-Key'];
  assert.match(k1, /^[A-Za-z0-9_-]{8,64}$/);
  await fb.post('waimai', 'deal', { shop: 1 }, { idempotencyKey: k1 });
  assert.strictEqual(calls[1].init.headers['Idempotency-Key'], k1);
  assert.strictEqual(calls[0].init.method, 'POST');
});

test('非 JSON 响应抛 BAD_RESPONSE', async () => {
  const { fb } = make({ anon: () => ({ ok: true, status: 200, json: async () => { throw new Error('x'); } }) });
  await assert.rejects(() => fb.get('a', 'b', {}, { anonymous: true }), (e) => e.code === 'BAD_RESPONSE');
});

// —— listRows：火鸟 handler 返回形状归一（getMemberAddress 裸数组 vs order/shopList 的 {list}）——
import { listRows } from '../src/lib/fbClient.js';

test('listRows：裸数组原样返回（getMemberAddress 形状）', () => {
  const rows = [{ id: '15', street: 'Ayala' }];
  assert.deepStrictEqual(listRows(rows), rows);
});

test('listRows：{list} 包装形状取 list（order/shopList/alist 形状）', () => {
  const rows = [{ id: '1' }];
  assert.deepStrictEqual(listRows({ pageInfo: {}, list: rows }), rows);
});

test('listRows：null/undefined/缺 list 的对象一律空数组', () => {
  assert.deepStrictEqual(listRows(null), []);
  assert.deepStrictEqual(listRows(undefined), []);
  assert.deepStrictEqual(listRows({}), []);
  assert.deepStrictEqual(listRows({ pageInfo: {} }), []);
});

test('listRows：上游空态文案「暂未添加地址」经 unwrap 归为 null 后落空数组', async () => {
  const { fb } = make({ auth: async () => res(200, { state: 101, info: '暂未添加地址' }) });
  const info = await fb.get('waimai', 'getMemberAddress', {});
  assert.strictEqual(info, null);
  assert.deepStrictEqual(listRows(info), []);
});

test('网关 102 "No data!"（handler 返回空值）归为 null 而非抛错', async () => {
  // handlers::getHandle 的兜底：handler 返回 ''/null/false/[] 时给 state=102。
  // 骑手还没上报轨迹的 getCourierLocation 就走这条。
  const { fb } = make({ auth: async () => res(200, { state: 102, info: 'No data!' }) });
  assert.strictEqual(await fb.get('waimai', 'getCourierLocation', { orderid: 1 }), null);
  // 其他 102 文案仍视为异常，避免把真实故障当空态吞掉
  const { fb: fb2 } = make({ auth: async () => res(200, { state: 102, info: 'db error' }) });
  await assert.rejects(() => fb2.get('waimai', 'getCourierLocation', { orderid: 1 }), (e) => e instanceof FbError && e.state === 102);
});

test('getCourierLocation 成功时 info 是裸字符串（"lng,lat;…"）', async () => {
  const { fb } = make({ auth: async () => res(200, { state: 100, info: '120.98,14.59;120.97,14.60' }) });
  const raw = await fb.get('waimai', 'getCourierLocation', { orderid: 7 });
  assert.strictEqual(raw, '120.98,14.59;120.97,14.60');
});
