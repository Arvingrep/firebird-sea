// Story 7.1 POC 协议文档校验（非 API 业务测试，未挂入 npm test；owner 可手动 `node --test` 或迁入验收脚本）。
// 结构测试只证明模板完整；验收结果测试在仍有「待测/待定/待选/待填」占位时标记 todo，不冒充 AC 已满足。
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const doc = fs.readFileSync(path.join(__dirname, '../../../docs/internal/OPENHANDS_CANVAS_POC.md'), 'utf8');
const hasPlaceholder = /待测|待定|待选|待填/.test(doc);
const pending = hasPlaceholder ? '文档仍含占位，实测未完成，需 owner 本机执行后填写' : false;

test('文档结构：协议含各节标题、阈值与红线', () => {
  for (const k of ['安装耗时', '额外系统权限', 'Claude 账号登录态', 'Codex 账号登录态', 'ci-verify.yml',
    '完成耗时', '人工介入次数', 'QA 返工次数', '判定阈值', 'Issue #106', '第 6、7 节']) {
    assert.ok(doc.includes(k), `缺少：${k}`);
  }
  assert.match(doc, /未经 Arvin 批准，不得将 OpenHands Canvas 设为默认编排器/);
});

test('验收结果 AC1：安装与连通实测已填写', { todo: pending }, () => {
  const section = doc.split('## 二、')[0].split('## 一、')[1] || '';
  assert.doesNotMatch(section, /待测/);
});

test('验收结果 AC2：真实 canary PR 编号已填写', { todo: pending }, () => {
  assert.match(doc, /#\d+/);
  const section = doc.split('## 三、')[0].split('## 二、')[1] || '';
  assert.doesNotMatch(section, /待测|待选/);
});

test('验收结果 AC3：对照表数值已填写', { todo: pending }, () => {
  const section = doc.split('## 四、')[0].split('## 三、与')[1] || '';
  assert.doesNotMatch(section, /待测/);
});
