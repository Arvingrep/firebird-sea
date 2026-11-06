// Package contract 是 scripts/api-contract-check.js 的 Go 版：把「代码里声明的路由」
// 与「docs/api/openapi.yaml 里写的路由」双向比对，另外比对 fb 代理白名单动作。
//
// 为什么要有它：docs-as-code 门禁只强制「改了代码就要动 docs/」，动的是哪一篇不管。
// 于是加一条路由、随手往别的文档里塞一行，门禁照样绿，而 OpenAPI 悄悄落后。
// 这里把「文档」收窄成机器可读的契约，两个方向都查：
//
//	代码有、spec 没有 → 接口没文档
//	spec 有、代码没有 → 文档描述了不存在的接口（比缺文档更坏，调用方会照着写）
//
// 零依赖：不引 yaml 库，用受约束的行解析。因此 spec 必须按固定缩进书写 ——
// 路径键缩进 2、方法键缩进 4、x-fb-actions 条目缩进 2。
package contract

import (
	"regexp"
	"sort"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/fbproxy"
)

// methods 是 spec 里认的方法键。router.all 的语义是「任意方法」，单独用 ALL 表示，
// 不展开成具体方法列表。
var methods = []string{"get", "post", "put", "patch", "delete"}

var (
	// pathParamRe：Express 的 :id 与 OpenAPI 的 {id} 是同一件事，统一成后者再比较。
	pathParamRe = regexp.MustCompile(`:([A-Za-z0-9_]+)`)
	// methodKeyRe 匹配 4 缩进的方法键，如 `    get:`。
	methodKeyRe = regexp.MustCompile(`^(` + strings.Join(methods, "|") + `):$`)
	// actionKeyRe 匹配 x-fb-actions 的条目，如 `  - 'waimai:shopList'`。
	actionKeyRe = regexp.MustCompile(`^-\s*'?([A-Za-z]+:[A-Za-z0-9]+)'?$`)
)

// NormalizePath 把 `:param` 归一成 `{param}`。
func NormalizePath(path string) string {
	return pathParamRe.ReplaceAllString(path, "{$1}")
}

// RouteKey 是比对用的键：`方法 路径`（方法大写，路径已归一）。
func RouteKey(method, path string) string {
	return strings.ToUpper(method) + " " + NormalizePath(path)
}

// Spec 是解析结果。
type Spec struct {
	// Routes 形如 `GET /tg-api/health`。
	Routes map[string]struct{}
	// Actions 形如 `waimai:shopList`。
	Actions map[string]struct{}
}

// ParseSpec 按固定缩进规则解析 spec 文本。
//
// 行解析而不是 YAML 解析，是因为 Zero-Dep 门禁不允许引第三方库；代价是 spec 的
// 缩进成了隐式契约，写错缩进会「静默少一条」。所以这里对「看起来像路径键但缩进
// 不对」的行不做猜测，一律忽略 —— 宁可漏检也要保证「解析结果可预测」，
// 缩进约束已经写在 spec 头部说明了。
func ParseSpec(text string) Spec {
	spec := Spec{Routes: map[string]struct{}{}, Actions: map[string]struct{}{}}
	section := "other"
	currentPath := ""

	for _, raw := range strings.Split(text, "\n") {
		// Tab 一律展开成两个空格：spec 里出现 Tab 时行号/缩进都不可信，先归一。
		line := strings.ReplaceAll(raw, "\t", "  ")
		line = strings.TrimRight(line, " \r")
		trimmed := strings.TrimSpace(line)
		if trimmed == "" || strings.HasPrefix(trimmed, "#") {
			continue
		}
		indent := len(line) - len(strings.TrimLeft(line, " "))

		if indent == 0 {
			currentPath = ""
			switch trimmed {
			case "paths:":
				section = "paths"
			case "x-fb-actions:":
				section = "fb"
			default:
				section = "other"
			}
			continue
		}

		switch section {
		case "paths":
			if indent == 2 && strings.HasSuffix(trimmed, ":") && strings.HasPrefix(trimmed, "/") {
				currentPath = strings.TrimSpace(strings.TrimSuffix(trimmed, ":"))
				continue
			}
			if indent == 4 && currentPath != "" {
				if matched := methodKeyRe.FindStringSubmatch(trimmed); matched != nil {
					spec.Routes[strings.ToUpper(matched[1])+" "+currentPath] = struct{}{}
				}
			}
		case "fb":
			if matched := actionKeyRe.FindStringSubmatch(trimmed); matched != nil {
				spec.Actions[matched[1]] = struct{}{}
			}
		}
	}
	return spec
}

// ExtractWhitelistActions 从 fbproxy 的白名单导出动作清单。
//
// Node 版是从源码文本里正则抠 key（因为 require 会拖进 express）。Go 侧不需要
// 抄这个绕法：白名单本来就是包级导出的数据，直接读 map 比解析自己的源码更准 ——
// 源码里被注释掉的条目也不会被误当成生效规则。
func ExtractWhitelistActions(whitelist fbproxy.Whitelist) []string {
	actions := make([]string, 0, len(whitelist))
	for key := range whitelist {
		actions = append(actions, key)
	}
	sort.Strings(actions)
	return actions
}

// DiffRoutes 双向比对。
//
// ALL 语义：router.all 注册的路径在 spec 里至少要有一个方法，否则等于没文档 ——
// 所以 `ALL /x` 只在「spec 里该路径一个方法都没有」时算缺失。
func DiffRoutes(codeRoutes, specRoutes []string) (missingInSpec, missingInCode []string) {
	specSet := make(map[string]struct{}, len(specRoutes))
	for _, key := range specRoutes {
		specSet[key] = struct{}{}
	}
	codeSet := make(map[string]struct{}, len(codeRoutes))
	for _, key := range codeRoutes {
		codeSet[key] = struct{}{}
	}

	for _, key := range codeRoutes {
		method, path, ok := splitKey(key)
		if !ok {
			continue
		}
		if method == "ALL" {
			if !specCoversPath(specSet, path) {
				missingInSpec = append(missingInSpec, key)
			}
			continue
		}
		if _, found := specSet[key]; !found {
			missingInSpec = append(missingInSpec, key)
		}
	}

	for _, key := range specRoutes {
		method, path, ok := splitKey(key)
		if !ok {
			continue
		}
		if _, found := codeSet[key]; found {
			continue
		}
		if _, found := codeSet["ALL "+path]; found {
			continue
		}
		missingInCode = append(missingInCode, method+" "+path)
	}

	sort.Strings(missingInSpec)
	sort.Strings(missingInCode)
	return missingInSpec, missingInCode
}

// DiffActions 比对白名单动作与 spec 的 x-fb-actions。
func DiffActions(whitelistActions, specActions []string) (missingInSpec, missingInCode []string) {
	specSet := make(map[string]struct{}, len(specActions))
	for _, action := range specActions {
		specSet[action] = struct{}{}
	}
	codeSet := make(map[string]struct{}, len(whitelistActions))
	for _, action := range whitelistActions {
		codeSet[action] = struct{}{}
	}
	for _, action := range whitelistActions {
		if _, found := specSet[action]; !found {
			missingInSpec = append(missingInSpec, "fb:"+action)
		}
	}
	for _, action := range specActions {
		if _, found := codeSet[action]; !found {
			missingInCode = append(missingInCode, "fb:"+action)
		}
	}
	sort.Strings(missingInSpec)
	sort.Strings(missingInCode)
	return missingInSpec, missingInCode
}

func splitKey(key string) (method, path string, ok bool) {
	parts := strings.SplitN(key, " ", 2)
	if len(parts) != 2 {
		return "", "", false
	}
	return parts[0], parts[1], true
}

func specCoversPath(specSet map[string]struct{}, path string) bool {
	suffix := " " + path
	for key := range specSet {
		if strings.HasSuffix(key, suffix) {
			return true
		}
	}
	return false
}
