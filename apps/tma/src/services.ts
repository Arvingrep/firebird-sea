import { ref } from 'vue';
import { createAuthClient } from './auth.js';
import { createFbClient } from './lib/fbClient.js';
import { createI18n } from './lib/i18n.js';
import { getInitData } from './telegram';

// 组合根：令牌只在 authClient 闭包内（内存），fbClient 在其上封装火鸟 API。
export const authClient = createAuthClient({ fetch: (...a: Parameters<typeof fetch>) => fetch(...a), getInitData });
export const fb = createFbClient({
  authClient,
  anonymousFetch: (url: string) => fetch(url, { headers: { Accept: 'application/json' } }),
});
export const i18n = createI18n('zh');

// 语言是全局状态：用 ref 包一层，切语言时整个界面立刻重绘（不必刷新页面）。
export const langRef = ref(i18n.lang);
export function setLang(l: string) {
  i18n.setLang(l);
  langRef.value = i18n.lang;
}
export function toggleLang() {
  setLang(i18n.lang === 'zh' ? 'en' : 'zh');
}
export function t(key: string, vars?: Record<string, string | number>) {
  void langRef.value;
  return i18n.t(key, vars);
}
