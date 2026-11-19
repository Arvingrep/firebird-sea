'use strict';

/**
 * tg-shim 的决策逻辑单测。
 *
 * 为什么放在 services/api/test/：
 *   - 这是仓库里唯一接进 `npm test` 的 node:test 套件（CI/回归都跑它），
 *     独立脚本没人跑就会烂掉；
 *   - tg-shim.js 在 Node 下只导出纯函数、不执行 boot，因此不需要 jsdom，
 *     与现有测试的运行方式完全一致。
 *
 * DOM 操作（注入 <style>、BackButton、外链拦截）没法在这里测，
 * 但「哪一页要隐藏哪条顶栏、要补哪块留白」这个决策可以，
 * 这也是本文件覆盖的全部范围。
 */

const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

const shim = require(path.join(__dirname, '../../../webroot/static/js/tg-shim.js'));

const { buildPlan, renderCss, detectService, resolvePage, normalizePage, rootDomain } = shim;

// ---------------------------------------------------------------------------
// 模块识别
// ---------------------------------------------------------------------------

test('detectService: 骑手靠 ?do=courier 识别（service 仍是 waimai）', () => {
  assert.equal(
    detectService({ search: '?service=waimai&do=courier&template=index', pathname: '/' }),
    'courier'
  );
  // 同一个 service，不带 do 就是外卖
  assert.equal(detectService({ search: '?service=waimai&template=list', pathname: '/' }), 'waimai');
});

test('detectService: query 显式声明优先', () => {
  assert.equal(detectService({ search: '?service=travel&template=ticket', pathname: '/' }), 'travel');
  assert.equal(detectService({ search: '?service=article', pathname: '/' }), 'article');
});

test('detectService: 没有 query 时靠 modelType / 皮肤资源路径 / pathname 兜底', () => {
  // modelType 只有 14/27 个外卖页有（skin2/index.html:18）
  assert.equal(detectService({ search: '', pathname: '/', modelType: 'waimai' }), 'waimai');
  // 皮肤路径最可靠：模板用 {#$templets_skin#} 拼 css，一定落在 /templates/<module>/
  assert.equal(
    detectService({
      search: '',
      pathname: '/',
      assetRefs: ['/static/css/core/touchBase.css', '/templates/courier/css/index.css?v=1']
    }),
    'courier'
  );
  assert.equal(detectService({ search: '', pathname: '/travel/ticket.html' }), 'travel');
  // 认不出来就返回空串，调用方据此放弃改 DOM
  assert.equal(detectService({ search: '', pathname: '/user/' }), '');
});

// ---------------------------------------------------------------------------
// 页面名归一化
// ---------------------------------------------------------------------------

test('normalizePage: 去掉 .html 与分页/typeid 后缀', () => {
  assert.equal(normalizePage('list'), 'list');
  assert.equal(normalizePage('list.html'), 'list');
  assert.equal(normalizePage('list-2.html'), 'list');
  assert.equal(normalizePage('detail-31.html'), 'detail');
  // 名字本身带连字符的不能被切坏
  assert.equal(normalizePage('order-wamai.html'), 'order-wamai');
  assert.equal(normalizePage('paotui-buy.html'), 'paotui-buy');
  assert.equal(normalizePage('Agency-Detail.html'), 'agency-detail');
});

test('resolvePage: ?template= 优先，其次 pathname 最后一段', () => {
  assert.equal(resolvePage({ pathname: '/', search: '?service=waimai&do=courier&template=history' }), 'history');
  assert.equal(resolvePage({ pathname: '/', search: '' }), 'index');
  assert.equal(resolvePage({ pathname: '/list.html', search: '' }), 'list');
  assert.equal(resolvePage({ pathname: '/waimai/list.html', search: '' }), 'list');
  assert.equal(resolvePage({ pathname: '/list-2.html', search: '' }), 'list');
  // 只到模块的 URL，index.php 会当 index 处理
  assert.equal(resolvePage({ pathname: '/waimai/', search: '' }), 'index');
  assert.equal(resolvePage({ pathname: '/travel', search: '' }), 'index');
  // 前端控制器形式
  assert.equal(resolvePage({ pathname: '/index.php', search: '?service=waimai' }), 'index');
});

// ---------------------------------------------------------------------------
// 外卖
// ---------------------------------------------------------------------------

test('外卖 list：隐藏 body 直接子元素顶栏，并把筛选条与留白一起收掉', () => {
  const plan = buildPlan({ service: 'waimai', pathname: '/list.html', search: '' });

  assert.deepEqual(plan.navSelectors, ['body > .header']);
  assert.deepEqual(plan.clearPadding, [{ selector: 'body', prop: 'padding-top', value: '0.9rem' }]);
  assert.deepEqual(plan.fixedBarTop, [
    { selector: '.fenlei_box', value: '0' },
    { selector: '.fixedtop', value: '0.9rem' }
  ]);
  assert.equal(plan.disableVerticalSwipes, true);
  assert.equal(plan.isHome, false);

  // 1.8rem(body) - .9rem(顶栏) = .9rem；.fixedtop 1.8rem - .9rem = .9rem
  const css = renderCss(plan);
  assert.doesNotMatch(css, /(^|[;}])\s*body\{display:none/); // body 本身不能被打掉
});

test('外卖 slist 与 list 同规则', () => {
  const a = buildPlan({ service: 'waimai', pathname: '/list.html', search: '' });
  const b = buildPlan({ service: 'waimai', pathname: '/slist.html', search: '' });
  assert.deepEqual(a.navSelectors, b.navSelectors);
  assert.deepEqual(a.clearPadding, b.clearPadding);
  assert.deepEqual(a.fixedBarTop, b.fixedBarTop);
});

test('外卖 index：只藏 .header，绝不碰 .headBox（选地址/分类菜单两个业务入口）', () => {
  const plan = buildPlan({ service: 'waimai', pathname: '/index.html', search: '' });

  assert.deepEqual(plan.navSelectors, ['body > .header']);
  assert.deepEqual(plan.clearPadding, []); // body padding-top:.9rem 是给 .headBox 的，不能动
  assert.deepEqual(plan.fixedBarTop, []);
  assert.equal(plan.isHome, true);

  const css = renderCss(plan);
  assert.doesNotMatch(css, /headBox/);
});

test('外卖普通页（cart）：只有顶栏一条规则，不产生任何留白补丁', () => {
  const plan = buildPlan({ service: 'waimai', pathname: '/cart.html', search: '' });
  assert.deepEqual(plan.navSelectors, ['body > .header']);
  assert.deepEqual(plan.clearPadding, []);
  assert.deepEqual(plan.fixedBarTop, []);
  assert.equal(plan.disableVerticalSwipes, false);
});

test('外卖两个顶栏不是 body 直接子元素的页面（报告 §1.2.4）', () => {
  const search = buildPlan({ service: 'waimai', pathname: '/search_wm.html', search: '' });
  assert.deepEqual(search.navSelectors, ['.pageContainer > .searchPage > .header']);

  const addr = buildPlan({ service: 'waimai', pathname: '/addressPaotui.html', search: '' });
  assert.deepEqual(addr.navSelectors, ['.choseWrap > .header']);
});

test('外卖支付页：顶栏在 .container 里（报告 §1.5）', () => {
  const plan = buildPlan({ service: 'waimai', pathname: '/pay.html', search: '' });
  assert.deepEqual(plan.navSelectors, ['.container > .header']);
  assert.deepEqual(plan.clearPadding, []); // relative + 1rem，流内，无留白
});

test('外卖未覆盖页面进 pendingConfirm，且不臆造选择器', () => {
  const plan = buildPlan({ service: 'waimai', pathname: '/search.html', search: '' });
  assert.deepEqual(plan.navSelectors, []);
  assert.equal(plan.pendingConfirm.length, 1);
  assert.match(plan.pendingConfirm[0], /\.search > i\.goBack/);
});

// ---------------------------------------------------------------------------
// 旅游
// ---------------------------------------------------------------------------

test('旅游 ticket：contentBox 留白清零 + screenBox 回到顶部', () => {
  const plan = buildPlan({ service: 'travel', pathname: '/ticket.html', search: '' });

  assert.deepEqual(plan.navSelectors, ['body > .header']);
  assert.deepEqual(plan.clearPadding, [{ selector: '.contentBox', prop: 'padding-top', value: '0' }]);
  assert.deepEqual(plan.fixedBarTop, [{ selector: '.screenBox', value: '0' }]);
  assert.equal(plan.disableVerticalSwipes, true);
});

test('旅游 store：DOM 里没有 .screenBox，就不写这条规则', () => {
  const plan = buildPlan({ service: 'travel', pathname: '/store.html', search: '' });
  assert.deepEqual(plan.clearPadding, [{ selector: '.contentBox', prop: 'padding-top', value: '0' }]);
  assert.deepEqual(plan.fixedBarTop, []);
});

test('旅游 index：相对定位顶栏，隐藏后内容自然上移', () => {
  const plan = buildPlan({ service: 'travel', pathname: '/index.html', search: '' });
  assert.deepEqual(plan.navSelectors, ['body > .header']);
  assert.deepEqual(plan.clearPadding, []);
  assert.equal(plan.isHome, true);
});

test('旅游 video-detail：8 个 fixed 页之一，但无 .contentBox / 无 body padding，不需要任何补丁', () => {
  // video-detail.css:68 也有 .header{position:fixed}（报告 §1.3.3 没记错，此前撤回的
  // 是我方「css 里没有这条规则」的错误更正）；fixed 顶栏不占流，隐藏后内容自然上移。
  const plan = buildPlan({ service: 'travel', pathname: '/video-detail.html', search: '' });
  assert.deepEqual(plan.navSelectors, ['body > .header']);
  assert.deepEqual(plan.clearPadding, []);
  assert.deepEqual(plan.fixedBarTop, []);
});

// ---------------------------------------------------------------------------
// 骑手
// ---------------------------------------------------------------------------

test('骑手 index：.top_box > .headbox，tabbox 留白 1.9rem - .88rem', () => {
  const plan = buildPlan({ service: 'courier', pathname: '/', search: '?service=waimai&do=courier&template=index' });

  assert.equal(plan.page, 'index');
  assert.deepEqual(plan.navSelectors, ['.top_box > .headbox']);
  assert.deepEqual(plan.clearPadding, [{ selector: '.tabbox', prop: 'margin-top', value: '1.02rem' }]);
  assert.equal(plan.disableVerticalSwipes, true);
  assert.equal(plan.isHome, true);
  // 算术推导必须留下人工确认痕迹
  assert.equal(plan.pendingConfirm.length, 1);
  assert.match(plan.pendingConfirm[0], /1\.02rem/);
});

test('骑手 mypocket / statistics / comment 的留白补丁', () => {
  const pocket = buildPlan({ service: 'courier', pathname: '/', search: '?template=mypocket' });
  assert.deepEqual(pocket.clearPadding, [{ selector: '.page_box', prop: 'padding-top', value: '0' }]);

  const stat = buildPlan({ service: 'courier', pathname: '/', search: '?template=statistics' });
  assert.deepEqual(stat.clearPadding, [{ selector: '.countBoxMonth', prop: 'padding-top', value: '1.08rem' }]);

  const comment = buildPlan({ service: 'courier', pathname: '/', search: '?template=comment' });
  assert.deepEqual(comment.clearPadding, [{ selector: 'body', prop: 'padding-top', value: '0' }]);
});

test('骑手 setting：只有 iOS App 才有的留白不适用于 Telegram，不写规则', () => {
  const plan = buildPlan({ service: 'courier', pathname: '/', search: '?template=setting' });
  assert.deepEqual(plan.navSelectors, ['.top_box > .headbox']);
  assert.deepEqual(plan.clearPadding, []);
});

test('骑手 withdraw：另一套 .header-box > .header', () => {
  const plan = buildPlan({ service: 'courier', pathname: '/', search: '?template=withdraw' });
  assert.deepEqual(plan.navSelectors, ['.header-box > .header']);
  assert.deepEqual(plan.clearPadding, []);
});

test('骑手 map / login：不动', () => {
  for (const page of ['map', 'login']) {
    const plan = buildPlan({ service: 'courier', pathname: '/', search: '?template=' + page });
    assert.deepEqual(plan.navSelectors, [], page);
    assert.deepEqual(plan.clearPadding, [], page);
  }
});

test('骑手 detail：必须隐藏 .page_detail .headbox（完结态会露出流内标题栏）', () => {
  const plan = buildPlan({ service: 'courier', pathname: '/', search: '?template=detail' });

  // detail.css:27 有 .page_detail.orderend .headbox{position:relative}，
  // detail.css:5 有 .headshow.headbox{opacity:1}；detail.html:46/48 在订单完结时把两个 class 同时挂上，
  // 于是标题栏变成「可见 + 占位」，与 Telegram 原生返回键并存。这条断言钉住它必须被隐藏。
  assert.ok(plan.navSelectors.includes('.page_detail .headbox'), 'detail 的 .headbox 必须进 nav');

  // 未完结态它是 position:fixed（不占位），完结态隐藏后内容自然上移，
  // 两种状态都不需要补留白 —— 一旦有人给 detail 加了 clearPadding，说明判断被改坏了。
  assert.deepEqual(plan.clearPadding, []);
  assert.deepEqual(plan.fixedBarTop, []);
});

// ---------------------------------------------------------------------------
// 资讯与未知模块
// ---------------------------------------------------------------------------

test('资讯：D6 决定整块不做，计划必须为空且不留 pending', () => {
  const plan = buildPlan({ service: 'article', pathname: '/', search: '?service=article' });
  assert.deepEqual(plan.navSelectors, []);
  assert.deepEqual(plan.clearPadding, []);
  assert.deepEqual(plan.fixedBarTop, []);
  assert.deepEqual(plan.pendingConfirm, []);
});

test('未知模块：空计划 + pending，绝不猜选择器', () => {
  const plan = buildPlan({ service: '', pathname: '/user/', search: '' });
  assert.deepEqual(plan.navSelectors, []);
  assert.match(plan.pendingConfirm[0], /unknown-service/);
});

test('已识别模块里的未盘点页面：仍用默认规则，但必须留 pending', () => {
  const plan = buildPlan({ service: 'waimai', pathname: '/brand-new-page.html', search: '' });
  assert.deepEqual(plan.navSelectors, ['body > .header']);
  assert.ok(plan.pendingConfirm.some((x) => /未盘点页面: waimai\/brand-new-page/.test(x)));
});

// ---------------------------------------------------------------------------
// 全局不变量：这一条是防「一刀切 .header」的回归闸门
// ---------------------------------------------------------------------------

test('所有模块所有页面的 navSelectors 都不允许出现裸 .header', () => {
  const cases = [
    ['waimai', ['index', 'list', 'slist', 'cart', 'quan', 'shop', 'search_wm', 'addressPaotui', 'pay']],
    ['travel', ['index', 'ticket', 'hotel', 'store', 'rentcar', 'daytravel', 'grouptravel', 'visa', 'pay']],
    ['courier', ['index', 'history', 'mypocket', 'statistics', 'comment', 'setting', 'withdraw']]
  ];

  for (const [service, pages] of cases) {
    for (const page of pages) {
      const plan = buildPlan({ service, pathname: '/' + page + '.html', search: '' });
      for (const sel of plan.navSelectors) {
        // .header 在弹层里被复用 9 处（index.html:303、cart.html:592 等），
        // 裸选择器会把备注弹层/优惠券面板的返回键一起打掉
        assert.notEqual(sel, '.header', `${service}/${page} 用了裸 .header`);
        assert.doesNotMatch(sel, /^\.header(\s|$|[.:[{])/, `${service}/${page}: ${sel}`);
      }
    }
  }
});

test('renderCss：隐藏用 display:none!important，留白一律 !important 压过页面自己的 fixed 规则', () => {
  const css = renderCss(buildPlan({ service: 'travel', pathname: '/ticket.html', search: '' }));
  assert.match(css, /body > \.header\{display:none!important;\}/);
  assert.match(css, /\.contentBox\{padding-top:0!important;\}/);
  assert.match(css, /\.screenBox\{top:0!important;\}/);
});

test('rootDomain：频道子域算站内，避免把站内跳转扔进系统浏览器', () => {
  assert.equal(rootDomain('fh580.net'), 'fh580.net');
  assert.equal(rootDomain('waimai.fh580.net'), 'fh580.net');
  assert.equal(rootDomain('fh580.com.ph'), 'fh580.com.ph');
  assert.equal(rootDomain('a.fh580.com.ph'), 'fh580.com.ph');
  assert.equal(rootDomain('t.me'), 't.me');
});

// ---------------------------------------------------------------------------
// 跨文件同源守卫：PHP service 白名单（webroot/include/tgWhitelist.inc.php）
// 与 shim 的处理集（SERVICES）。
//
// 两份名单语义不同、不该相等，但交叠部分必须同源 —— 否则第三个 service 加进来时
// 必有一边漏改，而漏改的表现是「静默不注入/静默放行」，跑普通测试不会红。
//   PHP 允许集  = { waimai, article, travel, member, siteConfig, business }   允许访问
//                 （business 是产品裁决加的例外：商家要用网页后台接单）
//   shim 处理集 = { waimai, travel, courier, article }                       会做页面适配
//   交集        = { waimai, travel, article }                                两边都必须在
//   只在 PHP    = { member, siteConfig, business }                           shim 不处理，正常
//   只在 shim   = { courier }                                                PHP 侧是 do=courier，正常
// ---------------------------------------------------------------------------

test('白名单同源守卫：shim 适配的 service 必须都在 PHP 白名单里', () => {
  const fs = require('node:fs');
  const php = fs.readFileSync(
    path.join(__dirname, '../../../webroot/include/tgWhitelist.inc.php'),
    'utf8'
  );

  // 从 fbsTgServiceAllowed() 里抽出 $allow = array(...) 的字符串字面量。
  // PHP 侧若有人把数组改名/挪走，这里会拿到空集 → 下面的断言会红，而不是恒真。
  const m = /\$allow\s*=\s*array\s*\(([^)]*)\)/.exec(php);
  assert.ok(m, 'tgWhitelist.inc.php 里找不到 $allow 数组（函数结构变了？）');
  const phpAllow = (m[1].match(/'([^']+)'/g) || []).map((s) => s.slice(1, -1));
  assert.ok(phpAllow.length > 0, '白名单解析结果为空');

  const shimSet = new Set(Object.keys(shim.SERVICES));
  const phpSet = new Set(phpAllow);

  // 1) 方向是单向的：shim 会适配的 service，必须都能被访问到。
  //    否则就是「给一个根本打不开的页面做顶栏适配」，那段代码永远是死路径。
  //    反过来不成立 —— PHP 侧允许 shim 不处理的 service 是正常的（member / siteConfig），
  //    所以这里**不能**断言交集精确等于某个集合：那样将来只要放开一个模块
  //    （比如把商家端重新对商家开放），这行测试就会红，而它红得毫无道理。
  const shimServices = [...shimSet].filter((s) => s !== 'courier').sort();
  for (const s of shimServices) {
    assert.ok(phpSet.has(s), `shim 会适配 ${s}，但 PHP 白名单里没有它 → 该页面根本打不开`);
  }

  // 2) article 双侧都在，但语义相反：PHP 放行访问（资讯页要能打开），
  //    shim 命中即 return（D6，一行不碰）。这里只钉「双侧都在」，语义各自有测试钉。
  assert.ok(shimSet.has('article') && phpSet.has('article'));

  // 3) courier 只出现在 shim 侧；PHP 侧它是 do=courier，绝不能以 service 名进白名单
  assert.ok(shimSet.has('courier'));
  assert.ok(!phpSet.has('courier'), "PHP 白名单不应出现 'courier'（它是 do=courier，不是 service）");

  // 4) member / siteConfig 只在 PHP 侧：shim 不做会员/站点页的适配，漏进 SERVICES 反而是错的
  assert.ok(phpSet.has('member') && phpSet.has('siteConfig'));
  assert.ok(!shimSet.has('member') && !shimSet.has('siteConfig'));
});

// ---------------------------------------------------------------------------
// 定位桥接：Telegram LocationManager → W3C Geolocation 子集
// ---------------------------------------------------------------------------
function fakeTimers() {
  let fn = null;
  return {
    setTimeout: (f) => { fn = f; return 1; },
    clearTimeout: () => { fn = null; },
    fire: () => { const f = fn; fn = null; if (f) f(); }
  };
}

test('定位桥接：没有 LocationManager 时返回 null（保持原生行为）', () => {
  assert.strictEqual(shim.createGeolocation({}, null), null);
  assert.strictEqual(shim.createGeolocation({ LocationManager: {} }, null), null);
});

test('定位桥接：授权后返回标准 coords', () => {
  const LM = {
    isInited: false,
    init(cb) { this.isInited = true; cb(); },
    getLocation(cb) { cb({ latitude: 14.5176, longitude: 120.9795, horizontal_accuracy: 12 }); }
  };
  const geo = shim.createGeolocation({ LocationManager: LM }, null, fakeTimers());
  let got = null;
  geo.getCurrentPosition((p) => { got = p; }, () => assert.fail('不应走错误回调'));
  assert.strictEqual(got.coords.latitude, 14.5176);
  assert.strictEqual(got.coords.longitude, 120.9795);
  assert.strictEqual(got.coords.accuracy, 12);
});

test('定位桥接：用户拒绝（getLocation 回 null）→ PERMISSION_DENIED(1)', () => {
  const LM = { isInited: true, getLocation(cb) { cb(null); } };
  const geo = shim.createGeolocation({ LocationManager: LM }, null, fakeTimers());
  let err = null;
  geo.getCurrentPosition(() => assert.fail('不应成功'), (e) => { err = e; });
  assert.strictEqual(err.code, 1);
});

test('定位桥接：客户端明确无定位能力 → 交回原生实现', () => {
  const LM = { isInited: true, isLocationAvailable: false, getLocation() { assert.fail('不应再调 Telegram'); } };
  let usedNative = false;
  const nativeGeo = { getCurrentPosition() { usedNative = true; } };
  const geo = shim.createGeolocation({ LocationManager: LM }, nativeGeo, fakeTimers());
  geo.getCurrentPosition(() => {}, () => {});
  assert.strictEqual(usedNative, true);
});

test('定位桥接：Telegram 一直不回调 → 兜底超时 TIMEOUT(3)，不会永远转圈', () => {
  const LM = { isInited: true, getLocation() { /* 永不回调 */ } };
  const timers = fakeTimers();
  const geo = shim.createGeolocation({ LocationManager: LM }, null, timers);
  let err = null;
  geo.getCurrentPosition(() => assert.fail('不应成功'), (e) => { err = e; });
  timers.fire();
  assert.strictEqual(err.code, 3);
});

test('定位桥接：成功与超时只回调一次', () => {
  let cb;
  const LM = { isInited: true, getLocation(c) { cb = c; } };
  const timers = fakeTimers();
  const geo = shim.createGeolocation({ LocationManager: LM }, null, timers);
  let n = 0;
  geo.getCurrentPosition(() => { n++; }, () => { n++; });
  cb({ latitude: 1, longitude: 2 });
  cb({ latitude: 3, longitude: 4 });
  timers.fire();
  assert.strictEqual(n, 1);
});
