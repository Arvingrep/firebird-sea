<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { i18n, t, toggleLang } from '../services';
import { getTgUser } from '../telegram';

const router = useRouter();

const tgUser = getTgUser();
const name = computed(() => tgUser ? [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') : '');
const initial = computed(() => (name.value || 'F').trim().charAt(0).toUpperCase());
const sub = computed(() => tgUser?.username ? `@${tgUser.username}` : tgUser ? `ID ${tgUser.id}` : '');

const menu = [
  { key: 'profile.orders', to: '/orders' },
  { key: 'profile.addresses', to: '/addresses' },
];

function about() { showToast({ message: t('profile.aboutBody'), position: 'bottom' }); }
</script>

<template>
  <div class="page">
    <!-- 头部：Telegram 账号信息 -->
    <div class="profile-hero">
      <img v-if="tgUser?.photo_url" class="avatar" :src="tgUser.photo_url" alt="" />
      <div v-else class="avatar">{{ initial }}</div>
      <div class="who">
        <div class="name">{{ name || t('auth.reopen') }}</div>
        <div v-if="sub" class="sub">{{ sub }}</div>
      </div>
    </div>

    <!-- 常用功能 -->
    <div class="fbs-card" style="margin-top: 14px">
      <van-cell
        v-for="m in menu"
        :key="m.key"
        :title="t(m.key)"
        is-link
        :border="true"
        @click="router.push(m.to)"
      />
      <van-cell :title="t('profile.lang')" is-link :value="i18n.lang === 'zh' ? '中文' : 'English'" @click="toggleLang" />
      <van-cell :title="t('profile.about')" is-link :border="false" @click="about" />
    </div>

    <p class="hint" style="text-align: center; margin-top: 18px">{{ t('profile.aboutBody') }}</p>
  </div>
</template>
