/**
 * Telegram Bot Dispatcher 单元探针测试
 */

const http = require('node:http');
const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const PORT = 3099;
const N8N_STUB_PORT = 3098;
const N8N_DEAD_PORT = 3097; // 故意不监听的端口：验证 n8n 不可达兜底
const APP_BASE_URL = 'https://fh580.net';

// 集群镜像不含 scripts/（canary 已删除本地派单脚本，改走 n8n 流水线），所以
// TG_DISPATCH_ROOT 指向一个空临时目录：existsSync 判定脚本缺失 → 走 n8n 兜底路径。
const DISPATCH_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'fbs-tg-dispatch-'));

// n8n stub：记录收到的转发请求，返回 200（模拟 n8n 可达）
const n8nRequests = [];
const n8nStub = http.createServer((req, res) => {
  let body = '';
  req.on('data', c => body += c);
  req.on('end', () => {
    n8nRequests.push({ url: req.url, body });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end('{"ok":true}');
  });
});
n8nStub.listen(N8N_STUB_PORT, '127.0.0.1');

function spawnBot(port, n8nUrl) {
  const p = spawn('node', [path.join(__dirname, 'server.js')], {
    env: {
      ...process.env,
      TG_BOT_PORT: String(port),
      TG_APP_BASE_URL: APP_BASE_URL,
      TG_DISPATCH_ROOT: DISPATCH_ROOT,
      N8N_WEBHOOK_URL: n8nUrl
    },
    stdio: 'pipe'
  });
  let stdout = '';
  p.stdout.on('data', data => { stdout += String(data); });
  return { proc: p, getStdout: () => stdout };
}

// 主实例：n8n 可达（stub）。mock 模式（无 BOT_TOKEN）把消息与 reply_markup 打到 stdout。
const bot = spawnBot(PORT, `http://127.0.0.1:${N8N_STUB_PORT}/webhook/test`);

function postJson(port, path, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request({
      hostname: '127.0.0.1',
      port: port,
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

function cleanup() {
  bot.proc.kill();
  if (deadBot) deadBot.proc.kill();
  n8nStub.close();
  fs.rmSync(DISPATCH_ROOT, { recursive: true, force: true });
}

let deadBot = null;

async function run() {
  await new Promise(r => setTimeout(r, 600));

  console.log('🧪 测试 1: 健康探针 /health');
  const h = await getJson('/health');
  if (h.status !== 200 || h.data.status !== 'ok') throw new Error('Health check failed');
  console.log('   ✅ PASS');

  console.log('🧪 测试 2: 模拟用户发送 /status 指令 Webhook');
  const s = await postJson(PORT, '/webhook/telegram', {
    message: { chat: { id: 12345 }, text: '/status', from: { first_name: 'Boss' } }
  });
  if (s.status !== 200 || !s.data.ok) throw new Error('Status command failed');
  console.log('   ✅ PASS');

  console.log('🧪 测试 3: 需求随笔 Webhook（派单脚本缺失 → n8n 可达 → 兜底 ack）');
  const d = await postJson(PORT, '/webhook/telegram', {
    message: { chat: { id: 12345 }, text: '外卖订单增加马尼拉配送加急选项', from: { first_name: 'Boss' } }
  });
  if (d.status !== 200 || !d.data.ok) throw new Error('Dispatch webhook failed');
  await new Promise(r => setTimeout(r, 400));
  if (n8nRequests.length === 0) throw new Error('n8n stub 未收到转发请求');
  const out3 = bot.getStdout();
  if (!out3.includes('【需求已提交 n8n 派单通道】')) {
    throw new Error(`未回复 n8n 兜底 ack，stdout=${out3}`);
  }
  console.log('   ✅ PASS（n8n stub 收到转发，回复 ack）');

  console.log('🧪 测试 4: 调用主动推送卡片接口 /send-card');
  const c = await postJson(PORT, '/send-card', {
    chatId: '12345',
    text: '🚀 *【测试上线通知】* GKE 部署完成！'
  });
  if (c.status !== 200) throw new Error('Send card failed');
  console.log('   ✅ PASS');

  console.log('🧪 测试 5: /start 带 web_app 入口按钮（顾客打开 TMA）');
  const s5 = await postJson(PORT, '/webhook/telegram', {
    message: { chat: { id: 12345, type: 'private' }, text: '/start', from: { first_name: 'Boss' } }
  });
  if (s5.status !== 200 || !s5.data.ok) throw new Error('Start command failed');
  await new Promise(r => setTimeout(r, 200));
  const expectedUrl = `${APP_BASE_URL}/tg/entry.php?role=customer`;
  if (!bot.getStdout().includes(`"web_app":{"url":"${expectedUrl}"}`)) {
    throw new Error(`/start 未生成 web_app 按钮，stdout=${bot.getStdout()}`);
  }
  // 骑手入口与顾客入口并列：/start 里也应有，否则骑手找不到绑定入口
  if (!bot.getStdout().includes(`"web_app":{"url":"${APP_BASE_URL}/tg-api/rider/bind"}`)) {
    throw new Error(`/start 未生成骑手入口按钮，stdout=${bot.getStdout()}`);
  }
  console.log('   ✅ PASS');

  console.log('🧪 测试 5b: /start login_<令牌> → 网站登录确认 web_app 按钮（非普通 /start）');
  const tok = 'a'.repeat(31) + '1';
  const s5b = await postJson(PORT, '/webhook/telegram', {
    message: { chat: { id: 12345, type: 'private' }, text: `/start login_${tok}`, from: { first_name: 'Boss' } }
  });
  if (s5b.status !== 200 || !s5b.data.ok) throw new Error('Start login command failed');
  await new Promise(r => setTimeout(r, 200));
  const confirmUrl = `${APP_BASE_URL}/api/login.php?type=telegram&act=confirm&t=${tok}`;
  if (!bot.getStdout().includes(`"web_app":{"url":"${confirmUrl}"}`)) {
    throw new Error(`login_ 令牌未生成确认按钮，stdout=${bot.getStdout()}`);
  }
  // 非法令牌（非 32 位十六进制）不能走确认分支，落回普通 /start，且不会出现带该令牌的按钮
  const before = bot.getStdout().length;
  await postJson(PORT, '/webhook/telegram', {
    message: { chat: { id: 12345, type: 'private' }, text: '/start login_xyz', from: { first_name: 'Boss' } }
  });
  await new Promise(r => setTimeout(r, 200));
  if (bot.getStdout().slice(before).includes('act=confirm')) throw new Error('非法令牌不应生成确认按钮');
  console.log('   ✅ PASS');

  console.log('🧪 测试 6: 派单脚本缺失且 n8n 不可达 → 明确报错回复（fail-safe，不崩溃）');
  deadBot = spawnBot(PORT + 2, `http://127.0.0.1:${N8N_DEAD_PORT}/webhook/test`);
  await new Promise(r => setTimeout(r, 600));
  const d6 = await postJson(PORT + 2, '/webhook/telegram', {
    message: { chat: { id: 12345 }, text: '再来一单测试不可达路径', from: { first_name: 'Boss' } }
  });
  if (d6.status !== 200 || !d6.data.ok) throw new Error('Unreachable-n8n webhook failed');
  await new Promise(r => setTimeout(r, 600)); // 等 forwardToN8n 超时/连接拒绝后回消息
  if (!deadBot.proc.pid || deadBot.proc.exitCode !== null) throw new Error('n8n 不可达导致进程退出（未 fail-safe）');
  const out6 = deadBot.getStdout();
  if (!out6.includes('派单通道不可用')) {
    throw new Error(`n8n 不可达时未回复报错文案，stdout=${out6}`);
  }
  console.log('   ✅ PASS（进程存活，回复派单通道不可用）');

  console.log('🧪 测试 7: /rider 派发骑手绑定入口（web_app → /tg-api/rider/bind）');
  const before7 = bot.getStdout().length;
  const s7 = await postJson(PORT, '/webhook/telegram', {
    message: { chat: { id: 12345, type: 'private' }, text: '/rider', from: { first_name: 'Boss' } }
  });
  if (s7.status !== 200 || !s7.data.ok) throw new Error('/rider command failed');
  await new Promise(r => setTimeout(r, 200));
  const out7 = bot.getStdout().slice(before7);
  if (!out7.includes(`"web_app":{"url":"${APP_BASE_URL}/tg-api/rider/bind"}`)) {
    throw new Error(`/rider 未生成 web_app 绑定按钮，stdout=${out7}`);
  }
  if (!out7.includes('绑定并进入工作台')) {
    throw new Error(`/rider 文案缺失，stdout=${out7}`);
  }
  console.log('   ✅ PASS');

  console.log('🎉 所有 Telegram Bot 基建测试全部 100% 通过！');
  cleanup();
  process.exit(0);
}

run().catch(err => {
  console.error('❌ 测试失败:', err);
  cleanup();
  process.exit(1);
});
