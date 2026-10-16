'use strict';

// Story 2.2：把链上 USDT-TRC20 转入写入 fbs_chain_tx，并用 fbs_cursor 断点续扫（AD-5/AD-7：监听器只写流水）
const { spawn } = require('node:child_process');

const USDT_TRC20_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
const CURSOR_NAME = 'payment-listener';
const MAX_PAGES = 10;
const TRON_ADDR = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;
const TXID = /^[0-9a-fA-F]{64}$/;
const sqlStr = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;

// 零依赖：经 mariadb/mysql 命令行客户端执行 SQL（与 services/api/src/migrate.js 同一做法）
function cliConn(env = process.env) {
  const bin = env.DB_CLIENT || 'mariadb';
  const args = ['-h', env.DB_HOST, '-P', String(env.DB_PORT || 3306), '-u', env.DB_USER, '-N', '-B', env.DB_NAME];
  return {
    query(sql) {
      return new Promise((resolve, reject) => {
        const child = spawn(bin, args, { env: { ...env, MYSQL_PWD: env.DB_PASSWORD || '' } });
        let stdout = '';
        let stderr = '';
        child.stdout.on('data', (d) => { stdout += d; });
        child.stderr.on('data', (d) => { stderr += d; });
        child.on('error', reject);
        child.on('close', (code) => (code === 0 ? resolve(stdout) : reject(new Error(stderr.trim() || `exit ${code}`))));
        child.stdin.end(sql);
      });
    },
  };
}

// 仅保留：官方 USDT 合约、收款地址等于配置地址、txid 合法的转入记录
function isAcceptable(tx, masterAddress) {
  return Boolean(tx)
    && tx.token_info?.address === USDT_TRC20_CONTRACT
    && tx.to === masterAddress
    && TRON_ADDR.test(tx.from || '')
    && TXID.test(tx.transaction_id || '')
    && /^\d+$/.test(String(tx.value));
}

async function getCursor(conn) {
  const out = String(await conn.query(`SELECT block_number FROM fbs_cursor WHERE name=${sqlStr(CURSOR_NAME)}`)).trim();
  return out ? Number(out) : 0;
}

async function knownTxids(conn, txids) {
  if (!txids.length) return new Set();
  const out = String(await conn.query(`SELECT txid FROM fbs_chain_tx WHERE txid IN (${txids.map(sqlStr).join(',')})`));
  return new Set(out.split('\n').map((s) => s.trim().toLowerCase()).filter(Boolean));
}

// 唯一键 (txid,event_index) + ON DUPLICATE KEY UPDATE txid=txid：重复返回不重复入库，且不吞其它错误
function insertTx(conn, row) {
  const sql = 'INSERT INTO fbs_chain_tx (txid,event_index,from_address,to_address,contract,amount_micro,block_number,block_time) VALUES ('
    + [sqlStr(row.txid), 0, sqlStr(row.from), sqlStr(row.to), sqlStr(row.contract), Number(row.amountMicro),
      Number(row.blockNumber), `FROM_UNIXTIME(${Math.floor(Number(row.blockTimeMs) / 1000)})`].join(',')
    + ') ON DUPLICATE KEY UPDATE txid=txid';
  return conn.query(sql);
}

function saveCursor(conn, block) {
  return conn.query(`INSERT INTO fbs_cursor (name,block_number) VALUES (${sqlStr(CURSOR_NAME)},${Number(block)}) `
    + 'ON DUPLICATE KEY UPDATE block_number=GREATEST(block_number,VALUES(block_number))');
}

// 一轮扫描。http: { get(url,opts), post(url,body,opts) }（axios 兼容）。
// 区块号取自 solidity 节点 gettransactioninfobyid——只有已固化的交易才查得到，天然满足“已确认”。
async function scanOnce({ conn, http, masterAddress, apiKey, baseUrl = 'https://api.trongrid.io' }) {
  const headers = apiKey ? { 'TRON-PRO-API-KEY': apiKey } : {};
  const cursor = await getCursor(conn);
  const url = `${baseUrl}/v1/accounts/${masterAddress}/transactions/trc20?contract_address=${USDT_TRC20_CONTRACT}`
    + '&only_to=true&only_confirmed=true&limit=200';
  // 新→旧翻页；本地已入库的 txid 不再查 solidity 节点，整页都已入库即停止（不漏一轮内超过 200 笔的新增）
  const fresh = [];
  let fingerprint = '';
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const body = (await http.get(fingerprint ? `${url}&fingerprint=${encodeURIComponent(fingerprint)}` : url, { headers, timeout: 8000 })).data;
    const ok = (body?.data || []).filter((t) => isAcceptable(t, masterAddress));
    const known = await knownTxids(conn, ok.map((t) => t.transaction_id.toLowerCase()));
    const unseen = ok.filter((t) => !known.has(t.transaction_id.toLowerCase()));
    fresh.push(...unseen);
    fingerprint = body?.meta?.fingerprint;
    if (!fingerprint || (ok.length && !unseen.length)) break;
  }
  let maxBlock = cursor;
  let saved = 0;
  for (const tx of fresh.reverse()) {
    const info = (await http.post(`${baseUrl}/walletsolidity/gettransactioninfobyid`, { value: tx.transaction_id }, { headers, timeout: 8000 })).data;
    const blockNumber = Number(info?.blockNumber);
    if (!Number.isInteger(blockNumber)) continue; // 未固化：下一轮重试；游标不用于丢弃记录，去重靠唯一键
    await insertTx(conn, {
      txid: tx.transaction_id.toLowerCase(), from: tx.from, to: tx.to, contract: USDT_TRC20_CONTRACT,
      amountMicro: tx.value, blockNumber, blockTimeMs: tx.block_timestamp,
    });
    saved += 1;
    if (blockNumber > maxBlock) maxBlock = blockNumber;
  }
  if (maxBlock > cursor) await saveCursor(conn, maxBlock);
  return { saved, cursor: maxBlock };
}

module.exports = { USDT_TRC20_CONTRACT, cliConn, isAcceptable, getCursor, insertTx, saveCursor, scanOnce };
