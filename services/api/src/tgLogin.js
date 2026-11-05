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

const LOGIN_MAX_AGE_SECONDS = 3600; // 登录用 1 小时；收银台仍走 telegramAuth 默认 24h
const SAFE_TABLE_PREFIX = /^[A-Za-z0-9_]{1,32}$/;

function logStderr(route, message) {
  process.stderr.write(`${JSON.stringify({ level: 'error', route, message })}\n`);
}

// 网关报错 → 对前端的错误码/状态码。网关的错误已经在 PHP 侧脱敏（不含堆栈）。
function mapGatewayError(err) {
  if (err && err.code === 'GATEWAY_HTTP_ERROR') {
    const payload = err.payload || {};
    if (err.status === 403 && payload.error === 'member_disabled') {
      return { status: 403, code: 'MEMBER_DISABLED', message: '账号已被禁用，请联系客服' };
    }
    if (err.status === 400) return { status: 400, code: 'GATEWAY_BAD_REQUEST', message: '登录参数异常' };
    if (err.status === 503) return { status: 503, code: 'GATEWAY_NOT_CONFIGURED', message: '登录服务暂未开放' };
    return { status: 503, code: 'GATEWAY_UNAVAILABLE', message: '登录服务暂不可用' };
  }
  if (err && (err.code === 'GATEWAY_TIMEOUT' || err.code === 'GATEWAY_BAD_JSON')) {
    return { status: 503, code: 'GATEWAY_UNAVAILABLE', message: '登录服务暂不可用' };
  }
  return { status: 503, code: 'GATEWAY_UNAVAILABLE', message: '登录服务暂不可用' };
}

// fbs_member_map：tg_user_id ↔ 火鸟会员 id。收银台的归属校验读这张表。
// 失败不阻断登录（登录态已由 cookie 建立），只落日志——该缺口在报告里登记。
async function upsertMemberMap(conn, prefix, tgUserId, memberId) {
  if (!conn) return;
  if (!SAFE_TABLE_PREFIX.test(prefix || '')) throw new Error('invalid table prefix');
  const sql =
    `INSERT INTO \`${prefix}fbs_member_map\` (tg_user_id, member_id) VALUES ('${tgUserId}', ${memberId}) ` +
    'ON DUPLICATE KEY UPDATE member_id = VALUES(member_id)';
  await conn().query(sql);
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
      return res.status(503).json({ code: 503, error: { code: 'GATEWAY_NOT_CONFIGURED', message: '登录服务暂未开放' } });
    }

    const body = req.body || {};
    const initData = req.get('x-telegram-init-data') || body.initData;
    if (!initData || typeof initData !== 'string') {
      return res.status(400).json({ code: 400, error: { code: 'MISSING_INIT_DATA', message: '缺少 initData' } });
    }

    const auth = validateInitData(initData, botToken, { maxAgeSeconds: LOGIN_MAX_AGE_SECONDS });
    const tgUserId = auth && auth.user ? Number(auth.user.id) : NaN;
    if (!auth || !auth.valid || !Number.isSafeInteger(tgUserId) || tgUserId <= 0) {
      const expired = /expired|stale/i.test((auth && auth.error) || '');
      return res.status(401).json({
        code: 401,
        error: {
          code: expired ? 'EXPIRED_INIT_DATA' : 'INVALID_INIT_DATA',
          message: expired ? '登录信息已过期，请重新打开' : '登录信息校验失败'
        }
      });
    }

    const role = body.role || 'customer';
    if (role !== 'customer') {
      // 骑手线（courier）在第 4 步实现
      return res.status(501).json({ code: 501, error: { code: 'ROLE_NOT_SUPPORTED', message: '该身份暂未开放' } });
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

    let session;
    try {
      const member = await gateway.memberFindOrCreate(cfg, params);
      if (!member || member.code !== 0 || !Number.isSafeInteger(Number(member.member_id))) {
        logStderr('auth/telegram-web', `member_find_or_create 返回异常: ${JSON.stringify(member)}`);
        return res.status(503).json({ code: 503, error: { code: 'GATEWAY_UNAVAILABLE', message: '登录服务暂不可用' } });
      }

      session = await gateway.issueSession(cfg, { tg_user_id: tgUserId });
      if (!session || session.code !== 0 || !Array.isArray(session.set_cookies) || session.set_cookies.length === 0) {
        logStderr('auth/telegram-web', 'issue_session 未返回 set_cookies');
        return res.status(503).json({ code: 503, error: { code: 'GATEWAY_UNAVAILABLE', message: '登录服务暂不可用' } });
      }
    } catch (err) {
      const mapped = mapGatewayError(err);
      logStderr('auth/telegram-web', `网关调用失败: ${err && err.message}`);
      return res.status(mapped.status).json({ code: mapped.status, error: { code: mapped.code, message: mapped.message } });
    }

    const memberId = Number(session.member_id);

    // Cookie 原样透传：不增、不删、不改属性、不重新排序
    res.setHeader('Set-Cookie', session.set_cookies);

    try {
      await upsertMemberMap(conn, tablePrefix, tgUserId, memberId);
    } catch (err) {
      logStderr('auth/telegram-web', `fbs_member_map 写入失败 tg=${tgUserId} member=${memberId}: ${err && err.message}`);
    }

    // 200 + JSON 而不是 302：落地页用 fetch 调本接口，跨重定向的 Set-Cookie 在部分 WebView 上
    // 不被采纳（Safari/iOS WebView 差异），200 响应上的 Set-Cookie 一定生效；由落地页自行 location.replace。
    return res.status(200).json({ code: 0, member_id: memberId, redirect: '/', at: now() });
  };
}

module.exports = { createTgLoginRouter, LOGIN_MAX_AGE_SECONDS, mapGatewayError };
