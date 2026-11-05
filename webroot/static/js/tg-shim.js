/*!
 * tg-shim.js — 火鸟 H5 的 Telegram Mini App 适配层
 *
 * 单文件、零依赖、不改任何模板文件。
 * 只在 Telegram WebView 内生效：window.Telegram.WebApp.initData 为空时立即 return，
 * 不碰 DOM、不注册任何监听（D1）。
 *
 * 选择器与数值的唯一来源：
 *   .agent-runs/2026-11-05/task-004/investigation-h5.md
 *     §①  四套顶栏的 DOM 结构与复用点（.header 在弹层里被复用 9 处）
 *     §③  各页面隐藏顶栏后要补的留白与固定子条 top
 * 报告没给出规则的页面，这里不发明，一律进 plan.pendingConfirm 交人工确认。
 *
 * 部署：由 nginx sub_filter 以 <script src="/static/js/tg-shim.js?v=N"> 注入。
 * 注入体必须是纯标签、零内联 JS —— nginx 单引号不阻止 $ 展开，内联内容会被静默打穿。
 */
(function () {
  'use strict';

  // ==========================================================================
  // 纯函数区：只做「给定 service/page → 选择器计划」的决策，不碰 DOM。
  // Node 侧通过 module.exports 直接 require 本文件做单测（此时不会跑 boot）。
  // ==========================================================================

  var SERVICES = { waimai: 1, travel: 1, courier: 1, article: 1 };

  // 资讯是 uni-app 编译产物（article/touch/skin4），DOM 由运行时渲染，
  // 静态选择器无法 100% 覆盖 → D6：整块不做，命中即 return。
  var ARTICLE = 'article';

  // 公共顶栏：外卖/旅游共用 siteConfig/touch_top.html 的 .header（报告 §1.1）。
  // 必须限定为 body 直接子元素 —— .header 在弹层里被复用 9 处：
  //   index.html:303(.searchPage)、cart.html:592(.remark_page)、
  //   paotui-buy.html:204(.quanWrap)/:224(.ruleWrap)、paotui-song.html:203 起 …
  // 写成裸 .header 会打断这些面板自己的返回键（报告 §1.2.6）。
  var BODY_HEADER = ['body > .header'];

  function padTop(selector, value) {
    return { selector: selector, prop: 'padding-top', value: value };
  }
  function marginTop(selector, value) {
    return { selector: selector, prop: 'margin-top', value: value };
  }
  function barTop(selector, value) {
    return { selector: selector, value: value };
  }

  // 外卖 list/slist 共用 css/list.css，两条都是 fixed 顶栏 + .9rem 筛选条。
  // 数值取自火鸟自己的「顶栏已隐藏」分支（list.css:10-12 的 .huoniao_iOS 补偿），
  // 不是我们算出来的：
  //   .huoniao_iOS .fenlei_box{top:0}  .huoniao_iOS body{padding-top:.9rem}
  //   .huoniao_iOS .fixedtop{top:.9rem}
  // 注意 .huoniao_iOS 只在火鸟原生 App UA 下才会挂到 <html>（touchScale.js:102），
  // Telegram 里不生效，所以必须由我们复刻。
  var WAIMAI_LIST = {
    clearPadding: [padTop('body', '0.9rem')],
    fixedBarTop: [barTop('.fenlei_box', '0'), barTop('.fixedtop', '0.9rem')],
    disableVerticalSwipes: true
  };

  // 旅游 8 个列表页把顶栏改成 fixed（第 8 个是 video-detail，video-detail.css:68
  // 也有 .header{position:fixed}）。其中 7 页要清 .contentBox 的留白；video-detail
  // 没有 .contentBox、body 也没有 padding-top，fixed 顶栏不占流，隐藏后内容自然上移，
  // 所以一行业务补丁都不需要。
  // 7 页里 5 页另有 .screenBox{top:.9rem}（ticket/hotel/rentcar/grouptravel/visa）；
  // store/daytravel 的 DOM 里没有该节点，已逐个核对（store.html/daytravel.html 均 0 命中）。
  // 数值同样取自火鸟自己的 .huoniao_iOS 补偿（如 ticket.css:113-114）。
  var TRAVEL_LIST = {
    clearPadding: [padTop('.contentBox', '0')],
    fixedBarTop: [barTop('.screenBox', '0')],
    disableVerticalSwipes: true
  };
  var TRAVEL_LIST_NO_SCREENBOX = {
    clearPadding: [padTop('.contentBox', '0')],
    disableVerticalSwipes: true
  };

  // 骑手顶栏是每页自写的 .top_box > .headbox（报告 §1.6），没有公共片段。
  // .headbox 高 .88rem（各页 css 一致：index/mypocket/statistics/comment/setting 均 0.88），
  // 所以留白一律「原值 - .88rem」。这里没有火鸟自己的补偿分支可抄，
  // 属于算术推导，全部进 pendingConfirm 交 canary 实测。
  var RULES = {
    waimai: {
      nav: BODY_HEADER,
      // 27 个模板除 footer.html（公共片段）外的全部页面名，用于把「报告没盘点的页面」
      // 暴露成 pendingConfirm，而不是让默认规则悄悄生效
      knownPages: [
        'address', 'addressbuy', 'addressedit', 'addresspaotui', 'cart', 'commt', 'getquan',
        'index', 'list', 'local', 'order-wamai', 'orderdetail-waimai', 'paotui', 'paotui-buy',
        'paotui-song', 'pay', 'payreturn', 'qishou', 'quan', 'search', 'search_wm', 'shop',
        'shop_cart', 'slist', 'wmsj', 'youhui_list'
      ],
      pages: {
        // 首页真正的顶栏是 .headBox（index.css:8，fixed），它是「选收货地址」+
        // 「分类菜单」两个业务入口 → D5 保留不动；.header 本身已被 index.css:1
        // 的 opacity:0 + top:-.9rem 移出屏幕，这里多写一条只是幂等兜底。
        index: {},
        list: WAIMAI_LIST,
        slist: WAIMAI_LIST,
        // 这两页的顶栏不是 body 直接子元素（报告 §1.2.4）：
        //   search_wm.html:16-19  body > .pageContainer > .searchPage > .header
        //   addressPaotui.html:1-2 body > .choseWrap > .header
        search_wm: { nav: ['.pageContainer > .searchPage > .header'] },
        addresspaotui: { nav: ['.choseWrap > .header'] },
        // 支付页委托 member/touch/public-pay.html，顶栏是 .container > .header
        // （public-pay.css:5 relative + 1rem，流内，无需补留白，报告 §1.5）。
        pay: { nav: ['.container > .header'] },
        // 独立搜索页，顶栏是 .search > i.goBack 而不是 .header（报告 §1.2.2）；
        // 报告只给了选择器、没给隐藏结论 → 不动，待确认。
        search: {
          nav: [],
          pendingConfirm: 'waimai/search.html 顶栏为 .search > i.goBack（报告 §1.2.2），未给隐藏结论'
        },
        // 整文件只有一行 include，委托 member/touch/address_waimai.html，
        // 会员侧模板不在本次盘点范围 → 不动，待确认。
        address: {
          nav: [],
          pendingConfirm: 'waimai/address.html 委托 member/touch/address_waimai.html，未盘点'
        }
      }
    },

    travel: {
      nav: BODY_HEADER,
      // 37 个模板去掉 _chose_address / _chose_offer / _foot 三个下划线片段
      knownPages: [
        'agency-detail', 'comdetail', 'comfirm', 'comment', 'confirm-order', 'daytravel',
        'grouptravel', 'hotel', 'hotel-detail', 'hotel-order', 'index', 'pay', 'payreturn',
        'rentcar', 'rentcar-detail', 'require', 'store', 'store-detail', 'strategy',
        'strategy-detail', 'ticket', 'ticket-detail', 'ticket-order', 'travel-hotelstate',
        'travel-ticketstate', 'travelsearch', 'video', 'video-detail', 'visa', 'visa-detail',
        'visa-order', 'visacountry', 'visacountry-detail', 'visaindex'
      ],
      pages: {
        ticket: TRAVEL_LIST,
        hotel: TRAVEL_LIST,
        rentcar: TRAVEL_LIST,
        grouptravel: TRAVEL_LIST,
        visa: TRAVEL_LIST,
        store: TRAVEL_LIST_NO_SCREENBOX,
        daytravel: TRAVEL_LIST_NO_SCREENBOX,
        // 旅游支付页同样走 member/touch/public-pay.html（报告 §1.5）
        pay: { nav: ['.container > .header'] },
        // 支付返回页没有公共顶栏（30 页清单之外），报告未给结构 → 待确认
        payreturn: {
          nav: [],
          pendingConfirm: 'travel/payreturn.html 无公共顶栏，报告未给结构'
        },
        // 纯 router，按 $type include 三个 order 模板（报告 §1.3.2）
        'confirm-order': { nav: [] },
        // 自有浮动顶栏 .topnav{position:fixed;top:.2rem}（visacountry-detail.css:29），
        // 报告明确说「隐藏也行、不隐藏也行」，没有结论 → 不动，待确认。
        'visacountry-detail': {
          nav: [],
          pendingConfirm: 'travel/visacountry-detail.html 自有 .topnav 浮动圆钮，报告未给结论'
        },
        _chose_address: { nav: [] },
        _chose_offer: { nav: [] },
        _foot: { nav: [] }
      }
    },

    courier: {
      // 骑手 URL 是 ?service=waimai&do=courier&template=xxx，
      // 模板目录被 index.php:1406-1408 改写成 /templates/courier/。
      nav: ['.top_box > .headbox'],
      // 骑手是 App 形态的整屏列表，纵向滑动很容易误触「下拉关闭」
      disableVerticalSwipes: true,
      knownPages: [
        'comment', 'detail', 'history', 'index', 'login', 'map', 'mypocket', 'setting',
        'statistics', 'statisticshistory', 'withdraw'
      ],
      pages: {
        index: {
          clearPadding: [marginTop('.tabbox', '1.02rem')],
          pendingConfirm: 'courier/index.html .tabbox 原 margin-top:1.9rem - 顶栏 .88rem = 1.02rem（算术推导）'
        },
        history: {
          clearPadding: [marginTop('.tabbox', '1.02rem')],
          pendingConfirm: 'courier/history.html .tabbox 同 index（算术推导）'
        },
        mypocket: {
          clearPadding: [padTop('.page_box', '0')],
          pendingConfirm: 'courier/mypocket.html .page_box 原 padding-top:.88rem（mypocket.css:19）'
        },
        statistics: {
          clearPadding: [padTop('.countBoxMonth', '1.08rem')],
          pendingConfirm: 'courier/statistics.html .countBoxMonth 原 padding-top:1.96rem - .88rem = 1.08rem（算术推导）'
        },
        // .page_box 的 padding-top 在 css 里本来就是注释掉的（statisticsHistory.css:6）
        statisticshistory: {},
        comment: {
          clearPadding: [padTop('body', '0')],
          pendingConfirm: 'courier/comment.html body 原 padding-top:.88rem（comment.css:2）'
        },
        // .pagebox>div{padding-top:1.96rem} 只在 .huoniao_iOS.huoniao_Fullscreen 下生效，
        // 而那个类只在火鸟原生 App UA 下才挂（touchScale.js:102），Telegram 里本来就没有这段留白。
        setting: {},
        // 骑手侧唯一一套不同构的顶栏：.header-box > .header，流内（withdraw.css:3-4）
        withdraw: { nav: ['.header-box > .header'] },
        // .headbox 默认 opacity:0（detail.css:4），滚动才出现，且里面是唯一的手动返回键；
        // 隐藏收益为 0、误伤返回的风险非 0 → 不动，待确认。
        detail: {
          nav: [],
          pendingConfirm: 'courier/detail.html .headbox 默认 opacity:0 且内含唯一返回键，报告未给结论'
        },
        // 整页是地图，没有顶栏（map.html 无 .top_box 节点）
        map: { nav: [], disableVerticalSwipes: false },
        login: { nav: [], disableVerticalSwipes: false }
      }
    }
  };

  function decodePart(value) {
    var raw = String(value == null ? '' : value);
    try {
      return decodeURIComponent(raw.replace(/\+/g, ' '));
    } catch (e) {
      return raw;
    }
  }

  // 取第一个同名参数。注意这与 PHP 不一致：parse_str/$_GET 对重复键取**最后一个**
  // （实测 php -r 'parse_str("a=1&a=2",$o)' → '2'）。此处刻意保持取第一个——
  // 模板生成的正常 URL 不会有重复键，差异只影响人为构造的异常 URL；
  // 取第一个意味着追加的重复参数无法改变页面判定，不会被用来绕过路由。
  function parseQuery(search) {
    var out = {};
    var raw = String(search || '');
    var at = raw.indexOf('?');
    if (at >= 0) raw = raw.slice(at + 1);
    if (!raw) return out;
    var parts = raw.split('&');
    for (var i = 0; i < parts.length; i++) {
      if (!parts[i]) continue;
      var eq = parts[i].indexOf('=');
      var key = decodePart(eq < 0 ? parts[i] : parts[i].slice(0, eq));
      if (!key || Object.prototype.hasOwnProperty.call(out, key)) continue;
      out[key] = decodePart(eq < 0 ? '' : parts[i].slice(eq + 1));
    }
    return out;
  }

  /**
   * 页面名归一化。
   * 1) 去掉 .html/.htm；
   * 2) 去掉结尾的 -<数字>。依据 webroot/include/common.func.php 的 checkPagePath 默认
   *    URL 规则（strstr($pagePath,'-') → explode('-')[0]），分页与 typeid 后缀都长这样：
   *    list-2.html、detail-31.html。只吃「结尾纯数字」，避免切坏 order-wamai /
  *    paotui-buy 这类名字本身带连字符的页面。
   */
  function normalizePage(page) {
    var p = String(page == null ? '' : page).toLowerCase();
    p = p.replace(/\.(html?|php)$/, '');
    p = p.replace(/-\d+$/, '');
    return p || 'index';
  }

  /**
   * 从 URL 里解析页面名：优先 ?template=，其次 pathname 的最后一段。
   * 火鸟主域名的 URL 规则是 域名/模块/页面.html（index.php:590 附近的分支注释），
   * 模块绑独立域名时退化成 域名/页面.html，两种都取最后一段即可。
   */
  function resolvePage(input) {
    var src = input || {};
    var q = parseQuery(src.search);
    if (q.template) return normalizePage(q.template);
    var path = String(src.pathname || '/');
    var at = path.indexOf('?');
    if (at >= 0) path = path.slice(0, at);
    path = path.replace(/\/+$/, '');
    var seg = path.slice(path.lastIndexOf('/') + 1);
    // /waimai/ 或 /waimai 这种「只到模块」的 URL，index.php 会当成 index（requestPathArr 取空 → 'index'）
    var low = String(seg).toLowerCase();
    if (SERVICES[low] && low !== 'courier') return 'index';
    return normalizePage(seg);
  }

  /**
   * 判断当前页属于哪个模块。入参全部来自调用方采集，保持本函数可单测：
   *   search      location.search
   *   pathname    location.pathname
   *   modelType   window.modelType（部分外卖页有，如 skin2/index.html:18）
   *   assetRefs   页面上 link[href] / script[src] 的集合，用于识别皮肤路径
   *
   * 顺序：query 显式声明 > modelType > 皮肤资源路径 > pathname 首段。
   * 皮肤路径最可靠：模板用 {#$templets_skin#} 拼 css/js，最终一定落在
   * /templates/<module>/touch/... 下，而 modelType 只有 14/27 个外卖页有。
   */
  function detectService(input) {
    var src = input || {};
    var q = parseQuery(src.search);
    var fromQuery = String(q.service || '').toLowerCase();
    if (fromQuery === 'waimai' && String(q.do || '').toLowerCase() === 'courier') return 'courier';
    if (SERVICES[fromQuery] && fromQuery !== 'courier') return fromQuery;

    var mt = String(src.modelType || '').toLowerCase();
    if (SERVICES[mt] && mt !== 'courier') return mt;

    var refs = src.assetRefs || [];
    for (var i = 0; i < refs.length; i++) {
      var m = /\/templates\/(waimai|travel|courier|article)\//.exec(String(refs[i]));
      if (m) return m[1];
    }

    var first = String(src.pathname || '/').split('/')[1] || '';
    first = normalizePage(first);
    if (SERVICES[first] && first !== 'courier') return first;
    return '';
  }

  /**
   * 决策主干：{ service, pathname, search } → 选择器计划。
   *
   * 返回：
   *   navSelectors           要整条隐藏的顶栏选择器（display:none!important）
   *   clearPadding           顶部留白修正，元素形如 {selector, prop, value}
   *                          （叫 clearPadding 沿用任务书的口径，含 padding-top 与 margin-top）
   *   fixedBarTop            压在顶栏下面的固定子条 top 修正，{selector, value}
   *   disableVerticalSwipes  是否关闭「下拉关闭 Mini App」手势
   *   isHome                 是否模块首页（决定 BackButton 显示与否）
   *   pendingConfirm         报告没覆盖、需要 canary 人工确认的条目
   */
  function buildPlan(input) {
    var src = input || {};
    var service = String(src.service || '').toLowerCase();
    var page = resolvePage(src);
    var plan = {
      service: service,
      page: page,
      navSelectors: [],
      clearPadding: [],
      fixedBarTop: [],
      disableVerticalSwipes: false,
      isHome: page === 'index',
      pendingConfirm: []
    };

    // D6：资讯是 uni-app 编译产物，整块不做。boot() 会在此之前就 return，
    // 这里再挡一次，保证任何调用方拿到的都是空计划。
    if (service === ARTICLE) return plan;

    var mod = RULES[service];
    if (!mod) {
      plan.pendingConfirm.push('unknown-service: ' + (service || '(空)'));
      return plan;
    }

    var rule = mod.pages && Object.prototype.hasOwnProperty.call(mod.pages, page) ? mod.pages[page] : null;

    if (mod.knownPages && mod.knownPages.indexOf(page) < 0) {
      plan.pendingConfirm.push('未盘点页面: ' + service + '/' + page);
    }

    plan.navSelectors = ((rule && rule.nav) || mod.nav || []).slice();
    plan.clearPadding = ((rule && rule.clearPadding) || mod.clearPadding || []).slice();
    plan.fixedBarTop = ((rule && rule.fixedBarTop) || mod.fixedBarTop || []).slice();

    if (rule && typeof rule.disableVerticalSwipes === 'boolean') {
      plan.disableVerticalSwipes = rule.disableVerticalSwipes;
    } else {
      plan.disableVerticalSwipes = !!mod.disableVerticalSwipes;
    }

    if (rule && rule.pendingConfirm) plan.pendingConfirm.push(rule.pendingConfirm);
    return plan;
  }

  /** 计划 → 一段 CSS。用样式表而不是逐个元素改内联样式，理由有两条：
   *  1) 骑手 setting.html 一页里有 5 组 Vue 条件渲染的 .headbox，脚本执行时可能还没生成；
   *     CSS 规则对之后插入的节点同样生效。
   *  2) 不动 DOM 结构，页面自己的 JS 不会因为节点消失而报错。 */
  function renderCss(plan) {
    var out = [];
    var i;
    for (i = 0; i < plan.navSelectors.length; i++) {
      out.push(plan.navSelectors[i] + '{display:none!important;}');
    }
    for (i = 0; i < plan.clearPadding.length; i++) {
      var p = plan.clearPadding[i];
      out.push(p.selector + '{' + p.prop + ':' + p.value + '!important;}');
    }
    for (i = 0; i < plan.fixedBarTop.length; i++) {
      out.push(plan.fixedBarTop[i].selector + '{top:' + plan.fixedBarTop[i].value + '!important;}');
    }
    return out.join('');
  }

  /**
   * 站内域名判定。火鸟的频道可能绑独立域名/子域（$waimai_channelDomain），
   * 只比 location.host 会把站内跳转误判成外链、扔进系统浏览器 —— 那正是
   * 「不要破坏火鸟 SPA 式跳转」要避免的事。所以按可注册域名（eTLD+1）比。
   */
  function rootDomain(host) {
    var h = String(host || '').toLowerCase().replace(/\.$/, '');
    if (!h) return '';
    var parts = h.split('.');
    if (parts.length <= 2) return h;
    var tld = parts[parts.length - 1];
    var sld = parts[parts.length - 2];
    // .com.ph / .co.uk 这类二级后缀，多取一层
    var three = tld.length === 2 && /^(com|net|org|gov|edu|co|ac)$/.test(sld);
    return parts.slice(three ? -3 : -2).join('.');
  }

  function isEmailOrTel(url) {
    return url.protocol === 'tel:' || url.protocol === 'mailto:';
  }

  // ==========================================================================
  // 运行时区
  // ==========================================================================

  function boot() {
    var WA = window.Telegram && window.Telegram.WebApp;
    if (!WA || !WA.initData) return; // D1：非 Telegram / 无 initData，什么都不做

    var service = detectService({
      search: window.location.search,
      pathname: window.location.pathname,
      modelType: window.modelType,
      assetRefs: collectAssetRefs()
    });

    if (service === ARTICLE) return; // D6：资讯整块不做

    expand(WA);

    var plan = buildPlan({
      service: service,
      pathname: window.location.pathname,
      search: window.location.search
    });
    if (!plan.service) return; // 未识别的模块：只做过 expand，不碰 DOM

    injectCss(plan);
    applyTheme(WA, plan);
    applyBackButton(WA, plan);
    wireExternalLinks(WA);
  }

  function collectAssetRefs() {
    var out = [];
    var nodes = document.querySelectorAll('link[href],script[src]');
    for (var i = 0; i < nodes.length && i < 60; i++) {
      var el = nodes[i];
      var ref = el.getAttribute('href') || el.getAttribute('src') || '';
      if (ref) out.push(ref);
    }
    return out;
  }

  function call(WA, name, arg) {
    try {
      if (typeof WA[name] === 'function') WA[name](arg);
    } catch (e) {
      // 旧版 Telegram 没有这些方法；能力缺失一律降级为「不设置」，不抛错
    }
  }

  function expand(WA) {
    call(WA, 'expand');
  }

  function injectCss(plan) {
    var css = renderCss(plan);
    if (!css) return;
    var node = document.getElementById('tg-shim-style');
    if (!node) {
      node = document.createElement('style');
      node.id = 'tg-shim-style';
      (document.head || document.documentElement).appendChild(node);
    }
    node.textContent = css;
  }

  // 顶栏色 = 隐藏顶栏后页面最上沿的那块颜色，衔接才没有接缝（报告 §3.1）：
  //   外卖/旅游顶栏白 #fff；骑手 .headbox 深灰 #24262B（courier/css/index.css:5）
  // 品牌强调色（外卖 #ff635c、旅游 #fdc224/#f4840c、骑手 #4eccc4）用不上，
  // 它们不是页面顶部那一块的颜色。
  var THEME = {
    waimai: { header: '#ffffff', background: '#ffffff' },
    travel: { header: '#ffffff', background: '#ffffff' },
    courier: { header: '#24262B', background: '#24262B' }
  };

  function applyTheme(WA, plan) {
    var t = THEME[plan.service];
    if (t) {
      call(WA, 'setHeaderColor', t.header);
      call(WA, 'setBackgroundColor', t.background);
    }
    if (plan.disableVerticalSwipes) call(WA, 'disableVerticalSwipes');
  }

  function applyBackButton(WA, plan) {
    var bb = WA.BackButton;
    if (!bb) return;
    try {
      if (plan.isHome) {
        bb.hide();
        return;
      }
      bb.onClick(function () {
        window.history.back();
      });
      bb.show();
    } catch (e) {
      // 同上：能力缺失时保持 Telegram 的默认行为
    }
  }

  function wireExternalLinks(WA) {
    var internal = internalRoots();

    document.addEventListener(
      'click',
      function (e) {
        var node = e.target;
        while (node && node.nodeType === 1 && node.tagName !== 'A') node = node.parentNode;
        if (!node || node.nodeType !== 1) return;

        var href = node.getAttribute('href');
        if (!href || href.charAt(0) === '#' || /^javascript:/i.test(href)) return;

        var url;
        try {
          url = new URL(node.href, window.location.href);
        } catch (err) {
          return;
        }

        // tel:/mailto: 一律交给系统
        if (isEmailOrTel(url)) {
          e.preventDefault();
          openLink(WA, node.getAttribute('href'));
          return;
        }

        if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
        // 站内（含同 eTLD+1 的频道域）不动，避免打断火鸟自己的跳转逻辑
        if (internal.indexOf(rootDomain(url.hostname)) >= 0) return;

        e.preventDefault();
        // Telegram 的 t.me 链接要用 openTelegramLink，openLink 会被当成普通外链
        if (/(^|\.)(t\.me|telegram\.me)$/.test(url.hostname.toLowerCase())) {
          call(WA, 'openTelegramLink', url.href);
        } else {
          openLink(WA, url.href);
        }
      },
      true
    );
  }

  // 站内根域名集合：当前域名 + 模板里暴露的站点域（touch_top.html 的 masterDomain、
  // 各模块头部的 channelDomain / memberUserDomain）。
  // 即使一个全局变量都取不到，当前域名本身始终算站内 —— 宁可少拦几个外链，
  // 也不要把站内跳转扔进系统浏览器。
  function internalRoots() {
    var roots = [rootDomain(window.location.hostname)];
    var keys = ['masterDomain', 'channelDomain', 'memberUserDomain', 'userdomain', 'user_member'];
    for (var i = 0; i < keys.length; i++) {
      var raw = window[keys[i]];
      if (!raw || typeof raw !== 'string') continue;
      try {
        var host = new URL(raw, window.location.href).hostname;
        var root = rootDomain(host);
        if (root && roots.indexOf(root) < 0) roots.push(root);
      } catch (e) {
        // 忽略无法解析的值
      }
    }
    return roots;
  }

  function openLink(WA, href) {
    if (typeof WA.openLink === 'function') {
      try {
        WA.openLink(href);
        return;
      } catch (e) {
        // 落回默认行为
      }
    }
    window.location.href = href;
  }

  // --------------------------------------------------------------------------
  // 出口：Node 下只导出纯函数（boot 不执行，也不碰 window）；
  //       浏览器下才真正跑一遍。这样单测不需要 jsdom / 无头浏览器。
  // --------------------------------------------------------------------------
  var IS_NODE = typeof module === 'object' && module && module.exports;

  if (IS_NODE) {
    module.exports = {
      buildPlan: buildPlan,
      renderCss: renderCss,
      detectService: detectService,
      resolvePage: resolvePage,
      normalizePage: normalizePage,
      parseQuery: parseQuery,
      rootDomain: rootDomain
    };
    return;
  }

  if (window.__tgShimBooted) return;
  window.__tgShimBooted = true;

  boot();
})();
