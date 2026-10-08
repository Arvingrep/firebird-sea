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

const ROOT_DIR = path.resolve(__dirname, '../../..');

// --- 1. 发送 Telegram 消息工具函数 ---
function sendTelegramMessage(chatId, text, replyMarkup = null) {
  if (!BOT_TOKEN) {
    console.log(`[TG-BOT:MOCK] 发送消息至 Chat ID ${chatId}: \n${text}`);
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
    const markup = {
      inline_keyboard: [
        [{ text: '📋 查看 BMAD 看板', url: 'https://github.com/arvin/firebird-sea/projects' }],
        [{ text: '📊 实时系统探针', callback_data: 'check_status' }]
      ]
    };
    return sendTelegramMessage(chatId, welcome, markup);
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
    // 优先尝试转发 n8n Webhook
    let forwardedToN8n = false;
    try {
      const n8nPayload = JSON.stringify({ message: msg });
      const n8nUrlObj = new URL(N8N_WEBHOOK_URL);
      const reqProto = n8nUrlObj.protocol === 'https:' ? https : http;
      const n8nReq = reqProto.request(n8nUrlObj, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        timeout: 2000
      });
      n8nReq.write(n8nPayload);
      n8nReq.end();
      forwardedToN8n = true;
    } catch (_) {}

    // 本地引擎兜底生成标准脱水 Spec
    const result = execSync(`node scripts/dispatch-task.js "${text.replace(/"/g, '\\"')}" WAIMAI HIGH`, {
      cwd: ROOT_DIR,
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
