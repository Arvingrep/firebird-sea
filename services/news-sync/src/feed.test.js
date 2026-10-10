const test = require('node:test');
const assert = require('node:assert');
const { rssToItems } = require('./feed');

test('RSS 适配:item 映射 title/url/summary,实体解码', () => {
  const xml = '<rss><channel><item><title>A &amp; B</title><link>https://e.test/a</link><description><![CDATA[摘要]]></description></item><item><title>C</title><link>https://e.test/c</link></item></channel></rss>';
  assert.deepStrictEqual(rssToItems(xml), [
    { title: 'A & B', url: 'https://e.test/a', summary: '摘要' },
    { title: 'C', url: 'https://e.test/c', summary: '' }
  ]);
});

test('RSS 适配:带属性的 item 也被解析', () => {
  const xml = '<rss version="2.0"><channel><item xml:lang="zh"><title>D</title><link>https://e.test/d</link></item></channel></rss>';
  assert.deepStrictEqual(rssToItems(xml), [{ title: 'D', url: 'https://e.test/d', summary: '' }]);
});

test('RSS 适配:非 RSS 文档(HTML 错误页/空输入)与截断文档抛错,合法空频道返回空数组', () => {
  assert.throws(() => rssToItems(''), /not an RSS document/);
  assert.throws(() => rssToItems('<html><body>502 Bad Gateway</body></html>'), /not an RSS document/);
  assert.throws(() => rssToItems('<rss><channel><item><title>A</title>'), /truncated RSS/);
  assert.throws(() => rssToItems('<rss version="2.0"><channel><item><title>A</title></item>'), /truncated RSS/);
  assert.deepStrictEqual(rssToItems('<rss version="2.0"><channel></channel></rss>'), []);
});

test('RSS 适配:vendored 的 n8n-news-mock 同源 fixture 可被解析(TASK-016 数据面)', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const xml = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'n8n-news-mock-rss.xml'), 'utf8');
  const items = rssToItems(xml);
  assert.strictEqual(items.length, 1);
  assert.strictEqual(items[0].url, 'https://example.test/news/acceptance');
  assert.match(items[0].title, /火鸟门户完整流程模拟验收新闻/);
  const drill = rssToItems(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'n8n-news-mock-rss-drill.xml'), 'utf8'));
  assert.strictEqual(drill.length, 2);
  assert.strictEqual(drill[1].url, 'https://example.test/news/failure-drill');
});
