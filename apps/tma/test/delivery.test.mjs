import test from 'node:test';
import assert from 'node:assert';
import { buildDeliveryView, shouldShowMap, shouldTrack, MAP_STATES } from '../src/lib/delivery.js';
import { lastPathPoint } from '../src/lib/geo.js';

// 马尼拉真实量级：纬度 ~14.6，经度 ~121.0
const ORDER = {
  coordX: 14.5995, // 商家纬度
  coordY: 120.9842, // 商家经度
  lat: 14.6095,
  lng: 120.9742,
  // 骑手在途中（末点还没到收货点）
  peisongpath: '120.9842,14.5995;120.9800,14.6040;120.9780,14.6070',
};

test('完整订单：三个标记齐全、有折线、有距离', () => {
  const v = buildDeliveryView(ORDER);
  assert.strictEqual(v.visible, true);
  assert.strictEqual(v.tracking, true);
  assert.ok(v.marks.shop && v.marks.dest && v.marks.courier);
  assert.ok(v.polyline.includes(','));
  assert.ok(v.distanceText.length > 0);
  assert.strictEqual(v.isRemaining, true);
});

test('coordX 按纬度解析（传反会导致点被丢弃、地图空白）', () => {
  // 正常顺序能画出来
  assert.strictEqual(buildDeliveryView(ORDER).visible, true);
  // 把 coordX/coordY 互换 = 纬度位塞了经度 121 → isValidLat 拒绝 → 商家缺失 → 不画
  const swapped = buildDeliveryView({ ...ORDER, coordX: 120.9842, coordY: 14.5995 });
  assert.strictEqual(swapped.visible, false);
  assert.strictEqual(swapped.marks.shop, null);
});

test('缺商家坐标或收货坐标都不画图', () => {
  assert.strictEqual(buildDeliveryView({ ...ORDER, coordX: 0, coordY: 0 }).visible, false);
  assert.strictEqual(buildDeliveryView({ ...ORDER, lat: '', lng: null }).visible, false);
  assert.strictEqual(buildDeliveryView(null).visible, false);
  assert.strictEqual(buildDeliveryView({}).visible, false);
});

test('没有轨迹：不显示骑手点，距离退回全程', () => {
  const v = buildDeliveryView({ ...ORDER, peisongpath: '' });
  assert.strictEqual(v.visible, true);
  assert.strictEqual(v.tracking, false);
  assert.strictEqual(v.marks.courier, null);
  assert.strictEqual(v.polyline, '');
  assert.strictEqual(v.isRemaining, false);
  assert.ok(v.totalMeters > 0);
  assert.strictEqual(v.distanceMeters, v.totalMeters);
});

test('rawPath 覆盖 order.peisongpath（轮询到的新位置优先）', () => {
  const v = buildDeliveryView({ ...ORDER, peisongpath: '' }, '120.9790,14.6060');
  assert.strictEqual(v.tracking, true);
  assert.ok(v.remainingMeters > 0);
});

test('剩余距离小于全程距离（骑手在途中）', () => {
  const v = buildDeliveryView(ORDER);
  assert.ok(v.remainingMeters < v.totalMeters, `${v.remainingMeters} 应小于 ${v.totalMeters}`);
  assert.strictEqual(v.arrived, false);
});

test('骑手已到收货点：剩余 0 不能被当成「没有骑手」而回退成全程', () => {
  const v = buildDeliveryView({ ...ORDER, peisongpath: '120.9842,14.5995;120.9742,14.6095' });
  assert.strictEqual(v.isRemaining, true);
  assert.strictEqual(v.remainingMeters, 0);
  assert.strictEqual(v.arrived, true);
  // 关键：不能变成 totalMeters
  assert.notStrictEqual(v.distanceMeters, v.totalMeters);
});

test('轨迹里的坏点被跳过，末点仍能取到', () => {
  const v = buildDeliveryView(ORDER, '120.9800,14.6040;bad;;120.9742,14.6095');
  assert.strictEqual(v.tracking, true);
});

test('lastPathPoint 从后往前取第一个合法点', () => {
  assert.deepStrictEqual(lastPathPoint('120.9742,14.6095'), { lat: 14.6095, lng: 120.9742 });
  assert.deepStrictEqual(lastPathPoint('120.9,14.5;0,0'), { lat: 14.5, lng: 120.9 });
  assert.deepStrictEqual(lastPathPoint('120.9,14.5;bogus'), { lat: 14.5, lng: 120.9 });
  assert.strictEqual(lastPathPoint(''), null);
  assert.strictEqual(lastPathPoint(null), null);
});

test('地图状态：商家接单/骑手接单/配送中才展示，骑手接单后才轮询', () => {
  assert.deepStrictEqual(MAP_STATES, [3, 4, 5]);
  assert.strictEqual(shouldShowMap(3), true);
  assert.strictEqual(shouldShowMap(5), true);
  assert.strictEqual(shouldShowMap('5'), true);
  assert.strictEqual(shouldShowMap(2), false);
  assert.strictEqual(shouldShowMap(6), false);
  // state 4 是骑手已接单，人已在路上（qiangdan() 写 4），必须轮询
  assert.strictEqual(shouldTrack(4), true);
  assert.strictEqual(shouldTrack(5), true);
  assert.strictEqual(shouldTrack(3), false);
  assert.strictEqual(shouldTrack(1), false);
});

test('投影坐标都落在画布内', () => {
  const v = buildDeliveryView(ORDER);
  for (const p of [v.marks.shop, v.marks.dest, v.marks.courier]) {
    assert.ok(p.x >= 0 && p.x <= v.width, `x=${p.x}`);
    assert.ok(p.y >= 0 && p.y <= v.height, `y=${p.y}`);
  }
});

test('navUrl 指向收货点', () => {
  assert.ok(buildDeliveryView(ORDER).navUrl.includes('destination=14.6095,120.9742'));
  assert.strictEqual(buildDeliveryView({}).navUrl, '');
});
