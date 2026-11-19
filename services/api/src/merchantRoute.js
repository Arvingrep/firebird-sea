'use strict';
// 商家 Telegram 免密入口（方案 A，零前端改动——复用商家后台自己的 cookie）：
//   GET  /tg-api/merchant/bind    落地页（TG 内打开，输手机号，取 initData 自动提交）
//   POST /tg-api/merchant/bind    initData 验签 → 手机号归一 → 网关 merchant_bind（按 member.phone
//                                 查唯一商家会员、校验 waimai_shop_manager 归属、冲突 409、三维限频、
//                                 写审计）→ 网关 merchant_session（签火鸟会员 cookie）→
//                                 Set-Cookie + 302 /wmsj/
//   POST /tg-api/merchant/session 已绑定商家换会话（供 bot/n8n 侧对接；只收 body.initData，
//                                 不接受 query 传参——initData 是短期凭证，不应进 URL/访问日志）
//
// 与骑手链路的实质差异（实现前必须知道的三条）：
//   1. 商家登录态 = 会员 cookie（HN_login_user），与顾客同一枚；骑手是独立的 courier cookie。
//      cookie 值由 PHP 网关的 fbs_bridge_build_session_cookies 生成后**原样透传**，
//      Node 不拼任何属性（域名补 www. / SameSite=None / 有效期都只在 PHP 侧有一份权威实现）。
//   2. **绝不写 fbs_member_map**：那是收银台归属校验的唯一依据（payOrderRead.js），
//      商家分支往里写会把该 TG 的顾客下单归属永久改掉。商家映射走 fbs_merchant_map（PHP 写）。
//   3. 会员解析**只读**：商家身份必须解析到「已存在的会员」，任何「查不到就建号」的路径都会
//      得到一个没有店铺的空会员（= 登录成功但 /wmsj 弹「您没有外卖店铺权限」）。
//
// 复用件：initData 验签走 telegramAuth（与顾客桥同一份）；手机号归一直接复用 riderRoute 的
// normalizePhone（与 PHP fbs_normalize_phone 是逐字节契约，改动必须两侧同步、只能有一处实现）。
const crypto = require('node:crypto');
const { escapeHtml, renderPageHead, PAGE_SHELL } = require('./htmlPage');
const { normalizePhone } = require('./riderRoute');
// initData 有效期与顾客桥（tgLogin.js 的 LOGIN_MAX_AGE_SECONDS=3600）对齐：都取 telegramAuth
// 导出的 1 小时常量，不在本文件写字面量——商家与顾客是同一份 initData 的两个消费方，
// 一边 1h 一边 24h 会出现「落地页能绑、顾客桥判过期」的口径分裂（验证员 R2）。
const { MAX_AUTH_AGE_SECONDS } = require('./telegramAuth');

// 商家后台落地页：/wmsj/ 的 index.php 自己会再跳 order/waimaiOrder.php（多店在页面内切换）。
const MERCHANT_HOME = '/wmsj/';

// 302/Location 目标只接受站内绝对路径：单斜杠开头、不含协议、不含反斜杠与控制字符。
// 网关返回值也走这里——「来自内部」不等于「可信」，开放重定向在登录链路上是直接可利用的。
function safeRedirect(value) {
  if (typeof value !== 'string') return MERCHANT_HOME;
  const s = value.trim();
  if (s === '' || s.length > 200) return MERCHANT_HOME;
  if (s[0] !== '/' || s[1] === '/' || s[1] === '\\') return MERCHANT_HOME;
  if (/[\\\u0000-\u001f]/.test(s)) return MERCHANT_HOME;
  return s;
}

function renderLandingPage({ nonce, postPath }) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
${renderPageHead('商家登录')}
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<style>${PAGE_SHELL}
input { width: 100%; box-sizing: border-box; padding: 12px; font-size: 16px; margin: 12px 0; border: 1px solid #D0D7DE; border-radius: 8px; }
button { width: 100%; padding: 14px; font-size: 16px; border: 0; border-radius: 8px; background: #1F6FEB; color: #fff; font-weight: 600; }
button:active { background: #1A5FCC; }
.hint { color: #57606A; font-size: 13px; }
.guide { color: #1F2328; }
</style>
</head>
<body>
<p id="msg">绑定后即可在 Telegram 内一键进入商家后台。</p>
<form id="f" method="POST" action="${escapeHtml(postPath)}">
<input type="hidden" name="initData" id="initData" value="">
<input name="phone" id="phone" inputmode="tel" pattern="[0-9+\\-() ]{7,20}" required placeholder="商家手机号，如 09178889999">
<p class="hint">请填写入驻时登记的会员手机号。支持 09178889999、+639178889999、63-917-888-9999 等写法，空格横线括号会自动忽略。</p>
<button type="submit">绑定并进入商家后台</button>
</form>
<noscript><p class="guide">请在 Telegram 内打开本页面。</p></noscript>
<script nonce="${nonce}">
(function () {
  var tg = window.Telegram && window.Telegram.WebApp;
  // 无条件 ready/expand：不调用时部分客户端按 0 高度渲染，同样表现为空白。
  if (tg) {
    try { if (tg.ready) tg.ready(); } catch (e) {}
    try { if (tg.expand) tg.expand(); } catch (e) {}
    try { if (tg.setHeaderColor) tg.setHeaderColor('#FFFFFF'); } catch (e) {}
    try { if (tg.setBackgroundColor) tg.setBackgroundColor('#FFFFFF'); } catch (e) {}
  }
  var data = tg && tg.initData;
  if (data) {
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
${renderPageHead('登录失败')}
<style>${PAGE_SHELL}
h1 { font-size: 18px; margin: 0 0 12px; }
p { margin: 0 0 8px; }
code { color: #57606A; font-size: 13px; }
</style>
</head>
<body>
<h1>登录失败</h1>
<p>${escapeHtml(message)}</p>
<p><code>${escapeHtml(code)}</code></p>
</body>
</html>`;
}

// 冲突/失败码 → 用户可执行的动作。这里的文案是商家看到的唯一提示，必须能照着做：
//   能自己换的（重输手机号）就让他换；只有运营能解的就明确写出「找运营做什么」，
//   不要写「请联系管理员」这种没有落点的句子。
const BIND_MESSAGES = {
  MERCHANT_ALREADY_BOUND: '该商家账号已被其他 Telegram 绑定，原绑定保持不变。如需换绑，请联系运营在后台解除后再试。',
  TG_ALREADY_BOUND: '当前 Telegram 已绑定其他商家账号，原绑定保持不变。如需换绑，请联系运营在后台解除后再试。',
  MERCHANT_AMBIGUOUS: '该手机号匹配到多个商家账号，无法自动绑定。请联系运营核对会员手机号后再试。',
};

/**
 * 创建商家绑定/会话路由的处理器，依赖全部注入以便单测（同 riderRoute 风格）。
 * @param {object} deps
 * @param {string} deps.botToken - initData 验签用
 * @param {(initData: string, botToken: string) => {valid: boolean, user?: {id: number}, error?: string}} deps.validateInitData
 * @param {{ merchantBind: (p: object) => Promise<object>, merchantSession: (p: object) => Promise<object> } | null} deps.gateway
 *   HMAC 调 PHP 网关（webroot/api/fbs/index.php）的 merchant_bind / merchant_session 动作
 * @param {(key: string) => boolean} [deps.allow] - 固定窗口限频（默认不限）
 * @param {string} [deps.postPath] - 落地页表单提交地址
 */
function createMerchantRoute({ botToken, validateInitData, gateway, allow, postPath = '/tg-api/merchant/bind' }) {
  const missing = [];
  if (!botToken) missing.push('TELEGRAM_BOT_TOKEN');
  if (!validateInitData) missing.push('initData 验签模块未装配');
  if (!gateway) missing.push('FBS_GATEWAY_URL / FBS_GATEWAY_SECRET');
  const notConfigured = missing.length > 0;
  if (notConfigured) {
    console.warn('[merchant] 商家入口未配置，端点将返回 503，缺失项：', missing.join('；'));
  }

  function sendError(res, status, code, message) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.status(status).type('html').send(renderErrorPage(code, message));
  }

  function getLanding(req, res) {
    if (notConfigured) return sendError(res, 503, 'MERCHANT_NOT_CONFIGURED', '服务暂未配置，请稍后重试');
    // /tg-api 前缀没有全局 CSP 中间件，落地页自带（同 riderRoute）：脚本限自身与 telegram.org，
    // 内联脚本用一次性 nonce，form-action 收紧到自身，frame-ancestors 放行 Telegram 域。
    const nonce = crypto.randomBytes(16).toString('base64');
    res.setHeader('Content-Security-Policy',
      `default-src 'none'; script-src 'self' https://telegram.org 'nonce-${nonce}'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors https://web.telegram.org https://*.telegram.org; base-uri 'none'`);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.type('html').send(renderLandingPage({ nonce, postPath }));
  }

  // canary 网关契约：成功 200 {success:true,data}；业务失败非 2xx {success:false,error:{code}}，
  // gatewayClient 统一 reject（GATEWAY_HTTP_ERROR + err.status + err.payload）。merchant_bind 的
  // 差异化结果码在这里还原成可执行文案，其余（超时/网络/5xx）一律 502 兜底。
  function sendBindError(res, err) {
    if (err && err.code === 'GATEWAY_HTTP_ERROR') {
      const gerr = err.payload && err.payload.error;
      const code = (gerr && gerr.code) || '';
      if (err.status === 409) {
        return sendError(res, 409, code || 'BIND_CONFLICT',
          BIND_MESSAGES[code] || '该手机号或当前账号已存在绑定关系，如需换绑请联系运营。');
      }
      if (err.status === 429) {
        return sendError(res, 429, 'BIND_RATE_LIMITED', '操作过于频繁，请稍后再试');
      }
      if (err.status === 404 && code === 'MERCHANT_NO_SHOP') {
        return sendError(res, 404, code, '该商家账号还没有被分配外卖店铺。请联系运营在后台「外卖 → 店铺 → 管理会员」里分配后再试。');
      }
      if (err.status === 404) {
        return sendError(res, 404, code || 'MERCHANT_NOT_FOUND',
          '未找到该手机号对应的商家账号。请确认号码与站点登记的会员手机号一致后重试。');
      }
      if (err.status === 403) {
        // MEMBER_DISABLED / MEMBER_CANCELLED：账号状态问题，用户自己改不了
        return sendError(res, 403, code || 'MEMBER_DISABLED', '该商家账号当前不可用（已停用或已申请注销），请联系运营核实。');
      }
      if (err.status === 503) {
        // 审计/限频底账不可用 fail-closed（AUDIT_UNAVAILABLE），原样透传保持信号不稀释
        return sendError(res, 503, code || 'AUDIT_UNAVAILABLE', '服务暂时不可用，请稍后重试');
      }
    }
    // 只记消息：err 与 req.body 可能携带 initData/手机号，不能整体进日志
    console.error('[merchant/bind] failed:', String((err && err.message) || err).slice(0, 300));
    return sendError(res, 502, 'MERCHANT_FAILED', '服务暂时不可用，请稍后重试');
  }

  async function postBind(req, res) {
    if (notConfigured) return sendError(res, 503, 'MERCHANT_NOT_CONFIGURED', '服务暂未配置，请稍后重试');
    if (allow && !allow(req.ip)) return sendError(res, 429, 'RATE_LIMITED', '操作过于频繁，请稍后再试');
    const initData = req.body && req.body.initData;
    const v = validateInitData(initData, botToken, { maxAgeSeconds: MAX_AUTH_AGE_SECONDS });
    if (!v || !v.valid) return sendError(res, 401, 'INVALID_INIT_DATA', '请从 Telegram 内重新打开本页面');
    const phone = normalizePhone(req.body && req.body.phone);
    if (!phone) return sendError(res, 400, 'INVALID_PHONE', '手机号格式不正确。支持 09178889999 或 +639178889999 等写法。');

    const tgUserId = String(v.user.id);
    // 只把 hash 交给网关记账，原文不出 Node（原文含用户资料，且网关不需要它）
    const initDataHash = crypto.createHash('sha256').update(initData).digest('hex');

    // 1) 绑定：PHP 按归一后手机号查唯一商家会员 → 校验店铺归属 → 冲突检查（绝不静默顶替）
    //    → 三维度限频 → 写审计 → 写 fbs_merchant_map
    try {
      const bind = await gateway.merchantBind({ tg_user_id: tgUserId, phone, ip: req.ip || '' });
      const memberId = bind && bind.success === true && Number(bind.data && bind.data.member_id);
      if (!Number.isSafeInteger(memberId) || memberId <= 0) throw new Error('merchant_bind failed');
    } catch (err) {
      return sendBindError(res, err);
    }

    // 2) 换会话：PHP 只读 fbs_merchant_map → 会员 → 签会员 cookie（HN_login_user + HN_userid + HN_tg）
    let session;
    try {
      session = await gateway.merchantSession({ tg_user_id: tgUserId, init_data_hash: initDataHash });
      if (!session || session.success !== true || !session.data
          || !Array.isArray(session.data.set_cookies) || session.data.set_cookies.length === 0) {
        throw new Error('merchant_session returned no set_cookies');
      }
      if (!Number.isSafeInteger(Number(session.data.member_id)) || Number(session.data.member_id) <= 0) {
        throw new Error('merchant_session returned invalid member_id');
      }
    } catch (err) {
      // 绑定已经成立，会话失败不能再报「绑定失败」（会诱导用户换号重绑 → 撞 TG_ALREADY_BOUND）。
      console.error('[merchant/bind] bind ok but session failed:', String((err && err.message) || err).slice(0, 300));
      return sendError(res, 502, 'MERCHANT_SESSION_FAILED', '绑定已生效，但进入商家后台暂时失败，请稍后从 Telegram 重新打开');
    }

    // Cookie 原样透传：不增、不删、不改属性、不重新排序
    res.setHeader('Set-Cookie', session.data.set_cookies);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // 302 与 Set-Cookie 同时下发：表单 POST 的重定向响应上浏览器一定采纳 Set-Cookie（经典登录写法）。
    return res.redirect(302, safeRedirect(session.data.redirect));
  }

  // 已绑定商家换会话（JSON）：只收 body.initData，不接受 query 传参（m5 同口径）。
  async function session(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    if (notConfigured) {
      return res.status(503).json({ success: false, error: { code: 'MERCHANT_NOT_CONFIGURED', message: 'merchant entry not configured' } });
    }
    const initData = (req.body && req.body.initData) || '';
    const v = validateInitData(initData, botToken, { maxAgeSeconds: MAX_AUTH_AGE_SECONDS });
    if (!v || !v.valid) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_INIT_DATA', message: 'Invalid or missing initData' } });
    }
    const tgUserId = String(Number(v.user.id));
    if (!/^\d+$/.test(tgUserId)) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_INIT_DATA', message: 'Invalid initData user' } });
    }
    const initDataHash = crypto.createHash('sha256').update(initData).digest('hex');
    try {
      const r = await gateway.merchantSession({ tg_user_id: tgUserId, init_data_hash: initDataHash });
      if (!r || r.success !== true || !r.data || !Array.isArray(r.data.set_cookies) || r.data.set_cookies.length === 0) {
        throw new Error('merchant_session returned invalid payload');
      }
      res.setHeader('Set-Cookie', r.data.set_cookies);
      return res.json({
        success: true,
        data: {
          bound: true,
          member_id: Number(r.data.member_id),
          shop_ids: Array.isArray(r.data.shop_ids) ? r.data.shop_ids : [],
          redirect: safeRedirect(r.data.redirect)
        }
      });
    } catch (err) {
      const gerr = err && err.payload && err.payload.error;
      const code = (gerr && gerr.code) || '';
      if (err && err.code === 'GATEWAY_HTTP_ERROR' && err.status === 404 && code === 'MERCHANT_NOT_BOUND') {
        // 未绑定不是错误：调用方（bot/n8n）据此决定是否引导去绑定页
        return res.json({ success: true, data: { bound: false } });
      }
      if (err && err.code === 'GATEWAY_HTTP_ERROR' && err.status === 404 && code === 'MERCHANT_NO_SHOP') {
        return res.status(403).json({ success: false, error: { code, message: '该商家账号还没有被分配外卖店铺' } });
      }
      console.error('[merchant/session] failed:', String((err && err.message) || err).slice(0, 300));
      return res.status(502).json({ success: false, error: { code: 'MERCHANT_FAILED', message: 'Service temporarily unavailable' } });
    }
  }

  return { getLanding, postBind, session };
}

module.exports = { createMerchantRoute, normalizePhone, safeRedirect, MERCHANT_HOME };
