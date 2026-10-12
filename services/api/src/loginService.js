'use strict';
// T2.1/T2.2/T2.3 编排：验签 → 限频与防重放 → 映射 → 签发令牌 → 审计。
const { validateTelegramInitData } = require('./telegramAuth');

function createLoginService({ botToken, tokens, memberMap, allowLogin, allowReplay, now }) {
  async function login(initData) {
    const v = validateTelegramInitData(initData, botToken, now ? { now: now() } : {});
    if (!v.valid) return { status: 401, body: { success: false, error: { code: 'INVALID_INIT_DATA', message: v.error } } };

    const tgId = v.user.id;
    if (!allowLogin(`tg:${tgId}`)) {
      await memberMap.audit(tgId, 'login_rate_limited', `tg:${tgId}`);
      return { status: 429, body: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many login attempts' } } };
    }
    // 同一 initData 换发次数受限（防囤积重放）
    if (!allowReplay(`h:${v.hash}`)) {
      await memberMap.audit(tgId, 'login_replay_limited', `tg:${tgId}`);
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
