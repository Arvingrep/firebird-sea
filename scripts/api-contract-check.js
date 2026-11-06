#!/usr/bin/env node
// API 契约检查：代码里的路由 / fbProxy 白名单动作 ↔ docs/api/openapi.yaml 必须双向一致。
//
// 为什么要有它：docs-as-code 门禁只强制「改了代码就要动 docs/」，动的是哪一篇不管。
// 于是加一条路由、随手往别的文档里塞一行，门禁照样绿，而 OpenAPI 悄悄落后。
// 这里把「文档」收窄成机器可读的契约，两个方向都查：
//   代码有、spec 没有 → 接口没文档
//   spec 有、代码没有 → 文档描述了不存在的接口（比缺文档更坏，调用方会照着写）
//
// 零依赖：不引 yaml 库（Zero-Dep 门禁不允许），用受约束的行解析。因此 spec 必须按
// 固定缩进书写——路径键缩进 2、方法键缩进 4、x-fb-actions 条目缩进 2。
//
// 用法： node scripts/api-contract-check.js          检查，不一致则退出码 1
//        node scripts/api-contract-check.js --print  只打印从代码提取到的路由（便于手写 spec）

const fs = require('fs');
const path = require('path');

// 路由文件 → 挂载前缀。新增 router 文件必须在这里登记，否则 check() 会报「未登记」
// （fail-closed：宁可要求人改这一行，也不让新文件路由静默漏检）。
const ROUTE_SOURCES = {
  'services/api/src/server.js': '/tg-api',
  'services/api/src/addrShareRoute.js': '/tg-api/addr',
};

const SPEC_PATH = 'docs/api/openapi.yaml';
const WHITELIST_SRC = 'services/api/src/fbProxy.js';

// 只认这几种方法；router.all 单独处理（语义是「任意方法」，不展开成具体方法列表）
const METHODS = ['get', 'post', 'put', 'patch', 'delete'];

// 提取一个源文件里声明的路由。行首缩进不固定（server.js 的 fb 代理在 try 块里缩进 2 格），
// 所以不锚定 column 0；用 router.xxx(' 限定，避免把 router.use( 的子路由挂载算成路由。
function extractRoutes(src) {
  const out = [];
  const re = new RegExp(`^\\s*router\\.(${METHODS.join('|')}|all)\\(\\s*'([^']+)'`, 'gm');
  let m;
  while ((m = re.exec(src)) !== null) out.push({ method: m[1].toUpperCase(), path: m[2] });
  return out;
}

// Express 的 :id 与 OpenAPI 的 {id} 是同一件事，统一成后者再比较
const normalizePath = (p) => p.replace(/:([A-Za-z0-9_]+)/g, '{$1}');

function routeKey(method, p) {
  return `${method} ${normalizePath(p)}`;
}

// 解析 spec。返回 { routes:Set<'GET /x'>, actions:Set<'waimai:shopList'> }
function parseSpec(text) {
  const routes = new Set();
  const actions = new Set();
  let section = 'other';
  let curPath = null;

  for (const raw of String(text).split('\n')) {
    const line = raw.replace(/\t/g, '  ').replace(/\s+$/, '');
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const indent = line.length - line.trimStart().length;

    if (indent === 0) {
      curPath = null;
      if (t === 'paths:') section = 'paths';
      else if (t === 'x-fb-actions:') section = 'fb';
      else section = 'other';
      continue;
    }

    if (section === 'paths') {
      if (indent === 2 && t.endsWith(':') && t.startsWith('/')) {
        curPath = t.slice(0, -1).trim();
      } else if (indent === 4 && curPath) {
        const m = new RegExp(`^(${METHODS.join('|')}):$`).exec(t);
        if (m) routes.add(`${m[1].toUpperCase()} ${curPath}`);
      }
    } else if (section === 'fb') {
      const m = /^-\s*'?([A-Za-z]+:[A-Za-z0-9]+)'?$/.exec(t);
      if (m) actions.add(m[1]);
    }
  }
  return { routes, actions };
}

// 从 fbProxy 的 WHITELIST 对象里取 key。不能用 require：fbProxy 间接依赖 express，
// 且门禁跑在只装了生产依赖的 runner 上，require 失败会把「检查」变成「崩」。
function extractWhitelistActions(src) {
  const start = src.indexOf('const WHITELIST');
  if (start < 0) throw new Error('fbProxy.js 里找不到 WHITELIST 定义');
  const block = src.slice(start, src.indexOf('\n};', start));
  const out = new Set();
  const re = /'([A-Za-z]+:[A-Za-z0-9]+)'\s*:/g;
  let m;
  while ((m = re.exec(block)) !== null) out.add(m[1]);
  return out;
}

// 双向比对。codeRoutes:Set<'GET /x'>（router.all 记为 'ALL /x'）
function diffRoutes(codeRoutes, specRoutes) {
  const specSet = new Set(specRoutes);
  const codeSet = new Set(codeRoutes);
  const missingInSpec = [];
  const missingInCode = [];

  for (const k of codeSet) {
    const [method, p] = k.split(' ');
    if (method === 'ALL') {
      // router.all：spec 上该路径至少要有一个方法，否则等于没文档
      const hasAny = [...specSet].some((s) => s.endsWith(' ' + p));
      if (!hasAny) missingInSpec.push(`ALL ${p}`);
    } else if (!specSet.has(k)) {
      missingInSpec.push(k);
    }
  }

  for (const k of specSet) {
    const [method, p] = k.split(' ');
    if (!codeSet.has(k) && !codeSet.has(`ALL ${p}`)) missingInCode.push(`${method} ${p}`);
  }

  return { missingInSpec, missingInCode };
}

// 找「有 router.xxx(' 但没在 ROUTE_SOURCES 里登记」的文件 —— 新写的路由文件不会静默漏检
function unregisteredRouteFiles(root) {
  const dir = path.join(root, 'services/api/src');
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.js')) continue;
    const rel = `services/api/src/${f}`;
    if (ROUTE_SOURCES[rel]) continue;
    const src = fs.readFileSync(path.join(dir, f), 'utf8');
    if (extractRoutes(src).length) out.push(rel);
  }
  return out;
}

function check(root = path.join(__dirname, '..')) {
  const problems = [];
  const codeRoutes = [];

  for (const [rel, prefix] of Object.entries(ROUTE_SOURCES)) {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) {
      problems.push(`路由文件不存在：${rel}（ROUTE_SOURCES 已过期）`);
      continue;
    }
    for (const r of extractRoutes(fs.readFileSync(abs, 'utf8'))) {
      // 必须走 routeKey 归一（:id → {id}），否则同一路由会因为写法不同被当成两边各缺一条
      codeRoutes.push(routeKey(r.method, `${prefix}${r.path}`));
    }
  }

  for (const rel of unregisteredRouteFiles(root)) {
    problems.push(`文件声明了路由但未登记挂载前缀：${rel}（改 ROUTE_SOURCES）`);
  }

  const specAbs = path.join(root, SPEC_PATH);
  if (!fs.existsSync(specAbs)) {
    return { problems: [...problems, `契约文件缺失：${SPEC_PATH}`], missingInSpec: [], missingInCode: [], actionsMissing: [] };
  }
  const spec = parseSpec(fs.readFileSync(specAbs, 'utf8'));
  const { missingInSpec, missingInCode } = diffRoutes(codeRoutes, spec.routes);

  const wlAbs = path.join(root, WHITELIST_SRC);
  let actionsMissing = [];
  if (fs.existsSync(wlAbs)) {
    const wl = extractWhitelistActions(fs.readFileSync(wlAbs, 'utf8'));
    actionsMissing = [...wl].filter((a) => !spec.actions.has(a));
    for (const a of spec.actions) if (!wl.has(a)) missingInCode.push(`fb:${a}`);
  }

  return { problems, missingInSpec, missingInCode, actionsMissing };
}

function main() {
  const root = path.join(__dirname, '..');

  if (process.argv.includes('--print')) {
    const all = [];
    for (const [rel, prefix] of Object.entries(ROUTE_SOURCES)) {
      const abs = path.join(root, rel);
      if (!fs.existsSync(abs)) continue;
      for (const r of extractRoutes(fs.readFileSync(abs, 'utf8'))) all.push(`${r.method.padEnd(6)} ${prefix}${r.path}`);
    }
    console.log(all.sort().join('\n'));
    const wl = extractWhitelistActions(fs.readFileSync(path.join(root, WHITELIST_SRC), 'utf8'));
    console.log('\n# fb 白名单动作');
    console.log([...wl].sort().join('\n'));
    return 0;
  }

  const r = check(root);
  const bad = r.problems.length + r.missingInSpec.length + r.missingInCode.length + r.actionsMissing.length;
  if (!bad) {
    console.log('API 契约一致：路由与 fb 白名单动作均已收录进 ' + SPEC_PATH);
    return 0;
  }
  for (const p of r.problems) console.log('✗ ' + p);
  for (const k of r.missingInSpec) console.log(`✗ 代码有、spec 缺：${k}`);
  for (const k of r.actionsMissing) console.log(`✗ 白名单有、x-fb-actions 缺：${k}`);
  for (const k of r.missingInCode) console.log(`✗ spec 有、代码没有：${k}`);
  console.log(`\n契约不一致（${bad} 处）。改完路由请同步 ${SPEC_PATH}。`);
  return 1;
}

module.exports = { extractRoutes, parseSpec, extractWhitelistActions, diffRoutes, unregisteredRouteFiles, check, normalizePath, ROUTE_SOURCES };

if (require.main === module) process.exit(main());
