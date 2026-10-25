<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showConfirmDialog, showToast } from 'vant';
import { fb, i18n } from '../services';
import { ORDER_STATE, isCancellable } from '../lib/checkout.js';

interface Order { id: string; ordernum: string; shopname?: string; amount?: string; state: number | string }
const router = useRouter();
const t = (k: string) => i18n.t(k);
const orders = ref<Order[]>([]);
const loading = ref(true);
const failed = ref(false);

async function load() {
  loading.value = true;
  failed.value = false;
  try {
    const info = await fb.get('waimai', 'order', { page: 1, pageSize: 20 });
    orders.value = Array.isArray(info?.list) ? info.list : [];
  } catch { failed.value = true; } finally { loading.value = false; }
}
const label = (s: number | string) => t(`state.${(ORDER_STATE as Record<string, string>)[String(s)] || 'pending'}`);
const stateClass = (s: number | string) => {
  const k = (ORDER_STATE as Record<string, string>)[String(s)] || 'pending';
  return k === 'done' || k === 'cancelled' ? `state ${k}` : 'state';
};
async function cancel(o: Order) {
  try {
    await showConfirmDialog({ message: t('orders.cancelConfirm') });
    await fb.post('waimai', 'cancelOrder', { id: o.id });
    showToast(t('orders.cancelled'));
    await load();
  } catch (e: any) { if (e && e.message) showToast(e.message); }
}
onMounted(load);
</script>

<template>
  <div class="page">
    <van-loading v-if="loading" vertical>{{ t('common.loading') }}</van-loading>

    <div v-else-if="failed" class="fbs-error">
      <p class="msg">{{ t('shop.loadFailed') }}</p>
      <van-button size="small" round @click="load">{{ t('common.retry') }}</van-button>
    </div>

    <template v-else>
      <van-empty v-if="orders.length === 0" :description="t('orders.empty')" />
      <div
        v-for="o in orders"
        :key="o.id"
        class="fbs-card order-card"
        @click="router.push({ name: 'order-detail', params: { id: o.id } })"
      >
        <div class="row1">
          <span class="shop">{{ o.shopname || t('orders.title') }}</span>
          <span :class="stateClass(o.state)">{{ label(o.state) }}</span>
        </div>
        <div class="row2">
          <span>#{{ o.ordernum }}</span>
          <span class="amount">₱{{ Number(o.amount || 0).toFixed(2) }}</span>
        </div>
        <div v-if="isCancellable(o.state)" class="row2" style="justify-content: flex-end">
          <van-button size="mini" plain round type="danger" @click.stop="cancel(o)">{{ t('orders.cancel') }}</van-button>
        </div>
      </div>
    </template>
  </div>
</template>
