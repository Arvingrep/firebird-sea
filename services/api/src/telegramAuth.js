const crypto = require('crypto');

/**
 * 校验 Telegram Mini App 传入的 initData 签名防伪造
 * 遵循 Telegram 官方安全规范：
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 * @param {string} initData - TMA 客户端通过 window.Telegram.WebApp.initData 传给后端的 raw 字符串
 * @param {string} botToken - Telegram Bot Token
 * @param {{ maxAgeSeconds?: number }} [options] - maxAgeSeconds 覆盖 auth_date 有效期，默认 86400（24h，收银台既有行为）
 * @returns {{ valid: boolean, user?: any, error?: string }}
 */
function validateTelegramInitData(initData, botToken, options = {}) {
  if (!initData) {
    return { valid: false, error: 'Missing initData' };
  }

  // 1. 解析 QueryString
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) {
    return { valid: false, error: 'Missing hash parameter' };
  }

  // 2. 剔除 hash 字段，并按字母升序排序组织 data_check_string
  params.delete('hash');
  const dataCheckArr = [];
  for (const [key, val] of params.entries()) {
    dataCheckArr.push(`${key}=${val}`);
  }
  dataCheckArr.sort();
  const dataCheckString = dataCheckArr.join('\n');

  // 3. 计算 secret_key: HMAC_SHA256("WebAppData", botToken)
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();

  // 4. 计算签名并对比
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (calculatedHash !== hash) {
    return { valid: false, error: 'Hash mismatch: Potential tampering detected' };
  }

  // 5. 检查时效性（防重放攻击；默认 24 小时，登录桥传 1 小时）
  const maxAgeSeconds = Number(options.maxAgeSeconds) > 0 ? Number(options.maxAgeSeconds) : 86400;
  const authDate = parseInt(params.get('auth_date') || '0', 10);
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > maxAgeSeconds) {
    return { valid: false, error: `initData expired (older than ${maxAgeSeconds}s)` };
  }

  // 6. 解析已认证的用户信息
  let user = null;
  try {
    const userStr = params.get('user');
    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (e) {
    // ignore parse error
  }

  return { valid: true, user, authDate };
}

module.exports = {
  validateTelegramInitData
};
