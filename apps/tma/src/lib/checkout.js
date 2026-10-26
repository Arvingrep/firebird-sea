// T4.4/T4.5/T4.6：下单与地址的纯逻辑（可被 node:test 直接测试）。
// 价格、优惠、积分一律由服务端计算：前端只提交菜品 id 与数量，不提交任何金额类字段。

export class ValidationError extends Error {
  constructor(code) { super(code); this.code = code; }
}

// paytype 必须显式传：上游 `$paytype = (int)$this->param['paytype']`，缺省取 0 会被当成
// 「在线支付」处理（落到 createPayForm 分支），订单停在 state=0，30 分钟后被
// include/cron/waimai_updateOrderState.php 判为「订单超时未支付」并取消。
// 1 = 货到付款（本 app 唯一支持的支付方式）。
export const PAY_TYPE_COD = '1';

export function buildDealParams({ shopId, lines, addressId, note = '', payType = PAY_TYPE_COD }) {
  if (!lines || lines.length === 0) throw new ValidationError('CART_EMPTY');
  if (!addressId) throw new ValidationError('ADDRESS_REQUIRED');
  const content = lines.map((l) => {
    const qty = Number(l.qty);
    if (!Number.isInteger(qty) || qty <= 0) throw new ValidationError('QTY_INVALID');
    return { id: String(l.id), count: qty };
  });
  const pt = String(payType);
  if (!/^[0-9]{1,2}$/.test(pt)) throw new ValidationError('PAYTYPE_INVALID');
  return {
    shop: String(shopId),
    address: String(addressId),
    order_content: JSON.stringify(content),
    preset: '[]',
    peitype: '0',
    note: String(note).slice(0, 200),
    paytype: pt,
  };
}

// deal 的返回形态分流（对齐 webroot/templates/waimai/touch/skin2/js/waimai_order.js:1198-1217）：
//   'delivery|<ordernum>' → 货到付款下单成功（服务端已收口为已支付）
//   'ok|<url>' / 'peerpay|<url>' → 零元单 / 代付，需要跳转
//   '<ordernum>'           → 纯订单号
//   { ordernum, orderurl } → 在线支付表单（本 app 无收银台，视为需网页支付）
export function parseDealResult(info) {
  if (info && typeof info === 'object') {
    return { ordernum: info.ordernum ? String(info.ordernum) : '', needOnline: true };
  }
  const s = typeof info === 'string' ? info.trim() : '';
  if (!s) return { ordernum: '', needOnline: false };
  const i = s.indexOf('|');
  if (i > 0) {
    const prefix = s.slice(0, i);
    const rest = s.slice(i + 1);
    if (prefix === 'delivery') return { ordernum: rest, needOnline: false };
    return { ordernum: '', needOnline: true, redirect: rest };
  }
  return { ordernum: s, needOnline: false };
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

// 状态值以 waimai.class.php 的写入点为准：
//   2 = 支付成功待接单（4408）
//   3 = 商家接单（qiangdan 之前即此态；骑手被取消也退回 3，8672）
//   4 = 骑手接单（qiangdan()，8112）
//   5 = 骑手取货出发/配送中（peisong() 的取货分支，8280）
//   1 = 已送达完成（peisong() 的送达分支，8378）
//   6 = 已取消（5251/5253）
// 4 之前漏了，会显示成「处理中」，而它恰好是骑手在路上的主干状态。
export const ORDER_STATE = { 0: 'pending', 1: 'done', 2: 'paid', 3: 'preparing', 4: 'accepted', 5: 'delivering', 6: 'cancelled' };
// 可取消状态以火鸟现有规则为准（cancelOrder 对 state 0 与 2 处理）
export const isCancellable = (state) => Number(state) === 0 || Number(state) === 2;

// 未支付订单的超时窗口，与 cron 的 1800 秒保持一致（waimai_updateOrderState.php:19）
export const PAY_TIMEOUT_MINUTES = 30;

// 取消原因：上游把原因文本写在 `failed` 字段，`orderDetail`（:6369）与 `order` 列表（:5995）
// 都会返回。已知的两类文案：
//   系统超时 → '订单超时未支付'（include/cron/waimai_updateOrderState.php:46）
//   用户主动 → '用户取消订单'（waimai.class.php:5253）
// 旧数据里还可能存着被注释掉的旧文案 '半小时内未支付，系统自动取消！<时间>'（同文件 :45），
// 所以判「系统自动」只按关键词匹配，不做全等比较。
const AUTO_CANCEL_RE = /超时|自动取消|系统取消/;

// 返回 null 表示没有原因（未取消、或上游没写）——调用方据此不渲染提示块。
export function cancelReason(order) {
  const raw = String((order && order.failed) || '').trim();
  if (!raw) return null;
  return { raw, auto: AUTO_CANCEL_RE.test(raw) };
}
