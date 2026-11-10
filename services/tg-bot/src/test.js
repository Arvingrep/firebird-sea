/**
 * Telegram Bot Dispatcher 单元探针测试
 */

const http = require('node:http');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const PORT = 3099;
const N8N_STUB_PORT = 3098;
const N8N_DEAD_PORT = 3097; // 故意不监听的端口：验证 n8n 不可达兜底
const GW_STUB_PORT = 3096; // 一键绑定测试：PHP 网关 stub
const APP_BASE_URL = 'https://fh580.net';
const GW_SECRET = 'test-gateway-secret';

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

// 网关 stub：记录 bot 直连的 bind 请求；gwResponder(action, body) 可被各测试场景改写。
const gwRequests = [];
let gwResponder = null;
const gwStub = http.createServer((req, res) => {
  let body = '';
  req.on('data', c => body += c);
  req.on('end', () => {
    let parsed = {};
    try { parsed = JSON.parse(body || '{}'); } catch (_) {}
    gwRequests.push({ url: req.url, headers: req.headers, body: parsed, raw: body });
    if (gwResponder) {
      const out = gwResponder(parsed.action, parsed);
      res.writeHead(out.status, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(out.data));
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data: {} }));
  });
});
gwStub.listen(GW_STUB_PORT, '127.0.0.1');

function spawnBot(port, n8nUrl, extraEnv = {}) {
  const p = spawn('node', [path.join(__dirname, 'server.js')], {
    env: {
      ...process.env,
      TG_BOT_PORT: String(port),
      TG_APP_BASE_URL: APP_BASE_URL,
      TG_DISPATCH_ROOT: DISPATCH_ROOT,
      N8N_WEBHOOK_URL: n8nUrl,
      ...extraEnv
    },
    stdio: 'pipe'
  });
  let stdout = '';
  p.stdout.on('data', data => { stdout += String(data); });
  return { proc: p, getStdout: () => stdout };
}

// 主实例：n8n 可达（stub）+ 网关 stub 注入。mock 模式（无 BOT_TOKEN）把消息与 reply_markup 打到 stdout。
const bot = spawnBot(PORT, `http://127.0.0.1:${N8N_STUB_PORT}/webhook/test`, {
  FBS_GATEWAY_URL: `http://127.0.0.1:${GW_STUB_PORT}`,
  FBS_GATEWAY_SECRET: GW_SECRET
});

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
  gwStub.close();
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

  console.log('🧪 测试 8: /rider 与 /merchant 回复追加 request_contact 回复键盘');
  const before8 = bot.getStdout().length;
  const s8 = await postJson(PORT, '/webhook/telegram', {
    message: { chat: { id: 12345, type: 'private' }, text: '/merchant', from: { first_name: 'Boss' } }
  });
  if (s8.status !== 200 || !s8.data.ok) throw new Error('/merchant command failed');
  await new Promise(r => setTimeout(r, 200));
  const out8 = bot.getStdout().slice(before8);
  if (!out8.includes(`"web_app":{"url":"${APP_BASE_URL}/tg/entry.php?role=merchant"}`)) {
    throw new Error(`/merchant 未生成 web_app 入口按钮，stdout=${out8}`);
  }
  if (!out8.includes('"request_contact":true') || !out8.includes('分享手机号完成绑定')) {
    throw new Error(`/merchant 未追加 request_contact 键盘，stdout=${out8}`);
  }
  console.log('   ✅ PASS');

  console.log('🧪 测试 9: contact 分享 → 归属一致 → 角色选择内联按钮（rider+merchant 两个 callback）');
  gwRequests.length = 0;
  gwResponder = null;
  const before9 = bot.getStdout().length;
  const s9 = await postJson(PORT, '/webhook/telegram', {
    message: {
      chat: { id: 12345, type: 'private' },
      from: { id: 777, first_name: 'Boss' },
      contact: { phone_number: '09171234567', user_id: 777 }
    }
  });
  if (s9.status !== 200 || !s9.data.ok) throw new Error('Contact share failed');
  await new Promise(r => setTimeout(r, 200));
  const out9 = bot.getStdout().slice(before9);
  if (!out9.includes('cbind:r|09171234567') || !out9.includes('cbind:m|09171234567')) {
    throw new Error(`contact 未生成角色选择按钮，stdout=${out9}`);
  }
  if (gwRequests.length !== 0) throw new Error('角色选择前不应调用网关');
  console.log('   ✅ PASS');

  console.log('🧪 测试 10: contact 归属不一致（转发的名片）→ 拒绝且绝不调用网关');
  const before10 = bot.getStdout().length;
  const gwCountBefore10 = gwRequests.length;
  const s10 = await postJson(PORT, '/webhook/telegram', {
    message: {
      chat: { id: 12345, type: 'private' },
      from: { id: 777, first_name: 'Boss' },
      contact: { phone_number: '09171234567', user_id: 999 }
    }
  });
  if (s10.status !== 200 || !s10.data.ok) throw new Error('Contact ownership test failed');
  await new Promise(r => setTimeout(r, 200));
  const out10 = bot.getStdout().slice(before10);
  if (!out10.includes('只能绑定你本人的手机号')) {
    throw new Error(`归属不一致未拒绝，stdout=${out10}`);
  }
  if (gwRequests.length !== gwCountBefore10) throw new Error('归属不一致时不应调用网关');
  console.log('   ✅ PASS');

  console.log('🧪 测试 11: callback 选骑手 → rider_bind 成功 → web_app 工作台按钮 + HMAC 签名形状断言');
  const before11 = bot.getStdout().length;
  const gwCountBefore11 = gwRequests.length;
  const s11 = await postJson(PORT, '/webhook/telegram', {
    callback_query: { data: 'cbind:r|09171234567', from: { id: 777 }, message: { chat: { id: 12345 } } }
  });
  if (s11.status !== 200 || !s11.data.ok) throw new Error('Bind rider callback failed');
  await new Promise(r => setTimeout(r, 400));
  const out11 = bot.getStdout().slice(before11);
  if (gwRequests.length !== gwCountBefore11 + 1) throw new Error(`网关调用次数异常: ${gwRequests.length}`);
  const gwReq = gwRequests[gwRequests.length - 1];
  if (gwReq.url !== '/api/fbs/index.php') throw new Error(`网关路径错误: ${gwReq.url}`);
  const body = gwReq.body;
  if (body.action !== 'rider_bind' || body.params.tg_user_id !== '777' || body.params.phone !== '09171234567') {
    throw new Error(`网关请求体不符契约: ${JSON.stringify(body)}`);
  }
  // 签名形状：ts 为数字串；HMAC-SHA256(secret, "ts\naction\nbody") 与 X-Fbs-Signature 逐字节一致
  const ts = String(gwReq.headers['x-fbs-timestamp']);
  if (!/^\d{10,}$/.test(ts)) throw new Error(`X-Fbs-Timestamp 非数字时间戳: ${ts}`);
  const expectedSig = crypto.createHmac('sha256', GW_SECRET).update(`${ts}\n${body.action}\n${gwReq.raw}`).digest('hex');
  if (gwReq.headers['x-fbs-signature'] !== expectedSig) throw new Error('HMAC 签名与 ts/action/body 不匹配');
  if (!out11.includes('骑手绑定成功')) throw new Error(`成功文案缺失，stdout=${out11}`);
  if (!out11.includes(`"web_app":{"url":"${APP_BASE_URL}/tg-api/rider/bind"}`)) {
    throw new Error(`成功回复未带工作台 web_app 按钮，stdout=${out11}`);
  }
  console.log('   ✅ PASS（含签名逐字节校验）');

  console.log('🧪 测试 12: callback 选商家 → merchant_bind 成功 → 商家后台 web_app 按钮');
  const before12 = bot.getStdout().length;
  const s12 = await postJson(PORT, '/webhook/telegram', {
    callback_query: { data: 'cbind:m|09171234567', from: { id: 777 }, message: { chat: { id: 12345 } } }
  });
  if (s12.status !== 200 || !s12.data.ok) throw new Error('Bind merchant callback failed');
  await new Promise(r => setTimeout(r, 400));
  const gwReq12 = gwRequests[gwRequests.length - 1];
  if (gwReq12.body.action !== 'merchant_bind') throw new Error(`应调用 merchant_bind: ${gwReq12.body.action}`);
  const out12 = bot.getStdout().slice(before12);
  if (!out12.includes('商家绑定成功')) throw new Error(`商家成功文案缺失，stdout=${out12}`);
  if (!out12.includes(`"web_app":{"url":"${APP_BASE_URL}/tg/entry.php?role=merchant"}`)) {
    throw new Error(`成功回复未带商家后台 web_app 按钮，stdout=${out12}`);
  }
  console.log('   ✅ PASS');

  console.log('🧪 测试 13: rider_bind 409 TG_ALREADY_BOUND → 冲突文案映射');
  gwResponder = () => ({ status: 409, data: { error: { code: 'TG_ALREADY_BOUND', message: 'this telegram is already bound to another courier' } } });
  const before13 = bot.getStdout().length;
  const s13 = await postJson(PORT, '/webhook/telegram', {
    callback_query: { data: 'cbind:r|09171234567', from: { id: 777 }, message: { chat: { id: 12345 } } }
  });
  if (s13.status !== 200 || !s13.data.ok) throw new Error('409 callback failed');
  await new Promise(r => setTimeout(r, 400));
  gwResponder = null;
  if (!bot.getStdout().slice(before13).includes('已经绑定过其他骑手/商家')) {
    throw new Error(`409 文案未映射，stdout=${bot.getStdout().slice(before13)}`);
  }
  console.log('   ✅ PASS');

  console.log('🧪 测试 14: rider_bind 404 COURIER_NOT_FOUND → 未找到骑手文案映射');
  gwResponder = () => ({ status: 404, data: { error: { code: 'COURIER_NOT_FOUND', message: 'courier not found or unavailable' } } });
  const before14 = bot.getStdout().length;
  const s14 = await postJson(PORT, '/webhook/telegram', {
    callback_query: { data: 'cbind:r|09171234567', from: { id: 777 }, message: { chat: { id: 12345 } } }
  });
  if (s14.status !== 200 || !s14.data.ok) throw new Error('404 callback failed');
  await new Promise(r => setTimeout(r, 400));
  gwResponder = null;
  if (!bot.getStdout().slice(before14).includes('未找到该手机号对应的骑手账号')) {
    throw new Error(`404 文案未映射，stdout=${bot.getStdout().slice(before14)}`);
  }
  console.log('   ✅ PASS');

  console.log('🧪 测试 15: FBS_GATEWAY_* 缺失 → 优雅降级「绑定通道未配置」，不崩溃不调网关');
  const gwCountBefore15 = gwRequests.length;
  const before15 = deadBot.getStdout().length;
  const s15 = await postJson(PORT + 2, '/webhook/telegram', {
    message: {
      chat: { id: 12345, type: 'private' },
      from: { id: 777, first_name: 'Boss' },
      contact: { phone_number: '09171234567', user_id: 777 }
    }
  });
  if (s15.status !== 200 || !s15.data.ok) throw new Error('Missing-env contact failed');
  await new Promise(r => setTimeout(r, 400));
  const out15 = deadBot.getStdout().slice(before15);
  if (!out15.includes('绑定通道未配置')) {
    throw new Error(`缺配置未降级提示，stdout=${out15}`);
  }
  if (gwRequests.length !== gwCountBefore15) throw new Error('缺配置时不应调用网关');
  if (!deadBot.proc.pid || deadBot.proc.exitCode !== null) throw new Error('缺配置导致进程退出（未优雅降级）');
  console.log('   ✅ PASS（进程存活，回复绑定通道未配置）');

  console.log('🧪 测试 16: 群聊场景钉住既有门控（无键盘噪音 / 无 web_app 400 风险）');
  // /rider 群聊 → 早退提示，不发生成键盘也不发 web_app 按钮
  const before16 = bot.getStdout().length;
  const gwCountBefore16 = gwRequests.length;
  const s16 = await postJson(PORT, '/webhook/telegram', {
    message: { chat: { id: 555001, type: 'group' }, text: '/rider', from: { first_name: 'Boss' } }
  });
  if (s16.status !== 200 || !s16.data.ok) throw new Error('/rider group failed');
  await new Promise(r => setTimeout(r, 200));
  const out16 = bot.getStdout().slice(before16);
  if (!out16.includes('请在私聊中发送 /rider')) throw new Error(`群聊 /rider 未早退提示，stdout=${out16}`);
  if (out16.includes('request_contact') || out16.includes('web_app')) {
    throw new Error(`群聊 /rider 泄漏键盘或 web_app 按钮，stdout=${out16}`);
  }
  // /merchant 群聊 → 同样早退
  const before16b = bot.getStdout().length;
  const s16b = await postJson(PORT, '/webhook/telegram', {
    message: { chat: { id: 555001, type: 'group' }, text: '/merchant', from: { first_name: 'Boss' } }
  });
  if (s16b.status !== 200 || !s16b.data.ok) throw new Error('/merchant group failed');
  await new Promise(r => setTimeout(r, 200));
  const out16b = bot.getStdout().slice(before16b);
  if (!out16b.includes('请在私聊中发送 /merchant')) throw new Error(`群聊 /merchant 未早退提示，stdout=${out16b}`);
  if (out16b.includes('request_contact') || out16b.includes('web_app')) {
    throw new Error(`群聊 /merchant 泄漏键盘或 web_app 按钮，stdout=${out16b}`);
  }
  // /start 群聊 → 三行 web_app 全部被 isPrivate 守卫跳过，只剩 BMAD url + callback 按钮（群里合法）
  const before16c = bot.getStdout().length;
  const s16c = await postJson(PORT, '/webhook/telegram', {
    message: { chat: { id: 555001, type: 'group' }, text: '/start', from: { first_name: 'Boss' } }
  });
  if (s16c.status !== 200 || !s16c.data.ok) throw new Error('/start group failed');
  await new Promise(r => setTimeout(r, 200));
  const out16c = bot.getStdout().slice(before16c);
  if (out16c.includes('web_app')) throw new Error(`群聊 /start 泄漏 web_app 按钮，stdout=${out16c}`);
  if (!out16c.includes('查看 BMAD 看板')) throw new Error(`群聊 /start 缺少合法按钮，stdout=${out16c}`);
  // contact 群聊 → 私聊提示，不调网关
  const s16d = await postJson(PORT, '/webhook/telegram', {
    message: {
      chat: { id: 555001, type: 'group' },
      from: { id: 777, first_name: 'Boss' },
      contact: { phone_number: '09171234567', user_id: 777 }
    }
  });
  if (s16d.status !== 200 || !s16d.data.ok) throw new Error('Contact group failed');
  await new Promise(r => setTimeout(r, 200));
  if (!bot.getStdout().slice(before16).includes('请在与机器人的私聊中完成手机号绑定')) {
    throw new Error('群聊 contact 未提示去私聊');
  }
  if (gwRequests.length !== gwCountBefore16) throw new Error('群聊 contact 不应调用网关');
  console.log('   ✅ PASS（/rider /merchant /start /contact 群聊均门控，无键盘噪音）');

  // ================= 员工邀请：/staff <token> 与 contact 一键加入 =================
  // token 形状 v1_<sid>_<exp>_<hex32>（exp 是 unix 秒）。bot 只做形状+时效预检，
  // 签名由网关验，所以这里用固定的假 HMAC 即可。
  const nowSec = () => Math.floor(Date.now() / 1000);
  const staffToken = (sid, expSec) => `v1_${sid}_${expSec}_${'a'.repeat(32)}`;
  const validStaffToken = staffToken(1, nowSec() + 86400);

  console.log('🧪 测试 17: /start staff_<合法 token> → 「邀请已确认」+ 另一条消息带 request_contact 键盘');
  const before17 = bot.getStdout().length;
  const gwCountBefore17 = gwRequests.length;
  const s17 = await postJson(PORT, '/webhook/telegram', {
    message: {
      chat: { id: 920001, type: 'private' },
      text: `/start staff_${validStaffToken}`,
      from: { id: 920001, first_name: 'Staff' }
    }
  });
  if (s17.status !== 200 || !s17.data.ok) throw new Error('/start staff_ webhook failed');
  await new Promise(r => setTimeout(r, 200));
  const out17 = bot.getStdout().slice(before17);
  const confirmAt17 = out17.indexOf('邀请已确认');
  const keyboardAt17 = out17.indexOf('"request_contact":true');
  if (confirmAt17 < 0) throw new Error(`/start staff_ 未回复「邀请已确认」，stdout=${out17}`);
  if (keyboardAt17 < 0) throw new Error(`/start staff_ 未发送 request_contact 键盘，stdout=${out17}`);
  // 键盘必须挂在后一条消息上：reply_markup 二选一，同一条里既 web_app 又 keyboard 会被 Telegram 丢弃
  if (confirmAt17 > keyboardAt17) throw new Error(`键盘先于确认文案发出（应拆两条），stdout=${out17}`);
  if (!out17.includes('"keyboard":[[{"text":"📱 分享手机号完成加入","request_contact":true}]]')) {
    throw new Error(`键盘结构不符（request_contact 必须在第一行第一列），stdout=${out17}`);
  }
  if (!out17.includes('"one_time_keyboard":true') || !out17.includes('"resize_keyboard":true')) {
    throw new Error(`键盘缺少 one_time_keyboard/resize_keyboard，stdout=${out17}`);
  }
  if (gwRequests.length !== gwCountBefore17) throw new Error('仅确认邀请不应调用网关');
  console.log('   ✅ PASS（两条消息：文案 + 键盘，未调网关）');

  console.log('🧪 测试 18: /staff <合法 token> → 与 /start staff_ 同款（确认文案 + 键盘）');
  const before18 = bot.getStdout().length;
  const s18 = await postJson(PORT, '/webhook/telegram', {
    message: {
      chat: { id: 920002, type: 'private' },
      text: `/staff ${validStaffToken}`,
      from: { id: 920002, first_name: 'Staff' }
    }
  });
  if (s18.status !== 200 || !s18.data.ok) throw new Error('/staff webhook failed');
  await new Promise(r => setTimeout(r, 200));
  const out18 = bot.getStdout().slice(before18);
  if (!out18.includes('邀请已确认')) throw new Error(`/staff 未回复「邀请已确认」，stdout=${out18}`);
  if (!out18.includes('"request_contact":true')) throw new Error(`/staff 未发送 request_contact 键盘，stdout=${out18}`);
  // 裸 /staff 必须早退提示用法，绝不能落进「常规输入 → 派单」把 /staff 当成需求提交
  const before18b = bot.getStdout().length;
  const n8nCountBefore18 = n8nRequests.length;
  await postJson(PORT, '/webhook/telegram', {
    message: { chat: { id: 920002, type: 'private' }, text: '/staff', from: { id: 920002, first_name: 'Staff' } }
  });
  await new Promise(r => setTimeout(r, 300));
  const out18b = bot.getStdout().slice(before18b);
  if (!out18b.includes('缺少邀请码')) throw new Error(`裸 /staff 未提示用法，stdout=${out18b}`);
  if (n8nRequests.length !== n8nCountBefore18) throw new Error('裸 /staff 被误当成需求转发');
  console.log('   ✅ PASS');

  console.log('🧪 测试 19: /start staff_<过期 token> → 只回「无效或已过期」，绝不发键盘');
  const before19 = bot.getStdout().length;
  const s19 = await postJson(PORT, '/webhook/telegram', {
    message: {
      chat: { id: 920003, type: 'private' },
      text: `/start staff_${staffToken(1, nowSec() - 60)}`,
      from: { id: 920003, first_name: 'Staff' }
    }
  });
  if (s19.status !== 200 || !s19.data.ok) throw new Error('expired staff token webhook failed');
  await new Promise(r => setTimeout(r, 200));
  const out19 = bot.getStdout().slice(before19);
  if (!out19.includes('无效或已过期')) throw new Error(`过期 token 未拒绝，stdout=${out19}`);
  if (out19.includes('request_contact')) throw new Error(`过期 token 仍发了键盘，stdout=${out19}`);
  if (out19.includes('邀请已确认')) throw new Error(`过期 token 仍回了「邀请已确认」，stdout=${out19}`);
  // 过期 token 不得写入 pending：其后分享手机号仍应走 cbind 二选一
  const before19b = bot.getStdout().length;
  const gwCountBefore19 = gwRequests.length;
  await postJson(PORT, '/webhook/telegram', {
    message: {
      chat: { id: 920003, type: 'private' },
      from: { id: 920003, first_name: 'Staff' },
      contact: { phone_number: '09171234568', user_id: 920003 }
    }
  });
  await new Promise(r => setTimeout(r, 200));
  const out19b = bot.getStdout().slice(before19b);
  if (!out19b.includes('cbind:r|09171234568') || !out19b.includes('cbind:m|09171234568')) {
    throw new Error(`过期 token 后 contact 未落到 cbind 二选一，stdout=${out19b}`);
  }
  if (gwRequests.length !== gwCountBefore19) throw new Error('过期 token 后 contact 不应调用网关');
  console.log('   ✅ PASS（无键盘、无 pending、contact 回落 cbind）');

  console.log('🧪 测试 20: 群聊 /start staff_<token> → 只提示私聊，不发键盘且不写 pending');
  const before20 = bot.getStdout().length;
  const s20 = await postJson(PORT, '/webhook/telegram', {
    message: {
      chat: { id: 555002, type: 'group' },
      text: `/start staff_${validStaffToken}`,
      from: { id: 920004, first_name: 'Staff' }
    }
  });
  if (s20.status !== 200 || !s20.data.ok) throw new Error('/start staff_ group failed');
  await new Promise(r => setTimeout(r, 200));
  const out20 = bot.getStdout().slice(before20);
  if (!out20.includes('请在私聊中发送')) throw new Error(`群聊未早退提示，stdout=${out20}`);
  if (out20.includes('request_contact') || out20.includes('web_app')) {
    throw new Error(`群聊泄漏键盘或 web_app 按钮，stdout=${out20}`);
  }
  // 门控必须在写 pending 之前：否则群里点一次链接，私聊里就被按员工身份绑定了
  const before20b = bot.getStdout().length;
  const gwCountBefore20 = gwRequests.length;
  await postJson(PORT, '/webhook/telegram', {
    message: {
      chat: { id: 920004, type: 'private' },
      from: { id: 920004, first_name: 'Staff' },
      contact: { phone_number: '09171234569', user_id: 920004 }
    }
  });
  await new Promise(r => setTimeout(r, 200));
  const out20b = bot.getStdout().slice(before20b);
  if (!out20b.includes('cbind:r|09171234569')) {
    throw new Error(`群聊 token 不应写入 pending（contact 应落 cbind），stdout=${out20b}`);
  }
  if (gwRequests.length !== gwCountBefore20) throw new Error('群聊场景不应调用网关');
  console.log('   ✅ PASS（群里不写 pending，contact 仍走 cbind）');

  console.log('🧪 测试 21: contact + 有 pending → staff_bind（ip = tg_user_id）→ 已加入 + 工作台按钮 → 消费 pending');
  gwResponder = (action) => (action === 'staff_bind'
    ? { status: 200, data: { success: true, data: { staff_id: 9, sid: 1, title: '川香阁·马尼拉中餐厅' } } }
    : { status: 200, data: { success: true, data: {} } });
  await postJson(PORT, '/webhook/telegram', {
    message: {
      chat: { id: 920005, type: 'private' },
      text: `/staff ${validStaffToken}`,
      from: { id: 920005, first_name: 'Staff' }
    }
  });
  await new Promise(r => setTimeout(r, 150));
  const before21 = bot.getStdout().length;
  const gwCountBefore21 = gwRequests.length;
  const s21 = await postJson(PORT, '/webhook/telegram', {
    message: {
      chat: { id: 920005, type: 'private' },
      from: { id: 920005, first_name: 'Staff' },
      contact: { phone_number: '09171234570', user_id: 920005 }
    }
  });
  if (s21.status !== 200 || !s21.data.ok) throw new Error('staff contact bind failed');
  await new Promise(r => setTimeout(r, 400));
  if (gwRequests.length !== gwCountBefore21 + 1) throw new Error(`网关调用次数异常: ${gwRequests.length}`);
  const gw21 = gwRequests[gwRequests.length - 1].body;
  if (gw21.action !== 'staff_bind') throw new Error(`应调用 staff_bind: ${gw21.action}`);
  if (gw21.params.tg_user_id !== '920005') throw new Error(`tg_user_id 不符: ${JSON.stringify(gw21.params)}`);
  if (gw21.params.phone !== '09171234570') throw new Error(`phone 不符: ${JSON.stringify(gw21.params)}`);
  // ip 必须是 tg_user_id：空串会让网关回落 Pod IP，全体 bot 用户挤进同一限频桶
  if (gw21.params.ip !== gw21.params.tg_user_id) throw new Error(`ip 未传 tg_user_id: ${JSON.stringify(gw21.params)}`);
  if (gw21.params.token !== validStaffToken) throw new Error(`token 未原样上送: ${JSON.stringify(gw21.params)}`);
  const out21 = bot.getStdout().slice(before21);
  if (!out21.includes('已加入')) throw new Error(`成功文案缺失，stdout=${out21}`);
  if (!out21.includes('川香阁·马尼拉中餐厅')) throw new Error(`未带店铺标题，stdout=${out21}`);
  if (!out21.includes(`"web_app":{"url":"${APP_BASE_URL}/tg/staff.php"}`)) {
    throw new Error(`未带员工工作台 web_app 按钮，stdout=${out21}`);
  }
  // 成功后 pending 必须被消费：再分享一次应回到 cbind 二选一，而不是二次 staff_bind
  const before21b = bot.getStdout().length;
  const gwCountBefore21b = gwRequests.length;
  await postJson(PORT, '/webhook/telegram', {
    message: {
      chat: { id: 920005, type: 'private' },
      from: { id: 920005, first_name: 'Staff' },
      contact: { phone_number: '09171234570', user_id: 920005 }
    }
  });
  await new Promise(r => setTimeout(r, 300));
  const out21b = bot.getStdout().slice(before21b);
  if (!out21b.includes('cbind:r|09171234570')) {
    throw new Error(`成功后 pending 未清除（应回 cbind），stdout=${out21b}`);
  }
  if (gwRequests.length !== gwCountBefore21b) throw new Error('成功后二次 contact 不应再调网关');
  gwResponder = null;
  console.log('   ✅ PASS（含 ip/token 入参断言与 pending 消费）');

  console.log('🧪 测试 22: contact + 无 pending → 仍走既有 cbind 二选一（回归保护）');
  const before22 = bot.getStdout().length;
  const gwCountBefore22 = gwRequests.length;
  const s22 = await postJson(PORT, '/webhook/telegram', {
    message: {
      chat: { id: 920006, type: 'private' },
      from: { id: 920006, first_name: 'Staff' },
      contact: { phone_number: '09171234571', user_id: 920006 }
    }
  });
  if (s22.status !== 200 || !s22.data.ok) throw new Error('no-pending contact failed');
  await new Promise(r => setTimeout(r, 300));
  const out22 = bot.getStdout().slice(before22);
  if (!out22.includes('cbind:r|09171234571') || !out22.includes('cbind:m|09171234571')) {
    throw new Error(`无 pending 时未回落到 cbind 二选一，stdout=${out22}`);
  }
  if (out22.includes('邀请已确认')) throw new Error(`无 pending 时误入员工分支，stdout=${out22}`);
  if (gwRequests.length !== gwCountBefore22) throw new Error('选择身份前不应调用网关');
  console.log('   ✅ PASS（无 pending 时不进员工分支）');

  console.log('🧪 测试 23: staff_bind 404 STAFF_NOT_FOUND → 「没有注册过」文案，且 pending 保留可重试');
  gwResponder = (action) => (action === 'staff_bind'
    ? { status: 404, data: { success: false, error: { code: 'STAFF_NOT_FOUND', message: 'no member for phone' } } }
    : { status: 200, data: { success: true, data: {} } });
  await postJson(PORT, '/webhook/telegram', {
    message: {
      chat: { id: 920007, type: 'private' },
      text: `/staff ${validStaffToken}`,
      from: { id: 920007, first_name: 'Staff' }
    }
  });
  await new Promise(r => setTimeout(r, 150));
  const before23 = bot.getStdout().length;
  const gwCountBefore23 = gwRequests.length;
  await postJson(PORT, '/webhook/telegram', {
    message: {
      chat: { id: 920007, type: 'private' },
      from: { id: 920007, first_name: 'Staff' },
      contact: { phone_number: '09171234572', user_id: 920007 }
    }
  });
  await new Promise(r => setTimeout(r, 400));
  const out23 = bot.getStdout().slice(before23);
  if (!out23.includes('没有注册过')) throw new Error(`STAFF_NOT_FOUND 文案未映射，stdout=${out23}`);
  if (gwRequests[gwRequests.length - 1].body.action !== 'staff_bind') throw new Error('未调用 staff_bind');
  // 失败保留 pending：再分享一次必须仍打 staff_bind（而不是掉回 cbind）——用户可重试一次
  const gwCountBefore23b = gwRequests.length;
  await postJson(PORT, '/webhook/telegram', {
    message: {
      chat: { id: 920007, type: 'private' },
      from: { id: 920007, first_name: 'Staff' },
      contact: { phone_number: '09171234572', user_id: 920007 }
    }
  });
  await new Promise(r => setTimeout(r, 400));
  if (gwRequests.length !== gwCountBefore23b + 1) throw new Error('失败后 pending 被误删（重试未调网关）');
  if (gwRequests[gwRequests.length - 1].body.action !== 'staff_bind') {
    throw new Error('失败后 pending 被误删（重试未走员工分支）');
  }
  gwResponder = null;
  console.log('   ✅ PASS（文案已映射，pending 保留可重试）');

  console.log('🧪 测试 24: 有 pending 但 contact 归属不一致 → 不发起绑定，且 pending 不被消费');
  await postJson(PORT, '/webhook/telegram', {
    message: {
      chat: { id: 920008, type: 'private' },
      text: `/staff ${validStaffToken}`,
      from: { id: 920008, first_name: 'Staff' }
    }
  });
  await new Promise(r => setTimeout(r, 150));
  const before24 = bot.getStdout().length;
  const gwCountBefore24 = gwRequests.length;
  const s24 = await postJson(PORT, '/webhook/telegram', {
    message: {
      chat: { id: 920008, type: 'private' },
      from: { id: 920008, first_name: 'Staff' },
      contact: { phone_number: '09171234573', user_id: 999999 } // 转发的名片
    }
  });
  if (s24.status !== 200 || !s24.data.ok) throw new Error('ownership mismatch with pending failed');
  await new Promise(r => setTimeout(r, 300));
  if (gwRequests.length !== gwCountBefore24) throw new Error('归属不一致时不应调用网关（含 staff_bind）');
  if (!bot.getStdout().slice(before24).includes('只能绑定你本人的手机号')) {
    throw new Error(`归属不一致未拒绝，stdout=${bot.getStdout().slice(before24)}`);
  }
  // pending 未被消费：本人随后正确分享仍应走 staff_bind
  const gwCountBefore24b = gwRequests.length;
  await postJson(PORT, '/webhook/telegram', {
    message: {
      chat: { id: 920008, type: 'private' },
      from: { id: 920008, first_name: 'Staff' },
      contact: { phone_number: '09171234573', user_id: 920008 }
    }
  });
  await new Promise(r => setTimeout(r, 400));
  if (gwRequests.length !== gwCountBefore24b + 1) throw new Error('归属失败后 pending 丢失');
  if (gwRequests[gwRequests.length - 1].body.action !== 'staff_bind') throw new Error('归属失败后未走员工分支');
  console.log('   ✅ PASS（红线校验先于员工分支，pending 保留）');

  console.log('🎉 所有 Telegram Bot 基建测试全部 100% 通过！');
  cleanup();
  process.exit(0);
}

run().catch(err => {
  console.error('❌ 测试失败:', err);
  cleanup();
  process.exit(1);
});
