'use strict';
// TAPD 1162017416001000002 登录桥：TG 内打开 → 落地页取 initData 表单 POST →
// 复用 loginService（验签/限频/防重放/会员查建/审计，均不在此重写）→
// credentialProvider 向网关 issue_session 换取火鸟进程内签发的会话凭证 →
// Set-Cookie + 302 跳站内目标页。
// 硬约束：Node 不自签任何凭证（不调 tokens.issue）；凭证值不进日志/错误信息/HTML；
// 浏览器不接触 Node 自签 token——loginService 返回的 token 在此丢弃，桥只取 memberId。
const crypto = require('node:crypto');

// 目标页净化：只放行站内相对路径，杜绝开放重定向（调查报告 R2）。
// 任务书规则：以单个 / 开头、不得以 // 或 /\ 开头、不得含 \、不得含协议或 @、长度 ≤ 200；
// 不合法一律回落默认页而不是报错，避免把攻击探测变成用户可见的 4xx。
// 控制字符单独拦：Location 里出现 CRLF 会造成响应拆分/头注入。
function sanitizeTarget(raw, fallback) {
  if (typeof raw !== 'string' || !raw || raw.length > 200) return fallback;
  if (raw[0] !== '/') return fallback;
  // scheme-relative（//evil.com）与反斜杠变体（/\evil.com）在浏览器里等价于跳外域
  if (raw[1] === '/' || raw[1] === '\\') return fallback;
  if (raw.includes('\\')) return fallback;
  if (raw.includes('@')) return fallback; // userinfo@host 形式可把域名伪装成合法路径
  if (raw.includes('://')) return fallback;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(raw)) return fallback;
  return raw;
}

// 落地页/错误页均为服务端拼接的静态模板，外部输入只有 to（必须先过 sanitizeTarget），
// 统一做 HTML 转义防反射 XSS。
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderLandingPage({ nonce, postPath, to }) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>正在登录…</title>
<!-- 依赖说明：POST 提交必须携带浏览器代填的 Origin / Sec-Fetch-Site 头（现代浏览器对
     导航式 POST 均发送），服务端以此做登录 CSRF 来源闸门；无这些头的极老 WebView 会被 403 -->
<script src="https://telegram.org/js/telegram-web-app.js"></script>
</head>
<body>
<p id="msg">正在登录，请稍候…</p>
<form id="f" method="POST" action="${escapeHtml(postPath)}">
<input type="hidden" name="initData" id="initData" value="">
<input type="hidden" name="to" value="${escapeHtml(to)}">
</form>
<noscript><p>请在 Telegram 内打开本页面。</p></noscript>
<script nonce="${nonce}">
(function () {
  var tg = window.Telegram && window.Telegram.WebApp;
  var data = tg && tg.initData;
  if (data) {
    if (tg.ready) tg.ready();
    document.getElementById('initData').value = data;
    // 必须用真实表单提交而非 fetch：只有导航式 POST 才会跟随服务端的 302 + Set-Cookie
    document.getElementById('f').submit();
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
<title>登录失败</title>
</head>
<body>
<p>登录失败（${escapeHtml(code)}）</p>
<p>${escapeHtml(message)}</p>
</body>
</html>`;
}

/**
 * 创建登录桥的两个处理器（GET 落地页 + POST 桥端点），依赖全部注入以便单测。
 * @param {object} deps
 * @param {string} deps.botToken - 与 server.js 现有取法一致的 BOT_TOKEN（实际验签在 loginService 内）
 * @param {{ login: (initData: string) => Promise<{status: number, body: object}> } | null} deps.loginService
 *   既有登录编排：验签 + 限频 + 防重放 + 会员查建 + 审计。桥不重写这些逻辑。
 * @param {(memberId: number|string) => Promise<string>} deps.credentialProvider
 *   既有凭证提供方：内部走网关 issue_session（火鸟进程内签发），返回 'name=value' 整串。
 * @param {string} deps.cookieDomain - Set-Cookie 的 Domain 属性（TMA_BRIDGE_COOKIE_DOMAIN）
 * @param {number} [deps.maxAgeSeconds] - Cookie Max-Age，默认 86400（TMA_BRIDGE_COOKIE_MAX_AGE，需与火鸟 onlinetime 对齐）
 * @param {boolean} [deps.forceSecure] - 默认 true：无视 req.secure 一律加 Secure；
 *   仅显式 false（本地 http 调试）才按 req.secure 判定。无 HttpOnly 的 24h 凭证必须强制 Secure（评审 M-1/O-3）
 * @param {string} [deps.defaultTarget] - 目标页回落值，默认 '/'（TMA_BRIDGE_TARGET_DEFAULT）
 * @param {string} [deps.postPath] - 落地页表单提交地址
 */
function createBridgeRoute({
  botToken,
  loginService,
  credentialProvider,
  cookieDomain,
  maxAgeSeconds = 86400,
  forceSecure = true,
  defaultTarget = '/',
  postPath = '/tg-api/auth/bridge',
}) {
  // 任一必需配置缺失时不崩进程，端点统一 503。
  // 环境变量名（内部拓扑）不回给公网页面，只进启动日志——公网无认证入口不应免费暴露依赖清单（评审 O-5）
  const missing = [];
  if (!botToken) missing.push('TELEGRAM_BOT_TOKEN');
  if (!loginService) missing.push('FBS_GATEWAY_URL / FBS_GATEWAY_SECRET / DB_HOST（TMA 登录模块未装配）');
  if (!credentialProvider) missing.push('FBS_GATEWAY_URL / FBS_GATEWAY_SECRET（凭证模块未装配）');
  if (!cookieDomain) missing.push('TMA_BRIDGE_COOKIE_DOMAIN');
  // Domain 格式非法时浏览器会静默丢弃整条 Set-Cookie（表现为「点了没反应」），启动期就拦下
  if (cookieDomain && !/^\.?[A-Za-z0-9.-]+$/.test(cookieDomain)) missing.push('TMA_BRIDGE_COOKIE_DOMAIN（格式非法，只允许字母/数字/点/连字符，可选前导点）');
  const notConfigured = missing.length > 0;
  if (notConfigured) {
    console.warn('[auth/bridge] 登录桥未配置，端点将返回 503，缺失项：', missing.join('；'));
  }

  // Max-Age 只认正整数，配置写坏时宁可回到默认值也不要下发 Max-Age=NaN/0
  const maxAge = Number.isSafeInteger(maxAgeSeconds) && maxAgeSeconds > 0 ? maxAgeSeconds : 86400;
  const fallbackTarget = sanitizeTarget(defaultTarget, '/');

  // 登录 CSRF 闸门（评审 B-1）：跨站表单 POST 可把受害者登录成攻击者的会员。
  // 依赖浏览器代填、脚本不可伪造的来源头。三级判定（评审复核 n-3）：
  //   ① Origin 存在 → 必须属于本站集合；
  //   ② Origin 缺失且 Sec-Fetch-Site 存在 → cross-site 拒，其余放行；
  //   ③ 两者都缺失（iOS ≤16.3 的 TG WebView 对同源 form POST 可能不发 Origin，
  //      且 Sec-Fetch-Site 在 iOS 16.4 前不存在）→ Referer 兜底：host 属本站集合放行，否则 403。
  // Referer 兜底不是绕过：攻击者可用 referrerpolicy="no-referrer" 抹掉 Referer，但抹不掉
  // Origin——跨源 POST 在所有现代浏览器必带 Origin，会被 ①先拦；Referer 只在「①②都不适用」
  // 的老 WebView 场景生效，该场景浏览器侧没有伪造来源头的手段。
  // 本站集合由 cookieDomain（根域 + www）与请求 Host 推导；Host 只在本域/子域时收录（R1-1）。
  function allowedHosts(req) {
    const d = cookieDomain.toLowerCase().replace(/^\./, '');
    const hosts = new Set([d, `www.${d}`]);
    const host = (req.get && req.get('host') || '').toLowerCase();
    // 只收录本域及其子域，杜绝「任意 Host 自证」（评审 R1-1/n-1 的 1 行收紧）
    if (host && (host === d || host.endsWith(`.${d}`))) hosts.add(host);
    return hosts;
  }

  // 返回 null 表示放行，否则返回拒绝原因枚举（供结构化打点）
  function checkOrigin(req) {
    const origin = req.get && req.get('origin');
    const site = req.get && req.get('sec-fetch-site');
    const hosts = allowedHosts(req);
    if (origin) {
      let oHost = null;
      try { oHost = new URL(String(origin)).host.toLowerCase(); } catch (e) { return 'origin_unparseable'; } // 含 Origin: null
      return hosts.has(oHost) ? null : 'origin_mismatch';
    }
    if (site) return String(site).toLowerCase() === 'cross-site' ? 'sec_fetch_cross_site' : null;
    // 第三级 Referer 兜底（见上注释）
    const referer = (req.get && req.get('referer')) || '';
    const m = /^https?:\/\/([^/?#]+)/i.exec(referer);
    if (!m) return 'no_origin_headers';
    const refHost = m[1].toLowerCase();
    return hosts.has(refHost) ? null : 'referer_mismatch';
  }

  // 拒绝打点：只记 reason 枚举、host 与来源头存在性，不记 initData/凭证/完整 UA（评审 n-3）
  function logBlocked(req, reason) {
    const g = (h) => !!(req.get && req.get(h));
    console.warn(JSON.stringify({
      event: 'bridge_blocked',
      reason,
      host: (req.get && req.get('host')) || '',
      hasOrigin: g('origin'),
      hasSecFetchSite: g('sec-fetch-site'),
      hasReferer: g('referer'),
    }));
  }

  function sendError(res, status, code, message) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.status(status).type('html').send(renderErrorPage(code, message));
  }

  function getLanding(req, res) {
    if (notConfigured) return sendError(res, 503, 'BRIDGE_NOT_CONFIGURED', '服务暂未配置，请稍后重试');
    // /tg-api 前缀没有全局 CSP 中间件（CSP 只挂在 /tma），落地页必须自带：
    // 脚本仅限自身与 telegram.org（telegram-web-app.js），内联脚本用一次性 nonce 放行，
    // form-action 收紧到自身（form-action 不从 default-src 继承），
    // frame-ancestors 放行 Telegram 域，否则 TG 内嵌直接白屏。
    const nonce = crypto.randomBytes(16).toString('base64');
    res.setHeader('Content-Security-Policy',
      `default-src 'none'; script-src 'self' https://telegram.org 'nonce-${nonce}'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors https://web.telegram.org https://*.telegram.org; base-uri 'none'`);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const to = sanitizeTarget((req.query && req.query.to) || '', fallbackTarget);
    res.type('html').send(renderLandingPage({ nonce, postPath, to }));
  }

  async function postBridge(req, res) {
    if (notConfigured) return sendError(res, 503, 'BRIDGE_NOT_CONFIGURED', '服务暂未配置，请稍后重试');
    // 来源闸门先于一切鉴权/业务逻辑：跨站请求不值得消耗 HMAC 与网关往返
    const blockReason = checkOrigin(req);
    if (blockReason) {
      logBlocked(req, blockReason);
      return sendError(res, 403, 'CROSS_SITE_BLOCKED', '请从 Telegram 内重新打开本页面');
    }
    const initData = req.body && req.body.initData;
    // to 优先取表单字段，兼容落地页把目标页放在 query 的场景
    const rawTo = (req.body && req.body.to) || (req.query && req.query.to) || '';
    const target = sanitizeTarget(rawTo, fallbackTarget);
    try {
      const r = await loginService.login(initData);
      // loginService 的 401/429 等按原状态码与错误体转成错误页：不 302、不下发 Cookie
      if (!r || r.status !== 200 || !r.body || !r.body.success
        || !r.body.data || !r.body.data.memberId) {
        const err = (r && r.body && r.body.error) || {};
        return sendError(res, (r && r.status) || 502, err.code || 'LOGIN_FAILED',
          err.message || '登录失败，请从 Telegram 重新进入');
      }
      const cookie = await credentialProvider(r.body.data.memberId);
      // credentialProvider 已用正则约束 name/value；这里兜一道防头注入，
      // 上游实现若变化把分号/换行带进来，宁可 502 也不能把脏值写进 Set-Cookie
      if (typeof cookie !== 'string' || !/^[A-Za-z0-9_]+=[A-Za-z0-9+/=]+$/.test(cookie)) {
        throw new Error('issue_session failed');
      }
      // 不设 HttpOnly：火鸟原生 login_user 即非 HttpOnly，H5 多处 JS 要读它（与现状一致）
      // Secure：默认强制（forceSecure）；仅显式关闭（本地 http 调试）才按 req.secure 判定——
      // req.secure 在配置 TRUST_PROXY_HOPS 后取 X-Forwarded-Proto，代理链路配置错误时不能静默裸奔
      const secure = forceSecure || req.secure === true;
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Set-Cookie', `${cookie}; Path=/; Domain=${cookieDomain}; Max-Age=${maxAge}; SameSite=Lax${secure ? '; Secure' : ''}`);
      return res.redirect(302, target);
    } catch (err) {
      // 防御兜底：header 已设置后（如 redirect 阶段）抛错时，不能留下「502 + 合法凭证」的组合
      res.removeHeader && res.removeHeader('Set-Cookie');
      // 只记消息：err 对象与 req.body 可能携带 initData/凭证，不能整体进日志
      console.error('[auth/bridge] failed:', String((err && err.message) || err).slice(0, 300));
      return sendError(res, 502, 'BRIDGE_FAILED', '登录暂时不可用，请稍后重试');
    }
  }

  return { getLanding, postBridge };
}

module.exports = { createBridgeRoute, sanitizeTarget };
