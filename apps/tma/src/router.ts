import { createRouter, createWebHashHistory } from 'vue-router';
import { parseStartParam } from './lib/startParam.js';
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
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

// start_param 深链：仅白名单格式生效，其余忽略（T4.1/T4.2）
let startHandled = false;
router.beforeEach((to) => {
  if (startHandled) return true;
  startHandled = true;
  const target = parseStartParam(getStartParam());
  return target && to.name === 'home' ? { name: target.name, params: target.params } : true;
});

export default router;
