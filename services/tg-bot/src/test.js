/**
 * Telegram Bot Dispatcher 单元探针测试
 */

const http = require('node:http');
const { spawn } = require('node:child_process');
const path = require('node:path');

const PORT = 3099;
const serverProcess = spawn('node', [path.join(__dirname, 'server.js')], {
  env: { ...process.env, TG_BOT_PORT: String(PORT) },
  stdio: 'pipe'
});

serverProcess.stdout.on('data', data => {
  // console.log(`[TG-BOT-TEST-STDOUT] ${data}`);
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

  console.log('🎉 所有 Telegram Bot 基建测试全部 100% 通过！');
  serverProcess.kill();
  process.exit(0);
}

run().catch(err => {
  console.error('❌ 测试失败:', err);
  serverProcess.kill();
  process.exit(1);
});
