// Story 7.1 OpenHands Canvas POC：校验 POC 记录文档结构完整，且未越权声明替换现有管道
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const doc = fs.readFileSync(path.join(__dirname, '../../../docs/internal/OPENHANDS_CANVAS_POC.md'), 'utf8');

test('AC1 安装与连通记录包含耗时、系统权限、GitHub 与 Claude/Codex 登录态', () => {
  assert.match(doc, /npm install -g @openhands\/agent-canvas && agent-canvas/);
  for (const k of ['安装耗时', '额外系统权限', 'GitHub 仓库', 'Claude 账号登录态', 'Codex 账号登录态']) {
    assert.ok(doc.includes(k), `缺少：${k}`);
  }
});

test('AC2 canary 实跑记录覆盖 PR、ci-verify 门禁与独立 QA，且限定非资金路径', () => {
  assert.match(doc, /Intake → Planner → Worktree → Dev → Test → PR/);
  assert.match(doc, /ci-verify\.yml/);
  assert.match(doc, /独立 QA/);
  assert.match(doc, /无资金路径/);
});

test('AC3 对照表包含全部对比指标', () => {
  for (const k of ['完成耗时', '人工介入次数', 'Agent 失败与恢复次数', 'QA 返工次数', '是否值得替换']) {
    assert.ok(doc.includes(k), `缺少：${k}`);
  }
  assert.match(doc, /dev\.sh\/qa\.sh/);
});

test('AC4 上报 Issue #106 且未经批准不得设为默认编排器或下线 Shell 管道', () => {
  assert.match(doc, /Issue #106/);
  assert.match(doc, /未经 Arvin 批准，不得将 OpenHands Canvas 设为默认编排器/);
  assert.match(doc, /不得下线/);
});

test('AC5 红线：不触碰生产集群与密钥，引用 RULES 第 6、7 节', () => {
  assert.match(doc, /不触碰生产集群与密钥值/);
  assert.match(doc, /第 6、7 节/);
});
