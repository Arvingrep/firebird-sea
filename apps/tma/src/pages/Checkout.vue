<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { fb, i18n } from '../services';
import { useCartStore } from '../stores/cart';
import { buildDealParams, ValidationError } from '../lib/checkout.js';
import { formatPhp } from '../lib/cart.js';

interface Address { id: string; person: string; tel: string; address: string }
const router = useRouter();
const cart = useCartStore();
const t = (k: string) => i18n.t(k);
const addresses = ref<Address[]>([]);
const addressId = ref('');
const note = ref('');
const submitting = ref(false);
// 同一次下单尝试复用同一幂等键：网络重试不会产生第二张订单
const idempotencyKey = fb.newKey();
const result = ref<{ ordernum?: string } | null>(null);

const canSubmit = computed(() => cart.canCheckout && !!addressId.value && !submitting.value);

onMounted(async () => {
  try {
    const info = await fb.get('waimai', 'getMemberAddress', {});
    addresses.value = Array.isArray(info?.list) ? info.list : [];
    if (addresses.value.length) addressId.value = String(addresses.value[0].id);
  } catch { addresses.value = []; }
});

async function submit() {
  submitting.value = true;
  try {
    const params = buildDealParams({ shopId: cart.shopId as string, lines: cart.items, addressId: addressId.value, note: note.value });
    const info = await fb.post('waimai', 'deal', params, { idempotencyKey });
    result.value = { ordernum: typeof info === 'string' ? info : info?.ordernum };
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
    <template v-if="result">
      <van-empty :description="t('checkout.success')" />
      <p v-if="result.ordernum" class="hint">{{ t('orders.number') }}: {{ result.ordernum }}</p>
      <van-button block type="primary" @click="router.replace({ name: 'orders' })">{{ t('nav.orders') }}</van-button>
    </template>
    <template v-else>
      <van-cell-group :title="t('checkout.address')">
        <p v-if="addresses.length === 0" class="hint">{{ t('checkout.noAddress') }}</p>
        <van-radio-group v-model="addressId">
          <van-cell v-for="a in addresses" :key="a.id" :title="`${a.person} ${a.tel}`" :label="a.address" clickable @click="addressId = String(a.id)">
            <template #right-icon><van-radio :name="String(a.id)" /></template>
          </van-cell>
        </van-radio-group>
        <van-button size="small" plain @click="router.push({ name: 'addresses' })">{{ t('address.add') }}</van-button>
      </van-cell-group>
      <van-cell v-for="l in cart.items" :key="l.id" :title="`${l.title} × ${l.qty}`" :value="formatPhp(l.priceCents * l.qty)" />
      <van-field v-model="note" :label="t('checkout.note')" maxlength="200" />
      <van-cell :title="t('cart.total')" :value="formatPhp(cart.totalCents)" :label="t('checkout.codHint')" />
      <van-button block type="primary" :disabled="!canSubmit" :loading="submitting" @click="submit">{{ t('checkout.submit') }}</van-button>
    </template>
  </div>
</template>
