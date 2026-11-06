'use strict';
// B1 补偿控制中的 PHP 侧真值测试（docker-gated）：手机号归一 + 三维度绑定限频（N5）。
//
// 为什么必须单独测：这两段逻辑（webroot/api/fbs/index.php 的 fbs_normalize_phone /
// fbs_gateway_bind_rate_limited）决定了「绑不绑得上」和「被限频锁不锁死」，Node 侧只能看到
// 网关返回的 429/200，计数与排除 rate_limited 的语义若不在这里钉住，等于没验证。
// 本机无 docker 时整组 skip（照 test/php-pod.test.js 的做法），有 docker 则真跑。
//
// 做法（移植轮 3 更新）：JS 从 index.php 里按函数名切出源码（不 include 整个文件，避免路由
// 分支 exit），拼成一次性 harness 经 stdin 交给 php:7.4-cli-alpine。限频函数移植后吃 PDO
// 预处理语句，harness 用内存桩 HarnessPdo 按 SQL 文本里的条件求值（与原 DSQL 桩同思路）——
// 生产 SQL 的阈值/窗口/exclude 语义仍逐字断言（见最后的源码约束用例），
// 不连任何真实数据库、不引入网络依赖。
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
// 按 SQL 文本里的维度条件（tg_user_id / phone / ip）与 INTERVAL 窗口在内存行集上求值。
// 限频函数的参数顺序固定是 tg → phone → ip（与 dims 数组一致），桩按出现顺序取 execute 参数。
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
  // 剥掉 PDO 类型提示（仅 harness 侧）：内存桩不是 PDO 实例，无法通过类型检查；
  // 函数体逐字保留，SQL 的阈值/窗口/exclude 语义由源码约束用例钉住。
  const fnRate = extractFunction(gatewaySrc, 'fbs_gateway_bind_rate_limited').replace('PDO $pdo', '$pdo');
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
  $r = fbs_gateway_bind_rate_limited($pdo, $s['tg'], $s['phone'], isset($s['ip']) ? $s['ip'] : '');
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

// 一次 docker 调用跑完所有断言输入（镜像拉起有成本，批量取真值再断言）
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

// 与 A1（services/api/test/rider-route.test.js）逐字节一致的 15 组 + 纯字母
const PHONE_MATRIX = [
  '09171234567', '+639171234567', '+63 917 123 4567', '+63 (917) 123-4567',
  '639171234567', '63-917-123-4567', '0917-123-4567', '0917 123 4567',
  '(0917) 123 4567', '0917.123.4567', '  09171234567  ', '0912345678',
  '09123456789', '091234567', '091234567890', 'abcdefghijk',
];

// 审计行工厂：tg/phone/ip/result/行龄（秒）
const row = (tg, phone, result, age, ip) => ({ tg, phone, result, age, ip: ip || '' });
// 默认每行 tg/phone/ip 全唯一：只测某一维度时其余维度不会被顺手撑到阈值
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

test('PHP fbs_normalize_phone：16 组输入与 Node 侧逐字节一致（+63→0、去分隔符、9/12 位与纯字母拒绝）', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const out = runHarness({ phones: PHONE_MATRIX, scenarios: [] });
  assert.deepStrictEqual(out.phones, [
    '09171234567', '09171234567', '09171234567', '09171234567',
    '09171234567', '09171234567', '09171234567', '09171234567',
    '09171234567', '09171234567', '09171234567', '0912345678',
    '09123456789', null, null, null,
  ], 'PHP 归一结果必须与 Node normalizePhone 完全一致');
});

test('PHP 限频 tg 维度 5/60s —— 已有 5 次即拒（第 6 次被拦），4 次放行', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const out = runHarness({
    phones: [],
    scenarios: [
      { name: 'tg4', tg: '777', phone: FRESH_PHONE, ip: FRESH_IP, rows: rowsOf(4, { tg: '777' }) },
      { name: 'tg5', tg: '777', phone: FRESH_PHONE, ip: FRESH_IP, rows: rowsOf(5, { tg: '777' }) },
      // 别人的 TG 不算进本 tg 的额度
      { name: 'other_tg', tg: '888', phone: FRESH_PHONE, ip: FRESH_IP, rows: rowsOf(5, { tg: '777' }) },
    ],
  });
  const byName = Object.fromEntries(out.scenarios.map((s) => [s.name, s.limited]));
  assert.strictEqual(byName.tg4, false, '已有 4 次时第 5 次应放行');
  assert.strictEqual(byName.tg5, true, '已有 5 次时第 6 次必须被限频');
  assert.strictEqual(byName.other_tg, false, '限频按 tg_user_id 维度隔离');
});

test('PHP 限频 phone 维度 3/300s —— 已有 3 次即拒（第 4 次被拦），2 次放行', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const out = runHarness({
    phones: [],
    scenarios: [
      { name: 'ph2', tg: FRESH_TG, phone: '09171234567', ip: FRESH_IP, rows: rowsOf(2, { phone: '09171234567' }) },
      { name: 'ph3', tg: FRESH_TG, phone: '09171234567', ip: FRESH_IP, rows: rowsOf(3, { phone: '09171234567' }) },
      { name: 'other_phone', tg: FRESH_TG, phone: '09171234567', ip: FRESH_IP, rows: rowsOf(3, { phone: '09178888888' }) },
    ],
  });
  const byName = Object.fromEntries(out.scenarios.map((s) => [s.name, s.limited]));
  assert.strictEqual(byName.ph2, false, '同号已有 2 次时第 3 次应放行');
  assert.strictEqual(byName.ph3, true, '同号已有 3 次时第 4 次必须被限频');
  assert.strictEqual(byName.other_phone, false, '限频按归一后手机号维度隔离');
});

// N5：ip 维度 20/300s —— 审计已落 ip 但旧实现没参与限频，tg 5/60s 挡不住慢速枚举换号
test('PHP 限频 ip 维度 20/300s —— 已有 20 次即拒（第 21 次被拦），19 次放行（N5）', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const out = runHarness({
    phones: [],
    scenarios: [
      { name: 'ip19', tg: FRESH_TG, phone: FRESH_PHONE, ip: '10.1.1.1', rows: rowsOf(19, { ip: '10.1.1.1' }) },
      { name: 'ip20', tg: FRESH_TG, phone: FRESH_PHONE, ip: '10.1.1.1', rows: rowsOf(20, { ip: '10.1.1.1' }) },
      // 换了 ip 就不受这个 ip 的额度影响（维度隔离）
      { name: 'other_ip', tg: FRESH_TG, phone: FRESH_PHONE, ip: '10.1.1.2', rows: rowsOf(20, { ip: '10.1.1.1' }) },
    ],
  });
  const byName = Object.fromEntries(out.scenarios.map((s) => [s.name, s.limited]));
  assert.strictEqual(byName.ip19, false, '同 ip 已有 19 次时第 20 次应放行');
  assert.strictEqual(byName.ip20, true, '同 ip 已有 20 次时第 21 次必须被限频（N5）');
  assert.strictEqual(byName.other_ip, false, '限频按 ip 维度隔离');
});

test('PHP 限频：result=rate_limited 的行不占额度（不会被越试越锁死）', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const out = runHarness({
    phones: [],
    scenarios: [
      { name: 'tg_all_rate_limited', tg: '777', phone: FRESH_PHONE, ip: FRESH_IP, rows: rowsOf(10, { tg: '777', result: 'rate_limited' }) },
      { name: 'phone_all_rate_limited', tg: FRESH_TG, phone: '09171234567', ip: FRESH_IP, rows: rowsOf(10, { phone: '09171234567', result: 'rate_limited' }) },
      { name: 'ip_all_rate_limited', tg: FRESH_TG, phone: FRESH_PHONE, ip: '10.2.2.2', rows: rowsOf(25, { ip: '10.2.2.2', result: 'rate_limited' }) },
      // 4 条成功 + 6 条 rate_limited：只数那 4 条，第 5 次应放行
      {
        name: 'mixed',
        tg: '779',
        phone: FRESH_PHONE,
        ip: FRESH_IP,
        rows: rowsOf(4, { tg: '779' }).concat(rowsOf(6, { tg: '779', result: 'rate_limited' })),
      },
    ],
  });
  const byName = Object.fromEntries(out.scenarios.map((s) => [s.name, s.limited]));
  assert.strictEqual(byName.tg_all_rate_limited, false, 'rate_limited 行不得计入 tg 额度');
  assert.strictEqual(byName.phone_all_rate_limited, false, 'rate_limited 行不得计入 phone 额度');
  assert.strictEqual(byName.ip_all_rate_limited, false, 'rate_limited 行不得计入 ip 额度（N5）');
  assert.strictEqual(byName.mixed, false, '4 条有效 + 6 条 rate_limited 时第 5 次仍应放行');
});

test('PHP 限频：窗口边界 —— 窗外旧行不计入（tg 60s / phone 与 ip 300s）', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const out = runHarness({
    phones: [],
    scenarios: [
      // tg：4 条 59 秒内 + 3 条 61 秒前（窗外）→ 仍放行
      {
        name: 'tg_window_ok',
        tg: '777',
        phone: FRESH_PHONE,
        ip: FRESH_IP,
        rows: rowsOf(4, { tg: '777', age: 59 }).concat(rowsOf(3, { tg: '777', age: 61 })),
      },
      // tg：5 条 59 秒内 → 拒
      { name: 'tg_window_hit', tg: '777', phone: FRESH_PHONE, ip: FRESH_IP, rows: rowsOf(5, { tg: '777', age: 59 }) },
      // phone：2 条 299 秒内 + 5 条 301 秒前（窗外）→ 放行
      {
        name: 'phone_window_ok',
        tg: FRESH_TG,
        phone: '09171234567',
        ip: FRESH_IP,
        rows: rowsOf(2, { phone: '09171234567', age: 299 }).concat(rowsOf(5, { phone: '09171234567', age: 301 })),
      },
      // ip（N5）：19 条 299 秒内 + 5 条 301 秒前 → 放行
      {
        name: 'ip_window_ok',
        tg: FRESH_TG,
        phone: FRESH_PHONE,
        ip: '10.3.3.3',
        rows: rowsOf(19, { ip: '10.3.3.3', age: 299 }).concat(rowsOf(5, { ip: '10.3.3.3', age: 301 })),
      },
    ],
  });
  const byName = Object.fromEntries(out.scenarios.map((s) => [s.name, s.limited]));
  assert.strictEqual(byName.tg_window_ok, false, '60 秒前的旧行不计入 tg 额度');
  assert.strictEqual(byName.tg_window_hit, true, '60 秒内满 5 次仍要拦');
  assert.strictEqual(byName.phone_window_ok, false, '300 秒前的旧行不计入 phone 额度');
  assert.strictEqual(byName.ip_window_ok, false, '300 秒前的旧行不计入 ip 额度（N5）');
});

test('源码约束：三维度阈值/窗口写在网关内且只排除 rate_limited；审计失败 fail-closed（N4/N5）', () => {
  const src = fs.readFileSync(GATEWAY, 'utf8');
  assert.match(src, /60, 5, 'tg'/, 'tg 维度：60 秒 5 次');
  assert.match(src, /300, 3, 'phone'/, 'phone 维度：300 秒 3 次');
  assert.match(src, /300, 20, 'ip'/, 'ip 维度：300 秒 20 次（N5）');
  assert.match(src, /`result` != 'rate_limited'/, '必须排除 rate_limited 行，否则被拦一次会越试越锁死');
  assert.match(src, /AUDIT_UNAVAILABLE/, '审计/计数底账不可用必须 fail-closed（N4），不能静默放行');
  assert.match(src, /bind audit failed/, '审计写失败必须 error_log 留痕（N4）');
  assert.match(src, /bind rate-limit count failed/, '计数失败必须 error_log 留痕（N4）');
  // N6：并发双插撞键也要落审计（result=error）
  assert.match(src, /'error'/, '最终失败分支必须落 result=error 审计行（N6）');
});
