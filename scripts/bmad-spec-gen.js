#!/usr/bin/env node

/**
 * BMAD 自动需求规格生成引擎 (BMAD Specification Generator)
 * 将宏观 Epic 需求自动拆解为包含 Dev 任务与 QA 验收探针的严格任务单。
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const epicCode = (args[0] || 'EPIC-CORE').toUpperCase();
const title = args[1] || '未命名需求';

if (!title) {
  console.log('用法: node scripts/bmad-spec-gen.js <EPIC编号> <需求标题>');
  process.exit(1);
}

const ROOT_DIR = path.resolve(__dirname, '..');
const TASKS_DIR = path.join(ROOT_DIR, '.agents', 'tasks');
const fileName = `STORY-${epicCode}-${Date.now().toString().slice(-4)}.md`;
const filePath = path.join(TASKS_DIR, fileName);

const content = `# BMAD Story Spec: [${epicCode}] ${title}

> 状态: \`SPEC_READY\`  
> 责任分工:  
> - **实现者**: Dev Agent  
> - **独立验收者**: Acceptance Agent (Red Team)  

---

## 1. 业务场景与价值 (Business Value)
- **需求概述**：${title}
- **落地模块**：${epicCode}

---

## 2. Dev Agent 开发指令与交付物
1. 实现核心业务逻辑代码，严禁硬编码敏感私钥。
2. 保持与现有火鸟框架接口兼容。
3. 同步产出或更新 \`/docs/internal/\` 下对应技术规格说明。

---

## 3. Acceptance Agent 独立红队验收准则 (Acceptance Criteria)
- [ ] **AC 1 (功能完整性)**：调用自动化测试脚本，端到端执行成功。
- [ ] **AC 2 (边界与安全)**：异常入参、伪造签名被成功拦截且无敏感错误信息泄露。
- [ ] **AC 3 (文档同步)**：Docs-as-code 检查无遗漏。
- [ ] **AC 4 (最终裁决)**：验收报告归档并签发 \`ACCEPTED\`。
`;

fs.writeFileSync(filePath, content, 'utf-8');
console.log(`✅ [BMAD] 需求规格已自动生成: .agents/tasks/${fileName}`);
