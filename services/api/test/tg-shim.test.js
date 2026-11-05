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

test('骑手 detail / map / login：不动', () => {
  for (const page of ['detail', 'map', 'login']) {
    const plan = buildPlan({ service: 'courier', pathname: '/', search: '?template=' + page });
    assert.deepEqual(plan.navSelectors, [], page);
    assert.deepEqual(plan.clearPadding, [], page);
  }
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
