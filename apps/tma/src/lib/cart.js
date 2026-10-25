// T4.3：购物车纯逻辑（Pinia store 的底座）。金额以"分"整数计算，展示时 /100 保留两位。
const toCents = (price) => Math.round(Number(price) * 100);

// 首图 → 160×160 缩略地址：仅接受 https 绝对地址；剥掉上游查询串后拼实时缩放参数。
// 注意（QA 147 轮 3 实测）：x-image-process 参数当前被 GCS 直出忽略（三种请求字节数一致，均为原图），
// 上游返回的 pics 本身自带该参数，说明规划了处理代理但尚未接入——参数先拼上，代理接入后缩放即自动生效；
// 接入前实际加载原图，由 <img> 的 56px 显示尺寸 + loading=lazy + @error 兜底。非 https / 非法输入一律 null。
function toThumb(pics) {
  const first = Array.isArray(pics) ? pics[0] : null;
  if (typeof first !== 'string' || !first.startsWith('https://')) return null;
  return first.split('?')[0] + '?x-image-process=image/resize,m_fill,w_160,h_160';
}

export function createCart() {
  let shopId = null;
  const lines = new Map(); // foodId -> { id, title, priceCents, qty }

  const api = {
    get shopId() { return shopId; },
    items() { return [...lines.values()]; },
    count() { return [...lines.values()].reduce((n, l) => n + l.qty, 0); },
    totalCents() { return [...lines.values()].reduce((n, l) => n + l.priceCents * l.qty, 0); },
    isEmpty() { return lines.size === 0; },
    // 返回 'added' | 'needs-switch'：加入其他商家的菜品须先确认清空
    add(shop, food) {
      if (shopId !== null && String(shopId) !== String(shop)) return 'needs-switch';
      const priceCents = toCents(food.price);
      if (!Number.isFinite(priceCents) || priceCents < 0) throw new Error('invalid price');
      shopId = String(shop);
      const cur = lines.get(String(food.id));
      if (cur) cur.qty += 1;
      else lines.set(String(food.id), {
        id: String(food.id), title: food.title, priceCents, qty: 1,
        // 首图缩略地址（上游 waimai:food 的 pics[0]，GCS 支持 x-image-process 实时缩放）；无图/非 https 一律为 null，
        // 非空 pic 必为可安全放进 <img src> 的 https 地址（QA 147 轮 2 minor）
        pic: toThumb(food.pics),
      });
      return 'added';
    },
    switchShop(shop, food) {
      api.clear();
      return api.add(shop, food);
    },
    setQty(foodId, qty) {
      const l = lines.get(String(foodId));
      if (!l) return;
      if (!Number.isInteger(qty) || qty <= 0) lines.delete(String(foodId));
      else l.qty = qty;
      if (lines.size === 0) shopId = null;
    },
    remove(foodId) { api.setQty(foodId, 0); },
    clear() { lines.clear(); shopId = null; },
    // 下单前校验：非空、数量为正整数
    canCheckout() {
      return lines.size > 0 && [...lines.values()].every((l) => Number.isInteger(l.qty) && l.qty > 0);
    },
  };
  return api;
}

export const formatPhp = (cents) => `₱${(cents / 100).toFixed(2)}`;
export const _toThumb = toThumb;
