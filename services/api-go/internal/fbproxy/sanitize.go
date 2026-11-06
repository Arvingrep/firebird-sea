package fbproxy

import (
	"encoding/json"
	"strings"
)

// 客户端不得自带的身份/旁路参数（Spike S2）：精确名 + 前缀。
// 这些参数一旦透传，上游会把调用方当成别人（userkey/token）或换掉路由（service/action）。
var (
	strippedExact = map[string]struct{}{
		"userkey": {}, "access_token": {}, "refresh_token": {}, "token": {}, "forcelogout": {},
		"rsaencrypt": {}, "service": {}, "action": {}, "callback": {}, "_": {}, "userid": {},
		"uid": {}, "login_user": {},
	}
	// platform_ / hn_ 是火鸟的身份与渠道前缀，按前缀整段剥离（大小写不敏感）。
	strippedPrefixes = []string{"platform_", "hn_"}
)

// LooksLikeJSONContainer 判断值是否会被上游当作 JSON 容器。
//
// 上游 ajax.php 对「含 [{ 的字符串」及「可 json_decode 成数组/对象的字符串」跳过 addslashes，
// 这类值一旦落进 SQL 就是注入面。宁可误杀（含 "[{" 的普通文本）也不放过。
func LooksLikeJSONContainer(value string) bool {
	if strings.Contains(value, "[{") {
		return true
	}
	trimmed := strings.TrimSpace(value)
	if !strings.HasPrefix(trimmed, "[") && !strings.HasPrefix(trimmed, "{") {
		return false
	}
	var decoded any
	if err := json.Unmarshal([]byte(trimmed), &decoded); err != nil {
		return false
	}
	switch decoded.(type) {
	case map[string]any, []any:
		return true
	}
	return false
}

// SanitizeParams 按规则白名单与剥离表过滤参数（值必须是字符串）。
// allowed 为 nil 表示不限制参数名（等价 Node 的 allowed = null）。
func SanitizeParams(query map[string]string, allowed []string) map[string]string {
	anyQuery := make(map[string]any, len(query))
	for k, v := range query {
		anyQuery[k] = v
	}
	return SanitizeAny(anyQuery, allowed)
}

// SanitizeAny 是 SanitizeParams 的宽松版本：非字符串值（数组/对象/数字）直接丢弃，
// 与 Node 的 `if (typeof v !== 'string') continue` 一致。
func SanitizeAny(query map[string]any, allowed []string) map[string]string {
	out := make(map[string]string, len(query))
	for key, raw := range query {
		// 键里带方括号的一律丢弃 —— 这是 qs 语义的等价物，不是额外的收紧。
		//
		// Node 侧参数来自 qs（express 的 query parser 与 urlencoded({extended:true})）：
		// `a[b]=1` 在 qs 里会变成 `{a: {b: '1'}}`，于是 sanitizeParams 的
		// `typeof v !== 'string'` 把它**整个丢掉**。
		// Go 侧 url.ParseQuery 保留字面键 `a[b]`、值仍是字符串，于是会被当作合法参数
		// 原样转发给上游；而 PHP 的 parse_str 又会把 `a[b]` 还原成嵌套数组 ——
		// 白名单机制在这里出现等价性缺口（值能带着结构穿过白名单）。
		// 白名单里的参数名（18+13+13 个）没有一个含方括号，所以这条不会误伤正常调用。
		if strings.ContainsAny(key, "[]") {
			continue
		}
		if allowed != nil && !containsString(allowed, key) {
			continue
		}
		lowered := strings.ToLower(key)
		if _, stripped := strippedExact[lowered]; stripped {
			continue
		}
		if hasPrefixAny(lowered, strippedPrefixes) {
			continue
		}
		value, ok := raw.(string)
		if !ok {
			continue
		}
		if LooksLikeJSONContainer(value) {
			continue
		}
		out[key] = value
	}
	return out
}

func containsString(list []string, want string) bool {
	for _, item := range list {
		if item == want {
			return true
		}
	}
	return false
}

func hasPrefixAny(value string, prefixes []string) bool {
	for _, prefix := range prefixes {
		if strings.HasPrefix(value, prefix) {
			return true
		}
	}
	return false
}
