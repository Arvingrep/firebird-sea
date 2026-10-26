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
// 起送价快照的有效期：超过就按"未知"处理（不拦人），避免商家调低门槛后用户被旧值卡死
const META_TTL_MS = 30 * 60 * 1000;

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
  const nowFn = typeof options.now === 'function' ? options.now : () => Date.now();
  const ttlMs = Number.isFinite(options.ttlMs) ? options.ttlMs : META_TTL_MS;
  let shopId = null;
  // 店铺元信息：起送价只在「购物车属于这家店」时才有意义，故带上 id 绑定。
  let shopMeta = null; // { id, name, minOrderCents, ts } —— 当前车绑定的那家店
  // 「最近一次见到的店铺」：用户逛 B 店时车还在 A 店，setShopMeta(B) 不能绑到车上，
  // 但也不能丢——等他确认换店 / 把车清空再加菜时，起送价必须还能拿到。
  // 没有这一层，切店和"减到 0 再加菜"两条常见路径的起送价会静默变成 0（QA 171 轮 1 major）。
  let seenMeta = null;
  const lines = new Map(); // foodId -> { id, title, priceCents, qty }

  // 车归属切到 id 时，尽量复用已知起送价：先看当前绑定，再看最近见到的
  function bindMeta(id) {
    if (shopMeta && shopMeta.id === id) return;
    shopMeta = seenMeta && seenMeta.id === id ? seenMeta : { id, name: '', minOrderCents: 0, ts: nowFn() };
  }

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
    lines.clear(); shopId = null; shopMeta = null; seenMeta = null;
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
      // 快照里的 ts 只用于判断"这份门槛有多旧"；缺失时按当前时间算（刚加载，先信它），
      // 真正的时效兜底由 Cart/Checkout 进页面刷新 storeDetail 完成。
      const ts = Number.isFinite(s.ts) && s.ts > 0 ? s.ts : nowFn();
      shopMeta = { id: sid, name: typeof s.name === 'string' ? s.name : '', minOrderCents: mc === null ? 0 : mc, ts };
      seenMeta = shopMeta;
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
      bindMeta(shopId);
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
      // 车空了只解绑 shopId，不动 shopMeta/seenMeta：用户在店铺页把最后一份减到 0
      // 再重新加菜是极常见的操作，此时起送价必须还在（不能退化成 0）
      if (lines.size === 0) shopId = null;
      persist();
    },
    remove(foodId) { api.setQty(foodId, 0); },
    clear() { lines.clear(); shopId = null; persist(); },
    // 写入店铺信息（起送价/店名）。车空着或就属于这家店 → 直接绑定；
    // 车属于别的店 → 只记进 seenMeta，等他确认切店或清空再加菜时自动生效。
    setShopMeta(shop, meta) {
      const id = String(shop);
      const mc = toCentsStrict(meta && meta.minOrderCents);
      const row = { id, name: meta && typeof meta.name === 'string' ? meta.name : '', minOrderCents: mc === null ? 0 : mc, ts: nowFn() };
      seenMeta = row;
      if (shopId !== null && shopId !== id) return false;
      shopMeta = row;
      persist();
      return true;
    },
    // 起送价只在购物车归属匹配时生效；未知或已过期一律按 0（不拦人）
    minOrderCents() {
      if (!shopId || !shopMeta || shopMeta.id !== shopId) return 0;
      // 门槛是本地快照，商家可能已调价：过期就当未知交给上游兜底，
      // 免得用户拿着旧的高门槛被永久卡住（QA 171 轮 1 minor）
      if (ttlMs > 0 && nowFn() - (shopMeta.ts || 0) > ttlMs) return 0;
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
    // 多标签页/多 WebView 同步用。存储里没有快照 ≠ 车该被清空，
    // 所以只在真有快照时才覆盖内存状态，否则保持现状返回 false。
    reload() {
      if (!storage) return false;
      const raw = storage.getItem(key);
      if (raw === null) return false;
      return hydrate(raw);
    },
  };
  if (storage) hydrate(storage.getItem(key));
  return api;
}

export const formatPhp = (cents) => `₱${(cents / 100).toFixed(2)}`;
export const _toThumb = toThumb;
