<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fb, i18n } from '../services';

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
onMounted(load);
</script>

<template>
  <div class="page">
    <!-- 品牌渐变头部（参照老 H5 首屏横幅） -->
    <div class="home-hero">
      <div class="hi">{{ t('home.heroHi') }}</div>
      <div class="tt">{{ t('home.heroTitle') }}</div>
      <div class="sub">
        <span>{{ t('home.heroPoint1') }}</span><i class="dot" /><span>{{ t('home.heroPoint2') }}</span>
      </div>
    </div>

    <!-- 骨架屏：与真实卡片同构，避免加载时跳动 -->
    <template v-if="loading">
      <div v-for="i in 5" :key="i" class="fbs-card fbs-skeleton-card">
        <div class="fbs-skeleton-block" style="width: 92px; height: 92px" />
        <div style="flex: 1">
          <div class="fbs-skeleton-block" style="width: 70%; height: 16px" />
          <div class="fbs-skeleton-block" style="width: 40%; height: 12px; margin-top: 10px" />
          <div class="fbs-skeleton-block" style="width: 85%; height: 12px; margin-top: 30px" />
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
          <div class="tags">
            <span v-if="s.typename" class="fbs-chip">{{ s.typename }}</span>
            <span :class="s.yingye ? 'fbs-open' : 'fbs-closed'">{{ s.yingye ? t('shop.open') : t('shop.closed') }}</span>
          </div>
          <div class="desc">{{ t('shop.minOrder') }} <b>₱{{ s.basicprice || '0' }}</b> <span class="sep">·</span> {{ t('shop.deliveryFee') }} <b>₱{{ s.delivery_fee || '0' }}</b></div>
        </div>
      </div>
    </template>
  </div>
</template>
