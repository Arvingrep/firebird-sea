const test = require('node:test');
const assert = require('node:assert');
const { sync } = require('./sync-sprint-status.js');

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
