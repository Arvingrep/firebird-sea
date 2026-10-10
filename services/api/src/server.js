require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { validateTelegramInitData } = require('./telegramAuth');
const { 
  createPaymentCharge, 
  getCharge, 
  confirmChargePaid 
} = require('./paymentManager');
const { CoinsPhClient } = require('./coinsPhClient');
const { createCheckout, coinsRateSource, CheckoutError } = require('./checkout');
const { cliConn } = require('./migrate');
const { DEMO_BOT_TOKEN, assertProductionConfig } = require('./config');

assertProductionConfig();

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || DEMO_BOT_TOKEN;
const coinsClient = new CoinsPhClient();

app.use(cors());
app.use(express.json());

// AD-9：Node 路由统一挂在 /tg-api，/api 前缀留给火鸟 PHP（含 /api/payment/notify.php）
const router = express.Router();
app.use('/tg-api', router);

// 1. 健康检查 (支持 /, /health 与 /tg-api/health 路径)
function healthHandler(req, res) {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Firebird-SEA-Core-API',
    region: 'Philippines (Manila/Cebu)'
  });
}
app.get(['/', '/health'], healthHandler);
router.get('/health', healthHandler);

// 2. Telegram Mini App 鉴权接口
router.post('/auth/tg-verify', (req, res) => {
  const { initData } = req.body;
  if (!initData) {
    return res.status(400).json({ success: false, error: 'Missing initData' });
  }

  // 开发环境下允许 mock 验证
  if (process.env.NODE_ENV === 'development' && initData === 'mock_test_user') {
    return res.json({
      success: true,
      user: {
        id: 88888888,
        first_name: 'MetroManila',
        username: 'firebird_tester',
        language_code: 'en'
      },
      mode: 'mock_development'
    });
  }

  const result = validateTelegramInitData(initData, BOT_TOKEN);
  if (!result.valid) {
    return res.status(401).json({ success: false, error: result.error });
  }

  res.json({
    success: true,
    user: result.user,
    authDate: result.authDate
  });
});

// 3. 东南亚 MVP 四大核心模块元数据
router.get('/services', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'food',
        icon: '🍜',
        nameZh: '美食外卖',
        nameEn: 'Food Delivery',
        descZh: '马尼拉/BGC/Makati 华人热销餐厅准时必达',
        descEn: 'Authentic dining delivered fast across Metro Manila',
        popularItems: [
          { id: 'f1', nameZh: '川味老火锅双人餐', nameEn: 'Sichuan Hotpot Set', pricePhp: 1200, priceUsdt: 21.5 },
          { id: 'f2', nameZh: '港式烧腊双拼饭', nameEn: 'Cantonese Roast Duo', pricePhp: 380, priceUsdt: 6.8 }
        ]
      },
      {
        id: 'errands',
        icon: '🛵',
        nameZh: '同城跑腿',
        nameEn: 'City Errands',
        descZh: '专人取送文件、代买生鲜药品、海关清关帮办',
        descEn: 'On-demand couriers & urgent errands across Manila',
        popularItems: [
          { id: 'e1', nameZh: 'BGC专人闪送 (5公里内)', nameEn: 'BGC Express Courier', pricePhp: 250, priceUsdt: 4.5 },
          { id: 'e2', nameZh: '机场/码头证件加急代递', nameEn: 'NAIA Airport Expedited Document', pricePhp: 600, priceUsdt: 10.8 }
        ]
      },
      {
        id: 'housing',
        icon: '🏢',
        nameZh: '房产租赁',
        nameEn: 'Real Estate',
        descZh: 'BGC / Makati / 趴赛 高档公寓整租、免中介费直租',
        descEn: 'Luxury Condos & Apartments for Rent/Sale in Manila',
        popularItems: [
          { id: 'h1', nameZh: 'BGC Uptown Parksuites 1BR', nameEn: 'BGC Uptown Parksuites 1BR', pricePhp: 45000, priceUsdt: 800 },
          { id: 'h2', nameZh: 'Makati Jazz Residences Studio', nameEn: 'Makati Jazz Residences Studio', pricePhp: 22000, priceUsdt: 390 }
        ]
      },
      {
        id: 'jobs',
        icon: '💼',
        nameZh: '招聘求职',
        nameEn: 'Jobs & Careers',
        descZh: '中英双语客服、技术研发、财务人事急聘直聊',
        descEn: 'Bilingual Tech, CS & Admin Careers in SEA',
        popularItems: [
          { id: 'j1', nameZh: '双语高级客服专家 (月薪 80k-120k PHP)', nameEn: 'Bilingual Customer Specialist', pricePhp: 0, priceUsdt: 0 },
          { id: 'j2', nameZh: '资深全栈工程师 (Remote / Pasay)', nameEn: 'Senior Fullstack Engineer', pricePhp: 0, priceUsdt: 0 }
        ]
      }
    ]
  });
});

// 4. 发起 USDT 支付申请
router.post('/payment/create-charge', (req, res) => {
  const { orderId, amountUsdt, network = 'TRC-20' } = req.body;
  
  if (!orderId || !amountUsdt || amountUsdt <= 0) {
    return res.status(400).json({ success: false, error: 'Invalid orderId or amount' });
  }

  const charge = createPaymentCharge(orderId, Number(amountUsdt), network);
  res.json({
    success: true,
    data: charge
  });
});

// 4b. 收银台：汇率快照 + 尾数分配（Story 2.1，落库 fbs_charge）
const checkoutHits = new Map(); // tg user id -> 最近一次窗口内的请求时间戳
const CHECKOUT_LIMIT = 5;
const CHECKOUT_WINDOW_MS = 60 * 1000;

router.post('/checkout', async (req, res) => {
  // phpCentavos 目前由客户端提交且无订单归属校验：服务端可读订单金额前默认关闭
  if (process.env.CHECKOUT_ENABLED !== '1') {
    return res.status(503).json({ success: false, error: { code: 'CHECKOUT_DISABLED', message: '收银台暂未开放' } });
  }
  const { ordernum, phpCentavos, idempotencyKey } = req.body || {};
  const initData = req.get('x-telegram-init-data') || (req.body && req.body.initData);
  const auth = validateTelegramInitData(initData, BOT_TOKEN);
  if (!auth.valid || !auth.user || !auth.user.id) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: auth.error || 'invalid initData' } });
  }
  const nowMs = Date.now();
  const hits = (checkoutHits.get(auth.user.id) || []).filter((t) => nowMs - t < CHECKOUT_WINDOW_MS);
  if (hits.length >= CHECKOUT_LIMIT) {
    return res.status(429).json({ success: false, error: { code: 'RATE_LIMITED', message: '请求过于频繁，请稍后再试' } });
  }
  hits.push(nowMs);
  checkoutHits.set(auth.user.id, hits);
  for (const [uid, ts] of checkoutHits) {
    if (nowMs - ts[ts.length - 1] >= CHECKOUT_WINDOW_MS) checkoutHits.delete(uid);
  }
  try {
    const data = await createCheckout(cliConn(), {
      ordernum,
      phpCentavos,
      idempotencyKey: idempotencyKey || null,
      getRate: coinsRateSource(coinsClient),
      address: process.env.TRON_MASTER_RECEIVE_ADDRESS || '',
    });
    res.json({ success: true, data });
  } catch (err) {
    if (!(err instanceof CheckoutError)) {
      process.stderr.write(`${JSON.stringify({ level: 'error', route: 'checkout', ordernum, message: err.message })}\n`);
      return res.status(500).json({ success: false, error: { code: 'INTERNAL', message: 'checkout failed' } });
    }
    const status = err.code === 'BAD_REQUEST' ? 400 : err.code === 'ORDER_EXISTS' ? 409 : 503;
    res.status(status).json({ success: false, error: { code: err.code, message: err.message } });
  }
});

// 5. 轮询支付状态
router.get('/payment/status/:chargeId', (req, res) => {
  const charge = getCharge(req.params.chargeId);
  if (!charge) {
    return res.status(404).json({ success: false, error: 'Charge not found' });
  }
  res.json({
    success: true,
    data: charge
  });
});

// 6. 模拟测试对账回调 (用于无链上手续费时的开发调试)
if (process.env.NODE_ENV !== 'production') router.post('/payment/mock-webhook', (req, res) => {
  const { chargeId, txHash } = req.body;
  const hash = txHash || `mock_tx_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const result = confirmChargePaid(chargeId, hash);
  
  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json({
    success: true,
    message: 'Payment simulated successfully',
    charge: result.charge
  });
});

// 7. Coins.ph 官方行情汇率 (Public API)
router.get('/rates/coins-ph', async (req, res) => {
  const symbol = req.query.symbol || 'USDTPHP';
  try {
    const ticker = await coinsClient.getTickerPrice(symbol);
    const depth = await coinsClient.getOrderBook(symbol, 5);
    res.json({
      success: true,
      data: {
        symbol: ticker.symbol,
        price: ticker.price,
        orderBook: depth
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. 菲律宾比索 ➔ USDT 实时换算接口
router.get('/rates/convert', async (req, res) => {
  const php = parseFloat(req.query.php || '0');
  if (php <= 0) {
    return res.status(400).json({ success: false, error: 'Invalid php amount' });
  }
  try {
    const result = await coinsClient.convertPhpToUsdt(php);
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Coins.ph 账户余额查询 (Private API / HMAC-SHA256 鉴权)
router.get('/wallet/coins-ph/balance', async (req, res) => {
  try {
    const balance = await coinsClient.getAccountBalance();
    res.json({
      success: true,
      data: balance
    });
  } catch (err) {
    res.status(400).json({ 
      success: false, 
      error: err.message,
      tip: '请在 .env 中正确配置 COINS_PH_API_KEY 与 COINS_PH_API_SECRET' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Firebird SEA Core API is listening on port ${PORT}`);
  console.log(`📍 Serving Metro Manila (PHP & USDT Settlements)`);
});
