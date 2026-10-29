'use strict';
// TAPD 1162017416001000002 登录桥测试（Tess 独占）。
// 只用依赖注入 + 最小 req/res stub，不启真实 server、不发真实网络请求。
// 修复轮 1 同步：POST 增加 CSRF 来源闸门（Origin/Sec-Fetch-Site）、forceSecure 默认 true、
// 503 文案收敛（不暴露环境变量名）。场景清单见 implementer-report.md 第四/七节；
// 报告见 .agent-runs/2026-10-29/task-004/test-report.md。
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { createBridgeRoute, sanitizeTarget } = require('../src/bridgeRoute');

// 假值，绝不使用真实 bot token / 真实凭证
const FAKE_COOKIE = 'HN_login_user=QUJD+/==';
const FAKE_NODE_TOKEN = 'NODE_FAKE_TOKEN_SHOULD_NEVER_REACH_BROWSER';
const COOKIE_DOMAIN = 'fbird.men';
// 由 cookieDomain 推出的本站 Origin（跨站闸门放行集合内）
const SITE_ORIGIN = `https://${COOKIE_DOMAIN}`;

// ---- 最小 req/res stub（参考现有测试的依赖注入风格）----

function makeReq({ body = {}, query = {}, secure = false, headers = {} } = {}) {
  const lower = {};
  for (const [k, v] of Object.entries(headers)) lower[String(k).toLowerCase()] = v;
  return {
    body, query, secure,
    get: (name) => lower[String(name).toLowerCase()], // 仿 express req.get
  };
}

function makeRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: '',
    redirectUrl: null,
    setHeader(k, v) { this.headers[String(k).toLowerCase()] = v; },
    removeHeader(k) { delete this.headers[String(k).toLowerCase()]; },
    status(code) { this.statusCode = code; return this; },
    type(t) {
      this.headers['content-type'] = t === 'html' ? 'text/html; charset=utf-8' : t;
      return this;
    },
    send(b) { this.body = String(b); return this; },
    redirect(code, url) {
      if (url === undefined) { url = code; code = 302; }
      this.statusCode = code;
      this.redirectUrl = url;
      this.headers.location = url;
      this.body = `Found. Redirecting to ${url}`; // 仿 express 行为，便于断言泄漏面
      return this;
    },
  };
  return res;
}

// 合法站内 POST 请求（带浏览器代填的 Origin，过 CSRF 闸门）
function siteReq(opts = {}) {
  return makeReq({ headers: { origin: SITE_ORIGIN }, ...opts });
}

// loginService stub：按脚本返回
function makeLoginService(script, calls = []) {
  return { async login(initData) { calls.push(initData); return typeof script === 'function' ? script(initData) : script; } };
}

function okLogin(calls) {
  return makeLoginService({ status: 200, body: { success: true, data: { token: FAKE_NODE_TOKEN, expiresAt: '2099-01-01', memberId: 5 } } }, calls);
}

function makeDeps(overrides = {}) {
  return {
    botToken: 'FAKE_BOT_TOKEN',
    loginService: okLogin(),
    credentialProvider: async () => FAKE_COOKIE,
    cookieDomain: COOKIE_DOMAIN,
    ...overrides,
  };
}

// ---- CSRF 来源闸门（修复轮 1 · B-1）----

test('跨站 Origin（https://evil.example）→ 403，无 Set-Cookie、无 302', async () => {
  const calls = [];
  const bridge = createBridgeRoute(makeDeps({ loginService: okLogin(calls) }));
  const res = makeRes();
  await bridge.postBridge(makeReq({ body: { initData: 'x' }, headers: { origin: 'https://evil.example' } }), res);
  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(res.headers['set-cookie'], undefined);
  assert.strictEqual(res.redirectUrl, null);
  assert.match(res.body, /CROSS_SITE_BLOCKED/);
  assert.strictEqual(calls.length, 0, '闸门拦截后不得触达 loginService');
});

test('Origin 缺失 + Sec-Fetch-Site: cross-site → 403，无 Set-Cookie、无 302', async () => {
  const bridge = createBridgeRoute(makeDeps());
  const res = makeRes();
  await bridge.postBridge(makeReq({ body: { initData: 'x' }, headers: { 'sec-fetch-site': 'cross-site' } }), res);
  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(res.headers['set-cookie'], undefined);
  assert.strictEqual(res.redirectUrl, null);
  assert.match(res.body, /CROSS_SITE_BLOCKED/);
});

test('Origin 与 Sec-Fetch-Site 全缺 → fail-closed 403，无 Set-Cookie、无 302', async () => {
  const bridge = createBridgeRoute(makeDeps());
  const res = makeRes();
  await bridge.postBridge(makeReq({ body: { initData: 'x' } }), res);
  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(res.headers['set-cookie'], undefined);
  assert.strictEqual(res.redirectUrl, null);
  assert.match(res.body, /CROSS_SITE_BLOCKED/);
});

test('同站 Origin（根域 / www / 请求 Host / http 变体）放行 → 302', async () => {
  for (const origin of [SITE_ORIGIN, `http://${COOKIE_DOMAIN}`, 'https://www.fbird.men']) {
    const bridge = createBridgeRoute(makeDeps());
    const res = makeRes();
    await bridge.postBridge(makeReq({ body: { initData: 'x' }, headers: { origin } }), res);
    assert.strictEqual(res.statusCode, 302, `origin=${origin}`);
  }
  // 请求 Host 在允许集合内
  const bridge = createBridgeRoute(makeDeps());
  const res = makeRes();
  await bridge.postBridge(makeReq({
    body: { initData: 'x' },
    headers: { origin: 'https://api.fbird.men', host: 'api.fbird.men' },
  }), res);
  assert.strictEqual(res.statusCode, 302);
});

// ---- 三级来源闸门（修复轮 2 · n-3）：① Origin ② Sec-Fetch-Site ③ Referer 兜底 ----

test('无 Origin、无 Sec-Fetch-Site、Referer 同站 → Referer 兜底放行 302 + Set-Cookie', async () => {
  const bridge = createBridgeRoute(makeDeps());
  const res = makeRes();
  await bridge.postBridge(makeReq({
    body: { initData: 'x' },
    headers: { referer: 'https://fbird.men/some/page' },
  }), res);
  assert.strictEqual(res.statusCode, 302);
  assert.strictEqual(res.headers['set-cookie'].includes(FAKE_COOKIE), true);
});

test('无 Origin、无 Sec-Fetch-Site、Referer 跨站（https://evil.example/x）→ 403，无 Cookie/无 Location', async () => {
  const bridge = createBridgeRoute(makeDeps());
  const res = makeRes();
  await bridge.postBridge(makeReq({
    body: { initData: 'x' },
    headers: { referer: 'https://evil.example/x' },
  }), res);
  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(res.headers['set-cookie'], undefined);
  assert.strictEqual(res.redirectUrl, null);
  assert.match(res.body, /CROSS_SITE_BLOCKED/);
});

test('无 Origin、Sec-Fetch-Site: same-origin → 放行 302', async () => {
  const bridge = createBridgeRoute(makeDeps());
  const res = makeRes();
  await bridge.postBridge(makeReq({
    body: { initData: 'x' },
    headers: { 'sec-fetch-site': 'same-origin' },
  }), res);
  assert.strictEqual(res.statusCode, 302);
});

test('无 Origin、Sec-Fetch-Site: same-site → 放行 302', async () => {
  const bridge = createBridgeRoute(makeDeps());
  const res = makeRes();
  await bridge.postBridge(makeReq({
    body: { initData: 'x' },
    headers: { 'sec-fetch-site': 'same-site' },
  }), res);
  assert.strictEqual(res.statusCode, 302);
});

test('Host 伪装：前缀伪装 fbird.men.evil.com → 403；Origin 伪子域 evil.fbird.men（Host 正常）→ 403；合法子域 canary.fbird.men → 302', async () => {
  // 前缀伪装：host 不以 .fbird.men 结尾，不进允许集合
  const prefix = createBridgeRoute(makeDeps());
  const resPrefix = makeRes();
  await prefix.postBridge(makeReq({
    body: { initData: 'x' },
    headers: { host: 'fbird.men.evil.com', origin: 'https://fbird.men.evil.com' },
  }), resPrefix);
  assert.strictEqual(resPrefix.statusCode, 403);
  assert.strictEqual(resPrefix.headers['set-cookie'], undefined);
  assert.strictEqual(resPrefix.redirectUrl, null);

  // 子域后缀形 Origin 但请求 Host 是本站正常值：允许集合不含 evil.fbird.men → 403
  const suffixOrigin = createBridgeRoute(makeDeps());
  const resSuffix = makeRes();
  await suffixOrigin.postBridge(makeReq({
    body: { initData: 'x' },
    headers: { host: 'fbird.men', origin: 'https://evil.fbird.men' },
  }), resSuffix);
  assert.strictEqual(resSuffix.statusCode, 403);
  assert.strictEqual(resSuffix.headers['set-cookie'], undefined);
  assert.strictEqual(resSuffix.redirectUrl, null);

  // 合法子域（自报 Host 在本域下）：canary.fbird.men 收录进允许集合并放行
  const canary = createBridgeRoute(makeDeps());
  const resCanary = makeRes();
  await canary.postBridge(makeReq({
    body: { initData: 'x' },
    headers: { host: 'canary.fbird.men', origin: 'https://canary.fbird.men' },
  }), resCanary);
  assert.strictEqual(resCanary.statusCode, 302);
});

test('拒绝响应（403）不含 initData 与凭证值（抽查 Referer 跨站形态）', async () => {
  const bridge = createBridgeRoute(makeDeps());
  const res = makeRes();
  await bridge.postBridge(makeReq({
    body: { initData: 'SECRET_INITDATA_LEAK_PROBE' },
    headers: { referer: 'https://evil.example/x' },
  }), res);
  assert.strictEqual(res.statusCode, 403);
  assert.ok(!res.body.includes('SECRET_INITDATA_LEAK_PROBE'), '403 页不得回显 initData');
  assert.ok(!res.body.includes('QUJD+/=='), '403 页不得含凭证值');
  assert.ok(!res.body.includes(FAKE_NODE_TOKEN), '403 页不得含 Node token');
});

test('无 Origin、无 Sec-Fetch-Site、Referer 也缺 → 三级全失败 403', async () => {
  const bridge = createBridgeRoute(makeDeps());
  const res = makeRes();
  await bridge.postBridge(makeReq({ body: { initData: 'x' } }), res);
  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(res.headers['set-cookie'], undefined);
  assert.strictEqual(res.redirectUrl, null);
  assert.match(res.body, /CROSS_SITE_BLOCKED/);
});

// ---- 登录失败透传 ----

test('loginService 返回 401（验签失败）→ 透传 401，无 Set-Cookie、无 302', async () => {
  const bridge = createBridgeRoute(makeDeps({
    loginService: makeLoginService({ status: 401, body: { success: false, error: { code: 'INVALID_INIT_DATA', message: '签名校验失败' } } }),
  }));
  const res = makeRes();
  await bridge.postBridge(siteReq({ body: { initData: 'fake-init-data' } }), res);
  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(res.headers['set-cookie'], undefined);
  assert.strictEqual(res.redirectUrl, null);
  assert.match(res.body, /INVALID_INIT_DATA/);
});

test('loginService 返回 429（限频/重放）→ 透传 429，无 Set-Cookie、无 302', async () => {
  const bridge = createBridgeRoute(makeDeps({
    loginService: makeLoginService({ status: 429, body: { success: false, error: { code: 'RATE_LIMITED', message: '请求过于频繁' } } }),
  }));
  const res = makeRes();
  await bridge.postBridge(siteReq({ body: { initData: 'fake-init-data' } }), res);
  assert.strictEqual(res.statusCode, 429);
  assert.strictEqual(res.headers['set-cookie'], undefined);
  assert.strictEqual(res.redirectUrl, null);
  assert.match(res.body, /RATE_LIMITED/);
});

// ---- 成功路径：302 + Set-Cookie ----

test('成功路径（FORCE_SECURE 默认 true + http）→ 302 + Set-Cookie 含 Secure 与完整属性，无 HttpOnly', async () => {
  const calls = [];
  const bridge = createBridgeRoute(makeDeps({ loginService: okLogin(calls) }));
  const res = makeRes();
  await bridge.postBridge(siteReq({ body: { initData: 'fake-init-data', to: '/member/user.html' }, secure: false }), res);

  assert.strictEqual(res.statusCode, 302);
  assert.strictEqual(res.redirectUrl, '/member/user.html');
  assert.strictEqual(calls[0], 'fake-init-data'); // initData 原样传给 loginService

  const cookie = res.headers['set-cookie'];
  assert.ok(typeof cookie === 'string');
  assert.ok(cookie.startsWith(`${FAKE_COOKIE}; `), 'Cookie 名值必须是 credentialProvider 返回串');
  assert.ok(cookie.includes('Path=/'), cookie);
  assert.ok(cookie.includes(`Domain=${COOKIE_DOMAIN}`), cookie);
  assert.ok(cookie.includes('Max-Age=86400'), cookie);
  assert.ok(cookie.includes('SameSite=Lax'), cookie);
  assert.ok(cookie.includes('; Secure'), 'forceSecure 默认 true：即使 http 也必须带 Secure');
  assert.ok(!cookie.includes('HttpOnly'), '不得下发 HttpOnly（与火鸟 login_user 现状一致）');

  assert.strictEqual(res.headers['cache-control'], 'no-store');
  // 响应体与响应头不得出现 Node 自签 token 或凭证值
  assert.ok(!res.body.includes('token'), '响应体不得含 token 字样');
  assert.ok(!res.body.includes(FAKE_NODE_TOKEN));
  assert.ok(!res.body.includes('QUJD+/=='), '响应体不得含凭证值');
  assert.ok(!cookie.includes(FAKE_NODE_TOKEN));
});

test('无 to 字段 → Location 回落默认目标 /', async () => {
  const bridge = createBridgeRoute(makeDeps());
  const res = makeRes();
  await bridge.postBridge(siteReq({ body: { initData: 'fake-init-data' } }), res);
  assert.strictEqual(res.statusCode, 302);
  assert.strictEqual(res.redirectUrl, '/');
});

test('FORCE_SECURE 显式 false：http 无 Secure，https（req.secure）有 Secure', async () => {
  const http = createBridgeRoute(makeDeps({ forceSecure: false }));
  const resHttp = makeRes();
  await http.postBridge(siteReq({ body: { initData: 'x' }, secure: false }), resHttp);
  assert.strictEqual(resHttp.statusCode, 302);
  assert.ok(!resHttp.headers['set-cookie'].includes('Secure'), resHttp.headers['set-cookie']);

  const https = createBridgeRoute(makeDeps({ forceSecure: false }));
  const resHttps = makeRes();
  await https.postBridge(siteReq({ body: { initData: 'x' }, secure: true }), resHttps);
  assert.strictEqual(resHttps.statusCode, 302);
  assert.ok(resHttps.headers['set-cookie'].includes('; Secure'), resHttps.headers['set-cookie']);
});

// ---- 开放重定向防护 ----

test('开放重定向：//evil.com、/\\evil、https://evil.com 回落默认目标，/ok/path 按原样放行', async () => {
  for (const evil of ['//evil.com', '/\\evil', 'https://evil.com']) {
    const bridge = createBridgeRoute(makeDeps());
    const res = makeRes();
    await bridge.postBridge(siteReq({ body: { initData: 'x', to: evil } }), res);
    assert.strictEqual(res.statusCode, 302, `to=${evil}`);
    assert.strictEqual(res.redirectUrl, '/', `to=${evil} 必须回落默认目标`);
  }
  const bridge = createBridgeRoute(makeDeps());
  const res = makeRes();
  await bridge.postBridge(siteReq({ body: { initData: 'x', to: '/ok/path' } }), res);
  assert.strictEqual(res.statusCode, 302);
  assert.strictEqual(res.redirectUrl, '/ok/path');
});

test('sanitizeTarget：javascript:、@userinfo、CRLF、超长、非 / 开头一律回落', () => {
  const fallback = '/';
  for (const bad of ['javascript:alert(1)', '/a@evil.com', '/x\r\nSet-Cookie: a=1', `/${'a'.repeat(201)}`, 'relative', '']) {
    assert.strictEqual(sanitizeTarget(bad, fallback), fallback, `bad=${JSON.stringify(bad)}`);
  }
  assert.strictEqual(sanitizeTarget('/ok', fallback), '/ok');
});

// ---- 网关凭证失败降级 ----

test('credentialProvider 抛错（网关 4xx/5xx）→ 502，无 Set-Cookie、无 302、响应不含凭证值', async () => {
  const bridge = createBridgeRoute(makeDeps({
    credentialProvider: async () => { throw new Error('issue_session failed'); },
  }));
  const res = makeRes();
  await bridge.postBridge(siteReq({ body: { initData: 'x' } }), res);
  assert.strictEqual(res.statusCode, 502);
  assert.strictEqual(res.headers['set-cookie'], undefined);
  assert.strictEqual(res.redirectUrl, null);
  assert.ok(!res.body.includes('QUJD+/=='));
});

test('credentialProvider 返回非法格式（分号注入）→ 502，脏值不得写入 Set-Cookie', async () => {
  const bridge = createBridgeRoute(makeDeps({
    credentialProvider: async () => 'HN_login_user=abc; Domain=evil.com',
  }));
  const res = makeRes();
  await bridge.postBridge(siteReq({ body: { initData: 'x' } }), res);
  assert.strictEqual(res.statusCode, 502);
  assert.strictEqual(res.headers['set-cookie'], undefined);
  assert.strictEqual(res.redirectUrl, null);
});

test('凭证值不进日志：console.error/console.log 捕获后均不含凭证值与 Node token', async () => {
  const captured = [];
  const origError = console.error;
  const origLog = console.log;
  const origWarn = console.warn;
  console.error = (...a) => captured.push(a.map(String).join(' '));
  console.log = (...a) => captured.push(a.map(String).join(' '));
  console.warn = (...a) => captured.push(a.map(String).join(' '));
  try {
    const bridge = createBridgeRoute(makeDeps({
      loginService: okLogin(),
      credentialProvider: async () => { throw new Error('issue_session failed'); },
    }));
    await bridge.postBridge(siteReq({ body: { initData: 'init-data-should-not-leak' } }), makeRes());

    const bridge2 = createBridgeRoute(makeDeps());
    await bridge2.postBridge(siteReq({ body: { initData: 'init-data-should-not-leak' } }), makeRes());

    const all = captured.join('\n');
    assert.ok(!all.includes('QUJD+/=='), '凭证值不得出现在日志');
    assert.ok(!all.includes(FAKE_NODE_TOKEN), 'Node token 不得出现在日志');
    assert.ok(!all.includes('init-data-should-not-leak'), 'initData 不得整体进日志');
  } finally {
    console.error = origError;
    console.log = origLog;
    console.warn = origWarn;
  }
});

// ---- 配置缺失 503（修复轮 1 · O-5：文案收敛，不暴露环境变量名）----

test('配置缺失（cookieDomain 为空）→ POST 503 BRIDGE_NOT_CONFIGURED，无 Set-Cookie', async () => {
  const bridge = createBridgeRoute(makeDeps({ cookieDomain: '' }));
  const res = makeRes();
  await bridge.postBridge(makeReq({ body: { initData: 'x' } }), res);
  assert.strictEqual(res.statusCode, 503);
  assert.strictEqual(res.headers['set-cookie'], undefined);
  assert.match(res.body, /BRIDGE_NOT_CONFIGURED/);
  assert.match(res.body, /服务暂未配置/);
});

test('配置缺失（botToken 为空）→ GET 503，进程不崩', () => {
  const bridge = createBridgeRoute(makeDeps({ botToken: '' }));
  const res = makeRes();
  bridge.getLanding(makeReq(), res);
  assert.strictEqual(res.statusCode, 503);
  assert.match(res.body, /BRIDGE_NOT_CONFIGURED/);
});

test('503 错误页不暴露任何环境变量名（TMA_/FBS_/DB_/TELEGRAM_ 前缀零命中）', async () => {
  // 一次性构造缺全部配置的实例，GET 与 POST 都断言
  const warnings = [];
  const origWarn = console.warn;
  console.warn = (...a) => warnings.push(a.map(String).join(' '));
  try {
    const bridge = createBridgeRoute({});
    const resPost = makeRes();
    await bridge.postBridge(makeReq({ body: { initData: 'x' } }), resPost);
    const resGet = makeRes();
    bridge.getLanding(makeReq(), resGet);
    for (const [label, res] of [['POST', resPost], ['GET', resGet]]) {
      assert.strictEqual(res.statusCode, 503, label);
      assert.ok(!/TMA_[A-Z_]+/.test(res.body), `${label} 页不得含 TMA_* 变量名`);
      assert.ok(!/FBS_[A-Z_]+/.test(res.body), `${label} 页不得含 FBS_* 变量名`);
      assert.ok(!/DB_[A-Z_]+/.test(res.body), `${label} 页不得含 DB_* 变量名`);
      assert.ok(!res.body.includes('TELEGRAM_BOT_TOKEN'), `${label} 页不得含 TELEGRAM_BOT_TOKEN`);
    }
  } finally {
    console.warn = origWarn;
  }
});

// ---- Max-Age 配置兜底 ----

test('Max-Age 非法配置（0）回落默认 86400', async () => {
  const bridge = createBridgeRoute(makeDeps({ maxAgeSeconds: 0 }));
  const res = makeRes();
  await bridge.postBridge(siteReq({ body: { initData: 'x' } }), res);
  assert.ok(res.headers['set-cookie'].includes('Max-Age=86400'), res.headers['set-cookie']);
});

// ---- GET 落地页 ----

test('落地页 GET：text/html，含 telegram-web-app.js、表单 POST 到桥端点、initData 字段与提示文案', () => {
  const bridge = createBridgeRoute(makeDeps());
  const res = makeRes();
  bridge.getLanding(makeReq({ query: { to: '/member/user.html' } }), res);

  assert.strictEqual(res.statusCode, 200);
  assert.match(res.headers['content-type'], /text\/html/);
  assert.ok(res.body.includes('https://telegram.org/js/telegram-web-app.js'), res.body);
  assert.ok(res.body.includes('method="POST"'), res.body);
  assert.ok(res.body.includes('action="/tg-api/auth/bridge"'), res.body);
  assert.ok(res.body.includes('name="initData"'), res.body);
  assert.ok(res.body.includes('value="/member/user.html"'), 'to 应透传进隐藏字段');
  assert.ok(res.body.includes('请从 Telegram 内打开'), '无 initData 的非 TG 环境要有提示文案');
  assert.strictEqual(res.headers['cache-control'], 'no-store');
  // CSP：内联脚本走 nonce，脚本源限 self + telegram.org，form-action 收紧到自身，
  // frame-ancestors 放行 Telegram
  const csp = res.headers['content-security-policy'] || '';
  assert.match(csp, /script-src 'self' https:\/\/telegram\.org 'nonce-/);
  assert.match(csp, /frame-ancestors https:\/\/web\.telegram\.org/);
  assert.match(csp, /form-action 'self'/);
  // nonce 应与 script 标签上的 nonce 一致
  const nonce = csp.match(/'nonce-([^']+)'/)[1];
  assert.ok(res.body.includes(`nonce="${nonce}"`), 'script 标签须带同一 nonce');
});

test('落地页 to=//evil.com → 隐藏字段回落 /', () => {
  const bridge = createBridgeRoute(makeDeps());
  const res = makeRes();
  bridge.getLanding(makeReq({ query: { to: '//evil.com' } }), res);
  assert.strictEqual(res.statusCode, 200);
  assert.ok(res.body.includes('value="/"'), res.body);
  assert.ok(!res.body.includes('evil.com'));
});

// ---- 源码级防回归（防「Node 自签」约束被破坏）----

test('源码约束：bridgeRoute.js 不调用 tokens.issue（Node 不自签凭证）', () => {
  const src = fs.readFileSync(path.join(__dirname, '../src/bridgeRoute.js'), 'utf8');
  // 只查代码引用（require tmaToken / 调用 tokens.issue），实现注释里提约束名不算
  assert.ok(!/require\([^)]*tmaToken/.test(src), 'bridgeRoute.js 不得 require tmaToken');
  assert.ok(!/tokens\s*\.\s*issue\s*\(/.test(src), 'bridgeRoute.js 不得调用 tokens.issue');
  assert.ok(!src.includes('createTokenService'), 'bridgeRoute.js 不得引用 createTokenService');
});
