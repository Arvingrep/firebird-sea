import test from 'node:test';
import assert from 'node:assert';
import {
  TAB_ROUTES,
  PARENT_OF,
  resolveBackTarget,
  safeBack,
  isSecondaryRoute,
  trackInAppNavigation,
  getInAppDepth,
} from '../src/lib/backButton.js';

const TABS = ['home', 'news', 'orders', 'cart', 'profile'];
const SECONDARY = ['shop', 'news-detail', 'order-detail', 'checkout', 'addresses'];

test('层级表：5 个一级 tab 与任务书一致', () => {
  assert.deepStrictEqual([...TAB_ROUTES].sort(), [...TABS].sort());
});

test('父级映射：二级页语义父级与拍板一致', () => {
  assert.deepStrictEqual(PARENT_OF, {
    shop: { name: 'home' },
    'news-detail': { name: 'news' },
    'order-detail': { name: 'orders' },
    checkout: { name: 'cart' },
    addresses: { name: 'profile' },
  });
  assert.deepStrictEqual(Object.keys(PARENT_OF).sort(), [...SECONDARY].sort());
});

test('isSecondaryRoute：一级页/未知路由/非字符串均为 false', () => {
  for (const name of [...TABS, 'unknown-page', null, undefined, Symbol('x'), 42]) {
    assert.strictEqual(isSecondaryRoute(name), false, String(name));
  }
  for (const name of SECONDARY) {
    assert.strictEqual(isSecondaryRoute(name), true, name);
  }
});

test('resolveBackTarget：一级页一律 none（含深度 > 0）', () => {
  for (const name of TABS) {
    assert.deepStrictEqual(resolveBackTarget({ routeName: name, inAppDepth: 0 }), { type: 'none' }, name);
    assert.deepStrictEqual(resolveBackTarget({ routeName: name, inAppDepth: 3 }), { type: 'none' }, name);
  }
});

test('resolveBackTarget：未知路由名一律 none（宁可隐藏也不误跳）', () => {
  for (const bad of ['unknown', '', null, undefined, 42, {}]) {
    assert.deepStrictEqual(resolveBackTarget({ routeName: bad, inAppDepth: 2 }), { type: 'none' }, String(bad));
  }
});

test('resolveBackTarget：应用内深度 > 0 时走历史后退', () => {
  for (const name of SECONDARY) {
    assert.deepStrictEqual(resolveBackTarget({ routeName: name, inAppDepth: 1 }), { type: 'back' }, name);
  }
});

test('resolveBackTarget：深度 0（深链直达）回落语义父级', () => {
  assert.deepStrictEqual(resolveBackTarget({ routeName: 'shop', inAppDepth: 0 }), { type: 'replace', name: 'home' });
  assert.deepStrictEqual(resolveBackTarget({ routeName: 'news-detail', inAppDepth: 0 }), { type: 'replace', name: 'news' });
  assert.deepStrictEqual(resolveBackTarget({ routeName: 'order-detail', inAppDepth: 0 }), { type: 'replace', name: 'orders' });
  assert.deepStrictEqual(resolveBackTarget({ routeName: 'checkout', inAppDepth: 0 }), { type: 'replace', name: 'cart' });
  assert.deepStrictEqual(resolveBackTarget({ routeName: 'addresses', inAppDepth: 0 }), { type: 'replace', name: 'profile' });
});

test('trackInAppNavigation：push +1 / pop -1 / replace 不变 / pop 下限 0 / reset 归零', () => {
  trackInAppNavigation('reset');
  trackInAppNavigation('push');
  trackInAppNavigation('push');
  assert.strictEqual(getInAppDepth(), 2);
  trackInAppNavigation('replace');
  assert.strictEqual(getInAppDepth(), 2);
  trackInAppNavigation('pop');
  assert.strictEqual(getInAppDepth(), 1);
  trackInAppNavigation('pop');
  trackInAppNavigation('pop');
  assert.strictEqual(getInAppDepth(), 0, 'pop 不能低于 0');
  trackInAppNavigation('push');
  trackInAppNavigation('reset');
  assert.strictEqual(getInAppDepth(), 0);
});

function stubRouter(name) {
  const calls = [];
  return {
    calls,
    currentRoute: { value: { name } },
    back: () => calls.push('back'),
    replace: (to) => calls.push(`replace:${JSON.stringify(to)}`),
  };
}

test('safeBack：二级页深度 > 0 时 router.back()，只退一级', () => {
  trackInAppNavigation('reset');
  trackInAppNavigation('push');
  const router = stubRouter('order-detail');
  safeBack(router);
  assert.deepStrictEqual(router.calls, ['back']);
});

test('safeBack：深链直达（深度 0）replace 到语义父级而非 back', () => {
  trackInAppNavigation('reset');
  const router = stubRouter('shop');
  safeBack(router);
  assert.deepStrictEqual(router.calls, ['replace:{"name":"home"}']);
});

test('safeBack：一级页/未知路由不产生任何导航', () => {
  trackInAppNavigation('reset');
  for (const name of ['home', 'unknown']) {
    const router = stubRouter(name);
    safeBack(router);
    assert.deepStrictEqual(router.calls, [], name);
  }
});
