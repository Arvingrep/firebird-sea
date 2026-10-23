const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { parseEpics, parseStatus, keyOf, depsOf, unmet, analyzeIssues, pickNext, renderIssue } = require('./story-to-issue.js');

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
  for (const frag of ['<!-- bmad-story: 1-1-入库 -->', 'I want 入库', '**Given** A', 'AD-14 — 火鸟核心不改', '`.github/`', 'spec-1-1-x.md', '≤ 1200 行', '## 测试先行', '当前为红', 'scripts/acceptance/', '逐条验收条件', '<!-- test-first: present -->'])
    assert.ok(r.body.includes(frag), frag);
  assert.match(renderIssue(s, { key: '1-1-入库' }).body, /test-first: missing[\s\S]*尚无预置验收测试/);
  assert.doesNotMatch(r.body, /agent:qa|qa:accepted|qa:rejected|agent:blocked|agent:dev/);
});

// ---------------------------------------------------------------------------
// A3：T 前缀 Epic（TMA epics：`## Epic T1:` / `### Story T1.1:`）
// 为什么需要这组用例：TMA 的 6 个 Epic / 22 个 Story 全部用 T 前缀编号，
// 而 key 派生、spec 路径、验收用例路径、Issue 正文四处都从同一个 id 推出来。
// 任何一处退化成 `1-1` 都会让 TMA Story 静默失效（详见 BMAD_PIPELINE.md §2）。
// ---------------------------------------------------------------------------

const EPICS_T = `# t
## Epic T1: 前置 Spike
### Story T1.1: 凭证 Spike
As a 运营者,
I want 验证,
So that 可行。

**Acceptance Criteria:**

**Given** canary 环境
**When** 构造凭证
**Then** 有书面结论

**Given** P 不可行
**When** 记录原因
**Then** 上报

### Story T1.2: 旁路确认
**Acceptance Criteria:**

**Given** A
**When** B
**Then** C

## Epic T2: 登录桥接
### Story T2.1: 桥接实现
**Acceptance Criteria:**

**Given** D
**When** E
**Then** F
`;
const epicsT = parseEpics(EPICS_T);
// 真实文件（pickNext / keyOf 的验收场景就是它们，避免用手搓夹具测不可达路径）
const REAL_EPICS = path.resolve(__dirname, '../../_bmad-output/planning-artifacts/epics.md');
const TMA_EPICS = path.resolve(__dirname, '../../_bmad-output/planning-artifacts/epics-tma-frontend.md');
const SPRINT_STATUS = path.resolve(__dirname, '../../_bmad-output/implementation-artifacts/sprint-status.yaml');

test('T 前缀解析：Epic T1 / Story T1.1 产出 id「T1.1」、t 为「T」、验收 2 条', () => {
  const s = epicsT[0].stories[0];
  assert.equal(s.id, 'T1.1');
  assert.equal(s.t, 'T');
  assert.equal(s.epic, 1);
  assert.equal(s.num, 1);
  assert.equal(s.acCount, 2);
});

test('T 前缀解析：Epic 与 Story 的层级归属不被 T 前缀打乱', () => {
  assert.equal(epicsT.length, 2);
  assert.equal(epicsT[0].t, 'T');
  assert.equal(epicsT[0].n, 1);
  assert.deepEqual(epicsT.map((e) => e.stories.map((s) => s.id)), [['T1.1', 'T1.2'], ['T2.1']]);
});

test('非 T 回归：Epic 1 / Story 1.1 解析结果不变，非 T Story 的 t 是空串', () => {
  const s = epics[0].stories[0];
  assert.equal(s.id, '1.1');
  assert.equal(s.epic, 1);
  assert.equal(s.num, 1);
  assert.equal(s.t, '');
  assert.equal(s.acCount, 1);
  assert.deepEqual([epics.length, epics[0].stories.length], [2, 2]);
});

test('keyOf 派生：T Story 未登记时派生「T1-1」，非 T Story 未登记时仍返回 undefined', () => {
  // T Story：sprint-status 里没有对应行 → 派生 key，让 TMA Story 可以被派单
  assert.equal(keyOf(epicsT[0].stories[0], st), 'T1-1');
  // 非 T Story：查不到必须是 undefined。这个差异是刻意的——若为所有 Story 都派生 key，
  // 忘了登记 sprint-status 的旧数字 Story 会突然变成可派单（见 BMAD_PIPELINE.md §2）。
  // 夹具走真实 parseStatus，key 形态保证是解析器真能产出的那种
  const 未登记 = parseStatus('development_status:\n  9-9-别的-story: backlog\n');
  assert.equal(keyOf(epics[0].stories[0], 未登记), undefined);
});

test('keyOf 命中：真实 sprint-status 经 parseStatus 解析后能命中带 slug 的完整 key', () => {
  // 夹具必须走真实解析链路（parseStatus → Map），不能手搓 Map：
  // parseStatus 的行正则是 ^\s{2}(\d+-\d+-[^\s:]+):，手搓能造出正则造不出的 key，那样的「命中」是假信心。
  const 真实status = parseStatus(fs.readFileSync(SPRINT_STATUS, 'utf8'));
  const 真实epics = parseEpics(fs.readFileSync(REAL_EPICS, 'utf8'));
  const key = keyOf(真实epics[0].stories[0], 真实status);
  assert.equal(key, '1-1-外卖模块原样入库');
  assert.ok(真实status.has(key), '命中的 key 必须真实存在于 parseStatus 的产出里');
});

test('parseStatus 造不出 T 前缀 key：T Story 走不到「命中」分支，只能是派生（KI-2 的另一面）', () => {
  // 这条把「不可达」本身钉成断言：T Story 的带 slug 命中路径当前**不存在**，
  // 所以任何用手搓 Map 断言 keyOf 能命中「T1-1-<slug>」的用例都是假信心。
  // 等 KI-2 修好（parseStatus 接受 T 前缀）时，这条会变红——那是应该改测试的信号，不是 bug。
  const st = parseStatus('development_status:\n  T1-1-凭证-spike: done\n  1-1-入库: review\n');
  assert.deepEqual([...st.keys()], ['1-1-入库'], 'parseStatus 不该把 T 前缀行收进 Map');
  // 因此在真实链路上，T Story 只可能拿到派生 key
  assert.equal(keyOf(epicsT[0].stories[0], st), 'T1-1');
});

test('pickNext 选 T Story：真实 TMA epics 选中 T1.1，key 为「T1-1」且依赖为空', () => {
  const tma = parseEpics(fs.readFileSync(TMA_EPICS, 'utf8'));
  const status = parseStatus(fs.readFileSync(SPRINT_STATUS, 'utf8'));
  const pick = pickNext(tma, status);
  assert.equal(pick.story && pick.story.id, 'T1.1');
  assert.equal(pick.key, 'T1-1');
  assert.deepEqual(pick.unmet, []);
});

test('depsOf 隔离：T2 不吃 EPIC_DEPS[2]=「1.5」，非 T 的 Epic 2 仍照旧吃', () => {
  // EPIC_DEPS[2]=['1.5'] 指的是数字 Epic 1.5，TMA 里只有 T1.5；若不隔离，
  // T2 的每个 Story 都会被判「依赖未满足」永久 blocked。
  assert.deepEqual(depsOf(epicsT[1].stories[0], epicsT), []);
  assert.deepEqual(depsOf(epics[1].stories[0], epics), ['1.5']);
});

test('renderIssue 三处 id 一致：title / body 标记 / 验收用例路径都是 T1-1', () => {
  const r = renderIssue(epicsT[0].stories[0], { key: 'T1-1' });
  assert.equal(r.title, '[story:T1-1] Story T1.1 凭证 Spike');
  assert.ok(r.body.includes('<!-- bmad-story: T1-1 -->'), '缺 body 标记');
  assert.ok(r.body.includes('scripts/acceptance/story-T1-1.sh'), '缺 T1-1 验收用例路径');
  assert.ok(!r.body.includes('story-1-1.sh'), '退化成 story-1-1.sh');
  assert.ok(r.body.includes('BMAD Epic T1 · Story T1.1'), '来源行缺 T 前缀');
});

// KI-3：T 前缀 Epic 只能派第一个 Story。下面两条是**现状锚点**，不是对设计的认可。
// ⚠️ 修 KI-2（sync-sprint-status 回写认不了 T1-1）/ KI-3 时，必须同步改这两条断言。
test('KI-3 已知限制：T1.1 未登记时 T1.2 被判「依赖未满足」', () => {
  assert.deepEqual(unmet(epicsT[0].stories[1], epicsT, st), ['T1.1']);
});

test('KI-3 解锁条件：sprint-status 出现「T1-1: done」后 T1.2 依赖即满足', () => {
  // ⚠️ 夹具是**假设性**的：这个 Map 当前造不出来——parseStatus 不收 T 前缀行（见「造不出 T 前缀 key」那条）。
  // 保留它是为了钉住 keyOf/unmet 的解耦方式：缺口只在上游回写（KI-2），不在依赖判定逻辑本身。
  // 修好 KI-2 后这条应当改成「喂真实 YAML → parseStatus → unmet」，届时会更可信。
  assert.deepEqual(unmet(epicsT[0].stories[1], epicsT, new Map([['T1-1', 'done']])), []);
});
