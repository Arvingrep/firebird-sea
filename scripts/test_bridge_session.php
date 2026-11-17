<?php
/**
 * bridge.php 登录桥会话签发测试脚本（task-003 · 测试工程师 Tess）
 *
 * 运行（宿主机无 PHP 时用 Docker）：
 *   docker run --rm -v "$PWD":/app -w /app php:7.4-cli php scripts/test_bridge_session.php
 *
 * 覆盖：T1 Cookie 属性 / T2 加解密兼容 / T3 查建会员 / T4 重定向防护 /
 *       T5 回归（test_bridge_verify.php）/ T6 顺序与安全 / KNOWN-RISK 并发双插
 *
 * 子模式（由主进程自动以子进程方式调用，勿手工执行）：
 *   --sub=crypt-encrypt|crypt-encrypt-orig|crypt-decrypt   跨类加解密兼容性
 *   --sub=dbinfo-missing                                   dbinfo 缺失 → config_missing
 */

$SUB = isset($argv[1]) ? $argv[1] : '';

/* ---------- 共享夹具（不依赖被测代码） ---------- */
$TEST_TOKEN = '123456:TEST-FAKE-BOT-TOKEN';

function make_init_data($token, $overrides = array())
{
    $user = isset($overrides['user'])
        ? $overrides['user']
        : json_encode(array('id' => 777, 'first_name' => 'Test', 'username' => 'tester'));
    unset($overrides['user']);

    $fields = array_merge(array(
        'auth_date' => (string)time(),
        'query_id'  => 'AAG-testquery',
        'signature' => 'fake_signature_field_should_participate',
        'user'      => $user,
    ), $overrides);

    $dcs = fbs_bridge_build_data_check_string($fields);
    $secret = fbs_bridge_make_secret($token);
    $fields['hash'] = hash_hmac('sha256', $dcs, $secret);

    $parts = array();
    foreach ($fields as $k => $v) {
        $parts[] = rawurlencode($k) . '=' . rawurlencode($v);
    }
    return implode('&', $parts);
}

/* ---------- 跨类加解密子模式（先于 bridge.php 加载原版类） ---------- */
if ($SUB === '--sub=crypt-encrypt-orig' || $SUB === '--sub=crypt-decrypt') {
    define('HUONIAOINC', __DIR__ . '/../webroot/include'); // 过 charset.class.php 的防非法引用门
    require __DIR__ . '/../webroot/include/class/charset.class.php';
    $crypt = new RenrenCrypt();
    if ($SUB === '--sub=crypt-encrypt-orig') {
        echo $crypt->php_encrypt($argv[2]);
    } else {
        echo $crypt->php_decrypt($argv[2]);
    }
    exit(0);
}

/* ---------- 主模式与剩余子模式：加载被测代码 ---------- */
define('FBS_BRIDGE_TEST', true);
putenv('FBS_TG_BOT_TOKEN=' . $TEST_TOKEN);
$REPLAY_DIR = sys_get_temp_dir() . '/fbs_bridge_session_test_' . getmypid();
define('FBS_BRIDGE_REPLAY_DIR', $REPLAY_DIR);

require __DIR__ . '/../webroot/api/fbs/bridge.php';

if ($SUB === '--sub=crypt-encrypt') {
    echo (new RenrenCrypt())->php_encrypt($argv[2]);
    exit(0);
}

if ($SUB === '--sub=dbinfo-missing') {
    define('FBS_BRIDGE_DBINFO_FILE', sys_get_temp_dir() . '/no-such-dbinfo-' . getmypid() . '.inc.php');
    list($http, $payload, $cookies) = fbs_bridge_handle_request(
        make_init_data($TEST_TOKEN, array('query_id' => 'sub-dbinfo-missing')),
        array('issue' => true)
    );
    printf("sub dbinfo-missing: http=%d payload=%s cookies=%d\n",
        $http, json_encode($payload), count($cookies));
    exit(($http === 500 && $payload['error'] === 'config_missing' && count($cookies) === 0) ? 0 : 1);
}

/* ================================================================
 *                        主 测 试 套 件
 * ================================================================ */

$PASS = 0; $FAIL = 0; $KNOWN = 0;
$FAILURES = array();

function check($name, $cond, $detail = '')
{
    global $PASS, $FAIL, $FAILURES;
    if ($cond) {
        $PASS++;
        printf("[PASS]  %s\n", $name);
    } else {
        $FAIL++;
        $FAILURES[] = $name . ($detail !== '' ? "  ||  " . $detail : '');
        printf("[FAIL]  %s  %s\n", $name, $detail);
    }
}

function known_risk($name, $evidence)
{
    global $KNOWN;
    $KNOWN++;
    printf("[KNOWN-RISK]  %s  %s\n", $name, $evidence);
}

/** 从 Set-Cookie 值部分拆出 [name, value]，value 到第一个 ';' 为止 */
function parse_cookie($header)
{
    $eq = strpos($header, '=');
    $semi = strpos($header, ';');
    return array(substr($header, 0, $eq), substr($header, $eq + 1, $semi - $eq - 1));
}

/** 从本进程（bridge 的 renrencrypt.php）解出 Cookie 里的 login_user 明文 */
function decrypt_login_user($cookieValue)
{
    $inner = base64_decode(urldecode($cookieValue));
    return (new RenrenCrypt())->php_decrypt($inner);
}

function run_subprocess($args)
{
    $cmd = 'php ' . escapeshellarg(__FILE__) . ' ' . $args . ' 2>&1';
    $out = array();
    $rc = 0;
    exec($cmd, $out, $rc);
    return array(trim(implode("\n", $out)), $rc);
}

$NOW  = 1700000000;                       // 固定时间戳，便于断言 expires/Max-Age
$PWD47 = 'saltsalt' . str_repeat('p', 39); // 模拟 member.password 列（47 字符）
if (strlen($PWD47) !== 47) die("fixture password length wrong\n");

printf("==== T1 Cookie 属性（fbs_bridge_build_session_cookies） ====\n");

$cfgSecure = array(
    'cookiePre' => 'HN_', 'cookiePath' => '/', 'cookieDomain' => 'fbird.men',
    'onlinetime' => 100, 'httpSecureAccess' => 1,
);
$h = fbs_bridge_build_session_cookies(42, $PWD47, $cfgSecure, $NOW);

check('T1 secure+域名: 共 4 条 Set-Cookie（2 cookie × 2 域名）', count($h) === 4,
    'actual=' . count($h) . ' headers=' . json_encode($h));

$lu = array_values(array_filter($h, function ($x) { return strpos($x, 'HN_login_user=') === 0; }));
$ui = array_values(array_filter($h, function ($x) { return strpos($x, 'HN_userid=') === 0; }));
check('T1 Cookie 名称: HN_login_user 与 HN_userid 各 2 条', count($lu) === 2 && count($ui) === 2,
    'lu=' . count($lu) . ' ui=' . count($ui));

$luBad = array();
foreach ($lu as $c) {
    if (strpos($c, '; path=/') === false)              $luBad[] = 'path missing';
    if (strpos($c, '; domain=fbird.men') === false
        && strpos($c, '; domain=www.fbird.men') === false) $luBad[] = 'domain missing';
    if (stripos($c, 'httponly') !== false)             $luBad[] = 'HttpOnly 出现（原生 login_user 非 HttpOnly）';
    if (strpos($c, '; secure') === false)              $luBad[] = 'secure missing';
    if (strpos($c, '; SameSite=None') === false)       $luBad[] = 'SameSite=None missing';
}
check('T1 secure=1: path=/ + 双域名 + secure + SameSite=None + 无 HttpOnly', count($luBad) === 0,
    json_encode($luBad));

check('T1 有效期: Max-Age=onlinetime*3600=360000',
    strpos($lu[0], '; Max-Age=360000') !== false, 'header=' . $lu[0]);
$expectExpires = gmdate('D, d M Y H:i:s', $NOW + 360000) . ' GMT';
check('T1 有效期: expires 与 Max-Age 对应的 GMT 串',
    strpos($lu[0], '; expires=' . $expectExpires) !== false,
    'expect=' . $expectExpires . ' header=' . $lu[0]);

/* Cookie 值 = base64(php_encrypt(x)) 双重编码；解密侧须先剥一层 base64 再 php_decrypt */
check('T1 HN_userid 为明文会员 id', parse_cookie($ui[0])[1] === '42', $ui[0]);
check('T1 HN_userid 属性与 login_user 一致（path/domain/secure/SameSite）',
    strpos($ui[0], '; path=/') !== false && strpos($ui[0], '; secure') !== false
    && strpos($ui[0], '; SameSite=None') !== false);

/* httpSecureAccess=0 */
$cfgInsecure = $cfgSecure; $cfgInsecure['httpSecureAccess'] = 0;
$hi = fbs_bridge_build_session_cookies(42, $PWD47, $cfgInsecure, $NOW);
$badInsecure = array();
foreach ($hi as $c) {
    if (strpos($c, '; secure') !== false)   $badInsecure[] = 'secure 出现';
    if (strpos($c, 'SameSite=') !== false)  $badInsecure[] = 'SameSite 出现';
    if (strpos($c, 'Lax') !== false)        $badInsecure[] = 'Lax 出现';
    if (strpos($c, 'Strict') !== false)     $badInsecure[] = 'Strict 出现';
}
check('T1 secure=0: 无 secure/无 SameSite（也不得出现 Lax/Strict），共 4 条',
    count($badInsecure) === 0 && count($hi) === 4, json_encode($badInsecure));

/* cookieDomain 为空 → host-only */
$cfgNoDom = $cfgSecure; $cfgNoDom['cookieDomain'] = '';
$hd = fbs_bridge_build_session_cookies(42, $PWD47, $cfgNoDom, $NOW);
$badNoDom = array();
foreach ($hd as $c) {
    if (strpos($c, 'domain=') !== false) $badNoDom[] = 'domain= 出现';
    if (strpos($c, 'www.') !== false)    $badNoDom[] = 'www. 半截域名出现';
}
check('T1 cookieDomain=\'\': 2 条 host-only，无 domain= 属性、无 www. 残片',
    count($hd) === 2 && count($badNoDom) === 0, json_encode($hd));

/* 域名本身含 www. → 不再叠加第二份 */
$cfgWww = $cfgSecure; $cfgWww['cookieDomain'] = 'www.fbird.men';
$hw = fbs_bridge_build_session_cookies(42, $PWD47, $cfgWww, $NOW);
check('T1 cookieDomain=www.fbird.men: 2 条且域名不重复叠加',
    count($hw) === 2 && strpos($hw[0], '; domain=www.fbird.men') !== false
    && strpos($hw[0], '; domain=fbird.men;') === false, json_encode($hw));

printf("\n==== T2 加解密兼容（renrencrypt.php vs 原版 charset.class.php） ====\n");

/* 2.1 自解密往返：剥外层 base64 → php_decrypt（与 getMemberID 解密侧同构） */
$token = base64_encode((new RenrenCrypt())->php_encrypt('42&' . $PWD47));
check('T2 自解密往返: base64_decode + php_decrypt === "<id>&<password>"',
    (new RenrenCrypt())->php_decrypt(base64_decode($token)) === '42&' . $PWD47);

/* 2.2 Cookie 值双重 base64（与 keepUser 一致） */
list($uname, $uval) = parse_cookie($lu[0]);
$inner = base64_decode(urldecode($uval), true);
check('T2 双重 base64: urldecode 后是一次合法 base64（内层密文）', $inner !== false,
    'cookieValue=' . $uval);
check('T2 双重 base64: 内层仍是合法 base64（php_encrypt 输出）',
    $inner !== false && base64_decode($inner, true) !== false);
check('T2 双重 base64: Cookie 值解两层 + php_decrypt 还原为 "<id>&<password>"',
    $inner !== false && decrypt_login_user($uval) === '42&' . $PWD47);

/* 2.3 跨类兼容：bridge 加密 → 原版解密；原版加密 → bridge 解密
 *     说明：php_encrypt 每次用 md5(rand()) 作随机密钥，密文本就不确定，
 *     "同输入字节一致"在算法设计上不可能，兼容性的正确判据是互解。 */
list($cipherB, $rcB) = run_subprocess('--sub=crypt-encrypt ' . escapeshellarg('42&' . $PWD47));
list($decO, $rcO)    = run_subprocess('--sub=crypt-decrypt ' . escapeshellarg($cipherB));
check('T2 跨类: 原版 charset.class.php 可解 bridge 产物',
    $rcB === 0 && $rcO === 0 && $decO === '42&' . $PWD47, "cipherB=$cipherB decO=$decO");

list($cipherO, $rcBO) = run_subprocess('--sub=crypt-encrypt-orig ' . escapeshellarg('42&' . $PWD47));
$decBridge = (new RenrenCrypt())->php_decrypt($cipherO);
check('T2 跨类: bridge 副本可解原版产物',
    $rcBO === 0 && $decBridge === '42&' . $PWD47, "cipherO=$cipherO decBridge=$decBridge");

printf("\n==== T3 查/建会员（SQLite PDO 注入） ====\n");

function make_sqlite($path = null)
{
    $pdo = new PDO('sqlite:' . ($path !== null ? $path : ':memory:'));
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec('CREATE TABLE IF NOT EXISTS `huoniao_member` (
        `id` INTEGER PRIMARY KEY AUTOINCREMENT,
        `mtype` INTEGER, `username` TEXT, `password` VARCHAR(47), `nickname` VARCHAR(36),
        `emailCheck` INTEGER, `phoneCheck` INTEGER, `sex` INTEGER, `photo` VARCHAR(100),
        `regtime` INTEGER, `logincount` INTEGER, `lastlogintime` INTEGER,
        `lastloginip` VARCHAR(15), `regip` VARCHAR(15), `state` INTEGER,
        `regfrom` VARCHAR(20), `online` INTEGER
    )');
    return $pdo;
}

function member_count(PDO $pdo, $prefix = 'huoniao_')
{
    return (int)$pdo->query('SELECT COUNT(*) FROM `' . $prefix . 'member`')->fetchColumn();
}

function issue_opts(PDO $pdo, array $extra = array())
{
    /* 注入显式站点配置：Docker 环境无 data/cache/config.php，默认 cookieDomain='' 会退化为
     * host-only 2 条 Cookie；这里对齐生产预期（fbird.men 双域名）来断言 4 条。 */
    $extra['context'] = array_merge(array(
        'pdo'       => $pdo,
        'db_prefix' => 'huoniao_',
        'ip'        => '1.2.3.4',
        'config'    => array(
            'cookiePre' => 'HN_', 'cookiePath' => '/', 'cookieDomain' => 'fbird.men',
            'onlinetime' => 100, 'httpSecureAccess' => 1,
        ),
    ), isset($extra['context']) ? $extra['context'] : array());
    return array_merge(array('issue' => true), $extra);
}

$pdo3 = make_sqlite();
$id777 = make_init_data($TEST_TOKEN, array('query_id' => 't3-first'));

/* 3.1 首次签发：建会员 */
list($http, $payload, $cookies) = fbs_bridge_handle_request($id777, issue_opts($pdo3));
check('T3 首次签发: 200 且 created=1', $http === 200 && $payload['created'] === 1,
    "http=$http payload=" . json_encode($payload));
check('T3 首次签发: 下发 4 条 Cookie', count($cookies) === 4, 'count=' . count($cookies));
$row = $pdo3->query("SELECT * FROM `huoniao_member` WHERE username='tg_777'")->fetch(PDO::FETCH_ASSOC);
check('T3 建行: username=tg_777 / mtype=1 / state=1 / regfrom=telegram',
    $row && (int)$row['mtype'] === 1 && (int)$row['state'] === 1 && $row['regfrom'] === 'telegram',
    json_encode($row));
check('T3 建行: password 列 47 字符且已落库', $row && strlen($row['password']) === 47,
    'len=' . ($row ? strlen($row['password']) : 'null'));
check('T3 建行: online 已更新', $row && (int)$row['online'] > 0,
    'online=' . ($row ? $row['online'] : 'null'));

/* 3.2 Cookie 值进的是 password 列值 */
$memberId = (int)$payload['member_id'];
$luCookie = null;
foreach ($cookies as $c) {
    if (strpos($c, 'HN_login_user=') === 0) { list(, $luCookie) = parse_cookie($c); break; }
}
check('T3 Cookie 明文 = "<member_id>&<password列值>"',
    $luCookie !== null && decrypt_login_user($luCookie) === $memberId . '&' . $row['password'],
    'plain=' . decrypt_login_user((string)$luCookie));

/* 3.3 重复签发：幂等，不重复插 */
list($http2, $payload2, $cookies2) = fbs_bridge_handle_request($id777, issue_opts($pdo3));
check('T3 二次签发: created=0 且 member_id 不变且仍 1 行',
    $http2 === 200 && $payload2['created'] === 0
    && $payload2['member_id'] === $memberId && member_count($pdo3) === 1,
    json_encode($payload2) . ' rows=' . member_count($pdo3));

/* 3.4 state != 1 → 403 member_disabled 且不带 Cookie */
$pdo3->exec('UPDATE `huoniao_member` SET state=0 WHERE username=\'tg_777\'');
list($http3, $payload3, $cookies3) = fbs_bridge_handle_request(
    make_init_data($TEST_TOKEN, array('query_id' => 't3-disabled')), issue_opts($pdo3));
check('T3 state=0: 403 member_disabled 且 0 Cookie',
    $http3 === 403 && $payload3['error'] === 'member_disabled' && count($cookies3) === 0,
    "http=$http3 payload=" . json_encode($payload3));
check('T3 state=0: 错误响应不含 created/member_id',
    !isset($payload3['created']) && !isset($payload3['member_id']));
$pdo3->exec('UPDATE `huoniao_member` SET state=1 WHERE username=\'tg_777\'');

/* 3.5 SQL 注入向量：telegram id 带引号/语句碎片 */
$rowBefore = member_count($pdo3);
list($stInj, $mInj, $cInj, $eInj) = fbs_bridge_find_or_create_member(
    $pdo3, 'huoniao_', "777' OR '1'='1", array('ip' => '1.2.3.4'));
check('T3 注入向量1: 带引号 id 被 (int) 归一为 tg_777 并复用已有会员',
    $stInj === 200 && $mInj['id'] === $memberId && member_count($pdo3) === $rowBefore,
    "status=$stInj err=$eInj rows=" . member_count($pdo3));
list($stInj2) = fbs_bridge_find_or_create_member($pdo3, 'huoniao_', "779; DROP TABLE huoniao_member--", array());
$tableAlive = $pdo3->query("SELECT COUNT(*) FROM `huoniao_member`")->fetchColumn();
check('T3 注入向量2: "; DROP TABLE" 被中和为 tg_779 正常建号，表未被删',
    $stInj2 === 200 && $tableAlive == $rowBefore + 1, "status=$stInj2 rows=$tableAlive");
$usernameInj = fbs_bridge_member_username("1' UNION SELECT password FROM huoniao_member--");
check('T3 注入向量3: username 归一结果恰为 tg_1', $usernameInj === 'tg_1', $usernameInj);

/* 3.6 JSON 成功响应不含 Cookie 值/密码 */
$jsonPayload = json_encode($payload);
check('T3 JSON 响应体不含 password / Cookie 值',
    strpos($jsonPayload, $PWD47) === false && strpos($jsonPayload, 'HN_login_user') === false);

printf("\n==== T4 重定向防护 ====\n");

$cases = array(
    '/h5'                 => '/h5',
    '//evil.com'          => '',
    'https://evil.com'    => '',
    'http://evil.com'     => '',
    '/\\evil.com'         => '',
    "java\0script:alert(1)" => '',
    'javascript:alert(1)' => '',
    'evil.com'            => '',
    '/a//b'               => '',
    '/a:b'                => '',
    ''                    => '',
    '/ok?q=1'             => '/ok?q=1',
    '/member/order?id=1'  => '/member/order?id=1',
);
$t4bad = array();
foreach ($cases as $in => $expect) {
    $got = fbs_bridge_safe_next($in);
    if ($got !== $expect) $t4bad[] = "in=" . var_export($in, true) . " expect=" . var_export($expect, true) . " got=" . var_export($got, true);
}
check('T4 safe_next 单测: 13 组输入全部符合预期', count($t4bad) === 0, json_encode($t4bad));

list($hEvil, $pEvil, $cEvil) = fbs_bridge_handle_request(
    make_init_data($TEST_TOKEN, array('query_id' => 't4-evil')),
    issue_opts($pdo3, array('redirect' => true, 'next' => 'https://evil.com')));
check('T4 集成: next=https://evil.com 回退站内默认 / 且仍下发 Cookie',
    $hEvil === 200 && $pEvil['location'] === '/' && count($cEvil) > 0,
    'location=' . (isset($pEvil['location']) ? $pEvil['location'] : 'null'));

list($hOk, $pOk, $cOk) = fbs_bridge_handle_request(
    make_init_data($TEST_TOKEN, array('query_id' => 't4-ok')),
    issue_opts($pdo3, array('redirect' => true, 'next' => '/h5')));
check('T4 集成: next=/h5 合法原样 302 目标', $hOk === 200 && $pOk['location'] === '/h5');

list($hJson, $pJson, $cJson) = fbs_bridge_handle_request(
    make_init_data($TEST_TOKEN, array('query_id' => 't4-json')), issue_opts($pdo3));
check('T4 无 next: JSON 模式无 location 键且仍下发 Cookie',
    $hJson === 200 && !isset($pJson['location']) && count($cJson) === 4);

printf("\n==== T6 顺序与安全 ====\n");

/* 6.1 伪造签名 + issue=true：不产生任何库写入 */
$pdo6 = make_sqlite();
$forged = make_init_data($TEST_TOKEN, array('query_id' => 't6-forged'));
$forged = substr($forged, 0, -64) . str_repeat('0', 64);
list($hF, $pF, $cF) = fbs_bridge_handle_request($forged, issue_opts($pdo6));
check('T6 伪造签名 + issue: 403 invalid_signature 且表 0 行（签发前被拦）',
    $hF === 403 && $pF['error'] === 'invalid_signature' && member_count($pdo6) === 0 && count($cF) === 0,
    "http=$hF rows=" . member_count($pdo6));

/* 6.2 重放第 6 次 + issue=true：前 5 次签发成功（首调用建 1 行），第 6 次 429 且不再写库 */
$replay = make_init_data($TEST_TOKEN, array('query_id' => 't6-replay'));
$codes6 = array(); $last = array(0, '', array());
for ($i = 1; $i <= 6; $i++) {
    $last = fbs_bridge_handle_request($replay, issue_opts($pdo6));
    $codes6[] = $last[0];
}
check('T6 重放 6 次 + issue: 前 5 次 200、第 6 次 429，且 429 响应不再新增行（仍 1 行）、0 Cookie',
    $codes6 === array(200, 200, 200, 200, 200, 429) && member_count($pdo6) === 1 && count($last[2]) === 0,
    'codes=' . implode(',', $codes6) . ' rows=' . member_count($pdo6));

/* 6.3 401/403/429/500 全部错误分支 0 Cookie（含 issue=true） */
$expired = make_init_data($TEST_TOKEN, array('auth_date' => (string)(time() - 7200), 'query_id' => 't6-401'));
list($hE, , $cE) = fbs_bridge_handle_request($expired, issue_opts($pdo6));
$forged2 = substr(make_init_data($TEST_TOKEN, array('query_id' => 't6-403x')), 0, -64) . str_repeat('f', 64);
list($hFx, , $cFx) = fbs_bridge_handle_request($forged2, issue_opts($pdo6));
/* 6.4 dbinfo.inc.php 不存在 → 500 config_missing，JSON 不白屏（不注入 pdo，走默认 dbinfo 路径） */
list($h500, $p500, $c500) = fbs_bridge_handle_request(
    make_init_data($TEST_TOKEN, array('query_id' => 't6-500')), array('issue' => true));
check('T6 401/403/429/500 错误响应均不带 Cookie',
    $hE === 401 && count($cE) === 0 && $hFx === 403 && count($cFx) === 0
    && $h500 === 500 && count($c500) === 0,
    "401=$hE(c" . count($cE) . ") 403=$hFx(c" . count($cFx) . ") 500=$h500(c" . count($c500) . ")");

/* 6.4 dbinfo.inc.php 不存在 → 500 config_missing，JSON 不白屏 */
check('T6 dbinfo 缺失: config_missing JSON（无 fatal）',
    $h500 === 500 && $p500['error'] === 'config_missing' && isset($p500['message']),
    json_encode($p500));
list($subOut, $subRc) = run_subprocess('--sub=dbinfo-missing');
check('T6 dbinfo 缺失（子进程隔离）: config_missing + 0 Cookie',
    $subRc === 0, $subOut);

/* 6.5 非法 DB_PREFIX（注入向量走前缀拼接）→ config_invalid */
list($hPre, $pPre, $cPre) = fbs_bridge_handle_request(
    make_init_data($TEST_TOKEN, array('query_id' => 't6-prefix')),
    array('issue' => true, 'context' => array(
        'pdo' => $pdo6, 'db_prefix' => "huoniao_`; DROP TABLE x--", 'ip' => '1.2.3.4')));
check('T6 非法表前缀: 500 config_invalid 且 0 Cookie',
    $hPre === 500 && $pPre['error'] === 'config_invalid' && count($cPre) === 0,
    json_encode($pPre));

/* 6.6 302 模式结构：Cookie 与 Location 同批返回
 *     （生产入口 bridge.php:894-903 先逐条 header('Set-Cookie') 再 header('Location')，
 *      header 顺序由代码保证；CLI 无法对 header() 排序做运行时断言，见测试报告） */
list($h302, $p302, $c302) = fbs_bridge_handle_request(
    make_init_data($TEST_TOKEN, array('query_id' => 't6-302')),
    issue_opts($pdo6, array('redirect' => true, 'next' => '/h5')));
check('T6 302 模式: 200 + Cookie 非空 + location 已确定（同批返回）',
    $h302 === 200 && count($c302) === 4 && $p302['location'] === '/h5');

/* 6.7 返回 3 元组兼容 list($a,$b) 双参写法（task-001 语义） */
$h7 = null; $p7 = null;
$old = fbs_bridge_handle_request(make_init_data($TEST_TOKEN, array('query_id' => 't6-list')));
check('T6 单参调用: 返回值仍兼容 list($http,$payload) 且不含 member_id',
    is_array($old) && count($old) === 3 && !isset($old[1]['member_id']),
    json_encode($old[1]));

printf("\n==== KNOWN-RISK 并发首登双插（member.username 无唯一索引） ====\n");

/* 用 SQLite 文件库模拟两进程先后 SELECT（都查空）再先后 INSERT（无唯一约束，双双成功） */
$riskFile = sys_get_temp_dir() . '/fbs_bridge_risk_' . getmypid() . '.sqlite3';
@unlink($riskFile);
$pdoA = make_sqlite($riskFile);
$pdoB = make_sqlite($riskFile);

/* 模拟：A、B 两个 FPM 进程几乎同时到达，都在对方 INSERT 提交前完成 SELECT */
$sel = $pdoA->prepare("SELECT id FROM `huoniao_member` WHERE username = ?");
$sel->execute(array('tg_888'));
$aSees = $sel->fetch();
$selB = $pdoB->prepare("SELECT id FROM `huoniao_member` WHERE username = ?");
$selB->execute(array('tg_888'));
$bSees = $selB->fetch();
if ($aSees === false && $bSees === false) {
    /* 两边都查空 → 各自走 INSERT（等价于 find_or_create_member 的两个分支） */
    list($insSt) = fbs_bridge_find_or_create_member($pdoA, 'huoniao_', 888, array());
    /* B 侧直接复刻同一条 INSERT（其 SELECT 已在 A 提交前完成） */
    $pwd = fbs_bridge_generate_password();
    $pdoB->prepare('INSERT INTO `huoniao_member` (`mtype`,`username`,`password`,`nickname`,`emailCheck`,`phoneCheck`,`sex`,`photo`,`regtime`,`logincount`,`lastlogintime`,`lastloginip`,`regip`,`state`,`regfrom`,`online`)'
        . " VALUES (1,'tg_888',?,'TG888',0,0,1,'',?,1,?,?,?,1,'telegram',?)")
        ->execute(array($pwd, time(), time(), '1.2.3.4', '1.2.3.4', time()));
    $dup = $pdoA->query("SELECT COUNT(*) FROM `huoniao_member` WHERE username='tg_888'")->fetchColumn();
    known_risk('并发首登双插: 两次 INSERT 均成功，同 username 出现 ' . $dup . ' 行'
        . '（member.username 仅普通索引，insert 失败回查兜底救不了双双成功的情况；'
        . '修复需唯一索引，本任务禁改表结构）',
        'rows=' . $dup . ' file=' . $riskFile);
    if ((int)$dup !== 2) {
        check('KNOWN-RISK 演示成立（应出现 2 行）', false, 'rows=' . $dup);
    }
    @unlink($riskFile);
} else {
    check('KNOWN-RISK 演示前置：两连接初始均应查空', false, 'aSees=' . json_encode($aSees));
}

/* 附加：验证 Max 自述的"插入失败→回查复用"路径确实存在且有效 */
$pdo9 = make_sqlite();
$pdo9->exec('CREATE UNIQUE INDEX `ux_username` ON `huoniao_member`(username)'); // 仅测试用约束
$pdo9->exec("INSERT INTO `huoniao_member` (`mtype`,`username`,`password`,`nickname`,`emailCheck`,`phoneCheck`,`sex`,`photo`,`regtime`,`logincount`,`lastlogintime`,`lastloginip`,`regip`,`state`,`regfrom`,`online`) VALUES (1,'tg_999','x','x',0,0,1,'',0,0,0,'','',1,'telegram',0)");
list($st9, $m9, , $e9) = fbs_bridge_find_or_create_member($pdo9, 'huoniao_', 999, array());
check('附加: 已存在同 username（state=1）时回查复用不报错',
    $st9 === 200 && is_array($m9) && (int)$m9['id'] > 0 && $e9 === '', "status=$st9 err=$e9");

printf("\n==== T5 回归：scripts/test_bridge_verify.php（零改动） ====\n");
$regOut2 = array(); $regRc = 0;
exec('php ' . escapeshellarg(__DIR__ . '/test_bridge_verify.php') . ' 2>&1', $regOut2, $regRc);
$regText = implode("\n", $regOut2);
check('T5 回归: test_bridge_verify.php 7 用例 ALL PASS',
    $regRc === 0 && strpos($regText, 'ALL TESTS PASSED') !== false,
    $regText);

/* ---- 清理 ---- */
foreach (glob($REPLAY_DIR . '/*.cnt') as $f) @unlink($f);
@rmdir($REPLAY_DIR);

printf("\n==== 汇总 ====\n");
printf("PASS=%d  FAIL=%d  KNOWN-RISK=%d\n", $PASS, $FAIL, $KNOWN);
if (count($FAILURES)) {
    echo "失败明细:\n";
    foreach ($FAILURES as $f) echo "  - $f\n";
}
echo $FAIL === 0 ? "\nSUITE PASSED（含 KNOWN-RISK 备注）\n" : "\nSUITE FAILED\n";
exit($FAIL === 0 ? 0 : 1);
