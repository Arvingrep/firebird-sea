import test from 'node:test';
import assert from 'node:assert';
import { parseStartParam } from '../src/lib/startParam.js';

test('合法 shop_<id> 进入商家页', () => {
  assert.deepStrictEqual(parseStartParam('shop_12'), { name: 'shop', params: { id: '12' } });
});

test('非白名单格式一律忽略', () => {
  for (const bad of ['', 'shop_', 'shop_0', 'shop_-1', 'shop_1a', 'order_5', '../admin', 'shop_1;drop', 'javascript:alert(1)', 'a'.repeat(100), null, undefined, 42, {}]) {
    assert.strictEqual(parseStartParam(bad), null, String(bad));
  }
});

test('过长数字被拒绝（防整数溢出）', () => {
  assert.strictEqual(parseStartParam('shop_12345678901'), null);
});
