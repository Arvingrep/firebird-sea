'use strict';
// T2.1/T2.2/T2.3 编排：验签 → 限频与防重放 → 映射 → 签发令牌 → 审计。
const { validateTelegramInitData } = require('./telegramAuth');

function createLoginService({ botToken, tokens, memberMap, allowLogin, allowReplay, now, auditEvery = 60000, clock = () => Date.now() }) {
  const lastAudit = new Map(); // 限流事件审计采样，避免被限流的请求造成写放大
  async function auditLimited(tgId, action) {
    const k = `${tgId}:${action}`;
    const t = clock();
    if (t - (lastAudit.get(k) || 0) < auditEvery) return;
    lastAudit.set(k, t);
    if (lastAudit.size > 5000) lastAudit.clear();
    await memberMap.audit(tgId, action, `tg:${tgId}`);
  }
  async function login(initData) {
    const v = validateTelegramInitData(initData, botToken, now ? { now: now() } : {});
    if (!v.valid) return { status: 401, body: { success: false, error: { code: 'INVALID_INIT_DATA', message: v.error } } };

    const tgId = v.user.id;
    if (!allowLogin(`tg:${tgId}`)) {
      await auditLimited(tgId, 'login_rate_limited');
      return { status: 429, body: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many login attempts' } } };
    }
    // 同一 initData 换发次数受限（防囤积重放）
    if (!allowReplay(`h:${v.hash}`)) {
      await auditLimited(tgId, 'login_replay_limited');
      return { status: 429, body: { success: false, error: { code: 'REPLAY_LIMITED', message: 'initData reused too many times' } } };
    }

    const { memberId } = await memberMap.findOrCreate(tgId);
    const { token, expiresAt } = tokens.issue({ tgId, memberId });
    await memberMap.audit(tgId, 'login', `member:${memberId}`);
    return { status: 200, body: { success: true, data: { token, expiresAt, memberId } } };
  }

  return { login };
}

module.exports = { createLoginService };
