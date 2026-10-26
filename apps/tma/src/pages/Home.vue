<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import { fb, t, toggleLang } from '../services';
import { createSearchHistory } from '../lib/searchHistory.js';
import AppIcon from '../components/AppIcon.vue';

interface Shop {
  id: string; shopname: string; pic?: string; yingye?: number | string; typename?: string;
  description?: string; basicprice?: string; delivery_fee?: string; delivery_time?: string;
  star?: string | number; sale?: string | number; is_first_discount?: string; juli?: string;
}
interface Cat { id: string | number; title: string }
type SortKey = 'all' | 'star' | 'sale' | 'price';

const PAGE_SIZE = 20;
// 上游 orderby：0 默认 / 2 销量 / 3 起送价 / 5 评分（服务端全量排序，不是只排当前页）
const ORDERBY: Record<SortKey, string> = { all: '0', star: '5', sale: '2', price: '3' };

const shops = ref<Shop[]>([]);
const cats = ref<Cat[]>([]);
const activeCat = ref('');
const sort = ref<SortKey>('all');
const kwInput = ref('');     // 输入框里的实时值
const keyword = ref('');     // 已生效（已发请求）的关键词
const page = ref(1);
const total = ref(0);
const hasMore = ref(false);
const firstLoad = ref(true);
const loadingMore = ref(false);
const failed = ref(false);
const history = createSearchHistory();
const hist = ref<string[]>(history.list());

const hour = new Date().getHours();
const greeting = computed(() => (hour < 11 ? t('home.greetMorning') : hour < 17 ? t('home.greetAfternoon') : t('home.greetEvening')));
const php = (v?: string | number) => `₱${Number(v || 0).toLocaleString('en-PH', { maximumFractionDigits: 0 })}`;
// 搜索时上游的 totalCount 不可信（见 fetchPage 注释），一律用已加载条数
const shopCount = computed(() => (keyword.value ? shops.value.length : total.value || shops.value.length));

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'all', label: 'common.reco' },
  { key: 'star', label: 'shop.sortStar' },
  { key: 'sale', label: 'shop.sortSale' },
  { key: 'price', label: 'shop.sortPrice' },
];

let reqToken = 0;

async function fetchPage(next: number) {
  const token = ++reqToken;
  if (next === 1) { firstLoad.value = true; failed.value = false; } else loadingMore.value = true;
  const params: Record<string, string | number> = { page: next, pageSize: PAGE_SIZE, orderby: ORDERBY[sort.value] };
  if (keyword.value) params.keywords = keyword.value;
  if (activeCat.value) params.typeid = activeCat.value;
  try {
    const info = await fb.get('waimai', 'shopList', params, { anonymous: true });
    if (token !== reqToken) return; // 已被更新的请求取代
    const rows: Shop[] = Array.isArray(info?.list) ? info.list : [];
    const tc = Number(info?.pageInfo?.totalCount || 0);
    shops.value = next === 1 ? rows : [...shops.value, ...rows];
    if (next === 1) total.value = tc || rows.length;
    // 带 keywords 时上游的 totalCount 是「匹配到的菜品行数」而不是店铺数
    // （countSql 带 GROUP BY s.id 且用 getOne 取首行），数字偏大且不可信。
    // 因此"还有没有下一页"一律按本次返回条数判断，绝不看 totalCount。
    hasMore.value = rows.length >= PAGE_SIZE;
    page.value = next;
  } catch {
    if (token !== reqToken) return;
    if (next === 1) { shops.value = []; failed.value = true; }
    hasMore.value = false;
  } finally {
    if (token === reqToken) { firstLoad.value = false; loadingMore.value = false; }
  }
}

async function load() {
  await Promise.all([fetchPage(1), loadCats()]);
}

async function loadCats() {
  try {
    const info = await fb.get('waimai', 'shopType', {}, { anonymous: true });
    const rows: Cat[] = Array.isArray(info) ? info : Array.isArray(info?.list) ? info.list : [];
    // 跑腿分类（paotui=1）不是外卖店，首页不该出现
    cats.value = rows.filter((c: any) => !Number(c?.paotui)).slice(0, 12);
  } catch { cats.value = []; }
}

// —— 搜索 ——
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSearch() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const v = kwInput.value.trim();
    if (v === keyword.value) return;
    keyword.value = v; // 不记历史：防抖中途的半截词不该进历史
    fetchPage(1);
  }, 350);
}
function commitSearch() {
  if (debounceTimer) clearTimeout(debounceTimer);
  const v = kwInput.value.trim();
  keyword.value = v;
  if (v && history.add(v)) hist.value = history.list();
  fetchPage(1);
}
function useHistory(q: string) {
  kwInput.value = q;
  commitSearch();
}
function clearKeyword() {
  kwInput.value = '';
  keyword.value = '';
  fetchPage(1);
}
function clearHistory() {
  history.clear();
  hist.value = [];
}

// 排序与分类变化：服务端重查（排序必须在服务端做，否则只排到当前页）
watch([sort, activeCat], () => { fetchPage(1); });

onMounted(load);
onBeforeUnmount(() => { if (debounceTimer) clearTimeout(debounceTimer); });
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
      <div class="hero-sub" v-if="shopCount">
        <span>{{ t('home.subShopN', { n: shopCount }) }}</span>
        <i />
        <span>{{ t('home.subPoint') }}</span>
      </div>
    </header>

    <div class="searchbox">
      <AppIcon name="search" :size="19" />
      <input
        v-model="kwInput"
        :placeholder="t('home.searchPh')"
        enterkeyhint="search"
        @input="scheduleSearch"
        @keyup.enter="commitSearch"
      />
      <button v-if="kwInput" class="clear" @click="clearKeyword"><AppIcon name="close" :size="16" /></button>
    </div>

    <!-- 搜索历史：只在还没输入时展示，避免挡住结果 -->
    <div v-if="!kwInput && hist.length" class="hist">
      <div class="hist-head">
        <span>{{ t('home.history') }}</span>
        <button class="hist-clear" @click="clearHistory">{{ t('home.clearHistory') }}</button>
      </div>
      <div class="pills">
        <button v-for="h in hist" :key="h" class="pill pill--hist" @click="useHistory(h)">
          <AppIcon name="clock" :size="12" />{{ h }}
        </button>
      </div>
    </div>

    <div class="highlights">
      <div class="item"><AppIcon name="clock" :size="16" /><b>30′</b><span>{{ t('home.hlTime') }}</span></div>
      <div class="item"><AppIcon name="wallet" :size="16" /><b>COD</b><span>{{ t('home.hlPay') }}</span></div>
      <div class="item"><AppIcon name="shield" :size="16" /><b>{{ t('home.hlSvc') }}</b><span>{{ t('home.hlSvcSub') }}</span></div>
    </div>

    <!-- 品类（服务端 typeid 筛选，跑腿分类已排除） -->
    <div v-if="cats.length > 1" class="pills" style="margin-top: 18px">
      <button class="pill" :class="{ 'is-active': activeCat === '' }" @click="activeCat = ''">{{ t('common.all') }}</button>
      <button
        v-for="c in cats"
        :key="c.id"
        class="pill"
        :class="{ 'is-active': String(activeCat) === String(c.id) }"
        @click="activeCat = String(activeCat) === String(c.id) ? '' : String(c.id)"
      >{{ c.title }}</button>
    </div>

    <!-- 排序 -->
    <div class="section-head">
      <h2 class="h2">{{ t('shop.section') }}</h2>
      <div class="side">{{ t('home.shopCount', { n: shopCount }) }}</div>
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
    <template v-if="firstLoad">
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

    <div v-else-if="shops.length === 0" class="state">
      <div class="emoji">🔍</div>
      <p class="msg">{{ keyword || activeCat ? t('shop.noMatch') : t('shop.empty') }}</p>
      <button v-if="keyword || activeCat" class="btn btn--ghost" @click="clearKeyword(); activeCat = ''">{{ t('common.reset') }}</button>
    </div>

    <!-- 商家 -->
    <template v-else>
      <router-link v-for="s in shops" :key="s.id" :to="{ name: 'shop', params: { id: s.id } }" class="shop">
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

      <!-- 分页：上游默认每页 10 家，不加载更多就永远只有前 20 -->
      <button v-if="hasMore" class="btn btn--soft load-more" :disabled="loadingMore" @click="fetchPage(page + 1)">
        {{ loadingMore ? t('common.loading') : t('home.loadMore') }}
      </button>
    </template>
  </div>
</template>

<style scoped>
.hist { margin: 14px 0 4px; }
.hist-head {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 12.5px; color: var(--ink-3); margin-bottom: 8px;
}
.hist-clear { font-size: 12.5px; color: var(--ink-3); font-weight: 600; }
.pill--hist { display: inline-flex; align-items: center; gap: 4px; }
.load-more { width: 100%; margin: 18px 0 6px; }
</style>
