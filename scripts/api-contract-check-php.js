#!/usr/bin/env node
// PHP 接口契约检查：webroot/api/handlers/*.class.php 的 public 方法 ↔ docs/api/openapi-waimai-article.yaml 双向一致。
//
// 为什么要有它：docs/api/README.md 原先写着这份接口文档「❌ 纯文档，靠 Review」。
// 而 docs-as-code 门禁只要求「改了代码就动 docs/」，动哪一篇不管——于是在 waimai.class.php
// 里加一个 public function 就是一条新接口，随手往别的文档写一行，门禁照样绿，
// 而 swagger.html 与 openapi-waimai-article.yaml 悄悄落后。调用方照着旧文档写，联调时才发现。
//
// 判据（与 JS 版 api-contract-check.js 同构，两个方向都查）：
//   代码有、文档没有 → 接口没文档
//   文档有、代码没有 → 文档描述了不存在的接口（比缺文档更坏）
//
// 覆盖范围怎么定：handlers 目录 34 个 *.class.php，减去分发器 handlers.class.php 后
// 是 33 个 service（其中 task 没有任何 public 方法，不占欠债名额）。目前只有 waimai / article 纳入契约。
// 不搞「一次全量补齐」——那会让门禁立刻 3000+ 条报错，人只会绕过它。所以：
//   · 契约里已出现的 service → 双向硬校验，不一致即 FAIL；
//   · 尚未纳入的 service → 记「欠债」，必须在 .agents/api-contract-debt.txt 登记到期日，
//     未登记或已过期即 FAIL（沿用密钥欠债同款台账模式，见 gates.sh 第 8 项）。
// 这样新增 service 只有两条合法出路：写进契约，或登记一个带到期日的欠债。二者都留痕。
//
// 零依赖：不引 yaml 库（Zero-Dep 门禁不允许），用受约束的行解析。因此 spec 的 path 键
// 必须缩进 2 空格、形如 `/waimai/shopList:`。
//
// 用法： node scripts/api-contract-check-php.js           检查，不一致则退出码 1
//        node scripts/api-contract-check-php.js --print   只打印从代码提取到的接口（便于手写 spec）
//        node scripts/api-contract-check-php.js --strict-debt  欠债也算不一致（清账后的收紧开关）

const fs = require('fs');
const path = require('path');

const SPEC_PATH = 'docs/api/openapi-waimai-article.yaml';
const HANDLER_DIR = 'webroot/api/handlers';
const DEBT_PATH = '.agents/api-contract-debt.txt';

// 分发器自身（webroot/include/ajax.php 里 new handlers($service,$action)）不是 service，排除
const NOT_A_SERVICE = new Set(['handlers']);

// 剥 PHP 注释后再提方法名：注释里出现 `public function foo()` 的示例（本文档自己就有）
// 会被算成真接口，那种假红最难查。
function stripPhpComments(src) {
  const s = String(src);
  let out = '';
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    const d = s[i + 1];
    // 字符串字面量原样保留：里面有 `/*` 的（glob 路径、SQL 片段都常见）
    // 若按正则整体剥注释，会把字符串后半段当注释开头，**吞掉后面的方法**——漏报不留痕。
    if (c === "'" || c === '"') {
      out += c; i += 1;
      while (i < s.length) {
        if (s[i] === '\\') { out += s[i] + (s[i + 1] || ''); i += 2; continue; }
        out += s[i];
        if (s[i] === c) { i += 1; break; }
        i += 1;
      }
      continue;
    }
    if (c === '/' && d === '*') {
      const end = s.indexOf('*/', i + 2);
      i = end === -1 ? s.length : end + 2;
      out += ' ';
      continue;
    }
    if ((c === '/' && d === '/') || c === '#') {
      const end = s.indexOf('\n', i);
      i = end === -1 ? s.length : end;   // 保留换行，行号不变
      continue;
    }
    out += c; i += 1;
  }
  return out;
}

// 提取 public 方法。只认行首可选的修饰符 + public function，
// 避免把 `->public`、字符串里的同名片段算进来。
// 修饰符必须放宽，而且**不能要求写 `public`**：
//   · `public static function`（house.class.php 就有一个）、`final public function` 都合法；
//   · PHP 里 `function foo()` 不写可见性 = public。分发器 handlers::getHandle 是
//     `method_exists()` + `$obj->$action()` 动态调用，所以这类方法**也是对外接口**。
//     article.class.php:1539 `getCommonList()`、:2413 `rewardList()` 就是（此前被漏掉，
//     导致「143 个接口零差异」这个结论本身是错的——真实是 145）。
// `private function` / `protected function` 不会命中：修饰符白名单里没有它们。
// 已知未覆盖：heredoc/nowdoc 里含引号可能让剥注释提前收尾（极少见，见 #192）。
// 只收**类体里**的方法：一个 handler 文件里可能还有类外的顶层函数（工具函数、
// 兼容旧入口的 shim），它们不是 action——`handlers::getHandle()` 走的是
// `new $service()` + `$obj->$action()`，类外函数调不到。
// 做法：逐行扫花括号深度，记住 class 打开时的深度，只接受深度正好等于它的 function。
// 找不到 class 声明时**不做过滤**（classDepth<0），宁可多报也不静默漏报——
// 多报会被看见，漏报不会。
function extractActions(src) {
  const out = [];
  const re = /^[ \t]*(?:(?:final|abstract)\s+)*(?:public\s+)?(?:static\s+)?function\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/;
  const classRe = /^[ \t]*(?:(?:final|abstract)\s+)?class\s+[A-Za-z_][A-Za-z0-9_]*/;
  const clean = stripPhpComments(src);
  let depth = 0;
  let classDepth = -1;
  let classPending = false;
  for (const line of clean.split('\n')) {
    const m = re.exec(line);
    if (m && m[1] !== '__construct' && (classDepth < 0 || depth === classDepth)) out.push(m[1]);
    const isClassLine = classRe.test(line);
    for (const ch of line) {
      if (ch === '{') depth += 1;
      else if (ch === '}') depth -= 1;
    }
    if (isClassLine) {
      if (line.includes('{')) classDepth = depth;   // `class x {` 与 class 同行
      else classPending = true;                      // 花括号在下一行
    } else if (classPending && depth > 0) {
      classDepth = depth;
      classPending = false;
    }
  }
  return out;
}

// 解析 spec：返回 Map<service, Set<action>>
function parseSpec(text) {
  const map = new Map();
  let cur = null;
  for (const raw of String(text).split('\n')) {
    const line = raw.replace(/\t/g, '  ').replace(/\s+$/, '');
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const indent = line.length - line.trimStart().length;
    if (indent !== 2 || !t.startsWith('/') || !t.endsWith(':')) continue;
    const p = t.slice(0, -1).trim();
    const m = /^\/([A-Za-z0-9_]+)\/([A-Za-z0-9_]+)$/.exec(p);
    if (!m) continue;
    cur = m[1];
    if (!map.has(cur)) map.set(cur, new Set());
    map.get(cur).add(m[2]);
  }
  return map;
}

// 台账：<service> <YYYY-MM-DD> <原因>；# 开头为注释
function parseDebt(text) {
  const map = new Map();
  for (const raw of String(text).split('\n')) {
    const t = raw.trim();
    if (!t || t.startsWith('#')) continue;
    const parts = t.split(/\s+/);
    if (parts.length < 2) continue;
    map.set(parts[0], { expires: parts[1], reason: parts.slice(2).join(' ') });
  }
  return map;
}

function listHandlers(root) {
  const dir = path.join(root, HANDLER_DIR);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.class.php'))
    .map((f) => ({ service: f.replace(/\.class\.php$/, ''), file: `${HANDLER_DIR}/${f}` }))
    .filter((x) => !NOT_A_SERVICE.has(x.service))
    .sort((a, b) => a.service.localeCompare(b.service));
}

function check(root) {
  const problems = [];
  const missingInSpec = [];
  const missingInCode = [];
  const debt = [];
  const expired = [];

  const handlers = listHandlers(root);
  if (!handlers.length) {
    // 夹具仓库只造最小骨架；没有 handlers 目录时不该判红（否则每个用例都得造 34 个文件）
    return { problems, missingInSpec, missingInCode, debt, expired, covered: 0, total: 0, skipped: true };
  }

  const specAbs = path.join(root, SPEC_PATH);
  if (!fs.existsSync(specAbs)) {
    return {
      problems: [`契约文件缺失：${SPEC_PATH}`],
      missingInSpec,
      missingInCode,
      debt,
      expired,
      covered: 0,
      total: handlers.length,
      skipped: false,
    };
  }
  const spec = parseSpec(fs.readFileSync(specAbs, 'utf8'));

  const debtAbs = path.join(root, DEBT_PATH);
  const debtMap = fs.existsSync(debtAbs) ? parseDebt(fs.readFileSync(debtAbs, 'utf8')) : new Map();
  const now = Date.now();
  const seen = new Set();

  for (const { service, file } of handlers) {
    const abs = path.join(root, file);
    if (!fs.existsSync(abs)) {
      // handler 目录有文件但 checkout 里没有：说明 .gitignore/稀疏检出有问题，不是契约问题
      problems.push(`handler 文件不可读：${file}`);
      continue;
    }
    const code = new Set(extractActions(fs.readFileSync(abs, 'utf8')));
    const documented = spec.get(service);

    // 没有任何 public 方法的类是空壳（如 task.class.php），不构成对外接口，
    // 不该逼人为它登记一条欠债——登记了反而会把欠债数撑虚，掩盖真欠债。
    if (code.size === 0 && !documented) continue;

    if (!documented) {
      // 未纳入契约 → 必须有台账
      const d = debtMap.get(service);
      if (!d) {
        problems.push(`${service} 未纳入契约，且未在 ${DEBT_PATH} 登记（新增接口必须补文档或登记欠债）`);
      // 到期日**含当天**：按 UTC+8 当天结束（23:59:59+08:00）判定。
      // 原先直接 Date.parse('YYYY-MM-DD') 得到 UTC 零点，等于提前一天生效——
      // 台账写 2027-01-31，1 月 30 日就会红，人会以为脚本坏了。
      } else if (Number.isNaN(Date.parse(d.expires)) || Date.parse(`${d.expires}T23:59:59+08:00`) < now) {
        expired.push(`${service}(${d.expires})`);
      } else {
        debt.push(`${service}→${d.expires}`);
      }
      continue;
    }

    seen.add(service);
    for (const a of code) if (!documented.has(a)) missingInSpec.push(`/${service}/${a}`);
    for (const a of documented) if (!code.has(a)) missingInCode.push(`/${service}/${a}`);
  }

  // 契约里出现、但 handlers 目录没有对应类的 service：文档在描述不存在的东西
  for (const svc of spec.keys()) {
    if (!seen.has(svc)) {
      const exists = handlers.some((h) => h.service === svc);
      if (!exists) missingInCode.push(`/${svc}/*（无 ${HANDLER_DIR}/${svc}.class.php）`);
    }
  }

  // 台账里登记了但 service 已不存在 / 已纳入契约：僵尸条目会让欠债数虚高
  for (const svc of debtMap.keys()) {
    if (spec.has(svc)) problems.push(`${DEBT_PATH} 里的 ${svc} 已纳入契约，请删除该条欠债`);
    else if (!handlers.some((h) => h.service === svc)) problems.push(`${DEBT_PATH} 里的 ${svc} 没有对应 handler，请删除该条欠债`);
  }

  return {
    problems,
    missingInSpec,
    missingInCode,
    debt,
    expired,
    covered: [...spec.values()].reduce((n, s) => n + s.size, 0),
    total: handlers.length,
    skipped: false,
  };
}

function main() {
  const root = path.join(__dirname, '..');

  if (process.argv.includes('--print')) {
    const all = [];
    for (const { service, file } of listHandlers(root)) {
      const abs = path.join(root, file);
      if (!fs.existsSync(abs)) continue;
      for (const a of extractActions(fs.readFileSync(abs, 'utf8'))) all.push(`/${service}/${a}`);
    }
    console.log(all.sort().join('\n'));
    return 0;
  }

  const r = check(root);
  if (r.skipped) {
    console.log('跳过：没有 handlers 目录');
    return 0;
  }

  const bad = r.problems.length + r.missingInSpec.length + r.missingInCode.length + r.expired.length;
  const strict = process.argv.includes('--strict-debt');
  const debtBad = strict ? r.debt.length : 0;

  if (!bad && !debtBad) {
    const tail = r.debt.length ? `；欠债 ${r.debt.length} 个 service 未纳管（${r.debt.length}/${r.total}）` : '';
    console.log(`PHP 契约一致：${r.covered} 个接口已文档化${tail}`);
    return 0;
  }

  for (const p of r.problems) console.log('✗ ' + p);
  for (const k of r.missingInSpec) console.log(`✗ 代码有、文档缺：${k}`);
  for (const k of r.missingInCode) console.log(`✗ 文档有、代码没有：${k}`);
  for (const k of r.expired) console.log(`✗ 欠债已过期：${k}（补文档或重新评估到期日）`);
  if (strict) for (const k of r.debt) console.log(`✗ 欠债未清（--strict-debt）：${k}`);
  console.log(`\nPHP 契约不一致（${bad + debtBad} 处）。改接口必须同步 ${SPEC_PATH}。`);
  return 1;
}

module.exports = { extractActions, parseSpec, parseDebt, listHandlers, check, stripPhpComments, SPEC_PATH, HANDLER_DIR, DEBT_PATH };

if (require.main === module) process.exit(main());
