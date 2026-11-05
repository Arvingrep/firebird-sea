#!/usr/bin/env node
/**
 * check-anchors.js —— 规范锚点体检（只读，零依赖）
 *
 * 要解决的问题：
 *   AGENT_PIPELINE.md 早期用 `gates.sh:78-82` 这种「文件:行号」把硬规则指到执行面。
 *   行号是位置的坐标，不是内容的坐标。被指的文件一改，全部指针静默失效，
 *   而且没有任何东西报错——文档看着仍然完整，规则实际上已经指到别处。
 *   实测：18 个行号锚点 8 个错位，偏移集中在 +6~+8，零症状。
 *
 * 两种锚点都支持：
 *   行号式 `file:12-18`  → 只能验区间里有没有签名内容（会飘，已不推荐）
 *   签名式 `file#签名`   → 验「文件里有没有这段内容」，与行号无关（推荐）
 *
 * 判定：
 *   OK     签名命中
 *   DRIFT  有强签名但一个都不在区间 / 文件里根本没有这段内容
 *   MISS   被指文件不存在
 *   OOR    行号超出文件长度
 *   NOSIG  规则正文里没有可校验的标识符，需人工看
 *
 * 退出码：DRIFT / MISS / OOR / NOSIG 存在 → 1，否则 0
 * 用法：node check-anchors.js [repo_root] [doc_path]
 *   默认：repo_root = 本脚本上两级；doc_path = docs/internal/AGENT_PIPELINE.md
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');

const HERE = __dirname;
const ROOT = path.resolve(process.argv[2] || path.join(HERE, '..', '..'));
const DOC = process.argv[3] || 'docs/internal/AGENT_PIPELINE.md';

const SEARCH_DIRS = ['', 'scripts/agent/', 'scripts/', '.github/workflows/', 'deploy/', 'docs/', 'docs/internal/', 'docs/agent/'];
const ANCHOR_RE = /`([A-Za-z0-9_./-]+\.(?:sh|js|ts|yml|yaml|md|json)):(\d+)(?:-(\d+))?`/g;
const BT_RE = /`([^`]{3,60})`/g;
// 签名式锚点：`file#签名`。签名用标识符（函数名 / 变量名 / 字面量 / 检查项名），
// 与行号无关，文件被改动也不会失效——这才是「内容坐标」。
// .md 也纳入：规则真相源里 src: docs/internal/AGENT_PIPELINE.md#P-01 这类指回叙述版的锚点，
// 同样要能被校验（文档删了这条规则、改了 ID，就在这里报红）。
const SIG_RE = /`?([A-Za-z0-9_./-]+\.(?:sh|js|ts|yml|yaml|md))#([^`\s|]{2,60})`?/g;
// 太通用、出现在任何地方都说明不了问题的词
const GENERIC = new Set([
  'true', 'false', 'null', 'undefined', 'main', 'base', 'node', 'bash', 'sudo',
  'gates.sh', 'qa.sh', 'lib.sh', 'make', 'git', 'docs/', '.md', '.yml', '.yaml',
  'hard', 'soft', 'note', 'owner', 'agent', 'scripts/', 'root',
]);
// 检查边界行：row "..." / case_ "..." / # N. 分节注释 —— 命中这些位置更可信
const BOUNDARY_RE = /(row "|case_ "|^# \d+\.|^\s*#\s*\d+\.)/;

// 连字符/下划线/大小写不敏感：同一份文档可能叫 AGENT_PIPELINE.md，也可能被引成 agent-pipeline.md。
// 写死一种写法会让工具在另一种状态下「整份跳过」——那不是检查失败，是检查没跑。
const normName = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
function ciResolve(dir, name) {
  const p = path.join(dir, name);
  if (fs.existsSync(p)) return p;
  let entries;
  try { entries = fs.readdirSync(dir); } catch { return null; }
  const exact = entries.find((e) => e.toLowerCase() === name.toLowerCase());
  if (exact) return path.join(dir, exact);
  const want = normName(name);
  const loose = entries.find((e) => normName(e) === want);
  return loose ? path.join(dir, loose) : null;
}

// 先按「相对仓库根的完整路径」找（docs/internal/AGENT_PIPELINE.md 这种带层级的写法），
// 找不到再退回按 basename 在各常用目录里搜。只按 basename 搜会漏掉同名不同层的文件。
function findFile(rel) {
  if (rel.includes('/')) {
    const direct = ciResolve(path.dirname(path.join(ROOT, rel)), path.basename(rel));
    if (direct && fs.statSync(direct).isFile()) return direct;
  }
  const base = path.basename(rel);
  for (const d of SEARCH_DIRS) {
    const p = ciResolve(path.join(ROOT, d), base);
    if (p && fs.statSync(p).isFile()) return p;
  }
  return null;
}

function resolveDoc(rel) {
  if (path.isAbsolute(rel)) return fs.existsSync(rel) ? rel : null;
  return findFile(rel);
}

// 强签名：反引号里的标识符；去掉路径修饰、去掉通用词
function signatures(text) {
  const out = new Set();
  let m;
  BT_RE.lastIndex = 0;
  while ((m = BT_RE.exec(text))) {
    const raw = m[1].trim();
    if (/^[\w./*-]+$/.test(raw) || /[A-Za-z_][\w.]*\(\)/.test(raw)) {
      const t = raw.replace(/[(),]/g, '').replace(/\/\*\*?$/, '/').replace(/\*+$/, '');
      if (t.length >= 3 && !GENERIC.has(t) && t.replace(/[^\w]/g, '').length >= 3) out.add(t);
    }
  }
  return [...out];
}

function nearestHit(fileLines, toks, claimStart) {
  let best = null;
  for (const t of toks) {
    fileLines.forEach((line, i) => {
      if (!line.includes(t) && !line.includes(t.replace(/\\/g, ''))) return;
      const dist = Math.abs(i + 1 - claimStart);
      // 检查边界行（row/ case_ / 分节注释）稍微优先，但距离仍主导
      const score = dist + (BOUNDARY_RE.test(line) ? 0 : 3);
      if (!best || score < best.score) best = { line: i + 1, tok: t, score, dist };
    });
  }
  return best;
}

const docAbs = resolveDoc(DOC);
if (!docAbs) {
  console.error(`找不到文档：${DOC}（在 ${ROOT} 下按完整路径与大小写不敏感解析均未见）`);
  process.exit(2);
}
const docLines = fs.readFileSync(docAbs, 'utf8').split('\n');

const anchors = [];
const sigAnchors = [];
docLines.forEach((line, i) => {
  let m;
  ANCHOR_RE.lastIndex = 0;
  while ((m = ANCHOR_RE.exec(line))) {
    anchors.push({
      file: m[1], start: +m[2], end: +(m[3] || m[2]), raw: m[0].replace(/`/g, ''),
      docLine: i + 1,
    });
  }
  SIG_RE.lastIndex = 0;
  while ((m = SIG_RE.exec(line))) {
    // 行号式锚点（file:12）不会被 SIG_RE 命中（分隔符是 #），无需去重
    sigAnchors.push({ file: m[1], sig: m[2].trim(), docLine: i + 1 });
  }
});

const res = [];
let bad = 0;
for (const a of anchors) {
  const abs = findFile(a.file);
  if (!abs) { res.push({ v: 'MISS', ...a, note: '文件不存在' }); bad++; continue; }
  const lines = fs.readFileSync(abs, 'utf8').split('\n');
  const rel = path.relative(ROOT, abs);
  if (a.end > lines.length) { res.push({ v: 'OOR', ...a, rel, note: `文件仅 ${lines.length} 行` }); bad++; continue; }
  const slice = lines.slice(a.start - 1, a.end);
  const sigs = signatures(docLines[a.docLine - 1]);
  const inRange = sigs.filter((t) => slice.some((l) => l.includes(t) || l.includes(t.replace(/\\/g, ''))));
  if (!sigs.length) { res.push({ v: 'NOSIG', ...a, rel, note: '规则正文无标识符可校验，需人工确认' }); bad++; continue; }
  if (inRange.length) { res.push({ v: 'OK', ...a, rel, note: inRange.slice(0, 2).join(' · ') }); continue; }
  const hit = nearestHit(lines, sigs, a.start);
  res.push({
    v: 'DRIFT', ...a, rel,
    note: hit ? `区间内无签名内容；最近命中「${hit.tok}」在 ${hit.line} 行（${hit.line - a.start >= 0 ? '+' : ''}${hit.line - a.start}）`
              : `区间内无签名内容，全文件也找不到：${sigs.join(', ')}`,
  });
  bad++;
}

for (const a of sigAnchors) {
  const abs = findFile(a.file);
  if (!abs) { res.push({ v: 'MISS', raw: `${a.file}#${a.sig}`, docLine: a.docLine, note: '文件不存在', sig: true }); bad++; continue; }
  const body = fs.readFileSync(abs, 'utf8');
  const rel = path.relative(ROOT, abs);
  if (body.includes(a.sig)) res.push({ v: 'OK', raw: `${a.file}#${a.sig}`, docLine: a.docLine, rel, note: `签名命中「${a.sig}」`, sig: true });
  else {
    // 老写法兼容：签名其实是函数名 + () 时，内容里可能只有 `name(` 没有 `name()`
    const loose = a.sig.replace(/\(\)$/, '(');
    if (loose !== a.sig && body.includes(loose)) res.push({ v: 'OK', raw: `${a.file}#${a.sig}`, docLine: a.docLine, rel, note: `签名命中「${loose}」`, sig: true });
    else { res.push({ v: 'DRIFT', raw: `${a.file}#${a.sig}`, docLine: a.docLine, rel, note: `文件里找不到「${a.sig}」——签名写错了，或那段内容已被删/改名`, sig: true }); bad++; }
  }
}

// 整体偏移估计：用一个统一 offset 去套所有 DRIFT，看哪个 offset 命中最多
const drifts = res.filter((r) => r.v === 'DRIFT' && r.rel && !r.sig);
let bestOffset = null;
for (let off = -30; off <= 30; off++) {
  if (!off) continue;
  let n = 0;
  for (const r of drifts) {
    const lines = fs.readFileSync(path.join(ROOT, r.rel), 'utf8').split('\n');
    const s = signatures(docLines[r.docLine - 1]);
    const slice = lines.slice(Math.max(0, r.start - 1 + off), Math.max(0, r.end + off));
    if (s.length && s.some((t) => slice.some((l) => l.includes(t)))) n++;
  }
  if (n > 0 && (!bestOffset || n > bestOffset.n)) bestOffset = { off, n };
}

const w = { OK: 'OK   ', DRIFT: 'DRIFT', MISS: 'MISS ', OOR: 'OOR  ', NOSIG: 'NOSIG' };
console.log(`# 锚点体检 · ${path.relative(ROOT, docAbs)}`);
console.log(`\n共 ${res.length} 个锚点（签名式 ${sigAnchors.length} 个 / 行号式 ${anchors.length} 个）\n`);
console.log('| 判定 | 锚点 | 文档行 | 说明 |');
console.log('|---|---|---|---|');
for (const r of res) console.log(`| ${w[r.v]} | \`${r.raw}\` | :${r.docLine} | ${r.note.replace(/\|/g, '\\|')} |`);

const ok = res.filter((r) => r.v === 'OK').length;
console.log(`\n结论：${ok}/${res.length} 个锚点仍指向正确内容。`);
if (bestOffset) console.log(`整体偏移嫌疑：${bestOffset.off > 0 ? '+' : ''}${bestOffset.off} 行（用同一 offset 可让 ${bestOffset.n} 个失效锚点重新命中）——典型形态是「文件被改过一次，所有指针一起飘」。`);
console.log(`\n修复：把 \`file:行号\` 换成 \`file#签名\`（用检查项名称/函数名当锚）。行号式锚点在文件被改动后必然漂移，签名式不会——本工具两种写法都支持。`);
process.exit(bad ? 1 : 0);
