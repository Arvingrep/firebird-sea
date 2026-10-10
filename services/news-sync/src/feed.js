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

/** @param {string} xml RSS 2.0 文本 @returns {{title:string,url:string,summary:string}[]} */
function rssToItems(xml) {
  const items = [];
  for (const m of String(xml || '').matchAll(/<item>([\s\S]*?)<\/item>/gi)) {
    items.push({ title: pick(m[1], 'title'), url: pick(m[1], 'link'), summary: pick(m[1], 'description') });
  }
  return items;
}

if (require.main === module) {
  const fs = require('node:fs');
  process.stdout.write(`${JSON.stringify(rssToItems(fs.readFileSync(0, 'utf8')))}\n`);
}

module.exports = { rssToItems };
