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

// —— 建议 4：购物车持久化（刷新不再丢单）——

const memStorage = () => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: (k) => { m.delete(k); },
    _raw: (k) => m.get(k),
  };
};

test('持久化：新实例从同一存储恢复商品、数量、店铺与起送价', () => {
  const s = memStorage();
  const a = createCart({ storage: s });
  a.setShopMeta(7, { name: 'A 店', minOrderCents: 500 });
  a.add(7, food(1, '12.50'));
  a.add(7, food(1, '12.50'));
  a.add(7, food(2, '5.00'));

  const b = createCart({ storage: s });
  assert.strictEqual(b.shopId, '7');
  assert.strictEqual(b.count(), 3);
  assert.strictEqual(b.totalCents(), 3000);
  assert.strictEqual(b.shopMeta.id, '7');
  assert.strictEqual(b.shopMeta.name, 'A 店');
  assert.strictEqual(b.shopMeta.minOrderCents, 500);
  assert.ok(Number.isFinite(b.shopMeta.ts) && b.shopMeta.ts > 0, 'ts 用于判断门槛新鲜度');
  assert.strictEqual(b.items()[0].title, 'F1');
});

test('持久化：清空后不再复活；数量归零同样同步落盘', () => {
  const s = memStorage();
  const a = createCart({ storage: s });
  a.add(1, food(1));
  a.clear();
  assert.strictEqual(createCart({ storage: s }).count(), 0);

  a.add(1, food(1));
  a.setQty(1, 0);
  const b = createCart({ storage: s });
  assert.strictEqual(b.count(), 0);
  assert.strictEqual(b.shopId, null);
});

test('持久化：脏数据一律降级为空车，绝不抛异常', () => {
  const cases = [
    '{', 'null', '[]', '{"v":2,"shopId":"1","lines":[{"id":"1"}]}',
    '{"v":1,"shopId":null,"lines":[{"id":"1","title":"x","priceCents":1,"qty":1}]}',
    '{"v":1,"shopId":"1","lines":[]}',
  ];
  for (const raw of cases) {
    const s = memStorage();
    s.setItem('fbcart:v1', raw);
    let c;
    assert.doesNotThrow(() => { c = createCart({ storage: s }); });
    assert.strictEqual(c.count(), 0, raw);
    assert.strictEqual(c.shopId, null, raw);
  }
});

test('持久化：逐行校验，坏行被丢弃好行保留；非 https 图片降级为 null', () => {
  const s = memStorage();
  s.setItem('fbcart:v1', JSON.stringify({
    v: 1, shopId: '3',
    lines: [
      { id: '1', title: '好行', priceCents: 1000, qty: 2, pic: 'https://x/y.png' },
      { id: '2', title: '负数价', priceCents: -1, qty: 1 },
      { id: '3', title: '零数量', priceCents: 100, qty: 0 },
      { id: '4', title: '小数数量', priceCents: 100, qty: 1.5 },
      { id: '5', title: '超量', priceCents: 100, qty: 1000 },
      { id: '6', title: '明文图', priceCents: 100, qty: 1, pic: 'http://x/y.png' },
      { title: '无 id', priceCents: 100, qty: 1 },
    ],
  }));
  const c = createCart({ storage: s });
  assert.deepStrictEqual(c.items().map((l) => l.id), ['1', '6']);
  assert.strictEqual(c.totalCents(), 2100);
  assert.strictEqual(c.items()[0].pic, 'https://x/y.png');
  assert.strictEqual(c.items()[1].pic, null);
});

test('持久化：storage 不可用（null）时照常工作，只是不落盘', () => {
  const c = createCart({ storage: null });
  c.add(1, food(1));
  assert.strictEqual(c.count(), 1);
  assert.doesNotThrow(() => c.clear());
});

// —— 建议 4：起送价校验（不再"填完地址才知金额不足"）——

test('起送价：未达门槛时禁止下单，并算出差额', () => {
  const c = createCart({ storage: null });
  c.setShopMeta(1, { name: 'A', minOrderCents: 500 });
  c.add(1, food(1, '2.00'));
  assert.strictEqual(c.minOrderCents(), 500);
  assert.strictEqual(c.shortfallCents(), 300);
  assert.strictEqual(c.meetsMinimum(), false);
  assert.strictEqual(c.canCheckout(), true);      // 车本身没问题
  assert.strictEqual(c.canPlaceOrder(), false);   // 但不能结算

  c.setQty(1, 3);
  assert.strictEqual(c.shortfallCents(), 0);
  assert.strictEqual(c.canPlaceOrder(), true);
});

test('起送价：未知（无 meta）一律按 0 处理，不拦人', () => {
  const c = createCart({ storage: null });
  c.add(1, food(1, '1.00'));
  assert.strictEqual(c.minOrderCents(), 0);
  assert.strictEqual(c.canPlaceOrder(), true);
});

// —— QA 171 轮 1 major：清空/切店后起送价静默变 0（两条常见路径）——

test('起送价：把最后一份减到 0 再重新加菜，门槛仍然有效', () => {
  const c = createCart({ storage: null });
  c.setShopMeta(1, { name: 'A', minOrderCents: 500 });
  c.add(1, food(1, '2.00'));
  assert.strictEqual(c.shortfallCents(), 300);

  c.setQty(1, 0);                       // 店铺页点减号减到 0
  assert.strictEqual(c.shopId, null);
  assert.strictEqual(c.minOrderCents(), 0); // 车空着，谈不上门槛

  c.add(1, food(1, '2.00'));            // 同一页立刻又加回来
  assert.strictEqual(c.shopId, '1');
  assert.strictEqual(c.minOrderCents(), 500);
  assert.strictEqual(c.shortfallCents(), 300);
  assert.strictEqual(c.canPlaceOrder(), false);
});

test('起送价：清空购物车后在同一家店加菜，门槛仍然有效', () => {
  const c = createCart({ storage: null });
  c.setShopMeta(1, { minOrderCents: 500 });
  c.add(1, food(1, '2.00'));
  c.clear();
  assert.strictEqual(c.minOrderCents(), 0);
  c.add(1, food(1, '2.00'));
  assert.strictEqual(c.minOrderCents(), 500);
});

test('起送价：逛 B 店被拒不污染 A 门槛，确认切店后取 B 的门槛', () => {
  const c = createCart({ storage: null });
  c.setShopMeta(1, { name: 'A', minOrderCents: 100 });
  c.add(1, food(1, '1.00'));

  // 车属于 A，B 店的 setShopMeta 不能绑上去，但必须记住
  assert.strictEqual(c.setShopMeta(2, { name: 'B', minOrderCents: 900 }), false);
  assert.strictEqual(c.minOrderCents(), 100);
  assert.strictEqual(c.shopMeta.name, 'A');

  // 用户确认换店 → 起送价立刻取 B 店的值（而不是退化成 0 放行）
  c.switchShop(2, food(9, '1.00'));
  assert.strictEqual(c.shopId, '2');
  assert.strictEqual(c.minOrderCents(), 900);
  assert.strictEqual(c.shortfallCents(), 800);
  assert.strictEqual(c.canPlaceOrder(), false);
});

test('起送价：门槛为 0 视同无门槛', () => {
  const c = createCart({ storage: null });
  c.setShopMeta(1, { minOrderCents: 0 });
  c.add(1, food(1, '0.10'));
  assert.strictEqual(c.shortfallCents(), 0);
  assert.strictEqual(c.canPlaceOrder(), true);
});

// —— QA 171 轮 1 minor：快照会过期，旧门槛不能永久卡人 ——

test('起送价：快照超过 TTL 按未知处理（不拦人）', () => {
  let clock = 1_000_000;
  const c = createCart({ storage: null, now: () => clock, ttlMs: 60_000 });
  c.setShopMeta(1, { minOrderCents: 500 });
  c.add(1, food(1, '1.00'));
  assert.strictEqual(c.minOrderCents(), 500);

  clock += 59_000;
  assert.strictEqual(c.minOrderCents(), 500);   // 未过期

  clock += 2_000;
  assert.strictEqual(c.minOrderCents(), 0);     // 过期 → 未知 → 放行
  assert.strictEqual(c.canPlaceOrder(), true);
});

test('起送价：刷新店铺信息后续期', () => {
  let clock = 1_000_000;
  const c = createCart({ storage: null, now: () => clock, ttlMs: 60_000 });
  c.setShopMeta(1, { minOrderCents: 500 });
  c.add(1, food(1, '1.00'));
  clock += 61_000;
  assert.strictEqual(c.minOrderCents(), 0);
  c.setShopMeta(1, { minOrderCents: 500 });     // 进店/购物车页刷新
  assert.strictEqual(c.minOrderCents(), 500);
});

test('reload：脏数据 / 无快照都不动内存，绝不清空正在操作的购物车', () => {
  const s = memStorage();
  const c = createCart({ storage: s });
  c.add(1, food(1));

  s.setItem('fbcart:v1', '{');            // 坏 JSON
  assert.strictEqual(c.reload(), false);
  assert.strictEqual(c.count(), 1);       // 脏数据 → 保持现状

  s.setItem('fbcart:v1', '{"v":9}');      // 版本不符
  assert.strictEqual(c.reload(), false);
  assert.strictEqual(c.count(), 1);

  s.removeItem('fbcart:v1');              // 压根没有快照
  assert.strictEqual(c.reload(), false);
  assert.strictEqual(c.count(), 1);

  const c2 = createCart({ storage: null });
  c2.add(1, food(1));
  assert.strictEqual(c2.reload(), false);  // 无 storage
  assert.strictEqual(c2.count(), 1);
});

// —— QA 171 轮 2 major：reload 不能把 seenMeta 抹掉，否则上一轮的修复被一次前后台切换打回原形 ——

test('reload 保留门槛：减到 0 → 切后台回来 → 再加菜仍然拦', () => {
  const s = memStorage();
  const c = createCart({ storage: s });
  c.setShopMeta(1, { name: 'A', minOrderCents: 500 });
  c.add(1, food(1, '2.00'));
  c.setQty(1, 0);                          // 空车快照落盘，shop 里留着 A 的门槛

  assert.strictEqual(c.reload(), true);    // visibilitychange / storage 事件
  assert.strictEqual(c.count(), 0);
  c.add(1, food(1, '2.00'));               // 同一页再加回来
  assert.strictEqual(c.minOrderCents(), 500);
  assert.strictEqual(c.canPlaceOrder(), false);
});

test('reload 保留 seenMeta：A 店车 + 逛过 B 店 → 切后台回来 → 换店取 B 门槛', () => {
  const s = memStorage();
  const c = createCart({ storage: s });
  c.setShopMeta(1, { minOrderCents: 100 });
  c.add(1, food(1, '1.00'));
  assert.strictEqual(c.setShopMeta(2, { name: 'B', minOrderCents: 900 }), false); // 只写 seenMeta

  assert.strictEqual(c.reload(), true);    // 切后台再回来
  c.switchShop(2, food(9, '1.00'));
  assert.strictEqual(c.shopId, '2');
  assert.strictEqual(c.minOrderCents(), 900);
  assert.strictEqual(c.canPlaceOrder(), false);
});

test('另一标签页清空车 → reload 同步清空（空车快照是合法快照）', () => {
  const s = memStorage();
  const a = createCart({ storage: s });
  a.setShopMeta(1, { minOrderCents: 500 });
  a.add(1, food(1, '2.00'));

  const b = createCart({ storage: s });
  assert.strictEqual(b.count(), 1);

  a.clear();
  assert.strictEqual(b.reload(), true);
  assert.strictEqual(b.count(), 0);
  assert.strictEqual(b.shopId, null);
  // 车空了但门槛还在：b 再加同一家店仍然按 500 拦
  b.add(1, food(1, '2.00'));
  assert.strictEqual(b.minOrderCents(), 500);
});

test('一致性守卫：有店无菜 / 有菜无店 的残缺快照一律拒收', () => {
  const s = memStorage();
  const c = createCart({ storage: s });
  c.add(1, food(1));

  s.setItem('fbcart:v1', JSON.stringify({ v: 1, shopId: '3', lines: [] }));
  assert.strictEqual(c.reload(), false);
  assert.strictEqual(c.count(), 1);        // 未被动过

  s.setItem('fbcart:v1', JSON.stringify({
    v: 1, shopId: null, lines: [{ id: '1', title: 'x', priceCents: 100, qty: 1 }],
  }));
  assert.strictEqual(c.reload(), false);
  assert.strictEqual(c.count(), 1);
});

test('多标签页：另一方写入后 reload 能看到最新车', () => {
  const s = memStorage();
  const a = createCart({ storage: s });
  a.setShopMeta(1, { minOrderCents: 500 });
  a.add(1, food(1, '2.00'));

  const b = createCart({ storage: s });   // 另一个 WebView
  assert.strictEqual(b.count(), 1);
  a.add(1, food(1, '2.00'));
  assert.strictEqual(b.count(), 1);       // 还没同步
  assert.strictEqual(b.reload(), true);
  assert.strictEqual(b.count(), 2);       // 同步后一致
});
