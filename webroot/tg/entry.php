<?php
/**
 * Telegram 顾客免密登录落地页（方案甲：Node 中转）
 *
 * 路由：/tg/entry?role=customer（nginx 未加 try_files 前用 /tg/entry.php?role=customer）
 *
 * 刻意保持轻量：不 include 火鸟 common.inc.php。
 * 原因：common.inc.php 强依赖 swoole_loader 扩展且要求 PHP 恰好 7.4，而本页只需要
 * 一个 HTML 壳；把整站引导链拉进来只会让"登录页本身挂了"成为新的故障点。
 *
 * initData 只在内存里流转：不写日志、不进 URL、不进 localStorage。
 */

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');

$role = isset($_GET['role']) ? (string)$_GET['role'] : 'customer';
if ($role !== 'customer') $role = 'customer';
?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>正在登录…</title>
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
    <p class="title">正在登录…</p>
    <p class="desc">请稍候，正在为你准备账户</p>
  </div>
  <div id="error" class="hidden">
    <p class="title">登录失败</p>
    <p class="desc" id="error-text">请关闭本页面，在 Telegram 中重新打开</p>
    <p class="desc" id="error-detail"></p>
    <p class="code" id="error-code"></p>
  </div>
</div>

<script src="https://telegram.org/js/telegram-web-app.js"></script>
<script>
(function () {
  var ROLE = <?php echo json_encode($role, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT); ?>;
  var loadingEl = document.getElementById('loading');
  var errorEl = document.getElementById('error');
  var errorTextEl = document.getElementById('error-text');
  var errorDetailEl = document.getElementById('error-detail');
  var errorCodeEl = document.getElementById('error-code');

  // 刻意不提供"重试"按钮：同一份 initData 每提交一次都会先扣一次重放额度
  // （bridge.php:844 记账早于 :856 触碰数据库；429 时 :236-238 仍继续自增；阈值 5、TTL 7200s 非滑动），
  // 5 次之内用户会被锁 2 小时。重开 TMA 会拿到新的 initData，不受配额影响。
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

    fetch('/tg-api/auth/telegram-web', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: initData, role: ROLE })
    }).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (data) {
        // 接口契约（对象形）：{success:true,data:{redirect}} / {success:false,error:{code,message}}
        if (res.ok && data && data.success === true) {
          var go = (data.data && data.data.redirect) || '/';
          // 同时登录火鸟站点会话：入口页拿得到真实 initData，站内页面（如「我的」）之后再跳转时不一定还带着它。
          // 用 fetch 提交即可（Set-Cookie 照常生效）；后台没装「Telegram快捷登录」或失败都不影响进入首页。
          fetch('/api/login.php?action=back&type=telegram', {
            method: 'POST',
            credentials: 'include',
            redirect: 'manual',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'initData=' + encodeURIComponent(initData)
          }).catch(function () {}).then(function () { location.replace(go); });
          return;
        }
        var err = (data && data.error) || {};
        fail('请关闭本页面，在 Telegram 中重新打开', err.message || '', err.code || ('HTTP_' + res.status));
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
