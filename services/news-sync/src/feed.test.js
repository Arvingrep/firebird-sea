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

test('RSS 适配:空/无 item 返回空数组', () => {
  assert.deepStrictEqual(rssToItems(''), []);
  assert.deepStrictEqual(rssToItems('<rss></rss>'), []);
});
