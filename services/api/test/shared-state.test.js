const test = require('node:test');
const assert = require('node:assert');
const { createRevocationStore, createReplayCounter, createIdempotencyStore, createMemoryIdempotencyStore } = require('../src/sharedState');
const { createTokenService } = require('../src/tmaToken');
const { createFbProxy } = require('../src/fbProxy');

// 一个极简的"共享库"替身：多个 store 实例共用同一份数据，模拟多副本
function sharedDb() {
  const revoked = new Map(); const idem = new Map(); const replay = new Map();
  return {
    revoked, idem, replay,
    conn: {
      async query(sql) {
        let m;
        if (/^SELECT jti, exp FROM fbs_token_revoked/.test(sql)) return [...revoked].map(([j, e]) => `${j}\t${e}`).join('\n');
        if (/^DELETE FROM fbs_token_revoked/.test(sql)) return '';
        if ((m = /^INSERT IGNORE INTO fbs_token_revoked \(jti, exp\) VALUES \('([^']+)', (\d+)\)/.exec(sql))) { revoked.set(m[1], Number(m[2])); return ''; }
        if (/FROM fbs_replay WHERE hash/.test(sql)) {
          const h = /INSERT INTO fbs_replay \(hash, cnt, expires_at\) VALUES \('([0-9a-f]{64})'/.exec(sql)[1];
          replay.set(h, (replay.get(h) || 0) + 1);
          return String(replay.get(h));
        }
        if ((m = /^DELETE FROM fbs_idem WHERE idem_key = '([^']+)' AND expires_at/.exec(sql))) return '';
        if ((m = /^INSERT IGNORE INTO fbs_idem \(idem_key, state, expires_at\) VALUES \('([^']+)'/.exec(sql))) {
          if (idem.has(m[1])) return '0';
          idem.set(m[1], { state: 'pending' }); return '1';
        }
        if ((m = /^SELECT state, response FROM fbs_idem WHERE idem_key = '([^']+)'/.exec(sql))) {
          const e = idem.get(m[1]); return e ? `${e.state}\t${e.response || ''}` : '';
        }
        if ((m = /^UPDATE fbs_idem SET state = 'done', response = '(.*)' WHERE idem_key = '([^']+)'/s.exec(sql))) {
          idem.set(m[2], { state: 'done', response: m[1].replace(/''/g, "'") }); return '';
        }
        if ((m = /^DELETE FROM fbs_idem WHERE idem_key = '([^']+)'$/.exec(sql))) { idem.delete(m[1]); return ''; }
        throw new Error(`unexpected sql: ${sql}`);
      },
    },
  };
}

test('吊销跨副本生效：副本 A 登出，副本 B 刷新后拒绝该令牌', async () => {
  const db = sharedDb();
  const a = createTokenService({ secret: 'shared-secret-0123456', env: 'canary', revocation: createRevocationStore({ conn: db.conn }) });
  const revB = createRevocationStore({ conn: db.conn });
  const b = createTokenService({ secret: 'shared-secret-0123456', env: 'canary', revocation: revB });
  const { token } = a.issue({ tgId: 1, memberId: 2 });
  assert.strictEqual(b.verify(token).valid, true);
  assert.strictEqual(await a.revokeAsync(token), true);
  assert.strictEqual(b.verify(token).valid, true); // 尚未刷新
  await revB.refresh();
  assert.strictEqual(b.verify(token).error, 'revoked');
});

test('重放计数跨副本一致，且拒绝非法 hash', async () => {
  const db = sharedDb();
  const a = createReplayCounter({ conn: db.conn, max: 2, ttlSeconds: 3600 });
  const b = createReplayCounter({ conn: db.conn, max: 2, ttlSeconds: 3600 });
  const h = `h:${'a'.repeat(64)}`;
  assert.strictEqual(await a(h), true);
  assert.strictEqual(await b(h), true);
  assert.strictEqual(await a(h), false);
  assert.strictEqual(await a("h:x'; DROP TABLE fbs_replay;--"), false);
});

test('幂等占位：并发第二个请求得到 pending(409)，完成后重复请求回放首次结果', async () => {
  const db = sharedDb();
  const store = createIdempotencyStore({ conn: db.conn });
  const tokens = createTokenService({ secret: 'shared-secret-0123456', env: 'canary' });
  const { token } = tokens.issue({ tgId: 1, memberId: 5 });
  let release; const gate = new Promise((r) => { release = r; });
  let upstream = 0;
  const fetchImpl = async () => { upstream += 1; await gate; return { json: async () => ({ state: 100, info: { ordernum: 'O1' } }) }; };
  const p = createFbProxy({ upstreamBase: 'http://x', fetchImpl, tokens, idempotencyStore: store, credentialProvider: async () => 'c=1',
    whitelist: { 'waimai:deal': { auth: 'member', idempotent: true } } });
  const req = { service: 'waimai', action: 'deal', method: 'POST', body: {}, headers: { authorization: `Bearer ${token}`, 'idempotency-key': 'key-abcdefgh' } };
  const first = p.handle(req);
  await new Promise((r) => setTimeout(r, 5));
  const second = await p.handle(req);
  assert.strictEqual(second.status, 409);
  release();
  assert.strictEqual((await first).status, 200);
  const third = await p.handle(req);
  assert.strictEqual(third.replayed, true);
  assert.strictEqual(upstream, 1);
});

test('上游业务失败(state!=100)释放占位，同键可重试；网络超时结果未知，保留占位', async () => {
  const tokens = createTokenService({ secret: 'shared-secret-0123456', env: 'canary' });
  const { token } = tokens.issue({ tgId: 1, memberId: 5 });
  const rules = { 'waimai:deal': { auth: 'member', idempotent: true } };
  const req = (key) => ({ service: 'waimai', action: 'deal', method: 'POST', body: {}, headers: { authorization: `Bearer ${token}`, 'idempotency-key': key } });

  // 业务失败 → 释放 → 重试成功
  const results = [{ state: 101, info: 'busy' }, { state: 100 }];
  let n = 0;
  const p1 = createFbProxy({ upstreamBase: 'http://x', tokens, idempotencyStore: createMemoryIdempotencyStore(), credentialProvider: async () => 'c=1',
    fetchImpl: async () => ({ json: async () => results[n++] }), whitelist: rules });
  assert.strictEqual((await p1.handle(req('key-retry-1234'))).body.state, 101);
  assert.strictEqual((await p1.handle(req('key-retry-1234'))).body.state, 100);

  // 网络异常 → 504，占位保留 → 同键 409，上游只被调用一次
  let calls = 0;
  const p2 = createFbProxy({ upstreamBase: 'http://x', tokens, idempotencyStore: createMemoryIdempotencyStore(), credentialProvider: async () => 'c=1',
    fetchImpl: async () => { calls += 1; throw new Error('down'); }, whitelist: rules });
  assert.strictEqual((await p2.handle(req('key-down-12345'))).status, 504);
  assert.strictEqual((await p2.handle(req('key-down-12345'))).status, 409);
  assert.strictEqual(calls, 1);
});
