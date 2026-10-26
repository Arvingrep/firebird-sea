<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showConfirmDialog, showToast } from 'vant';
import { fb, t } from '../services';
import { ORDER_STATE, isCancellable } from '../lib/checkout.js';
import AppIcon from '../components/AppIcon.vue';

interface Order { id: string; ordernum: string; shopname?: string; amount?: string; state: number | string; addtime?: string; food?: any[] }
const router = useRouter();
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
const friendly = (e: any) => (/reopen/i.test(e?.message || '') ? t('auth.reopen') : (e?.message || ''));
const stateKey = (s: number | string) => (ORDER_STATE as Record<string, string>)[String(s)] || 'pending';
const label = (s: number | string) => t(`state.${stateKey(s)}`);
const chipClass = (s: number | string) => {
  const k = stateKey(s);
  return k === 'done' ? 'chip chip--ok' : k === 'cancelled' ? 'chip chip--mute' : 'chip';
};
async function cancel(o: Order) {
  try {
    await showConfirmDialog({ message: t('orders.cancelConfirm') });
    await fb.post('waimai', 'cancelOrder', { id: o.id });
    showToast(t('orders.cancelled'));
    await load();
  } catch (e: any) { const m = friendly(e); if (m) showToast(m); }
}
onMounted(load);
</script>

<template>
  <div class="page">
    <div class="nav"><span class="title">{{ t('orders.title') }}</span></div>

    <div v-if="loading" class="state"><van-loading vertical>{{ t('common.loading') }}</van-loading></div>

    <div v-else-if="failed" class="state">
      <div class="emoji">😵</div>
      <p class="msg">{{ t('shop.loadFailed') }}</p>
      <button class="btn btn--primary" @click="load">{{ t('common.retry') }}</button>
    </div>

    <div v-else-if="orders.length === 0" class="state">
      <div class="emoji">🧾</div>
      <p class="msg">{{ t('orders.empty') }}</p>
      <button class="btn btn--ghost" @click="router.push('/')">{{ t('cart.goShopping') }}</button>
    </div>

    <template v-else>
      <article v-for="o in orders" :key="o.id" class="order" @click="router.push({ name: 'order-detail', params: { id: o.id } })">
        <div class="top">
          <span class="shop">{{ o.shopname || t('orders.title') }}</span>
          <span :class="chipClass(o.state)">{{ label(o.state) }}</span>
        </div>
        <div class="mid">
          <span class="num">#{{ o.ordernum }}</span>
          <span class="amt">₱{{ Number(o.amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}</span>
        </div>
        <div v-if="isCancellable(o.state)" class="acts">
          <button class="btn btn--ghost" @click.stop="cancel(o)">{{ t('orders.cancel') }}</button>
          <button class="btn btn--dark" @click.stop="router.push({ name: 'order-detail', params: { id: o.id } })">
            {{ t('orders.detail') }}<AppIcon name="chevron-right" :size="14" />
          </button>
        </div>
      </article>
    </template>
  </div>
</template>
