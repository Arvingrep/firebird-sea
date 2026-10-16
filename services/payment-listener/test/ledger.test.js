'use strict';

// Story 2.2：链监听与流水账本（内存假库 + 假 TronGrid，不联网）
const test = require('node:test');
const assert = require('node:assert/strict');
const { scanOnce, USDT_TRC20_CONTRACT } = require('../ledger');

const MASTER = 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE';
const FROM = 'TLsV52sRDL79HXGGm9yzwKibb6BeruhUzy';
const tid = (n) => String(n).padStart(64, 'a');

function fakeDb() {
  const rows = new Map();
  const db = { rows, cursor: null };
  db.conn = {
    async query(sql) {
      if (sql.startsWith('SELECT block_number FROM fbs_cursor')) return db.cursor === null ? '' : `${db.cursor}\n`;
      if (sql.startsWith('INSERT IGNORE INTO fbs_chain_tx')) {
        const m = /VALUES \('([0-9a-f]+)',0,'([^']+)','([^']+)','([^']+)',(\d+),(\d+),/.exec(sql);
        const key = `${m[1]}:0`;
        if (!rows.has(key)) rows.set(key, { txid: m[1], to: m[3], contract: m[4], amount: Number(m[5]), block: Number(m[6]) });
        return '';
      }
      if (sql.startsWith('INSERT INTO fbs_cursor')) {
        db.cursor = Math.max(db.cursor || 0, Number(/,(\d+)\) ON DUPLICATE/.exec(sql)[1]));
        return '';
      }
      throw new Error(`unexpected sql: ${sql}`);
    },
  };
  return db;
}

const mkTx = (n, over = {}) => ({
  transaction_id: tid(n), from: FROM, to: MASTER, value: '1500000', block_timestamp: 1700000000000 + n,
  token_info: { address: USDT_TRC20_CONTRACT, decimals: 6 }, ...over,
});

// blocks: txid -> blockNumber；缺省视为未固化（solidity 节点查不到）
function fakeHttp(list, blocks) {
  return {
    async get() { return { data: { data: list } }; },
    async post(_u, body) { return { data: blocks[body.value] ? { blockNumber: blocks[body.value] } : {} }; },
  };
}
const run = (db, list, blocks) => scanOnce({ conn: db.conn, http: fakeHttp(list, blocks), masterAddress: MASTER });

test('AC1: 仅保存官方 USDT、收款地址匹配、已固化的转账', async () => {
  const db = fakeDb();
  const list = [
    mkTx(1),
    mkTx(2, { token_info: { address: 'TFakeContract000000000000000000000', decimals: 6 } }),
    mkTx(3, { to: FROM }),
    mkTx(4), // 未固化
  ];
  const r = await run(db, list, { [tid(1)]: 100, [tid(2)]: 100, [tid(3)]: 100 });
  assert.equal(r.saved, 1);
  assert.deepEqual([...db.rows.keys()], [`${tid(1)}:0`]);
  const row = db.rows.get(`${tid(1)}:0`);
  assert.equal(row.amount, 1500000);
  assert.equal(row.contract, USDT_TRC20_CONTRACT);
  assert.equal(row.block, 100);
});

test('AC2: 同一笔交易重复返回不重复入库', async () => {
  const db = fakeDb();
  const blocks = { [tid(1)]: 100 };
  await run(db, [mkTx(1)], blocks);
  await run(db, [mkTx(1), mkTx(1)], blocks);
  assert.equal(db.rows.size, 1);
});

test('AC3: 重启后从 fbs_cursor 继续，不漏不重', async () => {
  const db = fakeDb();
  const blocks = { [tid(1)]: 100, [tid(2)]: 101 };
  await run(db, [mkTx(1)], blocks);
  assert.equal(db.cursor, 100);
  // “重启”：新扫描只依赖库中游标；旧块（99）被跳过，同块与新块被处理
  const later = { ...blocks, [tid(0)]: 99, [tid(3)]: 100 };
  const r = await run(db, [mkTx(0), mkTx(1), mkTx(3), mkTx(2)], later);
  assert.equal(r.saved, 3);
  assert.equal(db.cursor, 101);
  assert.equal(db.rows.has(`${tid(0)}:0`), false);
  assert.equal(db.rows.size, 3);
});
