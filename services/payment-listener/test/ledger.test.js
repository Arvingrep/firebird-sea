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
      if (sql.startsWith('SELECT txid FROM fbs_chain_tx')) {
        return [...rows.values()].map((r) => r.txid).filter((t) => sql.includes(`'${t}'`)).join('\n');
      }
      if (sql.startsWith('INSERT INTO fbs_chain_tx') && sql.endsWith('ON DUPLICATE KEY UPDATE txid=txid')) {
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

test('已入库的 txid 不再查询 solidity 节点', async () => {
  const db = fakeDb();
  let posts = 0;
  const http = {
    async get() { return { data: { data: [mkTx(1)] } }; },
    async post() { posts += 1; return { data: { blockNumber: 100 } }; },
  };
  await scanOnce({ conn: db.conn, http, masterAddress: MASTER });
  await scanOnce({ conn: db.conn, http, masterAddress: MASTER });
  assert.equal(posts, 1);
});

test('翻页：一轮新增超过一页时不漏旧的那部分', async () => {
  const db = fakeDb();
  const pages = [
    { data: [mkTx(2)], meta: { fingerprint: 'p2' } },
    { data: [mkTx(1)] },
  ];
  const http = {
    async get(url) { return { data: url.includes('fingerprint=p2') ? pages[1] : pages[0] }; },
    async post(_u, body) { return { data: { blockNumber: body.value === tid(1) ? 100 : 101 } }; },
  };
  const r = await scanOnce({ conn: db.conn, http, masterAddress: MASTER });
  assert.equal(r.saved, 2);
  assert.equal(db.rows.size, 2);
});

test('AC3: 重启后从 fbs_cursor 继续，不漏不重', async () => {
  const db = fakeDb();
  const blocks = { [tid(1)]: 100, [tid(2)]: 101 };
  await run(db, [mkTx(1)], blocks);
  assert.equal(db.cursor, 100);
  // “重启”：游标只前进不回退；块号低于游标但未入库的 tx0（99）也必须入库，已在库的 tx1 不重复
  const later = { ...blocks, [tid(0)]: 99, [tid(3)]: 100 };
  const r = await run(db, [mkTx(0), mkTx(1), mkTx(3), mkTx(2)], later);
  assert.equal(r.saved, 3); // tx1 已在库，跳过；tx0、tx3、tx2 新入库
  assert.equal(db.cursor, 101);
  assert.equal(db.rows.has(`${tid(0)}:0`), true);
  assert.equal(db.rows.size, 4);
});
