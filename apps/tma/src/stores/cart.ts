import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { createCart } from '../lib/cart.js';

export interface Food { id: string | number; title: string; price: string | number }

// Pinia 外壳：纯逻辑在 lib/cart.js（可被 node:test 直接测试），这里只做响应式桥接。
export const useCartStore = defineStore('cart', () => {
  const cart = createCart();
  const version = ref(0);
  const bump = () => { version.value += 1; };

  const items = computed(() => { void version.value; return cart.items(); });
  const count = computed(() => { void version.value; return cart.count(); });
  const totalCents = computed(() => { void version.value; return cart.totalCents(); });
  const shopId = computed(() => { void version.value; return cart.shopId; });
  const canCheckout = computed(() => { void version.value; return cart.canCheckout(); });

  function add(shop: string | number, food: Food): 'added' | 'needs-switch' {
    const r = cart.add(shop, food);
    bump();
    return r;
  }
  function switchShop(shop: string | number, food: Food) { cart.switchShop(shop, food); bump(); }
  function setQty(id: string | number, qty: number) { cart.setQty(id, qty); bump(); }
  function clear() { cart.clear(); bump(); }

  return { items, count, totalCents, shopId, canCheckout, add, switchShop, setQty, clear };
});
