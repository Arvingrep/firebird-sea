// 装配层契约护栏，不是临时自检：`main` 包的接缝没有别的测试能覆盖 ——
// 各包的单测都自己注入依赖，永远走不到「装配时少填一个字段」这条路径。
// 这里钉住的是 checkoutDep 的注入完整性、buildCheckout 的无库降级，以及降级后
// 真实的对外表现（不是断言结构体等于自己）。合并前不要按临时文件删。
package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"regexp"
	"strings"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/checkout"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/coins"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/tgauth"
)

// TestSelfCheckCheckoutDepWiresRateSource 是装配级守卫，防的是「可注入依赖被漏接」。
//
// 为什么必须有这条：checkout 的汇率源是注入进来的，漏接不会编译失败、也不会让任何一个
// 包的测试变红 —— 它只表现为「生产环境每笔新订单第一次收银台请求都 503 RATE_UNAVAILABLE」
// （fetchRate 拿到 nil source 直接返回 RATE_UNAVAILABLE）。internal/checkout 的用例全都
// 自己注入 GetRate，永远走不到 nil 分支；internal/httpapi 没有 checkout 用例；cmd/api 零测试
// —— 三处加起来正好是盲区，而 20 个包的 `go test ./...` 全绿也照不出来。
func TestSelfCheckCheckoutDepWiresRateSource(t *testing.T) {
	db := new(sql.DB)
	client := coins.New(coins.Dep{})
	now := func() time.Time { return time.UnixMilli(1700000000000) }

	dep, err := checkoutDep(db, client, "bot-token", now)
	if err != nil {
		t.Fatalf("完整依赖不应报错：%v", err)
	}
	if dep.GetRate == nil {
		t.Fatal("checkout 没有汇率源：生产装配下新订单必然 503 RATE_UNAVAILABLE")
	}
	// 其余依赖同样逐个点名：它们被删掉时同样是静默降级（不建单 / 验签恒失败 / 时间不可注入）。
	if dep.DB != db {
		t.Fatal("checkout 未拿到业务连接池")
	}
	if dep.BotToken != "bot-token" {
		t.Fatalf("checkout 未拿到 bot token：%q", dep.BotToken)
	}
	if dep.Now == nil {
		t.Fatal("checkout 未拿到时钟")
	}
	if dep.Env == nil {
		t.Fatal("checkout 未拿到 env 读取函数")
	}
}

// TestSelfCheckCheckoutDepFailsFast 记录「配错就启动失败」的三条边界。
// 只缺数据库是文档化的降级（本地裸跑），单独用 errCheckoutNoDB 区分。
func TestSelfCheckCheckoutDepFailsFast(t *testing.T) {
	now := time.Now
	// 缺数据库：不是配置错，是支持的裸跑模式，调用方据此不注册路由。
	if _, err := checkoutDep(nil, coins.New(coins.Dep{}), "bot", now); !errors.Is(err, errCheckoutNoDB) {
		t.Fatalf("缺数据库应返回 errCheckoutNoDB，实得 %v", err)
	}
	// 缺 coins 客户端：汇率源无法构造 → 这正是 B1 的成因，必须启动即失败。
	if _, err := checkoutDep(new(sql.DB), nil, "bot", now); err == nil {
		t.Fatal("缺 coins 客户端必须报错（否则每笔新订单 503）")
	}
	// 缺 bot token：initData 无法验签，收银台会变成「人人 401」。
	if _, err := checkoutDep(new(sql.DB), coins.New(coins.Dep{}), "", now); err == nil {
		t.Fatal("缺 bot token 必须报错")
	}
	// buildCheckout 对「只缺库」返回 (nil, nil)，让 run() 走「不注册」而不是 exit 1。
	handler, err := buildCheckout(nil, coins.New(coins.Dep{}), "bot", now)
	if err != nil || handler != nil {
		t.Fatalf("缺库时应 (nil, nil)，实得 (%v, %v)", handler, err)
	}
}

// depthTransport 让 coins.Client 返回固定盘口，不需要真实打 Coins.ph。
type depthTransport struct{}

func (depthTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	return &http.Response{
		StatusCode: http.StatusOK,
		Header:     http.Header{"Content-Type": []string{"application/json"}},
		Body: io.NopCloser(strings.NewReader(
			`{"symbol":"USDTPHP","lastUpdateId":1,"bids":[["62.50","100"]],"asks":[["62.60","80"]]}`)),
		Request: req,
	}, nil
}

// probeCheckout 用真实 checkout 路由跑一次 /checkout，返回状态码与响应体。
//
// wired=false 时把 dep.GetRate 打回 nil —— 这不是「造一个假状态」，而是精确复现 B1 的现场：
// 当时 checkoutDep 既没填 GetRate 也没填 CoinsClient，checkout 包据此把 getRate 留成 nil。
func probeCheckout(t *testing.T, wired bool) (int, string) {
	t.Helper()
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("sqlmock: %v", err)
	}
	defer func() { _ = db.Close() }()

	mock.ExpectQuery(regexp.QuoteMeta(
		"SELECT amount, uid, state FROM `huoniao_pay_log` WHERE ordernum = ? ORDER BY id DESC LIMIT 1")).
		WithArgs("ORD123456").
		WillReturnRows(sqlmock.NewRows([]string{"amount", "uid", "state"}).AddRow("100.00", int64(42), "0"))
	mock.ExpectQuery(regexp.QuoteMeta(
		"SELECT member_id FROM fbs_member_map WHERE tg_user_id = ? LIMIT 1")).
		WithArgs("777").
		WillReturnRows(sqlmock.NewRows([]string{"member_id"}).AddRow(int64(42)))
	mock.ExpectQuery(regexp.QuoteMeta(
		"SELECT id, ordernum, payable_micro, rate_str, rate_at, expires_at, state FROM fbs_charge WHERE ordernum = ? LIMIT 1")).
		WithArgs("ORD123456").
		WillReturnRows(sqlmock.NewRows([]string{"id", "ordernum", "payable_micro", "rate_str", "rate_at", "expires_at", "state"}))

	client := coins.New(coins.Dep{
		HTTPClient: &http.Client{Transport: depthTransport{}},
		Now:        func() time.Time { return time.Unix(1700000000, 0) },
	})
	dep, err := checkoutDep(db, client, "bot", func() time.Time { return time.Unix(1700000000, 0) })
	if err != nil {
		t.Fatalf("checkoutDep: %v", err)
	}
	if !wired {
		dep.GetRate = nil
	}
	// 本用例故意让写入阶段失败（没喂语句），把那条结构化错误日志咽掉，避免污染测试输出。
	dep.Logger = func(string) {}
	dep.ValidateInitData = func(string, string) tgauth.Result {
		return tgauth.Result{
			Valid:    true,
			AuthDate: 1700000000,
			User:     &tgauth.User{ID: 777, Raw: json.RawMessage(`{"id":777}`)},
		}
	}
	route := checkout.NewRoute(dep)

	request := httptest.NewRequest(http.MethodPost, "/tg-api/checkout",
		strings.NewReader(`{"ordernum":"ORD123456","initData":"stub"}`))
	request.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()
	route(recorder, request)
	return recorder.Code, recorder.Body.String()
}

// TestSelfCheckCheckoutRateResolvesThroughWiredClient 是本轮 blocker 的回归护栏（差分式）。
//
// 两条分支唯一差别就是「有没有把 coinsClient 传进 checkoutDep」：
//   - 传了 → 汇率源存在，请求能越过取价那一步（随后因为本用例没喂写入语句而 500 INTERNAL，
//     这里不关心状态码细节，只断言「不再是 RATE_UNAVAILABLE」）；
//   - 没传 → checkout/route.go 的回落条件 `GetRate == nil && CoinsClient != nil` 不成立，
//     r.getRate 保持 nil，fetchRate 立刻返回 RATE_UNAVAILABLE → 503。
//
// 差分的形式让这条用例自己证明「503 确实是漏接造成的」，而不是随便断言一个 200。
func TestSelfCheckCheckoutRateResolvesThroughWiredClient(t *testing.T) {
	t.Setenv("CHECKOUT_ENABLED", "1")
	t.Setenv("TRON_MASTER_RECEIVE_ADDRESS", "TW4Q8tq6U1z3wWkEXAMPLETRONADDR9999")

	code, body := probeCheckout(t, true)
	if code == http.StatusServiceUnavailable && strings.Contains(body, "RATE_UNAVAILABLE") {
		t.Fatalf("装配了 coinsClient 却仍然拿不到汇率：%d %s", code, body)
	}

	code, body = probeCheckout(t, false)
	if code != http.StatusServiceUnavailable || !strings.Contains(body, "RATE_UNAVAILABLE") {
		t.Fatalf("未装配汇率源时应 503 RATE_UNAVAILABLE（这就是 B1 的原始症状），实得 %d %s", code, body)
	}
}
