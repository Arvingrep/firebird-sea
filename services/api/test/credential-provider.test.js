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

test('PHP issue_session：只为 telegram 会员签发（username=tg_<id> 约定 + regfrom=telegram），init_data_hash 必填防重放', () => {
  const src = fs.readFileSync(path.join(__dirname, '../../../webroot/api/fbs/index.php'), 'utf8');
  const bridge = fs.readFileSync(path.join(__dirname, '../../../webroot/api/fbs/bridge.php'), 'utf8');
  // 会员定位走 username='tg_<id>' 约定（gateway 用 bridge 的生成函数），不会命中手注册账号
  assert.match(src, /fbs_bridge_member_username\(\$tgUserId\)/);
  assert.match(bridge, /return 'tg_' \. \(int\)\$telegramUserId;/);
  // 建号即标记 regfrom='telegram'（canary 版用的是 SELECT 里的 REGEXP 过滤，我方网关在写入源头约束；
  // VALUES 串写在单引号 PHP 字符串里，引号转义为 \'telegram\'）
  assert.match(bridge, /`regfrom`/);
  assert.match(bridge, /\\'telegram\\'/);
  // issue_session 必填 init_data_hash，且必须过防重放记账（缺了等于把防重放关掉）
  assert.match(src, /fbs_gateway_parse_init_data_hash/);
  assert.match(src, /fbs_gateway_replay_guard\(\$initDataHash, \$context\)/);
});
