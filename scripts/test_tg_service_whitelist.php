<?php
/**
 * 服务白名单守卫单测（webroot/include/tgWhitelist.inc.php · 需求文档验收第 2 条）
 *
 * 守卫被四个独立入口共用：index.php / website.php / special.php / wmsj（40 个 PHP）。
 * 所以测试分三层：
 *   1. 纯函数判定（白名单 / 开关 / 决策三档）
 *   2. 守卫源码本身（header 后必须紧跟 die，不能写死 301）
 *   3. 四个入口有没有真的引用守卫（防止将来有人把 include 删了却没人发现）
 *
 * 用法： php scripts/test_tg_service_whitelist.php
 * 输出： TAP 风格，末行 1..N；exit 0 = 全过，1 = 有失败。
 */

$root     = dirname(__DIR__);
$incPath  = $root . '/webroot/include/tgWhitelist.inc.php';

// 守卫文件约定「include 时零副作用」：不输出、不 die、只定义函数。这里顺便验一遍。
ob_start();
require_once $incPath;
$incOutput = ob_get_clean();

$pass  = 0;
$fail  = 0;
$tests = 0;

function check($desc, $actual, $expected)
{
    global $pass, $fail, $tests;
    $tests++;
    if ($actual === $expected) {
        $pass++;
        echo "ok {$tests} - {$desc}\n";
    } else {
        $fail++;
        echo "not ok {$tests} - {$desc}\n";
        echo '  # 期望 ' . var_export($expected, true) . '，实际 ' . var_export($actual, true) . "\n";
    }
}

/**
 * 剥掉注释后再做字符串断言。
 * 直接 strpos 会被注释里的字样骗到——比如注释写着「不能写死 301」，
 * 断言"代码里没有 301"就会自己绊自己。这是本测试上一版真实踩过的坑。
 */
function fbs_strip_comments($code)
{
    $out = '';
    foreach (token_get_all("<?php\n" . $code) as $token) {
        if (is_array($token)) {
            if ($token[0] === T_COMMENT || $token[0] === T_DOC_COMMENT) {
                continue;
            }
            $out .= $token[1];
        } else {
            $out .= $token;
        }
    }
    return $out;
}

/** 从源码里抽出指定顶层函数（token 级大括号配对，不用正则） */
function fbs_extract_function($source, $name)
{
    $tokens = token_get_all($source);
    $total  = count($tokens);

    for ($i = 0; $i < $total; $i++) {
        if (!is_array($tokens[$i]) || $tokens[$i][0] !== T_FUNCTION) {
            continue;
        }
        $j = $i + 1;
        while ($j < $total && is_array($tokens[$j])
            && in_array($tokens[$j][0], array(T_WHITESPACE, T_COMMENT, T_DOC_COMMENT), true)) {
            $j++;
        }
        if ($j >= $total || !is_array($tokens[$j]) || $tokens[$j][0] !== T_STRING) {
            continue;
        }
        if (strcasecmp($tokens[$j][1], $name) !== 0) {
            continue;
        }

        $code    = 'function ' . $tokens[$j][1];
        $depth   = 0;
        $started = false;
        for ($k = $j + 1; $k < $total; $k++) {
            $text  = is_array($tokens[$k]) ? $tokens[$k][1] : $tokens[$k];
            $code .= $text;
            if ($text === '{') {
                $depth++;
                $started = true;
            } elseif ($text === '}') {
                $depth--;
                if ($started && $depth === 0) {
                    return $code;
                }
            }
        }
    }

    return null;
}

// ---------------------------------------------------------------------------
// 0. 加载
// ---------------------------------------------------------------------------
check('守卫文件 include 时零输出（约定：只定义函数）', $incOutput, '');

check('四个函数都已定义',
    function_exists('fbsTgServiceAllowed')
    && function_exists('fbsTgServiceWhitelistEnabled')
    && function_exists('fbsTgServiceDecision')
    && function_exists('fbsTgServiceGuard'),
    true);

// ---------------------------------------------------------------------------
// 1. 白名单
// ---------------------------------------------------------------------------
foreach (array('waimai', 'article', 'travel', 'member', 'siteConfig', 'business') as $service) {
    check("放行 {$service}", fbsTgServiceAllowed($service), true);
}

$blocked = array(
    'website'     => '自助建站（website.php 入口）',
    'special'     => '专题（special.php 入口）',
    'shop'        => '商城模块',
    'video'       => '视频模块',
    'integral'    => '积分商城',
    'house'       => '房产模块',
    ''            => '空字符串',
    'Waimai'      => '大小写不同，必须严格匹配',
    'waimai '     => '尾空格不能被放过',
    '123'         => '纯数字',
    'waimai;drop' => '注入形态，不能因为前缀相同而放行',
);

foreach ($blocked as $service => $why) {
    check('拦截 ' . var_export($service, true) . "（{$why}）", fbsTgServiceAllowed($service), false);
}

check('拦截 null', fbsTgServiceAllowed(null), false);
check('拦截整数 0', fbsTgServiceAllowed(0), false);
check('拦截数组（不是标量）', fbsTgServiceAllowed(array('waimai')), false);

// ---------------------------------------------------------------------------
// 2. 开关取值矩阵
// ---------------------------------------------------------------------------
$switchCases = array(
    '未设置' => array(null,    true),
    '1'      => array('1',     true),
    'yes'    => array('yes',   true),
    '2'      => array('2',     true),
    ''       => array('',      true),
    '0'      => array('0',     false),
    'false'  => array('false', false),
    'OFF'    => array('OFF',   false),
    'no'     => array('no',    false),
    ' 0 '    => array(' 0 ',   false),
);

foreach ($switchCases as $label => $case) {
    if ($case[0] === null) {
        putenv('FBS_TG_SERVICE_WHITELIST');
    } else {
        putenv('FBS_TG_SERVICE_WHITELIST=' . $case[0]);
    }
    check("开关 = {$label} → " . ($case[1] ? '启用' : '关闭'),
        fbsTgServiceWhitelistEnabled(), $case[1]);
}
putenv('FBS_TG_SERVICE_WHITELIST');

// ---------------------------------------------------------------------------
// 3. 决策三档：allow / home / notfound
// ---------------------------------------------------------------------------
$decisions = array(
    // [service, defaultIndex, fromMarker, enabled] => 期望
    '放行的 service 直接过'                    => array(array('waimai', '', '', true), 'allow'),
    'member 放行（登录桥全链路靠它）'          => array(array('member', '', '', true), 'allow'),
    'business 放行（产品裁决：商家要能用网页后台）' => array(array('business', '', '', true), 'allow'),
    '被拦 service → 回首页'                    => array(array('shop', '', '', true), 'home'),
    'website 入口被拦'                         => array(array('website', '', '', true), 'home'),
    'special 入口被拦'                         => array(array('special', '', '', true), 'home'),
    '空 service 被拦'                          => array(array('', '', '', true), 'home'),
    '默认首页是别的放行模块 → 仍回首页'        => array(array('shop', 'siteConfig', '', true), 'home'),
    '默认首页与当前 service 相同 → 404'        => array(array('shop', 'shop', '', true), 'notfound'),
    '默认首页是数字型自定义模块 → 404（防死循环）' => array(array('shop', '3', '', true), 'notfound'),
    '带 from=tg_whitelist 再来一次 → 404'      => array(array('shop', '', 'tg_whitelist', true), 'notfound'),
    '带别的 from 标记 → 正常回首页'            => array(array('shop', '', 'index_395', true), 'home'),
    '开关关闭 → 一律放行'                      => array(array('shop', '', '', false), 'allow'),
    '开关关闭时也不看 from'                    => array(array('shop', '', 'tg_whitelist', false), 'allow'),
    'from 是数组时不炸、按空处理'              => array(array('shop', '', array('x'), true), 'home'),
    'defaultIndex 为 null 不炸'                => array(array('shop', null, '', true), 'home'),
);

foreach ($decisions as $desc => $case) {
    check($desc, call_user_func_array('fbsTgServiceDecision', $case[0]), $case[1]);
}

// ---------------------------------------------------------------------------
// 4. 守卫源码：header 后必须紧跟 die；不能写死 301
// ---------------------------------------------------------------------------
$source = file_get_contents($incPath);
check('能读到守卫文件源码', $source !== false, true);

$guardSrc = fbs_extract_function($source, 'fbsTgServiceGuard');
check('能从守卫文件里抽出 fbsTgServiceGuard', $guardSrc !== null, true);

if ($guardSrc !== null) {
    $guardCode = fbs_strip_comments($guardSrc);

    // 按 header( 切开：每一段都是「该 header 的参数 + 到下一个 header 之前的代码」。
    // 任何一段里没有 die/exit，就意味着那个 header 之后代码还在继续跑 ——
    // 会出现「已经发了 302，却把被拦页面整页渲染出去」这种事故。
    $segments = explode('header(', $guardCode);
    $count    = count($segments) - 1;

    check('守卫生成两个 header（回首页 302 与断开 404）', $count, 2);

    for ($i = 1; $i <= $count; $i++) {
        check("第 {$i} 个 header 之后紧跟 die/exit",
            preg_match('/(^|[^a-zA-Z_])(die|exit)([^a-zA-Z_]|$)/', $segments[$i]) === 1,
            true);
    }

    check('跳转没有写死 301 状态码（注释不计）', strpos($guardCode, '301') === false, true);
    check('跳转没有用三参形式写死状态码', strpos($guardCode, ', true,') === false, true);
    check('跳转带 from=tg_whitelist（既是计数标记也是防循环标记）',
        strpos($guardCode, 'from=tg_whitelist') !== false, true);
}

// is_numeric 在决策函数里，不在守卫里 —— 单独确认它没被删掉
$decisionSrc = fbs_extract_function($source, 'fbsTgServiceDecision');
check('决策函数含 is_numeric 判定（数字型默认首页的死循环保护）',
    $decisionSrc !== null && strpos(fbs_strip_comments($decisionSrc), 'is_numeric') !== false, true);

check('决策函数含 from=tg_whitelist 的防循环标记判断',
    $decisionSrc !== null && strpos(fbs_strip_comments($decisionSrc), 'tg_whitelist') !== false, true);

// ---------------------------------------------------------------------------
// 5. 四个入口是否真的接上了守卫
// ---------------------------------------------------------------------------
$entries = array(
    'webroot/index.php'               => '?service 与伪静态的总入口',
    'webroot/website.php'             => '自助建站',
    'webroot/special.php'             => '专题',
    'webroot/wmsj/inc/config.inc.php' => '商家端 36 个页面的公共引导',
    'webroot/wmsj/login.php'          => '商家端登录（不经 config.inc.php）',
    'webroot/wmsj/exit.php'           => '商家端退出（不经 config.inc.php）',
);

foreach ($entries as $relPath => $why) {
    $full = $root . '/' . $relPath;
    $code = @file_get_contents($full);
    check("{$relPath} 存在（{$why}）", $code !== false, true);
    if ($code === false) {
        continue;
    }
    check("{$relPath} 引用了 tgWhitelist.inc.php", strpos($code, 'tgWhitelist.inc.php') !== false, true);
    check("{$relPath} 调用了 fbsTgServiceGuard", strpos($code, 'fbsTgServiceGuard(') !== false, true);
}

// ---------------------------------------------------------------------------
echo "\n1..{$tests}\n";
echo "# pass {$pass} / fail {$fail}\n";

exit($fail === 0 ? 0 : 1);
