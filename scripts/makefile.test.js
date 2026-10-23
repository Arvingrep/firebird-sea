// A12：`make gates` 的对比基线必须跟随当前分支上游，而不是硬编码 origin/main。
// 为什么需要这组用例：`agent/*`、`chore/*` 这些分支的上游与本地同名，
// 一旦基线取错（硬编码 origin/main，或把 origin/ 前缀剥掉变成分支与自己比），
// `git diff <base>...HEAD` 恒为空 → 门禁报「相对 X 无改动」的假 FAIL。
//
// 做法：在临时仓库里复刻一个最小 make 环境（bare remote + 假 gates.sh 打印它收到的基线），
// 不碰当前仓库、不联网、不执行真实 gates.sh。本机无 make/git 时整组跳过。
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const has = (cmd) => { try { execFileSync(cmd, ['--version'], { stdio: 'ignore' }); return true; } catch { return false; } };
const SKIP = !has('make') ? '本机没有 make' : !has('git') ? '本机没有 git' : false;

// 一次性建好沙箱：main 与 feat/x 设了上游，no-upstream 故意不设。
function sandbox() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mk-gates-'));
  const repo = path.join(dir, 'repo');
  const remote = path.join(dir, 'remote.git');
  const git = (...a) => execFileSync('git', a, { cwd: repo, stdio: 'ignore' });

  fs.mkdirSync(path.join(repo, 'scripts/agent'), { recursive: true });
  // 复制真实 Makefile，保证测的是被提交的那份而不是拷贝
  fs.copyFileSync(path.join(ROOT, 'Makefile'), path.join(repo, 'Makefile'));
  const stub = path.join(repo, 'scripts/agent/gates.sh');
  fs.writeFileSync(stub, '#!/usr/bin/env bash\necho "GATES_BASE=$1"\n');
  fs.chmodSync(stub, 0o755);

  execFileSync('git', ['init', '-q', '--bare', '-b', 'main', remote]);
  git('init', '-q', '-b', 'main');
  git('config', 'user.email', 't@t');
  git('config', 'user.name', 't');
  git('add', '-A');
  git('commit', '-qm', 'base');
  git('remote', 'add', 'origin', remote);
  git('push', '-q', '-u', 'origin', 'main');
  git('checkout', '-q', '-b', 'feat/x');
  git('push', '-q', '-u', 'origin', 'feat/x');
  git('checkout', '-q', '-b', 'no-upstream');
  return { dir, repo };
}

let box;
const get = () => (box ||= sandbox());

// 清掉本机可能残留的 GATE_BASE / MAKEFLAGS，否则「回落」类用例会被环境变量污染
function runMake(branch, { env = {}, args = ['gates'] } = {}) {
  const b = get();
  execFileSync('git', ['checkout', '-q', branch], { cwd: b.repo, stdio: 'ignore' });
  const e = { ...process.env };
  delete e.GATE_BASE;
  delete e.MAKEFLAGS;
  return execFileSync('make', args, { cwd: b.repo, encoding: 'utf8', env: { ...e, ...env } }).trim();
}

test.after(() => { if (box) fs.rmSync(box.dir, { recursive: true, force: true }); });

test('make gates 有上游：基线取 @{u} 全名 origin/feat/x，不剥 origin/ 前缀', { skip: SKIP }, () => {
  // 剥掉前缀会变成 feat/x —— 正是当前分支自己，diff 恒为空、又成假 FAIL
  assert.equal(runMake('feat/x'), 'GATES_BASE=origin/feat/x');
});

test('make gates 无上游：基线回落 main', { skip: SKIP }, () => {
  assert.equal(runMake('no-upstream'), 'GATES_BASE=main');
});

test('make gates GATE_BASE=origin/main：命令行覆盖优先于上游', { skip: SKIP }, () => {
  assert.equal(runMake('feat/x', { args: ['gates', 'GATE_BASE=origin/main'] }), 'GATES_BASE=origin/main');
});

test('make gates：同名 env 变量 GATE_BASE 同样能覆盖默认值', { skip: SKIP }, () => {
  assert.equal(runMake('no-upstream', { env: { GATE_BASE: 'origin/canary' } }), 'GATES_BASE=origin/canary');
});
