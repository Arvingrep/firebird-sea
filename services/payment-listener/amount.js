/**
 * 将 TronGrid TRC-20 转账记录换算为 USDT 金额（默认 6 位精度）
 * @param {{ value: string|number, token_info?: { decimals?: number } }} tx
 * @returns {number}
 */
function parseTransferAmount(tx) {
  const decimals = tx.token_info?.decimals || 6;
  return Number(tx.value) / Math.pow(10, decimals);
}

module.exports = { parseTransferAmount };
