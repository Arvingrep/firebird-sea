#!/usr/bin/env node

/**
 * 🔥 一人 AI 团队 Telegram 前哨 Bot 服务 (Telegram Dispatcher Service)
 * 特性：Zero-Dep 原生 Node.js 实现，兼具 Webhook 接收与长轮询监听能力
 */

const http = require('node:http');
const https = require('node:https');
const url = require('node:url');
const path = require('node:path');
const fs = require('node:fs');
const { execSync } = require('node:child_process');

const PORT = parseInt(process.env.TG_BOT_PORT || '3001', 10);
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/tg-input';
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '';
// 顾客站点的对外域名（如 https://fh580.net）。用于 /start 的 web_app 按钮。
// 必须由环境变量给：不在运行时从火鸟配置推断（cron/CLI 下 $cfg_basehost 会落到 fbird.men）。
const APP_BASE_URL = (process.env.TG_APP_BASE_URL || '').trim();

const ROOT_DIR = path.resolve(__dirname, '../../..');
// 派单脚本的执行目录。测试注入一个临时 git 仓库：dispatch-task.js 会写 .agents/tasks 并
// `git checkout -b feat/task-*`，在真实仓库里跑会把工作区切到别的分支（见 src/test.js）。
const DISPATCH_ROOT = process.env.TG_DISPATCH_ROOT || ROOT_DIR;

// --- 1. 发送 Telegram 消息工具函数 ---
function sendTelegramMessage(chatId, text, replyMarkup = null) {
  if (!BOT_TOKEN) {
    // mock 模式把 reply_markup 一起打出来：测试据此断言按钮（含 web_app）真的生成了
    console.log(`[TG-BOT:MOCK] 发送消息至 Chat ID ${chatId}: \n${text}` +
      (replyMarkup ? `\nmarkup=${JSON.stringify(replyMarkup)}` : ''));
    return Promise.resolve({ ok: true, mock: true });
  }

  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown',
      reply_markup: replyMarkup
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ ok: false, error: body });
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// --- 1b. 转发随笔消息到 n8n（永不 reject，返回 Promise<boolean>）---------------------
// 必须挂 'error'：没人监听时 ECONNREFUSED（n8n 未部署/不可达）会变成未捕获异常，直接让整个
// bot 进程退出（集群内实测：发第一条随笔就崩）。调用方平时不等它（fire-and-forget），
// 只有在"本地兜底不存在"的集群形态里才 await 拿结果决定回执文案。
function forwardToN8n(msg) {
  return new Promise((resolve) => {
    try {
      const payload = JSON.stringify({ message: msg });
      const urlObj = new URL(N8N_WEBHOOK_URL);
      const proto = urlObj.protocol === 'https:' ? https : http;
      const req = proto.request(urlObj, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        timeout: 2000
      });
      req.on('error', (e) => {
        console.error('[TG-BOT] n8n 转发失败:', e.message);
        resolve(false);
      });
      // timeout 只设置 socket 超时，不 destroy 的话请求会一直挂着
      req.on('timeout', () => req.destroy());
      req.on('response', (res) => {
        res.resume();
        res.on('end', () => resolve(res.statusCode >= 200 && res.statusCode < 300));
      });
      req.write(payload);
      req.end();
    } catch (e) {
      console.error('[TG-BOT] n8n 转发失败:', e.message);
      resolve(false);
    }
  });
}

// 顾客免密登录入口（Telegram Mini App）。域名来自 TG_APP_BASE_URL，未配置/非法返回 ''。
// 必须是 https：Telegram 只接受 https 的 web_app URL，http 会让整条消息发送失败。
function customerEntryUrl(base) {
  const raw = String(base || '').trim().replace(/\/+$/, '');
  if (raw === '') return '';
  try {
    if (new URL(raw).protocol !== 'https:') return '';
  } catch (_) {
    return '';
  }
  return `${raw}/tg/entry.php?role=customer`;
}

// 骑手绑定入口（Telegram Mini App）。与顾客入口同源不同路径：
// /tg-api/rider/bind 是 API 侧渲染的落地页，只在 Telegram 内作为 Mini App 打开时
// 才拿得到 initData（普通浏览器 / 站内 webview 里 initData 恒为空，页面会提示「请在
// Telegram 内打开」）。因此这个 URL 只应通过 web_app 按钮派发，不能当普通链接发。
function riderEntryUrl(base) {
  const raw = String(base || '').trim().replace(/\/+$/, '');
  if (raw === '') return '';
  try {
    if (new URL(raw).protocol !== 'https:') return '';
  } catch (_) {
    return '';
  }
  return `${raw}/tg-api/rider/bind`;
}

// --- 2. 核心消息处理器 ---
async function handleIncomingMessage(msg) {
  const chatId = msg.chat?.id;
  const text = msg.text || msg.caption || '';
  const fromName = msg.from?.first_name || 'Boss';

  console.log(`📩 [TG-BOT] 收到来自 ${fromName} (${chatId}) 的消息: "${text}"`);

  // 指令 1: /start
  if (text.startsWith('/start')) {
    const welcome = `
👋 *您好，${fromName}！欢迎来到一人 AI 团队前哨控制台*
━━━━━━━━━━━━━━━━━━━━
我是您的火鸟东南亚架构秘书。您可以随时给我发送：
1. 💡 *随想文字/语音*：自动脱水剪枝并派单至 BMAD 看板
2. 📊 */status*：查看 Coins.ph 比索行情与系统状态
3. 🧹 */clean*：执行工程脱水剪枝清理
━━━━━━━━━━━━━━━━━━━━
💡 请直接在此发送任何需求，我将为您启动自动化闭环！
`;
    const rows = [];
    // web_app 按钮只在私聊里合法：群里带上它会让整条 sendMessage 被 Telegram 拒绝
    const isPrivate = !msg.chat?.type || msg.chat.type === 'private';
    const entryUrl = customerEntryUrl(APP_BASE_URL);
    if (entryUrl && isPrivate) {
      rows.push([{ text: '🛒 打开商店', web_app: { url: entryUrl } }]);
    } else if (!entryUrl) {
      console.error('[TG-BOT] TG_APP_BASE_URL 未配置或不是 https，/start 缺少「打开商店」入口');
    }
    const riderUrl = riderEntryUrl(APP_BASE_URL);
    if (riderUrl && isPrivate) {
      rows.push([{ text: '🛵 骑手入口', web_app: { url: riderUrl } }]);
    }
    rows.push([{ text: '📋 查看 BMAD 看板', url: 'https://github.com/arvin/firebird-sea/projects' }]);
    rows.push([{ text: '📊 实时系统探针', callback_data: 'check_status' }]);
    const markup = { inline_keyboard: rows };
    return sendTelegramMessage(chatId, welcome, markup);
  }

  // 指令 1.5: /rider —— 骑手绑定入口（必须在私聊里发，web_app 按钮在群里非法）
  if (text.startsWith('/rider')) {
    const isPrivate = !msg.chat?.type || msg.chat.type === 'private';
    const riderUrl = riderEntryUrl(APP_BASE_URL);
    if (!riderUrl) {
      console.error('[TG-BOT] TG_APP_BASE_URL 未配置或不是 https，/rider 无法生成入口');
      return sendTelegramMessage(chatId, '❌ 骑手入口未配置（TG_APP_BASE_URL 缺失或不是 https）');
    }
    if (!isPrivate) {
      return sendTelegramMessage(chatId, '请在私聊中发送 /rider 获取骑手绑定入口');
    }
    return sendTelegramMessage(
      chatId,
      '🛵 *骑手绑定*\n━━━━━━━━━━━━━━━━━━━━\n点下方按钮，输入你注册骑手时留的手机号。\n绑定成功后自动进入骑手工作台（链接 10 分钟内有效）。\n\n若提示「手机号未找到骑手档案」，先让运营在后台补录骑手。',
      { inline_keyboard: [[{ text: '🛵 绑定并进入工作台', web_app: { url: riderUrl } }]] }
    );
  }

  // 指令 2: /status
  if (text.startsWith('/status')) {
    let rateInfo = '62.88 PHP/USDT';
    try {
      const tickerRaw = execSync('node -e "require(\'./services/api/src/coinsPhClient\').getTickerPrice(\'USDTPHP\').then(t=>console.log(t.price)).catch(()=>console.log(\'62.88\'))"', {
        cwd: ROOT_DIR,
        encoding: 'utf-8',
        timeout: 3000
      }).trim();
      if (tickerRaw) rateInfo = `${tickerRaw} PHP/USDT`;
    } catch (_) {}

    const statusMsg = `
📊 *【火鸟东南亚一人团队基建状态】*
━━━━━━━━━━━━━━━━━━━━
🇵🇭 *Coins.ph 汇率*: \`1 USDT = ₱${rateInfo}\`
🛡️ *授权域名*: \`fh580.net (已注入证书)\`
☸️ *发布架构*: \`GKE Helm (Manila & Cebu)\`
🤖 *Agent 状态*: \`Dev Agent & Acceptance Agent 就绪\`
━━━━━━━━━━━━━━━━━━━━
`;
    return sendTelegramMessage(chatId, statusMsg);
  }

  // 指令 3: /clean
  if (text.startsWith('/clean')) {
    try {
      execSync('make clean-bloat', { cwd: ROOT_DIR });
      return sendTelegramMessage(chatId, '🧹 *工程体系脱水剪枝完成！* 临时垃圾与悬挂镜像已清理。');
    } catch (e) {
      return sendTelegramMessage(chatId, `❌ 清理失败: ${e.message}`);
    }
  }

  // 常规输入 -> 触发需求脱水与派发闭环
  try {
    // 转发 n8n（先发出去，不阻塞后面的本地兜底；只有集群里没有本地脚本时才 await 它的结果）
    const n8nForwarded = forwardToN8n(msg);

    // 本地引擎兜底生成标准脱水 Spec。
    // 集群镜像只打包 services/tg-bot/src，没有仓库根的 scripts/ 与 .agents/ → 本地兜底不可用，
    // 这里用 existsSync 判断"脚本不存在"并跳过。不要用 try/catch 吞 execSync 的异常：
    // 那样真实的执行故障（语法错/权限/参数问题）也会被当成"脚本不存在"，把故障藏起来。
    const dispatchScript = path.join(DISPATCH_ROOT, 'scripts', 'dispatch-task.js');
    if (!fs.existsSync(dispatchScript)) {
      // 只剩 n8n 一条通道，等它的结果再回执（最多 2s），避免把转发失败说成"已提交"
      const forwarded = await n8nForwarded;
      return sendTelegramMessage(chatId, forwarded
        ? '📋 *【需求已提交 n8n 派单通道】*\n━━━━━━━━━━━━━━━━━━━━\n本地脱水在集群内不可用（镜像不含 scripts/），已交由 n8n 流水线处理。'
        : '❌ *派单通道不可用*：本地脱水脚本缺失（集群镜像不含 scripts/），n8n 转发也未成功。请检查 N8N_WEBHOOK_URL。');
    }

    const result = execSync(`node scripts/dispatch-task.js "${text.replace(/"/g, '\\"')}" WAIMAI HIGH`, {
      cwd: DISPATCH_ROOT,
      encoding: 'utf-8'
    });

    const match = result.match(/TASK-\d+/);
    const taskId = match ? match[0] : 'TASK-NEW';

    const ack = `
📋 *【需求已脱水并入池: ${taskId}】*
━━━━━━━━━━━━━━━━━━━━
📌 需求原声: "${text.slice(0, 35)}..."
✂️ 脱水准则: *单一核心 AC + Zero-Dep 约束*
🤖 状态流转: *已加入 Backlog, 等待 Dev Agent 施工*
━━━━━━━━━━━━━━━━━━━━
`;
    return sendTelegramMessage(chatId, ack);
  } catch (err) {
    return sendTelegramMessage(chatId, `❌ 派单异常: ${err.message}`);
  }
}

// --- 3. HTTP 服务器 (Webhook 接收与主动卡片推送) ---
const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);

  // 健康探针
  if (req.method === 'GET' && parsed.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', service: 'tg-bot', timestamp: new Date().toISOString() }));
  }

  // 接收 Telegram Webhook 事件
  if (req.method === 'POST' && parsed.pathname === '/webhook/telegram') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const update = JSON.parse(body);
        if (update.message) {
          await handleIncomingMessage(update.message);
        } else if (update.callback_query) {
          const cb = update.callback_query;
          if (cb.data === 'check_status') {
            await handleIncomingMessage({ chat: cb.message.chat, text: '/status' });
          }
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 主动推送卡片接口 (供 CI/CD, 验收报告, 运维调用)
  if (req.method === 'POST' && parsed.pathname === '/send-card') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const targetChat = payload.chatId || ADMIN_CHAT_ID;
        if (!targetChat) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Missing chatId or TELEGRAM_ADMIN_CHAT_ID' }));
        }
        const result = await sendTelegramMessage(targetChat, payload.text, payload.replyMarkup);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

// --- 4. 长轮询监听 (getUpdates) ---
// 本地容器无公网入口，Telegram 无法把 webhook 推到 localhost:3001，
// 因此用 getUpdates 主动拉取（注释里一直声称的「长轮询」此前并未实现）。
function tgApi(method, params = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(params);
    const req = https.request({
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${BOT_TOKEN}/${method}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch (e) { resolve({ ok: false, error: body }); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function dispatchUpdate(update) {
  if (update.message) {
    await handleIncomingMessage(update.message);
  } else if (update.callback_query) {
    const cb = update.callback_query;
    if (cb.data === 'check_status') {
      await handleIncomingMessage({ chat: cb.message.chat, text: '/status' });
    }
  }
}

async function startPolling() {
  if (!BOT_TOKEN) {
    console.log('ℹ️  [TG-BOT] 未配置 TELEGRAM_BOT_TOKEN，长轮询未启动（Mock 模式）');
    return;
  }
  // 确保没有残留 webhook，否则 getUpdates 必 409；不丢弃积压（drop_pending_updates:false）
  await tgApi('deleteWebhook', { drop_pending_updates: false }).catch(() => {});
  let offset = 0;
  console.log('🔄 [TG-BOT] 长轮询已启动 (getUpdates)，开始监听消息...');
  for (;;) {
    try {
      const resp = await tgApi('getUpdates', {
        offset,
        timeout: 50,
        allowed_updates: ['message', 'callback_query']
      });
      if (!resp.ok) {
        const desc = resp.description || resp.error || '';
        if (resp.error_code === 409 || /conflict/i.test(desc)) {
          console.error('⚠️  [TG-BOT] getUpdates 409 冲突：同一 Bot Token 被别处占用（另一个轮询实例或 webhook）。暂停 15s 重试。');
          await new Promise(r => setTimeout(r, 15000));
          continue;
        }
        console.error('[TG-BOT] getUpdates 错误:', desc);
        await new Promise(r => setTimeout(r, 5000));
        continue;
      }
      for (const update of resp.result) {
        offset = update.update_id + 1;
        try { await dispatchUpdate(update); }
        catch (e) { console.error('[TG-BOT] 处理更新异常:', e.message); }
      }
    } catch (e) {
      console.error('[TG-BOT] 轮询网络异常:', e.message);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

server.listen(PORT, () => {
  console.log(`🤖 [TG-BOT] 前哨服务已在端口 ${PORT} 启动！`);
  console.log(`   - 接收 Webhook: POST http://localhost:${PORT}/webhook/telegram`);
  console.log(`   - 推送卡片接口: POST http://localhost:${PORT}/send-card`);
  startPolling();
});
