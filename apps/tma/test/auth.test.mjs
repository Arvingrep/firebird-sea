import test from 'node:test';
import assert from 'node:assert';
import { createAuthClient, AuthError } from '../src/auth.js';

const ok = (data) => ({ ok: true, status: 200, json: async () => ({ success: true, data }) });
const status = (code, body = {}) => ({ ok: code < 400, status: code, json: async () => body });

test('启动登录并带 Bearer 令牌请求，令牌不落存储', async () => {
  const calls = [];
  const fetch = async (url, init) => {
    calls.push([url, init]);
    return url.endsWith('/auth/telegram') ? ok({ token: 'T1' }) : status(200, {});
  };
  const c = createAuthClient({ fetch, getInitData: () => 'init=1' });
  await c.request('/fb/ping');
  assert.strictEqual(calls[1][1].headers.Authorization, 'Bearer T1');
  assert.strictEqual(typeof globalThis.localStorage, 'undefined');
});

test('令牌过期：401 后用 initData 重新换取并重放一次', async () => {
  let n = 0;
  const seen = [];
  const fetch = async (url, init) => {
    if (url.endsWith('/auth/telegram')) { n += 1; return ok({ token: `T${n}` }); }
    seen.push(init.headers.Authorization);
    return seen.length === 1 ? status(401) : status(200, {});
  };
  const c = createAuthClient({ fetch, getInitData: () => 'init=1' });
  const res = await c.request('/fb/orders');
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(seen, ['Bearer T1', 'Bearer T2']);
});

test('重放后仍 401 不再循环', async () => {
  const fetch = async (url) => (url.endsWith('/auth/telegram') ? ok({ token: 'T' }) : status(401));
  const c = createAuthClient({ fetch, getInitData: () => 'init=1' });
  const res = await c.request('/fb/x');
  assert.strictEqual(res.status, 401);
});

test('initData 过期：提示重新打开 Mini App', async () => {
  const fetch = async () => status(401, { success: false });
  const c = createAuthClient({ fetch, getInitData: () => 'init=1' });
  await assert.rejects(() => c.login(), (e) => e instanceof AuthError && e.code === 'INIT_DATA_EXPIRED');
});

test('缺少 initData（非 Telegram 内打开）直接报错', async () => {
  const c = createAuthClient({ fetch: async () => { throw new Error('no call'); }, getInitData: () => '' });
  await assert.rejects(() => c.login(), (e) => e.code === 'INIT_DATA_MISSING');
});

test('并发请求共享同一次登录', async () => {
  let logins = 0;
  const fetch = async (url) => {
    if (url.endsWith('/auth/telegram')) { logins += 1; await new Promise((r) => setTimeout(r, 10)); return ok({ token: 'T' }); }
    return status(200, {});
  };
  const c = createAuthClient({ fetch, getInitData: () => 'init=1' });
  await Promise.all([c.request('/a'), c.request('/b'), c.request('/c')]);
  assert.strictEqual(logins, 1);
});
