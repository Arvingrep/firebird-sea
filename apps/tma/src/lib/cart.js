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

// 持久化键。带版本号：格式一旦不兼容就整体丢弃，绝不半解析。
const CART_KEY = 'fbcart:v1';
const MAX_QTY = 99;

// localStorage 并不总是可用：Telegram 内嵌 WebView 的隐私模式、配额写满、
// 某些客户端禁用存储都会让 setItem 抛异常。探测一次，不可用就退化为纯内存。
export function safeStorage() {
  try {
    const s = typeof globalThis !== 'undefined' ? globalThis.localStorage : null;
    if (!s) return null;
    const probe = '__fbc_probe__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch { return null; }
}

// 价格/起送价统一按"分"存。非法或负数一律 null（调用方决定丢弃还是置 0）。
const toCentsStrict = (v) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= 0 ? n : null;
};

export function createCart(options = {}) {
  const storage = 'storage' in options ? options.storage : safeStorage();
  const key = options.key || CART_KEY;
  let shopId = null;
  // 店铺元信息：起送价只在「购物车属于这家店」时才有意义，故带上 id 绑定。
  // 用户逛 A 店时写入、去 B 店加菜时必须自动失效，否则会拿 A 的起送价卡 B 的单。
  let shopMeta = null; // { id, name, minOrderCents }
  const lines = new Map(); // foodId -> { id, title, priceCents, qty }

  function snapshot() {
    return {
      v: 1,
      shopId,
      shop: shopMeta,
      lines: [...lines.values()].map((l) => ({ id: l.id, title: l.title, priceCents: l.priceCents, qty: l.qty, pic: l.pic })),
    };
  }

  function persist() {
    if (!storage) return;
    try { storage.setItem(key, JSON.stringify(snapshot())); } catch { /* 配额满/隐私模式：降级为仅内存 */ }
  }

  // 恢复时逐字段校验：localStorage 是用户可写的，任何一条脏数据都不能让页面白屏。
  function hydrate(raw) {
    lines.clear(); shopId = null; shopMeta = null;
    let data;
    try { data = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return false; }
    if (!data || data.v !== 1 || !Array.isArray(data.lines)) return false;
    const rows = [];
    for (const l of data.lines) {
      if (!l || typeof l.id !== 'string' || !l.id) continue;
      if (typeof l.title !== 'string') continue;
      const pc = toCentsStrict(l.priceCents);
      if (pc === null) continue;
      if (!Number.isInteger(l.qty) || l.qty <= 0 || l.qty > MAX_QTY) continue;
      rows.push({ id: l.id, title: l.title, priceCents: pc, qty: l.qty, pic: typeof l.pic === 'string' && l.pic.startsWith('https://') ? l.pic : null });
    }
    if (!rows.length) return false;
    const sid = typeof data.shopId === 'string' && data.shopId ? data.shopId : null;
    if (!sid) return false; // 有商品无店铺 → 不可信的残缺快照
    rows.forEach((r) => lines.set(r.id, r));
    shopId = sid;
    const s = data.shop;
    if (s && typeof s === 'object' && String(s.id) === sid) {
      const mc = toCentsStrict(s.minOrderCents);
      shopMeta = { id: sid, name: typeof s.name === 'string' ? s.name : '', minOrderCents: mc === null ? 0 : mc };
    }
    return true;
  }

  const api = {
    get shopId() { return shopId; },
    get shopMeta() { return shopMeta; },
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
      if (!shopMeta || shopMeta.id !== shopId) shopMeta = { id: shopId, name: '', minOrderCents: 0 };
      const cur = lines.get(String(food.id));
      // 上限与 hydrate/setQty 保持一致（99）：避免出现"刷新前 120 份、刷新后变 99 份"的静默截断
      if (cur) cur.qty = Math.min(cur.qty + 1, MAX_QTY);
      else lines.set(String(food.id), {
        id: String(food.id), title: food.title, priceCents, qty: 1,
        // 首图缩略地址（上游 waimai:food 的 pics[0]，GCS 支持 x-image-process 实时缩放）；无图/非 https 一律为 null，
        // 非空 pic 必为可安全放进 <img src> 的 https 地址（QA 147 轮 2 minor）
        pic: toThumb(food.pics),
      });
      persist();
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
      else l.qty = Math.min(qty, MAX_QTY);
      if (lines.size === 0) { shopId = null; shopMeta = null; }
      persist();
    },
    remove(foodId) { api.setQty(foodId, 0); },
    clear() { lines.clear(); shopId = null; shopMeta = null; persist(); },
    // 写入店铺信息（起送价/店名）。仅在购物车为空或属于同一家店时接受，
    // 避免"逛 A 店顺手把起送价写到 B 店的购物车上"。
    setShopMeta(shop, meta) {
      const id = String(shop);
      if (shopId !== null && shopId !== id) return false;
      const mc = toCentsStrict(meta && meta.minOrderCents);
      shopMeta = { id, name: meta && typeof meta.name === 'string' ? meta.name : '', minOrderCents: mc === null ? 0 : mc };
      persist();
      return true;
    },
    // 起送价只在购物车归属匹配时生效；未知一律按 0（不拦人）
    minOrderCents() {
      if (!shopId || !shopMeta || shopMeta.id !== shopId) return 0;
      return shopMeta.minOrderCents || 0;
    },
    shortfallCents() { return Math.max(0, api.minOrderCents() - api.totalCents()); },
    meetsMinimum() { return api.shortfallCents() === 0; },
    // 下单前校验：非空、数量为正整数
    canCheckout() {
      return lines.size > 0 && [...lines.values()].every((l) => Number.isInteger(l.qty) && l.qty > 0);
    },
    // 真正能点"去结算"：canCheckout ∩ 达到起送价
    canPlaceOrder() { return api.canCheckout() && api.meetsMinimum(); },
    serialize() { return JSON.stringify(snapshot()); },
    hydrate,
    reload() { return hydrate(storage ? storage.getItem(key) : null); },
  };
  if (storage) hydrate(storage.getItem(key));
  return api;
}

export const formatPhp = (cents) => `₱${(cents / 100).toFixed(2)}`;
export const _toThumb = toThumb;
