const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { createCredentialProvider } = require('../src/credentialProvider');

const okRes = { state: 100, info: { cookie_name: 'HN_login_user', cookie_value: 'QUJD+/==', ttl: 300 } };

test('换取凭证并在缓存期内复用，过期后重新换取', async () => {
  let t = 0; let calls = 0;
  const p = createCredentialProvider({ gateway: { async issueSession() { calls += 1; return okRes; } }, cacheSeconds: 120, now: () => t });
  assert.strictEqual(await p(5), 'HN_login_user=QUJD+/==');
  await p(5);
  assert.strictEqual(calls, 1);
  t = 121000;
  await p(5);
  assert.strictEqual(calls, 2);
});

test('并发请求共享同一次换取', async () => {
  let calls = 0;
  const p = createCredentialProvider({ gateway: { async issueSession() { calls += 1; await new Promise((r) => setTimeout(r, 5)); return okRes; } } });
  await Promise.all([p(7), p(7), p(7)]);
  assert.strictEqual(calls, 1);
});

test('网关失败或返回含非法字符的凭证时抛错（防 Cookie 头注入）', async () => {
  const bad = [{ state: 500, info: 'x' }, { state: 100, info: { cookie_name: 'a', cookie_value: 'v;evil=1' } }, { state: 100, info: { cookie_name: 'a b', cookie_value: 'v' } }];
  for (const r of bad) {
    const p = createCredentialProvider({ gateway: { async issueSession() { return r; } } });
    await assert.rejects(() => p(1));
  }
});

test('PHP issue_session：只为 telegram 会员签发、窗口 15 秒', () => {
  const src = fs.readFileSync(path.join(__dirname, '../../../webroot/api/fbs/index.php'), 'utf8');
  assert.match(src, /\$action === 'issue_session'\) \? 15 : 60/);
  assert.match(src, /`regfrom` = 'telegram' AND `username` REGEXP '\^tg_\[0-9\]\+\$'/);
});
