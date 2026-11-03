// Telegram BackButton 与路由栈对齐的纯逻辑（与框架解耦，node --test 可直接跑）：
// - 一级 tab 页（5 个）隐藏 TG 返回键；
// - 二级页在应用内深度 > 0 时走历史后退（router.back）；
// - 深链直达（深度 = 0，历史栈无站内前驱）时 replace 到语义父级，绝不退出 Mini App。
export const TAB_ROUTES = ['home', 'news', 'orders', 'cart', 'profile'];

export const PARENT_OF = {
  shop: { name: 'home' },
  'news-detail': { name: 'news' },
  'order-detail': { name: 'orders' },
  checkout: { name: 'cart' },
  addresses: { name: 'profile' },
};

// —— 应用内导航深度：由 router.afterEach 接线（push +1 / replace 不变 / pop -1，下限 0）。
// 首帧直达（含深链、catch-all redirect）由 router 侧调 reset 归零。
let inAppDepth = 0;

export function getInAppDepth() {
  return inAppDepth;
}

export function trackInAppNavigation(type) {
  if (type === 'push') inAppDepth += 1;
  else if (type === 'pop') inAppDepth = Math.max(0, inAppDepth - 1);
  else if (type === 'reset') inAppDepth = 0;
  // replace：深度不变
}

// 二级页判定（决定 TG 返回键显隐）：未知/兜底路由一律视为一级（隐藏）。
export function isSecondaryRoute(name) {
  return typeof name === 'string' && Object.prototype.hasOwnProperty.call(PARENT_OF, name);
}

// 退一步动作：{ type: 'back' } | { type: 'replace', name } | { type: 'none' }
// 未知路由名按 'none'（宁可隐藏也不误跳）。
export function resolveBackTarget({ routeName, inAppDepth: depth = getInAppDepth() } = {}) {
  if (isSecondaryRoute(routeName)) {
    if (depth > 0) return { type: 'back' };
    return { type: 'replace', name: PARENT_OF[routeName].name };
  }
  return { type: 'none' };
}

// 页内自绘返回按钮统一入口：与 TG BackButton 走同一 resolveBackTarget 逻辑，
// 保证深链进二级页后点自绘按钮也是回落语义父级而非退出 Mini App。
export function safeBack(router) {
  const name = router?.currentRoute?.value?.name;
  const target = resolveBackTarget({ routeName: name });
  if (target.type === 'back') router.back();
  else if (target.type === 'replace') router.replace({ name: target.name });
}
