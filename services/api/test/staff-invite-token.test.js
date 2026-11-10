'use strict';
// 员工邀请 token 纯函数真值测试（docker-gated，照 php-merchant-bind.test.js 的 harness 模式）。
// 被测文件 webroot/include/fbs_staff_invite.func.php 是纯函数库（禁止 require bridge.php /
// 框架文件），这里只验证冻结契约：
//   ① 生成→解析往返；② 篡改 sid / hmac 必失败；③ 过期必失败（exp 边界 exp==now 合法）；
//   ④ token 长度 ≤ 64、字符集 [a-z0-9_]；⑤ link() 形如 https://t.me/<bot>?start=staff_v1_...；
//   ⑥ 无密钥返回 ''/false，绝不抛异常；⑦ bot 用户名 env → 默认兜底。
// 本机无 docker 时整组 skip（照 test/php-merchant-bind.test.js 的做法）。
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..', '..', '..');
const FUNC_FILE = path.join(ROOT, 'webroot', 'include', 'fbs_staff_invite.func.php');
const PHP_IMAGE = 'php:7.4-cli-alpine';
const TEST_SECRET = 'test-secret-123';

let dockerReady = null;
function hasDocker() {
  if (dockerReady === null) {
    dockerReady = spawnSync('docker', ['info'], { stdio: 'ignore' }).status === 0;
  }
  return dockerReady;
}

// 场景全部在 HARNESS_INPUT 里描述，harness 输出 JSON 结果
function runHarness(payload, env = {}) {
  const harness = `<?php
error_reporting(E_ALL & ~E_DEPRECATED);
require '/app/webroot/include/fbs_staff_invite.func.php';
$in = json_decode(getenv('HARNESS_INPUT'), true);
if (!is_array($in)) { fwrite(STDERR, 'bad input'); exit(2); }
$out = array();

if (isset($in['gen'])) {
  $g = $in['gen'];
  $out['token'] = fbs_staff_invite_token($g['sid'], $g['ttl'], isset($g['bridge']) ? $g['bridge'] : null);
}

if (isset($in['parses'])) {
  $out['parses'] = array();
  foreach ($in['parses'] as $p) {
    $out['parses'][] = fbs_staff_invite_parse($p['token'], isset($p['bridge']) ? $p['bridge'] : null,
      isset($p['now']) ? $p['now'] : null);
  }
}

if (isset($in['links'])) {
  $out['links'] = array();
  foreach ($in['links'] as $l) {
    $out['links'][] = fbs_staff_invite_link($l['sid'], $l['bot'], isset($l['ttl']) ? $l['ttl'] : 86400,
      isset($l['bridge']) ? $l['bridge'] : null);
  }
}

if (isset($in['expired'])) {
  // 用过期 exp 手工签一个 token（真实 key 来自配置文件），供 dispatch/解析层验证过期拒绝
  $key = ($in['expired'] === '') ? fbs_staff_invite_bridge_token() : $in['expired'];
  $exp = time() - 100;
  $payload = 'v1_' . $in['expired_sid'] . '_' . $exp;
  $out['expired_token'] = $payload . '_' . substr(hash_hmac('sha256', $payload, $key), 0, 32);
}

if (isset($in['bot_username'])) {
  $out['bot_username'] = fbs_staff_invite_bot_username();
}

if (isset($in['null_bridge_roundtrip'])) {
  // bridgeToken=null → 走 fbird.inc.php 真实配置；往返必须自洽
  $t = fbs_staff_invite_token($in['null_bridge_roundtrip'], 86400);
  $out['null_token'] = $t;
  $out['null_parsed'] = ($t === '') ? null : fbs_staff_invite_parse($t);
}

echo json_encode($out);
`;
  const envPairs = Object.entries({ HARNESS_INPUT: JSON.stringify(payload), ...env }).map(([k, v]) => ['-e', `${k}=${v}`]).flat();
  const r = spawnSync(
    'docker',
    ['run', '--rm', '-i', ...envPairs, '-v', `${ROOT}:/app`, '-w', '/app', PHP_IMAGE, 'php'],
    { input: harness, encoding: 'utf8' },
  );
  assert.strictEqual(r.status, 0, `php harness 退出码 ${r.status}\nstdout: ${r.stdout}\nstderr: ${r.stderr}`);
  try {
    return JSON.parse(r.stdout);
  } catch (e) {
    throw new Error(`harness 输出不是 JSON：${r.stdout}\nstderr: ${r.stderr}`);
  }
}

test('生成→解析往返：格式 v1_<sid>_<exp>_<hex32>、长度 ≤ 64、字符集 [a-z0-9_]、exp≈now+ttl', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const t0 = Math.floor(Date.now() / 1000);
  const out = runHarness({ gen: { sid: 1, ttl: 86400, bridge: TEST_SECRET } });
  const token = out.token;
  assert.match(token, /^v1_1_\d{10}_[0-9a-f]{32}$/, 'token 必须是 v1_<sid>_<exp>_<hmac32> 冻结格式');
  assert.match(token, /^[a-z0-9_]+$/, 'token 字符集只允许 [a-z0-9_]（Telegram start 参数约束）');
  assert.ok(token.length <= 64, 'token 本体 ≤ 64 字节');
  assert.ok(('staff_' + token).length <= 64, 'staff_ 前缀 + token 必须 ≤ 64 字节');
  const exp = Number(token.split('_')[2]);
  assert.ok(Math.abs(exp - (t0 + 86400)) <= 10, 'exp 必须等于 now + ttl');
});

test('往返解析（合并版）：gen 后逐场景 parse，验证 sid/exp 往返与签名拒绝', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const gen = runHarness({ gen: { sid: 42, ttl: 3600, bridge: TEST_SECRET } });
  const token = gen.token;
  assert.ok(token && token.length > 0, 'token 不得为空');
  const out = runHarness({
    parses: [
      { token, bridge: TEST_SECRET }, // 不传 now → time()
      { token, bridge: 'wrong-secret' }, // 签名错
      { token: token.slice(0, -1) + (token.endsWith('a') ? 'b' : 'a'), bridge: TEST_SECRET }, // hmac 翻一位
    ],
  });
  const [ok, wrongSig, tampered] = out.parses;
  assert.strictEqual(ok.sid, 42, '往返必须解出同一 sid');
  const now = Math.floor(Date.now() / 1000);
  assert.ok(Math.abs(ok.exp - (now + 3600)) <= 30, 'exp 必须等于签发时刻 + ttl');
  assert.strictEqual(wrongSig, false, '密钥不符必须 false（绝不抛异常）');
  assert.strictEqual(tampered, false, 'hmac 篡改一位必须 false（hash_equals 常量时间比较）');
});

test('篡改 payload 的 sid 必失败：不能拿 A 店签名绑到 B 店', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const genA = runHarness({ gen: { sid: 1, ttl: 86400, bridge: TEST_SECRET } });
  const tokenA = genA.token; // v1_1_<exp>_<sig(sid=1)>
  const forged = tokenA.replace(/^v1_1_/, 'v1_2_'); // 只改 sid，沿用 A 店签名
  assert.notStrictEqual(forged, tokenA, '确保篡改确实发生了');
  const out = runHarness({ parses: [{ token: forged, bridge: TEST_SECRET }] });
  assert.strictEqual(out.parses[0], false, '改 sid 后签名必须失效（HMAC 覆盖 payload 整体）');
});

test('过期必失败：exp < now → false；exp == now → 合法（brief 冻结边界）', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const gen = runHarness({ gen: { sid: 1, ttl: 3600, bridge: TEST_SECRET } });
  const token = gen.token;
  const exp = Number(token.split('_')[2]);
  const out = runHarness({
    parses: [
      { token, bridge: TEST_SECRET, now: exp }, // 边界：exp == now 合法
      { token, bridge: TEST_SECRET, now: exp + 1 }, // 过期 1 秒
    ],
  });
  assert.ok(typeof out.parses[0] === 'object' && out.parses[0].sid === 1, 'exp == now 必须仍合法');
  assert.strictEqual(out.parses[1], false, 'exp < now 必须无效');
});

test('手签过期 token（真实配置 key）：dispatch 外的解析层同样拒绝', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const out = runHarness({ expired: '', expired_sid: 1 });
  assert.match(out.expired_token, /^v1_1_\d{10}_[0-9a-f]{32}$/, '手签过期 token 结构合法');
  const parsed = runHarness({ parses: [{ token: out.expired_token, bridge: null }] });
  assert.strictEqual(parsed.parses[0], false, 'exp 在过去 + 真实 key → 必须无效');
});

test('格式与入参边界：sid 非法 / ttl 非法 / 密钥缺失 → \'\' 且绝不抛异常', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const cases = [
    { sid: 0, ttl: 86400, bridge: TEST_SECRET },
    { sid: -1, ttl: 86400, bridge: TEST_SECRET },
    { sid: 'abc', ttl: 86400, bridge: TEST_SECRET },
    { sid: null, ttl: 86400, bridge: TEST_SECRET },
    { sid: 1, ttl: 0, bridge: TEST_SECRET },
    { sid: 1, ttl: -5, bridge: TEST_SECRET },
    { sid: 1, ttl: 86400, bridge: '' }, // 密钥缺失
  ];
  // 逐个生成（一次一个 gen）
  for (const c of cases) {
    const r = runHarness({ gen: c });
    assert.strictEqual(r.token, '', `sid=${c.sid} ttl=${c.ttl} bridge='${c.bridge}' 必须返回 ''`);
  }
  // 结构合法但密钥为空的 parse 必须 false，绝不抛异常
  const good = runHarness({ gen: { sid: 1, ttl: 86400, bridge: TEST_SECRET } }).token;
  const bad = runHarness({ parses: [{ token: good, bridge: '' }] });
  assert.strictEqual(bad.parses[0], false, '密钥为空时 parse 必须 false');
});

test('bridgeToken=null 走 fbird.inc.php 真实配置：往返自洽（docker 内挂载仓库）', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const out = runHarness({ null_bridge_roundtrip: 1 });
  assert.match(out.null_token, /^v1_1_\d{10}_[0-9a-f]{32}$/, 'null 密钥路径必须能从配置文件读出真实 key');
  assert.ok(out.null_parsed && out.null_parsed.sid === 1, 'null 密钥往返必须自洽');
});

test('link()：形如 https://t.me/<bot>?start=staff_v1_...，bot 用户名清洗 @ 与非法字符', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const out = runHarness({
    links: [
      { sid: 1, bot: 'fbird_men_bot', bridge: TEST_SECRET },
      { sid: 1, bot: '@fbird_men_bot', bridge: TEST_SECRET }, // @ 前缀剥离
      { sid: 1, bot: 'Bot.Name!x', bridge: TEST_SECRET }, // 非法字符被清洗
      { sid: 1, bot: '', bridge: TEST_SECRET }, // 空 bot → 兜底
      { sid: 0, bot: 'fbird_men_bot', bridge: TEST_SECRET }, // sid 非法 → ''
      { sid: 1, bot: 'fbird_men_bot', bridge: '' }, // 密钥缺失 → ''
    ],
  });
  const [plain, atPrefix, dirty, empty, badSid, noKey] = out.links;
  assert.match(plain, /^https:\/\/t\.me\/fbird_men_bot\?start=staff_v1_1_\d{10}_[0-9a-f]{32}$/, 'link 必须是冻结深链格式');
  assert.strictEqual(atPrefix, plain, '@ 前缀必须剥离');
  assert.match(dirty, /^https:\/\/t\.me\/BotNamex\?start=staff_/, '非法字符必须清洗掉（点/叹号）');
  assert.match(empty, /^https:\/\/t\.me\/fbird_men_bot\?start=staff_/, '空 bot 回落到兜底用户名');
  assert.strictEqual(badSid, '', 'sid 非法必须返回空串');
  assert.strictEqual(noKey, '', '密钥缺失必须返回空串');
  const tokenPart = plain.split('start=')[1];
  assert.ok(tokenPart.length <= 64, 'staff_ 前缀 + token ≤ 64 字节（Telegram start 上限）');
});

test('bot 用户名：env FBS_TG_BOT_USERNAME 优先；无 env 且无运行时缓存 → 兜底 fbird_men_bot', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const withEnv = runHarness({ bot_username: true }, { FBS_TG_BOT_USERNAME: '@custom_bot' });
  assert.strictEqual(withEnv.bot_username, 'custom_bot', 'env 必须优先且剥 @');
  const withoutEnv = runHarness({ bot_username: true });
  assert.strictEqual(withoutEnv.bot_username, 'fbird_men_bot', '无 env 时回落兜底（仓库无 data/cache/config.php）');
});
