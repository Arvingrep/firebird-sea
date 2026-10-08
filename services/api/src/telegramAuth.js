const crypto = require('crypto');

/**
 * 校验 Telegram Mini App 传入的 initData 签名防伪造
 * 遵循 Telegram 官方安全规范：
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 * @param {string} initData - TMA 客户端通过 window.Telegram.WebApp.initData 传给后端的 raw 字符串
 * @param {string} botToken - Telegram Bot Token
 * @returns {{ valid: boolean, user?: any, error?: string }}
 */
function validateTelegramInitData(initData, botToken) {
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

  // 5. 检查时效性 (防重放攻击，默认允许24小时内)
  const authDate = parseInt(params.get('auth_date') || '0', 10);
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > 86400) {
    return { valid: false, error: 'initData expired (older than 24 hours)' };
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
