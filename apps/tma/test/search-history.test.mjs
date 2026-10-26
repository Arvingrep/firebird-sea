import test from 'node:test';
import assert from 'node:assert';
import { createSearchHistory, _normalize as normalize } from '../src/lib/searchHistory.js';

const memStorage = () => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: (k) => { m.delete(k); },
  };
};

test('normalize：折叠空白、去控制字符、限长；空值返回 null', () => {
  assert.strictEqual(normalize('  炸鸡  '), '炸鸡');
  assert.strictEqual(normalize('a   b\nc'), 'a b c');
  assert.strictEqual(normalize('\u0000\u001f'), null);
  assert.strictEqual(normalize(''), null);
  assert.strictEqual(normalize('   '), null);
  assert.strictEqual(normalize(42), null);
  assert.strictEqual(normalize(undefined), null);
  assert.strictEqual(normalize('x'.repeat(100)).length, 40);
});

test('add：最近搜的排最前，重复项上移而不是新增', () => {
  const h = createSearchHistory({ storage: null });
  h.add('鸡排');
  h.add('奶茶');
  h.add('鸡排');
  assert.deepStrictEqual(h.list(), ['鸡排', '奶茶']);
});

test('add：大小写不同的视为同一条', () => {
  const h = createSearchHistory({ storage: null });
  h.add('Chicken');
  h.add('chicken');
  assert.deepStrictEqual(h.list(), ['chicken']);
});

test('add：超过 limit 截断最旧的', () => {
  const h = createSearchHistory({ storage: null, limit: 3 });
  ['a', 'b', 'c', 'd'].forEach((x) => h.add(x));
  assert.deepStrictEqual(h.list(), ['d', 'c', 'b']);
});

test('add：空白与非法输入不记录', () => {
  const h = createSearchHistory({ storage: null });
  assert.strictEqual(h.add('   '), false);
  assert.strictEqual(h.add(null), false);
  assert.deepStrictEqual(h.list(), []);
});

test('remove / clear', () => {
  const h = createSearchHistory({ storage: null });
  h.add('a'); h.add('b');
  assert.strictEqual(h.remove('A'), true);
  assert.deepStrictEqual(h.list(), ['b']);
  assert.strictEqual(h.remove('zzz'), false);
  h.clear();
  assert.deepStrictEqual(h.list(), []);
});

test('持久化：新实例恢复历史；clear 后不再复活', () => {
  const s = memStorage();
  const a = createSearchHistory({ storage: s });
  a.add('鸡排');
  a.add('奶茶');
  assert.deepStrictEqual(createSearchHistory({ storage: s }).list(), ['奶茶', '鸡排']);

  a.clear();
  assert.deepStrictEqual(createSearchHistory({ storage: s }).list(), []);
});

test('持久化：脏数据降级为空历史，绝不抛异常', () => {
  for (const raw of ['{', 'null', '"str"', '{"a":1}', '[1,2,3]', '[null,"  ",{}]']) {
    const s = memStorage();
    s.setItem('fbsearch:v1', raw);
    let h;
    assert.doesNotThrow(() => { h = createSearchHistory({ storage: s }); }, raw);
    assert.deepStrictEqual(h.list(), [], raw);
  }
});

test('持久化：重复项与超限项在恢复时被清洗', () => {
  const s = memStorage();
  s.setItem('fbsearch:v1', JSON.stringify(['a', 'A', 'b', '', '   ', 'c', 'd', 'e']));
  const h = createSearchHistory({ storage: s, limit: 3 });
  assert.deepStrictEqual(h.list(), ['a', 'b', 'c']);
});

test('storage 不可用（null）时照常工作，只是不落盘', () => {
  const h = createSearchHistory({ storage: null });
  h.add('x');
  assert.deepStrictEqual(h.list(), ['x']);
  assert.doesNotThrow(() => h.clear());
});

test('reload：另一处写入后能同步；无变化时返回 false', () => {
  const s = memStorage();
  const a = createSearchHistory({ storage: s });
  const b = createSearchHistory({ storage: s });
  a.add('鸡排');
  assert.strictEqual(b.reload(), true);
  assert.deepStrictEqual(b.list(), ['鸡排']);
  assert.strictEqual(b.reload(), false);
});
