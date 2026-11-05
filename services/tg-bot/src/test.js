/**
 * Telegram Bot Dispatcher 单元探针测试
 */

const http = require('node:http');
const { spawn, execFileSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const PORT = 3099;
const APP_BASE_URL = 'https://fh580.net';

// 测试 3 会真跑 scripts/dispatch-task.js，而它会写 .agents/tasks 并 `git checkout -b feat/task-*`。
// 直接在仓库里跑会污染工作区（已发生过一次 commit 落错分支）。这里把派单目录换成临时 git 仓库：
// 脚本按自身 __dirname 推导 tasks 目录，所以复制一份到 <tmp>/scripts 就彻底隔离，
// 同时仍然执行真实脚本（含建分支逻辑），不是把它桩掉。
function makeIsolatedDispatchRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fbs-tg-dispatch-'));
  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
  fs.copyFileSync(
    path.join(__dirname, '../../../scripts/dispatch-task.js'),
    path.join(root, 'scripts', 'dispatch-task.js')
  );
  try {
    execFileSync('git', ['init', '-q'], { cwd: root, stdio: 'ignore' });
  } catch (_) {
    // 没有 git 也能跑：脚本自身会跳过建分支
  }
  return root;
}

const DISPATCH_ROOT = makeIsolatedDispatchRoot();

function cleanup() {
  fs.rmSync(DISPATCH_ROOT, { recursive: true, force: true });
}

const serverProcess = spawn('node', [path.join(__dirname, 'server.js')], {
  env: {
    ...process.env,
    TG_BOT_PORT: String(PORT),
    TG_APP_BASE_URL: APP_BASE_URL,
    TG_DISPATCH_ROOT: DISPATCH_ROOT
  },
  stdio: 'pipe'
});

// mock 模式（无 BOT_TOKEN）会把消息与 reply_markup 打到 stdout，测试据此断言按钮
let serverStdout = '';
serverProcess.stdout.on('data', data => {
  serverStdout += String(data);
});

function postJson(path, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request({
      hostname: '127.0.0.1',
      port: PORT,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body || '{}') }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getJson(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${PORT}${path}`, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body || '{}') }));
    }).on('error', reject);
  });
}

async function run() {
  await new Promise(r => setTimeout(r, 600));

  console.log('🧪 测试 1: 健康探针 /health');
  const h = await getJson('/health');
  if (h.status !== 200 || h.data.status !== 'ok') throw new Error('Health check failed');
  console.log('   ✅ PASS');

  console.log('🧪 测试 2: 模拟用户发送 /status 指令 Webhook');
  const s = await postJson('/webhook/telegram', {
    message: { chat: { id: 12345 }, text: '/status', from: { first_name: 'Boss' } }
  });
  if (s.status !== 200 || !s.data.ok) throw new Error('Status command failed');
  console.log('   ✅ PASS');

  console.log('🧪 测试 3: 模拟用户发送需求随笔 Webhook (触发脱水派单)');
  const d = await postJson('/webhook/telegram', {
    message: { chat: { id: 12345 }, text: '外卖订单增加马尼拉配送加急选项', from: { first_name: 'Boss' } }
  });
  if (d.status !== 200 || !d.data.ok) throw new Error('Dispatch webhook failed');
  console.log('   ✅ PASS');

  console.log('🧪 测试 4: 调用主动推送卡片接口 /send-card');
  const c = await postJson('/send-card', {
    chatId: '12345',
    text: '🚀 *【测试上线通知】* GKE 部署完成！'
  });
  if (c.status !== 200) throw new Error('Send card failed');
  console.log('   ✅ PASS');

  console.log('🧪 测试 5: /start 带 web_app 入口按钮（顾客打开 TMA）');
  serverStdout = '';
  const s5 = await postJson('/webhook/telegram', {
    message: { chat: { id: 12345, type: 'private' }, text: '/start', from: { first_name: 'Boss' } }
  });
  if (s5.status !== 200 || !s5.data.ok) throw new Error('Start command failed');
  await new Promise(r => setTimeout(r, 200));
  const expectedUrl = `${APP_BASE_URL}/tg/entry.php?role=customer`;
  if (!serverStdout.includes(`"web_app":{"url":"${expectedUrl}"}`)) {
    throw new Error(`/start 未生成 web_app 按钮，stdout=${serverStdout}`);
  }
  console.log('   ✅ PASS');

  console.log('🎉 所有 Telegram Bot 基建测试全部 100% 通过！');
  serverProcess.kill();
  cleanup();
  process.exit(0);
}

run().catch(err => {
  console.error('❌ 测试失败:', err);
  serverProcess.kill();
  cleanup();
  process.exit(1);
});
