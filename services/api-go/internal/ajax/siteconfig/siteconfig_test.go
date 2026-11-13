package siteconfig

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	sqlmock "github.com/DATA-DOG/go-sqlmock"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

const (
	moduleSQLHead = "SELECT `id`, `type`, `title`, `subject`, `name`, `icon`, `link`, `bold`, `target`, `color`, `wx`, `bd`, `qm`, `dy`, `app`, `pc`, `h5`, `harmony`, `android`, `ios` FROM `huoniao_site_module` WHERE `state` = 0 AND `parentid` = 1"
	moduleSQLTail = " ORDER BY `weight`, `id`"
	notSpecialSQL = " AND `name` != 'special' AND `name` != 'website'"
	typeZeroSQL   = " AND `type` = 0"
	citySQL       = "SELECT `config` FROM `huoniao_site_city` WHERE `cid` = "
	personalSQL   = "SELECT `id` FROM `huoniao_homemaking_personal` WHERE `userid` = ? LIMIT 1"

	iphoneUA  = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15"
	androidUA = "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Mobile Safari/537.36"
	desktopUA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36"
	devtoolUA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) MicroMessenger/8.0 wechatdevtools/1.06"
)

var moduleCols = []string{"id", "type", "title", "subject", "name", "icon", "link", "bold", "target", "color", "wx", "bd", "qm", "dy", "app", "pc", "h5", "harmony", "android", "ios"}

// mod 描述一行 site_module；pc / h5 / wx 之外的端开关一律 "0"。
type mod struct {
	id, name, pc, h5, wx string
}

func newMock(t *testing.T, members MemberResolver) (*Service, sqlmock.Sqlmock) {
	t.Helper()
	// 期望串按子串匹配：模块 SQL 的 WHERE 片段是被测重点，不做整串相等。
	db, mock, err := sqlmock.New(sqlmock.QueryMatcherOption(sqlmock.QueryMatcherFunc(func(expected, actual string) error {
		if strings.Contains(actual, expected) {
			return nil
		}
		return &mismatch{expected, actual}
	})))
	if err != nil {
		t.Fatalf("sqlmock: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })
	svc, err := New(Dep{DB: db, TablePrefix: "huoniao_", Members: members, StaticVersion: "1"})
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	return svc, mock
}

type mismatch struct{ want, got string }

func (m *mismatch) Error() string {
	return "SQL 不匹配\nwant(子串): " + m.want + "\ngot: " + m.got
}

// expectModules 期望模块查询，where 为完整的 WHERE 追加片段。
func expectModules(mock sqlmock.Sqlmock, where string, mods ...mod) {
	rows := sqlmock.NewRows(moduleCols)
	for _, m := range mods {
		rows.AddRow(m.id, "0", "", "", m.name, "", "", "0", "_self", "", m.wx, "0", "0", "0", "0", m.pc, m.h5, "0", "0", "0")
	}
	mock.ExpectQuery(moduleSQLHead + where + moduleSQLTail).WillReturnRows(rows)
}

type result struct {
	State int
	Info  json.RawMessage
}

func (r result) items(t *testing.T) []map[string]any {
	t.Helper()
	var l []map[string]any
	if err := json.Unmarshal(r.Info, &l); err != nil {
		t.Fatalf("info 不是数组: %s", r.Info)
	}
	return l
}

func (r result) names(t *testing.T) []string {
	var out []string
	for _, it := range r.items(t) {
		out = append(out, it["code"].(string))
	}
	return out
}

type reqOpt func(*http.Request)

func withUA(ua string) reqOpt { return func(r *http.Request) { r.Header.Set("User-Agent", ua) } }
func withCookie(k, v string) reqOpt {
	return func(r *http.Request) { r.AddCookie(&http.Cookie{Name: k, Value: v}) }
}

func serve(t *testing.T, svc *Service, query string, opts ...reqOpt) result {
	t.Helper()
	router := ajax.NewRouter(func(string) {})
	Register(router, svc)
	req := httptest.NewRequest(http.MethodGet, "/include/ajax.php?service=siteConfig&action=siteModule"+query, nil)
	for _, o := range opts {
		o(req)
	}
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)
	var r result
	if err := json.Unmarshal(rec.Body.Bytes(), &r); err != nil {
		t.Fatalf("响应不是 JSON: %s", rec.Body.String())
	}
	return r
}

func met(t *testing.T, mock sqlmock.Sqlmock) {
	t.Helper()
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("SQL 期望未满足: %v", err)
	}
}

func wantNames(t *testing.T, r result, state int, names ...string) {
	t.Helper()
	if r.State != state {
		t.Fatalf("state = %d (%s)，want %d", r.State, r.Info, state)
	}
	if state != 100 {
		return
	}
	got := strings.Join(r.names(t), ",")
	if got != strings.Join(names, ",") {
		t.Fatalf("模块 = %s，want %s", got, strings.Join(names, ","))
	}
}

func TestPing(t *testing.T) {
	router := ajax.NewRouter(func(string) {})
	Register(router, nil)
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/include/ajax.php?service=siteConfig&action=ping", nil))
	if recorder.Code != http.StatusOK {
		t.Fatalf("状态码 = %d，want 200", recorder.Code)
	}
	if body := recorder.Body.String(); body != `{"state":100,"info":"pong"}` {
		t.Fatalf("响应体 = %s", body)
	}
}

func TestSiteModuleNilDB(t *testing.T) {
	svc, err := New(Dep{TablePrefix: "huoniao_"})
	if err != nil {
		t.Fatal(err)
	}
	r := serve(t, svc, "")
	if r.State != 102 || string(r.Info) != `"No data!"` {
		t.Fatalf("got %d %s", r.State, r.Info)
	}
}

// 桌面默认：type 为空 → 只取 type=0，按 pc 开关过滤，不排除 special/website，全量返回。
func TestSiteModuleDesktopDefault(t *testing.T) {
	svc, mock := newMock(t, nil)
	expectModules(mock, typeZeroSQL,
		mod{id: "1", name: "article", pc: "1", h5: "1"},
		mod{id: "2", name: "special", pc: "1", h5: "0"},
		mod{id: "3", name: "shop", pc: "0", h5: "1"},
		mod{id: "4", name: "house", pc: "1", h5: "0"},
	)
	r := serve(t, svc, "", withUA(desktopUA))
	wantNames(t, r, 100, "article", "special", "house")
	it := r.items(t)[0]
	if it["searchUrl"] != "http://example.com/search-list.html?action=article&keywords=" {
		t.Fatalf("searchUrl = %v", it["searchUrl"])
	}
	if it["icon"] != "http://example.com/static/images/admin/nav/article.png?v=1" {
		t.Fatalf("icon = %v", it["icon"])
	}
	if it["title"] != "马尼拉华人资讯 - 本地新闻动态" || it["disabled"] != float64(0) {
		t.Fatalf("title/disabled = %v / %v", it["title"], it["disabled"])
	}
	if _, ok := it["personal"]; ok {
		t.Fatalf("非 homemaking 不应有 personal")
	}
	met(t, mock)
}

// 移动端 UA（iphone/android）：排除 special/website，按 h5 开关。
func TestSiteModuleMobileUA(t *testing.T) {
	for name, ua := range map[string]string{"iphone": iphoneUA, "android": androidUA} {
		t.Run(name, func(t *testing.T) {
			svc, mock := newMock(t, nil)
			expectModules(mock, typeZeroSQL+notSpecialSQL,
				mod{id: "1", name: "article", pc: "0", h5: "1"},
				mod{id: "2", name: "shop", pc: "1", h5: "0"},
				mod{id: "3", name: "house", pc: "1", h5: "1"},
			)
			wantNames(t, serve(t, svc, "", withUA(ua)), 100, "article", "house")
			met(t, mock)
		})
	}
}

// cookie HN_tg=1 视为移动端（即使 UA 是桌面）；值不是 "1" 则不算。
func TestSiteModuleHNTgCookie(t *testing.T) {
	svc, mock := newMock(t, nil)
	expectModules(mock, typeZeroSQL+notSpecialSQL,
		mod{id: "1", name: "article", pc: "0", h5: "1"},
		mod{id: "2", name: "shop", pc: "1", h5: "0"},
	)
	wantNames(t, serve(t, svc, "", withUA(desktopUA), withCookie("HN_tg", "1")), 100, "article")
	met(t, mock)

	svc, mock = newMock(t, nil)
	expectModules(mock, typeZeroSQL, mod{id: "2", name: "shop", pc: "1", h5: "0"})
	wantNames(t, serve(t, svc, "", withUA(desktopUA), withCookie("HN_tg", "0")), 100, "shop")
	met(t, mock)
}

// 移动端 + platform=wx_miniprogram：看 wx 开关；全部 wx=0 → 102 "No data!"。
func TestSiteModuleWxMiniprogram(t *testing.T) {
	svc, mock := newMock(t, nil)
	expectModules(mock, typeZeroSQL+notSpecialSQL,
		mod{id: "1", name: "article", pc: "1", h5: "1", wx: "0"},
		mod{id: "2", name: "shop", pc: "1", h5: "1", wx: "0"},
	)
	r := serve(t, svc, "&platform=wx_miniprogram", withUA(iphoneUA))
	if r.State != 102 || string(r.Info) != `"No data!"` {
		t.Fatalf("got %d %s", r.State, r.Info)
	}
	met(t, mock)

	svc, mock = newMock(t, nil)
	expectModules(mock, typeZeroSQL+notSpecialSQL,
		mod{id: "1", name: "article", pc: "0", h5: "0", wx: "1"},
		mod{id: "2", name: "shop", pc: "1", h5: "1", wx: "0"},
	)
	wantNames(t, serve(t, svc, "&platform=wx_miniprogram", withUA(iphoneUA)), 100, "article")
	met(t, mock)
}

// DevTools UA（MicroMessenger + wechatdevtools）等同小程序：wx 全 0 → 102。
func TestSiteModuleDevToolsUA(t *testing.T) {
	svc, mock := newMock(t, nil)
	expectModules(mock, typeZeroSQL+notSpecialSQL,
		mod{id: "1", name: "article", pc: "1", h5: "1", wx: "0"},
	)
	r := serve(t, svc, "", withUA(devtoolUA))
	if r.State != 102 || string(r.Info) != `"No data!"` {
		t.Fatalf("got %d %s", r.State, r.Info)
	}
	met(t, mock)
}

// type：0 / 空 / 非数字的 empty() 语义。"0" 为空 → 加 type=0；"1"、"abc" 非空 → 不加。
func TestSiteModuleTypeParam(t *testing.T) {
	cases := []struct {
		query, where string
	}{
		{"&type=0", typeZeroSQL},
		{"&type=1", ""},
		{"&type=abc", ""},
	}
	for _, c := range cases {
		t.Run(c.query, func(t *testing.T) {
			svc, mock := newMock(t, nil)
			expectModules(mock, c.where, mod{id: "1", name: "article", pc: "1"})
			wantNames(t, serve(t, svc, c.query, withUA(desktopUA)), 100, "article")
			met(t, mock)
		})
	}
}

// page=touchHome：type 强制为 1（不加 type=0），并跳过 special/website（桌面端也一样）。
func TestSiteModuleTouchHome(t *testing.T) {
	svc, mock := newMock(t, nil)
	expectModules(mock, "",
		mod{id: "1", name: "special", pc: "1"},
		mod{id: "2", name: "website", pc: "1"},
		mod{id: "3", name: "article", pc: "1"},
	)
	wantNames(t, serve(t, svc, "&page=touchHome&type=0", withUA(desktopUA)), 100, "article")
	met(t, mock)
}

// cityid：1 命中城市配置（article 被禁用）；999 无行 → 不过滤；abc 不查库 → 不过滤。
func TestSiteModuleCityID(t *testing.T) {
	cfg := `a:1:{s:7:"article";a:1:{s:5:"state";s:1:"1";}}`
	mods := []mod{{id: "1", name: "article", pc: "1"}, {id: "2", name: "shop", pc: "1"}}

	t.Run("1", func(t *testing.T) {
		svc, mock := newMock(t, nil)
		mock.ExpectQuery(citySQL + "1").WillReturnRows(sqlmock.NewRows([]string{"config"}).AddRow(cfg))
		expectModules(mock, typeZeroSQL, mods...)
		wantNames(t, serve(t, svc, "&cityid=1", withUA(desktopUA)), 100, "shop")
		met(t, mock)
	})
	t.Run("999", func(t *testing.T) {
		svc, mock := newMock(t, nil)
		mock.ExpectQuery(citySQL + "999").WillReturnRows(sqlmock.NewRows([]string{"config"}))
		expectModules(mock, typeZeroSQL, mods...)
		wantNames(t, serve(t, svc, "&cityid=999", withUA(desktopUA)), 100, "article", "shop")
		met(t, mock)
	})
	t.Run("abc", func(t *testing.T) {
		svc, mock := newMock(t, nil) // 若误查城市表，未声明的 query 会让请求失败
		expectModules(mock, typeZeroSQL, mods...)
		wantNames(t, serve(t, svc, "&cityid=abc", withUA(desktopUA)), 100, "article", "shop")
		met(t, mock)
	})
}

type fixedMember int64

func (f fixedMember) MemberID(context.Context, *http.Request) (int64, error) { return int64(f), nil }

// homemaking.personal：匿名 = 0；已登录且有商家行 = 1；其它模块不带该字段。
func TestSiteModuleHomemakingPersonal(t *testing.T) {
	personal := func(r result) float64 {
		for _, it := range r.items(t) {
			if it["code"] == "homemaking" {
				v, ok := it["personal"]
				if !ok {
					t.Fatal("homemaking 缺少 personal")
				}
				return v.(float64)
			}
		}
		t.Fatal("没有 homemaking")
		return -1
	}

	svc, mock := newMock(t, nil)
	expectModules(mock, typeZeroSQL, mod{id: "1", name: "homemaking", pc: "1"})
	if got := personal(serve(t, svc, "", withUA(desktopUA))); got != 0 {
		t.Fatalf("匿名 personal = %v", got)
	}
	met(t, mock)

	svc, mock = newMock(t, fixedMember(7))
	expectModules(mock, typeZeroSQL, mod{id: "1", name: "homemaking", pc: "1"})
	mock.ExpectQuery(personalSQL).WithArgs(int64(7)).WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow("5"))
	if got := personal(serve(t, svc, "", withUA(desktopUA))); got != 1 {
		t.Fatalf("商家 personal = %v", got)
	}
	met(t, mock)

	svc, mock = newMock(t, fixedMember(7))
	expectModules(mock, typeZeroSQL, mod{id: "1", name: "homemaking", pc: "1"})
	mock.ExpectQuery(personalSQL).WithArgs(int64(7)).WillReturnRows(sqlmock.NewRows([]string{"id"}))
	if got := personal(serve(t, svc, "", withUA(desktopUA))); got != 0 {
		t.Fatalf("非商家 personal = %v", got)
	}
	met(t, mock)
}
