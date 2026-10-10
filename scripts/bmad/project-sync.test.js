const test = require('node:test');
const assert = require('node:assert');
const { stageOf, planSync, summarize } = require('./project-sync.js');
const { evaluateApprove } = require('./approve-check.js');
const { parseEpics, parseStatus } = require('./story-to-issue.js');

const EPICS = `# t
## Epic 1: 底座
### Story 1.1: 入库
**Acceptance Criteria:**
**Given** A
### Story 1.2: 迁移
**Acceptance Criteria:**
**Given** X
## Epic 2: 付款
### Story 2.1: 收银台
**Acceptance Criteria:**
**Given** P
`;
const YAML = `development_status:
  1-1-入库: review
  1-2-迁移: backlog
  2-1-收银台: backlog
`;
const epics = parseEpics(EPICS), status = parseStatus(YAML);
const mkIssue = (n, key, labels = [], state = 'OPEN') => ({ number: n, state, url: `u/${n}`, body: `<!-- bmad-story: ${key} -->`, labels: labels.map((x) => ({ name: x })) });

test('建档计划：无 Issue 全部 create-issue + 上板 + set-fields；Project 不可读按全量保守', () => {
  const plan = planSync({ epics, status, issues: [], items: null });
  assert.equal(plan.length, 3);
  for (const p of plan) for (const op of ['create-issue', 'add-to-project', 'set-fields']) assert.ok(p.actions.includes(op), `${p.key} ${op}`);
  const s = summarize(plan, false);
  assert.deepEqual([s.willCreateIssues, s.willAddProjectItems], [3, 3]);
});

test('幂等：marker 匹配即复用，不重复建；bmad:void 不算复用；已上板不再 add', () => {
  const issues = [mkIssue(17, '1-2-迁移', [], 'CLOSED'), mkIssue(9, '2-1-收银台', ['bmad:void'])];
  const plan = planSync({ epics, status, issues, items: [{ content: { url: 'u/17' } }] });
  const p12 = plan.find((p) => p.key === '1-2-迁移'), p21 = plan.find((p) => p.key === '2-1-收银台');
  assert.ok(!p12.actions.includes('create-issue') && p12.actions.includes('reopen-issue'), 'reopen 复用 #17');
  assert.ok(!p12.actions.includes('add-to-project') && p12.actions.includes('add-label:bmad:story'));
  assert.ok(p21.actions.includes('create-issue'), 'void Issue 让位，重建');
});

test('依赖与可开工：前序未完则 Ready=No 并写阻塞原因；分级来自 TIERS', () => {
  const plan = planSync({ epics, status, issues: [], tiers: { '1.2': 'pr' } });
  const p12 = plan.find((p) => p.key === '1-2-迁移'), p21 = plan.find((p) => p.key === '2-1-收银台');
  assert.equal(p12.fields['可开工 (Ready)'], 'Yes'); // 1.1=review 满足
  assert.deepEqual([p12.fields['分级 (Tier)'], p12.fields['依赖']], ['pr', '1.1']);
  assert.equal(p21.fields['可开工 (Ready)'], 'No'); // 依赖 1.1,1.5(不存在)
  assert.match(p21.fields['阻塞原因'], /依赖未满足.*1\.5/);
});

test('状态映射：sprint 基线 + 标签覆盖 + closed=done', () => {
  assert.equal(stageOf({ sprint: 'backlog' }), 'backlog');
  assert.equal(stageOf({ sprint: 'ready-for-dev' }), 'backlog');
  assert.equal(stageOf({ sprint: 'review' }), 'in-qa');
  assert.equal(stageOf({ sprint: 'backlog', labels: ['agent:dev'] }), 'in-progress');
  assert.equal(stageOf({ sprint: 'backlog', labels: ['agent:qa'] }), 'in-qa');
  assert.equal(stageOf({ sprint: 'backlog', labels: ['qa:accepted'] }), 'ready-to-release');
  assert.equal(stageOf({ sprint: 'backlog', state: 'CLOSED' }), 'done');
});

test('approve 校验：非 owner 忽略；每个失败条件给原因并撤标签；全过才补 agent:dev', () => {
  const ok = { senderIsOwner: true, labels: [], inflight: 0, autoMerge: '0', halt: false, tier: 'pr', unmetDeps: [], homepageOk: true };
  assert.equal(evaluateApprove({ ...ok, senderIsOwner: false }).verdict, 'ignore');
  assert.equal(evaluateApprove({ ...ok, labels: ['agent:dev'] }).verdict, 'noop');
  for (const [bad, re] of [[{ halt: true }, /halt/], [{ inflight: 1 }, /在途.*上限/], [{ unmetDeps: ['1.5'] }, /依赖未满足: 1\.5/],
    [{ autoMerge: '1' }, /AUTO_MERGE/], [{ tier: 'human' }, /human-ack/], [{ homepageOk: false }, /首页/]]) {
    const r = evaluateApprove({ ...ok, ...bad });
    assert.equal(r.verdict, 'reject');
    assert.equal(r.removeLabel, 'bmad:approved');
    assert.ok(r.reasons.some((x) => re.test(x)), re.toString());
  }
  const human = evaluateApprove({ ...ok, tier: 'human', labels: ['bmad:human-ack'] });
  const r = evaluateApprove(ok);
  assert.deepEqual([r.verdict, r.addLabel, human.verdict], ['approve', 'agent:dev', 'approve']);
});
