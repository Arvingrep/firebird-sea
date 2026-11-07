package rider

// 本文件是骑手绑定**落地页**（GET /tg-api/rider/bind）与错误页的移植：
//
//	renderLandingPage ← riderRoute.js:33-79
//	renderErrorPage   ← riderRoute.js:81-98
//	GetLanding        ← riderRoute.js:158-170（= getLanding）
//	sendErrorPage     ← riderRoute.js:151-156（= sendError）
//
// 页面外壳（meta / 浅色底 / 转义）来自 internal/htmlpage，对应 services/api/src/htmlPage.js；
// 与登录桥（internal/bridge）**各用各的**：bridge 的模板跟 Node bridgeRoute.js 一致、
// 没有这套外壳，不要合并。

import (
	"net/http"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/htmlpage"
)

const (
	// landingPostPath 对应 Node createRiderRoute 的默认参数 postPath（riderRoute.js:123）。
	// server.js 构造 rider 时**没有**覆盖它（server.js:456-465），所以生产就是落在这个默认值；
	// 这里做成常量而不是可配项：表单 action 必须与实际挂载点一致，
	// 留一个可覆盖的旋钮只会制造「配了但没挂」的静默不一致。
	landingPostPath = "/tg-api/rider/bind"

	// landingTitle / errorTitle 是 renderPageHead 的入参，与 Node 逐字一致。
	landingTitle = "骑手绑定"
	errorTitle   = "操作失败"

	// 错误页文案：503 那一组与 Node getLanding 第一行完全相同（riderRoute.js:159）。
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

// landingTemplate 逐字节照抄 Node 的 renderLandingPage 模板（riderRoute.js:34-78）：
// 开头是小写 <!doctype html>、结尾是 </html> 且**没有**换行，中间每一处缩进/空行都保留。
//
// 几处容易被「顺手改掉」的地方：
//   - `<style>` 后面紧跟 PageShell，而 PageShell 自带前导换行，所以 <style> 与第一条
//     样式规则之间的换行来自外壳、不来自模板；
//   - pattern 里的反斜杠 `[0-9+\-() ]` 是 JS 里 `\\-` 的运行时值，Go 侧只写**一个**反斜杠
//     （raw string 不转义），写两个就是两个；
//   - 内联脚本里的注释（ready/expand 与 setHeaderColor 为什么必须调）来自 Node 原文，
//     删掉不影响功能但会让字节比对失败。
const landingTemplate = `<!doctype html>
<html lang="zh-CN">
<head>
` + tokenPageHead + `
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<style>` + tokenPageShell + `
input { width: 100%; box-sizing: border-box; padding: 12px; font-size: 16px; margin: 12px 0; border: 1px solid #D0D7DE; border-radius: 8px; }
button { width: 100%; padding: 14px; font-size: 16px; border: 0; border-radius: 8px; background: #2E7D32; color: #fff; font-weight: 600; }
button:active { background: #276B2A; }
.hint { color: #57606A; font-size: 13px; }
.guide { color: #1F2328; }
</style>
</head>
<body>
<p id="msg">绑定后即可一键进入骑手工作台。</p>
<form id="f" method="POST" action="` + tokenPostPath + `">
<input type="hidden" name="initData" id="initData" value="">
<input name="phone" id="phone" inputmode="tel" pattern="[0-9+\-() ]{7,20}" required placeholder="骑手手机号，如 09171234567">
<p class="hint">支持 09171234567、+639171234567、63-917-123-4567 等写法，空格横线括号会自动忽略。</p>
<button type="submit">绑定并进入工作台</button>
</form>
<noscript><p class="guide">请在 Telegram 内打开本页面。</p></noscript>
<script nonce="` + tokenNonce + `">
(function () {
  var tg = window.Telegram && window.Telegram.WebApp;
  // 无条件 ready/expand：不调用时部分客户端按 0 高度渲染，同样表现为空白。
  if (tg) {
    try { if (tg.ready) tg.ready(); } catch (e) {}
    try { if (tg.expand) tg.expand(); } catch (e) {}
    // 头部/背景跟随页面浅色，避免深色主题下的黑边与黑底。
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

// errorTemplate 逐字节照抄 Node 的 renderErrorPage 模板（riderRoute.js:82-97）。
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
<h1>操作失败</h1>
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
// 落地页一旦反射未转义内容就是储在 /tg-api 域的反射 XSS。
func renderErrorPage(code, message string) string {
	return strings.NewReplacer(
		tokenPageHead, htmlpage.RenderPageHead(errorTitle),
		tokenPageShell, htmlpage.PageShell,
		tokenCode, htmlpage.EscapeHTML(code),
		tokenMessage, htmlpage.EscapeHTML(message),
	).Replace(errorTemplate)
}

// landingCSP 与 Node getLanding 里的头值逐字一致（riderRoute.js:164-165）。
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

// GetLanding 是 GET /tg-api/rider/bind 的处理器（Node: getLanding）。
//
// 只挂 GET —— Node 是 router.get（server.js:463），POST 由 PostBind 处理。
func (r *Route) GetLanding(w http.ResponseWriter, req *http.Request) {
	// 老规矩先判 notConfigured：四个条件（botToken / 验签模块 / 网关 / DB）任一缺失即 503，
	// 且这一判断在**任何**业务分支之前。GET 自己不用 DB 也不用网关，但仍然受它们门禁 ——
	// 这是 Node 的实际行为（riderRoute.js:123-132 在构造期算好，getLanding 第 159 行直接复用），
	// 不是笔误。同理**不**能把 GET 做成「先出页面、配置坏了再报」：配置半残时落地页
	// 收得了手机号却提交不了，比 503 更难排查。
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
// 不导出也不跨包复用：bridge 有自己的一份（同为路由包，各自独立更安全）。
func writeHTML(w http.ResponseWriter, status int, body string) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(status)
	_, _ = w.Write([]byte(body))
}
