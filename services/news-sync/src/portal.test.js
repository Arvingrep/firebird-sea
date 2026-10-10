const test = require('node:test');
const assert = require('node:assert');
const { makeCookiePublisher, classifyPutResponse } = require('./portal');

// 同源 fixture:与 webroot/api/handlers/{member.controller,article.class}.php 的真实返回一致
const FX = {
  loginOk: { state: 100, info: [] },
  loginBad: { state: 200, info: '用户名或密码错误' },
  putOk: { auth: '', aid: 123, amount: 0 },
  putExpired: { state: 200, info: '登录超时,请重新登录!' },
  putDbErr: { state: 101, info: '发布到数据时发生错误,请检查字段内容!' },
  putNoMedia: { state: 200, info: '您还没有入驻自媒体' },
  delOk: { state: 100, info: '删除成功!' },
  htmlLogin: '<!DOCTYPE html><html><form action="login"></form></html>'
};
const resp = (body, { cookie, status = 200 } = {}) => ({
  ok: status < 300,
  status,
  headers: { getSetCookie: () => (cookie ? [`PHPSESSID=${cookie}; path=/`] : []) },
  text: async () => (typeof body === 'string' ? body : JSON.stringify(body))
});
const mk = fetchImpl =>
  makeCookiePublisher({ baseUrl: 'https://demo.test', user: 'u', pass: 'p', cityid: 1, typeid: 2, fetchImpl });
const isLogin = u => u.includes('action=loginCheck');

test('登录成功取 Cookie 并发布,put 返回 aid 视为成功;凭据/Cookie 随表单传递', async () => {
  const reqs = [];
  const pub = mk(async (u, o) => {
    reqs.push({ u, o });
    return isLogin(u) ? resp(FX.loginOk, { cookie: 's1' }) : resp(FX.putOk);
  });
  assert.strictEqual(await pub({ title: 'T', url: 'https://e.com/1', summary: 'S' }, 'k1'), 123);
  assert.ok(isLogin(reqs[0].u));
  const put = reqs[1];
  assert.strictEqual(put.o.headers.Cookie, 'PHPSESSID=s1');
  const form = new URLSearchParams(put.o.body);
  assert.strictEqual(form.get('title'), 'T');
  assert.strictEqual(form.get('cityid'), '1');
  assert.ok(form.get('body').includes('dedupe:k1'));
});

test('Cookie 过期(state:200 登录超时)自动重登一次后成功', async () => {
  let puts = 0;
  const pub = mk(async u => (isLogin(u) ? resp(FX.loginOk, { cookie: `s${puts}` }) : resp(++puts === 1 ? FX.putExpired : FX.putOk)));
  assert.strictEqual(await pub({ title: 'T', url: 'https://e.com/1' }, 'k'), 123);
  assert.strictEqual(puts, 2);
});

test('返回 HTML 登录页同样触发重登;重登后仍过期则抛错(告警路径)', async () => {
  let logins = 0;
  const pub = mk(async u => (isLogin(u) ? (++logins, resp(FX.loginOk, { cookie: 's' })) : resp(FX.htmlLogin)));
  await assert.rejects(() => pub({ title: 'T', url: 'https://e.com/1' }, 'k'), /expired after re-login/);
  assert.strictEqual(logins, 2);
});

test('登录被拒不重试并抛错;错误信息不含密码值', async () => {
  const pub = mk(async () => resp(FX.loginBad));
  await assert.rejects(() => pub({ title: 'T', url: 'https://e.com/1' }, 'k'), err => {
    assert.match(err.message, /login rejected: state=200/);
    assert.ok(!err.message.includes('p'.repeat(1)) || !err.message.includes('password'));
    return true;
  });
});

test('业务失败(state:101 入库错 / 未入驻自媒体)不触发重登,直接失败', async () => {
  for (const fx of [FX.putDbErr, FX.putNoMedia]) {
    let logins = 0;
    const pub = mk(async u => (isLogin(u) ? (++logins, resp(FX.loginOk, { cookie: 's' })) : resp(fx)));
    await assert.rejects(() => pub({ title: 'T', url: 'https://e.com/1' }, 'k'), /portal rejected/);
    assert.strictEqual(logins, 1);
  }
});

test('classifyPutResponse:state:100 也算成功;非 JSON 非 HTML 为错误', () => {
  assert.deepStrictEqual(classifyPutResponse({ state: 100 }, ''), { ok: true, aid: undefined });
  assert.ok(classifyPutResponse(null, 'oops').error);
  assert.ok(classifyPutResponse(null, FX.htmlLogin).authExpired);
});

test('remove:del 返回 state:100 成功;过期先重登', async () => {
  let calls = 0;
  const pub = mk(async u => {
    if (isLogin(u)) return resp(FX.loginOk, { cookie: 's' });
    calls++;
    return resp(calls === 1 ? FX.putExpired : FX.delOk);
  });
  const r = await pub.remove(123);
  assert.strictEqual(r.ok, true);
});
