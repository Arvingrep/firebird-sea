// internal/htmlpage 的用例：这个包的存在意义是「页面外壳只有一个来源」，
// 所以测试也压在这里 —— 任何一条被改坏，骑手落地页与错误页会同时坏。
//
// 与 Node 的对应关系（services/api/src/htmlPage.js）：
//   - EscapeHTML / RenderPageHead / PageShell 的**逐字节**正确性已经由
//     internal/rider 的黄金样本（testdata/landing.golden 与 error-escape.golden）覆盖；
//     这里补的是那张样本表达不了的边界（双重转义、多字节字符、表格外的字符）。
//   - NewNonce 对应 riderRoute.js:163 的 crypto.randomBytes(16).toString('base64')。
package htmlpage

import (
	"encoding/base64"
	"strings"
	"testing"
)

func TestEscapeHTMLMatchesNodeEntityTable(t *testing.T) {
	cases := []struct{ in, want string }{
		{"&", "&amp;"},
		{"<", "&lt;"},
		{">", "&gt;"},
		{`"`, "&quot;"},
		{"'", "&#39;"}, // 注意：不是 &#x27;，也不是 &#34;
		{"a<b>c&d\"e'f", "a&lt;b&gt;c&amp;d&quot;e&#39;f"},
		{"", ""},
		// 已转义的内容会被再转一次（Node 的 replace 也是这么做的）：
		// 调用方不能靠它做幂等，只能保证「原始值进来，安全值出去」。
		{"&amp;", "&amp;amp;"},
		// 多字节字符原样通过（Node 按 UTF-16 码元 replace，结果相同）。
		{"骑手绑定 09171234567", "骑手绑定 09171234567"},
		{"👍", "👍"},
	}
	for _, testCase := range cases {
		if got := EscapeHTML(testCase.in); got != testCase.want {
			t.Fatalf("EscapeHTML(%q) = %q，want %q", testCase.in, got, testCase.want)
		}
	}
}

func TestRenderPageHeadEscapesTitle(t *testing.T) {
	head := RenderPageHead(`<script>"x"</script>`)
	if strings.Contains(head, "<script>") {
		t.Fatalf("标题未转义：%s", head)
	}
	if !strings.Contains(head, "<title>&lt;script&gt;&quot;x&quot;&lt;/script&gt;</title>") {
		t.Fatalf("标题转义结果不符：%s", head)
	}
	// 三处「防黑屏」来源里的 meta 必须都在（:root / html+body 在 PageShell 里）。
	for _, want := range []string{
		`<meta charset="utf-8">`,
		`<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`,
		`<meta name="color-scheme" content="light only">`,
		`<meta name="theme-color" content="#FFFFFF">`,
	} {
		if !strings.Contains(head, want) {
			t.Fatalf("head 缺 %q：%s", want, head)
		}
	}
	// 不带结尾换行：换行由调用方模板提供，多一个就与 Node 的字节不同。
	if strings.HasSuffix(head, "\n") {
		t.Fatal("RenderPageHead 不该带结尾换行")
	}
}

// TestPageShellPinsLightBackground 是 2026-11-06「TG 深色模式下打开是黑屏」的回归护栏：
// 三处浅色钉死（color-scheme / 背景 / 前景）少任何一处，客户端主题就可能覆盖回来。
func TestPageShellPinsLightBackground(t *testing.T) {
	for _, want := range []string{
		":root { color-scheme: light only; }",
		"html, body { background: #FFFFFF; color: #1F2328; }",
		"-webkit-text-size-adjust: 100%",
		"padding: 24px",
	} {
		if !strings.Contains(PageShell, want) {
			t.Fatalf("PageShell 缺 %q", want)
		}
	}
	// 前导换行是拼接约定：<style> 与第一条规则之间的换行来自这里。
	if !strings.HasPrefix(PageShell, "\n") {
		t.Fatal("PageShell 应以换行开头（<style> 后直接拼它）")
	}
}

func TestNewNonceIsStandardBase64Of16Bytes(t *testing.T) {
	first, err := NewNonce()
	if err != nil {
		t.Fatalf("NewNonce 失败: %v", err)
	}
	if len(first) != 24 {
		t.Fatalf("nonce 长度应为 24（16 字节标准 base64 带 == 填充），实际 %d：%q", len(first), first)
	}
	decoded, err := base64.StdEncoding.Strict().DecodeString(first)
	if err != nil {
		t.Fatalf("nonce %q 不是合法的标准 base64: %v", first, err)
	}
	if len(decoded) != 16 {
		t.Fatalf("nonce 解码后应为 16 字节，实际 %d", len(decoded))
	}
	// 16 字节的 base64 必然带 == 填充；RawURLEncoding 之类会丢掉它。
	if !strings.HasSuffix(first, "==") {
		t.Fatalf("nonce 应带 == 填充（Node 的 toString('base64') 行为），实际 %q", first)
	}

	second, err := NewNonce()
	if err != nil {
		t.Fatalf("NewNonce 第二次失败: %v", err)
	}
	if first == second {
		t.Fatalf("两次生成的 nonce 相同（%q）：随机源没生效", first)
	}
}
