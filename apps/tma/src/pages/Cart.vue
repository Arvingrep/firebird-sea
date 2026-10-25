<script setup lang="ts">
import { useRouter } from 'vue-router';
import { showConfirmDialog } from 'vant';
import { i18n } from '../services';
import { useCartStore } from '../stores/cart';
import { formatPhp } from '../lib/cart.js';

const cart = useCartStore();
const router = useRouter();
const t = (k: string) => i18n.t(k);

async function clearCart() {
  try {
    await showConfirmDialog({ message: t('cart.clearConfirm') });
    cart.clear();
  } catch { /* 用户取消 */ }
}
</script>

<template>
  <div class="page">
    <van-empty v-if="cart.items.length === 0" :description="t('cart.empty')" />
    <template v-else>
      <div class="fbs-card">
        <div v-for="l in cart.items" :key="l.id" class="cart-line">
          <img v-if="l.pic" :src="l.pic" class="cart-pic" alt="" loading="lazy" />
          <div v-else class="cart-pic cart-pic-empty" aria-hidden="true">🍜</div>
          <div class="t">
            <div>{{ l.title }}</div>
            <div class="p">{{ formatPhp(l.priceCents) }}</div>
          </div>
          <van-stepper :model-value="l.qty" min="0" integer @change="(v: number) => cart.setQty(l.id, v)" />
        </div>
        <div class="cart-total">
          <span>{{ t('cart.total') }}</span>
          <b>{{ formatPhp(cart.totalCents) }}</b>
        </div>
      </div>

      <div class="fbs-actions">
        <van-button block round plain @click="clearCart">{{ t('cart.clear') }}</van-button>
        <van-button block round type="primary" :disabled="!cart.canCheckout" @click="router.push({ name: 'checkout' })">
          {{ t('cart.checkout') }}
        </van-button>
      </div>
    </template>
  </div>
</template>
