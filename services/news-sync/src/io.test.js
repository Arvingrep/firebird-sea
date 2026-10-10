const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { fileStore, makePublisher, makeAlerter, chunkText } = require('./io');
const { runSync } = require('./sync');

const noSleep = { attempts: 3, delayMs: 0, sleep: async () => {} };
const resp = (status, body) => ({ ok: status < 300, status, json: async () => body });
const tmp = () => path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'news-')), 'seen.json');
const item = n => ({ title: `News ${n}`, url: `https://example.com/${n}` });
const memSeen = () => {
  const s = new Set();
  return { has: k => s.has(k), add: k => s.add(k), size: () => s.size };
};

test('AC1 门户 HTTP 200 但 success:false 视为失败并抛错(不记入已见)', async () => {
  const fetchImpl = async () => resp(200, { success: false, error: { code: 'DUP', message: 'bad' } });
  const pub = makePublisher({ url: 'https://p/x', fetchImpl });
  await assert.rejects(() => pub(item(1), 'k'), /portal rejected: bad/);
  const seen = memSeen();
  const alerts = [];
  const stats = await runSync([item(1)], { seen, publish: pub, alert: async t => alerts.push(t), retry: noSleep });
  assert.strictEqual(stats.failed, 1);
  assert.strictEqual(seen.size(), 0);
  assert.strictEqual(alerts.length, 1);
});

test('AC1 发布请求携带稳定去重键(Idempotency-Key)', async () => {
  let req;
  const fetchImpl = async (u, o) => {
    req = o;
    return resp(200, { success: true });
  };
  await makePublisher({ url: 'https://p/x', token: 't', fetchImpl })(item(1), 'abc');
  assert.strictEqual(req.headers['Idempotency-Key'], 'abc');
  assert.strictEqual(JSON.parse(req.body).dedupeKey, 'abc');
});

test('AC1 去重文件:跨进程持久、损坏时抛错而非当空集合', () => {
  const f = tmp();
  const a = fileStore(f);
  assert.strictEqual(a.has('k'), false);
  a.add('k');
  assert.strictEqual(fileStore(f).has('k'), true);
  fs.writeFileSync(f, '{broken');
  assert.throws(() => fileStore(f), /seen file unreadable/);
});

test('AC1 门户成功后去重写入失败:不计发布失败,仍告警', async () => {
  const alerts = [];
  const seen = {
    has: () => false,
    add: () => {
      throw new Error('EACCES');
    }
  };
  const stats = await runSync([item(1)], { seen, publish: async () => {}, alert: async t => alerts.push(t), retry: noSleep });
  assert.strictEqual(stats.published, 1);
  assert.strictEqual(stats.failed, 0);
  assert.match(alerts[0], /去重记录写入失败/);
});

test('AC2 门户响应丢失(网络错误)后重试成功,两次请求带同一去重键', async () => {
  const keys = [];
  let n = 0;
  const fetchImpl = async (u, o) => {
    keys.push(o.headers['Idempotency-Key']);
    if (++n === 1) throw new Error('ECONNRESET');
    return resp(200, { success: true });
  };
  const publish = makePublisher({ url: 'https://p/x', fetchImpl });
  const stats = await runSync([item(1)], { seen: memSeen(), publish, alert: async () => {}, retry: noSleep });
  assert.strictEqual(stats.published, 1);
  assert.strictEqual(keys.length, 2);
  assert.strictEqual(keys[0], keys[1]);
});

test('AC3 大量失败告警被切分,每条 ≤ 4000 字符', async () => {
  const sent = [];
  const fetchImpl = async (u, o) => {
    sent.push(JSON.parse(o.body).text);
    return resp(200, {});
  };
  const alert = makeAlerter({ botToken: 'T', chatId: 'C', fetchImpl });
  const many = Array.from({ length: 300 }, (_, i) => item(i));
  const publish = async () => {
    throw new Error('down');
  };
  await runSync(many, { seen: memSeen(), publish, alert, retry: { attempts: 1 } });
  assert.ok(sent.length > 1);
  assert.ok(sent.every(t => t.length <= 4000));
  assert.ok(chunkText('x'.repeat(10000)).every(c => c.length <= 4000));
});

test('AC3 告警接口失败:有界重试后标记 alertFailed 且不抛错', async () => {
  let calls = 0;
  const fetchImpl = async () => {
    calls++;
    return resp(500, {});
  };
  const alert = makeAlerter({ botToken: 'T', chatId: 'C', fetchImpl });
  const publish = async () => {
    throw new Error('down');
  };
  const stats = await runSync([item(1)], { seen: memSeen(), publish, alert, retry: noSleep });
  assert.strictEqual(stats.failed, 1);
  assert.strictEqual(stats.alertFailed, true);
  assert.strictEqual(calls, 3);
});
