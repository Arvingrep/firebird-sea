// OpenAPI 契约检查器的正式测试套件。
// 逐条翻译自 services/api/test/api-contract.test.js（7 条）。
//
// 检查器本身必须能被信任：如果它漏认路由，CI 会给「契约一致」的假绿，
// 比没有这道门禁更糟（和「合并表静默空集」是同一类错误）。
//
// 与 Node 版的映射要点：
//   - Node 的检查器要从 JS 源码里正则抠路由（`router.get('/x')`）；Go 侧路由是
//     httpapi.Routes() 这份声明式列表，没有「缩进写错就漏一条」的解析面。
//     第 1、6 条因此改成断言等价的结构性事实（挂载点不算路由、新增路由必被检查器揪出），
//     理由逐条写在用例里。
//   - Node 从源码文本抠 WHITELIST 的 key；Go 直接读包级导出的 map，
//     所以第 5 条改成「给定白名单 → 输出的动作集合恰好是它的 key」。
package contract

import (
	"os"
	"path/filepath"
	"sort"
	"testing"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/fbproxy"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/httpapi"
)

// contractSpecPath 从 internal/contract（services/api-go/internal/contract）回到仓库根再进 docs。
const contractSpecPath = "../../../../docs/api/openapi.yaml"

// contractExempt 是不进 OpenAPI 的路由，理由必须写清楚——否则它会变成「下一个人的漏检」。
//
//   - `/`、`/health`：app 级探针，不是对外 API；
//   - `/tma`、`/tma/`：前端静态产物入口（构建产物才有意义，随版本变化）；
//   - `/tg-api/payment/mock-webhook`：非生产的联调口子，生产根本不注册。
//
// 只豁免「代码有、spec 没有」这一个方向；反向仍然全量比对。
func contractExempt() map[string]struct{} {
	return map[string]struct{}{
		"GET /":                             {},
		"GET /health":                       {},
		"GET /tma":                          {},
		"GET /tma/":                         {},
		"POST /tg-api/payment/mock-webhook": {},
	}
}

// notYetInCode 是 openapi.yaml 已收录、Go 版尚未移植的路由。
//
// 这与 contractExempt 是相反方向：那边是「代码有、spec 本不该有」，这边是「spec 有、
// 代码还没有」。两条都不能省，否则两种漂移各有一个方向是瞎的。
//
// 登记条件是「Node 已有实现、Go 待移植」，不是「暂时不想做」。每条都必须写清来源，
// 因为这里每加一行，就是给一道门禁开一个口子；口子越多，门禁越像装饰。
//
// 移除方式：把路由实现进 httpapi.Routes() 后，从本表删掉对应行。本表与
// missingInCode 是双向核对的——实现了却不删，用例会报「清单里的路由已经存在」。
var notYetInCode = map[string]struct{}{
	// #212 骑手 Telegram 全链路（services/api/src/riderRoute.js 260 行、
	// dispatchRoute.js 247 行，含 006/008 两条迁移）。canary 上 Node 版已上线，
	// Go 版待移植；在那之前 canary 的 api.engine 必须保持 node。
	// POST /tg-api/rider/session 已移植（internal/rider），故不在本表内。
	"GET /tg-api/rider/bind":         {},
	"POST /tg-api/rider/bind":        {},
	"POST /tg-api/internal/dispatch": {},
}

// withoutNotYetInCode 从「spec 有、代码没有」的差集里剔除已登记待移植的路由，
// 只留下真正没人认领的缺口。
func withoutNotYetInCode(keys []string) []string {
	rest := make([]string, 0, len(keys))
	for _, key := range keys {
		if _, ok := notYetInCode[key]; ok {
			continue
		}
		rest = append(rest, key)
	}
	return rest
}

func loadContractSpec(t *testing.T) Spec {
	t.Helper()
	raw, err := os.ReadFile(filepath.Clean(contractSpecPath))
	if err != nil {
		t.Fatalf("读取契约文件失败: %v", err)
	}
	return ParseSpec(string(raw))
}

// codeRouteKeys 是「代码里声明的路由」，唯一来源是 httpapi.Routes()。
func codeRouteKeys() []string {
	routes := httpapi.NewServer(httpapi.Dep{}).Routes()
	keys := make([]string, 0, len(routes))
	for _, route := range routes {
		keys = append(keys, RouteKey(route.Method, route.Path))
	}
	return keys
}

func sortedSet(set map[string]struct{}) []string {
	values := make([]string, 0, len(set))
	for value := range set {
		values = append(values, value)
	}
	sort.Strings(values)
	return values
}

func TestAPIContract(t *testing.T) {
	t.Run("extractRoutes：认缩进的路由，不把 router.use 的子路由挂载算成路由", func(t *testing.T) {
		// Node 版按行正则抠 JS 源码，所以要专门验证「缩进 2 的路由也算」、
		// 「router.use 的挂载不算路由」。Go 侧没有源码解析面，但同一组保证仍可断言：
		//   ① 挂载前缀本身不得作为一条路由出现（否则比对会拿挂载点去对 spec）；
		//   ② 挂载点下面的真实路由必须都在列表里（挂载要展开成真实路由）。
		keys := codeRouteKeys()
		present := make(map[string]bool, len(keys))
		for _, key := range keys {
			present[key] = true
		}

		for _, mount := range []string{"/tg-api", "/tg-api/addr", "/tg-api/auth", "/tg-api/payment"} {
			for _, method := range []string{"GET", "POST", "PUT", "DELETE", "ALL"} {
				if present[method+" "+mount] {
					t.Fatalf("%s %s 是子路由挂载点，不是路由（Routes() 实际：%v）", method, mount, keys)
				}
			}
		}

		for _, want := range []string{
			"ALL /tg-api/fb/{service}/{action}",
			"POST /tg-api/addr/share",
			"GET /tg-api/addr/shared/{token}",
			"GET /tg-api/auth/bridge",
			"POST /tg-api/auth/bridge",
			"POST /tg-api/checkout",
		} {
			if !present[want] {
				t.Fatalf("缺少路由 %s（Routes() 实际：%v）", want, keys)
			}
		}
	})

	t.Run("normalizePath：Express :id 与 OpenAPI {id} 归一", func(t *testing.T) {
		if got := NormalizePath("/payment/status/:chargeId"); got != "/payment/status/{chargeId}" {
			t.Fatalf("NormalizePath 结果 = %q", got)
		}
		// 已是 OpenAPI 写法，不应二次改写。
		if got := NormalizePath("/a/{b}/c"); got != "/a/{b}/c" {
			t.Fatalf("已是 OpenAPI 写法的路径不该被改写，实得 %q", got)
		}
	})

	t.Run("parseSpec：按缩进取路径/方法，并单独取 x-fb-actions", func(t *testing.T) {
		spec := ParseSpec(`openapi: 3.0.3
paths:
  /tg-api/health:
    get:
      summary: x
  /tg-api/deal:
    post:
      summary: y
    get:
      summary: z
x-fb-actions:
  - 'waimai:deal'
  - waimai:order
components:
  securitySchemes:
    bearerAuth:
      type: http`)

		wantRoutes := []string{"GET /tg-api/deal", "GET /tg-api/health", "POST /tg-api/deal"}
		if got := sortedSet(spec.Routes); !equalStrings(got, wantRoutes) {
			t.Fatalf("routes = %v，want %v", got, wantRoutes)
		}
		// 带引号与不带引号都要认（yaml 两种都合法），但 components 下的键不能混进来。
		wantActions := []string{"waimai:deal", "waimai:order"}
		if got := sortedSet(spec.Actions); !equalStrings(got, wantActions) {
			t.Fatalf("actions = %v，want %v", got, wantActions)
		}
	})

	t.Run("diffRoutes：两个方向都要报，router.all 只要有任一个方法就算有文档", func(t *testing.T) {
		missingInSpec, missingInCode := DiffRoutes(
			[]string{"GET /a", "POST /b", "ALL /fb/{service}/{action}"},
			[]string{"GET /a", "GET /fb/{service}/{action}", "POST /gone"},
		)
		if !equalStrings(missingInSpec, []string{"POST /b"}) {
			t.Fatalf("missingInSpec = %v，want [POST /b]", missingInSpec)
		}
		if !equalStrings(missingInCode, []string{"POST /gone"}) {
			t.Fatalf("missingInCode = %v，want [POST /gone]", missingInCode)
		}

		// all 只写了 get 也算覆盖（不强迫把 5 个方法都写一遍）。
		covered, _ := DiffRoutes([]string{"ALL /fb/{s}/{a}"}, []string{"DELETE /fb/{s}/{a}"})
		if len(covered) != 0 {
			t.Fatalf("ALL 语义应放行，实得 missingInSpec = %v", covered)
		}
		// 但该路径一个方法都没有 → 等于没文档。
		uncovered, _ := DiffRoutes([]string{"ALL /fb/{s}/{a}"}, []string{"GET /other"})
		if !equalStrings(uncovered, []string{"ALL /fb/{s}/{a}"}) {
			t.Fatalf("路径完全没文档时必须报出，实得 %v", uncovered)
		}
	})

	t.Run("extractWhitelistActions：只取 WHITELIST 块内的 key，不误吃别处的常量", func(t *testing.T) {
		// Node 从源码文本抠 key；Go 直接读包级导出的 map —— 但这不等于放宽：
		// 断言「输出的动作集合恰好等于该 map 的 key（排序后）且不含别处的键」，
		// 正好覆盖 Node 用例的两条：只取 WHITELIST 块、不误吃 OTHER 常量。
		whitelist := fbproxy.Whitelist{
			"waimai:shopList": {Auth: "anonymous", Params: []string{"page"}},
			"waimai:deal":     {Auth: "member", Write: true},
		}
		// 另起一个常量块，它的键绝不能被算进动作清单。
		other := map[string]int{"nope:nope": 1}

		got := ExtractWhitelistActions(whitelist)
		if !equalStrings(got, []string{"waimai:deal", "waimai:shopList"}) {
			t.Fatalf("actions = %v，want [waimai:deal waimai:shopList]", got)
		}
		for key := range other {
			for _, action := range got {
				if action == key {
					t.Fatalf("别处的常量 %q 不该出现在动作清单里：%v", key, got)
				}
			}
		}
	})

	t.Run("unregisteredRouteFiles：新写的路由文件没登记挂载前缀要被揪出来", func(t *testing.T) {
		// Go 侧没有「路由文件」这一层：所有路由都在 httpapi.Routes() 里一次性声明，
		// 「新文件忘了登记挂载前缀」在结构上不可能发生。残留的风险变成了
		// 「往 Routes() 加了一条却没写进 spec」——必须由检查器揪出来，
		// 否则加接口就能悄悄绕过契约门禁。这条用例验的就是这个方向。
		spec := loadContractSpec(t)
		code := codeRouteKeys()
		rogue := append(append([]string{}, code...), "GET /tg-api/rogue")

		missingInSpec, missingInCode := DiffRoutes(rogue, sortedSet(spec.Routes))
		if !containsString(missingInSpec, "GET /tg-api/rogue") {
			t.Fatalf("新加但未写进 spec 的路由必须报出，实得 missingInSpec = %v", missingInSpec)
		}
		if rest := withoutNotYetInCode(missingInCode); len(rest) != 0 {
			t.Fatalf("反向不该因为多一条代码路由而报错，实得 %v", rest)
		}
	})

	t.Run("本仓库当前状态：路由与白名单已全部收录进 openapi.yaml", func(t *testing.T) {
		spec := loadContractSpec(t)
		code := codeRouteKeys()

		// 先确认解析器没坏：两边都空时「零差异」是假绿。
		if len(spec.Routes) == 0 {
			t.Fatal("spec 解析出 0 条路由，解析器或缩进约束已失效")
		}
		if len(code) == 0 {
			t.Fatal("httpapi.Routes() 返回 0 条路由")
		}

		missingInSpec, missingInCode := DiffRoutes(code, sortedSet(spec.Routes))
		if rest := withoutNotYetInCode(missingInCode); len(rest) != 0 {
			t.Fatalf("spec 有、代码没有（已排除 %d 条待移植路由）：%v", len(notYetInCode), rest)
		}
		// 待移植清单也要真的用得上：实现完却不删，这道口子会变成永久豁免，
		// 后续任何人新增路由都能「反正清单里已经有一堆」而蒙混过去。
		if len(missingInCode) != len(notYetInCode) {
			t.Fatalf("待移植清单应恰好命中 %d 条，实得 %v（实现了就把对应行从 notYetInCode 删掉）",
				len(notYetInCode), missingInCode)
		}

		exempt := contractExempt()
		unexpected := make([]string, 0, len(missingInSpec))
		for _, key := range missingInSpec {
			if _, ok := exempt[key]; ok {
				continue
			}
			unexpected = append(unexpected, key)
		}
		if len(unexpected) != 0 {
			t.Fatalf("代码有、spec 缺（已排除 %d 条口径外路由）：%v", len(exempt), unexpected)
		}
		// 豁免清单本身也要真的用得上：一条都没命中说明 specPath 指错了文件。
		if len(missingInSpec) != len(exempt) {
			t.Fatalf("口径外路由应恰好命中 %d 条，实得 %v", len(exempt), missingInSpec)
		}
		// 豁免的路由反过来也不能出现在 spec 里：那是把内部接口当对外契约发布了。
		for key := range exempt {
			if _, found := spec.Routes[key]; found {
				t.Fatalf("%s 不该出现在 openapi.yaml 里", key)
			}
		}

		// 白名单动作同样双向零差异（新增一条白名单就是多一条潜在资金路径）。
		actions := ExtractWhitelistActions(fbproxy.DefaultWhitelist())
		if len(actions) != 16 {
			t.Fatalf("白名单动作应为 16 条，实际 %d：%v", len(actions), actions)
		}
		if len(spec.Actions) == 0 {
			t.Fatal("spec 解析出 0 条 x-fb-actions，解析器或缩进约束已失效")
		}
		actionsMissingInSpec, actionsMissingInCode := DiffActions(actions, sortedSet(spec.Actions))
		if len(actionsMissingInSpec) != 0 || len(actionsMissingInCode) != 0 {
			t.Fatalf("白名单动作不一致：spec 缺 %v / 代码缺 %v", actionsMissingInSpec, actionsMissingInCode)
		}
	})
}

func equalStrings(got, want []string) bool {
	if len(got) != len(want) {
		return false
	}
	for index := range got {
		if got[index] != want[index] {
			return false
		}
	}
	return true
}

func containsString(values []string, want string) bool {
	for _, value := range values {
		if value == want {
			return true
		}
	}
	return false
}
