// T5.2：资讯正文安全渲染。不使用 v-html：把后端 HTML 解析后按白名单转成受限节点树，由组件用 h() 渲染。
// 对 DOM 的依赖通过最小接口注入（nodeType/tagName/childNodes/getAttribute/textContent），便于脱离浏览器测试。
const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'img', 'a', 'span', 'div', 'figure', 'figcaption',
]);
const DROP_WITH_CONTENT = new Set(['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'svg', 'math', 'link', 'meta', 'base', 'template', 'noscript']);
const MAX_DEPTH = 20;
const MAX_NODES = 5000;

// 仅允许 https（及协议相对）；相对路径/其他协议（javascript:、data:、http:）一律丢弃
export function safeUrl(raw) {
  if (typeof raw !== 'string') return null;
  // 先拒绝任何控制字符（含首尾换行/制表符，常用于绕过协议检查），再判断协议
  if (/[\u0000-\u001f\u007f]/.test(raw)) return null;
  const v = raw.trim();
  if (v.length === 0 || v.length > 2048) return null;
  if (v.startsWith('//')) return `https:${v}`;
  return /^https:\/\//i.test(v) ? v : null;
}

export function sanitizeNodes(rootChildren) {
  let count = 0;
  function walk(list, depth) {
    const out = [];
    for (const n of list) {
      if (count > MAX_NODES || depth > MAX_DEPTH) break;
      count += 1;
      if (n.nodeType === 3) {
        const text = n.textContent || '';
        if (text) out.push({ text });
        continue;
      }
      if (n.nodeType !== 1) continue;
      const tag = String(n.tagName || '').toLowerCase();
      if (DROP_WITH_CONTENT.has(tag)) continue;
      const children = walk(Array.from(n.childNodes || []), depth + 1);
      if (!ALLOWED_TAGS.has(tag)) { out.push(...children); continue; } // 未知标签：丢标签留内容
      const node = { tag, attrs: {}, children };
      if (tag === 'img') {
        const src = safeUrl(n.getAttribute('src') || n.getAttribute('data-src'));
        if (!src) continue;
        node.attrs = { src, alt: String(n.getAttribute('alt') || '').slice(0, 200) };
        node.children = [];
      } else if (tag === 'a') {
        const href = safeUrl(n.getAttribute('href'));
        if (href) node.attrs = { href };
      }
      out.push(node);
    }
    return out;
  }
  return walk(rootChildren, 0);
}

export function sanitizeHtml(html, parse) {
  if (typeof html !== 'string' || html.length === 0) return [];
  const doc = parse(html.slice(0, 500000));
  return sanitizeNodes(Array.from(doc.body.childNodes));
}
