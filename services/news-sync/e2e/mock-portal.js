/**
 * 本地真实环境替身(零依赖,node:http):同一进程提供
 * - TASK-016 数据面:GET /rss.xml(与 n8n 新闻工作流验收用的确定性测试源同款条目)
 * - 火鸟门户发布替身:POST /portal/publish(按 Idempotency-Key 幂等;POST /portal/fail-next 预置连续失败)
 * - Telegram Bot API 替身:POST /bot<token>/sendMessage
 * - GET /state 观测、POST /reset 重置
 * 用法: node e2e/mock-portal.js [port]  (默认 18180,仅监听 127.0.0.1)
 */
const http = require('node:http');

const RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Mock News</title><link>http://localhost/</link><description>Deterministic test feed</description>
<item><title>火鸟门户完整流程模拟验收新闻</title><link>https://example.test/news/acceptance</link><description>这是一条用于本地完整流程验收的模拟新闻,正文长度明确超过五十个字符,以便稳定通过内容质量检查,并继续验证去重、发布与告警链路。</description></item>
</channel></rss>`;

function freshState() {
  return { portal: [], portalKeys: [], portalAttempts: 0, tg: [], failNext: 0 };
}
let state = freshState();

function json(res, code, obj) {
  const raw = Buffer.from(JSON.stringify(obj));
  res.writeHead(code, { 'Content-Type': 'application/json', 'Content-Length': raw.length });
  res.end(raw);
}

const server = http.createServer((req, res) => {
  let raw = '';
  req.on('data', c => { raw += c; });
  req.on('end', () => {
    let body = {};
    try { body = raw ? JSON.parse(raw) : {}; } catch { body = { raw }; }
    const path = new URL(req.url, 'http://x').pathname;
    if (req.method === 'GET' && path === '/rss.xml') {
      res.writeHead(200, { 'Content-Type': 'application/rss+xml; charset=utf-8' });
      return res.end(RSS);
    }
    if (req.method === 'GET' && path === '/state') return json(res, 200, state);
    if (req.method === 'GET' && path === '/health') return json(res, 200, { ok: true });
    if (req.method === 'POST' && path === '/reset') { state = freshState(); return json(res, 200, { ok: true }); }
    if (req.method === 'POST' && path === '/portal/publish') {
      state.portalAttempts++;
      if (state.failNext > 0) {
        state.failNext--;
        return json(res, 502, { success: false, error: { code: 'UPSTREAM', message: 'simulated portal failure' } });
      }
      const key = req.headers['idempotency-key'] || '';
      if (key && state.portalKeys.includes(key)) return json(res, 200, { success: true, dedup: true, id: state.portalKeys.indexOf(key) + 1 });
      if (key) state.portalKeys.push(key);
      state.portal.push({ key, item: body });
      return json(res, 200, { success: true, id: state.portal.length });
    }
    if (req.method === 'POST' && path === '/portal/fail-next') {
      state.failNext = Number(body.count) || 1;
      return json(res, 200, { ok: true, fail_next: state.failNext });
    }
    if (req.method === 'POST' && /^\/bot[^/]+\/sendMessage$/.test(path)) {
      state.tg.push(body);
      return json(res, 200, { ok: true, result: { message_id: state.tg.length } });
    }
    return json(res, 404, { error: 'not found' });
  });
});

const port = Number(process.argv[2] || process.env.MOCK_PORT || 18180);
server.listen(port, '127.0.0.1', () => process.stdout.write(`mock-portal listening on 127.0.0.1:${port}\n`));
