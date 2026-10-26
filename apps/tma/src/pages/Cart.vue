<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showConfirmDialog } from 'vant';
import { fb, t } from '../services';
import { useCartStore } from '../stores/cart';
import { formatPhp } from '../lib/cart.js';
import AppIcon from '../components/AppIcon.vue';

const cart = useCartStore();
const router = useRouter();

// 起送价是本地快照，商家可能已经调过：进购物车时静默刷新一次，
// 失败就用快照（并由 cart 里的 TTL 兜底为"未知不拦"）。
onMounted(async () => {
  if (!cart.shopId) return;
  try {
    const si = await fb.get('waimai', 'storeDetail', { id: cart.shopId }, { anonymous: true });
    cart.setShopMeta(cart.shopId as string, {
      name: si?.shopname || '',
      minOrderCents: Math.round(Number(si?.basicprice || 0) * 100),
    });
  } catch { /* 用快照 */ }
});

async function clearCart() {
  try {
    await showConfirmDialog({ message: t('cart.clearConfirm') });
    cart.clear();
  } catch { /* 用户取消 */ }
}
const inc = (id: string | number, qty: number) => cart.setQty(id, qty + 1);
const dec = (id: string | number, qty: number) => cart.setQty(id, Math.max(0, qty - 1));
</script>

<template>
  <div class="page">
    <div class="nav">
      <span class="title">{{ t('cart.title') }}</span>
      <button v-if="cart.items.length" class="icon-btn" @click="clearCart"><AppIcon name="trash" :size="18" /></button>
    </div>

    <div v-if="cart.items.length === 0" class="state">
      <div class="emoji">🛒</div>
      <p class="msg">{{ t('cart.empty') }}</p>
      <button class="btn btn--primary" @click="router.push('/')">{{ t('cart.goShopping') }}</button>
    </div>

    <template v-else>
      <div class="list">
        <div v-for="l in cart.items" :key="l.id" class="cline">
          <img
            v-if="l.pic"
            :src="l.pic"
            class="pic"
            alt=""
            loading="lazy"
            @error="(e: Event) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }"
          />
          <div v-else class="pic pic--ph"><AppIcon name="utensils" :size="22" /></div>
          <div class="main">
            <div class="t">{{ l.title }}</div>
            <div class="p">{{ formatPhp(l.priceCents) }}</div>
          </div>
          <div class="qty">
            <button @click="dec(l.id, l.qty)"><AppIcon name="minus" :size="14" :stroke="2.2" /></button>
            <span class="n">{{ l.qty }}</span>
            <button class="add-btn" style="width: 26px; height: 26px" @click="inc(l.id, l.qty)"><AppIcon name="plus" :size="14" :stroke="2.2" /></button>
          </div>
        </div>
      </div>

      <div class="card card--pad" style="margin-top: 14px">
        <div class="bill">
          <div class="row"><span>{{ t('cart.subtotal') }}</span><b>{{ formatPhp(cart.totalCents) }}</b></div>
          <div v-if="cart.minOrderCents > 0" class="row">
            <span>{{ t('cart.minOrder') }}</span><b>{{ formatPhp(cart.minOrderCents) }}</b>
          </div>
          <div class="row"><span>{{ t('checkout.payMethod') }}</span><b>{{ t('checkout.codPay') }}</b></div>
          <div class="row total"><span>{{ t('cart.total') }}</span><b>{{ formatPhp(cart.totalCents) }}</b></div>
        </div>
        <p v-if="cart.shortfallCents > 0" class="hint hint--warn">
          {{ t('cart.belowMin', { v: formatPhp(cart.shortfallCents) }) }}
        </p>
      </div>

      <div class="cartbar">
        <div class="cnt">
          <AppIcon name="cart" :size="21" />
          <span class="b">{{ cart.count }}</span>
        </div>
        <div class="sum">
          <b>{{ formatPhp(cart.totalCents) }}</b>
          <span v-if="cart.shortfallCents > 0" class="short">{{ t('cart.belowMin', { v: formatPhp(cart.shortfallCents) }) }}</span>
          <span v-else>{{ t('cart.countN', { n: cart.count }) }}</span>
        </div>
        <button class="go" :disabled="!cart.canPlaceOrder" @click="router.push({ name: 'checkout' })">
          {{ cart.shortfallCents > 0 ? t('cart.shortBy', { v: formatPhp(cart.shortfallCents) }) : t('cart.checkout') }}
          <AppIcon v-if="!cart.shortfallCents" name="chevron-right" :size="15" :stroke="2.4" />
        </button>
      </div>
    </template>
  </div>
</template>
