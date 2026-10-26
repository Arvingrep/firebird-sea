<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fb, t } from '../services';
import { sanitizeHtml } from '../lib/safeHtml.js';
import SafeContent from '../components/SafeContent';
import AppIcon from '../components/AppIcon.vue';

const props = defineProps<{ id: string }>();
const router = useRouter();
const title = ref('');
const meta = ref('');
const nodes = ref<any[]>([]);
const loading = ref(true);
const failed = ref(false);

async function load() {
  loading.value = true;
  failed.value = false;
  try {
    const d = await fb.get('article', 'detail', { id: props.id }, { anonymous: true });
    title.value = String(d?.title || '');
    const date = d?.pubdate ? new Date(Number(d.pubdate) * 1000).toLocaleDateString() : '';
    meta.value = [d?.source, date].filter(Boolean).join(' · ');
    const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');
    nodes.value = sanitizeHtml(String(d?.body || ''), parse);
  } catch {
    failed.value = true;
  } finally {
    loading.value = false;
  }
}
onMounted(load);
</script>

<template>
  <div class="page">
    <div class="nav">
      <button class="icon-btn" @click="router.back()"><AppIcon name="chevron-left" :size="19" /></button>
      <span class="title">{{ t('nav.news') }}</span>
    </div>

    <div v-if="loading" class="state"><van-loading vertical>{{ t('common.loading') }}</van-loading></div>

    <div v-else-if="failed" class="state">
      <div class="emoji">📭</div>
      <p class="msg">{{ t('news.loadFailed') }}</p>
      <button class="btn btn--primary" @click="load">{{ t('common.retry') }}</button>
    </div>

    <article v-else class="article">
      <h2>{{ title }}</h2>
      <p class="meta">{{ meta }}</p>
      <SafeContent :nodes="nodes" />
    </article>
  </div>
</template>
