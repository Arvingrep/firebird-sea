'use strict';

// Story 2.1（QA 第 4 轮 major 2）：收银台金额与买家归属必须由服务端读取，不接受客户端提交。
// 权威行 = 火鸟 pay_log（AD-4：fbs_charge.ordernum 与 pay_log 一一对应；deal() 下单时同步创建）。
//
// 过渡说明：AD-1/AD-3 规定订单数据经 webroot/api/fbs 网关读取；网关 PHP 端尚未落地（见
// GATEWAY_SPIKE.md"未完成"）。在网关就绪前，本模块以只读方式经 migrate.js 同款零依赖 CLI
// 通道读取 pay_log 单行（SELECT 固定列，不写入火鸟表，uid 与 fbs_member_map.member_id 同域）。
// 网关落地后本函数应替换为 gatewayClient 调用，fbs_charge 写路径不变。

const { cliConn } = require('./migrate');

// ordernum 已由 checkout.js 的 SAFE_ID 白名单校验；此处再防御一次（引号/反引号/空白全拒绝）。
const SAFE_ORDER = /^[A-Za-z0-9_-]{1,64}$/;

class OrderReadError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

// amount 为 decimal(8,2) 的 PHP 元；换算整数 centavos（×100），用字符串运算避免浮点误差。
function centavosFromDecimal(text) {
  const m = /^(\d+)\.(\d{2})$/.exec(text);
  if (!m) throw new OrderReadError('ORDER_INVALID', '订单金额格式异常');
  return Number(m[1]) * 100 + Number(m[2]);
}

async function readPayOrder(ordernum, conn = cliConn(), prefix = process.env.DB_TABLE_PREFIX || 'huoniao_') {
  if (!SAFE_ORDER.test(ordernum || '')) throw new OrderReadError('BAD_REQUEST', 'ordernum 格式无效');
  if (!/^[A-Za-z0-9_]{1,32}$/.test(prefix)) throw new OrderReadError('ORDER_INVALID', '表前缀配置无效');
  const out = String(
    await conn.query(`SELECT amount, uid, state FROM \`${prefix}pay_log\` WHERE ordernum='${ordernum}' ORDER BY id DESC LIMIT 1`),
  ).trim();
  if (!out) throw new OrderReadError('ORDER_NOT_FOUND', '订单不存在或尚未生成支付单');
  const [amount, uid, state] = out.split('\t');
  if (state !== '0') throw new OrderReadError('ORDER_NOT_PAYABLE', '订单已支付或状态不允许结账');
  const member = Number(uid);
  if (!Number.isSafeInteger(member) || member <= 0) throw new OrderReadError('ORDER_INVALID', '订单归属异常');
  const centavos = centavosFromDecimal(amount);
  if (!Number.isSafeInteger(centavos) || centavos <= 0) throw new OrderReadError('ORDER_INVALID', '订单金额必须为正');
  return { centavos, memberId: member };
}

// 归属校验：请求的 Telegram 用户必须在 fbs_member_map 中映射到订单的 pay_log.uid（火鸟会员 id）。
async function assertOwnership(conn, tgUserId, memberId) {
  const tg = String(tgUserId);
  if (!/^\d{1,32}$/.test(tg)) throw new OrderReadError('UNAUTHORIZED', '用户标识无效');
  const out = String(
    await conn.query(`SELECT member_id FROM fbs_member_map WHERE tg_user_id='${tg}' LIMIT 1`),
  ).trim();
  if (out.split('\t')[0] !== String(memberId)) throw new OrderReadError('ORDER_FORBIDDEN', '无权为该订单创建收银台');
}

module.exports = { readPayOrder, assertOwnership, centavosFromDecimal, OrderReadError };
