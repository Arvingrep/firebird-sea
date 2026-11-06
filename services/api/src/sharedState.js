'use strict';
// 跨副本共享状态（MariaDB，经 cliConn）。接口与进程内实现一致，调用方不感知后端。
// 所有拼进 SQL 的值均为：校验过的十六进制/整数/白名单字符，字符串另经 sqlStr 转义。
const { sqlStr } = require('./memberMap');

const nowSec = () => Math.floor(Date.now() / 1000);
const isHex64 = (s) => /^[0-9a-f]{64}$/.test(s);

// 吊销：验证路径同步读本地集合；集合每 refreshMs 从库刷新，吊销写库并立即写本地。
function createRevocationStore({ conn, refreshMs = 5000, now = nowSec }) {
  const local = new Map(); // jti -> exp
  let timer = null;

  async function refresh() {
    const out = await conn.query(`SELECT jti, exp FROM fbs_token_revoked WHERE exp > ${now()}`);
    String(out || '').split('\n').filter(Boolean).forEach((line) => {
      const [jti, exp] = line.split('\t');
      if (jti && /^[0-9a-f-]{36}$/.test(jti)) local.set(jti, Number(exp));
    });
    await conn.query(`DELETE FROM fbs_token_revoked WHERE exp <= ${now() - 60}`);
    for (const [j, e] of local) if (e <= now()) local.delete(j);
  }

  return {
    isRevoked: (jti) => local.has(jti),
    async revoke(jti, exp) {
      if (!/^[0-9a-f-]{36}$/.test(jti) || !Number.isSafeInteger(exp)) throw new Error('invalid revoke args');
      local.set(jti, exp);
      await conn.query(`INSERT IGNORE INTO fbs_token_revoked (jti, exp) VALUES (${sqlStr(jti)}, ${exp})`);
    },
    refresh,
    start() {
      refresh().catch(() => {});
      timer = setInterval(() => refresh().catch(() => {}), refreshMs);
      if (timer.unref) timer.unref();
    },
    stop() { if (timer) clearInterval(timer); },
  };
}

// initData 重放计数：每个 hash 在 ttl 内最多 max 次，跨副本一致。返回 boolean（是否允许）。
function createReplayCounter({ conn, max, ttlSeconds, now = nowSec }) {
  return async function allow(key) {
    const hash = String(key).replace(/^h:/, '');
    if (!isHex64(hash)) return false;
    const exp = now() + ttlSeconds;
    const out = await conn.query(
      `DELETE FROM fbs_replay WHERE expires_at <= ${now()};` +
      `INSERT INTO fbs_replay (hash, cnt, expires_at) VALUES ('${hash}', 1, ${exp}) ON DUPLICATE KEY UPDATE cnt = cnt + 1;` +
      `SELECT cnt FROM fbs_replay WHERE hash = '${hash}'`
    );
    return Number(String(out).trim().split('\n').pop()) <= max;
  };
}

// 幂等：先占位（begin），成功后 finish，失败 abort。返回 {status:'new'|'pending'|'done', body?}
function createIdempotencyStore({ conn, ttlSeconds = 600, now = nowSec }) {
  return {
    async begin(key) {
      const k = sqlStr(key);
      const exp = now() + ttlSeconds;
      await conn.query(`DELETE FROM fbs_idem WHERE idem_key = ${k} AND expires_at <= ${now()}`);
      const out = await conn.query(`INSERT IGNORE INTO fbs_idem (idem_key, state, expires_at) VALUES (${k}, 'pending', ${exp}); SELECT ROW_COUNT()`);
      if (Number(String(out).trim().split('\n').pop()) === 1) return { status: 'new' };
      const row = await conn.query(`SELECT state, response FROM fbs_idem WHERE idem_key = ${k} LIMIT 1`);
      const [state, response] = String(row || '').split('\n')[0].split('\t');
      if (state === 'done' && response) {
        try { return { status: 'done', body: JSON.parse(response) }; } catch (e) { return { status: 'pending' }; }
      }
      return { status: 'pending' };
    },
    async finish(key, body) {
      await conn.query(`UPDATE fbs_idem SET state = 'done', response = ${sqlStr(JSON.stringify(body))} WHERE idem_key = ${sqlStr(key)}`);
    },
    async abort(key) {
      await conn.query(`DELETE FROM fbs_idem WHERE idem_key = ${sqlStr(key)}`);
    },
  };
}

// 进程内实现（无库配置时的回退，仅单副本语义）
function createMemoryIdempotencyStore({ ttlSeconds = 600, now = () => Date.now() } = {}) {
  const m = new Map();
  return {
    async begin(key) {
      const e = m.get(key);
      if (e && now() - e.at <= ttlSeconds * 1000) return e.state === 'done' ? { status: 'done', body: e.body } : { status: 'pending' };
      m.set(key, { at: now(), state: 'pending' });
      return { status: 'new' };
    },
    async finish(key, body) { m.set(key, { at: now(), state: 'done', body }); },
    async abort(key) { m.delete(key); },
  };
}

module.exports = { createRevocationStore, createReplayCounter, createIdempotencyStore, createMemoryIdempotencyStore };
