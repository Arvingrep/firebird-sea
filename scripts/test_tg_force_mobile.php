<?php
/**
 * isMobile() 的 Telegram 强制 H5 短路测试（webroot/include/common.func.php）
 *
 * 运行（宿主机通常无 PHP，用 Docker）：
 *   docker run --rm -v "$PWD":/app -w /app php:8.2-cli php scripts/test_tg_force_mobile.php
 *
 * 背景：桌面版 Telegram 的 WebView 上报桌面浏览器 UA，isMobile() 纯 UA 判定会返回 false，
 * index.php 走不到 $template."_touch.html" 分支，TG 用户掉到 PC 模板。修复方式是登录桥下发
 * HN_tg=1 标记 cookie，isMobile() 优先认这个 cookie。
 *
 * 六个用例覆盖正反两向：既要证明 TG 用户被拉进 H5，也要证明普通桌面浏览器没有被劫持。
 *
 * 注意桌面 Chrome 的 UA 里本来就带 "AppleWebKit"：正则没有 /i 标志而主体已 strtolower，
 * 该大写词是死词，所以用例 3 仍然是 false —— 这同时锁住了「不要把正则改成 /i」这条约束，
 * 一旦有人顺手加了 /i，用例 3 会立刻变红。
 */

// common.func.php 是给整站用的：头部会 require 云存储 SDK。HUONIAOROOT 必须指向真实的
// webroot（那些 vendor 文件在仓库里）；HUONIAOINC 故意指向不存在的目录，让文件走
// memory2 桩类而不是连 Redis（真 memory.class.php 会去读站点配置）。
error_reporting(E_ALL & ~E_DEPRECATED & ~E_NOTICE);

define('HUONIAOROOT', dirname(__DIR__) . '/webroot');
define('HUONIAOINC', sys_get_temp_dir() . '/fbs_force_mobile_noinc_' . getmypid());

// common.func.php 在 include 期会读 $_GET['debug']（第 21179 行）决定是否定义一批订单函数；
// 先摆一个空值，既避开 undefined key 告警，也让那段代码按线上默认路径执行。
$_GET = array('debug' => '');

require HUONIAOROOT . '/include/common.func.php';

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

/** 每个用例前复位超全局，避免相互污染 */
function reset_req($cookies = array(), $ua = '')
{
    $_COOKIE = $cookies;
    $_SERVER = array();
    $_SERVER['HTTP_USER_AGENT'] = $ua;
    $_REQUEST = array();
    $_GET = array();
    $_POST = array();
}

$UA_DESKTOP_CHROME = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
    . '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
$UA_IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 '
    . '(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

/* 1. 本次需求的正例：桌面版 Telegram（桌面 UA）+ 登录桥种的标记 cookie → H5 */
reset_req(array('HN_tg' => '1'), $UA_DESKTOP_CHROME);
check('1 HN_tg=1 + 桌面 Chrome UA → true（桌面版 Telegram 强制 H5）',
    isMobile() === true, 'got ' . var_export(isMobile(), true));

/* 2. 手机 TG 本来就走 H5，加短路后不能反而变 false */
reset_req(array('HN_tg' => '1'), $UA_IPHONE);
check('2 HN_tg=1 + iPhone UA → true（原判定不因短路改变）',
    isMobile() === true, 'got ' . var_export(isMobile(), true));

/* 3. 反向证据：没有 cookie 的普通桌面浏览器必须留在 PC 模板 */
reset_req(array(), $UA_DESKTOP_CHROME);
check('3 无 cookie + 桌面 Chrome UA → false（不劫持非 TG 用户）',
    isMobile() === false, 'got ' . var_export(isMobile(), true));

/* 4. 没有 cookie 的手机 UA 仍按原正则判为手机 */
reset_req(array(), $UA_IPHONE);
check('4 无 cookie + iPhone UA → true（原 UA 判定不回归）',
    isMobile() === true, 'got ' . var_export(isMobile(), true));

/* 5. 值守卫：HN_tg=0 是"显式关闭"，不是"存在即真" */
reset_req(array('HN_tg' => '0'), $UA_DESKTOP_CHROME);
check('5 HN_tg=0 + 桌面 UA → false（值守卫，存在不等于真）',
    isMobile() === false, 'got ' . var_export(isMobile(), true));

/* 6. cookie 优先于 UA：UA 缺失（空串）也不影响 TG 用户进 H5 */
reset_req(array('HN_tg' => '1'), '');
check('6 HN_tg=1 + UA 空串 → true（cookie 优先于 UA）',
    isMobile() === true, 'got ' . var_export(isMobile(), true));

reset_req();

printf("\n==== 汇总 ====\n");
printf("PASS=%d  FAIL=%d\n", $PASS, $FAIL);
if ($FAIL > 0) {
    printf("\n失败项：\n");
    foreach ($FAILURES as $f) printf("  - %s\n", $f);
    exit(1);
}
printf("\nSUITE PASSED\n");
exit(0);
