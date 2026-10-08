/**
 * USDT 收银台与动态尾数匹配管理器
 * 一人 AI 团队方案：无需为每个用户生成冷热私钥，使用“单一收款主地址 + 动态微小尾数”自动识别对账
 */

const activeCharges = new Map(); // 内存订单池（生产环境可切换为 Redis）
const occupiedAmounts = new Set(); // 正在锁定的金额，防止碰撞

const MASTER_TRON_ADDRESS = process.env.TRON_MASTER_RECEIVE_ADDRESS || 'TW4Q8tq6U1z3wWkEXAMPLETRONADDR9999';
const PAYMENT_WINDOW_MS = 15 * 60 * 1000; // 15 分钟倒计时

/**
 * 创建 USDT 支付单
 * @param {string} orderId 业务订单号
 * @param {number} baseAmountUsdt 基础应付金额（整数字或两位小数）
 * @param {string} network 链类型（TRC-20 / BEP-20 / TON）
 */
function createPaymentCharge(orderId, baseAmountUsdt, network = 'TRC-20') {
  // 清理过期金额占用
  cleanExpiredCharges();

  // 寻找未被占用的动态尾数 (例如 base=15, 尾数 0.01 ~ 0.99 ➔ 15.03)
  let allocatedAmount = baseAmountUsdt;
  let attempts = 0;
  
  while (attempts < 100) {
    const randomCent = (Math.floor(Math.random() * 90) + 1) / 100; // 0.01 - 0.90
    const candidate = Number((baseAmountUsdt + randomCent).toFixed(2));
    
    if (!occupiedAmounts.has(candidate)) {
      allocatedAmount = candidate;
      occupiedAmounts.add(allocatedAmount);
      break;
    }
    attempts++;
  }

  const chargeId = `CHG_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const expiresAt = Date.now() + PAYMENT_WINDOW_MS;

  const charge = {
    chargeId,
    orderId,
    baseAmount: baseAmountUsdt,
    amountToPay: allocatedAmount,
    currency: 'USDT',
    network,
    receiveAddress: MASTER_TRON_ADDRESS,
    status: 'PENDING', // PENDING | PAID | EXPIRED
    createdAt: Date.now(),
    expiresAt,
    txHash: null
  };

  activeCharges.set(chargeId, charge);

  return charge;
}

/**
 * 校验并获取支付单详情
 */
function getCharge(chargeId) {
  const charge = activeCharges.get(chargeId);
  if (!charge) return null;

  if (charge.status === 'PENDING' && Date.now() > charge.expiresAt) {
    charge.status = 'EXPIRED';
    occupiedAmounts.delete(charge.amountToPay);
  }

  return charge;
}

/**
 * 标记支付成功 (由链上监听脚本或 Webhook 触发)
 */
function confirmChargePaid(chargeId, txHash) {
  const charge = activeCharges.get(chargeId);
  if (!charge) return { success: false, error: 'Charge not found' };

  charge.status = 'PAID';
  charge.txHash = txHash;
  charge.paidAt = Date.now();
  occupiedAmounts.delete(charge.amountToPay);

  return { success: true, charge };
}

/**
 * 根据链上转账金额精确寻找挂起的订单 (TRC-20 链上监听器调用)
 */
function findPendingChargeByAmount(exactAmount) {
  cleanExpiredCharges();
  for (const charge of activeCharges.values()) {
    if (charge.status === 'PENDING' && Math.abs(charge.amountToPay - exactAmount) < 0.0001) {
      return charge;
    }
  }
  return null;
}

function cleanExpiredCharges() {
  const now = Date.now();
  for (const [id, charge] of activeCharges.entries()) {
    if (charge.status === 'PENDING' && now > charge.expiresAt) {
      charge.status = 'EXPIRED';
      occupiedAmounts.delete(charge.amountToPay);
    }
  }
}

module.exports = {
  createPaymentCharge,
  getCharge,
  confirmChargePaid,
  findPendingChargeByAmount
};
