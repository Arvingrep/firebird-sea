'use strict';
// 员工绑定 PHP 侧真值测试（docker-gated，照 php-merchant-bind.test.js 的夹具模式）：
//   ① 三维度限频（底账 fbs_staff_audit；tg 5/60s、phone 3/300s、ip 20/300s、排除 rate_limited）
//   ② dispatch 级行为：token 验证先行（非法 token 零 DB 压力）→ 查店 → 查会员 → 幂等/冲突 →
//      限频 → 写入，全部错误码逐个钉住（staff_bind 是唯一身份来自邀请 token 的动作）
//   ③ 窗口分类行为：staff_bind 不在紧窗（±300s 内 200 秒前签名不 401）
//   ④ 源码约束：三处注册齐全（白名单 / 紧窗不动 / 显式 return）、审计 fail-closed、
//      result 取值域与迁移 012 一致、绝不写 fbs_member_map / fbs_merchant_map。
// 本机无 docker 时 ①②③ 整组 skip，④ 永远真跑。
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

// 限频桩：与 php-merchant-bind.test.js 同一份（按列名认维度，表名不影响匹配）
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

function buildRateHarness(gatewaySrc) {
  const fnRate = extractFunction(gatewaySrc, 'fbs_gateway_staff_rate_limited').replace('PDO $pdo', '$pdo');
  return `<?php
error_reporting(E_ALL & ~E_DEPRECATED);
${PDO_STUB}
${fnRate}
$in = json_decode(getenv('HARNESS_INPUT'), true);
if (!is_array($in)) { fwrite(STDERR, 'bad input'); exit(2); }
$out = array('scenarios' => array());
foreach ($in['scenarios'] as $s) {
  $pdo = new HarnessPdo($s['rows']);
  $r = fbs_gateway_staff_rate_limited($pdo, $s['tg'], $s['phone'], isset($s['ip']) ? $s['ip'] : '');
  $out['scenarios'][] = array('name' => $s['name'], 'limited' => $r['limited'], 'error' => $r['error'] !== null);
}
echo json_encode($out);
`;
}

// dispatch 级 harness：真 PDO 桩（instanceof PDO 门禁）+ 规则表路由 SQL。
// 规则 [正则, 行为]：{mode:'rows'|'count'} 返回 canned 结果；'throw' 抛异常（第 4 元素是异常 code）；
// 其余 SQL 记录到 log 并成功。未命中任何规则 → 抛异常暴露 harness 盲区。
// token 占位：params.token 填 'sid1' / 'expired' / 'tampered_sid' 时由 harness 替换为
// 真实生成/手签的 token（真实 key 读 fbird.inc.php，docker 内挂载 /app）。
const DISPATCH_HARNESS = `<?php
error_reporting(E_ALL & ~E_DEPRECATED);
define('FBS_GATEWAY_TEST', true);
require '/app/webroot/api/fbs/index.php';

class RuleStmt {
  public $sql; public $rule; public $args = array();
  public function __construct($sql, $rule) { $this->sql = $sql; $this->rule = $rule; }
  public function execute($args) { $this->args = $args; return true; }
  public function fetch($mode = null) {
    if ($this->rule['mode'] !== 'rows') return false;
    return count($this->rule['rows']) > 0 ? $this->rule['rows'][0] : false;
  }
  public function fetchAll($mode = null) {
    return ($this->rule['mode'] === 'rows') ? $this->rule['rows'] : array();
  }
  public function fetchColumn($col = 0) {
    return isset($this->rule['count']) ? (string)$this->rule['count'] : '0';
  }
}
class RulePdo extends PDO {
  public $rules = array();
  public $log = array();
  public function __construct($rules) { $this->rules = $rules; }
  public function prepare($sql, $options = null) {
    foreach ($this->rules as $rule) {
      if (preg_match($rule[0], $sql) === 1) {
        if ($rule[1] === 'throw') {
          throw new RuntimeException($rule[2], isset($rule[3]) ? (int)$rule[3] : 0);
        }
        $this->log[] = $sql;
        return new RuleStmt($sql, $rule[1]);
      }
    }
    throw new RuntimeException('unexpected sql in harness: ' . $sql);
  }
  public function lastInsertId($name = null) { return '55'; }
}

$in = json_decode(getenv('HARNESS_INPUT'), true);
if (!is_array($in)) { fwrite(STDERR, 'bad input'); exit(2); }

$secret = 'test-secret-123';
$now = time();

// token 池：sid1=有效（真实 key 走 fbird.inc.php）；expired=手签过期；tampered_sid=改 sid 沿用旧签名
$tokens = array();
$tokens['sid1'] = fbs_staff_invite_token(1, 86400);
$key = fbs_staff_invite_bridge_token();
$expPast = time() - 100;
$payloadPast = 'v1_1_' . $expPast;
$tokens['expired'] = $payloadPast . '_' . substr(hash_hmac('sha256', $payloadPast, $key), 0, 32);
$tokens['tampered_sid'] = preg_replace('/^v1_1_/', 'v1_2_', $tokens['sid1']);

foreach ($in['cases'] as $i => $c) {
  $t = isset($c['params']['token']) ? (string)$c['params']['token'] : '';
  if (isset($tokens[$t])) { $in['cases'][$i]['params']['token'] = $tokens[$t]; }
}

$out = array('cases' => array());
foreach ($in['cases'] as $c) {
  $pdo = new RulePdo(isset($c['rules']) ? $c['rules'] : array());
  $body = json_encode(array('action' => 'staff_bind', 'params' => $c['params']));
  $ts = (string)($now - (isset($c['tsOffset']) ? $c['tsOffset'] : 0));
  $sig = fbs_gateway_sign($secret, $ts, 'staff_bind', $body);
  $ctx = array('secret' => $secret, 'pdo' => $pdo, 'db_prefix' => 'huoniao_');
  list($code, $payload) = fbs_gateway_dispatch('staff_bind', $body, $ts, $sig, $ctx);
  $codeOf = function ($p) { return (isset($p['error']) && isset($p['error']['code'])) ? $p['error']['code'] : null; };
  $out['cases'][] = array(
    'name' => $c['name'],
    'http' => $code,
    'error' => $codeOf($payload),
    'data' => isset($payload['data']) ? $payload['data'] : null,
    'sqlCount' => count($pdo->log),
    'insertedStaff' => count(preg_grep('/INSERT INTO .huoniao_staff./', $pdo->log)) > 0,
    'insertedMap' => count(preg_grep('/INSERT INTO .fbs_staff_map./', $pdo->log)) > 0,
    'updatedMap' => count(preg_grep('/UPDATE .fbs_staff_map./', $pdo->log)) > 0,
    'auditInserted' => count(preg_grep('/INSERT INTO fbs_staff_audit/', $pdo->log)) > 0,
  );
}

echo json_encode($out);
`;

function runPhpHarness(harness, payload) {
  const r = spawnSync(
    'docker',
    ['run', '--rm', '-i', '-e', `HARNESS_INPUT=${JSON.stringify(payload)}`, '-v', `${ROOT}:/app`, '-w', '/app', PHP_IMAGE, 'php'],
    { input: harness, encoding: 'utf8' },
  );
  assert.strictEqual(r.status, 0, `php harness 退出码 ${r.status}\nstdout: ${r.stdout}\nstderr: ${r.stderr}`);
  try {
    return JSON.parse(r.stdout);
  } catch (e) {
    throw new Error(`harness 输出不是 JSON：${r.stdout}\nstderr: ${r.stderr}`);
  }
}

let dockerReady = null;
function hasDocker() {
  if (dockerReady === null) {
    dockerReady = spawnSync('docker', ['info'], { stdio: 'ignore' }).status === 0;
  }
  return dockerReady;
}

// ---- 规则构造器：按 SQL 形态给出 canned 结果 ----

const R_SHOP = (row) => [`/FROM .huoniao_business_list. WHERE .id. = \\?/`, row ? { mode: 'rows', rows: [row] } : { mode: 'rows', rows: [] }];
const R_MEMBERS = (rows) => [`/FROM .huoniao_member. WHERE REPLACE/`, { mode: 'rows', rows }];
const R_STAFF = (rows) => [`/FROM .huoniao_staff. WHERE .uid. = \\?/`, { mode: 'rows', rows }];
const R_MAP_TG = (row) => [`/FROM .fbs_staff_map. WHERE .tg_user_id. = \\? LIMIT 1/`, row ? { mode: 'rows', rows: [row] } : { mode: 'rows', rows: [] }];
const R_MAP_MEMBER = (row) => [`/FROM .fbs_staff_map. WHERE .member_id. = \\? AND .tg_user_id. != \\?/`, row ? { mode: 'rows', rows: [row] } : { mode: 'rows', rows: [] }];
const R_RATE = (n) => [`/SELECT COUNT(.*) AS .c. FROM fbs_staff_audit/`, { mode: 'count', count: n }];
const R_AUDIT_OK = [`/INSERT INTO fbs_staff_audit/`, { mode: 'rows', rows: [] }];
const R_MAP_UPDATE = [`/UPDATE .fbs_staff_map. SET .phone./`, { mode: 'rows', rows: [] }];
const R_AUDIT_THROW = [`/INSERT INTO fbs_staff_audit/`, 'throw', 'table fbs_staff_audit does not exist', 0];
const R_STAFF_INSERT_OK = [`/INSERT INTO .huoniao_staff./`, { mode: 'rows', rows: [] }];
const R_MAP_INSERT = (errCode) => errCode === undefined
  ? [`/INSERT INTO .fbs_staff_map./`, { mode: 'rows', rows: [] }]
  : [`/INSERT INTO .fbs_staff_map./`, 'throw', 'SQLSTATE[23000]', errCode];

const SHOP_OK = { id: 1, title: '川香阁·马尼拉中餐厅' };
const member = (id, mtype, state) => ({ id, password: 'pw' + id, state: state === undefined ? 1 : state, is_cancellation: 0, mtype: mtype === undefined ? 1 : mtype, phone: '09171000001' });
const FRESH_PHONE = '09171000001';

// 限频矩阵行集（与 php-merchant-bind.test.js 同一份）
const row = (tg, phone, result, age, ip) => ({ tg, phone, result, age, ip: ip || '' });
const rowsOf = (n, opts = {}) => Array.from({ length: n }, (_, i) => row(
  opts.tg !== undefined ? opts.tg : `777000${i}`,
  opts.phone !== undefined ? opts.phone : `0917100000${i}`,
  opts.result || 'success',
  opts.age === undefined ? 10 : opts.age,
  opts.ip,
));
const FRESH_TG = '999999';
const FRESH_IP = '10.9.9.9';

test('PHP 员工限频 tg 维度 5/60s —— 满 5 拒、4 放；phone 3/300s；ip 20/300s；rate_limited 不占额度', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const harness = buildRateHarness(fs.readFileSync(GATEWAY, 'utf8'));
  const out = runPhpHarness(harness, {
    scenarios: [
      { name: 'tg4', tg: '777', phone: '09179999999', ip: FRESH_IP, rows: rowsOf(4, { tg: '777' }) },
      { name: 'tg5', tg: '777', phone: '09179999999', ip: FRESH_IP, rows: rowsOf(5, { tg: '777' }) },
      { name: 'other_tg', tg: '888', phone: '09179999999', ip: FRESH_IP, rows: rowsOf(5, { tg: '777' }) },
      { name: 'ph2', tg: FRESH_TG, phone: '09178889999', ip: FRESH_IP, rows: rowsOf(2, { phone: '09178889999' }) },
      { name: 'ph3', tg: FRESH_TG, phone: '09178889999', ip: FRESH_IP, rows: rowsOf(3, { phone: '09178889999' }) },
      { name: 'tg_all_rate_limited', tg: '779', phone: '09179999999', ip: FRESH_IP, rows: rowsOf(10, { tg: '779', result: 'rate_limited' }) },
      { name: 'ip20', tg: FRESH_TG, phone: '09179999999', ip: '10.1.1.1', rows: rowsOf(20, { ip: '10.1.1.1' }) },
      { name: 'ip19', tg: FRESH_TG, phone: '09179999999', ip: '10.1.1.2', rows: rowsOf(19, { ip: '10.1.1.2' }) },
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

test('PHP 员工限频：窗口边界（tg 60s / phone 与 ip 300s，窗外旧行不计入）', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const harness = buildRateHarness(fs.readFileSync(GATEWAY, 'utf8'));
  const out = runPhpHarness(harness, {
    scenarios: [
      {
        name: 'tg_window_ok',
        tg: '777', phone: '09179999999', ip: FRESH_IP,
        rows: rowsOf(4, { tg: '777', age: 59 }).concat(rowsOf(3, { tg: '777', age: 61 })),
      },
      { name: 'tg_window_hit', tg: '777', phone: '09179999999', ip: FRESH_IP, rows: rowsOf(5, { tg: '777', age: 59 }) },
      {
        name: 'phone_window_ok',
        tg: FRESH_TG, phone: '09178889999', ip: FRESH_IP,
        rows: rowsOf(2, { phone: '09178889999', age: 299 }).concat(rowsOf(5, { phone: '09178889999', age: 301 })),
      },
    ],
  });
  const byName = Object.fromEntries(out.scenarios.map((s) => [s.name, s.limited]));
  assert.strictEqual(byName.tg_window_ok, false, '60 秒前的旧行不计入 tg 额度');
  assert.strictEqual(byName.tg_window_hit, true, '60 秒内满 5 次仍要拦');
  assert.strictEqual(byName.phone_window_ok, false, '300 秒前的旧行不计入 phone 额度');
});

// ---- dispatch 级行为（需要整个 index.php + 真 PDO 桩）----

// token 取值：'sid1'=harness 生成的有效 token；'expired'/'tampered_sid'=harness 手签的坏 token；
// 其余原样透传（'' / 乱串）。params 默认 base：tg_user_id/phone/ip。
const BASE_PARAMS = () => ({ tg_user_id: '999999', phone: FRESH_PHONE, ip: '1.2.3.4' });
const CASES = [
  // token 层（在任何 DB 操作之前）
  {
    name: 'token_missing', params: { ...BASE_PARAMS(), token: '' }, rules: [],
    expectHttp: 400, expectCode: 'MISSING_PARAM', expectSqlCount: 0, note: '缺 token 直接 400，不碰 DB',
  },
  {
    name: 'token_garbage', params: { ...BASE_PARAMS(), token: 'v1_1_1794361000_deadbeef' }, rules: [],
    expectHttp: 403, expectCode: 'STAFF_INVITE_INVALID', expectSqlCount: 0, note: '签名/格式错 → 403，零 DB 查询（先算签再查库）',
  },
  {
    name: 'token_tampered_sid', token: 'tampered_sid', rules: [],
    expectHttp: 403, expectCode: 'STAFF_INVITE_INVALID', expectSqlCount: 0, note: '改 sid 沿用 A 店签名 → 403，零 DB 查询',
  },
  {
    name: 'token_expired', token: 'expired', rules: [],
    expectHttp: 403, expectCode: 'STAFF_INVITE_INVALID', expectSqlCount: 0, note: '过期 token → 403，零 DB 查询',
  },
  // 店铺层
  {
    name: 'shop_not_found', rules: [R_SHOP(null), R_AUDIT_OK],
    expectHttp: 404, expectCode: 'STAFF_SHOP_NOT_FOUND', expectAudit: true, note: 'sid 不存在 → 404 + 审计 no_shop',
  },
  // 会员层
  {
    name: 'member_not_found', rules: [R_SHOP(SHOP_OK), R_MEMBERS([]), R_AUDIT_OK],
    expectHttp: 404, expectCode: 'STAFF_NOT_FOUND', expectAudit: true, note: '手机号归一后无会员 → 404',
  },
  {
    name: 'member_ambiguous', rules: [R_SHOP(SHOP_OK), R_MEMBERS([member(7), member(8)]), R_AUDIT_OK],
    expectHttp: 409, expectCode: 'STAFF_AMBIGUOUS', expectAudit: true, note: '同号多会员命中 → 409 绝不猜',
  },
  {
    name: 'member_is_business', rules: [R_SHOP(SHOP_OK), R_MEMBERS([member(7, 2)]), R_AUDIT_OK],
    expectHttp: 403, expectCode: 'STAFF_IS_BUSINESS', expectAudit: true, note: '商家本人 mtype=2 → 403',
  },
  {
    name: 'member_disabled', rules: [R_SHOP(SHOP_OK), R_MEMBERS([member(7, 1, 0)]), R_AUDIT_OK],
    expectHttp: 403, expectCode: 'MEMBER_DISABLED', expectAudit: true, note: 'state=0 → 403（审计归并 not_found）',
  },
  // staff 行层
  {
    name: 'staff_row_other_shop', rules: [R_SHOP(SHOP_OK), R_MEMBERS([member(7)]), R_STAFF([{ id: 55, sid: 9 }]), R_AUDIT_OK],
    expectHttp: 409, expectCode: 'STAFF_AMBIGUOUS', expectAudit: true, note: '会员已有员工行指向别店 → 409',
  },
  // map 层
  {
    name: 'tg_bound_other_shop', rules: [R_SHOP(SHOP_OK), R_MEMBERS([member(7)]), R_STAFF([]), R_MAP_TG({ member_id: 7, sid: 2, staff_id: 55 }), R_MAP_MEMBER(null), R_AUDIT_OK],
    expectHttp: 409, expectCode: 'STAFF_ALREADY_BOUND', expectAudit: true, note: '该 TG 已绑到别的 sid → 409',
  },
  {
    name: 'member_bound_by_other_tg', rules: [R_SHOP(SHOP_OK), R_MEMBERS([member(7)]), R_STAFF([]), R_MAP_TG(null), R_MAP_MEMBER({ tg_user_id: '888' }), R_AUDIT_OK],
    expectHttp: 409, expectCode: 'STAFF_ALREADY_BOUND', expectAudit: true, note: '该会员已被别的 TG 绑定 → 409',
  },
  // 幂等与成功
  {
    name: 'same_shop_idempotent', rules: [R_SHOP(SHOP_OK), R_MEMBERS([member(7)]), R_STAFF([]), R_MAP_TG({ member_id: 7, sid: 1, staff_id: 55 }), R_MAP_MEMBER(null), R_MAP_UPDATE, R_RATE(0), R_AUDIT_OK],
    expectHttp: 200, expectCode: null, expectData: { staff_id: 55, sid: 1, title: SHOP_OK.title, idempotent: true }, expectUpdatedMap: true, expectNoInsert: true, note: '同店重复 → 200 幂等（只刷 phone，不插行）',
  },
  {
    name: 'staff_row_same_shop_reuse', rules: [R_SHOP(SHOP_OK), R_MEMBERS([member(7)]), R_STAFF([{ id: 55, sid: 1 }]), R_MAP_TG(null), R_MAP_MEMBER(null), R_RATE(0), R_STAFF_INSERT_OK, R_MAP_INSERT(), R_AUDIT_OK],
    expectHttp: 200, expectCode: null, expectData: { staff_id: 55, sid: 1, title: SHOP_OK.title }, expectInsertedMap: true, expectNoStaffInsert: true, note: '微信通道已有同店员工行 → 复用 staff_id=55，不重复插 staff',
  },
  {
    name: 'fresh_success', rules: [R_SHOP(SHOP_OK), R_MEMBERS([member(7)]), R_STAFF([]), R_MAP_TG(null), R_MAP_MEMBER(null), R_RATE(0), R_STAFF_INSERT_OK, R_MAP_INSERT(), R_AUDIT_OK],
    expectHttp: 200, expectCode: null, expectInsertedStaff: true, expectInsertedMap: true, expectAudit: true, note: '全新绑定 → 200（staff 插行 + map 插行 + 审计 success）',
  },
  // 冲突与失败终态
  {
    name: 'map_insert_duplicate', rules: [R_SHOP(SHOP_OK), R_MEMBERS([member(7)]), R_STAFF([]), R_MAP_TG(null), R_MAP_MEMBER(null), R_RATE(0), R_STAFF_INSERT_OK, R_MAP_INSERT(23000), R_AUDIT_OK],
    expectHttp: 409, expectCode: 'STAFF_ALREADY_BOUND', expectAudit: true, note: '并发撞唯一键 → 409 按冲突返回，别吞异常',
  },
  {
    name: 'map_insert_other_error', rules: [R_SHOP(SHOP_OK), R_MEMBERS([member(7)]), R_STAFF([]), R_MAP_TG(null), R_MAP_MEMBER(null), R_RATE(0), R_STAFF_INSERT_OK, R_MAP_INSERT(99999), R_AUDIT_OK],
    expectHttp: 500, expectCode: 'BIND_FAILED', expectAudit: true, note: '非唯一键错误 → 500 BIND_FAILED',
  },
  // 限频
  {
    name: 'rate_limited', rules: [R_SHOP(SHOP_OK), R_MEMBERS([member(7)]), R_STAFF([]), R_MAP_TG(null), R_MAP_MEMBER(null), R_RATE(5), R_AUDIT_OK],
    expectHttp: 429, expectCode: 'BIND_RATE_LIMITED', expectAudit: true, note: '满 5 次 → 429（审计 rate_limited）',
  },
  // fail-closed
  {
    name: 'audit_missing_503', rules: [R_SHOP(null), R_AUDIT_THROW],
    expectHttp: 503, expectCode: 'AUDIT_UNAVAILABLE', note: '审计表不存在 → 503 fail-closed（宁拒勿漏）',
  },
  {
    name: 'rate_count_throw_503',
    rules: [R_SHOP(SHOP_OK), R_MEMBERS([member(7)]), R_STAFF([]), R_MAP_TG(null), R_MAP_MEMBER(null),
      [`/SELECT COUNT(.*) AS .c. FROM fbs_staff_audit/`, 'throw', 'table missing', 0]],
    expectHttp: 503, expectCode: 'AUDIT_UNAVAILABLE', note: '限频计数读失败 → 503 fail-closed',
  },
];

test('dispatch 级行为：staff_bind 全部错误码与幂等/写入路径逐个钉住', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const payload = {
    cases: CASES.map((c) => {
      // token 三级：c.token（harness 池键）→ c.params.token（缺 token / 乱串用例）→ 默认有效 token
      const token = c.token !== undefined ? c.token
        : (c.params && c.params.token !== undefined ? c.params.token : 'sid1');
      return { name: c.name, params: Object.assign(BASE_PARAMS(), c.params || {}, { token }), rules: c.rules };
    }),
  };
  const out = runPhpHarness(DISPATCH_HARNESS, payload);
  const byName = Object.fromEntries(out.cases.map((c) => [c.name, c]));
  for (const c of CASES) {
    const r = byName[c.name];
    assert.ok(r, `case ${c.name} 必须有结果`);
    assert.strictEqual(r.http, c.expectHttp, `[${c.name}] ${c.note} → HTTP ${c.expectHttp}（实际 ${r.http}）`);
    assert.strictEqual(r.error, c.expectCode, `[${c.name}] 错误码必须 ${c.expectCode}（实际 ${r.error}）`);
    if (c.expectSqlCount !== undefined) {
      assert.strictEqual(r.sqlCount, c.expectSqlCount, `[${c.name}] 非法 token 不得产生任何 DB 压力`);
    }
    if (c.expectAudit) {
      assert.strictEqual(r.auditInserted, true, `[${c.name}] 终态必须落审计行`);
    }
    if (c.expectInsertedStaff) assert.strictEqual(r.insertedStaff, true, `[${c.name}] 必须插 huoniao_staff`);
    if (c.expectNoStaffInsert) assert.strictEqual(r.insertedStaff, false, `[${c.name}] 不得重复插 huoniao_staff`);
    if (c.expectInsertedMap) assert.strictEqual(r.insertedMap, true, `[${c.name}] 必须写 fbs_staff_map`);
    if (c.expectUpdatedMap) assert.strictEqual(r.updatedMap, true, `[${c.name}] 幂等路径必须 UPDATE fbs_staff_map`);
    if (c.expectNoInsert) {
      assert.strictEqual(r.insertedStaff, false, `[${c.name}] 幂等路径不得插 staff`);
      assert.strictEqual(r.insertedMap, false, `[${c.name}] 幂等路径不得插 map`);
    }
    if (c.expectData) {
      assert.deepStrictEqual(r.data, c.expectData, `[${c.name}] 成功 data 必须是 ${JSON.stringify(c.expectData)}`);
    }
  }
});

test('dispatch 级行为：staff_bind 不在紧窗——200 秒前签名不 401，400 秒前才 401', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const rules = [R_SHOP(null), R_AUDIT_OK]; // 业务层快速失败为 404，只要不是 401 就证明走了宽窗
  const out = runPhpHarness(DISPATCH_HARNESS, {
    cases: [
      { name: 'wide_200s', params: { ...BASE_PARAMS(), token: 'sid1' }, rules, tsOffset: 200 },
      { name: 'expired_400s', params: { ...BASE_PARAMS(), token: 'sid1' }, rules, tsOffset: 400 },
    ],
  });
  const byName = Object.fromEntries(out.cases.map((c) => [c.name, c]));
  assert.strictEqual(byName.wide_200s.http, 404, 'staff_bind 与 rider_bind/merchant_bind 同档 ±300s：200 秒前签名不得 401');
  assert.strictEqual(byName.expired_400s.http, 401, '超 ±300s 仍要 401');
});

// ---- 源码约束（不需要 docker，永远真跑）----

test('源码约束：三处注册齐全——白名单加 staff_bind、紧窗列表不含 staff_bind、显式 return 在 issue_session 兜底之前', () => {
  const src = fs.readFileSync(GATEWAY, 'utf8');
  // ① 白名单
  assert.match(src, /'merchant_bind', 'merchant_session',\s*'staff_bind',\s*\);/,
    'fbs_gateway_actions() 必须注册 staff_bind');
  // ② 紧窗列表：staff_bind 绝不进紧窗（它不签任何凭证，走 ±300s 宽窗）
  assert.match(src, /in_array\(\$action, array\('issue_session', 'merchant_session', 'rider_ql', 'rider_notify_url'\), true\)/,
    '紧窗档必须仍是 issue_session / merchant_session / rider_ql / rider_notify_url，staff_bind 不得加入');
  // ③ 显式 return 分支，且必须排在 issue_session 兜底之前（漏一支 = 员工被兜底成顾客建号，致命）
  const staffBranch = src.indexOf("if ($action === 'staff_bind') return fbs_gateway_action_staff_bind($params, $context);");
  const fallback = src.indexOf('return fbs_gateway_action_issue_session($params, $context);');
  assert.ok(staffBranch >= 0, '缺 staff_bind 显式分支');
  assert.ok(staffBranch < fallback, 'staff_bind 显式分支必须排在 issue_session 兜底之前');
});

test('源码约束：审计 fail-closed、表与取值域、底账独立、绝不写 fbs_member_map / fbs_merchant_map', () => {
  const src = fs.readFileSync(GATEWAY, 'utf8');
  // ① fail-closed
  assert.match(src, /staff audit unavailable/, '审计写失败必须 fail-closed');
  assert.match(src, /staff audit failed/, '审计写失败必须 error_log 留痕');
  assert.match(src, /staff rate-limit count failed/, '计数失败必须 error_log 留痕');
  // ② result 取值域与迁移 012 注释一致（9 类）
  assert.match(src, /'success', 'invalid_token', 'no_shop', 'not_found', 'is_business', 'already_bound', 'ambiguous', 'rate_limited', 'error'/,
    'result 取值域必须与 migrations/012 的注释一致');
  // ③ 限频底账独立表
  const rateBody = src.slice(src.indexOf('function fbs_gateway_staff_rate_limited('), src.indexOf('\n}', src.indexOf('function fbs_gateway_staff_rate_limited(')));
  assert.match(rateBody, /FROM fbs_staff_audit/);
  assert.ok(!rateBody.includes('fbs_bind_audit') && !rateBody.includes('fbs_merchant_audit'), '员工限频不得复用骑手/商家审计表');
  // ④ 员工分支绝不写 fbs_member_map / fbs_merchant_map
  const staffBody = src.slice(src.indexOf('function fbs_gateway_action_staff_bind('), src.indexOf('\n}', src.indexOf('function fbs_gateway_action_staff_bind(')));
  assert.match(staffBody, /INSERT INTO `fbs_staff_map`/);
  assert.match(staffBody, /STAFF_ALREADY_BOUND/, '跨店冲突必须 409');
  assert.match(staffBody, /STAFF_AMBIGUOUS/, '多命中/别店员工必须 409');
  assert.match(staffBody, /STAFF_IS_BUSINESS/, '商家本人必须 403');
  assert.match(staffBody, /fbs_normalize_phone/, '手机号归一必须走统一实现');
  assert.ok(!staffBody.includes('fbs_member_map'), '员工分支绝不写 fbs_member_map（收银台归属底账）');
  assert.ok(!staffBody.includes('fbs_merchant_map'), '员工分支绝不写 fbs_merchant_map');
  // ⑤ ip 不回落 Pod IP：空串统一取 tg_user_id，不得调用 fbs_bridge_client_ip
  assert.ok(!staffBody.includes('fbs_bridge_client_ip'), 'staff_bind 的 ip 绝不回落 fbs_bridge_client_ip()');
  // ⑥ 邀请函数复用纯函数库，token 校验在 DB 连接之前
  assert.match(staffBody, /fbs_staff_invite_parse\(/, 'token 校验必须走冻结契约函数');
  const body = src.slice(src.indexOf('function fbs_gateway_action_staff_bind('));
  const tokenParsePos = body.indexOf('fbs_staff_invite_parse(');
  const connectPos = body.indexOf('fbs_gateway_connect(');
  assert.ok(tokenParsePos < connectPos, '必须先算签（token 校验）再做任何 DB 操作');
});
