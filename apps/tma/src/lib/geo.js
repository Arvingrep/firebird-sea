// 配送轨迹的纯几何逻辑（node:test 直接覆盖，不依赖 DOM）。
//
// 数据来源的三个坑，写在这里免得后来人踩：
// 1. 订单表 `lng`/`lat` 是分列存储的**正序**值；
//    `peisongpath` 是 `"lng,lat;lng,lat;…"` 字符串（waimai.class.php:9151 用 `$lng . "," . $lat` 拼）。
//    两者顺序不同，别混。
// 2. 商家表 `coordX` 是**纬度**、`coordY` 是**经度**（名字很误导）：
//    - webroot/templates/courier/detail.html:20 → `{"lng": coordY, "lat": coordX}`
//    - courier/js/map.js:708 → `new google.maps.LatLng(coordX, coordY)`（LatLng 纬度在前）
//    - waimai.class.php:504 的 SQL 距离公式把 `s.coordX` 放在纬度项
//    传反了不会报错，只会让点被 isValidLat/isValidLng 丢掉、地图空白，很难查。
// 3. 上游的 `juli` / `julishop` 字段不可信：orderDetail 用
//    `getDistance($coordX, $coordY, $lat, $lng)` 算，而 getDistance 的签名是
//    `($lng1, $lat1, $lng2, $lat2)`（webroot/include/common.func.php:8687）——经纬传反了。
//    要距离就自己用 haversineMeters 算，别读这两个字段。

const MAX_PATH_POINTS = 500;
// 相邻点距离小于这个值（米）就丢掉：骑手停着不动时会上报一堆重复坐标
const MIN_STEP_METERS = 8;

export const isValidLat = (v) => Number.isFinite(v) && v >= -90 && v <= 90;
export const isValidLng = (v) => Number.isFinite(v) && v >= -180 && v <= 180;

// 单点校验：非法返回 null，绝不返回 "NaN,undefined" 这种能画崩图的值
export function toPoint(lat, lng) {
  const la = Number(lat);
  const ln = Number(lng);
  if (!isValidLat(la) || !isValidLng(ln)) return null;
  if (la === 0 && ln === 0) return null; // 0,0 是"没填坐标"的典型占位值
  return { lat: la, lng: ln };
}

export function haversineMeters(a, b) {
  if (!a || !b) return 0;
  const R = 6371000;
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

// 解析 peisongpath。坏点丢弃，好点保留；相邻重复（骑手停着）合并。
export function parsePath(raw) {
  if (typeof raw !== 'string' || !raw) return [];
  const out = [];
  for (const seg of raw.split(';')) {
    const [lngRaw, latRaw] = seg.split(',');
    const p = toPoint(latRaw, lngRaw); // 注意顺序：字符串里是 lng,lat
    if (!p) continue;
    const last = out[out.length - 1];
    if (last && haversineMeters(last, p) < MIN_STEP_METERS) continue;
    out.push(p);
    if (out.length >= MAX_PATH_POINTS) break;
  }
  return out;
}

// 取轨迹最后一个有效点 = 骑手当前上报位置。
// 不能直接用 parsePath 的末项：那里会合并 <8m 的相邻点，原地挪几米就被吞掉，
// 而「剩余距离」对这个末点很敏感。所以这里从后往前找第一个合法点。
export function lastPathPoint(raw) {
  if (typeof raw !== 'string' || !raw) return null;
  const segs = raw.split(';');
  for (let i = segs.length - 1; i >= 0; i -= 1) {
    const [lngRaw, latRaw] = segs[i].split(',');
    const p = toPoint(latRaw, lngRaw);
    if (p) return p;
  }
  return null;
}

// 等距抽样到 max 个点（保留首尾）。轨迹动辄几百点，全画进 SVG 既慢又没意义。
export function simplify(points, max = 120) {
  const arr = Array.isArray(points) ? points : [];
  if (arr.length <= max || max < 2) return arr.slice(0, Math.max(max, 0));
  const step = (arr.length - 1) / (max - 1);
  const out = [];
  for (let i = 0; i < max; i += 1) out.push(arr[Math.round(i * step)]);
  return out;
}

// 把经纬度等比投影到 width×height 的画布内（y 轴向下），四周留 pad。
// 经度差要乘 cos(纬度) 才是地面真实距离，否则马尼拉这种低纬度城市的图形会被横向拉长。
export function project(points, { width = 300, height = 160, pad = 18 } = {}) {
  const pts = (Array.isArray(points) ? points : []).filter((p) => toPoint(p && p.lat, p && p.lng));
  if (pts.length === 0) return { pts: [], width, height };

  const lats = pts.map((p) => p.lat);
  const lngs = pts.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const midLat = (minLat + maxLat) / 2;
  const kx = Math.cos((midLat * Math.PI) / 180);

  const spanX = (maxLng - minLng) * kx;
  const spanY = maxLat - minLat;
  const innerW = Math.max(1, width - pad * 2);
  const innerH = Math.max(1, height - pad * 2);

  // 单点或重合点时给个最小跨度，避免除零后全部叠在角落
  const scale = spanX <= 1e-9 && spanY <= 1e-9
    ? 0
    : Math.min(innerW / Math.max(spanX, 1e-9), innerH / Math.max(spanY, 1e-9));

  const drawW = spanX * scale;
  const drawH = spanY * scale;
  const offsetX = pad + Math.max(0, (innerW - drawW) / 2);
  const offsetY = pad + Math.max(0, (innerH - drawH) / 2);

  return {
    pts: pts.map((p) => ({
      x: +(offsetX + (p.lng - minLng) * kx * scale).toFixed(2),
      // 纬度越大越靠上，所以用 maxLat 减
      y: +(offsetY + (maxLat - p.lat) * scale).toFixed(2),
    })),
    width,
    height,
  };
}

export function formatDistance(meters) {
  const m = Number(meters);
  if (!Number.isFinite(m) || m <= 0) return '';
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

// 用系统地图打开（不需要任何 key / SDK）。iOS/Android 会自动唤起对应地图 App。
export function navUrl(point) {
  const p = toPoint(point && point.lat, point && point.lng);
  if (!p) return '';
  return `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}&travelmode=driving`;
}

export const _MAX_PATH_POINTS = MAX_PATH_POINTS;
