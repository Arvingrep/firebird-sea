#!/usr/bin/env node
// BMAD Story → GitHub Issue：选出下一个可开工的 backlog Story，生成 Issue（默认 dry-run，--create 才调 gh）。
// 用法与参数见 docs/internal/BMAD_PIPELINE.md
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const LABELS = ['agent:dev']; // 仅此一个标签；其它流水线标签由 Agent/QA 自己维护
const OK = ['review', 'done'];
const MARK = /<!-- bmad-story: (\S+) -->/;
// 跨 Epic 依赖（可经 --deps-file 覆盖）；同 Epic 内一律依赖全部前序 Story
const EPIC_DEPS = { 2: ['1.5'], 3: ['2.3'], 4: ['3.3'], 5: ['4.3'], 6: ['5.4'] };
// Story 正文未显式引用 AD 时的映射（按 AD 标题人工对应，需复核）；未列出的 Story 退回 Epic 默认
const STORY_AD = { '1.1': [14], '1.2': [3], '1.3': [9, 13], '1.4': [15], '1.5': [5, 15], '1.6': [17], '1.7': [18], '1.8': [16, 19],
  '2.1': [5, 6], '2.2': [5, 7], '2.3': [4, 7], '2.4': [7, 12], '2.5': [6, 12] };
const EPIC_AD = { 1: [13, 14, 15], 2: [4, 5, 6, 7, 12], 3: [8, 9], 4: [2, 12], 5: [10, 11], 6: [10, 11] };
const RULES = [
  '受保护路径：不得修改 `.github/`、`scripts/agent/`、`scripts/acceptance/`、`.agents/`（改动会被丢弃，且门禁判 FAIL）；确需改动的部分在 PR 说明里列出，交 Arvin 提交。',
  '零依赖：只用 Node 内置模块；新增 npm/composer 依赖必须先经人工批准（Zero-Dep 门禁）。',
  '不得提交密钥、私钥、助记词、Bot Token；不得留下 `console.log`/`var_dump`/`debugger`/`.bak`。',
  '改动代码、表结构、API、环境变量或支付流程时，同一变更内更新 `docs/internal` 对应文档（Docs-as-Code）。',
  '你没有 Bash，无法运行测试：请写好测试文件，由 CI 执行；资金路径必须带自动化测试（AD-15）。',
];

function parseEpics(md) {
  const epics = [];
  let epic = null, st = null;
  for (const line of md.split('\n')) {
    let m;
    if ((m = line.match(/^## Epic (\d+): (.+)$/))) { epic = { n: +m[1], title: m[2].trim(), stories: [] }; epics.push(epic); st = null; }
    else if ((m = line.match(/^### Story (\d+)\.(\d+): (.+)$/)) && epic) {
      st = { epic: +m[1], num: +m[2], id: `${m[1]}.${m[2]}`, title: m[3].trim(), lines: [] }; epic.stories.push(st);
    } else if (/^##? /.test(line)) st = null;
    else if (st) st.lines.push(line);
  }
  for (const e of epics) for (const s of e.stories) {
    const text = s.lines.join('\n').trim();
    const i = text.indexOf('**Acceptance Criteria:**');
    s.intro = (i < 0 ? text : text.slice(0, i)).trim();
    s.ac = i < 0 ? '' : text.slice(i + '**Acceptance Criteria:**'.length).trim();
    s.acCount = (s.ac.match(/^\*\*Given\*\*/gm) || []).length;
  }
  return epics;
}

function parseStatus(yaml) { // story-key → status（只收 N-M-slug，忽略 epic-* 与 retrospective）
  const out = new Map();
  for (const l of yaml.split('\n')) {
    const m = l.match(/^\s{2}(\d+-\d+-[^\s:]+):\s*([a-z-]+)/);
    if (m) out.set(m[1], m[2]);
  }
  return out;
}

const keyOf = (story, status) => [...status.keys()].find((k) => k.startsWith(`${story.epic}-${story.num}-`));
const depsOf = (s, epics, extra = EPIC_DEPS) => [
  ...epics.flatMap((e) => e.stories).filter((x) => x.epic === s.epic && x.num < s.num).map((x) => x.id),
  ...(extra[s.epic] || []),
];
const unmet = (s, epics, status, extra) => depsOf(s, epics, extra).filter((id) => {
  const dep = epics.flatMap((e) => e.stories).find((x) => x.id === id);
  return !dep || !OK.includes(status.get(keyOf(dep, status)));
});

// issues: gh issue list --json number,title,body,labels 的结果
function analyzeIssues(issues) {
  const keys = new Set(), inflight = [];
  for (const i of issues) {
    const m = (i.body || '').match(MARK);
    if (!m) continue;
    keys.add(m[1]);
    if ((i.labels || []).some((l) => (l.name || l) === 'agent:dev')) inflight.push(i.number);
  }
  return { inflight: inflight.length, keys };
}

function pickNext(epics, status, { inflight = 0, maxInflight = 1, story, ignoreDeps = false, skipKeys = new Set(), depsExtra } = {}) {
  const all = epics.flatMap((e) => e.stories);
  if (inflight >= maxInflight) return { reason: `在途 Story Issue ${inflight} ≥ 上限 ${maxInflight}，等待合并或人工处理` };
  const pool = story ? all.filter((s) => s.id === story || keyOf(s, status) === story) : all;
  if (story && !pool.length) return { reason: `找不到 Story ${story}` };
  const blocked = [];
  for (const s of pool) {
    const key = keyOf(s, status);
    if (!key) { blocked.push(`${s.id} 不在 sprint-status 中`); continue; }
    if (status.get(key) !== 'backlog') { if (story) blocked.push(`${s.id} 状态为 ${status.get(key)}，非 backlog`); continue; }
    if (skipKeys.has(key)) { blocked.push(`${s.id} 已存在对应 Issue`); continue; }
    const need = unmet(s, epics, status, depsExtra);
    if (need.length && !ignoreDeps) { blocked.push(`${s.id} 依赖未满足：${need.join(', ')}`); if (story) continue; break; }
    return { story: s, key, unmet: need };
  }
  return { reason: blocked.join('；') || '没有可开工的 backlog Story' };
}

function renderIssue(s, { key, adTitles = new Map(), specFile = '', unmet: need = [], testFile = '' }) {
  const refs = new Set((s.lines.join('\n').match(/AD-(\d+)/g) || []).map((x) => +x.slice(3)));
  if (!refs.size) (STORY_AD[s.id] || EPIC_AD[s.epic] || []).forEach((n) => refs.add(n));
  const ads = [...refs].sort((a, b) => a - b).map((n) => `- AD-${n}${adTitles.get(n) ? ` — ${adTitles.get(n)}` : ''}`);
  const split = s.acCount > 4 ? `\n> ⚠️ 本 Story 有 ${s.acCount} 条验收条件，很可能超出单次增量，请优先落地前几条并在 PR 中说明拆分。\n` : '';
  const tid = `${s.epic}-${s.num}`;
  const testFirst = testFile
    ? [`- ✅ 验收测试已预置：\`${testFile}\`，**当前为红**；你的任务是让它变绿。`,
      `- 运行：\`bash scripts/acceptance/run.sh --story ${tid}\`（CI 在本 PR 标题含 \`[story:${key}]\` 时强制执行）。`,
      '- 该文件受保护：不得修改或删除，改动会被丢弃；不得靠削弱测试变绿。可另补自己的单测。',
      '- 用例只覆盖可静态/渲染判定的条件；运行态条件（如订单状态流转）仍需人工验收，请在清单中标注。']
    : [`- ⚠️ 尚无预置验收测试（\`scripts/acceptance/story-${tid}.sh\` 不存在），按 docs/internal/TEST_FIRST.md 先补用例再开工。`,
      '- 在此之前，请为每条验收条件各补一个可被 CI 运行的测试（就近放在相应服务的 test 目录），并在总结里逐条对应。'];
  const body = [
    `<!-- bmad-story: ${key} -->`,
    testFile ? '<!-- test-first: present -->' : '<!-- test-first: missing -->',
    `> 来源：BMAD Epic ${s.epic} · Story ${s.id}（sprint key \`${key}\`）。本 Issue 由 \`scripts/bmad/story-to-issue.js\` 生成。`,
    need.length ? `> ⚠️ 依赖未满足（人工强制开工）：${need.join(', ')}` : '',
    '', '## 目标', s.intro, '', '## 验收条件（Given/When/Then）', s.ac || '（epics.md 未给出）', '',
    '## 相关架构决定', ...ads, '', '## 必须遵守（RULES / 门禁）', ...RULES.map((r) => `- ${r}`), '',
    '## 测试先行', ...testFirst, '',
    '## 完成时必须输出', '「逐条验收条件 → 对应文件 / 测试」清单；未满足的写明原因。不要声称跑过测试（你没有 Bash）。', '',
    '## 规格', specFile ? `- Story 规格：\`_bmad-output/implementation-artifacts/${specFile}\`` : '- 暂无独立规格文件，以本正文为准。',
    '- 全部 Story：`_bmad-output/planning-artifacts/epics.md`；架构：`ARCHITECTURE-SPINE.md`。',
    '', '## 增量上限', `单次增量 ≤ 300 行（不含 docs/、_bmad-output/）；超出门禁直接打回。过大请只落地前几条验收条件，其余在 PR 说明里写明拆分建议，不要做范围扩张。${split}`,
  ].filter((l) => l !== null).join('\n').replace(/\n{3,}/g, '\n\n');
  return { title: `[story:${key}] Story ${s.id} ${s.title}`, body, labels: [...LABELS] };
}

function main(argv) {
  const a = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) a._.push(argv[i]);
    else if (['create', 'ignore-deps', 'query-gh', 'no-test-first'].includes(argv[i].slice(2))) a[argv[i].slice(2)] = true;
    else a[argv[i].slice(2)] = argv[++i];
  }
  const out = a['out-dir'] || path.resolve(__dirname, '../../_bmad-output');
  const read = (f) => fs.readFileSync(f, 'utf8');
  const epics = parseEpics(read(a.epics || path.join(out, 'planning-artifacts/epics.md')));
  const status = parseStatus(read(a.status || path.join(out, 'implementation-artifacts/sprint-status.yaml')));
  const sd = path.join(out, 'planning-artifacts/architecture');
  const spine = a.spine || (fs.existsSync(sd) && fs.readdirSync(sd).map((d) => path.join(sd, d, 'ARCHITECTURE-SPINE.md')).find(fs.existsSync));
  const adTitles = new Map();
  if (spine) for (const m of read(spine).matchAll(/^### AD-(\d+) — (.+?)(?:\s*`\[.*)?$/gm)) adTitles.set(+m[1], m[2]);
  let issues = [];
  if (a['inflight-file']) issues = JSON.parse(read(a['inflight-file']));
  else if (a['query-gh'] || a.create) issues = JSON.parse(execFileSync('gh', ['issue', 'list', '--state', 'open', '--limit', '200', '--json', 'number,title,body,labels'], { encoding: 'utf8' }));
  const seen = analyzeIssues(issues);
  const pick = pickNext(epics, status, {
    inflight: a.inflight !== undefined ? +a.inflight : seen.inflight, maxInflight: +(a['max-inflight'] || 1),
    story: a.story, ignoreDeps: !!a['ignore-deps'], skipKeys: seen.keys,
    depsExtra: a['deps-file'] ? JSON.parse(read(a['deps-file'])) : EPIC_DEPS,
  });
  if (!pick.story) { console.error(`无可创建的 Issue：${pick.reason}`); return 10; }
  const dir = path.join(out, 'implementation-artifacts');
  const specFile = fs.existsSync(dir) ? fs.readdirSync(dir).find((f) => f.startsWith(`spec-${pick.story.epic}-${pick.story.num}-`)) : '';
  const root = a['repo-root'] ? path.resolve(a['repo-root']) : path.resolve(__dirname, '../..');
  const rel = `scripts/acceptance/story-${pick.story.epic}-${pick.story.num}.sh`;
  const testFile = fs.existsSync(path.join(root, rel)) ? rel : '';
  const issue = renderIssue(pick.story, { key: pick.key, adTitles, specFile, unmet: pick.unmet, testFile });
  if (a.create && !testFile && !a['no-test-first']) {
    console.error(`拒绝建单：Story ${pick.story.id} 没有测试先行用例 ${rel}。先补用例（docs/internal/TEST_FIRST.md），或显式 --no-test-first。`);
    return 11;
  }
  if (!a.create) {
    console.log(`# DRY-RUN（未调用 gh；加 --create 才会创建）\n# title: ${issue.title}\n# labels: ${issue.labels.join(',')}\n\n${issue.body}`);
    return 0;
  }
  const args = ['issue', 'create', '--title', issue.title, '--body-file', '-', ...issue.labels.flatMap((l) => ['--label', l])];
  console.log(execFileSync('gh', args, { input: issue.body, encoding: 'utf8' }).trim());
  return 0;
}

module.exports = { parseEpics, parseStatus, keyOf, unmet, analyzeIssues, pickNext, renderIssue, LABELS };
if (require.main === module) process.exit(main(process.argv.slice(2)));
