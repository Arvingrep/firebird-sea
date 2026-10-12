import test from 'node:test';
import assert from 'node:assert';
import { sanitizeNodes, safeUrl } from '../src/lib/safeHtml.js';

// 极简 DOM 替身
const T = (text) => ({ nodeType: 3, textContent: text });
const E = (tagName, attrs = {}, ...kids) => ({ nodeType: 1, tagName, childNodes: kids, getAttribute: (k) => (k in attrs ? attrs[k] : null) });
const flat = (nodes) => JSON.stringify(nodes);

test('safeUrl 只放行 https 与协议相对地址', () => {
  assert.strictEqual(safeUrl('https://a.com/x.png'), 'https://a.com/x.png');
  assert.strictEqual(safeUrl('//cdn.a.com/x.png'), 'https://cdn.a.com/x.png');
  for (const bad of ['javascript:alert(1)', 'http://a.com', 'data:text/html,<script>', '/relative', 'JaVaScRiPt:1', ' \tjavascript:1', 'https://a.com/\n', '', null, 5]) {
    assert.strictEqual(safeUrl(bad), null, String(bad));
  }
});

test('脚本、样式、iframe 及其内容被整体丢弃', () => {
  const out = sanitizeNodes([E('script', {}, T('alert(1)')), E('iframe', { src: 'https://x' }), E('p', {}, T('ok'))]);
  assert.strictEqual(flat(out).includes('alert'), false);
  assert.deepStrictEqual(out, [{ tag: 'p', attrs: {}, children: [{ text: 'ok' }] }]);
});

test('事件属性与 style 不会进入输出', () => {
  const out = sanitizeNodes([E('p', { onclick: 'x()', style: 'color:red' }, T('t'))]);
  assert.deepStrictEqual(out[0].attrs, {});
});

test('a 链接：危险协议去掉 href 但保留文字；img 无合法 src 则丢弃', () => {
  const out = sanitizeNodes([
    E('a', { href: 'javascript:alert(1)' }, T('click')),
    E('a', { href: 'https://ok.com' }, T('safe')),
    E('img', { src: 'javascript:x' }),
    E('img', { src: 'https://img.com/a.jpg', alt: 'a' }),
  ]);
  assert.deepStrictEqual(out[0].attrs, {});
  assert.strictEqual(out[1].attrs.href, 'https://ok.com');
  assert.strictEqual(out.filter((n) => n.tag === 'img').length, 1);
});

test('未知标签丢标签留内容；深度与节点数有上限', () => {
  const out = sanitizeNodes([E('marquee', {}, T('hi'))]);
  assert.deepStrictEqual(out, [{ text: 'hi' }]);
  let deep = T('x');
  for (let i = 0; i < 100; i += 1) deep = E('div', {}, deep);
  assert.ok(flat(sanitizeNodes([deep])).length < 5000);
});
