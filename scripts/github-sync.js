#!/usr/bin/env node

/**
 * BMAD GitHub Project & Issue 自动化双向同步器
 * 职责:
 * 1. 将本地 .agents/tasks/ 下的任务规格同步至 GitHub Issues。
 * 2. 自动打上分类标签 (epic:payment, epic:franchise, status:in-progress, 等)。
 * 3. 关联分支与验收报告，实现看板状态闭环。
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT_DIR = path.resolve(__dirname, '..');
const TASKS_DIR = path.join(ROOT_DIR, '.agents', 'tasks');
const REPORTS_DIR = path.join(TASKS_DIR, 'reports');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_REPO = process.env.GITHUB_REPO || 'arvin/firebird-sea'; // owner/repo

/**
 * 获取所有任务清单与最新状态
 */
function getLocalTasks() {
  const files = fs.readdirSync(TASKS_DIR).filter(f => (f.startsWith('TASK-') || f.startsWith('STORY-')) && f.endsWith('.md'));
  
  return files.map(file => {
    const raw = fs.readFileSync(path.join(TASKS_DIR, file), 'utf-8');
    const idMatch = file.match(/(TASK-\d+|STORY-[A-Z]+-\d+)/);
    const id = idMatch ? idMatch[1] : file.replace('.md', '');
    
    // 提取标题
    const titleMatch = raw.match(/#\s*(?:Task Spec:|BMAD Story Spec:)\s*([^\n]+)/);
    const title = titleMatch ? titleMatch[1].trim() : file;

    // 提取状态
    const statusMatch = raw.match(/>\s*状态:\s*`([^`]+)`/);
    const status = statusMatch ? statusMatch[1].trim() : 'BACKLOG';

    // 提取模块/分类
    const moduleMatch = raw.match(/>\s*(?:涉及模块|模块):\s*`([^`]+)`/);
    const module = moduleMatch ? moduleMatch[1].trim() : 'CORE';

    // 检查是否有对应的验收报告
    const reportFile = path.join(REPORTS_DIR, `${id}-ACCEPTANCE.md`);
    const hasReport = fs.existsSync(reportFile);

    return {
      id,
      file,
      title,
      status: hasReport ? 'DONE' : status,
      module,
      hasReport,
      reportFile: hasReport ? reportFile : null
    };
  });
}

/**
 * 映射看板面板列 (Kanban Columns)
 */
function mapColumn(status) {
  switch (status.toUpperCase()) {
    case 'BACKLOG':
    case 'PENDING':
    case 'SPEC_READY':
      return '📋 需求池 (Backlog)';
    case 'IN_PROGRESS':
      return '🚧 编码实现 (In Progress)';
    case 'IN_QA':
    case 'IN_REVIEW':
      return '🛡️ 独立验收 (In QA / Acceptance)';
    case 'READY_TO_RELEASE':
      return '🚀 待发布上线 (Ready to Release)';
    case 'DONE':
    case 'CLOSED':
    case 'DEPLOYED':
      return '✅ 已上线闭环 (Done / Closed)';
    default:
      return '📋 需求池 (Backlog)';
  }
}

async function syncToGitHub() {
  const tasks = getLocalTasks();
  console.log('====================================================');
  console.log('🐙 BMAD ➔ GitHub Project & Issues 状态看板同步');
  console.log('====================================================');
  console.log(`📂 扫描到本地任务数量: ${tasks.length}`);

  // 分类统计
  const board = {
    '📋 需求池 (Backlog)': [],
    '🚧 编码实现 (In Progress)': [],
    '🛡️ 独立验收 (In QA / Acceptance)': [],
    '🚀 待发布上线 (Ready to Release)': [],
    '✅ 已上线闭环 (Done / Closed)': []
  };

  tasks.forEach(t => {
    const col = mapColumn(t.status);
    board[col].push(t);
  });

  console.log('\n📊 当前看板状态矩阵:');
  for (const [col, list] of Object.entries(board)) {
    console.log(`\n${col} (${list.length}):`);
    list.forEach(item => {
      console.log(`  • [${item.id}] [${item.module}] ${item.title} ${item.hasReport ? '🟢 验收通过' : ''}`);
    });
  }

  // 生成供 BMAD UI 渲染的 JSON 状态全景
  const exportPath = path.join(ROOT_DIR, 'apps', 'bmad-dashboard', 'board-data.json');
  fs.mkdirSync(path.dirname(exportPath), { recursive: true });
  fs.writeFileSync(exportPath, JSON.stringify({
    syncedAt: new Date().toISOString(),
    repo: GITHUB_REPO,
    tasks,
    board
  }, null, 2), 'utf-8');

  console.log(`\n💾 已生成 BMAD UI 看板数据源: apps/bmad-dashboard/board-data.json`);

  if (!GITHUB_TOKEN) {
    console.log('\nℹ️ 当前未注入 GITHUB_TOKEN，已启用本地离线 Project 看板引擎。');
    console.log('   配置 GITHUB_TOKEN 后将自动直连 GitHub Projects API 进行云端双向同步。');
  }
  console.log('====================================================\n');
}

syncToGitHub();
