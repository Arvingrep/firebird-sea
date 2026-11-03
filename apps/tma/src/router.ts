import { createRouter, createWebHashHistory } from 'vue-router';
import { parseStartParam } from './lib/startParam.js';
import { trackInAppNavigation } from './lib/backButton.js';
import { getStartParam } from './telegram';

const router = createRouter({
  history: createWebHashHistory('/tma/'),
  routes: [
    { path: '/', name: 'home', component: () => import('./pages/Home.vue') },
    { path: '/shop/:id(\\d+)', name: 'shop', component: () => import('./pages/Shop.vue'), props: true },
    { path: '/news', name: 'news', component: () => import('./pages/News.vue') },
    { path: '/news/:id(\\d+)', name: 'news-detail', component: () => import('./pages/NewsDetail.vue'), props: true },
    { path: '/checkout', name: 'checkout', component: () => import('./pages/Checkout.vue') },
    { path: '/addresses', name: 'addresses', component: () => import('./pages/Addresses.vue') },
    { path: '/orders', name: 'orders', component: () => import('./pages/Orders.vue') },
    { path: '/orders/:id(\\d+)', name: 'order-detail', component: () => import('./pages/OrderDetail.vue'), props: true },
    { path: '/cart', name: 'cart', component: () => import('./pages/Cart.vue') },
    { path: '/profile', name: 'profile', component: () => import('./pages/Profile.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

// start_param 深链：仅白名单格式生效，其余忽略（T4.1/T4.2）
let startHandled = false;
router.beforeEach((to) => {
  if (startHandled) return true;
  startHandled = true;
  const target = parseStartParam(getStartParam());
  return target && to.name === 'home' ? target : true;
});

// 应用内导航深度计数（供 BackButton 区分「历史后退」与「深链直达需回落父级」）。
// 判定依据：vue-router 在 history.state 写入 position（栈位）与 replaced 标记——
// - 首帧导航（含深链直达、catch-all redirect、start_param 重定向）由 vue-router 以 replace 落栈，
//   此时 lastPosition 还没有基准值，深度一律归 0；
// - pos 变大且非 replaced = push（+1）；pos 变小 = popstate 后退（-1，下限 0）；
// - pos 不变（replace / 首次进入）不计数。不依赖 history.length（Telegram WebView 栈位不可靠）。
let lastPosition: number | null = null;
router.afterEach(() => {
  const st = router.options.history.state as { position?: number; replaced?: boolean } | null;
  const pos = typeof st?.position === 'number' ? st.position : null;
  if (lastPosition === null) trackInAppNavigation('reset');
  else if (pos !== null && pos < lastPosition) trackInAppNavigation('pop');
  else if (pos !== null && pos > lastPosition && st?.replaced !== true) trackInAppNavigation('push');
  if (pos !== null) lastPosition = pos;
});

export default router;
