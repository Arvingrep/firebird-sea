package member

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	sqlmock "github.com/DATA-DOG/go-sqlmock"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// 迁移自 member.class.php:10363-10401 的 pay（#241）。
// 判定标准全部来自实测 PHP 7.4（本地 firebird-nginx :80）：
//
//	pay                        → 操作错误！
//	pay?ordertype=nosuch       → 操作错误！
//	pay?ordertype=0            → 操作错误！
//	pay?ordertype=_filter_x    → 操作错误！
//	pay?ordertype[]=message    → 操作错误！
//	pay?ordertype=message      → {"state":102,"info":"No data!"}（分发结果被丢弃）
//	pay?ordertype=message_filter_user → {"state":102,"info":"No data!"}
//	pay?ordertype=message_FILTER_user → 操作错误！（标记区分大小写）
//	pay?ordertype=MESSAGE      → {"state":102,"info":"No data!"}（方法名不区分大小写）

const (
	qPayLog     = "SELECT `body` FROM `huoniao_pay_log` WHERE `ordernum` = ?"
	qIM         = "SELECT `im_unread_count` FROM `huoniao_member` WHERE `id` = ?"
	payDieBody  = "操作错误！"
	payNoData   = `{"state":102,"info":"No data!"}`
	payLangText = "操作错误！"
)

// payURL 拼出 pay 的请求路径。
func payURL(query string) string {
	return "/include/ajax.php?service=member&action=pay" + query
}

// expectMessageList 期待分发到 message 的列表分支：匿名 uid = -1、state 未传 → 3 条计数。
// 分发成功后返回值被丢弃，pay 一律落 102，所以这里只用来证明「确实调用了 message」。
func expectMessageList(m sqlmock.Sqlmock, uid any) {
	m.ExpectQuery(qUnread).WithArgs(uid).WillReturnRows(count(0))
	m.ExpectQuery(qRead).WithArgs(uid).WillReturnRows(count(0))
	m.ExpectQuery(qTotal).WithArgs(uid).WillReturnRows(count(0))
}

func doRaw(t *testing.T, svc *Service, target string) *httptest.ResponseRecorder {
	t.Helper()
	router := ajax.NewRouter(func(string) {})
	Register(router, svc)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, target, nil))
	return rec
}

// die 分支：纯文本、HTTP 200、不套 JSONP，且完全不碰 pay_log（ordertype 非空时）。
func TestPayDieWithoutDispatch(t *testing.T) {
	for _, q := range []string{
		"",                               // 没有 ordertype、没有 ordernum
		"&ordertype=",                    // 显式空串
		"&ordertype=0",                   // "0" 是 empty
		"&ordertype[]=message",           // 数组：explode 拿不到字符串
		"&ordertype=nosuch",              // 方法不存在
		"&ordertype=_filter_x",           // 截断后是空串
		"&ordertype=message_FILTER_user", // 标记区分大小写 → 未知方法
		"&ordertype=pay",                 // 自身：PHP 无限递归 500，Go 按未知方法处理
		"&ordertype=updateAccount",       // 凭证类，排除在白名单外
		"&ordertype=deposit",             // 资金类永久排除（D-5/Q2）
		"&ordertype=joinPay",             // 资金类永久排除（D-5/Q2）
	} {
		svc, m := newService(t, nil)
		rec := doRaw(t, svc, payURL(q))
		if body := rec.Body.String(); body != payLangText {
			t.Fatalf("%s 响应体 = %q, want %q", q, body, payLangText)
		}
		// die 分支走的是 ajax.Raw：Content-Type 与 PHP 默认值一致，且不是 application/json。
		if ct := rec.Header().Get("Content-Type"); ct != "text/html; charset=utf-8" {
			t.Fatalf("%s Content-Type = %q", q, ct)
		}
		met(t, m)
	}
}

// die 分支不套 JSONP 回调：PHP 在 die 之前没有走到末尾的 callback 包装。
func TestPayDieIgnoresCallback(t *testing.T) {
	svc, _ := newService(t, nil)
	rec := doRaw(t, svc, payURL("&callback=cb&ordertype=nosuch"))
	eq(t, rec.Body.String(), payLangText)
}

// 白名单命中：分发到 message，返回值被丢弃 → 102。
func TestPayDispatchWhitelisted(t *testing.T) {
	svc, m := newService(t, nil)
	expectMessageList(m, -1)
	eq(t, do(t, svc, "GET", payURL("&ordertype=message"), ""), payNoData)
	met(t, m)
}

// 方法名不区分大小写：ordertype=MESSAGE 命中 message。
func TestPayDispatchCaseInsensitive(t *testing.T) {
	svc, m := newService(t, nil)
	expectMessageList(m, -1)
	eq(t, do(t, svc, "GET", payURL("&ordertype=MESSAGE"), ""), payNoData)
	met(t, m)
}

// _filter_ 截断：message_filter_user → message。
func TestPayDispatchStripsFilterSuffix(t *testing.T) {
	svc, m := newService(t, nil)
	expectMessageList(m, -1)
	eq(t, do(t, svc, "GET", payURL("&ordertype=message_filter_user"), ""), payNoData)
	met(t, m)
}

// ① 回查 pay_log：ordertype 为空 + ordernum 命中 → 用 body['type'] 分发。
func TestPayResolvesTypeFromPayLog(t *testing.T) {
	svc, m := newService(t, nil)
	m.ExpectQuery(qPayLog).WithArgs("SN1").
		WillReturnRows(sqlmock.NewRows([]string{"body"}).AddRow(`a:1:{s:4:"type";s:7:"message";}`))
	expectMessageList(m, -1)
	eq(t, do(t, svc, "GET", payURL("&ordernum=SN1"), ""), payNoData)
	met(t, m)
}

// ① 的 array_merge：body 里的同名键覆盖请求参数。
// 请求里 userid=2、body 里 userid=9 → message 按 uid=9 查（覆盖生效）；不覆盖则会用 "2"。
func TestPayPayLogBodyOverridesParams(t *testing.T) {
	svc, m := newService(t, nil)
	m.ExpectQuery(qPayLog).WithArgs("SN2").
		WillReturnRows(sqlmock.NewRows([]string{"body"}).
			AddRow(`a:2:{s:4:"type";s:7:"message";s:6:"userid";s:1:"9";}`))
	expectMessageList(m, "9")
	eq(t, do(t, svc, "GET", payURL("&ordernum=SN2&userid=2"), ""), payNoData)
	met(t, m)
}

// ① 查不到 / body 不是 serialize 数组 / 解析失败 → ordertype 仍为空 → 操作错误。
func TestPayPayLogFallbacksDie(t *testing.T) {
	for name, row := range map[string]string{
		"body 为普通字符串":        `s:3:"abc";`,
		"body 为 int":         `i:5;`,
		"body 是空数组":          `a:0:{}`,
		"body 是损坏的序列化":       `a:1:{s:4:"type";`,
		"body 没有 type 键":     `a:1:{s:2:"im";s:1:"1";}`,
		"body 的 type 是 null": `a:1:{s:4:"type";N;}`,
		"body 的 type 是数组":    `a:1:{s:4:"type";a:1:{i:0;s:7:"message";}}`,
	} {
		svc, m := newService(t, nil)
		m.ExpectQuery(qPayLog).WithArgs("SN3").
			WillReturnRows(sqlmock.NewRows([]string{"body"}).AddRow(row))
		got := do(t, svc, "GET", payURL("&ordernum=SN3"), "")
		if got != payDieBody {
			t.Fatalf("%s: 响应体 = %q, want %q", name, got, payDieBody)
		}
		met(t, m)
	}
}

// ① 的 type 是整数 → 转成 "5" → 未知方法 → 操作错误（PHP explode(5) 得 "5"）。
func TestPayPayLogIntTypeDies(t *testing.T) {
	svc, m := newService(t, nil)
	m.ExpectQuery(qPayLog).WithArgs("SN4").
		WillReturnRows(sqlmock.NewRows([]string{"body"}).AddRow(`a:1:{s:4:"type";i:5;}`))
	eq(t, do(t, svc, "GET", payURL("&ordernum=SN4"), ""), payDieBody)
	met(t, m)
}

// ① pay_log 查不到行 / SQL 出错 / 没有 db 连接，都按「没有结果」→ 操作错误。
func TestPayPayLogMissing(t *testing.T) {
	t.Run("没有行", func(t *testing.T) {
		svc, m := newService(t, nil)
		m.ExpectQuery(qPayLog).WithArgs("SN5").WillReturnRows(sqlmock.NewRows([]string{"body"}))
		eq(t, do(t, svc, "GET", payURL("&ordernum=SN5"), ""), payDieBody)
		met(t, m)
	})
	t.Run("SQL 出错", func(t *testing.T) {
		svc, m := newService(t, nil)
		m.ExpectQuery(qPayLog).WithArgs("SN6").WillReturnError(errors.New("boom"))
		eq(t, do(t, svc, "GET", payURL("&ordernum=SN6"), ""), payDieBody)
		met(t, m)
	})
	t.Run("body 为 NULL", func(t *testing.T) {
		svc, m := newService(t, nil)
		m.ExpectQuery(qPayLog).WithArgs("SN7").
			WillReturnRows(sqlmock.NewRows([]string{"body"}).AddRow(nil))
		eq(t, do(t, svc, "GET", payURL("&ordernum=SN7"), ""), payDieBody)
		met(t, m)
	})
	t.Run("没有 db", func(t *testing.T) {
		svc, err := New(Dep{TablePrefix: "huoniao_"})
		if err != nil {
			t.Fatalf("New: %v", err)
		}
		eq(t, do(t, svc, "GET", payURL("&ordernum=SN8"), ""), payDieBody)
	})
}

// ordernum="0" 是 empty → 不回查 pay_log，直接操作错误。
func TestPayZeroOrdernumSkipsLookup(t *testing.T) {
	svc, m := newService(t, nil)
	eq(t, do(t, svc, "GET", payURL("&ordernum=0"), ""), payDieBody)
	met(t, m)
}

// POST 与 GET 同口径（分发不看 verb，取值都来自合并后的 $param）。
func TestPayPostDie(t *testing.T) {
	svc, _ := newService(t, nil)
	eq(t, do(t, svc, "POST", payURL(""), "ordertype=nosuch"), payDieBody)
}

// 白名单只收已注册且非资金的方法：payExcluded 与注册表不应有交集漏项。
func TestPayRoutesExcludeFundAndSelf(t *testing.T) {
	svc, _ := newService(t, nil)
	for key := range payExcluded {
		if _, exists := svc.payRoutes[key]; exists {
			t.Fatalf("%s 不应出现在 pay 分发白名单", key)
		}
	}
	// 白名单内容与「已注册的非资金 action」逐项对齐（新增 action 时要同步这里）。
	want := map[string]bool{
		"message": true, "reward": true, "getcomment": true, "detail": true,
		"followmember": true, "collect": true, "getzan": true,
		"replycomment": true, "dingcomment": true, "sendcomment": true,
	}
	if len(svc.payRoutes) != len(want) {
		t.Fatalf("白名单大小 = %d, want %d: %v", len(svc.payRoutes), len(want), svc.payRoutes)
	}
	for key := range svc.payRoutes {
		if !want[key] {
			t.Fatalf("白名单多出 %s", key)
		}
	}
}

// 旧的 payLangText 常量与 PHP 文案必须一致。
func TestPayLangText(t *testing.T) {
	if strings.TrimSpace(infoOperationError) != payLangText {
		t.Fatalf("infoOperationError = %q", infoOperationError)
	}
}
