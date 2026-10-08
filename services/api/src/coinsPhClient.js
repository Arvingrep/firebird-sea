const crypto = require('crypto');
const https = require('https');

/**
 * Coins.ph Pro 交易所官方开放接口客户端
 * 官方文档: https://coins-access-api.readthedocs.io/ & https://api.pro.coins.ph
 */
class CoinsPhClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || process.env.COINS_PH_BASE_URL || 'https://api.pro.coins.ph';
    this.apiKey = options.apiKey || process.env.COINS_PH_API_KEY || '';
    this.apiSecret = options.apiSecret || process.env.COINS_PH_API_SECRET || '';
    this.rateCache = {};
  }

  /**
   * 底层 HTTP 请求封装
   */
  async _request(method, path, params = {}, headers = {}) {
    return new Promise((resolve, reject) => {
      let queryString = '';
      if (Object.keys(params).length > 0) {
        queryString = '?' + new URLSearchParams(params).toString();
      }

      const url = new URL(path + queryString, this.baseUrl);
      const reqHeaders = {
        'Content-Type': 'application/json',
        'User-Agent': 'Firebird-SEA-Client/1.0',
        ...headers
      };

      const req = https.request(url, { method, headers: reqHeaders }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(new Error(`Coins.ph API [${res.statusCode}]: ${data}`));
            }
          } catch (e) {
            reject(new Error(`Invalid JSON response: ${data}`));
          }
        });
      });

      req.on('error', (err) => reject(err));
      req.setTimeout(8000, () => {
        req.destroy();
        reject(new Error('Coins.ph request timeout'));
      });
      req.end();
    });
  }

  // =========================================================================
  // 1. 无需 Key 的公共接口 (Public API)
  // =========================================================================

  /**
   * 获取市场最新价格 (如 USDTPHP, BTCPHP)
   * GET /openapi/quote/v1/ticker/price
   * @param {string} symbol 交易对，默认 'USDTPHP'
   */
  async getTickerPrice(symbol = 'USDTPHP') {
    const res = await this._request('GET', '/openapi/quote/v1/ticker/price', { symbol });
    const price = parseFloat(res.price);
    if (!isNaN(price)) {
      this.rateCache[symbol] = {
        price,
        updatedAt: Date.now()
      };
    }
    return {
      symbol: res.symbol,
      price: price,
      raw: res
    };
  }

  /**
   * 获取市场深度 Order Book
   * GET /openapi/quote/v1/depth
   * @param {string} symbol 交易对
   * @param {number} limit 档位深度 (5, 10, 20)
   */
  async getOrderBook(symbol = 'USDTPHP', limit = 5) {
    const res = await this._request('GET', '/openapi/quote/v1/depth', { symbol, limit });
    return {
      symbol,
      lastUpdateId: res.lastUpdateId,
      bids: (res.bids || []).map(([price, qty]) => ({ price: parseFloat(price), qty: parseFloat(qty) })),
      asks: (res.asks || []).map(([price, qty]) => ({ price: parseFloat(price), qty: parseFloat(qty) }))
    };
  }

  /**
   * 获取 24 小时价格变动统计
   * GET /openapi/quote/v1/ticker/24hr
   */
  async get24hrStats(symbol = 'USDTPHP') {
    return await this._request('GET', '/openapi/quote/v1/ticker/24hr', { symbol });
  }

  // =========================================================================
  // 2. 需要 Key 的私有接口 (Private API / Authenticated)
  // =========================================================================

  /**
   * HMAC-SHA256 签名工具
   * 根据 Coins.ph Pro 规则: signature = HMAC_SHA256(queryString, apiSecret)
   */
  _sign(queryString, secret) {
    return crypto.createHmac('sha256', secret).update(queryString).digest('hex');
  }

  /**
   * 查询账户资金余额 (Account Balance)
   * GET /openapi/v1/account
   * 需带上: timestamp, recvWindow, signature 参数与 X-COINS-APIKEY 请求头
   */
  async getAccountBalance(overrideKey, overrideSecret) {
    const key = overrideKey || this.apiKey;
    const secret = overrideSecret || this.apiSecret;

    if (!key || !secret) {
      throw new Error('Missing COINS_PH_API_KEY or COINS_PH_API_SECRET');
    }

    const timestamp = Date.now();
    const recvWindow = 5000;
    const params = { timestamp, recvWindow };
    const queryString = new URLSearchParams(params).toString();
    const signature = this._sign(queryString, secret);

    const headers = {
      'X-COINS-APIKEY': key
    };

    return await this._request('GET', '/openapi/v1/account', {
      ...params,
      signature
    }, headers);
  }

  // =========================================================================
  // 3. 业务双币汇率换算逻辑 (PHP ₱ ➔ USDT)
  // =========================================================================

  /**
   * 将菲律宾比索 (PHP) 转换为 USDT
   * @param {number} phpAmount 法币比索金额
   * @returns {Promise<{ php: number, usdt: number, rate: number, cached: boolean }>}
   */
  async convertPhpToUsdt(phpAmount) {
    const cachedEntry = this.rateCache['USDTPHP'];
    let rate = cachedEntry ? cachedEntry.price : 62.88;
    let fromCache = true;

    if (!cachedEntry || Date.now() - cachedEntry.updatedAt > 30000) {
      try {
        const ticker = await this.getTickerPrice('USDTPHP');
        rate = ticker.price;
        fromCache = false;
      } catch (err) {
        console.warn('⚠️ 汇率获取失败，使用上一次缓存汇率:', err.message);
      }
    }

    const usdtAmount = Number((phpAmount / rate).toFixed(2));
    return {
      php: phpAmount,
      usdt: usdtAmount,
      rate: rate,
      cached: fromCache,
      timestamp: Date.now()
    };
  }
}

module.exports = { CoinsPhClient };
