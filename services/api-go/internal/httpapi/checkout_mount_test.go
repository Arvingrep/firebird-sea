// 装配级测试：收银台在 httpapi 这一层是否真的挂上，并把请求完整送到「建单成功」。
//
// 为什么单独需要这一层（三层各测一段，谁都不能替代谁）：
//   - internal/checkout 的用例直连 checkout.NewRoute，绕过 httpapi.wrap 的 body 解析，
//     也测不到「有没有挂到 mux 上」；
//   - cmd/api 的自检只看装配函数的返回值（checkoutDep 有没有拿到 coins 客户端 / GetRate），
//     不经过 mux，也不经过 body 解析；
//   - 「POST /tg-api/checkout 打进来到底会发生什么」只有这里能回答。
//
// 历史背景：生产装配曾漏接汇率源，症状是每笔新订单恒定 503 RATE_UNAVAILABLE，而 20 个包的
// go test ./... 全绿照不出来 —— 因为没有任何一条用例从装配入口打过这个路径。
//
// 断言口径（第一版踩过的坑）：不要断言「某个 500」。写入阶段任何故障（SQL 文本改了、
// 参数错位、事务没开）都会让 handler 回 500 INTERNAL，测试照样绿。所以这里把写入语句全部
// 喂进去，让请求真的建单成功，再断言 200 与具体字段值 —— 「停在哪一步」由 sqlmock 的有序
// 期望 + ExpectationsWereMet 回答，而不是靠状态码猜。
package httpapi

import (
	"database/sql"
	"encoding/json"
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

const (
	mountOrder    = "ORD20261106001"
	mountTgID     = int64(777)
	mountMemberID = int64(42)
	mountAddress  = "TW4Q8tq6U1z3wWkEXAMPLETRONADDR9999"
	// mountInitData 是「正确」的 initData：注入的验签函数只认这一个值，
	// 于是「body 到底有没有被解析出来」变成一次可断言的事实，而不是靠状态码猜。
	mountInitData = "mount-init-data-body"
	// mountDepthBody 是上游盘口原文：bids 首档 62.50 即汇率来源（priceStr 原样落库）。
	mountDepthBody = `{"symbol":"USDTPHP","lastUpdateId":1,"bids":[["62.50","100"]],"asks":[["62.60","80"]]}`

	// 收银台期望值：12500 centavos ÷ 62.50 = 2_000_000 micro（整除），
	// 再把 2..90 号尾数全部占满，PickTail 只剩 1 号 → payable = 2_010_000。
	//
	// 下面这些数字全部**写死**，刻意不引用 checkout.TailUnitMicro / TailMin / TailMax：
	// 尾数单位是资金口径（改动等于改「同一个尾数代表多少钱」）。若期望值跟着实现常量算，
	// 有人把 10_000 改成 1_000_000，测试会跟着变成 3_000_000 照样绿 —— 契约已破却测不出来。
	// 写死之后，「改常量」这件事会变成红灯，这正是契约测试该有的性质。
	mountCentavos      = int64(12500)
	mountRateStr       = "62.50"
	mountTail          = 1
	mountBase          = int64(2_000_000)
	mountPayable       = int64(2_010_000) // = 2_000_000 + 尾数 1 × 10_000
	mountTailUnitMicro = int64(10_000)
	// 扫描区间是「全部尾数」（1..90），占用集合是「除 1 号之外」（2..90）。
	mountScanLow      = int64(2_010_000) // 2_000_000 + 1 × 10_000
	mountScanHigh     = int64(2_900_000) // 2_000_000 + 90 × 10_000
	mountOccupiedFrom = 2
	mountOccupiedTo   = 90
)

// mountNow 是固定时钟；下面两条落库时间文本由它算得（Window = 15 分钟）。
var mountNowTime = time.Unix(1_700_000_000, 0).UTC()

const (
	mountNowSQL     = "2023-11-14 22:13:20" // 落库形态：秒精度、UTC、空格分隔
	mountExpiresSQL = "2023-11-14 22:28:20" // + 15 分钟
)

const (
	mountSQLPayOrder = "SELECT amount, uid, state FROM `huoniao_pay_log` WHERE ordernum = ? ORDER BY id DESC LIMIT 1"
	mountSQLMember   = "SELECT member_id FROM fbs_member_map WHERE tg_user_id = ? LIMIT 1"
	mountSQLFind     = "SELECT id, ordernum, payable_micro, rate_str, rate_at, expires_at, state FROM fbs_charge WHERE ordernum = ? LIMIT 1"
	mountSQLRelease  = "UPDATE fbs_charge SET state = 'expired', holds_tail = 0 WHERE state = 'pending' AND holds_tail = 1 AND expires_at <= ?"
	mountSQLScan     = "SELECT payable_micro FROM fbs_charge WHERE holds_tail = 1 AND payable_micro BETWEEN ? AND ?"
	mountSQLInsert   = "INSERT INTO fbs_charge (ordernum, idempotency_key, php_centavos, tail_cents, payable_micro, rate_str, rate_at, state, expires_at, holds_tail) " +
		"VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, 1)"
)

func mountEnv() func(string) string {
	values := map[string]string{
		"CHECKOUT_ENABLED":            "1",
		"TRON_MASTER_RECEIVE_ADDRESS": mountAddress,
		// 故意不设 DB_TABLE_PREFIX：默认前缀 huoniao_ 由实现自己兜底，
		// 顺手把「前缀为空也不该拼出空表名」这条钉住（SQL 断言里写死了 huoniao_）。
	}
	return func(key string) string { return values[key] }
}

// mountDepthTransport 让 *coins.Client 打到固定盘口，不出网。
type mountDepthTransport struct{ calls int }

func (m *mountDepthTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	m.calls++
	return &http.Response{
		StatusCode: http.StatusOK,
		Header:     http.Header{"Content-Type": []string{"application/json"}},
		Body:       io.NopCloser(strings.NewReader(mountDepthBody)),
		Request:    req,
	}, nil
}

// mountValidator 记录 checkout 实际收到的 initData。
type mountValidator struct {
	initData string
	calls    int
}

func (v *mountValidator) validate(initData, _ string) tgauth.Result {
	v.calls++
	v.initData = initData
	if initData != mountInitData {
		return tgauth.Result{Valid: false, Error: "initData 缺失或不是本次请求的那一份"}
	}
	return tgauth.Result{
		Valid:    true,
		AuthDate: 1700000000,
		User:     &tgauth.User{ID: mountTgID, Raw: json.RawMessage(`{"id":777}`)},
	}
}

// mountChargeFixture 把「一笔新订单从取价到建单成功」需要的语句按实现顺序全部喂进去。
//
// 顺序即契约：sqlmock 是有序队列，任何一条语句的文本或参数被改动都会在
// ExpectationsWereMet 或 unexpected call 上立刻变红。三条查询里的 ordernum / tgid
// 都写死为本次请求的值 —— body 没穿透过来时 WithArgs 直接对不上。
func mountChargeFixture(t *testing.T) (*sql.DB, sqlmock.Sqlmock) {
	t.Helper()
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("sqlmock: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })

	// 1) order.ReadPayOrder：金额只认服务端 pay_log 读数。
	mock.ExpectQuery(regexp.QuoteMeta(mountSQLPayOrder)).
		WithArgs(mountOrder).
		WillReturnRows(sqlmock.NewRows([]string{"amount", "uid", "state"}).
			AddRow("125.00", mountMemberID, "0"))
	// 2) order.AssertOwnership：tg 用户 → 会员归属一致。
	mock.ExpectQuery(regexp.QuoteMeta(mountSQLMember)).
		WithArgs("777").
		WillReturnRows(sqlmock.NewRows([]string{"member_id"}).AddRow(mountMemberID))
	// 3) checkout.FindExisting：本订单还没有收银台。
	mock.ExpectQuery(regexp.QuoteMeta(mountSQLFind)).
		WithArgs(mountOrder).
		WillReturnRows(sqlmock.NewRows([]string{"id", "ordernum", "payable_micro", "rate_str", "rate_at", "expires_at", "state"}))
	// 4) 事务外释放过期占用。
	mock.ExpectExec(regexp.QuoteMeta(mountSQLRelease)).
		WithArgs(mountNowSQL).
		WillReturnResult(sqlmock.NewResult(0, 1))
	// 5) 分配事务：扫占用区间 → INSERT → COMMIT。
	mock.ExpectBegin()
	mock.ExpectQuery(regexp.QuoteMeta(mountSQLScan)).
		WithArgs(mountScanLow, mountScanHigh).
		WillReturnRows(mountOccupiedRows())
	mock.ExpectExec(regexp.QuoteMeta(mountSQLInsert)).
		WithArgs(mountOrder, nil, mountCentavos, mountTail, mountPayable,
			mountRateStr, mountNowSQL, mountExpiresSQL).
		WillReturnResult(sqlmock.NewResult(1, 1))
	mock.ExpectCommit()
	return db, mock
}

// mountOccupiedRows 返回「除 mountTail 之外全部尾数都被占用」的扫描结果。
func mountOccupiedRows() *sqlmock.Rows {
	rows := sqlmock.NewRows([]string{"payable_micro"})
	for tail := mountOccupiedFrom; tail <= mountOccupiedTo; tail++ {
		if tail == mountTail {
			continue
		}
		rows.AddRow(mountBase + int64(tail)*mountTailUnitMicro)
	}
	return rows
}

// mountServer 用 NewServer 装出完整 server；checkout 的 handler 由真实
// checkout.NewRoute 构造（只替换数据源、验签与汇率源），走的还是生产那条代码路径。
//
// rateSource 三态对应三条不同分支：
//   - 传入 GetRate（生产 checkoutDep 的形态，main.go:445 用 CoinsRateSource 填 GetRate）；
//   - 只传 CoinsClient（route.go:100 的兜底构造分支）；
//   - 全 nil（没有汇率源）。
func mountServer(t *testing.T, db *sql.DB, getRate checkout.RateSource, client *coins.Client, validator *mountValidator) *Server {
	t.Helper()
	env := mountEnv()
	dep := Dep{
		Env:              env,
		Now:              func() time.Time { return mountNowTime },
		ValidateInitData: validator.validate,
	}
	dep.Checkout = checkout.NewRoute(checkout.RouteDep{
		Env:              env,
		DB:               db,
		GetRate:          getRate,
		CoinsClient:      client,
		BotToken:         "mount-bot-token",
		Now:              func() time.Time { return mountNowTime },
		ValidateInitData: validator.validate,
		// 未识别异常会打一行结构化错误日志，这里咽掉，避免测试输出被噪音淹没。
		Logger: func(string) {},
	})
	return NewServer(dep)
}

// mountPostCheckout 打一发 POST /tg-api/checkout，initData 放在 body 里
// （走 httpapi.wrap 的 JSON 解析 → httpbody → checkout 这条链）。
func mountPostCheckout(t *testing.T, server *Server) *httptest.ResponseRecorder {
	t.Helper()
	body := `{"ordernum":"` + mountOrder + `","initData":"` + mountInitData + `"}`
	request := httptest.NewRequest(http.MethodPost, "/tg-api/checkout", strings.NewReader(body))
	request.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()
	server.Handler().ServeHTTP(recorder, request)
	return recorder
}

// mountCharge 解出 success 响应体里的 data。
type mountCharge struct {
	Success bool `json:"success"`
	Error   any  `json:"error"`
	Data    struct {
		Ordernum     string `json:"ordernum"`
		PayableMicro int64  `json:"payable_micro"`
		RateStr      string `json:"rate_str"`
		RateAt       string `json:"rate_at"`
		ExpiresAt    string `json:"expires_at"`
		Address      string `json:"address"`
	} `json:"data"`
}

func TestCheckoutMountedThroughServer(t *testing.T) {
	t.Run("GetRate 形态（生产装配）：端到端建单成功 200", func(t *testing.T) {
		db, mock := mountChargeFixture(t)

		transport := &mountDepthTransport{}
		client := coins.New(coins.Dep{
			BaseURL:    "https://coins.invalid",
			HTTPClient: &http.Client{Transport: transport},
		})
		validator := &mountValidator{}
		server := mountServer(t, db, checkout.CoinsRateSource(client, func() time.Time { return mountNowTime }), nil, validator)

		recorder := mountPostCheckout(t, server)
		body := recorder.Body.String()

		if got := strings.TrimSpace(validator.initData); got != mountInitData {
			t.Fatalf("body 里的 initData 没有穿透到收银台：得到 %q（%s）", got, body)
		}
		if recorder.Code != http.StatusOK {
			t.Fatalf("装配完整时应建单成功 200，实得 %d %s", recorder.Code, body)
		}
		// 有序期望全部命中：三条查询 + 释放 + 事务 + 扫描 + INSERT + COMMIT
		// 一条不差地按生产顺序走完，才算「端到端」而不是「停在某个 500」。
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("建单语句没有按生产顺序全部执行：%v", err)
		}
		if transport.calls != 1 {
			t.Fatalf("一次收银台请求应只打一次盘口，实得 %d 次", transport.calls)
		}

		var charge mountCharge
		if err := json.Unmarshal(recorder.Body.Bytes(), &charge); err != nil {
			t.Fatalf("响应不是合法 JSON：%v（%s）", err, body)
		}
		if !charge.Success {
			t.Fatalf("应 success:true，实得 %s", body)
		}
		if charge.Data.Ordernum != mountOrder {
			t.Fatalf("ordernum 应为 %q，实得 %q", mountOrder, charge.Data.Ordernum)
		}
		// 金额必须是「服务端读数 + 尾数」算出来的确定值，
		// 断言具体数字才能证明取价与分配都真的跑过（只断言 200 会被空响应蒙过去）。
		if charge.Data.PayableMicro != mountPayable {
			t.Fatalf("payable_micro 应为 %d（2_000_000 + 尾数 1 × 10_000），实得 %d",
				mountPayable, charge.Data.PayableMicro)
		}
		if charge.Data.RateStr != mountRateStr {
			t.Fatalf("rate_str 应保留盘口 priceStr 原文 %q，实得 %q", mountRateStr, charge.Data.RateStr)
		}
		if charge.Data.RateAt != "2023-11-14T22:13:20Z" || charge.Data.ExpiresAt != "2023-11-14T22:28:20Z" {
			t.Fatalf("时间戳应为 now / now+15min，实得 rate_at=%q expires_at=%q",
				charge.Data.RateAt, charge.Data.ExpiresAt)
		}
		if charge.Data.Address != mountAddress {
			t.Fatalf("address 应回显 TRON_MASTER_RECEIVE_ADDRESS，实得 %q", charge.Data.Address)
		}
	})

	t.Run("只装配 CoinsClient：走 route.go 的兜底构造分支，同样建成", func(t *testing.T) {
		// 生产走 GetRate；这条钉住「GetRate 为 nil 时由 CoinsClient 现场构造」的兜底分支，
		// 免得两条路径中的一条被改坏却无人发现。
		db, mock := mountChargeFixture(t)

		transport := &mountDepthTransport{}
		client := coins.New(coins.Dep{
			BaseURL:    "https://coins.invalid",
			HTTPClient: &http.Client{Transport: transport},
		})
		recorder := mountPostCheckout(t, mountServer(t, db, nil, client, &mountValidator{}))

		if recorder.Code != http.StatusOK {
			t.Fatalf("仅装配 CoinsClient 也应建单成功 200，实得 %d %s",
				recorder.Code, recorder.Body.String())
		}
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("兜底分支没有走完全部建单语句：%v", err)
		}
		if transport.calls != 1 {
			t.Fatalf("兜底分支应只打一次盘口，实得 %d 次", transport.calls)
		}
	})

	t.Run("未装配汇率源：同一路径 503 RATE_UNAVAILABLE", func(t *testing.T) {
		// 差分对照：与第一条唯一差别是 GetRate / CoinsClient 全为 nil。
		// 它证明第一条的断言不是恒真 —— 漏接汇率源确实会退化成 503 RATE_UNAVAILABLE，
		// 而这正是 B1 那次生产事故的症状。
		db, _ := mountChargeFixture(t)
		recorder := mountPostCheckout(t, mountServer(t, db, nil, nil, &mountValidator{}))

		if recorder.Code != http.StatusServiceUnavailable {
			t.Fatalf("没有汇率源时应 503，实得 %d %s", recorder.Code, recorder.Body.String())
		}
		if !strings.Contains(recorder.Body.String(), "RATE_UNAVAILABLE") {
			t.Fatalf("没有汇率源时应回 RATE_UNAVAILABLE，实得 %s", recorder.Body.String())
		}
	})

	t.Run("未装配收银台：该路径 404 而不是半个路由", func(t *testing.T) {
		server := NewServer(Dep{Env: mountEnv(), Now: func() time.Time { return mountNowTime }})
		request := httptest.NewRequest(http.MethodPost, "/tg-api/checkout",
			strings.NewReader(`{"ordernum":"`+mountOrder+`"}`))
		request.Header.Set("Content-Type", "application/json")
		recorder := httptest.NewRecorder()
		server.Handler().ServeHTTP(recorder, request)

		if recorder.Code != http.StatusNotFound {
			t.Fatalf("Checkout 为 nil 时不应注册该路由，应 404，实得 %d %s",
				recorder.Code, recorder.Body.String())
		}
	})
}
