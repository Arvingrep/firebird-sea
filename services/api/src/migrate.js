'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');
const RECORD_TABLE_SQL =
  'CREATE TABLE IF NOT EXISTS fbs_migrations (name VARCHAR(128) NOT NULL PRIMARY KEY, ' +
  'applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4';

function loadMigrations(dir = MIGRATIONS_DIR) {
  return fs
    .readdirSync(dir)
    .filter((f) => /^\d+_.*\.sql$/.test(f))
    .sort()
    .map((f) => ({ name: f, sql: fs.readFileSync(path.join(dir, f), 'utf8') }));
}

// conn: 任何带 query(sql) 的对象，返回客户端 stdout 文本（每行一条记录）。
// 每个迁移文件按文件名只执行一次（记录在 fbs_migrations）；文件内 DDL 亦为 IF NOT EXISTS。
async function migrate(conn, dir) {
  await conn.query(RECORD_TABLE_SQL);
  const out = await conn.query('SELECT name FROM fbs_migrations');
  const applied = new Set(String(out || '').split('\n').map((s) => s.trim()).filter(Boolean));
  const ran = [];
  for (const m of loadMigrations(dir)) {
    if (applied.has(m.name)) continue;
    await conn.query(m.sql);
    await conn.query(`INSERT INTO fbs_migrations (name) VALUES ('${m.name.replace(/'/g, "''")}')`);
    ran.push(m.name);
  }
  return ran;
}

// 零依赖：通过 mariadb/mysql 命令行客户端执行 SQL（stdin 传入，密码走 MYSQL_PWD 环境变量）。
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

if (require.main === module) {
  migrate(cliConn()).then(
    (ran) => process.stdout.write(`migrated: ${ran.length ? ran.join(', ') : 'nothing to do'}\n`),
    (err) => {
      process.stderr.write(`migrate failed: ${err.message}\n`);
      process.exit(1);
    },
  );
}

module.exports = { loadMigrations, migrate, cliConn };
