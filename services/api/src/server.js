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
const { runCallTest } = require('./callTest');
const { createCheckoutRouter } = require('./checkoutRoute');
const { coinsRateSource } = require('./checkout');
const { cliConn } = require('./migrate');
const { DEMO_BOT_TOKEN, assertProductionConfig } = require('./config');
const { createTokenService, createLimiter } = require('./tmaToken');
const { createMemberMap } = require('./memberMap');
const { createLoginService } = require('./loginService');
const gatewayClient = require('./gatewayClient');
const { createFbProxy } = require('./fbProxy');
const { createAddrShareRouter } = require('./addrShareRoute');
const { createCredentialProvider } = require('./credentialProvider');
const { createRevocationStore, createReplayCounter, createIdempotencyStore } = require('./sharedState');

assertProductionConfig();

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || DEMO_BOT_TOKEN;
const coinsClient = new CoinsPhClient();

// H2：置于 Traefik 之后，按配置的跳数信任 X-Forwarded-For，否则 req.ip 为 LB 地址（匿名限流变全局单桶）
if (process.env.TRUST_PROXY_HOPS) app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS));
// M4：CORS 白名单（逗号分隔 origin）；未配置时保持原行为，避免破坏既有调用方
const corsOrigins = (process.env.CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors(corsOrigins.length ? { origin: corsOrigins } : undefined));
// urlencoded 与 json 必须同时挂：TMA 前端 fbClient.post 走 application/x-www-form-urlencoded
// （fbClient.js:57），缺 urlencoded 时 req.body 恒为 {}，所有写接口（地址/下单/取消）字段全部丢失，
// 上游只会回「请输入联系人」一类误导性错误（2026-10-26 canary 实测）。
app.use(express.urlencoded({ extended: true }));
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
const allowLegacyVerify = createLimiter({ max: 30, windowSeconds: 60 });
router.post('/auth/tg-verify', (req, res) => {
  if (!allowLegacyVerify(req.ip)) return res.status(429).json({ success: false, error: 'Too many requests' });
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

// 2b. TMA 登录（T2.1–T2.3）：验签 → 映射火鸟会员 → 签发短期令牌。令牌密钥/环境来自环境变量（AD-13）。
function buildAuth() {
  const secret = process.env.TMA_TOKEN_SECRET;
  const env = process.env.TMA_ENV;
  if (!secret || !env || !process.env.FBS_GATEWAY_URL || !process.env.FBS_GATEWAY_SECRET || !process.env.DB_HOST) return null;
  const gwCfg = { baseUrl: process.env.FBS_GATEWAY_URL, secret: process.env.FBS_GATEWAY_SECRET };
  // 吊销、重放计数、幂等占位放共享库，api 可多副本运行（决定 3=B）
  const conn = cliConn();
  const revocation = createRevocationStore({ conn });
  revocation.start();
  const tokens = createTokenService({ secret, env, ttlSeconds: Number(process.env.TMA_TOKEN_TTL || 900), revocation });
  const memberMap = createMemberMap({
    conn,
    gateway: { memberFindOrCreate: (p) => gatewayClient.memberFindOrCreate(gwCfg, p) }
  });
  const credentialProvider = createCredentialProvider({
    gateway: { issueSession: (p) => gatewayClient.issueSession(gwCfg, p) }
  });
  const idempotencyStore = createIdempotencyStore({ conn });
  const loginService = createLoginService({
    botToken: BOT_TOKEN,
    tokens,
    memberMap,
    allowLogin: createLimiter({ max: Number(process.env.TMA_LOGIN_MAX || 10), windowSeconds: 60 }),
    allowReplay: createReplayCounter({ conn, max: Number(process.env.TMA_REPLAY_MAX || 5), ttlSeconds: 3600 })
  });
  return { tokens, loginService, credentialProvider, idempotencyStore };
}
const auth = buildAuth();

router.post('/auth/telegram', async (req, res) => {
  if (!auth) {
    return res.status(503).json({ success: false, error: { code: 'AUTH_NOT_CONFIGURED', message: 'TMA auth not configured' } });
  }
  try {
    const r = await auth.loginService.login(req.body && req.body.initData);
    res.status(r.status).json(r.body);
  } catch (err) {
    // 只记消息不记 initData（含可复用凭证），避免日志成为二次泄漏面；
    // 没有这行时线上表现为 502 + 空日志，只能逐层进容器复现（2026-10-26 排障实录）
    console.error('[auth/telegram] login failed:', String((err && err.message) || err).slice(0, 300));
    res.status(502).json({ success: false, error: { code: 'LOGIN_FAILED', message: 'Login temporarily unavailable' } });
  }
});

router.post('/auth/logout', async (req, res) => {
  if (!auth) return res.status(503).json({ success: false, error: { code: 'AUTH_NOT_CONFIGURED', message: 'TMA auth not configured' } });
  const m = /^Bearer (.+)$/.exec(req.get('authorization') || '');
  try {
    const ok = m ? await auth.tokens.revokeAsync(m[1]) : false;
    res.status(ok ? 200 : 401).json({ success: ok });
  } catch (err) {
    res.status(502).json({ success: false, error: { code: 'LOGOUT_FAILED', message: 'Please retry' } });
  }
});

// 2c. 火鸟白名单代理（T3.1/T3.3）：/tg-api/fb/:service/:action → 上游 ajax.php；默认拒绝（AD-20）。
// credentialProvider（T3.2）未配置前，member 级接口返回 503；首轮白名单仅匿名只读。
const fbUpstream = process.env.FB_UPSTREAM_URL;
if (fbUpstream) {
  const proxy = createFbProxy({
    upstreamBase: fbUpstream,
    tokens: auth ? auth.tokens : { verify: () => ({ valid: false }) },
    credentialProvider: auth ? auth.credentialProvider : null,
    idempotencyStore: auth ? auth.idempotencyStore : null,
    allow: createLimiter({ max: Number(process.env.FB_RATE_MAX || 120), windowSeconds: 60 }),
    // 写接口（下单/取消/地址增删改）单独、更紧的配额，避免刷单骚扰商家
    allowWrite: createLimiter({ max: Number(process.env.FB_WRITE_RATE_MAX || 20), windowSeconds: 60 })
  });
  router.all('/fb/:service/:action', async (req, res) => {
    if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ success: false });
    const r = await proxy.handle({
      service: req.params.service,
      action: req.params.action,
      query: req.query,
      method: req.method,
      body: req.body,
      headers: { authorization: req.get('authorization'), 'idempotency-key': req.get('idempotency-key') },
      clientKey: req.ip
    });
    res.status(r.status).json(r.body);
  });
}

// 2e. 地址分享（代下单）：生成 t.me 深链凭一次性 token 传递地址快照。
// 创建需登录令牌（限流更紧）；读取凭 token 公开（限流放宽），不暴露 uid。
if (auth) {
  router.use('/addr', createAddrShareRouter({
    conn: cliConn(),
    tokens: auth.tokens,
    botToken: BOT_TOKEN,
    allowCreate: createLimiter({ max: Number(process.env.TMA_SHARE_MAX || 10), windowSeconds: 60 }),
    allowRead: createLimiter({ max: Number(process.env.TMA_SHARE_READ_MAX || 60), windowSeconds: 60 }),
  }));
}

// 2d. TMA 静态资源（T3.4）：同域 /tma/ 由 api 托管构建产物，不新增部署单元（AD-16）。仅在目录存在时挂载。
const tmaStaticDir = process.env.TMA_STATIC_DIR;
if (tmaStaticDir && require('node:fs').existsSync(tmaStaticDir)) {
  // CSP：脚本只允许自身与 Telegram 官方脚本；只允许被 Telegram 内嵌；连接仅限同源（代理）
  const TMA_CSP = "default-src 'self'; script-src 'self' https://telegram.org https://maps.googleapis.com https://maps.gstatic.com; style-src 'self' 'unsafe-inline' https://maps.googleapis.com; " +
    "img-src 'self' data: https:; connect-src 'self' https://maps.googleapis.com; frame-ancestors https://web.telegram.org https://*.telegram.org; base-uri 'self'";
  app.use('/tma', (req, res, next) => {
    res.setHeader('Content-Security-Policy', TMA_CSP);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    next();
  });
  app.use('/tma', express.static(tmaStaticDir, {
    index: 'index.html',
    maxAge: '1h',
    setHeaders(res, file) { if (file.endsWith('index.html')) res.setHeader('Cache-Control', 'no-cache'); }
  }));
  app.get('/tma', (req, res) => res.redirect(301, '/tma/'));
}

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

// 4b. 收银台：服务端读订单金额与归属 + 尾数分配（Story 2.1，落库 fbs_charge；路由实现见 checkoutRoute.js）
router.post('/checkout', createCheckoutRouter({
  env: process.env,
  conn: cliConn,
  getRate: coinsRateSource(coinsClient),
  validateInitData: validateTelegramInitData,
  botToken: BOT_TOKEN,
  coinsClient,
}));

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

// 10. Call test 语音呼叫测试（失败自动重试 2 次，间隔 3s）
let callTestBusy = false;
router.post('/call-test', async (req, res) => {
  const { initData, to, message } = req.body || {};
  const auth = initData ? validateTelegramInitData(initData, BOT_TOKEN) : { valid: false };
  if (!auth.valid) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or missing initData' } });
  }
  const url = process.env.CALL_TEST_URL;
  if (!url) {
    return res.status(503).json({ success: false, error: { code: 'CALL_TEST_NOT_CONFIGURED', message: 'CALL_TEST_URL is not set' } });
  }
  if (callTestBusy) {
    return res.status(429).json({ success: false, error: { code: 'CALL_TEST_BUSY', message: 'A call test is already running' } });
  }
  callTestBusy = true;
  try {
    const result = await runCallTest(url, { to, message });
    if (!result.passed) {
      return res.status(502).json({ success: false, error: { code: 'CALL_TEST_FAILED', message: result.error }, data: { attempts: result.attempts } });
    }
    res.json({ success: true, data: { attempts: result.attempts } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
  } finally {
    callTestBusy = false;
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Firebird SEA Core API is listening on port ${PORT}`);
  console.log(`📍 Serving Metro Manila (PHP & USDT Settlements)`);
});
