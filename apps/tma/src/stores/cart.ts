import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { createCart } from '../lib/cart.js';

export interface Food { id: string | number; title: string; price: string | number; pics?: string[] }
export interface ShopMeta { name?: string; minOrderCents?: string | number }

// Pinia 外壳：纯逻辑在 lib/cart.js（可被 node:test 直接测试），这里只做响应式桥接。
// 购物车跨页面/刷新保持：createCart 默认挂 localStorage，不可用时自动降级为纯内存。
export const useCartStore = defineStore('cart', () => {
  const cart = createCart();
  const version = ref(0);
  const bump = () => { version.value += 1; };

  const items = computed(() => { void version.value; return cart.items(); });
  const count = computed(() => { void version.value; return cart.count(); });
  const totalCents = computed(() => { void version.value; return cart.totalCents(); });
  const shopId = computed(() => { void version.value; return cart.shopId; });
  const shopMeta = computed(() => { void version.value; return cart.shopMeta; });
  const canCheckout = computed(() => { void version.value; return cart.canCheckout(); });
  const minOrderCents = computed(() => { void version.value; return cart.minOrderCents(); });
  const shortfallCents = computed(() => { void version.value; return cart.shortfallCents(); });
  // 真正能点「去结算」：购物车非空 且 已达起送价
  const canPlaceOrder = computed(() => { void version.value; return cart.canPlaceOrder(); });

  function add(shop: string | number, food: Food): 'added' | 'needs-switch' {
    const r = cart.add(shop, food);
    bump();
    return r;
  }
  function switchShop(shop: string | number, food: Food) { cart.switchShop(shop, food); bump(); }
  function setQty(id: string | number, qty: number) { cart.setQty(id, qty); bump(); }
  function setShopMeta(shop: string | number, meta: ShopMeta) { const r = cart.setShopMeta(shop, meta); bump(); return r; }
  function clear() { cart.clear(); bump(); }

  // 多标签页 / 多 WebView 同步：别处改了车就重读一次快照。
  // reload() 在存储里没有快照时返回 false 且保持内存现状，不会误清空当前车。
  if (typeof window !== 'undefined') {
    const sync = () => { if (cart.reload()) bump(); };
    window.addEventListener('storage', (e: StorageEvent) => { if (!e.key || e.key === 'fbcart:v1') sync(); });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') sync(); });
  }

  return {
    items, count, totalCents, shopId, shopMeta, canCheckout, canPlaceOrder,
    minOrderCents, shortfallCents,
    add, switchShop, setQty, setShopMeta, clear,
  };
});
