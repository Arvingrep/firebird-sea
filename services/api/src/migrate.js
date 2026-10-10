'use strict';

const fs = require('node:fs');
const path = require('node:path');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

function splitStatements(sql) {
  return sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
}

function loadMigrations(dir = MIGRATIONS_DIR) {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .map((f) => ({ name: f, statements: splitStatements(fs.readFileSync(path.join(dir, f), 'utf8')) }));
}

// conn: 任何带 query(sql) 的对象（mysql2/promise 连接或测试替身）。
// 所有语句均为 CREATE TABLE IF NOT EXISTS，重复执行不报错、不改动已有数据。
async function migrate(conn, dir) {
  let count = 0;
  for (const m of loadMigrations(dir)) {
    for (const stmt of m.statements) {
      await conn.query(stmt);
      count += 1;
    }
  }
  return count;
}

async function main() {
  // mysql2 待 Zero-Dep 人工批准（见 docs/internal/DB_MIGRATIONS.md），仅在 CLI 运行时加载
  const mysql = require('mysql2/promise');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  try {
    await migrate(conn);
  } finally {
    await conn.end();
  }
}

if (require.main === module) {
  main().catch((err) => {
    process.stderr.write(`migrate failed: ${err.message}\n`);
    process.exit(1);
  });
}

module.exports = { splitStatements, loadMigrations, migrate };
