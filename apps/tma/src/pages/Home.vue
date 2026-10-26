<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { fb, t, toggleLang } from '../services';
import AppIcon from '../components/AppIcon.vue';

interface Shop {
  id: string; shopname: string; pic?: string; yingye?: number | string; typename?: string;
  description?: string; basicprice?: string; delivery_fee?: string; delivery_time?: string;
  star?: string | number; sale?: string | number; is_first_discount?: string; juli?: string;
}
type SortKey = 'all' | 'star' | 'sale' | 'price';

const shops = ref<Shop[]>([]);
const cats = ref<string[]>([]);
const activeCat = ref('');
const sort = ref<SortKey>('all');
const keyword = ref('');
const loading = ref(true);
const failed = ref(false);

const hour = new Date().getHours();
const greeting = computed(() => (hour < 11 ? t('home.greetMorning') : hour < 17 ? t('home.greetAfternoon') : t('home.greetEvening')));
const php = (v?: string | number) => `₱${Number(v || 0).toLocaleString('en-PH', { maximumFractionDigits: 0 })}`;

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'all', label: 'common.reco' },
  { key: 'star', label: 'shop.sortStar' },
  { key: 'sale', label: 'shop.sortSale' },
  { key: 'price', label: 'shop.sortPrice' },
];

async function load() {
  loading.value = true;
  failed.value = false;
  try {
    const info = await fb.get('waimai', 'shopList', { page: 1, pageSize: 20 }, { anonymous: true });
    const rows: Shop[] = Array.isArray(info?.list) ? info.list : [];
    shops.value = rows;
    const set = new Set<string>();
    rows.forEach((s) => { if (s.typename) set.add(s.typename); });
    cats.value = [...set];
  } catch {
    failed.value = true;
  } finally {
    loading.value = false;
  }
}

const visible = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  let rows = shops.value.filter((s) => {
    if (activeCat.value && s.typename !== activeCat.value) return false;
    if (!q) return true;
    return [s.shopname, s.description, s.typename].some((v) => String(v || '').toLowerCase().includes(q));
  });
  if (sort.value === 'star') rows = [...rows].sort((a, b) => Number(b.star || 0) - Number(a.star || 0));
  if (sort.value === 'sale') rows = [...rows].sort((a, b) => Number(b.sale || 0) - Number(a.sale || 0));
  if (sort.value === 'price') rows = [...rows].sort((a, b) => Number(a.basicprice || 0) - Number(b.basicprice || 0));
  return rows;
});

onMounted(load);
</script>

<template>
  <div class="page">
    <!-- 渐变头部：定位 + 问候 + 搜索 -->
    <header class="hero">
      <div class="hero-top">
        <div class="hero-loc">
          <AppIcon name="pin" :size="15" />
          <span>{{ t('home.area') }}</span>
          <AppIcon name="chevron-down" :size="14" />
        </div>
        <button class="hero-lang" @click="toggleLang">{{ t('lang.switch') }}</button>
      </div>
      <h1 class="hero-title">{{ greeting }}<br /><em>{{ t('home.ask') }}</em></h1>
      <div class="hero-sub">
        <span>{{ t('home.subShopN', { n: shops.length || 3 }) }}</span>
        <i />
        <span>{{ t('home.subPoint') }}</span>
      </div>
    </header>

    <div class="searchbox">
      <AppIcon name="search" :size="19" />
      <input v-model="keyword" :placeholder="t('home.searchPh')" enterkeyhint="search" />
      <button v-if="keyword" class="clear" @click="keyword = ''"><AppIcon name="close" :size="16" /></button>
    </div>

    <div class="highlights">
      <div class="item"><AppIcon name="clock" :size="16" /><b>30′</b><span>{{ t('home.hlTime') }}</span></div>
      <div class="item"><AppIcon name="wallet" :size="16" /><b>COD</b><span>{{ t('home.hlPay') }}</span></div>
      <div class="item"><AppIcon name="shield" :size="16" /><b>{{ t('home.hlSvc') }}</b><span>{{ t('home.hlSvcSub') }}</span></div>
    </div>

    <!-- 品类 -->
    <div v-if="cats.length > 1" class="pills" style="margin-top: 18px">
      <button class="pill" :class="{ 'is-active': activeCat === '' }" @click="activeCat = ''">{{ t('common.all') }}</button>
      <button
        v-for="c in cats"
        :key="c"
        class="pill"
        :class="{ 'is-active': activeCat === c }"
        @click="activeCat = activeCat === c ? '' : c"
      >{{ c }}</button>
    </div>

    <!-- 排序 -->
    <div class="section-head">
      <h2 class="h2">{{ t('shop.section') }}</h2>
      <div class="side">{{ t('home.shopCount', { n: visible.length }) }}</div>
    </div>
    <div class="pills" style="margin-bottom: 14px">
      <button
        v-for="o in sortOptions"
        :key="o.key"
        class="pill"
        :class="{ 'is-active': sort === o.key }"
        @click="sort = o.key"
      >{{ t(o.label) }}</button>
    </div>

    <!-- 骨架 -->
    <template v-if="loading">
      <div v-for="i in 3" :key="i" class="skel">
        <div class="b" style="width: 100%; aspect-ratio: 16 / 9" />
        <div class="b" style="width: 62%; height: 17px; margin: 14px 8px 0" />
        <div class="b" style="width: 44%; height: 12px; margin: 10px 8px 0" />
      </div>
    </template>

    <div v-else-if="failed" class="state">
      <div class="emoji">😵</div>
      <p class="msg">{{ t('shop.loadFailed') }}</p>
      <button class="btn btn--primary" @click="load">{{ t('common.retry') }}</button>
    </div>

    <div v-else-if="visible.length === 0" class="state">
      <div class="emoji">🔍</div>
      <p class="msg">{{ keyword || activeCat ? t('shop.noMatch') : t('shop.empty') }}</p>
      <button v-if="keyword || activeCat" class="btn btn--ghost" @click="keyword = ''; activeCat = ''">{{ t('common.reset') }}</button>
    </div>

    <!-- 商家 -->
    <template v-else>
      <router-link v-for="s in visible" :key="s.id" :to="{ name: 'shop', params: { id: s.id } }" class="shop">
        <div class="cover">
          <img :src="s.pic" alt="" loading="lazy" />
          <span class="badge badge--tl" :class="{ 'badge--open': Number(s.yingye) }">
            {{ Number(s.yingye) ? t('shop.open') : t('shop.closed') }}
          </span>
          <span v-if="s.delivery_time" class="badge badge--tr">
            <AppIcon name="clock" :size="12" />{{ s.delivery_time }}′
          </span>
          <div class="cover-name">{{ s.shopname }}</div>
        </div>
        <div class="body">
          <div class="row">
            <span v-if="s.star" class="rate"><AppIcon name="star" :size="13" />{{ Number(s.star).toFixed(1) }}</span>
            <span class="cat">{{ s.typename }}</span>
            <span v-if="Number(s.sale)" class="cat">· {{ t('shop.soldN', { n: s.sale }) }}</span>
          </div>
          <div class="facts">
            <span>{{ t('shop.minOrder') }} <b>{{ php(s.basicprice) }}</b></span>
            <i />
            <span>{{ t('shop.deliveryFee') }} <b>{{ php(s.delivery_fee) }}</b></span>
          </div>
          <div v-if="Number(s.is_first_discount) || Number(s.delivery_fee) === 0" class="tags">
            <span v-if="Number(s.is_first_discount)" class="tag">{{ t('shop.firstDiscount') }}</span>
            <span v-if="Number(s.delivery_fee) === 0" class="tag tag--gold">{{ t('shop.freeDelivery') }}</span>
          </div>
        </div>
      </router-link>
    </template>
  </div>
</template>
