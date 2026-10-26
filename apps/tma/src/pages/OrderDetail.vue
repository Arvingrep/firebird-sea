<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { showConfirmDialog, showToast } from 'vant';
import { fb, t } from '../services';
import { ORDER_STATE, isCancellable } from '../lib/checkout.js';
import { buildDeliveryView, shouldShowMap, shouldTrack } from '../lib/delivery.js';
import AppIcon from '../components/AppIcon.vue';
import DeliveryMap from '../components/DeliveryMap.vue';

const props = defineProps<{ id: string }>();
const router = useRouter();
const order = ref<any>(null);
const loading = ref(true);
const notFound = ref(false);
// 轮询到的最新轨迹；null 表示"用 orderDetail 里带的那份"
const pathRaw = ref<string | null>(null);

async function load() {
  loading.value = true;
  notFound.value = false;
  pathRaw.value = null;
  try {
    order.value = await fb.get('waimai', 'orderDetail', { id: props.id });
  } catch { notFound.value = true; } finally { loading.value = false; }
}
const stateKey = (s: number | string) => (ORDER_STATE as Record<string, string>)[String(s)] || 'unknown';
const label = (s: number | string) => t(`state.${stateKey(s)}`);

/* ---- 配送地图 ---- */
const deliveryView = computed(() => buildDeliveryView(order.value, pathRaw.value));
const showMap = computed(() => shouldShowMap(order.value && order.value.state));
const isTracking = computed(() => shouldTrack(order.value && order.value.state));

// 骑手位置轮询：走 getCourierLocation（只查 peisongpath 一列，比 orderDetail 轻得多）。
// 上游该接口对空轨迹返回 state=102 "No data!"，fbClient 已归一成 null，这里静默跳过。
const POLL_MS = 30000;
let timer: ReturnType<typeof setInterval> | null = null;
let inflight = false;

async function pollCourier() {
  // 弱网下上一次请求可能还没回来，再发一次只会堆请求；跳过这一轮即可
  if (inflight) return;
  inflight = true;
  try {
    const raw = await fb.get('waimai', 'getCourierLocation', { orderid: props.id });
    if (typeof raw === 'string' && raw) pathRaw.value = raw;
  } catch {
    // 位置刷新失败不打扰用户：下一轮自动重试，界面保留上一次的位置
  } finally {
    inflight = false;
  }
}
function stopPoll() {
  if (timer) { clearInterval(timer); timer = null; }
}
function syncPoll() {
  // 页面在后台时不轮询：既省流量也避免 webview 被系统降频后定时器堆积
  const on = isTracking.value && typeof document !== 'undefined' && document.visibilityState === 'visible';
  if (on && !timer) {
    pollCourier();
    timer = setInterval(pollCourier, POLL_MS);
  } else if (!on) {
    stopPoll();
  }
}
watch([isTracking, () => props.id], syncPoll);
const onVisible = () => syncPoll();
onMounted(() => { document.addEventListener('visibilitychange', onVisible); });
onUnmounted(() => { stopPoll(); document.removeEventListener('visibilitychange', onVisible); });


// 时间戳格式化（上游返回的是秒级 unix 时间；paydate = -1 表示货到付款，不是真实时间）
const fmtTime = (ts: any) => {
  const n = Number(ts);
  if (!n || n <= 0) return '';
  const d = new Date(n * 1000);
  const p = (x: number) => String(x).padStart(2, '0');
  return `${d.getMonth() + 1}/${d.getDate()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};
// 时间线节点（对齐 H5 orderdetail-waimai.html 的下单/支付/接单/配送/送达）
const timeline = computed(() => {
  const o = order.value || {};
  return [
    { key: 'placed', ts: o.pubdate },
    { key: 'paid', ts: o.paydate },
    { key: 'confirmed', ts: o.confirmdate },
    { key: 'delivering', ts: o.peidate },
    { key: 'delivered', ts: o.okdate },
  ].map((x) => ({ ...x, text: fmtTime(x.ts) })).filter((x) => !!x.text);
});
// 优惠/费用明细（上游把 pointprice 塞进第 0 项且 type 改成了字符串，跳过）
const priceLines = computed(() => {
  const arr = (order.value && order.value.priceinfo) || [];
  if (!Array.isArray(arr)) return [];
  return arr.filter((x: any) => x && x.type && String(x.type) !== 'pointprice' && Number(x.amount) !== 0);
});
const telHref = (p: any) => 'tel:' + String(p || '').replace(/[^\d+]/g, '');
const money = (v: any) => '₱' + Number(v || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 });

// 上游 priceinfo.type 与 paytype 是中文原文（火鸟不分语言），做常见项映射，未命中回退原文
const FEE_TYPE_MAP: Record<string, string> = {
  '配送费': 'order.fee.delivery',
  '打包费': 'order.fee.packing',
  '餐盒费': 'order.fee.packing',
  '服务费': 'order.fee.service',
  '优惠': 'order.fee.discount',
  '满减': 'order.fee.discount',
  '新客立减': 'order.fee.discount',
  '积分抵扣': 'order.fee.point',
};
const feeLabel = (type: any) => {
  const s = String(type || '');
  const key = FEE_TYPE_MAP[s];
  return key ? t(key) : s;
};
const payLabel = (p: any) => {
  const s = String(p || '');
  if (!s) return '';
  if (/货到付款|delivery/i.test(s)) return t('checkout.codPay');
  return s;
};
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
      <!-- 状态头 -->
      <div class="card card--pad">
        <div style="display: flex; align-items: center; justify-content: space-between">
          <span class="h2">{{ order.shopname || t('orders.title') }}</span>
          <span class="chip" :class="{ 'chip--ok': stateKey(order.state) === 'done', 'chip--mute': stateKey(order.state) === 'cancelled' }">
            {{ label(order.state) }}
          </span>
        </div>
        <p class="meta" style="margin: 8px 0 0">#{{ order.ordernum }}</p>
        <p v-if="order.qcma" class="meta" style="margin: 4px 0 0">{{ t('order.pickupCode') }} <b>{{ order.qcma }}</b></p>
        <p v-if="order.failed" class="meta" style="margin: 4px 0 0; color: var(--brand)">{{ order.failed }}</p>
      </div>

      <!-- 配送地图（商家已接单之后才有意义） -->
      <DeliveryMap v-if="showMap" :view="deliveryView" :live="isTracking" style="margin-top: 14px" />

      <!-- 商品 -->
      <div class="section-head" style="margin-top: 16px"><h2 class="h2">{{ t('checkout.items') }}</h2></div>
      <div class="list">
        <div v-for="(f, i) in (order.food || [])" :key="i" class="row">
          <span class="grow">{{ f.title || f.name || ('#' + f.id) }}</span>
          <span class="val">× {{ f.count }}</span>
        </div>
      </div>

      <!-- 账单 -->
      <div class="card card--pad" style="margin-top: 14px">
        <div class="bill">
          <div v-for="(p, i) in priceLines" :key="i" class="row">
            <span>{{ feeLabel(p.type) }}</span><b>{{ money(p.amount) }}</b>
          </div>
          <div v-if="order.paytype" class="row"><span>{{ t('checkout.payMethod') }}</span><b>{{ payLabel(order.paytype) }}</b></div>
          <div class="row total"><span>{{ t('orders.amount') }}</span><b>{{ money(order.amount) }}</b></div>
        </div>
      </div>

      <!-- 配送信息 -->
      <div class="section-head" style="margin-top: 16px"><h2 class="h2">{{ t('order.delivery') }}</h2></div>
      <div class="list">
        <div class="row">
          <span class="lead"><AppIcon name="pin" :size="17" /></span>
          <span class="grow">
            <span style="display: block; font-weight: 600">{{ order.person }}</span>
            <span class="meta">{{ order.address }}</span>
          </span>
        </div>
        <a v-if="order.tel" class="row" :href="telHref(order.tel)">
          <span class="lead"><AppIcon name="phone" :size="17" /></span>
          <span class="grow">{{ order.tel }}</span>
          <AppIcon name="chevron-right" :size="14" />
        </a>
        <a v-if="order.peisongname || order.peisongphone" class="row" :href="telHref(order.peisongphone)">
          <span class="lead"><AppIcon name="bag" :size="17" /></span>
          <span class="grow">
            <span style="display: block; font-weight: 600">{{ order.peisongname || t('order.courier') }}</span>
            <span class="meta">{{ order.peisongphone }}</span>
          </span>
          <AppIcon v-if="order.peisongphone" name="phone" :size="15" />
        </a>
      </div>

      <!-- 时间线 -->
      <template v-if="timeline.length">
        <div class="section-head" style="margin-top: 16px"><h2 class="h2">{{ t('order.timeline') }}</h2></div>
        <div class="card card--pad">
          <div v-for="tl in timeline" :key="tl.key" class="row">
            <span>{{ t('order.t.' + tl.key) }}</span>
            <span class="meta" style="font-variant-numeric: tabular-nums">{{ tl.text }}</span>
          </div>
        </div>
      </template>

      <!-- 备注 / 餐具 -->
      <div v-if="order.note || (order.preset && order.preset.length)" class="card card--pad" style="margin-top: 14px">
        <div v-if="order.note" class="row">
          <span>{{ t('checkout.note') }}</span><b style="font-weight: 600">{{ order.note }}</b>
        </div>
        <div v-if="order.preset && order.preset.length" class="row">
          <span>{{ t('order.preset') }}</span><b style="font-weight: 600">{{ order.preset.join(' / ') }}</b>
        </div>
      </div>

      <!-- 操作 -->
      <div style="display: flex; gap: 10px; margin-top: 16px">
        <a v-if="order.shoptel" class="btn btn--soft" style="flex: 1" :href="telHref(order.shoptel)">{{ t('order.contactShop') }}</a>
        <button v-if="isCancellable(order.state)" class="btn btn--ghost" style="flex: 1" @click="cancel">{{ t('orders.cancel') }}</button>
      </div>
    </template>
  </div>
</template>
