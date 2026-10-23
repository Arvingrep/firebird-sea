'use strict';

// Story 2.1 收银台路由（从 server.js 抽出，供路由层测试直接挂载；server.js 只做装配）。
// 金额与归属一律服务端读取（pay_log + fbs_member_map），客户端不提交金额（QA 第 2/4 轮 major）。

const { createCheckout, coinsRateSource, CheckoutError } = require('./checkout');
const { readPayOrder, assertOwnership, OrderReadError } = require('./payOrderRead');

const CHECKOUT_LIMIT = 5;
const CHECKOUT_WINDOW_MS = 60 * 1000;

function statusFor(code) {
  if (code === 'BAD_REQUEST') return 400;
  if (code === 'UNAUTHORIZED') return 401;
  if (code === 'ORDER_EXISTS') return 409;
  if (code === 'ORDER_NOT_FOUND' || code === 'ORDER_FORBIDDEN' || code === 'ORDER_NOT_PAYABLE' || code === 'ORDER_INVALID') return 403;
  return 503; // RATE_* / TAIL_EXHAUSTED / EXPIRED
}

// deps：{ env, conn, getRate, address, validateInitData, botToken, now }，测试全部可注入。
function createCheckoutRouter(deps) {
  const { env = process.env, conn, getRate, validateInitData, botToken, now = Date.now } = deps;
  const hits = new Map(); // tg user id -> 窗口内请求时间戳（多副本不共享，需网关侧限流：已知缺口）

  return async function checkoutRoute(req, res) {
    if (env.CHECKOUT_ENABLED !== '1') {
      return res.status(503).json({ success: false, error: { code: 'CHECKOUT_DISABLED', message: '收银台暂未开放' } });
    }
    const { ordernum, idempotencyKey } = req.body || {};
    const initData = req.get('x-telegram-init-data') || (req.body && req.body.initData);
    const auth = validateInitData(initData, botToken);
    if (!auth.valid || !auth.user || !auth.user.id) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error || 'invalid initData' } });
    }
    const nowMs = now();
    const recent = (hits.get(auth.user.id) || []).filter((t) => nowMs - t < CHECKOUT_WINDOW_MS);
    if (recent.length >= CHECKOUT_LIMIT) {
      return res.status(429).json({ success: false, error: { code: 'RATE_LIMITED', message: '请求过于频繁，请稍后再试' } });
    }
    recent.push(nowMs);
    hits.set(auth.user.id, recent);
    for (const [uid, ts] of hits) {
      if (nowMs - ts[ts.length - 1] >= CHECKOUT_WINDOW_MS) hits.delete(uid);
    }
    try {
      const db = conn();
      // 服务端读订单金额与归属；phpCentavos 不再从请求体读取。
      const order = await readPayOrder(ordernum, db);
      await assertOwnership(db, String(auth.user.id), order.memberId);
      const data = await createCheckout(db, {
        ordernum,
        serverCentavos: order.centavos,
        idempotencyKey: idempotencyKey || null,
        getRate: getRate || coinsRateSource(deps.coinsClient),
        now,
        address: env.TRON_MASTER_RECEIVE_ADDRESS || '',
      });
      res.json({ success: true, data });
    } catch (err) {
      const code = err instanceof CheckoutError || err instanceof OrderReadError ? err.code : null;
      if (!code) {
        process.stderr.write(`${JSON.stringify({ level: 'error', route: 'checkout', ordernum, message: err.message })}\n`);
        return res.status(500).json({ success: false, error: { code: 'INTERNAL', message: 'checkout failed' } });
      }
      res.status(statusFor(code)).json({ success: false, error: { code, message: err.message } });
    }
  };
}

module.exports = { createCheckoutRouter, statusFor, CHECKOUT_LIMIT, CHECKOUT_WINDOW_MS };
