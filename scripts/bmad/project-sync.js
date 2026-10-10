#!/usr/bin/env node
// BMAD Story 全量建档上板：epics.md + sprint-status.yaml → Issue(bmad:story) + Project #3 字段。
// 默认 dry-run，只有显式 --apply 才写；幂等键 <!-- bmad-story: KEY -->。全链路见 docs/internal/BMAD_BOARD.md
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { parseEpics, parseStatus, keyOf, depsOf, renderIssue } = require('./story-to-issue.js');

const OWNER = process.env.BMAD_PROJECT_OWNER || 'Arvingrep';
const PROJECT = process.env.BMAD_PROJECT_NUMBER || '3';
const PROJECT_ID = process.env.BMAD_PROJECT_ID || 'PVT_kwHOAuOIfM4BmVo3';
const REPO = process.env.BMAD_REPO || 'Arvingrep/firebird-sea';
const MARK = /<!-- bmad-story: (\S+) -->/;
const OK = ['review', 'done'];
const STAGES = { backlog: '📋 需求池 (Backlog)', 'in-progress': '🚧 编码实现 (In Progress)', 'in-qa': '🛡️ 独立验收 (In QA / Acceptance)', 'ready-to-release': '🚀 待发布上线 (Ready to Release)', done: '✅ 已上线闭环 (Done / Closed)' };
// 分级（Arvin 2026-10-10 确认沿用原型草稿；调整走 PR 改这里）
const TIERS = { '1.1': 'auto', '1.2': 'pr', '1.3': 'auto', '1.4': 'auto', '1.5': 'pr', '1.6': 'auto', '1.7': 'auto', '1.8': 'pr',
  '2.1': 'pr', '2.2': 'pr', '2.3': 'human', '2.4': 'pr', '2.5': 'pr', '3.1': 'pr', '3.2': 'auto', '3.3': 'pr', '3.4': 'pr',
  '4.1': 'pr', '4.2': 'pr', '4.3': 'pr', '4.4': 'auto', '4.5': 'human', '4.6': 'human',
  '5.1': 'pr', '5.2': 'auto', '5.3': 'pr', '5.4': 'auto', '6.1': 'auto', '6.2': 'human', '6.3': 'auto' };
const BOARD_LABELS = [['bmad:story', '0e8a16', 'BMAD 已建档，只上板不触发流水线'], ['bmad:approved', '1d76db', 'Arvin 批准开工，由 bmad-approve 校验'],
  ['bmad:human-ack', '5319e7', 'human 级 Story 的二次确认'], ['bmad:halt', 'b60205', '全局熔断：暂停一切派发'], ['bmad:void', 'ededed', '作废 Issue，幂等键让位']];
// 新字段定义：[名称, 类型, 选项]
const FIELDS = [['Epic', 'SINGLE_SELECT', [1, 2, 3, 4, 5, 6].map((n) => `Epic ${n}`)], ['Story ID', 'TEXT'],
  ['分级 (Tier)', 'SINGLE_SELECT', ['auto', 'pr', 'human', 'TBD']], ['依赖', 'TEXT'],
  ['可开工 (Ready)', 'SINGLE_SELECT', ['Yes', 'No']], ['阻塞原因', 'TEXT']];

// 状态映射（方案 c）：sprint 基线 → 标签/Issue 状态覆盖；closed 且 sprint=done 才算 done
function stageOf({ sprint, labels = [], state = 'OPEN' }) {
  if (state === 'CLOSED') return 'done';
  if (labels.includes('qa:accepted')) return 'ready-to-release';
  if (labels.includes('agent:qa')) return 'in-qa';
  if (labels.includes('agent:dev')) return 'in-progress';
  return ({ 'in-progress': 'in-progress', review: 'in-qa', done: 'done' })[sprint] || 'backlog';
}

// 纯函数：生成全量计划（items=null 表示 Project 不可读，按全量保守计）
function planSync({ epics, status, issues, items = null, tiers = TIERS }) {
  const all = epics.flatMap((e) => e.stories);
  const byKey = new Map();
  for (const i of issues) {
    const m = (i.body || '').match(MARK);
    if (m && !(i.labels || []).some((l) => (l.name || l) === 'bmad:void') && !byKey.has(m[1])) byKey.set(m[1], i);
  }
  const itemUrls = items && new Set(items.map((it) => (it.content || {}).url));
  return all.map((s) => {
    const key = keyOf(s, status) || `${s.epic}-${s.num}-?`;
    const sprint = status.get(key) || 'backlog';
    const issue = byKey.get(key) || null;
    const labels = issue ? (issue.labels || []).map((l) => l.name || l) : [];
    const deps = depsOf(s, epics);
    const unmetDeps = deps.filter((id) => { const d = all.find((x) => x.id === id); return !d || !OK.includes(status.get(keyOf(d, status))); });
    const reopen = !!issue && issue.state === 'CLOSED' && sprint !== 'done';
    const stage = stageOf({ sprint, labels, state: reopen || !issue ? 'OPEN' : issue.state });
    const ready = !unmetDeps.length && stage === 'backlog';
    const fields = { 'BMAD Stage': STAGES[stage], Epic: `Epic ${s.epic}`, 'Story ID': s.id, '分级 (Tier)': tiers[s.id] || 'TBD',
      '依赖': deps.join(', ') || '-', '可开工 (Ready)': ready ? 'Yes' : 'No', '阻塞原因': unmetDeps.length ? `依赖未满足: ${unmetDeps.join(', ')}` : '' };
    const actions = [];
    if (!issue) actions.push('create-issue');
    if (reopen) actions.push('reopen-issue');
    if (issue && !labels.includes('bmad:story')) actions.push('add-label:bmad:story');
    if (!issue || !itemUrls || !itemUrls.has(issue.url)) actions.push('add-to-project');
    actions.push('set-fields');
    return { story: s, key, sprint, stage, ready, unmetDeps, fields, issue, actions };
  });
}

// 写操作：全部经可注入 gh(args)->stdout；只在 --apply 时被调用
function applyPlan(plan, gh, { adTitles = new Map() } = {}) {
  const have = new Set(JSON.parse(gh(['label', 'list', '-R', REPO, '--limit', '100', '--json', 'name'])).map((l) => l.name));
  for (const [name, color, desc] of BOARD_LABELS) if (!have.has(name)) gh(['label', 'create', name, '-R', REPO, '--color', color, '--description', desc]);
  let fields = JSON.parse(gh(['project', 'field-list', PROJECT, '--owner', OWNER, '--format', 'json'])).fields;
  for (const [name, type, opts] of FIELDS) if (!fields.some((f) => f.name === name))
    gh(['project', 'field-create', PROJECT, '--owner', OWNER, '--name', name, '--data-type', type, ...(opts ? ['--single-select-options', opts.join(',')] : [])]);
  fields = JSON.parse(gh(['project', 'field-list', PROJECT, '--owner', OWNER, '--format', 'json'])).fields;
  const log = [];
  for (const row of plan) {
    let url = row.issue && row.issue.url;
    if (row.actions.includes('create-issue')) {
      const r = renderIssue(row.story, { key: row.key, adTitles, unmet: row.unmetDeps, labels: ['bmad:story'] });
      url = gh(['issue', 'create', '-R', REPO, '--title', r.title, '--body', r.body, '--label', 'bmad:story']).trim().split('\n').pop();
    }
    if (row.actions.includes('reopen-issue')) gh(['issue', 'reopen', String(row.issue.number), '-R', REPO]);
    if (row.actions.some((a) => a.startsWith('add-label:'))) gh(['issue', 'edit', String(row.issue.number), '-R', REPO, '--add-label', 'bmad:story']);
    const itemId = JSON.parse(gh(['project', 'item-add', PROJECT, '--owner', OWNER, '--url', url, '--format', 'json'])).id; // 重复 add 幂等返回已有条目
    for (const [name, value] of Object.entries(row.fields)) {
      if (value === '') continue;
      const f = fields.find((x) => x.name === name);
      if (!f) { log.push(`WARN 字段缺失跳过: ${name}`); continue; }
      const base = ['project', 'item-edit', '--id', itemId, '--project-id', PROJECT_ID, '--field-id', f.id];
      if (f.options) {
        const o = f.options.find((x) => x.name === value);
        if (!o) { log.push(`WARN 选项缺失跳过: ${name}=${value}`); continue; }
        gh([...base, '--single-select-option-id', o.id]);
      } else gh([...base, '--text', String(value)]);
    }
    log.push(`OK ${row.key} ${url} [${row.actions.join(',')}]`);
  }
  return log;
}

function summarize(plan, projectReadable) {
  return { storiesTotal: plan.length, projectReadable,
    willCreateIssues: plan.filter((p) => p.actions.includes('create-issue')).length,
    willReuseIssues: plan.filter((p) => p.issue).map((p) => `#${p.issue.number}=${p.key}`),
    willReopen: plan.filter((p) => p.actions.includes('reopen-issue')).map((p) => `#${p.issue.number}`),
    willAddProjectItems: plan.filter((p) => p.actions.includes('add-to-project')).length,
    readyToStart: plan.filter((p) => p.ready).map((p) => p.story.id),
    byStage: [...plan.reduce((m, p) => m.set(p.stage, (m.get(p.stage) || 0) + 1), new Map())] };
}

function main(argv) {
  const apply = argv.includes('--apply');
  const gh = (args) => execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 16e6 });
  const out = path.resolve(__dirname, '../../_bmad-output');
  const epics = parseEpics(fs.readFileSync(path.join(out, 'planning-artifacts/epics.md'), 'utf8'));
  const status = parseStatus(fs.readFileSync(path.join(out, 'implementation-artifacts/sprint-status.yaml'), 'utf8'));
  let issues;
  try { issues = JSON.parse(gh(['issue', 'list', '-R', REPO, '--state', 'all', '--limit', '200', '--json', 'number,title,state,labels,body,url'])); }
  catch {
    issues = JSON.parse(gh(['api', `repos/${REPO}/issues?state=all&per_page=100`, '--paginate'])).map((i) => ({
      number: i.number, title: i.title, state: i.state,
      labels: (i.labels || []).map((l) => ({ name: typeof l === 'string' ? l : l.name })),
      body: i.body || '', url: i.html_url
    }));
  }
  let items = null, projectReadable = false, projErr = '';
  try { items = JSON.parse(gh(['project', 'item-list', PROJECT, '--owner', OWNER, '--limit', '500', '--format', 'json'])).items; projectReadable = true; }
  catch (e) { projErr = String(e.message || e).split('\n')[0]; }
  const plan = planSync({ epics, status, issues, items });
  const summary = summarize(plan, projectReadable);
  if (projErr) summary.projectError = projErr;
  console.log(JSON.stringify({ mode: apply ? 'APPLY' : 'DRY-RUN', summary, plan: plan.map(({ story, ...p }) => ({ story: story.id, ...p, issue: p.issue && p.issue.number })) }, null, 2));
  if (!apply) { console.error('\nDRY-RUN：未做任何写操作；加 --apply 才会创建标签/Issue/条目。'); return 0; }
  const sd = path.join(out, 'planning-artifacts/architecture');
  const spine = fs.existsSync(sd) && fs.readdirSync(sd).map((d) => path.join(sd, d, 'ARCHITECTURE-SPINE.md')).find(fs.existsSync);
  const adTitles = new Map();
  if (spine) for (const m of fs.readFileSync(spine, 'utf8').matchAll(/^### AD-(\d+) — (.+?)(?:\s*`\[.*)?$/gm)) adTitles.set(+m[1], m[2]);
  for (const l of applyPlan(plan, gh, { adTitles })) console.error(l);
  return 0;
}

module.exports = { stageOf, planSync, applyPlan, summarize, TIERS, STAGES, BOARD_LABELS, FIELDS };
if (require.main === module) process.exit(main(process.argv.slice(2)));
