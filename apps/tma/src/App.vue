<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCartStore } from './stores/cart';
import { i18n } from './services';

const cart = useCartStore();
const lang = ref(i18n.lang);
const t = (k: string) => { void lang.value; return i18n.t(k); };
function toggleLang() { i18n.setLang(i18n.lang === 'zh' ? 'en' : 'zh'); lang.value = i18n.lang; }
const badge = computed(() => cart.count || undefined);

// 图标用内联 SVG（stroke: currentColor 跟随激活色），
// 不依赖 Vant 图标字体——线上 webview 出现过字体加载失败变成空方块的问题。
const iconProps = {
  width: 24, height: 24, viewBox: '0 0 24 24',
  fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8,
  'stroke-linecap': 'round' as const, 'stroke-linejoin': 'round' as const,
};
</script>

<template>
  <div>
    <van-nav-bar :title="t('app.title')">
      <template #right><span class="lang-switch" @click="toggleLang">{{ t('lang.switch') }}</span></template>
    </van-nav-bar>
    <router-view :key="lang" />
    <van-tabbar route>
      <van-tabbar-item to="/">
        {{ t('nav.food') }}
        <template #icon>
          <svg v-bind="iconProps"><path d="M4 9.5 5.4 4.8a1 1 0 0 1 1-.8h11.2a1 1 0 0 1 1 .8L20 9.5" /><path d="M4.5 9.5h15V19a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1z" /><path d="M9.5 20v-5.5h5V20" /></svg>
        </template>
      </van-tabbar-item>
      <van-tabbar-item to="/news">
        {{ t('nav.news') }}
        <template #icon>
          <svg v-bind="iconProps"><rect x="4" y="4.5" width="16" height="15.5" rx="2" /><path d="M8 9h8" /><path d="M8 12.5h8" /><path d="M8 16h4" /></svg>
        </template>
      </van-tabbar-item>
      <van-tabbar-item to="/orders">
        {{ t('nav.orders') }}
        <template #icon>
          <svg v-bind="iconProps"><path d="M7 3.5h7.5l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" /><path d="M14.5 3.5V8h4" /><path d="M9.5 13h5" /><path d="M9.5 16.5h5" /></svg>
        </template>
      </van-tabbar-item>
      <van-tabbar-item to="/cart" :badge="badge">
        {{ t('nav.cart') }}
        <template #icon>
          <svg v-bind="iconProps"><path d="M3.5 4.5h2l2.2 11h10.6l2-8H7" /><circle cx="9.5" cy="19.5" r="1.4" /><circle cx="16.8" cy="19.5" r="1.4" /></svg>
        </template>
      </van-tabbar-item>
      <van-tabbar-item to="/profile">
        {{ t('nav.profile') }}
        <template #icon>
          <svg v-bind="iconProps"><circle cx="12" cy="8.2" r="3.7" /><path d="M4.8 20c1.3-3.4 4-5.1 7.2-5.1s5.9 1.7 7.2 5.1" /></svg>
        </template>
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style scoped>
.lang-switch { font-size: 14px; color: var(--tg-text); }
</style>
