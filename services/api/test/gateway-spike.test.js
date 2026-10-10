// Story 1.2 网关技术验证（spike）
// 静态部分：对照火鸟 waimai.class.php 源码核对 AD-2 假设；联机部分：设置 FBS_GATEWAY_URL/FBS_GATEWAY_SECRET 后对本地 docker(8080) 实测
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const gw = require('../src/gatewayClient');

const root = path.join(__dirname, '../../..');
const src = fs.readFileSync(path.join(root, 'webroot/api/handlers/waimai.class.php'), 'utf8');
const method = (name) => {
  const start = src.indexOf(`public function ${name}(`);
  assert.ok(start > 0, `${name} 不存在`);
  const next = src.indexOf('\n    public function ', start + 10);
  return src.slice(start, next > 0 ? next : undefined);
};

test('网关签名可复现且随内容变化', () => {
  const a = gw.sign('s', '1', 'deal', '{}');
  assert.match(a, /^[0-9a-f]{64}$/);
  assert.strictEqual(a, gw.sign('s', '1', 'deal', '{}'));
  assert.notStrictEqual(a, gw.sign('s', '2', 'deal', '{}'));
  assert.notStrictEqual(a, gw.sign('s', '1', 'order_paid', '{}'));
});

test('AC1 deal()：在线支付走 createPayForm，仅余额/货到付款分支同步写 pay_log(state=1)', () => {
  const body = method('deal');
  assert.match(body, /createPayForm\("waimai"/);
  assert.match(body, /INSERT INTO `#@__pay_log`[^"]*'waimai'[^"]*, 0, '\$paytype', 1,/);
});

test('AC1 paySuccess（order_paid 落点）把订单置为 state 2', () => {
  assert.match(method('paySuccess'), /SET `state` = 2, `ordernumstore`/);
});

test('AC2 cancelOrder：已付(state 2)取消落 state 6 且 refrundstate=1，未付仅 state 6；不使用 state 7', () => {
  const body = method('cancelOrder');
  assert.match(body, /SET `state` = 6, `refrundstate` = 1/);
  assert.match(body, /SET `state` = 6,`failed` = '用户取消订单'/);
  assert.doesNotMatch(body, /SET `state` = 7/);
});

const cfg = { baseUrl: process.env.FBS_GATEWAY_URL, secret: process.env.FBS_GATEWAY_SECRET };
const live = { skip: cfg.baseUrl && cfg.secret ? false : '未设置 FBS_GATEWAY_URL/FBS_GATEWAY_SECRET' };

test('AC1 联机：deal → order_paid 后订单 state=2', live, async () => {
  const d = await gw.deal(cfg, { uid: Number(process.env.FBS_TEST_UID), sid: Number(process.env.FBS_TEST_SID) });
  assert.ok(d.ordernum, '缺 ordernum');
  const p = await gw.orderPaid(cfg, { ordernum: d.ordernum, paytype: 'usdt' });
  assert.strictEqual(p.order.state, 2);
});

test('AC2 联机：已付订单取消后记录 state 与 refrundstate', live, async () => {
  const d = await gw.deal(cfg, { uid: Number(process.env.FBS_TEST_UID), sid: Number(process.env.FBS_TEST_SID) });
  await gw.orderPaid(cfg, { ordernum: d.ordernum, paytype: 'usdt' });
  const c = await gw.cancelOrder(cfg, { ordernum: d.ordernum, uid: Number(process.env.FBS_TEST_UID) });
  assert.strictEqual(c.order.state, 6);
  assert.strictEqual(Number(c.order.refrundstate), 1);
});
