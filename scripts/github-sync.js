#!/usr/bin/env node

/** GitHub Project V2 is the BMAD board source of truth. */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const OWNER = process.env.BMAD_PROJECT_OWNER || 'Arvingrep';
const NUMBER = process.env.BMAD_PROJECT_NUMBER || '3';
const PROJECT_ID = process.env.BMAD_PROJECT_ID || 'PVT_kwHOAuOIfM4BmVo3';

// ── Field definitions ──────────────────────────────────────────
const FIELD_BMAD_STAGE = { id: 'PVTSSF_lAHOAuOIfM4BmVo3zhk_Jfg', name: 'BMAD Stage' };
const FIELD_EPIC = { id: 'PVTSSF_lAHOAuOIfM4BmVo3zhlDy-U', name: 'Epic' };
const FIELD_READY = { id: 'PVTSSF_lAHOAuOIfM4BmVo3zhlDzAU', name: '可开工 (Ready)' };
const FIELD_BLOCKER = { id: 'PVTF_lAHOAuOIfM4BmVo3zhlDzAY', name: '阻塞原因' };
const FIELD_START_DATE = { id: 'PVTF_lAHOAuOIfM4BmVo3zhl9IhE', name: '开始日期' };
const FIELD_TARGET_DATE = { id: 'PVTF_lAHOAuOIfM4BmVo3zhl9Ih8', name: '目标日期' };
const FIELD_CYCLE = { id: 'PVTIF_lAHOAuOIfM4BmVo3zhl9IiE', name: '周期 (Cycle)' };

const STAGES = {
  backlog: '📋 需求池 (Backlog)',
  'in-progress': '🚧 编码实现 (In Progress)',
  'in-qa': '🛡️ 独立验收 (In QA / Acceptance)',
  'ready-to-release': '🚀 待发布上线 (Ready to Release)',
  done: '✅ 已上线闭环 (Done / Closed)',
};
const BOARD_COLUMNS = Object.values(STAGES);

// ── gh helpers ─────────────────────────────────────────────────
function gh(args) {
  const env = { ...process.env };
  if (env.BMAD_USE_GH_OAUTH === '1') delete env.GH_TOKEN;
  return execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 16e6 }).trim();
}

function ghJson(args) {
  return JSON.parse(gh([...args, '--format', 'json']));
}

function ghApi(query, vars = {}) {
  const input = JSON.stringify({ query, variables: vars });
  return JSON.parse(gh(['api', 'graphql', '-f', `query=${query}`, ...Object.entries(vars).map(([k, v]) => ['-F', `${k}=${v}`]).flat()]));
}

// ── Project item helpers ───────────────────────────────────────
function addItem(url) {
  // Project item-add is idempotent — returns existing item if URL already on board
  return ghJson(['project', 'item-add', NUMBER, '--owner', OWNER, '--url', url]).id;
}

function setSingleSelect(itemId, field, optionName) {
  const opt = field.options.find(o => o.name === optionName);
  if (!opt) throw new Error(`Option not found: ${optionName} in field ${field.name}`);
  gh(['project', 'item-edit', '--id', itemId, '--project-id', PROJECT_ID,
    '--field-id', field.id, '--single-select-option-id', opt.id]);
}

function setText(itemId, field, value) {
  if (!value) return;
  gh(['project', 'item-edit', '--id', itemId, '--project-id', PROJECT_ID,
    '--field-id', field.id, '--text', value]);
}

function setDate(itemId, field, value) {
  if (!value) return;
  gh(['project', 'item-edit', '--id', itemId, '--project-id', PROJECT_ID,
    '--field-id', field.id, '--date', value]);
}

function setIteration(itemId, field, iterationId) {
  gh(['project', 'item-edit', '--id', itemId, '--project-id', PROJECT_ID,
    '--field-id', field.id, '--iteration-id', iterationId]);
}

function clearField(itemId, field) {
  gh(['project', 'item-edit', '--id', itemId, '--project-id', PROJECT_ID,
    '--field-id', field.id, '--clear']);
}

// ── Iteration helpers ──────────────────────────────────────────
function getIterations() {
  const query = `
    query($projectId: ID!) {
      node(id: $projectId) {
        ... on ProjectV2 {
          fields(first: 30) {
            nodes {
              ... on ProjectV2IterationField {
                id
                name
                configuration {
                  iterations {
                    id title startDate duration
                  }
                  completedIterations {
                    id title startDate duration
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  const result = ghApi(query, { projectId: PROJECT_ID });
  const fields = result.data.node.fields.nodes;
  const cycleField = fields.find(f => f.configuration && f.configuration.iterations);
  if (!cycleField) return [];
  const all = [
    ...(cycleField.configuration.iterations || []),
    ...(cycleField.configuration.completedIterations || []),
  ];
  return all;
}

function getCurrentIterationId() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const iterations = getIterations();

  // Helper: compute end date from startDate + duration (days)
  const endDate = (it) => {
    const d = new Date(it.startDate);
    d.setDate(d.getDate() + it.duration - 1);
    return d.toISOString().slice(0, 10);
  };

  // First, find one whose range covers today
  const active = iterations.find(it => it.startDate <= today && endDate(it) >= today);
  if (active) return active.id;

  // Otherwise, find the nearest upcoming one
  const upcoming = iterations
    .filter(it => it.startDate > today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  if (upcoming.length > 0) return upcoming[0].id;

  // Fallback: most recent that ended
  const recent = iterations
    .filter(it => it.startDate <= today)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
  if (recent.length > 0) return recent[0].id;

  return null;
}

function getCurrentIterationEndDate() {
  const today = new Date().toISOString().slice(0, 10);
  const iterations = getIterations();

  const endDate = (it) => {
    const d = new Date(it.startDate);
    d.setDate(d.getDate() + it.duration - 1);
    return d.toISOString().slice(0, 10);
  };

  const active = iterations.find(it => it.startDate <= today && endDate(it) >= today);
  if (active) return endDate(active);

  const upcoming = iterations
    .filter(it => it.startDate > today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  if (upcoming.length > 0) return endDate(upcoming[0]);

  return today; // fallback
}

function getCurrentIterationInfo() {
  const today = new Date().toISOString().slice(0, 10);
  const iterations = getIterations();

  const endDate = (it) => {
    const d = new Date(it.startDate);
    d.setDate(d.getDate() + it.duration - 1);
    return d.toISOString().slice(0, 10);
  };

  const active = iterations.find(it => it.startDate <= today && endDate(it) >= today);
  if (active) return { iterationId: active.id, title: active.title, startDate: active.startDate, endDate: endDate(active) };

  const upcoming = iterations
    .filter(it => it.startDate > today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  if (upcoming.length > 0) return { iterationId: upcoming[0].id, title: upcoming[0].title, startDate: upcoming[0].startDate, endDate: endDate(upcoming[0]) };

  return { iterationId: null, title: 'N/A', startDate: today, endDate: today };
}

// ── Field cache ────────────────────────────────────────────────
let _fields = null;
function fields() {
  if (_fields) return _fields;
  _fields = ghJson(['project', 'field-list', NUMBER, '--owner', OWNER]).fields;
  return _fields;
}

function fieldByName(name) {
  const f = fields().find(x => x.name === name);
  if (!f) throw new Error(`Project field not found: ${name}`);
  return f;
}

// ── Core commands ──────────────────────────────────────────────

// 1. Issue opened: add to project, set all initial fields
function onIssueOpened(url, labelsCsv) {
  const labels = (labelsCsv || '').split(',').map(s => s.trim()).filter(Boolean);
  const itemId = addItem(url);

  // Determine epic from labels: epic:1 → Epic 1
  let epicOption = null;
  for (const label of labels) {
    const m = label.match(/^epic:(\d+)$/);
    if (m) { epicOption = `Epic ${m[1]}`; break; }
  }

  // Get current iteration info
  const cycle = getCurrentIterationInfo();
  const today = new Date().toISOString().slice(0, 10);

  const result = { url, itemId, fields: {} };

  // BMAD Stage → 需求池
  const bmadField = fieldByName(FIELD_BMAD_STAGE.name);
  setSingleSelect(itemId, bmadField, STAGES.backlog);
  result.fields[FIELD_BMAD_STAGE.name] = STAGES.backlog;

  // Cycle → 当前迭代
  if (cycle.iterationId) {
    const cycleField = fieldByName(FIELD_CYCLE.name);
    setIteration(itemId, cycleField, cycle.iterationId);
    result.fields[FIELD_CYCLE.name] = cycle.title;
  } else {
    result.fields[FIELD_CYCLE.name] = 'no-active-iteration';
  }

  // 开始日期 → today
  setDate(itemId, fieldByName(FIELD_START_DATE.name), today);
  result.fields[FIELD_START_DATE.name] = today;

  // 目标日期 → iteration end date
  const targetDate = cycle.endDate || today;
  setDate(itemId, fieldByName(FIELD_TARGET_DATE.name), targetDate);
  result.fields[FIELD_TARGET_DATE.name] = targetDate;

  // Epic (if label epic:N)
  if (epicOption) {
    const epicField = fieldByName(FIELD_EPIC.name);
    setSingleSelect(itemId, epicField, epicOption);
    result.fields[FIELD_EPIC.name] = epicOption;
  }

  // 可开工 → No (default)
  const readyField = fieldByName(FIELD_READY.name);
  setSingleSelect(itemId, readyField, 'No');
  result.fields[FIELD_READY.name] = 'No';

  return result;
}

// 2. Agent 开工 → 编码实现
function onAgentDev(url) {
  const itemId = addItem(url);
  const bmadField = fieldByName(FIELD_BMAD_STAGE.name);
  setSingleSelect(itemId, bmadField, STAGES['in-progress']);
  return { url, itemId, fields: { [FIELD_BMAD_STAGE.name]: STAGES['in-progress'] } };
}

// 3. PR closed unmerged → 退回编码实现 + 阻塞原因
function onPrClosedUnmerged(url, reason) {
  const itemId = addItem(url);
  const result = { url, itemId, fields: {} };

  // BMAD Stage → 编码实现
  const bmadField = fieldByName(FIELD_BMAD_STAGE.name);
  setSingleSelect(itemId, bmadField, STAGES['in-progress']);
  result.fields[FIELD_BMAD_STAGE.name] = STAGES['in-progress'];

  // 阻塞原因
  const blockerText = reason || 'PR 关闭未合并（无明确原因）';
  setText(itemId, fieldByName(FIELD_BLOCKER.name), blockerText);
  result.fields[FIELD_BLOCKER.name] = blockerText;

  return result;
}

// 4. Deploy success → 已上线闭环 + close issue
function onDeploySuccess(url, issueUrl) {
  const itemId = addItem(url);

  // BMAD Stage → 已上线闭环
  const bmadField = fieldByName(FIELD_BMAD_STAGE.name);
  setSingleSelect(itemId, bmadField, STAGES.done);

  // Clear blocker if any
  try { clearField(itemId, fieldByName(FIELD_BLOCKER.name)); } catch (e) { /* ignore */ }

  // Close the linked issue
  let issueNumber = null;
  if (issueUrl) {
    const m = issueUrl.match(/\/issues\/(\d+)$/);
    if (m) {
      issueNumber = m[1];
      try {
        gh(['issue', 'close', issueNumber, '-R', `${OWNER}/firebird-sea`, '--reason', 'completed']);
      } catch (e) {
        // ignore close failure
      }
    }
  }

  return { url, itemId, issueNumber, fields: { [FIELD_BMAD_STAGE.name]: STAGES.done } };
}

// 5. Set stage only (existing backward-compat)
function setStage(url, key) {
  const stage = STAGES[key] || key;
  if (!BOARD_COLUMNS.includes(stage)) throw new Error(`Unknown BMAD stage: ${key}`);
  const itemId = addItem(url);
  const bmadField = fieldByName(FIELD_BMAD_STAGE.name);
  setSingleSelect(itemId, bmadField, stage);
  return { url, stage, itemId };
}

// 6. Export board data (existing)
function exportBoard() {
  const response = ghJson(['project', 'item-list', NUMBER, '--owner', OWNER, '--limit', '1000']);
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

// ── CLI dispatch ───────────────────────────────────────────────
const args = process.argv.slice(2);
const cmd = args[0];

try {
  if (cmd === '--set-stage') {
    if (args.length !== 3) throw new Error('Usage: --set-stage <url> <stage-key>');
    console.log(JSON.stringify(setStage(args[1], args[2])));
  } else if (cmd === '--init-issue') {
    if (args.length < 2 || args.length > 3) throw new Error('Usage: --init-issue <url> [labels-csv]');
    console.log(JSON.stringify(onIssueOpened(args[1], args[2] || '')));
  } else if (cmd === '--on-agent-dev') {
    if (args.length !== 2) throw new Error('Usage: --on-agent-dev <url>');
    console.log(JSON.stringify(onAgentDev(args[1])));
  } else if (cmd === '--on-pr-closed-unmerged') {
    if (args.length < 2 || args.length > 3) throw new Error('Usage: --on-pr-closed-unmerged <url> [reason]');
    console.log(JSON.stringify(onPrClosedUnmerged(args[1], args[2] || '')));
  } else if (cmd === '--on-deploy-success') {
    if (args.length < 2 || args.length > 3) throw new Error('Usage: --on-deploy-success <url> [issue-url]');
    console.log(JSON.stringify(onDeploySuccess(args[1], args[2] || '')));
  } else if (cmd === '--iteration-info') {
    console.log(JSON.stringify(getCurrentIterationInfo()));
  } else if (args.length) {
    throw new Error(`Unknown arguments: ${args.join(' ')}`);
  } else {
    exportBoard();
  }
} catch (e) {
  console.error(`ERROR: ${e.message}`);
  process.exit(1);
}