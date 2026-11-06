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
 *   404 COURIER_NOT_FOUND            rider_* 手机号未匹配可用骑手 / courier_id 不可用
 *   409 COURIER_ALREADY_BOUND / TG_ALREADY_BOUND / COURIER_AMBIGUOUS   rider_bind 冲突（不顶替）
 *   429 BIND_RATE_LIMITED            rider_bind 三维度限频（tg 5/60s、phone 3/300s、ip 20/300s）
 *   500 BIND_FAILED                  rider_bind 并发双插撞唯一键（N6：同样落审计，result=error）
 *   503 AUDIT_UNAVAILABLE            rider_bind 审计/限频计数不可用（fail-closed，宁拒勿漏）
 *   503 BRIDGE_CONFIG_MISSING        rider_ql/notify_url 读不到 $fb_bridge_token
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
 *   rider_bind             入参 tg_user_id(必填) / phone(必填) / ip
 *                          → data: {courier_id, idempotent?}
 *                          绑定冲突绝不静默顶替（B1）：409 COURIER_ALREADY_BOUND /
 *                          TG_ALREADY_BOUND / COURIER_AMBIGUOUS；三维度限频 429
 *                          BIND_RATE_LIMITED；审计/计数底账不可用 503 AUDIT_UNAVAILABLE。
 *                          initData 验签在 Node 侧（services/api/src/riderRoute.js +
 *                          telegramAuth，1 小时窗口）完成，本动作信任验签后的 tg_user_id。
 *   rider_ql               入参 courier_id(必填)
 *                          → data: {courier_id, url}   （10 分钟一次性工作台直达 URL）
 *   rider_notify_url       入参 order_id(必填) / courier_id(必填)
 *                          → data: {url}               （派单卡片「查看订单」一次性直达 URL）
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

/** 紧窗签名时间窗（秒）：返回活凭证的动作（issue_session / rider_ql / rider_notify_url）
 *  收紧到 ±15s（窗口分类裁决见 dispatch 内注释与 docs/internal/RIDER_TG_HOOKS.md）。 */
if (!defined('FBS_GATEWAY_TIGHT_WINDOW')) define('FBS_GATEWAY_TIGHT_WINDOW', 15);

/** 紧窗凭证动作的重放账本 TTL（秒）：只需盖过 ±15s 紧窗，留余量覆盖时钟偏移 */
if (!defined('FBS_GATEWAY_REPLAY_ONCE_TTL')) define('FBS_GATEWAY_REPLAY_ONCE_TTL', 120);

/** 标记 Cookie 有效期：30 天（第 3 步 nginx 注入 tg-shim 的开关） */
if (!defined('FBS_GATEWAY_MARKER_TTL')) define('FBS_GATEWAY_MARKER_TTL', 30 * 86400);

/** 动作白名单 */
function fbs_gateway_actions()
{
    return array('member_find_or_create', 'issue_session', 'rider_bind', 'rider_ql', 'rider_notify_url');
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

/** 紧窗凭证动作（rider_ql / rider_notify_url）的重放账本：同一 (签名体, 时间戳) 只放行一次。
 *
 * 与 bridge.php 的 fbs_bridge_replay_check() 同款机制（sha256 键 + flock + 计数过期清零），
 * 差异有二：其一，阈值——issue_session 的 FBS_BRIDGE_REPLAY_MAX=5 是登录防抖（同一 initData
 * 允许几秒内重试网络失败），凭证签发没有「同一次签发重复拿凭证」的语义；其二，放行单位——
 * 这里以 (body, ts) 二元组为准而不是 body 单独：ts 虽在 header，但它参与 HMAC 签名串，同一
 * body 配新 ts 必须重新签名，攻击者没有 secret 签不出来，所以「同参换新 ts」只可能来自
 * 客户端的合法重试（双击、几秒后再点），放行；「同参同 ts」才是真重放，计数拦截。
 *
 * 键为 action + sha256(签名体)（不散列 ts，文件数 = 不同参数组合数），账本内容为
 * `count expiry last_ts`：last_ts !== 当前 ts 视为新请求放行并重记 last_ts，文件不膨胀、无需 GC。
 * （修复轮 4 修正：此前注释声称「签名体含时间戳、换 ts 即换键」，实际 ts 在 header 不在 body，
 * 该写法会把 2 分钟内换 ts 重试的正常用户全部 429——见 Ray F-B1。）
 *
 * 存储写失败 fail-open（口径同 bridge.php：防重放是限流性质的保护，签名窗口本身兜底），
 * 在本函数内留痕（action / 账本目录 / errno），guard 层不再重复记。
 *
 * @param string $key 账本键（调用方保证含 action 前缀避免跨动作挤占）
 * @param int    $ts  请求签名时间戳（dispatch 侧已验过格式）
 * @param string|null $dir 测试注入
 * @return array [allowed(bool), count(int)]，count===0 表示账本不可用（fail-open）
 */
function fbs_gateway_replay_once($key, $ts, $dir = null)
{
    if ($dir === null) {
        $dir = defined('FBS_GATEWAY_REPLAY_DIR')
            ? FBS_GATEWAY_REPLAY_DIR
            : dirname(__DIR__, 2) . '/data/cache/fbs_bridge';
    }
    if (!is_dir($dir)) @mkdir($dir, 0755, true);

    $file = $dir . '/' . hash('sha256', (string)$key) . '.cnt';
    $now  = time();

    $fp = @fopen($file, 'c+');
    if (!$fp) {
        $err = error_get_last();
        error_log('[fbs_gateway] tight-window replay ledger unavailable, protection OFF (fail-open): '
            . 'key=' . (string)$key . ' dir=' . $dir
            . ' :: ' . ($err !== null && isset($err['message']) ? $err['message'] : 'fopen failed'));
        return array(true, 0);
    }

    $allowed = true;
    $count   = 0;
    if (flock($fp, LOCK_EX)) {
        $raw = stream_get_contents($fp);
        $old = array(0, 0, 0);   // count, expiry, last_ts
        if ($raw !== false && $raw !== '') {
            $parts = explode(' ', trim($raw));
            if (count($parts) === 3 && is_numeric($parts[0]) && is_numeric($parts[1]) && is_numeric($parts[2])) {
                $old = array((int)$parts[0], (int)$parts[1], (int)$parts[2]);
            }
        }
        // 过期则清零重记（TTL 只需盖过同一 (body, ts) 的重放窗口，超窗后签名 401 兜底）
        if ($old[1] > $now) {
            $count  = $old[0];
            $expiry = $old[1];
        } else {
            $count  = 0;
            $expiry = $now + FBS_GATEWAY_REPLAY_ONCE_TTL;
        }

        if ($old[2] === (int)$ts) {
            // 同 body 同 ts：真重放，计数（阈值 1，第二次即拒）
            $count++;
        } else {
            // 同 body 换 ts：重新签名的新请求，放行并重记
            $count = 1;
        }

        if ($count > 1) {
            $allowed = false;
        }

        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, $count . ' ' . $expiry . ' ' . (int)$ts);
        fflush($fp);
        flock($fp, LOCK_UN);
    } else {
        // 拿不到锁：fail-open
        $err = error_get_last();
        error_log('[fbs_gateway] tight-window replay ledger lock unavailable, protection OFF (fail-open): '
            . 'key=' . (string)$key . ' dir=' . $dir
            . ' :: ' . ($err !== null && isset($err['message']) ? $err['message'] : 'flock failed'));
        $allowed = true;
        $count = 0;
    }
    fclose($fp);

    return array($allowed, $count);
}

/**
 * fbs_gateway_replay_once 的 guard 封装：放行返回 null，否则 ['code'=>..,'message'=>..]。
 * fail-open 的留痕在 fbs_gateway_replay_once() 内（含 action/目录/errno，文案与登录桥的
 * fbs_gateway_replay_guard 区分），此处 count===0 只做放行不再重复记。
 *
 * @param string $key
 * @param int    $ts
 * @param array  $context  可注入 replay_dir（测试用）
 */
function fbs_gateway_replay_once_guard($key, $ts, array $context)
{
    $dir = array_key_exists('replay_dir', $context) ? $context['replay_dir'] : null;
    list($allowed, $count) = fbs_gateway_replay_once($key, $ts, $dir);

    if (!$allowed) {
        error_log('[fbs_gateway] replay limited (tight window): count=' . $count . ' key=' . (string)$key);
        return array('code' => 'REPLAY_LIMITED', 'message' => 'duplicate credential request within the tight window');
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

/* ============================== 骑手绑定与直达 URL（T6/T7，修复轮 3 移植自旧网关） ============================== */

/**
 * 手机号归一：必须与 Node 侧 services/api/src/riderRoute.js normalizePhone 行为完全一致
 * （改动需两侧同步，否则会出现「同号一边能绑一边绑不上」）。规则：
 *   1. 去空格 / 横线 / 括号 / 点号
 *   2. 前导 +63 转 0；纯数字 63 开头的 12 位同样转 0
 *   3. 结果必须是「0 开头 + 共 10-11 位数字」，否则返回 null
 *
 * @return string|null
 */
function fbs_normalize_phone($raw)
{
    $s = preg_replace('/[\s\-().]+/', '', trim((string)$raw));
    if (strpos($s, '+63') === 0) {
        $s = '0' . substr($s, 3);
    } else if (preg_match('/^63[0-9]{10}$/', $s)) {
        $s = '0' . substr($s, 2);
    }
    if (!preg_match('/^0[0-9]{9,10}$/', $s)) return null;
    return $s;
}

/**
 * 审计/限频只允许安全字符：结果码来自固定集合，手机号已归一（纯数字），ip 去掉一切非地址字符。
 * Node 已传 ip（req.ip）；缺省回落到 fbs_bridge_client_ip()。
 *
 * @return string
 */
function fbs_bind_ip(array $params, array $context)
{
    $raw = isset($params['ip']) ? (string)$params['ip'] : '';
    if ($raw === '') $raw = isset($context['ip']) ? (string)$context['ip'] : fbs_bridge_client_ip();
    return substr(preg_replace('/[^0-9a-fA-F:.]/', '', $raw), 0, 64);
}

/**
 * 绑定审计（B1 补偿控制）：成功与失败都写一行。result 枚举 5+1 类（N6 补 error）：
 *   success / conflict_tg / conflict_courier / not_found / rate_limited / error
 * （error = 并发双插撞 fbs_courier_map 唯一键的最终失败，N6。）
 *
 * 【N4 fail-closed】审计是 B1 两项补偿（限频底账 + 事后排查）的共同前提，写不进去等于
 * 补偿控制静默失效——所以 INSERT 失败必须 error_log（带 tg/phone/ip 便于排查）并返回
 * false，调用方一律 503 AUDIT_UNAVAILABLE 拒绝，宁拒勿漏。
 *
 * @return bool true=写入成功
 */
function fbs_gateway_bind_audit(PDO $pdo, $tgUserId, $courierId, $phone, $result, $ip)
{
    $tg = preg_match('/^[1-9][0-9]{0,18}$/', (string)$tgUserId) ? (string)$tgUserId : '0';
    $cid = (int)$courierId;
    $ph = preg_match('/^0[0-9]{9,10}$/', (string)$phone) ? (string)$phone : '';
    if (!in_array($result, array('success', 'conflict_tg', 'conflict_courier', 'not_found', 'rate_limited', 'error'), true)) $result = 'not_found';
    try {
        $stmt = $pdo->prepare('INSERT INTO fbs_bind_audit (`tg_user_id`, `courier_id`, `phone`, `result`, `ip`) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute(array($tg, $cid, $ph, $result, $ip));
        return true;
    } catch (Throwable $e) {
        // 只记脱敏后的定位字段与错误消息，不落 initData（本动作根本收不到 initData）
        error_log('[fbs_gateway] bind audit failed: tg=' . $tg . ' phone=' . $ph . ' ip=' . $ip
            . ' result=' . $result . ' :: ' . $e->getMessage());
        return false;
    }
}

/**
 * 三维度限频（B1 补偿控制）：以 fbs_bind_audit 为计数底账，无需引入 Redis。
 *   tg_user_id 维度：60  秒内最多 5  次
 *   phone      维度：300 秒内最多 3  次
 *   ip         维度：300 秒内最多 20 次（N5：审计已落 ip 但旧实现没参与限频，
 *              tg 5/60s 挡不住「慢速枚举换号」——同 IP 慢慢换 tg/phone 打满审计表）
 * 被限频的记录本身不计入（result = 'rate_limited' 被排除），否则用户被拦一次就会不断
 * 自我延长窗口，越试越锁死。阈值与 Node 侧 openapi 描述一致。
 *
 * 【N4 fail-closed】COUNT 失败（底账不可读）无法判断是否已超限——拒绝并 error_log，
 * 由调用方 503 AUDIT_UNAVAILABLE，不放行。
 *
 * @return array ['limited'=>bool, 'error'=>array|null]
 */
function fbs_gateway_bind_rate_limited(PDO $pdo, $tgUserId, $phone, $ip)
{
    $tg = preg_match('/^[1-9][0-9]{0,18}$/', (string)$tgUserId) ? (string)$tgUserId : '0';
    $ph = preg_match('/^0[0-9]{9,10}$/', (string)$phone) ? (string)$phone : '';
    $dims = array(
        // [sql 条件, 参数, 窗口秒, 阈值, 维度名]
        array("`tg_user_id` = ?", array($tg), 60, 5, 'tg'),
        array("`phone` = ? AND `phone` != ''", array($ph), 300, 3, 'phone'),
        array("`ip` = ? AND `ip` != ''", array($ip), 300, 20, 'ip'),
    );
    foreach ($dims as $d) {
        list($cond, $args, $window, $max, $name) = $d;
        try {
            $stmt = $pdo->prepare('SELECT COUNT(*) AS `c` FROM fbs_bind_audit WHERE ' . $cond
                . " AND `result` != 'rate_limited' AND `created_at` > NOW() - INTERVAL " . (int)$window . ' SECOND');
            $stmt->execute($args);
            $c = (int)$stmt->fetchColumn();
        } catch (Throwable $e) {
            error_log('[fbs_gateway] bind rate-limit count failed (dim=' . $name . ' tg=' . $tg
                . ' phone=' . $ph . ' ip=' . $ip . ') :: ' . $e->getMessage());
            return array('limited' => false, 'error' => array('code' => 'AUDIT_UNAVAILABLE', 'message' => 'bind rate-limit ledger unavailable'));
        }
        if ($c >= $max) {
            return array('limited' => true, 'error' => null);
        }
    }
    return array('limited' => false, 'error' => null);
}

/**
 * 读桥接配置 $fb_bridge_token（ql.html 令牌的 HMAC 密钥），缺失返回 null。
 * 新网关是自包含入口（不再加载 common.inc.php / HUONIAOINC），直接按仓库相对路径
 * 读 include/config/fbird.inc.php；context['bridge_token'] 供测试注入。
 */
function fbs_gateway_bridge_token(array $context = array())
{
    if (array_key_exists('bridge_token', $context)) {
        $t = (string)$context['bridge_token'];
        return $t !== '' ? $t : null;
    }
    $file = dirname(__DIR__, 2) . '/include/config/fbird.inc.php';
    if (!is_file($file) || !is_readable($file)) {
        error_log('[fbs_gateway] bridge token config missing/unreadable: ' . $file);
        return null;
    }
    $token = (static function ($__file) {
        $fb_bridge_token = null;
        include $__file;
        return $fb_bridge_token;
    })($file);
    return (is_string($token) && $token !== '') ? $token : null;
}

/**
 * 站点基地址（rider_ql / rider_notify_url 拼 /ql.html?token=... 用）。
 * 从站点配置缓存 data/cache/config.php 读 $cfg_basehost + $cfg_httpSecureAccess，
 * scheme 口径与 include/attachment.php:53 一致（$cfg_secureAccess = httpSecureAccess ? 'https://' : 'http://'）。
 * fail-closed：读不到/没配 basehost 返回 null，调用方 503。
 *
 * @return string|null 形如 https://host（不带尾斜杠）
 */
function fbs_gateway_site_base_url(array $context = array())
{
    if (array_key_exists('base_url', $context)) {
        $u = trim((string)$context['base_url']);
        return $u !== '' ? rtrim($u, '/') : null;
    }
    $file = fbs_gateway_site_config_file();
    if (!is_file($file) || !is_readable($file)) {
        error_log('[fbs_gateway] site config missing/unreadable for base url: ' . $file);
        return null;
    }
    $loaded = (static function ($__file) {
        $cfg_basehost = $cfg_httpSecureAccess = null;
        include $__file;
        return array('basehost' => $cfg_basehost, 'secure' => $cfg_httpSecureAccess);
    })($file);
    if (!is_array($loaded) || $loaded['basehost'] === null || trim((string)$loaded['basehost']) === '') {
        error_log('[fbs_gateway] site config does not define $cfg_basehost: ' . $file);
        return null;
    }
    $scheme = ((int)$loaded['secure'] === 1) ? 'https://' : 'http://';
    return $scheme . trim((string)$loaded['basehost']);
}

/**
 * 骑手可用口径：与 waimai.class.php courierQlToken/courierQl 一致（quit != 1 且 status = 1），
 * 保证签出的工作台直达 URL 一定能被 courierQl 接受（两处同样校验，避免绑定成功但登录被拒）。
 *
 * @return bool
 */
function fbs_gateway_courier_usable(PDO $pdo, $prefix, $cid)
{
    try {
        $stmt = $pdo->prepare('SELECT `id` FROM `' . $prefix . 'waimai_courier` WHERE `id` = ? AND `quit` != 1 AND `status` = 1 LIMIT 1');
        $stmt->execute(array((int)$cid));
        return (bool)$stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {
        error_log('[fbs_gateway] courier usable check failed: cid=' . (int)$cid . ' :: ' . $e->getMessage());
        return false;
    }
}

/**
 * G-7：courier_id 是否已绑定（fbs_courier_map 里有行才签发凭证）。
 * rider_ql / rider_notify_url 此前只查 waimai_courier 可用态，不查绑定——未绑定骑手
 * 拿到 courier_id 也能签发 ql token。bind 流程刚插入的行立即可查，不影响主链路。
 * 表名不带前缀：与 rider_bind 的写入方一致（audit/map 表都是无前缀的业务表）。
 */
function fbs_gateway_courier_bound(PDO $pdo, $cid)
{
    try {
        $stmt = $pdo->prepare('SELECT `tg_user_id` FROM `fbs_courier_map` WHERE `courier_id` = ? LIMIT 1');
        $stmt->execute(array((int)$cid));
        return (bool)$stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {
        error_log('[fbs_gateway] courier bound check failed: cid=' . (int)$cid . ' :: ' . $e->getMessage());
        return false;
    }
}

/**
 * 签发骑手 H5 快捷登录令牌：格式必须与 waimai.class.php courierQlToken()/courierQl() 完全一致
 * （base64url(did.exp.target.oid) + '.' + HMAC-SHA256(b64, $fb_bridge_token)，10 分钟有效、无状态，
 * 消费方是 /ql.html?token=...）。改动任一侧都要同步另一侧。
 *
 * @param string $baseUrl fbs_gateway_site_base_url() 的结果（https://host）
 * @return string 完整直达 URL
 */
function fbs_gateway_courier_ql_url($did, $target, $oid, $fb_bridge_token, $baseUrl)
{
    if (!in_array($target, array('index', 'history', 'detail'))) $target = 'index';
    $exp = time() + 600;
    $raw = $did . '.' . $exp . '.' . $target . '.' . $oid;
    $b64 = rtrim(strtr(base64_encode($raw), '+/', '-_'), '=');
    $sig = hash_hmac('sha256', $b64, $fb_bridge_token);
    return $baseUrl . '/ql.html?token=' . $b64 . '.' . $sig;
}

/** rider_bind → [httpCode, payload]。逻辑逐条移植自旧网关（修复轮 2 · B1），仅换 PDO。 */
function fbs_gateway_action_rider_bind(array $params, array $context)
{
    // Node 侧已完成 initData 验签（telegramAuth，1 小时窗口），这里的 tg_user_id 视为可信身份
    $tgUserId = fbs_gateway_parse_tg_user_id(isset($params['tg_user_id']) ? $params['tg_user_id'] : null);
    if ($tgUserId === null) {
        return fbs_gateway_err(400, 'MISSING_PARAM', 'invalid tg_user_id');
    }
    // 归一在 Node 已做过一次，这里是二次防线（网关不假设调用方一定归一，且审计里必须落统一格式）
    $phone = fbs_normalize_phone(isset($params['phone']) ? $params['phone'] : '');
    if ($phone === null) {
        return fbs_gateway_err(400, 'MISSING_PARAM', 'invalid phone');
    }
    $ip = fbs_bind_ip($params, $context);

    list($pdo, $prefix, $dbError) = fbs_gateway_connect($context);
    if ($dbError !== null) return fbs_gateway_err(500, $dbError['code'], $dbError['message']);
    if (!fbs_gateway_valid_prefix($prefix)) {
        return fbs_gateway_err(500, 'CONFIG_INVALID', 'DB_PREFIX contains illegal characters');
    }

    // ① 限频优先于查骑手：避免被刷成一堆不存在手机号的审计行，也避免把 waimai_courier 当探测面
    $rate = fbs_gateway_bind_rate_limited($pdo, $tgUserId, $phone, $ip);
    if ($rate['error'] !== null) {
        return fbs_gateway_err(503, $rate['error']['code'], $rate['error']['message']);
    }
    if ($rate['limited']) {
        if (!fbs_gateway_bind_audit($pdo, $tgUserId, 0, $phone, 'rate_limited', $ip)) {
            return fbs_gateway_err(503, 'AUDIT_UNAVAILABLE', 'bind audit unavailable');
        }
        return fbs_gateway_err(429, 'BIND_RATE_LIMITED', 'too many bind attempts');
    }

    // ② 按手机号查唯一骑手；状态口径同 fbs_gateway_courier_usable
    //    号码必须「两侧都归一」后再比：库内 phone 是历史存量（0 开头 / 63 / +63，且可能带空格横线括号），
    //    只归一入参时，库里存 63 形态（如 639170000101）就永远匹配不上归一后的 09170000101 —— 
    //    表现为用户输对了号码仍一律 COURIER_NOT_FOUND（2026-11-06 canary 实测即此因）。
    //    故 DB 侧先剥分隔符，入参侧展开 0 / 63 / +63 三种写法，1 次 IN 查询覆盖全部存量形态。
    try {
        $digits = "REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(`phone`, ' ', ''), '-', ''), '(', ''), ')', ''), '.', '')";
        $stmt = $pdo->prepare(
            'SELECT `id` FROM `' . $prefix . 'waimai_courier` WHERE ' . $digits . ' IN (?, ?, ?) AND `quit` != 1 AND `status` = 1'
        );
        $rest = substr($phone, 1); // $phone 已归一为 0XXXXXXXXXX
        $stmt->execute(array($phone, '63' . $rest, '+63' . $rest));
        $ret = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {
        error_log('[fbs_gateway] rider_bind courier lookup failed: ' . $e->getMessage());
        return fbs_gateway_err(500, 'DB_QUERY_FAILED', 'courier lookup failed');
    }
    if (!$ret) {
        if (!fbs_gateway_bind_audit($pdo, $tgUserId, 0, $phone, 'not_found', $ip)) {
            return fbs_gateway_err(503, 'AUDIT_UNAVAILABLE', 'bind audit unavailable');
        }
        return fbs_gateway_err(404, 'COURIER_NOT_FOUND', 'courier not found or unavailable');
    }
    if (count($ret) > 1) {
        // 同一手机号命中多位骑手属数据问题：宁可拒绝也不猜，审计记 conflict_courier 便于按手机号排查
        if (!fbs_gateway_bind_audit($pdo, $tgUserId, 0, $phone, 'conflict_courier', $ip)) {
            return fbs_gateway_err(503, 'AUDIT_UNAVAILABLE', 'bind audit unavailable');
        }
        return fbs_gateway_err(409, 'COURIER_AMBIGUOUS', 'multiple couriers match this phone');
    }
    $cid = (int)$ret[0]['id'];

    // ③ 冲突检查：绝不静默顶替（B1）。两个维度各自唯一——
    //    fbs_courier_map.tg_user_id 是主键、courier_id 是唯一键，一对一是硬约束。
    try {
        $stmt = $pdo->prepare('SELECT `tg_user_id`, `courier_id` FROM `fbs_courier_map` WHERE `tg_user_id` = ? OR `courier_id` = ? LIMIT 2');
        $stmt->execute(array((string)$tgUserId, $cid));
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {
        error_log('[fbs_gateway] rider_bind conflict lookup failed: ' . $e->getMessage());
        return fbs_gateway_err(500, 'DB_QUERY_FAILED', 'bind conflict lookup failed');
    }
    $boundCid = null;   // 本 TG 当前绑的骑手
    $boundTg = null;    // 本骑手当前绑的 TG
    if (is_array($rows)) {
        foreach ($rows as $r) {
            if ((string)$r['tg_user_id'] === (string)$tgUserId) $boundCid = (int)$r['courier_id'];
            if ((int)$r['courier_id'] === $cid) $boundTg = (string)$r['tg_user_id'];
        }
    }

    if ($boundCid === $cid) {
        // 同一对 (TG, 骑手) = 幂等成功：只刷新手机号写法，不动别人的绑定，也不签任何凭证
        try {
            $stmt = $pdo->prepare('UPDATE `fbs_courier_map` SET `phone` = ? WHERE `tg_user_id` = ? AND `courier_id` = ?');
            $stmt->execute(array($phone, (string)$tgUserId, $cid));
        } catch (Throwable $e) {
            error_log('[fbs_gateway] rider_bind idempotent update failed: ' . $e->getMessage());
            return fbs_gateway_err(500, 'DB_QUERY_FAILED', 'bind update failed');
        }
        if (!fbs_gateway_bind_audit($pdo, $tgUserId, $cid, $phone, 'success', $ip)) {
            return fbs_gateway_err(503, 'AUDIT_UNAVAILABLE', 'bind audit unavailable');
        }
        return fbs_gateway_ok(array('courier_id' => $cid, 'idempotent' => true));
    }
    if ($boundCid !== null) {
        // 本 TG 已绑别的骑手：用户自己能解，优先报这个（比 courier 冲突更可自助）
        if (!fbs_gateway_bind_audit($pdo, $tgUserId, $cid, $phone, 'conflict_tg', $ip)) {
            return fbs_gateway_err(503, 'AUDIT_UNAVAILABLE', 'bind audit unavailable');
        }
        return fbs_gateway_err(409, 'TG_ALREADY_BOUND', 'this telegram is already bound to another courier');
    }
    if ($boundTg !== null) {
        // 该骑手已被别的 TG 占用：原绑定保持不动
        if (!fbs_gateway_bind_audit($pdo, $tgUserId, $cid, $phone, 'conflict_courier', $ip)) {
            return fbs_gateway_err(503, 'AUDIT_UNAVAILABLE', 'bind audit unavailable');
        }
        return fbs_gateway_err(409, 'COURIER_ALREADY_BOUND', 'this courier is already bound to another telegram');
    }

    try {
        $stmt = $pdo->prepare('INSERT INTO `fbs_courier_map` (`tg_user_id`, `courier_id`, `phone`) VALUES (?, ?, ?)');
        $stmt->execute(array((string)$tgUserId, $cid, $phone));
    } catch (Throwable $e) {
        // N6：并发双插撞唯一键（两副本同时受理同一绑定）也是终态失败，必须落审计（result=error），
        // 否则审计里「成功」与「实际没绑上」对不上账；审计写不进则照样 fail-closed。
        if (!fbs_gateway_bind_audit($pdo, $tgUserId, $cid, $phone, 'error', $ip)) {
            return fbs_gateway_err(503, 'AUDIT_UNAVAILABLE', 'bind audit unavailable');
        }
        error_log('[fbs_gateway] rider_bind insert failed (tg=' . $tgUserId . ' cid=' . $cid . ') :: ' . $e->getMessage());
        return fbs_gateway_err(500, 'BIND_FAILED', 'bind failed');
    }
    if (!fbs_gateway_bind_audit($pdo, $tgUserId, $cid, $phone, 'success', $ip)) {
        return fbs_gateway_err(503, 'AUDIT_UNAVAILABLE', 'bind audit unavailable');
    }
    return fbs_gateway_ok(array('courier_id' => $cid));
}

/** rider_ql → [httpCode, payload]。给已绑定骑手签 10 分钟一次性工作台直达 URL。 */
function fbs_gateway_action_rider_ql(array $params, array $context)
{
    $cid = fbs_gateway_parse_tg_user_id(isset($params['courier_id']) ? $params['courier_id'] : null);
    if ($cid === null) {
        return fbs_gateway_err(400, 'MISSING_PARAM', 'invalid courier_id');
    }
    list($pdo, $prefix, $dbError) = fbs_gateway_connect($context);
    if ($dbError !== null) return fbs_gateway_err(500, $dbError['code'], $dbError['message']);
    if (!fbs_gateway_valid_prefix($prefix)) {
        return fbs_gateway_err(500, 'CONFIG_INVALID', 'DB_PREFIX contains illegal characters');
    }
    if (!fbs_gateway_courier_usable($pdo, $prefix, $cid)) {
        return fbs_gateway_err(404, 'COURIER_NOT_FOUND', 'courier not found or unavailable');
    }
    // G-7：只有已绑定（fbs_courier_map 有行）的骑手才签发 ql token（rider_ql / rider_notify_url 同口径）
    if (!fbs_gateway_courier_bound($pdo, $cid)) {
        return fbs_gateway_err(404, 'COURIER_NOT_FOUND', 'courier is not bound to any telegram user');
    }
    $fb_bridge_token = fbs_gateway_bridge_token($context);
    if ($fb_bridge_token === null) {
        return fbs_gateway_err(503, 'BRIDGE_CONFIG_MISSING', 'bridge config missing');
    }
    $baseUrl = fbs_gateway_site_base_url($context);
    if ($baseUrl === null) {
        return fbs_gateway_err(503, 'CONFIG_MISSING', 'site base url unavailable');
    }
    return fbs_gateway_ok(array('courier_id' => $cid, 'url' => fbs_gateway_courier_ql_url((string)$cid, 'index', 0, $fb_bridge_token, $baseUrl)));
}

/** rider_notify_url → [httpCode, payload]。给派单通知卡生成「打开即该订单详情」的一次性按钮 URL。 */
function fbs_gateway_action_rider_notify_url(array $params, array $context)
{
    $oid = fbs_gateway_parse_tg_user_id(isset($params['order_id']) ? $params['order_id'] : null);
    $cid = fbs_gateway_parse_tg_user_id(isset($params['courier_id']) ? $params['courier_id'] : null);
    if ($oid === null || $cid === null) {
        return fbs_gateway_err(400, 'MISSING_PARAM', 'invalid order_id or courier_id');
    }
    list($pdo, $prefix, $dbError) = fbs_gateway_connect($context);
    if ($dbError !== null) return fbs_gateway_err(500, $dbError['code'], $dbError['message']);
    if (!fbs_gateway_valid_prefix($prefix)) {
        return fbs_gateway_err(500, 'CONFIG_INVALID', 'DB_PREFIX contains illegal characters');
    }
    if (!fbs_gateway_courier_usable($pdo, $prefix, $cid)) {
        return fbs_gateway_err(404, 'COURIER_NOT_FOUND', 'courier not found or unavailable');
    }
    // G-7：只有已绑定（fbs_courier_map 有行）的骑手才签发 ql token（rider_ql / rider_notify_url 同口径）
    if (!fbs_gateway_courier_bound($pdo, $cid)) {
        return fbs_gateway_err(404, 'COURIER_NOT_FOUND', 'courier is not bound to any telegram user');
    }
    $fb_bridge_token = fbs_gateway_bridge_token($context);
    if ($fb_bridge_token === null) {
        return fbs_gateway_err(503, 'BRIDGE_CONFIG_MISSING', 'bridge config missing');
    }
    $baseUrl = fbs_gateway_site_base_url($context);
    if ($baseUrl === null) {
        return fbs_gateway_err(503, 'CONFIG_MISSING', 'site base url unavailable');
    }
    return fbs_gateway_ok(array('url' => fbs_gateway_courier_ql_url((string)$cid, 'detail', (string)$oid, $fb_bridge_token, $baseUrl)));
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

    // 窗口分类（Ray 裁决）：返回活凭证的动作（issue_session / rider_ql / rider_notify_url）
    // 并入紧窗档 ±15s；rider_bind 幂等 + 审计 + 不签任何令牌，无重放收益，维持 ±300s 宽窗。
    // 验签仍在解析入参之前：未通过签名的输入不进入任何业务分支。
    $window = in_array($action, array('issue_session', 'rider_ql', 'rider_notify_url'), true)
        ? FBS_GATEWAY_TIGHT_WINDOW : FBS_GATEWAY_TIME_WINDOW;
    list($ok, $reason) = fbs_gateway_verify($secret, $timestamp, $signature, $action, $rawBody, $now, $window);
    if (!$ok) {
        error_log('[fbs_gateway] signature rejected: ' . $reason . ' action=' . $action);
        return fbs_gateway_err(401, 'INVALID_SIGNATURE', 'gateway signature verification failed');
    }

    // 紧窗凭证动作的重放计数（放在验签之后、业务动作之前）：rider_ql / rider_notify_url
    // 每次成功都签发活凭证，同一签名体只放行一次。账本无需 DB，放在解码之前 fail-fast。
    // issue_session 的重放计数在其自身动作内（initData 维度 max=5 防抖），rider_bind 幂等
    // + 审计兜底，都不走这里。
    if ($action === 'rider_ql' || $action === 'rider_notify_url') {
        $replayDenied = fbs_gateway_replay_once_guard(
            $action . ':' . hash('sha256', $rawBody),
            (int)$timestamp,
            $context
        );
        if ($replayDenied !== null) {
            return fbs_gateway_err(429, $replayDenied['code'], $replayDenied['message']);
        }
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
        // rider 动作（T6/T7）每支显式 return，绝不直落 issue_session 兜底
        if ($action === 'rider_bind') return fbs_gateway_action_rider_bind($params, $context);
        if ($action === 'rider_ql') return fbs_gateway_action_rider_ql($params, $context);
        if ($action === 'rider_notify_url') return fbs_gateway_action_rider_notify_url($params, $context);
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
