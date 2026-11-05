const crypto = require('node:crypto');
const http = require('node:http');
const https = require('node:https');

const DEFAULT_TIMEOUT_MS = 8000;

// 签名串：timestamp + '\n' + action + '\n' + body；HMAC-SHA256 十六进制（AD-3）
function sign(secret, timestamp, action, body) {
  return crypto.createHmac('sha256', secret).update(`${timestamp}\n${action}\n${body}`).digest('hex');
}

function gatewayError(code, message, extra = {}) {
  const err = new Error(message);
  err.code = code;
  Object.assign(err, extra);
  return err;
}

// options.timeoutMs：超时后 req.destroy()，由 reject 抛 GATEWAY_TIMEOUT（不设则默认 8s，防止请求永久挂起）。
// 非 2xx 一律 reject（GATEWAY_HTTP_ERROR + status + body），调用方不必自己判状态码。
function call(baseUrl, secret, action, params = {}, options = {}) {
  const body = JSON.stringify(params);
  const timestamp = String(Math.floor(Date.now() / 1000));
  const url = new URL(`${baseUrl.replace(/\/$/, '')}/${action}`);
  const lib = url.protocol === 'https:' ? https : http;
  const timeoutMs = Number(options.timeoutMs) > 0 ? Number(options.timeoutMs) : DEFAULT_TIMEOUT_MS;
  const headers = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'X-Fbs-Timestamp': timestamp,
    'X-Fbs-Signature': sign(secret, timestamp, action, body)
  };
  return new Promise((resolve, reject) => {
    let timer = null;
    const req = lib.request(url, { method: 'POST', headers }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        clearTimeout(timer);
        if (res.statusCode < 200 || res.statusCode >= 300) {
          let payload = null;
          try { payload = JSON.parse(data); } catch (e) { /* 非 JSON 错误页，保留原文即可 */ }
          return reject(gatewayError('GATEWAY_HTTP_ERROR', `网关返回 HTTP ${res.statusCode}`, {
            status: res.statusCode,
            payload,
            body: data.slice(0, 500)
          }));
        }
        try { resolve(JSON.parse(data)); } catch (e) { reject(gatewayError('GATEWAY_BAD_JSON', `网关返回非 JSON: ${data.slice(0, 200)}`)); }
      });
    });
    timer = setTimeout(() => {
      req.destroy(gatewayError('GATEWAY_TIMEOUT', `网关请求超时（${timeoutMs}ms）`));
    }, timeoutMs);
    if (typeof timer.unref === 'function') timer.unref();
    req.on('error', (err) => { clearTimeout(timer); reject(err); });
    req.end(body);
  });
}

const deal = (cfg, params) => call(cfg.baseUrl, cfg.secret, 'deal', params, cfg);
const orderPaid = (cfg, params) => call(cfg.baseUrl, cfg.secret, 'order_paid', params, cfg);
const cancelOrder = (cfg, params) => call(cfg.baseUrl, cfg.secret, 'cancelOrder', params, cfg);

// 免密登录桥（方案甲：Node 中转）
const memberFindOrCreate = (cfg, params) => call(cfg.baseUrl, cfg.secret, 'member_find_or_create', params, cfg);
const issueSession = (cfg, params) => call(cfg.baseUrl, cfg.secret, 'issue_session', params, cfg);

module.exports = { sign, call, deal, orderPaid, cancelOrder, memberFindOrCreate, issueSession, DEFAULT_TIMEOUT_MS };
