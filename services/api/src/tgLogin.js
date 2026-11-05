'use strict';

// Telegram 顾客免密登录桥（方案甲：Node 中转）
//
// 链路：bot 菜单打开 /tg/entry?role=customer → 落地页取 initData → POST /tg-api/auth/telegram-web
//       → Node 验签（1 小时时效）→ 网关 member_find_or_create + issue_session
//       → 把网关给的完整 Set-Cookie 原样透传 → 落地页跳 /
//
// 设计取舍（为什么 Node 不自己拼 Cookie）：
//   HN_login_user 的值是 base64(RenrenCrypt::php_encrypt("<id>&<password 列值>"))，是双重 base64
//   且依赖火鸟运行时的 cookieDomain / httpSecureAccess / onlinetime。这些只在 PHP 侧有一份权威实现
//   （bridge.php 的 fbs_bridge_build_session_cookies）。Node 重新拼属性必然随配置漂移，一旦 domain
//   或 SameSite 差一个字符，浏览器不认账而 PHP 认账，表现为"登录成功但首页仍是游客"。故 set_cookies
//   由 PHP 生成，Node 只做 header 透传，不修改任何属性。
//
// 响应形状：对象形 {success:true,data} / {success:false,error:{code,message}}。
//   不要照抄 /auth/tg-verify（server.js:44-74）的字符串形 {success:false,error:'...'}——新近功能
//   （checkout / call-test）一律对象形，顾客侧已依赖 /auth/tg-verify 的旧形状，故那条不动。

const LOGIN_MAX_AGE_SECONDS = 3600; // 登录用 1 小时；收银台仍走 telegramAuth 默认 24h
const SAFE_TABLE_PREFIX = /^[A-Za-z0-9_]{1,32}$/;

// 登录专属的 code → HTTP 码表。
//
// 刻意**不复用** checkoutRoute.js:12-18 的 statusFor()：那是 checkout 专属枚举表，兜底 503、
// 且连 checkout 自己的 RATE_LIMITED（:38 硬编码 429）都没走它。登录场景里 503 会让客户端自动重试，
// 只会放大重放与限流压力，所以本表兜底 500。
const LOGIN_STATUS_BY_CODE = {
  // —— 网关契约码（webroot/api/fbs/index.php）——
  INVALID_SIGNATURE: 401,
  MISSING_PARAM: 400,
  MEMBER_DISABLED: 403,
  MEMBER_CANCELLED: 403,
  REPLAY_LIMITED: 429,
  GATEWAY_UNAVAILABLE: 502,
  GATEWAY_SECRET_NOT_CONFIGURED: 500, // 静态配置错，重试无用
  CONFIG_MISSING: 500,
  CONFIG_INVALID: 500,
  MEMBER_CREATE_FAILED: 500,
  DB_QUERY_FAILED: 500,
  UNKNOWN_ACTION: 500,
  INTERNAL_ERROR: 500,
  // 有意改判：PHP 侧 db_unavailable 是 500，但对外按"重试有没有用"判据应为 503 ——
  // 连不上库是瞬态依赖故障，重试有效。看到 PHP 侧是 500 不要当 bug 改回去。
  DB_UNAVAILABLE: 503,
  // —— 本路由自有 ——
  INVALID_INIT_DATA: 401,
  EXPIRED_INIT_DATA: 401,
  ROLE_NOT_SUPPORTED: 501
};

const DEFAULT_STATUS = 500; // 未识别码落 500：503 会诱导客户端重试，放大重放与限流压力

const MESSAGE_BY_CODE = {
  INVALID_SIGNATURE: '登录校验失败，请重新打开',
  MISSING_PARAM: '登录参数缺失',
  MEMBER_DISABLED: '账号已停用，请联系站点',
  MEMBER_CANCELLED: '账号已申请注销，请联系站点',
  REPLAY_LIMITED: '请求过于频繁，请稍后再试',
  GATEWAY_SECRET_NOT_CONFIGURED: '登录服务未正确配置',
  CONFIG_MISSING: '登录服务未正确配置',
  CONFIG_INVALID: '登录服务未正确配置',
  MEMBER_CREATE_FAILED: '账号创建失败，请稍后再试',
  DB_QUERY_FAILED: '登录服务暂不可用，请稍后再试',
  INVALID_INIT_DATA: '登录信息校验失败',
  EXPIRED_INIT_DATA: '登录信息已过期，请重新打开',
  ROLE_NOT_SUPPORTED: '该身份暂未开放'
};

function logStderr(route, message) {
  process.stderr.write(`${JSON.stringify({ level: 'error', route, message })}\n`);
}

function statusForLoginCode(code) {
  return LOGIN_STATUS_BY_CODE[code] || DEFAULT_STATUS;
}

function messageForCode(code) {
  return MESSAGE_BY_CODE[code] || '登录服务暂不可用，请稍后再试';
}

function sendError(res, code, message) {
  const status = statusForLoginCode(code);
  // 503 是「重试有用」的瞬态故障：给 Retry-After 让客户端/网关有据可依。
  // 落地页本身不自动重试（同一份 initData 每次重试都扣一次重放额度，见 entry.php 说明）。
  if (status === 503) res.setHeader('Retry-After', '60');
  return res.status(status).json({ success: false, error: { code, message: message || messageForCode(code) } });
}

// 网关失败 → 归一成契约码（透传，不压成 INTERNAL_ERROR）。
function gatewayFailureCode(err) {
  const payload = err && err.payload;
  const code = payload && payload.error && payload.error.code;
  if (typeof code === 'string' && code !== '') return code; // 网关 success:false 的 code 原样透传
  if (err && (err.code === 'GATEWAY_TIMEOUT' || err.code === 'GATEWAY_BAD_JSON')) return 'GATEWAY_UNAVAILABLE';
  return 'GATEWAY_UNAVAILABLE'; // 连不上 / 返回非契约 HTML 等
}

// fbs_member_map：tg_user_id ↔ 火鸟会员 id。收银台的归属校验读这张表。
// fail-open：写失败不阻断登录（登录态已由 cookie 建立），但必须留痕 —— 这是"登录成功但收银台 403"
// 的唯一线索，所以既打结构化 error 日志（不含堆栈），又把 member_map_synced 带进响应体。
// @return {boolean} 是否已同步（无连接对象时视为未接线，返回 true 以免误报）
async function upsertMemberMap(conn, prefix, tgUserId, memberId) {
  if (!conn) return true;
  if (!SAFE_TABLE_PREFIX.test(prefix || '')) throw new Error('invalid table prefix');
  const sql =
    `INSERT INTO \`${prefix}fbs_member_map\` (tg_user_id, member_id) VALUES ('${tgUserId}', ${memberId}) ` +
    'ON DUPLICATE KEY UPDATE member_id = VALUES(member_id)';
  await conn().query(sql);
  return true;
}

// deps：{ env, validateInitData, botToken, gateway, conn, now }，测试全部可注入。
function createTgLoginRouter(deps) {
  const { env = process.env, validateInitData, botToken, gateway, conn, now = Date.now } = deps;
  const tablePrefix = env.DB_TABLE_PREFIX || 'huoniao_';

  return async function telegramWebLogin(req, res) {
    const baseUrl = env.FBS_GATEWAY_URL;
    const secret = env.FBS_GATEWAY_SECRET;
    if (!baseUrl || !secret) {
      logStderr('auth/telegram-web', 'FBS_GATEWAY_URL / FBS_GATEWAY_SECRET 未配置，登录桥不可用');
      return sendError(res, 'GATEWAY_SECRET_NOT_CONFIGURED');
    }

    const body = req.body || {};
    const initData = req.get('x-telegram-init-data') || body.initData;
    if (!initData || typeof initData !== 'string') {
      return sendError(res, 'MISSING_PARAM', '缺少 initData');
    }

    const auth = validateInitData(initData, botToken, { maxAgeSeconds: LOGIN_MAX_AGE_SECONDS });
    const tgUserId = auth && auth.user ? Number(auth.user.id) : NaN;
    if (!auth || !auth.valid || !Number.isSafeInteger(tgUserId) || tgUserId <= 0) {
      const expired = /expired|stale/i.test((auth && auth.error) || '');
      return sendError(res, expired ? 'EXPIRED_INIT_DATA' : 'INVALID_INIT_DATA');
    }

    const role = body.role || 'customer';
    if (role !== 'customer') {
      // 骑手线（courier）在第 4 步实现，本步一律 501
      return sendError(res, 'ROLE_NOT_SUPPORTED');
    }

    const cfg = {
      baseUrl,
      secret,
      timeoutMs: Number(env.FBS_GATEWAY_TIMEOUT_MS) > 0 ? Number(env.FBS_GATEWAY_TIMEOUT_MS) : undefined
    };

    const params = { tg_user_id: tgUserId };
    for (const key of ['first_name', 'last_name', 'username']) {
      if (typeof auth.user[key] === 'string' && auth.user[key] !== '') params[key] = auth.user[key];
    }

    let member;
    let session;
    try {
      member = await gateway.memberFindOrCreate(cfg, params);
      // 网关 200 也可能是 success:false（防御式，正常实现不会）
      if (!member || member.success !== true || !member.data || !Number.isSafeInteger(Number(member.data.member_id))) {
        logStderr('auth/telegram-web', `member_find_or_create 返回异常: ${JSON.stringify(member)}`);
        return sendError(res, 'GATEWAY_UNAVAILABLE');
      }

      session = await gateway.issueSession(cfg, { tg_user_id: tgUserId });
      if (!session || session.success !== true || !session.data
          || !Array.isArray(session.data.set_cookies) || session.data.set_cookies.length === 0) {
        logStderr('auth/telegram-web', 'issue_session 未返回 set_cookies');
        return sendError(res, 'GATEWAY_UNAVAILABLE');
      }
    } catch (err) {
      const code = gatewayFailureCode(err);
      logStderr('auth/telegram-web', `网关调用失败 code=${code} err=${err && err.message}`);
      return sendError(res, code);
    }

    const memberId = Number(session.data.member_id);

    // Cookie 原样透传：不增、不删、不改属性、不重新排序
    res.setHeader('Set-Cookie', session.data.set_cookies);

    let memberMapSynced = false;
    try {
      memberMapSynced = (await upsertMemberMap(conn, tablePrefix, tgUserId, memberId)) === true;
    } catch (err) {
      // 结构化留痕：不打堆栈、不带 SQL 全文
      process.stderr.write(`${JSON.stringify({
        level: 'error',
        route: 'auth/telegram-web',
        event: 'member_map_sync_failed',
        tg_user_id: tgUserId,
        member_id: memberId,
        reason: err && err.message
      })}\n`);
    }

    // 200 + JSON 而不是 302：落地页用 fetch 调本接口，跨重定向的 Set-Cookie 在部分 WebView 上
    // 不被采纳（Safari/iOS WebView 差异），200 响应上的 Set-Cookie 一定生效；由落地页自行 location.replace。
    return res.status(200).json({
      success: true,
      data: { member_id: memberId, redirect: '/', member_map_synced: memberMapSynced, at: now() }
    });
  };
}

module.exports = {
  createTgLoginRouter,
  LOGIN_MAX_AGE_SECONDS,
  LOGIN_STATUS_BY_CODE,
  DEFAULT_STATUS,
  statusForLoginCode
};
