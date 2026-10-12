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
    <div v-else-if="failed">
      <p class="hint">{{ t('shop.loadFailed') }}</p>
      <van-button size="small" @click="load">{{ t('common.retry') }}</van-button>
    </div>
    <template v-else>
      <van-empty v-if="orders.length === 0" :description="t('orders.empty')" />
      <van-cell
        v-for="o in orders"
        :key="o.id"
        :title="`${o.shopname || ''} #${o.ordernum}`"
        :label="`${label(o.state)} · ₱${Number(o.amount || 0).toFixed(2)}`"
        is-link
        @click="router.push({ name: 'order-detail', params: { id: o.id } })"
      >
        <template v-if="isCancellable(o.state)" #right-icon>
          <van-button size="mini" type="danger" @click.stop="cancel(o)">{{ t('orders.cancel') }}</van-button>
        </template>
      </van-cell>
    </template>
  </div>
</template>
