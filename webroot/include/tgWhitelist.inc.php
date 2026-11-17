<?php
/**
 * Telegram 专用站点 · service 白名单守卫（全站生效）
 *
 * 需求文档验收第 2 条：首页与导航只出现外卖、跑腿、资讯、旅游四个入口，其他模块不可见，
 * 直接输入 URL 也打不开。前半靠后台停用模块，后半靠这个文件。
 *
 * **例外**：business（商家端）经产品裁决放行，见 fbsTgServiceAllowed() 的注释。
 * 也就是说"直接输 URL 打不开"这一条对商家端不成立，其余模块成立。
 *
 * 为什么要单独一个文件：站内有四个**互相独立**的 PHP 入口，都不经过 index.php ——
 *   webroot/index.php                 ?service=xxx 与伪静态都从这里进
 *   webroot/website.php               自助建站展示（?type=template 还能看草稿，本身无登录校验）
 *   webroot/special.php               专题展示
 *   webroot/wmsj/                     外卖商家端整套后台（40 个 PHP，36 个经 inc/config.inc.php，
 *                                     login.php / exit.php 各自直接引 common.inc.php）
 * 只堵 index.php 等于只堵了一个门，所以守卫放这里、四处共同引用。
 *
 * 本文件在被 include 时**没有任何副作用**（只定义函数、不读配置、不输出、不 die），
 * 单元测试可以直接 require 它。
 *
 * 开关：容器 env FBS_TG_SERVICE_WHITELIST，默认开启。0/false/off/no 关闭 → 完全退回改造前行为。
 * 读 env 依赖官方 php:*-fpm 镜像 docker.conf 里的 clear_env = no（与 FBS_GATEWAY_SECRET 同一前提）。
 */

if (!function_exists('fbsTgServiceAllowed')) {
    /**
     * 白名单：放行 = true。
     * 名单对应需求文档的五个业务块：外卖（含跑腿、骑手端 do=courier）、资讯、旅游、会员、站点首页。
     * article 本期未做页面适配，但名单按文档保留，避免下一期再改一次。
     * 严格匹配：不做大小写折叠、不 trim —— $service 进来之前已被调用方洗成纯字母数字。
     *
     * business 是**产品裁决后加进来的例外**（2026-11-06）：不放行它，商家自己的网页后台
     * 整体不可用（会员中心里「全部订单 / 待接单 / 商品管理」PC 8 处 + 移动 4 处跳转全被 302，
     * 订单角标 AJAX 静默失败），这一期商家没有别的接单入口。
     * 代价是验收第 2 条「其它模块直接输入 URL 也打不开」出现一个例外：?service=business
     * 与 /wmsj/** 商家能打开。首页导航不受影响（导航由模块表驱动，不会因此多出商家入口），
     * 顾客与骑手链路也确认零影响（Vic 复核：模板里只有 5 处引用 /wmsj/，4 处是商家自己的跳转，
     * 1 处是顾客跑腿页引的 CSS，走静态直出不触发守卫）。
     * 商家端没有做 Telegram 适配，页面里仍会出现火鸟自己的顶栏与返回键 —— 这是已知的观感差异。
     */
    function fbsTgServiceAllowed($service)
    {
        if (!is_scalar($service)) {
            return false;
        }
        $allow = array('waimai', 'article', 'travel', 'member', 'siteConfig', 'business');
        return in_array((string)$service, $allow, true);
    }
}

if (!function_exists('fbsTgServiceWhitelistEnabled')) {
    /**
     * 总开关。未配置 = 开启（漏配时宁可收紧，不要多开模块）。
     */
    function fbsTgServiceWhitelistEnabled()
    {
        $value = getenv('FBS_TG_SERVICE_WHITELIST');
        if ($value === false || trim($value) === '') {
            return true;
        }
        return !in_array(strtolower(trim($value)), array('0', 'false', 'off', 'no'), true);
    }
}

if (!function_exists('fbsTgServiceDecision')) {
    /**
     * 纯决策函数：不读全局、不做 I/O，便于单测穷举。
     *
     * @param  string $service      当前入口代表的 service 名
     * @param  string $defaultIndex $cfg_defaultindex（站点默认首页配置）
     * @param  string $fromMarker   本次请求的 ?from= 值
     * @param  bool   $enabled      开关是否开启
     * @return string 'allow' 放行 | 'home' 302 回首页 | 'notfound' 直接 404
     *
     * 为什么需要 notfound 这一档，而不是一律 home：
     *   1. 回首页的 URL 自己带 from=tg_whitelist。如果带着这个标记又被拦，
     *      说明首页本身就在被拦范围内，再跳一次就是无限重定向 —— 直接 404 断开。
     *   2. $cfg_defaultindex 允许配成"数字型自定义模块"（把商家模块设为首页是官方支持的配置），
     *      index.php 会把它解析成 business。此时 '3' == 'business' 为 false，
     *      原来只比对字符串会漏判、变成 302 → 再解析 → 再 302 的死循环。
     */
    function fbsTgServiceDecision($service, $defaultIndex, $fromMarker, $enabled)
    {
        if (!$enabled) {
            return 'allow';
        }
        if (fbsTgServiceAllowed($service)) {
            return 'allow';
        }

        $fromMarker   = is_scalar($fromMarker) ? (string)$fromMarker : '';
        $defaultIndex = is_scalar($defaultIndex) ? (string)$defaultIndex : '';

        // 已经跳过一次还没出去 → 首页自身被拦
        if ($fromMarker === 'tg_whitelist') {
            return 'notfound';
        }

        // 默认首页就是这个被拦的 service，或被配成了数字型自定义模块 → 跳回去只会再来一遍
        if ($defaultIndex !== '' && ($defaultIndex === (string)$service || is_numeric($defaultIndex))) {
            return 'notfound';
        }

        return 'home';
    }
}

if (!function_exists('fbsTgServiceGuard')) {
    /**
     * 执行守卫：放行则直接返回，拦截则 302 回首页或 404 后终止。
     * 依赖调用方已经 include 过 include/common.inc.php（$cfg_secureAccess / $cfg_basehost / $cfg_defaultindex 才有值）。
     */
    function fbsTgServiceGuard($service)
    {
        global $cfg_secureAccess, $cfg_basehost, $cfg_defaultindex;

        $fromMarker = isset($_GET['from']) && is_string($_GET['from']) ? $_GET['from'] : '';
        $decision   = fbsTgServiceDecision(
            $service,
            isset($cfg_defaultindex) ? $cfg_defaultindex : '',
            $fromMarker,
            fbsTgServiceWhitelistEnabled()
        );

        if ($decision === 'allow') {
            return;
        }

        if ($decision === 'notfound') {
            header('HTTP/1.1 404 Not Found');
            die;
        }

        // 必须是 302（header("location:") 的默认值），不能写死 301：
        // 301 会被浏览器永久缓存，等哪天真要靠开关退回，用户本地照样照着旧缓存跳走。
        // from=tg_whitelist 既用于运维按日志计数，也是上面的防循环标记。
        header('location:' . $cfg_secureAccess . $cfg_basehost . '/?from=tg_whitelist');
        die;
    }
}
