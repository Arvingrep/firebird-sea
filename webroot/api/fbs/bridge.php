<?php
/**
 * 火鸟 · 登录桥 —— Telegram Mini App initData 验签接口（HMAC-SHA256 + 防重放）
 *
 * 路由：POST/GET webroot/api/fbs/bridge.php?initData=<urlencoded initData>
 *      也支持 POST 表单字段 initData、或 JSON 体 {"initData": "..."}、或原始 query 串 body。
 * 输出：
 *   - 不带 next 参数：JSON（验签通过 → 签发火鸟会话 Cookie → 返回 code:0 + member_id）
 *   - 带 next 参数（且为站内相对路径）：Set-Cookie + 302 Location: <next>
 *   next 的站内校验见 fbs_bridge_safe_next()，非法值回退到 H5 首页，杜绝开放重定向。
 *
 * 验签算法（Telegram 官方规范）：
 *   1. secret_key = hash_hmac('sha256', bot_token, 'WebAppData', true)   // message=bot_token, key="WebAppData"
 *   2. data_check_string：解析 initData（URL query 格式），剔除 hash 字段，
 *      其余字段按 key=value 升序排序后用 "\n" 连接；signature 字段（若存在）参与串内。
 *   3. calculated = hash_hmac('sha256', data_check_string, secret_key)，与 initData 的 hash
 *      字段用 hash_equals 做常量时间比较。
 * 时效：auth_date 距今 > 3600s 拒绝(401)；auth_date 在未来 > 60s 拒绝(401)。
 * 用户：必须包含 user 字段（URL-encoded JSON）且 user.id 存在，否则 403。
 *
 * ----------------------------------------------------------------------------------------------
 * 【防重放存储方案选择】
 * 火鸟现有封装调研结论：
 *   - Redis：include/class/memory.class.php + memory_redis.class.php 可用，但它依赖
 *     common.inc.php 完整引导；而 common.inc.php 强制要求 swoole_loader 扩展且 PHP 版本必须
 *     恰好为 7.4，且全站未发现 $cfg_memory 配置定义（Redis 默认未启用）。
 *   - MySQL：dsql/$dbo 同样依赖 common.inc.php 完整引导。
 *   - FileCache（include/class/FileCache.class.php）：不依赖引导，但其 get/set 是
 *     "读-改-写" 三步，非原子操作，做计数器在并发下会漏计。
 * 因此本端点做成自包含（不引 common.inc.php），防重放落地为【文件锁计数器】：
 *   - 存储目录：webroot/data/cache/fbs_bridge/（与火鸟缓存同区，可整目录清理）；
 *   - 每个完整 initData 的 sha256 一个文件，内容 "count expiry"，flock(LOCK_EX) 下
 *     读-增-写，保证多进程 FPM 原子递增；
 *   - TTL 2 小时（覆盖 1 小时签名有效期），过期文件写入时惰性清零/覆盖，无 GC 任务。
 * 理由：无新增依赖、无建表、无 Redis 前提，是最轻且并发安全的方案。若站点后续启用
 * Redis，只需替换 fbs_bridge_replay_check() 内部实现为 $HN_memory->inc() 即可。
 * 存储写失败时选择放行（fail-open）：防重放是限流性质的保护，不应因存储故障而全量拒登；
 * 攻击者拿不到合法 initData 本体，重放本身不产生额外收益。
 *
 * ----------------------------------------------------------------------------------------------
 * 【bot_token 配置位置】（禁止硬编码任何真实 token）
 * 读取顺序：
 *   1. 火鸟配置缓存 webroot/data/cache/config.php 中的 $cfg_telegramBotToken
 *      （若后续在火鸟后台新增该配置项，写入缓存配置后自动生效，无需改代码）；
 *   2. 环境变量 FBS_TG_BOT_TOKEN；
 *   3. 下方 $fbs_tg_bot_token 占位变量（当前留空，部署时在此填入 BotFather 下发的 token）。
 * 三处均未配置时接口返回 500 并提示，不会带着空 token 上线。
 *
 * 错误码约定：
 *   200 验签通过且会话签发成功；
 *   400 参数缺失/格式错误；401 过期或未来时间；
 *   403 伪造/篡改（hash 校验失败）、缺 user.id、或会员已被禁用；
 *   429 同一 initData 重放超过阈值；
 *   500 服务端配置/依赖错误：bot_token 未配置（bot_token_not_configured）、
 *       dbinfo.inc.php 缺失（config_missing）、数据库连不上（db_unavailable）、
 *       会员创建失败（member_create_failed）。
 *       注意：500 一律返回 JSON 明细，不白屏、不输出堆栈。
 *
 * ----------------------------------------------------------------------------------------------
 * 【会话签发】task-003：验签通过后按 username='tg_<telegram_id>' 查/建火鸟会员，
 * 用火鸟原生算法构造登录 Cookie（详见文件末尾「会话签发」段），再 302 或返回 JSON。
 * Cookie 值与火鸟 userLogin::keepUser() 完全同构：
 *   HN_login_user = base64( RenrenCrypt::php_encrypt("<会员id>&<member.password 列值>") )
 *   HN_userid     = <会员id>
 * 因此后续页面请求由火鸟原生 userLogin::getMemberID() 直接认账，无需改火鸟框架。
 */

require_once __DIR__ . '/renrencrypt.php';

if (!defined('FBS_BRIDGE_TEST')) {
    // 测试脚本 include 本文件前 define('FBS_BRIDGE_TEST', true) 可跳过 HTTP 入口
    fbs_bridge_http_entry();
}

/* ============================== 配置 ============================== */

/** 占位配置：部署时在此填入 Telegram Bot Token（优先级最低，见文件头说明） */
$fbs_tg_bot_token = '';

/** 防重放阈值：同一 initData 最多允许通过次数（超过返回 429） */
if (!defined('FBS_BRIDGE_REPLAY_MAX')) define('FBS_BRIDGE_REPLAY_MAX', 5);

/** 防重放计数 TTL（秒），覆盖 1 小时签名有效期 */
if (!defined('FBS_BRIDGE_REPLAY_TTL')) define('FBS_BRIDGE_REPLAY_TTL', 7200);

/* ============================== 验证函数（纯函数，可单测） ============================== */

/**
 * 解析 initData（URL query 格式）为 key => value 数组。
 * 手工解析而非 parse_str：parse_str 会把 key 中的 '.' 和空格转成 '_'，虽然
 * Telegram 官方字段名目前不含这两类字符，但不依赖该假设更稳。
 * 同名 key 取最后一次出现的值。
 *
 * @param  string $raw 原始 initData 串
 * @return array  [key => urldecoded value]，保持出现顺序
 */
function fbs_bridge_parse_init_data($raw)
{
    $pairs = array();
    $raw = trim((string)$raw);
    if ($raw === '') return $pairs;

    foreach (explode('&', $raw) as $kv) {
        if ($kv === '' ) continue;
        $eq = strpos($kv, '=');
        if ($eq === false) {
            $pairs[$kv] = '';
        } else {
            $k = rawurldecode(substr($kv, 0, $eq));
            $v = rawurldecode(substr($kv, $eq + 1));
            $pairs[$k] = $v;
        }
    }
    return $pairs;
}

/**
 * 构造 data_check_string：剔除 hash，其余按 key 升序 "key=value" 用 "\n" 连接。
 * signature 字段（若存在）参与串内，不剔除。
 */
function fbs_bridge_build_data_check_string(array $pairs)
{
    $used = array();
    foreach ($pairs as $k => $v) {
        if ($k === 'hash') continue; // 仅剔除 hash
        $used[$k] = $v;
    }
    ksort($used, SORT_STRING);

    $lines = array();
    foreach ($used as $k => $v) {
        $lines[] = $k . '=' . $v;
    }
    return implode("\n", $lines);
}

/** secret_key = HMAC-SHA256(key="WebAppData", message=bot_token) */
function fbs_bridge_make_secret($botToken)
{
    return hash_hmac('sha256', $botToken, 'WebAppData', true);
}

/**
 * 常量时间校验 initData 签名。
 *
 * @param  array  $pairs    fbs_bridge_parse_init_data 的结果
 * @param  string $botToken bot token 明文
 * @return bool
 */
function fbs_bridge_verify_signature(array $pairs, $botToken)
{
    if (!isset($pairs['hash']) || $pairs['hash'] === '' || $botToken === '') return false;
    $secret  = fbs_bridge_make_secret($botToken);
    $dcs     = fbs_bridge_build_data_check_string($pairs);
    $calced  = hash_hmac('sha256', $dcs, $secret);
    return hash_equals($calced, (string)$pairs['hash']);
}

/**
 * 时效校验。返回 array(ok=bool, code=错误码, msg=说明)。
 *   - auth_date 缺失/非数字：视为不新鲜（401）
 *   - 距今超过 3600s：401
 *   - 在未来超过 60s：401
 */
function fbs_bridge_check_freshness($authDate, $now = null)
{
    if ($now === null) $now = time();
    if (!is_numeric($authDate) || (int)$authDate <= 0) {
        return array(false, 401, 'auth_date missing or invalid');
    }
    $age = $now - (int)$authDate;
    if ($age > 3600) {
        return array(false, 401, 'initData expired (older than 1 hour)');
    }
    if ($age < -60) {
        return array(false, 401, 'initData auth_date is in the future');
    }
    return array(true, 0, '');
}

/**
 * 从 initData 对中提取 user.id。
 * user 字段是 URL-encoded JSON（解析后已是 JSON 字符串）。
 * 返回 int id 或 null。
 */
function fbs_bridge_extract_user_id(array $pairs)
{
    if (!isset($pairs['user']) || $pairs['user'] === '') return null;
    $user = json_decode($pairs['user'], true);
    if (!is_array($user) || !isset($user['id']) || !is_numeric($user['id'])) return null;
    return (int)$user['id'];
}

/* ============================== 防重放（文件锁计数器） ============================== */

/**
 * 对一次 initData 记账并判断是否超阈值。
 *
 * @param  string      $initData 完整原始 initData 串
 * @param  string|null $dir      计数文件目录（测试可注入；默认 HUONIAO data/cache/fbs_bridge）
 * @return array [allowed=bool, count=int]  count 为本次记账后的次数
 */
function fbs_bridge_replay_check($initData, $dir = null)
{
    if ($dir === null) {
        $dir = defined('FBS_BRIDGE_REPLAY_DIR')
            ? FBS_BRIDGE_REPLAY_DIR
            : dirname(__DIR__, 2) . '/data/cache/fbs_bridge';
    }
    if (!is_dir($dir)) @mkdir($dir, 0755, true);

    $file = $dir . '/' . hash('sha256', (string)$initData) . '.cnt';
    $now  = time();

    $fp = @fopen($file, 'c+');
    if (!$fp) {
        // 存储不可用：fail-open（见文件头说明）
        return array(true, 0);
    }

    $allowed = true;
    $count   = 0;
    if (flock($fp, LOCK_EX)) {
        $raw = stream_get_contents($fp);
        $old = array(0, 0);
        if ($raw !== false && $raw !== '') {
            $parts = explode(' ', trim($raw));
            if (count($parts) === 2 && is_numeric($parts[0]) && is_numeric($parts[1])) {
                $old = array((int)$parts[0], (int)$parts[1]);
            }
        }
        // 过期则清零重记
        $count = ($old[1] > $now) ? $old[0] : 0;
        $count++;
        $expiry = ($old[1] > $now) ? $old[1] : $now + FBS_BRIDGE_REPLAY_TTL;

        if ($count > FBS_BRIDGE_REPLAY_MAX) {
            $allowed = false;
        }

        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, $count . ' ' . $expiry);
        fflush($fp);
        flock($fp, LOCK_UN);
    } else {
        // 拿不到锁：fail-open
        $allowed = true;
    }
    fclose($fp);

    return array($allowed, $count);
}

/* ============================== 配置读取 ============================== */

/**
 * 按 文件头 所述顺序解析 bot token。返回 string，未配置返回 ''。
 */
function fbs_bridge_get_bot_token()
{
    global $fbs_tg_bot_token;

    // 1. 火鸟后台配置缓存（纯 $cfg_* 赋值文件，include 安全）
    $cacheConfig = dirname(__DIR__, 2) . '/data/cache/config.php';
    if (is_file($cacheConfig)) {
        $cfg = array();
        // 隔离作用域 include，避免覆盖本文件变量
        $included = include $cacheConfig;
        if ($included && isset($cfg_telegramBotToken) && is_string($cfg_telegramBotToken) && $cfg_telegramBotToken !== '') {
            return trim($cfg_telegramBotToken);
        }
        unset($cfg_telegramBotToken, $included, $cfg);
    }

    // 2. 环境变量
    $env = getenv('FBS_TG_BOT_TOKEN');
    if ($env !== false && trim($env) !== '') {
        return trim($env);
    }

    // 3. 本文件占位
    return trim((string)$fbs_tg_bot_token);
}

/* ============================== 站点配置读取（Cookie 属性） ============================== */

/**
 * 读取火鸟运行时配置中与 Cookie 相关的项。
 *
 * 与 fbs_bridge_get_bot_token() 同款"隔离作用域 include"：data/cache/config.php 只含
 * $cfg_* 赋值语句，include 不会污染本文件变量。读不到的项回落到火鸟默认值
 * （webroot/include/config/siteConfig.inc.php:35-49）。
 *
 * @return array cookiePath / cookieDomain / cookiePre / onlinetime / httpSecureAccess
 */
function fbs_bridge_load_site_config()
{
    static $cached = null;
    if ($cached !== null) return $cached;

    $cfg = array(
        'cookiePath'       => '/',
        'cookieDomain'     => '',
        'cookiePre'        => 'HN_',
        'onlinetime'       => 100,
        'httpSecureAccess' => 1,
    );

    $cacheConfig = dirname(__DIR__, 2) . '/data/cache/config.php';
    if (is_file($cacheConfig)) {
        // 静态闭包隔离作用域：只把需要的 $cfg_* 取出来
        $loaded = (static function ($__file) {
            $cfg_cookiePath = $cfg_cookieDomain = null;
            $cfg_onlinetime = $cfg_httpSecureAccess = null;
            include $__file;
            return array(
                'cookiePath'       => $cfg_cookiePath,
                'cookieDomain'     => $cfg_cookieDomain,
                'onlinetime'       => $cfg_onlinetime,
                'httpSecureAccess' => $cfg_httpSecureAccess,
            );
        })($cacheConfig);

        if (is_array($loaded)) {
            if (isset($loaded['cookiePath']) && $loaded['cookiePath'] !== null && $loaded['cookiePath'] !== '') {
                $cfg['cookiePath'] = (string)$loaded['cookiePath'];
            }
            if (isset($loaded['cookieDomain']) && $loaded['cookieDomain'] !== null) {
                $cfg['cookieDomain'] = (string)$loaded['cookieDomain'];
            }
            if (isset($loaded['onlinetime']) && is_numeric($loaded['onlinetime']) && (int)$loaded['onlinetime'] > 0) {
                $cfg['onlinetime'] = (int)$loaded['onlinetime'];
            }
            if (isset($loaded['httpSecureAccess']) && $loaded['httpSecureAccess'] !== null && $loaded['httpSecureAccess'] !== '') {
                $cfg['httpSecureAccess'] = (int)$loaded['httpSecureAccess'];
            }
        }
    }

    // Cookie 名固定 HN_ 前缀：common.inc.php:86 在加载配置之后仍硬编码 $cfg_cookiePre='HN_'，
    // 即原生行为与配置文件里的 cookiePre 无关。这里同样以 HN_ 为准，避免与火鸟侧读不到。
    $cfg['cookiePre'] = 'HN_';

    return $cached = $cfg;
}

/* ============================== 数据库配置读取 ============================== */

/**
 * 解析 webroot/include/dbinfo.inc.php 的连接参数。
 *
 * 该文件 gitignored（.gitignore:22），只在部署机存在，格式为纯 $DB_* 赋值
 * （见 deploy/docker/entrypoint-web.sh:12-20 与 webroot/install/index.php:357-367）。
 * 缺失时返回 error=config_missing，由调用方转成 500 + JSON，不允许白屏。
 *
 * 测试可通过 define('FBS_BRIDGE_DBINFO_FILE', '/tmp/fixture.php') 指向夹具文件。
 *
 * @return array 成功含 host/port/name/user/pass/prefix；失败含 error/message
 */
function fbs_bridge_load_db_config()
{
    static $cached = null;
    if ($cached !== null) return $cached;

    $dbinfoFile = defined('FBS_BRIDGE_DBINFO_FILE')
        ? FBS_BRIDGE_DBINFO_FILE
        : dirname(__DIR__, 2) . '/include/dbinfo.inc.php';

    if (!is_file($dbinfoFile)) {
        return $cached = array(
            'error'   => 'config_missing',
            'message' => 'include/dbinfo.inc.php not found on this host',
        );
    }

    $loaded = (static function ($__file) {
        $DB_HOST = $DB_NAME = $DB_USER = $DB_PASS = $DB_PREFIX = $DB_CHARSET = $DB_PORT = null;
        include $__file;
        return array(
            'host'    => $DB_HOST,
            'name'    => $DB_NAME,
            'user'    => $DB_USER,
            'pass'    => $DB_PASS,
            'prefix'  => $DB_PREFIX,
            'charset' => $DB_CHARSET,
            'port'    => $DB_PORT,
        );
    })($dbinfoFile);

    if (!is_array($loaded) || empty($loaded['host']) || empty($loaded['name']) || empty($loaded['user'])) {
        return $cached = array(
            'error'   => 'config_missing',
            'message' => 'dbinfo.inc.php does not define DB_HOST/DB_NAME/DB_USER',
        );
    }

    return $cached = array(
        'host'   => (string)$loaded['host'],
        'port'   => ($loaded['port'] !== null && (int)$loaded['port'] > 0) ? (int)$loaded['port'] : 3306,
        'name'   => (string)$loaded['name'],
        'user'   => (string)$loaded['user'],
        'pass'   => (string)$loaded['pass'],
        'prefix' => ($loaded['prefix'] !== null) ? (string)$loaded['prefix'] : 'huoniao_',
    );
}

/**
 * 建 PDO 连接（与 db_connect.class.php:30-34 同款 DSN 与 SET NAMES utf8mb4）。
 *
 * @param  array|null $dbinfo 已解析的连接参数；null 则自动读取
 * @return array [PDO|null, array|null]  第二项为错误描述
 */
function fbs_bridge_db_connect($dbinfo = null)
{
    if ($dbinfo === null) $dbinfo = fbs_bridge_load_db_config();
    if (isset($dbinfo['error'])) return array(null, $dbinfo);

    if (!in_array('mysql', PDO::getAvailableDrivers(), true)) {
        return array(null, array('error' => 'db_unavailable', 'message' => 'pdo_mysql driver is not available'));
    }

    $dsn = 'mysql:host=' . $dbinfo['host'] . ';port=' . $dbinfo['port'] . ';dbname=' . $dbinfo['name'];
    $opts = array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION);
    if (defined('PDO::MYSQL_ATTR_INIT_COMMAND')) {
        $opts[PDO::MYSQL_ATTR_INIT_COMMAND] = 'SET NAMES utf8mb4';
    }

    try {
        $pdo = new PDO($dsn, $dbinfo['user'], $dbinfo['pass'], $opts);
    } catch (Exception $e) {
        // 不把 DSN / 账号 / 驱动原始报错回给浏览器，只落一份可运维的短消息
        error_log('[fbs_bridge] db connect failed: ' . $e->getMessage());
        return array(null, array('error' => 'db_unavailable', 'message' => 'database connection failed'));
    }

    return array($pdo, null);
}

/* ============================== 会员查/建 ============================== */

/**
 * 生成与火鸟 userLogin::_getSaltedHash()（userLogin.class.php:2079-2092）同构的
 * password 列值：7 位盐 + sha1(盐+明文)，共 47 字符（member.password 为 VARCHAR(47)）。
 *
 * 明文不落库、不落日志；password 列的值本身即登录凭证，会进 HN_login_user Cookie，
 * 后续请求由火鸟 getMemberID() 回库比对。
 */
function fbs_bridge_generate_password()
{
    try {
        $seed  = random_bytes(16);
        $plain = bin2hex(random_bytes(16));
    } catch (Exception $e) {
        $seed  = uniqid('', true);
        $plain = md5(uniqid('', true));
    }
    $salt = substr(md5($seed), 0, 7);
    return $salt . sha1($salt . $plain);
}

/** 会员用户名约定：tg_<telegram_id> */
function fbs_bridge_member_username($telegramUserId)
{
    return 'tg_' . (int)$telegramUserId;
}

/**
 * 按 username='tg_<id>' 查会员，不存在则按火鸟第三方登录模板创建。
 *
 * INSERT 字段集参照 userLogin.class.php:1433-1437（loginConnect 微信路径）与
 * member 表结构（install/db_structure.txt:86）。全部使用预处理参数，杜绝注入。
 *
 * @param  PDO    $pdo
 * @param  string $prefix  表前缀（已由调用方校验字符集）
 * @param  int    $tgUserId
 * @param  array  $meta    nickname / ip / time
 * @return array [httpCode, member|null, created(bool), error(string)]
 */
function fbs_bridge_find_or_create_member(PDO $pdo, $prefix, $tgUserId, array $meta = array())
{
    $username = fbs_bridge_member_username($tgUserId);
    $table    = '`' . $prefix . 'member`';

    $selectSql = 'SELECT `id`, `password`, `state` FROM ' . $table . ' WHERE `username` = ? LIMIT 1';

    try {
        $stmt = $pdo->prepare($selectSql);
        $stmt->execute(array($username));
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        error_log('[fbs_bridge] member select failed: ' . $e->getMessage());
        return array(500, null, false, 'db_unavailable');
    }

    if ($row) {
        // 火鸟 getMemberID() 只认 state=1（userLogin.class.php:1995）；被冻结/待审核的账号
        // 不能通过桥上登录，否则等于绕过风控。
        if ((int)$row['state'] !== 1) {
            return array(403, null, false, 'member_disabled');
        }
        return array(200, array('id' => (int)$row['id'], 'password' => (string)$row['password']), false, '');
    }

    $now      = isset($meta['time']) ? (int)$meta['time'] : time();
    $ip       = isset($meta['ip']) ? (string)$meta['ip'] : '';
    $nickname = isset($meta['nickname']) ? (string)$meta['nickname'] : '';
    if ($nickname === '') $nickname = 'TG' . (int)$tgUserId;
    // member.nickname 是 VARCHAR(36)，按字符截断（多字节安全）
    $nickname = function_exists('mb_substr') ? mb_substr($nickname, 0, 36, 'UTF-8') : substr($nickname, 0, 36);

    $password = fbs_bridge_generate_password();

    $insertSql = 'INSERT INTO ' . $table
        . ' (`mtype`, `username`, `password`, `nickname`, `emailCheck`, `phoneCheck`, `sex`, `photo`,'
        . ' `regtime`, `logincount`, `lastlogintime`, `lastloginip`, `regip`, `state`, `regfrom`, `online`)'
        . ' VALUES (1, ?, ?, ?, 0, 0, 1, \'\', ?, 1, ?, ?, ?, 1, \'telegram\', ?)';

    try {
        $stmt = $pdo->prepare($insertSql);
        $stmt->execute(array($username, $password, $nickname, $now, $now, $ip, $ip, $now));
        $newId = (int)$pdo->lastInsertId();
    } catch (Exception $e) {
        // 并发下可能被另一进程抢先创建：回查一次，查到就复用
        error_log('[fbs_bridge] member insert failed: ' . $e->getMessage());
        try {
            $stmt = $pdo->prepare($selectSql);
            $stmt->execute(array($username));
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e2) {
            return array(500, null, false, 'db_unavailable');
        }
        if ($row && (int)$row['state'] === 1) {
            return array(200, array('id' => (int)$row['id'], 'password' => (string)$row['password']), false, '');
        }
        return array(500, null, false, 'member_create_failed');
    }

    if ($newId <= 0) {
        return array(500, null, false, 'member_create_failed');
    }

    return array(200, array('id' => $newId, 'password' => $password), true, '');
}

/* ============================== Cookie 构造 ============================== */

/**
 * 拼一条 Set-Cookie 头（属性顺序对齐 PHP setcookie(array) 的输出）。
 *
 * @param  string $name     完整 Cookie 名（含前缀）
 * @param  string $value    未编码的值
 * @param  int    $expires  Unix 时间戳
 * @param  int    $now      当前时间戳（算 Max-Age，便于测试注入）
 * @param  string $path
 * @param  string $domain    空串表示不下发 Domain（host-only，与 PutCookie 空域名一致）
 * @param  bool   $secure
 * @param  string $sameSite  空串表示不设置
 * @return string
 */
function fbs_bridge_cookie_header($name, $value, $expires, $now, $path, $domain, $secure, $sameSite)
{
    $header = $name . '=' . urlencode($value);
    $header .= '; expires=' . gmdate('D, d M Y H:i:s', $expires) . ' GMT';
    $header .= '; Max-Age=' . max(0, $expires - $now);
    if ($path !== '')   $header .= '; path=' . $path;
    if ($domain !== '') $header .= '; domain=' . $domain;
    if ($secure)        $header .= '; secure';
    if ($sameSite !== '') $header .= '; SameSite=' . $sameSite;
    return $header;
}

/**
 * 构造火鸟原生登录 Cookie 头，逐条复刻 userLogin::keepUser()（1715-1727）
 * + PutCookie()（cookie.class.php:20-66）的行为。
 *
 * 与原生保持一致的点（刻意不做"加固"）：
 *   - HttpOnly 不设置（原生只有 admin_auth 才 HttpOnly；加了会与原生登录态产生行为差异）
 *   - SameSite 仅在 $cfg_httpSecureAccess 为真时置 None（原生 cookie.class.php:46-49）
 *   - 域名不含 www. 时额外种一份 www.<domain>（cookie.class.php:56-65）
 *   - 有效期 $cfg_onlinetime * 3600（userLogin.class.php:1724）
 *
 * @param  int   $memberId
 * @param  string $password  member.password 列值（47 字符）
 * @param  array $cfg        fbs_bridge_load_site_config() 的结果
 * @param  int   $now
 * @return array 字符串数组，每项是一条 Set-Cookie 的值部分
 */
function fbs_bridge_build_session_cookies($memberId, $password, array $cfg, $now = null)
{
    if ($now === null) $now = time();

    $pre     = $cfg['cookiePre'];
    $expires = $now + (int)$cfg['onlinetime'] * 3600;
    $path    = (string)$cfg['cookiePath'];
    $secure  = !empty($cfg['httpSecureAccess']);
    $sameSite = $secure ? 'None' : '';   // 仅 HTTPS 场景补 SameSite=None（Telegram WebView 内嵌为第三方上下文）

    // 值 = base64(php_encrypt("<id>&<password>"))；注意 php_encrypt 内部已 base64 一次，
    // 这里再 base64，与 keepUser 的 base64_encode() 双重编码一致，不能"优化"掉。
    $crypt = new RenrenCrypt();
    $token = base64_encode($crypt->php_encrypt($memberId . '&' . $password));

    $domains = array();
    $domain  = trim((string)$cfg['cookieDomain']);
    if ($domain !== '') {
        $domains[] = $domain;
        // 原生域名兼容逻辑（cookie.class.php:56-65）
        if (strpos($domain, 'www.') === false) {
            $domains[] = 'www.' . $domain;
        }
    } else {
        $domains[] = '';   // host-only
    }

    $headers = array();
    foreach ($domains as $d) {
        $headers[] = fbs_bridge_cookie_header($pre . 'login_user', $token, $expires, $now, $path, $d, $secure, $sameSite);
        $headers[] = fbs_bridge_cookie_header($pre . 'userid', (string)$memberId, $expires, $now, $path, $d, $secure, $sameSite);
    }

    return $headers;
}

/* ============================== 跳转目标（防开放重定向） ============================== */

/** H5 首页兜底路径；可用 define('FBS_BRIDGE_HOME_PATH', '/xxx') 覆盖 */
function fbs_bridge_default_home()
{
    return defined('FBS_BRIDGE_HOME_PATH') ? (string)FBS_BRIDGE_HOME_PATH : '/';
}

/**
 * 校验 next 只允许站内相对路径，防开放重定向。
 *
 * 拒绝：非字符串 / 空 / 不以 / 开头（http:, //host, javascript:, \\host 都在此被拒）
 *       / 含 //（协议相对）/ 含反斜杠（浏览器视为 /）/ 含控制字符 / 含冒号。
 * @return string 合法则返回原路径，非法返回 ''（调用方回退首页）
 */
function fbs_bridge_safe_next($next)
{
    if (!is_string($next)) return '';
    $next = trim($next);
    if ($next === '') return '';
    if ($next[0] !== '/') return '';
    if (strpos($next, '//') !== false) return '';
    if (strpos($next, '\\') !== false) return '';
    if (strpos($next, ':') !== false) return '';
    if (preg_match('/[\x00-\x1F\x7F]/', $next)) return '';
    return $next;
}

/* ============================== 会话签发 ============================== */

/**
 * 完整签发流程：查/建会员 → 更新在线时间 → 构造 Cookie → 计算跳转目标。
 *
 * 不直接调用 header()/setcookie()，只把结果返回给 HTTP 入口，
 * 这样 CLI 下可直接断言（Tess 可注入 PDO / dbinfo / config）。
 *
 * @param  int   $telegramUserId
 * @param  array $context  nickname / ip / time / next / redirect / pdo / db_prefix / dbinfo / config
 * @return array [httpCode, payload, cookieHeaders]
 */
function fbs_bridge_issue_session($telegramUserId, array $context = array())
{
    $cfg = isset($context['config']) ? $context['config'] : fbs_bridge_load_site_config();
    $cfg = array_merge(array(
        'cookiePath'       => '/',
        'cookieDomain'     => '',
        'cookiePre'        => 'HN_',
        'onlinetime'       => 100,
        'httpSecureAccess' => 1,
    ), is_array($cfg) ? $cfg : array());

    // 1) 取数据库连接（测试可注入 PDO）
    if (isset($context['pdo']) && $context['pdo'] instanceof PDO) {
        $pdo    = $context['pdo'];
        $prefix = isset($context['db_prefix']) ? (string)$context['db_prefix'] : 'huoniao_';
    } else {
        $dbinfo = isset($context['dbinfo']) ? $context['dbinfo'] : fbs_bridge_load_db_config();
        if (isset($dbinfo['error'])) {
            return array(500, array(
                'code'    => 500,
                'error'   => $dbinfo['error'],
                'message' => $dbinfo['message'],
            ), array());
        }
        list($pdo, $dbError) = fbs_bridge_db_connect($dbinfo);
        if ($dbError !== null) {
            return array(500, array(
                'code'    => 500,
                'error'   => $dbError['error'],
                'message' => $dbError['message'],
            ), array());
        }
        $prefix = $dbinfo['prefix'];
    }

    // 表前缀来自配置文件，仍做字符集校验，避免配置被污染时拼出奇怪 SQL
    if (!preg_match('/^[A-Za-z0-9_]*$/', $prefix)) {
        return array(500, array(
            'code'    => 500,
            'error'   => 'config_invalid',
            'message' => 'DB_PREFIX contains illegal characters',
        ), array());
    }

    // 2) 查/建会员
    list($status, $member, $created, $error) = fbs_bridge_find_or_create_member($pdo, $prefix, $telegramUserId, $context);
    if ($member === null) {
        $messages = array(
            'member_disabled'     => 'member exists but is not active (state != 1)',
            'db_unavailable'      => 'database query failed',
            'member_create_failed' => 'failed to create member',
        );
        return array($status, array(
            'code'    => $status,
            'error'   => $error,
            'message' => isset($messages[$error]) ? $messages[$error] : 'session issue failed',
        ), array());
    }

    $now = isset($context['time']) ? (int)$context['time'] : time();

    // 3) 对齐原生 keepUser：距上次在线超过 60s 才更新 online（1730-1737）
    try {
        $stmt = $pdo->prepare('UPDATE `' . $prefix . 'member` SET `online` = ? WHERE `id` = ? AND `online` < ?');
        $stmt->execute(array($now, $member['id'], $now - 60));
    } catch (Exception $e) {
        // 在线时间只是展示字段，失败不影响登录态（原生 getMemberID 也容忍 online=0）
        error_log('[fbs_bridge] update online failed: ' . $e->getMessage());
    }

    // 4) 构造 Cookie
    $cookies = fbs_bridge_build_session_cookies($member['id'], $member['password'], $cfg, $now);

    $payload = array(
        'code'      => 0,
        'message'   => 'ok',
        'user_id'   => (int)$telegramUserId,
        'member_id' => (int)$member['id'],
        'created'   => $created ? 1 : 0,
        'expires'   => $now + (int)$cfg['onlinetime'] * 3600,
    );

    // 5) 跳转目标（仅 302 模式输出到 payload，JSON 模式不带 location）
    if (!empty($context['redirect'])) {
        $next = fbs_bridge_safe_next(isset($context['next']) ? $context['next'] : '');
        $payload['location'] = ($next !== '') ? $next : fbs_bridge_default_home();
    }

    return array(200, $payload, $cookies);
}

/* ============================== 客户端信息 ============================== */

/**
 * 从 initData 的 user JSON 里取昵称（first_name + last_name）。
 * 仅作为新会员的 nickname 初始值；不含 user 信息时返回 ''。
 */
function fbs_bridge_extract_user_nickname(array $pairs)
{
    if (!isset($pairs['user']) || $pairs['user'] === '') return '';
    $user = json_decode($pairs['user'], true);
    if (!is_array($user)) return '';
    $parts = array();
    if (isset($user['first_name']) && is_string($user['first_name'])) $parts[] = $user['first_name'];
    if (isset($user['last_name']) && is_string($user['last_name']))  $parts[] = $user['last_name'];
    return trim(implode(' ', $parts));
}

/** 客户端 IP：只信 REMOTE_ADDR，不采信任何可伪造的 X-Forwarded-* */
function fbs_bridge_client_ip()
{
    return isset($_SERVER['REMOTE_ADDR']) ? (string)$_SERVER['REMOTE_ADDR'] : '';
}

/* ============================== HTTP 入口 ============================== */

/**
 * 从请求中提取 initData：
 *   1. $_GET['initData'] / $_POST['initData']
 *   2. JSON body {"initData": "..."}
 *   3. 原始 body 若本身是 query 串（含 '=' 且非 JSON）
 */
function fbs_bridge_extract_init_data()
{
    if (isset($_GET['initData']) && $_GET['initData'] !== '') return (string)$_GET['initData'];
    if (isset($_POST['initData']) && $_POST['initData'] !== '') return (string)$_POST['initData'];

    $body = file_get_contents('php://input');
    if ($body === false || $body === '') return '';

    $body = trim($body);
    if ($body !== '' && $body[0] === '{') {
        $json = json_decode($body, true);
        if (is_array($json) && isset($json['initData']) && is_string($json['initData'])) {
            return $json['initData'];
        }
        return '';
    }
    // 原始 query 串（Telegram WebView 有时会把 initData 直接 POST 成 body）
    if (strpos($body, '=') !== false) return $body;
    return '';
}

/**
 * 验签主流程（返回 [httpCode, payload, cookieHeaders]，方便测试直接调用）。
 *
 * 默认只验签（issue=false），保持 task-001 的 7 个用例语义不变；
 * 生产入口由 fbs_bridge_http_entry() 传 issue=true 走签发流程。
 *
 * @param  string $initData
 * @param  array  $options  issue(bool) / next(string) / redirect(bool) / context(array)
 * @return array [httpCode, payload, cookieHeaders]
 */
function fbs_bridge_handle_request($initData, array $options = array())
{
    if ($initData === '') {
        return array(400, array('code' => 400, 'error' => 'missing_init_data', 'message' => 'initData is required'), array());
    }

    $botToken = fbs_bridge_get_bot_token();
    if ($botToken === '') {
        return array(500, array('code' => 500, 'error' => 'bot_token_not_configured', 'message' => 'Telegram bot token is not configured (see header comment of bridge.php)'), array());
    }

    $pairs = fbs_bridge_parse_init_data($initData);

    // 1. 签名：伪造/篡改 → 403
    if (!fbs_bridge_verify_signature($pairs, $botToken)) {
        return array(403, array('code' => 403, 'error' => 'invalid_signature', 'message' => 'initData signature verification failed'), array());
    }

    // 2. 时效：过期/未来 → 401
    $fresh = fbs_bridge_check_freshness(isset($pairs['auth_date']) ? $pairs['auth_date'] : null);
    if (!$fresh[0]) {
        return array($fresh[1], array('code' => $fresh[1], 'error' => 'stale_or_future_init_data', 'message' => $fresh[2]), array());
    }

    // 3. 用户：缺 user.id → 403
    $userId = fbs_bridge_extract_user_id($pairs);
    if ($userId === null) {
        return array(403, array('code' => 403, 'error' => 'missing_user_id', 'message' => 'initData must contain user.id'), array());
    }

    // 4. 防重放：同一 initData 超过阈值 → 429（记账只对签名合法的请求生效）
    list($allowed, $count) = fbs_bridge_replay_check($initData);
    if (!$allowed) {
        return array(429, array('code' => 429, 'error' => 'replay_limit_exceeded', 'message' => 'Too many uses of the same initData'), array());
    }

    // 5. 会话签发（2026-10-28 task-003）：验签全部通过之后才碰数据库
    if (!empty($options['issue'])) {
        $context = (isset($options['context']) && is_array($options['context'])) ? $options['context'] : array();
        if (!isset($context['nickname'])) $context['nickname'] = fbs_bridge_extract_user_nickname($pairs);
        $context['next']     = isset($options['next']) ? (string)$options['next'] : '';
        $context['redirect'] = !empty($options['redirect']);

        list($issueStatus, $issuePayload, $issueCookies) = fbs_bridge_issue_session($userId, $context);
        if ($issueStatus !== 200) {
            return array($issueStatus, $issuePayload, array());
        }
        return array(200, $issuePayload + array('use_count' => $count), $issueCookies);
    }

    return array(200, array(
        'code'      => 0,
        'message'   => 'ok',
        'user_id'   => $userId,
        'use_count' => $count,
        // 验签专用模式（issue=false）：不查库、不种 Cookie，供回归测试与灰度探测使用
    ), array());
}

function fbs_bridge_http_entry()
{
    $initData = fbs_bridge_extract_init_data();

    // next 存在即走 302 模式；?next= 空值视为未指定（仍走 JSON），避免误判
    $hasNext = (isset($_GET['next']) && $_GET['next'] !== '')
        || (isset($_POST['next']) && $_POST['next'] !== '');
    $nextRaw = isset($_GET['next']) ? $_GET['next'] : (isset($_POST['next']) ? $_POST['next'] : '');

    list($httpCode, $payload, $cookies) = fbs_bridge_handle_request($initData, array(
        'issue'    => true,
        'next'     => $hasNext ? (string)$nextRaw : '',
        'redirect' => $hasNext,
        'context'  => array('ip' => fbs_bridge_client_ip()),
    ));

    // 只有签发成功才下发 Cookie；错误响应绝不带登录态
    if ($httpCode === 200) {
        foreach ($cookies as $cookie) {
            header('Set-Cookie: ' . $cookie, false);
        }
    }

    if ($httpCode === 200 && $hasNext) {
        $location = isset($payload['location']) ? $payload['location'] : fbs_bridge_default_home();
        header('Location: ' . $location, true, 302);
        exit;
    }

    header('Content-Type: application/json; charset=utf-8');
    http_response_code($httpCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}
