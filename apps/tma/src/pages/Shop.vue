<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showConfirmDialog } from 'vant';
import { fb, t } from '../services';
import { useCartStore, type Food } from '../stores/cart';
import { formatPhp } from '../lib/cart.js';
import AppIcon from '../components/AppIcon.vue';

interface FoodItem extends Food { typeid: string | number; typeName?: string; descript?: string; formerprice?: string; sale?: number | string; unit?: string }
interface FoodType { id: string | number; title: string }
interface ShopInfo {
  shopname?: string; description?: string; star?: string; sale?: string; delivery_time?: string;
  basicprice?: string; delivery_fee?: string; shop_banner?: string[]; share_pic?: string;
  address?: string; start_time1?: string; end_time1?: string; yingye?: number | string; typeName?: string;
}

const props = defineProps<{ id: string }>();
const router = useRouter();
const cart = useCartStore();
const info = ref<ShopInfo>({});
const types = ref<FoodType[]>([]);
const foods = ref<FoodItem[]>([]);
const active = ref<string | number>('');
const loading = ref(true);
const failed = ref(false);

const cover = computed(() => info.value.shop_banner?.[0] || info.value.share_pic || '');
const php = (v?: string | number) => `₱${Number(v || 0).toLocaleString('en-PH', { maximumFractionDigits: 0 })}`;
const money = (v: string | number) => formatPhp(Math.round(Number(v) * 100));

const groups = computed(() => {
  if (active.value !== '') {
    const rows = foods.value.filter((f) => String(f.typeid) === String(active.value));
    return [{ title: '', rows }];
  }
  const map = new Map<string, FoodItem[]>();
  foods.value.forEach((f) => {
    const k = String(f.typeName || t('menu.other'));
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(f);
  });
  return [...map.entries()].map(([title, rows]) => ({ title, rows }));
});

const qtyOf = (id: string | number) => cart.items.find((l) => String(l.id) === String(id))?.qty || 0;
// 同店菜品图与封面一致时不重复展示（种子数据里每道菜都用了店铺横幅），有独立图就自动显示
const showThumb = (f: FoodItem) => {
  const pic = f.pics?.[0];
  return !!pic && pic !== cover.value;
};

async function load() {
  loading.value = true;
  failed.value = false;
  try {
    const [si, tp, fd] = await Promise.all([
      fb.get('waimai', 'storeDetail', { id: props.id }, { anonymous: true }),
      fb.get('waimai', 'foodType', { shop: props.id }, { anonymous: true }),
      fb.get('waimai', 'food', { shop: props.id }, { anonymous: true }),
    ]);
    info.value = si || {};
    types.value = Array.isArray(tp) ? tp : [];
    foods.value = Array.isArray(fd) ? fd : [];
  } catch {
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
function dec(f: FoodItem) {
  cart.setQty(f.id, Math.max(0, qtyOf(f.id) - 1));
}
onMounted(load);
</script>

<template>
  <div class="page">
    <div class="shop-hero">
      <img v-if="cover" :src="cover" alt="" />
      <div class="nav">
        <button class="icon-btn icon-btn--glass" @click="router.back()"><AppIcon name="chevron-left" :size="19" /></button>
        <span class="spacer" />
      </div>
    </div>

    <div v-if="loading" class="state"><van-loading vertical>{{ t('common.loading') }}</van-loading></div>

    <div v-else-if="failed" class="state">
      <div class="emoji">😵</div>
      <p class="msg">{{ t('shop.loadFailed') }}</p>
      <button class="btn btn--primary" @click="load">{{ t('common.retry') }}</button>
    </div>

    <template v-else>
      <section class="sheet">
        <h1 class="name">{{ info.shopname }}</h1>
        <p v-if="info.description" class="desc">{{ info.description }}</p>
        <div class="stats">
          <div class="st"><b>{{ Number(info.star || 0).toFixed(1) }}</b><span>{{ t('shop.rating') }}</span></div>
          <div class="st"><b>{{ info.sale || 0 }}</b><span>{{ t('shop.sold') }}</span></div>
          <div class="st"><b>{{ info.delivery_time || '—' }}<small>′</small></b><span>{{ t('shop.eta') }}</span></div>
          <div class="st"><b>{{ php(info.delivery_fee) }}</b><span>{{ t('shop.deliveryFee') }}</span></div>
        </div>
        <div v-if="info.address || info.start_time1" class="notice">
          <AppIcon name="pin" :size="14" />
          <span>
            {{ info.address }}
            <template v-if="info.start_time1"> · {{ info.start_time1 }}–{{ info.end_time1 }}</template>
          </span>
        </div>
      </section>

      <div class="sticky-pills">
        <div class="pills" style="margin: 0">
          <button class="pill" :class="{ 'is-active': active === '' }" @click="active = ''">{{ t('common.all') }}</button>
          <button
            v-for="ty in types"
            :key="ty.id"
            class="pill"
            :class="{ 'is-active': String(active) === String(ty.id) }"
            @click="active = ty.id"
          >{{ ty.title }}</button>
        </div>
      </div>

      <div v-if="foods.length === 0" class="state"><div class="emoji">🍽️</div><p class="msg">{{ t('menu.empty') }}</p></div>

      <template v-for="g in groups" :key="g.title">
        <div v-if="g.title" class="menu-group-head">{{ g.title }}</div>
        <article v-for="f in g.rows" :key="f.id" class="dish">
          <img v-if="showThumb(f)" class="thumb" :src="f.pics![0]" alt="" loading="lazy" />
          <div class="main">
            <div class="t">{{ f.title }}</div>
            <div v-if="f.descript" class="d">{{ f.descript }}</div>
            <div class="m">
              <span v-if="Number(f.sale)">{{ t('shop.soldN', { n: f.sale }) }}</span>
              <span v-if="f.unit">· {{ f.unit }}</span>
            </div>
            <div class="p-row">
              <div>
                <span class="p"><small>₱</small>{{ Number(f.price).toLocaleString('en-PH', { maximumFractionDigits: 0 }) }}</span>
                <span v-if="Number(f.formerprice) > Number(f.price)" class="was">₱{{ Number(f.formerprice).toLocaleString('en-PH', { maximumFractionDigits: 0 }) }}</span>
              </div>
              <div v-if="qtyOf(f.id)" class="qty">
                <button @click="dec(f)"><AppIcon name="minus" :size="14" :stroke="2.2" /></button>
                <span class="n">{{ qtyOf(f.id) }}</span>
                <button class="add-btn" style="width: 26px; height: 26px" @click="addFood(f)"><AppIcon name="plus" :size="14" :stroke="2.2" /></button>
              </div>
              <button v-else class="add-btn" @click="addFood(f)"><AppIcon name="plus" :size="17" :stroke="2.4" /></button>
            </div>
          </div>
        </article>
      </template>

      <div v-if="cart.count" class="cartbar">
        <div class="cnt">
          <AppIcon name="cart" :size="21" />
          <span class="b">{{ cart.count }}</span>
        </div>
        <div class="sum">
          <b>{{ money(cart.totalCents / 100) }}</b>
          <span>{{ t('cart.minOrderHint', { v: php(info.basicprice) }) }}</span>
        </div>
        <button class="go" @click="router.push({ name: 'cart' })">{{ t('cart.checkout') }}<AppIcon name="chevron-right" :size="15" :stroke="2.4" /></button>
      </div>
    </template>
  </div>
</template>
