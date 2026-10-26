// 订单 → 配送地图视图模型（纯函数，node:test 直接覆盖）。
//
// 为什么要单独一层：OrderDetail.vue 里既要处理「坐标缺失」「轨迹为空」「骑手未接单」
// 这些分支，又要算距离和折线；塞进模板里就没法测了。这里统一算好，组件只管画。
//
// 坐标顺序的全部坑都在 geo.js 头注释里，这里只强调两条：
//   - 商家：coordX = 纬度，coordY = 经度（反的！）
//   - 订单：lat、lng 分列，peisongpath 是 "lng,lat;lng,lat"
import { toPoint, parsePath, lastPathPoint, simplify, project, haversineMeters, formatDistance, navUrl } from './geo.js';

// 需要展示地图的状态：3 商家已接单、4 骑手已接单、5 配送中。
// 对齐 H5（webroot/templates/member/touch/js/order-waimai.js:296-320）：
// 这三档都带 `.map_show`，其中 4/5 还会画骑手点。
// 0/2 阶段还没有配送可言；1/6 已结束，地图没意义。
export const MAP_STATES = [3, 4, 5];

// 只有骑手已接单之后才需要高频轮询位置。state 4→5 就是「取货出发」，
// 两者都在路上，所以都轮询；3 及以前骑手还没接单，没有轨迹可追。
export const TRACK_STATES = [4, 5];

const DEFAULT_SIZE = { width: 320, height: 168, pad: 26 };

export const shouldShowMap = (state) => MAP_STATES.includes(Number(state));
export const shouldTrack = (state) => TRACK_STATES.includes(Number(state));

// order: orderDetail 的返回；rawPath: 可选的覆盖值（轮询到的新轨迹优先于 order.peisongpath）
export function buildDeliveryView(order, rawPath, opts = {}) {
  const o = order && typeof order === 'object' ? order : {};
  const size = { ...DEFAULT_SIZE, ...opts };

  const shop = toPoint(o.coordX, o.coordY); // 注意：coordX 是纬度
  const dest = toPoint(o.lat, o.lng);
  const raw = typeof rawPath === 'string' ? rawPath : o.peisongpath;
  const courier = lastPathPoint(raw);
  const trail = simplify(parsePath(raw), 80);

  // 至少要有商家和收货点才能画出有意义的图；
  // 只有骑手点（没商家/没收货点）投出来是一个孤零零的圆，不如不画。
  const visible = !!(shop && dest);

  const marks = [];
  if (visible) {
    if (shop) marks.push({ role: 'shop', p: shop });
    if (dest) marks.push({ role: 'dest', p: dest });
    if (courier) marks.push({ role: 'courier', p: courier });
  }

  const all = [...marks.map((m) => m.p), ...trail];

  // 第一遍按默认画布投影，量出内容实际占的高度；
  // 宽画布 + 近乎正方形的路线会上下大片留白（等比缩放必然如此），
  // 所以按内容纵横比收缩画布高度（限定在 [MIN_H, MAX_H]），再投第二遍。
  const MIN_H = 118;
  const MAX_H = 210;
  let projected = project(all, size);
  if (projected.pts.length) {
    const ys = projected.pts.map((p) => p.y);
    const usedH = Math.max(...ys) - Math.min(...ys) + size.pad * 2;
    const finalH = Math.round(Math.min(MAX_H, Math.max(MIN_H, usedH)));
    if (Math.abs(finalH - size.height) > 6) {
      projected = project(all, { ...size, height: finalH });
    }
  }
  const at = (role) => {
    const i = marks.findIndex((m) => m.role === role);
    return i < 0 ? null : projected.pts[i] || null;
  };
  const trailPts = projected.pts.slice(marks.length);

  const totalMeters = shop && dest ? haversineMeters(shop, dest) : 0;
  // 骑手已上报位置 → 剩余距离按骑手算；否则给全程，文案由调用方区分。
  // 注意不能用 `remaining || total` 兜底：骑手正好到楼下时剩余是 0，
  // 会被当成「没有骑手」而显示全程距离——送达的那一刻数字反而跳大。
  const hasCourier = !!courier;
  const remainingMeters = hasCourier && dest ? haversineMeters(courier, dest) : 0;
  const distanceMeters = hasCourier ? remainingMeters : totalMeters;

  return {
    visible,
    tracking: hasCourier,
    width: projected.width,
    height: projected.height,
    marks: { shop: at('shop'), dest: at('dest'), courier: at('courier') },
    // SVG <polyline points="…">：两点以上才画线，单点画出来是空白
    polyline: trailPts.length > 1 ? trailPts.map((p) => `${p.x},${p.y}`).join(' ') : '',
    totalMeters,
    remainingMeters,
    distanceMeters,
    distanceText: formatDistance(distanceMeters),
    isRemaining: hasCourier,
    // 骑手就在收货点附近（<20m）：UI 应该显示「已到达」而不是「0 m」
    arrived: hasCourier && remainingMeters < 20,
    navUrl: navUrl(dest),
  };
}
