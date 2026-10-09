#!/usr/bin/env node

/** GitHub Project V2 is the BMAD board source of truth. */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const OWNER = process.env.BMAD_PROJECT_OWNER || 'Arvingrep';
const NUMBER = process.env.BMAD_PROJECT_NUMBER || '3';
const PROJECT_ID = process.env.BMAD_PROJECT_ID || 'PVT_kwHOAuOIfM4BmVo3';
const FIELD_NAME = 'BMAD Stage';
const STAGES = {
  backlog: '📋 需求池 (Backlog)',
  'in-progress': '🚧 编码实现 (In Progress)',
  'in-qa': '🛡️ 独立验收 (In QA / Acceptance)',
  'ready-to-release': '🚀 待发布上线 (Ready to Release)',
  done: '✅ 已上线闭环 (Done / Closed)',
};
const BOARD_COLUMNS = Object.values(STAGES);

function gh(args) {
  const env = { ...process.env };
  // The self-hosted runner's gh OAuth login has user-project scope; the repo PAT does not.
  if (env.BMAD_USE_GH_OAUTH === '1') delete env.GH_TOKEN;
  return execFileSync('gh', args, { encoding: 'utf8', env }).trim();
}

function fields() {
  return JSON.parse(gh(['project', 'field-list', NUMBER, '--owner', OWNER, '--format', 'json'])).fields;
}

function setStage(url, key) {
  const stage = STAGES[key] || key;
  if (!BOARD_COLUMNS.includes(stage)) throw new Error(`Unknown BMAD stage: ${key}`);
  const field = fields().find(f => f.name === FIELD_NAME);
  if (!field) throw new Error(`Project field not found: ${FIELD_NAME}`);
  const option = field.options.find(o => o.name === stage);
  if (!option) throw new Error(`Project option not found: ${stage}`);
  gh(['project', 'item-add', NUMBER, '--owner', OWNER, '--url', url]);
  const items = JSON.parse(gh(['project', 'item-list', NUMBER, '--owner', OWNER, '--limit', '1000', '--format', 'json'])).items;
  const item = items.find(i => i.content && i.content.url === url);
  if (!item) throw new Error(`Project item was not added: ${url}`);
  gh(['project', 'item-edit', '--id', item.id, '--project-id', PROJECT_ID,
    '--field-id', field.id, '--single-select-option-id', option.id]);
  return { url, stage, itemId: item.id };
}

function exportBoard() {
  const response = JSON.parse(gh(['project', 'item-list', NUMBER, '--owner', OWNER, '--limit', '1000', '--format', 'json']));
  const board = Object.fromEntries(BOARD_COLUMNS.map(name => [name, []]));
  const tasks = response.items.map(item => {
    const c = item.content || {};
    const stage = item['bMAD Stage'] || STAGES.backlog;
    const task = {
      id: c.type === 'PullRequest' ? `PR-${c.number}` : `ISSUE-${c.number}`,
      number: c.number,
      type: c.type,
      title: c.title || item.title,
      status: stage,
      url: c.url,
      repository: c.repository || item.repository,
      labels: item.labels || [],
    };
    (board[stage] || board[STAGES.backlog]).push(task);
    return task;
  });
  const payload = { syncedAt: new Date().toISOString(), project: `https://github.com/users/${OWNER}/projects/${NUMBER}`, tasks, board };
  const dir = path.join(ROOT, 'apps', 'bmad-dashboard');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'board-data.json'), JSON.stringify(payload) + '\n');
  fs.writeFileSync(path.join(dir, 'board-data.js'), `window.__BMAD = ${JSON.stringify(payload)};\n`);
  console.log(`Exported ${tasks.length} GitHub Project items to apps/bmad-dashboard/board-data.{json,js}`);
}

const args = process.argv.slice(2);
if (args[0] === '--set-stage') {
  if (args.length !== 3) throw new Error('Usage: --set-stage <url> <stage-key>');
  console.log(JSON.stringify(setStage(args[1], args[2])));
} else if (args.length) {
  throw new Error(`Unknown arguments: ${args.join(' ')}`);
} else {
  exportBoard();
}
