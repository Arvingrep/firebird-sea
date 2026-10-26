<script setup lang="ts">
import { useRouter } from 'vue-router';
import { showConfirmDialog } from 'vant';
import { t } from '../services';
import { useCartStore } from '../stores/cart';
import { formatPhp } from '../lib/cart.js';
import AppIcon from '../components/AppIcon.vue';

const cart = useCartStore();
const router = useRouter();

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
          <div class="row"><span>{{ t('checkout.payMethod') }}</span><b>{{ t('checkout.codPay') }}</b></div>
          <div class="row total"><span>{{ t('cart.total') }}</span><b>{{ formatPhp(cart.totalCents) }}</b></div>
        </div>
      </div>

      <div class="cartbar">
        <div class="cnt">
          <AppIcon name="cart" :size="21" />
          <span class="b">{{ cart.count }}</span>
        </div>
        <div class="sum">
          <b>{{ formatPhp(cart.totalCents) }}</b>
          <span>{{ t('cart.countN', { n: cart.count }) }}</span>
        </div>
        <button class="go" :disabled="!cart.canCheckout" @click="router.push({ name: 'checkout' })">
          {{ t('cart.checkout') }}<AppIcon name="chevron-right" :size="15" :stroke="2.4" />
        </button>
      </div>
    </template>
  </div>
</template>
