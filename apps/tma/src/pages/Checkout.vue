<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { fb, t } from '../services';
import { listRows } from '../lib/fbClient.js';
import { useCartStore } from '../stores/cart';
import { buildDealParams, parseDealResult, PAY_TYPE_COD, ValidationError } from '../lib/checkout.js';
import { formatPhp } from '../lib/cart.js';
import AppIcon from '../components/AppIcon.vue';

interface Address { id: string; person: string; tel: string; address: string; street?: string; default?: string }
const router = useRouter();
const cart = useCartStore();
const addresses = ref<Address[]>([]);
const addressId = ref('');
const note = ref('');
const submitting = ref(false);
// 同一次下单尝试复用同一幂等键：网络重试不会产生第二张订单
const idempotencyKey = fb.newKey();
const result = ref<{ ordernum?: string } | null>(null);

const canSubmit = computed(() => cart.canPlaceOrder && !!addressId.value && !submitting.value);

onMounted(async () => {
  // 起送价快照可能已过期（商家调价 / 长时间停留）：进结算页刷新一次，避免拿旧门槛拦住能成立的订单
  if (cart.shopId) {
    fb.get('waimai', 'storeDetail', { id: cart.shopId }, { anonymous: true })
      .then((si) => cart.setShopMeta(cart.shopId as string, {
        name: si?.shopname || '',
        minOrderCents: Math.round(Number(si?.basicprice || 0) * 100),
      }))
      .catch(() => { /* 用快照，TTL 兜底 */ });
  }
  try {
    const info = await fb.get('waimai', 'getMemberAddress', {});
    addresses.value = listRows(info);
    if (addresses.value.length) addressId.value = String(addresses.value[0].id);
  } catch { addresses.value = []; }
});

async function submit() {
  // 防御：起送价可能在浏览过程中被店铺后台改高，或本地快照过期——上游会直接拒单，
  // 与其等建单失败再报错，不如在发请求前就说清楚差多少。
  if (cart.shortfallCents > 0) {
    showToast(t('cart.belowMin', { v: formatPhp(cart.shortfallCents) }));
    return;
  }
  submitting.value = true;
  try {
    const params = buildDealParams({
      shopId: cart.shopId as string,
      lines: cart.items,
      addressId: addressId.value,
      note: note.value,
      payType: PAY_TYPE_COD,
    });
    const info = await fb.post('waimai', 'deal', params, { idempotencyKey });
    const parsed = parseDealResult(info);
    // 上游对「店铺不支持货到付款 / 超出货到付款限额」会在建单前直接拒绝（state=200），
    // 走到这里说明订单已创建；needOnline 仅作防御（本 app 无收银台，无法完成在线支付）。
    if (parsed.needOnline) {
      showToast(t('checkout.needOnline'));
      return;
    }
    result.value = { ordernum: parsed.ordernum };
    cart.clear();
    showToast(t('checkout.success'));
  } catch (e: any) {
    if (e instanceof ValidationError) showToast(t(e.code === 'ADDRESS_REQUIRED' ? 'checkout.noAddress' : 'cart.empty'));
    else showToast(e?.message || t('checkout.failed'));
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="page">
    <div class="nav">
      <button class="icon-btn" @click="router.back()"><AppIcon name="chevron-left" :size="19" /></button>
      <span class="title">{{ t('checkout.title') }}</span>
    </div>

    <!-- 下单成功 -->
    <template v-if="result">
      <div class="state">
        <div class="emoji">🎉</div>
        <p class="msg">{{ t('checkout.success') }}</p>
        <p v-if="result.ordernum" class="meta">{{ t('orders.number') }} {{ result.ordernum }}</p>
        <p class="meta" style="margin-bottom: 18px">{{ t('checkout.codSubmitted') }}</p>
        <button class="btn btn--primary" style="width: 100%" @click="router.replace({ name: 'orders' })">{{ t('checkout.viewOrder') }}</button>
        <button class="btn btn--soft" style="width: 100%; margin-top: 10px" @click="router.replace({ name: 'home' })">{{ t('checkout.keepShopping') }}</button>
      </div>
    </template>

    <template v-else>
      <!-- 地址 -->
      <div class="section-head" style="margin-top: 8px">
        <h2 class="h2">{{ t('checkout.address') }}</h2>
        <button class="side" @click="router.push({ name: 'addresses' })">{{ t('address.add') }}<AppIcon name="chevron-right" :size="13" /></button>
      </div>

      <div v-if="addresses.length === 0" class="card card--pad">
        <p class="hint" style="margin: 0 0 12px">{{ t('checkout.noAddress') }}</p>
        <button class="btn btn--soft" style="width: 100%" @click="router.push({ name: 'addresses' })">{{ t('address.add') }}</button>
      </div>

      <div v-else class="list">
        <button
          v-for="a in addresses"
          :key="a.id"
          class="row"
          style="width: 100%; text-align: left"
          @click="addressId = String(a.id)"
        >
          <span class="lead"><AppIcon name="pin" :size="17" /></span>
          <span class="grow">
            <span style="display: block; font-weight: 600">{{ a.street || a.address }}</span>
            <span class="meta">{{ a.person }} · {{ a.tel }}</span>
          </span>
          <span class="radio" :class="{ 'is-on': String(addressId) === String(a.id) }">
            <AppIcon v-if="String(addressId) === String(a.id)" name="check" :size="13" :stroke="3" />
          </span>
        </button>
      </div>

      <!-- 商品 -->
      <div class="section-head"><h2 class="h2">{{ t('checkout.items') }}</h2></div>
      <div class="list">
        <div v-for="l in cart.items" :key="l.id" class="row">
          <span class="grow">{{ l.title }}</span>
          <span class="val">× {{ l.qty }}</span>
          <span style="font-weight: 700; font-variant-numeric: tabular-nums">{{ formatPhp(l.priceCents * l.qty) }}</span>
        </div>
      </div>

      <!-- 备注 -->
      <div class="section-head"><h2 class="h2">{{ t('checkout.note') }}</h2></div>
      <div class="card card--pad" style="padding: 6px 14px">
        <van-field
          v-model="note"
          type="textarea"
          rows="2"
          autosize
          maxlength="200"
          show-word-limit
          :placeholder="t('checkout.notePh')"
          style="padding: 8px 0"
        />
      </div>

      <!-- 账单 -->
      <div class="card card--pad" style="margin-top: 14px">
        <div class="bill">
          <div class="row"><span>{{ t('cart.subtotal') }}</span><b>{{ formatPhp(cart.totalCents) }}</b></div>
          <div v-if="cart.minOrderCents > 0" class="row">
            <span>{{ t('cart.minOrder') }}</span><b>{{ formatPhp(cart.minOrderCents) }}</b>
          </div>
          <div class="row"><span>{{ t('checkout.payMethod') }}</span><b>{{ t('checkout.codPay') }}</b></div>
          <div class="row total"><span>{{ t('cart.total') }}</span><b>{{ formatPhp(cart.totalCents) }}</b></div>
        </div>
      </div>

      <div class="cartbar">
        <div class="sum" style="margin-left: 10px">
          <b>{{ formatPhp(cart.totalCents) }}</b>
          <span>{{ t('checkout.codHint') }}</span>
        </div>
        <button class="go" :disabled="!canSubmit" @click="submit">
          {{ submitting ? t('common.loading') : t('checkout.submit') }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.radio {
  flex: none; width: 22px; height: 22px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  box-shadow: inset 0 0 0 1.5px var(--line-2); color: #fff;
}
.radio.is-on { background: var(--brand); box-shadow: none; }
</style>
