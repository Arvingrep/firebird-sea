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
$ctx = array(
  'bot_token' => $secret,
  'pdo' => $pdo,
  'db_prefix' => 'huoniao_',
  'replay_dir' => sys_get_temp_dir() . '/fbs-staff-replay-' . getmypid(),
  'now' => $now,
  'config' => array('cookiePath' => '/', 'cookieDomain' => '', 'cookiePre' => 'HN_', 'onlinetime' => 100, 'httpSecureAccess' => 1),
);
list($code, $payload, $cookies) = fbs_staff_landing_handle($initData, $ctx);
echo json_encode(array('code' => $code, 'payload' => $payload, 'cookies' => $cookies)), "\\n";
`;

function runStaffHarness(mode, fixture) {
  const r = spawnSync(
    'docker',
    ['run', '--rm', '-i', '-v', `${ROOT}:/app`, '-w', '/app',
     '-e', `HARNESS_MODE=${mode}`, '-e', `HARNESS_FIXTURE=${JSON.stringify(fixture)}`,
     'php:8.2-cli', 'php'],
    { input: HARNESS, encoding: 'utf8' },
  );
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

test('行为：正常绑定 → 200 success + Set-Cookie + redirect=/member?action=workPlatform', (t) => {
  if (!hasDocker()) return t.skip('docker 不可用');
  const out = runStaffHarness('valid', {
    map: [{ tg: '555001', member: 42, sid: 1, staff: 7 }],
    staff: [{ id: 7, sid: 1 }],
    member: [{ id: 42, password: 'a'.repeat(47), state: 1 }],
  });
  assert.strictEqual(out.code, 200);
  assert.strictEqual(out.payload.success, true);
  assert.strictEqual(out.payload.data.redirect, '/member?action=workPlatform');
  assert.ok(out.cookies.length >= 2, '至少签出 HN_login_user + HN_userid 两条 Cookie');
  const joined = out.cookies.join('\n');
  assert.match(joined, /HN_login_user=/);
  assert.match(joined, /HN_userid=42/);
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
