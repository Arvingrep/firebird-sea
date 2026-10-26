<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showConfirmDialog, showToast } from 'vant';
import { fb, t } from '../services';
import { ORDER_STATE, isCancellable } from '../lib/checkout.js';
import AppIcon from '../components/AppIcon.vue';

const props = defineProps<{ id: string }>();
const router = useRouter();
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
const stateKey = (s: number | string) => (ORDER_STATE as Record<string, string>)[String(s)] || 'pending';
const label = (s: number | string) => t(`state.${stateKey(s)}`);
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
    <div class="nav">
      <button class="icon-btn" @click="router.back()"><AppIcon name="chevron-left" :size="19" /></button>
      <span class="title">{{ t('orders.detail') }}</span>
    </div>

    <div v-if="loading" class="state"><van-loading vertical>{{ t('common.loading') }}</van-loading></div>

    <div v-else-if="notFound" class="state">
      <div class="emoji">🧾</div>
      <p class="msg">{{ t('orders.notFound') }}</p>
    </div>

    <template v-else-if="order">
      <div class="card card--pad">
        <div style="display: flex; align-items: center; justify-content: space-between">
          <span class="h2">{{ order.shopname || t('orders.title') }}</span>
          <span class="chip" :class="{ 'chip--ok': stateKey(order.state) === 'done', 'chip--mute': stateKey(order.state) === 'cancelled' }">
            {{ label(order.state) }}
          </span>
        </div>
        <p class="meta" style="margin: 8px 0 0">#{{ order.ordernum }}</p>
      </div>

      <div class="list" style="margin-top: 14px">
        <div v-for="(f, i) in (order.food || order.foodlist || [])" :key="i" class="row">
          <span class="grow">{{ f.title }}</span>
          <span class="val">× {{ f.count }}</span>
        </div>
      </div>

      <div class="card card--pad" style="margin-top: 14px">
        <div class="bill">
          <div class="row total"><span>{{ t('orders.amount') }}</span><b>₱{{ Number(order.amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}</b></div>
        </div>
      </div>

      <button v-if="isCancellable(order.state)" class="btn btn--ghost" style="width: 100%; margin-top: 16px" @click="cancel">
        {{ t('orders.cancel') }}
      </button>
    </template>
  </div>
</template>
