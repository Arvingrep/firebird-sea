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
    // 匿名只读：默认马尼拉坐标；后续可由 Telegram/浏览器定位授权覆盖 lat/lng。
    const info = await fb.get('waimai', 'shopList', { page: 1, pageSize: 20, lat: 14.5995, lng: 120.9842 }, { anonymous: true });
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
    <van-loading v-if="loading" vertical>{{ t('common.loading') }}</van-loading>
    <div v-else-if="failed">
      <p class="hint">{{ t('shop.loadFailed') }}</p>
      <van-button size="small" @click="load">{{ t('common.retry') }}</van-button>
    </div>
    <van-empty v-else-if="shops.length === 0" :description="t('shop.empty')" />
    <van-card
      v-for="s in shops"
      v-else
      :key="s.id"
      :title="s.shopname"
      :desc="s.typename"
      :thumb="s.pic"
      @click="router.push({ name: 'shop', params: { id: s.id } })"
    >
      <template #tags>
        <van-tag :type="s.yingye ? 'success' : 'default'">{{ s.yingye ? t('shop.open') : t('shop.closed') }}</van-tag>
      </template>
      <template #footer>
        <span class="hint">{{ t('shop.minOrder') }} {{ money(s.basicprice) }} · {{ t('shop.deliveryFee') }} {{ money(s.delivery_fee) }}</span>
      </template>
    </van-card>
  </div>
</template>
