<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fb, i18n } from '../services';
import { sanitizeHtml } from '../lib/safeHtml.js';
import SafeContent from '../components/SafeContent';

const props = defineProps<{ id: string }>();
const t = (k: string) => i18n.t(k);
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
  } catch (e) {
    failed.value = true;
  } finally {
    loading.value = false;
  }
}
onMounted(load);
</script>

<template>
  <div class="page">
    <van-loading v-if="loading" vertical>{{ t('common.loading') }}</van-loading>
    <div v-else-if="failed">
      <p class="hint">{{ t('news.loadFailed') }}</p>
      <van-button size="small" @click="load">{{ t('common.retry') }}</van-button>
    </div>
    <article v-else>
      <h2>{{ title }}</h2>
      <p class="hint">{{ meta }}</p>
      <SafeContent :nodes="nodes" />
    </article>
  </div>
</template>
