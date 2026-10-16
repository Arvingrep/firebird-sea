// Story 7.1 POC 协议文档校验（非 API 业务测试；本 PR 只交付协议，不代表 Story 完成）。
// 结构测试只证明模板完整；验收结果测试在仍有「待测/待定/待选/待填」占位时直接失败，不冒充 AC 已满足。
// 故意不挂入 npm test（否则 owner 按 Issue #119 填写实测前 CI 恒红）；实测完成后由 owner 迁入 scripts/acceptance/story-7-1.sh（受保护路径）。
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const doc = fs.readFileSync(path.join(__dirname, '../../../docs/internal/OPENHANDS_CANVAS_POC.md'), 'utf8');
const sec = (from, to) => (doc.split(to)[0].split(from)[1] || '');
const noPlaceholder = (text, label) =>
  assert.doesNotMatch(text, /待测|待定|待选|待填/, `${label} 仍含占位，实测未完成，需 owner 本机执行后填写`);

test('文档结构：协议含各节标题、阈值与红线', () => {
  for (const k of ['安装耗时', '额外系统权限', 'Claude 账号登录态', 'Codex 账号登录态', 'ci-verify.yml',
    '完成耗时', '人工介入次数', 'QA 返工次数', '判定阈值', 'Issue #106', '第 6、7 节']) {
    assert.ok(doc.includes(k), `缺少：${k}`);
  }
  assert.match(doc, /未经 Arvin 批准，不得将 OpenHands Canvas 设为默认编排器/);
});

test('验收结果 AC1：安装与连通实测已填写', () => {
  noPlaceholder(sec('## 一、', '## 二、'), 'AC1');
});

test('验收结果 AC2：真实 canary PR 编号与门禁/QA 结果已填写', () => {
  const section = sec('## 二、', '## 三、与');
  noPlaceholder(section, 'AC2');
  assert.match(section, /PR\s*#\d+|pull\/\d+/);
});

test('验收结果 AC3：对照表数值已填写', () => {
  noPlaceholder(sec('## 三、与', '## 三·补'), 'AC3');
});

test('验收结果 AC4：结论已填写并指向 Issue #106 评论', () => {
  const section = sec('## 四、', '## 五、');
  noPlaceholder(section, 'AC4');
  assert.match(section, /issues\/106#issuecomment-\d+/);
});
