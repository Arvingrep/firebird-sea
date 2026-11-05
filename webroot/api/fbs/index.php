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
 * 鉴权（安全边界，不可关闭）：
 *   X-Fbs-Timestamp : 秒级 Unix 时间戳
 *   X-Fbs-Signature : hex(HMAC-SHA256(secret, "timestamp\naction\nrawBody"))
 *   与 services/api/src/gatewayClient.js:6-8 的 sign() 完全一致。
 *   密钥只从环境变量 FBS_GATEWAY_SECRET 读取；未配置时一律 503，
 *   不存在"没配密钥就放行"的分支。
 *   时间窗 ±300s；签名用 hash_equals 常量时间比较。
 *
 * 动作：
 *   member_find_or_create  入参 tg_user_id(必填) / first_name / last_name / username
 *                          → {code:0, member_id, created}
 *   issue_session          入参 tg_user_id(必填)
 *                          → {code:0, member_id, set_cookies: [...]}
 *
 * set_cookies 是可直接 header('Set-Cookie: ...') 的完整头字符串，由 PHP 侧生成；
 * Node 不得重新拼装任何属性（domain/path/secure/SameSite/expires 都在这里定死），
 * 否则两侧一旦漂移就会出现"PHP 认账、浏览器不认账"的登录态错位。
 *
 * 错误码：401 签名/时间戳不合法；404 未知动作；400 入参缺失；403 会员被禁用；
 *        503 网关密钥未配置；500 内部错误（不输出堆栈）。
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
 * @return array [ok(bool), httpCode(int), error(string)]
 */
function fbs_gateway_verify($secret, $timestamp, $signature, $action, $body, $now = null, $window = null)
{
    if ($now === null) $now = time();
    if ($window === null) $window = FBS_GATEWAY_TIME_WINDOW;

    if (!is_string($timestamp) || !preg_match('/^\d{1,12}$/', $timestamp)) {
        return array(false, 401, 'invalid_timestamp');
    }
    if (!is_string($signature) || !preg_match('/^[0-9a-fA-F]{64}$/', $signature)) {
        return array(false, 401, 'invalid_signature');
    }
    if (abs($now - (int)$timestamp) > $window) {
        return array(false, 401, 'stale_timestamp');
    }

    $expected = fbs_gateway_sign($secret, $timestamp, $action, $body);
    if (!hash_equals($expected, strtolower($signature))) {
        return array(false, 401, 'invalid_signature');
    }
    return array(true, 0, '');
}

/* ============================== 数据库连接 ============================== */

/**
 * 取 PDO 与表前缀。测试可注入 $context['pdo'] / $context['db_prefix']。
 *
 * @return array [PDO|null, string $prefix, array|null $error]
 */
function fbs_gateway_connect(array $context)
{
    if (isset($context['pdo']) && $context['pdo'] instanceof PDO) {
        $prefix = isset($context['db_prefix']) ? (string)$context['db_prefix'] : 'huoniao_';
        return array($context['pdo'], $prefix, null);
    }

    $dbinfo = isset($context['dbinfo']) ? $context['dbinfo'] : fbs_bridge_load_db_config();
    if (isset($dbinfo['error'])) {
        return array(null, '', array('error' => $dbinfo['error'], 'message' => $dbinfo['message']));
    }

    list($pdo, $dbError) = fbs_bridge_db_connect($dbinfo);
    if ($dbError !== null) return array(null, '', $dbError);

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

/* ============================== 标记 Cookie（HN_tg） ============================== */

/**
 * 由已生成的 HN_login_user Set-Cookie 推出 HN_tg 标记 Cookie。
 *
 * 属性（path / domain / secure / SameSite）**逐字符复用**登录 Cookie 的那一段，
 * 不在这里另写一套取值：把首个 ';' 之后的部分整段搬过来，只替换 expires 与 Max-Age。
 * 这样即便将来火鸟改了 cookieDomain / httpSecureAccess，两条 Cookie 也不会漂移。
 * 域名补 www. 的第二份天然一起复制（它本来就是两条独立的头）。
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

    $expires = gmdate('D, d M Y H:i:s', $now + $ttlSeconds) . ' GMT';
    $markers = array();

    foreach ($sessionCookies as $header) {
        $prefix = $loginName . '=';
        if (strpos($header, $prefix) !== 0) continue;

        $semi = strpos($header, ';');
        $tail = ($semi === false) ? '' : substr($header, $semi);

        // 换掉有效期两项，其余属性原样保留
        $tail = preg_replace('/;\s*expires=[^;]*/', '; expires=' . $expires, $tail, 1);
        if ($tail !== null && strpos($tail, 'Max-Age=') !== false) {
            $tail = preg_replace('/;\s*Max-Age=\d+/', '; Max-Age=' . (int)$ttlSeconds, $tail, 1);
        } elseif ($tail !== null) {
            $tail .= '; Max-Age=' . (int)$ttlSeconds;
        }

        $markers[] = $markerName . '=1' . $tail;
    }

    return $markers;
}

/* ============================== 动作实现 ============================== */

/** member_find_or_create → [httpCode, payload] */
function fbs_gateway_action_member_find_or_create(array $params, array $context)
{
    $tgUserId = fbs_gateway_parse_tg_user_id(isset($params['tg_user_id']) ? $params['tg_user_id'] : null);
    if ($tgUserId === null) {
        return array(400, array('code' => 400, 'error' => 'invalid_tg_user_id', 'message' => 'tg_user_id must be a positive integer'));
    }

    list($pdo, $prefix, $dbError) = fbs_gateway_connect($context);
    if ($dbError !== null) {
        return array(500, array('code' => 500, 'error' => $dbError['error'], 'message' => $dbError['message']));
    }
    if (!fbs_gateway_valid_prefix($prefix)) {
        return array(500, array('code' => 500, 'error' => 'config_invalid', 'message' => 'DB_PREFIX contains illegal characters'));
    }

    $meta = array(
        'nickname' => fbs_gateway_nickname($params),
        'ip'       => isset($context['ip']) ? (string)$context['ip'] : fbs_bridge_client_ip(),
        'time'     => isset($context['now']) ? (int)$context['now'] : time(),
    );

    list($status, $member, $created, $error) = fbs_bridge_find_or_create_member($pdo, $prefix, $tgUserId, $meta);
    if ($member === null) {
        return array($status, array(
            'code'    => $status,
            'error'   => $error,
            'message' => ($error === 'member_disabled')
                ? 'member exists but is not active (state != 1)'
                : 'member lookup failed',
        ));
    }

    return array(200, array(
        'code'      => 0,
        'member_id' => (int)$member['id'],
        'created'   => (bool)$created,
    ));
}

/** issue_session → [httpCode, payload] */
function fbs_gateway_action_issue_session(array $params, array $context)
{
    $tgUserId = fbs_gateway_parse_tg_user_id(isset($params['tg_user_id']) ? $params['tg_user_id'] : null);
    if ($tgUserId === null) {
        return array(400, array('code' => 400, 'error' => 'invalid_tg_user_id', 'message' => 'tg_user_id must be a positive integer'));
    }

    list($pdo, $prefix, $dbError) = fbs_gateway_connect($context);
    if ($dbError !== null) {
        return array(500, array('code' => 500, 'error' => $dbError['error'], 'message' => $dbError['message']));
    }
    if (!fbs_gateway_valid_prefix($prefix)) {
        return array(500, array('code' => 500, 'error' => 'config_invalid', 'message' => 'DB_PREFIX contains illegal characters'));
    }

    $meta = array(
        'nickname' => fbs_gateway_nickname($params),
        'ip'       => isset($context['ip']) ? (string)$context['ip'] : fbs_bridge_client_ip(),
        'time'     => isset($context['now']) ? (int)$context['now'] : time(),
    );

    list($status, $member, $created, $error) = fbs_bridge_find_or_create_member($pdo, $prefix, $tgUserId, $meta);
    if ($member === null) {
        return array($status, array(
            'code'    => $status,
            'error'   => $error,
            'message' => ($error === 'member_disabled')
                ? 'member exists but is not active (state != 1)'
                : 'member lookup failed',
        ));
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
    } catch (Exception $e) {
        error_log('[fbs_gateway] update online failed: ' . $e->getMessage());
    }

    $cookies = fbs_bridge_build_session_cookies((int)$member['id'], (string)$member['password'], $cfg, $now);

    // HN_tg：属性逐字符复用 HN_login_user，仅有效期改为 30 天
    $cookies = array_merge(
        $cookies,
        fbs_gateway_marker_cookies($cookies, $cfg['cookiePre'] . 'login_user', $cfg['cookiePre'] . 'tg', FBS_GATEWAY_MARKER_TTL, $now)
    );

    return array(200, array(
        'code'        => 0,
        'member_id'   => (int)$member['id'],
        'created'     => (bool)$created,
        'set_cookies' => array_values($cookies),
    ));
}

/* ============================== 分发 ============================== */

/**
 * 动作分发（不含 HTTP 细节，便于 CLI 断言）。
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
        return array(503, array('code' => 503, 'error' => 'gateway_not_configured', 'message' => 'gateway secret is not configured'));
    }

    $action = is_string($action) ? trim($action) : '';
    if ($action === '' || !in_array($action, fbs_gateway_actions(), true)) {
        return array(404, array('code' => 404, 'error' => 'unknown_action', 'message' => 'unsupported gateway action'));
    }

    $rawBody = is_string($rawBody) ? $rawBody : '';
    $now = isset($context['now']) ? (int)$context['now'] : time();

    list($ok, $code, $error) = fbs_gateway_verify($secret, $timestamp, $signature, $action, $rawBody, $now);
    if (!$ok) {
        return array($code, array('code' => $code, 'error' => $error, 'message' => 'gateway signature verification failed'));
    }

    // 签名通过后才解析 body：未通过签名的输入不进入任何业务分支
    $params = array();
    if (trim($rawBody) !== '') {
        $json = json_decode($rawBody, true);
        if (!is_array($json)) {
            return array(400, array('code' => 400, 'error' => 'invalid_body', 'message' => 'request body must be a JSON object'));
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
        return array(500, array('code' => 500, 'error' => 'internal_error', 'message' => 'gateway action failed'));
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
        echo json_encode(array('code' => 405, 'error' => 'method_not_allowed', 'message' => 'POST only'));
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
