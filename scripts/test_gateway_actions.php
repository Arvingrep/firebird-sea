<?php
/**
 * 网关动作层测试（webroot/api/fbs/index.php）
 *
 * 运行（宿主机通常无 PHP，用 Docker）：
 *   docker run --rm -v "$PWD":/app -w /app php:7.4-cli php scripts/test_gateway_actions.php
 *
 * 覆盖：响应形状（success/data、success/error.code）/ 签名正确与各类签名失败 / 时间窗 /
 *       缺密钥 / 未知动作 / 入参缺失 / 会员 state 与 is_cancellation 门禁 /
 *       issue_session 的 set_cookies 含 HN_login_user + HN_userid + HN_tg 且属性一致。
 *
 * 不连真实数据库：PDO 用 SQLite 内存库注入（fbs_bridge_db_connect 不被触发）。
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
        `regfrom` VARCHAR(20), `online` INTEGER, `is_cancellation` INTEGER DEFAULT 0
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

function call_gw($action, array $params, array $context, $secret = null, $ts = null)
{
    global $SECRET, $NOW;
    $body = body_of($params);
    $timestamp = $ts === null ? (string)$NOW : (string)$ts;
    $signature = sig($secret === null ? $SECRET : $secret, $timestamp, $action, $body);
    return fbs_gateway_dispatch($action, $body, $timestamp, $signature, $context);
}

/** 断言失败响应：状态码 + 对象形 error.code */
function is_err($payload, $code)
{
    return is_array($payload)
        && isset($payload['success']) && $payload['success'] === false
        && isset($payload['error']['code']) && $payload['error']['code'] === $code
        && isset($payload['error']['message']) && $payload['error']['message'] !== '';
}

/* ---------- 环境：密钥走环境变量（顺带覆盖 env 读取路径） ---------- */
putenv('FBS_GATEWAY_SECRET=' . $SECRET);

printf("==== G0 响应形状 ====\n");

$pdo = make_pdo();
list($code, $payload) = call_gw('member_find_or_create', array('tg_user_id' => 777), ctx($pdo));
check('G0 成功体是 {success:true, data:{...}}，不含 code 字段',
    $code === 200 && $payload['success'] === true && isset($payload['data'])
    && !isset($payload['code']) && !isset($payload['error']),
    json_encode($payload));
check('G0 data 里 member_id / created 就位',
    $payload['data']['member_id'] > 0 && $payload['data']['created'] === true, json_encode($payload['data']));

$memberId777 = $payload['data']['member_id'];

printf("\n==== G1 签名校验 ====\n");

list($code, $payload) = call_gw('member_find_or_create', array('tg_user_id' => 777), ctx($pdo));
check('G1 二次调用幂等：created=false 且 member_id 不变',
    $code === 200 && $payload['data']['created'] === false && $payload['data']['member_id'] === $memberId777,
    json_encode($payload['data']));

list($code, $payload) = call_gw('member_find_or_create', array('tg_user_id' => 777), ctx($pdo), 'wrong-secret');
check('G1 签名错（密钥不符） → 401 INVALID_SIGNATURE',
    $code === 401 && is_err($payload, 'INVALID_SIGNATURE'), "http=$code payload=" . json_encode($payload));

// 签名用的是 777 的 body，实际发出去的是 778 的 body（模拟中间人改包）
$bodySigned = body_of(array('tg_user_id' => 777));
$bodySent   = body_of(array('tg_user_id' => 778));
list($code, $payload) = fbs_gateway_dispatch(
    'issue_session', $bodySent, (string)$NOW, sig($SECRET, (string)$NOW, 'issue_session', $bodySigned), ctx($pdo)
);
check('G1 签名错（body 被改） → 401 INVALID_SIGNATURE',
    $code === 401 && is_err($payload, 'INVALID_SIGNATURE'), "http=$code payload=" . json_encode($payload));

list($code, $payload) = call_gw('member_find_or_create', array('tg_user_id' => 777), ctx($pdo), null, $NOW - 301);
check('G1 时间戳超窗(-301s) → 401 INVALID_SIGNATURE（对外不区分超窗与签名错）',
    $code === 401 && is_err($payload, 'INVALID_SIGNATURE'), "http=$code payload=" . json_encode($payload));

list($code, $payload) = call_gw('member_find_or_create', array('tg_user_id' => 777), ctx($pdo), null, $NOW + 301);
check('G1 时间戳超前(+301s) → 401 INVALID_SIGNATURE',
    $code === 401 && is_err($payload, 'INVALID_SIGNATURE'), "http=$code payload=" . json_encode($payload));

list($code, $payload) = call_gw('member_find_or_create', array('tg_user_id' => 777), ctx($pdo), null, $NOW - 300);
check('G1 时间窗边界(-300s) 仍放行 → 200', $code === 200, "http=$code payload=" . json_encode($payload));

list($code, $payload) = fbs_gateway_dispatch('member_find_or_create', '{}', '', '', ctx($pdo));
check('G1 完全无签名头 → 401 INVALID_SIGNATURE',
    $code === 401 && is_err($payload, 'INVALID_SIGNATURE'), "http=$code payload=" . json_encode($payload));

printf("\n==== G2 密钥缺失 / 未知动作 / 入参（验签先于解析） ====\n");

putenv('FBS_GATEWAY_SECRET');   // 彻底移除
list($code, $payload) = call_gw('member_find_or_create', array('tg_user_id' => 777), ctx($pdo));
check('G2 缺 FBS_GATEWAY_SECRET → 503 GATEWAY_SECRET_NOT_CONFIGURED',
    $code === 503 && is_err($payload, 'GATEWAY_SECRET_NOT_CONFIGURED'), "http=$code payload=" . json_encode($payload));
putenv('FBS_GATEWAY_SECRET=' . $SECRET);

list($code, $payload) = fbs_gateway_dispatch('drop_all_tables', '{}', (string)$NOW,
    sig($SECRET, (string)$NOW, 'drop_all_tables', '{}'), ctx($pdo));
check('G2 未知动作 → 404 UNKNOWN_ACTION', $code === 404 && is_err($payload, 'UNKNOWN_ACTION'),
    "http=$code payload=" . json_encode($payload));

list($code, $payload) = call_gw('member_find_or_create', array(), ctx($pdo));
check('G2 缺 tg_user_id → 400 MISSING_PARAM', $code === 400 && is_err($payload, 'MISSING_PARAM'),
    "http=$code payload=" . json_encode($payload));

foreach (array("777' OR '1'='1", '-1', '0', '7.5', 'abc') as $bad) {
    list($code, $payload) = call_gw('member_find_or_create', array('tg_user_id' => $bad), ctx($pdo));
    check('G2 非法 tg_user_id(' . $bad . ') → 400 MISSING_PARAM',
        $code === 400 && is_err($payload, 'MISSING_PARAM'), "http=$code");
}

// 未带签名的非法入参不得先被判成 400：验签在前，一律 401
list($code, $payload) = fbs_gateway_dispatch('member_find_or_create', '{"tg_user_id":"abc"}',
    (string)$NOW, str_repeat('a', 64), ctx($pdo));
check('G2 验签先于解析：签名错 + 入参也错 → 401 而不是 400',
    $code === 401 && is_err($payload, 'INVALID_SIGNATURE'), "http=$code payload=" . json_encode($payload));

$badJson = '{not json';
list($code, $payload) = fbs_gateway_dispatch('member_find_or_create', $badJson, (string)$NOW,
    sig($SECRET, (string)$NOW, 'member_find_or_create', $badJson), ctx($pdo));
check('G2 合法签名 + 非法 JSON body → 400 MISSING_PARAM',
    $code === 400 && is_err($payload, 'MISSING_PARAM'), "http=$code payload=" . json_encode($payload));

printf("\n==== G3 会员门禁（state / is_cancellation） ====\n");

$pdoDis = make_pdo();
$pdoDis->exec("INSERT INTO `huoniao_member` (`username`,`password`,`state`,`online`,`is_cancellation`) VALUES ('tg_999','x',0,0,0)");
list($code, $payload) = call_gw('member_find_or_create', array('tg_user_id' => 999), ctx($pdoDis));
check('G3 state=0 → 403 MEMBER_DISABLED', $code === 403 && is_err($payload, 'MEMBER_DISABLED'),
    "http=$code payload=" . json_encode($payload));

$pdoAudit = make_pdo();
$pdoAudit->exec("INSERT INTO `huoniao_member` (`username`,`password`,`state`,`online`,`is_cancellation`) VALUES ('tg_998','x',2,0,0)");
list($code, $payload) = call_gw('member_find_or_create', array('tg_user_id' => 998), ctx($pdoAudit));
check('G3 state=2（待审核，对齐 memberLoginCheck -4） → 403 MEMBER_DISABLED',
    $code === 403 && is_err($payload, 'MEMBER_DISABLED'), "http=$code payload=" . json_encode($payload));

$pdoCancel = make_pdo();
$pdoCancel->exec("INSERT INTO `huoniao_member` (`username`,`password`,`state`,`online`,`is_cancellation`) VALUES ('tg_997','x',1,0,1)");
list($code, $payload) = call_gw('member_find_or_create', array('tg_user_id' => 997), ctx($pdoCancel));
check('G3 is_cancellation=1（已申请注销，对齐 memberLoginCheck -5） → 403 MEMBER_CANCELLED',
    $code === 403 && is_err($payload, 'MEMBER_CANCELLED'), "http=$code payload=" . json_encode($payload));

list($code, $payload) = call_gw('issue_session', array('tg_user_id' => 997), ctx($pdoCancel));
check('G3 已注销会员 issue_session 同样 403 且不下发 set_cookies',
    $code === 403 && is_err($payload, 'MEMBER_CANCELLED') && !isset($payload['data']),
    "http=$code payload=" . json_encode($payload));

printf("\n==== G4 issue_session 与 set_cookies ====\n");

$pdoS = make_pdo();
list($code, $payload) = call_gw('issue_session', array('tg_user_id' => 4242), ctx($pdoS));
check('G4 issue_session → 200 success:true 且带 member_id',
    $code === 200 && $payload['success'] === true && $payload['data']['member_id'] > 0,
    "http=$code payload=" . json_encode($payload));

$cookies = isset($payload['data']['set_cookies']) && is_array($payload['data']['set_cookies']) ? $payload['data']['set_cookies'] : array();
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

$tgValues = array();
foreach ($byName['HN_tg'] as $c) {
    $semi = strpos($c, ';');
    $tgValues[] = substr($c, strlen('HN_tg='), $semi - strlen('HN_tg='));
}
check('G4 HN_tg 值为 1', $tgValues === array('1', '1'), json_encode($tgValues));

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

printf("\n==== G5 异常不外泄 ====\n");

list($code, $payload) = call_gw('issue_session', array('tg_user_id' => 4242), ctx(new PDO('sqlite::memory:')));
$flat = json_encode($payload);
check('G5 空库（无 member 表）→ 结构化错误、无堆栈、无 DSN',
    is_array($payload) && $payload['success'] === false && $code >= 500
    && stripos($flat, 'Stack trace') === false && stripos($flat, 'sqlite') === false,
    "http=$code payload=" . $flat);

printf("\n==== G6 入口形态：\$_SERVER 密钥兜底 / action 在 body ====\n");

// 6.1 FPM clear_env=on 时 getenv 取不到，只有 nginx fastcgi_param 写进 $_SERVER
putenv('FBS_GATEWAY_SECRET');            // 环境变量不存在
$_SERVER['FBS_GATEWAY_SECRET'] = $SECRET; // 模拟 fastcgi_param
list($code, $payload) = call_gw('member_find_or_create', array('tg_user_id' => 777), ctx($pdo));
check('G6 getenv 缺失但 $_SERVER 有值 → 正常放行（200）',
    $code === 200 && $payload['success'] === true, "http=$code payload=" . json_encode($payload));

// 两处都没有 → 503
unset($_SERVER['FBS_GATEWAY_SECRET']);
list($code, $payload) = call_gw('member_find_or_create', array('tg_user_id' => 777), ctx($pdo));
check('G6 $_SERVER 与 getenv 都没有 → 503 GATEWAY_SECRET_NOT_CONFIGURED',
    $code === 503 && is_err($payload, 'GATEWAY_SECRET_NOT_CONFIGURED'), "http=$code payload=" . json_encode($payload));

// 6.2 响应体与日志都不得带出密钥明文
$_SERVER['FBS_GATEWAY_SECRET'] = $SECRET;
list($code, $payload) = call_gw('member_find_or_create', array('tg_user_id' => 777), ctx($pdo));
check('G6 响应体不含密钥明文', strpos(json_encode($payload), $SECRET) === false);

// 6.3 入口形态：POST /api/fbs/index.php，action 在 JSON body（gatewayClient 的实际拼法）
$body = json_encode(array('action' => 'issue_session', 'params' => array('tg_user_id' => 777)), JSON_UNESCAPED_UNICODE);
$action = fbs_gateway_resolve_action(array('REQUEST_URI' => '/api/fbs/index.php'), array(), $body);
check('G6 REQUEST_URI=/api/fbs/index.php 时 action 从 body 还原', $action === 'issue_session', 'action=' . $action);

list($code, $payload) = fbs_gateway_dispatch(
    $action, $body, (string)$NOW, sig($SECRET, (string)$NOW, $action, $body), ctx($pdo)
);
check('G6 body 形态 {action,params} 可正常签发（params 取 json.params）',
    $code === 200 && isset($payload['data']['set_cookies']) && count($payload['data']['set_cookies']) > 0,
    "http=$code");

// 6.4 带 .php 的 REQUEST_URI 不会被误判成动作名
$action = fbs_gateway_resolve_action(array('REQUEST_URI' => '/api/fbs/index.php?action=member_find_or_create'), array('action' => 'member_find_or_create'), '{}');
check('G6 ?action= 仍可用（兼容冒烟场景）', $action === 'member_find_or_create', 'action=' . $action);

unset($_SERVER['FBS_GATEWAY_SECRET']);
putenv('FBS_GATEWAY_SECRET=' . $SECRET);

printf("\n==== 汇总 ====\n");
printf("PASS=%d  FAIL=%d\n", $PASS, $FAIL);
if ($FAIL > 0) {
    printf("\n失败项：\n");
    foreach ($FAILURES as $f) printf("  - %s\n", $f);
    exit(1);
}
printf("\nSUITE PASSED\n");
exit(0);
