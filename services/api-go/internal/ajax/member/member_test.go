package member

import (
	"context"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	sqlmock "github.com/DATA-DOG/go-sqlmock"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

type fakeIdentity int64

func (f fakeIdentity) MemberID(context.Context, *http.Request) (int64, error) { return int64(f), nil }

func newService(t *testing.T, identity Identity) (*Service, sqlmock.Sqlmock) {
	t.Helper()
	db, mock, err := sqlmock.New(sqlmock.QueryMatcherOption(sqlmock.QueryMatcherEqual))
	if err != nil {
		t.Fatalf("sqlmock: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })
	svc, err := New(Dep{DB: db, TablePrefix: "huoniao_", Identity: identity})
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	return svc, mock
}

func do(t *testing.T, svc *Service, method, target, form string) string {
	t.Helper()
	router := ajax.NewRouter(func(string) {})
	Register(router, svc)
	var body *strings.Reader
	if form != "" {
		body = strings.NewReader(form)
	} else {
		body = strings.NewReader("")
	}
	req := httptest.NewRequest(method, target, body)
	if method == http.MethodPost {
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	}
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)
	return rec.Body.String()
}

const (
	qUnread = "SELECT COUNT(*) FROM `huoniao_member_letter_log` WHERE `uid` = ? AND `state` = 0"
	qRead   = "SELECT COUNT(*) FROM `huoniao_member_letter_log` WHERE `uid` = ? AND `state` = 1"
	qTotal  = "SELECT COUNT(*) FROM `huoniao_member_letter_log` WHERE `uid` = ?"
	qTotalS = "SELECT COUNT(*) FROM `huoniao_member_letter_log` WHERE `uid` = ? AND `state` = ?"
	qUp     = "SELECT COUNT(*) FROM `huoniao_public_up_all` WHERE `isread` = 0 AND `uid` = ?"
	qCmtIDs = "SELECT `id` FROM `huoniao_public_comment_all` WHERE `ischeck` = 1 AND `userid` = ?"
	qList   = "SELECT log.`id`, log.`state`, l.`title`, l.`date`, l.`body`, l.`urlParam` FROM `huoniao_member_letter_log` log LEFT JOIN `huoniao_member_letter` l ON l.`id` = log.`lid` WHERE log.`uid` = ? ORDER BY log.`id` DESC LIMIT ?, ?"
	qListS  = "SELECT log.`id`, log.`state`, l.`title`, l.`date`, l.`body`, l.`urlParam` FROM `huoniao_member_letter_log` log LEFT JOIN `huoniao_member_letter` l ON l.`id` = log.`lid` WHERE log.`uid` = ? AND log.`state` = ? ORDER BY log.`id` DESC LIMIT ?, ?"
)

func count(n int) *sqlmock.Rows { return sqlmock.NewRows([]string{"c"}).AddRow(n) }

func expectCounts(m sqlmock.Sqlmock, uid any, unread, read, total int) {
	m.ExpectQuery(qUnread).WithArgs(uid).WillReturnRows(count(unread))
	m.ExpectQuery(qRead).WithArgs(uid).WillReturnRows(count(read))
	m.ExpectQuery(qTotal).WithArgs(uid).WillReturnRows(count(total))
}

func met(t *testing.T, m sqlmock.Sqlmock) {
	t.Helper()
	if err := m.ExpectationsWereMet(); err != nil {
		t.Fatalf("SQL 期望未满足: %v", err)
	}
}

func eq(t *testing.T, got, want string) {
	t.Helper()
	if got != want {
		t.Fatalf("响应体 = %s\nwant     %s", got, want)
	}
}

// 无任何参数：$type 是 int 0，0 == 'tongji' → 统计分支，没有 list，匿名 uid = -1。
func TestNoParamsIsTongjiForAnonymous(t *testing.T) {
	svc, m := newService(t, nil)
	m.ExpectQuery(qUp).WithArgs(int64(-1)).WillReturnRows(count(0))
	m.ExpectQuery(qCmtIDs).WithArgs(int64(-1)).WillReturnRows(sqlmock.NewRows([]string{"id"}))
	m.ExpectQuery("SELECT COUNT(*) FROM `huoniao_public_comment_all` WHERE `isread` = 0 AND `masterid` = ? AND `sid` = 0").
		WithArgs(int64(-1)).WillReturnRows(count(0))
	expectCounts(m, int64(-1), 0, 0, 0)
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=message", "")
	eq(t, got, `{"state":100,"info":{"pageInfo":{"page":1,"pageSize":10,"totalPage":0.0,"totalCount":0,"unread":0,"read":0,"upunread":0,"commentunread":0,"total":0}}}`)
	met(t, m)
}

// 不传 state：totalPage = ceil(unread/pageSize)；列表按 id 倒序，字段类型照 PHP（id/state/timestamp 为字符串）。
func TestListStateOmitted(t *testing.T) {
	svc, m := newService(t, nil)
	expectCounts(m, "2", 3, 0, 3)
	m.ExpectQuery(qList).WithArgs("2", 0, 10).WillReturnRows(
		sqlmock.NewRows([]string{"id", "state", "title", "date", "body", "urlParam"}).
			AddRow("8", "0", "标题", "1794215411", `{"remark": {"value": "x/y"}, "first": {"value":"a"}}`, `a:1:{s:7:"service";s:6:"member";}`).
			AddRow("7", "0", nil, nil, "纯文本", ""))
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=message&userid=2", "")
	eq(t, got, `{"state":100,"info":{"pageInfo":{"page":1,"pageSize":10,"totalPage":1.0,"totalCount":3,"unread":3,"read":0},"list":[`+
		`{"date":"2026-11-09 17:10:11","timestamp":"1794215411","state":"0","title":"标题","id":"8","body":{"remark":{"value":"x/y"},"first":{"value":"a"}},"url":""},`+
		`{"date":"1970-01-01 08:00:00","timestamp":null,"state":"0","title":null,"id":"7","body":"纯文本","url":""}]}}`)
	met(t, m)
}

// state=0 / 空串 / abc 都被归一成 ""：不过滤，totalPage 分子是 totalCount。
func TestStateZeroUsesTotalCount(t *testing.T) {
	for _, q := range []string{"state=0", "state=", "state=abc"} {
		svc, m := newService(t, nil)
		expectCounts(m, "2", 3, 0, 3)
		m.ExpectQuery(qList).WithArgs("2", 0, 2).WillReturnRows(sqlmock.NewRows([]string{"id", "state", "title", "date", "body", "urlParam"}))
		got := do(t, svc, "GET", "/include/ajax.php?service=member&action=message&userid=2&pageSize=2&"+q, "")
		eq(t, got, `{"state":100,"info":{"pageInfo":{"page":1,"pageSize":2,"totalPage":2.0,"totalCount":3,"unread":3,"read":0},"list":[]}}`)
		met(t, m)
	}
}

// 不传 state 且全已读：分子是 unread=0 → totalPage 0（最容易漏的一条）。
func TestStateOmittedAllRead(t *testing.T) {
	svc, m := newService(t, nil)
	expectCounts(m, "9", 0, 3, 3)
	m.ExpectQuery(qList).WithArgs("9", 0, 2).WillReturnRows(sqlmock.NewRows([]string{"id", "state", "title", "date", "body", "urlParam"}))
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=message&userid=9&pageSize=2", "")
	eq(t, got, `{"state":100,"info":{"pageInfo":{"page":1,"pageSize":2,"totalPage":0.0,"totalCount":3,"unread":0,"read":3},"list":[]}}`)
	met(t, m)
}

func TestStateOneAndMulti(t *testing.T) {
	cases := []struct {
		q          string
		stateArg   int64
		unread     int
		read       int
		total      int
		totalPages string
	}{
		{"state=1", 1, 0, 3, 3, "2.0"},   // ceil(read/2)
		{"state=1,2", 1, 0, 3, 3, "2.0"}, // "1,2" == 1 → 取 read
		{"state=0,1", 0, 3, 0, 3, "2.0"}, // "0,1" == 0 → 取 unread
	}
	for _, c := range cases {
		svc, m := newService(t, nil)
		m.ExpectQuery(qUnread).WithArgs("9").WillReturnRows(count(c.unread))
		m.ExpectQuery(qRead).WithArgs("9").WillReturnRows(count(c.read))
		m.ExpectQuery(qTotalS).WithArgs("9", c.stateArg).WillReturnRows(count(c.total))
		m.ExpectQuery(qListS).WithArgs("9", c.stateArg, 0, 2).WillReturnRows(sqlmock.NewRows([]string{"id", "state", "title", "date", "body", "urlParam"}))
		got := do(t, svc, "GET", "/include/ajax.php?service=member&action=message&userid=9&pageSize=2&"+c.q, "")
		if !strings.Contains(got, `"totalPage":`+c.totalPages+`,`) {
			t.Fatalf("%s: %s", c.q, got)
		}
		met(t, m)
	}
}

// state 过滤后 0 行 → 101「暂无数据！」。
func TestFilteredEmptyIs101(t *testing.T) {
	svc, m := newService(t, nil)
	expectCounts2 := func() {
		m.ExpectQuery(qUnread).WithArgs("2").WillReturnRows(count(3))
		m.ExpectQuery(qRead).WithArgs("2").WillReturnRows(count(0))
		m.ExpectQuery(qTotalS).WithArgs("2", int64(2)).WillReturnRows(count(0))
	}
	expectCounts2()
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=message&userid=2&state=2", "")
	eq(t, got, `{"state":101,"info":"暂无数据！"}`)
	met(t, m)
}

// 匿名带参数：uid = -1 查空 → 101「暂无数据！」，不是登录超时。
func TestAnonymousWithParamsIsEmpty101(t *testing.T) {
	svc, m := newService(t, nil)
	expectCounts(m, int64(-1), 0, 0, 0)
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=message&page=1", "")
	eq(t, got, `{"state":101,"info":"暂无数据！"}`)
	met(t, m)
}

// 已登录：不传 userid 时用登录会员。
func TestLoggedInUsesIdentity(t *testing.T) {
	svc, m := newService(t, fakeIdentity(9))
	expectCounts(m, int64(9), 0, 0, 0)
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=message&page=1", "")
	eq(t, got, `{"state":101,"info":"暂无数据！"}`)
	met(t, m)
}

func TestNonNumericUserID(t *testing.T) {
	for _, q := range []string{"userid=abc", "userid[]=2", "userid=2%20", "userid=0x1A"} {
		svc, m := newService(t, nil)
		got := do(t, svc, "GET", "/include/ajax.php?service=member&action=message&"+q, "")
		eq(t, got, `{"state":101,"info":"登录超时，请重新登录！"}`)
		met(t, m)
	}
}

// userid=1e3 通过 is_numeric，原样交给 MySQL（按 1000 查）。
func TestScientificUserIDIsNumeric(t *testing.T) {
	svc, m := newService(t, nil)
	expectCounts(m, "1e3", 0, 0, 0)
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=message&userid=1e3", "")
	eq(t, got, `{"state":101,"info":"暂无数据！"}`)
	met(t, m)
}

// 越界页不报错：100 + list []。
func TestPageOutOfRange(t *testing.T) {
	svc, m := newService(t, nil)
	expectCounts(m, "2", 3, 0, 3)
	m.ExpectQuery(qList).WithArgs("2", 16, 2).WillReturnRows(sqlmock.NewRows([]string{"id", "state", "title", "date", "body", "urlParam"}))
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=message&userid=2&pageSize=2&page=9&state=0", "")
	eq(t, got, `{"state":100,"info":{"pageInfo":{"page":9,"pageSize":2,"totalPage":2.0,"totalCount":3,"unread":3,"read":0},"list":[]}}`)
	met(t, m)
}

// GET 的 page / pageSize <=0 归一为 1 / 10，上限 50000。
func TestPageClamp(t *testing.T) {
	svc, m := newService(t, nil)
	expectCounts(m, "2", 3, 0, 3)
	m.ExpectQuery(qList).WithArgs("2", 0, 10).WillReturnRows(sqlmock.NewRows([]string{"id", "state", "title", "date", "body", "urlParam"}))
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=message&userid=2&page=-3&pageSize=0", "")
	if !strings.Contains(got, `"page":1,"pageSize":10`) {
		t.Fatalf("%s", got)
	}
	svc, m = newService(t, nil)
	expectCounts(m, "2", 3, 0, 3)
	m.ExpectQuery(qList).WithArgs("2", 50000*49999, 50000).WillReturnRows(sqlmock.NewRows([]string{"id", "state", "title", "date", "body", "urlParam"}))
	got = do(t, svc, "GET", "/include/ajax.php?service=member&action=message&userid=2&page=99999999&pageSize=99999999", "")
	if !strings.Contains(got, `"page":50000,"pageSize":50000`) {
		t.Fatalf("%s", got)
	}
	met(t, m)
}

// POST 不做 <=0 归一：pageSize=0 由 empty() 兜成 10；负数保留，LIMIT 非法 → list 为空。
func TestPostNegativePageSize(t *testing.T) {
	svc, m := newService(t, nil)
	expectCounts(m, "2", 3, 0, 3)
	got := do(t, svc, "POST", "/include/ajax.php?service=member&action=message", url.Values{"userid": {"2"}, "pageSize": {"-5"}}.Encode())
	eq(t, got, `{"state":100,"info":{"pageInfo":{"page":1,"pageSize":-5,"totalPage":-0.0,"totalCount":3,"unread":3,"read":0},"list":[]}}`)
	met(t, m)
}

// tongji + im：im 键在 read 之后、upunread 之前；total = unread + im + upunread + commentunread。
func TestTongjiWithIMAndComments(t *testing.T) {
	svc, m := newService(t, nil)
	m.ExpectQuery(qUp).WithArgs("2").WillReturnRows(count(4))
	m.ExpectQuery(qCmtIDs).WithArgs("2").WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(5).AddRow(6))
	m.ExpectQuery("SELECT COUNT(*) FROM `huoniao_public_comment_all` WHERE `isread` = 0 AND (`sid` IN (5,6) OR (`masterid` = ? AND `sid` = 0))").
		WithArgs("2").WillReturnRows(count(2))
	expectCounts(m, "2", 3, 0, 3)
	m.ExpectQuery("SELECT `im_unread_count` FROM `huoniao_member` WHERE `id` = ?").WithArgs("2").WillReturnRows(sqlmock.NewRows([]string{"im"}).AddRow("7"))
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=message&userid=2&type=tongji&im=1", "")
	eq(t, got, `{"state":100,"info":{"pageInfo":{"page":1,"pageSize":10,"totalPage":1.0,"totalCount":3,"unread":3,"read":0,"im":7,"upunread":4,"commentunread":2,"total":16}}}`)
	met(t, m)
}

// type 大小写敏感：Tongji 走列表。
func TestTypeCaseSensitive(t *testing.T) {
	svc, m := newService(t, nil)
	expectCounts(m, "2", 0, 0, 0)
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=message&userid=2&type=Tongji", "")
	eq(t, got, `{"state":101,"info":"暂无数据！"}`)
	met(t, m)
}

func TestSerializedStringURLParam(t *testing.T) {
	svc, m := newService(t, nil)
	expectCounts(m, "2", 1, 0, 1)
	m.ExpectQuery(qList).WithArgs("2", 0, 10).WillReturnRows(
		sqlmock.NewRows([]string{"id", "state", "title", "date", "body", "urlParam"}).
			AddRow("1", "0", "t", "0", "b", `s:11:"/some/path?";`))
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=message&userid=2", "")
	if !strings.Contains(got, `"url":"/some/path?"`) || !strings.Contains(got, `"body":"b"`) {
		t.Fatalf("%s", got)
	}
}

func TestPHPIntval(t *testing.T) {
	cases := map[string]int{"": 0, "abc": 0, "3abc": 3, "3.7": 3, "-2": -2, " 12": 12, "1e3": 1000, "+5": 5, "99999999999999999999": 1<<63 - 1}
	for in, want := range cases {
		if got := phpIntval(in); got != want {
			t.Errorf("phpIntval(%q) = %d, want %d", in, got, want)
		}
	}
}

func TestNoDB(t *testing.T) {
	svc, err := New(Dep{TablePrefix: "huoniao_"})
	if err != nil {
		t.Fatal(err)
	}
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=message&userid=2", "")
	eq(t, got, `{"state":102,"info":"No data!"}`)
	if _, err := New(Dep{TablePrefix: "a b"}); err == nil {
		t.Fatal("非法前缀应报错")
	}
}
