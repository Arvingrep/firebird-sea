<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCartStore } from './stores/cart';
import { i18n } from './services';

const cart = useCartStore();
const lang = ref(i18n.lang);
const t = (k: string) => { void lang.value; return i18n.t(k); };
function toggleLang() { i18n.setLang(i18n.lang === 'zh' ? 'en' : 'zh'); lang.value = i18n.lang; }
const badge = computed(() => cart.count || undefined);
</script>

<template>
  <div>
    <van-nav-bar :title="t('app.title')">
      <template #right><span @click="toggleLang">{{ t('lang.switch') }}</span></template>
    </van-nav-bar>
    <router-view :key="lang" />
    <van-tabbar route>
      <van-tabbar-item to="/" icon="shop-o">{{ t('nav.food') }}</van-tabbar-item>
      <van-tabbar-item to="/news" icon="newspaper-o">{{ t('nav.news') }}</van-tabbar-item>
      <van-tabbar-item to="/orders" icon="orders-o">{{ t('nav.orders') }}</van-tabbar-item>
      <van-tabbar-item to="/cart" icon="cart-o" :badge="badge">{{ t('nav.cart') }}</van-tabbar-item>
    </van-tabbar>
  </div>
</template>
