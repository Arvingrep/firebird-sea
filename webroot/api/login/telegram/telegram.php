<?php
/**
 * Telegram Mini App 快捷登录
 *
 * 参照 Facebook 快捷登录插件的结构（api/login/facebook/facebook.php）：
 *   login()  → 打开落地页，取 Telegram 注入的 initData，POST 回本插件的回调地址
 *   back()   → 验签 initData → 查/建会员 → 签发火鸟会话 Cookie → 302 回登录前页面
 *
 * 验签、会员创建、会话 Cookie 全部复用 api/fbs/bridge.php 的实现（进程内调用，
 * 不经 /api/fbs 对外路由——那条路由在边缘被 deny-gateway 拦截，且不应对外开放）。
 * 不依赖 Node 登录桥（KI-005 关闭的那条链）。
 *
 * 后台配置：Bot Token（BotFather 下发）。Token 属于机密，只存后台配置、不出现在页面和日志里。
 *
 * @package        HuoNiao.Login
 */

if(!defined('HUONIAOINC')) exit('Request Error!');

$logincode = basename(__FILE__, '.php');

/* 基本信息 */
if(isset($set_modules) && $set_modules == TRUE){

    $i = isset($login) ? count($login) : 0;

    /* 代码 */
    $login[$i]['code'] = $logincode;

    /* 名称 */
    $login[$i]['name'] = "Telegram快捷登录";

    /* 回调地址 */
    $login[$i]['callback'] = $cfg_secureAccess.$cfg_basehost."/api/login.php?action=back&type=telegram";

    /* 版本号 */
    $login[$i]['version']  = '1.0.0';

    /* 描述 */
    $login[$i]['desc'] = '在 Telegram Mini App 内一键登录：校验 Telegram 下发的 initData 签名，自动创建或登录对应会员。需填写 BotFather 下发的 Bot Token。';

    /* 作者 */
    $login[$i]['author']   = 'firebird-sea';

    /* 网址 */
    $login[$i]['website']  = 'https://core.telegram.org/bots/webapps';

    /* 配置信息 */
    $login[$i]['config'] = array(
        array('title' => 'Bot Token', 'name' => 'bot_token', 'type' => 'text', 'description' => '@BotFather 下发的机器人令牌（形如 123456:ABC...），用于校验 Mini App 的 initData 签名。')
    );

    return;
}

/**
 * 类
 */
class Logintelegram {

    function __construct(){
        $this->Logintelegram();
    }

    function Logintelegram(){}

    /**
     * 打开落地页：取 initData 后 POST 到回调地址。
     * 必须是导航式表单提交（不能用 fetch），这样才能跟随服务端的 302 并带上 Set-Cookie。
     * @param   array   $data  配置信息
     */
    function login($data){

        $callback = htmlspecialchars($data['callback'], ENT_QUOTES, 'UTF-8');

        header('Content-Type: text/html; charset=utf-8');
        header('Cache-Control: no-store');
        header('Referrer-Policy: same-origin');
        echo '<!DOCTYPE html><html><head><meta charset="utf-8">'
           . '<meta name="viewport" content="width=device-width,initial-scale=1">'
           . '<title>Telegram</title>'
           . '<style>html,body{margin:0;background:#fff;color:#222;font:16px/1.6 sans-serif}p{padding:24px;text-align:center}</style>'
           . '<script src="https://telegram.org/js/telegram-web-app.js"></script></head><body>'
           . '<p id="msg">正在登录… / Signing in…</p>'
           . '<form id="f" method="POST" action="' . $callback . '"><input type="hidden" name="initData" id="d" value=""></form>'
           . '<script>(function(){'
           . 'var tg=window.Telegram&&window.Telegram.WebApp;'
           . 'if(tg){try{tg.ready&&tg.ready();}catch(e){}try{tg.expand&&tg.expand();}catch(e){}}'
           . 'var d=tg&&tg.initData;'
           . 'if(d){document.getElementById("d").value=d;document.getElementById("f").submit();}'
           . 'else{document.getElementById("msg").textContent="请从 Telegram 内打开本页面 / Please open this page inside Telegram";}'
           . '})();</script></body></html>';
        exit;
    }

    /**
     * 登录回调：验签 → 查/建会员 → 签发会话 → 302。
     * @param array $data   配置信息
     * @param array $return 返回信息
     */
    function back($data, $return){

        global $cfg_secureAccess, $cfg_basehost, $cfg_cookiePath;

        // 登录 CSRF 闸门：跨站表单 POST 可把受害者登录成攻击者的账号。
        // 优先看 Origin，其次 Referer；两者都没有则拒绝（老 WebView 同源表单一般仍带 Referer）。
        if(!$this->sameSite()){
            $this->fail(403, 'Forbidden');
        }

        $initData = isset($_POST['initData']) ? (string)$_POST['initData'] : '';
        if($initData === ''){
            $this->fail(400, 'Missing initData');
        }
        $token = isset($data['bot_token']) ? trim($data['bot_token']) : '';
        if($token === ''){
            $this->fail(500, 'Telegram login is not configured');
        }

        // 登录前页面：login.php 在进入登录时把 furl 写进了 Cookie；只放行站内路径
        $next = $this->nextPath(GetCookie('furl'));

        // 复用 bridge.php 的验签与会话签发。FBS_BRIDGE_TEST 让它只加载函数、不启动自己的 HTTP 入口。
        if(!defined('FBS_BRIDGE_TEST')){
            define('FBS_BRIDGE_TEST', true);
        }
        putenv('FBS_TG_BOT_TOKEN=' . $token);
        require_once HUONIAOROOT . '/api/fbs/bridge.php';

        list($status, $payload, $cookies) = fbs_bridge_handle_request($initData, array(
            'issue'    => true,
            'next'     => $next,
            'redirect' => true,
            'context'  => array('ip' => fbs_bridge_client_ip()),
        ));

        if($status !== 200){
            // 不回显内部细节（签名/时效/重放等），日志里由 bridge 自己记录
            $this->fail($status === 429 ? 429 : ($status >= 500 ? 500 : 401), $status === 429 ? 'Too many attempts' : 'Login failed');
        }

        foreach($cookies as $cookie){
            header('Set-Cookie: ' . $cookie, false);
        }
        PutCookie("furl", "", -1, $cfg_cookiePath);

        $location = isset($payload['location']) && $payload['location'] !== '' ? $payload['location'] : '/';
        header('Location: ' . $location, true, 302);
        exit;
    }

    /**
     * APP 登录：Telegram Mini App 登录不走原生 APP，不支持。
     */
    function appback($data, $return){
        $this->fail(400, 'Not supported');
    }

    /** Origin / Referer 必须属于本站 */
    private function sameSite(){
        global $cfg_basehost;
        $host = strtolower(preg_replace('/:\d+$/', '', (string)$cfg_basehost));
        $host = preg_replace('#^https?://#', '', $host);
        $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
        $ref    = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '';
        $src    = $origin !== '' ? $origin : $ref;
        if($src === ''){
            return false;
        }
        $h = parse_url($src, PHP_URL_HOST);
        return is_string($h) && strtolower($h) === $host;
    }

    /** furl 可能是绝对地址：同站则取路径，否则回首页；只返回站内相对路径 */
    private function nextPath($furl){
        global $cfg_basehost;
        $furl = is_string($furl) ? trim(urldecode($furl)) : '';
        if($furl === ''){
            return '/';
        }
        if($furl[0] !== '/'){
            $p = parse_url($furl);
            $host = strtolower(preg_replace('#^https?://#', '', preg_replace('/:\d+$/', '', (string)$cfg_basehost)));
            if(!$p || empty($p['host']) || strtolower($p['host']) !== $host){
                return '/';
            }
            $furl = (isset($p['path']) ? $p['path'] : '/') . (isset($p['query']) ? '?' . $p['query'] : '');
        }
        // 不回到登录/注册页自身
        if(preg_match('#^/(login|register)#i', $furl)){
            return '/';
        }
        return strlen($furl) <= 200 ? $furl : '/';
    }

    private function fail($code, $msg){
        http_response_code($code);
        header('Content-Type: text/html; charset=utf-8');
        echo '<!DOCTYPE html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
           . '<div style="font:16px/1.6 sans-serif;padding:24px"><p>' . htmlspecialchars($msg, ENT_QUOTES, 'UTF-8') . '</p>'
           . '<p><a href="/login.html">Back to login / 返回登录</a></p></div>';
        exit;
    }

}
