<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showConfirmDialog } from 'vant';
import { fb, i18n } from '../services';
import { useCartStore, type Food } from '../stores/cart';
import { formatPhp } from '../lib/cart.js';

interface FoodItem extends Food { typeid: string | number }
interface FoodType { id: string | number; title: string }
const props = defineProps<{ id: string }>();
const router = useRouter();
const cart = useCartStore();
const types = ref<FoodType[]>([]);
const foods = ref<FoodItem[]>([]);
const active = ref(0);
const loading = ref(true);
const failed = ref(false);
const t = (k: string) => i18n.t(k);

const visible = computed(() => {
  const tid = types.value[active.value]?.id;
  return tid === undefined ? foods.value : foods.value.filter((f) => String(f.typeid) === String(tid));
});

async function load() {
  loading.value = true;
  failed.value = false;
  try {
    const [tp, fd] = await Promise.all([
      fb.get('waimai', 'foodType', { shop: props.id }, { anonymous: true }),
      fb.get('waimai', 'food', { shop: props.id }, { anonymous: true }),
    ]);
    types.value = Array.isArray(tp) ? tp : [];
    foods.value = Array.isArray(fd) ? fd : [];
  } catch (e) {
    failed.value = true;
  } finally {
    loading.value = false;
  }
}

async function addFood(f: FoodItem) {
  if (cart.add(props.id, f) === 'needs-switch') {
    try {
      await showConfirmDialog({ title: t('cart.switchShopTitle'), message: t('cart.switchShopMsg') });
      cart.switchShop(props.id, f);
    } catch { /* 用户取消，保持原购物车 */ }
  }
}
const money = (v: string | number) => formatPhp(Math.round(Number(v) * 100));
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
      <van-tabs v-if="types.length" v-model:active="active" shrink>
        <van-tab v-for="ty in types" :key="ty.id" :title="ty.title" />
      </van-tabs>
      <van-empty v-if="visible.length === 0" :description="t('menu.empty')" />
      <div class="fbs-card" style="margin-top: 12px">
        <div v-for="f in visible" :key="f.id" class="cart-line">
          <div class="t">
            <div>{{ f.title }}</div>
            <div class="p">{{ money(f.price) }}</div>
          </div>
          <van-button size="small" round type="primary" @click="addFood(f)">＋ {{ t('cart.add') }}</van-button>
        </div>
      </div>
    </template>
    <van-submit-bar
      v-if="cart.count"
      :price="cart.totalCents"
      :button-text="t('cart.checkout')"
      :label="t('cart.total')"
      currency="₱"
      @submit="router.push({ name: 'cart' })"
    />
  </div>
</template>
