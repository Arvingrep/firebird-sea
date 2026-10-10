// Story 1.3 路由前缀与生产配置自检（AD-9 / AD-13）
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { validateProductionConfig, assertProductionConfig } = require('../src/config');

const root = path.join(__dirname, '../../..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const good = {
  NODE_ENV: 'production',
  TELEGRAM_BOT_TOKEN: '123456:real-looking-token',
  TRON_MASTER_RECEIVE_ADDRESS: 'TLsV52sRDL79HXGGm9yzwKibb6BeruhUzy'
};

test('AC1 Traefik 把 /tg-api 交给 Node，不再占用 /api', () => {
  const ing = read('deploy/helm/firebird-site/templates/ingressroute.yaml');
  assert.match(ing, /PathPrefix\(`\/tg-api`\)/);
  assert.doesNotMatch(ing, /PathPrefix\(`\/api`\)/);
});

test('AC1 Node 业务路由全部注册在 /tg-api 路由器下，不再直接注册 /api/*', () => {
  const src = read('services/api/src/server.js');
  assert.match(src, /app\.use\('\/tg-api', router\)/);
  assert.doesNotMatch(src, /app\.(get|post)\('\/api\//);
  assert.doesNotMatch(src, /router\.(get|post)\('\/api\//);
  for (const r of ['/auth/tg-verify', '/services', '/payment/create-charge', '/payment/status/:chargeId', '/rates/convert', '/wallet/coins-ph/balance']) {
    assert.ok(src.includes(`'${r}'`), `缺少路由 ${r}`);
  }
});

test('AC2 生产环境：演示令牌被拒绝', () => {
  const errs = validateProductionConfig({ ...good, TELEGRAM_BOT_TOKEN: 'DEMO_BOT_TOKEN_123456' });
  assert.ok(errs.some((e) => /TELEGRAM_BOT_TOKEN/.test(e)));
});

test('AC2 生产环境：占位符收款地址被拒绝', () => {
  const errs = validateProductionConfig({ ...good, TRON_MASTER_RECEIVE_ADDRESS: 'TW4Q8tq6U1z3wWkEXAMPLETRONADDR9999' });
  assert.ok(errs.some((e) => /TRON_MASTER_RECEIVE_ADDRESS/.test(e)));
});

test('AC2 生产环境：缺少必填变量时 assertProductionConfig 抛出明确错误', () => {
  assert.throws(() => assertProductionConfig({ NODE_ENV: 'production' }), /缺少必填环境变量 TELEGRAM_BOT_TOKEN[\s\S]*TRON_MASTER_RECEIVE_ADDRESS/);
});

test('AC2 合法生产配置与非生产环境均放行', () => {
  assert.deepStrictEqual(validateProductionConfig(good), []);
  assert.deepStrictEqual(validateProductionConfig({ NODE_ENV: 'development' }), []);
});

test('AC2 mock-webhook 在生产环境不注册', () => {
  const src = read('services/api/src/server.js');
  assert.match(src, /NODE_ENV !== 'production'\) router\.post\('\/payment\/mock-webhook'/);
});

test('AC3 Helm api 模板经 Secret 注入 Telegram / Coins.ph / TronGrid 密钥', () => {
  const dep = read('deploy/helm/firebird-site/templates/deployment-api.yaml');
  for (const k of ['TELEGRAM_BOT_TOKEN', 'COINS_PH_API_KEY', 'COINS_PH_API_SECRET', 'TRONGRID_API_KEY']) {
    assert.ok(dep.includes(`"${k}"`), `未注入 ${k}`);
  }
  assert.match(dep, /secretKeyRef/);
});
