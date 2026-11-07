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
        array('title' => 'Bot Token', 'name' => 'bot_token', 'type' => 'text', 'description' => '@BotFather 下发的机器人令牌（形如 123456:ABC...），用于校验 Mini App 的 initData 签名。'),
        array('title' => '机器人用户名', 'name' => 'bot_username', 'type' => 'text', 'description' => '选填，不带 @，如 fbird_men_bot。用于在浏览器/微信里点击登录时跳转到机器人确认；不填默认 fbird_men_bot。')
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
     * login 入口。按 act 分发：
     *   (空)            落地页：在 Telegram 内直接用 initData 登录；不在 Telegram 内则走「机器人确认」流程
     *   new             创建一次性登录令牌，返回跳转 Telegram 机器人的链接
     *   poll            原浏览器轮询令牌是否已被确认；确认后在本次响应里签发站点会话
     *   confirm         机器人里的 Mini App 页：让用户确认「用这个 Telegram 账号登录网站」
     *   confirm_submit  confirm 页提交 initData，令牌置为已确认
     * @param   array   $data  配置信息
     */
    function login($data){

        $act = isset($_GET['act']) ? (string)$_GET['act'] : '';
        if($act === 'new'){            $this->tokenNew($data); }
        if($act === 'poll'){           $this->tokenPoll($data); }
        if($act === 'confirm'){        $this->confirmPage($data); }
        if($act === 'confirm_submit'){ $this->confirmSubmit($data); }

        $callback = htmlspecialchars($data['callback'], ENT_QUOTES, 'UTF-8');

        header('Content-Type: text/html; charset=utf-8');
        header('Cache-Control: no-store');
        header('Referrer-Policy: same-origin');
        echo '<!DOCTYPE html><html><head><meta charset="utf-8">'
           . '<meta name="viewport" content="width=device-width,initial-scale=1">'
           . '<title>Telegram</title>'
           . '<style>html,body{margin:0;background:#fff;color:#222;font:16px/1.6 sans-serif}p{padding:12px 24px;text-align:center;margin:0}'
           . '#open{display:none;margin:18px auto;padding:12px 28px;background:#2AABEE;color:#fff;border-radius:24px;text-decoration:none;font-size:17px}'
           . '#wrap{text-align:center;padding-top:40px}</style>'
           . '<script src="https://telegram.org/js/telegram-web-app.js"></script></head><body>'
           . '<div id="wrap"><p id="msg">正在登录… / Signing in…</p>'
           . '<a id="open" target="_blank" rel="noopener" href="#">打开 Telegram 确认登录</a><p id="hint"></p></div>'
           . '<form id="f" method="POST" action="' . $callback . '"><input type="hidden" name="initData" id="d" value=""></form>'
           . '<script>(function(){'
           . 'var tg=window.Telegram&&window.Telegram.WebApp;'
           . 'if(tg){try{tg.ready&&tg.ready();}catch(e){}try{tg.expand&&tg.expand();}catch(e){}}'
           . 'var d=tg&&tg.initData;'
           // SDK 没给出 initData 时（站内跳转后偶发），退回读 SDK 自己存的会话参数 / URL 片段
           . 'function pick(s){try{var m=/(?:^|[#&?])tgWebAppData=([^&]+)/.exec(s||"");return m?decodeURIComponent(m[1]):"";}catch(e){return "";}}'
           . 'if(!d){try{var ss=sessionStorage.getItem("__telegram__initParams")||"";if(ss){var o=JSON.parse(ss);d=o&&o.tgWebAppData?String(o.tgWebAppData):"";}}catch(e){}}'
           . 'if(!d){d=pick(location.hash);}'
           . 'if(d){document.getElementById("d").value=d;document.getElementById("f").submit();return;}'
           // 不在 Telegram 内（微信、Safari 等）：创建令牌 → 用户点按钮打开 Telegram 机器人确认 → 本页轮询
           . 'var msg=document.getElementById("msg"),a=document.getElementById("open"),hint=document.getElementById("hint");'
           . 'var B="/api/login.php?type=telegram";'
           . 'function J(u){return fetch(u,{credentials:"include",cache:"no-store"}).then(function(r){return r.json();});}'
           . 'msg.textContent="正在准备… / Preparing…";'
           . 'J(B+"&act=new").then(function(j){'
           .   'if(!j||!j.ok){throw 0;}'
           .   'a.href=j.link;a.style.display="inline-block";'
           .   'msg.textContent="请在 Telegram 里确认登录 / Confirm sign-in in Telegram";'
           .   'hint.textContent=/MicroMessenger/i.test(navigator.userAgent)?"若点了没反应：请点右上角「…」，选择在浏览器中打开本页，再点上面的按钮。":"确认后会自动回到这里。 / You will be signed in here after confirming.";'
           .   'var n=0,t=j.token;(function tick(){'
           .     'J(B+"&act=poll&t="+t).then(function(r){'
           .       'if(r&&r.ok){location.replace(r.location||"/");return;}'
           .       'if(r&&r.state==="expired"){msg.textContent="已超时，请刷新本页重试 / Timed out, please reload";a.style.display="none";return;}'
           .       'if(++n<150){setTimeout(tick,2000);}'
           .     '}).catch(function(){if(++n<150){setTimeout(tick,3000);}});'
           .   '})();'
           . '}).catch(function(){msg.textContent="暂时无法登录，请稍后再试 / Unavailable, try again later";});'
           . '})();</script></body></html>';
        exit;
    }

    /* ---------------- 机器人确认流程 ---------------- */

    private function jsonOut($arr, $code = 200){
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        echo json_encode($arr);
        exit;
    }

    private function ensureTokenTable(){
        global $dsql;
        $sql = $dsql->SetQuery("CREATE TABLE IF NOT EXISTS `#@__telegram_login_token` ("
            . "`token` char(32) NOT NULL, `state` tinyint(1) NOT NULL DEFAULT 0, `init_data` text, "
            . "`ip` varchar(45) NOT NULL DEFAULT '', `created` int(10) unsigned NOT NULL DEFAULT 0, "
            . "PRIMARY KEY (`token`), KEY `created` (`created`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        $dsql->dsqlOper($sql, "update");
    }

    private function validToken($t){
        return is_string($t) && preg_match('/^[a-f0-9]{32}$/', $t) === 1;
    }

    /** 机器人用户名：后台可配，没配则用默认 */
    private function botName($data){
        $n = isset($data['bot_username']) ? trim($data['bot_username']) : '';
        $n = ltrim($n, '@');
        return preg_match('/^[A-Za-z0-9_]{5,32}$/', $n) === 1 ? $n : 'fbird_men_bot';
    }

    private function loadBridge($data){
        $token = isset($data['bot_token']) ? trim($data['bot_token']) : '';
        if($token === ''){
            return false;
        }
        if(!defined('FBS_BRIDGE_TEST')){
            define('FBS_BRIDGE_TEST', true);
        }
        putenv('FBS_TG_BOT_TOKEN=' . $token);
        require_once HUONIAOROOT . '/api/fbs/bridge.php';
        return $token;
    }

    /** 创建令牌：同一 IP 10 分钟内最多 20 个 */
    private function tokenNew($data){
        global $dsql;
        $this->ensureTokenTable();
        $ip = function_exists('GetIP') ? (string)GetIP() : (isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '');
        $ip = preg_match('/^[0-9a-fA-F:.]{1,45}$/', $ip) ? $ip : '';
        $now = time();

        $dsql->dsqlOper($dsql->SetQuery("DELETE FROM `#@__telegram_login_token` WHERE `created` < " . ($now - 86400)), "update");
        $cnt = $dsql->dsqlOper($dsql->SetQuery("SELECT COUNT(*) AS c FROM `#@__telegram_login_token` WHERE `ip` = '$ip' AND `created` > " . ($now - 600)), "results");
        if(is_array($cnt) && isset($cnt[0]['c']) && (int)$cnt[0]['c'] >= 20){
            $this->jsonOut(array('ok' => false, 'error' => 'rate_limited'), 429);
        }

        $token = bin2hex(random_bytes(16));
        $dsql->dsqlOper($dsql->SetQuery("INSERT INTO `#@__telegram_login_token` (`token`, `state`, `ip`, `created`) VALUES ('$token', 0, '$ip', $now)"), "update");

        $this->jsonOut(array(
            'ok'    => true,
            'token' => $token,
            'link'  => 'https://t.me/' . $this->botName($data) . '?start=login_' . $token,
        ));
    }

    /** 原浏览器轮询：已确认则一次性消费并签发会话 */
    private function tokenPoll($data){
        global $dsql, $cfg_cookiePath;
        $t = isset($_GET['t']) ? (string)$_GET['t'] : '';
        if(!$this->validToken($t)){
            $this->jsonOut(array('ok' => false, 'state' => 'invalid'), 400);
        }
        $this->ensureTokenTable();
        $now = time();
        $rows = $dsql->dsqlOper($dsql->SetQuery("SELECT `state`, `init_data`, `created` FROM `#@__telegram_login_token` WHERE `token` = '$t'"), "results");
        if(!is_array($rows) || !$rows){
            $this->jsonOut(array('ok' => false, 'state' => 'expired'));
        }
        $row = $rows[0];
        if((int)$row['created'] < $now - 300 || (int)$row['state'] === 2){
            $this->jsonOut(array('ok' => false, 'state' => 'expired'));
        }
        if((int)$row['state'] !== 1){
            $this->jsonOut(array('ok' => false, 'state' => 'pending'));
        }

        // 一次性消费：只有抢到的那个请求能签发会话
        $claimed = (int)$dsql->dsqlOper($dsql->SetQuery("UPDATE `#@__telegram_login_token` SET `state` = 2, `init_data` = '' WHERE `token` = '$t' AND `state` = 1"), "totalCount");
        if($claimed !== 1){
            $this->jsonOut(array('ok' => false, 'state' => 'pending'));
        }

        $initData = base64_decode((string)$row['init_data'], true);
        if(!$initData || $this->loadBridge($data) === false){
            $this->jsonOut(array('ok' => false, 'state' => 'error'), 500);
        }
        $next = $this->nextPath(GetCookie('furl'));
        list($status, $payload, $cookies) = fbs_bridge_handle_request($initData, array(
            'issue'    => true,
            'next'     => $next,
            'redirect' => true,
            'context'  => array('ip' => fbs_bridge_client_ip()),
        ));
        if($status !== 200){
            $this->jsonOut(array('ok' => false, 'state' => 'error'), $status === 429 ? 429 : 401);
        }
        foreach($cookies as $cookie){
            header('Set-Cookie: ' . $cookie, false);
        }
        PutCookie("furl", "", -1, $cfg_cookiePath);
        $location = isset($payload['location']) && $payload['location'] !== '' ? $payload['location'] : '/';
        $this->jsonOut(array('ok' => true, 'location' => $location));
    }

    /** 机器人 web_app 按钮指向的确认页（在 Telegram 内打开，拿得到真实 initData） */
    private function confirmPage($data){
        $t = isset($_GET['t']) ? (string)$_GET['t'] : '';
        header('Content-Type: text/html; charset=utf-8');
        header('Cache-Control: no-store');
        header('Referrer-Policy: same-origin');
        if(!$this->validToken($t)){
            http_response_code(400);
            echo '<!DOCTYPE html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><p style="font:16px sans-serif;padding:24px">链接无效 / Invalid link</p>';
            exit;
        }
        $tj = json_encode($t);
        echo '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
           . '<title>确认登录</title><style>html,body{margin:0;background:#fff;color:#222;font:16px/1.6 sans-serif}'
           . '.b{max-width:360px;margin:0 auto;padding:40px 24px;text-align:center}'
           . 'button{margin-top:22px;padding:12px 32px;background:#2AABEE;color:#fff;border:0;border-radius:24px;font-size:17px}'
           . 'button[disabled]{opacity:.5}.s{color:#888;font-size:13px;margin-top:16px}</style>'
           . '<script src="https://telegram.org/js/telegram-web-app.js"></script></head><body><div class="b">'
           . '<h3 style="margin:0 0 10px">确认登录网站？</h3>'
           . '<p id="m">有人正在网站上请求用你的 Telegram 账号登录。<br>只有这是<b>你本人刚刚</b>在网站上发起的，才点确认。</p>'
           . '<button id="ok">确认登录 / Confirm</button><p class="s" id="s"></p></div>'
           . '<script>(function(){var T=' . $tj . ';var tg=window.Telegram&&window.Telegram.WebApp;'
           . 'if(tg){try{tg.ready();tg.expand();}catch(e){}}'
           . 'var b=document.getElementById("ok"),s=document.getElementById("s"),m=document.getElementById("m");'
           . 'if(!tg||!tg.initData){b.style.display="none";m.textContent="请从 Telegram 机器人里打开本页面 / Please open from the Telegram bot";return;}'
           . 'b.onclick=function(){b.disabled=true;s.textContent="";'
           . 'fetch("/api/login.php?type=telegram&act=confirm_submit",{method:"POST",credentials:"include",headers:{"Content-Type":"application/x-www-form-urlencoded"},'
           . 'body:"t="+encodeURIComponent(T)+"&initData="+encodeURIComponent(tg.initData)})'
           . '.then(function(r){return r.json();}).then(function(j){'
           . 'if(j&&j.ok){m.textContent="已确认，请回到刚才的浏览器。 / Confirmed — return to your browser.";b.style.display="none";setTimeout(function(){try{tg.close();}catch(e){}},1500);}'
           . 'else{b.disabled=false;s.textContent="确认失败，请回到网站重新发起 / Failed, please retry from the website";}'
           . '}).catch(function(){b.disabled=false;s.textContent="网络异常 / Network error";});};'
           . '})();</script></body></html>';
        exit;
    }

    /** 确认页提交：验签 → 令牌 0→1，暂存 initData（5 分钟内、一次性） */
    private function confirmSubmit($data){
        global $dsql;
        if(!$this->sameSite()){
            $this->jsonOut(array('ok' => false), 403);
        }
        $t = isset($_POST['t']) ? (string)$_POST['t'] : '';
        $initData = isset($_POST['initData']) ? (string)$_POST['initData'] : '';
        if(!$this->validToken($t) || $initData === '' || strlen($initData) > 4096){
            $this->jsonOut(array('ok' => false), 400);
        }
        $token = $this->loadBridge($data);
        if($token === false){
            $this->jsonOut(array('ok' => false), 500);
        }
        $pairs = fbs_bridge_parse_init_data($initData);
        if(!fbs_bridge_verify_signature($pairs, $token)){
            $this->jsonOut(array('ok' => false), 403);
        }
        $fresh = fbs_bridge_check_freshness(isset($pairs['auth_date']) ? $pairs['auth_date'] : null);
        if(!$fresh[0] || fbs_bridge_extract_user_id($pairs) === null){
            $this->jsonOut(array('ok' => false), 401);
        }
        $this->ensureTokenTable();
        $now = time();
        $b64 = base64_encode($initData);
        $ok = (int)$dsql->dsqlOper($dsql->SetQuery("UPDATE `#@__telegram_login_token` SET `state` = 1, `init_data` = '$b64' WHERE `token` = '$t' AND `state` = 0 AND `created` > " . ($now - 300)), "totalCount");
        $this->jsonOut(array('ok' => $ok === 1), $ok === 1 ? 200 : 410);
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
