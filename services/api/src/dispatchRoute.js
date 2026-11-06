'use strict';
// T7 骑手新单 Telegram 通知：PHP 派单挂点（fb_tg_dispatch，common.func.php）经集群内站点 nginx
// 调 POST /tg-api/internal/dispatch。
//
// 收下即返回（修复轮 2 · M3）：HMAC 验签 + 去重占位写库后立刻 202 {accepted:true}，Telegram
// sendMessage 与重试全部移到响应之后异步执行。原因：PHP 侧挂点在派单/抢单/改派的关键路径上，
// 若同步等 Telegram（实测 300ms~5s，含重试更久）会把 PHP 的 curl 超时预算拖到倒挂——PHP 先超时
// 放弃、Node 还在发，于是「日志显示超时但用户其实收到了」。改成本端点只做验签 + 占位（本地 DB，
// 毫秒级），PHP 800ms 超时预算就够用且不会产出假失败。
//
// 失败语义（异步化后）：HTTP 202 只代表「已受理」，不代表已送达。之后的查绑定/换 URL/发消息失败
// 一律只打日志（带 event/order_id/courier_id，可按单号 grep），并在最终失败时释放去重占位，
// 让下一次同键事件能重发。PHP 侧不再得知发送结果——这正是把通知从业务事务里摘干净的前提。
//
// 验签算法与 gatewayClient.js 完全一致（HMAC-SHA256(secret, ts\naction\nbody)，头 X-Fbs-Timestamp /
// X-Fbs-Signature，action 常量 'dispatch'），密钥同为 FBS_GATEWAY_SECRET——方向相反（PHP→Node），
// 不引入新密钥。PHP 容器不持有 bot token，这正是走 Node 中转的原因。
// 去重：fbs_dispatch_dedup 表（语义等同 Redis SET NX EX 86400，见迁移 005/006/008 注释）。
// 键 = (event, order_id, courier_id)：同一订单改派给第二位骑手时，新骑手仍会收到通知
// （二元组会把改派通知静默吞掉，修复轮 1 · P2-2）。
const crypto = require('node:crypto');

const EVENTS = ['new_order', 'grab', 'reassign', 'reclaim'];

// 四种事件区分文案；按钮「查看订单」→ PHP 签出的一次性工作台直达 URL（打开即该订单详情）。
// reclaim = 订单被客服收回（改派给第三方平台等），原骑手无需继续配送，不带按钮。
const EVENT_TEXT = {
  new_order: '🛵 您有新的配送订单',
  grab: '✅ 抢单成功，订单已分配给您',
  reassign: '🔁 订单已改派给您',
  reclaim: '📤 订单已被客服收回，无需继续配送',
};

// retry_after（Telegram 429 的 parameters.retry_after）最长等这么久，避免一个 429 把队列压死
const MAX_BACKOFF_SEC = 5;
const RETRY_DELAY_MS = 1000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function timingSafeEq(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

// sendMessage 封装从 services/news-sync/src/io.js makeAlerter 移植（fetch + 超时 + ok===true 校验），
// 补两件：429/5xx 时把 Telegram 响应原文片段与 retry_after 挂到 error 上，供日志与退避使用。
async function sendTelegramMessage(botToken, payload, fetchImpl, timeoutMs) {
  const res = await fetchImpl(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    signal: AbortSignal.timeout(timeoutMs),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let body = null;
  try { body = JSON.parse(text); } catch (e) { /* 非 JSON 走下面的原文片段 */ }
  if (!res.ok) {
    const err = new Error(`telegram HTTP ${res.status}`);
    err.httpStatus = res.status;
    err.retryAfter = Number((body && body.parameters && body.parameters.retry_after) || 0);
    err.snippet = String(text || '').slice(0, 200);
    throw err;
  }
  if (!body || body.ok !== true) {
    const err = new Error(`telegram rejected: ${(body && body.description) || 'ok!=true'}`);
    err.snippet = String(text || '').slice(0, 200);
    throw err;
  }
}

function firstInt(out) {
  const n = parseInt(String(out || '').split('\n')[0].trim(), 10);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

/**
 * 创建内部派单通知处理器，依赖全部注入以便单测（同 bridgeRoute 风格）。
 * @param {object} deps
 * @param {string} deps.secret - HMAC 密钥（FBS_GATEWAY_SECRET，与 PHP 侧共享）
 * @param {string} deps.botToken - TELEGRAM_BOT_TOKEN
 * @param {{ query: (sql: string) => Promise<string> }} deps.conn - fbs_courier_map 读 / fbs_dispatch_dedup 读写
 * @param {{ riderNotifyUrl: (p: object) => Promise<object> } | null} [deps.gateway] - 换一次性订单直达 URL
 * @param {(payload: object) => Promise<void>} [deps.sendMessage] - 默认 Telegram Bot API sendMessage
 * @param {number} [deps.sendTimeoutMs]
 * @param {(ms: number) => Promise<void>} [deps.wait] - 重试退避（测试注入以便瞬返）
 * @param {() => number} [deps.now]
 */
function createDispatchRoute({
  secret, botToken, conn, gateway,
  sendMessage, sendTimeoutMs = 5000, wait = sleep,
  now = () => Math.floor(Date.now() / 1000),
}) {
  const missing = [];
  if (!secret) missing.push('FBS_GATEWAY_SECRET');
  if (!botToken) missing.push('TELEGRAM_BOT_TOKEN');
  if (!conn) missing.push('DB_HOST');
  const notConfigured = missing.length > 0;
  if (notConfigured) {
    console.warn('[internal/dispatch] 派单通知未配置，端点将返回 503，缺失项：', missing.join('；'));
  }
  const send = sendMessage || ((payload) => sendTelegramMessage(botToken, payload, fetch, sendTimeoutMs));

  // 在飞的发送任务：drain() 供测试/优雅退出等待，生产路径不依赖它
  const inflight = new Set();
  function track(p) {
    inflight.add(p);
    p.then(() => inflight.delete(p), () => inflight.delete(p));
    return p;
  }
  async function drain() {
    while (inflight.size > 0) {
      await Promise.all(Array.from(inflight).map((p) => p.catch(() => {})));
    }
  }

  // 验签：timestamp 60 秒窗口（与网关非凭证动作一致），签名串 action 固定 'dispatch'
  function verify(req, rawBody) {
    const ts = req.get('x-fbs-timestamp') || '';
    const sig = req.get('x-fbs-signature') || '';
    if (!/^\d+$/.test(ts) || Math.abs(now() - Number(ts)) > 60) return false;
    if (!/^[0-9a-f]{64}$/.test(sig)) return false;
    const expected = crypto.createHmac('sha256', secret).update(`${ts}\ndispatch\n${rawBody}`).digest('hex');
    return timingSafeEq(expected, sig);
  }

  const dedupWhere = (eventId, oid, cid) => `event = '${eventId}' AND order_id = ${oid} AND courier_id = ${cid}`;
  // 每条异步失败日志都带这三个字段，线上按 order_id grep 即可定位
  const ctx = (eventId, oid, cid) => `event=${eventId} order_id=${oid} courier_id=${cid}`;

  async function releaseDedup(eventId, oid, cid) {
    try {
      await conn.query(`DELETE FROM fbs_dispatch_dedup WHERE ${dedupWhere(eventId, oid, cid)}`);
    } catch (e) {
      // 释放失败只影响「同键重发要等 TTL 清理」，不影响本次投递
      console.error(`[internal/dispatch] release dedup failed ${ctx(eventId, oid, cid)}:`, String((e && e.message) || e).slice(0, 200));
    }
  }

  async function deliver({ eventId, oid, cid, claimed }) {
    const tag = ctx(eventId, oid, cid);
    try {
      // 查绑定：查不到（或查失败）就没法发，释放占位让下次能重试
      let tgUserId = null;
      try {
        tgUserId = firstInt(await conn.query(`SELECT tg_user_id FROM fbs_courier_map WHERE courier_id = ${cid} LIMIT 1`));
      } catch (err) {
        console.error(`[internal/dispatch] courier_map lookup failed ${tag}:`, String((err && err.message) || err).slice(0, 200));
      }
      if (!tgUserId) {
        console.warn(`[internal/dispatch] skip: courier not bound ${tag}`);
        if (claimed) await releaseDedup(eventId, oid, cid);
        return;
      }

      // 一次性工作台直达 URL（打开即该订单详情）；网关失败降级为无按钮纯文本。
      // canary 新契约（N1）：成功 200 {success:true, data:{url}}；非 2xx 由 gatewayClient reject。
      // reclaim 是「订单已被收回」的通知，原骑手已无该订单，生成详情按钮只会误导 —— 不带按钮。
      let url = null;
      if (eventId !== 'reclaim') {
        try {
          const r = gateway ? await gateway.riderNotifyUrl({ order_id: oid, courier_id: cid }) : null;
          if (r && r.success === true && r.data && typeof r.data.url === 'string' && /^https:\/\//.test(r.data.url)) url = r.data.url;
        } catch (err) {
          console.error(`[internal/dispatch] rider_notify_url failed ${tag}:`, String((err && err.message) || err).slice(0, 200));
        }
      }

      const payload = {
        chat_id: tgUserId,
        text: `${EVENT_TEXT[eventId]}\n订单号：${oid}`,
        reply_markup: url ? { inline_keyboard: [[{ text: '查看订单', url }]] } : undefined,
      };

      try {
        await send(payload);
      } catch (err) {
        // m9：429 按其 retry_after 退避，其余给固定 1s；退避上限 MAX_BACKOFF_SEC
        const backoffSec = Math.min(Number(err && err.retryAfter) || 1, MAX_BACKOFF_SEC);
        console.error(`[internal/dispatch] sendMessage attempt 1 failed ${tag} backoff=${backoffSec}s:`,
          String((err && err.message) || err).slice(0, 120),
          'resp:', String((err && err.snippet) || '').slice(0, 200));
        await wait(backoffSec * 1000);
        try {
          await send(payload);
        } catch (err2) {
          console.error(`[internal/dispatch] sendMessage failed twice ${tag}:`,
            String((err2 && err2.message) || err2).slice(0, 120),
            'resp:', String((err2 && err2.snippet) || '').slice(0, 200));
          if (claimed) await releaseDedup(eventId, oid, cid);
          return;
        }
      }
      // 顺手清理过期去重行（TTL 1 天），失败不影响本次投递
      try {
        await conn.query('DELETE FROM fbs_dispatch_dedup WHERE created_at < NOW() - INTERVAL 1 DAY');
      } catch (e) { /* 清理失败留给下次 */ }
    } catch (err) {
      console.error(`[internal/dispatch] deliver crashed ${tag}:`, String((err && err.message) || err).slice(0, 200));
      if (claimed) await releaseDedup(eventId, oid, cid);
    }
  }

  async function postDispatch(req, res) {
    if (notConfigured) return res.status(503).json({ success: false, error: { code: 'DISPATCH_NOT_CONFIGURED', message: 'dispatch notify not configured' } });
    // 原始 body 必须与 PHP 签名字节一致（PHP json_encode 的转义形态与 JSON.stringify 重序列化
    // 不保证相同），由 server.js 的 express.json verify 捕获在 req.rawBody
    const rawBody = req.rawBody instanceof Buffer ? req.rawBody.toString('utf8') : JSON.stringify(req.body || {});
    if (!verify(req, rawBody)) {
      return res.status(401).json({ success: false, error: { code: 'BAD_SIGNATURE', message: 'invalid timestamp or signature' } });
    }
    const body = req.body || {};
    const eventId = String(body.event || '');
    const oid = Number(body.order_id);
    const cid = Number(body.courier_id);
    // m2：错误文案从 EVENTS 生成，加事件时不会忘记改文案
    if (!EVENTS.includes(eventId)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_EVENT', message: `event must be one of ${EVENTS.join('|')}` } });
    }
    if (!Number.isSafeInteger(oid) || oid <= 0 || !Number.isSafeInteger(cid) || cid <= 0) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_PARAM', message: 'order_id / courier_id must be positive integers' } });
    }

    // 去重占位：INSERT 成功 = 本次由我们负责发；撞唯一键 = 已有副本在发/已发过。
    // 写库异常（DB 抖动）不阻断投递——宁可重发不可漏发，只是失去本轮去重保护。
    let claimed = false;
    try {
      await conn.query(`INSERT INTO fbs_dispatch_dedup (event, order_id, courier_id) VALUES ('${eventId}', ${oid}, ${cid})`);
      claimed = true;
    } catch (err) {
      const msg = String((err && err.message) || err);
      if (/duplicate/i.test(msg)) {
        return res.status(202).json({ success: true, accepted: true, dedup: true });
      }
      console.error(`[internal/dispatch] dedup claim failed ${ctx(eventId, oid, cid)}:`, msg.slice(0, 200));
    }

    // 收下即返回：从这里往下不再影响 HTTP 响应（M3）
    res.status(202).json({ success: true, accepted: true, dedup: false });
    track(deliver({ eventId, oid, cid, claimed }));
    return undefined;
  }

  return { postDispatch, drain };
}

module.exports = { createDispatchRoute, EVENTS };
