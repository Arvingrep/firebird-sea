// Package jsonfloat 复刻 JSON.stringify 对数字的处理，供需要与 Node 逐字节对拍的响应体使用。
//
// 存在的唯一理由：Go 的 encoding/json 与 JS 的 JSON.stringify 在两类值上不一致。
//
//  1. 非有限数。Go 直接报错 `json: unsupported value: NaN`（写到一半还可能是空 body），
//     而 JSON.stringify 静默写成 null：`JSON.stringify({v:NaN})` → `{"v":null}`，
//     `JSON.stringify({v:Infinity})` → `{"v":null}`。对调用方来说，前者是 500、后者是 200，
//     这是可观测的契约差异（见 /payment/create-charge 的 amountUsdt:"abc"）。
//  2. 数字格式。Go 对 float64 用最短往返表示，与小数值相差不大，但指数区间不同：
//     JSON.stringify 在 |x| ∈ [1e-6, 1e21) 用十进制，区间外用指数形式（`1e-7`、`1e+21`），
//     而 Go 的 'f' 会把 1e-7 写成 0.0000001、'g' 会把指数写成 `1e-07`（前导零）。
//
// 用法：把需要特殊处理的浮点字段声明为 Float，其余字段保持原类型。
package jsonfloat

import (
	"math"
	"strconv"
	"strings"
)

// Float 是「按 JSON.stringify 规则序列化」的浮点数。
//
// 它是定义类型而不是 float64 的别名，因此不会被误用在不该出现的地方（需要显式转换），
// 也不会污染业务侧的算术（业务代码仍用 float64，只在序列化边界转一次）。
type Float float64

// MarshalJSON 把非有限数写成 null，其余按 JSON.stringify 的数字格式输出。
func (f Float) MarshalJSON() ([]byte, error) {
	value := float64(f)
	if math.IsNaN(value) || math.IsInf(value, 0) {
		return []byte("null"), nil
	}
	return []byte(Format(value)), nil
}

// Format 返回 JSON.stringify 形态的数字字面量（不含引号）。
//
// 区间判断与 ECMAScript Number::toString 一致：
//   - 0、[1e-6, 1e21) → 十进制最短往返（Go 的 'f' + -1 精度）；
//   - 其它 → 指数形式，并去掉 Go 指数里的前导零（`1e-07` → `1e-7`）。
//
// 边界值不用 1e-7/1e21 之外的近似：1e-6 本身仍是十进制（"0.000001"），1e21 本身已是指数。
func Format(value float64) string {
	// -0 在 JSON.stringify 里是 "0"（String(-0) 也是 "0"），而 Go 的格式化会保留负号。
	// 这个值真的会出现：CNY→USDT 之类的换算在金额为 0 时会算出 -0。
	if value == 0 {
		return "0"
	}
	abs := math.Abs(value)
	if abs != 0 && (abs < 1e-6 || abs >= 1e21) {
		return normalizeExponent(strconv.FormatFloat(value, 'e', -1, 64))
	}
	return strconv.FormatFloat(value, 'f', -1, 64)
}

// normalizeExponent 把 Go 的指数写法（e-07 / e+21）改成 JS 的写法（e-7 / e+21）。
// 只动指数的前导零，尾数与符号原样保留。
func normalizeExponent(text string) string {
	mantissa, exponent, found := strings.Cut(text, "e")
	if !found {
		return text
	}
	sign := ""
	switch {
	case strings.HasPrefix(exponent, "-"):
		sign, exponent = "-", exponent[1:]
	case strings.HasPrefix(exponent, "+"):
		sign, exponent = "+", exponent[1:]
	}
	exponent = strings.TrimLeft(exponent, "0")
	if exponent == "" {
		exponent = "0"
	}
	return mantissa + "e" + sign + exponent
}
