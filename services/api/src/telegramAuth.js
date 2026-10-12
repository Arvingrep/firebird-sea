const crypto = require('crypto');

// T2.1：initData 有效期 1 小时（可由调用方覆盖，供测试使用）
const MAX_AUTH_AGE_SECONDS = 3600;
// 允许的时钟偏移：auth_date 不得晚于当前时间超过该秒数
const MAX_CLOCK_SKEW_SECONDS = 60;

/**
 * 校验 Telegram Mini App 传入的 initData 签名防伪造
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 * - 只认 HMAC `hash`。官方规范：HMAC 校验的 data_check_string 仅剔除 hash，`signature`
 *   字段（Ed25519，供第三方验签用）照常参与；因此这里不得剔除 signature，否则真实登录会失败。
 *   不实现也不使用 Ed25519 路径，避免两套验签混淆。
 * - 常量时间比较；auth_date 必须存在且在有效期内
 *
 * @param {string} initData - window.Telegram.WebApp.initData 原始字符串
 * @param {string} botToken
 * @param {{ maxAgeSeconds?: number, now?: number }} [opts]
 * @returns {{ valid: boolean, user?: any, authDate?: number, hash?: string, error?: string }}
 */
function validateTelegramInitData(initData, botToken, opts = {}) {
  const maxAge = opts.maxAgeSeconds ?? MAX_AUTH_AGE_SECONDS;
  const now = opts.now ?? Math.floor(Date.now() / 1000);

  if (!initData || typeof initData !== 'string') {
    return { valid: false, error: 'Missing initData' };
  }
  if (!botToken) {
    return { valid: false, error: 'Server auth not configured' };
  }

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash || !/^[0-9a-f]{64}$/i.test(hash)) {
    return { valid: false, error: 'Missing or malformed hash parameter' };
  }

  params.delete('hash');
  const dataCheckString = [...params.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculated = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest();
  const provided = Buffer.from(hash, 'hex');
  if (provided.length !== calculated.length || !crypto.timingSafeEqual(provided, calculated)) {
    return { valid: false, error: 'Hash mismatch: Potential tampering detected' };
  }

  const authDate = parseInt(params.get('auth_date') || '', 10);
  if (!Number.isFinite(authDate) || authDate <= 0) {
    return { valid: false, error: 'Missing auth_date' };
  }
  if (now - authDate > maxAge) {
    return { valid: false, error: 'initData expired' };
  }
  if (authDate - now > MAX_CLOCK_SKEW_SECONDS) {
    return { valid: false, error: 'initData auth_date is in the future' };
  }

  let user = null;
  try {
    const userStr = params.get('user');
    if (userStr) user = JSON.parse(userStr);
  } catch (e) {
    return { valid: false, error: 'Malformed user field' };
  }
  if (!user || !Number.isSafeInteger(user.id) || user.id <= 0) {
    return { valid: false, error: 'Missing user.id' };
  }

  return { valid: true, user, authDate, hash: hash.toLowerCase() };
}

module.exports = {
  validateTelegramInitData,
  MAX_AUTH_AGE_SECONDS
};
