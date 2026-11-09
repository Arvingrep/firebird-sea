// 契约护栏（不是临时自检）：用例锁定与 Node 版逐字对齐的对外行为 —— 路由表、状态码、
// 错误码与 JSON 字段名。改实现前先看这里；合并前不要按临时文件删。
package contract

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/fbproxy"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/httpapi"
)

// specPath 从 internal/contract（services/api-go/internal/contract）回到仓库根再进 docs。
const specPath = "../../../../docs/api/openapi.yaml"

// knownNotInSpec 是不进 OpenAPI 的路由，理由必须写清楚——否则它会变成「下一个人的漏检」。
//
//   - `/`、`/health`：app 级探针，不是对外 API；
//   - `/tma`、`/tma/`：前端静态产物入口（构建产物才有意义，随版本变化）；
//   - `/tg-api/payment/mock-webhook`：非生产的联调口子，生产根本不注册；
//   - `/include/ajax.php`、`/go-compat/include/ajax.php`：火鸟 ajax.php 兼容层，
//     契约是 PHP 原接口，不属于 /tg-api。
//
// 注意：这些只是「不进 missingInSpec 断言」，反向的 missingInCode 仍然全量比对——
// spec 里如果冒出这几条，说明有人把内部接口写进了契约，要报出来。
var knownNotInSpec = map[string]struct{}{
	"GET /":                             {},
	"GET /health":                       {},
	"GET /tma":                          {},
	"GET /tma/":                         {},
	"POST /tg-api/payment/mock-webhook": {},
	"ALL /include/ajax.php":             {},
	"ALL /go-compat/include/ajax.php":   {},
}

func loadSpec(t *testing.T) Spec {
	t.Helper()
	raw, err := os.ReadFile(filepath.Clean(specPath))
	if err != nil {
		t.Fatalf("读取契约文件失败: %v", err)
	}
	return ParseSpec(string(raw))
}

func codeRoutes() []string {
	server := httpapi.NewServer(httpapi.Dep{})
	routes := make([]string, 0, 32)
	for _, route := range server.Routes() {
		routes = append(routes, RouteKey(route.Method, route.Path))
	}
	return routes
}

// TestSelfCheckRoutesCoverSpec 是核心断言：httpapi.Routes() 与真实 openapi.yaml 双向零差异。
func TestSelfCheckRoutesCoverSpec(t *testing.T) {
	spec := loadSpec(t)
	routes := codeRoutes()

	// 先做一次结构自检，避免「解析器坏了 → 两边都空 → 断言意外通过」。
	if len(spec.Routes) == 0 {
		t.Fatal("spec 解析出 0 条路由，解析器或缩进约束已失效")
	}
	if len(routes) != 29 {
		t.Fatalf("路由表条数应为 29，实际 %d：%v", len(routes), routes)
	}

	specRoutes := make([]string, 0, len(spec.Routes))
	for key := range spec.Routes {
		specRoutes = append(specRoutes, key)
	}

	missingInSpec, missingInCode := DiffRoutes(routes, specRoutes)

	if rest := withoutNotYetInCode(missingInCode); len(rest) != 0 {
		t.Fatalf("spec 有、代码没有：%v", rest)
	}
	// 与正式用例同一套判据：待移植清单必须恰好等于当前真实缺口，
	// 否则「实现了没删」和「清单指错」都会让这条自检变成假绿来源。
	if len(missingInCode) != len(notYetInCode) {
		t.Fatalf("待移植路由应恰好 %d 条，实得 %v", len(notYetInCode), missingInCode)
	}

	// 口径外路由只豁免「代码有 spec 没有」这一个方向；反向已在上面全量断言。
	unexpected := make([]string, 0, len(missingInSpec))
	for _, key := range missingInSpec {
		if _, exempted := knownNotInSpec[key]; exempted {
			continue
		}
		unexpected = append(unexpected, key)
	}
	if len(unexpected) != 0 {
		t.Fatalf("代码有、spec 缺（已排除 %d 条口径外路由）：%v", len(knownNotInSpec), unexpected)
	}
	// 豁免清单本身也要真的用得上：全都没命中说明 specPath 指错了文件，
	// 那样「零差异」是假的。
	if len(missingInSpec) != len(knownNotInSpec) {
		t.Fatalf("口径外路由应恰好命中 %d 条，实得 %v", len(knownNotInSpec), missingInSpec)
	}
}

// TestSelfCheckKnownNotInSpecStaysOut 保证「口径外路由」真的是口径外：
// 一旦它们被写进 spec，说明有人把内部接口当对外契约发布了。
func TestSelfCheckKnownNotInSpecStaysOut(t *testing.T) {
	spec := loadSpec(t)
	for key := range knownNotInSpec {
		if _, found := spec.Routes[key]; found {
			t.Fatalf("%s 不该出现在 openapi.yaml 里", key)
		}
	}
}

// TestSelfCheckWhitelistActionsCoverSpec 比对 fb 白名单动作与 x-fb-actions。
func TestSelfCheckWhitelistActionsCoverSpec(t *testing.T) {
	spec := loadSpec(t)
	actions := ExtractWhitelistActions(fbproxy.DefaultWhitelist())

	if len(actions) != 16 {
		t.Fatalf("白名单动作应为 16 条，实际 %d：%v", len(actions), actions)
	}
	if len(spec.Actions) == 0 {
		t.Fatal("spec 解析出 0 条 x-fb-actions，解析器或缩进约束已失效")
	}

	specActions := make([]string, 0, len(spec.Actions))
	for action := range spec.Actions {
		specActions = append(specActions, action)
	}

	missingInSpec, missingInCode := DiffActions(actions, specActions)
	if len(missingInSpec) != 0 || len(missingInCode) != 0 {
		t.Fatalf("白名单动作不一致：spec 缺 %v / 代码缺 %v", missingInSpec, missingInCode)
	}
}

func TestSelfCheckNormalizePath(t *testing.T) {
	cases := map[string]string{
		"/tg-api/payment/status/:chargeId": "/tg-api/payment/status/{chargeId}",
		"/tg-api/addr/shared/:token":       "/tg-api/addr/shared/{token}",
		"/tg-api/fb/:service/:action":      "/tg-api/fb/{service}/{action}",
		"/tg-api/health":                   "/tg-api/health",
		"/tg-api/services":                 "/tg-api/services",
	}
	for input, want := range cases {
		if got := NormalizePath(input); got != want {
			t.Fatalf("NormalizePath(%q) = %q，期望 %q", input, got, want)
		}
	}
}

func TestSelfCheckParseSpecIgnoresIndentNoise(t *testing.T) {
	text := strings.Join([]string{
		"openapi: 3.0.3",
		"info:",
		"  title: x",
		"paths:",
		"  /a:",
		"    get:",
		"      summary: 方法键是 4 缩进，summary 更靠右",
		"    post:",
		"  /b/{id}:",
		"    delete:",
		"components:",
		"  schemas:",
		"    get:",
		"x-fb-actions:",
		"  - 'waimai:deal'",
		"  - article:alist",
		"  - 不是动作",
	}, "\n")

	spec := ParseSpec(text)
	want := []string{"GET /a", "POST /a", "DELETE /b/{id}"}
	for _, key := range want {
		if _, found := spec.Routes[key]; !found {
			t.Fatalf("缺路由 %s，实得 %v", key, spec.Routes)
		}
	}
	// components 段里的 `get:` 不能被算成路由。
	if len(spec.Routes) != len(want) {
		t.Fatalf("路由条数应为 %d，实得 %d：%v", len(want), len(spec.Routes), spec.Routes)
	}
	if len(spec.Actions) != 2 {
		t.Fatalf("动作条数应为 2，实得 %d：%v", len(spec.Actions), spec.Actions)
	}
}

func TestSelfCheckDiffRoutesAllSemantics(t *testing.T) {
	code := []string{"ALL /tg-api/fb/{service}/{action}", "GET /x"}
	// spec 里该路径只要有一个方法就算「有文档」。
	missingInSpec, missingInCode := DiffRoutes(code, []string{"POST /tg-api/fb/{service}/{action}", "GET /x"})
	if len(missingInSpec) != 0 || len(missingInCode) != 0 {
		t.Fatalf("ALL 语义应放行：%v / %v", missingInSpec, missingInCode)
	}

	missingInSpec, _ = DiffRoutes(code, []string{"GET /x"})
	if len(missingInSpec) != 1 || missingInSpec[0] != "ALL /tg-api/fb/{service}/{action}" {
		t.Fatalf("路径完全没文档时必须报出，实得 %v", missingInSpec)
	}

	// 反向：spec 有方法、代码只有 ALL 该路径 → 不算缺失。
	_, missingInCode = DiffRoutes([]string{"ALL /y"}, []string{"GET /y", "PUT /y"})
	if len(missingInCode) != 0 {
		t.Fatalf("代码用 ALL 覆盖的路径不该报缺失，实得 %v", missingInCode)
	}
}
