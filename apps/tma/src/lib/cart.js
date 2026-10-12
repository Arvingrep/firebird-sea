// T4.3：购物车纯逻辑（Pinia store 的底座）。金额以"分"整数计算，展示时 /100 保留两位。
const toCents = (price) => Math.round(Number(price) * 100);

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
      else lines.set(String(food.id), { id: String(food.id), title: food.title, priceCents, qty: 1 });
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
