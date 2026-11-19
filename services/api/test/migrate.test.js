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
  assert.deepEqual(await migrate(conn), [
    '001_fbs_tables.sql', '002_tma_shared_state.sql', '003_addr_share.sql',
    '004_fbs_courier_map.sql', '005_fbs_dispatch_dedup.sql', '006_fbs_dispatch_dedup_courier.sql',
    '007_fbs_bind_audit.sql', '008_fbs_dispatch_dedup_created_idx.sql',
    '009_fbs_merchant_map.sql', '010_fbs_merchant_audit.sql',
  ]);
  const sql = conn.executed.join('\n');
  for (const t of [...TABLES, 'fbs_token_revoked', 'fbs_idem', 'fbs_replay', 'fbs_addr_share',
    'fbs_courier_map', 'fbs_bind_audit', 'fbs_dispatch_dedup',
    'fbs_merchant_map', 'fbs_merchant_audit']) assert.match(sql, new RegExp(`CREATE TABLE IF NOT EXISTS ${t} \\(`), `missing ${t}`);
});

// 商家线（009/010）：映射表一对一硬约束 + 独立审计表（不复用骑手表，列名走 member_id 语义）
test('AC1: fbs_merchant_map 一对一（tg 主键 + member 唯一），fbs_merchant_audit 具备三维度限频索引', () => {
  const sql = allSql();
  assert.match(sql, /CREATE TABLE IF NOT EXISTS fbs_merchant_map \(\s*tg_user_id VARCHAR\(32\) NOT NULL PRIMARY KEY,\s*member_id BIGINT NOT NULL/,
    'fbs_merchant_map 必须是 tg_user_id 主键 + member_id 列');
  assert.match(sql, /UNIQUE KEY uq_fbs_merchant_map_member \(member_id\)/,
    'member_id 必须唯一：一个商家号只能被一个 TG 占用');
  assert.doesNotMatch(sql.slice(sql.indexOf('CREATE TABLE IF NOT EXISTS fbs_merchant_map ('),
    sql.indexOf('ENGINE=InnoDB', sql.indexOf('CREATE TABLE IF NOT EXISTS fbs_merchant_map ('))), /shop_id/,
  'fbs_merchant_map 的列里不带 shop_id：一人多店由 /wmsj 页面切换');
  assert.match(sql, /CREATE TABLE IF NOT EXISTS fbs_merchant_audit \(/);
  assert.match(sql, /member_id BIGINT NOT NULL DEFAULT 0/);
  assert.match(sql, /KEY idx_fbs_merchant_audit_tg \(tg_user_id, created_at\)/);
  assert.match(sql, /KEY idx_fbs_merchant_audit_phone \(phone, created_at\)/);
  assert.match(sql, /result 取值：success \/ conflict_tg \/ conflict_merchant \/ not_found \/ no_shop/,
    'result 取值域必须写在迁移注释里（Ops 按手机号排查的依据）');
});

// B1 补偿控制：审计表要能按 tg_user_id / phone 双维度限频（各有索引）
test('AC1: fbs_bind_audit 具备双维度限频所需索引与 result 取值域注释', () => {
  const sql = allSql();
  assert.match(sql, /KEY idx_fbs_bind_audit_tg \(tg_user_id, created_at\)/);
  assert.match(sql, /KEY idx_fbs_bind_audit_phone \(phone, created_at\)/);
  assert.match(sql, /result 取值：success \/ conflict_tg \/ conflict_courier \/ not_found \/ rate_limited/);
});

// T7 去重表：主键三元组（改派给第二位骑手不被吞）+ created_at 索引（TTL 清理不全表扫）
test('AC1: fbs_dispatch_dedup 主键为 (event, order_id, courier_id)，且有 created_at 索引', () => {
  const sql = allSql();
  assert.match(sql, /PRIMARY KEY \(event, order_id\)/);
  assert.match(sql, /PRIMARY KEY \(event, order_id, courier_id\)/);
  assert.match(sql, /ADD KEY idx_fbs_dispatch_dedup_created \(created_at\)/);
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
  // 只匹配语句起始的破坏性/DML 关键字，避免误伤列定义里的 `ON UPDATE CURRENT_TIMESTAMP`
  assert.doesNotMatch(allSql(), /^\s*(DROP|TRUNCATE|DELETE|INSERT|UPDATE)\b/im);
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
