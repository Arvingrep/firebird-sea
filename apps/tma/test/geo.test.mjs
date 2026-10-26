import test from 'node:test';
import assert from 'node:assert';
import {
  toPoint, parsePath, simplify, project, haversineMeters, formatDistance, navUrl, isValidLat, isValidLng,
} from '../src/lib/geo.js';

test('toPoint：范围校验，非法与 0,0 占位一律 null', () => {
  assert.deepStrictEqual(toPoint('14.5', '120.9'), { lat: 14.5, lng: 120.9 });
  assert.strictEqual(toPoint(14.5, 200), null);   // 经度越界
  assert.strictEqual(toPoint(-91, 120), null);    // 纬度越界
  assert.strictEqual(toPoint('abc', 120), null);
  assert.strictEqual(toPoint(undefined, undefined), null);
  assert.strictEqual(toPoint(0, 0), null);        // "没填坐标"的典型占位
  assert.ok(isValidLat(90) && isValidLat(-90) && !isValidLat(90.1));
  assert.ok(isValidLng(180) && isValidLng(-180) && !isValidLng(180.1));
});

test('parsePath：lng,lat 顺序解析；坏点丢弃好点保留', () => {
  const p = parsePath('120.9,14.5;120.91,14.51');
  assert.deepStrictEqual(p, [{ lat: 14.5, lng: 120.9 }, { lat: 14.51, lng: 120.91 }]);
  // 第二个点纬度越界 → 丢弃
  assert.deepStrictEqual(parsePath('120.9,14.5;120.91,999'), [{ lat: 14.5, lng: 120.9 }]);
  assert.deepStrictEqual(parsePath(''), []);
  assert.deepStrictEqual(parsePath(null), []);
  assert.deepStrictEqual(parsePath('abc;def'), []);
  assert.deepStrictEqual(parsePath('120.9'), []); // 缺少纬度
});

test('parsePath：骑手停着上报的重复点被合并', () => {
  const p = parsePath('120.9,14.5;120.9,14.5;120.9,14.5;120.91,14.51');
  assert.strictEqual(p.length, 2);
});

test('parsePath：点数上限，防止一条几万点的轨迹拖死渲染', () => {
  const seg = Array.from({ length: 900 }, (_, i) => `120.${9000 + i},14.${5000 + i}`).join(';');
  assert.strictEqual(parsePath(seg).length, 500);
});

test('simplify：保留首尾，等距抽样', () => {
  const pts = Array.from({ length: 300 }, (_, i) => ({ lat: 14 + i * 0.001, lng: 120 + i * 0.001 }));
  const s = simplify(pts, 10);
  assert.strictEqual(s.length, 10);
  assert.deepStrictEqual(s[0], pts[0]);
  assert.deepStrictEqual(s[s.length - 1], pts[pts.length - 1]);
  assert.deepStrictEqual(simplify(pts, 1000), pts); // 不足上限原样返回
  assert.deepStrictEqual(simplify([], 10), []);
});

test('haversineMeters：已知两点距离（马尼拉市区约 1.1km）', () => {
  const a = { lat: 14.5547, lng: 121.0244 };
  const b = { lat: 14.5647, lng: 121.0244 }; // 纬度差 0.01° ≈ 1111m
  const d = haversineMeters(a, b);
  assert.ok(d > 1090 && d < 1130, `actual ${d}`);
  assert.strictEqual(haversineMeters(a, null), 0);
  assert.strictEqual(formatDistance(850), '850 m');
  assert.strictEqual(formatDistance(3200), '3.2 km');
  assert.strictEqual(formatDistance(0), '');
  assert.strictEqual(formatDistance(NaN), '');
});

test('project：等比投影、y 轴向下、居中留边', () => {
  const pts = [{ lat: 14.5, lng: 120.9 }, { lat: 14.6, lng: 121.0 }];
  const r = project(pts, { width: 200, height: 100, pad: 10 });
  assert.strictEqual(r.pts.length, 2);
  // 纬度大的在上（y 小）
  assert.ok(r.pts[1].y < r.pts[0].y, '纬度大的点应该更靠上');
  // 经度大的在右
  assert.ok(r.pts[1].x > r.pts[0].x, '经度大的点应该更靠右');
  for (const p of r.pts) {
    assert.ok(p.x >= 0 && p.x <= 200, `x ${p.x}`);
    assert.ok(p.y >= 0 && p.y <= 100, `y ${p.y}`);
  }
});

test('project：单点 / 重合点不会出现 NaN 或越界', () => {
  const one = project([{ lat: 14.5, lng: 120.9 }], { width: 200, height: 100, pad: 10 });
  assert.strictEqual(one.pts.length, 1);
  assert.ok(Number.isFinite(one.pts[0].x) && Number.isFinite(one.pts[0].y));
  assert.ok(one.pts[0].x >= 10 && one.pts[0].x <= 100, '单点应落在居中位置');
  assert.ok(one.pts[0].y >= 10 && one.pts[0].y <= 50);

  const dup = project([{ lat: 14.5, lng: 120.9 }, { lat: 14.5, lng: 120.9 }], { width: 200, height: 100 });
  assert.ok(dup.pts.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)));
});

test('project：非法点被过滤；空输入返回空 pts', () => {
  const r = project([{ lat: 14.5, lng: 120.9 }, null, { lat: 999, lng: 0 }], { width: 200, height: 100 });
  assert.strictEqual(r.pts.length, 1);
  assert.deepStrictEqual(project([], { width: 200, height: 100 }).pts, []);
  assert.deepStrictEqual(project(null).pts, []);
});

test('project：经度按纬度余弦压缩，低纬度城市不会被横向拉长', () => {
  // 同样 0.01° 的经纬差，在赤道附近是正方形，在高纬度则经度方向应更短
  const eq = project([{ lat: 0, lng: 0.01 }, { lat: 0.01, lng: 0 }], { width: 200, height: 200, pad: 0 });
  const high = project([{ lat: 60, lng: 0.01 }, { lat: 60.01, lng: 0 }], { width: 200, height: 200, pad: 0 });
  const eqW = Math.abs(eq.pts[1].x - eq.pts[0].x);
  const highW = Math.abs(high.pts[1].x - high.pts[0].x);
  assert.ok(highW < eqW * 0.6, `高纬度经度方向应明显更短：eq=${eqW} high=${highW}`);
});

test('navUrl：生成可唤起系统地图的深链；非法坐标返回空串', () => {
  const u = navUrl({ lat: 14.5, lng: 120.9 });
  assert.match(u, /^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&destination=14\.5,120\.9/);
  assert.strictEqual(navUrl(null), '');
  assert.strictEqual(navUrl({ lat: 999, lng: 0 }), '');
});
