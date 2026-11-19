package article

import (
	"database/sql"
	"errors"
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

var zhuantiCols = []string{"id", "parentid", "typename", "description", "weight", "pubdate", "state", "flag_r", "flag_h", "litpic", "click", "banner_large", "banner_small", "typeid"}

const (
	zhuantiMainSQL  = "SELECT * FROM `huoniao_article_zhuanti` WHERE `id` = ? AND `state` = 1 AND `parentid` = 0"
	zhuantiLowerSQL = "SELECT * FROM `huoniao_article_zhuanti` WHERE `parentid` = ? AND `state` = 1 ORDER BY `weight` DESC"
)

func TestZhuantiDetailNormal(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(zhuantiMainSQL).WithArgs(1).WillReturnRows(
		sqlmock.NewRows(zhuantiCols).AddRow("1", "0", "专题", "简介", "50", "1640000000", "1", "0", "0", "", "3", "", "", "0"))
	mock.ExpectQuery(zhuantiLowerSQL).WithArgs(1).WillReturnRows(
		sqlmock.NewRows(zhuantiCols).AddRow("2", "1", "子", "", "50", "1640000100", "1", "0", "1", "a.jpg", "0", "", "", "0"))
	got := serve(t, svc, "/include/ajax.php?service=article&action=zhuantiDetail&id=1,9")
	want := `{"state":100,"info":{"id":"1","typename":"专题","description":"简介","pubdate":"1640000000","litpic":"","banner_large":"","banner_small":"","url":"","lower":[{"id":"2","parentid":"1","typename":"子","description":"","weight":"50","pubdate":"1640000100","state":"1","flag_r":"0","flag_h":"1","litpic":"a.jpg","click":"0","banner_large":"","banner_small":"","typeid":"0"}]}}`
	if got != want {
		t.Fatalf("响应体 = %s\nwant     %s", got, want)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatal(err)
	}
}

func TestZhuantiDetailNoLower(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(zhuantiMainSQL).WithArgs(1).WillReturnRows(
		sqlmock.NewRows(zhuantiCols).AddRow("1", "0", "专题", "简介", "50", "1640000000", "1", "0", "0", "", "3", "", "", "0"))
	mock.ExpectQuery(zhuantiLowerSQL).WithArgs(1).WillReturnRows(sqlmock.NewRows(zhuantiCols))
	got := serve(t, svc, "/include/ajax.php?service=article&action=zhuantiDetail&id=1")
	if !strings.HasSuffix(got, `"lower":[]}}`) {
		t.Fatalf("lower 应为 []: %s", got)
	}
}

func TestZhuantiDetailEmpty(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(zhuantiMainSQL).WithArgs(5).WillReturnRows(sqlmock.NewRows(zhuantiCols))
	got := serve(t, svc, "/include/ajax.php?service=article&action=zhuantiDetail&id=5")
	if want := `{"state":102,"info":"No data!"}`; got != want {
		t.Fatalf("got %s want %s", got, want)
	}
}

func TestZhuantiDetailBadParam(t *testing.T) {
	for _, q := range []string{"", "&id=0", "&id=", "&id=abc"} {
		svc, mock := newService(t)
		got := serve(t, svc, "/include/ajax.php?service=article&action=zhuantiDetail"+q)
		if want := `{"state":101,"info":"参数错误"}`; got != want {
			t.Fatalf("%q: got %s want %s", q, got, want)
		}
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatal(err)
		}
	}
}

// 接上 fburl：litpic / banner_* 走 getFilePath，url 走 getUrlPath(article/zt_detail)。
func TestZhuantiDetailFburl(t *testing.T) {
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
	mock.ExpectQuery(zhuantiMainSQL).WithArgs(1).WillReturnRows(
		sqlmock.NewRows(zhuantiCols).AddRow("1", "0", "专题", "简介", "50", "1640000000", "1", "0", "0", "/photo/a.jpg", "3", "", "", "0"))
	mock.ExpectQuery(zhuantiLowerSQL).WithArgs(1).WillReturnRows(sqlmock.NewRows(zhuantiCols))
	mock.ExpectQuery("SELECT count(`id`) total FROM `huoniao_site_module` WHERE `state` = 0 AND `type` = 0 AND `name` != ''").
		WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow(28))
	mock.ExpectQuery("SELECT `domain` FROM `huoniao_domain` WHERE `module` = ? AND `part` = 'config'").WithArgs("article").
		WillReturnRows(sqlmock.NewRows([]string{"domain"}).AddRow("news"))
	got := serve(t, svc, "/include/ajax.php?service=article&action=zhuantiDetail&id=1")
	for _, want := range []string{
		`"litpic":"https://storage.googleapis.com/fbird-sea-uploads//photo/a.jpg`,
		`"banner_large":"","banner_small":"","url":"https://example.com/news/zt_detail-1.html"`,
	} {
		if !strings.Contains(got, want) {
			t.Fatalf("缺少 %s\n响应体 = %s", want, got)
		}
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatal(err)
	}
}

func TestZhuantiDetailIDNormalization(t *testing.T) {
	post := func(svc *Service, target, body string) string {
		router := ajax.NewRouter(func(string) {})
		Register(router, svc)
		req := httptest.NewRequest(http.MethodPost, target, strings.NewReader(body))
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)
		return rec.Body.String()
	}
	const base = "/include/ajax.php?service=article&action=zhuantiDetail"
	cases := []struct {
		name, query, body string
		wantHit           bool
	}{
		{"GET 数组", "&id[]=1&id[]=9", "", true},
		{"GET 数组 URL 编码", "&id%5B%5D=1&id%5B%5D=9", "", true},
		{"POST 数组", "", "id[]=1&id[]=9", true},
		{"POST 数组覆盖 GET 标量", "&id=5", "id[]=1", true},
		{"POST 标量覆盖 GET 数组", "&id[]=5", "id=1", true},
		{"占位符为空参数", "&id=1Placeholder", "", false},
		{"数组首项为 0", "&id[]=0&id[]=1", "", false},
		{"逗号串首项为 0", "&id=0,1", "", false},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			svc, mock := newService(t)
			if c.wantHit {
				mock.ExpectQuery(zhuantiMainSQL).WithArgs(1).WillReturnRows(
					sqlmock.NewRows(zhuantiCols).AddRow("1", "0", "专题", "", "50", "1", "1", "0", "0", "", "0", "", "", "0"))
				mock.ExpectQuery(zhuantiLowerSQL).WithArgs(1).WillReturnRows(sqlmock.NewRows(zhuantiCols))
			}
			var got string
			if c.body == "" {
				got = serve(t, svc, base+c.query)
			} else {
				got = post(svc, base+c.query, c.body)
			}
			if c.wantHit && !strings.HasPrefix(got, `{"state":100,`) {
				t.Fatalf("应命中专题 1: %s", got)
			}
			if !c.wantHit && got != `{"state":101,"info":"参数错误"}` {
				t.Fatalf("应为参数错误: %s", got)
			}
			if err := mock.ExpectationsWereMet(); err != nil {
				t.Fatal(err)
			}
		})
	}
}

// 主查询成功 + 子分类查询异常：PHP 把 dsqlOper 的失败 JSON 字符串放进 lower，外层仍 100。
func TestZhuantiDetailLowerQueryFails(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(zhuantiMainSQL).WithArgs(1).WillReturnRows(
		sqlmock.NewRows(zhuantiCols).AddRow("1", "0", "专题", "简介", "50", "1640000000", "1", "0", "0", "", "3", "", "", "0"))
	mock.ExpectQuery(zhuantiLowerSQL).WithArgs(1).WillReturnError(errors.New("boom"))
	got := serve(t, svc, "/include/ajax.php?service=article&action=zhuantiDetail&id=1")
	want := `{"state":100,"info":{"id":"1","typename":"专题","description":"简介","pubdate":"1640000000","litpic":"","banner_large":"","banner_small":"","url":"","lower":"{\"state\": 200, \"info\": \"操作失败！\"}"}}`
	if got != want {
		t.Fatalf("响应体 = %s\nwant     %s", got, want)
	}
}

const orderMainQuery = "SELECT r.`ordernum`, r.`aid`, r.`date`, r.`state`, l.`amount` FROM `huoniao_pay_log` l LEFT JOIN `huoniao_member_reward` r ON r.`ordernum` = l.`body` WHERE r.`module` = 'article' AND l.`ordernum` = ?"
const orderTitleQuery = "SELECT `title` FROM `huoniao_articlelist_all` WHERE `id` = ?"

var orderCols = []string{"ordernum", "aid", "date", "state", "amount"}

// 正常：外层 100，info 为嵌套对象（含 state 键），date 为字符串，amount 两位小数，url 恒 ""。
func TestOrderDetailNormal(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(orderMainQuery).WithArgs("PAY1").WillReturnRows(
		sqlmock.NewRows(orderCols).AddRow("R1", 8, "1794014028", 1, 5.5))
	mock.ExpectQuery(orderTitleQuery).WithArgs(8).WillReturnRows(
		sqlmock.NewRows([]string{"title"}).AddRow("标题"))
	got := serve(t, svc, "/include/ajax.php?service=article&action=orderDetail&ordernum=PAY1")
	want := `{"state":100,"info":{"state":1,"ordernum":"R1","title":"标题","url":"","date":"1794014028","amount":"5.50"}}`
	if got != want {
		t.Fatalf("响应体 = %s\nwant     %s", got, want)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("SQL 期望未满足: %v", err)
	}
}

// r.state 为 200 / 101 → 外层 101、info:null，不再查 title。
func TestOrderDetailState200And101(t *testing.T) {
	for _, st := range []int{200, 101} {
		svc, mock := newService(t)
		mock.ExpectQuery(orderMainQuery).WithArgs("PAY1").WillReturnRows(
			sqlmock.NewRows(orderCols).AddRow("R1", 8, "1794014028", st, 5.5))
		got := serve(t, svc, "/include/ajax.php?service=article&action=orderDetail&ordernum=PAY1")
		if got != `{"state":101,"info":null}` {
			t.Fatalf("state=%d 响应体 = %s", st, got)
		}
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("SQL 期望未满足: %v", err)
		}
	}
}

func TestOrderDetailEmptyResult(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(orderMainQuery).WithArgs("NOPE").WillReturnRows(sqlmock.NewRows(orderCols))
	got := serve(t, svc, "/include/ajax.php?service=article&action=orderDetail&ordernum=NOPE")
	if got != `{"state":102,"info":"No data!"}` {
		t.Fatalf("响应体 = %s", got)
	}
}

// 缺参 / 空参 / "0"（PHP falsy）→ 102，且不触发任何 SQL。
func TestOrderDetailMissingOrdernum(t *testing.T) {
	for _, target := range []string{
		"/include/ajax.php?service=article&action=orderDetail",
		"/include/ajax.php?service=article&action=orderDetail&ordernum=",
		"/include/ajax.php?service=article&action=orderDetail&ordernum=0", // PHP "0" falsy
	} {
		svc, mock := newService(t)
		got := serve(t, svc, target)
		if got != `{"state":102,"info":"No data!"}` {
			t.Fatalf("%s 响应体 = %s", target, got)
		}
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("不应有 SQL: %v", err)
		}
	}
}

// ordernum="0" 是 PHP falsy → 102 且不触发 SQL。
// 设置一条本会命中的期望：若 handler 误发查询，期望被消费，下面的断言会失败。
func TestOrderDetailOrdernumZeroNoQuery(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(orderMainQuery).WithArgs("0").WillReturnRows(
		sqlmock.NewRows(orderCols).AddRow("R1", 8, "1794014028", 1, 5.5))
	got := serve(t, svc, "/include/ajax.php?service=article&action=orderDetail&ordernum=0")
	if got != `{"state":102,"info":"No data!"}` {
		t.Fatalf("响应体 = %s", got)
	}
	if err := mock.ExpectationsWereMet(); err == nil {
		t.Fatal("ordernum=0 不应触发任何 SQL，但期望的查询已被消费")
	}
}

// 文章已删（title 查不到）→ title 为 ""；amount 为 NULL → "0.00"。
func TestOrderDetailTitleMissingAndNullAmount(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(orderMainQuery).WithArgs("PAY1").WillReturnRows(
		sqlmock.NewRows(orderCols).AddRow("R1", 8, "1794014028", 0, nil))
	mock.ExpectQuery(orderTitleQuery).WithArgs(8).WillReturnRows(sqlmock.NewRows([]string{"title"}))
	got := serve(t, svc, "/include/ajax.php?service=article&action=orderDetail&ordernum=PAY1")
	want := `{"state":100,"info":{"state":0,"ordernum":"R1","title":"","url":"","date":"1794014028","amount":"0.00"}}`
	if got != want {
		t.Fatalf("响应体 = %s\nwant     %s", got, want)
	}
}

func TestOrderDetailAmountFormat(t *testing.T) {
	cases := map[float64]string{1: "1.00", 0.1: "0.10", 12.345: "12.35", 100.999: "101.00"}
	for in, want := range cases {
		svc, mock := newService(t)
		mock.ExpectQuery(orderMainQuery).WithArgs("P").WillReturnRows(
			sqlmock.NewRows(orderCols).AddRow("R", 1, "1", 0, in))
		mock.ExpectQuery(orderTitleQuery).WithArgs(1).WillReturnRows(sqlmock.NewRows([]string{"title"}))
		got := serve(t, svc, "/include/ajax.php?service=article&action=orderDetail&ordernum=P")
		if !strings.Contains(got, `"amount":"`+want+`"`) {
			t.Fatalf("amount %v: 响应体 = %s，want %s", in, got, want)
		}
	}
}

// 主查询出错 / 无库 → 102。
func TestOrderDetailDBErrorAndNoDB(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(orderMainQuery).WithArgs("P").WillReturnError(fmt.Errorf("mock db error"))
	if got := serve(t, svc, "/include/ajax.php?service=article&action=orderDetail&ordernum=P"); got != `{"state":102,"info":"No data!"}` {
		t.Fatalf("响应体 = %s", got)
	}
	nodb, _ := New(Dep{DB: nil, TablePrefix: "huoniao_"})
	if got := serve(t, nodb, "/include/ajax.php?service=article&action=orderDetail&ordernum=P"); got != `{"state":102,"info":"No data!"}` {
		t.Fatalf("响应体 = %s", got)
	}
}
