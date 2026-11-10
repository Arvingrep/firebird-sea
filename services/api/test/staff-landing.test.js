'use strict';
// 员工 TG 落地页（webroot/tg/staff.php）+ 商家后台 staffInvite 入口的测试：
//   ① 行为：staff.php POST 主流程（验签/防重放/绑定底账/复核/签 Cookie）——docker-gated，
//      照 php-merchant-bind.test.js 的夹具模式（本机无 docker 整组 skip）；
//   ② 源码约束：不引 common.inc.php、先钉 FBS_BRIDGE_TEST 再 require bridge、无表单无 GET 参数、
//      staffInvite 分支注册在 addStaff 旁、模板/脚本接线齐全、package.json 收录 —— 永远真跑。
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..', '..', '..');
const STAFF_PHP = path.join(ROOT, 'webroot', 'tg', 'staff.php');
const CONTROLLER = path.join(ROOT, 'webroot', 'api', 'handlers', 'member.controller.php');
const TOUCH_TPL = path.join(ROOT, 'webroot', 'templates', 'member', 'company', 'touch', 'business-staff.html');
const DESKTOP_TPL = path.join(ROOT, 'webroot', 'templates', 'member', 'company', 'business-staff.html');
const TOUCH_JS = path.join(ROOT, 'webroot', 'templates', 'member', 'company', 'touch', 'js', 'business-staff.js');
const DESKTOP_JS = path.join(ROOT, 'webroot', 'templates', 'member', 'company', 'js', 'staff.js');
const PKG = path.join(ROOT, 'services', 'api', 'package.json');

// ---- ① 行为用例（docker-gated）----

let dockerReady = null;
function hasDocker() {
  if (dockerReady === null) {
    dockerReady = spawnSync('docker', ['info'], { stdio: 'ignore' }).status === 0;
  }
  return dockerReady;
}

const HARNESS = `<?php
error_reporting(E_ALL & ~E_DEPRECATED);

// staff.php 的 HTTP 入口用 FBS_STAFF_TEST 钉住；
// FBS_BRIDGE_TEST 由 staff.php 在 require bridge.php 之前自己 define（这正是被测行为之一），勿重复定义
define('FBS_STAFF_TEST', true);
require '/app/webroot/tg/staff.php';

function harness_build_init_data(array $pairs, $secret) {
  $used = array();
  foreach ($pairs as $k => $v) { if ($k !== 'hash') $used[$k] = $v; }
  ksort($used, SORT_STRING);
  $lines = array();
  foreach ($used as $k => $v) { $lines[] = $k . '=' . $v; }
  $secretKey = hash_hmac('sha256', $secret, 'WebAppData', true);
  $pairs['hash'] = hash_hmac('sha256', implode("\\n", $lines), $secretKey);
  $out = array();
  foreach ($pairs as $k => $v) { $out[] = rawurlencode($k) . '=' . rawurlencode($v); }
  return implode('&', $out);
}

class StaffHarnessStmt {
  public $sql; public $map; public $staff; public $member; public $row = null;
  public function __construct($sql, $fix) {
    $this->sql = $sql; $this->map = $fix['map']; $this->staff = $fix['staff']; $this->member = $fix['member'];
  }
  public function execute($args) {
    $this->row = null;
    if (preg_match('/FROM \`fbs_staff_map\`/', $this->sql)) {
      foreach ($this->map as $r) {
        if ((string)$r['tg'] === (string)$args[0]) {
          $this->row = array('tg_user_id' => $r['tg'], 'member_id' => $r['member'], 'sid' => $r['sid'], 'staff_id' => $r['staff']);
          break;
        }
      }
    } elseif (preg_match('/FROM \`huoniao_staff\`/', $this->sql)) {
      foreach ($this->staff as $r) {
        if ((int)$r['id'] === (int)$args[0]) { $this->row = array('id' => $r['id'], 'sid' => $r['sid']); break; }
      }
    } elseif (preg_match('/FROM \`huoniao_member\`/', $this->sql)) {
      foreach ($this->member as $r) {
        if ((int)$r['id'] === (int)$args[0]) {
          $this->row = array('id' => $r['id'], 'username' => 'tg_555001', 'password' => $r['password'], 'state' => (int)$r['state']);
          break;
        }
      }
    }
    return true;
  }
  public function fetch($mode = null) { return $this->row; }
}
class StaffHarnessPdo {
  public $fix;
  public function __construct($fix) { $this->fix = $fix; }
  public function prepare($sql) { return new StaffHarnessStmt($sql, $this->fix); }
}

$secret = 'test-secret-123';
$now = 1794361000;
$mode = getenv('HARNESS_MODE');
$fix = json_decode(getenv('HARNESS_FIXTURE'), true);

$pairs = array('auth_date' => (string)$now, 'query_id' => 'AAF', 'user' => '{"id":555001}');
if ($mode === 'expired') { $pairs['auth_date'] = (string)($now - 4000); }
$initData = harness_build_init_data($pairs, $secret);
if ($mode === 'tampered') { $initData = substr($initData, 0, -3) . 'zzz'; }

$pdo = new StaffHarnessPdo($fix);

// 站点配置夹具：刻意**不含** $cfg_cookieDomain —— 复现 canary baked 模式实况
// （data/ emptyDir + 新版火鸟缓存永远不会有 $cfg_cookieDomain），cookieDomain 只能靠 env 兜底
$cfgFile = sys_get_temp_dir() . '/fbs-staff-cfg-' . getmypid() . '.php';
file_put_contents($cfgFile, "<?php\\n\\$cfg_cookiePath='/';\\n\\$cfg_onlinetime=100;\\n\\$cfg_httpSecureAccess=1;\\n");

$ctx = array(
  'bot_token' => $secret,
  'pdo' => $pdo,
  'db_prefix' => 'huoniao_',
  'replay_dir' => sys_get_temp_dir() . '/fbs-staff-replay-' . getmypid(),
  'now' => $now,
  // 站点配置走 fail-closed strict 解析的测试注入口：夹具文件**不含** $cfg_cookieDomain，
  // cookieDomain 一律由 env FBS_GATEWAY_COOKIE_DOMAIN（docker -e 注入）兜底，复现 canary 实况
  'config_file' => $cfgFile,
);
list($code, $payload, $cookies) = fbs_staff_landing_handle($initData, $ctx);
echo json_encode(array('code' => $code, 'payload' => $payload, 'cookies' => $cookies)), "\\n";
`;

function runStaffHarness(mode, fixture, opts) {
  const env = ['run', '--rm', '-i', '-v', `${ROOT}:/app`, '-w', '/app',
   '-e', `HARNESS_MODE=${mode}`, '-e', `HARNESS_FIXTURE=${JSON.stringify(fixture)}`];
  if (opts && opts.envDomain) env.push('-e', `FBS_GATEWAY_COOKIE_DOMAIN=${opts.envDomain}`);
  env.push('php:8.2-cli', 'php');
  const r = spawnSync('docker', env, { input: HARNESS, encoding: 'utf8' });
  assert.strictEqual(r.status, 0, `php harness 退出码 ${r.status}\nstdout: ${r.stdout}\nstderr: ${r.stderr}`);
  try {
    return JSON.parse(r.stdout);
  } catch (e) {
    throw new Error(`harness 输出不是 JSON：${r.stdout}\nstderr: ${r.stderr}`);
  }
}

const errCode = (out) => (out.payload && out.payload.error && out.payload.error.code) || null;

test('行为：非法（篡改）initData → 401 INIT_DATA_INVALID', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const out = runStaffHarness('tampered', { map: [], staff: [], member: [] });
  assert.strictEqual(out.code, 401);
  assert.strictEqual(errCode(out), 'INIT_DATA_INVALID');
  assert.deepStrictEqual(out.cookies, [], '错误响应绝不带登录态');
});

test('行为：过期 initData（4000s 前）→ 401 INIT_DATA_EXPIRED', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const out = runStaffHarness('expired', { map: [], staff: [], member: [] });
  assert.strictEqual(out.code, 401);
  assert.strictEqual(errCode(out), 'INIT_DATA_EXPIRED');
  assert.deepStrictEqual(out.cookies, [], '错误响应绝不带登录态');
});

test('行为：fbs_staff_map 无行 → 200 STAFF_NOT_BOUND（未绑定 tg）', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const out = runStaffHarness('valid', { map: [], staff: [], member: [] });
  assert.strictEqual(out.code, 200);
  assert.strictEqual(out.payload.success, false);
  assert.strictEqual(errCode(out), 'STAFF_NOT_BOUND');
  assert.deepStrictEqual(out.cookies, []);
});

test('行为：huoniao_staff 行已被删 → 200 STAFF_NOT_BOUND', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const out = runStaffHarness('valid', {
    map: [{ tg: '555001', member: 42, sid: 1, staff: 7 }],
    staff: [],   // staff 行已删
    member: [{ id: 42, password: 'abc', state: 1 }],
  });
  assert.strictEqual(out.code, 200);
  assert.strictEqual(errCode(out), 'STAFF_NOT_BOUND');
});

test('行为：huoniao_staff 行仍在但 sid 变了 → 200 STAFF_NOT_BOUND', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const out = runStaffHarness('valid', {
    map: [{ tg: '555001', member: 42, sid: 1, staff: 7 }],
    staff: [{ id: 7, sid: 2 }],
    member: [{ id: 42, password: 'abc', state: 1 }],
  });
  assert.strictEqual(out.code, 200);
  assert.strictEqual(errCode(out), 'STAFF_NOT_BOUND');
});

test('行为：会员 state != 1 → 200 MEMBER_DISABLED', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const out = runStaffHarness('valid', {
    map: [{ tg: '555001', member: 42, sid: 1, staff: 7 }],
    staff: [{ id: 7, sid: 1 }],
    member: [{ id: 42, password: 'abc', state: 0 }],
  });
  assert.strictEqual(out.code, 200);
  assert.strictEqual(errCode(out), 'MEMBER_DISABLED');
});

test('行为：正常绑定 → 200 success + Set-Cookie（domain + www 双份）+ redirect=/member?action=workPlatform', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const out = runStaffHarness('valid', {
    map: [{ tg: '555001', member: 42, sid: 1, staff: 7 }],
    staff: [{ id: 7, sid: 1 }],
    member: [{ id: 42, password: 'a'.repeat(47), state: 1 }],
  }, { envDomain: 'stafftest.example' });
  assert.strictEqual(out.code, 200);
  assert.strictEqual(out.payload.success, true);
  assert.strictEqual(out.payload.data.redirect, '/member?action=workPlatform');
  const joined = out.cookies.join('\n');
  assert.match(joined, /HN_login_user=/);
  assert.match(joined, /HN_userid=42/);
  // merchant_session 同款：cookieDomain 非空时 build_session_cookies 发 domain + www.<domain> 双份
  const doms = out.cookies.map((c) => (c.match(/; domain=([^;]+)/) || [])[1] || '');
  assert.deepStrictEqual(doms, ['stafftest.example', 'stafftest.example', 'www.stafftest.example', 'www.stafftest.example'],
    '必须与 merchant_session 同款：domain=<d> 与 domain=www.<d> 各两条（login_user + userid），顺序一致');
});

test('行为：cache 缺 cookieDomain 且 env 未设置 → 500 CONFIG_MISSING 且零 Set-Cookie（fail-closed）', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const out = runStaffHarness('valid', {
    map: [{ tg: '555001', member: 42, sid: 1, staff: 7 }],
    staff: [{ id: 7, sid: 1 }],
    member: [{ id: 42, password: 'a'.repeat(47), state: 1 }],
  });  // 不注入 FBS_GATEWAY_COOKIE_DOMAIN
  assert.strictEqual(out.code, 500);
  assert.strictEqual(errCode(out), 'CONFIG_MISSING');
  assert.match(out.payload.error.message, /FBS_GATEWAY_COOKIE_DOMAIN/, '错误消息必须带 env 变量名（与网关一致）');
  assert.deepStrictEqual(out.cookies, [], '绝不签 Cookie：绝不静默回落 host-only');
});

// ---- ①b 网关平价：staff.php 与 merchant_session 的配置解析/Cookie 发射同源 ----

// 从 index.php 摘函数源码（照 php-merchant-bind.test.js 的引号感知花括号配对）
function extractFunction(src, name) {
  const start = src.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `找不到 function ${name}()，测试需同步更新`);
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

const GATEWAY = path.join(ROOT, 'webroot', 'api', 'fbs', 'index.php');

const PARITY_HARNESS = `<?php
error_reporting(E_ALL & ~E_DEPRECATED);
// 整个网关以测试模式载入（内含 require bridge.php），fbs_bridge_build_session_cookies 随之可用
define('FBS_GATEWAY_TEST', true);
define('FBS_BRIDGE_TEST', true);
define('FBS_GATEWAY_SITE_CONFIG_FILE', '/tmp/fbs-parity-cfg.php');
require '/app/webroot/api/fbs/index.php';

// 场景复现 canary：cache 缺 $cfg_cookieDomain，env FBS_GATEWAY_COOKIE_DOMAIN 兜底
file_put_contents('/tmp/fbs-parity-cfg.php', "<?php\\n\\$cfg_cookiePath='/';\\n\\$cfg_onlinetime=100;\\n\\$cfg_httpSecureAccess=1;\\n");

list($cfgGw, $errGw) = fbs_gateway_load_site_config(array());
list($cfgBr, $errBr) = fbs_bridge_site_config_strict(array('config_file' => '/tmp/fbs-parity-cfg.php'));

$now = 1794361000;
$pw = str_repeat('a', 47);
$cGw = ($cfgGw !== null) ? fbs_bridge_build_session_cookies(42, $pw, $cfgGw, $now) : array();
$cBr = ($cfgBr !== null) ? fbs_bridge_build_session_cookies(42, $pw, $cfgBr, $now) : array();
echo json_encode(array(
  'errGw' => $errGw, 'errBr' => $errBr,
  'cfgGw' => $cfgGw, 'cfgBr' => $cfgBr,
  'cGw' => $cGw, 'cBr' => $cBr,
)), "\\n";
`;

test('平价：同一 env 场景下 fbs_bridge_site_config_strict 与网关 fbs_gateway_load_site_config 的 cookieDomain 相等，Cookie 发射条数/domain 属性集完全一致', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const r = spawnSync(
    'docker',
    ['run', '--rm', '-i', '-v', `${ROOT}:/app`, '-w', '/app',
     '-e', 'FBS_GATEWAY_COOKIE_DOMAIN=parity.example',
     'php:8.2-cli', 'php'],
    { input: PARITY_HARNESS, encoding: 'utf8' },
  );
  assert.strictEqual(r.status, 0, `php harness 退出码 ${r.status}\nstdout: ${r.stdout}\nstderr: ${r.stderr}`);
  const out = JSON.parse(r.stdout);
  assert.strictEqual(out.errGw, null, '网关侧解析应成功');
  assert.strictEqual(out.errBr, null, 'bridge strict 侧解析应成功');
  assert.strictEqual(out.cfgBr.cookieDomain, out.cfgGw.cookieDomain,
    'cookieDomain 必须与 merchant_session 的解析结果逐字节相等');
  // 三项非强制项同口径：cache 有就沿用，缺就火鸟默认值
  assert.strictEqual(out.cfgBr.cookiePath, out.cfgGw.cookiePath);
  assert.strictEqual(out.cfgBr.onlinetime, out.cfgGw.onlinetime);
  assert.strictEqual(out.cfgBr.httpSecureAccess, out.cfgGw.httpSecureAccess);
  assert.strictEqual(out.cfgBr.cookiePre, out.cfgGw.cookiePre);
  // Cookie 发射平价：条数、Cookie 名序列、domain 属性集合逐一对齐（值因 RenrenCrypt 随机 IV 可不同）
  assert.strictEqual(out.cBr.length, out.cGw.length, 'Set-Cookie 条数必须与 merchant 完全一致');
  const attrsOf = (c) => {
    const parts = c.split(';').map((s) => s.trim());
    const name = parts[0].split('=')[0];
    const rest = parts.slice(1).sort();
    return { name, rest };
  };
  out.cGw.forEach((c, i) => {
    const a = attrsOf(c);
    const b = attrsOf(out.cBr[i]);
    assert.strictEqual(b.name, a.name, `第 ${i + 1} 条 Cookie 名必须一致`);
    assert.deepStrictEqual(b.rest, a.rest, `第 ${i + 1} 条 Cookie 属性（path/domain/secure/SameSite/expires）必须与 merchant 完全一致`);
  });
});

test('平价：cache 与 env 都拿不到 cookieDomain 时，strict 与网关同报 CONFIG_MISSING（错误串一致）', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const r = spawnSync(
    'docker',
    // 关键：容器里不注入 FBS_GATEWAY_COOKIE_DOMAIN（docker run 默认不继承宿主机 env）
    ['run', '--rm', '-i', '-v', `${ROOT}:/app`, '-w', '/app',
     '--env', 'FBS_PARITY_NO_ENV=1', 'php:8.2-cli', 'php'],
    { input: PARITY_HARNESS, encoding: 'utf8' },
  );
  assert.strictEqual(r.status, 0, `php harness 退出码 ${r.status}\nstdout: ${r.stdout}\nstderr: ${r.stderr}`);
  const out = JSON.parse(r.stdout);
  assert.strictEqual(out.cfgGw, null);
  assert.strictEqual(out.cfgBr, null);
  assert.strictEqual(out.errGw.code, 'CONFIG_MISSING');
  assert.strictEqual(out.errBr.code, 'CONFIG_MISSING');
  assert.strictEqual(out.errBr.message, out.errGw.message, '错误消息（含 env 变量名提示）必须与网关逐字一致');
  assert.deepStrictEqual(out.cGw, []);
  assert.deepStrictEqual(out.cBr, []);
});

// ---- ② 源码约束（不需要 docker，永远真跑）----

test('源码约束：staff.php 只依赖 bridge.php，且先钉 FBS_BRIDGE_TEST 再 require', () => {
  const src = fs.readFileSync(STAFF_PHP, 'utf8');
  assert.ok(src.includes("require_once __DIR__ . '/../api/fbs/bridge.php';"),
    '必须 require bridge.php（自包含函数库）');
  assert.ok(!/\b(?:include|require)(?:_once)?\b[^;\n]*common\.inc\.php/.test(src),
    '绝不 include common.inc.php（swoole_loader + PHP 7.4 强耦合，同 entry.php:12-14）');
  const defineAt = src.indexOf("define('FBS_BRIDGE_TEST', true);");
  const requireAt = src.indexOf("require_once __DIR__ . '/../api/fbs/bridge.php';");
  assert.ok(defineAt >= 0 && requireAt >= 0 && defineAt < requireAt,
    'FBS_BRIDGE_TEST 必须先于 require 定义，否则 require bridge.php 会直接跑顾客 HTTP 入口');
  // MAX_AUTH_AGE 3600 由 bridge 的 fbs_bridge_check_freshness 内置，本页必须走它而不是自搓时限
  assert.ok(src.includes('fbs_bridge_check_freshness('), '时效校验必须复用 bridge 实现（3600s）');
  assert.ok(src.includes('fbs_bridge_replay_check('), '防重放必须复用 bridge 文件锁计数器');
});

test('源码约束：GET 壳零表单、initData 只 POST JSON、不进 URL/localStorage', () => {
  const src = fs.readFileSync(STAFF_PHP, 'utf8');
  assert.ok(!/<form[\s>]/i.test(src), 'GET 壳不得渲染任何表单');
  assert.ok(!/name\s*=\s*["']sid["']/i.test(src), '不得出现任何 sid 表单字段');
  assert.ok(!/\$_GET/.test(src), '不接受任何 GET 参数（含改 sid）');
  assert.ok(!/localStorage\.(get|set|remove)Item|window\.localStorage|sessionStorage/.test(src),
    'initData 不进 localStorage');
  assert.ok(src.includes("JSON.stringify({ initData: initData })"), 'initData 只走 POST JSON 体');
  assert.ok(src.includes("fetch(location.pathname"), 'POST 回本页同一路径');
  assert.ok(src.includes('telegram-web-app.js'), 'GET 壳必须引 telegram-web-app.js');
  assert.ok(src.includes("header('Cache-Control: no-store'"), '响应头 no-store');
  assert.ok(src.includes('X-Content-Type-Options: nosniff') && src.includes('Referrer-Policy: no-referrer'));
  assert.ok(src.includes('$_SERVER[\'REQUEST_METHOD\'] === \'POST\''), '同文件 GET=HTML 壳 / POST=JSON 接口');
});

test('源码约束：查询一律参数化，fbs_staff_map 查库/复核 staff 行/state 门禁齐全', () => {
  const src = fs.readFileSync(STAFF_PHP, 'utf8');
  assert.ok(src.includes("execute(array((string)$tgUserId))"), 'tg_user_id 走绑定参数');
  assert.ok(src.includes('FROM `fbs_staff_map`'), '读 fbs_staff_map 底账');
  assert.match(src, /FROM `' \. \$prefix \. 'staff`/, '用 staff_id 复核 huoniao_staff 行');
  assert.ok(/FROM `' \. \$prefix \. 'member`/.test(src), '用 member_id 取 huoniao_member');
  assert.ok(src.includes("state'] !== 1"), 'state 门禁（MEMBER_DISABLED）');
  assert.ok(src.includes("fbs_bridge_build_session_cookies("), '会话 Cookie 复用 bridge 权威实现');
  assert.ok(src.includes("'/member?action=workPlatform'"), 'redirect 指向员工工作台');
});

test('源码约束：配置解析走 fail-closed strict（与网关同口径），绝不静默回落 host-only', () => {
  const src = fs.readFileSync(STAFF_PHP, 'utf8');
  const bridge = fs.readFileSync(path.join(ROOT, 'webroot', 'api', 'fbs', 'bridge.php'), 'utf8');
  // 剥掉 PHP 注释后再比对，避免被「注释里点名坏例」误伤
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  assert.ok(code.includes('fbs_bridge_site_config_strict('), 'staff.php 必须走 strict 版站点配置解析');
  assert.ok(!/fbs_bridge_load_site_config\(/.test(code),
    'staff.php 不得调用静默回落版 fbs_bridge_load_site_config()（cookieDomain 缺失时会发 host-only）');
  assert.ok(bridge.includes('function fbs_bridge_load_site_config('),
    'bridge.php 原有 fbs_bridge_load_site_config() 必须保留（别的调用方还在用）');
  const strictBody = bridge.slice(
    bridge.indexOf('function fbs_bridge_site_config_strict('),
    bridge.indexOf('\n}', bridge.indexOf('function fbs_bridge_site_config_strict(')),
  );
  assert.match(strictBody, /FBS_GATEWAY_COOKIE_DOMAIN/, 'env 兜底变量名必须与网关同一处（chart 同源注入）');
  assert.match(strictBody, /CONFIG_MISSING/, '两级都拿不到必须 fail-closed');
  assert.ok(src.includes("return $fail($cfgError['code'], $cfgError['message'], 500);"),
    '配置缺失必须 500 且绝不签 Cookie');
});

test('源码约束：member.controller.php 注册 staffInvite（鉴权 + NO_SHOP + NOT_READY 降级）', () => {
  const src = fs.readFileSync(CONTROLLER, 'utf8');
  const addStaffAt = src.indexOf("if ($action == 'addStaff')");
  const inviteAt = src.indexOf("} elseif ($action == 'staffInvite')");
  const workAt = src.indexOf("} elseif ($action == 'workPlatform')");
  assert.ok(inviteAt >= 0, '缺 staffInvite 分支');
  assert.ok(addStaffAt >= 0 && inviteAt > addStaffAt && workAt > inviteAt,
    'staffInvite 必须紧跟 addStaff、在 workPlatform 之前');
  const branch = src.slice(inviteAt, workAt);
  assert.match(branch, /checkUserIsLogin\(\)/, '鉴权复用 $userLogin->checkUserIsLogin()（同 workPlatform）');
  assert.match(branch, /userType['"]?\]?\s*!=\s*2/, '非商家（userType!=2）→ FORBIDDEN');
  assert.match(branch, /FORBIDDEN/);
  assert.match(branch, /NO_SHOP/);
  assert.match(branch, /#@__business_list/, '查店铺照 addStaff 的 $dsql 风格');
  assert.match(branch, /fbs_staff_invite\.func\.php/, 'require A 线冻结签名文件');
  assert.match(branch, /NOT_READY/, 'A 线未落地时 NOT_READY 降级，绝不 fatal');
  assert.match(branch, /function_exists\('fbs_staff_invite_link'\)/);
});

test('源码约束：两张模板 + 两个脚本接线齐全，桌面版脚本确认是 js/staff.js', () => {
  for (const tpl of [TOUCH_TPL, DESKTOP_TPL]) {
    const src = fs.readFileSync(tpl, 'utf8');
    assert.ok(src.includes('id="tgInviteBox"'), `${path.basename(tpl)} 缺 Telegram 邀请卡片`);
    assert.ok(src.includes('class="tgCodeImg"'), `${path.basename(tpl)} 缺二维码容器`);
    assert.match(src, /staffInviteUrl\s*=\s*'\{#getUrlPath service="member" action="staffInvite"#}'/,
      `${path.basename(tpl)} 缺 staffInviteUrl smarty 请求地址`);
    assert.ok(src.includes('jquery.qrcode.min.js'), `${path.basename(tpl)} 必须继续加载现成 qrcode 库`);
    assert.ok(src.includes('class="codeImg"'), `${path.basename(tpl)} 原有微信二维码卡片必须保持原样`);
  }
  // 桌面版页面引用的脚本：staff.js（模板 :87 引用），TG 逻辑必须落在它里面
  assert.match(fs.readFileSync(DESKTOP_TPL, 'utf8'), /js\/staff\.js/, '桌面版引用 js/staff.js');
  const djs = fs.readFileSync(DESKTOP_JS, 'utf8');
  assert.ok(djs.includes('tgInviteBox') && djs.includes('tgCodeImg'), '桌面版 staff.js 缺 TG 渲染逻辑');
  assert.ok(djs.includes('.qrcode('), '桌面版复用现成 qrcode 实现');
  const tjs = fs.readFileSync(TOUCH_JS, 'utf8');
  assert.ok(tjs.includes('tgInviteBox') && tjs.includes('tgCodeImg'), '触屏版 business-staff.js 缺 TG 渲染逻辑');
});

test('源码约束：package.json test 清单收录 staff-landing.test.js', () => {
  const pkg = JSON.parse(fs.readFileSync(PKG, 'utf8'));
  assert.ok(pkg.scripts && pkg.scripts.test && pkg.scripts.test.includes('test/staff-landing.test.js'),
    'npm test 必须包含本文件');
});
