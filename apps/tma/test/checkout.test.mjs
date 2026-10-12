import test from 'node:test';
import assert from 'node:assert';
import { buildDealParams, validateAddress, isCancellable, ValidationError } from '../src/lib/checkout.js';

const lines = [{ id: 5, qty: 2, priceCents: 100, title: 'x' }];

test('下单参数只含菜品 id 与数量，不含金额/优惠/积分类字段', () => {
  const p = buildDealParams({ shopId: 3, lines, addressId: 9, note: 'no spicy' });
  assert.strictEqual(p.shop, '3');
  assert.strictEqual(p.address, '9');
  assert.deepStrictEqual(JSON.parse(p.order_content), [{ id: '5', count: 2 }]);
  for (const k of ['tprice', 'quanid', 'quantype', 'openlevel', 'level', 'usePinput', 'peerpay', 'amount', 'price']) assert.strictEqual(k in p, false, k);
});

test('地址为空、购物车为空、数量非法均被前端拦截', () => {
  assert.throws(() => buildDealParams({ shopId: 1, lines, addressId: '' }), (e) => e instanceof ValidationError && e.code === 'ADDRESS_REQUIRED');
  assert.throws(() => buildDealParams({ shopId: 1, lines: [], addressId: 1 }), (e) => e.code === 'CART_EMPTY');
  assert.throws(() => buildDealParams({ shopId: 1, lines: [{ id: 1, qty: 0 }], addressId: 1 }), (e) => e.code === 'QTY_INVALID');
  assert.throws(() => buildDealParams({ shopId: 1, lines: [{ id: 1, qty: -2 }], addressId: 1 }), (e) => e.code === 'QTY_INVALID');
});

test('备注被截断到 200 字', () => {
  const p = buildDealParams({ shopId: 1, lines, addressId: 1, note: 'a'.repeat(500) });
  assert.strictEqual(p.note.length, 200);
});

test('地址校验：必填与电话格式', () => {
  assert.deepStrictEqual(validateAddress({ person: 'A', tel: '0917 123-4567', address: 'x' }), {});
  assert.deepStrictEqual(Object.keys(validateAddress({})).sort(), ['address', 'person', 'tel']);
  assert.strictEqual(validateAddress({ person: 'A', tel: 'abc', address: 'x' }).tel, 'INVALID');
});

test('可取消状态：待付款与已付款待接单', () => {
  assert.strictEqual(isCancellable(0), true);
  assert.strictEqual(isCancellable('2'), true);
  for (const s of [1, 3, 5, 6]) assert.strictEqual(isCancellable(s), false);
});
