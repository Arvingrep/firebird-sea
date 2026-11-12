package article

import (
	"context"
	"database/sql/driver"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	sqlmock "github.com/DATA-DOG/go-sqlmock"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

type sdFakeMember int64

func (f sdFakeMember) MemberID(context.Context, *http.Request) (int64, error) { return int64(f), nil }

const (
	sdRowSQL     = "SELECT * FROM `huoniao_article_selfmedia` WHERE `id` = ?"
	sdVerifySQL  = "SELECT `id`, `state` FROM `huoniao_article_selfmedia` WHERE `userid` = ?"
	sdMgrSQL     = "SELECT s.`id` FROM `huoniao_article_selfmedia_manager` m LEFT JOIN `huoniao_article_selfmedia` s ON s.`id` = m.`aid` WHERE m.`userid` = ?"
	sdFieldSQL   = "SELECT `id`, `typename` FROM `huoniao_article_selfmedia_field` ORDER BY `weight` ASC"
	sdClickSQL   = "SELECT SUM(`click`) c FROM `huoniao_articlelist_all` WHERE `admin` = ? AND `arcrank` = 1 AND `waitpay` = 0 AND `del` = 0"
	sdArcSQL     = "SELECT COUNT(`id`) c FROM `huoniao_articlelist_all` WHERE `admin` = ? AND `arcrank` = 1 AND `waitpay` = 0 AND `del` = 0"
	sdFansSQL    = "SELECT COUNT(`id`) c FROM `huoniao_member_follow` WHERE `fid` = ?"
	sdFollowSQL  = "SELECT `id` FROM `huoniao_member_follow` WHERE `tid` = ? AND `fid` = ? LIMIT 1"
	sdGoldenHead = `{"state":100,"info":{"id":"1","userid":"3","type":"1","cityid":"0","ac_name":"News Sync Bot","ac_profile":"AI 新闻同步机器人","ac_photo":"/static/images/default_user.jpg","ac_addrid":"0","ac_field":"0","ac_fieldname":null,"url":"","click":50,"mb_type":0,"mb_typename":"","mb_level":0,"mb_levelname":"","ac_banner":"","ac_bannerList":[],"isfollow":`
)

var sdCols = []string{"id", "userid", "type", "cityid", "ac_name", "ac_profile", "ac_photo", "ac_addrid", "ac_field",
	"mb_type", "mb_level", "ac_banner", "state", "editstate", "editlog", "mb_name", "mb_code", "mb_license", "op_name",
	"op_phone", "op_email", "op_idcard", "op_idcardfront", "org_major_license_type", "org_major_license", "outer",
	"prove", "op_authorize"}

func sdBaseRow() []any {
	return []any{"1", "3", "1", "0", "News Sync Bot", "AI 新闻同步机器人", "/static/images/default_user.jpg", "0", "0",
		"0", "0", "", "1", "1", "", "", "", "", "News Bot", "", "", "", "", "0", "", "", "", ""}
}

func sdServe(svc *Service, target string) string {
	router := ajax.NewRouter(func(string) {})
	Register(router, svc)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, target, nil))
	return rec.Body.String()
}

func sdWithMember(svc *Service, id int64) *Service { svc.members = sdFakeMember(id); return svc }

func sdExpectRow(mock sqlmock.Sqlmock, aid int, row []any) {
	vals := make([]driver.Value, len(row))
	for i, v := range row {
		vals[i] = v
	}
	mock.ExpectQuery(sdRowSQL).WithArgs(aid).WillReturnRows(sqlmock.NewRows(sdCols).AddRow(vals...))
}

// 字段查询 + 三条统计（click→article→fans 顺序与实现一致）。
func sdExpectExtras(mock sqlmock.Sqlmock, userid int64, fields *sqlmock.Rows) {
	mock.ExpectQuery(sdFieldSQL).WillReturnRows(fields)
	mock.ExpectQuery(sdClickSQL).WithArgs(userid).WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("50"))
	mock.ExpectQuery(sdArcSQL).WithArgs(userid).WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("6"))
	mock.ExpectQuery(sdFansSQL).WithArgs(userid).WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("2"))
}

func sdEmptyFields() *sqlmock.Rows { return sqlmock.NewRows([]string{"id", "typename"}) }

func TestSelfmediaDetailNoParams(t *testing.T) {
	for _, q := range []string{"", "&uid=0&aid=0", "&aid=abc", "&uid=abc"} {
		svc, _ := newService(t)
		got := sdServe(svc, "/include/ajax.php?service=article&action=selfmediaDetail"+q)
		if want := `{"state":102,"info":"No data!"}`; got != want {
			t.Fatalf("%q: %s", q, got)
		}
	}
}

func TestSelfmediaDetailAnonymousGolden(t *testing.T) {
	// aid=1abc / aid=1.9 都截断为 1。
	for _, q := range []string{"aid=1", "aid=1abc", "aid=1.9"} {
		svc, mock := newService(t)
		sdExpectRow(mock, 1, sdBaseRow())
		sdExpectExtras(mock, 3, sdEmptyFields())
		got := sdServe(svc, "/include/ajax.php?service=article&action=selfmediaDetail&"+q)
		want := sdGoldenHead + `0,"total_article":6,"total_fans":"2","state":"1"}}`
		if got != want {
			t.Fatalf("%s:\n%s\nwant\n%s", q, got, want)
		}
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatal(err)
		}
	}
}

func TestSelfmediaDetailNotFound(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(sdRowSQL).WithArgs(999).WillReturnRows(sqlmock.NewRows(sdCols))
	if got := sdServe(svc, "/include/ajax.php?service=article&action=selfmediaDetail&aid=999"); got != `{"state":102,"info":"No data!"}` {
		t.Fatal(got)
	}
}

// uid 优先于 aid；verify 通过后 aid 被行 id 覆盖。
func TestSelfmediaDetailUidOverridesAid(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(sdVerifySQL).WithArgs(3).WillReturnRows(sqlmock.NewRows([]string{"id", "state"}).AddRow("1", "1"))
	sdExpectRow(mock, 1, sdBaseRow())
	sdExpectExtras(mock, 3, sdEmptyFields())
	got := sdServe(svc, "/include/ajax.php?service=article&action=selfmediaDetail&uid=3abc&aid=99")
	if want := sdGoldenHead + `0,"total_article":6,"total_fans":"2","state":"1"}}`; got != want {
		t.Fatal(got)
	}
}

func TestSelfmediaDetailVerifyFailures(t *testing.T) {
	noData := `{"state":102,"info":"No data!"}`
	// 无记录且不是管理员（uid=999、uid=4）。
	svc, mock := newService(t)
	mock.ExpectQuery(sdVerifySQL).WithArgs(999).WillReturnRows(sqlmock.NewRows([]string{"id", "state"}))
	mock.ExpectQuery(sdMgrSQL).WithArgs(999).WillReturnRows(sqlmock.NewRows([]string{"id"}))
	if got := sdServe(svc, "/include/ajax.php?service=article&action=selfmediaDetail&uid=999&aid=1"); got != noData {
		t.Fatal(got)
	}
	// uid=-1 同样进 uid 分支。
	svc, mock = newService(t)
	mock.ExpectQuery(sdVerifySQL).WithArgs(-1).WillReturnRows(sqlmock.NewRows([]string{"id", "state"}))
	mock.ExpectQuery(sdMgrSQL).WithArgs(-1).WillReturnRows(sqlmock.NewRows([]string{"id"}))
	if got := sdServe(svc, "/include/ajax.php?service=article&action=selfmediaDetail&uid=-1&aid=1"); got != noData {
		t.Fatal(got)
	}
	// 审核中 / 已拒绝。
	for _, st := range []string{"0", "2"} {
		svc, mock = newService(t)
		mock.ExpectQuery(sdVerifySQL).WithArgs(3).WillReturnRows(sqlmock.NewRows([]string{"id", "state"}).AddRow("1", st))
		if got := sdServe(svc, "/include/ajax.php?service=article&action=selfmediaDetail&uid=3"); got != noData {
			t.Fatal(st, got)
		}
	}
	// 管理员兜底命中但 LEFT JOIN 为 NULL → 102。
	svc, mock = newService(t)
	mock.ExpectQuery(sdVerifySQL).WithArgs(7).WillReturnRows(sqlmock.NewRows([]string{"id", "state"}))
	mock.ExpectQuery(sdMgrSQL).WithArgs(7).WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(nil))
	if got := sdServe(svc, "/include/ajax.php?service=article&action=selfmediaDetail&uid=7"); got != noData {
		t.Fatal(got)
	}
}

func TestSelfmediaDetailManagerFallback(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(sdVerifySQL).WithArgs(9).WillReturnRows(sqlmock.NewRows([]string{"id", "state"}))
	mock.ExpectQuery(sdMgrSQL).WithArgs(9).WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow("1"))
	sdExpectRow(mock, 1, sdBaseRow())
	sdExpectExtras(mock, 3, sdEmptyFields())
	mock.ExpectQuery(sdFollowSQL).WithArgs(int64(9), int64(3)).WillReturnRows(sqlmock.NewRows([]string{"id"}))
	got := sdServe(sdWithMember(svc, 9), "/include/ajax.php?service=article&action=selfmediaDetail&uid=9")
	// 管理员不是号主：isfollow 查 member_follow（未关注 → 0）。
	if want := sdGoldenHead + `0,"total_article":6,"total_fans":"2","state":"1"}}`; got != want {
		t.Fatal(got)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatal(err)
	}
}

func TestSelfmediaDetailFollower(t *testing.T) {
	svc, mock := newService(t)
	sdExpectRow(mock, 1, sdBaseRow())
	sdExpectExtras(mock, 3, sdEmptyFields())
	mock.ExpectQuery(sdFollowSQL).WithArgs(int64(4), int64(3)).WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow("1"))
	got := sdServe(sdWithMember(svc, 4), "/include/ajax.php?service=article&action=selfmediaDetail&aid=1")
	if want := sdGoldenHead + `1,"total_article":6,"total_fans":"2","state":"1"}}`; got != want {
		t.Fatal(got)
	}
}

const sdOwnerTail = `"ac_photoSource":"/static/images/default_user.jpg","mb_name":"","mb_code":"","mb_license":"","mb_licenseSource":"","op_name":"News Bot","op_phone":"","op_email":"","op_idcard":"","op_idcardfront":"","op_idcardfrontSource":"","org_major_license_type":"0","org_major_license_typename":"《广播电视播出机构许可证》","org_major_license":"","org_major_licenseSource":"","outer":"","editstate":"1","prove":"","proveList":[],"op_authorize":"","op_authorizeSource":""}}`

func TestSelfmediaDetailOwner(t *testing.T) {
	svc, mock := newService(t)
	sdExpectRow(mock, 1, sdBaseRow())
	sdExpectExtras(mock, 3, sdEmptyFields())
	got := sdServe(sdWithMember(svc, 3), "/include/ajax.php?service=article&action=selfmediaDetail&aid=1")
	want := sdGoldenHead + `2,"total_article":6,"total_fans":"2","state":"1",` + sdOwnerTail
	if got != want {
		t.Fatalf("%s\nwant\n%s", got, want)
	}
}

// SQL NULL 列输出 null，不统一成 ""。
func TestSelfmediaDetailOwnerNullColumns(t *testing.T) {
	svc, mock := newService(t)
	row := sdBaseRow()
	row[15] = nil // mb_name
	row[26] = nil // prove
	sdExpectRow(mock, 1, row)
	sdExpectExtras(mock, 3, sdEmptyFields())
	got := sdServe(sdWithMember(svc, 3), "/include/ajax.php?service=article&action=selfmediaDetail&aid=1")
	for _, frag := range []string{`"mb_name":null`, `"prove":null`, `"proveList":[]`} {
		if !contains(got, frag) {
			t.Fatalf("缺 %s: %s", frag, got)
		}
	}
}

// 本人 + state=1 + editstate=0 + editlog 非空 → 草稿覆盖整行。
func TestSelfmediaDetailEditlogMerge(t *testing.T) {
	svc, mock := newService(t)
	row := sdBaseRow()
	row[13] = "0"
	row[14] = `a:1:{s:4:"data";a:2:{s:7:"ac_name";s:6:"草稿";s:10:"ac_profile";s:3:"new";}}`
	sdExpectRow(mock, 1, row)
	sdExpectExtras(mock, 3, sdEmptyFields())
	got := sdServe(sdWithMember(svc, 3), "/include/ajax.php?service=article&action=selfmediaDetail&aid=1")
	if !contains(got, `"ac_name":"草稿","ac_profile":"new"`) {
		t.Fatal(got)
	}
	// 非本人看不到草稿。
	svc, mock = newService(t)
	sdExpectRow(mock, 1, row)
	sdExpectExtras(mock, 3, sdEmptyFields())
	if got = sdServe(svc, "/include/ajax.php?service=article&action=selfmediaDetail&aid=1"); !contains(got, `"ac_name":"News Sync Bot"`) {
		t.Fatal(got)
	}
	// 损坏的 editlog 等于不合并。
	svc, mock = newService(t)
	row[14] = "a:1:{broken"
	sdExpectRow(mock, 1, row)
	sdExpectExtras(mock, 3, sdEmptyFields())
	if got = sdServe(sdWithMember(svc, 3), "/include/ajax.php?service=article&action=selfmediaDetail&aid=1"); !contains(got, `"ac_name":"News Sync Bot"`) {
		t.Fatal(got)
	}
}

// type=2 / type=4：mb_type、mb_level 是字符串；type42 用 mb_type 查；字典未命中取第一项。
func TestSelfmediaDetailTypes(t *testing.T) {
	svc, mock := newService(t)
	row := sdBaseRow()
	row[2], row[9], row[10] = "4", "2", "3"
	sdExpectRow(mock, 1, row)
	sdExpectExtras(mock, 3, sdEmptyFields())
	got := sdServe(svc, "/include/ajax.php?service=article&action=selfmediaDetail&aid=1")
	if !contains(got, `"mb_type":"2","mb_typename":"事业单位","mb_level":"3","mb_levelname":"省部级"`) {
		t.Fatal(got)
	}
	svc, mock = newService(t)
	row[2], row[9], row[10] = "2", "9", "3"
	sdExpectRow(mock, 1, row)
	sdExpectExtras(mock, 3, sdEmptyFields())
	got = sdServe(svc, "/include/ajax.php?service=article&action=selfmediaDetail&aid=1")
	if !contains(got, `"mb_type":"9","mb_typename":"机构媒体","mb_level":0,"mb_levelname":""`) {
		t.Fatal(got)
	}
}

// ac_fieldname：命中、未命中回落第一项。
func TestSelfmediaDetailFieldName(t *testing.T) {
	for ac, want := range map[string]string{"7": "旅行", "99": "摄影"} {
		svc, mock := newService(t)
		row := sdBaseRow()
		row[8] = ac
		sdExpectRow(mock, 1, row)
		sdExpectExtras(mock, 3, sqlmock.NewRows([]string{"id", "typename"}).AddRow("3", "摄影").AddRow("7", "旅行"))
		got := sdServe(svc, "/include/ajax.php?service=article&action=selfmediaDetail&aid=1")
		if !contains(got, `"ac_fieldname":"`+want+`"`) {
			t.Fatal(ac, got)
		}
	}
}

func TestSelfmediaDetailBanner(t *testing.T) {
	svc, mock := newService(t)
	row := sdBaseRow()
	row[11] = "/a.jpg|图一,/b.jpg"
	sdExpectRow(mock, 1, row)
	sdExpectExtras(mock, 3, sdEmptyFields())
	got := sdServe(svc, "/include/ajax.php?service=article&action=selfmediaDetail&aid=1")
	if !contains(got, `"ac_bannerList":[{"path":"/a.jpg","pathSource":"/a.jpg","info":"图一"},{"path":"/b.jpg","pathSource":"/b.jpg","info":null}]`) {
		t.Fatal(got)
	}
	// 占位串不解析。
	svc, mock = newService(t)
	row[11] = "ac_banner"
	sdExpectRow(mock, 1, row)
	sdExpectExtras(mock, 3, sdEmptyFields())
	got = sdServe(svc, "/include/ajax.php?service=article&action=selfmediaDetail&aid=1")
	if !contains(got, `"ac_banner":"ac_banner","ac_bannerList":[]`) {
		t.Fatal(got)
	}
}

func contains(s, sub string) bool { return strings.Contains(s, sub) }
