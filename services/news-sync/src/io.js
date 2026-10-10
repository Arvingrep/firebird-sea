/**
 * 边界实现:去重文件持久化、门户发布、Telegram 告警。fetch 可注入以便测试。
 */
const fs = require('node:fs');

const TG_LIMIT = 4000; // Telegram 单条上限 4096,留余量
const TIMEOUT_MS = 15000; // 单次请求(含响应体读取)截止时间,超时按失败计入有界重试

/** 已发布集合:文件不存在视为空;损坏/无权限直接抛错(避免误当空集合重复发布);tmp+rename 原子写 */
function fileStore(file) {
  let set;
  try {
    const arr = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!Array.isArray(arr)) throw new Error('not an array');
    set = new Set(arr);
  } catch (err) {
    if (err.code !== 'ENOENT') throw new Error(`seen file unreadable (${file}): ${err.message}`);
    set = new Set();
  }
  return {
    has: k => set.has(k),
    add: k => {
      set.add(k);
      const tmp = `${file}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify([...set]));
      fs.renameSync(tmp, file);
    }
  };
}

/** 门户契约:HTTP 2xx 且 JSON `{success:true}`;稳定去重键经 Idempotency-Key 头与 body.dedupeKey 传给门户 */
function makePublisher({ url, token, fetchImpl = fetch, timeoutMs = TIMEOUT_MS }) {
  return async (item, key) => {
    const res = await fetchImpl(url, {
      method: 'POST',
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token || ''}`,
        'Idempotency-Key': key
      },
      body: JSON.stringify({ ...item, dedupeKey: key })
    });
    if (!res.ok) throw new Error(`portal HTTP ${res.status}`);
    let body;
    try {
      body = await res.json();
    } catch (err) {
      // 只把 JSON 解析失败归类为"非 JSON 响应";超时/中止等原因原样抛出,便于上层按原因重试与告警
      if (err instanceof SyntaxError) throw new Error('portal returned non-JSON body');
      throw err;
    }
    if (!body || body.success !== true) {
      const e = body && body.error;
      throw new Error(`portal rejected: ${(e && (e.message || e.code)) || JSON.stringify(e) || 'success!=true'}`);
    }
  };
}

/** 按行切分,单条不超过 limit(超长行硬截断) */
function chunkText(text, limit = TG_LIMIT) {
  const chunks = [];
  let cur = '';
  for (const raw of text.split('\n')) {
    const line = raw.slice(0, limit);
    if (cur && cur.length + line.length + 1 > limit) {
      chunks.push(cur);
      cur = line;
    } else {
      cur = cur ? `${cur}\n${line}` : line;
    }
  }
  if (cur) chunks.push(cur);
  return chunks;
}

function makeAlerter({ botToken, chatId, fetchImpl = fetch, timeoutMs = TIMEOUT_MS, apiBase = 'https://api.telegram.org' }) {
  return async text => {
    for (const part of chunkText(text)) {
      const res = await fetchImpl(`${apiBase}/bot${botToken}/sendMessage`, {
        method: 'POST',
        signal: AbortSignal.timeout(timeoutMs),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: part })
      });
      if (!res.ok) throw new Error(`alert HTTP ${res.status}`);
    }
  };
}

module.exports = { fileStore, makePublisher, makeAlerter, chunkText };
