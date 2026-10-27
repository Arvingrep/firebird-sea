#!/usr/bin/env python3
# 生成 n8n 工作流：配送调度与骑手 TG 桥（抢单/取货/送达）
# 桥接原理：骑手 cookie 直注（HN_courier=<did>，include/class/cookie.class.php 前缀 cfg_cookiePre='HN_'），
# 复用真实业务接口 include/ajax.php?service=waimai&action=courierLogin|courierOrderList|qiangdan|peisong，
# 不绕过任何业务规则（抢单原子性、取货/送达距离校验、分佣、会员通知全部保留）。
import json

BACKEND = "https://canary.fbird.men/include/ajax.php"
CRED = {"telegramApi": {"id": "IhoaMQPvhBaIn4kR", "name": "Firebird TG Bot (rotated 2026-10-09)"}}
ADMIN_CHAT = 2057618975

def http_get(name, qs, cookie_expr=None, x=0, y=0):
    params = {
        "url": BACKEND,
        "sendQuery": True,
        "queryParameters": {"parameters": [{"name": k, "value": v} for k, v in qs]},
        "options": {"response": {"response": {"responseFormat": "text", "neverError": True}}},
    }
    if cookie_expr:
        params["sendHeaders"] = True
        params["headerParameters"] = {"parameters": [{"name": "Cookie", "value": cookie_expr}]}
    return {"parameters": params, "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.2,
            "name": name, "position": [x, y]}

def http_post_login(name, x, y):
    # 账号密码走 POST body，不进 URL（避免落执行日志）
    return {"parameters": {
        "url": BACKEND, "method": "POST",
        "sendQuery": True,
        "queryParameters": {"parameters": [
            {"name": "service", "value": "waimai"},
            {"name": "action", "value": "courierLogin"},
            {"name": "logintype", "value": "accountLogin"}]},
        "sendBody": True, "contentType": "form-urlencoded",
        "bodyParameters": {"parameters": [
            {"name": "username", "value": "={{ $json.username }}"},
            {"name": "password", "value": "={{ $json.password }}"}]},
        "options": {"response": {"response": {"responseFormat": "text", "neverError": True}}}},
        "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.2, "name": name, "position": [x, y]}

def code(name, js, x, y):
    return {"parameters": {"jsCode": js}, "type": "n8n-nodes-base.code", "typeVersion": 2,
            "name": name, "position": [x, y]}

def if_node(name, left, op, right, x, y, optype="string"):
    operator = {"type": optype, "operation": op}
    if optype == "string":
        operator = {"type": "string", "operation": op}
    cond = {"options": {"caseSensitive": True, "leftValue": "", "typeValidation": "loose"},
            "conditions": [{"id": "c1", "leftValue": left, "rightValue": right, "operator": operator}],
            "combinator": "and"}
    return {"parameters": {"conditions": cond}, "type": "n8n-nodes-base.if", "typeVersion": 2,
            "name": name, "position": [x, y]}

def tg(name, x, y, keyboard=False):
    # 注意：这台 n8n 的 telegram 节点 replyMarkup/inlineKeyboard 是顶层参数（不是 additionalFields）
    params = {"chatId": "={{ $json.chatId }}", "text": "={{ $json.text }}",
              "additionalFields": {"appendAttribution": False}}
    if keyboard:
        params["replyMarkup"] = "inlineKeyboard"
        params["inlineKeyboard"] = ("={{ (() => { const kb = ($json.keyboard && $json.keyboard.inline_keyboard)"
                                    " ? $json.keyboard.inline_keyboard : [];"
                                    " return { rows: kb.map(btns => ({ row: { buttons: btns.map(b => "
                                    "({ text: b.text, additionalFields: { callback_data: b.callback_data } })) } })); }; })() }}")
    return {"parameters": params,
            "type": "n8n-nodes-base.telegram", "typeVersion": 1.2, "name": name,
            "position": [x, y], "credentials": CRED}

# ---------- 公共代码片段 ----------
PARSE_JS = r"""// 解析 Telegram update（webhook 直收），归一为 {route, chatId, ...}
const u = $input.first().json.body ?? $input.first().json;
const out = { route: 'help', chatId: 0, messageId: 0, orderId: 0, username: '', password: '', name: '', phone: '', location: null };
const cb = u.callback_query;
if (cb && cb.message) {
  out.chatId = cb.message.chat.id;
  out.messageId = cb.message.message_id;
  const m = String(cb.data || '').match(/^(grab|pick|done):(\d+)$/);
  if (m) { out.route = m[1]; out.orderId = m[2]; }
} else if (u.message) {
  const msg = u.message;
  out.chatId = msg.chat && msg.chat.id;
  out.messageId = msg.message_id;
  if (msg.location && msg.location.latitude) {
    out.route = 'location';
    out.location = { lat: msg.location.latitude, lng: msg.location.longitude, ts: Date.now() };
  } else if (typeof msg.text === 'string') {
    const t = msg.text.trim();
    if (t.startsWith('/bind')) {
      out.route = 'bind';
      const p = t.split(/\s+/).slice(1);
      out.username = p[0] || ''; out.password = p[1] || '';
    } else if (t.startsWith('/reg')) {
      // 注册骑手账号：/reg 姓名 密码 [手机号]，成功后自动绑定本聊天
      out.route = 'reg';
      const p = t.split(/\s+/).slice(1);
      out.name = p[0] || ''; out.password = p[1] || ''; out.phone = p[2] || '';
    } else if (t.startsWith('/orders')) out.route = 'orders';
    else out.route = 'help';
  }
}
return [{ json: out }];"""

HELPERS = r"""function asBody(x) {
  // httpRequest responseFormat=text 会把响应包成 {data: "..."}；先解包再解析
  if (x && typeof x === 'object' && typeof x.data === 'string') x = x.data;
  if (typeof x !== 'string') return x;
  try { return JSON.parse(x); } catch (e) { return x; }
}
function rowsOf(r) {
  if (Array.isArray(r)) return r;
  if (r && Array.isArray(r.list)) return r.list;
  if (r && r.info && Array.isArray(r.info.list)) return r.info.list;
  return [];
}
"""

IDENT_JS = HELPERS + r"""// 从静态绑定表取骑手身份（chatId → did）；未绑定时直接给出引导文案
const src = $('解析指令').first().json;
const sd = $getWorkflowStaticData('global');
const b = (sd.bindings || {})[String(src.chatId)];
if (!b) return [{ json: { chatId: src.chatId, orderId: src.orderId, did: '', courierParam: '', text: '⚠️ 尚未绑定骑手账号。请先发送：/bind 骑手账号 密码（与骑手端相同的账号密码）' } }];
return [{ json: { chatId: src.chatId, orderId: src.orderId, did: b.did, courierParam: '' } }];"""

IDENT_LOC_JS = HELPERS + r"""// 取骑手身份 + 2 小时内的 TG 定位（供 peisong 距离校验，PHP 侧仍按店铺/用户坐标双重校验）
const src = $('解析指令').first().json;
const sd = $getWorkflowStaticData('global');
const b = (sd.bindings || {})[String(src.chatId)];
if (!b) return [{ json: { chatId: src.chatId, orderId: src.orderId, did: '', courierParam: '', text: '⚠️ 尚未绑定骑手账号。请先发送：/bind 骑手账号 密码（与骑手端相同的账号密码）' } }];
const loc = (sd.locations || {})[String(src.chatId)];
const fresh = loc && (Date.now() - loc.ts < 2 * 3600000);
const cp = fresh ? JSON.stringify({ lng: loc.lng, lat: loc.lat }) : '';
return [{ json: { chatId: src.chatId, orderId: src.orderId, did: b.did, courierParam: cp } }];"""

SAVE_BIND_JS = HELPERS + r"""const r = asBody($input.first().json);
const src = $('解析指令').first().json;
const sd = $getWorkflowStaticData('global');
let text;
if (r && r.state === 100 && r.did) {
  sd.bindings = sd.bindings || {};
  sd.bindings[String(src.chatId)] = { did: String(r.did), boundAt: Date.now() };
  text = '✅ 绑定成功，骑手ID ' + r.did + '。\n\n此聊天将开始接收所在城市的待抢订单推送；点「🛵 抢单」按钮即可接单（走平台原抢单逻辑，先到先得）。建议发送一次定位，取货/送达的距离校验通过率更高。\n\n指令：/orders 查看可抢订单 · /help 帮助';
} else {
  const info = (r && r.info) || (typeof r === 'string' ? r : '未知错误');
  text = '❌ 绑定失败：' + info + '\n\n用法：/bind 骑手账号 密码（与骑手端相同的账号密码）';
}
return [{ json: { chatId: src.chatId, text } }];"""

REG_RESULT_JS = HELPERS + r"""// TG 注册结果：成功则自动把本聊天绑定到新骑手账号
const r = asBody($input.first().json);
const src = $('解析指令').first().json;
const sd = $getWorkflowStaticData('global');
let text;
if (r && r.state === 100 && r.did) {
  sd.bindings = sd.bindings || {};
  sd.bindings[String(src.chatId)] = { did: String(r.did), boundAt: Date.now() };
  text = '✅ 注册成功！骑手ID ' + r.did + (r.info && r.info.indexOf('已注册') >= 0 ? '（该 Telegram 此前已注册，已直接返回）' : '') + '，本聊天已自动绑定。\n\n建议发送一次定位，取货/送达的距离校验通过率更高。\n\n指令：/orders 查看可抢订单 · /help 帮助';
} else {
  const info = (r && r.info) || (typeof r === 'string' ? r : '未知错误');
  text = '❌ 注册失败：' + info + '\n\n用法：/reg 姓名 密码 [手机号]（密码至少 6 位）';
}
return [{ json: { chatId: src.chatId, text } }];"""

POOL_CARD_JS = HELPERS + r"""const r = asBody($input.first().json);
const src = $('解析指令').first().json;
const rows = rowsOf(r);
if (!rows.length) {
  return [{ json: { chatId: src.chatId, text: '📭 当前城市暂无可抢订单（商家已接单、待骑手抢单）。' } }];
}
const lines = [];
const buttons = [];
for (const o of rows.slice(0, 8)) {
  lines.push('#' + o.id + ' · ' + (o.shopname || '') + '\n📍 ' + (o.address || '') + '\n💰 ₱' + (o.price || o.amount || '') + ' · ' + (o.person || '') + ' ' + (o.tel || ''));
  buttons.push([{ text: '🛵 抢单 #' + o.id, additionalFields: { callback_data: 'grab:' + o.id } }]);
}
return [{ json: { chatId: src.chatId, text: '🛵 可抢订单（' + rows.length + '）\n\n' + lines.join('\n\n'), keyboard: { inline_keyboard: buttons } } }];"""

LOCATION_JS = HELPERS + r"""const src = $('解析指令').first().json;
const sd = $getWorkflowStaticData('global');
sd.locations = sd.locations || {};
if (src.location) {
  sd.locations[String(src.chatId)] = src.location;
  return [{ json: { chatId: src.chatId, text: '📍 坐标已记录：' + src.location.lat.toFixed(5) + ', ' + src.location.lng.toFixed(5) + '（2 小时内取货/送达距离校验使用此坐标）。' } }];
}
return [{ json: { chatId: src.chatId, text: '⚠️ 未识别到定位，请用 Telegram 的「发送位置」而不是文字。' } }];"""

GRAB_RESULT_JS = HELPERS + r"""const r = asBody($input.first().json);
const src = $('解析指令').first().json;
const sd = $getWorkflowStaticData('global');
const cfg = sd.config || {};
const ok = typeof r === 'string' ? r.indexOf('成功') >= 0 : !!(r && r.state === 100);
const items = [];
if (ok) {
  items.push({ json: { chatId: src.chatId, text: '✅ 订单 #' + src.orderId + ' 抢单成功！到店后发送定位，然后点取货。',
    keyboard: { inline_keyboard: [[
      { text: '📦 已到店取货', additionalFields: { callback_data: 'pick:' + src.orderId } },
      { text: '✅ 已送达', additionalFields: { callback_data: 'done:' + src.orderId } }]] } } });
  const dc = Number(cfg.dispatchChatId);
  if (dc) items.push({ json: { chatId: dc, text: '🛵 订单 #' + src.orderId + ' 已被骑手抢走（TG 抢单通道）。' } });
} else {
  const info = typeof r === 'string' ? r : ((r && r.info) || '失败');
  items.push({ json: { chatId: src.chatId, text: '❌ 抢单失败：' + info + '\n（可能已被其他骑手抢走）' } });
}
return items;"""

PICK_RESULT_JS = HELPERS + r"""const r = asBody($input.first().json);
const src = $('解析指令').first().json;
const ok = typeof r === 'string' ? r.indexOf('已取货') >= 0 : !!(r && r.state === 100);
if (ok) {
  return [{ json: { chatId: src.chatId, text: '📦 订单 #' + src.orderId + ' 已确认取货，配送中。送达后点「✅ 已送达」。' } }];
}
const info = typeof r === 'string' ? r : ((r && r.info) || '失败');
return [{ json: { chatId: src.chatId, text: '❌ 取货失败：' + info + '\n（需到达店铺附近后再操作，或先发送定位）' } }];"""

DONE_RESULT_JS = HELPERS + r"""const r = asBody($input.first().json);
const src = $('解析指令').first().json;
const sd = $getWorkflowStaticData('global');
const cfg = sd.config || {};
const ok = typeof r === 'string' ? (r.indexOf('成功') >= 0 || r.indexOf('完成') >= 0) : !!(r && r.state === 100);
const items = [];
if (ok) {
  items.push({ json: { chatId: src.chatId, text: '🎉 订单 #' + src.orderId + ' 配送完成！收入已按分佣比例入账。' } });
  const dc = Number(cfg.dispatchChatId);
  if (dc) items.push({ json: { chatId: dc, text: '✅ 订单 #' + src.orderId + ' 已送达（TG 骑手通道）。' } });
} else {
  const info = typeof r === 'string' ? r : ((r && r.info) || '失败');
  items.push({ json: { chatId: src.chatId, text: '❌ 送达确认失败：' + info + '\n（需到达用户位置附近后再操作）' } });
}
return items;"""

HELP_JS = r"""const src = $('解析指令').first().json;
return [{ json: { chatId: src.chatId, text: '🛵 Firebird 骑手通道\n\n/bind 账号 密码 — 绑定已有骑手账号\n/reg 姓名 密码 [手机号] — 注册新骑手并自动绑定\n/orders — 查看当前可抢订单\n发送定位 — 记录坐标（取货/送达校验用）\n\n订单卡片按钮：🛵 抢单 → 📦 已到店取货 → ✅ 已送达。全部走平台原有抢单/配送逻辑与分佣。' } }];"""

SPREAD_BINDINGS_JS = HELPERS + r"""// 定时轮询：取第一个已绑定骑手作为城市轮询源（抢单池按骑手所在城市过滤）
const sd = $getWorkflowStaticData('global');
const cfg = sd.config || {};
const bindings = sd.bindings || {};
const entries = Object.entries(bindings);
if (!entries.length) return [];
const [chatId, b] = entries[0];
return [{ json: { did: b.did, dispatchChatId: Number(cfg.dispatchChatId) || Number(chatId) } }];"""

DIFF_JS = HELPERS + r"""// 与静态 pushed 集合做差集，只推新出现的待抢订单；3 天前的记录自动清理
const sd = $getWorkflowStaticData('global');
const cfg = sd.config || {};
sd.pushed = sd.pushed || {};
const now = Date.now();
for (const [k, v] of Object.entries(sd.pushed)) { if (now - v > 3 * 86400000) delete sd.pushed[k]; }
const r = asBody($input.first().json);
const rows = rowsOf(r);
const fresh = rows.filter((o) => o && o.id != null && !sd.pushed['o' + o.id]);
const items = fresh.map((o) => ({ json: {
  chatId: Number(cfg.dispatchChatId),
  text: '🆕 待抢订单 #' + o.id + '\n🏪 ' + (o.shopname || '') + '\n📍 ' + (o.address || '') + '\n💰 ₱' + (o.price || o.amount || '') + '\n👤 ' + (o.person || '') + ' ' + (o.tel || ''),
  keyboard: { inline_keyboard: [[{ text: '🛵 抢单 #' + o.id, additionalFields: { callback_data: 'grab:' + o.id } }]] },
} }));
for (const o of fresh) sd.pushed['o' + o.id] = now;
return items;"""

# ---------- 组装 ----------
nodes = []
nodes.append({"parameters": {"httpMethod": "POST", "path": "fb-courier-bridge",
                             "responseMode": "onReceived", "options": {}},
              "type": "n8n-nodes-base.webhook", "typeVersion": 2, "webhookId": "fb-courier-bridge",
              "name": "骑手指令入口", "position": [-220, 300]})
nodes.append(code("解析指令", PARSE_JS, 0, 300))

# Switch 路由
rules = []
for key in ["bind", "reg", "orders", "location", "grab", "pick", "done"]:
    rules.append({"conditions": {
        "options": {"caseSensitive": True, "leftValue": "", "typeValidation": "loose"},
        "conditions": [{"id": "r-" + key, "leftValue": "={{ $json.route }}", "rightValue": key,
                        "operator": {"type": "string", "operation": "equals"}}],
        "combinator": "and"}, "outputKey": key})
nodes.append({"parameters": {"rules": {"values": rules}, "options": {"fallbackOutput": "extra"}},
              "type": "n8n-nodes-base.switch", "typeVersion": 3.2,
              "name": "路由分发", "position": [220, 300]})

# bind 链
nodes.append(http_post_login("骑手登录", 440, 60))
nodes.append(code("保存绑定与回复", SAVE_BIND_JS, 660, 60))

# reg 链（TG 注册：服务间 token 在 staticData.config.eventToken，部署时注入）
nodes.append({"parameters": {
        "url": BACKEND, "method": "POST",
        "sendQuery": True,
        "queryParameters": {"parameters": [
            {"name": "service", "value": "waimai"},
            {"name": "action", "value": "courierRegTg"}]},
        "sendBody": True, "contentType": "form-urlencoded",
        "bodyParameters": {"parameters": [
            {"name": "token", "value": "={{ $getWorkflowStaticData('global').config.eventToken || '' }}"},
            {"name": "chatid", "value": "={{ $json.chatId }}"},
            {"name": "name", "value": "={{ $json.name }}"},
            {"name": "password", "value": "={{ $json.password }}"},
            {"name": "phone", "value": "={{ $json.phone || '' }}"}]},
        "options": {"response": {"response": {"responseFormat": "text", "neverError": True}}}},
    "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.2, "name": "TG注册", "position": [440, -100]}
)
nodes.append(code("保存TG注册与回复", REG_RESULT_JS, 660, -100))

# orders 链
nodes.append(code("查骑手身份", IDENT_JS, 440, 200))
nodes.append(if_node("已绑定(orders)", "={{ $json.did }}", "notEmpty", "", 660, 200))
nodes.append(http_get("拉抢单池", [("service", "waimai"), ("action", "courierOrderList"),
                                  ("state", "3"), ("pageSize", "20")],
                      cookie_expr="=HN_courier={{ $json.did }}", x=880, y=200))
nodes.append(code("生成抢单卡片", POOL_CARD_JS, 1100, 200))

# location 链
nodes.append(code("记录坐标", LOCATION_JS, 440, 340))

# grab 链
nodes.append(code("取身份(grab)", IDENT_JS, 440, 480))
nodes.append(if_node("已绑定(grab)", "={{ $json.did }}", "notEmpty", "", 660, 480))
nodes.append(http_get("调抢单接口", [("service", "waimai"), ("action", "qiangdan"),
                                    ("id", "={{ $json.orderId }}"), ("ordertype", "waimai")],
                      cookie_expr="=HN_courier={{ $json.did }}", x=880, y=480))
nodes.append(code("抢单结果与派单回执", GRAB_RESULT_JS, 1100, 480))

# pick 链
nodes.append(code("取身份与坐标(pick)", IDENT_LOC_JS, 440, 640))
nodes.append(if_node("已绑定(pick)", "={{ $json.did }}", "notEmpty", "", 660, 640))
nodes.append(http_get("调取货接口", [("service", "waimai"), ("action", "peisong"),
                                    ("id", "={{ $json.orderId }}"), ("state", "5"),
                                    ("ordertype", "waimai"), ("courier", "={{ $json.courierParam }}")],
                      cookie_expr="=HN_courier={{ $json.did }}", x=880, y=640))
nodes.append(code("取货结果", PICK_RESULT_JS, 1100, 640))

# done 链
nodes.append(code("取身份与坐标(done)", IDENT_LOC_JS, 440, 800))
nodes.append(if_node("已绑定(done)", "={{ $json.did }}", "notEmpty", "", 660, 800))
nodes.append(http_get("调送达接口", [("service", "waimai"), ("action", "peisong"),
                                    ("id", "={{ $json.orderId }}"), ("state", "1"),
                                    ("ordertype", "waimai"), ("courier", "={{ $json.courierParam }}")],
                      cookie_expr="=HN_courier={{ $json.did }}", x=880, y=800))
nodes.append(code("送达结果", DONE_RESULT_JS, 1100, 800))

# help 链（switch fallback）
nodes.append(code("指令帮助", HELP_JS, 440, 960))

# 回复段
nodes.append(if_node("带按钮卡片?", "={{ $json.keyboard && $json.keyboard.inline_keyboard ? $json.keyboard.inline_keyboard.length : 0 }}",
                     "gte", 1, 1560, 380, optype="number"))
nodes.append(tg("回复骑手(纯文本)", 1800, 320))
nodes.append(tg("回复骑手(带按钮)", 1800, 460, keyboard=True))

# 调度推送链
nodes.append({"parameters": {"rule": {"interval": [{"field": "minutes", "minutesInterval": 1}]}},
              "type": "n8n-nodes-base.scheduleTrigger", "typeVersion": 1.2,
              "name": "每分钟轮询", "position": [660, 1120]})
nodes.append(code("展开绑定骑手", SPREAD_BINDINGS_JS, 880, 1120))
nodes.append(http_get("拉抢单池(定时)", [("service", "waimai"), ("action", "courierOrderList"),
                                        ("state", "3"), ("pageSize", "20")],
                      cookie_expr="=HN_courier={{ $json.did }}", x=1100, y=1120))
nodes.append(code("新单差集与派单", DIFF_JS, 1320, 1120))

connections = {
    "骑手指令入口": {"main": [[{"node": "解析指令", "type": "main", "index": 0}]]},
    "解析指令": {"main": [[{"node": "路由分发", "type": "main", "index": 0}]]},
    "路由分发": {"main": [
        [{"node": "骑手登录", "type": "main", "index": 0}],
        [{"node": "TG注册", "type": "main", "index": 0}],
        [{"node": "查骑手身份", "type": "main", "index": 0}],
        [{"node": "记录坐标", "type": "main", "index": 0}],
        [{"node": "取身份(grab)", "type": "main", "index": 0}],
        [{"node": "取身份与坐标(pick)", "type": "main", "index": 0}],
        [{"node": "取身份与坐标(done)", "type": "main", "index": 0}],
        [{"node": "指令帮助", "type": "main", "index": 0}],
    ]},
    "骑手登录": {"main": [[{"node": "保存绑定与回复", "type": "main", "index": 0}]]},
    "TG注册": {"main": [[{"node": "保存TG注册与回复", "type": "main", "index": 0}]]},
    "保存TG注册与回复": {"main": [[{"node": "带按钮卡片?", "type": "main", "index": 0}]]},
    "保存绑定与回复": {"main": [[{"node": "带按钮卡片?", "type": "main", "index": 0}]]},
    "查骑手身份": {"main": [[{"node": "已绑定(orders)", "type": "main", "index": 0}]]},
    "已绑定(orders)": {"main": [
        [{"node": "拉抢单池", "type": "main", "index": 0}],
        [{"node": "带按钮卡片?", "type": "main", "index": 0}]]},
    "拉抢单池": {"main": [[{"node": "生成抢单卡片", "type": "main", "index": 0}]]},
    "生成抢单卡片": {"main": [[{"node": "带按钮卡片?", "type": "main", "index": 0}]]},
    "记录坐标": {"main": [[{"node": "带按钮卡片?", "type": "main", "index": 0}]]},
    "取身份(grab)": {"main": [[{"node": "已绑定(grab)", "type": "main", "index": 0}]]},
    "已绑定(grab)": {"main": [
        [{"node": "调抢单接口", "type": "main", "index": 0}],
        [{"node": "带按钮卡片?", "type": "main", "index": 0}]]},
    "调抢单接口": {"main": [[{"node": "抢单结果与派单回执", "type": "main", "index": 0}]]},
    "抢单结果与派单回执": {"main": [[{"node": "带按钮卡片?", "type": "main", "index": 0}]]},
    "取身份与坐标(pick)": {"main": [[{"node": "已绑定(pick)", "type": "main", "index": 0}]]},
    "已绑定(pick)": {"main": [
        [{"node": "调取货接口", "type": "main", "index": 0}],
        [{"node": "带按钮卡片?", "type": "main", "index": 0}]]},
    "调取货接口": {"main": [[{"node": "取货结果", "type": "main", "index": 0}]]},
    "取货结果": {"main": [[{"node": "带按钮卡片?", "type": "main", "index": 0}]]},
    "取身份与坐标(done)": {"main": [[{"node": "已绑定(done)", "type": "main", "index": 0}]]},
    "已绑定(done)": {"main": [
        [{"node": "调送达接口", "type": "main", "index": 0}],
        [{"node": "带按钮卡片?", "type": "main", "index": 0}]]},
    "调送达接口": {"main": [[{"node": "送达结果", "type": "main", "index": 0}]]},
    "送达结果": {"main": [[{"node": "带按钮卡片?", "type": "main", "index": 0}]]},
    "指令帮助": {"main": [[{"node": "带按钮卡片?", "type": "main", "index": 0}]]},
    "带按钮卡片?": {"main": [
        [{"node": "回复骑手(带按钮)", "type": "main", "index": 0}],
        [{"node": "回复骑手(纯文本)", "type": "main", "index": 0}]]},
    "每分钟轮询": {"main": [[{"node": "展开绑定骑手", "type": "main", "index": 0}]]},
    "展开绑定骑手": {"main": [[{"node": "拉抢单池(定时)", "type": "main", "index": 0}]]},
    "拉抢单池(定时)": {"main": [[{"node": "新单差集与派单", "type": "main", "index": 0}]]},
    "新单差集与派单": {"main": [[{"node": "带按钮卡片?", "type": "main", "index": 0}]]},
}

workflow = {
    "name": "配送调度与骑手 TG 桥（抢单/取货/送达）",
    "nodes": nodes,
    "connections": connections,
    "settings": {"executionOrder": "v1"},
    "staticData": {"global": {
        "config": {"backend": BACKEND, "dispatchChatId": ADMIN_CHAT, "eventToken": ""},  # eventToken 部署时注入
        "bindings": {}, "locations": {}, "pushed": {}}},
    "active": False,
}

path = "automation/n8n/workflows/tg_dispatch_courier_flow.json"
with open(path, "w", encoding="utf-8") as f:
    json.dump(workflow, f, ensure_ascii=False, separators=(",", ":"))  # 单行紧凑格式，与仓库其他工作流一致

# 校验：JSON 合法、连接引用完整、表达式括号配对、代码节点过 node --check
d = json.load(open(path, encoding="utf-8"))
names = {n["name"] for n in d["nodes"]}
assert len(names) == len(d["nodes"]), "节点名重复"
for src, outs in d["connections"].items():
    assert src in names, f"连接源不存在: {src}"
    for group in outs["main"]:
        for c in group:
            assert c["node"] in names, f"连接目标不存在: {c['node']}"
import subprocess, tempfile, os
for n in d["nodes"]:
    if n["type"] == "n8n-nodes-base.code":
        js = n["parameters"]["jsCode"]
        assert js.count("{") == js.count("}"), f"{n['name']} 花括号不配对"
        with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as t:
            t.write(js); tf = t.name
        r = subprocess.run(["node", "--check", tf], capture_output=True, text=True)
        os.unlink(tf)
        assert r.returncode == 0, f"{n['name']} 语法错误:\n{r.stderr}"
print(f"OK: {len(d['nodes'])} nodes, all code nodes linted, written to {path}")
