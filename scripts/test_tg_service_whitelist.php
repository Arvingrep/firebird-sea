<?php
/**
 * 服务白名单单元测试（webroot/index.php · 需求文档验收第 2 条）
 *
 * 为什么不 include index.php：它第一行就 require include/common.inc.php（要数据库、要
 * swoole_loader、要整个站点环境），单测起不来。所以这里从源码里把两个纯函数抽出来 eval，
 * 再跑判定矩阵。抽不到函数直接 exit 1 —— 不允许出现"没测到也算过"。
 *
 * 用法： php scripts/test_tg_service_whitelist.php
 * 输出： TAP 风格，末行 1..N；exit 0 = 全过，1 = 有失败。
 */

$root      = dirname(__DIR__);
$indexPath = $root . '/webroot/index.php';

$source = @file_get_contents($indexPath);
if ($source === false) {
    fwrite(STDERR, "无法读取 {$indexPath}\n");
    exit(1);
}

/**
 * 从 PHP 源码里抽出指定名字的顶层函数源码（含 function 关键字到配对的右大括号）。
 * 只用 token_get_all，不做正则匹配 —— 正则碰到注释里的 '}' 或字符串里的 '{' 会截断。
 *
 * @return string|null 抽不到返回 null
 */
function fbs_extract_function($source, $name)
{
    $tokens = token_get_all($source);
    $total  = count($tokens);

    for ($i = 0; $i < $total; $i++) {
        $token = $tokens[$i];
        if (!is_array($token) || $token[0] !== T_FUNCTION) {
            continue;
        }

        // 跳过空白/注释，取函数名
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

/**
 * 剥掉注释后再做字符串断言。
 * 直接 strpos 会被注释里的字样骗到——比如拦截块注释里写着「不能用 301」，
 * 断言"代码里没有 301"就会自己绊自己。用 token_get_all 只保留非注释 token。
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

// ---------------------------------------------------------------------------
// 0. 抽取（抽不到就硬失败）
// ---------------------------------------------------------------------------
$srcAllowed = fbs_extract_function($source, 'fbsTgServiceAllowed');
$srcEnabled = fbs_extract_function($source, 'fbsTgServiceWhitelistEnabled');

if ($srcAllowed === null || $srcEnabled === null) {
    fwrite(STDERR, "!! 从 webroot/index.php 抽取函数失败："
        . 'fbsTgServiceAllowed=' . ($srcAllowed === null ? 'missing' : 'ok')
        . ' fbsTgServiceWhitelistEnabled=' . ($srcEnabled === null ? 'missing' : 'ok') . "\n"
        . "!! 函数可能被改名或搬走了，本测试无法进行（这不是跳过，是失败）\n");
    exit(1);
}

eval($srcAllowed);
eval($srcEnabled);

check('两个函数都能从 index.php 抽出并成功定义',
    function_exists('fbsTgServiceAllowed') && function_exists('fbsTgServiceWhitelistEnabled'),
    true);

// ---------------------------------------------------------------------------
// 1. 白名单判定：放行
// ---------------------------------------------------------------------------
foreach (array('waimai', 'article', 'travel', 'member', 'siteConfig') as $service) {
    check("放行 {$service}", fbsTgServiceAllowed($service), true);
}

// ---------------------------------------------------------------------------
// 2. 白名单判定：拦截（含边界）
// ---------------------------------------------------------------------------
$blocked = array(
    'business'    => '商家端，验收第 2 条点名的"其他模块"',
    'shop'        => '商城模块',
    'video'       => '视频模块',
    'website'     => '自助建站',
    'integral'    => '积分商城',
    'settlement'  => '结算',
    'house'       => '房产模块',
    ''            => '空字符串，$service 兜底前的异常态',
    'Waimai'      => '大小写不同，必须严格匹配',
    'waimai '     => '尾空格，不能被 trim 掉后放行',
    '123'         => '纯数字，默认首页的自定义模块 id 已被前面的代码吃掉',
    'waimai;drop' => '注入形态，不能因为前缀相同而放行',
    'select'      => 'SQL 关键字',
);

foreach ($blocked as $service => $why) {
    check('拦截 ' . var_export($service, true) . "（{$why}）", fbsTgServiceAllowed($service), false);
}

check('拦截 null（(string)null 为空串）', fbsTgServiceAllowed(null), false);
check('拦截整数 0（(string)0 为 "0"）', fbsTgServiceAllowed(0), false);

// ---------------------------------------------------------------------------
// 3. 总开关取值矩阵
// ---------------------------------------------------------------------------
$switchCases = array(
    // value => 期望「是否启用」
    '未设置'  => array(null,   true),
    '1'       => array('1',    true),
    'true'    => array('true', true),
    'yes'     => array('yes',  true),
    '2'       => array('2',    true),
    ''        => array('',     true),
    '0'       => array('0',    false),
    'false'   => array('false', false),
    'OFF'     => array('OFF',  false),
    'no'      => array('no',   false),
    ' 0 '     => array(' 0 ',  false),
    ' off '   => array(' off ', false),
);

foreach ($switchCases as $label => $case) {
    $value    = $case[0];
    $expected = $case[1];

    if ($value === null) {
        putenv('FBS_TG_SERVICE_WHITELIST');
    } else {
        putenv('FBS_TG_SERVICE_WHITELIST=' . $value);
    }

    check("开关 = {$label} → " . ($expected ? '启用' : '关闭'),
        fbsTgServiceWhitelistEnabled(), $expected);
}

putenv('FBS_TG_SERVICE_WHITELIST');

// ---------------------------------------------------------------------------
// 4. 源码级断言：防止逻辑被重构掉、却没人发现调用点已经断了
// ---------------------------------------------------------------------------
$marker = '//Telegram 专用站点：只放行五个业务块';
$pos    = strpos($source, $marker);

check('index.php 里存在白名单拦截块的标记注释', $pos !== false, true);

if ($pos !== false) {
    // 按大括号配对截出拦截块的完整范围。不能用固定长度窗口——窗口会漂到后面的代码里，
    // 把无关的 301 之类字样一起圈进来（这条断言第一版就是这么误报的）。
    $block = '';
    $depth = 0;
    $started = false;
    $len = strlen($source);
    for ($i = $pos; $i < $len; $i++) {
        $ch = $source[$i];
        if ($ch === '{') {
            $depth++;
            $started = true;
        } elseif ($ch === '}') {
            $depth--;
            if ($started && $depth === 0) {
                $block = substr($source, $pos, $i - $pos + 1);
                break;
            }
        }
    }

    check('能按大括号配对截出拦截块的完整范围', $block !== '', true);

    check('拦截块用的是"开关 && !白名单"的组合调用',
        strpos($block, 'fbsTgServiceWhitelistEnabled() && !fbsTgServiceAllowed($service)') !== false,
        true);

    check('跳转带 from=tg_whitelist（运维可按日志计数）',
        strpos($block, 'from=tg_whitelist') !== false,
        true);

    check('跳转走 header("location:…")',
        strpos($block, 'header("location:"') !== false,
        true);

    // 302 是 PHP header("location:") 的默认值；写死 301 会被浏览器永久缓存，
    // 等哪天真要靠开关退回，用户本地照样照着旧缓存跳走，开关等于失效。
    // 只看代码：注释里出现「301」是在解释这条规则，不能算违规。
    $blockCode = fbs_strip_comments($block);

    check('跳转没有写死 301 状态码（注释不计）',
        strpos($blockCode, '301') === false,
        true);

    // header('location: …', true, 302) 这种三参形式同样是写死状态码，一并禁掉。
    check('header("location:") 没有传第三个参数写死状态码',
        strpos($blockCode, ', true,') === false,
        true);

    // 默认首页指向被拦模块时的自跳自保护
    check('拦截块含"默认首页自跳自"保护（$cfg_defaultindex 判断）',
        strpos($block, '$cfg_defaultindex') !== false,
        true);

    $stateCheckPos = strpos($source, '//验证模块状态');
    check('拦截块在"验证模块状态"之后（$service 已定型）',
        $stateCheckPos !== false && $stateCheckPos < $pos,
        true);
}

// ---------------------------------------------------------------------------
echo "\n1..{$tests}\n";
echo "# pass {$pass} / fail {$fail}\n";

exit($fail === 0 ? 0 : 1);
