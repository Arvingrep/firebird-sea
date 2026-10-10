const crypto = require('node:crypto');
const http = require('node:http');
const https = require('node:https');

// 签名串：timestamp + '\n' + action + '\n' + body；HMAC-SHA256 十六进制（AD-3）
function sign(secret, timestamp, action, body) {
  return crypto.createHmac('sha256', secret).update(`${timestamp}\n${action}\n${body}`).digest('hex');
}

function call(baseUrl, secret, action, params = {}) {
  const body = JSON.stringify(params);
  const timestamp = String(Math.floor(Date.now() / 1000));
  const url = new URL(`${baseUrl.replace(/\/$/, '')}/${action}`);
  const lib = url.protocol === 'https:' ? https : http;
  const headers = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'X-Fbs-Timestamp': timestamp,
    'X-Fbs-Signature': sign(secret, timestamp, action, body)
  };
  return new Promise((resolve, reject) => {
    const req = lib.request(url, { method: 'POST', headers }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(new Error(`网关返回非 JSON: ${data.slice(0, 200)}`)); }
      });
    });
    req.on('error', reject);
    req.end(body);
  });
}

const deal = (cfg, params) => call(cfg.baseUrl, cfg.secret, 'deal', params);
const orderPaid = (cfg, params) => call(cfg.baseUrl, cfg.secret, 'order_paid', params);
const cancelOrder = (cfg, params) => call(cfg.baseUrl, cfg.secret, 'cancelOrder', params);

module.exports = { sign, call, deal, orderPaid, cancelOrder };
