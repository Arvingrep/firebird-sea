package article

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strconv"
	"strings"
	"testing"

	sqlmock "github.com/DATA-DOG/go-sqlmock"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

const (
	smCountSQL  = "SELECT COUNT(`id`) total FROM `huoniao_article_selfmedia` WHERE `state` = 1"
	smListCols  = "SELECT `id`, `userid`, `type`, `ac_name`, `ac_profile`, `ac_field`, `ac_photo`, `pubdate` FROM `huoniao_article_selfmedia` WHERE `state` = 1"
	smOrderDef  = " ORDER BY `weight` DESC, `id` DESC"
	smArtSQL    = "SELECT COUNT(`id`) c FROM `huoniao_articlelist_all` WHERE `admin` = ? AND `arcrank` = 1 AND `waitpay` = 0 AND `del` = 0"
	smClickSQL  = "SELECT SUM(`click`) c FROM `huoniao_articlelist_all` WHERE `admin` = ? AND `arcrank` = 1 AND `waitpay` = 0 AND `del` = 0"
	smFansSQL   = "SELECT COUNT(`id`) c FROM `huoniao_member_follow` WHERE `fid` = ?"
	smFollowSQL = "SELECT `id` FROM `huoniao_member_follow` WHERE `tid` = ? AND `fid` = ? LIMIT 1"
)

var smListColNames = []string{"id", "userid", "type", "ac_name", "ac_profile", "ac_field", "ac_photo", "pubdate"}

// smServePost 走一遍 POST 表单请求。
func smServePost(t *testing.T, svc *Service, target, body string) string {
	t.Helper()
	router := ajax.NewRouter(func(string) {})
	Register(router, svc)
	req := httptest.NewRequest(http.MethodPost, target, strings.NewReader(body))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, req)
	return recorder.Body.String()
}

// smExpectStats 期望某个 userid 的三条统计查询。
func smExpectStats(mock sqlmock.Sqlmock, userid int64, articles, clicks, fans any) {
	mock.ExpectQuery(smArtSQL).WithArgs(userid).WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow(articles))
	mock.ExpectQuery(smClickSQL).WithArgs(userid).WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow(clicks))
	mock.ExpectQuery(smFansSQL).WithArgs(userid).WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow(fans))
}

func smMet(t *testing.T, mock sqlmock.Sqlmock) {
	t.Helper()
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("SQL 期望未满足: %v", err)
	}
}

// 正常：默认分页、未登录 → isfollow=0；type 映射、统计转型、totalCount 字符串、totalPage 浮点。
func TestSelfmediaNormalAnonymous(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(smCountSQL).WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("2"))
	mock.ExpectQuery(smListCols + smOrderDef + " LIMIT 0, 10").WillReturnRows(
		sqlmock.NewRows(smListColNames).
			AddRow("1", "3", "1", "张三", "简介", "0", "/u/a.jpg", "1791615275").
			AddRow("2", "8", "9", "李四", nil, "7", "", "1791615000"),
	)
	smExpectStats(mock, 3, "6", "50", "2")
	smExpectStats(mock, 8, "0", nil, "0")

	got := serve(t, svc, "/include/ajax.php?service=article&action=selfmedia")
	want := `{"state":100,"info":{"pageInfo":{"page":1,"pageSize":10,"totalPage":1,"totalCount":"2"},"list":[` +
		`{"id":"1","typeid":"1","type":"个人/自媒体","name":"张三","profile":"简介","field":"0","photo":"","pubdate":"1791615275","total_article":6,"click":50,"total_fans":"2","url":"","isfollow":0},` +
		`{"id":"2","typeid":"9","type":null,"name":"李四","profile":null,"field":"7","photo":"","pubdate":"1791615000","total_article":0,"click":0,"total_fans":"0","url":"","isfollow":0}]}}`
	if got != want {
		t.Fatalf("响应体 = %s\nwant     %s", got, want)
	}
	smMet(t, mock)
}

// 筛选参数全部生效：type、ac_field、title（三列 LIKE）、orderby=time、分页。
func TestSelfmediaFilters(t *testing.T) {
	svc, mock := newService(t)
	where := " AND `type` = ? AND `ac_field` = ? AND (`ac_name` LIKE ? OR `ac_profile` LIKE ? OR `ac_field` LIKE ?)"
	mock.ExpectQuery(smCountSQL+where).WithArgs(2, 5, "%新闻%", "%新闻%", "%新闻%").
		WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("7"))
	mock.ExpectQuery(smListCols+where+" ORDER BY `pubdate` DESC LIMIT 3, 3").WithArgs(2, 5, "%新闻%", "%新闻%", "%新闻%").
		WillReturnRows(sqlmock.NewRows(smListColNames))
	got := serve(t, svc, "/include/ajax.php?service=article&action=selfmedia&type=2&ac_field=5abc&title=%E6%96%B0%E9%97%BB&orderby=time&page=2&pageSize=3&cityid=1")
	want := `{"state":100,"info":{"pageInfo":{"page":2,"pageSize":3,"totalPage":3,"totalCount":"7"},"list":[]}}`
	if got != want {
		t.Fatalf("响应体 = %s\nwant     %s", got, want)
	}
	smMet(t, mock)
}

// 参数错误：PHP 宽松转型，全部落到「不筛 / 默认值」，不是报错。
func TestSelfmediaBadParamsFallBack(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(smCountSQL).WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("1"))
	mock.ExpectQuery(smListCols + smOrderDef + " LIMIT 0, 10").WillReturnRows(sqlmock.NewRows(smListColNames))
	got := serve(t, svc, "/include/ajax.php?service=article&action=selfmedia&type=abc&ac_field=0&title=0&orderby=TIME&page=-3&pageSize=abc&isAjax=x")
	want := `{"state":100,"info":{"pageInfo":{"page":1,"pageSize":10,"totalPage":1,"totalCount":"1"},"list":[]}}`
	if got != want {
		t.Fatalf("响应体 = %s\nwant     %s", got, want)
	}
	smMet(t, mock)
}

// title=undefined 被 ajax.php 改写成 ""，不筛。
func TestSelfmediaTitleUndefined(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(smCountSQL).WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("0"))
	got := serve(t, svc, "/include/ajax.php?service=article&action=selfmedia&title=undefined")
	if got != `{"state":101,"info":"暂无数据"}` {
		t.Fatalf("响应体 = %s", got)
	}
	smMet(t, mock)
}

// 空结果：COUNT=0 → 101 暂无数据，不再查列表。
func TestSelfmediaEmpty(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(smCountSQL + " AND `type` = ?").WithArgs(4).WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("0"))
	got := serve(t, svc, "/include/ajax.php?service=article&action=selfmedia&type=4")
	if got != `{"state":101,"info":"暂无数据"}` {
		t.Fatalf("响应体 = %s", got)
	}
	smMet(t, mock)
}

// COUNT 查询失败：PHP totalCount 为 null，== 0 → 同样是暂无数据。
func TestSelfmediaCountError(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(smCountSQL).WillReturnError(errors.New("boom"))
	got := serve(t, svc, "/include/ajax.php?service=article&action=selfmedia")
	if got != `{"state":101,"info":"暂无数据"}` {
		t.Fatalf("响应体 = %s", got)
	}
}

// 列表查询失败：PHP 跳过组装，pageInfo 照出、list=[]。
func TestSelfmediaListError(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(smCountSQL).WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("3"))
	mock.ExpectQuery(smListCols + smOrderDef + " LIMIT 0, 2").WillReturnError(errors.New("boom"))
	got := serve(t, svc, "/include/ajax.php?service=article&action=selfmedia&pageSize=2")
	want := `{"state":100,"info":{"pageInfo":{"page":1,"pageSize":2,"totalPage":2,"totalCount":"3"},"list":[]}}`
	if got != want {
		t.Fatalf("响应体 = %s\nwant     %s", got, want)
	}
}

// 统计查询失败：total_article/click (int) 失败串 → 0；total_fans 无转型 → 失败串原样。
func TestSelfmediaStatsError(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(smCountSQL).WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("1"))
	mock.ExpectQuery(smListCols + smOrderDef + " LIMIT 0, 10").WillReturnRows(
		sqlmock.NewRows(smListColNames).AddRow("1", "3", "5", "n", "p", "f", nil, "1"))
	mock.ExpectQuery(smArtSQL).WithArgs(int64(3)).WillReturnError(errors.New("boom"))
	mock.ExpectQuery(smClickSQL).WithArgs(int64(3)).WillReturnError(errors.New("boom"))
	mock.ExpectQuery(smFansSQL).WithArgs(int64(3)).WillReturnError(errors.New("boom"))
	got := serve(t, svc, "/include/ajax.php?service=article&action=selfmedia")
	if !strings.Contains(got, `"type":"其他组织"`) ||
		!strings.Contains(got, `"total_article":0,"click":0,"total_fans":"{\"state\": 200, \"info\": \"操作失败！\"}"`) {
		t.Fatalf("响应体 = %s", got)
	}
	smMet(t, mock)
}

// from 非空即作为 loginUid（Q1 现状复刻）：自己 → 2；已关注 → 1；未关注 → 0。
func TestSelfmediaIsFollowFrom(t *testing.T) {
	cases := []struct {
		from     string
		follow   bool // 是否期望 member_follow 查询
		hasRow   bool
		isfollow string
	}{
		{"3", false, false, `"isfollow":2`},
		{"4", true, true, `"isfollow":1`},
		{"9", true, false, `"isfollow":0`},
		// 非数字 from 拼进 SQL 报错 → dsql 失败串为真值 → 1（canary 实测 from=abc → 1）。
		{"abc", false, false, `"isfollow":1`},
		{"4abc", false, false, `"isfollow":1`},
		{"-5", false, false, `"isfollow":0`},
		{"1.5", false, false, `"isfollow":0`},
		{"3.0", false, false, `"isfollow":2`},
		{" 4", true, true, `"isfollow":1`},
	}
	for _, c := range cases {
		t.Run("from="+c.from, func(t *testing.T) {
			svc, mock := newService(t)
			mock.ExpectQuery(smCountSQL).WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("1"))
			mock.ExpectQuery(smListCols + smOrderDef + " LIMIT 0, 10").WillReturnRows(
				sqlmock.NewRows(smListColNames).AddRow("1", "3", "1", "n", "p", "0", "", "1"))
			smExpectStats(mock, 3, "6", "50", "2")
			if c.follow {
				rows := sqlmock.NewRows([]string{"id"})
				if c.hasRow {
					rows.AddRow("11")
				}
				mock.ExpectQuery(smFollowSQL).WithArgs(mustParse(c.from), int64(3)).WillReturnRows(rows)
			}
			got := serve(t, svc, "/include/ajax.php?service=article&action=selfmedia&from="+url.QueryEscape(c.from))
			if !strings.Contains(got, c.isfollow) {
				t.Fatalf("响应体 = %s，want %s", got, c.isfollow)
			}
			smMet(t, mock)
		})
	}
}

func mustParse(s string) int64 {
	n, err := strconv.ParseInt(strings.TrimSpace(s), 10, 64)
	if err != nil {
		panic(err)
	}
	return n
}

type fakeMembers struct {
	uid int64
	err error
}

func (f fakeMembers) MemberID(context.Context, *http.Request) (int64, error) { return f.uid, f.err }

// 登录态来自 MemberResolver（cookie）：登录者关注了该自媒体 → 1；识别失败按未登录 → 0。
func TestSelfmediaIsFollowLoggedIn(t *testing.T) {
	for _, c := range []struct {
		name     string
		members  fakeMembers
		follow   bool
		isfollow string
	}{
		{"已登录已关注", fakeMembers{uid: 4}, true, `"isfollow":1`},
		{"已登录是自己", fakeMembers{uid: 3}, false, `"isfollow":2`},
		{"未登录", fakeMembers{uid: -1}, false, `"isfollow":0`},
		{"识别失败", fakeMembers{err: errors.New("db down")}, false, `"isfollow":0`},
	} {
		t.Run(c.name, func(t *testing.T) {
			svc, mock := newService(t)
			svc.members = c.members
			mock.ExpectQuery(smCountSQL).WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("1"))
			mock.ExpectQuery(smListCols + smOrderDef + " LIMIT 0, 10").WillReturnRows(
				sqlmock.NewRows(smListColNames).AddRow("1", "3", "1", "n", "p", "0", "", "1"))
			smExpectStats(mock, 3, "6", "50", "2")
			if c.follow {
				mock.ExpectQuery(smFollowSQL).WithArgs(int64(4), int64(3)).WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow("1"))
			}
			got := serve(t, svc, "/include/ajax.php?service=article&action=selfmedia")
			if !strings.Contains(got, c.isfollow) {
				t.Fatalf("响应体 = %s，want %s", got, c.isfollow)
			}
			smMet(t, mock)
		})
	}
}

// POST 通道：page 只 (int) 不取默认，负数拼出非法 LIMIT → list 为空，pageInfo 照出。
func TestSelfmediaPostNegativePage(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(smCountSQL).WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("1"))
	got := smServePost(t, svc, "/include/ajax.php?service=article&action=selfmedia", "page=-1&pageSize=5")
	want := `{"state":100,"info":{"pageInfo":{"page":-1,"pageSize":5,"totalPage":1,"totalCount":"1"},"list":[]}}`
	if got != want {
		t.Fatalf("响应体 = %s\nwant     %s", got, want)
	}
	smMet(t, mock)
}

// 越界页：totalCount>0、LIMIT 越界 → 仍是 100，list=[]。page 封顶 50000。
func TestSelfmediaPageOverflow(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(smCountSQL).WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("1"))
	mock.ExpectQuery(smListCols + smOrderDef + " LIMIT 499990, 10").WillReturnRows(sqlmock.NewRows(smListColNames))
	got := serve(t, svc, "/include/ajax.php?service=article&action=selfmedia&page=99999")
	want := `{"state":100,"info":{"pageInfo":{"page":50000,"pageSize":10,"totalPage":1,"totalCount":"1"},"list":[]}}`
	if got != want {
		t.Fatalf("响应体 = %s\nwant     %s", got, want)
	}
	smMet(t, mock)
}

func TestSelfmediaNoDB(t *testing.T) {
	svc, err := New(Dep{DB: nil, TablePrefix: "huoniao_"})
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	got := serve(t, svc, "/include/ajax.php?service=article&action=selfmedia")
	if got != `{"state":101,"info":"暂无数据"}` {
		t.Fatalf("响应体 = %s", got)
	}
}

// member_follow 查询失败：PHP 拿到失败串（真值）→ isfollow=1。
func TestSelfmediaFollowQueryError(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(smCountSQL).WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("1"))
	mock.ExpectQuery(smListCols + smOrderDef + " LIMIT 0, 10").WillReturnRows(
		sqlmock.NewRows(smListColNames).AddRow("1", "3", "1", "n", "p", "0", "", "1"))
	smExpectStats(mock, 3, "6", "50", "2")
	mock.ExpectQuery(smFollowSQL).WithArgs(int64(4), int64(3)).WillReturnError(errors.New("boom"))
	got := serve(t, svc, "/include/ajax.php?service=article&action=selfmedia&from=4")
	if !strings.Contains(got, `"isfollow":1`) {
		t.Fatalf("响应体 = %s", got)
	}
	smMet(t, mock)
}

// 与 canary PHP 实测响应逐字节对齐（2026-11-12，from=4；PHP 的 \/ 已还原为 /，
// photo/url 按裁决 A 置空）。数据：id=1, userid=3, type=1, arts=6, click=52, fans=2。
func TestSelfmediaMatchesCanaryPHP(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(smCountSQL).WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("1"))
	mock.ExpectQuery(smListCols + smOrderDef + " LIMIT 0, 10").WillReturnRows(
		sqlmock.NewRows(smListColNames).AddRow("1", "3", "1", "News Sync Bot",
			"AI æ–°é—»åŒæ­¥æœºå™¨äºº", "0", "", "1791615275"))
	smExpectStats(mock, 3, "6", "52", "2")
	mock.ExpectQuery(smFollowSQL).WithArgs(int64(4), int64(3)).WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow("9"))
	got := serve(t, svc, "/include/ajax.php?service=article&action=selfmedia&from=4")
	want := `{"state":100,"info":{"pageInfo":{"page":1,"pageSize":10,"totalPage":1,"totalCount":"1"},"list":[{"id":"1","typeid":"1","type":"个人/自媒体","name":"News Sync Bot","profile":"AI æ–°é—»åŒæ­¥æœºå™¨äºº","field":"0","photo":"","pubdate":"1791615275","total_article":6,"click":52,"total_fans":"2","url":"","isfollow":1}]}}`
	if got != want {
		t.Fatalf("响应体 = %s\nwant     %s", got, want)
	}
	smMet(t, mock)
}
