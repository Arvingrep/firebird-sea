<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showConfirmDialog, showToast } from 'vant';
import { fb, t } from '../services';
import { ORDER_STATE, isCancellable } from '../lib/checkout.js';
import AppIcon from '../components/AppIcon.vue';

interface Order { id: string; ordernum: string; shopname?: string; amount?: string; state: number | string; addtime?: string; food?: any[] }

// 分组 Tab（对齐 H5 webroot/templates/member/touch/js/order-waimai.js:46-59）：
// 「待评价」= state=1 且 iscomment=0
const TABS = [
  { key: '', label: 'orders.tabAll' },
  { key: '0', label: 'orders.tabPending' },
  { key: '1', label: 'orders.tabComment' },
];

const router = useRouter();
const orders = ref<Order[]>([]);
const loading = ref(true);
const failed = ref(false);
const tab = ref('');
// 计数取自 pageInfo。注意上游是先算 state0/noiscomment 再追加 state 过滤
// （waimai.class.php:5919-5943），所以这两项**始终是全量值**，切 tab 不会失真；
// 而 totalCount 会随 state 参数变化，故只在「全部」tab 下更新。
const counts = ref({ all: 0, pending: 0, comment: 0 });

function badgeOf(key: string) {
  if (key === '') return counts.value.all;
  if (key === '0') return counts.value.pending;
  return counts.value.comment;
}

// 请求序号：快速切 Tab 时先发的慢请求可能后返回，若不加序号会覆盖当前 Tab 的列表与计数
let loadToken = 0;

async function load() {
  const token = ++loadToken;
  loading.value = true;
  failed.value = false;
  try {
    const params: Record<string, string | number> = { page: 1, pageSize: 20 };
    if (tab.value === '0') {
      params.state = '0';
    } else if (tab.value === '1') {
      params.state = '1';
      params.iscomment = '0';
    }
    const info = await fb.get('waimai', 'order', params);
    if (token !== loadToken) return;   // 已被更新的请求取代，丢弃这次结果
    orders.value = Array.isArray(info?.list) ? info.list : [];
    const pi: any = (info && info.pageInfo) || {};
    counts.value = {
      all: tab.value === '' ? Number(pi.totalCount || 0) : counts.value.all,
      pending: Number(pi.state0 || 0),
      comment: Number(pi.noiscomment || 0),
    };
  } catch {
    if (token === loadToken) failed.value = true;
  } finally {
    if (token === loadToken) loading.value = false;
  }
}

function switchTab(k: string) {
  if (tab.value === k) return;
  tab.value = k;
  load();
}
const friendly = (e: any) => (/reopen/i.test(e?.message || '') ? t('auth.reopen') : (e?.message || ''));
// 未收录的状态不猜测语义（曾把未知状态显示成「待付款」），统一兜底为「处理中」
const stateKey = (s: number | string) => (ORDER_STATE as Record<string, string>)[String(s)] || 'unknown';
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

    <!-- 分组 Tab：订单混在一起会让用户以为「订单丢了」，分组+计数能立刻定位 -->
    <div class="pills" style="margin-top: 10px">
      <button
        v-for="tb in TABS"
        :key="tb.key"
        class="pill"
        :class="{ 'is-active': tab === tb.key }"
        @click="switchTab(tb.key)"
      >
        {{ t(tb.label) }}
        <i v-if="badgeOf(tb.key) > 0" class="pill-badge">{{ badgeOf(tb.key) > 99 ? '99+' : badgeOf(tb.key) }}</i>
      </button>
    </div>

    <div v-if="loading" class="state"><van-loading vertical>{{ t('common.loading') }}</van-loading></div>

    <div v-else-if="failed" class="state">
      <div class="emoji">😵</div>
      <p class="msg">{{ t('shop.loadFailed') }}</p>
      <button class="btn btn--primary" @click="load">{{ t('common.retry') }}</button>
    </div>

    <div v-else-if="orders.length === 0" class="state">
      <div class="emoji">🧾</div>
      <p class="msg">{{ tab === '' ? t('orders.empty') : t('orders.emptyTab') }}</p>
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
