const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { main } = require('./cli');
const { makePublisher } = require('./io');

const retry = { attempts: 2, delayMs: 0, sleep: async () => {} };
const dir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'news-cli-'));
const baseEnv = d => ({
  NEWS_SYNC_SEEN_FILE: path.join(d, 'seen.json'),
  NEWS_PORTAL_PUBLISH_URL: 'https://p/x',
  NEWS_ALERT_BOT_TOKEN: 't',
  NEWS_ALERT_CHAT_ID: 'c'
});
const okFetch = sent => async (url, opts) => {
  sent.push({ url, body: JSON.parse(opts.body) });
  return { ok: true, status: 200, json: async () => ({ success: true }) };
};

test('AC3 stdin 非法 JSON:整轮失败仍告警运营者并抛错', async () => {
  const sent = [];
  await assert.rejects(() => main({ env: baseEnv(dir()), readInput: () => 'not json', fetchImpl: okFetch(sent), retry }));
  assert.strictEqual(sent.length, 1);
  assert.match(sent[0].body.text, /本轮失败/);
});

test('AC3 顶层非数组(对象 / null)视为契约错误:告警并抛错', async () => {
  for (const raw of ['{"items":[]}', 'null']) {
    const sent = [];
    await assert.rejects(() => main({ env: baseEnv(dir()), readInput: () => raw, fetchImpl: okFetch(sent), retry }), /JSON array/);
    assert.strictEqual(sent.length, 1);
  }
});

test('AC3 去重文件损坏:整轮失败告警并抛错', async () => {
  const env = baseEnv(dir());
  fs.writeFileSync(env.NEWS_SYNC_SEEN_FILE, 'corrupt');
  const sent = [];
  await assert.rejects(() => main({ env, readInput: () => '[]', fetchImpl: okFetch(sent), retry }), /seen file unreadable/);
  assert.strictEqual(sent.length, 1);
});

test('AC1 正常一轮:去重后发布,重复输入不再发布', async () => {
  const env = baseEnv(dir());
  const sent = [];
  const input = JSON.stringify([{ title: 'A', url: 'https://example.com/a' }]);
  const first = await main({ env, readInput: () => input, fetchImpl: okFetch(sent), retry });
  const second = await main({ env, readInput: () => input, fetchImpl: okFetch(sent), retry });
  assert.strictEqual(first.published, 1);
  assert.strictEqual(second.duplicates, 1);
  assert.strictEqual(sent.length, 1);
});

test('AC2 响应体持续不结束:超时后失败,可进入重试', async () => {
  const fetchImpl = async (url, opts) => ({
    ok: true,
    status: 200,
    json: () => new Promise((_, rej) => opts.signal.addEventListener('abort', () => rej(new Error('aborted'))))
  });
  const pub = makePublisher({ url: 'https://p/x', fetchImpl, timeoutMs: 20 });
  await assert.rejects(() => pub({ title: 'A', url: 'https://example.com/a' }, 'k'), /aborted/);
});
