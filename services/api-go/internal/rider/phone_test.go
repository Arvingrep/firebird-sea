// 手机号归一（M4）的测试套件。
//
// 翻译来源：
//   - services/api/test/rider-route.test.js:96-119（两条 normalizePhone 用例）
//   - 同文件 430-475（「15 组输入逐字节对齐 PHP」矩阵，含 9/10/11/12 位长度边界）
//
// 为什么值得单独一个文件：这张矩阵是 Node / Go / PHP 三边唯一的共同契约。
// fbs_normalize_phone（PHP）、riderRoute.js 的 normalizePhone（Node）与这里的
// normalizePhone（Go）任何一边单独改动，都会让「同号一边能绑一边绑不上」，
// 而这类问题在验收现场表现为玄学，不会报错。
package rider

import "testing"

// TestNormalizePhoneMatchesPHP 是 Node 那张 15 行矩阵的逐条移植，**顺序与取值都不许改**：
// 期望值是 PHP fbs_normalize_phone 的行为，不是「Go 看起来合理」的行为。
func TestNormalizePhoneMatchesPHP(t *testing.T) {
	cases := []struct {
		input string
		want  string
		ok    bool
	}{
		// —— 合法形态 → 归一结果 ——
		{"09171234567", "09171234567", true},        // 本地标准写法
		{"+639171234567", "09171234567", true},      // E.164
		{"+63 917 123 4567", "09171234567", true},   // 带空格
		{"+63 (917) 123-4567", "09171234567", true}, // +63 + 括号 + 横线
		{"639171234567", "09171234567", true},       // 无 + 的 63 前缀（12 位纯数字）
		{"63-917-123-4567", "09171234567", true},
		{"0917-123-4567", "09171234567", true},
		{"0917 123 4567", "09171234567", true},
		{"(0917) 123 4567", "09171234567", true},
		{"0917.123.4567", "09171234567", true},   // 点号分隔
		{"  09171234567  ", "09171234567", true}, // 首尾空白
		{"0912345678", "0912345678", true},       // 10 位历史存量
		{"09123456789", "09123456789", true},     // 11 位
		// —— 边界外 / 非法形态 → 失败 ——
		{"091234567", "", false},    // 9 位（比下限少 1）
		{"091234567890", "", false}, // 12 位（比上限多 1）
	}
	for _, item := range cases {
		got, ok := normalizePhone(item.input)
		if ok != item.ok || got != item.want {
			t.Fatalf("normalizePhone(%q) = (%q,%v)，want (%q,%v)", item.input, got, ok, item.want, item.ok)
		}
	}
}

// TestNormalizePhoneRejectsInvalid 对应 Node 的第二条用例（非法输入 → null）。
func TestNormalizePhoneRejectsInvalid(t *testing.T) {
	// Node 的 null / undefined / {} 在 Go 侧等价于「非字符串字段」→ httpbody.Text 给空串，
	// 所以这里只需要覆盖空串这一种形态（怎么进来的由 bind_test 的 400 用例覆盖）。
	invalid := []string{
		"", "   ", "abc", "1",
		"9171234567",          // 缺前导 0
		"0912'; DROP TABLE x", // 注入串
		"091712345678901",     // 15 位
		"abcdefghijk",         // 纯字母
		"+1 415 555 0100",     // 非菲律宾号段
		"0917123456a",         // 尾部字母
	}
	for _, input := range invalid {
		if got, ok := normalizePhone(input); ok {
			t.Fatalf("normalizePhone(%q) 应为非法，实得 %q", input, got)
		}
	}
}

// TestNormalizePhoneStripsJavaScriptWhitespace 钉住「用 JS 的 \s 集合而不是 unicode.IsSpace」。
//
// Node 是 `s.trim().replace(/[\s\-().]/g, ”)`，\s 的集合与 Go 的 unicode.IsSpace
// **不完全相同**：JS 不含 \u0085（NEL），Go 含。若图省事用 unicode.IsSpace，
// 「0917123\u00854567」会被 Go 拼成合法号码而 Node/PHP 判非法 —— 于是同一个号码
// 在网关侧查不到骑手，用户看到的却是「手机号格式不正确」，排查会一路指向归一逻辑。
func TestNormalizePhoneStripsJavaScriptWhitespace(t *testing.T) {
	stripped := []struct{ name, input string }{
		{"NBSP \\u00A0", "0917\u00a0123\u00a04567"},
		{"OGHAM SPACE \\u1680", "0917\u1680123\u16804567"},
		{"EN QUAD \\u2000", "0917\u2000123\u20004567"},
		{"HAIR SPACE \\u200A", "0917\u200a123\u200a4567"},
		{"NARROW NBSP \\u202F", "0917\u202f123\u202f4567"},
		{"MEDIUM MATH SPACE \\u205F", "0917\u205f123\u205f4567"},
		{"IDEOGRAPHIC SPACE \\u3000", "0917\u3000123\u30004567"},
		{"ZWNBSP \\uFEFF", "0917\ufeff123\ufeff4567"},
		{"LINE SEPARATOR \\u2028", "0917\u2028123\u20284567"},
	}
	for _, item := range stripped {
		if got, ok := normalizePhone(item.input); !ok || got != "09171234567" {
			t.Fatalf("%s 应被当作空白丢弃，normalizePhone(%q) = (%q,%v)", item.name, item.input, got, ok)
		}
	}

	// NEL（\u0085）不在 JS 的 \s 里：必须保留 → 号码非法。
	if got, ok := normalizePhone("0917123\u00854567"); ok {
		t.Fatalf("\\u0085 不属于 JS 的 \\s，不该被丢弃（实得 %q）", got)
	}
}

// TestNormalizePhoneEdgePrefixes 覆盖 +63 / 63 转换的两个边界形态，
// 它们在 Node 里分别走 startsWith 与 /^63\d{10}$/ 两条分支。
//
// 期望值不是推出来的，是把这些串喂给真 Node 实现（require riderRoute.js 后直接调
// normalizePhone）得到的：`+630917123456` 归一成 `00917123456` 是**合法**的
// （0 + 10 位数字），别按直觉改成非法 —— PHP 侧同样认为它合法。
func TestNormalizePhoneEdgePrefixes(t *testing.T) {
	cases := []struct {
		input string
		want  string
		ok    bool
	}{
		{"+63", "", false},                     // 只有前缀 → 转成 "0" → 非法
		{"+630917123456", "00917123456", true}, // 结果双 0 但仍是「0 + 10 位」→ 合法
		{"631234567890", "01234567890", true},  // 63 前缀分支：0 + 1234567890
		{"+63917123456", "0917123456", true},   // 10 位结果也合法（0 + 9 位）
		{"00917123456", "00917123456", true},   // 已是 0 开头 11 位 → 原样返回
	}
	for _, item := range cases {
		got, ok := normalizePhone(item.input)
		if ok != item.ok || got != item.want {
			t.Fatalf("normalizePhone(%q) = (%q,%v)，want (%q,%v)", item.input, got, ok, item.want, item.ok)
		}
	}
}
