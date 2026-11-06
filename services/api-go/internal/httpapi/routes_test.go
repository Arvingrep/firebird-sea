// 路由前缀与生产配置的正式测试套件。
// 翻译自 services/api/test/route-prefix-config.test.js 的 3 条「源码正则」用例
// （原文件 8 条中的 AC1 路由前缀、AC2 mock-webhook 生产不注册、AC3 Helm 密钥注入）。
//
// 为什么是「重写」而不是逐字翻译：Node 那 3 条靠对 server.js 做文本正则
// （`app.use('/tg-api', router)`、`NODE_ENV !== 'production') router.post(...)`），
// Go 侧没有同构的源码形状。断言意图被保留，手段换成结构性事实：
//   - 「路由都挂在 /tg-api 下」→ 直接查 httpapi.Routes() 的路由表；
//   - 「production 不注册 mock-webhook」→ 真的发一次请求，看 mux 是否 404（比正则强）；
//   - 「Helm 用 Secret 注入密钥」→ 仍然读同一个模板文件（那是运维产物，不是 Go 代码）。
//
// 原文件剩下的 4 条（config.js 的生产配置校验 ×4）在 Go 侧没有对应实体：config 校验由
// cmd/api 的启动期检查承担，不计入本文件的翻译覆盖率。第 8 条（ingressroute 的 PathPrefix）
// 见下方 TestRoutePrefixConfig/AC1 边缘路由归属用例 —— 它读的是 k8s 清单，不是 Go 代码。
package httpapi

import (
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

const (
	routesHelmDeployment  = "../../../../deploy/helm/firebird-site/templates/deployment-api.yaml"
	routesIngressTemplate = "../../../../deploy/helm/firebird-site/templates/ingressroute.yaml"
)

// routeEnvFrom 按给定键值返回 Dep.Env；未列出的键返回空串（等价于未配置）。
func routeEnvFrom(values map[string]string) func(string) string {
	return func(key string) string { return values[key] }
}

// routeServe 发一次请求到真实 mux（带中间件），只关心状态码与响应体。
func routeServe(t *testing.T, server *Server, method, target string) (int, string) {
	t.Helper()
	recorder := httptest.NewRecorder()
	server.Handler().ServeHTTP(recorder, httptest.NewRequest(method, target, nil))
	return recorder.Code, recorder.Body.String()
}

func TestRoutePrefixConfig(t *testing.T) {
	// 这条守的是边缘路由归属，不是 Go 代码本身，但它是 /tg-api 前缀契约的第一道防线：
	// 一旦 Traefik 把 /api 交给 api 服务，PHP 网关（火鸟本体）就会被抢走命名空间；
	// 一旦 /tg-api 那条 PathPrefix 被删，所有 TMA 请求都会落到站点默认后端返 404。
	// 与 Node 用例逐字同义：match 存在 != 有 PathPrefix(`/tg-api`) 与 无 PathPrefix(`/api`)。
	t.Run("AC1 Traefik 把 /tg-api 交给 api 服务，不再占用 /api", func(t *testing.T) {
		raw, err := os.ReadFile(filepath.Clean(routesIngressTemplate))
		if err != nil {
			t.Fatalf("读取 IngressRoute 模板失败: %v", err)
		}
		manifest := string(raw)
		if !strings.Contains(manifest, "PathPrefix(`/tg-api`)") {
			t.Fatal("IngressRoute 必须把 /tg-api 前缀转给 api 服务（缺 PathPrefix(`/tg-api`)）")
		}
		// 注意判据里的右括号：`/api/fbs` 那条 deny-gateway 规则不属于「占用 /api」，
		// Node 侧正则同样要求 /api 后面紧跟反引号，两者口径一致。
		if strings.Contains(manifest, "PathPrefix(`/api`)") {
			t.Fatal("IngressRoute 不得再占用 /api（那是火鸟 PHP 网关的命名空间）")
		}
	})

	t.Run("AC1 Node 业务路由全部注册在 /tg-api 路由器下，不再直接注册 /api/*", func(t *testing.T) {
		server := NewServer(Dep{Env: routeEnvFrom(map[string]string{"NODE_ENV": "test"})})
		routes := server.Routes()
		if len(routes) == 0 {
			t.Fatal("Routes() 返回 0 条路由")
		}

		// Node 断言的是「不得出现 app.get('/api/...') 这类直接注册」。
		// 结构性地表：路由表里不能有任何以 /api/ 开头的路径——那是火鸟 PHP 网关
		// 自己的命名空间，被 Node/Go 占用就会和 PHP 抢路径。
		for _, route := range routes {
			if strings.HasPrefix(route.Path, "/api/") || route.Path == "/api" {
				t.Fatalf("%s %s 抢占了 PHP 网关的 /api 命名空间", route.Method, route.Path)
			}
			// 除探针（/ 与 /health）外，业务路由必须落在 /tg-api 或前端静态入口 /tma 下。
			if route.Path == "/" || route.Path == "/health" {
				continue
			}
			if !strings.HasPrefix(route.Path, "/tg-api") && !strings.HasPrefix(route.Path, "/tma") {
				t.Fatalf("%s %s 不在 /tg-api 前缀下", route.Method, route.Path)
			}
		}

		// 前端实际调用的 6 条业务路径必须在表里（Node 用 src.includes(`'${r}'`) 逐条查）。
		present := make(map[string]bool, len(routes))
		for _, route := range routes {
			present[route.Method+" "+route.Path] = true
		}
		for _, want := range []string{
			"POST /tg-api/auth/tg-verify",
			"GET /tg-api/services",
			"POST /tg-api/payment/create-charge",
			"GET /tg-api/payment/status/{chargeId}",
			"GET /tg-api/rates/convert",
			"GET /tg-api/wallet/coins-ph/balance",
		} {
			if !present[want] {
				t.Fatalf("缺少路由 %s（Routes() 实际：%v）", want, routes)
			}
		}
	})

	t.Run("AC2 mock-webhook 在生产环境不注册", func(t *testing.T) {
		const path = "/tg-api/payment/mock-webhook"

		// 路由表里始终留一条带条件标记的记录：契约检查要能用它解释「为什么不进 OpenAPI」。
		production := NewServer(Dep{Env: routeEnvFrom(map[string]string{"NODE_ENV": "production"})})
		found := false
		for _, route := range production.Routes() {
			if route.Path != path {
				continue
			}
			found = true
			if route.Conditional != "ENV != production" {
				t.Fatalf("%s 的条件标记 = %q，want \"ENV != production\"", path, route.Conditional)
			}
		}
		if !found {
			t.Fatalf("Routes() 应保留 %s 并标注注册条件", path)
		}

		// 但 mux 真的不注册它：请求落到 ServeMux 的默认 404。
		if status, body := routeServe(t, production, http.MethodPost, path); status != http.StatusNotFound {
			t.Fatalf("production 下 %s 必须 404，实得 %d（body=%q）", path, status, body)
		}

		// 非生产环境必须真的可达（否则「只在非生产注册」这半条断言就无从验证）。
		development := NewServer(Dep{Env: routeEnvFrom(map[string]string{"NODE_ENV": "development"})})
		status, body := routeServe(t, development, http.MethodPost, path)
		if status == http.StatusNotFound {
			t.Fatalf("非生产环境下 %s 不该 404，实得 404（body=%q）", path, body)
		}
		if !strings.Contains(body, "payment manager not configured") {
			t.Fatalf("非生产环境下 %s 应进入处理器，实得 %d（body=%q）", path, status, body)
		}
	})

	t.Run("AC3 Helm api 模板经 Secret 注入 Telegram / Coins.ph / TronGrid 密钥", func(t *testing.T) {
		raw, err := os.ReadFile(filepath.Clean(routesHelmDeployment))
		if err != nil {
			t.Fatalf("读取 Helm 模板失败: %v", err)
		}
		deployment := string(raw)
		for _, key := range []string{"TELEGRAM_BOT_TOKEN", "COINS_PH_API_KEY", "COINS_PH_API_SECRET", "TRONGRID_API_KEY"} {
			// 与 Node 逐字一致：模板里必须出现带双引号的变量名（这正好是 range 列表里的写法）。
			if !strings.Contains(deployment, `"`+key+`"`) {
				t.Fatalf("未注入 %s", key)
			}
		}
		// 密钥值必须来自 Secret 引用，不能是明文 value。
		if !strings.Contains(deployment, "secretKeyRef") {
			t.Fatal("密钥必须经 secretKeyRef 注入，不能明文写进 Deployment")
		}
	})

	// 任务书点名要求（Node 侧靠 build() 的注释约束，没有对应用例）：
	// 根路由必须写成 `GET /{$}`，否则 `GET /` 会吞掉所有未匹配路径，
	// 未注册接口返回 200 健康检查体——既骗监控也骗前端。
	t.Run("根路由精确匹配：GET / 是健康检查，未知路径一律 404", func(t *testing.T) {
		server := NewServer(Dep{Env: routeEnvFrom(map[string]string{"NODE_ENV": "test"})})

		if status, _ := routeServe(t, server, http.MethodGet, "/"); status != http.StatusOK {
			t.Fatalf("GET / status = %d, want 200", status)
		}
		for _, unknown := range []string{"/nope", "/tg-api/nope", "/api/fbs/index.php"} {
			if status, body := routeServe(t, server, http.MethodGet, unknown); status != http.StatusNotFound {
				t.Fatalf("GET %s status = %d, want 404（body=%q）", unknown, status, body)
			}
		}
	})
}
