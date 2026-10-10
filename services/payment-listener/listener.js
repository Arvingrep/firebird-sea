/**
 * USDT (TRC-20) 链上交易监听器
 * 核心逻辑：
 * 1. 定时（如每 5 秒）轮询 TronGrid 官方 API 获取收款主钱包最新 TRC-20 Transfer 记录。
 * 2. 过滤转入代币为 USDT (合约: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t)。
 * 3. 获取精确金额（USDT 为 6 位精度），比对后端正在挂起的待支付订单尾数。
 * 4. 匹配成功后，自动向 API 触发确认回调，完成自动对账。
 */

require('dotenv').config({ path: '../../.env' });
const axios = require('axios');
const { parseTransferAmount } = require('./amount');

const MASTER_ADDRESS = process.env.TRON_MASTER_RECEIVE_ADDRESS;
if (!MASTER_ADDRESS) {
  throw new Error('TRON_MASTER_RECEIVE_ADDRESS is required');
}
const TRONGRID_API_KEY = process.env.TRONGRID_API_KEY;
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const USDT_TRC20_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

const seenTransactions = new Set();

async function pollTronGrid() {
  try {
    const url = `https://api.trongrid.io/v1/accounts/${MASTER_ADDRESS}/transactions/trc20?contract_address=${USDT_TRC20_CONTRACT}&limit=10`;
    const headers = TRONGRID_API_KEY ? { 'TRON-PRO-API-KEY': TRONGRID_API_KEY } : {};

    const response = await axios.get(url, { headers, timeout: 8000 });
    const transactions = response.data?.data || [];

    for (const tx of transactions) {
      const txId = tx.transaction_id;
      if (seenTransactions.has(txId)) continue;

      // 仅处理转入交易
      if (tx.to !== MASTER_ADDRESS) continue;

      // TRC-20 USDT 精度为 10^6
      const amount = parseTransferAmount(tx);

      process.stdout.write(`[TronGrid 监听到入账] Tx: ${txId}, 金额: ${amount} USDT\n`);
      seenTransactions.add(txId);

      // TODO: 回调 API（POST ${API_BASE_URL}/tg-api/payment/chain-match）尚未启用，
      // 待服务端接口就绪后接入，并补匹配/重放测试（AD-15）
    }
  } catch (err) {
    if (err.response?.status === 404 || !TRONGRID_API_KEY) {
      process.stdout.write('[Listener Standby] TronGrid 尚未配置正式密钥，处于开发待命模式。\n');
    } else {
      process.stderr.write(`[Listener Error] ${err.message}\n`);
    }
  }
}

process.stdout.write(`USDT (TRC-20) 链上监听进程已启动，收款主地址: ${MASTER_ADDRESS}\n`);
setInterval(pollTronGrid, 10000);
