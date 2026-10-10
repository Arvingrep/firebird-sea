const test = require('node:test');
const assert = require('node:assert');
const { parseEpics, parseStatus, analyzeIssues, pickNext, renderIssue } = require('./story-to-issue.js');
const { sync } = require('./sync-sprint-status.js');

const EPICS = `# t
## Epic 1: 底座
### Story 1.1: 入库
As a 运营者,
I want 入库,
So that 可用。

**Acceptance Criteria:**

**Given** A
**When** B
**Then** C 见 AD-14

### Story 1.2: 迁移
**Acceptance Criteria:**

**Given** X
**When** Y
**Then** Z

## Epic 2: 付款
### Story 2.1: 收银台
**Acceptance Criteria:**

**Given** P
**When** Q
**Then** R
`;
const YAML = `# 注释保留
last_updated: 01-01-2026 00:00
development_status:
  epic-1: in-progress  # 行尾注释
  1-1-入库: review
  1-2-迁移: backlog
  epic-1-retrospective: optional

  epic-2: backlog
  2-1-收银台: backlog
`;
const epics = parseEpics(EPICS), st = parseStatus(YAML);
const withStatus = (o) => new Map([...st, ...Object.entries(o)]);

test('依赖：同 Epic 前序满足才可选，Epic 2 依赖 1.5 之类的跨 Epic 依赖', () => {
  assert.equal(pickNext(epics, st).story.id, '1.2');
  const done = withStatus({ '1-2-迁移': 'review' });
  assert.equal(pickNext(epics, done, { depsExtra: { 2: ['1.2'] } }).story.id, '2.1');
  const r = pickNext(epics, withStatus({ '1-2-迁移': 'in-progress' }), { depsExtra: { 2: ['1.2'] } });
  assert.match(r.reason, /1\.2 状态为|2\.1 依赖未满足：1\.2/);
  assert.equal(pickNext(epics, withStatus({ '1-2-迁移': 'in-progress' }), { story: '2.1', ignoreDeps: true }).story.id, '2.1');
});

test('在途上限：达到上限不再出题；按标签与标记统计', () => {
  const issues = [
    { number: 7, body: '<!-- bmad-story: 1-2-迁移 -->', labels: [{ name: 'agent:dev' }] },
    { number: 8, body: '<!-- bmad-story: 2-1-收银台 -->', labels: [{ name: 'agent:blocked' }] },
    { number: 9, body: '无标记', labels: [{ name: 'agent:dev' }] },
  ];
  const seen = analyzeIssues(issues);
  assert.equal(seen.inflight, 1);
  assert.deepEqual([...seen.keys].sort(), ['1-2-迁移', '2-1-收银台']);
  assert.match(pickNext(epics, st, { inflight: seen.inflight }).reason, /上限 1/);
  assert.equal(pickNext(epics, st, { inflight: 1, maxInflight: 2 }).story.id, '1.2');
  assert.match(pickNext(epics, st, { skipKeys: seen.keys }).reason, /已存在对应 Issue/);
});

test('正文生成：目标/验收/AD/规则/增量提示，且只带 agent:dev 标签', () => {
  const s = epics[0].stories[0];
  const r = renderIssue(s, { key: '1-1-入库', adTitles: new Map([[14, '火鸟核心不改']]), specFile: 'spec-1-1-x.md', testFile: 'scripts/acceptance/story-1-1.sh' });
  assert.equal(r.title, '[story:1-1-入库] Story 1.1 入库');
  assert.deepEqual(r.labels, ['agent:dev']);
  for (const frag of ['<!-- bmad-story: 1-1-入库 -->', 'I want 入库', '**Given** A', 'AD-14 — 火鸟核心不改', '`.github/`', 'spec-1-1-x.md', '≤ 300 行', '## 测试先行', '当前为红', 'scripts/acceptance/', '逐条验收条件', '<!-- test-first: present -->'])
    assert.ok(r.body.includes(frag), frag);
  assert.match(renderIssue(s, { key: '1-1-入库' }).body, /test-first: missing[\s\S]*尚无预置验收测试/);
  assert.doesNotMatch(r.body, /agent:qa|qa:accepted|qa:rejected|agent:blocked|agent:dev/);
});

test('状态回写：幂等、保留注释与顺序、epic 联动、非法输入', () => {
  const a = sync(YAML, '1-2-迁移', 'review', '02-02-2026 10:00');
  assert.ok(a.changed);
  assert.match(a.text, /1-2-迁移: review/);
  assert.match(a.text, /last_updated: 02-02-2026 10:00/);
  assert.match(a.text, /epic-1: in-progress {2}# 行尾注释/);
  const b = sync(a.text, '1.2', 'review', '03-03-2026 11:00');
  assert.equal(b.changed, false);
  assert.equal(b.text, a.text); // 未变化不刷新 last_updated
  const done = sync(sync(a.text, '1-1-入库', 'done').text, '1-2-迁移', 'done');
  assert.match(done.text, /epic-1: done {2}# 行尾注释/);
  assert.match(sync(YAML, '2-1-收银台', 'in-progress').text, /epic-2: in-progress/);
  assert.match(sync(YAML, '9-9-x', 'done').error, /找不到/);
  assert.match(sync(YAML, '1-2-迁移', 'finished').error, /非法状态/);
});
