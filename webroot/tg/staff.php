<?php
/**
 * 员工 Telegram 免密落地页（B 线：纯 PHP，零 Node/Go 依赖）
 *
 * 同一个文件两种角色：
 *   GET  → HTML 壳（spinner + 错误区），由 telegram-web-app.js 取 initData 后 POST 回本页；
 *   POST → JSON 接口：验签 → 防重放 → 查绑定 → 复核 → 签会话 Cookie → 返回 redirect。
 *
 * 刻意保持轻量：不引入火鸟 common.inc.php。
 * 原因同 webroot/tg/entry.php:12-14 —— common.inc.php 强依赖 swoole_loader 扩展且要求
 * PHP 恰好 7.4；登录页只需要 bridge.php 这份自包含函数库，把整站引导链拉进来只会
 * 让"落地页本身挂了"成为新的故障点。
 *
 * 与顾客/商家落地页的差异：员工不走「按 username=tg_<id> 查/建会员」，
 * 而是 3) 读 fbs_staff_map 底账 → 4) 用 staff_id 复核 huoniao_staff 行仍在且 sid 未变 →
 * 5) 用 member_id 取真实会员 → 6) 用 fbs_bridge_build_session_cookies() 签原生会话 Cookie
 * （path/domain 属性与 merchant_session 完全一致，同一个 fbs_bridge_load_site_config()）。
 *
 * 安全约定：
 *   - 不接受任何 GET 参数改 sid，不渲染任何表单；
 *   - initData 只在内存流转：不写日志、不进 URL、不进 localStorage；
 *   - MAX_AUTH_AGE 3600 秒，与 services/api/src/tgLogin.js 的 LOGIN_MAX_AGE_SECONDS 一致；
 *   - 防重放走 fbs_bridge_replay_check()（文件锁计数器，阈值 5、TTL 7200s），
 *     超限 429；同 entry.php 的注释：同一份 initData 每提交一次扣一次重放额度，
 *     所以 GET 壳刻意不提供「重试」按钮 —— 重开 TMA 会拿到新的 initData，不受配额影响。
 *
 * 错误码约定（均为 200 + success:false，HTTP 状态只反映传输层问题）：
 *   STAFF_NOT_BOUND   未绑定（无 map 行 / staff 行已删 / sid 变了 / 会员不存在）
 *   MEMBER_DISABLED   会员 state != 1（火鸟 getMemberID 只认 state=1，禁用号不得放行）
 *   401 INIT_DATA_INVALID / INIT_DATA_EXPIRED   非法 / 过期 initData
 *   429 REPLAY_LIMITED  同一 initData 重放超阈值
 *   500 SERVER_ERROR / CONFIG_MISSING             库不可用 / bot_token 未配置
 */

// bridge.php 文件末尾默认会直接执行 fbs_bridge_http_entry()（顾客入口）。
// 本页只是把 bridge 当函数库用，必须先钉住测试开关再 require，否则 require 的一瞬间
// 就会跑顾客会话签发流程，与本页逻辑互相干扰。
define('FBS_BRIDGE_TEST', true);

require_once __DIR__ . '/../api/fbs/bridge.php';

/* ============================== POST 主流程（可单测，不碰 header） ============================== */

/**
 * @param  string $initData 完整原始 initData 串
 * @param  array  $context  可注入：bot_token / pdo / db_prefix / dbinfo / replay_dir / now / config
 * @return array [httpCode, payload, cookieHeaders]
 *         payload 形如 {success:true,data:{redirect}} 或 {success:false,error:{code,message}}
 */
function fbs_staff_landing_handle($initData, array $context = array())
{
    $fail = function ($code, $message, $http = 200) {
        return array($http, array(
            'success' => false,
            'error'   => array('code' => $code, 'message' => $message),
        ), array());
    };

    $initData = trim((string)$initData);
    if ($initData === '') {
        return $fail('INIT_DATA_INVALID', 'initData is required', 401);
    }

    // 1. 验签链路：parse → verify → freshness（MAX_AUTH_AGE 3600 由 bridge 内置）
    $botToken = isset($context['bot_token']) ? (string)$context['bot_token'] : fbs_bridge_get_bot_token();
    if ($botToken === '') {
        return $fail('SERVER_ERROR', 'Telegram bot token is not configured', 500);
    }

    $pairs = fbs_bridge_parse_init_data($initData);
    if (!fbs_bridge_verify_signature($pairs, $botToken)) {
        return $fail('INIT_DATA_INVALID', 'initData signature verification failed', 401);
    }

    $now = isset($context['now']) ? (int)$context['now'] : time();
    $fresh = fbs_bridge_check_freshness(isset($pairs['auth_date']) ? $pairs['auth_date'] : null, $now);
    if (!$fresh[0]) {
        return $fail('INIT_DATA_EXPIRED', 'initData expired or not yet valid', 401);
    }

    // 2. 防重放：同一 initData 超过阈值 → 429（记账只对签名合法的请求生效，与 bridge 同序）
    list($allowed,) = fbs_bridge_replay_check(
        $initData,
        isset($context['replay_dir']) ? $context['replay_dir'] : null
    );
    if (!$allowed) {
        return $fail('REPLAY_LIMITED', 'Too many uses of the same initData', 429);
    }

    $tgUserId = fbs_bridge_extract_user_id($pairs);
    if ($tgUserId === null) {
        return $fail('INIT_DATA_INVALID', 'initData must contain user.id', 401);
    }

    // 3. 数据库连接（测试可注入 PDO 或其桩；生产走 bridge 的 dbinfo 解析）
    if (isset($context['pdo']) && is_object($context['pdo']) && method_exists($context['pdo'], 'prepare')) {
        $pdo    = $context['pdo'];
        $prefix = isset($context['db_prefix']) ? (string)$context['db_prefix'] : 'huoniao_';
    } else {
        $dbinfo = isset($context['dbinfo']) ? $context['dbinfo'] : fbs_bridge_load_db_config();
        if (isset($dbinfo['error'])) {
            return $fail('SERVER_ERROR', 'database is not available', 500);
        }
        list($pdo, $dbError) = fbs_bridge_db_connect($dbinfo);
        if ($dbError !== null) {
            return $fail('SERVER_ERROR', 'database is not available', 500);
        }
        $prefix = $dbinfo['prefix'];
    }
    if (!preg_match('/^[A-Za-z0-9_]*$/', $prefix)) {
        return $fail('SERVER_ERROR', 'DB_PREFIX contains illegal characters', 500);
    }

    // 4. 读绑定底账（fbs_staff_map 无表前缀，见 migrations/011_fbs_staff_map.sql）
    try {
        $stmt = $pdo->prepare('SELECT * FROM `fbs_staff_map` WHERE `tg_user_id` = ? LIMIT 1');
        $stmt->execute(array((string)$tgUserId));
        $mapRow = $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        error_log('[fbs_staff] staff_map select failed: ' . $e->getMessage());
        return $fail('SERVER_ERROR', 'database query failed', 500);
    }
    if (!$mapRow) {
        return $fail('STAFF_NOT_BOUND', 'staff not bound to any shop');
    }

    // 5. 用 staff_id 复核 huoniao_staff 行仍在且 sid 未变（商家删行后必须失效）
    $staffId = (int)$mapRow['staff_id'];
    $mapSid  = (int)$mapRow['sid'];
    try {
        $stmt = $pdo->prepare('SELECT `id`, `sid` FROM `' . $prefix . 'staff` WHERE `id` = ? LIMIT 1');
        $stmt->execute(array($staffId));
        $staffRow = $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        error_log('[fbs_staff] staff select failed: ' . $e->getMessage());
        return $fail('SERVER_ERROR', 'database query failed', 500);
    }
    if (!$staffRow || (int)$staffRow['sid'] !== $mapSid) {
        return $fail('STAFF_NOT_BOUND', 'staff row is gone or moved to another shop');
    }

    // 6. 取会员（员工绑定的是真实会员，不是 tg_<id> 空号）
    $memberId = (int)$mapRow['member_id'];
    try {
        $stmt = $pdo->prepare(
            'SELECT `id`, `username`, `password`, `state` FROM `' . $prefix . 'member` WHERE `id` = ? LIMIT 1'
        );
        $stmt->execute(array($memberId));
        $memberRow = $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        error_log('[fbs_staff] member select failed: ' . $e->getMessage());
        return $fail('SERVER_ERROR', 'database query failed', 500);
    }
    if (!$memberRow) {
        // 会员被注销/删除：视同未绑定，不给任何侧信道
        return $fail('STAFF_NOT_BOUND', 'staff not bound to any shop');
    }
    // 火鸟 getMemberID() 只认 state=1（userLogin.class.php:1995），禁用号不能签会话
    if ((int)$memberRow['state'] !== 1) {
        return $fail('MEMBER_DISABLED', 'member is disabled');
    }

    // 7. 签原生会话 Cookie（path/domain 属性与 merchant_session 完全一致）
    $cfg = isset($context['config']) && is_array($context['config'])
        ? $context['config']
        : fbs_bridge_load_site_config();
    $cookies = fbs_bridge_build_session_cookies($memberRow['id'], (string)$memberRow['password'], $cfg, $now);

    return array(200, array(
        'success' => true,
        'data'    => array('redirect' => '/member?action=workPlatform'),
    ), $cookies);
}

/* ============================== HTTP 入口 ============================== */

function fbs_staff_landing_http_entry()
{
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        header('X-Content-Type-Options: nosniff');
        header('Referrer-Policy: no-referrer');

        // 只认 JSON 体 {"initData": "..."}；initData 绝不从 URL/GET 参数读取
        $initData = '';
        $body = file_get_contents('php://input');
        if ($body !== false && $body !== '') {
            $json = json_decode($body, true);
            if (is_array($json) && isset($json['initData']) && is_string($json['initData'])) {
                $initData = $json['initData'];
            }
        }

        list($httpCode, $payload, $cookies) = fbs_staff_landing_handle($initData);

        // 只有签发成功才下发 Cookie；错误响应绝不带登录态
        if ($httpCode === 200 && !empty($payload['success'])) {
            foreach ($cookies as $cookie) {
                header('Set-Cookie: ' . $cookie, false);
            }
        }

        http_response_code($httpCode);
        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
        exit;
    }

    // GET（其余方法一律归一为 GET 壳）：只输出 HTML 壳，不接受任何 GET 参数
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: no-referrer');
    ?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>正在进入员工工作台…</title>
<style>
  html, body { margin: 0; padding: 0; background: #fff; color: #1f2328; }
  body {
    font: 16px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
          "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    display: flex; min-height: 100vh; align-items: center; justify-content: center;
    padding: 24px; box-sizing: border-box;
  }
  .box { width: 100%; max-width: 340px; text-align: center; }
  .spinner {
    width: 28px; height: 28px; margin: 0 auto 18px; box-sizing: border-box;
    border: 3px solid #e5e7eb; border-top-color: #2563eb; border-radius: 50%;
    animation: spin .9s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .title { font-size: 17px; font-weight: 600; margin: 0 0 8px; }
  .desc { font-size: 14px; color: #6b7280; margin: 0 0 10px; word-break: break-word; }
  .code { font-size: 12px; color: #9ca3af; margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .hidden { display: none; }
</style>
</head>
<body>
<div class="box">
  <div id="loading">
    <div class="spinner"></div>
    <p class="title">正在进入员工工作台…</p>
    <p class="desc">请稍候，正在为你准备员工账号</p>
  </div>
  <div id="error" class="hidden">
    <p class="title">进入失败</p>
    <p class="desc" id="error-text">请关闭本页面，在 Telegram 中重新打开</p>
    <p class="desc" id="error-detail"></p>
    <p class="code" id="error-code"></p>
  </div>
</div>

<script src="https://telegram.org/js/telegram-web-app.js"></script>
<script>
(function () {
  var loadingEl = document.getElementById('loading');
  var errorEl = document.getElementById('error');
  var errorTextEl = document.getElementById('error-text');
  var errorDetailEl = document.getElementById('error-detail');
  var errorCodeEl = document.getElementById('error-code');

  // 刻意不提供"重试"按钮：同一份 initData 每提交一次都会先扣一次重放额度
  // （与 webroot/tg/entry.php 同因）。重开 TMA 会拿到新的 initData，不受配额影响。
  function fail(guide, detail, code) {
    loadingEl.className = 'hidden';
    errorEl.className = '';
    errorTextEl.textContent = guide || '请关闭本页面，在 Telegram 中重新打开';
    errorDetailEl.textContent = detail || '';
    errorDetailEl.className = detail ? 'desc' : 'desc hidden';
    errorCodeEl.textContent = code ? ('错误码：' + code) : '';
    errorCodeEl.className = code ? 'code' : 'code hidden';
  }

  var tg = window.Telegram && window.Telegram.WebApp;
  if (tg) {
    try { tg.ready(); } catch (e) {}
    try { tg.expand(); } catch (e) {}
  }

  function submit() {
    var initData = (tg && tg.initData) || '';
    if (!initData) {
      // 非 Telegram 环境（或 WebView 未注入）：initData 恒为空，直接给出可读提示
      fail('请在 Telegram 内打开本页面', '', '');
      return;
    }

    loadingEl.className = '';
    errorEl.className = 'hidden';

    // POST 回本页（同文件 JSON 接口）；initData 只在内存里流转，不进 URL、不进 localStorage
    fetch(location.pathname, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: initData })
    }).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (data) {
        // 接口契约（对象形）：{success:true,data:{redirect}} / {success:false,error:{code,message}}
        if (res.ok && data && data.success === true) {
          var go = (data.data && data.data.redirect) || '/member?action=workPlatform';
          // Set-Cookie 已由 POST 响应种下，直接进员工工作台
          location.replace(go);
          return;
        }
        var err = (data && data.error) || {};
        var code = err.code || ('HTTP_' + res.status);
        var guide;
        if (code === 'STAFF_NOT_BOUND') {
          guide = '你还没有加入任何店铺，请在 Telegram 里让商家发邀请链接给你';
        } else if (code === 'MEMBER_DISABLED') {
          guide = '你的账号已被禁用，请联系商家或客服';
        } else if (code === 'INIT_DATA_EXPIRED' || code === 'INIT_DATA_INVALID') {
          guide = '登录已过期，请关闭本页面后在 Telegram 中重新打开';
        } else if (code === 'REPLAY_LIMITED') {
          guide = '操作过于频繁，请关闭本页面后在 Telegram 中重新打开';
        } else {
          guide = '服务暂时不可用，请稍后再试';
        }
        fail(guide, err.message || '', code);
      });
    }).catch(function () {
      fail('网络异常，请关闭本页面后重新打开', '', 'NETWORK_ERROR');
    });
  }

  submit();
})();
</script>
</body>
</html>
    <?php
    exit;
}

if (!defined('FBS_STAFF_TEST')) {
    fbs_staff_landing_http_entry();
}
