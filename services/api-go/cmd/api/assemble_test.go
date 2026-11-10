// 装配完整性自检（package main）。
//
// 这一层是 B1 的直接回归：那次漏接的 `checkout.GetRate` 不是逻辑错，而是「少填一个字段」——
// 编译器、vet、任何单包测试都不会报（依赖在包里都是可选注入，nil 会静默降级成 503/401），
// 只有装配层的断言能拦住。所以这里不只断言「现在是对的」，还逐项做差分：
// 把每个依赖打成 nil，断言 validateAssembly 一定会报错。
package main

import (
	"database/sql"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/bridge"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/coins"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/httpapi"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/payment"
)

// assembly 是测试用的一次性装配结果，字段与 run() 里的 dep 一一对应。
type assembly struct {
	bundle *authBundle
	dep    httpapi.Dep
	bridge *bridge.Route
}

// buildTestAssembly 走真实装配函数（不是手搭结构体）：只有真跑一遍 buildAuth /
// buildBridge / buildAddrShare / buildFBProxy，才能证明「这些函数填的字段」和
// validateAssembly 检查的字段是同一组。手搭结构体的话，两边同时删一个字段仍然全绿。
func buildTestAssembly(t *testing.T) assembly {
	t.Helper()

	// 让 buildAuth 走「全配置」分支；值本身不重要，非空即可。
	t.Setenv("TMA_TOKEN_SECRET", "0123456789abcdef0123456789abcdef")
	t.Setenv("TMA_ENV", "test")
	t.Setenv("FBS_GATEWAY_URL", "https://gateway.example.com")
	t.Setenv("FBS_GATEWAY_SECRET", "gw-secret")
	t.Setenv("FB_UPSTREAM_URL", "https://upstream.example.com")
	t.Setenv("TMA_BRIDGE_COOKIE_DOMAIN", ".example.com")

	db, _, err := sqlmock.New()
	if err != nil {
		t.Fatalf("sqlmock: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })

	now := func() time.Time { return time.Unix(1700000000, 0) }
	botToken := "123456:TEST"

	bundle, err := buildAuth(db, botToken, now)
	if err != nil {
		t.Fatalf("buildAuth: %v", err)
	}
	if bundle == nil {
		t.Fatal("配置齐全时 buildAuth 不该返回 nil")
	}
	t.Cleanup(bundle.stop)

	bridgeRoute, err := buildBridge(bundle, botToken, 0, now)
	if err != nil {
		t.Fatalf("buildBridge: %v", err)
	}
	addrRouter, err := buildAddrShare(bundle, db, botToken, 0, now)
	if err != nil {
		t.Fatalf("buildAddrShare: %v", err)
	}
	proxy, err := buildFBProxy(bundle, now)
	if err != nil {
		t.Fatalf("buildFBProxy: %v", err)
	}
	coinsClient := coins.New(coins.Dep{Now: now})
	checkoutHandler, err := buildCheckout(db, coinsClient, botToken, now)
	if err != nil {
		t.Fatalf("buildCheckout: %v", err)
	}

	dep := httpapi.Dep{
		Env:            os.Getenv,
		Now:            now,
		DB:             db,
		BotToken:       botToken,
		Auth:           bundle.httpAuth(),
		Payments:       payment.New(payment.Dep{Now: now}),
		Coins:          coinsClient,
		Checkout:       checkoutHandler,
		Bridge:         bridgeRoute,
		Addr:           addrRouter,
		FBProxy:        proxy,
		Rider:          buildRider(db, botToken, 0, now),
		Merchant:       buildMerchant(botToken, 0, now),
		Dispatch:       buildDispatch(db, botToken, now),
		Ajax:           buildAjax(),
		TrustProxyHops: 0,
	}
	return assembly{bundle: bundle, dep: dep, bridge: bridgeRoute}
}

// TestSelfCheckAssemblyIsComplete 断言全配置下每个可注入依赖都真的接上了。
func TestSelfCheckAssemblyIsComplete(t *testing.T) {
	built := buildTestAssembly(t)

	if err := validateAssembly(built.bundle, built.dep); err != nil {
		t.Fatalf("完整装配不该报错：%v", err)
	}

	// 逐个点名，失败信息能直接指出是哪一处没接上（而不是「整块装配错了」）。
	if built.bundle.login == nil {
		t.Fatal("loginService 未装配")
	}
	if built.bundle.tokens == nil {
		t.Fatal("tokens（addrshare 也用这个）未装配")
	}
	if built.bundle.creds == nil || credentialProviderOf(built.bundle) == nil {
		t.Fatal("credentialProvider（fbproxy 会员接口依赖它）未装配")
	}
	if built.dep.Checkout == nil {
		t.Fatal("Checkout handler 未装配")
	}
	if built.dep.Addr == nil {
		t.Fatal("addrshare router 未装配")
	}
	if built.bridge == nil {
		t.Fatal("登录桥未装配")
	}
}

// TestSelfCheckAssemblyRejectsEachMissingDependency 做差分：任一项打成 nil 都必须报错。
// 没有这组用例，validateAssembly 可能整条被删掉而测试仍然全绿。
func TestSelfCheckAssemblyRejectsEachMissingDependency(t *testing.T) {
	built := buildTestAssembly(t)

	cases := map[string]struct {
		mutate func(*httpapi.Dep)
		want   string
	}{
		"缺 Checkout": {func(d *httpapi.Dep) { d.Checkout = nil }, "Checkout"},
		"缺 Coins":    {func(d *httpapi.Dep) { d.Coins = nil }, "Coins"},
		"缺 Payments": {func(d *httpapi.Dep) { d.Payments = nil }, "Payments"},
		"缺 BotToken": {func(d *httpapi.Dep) { d.BotToken = "" }, "BotToken"},
		"缺 Auth":     {func(d *httpapi.Dep) { d.Auth = nil }, "Auth"},
		"缺 Auth.Login": {func(d *httpapi.Dep) {
			d.Auth = &httpapi.Auth{Tokens: d.Auth.Tokens, Credentials: d.Auth.Credentials}
		}, "Auth.Login"},
		"缺 Auth.Credentials": {func(d *httpapi.Dep) {
			d.Auth = &httpapi.Auth{Login: d.Auth.Login, Tokens: d.Auth.Tokens}
		}, "Auth.Credentials"},
		"缺 Addr":     {func(d *httpapi.Dep) { d.Addr = nil }, "Addr"},
		"缺 Rider":    {func(d *httpapi.Dep) { d.Rider = nil }, "Rider"},
		"缺 Merchant": {func(d *httpapi.Dep) { d.Merchant = nil }, "Merchant"},
		"缺 Dispatch": {func(d *httpapi.Dep) { d.Dispatch = nil }, "Dispatch"},
		"缺 Ajax":     {func(d *httpapi.Dep) { d.Ajax = nil }, "Ajax"},
	}
	for name, item := range cases {
		t.Run(name, func(t *testing.T) {
			dep := built.dep
			item.mutate(&dep)
			err := validateAssembly(built.bundle, dep)
			if err == nil {
				t.Fatalf("%s 必须被拦下", name)
			}
			if !strings.Contains(err.Error(), item.want) {
				t.Fatalf("错误信息应点名 %s，实际：%v", item.want, err)
			}
		})
	}
}

// TestSelfCheckAssemblyDegradesWithoutAuth 记录降级口径：auth 未装配时
// 只要求「必选依赖齐」，登录相关端点由各自的 503/401 守卫处理，不算装配错误。
func TestSelfCheckAssemblyDegradesWithoutAuth(t *testing.T) {
	var nilDB *sql.DB
	now := time.Now
	dep := httpapi.Dep{
		Env:      os.Getenv,
		Now:      now,
		DB:       nilDB,
		BotToken: "123456:TEST",
		Payments: payment.New(payment.Dep{Now: now}),
		Coins:    coins.New(coins.Dep{Now: now}),
		Checkout: func(http.ResponseWriter, *http.Request) {},
		Rider:    buildRider(nilDB, "123456:TEST", 0, now),
		Merchant: buildMerchant("123456:TEST", 0, now),
		Dispatch: buildDispatch(nilDB, "123456:TEST", now),
		Ajax:     buildAjax(),
	}
	if err := validateAssembly(nil, dep); err != nil {
		t.Fatalf("无 auth 的降级装配不该报错：%v", err)
	}
}

// TestSelfCheckAssemblyAllowsNoDatabase 钉住「无库启动」这条文档化模式真的可达。
//
// 背景（Ray 复审 N2）：validateAssembly 曾经**无条件**要求 Checkout != nil，于是
// 「DB_HOST 不设」的进程一定 exit 1 —— 步骤 2 的 db_skipped 日志、buildCheckout 的
// (nil,nil) 分支、server 的 `if s.checkout != nil`、以及
// internal/httpapi/checkout_mount_test.go 里那条 404 用例，在生产路径上全部不可达。
// 注释写着「支持无库启动」，代码说不支持，两边只能有一边是真的。
//
// 这里同时断言三层，缺一层都可能让「可达」重新变回空话：
//  1. buildCheckout 无库时返回 (nil, nil)（不注册）；
//  2. validateAssembly 放行（进程能起来）；
//  3. 进程级 handler 对外表现为 /health 200 + /tg-api/checkout 404（与 Node 同形）。
func TestSelfCheckAssemblyAllowsNoDatabase(t *testing.T) {
	var nilDB *sql.DB // 与 run() 里「DB_HOST 未设置」时同形：nil *sql.DB，不是空结构
	now := func() time.Time { return time.Unix(1700000000, 0) }

	checkoutHandler, err := buildCheckout(nilDB, coins.New(coins.Dep{Now: now}), "123456:TEST", now)
	if err != nil {
		t.Fatalf("无库时 buildCheckout 不该报错（只该降级成不注册）：%v", err)
	}
	if checkoutHandler != nil {
		t.Fatal("无库时不应构造出收银台 handler")
	}

	dep := httpapi.Dep{
		Env:      os.Getenv,
		Now:      now,
		DB:       nilDB,
		BotToken: "123456:TEST",
		Payments: payment.New(payment.Dep{Now: now}),
		Coins:    coins.New(coins.Dep{Now: now}),
		Checkout: nil,
		Rider:    buildRider(nilDB, "123456:TEST", 0, now),
		Merchant: buildMerchant("123456:TEST", 0, now),
		Dispatch: buildDispatch(nilDB, "123456:TEST", now),
		Ajax:     buildAjax(),
	}
	if err := validateAssembly(nil, dep); err != nil {
		t.Fatalf("无库启动是文档化模式，装配校验不该拦：%v", err)
	}

	handler := httpapi.NewServer(dep).Handler()
	if got := probeStatus(handler, http.MethodGet, "/health", ""); got != http.StatusOK {
		t.Fatalf("无库启动后 /health 应 200，实得 %d", got)
	}
	if got := probeStatus(handler, http.MethodPost, "/tg-api/checkout", `{"ordernum":"ORD123456"}`); got != http.StatusNotFound {
		t.Fatalf("无库启动时 /tg-api/checkout 应 404（路由未注册），实得 %d", got)
	}

	// 差分对照：把库放回去、handler 仍为 nil，就必须被拦下。
	// 没有这一半，「无库放行」会被误写成「Checkout 永远可选」。
	withDB := dep
	withDB.DB = new(sql.DB)
	if err := validateAssembly(nil, withDB); err == nil {
		t.Fatal("有库却没接上收银台必须报错（这正是 B1 那类静默 503 的入口）")
	} else if !strings.Contains(err.Error(), "Checkout") {
		t.Fatalf("错误信息应点名 Checkout，实际：%v", err)
	}
}

// probeStatus 发一次请求并只取状态码；body 非空时按 JSON 提交。
func probeStatus(handler http.Handler, method, path, body string) int {
	var reader io.Reader
	if body != "" {
		reader = strings.NewReader(body)
	}
	request := httptest.NewRequest(method, path, reader)
	if body != "" {
		request.Header.Set("Content-Type", "application/json")
	}
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)
	return recorder.Code
}
