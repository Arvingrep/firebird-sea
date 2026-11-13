package member

import (
	"context"
	"database/sql/driver"
	"encoding/json"
	"net/http"
	"strings"
	"testing"
	"time"

	sqlmock "github.com/DATA-DOG/go-sqlmock"
)

// 期望串是实际 SQL 的子串即可（SQL 很长，只校验关键片段）。
var containsMatcher = sqlmock.QueryMatcherFunc(func(expected, actual string) error {
	if strings.Contains(actual, expected) {
		return nil
	}
	return &mismatch{expected, actual}
})

type mismatch struct{ want, got string }

func (m *mismatch) Error() string { return "SQL 不含 " + m.want + "\n实际: " + m.got }

var fixedNow = time.Unix(1700000000, 0)

func newCommentService(t *testing.T, identity Identity, mut func(*Dep)) (*Service, sqlmock.Sqlmock) {
	t.Helper()
	db, mock, err := sqlmock.New(sqlmock.QueryMatcherOption(containsMatcher))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	dep := Dep{
		DB: db, TablePrefix: "huoniao_", Identity: identity, Clock: func() time.Time { return fixedNow },
		UserDetail: func(_ context.Context, _ *http.Request, id string, valid bool) (any, error) {
			o := NewObject()
			o.Set("id", id)
			o.Set("valid", valid)
			return o, nil
		},
		ModuleDetail: func(context.Context, *http.Request, string, string, string) (*Object, bool, error) {
			return nil, false, nil
		},
	}
	if mut != nil {
		mut(&dep)
	}
	svc, err := New(dep)
	if err != nil {
		t.Fatal(err)
	}
	return svc, mock
}

const (
	tc      = "`huoniao_public_comment_all`"
	qMain   = "SELECT `id`, `pid`, `sid`, `type`"
	qAvg    = "SELECT avg(c.`sco1`)"
	qRating = "SELECT `rating` FROM"
)

func commentRows(rows ...[]any) *sqlmock.Rows {
	cols := []string{"id", "pid", "sid", "type", "ipaddr", "aid", "oid", "userid", "rating", "sco1", "content", "pics", "audio", "video", "dtime", "ip", "zan", "zan_user", "isanony", "specation", "peisongid", "star", "starps", "contentps", "reply", "replydate", "time", "top", "masterid"}
	r := sqlmock.NewRows(cols)
	for _, row := range rows {
		vals := make([]driver.Value, len(row))
		for i, v := range row {
			vals[i] = v
		}
		r.AddRow(vals...)
	}
	return r
}

// row 构造一行：id、pid、type、userid、isanony、zan_user、dtime 可调，其余固定。
func row(id, pid, typ, userid, isanony, zanUser, dtime string) []any {
	return []any{id, pid, "0", typ, "江苏省苏州市 电信", "7", "0", userid, "1", "5", "好评", "a.jpg,b.jpg", "", "", dtime, "1.1.1.1", "3", zanUser, isanony, "红$$$大", "0", "0", "", "", "", "0", "1699990000", "0", "9"}
}

func expectStats(m sqlmock.Sqlmock, total int) {
	m.ExpectQuery("SELECT COUNT(*) FROM " + tc).WillReturnRows(count(total))
	for i := 0; i < 5; i++ {
		m.ExpectQuery("SELECT COUNT(*) FROM " + tc).WillReturnRows(count(i))
	}
	m.ExpectQuery(qRating).WillReturnRows(sqlmock.NewRows([]string{"rating"}).AddRow("1").AddRow("1").AddRow("2").AddRow("3").AddRow(nil))
	m.ExpectQuery(qAvg).WillReturnRows(sqlmock.NewRows([]string{"a", "b", "c"}).AddRow("4.5000", nil, "2.9"))
	m.ExpectQuery("SELECT COUNT(*) FROM " + tc).WillReturnRows(count(2))
}

func call(t *testing.T, svc *Service, query string) map[string]any {
	t.Helper()
	body := do(t, svc, http.MethodGet, "/ajax?service=member&action=getComment&"+query, "")
	var out map[string]any
	if err := json.Unmarshal([]byte(body), &out); err != nil {
		t.Fatalf("响应不是 JSON: %v\n%s", err, body)
	}
	t.Log(body)
	return out
}

func TestGetCommentParamError(t *testing.T) {
	for _, q := range []string{"aid=1", "type=article-detail", "type=0&aid=1", "type=a&aid=abc", ""} {
		svc, m := newCommentService(t, nil, nil)
		out := call(t, svc, q)
		if out["state"] != float64(101) || out["info"] != "参数错误" {
			t.Fatalf("%q: %v", q, out)
		}
		met(t, m)
	}
}

func TestGetCommentEmpty(t *testing.T) {
	svc, m := newCommentService(t, nil, nil)
	m.ExpectQuery("SELECT COUNT(*) FROM "+tc+" WHERE `ischeck` = 1 AND `type` = ? AND `aid` = ? AND `pid` = ?").
		WithArgs("article-detail", 7, 0).WillReturnRows(count(0))
	out := call(t, svc, "type=article-detail&aid=7")
	if out["state"] != float64(101) || out["info"] != "暂无数据！" {
		t.Fatalf("%v", out)
	}
	met(t, m)
}

func TestGetCommentListAnonymous(t *testing.T) {
	svc, m := newCommentService(t, nil, nil)
	expectStats(m, 2)
	m.ExpectQuery(qMain).WithArgs("article-detail", 7, 0, 0, 10).WillReturnRows(commentRows(
		row("12", "0", "article-detail", "3", "1", "5,-1", "1699999000"),
		row("11", "0", "article-detail", "4", "0", "", "1600000000"),
	))
	out := call(t, svc, "type=article-detail&aid=7")
	info := out["info"].(map[string]any)
	pi := info["pageInfo"].(map[string]any)
	if pi["totalCount"] != float64(2) || pi["sco6"] != float64(2) || pi["sco7"] != float64(1) || pi["sco8"] != float64(1) ||
		pi["score1"] != float64(4) || pi["score2"] != float64(0) || pi["score3"] != float64(2) || pi["pic"] != float64(2) {
		t.Fatalf("pageInfo: %v", pi)
	}
	list := info["list"].([]any)
	first, second := list[0].(map[string]any), list[1].(map[string]any)
	if _, ok := first["isfollow"]; ok {
		t.Fatal("匿名不应输出 isfollow")
	}
	if first["user"].(map[string]any)["nickname"] != "匿名用户" || first["zan_has"] != float64(0) || first["is_self"] != float64(0) {
		t.Fatalf("first: %v", first)
	}
	if second["user"].(map[string]any)["id"] != "4" || first["specation"] != "红，大" || first["sco1Txt"] != "超赞" || first["count"] != float64(2) {
		t.Fatalf("second: %v", second)
	}
	if d := second["detail"].(map[string]any); d["title"] != "信息不存在或已删除" || d["id"] != "7" {
		t.Fatalf("detail: %v", d)
	}
	if first["iphome"] != "江苏苏州" || first["ftime"] != "16分钟前" { // 1700000000-1699999000=1000s
		t.Fatalf("iphome/ftime: %v %v", first["iphome"], first["ftime"])
	}
	if second["ftime"] != "2020-09-13" {
		t.Fatalf("ftime: %v", second["ftime"])
	}
	if pics := first["pics"].([]any); len(pics) != 2 || pics[0] != "a.jpg" {
		t.Fatalf("pics: %v", pics)
	}
	if _, ok := first["lower"]; ok {
		t.Fatal("son 未传不应有 lower")
	}
	met(t, m)
}

func TestGetCommentLoggedInFollowAndZan(t *testing.T) {
	svc, m := newCommentService(t, fakeIdentity(5), nil)
	expectStats(m, 1)
	m.ExpectQuery(qMain).WillReturnRows(commentRows(row("12", "0", "article-detail", "5", "0", "1,5", "1699999990")))
	m.ExpectQuery("FROM `huoniao_member_follow` WHERE `tid` = ? AND `fid` = ?").WithArgs(int64(5), "5").
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
	out := call(t, svc, "type=article-detail&aid=7")
	first := out["info"].(map[string]any)["list"].([]any)[0].(map[string]any)
	if first["isfollow"] != float64(1) || first["zan_has"] != float64(1) || first["is_self"] != float64(1) || first["ftime"] != "刚刚" {
		t.Fatalf("%v", first)
	}
	met(t, m)
}

func TestGetCommentSonWithChildren(t *testing.T) {
	svc, m := newCommentService(t, nil, nil)
	expectStats(m, 1)
	m.ExpectQuery(qMain).WillReturnRows(commentRows(row("12", "0", "article-detail", "5", "1", "", "1699999990")))
	// getChildComment(pid=12, rid=0, sid=0)：totalCount、totalCount_all
	m.ExpectQuery("WHERE 1 = 1 AND `pid` = 12 AND (`rid` = 0 OR `rid` = 12) AND `ischeck` = 1").WillReturnRows(count(1))
	m.ExpectQuery("WHERE 1 = 1 AND `pid` = 12 AND `ischeck` = 1").WillReturnRows(count(3))
	childCols := []string{"id", "pid", "type", "oid", "rid", "sid", "ipaddr", "zan", "dtime", "userid", "zan_user", "content", "ip"}
	m.ExpectQuery("ORDER BY `id` ASC LIMIT ?, ?").WithArgs(0, 100).WillReturnRows(
		sqlmock.NewRows(childCols).AddRow("20", "12", "article-detail", "0", "0", "11", "", "1", "1699999000", "6", "", "<b>原文</b>", "2.2.2.2"))
	// reply_to_user：sid=11 的作者
	m.ExpectQuery("SELECT `userid` FROM " + tc + " WHERE `id` = ?").WithArgs("11").WillReturnRows(sqlmock.NewRows([]string{"userid"}).AddRow("8"))
	// 递归 rid=20：无下级 → state 200
	m.ExpectQuery("WHERE 1 = 1 AND `rid` = 20 AND `ischeck` = 1").WillReturnRows(count(0))
	m.ExpectQuery("WHERE 1 = 1 AND `rid` = 20 AND `ischeck` = 1").WillReturnRows(count(0))
	out := call(t, svc, "type=article-detail&aid=7&son=1")
	first := out["info"].(map[string]any)["list"].([]any)[0].(map[string]any)
	lower := first["lower"].(map[string]any)
	if lower["count"] != float64(3) {
		t.Fatalf("lower: %v", lower)
	}
	c := lower["list"].([]any)[0].(map[string]any)
	if c["content"] != "<b>原文</b>" || c["user"].(map[string]any)["id"] != "6" || c["reply_to_user"].(map[string]any)["id"] != "8" {
		t.Fatalf("child: %v", c)
	}
	if l := c["lower"].(map[string]any); l["count"] != float64(0) || l["list"] == nil {
		t.Fatalf("子评论无下级时 lower = {count:0, list:[]}: %v", l)
	}
	if _, ok := c["member"]; ok {
		t.Fatal("非 rid 分支不应有 member")
	}
	met(t, m)
}

func TestGetCommentSonChildEmptyGivesEmptyString(t *testing.T) {
	svc, m := newCommentService(t, nil, nil)
	expectStats(m, 1)
	m.ExpectQuery(qMain).WillReturnRows(commentRows(row("12", "0", "article-detail", "5", "1", "", "1699999990")))
	m.ExpectQuery("WHERE 1 = 1 AND `pid` = 12 AND (`rid` = 0 OR `rid` = 12)").WillReturnRows(count(0))
	m.ExpectQuery("WHERE 1 = 1 AND `pid` = 12 AND `ischeck` = 1").WillReturnRows(count(0))
	out := call(t, svc, "type=article-detail&aid=7&son=1")
	lower := out["info"].(map[string]any)["list"].([]any)[0].(map[string]any)["lower"].(map[string]any)
	if lower["count"] != float64(0) || lower["list"] != "" {
		t.Fatalf("%v", lower)
	}
	met(t, m)
}

func TestGetCommentSonSkipsReplies(t *testing.T) {
	svc, m := newCommentService(t, nil, nil)
	expectStats(m, 1)
	r := row("12", "9", "article-detail", "5", "1", "", "1699999990")
	m.ExpectQuery(qMain).WillReturnRows(commentRows(r))
	out := call(t, svc, "type=article-detail&aid=7&pid=9&son=1")
	first := out["info"].(map[string]any)["list"].([]any)[0].(map[string]any)
	if _, ok := first["lower"]; ok {
		t.Fatal("pid != 0 不应有 lower")
	}
	met(t, m)
}

func TestGetCommentIsAjaxSkipsStats(t *testing.T) {
	svc, m := newCommentService(t, nil, nil)
	m.ExpectQuery(qMain).WillReturnRows(commentRows())
	body := do(t, svc, http.MethodGet, "/ajax?service=member&action=getComment&type=article-detail&aid=7&isAjax=1", "")
	eq(t, body, `{"state":100,"info":{"pageInfo":[],"list":[]}}`)
	met(t, m)
}

func TestGetCommentOrderBy(t *testing.T) {
	cases := map[string]string{
		"orderby=hot":                   "ORDER BY `zan` DESC, `id` DESC LIMIT ?, ?",
		"orderby=1":                     "ORDER BY `id` ASC LIMIT ?, ?",
		"orderby=2":                     "ORDER BY `id` DESC LIMIT ?, ?",
		"orderby=hot&type=tieba-detail": "ORDER BY `zan` DESC, `id` DESC LIMIT ?, ?",
	}
	for q, want := range cases {
		svc, m := newCommentService(t, nil, nil)
		m.ExpectQuery(want).WillReturnRows(commentRows())
		_ = call(t, svc, "type=article-detail&aid=7&isAjax=1&"+q)
		met(t, m)
	}
	svc, m := newCommentService(t, nil, nil)
	m.ExpectQuery("ORDER BY `top` DESC, `id` ASC LIMIT ?, ?").WillReturnRows(commentRows())
	_ = call(t, svc, "type=tieba-detail&aid=7&isAjax=1&orderby=1")
	met(t, m)
}

func TestGetCommentTiebaWhereHasNoPid(t *testing.T) {
	svc, m := newCommentService(t, nil, nil)
	m.ExpectQuery("WHERE `pid` = 0 AND `ischeck` = 1 AND `type` = ? AND `aid` = ?").WithArgs("tieba-detail", 7).WillReturnRows(count(0))
	out := call(t, svc, "type=tieba-detail&aid=7")
	if out["info"] != "暂无数据！" {
		t.Fatal(out)
	}
	met(t, m)
}

func TestGetCommentTiebaExtras(t *testing.T) {
	svc, m := newCommentService(t, nil, nil)
	m.ExpectQuery(qMain).WillReturnRows(commentRows(row("12", "0", "tieba-detail", "5", "1", "", "1699999990")))
	m.ExpectQuery("FROM `huoniao_tieba_list` WHERE `state` = 1 AND `uid` = ?").WithArgs("5").WillReturnRows(sqlmock.NewRows([]string{"t"}).AddRow("4"))
	m.ExpectQuery("`jinghua` = 1 AND `uid` = ?").WithArgs("5").WillReturnRows(sqlmock.NewRows([]string{"t"}).AddRow("1"))
	m.ExpectQuery("`type` = 'tieba-detail' AND `pid` = ?").WithArgs("12").WillReturnRows(sqlmock.NewRows([]string{"t"}).AddRow("2"))
	body := do(t, svc, http.MethodGet, "/ajax?service=member&action=getComment&type=tieba-detail&aid=7&isAjax=1", "")
	for _, want := range []string{`"tizi_memberTotal":"4"`, `"tizi_memberJinghuaTotal":"1"`, `"replynums":"2"`} {
		if !strings.Contains(body, want) {
			t.Fatalf("缺 %s: %s", want, body)
		}
	}
	met(t, m)
}

func TestGetCommentU1AnonymousUsesMinusOne(t *testing.T) {
	svc, m := newCommentService(t, nil, nil)
	m.ExpectQuery("WHERE `ischeck` = 1 AND `userid` = ?").WithArgs(int64(-1)).WillReturnRows(sqlmock.NewRows([]string{"id"}))
	m.ExpectQuery("WHERE `ischeck` = 1 AND `userid` != ? AND  `masterid` = ? AND `sid` = '0'").WithArgs(int64(-1), int64(-1)).WillReturnRows(count(0))
	out := call(t, svc, "u=1&onlyself=1")
	if out["info"] != "暂无数据！" {
		t.Fatal(out)
	}
	met(t, m)
}

func TestGetCommentU1WithoutOnlyselfHasNoUserFilter(t *testing.T) {
	svc, m := newCommentService(t, nil, nil)
	m.ExpectQuery("SELECT COUNT(*) FROM " + tc + " WHERE `ischeck` = 1").WithArgs().WillReturnRows(count(0))
	_ = call(t, svc, "u=1")
	met(t, m)
}

func TestGetCommentU2AnonymousFiltersMinusOne(t *testing.T) {
	svc, m := newCommentService(t, nil, nil)
	m.ExpectQuery("WHERE `ischeck` = 1 AND  `userid` = ?").WithArgs(int64(-1)).WillReturnRows(count(0))
	_ = call(t, svc, "u=2")
	met(t, m)
}

func TestGetCommentMissingHookFailsLoudly(t *testing.T) {
	svc, m := newCommentService(t, nil, func(d *Dep) { d.UserDetail = nil })
	m.ExpectQuery(qMain).WillReturnRows(commentRows(row("12", "0", "article-detail", "5", "0", "", "1699999990")))
	out := call(t, svc, "type=article-detail&aid=7&isAjax=1")
	if out["state"] != float64(102) {
		t.Fatal(out)
	}
}

func TestGetCommentModuleDetailAndURL(t *testing.T) {
	svc, m := newCommentService(t, nil, func(d *Dep) {
		d.ModuleDetail = func(_ context.Context, _ *http.Request, module, action, aid string) (*Object, bool, error) {
			o := NewObject()
			o.Set("id", aid)
			o.Set("title", module+"/"+action)
			o.Set("url", "")
			return o, true, nil
		}
	})
	m.ExpectQuery(qMain).WillReturnRows(commentRows(row("12", "0", "article-detail", "5", "1", "", "1699999990")))
	out := call(t, svc, "type=article-detail&aid=7&isAjax=1")
	d := out["info"].(map[string]any)["list"].([]any)[0].(map[string]any)["detail"].(map[string]any)
	if d["title"] != "article/detail" || d["url"] != "" { // Files 为 nil → url 空串
		t.Fatal(d)
	}
}

func TestGetCommentPaotuiDetail(t *testing.T) {
	svc, m := newCommentService(t, nil, nil)
	m.ExpectQuery(qMain).WillReturnRows(commentRows(row("12", "0", "paotui-order", "5", "1", "", "1699999990")))
	m.ExpectQuery("LEFT JOIN `huoniao_paotui_order` o ON c.`oid` = o.`id`").WillReturnRows(sqlmock.NewRows([]string{"id", "shopname"}).AddRow("31", "奶茶"))
	out := call(t, svc, "type=paotui-order&aid=7&isAjax=1")
	d := out["info"].(map[string]any)["list"].([]any)[0].(map[string]any)["detail"].(map[string]any)
	if d["id"] != "31" || d["title"] != "奶茶" {
		t.Fatal(d)
	}
	met(t, m)
}

func TestFloorTime(t *testing.T) {
	now := time.Unix(1700000000, 0)
	for sec, want := range map[int64]string{0: "刚刚", 59: "刚刚", 60: "1分钟前", 3600: "1小时前", 86400: "1天前", 86400 * 7: "7天前", 86400 * 8: "2023-11-07", -5: "刚刚"} {
		if got := floorTime(sec, now); got != want {
			t.Errorf("floorTime(%d)=%q want %q", sec, got, want)
		}
	}
}

func TestGetIPHome(t *testing.T) {
	cases := []struct {
		ip   string
		mode int
		want string
	}{
		{"江苏省苏州市 电信", 3, "江苏苏州"},
		{"江苏 苏州 电信", 2, "苏州"},
		{"江苏 苏州", 1, "江苏"},
		{"北京市北京市 联通", 3, "北京"},
		{"广西壮族自治区南宁市", 3, "广西南宁"},
		{"内网IP内网IP 内网IP", 3, ""},
		{"未知", 3, ""},
		{"", 3, ""},
		{"江苏 苏州", 0, ""},
		{"江苏  苏州", 3, "江苏"}, // array_filter 保留原下标，[1] 缺失
		{"江苏", 2, "江苏"},
	}
	for _, c := range cases {
		if got := getIPHome(c.ip, c.mode); got != c.want {
			t.Errorf("getIPHome(%q,%d)=%q want %q", c.ip, c.mode, got, c.want)
		}
	}
}
