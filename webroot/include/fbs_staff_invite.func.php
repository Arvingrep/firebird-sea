<?php
/**
 * 员工 Telegram 邀请 token：生成 / 校验 / 深链拼装（纯函数库）。
 *
 * 【依赖铁律】本文件不得 require bridge.php 或任何框架文件（common.inc.php 等）：
 * gateway（webroot/api/fbs/index.php，已 require bridge.php）与落地页（webroot/tg/staff.php，
 * 直接 require bridge.php）两侧都会加载它，任何框架依赖都会造成双向包含或
 * swoole_loader 强耦合。$fb_bridge_token 用「隔离作用域 include」自读
 * （与 fbs_gateway_bridge_token() 同款写法，见 webroot/api/fbs/index.php:989）。
 *
 * token 格式（与 bot 线 /staff 校验、B 线 staffInvite 返回值共享的冻结契约）：
 *   payload = "v1_" + sid + "_" + exp          # exp = unix 秒，ttl 默认 86400（24h）
 *   hmac    = substr(hash_hmac('sha256', payload, $fb_bridge_token), 0, 32)
 *   token   = payload + "_" + hmac             # 例：v1_1_1794361000_9f2c8a...（47 字符）
 *
 * 深链形如 https://t.me/<bot>?start=staff_<token>；「staff_ 前缀 + token」必须 ≤ 64 字节
 * （Telegram start 参数上限）。sid 只能来自商家后台（B 线 staffInvite action），员工不能
 * 靠改 sid 绑到别家店——HMAC 覆盖 payload 整体，篡改任意字段必失败。
 *
 * 失败一律返回 '' / false，绝不抛异常、不 error_log token 本体（HMAC 密钥也不落日志）。
 */

/** bot 用户名兜底（brief-staff.md 冻结）：配置缺失时不 fail，链接生成仍可用 */
if (!defined('FBS_STAFF_INVITE_BOT_FALLBACK')) define('FBS_STAFF_INVITE_BOT_FALLBACK', 'fbird_men_bot');

/**
 * 读桥接 HMAC 密钥 $fb_bridge_token（include/config/fbird.inc.php，已入库的静态串）。
 * 隔离作用域 include：不污染本文件作用域，配置文件里多余的变量不会泄漏。
 *
 * @return string 读不到返回 ''，绝不抛异常
 */
function fbs_staff_invite_bridge_token()
{
    // 本文件在 webroot/include/ 下，fbird.inc.php 在同目录的 config/ 子目录
    $file = __DIR__ . '/config/fbird.inc.php';
    if (!is_file($file) || !is_readable($file)) {
        error_log('[fbs_staff_invite] bridge token config missing/unreadable: ' . $file);
        return '';
    }
    $token = (static function ($__file) {
        $fb_bridge_token = '';
        include $__file;
        return $fb_bridge_token;
    })($file);
    return (is_string($token) && $token !== '') ? $token : '';
}

/**
 * bot 用户名，依次读：
 *   1. getenv('FBS_TG_BOT_USERNAME')（容器 env，部署侧注入）
 *   2. data/cache/config.php 的 $cfg_telegramBotUsername（运行时缓存）
 *   3. 兜底 'fbird_men_bot'
 * 隔离作用域 include 同上；配置文件读不到不报错（走兜底）。
 *
 * @return string 不带 @ 前缀
 */
function fbs_staff_invite_bot_username()
{
    $env = getenv('FBS_TG_BOT_USERNAME');
    if ($env !== false && trim($env) !== '') {
        return ltrim(trim($env), '@');
    }
    $file = dirname(__DIR__, 2) . '/data/cache/config.php';
    if (is_file($file) && is_readable($file)) {
        $cfg_telegramBotUsername = '';
        (static function ($__file, &$cfg_telegramBotUsername) {
            include $__file;
        })($file, $cfg_telegramBotUsername);
        if (is_string($cfg_telegramBotUsername) && trim($cfg_telegramBotUsername) !== '') {
            return ltrim(trim($cfg_telegramBotUsername), '@');
        }
    }
    return FBS_STAFF_INVITE_BOT_FALLBACK;
}

/**
 * 生成邀请 token：v1_<sid>_<exp>_<hmac32>。
 *
 * @param int|null $sid        business_list.id，必须是正整数
 * @param int      $ttlSeconds 有效期秒数（默认 86400 = 24h）
 * @param string|null $bridgeToken HMAC 密钥；null 时自读 fbird.inc.php
 * @return string 失败返回 ''
 */
function fbs_staff_invite_token($sid, $ttlSeconds = 86400, $bridgeToken = null)
{
    if (!is_int($sid) && !(is_string($sid) && preg_match('/^[1-9][0-9]{0,9}$/', $sid))) {
        return '';
    }
    $sid = (int)$sid;
    if ($sid <= 0) return '';
    $ttl = (int)$ttlSeconds;
    if ($ttl <= 0) return '';

    $key = ($bridgeToken === null) ? fbs_staff_invite_bridge_token() : (string)$bridgeToken;
    if ($key === '') return '';

    $exp = time() + $ttl;
    $payload = 'v1_' . $sid . '_' . $exp;
    $hmac = substr(hash_hmac('sha256', $payload, $key), 0, 32);
    $token = $payload . '_' . $hmac;

    // Telegram start 参数 ≤ 64 字节：staff_ 前缀 + token 必须 ≤ 64
    if (strlen('staff_' . $token) > 64) return '';
    if (!preg_match('/^[a-z0-9_]+$/', $token)) return '';
    return $token;
}

/**
 * 校验邀请 token。
 *
 * @param string      $token       v1_<sid>_<exp>_<hmac32>
 * @param string|null $bridgeToken HMAC 密钥；null 时自读 fbird.inc.php
 * @param int|null    $now         当前 unix 秒；null 用 time()
 * @return array|false ['sid'=>int, 'exp'=>int]；格式错 / 签名错 / 过期一律 false
 */
function fbs_staff_invite_parse($token, $bridgeToken = null, $now = null)
{
    if (!is_string($token) || $token === '') return false;
    if (!preg_match('/^v1_([1-9][0-9]{0,9})_([0-9]{10,12})_([0-9a-f]{32})$/', $token, $m)) {
        return false;
    }

    $key = ($bridgeToken === null) ? fbs_staff_invite_bridge_token() : (string)$bridgeToken;
    if ($key === '') return false;

    $payload = 'v1_' . $m[1] . '_' . $m[2];
    $expected = substr(hash_hmac('sha256', $payload, $key), 0, 32);
    // 常量时间比较：逐字节试探会被计时侧信道枚举
    if (!hash_equals($expected, $m[3])) return false;

    $exp = (int)$m[2];
    if ($now === null) $now = time();
    if ($exp < (int)$now) return false;

    return array('sid' => (int)$m[1], 'exp' => $exp);
}

/**
 * 拼装 Telegram 深链：https://t.me/<bot>?start=staff_<token>。
 *
 * @param int|null    $sid        business_list.id
 * @param string      $botUsername bot 用户名（允许带 @ 前缀，自动剥掉）
 * @param int         $ttlSeconds 有效期秒数
 * @param string|null $bridgeToken HMAC 密钥；null 时自读 fbird.inc.php
 * @return string 失败返回 ''
 */
function fbs_staff_invite_link($sid, $botUsername, $ttlSeconds = 86400, $bridgeToken = null)
{
    $token = fbs_staff_invite_token($sid, $ttlSeconds, $bridgeToken);
    if ($token === '') return '';
    // bot 用户名只可能是 [A-Za-z0-9_]：这里清洗而非校验，畸形输入退化为兜底也没关系
    // ——绝不能让未清洗的字符串进 URL（inject 进 host 部分）。
    $bot = preg_replace('/[^A-Za-z0-9_]/', '', ltrim((string)$botUsername, '@'));
    if ($bot === '') $bot = FBS_STAFF_INVITE_BOT_FALLBACK;
    return 'https://t.me/' . $bot . '?start=staff_' . $token;
}
