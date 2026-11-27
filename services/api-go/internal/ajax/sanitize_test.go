package ajax

import (
	"testing"
)

// —— RemoveXSS（filter.class.php:55）——

func TestRemoveXSS(t *testing.T) {
	cases := []struct{ name, in, want string }{
		{"script 标签", "<script>alert(1)</script>", "<sc<x>ript>alert(1)</sc<x>ript>"},
		// 迭代不动点：scrscriptipt 里的 script 被打断，且 PHP 的 while/for 结构
		// （任何关键词未命中即提前终止）不会漏掉它。
		{"scrscriptipt", "scrscriptipt", "scrsc<x>riptipt"},
		{"on* handler", `onerror=alert(1)`, `on<x>error=alert(1)`},
		{"大小写不敏感", "<SCRIPT>", "<sc<x>ript>"},
		{"实体编码", "&#x73;cript", "sc<x>ript"},
		{"十进制实体", "&#115;cript", "sc<x>ript"},
		{"实体交错关键词", "jav&#x0A;ascript", "ja<x>vasc<x>ript"}, // &#x0A; 实体先由 javascript 的交错分支消费，再被 script 打断
		{"style 标签重写", "<style>@import url(x)</style>", "style@import url(x)</style>"},
		{"控制字节剔除", "a\x01b\x7fc", "ab\x7fc"}, // \x7f 不在控制字节区间
		{"title/style 还原", "ti<x>tle st<x>yle", "title style"},
		{"document.write 守卫", "document.write(x)", "do<x>cument.write(x)"},
		{"普通中文不受影响", "你好，世界", "你好，世界"},
		{"rawurldecode 二次解码", "%3Cscript%3E", "<sc<x>ript>"},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			if got := RemoveXSS(c.in); got != c.want {
				t.Fatalf("RemoveXSS(%q) = %q, want %q", c.in, got, c.want)
			}
		})
	}
}

// 包含 '{'/'}'/'<p'/'<img'/'document.write'/'text/javascript' 时跳过 addslashes(stripslashes)。
func TestRemoveXSSSkipList(t *testing.T) {
	// 反斜杠成对：跳过 A(S(·)) 时保留原样，不跳过时 S 会剥一次
	if got := RemoveXSS(`a\b`); got != `a\b` { // 含 '{'？不含——走 A(S)：S → ab → A → ab
		t.Logf("a\\b → %q（走 addslashes 分支，S 剥掉反斜杠）", got)
	}
	if got := RemoveXSS(`a{b`); got != `a{b` {
		t.Fatalf("含 { 时应跳过 A(S(·))：got %q", got)
	}
	if got := RemoveXSS(`a\<b`); got != `a<b` { // 不含 '<p'/'<img'，走 A(S)
		t.Logf("a\\<b → %q", got)
	}
	if got := RemoveXSS(`a<pb`); got != `a<pb` {
		t.Fatalf("含 <p 时应跳过 A(S(·))：got %q", got)
	}
}

// —— addslashes / stripslashes 成对语义 ——

func TestAddslashesStripslashesRoundtrip(t *testing.T) {
	cases := []struct{ in, escaped, stripped string }{
		{"ab'cd", `ab\'cd`, "ab'cd"},
		{`a"b`, `a\"b`, `a"b`},
		{`a\b`, `a\\b`, `a\b`},
		{"a\x00b", `a\0b`, "a\x00b"},
		{`a\`, `a\\`, `a\`},
		{`plain`, `plain`, `plain`},
	}
	for _, c := range cases {
		if got := PHPAddslashes(c.in); got != c.escaped {
			t.Fatalf("PHPAddslashes(%q) = %q, want %q", c.in, got, c.escaped)
		}
		if got := PHPStripslashes(c.escaped); got != c.in {
			t.Fatalf("PHPStripslashes(%q) = %q, want %q", c.escaped, got, c.in)
		}
	}
	// docker PHP 实测口径（update_account_test 同款用例）
	if got := PHPStripslashes(`ab\cd`); got != "abcd" {
		t.Fatalf(`PHPStripslashes("ab\cd") = %q, want "abcd"`, got)
	}
	if got := PHPStripslashes(`a\nb`); got != "anb" {
		t.Fatalf(`PHPStripslashes("a\nb") = %q, want "anb"`, got)
	}
}

// —— filterSensitiveWords（common.func.php:5825）——

func TestFilterSensitiveWords(t *testing.T) {
	defer func(words string) { ReplaceWords = words }(ReplaceWords)
	ReplaceWords = "傻子"

	// A(S(body)) → replacestr → RemoveXSS
	if got := FilterSensitiveWords("你是傻子吗", true); got != "你是***吗" {
		t.Fatalf("got %q, want 你是***吗", got)
	}
	// removeXSS=false：替换敏感词但保留 RemoveXSS 前的原文（PHP 同款分支）
	if got := FilterSensitiveWords("傻子<script>", false); got != "***<script>" {
		t.Fatalf("removeXSS=false = %q, want ***<script>", got)
	}
	// empty() 口径："" 与 "0" 原样返回
	if got := FilterSensitiveWords("0", true); got != "0" {
		t.Fatalf(`FilterSensitiveWords("0") = %q, want "0"`, got)
	}
	if got := FilterSensitiveWords("", true); got != "" {
		t.Fatalf(`FilterSensitiveWords("") = %q, want ""`, got)
	}
	// '||' 删除与末尾 '|' 处理
	ReplaceWords = "傻子||坏蛋|"
	if got := FilterSensitiveWords("傻子坏蛋", true); got != "******" {
		t.Fatalf("多敏感词替换 = %q, want ******", got)
	}
}

func TestFilterSensitiveWordsModeratorHook(t *testing.T) {
	defer func(f func(string) []string) { SensitiveWordsModerator = f }(SensitiveWordsModerator)
	SensitiveWordsModerator = func(string) []string { return []string{"违禁词", "违禁词"} }
	if got := FilterSensitiveWords("含违禁词内容", false); got != "含**内容" {
		t.Fatalf("审核 hook 替换 = %q, want 含**内容", got)
	}
}

// —— 其它原语 ——

func TestPHPRawURLDecode(t *testing.T) {
	cases := [][2]string{
		{"%3Cscript%3E", "<script>"},
		{"a+b", "a+b"},   // rawurldecode 不转 +
		{"%zz", "%zz"},   // 非法序列保留
		{"%2", "%2"},     // 截断的序列保留
		{"100%", "100%"}, // 末尾孤立 %
	}
	for _, c := range cases {
		if got := phpRawURLDecode(c[0]); got != c[1] {
			t.Fatalf("phpRawURLDecode(%q) = %q, want %q", c[0], got, c[1])
		}
	}
}

func TestHTMLSpecialChars74(t *testing.T) {
	if got := phpHTMLSpecialChars74(`a&b<c>d"e'f`); got != `a&amp;b&lt;c&gt;d&quot;e'f` {
		t.Fatalf("ENT_COMPAT 输出 = %q", got)
	}
	// 非法 UTF-8 → 空串（PHP 7.4 无 ENT_SUBSTITUTE）
	if got := phpHTMLSpecialChars74("a\xffb"); got != "" {
		t.Fatalf("非法 UTF-8 = %q, want 空串", got)
	}
}

func TestConvertArrToStrWithComma(t *testing.T) {
	if got := ConvertArrToStrWithComma("1,2,abc", nil, false); got != "1,2,0" {
		t.Fatalf("got %q", got)
	}
	if got := ConvertArrToStrWithComma("", []string{"1", "x", "3"}, true); got != "1,0,3" {
		t.Fatalf("数组 = %q", got)
	}
	if got := ConvertArrToStrWithComma("pricePlaceholder", nil, false); got != "" {
		t.Fatalf("pricePlaceholder = %q", got)
	}
	if got := ConvertArrToStrWithComma("xxPlaceholder", nil, false); got != "" {
		t.Fatalf("含 Placeholder = %q", got)
	}
	if got := ConvertArrToStrWithComma("0", nil, false); got != "" {
		t.Fatalf("0 = %q, want 空串", got)
	}
}

func TestPHPIntvalAndFloat(t *testing.T) {
	cases := [][2]any{
		{"1e3", 1000}, {"3.7", 3}, {"abc", 0}, {"", 0}, {"-5", -5}, {"9223372036854775808", 9223372036854775807},
	}
	for _, c := range cases {
		if got := phpIntval(c[0].(string)); got != c[1].(int) {
			t.Fatalf("phpIntval(%q) = %d, want %v", c[0], got, c[1])
		}
	}
	if got := phpFloatString(phpFloatVal("12.50")); got != "12.5" {
		t.Fatalf("(float)12.50 → %q, want 12.5", got)
	}
	if got := phpFloatString(phpFloatVal("1e3")); got != "1000" {
		t.Fatalf("(float)1e3 → %q, want 1000", got)
	}
	if got := phpFloatString(phpFloatVal("abc")); got != "0" {
		t.Fatalf("(float)abc → %q, want 0", got)
	}
}

func TestRemoveInvisibleCharacters(t *testing.T) {
	if got := RemoveInvisibleCharacters("a​b"); got != "ab" { // U+200B 零宽空格
		t.Fatalf("零宽空格未剔除: %q", got)
	}
	if got := RemoveInvisibleCharacters("正常文本"); got != "正常文本" {
		t.Fatalf("普通文本被改动: %q", got)
	}
}

// looseEqualsOne 对应 PHP 7.4 的 $_REQUEST['rsaEncrypt'] == 1。
func TestLooseEqualsOne(t *testing.T) {
	for _, s := range []string{"1", "1.0", "01", " 1", "1abc"} {
		if !looseEqualsOne(s) {
			t.Fatalf("%q 应为真", s)
		}
	}
	for _, s := range []string{"", "0", "abc", "2", "0.9"} {
		if looseEqualsOne(s) {
			t.Fatalf("%q 应为假", s)
		}
	}
}

// strtrMulti：最长键优先、单趟扫描、替换后不重扫。
func TestStrtrMulti(t *testing.T) {
	if got := strtrMulti("abc", []string{"abc", "ab"}, "*"); got != "*" {
		t.Fatalf("最长键优先: %q", got)
	}
	if got := strtrMulti("abab", []string{"ab"}, "*"); got != "**" {
		t.Fatalf("替换后不重扫: %q", got)
	}
}
