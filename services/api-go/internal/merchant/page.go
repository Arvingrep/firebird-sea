package merchant

// 本文件是商家绑定**落地页**（GET /tg-api/merchant/bind）与错误页的移植：
//
//	renderLandingPage ← merchantRoute.js（模板常量）
//	renderErrorPage   ← merchantRoute.js（模板常量）
//	GetLanding        ← merchantRoute.js（getLanding）
//	sendErrorPage     ← merchantRoute.js（sendError）
//
// 页面外壳（meta / 浅色底 / 转义）来自 internal/htmlpage，对应 services/api/src/htmlPage.js；
// 与骑手（internal/rider）**各用各的**：两包都是路由包，各自独立（仓库对 writeJSON/writeHTML
// 的既有约定），不要合并。
//
// 黄金样本：testdata/*.golden 全部由真实 Node 实现（merchantRoute.js）产出，生成步骤
// 见 page_test.go 头注释。改模板必须先重跑生成脚本。

import (
	"net/http"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/htmlpage"
)

const (
	// landingPostPath 对应 Node createMerchantRoute 的默认参数 postPath。
	// server.js 构造 merchant 时**没有**覆盖它，所以生产就是落在这个默认值；
	// 做成常量而不是可配项：表单 action 必须与实际挂载点一致，
	// 留一个可覆盖的旋钮只会制造「配了但没挂」的静默不一致。
	landingPostPath = "/tg-api/merchant/bind"

	// landingTitle / errorTitle 是 renderPageHead 的入参，与 Node 逐字一致。
	landingTitle = "商家登录"
	errorTitle   = "登录失败"

	// 错误页文案：503 那一组与 Node getLanding 完全相同。
	notConfiguredMessage = "服务暂未配置，请稍后重试"
	landingFailedMessage = "服务暂时不可用，请稍后重试"
)

// 占位符：用 strings.Replacer 一次性替换，**不做二次扫描**（Replacer 不会重扫替换结果），
// 所以 PageShell 里即使出现花括号也不会被误替换。
const (
	tokenPageHead  = "{{PAGE_HEAD}}"
	tokenPageShell = "{{PAGE_SHELL}}"
	tokenPostPath  = "{{POST_PATH}}"
	tokenNonce     = "{{NONCE}}"
	tokenCode      = "{{CODE}}"
	tokenMessage   = "{{MESSAGE}}"
)

// landingTemplate 逐字节照抄 Node 的 renderLandingPage 模板（merchantRoute.js）：
// 开头是小写 <!doctype html>、结尾是 </html> 且**没有**换行，中间每一处缩进/空行都保留。
//
// 与骑手落地页的可感知差异：按钮是商家蓝（#1F6FEB / active #1A5FCC）、
// 文案是「商家手机号」（入驻登记的会员手机号）、提交按钮进商家后台。
const landingTemplate = `<!doctype html>
<html lang="zh-CN">
<head>
` + tokenPageHead + `
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<style>` + tokenPageShell + `
input { width: 100%; box-sizing: border-box; padding: 12px; font-size: 16px; margin: 12px 0; border: 1px solid #D0D7DE; border-radius: 8px; }
button { width: 100%; padding: 14px; font-size: 16px; border: 0; border-radius: 8px; background: #1F6FEB; color: #fff; font-weight: 600; }
button:active { background: #1A5FCC; }
.hint { color: #57606A; font-size: 13px; }
.guide { color: #1F2328; }
</style>
</head>
<body>
<p id="msg">绑定后即可在 Telegram 内一键进入商家后台。</p>
<form id="f" method="POST" action="` + tokenPostPath + `">
<input type="hidden" name="initData" id="initData" value="">
<input name="phone" id="phone" inputmode="tel" pattern="[0-9+\-() ]{7,20}" required placeholder="商家手机号，如 09178889999">
<p class="hint">请填写入驻时登记的会员手机号。支持 09178889999、+639178889999、63-917-888-9999 等写法，空格横线括号会自动忽略。</p>
<button type="submit">绑定并进入商家后台</button>
</form>
<noscript><p class="guide">请在 Telegram 内打开本页面。</p></noscript>
<script nonce="` + tokenNonce + `">
(function () {
  var tg = window.Telegram && window.Telegram.WebApp;
  // 无条件 ready/expand：不调用时部分客户端按 0 高度渲染，同样表现为空白。
  if (tg) {
    try { if (tg.ready) tg.ready(); } catch (e) {}
    try { if (tg.expand) tg.expand(); } catch (e) {}
    try { if (tg.setHeaderColor) tg.setHeaderColor('#FFFFFF'); } catch (e) {}
    try { if (tg.setBackgroundColor) tg.setBackgroundColor('#FFFFFF'); } catch (e) {}
  }
  var data = tg && tg.initData;
  if (data) {
    document.getElementById('initData').value = data;
  } else {
    document.getElementById('msg').textContent = '请从 Telegram 内打开本页面';
    var f = document.getElementById('f');
    if (f && f.parentNode) f.parentNode.removeChild(f);
  }
})();
</script>
</body>
</html>`

// errorTemplate 逐字节照抄 Node 的 renderErrorPage 模板（merchantRoute.js）。
const errorTemplate = `<!doctype html>
<html lang="zh-CN">
<head>
` + tokenPageHead + `
<style>` + tokenPageShell + `
h1 { font-size: 18px; margin: 0 0 12px; }
p { margin: 0 0 8px; }
code { color: #57606A; font-size: 13px; }
</style>
</head>
<body>
<h1>登录失败</h1>
<p>` + tokenMessage + `</p>
<p><code>` + tokenCode + `</code></p>
</body>
</html>`

// renderLandingPage 对应 renderLandingPage({nonce, postPath})。
//
// postPath 走 HTML 转义（Node: escapeHtml(postPath)）；nonce 与 PageShell 不转义
// （Node 也是直接插值）——nonce 只由 NewNonce 产出，是 base64 字母表内的安全值。
func renderLandingPage(nonce, postPath string) string {
	return strings.NewReplacer(
		tokenPageHead, htmlpage.RenderPageHead(landingTitle),
		tokenPageShell, htmlpage.PageShell,
		tokenPostPath, htmlpage.EscapeHTML(postPath),
		tokenNonce, nonce,
	).Replace(landingTemplate)
}

// renderErrorPage 对应 renderErrorPage(code, message)：两个入参都转义。
//
// 转义不是装饰：code/message 未来可能带上网关返回的错误码或用户输入，
// 落地页一旦反射未转义内容就是 /tg-api 域的反射 XSS。
func renderErrorPage(code, message string) string {
	return strings.NewReplacer(
		tokenPageHead, htmlpage.RenderPageHead(errorTitle),
		tokenPageShell, htmlpage.PageShell,
		tokenCode, htmlpage.EscapeHTML(code),
		tokenMessage, htmlpage.EscapeHTML(message),
	).Replace(errorTemplate)
}

// landingCSP 与 Node getLanding 里的头值逐字一致。
//
// /tg-api 前缀**没有**全局 CSP 中间件（CSP 只挂在 /tma，见 httpapi.tmaHeaders），
// 所以落地页必须自带这一份，且必须在响应头里逐字给出：
//   - script-src 只放自身与 telegram.org（telegram-web-app.js 的来源）；
//   - 内联脚本靠一次性 nonce 放行（nonce 与 <script nonce="..."> 必须同值）；
//   - form-action 不从 default-src 继承，表单提交要求显式放行 self；
//   - frame-ancestors 放行 Telegram 域，否则 TG 内嵌直接白屏。
func landingCSP(nonce string) string {
	return "default-src 'none'; script-src 'self' https://telegram.org 'nonce-" + nonce +
		"'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors https://web.telegram.org https://*.telegram.org; base-uri 'none'"
}

// GetLanding 是 GET /tg-api/merchant/bind 的处理器（Node: getLanding）。
//
// 只挂 GET —— Node 是 router.get（server.js），POST 由 PostBind 处理。
func (r *Route) GetLanding(w http.ResponseWriter, req *http.Request) {
	// 先判 notConfigured，且这一判断在**任何**业务分支之前。
	// 只有两条门禁真实可达：botToken 与网关。GET 自己不用网关，但也受它门禁 ——
	// 这是 Node 的实际行为（构造期算好 missing，getLanding 第一行复用）。
	if r.notConfigured {
		r.sendErrorPage(w, http.StatusServiceUnavailable, CodeNotConfigured, notConfiguredMessage)
		return
	}

	nonce, err := r.nonce()
	if err != nil {
		// Node 这里没有 try/catch：randomBytes 抛错会冒泡到 express 的默认错误处理（500）。
		// Go 侧不做「无 nonce 的落地页」：那会把内联脚本整段废掉（CSP 只留 script-src self
		// 与 telegram.org），页面看似 200 实则完全不可用。宁可 500 + 错误页。
		r.warn("error", "生成 CSP nonce 失败", nil)
		r.sendErrorPage(w, http.StatusInternalServerError, CodeFailed, landingFailedMessage)
		return
	}

	w.Header().Set("Content-Security-Policy", landingCSP(nonce))
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("Referrer-Policy", "no-referrer")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	writeHTML(w, http.StatusOK, renderLandingPage(nonce, landingPostPath))
}

// sendErrorPage 对应 Node 的 sendError：三件安全头 + text/html + 错误页正文。
// 顺序与 Node 一致（先头后体），三个头在 503 与其它错误分支上表现相同。
func (r *Route) sendErrorPage(w http.ResponseWriter, status int, code, message string) {
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("Referrer-Policy", "no-referrer")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	writeHTML(w, status, renderErrorPage(code, message))
}

// writeHTML 与 Node 的 res.type('html').send(body) 对齐：Content-Type 固定
// text/html; charset=utf-8，正文原样写出（不加结尾换行）。
//
// 不导出也不跨包复用：rider / bridge 各自有一份同样的实现（同为路由包）。
func writeHTML(w http.ResponseWriter, status int, body string) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(status)
	_, _ = w.Write([]byte(body))
}
