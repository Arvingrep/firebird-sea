package dispatch

import (
	"encoding/json"
	"math"
	"strconv"
	"strings"
)

// jsNumber 复刻 JS 的 Number(v) 强制转换。ok=false 等价 NaN。
//
// 为什么不能直接断言 int：Node 侧读的是 `Number(body.order_id)`，所以
// `{"order_id":"1001"}`（字符串）、`{"order_id":true}`（→ 1）在 Node 都是**合法**参数。
// 只接受 float64 会让这类请求从 202 变成 400，是双进程对拍一定能抓到的差异。
//
// 支持的形态（其余一律 NaN，与 Node 对 object 的 [object Object] → NaN 同结果）：
//
//	nil → 0；bool → 1/0；数字 → 自身；字符串 → 按 JS 数字字面量解析；
//	数组 → Number([]) 是 0、Number([x]) 是 Number(String(x))，多元素是 "a,b" → NaN。
func jsNumber(value any) (float64, bool) {
	switch typed := value.(type) {
	case nil:
		return 0, true
	case bool:
		if typed {
			return 1, true
		}
		return 0, true
	case float64:
		if math.IsNaN(typed) {
			return 0, false
		}
		return typed, true
	case float32:
		return float64(typed), true
	case int:
		return float64(typed), true
	case int64:
		return float64(typed), true
	case json.Number:
		return jsNumberFromString(typed.String())
	case string:
		return jsNumberFromString(typed)
	case []any:
		switch len(typed) {
		case 0:
			return 0, true
		case 1:
			return jsNumberFromString(jsString(typed[0]))
		default:
			return 0, false
		}
	}
	return 0, false
}

// jsString 复刻数组单元素场景下的 String(v)（只覆盖能拼出合法数字的形态）。
func jsString(value any) string {
	switch typed := value.(type) {
	case nil:
		return ""
	case string:
		return typed
	case bool:
		if typed {
			return "true"
		}
		return "false"
	case float64:
		return strconv.FormatFloat(typed, 'f', -1, 64)
	case int64:
		return strconv.FormatInt(typed, 10)
	case int:
		return strconv.Itoa(typed)
	}
	return ""
}

// jsNumberFromString 复刻 Number(string)：
//   - 首尾空白会被裁掉（"" 与纯空白都是 0）；
//   - "Infinity"/"+Infinity"/"-Infinity" 是特殊值；
//   - "0x"/"0b"/"0o" 前缀按对应进制解析；
//   - 其余交给 ParseFloat（它不是零容错的：会被后面的 safe-integer 判定挡掉）。
//
// 与 JS 的已知细微差异（不影响本端点的判决结果）：
//   - ParseFloat 接受 "nan"/"inf"，JS 的 Number("nan") 是 NaN —— 两者都不是安全正整数，
//     最终都是 400 INVALID_PARAM。
//   - JS 认的空白集合比 unicode.IsSpace 略有出入，同样只影响非法值的分类。
func jsNumberFromString(raw string) (float64, bool) {
	text := strings.TrimSpace(raw)
	if text == "" {
		return 0, true
	}
	switch text {
	case "Infinity", "+Infinity":
		return math.Inf(1), true
	case "-Infinity":
		return math.Inf(-1), true
	}
	if len(text) > 2 && text[0] == '0' {
		base := 0
		switch text[1] {
		case 'x', 'X':
			base = 16
		case 'b', 'B':
			base = 2
		case 'o', 'O':
			base = 8
		}
		if base != 0 {
			parsed, err := strconv.ParseUint(text[2:], base, 64)
			if err != nil {
				return 0, false
			}
			return float64(parsed), true
		}
	}
	parsed, err := strconv.ParseFloat(text, 64)
	if err != nil {
		return 0, false
	}
	return parsed, true
}
