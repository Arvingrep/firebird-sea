import test from 'node:test';
import assert from 'node:assert';
import { parseStartParam } from '../src/lib/startParam.js';

test('合法 shop_<id> 进入商家页', () => {
  assert.deepStrictEqual(parseStartParam('shop_12'), { name: 'shop', params: { id: '12' } });
});

test('合法 addr_<32 hex> 进入地址页并带 share token', () => {
  const token = '0123456789abcdef0123456789abcdef';
  assert.deepStrictEqual(parseStartParam(`addr_${token}`), { name: 'addresses', query: { share: token } });
});

test('非法 addr_ 形式一律忽略（长度/大小写/字符集）', () => {
  for (const bad of [
    'addr_', 'addr_short', 'addr_' + 'A'.repeat(32), 'addr_' + 'g'.repeat(32),
    'addr_' + 'a'.repeat(31), 'addr_' + 'a'.repeat(33), 'addr_' + '../'.repeat(8),
  ]) {
    assert.strictEqual(parseStartParam(bad), null, bad);
  }
});

test('非白名单格式一律忽略', () => {
  for (const bad of ['', 'shop_', 'shop_0', 'shop_-1', 'shop_1a', 'order_5', '../admin', 'shop_1;drop', 'javascript:alert(1)', 'a'.repeat(100), null, undefined, 42, {}]) {
    assert.strictEqual(parseStartParam(bad), null, String(bad));
  }
});

test('过长数字被拒绝（防整数溢出）', () => {
  assert.strictEqual(parseStartParam('shop_12345678901'), null);
});
