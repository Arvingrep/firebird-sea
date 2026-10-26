'use strict';
// 地址分享：把一条收货地址变成带一次性 token 的 Telegram 深链，
// 接收方点开即可把这条地址保存进自己的地址簿（代下单场景）。
// 安全边界：创建需登录令牌；读取凭 token（不可枚举、7 天过期、限流）；内容做长度裁剪与换行清理。
const express = require('express');
const crypto = require('crypto');
const { sqlStr } = require('./memberMap');

const LIMITS = { person: 80, tel: 60, street: 300, address: 400, areaCode: 8, coord: 24 };
const TOKEN_RE = /^[0-9a-f]{32}$/;
// 每个会员保留的有效分享条数上限：GET 是公开接口，长期堆积等于长期暴露姓名/电话/坐标
const MAX_PER_UID = 20;

// 单行化 + 截断：防止快照里带换行/制表符破坏 TSV 读取，也防止超长内容撑库
const clip = (v, n) => String(v == null ? '' : v).replace(/[\r\n\t]+/g, ' ').trim().slice(0, n);

function createAddrShareRouter({
  conn,
  tokens,
  botToken,
  ttlSeconds = 7 * 24 * 3600,
  now = () => Math.floor(Date.now() / 1000),
  allowCreate,
  allowRead,
}) {
  const router = express.Router();
  let botUsername = null;
  let botTriedAt = 0;

  // bot 用户名只用于拼 t.me 深链：启动后按需拉一次并缓存，失败 2 分钟内不重试（不影响其他接口）
  async function resolveBotUsername() {
    if (botUsername) return botUsername;
    if (!botToken) return null;
    if (now() - botTriedAt < 120) return null;
    botTriedAt = now();
    try {
      const r = await fetch(`https://api.telegram.org/bot${botToken}/getMe`, { signal: AbortSignal.timeout(5000) });
      const j = await r.json();
      if (j && j.ok && j.result && j.result.username) botUsername = String(j.result.username);
    } catch (e) { /* 网络异常：保持 null，前端降级为纯文本分享 */ }
    return botUsername;
  }

  router.post('/share', async (req, res) => {
    if (allowCreate && !allowCreate(req.ip)) {
      return res.status(429).json({ success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    }
    const m = /^Bearer (.+)$/.exec(req.get('authorization') || '');
    const v = m ? tokens.verify(m[1]) : { valid: false };
    if (!v.valid) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Please reopen the Mini App from Telegram' } });
    }
    const b = req.body || {};
    const payload = {
      person: clip(b.person, LIMITS.person),
      tel: clip(b.tel, LIMITS.tel),
      street: clip(b.street, LIMITS.street),
      address: clip(b.address, LIMITS.address),
      lat: clip(b.lat, LIMITS.coord),
      lng: clip(b.lng, LIMITS.coord),
      areaCode: clip(b.areaCode, LIMITS.areaCode) || '1',
    };
    if (!payload.street || !payload.lat || !payload.lng) {
      return res.status(400).json({ success: false, error: { code: 'INVALID', message: 'Address incomplete' } });
    }
    const mid = Number(v.claims && v.claims.mid);
    if (!Number.isSafeInteger(mid) || mid <= 0) {
      return res.status(403).json({ success: false, error: { code: 'NO_MEMBER', message: 'Member not found' } });
    }
    const token = crypto.randomBytes(16).toString('hex');
    const exp = now() + ttlSeconds;
    try {
      await conn.query(`DELETE FROM fbs_addr_share WHERE expires_at <= ${now()}`);
      await conn.query(
        `INSERT INTO fbs_addr_share (token, uid, payload, created_at, expires_at) VALUES ` +
        `(${sqlStr(token)}, ${mid}, ${sqlStr(JSON.stringify(payload))}, ${now()}, ${exp})`
      );
      // 只保留该会员最近 MAX_PER_UID 条（派生表绕开 MySQL「DELETE 子查询不能引用同表」限制）
      await conn.query(
        `DELETE FROM fbs_addr_share WHERE uid = ${mid} AND token NOT IN (` +
        `SELECT token FROM (SELECT token FROM fbs_addr_share WHERE uid = ${mid} ORDER BY created_at DESC, token DESC LIMIT ${MAX_PER_UID}) AS keep)`
      );
    } catch (e) {
      return res.status(502).json({ success: false, error: { code: 'STORE_FAILED', message: 'Please retry' } });
    }
    const username = await resolveBotUsername();
    res.json({
      success: true,
      data: {
        token,
        // username 未就绪时 url 为 null，前端降级为纯文本分享，不阻塞流程
        url: username ? `https://t.me/${username}?startapp=addr_${token}` : null,
        expiresAt: exp,
      },
    });
  });

  // 公开读取：凭 token 访问（不校验登录），仅返回地址快照，不含 uid 等归属信息
  router.get('/shared/:token', async (req, res) => {
    if (allowRead && !allowRead(req.ip)) {
      return res.status(429).json({ success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    }
    const tk = String(req.params.token || '');
    if (!TOKEN_RE.test(tk)) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    let out;
    try {
      // 必须用 HEX 取回：cliConn 走 `mariadb -N -B`，批处理模式会把输出里的反斜杠再次转义，
      // 直接 SELECT payload 时含 " 或 \ 的 JSON 会变成 \" / \\ 导致解析失败（QA 第 1 轮 major）。
      out = await conn.query(`SELECT HEX(payload) FROM fbs_addr_share WHERE token = ${sqlStr(tk)} AND expires_at > ${now()}`);
    } catch (e) {
      return res.status(502).json({ success: false, error: { code: 'LOOKUP_FAILED' } });
    }
    const hex = String(out || '').trim();
    if (!hex) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    let data;
    try {
      data = JSON.parse(Buffer.from(hex, 'hex').toString('utf8'));
    } catch (e) {
      return res.status(502).json({ success: false, error: { code: 'CORRUPT' } });
    }
    res.json({ success: true, data });
  });

  return router;
}

module.exports = { createAddrShareRouter, LIMITS, TOKEN_RE };
