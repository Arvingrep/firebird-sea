#!/usr/bin/env node

/**
 * 🔥 一人 AI 团队 Telegram 前哨 Bot 服务 (Telegram Dispatcher Service)
 * 特性：Zero-Dep 原生 Node.js 实现，兼具 Webhook 接收与长轮询监听能力
 */

const http = require('node:http');
const https = require('node:https');
const crypto = require('node:crypto');
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

// --- 1.4 request_contact 一键绑定通道（bot 直连 PHP 网关，HMAC 同 gatewayClient.js 契约）---
// 与 api 侧 services/api/src/gatewayClient.js:12-17 同一契约：
//   POST ${FBS_GATEWAY_URL}/api/fbs/index.php，body {"action","params"}，
//   签名串 timestamp + '\n' + action + '\n' + body，HMAC-SHA256 十六进制，
//   头 X-Fbs-Timestamp / X-Fbs-Signature。bot 只调 bind 类动作（宽窗 ±300s），不碰 session 动作。
const FBS_GATEWAY_URL = (process.env.FBS_GATEWAY_URL || '').trim();
const FBS_GATEWAY_SECRET = process.env.FBS_GATEWAY_SECRET || '';
const GATEWAY_PATH = '/api/fbs/index.php';

function contactBindConfigured() {
  if (FBS_GATEWAY_URL === '' || FBS_GATEWAY_SECRET === '') return false;
  try {
    const u = new URL(GATEWAY_PATH, FBS_GATEWAY_URL);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

function gatewaySign(secret, timestamp, action, body) {
  return crypto.createHmac('sha256', secret).update(`${timestamp}\n${action}\n${body}`).digest('hex');
}

function gatewayCall(action, params, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ action, params });
    const timestamp = String(Math.floor(Date.now() / 1000));
    let u;
    try {
      u = new URL(GATEWAY_PATH, FBS_GATEWAY_URL);
    } catch (e) {
      return reject(new Error('FBS_GATEWAY_URL 非法'));
    }
    const lib = u.protocol === 'https:' ? https : http;
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Fbs-Timestamp': timestamp,
      'X-Fbs-Signature': gatewaySign(FBS_GATEWAY_SECRET, timestamp, action, body)
    };
    const req = lib.request(u, { method: 'POST', headers }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        const err = new Error(`网关返回 HTTP ${res.statusCode}`);
        err.gwStatus = res.statusCode;
        try { err.gwPayload = JSON.parse(data); } catch (_) { /* 非 JSON 错误页，保留状态码即可 */ }
        if (res.statusCode < 200 || res.statusCode >= 300) return reject(err);
        let payload = null;
        try { payload = JSON.parse(data); } catch (_) { return reject(new Error('网关返回非 JSON')); }
        resolve(payload);
      });
    });
    req.on('error', reject);
    const timer = setTimeout(() => req.destroy(new Error(`网关请求超时（${timeoutMs}ms）`)), timeoutMs);
    if (typeof timer.unref === 'function') timer.unref();
    req.end(body);
  });
}

// 一键绑定失败文案（按网关错误码映射，口径对齐 riderRoute.js:176-197 与 MERCHANT_TG_HOOKS 错误码表）。
// 映射不到的一律「服务暂时不可用」，不把内部细节透给用户。
const CONTACT_BIND_MESSAGES = {
  COURIER_NOT_FOUND: '❌ 未找到该手机号对应的骑手账号。请确认号码与站点登记的骑手手机号一致；若刚入职，先让运营在后台补录骑手。',
  COURIER_AMBIGUOUS: '❌ 该手机号对应多个骑手账号，请联系运营核实后再试。',
  TG_ALREADY_BOUND: '❌ 这个 Telegram 账号已经绑定过其他骑手/商家，请先联系运营处理原绑定。',
  COURIER_ALREADY_BOUND: '❌ 该骑手已绑定其他 Telegram 账号，请先解绑或联系运营。',
  MERCHANT_NOT_FOUND: '❌ 未找到该手机号对应的商家会员。请确认号码与会员资料一致，或联系运营补录。',
  MERCHANT_AMBIGUOUS: '❌ 该手机号对应多个商家会员，请联系运营核实后再试。',
  MERCHANT_NO_SHOP: '❌ 还没有被分配外卖店铺，请联系运营在后台「外卖 → 店铺 → 管理会员」里分配。',
  MERCHANT_ALREADY_BOUND: '❌ 该商家已绑定其他 Telegram 账号，请先解绑或联系运营。',
  MISSING_PARAM: '❌ 手机号格式不正确。请用键盘「分享手机号」按钮重新发送，或到绑定页面手动输入。',
  BIND_RATE_LIMITED: '⏳ 操作过于频繁，请几分钟后再试。',
  AUDIT_UNAVAILABLE: '⚠️ 服务暂时不可用，请稍后重试。',
  BIND_FAILED: '❌ 绑定失败，请稍后重试。'
};

function contactBindErrorText(err) {
  const payload = err && err.gwPayload;
  const code = (payload && payload.error && payload.error.code) || (err && err.gwCode) || '';
  if (CONTACT_BIND_MESSAGES[code]) return CONTACT_BIND_MESSAGES[code];
  // 409 一族（冲突语义）兜底提示，避免把未知冲突码说成「服务不可用」误导用户重试
  if (err && err.gwStatus === 409) return '❌ 该手机号或当前账号已存在绑定关系，请先解绑后再试。';
  return '⚠️ 服务暂时不可用，请稍后重试。';
}

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

// 商家免密入口（Telegram Mini App，方案 A）：直达顾客落地页的 role=merchant 变体。
// 首次绑定的商家在 entry.php 里会被无缝跳到 /tg-api/merchant/bind 绑定页，
// 所以这里只维护一个 URL；/start 与 /merchant 都指它。
function merchantEntryUrl(base) {
  const raw = String(base || '').trim().replace(/\/+$/, '');
  if (raw === '') return '';
  try {
    if (new URL(raw).protocol !== 'https:') return '';
  } catch (_) {
    return '';
  }
  return `${raw}/tg/entry.php?role=merchant`;
}

// 网站登录确认入口（Telegram Mini App）：令牌由 api/login/telegram 插件下发，页面在 Telegram 内打开才能拿到 initData。
function loginConfirmUrl(base, token) {
  const raw = String(base || '').trim().replace(/\/+$/, '');
  if (raw === '' || !/^[a-f0-9]{32}$/.test(String(token || ''))) return '';
  try {
    if (new URL(raw).protocol !== 'https:') return '';
  } catch (_) {
    return '';
  }
  return `${raw}/api/login.php?type=telegram&act=confirm&t=${token}`;
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

// --- 1.5 request_contact 一键绑定：消息与回调处理 ---
// 信任模型：Telegram 只有在用户分享「自己的」联系方式时 contact.user_id 才等于 from.id；
// 转发的 contact 不带 user_id。因此 bot 先做归属校验，对不上一律拒绝、绝不调用网关——
// 网关侧的防冒用完全建立在这条红线之上（bot 是唯一受信调用方，HMAC 只证「bot 发的」不证「本人同意」）。
async function handleContactShare(msg) {
  const chatId = msg.chat && msg.chat.id;
  const isPrivate = !msg.chat || !msg.chat.type || msg.chat.type === 'private';
  if (!isPrivate) {
    return sendTelegramMessage(chatId, '请在与机器人的私聊中完成手机号绑定');
  }
  // 安全红线：msg.from.id === msg.contact.user_id 必须严格相等；user_id 缺失（转发消息）同样拒绝。
  if (!msg.from || !msg.contact || String(msg.contact.user_id) !== String(msg.from.id)) {
    console.error('[TG-BOT] contact 归属校验失败：contact.user_id 与 from.id 不一致，拒绝绑定');
    return sendTelegramMessage(chatId, '⛔ 只能绑定你本人的手机号：请点键盘上的「📱 分享手机号完成绑定」按钮发送，不要转发别人的名片。');
  }
  if (!contactBindConfigured()) {
    console.error('[TG-BOT] FBS_GATEWAY_URL / FBS_GATEWAY_SECRET 未配置，一键绑定不可用（落地页手输路径不受影响）');
    return sendTelegramMessage(chatId, '❌ 绑定通道未配置，请点「🛵 骑手入口 / 🏪 商家后台」按钮进入页面手动输入手机号完成绑定。');
  }
  // 轻校验：只留数字、长度 7-13（完整归一化 +63/63→0 是网关 fbs_normalize_phone 的职责，bot 不重复实现）。
  const digits = String(msg.contact.phone_number || '').replace(/[^0-9]/g, '');
  if (digits.length < 7 || digits.length > 13) {
    return sendTelegramMessage(chatId, '❌ 手机号无法识别，请点键盘上的「📱 分享手机号完成绑定」按钮重新发送。');
  }
  // contact 消息不携带「是哪个键盘按钮触发的」，无法推断骑手/商家身份；
  // 用一次性内联按钮让用户选链路，手机号随 callback_data 传递（≤64B），bot 不落任何内存态。
  return sendTelegramMessage(
    chatId,
    `📱 收到手机号 ${digits}。\n请选择要绑定的身份：`,
    {
      inline_keyboard: [
        [{ text: '🛵 绑定为骑手', callback_data: `cbind:r|${digits}` }],
        [{ text: '🏪 绑定为商家', callback_data: `cbind:m|${digits}` }]
      ]
    }
  );
}

// ip 参数策略（限频三维 tg 5/60s、phone 3/300s、ip 20/300s，底账 fbs_bind_audit）：
//   bot 传 ip = tg_user_id（纯数字）。
//   ① 不能传空串：网关 fbs_bind_ip() 对空 ip 会回落到调用方 context IP——即 bot Pod IP，
//      全部 bot 用户会挤进同一个 ip 桶（20/300s 全局），批量入职当天必然误伤。
//   ② 纯数字 ip 与 web 通道永不共桶：web 侧 ip 经同一清洗函数保留 '.' 或 ':'（IPv4/IPv6 均含），
//      纯数字串不可能与任何清洗后的真实 IP 相等，满足「bot 与 web 不进同一限频桶」。
//   ③ 审计可追溯：fbs_bind_audit 的 ip 列出现纯数字长串即 bot 通道（web 恒带分隔符），
//      tg 维度仍是更紧的主限（5/60s），ip 维度退化为 bot 侧每用户 20/300s 的冗余兜底。
async function handleBindRoleChoice(cb) {
  const chatId = cb.message && cb.message.chat && cb.message.chat.id;
  const m = /^cbind:([rm])\|(\d{7,13})$/.exec(String(cb.data || ''));
  if (!chatId || !m) return; // 非本功能的回调，静默交给后续分支
  if (!contactBindConfigured()) {
    return sendTelegramMessage(chatId, '❌ 绑定通道未配置，请点「🛵 骑手入口 / 🏪 商家后台」按钮进入页面手动输入手机号完成绑定。');
  }
  const tgUserId = String(cb.from && cb.from.id || '');
  if (!/^[1-9][0-9]{0,18}$/.test(tgUserId)) {
    return sendTelegramMessage(chatId, '❌ 无法识别你的 Telegram 账号，请重新分享手机号后再试。');
  }
  const isRider = m[1] === 'r';
  const action = isRider ? 'rider_bind' : 'merchant_bind';
  const params = { tg_user_id: tgUserId, phone: m[2], ip: tgUserId };
  let resp;
  try {
    resp = await gatewayCall(action, params);
  } catch (err) {
    // 只记消息：不落手机号/ip 细节
    console.error(`[TG-BOT] ${action} 失败: HTTP ${err.gwStatus || '-'} ${String(err.message).slice(0, 200)}`);
    return sendTelegramMessage(chatId, contactBindErrorText(err));
  }
  // 2xx 但 success:false 同样视为失败，绝不静默成功（与 riderRoute.js 同一口径）
  if (!resp || resp.success !== true) {
    return sendTelegramMessage(chatId, '❌ 绑定失败，请稍后重试。');
  }
  if (isRider) {
    const riderUrl = riderEntryUrl(APP_BASE_URL);
    return sendTelegramMessage(
      chatId,
      '✅ *骑手绑定成功！*\n━━━━━━━━━━━━━━━━━━━━\n点下方按钮进入骑手工作台（绑定已生效，无需再输手机号）。',
      riderUrl ? { inline_keyboard: [[{ text: '🛵 进入工作台', web_app: { url: riderUrl } }]] } : null
    );
  }
  const merchantUrl = merchantEntryUrl(APP_BASE_URL);
  return sendTelegramMessage(
    chatId,
    '✅ *商家绑定成功！*\n━━━━━━━━━━━━━━━━━━━━\n点下方按钮进入商家后台（/wmsj）。',
    merchantUrl ? { inline_keyboard: [[{ text: '🏪 进入商家后台', web_app: { url: merchantUrl } }]] } : null
  );
}

// 回调分流：一键绑定的角色选择回调；其余维持原有 check_status。
function dispatchCallbackQuery(cb) {
  if (cb && typeof cb.data === 'string' && cb.data.startsWith('cbind:')) {
    return handleBindRoleChoice(cb);
  }
  if (cb && cb.data === 'check_status') {
    return handleIncomingMessage({ chat: cb.message.chat, text: '/status' });
  }
  return Promise.resolve();
}

// --- 2. 核心消息处理器 ---
async function handleIncomingMessage(msg) {
  const chatId = msg.chat?.id;
  const text = msg.text || msg.caption || '';
  const fromName = msg.from?.first_name || 'Boss';

  // 指令 0.4: message.contact —— request_contact 一键绑定（无文本，必须放在文本指令之前）
  if (msg.contact) {
    return handleContactShare(msg);
  }

  console.log(`📩 [TG-BOT] 收到来自 ${fromName} (${chatId}) 的消息: "${text}"`);

  // 指令 0: /start login_<令牌> —— 网站（微信/浏览器）发起的「用 Telegram 登录」确认。
  // 令牌是 32 位十六进制；只在私聊发 web_app 确认按钮（Mini App 页里才拿得到可验签的 initData）。
  const loginMatch = /^\/start(?:@\w+)?\s+login_([a-f0-9]{32})\s*$/.exec(text.trim());
  if (loginMatch) {
    const isPrivate = !msg.chat?.type || msg.chat.type === 'private';
    const confirmUrl = loginConfirmUrl(APP_BASE_URL, loginMatch[1]);
    if (!confirmUrl) {
      console.error('[TG-BOT] TG_APP_BASE_URL 未配置或不是 https，无法生成网站登录确认入口');
      return sendTelegramMessage(chatId, '❌ 网站登录暂时不可用，请稍后再试');
    }
    if (!isPrivate) {
      return sendTelegramMessage(chatId, '请在与机器人的私聊中确认网站登录');
    }
    return sendTelegramMessage(
      chatId,
      '🔐 *网站登录确认*\n━━━━━━━━━━━━━━━━━━━━\n有人正在网站上请求用你的 Telegram 账号登录。\n只有这是你本人刚刚发起的，才点下方按钮确认；否则请忽略本消息。\n（链接 5 分钟内有效）',
      { inline_keyboard: [[{ text: '✅ 确认登录', web_app: { url: confirmUrl } }]] }
    );
  }

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
    const merchantUrl = merchantEntryUrl(APP_BASE_URL);
    if (merchantUrl && isPrivate) {
      rows.push([{ text: '🏪 商家后台', web_app: { url: merchantUrl } }]);
    } else if (!merchantUrl) {
      console.error('[TG-BOT] TG_APP_BASE_URL 未配置或不是 https，/start 缺少「商家后台」入口');
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
    ).then(() =>
      // request_contact 回复键盘单独一条消息携带：reply_markup 里 inline 与 reply 二选一，不能同发。
      // 键盘挂在聊天底部（one_time_keyboard：分享一次后自动收起），与上一条消息的 web_app 按钮并存
      // ——两条绑定通道共存，落地页手输路径不被移除。
      sendTelegramMessage(chatId, '或点下方按钮一键分享手机号完成绑定：', {
        keyboard: [[{ text: '📱 分享手机号完成绑定', request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true
      })
    );
  }

  // 指令 1.6: /merchant —— 商家免密入口（必须在私聊里发，web_app 按钮在群里非法）
  if (text.startsWith('/merchant')) {
    const isPrivate = !msg.chat?.type || msg.chat.type === 'private';
    const merchantUrl = merchantEntryUrl(APP_BASE_URL);
    if (!merchantUrl) {
      console.error('[TG-BOT] TG_APP_BASE_URL 未配置或不是 https，/merchant 无法生成入口');
      return sendTelegramMessage(chatId, '❌ 商家入口未配置（TG_APP_BASE_URL 缺失或不是 https）');
    }
    if (!isPrivate) {
      return sendTelegramMessage(chatId, '请在私聊中发送 /merchant 获取商家后台入口');
    }
    return sendTelegramMessage(
      chatId,
      '🏪 *商家后台*\n━━━━━━━━━━━━━━━━━━━━\n点下方按钮即可进入商家后台（/wmsj）。\n首次使用需输入入驻时登记的会员手机号完成绑定；已绑定的直接进入。\n\n若提示「还没有被分配外卖店铺」，请联系运营在后台「外卖 → 店铺 → 管理会员」里分配。',
      { inline_keyboard: [[{ text: '🏪 进入商家后台', web_app: { url: merchantUrl } }]] }
    ).then(() =>
      // 同 /rider：request_contact 键盘单独一条消息，与 web_app 内联按钮并存（见 /rider 处注释）
      sendTelegramMessage(chatId, '或点下方按钮一键分享手机号完成绑定：', {
        keyboard: [[{ text: '📱 分享手机号完成绑定', request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true
      })
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
          await dispatchCallbackQuery(update.callback_query);
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
    await dispatchCallbackQuery(update.callback_query);
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
