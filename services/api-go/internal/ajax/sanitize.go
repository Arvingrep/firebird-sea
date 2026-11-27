// PHP 7.4 字符串处理原语的 Go 移植（#364 入口参数归一的地基）。
//
// 来源对照：
//   - phpAddslashes / phpStripslashes：ext/standard/string.c（member 包原有本地副本，
//     #364 起统一走这里，member 侧保留同名薄包装）；
//   - RemoveInvisibleCharacters：webroot/include/common.inc.php:1823（/u 修饰符）；
//   - phpRawURLDecode：PHP rawurldecode（不把 + 转空格，与 url.QueryUnescape 不同）；
//   - phpHTMLSpecialChars74：PHP 7.4 默认 htmlspecialchars（ENT_COMPAT，不转单引号；
//     非法 UTF-8 返回空串，PHP 8.1 起默认才带 ENT_SUBSTITUTE）；
//   - RemoveXSS：webroot/include/class/filter.class.php:55（67 行，含迭代不动点结构）；
//   - FilterSensitiveWords：webroot/include/common.func.php:5825；
//   - ConvertArrToStrWithComma：webroot/include/common.inc.php:1795；
//   - phpFloatVal / phpFloatString：PHP (float) 强转与 precision=14 的 (string) 输出。
package ajax

import (
	"math"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"unicode/utf8"
)

// 部署注入点（默认值与本地 PHP 环境一致）：
//   - ReplaceWords 对应 $cfg_replacestr（本地 siteConfig.inc.php 为 '傻子'）；
//   - SensitiveWordsModerator 对应 cfg_moderationWB 开启后的华为云/阿里云文本审核
//     （本地 cfg_moderationWB=0，返回 nil/空即不替换）；
//   - RSADecrypt 对应 rsaDecrypt（本地 $cfg_encryptPrivkey 为空 → PHP 恒等返回原串，
//     nil 与之同义）。三个注入点均不改变函数签名，比较/单测在默认值下可复现 PHP 行为。
var (
	ReplaceWords            = ""
	SensitiveWordsModerator func(text string) []string
	RSADecrypt              func(s string) string
)

// PHPAddslashes 迁移 PHP addslashes（php_addslashes）：' " \ 与 NUL 前加反斜杠；
// NUL 写成「反斜杠 + 字符 0」（不是 NUL 字节）。
func PHPAddslashes(s string) string {
	var b strings.Builder
	for i := 0; i < len(s); i++ {
		switch s[i] {
		case 0:
			b.WriteString(`\0`)
		case '\'', '"', '\\':
			b.WriteByte('\\')
			b.WriteByte(s[i])
		default:
			b.WriteByte(s[i])
		}
	}
	return b.String()
}

// PHPStripslashes 迁移 PHP stripslashes（php_stripslashes）：遇到反斜杠就跳过它，
// 下一个字符是 '0' 输出 NUL，否则原样输出该字符（\n → n，\x → x）；末尾孤立的反斜杠丢弃。
func PHPStripslashes(s string) string {
	var b strings.Builder
	for i := 0; i < len(s); i++ {
		if s[i] == '\\' {
			i++
			if i >= len(s) {
				break
			}
			if s[i] == '0' {
				b.WriteByte(0)
			} else {
				b.WriteByte(s[i])
			}
			continue
		}
		b.WriteByte(s[i])
	}
	return b.String()
}

// removeInvisiblePattern 迁移 common.inc.php:1820（/u 修饰符的 Unicode 区段黑名单）。
// preg_replace(/u) 在非法 UTF-8 上返回 null，调用方需先判 utf8.ValidString。
var removeInvisiblePattern = regexp.MustCompile(
	`[\x{007f}-\x{009f}]|\x{00ad}|[\x{0483}-\x{0489}]|[\x{0559}-\x{055a}]|\x{058a}|[\x{0591}-\x{05bd}]|\x{05bf}|` +
		`[\x{05c1}-\x{05c2}]|[\x{05c4}-\x{05c7}]|[\x{0606}-\x{060a}]|[\x{063b}-\x{063f}]|\x{0674}|[\x{06e5}-\x{06e6}]|\x{070f}|` +
		`[\x{076e}-\x{077f}]|\x{0a51}|\x{0a75}|\x{0b44}|[\x{0b62}-\x{0b63}]|[\x{0c62}-\x{0c63}]|[\x{0ce2}-\x{0ce3}]|[\x{0d62}-\x{0d63}]|\x{135f}|` +
		`[\x{200b}-\x{200f}]|[\x{2028}-\x{202e}]|\x{2044}|\x{2071}|[\x{f701}-\x{f70e}]|[\x{f710}-\x{f71a}]|\x{fb1e}|` +
		`[\x{fc5e}-\x{fc62}]|\x{feff}|\x{fffc}`)

// RemoveInvisibleCharacters 迁移 common.inc.php:1823。非法 UTF-8 时 PHP 的 preg_replace(/u)
// 返回 null，这里返回空串（与 PHP 链式调用 stripslashes(null)→"" 的实际结果一致）。
func RemoveInvisibleCharacters(s string) string {
	if !utf8.ValidString(s) {
		return ""
	}
	return removeInvisiblePattern.ReplaceAllString(s, "")
}

// phpRawURLDecode 迁移 PHP rawurldecode：% 后跟两个十六进制位解码为字节，
// 其余原样保留（+ 不转空格——与 url.QueryUnescape 的区别）。
func phpRawURLDecode(s string) string {
	if !strings.Contains(s, "%") {
		return s
	}
	var b strings.Builder
	b.Grow(len(s))
	for i := 0; i < len(s); i++ {
		if s[i] == '%' && i+2 < len(s) && isHexDigit(s[i+1]) && isHexDigit(s[i+2]) {
			b.WriteByte((hexVal(s[i+1]) << 4) | hexVal(s[i+2]))
			i += 2
			continue
		}
		b.WriteByte(s[i])
	}
	return b.String()
}

func isHexDigit(c byte) bool {
	return c >= '0' && c <= '9' || c >= 'a' && c <= 'f' || c >= 'A' && c <= 'F'
}

func hexVal(c byte) byte {
	switch {
	case c >= '0' && c <= '9':
		return c - '0'
	case c >= 'a' && c <= 'f':
		return c - 'a' + 10
	default:
		return c - 'A' + 10
	}
}

// phpHTMLSpecialChars74 迁移 PHP 7.4 默认 htmlspecialchars（ENT_COMPAT：转 & < > "，
// 不转单引号；无 ENT_SUBSTITUTE——非法 UTF-8 返回空串）。
func phpHTMLSpecialChars74(s string) string {
	if !utf8.ValidString(s) {
		return ""
	}
	var b strings.Builder
	b.Grow(len(s))
	for i := 0; i < len(s); i++ {
		switch s[i] {
		case '&':
			b.WriteString("&amp;")
		case '<':
			b.WriteString("&lt;")
		case '>':
			b.WriteString("&gt;")
		case '"':
			b.WriteString("&quot;")
		default:
			b.WriteByte(s[i])
		}
	}
	return b.String()
}

// —— RemoveXSS（filter.class.php:55）——

// xssSearchChars 对应 RemoveXSS 里的 $search 累加串；实体解码循环按这个顺序逐字符跑，
// 顺序影响结果（如 &#38;#x61; 的 &#38; 在 'a' 之后才被解码，本轮不会再展开成字母）。
const xssSearchChars = "abcdefghijklmnopqrstuvwxyz" +
	"ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
	"1234567890!@#$%^&*()" +
	"~`\";:?+/={}[]-_|'\\"

var (
	xssStyleTagRe = regexp.MustCompile(`(?i)<style(.*?)>`)
	xssControlRe  = regexp.MustCompile(`[\x00-\x08\x0b-\x0c\x0e-\x19]`)

	// xssEntityRes / xssEntityChars：$search 逐字符的 92 项实体解码模式
	// （&#[xX]0{0,8}HEX;? 大小写不敏感 + &#0{0,8}DEC;?），顺序与 PHP 循环一致。
	xssEntityRes   []*regexp.Regexp
	xssEntityChars []string

	// xssKeywordRes / xssKeywordRepl：$ra1 + $ra2 的 113 个关键词模式
	// （字符间允许 (&#x0{0,8}[9ab];)||(&#0{0,8}[9|10|13]); 交错）与替换串。
	xssKeywordRes  []*regexp.Regexp
	xssKeywordRepl []string
)

func init() {
	for i := 0; i < len(xssSearchChars); i++ {
		c := xssSearchChars[i]
		hex := strconv.FormatInt(int64(c), 16) // dechex：小写
		dec := strconv.Itoa(int(c))            // ord：十进制
		xssEntityRes = append(xssEntityRes,
			regexp.MustCompile(`(?i)&#[xX]0{0,8}`+hex+`;?`),
			regexp.MustCompile(`&#0{0,8}`+dec+`;?`))
		xssEntityChars = append(xssEntityChars, string(c), string(c))
	}

	ra1 := []string{"javascript", "vbscript", "expression", "applet", "blink", "script",
		"document", "eval", "embed", "object", "frameset", "ilayer", "bgsound", "base",
		"insert", "delete", "select", "sleep"}
	ra2 := []string{"onabort", "onpageshow", "onactivate", "onafterprint", "onafterupdate",
		"onbeforeactivate", "onbeforecopy", "onbeforecut", "onbeforedeactivate",
		"onbeforeeditfocus", "onbeforepaste", "onbeforeprint", "onbeforeunload",
		"onbeforeupdate", "onblur", "onbounce", "oncellchange", "onchange", "onclick",
		"oncontextmenu", "oncontrolselect", "oncopy", "oncut", "ondataavailable",
		"ondatasetchanged", "ondatasetcomplete", "ondblclick", "ondeactivate", "ondrag",
		"ondragend", "ondragenter", "ondragleave", "ondragover", "ondragstart", "ondrop",
		"onerror", "onerrorupdate", "onfilterchange", "onfinish", "onfocus", "onfocusin",
		"onfocusout", "onhelp", "onkeydown", "onkeypress", "onkeyup", "onlayoutcomplete",
		"onload", "onlosecapture", "onmousedown", "onmouseenter", "onmouseleave",
		"onmousemove", "onmouseout", "onmouseover", "onmouseup", "onmousewheel", "onmove",
		"onmoveend", "onmovestart", "onpaste", "onpropertychange", "onreadystatechange",
		"onreset", "onresize", "onresizeend", "onresizestart", "onrowenter", "onrowexit",
		"onrowsdelete", "onrowsinserted", "onscroll", "onselect", "onselectionchange",
		"onselectstart", "onstart", "onstop", "onsubmit", "onunload"}
	for _, kw := range append(ra1, ra2...) {
		var p strings.Builder
		p.WriteString(`(?i)`)
		for j := 0; j < len(kw); j++ {
			if j > 0 {
				// 照搬 PHP 字符串拼接出的模式：两个实体分支中间夹着空的 | 分支。
				p.WriteString(`((&#[xX]0{0,8}([9ab]);)||(&#0{0,8}([9|10|13]);))*`)
			}
			p.WriteByte(kw[j])
		}
		xssKeywordRes = append(xssKeywordRes, regexp.MustCompile(p.String()))
		xssKeywordRepl = append(xssKeywordRepl, kw[:2]+"<x>"+kw[2:])
	}
}

// RemoveXSS 迁移 filter.class.php:55 的 RemoveXSS（is_array 分支由调用方处理）。
// 迭代不动点照搬 PHP 的 while/for 结构，包括它的提前终止怪癖：一轮里任何一个
// 关键词没有命中就会把 found 置 false（即使后面关键词仍有命中），下一轮不再跑。
func RemoveXSS(val string) string {
	val = phpRawURLDecode(val)                         // 防止加号被转空格的第二道解码
	val = xssStyleTagRe.ReplaceAllString(val, "style") // 处理 <style>@important url(
	val = xssControlRe.ReplaceAllString(val, "")       // 去掉 \x00-\x19 里的控制字节

	// 含 JSON/富文本特征时不做 addslashes（PHP 注释：json 类数据会被转换导致解析错误）
	if !strings.Contains(val, "{") && !strings.Contains(val, "}") &&
		!strings.Contains(val, "<p") && !strings.Contains(val, "<img") &&
		!strings.Contains(val, "document.write") && !strings.Contains(val, "text/javascript") {
		val = PHPAddslashes(PHPStripslashes(val))
	}

	for i, re := range xssEntityRes {
		val = re.ReplaceAllLiteralString(val, xssEntityChars[i])
	}

	found := true
	for found {
		valBefore := val
		for i, re := range xssKeywordRes {
			val = re.ReplaceAllLiteralString(val, xssKeywordRepl[i])
			if valBefore == val {
				found = false
			}
		}
	}

	// 已发现的不应该被替换的字符串
	val = strings.ReplaceAll(val, "ti<x>tle", "title")
	val = strings.ReplaceAll(val, "st<x>yle", "style")
	return val
}

// —— FilterSensitiveWords（common.func.php:5825）——

// FilterSensitiveWords 迁移 common.func.php:5825。华为云/阿里云文本审核经
// SensitiveWordsModerator 注入（本地 cfg_moderationWB=0 关闭）；$cfg_replacestr 经
// ReplaceWords 注入（本地为 '傻子'）。removeXSS 对应同名参数（handler 调用全部取默认 true）。
func FilterSensitiveWords(body string, removeXSS bool) string {
	if body == "" || body == "0" { // PHP empty()
		return body
	}

	body = PHPAddslashes(PHPStripslashes(body))

	if SensitiveWordsModerator != nil {
		if words := SensitiveWordsModerator(body); len(words) > 0 {
			body = strtrMulti(body, uniqueStrings(words), "**")
		}
	}

	if ReplaceWords != "" {
		// 删除有两个 || 的情况；末尾孤立的 | 会把替换内容全变空，PHP 特意去掉
		rw := strings.ReplaceAll(ReplaceWords, "||", "|")
		rw = strings.TrimSuffix(rw, "|")
		body = strtrMulti(body, strings.Split(rw, "|"), "***")
		if removeXSS {
			return RemoveXSS(body)
		}
		return body
	}
	if removeXSS {
		return RemoveXSS(body)
	}
	return body
}

// strtrMulti 迁移 PHP strtr($str, array) 的语义：按最长键优先、从左到右单趟扫描，
// 替换后的文本不再参与匹配。
func strtrMulti(s string, keys []string, repl string) string {
	if len(keys) == 0 {
		return s
	}
	sorted := append([]string(nil), keys...)
	sort.Slice(sorted, func(i, j int) bool { return len(sorted[i]) > len(sorted[j]) })
	var b strings.Builder
	b.Grow(len(s))
	for i := 0; i < len(s); {
		matched := ""
		for _, k := range sorted {
			if k != "" && strings.HasPrefix(s[i:], k) {
				matched = k
				break
			}
		}
		if matched != "" {
			b.WriteString(repl)
			i += len(matched)
			continue
		}
		b.WriteByte(s[i])
		i++
	}
	return b.String()
}

func uniqueStrings(in []string) []string {
	seen := map[string]bool{}
	out := in[:0]
	for _, v := range in {
		if !seen[v] {
			seen[v] = true
			out = append(out, v)
		}
	}
	return out
}

// —— convertArrToStrWithComma（common.inc.php:1795）——

// ConvertArrToStrWithComma 迁移同名 PHP 函数：标量取 (int)，含逗号逐项取 (int)，
// 数组逐项取 (int)；取整为 0 的项丢弃。isArray=true 时 arr 是数组值。
func ConvertArrToStrWithComma(s string, arr []string, isArray bool) string {
	if isArray {
		if len(arr) == 0 {
			return ""
		}
		out := make([]string, 0, len(arr))
		for _, v := range arr {
			out = append(out, strconv.Itoa(phpIntval(v)))
		}
		return strings.Join(out, ",")
	}
	if s == "" || s == "pricePlaceholder" || strings.Contains(s, "Placeholder") {
		return ""
	}
	if strings.Contains(s, ",") {
		parts := strings.Split(s, ",")
		for i, v := range parts {
			parts[i] = strconv.Itoa(phpIntval(v))
		}
		return strings.Join(parts, ",")
	}
	if n := phpIntval(s); n != 0 {
		return strconv.Itoa(n)
	}
	return ""
}

// —— PHP 数值强转 ——

var (
	// floatPrefixRe / intPrefixRe 取 PHP 字符串→数值转换的数字前缀（允许前导空白与正负号）。
	floatPrefixRe = regexp.MustCompile(`^[ \t\n\r\v\f]*[+-]?([0-9]+(\.[0-9]*)?|\.[0-9]+)([eE][+-]?[0-9]+)?`)
	intPrefixRe   = regexp.MustCompile(`^[ \t\n\r\v\f]*[+-]?[0-9]+$`)
)

// phpIntval 复刻 PHP 7.1+ 对字符串的 (int)：数字前缀按整数 / 浮点解析后截断
// （"1e3"→1000，"3.7"→3，"abc"→0），溢出饱和。
func phpIntval(s string) int {
	m := floatPrefixRe.FindString(s)
	if m == "" {
		return 0
	}
	m = strings.TrimLeft(m, " \t\n\r\v\f")
	if intPrefixRe.MatchString(m) {
		n, err := strconv.ParseInt(m, 10, 64)
		if err != nil {
			if strings.HasPrefix(m, "-") {
				return -9223372036854775808
			}
			return 9223372036854775807
		}
		return int(n)
	}
	f, err := strconv.ParseFloat(m, 64)
	if err != nil && !math.IsInf(f, 0) {
		return 0
	}
	switch {
	case f >= 9223372036854775807:
		return 9223372036854775807
	case f <= -9223372036854775808:
		return -9223372036854775808
	}
	return int(f)
}

// phpFloatVal 对应 PHP 7.1+ 的 (float) 字符串强转（"1e3"→1000，"abc"→0，溢出取极值）。
func phpFloatVal(s string) float64 {
	m := floatPrefixRe.FindString(s)
	if m == "" {
		return 0
	}
	m = strings.TrimLeft(m, " \t\n\r\v\f")
	f, err := strconv.ParseFloat(m, 64)
	if err != nil {
		if strings.HasPrefix(m, "-") {
			return math.Inf(-1)
		}
		return math.Inf(1)
	}
	return f
}

// phpFloatString 对应 PHP precision=14 的 (string)float（(string)1000.0 → "1000"，
// (string)0.5 → "0.5"）。科学计数法的形态（PHP "1.0E+21" vs Go "1E+21"）与切换阈值
// 存在已知偏差，只影响极大/极小量值。
func phpFloatString(f float64) string {
	return strconv.FormatFloat(f, 'G', 14, 64)
}

// looseEqualsOne 对应 PHP 7.4 的 `$_REQUEST['rsaEncrypt'] == 1`：按数字前缀比较
// （"1"、"1.0"、"01"、"1abc" 都为真；PHP 8 起字符串比较规则不同，线上是 7.4）。
func looseEqualsOne(s string) bool {
	m := floatPrefixRe.FindString(s)
	if m == "" {
		return false
	}
	f, err := strconv.ParseFloat(strings.TrimLeft(m, " \t\n\r\v\f"), 64)
	if err != nil {
		return false
	}
	return f == 1
}
