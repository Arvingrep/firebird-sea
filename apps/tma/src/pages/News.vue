<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { fb, i18n } from '../services';

interface Cat { id: string | number; typename: string }
interface Article { id: string; title: string; litpic?: string; pubdate?: number | string; description?: string }
const router = useRouter();
const t = (k: string) => i18n.t(k);
const cats = ref<Cat[]>([]);
const active = ref(0);
const list = ref<Article[]>([]);
const page = ref(1);
const finished = ref(false);
const loading = ref(true);
const failed = ref(false);
const PAGE_SIZE = 10;

async function loadList(reset: boolean) {
  if (reset) { page.value = 1; finished.value = false; list.value = []; }
  loading.value = true;
  failed.value = false;
  try {
    const typeid = cats.value[active.value]?.id;
    const info = await fb.get('article', 'alist', { page: page.value, pageSize: PAGE_SIZE, typeid }, { anonymous: true });
    const rows: Article[] = Array.isArray(info?.list) ? info.list : [];
    list.value = reset ? rows : list.value.concat(rows);
    const total = Number(info?.pageInfo?.totalPage || 1);
    finished.value = page.value >= total || rows.length === 0;
    page.value += 1;
  } catch (e) {
    failed.value = true;
  } finally {
    loading.value = false;
  }
}

// 首次进入时默认分类可能没有内容（如本地新闻为空）：探测一次，自动切到第一个有文章的分类，
// 避免用户一进资讯页看到空白；用户之后手动切回空分类时不做任何干预。
async function pickFirstNonEmpty() {
  for (let i = 0; i < cats.value.length; i += 1) {
    if (i === active.value) continue;
    try {
      const info = await fb.get('article', 'alist', { page: 1, pageSize: 1, typeid: cats.value[i].id }, { anonymous: true });
      if (Array.isArray(info?.list) && info.list.length > 0) { active.value = i; return; }
    } catch { /* 探测失败就跳过这个分类 */ }
  }
}

onMounted(async () => {
  try {
    const info = await fb.get('article', 'type', {}, { anonymous: true });
    cats.value = Array.isArray(info) ? info : [];
  } catch { /* 分类失败时仍展示全部资讯 */ }
  await loadList(true);
  if (!failed.value && list.value.length === 0) await pickFirstNonEmpty();
});
watch(active, () => loadList(true));
const date = (v?: number | string) => (v ? new Date(Number(v) * 1000).toLocaleDateString('zh-CN') : '');
</script>

<template>
  <div class="page">
    <van-tabs v-if="cats.length" v-model:active="active" shrink>
      <van-tab v-for="c in cats" :key="c.id" :title="c.typename" />
    </van-tabs>

    <van-empty v-if="!loading && !failed && list.length === 0" :description="t('news.empty')" />

    <div v-else-if="!loading && !failed" class="fbs-card" style="margin-top: 12px">
      <div
        v-for="a in list"
        :key="a.id"
        class="news-item"
        @click="router.push({ name: 'news-detail', params: { id: a.id } })"
      >
        <div class="title">{{ a.title }}</div>
        <div class="date">{{ date(a.pubdate) }}</div>
      </div>
    </div>

    <van-loading v-if="loading" vertical>{{ t('common.loading') }}</van-loading>

    <div v-if="failed" class="fbs-error">
      <p class="msg">{{ t('news.loadFailed') }}</p>
      <van-button size="small" round @click="loadList(page === 1)">{{ t('common.retry') }}</van-button>
    </div>

    <van-button v-else-if="!loading && !finished" block plain round style="margin-top: 14px" @click="loadList(false)">
      {{ t('news.more') }}
    </van-button>
  </div>
</template>
