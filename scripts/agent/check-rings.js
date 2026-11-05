#!/usr/bin/env node
/**
 * check-rings.js —— 规则四环体检 + 门禁项背书（只读，零依赖）
 *
 * 输入：docs/agent/rules.yaml（规则唯一真相源）
 * 校验两件事：
 *
 * 一、四环齐不齐（每条 hard 规则）
 *   ① 产生环：YAML 里有一行                       → 一定有
 *   ② 执行环：enforce 指向的「文件#签名」真实存在  → 本脚本查
 *   ③ 检查环：test 指向的用例真实存在              → 本脚本查
 *   ④ 收口环：run 目录终态文件                    → 本脚本不查，见 spec-lint.sh S5
 *
 * 二、门禁项有没有规则背书（rules.yaml ↔ gates.sh 双向）
 *   方向 A（规则→门禁）：enforce 写了但 gates.sh 里找不到这行 → BAD_ENFORCE
 *   方向 B（门禁→规则）：gates.sh 有个检查项，但没有任何规则指向它 → 这条门禁在白拦。
 *     白拦的两种坏法都真实发生过：① 是别人的规矩，写错到自己身上（误伤）；
 *     ② 是过时的规矩，谁都不敢删（攒成盲区）。所以「没有背书」本身就是一个缺陷。
 *
 * 判定：
 *   OK          两环都解析成功
 *   NO_ENFORCE  enforce: none —— 规则只写在文档里，没人在拦
 *   BAD_ENFORCE 写了锚点但文件里找不到签名（典型：抄了个函数名，实际不存在）
 *   NO_TEST     没有「故意违反必红」的用例 —— 这条门禁坏了你不会知道
 *
 * 退出码：hard 规则任一非 OK，或任一检查项无背书 → 1
 * 用法：node check-rings.js [repo_root] [rules.yaml]
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');

const HERE = __dirname;
const ROOT = path.resolve(process.argv[2] || path.join(HERE, '..', '..'));
const YAML = path.resolve(process.argv[3] || path.join(ROOT, 'docs/agent/rules.yaml'));
const SEARCH_DIRS = ['', 'scripts/agent/', 'scripts/', '.github/workflows/', 'deploy/', 'docs/', 'docs/agent/', 'docs/internal/'];

// 参数自检：跑错目录时必须"响一声"，不能用一堆「文件不存在」伪装成仓库缺陷。
// 真实教训：在工具目录下不带参数直跑，会输出「四环齐全 0 条（0%）」，
// 看起来像仓库全红，其实是 ROOT 指错了 —— 检查工具自己成了"假信号源"。
const USAGE = '用法：node scripts/agent/check-rings.js [repo-dir] [rules.yaml]\n'
  + '  默认值：repo-dir = 本脚本上两级；rules.yaml = <repo>/docs/agent/rules.yaml';
if (!fs.existsSync(path.join(ROOT, '.git')) && !fs.existsSync(path.join(ROOT, 'scripts'))) {
  console.error(`❌ 参数错误：${ROOT} 不像仓库根目录（既无 .git 也无 scripts/）。\n${USAGE}`);
  process.exit(2);
}
if (!fs.existsSync(YAML)) {
  console.error(`❌ 参数错误：规则真相源不存在：${YAML}\n${USAGE}`);
  process.exit(2);
}

function parseFlatYaml(text) {
  const rules = [];
  let cur = null;
  for (const line of text.split('\n')) {
    if (/^\s*#/.test(line) || !line.trim()) continue;
    let m = line.match(/^\s*-\s+id:\s*(.+)\s*$/);
    if (m) { cur = { id: m[1].trim() }; rules.push(cur); continue; }
    if (!cur) continue;
    m = line.match(/^\s{4}([a-z_0-9]+):\s*(.*?)\s*$/);
    if (m) cur[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return rules;
}

// 连字符/下划线/大小写不敏感：同一份文件可能叫 AGENT_PIPELINE.md，也可能被引成 agent-pipeline.md。
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

function findFile(rel) {
  // 先按「相对仓库根的完整路径」找（docs/internal/AGENT_PIPELINE.md 这种带层级的写法），
  // 找不到再退回按 basename 在各常用目录里搜。只按 basename 搜会漏掉带层级的锚点。
  if (rel.includes('/')) {
    const dir = path.dirname(path.join(ROOT, rel));
    const hit = ciResolve(dir, path.basename(rel));
    if (hit && fs.statSync(hit).isFile()) return hit;
  }
  const base = path.basename(rel);
  for (const d of SEARCH_DIRS) {
    const p = ciResolve(path.join(ROOT, d), base);
    if (p && fs.statSync(p).isFile()) return p;
  }
  return null;
}

// 一个 enforce 可以有多个执行点（例：S-01 同时锚「增量扫描」和「全仓扫描」），
// 用 ` | ` 分隔，**全部**命中才算 OK —— 只锚一半就是规则文本里有一半没人证明。
function splitAnchors(v) {
  if (!v || v === 'none') return ['none'];
  return v.split(/\s+\|\s+/).map((s) => s.trim()).filter(Boolean);
}

function resolveAnchor(anchor, kind) {
  if (!anchor || anchor === 'none') return { ok: false, why: 'none', kind };
  const i = anchor.indexOf('#');
  if (i < 0) return { ok: false, why: '格式不是 文件#签名', kind };
  const file = anchor.slice(0, i).trim();
  const sig = anchor.slice(i + 1).trim();
  const abs = findFile(file);
  if (!abs) return { ok: false, why: `文件不存在：${file}`, kind };
  const text = fs.readFileSync(abs, 'utf8');
  // 测试用例必须真是断言调用，防止签名只命中注释。
  // 三种调用形态都算：case_ "<名>"（断 rc）/ row_is "<名>"（断「指定检查项的指定结果 + rc」，更严）
  // / assert_ok "<名>"（检查器型断言）。
  // row_is 为什么更严：只断 rc 会被别的检查项顶包——假红顶真绿，用例绿了规则其实没人拦。
  // 注意必须用字符串匹配而不是把 sig 塞进 RegExp：签名里带 + ( ) 等元字符（如「改路由+带测试」）。
  const needles = kind === 'test' ? [`case_ "${sig}"`, `row_is "${sig}"`, `assert_ok "${sig}"`] : [sig];
  const line = text.split('\n').find((l) => needles.some((n) => l.includes(n)));
  if (!line) return { ok: false, why: kind === 'test' ? `无用例：(case_|row_is|assert_ok) "${sig}"` : `找不到签名：${sig}`, kind, file: abs };
  return { ok: true, kind, file: abs, line, sig };
}

function resolveAll(value, kind) {
  const parts = splitAnchors(value);
  if (parts.length === 1 && parts[0] === 'none') return { ok: false, why: 'none', kind, multi: [] };
  const multi = parts.map((a) => resolveAnchor(a, kind));
  const badOne = multi.find((r) => !r.ok);
  if (badOne) return { ok: false, why: badOne.why, kind, multi };
  return { ok: true, kind, multi };
}

const rules = parseFlatYaml(fs.readFileSync(YAML, 'utf8'));
if (!rules.length) { console.error('未解析到任何规则（检查缩进：规则键需 4 空格缩进）'); process.exit(2); }

const rows = [];
for (const r of rules) {
  const e = resolveAll(r.enforce, 'enforce');
  const t = resolveAll(r.test, 'test');
  let verdict = 'OK';
  if (!e.ok) verdict = e.why === 'none' ? 'NO_ENFORCE' : 'BAD_ENFORCE';
  else if (!t.ok) verdict = t.why === 'none' ? 'NO_TEST' : 'BAD_TEST';
  rows.push({ ...r, e, t, verdict });
}

const W = { OK: 'OK     ', NO_ENFORCE: '无执行 ', BAD_ENFORCE: '坏执行 ', NO_TEST: '无用例 ', BAD_TEST: '坏用例 ' };
console.log(`# 四环体检 · ${path.relative(ROOT, YAML)}（${rows.length} 条规则）\n`);
console.log('| ID | level | 执行环 | 检查环 | 判定 | 缺什么 |');
console.log('|---|---|---|---|---|---|');
for (const r of rows) {
  const eCell = r.e.ok ? '✅' : (r.enforce === 'none' ? '—' : '❌');
  const tCell = r.t.ok ? '✅' : (r.test === 'none' ? '—' : '❌');
  const miss = [r.e.ok ? '' : (r.e.why === 'none' ? '无机器执行点' : r.e.why),
                r.t.ok ? '' : (r.t.why === 'none' ? '无「故意违反必红」用例' : r.t.why)].filter(Boolean).join('；');
  console.log(`| ${r.id} | ${r.level} | ${eCell} | ${tCell} | ${W[r.verdict]} | ${miss || '—'} |`);
}

const hard = rows.filter((r) => r.level === 'hard');
const full = hard.filter((r) => r.verdict === 'OK');
const noTest = hard.filter((r) => r.verdict === 'NO_TEST' || r.verdict === 'BAD_TEST');
const noEnf = hard.filter((r) => r.verdict === 'NO_ENFORCE' || r.verdict === 'BAD_ENFORCE');
const pct = (n) => (hard.length ? Math.round((n / hard.length) * 100) : 0);

console.log(`\n结论：hard 规则 ${hard.length} 条，四环齐全 ${full.length} 条（${pct(full.length)}%）。`);
console.log(`- 缺「检查环」（有用例但没有故意违反的断言）：${noTest.length} 条 → ${noTest.map((r) => r.id).join(' ') || '无'}`);
console.log(`- 缺「执行环」（只写在文档，没人在拦）：${noEnf.length} 条 → ${noEnf.map((r) => r.id).join(' ') || '无'}`);
if (noEnf.length) console.log(`\n最严重：${noEnf.map((r) => r.id).join(' ')} 在文档里是 hard，但机器上完全没人拦。`);

// ── 出处锚点：src 指向的叙述版文档里，这条规则必须还在 ──────────────────
// 为什么单独查：rules.yaml 取代了文档里的规则表，但叙述还在文档里。若有人删掉文档中的
// 某条规则（或改了 ID），而 rules.yaml 仍指着它，就会出现「真相源说是从那儿来的，
// 那儿已经没有了」——两个声明面互相指错，谁都发现不了。
const srcBad = [];
for (const r of rows) {
  if (!r.src) { srcBad.push({ id: r.id, why: '没写 src，规则出处不可追' }); continue; }
  const s = resolveAnchor(r.src, 'src');
  if (!s.ok) srcBad.push({ id: r.id, why: s.why });
}
console.log(`\n## 出处锚点（src → 叙述版文档）\n`);
if (!srcBad.length) console.log(`全部 ${rows.length} 条规则的 src 均可解析。`);
else {
  console.log('| ID | 问题 |');
  console.log('|---|---|');
  for (const b of srcBad) console.log(`| ${b.id} | ${b.why} |`);
  console.log(`\n${srcBad.length} 条规则的出处指不到东西：要么改锚点，要么文档那条规则真被删了（那就是规则在减少，需要有人说明理由）。`);
}

// ── 门禁项背书：gates.sh 的每个检查项，必须有一条规则指向它 ──────────────
// 豁免不是"跳过"，是"写明为什么不需要规则"——理由会打进报告，豁免本身可被审查。
const NO_RULE_NEEDED = new Map([
  ['基线', '元信息行，不是检查项'],
  ['受保护路径改动', '与「受保护路径未改动」是同一检查的两个分支（WARN / FAIL 各一行），背书在 P-01'],
  ['护栏未削弱', 'P-01 0b：门禁自身健康度预警（护栏条数掉了就 WARN），不是业务规则'],
]);

const GATES = path.join(ROOT, 'scripts/agent/gates.sh');
let censusBad = 0;
if (!fs.existsSync(GATES)) {
  console.log(`\n⚠️ 跳过门禁项背书：找不到 ${path.relative(ROOT, GATES)}`);
} else {
  const body = fs.readFileSync(GATES, 'utf8');
  const names = [];
  for (const line of body.split('\n')) {
    const re = /\brow\s+"([^"]+)"/g;
    let m;
    while ((m = re.exec(line))) {
      // `row "$1" ...` 是辅助函数的形参，不是检查项名——按字面收进来会造出「$1 无背书」这种假阳性。
      if (/^\$/.test(m[1])) continue;
      if (!names.includes(m[1])) names.push(m[1]);
    }
  }
  // enforce 侧收集：文件是 gates.sh 的签名，去掉 ${...} 插值后参与前缀匹配
  const sigs = [];
  for (const r of rows) for (const a of r.e.multi || []) {
    if (a.ok && /gates\.sh$/.test(a.file)) sigs.push({ id: r.id, sig: a.sig.replace(/\$\{[^}]*\}/g, '').trim() });
  }
  const claims = [];
  const unclaimed = [];
  const exempt = [];
  // 豁免按前缀认：`护栏未削弱（${gf}）` 去掉插值后剩 `护栏未削弱（`，末尾可能残留半截括号，
  // 用全等匹配会漏掉它，于是"已写明的豁免"看起来像"没人管的门禁"。前缀匹配更结实。
  const exemptWhy = (bare) => {
    for (const [k, v] of NO_RULE_NEEDED) if (bare.startsWith(k)) return v;
    return null;
  };
  for (const n of names) {
    const bare = n.replace(/\$\{[^}]*\}/g, '').trim();
    const hit = sigs.find((s) => bare.startsWith(s.sig) || s.sig.startsWith(bare));
    if (hit) claims.push({ name: n, id: hit.id });
    else {
      const why = exemptWhy(bare);
      if (why) exempt.push({ name: n, why });
      else unclaimed.push(n);
    }
  }
  console.log(`\n## 门禁项背书（${path.relative(ROOT, GATES)} ↔ rules.yaml）\n`);
  console.log('| 检查项 | 背书规则 |');
  console.log('|---|---|');
  for (const c of claims) console.log(`| ${c.name} | ${c.id} |`);
  for (const e of exempt) console.log(`| ${e.name} | 豁免：${e.why} |`);
  for (const u of unclaimed) console.log(`| ${u} | ❌ **无规则背书** |`);
  censusBad = unclaimed.length;
  console.log(`\n结论：检查项 ${names.length} 个，有背书 ${claims.length}、显式豁免 ${exempt.length}、无背书 ${unclaimed.length}。`);
  if (unclaimed.length) {
    console.log(`无背书：${unclaimed.join('、')} —— 这条门禁在白拦：坏了没人知道为什么它存在，误伤了也找不到该改哪条规则。`);
    console.log('两种收口：① 在 rules.yaml 补一条规则（连同「故意违反必红」用例）；② 确认它不该存在，从 gates.sh 删掉。');
  }
}

process.exit(full.length === hard.length && censusBad === 0 && srcBad.length === 0 ? 0 : 1);
