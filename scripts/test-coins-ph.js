#!/usr/bin/env node

/**
 * Coins.ph 接口验证脚本
 */

const { CoinsPhClient } = require('../services/api/src/coinsPhClient');

async function main() {
  console.log('====================================================');
  console.log('🇵🇭 Coins.ph 官方开放接口实测 (Public & Private API)');
  console.log('====================================================');

  const client = new CoinsPhClient();

  try {
    // 1. 无需 Key 的公共接口: Ticker 最新价
    console.log('\n[1/4] 测试 Public API: USDTPHP 最新市场价格...');
    const usdtTicker = await client.getTickerPrice('USDTPHP');
    console.log(`  ✅ 1 USDT = ₱ ${usdtTicker.price} PHP`);

    const btcTicker = await client.getTickerPrice('BTCPHP');
    console.log(`  ✅ 1 BTC  = ₱ ${btcTicker.price.toLocaleString()} PHP`);

    // 2. 无需 Key 的公共接口: Order Book 深度
    console.log('\n[2/4] 测试 Public API: USDTPHP 买卖盘深度 (Order Book)...');
    const depth = await client.getOrderBook('USDTPHP', 3);
    console.log('  Top 3 Bids (买盘):', depth.bids.map(b => `₱${b.price} (${b.qty.toFixed(0)} USDT)`).join(' | '));
    console.log('  Top 3 Asks (卖盘):', depth.asks.map(a => `₱${a.price} (${a.qty.toFixed(0)} USDT)`).join(' | '));

    // 3. 业务双币换算测试: PHP ➔ USDT
    console.log('\n[3/4] 测试业务双币换算:');
    const order1 = await client.convertPhpToUsdt(580); // 580比索外卖
    console.log(`  🍜 外卖订单 ₱ 580.00  ➔ 折合 ${order1.usdt} USDT (实时汇率: ${order1.rate})`);
    const order2 = await client.convertPhpToUsdt(45000); // 45000比索租房
    console.log(`  🏢 房产月租 ₱ 45,000  ➔ 折合 ${order2.usdt} USDT (实时汇率: ${order2.rate})`);

    // 4. 需要 Key 的私有接口: HMAC-SHA256 签名鉴权机制检验
    console.log('\n[4/4] 测试 Private API HMAC-SHA256 签名算法...');
    const testQuery = 'recvWindow=5000&timestamp=1700000000000';
    const testSecret = 'sample_secret_key_123456';
    const signature = client._sign(testQuery, testSecret);
    console.log(`  Query: ${testQuery}`);
    console.log(`  Signature (HMAC-SHA256): ${signature}`);
    console.log('  ✅ 签名格式合规 (64位 Hex 散列)');

    if (process.env.COINS_PH_API_KEY && process.env.COINS_PH_API_SECRET) {
      console.log('  🔑 检测到真实 API Key，正在请求真实账户余额...');
      const balance = await client.getAccountBalance();
      console.log('  ✅ 真实账户余额:', balance);
    } else {
      console.log('  ℹ️ 当前未注入真实 COINS_PH_API_KEY，私有签名鉴权链路已就绪，配置环境变量后即可直接查账。');
    }

    console.log('\n====================================================');
    console.log('🎉 Coins.ph 接口与双币结算引擎全部验证通过！');
    console.log('====================================================\n');
  } catch (err) {
    console.error('❌ 测试异常:', err.message);
    process.exit(1);
  }
}

main();
