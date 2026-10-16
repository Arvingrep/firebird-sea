const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const { runCallTest } = require('../src/callTest');

function serve(statuses) {
  let n = 0;
  const server = http.createServer((req, res) => {
    res.statusCode = statuses[Math.min(n++, statuses.length - 1)];
    res.end('{}');
  });
  return new Promise((resolve) => server.listen(0, () => {
    resolve({ url: `http://127.0.0.1:${server.address().port}`, server, count: () => n });
  }));
}

const silent = { error: () => {} };

test('首次失败、重试成功即通过', async () => {
  const s = await serve([500, 200]);
  const r = await runCallTest(s.url, {}, { delayMs: 10, logger: silent });
  s.server.close();
  assert.deepStrictEqual(r, { passed: true, attempts: 2 });
});

test('三次均失败：共 3 次请求并记录终态异常日志', async () => {
  const s = await serve([500]);
  const logs = [];
  const r = await runCallTest(s.url, {}, { delayMs: 10, logger: { error: (m) => logs.push(m) } });
  s.server.close();
  assert.strictEqual(r.passed, false);
  assert.strictEqual(s.count(), 3);
  assert.strictEqual(logs.length, 1);
});
