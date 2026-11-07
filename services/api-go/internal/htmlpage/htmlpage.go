// Package htmlpage 是 TG 内嵌页面（Mini App 落地页 / 错误页）的公共外壳，
// 逐条移植 services/api/src/htmlPage.js（共 30 行）：
//
//	EscapeHTML     ← escapeHtml      （htmlPage.js:10-12）
//	RenderPageHead ← renderPageHead  （htmlPage.js:14-21）
//	PageShell      ← PAGE_SHELL      （htmlPage.js:24-28）
//	NewNonce       ← riderRoute.js 里的 crypto.randomBytes(16).toString('base64')（riderRoute.js:163）
//
// 为什么必须集中一处（Node 侧的注释同样适用于 Go 侧）：2026-11-06 canary 上「打开是黑屏」
// 的根因就是页面只给了文字、没给背景。Telegram 的 webview 容器背景在深色主题下是黑的，
// 页面 body 不铺底时露出容器黑底，而默认文字色也是黑的 —— HTTP 200、HTML 内容齐全，
// 用户看到纯黑一片。修一次要在三处同时钉死（meta / :root / html+body），少任何一层都可能
// 被客户端主题覆盖，所以做成单一来源。
//
// 本包**只服务于骑手落地页**（internal/rider）。登录桥（internal/bridge）仍用它自己那份
// 逐字节模板，不要拿本包去「统一」它：bridge 的页面壳与 Node bridgeRoute.js 一致、
// 本来就没有这套 htmlPage 外壳，替换会改变它的输出字节。
package htmlpage

import (
	"crypto/rand"
	"encoding/base64"
)

// EscapeHTML 复刻 Node 的 escapeHtml：五个实体逐字一致
// （& → &amp;、< → &lt;、> → &gt;、" → &quot;、' → &#39;）。
//
// 不用 html.EscapeString：它把 `"` 转成 `&#34;`，而 Node 用 `&quot;`。
// 浏览器解码一致，但落地页要求与 Node 逐字节相同（黄金样本比对），差一个字节就是红。
func EscapeHTML(s string) string {
	// 与 Node 的 String(s) 对齐：入参已全是 string，非字符串值由调用方先转换。
	var b []byte
	for index := 0; index < len(s); index++ {
		switch s[index] {
		case '&':
			b = append(b, "&amp;"...)
		case '<':
			b = append(b, "&lt;"...)
		case '>':
			b = append(b, "&gt;"...)
		case '"':
			b = append(b, "&quot;"...)
		case '\'':
			b = append(b, "&#39;"...)
		default:
			b = append(b, s[index])
		}
	}
	return string(b)
}

// RenderPageHead 复刻 renderPageHead(title)：viewport / 强制浅色 / 头部主题色 + 标题。
//
// 返回的字符串**不带**结尾换行（调用方的模板自己带），这样两处 head 的拼接方式与 Node
// 的模板字符串 `${renderPageHead(...)}` + 字面换行完全等价。
func RenderPageHead(title string) string {
	return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light only">
<meta name="theme-color" content="#FFFFFF">
<title>` + EscapeHTML(title) + `</title>`
}

// PageShell 复刻 PAGE_SHELL：浅色底 + 可读前景色 + 移动端正文基线。
//
// 逐字保留 Node 那份的**前导换行与两格缩进**——它被拼在 `<style>` 后面，
// 少一个空格都会让 body 与 Node 的字节不同。
const PageShell = `
  :root { color-scheme: light only; }
  html, body { background: #FFFFFF; color: #1F2328; }
  html { min-height: 100%; -webkit-text-size-adjust: 100%; }
  body { margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", sans-serif; font-size: 16px; line-height: 1.6; }`

// nonceBytes 与 Node 的 crypto.randomBytes(16) 一致：16 字节随机数。
const nonceBytes = 16

// NewNonce 生成 CSP nonce：16 字节随机数的**标准 base64（带 = 填充）**，
// 即 crypto.randomBytes(16).toString('base64')，固定 24 个字符。
//
// 为什么不能用 base64.RawURLEncoding：Node 用的是标准的 base64 字母表与填充，
// 换成 URL-safe 变体后 nonce 里会出现 `-` 与 `_`、且丢掉填充，长度也变成 22，
// 与 Node 输出不同；nonce 只在本响应的 CSP 头与 <script> 属性之间互相比对，
// 差异不会当场报错，但黄金样本比对立不住 —— 这就是要求逐字节的原因。
func NewNonce() (string, error) {
	buf := make([]byte, nonceBytes)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(buf), nil
}
