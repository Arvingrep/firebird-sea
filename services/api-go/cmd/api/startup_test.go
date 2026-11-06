// 「无库启动」的正式用例（Ray 复审 N2 的收口）。
//
// 背景：validateAssembly 曾经**无条件**要求 Checkout != nil，于是「DB_HOST 不设」的进程必
// exit 1。注释写着「支持无库启动」，代码说不支持；连带让
// internal/httpapi 里那条「未装配收银台 → 404」的用例在生产路径上不可达。
//
// 实现方已把判据改成 `dep.DB != nil && dep.Checkout == nil`。这条用例守的就是这个判据本身，
// 同时断言「进程级 handler 对外真的是 /health 200 + /tg-api/checkout 404」——
// 只测 validateAssembly 会漏掉后一半（放行了却没建出可用 server）。
//
// 与 assemble_test.go 的关系：那边是逐项差分的临时自检；这里只钉「无库启动」这一条契约，
// 命名用业务语义，且不引用自检里的任何辅助函数（自检删除后这里仍能独立编译）。
package main

import (
	"database/sql"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/coins"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/httpapi"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/payment"
)

// startupDep 返回「无库启动」时的装配形态：DB 是 nil *sql.DB（与 run() 里
// DB_HOST 未设置时同形，不是空结构），收银台不注册。
//
// 骑手 session 也走真实装配函数：无库时它是 notConfigured（端点 503），
// 但 route 本身必须存在 —— 装配层不允许「依赖没接上」以 nil 的形式溜过去。
func startupDep(now func() time.Time) httpapi.Dep {
	return httpapi.Dep{
		Env:      func(string) string { return "" },
		Now:      now,
		DB:       nil,
		BotToken: "123456:TEST",
		Payments: payment.New(payment.Dep{Now: now}),
		Coins:    coins.New(coins.Dep{Now: now}),
		Checkout: nil,
		Rider:    buildRider(nil, "123456:TEST", now),
		Logf:     func(string) {},
	}
}

// startupStatus 发一次请求并只取状态码；body 非空时按 JSON 提交。
func startupStatus(handler http.Handler, method, path, body string) int {
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

func TestServerStartsWithNoDatabase(t *testing.T) {
	now := func() time.Time { return time.Unix(1700000000, 0) }

	t.Run("无库时 buildCheckout 返回 nil：收银台不注册而不是半个路由", func(t *testing.T) {
		handler, err := buildCheckout(nil, coins.New(coins.Dep{Now: now}), "123456:TEST", now)
		if err != nil {
			t.Fatalf("无库时 buildCheckout 不该报错（只该降级成不注册）：%v", err)
		}
		if handler != nil {
			t.Fatal("无库时不该构造出收银台 handler")
		}
	})

	t.Run("validateAssembly 放行无库启动，但有库漏接仍必须报错", func(t *testing.T) {
		dep := startupDep(now)
		if err := validateAssembly(nil, dep); err != nil {
			t.Fatalf("无库启动是文档化支持的模式，装配校验不该拦：%v", err)
		}
		// 差分对照：没有这一半，「无库放行」会被写成「Checkout 永远可选」，
		// 而 B1 那类静默 503 正是「有库却没接上」。
		withDB := dep
		withDB.DB = new(sql.DB)
		err := validateAssembly(nil, withDB)
		if err == nil {
			t.Fatal("有库却没接上收银台必须被拦下")
		}
		if !strings.Contains(err.Error(), "Checkout") {
			t.Fatalf("错误信息应点名 Checkout，实际：%v", err)
		}
	})

	t.Run("无库启动后 /health 仍 200，/tg-api/checkout 为 404", func(t *testing.T) {
		handler := httpapi.NewServer(startupDep(now)).Handler()
		if got := startupStatus(handler, http.MethodGet, "/health", ""); got != http.StatusOK {
			t.Fatalf("无库启动后 /health 应 200（探活不能依赖数据库），实得 %d", got)
		}
		if got := startupStatus(handler, http.MethodPost, "/tg-api/checkout", `{"ordernum":"ORD123456"}`); got != http.StatusNotFound {
			t.Fatalf("无库启动时 /tg-api/checkout 应 404（路由未注册），实得 %d", got)
		}
	})
}
