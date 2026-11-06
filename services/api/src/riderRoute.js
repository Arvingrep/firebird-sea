'use strict';
// T6 骑手绑定与登录（方案 A，零前端改动）：
//   GET  /tg-api/rider/bind    落地页（TG 内打开，输手机号，取 initData 自动提交）
//   POST /tg-api/rider/bind    initData 验签 → 手机号归一 → 网关 rider_bind（PHP 查唯一骑手、
//                              冲突 409、双维度限频、写审计）→ 网关 rider_ql（签 10 分钟工作台
//                              直达 URL）→ 302
//   POST /tg-api/rider/session 已绑定骑手换工作台 URL（供 bot/n8n 侧对接；只收 body.initData，
//                              不接受 query 传参——initData 是短期凭证，不应进 URL/访问日志）
// 复用件：initData 验签走 telegramAuth（与登录桥同一份）；火鸟会话凭证由 PHP 侧 ql.html
// 流程种下，Node 不接触任何骑手凭证。硬约束：initData/手机号不进日志；
// Location 只接受 PHP 网关签出且在允许域名内的 https 直达 URL，其他一律 502。
const crypto = require('node:crypto');

// 落地页/错误页均为服务端拼接的静态模板，外部输入只有表单自身，统一 HTML 转义防反射 XSS。
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// 手机号归一（与 PHP 网关 fbs_normalize_phone 行为必须一致，改动需两侧同步）：
//   1. 去空格 / 横线 / 括号 / 点号
//   2. 前导 +63 转 0；纯数字 63 + 10 位同样转 0
//   3. 结果必须是「0 开头 + 共 10-11 位数字」（菲律宾手机号 09XXXXXXXXX 等），否则 null
// 为什么必须归一：库里的 phone 是历史存量（0 开头 / +63 / 63 各种形态混存），不归一会
// 让「输 0912345678 绑不上、输 +63912345678 才绑上」这类玄学问题出现在验收现场。
function normalizePhone(raw) {
  let s = String(raw == null ? '' : raw).trim().replace(/[\s\-().]/g, '');
  if (s.startsWith('+63')) s = `0${s.slice(3)}`;
  else if (/^63\d{10}$/.test(s)) s = `0${s.slice(2)}`;
  if (!/^0\d{9,10}$/.test(s)) return null;
  return s;
}

function renderLandingPage({ nonce, postPath }) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>骑手绑定</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<style>
body { font-family: -apple-system, sans-serif; padding: 24px; }
input { width: 100%; box-sizing: border-box; padding: 10px; font-size: 16px; margin: 12px 0; }
button { width: 100%; padding: 12px; font-size: 16px; }
.hint { color: #666; font-size: 13px; }
</style>
</head>
<body>
<p id="msg">绑定后即可一键进入骑手工作台。</p>
<form id="f" method="POST" action="${escapeHtml(postPath)}">
<input type="hidden" name="initData" id="initData" value="">
<input name="phone" id="phone" inputmode="tel" pattern="[0-9+\\-() ]{7,20}" required placeholder="骑手手机号，如 09171234567">
<p class="hint">支持 09171234567、+639171234567、63-917-123-4567 等写法，空格横线括号会自动忽略。</p>
<button type="submit">绑定并进入工作台</button>
</form>
<noscript><p>请在 Telegram 内打开本页面。</p></noscript>
<script nonce="${nonce}">
(function () {
  var tg = window.Telegram && window.Telegram.WebApp;
  var data = tg && tg.initData;
  if (data) {
    if (tg.ready) tg.ready();
    document.getElementById('initData').value = data;
  } else {
    document.getElementById('msg').textContent = '请从 Telegram 内打开本页面';
    var f = document.getElementById('f');
    if (f && f.parentNode) f.parentNode.removeChild(f);
  }
})();
</script>
</body>
</html>`;
}

function renderErrorPage(code, message) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>操作失败</title>
</head>
<body>
<p>操作失败（${escapeHtml(code)}）</p>
<p>${escapeHtml(message)}</p>
</body>
</html>`;
}

function firstInt(out) {
  const n = parseInt(String(out || '').split('\n')[0].trim(), 10);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

// 409 冲突码 → 用户可执行的提示（不写「联系管理员」这类甩锅文案：能自己解绑的引导自解绑）
const CONFLICT_MESSAGES = {
  COURIER_ALREADY_BOUND: '该骑手账号已被其他 Telegram 绑定。如这是你的账号，请先在原 Telegram 内打开工作台解绑后再试。',
  TG_ALREADY_BOUND: '当前 Telegram 已绑定其他骑手账号。请先在该工作台内解绑，再绑定新的手机号。',
};

/**
 * 创建骑手绑定路由的处理器，依赖全部注入以便单测（同 bridgeRoute 风格）。
 * @param {object} deps
 * @param {string} deps.botToken - initData 验签用（与 server.js 现有取法一致）
 * @param {(initData: string, botToken: string) => {valid: boolean, user?: {id: number}, error?: string}} deps.validateInitData
 * @param {{ riderBind: (p: object) => Promise<object>, riderQl: (p: object) => Promise<object> } | null} deps.gateway
 *   HMAC 调 PHP 网关（webroot/api/fbs/index.php）的 rider_bind / rider_ql 动作
 * @param {{ query: (sql: string) => Promise<string> }} deps.conn - fbs_courier_map 只读（session 用）
 * @param {(key: string) => boolean} [deps.allow] - 固定窗口限频（默认不限）
 * @param {string[]} [deps.allowedHosts] - 302 目标域名白名单（来自 CORS_ORIGINS；空 = 不限制，仅 https）
 * @param {string} [deps.postPath] - 落地页表单提交地址
 */
function createRiderRoute({ botToken, validateInitData, gateway, conn, allow, allowedHosts = [], postPath = '/tg-api/rider/bind' }) {
  const missing = [];
  if (!botToken) missing.push('TELEGRAM_BOT_TOKEN');
  if (!validateInitData) missing.push('initData 验签模块未装配');
  if (!gateway) missing.push('FBS_GATEWAY_URL / FBS_GATEWAY_SECRET');
  if (!conn) missing.push('DB_HOST');
  const notConfigured = missing.length > 0;
  if (notConfigured) {
    console.warn('[rider] 骑手绑定未配置，端点将返回 503，缺失项：', missing.join('；'));
  }

  const hostWhitelist = new Set(allowedHosts.map((h) => String(h).toLowerCase()));

  // N7：白名单为空 = 只校验 https 不校验域名（fail-open），dev 敞开是刻意的；
  // 但 prod 下属于配置风险，warn 一行提醒补 CORS_ORIGINS。
  if (hostWhitelist.size === 0 && (process.env.TMA_ENV === 'prod' || process.env.NODE_ENV === 'production')) {
    console.warn('[rider] allowedHosts 为空且运行在 production：302 目标仅校验 https，不校验域名（fail-open）');
  }

  // 302 目标校验（m7）：只接受 https，且 host 在 CORS_ORIGINS 推导出的白名单内（白名单为空时不限制 host）
  function isAllowedTarget(url) {
    let u;
    try { u = new URL(url); } catch (e) { return false; }
    if (u.protocol !== 'https:') return false;
    if (hostWhitelist.size === 0) return true;
    return hostWhitelist.has(u.host.toLowerCase()) || hostWhitelist.has(u.hostname.toLowerCase());
  }

  function sendError(res, status, code, message) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.status(status).type('html').send(renderErrorPage(code, message));
  }

  function getLanding(req, res) {
    if (notConfigured) return sendError(res, 503, 'RIDER_NOT_CONFIGURED', '服务暂未配置，请稍后重试');
    // /tg-api 前缀没有全局 CSP 中间件，落地页自带（同 bridgeRoute）：
    // 脚本仅限自身与 telegram.org，内联脚本用一次性 nonce，form-action 收紧到自身，
    // frame-ancestors 放行 Telegram 域，否则 TG 内嵌直接白屏。
    const nonce = crypto.randomBytes(16).toString('base64');
    res.setHeader('Content-Security-Policy',
      `default-src 'none'; script-src 'self' https://telegram.org 'nonce-${nonce}'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors https://web.telegram.org https://*.telegram.org; base-uri 'none'`);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.type('html').send(renderLandingPage({ nonce, postPath }));
  }

  // canary 网关新契约（N1）：成功 200 返回 {success:true, data:{...}}；业务失败（409/429/404/503）
  // 由 PHP 返回非 2xx，gatewayClient 统一 reject（GATEWAY_HTTP_ERROR + err.status +
  // err.payload.error.code）。rider_bind 的差异化结果码在这里还原成 B1 的用户提示，
  // 其余（超时/网络/5xx）一律 502 兜底。
  function sendBindError(res, err) {
    if (err && err.code === 'GATEWAY_HTTP_ERROR') {
      const gerr = err.payload && err.payload.error;
      if (err.status === 409) {
        const code = (gerr && gerr.code) || 'BIND_CONFLICT';
        return sendError(res, 409, code, CONFLICT_MESSAGES[code] || '该手机号或当前账号已存在绑定关系，请先解绑后再试。');
      }
      if (err.status === 429) {
        return sendError(res, 429, 'BIND_RATE_LIMITED', '操作过于频繁，请稍后再试');
      }
      if (err.status === 404) {
        return sendError(res, 404, 'COURIER_NOT_FOUND', '未找到该手机号对应的骑手账号。请确认号码与站点登记的骑手手机号一致后重试。');
      }
      if (err.status === 503) {
        // 网关审计/限频底账不可用 fail-closed（AUDIT_UNAVAILABLE），原样透传保持信号不稀释
        return sendError(res, 503, (gerr && gerr.code) || 'AUDIT_UNAVAILABLE', '服务暂时不可用，请稍后重试');
      }
    }
    // 只记消息：err 与 req.body 可能携带 initData/手机号，不能整体进日志
    console.error('[rider/bind] failed:', String((err && err.message) || err).slice(0, 300));
    return sendError(res, 502, 'RIDER_FAILED', '服务暂时不可用，请稍后重试');
  }

  async function postBind(req, res) {
    if (notConfigured) return sendError(res, 503, 'RIDER_NOT_CONFIGURED', '服务暂未配置，请稍后重试');
    if (allow && !allow(req.ip)) return sendError(res, 429, 'RATE_LIMITED', '操作过于频繁，请稍后再试');
    const initData = req.body && req.body.initData;
    const v = validateInitData(initData, botToken);
    if (!v || !v.valid) return sendError(res, 401, 'INVALID_INIT_DATA', '请从 Telegram 内重新打开本页面');
    const phone = normalizePhone(req.body && req.body.phone);
    if (!phone) return sendError(res, 400, 'INVALID_PHONE', '手机号格式不正确。支持 09171234567 或 +639171234567 等写法。');
    try {
      // 1) 绑定：PHP 按归一后手机号查唯一骑手 → 冲突检查（绝不静默顶替）→ 三维度限频 → 写审计
      let bind;
      try {
        bind = await gateway.riderBind({ tg_user_id: String(v.user.id), phone, ip: req.ip || '' });
      } catch (err) {
        return sendBindError(res, err);
      }
      // 2xx 但 success:false 同样视为失败，绝不静默成功
      const courierId = bind && bind.success === true && Number(bind.data && bind.data.courier_id);
      if (!Number.isSafeInteger(courierId) || courierId <= 0) {
        throw new Error('rider_bind failed');
      }
      // 2) 换工作台直达 URL：PHP 签 10 分钟一次性令牌（ql.html 落地种骑手 cookie）。
      //    ql 失败不再还原状态码（绑定已成立，用户态按网关故障 502 处理）
      const ql = await gateway.riderQl({ courier_id: courierId });
      const url = ql && ql.success === true && ql.data && ql.data.url;
      if (typeof url !== 'string' || !isAllowedTarget(url)) {
        throw new Error('rider_ql returned invalid url');
      }
      res.setHeader('Cache-Control', 'no-store');
      return res.redirect(302, url);
    } catch (err) {
      // 只记消息：err 与 req.body 可能携带 initData/手机号，不能整体进日志
      console.error('[rider/bind] failed:', String((err && err.message) || err).slice(0, 300));
      return sendError(res, 502, 'RIDER_FAILED', '服务暂时不可用，请稍后重试');
    }
  }

  // 已绑定骑手换工作台 URL。只收 body.initData（POST）：initData 是短期凭证，不接受 query
  // 传参，避免出现在访问日志/Referer/浏览器历史里（m5）。
  async function session(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    if (notConfigured) return res.status(503).json({ success: false, error: { code: 'RIDER_NOT_CONFIGURED', message: 'rider session not configured' } });
    const initData = (req.body && req.body.initData) || '';
    const v = validateInitData(initData, botToken);
    if (!v || !v.valid) return res.status(401).json({ success: false, error: { code: 'INVALID_INIT_DATA', message: 'Invalid or missing initData' } });
    try {
      // 数字身份只从验签结果取（user.id 已由 telegramAuth 保证为正整数），SQL 里只可能出现数字
      const tgId = String(Number(v.user.id));
      if (!/^\d+$/.test(tgId)) throw new Error('invalid tg id');
      const courierId = firstInt(await conn.query(`SELECT courier_id FROM fbs_courier_map WHERE tg_user_id = ${tgId} LIMIT 1`));
      if (!courierId) return res.json({ success: true, data: { bound: false } });
      const ql = await gateway.riderQl({ courier_id: courierId });
      const url = ql && ql.success === true && ql.data && ql.data.url;
      if (typeof url !== 'string' || !isAllowedTarget(url)) throw new Error('rider_ql returned invalid url');
      return res.json({ success: true, data: { bound: true, courier_id: courierId, url } });
    } catch (err) {
      console.error('[rider/session] failed:', String((err && err.message) || err).slice(0, 300));
      return res.status(502).json({ success: false, error: { code: 'RIDER_FAILED', message: 'Service temporarily unavailable' } });
    }
  }

  return { getLanding, postBind, session };
}

module.exports = { createRiderRoute, normalizePhone };
