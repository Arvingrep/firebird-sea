// AD-13：配置只来自环境；生产启动自检（演示令牌 / 占位符地址 / 缺失必填项 → 拒绝启动）
const DEMO_BOT_TOKEN = 'DEMO_BOT_TOKEN_123456';
const REQUIRED_IN_PRODUCTION = ['TELEGRAM_BOT_TOKEN', 'TRON_MASTER_RECEIVE_ADDRESS'];

function isPlaceholderAddress(addr) {
  return !/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(addr) || /EXAMPLE/i.test(addr);
}

function validateProductionConfig(env) {
  if (env.NODE_ENV !== 'production') return [];
  const errors = [];
  for (const key of REQUIRED_IN_PRODUCTION) {
    if (!env[key]) errors.push(`缺少必填环境变量 ${key}`);
  }
  if (env.TELEGRAM_BOT_TOKEN && /^DEMO_|DEMO_BOT_TOKEN/.test(env.TELEGRAM_BOT_TOKEN)) {
    errors.push('TELEGRAM_BOT_TOKEN 是演示令牌，生产环境不允许');
  }
  const addr = env.TRON_MASTER_RECEIVE_ADDRESS;
  if (addr && isPlaceholderAddress(addr)) {
    errors.push('TRON_MASTER_RECEIVE_ADDRESS 是占位符或格式非法的收款地址');
  }
  return errors;
}

function assertProductionConfig(env = process.env) {
  const errors = validateProductionConfig(env);
  if (errors.length) {
    throw new Error(`生产配置自检失败，拒绝启动:\n - ${errors.join('\n - ')}`);
  }
}

module.exports = { DEMO_BOT_TOKEN, validateProductionConfig, assertProductionConfig };
