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
      // seenMeta 必须一起落盘：多标签页 / 前后台切换会 reload，若它只活在内存里，
      // "A 店车 + 逛过 B 店" 这条状态过一夜就丢了（QA 171 轮 2 major）。
      seen: seenMeta,
      lines: [...lines.values()].map((l) => ({ id: l.id, title: l.title, priceCents: l.priceCents, qty: l.qty, pic: l.pic })),
    };
  }

  function persist() {
    if (!storage) return;
    try { storage.setItem(key, JSON.stringify(snapshot())); } catch { /* 配额满/隐私模式：降级为仅内存 */ }
  }

  // 单条门槛校验。expectId 给出时要求 id 一致（防把别人的起送价挂到这家店上）
  function readMeta(v, expectId) {
    if (!v || typeof v !== 'object') return null;
    const id = v.id === undefined || v.id === null ? '' : String(v.id);
    if (!id) return null;
    if (expectId !== undefined && id !== String(expectId)) return null;
    const mc = toCentsStrict(v.minOrderCents);
    // ts 缺失按"刚刚"算（本地快照刚加载，先信它），时效兜底交给 TTL + 进页面刷新
    const ts = Number.isFinite(v.ts) && v.ts > 0 ? v.ts : nowFn();
    return { id, name: typeof v.name === 'string' ? v.name : '', minOrderCents: mc === null ? 0 : mc, ts };
  }

  // 纯解析：**不碰任何内存状态**。返回 null 表示快照不可用，调用方保持现状。
  // 这一条是 QA 171 轮 2 major 的核心——旧实现在解析前就 lines.clear()，
  // 于是每次 reload（storage 事件 / visibilitychange）都会把 seenMeta 抹掉。
  function parseSnapshot(raw) {
    let data;
    try { data = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return null; }
    if (!data || data.v !== 1 || !Array.isArray(data.lines)) return null;
    const rows = [];
    for (const l of data.lines) {
      if (!l || typeof l.id !== 'string' || !l.id) continue;
      if (typeof l.title !== 'string') continue;
      const pc = toCentsStrict(l.priceCents);
      if (pc === null) continue;
      if (!Number.isInteger(l.qty) || l.qty <= 0 || l.qty > MAX_QTY) continue;
      rows.push({ id: l.id, title: l.title, priceCents: pc, qty: l.qty, pic: typeof l.pic === 'string' && l.pic.startsWith('https://') ? l.pic : null });
    }
    // 有一行都没解析出来、但原始行非空 → 整份快照不可信
    if (data.lines.length > 0 && rows.length === 0) return null;
    const sid = typeof data.shopId === 'string' && data.shopId ? data.shopId : null;
    // 车与店铺必须一致：有菜必有店、有店必有菜。两者都空是合法的「空车快照」，
    // 要能同步"另一个标签页清空了车"，但不能顺手擦掉门槛。
    if (sid && rows.length === 0) return null;
    if (!sid && rows.length > 0) return null;

    const shop = sid ? readMeta(data.shop, sid) : null;
    // 空车时 data.shop 里留着的门槛挪进 seen，再加菜时 bindMeta 能接回来
    const seen = readMeta(data.seen) || (sid ? shop : readMeta(data.shop)) || null;
    return { shopId: sid, rows, meta: shop, seen };
  }

  // 恢复时逐字段校验：localStorage 是用户可写的，任何一条脏数据都不能让页面白屏。
  function hydrate(raw) {
    const snap = parseSnapshot(raw);
    if (!snap) return false; // 不可信 → 保持内存现状，绝不清空用户正在操作的购物车
    lines.clear();
    snap.rows.forEach((r) => lines.set(r.id, r));
    shopId = snap.shopId;
    shopMeta = snap.meta;
    seenMeta = snap.seen;
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
      // 车属于别的店：只把门槛记进 seenMeta（并落盘——否则一次 reload 就丢），不绑定
      if (shopId !== null && shopId !== id) { persist(); return false; }
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
    // 多实例同步用。返回 false = 没有可用快照（含 getItem 抛异常）→ 内存状态原封不动。
    // 返回 true = 已把内存整体替换成快照内容（可能是"空车"，那是另一标签页清空了车）。
    reload() {
      if (!storage) return false;
      let raw;
      try { raw = storage.getItem(key); } catch { return false; }
      if (raw === null) return false;
      return hydrate(raw);
    },
  };
  if (storage) {
    try { hydrate(storage.getItem(key)); } catch { /* 存储不可读：按空车启动 */ }
  }
  return api;
}

export const formatPhp = (cents) => `₱${(cents / 100).toFixed(2)}`;
export const _toThumb = toThumb;
