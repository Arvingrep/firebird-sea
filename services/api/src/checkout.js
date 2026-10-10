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
  const m = /^(\d+)(?:\.(\d{1,8}))?$/.exec(rateStr);
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

  for (let i = 0; i < MAX_RETRY; i++) {
    const out = await conn.query(`SELECT tail_cents FROM fbs_charge WHERE holds_tail=1 AND payable_micro - tail_cents * 10000 = ${base}`);
    const occupied = new Set(String(out || '').split('\n').map((s) => Number(s.trim())).filter(Boolean));
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
      if (/uq_fbs_charge_tail/.test(err.message)) continue; // 并发撞尾数：重新分配
      if (/Duplicate entry/.test(err.message)) throw new CheckoutError('ORDER_EXISTS', '订单已存在收银台');
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

// 默认汇率源：Coins.ph 买价，每次现取（rate_at = 取价时刻）。
function coinsRateSource(client, now = Date.now) {
  return async () => {
    const t = await client.getTickerPrice('USDTPHP');
    return { rate_str: String(t.raw.price), rate_at: now() };
  };
}

module.exports = { createCheckout, coinsRateSource, baseMicro, CheckoutError, RATE_MAX_AGE_MS };
