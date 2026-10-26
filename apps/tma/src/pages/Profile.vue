<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { fb, i18n, t, toggleLang } from '../services';
import { useCartStore } from '../stores/cart';
import { getTgUser } from '../telegram';
import AppIcon from '../components/AppIcon.vue';

const router = useRouter();
const cart = useCartStore();
const tgUser = getTgUser();
const name = computed(() => (tgUser ? [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') : ''));
const initial = computed(() => (name.value || 'F').trim().charAt(0).toUpperCase());
const sub = computed(() => (tgUser?.username ? `@${tgUser.username}` : tgUser ? `ID ${tgUser.id}` : ''));

const orderCount = ref<number | null>(null);
const addrCount = ref<number | null>(null);

onMounted(async () => {
  try {
    const info = await fb.get('waimai', 'order', { page: 1, pageSize: 1 });
    const n = Number(info?.pageInfo?.totalCount);
    orderCount.value = Number.isFinite(n) ? n : 0;
  } catch { orderCount.value = null; }
  try {
    const info = await fb.get('waimai', 'getMemberAddress', {});
    addrCount.value = Array.isArray(info?.list) ? info.list.length : 0;
  } catch { addrCount.value = null; }
});

function about() { showToast({ message: t('profile.aboutBody'), position: 'bottom' }); }
</script>

<template>
  <div class="page">
    <header class="me-hero">
      <div class="who">
        <div class="avatar">
          <img v-if="tgUser?.photo_url" :src="tgUser.photo_url" alt="" />
          <template v-else>{{ initial }}</template>
        </div>
        <div>
          <div class="nm">{{ name || t('auth.reopen') }}</div>
          <div v-if="sub" class="sub">{{ sub }}</div>
        </div>
      </div>
    </header>

    <div class="me-stats">
      <button class="s" @click="router.push('/orders')">
        <b>{{ orderCount ?? '—' }}</b><span>{{ t('profile.orders') }}</span>
      </button>
      <button class="s" @click="router.push('/addresses')">
        <b>{{ addrCount ?? '—' }}</b><span>{{ t('profile.addresses') }}</span>
      </button>
      <button class="s" @click="router.push('/cart')">
        <b>{{ cart.count }}</b><span>{{ t('nav.cart') }}</span>
      </button>
    </div>

    <div class="section-head"><h2 class="h2">{{ t('profile.services') }}</h2></div>
    <div class="list">
      <button class="row" style="width: 100%; text-align: left" @click="router.push('/orders')">
        <span class="lead"><AppIcon name="receipt" :size="17" /></span>
        <span class="grow">{{ t('profile.orders') }}</span>
        <span class="val" v-if="orderCount !== null">{{ orderCount }}</span>
        <AppIcon class="chev" name="chevron-right" :size="16" />
      </button>
      <button class="row" style="width: 100%; text-align: left" @click="router.push('/addresses')">
        <span class="lead"><AppIcon name="pin" :size="17" /></span>
        <span class="grow">{{ t('profile.addresses') }}</span>
        <AppIcon class="chev" name="chevron-right" :size="16" />
      </button>
      <button class="row" style="width: 100%; text-align: left" @click="toggleLang">
        <span class="lead"><AppIcon name="globe" :size="17" /></span>
        <span class="grow">{{ t('profile.lang') }}</span>
        <span class="val">{{ i18n.lang === 'zh' ? '中文' : 'English' }}</span>
        <AppIcon class="chev" name="chevron-right" :size="16" />
      </button>
      <button class="row" style="width: 100%; text-align: left" @click="about">
        <span class="lead"><AppIcon name="info" :size="17" /></span>
        <span class="grow">{{ t('profile.about') }}</span>
        <AppIcon class="chev" name="chevron-right" :size="16" />
      </button>
    </div>

    <p class="hint" style="text-align: center; margin: 22px 0 0">{{ t('profile.aboutBody') }}</p>
  </div>
</template>
