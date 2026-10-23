// A12：`make gates` 的对比基线必须跟随「目标分支」（PR 要合进去的那条），
// 而不是当前分支自己的上游 @{u}，也不是写死的 ref。
//
// 为什么：`agent/*`、`chore/*` 的上游就是它自己的远端。用 @{u} 做基线时，
// 一旦分支 push 过，`git diff @{u}...HEAD` 恒为空 → 门禁报「相对 X 无改动」的假 FAIL。
// 触发条件从「本地 main 过期」变成了「已经推送」，而推送是正常流程，等于几乎必踩。
// 故基线改为 origin/$(or $(AGENT_BASE_BRANCH),main)：
//   - 默认 origin/main；
//   - AGENT_BASE_BRANCH=canary 时切到 origin/canary（启用 canary 的开关）；
//   - GATE_BASE 可显式覆盖（命令行 > 同名 env）。
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

// 一次性建好沙箱。关键前置：feat/x 比 main 多一个 commit 并且**已经 push**
// （上游 == HEAD），用来复刻「已推送分支」这个把旧设计打成假 FAIL 的场景。
function sandbox() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mk-gates-'));
  const repo = path.join(dir, 'repo');
  const remote = path.join(dir, 'remote.git');
  const git = (...a) => execFileSync('git', a, { cwd: repo, stdio: 'ignore' });

  fs.mkdirSync(path.join(repo, 'scripts/agent'), { recursive: true });
  // 复制真实 Makefile，保证测的是被提交的那份而不是测试里的副本
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

  // feat/x：在 main 之上加一个 commit 并推送 → @{u} 与 HEAD 完全一致
  git('checkout', '-q', '-b', 'feat/x');
  fs.writeFileSync(path.join(repo, 'feature.txt'), 'x\n');
  git('add', '-A');
  git('commit', '-qm', 'feat');
  git('push', '-q', '-u', 'origin', 'feat/x');

  // no-upstream：故意不设上游，验证「不依赖上游」也能给出正确基线
  git('checkout', '-q', '-b', 'no-upstream');
  return { dir, repo };
}

let box;
const get = () => (box ||= sandbox());

// 清掉本机可能残留的变量，否则默认值类用例会被环境污染成假绿/假红：
//   GATE_BASE（覆盖基线）/ AGENT_BASE_BRANCH（切换目标分支）/ MAKEFLAGS（干扰 make 调用）
function runMake(branch, { env = {}, args = ['gates'] } = {}) {
  const b = get();
  execFileSync('git', ['checkout', '-q', branch], { cwd: b.repo, stdio: 'ignore' });
  const e = { ...process.env };
  delete e.GATE_BASE;
  delete e.AGENT_BASE_BRANCH;
  delete e.MAKEFLAGS;
  return execFileSync('make', args, { cwd: b.repo, encoding: 'utf8', env: { ...e, ...env } }).trim();
}

test.after(() => { if (box) fs.rmSync(box.dir, { recursive: true, force: true }); });

// 核心回归：Ray 打回本设计的场景。已推送分支的上游 diff 为空，
// 只有目标分支还留着差异；基线若跟随 @{u}，门禁必然误报「无改动」。
test('make gates 已推送分支：上游 diff 为空但目标分支有差异，基线必须是 origin/main 而非 @{u}', { skip: SKIP }, () => {
  const b = get();
  execFileSync('git', ['checkout', '-q', 'feat/x'], { cwd: b.repo, stdio: 'ignore' });
  const diffOf = (ref) => execFileSync('git', ['diff', '--name-only', `${ref}...HEAD`], { cwd: b.repo, encoding: 'utf8' }).trim();
  // 前置条件先钉死，否则这条用例会在沙箱变化时悄悄失去意义
  assert.equal(diffOf('@{u}'), '', '前置条件不成立：feat/x 相对上游应当零改动（模拟已推送）');
  assert.notEqual(diffOf('origin/main'), '', '前置条件不成立：feat/x 相对 origin/main 应当有改动');
  assert.equal(runMake('feat/x'), 'GATES_BASE=origin/main');
});

test('make gates 默认基线：分支有上游也不跟随 @{u}，仍取 origin/main', { skip: SKIP }, () => {
  assert.equal(runMake('feat/x'), 'GATES_BASE=origin/main');
});

test('make gates 无上游：基线仍是 origin/main（带 origin/ 前缀，不是裸 main）', { skip: SKIP }, () => {
  // 旧设计在这里会回落成裸 main —— 这条用于拦住任何「重新引入 @{u} + or(...,main)」的写法
  assert.equal(runMake('no-upstream'), 'GATES_BASE=origin/main');
});

test('make gates AGENT_BASE_BRANCH=canary：基线切到 origin/canary', { skip: SKIP }, () => {
  // 这是「启用 canary」的开关；若失效，PR 目标分支是 canary 时门禁会拿 origin/main 比，
  // 把 canary 独有的改动算成「多出来的」（或反过来漏检）
  assert.equal(runMake('feat/x', { env: { AGENT_BASE_BRANCH: 'canary' } }), 'GATES_BASE=origin/canary');
});

test('make gates AGENT_BASE_BRANCH 为空串：$(or ...) 回落 main，不产出残缺 ref「origin/」', { skip: SKIP }, () => {
  // 拦 $(or) 被简化掉：若写成 origin/$(AGENT_BASE_BRANCH)，空值会得到 origin/ —— 一个不存在的 ref
  assert.equal(runMake('feat/x', { env: { AGENT_BASE_BRANCH: '' } }), 'GATES_BASE=origin/main');
});

test('make gates GATE_BASE=origin/release：命令行覆盖优先于目标分支', { skip: SKIP }, () => {
  // 取一个既不是默认值、也不等于任何分支上游的 ref，避免「覆盖」被默认值巧合掩盖
  assert.equal(runMake('feat/x', { args: ['gates', 'GATE_BASE=origin/release'] }), 'GATES_BASE=origin/release');
});

test('make gates：同名 env 变量 GATE_BASE 同样能覆盖目标分支', { skip: SKIP }, () => {
  assert.equal(runMake('no-upstream', { env: { GATE_BASE: 'origin/canary' } }), 'GATES_BASE=origin/canary');
});
