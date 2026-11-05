<?php
/**
 * 火鸟 · 网关动作层（Node ⇄ PHP 的唯一通道）
 *
 * 路由（三选一，均指向本文件）：
 *   1. POST /api/fbs/{action}                  ← gatewayClient.js 的拼法（baseUrl + '/' + action）
 *   2. POST /api/fbs/index.php?action={action}
 *   3. POST /api/fbs/index.php，JSON 体带 {"action": "..."} 字段
 * 请求体：{"params": {...}} 或直接是动作入参对象（两种都收）。
 *
 * ----------------------------------------------------------------------------------------------
 * 【响应形状：跟 Node 约定，不跟 bridge.php 的 PHP 约定】
 *   成功 {"success": true,  "data": {...}}
 *   失败 {"success": false, "error": {"code": "UPPER_SNAKE_CASE", "message": "..."}}
 * 理由：本网关的唯一调用方是 Node（/tg/entry 只跟 /tg-api 说话，从不直连网关）。
 * bridge.php 是独立直连入口、有自己的消费者，它的小写 snake + {code:0} 形状原样保留、
 * 本文件不复用它的 HTTP 层，只复用它内部的纯函数。
 *
 * 错误码（大写 SNAKE，与 Node 侧同名）：
 *   401 INVALID_SIGNATURE            签名缺失/不匹配/时间戳超窗（对外不区分，避免给探测者反馈）
 *   400 MISSING_PARAM                入参缺失或格式非法
 *   403 MEMBER_DISABLED              会员 state != 1
 *   403 MEMBER_CANCELLED             会员 is_cancellation == 1（已申请注销）
 *   404 UNKNOWN_ACTION               动作不在白名单
 *   405 METHOD_NOT_ALLOWED           非 POST
 *   500 CONFIG_MISSING / CONFIG_INVALID / MEMBER_CREATE_FAILED / DB_QUERY_FAILED / INTERNAL_ERROR
 *   500 DB_UNAVAILABLE               连不上库（Node 侧改判 503，见 services/api/src/tgLogin.js）
 *   503 GATEWAY_SECRET_NOT_CONFIGURED  本文件拿不到 FBS_GATEWAY_SECRET
 *
 * 【鉴权顺序（安全边界，不可调换）】
 *   读 raw body → 验 X-Fbs-Timestamp / X-Fbs-Signature → 才 json_decode → 才判参数。
 *   任何"先判参数再验签"的写法都会把参数校验变成未授权的探测面。
 *   签名 = hex(HMAC-SHA256(secret, "timestamp\naction\nrawBody"))，与 gatewayClient.js 的 sign() 一致。
 *   密钥只从环境变量 FBS_GATEWAY_SECRET 读取；未配置一律 503，不存在"没配密钥就放行"的分支。
 *   时间窗 ±300s；hash_equals 常量时间比较。
 *
 * 动作：
 *   member_find_or_create  入参 tg_user_id(必填) / first_name / last_name / username
 *                          → data: {member_id, created}
 *   issue_session          入参 tg_user_id(必填)
 *                          → data: {member_id, created, set_cookies: [...]}
 *
 * set_cookies 是可直接 header('Set-Cookie: ...') 的完整头字符串，由 PHP 侧生成；
 * Node 不得重新拼装任何属性（domain/path/secure/SameSite/expires 都在这里定死），
 * 否则两侧一旦漂移就会出现"PHP 认账、浏览器不认账"的登录态错位。
 */

// bridge.php 末尾的 HTTP 入口靠这个常量短路：这里只要它的纯函数，不要它自己发响应。
if (!defined('FBS_BRIDGE_TEST')) define('FBS_BRIDGE_TEST', true);
require_once __DIR__ . '/bridge.php';

/* ============================== 常量 ============================== */

/** 签名时间窗（秒） */
if (!defined('FBS_GATEWAY_TIME_WINDOW')) define('FBS_GATEWAY_TIME_WINDOW', 300);

/** 标记 Cookie 有效期：30 天（第 3 步 nginx 注入 tg-shim 的开关） */
if (!defined('FBS_GATEWAY_MARKER_TTL')) define('FBS_GATEWAY_MARKER_TTL', 30 * 86400);

/** 动作白名单 */
function fbs_gateway_actions()
{
    return array('member_find_or_create', 'issue_session');
}

/* ============================== 响应封装 ============================== */

/** 成功响应：[200, {"success":true,"data":{...}}] */
function fbs_gateway_ok(array $data = array())
{
    return array(200, array('success' => true, 'data' => $data));
}

/** 失败响应：[httpCode, {"success":false,"error":{"code":..,"message":..}}] */
function fbs_gateway_err($httpCode, $code, $message)
{
    return array($httpCode, array(
        'success' => false,
        'error'   => array('code' => $code, 'message' => $message),
    ));
}

/* ============================== 签名 ============================== */

/**
 * 读取网关密钥（只认环境变量；测试可经 $context['secret'] 注入）。
 *
 * @return string 未配置返回 ''
 */
function fbs_gateway_secret(array $context = array())
{
    if (array_key_exists('secret', $context)) return (string)$context['secret'];
    $env = getenv('FBS_GATEWAY_SECRET');
    return ($env === false) ? '' : trim($env);
}

/** 与 gatewayClient.js 的 sign() 同构：HMAC-SHA256 hex over "ts\naction\nbody" */
function fbs_gateway_sign($secret, $timestamp, $action, $body)
{
    return hash_hmac('sha256', $timestamp . "\n" . $action . "\n" . $body, $secret);
}

/**
 * 校验签名与时间窗。
 *
 * 返回值里的 reason 只用于 error_log，**不进响应体**：对外一律 INVALID_SIGNATURE，
 * 免得探测者靠"签名错"与"时间戳超窗"的差异反推时间同步状态。
 *
 * @return array [ok(bool), reason(string)]
 */
function fbs_gateway_verify($secret, $timestamp, $signature, $action, $body, $now = null, $window = null)
{
    if ($now === null) $now = time();
    if ($window === null) $window = FBS_GATEWAY_TIME_WINDOW;

    if (!is_string($timestamp) || !preg_match('/^\d{1,12}$/', $timestamp)) {
        return array(false, 'timestamp_format');
    }
    if (!is_string($signature) || !preg_match('/^[0-9a-fA-F]{64}$/', $signature)) {
        return array(false, 'signature_format');
    }
    if (abs($now - (int)$timestamp) > $window) {
        return array(false, 'timestamp_window');
    }

    $expected = fbs_gateway_sign($secret, $timestamp, $action, $body);
    if (!hash_equals($expected, strtolower($signature))) {
        return array(false, 'signature_mismatch');
    }
    return array(true, '');
}

/* ============================== 数据库连接 ============================== */

/**
 * 取 PDO 与表前缀。测试可注入 $context['pdo'] / $context['db_prefix']。
 *
 * @return array [PDO|null, string $prefix, array|null $error]  error = ['code'=>..,'message'=>..]
 */
function fbs_gateway_connect(array $context)
{
    if (isset($context['pdo']) && $context['pdo'] instanceof PDO) {
        $prefix = isset($context['db_prefix']) ? (string)$context['db_prefix'] : 'huoniao_';
        return array($context['pdo'], $prefix, null);
    }

    $dbinfo = isset($context['dbinfo']) ? $context['dbinfo'] : fbs_bridge_load_db_config();
    if (isset($dbinfo['error'])) {
        // bridge.php 的 config_missing / config_invalid 是静态配置错误：对外 500
        $code = ($dbinfo['error'] === 'config_missing') ? 'CONFIG_MISSING' : 'CONFIG_INVALID';
        return array(null, '', array('code' => $code, 'message' => $dbinfo['message']));
    }

    list($pdo, $dbError) = fbs_bridge_db_connect($dbinfo);
    if ($dbError !== null) {
        return array(null, '', array('code' => 'DB_UNAVAILABLE', 'message' => $dbError['message']));
    }

    return array($pdo, $dbinfo['prefix'], null);
}

/** 表前缀来自配置文件，仍做字符集校验，避免配置被污染时拼出奇怪 SQL */
function fbs_gateway_valid_prefix($prefix)
{
    return is_string($prefix) && preg_match('/^[A-Za-z0-9_]{0,32}$/', $prefix) === 1;
}

/* ============================== 入参 ============================== */

/** tg_user_id：只接受 1~20 位正整数（杜绝 "1 OR 1=1" / 负数 / 科学计数法） */
function fbs_gateway_parse_tg_user_id($value)
{
    if (is_int($value)) return $value > 0 ? $value : null;
    if (!is_string($value) && !is_float($value)) return null;
    $text = trim((string)$value);
    if (!preg_match('/^\d{1,20}$/', $text)) return null;
    $id = (int)$text;
    return $id > 0 ? $id : null;
}

/** 会员昵称：first_name + last_name，缺失时用 username，再缺失留空（bridge 会兜底 TG<id>） */
function fbs_gateway_nickname(array $params)
{
    $parts = array();
    foreach (array('first_name', 'last_name') as $key) {
        if (isset($params[$key]) && is_string($params[$key])) {
            $v = trim($params[$key]);
            if ($v !== '') $parts[] = $v;
        }
    }
    if (!$parts && isset($params['username']) && is_string($params['username'])) {
        $v = trim($params['username']);
        if ($v !== '') $parts[] = $v;
    }
    return implode(' ', $parts);
}

/* ============================== 会员：带注销态的门禁 ============================== */

/**
 * 按 username='tg_<id>' 查会员，**额外取 is_cancellation**。
 *
 * 火鸟原生 memberLoginCheck()（userLogin.class.php:552-561）有三道门槛：
 *   state == 0 → -3；state == 2 → -4；is_cancellation == 1 → -5。
 * bridge.php:485 的 SELECT 只取 id/password/state，499-501 只判 state，
 * 所以「已申请注销的会员」能穿过直连桥。本文件不复用它那条 SELECT，自己取全字段再判。
 *
 * @return array [row|null, error|null]  error = ['code'=>..,'message'=>..]
 */
function fbs_gateway_lookup_member(PDO $pdo, $prefix, $tgUserId)
{
    $sql = 'SELECT `id`, `password`, `state`, `is_cancellation` FROM `' . $prefix . 'member` WHERE `username` = ? LIMIT 1';
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute(array(fbs_bridge_member_username($tgUserId)));
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {
        error_log('[fbs_gateway] member select failed: ' . $e->getMessage());
        return array(null, array('code' => 'DB_QUERY_FAILED', 'message' => 'member lookup failed'));
    }
    return array($row ? $row : null, null);
}

/**
 * 会员状态门禁，口径对齐 userLogin::memberLoginCheck()。
 *
 * @return array|null null=放行，否则 ['code'=>..,'message'=>..]
 */
function fbs_gateway_member_guard(array $row)
{
    if ((int)$row['state'] !== 1) {
        return array('code' => 'MEMBER_DISABLED', 'message' => 'member is not active');
    }
    if ((int)$row['is_cancellation'] === 1) {
        return array('code' => 'MEMBER_CANCELLED', 'message' => 'member has requested cancellation');
    }
    return null;
}

/**
 * 查 / 建会员并过门禁。
 *
 * @return array [member|null, created(bool), error|null]
 */
function fbs_gateway_resolve_member(PDO $pdo, $prefix, $tgUserId, array $meta)
{
    list($row, $lookupError) = fbs_gateway_lookup_member($pdo, $prefix, $tgUserId);
    if ($lookupError !== null) return array(null, false, $lookupError);

    if ($row) {
        $denied = fbs_gateway_member_guard($row);
        if ($denied !== null) return array(null, false, $denied);
        return array(array('id' => (int)$row['id'], 'password' => (string)$row['password']), false, null);
    }

    // 不存在才交给 bridge 建号（它内部 INSERT 的字段集与火鸟第三方登录模板一致）
    list($status, $member, $created, $error) = fbs_bridge_find_or_create_member($pdo, $prefix, $tgUserId, $meta);
    if ($member === null) {
        if ($error === 'member_disabled') {
            return array(null, false, array('code' => 'MEMBER_DISABLED', 'message' => 'member is not active'));
        }
        if ($error === 'db_unavailable') {
            return array(null, false, array('code' => 'DB_QUERY_FAILED', 'message' => 'member lookup failed'));
        }
        return array(null, false, array('code' => 'MEMBER_CREATE_FAILED', 'message' => 'failed to create member'));
    }
    return array($member, (bool)$created, null);
}

/* ============================== 标记 Cookie（HN_tg） ============================== */

/**
 * 由已生成的 HN_login_user Set-Cookie 推出 HN_tg 标记 Cookie。
 *
 * 属性（path / domain / secure / SameSite）**从登录 Cookie 的头里解析出来**再喂回
 * fbs_bridge_cookie_header()，不在这里另写一套取值：即便将来火鸟改了 cookieDomain /
 * httpSecureAccess，两条 Cookie 也不会漂移；域名补 www. 的第二份天然一起复制
 * （它本来就是两条独立的头，逐条派生）。
 *
 * @param  array  $sessionCookies  fbs_bridge_build_session_cookies() 的返回值
 * @param  string $loginName       'HN_login_user'
 * @param  string $markerName      'HN_tg'
 * @param  int    $ttlSeconds      标记 Cookie 有效期
 * @param  int    $now
 * @return array 标记 Cookie 头数组
 */
function fbs_gateway_marker_cookies(array $sessionCookies, $loginName, $markerName, $ttlSeconds = null, $now = null)
{
    if ($ttlSeconds === null) $ttlSeconds = FBS_GATEWAY_MARKER_TTL;
    if ($now === null) $now = time();

    $expires = $now + $ttlSeconds;
    $markers = array();

    foreach ($sessionCookies as $header) {
        $prefix = $loginName . '=';
        if (strpos($header, $prefix) !== 0) continue;

        $semi = strpos($header, ';');
        $tail = ($semi === false) ? '' : substr($header, $semi);

        $path = preg_match('/;\s*path=([^;]*)/i', $tail, $m) ? trim($m[1]) : '';
        $domain = preg_match('/;\s*domain=([^;]*)/i', $tail, $m) ? trim($m[1]) : '';
        $secure = (bool)preg_match('/;\s*secure(\s*;|\s*$)/i', $tail);
        $sameSite = preg_match('/;\s*SameSite=([^;]*)/i', $tail, $m) ? trim($m[1]) : '';

        $markers[] = fbs_bridge_cookie_header($markerName, '1', $expires, $now, $path, $domain, $secure, $sameSite);
    }

    return $markers;
}

/* ============================== 动作实现 ============================== */

/** member_find_or_create → [httpCode, payload] */
function fbs_gateway_action_member_find_or_create(array $params, array $context)
{
    $tgUserId = fbs_gateway_parse_tg_user_id(isset($params['tg_user_id']) ? $params['tg_user_id'] : null);
    if ($tgUserId === null) {
        return fbs_gateway_err(400, 'MISSING_PARAM', 'tg_user_id must be a positive integer');
    }

    list($pdo, $prefix, $dbError) = fbs_gateway_connect($context);
    if ($dbError !== null) return fbs_gateway_err(500, $dbError['code'], $dbError['message']);
    if (!fbs_gateway_valid_prefix($prefix)) {
        return fbs_gateway_err(500, 'CONFIG_INVALID', 'DB_PREFIX contains illegal characters');
    }

    $meta = array(
        'nickname' => fbs_gateway_nickname($params),
        'ip'       => isset($context['ip']) ? (string)$context['ip'] : fbs_bridge_client_ip(),
        'time'     => isset($context['now']) ? (int)$context['now'] : time(),
    );

    list($member, $created, $error) = fbs_gateway_resolve_member($pdo, $prefix, $tgUserId, $meta);
    if ($member === null) {
        $http = ($error['code'] === 'MEMBER_DISABLED' || $error['code'] === 'MEMBER_CANCELLED') ? 403 : 500;
        return fbs_gateway_err($http, $error['code'], $error['message']);
    }

    return fbs_gateway_ok(array(
        'member_id' => (int)$member['id'],
        'created'   => (bool)$created,
    ));
}

/** issue_session → [httpCode, payload] */
function fbs_gateway_action_issue_session(array $params, array $context)
{
    $tgUserId = fbs_gateway_parse_tg_user_id(isset($params['tg_user_id']) ? $params['tg_user_id'] : null);
    if ($tgUserId === null) {
        return fbs_gateway_err(400, 'MISSING_PARAM', 'tg_user_id must be a positive integer');
    }

    list($pdo, $prefix, $dbError) = fbs_gateway_connect($context);
    if ($dbError !== null) return fbs_gateway_err(500, $dbError['code'], $dbError['message']);
    if (!fbs_gateway_valid_prefix($prefix)) {
        return fbs_gateway_err(500, 'CONFIG_INVALID', 'DB_PREFIX contains illegal characters');
    }

    $meta = array(
        'nickname' => fbs_gateway_nickname($params),
        'ip'       => isset($context['ip']) ? (string)$context['ip'] : fbs_bridge_client_ip(),
        'time'     => isset($context['now']) ? (int)$context['now'] : time(),
    );

    list($member, $created, $error) = fbs_gateway_resolve_member($pdo, $prefix, $tgUserId, $meta);
    if ($member === null) {
        $http = ($error['code'] === 'MEMBER_DISABLED' || $error['code'] === 'MEMBER_CANCELLED') ? 403 : 500;
        return fbs_gateway_err($http, $error['code'], $error['message']);
    }

    $now = isset($context['now']) ? (int)$context['now'] : time();
    $cfg = isset($context['config']) ? $context['config'] : fbs_bridge_load_site_config();
    $cfg = array_merge(array(
        'cookiePath'       => '/',
        'cookieDomain'     => '',
        'cookiePre'        => 'HN_',
        'onlinetime'       => 100,
        'httpSecureAccess' => 1,
    ), is_array($cfg) ? $cfg : array());

    // 与原生 keepUser 一致：距上次在线超过 60s 才刷新 online（失败不影响登录态）
    try {
        $stmt = $pdo->prepare('UPDATE `' . $prefix . 'member` SET `online` = ? WHERE `id` = ? AND `online` < ?');
        $stmt->execute(array($now, (int)$member['id'], $now - 60));
    } catch (Throwable $e) {
        error_log('[fbs_gateway] update online failed: ' . $e->getMessage());
    }

    $cookies = fbs_bridge_build_session_cookies((int)$member['id'], (string)$member['password'], $cfg, $now);

    // HN_tg：属性从 HN_login_user 头里解析后回喂 fbs_bridge_cookie_header()，仅有效期改为 30 天
    $cookies = array_merge(
        $cookies,
        fbs_gateway_marker_cookies($cookies, $cfg['cookiePre'] . 'login_user', $cfg['cookiePre'] . 'tg', FBS_GATEWAY_MARKER_TTL, $now)
    );

    return fbs_gateway_ok(array(
        'member_id'   => (int)$member['id'],
        'created'     => (bool)$created,
        'set_cookies' => array_values($cookies),
    ));
}

/* ============================== 分发 ============================== */

/**
 * 动作分发（不含 HTTP 细节，便于 CLI 断言）。
 *
 * 顺序不可调换：密钥 → 动作白名单 → 验签 → 解析 body → 校验入参 → 业务。
 *
 * @param  string $action    动作名
 * @param  string $rawBody   原始请求体（签名就是针对它算的，必须原样传入）
 * @param  string $timestamp X-Fbs-Timestamp
 * @param  string $signature X-Fbs-Signature
 * @param  array  $context   secret / pdo / db_prefix / dbinfo / config / ip / now
 * @return array [httpCode, payload]
 */
function fbs_gateway_dispatch($action, $rawBody, $timestamp, $signature, array $context = array())
{
    $secret = fbs_gateway_secret($context);
    if ($secret === '') {
        error_log('[fbs_gateway] FBS_GATEWAY_SECRET is not configured, refusing all requests');
        return fbs_gateway_err(503, 'GATEWAY_SECRET_NOT_CONFIGURED', 'gateway secret is not configured');
    }

    $action = is_string($action) ? trim($action) : '';
    if ($action === '' || !in_array($action, fbs_gateway_actions(), true)) {
        // 未知动作在 Node 侧是不可达路径（它只会调白名单里的两个），仍按契约返回结构化错误
        return fbs_gateway_err(404, 'UNKNOWN_ACTION', 'unsupported gateway action');
    }

    $rawBody = is_string($rawBody) ? $rawBody : '';
    $now = isset($context['now']) ? (int)$context['now'] : time();

    // 验签在解析入参之前：未通过签名的输入不进入任何业务分支
    list($ok, $reason) = fbs_gateway_verify($secret, $timestamp, $signature, $action, $rawBody, $now);
    if (!$ok) {
        error_log('[fbs_gateway] signature rejected: ' . $reason . ' action=' . $action);
        return fbs_gateway_err(401, 'INVALID_SIGNATURE', 'gateway signature verification failed');
    }

    $params = array();
    if (trim($rawBody) !== '') {
        $json = json_decode($rawBody, true);
        if (!is_array($json)) {
            return fbs_gateway_err(400, 'MISSING_PARAM', 'request body must be a JSON object');
        }
        if (isset($json['params']) && is_array($json['params'])) {
            $params = $json['params'];
        } else {
            unset($json['action']);
            $params = $json;
        }
    }

    try {
        if ($action === 'member_find_or_create') return fbs_gateway_action_member_find_or_create($params, $context);
        return fbs_gateway_action_issue_session($params, $context);
    } catch (Throwable $e) {
        // 绝不把堆栈/DSN 回给调用方
        error_log('[fbs_gateway] action failed: ' . $action . ' :: ' . $e->getMessage());
        return fbs_gateway_err(500, 'INTERNAL_ERROR', 'gateway action failed');
    }
}

/** 从各种可能的入口还原动作名：PATH_INFO / ?action= / JSON 体里的 action */
function fbs_gateway_resolve_action(array $server, array $get, $rawBody)
{
    if (isset($server['PATH_INFO']) && trim((string)$server['PATH_INFO'], '/') !== '') {
        return trim((string)$server['PATH_INFO'], '/');
    }
    if (isset($get['action']) && $get['action'] !== '') return (string)$get['action'];

    $uri = isset($server['REQUEST_URI']) ? (string)$server['REQUEST_URI'] : '';
    $path = parse_url($uri, PHP_URL_PATH);
    if (is_string($path) && $path !== '') {
        foreach (fbs_gateway_actions() as $name) {
            if (substr($path, -strlen('/' . $name)) === '/' . $name) return $name;
        }
    }

    if (is_string($rawBody) && trim($rawBody) !== '') {
        $json = json_decode($rawBody, true);
        if (is_array($json) && isset($json['action']) && is_string($json['action'])) return $json['action'];
    }
    return '';
}

/* ============================== HTTP 入口 ============================== */

function fbs_gateway_http_entry()
{
    $method = isset($_SERVER['REQUEST_METHOD']) ? strtoupper((string)$_SERVER['REQUEST_METHOD']) : 'GET';
    if ($method !== 'POST') {
        header('Allow: POST');
        header('Content-Type: application/json; charset=utf-8');
        http_response_code(405);
        list(, $payload) = fbs_gateway_err(405, 'METHOD_NOT_ALLOWED', 'POST only');
        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
        exit;
    }

    $rawBody   = (string)file_get_contents('php://input');
    $timestamp = isset($_SERVER['HTTP_X_FBS_TIMESTAMP']) ? (string)$_SERVER['HTTP_X_FBS_TIMESTAMP'] : '';
    $signature = isset($_SERVER['HTTP_X_FBS_SIGNATURE']) ? (string)$_SERVER['HTTP_X_FBS_SIGNATURE'] : '';
    $action    = fbs_gateway_resolve_action($_SERVER, $_GET, $rawBody);

    list($httpCode, $payload) = fbs_gateway_dispatch($action, $rawBody, $timestamp, $signature);

    header('Content-Type: application/json; charset=utf-8');
    http_response_code($httpCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

// 入口必须在所有常量与函数就位之后调用：放在文件顶部会先于 define() 执行，
// fbs_gateway_verify() 的默认参数 FBS_GATEWAY_TIME_WINDOW 会退化成字符串并污染输出。
if (!defined('FBS_GATEWAY_TEST')) {
    fbs_gateway_http_entry();
}
