const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  extractRoutes, parseSpec, extractWhitelistActions, diffRoutes,
  unregisteredRouteFiles, normalizePath, check, ROUTE_SOURCES,
} = require('../../../scripts/api-contract-check');

// 检查器本身要能被信任：如果它漏认路由，CI 会给「契约一致」的假绿，
// 比没有这道门禁更糟（和合并表那次的静默空集是同一类错误）。

test('extractRoutes：认缩进的路由，不把 router.use 的子路由挂载算成路由', () => {
  const src = [
    "router.get('/health', h);",
    "  router.all('/fb/:service/:action', async (q) => {});",   // 缩进 2（在 try 块里）
    "router.use('/addr', sub);",                               // 挂载，不是路由
    "router.post('/checkout', handler);",
  ].join('\n');
  const r = extractRoutes(src);
  assert.deepStrictEqual(r.map((x) => `${x.method} ${x.path}`), [
    'GET /health',
    'ALL /fb/:service/:action',
    'POST /checkout',
  ]);
});

test('normalizePath：Express :id 与 OpenAPI {id} 归一', () => {
  assert.strictEqual(normalizePath('/payment/status/:chargeId'), '/payment/status/{chargeId}');
  assert.strictEqual(normalizePath('/a/{b}/c'), '/a/{b}/c'); // 已是 OpenAPI 写法，不应二次改写
});

test('parseSpec：按缩进取路径/方法，并单独取 x-fb-actions', () => {
  const spec = [
    'openapi: 3.0.3',
    'paths:',
    '  /tg-api/health:',
    '    get:',
    '      summary: x',
    '  /tg-api/deal:',
    '    post:',
    '      summary: y',
    '    get:',
    '      summary: z',
    'x-fb-actions:',
    "  - 'waimai:deal'",
    '  - waimai:order',
    'components:',
    '  securitySchemes:',
    '    bearerAuth:',
    '      type: http',
  ].join('\n');
  const { routes, actions } = parseSpec(spec);
  assert.deepStrictEqual([...routes].sort(), ['GET /tg-api/deal', 'GET /tg-api/health', 'POST /tg-api/deal']);
  // 带引号与不带引号都要认（yaml 两种都合法），但 components 下的键不能混进来
  assert.deepStrictEqual([...actions].sort(), ['waimai:deal', 'waimai:order']);
});

test('diffRoutes：两个方向都要报，router.all 只要有任一个方法就算有文档', () => {
  const r = diffRoutes(
    ['GET /a', 'POST /b', 'ALL /fb/{service}/{action}'],
    ['GET /a', 'GET /fb/{service}/{action}', 'POST /gone'],
  );
  assert.deepStrictEqual(r.missingInSpec, ['POST /b']);
  assert.deepStrictEqual(r.missingInCode, ['POST /gone']);

  // all 只写了 get 也算覆盖（不强迫把 5 个方法都写一遍）
  const r2 = diffRoutes(['ALL /fb/{s}/{a}'], ['DELETE /fb/{s}/{a}']);
  assert.deepStrictEqual(r2.missingInSpec, []);
  // 但该路径一个方法都没有 → 等于没文档
  const r3 = diffRoutes(['ALL /fb/{s}/{a}'], ['GET /other']);
  assert.deepStrictEqual(r3.missingInSpec, ['ALL /fb/{s}/{a}']);
});

test('extractWhitelistActions：只取 WHITELIST 块内的 key，不误吃别处的常量', () => {
  const src = [
    "const TIMEOUT = 5000;",
    "const WHITELIST = {",
    "  'waimai:shopList': { auth: 'anonymous', params: ['page'] },",
    "  'waimai:deal': { auth: 'member', write: true },",
    "};",
    "const OTHER = { 'nope:nope': 1 };",
  ].join('\n');
  assert.deepStrictEqual([...extractWhitelistActions(src)].sort(), ['waimai:deal', 'waimai:shopList']);
});

test('unregisteredRouteFiles：新写的路由文件没登记挂载前缀要被揪出来', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'apicontract-'));
  const dir = path.join(root, 'services/api/src');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'rogueRoute.js'), "router.get('/x', h);\n");
  fs.writeFileSync(path.join(dir, 'noRoutes.js'), 'module.exports = {};\n');
  // 已登记的文件不报（用真实文件名，内容随便）
  const known = path.basename(Object.keys(ROUTE_SOURCES)[0]);
  fs.writeFileSync(path.join(dir, known), "router.get('/known', h);\n");
  assert.deepStrictEqual(unregisteredRouteFiles(root), ['services/api/src/rogueRoute.js']);
  fs.rmSync(root, { recursive: true, force: true });
});

test('本仓库当前状态：路由与白名单已全部收录进 openapi.yaml', () => {
  const r = check(path.join(__dirname, '../../..'));
  assert.deepStrictEqual(r.problems, []);
  assert.deepStrictEqual(r.missingInSpec, []);
  assert.deepStrictEqual(r.missingInCode, []);
  assert.deepStrictEqual(r.actionsMissing, []);
});
