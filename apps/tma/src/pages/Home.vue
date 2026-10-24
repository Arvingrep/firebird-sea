<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fb, i18n } from '../services';
import { formatPhp } from '../lib/cart.js';

interface Shop { id: string; shopname: string; pic?: string; yingye?: number; typename?: string; basicprice?: string; delivery_fee?: string }
const router = useRouter();
const shops = ref<Shop[]>([]);
const loading = ref(true);
const failed = ref(false);
const t = (k: string) => i18n.t(k);

async function load() {
  loading.value = true;
  failed.value = false;
  try {
    const info = await fb.get('waimai', 'shopList', { page: 1, pageSize: 20 }, { anonymous: true });
    shops.value = Array.isArray(info?.list) ? info.list : [];
  } catch (e) {
    failed.value = true;
  } finally {
    loading.value = false;
  }
}
const money = (v?: string) => formatPhp(Math.round(Number(v || 0) * 100));
onMounted(load);
</script>

<template>
  <div class="page">
    <!-- 骨架屏：与真实卡片同构，避免加载时跳动 -->
    <template v-if="loading">
      <div v-for="i in 5" :key="i" class="fbs-card fbs-skeleton-card">
        <div class="fbs-skeleton-block" style="width: 86px; height: 86px" />
        <div style="flex: 1">
          <div class="fbs-skeleton-block" style="width: 70%; height: 16px" />
          <div class="fbs-skeleton-block" style="width: 40%; height: 12px; margin-top: 10px" />
          <div class="fbs-skeleton-block" style="width: 85%; height: 12px; margin-top: 26px" />
        </div>
      </div>
    </template>

    <!-- 加载失败：居中 + 重试 -->
    <div v-else-if="failed" class="fbs-error">
      <p class="msg">{{ t('shop.loadFailed') }}</p>
      <van-button size="small" round @click="load">{{ t('common.retry') }}</van-button>
    </div>

    <van-empty v-else-if="shops.length === 0" :description="t('shop.empty')" />

    <!-- 商家列表 -->
    <template v-else>
      <p class="fbs-section-title">{{ t('shop.section') }}</p>
      <div
        v-for="s in shops"
        :key="s.id"
        class="fbs-card shop-card"
        @click="router.push({ name: 'shop', params: { id: s.id } })"
      >
        <img class="pic" :src="s.pic" alt="" loading="lazy" />
        <div class="info">
          <div class="name">{{ s.shopname }}</div>
          <div class="desc">{{ s.typename }}</div>
          <div class="meta">
            <span :class="s.yingye ? 'fbs-open' : 'fbs-closed'">{{ s.yingye ? t('shop.open') : t('shop.closed') }}</span>
            <span>{{ t('shop.minOrder') }} <b>{{ money(s.basicprice) }}</b> · {{ t('shop.deliveryFee') }} <b>{{ money(s.delivery_fee) }}</b></span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
