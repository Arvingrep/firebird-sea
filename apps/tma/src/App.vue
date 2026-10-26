<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useCartStore } from './stores/cart';
import { t, langRef } from './services';
import AppIcon from './components/AppIcon.vue';

const cart = useCartStore();
const route = useRoute();

const tabs = computed(() => [
  { to: '/', icon: 'bag', label: t('nav.food') },
  { to: '/news', icon: 'news', label: t('nav.news') },
  { to: '/orders', icon: 'receipt', label: t('nav.orders') },
  { to: '/cart', icon: 'cart', label: t('nav.cart'), badge: cart.count || 0 },
  { to: '/profile', icon: 'user', label: t('nav.profile') },
]);

const isActive = (to: string) => (to === '/' ? route.path === '/' : route.path.startsWith(to));
</script>

<template>
  <div class="app">
    <router-view :key="langRef" />
    <nav class="tabbar">
      <router-link v-for="it in tabs" :key="it.to" :to="it.to" class="tab" :class="{ 'is-active': isActive(it.to) }">
        <span class="ic"><AppIcon :name="it.icon" :size="22" :stroke="isActive(it.to) ? 2 : 1.8" /></span>
        <span class="lb">{{ it.label }}</span>
        <i v-if="it.badge" class="dot">{{ it.badge > 99 ? '99+' : it.badge }}</i>
      </router-link>
    </nav>
  </div>
</template>
