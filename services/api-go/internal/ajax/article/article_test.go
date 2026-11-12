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
	"github.com/arvingrep/firebird-sea/services/api-go/internal/fburl"
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

// typeCols 是 articletype 的列子集（canary 实表无 title/litpic 时也应工作）。
var typeCols = []string{"id", "parentid", "typename", "weight", "pinyin", "py", "mold"}

const typeSelect = "SELECT * FROM `huoniao_articletype` WHERE `parentid` = ? AND `mold` = ? ORDER BY `weight` LIMIT ?, ?"
const typeCount = "SELECT COUNT(*) FROM `huoniao_articletype` WHERE `parentid` = ?"

func TestTypeNormalDefaults(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(typeSelect).WithArgs(0, 0, 0, 1000).WillReturnRows(
		sqlmock.NewRows(typeCols).AddRow(1, 0, "本地新闻", 50, "bendi", "bd", 0).AddRow(2, 0, "国际", 50, "gj", "gj", 0))
	mock.ExpectQuery(typeCount).WithArgs(1).WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow(2))
	mock.ExpectQuery(typeCount).WithArgs(2).WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow(0))
	got := serve(t, svc, "/include/ajax.php?service=article&action=type")
	want := `{"state":100,"info":[{"id":1,"parentid":0,"typename":"本地新闻","title":"本地新闻","pinyin":"bendi","py":"bd","lower":2},` +
		`{"id":2,"parentid":0,"typename":"国际","title":"国际","pinyin":"gj","py":"gj"}]}`
	if got != want {
		t.Fatalf("响应体 = %s\nwant     %s", got, want)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatal(err)
	}
}

func TestTypePagingAndClamp(t *testing.T) {
	cases := map[string][2]int{
		"page=2&pageSize=2":     {2, 2},
		"pageSize=abc":          {0, 10},
		"pageSize=99999&page=0": {0, 50000},
		"page=3":                {2000, 1000},
	}
	for q, a := range cases {
		svc, mock := newService(t)
		mock.ExpectQuery(typeSelect).WithArgs(0, 0, a[0], a[1]).WillReturnRows(sqlmock.NewRows(typeCols))
		got := serve(t, svc, "/include/ajax.php?service=article&action=type&"+q)
		if got != `{"state":102,"info":"No data!"}` {
			t.Fatalf("%s: %s", q, got)
		}
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("%s: %v", q, err)
		}
	}
}

func TestTypeSonRecursive(t *testing.T) {
	svc, mock := newService(t)
	cols := append([]string{"title", "litpic"}, typeCols...)
	mock.ExpectQuery(typeSelect).WithArgs(1, 3, 0, 1000).WillReturnRows(
		sqlmock.NewRows(cols).AddRow("T", "", 5, 1, "父", 50, "f", "f", 3))
	mock.ExpectQuery(typeSelect).WithArgs(5, 3, 0, 100000).WillReturnRows(
		sqlmock.NewRows(cols).AddRow("", "", 6, 5, "子", 50, "z", "z", 3))
	mock.ExpectQuery(typeSelect).WithArgs(6, 3, 0, 100000).WillReturnRows(sqlmock.NewRows(cols))
	got := serve(t, svc, "/include/ajax.php?service=article&action=type&type=1&mold=3&son=1")
	want := `{"state":100,"info":[{"id":5,"parentid":1,"typename":"父","title":"T","pinyin":"f","py":"f","lower":[` +
		`{"id":6,"parentid":5,"typename":"子","title":"子","pinyin":"z","py":"z","lower":""}]}]}`
	if got != want {
		t.Fatalf("响应体 = %s\nwant     %s", got, want)
	}
}

func TestTypeErrorAndNoDB(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(typeSelect).WithArgs(0, 0, 0, 1000).WillReturnError(fmt.Errorf("boom"))
	if got := serve(t, svc, "/include/ajax.php?service=article&action=type"); got != `{"state":101,"info":"分类获取失败！"}` {
		t.Fatal(got)
	}
	nodb, _ := New(Dep{TablePrefix: "huoniao_"})
	if got := serve(t, nodb, "/include/ajax.php?service=article&action=type"); got != `{"state":102,"info":"No data!"}` {
		t.Fatal(got)
	}
}

func TestPhpSon(t *testing.T) {
	for raw, want := range map[string]bool{"": false, "0": false, "abc": false, "0.0": false, "1": true, "-1": true, "0.5": true, "2abc": true, " 3": true} {
		if phpSon(raw) != want {
			t.Errorf("phpSon(%q) != %v", raw, want)
		}
	}
}

// servePost 以 POST 表单（query 仍可带 GET 参数）请求。
func servePost(t *testing.T, svc *Service, target, form string) string {
	t.Helper()
	router := ajax.NewRouter(func(string) {})
	Register(router, svc)
	req := httptest.NewRequest(http.MethodPost, target, strings.NewReader(form))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, req)
	return recorder.Body.String()
}

// POST 通道（ajax.php:97-99）只做 (int) 与 >50000 封顶，没有 <=0 取默认；
// GET 通道（ajax.php:59-62）<=0 取默认。
func TestTypePagingPostVsGet(t *testing.T) {
	cases := []struct {
		name, query, form string
		offset, limit     int
	}{
		{"GET pageSize=0 → 10", "pageSize=0", "", 0, 10},
		{"POST pageSize=0 → 空 → 1000", "", "pageSize=0", 0, 1000},
		{"GET page=-1&pageSize=5 → page 1", "page=-1&pageSize=5", "", 0, 5},
		{"POST page=0&pageSize=5 → page 1", "", "page=0&pageSize=5", 0, 5},
		{"POST page=2&pageSize=3", "", "page=2&pageSize=3", 3, 3},
		{"POST pageSize=abc → (int)0 → 1000（GET 为 10）", "", "pageSize=abc", 0, 1000},
		{"POST 封顶 50000", "", "pageSize=99999", 0, 50000},
		{"POST 覆盖 GET：GET pageSize=0 被 POST pageSize=7 覆盖", "pageSize=0", "pageSize=7", 0, 7},
		{"POST 的 pageSize 不影响 GET 的 page 规则", "page=-3", "pageSize=4", 0, 4},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			svc, mock := newService(t)
			mock.ExpectQuery(typeSelect).WithArgs(0, 0, c.offset, c.limit).WillReturnRows(sqlmock.NewRows(typeCols))
			target := "/include/ajax.php?service=article&action=type&" + c.query
			var got string
			if c.form == "" {
				got = serve(t, svc, target)
			} else {
				got = servePost(t, svc, target, c.form)
			}
			if got != `{"state":102,"info":"No data!"}` {
				t.Fatal(got)
			}
			if err := mock.ExpectationsWereMet(); err != nil {
				t.Fatal(err)
			}
		})
	}
}

// POST 负数原样进入 LIMIT（不取默认）；数据库报错 → 101。
func TestTypePostNegativePageReachesSQL(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(typeSelect).WithArgs(0, 0, -20, 10).WillReturnError(fmt.Errorf("negative LIMIT"))
	got := servePost(t, svc, "/include/ajax.php?service=article&action=type", "page=-1&pageSize=10")
	if got != `{"state":101,"info":"分类获取失败！"}` {
		t.Fatal(got)
	}
}

// litpic：原始值为空 → PHP 不写该键；原始值为真但 getFilePath 解析为 "" → 恒输出 "litpic":""。
func TestTypeLitpicKey(t *testing.T) {
	db, mock, err := sqlmock.New(sqlmock.QueryMatcherOption(sqlmock.QueryMatcherEqual))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	files, err := fburl.New(db, "huoniao_", fburl.DefaultConfig())
	if err != nil {
		t.Fatal(err)
	}
	svc, err := New(Dep{DB: db, TablePrefix: "huoniao_", Files: files})
	if err != nil {
		t.Fatal(err)
	}
	cols := append([]string{"title", "litpic"}, typeCols...)
	mock.ExpectQuery(typeSelect).WithArgs(0, 0, 0, 1000).WillReturnRows(sqlmock.NewRows(cols).
		AddRow("", "", 1, 0, "空", 1, "k", "k", 0).
		AddRow("", "0", 2, 0, "零", 2, "l", "l", 0).
		AddRow("", "999", 3, 0, "无附件", 3, "w", "w", 0).
		AddRow("", "/photo/a.jpg", 4, 0, "有图", 4, "y", "y", 0))
	count := func(id int) {
		mock.ExpectQuery(typeCount).WithArgs(id).WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow(0))
	}
	count(1)
	count(2)
	// 999 在附件表查不到 → getFilePath 返回 ""（键仍输出）
	mock.ExpectQuery("SELECT `id`, `path` FROM `huoniao_attachment` WHERE `id` = ?").WithArgs("999").
		WillReturnRows(sqlmock.NewRows([]string{"id", "path"}))
	count(3)
	count(4)
	got := serve(t, svc, "/include/ajax.php?service=article&action=type")
	for _, want := range []string{
		`{"id":1,"parentid":0,"typename":"空","title":"空","pinyin":"k","py":"k"}`,
		`{"id":2,"parentid":0,"typename":"零","title":"零","pinyin":"l","py":"l"}`,
		`{"id":3,"parentid":0,"typename":"无附件","title":"无附件","litpic":"","pinyin":"w","py":"w"}`,
		`"litpic":"https://storage.googleapis.com/fbird-sea-uploads//photo/a.jpg`,
	} {
		if !strings.Contains(got, want) {
			t.Fatalf("缺少 %s\n响应体 = %s", want, got)
		}
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatal(err)
	}
}
