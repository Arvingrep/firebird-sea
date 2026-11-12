package article

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	sqlmock "github.com/DATA-DOG/go-sqlmock"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

const (
	zlCountSQL = "SELECT COUNT(`id`) c FROM `huoniao_article_zhuanti` WHERE `state` = 1 AND `parentid` = 0"
	zlListCols = "SELECT `id`, `typename`, `description`, `pubdate`, `click`, `flag_r`, `flag_h`, `litpic`, `banner_large`, `banner_small` FROM `huoniao_article_zhuanti` WHERE `state` = 1 AND `parentid` = 0"
)

var zlCols = []string{"id", "typename", "description", "pubdate", "click", "flag_r", "flag_h", "litpic", "banner_large", "banner_small"}

func zlDo(t *testing.T, svc *Service, req *http.Request) string {
	t.Helper()
	router := ajax.NewRouter(func(string) {})
	Register(router, svc)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)
	return rec.Body.String()
}

func zlGet(t *testing.T, svc *Service, query string) string {
	return zlDo(t, svc, httptest.NewRequest(http.MethodGet, "/include/ajax.php?service=article&action=zhuantiList"+query, nil))
}

func zlMet(t *testing.T, m sqlmock.Sqlmock) {
	t.Helper()
	if err := m.ExpectationsWereMet(); err != nil {
		t.Fatalf("SQL 期望未满足: %v", err)
	}
}

func TestZhuantiListNormal(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(zlCountSQL).WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("12"))
	mock.ExpectQuery(zlListCols + " ORDER BY `weight` DESC, `id` DESC LIMIT 0, 10").WillReturnRows(
		sqlmock.NewRows(zlCols).
			AddRow("5", "专题A", "d", "1700000000", "12345", "1", "0", "", "", "").
			AddRow("4", "专题B", nil, "1600000000", "99", "0", "2", "", "", ""))
	got := zlGet(t, svc, "")
	want := `{"state":100,"info":{"pageInfo":{"page":1,"pageSize":10,"totalPage":2.0,"totalCount":"12"},"list":[` +
		`{"id":"5","typename":"专题A","description":"d","pubdate":"1700000000","click":"1.2万","flag_r":1,"flag_h":0,"litpic":"","banner_large":"","banner_small":"","url":""},` +
		`{"id":"4","typename":"专题B","description":null,"pubdate":"1600000000","click":"99","flag_r":0,"flag_h":2,"litpic":"","banner_large":"","banner_small":"","url":""}]}}`
	if got != want {
		t.Fatalf("响应体 = %s\nwant     %s", got, want)
	}
	zlMet(t, mock)
}

func TestZhuantiListEmpty(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(zlCountSQL).WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	got := zlGet(t, svc, "")
	if want := `{"state":101,"info":"暂无数据"}`; got != want {
		t.Fatalf("响应体 = %s\nwant     %s", got, want)
	}
	zlMet(t, mock)
}

func TestZhuantiListNoDB(t *testing.T) {
	svc, err := New(Dep{TablePrefix: "huoniao_"})
	if err != nil {
		t.Fatal(err)
	}
	if got, want := zlGet(t, svc, ""), `{"state":101,"info":"暂无数据"}`; got != want {
		t.Fatalf("响应体 = %s\nwant     %s", got, want)
	}
}

// 参数错误：r/h/typeid/orderby/page 的各种非法输入。
func TestZhuantiListFilters(t *testing.T) {
	t.Run("r 为 abc → flag_r > 0；h=2 → flag_h = 2；typeid 非 0", func(t *testing.T) {
		svc, mock := newService(t)
		w := " AND `typeid` = ? AND `flag_r` > 0 AND `flag_h` = ?"
		mock.ExpectQuery(zlCountSQL+w).WithArgs(3, 2).WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("1"))
		mock.ExpectQuery(zlListCols+w+" ORDER BY `pubdate` DESC, `id` DESC LIMIT 0, 10").WithArgs(3, 2).
			WillReturnRows(sqlmock.NewRows(zlCols))
		got := zlGet(t, svc, "&typeid=3&r=abc&h=2&orderby=time")
		if want := `{"state":100,"info":{"pageInfo":{"page":1,"pageSize":10,"totalPage":1.0,"totalCount":"1"},"list":[]}}`; got != want {
			t.Fatalf("响应体 = %s\nwant     %s", got, want)
		}
		zlMet(t, mock)
	})
	t.Run("r=0 / undefined / 空 不过滤", func(t *testing.T) {
		for _, r := range []string{"0", "undefined", ""} {
			svc, mock := newService(t)
			mock.ExpectQuery(zlCountSQL).WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
			zlGet(t, svc, "&r="+r)
			zlMet(t, mock)
		}
	})
	t.Run("r=1abc / 1.5 拼进 SQL 无结果 → 暂无数据，且不查库", func(t *testing.T) {
		for _, r := range []string{"1abc", "1.5", "1%20OR%201"} {
			svc, mock := newService(t)
			if got, want := zlGet(t, svc, "&r="+r), `{"state":101,"info":"暂无数据"}`; got != want {
				t.Fatalf("r=%s 响应体 = %s", r, got)
			}
			zlMet(t, mock)
		}
	})
	t.Run("orderby=click", func(t *testing.T) {
		svc, mock := newService(t)
		mock.ExpectQuery(zlCountSQL).WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("1"))
		mock.ExpectQuery(zlListCols + " ORDER BY `click` DESC, `pubdate` DESC LIMIT 0, 10").WillReturnRows(sqlmock.NewRows(zlCols))
		zlGet(t, svc, "&orderby=click")
		zlMet(t, mock)
	})
}

func TestZhuantiListPaging(t *testing.T) {
	run := func(t *testing.T, req *http.Request, limit string) string {
		svc, mock := newService(t)
		mock.ExpectQuery(zlCountSQL).WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("100"))
		mock.ExpectQuery(zlListCols + " ORDER BY `weight` DESC, `id` DESC" + limit).WillReturnRows(sqlmock.NewRows(zlCols))
		got := zlDo(t, svc, req)
		zlMet(t, mock)
		return got
	}
	t.Run("GET page=3&pageSize=20", func(t *testing.T) {
		got := run(t, httptest.NewRequest(http.MethodGet, "/include/ajax.php?service=article&action=zhuantiList&page=3&pageSize=20", nil), " LIMIT 40, 20")
		if !strings.Contains(got, `"page":3,"pageSize":20,"totalPage":5.0`) {
			t.Fatalf("响应体 = %s", got)
		}
	})
	t.Run("GET 负数 → 默认；超限 → 50000", func(t *testing.T) {
		run(t, httptest.NewRequest(http.MethodGet, "/include/ajax.php?service=article&action=zhuantiList&page=-3&pageSize=-1", nil), " LIMIT 0, 10")
		run(t, httptest.NewRequest(http.MethodGet, "/include/ajax.php?service=article&action=zhuantiList&page=1&pageSize=99999", nil), " LIMIT 0, 50000")
	})
	t.Run("POST 0 → 默认", func(t *testing.T) {
		run(t, zlPost("page=0&pageSize=0"), " LIMIT 0, 10")
	})
	t.Run("POST 负数不取默认，LIMIT 报错 → list 空，pageInfo 仍输出", func(t *testing.T) {
		svc, mock := newService(t)
		mock.ExpectQuery(zlCountSQL).WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("100"))
		mock.ExpectQuery(zlListCols + " ORDER BY `weight` DESC, `id` DESC LIMIT -10, 5").WillReturnError(sqlmock.ErrCancelled)
		got := zlDo(t, svc, zlPost("page=-1&pageSize=5"))
		if want := `{"state":100,"info":{"pageInfo":{"page":-1,"pageSize":5,"totalPage":20.0,"totalCount":"100"},"list":[]}}`; got != want {
			t.Fatalf("响应体 = %s\nwant     %s", got, want)
		}
		zlMet(t, mock)
	})
}

func zlPost(body string) *http.Request {
	r := httptest.NewRequest(http.MethodPost, "/include/ajax.php?service=article&action=zhuantiList", strings.NewReader(body))
	r.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	return r
}

func TestZhuantiListGetLower(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(zlCountSQL).WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("2"))
	mock.ExpectQuery(zlListCols + " ORDER BY `weight` DESC, `id` DESC LIMIT 0, 10").WillReturnRows(
		sqlmock.NewRows(zlCols).
			AddRow("5", "A", "", "1", "1", "0", "0", "", "", "").
			AddRow("6", "B", "", "1", "1", "0", "0", "", "", ""))
	lowerSQL := "SELECT `id`, `typename` FROM `huoniao_article_zhuanti` WHERE `parentid` = ?"
	mock.ExpectQuery(lowerSQL).WithArgs(5).WillReturnRows(sqlmock.NewRows([]string{"id", "typename"}).AddRow("51", "子"))
	mock.ExpectQuery(lowerSQL).WithArgs(6).WillReturnRows(sqlmock.NewRows([]string{"id", "typename"}))
	got := zlGet(t, svc, "&get_lower=1")
	if !strings.Contains(got, `"url":"","lower":[{"id":"51","typename":"子"}]}`) || !strings.Contains(got, `"url":"","lower":[]}`) {
		t.Fatalf("响应体 = %s", got)
	}
	zlMet(t, mock)
}

func TestZhuantiListGetNews(t *testing.T) {
	const from = " FROM `huoniao_article_zhuantilist` l LEFT JOIN `huoniao_article_zhuanti` z ON z.`id` = l.`typeid` LEFT JOIN `huoniao_articlelist_all` a ON a.`id` = l.`aid` WHERE " +
		" z.`state` = 1 AND a.`arcrank` = 1 AND a.`media_state` = 1 AND a.`del` = 0 AND l.`typeid` IN (?,?,?) AND a.`litpic` <> ''"
	svc, mock := newService(t)
	mock.ExpectQuery(zlCountSQL).WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("2"))
	mock.ExpectQuery(zlListCols + " ORDER BY `weight` DESC, `id` DESC LIMIT 0, 10").WillReturnRows(
		sqlmock.NewRows(zlCols).
			AddRow("5", "A", "", "1", "1", "0", "0", "", "", "").
			AddRow("6", "B", "", "1", "1", "0", "0", "", "", ""))
	// 专题 5：后代 51（再下一层 511）；专题 6：无后代、无新闻。
	desc := "SELECT `id` FROM `huoniao_article_zhuanti` WHERE `parentid` IN (?)"
	mock.ExpectQuery(desc).WithArgs(5).WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow("51"))
	mock.ExpectQuery(desc).WithArgs(51).WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow("511"))
	mock.ExpectQuery(desc).WithArgs(511).WillReturnRows(sqlmock.NewRows([]string{"id"}))
	mock.ExpectQuery("SELECT COUNT(l.`id`) c"+from).WithArgs(5, 51, 511).WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("1"))
	mock.ExpectQuery("SELECT z.`typename`, a.`id` aid, a.`title`, a.`litpic`, a.`flag`, a.`redirecturl`, a.`typeid` atypeid, a.`source`"+from+" ORDER BY a.`weight` DESC, a.`id` DESC LIMIT 0, 10").
		WithArgs(5, 51, 511).WillReturnRows(sqlmock.NewRows([]string{"typename", "aid", "title", "litpic", "flag", "redirecturl", "atypeid", "source"}).
		AddRow("A", "900", "标题", "p.jpg", "h", "", "7", "新华社"))
	mock.ExpectQuery(desc).WithArgs(6).WillReturnRows(sqlmock.NewRows([]string{"id"}))
	mock.ExpectQuery("SELECT COUNT(l.`id`) c" + strings.Replace(from, "IN (?,?,?)", "IN (?)", 1)).WithArgs(6).
		WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	got := zlGet(t, svc, "&get_news=1&thumb=1")
	if !strings.Contains(got, `"list":{"pageInfo":{"page":1,"pageSize":10,"totalPage":1.0,"totalCount":"1"},"list":[{"id":"900","typename":"A","title":"标题","source":"新华社","litpic":"p.jpg","url":""}]}`) {
		t.Fatalf("专题 5 响应体 = %s", got)
	}
	if !strings.Contains(got, `"url":"","list":{"list":[]}}`) {
		t.Fatalf("专题 6（无新闻）应为 {\"list\":{\"list\":[]}} = %s", got)
	}
	zlMet(t, mock)
}
