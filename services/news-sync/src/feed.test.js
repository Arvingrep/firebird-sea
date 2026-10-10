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

test('RSS 适配:非 RSS 文档(HTML 错误页/空输入)抛错,合法空频道返回空数组', () => {
  assert.throws(() => rssToItems(''), /not an RSS document/);
  assert.throws(() => rssToItems('<html><body>502 Bad Gateway</body></html>'), /not an RSS document/);
  assert.deepStrictEqual(rssToItems('<rss version="2.0"><channel></channel></rss>'), []);
});
