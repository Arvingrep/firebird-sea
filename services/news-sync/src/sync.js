/**
 * AI 新闻同步:去重 -> 发布(失败重试) -> 失败告警运营者。
 * AI 输出视为不可信输入(AD-11):只保留纯文本标题/摘要与 https 链接,不接收任何价格字段。
 */
const crypto = require('node:crypto');

const MAX_TITLE = 200;
const MAX_SUMMARY = 2000;

function stripTags(s) {
  return String(s == null ? '' : s).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function sanitizeItem(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const title = stripTags(raw.title).slice(0, MAX_TITLE);
  let url;
  try {
    url = new URL(String(raw.url));
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || !title) return null;
  url.hash = '';
  return { title, url: url.toString(), summary: stripTags(raw.summary).slice(0, MAX_SUMMARY) };
}

function dedupeKey(item) {
  return crypto.createHash('sha256').update(item.url).digest('hex');
}

async function withRetry(fn, { attempts = 3, delayMs = 1000, sleep = ms => new Promise(r => setTimeout(r, ms)) } = {}) {
  let lastErr;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts) await sleep(delayMs * i);
    }
  }
  throw lastErr;
}

/**
 * @param {object[]} rawItems 采集到的原始新闻
 * @param {{seen: object, publish: Function, alert: Function, retry?: object}} deps
 *   seen: {has(key), add(key)};publish(item) / alert(text) 失败时抛错
 * @returns {Promise<{published:number, duplicates:number, invalid:number, failed:number}>}
 */
async function runSync(rawItems, deps) {
  const stats = { published: 0, duplicates: 0, invalid: 0, failed: 0 };
  const failures = [];
  const batchKeys = new Set();
  for (const raw of rawItems) {
    const item = sanitizeItem(raw);
    if (!item) {
      stats.invalid++;
      continue;
    }
    const key = dedupeKey(item);
    if (batchKeys.has(key) || (await deps.seen.has(key))) {
      stats.duplicates++;
      continue;
    }
    batchKeys.add(key);
    try {
      await withRetry(() => deps.publish(item), deps.retry);
      await deps.seen.add(key);
      stats.published++;
    } catch (err) {
      stats.failed++;
      failures.push(`${item.title} (${item.url}): ${err.message}`);
    }
  }
  if (failures.length) {
    await deps.alert(`[news-sync] ${failures.length} 条新闻发布失败:\n${failures.join('\n')}`);
  }
  return stats;
}

module.exports = { sanitizeItem, dedupeKey, withRetry, runSync };
