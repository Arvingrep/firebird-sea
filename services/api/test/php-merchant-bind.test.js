'use strict';
// 商家绑定 PHP 侧真值测试（docker-gated，照 php-rider-bind.test.js 的夹具模式）：
//   ① 手机号归一（与 Node 侧逐字节契约，两侧同步的最后防线）
//   ② 三维度限频（底账 fbs_merchant_audit；tg 5/60s、phone 3/300s、ip 20/300s、排除 rate_limited）
//   ③ 窗口分类行为：merchant_session 走紧窗 ±15s，merchant_bind 维持宽窗 ±300s
//   ④ 源码约束：白名单/紧窗/显式 return 四处注册、会员解析只读（绝不建号）、审计 fail-closed、
//      商家分支绝不写 fbs_member_map。
// 本机无 docker 时 ①②③ 整组 skip（照 test/php-rider-bind.test.js 的做法），④ 永远真跑。
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..', '..', '..');
const GATEWAY = path.join(ROOT, 'webroot', 'api', 'fbs', 'index.php');
const PHP_IMAGE = 'php:7.4-cli-alpine';

// ---- 从 index.php 摘函数源码（引号感知的花括号配对，不 include 整个文件）----

function extractFunction(src, name) {
  const start = src.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `index.php 里找不到 function ${name}()，测试需同步更新`);
  const open = src.indexOf('{', start);
  let depth = 0;
  let i = open;
  let quote = null;
  for (; i < src.length; i++) {
    const c = src[i];
    if (quote) {
      if (c === '\\') { i++; continue; }
      if (c === quote) quote = null;
      continue;
    }
    if (c === "'" || c === '"') { quote = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return src.slice(start, i + 1);
    }
  }
  throw new Error(`function ${name}() 花括号未闭合`);
}

// 桩 PDO：限频函数对它做 prepare(SQL)->execute(args)->fetchColumn()。
// 按 SQL 文本里的维度条件（tg_user_id / phone / ip）与 INTERVAL 窗口在内存行集上求值
//（与 php-rider-bind.test.js 同一份桩，表名不影响匹配——条件按列名认）。
const PDO_STUB = `
class HarnessStmt {
  public $sql; public $rows; public $args = array(); public $count = 0;
  public function __construct($sql, $rows) { $this->sql = $sql; $this->rows = $rows; }
  public function execute($args) {
    $interval = 0;
    if (preg_match('/INTERVAL (\\d+) SECOND/', $this->sql, $m)) $interval = (int)$m[1];
    $byTg = preg_match('/\`?tg_user_id\`? = \\?/', $this->sql) === 1;
    $byPhone = preg_match('/\`?phone\`? = \\?/', $this->sql) === 1;
    $byIp = preg_match('/\`?ip\`? = \\?/', $this->sql) === 1;
    $excludeRate = preg_match('/\`?result\`? != \\'rate_limited\\'/', $this->sql) === 1;
    $ai = 0;
    $tgVal = $byTg ? (string)$args[$ai++] : null;
    $phoneVal = $byPhone ? (string)$args[$ai++] : null;
    $ipVal = $byIp ? (string)$args[$ai++] : null;
    $n = 0;
    foreach ($this->rows as $r) {
      if ($tgVal !== null && (string)$r['tg'] !== $tgVal) continue;
      if ($phoneVal !== null && ((string)$r['phone'] !== $phoneVal || (string)$r['phone'] === '')) continue;
      if ($ipVal !== null && ((string)$r['ip'] !== $ipVal || (string)$r['ip'] === '')) continue;
      if ($excludeRate && $r['result'] === 'rate_limited') continue;
      // created_at > NOW() - INTERVAL n SECOND  <=>  行龄严格小于 n 秒
      if ($interval > 0 && (int)$r['age'] >= $interval) continue;
      $n++;
    }
    $this->count = $n;
    return true;
  }
  public function fetchColumn() { return $this->count; }
}
class HarnessPdo {
  public $rows;
  public function __construct($rows) { $this->rows = $rows; }
  public function prepare($sql) { return new HarnessStmt($sql, $this->rows); }
}
`;

function buildHarness(gatewaySrc) {
  const fnNormalize = extractFunction(gatewaySrc, 'fbs_normalize_phone');
  const fnRate = extractFunction(gatewaySrc, 'fbs_gateway_merchant_rate_limited').replace('PDO $pdo', '$pdo');
  return `<?php
error_reporting(E_ALL & ~E_DEPRECATED);
${PDO_STUB}
${fnNormalize}
${fnRate}
$in = json_decode(getenv('HARNESS_INPUT'), true);
if (!is_array($in)) { fwrite(STDERR, 'bad input'); exit(2); }
$out = array('phones' => array(), 'scenarios' => array());
foreach ($in['phones'] as $p) { $out['phones'][] = fbs_normalize_phone($p); }
foreach ($in['scenarios'] as $s) {
  $pdo = new HarnessPdo($s['rows']);
  $r = fbs_gateway_merchant_rate_limited($pdo, $s['tg'], $s['phone'], isset($s['ip']) ? $s['ip'] : '');
  $out['scenarios'][] = array('name' => $s['name'], 'limited' => $r['limited'], 'error' => $r['error'] !== null);
}
echo json_encode($out);
`;
}

let dockerReady = null;
function hasDocker() {
  if (dockerReady === null) {
    dockerReady = spawnSync('docker', ['info'], { stdio: 'ignore' }).status === 0;
  }
  return dockerReady;
}

function runHarness(payload) {
  const harness = buildHarness(fs.readFileSync(GATEWAY, 'utf8'));
  const r = spawnSync(
    'docker',
    ['run', '--rm', '-i', '-e', `HARNESS_INPUT=${JSON.stringify(payload)}`, PHP_IMAGE, 'php'],
    { input: harness, encoding: 'utf8' },
  );
  assert.strictEqual(r.status, 0, `php harness 退出码 ${r.status}\nstdout: ${r.stdout}\nstderr: ${r.stderr}`);
  let out;
  try {
    out = JSON.parse(r.stdout);
  } catch (e) {
    throw new Error(`harness 输出不是 JSON：${r.stdout}\nstderr: ${r.stderr}`);
  }
  return out;
}

const row = (tg, phone, result, age, ip) => ({ tg, phone, result, age, ip: ip || '' });
const rowsOf = (n, opts = {}) => Array.from({ length: n }, (_, i) => row(
  opts.tg !== undefined ? opts.tg : `777000${i}`,
  opts.phone !== undefined ? opts.phone : `0917100000${i}`,
  opts.result || 'success',
  opts.age === undefined ? 10 : opts.age,
  opts.ip,
));
const FRESH_TG = '999999';
const FRESH_PHONE = '09179999999';
const FRESH_IP = '10.9.9.9';

// 归一矩阵与 rider 侧同一份（两侧归一契约：Node normalizePhone ⇄ PHP fbs_normalize_phone）。
// 商家复用同一函数，这里抽 8 组代表形态钉住「商家没有另一套归一」。
test('PHP fbs_normalize_phone：商家侧与 Node 侧逐字节一致（+63→0、去分隔符、边界拒绝）', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const out = runHarness({
    phones: ['09178889999', '+639178889999', '+63 (917) 888-9999', '63-917-888-9999', '0917-888-9999', ' 09178889999 ', '091234567890', 'abcdefghijk'],
    scenarios: [],
  });
  assert.deepStrictEqual(out.phones, [
    '09178889999', '09178889999', '09178889999', '09178889999',
    '09178889999', '09178889999', null, null,
  ], 'PHP 归一结果必须与 Node normalizePhone 完全一致');
});

test('PHP 商家限频 tg 维度 5/60s —— 满 5 拒、4 放；phone 维度 3/300s；rate_limited 不占额度', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const out = runHarness({
    phones: [],
    scenarios: [
      { name: 'tg4', tg: '777', phone: FRESH_PHONE, ip: FRESH_IP, rows: rowsOf(4, { tg: '777' }) },
      { name: 'tg5', tg: '777', phone: FRESH_PHONE, ip: FRESH_IP, rows: rowsOf(5, { tg: '777' }) },
      { name: 'other_tg', tg: '888', phone: FRESH_PHONE, ip: FRESH_IP, rows: rowsOf(5, { tg: '777' }) },
      { name: 'ph2', tg: FRESH_TG, phone: '09178889999', ip: FRESH_IP, rows: rowsOf(2, { phone: '09178889999' }) },
      { name: 'ph3', tg: FRESH_TG, phone: '09178889999', ip: FRESH_IP, rows: rowsOf(3, { phone: '09178889999' }) },
      { name: 'tg_all_rate_limited', tg: '779', phone: FRESH_PHONE, ip: FRESH_IP, rows: rowsOf(10, { tg: '779', result: 'rate_limited' }) },
      { name: 'ip20', tg: FRESH_TG, phone: FRESH_PHONE, ip: '10.1.1.1', rows: rowsOf(20, { ip: '10.1.1.1' }) },
      { name: 'ip19', tg: FRESH_TG, phone: FRESH_PHONE, ip: '10.1.1.2', rows: rowsOf(19, { ip: '10.1.1.2' }) },
    ],
  });
  const byName = Object.fromEntries(out.scenarios.map((s) => [s.name, s.limited]));
  assert.strictEqual(byName.tg4, false, '已有 4 次时第 5 次应放行');
  assert.strictEqual(byName.tg5, true, '已有 5 次时第 6 次必须被限频');
  assert.strictEqual(byName.other_tg, false, '限频按 tg_user_id 维度隔离');
  assert.strictEqual(byName.ph2, false, '同号已有 2 次时第 3 次应放行');
  assert.strictEqual(byName.ph3, true, '同号已有 3 次时第 4 次必须被限频');
  assert.strictEqual(byName.tg_all_rate_limited, false, 'rate_limited 行不得计入额度（不会越试越锁死）');
  assert.strictEqual(byName.ip20, true, '同 ip 已有 20 次时第 21 次必须被限频');
  assert.strictEqual(byName.ip19, false, '同 ip 已有 19 次时第 20 次应放行');
});

test('PHP 商家限频：窗口边界（tg 60s / phone 与 ip 300s，窗外旧行不计入）', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const out = runHarness({
    phones: [],
    scenarios: [
      {
        name: 'tg_window_ok',
        tg: '777',
        phone: FRESH_PHONE,
        ip: FRESH_IP,
        rows: rowsOf(4, { tg: '777', age: 59 }).concat(rowsOf(3, { tg: '777', age: 61 })),
      },
      { name: 'tg_window_hit', tg: '777', phone: FRESH_PHONE, ip: FRESH_IP, rows: rowsOf(5, { tg: '777', age: 59 }) },
      {
        name: 'phone_window_ok',
        tg: FRESH_TG,
        phone: '09178889999',
        ip: FRESH_IP,
        rows: rowsOf(2, { phone: '09178889999', age: 299 }).concat(rowsOf(5, { phone: '09178889999', age: 301 })),
      },
    ],
  });
  const byName = Object.fromEntries(out.scenarios.map((s) => [s.name, s.limited]));
  assert.strictEqual(byName.tg_window_ok, false, '60 秒前的旧行不计入 tg 额度');
  assert.strictEqual(byName.tg_window_hit, true, '60 秒内满 5 次仍要拦');
  assert.strictEqual(byName.phone_window_ok, false, '300 秒前的旧行不计入 phone 额度');
});

// ---- 窗口分类行为（dispatch 级，需要整个 index.php）----

test('行为：merchant_session 走紧窗（20 秒前签名 401），merchant_bind 维持宽窗（不 401）', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const hex64 = 'a'.repeat(64);
  const harness = `<?php
error_reporting(E_ALL & ~E_DEPRECATED);
define('FBS_GATEWAY_TEST', true);
require '/app/webroot/api/fbs/index.php';

$secret = 'test-secret-123';
// dbinfo 注入一个「配置缺失」错误让业务层快速失败（无网络、无库），只关心签名窗口的 401 与否
$ctx = array('secret' => $secret, 'dbinfo' => array('error' => 'config_missing', 'message' => 'test'), 'replay_dir' => sys_get_temp_dir() . '/fbs-replay-' . getmypid());

$tsBase = time();
$tsOld = (string)($tsBase - 20);
$tsNow = (string)$tsBase;
$bodySession = '{"action":"merchant_session","params":{"tg_user_id":1,"init_data_hash":"${hex64}"}}';
$bodyBind = '{"action":"merchant_bind","params":{"tg_user_id":1,"phone":"09178889999","ip":"1.2.3.4"}}';

$sigSessionOld = fbs_gateway_sign($secret, $tsOld, 'merchant_session', $bodySession);
list($cSessOld,) = fbs_gateway_dispatch('merchant_session', $bodySession, $tsOld, $sigSessionOld, $ctx);
$sigSessionNow = fbs_gateway_sign($secret, $tsNow, 'merchant_session', $bodySession);
list($cSessNow,) = fbs_gateway_dispatch('merchant_session', $bodySession, $tsNow, $sigSessionNow, $ctx);
$sigBindOld = fbs_gateway_sign($secret, $tsOld, 'merchant_bind', $bodyBind);
list($cBindOld,) = fbs_gateway_dispatch('merchant_bind', $bodyBind, $tsOld, $sigBindOld, $ctx);

$codeOf = function ($p) { return (isset($p['error']) && isset($p['error']['code'])) ? $p['error']['code'] : null; };
echo json_encode(array(
  'cSessOld' => $cSessOld, 'cSessNow' => $cSessNow, 'cBindOld' => $cBindOld,
  'codeSessNow' => $codeOf(fbs_gateway_ok()), 'codeBindOldCode' => 'CONFIG_MISSING',
)), "\\n";
`;
  const r = spawnSync(
    'docker',
    ['run', '--rm', '-i', '-v', `${ROOT}:/app`, '-w', '/app', 'php:8.2-cli', 'php'],
    { input: harness, encoding: 'utf8' },
  );
  assert.strictEqual(r.status, 0, `php harness 退出码 ${r.status}\nstdout: ${r.stdout}\nstderr: ${r.stderr}`);
  const out = JSON.parse(r.stdout);
  assert.strictEqual(out.cSessOld, 401, 'merchant_session 走紧窗 ±15s：20 秒前的签名必须 401');
  assert.notStrictEqual(out.cSessNow, 401, 'merchant_session 窗内签名通过（业务层因注入的 config_missing 报 500）');
  assert.notStrictEqual(out.cBindOld, 401, 'merchant_bind 维持宽窗 ±300s：20 秒前的签名不得 401');
});

// ---- 源码约束（不需要 docker，永远真跑）----

test('源码约束：白名单/紧窗/显式 return 四处注册齐全，且显式分支在 issue_session 兜底之前', () => {
  const src = fs.readFileSync(GATEWAY, 'utf8');
  // ① 白名单
  assert.match(src, /return array\(\s*'member_find_or_create', 'issue_session',\s*'rider_bind', 'rider_ql', 'rider_notify_url',\s*'merchant_bind', 'merchant_session',\s*\);/,
    'fbs_gateway_actions() 必须注册 merchant_bind / merchant_session');
  // ② 紧窗分类：merchant_session 并入，merchant_bind 不在
  assert.match(src, /in_array\(\$action, array\('issue_session', 'merchant_session', 'rider_ql', 'rider_notify_url'\), true\)/,
    '紧窗档必须是 issue_session / merchant_session / rider_ql / rider_notify_url');
  // ③ 显式 return 分支，且必须排在 issue_session 兜底之前（漏一支 = 商家被兜底成顾客建号）
  const bindBranch = src.indexOf("if ($action === 'merchant_bind') return fbs_gateway_action_merchant_bind($params, $context);");
  const sessionBranch = src.indexOf("if ($action === 'merchant_session') return fbs_gateway_action_merchant_session($params, $context);");
  const fallback = src.indexOf('return fbs_gateway_action_issue_session($params, $context);');
  assert.ok(bindBranch >= 0, '缺 merchant_bind 显式分支');
  assert.ok(sessionBranch >= 0, '缺 merchant_session 显式分支');
  assert.ok(bindBranch < fallback && sessionBranch < fallback, '商家两支必须排在 issue_session 兜底之前');
  // ④ 未加重放账本分支：merchant_session 与 issue_session 一样按 init_data_hash 在动作内记账
  assert.ok(!/if \(\$action === 'merchant_session'\) \{\s*\$replayDenied = fbs_gateway_replay_once_guard/.test(src),
    'merchant_session 不走 (body,ts) 账本，防重放在动作内按 init_data_hash 记');
});

test('源码约束：merchant_session 只读解析会员（绝不建号）；绑定/审计用独立表；审计 fail-closed', () => {
  const src = fs.readFileSync(GATEWAY, 'utf8');
  // ① merchant_session 的会员解析必须是 fbs_gateway_lookup_merchant_member，且不得触碰建号链
  const sessStart = src.indexOf('function fbs_gateway_action_merchant_session(');
  const sessBody = src.slice(sessStart, src.indexOf('\n}', sessStart));
  assert.match(sessBody, /fbs_gateway_lookup_merchant_member\(\$pdo, \$prefix, \$tgUserId\)/,
    'merchant_session 必须经 lookup_merchant_member 只读解析');
  assert.ok(!/fbs_gateway_resolve_member|fbs_bridge_find_or_create_member|member_find_or_create/.test(sessBody),
    'merchant_session 里不得出现任何查/建会员链路（会插 tg_<id> 空会员）');
  assert.match(sessBody, /fbs_gateway_replay_guard\(\$initDataHash, \$context\)/, 'merchant_session 必须按 init_data_hash 记账');
  assert.match(sessBody, /fbs_bridge_build_session_cookies/, 'cookie 必须复用 bridge 的权威实现');
  assert.match(sessBody, /fbs_gateway_marker_cookies/, '必须补 HN_tg 标记 cookie（nginx 注入 shim 的开关）');
  // ② lookup 函数本体：只读 fbs_merchant_map，未绑定 404
  const lookupBody = src.slice(src.indexOf('function fbs_gateway_lookup_merchant_member('), src.indexOf('\n}', src.indexOf('function fbs_gateway_lookup_merchant_member(')));
  assert.match(lookupBody, /FROM `fbs_merchant_map`/);
  assert.match(lookupBody, /MERCHANT_NOT_BOUND/);
  assert.match(lookupBody, /fbs_gateway_member_guard\(\$row\)/, 'state/is_cancellation 门禁必须复用统一实现');
  // ③ 绑定动作：表与查人
  const bindBody = src.slice(src.indexOf('function fbs_gateway_action_merchant_bind('), src.indexOf('\n}', src.indexOf('function fbs_gateway_action_merchant_bind(')));
  assert.match(bindBody, /INSERT INTO `fbs_merchant_map`/);
  assert.match(bindBody, /TG_ALREADY_BOUND/, '冲突三分支：TG 已绑别的会员');
  assert.match(bindBody, /MERCHANT_ALREADY_BOUND/, '冲突三分支：会员已被别的 TG 绑定');
  assert.match(bindBody, /MERCHANT_AMBIGUOUS/, '手机号多命中必须 409，绝不猜');
  assert.match(bindBody, /fbs_gateway_merchant_shops/, '归属校验必须走 waimai_shop_manager');
  // 归属只认 waimai_shop_manager：店铺表只允许 JOIN 出 del=0 的店，绝不允许读 s.userid（脏列）
  const shopsBody = src.slice(src.indexOf('function fbs_gateway_merchant_shops('), src.indexOf('\n}', src.indexOf('function fbs_gateway_merchant_shops(')));
  assert.match(shopsBody, /waimai_shop_manager` m/, '店铺归属的唯一权威是 waimai_shop_manager');
  assert.match(shopsBody, /JOIN `' \. \$prefix \. 'waimai_shop` s ON s\.`id` = m\.`shopid`/);
  assert.match(shopsBody, /s\.`del` = 0/, '只排除 del<>0（status=0 是「休息」不拦）');
  assert.ok(!shopsBody.includes('s.`userid`'), '不得读 waimai_shop.userid（脏列，canary 全是 1）');
  assert.ok(!/INSERT INTO [`']?fbs_member_map/.test(src), '商家分支绝不写 fbs_member_map（收银台归属底账）');
  // ④ 审计/限频 fail-closed
  assert.match(src, /merchant audit unavailable/, '审计写失败必须 fail-closed');
  assert.match(src, /merchant audit failed/, '审计写失败必须 error_log 留痕');
  assert.match(src, /merchant rate-limit count failed/, '计数失败必须 error_log 留痕');
  assert.match(src, /'conflict_merchant', 'not_found', 'no_shop', 'ambiguous', 'rate_limited', 'error'/,
    'result 取值域必须与迁移 010 的注释一致');
  // ⑤ 限频底账必须是独立表
  const rateBody = src.slice(src.indexOf('function fbs_gateway_merchant_rate_limited('), src.indexOf('\n}', src.indexOf('function fbs_gateway_merchant_rate_limited(')));
  assert.match(rateBody, /FROM fbs_merchant_audit/);
  assert.ok(!rateBody.includes('fbs_bind_audit'), '商家限频不得复用骑手审计表（列名语义不同）');
});
