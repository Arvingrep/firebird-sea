package checkout

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"regexp"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/tgauth"
)

// 逐条翻译自 services/api/test/checkout-route.test.js（7 条）。
//
// Node 用 express + 假 conn；Go 侧用 httptest.NewServer 真起服务（Set-Cookie/Location/状态码
// 必须走真实 header），DB 用 sqlmock 精确匹配「pay_log 读数 → fbs_member_map 归属 →
// 收银台分配」这三段语句。
//
// 与 Node 假 conn 的一处差异：Node 的 fakeDb 对所有 SQL 返回固定文本；Go 侧每条语句都要声明，
// 未声明的语句会让请求以 500 收场 —— 这正是我们想要的「多查一次就红」。

const (
	routePayLogSQL = "SELECT amount, uid, state FROM `huoniao_pay_log` WHERE ordernum = ? ORDER BY id DESC LIMIT 1"
	routeMapSQL    = "SELECT member_id FROM fbs_member_map WHERE tg_user_id = ? LIMIT 1"
	// routeMemberID 是 pay_log.uid 与 fbs_member_map.member_id 的匹配值。
	routeMemberID = 4242
	// routeTgID 是注入的 validator 返回的 Telegram 用户 id。
	routeTgID = 100200
)

// routeEnv 构造 Env：Node 的 startApp 只注入 CHECKOUT_ENABLED / TRON_MASTER_RECEIVE_ADDRESS。
func routeEnv(enabled bool) func(string) string {
	values := map[string]string{
		"TRON_MASTER_RECEIVE_ADDRESS": "TADDR",
		"DB_TABLE_PREFIX":             "huoniao_",
	}
	if enabled {
		values["CHECKOUT_ENABLED"] = "1"
	} else {
		values["CHECKOUT_ENABLED"] = "0"
	}
	return func(key string) string { return values[key] }
}

// routeApp 起一个只挂 /tg-api/checkout 的真实服务。
func routeApp(t *testing.T, dep RouteDep) *httptest.Server {
	t.Helper()
	if dep.ValidateInitData == nil {
		dep.ValidateInitData = func(initData, _ string) tgauth.Result {
			if initData == "good" {
				return tgauth.Result{Valid: true, User: &tgauth.User{ID: routeTgID}}
			}
			return tgauth.Result{Valid: false, Error: "bad"}
		}
	}
	if dep.GetRate == nil {
		dep.GetRate = func(ctx context.Context) (Rate, error) { return freshRate(), nil }
	}
	if dep.Now == nil {
		dep.Now = func() time.Time { return addNow }
	}
	mux := http.NewServeMux()
	mux.HandleFunc("POST /tg-api/checkout", NewRoute(dep))
	server := httptest.NewServer(mux)
	t.Cleanup(server.Close)
	return server
}

// routePost 发一次带 x-telegram-init-data 的 POST。
func routePost(t *testing.T, server *httptest.Server, body map[string]any, initData string) (int, map[string]any) {
	t.Helper()
	payload, err := json.Marshal(body)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	request, err := http.NewRequest(http.MethodPost, server.URL+"/tg-api/checkout", strings.NewReader(string(payload)))
	if err != nil {
		t.Fatalf("new request: %v", err)
	}
	request.Header.Set("Content-Type", "application/json")
	if initData != "" {
		request.Header.Set("X-Telegram-Init-Data", initData)
	}
	response, err := server.Client().Do(request)
	if err != nil {
		t.Fatalf("do: %v", err)
	}
	defer func() { _ = response.Body.Close() }()
	var decoded map[string]any
	if err := json.NewDecoder(response.Body).Decode(&decoded); err != nil {
		t.Fatalf("decode: %v", err)
	}
	return response.StatusCode, decoded
}

// routeErrorCode 取 {success:false,error:{code}} 里的 code。
func routeErrorCode(t *testing.T, body map[string]any) string {
	t.Helper()
	detail, ok := body["error"].(map[string]any)
	if !ok {
		t.Fatalf("响应体缺少 error 对象：%v", body)
	}
	code, _ := detail["code"].(string)
	return code
}

// routeData 取 {success:true,data:{...}} 里的 data。
func routeData(t *testing.T, body map[string]any) map[string]any {
	t.Helper()
	data, ok := body["data"].(map[string]any)
	if !ok {
		t.Fatalf("响应体缺少 data 对象：%v", body)
	}
	return data
}

// expectPayLog 声明一次 pay_log 读数。
func expectPayLog(mock sqlmock.Sqlmock, ordernum, amount string, uid int64, state string) {
	mock.ExpectQuery(regexp.QuoteMeta(routePayLogSQL)).
		WithArgs(ordernum).
		WillReturnRows(sqlmock.NewRows([]string{"amount", "uid", "state"}).AddRow(amount, uid, state))
}

// expectOwnership 声明一次归属校验。
func expectOwnership(mock sqlmock.Sqlmock, memberID int64) {
	mock.ExpectQuery(regexp.QuoteMeta(routeMapSQL)).
		WithArgs(strconv.Itoa(routeTgID)).
		WillReturnRows(sqlmock.NewRows([]string{"member_id"}).AddRow(memberID))
}

// expectCheckoutAllocation 声明一次完整收银台分配（尾数 90 被逼成唯一解）。
func expectCheckoutAllocation(mock sqlmock.Sqlmock, ordernum string) {
	expectFindFor(mock, ordernum, sqlmock.NewRows([]string{"id", "ordernum", "payable_micro", "rate_str", "rate_at", "expires_at", "state"}))
	expectReleaseAt(mock, "2026-01-01 00:00:00")
	request := addReq()
	request.Ordernum = ordernum
	expectAllocate(mock, request, 2000000, occupiedRows(2000000, tailsExcept(90)), 90, nil)
}

// TestCheckoutRoute 对应 checkout-route.test.js 的 7 条用例。
func TestCheckoutRoute(t *testing.T) {
	t.Run("CHECKOUT_ENABLED 未开启：503 CHECKOUT_DISABLED", func(t *testing.T) {
		db, mock := newMock(t)
		server := routeApp(t, RouteDep{Env: routeEnv(false), DB: db})
		status, body := routePost(t, server, map[string]any{"ordernum": "ORD1"}, "good")
		if status != http.StatusServiceUnavailable {
			t.Fatalf("status = %d, want 503", status)
		}
		if code := routeErrorCode(t, body); code != "CHECKOUT_DISABLED" {
			t.Fatalf("code = %q, want CHECKOUT_DISABLED", code)
		}
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("未开启时不得触达数据库：%v", err)
		}
	})

	t.Run("initData 非法：401 UNAUTHORIZED", func(t *testing.T) {
		db, mock := newMock(t)
		server := routeApp(t, RouteDep{Env: routeEnv(true), DB: db})
		status, body := routePost(t, server, map[string]any{"ordernum": "ORD1"}, "tampered")
		if status != http.StatusUnauthorized {
			t.Fatalf("status = %d, want 401", status)
		}
		if code := routeErrorCode(t, body); code != "UNAUTHORIZED" {
			t.Fatalf("code = %q, want UNAUTHORIZED", code)
		}
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("鉴权失败时不得触达数据库：%v", err)
		}
	})

	t.Run("major 2：金额来自服务端 pay_log 读数，客户端提交的 phpCentavos 被忽略", func(t *testing.T) {
		db, mock := newMock(t)
		expectPayLog(mock, "ORD1", "125.00", routeMemberID, "0")
		expectOwnership(mock, routeMemberID)
		expectCheckoutAllocation(mock, "ORD1")

		server := routeApp(t, RouteDep{Env: routeEnv(true), DB: db})
		// 客户端伪造 1 centavo：服务端必须只认 pay_log 的 125.00 → 12500 centavos。
		status, body := routePost(t, server, map[string]any{"ordernum": "ORD1", "phpCentavos": 1}, "good")
		if status != http.StatusOK {
			t.Fatalf("status = %d, want 200（body=%v）", status, body)
		}
		data := routeData(t, body)
		payable, _ := data["payable_micro"].(float64)
		if payable < 2000000+10000 || payable > 2000000+900000 {
			t.Fatalf("payable_micro = %v，必须落在 12500 centavos 对应的 2000000+尾数 区间内", payable)
		}
		if data["address"] != "TADDR" {
			t.Fatalf("address = %v, want TADDR", data["address"])
		}
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("未满足的 SQL 期望：%v", err)
		}
	})

	t.Run("major 2：归属不符（fbs_member_map 与 pay_log.uid 不同域）：403 ORDER_FORBIDDEN", func(t *testing.T) {
		db, mock := newMock(t)
		expectPayLog(mock, "ORD1", "125.00", routeMemberID, "0")
		expectOwnership(mock, 9999)

		server := routeApp(t, RouteDep{Env: routeEnv(true), DB: db})
		status, body := routePost(t, server, map[string]any{"ordernum": "ORD1"}, "good")
		if status != http.StatusForbidden {
			t.Fatalf("status = %d, want 403", status)
		}
		if code := routeErrorCode(t, body); code != "ORDER_FORBIDDEN" {
			t.Fatalf("code = %q, want ORDER_FORBIDDEN", code)
		}
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("归属不符时不得进入收银台分配：%v", err)
		}
	})

	t.Run("订单不存在：403 ORDER_NOT_FOUND；已支付：403 ORDER_NOT_PAYABLE", func(t *testing.T) {
		missingDB, missingMock := newMock(t)
		missingMock.ExpectQuery(regexp.QuoteMeta(routePayLogSQL)).
			WithArgs("ORD1").
			WillReturnRows(sqlmock.NewRows([]string{"amount", "uid", "state"}))
		missing := routeApp(t, RouteDep{Env: routeEnv(true), DB: missingDB})
		status, body := routePost(t, missing, map[string]any{"ordernum": "ORD1"}, "good")
		if status != http.StatusForbidden {
			t.Fatalf("订单不存在 status = %d, want 403", status)
		}
		if code := routeErrorCode(t, body); code != "ORDER_NOT_FOUND" {
			t.Fatalf("code = %q, want ORDER_NOT_FOUND", code)
		}

		paidDB, paidMock := newMock(t)
		expectPayLog(paidMock, "ORD1", "125.00", routeMemberID, "1")
		paid := routeApp(t, RouteDep{Env: routeEnv(true), DB: paidDB})
		status, body = routePost(t, paid, map[string]any{"ordernum": "ORD1"}, "good")
		if status != http.StatusForbidden {
			t.Fatalf("已支付 status = %d, want 403", status)
		}
		if code := routeErrorCode(t, body); code != "ORDER_NOT_PAYABLE" {
			t.Fatalf("code = %q, want ORDER_NOT_PAYABLE", code)
		}
		if err := paidMock.ExpectationsWereMet(); err != nil {
			t.Fatalf("未满足的 SQL 期望：%v", err)
		}
	})

	t.Run("限流：同一用户第 6 次请求 429 RATE_LIMITED", func(t *testing.T) {
		db, mock := newMock(t)
		// 前 5 次都走完整成功路径（限流计数与结果无关，但用成功路径才能证明第 6 次是被限流拦的）。
		for i := 0; i < CheckoutLimit; i++ {
			ordernum := "ORD" + strconv.Itoa(i)
			expectPayLog(mock, ordernum, "125.00", routeMemberID, "0")
			expectOwnership(mock, routeMemberID)
			expectCheckoutAllocation(mock, ordernum)
		}

		server := routeApp(t, RouteDep{Env: routeEnv(true), DB: db})
		for i := 0; i < CheckoutLimit; i++ {
			status, body := routePost(t, server, map[string]any{"ordernum": "ORD" + strconv.Itoa(i)}, "good")
			if status != http.StatusOK {
				t.Fatalf("第 %d 次 status = %d, want 200（body=%v）", i+1, status, body)
			}
		}
		status, body := routePost(t, server, map[string]any{"ordernum": "ORD6"}, "good")
		if status != http.StatusTooManyRequests {
			t.Fatalf("第 6 次 status = %d, want 429", status)
		}
		if code := routeErrorCode(t, body); code != "RATE_LIMITED" {
			t.Fatalf("code = %q, want RATE_LIMITED", code)
		}
		// 第 6 次没有声明任何 SQL 期望：被限流时必须直接返回，不得触达数据库。
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("未满足的 SQL 期望：%v", err)
		}
	})

	t.Run("ordernum 非法：400 BAD_REQUEST", func(t *testing.T) {
		db, mock := newMock(t)
		server := routeApp(t, RouteDep{Env: routeEnv(true), DB: db})
		status, body := routePost(t, server, map[string]any{"ordernum": "ORD'1"}, "good")
		if status != http.StatusBadRequest {
			t.Fatalf("status = %d, want 400", status)
		}
		if code := routeErrorCode(t, body); code != "BAD_REQUEST" {
			t.Fatalf("code = %q, want BAD_REQUEST", code)
		}
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("ordernum 非法时不得触达数据库：%v", err)
		}
	})
}

// TestCheckoutBodyParsingFollowsContentType 钉住「解析方式由 Content-Type 决定」（T3 补口，
// 不翻译自 Node —— Node 靠 express.json + express.urlencoded 的默认行为隐式成立）。
//
// 早期 Go 实现按首字节嗅探：`text/plain` 里塞一段 JSON 也会被当成合法 body，等于放宽了类型契约。
// 判据设计：合法 initData 只在「body 真被解析」时才拿得到，于是状态码本身成了可观测事实——
//   - application/json / x-www-form-urlencoded → 过了鉴权 → 缺 ordernum → 400 BAD_REQUEST
//   - text/plain → body 视为空 → 缺 initData → 401 UNAUTHORIZED
func TestCheckoutBodyParsingFollowsContentType(t *testing.T) {
	cases := []struct {
		name        string
		contentType string
		payload     string
		wantStatus  int
		wantCode    string
	}{
		{"application/json 正常解析", "application/json", `{"initData":"good"}`, http.StatusBadRequest, "BAD_REQUEST"},
		{"text/plain 的 body 视为空", "text/plain", `{"initData":"good"}`, http.StatusUnauthorized, "UNAUTHORIZED"},
		{"x-www-form-urlencoded 正常解析", "application/x-www-form-urlencoded", "initData=good", http.StatusBadRequest, "BAD_REQUEST"},
	}

	for _, item := range cases {
		t.Run(item.name, func(t *testing.T) {
			db, mock := newMock(t)
			server := routeApp(t, RouteDep{Env: routeEnv(true), DB: db})

			request, err := http.NewRequest(http.MethodPost, server.URL+"/tg-api/checkout",
				strings.NewReader(item.payload))
			if err != nil {
				t.Fatalf("构造请求失败: %v", err)
			}
			request.Header.Set("Content-Type", item.contentType)
			response, err := server.Client().Do(request)
			if err != nil {
				t.Fatalf("发送请求失败: %v", err)
			}
			defer func() { _ = response.Body.Close() }()

			var body map[string]any
			if err := json.NewDecoder(response.Body).Decode(&body); err != nil {
				t.Fatalf("解析响应失败: %v", err)
			}
			if response.StatusCode != item.wantStatus {
				t.Fatalf("status = %d, want %d（body=%v）", response.StatusCode, item.wantStatus, body)
			}
			if code := routeErrorCode(t, body); code != item.wantCode {
				t.Fatalf("code = %q, want %q", code, item.wantCode)
			}
			// 三种情形都必须在触达数据库之前收口：一条 SQL 期望都没有声明。
			if err := mock.ExpectationsWereMet(); err != nil {
				t.Fatalf("参数校验阶段不得触达数据库：%v", err)
			}
		})
	}
}
