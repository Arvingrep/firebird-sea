/**
 * 适配层:把 TASK-016(n8n 新闻工作流)的 RSS 源适配成 news-sync 输入 [{title,url,summary}]。
 * 零依赖轻量解析:仅取 <item> 的 title/link/description 并解码常见实体;
 * 异常条目交给 sync.sanitizeItem 兜底过滤,不在此处做安全判断。
 */
function decodeEntities(s) {
  return String(s || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&amp;/g, '&')
    .trim();
}

function pick(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? decodeEntities(m[1]) : '';
}

/** @param {string} xml RSS 2.0 文本 @returns {{title:string,url:string,summary:string}[]} 非 RSS/截断文档抛错,合法空频道返回 [] */
function rssToItems(xml) {
  const text = String(xml || '');
  if (!/<(rss|channel)[\s>]/i.test(text)) throw new Error('not an RSS document (collector output invalid)');
  // 完整性:根元素必须闭合,否则视为截断/损坏(区别于合法空频道),避免被误判为"空轮成功"
  if (!/<\/rss\s*>\s*$/i.test(text.trim()) && !/<\/channel\s*>\s*$/i.test(text.trim())) {
    throw new Error('truncated RSS document (missing closing tag)');
  }
  const items = [];
  for (const m of text.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)) {
    items.push({ title: pick(m[1], 'title'), url: pick(m[1], 'link'), summary: pick(m[1], 'description') });
  }
  return items;
}

if (require.main === module) {
  const fs = require('node:fs');
  try {
    process.stdout.write(`${JSON.stringify(rssToItems(fs.readFileSync(0, 'utf8')))}\n`);
  } catch (err) {
    process.stderr.write(`${err.message}\n`);
    process.exit(1); // 非零退出:管道(set -o pipefail)或调度方据此告警,采集故障不被当作"空轮成功"掩盖
  }
}

module.exports = { rssToItems };
