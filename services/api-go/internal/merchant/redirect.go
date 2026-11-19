package merchant

// 本文件是 302 响应形态的移植，与 internal/rider 的 redirectToWorkbench 同构：
//
//	redirectToMerchant ← express res.redirect(302, url) 的真实形态
//
// 这里**不用** http.Redirect：它对 POST 不写响应体、也不写 Content-Type，与 Express
// 的 res.redirect(302, url) 在字节层面不一致，而这条 302 是用户实际看到的最终响应。
//
// 与 rider 的关键差异：本 302 与 Set-Cookie 同响应下发，调用方（bindAndRedirect）必须
// 在调用本函数**之前**把 cookie 写进 w.Header()["Set-Cookie"] —— WriteHeader 一旦触发
// 就不能再补 header。
//
// Express 4 的真实形态（rider 线已用真进程抓包核对过，两处 res.redirect 同一实现）：
//
//	HTTP/1.1 302 Found
//	Cache-Control: no-store          ← 调用方在 redirect 前显式设置
//	Location: /wmsj/
//	Vary: Accept
//	Content-Type: text/html; charset=utf-8
//	Content-Length: 39
//
//	<p>Found. Redirecting to /wmsj/</p>
//
// 与 Node 的已知差异（都不影响浏览器/WebView 的实际跳转）：
//   - X-Powered-By: Express 是 express app 级头，Go 全站都不发（既有全局差异）；
//   - Location 不做 express 的 encodeurl 处理：SafeRedirect 只放行站内绝对路径，
//     纯 ASCII，encodeurl 对它是恒等变换。

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/htmlpage"
)

// redirectStatusMessage 是 express 里 statuses.message[302]（"Found"），
// 会出现在 302 的响应体里；不要改成 http.StatusText(302) 之外的任何东西。
const redirectStatusMessage = "Found. Redirecting to "

func redirectToMerchant(w http.ResponseWriter, req *http.Request, target string) {
	w.Header().Set("Location", target)

	// res.format 无条件加 Vary: Accept（哪怕最终落 default 分支）。
	// 用 Add 而不是 Set：httpapi 的 CORS 中间件可能已经写过 Vary: Origin。
	w.Header().Add("Vary", "Accept")

	body := ""
	switch negotiateRedirect(req.Header.Get("Accept")) {
	case redirectHTML:
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		// Node: '<p>' + 'Found. Redirecting to ' + escapeHtml(address) + '</p>'
		escaped := htmlpage.EscapeHTML(target)
		body = "<p>" + redirectStatusMessage + escaped + "</p>"
	case redirectText:
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		// Node: 'Found. Redirecting to ' + address（text 分支不转义）
		body = redirectStatusMessage + target
	}
	// Content-Length 必须显式写：先 WriteHeader 再写 body 时 Go 无法回头补算，
	// 会退化成 chunked，与 Node 的定长响应不一致。
	w.Header().Set("Content-Length", strconv.Itoa(len(body)))
	w.WriteHeader(http.StatusFound)
	_, _ = w.Write([]byte(body))
}

// redirectKind 是 Express res.format 的两个候选项（keys = ['text','html']）。
type redirectKind int

const (
	// redirectNone 对应 default 分支：没有可接受的类型 → 不设 Content-Type、body 为空。
	redirectNone redirectKind = iota
	redirectText
	redirectHTML
)

// redirectCandidates 是 res.format 的候选顺序（text 在前），顺序决定并列时的胜者。
var redirectCandidates = []struct {
	kind redirectKind
	typ  string
	sub  string
}{
	{redirectText, "text", "plain"},
	{redirectHTML, "text", "html"},
}

// negotiateRedirect 复刻 `req.accepts(['text','html'])` 的结果。
//
// 实现口径（足够覆盖浏览器 / curl / WebView 的实际取值）：
//   - 无 Accept 头时按 `*/*` 处理（与 negotiator 一致）；
//   - 媒体范围的 q 值决定优先级，q 相同则比匹配精度（精确 > type/* > */*），
//     再相同则按候选顺序取前者；
//   - 全部候选的 q 为 0（或没有任何匹配）时返回 redirectNone。
func negotiateRedirect(accept string) redirectKind {
	ranges := parseAccept(accept)
	bestKind := redirectNone
	bestQuality := 0.0
	bestSpecificity := -1
	for _, candidate := range redirectCandidates {
		quality, specificity, matched := matchQuality(ranges, candidate.typ, candidate.sub)
		if !matched || quality <= 0 {
			continue
		}
		// 严格大于才替换：并列时保留先出现的候选（text 优先），与 negotiator 一致。
		if quality > bestQuality || (quality == bestQuality && specificity > bestSpecificity) {
			bestKind = candidate.kind
			bestQuality = quality
			bestSpecificity = specificity
		}
	}
	return bestKind
}

// acceptRange 是一个解析后的媒体范围（type/subtype 已小写）。
type acceptRange struct {
	typ string
	sub string
	q   float64
}

// parseAccept 把 Accept 头拆成媒体范围列表。空串按 `*/*` 处理。
func parseAccept(accept string) []acceptRange {
	trimmed := strings.TrimSpace(accept)
	if trimmed == "" {
		return []acceptRange{{typ: "*", sub: "*", q: 1}}
	}
	ranges := make([]acceptRange, 0, 4)
	for _, part := range strings.Split(trimmed, ",") {
		pieces := strings.Split(part, ";")
		mediaType := strings.ToLower(strings.TrimSpace(pieces[0]))
		if mediaType == "" {
			continue
		}
		typ, sub, found := strings.Cut(mediaType, "/")
		if !found {
			continue
		}
		quality := 1.0
		for _, parameter := range pieces[1:] {
			name, value, ok := strings.Cut(strings.TrimSpace(parameter), "=")
			if !ok || !strings.EqualFold(strings.TrimSpace(name), "q") {
				continue
			}
			if parsed, err := strconv.ParseFloat(strings.TrimSpace(value), 64); err == nil {
				quality = parsed
			}
		}
		ranges = append(ranges, acceptRange{typ: strings.TrimSpace(typ), sub: strings.TrimSpace(sub), q: quality})
	}
	if len(ranges) == 0 {
		return []acceptRange{{typ: "*", sub: "*", q: 1}}
	}
	return ranges
}

// matchQuality 返回候选类型在所有范围里的最优 (q, 匹配精度)。
// 精度：2 = 精确匹配，1 = type/*，0 = */*。
func matchQuality(ranges []acceptRange, typ, sub string) (float64, int, bool) {
	bestQuality := 0.0
	bestSpecificity := -1
	matched := false
	for _, item := range ranges {
		specificity := -1
		switch {
		case item.typ == typ && item.sub == sub:
			specificity = 2
		case item.typ == typ && item.sub == "*":
			specificity = 1
		case item.typ == "*":
			specificity = 0
		}
		if specificity < 0 {
			continue
		}
		if !matched || item.q > bestQuality || (item.q == bestQuality && specificity > bestSpecificity) {
			bestQuality = item.q
			bestSpecificity = specificity
			matched = true
		}
	}
	return bestQuality, bestSpecificity, matched
}
