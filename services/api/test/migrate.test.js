'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadMigrations, migrate, cliConn } = require('../src/migrate');

const TABLES = [
  'fbs_charge', 'fbs_chain_tx', 'fbs_cursor', 'fbs_refund', 'fbs_audit',
  'fbs_role', 'fbs_member_map', 'fbs_draft_item', 'fbs_i18n', 'fbs_outbox',
];

function allSql() {
  return loadMigrations().map((m) => m.sql).join('\n');
}

// 替身：记录已应用迁移，模拟 fbs_migrations 行为
function fakeConn() {
  const applied = [];
  const executed = [];
  return {
    executed,
    async query(sql) {
      executed.push(sql);
      if (sql.startsWith('SELECT name FROM fbs_migrations')) return applied.join('\n');
      const m = /^INSERT INTO fbs_migrations \(name\) VALUES \('(.+)'\)$/.exec(sql);
      if (m) applied.push(m[1]);
      return '';
    },
  };
}

// AC1: 空库迁移创建 AD-5 全部表及关键约束（SQL 文本层；真实库见集成测试）
test('AC1: migration creates all AD-5 tables', async () => {
  const conn = fakeConn();
  assert.deepEqual(await migrate(conn), ['001_fbs_tables.sql']);
  const sql = conn.executed.join('\n');
  for (const t of TABLES) assert.match(sql, new RegExp(`CREATE TABLE IF NOT EXISTS ${t} \\(`), `missing ${t}`);
});

test('AC1: chain_tx unique (txid,event_index); charge holds_tail + tail unique; role shop_id not null', () => {
  const sql = allSql();
  assert.match(sql, /UNIQUE KEY \w+ \(txid, event_index\)/);
  assert.match(sql, /holds_tail TINYINT NULL/);
  assert.match(sql, /tail_key BIGINT AS \(IF\(holds_tail = 1, payable_micro, NULL\)\) STORED/);
  assert.match(sql, /UNIQUE KEY \w+ \(tail_key\)/);
  assert.match(sql, /shop_id BIGINT NOT NULL DEFAULT 0/);
});

// AC2: 重复执行不报错、不改动数据
test('AC2: second run applies nothing; migration has no destructive/DML statements', async () => {
  const conn = fakeConn();
  await migrate(conn);
  const before = conn.executed.length;
  assert.deepEqual(await migrate(conn), []);
  assert.equal(conn.executed.length - before, 2); // 仅建记录表 + 查询已应用列表
  assert.doesNotMatch(allSql(), /\b(DROP|TRUNCATE|DELETE|INSERT|UPDATE)\b/i);
});

// AC3: 零依赖 —— 不使用 mysql2，决定记录在文档
test('AC3: no mysql2 dependency; decision documented', () => {
  const pkg = require('../package.json');
  assert.equal(pkg.dependencies.mysql2, undefined);
  assert.doesNotMatch(fs.readFileSync(path.join(__dirname, '..', 'src', 'migrate.js'), 'utf8'), /require\('mysql2/);
  const doc = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'docs', 'internal', 'DB_MIGRATIONS.md'), 'utf8');
  assert.match(doc, /mysql2/);
  assert.match(doc, /Zero-Dep/);
});

// 真实 MariaDB 集成测试：需 DB_HOST/DB_USER/DB_NAME（CI 用 service 容器），缺省跳过
const REAL = process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME;

test('integration: real MariaDB migrate twice keeps data, constraints enforced', { skip: !REAL }, async () => {
  const conn = cliConn();
  await migrate(conn);
  await conn.query("INSERT INTO fbs_cursor (name, block_number) VALUES ('mig_test', 7) ON DUPLICATE KEY UPDATE block_number = 7");
  assert.deepEqual(await migrate(conn), []);
  assert.equal((await conn.query("SELECT block_number FROM fbs_cursor WHERE name = 'mig_test'")).trim(), '7');

  const tx = (id) => `INSERT INTO fbs_chain_tx (txid, event_index, from_address, to_address, contract, amount_micro, block_number, block_time) VALUES ('${id}', 0, 'a', 'b', 'c', 1, 1, NOW())`;
  const charge = (n, hold) => `INSERT INTO fbs_charge (ordernum, php_centavos, tail_cents, payable_micro, rate_str, rate_at, expires_at, holds_tail) VALUES ('${n}', 100, 1, 424242, '58', NOW(), NOW(), ${hold})`;
  try {
    await conn.query(tx('mig_test_tx'));
    await assert.rejects(conn.query(tx('mig_test_tx')), /Duplicate/i);
    await conn.query(charge('mig_test_o1', 1));
    await assert.rejects(conn.query(charge('mig_test_o2', 1)), /Duplicate/i);
    await conn.query(charge('mig_test_o3', 'NULL'));
  } finally {
    await conn.query("DELETE FROM fbs_chain_tx WHERE txid = 'mig_test_tx'; DELETE FROM fbs_charge WHERE ordernum LIKE 'mig_test_%'; DELETE FROM fbs_cursor WHERE name = 'mig_test'");
  }
});
