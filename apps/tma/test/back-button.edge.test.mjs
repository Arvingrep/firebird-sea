// 对抗性边界用例（Tess，独立于 back-button.test.mjs）：
// 目标是弄坏实现——深链直达、深度计数极限、原型链污染名、safeBack 健壮性与 replace 语义。
// 注意：以下内容**无法**在本文件单测，见 test-report.md「未覆盖项」：
// - router.ts afterEach 的 push/pop/replace/forward 分类（依赖真实 history.state，node 无 DOM）
// - App.vue 的 300ms 连点节流（组件层逻辑）
// - telegram.ts 特性检测 / 幂等（依赖 window.Telegram.WebApp）
import test from 'node:test';
import assert from 'node:assert';
import {
  PARENT_OF,
  resolveBackTarget,
  safeBack,
  isSecondaryRoute,
  trackInAppNavigation,
  getInAppDepth,
} from '../src/lib/backButton.js';

const SECONDARY = ['shop', 'news-detail', 'order-detail', 'checkout', 'addresses'];
const TABS = ['home', 'news', 'orders', 'cart', 'profile'];

// 比 back-button.test.mjs 的 stub 多记录 push：safeBack 的 replace 分支绝不允许 push
// （push 会在历史里留下二级页，用户再按返回又回二级页）。
function stubRouter(name) {
  const calls = [];
  return {
    calls,
    currentRoute: { value: name === undefined ? {} : { name } },
    back: () => calls.push('back'),
    replace: (to) => calls.push(`replace:${JSON.stringify(to)}`),
    push: (to) => calls.push(`push:${JSON.stringify(to)}`),
    go: () => calls.push('go'),
  };
}

function depthOf(fn) {
  trackInAppNavigation('reset');
  fn();
  const d = getInAppDepth();
  trackInAppNavigation('reset');
  return d;
}

// —— 深链直达（深度 0）：五条二级页全测，必须 replace 到语义父级，绝不 back / push ——

test('深链直达 shop（深度0）：replace 到 home，不 back 不 push', () => {
  trackInAppNavigation('reset');
  const router = stubRouter('shop');
  safeBack(router);
  assert.deepStrictEqual(router.calls, ['replace:{"name":"home"}']);
});

test('深链直达 news-detail（深度0）：replace 到 news', () => {
  trackInAppNavigation('reset');
  const router = stubRouter('news-detail');
  safeBack(router);
  assert.deepStrictEqual(router.calls, ['replace:{"name":"news"}']);
});

test('深链直达 order-detail（深度0）：replace 到 orders', () => {
  trackInAppNavigation('reset');
  const router = stubRouter('order-detail');
  safeBack(router);
  assert.deepStrictEqual(router.calls, ['replace:{"name":"orders"}']);
});

test('深链直达 checkout（深度0）：replace 到 cart', () => {
  trackInAppNavigation('reset');
  const router = stubRouter('checkout');
  safeBack(router);
  assert.deepStrictEqual(router.calls, ['replace:{"name":"cart"}']);
});

test('深链直达 addresses（深度0）：replace 到 profile', () => {
  trackInAppNavigation('reset');
  const router = stubRouter('addresses');
  safeBack(router);
  assert.deepStrictEqual(router.calls, ['replace:{"name":"profile"}']);
});

test('深链回落用 replace 语义：历史里不留二级页（深度0 连按两次仍是 replace，不会第二次变 back）', () => {
  trackInAppNavigation('reset');
  const router = stubRouter('shop');
  safeBack(router);
  // replace 落地后 router 侧对 replace 不计数（深度仍 0），模拟用户在父级再触发一次返回前的状态
  trackInAppNavigation('replace');
  safeBack(router);
  assert.deepStrictEqual(router.calls, [
    'replace:{"name":"home"}',
    'replace:{"name":"home"}',
  ]);
  assert.ok(getInAppDepth() === 0, 'replace 不改变深度');
});

// —— 一级 tab：任何深度都必须 none / 隐藏，不许 replace 或 back ——

test('一级 tab（5 个）在深度 0 与高深度下 resolveBackTarget 一律 none', () => {
  for (const name of TABS) {
    assert.deepStrictEqual(resolveBackTarget({ routeName: name, inAppDepth: 0 }), { type: 'none' }, `${name}@0`);
    assert.deepStrictEqual(resolveBackTarget({ routeName: name, inAppDepth: 99 }), { type: 'none' }, `${name}@99`);
  }
});

test('一级 tab 上 safeBack 产生零导航（不 back、不 replace、不 push）', () => {
  trackInAppNavigation('reset');
  trackInAppNavigation('push');
  for (const name of TABS) {
    const router = stubRouter(name);
    safeBack(router);
    assert.deepStrictEqual(router.calls, [], name);
  }
});

// —— 深度计数：push +1 / replace 不变 / pop -1 / 下限 0 / reset 归 0 ——

test('深度计数：连续 push 10 次深度为 10', () => {
  assert.strictEqual(
    depthOf(() => {
      for (let i = 0; i < 10; i++) trackInAppNavigation('push');
    }),
    10,
  );
});

test('深度计数：push 中穿插 replace，深度不变', () => {
  assert.strictEqual(
    depthOf(() => {
      trackInAppNavigation('push');
      trackInAppNavigation('replace');
      trackInAppNavigation('push');
      trackInAppNavigation('replace');
    }),
    2,
  );
});

test('深度计数：pop 逐次 -1', () => {
  assert.strictEqual(
    depthOf(() => {
      trackInAppNavigation('push');
      trackInAppNavigation('push');
      trackInAppNavigation('push');
      trackInAppNavigation('pop');
      trackInAppNavigation('pop');
    }),
    1,
  );
});

test('深度计数：狂 pop 100 次下限为 0，绝不变负', () => {
  assert.strictEqual(
    depthOf(() => {
      for (let i = 0; i < 100; i++) trackInAppNavigation('pop');
    }),
    0,
  );
});

test('深度计数：深度 7 时 pop 8 次停在 0 且之后 push 正常 +1', () => {
  assert.strictEqual(
    depthOf(() => {
      for (let i = 0; i < 7; i++) trackInAppNavigation('push');
      for (let i = 0; i < 8; i++) trackInAppNavigation('pop');
      assert.strictEqual(getInAppDepth(), 0, 'pop 超额后应为 0');
      trackInAppNavigation('push');
    }),
    1,
  );
});

test('深度计数：reset 从任意深度（含 pop 后的 0）归 0', () => {
  assert.strictEqual(
    depthOf(() => {
      for (let i = 0; i < 5; i++) trackInAppNavigation('push');
      trackInAppNavigation('pop');
      trackInAppNavigation('reset');
      assert.strictEqual(getInAppDepth(), 0);
      trackInAppNavigation('push');
    }),
    1,
  );
});

test('深度计数：push/pop 完全对称（push3 pop3 = 0）——forward 若按 push 分类则与 back 镜像', () => {
  assert.strictEqual(
    depthOf(() => {
      trackInAppNavigation('push');
      trackInAppNavigation('push');
      trackInAppNavigation('push');
      trackInAppNavigation('pop');
      trackInAppNavigation('pop');
      trackInAppNavigation('pop');
    }),
    0,
  );
});

// —— 未知路由 / 兜底路由：按 none，绝不误跳 ——

test('未知路由名（含空串/数字/对象/null）在深度 0 与 3 下均 none', () => {
  for (const bad of ['unknown', '', 'SHOP', ' shop', null, undefined, 42, 0, {}, [], () => {}]) {
    assert.deepStrictEqual(resolveBackTarget({ routeName: bad, inAppDepth: 0 }), { type: 'none' }, String(bad) + '@0');
    assert.deepStrictEqual(resolveBackTarget({ routeName: bad, inAppDepth: 3 }), { type: 'none' }, String(bad) + '@3');
  }
});

test('原型链属性名不误判为二级页：constructor/__proto__/toString/hasOwnProperty 一律 none', () => {
  for (const evil of ['constructor', '__proto__', 'toString', 'hasOwnProperty', 'valueOf']) {
    assert.strictEqual(isSecondaryRoute(evil), false, evil);
    assert.deepStrictEqual(resolveBackTarget({ routeName: evil, inAppDepth: 3 }), { type: 'none' }, evil);
    const router = stubRouter(evil);
    safeBack(router);
    assert.deepStrictEqual(router.calls, [], evil);
  }
});

test('safeBack 对未知路由零导航；currentRoute 无 name（解析中）按未知处理不抛错', () => {
  trackInAppNavigation('reset');
  const router = stubRouter('no-such-route');
  safeBack(router);
  assert.deepStrictEqual(router.calls, []);
  const noName = stubRouter(undefined); // currentRoute.value = {}
  assert.doesNotThrow(() => safeBack(noName));
  assert.deepStrictEqual(noName.calls, []);
});

// —— safeBack 健壮性 ——

test('safeBack 传入 undefined/null/空对象 router 不抛异常', () => {
  trackInAppNavigation('reset');
  trackInAppNavigation('push');
  assert.doesNotThrow(() => safeBack(undefined));
  assert.doesNotThrow(() => safeBack(null));
  assert.doesNotThrow(() => safeBack({}));
});

test('safeBack 深度>0 时恰好一次 back（单次调用只退一级，不退两级）', () => {
  trackInAppNavigation('reset');
  trackInAppNavigation('push');
  trackInAppNavigation('push');
  const router = stubRouter('checkout');
  safeBack(router);
  assert.deepStrictEqual(router.calls, ['back']);
});

test('safeBack 的 replace 分支绝不调用 push（否则历史留下二级页）', () => {
  trackInAppNavigation('reset');
  const router = stubRouter('addresses');
  safeBack(router);
  assert.ok(!router.calls.some((c) => c.startsWith('push:')), router.calls.join(','));
  assert.ok(!router.calls.includes('back'), '深链回落绝不允许 back');
  assert.ok(router.calls.some((c) => c.startsWith('replace:')), router.calls.join(','));
});

test('二级页深度>0 一律 back，无视语义父级映射（addresses 双入口天然回真实来源）', () => {
  for (const name of SECONDARY) {
    assert.deepStrictEqual(resolveBackTarget({ routeName: name, inAppDepth: 1 }), { type: 'back' }, name);
    assert.deepStrictEqual(resolveBackTarget({ routeName: name, inAppDepth: 4 }), { type: 'back' }, name);
  }
});

test('父级映射目标全部是一级 tab（不存在 replace 到另一个二级页的映射）', () => {
  for (const [child, parent] of Object.entries(PARENT_OF)) {
    assert.ok(TABS.includes(parent.name), `${child} 的父级 ${parent.name} 必须是 tab 根`);
    assert.ok(SECONDARY.includes(child), `${child} 必须是已知二级页`);
  }
});
