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
  const { fb } = make({ anon: () => res(200, { state: 101, info: '没有数据' }) });
  await assert.rejects(() => fb.get('waimai', 'food', {}, { anonymous: true }), (e) => e instanceof FbError && e.state === 101 && e.message === '没有数据');
});

test('火鸟空数据惯例：state=200 + 暂无数据 返回 null 而非抛错', async () => {
  const { fb } = make({ anon: () => res(200, { state: 200, info: '暂无数据！' }) });
  const info = await fb.get('article', 'alist', { typeid: 2 }, { anonymous: true });
  assert.strictEqual(info, null);
  // 其他 state=200 错误仍抛出（如「格式错误」）
  const { fb: fb2 } = make({ anon: () => res(200, { state: 200, info: '格式错误！' }) });
  await assert.rejects(() => fb2.get('article', 'alist', {}, { anonymous: true }), (e) => e instanceof FbError && e.state === 200);
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
