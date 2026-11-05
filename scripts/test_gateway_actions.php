<?php
/**
 * 网关动作层测试（webroot/api/fbs/index.php）
 *
 * 运行（宿主机通常无 PHP，用 Docker）：
 *   docker run --rm -v "$PWD":/app -w /app php:7.4-cli php scripts/test_gateway_actions.php
 *
 * 覆盖：签名正确 → 200 / 签名错 → 401 / 时间戳超窗 → 401 / 缺密钥 → 503 /
 *       入参缺失 → 400 / 未知动作 → 404 / 会员被禁用 → 403 /
 *       issue_session 的 set_cookies 含 HN_login_user + HN_userid + HN_tg，且 HN_tg 属性逐字符复用登录 Cookie。
 *
 * 不连真实数据库：PDO 用 SQLite 内存库注入（DATABASE 侧连接逻辑走 fbs_bridge_db_connect，本用例不触发）。
 */

define('FBS_GATEWAY_TEST', true);   // 只加载函数，不跑 HTTP 入口（该入口会 exit）
putenv('FBS_TG_BOT_TOKEN=' . '123456:TEST-FAKE-BOT-TOKEN');

require __DIR__ . '/../webroot/api/fbs/index.php';

$PASS = 0;
$FAIL = 0;
$FAILURES = array();

function check($name, $cond, $detail = '')
{
    global $PASS, $FAIL, $FAILURES;
    if ($cond) {
        $PASS++;
        printf("[PASS]  %s\n", $name);
    } else {
        $FAIL++;
        $FAILURES[] = $name . ($detail !== '' ? '  ||  ' . $detail : '');
        printf("[FAIL]  %s  %s\n", $name, $detail);
    }
}

/* ---------- 夹具 ---------- */

$SECRET = 'test-gateway-secret-do-not-use-in-prod';
$NOW    = 1700000000;

function make_pdo()
{
    $pdo = new PDO('sqlite::memory:');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec('CREATE TABLE `huoniao_member` (
        `id` INTEGER PRIMARY KEY AUTOINCREMENT,
        `mtype` INTEGER, `username` TEXT, `password` VARCHAR(47), `nickname` VARCHAR(36),
        `emailCheck` INTEGER, `phoneCheck` INTEGER, `sex` INTEGER, `photo` VARCHAR(100),
        `regtime` INTEGER, `logincount` INTEGER, `lastlogintime` INTEGER,
        `lastloginip` VARCHAR(15), `regip` VARCHAR(15), `state` INTEGER,
        `regfrom` VARCHAR(20), `online` INTEGER
    )');
    return $pdo;
}

$CFG = array(
    'cookiePre' => 'HN_', 'cookiePath' => '/', 'cookieDomain' => 'fbird.men',
    'onlinetime' => 100, 'httpSecureAccess' => 1,
);

function ctx(PDO $pdo, array $cfg = null, array $extra = array())
{
    global $NOW, $CFG;
    return array_merge(array(
        'pdo'       => $pdo,
        'db_prefix' => 'huoniao_',
        'config'    => $cfg === null ? $CFG : $cfg,
        'ip'        => '1.2.3.4',
        'now'       => $NOW,
    ), $extra);
}

function body_of(array $params)
{
    return json_encode($params, JSON_UNESCAPED_UNICODE);
}

/** 按 gatewayClient.js sign() 的规则算签名 */
function sig($secret, $ts, $action, $body)
{
    return hash_hmac('sha256', $ts . "\n" . $action . "\n" . $body, $secret);
}

function call_gw($action, array $params, array $context, $secret = null, $ts = null, $bodyOverride = null)
{
    global $SECRET, $NOW;
    $body = $bodyOverride === null ? body_of($params) : $bodyOverride;
    $timestamp = $ts === null ? (string)$NOW : (string)$ts;
    $signature = sig($secret === null ? $SECRET : $secret, $timestamp, $action, $body);
    return fbs_gateway_dispatch($action, $body, $timestamp, $signature, $context);
}

/* ---------- 环境：密钥走环境变量（顺带覆盖 env 读取路径） ---------- */
putenv('FBS_GATEWAY_SECRET=' . $SECRET);

printf("==== G1 签名校验 ====\n");

$pdo = make_pdo();

list($code, $payload) = call_gw('member_find_or_create', array('tg_user_id' => 777), ctx($pdo));
check('G1 签名正确 → 200 code=0', $code === 200 && $payload['code'] === 0,
    "http=$code payload=" . json_encode($payload));
check('G1 新建会员 created=true 且 member_id > 0',
    $payload['created'] === true && $payload['member_id'] > 0, json_encode($payload));

list($code, $payload) = call_gw('member_find_or_create', array('tg_user_id' => 777), ctx($pdo));
check('G1 二次调用幂等：created=false 且 member_id 不变',
    $code === 200 && $payload['created'] === false && $payload['member_id'] > 0, json_encode($payload));

list($code, $payload) = call_gw('member_find_or_create', array('tg_user_id' => 777), ctx($pdo), 'wrong-secret');
check('G1 签名错（密钥不符） → 401 invalid_signature',
    $code === 401 && $payload['error'] === 'invalid_signature', "http=$code payload=" . json_encode($payload));

// 签名用的是 777 的 body，实际发出去的是 778 的 body（模拟中间人改包）
$bodySigned = body_of(array('tg_user_id' => 777));
$bodySent   = body_of(array('tg_user_id' => 778));
list($code, $payload) = fbs_gateway_dispatch(
    'issue_session', $bodySent, (string)$NOW, sig($SECRET, (string)$NOW, 'issue_session', $bodySigned), ctx($pdo)
);
check('G1 签名错（body 被改） → 401', $code === 401 && $payload['error'] === 'invalid_signature',
    "http=$code payload=" . json_encode($payload));

list($code, $payload) = call_gw('member_find_or_create', array('tg_user_id' => 777), ctx($pdo), null, $NOW - 301);
check('G1 时间戳超窗(-301s) → 401 stale_timestamp',
    $code === 401 && $payload['error'] === 'stale_timestamp', "http=$code payload=" . json_encode($payload));

list($code, $payload) = call_gw('member_find_or_create', array('tg_user_id' => 777), ctx($pdo), null, $NOW + 301);
check('G1 时间戳超前(+301s) → 401 stale_timestamp',
    $code === 401 && $payload['error'] === 'stale_timestamp', "http=$code payload=" . json_encode($payload));

list($code, $payload) = call_gw('member_find_or_create', array('tg_user_id' => 777), ctx($pdo), null, $NOW - 300);
check('G1 时间窗边界(-300s) 仍放行 → 200', $code === 200, "http=$code payload=" . json_encode($payload));

printf("\n==== G2 密钥缺失 / 未知动作 / 入参 ====\n");

putenv('FBS_GATEWAY_SECRET');   // 彻底移除
list($code, $payload) = call_gw('member_find_or_create', array('tg_user_id' => 777), ctx($pdo));
check('G2 缺 FBS_GATEWAY_SECRET → 503 gateway_not_configured',
    $code === 503 && $payload['error'] === 'gateway_not_configured', "http=$code payload=" . json_encode($payload));
putenv('FBS_GATEWAY_SECRET=' . $SECRET);

list($code, $payload) = fbs_gateway_dispatch('drop_all_tables', body_of(array()), (string)$NOW,
    sig($SECRET, (string)$NOW, 'drop_all_tables', body_of(array())), ctx($pdo));
check('G2 未知动作 → 404 unknown_action', $code === 404 && $payload['error'] === 'unknown_action',
    "http=$code payload=" . json_encode($payload));

list($code, $payload) = call_gw('member_find_or_create', array(), ctx($pdo));
check('G2 缺 tg_user_id → 400 invalid_tg_user_id',
    $code === 400 && $payload['error'] === 'invalid_tg_user_id', "http=$code payload=" . json_encode($payload));

foreach (array("777' OR '1'='1", '-1', '0', '7.5', 'abc') as $bad) {
    list($code, $payload) = call_gw('member_find_or_create', array('tg_user_id' => $bad), ctx($pdo));
    check('G2 非法 tg_user_id(' . $bad . ') → 400', $code === 400, "http=$code");
}

list($code, $payload) = call_gw('member_find_or_create', array(), ctx($pdo), null, null, '{not json');
check('G2 非法 JSON body → 400 invalid_body', $code === 400 && $payload['error'] === 'invalid_body',
    "http=$code payload=" . json_encode($payload));

printf("\n==== G3 会员禁用 ====\n");

$pdoDis = make_pdo();
$pdoDis->exec("INSERT INTO `huoniao_member` (`username`,`password`,`state`,`online`) VALUES ('tg_999','x',0,0)");
list($code, $payload) = call_gw('member_find_or_create', array('tg_user_id' => 999), ctx($pdoDis));
check('G3 state=0 → 403 member_disabled', $code === 403 && $payload['error'] === 'member_disabled',
    "http=$code payload=" . json_encode($payload));

printf("\n==== G4 issue_session 与 set_cookies ====\n");

$pdoS = make_pdo();
list($code, $payload) = call_gw('issue_session', array('tg_user_id' => 4242), ctx($pdoS));
check('G4 issue_session → 200 code=0 且带 member_id', $code === 200 && $payload['code'] === 0 && $payload['member_id'] > 0,
    "http=$code payload=" . json_encode(array_diff_key($payload, array('set_cookies' => 1))));

$cookies = isset($payload['set_cookies']) && is_array($payload['set_cookies']) ? $payload['set_cookies'] : array();
check('G4 set_cookies 是数组且非空（完整 Set-Cookie 头，非仅值）', count($cookies) > 0, 'count=' . count($cookies));

$byName = array('HN_login_user' => array(), 'HN_userid' => array(), 'HN_tg' => array());
foreach ($cookies as $c) {
    foreach ($byName as $name => $_) {
        if (strpos($c, $name . '=') === 0) $byName[$name][] = $c;
    }
}
check('G4 三条 Cookie 都在：HN_login_user / HN_userid / HN_tg',
    count($byName['HN_login_user']) === 2 && count($byName['HN_userid']) === 2 && count($byName['HN_tg']) === 2,
    'logins=' . count($byName['HN_login_user']) . ' userids=' . count($byName['HN_userid']) . ' tgs=' . count($byName['HN_tg']));

$domains = array();
foreach ($byName['HN_login_user'] as $c) {
    if (preg_match('/;\s*domain=([^;]+)/i', $c, $m)) $domains[] = trim($m[1]);
}
sort($domains);
check('G4 域名两份（fbird.men + www.fbird.men）', $domains === array('fbird.men', 'www.fbird.men'), json_encode($domains));

$tgDomains = array();
foreach ($byName['HN_tg'] as $c) {
    if (preg_match('/;\s*domain=([^;]+)/i', $c, $m)) $tgDomains[] = trim($m[1]);
}
sort($tgDomains);
check('G4 HN_tg 也是同样的两份域名', $tgDomains === $domains, json_encode($tgDomains));

/* HN_tg 值必须是 1 */
$tgValues = array();
foreach ($byName['HN_tg'] as $c) {
    $semi = strpos($c, ';');
    $tgValues[] = substr($c, strlen('HN_tg='), $semi - strlen('HN_tg='));
}
check('G4 HN_tg 值为 1', $tgValues === array('1', '1'), json_encode($tgValues));

/* 属性逐字符复用：把 HN_login_user 那段 '; ...' 的 path/secure/SameSite 拿出来比对 */
function attr_of($header)
{
    $semi = strpos($header, ';');
    $tail = $semi === false ? '' : substr($header, $semi);
    $keep = array();
    foreach (explode(';', $tail) as $seg) {
        $seg = trim($seg);
        if ($seg === '') continue;
        if (stripos($seg, 'expires=') === 0 || stripos($seg, 'Max-Age=') === 0) continue;
        $keep[] = $seg;
    }
    sort($keep);
    return $keep;
}

$loginAttrs = attr_of($byName['HN_login_user'][0]);
$tgAttrs    = attr_of($byName['HN_tg'][0]);
check('G4 HN_tg 的 path/domain/secure/SameSite 与 HN_login_user 完全一致',
    $loginAttrs === $tgAttrs, 'login=' . json_encode($loginAttrs) . ' tg=' . json_encode($tgAttrs));

$loginMaxAge = preg_match('/Max-Age=(\d+)/', $byName['HN_login_user'][0], $m1) ? (int)$m1[1] : 0;
$tgMaxAge    = preg_match('/Max-Age=(\d+)/', $byName['HN_tg'][0], $m2) ? (int)$m2[1] : 0;
check('G4 HN_tg 有效期 30 天，HN_login_user 仍是 onlinetime*3600=360000',
    $tgMaxAge === 30 * 86400 && $loginMaxAge === 360000, "tg=$tgMaxAge login=$loginMaxAge");

check('G4 Cookie 值未在 JSON 之外泄漏：set_cookies 里不含明文 password 列',
    strpos(json_encode($cookies), 'tg_4242') === false);

printf("\n==== G5 无 HTTP 副作用（响应体不含堆栈） ====\n");

list($code, $payload) = call_gw('issue_session', array('tg_user_id' => 4242), ctx(new PDO('sqlite::memory:')));
check('G5 空库（无 member 表）时不抛异常、返回结构化错误',
    is_array($payload) && isset($payload['code']) && $payload['code'] !== 0 && stripos(json_encode($payload), 'Stack trace') === false,
    "http=$code payload=" . json_encode($payload));

printf("\n==== 汇总 ====\n");
printf("PASS=%d  FAIL=%d\n", $PASS, $FAIL);
if ($FAIL > 0) {
    printf("\n失败项：\n");
    foreach ($FAILURES as $f) printf("  - %s\n", $f);
    exit(1);
}
printf("\nSUITE PASSED\n");
exit(0);
