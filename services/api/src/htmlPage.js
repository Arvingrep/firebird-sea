'use strict';
// TG 内嵌页面（Mini App 落地页 / 错误页）的公共外壳。
//
// 为什么必须集中一处：2026-11-06 canary 上「打开是黑屏」的根因就是页面只给了文字、
// 没给背景。Telegram 的 webview 容器背景在深色主题下是黑的，页面 body 不铺底时
// 露出容器黑底，而默认文字色也是黑的 —— HTTP 200、HTML 内容齐全，用户看到纯黑一片。
// 修一次就要三处同时钉死（meta / :root / html+body），少任何一层都可能被客户端主题覆盖。
// 所以做成单一来源，任何新页面走同一套，不会再各写各的。

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** head 里的公共 meta：viewport / 强制浅色 / 头部主题色 */
function renderPageHead(title) {
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light only">
<meta name="theme-color" content="#FFFFFF">
<title>${escapeHtml(title)}</title>`;
}

/** 页面外壳样式：浅色底 + 可读前景色 + 移动端正文基线 */
const PAGE_SHELL = `
  :root { color-scheme: light only; }
  html, body { background: #FFFFFF; color: #1F2328; }
  html { min-height: 100%; -webkit-text-size-adjust: 100%; }
  body { margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", sans-serif; font-size: 16px; line-height: 1.6; }`;

module.exports = { escapeHtml, renderPageHead, PAGE_SHELL };
