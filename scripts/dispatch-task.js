#!/usr/bin/env node

/**
 * 一人 AI 团队：任务自动提炼与派发引擎 (Task Dispatcher)
 * 用法:
 *   node scripts/dispatch-task.js "需求内容或语音转文字" [模块] [优先级]
 * 示例:
 *   node scripts/dispatch-task.js "外卖订单增加 USDT TRC-20 扫码支付与15分钟倒计时" WAIMAI HIGH
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const rawPrompt = args[0];
const moduleName = (args[1] || 'CORE').toUpperCase();
const priority = (args[2] || 'MEDIUM').toUpperCase();

if (!rawPrompt) {
  console.error('❌ 请输入需求内容或语音转录文本！');
  console.log('示例: node scripts/dispatch-task.js "外卖结算页加上 USDT 支付" WAIMAI HIGH');
  process.exit(1);
}

const ROOT_DIR = path.resolve(__dirname, '..');
const TASKS_DIR = path.join(ROOT_DIR, '.agents', 'tasks');
const BACKLOG_FILE = path.join(TASKS_DIR, 'BACKLOG.md');

if (!fs.existsSync(TASKS_DIR)) {
  fs.mkdirSync(TASKS_DIR, { recursive: true });
}

// 1. 计算递增任务编号
let nextId = 1;
const existingFiles = fs.readdirSync(TASKS_DIR).filter(f => f.startsWith('TASK-') && f.endsWith('.md'));
existingFiles.forEach(file => {
  const match = file.match(/TASK-(\d+)/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num >= nextId) nextId = num + 1;
  }
});

const taskId = `TASK-${String(nextId).padStart(3, '0')}`;
const safeSlug = rawPrompt
  .replace(/[\s\t\n]+/g, '-')
  .replace(/[^\w\u4e00-\u9fa5\-]/g, '')
  .slice(0, 30);

const taskFileName = `${taskId}-${safeSlug}.md`;
const taskFilePath = path.join(TASKS_DIR, taskFileName);
const branchName = `feat/${taskId.toLowerCase()}-${safeSlug}`;
const today = new Date().toISOString().split('T')[0];

// 2. 自动生成标准结构化 Spec 文件
const specContent = `# Task Spec: ${taskId} - ${rawPrompt.slice(0, 40)}

> 任务编号: \`${taskId}\`  
> 涉及模块: \`${moduleName}\`  
> 优先级: \`${priority}\`  
> 状态: \`PENDING\`  
> 创建时间: ${today}  
> 推荐分支: \`${branchName}\`  

---

### 1. 业务目标 (Objective)
- **需求原声**：${rawPrompt}
- **解决问题**：实现 ${moduleName} 模块下关于“${rawPrompt.slice(0, 30)}”的高可用与去中心化落地。

---

### 2. 详细功能说明 (Specification)
1. 由 AI Agent 认领此任务后，检出分支并分析相关业务逻辑。
2. 依据 \`.agents/RULES.md\` 编写高质量生产代码与单元测试。
3. 如果涉及系统级交互或新接口，必须在 \`/docs/internal/\` 同步编写技术文档。

---

### 3. 验收标准 (Acceptance Criteria - AC)
- [ ] **AC 1**：核心功能开发完毕并通过本地功能探针验证。
- [ ] **AC 2**：涉及的前后端错误处理与超时风控机制完备。
- [ ] **AC 3 (Docs 卡点)**：同步修改或创建对应 \`/docs/\` 下的 Markdown 文档。
- [ ] **AC 4**：运行 \`make verify\` 全项自检绿标。
`;

fs.writeFileSync(taskFilePath, specContent, 'utf-8');
console.log(`✅ [1/3] 任务规格文件已生成: .agents/tasks/${taskFileName}`);

// 3. 更新 BACKLOG.md
if (fs.existsSync(BACKLOG_FILE)) {
  let backlogContent = fs.readFileSync(BACKLOG_FILE, 'utf-8');
  const newRow = `| \`${taskId}\` | ${rawPrompt.slice(0, 25)}... | ${moduleName} | \`${priority}\` | ${today} | [${taskFileName}](${taskFileName}) |\n`;
  
  if (backlogContent.includes('## ⏳ 待处理池 (Backlog / Pending)')) {
    backlogContent = backlogContent.replace(
      '| :--- | :--- | :--- | :--- | :--- | :--- |\n',
      `| :--- | :--- | :--- | :--- | :--- | :--- |\n${newRow}`
    );
    fs.writeFileSync(BACKLOG_FILE, backlogContent, 'utf-8');
    console.log(`✅ [2/3] 任务已自动登记入 BACKLOG.md`);
  }
}

// 4. 创建 Git 关联分支 (如果在 git 仓库中)
try {
  execSync(`git checkout -b "${branchName}"`, { cwd: ROOT_DIR, stdio: 'pipe' });
  console.log(`✅ [3/3] 已自动检出专属工作分支: ${branchName}`);
} catch (e) {
  console.log(`ℹ️ [3/3] 工作分支创建跳过或已存在: ${branchName}`);
}

console.log('\n======================================================');
console.log(`🎯 派单完毕！AI Agent 可直接读取上下文启动：`);
console.log(`   📄 文件: .agents/tasks/${taskFileName}`);
console.log('======================================================\n');
