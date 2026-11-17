/*!
 * 骑手工作台 Web 端定位上报（AD-14 最小补丁，2026-11-06）
 *
 * 背景
 *   原生 App 通过 WebViewJavascriptBridge 的 getGeocoder 提供坐标，并由 App 推
 *   updateCourierLocation 持续刷新；而 Telegram / 手机浏览器打开的 Web 工作台没有这个
 *   bridge，前端 ps_lnglat 永远是空串，接口只好回退读 waimai_courier 表里上一次写入的
 *   静态坐标 —— 取货 / 送达的距离校验实际是在拿一个死人坐标做判断（线上表现为
 *   「骑手坐标异常！」或「距离店铺 7660 公里」）。
 *
 * 本文件做两件事（不改变任何既有逻辑，只在 Web 环境下补位）
 *   1) 暴露 window.__webGeo = {lng, lat, rotation, ts, source}，供 index.js / detail.js
 *      的 ps_lnglat 读取（lng = 经度，lat = 纬度，与 google.maps.LatLng(lat, lng)、
 *      getDistance 口径一致）。
 *   2) 节流上报到 updateCourierLocation，让 waimai_courier 与配送轨迹保持新鲜。
 *
 * ⚠️ 传参方向（务必先读这段再改代码）
 *   PHP 侧 updateCourierLocation 写库是字段互换的：
 *       UPDATE waimai_courier SET `lng` = param.lat, `lat` = param.lng
 *   而读侧（getDistance / 取货距离校验 / 地图打点）把 DB.lng 当经度、DB.lat 当纬度。
 *   所以浏览器拿到 longitude / latitude 之后，必须交叉传：
 *       lng=<latitude>   lat=<longitude>
 *   本文 2026-11-06 已在 canary 线上实测：传 lng=14.5365&lat=120.9835 →
 *   DB 落地 lng=120.9835 lat=14.5365。请勿"顺手修正"成直觉顺序，否则坐标东西对调。
 *
 * 定位来源（按可用性依次尝试，天然互斥）
 *   ① 浏览器 HTML5 Geolocation（Android Telegram / 各浏览器均可用）
 *   ② Telegram WebApp LocationManager（Bot API 8.0+；iOS 的 WKWebView 不支持网页
 *      geolocation，只有 Mini App 能力可拿到位置）—— 在 ① 6 秒内没结果时启用
 *
 * 应急关闭
 *   URL 加 ?webgeo=0，或 localStorage.setItem('fbs_webgeo', '0')
 * 现场诊断
 *   URL 加 ?webgeo=debug，页面顶部显示定位状态条
 */
(function (W, D) {
  'use strict';

  if (W.__webgeoBooted) { return; }
  W.__webgeoBooted = true;

  var qs = W.location.search || '';
  if (/[?&]webgeo=0(?:&|$)/.test(qs)) { return; }
  try {
    if (W.localStorage && W.localStorage.getItem('fbs_webgeo') === '0') { return; }
  } catch (e) { /* 隐私模式下 localStorage 可能抛错，忽略 */ }
  var DEBUG = /[?&]webgeo=debug(?:&|$)/.test(qs);

  // 原生 App（火鸟壳）自带 bridge 与系统定位，本补丁直接退出，避免与 App 上报打架
  if (/huoniao/i.test(navigator.userAgent) || W.WebViewJavascriptBridge) { return; }

  var REPORT_URL = '/include/ajax.php?service=waimai&action=updateCourierLocation';
  var MIN_MOVE_M = 30;      // 位移超过 30 米才上报，避免刷接口
  var MIN_GAP_MS = 60000;   // 或距上次上报超过 60 秒兜底上报一次
  var TG_DELAY_MS = 6000;   // HTML5 这么久还拿不到坐标，改用 Telegram LocationManager

  var lastReport = null;
  var lastReportAt = 0;
  var status = 'booting';
  var reason = '';

  // ---------- 工具 ----------

  function cookie(name) {
    var m = D.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.*+?^${}()|[\]\\])/g, '\\$1') + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
  }

  // 球面距离（米），只用来自治节流精度，不需要很准
  function meter(a, b) {
    var R = 6371000, rad = Math.PI / 180;
    var dLat = (b.lat - a.lat) * rad;
    var dLng = (b.lng - a.lng) * rad;
    var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
  }

  function post(url, body) {
    try {
      if (W.fetch) {
        // keepalive：骑手点完就走、页面卸载时也能把最后一跳发出去
        W.fetch(url, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
          body: body,
          keepalive: true
        })['catch'](function () {});
        return;
      }
    } catch (e) { /* 落到 XHR */ }
    try {
      var x = new XMLHttpRequest();
      x.open('POST', url, true);
      x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      x.send(body);
    } catch (e2) { /* 定位失败不该影响业务，静默 */ }
  }

  // ---------- 主流程 ----------

  function report(pos) {
    var uid = cookie('HN_courier');
    if (!uid) {
      // 没登录骑手（例如刚进页面、cookie 还没种）：只暴露坐标，不上报
      status = 'no-cookie';
      return;
    }
    if (lastReport && (Date.now() - lastReportAt) < MIN_GAP_MS && meter(lastReport, pos) < MIN_MOVE_M) {
      return;
    }
    lastReport = pos;
    lastReportAt = Date.now();
    post(REPORT_URL,
      'uid=' + encodeURIComponent(uid) +
      '&lng=' + encodeURIComponent(pos.lat) +   // 交叉传参，见文件头说明
      '&lat=' + encodeURIComponent(pos.lng) +
      '&rotation=' + encodeURIComponent(pos.rotation || 0));
    status = 'reporting';
  }

  function publish(lng, lat, heading, source) {
    if (typeof lng !== 'number' || typeof lat !== 'number') { return; }
    if (!isFinite(lng) || !isFinite(lat)) { return; }
    if (lng === 0 && lat === 0) { return; }          // 典型的"没有定位"占位值
    W.__webGeo = { lng: lng, lat: lat, rotation: heading || 0, ts: Date.now(), source: source };
    W.__webGeoError = '';
    status = 'ok:' + source;
    report(W.__webGeo);
  }

  function note(msg) {
    reason = msg;
    W.__webGeoError = msg;
    status = 'fail';
  }

  var html5Started = false;
  function startHtml5() {
    if (html5Started) { return; }
    html5Started = true;
    if (!navigator.geolocation) { note('no-geolocation-api'); return; }
    try {
      navigator.geolocation.watchPosition(function (p) {
        publish(p.coords.longitude, p.coords.latitude, p.coords.heading, 'html5');
      }, function (err) {
        note('html5:' + ((err && err.code) || '?') + ':' + ((err && err.message) || ''));
      }, { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 });
    } catch (e) {
      note('html5-throw:' + e.message);
    }
  }

  function startTelegram() {
    var tg = W.Telegram && W.Telegram.WebApp;
    var lm = tg && tg.LocationManager;
    if (!lm || typeof lm.init !== 'function' || typeof lm.getLocation !== 'function') {
      if (!reason) { note('no-geolocation'); }
      return false;
    }
    try {
      lm.init(function () {
        var tick = function () {
          try {
            lm.getLocation(function (d) {
              if (d && d.latitude != null && d.longitude != null) {
                publish(d.longitude, d.latitude, d.heading, 'telegram');
              }
            });
          } catch (e) { /* 用户中途拒绝授权，下一次 tick 再试 */ }
        };
        tick();
        setInterval(tick, 30000);   // Telegram 不给持续订阅，定时拉
      });
    } catch (e) {
      note('telegram-throw:' + e.message);
      return false;
    }
    return true;
  }

  // ---------- 诊断条（仅 ?webgeo=debug） ----------

  function ensureBar() {
    if (!D.body) { return null; }   // 脚本在 head 里执行时 body 还没解析出来
    var bar = D.getElementById('__webgeo_bar');
    if (bar) { return bar; }
    bar = D.createElement('div');
    bar.id = '__webgeo_bar';
    bar.style.cssText = 'position:fixed;left:0;right:0;top:0;z-index:2147483647;padding:6px 10px;' +
      'font:12px/1.5 -apple-system,sans-serif;background:#1F2328;color:#fff;opacity:.92;' +
      'word-break:break-all;pointer-events:none;';
    D.body.appendChild(bar);
    return bar;
  }

  function paintBar() {
    if (!DEBUG) { return; }
    var g = W.__webGeo;
    var bar = ensureBar();
    if (!bar) { return; }
    bar.textContent = '定位 [' + status + ']' +
      (g ? ' lng=' + g.lng.toFixed(6) + ' lat=' + g.lat.toFixed(6) + ' src=' + g.source : '') +
      (reason ? ' | ' + reason : '');
  }

  // ---------- 启动 ----------

  startHtml5();
  setTimeout(function () {
    // HTML5 完全没结果才请 Telegram 出手；已经拿到坐标就不重复启动
    if (!W.__webGeo) { startTelegram(); }
  }, TG_DELAY_MS);

  if (DEBUG) {
    if (D.readyState === 'loading') {
      D.addEventListener('DOMContentLoaded', paintBar, false);
    }
    setInterval(paintBar, 2000);
  }
}(window, document));
