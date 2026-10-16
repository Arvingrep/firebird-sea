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
const { cliConn, scanOnce } = require('./ledger');

const MASTER_ADDRESS = process.env.TRON_MASTER_RECEIVE_ADDRESS;
if (!MASTER_ADDRESS) {
  throw new Error('TRON_MASTER_RECEIVE_ADDRESS is required');
}
const TRONGRID_API_KEY = process.env.TRONGRID_API_KEY;
const conn = cliConn();

async function pollTronGrid() {
  try {
    // 仅写流水（fbs_chain_tx）与游标（fbs_cursor）；对账由 API 在事务内完成（AD-7）
    const { saved, cursor } = await scanOnce({ conn, http: axios, masterAddress: MASTER_ADDRESS, apiKey: TRONGRID_API_KEY });
    if (saved) process.stdout.write(`[TronGrid 入账] 本轮写入 ${saved} 笔，游标区块 ${cursor}\n`);
  } catch (err) {
    // 仅 TronGrid HTTP 错误可视为待命；DB / spawn 等本地错误（无 err.response）一律按错误输出
    if (err.response && (err.response.status === 404 || !TRONGRID_API_KEY)) {
      process.stdout.write('[Listener Standby] TronGrid 尚未配置正式密钥，处于开发待命模式。\n');
    } else {
      process.stderr.write(`[Listener Error] ${err.message}\n`);
    }
  }
}

process.stdout.write(`USDT (TRC-20) 链上监听进程已启动，收款主地址: ${MASTER_ADDRESS}\n`);
setInterval(pollTronGrid, 10000);
