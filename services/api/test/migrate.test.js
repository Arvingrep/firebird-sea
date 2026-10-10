'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadMigrations, migrate } = require('../src/migrate');

const TABLES = [
  'fbs_charge', 'fbs_chain_tx', 'fbs_cursor', 'fbs_refund', 'fbs_audit',
  'fbs_role', 'fbs_member_map', 'fbs_draft_item', 'fbs_i18n', 'fbs_outbox',
];

function allSql() {
  return loadMigrations().flatMap((m) => m.statements);
}

function tableSql(name) {
  return allSql().find((s) => new RegExp(`CREATE TABLE IF NOT EXISTS ${name}\\b`).test(s));
}

// AC1: 空库迁移创建 AD-5 全部表及关键约束
test('AC1: creates all AD-5 tables from empty database', async () => {
  const executed = [];
  await migrate({ query: async (s) => executed.push(s) });
  for (const t of TABLES) {
    assert.ok(executed.some((s) => s.startsWith(`CREATE TABLE IF NOT EXISTS ${t} `)), `missing ${t}`);
  }
  assert.equal(executed.length, TABLES.length);
});

test('AC1: fbs_chain_tx unique on (txid, event_index)', () => {
  assert.match(tableSql('fbs_chain_tx'), /UNIQUE KEY \w+ \(txid, event_index\)/);
});

test('AC1: fbs_charge has holds_tail and partial unique on payable_micro', () => {
  const sql = tableSql('fbs_charge');
  assert.match(sql, /holds_tail TINYINT NULL/);
  assert.match(sql, /tail_key BIGINT AS \(IF\(holds_tail = 1, payable_micro, NULL\)\) STORED/);
  assert.match(sql, /UNIQUE KEY \w+ \(tail_key\)/);
});

// AC2: 重复执行不报错、不改动数据 —— 所有 DDL 幂等且无 DML / DROP
test('AC2: every statement is idempotent DDL (no DROP/ALTER/DML)', () => {
  for (const s of allSql()) {
    assert.match(s, /^CREATE TABLE IF NOT EXISTS /);
    assert.doesNotMatch(s, /\b(DROP|TRUNCATE|DELETE|INSERT)\b/i);
  }
});

test('AC2: running migrate twice succeeds on an idempotent fake db', async () => {
  const tables = new Set();
  const conn = {
    query: async (s) => {
      tables.add(/IF NOT EXISTS (\w+)/.exec(s)[1]);
    },
  };
  await migrate(conn);
  await migrate(conn);
  assert.equal(tables.size, TABLES.length);
});

// AC3: mysql2 依赖记录在文档，且未擅自写入 package.json
test('AC3: mysql2 approval is documented and not added to package.json', () => {
  const doc = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'docs', 'internal', 'DB_MIGRATIONS.md'), 'utf8');
  assert.match(doc, /mysql2/);
  assert.match(doc, /Zero-Dep/);
  const pkg = require('../package.json');
  assert.equal(pkg.dependencies.mysql2, undefined);
});
