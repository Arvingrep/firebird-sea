// 模块入口全站验收（canary+demo 404/500 事件）：发布后冒烟必须覆盖各模块入口，
// 否则"模块域名/子目录未配置"这类死链只能靠人工 curl 发现。
const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const chart = path.join(__dirname, '../../../deploy/helm/firebird-site');
const helm = spawnSync('helm', ['version', '--short']);
const skip = helm.error ? '缺 helm' : false;

// 2026-10-10 验收矩阵：已正常的 + 本次修复/下线前必须可观测的入口
const OK_PATHS = ['/', '/u', '/b', '/supplier', '/supplier/job', '/member',
  '/business', '/info', '/house', '/job', '/car', '/special', '/waimai', '/quanjing'];
const FIXED_PATHS = ['/shop', '/news', '/zhaopin', '/baokan', '/jianzhan', '/fenlei', '/zhuang'];

function smokePaths(values) {
  const r = spawnSync('helm', ['template', 'firebird-t', chart, '-f', path.join(chart, values),
    '--show-only', 'templates/job-smoke-test.yaml'], { encoding: 'utf8' });
  assert.strictEqual(r.status, 0, r.stderr);
  const m = r.stdout.match(/name: PATHS\s*\n\s*value: "([^"]*)"/);
  assert.ok(m, '冒烟 Job 未渲染 PATHS');
  return m[1].split(/\s+/).filter(Boolean);
}

test('canary 冒烟覆盖已正常的模块入口（防回归）', { skip }, () => {
  const paths = smokePaths('values-canary.yaml');
  for (const p of OK_PATHS) assert.ok(paths.includes(p), `canary smokeTest.paths 缺 ${p}`);
});

test('canary 冒烟覆盖曾 404/500 的模块入口（修复后须 2xx/3xx，或从列表中连同入口一并下线并在此处同步）', { skip }, () => {
  const paths = smokePaths('values-canary.yaml');
  for (const p of FIXED_PATHS) assert.ok(paths.includes(p), `canary smokeTest.paths 缺 ${p}`);
});

test('冒烟路径不含 /404.html 之类的错误页（避免把错误跳转当成功）', { skip }, () => {
  for (const p of smokePaths('values-canary.yaml')) assert.doesNotMatch(p, /404|error/i);
});
