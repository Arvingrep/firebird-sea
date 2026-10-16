'use strict';

// Story 2.1 收银台：汇率快照 + 动态尾数分配（AD-5 / AD-6）。
// conn：带 query(sql) 的对象（与 migrate.js 的 cliConn 同形，返回 stdout 文本，每行一条记录）。

const TAIL_MIN = 1;
const TAIL_MAX = 90; // 尾数 0.01 ~ 0.90 USDT，共 90 个
const TAIL_UNIT_MICRO = 10000n; // 1 cent = 10000 micro
const RATE_MAX_AGE_MS = 60 * 1000;
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

// ordernum / idempotency_key 重复：返回已有收银台（幂等）。
async function findExisting(conn, ordernum, idempotencyKey, address, nowMs) {
  const byIdem = idempotencyKey === null ? '' : ` OR idempotency_key='${idempotencyKey}'`;
  const out = String(
    (await conn.query(
      `SELECT ordernum, payable_micro, rate_str, rate_at, expires_at, state FROM fbs_charge WHERE ordernum='${ordernum}'${byIdem} LIMIT 1`,
    )) || '',
  ).trim();
  if (!out) return null;
  const [on, payable, rateStr, rateAt, expiresAt, state] = out.split('\t');
  const iso = (v) => new Date(`${v.replace(' ', 'T')}Z`).toISOString();
  // 已过期 / 非 pending：尾数已释放，金额可能已分配给他人，不得返回
  if (state !== 'pending' || Date.parse(iso(expiresAt)) < nowMs) {
    throw new CheckoutError('EXPIRED', '收银台已过期，请重新下单');
  }
  return { ordernum: on, payable_micro: Number(payable), rate_str: rateStr, rate_at: iso(rateAt), expires_at: iso(expiresAt), address };
}

async function createCheckout(conn, { ordernum, phpCentavos, idempotencyKey = null, getRate, address = '', now = Date.now }) {
  if (!SAFE_ID.test(ordernum || '') || (idempotencyKey !== null && !SAFE_ID.test(idempotencyKey))) {
    throw new CheckoutError('BAD_REQUEST', 'ordernum / idempotencyKey 格式无效');
  }
  if (!Number.isSafeInteger(phpCentavos) || phpCentavos <= 0) {
    throw new CheckoutError('BAD_REQUEST', 'phpCentavos 必须为正整数');
  }

  let snap;
  try {
    snap = await getRate();
  } catch (err) {
    throw new CheckoutError('RATE_UNAVAILABLE', '汇率获取失败，请稍后再试');
  }
  const t0 = now();
  if (!snap || !(t0 - snap.rate_at <= RATE_MAX_AGE_MS)) {
    throw new CheckoutError('RATE_STALE', '汇率已过期，请稍后再试');
  }
  const base = baseMicro(phpCentavos, snap.rate_str);

  // 释放已过期订单占用的尾数
  await conn.query(
    `UPDATE fbs_charge SET state='expired', holds_tail=NULL WHERE state='pending' AND holds_tail=1 AND expires_at < '${sqlTime(t0)}'`,
  );

  const collided = new Set();
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
    const idem = idempotencyKey === null ? 'NULL' : `'${idempotencyKey}'`;
    try {
      await conn.query(
        'INSERT INTO fbs_charge (ordernum, idempotency_key, php_centavos, tail_cents, payable_micro, rate_str, rate_at, state, expires_at, holds_tail) ' +
          `VALUES ('${ordernum}', ${idem}, ${phpCentavos}, ${tail}, ${payable}, '${snap.rate_str}', '${sqlTime(snap.rate_at)}', 'pending', '${sqlTime(expiresAt)}', 1)`,
      );
    } catch (err) {
      if (/uq_fbs_charge_tail/.test(err.message)) {
        collided.add(tail); // 并发撞尾数：排除该尾数后重新分配
        continue;
      }
      if (/Duplicate entry/.test(err.message)) {
        const existing = await findExisting(conn, ordernum, idempotencyKey, address, t0);
        if (existing) return existing;
        throw new CheckoutError('ORDER_EXISTS', '订单已存在收银台');
      }
      throw err;
    }
    return {
      ordernum,
      payable_micro: Number(payable),
      rate_str: snap.rate_str,
      rate_at: new Date(snap.rate_at).toISOString(),
      expires_at: new Date(expiresAt).toISOString(),
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
