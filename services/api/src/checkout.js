'use strict';

// Story 2.1 收银台：汇率快照 + 动态尾数分配（AD-5 / AD-6）。
// conn：带 query(sql) 的对象（与 migrate.js 的 cliConn 同形，返回 stdout 文本，每行一条记录）。

const TAIL_MIN = 1;
const TAIL_MAX = 90; // 尾数 0.01 ~ 0.90 USDT，共 90 个
const TAIL_UNIT_MICRO = 10000n; // 1 cent = 10000 micro
const RATE_MAX_AGE_MS = 60 * 1000;
const RATE_FUTURE_TOLERANCE_MS = 1000; // rate_at 不得晚于当前时间（容差 1s，QA 第 5 轮 minor）
const WINDOW_MS = 15 * 60 * 1000;
const MAX_RETRY = 5;
const SAFE_ID = /^[A-Za-z0-9_-]{1,64}$/;

class CheckoutError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function sqlTime(ms) {
  return new Date(ms).toISOString().slice(0, 19).replace('T', ' ');
}

// 响应中的 rate_at / expires_at 统一为落库精度（秒），幂等返回与首次返回一致（QA 第 4 轮 minor）。
function dbIso(ms) {
  return new Date(ms).toISOString().slice(0, 19) + 'Z';
}

// base = ceil(php_centavos * 1e4 / rate)（1 centavo = 0.01 PHP；1 USDT = 1e6 micro），全程整数运算。
function baseMicro(phpCentavos, rateStr) {
  const m = /^(\d+)(?:\.(\d{1,18}))?$/.exec(rateStr);
  const num = m && BigInt(m[1] + (m[2] || ''));
  if (!num || num <= 0n) throw new CheckoutError('RATE_INVALID', '汇率无效');
  const scale = 10n ** BigInt((m[2] || '').length);
  const n = BigInt(phpCentavos) * 10000n * scale;
  return (n + num - 1n) / num;
}

function pickTail(occupied) {
  const free = [];
  for (let t = TAIL_MIN; t <= TAIL_MAX; t++) if (!occupied.has(t)) free.push(t);
  if (!free.length) throw new CheckoutError('TAIL_EXHAUSTED', '当前支付繁忙，请稍后再试');
  return free[Math.floor(Math.random() * free.length)];
}

const SELECT_COLS = 'id, ordernum, payable_micro, rate_str, rate_at, expires_at, state';

function parseRow(out) {
  const line = String(out || '').trim().split('\n')[0];
  if (!line) return null;
  const [id, on, payable, rateStr, rateAt, expiresAt, state] = line.split('\t');
  return { id, ordernum: on, payable_micro: Number(payable), rate_str: rateStr, rate_at: rateAt, expires_at: expiresAt, state };
}

// 命中已有收银台：pending 且未过期 → 幂等返回；否则（过期 / 非 pending）复用该行重新分配（QA 第 4 轮 major 1）。
// 行内判定统一用秒精度（与落库一致）。
function rowUsable(row, nowSec) {
  return row.state === 'pending' && Date.parse(row.expires_at.replace(' ', 'T') + 'Z') / 1000 > nowSec;
}

// 复用旧行只允许 pending（已超时）/ expired；matched/void 等资金终态不得覆盖。
function rowReusable(row) {
  return row.state === 'pending' || row.state === 'expired';
}

function rowToData(row, address) {
  return {
    ordernum: row.ordernum,
    payable_micro: row.payable_micro,
    rate_str: row.rate_str,
    rate_at: row.rate_at.replace(' ', 'T') + 'Z',
    expires_at: row.expires_at.replace(' ', 'T') + 'Z',
    address,
  };
}

async function findExisting(conn, ordernum, idempotencyKey) {
  const byIdem = idempotencyKey === null ? '' : ` OR idempotency_key='${idempotencyKey}'`;
  const out = await conn.query(
    `SELECT ${SELECT_COLS} FROM fbs_charge WHERE ordernum='${ordernum}'${byIdem} LIMIT 1`,
  );
  const row = parseRow(out);
  // 命中行必须属于本次 ordernum：idempotencyKey 撞到别的订单时不得返回他人收银台（QA 第 5 轮 major 2）
  if (row && row.ordernum !== ordernum) {
    throw new CheckoutError('ORDER_EXISTS', '幂等键已绑定其他订单');
  }
  return row;
}

async function createCheckout(conn, { ordernum, serverCentavos, buyerMemberId, idempotencyKey = null, getRate, address = '', now = Date.now }) {
  if (!SAFE_ID.test(ordernum || '') || (idempotencyKey !== null && !SAFE_ID.test(idempotencyKey))) {
    throw new CheckoutError('BAD_REQUEST', 'ordernum / idempotencyKey 格式无效');
  }
  // 金额只接受服务端读数（pay_log × 100 的整数 centavos），不接受客户端提交（QA 第 2/4 轮 major）。
  if (!Number.isSafeInteger(serverCentavos) || serverCentavos <= 0) {
    throw new CheckoutError('BAD_REQUEST', '订单金额无效');
  }
  const centavos = serverCentavos;
  const idem = idempotencyKey === null ? 'NULL' : `'${idempotencyKey}'`;

  // 幂等先于取价（QA 第 4 轮 minor 2）：已有可用收银台时，汇率失败也照常返回。
  const t0 = now();
  const nowSec = Math.floor(t0 / 1000);
  let existing = await findExisting(conn, ordernum, idempotencyKey);
  if (existing && rowUsable(existing, nowSec)) return rowToData(existing, address);
  if (existing && !rowReusable(existing)) throw new CheckoutError('ORDER_EXISTS', '该订单已有收银台记录，状态不允许重建');

  let snap;
  try {
    snap = await getRate();
  } catch (err) {
    throw new CheckoutError('RATE_UNAVAILABLE', '汇率获取失败，请稍后再试');
  }
  if (!snap || typeof snap.rate_at !== 'number' || snap.rate_at > t0 + RATE_FUTURE_TOLERANCE_MS || t0 - snap.rate_at > RATE_MAX_AGE_MS) {
    throw new CheckoutError('RATE_STALE', '汇率已过期，请稍后再试');
  }
  const base = baseMicro(centavos, snap.rate_str);

  const collided = new Set();
  // 取尾数前释放已过期未支付的占用，否则 holds_tail 会累积到 90 个后全部误报 TAIL_EXHAUSTED（QA 第 5 轮 major 1）
  await conn.query(
    `UPDATE fbs_charge SET state='expired', holds_tail=0 WHERE state='pending' AND holds_tail=1 AND expires_at <= '${sqlTime(t0)}'`,
  );
  for (let i = 0; i < MAX_RETRY; i++) {
    // 按 payable_micro 区间取占用（不同基础金额也可能算出相同 payable_micro）
    const lo = base + TAIL_UNIT_MICRO * BigInt(TAIL_MIN);
    const hi = base + TAIL_UNIT_MICRO * BigInt(TAIL_MAX);
    const out = await conn.query(`SELECT payable_micro FROM fbs_charge WHERE holds_tail=1 AND payable_micro BETWEEN ${lo} AND ${hi}`);
    const occupied = new Set(collided);
    for (const line of String(out || '').split('\n')) {
      if (!/^\d+$/.test(line.trim())) continue;
      const d = BigInt(line.trim()) - base;
      if (d % TAIL_UNIT_MICRO === 0n) occupied.add(Number(d / TAIL_UNIT_MICRO));
    }
    const tail = pickTail(occupied);
    const payable = base + BigInt(tail) * TAIL_UNIT_MICRO;
    const expiresAt = t0 + WINDOW_MS;
    const rateAtSql = sqlTime(snap.rate_at);
    const expiresSql = sqlTime(expiresAt);
    const fields = `php_centavos=${centavos}, tail_cents=${tail}, payable_micro=${payable}, rate_str='${snap.rate_str}', rate_at='${rateAtSql}', expires_at='${expiresSql}', state='pending', holds_tail=1, idempotency_key=${idem}`;
    const insertSql =
      'INSERT INTO fbs_charge (ordernum, idempotency_key, php_centavos, tail_cents, payable_micro, rate_str, rate_at, state, expires_at, holds_tail) ' +
      `VALUES ('${ordernum}', ${idem}, ${centavos}, ${tail}, ${payable}, '${snap.rate_str}', '${rateAtSql}', 'pending', '${expiresSql}', 1)`;
    try {
      if (existing) {
        // 过期 / 非 pending 旧行：事务内锁行复用（major 1 修复）。并发下另一请求若已续期，重读后走幂等返回。
        await conn.query('BEGIN');
        try {
          const nowSec2 = Math.floor(now() / 1000);
          const fresh = parseRow(String(await conn.query(`SELECT ${SELECT_COLS} FROM fbs_charge WHERE id='${existing.id}' FOR UPDATE`)));
          if (fresh && !rowReusable(fresh)) {
            await conn.query('COMMIT');
            throw new CheckoutError('ORDER_EXISTS', '该订单已有收银台记录，状态不允许重建');
          }
          if (fresh && rowUsable(fresh, nowSec2)) {
            await conn.query('COMMIT');
            return rowToData(fresh, address);
          }
          await conn.query(`UPDATE fbs_charge SET ${fields} WHERE id='${existing.id}'`);
          await conn.query('COMMIT');
        } catch (txErr) {
          await conn.query('ROLLBACK').catch(() => {});
          throw txErr;
        }
        return rowToData({ ...existing, payable_micro: Number(payable), rate_str: snap.rate_str, rate_at: rateAtSql, expires_at: expiresSql, state: 'pending' }, address);
      }
      await conn.query(insertSql);
    } catch (err) {
      if (/uq_fbs_charge_tail/.test(err.message)) {
        collided.add(tail); // 并发撞尾数：排除该尾数后重新分配
        continue;
      }
      if (/Duplicate entry/.test(err.message)) {
        const again = await findExisting(conn, ordernum, idempotencyKey);
        if (again && rowUsable(again, Math.floor(now() / 1000))) return rowToData(again, address);
        if (again && rowReusable(again)) {
          existing = again; // 并发写入的旧行已过期：下一轮循环复用续期
          continue;
        }
        throw new CheckoutError('ORDER_EXISTS', '订单已存在收银台');
      }
      throw err;
    }
    return {
      ordernum,
      payable_micro: Number(payable),
      rate_str: snap.rate_str,
      rate_at: dbIso(snap.rate_at),
      expires_at: dbIso(expiresAt),
      address,
    };
  }
  throw new CheckoutError('TAIL_EXHAUSTED', '当前支付繁忙，请稍后再试');
}

// 默认汇率源：Coins.ph 买价（depth 最高 bid），每次现取（rate_at = 取价时刻）。
function coinsRateSource(client, now = Date.now) {
  return async () => {
    const book = await client.getOrderBook('USDTPHP', 5);
    const bid = book.bids && book.bids[0];
    if (!bid || !(bid.price > 0)) throw new Error('empty order book');
    return { rate_str: bid.priceStr || String(bid.price), rate_at: now() };
  };
}

module.exports = { createCheckout, coinsRateSource, baseMicro, CheckoutError, RATE_MAX_AGE_MS };
