package fbproxy

import (
	"bytes"
	"encoding/json"
	"math"
	"regexp"
	"strconv"
	"strings"
)

var (
	// idPattern：商品 id 必须是不带前导零的 1~10 位正整数。
	idPattern = regexp.MustCompile(`^[1-9][0-9]{0,9}$`)
	// ntitlePattern：菜名允许字母/数字/空格与少量标点，最长 100（\p{L}/\p{N} 覆盖中文）。
	ntitlePattern = regexp.MustCompile(`^[\p{L}\p{N} ,.\-_()/]{0,100}$`)
	// countStringPattern：字符串形态的数量只接受 1~2 位数字（"100" 会被当作非法字符串）。
	countStringPattern = regexp.MustCompile(`^[0-9]{1,2}$`)
)

// orderItem 是重新序列化后的单行订单内容；字段顺序 id,count,ntitle 与 Node 版一致。
type orderItem struct {
	ID     string `json:"id"`
	Count  int    `json:"count"`
	NTitle string `json:"ntitle,omitempty"`
}

// ValidateOrderContent 校验并重新序列化 waimai:deal 的 order_content。
//
// 只接受 `[{id,count,ntitle?}]`：其余键一律丢弃。为什么必须重写而不能原样透传——
// 上游会把 order_content 当 JSON 解出 id/count 直接拼进 SQL 与金额计算，
// 任何多余键、负数或小数数量都可能被用来改价或注入。
func ValidateOrderContent(raw string) (string, bool) {
	var arr []any
	if err := json.Unmarshal([]byte(raw), &arr); err != nil {
		return "", false
	}
	if len(arr) == 0 || len(arr) > 50 {
		return "", false
	}

	clean := make([]orderItem, 0, len(arr))
	for _, entry := range arr {
		obj, ok := entry.(map[string]any)
		if !ok {
			// null / 数组 / 标量都不是合法的订单行。
			return "", false
		}
		id := orderIDString(obj["id"])
		if !idPattern.MatchString(id) {
			return "", false
		}
		count, ok := orderCount(obj["count"])
		if !ok || count < 1 || count > 99 {
			return "", false
		}
		row := orderItem{ID: id, Count: count}
		if rawTitle, exists := obj["ntitle"]; exists {
			// 空串等价「未提供」；其余任何非字符串（含 null）都按非法处理。
			title, isString := rawTitle.(string)
			if !isString {
				return "", false
			}
			if title != "" {
				if !ntitlePattern.MatchString(title) {
					return "", false
				}
				row.NTitle = title
			}
		}
		clean = append(clean, row)
	}

	var buf bytes.Buffer
	encoder := json.NewEncoder(&buf)
	// 上游按字面比较/存储菜名，默认的 HTML 转义（& → \u0026）会改变内容。
	encoder.SetEscapeHTML(false)
	if err := encoder.Encode(clean); err != nil {
		return "", false
	}
	return strings.TrimSuffix(buf.String(), "\n"), true
}

// orderIDString 复刻 JS 的 String(id)：数字按整数文本输出，其余类型（null/对象）返回空串，
// 空串必然过不了 idPattern，等价于拒绝。
func orderIDString(v any) string {
	switch n := v.(type) {
	case string:
		return n
	case float64:
		if n == math.Trunc(n) && math.Abs(n) < 1e21 {
			return strconv.FormatInt(int64(n), 10)
		}
		return strconv.FormatFloat(n, 'g', -1, 64)
	}
	return ""
}

// orderCount 解析数量：字符串必须是 1~2 位数字，数字必须是整数。
func orderCount(v any) (int, bool) {
	switch n := v.(type) {
	case string:
		if !countStringPattern.MatchString(n) {
			return 0, false
		}
		parsed, err := strconv.Atoi(n)
		if err != nil {
			return 0, false
		}
		return parsed, true
	case float64:
		if n != math.Trunc(n) || math.Abs(n) > 1e9 {
			return 0, false
		}
		return int(n), true
	}
	return 0, false
}
