<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { showConfirmDialog, showToast } from 'vant';
import { fb, i18n } from '../services';
import { ORDER_STATE, isCancellable } from '../lib/checkout.js';

const props = defineProps<{ id: string }>();
const t = (k: string) => i18n.t(k);
const order = ref<any>(null);
const loading = ref(true);
const notFound = ref(false);

async function load() {
  loading.value = true;
  notFound.value = false;
  try {
    order.value = await fb.get('waimai', 'orderDetail', { id: props.id });
  } catch { notFound.value = true; } finally { loading.value = false; }
}
const label = (s: number | string) => t(`state.${(ORDER_STATE as Record<string, string>)[String(s)] || 'pending'}`);
async function cancel() {
  try {
    await showConfirmDialog({ message: t('orders.cancelConfirm') });
    await fb.post('waimai', 'cancelOrder', { id: props.id });
    showToast(t('orders.cancelled'));
    await load();
  } catch (e: any) { if (e && e.message) showToast(e.message); }
}
onMounted(load);
</script>

<template>
  <div class="page">
    <van-loading v-if="loading" vertical>{{ t('common.loading') }}</van-loading>
    <van-empty v-else-if="notFound" :description="t('orders.notFound')" />
    <template v-else-if="order">
      <van-cell :title="t('orders.number')" :value="order.ordernum" />
      <van-cell :title="t('orders.state')" :value="label(order.state)" />
      <van-cell v-for="(f, i) in (order.food || order.foodlist || [])" :key="i" :title="f.title" :value="`× ${f.count}`" />
      <van-cell :title="t('orders.amount')" :value="`₱${Number(order.amount || 0).toFixed(2)}`" />
      <van-button v-if="isCancellable(order.state)" block type="danger" @click="cancel">{{ t('orders.cancel') }}</van-button>
    </template>
  </div>
</template>
