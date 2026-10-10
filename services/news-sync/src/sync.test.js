const test = require('node:test');
const assert = require('node:assert');
const { runSync, sanitizeItem, dedupeKey } = require('./sync');

const noSleep = { attempts: 3, delayMs: 0, sleep: async () => {} };
const memSeen = () => {
  const s = new Set();
  return { has: k => s.has(k), add: k => s.add(k) };
};
const item = (n, extra = {}) => ({ title: `News ${n}`, url: `https://example.com/${n}`, summary: 's', ...extra });

test('AC1 去重后发布:重复 URL 只发布一次,跨轮次不重复', async () => {
  const published = [];
  const deps = { seen: memSeen(), publish: async i => published.push(i), alert: async () => {}, retry: noSleep };
  const r1 = await runSync([item(1), item(1), item(2)], deps);
  assert.deepStrictEqual(r1, { published: 2, duplicates: 1, invalid: 0, failed: 0 });
  const r2 = await runSync([item(1), item(3)], deps);
  assert.strictEqual(r2.published, 1);
  assert.strictEqual(r2.duplicates, 1);
  assert.strictEqual(published.length, 3);
});

test('AC2 失败重试:前两次失败第三次成功则发布且不告警', async () => {
  let calls = 0;
  const alerts = [];
  const deps = {
    seen: memSeen(),
    publish: async () => {
      if (++calls < 3) throw new Error('boom');
    },
    alert: async m => alerts.push(m),
    retry: noSleep
  };
  const r = await runSync([item(1)], deps);
  assert.strictEqual(calls, 3);
  assert.strictEqual(r.published, 1);
  assert.strictEqual(alerts.length, 0);
});

test('AC3 失败告警:重试耗尽后告警运营者,且不标记已见以便下轮重试', async () => {
  const alerts = [];
  const seen = memSeen();
  const deps = {
    seen,
    publish: async () => {
      throw new Error('portal down');
    },
    alert: async m => alerts.push(m),
    retry: noSleep
  };
  const r = await runSync([item(1)], deps);
  assert.strictEqual(r.failed, 1);
  assert.strictEqual(alerts.length, 1);
  assert.match(alerts[0], /portal down/);
  assert.strictEqual(seen.has(dedupeKey(sanitizeItem(item(1)))), false);
});

test('AD-11 不可信输入:去标签、拒绝非 https、丢弃价格字段', () => {
  const s = sanitizeItem(item(1, { title: '<b>Hi</b> there', price: 99 }));
  assert.strictEqual(s.title, 'Hi there');
  assert.strictEqual('price' in s, false);
  assert.strictEqual(sanitizeItem({ title: 't', url: 'http://a.com/x' }), null);
  assert.strictEqual(sanitizeItem({ title: 't', url: 'javascript:alert(1)' }), null);
});
