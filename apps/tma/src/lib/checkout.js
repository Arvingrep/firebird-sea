// T4.4/T4.5/T4.6：下单与地址的纯逻辑（可被 node:test 直接测试）。
// 价格、优惠、积分一律由服务端计算：前端只提交菜品 id 与数量，不提交任何金额类字段。

export class ValidationError extends Error {
  constructor(code) { super(code); this.code = code; }
}

export function buildDealParams({ shopId, lines, addressId, note = '' }) {
  if (!lines || lines.length === 0) throw new ValidationError('CART_EMPTY');
  if (!addressId) throw new ValidationError('ADDRESS_REQUIRED');
  const content = lines.map((l) => {
    const qty = Number(l.qty);
    if (!Number.isInteger(qty) || qty <= 0) throw new ValidationError('QTY_INVALID');
    return { id: String(l.id), count: qty };
  });
  return {
    shop: String(shopId),
    address: String(addressId),
    order_content: JSON.stringify(content),
    preset: '[]',
    peitype: '0',
    note: String(note).slice(0, 200),
  };
}

// 地址表单：人名、电话、详细地址必填；电话只允许数字、+、空格、短横线
export function validateAddress(a) {
  const errors = {};
  if (!String(a.person || '').trim()) errors.person = 'REQUIRED';
  const tel = String(a.tel || '').trim();
  if (!tel) errors.tel = 'REQUIRED';
  else if (!/^[0-9+\- ]{6,20}$/.test(tel)) errors.tel = 'INVALID';
  if (!String(a.address || '').trim()) errors.address = 'REQUIRED';
  return errors;
}

export const ORDER_STATE = { 0: 'pending', 1: 'done', 2: 'paid', 3: 'preparing', 5: 'delivering', 6: 'cancelled' };
// 可取消状态以火鸟现有规则为准（cancelOrder 对 state 0 与 2 处理）
export const isCancellable = (state) => Number(state) === 0 || Number(state) === 2;
