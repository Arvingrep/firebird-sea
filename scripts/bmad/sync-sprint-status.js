#!/usr/bin/env node
// 幂等回写 sprint-status.yaml：node scripts/bmad/sync-sprint-status.js <story-key|N.M> <status> [--file F] [--now "DD-MM-YYYY HH:MM"]
// 行级编辑：保留注释/排序/行尾注释；状态未变化时文件不动（不刷新 last_updated）；epic 自动 in-progress/done。
const fs = require('node:fs');
const path = require('node:path');

const STATUSES = ['backlog', 'ready-for-dev', 'in-progress', 'review', 'done'];
const STORY = /^(\s{2}(\d+)-(\d+)-[^\s:]+:\s*)([a-z-]+)(.*)$/;

const p2 = (n) => String(n).padStart(2, '0');
const stamp = (d = new Date()) => `${p2(d.getDate())}-${p2(d.getMonth() + 1)}-${d.getFullYear()} ${p2(d.getHours())}:${p2(d.getMinutes())}`;

// 返回 { text, changed, error }
function sync(text, ref, status, now = stamp()) {
  if (!STATUSES.includes(status)) return { text, changed: false, error: `非法状态 ${status}（可选 ${STATUSES.join('|')}）` };
  const lines = text.split('\n');
  const idx = lines.findIndex((l) => {
    const m = l.match(STORY);
    return m && [l.trim().split(':')[0], `${m[2]}.${m[3]}`, `${m[2]}-${m[3]}`].includes(ref);
  });
  if (idx < 0) return { text, changed: false, error: `sprint-status 中找不到 Story ${ref}` };
  const m0 = lines[idx].match(STORY);
  let changed = false;
  const set = (i, val) => { // 只替换状态词，保留键、缩进与行尾注释
    const m = lines[i].match(/^(\s{2}[^\s:]+:\s*)([a-z-]+)(.*)$/);
    if (m && m[2] !== val) { lines[i] = `${m[1]}${val}${m[3]}`; changed = true; }
  };
  set(idx, status);
  const epic = m0[2], all = lines.map((l) => l.match(STORY)).filter((m) => m && m[2] === epic).map((m) => m[4]);
  const target = all.every((s) => s === 'done') ? 'done' : all.some((s) => s !== 'backlog') ? 'in-progress' : null;
  const ei = lines.findIndex((l) => l.startsWith(`  epic-${epic}:`));
  if (target && ei >= 0) set(ei, target);
  const out = changed ? lines.map((l) => (l.startsWith('last_updated:') ? `last_updated: ${now}` : l)) : lines;
  return { text: out.join('\n'), changed };
}

function main(argv) {
  const pos = argv.filter((x, i) => !x.startsWith('--') && !argv[i - 1]?.startsWith('--'));
  const opt = (n) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : undefined; };
  if (pos.length !== 2) { console.error('用法: sync-sprint-status.js <story-key|N.M> <status> [--file F] [--now S]'); return 2; }
  const file = opt('file') || path.resolve(__dirname, '../../_bmad-output/implementation-artifacts/sprint-status.yaml');
  const r = sync(fs.readFileSync(file, 'utf8'), pos[0], pos[1], opt('now'));
  if (r.error) { console.error(r.error); return 1; }
  if (r.changed) fs.writeFileSync(file, r.text);
  console.log(r.changed ? `已更新 ${pos[0]} → ${pos[1]}` : `无变化（${pos[0]} 已是 ${pos[1]}）`);
  return 0;
}

module.exports = { sync, stamp, STATUSES };
if (require.main === module) process.exit(main(process.argv.slice(2)));
