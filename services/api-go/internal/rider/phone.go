package rider

// 本文件是手机号归一（M4）的移植：
//
//	normalizePhone ← services/api/src/riderRoute.js:23-29
//
// # 为什么必须有这一层
//
// 库里的 phone 是历史存量（0 开头 / +63 / 63 各种形态混存），不归一就会出现
// 「输 0912345678 绑不上、输 +63912345678 才绑上」这类玄学问题，且直接决定
// PHP 网关 rider_bind 按手机号查骑手时能不能命中。
//
// # 与 PHP 的一致性
//
// **本函数必须与 PHP 网关的 fbs_normalize_phone 逐字节一致**：两侧只要有一边
// 单独改动，同一个号码就会出现「Node 能绑、PHP 查不到」或反之。改动这里必须
// 同步改 webroot/api/fbs/ 下的 PHP 实现，并在两边各跑一遍 15 组归一矩阵
// （见 phone_test.go 与 services/api/test/rider-route.test.js 的同一张表）。
//
// # 规则（与 Node 原文逐条对应）
//
//  1. 去掉空格 / 横线 / 括号 / 点号；
//  2. 前导 `+63` 转 `0`；纯数字 `63` + 10 位同样转 `0`；
//  3. 结果必须是「0 开头 + 共 10-11 位数字」（菲律宾手机号 09XXXXXXXXX 等），否则失败。

import (
	"regexp"
	"strings"
)

const (
	// sixtyThreePrefix 对应 Node 的 /^63\d{10}$/：不带 + 的 63 前缀必须是 12 位纯数字。
	// Go 的 \d 与 JS 一样只匹配 ASCII 0-9（不是 Unicode 数字），无需额外收窄。
	sixtyThreePrefix = `^63\d{10}$`
	// localPhonePattern 对应 Node 的 /^0\d{9,10}$/：0 开头，共 10 或 11 位。
	localPhonePattern = `^0\d{9,10}$`
)

var (
	sixtyThreePrefixRe = regexp.MustCompile(sixtyThreePrefix)
	localPhoneRe       = regexp.MustCompile(localPhonePattern)
)

// normalizePhone 把各种写法归一成 0 开头的本地写法；第二个返回值为 false 表示非法
// （对应 Node 的返回 null）。
//
// 入参已经由调用方转成字符串（httpbody.Text 对非字符串一律返回空串），所以这里
// 不需要复刻 `String(raw)` 的强制转换；两者在「非法值」上的结局一致（都是 400）。
func normalizePhone(raw string) (string, bool) {
	stripped := make([]rune, 0, len(raw))
	for _, char := range raw {
		switch {
		case char == '-' || char == '(' || char == ')' || char == '.':
			// 分隔符：直接丢弃。
			continue
		case isJSWhitespace(char):
			// 空白：直接丢弃（Node 是 trim + 全局替换，等价于「任何位置都去掉」）。
			continue
		}
		stripped = append(stripped, char)
	}
	phone := string(stripped)

	switch {
	case strings.HasPrefix(phone, "+63"):
		phone = "0" + phone[3:]
	case sixtyThreePrefixRe.MatchString(phone):
		phone = "0" + phone[2:]
	}

	if !localPhoneRe.MatchString(phone) {
		return "", false
	}
	return phone, true
}

// isJSWhitespace 复刻 JavaScript 的 \s（也就同时覆盖了 String.prototype.trim 的空白集合）。
//
// 为什么不用 unicode.IsSpace：两者的集合**不完全相同**，差异会让归一结果在脏输入上
// 分叉。JS 的 \s = [\t\n\v\f\r 空格 \u00A0 \u1680 \u2000-\u200A \u2028 \u2029
// \u202F \u205F \u3000 \uFEFF]；Go 的 unicode.IsSpace 额外包含 \u0085（NEL）——
// 于是「0917123\u00854567」在 Node 里是非法手机号，用 IsSpace 却会被拼成合法号码。
func isJSWhitespace(char rune) bool {
	switch char {
	case '\t', '\n', '\v', '\f', '\r', ' ',
		0x00a0, // NO-BREAK SPACE
		0x1680, // OGHAM SPACE MARK
		0x2028, // LINE SEPARATOR
		0x2029, // PARAGRAPH SEPARATOR
		0x202f, // NARROW NO-BREAK SPACE
		0x205f, // MEDIUM MATHEMATICAL SPACE
		0x3000, // IDEOGRAPHIC SPACE
		0xfeff: // ZERO WIDTH NO-BREAK SPACE
		return true
	}
	return char >= 0x2000 && char <= 0x200a
}
