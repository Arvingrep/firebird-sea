<?php
/**
 * 火鸟 · 网关动作层（Node ⇄ PHP 的唯一通道）
 *
 * 路由（Node 侧只用第 1 种）：
 *   1. POST /api/fbs/index.php，JSON 体带 {"action": "...", "params": {...}}  ← gatewayClient.js 的拼法
 *   2. POST /api/fbs/index.php?action={action}（冒烟/调试用）
 *   3. POST /api/fbs/{action}（PATH_INFO 形态，仅本地 php -S 直跑时可用；nginx 的
 *      `location ~ \.php$` 接不到这种无后缀路径，生产不可用）
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
 *   429 REPLAY_LIMITED               同一份 initData 在 TTL 窗口内签发次数超限
 *   500 CONFIG_MISSING / CONFIG_INVALID / MEMBER_CREATE_FAILED / DB_QUERY_FAILED / INTERNAL_ERROR
 *   500 DB_UNAVAILABLE               连不上库 / 拿不到建号命名锁（Node 侧改判 503，见 services/api/src/tgLogin.js）
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
 *   issue_session          入参 tg_user_id(必填) / init_data_hash(必填) / first_name / last_name / username
 *                          → data: {member_id, created, set_cookies: [...]}
 *                          init_data_hash = sha256(initData) 的 hex，仅用于防重放记账；
 *                          **不要传 initData 原文**（里面有用户资料，没必要扩大暴露面）。
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
 * 读取网关密钥。取值顺序：$_SERVER → getenv → ''（调用方据此返回 503）。
 *
 * 部署侧的做法是把 Secret 挂成**容器环境变量**（helm 的 secretKeyRef，
 * 见 deploy/helm/firebird-site/templates/_helpers.tpl:84-90），不是 fastcgi_param。
 * 容器 env 能被 PHP 读到，靠的是官方 php:*-fpm 镜像自带的
 * /usr/local/etc/php-fpm.d/docker.conf 里的 `clear_env = no`；
 * 若换基座镜像把 pool 改成 `clear_env = yes`，worker 就看不到 env，网关会一律 503。
 *
 * 两个入口都保留：$_SERVER 覆盖 fastcgi_param / apache SetEnv / 测试注入，
 * getenv() 覆盖纯容器 env —— 少查任何一个都会在某种部署形态下取不到值。
 * 密钥**不得**写进仓库任何文件 / data/cache/*，也不得出现在响应体或日志里。
 *
 * @return string 未配置返回 ''
 */
function fbs_gateway_secret(array $context = array())
{
    if (array_key_exists('secret', $context)) return (string)$context['secret'];

    if (isset($_SERVER['FBS_GATEWAY_SECRET']) && is_string($_SERVER['FBS_GATEWAY_SECRET'])) {
        $v = trim($_SERVER['FBS_GATEWAY_SECRET']);
        if ($v !== '') return $v;
    }

    $env = getenv('FBS_GATEWAY_SECRET');
    if ($env !== false && trim($env) !== '') return trim($env);

    return '';
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

/** init_data_hash：Node 传 sha256(initData) 的 hex。只接受 64 位十六进制，其余一律当缺失。 */
function fbs_gateway_parse_init_data_hash($value)
{
    if (!is_string($value)) return null;
    $text = strtolower(trim($value));
    return preg_match('/^[0-9a-f]{64}$/', $text) === 1 ? $text : null;
}

/* ============================== 站点配置（Cookie 属性）：读不到就失败 ============================== */

/**
 * 火鸟运行时配置文件。测试可 define('FBS_GATEWAY_SITE_CONFIG_FILE', ...) 指向夹具。
 */
function fbs_gateway_site_config_file()
{
    return defined('FBS_GATEWAY_SITE_CONFIG_FILE')
        ? FBS_GATEWAY_SITE_CONFIG_FILE
        : dirname(__DIR__, 2) . '/data/cache/config.php';
}

/**
 * 读取与 Cookie 相关的站点配置。**两级都读不到就报错，不回落到默认值。**
 *
 * 取值顺序（fail-closed 语义不变：绝不静默回落成 cookieDomain='' 的 host-only）：
 *   1. `$context['config']` —— 测试注入，原样保留；
 *   2. `data/cache/config.php` 里的 `$cfg_cookieDomain`（站点一致性优先，env 不覆盖）；
 *   3. 文件缺失 **或** 文件里没写 cookieDomain → `FBS_GATEWAY_COOKIE_DOMAIN`（chart 注入，
 *      与 values 的 `tma.bridge.cookieDomain` 同源）；
 *   4. 两级都拿不到 → 500 CONFIG_MISSING（消息里给出 env 变量名，便于运维自查）。
 *
 * 为什么需要第 3 级（2026-11-06 canary 真机 500 CONFIG_MISSING 的根因）：
 *   - canary 是 baked 模式，`data/` 挂 emptyDir，**每次 Pod 重建 config.php 就消失**；
 *   - 新版火鸟已移除 cookieDomain 自定义（`siteConfig.inc.php` 全文无此变量，
 *     `common.inc.php:84` 注释"新版本不支持cookie作用域自定义"）→ 缓存里永远不会有它。
 *   两条叠加，只认缓存的写法在 canary 上必然 500，且管理员无法通过后台修复。
 *
 * 为什么不复用 bridge.php 的 fbs_bridge_load_site_config()：那个函数在文件缺失时静默回落成
 * cookieDomain=''（host-only）。登录场景里这是最坏的一种失败——cookie 照发、HTTP 200、日志写
 * 「登录成功」，但用户从 x.com 跳到 www.x.com 就变游客，没有任何信号。所以网关这条链路单独
 * fail-closed。
 *
 * 只对 cookieDomain 做强制（它是跨域共享登录态的唯一依据）；cookiePath / onlinetime /
 * httpSecureAccess 缺失时优先取缓存文件、再退化到火鸟默认值（siteConfig.inc.php:35-49），
 * 它们最多影响 Cookie 的有效期与 secure 标记，不会造成「看起来登录成功」的静默错位。
 *
 * @return array [cfg|null, error|null]  error = ['code'=>..,'message'=>..]
 */
function fbs_gateway_load_site_config(array $context)
{
    if (array_key_exists('config', $context)) {
        // 测试注入：只补齐缺省项，不做「文件是否存在」判断（注入本身就是显式覆盖）
        if (!is_array($context['config'])) {
            return array(null, array('code' => 'CONFIG_INVALID', 'message' => 'site config is not an array'));
        }
        $c = $context['config'];
        return array(array(
            'cookiePath'       => (isset($c['cookiePath']) && $c['cookiePath'] !== '') ? (string)$c['cookiePath'] : '/',
            'cookieDomain'     => isset($c['cookieDomain']) ? (string)$c['cookieDomain'] : '',
            'cookiePre'        => (isset($c['cookiePre']) && $c['cookiePre'] !== '') ? (string)$c['cookiePre'] : 'HN_',
            'onlinetime'       => (isset($c['onlinetime']) && (int)$c['onlinetime'] > 0) ? (int)$c['onlinetime'] : 100,
            'httpSecureAccess' => isset($c['httpSecureAccess']) ? (int)$c['httpSecureAccess'] : 1,
        ), null);
    }

    $file = fbs_gateway_site_config_file();
    $loaded = null;
    if (is_file($file) && is_readable($file)) {
        $loaded = (static function ($__file) {
            $cfg_cookiePath = $cfg_cookieDomain = $cfg_onlinetime = $cfg_httpSecureAccess = null;
            include $__file;
            return array(
                'cookiePath'       => $cfg_cookiePath,
                'cookieDomain'     => $cfg_cookieDomain,
                'onlinetime'       => $cfg_onlinetime,
                'httpSecureAccess' => $cfg_httpSecureAccess,
            );
        })($file);
    } else {
        error_log('[fbs_gateway] site config missing/unreadable: ' . $file);
    }

    // 非 cookieDomain 的三项：文件里有就沿用文件（站点一致性优先），没有才用火鸟默认值。
    // 它们最多影响 Cookie 的有效期/secure 标记，不会造成「看着登录成功、跨域却变游客」的静默错位，
    // 所以即使走 env 兜底 cookieDomain，这三项也仍然优先取文件。
    $cookiePath = (is_array($loaded) && is_string($loaded['cookiePath']) && $loaded['cookiePath'] !== '')
        ? $loaded['cookiePath'] : '/';
    $onlinetime = (is_array($loaded) && is_numeric($loaded['onlinetime']) && (int)$loaded['onlinetime'] > 0)
        ? (int)$loaded['onlinetime'] : 100;
    $httpSecureAccess = (is_array($loaded) && $loaded['httpSecureAccess'] !== null && $loaded['httpSecureAccess'] !== '')
        ? (int)$loaded['httpSecureAccess'] : 1;

    // 第一优先：缓存文件里的 $cfg_cookieDomain（站点自己声明的口径，env 不得覆盖）
    if (is_array($loaded) && array_key_exists('cookieDomain', $loaded)
        && $loaded['cookieDomain'] !== null && $loaded['cookieDomain'] !== '') {
        return array(array(
            'cookiePath'       => $cookiePath,
            'cookieDomain'     => (string)$loaded['cookieDomain'],
            // 与 common.inc.php:86 一致：原生在加载配置后仍硬编码 $cfg_cookiePre='HN_'
            'cookiePre'        => 'HN_',
            'onlinetime'       => $onlinetime,
            'httpSecureAccess' => $httpSecureAccess,
        ), null);
    }

    // 第二优先：env 兜底。为什么需要它（canary 实测 500 CONFIG_MISSING）：
    //   1) baked 模式下 data/ 挂 emptyDir（_helpers.tpl 的 data-shared），**每次 Pod 重建
    //      data/cache/config.php 就消失**；
    //   2) 新版火鸟已移除 cookieDomain 自定义（siteConfig.inc.php 无此变量，
    //      common.inc.php:84 注释"新版本不支持cookie作用域自定义"）→ 即便缓存生成过，
    //      里面也永远不会有 $cfg_cookieDomain。
    //   两条叠加 ⇒ 只认缓存的写法在 canary 上必然 500，且管理员无法通过后台修复。
    //   env 与 values-canary 的 tma.bridge.cookieDomain 同源（chart 同一处注入），不会出现两套口径。
    $envDomain = getenv('FBS_GATEWAY_COOKIE_DOMAIN');
    if (is_string($envDomain) && trim($envDomain) !== '') {
        error_log('[fbs_gateway] cookieDomain from env: '
            . (is_array($loaded) ? 'cache lacks $cfg_cookieDomain' : 'cache missing')
            . ' (' . $file . ')');
        return array(array(
            'cookiePath'       => $cookiePath,
            'cookieDomain'     => trim($envDomain),
            'cookiePre'        => 'HN_',
            'onlinetime'       => $onlinetime,
            'httpSecureAccess' => $httpSecureAccess,
        ), null);
    }

    // 两级都拿不到：保持 fail-closed（绝不回落成 cookieDomain='' 的 host-only 静默降级）
    if (!is_array($loaded)) {
        return array(null, array(
            'code'    => 'CONFIG_MISSING',
            'message' => 'data/cache/config.php not found and FBS_GATEWAY_COOKIE_DOMAIN is not set',
        ));
    }
    error_log('[fbs_gateway] site config does not define $cfg_cookieDomain: ' . $file);
    return array(null, array(
        'code'    => 'CONFIG_MISSING',
        'message' => 'cookieDomain is not configured (set $cfg_cookieDomain in data/cache/config.php or FBS_GATEWAY_COOKIE_DOMAIN)',
    ));
}

/* ============================== 防重放 ============================== */

/**
 * 记账并判断是否超限。放行返回 null，否则 ['code'=>..,'message'=>..]。
 *
 * 复用 bridge.php:198-248 的 fbs_bridge_replay_check()（不新增表、不新增存储）。
 * 传入的是 sha256(initData) 的十六进制串，函数内部会再 hash 一次，因此键空间与
 * bridge.php 直连路径（用的是 initData 原文）天然隔离，两条路径的配额不会互相挤占。
 *
 * 【窗口不变量】计数窗口 TTL 取 bridge.php:79 的 FBS_BRIDGE_REPLAY_TTL = 7200s，
 * 必须 ≥ Node 侧的登录时效 LOGIN_MAX_AGE_SECONDS = 3600s（services/api/src/tgLogin.js）。
 * 因为 initData 从 auth_date 起最多只被接受 1 小时，而计数窗口从「首次成功使用」起算 2 小时，
 * 首次使用必然晚于 auth_date，所以同一份 initData 的整个可用期都落在同一个计数窗口内，
 * 「5 次/份」在登录链路上是严格成立的。
 * ⚠ 若把 Node 的 LOGIN_MAX_AGE_SECONDS 调大到 ≥7200，必须同步调大这个 TTL，
 *   否则 2 小时后计数清零，同一份 initData 可以再换 5 次 Cookie。
 *   （tg-login.test.js 有一条断言把这条不变量钉住。）
 *
 * @param string $initDataHash
 * @param array  $context  可注入 replay_dir（测试用）
 */
function fbs_gateway_replay_guard($initDataHash, array $context)
{
    $dir = array_key_exists('replay_dir', $context) ? $context['replay_dir'] : null;
    list($allowed, $count) = fbs_bridge_replay_check($initDataHash, $dir);

    // count===0 只可能来自两条 fail-open 分支（目录不可写 / 拿不到 flock，见 bridge.php:211-213、241-243）。
    // 保持 fail-open（登录可用性优先于该辅助防护），但必须留痕：否则重放防护静默关闭，没人知道。
    if ($count === 0) {
        error_log('[fbs_gateway] replay store unavailable, replay protection is OFF (fail-open)');
        return null;
    }

    if (!$allowed) {
        error_log('[fbs_gateway] replay limited: count=' . $count);
        return array('code' => 'REPLAY_LIMITED', 'message' => 'too many logins with the same init data');
    }
    return null;
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
 * 拿建号命名锁（MySQL GET_LOCK）。返回 ['name'=>string|null, 'error'=>array|null]。
 *
 * 为什么需要：member.username 在火鸟库里只有普通索引、没有唯一约束（本步不改表结构），
 * 并发首登会插出两行同 username 的会员；随后 fbs_gateway_lookup_member() 用 LIMIT 1，
 * 可能稳定命中「另一行」——表现为同一 TG 用户看到自己另一个空账号的订单。
 * GET_LOCK 是库级全局的，多 Pod 下同样有效（前提是连同一个库）。
 *
 * 非 MySQL 驱动（测试用 SQLite）没有 GET_LOCK，直接跳过：不影响被测逻辑，
 * 锁本身靠 code review + 本机 mysql 容器验证。
 *
 * @return array ['name'=>string|null, 'error'=>array|null]
 */
function fbs_gateway_member_lock(PDO $pdo, $tgUserId, $timeoutSeconds = 3)
{
    try {
        $driver = (string)$pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
    } catch (Throwable $e) {
        $driver = '';
    }
    if ($driver !== 'mysql') {
        return array('name' => null, 'error' => null);
    }

    $name = 'fbs_member_create_' . (int)$tgUserId; // 固定前缀 + 纯数字，长度远小于 MySQL 的 64 字符上限
    try {
        $stmt = $pdo->prepare('SELECT GET_LOCK(?, ?)');
        $stmt->execute(array($name, (int)$timeoutSeconds));
        $got = $stmt->fetchColumn();
    } catch (Throwable $e) {
        error_log('[fbs_gateway] GET_LOCK failed: ' . $e->getMessage());
        return array('name' => null, 'error' => array('code' => 'DB_UNAVAILABLE', 'message' => 'member create lock unavailable'));
    }

    // GET_LOCK: 1=拿到，0=超时，NULL=出错。后两者一律按瞬态故障处理，让客户端稍后重试。
    if ((int)$got !== 1) {
        error_log('[fbs_gateway] GET_LOCK timeout for ' . $name);
        return array('name' => null, 'error' => array('code' => 'DB_UNAVAILABLE', 'message' => 'member create lock timeout'));
    }

    // 自证：锁必须由「本条连接」持有。
    // GET_LOCK 是连接级的，在 A 连接取、B 连接放等于没加锁（锁会一直挂在 A 上直到 A 断开），
    // 这种实现「并发跑起来也像是好的」，最难查。所以每次取锁后多问一句 IS_USED_LOCK 是不是自己：
    // 将来若有人把这里改成连接池 / 每条语句一个连接，这一句会立刻失配 → 503，而不是静默变摆设。
    try {
        $stmt = $pdo->prepare('SELECT IS_USED_LOCK(?) AS holder, CONNECTION_ID() AS me');
        $stmt->execute(array($name));
        $holderRow = $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {
        error_log('[fbs_gateway] lock self-check failed: ' . $e->getMessage());
        fbs_gateway_member_unlock($pdo, $name);
        return array('name' => null, 'error' => array('code' => 'DB_UNAVAILABLE', 'message' => 'member create lock unavailable'));
    }

    $holder = $holderRow ? $holderRow['holder'] : null;
    $me     = $holderRow ? $holderRow['me'] : null;
    if ($holder === null || $me === null || (int)$holder !== (int)$me) {
        error_log('[fbs_gateway] lock not held by this connection: holder=' . var_export($holder, true)
            . ' me=' . var_export($me, true) . ' name=' . $name);
        fbs_gateway_member_unlock($pdo, $name);
        return array('name' => null, 'error' => array('code' => 'DB_UNAVAILABLE', 'message' => 'member create lock not held by this connection'));
    }

    return array('name' => $name, 'error' => null);
}

/** 释放命名锁。失败只记日志：会话结束/连接关闭时 MySQL 也会自动释放。 */
function fbs_gateway_member_unlock(PDO $pdo, $name)
{
    if (!is_string($name) || $name === '') return;
    try {
        $stmt = $pdo->prepare('SELECT RELEASE_LOCK(?)');
        $stmt->execute(array($name));
    } catch (Throwable $e) {
        error_log('[fbs_gateway] RELEASE_LOCK failed: ' . $e->getMessage());
    }
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

    // 首登：把「查 + 建」串行化（详见 fbs_gateway_member_lock 的说明）
    $lock = fbs_gateway_member_lock($pdo, $tgUserId);
    if ($lock['error'] !== null) return array(null, false, $lock['error']);

    try {
        // 拿到锁之后必须复查：先到的请求可能已经建好
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
    } finally {
        fbs_gateway_member_unlock($pdo, $lock['name']);
    }
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
    // 必填：没有它就无法记账，静默跳过等于把防重放关掉而没人知道
    $initDataHash = fbs_gateway_parse_init_data_hash(isset($params['init_data_hash']) ? $params['init_data_hash'] : null);
    if ($initDataHash === null) {
        return fbs_gateway_err(400, 'MISSING_PARAM', 'init_data_hash must be sha256 hex (64 chars)');
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

    // fail-closed：站点配置读不到就报错，不拿 cookieDomain='' 之类的默认值凑（见函数说明）
    list($cfg, $cfgError) = fbs_gateway_load_site_config($context);
    if ($cfgError !== null) {
        return fbs_gateway_err(500, $cfgError['code'], $cfgError['message']);
    }

    // 记账放在「会员解析成功之后、签发 Cookie 之前」：
    // 被禁用/已注销/建号失败/配置缺失这类失败路径都不消耗额度，用户修好后不会先撞上 429。
    // （bridge.php 的直连入口是先记账再查库，那个顺序会把失败也计入，这里刻意不抄。）
    $replayDenied = fbs_gateway_replay_guard($initDataHash, $context);
    if ($replayDenied !== null) {
        return fbs_gateway_err(429, $replayDenied['code'], $replayDenied['message']);
    }

    $now = isset($context['now']) ? (int)$context['now'] : time();

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
