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

// 2. 自动生成标准结构化 Spec 文件 (执行脱水剪枝)
const nativeCheck = [];
if (/分站|代理|城市/.test(rawPrompt)) nativeCheck.push('火鸟自带城市分站/总代理体系，优先复用原生城市ID与分成配置');
if (/语言|翻译|英文|菲律宾语/.test(rawPrompt)) nativeCheck.push('火鸟自带多语言词库 (include/lang/)，直接拓展对应语言包');
if (/支付|充值|USDT|Coins/.test(rawPrompt)) nativeCheck.push('火鸟标准支付插件接口 (api/payment/)，严禁修改核心订单表');

const nativeHint = nativeCheck.length > 0 ? nativeCheck.map(c => `- ⚠️ **原生复用提示**：${c}`).join('\n') : '- 经过原生检索，该需求确需新增独立适配组件。';

const specContent = `# Task Spec: ${taskId} - ${rawPrompt.slice(0, 40)}

> 任务编号: \`${taskId}\`  
> 涉及模块: \`${moduleName}\`  
> 优先级: \`${priority}\`  
> 状态: \`PENDING\`  
> 创建时间: ${today}  
> 推荐分支: \`${branchName}\`  

---

### 1. 业务目标与脱水定义 (Objective & Scope Dehydration)
- **需求原声**：${rawPrompt}
- **脱水交付目标**：实现 ${moduleName} 下关于“${rawPrompt.slice(0, 30)}”的单一核心闭环。
${nativeHint}

---

### 2. 防臃肿约束 (Anti-Bloat Constraints)
- **Zero-Dep 守则**：严禁引入未批准的外部重型依赖，优先使用 Node.js / PHP 内置原生库。
- **Diff 行数控制**：代码修改增量原则上不得超过 200 行，拒绝过度封装。
- **环境整洁**：严禁遗留 \`.bak\`、临时文件或未清理的调试打印。

---

### 3. 单一验收准则 (Atomic Acceptance Criteria)
- [ ] **AC 1 (单一核心功能)**：核心功能开发完毕并通过独立功能探针测试。
- [ ] **AC 2 (Docs 卡点)**：同步修改或创建对应 \`/docs/\` 下的 Markdown 文档。
- [ ] **AC 3 (防臃肿合规)**：通过 \`make dev-check\` 检查，无新增冗余依赖且代码无死垃圾。
- [ ] **AC 4 (独立红队验收)**：通过 \`make accept TASK=${taskId}\` 审查并签发通过报告。
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
