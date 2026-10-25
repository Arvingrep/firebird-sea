import test from 'node:test';
import assert from 'node:assert';
import { createCart, formatPhp } from '../src/lib/cart.js';
import { createI18n, MESSAGE_KEYS, EN_KEYS } from '../src/lib/i18n.js';

const food = (id, price = '12.50') => ({ id, title: `F${id}`, price });

test('加入、累加、合计按分计算无浮点误差', () => {
  const c = createCart();
  assert.strictEqual(c.add(1, food(1, '0.10')), 'added');
  c.add(1, food(1, '0.10'));
  c.add(1, food(2, '0.20'));
  assert.strictEqual(c.totalCents(), 40);
  assert.strictEqual(formatPhp(c.totalCents()), '₱0.40');
  assert.strictEqual(c.count(), 3);
});

test('跨商家加入需确认：needs-switch，确认后清空再加', () => {
  const c = createCart();
  c.add(1, food(1));
  assert.strictEqual(c.add(2, food(9)), 'needs-switch');
  assert.strictEqual(c.shopId, '1');
  assert.strictEqual(c.switchShop(2, food(9)), 'added');
  assert.strictEqual(c.shopId, '2');
  assert.strictEqual(c.items().length, 1);
});

test('数量为 0 或负数会移除；空购物车不能下单', () => {
  const c = createCart();
  assert.strictEqual(c.canCheckout(), false);
  c.add(1, food(1));
  assert.strictEqual(c.canCheckout(), true);
  c.setQty(1, -3);
  assert.strictEqual(c.isEmpty(), true);
  assert.strictEqual(c.shopId, null);
  assert.strictEqual(c.canCheckout(), false);
});

test('非法价格被拒绝', () => {
  const c = createCart();
  assert.throws(() => c.add(1, food(1, 'abc')));
  assert.throws(() => c.add(1, food(1, '-1')));
});

test('i18n：默认中文，切换英文，缺失回退，两种语言 key 一致', () => {
  const i = createI18n();
  assert.strictEqual(i.lang, 'zh');
  assert.strictEqual(i.t('cart.title'), '购物车');
  i.setLang('en');
  assert.strictEqual(i.t('cart.title'), 'Cart');
  assert.strictEqual(i.t('no.such.key'), 'no.such.key');
  i.setLang('fr');
  assert.strictEqual(i.lang, 'en');
  assert.deepStrictEqual([...EN_KEYS].sort(), [...MESSAGE_KEYS].sort());
});

// —— QA 147 轮 2：缩略图派生规则（有图 / 无图 / 非法输入 / 带查询参数）——
import { _toThumb as toThumb } from '../src/lib/cart.js';

test('toThumb：https 有图剥查询串并拼 160 缩放参数', () => {
  const u = 'https://storage.googleapis.com/bkt/waimai/a.jpg?x-image-process=image/resize,w_4096';
  assert.strictEqual(toThumb([u]), 'https://storage.googleapis.com/bkt/waimai/a.jpg?x-image-process=image/resize,m_fill,w_160,h_160');
});
test('toThumb：无图 / 空数组 / http 明文 / 非字符串 一律 null', () => {
  assert.strictEqual(toThumb(undefined), null);
  assert.strictEqual(toThumb([]), null);
  assert.strictEqual(toThumb(['http://example.com/a.jpg']), null);
  assert.strictEqual(toThumb([42]), null);
});
test('toThumb：pic 落进购物车行（add 后可读）', () => {
  const c = createCart();
  c.add(1, { id: 9, title: 'X', price: '10', pics: ['https://storage.googleapis.com/bkt/p.png'] });
  assert.match(c.items()[0].pic, /^https:\/\/storage\.googleapis\.com\/bkt\/p\.png\?x-image-process/);
  const c2 = createCart();
  c2.add(1, { id: 9, title: 'X', price: '10' });
  assert.strictEqual(c2.items()[0].pic, null);
});
