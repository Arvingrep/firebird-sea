const test = require('node:test');
const assert = require('node:assert');
const { parseTransferAmount } = require('../amount');

test('默认按 6 位精度换算 USDT（含尾数）', () => {
  assert.strictEqual(parseTransferAmount({ value: '15030000' }), 15.03);
});

test('使用 token_info.decimals 指定的精度', () => {
  assert.strictEqual(parseTransferAmount({ value: '1500', token_info: { decimals: 2 } }), 15);
});
