package member

import (
	"math"
	"regexp"
	"strconv"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// params 复刻 ajax.php:56-121 对 $param 的归一，只覆盖 member.message 用到的键。
type params struct{ req *ajax.Request }

func newParams(req *ajax.Request) params { return params{req: req} }

// fromPost 判断某个键最终来自 POST（POST 覆盖 GET，归一规则不同）。
func (p params) fromPost(key string) bool {
	if p.req.HTTP == nil {
		return false
	}
	_, a := p.req.HTTP.PostForm[key]
	_, b := p.req.HTTP.PostForm[key+"[]"]
	return a || b
}

// array 返回 key[] 形式的数组值（PHP 里同名键是数组）。
func (p params) array(key string) ([]string, bool) {
	v, ok := p.req.Params[key+"[]"]
	return v, ok
}

// scalar 取普通键的值；'undefined' 在 ajax.php 里统一变空串。
func (p params) scalar(key string) string {
	v := p.req.Params.Get(key)
	if v == "undefined" {
		return ""
	}
	return v
}

type userID struct {
	value   string
	isArray bool
}

// truthyUserID 对应 `$this->param['userid'] ? … : getMemberID()` 的判断：
// 空串、"0"、空数组为假；数组为真但随后 is_numeric 为假。
func (p params) truthyUserID() (userID, bool) {
	if arr, ok := p.array("userid"); ok && len(arr) > 0 {
		return userID{isArray: true}, true
	}
	v := p.scalar("userid")
	if v == "" || v == "0" {
		return userID{}, false
	}
	return userID{value: v}, true
}

// intval 对应 (int)$this->param[key]；数组非空为 1，缺失为 0。
func (p params) intval(key string) int {
	if v, ok := p.req.Params[key]; ok && len(v) > 0 {
		return phpIntval(p.scalar(key))
	}
	if arr, ok := p.array(key); ok && len(arr) > 0 {
		return 1
	}
	return 0
}

// pageLike 对应 ajax.php 对 page / pageSize 的归一。
// GET：(int)，<=0 取默认值，上限 50000；POST：(int)，只做上限（<=0 留给 message() 的 empty() 兜，负数保留）。
func (p params) pageLike(key string, def int) int {
	// 'touchHome' 不进归一分支，后面 (int)'touchHome' 为 0，效果与 0 相同。
	v := p.intval(key)
	if !p.fromPost(key) && v <= 0 {
		v = def
	}
	if v > maxPage {
		v = maxPage
	}
	return v
}

// state 对应 convertArrToStrWithComma($value)；第二个返回值表示键是否出现。
func (p params) state() (string, bool) {
	if v, ok := p.req.Params["state"]; ok && len(v) > 0 {
		return convertArrToStrWithComma(v[len(v)-1], nil, false), true
	}
	if arr, ok := p.array("state"); ok {
		return convertArrToStrWithComma("", arr, true), true
	}
	return "", false
}

func convertArrToStrWithComma(s string, arr []string, isArray bool) string {
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

var intPrefix = regexp.MustCompile(`^[ \t\n\r\v\f]*[+-]?[0-9]+$`)

// phpIntval 复刻 PHP 7.1+ 对字符串的 (int)：数字前缀按整数 / 浮点解析后截断（"1e3"→1000，"3.7"→3，"abc"→0），溢出饱和。
func phpIntval(s string) int {
	m := numberPrefix.FindString(s)
	if m == "" {
		return 0
	}
	m = strings.TrimLeft(m, " \t\n\r\v\f")
	if intPrefix.MatchString(m) {
		n, err := strconv.ParseInt(m, 10, 64)
		if err != nil {
			if strings.HasPrefix(m, "-") {
				return math.MinInt64
			}
			return math.MaxInt64
		}
		return int(n)
	}
	f, err := strconv.ParseFloat(m, 64)
	if err != nil && !math.IsInf(f, 0) {
		return 0
	}
	switch {
	case f >= math.MaxInt64:
		return math.MaxInt64
	case f <= math.MinInt64:
		return math.MinInt64
	}
	return int(f)
}
