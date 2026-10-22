<script setup lang="ts">
import { useRouter } from 'vue-router';
import { i18n } from '../services';
import { useCartStore } from '../stores/cart';
import { formatPhp } from '../lib/cart.js';

const router = useRouter();
const cart = useCartStore();
const t = (k: string) => i18n.t(k);
</script>

<template>
  <div class="page">
    <van-empty v-if="cart.items.length === 0" :description="t('cart.empty')" />
    <template v-else>
      <van-cell v-for="l in cart.items" :key="l.id" :title="l.title" :label="formatPhp(l.priceCents)">
        <template #right-icon>
          <van-stepper :model-value="l.qty" min="0" integer @change="(v: number) => cart.setQty(l.id, v)" />
        </template>
      </van-cell>
      <van-cell :title="t('cart.total')" :value="formatPhp(cart.totalCents)" />
      <van-button block plain @click="cart.clear()">{{ t('cart.clear') }}</van-button>
      <van-submit-bar
        :price="cart.totalCents"
        :button-text="t('cart.checkout')"
        :label="t('cart.total')"
        currency="₱"
        @submit="router.push({ name: 'checkout' })"
      />
    </template>
  </div>
</template>
