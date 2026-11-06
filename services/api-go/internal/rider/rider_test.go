// POST /tg-api/rider/session 的测试套件。
//
// 翻译来源：services/api/test/rider-route.test.js 里全部 7 条涉及 session 的用例
// （逐条对应关系写在每个 Test 的注释里），外加行为清单里 Node 源码有、但 Node 测试
// 没覆盖的分支（503 notConfigured / 网关响应形状 / 白名单 / 日志不泄漏）。
//
// 与 Node 用例的映射要点：
//   - Node 用 createRiderRoute 注入 fakeConn/fakeGateway；Go 侧 DB 用 go-sqlmock、
//     网关用 httptest + **真实的** gateway.Call（连签名一起验），比 Node 的假网关更强。
//   - Node 的 "m4 源码约束" 靠正则读 riderRoute.js；Go 侧改成两层：行为上断言 SQL
//     走 ? 绑定参数（sqlmock WithArgs），结构上扫描 rider.go 源码断言只有一条只读 SELECT。
//     只做其中一层都不够：前者证明「当前实现参数化了」，后者证明「没人偷偷加第二条 SQL」。
package rider

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/gateway"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/tgauth"
)

const (
	rwBotToken   = "test-bot-token-not-a-secret"
	rwGatewayKey = "gw-secret"
	rwWorkbench  = "https://canary.fbird.men/ql.html?token=FAKE"
)

// rwSilentLogfn 吞掉日志（默认值）：只有专门验日志的用例才需要捕获。
func rwSilentLogfn(string) {}

// —— 测试替身 ——

// testGateway 用**真实**的 gateway.Call 打 httptest 假网关：签名、action 名、
// 响应解析全部走生产代码，不手搓 map 绕过。
type testGateway struct {
	cfg gateway.Config
}

func (g testGateway) RiderQL(ctx context.Context, params map[string]any) (map[string]any, error) {
	return gateway.Call(ctx, g.cfg, "rider_ql", params)
}

// rwGatewayReply 是假网关的一次响应。
type rwGatewayReply struct {
	status int
	body   string
}

// rwGateway 起一个假 PHP 网关，并把每次请求的 params 记下来供断言。
func rwGateway(t *testing.T, reply func(params map[string]any) rwGatewayReply) (Gateway, *[]map[string]any) {
	t.Helper()
	calls := &[]map[string]any{}
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		var body struct {
			Action string         `json:"action"`
			Params map[string]any `json:"params"`
		}
		if err := json.NewDecoder(req.Body).Decode(&body); err != nil {
			t.Errorf("网关请求体不是 JSON: %v", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		if body.Action != "rider_ql" {
			t.Errorf("action 应为 rider_ql，实际 %q", body.Action)
		}
		*calls = append(*calls, body.Params)
		result := reply(body.Params)
		status := result.status
		if status == 0 {
			status = http.StatusOK
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(status)
		_, _ = w.Write([]byte(result.body))
	}))
	t.Cleanup(server.Close)
	return testGateway{cfg: gateway.Config{BaseURL: server.URL, Secret: rwGatewayKey, Timeout: 2 * time.Second}}, calls
}

// rwOKGateway 是「rider_ql 正常签出 URL」的假网关。
func rwOKGateway(t *testing.T) (Gateway, *[]map[string]any) {
	return rwGateway(t, func(map[string]any) rwGatewayReply {
		return rwGatewayReply{body: `{"success":true,"data":{"courier_id":9,"url":"` + rwWorkbench + `"}}`}
	})
}

// rwDB 建 sqlmock 连接。
func rwDB(t *testing.T) (*sql.DB, sqlmock.Sqlmock) {
	t.Helper()
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("创建 sqlmock 失败: %v", err)
	}
	t.Cleanup(func() {
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("SQL 期望未满足: %v", err)
		}
		_ = db.Close()
	})
	return db, mock
}

// rwValidate 是按 initData 里显式写死的用户 id 放行的验签替身（"signed:77" → 77）。
// 用「只有测试知道的标记」而不是真签名，是为了让用例一眼看出「验签这一层已被绕过」。
func rwValidate(initData, botToken string) tgauth.Result {
	if botToken != rwBotToken {
		return tgauth.Result{Error: "Server auth not configured"}
	}
	raw, found := strings.CutPrefix(initData, "signed:")
	if !found {
		return tgauth.Result{Error: "Hash mismatch: Potential tampering detected"}
	}
	id, err := strconv.ParseInt(raw, 10, 64)
	if err != nil {
		return tgauth.Result{Error: "Malformed user field"}
	}
	return tgauth.Result{Valid: true, User: &tgauth.User{ID: id}}
}

// rwRoute 按「全配置」装配一个 Route；mutate 可逐项拆掉依赖。
func rwRoute(t *testing.T, mutate func(*Dep)) *Route {
	t.Helper()
	db, _ := rwDB(t)
	fakeGateway, _ := rwOKGateway(t)
	dep := Dep{
		BotToken:         rwBotToken,
		ValidateInitData: rwValidate,
		DB:               db,
		Gateway:          fakeGateway,
		AllowedHosts:     []string{"canary.fbird.men"},
		Logf:             rwSilentLogfn,
	}
	if mutate != nil {
		mutate(&dep)
	}
	return New(dep)
}

// rwServe 发一次 POST /tg-api/rider/session。query 单独传，用来证明「query 不算」。
// 注意首参是 Route 而不是 *http.Request 的包装：本包的处理器直接收 (w, req)。
func rwServe(t *testing.T, route *Route, body, query string) *httptest.ResponseRecorder {
	t.Helper()
	target := "/tg-api/rider/session"
	if query != "" {
		target += "?" + query
	}
	request := httptest.NewRequest(http.MethodPost, target, strings.NewReader(body))
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	recorder := httptest.NewRecorder()
	route.Session(recorder, request)
	return recorder
}

// rwBody 是 form 编码的请求体（Node 用 express.urlencoded 收表单）。
func rwBody(initData string) string {
	return url.Values{"initData": {initData}}.Encode()
}

// —— 1. notConfigured → 503（行为清单第 1、2 条；Node 无对应用例，分支来自源码第 247 行）——

func TestSessionNotConfiguredReturns503(t *testing.T) {
	cases := map[string]func(*Dep){
		"缺 botToken": func(d *Dep) { d.BotToken = "" },
		"缺网关":        func(d *Dep) { d.Gateway = nil },
		"缺数据库":       func(d *Dep) { d.DB = nil },
	}
	for name, mutate := range cases {
		t.Run(name, func(t *testing.T) {
			route := rwRoute(t, mutate)
			if !route.NotConfigured() {
				t.Fatal("缺配置时应标记为 notConfigured")
			}
			recorder := rwServe(t, route, rwBody("signed:77"), "")
			if recorder.Code != http.StatusServiceUnavailable {
				t.Fatalf("状态码应为 503，实际 %d", recorder.Code)
			}
			// 逐字节对齐 Node 的 res.json 输出（字段顺序 + 无结尾换行）。
			want := `{"success":false,"error":{"code":"RIDER_NOT_CONFIGURED","message":"rider session not configured"}}`
			if got := recorder.Body.String(); got != want {
				t.Fatalf("响应体不符\n got=%s\nwant=%s", got, want)
			}
			// no-store 必须在 notConfigured 判断**之前**就设好。
			if got := recorder.Header().Get("Cache-Control"); got != "no-store" {
				t.Fatalf("Cache-Control 应为 no-store，实际 %q", got)
			}
		})
	}
}

// —— 2. initData 只认 POST body（Node: m5 用例，第 605 行）——

func TestSessionInitDataOnlyFromPostBody(t *testing.T) {
	db, mock := rwDB(t)
	// 不设任何 SQL 期望：这条用例一旦走到查询就说明 query 里的 initData 被采信了。
	_ = mock
	fakeGateway, calls := rwOKGateway(t)
	route := New(Dep{
		BotToken:         rwBotToken,
		ValidateInitData: rwValidate,
		DB:               db,
		Gateway:          fakeGateway,
		AllowedHosts:     []string{"canary.fbird.men"},
		Logf:             rwSilentLogfn,
	})

	// query 里带合法 initData、body 为空 → 必须 401（短期凭证不许进 URL）。
	recorder := rwServe(t, route, "", "initData="+url.QueryEscape("signed:77"))
	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("query 传 initData 必须 401，实际 %d", recorder.Code)
	}
	if got := rwErrorCode(t, recorder.Body.String()); got != "INVALID_INIT_DATA" {
		t.Fatalf("错误码应为 INVALID_INIT_DATA，实际 %q", got)
	}
	if len(*calls) != 0 {
		t.Fatalf("401 分支不该调网关，实际调了 %d 次", len(*calls))
	}

	// body 里带伪造 initData → 401。
	forged := rwServe(t, route, rwBody("forged"), "")
	if forged.Code != http.StatusUnauthorized {
		t.Fatalf("伪造 initData 必须 401，实际 %d", forged.Code)
	}
}

// —— 3. 完全不带 initData → 401（Node: 第 426 行）——

func TestSessionMissingInitDataReturns401(t *testing.T) {
	route := rwRoute(t, nil)
	recorder := rwServe(t, route, "", "")
	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("状态码应为 401，实际 %d", recorder.Code)
	}
	want := `{"success":false,"error":{"code":"INVALID_INIT_DATA","message":"Invalid or missing initData"}}`
	if got := recorder.Body.String(); got != want {
		t.Fatalf("响应体不符\n got=%s\nwant=%s", got, want)
	}
}

// —— 4. 已绑定 / 未绑定（Node: 第 588 行）——

func TestSessionBoundAndUnbound(t *testing.T) {
	db, mock := rwDB(t)
	rows := sqlmock.NewRows([]string{"courier_id"}).AddRow("9\n")
	mock.ExpectQuery(regexp.QuoteMeta(sessionSQL)).WithArgs(int64(77)).WillReturnRows(rows)
	// 未绑定：0 行（Node 的 cliConn 输出空串）。
	mock.ExpectQuery(regexp.QuoteMeta(sessionSQL)).WithArgs(int64(88)).
		WillReturnRows(sqlmock.NewRows([]string{"courier_id"}))

	fakeGateway, calls := rwOKGateway(t)
	route := New(Dep{
		BotToken:         rwBotToken,
		ValidateInitData: rwValidate,
		DB:               db,
		Gateway:          fakeGateway,
		AllowedHosts:     []string{"canary.fbird.men"},
		Logf:             rwSilentLogfn,
	})

	bound := rwServe(t, route, rwBody("signed:77"), "")
	if bound.Code != http.StatusOK {
		t.Fatalf("已绑定应 200，实际 %d（body=%s）", bound.Code, bound.Body.String())
	}
	wantBound := `{"success":true,"data":{"bound":true,"courier_id":9,"url":"` + rwWorkbench + `"}}`
	if got := bound.Body.String(); got != wantBound {
		t.Fatalf("已绑定响应体不符\n got=%s\nwant=%s", got, wantBound)
	}
	if len(*calls) != 1 {
		t.Fatalf("应调网关 1 次，实际 %d 次", len(*calls))
	}
	// courier_id 以 JSON 数字传给网关（Node: riderQl({courier_id: 9})）。
	if got, ok := gateway.Int((*calls)[0], "courier_id"); !ok || got != 9 {
		t.Fatalf("网关参数 courier_id 应为 9，实际 %v", (*calls)[0])
	}

	unbound := rwServe(t, route, rwBody("signed:88"), "")
	if unbound.Code != http.StatusOK {
		t.Fatalf("未绑定应 200，实际 %d", unbound.Code)
	}
	// 未绑定分支 Node 的 data 只有 bound 一个键。
	wantUnbound := `{"success":true,"data":{"bound":false}}`
	if got := unbound.Body.String(); got != wantUnbound {
		t.Fatalf("未绑定响应体不符\n got=%s\nwant=%s", got, wantUnbound)
	}
	if len(*calls) != 1 {
		t.Fatalf("未绑定分支不该再调网关，实际共 %d 次", len(*calls))
	}
}

// —— 5. Cache-Control: no-store 覆盖全部分支（Node: m5 用例，第 619 行）——

func TestSessionCacheControlNoStoreOnEveryBranch(t *testing.T) {
	// 200（已绑定）与 401 对应 Node 用例的两条；其余分支是同一约束的延伸。
	t.Run("200 已绑定", func(t *testing.T) {
		db, mock := rwDB(t)
		mock.ExpectQuery(regexp.QuoteMeta(sessionSQL)).WithArgs(int64(77)).
			WillReturnRows(sqlmock.NewRows([]string{"courier_id"}).AddRow("9"))
		fakeGateway, _ := rwOKGateway(t)
		route := New(Dep{BotToken: rwBotToken, ValidateInitData: rwValidate, DB: db,
			Gateway: fakeGateway, AllowedHosts: []string{"canary.fbird.men"}, Logf: rwSilentLogfn})
		recorder := rwServe(t, route, rwBody("signed:77"), "")
		if recorder.Code != http.StatusOK {
			t.Fatalf("应 200，实际 %d", recorder.Code)
		}
		if got := recorder.Header().Get("Cache-Control"); got != "no-store" {
			t.Fatalf("Cache-Control 应为 no-store，实际 %q", got)
		}
	})

	t.Run("401 伪造 initData", func(t *testing.T) {
		route := rwRoute(t, nil)
		recorder := rwServe(t, route, rwBody("forged"), "")
		if recorder.Code != http.StatusUnauthorized {
			t.Fatalf("应 401，实际 %d", recorder.Code)
		}
		if got := recorder.Header().Get("Cache-Control"); got != "no-store" {
			t.Fatalf("失败分支同样要 no-store，实际 %q", got)
		}
	})

	t.Run("502 网关失败", func(t *testing.T) {
		db, mock := rwDB(t)
		mock.ExpectQuery(regexp.QuoteMeta(sessionSQL)).WithArgs(int64(77)).
			WillReturnRows(sqlmock.NewRows([]string{"courier_id"}).AddRow("9"))
		fakeGateway, _ := rwGateway(t, func(map[string]any) rwGatewayReply {
			return rwGatewayReply{status: http.StatusInternalServerError, body: `{"success":false,"error":{"code":"DB_UNAVAILABLE"}}`}
		})
		route := New(Dep{BotToken: rwBotToken, ValidateInitData: rwValidate, DB: db,
			Gateway: fakeGateway, AllowedHosts: []string{"canary.fbird.men"}, Logf: rwSilentLogfn})
		recorder := rwServe(t, route, rwBody("signed:77"), "")
		if recorder.Code != http.StatusBadGateway {
			t.Fatalf("应 502，实际 %d", recorder.Code)
		}
		if got := recorder.Header().Get("Cache-Control"); got != "no-store" {
			t.Fatalf("502 分支同样要 no-store，实际 %q", got)
		}
	})
}

// —— 6. DB 查询异常 → 502 且不泄漏 SQL（Node: 第 415 行）——

func TestSessionDatabaseErrorReturns502(t *testing.T) {
	db, mock := rwDB(t)
	mock.ExpectQuery(regexp.QuoteMeta(sessionSQL)).WithArgs(int64(77)).
		WillReturnError(fmt.Errorf("db boom: SELECT ... secret"))
	fakeGateway, calls := rwOKGateway(t)
	route := New(Dep{BotToken: rwBotToken, ValidateInitData: rwValidate, DB: db,
		Gateway: fakeGateway, AllowedHosts: []string{"canary.fbird.men"}, Logf: rwSilentLogfn})

	recorder := rwServe(t, route, rwBody("signed:77"), "")
	if recorder.Code != http.StatusBadGateway {
		t.Fatalf("应 502，实际 %d", recorder.Code)
	}
	want := `{"success":false,"error":{"code":"RIDER_FAILED","message":"Service temporarily unavailable"}}`
	if got := recorder.Body.String(); got != want {
		t.Fatalf("响应体不符\n got=%s\nwant=%s", got, want)
	}
	if strings.Contains(recorder.Body.String(), "boom: SELECT") {
		t.Fatal("错误详情不得回显给客户端")
	}
	if len(*calls) != 0 {
		t.Fatalf("查库失败不该调网关，实际 %d 次", len(*calls))
	}
}

// —— 7. rider_ql 失败 → 502 且无 URL 泄漏（Node: 第 637 行）——

func TestSessionGatewayFailureReturns502(t *testing.T) {
	cases := map[string]rwGatewayReply{
		// Node 用 httpError(404, 'COURIER_NOT_FOUND')：gatewayClient 对非 2xx reject。
		"网关非 2xx": {status: http.StatusNotFound, body: `{"success":false,"error":{"code":"COURIER_NOT_FOUND","message":"骑手不存在或状态不可用"}}`},
		// 2xx 但 success:false —— Node 里 `ql.success === true` 不成立。
		"200 但 success:false": {body: `{"success":false,"error":{"code":"COURIER_NOT_FOUND"}}`},
		// 超时/坏 JSON 之类的传输层失败也统一 502。
		"200 但非 JSON": {body: `<html>front controller</html>`},
	}
	for name, reply := range cases {
		t.Run(name, func(t *testing.T) {
			db, mock := rwDB(t)
			mock.ExpectQuery(regexp.QuoteMeta(sessionSQL)).WithArgs(int64(77)).
				WillReturnRows(sqlmock.NewRows([]string{"courier_id"}).AddRow("9"))
			fakeGateway, _ := rwGateway(t, func(map[string]any) rwGatewayReply { return reply })
			route := New(Dep{BotToken: rwBotToken, ValidateInitData: rwValidate, DB: db,
				Gateway: fakeGateway, AllowedHosts: []string{"canary.fbird.men"}, Logf: rwSilentLogfn})

			recorder := rwServe(t, route, rwBody("signed:77"), "")
			if recorder.Code != http.StatusBadGateway {
				t.Fatalf("应 502，实际 %d（body=%s）", recorder.Code, recorder.Body.String())
			}
			if strings.Contains(recorder.Body.String(), "ql.html") {
				t.Fatal("响应体不得包含工作台 URL")
			}
			if got := rwErrorCode(t, recorder.Body.String()); got != "RIDER_FAILED" {
				t.Fatalf("错误码应为 RIDER_FAILED，实际 %q", got)
			}
		})
	}
}

// TestSessionRejectsInvalidGatewayReply 覆盖 `typeof url !== 'string' || !isAllowedTarget(url)`
// 的每一条（行为清单第 8、9 条；Node 源码 258-259 行，Node 测试未逐条覆盖）。
func TestSessionRejectsInvalidGatewayReply(t *testing.T) {
	cases := map[string]struct {
		whitelist []string
		reply     string
	}{
		"url 缺失":            {whitelist: []string{"canary.fbird.men"}, reply: `{"success":true,"data":{}}`},
		"url 不是字符串":         {whitelist: []string{"canary.fbird.men"}, reply: `{"success":true,"data":{"url":123}}`},
		"data 缺失":           {whitelist: []string{"canary.fbird.men"}, reply: `{"success":true}`},
		"success 是字符串 true": {whitelist: []string{"canary.fbird.men"}, reply: `{"success":"true","data":{"url":"` + rwWorkbench + `"}}`},
		"success 是数字 1":     {whitelist: []string{"canary.fbird.men"}, reply: `{"success":1,"data":{"url":"` + rwWorkbench + `"}}`},
		"http 而非 https":     {whitelist: []string{"canary.fbird.men"}, reply: `{"success":true,"data":{"url":"http://canary.fbird.men/ql.html?token=X"}}`},
		"白名单外主机":            {whitelist: []string{"canary.fbird.men"}, reply: `{"success":true,"data":{"url":"https://evil.example.com/ql.html?token=X"}}`},
		"空 url":             {whitelist: []string{"canary.fbird.men"}, reply: `{"success":true,"data":{"url":""}}`},
		"相对路径":              {whitelist: []string{"canary.fbird.men"}, reply: `{"success":true,"data":{"url":"/ql.html?token=X"}}`},
		"https 但无主机":        {whitelist: nil, reply: `{"success":true,"data":{"url":"https://"}}`},
	}
	for name, item := range cases {
		t.Run(name, func(t *testing.T) {
			db, mock := rwDB(t)
			mock.ExpectQuery(regexp.QuoteMeta(sessionSQL)).WithArgs(int64(77)).
				WillReturnRows(sqlmock.NewRows([]string{"courier_id"}).AddRow("9"))
			fakeGateway, _ := rwGateway(t, func(map[string]any) rwGatewayReply {
				return rwGatewayReply{body: item.reply}
			})
			route := New(Dep{BotToken: rwBotToken, ValidateInitData: rwValidate, DB: db,
				Gateway: fakeGateway, AllowedHosts: item.whitelist, Logf: rwSilentLogfn})
			recorder := rwServe(t, route, rwBody("signed:77"), "")
			if recorder.Code != http.StatusBadGateway {
				t.Fatalf("应 502，实际 %d（body=%s）", recorder.Code, recorder.Body.String())
			}
			if strings.Contains(recorder.Body.String(), "ql.html") || strings.Contains(recorder.Body.String(), "evil.example.com") {
				t.Fatal("响应体不得包含网关返回的 URL")
			}
		})
	}
}

// TestSessionWhitelistFailOpen 钉住 isAllowedTarget 的两条 white-list 语义：
// 空白名单放行任意 https 主机（Node 刻意 fail-open）；非空时按 host / hostname 小写比对。
func TestSessionWhitelistFailOpen(t *testing.T) {
	serve := func(t *testing.T, whitelist []string, target string) int {
		t.Helper()
		db, mock := rwDB(t)
		mock.ExpectQuery(regexp.QuoteMeta(sessionSQL)).WithArgs(int64(77)).
			WillReturnRows(sqlmock.NewRows([]string{"courier_id"}).AddRow("9"))
		fakeGateway, _ := rwGateway(t, func(map[string]any) rwGatewayReply {
			payload, err := json.Marshal(map[string]any{"success": true, "data": map[string]any{"url": target}})
			if err != nil {
				t.Fatalf("构造响应失败: %v", err)
			}
			return rwGatewayReply{body: string(payload)}
		})
		route := New(Dep{BotToken: rwBotToken, ValidateInitData: rwValidate, DB: db,
			Gateway: fakeGateway, AllowedHosts: whitelist, Logf: rwSilentLogfn})
		return rwServe(t, route, rwBody("signed:77"), "").Code
	}

	// 白名单为空 + 任意 https 主机 → 放行（fail-open）。
	if got := serve(t, nil, "https://whatever.example.org/ql.html?token=X"); got != http.StatusOK {
		t.Fatalf("空白名单应 fail-open 放行 https，实际 %d", got)
	}
	// https 依然是硬条件：http 一律拒。
	if got := serve(t, nil, "http://whatever.example.org/ql.html?token=X"); got != http.StatusBadGateway {
		t.Fatalf("http 必须被拒，实际 %d", got)
	}
	// 白名单非空：命中 host（含端口）放行。
	if got := serve(t, []string{"www.fbird.men", "canary.fbird.men:8443"}, "https://canary.fbird.men:8443/ql?token=X"); got != http.StatusOK {
		t.Fatalf("带端口的 host 应命中白名单，实际 %d", got)
	}
	// 目标 host 大写也要命中（Node: u.host.toLowerCase() 与白名单双向小写）。
	if got := serve(t, []string{"Canary.Fbird.Men"}, "HTTPS://CANARY.FBIRD.MEN/ql?token=X"); got != http.StatusOK {
		t.Fatalf("大小写不同也应命中白名单，实际 %d", got)
	}
	// 子域不在白名单里 → 拒。
	if got := serve(t, []string{"canary.fbird.men"}, "https://sub.canary.fbird.men/ql?token=X"); got != http.StatusBadGateway {
		t.Fatalf("子域不应被白名单放行，实际 %d", got)
	}
}

// —— 8. tg_user_id 参数化（Node: m4 用例第 631 行 + 源码约束第 436 行）——

func TestSessionTgUserIDIsParameterized(t *testing.T) {
	db, mock := rwDB(t)
	// WithArgs(int64(77)) 就是「绑参」的证据：值只可能是验签结果里的数字。
	mock.ExpectQuery(regexp.QuoteMeta(sessionSQL)).WithArgs(int64(77)).
		WillReturnRows(sqlmock.NewRows([]string{"courier_id"}).AddRow("9"))
	fakeGateway, _ := rwOKGateway(t)
	route := New(Dep{BotToken: rwBotToken, ValidateInitData: rwValidate, DB: db,
		Gateway: fakeGateway, AllowedHosts: []string{"canary.fbird.men"}, Logf: rwSilentLogfn})
	if code := rwServe(t, route, rwBody("signed:77"), "").Code; code != http.StatusOK {
		t.Fatalf("应 200，实际 %d", code)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("SQL 未按绑定参数命中: %v", err)
	}
	// 注：真正的「SQL 只有一条、且不含 phone」由下面的源码扫描用例守。
}

// TestSQLIsSingleParameterizedSelect 是 Node 源码约束用例（第 436 行）的 Go 等价物：
// 本包只允许一条只读 SELECT，且 tg_user_id / courier_id 的取法固定。
func TestSQLIsSingleParameterizedSelect(t *testing.T) {
	raw, err := os.ReadFile("rider.go")
	if err != nil {
		t.Fatalf("读取 rider.go 失败: %v", err)
	}
	source := string(raw)

	if got := strings.Count(source, "QueryRowContext("); got != 1 {
		t.Fatalf("本包只允许一条 SQL（session 查绑定），实际发现 %d 处 QueryRowContext", got)
	}
	for _, forbidden := range []string{"ExecContext(", "Exec(", "db.Begin"} {
		if strings.Contains(source, forbidden) {
			t.Fatalf("session 是只读端点，源码里不该出现 %s", forbidden)
		}
	}
	// 拼接 SQL 的典型写法一律不允许。
	for _, forbidden := range []string{"Sprintf(sessionSQL", "sessionSQL +", "+ tgID", "fmt.Sprintf(\"SELECT"} {
		if strings.Contains(source, forbidden) {
			t.Fatalf("SQL 不得拼接（发现 %q）", forbidden)
		}
	}
	// 唯一的 SQL 常量必须按 tg_user_id 查、且用 ? 占位。
	wantSQL := "SELECT courier_id FROM fbs_courier_map WHERE tg_user_id = ? LIMIT 1"
	if !strings.Contains(source, wantSQL) {
		t.Fatalf("SQL 常量应逐字为 %q", wantSQL)
	}
	if strings.Contains(wantSQL, "phone") {
		t.Fatal("phone 不得进 SQL")
	}
}

// —— 9. 日志纪律：不记 initData、不记工作台 URL ——

func TestSessionLogsNoInitDataOrURL(t *testing.T) {
	const marker = "signed:77"
	var lines []string
	db, mock := rwDB(t)
	mock.ExpectQuery(regexp.QuoteMeta(sessionSQL)).WithArgs(int64(77)).
		WillReturnRows(sqlmock.NewRows([]string{"courier_id"}).AddRow("9"))
	// 让网关签出一个白名单外的 URL：错误分支会把消息写进日志，
	// 这正是最容易顺手把 URL 带出去的地方。
	const leakyURL = "https://evil.example.com/ql.html?token=SECRET-TOKEN"
	fakeGateway, _ := rwGateway(t, func(map[string]any) rwGatewayReply {
		return rwGatewayReply{body: `{"success":true,"data":{"url":"` + leakyURL + `"}}`}
	})
	route := New(Dep{BotToken: rwBotToken, ValidateInitData: rwValidate, DB: db,
		Gateway: fakeGateway, AllowedHosts: []string{"canary.fbird.men"},
		Logf: func(line string) { lines = append(lines, line) }})

	if code := rwServe(t, route, rwBody(marker), "").Code; code != http.StatusBadGateway {
		t.Fatalf("应 502，实际 %d", code)
	}
	if len(lines) == 0 {
		t.Fatal("失败分支应写一行日志（否则线上无从排查）")
	}
	joined := strings.Join(lines, "\n")
	if strings.Contains(joined, marker) {
		t.Fatalf("日志不得包含 initData：%s", joined)
	}
	if strings.Contains(joined, leakyURL) || strings.Contains(joined, "SECRET-TOKEN") {
		t.Fatalf("日志不得包含工作台 URL：%s", joined)
	}
	// 只记错误消息：应当能看到「消息」本身，否则日志就没有诊断价值。
	if !strings.Contains(joined, "invalid url") {
		t.Fatalf("日志应记录错误消息，实际：%s", joined)
	}
}

// —— 10. 构造期告警（Node 第 130-140 行；Node 测试未覆盖）——

func TestNewWarnsOnFailOpenWhitelistInProduction(t *testing.T) {
	var lines []string
	New(Dep{
		BotToken: rwBotToken, DB: nil, Gateway: nil,
		Env:  func(string) string { return "production" },
		Logf: func(line string) { lines = append(lines, line) },
	})
	joined := strings.Join(lines, "\n")
	if !strings.Contains(joined, "RIDER_NOT_CONFIGURED") && !strings.Contains(joined, "未配置") {
		t.Fatalf("未配置时应 warn 一行，实际：%s", joined)
	}

	lines = nil
	db, _ := rwDB(t)
	fakeGateway, _ := rwOKGateway(t)
	New(Dep{
		BotToken: rwBotToken, DB: db, Gateway: fakeGateway,
		AllowedHosts: nil,
		Env:          func(string) string { return "test-env" },
		Logf:         func(line string) { lines = append(lines, line) },
	})
	if len(lines) != 0 {
		t.Fatalf("非生产 + 全配置不该 warn，实际：%v", lines)
	}
}

// —— 11. 纯函数：parseFirstInt / AllowedHostsFromOrigins / isAllowedTarget ——

func TestParseFirstInt(t *testing.T) {
	cases := []struct {
		in   string
		want int64
		ok   bool
	}{
		{"9\n", 9, true},
		{"  42  ", 42, true},
		{"7\n8\n", 7, true}, // 只取首行
		{"9.7", 9, true},    // parseInt 取数字前缀
		{"9天", 9, true},     // 同上
		{"+12", 12, true},   // 显式正号
		{"", 0, false},      // 空输出 = 未绑定
		{"   ", 0, false},
		{"abc", 0, false},
		{"NULL", 0, false},                    // NULL 列的文本形态
		{"0", 0, false},                       // n > 0 才命中
		{"-3", 0, false},                      // 负数不算命中
		{"99999999999999999999999", 0, false}, // 超出 int64 → 非安全整数
	}
	for _, item := range cases {
		got, ok := parseFirstInt(item.in)
		if ok != item.ok || got != item.want {
			t.Fatalf("parseFirstInt(%q) = (%d,%v)，want (%d,%v)", item.in, got, ok, item.want, item.ok)
		}
	}
}

func TestAllowedHostsFromOrigins(t *testing.T) {
	// 对应 server.js 第 460 行：map(o => new URL(o).host).filter(Boolean)
	got := AllowedHostsFromOrigins([]string{
		"https://canary.fbird.men/",
		"https://a.example.com:8443/x",
		"  https://www.fbird.men  ",
		"canary.fbird.men", // 无 scheme → URL 解析不出 host → 丢弃
		"",                 // filter(Boolean)
	})
	want := []string{"canary.fbird.men", "a.example.com:8443", "www.fbird.men"}
	if len(got) != len(want) {
		t.Fatalf("白名单推导结果 %v，want %v", got, want)
	}
	for index := range want {
		if got[index] != want[index] {
			t.Fatalf("白名单推导结果 %v，want %v", got, want)
		}
	}
}

// TestAllowedHostsFromOriginsStripsDefaultPort 钉住 WHATWG 的默认端口归一。
//
// 回归来由：上一版用 url.Parse(o).Host，`CORS_ORIGINS=https://h:443` 会得到 "h:443"，
// 而网关签出的 url 经 new URL 归一后主机不带端口 → host 与 hostname 两条通道同时落空，
// 所有 bound:true 请求 502。既有用例只覆盖了非默认端口 :8443，两端一致，因此没抓到。
//
// 期望值不是猜的，是 Node 里跑出来的：
//
//	> new URL('https://h:443').host        'h'
//	> new URL('https://h:8443').host       'h:8443'
//	> new URL('http://h:80').host          'h'
//	> new URL('HTTP://H.EXAMPLE:80').host  'h.example'
//	> new URL('https://[::1]:443').host    '[::1]'
func TestAllowedHostsFromOriginsStripsDefaultPort(t *testing.T) {
	cases := []struct{ origin, want string }{
		{"https://h:443", "h"},               // 默认端口省略
		{"https://h:8443", "h:8443"},         // 非默认端口保留
		{"http://h:80", "h"},                 // http 默认端口
		{"HTTP://H.EXAMPLE:80", "h.example"}, // scheme 大小写 + 主机小写
		{"https://[::1]:443", "[::1]"},       // IPv6 保留方括号
		{"https://[::1]:8443", "[::1]:8443"}, // IPv6 非默认端口
		{"wss://h:443", "h"},                 // 其它特殊 scheme 同理
	}
	for _, c := range cases {
		got := AllowedHostsFromOrigins([]string{c.origin})
		if len(got) != 1 || got[0] != c.want {
			t.Fatalf("AllowedHostsFromOrigins(%q) = %v，want [%q]", c.origin, got, c.want)
		}
	}
}

// TestSessionBoundWithExplicitDefaultPortOrigin 是上面那条的端到端形态：
// 白名单写成带 :443 的 origin，网关签出的 url 不带端口，必须仍然 200。
func TestSessionBoundWithExplicitDefaultPortOrigin(t *testing.T) {
	db, mock := rwDB(t)
	mock.ExpectQuery(regexp.QuoteMeta(sessionSQL)).WithArgs(int64(77)).
		WillReturnRows(sqlmock.NewRows([]string{"courier_id"}).AddRow("101"))
	fakeGateway, _ := rwOKGateway(t)
	route := New(Dep{
		BotToken: rwBotToken, DB: db, Gateway: fakeGateway,
		AllowedHosts: AllowedHostsFromOrigins([]string{"https://canary.fbird.men:443"}),
		Logf:         rwSilentLogfn,
	})

	recorder := rwServe(t, route, rwBody(rwSignInitData(t, 77, rwBotToken, time.Now())), "")
	if recorder.Code != http.StatusOK {
		t.Fatalf("白名单写 :443 时 bound:true 应为 200，实际 %d：%s", recorder.Code, recorder.Body.String())
	}
}

// —— 12. 走真实 tgauth.Validate（Node 用例用的是真实验签实现）——

func TestSessionWithRealInitDataSignature(t *testing.T) {
	db, mock := rwDB(t)
	mock.ExpectQuery(regexp.QuoteMeta(sessionSQL)).WithArgs(int64(77)).
		WillReturnRows(sqlmock.NewRows([]string{"courier_id"}).AddRow("9"))
	fakeGateway, _ := rwOKGateway(t)
	// 不注入 ValidateInitData：走 tgauth.Validate 的真实 HMAC 校验。
	route := New(Dep{BotToken: rwBotToken, DB: db, Gateway: fakeGateway,
		AllowedHosts: []string{"canary.fbird.men"}, Logf: rwSilentLogfn})

	recorder := rwServe(t, route, rwBody(rwSignInitData(t, 77, rwBotToken, time.Now())), "")
	if recorder.Code != http.StatusOK {
		t.Fatalf("真实签名应 200，实际 %d（body=%s）", recorder.Code, recorder.Body.String())
	}

	// 用另一个 bot token 签出来的串打到本路由 → 401：
	// 证明默认的 tgauth.Validate 真的接上了，而不是「什么都能过」。
	bad := New(Dep{BotToken: rwBotToken, DB: db, Gateway: fakeGateway,
		AllowedHosts: []string{"canary.fbird.men"}, Logf: rwSilentLogfn})
	if code := rwServe(t, bad, rwBody(rwSignInitData(t, 77, "wrong-token", time.Now())), "").Code; code != http.StatusUnauthorized {
		t.Fatalf("签名与 bot token 不匹配应 401，实际 %d", code)
	}
}

// —— 13. 边界：非正 user.id 走 502（Node 的 /^\d+$/ 校验）——

func TestSessionNonDigitTgIDFails502(t *testing.T) {
	// 这条必须是「有 DB 但 tg id 非法」：DB 为 nil 会先命中 notConfigured，
	// 走的就不是要验的那条分支了。
	db, _ := rwDB(t)
	fakeGateway, calls := rwOKGateway(t)
	route := New(Dep{BotToken: rwBotToken, ValidateInitData: rwValidate, DB: db, Gateway: fakeGateway,
		AllowedHosts: []string{"canary.fbird.men"}, Logf: rwSilentLogfn})

	recorder := rwServe(t, route, rwBody("signed:-5"), "")
	if recorder.Code != http.StatusBadGateway {
		t.Fatalf("负数 user.id 应 502，实际 %d", recorder.Code)
	}
	if got := rwErrorCode(t, recorder.Body.String()); got != "RIDER_FAILED" {
		t.Fatalf("错误码应为 RIDER_FAILED，实际 %q", got)
	}
	if len(*calls) != 0 {
		t.Fatalf("非法 tg id 不该调网关，实际 %d 次", len(*calls))
	}
}

// —— 小工具 ——

// rwErrorCode 取响应体里的 error.code。
func rwErrorCode(t *testing.T, body string) string {
	t.Helper()
	var decoded struct {
		Error struct {
			Code string `json:"code"`
		} `json:"error"`
	}
	if err := json.Unmarshal([]byte(body), &decoded); err != nil {
		t.Fatalf("响应体不是 JSON: %v（body=%s）", err, body)
	}
	return decoded.Error.Code
}

// rwSignInitData 与 Node 测试里的 signInitData 同算法（HMAC-SHA256，secret = HMAC("WebAppData", botToken)）。
func rwSignInitData(t *testing.T, userID int64, botToken string, at time.Time) string {
	t.Helper()
	fields := map[string]string{
		"auth_date": strconv.FormatInt(at.Unix(), 10),
		"user":      fmt.Sprintf(`{"id":%d,"first_name":"R"}`, userID),
	}
	keys := make([]string, 0, len(fields))
	for key := range fields {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	pairs := make([]string, 0, len(keys))
	for _, key := range keys {
		pairs = append(pairs, key+"="+fields[key])
	}
	secret := hmacSHA256([]byte("WebAppData"), []byte(botToken))
	hash := hex.EncodeToString(hmacSHA256(secret, []byte(strings.Join(pairs, "\n"))))

	values := url.Values{}
	for key, value := range fields {
		values.Set(key, value)
	}
	values.Set("hash", hash)
	return values.Encode()
}

func hmacSHA256(key, message []byte) []byte {
	mac := hmac.New(sha256.New, key)
	mac.Write(message)
	return mac.Sum(nil)
}
