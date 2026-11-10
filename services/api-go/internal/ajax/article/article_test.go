package article

import (
	"database/sql"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	sqlmock "github.com/DATA-DOG/go-sqlmock"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// newService 起一个 sqlmock 连接池和挂在它上面的 article 服务。
func newService(t *testing.T) (*Service, sqlmock.Sqlmock) {
	t.Helper()
	db, mock, err := sqlmock.New(sqlmock.QueryMatcherOption(sqlmock.QueryMatcherEqual))
	if err != nil {
		t.Fatalf("sqlmock: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })
	svc, err := New(Dep{DB: db, TablePrefix: "huoniao_"})
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	return svc, mock
}

// serve 用真实 Router 走一遍请求（覆盖注册、包装与 JSON 输出）。
func serve(t *testing.T, svc *Service, target string) string {
	t.Helper()
	router := ajax.NewRouter(func(string) {})
	Register(router, svc)
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, target, nil))
	return recorder.Body.String()
}

func TestSelfmediaFieldNormal(t *testing.T) {
	svc, mock := newService(t)
	expected := "SELECT `id`, `typename` FROM `huoniao_article_selfmedia_field` ORDER BY `weight` ASC"
	mock.ExpectQuery(expected).WillReturnRows(
		sqlmock.NewRows([]string{"id", "typename"}).
			AddRow(3, "摄影").
			AddRow(7, "旅行"),
	)
	got := serve(t, svc, "/include/ajax.php?service=article&action=selfmedia_field")
	want := `{"state":100,"info":[{"id":3,"typename":"摄影","lower":[]},{"id":7,"typename":"旅行","lower":[]}]}`
	if got != want {
		t.Fatalf("响应体 = %s\nwant     %s", got, want)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("SQL 期望未满足: %v", err)
	}
}

func TestSelfmediaFieldTypeFilter(t *testing.T) {
	svc, mock := newService(t)
	expected := "SELECT `id`, `typename` FROM `huoniao_article_selfmedia_field` WHERE `type` = ? ORDER BY `weight` ASC"
	mock.ExpectQuery(expected).WithArgs(2).WillReturnRows(
		sqlmock.NewRows([]string{"id", "typename"}).AddRow(9, "财经"),
	)
	got := serve(t, svc, "/include/ajax.php?service=article&action=selfmedia_field&type=2")
	want := `{"state":100,"info":[{"id":9,"typename":"财经","lower":[]}]}`
	if got != want {
		t.Fatalf("响应体 = %s\nwant     %s", got, want)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("SQL 期望未满足: %v", err)
	}
}

// PHP 的 (int) 是截断转换：这些输入都等价于 2，必须带上 WHERE 而不是被当成参数错误。
func TestSelfmediaFieldPHPIntCast(t *testing.T) {
	cases := map[string]int{
		"2":    2,
		"2.9":  2,
		"2abc": 2,
		" 2":   2,
		"+2":   2,
	}
	for raw, want := range cases {
		t.Run(fmt.Sprintf("type=%q→%d", raw, want), func(t *testing.T) {
			svc, mock := newService(t)
			expected := "SELECT `id`, `typename` FROM `huoniao_article_selfmedia_field` WHERE `type` = ? ORDER BY `weight` ASC"
			mock.ExpectQuery(expected).WithArgs(want).WillReturnRows(
				sqlmock.NewRows([]string{"id", "typename"}),
			)
			serve(t, svc, "/include/ajax.php?service=article&action=selfmedia_field&type="+url.QueryEscape(raw))
			if err := mock.ExpectationsWereMet(); err != nil {
				t.Fatalf("SQL 期望未满足: %v", err)
			}
		})
	}
}

// 这些输入 PHP 都转成 0，即不过滤、全量返回。
func TestSelfmediaFieldPHPIntZero(t *testing.T) {
	for _, raw := range []string{"abc", "0", "", "abc2", "-0"} {
		t.Run("type="+raw, func(t *testing.T) {
			svc, mock := newService(t)
			expected := "SELECT `id`, `typename` FROM `huoniao_article_selfmedia_field` ORDER BY `weight` ASC"
			mock.ExpectQuery(expected).WillReturnRows(
				sqlmock.NewRows([]string{"id", "typename"}).AddRow(1, "科技"),
			)
			got := serve(t, svc, "/include/ajax.php?service=article&action=selfmedia_field&type="+raw)
			if !strings.Contains(got, `"id":1`) {
				t.Fatalf("响应体 = %s，want 全量查询结果", got)
			}
			if err := mock.ExpectationsWereMet(); err != nil {
				t.Fatalf("SQL 期望未满足: %v", err)
			}
		})
	}
}

// 查不到行（空表或 type 过滤后无结果）→ state=102 "No data!"（handlers.class.php:84-87）。
func TestSelfmediaFieldEmptyResult(t *testing.T) {
	svc, mock := newService(t)
	expected := "SELECT `id`, `typename` FROM `huoniao_article_selfmedia_field` WHERE `type` = ? ORDER BY `weight` ASC"
	mock.ExpectQuery(expected).WithArgs(999999).WillReturnRows(
		sqlmock.NewRows([]string{"id", "typename"}),
	)
	got := serve(t, svc, "/include/ajax.php?service=article&action=selfmedia_field&type=999999")
	if got != `{"state":102,"info":"No data!"}` {
		t.Fatalf("响应体 = %s，want 102 No data!", got)
	}
}

// 查询出错时 PHP 的 dsqlOper 返回 false → 同样是 102，不放大成 5xx。
func TestSelfmediaFieldDBError(t *testing.T) {
	svc, mock := newService(t)
	expected := "SELECT `id`, `typename` FROM `huoniao_article_selfmedia_field` ORDER BY `weight` ASC"
	mock.ExpectQuery(expected).WillReturnError(fmt.Errorf("mock db error"))
	got := serve(t, svc, "/include/ajax.php?service=article&action=selfmedia_field")
	if got != `{"state":102,"info":"No data!"}` {
		t.Fatalf("响应体 = %s，want 102 No data!", got)
	}
}

// 本地纯内存模式（DB_HOST 未配置）按「查不到数据」降级。
func TestSelfmediaFieldNoDB(t *testing.T) {
	svc, err := New(Dep{DB: nil, TablePrefix: "huoniao_"})
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	got := serve(t, svc, "/include/ajax.php?service=article&action=selfmedia_field")
	if got != `{"state":102,"info":"No data!"}` {
		t.Fatalf("响应体 = %s，want 102 No data!", got)
	}
}

// typename 为 NULL 时输出空字符串，不报错（口径：读接口尽量与 PHP 的宽松取值一致）。
func TestSelfmediaFieldNullTypename(t *testing.T) {
	svc, mock := newService(t)
	expected := "SELECT `id`, `typename` FROM `huoniao_article_selfmedia_field` ORDER BY `weight` ASC"
	mock.ExpectQuery(expected).WillReturnRows(
		sqlmock.NewRows([]string{"id", "typename"}).AddRow(5, sql.NullString{}),
	)
	got := serve(t, svc, "/include/ajax.php?service=article&action=selfmedia_field")
	if got != `{"state":100,"info":[{"id":5,"typename":"","lower":[]}]}` {
		t.Fatalf("响应体 = %s", got)
	}
}

func TestNewRejectsBadPrefix(t *testing.T) {
	if _, err := New(Dep{DB: nil, TablePrefix: "huo`nio"}); err == nil {
		t.Fatal("非法前缀应当报错")
	}
}
