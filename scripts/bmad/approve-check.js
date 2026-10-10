#!/usr/bin/env node
// bmad:approved 派发校验：纯函数 evaluateApprove 供 bmad-approve.yml 与单测调用。
// CLI：node approve-check.js --issue N --sender LOGIN [--apply]；环境 HOMEPAGE_OK=1/0、AGENT_AUTO_MERGE。
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { parseEpics, parseStatus, keyOf, unmet } = require('./story-to-issue.js');
const { TIERS } = require('./project-sync.js');

const REPO = process.env.BMAD_REPO || 'Arvingrep/firebird-sea';
const MARK = /<!-- bmad-story: (\S+) -->/;

// ctx: { senderIsOwner, labels[], inflight, maxInflight=1, autoMerge, halt, tier, unmetDeps[], homepageOk }
function evaluateApprove(ctx) {
  if (!ctx.senderIsOwner) return { verdict: 'ignore', reasons: ['bmad:approved 由 owner 之外的人添加，忽略'] };
  if (ctx.labels.includes('agent:dev')) return { verdict: 'noop', reasons: ['已带 agent:dev，在途中'] };
  const no = [];
  if (ctx.halt) no.push('存在 bmad:halt 熔断标签，派发暂停');
  if (ctx.inflight >= (ctx.maxInflight ?? 1)) no.push(`在途 agent:dev Issue ${ctx.inflight} 个 ≥ 上限 ${ctx.maxInflight ?? 1}`);
  if (ctx.unmetDeps && ctx.unmetDeps.length) no.push(`依赖未满足: ${ctx.unmetDeps.join(', ')}`);
  if (String(ctx.autoMerge ?? '0') !== '0') no.push(`AGENT_AUTO_MERGE=${ctx.autoMerge} ≠ 0，先关闭自动合并`);
  if (ctx.tier === 'human' && !ctx.labels.includes('bmad:human-ack')) no.push('分级为 human，需先补 bmad:human-ack 二次确认');
  if (!ctx.homepageOk) no.push('线上首页健康检查未通过（疑似 5xx），派发熔断');
  if (no.length) return { verdict: 'reject', reasons: no, removeLabel: 'bmad:approved' };
  return { verdict: 'approve', addLabel: 'agent:dev', reasons: ['校验全部通过'] };
}

function main(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) a[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
  const gh = (args) => execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 16e6 });
  let issues;
  try { issues = JSON.parse(gh(['issue', 'list', '-R', REPO, '--state', 'open', '--limit', '200', '--json', 'number,labels,body'])); }
  catch {
    issues = JSON.parse(gh(['api', `repos/${REPO}/issues?state=open&per_page=100`, '--paginate'])).map((i) => ({
      number: i.number,
      labels: (i.labels || []).map((l) => ({ name: typeof l === 'string' ? l : l.name })),
      body: i.body || ''
    }));
  }
  const target = issues.find((i) => i.number === +a.issue);
  if (!target) { console.error(`Issue #${a.issue} 不是 open 状态或不存在`); return 2; }
  const labels = (target.labels || []).map((l) => l.name || l);
  const key = ((target.body || '').match(MARK) || [])[1];
  const out = path.resolve(__dirname, '../../_bmad-output');
  const epics = parseEpics(fs.readFileSync(path.join(out, 'planning-artifacts/epics.md'), 'utf8'));
  const status = parseStatus(fs.readFileSync(path.join(out, 'implementation-artifacts/sprint-status.yaml'), 'utf8'));
  const story = epics.flatMap((e) => e.stories).find((s) => keyOf(s, status) === key);
  const ctx = {
    senderIsOwner: (a.sender || '') === REPO.split('/')[0],
    labels,
    inflight: issues.filter((i) => (i.labels || []).some((l) => (l.name || l) === 'agent:dev')).length,
    autoMerge: process.env.AGENT_AUTO_MERGE ?? '0',
    halt: issues.some((i) => (i.labels || []).some((l) => (l.name || l) === 'bmad:halt')),
    tier: story ? TIERS[story.id] : 'human', // 找不到 Story 一律按最严处理
    unmetDeps: story ? unmet(story, epics, status) : [`无法从 Issue 正文解析 bmad-story 标记（key=${key}）`],
    homepageOk: process.env.HOMEPAGE_OK === '1',
  };
  const r = evaluateApprove(ctx);
  console.log(JSON.stringify({ issue: +a.issue, key, ctx: { ...ctx, labels: undefined }, ...r }, null, 2));
  if (a.apply === true) {
    const msg = `bmad-approve: **${r.verdict}**\n\n${r.reasons.map((x) => `- ${x}`).join('\n')}`;
    const addLabel = (n, l) => {
      try { gh(['issue', 'edit', n, '-R', REPO, '--add-label', l]); }
      catch { gh(['api', '-X', 'POST', `repos/${REPO}/issues/${n}/labels`, '-f', `labels[]=${l}`]); }
    };
    const removeLabel = (n, l) => {
      try { gh(['issue', 'edit', n, '-R', REPO, '--remove-label', l]); }
      catch { gh(['api', '-X', 'DELETE', `repos/${REPO}/issues/${n}/labels/${encodeURIComponent(l)}`]); }
    };
    const addComment = (n, b) => {
      try { gh(['issue', 'comment', n, '-R', REPO, '--body', b]); }
      catch { gh(['api', '-X', 'POST', `repos/${REPO}/issues/${n}/comments`, '-f', `body=${b}`]); }
    };
    if (r.verdict === 'approve') { addLabel(a.issue, r.addLabel); addComment(a.issue, msg); }
    else if (r.verdict === 'reject') { addComment(a.issue, msg); removeLabel(a.issue, r.removeLabel); }
  }
  return r.verdict === 'reject' ? 1 : 0;
}

module.exports = { evaluateApprove };
if (require.main === module) process.exit(main(process.argv.slice(2)));
