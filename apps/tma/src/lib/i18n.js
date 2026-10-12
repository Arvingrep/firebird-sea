// T4.1：中英双语，默认中文；缺失 key 回退中文再回退 key 本身。
const MESSAGES = {
  zh: {
    'app.title': '外卖',
    'nav.food': '外卖',
    'nav.cart': '购物车',
    'shop.open': '营业中',
    'shop.closed': '休息中',
    'shop.minOrder': '起送',
    'shop.deliveryFee': '配送费',
    'shop.empty': '暂无商家',
    'shop.loadFailed': '加载失败，请重试',
    'menu.empty': '暂无菜品',
    'cart.title': '购物车',
    'cart.empty': '购物车是空的',
    'cart.total': '合计',
    'cart.clear': '清空',
    'cart.add': '加入购物车',
    'cart.switchShopTitle': '切换商家',
    'cart.switchShopMsg': '购物车里有其他商家的菜品，是否清空后再添加？',
    'cart.checkout': '去下单',
    'common.retry': '重试',
    'common.loading': '加载中…',
    'auth.reopen': '请从 Telegram 重新打开小程序',
    'lang.switch': 'EN',
  },
  en: {
    'app.title': 'Food',
    'nav.food': 'Food',
    'nav.cart': 'Cart',
    'shop.open': 'Open',
    'shop.closed': 'Closed',
    'shop.minOrder': 'Min order',
    'shop.deliveryFee': 'Delivery',
    'shop.empty': 'No restaurants yet',
    'shop.loadFailed': 'Failed to load. Please retry',
    'menu.empty': 'No dishes yet',
    'cart.title': 'Cart',
    'cart.empty': 'Your cart is empty',
    'cart.total': 'Total',
    'cart.clear': 'Clear',
    'cart.add': 'Add to cart',
    'cart.switchShopTitle': 'Switch restaurant',
    'cart.switchShopMsg': 'Your cart has items from another restaurant. Clear it and add this one?',
    'cart.checkout': 'Checkout',
    'common.retry': 'Retry',
    'common.loading': 'Loading…',
    'auth.reopen': 'Please reopen the Mini App from Telegram',
    'lang.switch': '中文',
  },
};

export function createI18n(initial = 'zh') {
  let lang = initial in MESSAGES ? initial : 'zh';
  return {
    get lang() { return lang; },
    setLang(l) { if (l in MESSAGES) lang = l; },
    t(key) { return MESSAGES[lang][key] ?? MESSAGES.zh[key] ?? key; },
  };
}

// 默认中文；Telegram 语言设置为 en 时用英文？—— 需求是"默认中文"，故仅在用户手动切换时变为英文。
export const DEFAULT_LANG = 'zh';
export const MESSAGE_KEYS = Object.keys(MESSAGES.zh);
export const EN_KEYS = Object.keys(MESSAGES.en);
