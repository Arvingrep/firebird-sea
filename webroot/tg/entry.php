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
  .desc { font-size: 14px; color: #6b7280; margin: 0; word-break: break-word; }
  .btn {
    display: inline-block; margin-top: 20px; padding: 10px 28px; border: 0; border-radius: 999px;
    background: #2563eb; color: #fff; font-size: 15px; cursor: pointer;
  }
  .btn:active { opacity: .8; }
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
    <p class="desc" id="error-text">请稍后重试</p>
    <button type="button" class="btn" id="retry">重试</button>
  </div>
</div>

<script src="https://telegram.org/js/telegram-web-app.js"></script>
<script>
(function () {
  var ROLE = <?php echo json_encode($role, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT); ?>;
  var loadingEl = document.getElementById('loading');
  var errorEl = document.getElementById('error');
  var errorTextEl = document.getElementById('error-text');
  var retryEl = document.getElementById('retry');

  function fail(message) {
    loadingEl.className = 'hidden';
    errorEl.className = '';
    errorTextEl.textContent = message || '请稍后重试';
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
      fail('请在 Telegram 内打开本页面');
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
          location.replace((data.data && data.data.redirect) || '/');
          return;
        }
        var msg = data && data.error && data.error.message;
        if (!msg) {
          if (res.status === 401) msg = '登录信息已过期，请重新打开';
          else if (res.status === 500 || res.status === 502) msg = '登录服务暂不可用，请稍后再试';
          else msg = '登录失败（' + res.status + '）';
        }
        fail(msg);
      });
    }).catch(function () {
      fail('网络异常，请检查网络后重试');
    });
  }

  retryEl.addEventListener('click', submit);
  submit();
})();
</script>
</body>
</html>
