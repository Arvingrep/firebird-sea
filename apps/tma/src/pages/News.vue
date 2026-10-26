<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { fb, t } from '../services';
import AppIcon from '../components/AppIcon.vue';

interface Cat { id: string | number; typename: string }
interface Article { id: string; title: string; litpic?: string; pubdate?: number | string; description?: string; source?: string }
const router = useRouter();
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
  } catch {
    failed.value = true;
  } finally {
    loading.value = false;
  }
}

// 首次进入时默认分类可能没有内容：探测一次，自动切到第一个有文章的分类，
// 避免一进资讯页就是空白；用户之后手动点空分类时不做干预。
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
const date = (v?: number | string) => (v ? new Date(Number(v) * 1000).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) : '');
</script>

<template>
  <div class="page">
    <div class="nav"><span class="title">{{ t('nav.news') }}</span></div>

    <div v-if="cats.length" class="pills" style="margin-top: 4px">
      <button
        v-for="(c, i) in cats"
        :key="c.id"
        class="pill"
        :class="{ 'is-active': active === i }"
        @click="active = i"
      >{{ c.typename }}</button>
    </div>

    <div v-if="loading" class="state"><van-loading vertical>{{ t('common.loading') }}</van-loading></div>

    <div v-else-if="failed" class="state">
      <div class="emoji">📭</div>
      <p class="msg">{{ t('news.loadFailed') }}</p>
      <button class="btn btn--primary" @click="loadList(page === 1)">{{ t('common.retry') }}</button>
    </div>

    <div v-else-if="list.length === 0" class="state">
      <div class="emoji">📰</div>
      <p class="msg">{{ t('news.empty') }}</p>
    </div>

    <template v-else>
      <div style="margin-top: 14px">
        <article
          v-for="a in list"
          :key="a.id"
          class="news"
          @click="router.push({ name: 'news-detail', params: { id: a.id } })"
        >
          <div class="main">
            <div class="t">{{ a.title }}</div>
            <div class="d"><AppIcon name="clock" :size="12" />{{ date(a.pubdate) }}<template v-if="a.source"> · {{ a.source }}</template></div>
          </div>
          <img v-if="a.litpic" class="pic" :src="a.litpic" alt="" loading="lazy" />
        </article>
      </div>

      <button v-if="!finished" class="btn btn--ghost" style="width: 100%; margin-top: 16px" @click="loadList(false)">
        {{ t('news.more') }}
      </button>
    </template>
  </div>
</template>
