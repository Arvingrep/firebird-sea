package siteconfig

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	sqlmock "github.com/DATA-DOG/go-sqlmock"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

const (
	advSQL      = "SELECT `class`, `title`, `starttime`, `endtime`, `body`, `state` FROM `huoniao_advlist` WHERE `id` = ?"
	advTitleSQL = "SELECT `id` FROM `huoniao_advlist` WHERE `title` = ? ORDER BY `id` DESC LIMIT 1"
	advCitySQL  = "SELECT `body` FROM `huoniao_advlist_city` WHERE `aid` = ? AND `cityid` = ?"

	appUA = "Mozilla/5.0 huoniao android"
	iosUA = "Mozilla/5.0 huoniao_ios"
)

var advCols = []string{"class", "title", "starttime", "endtime", "body", "state"}

// advNow 固定在 2025-01-01 00:00:00 UTC。
var advNow = time.Unix(1735689600, 0)

func newAdvMock(t *testing.T) (*Service, sqlmock.Sqlmock) {
	t.Helper()
	db, mock, err := sqlmock.New(sqlmock.QueryMatcherOption(sqlmock.QueryMatcherEqual))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	svc, err := New(Dep{DB: db, TablePrefix: "huoniao_", AdvMarkState: 1, AdvMarkPostion: 3, Now: func() time.Time { return advNow }})
	if err != nil {
		t.Fatal(err)
	}
	return svc, mock
}

func advServe(t *testing.T, svc *Service, query string, opts ...reqOpt) string {
	t.Helper()
	router := ajax.NewRouter(func(string) {})
	Register(router, svc)
	req := httptest.NewRequest(http.MethodGet, "/include/ajax.php?service=siteConfig&action=adv"+query, nil)
	req.Host = "example.com"
	for _, o := range opts {
		o(req)
	}
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)
	return rec.Body.String()
}

// expectAdv 期望按 id 查 advlist 返回一行。
func expectAdv(mock sqlmock.Sqlmock, id int64, class, title, start, end, body, state string) {
	mock.ExpectQuery(advSQL).WithArgs(id).WillReturnRows(sqlmock.NewRows(advCols).AddRow(class, title, start, end, body, state))
}

func checkAdv(t *testing.T, got, want string) {
	t.Helper()
	if got != want {
		t.Fatalf("响应不一致\n got: %s\nwant: %s", got, want)
	}
}

func TestAdvParamErrors(t *testing.T) {
	for _, q := range []string{"", "&id=0", "&id=abc", "&id=stream", "&id=", "&model=pic", "&title=x"} {
		svc, mock := newAdvMock(t)
		checkAdv(t, advServe(t, svc, q), `{"state":101,"info":"广告ID不得为空！"}`)
		met(t, mock)
	}
	for _, q := range []string{"&id=1,2", "&id=1,", "&id[]=1&id[]=2"} {
		svc, mock := newAdvMock(t)
		checkAdv(t, advServe(t, svc, q), `{"state":101,"info":"格式错误！"}`)
		met(t, mock)
	}
}

func TestAdvNoData(t *testing.T) {
	svc, mock := newAdvMock(t)
	mock.ExpectQuery(advSQL).WithArgs(int64(999999)).WillReturnRows(sqlmock.NewRows(advCols))
	checkAdv(t, advServe(t, svc, "&id=999999"), `{"state":102,"info":"No data!"}`)
	met(t, mock)
}

func TestAdvStateAndWindow(t *testing.T) {
	cases := []struct {
		name, start, end, state, want string
	}{
		{"隐藏", "0", "0", "0", "广告已隐藏！"},
		{"未开始", "1735689601", "0", "1", "广告还未开始！"},
		{"已结束", "0", "1735689599", "1", "广告已结束！"},
	}
	for _, c := range cases {
		svc, mock := newAdvMock(t)
		expectAdv(mock, 2, "1", "t", c.start, c.end, "code$$x$$0", c.state)
		checkAdv(t, advServe(t, svc, "&id=2"), `{"state":101,"info":"`+c.want+`"}`)
		met(t, mock)
	}
	// 窗口内、0/空串不拦截。
	svc, mock := newAdvMock(t)
	expectAdv(mock, 2, "1", "t", "1735689000", "1735690000", "code$$x$$0", "1")
	if !strings.HasPrefix(advServe(t, svc, "&id=2"), `{"state":100`) {
		t.Fatal("窗口内应放行")
	}
	svc, mock = newAdvMock(t)
	expectAdv(mock, 2, "1", "t", "", "", "code$$x$$0", "1")
	if !strings.HasPrefix(advServe(t, svc, "&id=2"), `{"state":100`) {
		t.Fatal("空串不拦截")
	}
}

func TestAdvClass1(t *testing.T) {
	cases := []struct{ name, body, want string }{
		{"pic", "pic$$a.jpg$$https://x.test/$$标题$$1920$$560$$0",
			`{"state":100,"info":{"id":1,"class":1,"advTitle":"首页","type":"pic","src":"a.jpg","turl":"a.jpg","href":"https://x.test/","link":"https://x.test/","title":"标题","width":1920,"height":560,"mark":0,"advMarkState":1,"advMarkPostion":3,"markState":0}}`},
		{"code", "code$$<b>x</b>$$1", `{"state":100,"info":{"id":1,"class":1,"advTitle":"首页","type":"code","body":"<b>x</b>","mark":1}}`},
		{"text", "text$$文字$$#f00$$https://x.test$$14$$1",
			`{"state":100,"info":{"id":1,"class":1,"advTitle":"首页","type":"text","title":"文字","color":"#f00","link":"https://x.test","size":14,"mark":1}}`},
		{"flash", "flash$$a.swf$$100$$50$$1", `{"state":100,"info":{"id":1,"class":1,"advTitle":"首页","type":"flash","src":"a.swf","width":100,"height":50,"mark":1}}`},
		{"缺字段为 null", "pic$$a.jpg", `{"state":100,"info":{"id":1,"class":1,"advTitle":"首页","type":"pic","src":"a.jpg","turl":"a.jpg","href":null,"link":null,"title":null,"width":0,"height":0,"mark":0,"advMarkState":1,"advMarkPostion":3,"markState":0}}`},
		{"未知 type", "zzz$$1", `{"state":100,"info":{"id":1,"class":1,"advTitle":"首页","type":"zzz"}}`},
	}
	for _, c := range cases {
		svc, mock := newAdvMock(t)
		expectAdv(mock, 1, "1", "首页", "0", "0", c.body, "1")
		t.Run(c.name, func(t *testing.T) { checkAdv(t, advServe(t, svc, "&id=1"), c.want) })
		met(t, mock)
	}
}

func TestAdvClass2(t *testing.T) {
	body := "1200$$0$$p1.jpg##t1##https://a.test##d1##1||##t2##openxcx_abc##d2##0||p3.jpg"
	svc, mock := newAdvMock(t)
	expectAdv(mock, 3, "2", "招聘求职", "0", "0", body, "1")
	want := `{"state":100,"info":{"id":3,"class":2,"advTitle":"招聘求职","width":1200,"height":0,"list":[` +
		`{"src":"p1.jpg","turl":"p1.jpg","title":"t1","link":"https://a.test","url":"https://a.test","desc":"d1","mark":1,"advMarkState":1,"advMarkPostion":3,"markState":1},` +
		`{"src":"","turl":"","title":"t2","link":"http://example.com/include/json.php?action=getWxMiniProgram","url":"http://example.com/include/json.php?action=getWxMiniProgram","desc":"d2","mark":0,"advMarkState":1,"advMarkPostion":3,"markState":0},` +
		`{"src":"p3.jpg","turl":"p3.jpg","title":null,"link":null,"url":null,"desc":null,"mark":0,"advMarkState":1,"advMarkPostion":3,"markState":0}]}}`
	checkAdv(t, advServe(t, svc, "&id=3"), want)
	met(t, mock)
}

func TestAdvLinkRewrite(t *testing.T) {
	text := func(link string) string { return "text$$t$$c$$" + link + "$$12$$0" }
	cases := []struct {
		name, ua, link, want string
	}{
		{"App 小程序直播", appUA, "miniProgramLive_123", "http://example.com/include/json.php?action=getMiniProgramLive&id=123"},
		{"App 打开小程序", appUA, "wxMiniprogram://x", "http://example.com/include/json.php?action=openWxMiniProgram&param=wxMiniprogram://x"},
		{"非小程序 openxcx_", desktopUA, "openxcx_a", "http://example.com/include/json.php?action=getWxMiniProgram"},
		{"微信小程序内不改写 openxcx_", devtoolUA, "openxcx_a", "openxcx_a"},
		{"桌面端 miniProgramLive_ 不改写", desktopUA, "miniProgramLive_1", "miniProgramLive_1"},
		{"App 补域名", appUA, "/a/b", "http://example.com/a/b"},
		{"桌面端不补域名", desktopUA, "/a/b", "/a/b"},
		{"App 空链接", appUA, "", ""},
	}
	for _, c := range cases {
		svc, mock := newAdvMock(t)
		expectAdv(mock, 1, "1", "x", "0", "0", text(c.link), "1")
		got := advServe(t, svc, "&id=1", withUA(c.ua))
		want := `"link":"` + c.want + `"`
		if !strings.Contains(got, want) {
			t.Errorf("%s: %s 不含 %s", c.name, got, want)
		}
		met(t, mock)
	}
}

func TestAdvIOSFullScreen(t *testing.T) {
	body := "100$$0$$p.jpg##t##https://a.test/x##d##0||p.jpg##t##https://a.test/x?y=1##d##0"
	svc, mock := newAdvMock(t)
	expectAdv(mock, 3, "2", "招聘求职", "0", "0", body, "1")
	got := advServe(t, svc, "&id=3", withUA(iosUA))
	for _, w := range []string{`"link":"https://a.test/x?appFullScreen"`, `"link":"https://a.test/x?y=1&appFullScreen"`} {
		if !strings.Contains(got, w) {
			t.Errorf("缺少 %s: %s", w, got)
		}
	}
	// 标题不含「招聘求职」不追加。
	svc, mock = newAdvMock(t)
	expectAdv(mock, 3, "2", "其他", "0", "0", body, "1")
	if strings.Contains(advServe(t, svc, "&id=3", withUA(iosUA)), "appFullScreen") {
		t.Error("非招聘求职不应追加")
	}
}

// class 3/4/5/6 canary 无数据，body 用合成值（$$ / || / ## 分隔）。
func TestAdvClass3to6(t *testing.T) {
	cases := []struct{ class, body, want string }{
		{"3", "5$$960$$https://a.test$$big.jpg$$300$$small.jpg$$60$$1",
			`{"state":100,"info":{"id":9,"class":3,"advTitle":"T","time":5,"width":960,"link":"https://a.test","large":"big.jpg","largeHeight":300,"small":"small.jpg","smallHeight":60,"mark":1}}`},
		{"4", "1000$$100$$300$$80$$l.jpg##https://l.test##左##1$$r.jpg##https://r.test##右##0",
			`{"state":100,"info":{"id":9,"class":4,"advTitle":"T","width":1000,"adwidth":100,"adheight":300,"topheight":80,"left":{"src":"l.jpg","link":"https://l.test","title":"左","mark":1},"right":{"src":"r.jpg","link":"https://r.test","title":"右","mark":0}}}`},
		{"5", "a$$b$$c", `{"state":100,"info":{"id":9,"class":5,"advTitle":"T","body":["a","b","c"]}}`},
		{"6", `<img src="/include/attachment.php?f=1">$$https://p.test`,
			`{"state":100,"info":{"id":9,"class":6,"advTitle":"T","body":"<img src=\"http://example.com/include/attachment.php?f=1\">","link":"https://p.test"}}`},
		{"6", "x", `{"state":100,"info":{"id":9,"class":6,"advTitle":"T","body":"x","link":null}}`},
		{"4", "1", `{"state":100,"info":{"id":9,"class":4,"advTitle":"T","width":1,"adwidth":0,"adheight":0,"topheight":0,"left":{"src":"","link":null,"title":null,"mark":0},"right":{"src":"","link":null,"title":null,"mark":0}}}`},
	}
	for _, c := range cases {
		svc, mock := newAdvMock(t)
		expectAdv(mock, 9, c.class, "T", "0", "0", c.body, "1")
		checkAdv(t, advServe(t, svc, "&id=9"), c.want)
		met(t, mock)
	}
}

func TestAdvTitleLookup(t *testing.T) {
	svc, mock := newAdvMock(t)
	mock.ExpectQuery(advTitleSQL).WithArgs("电脑端登录").WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
	expectAdv(mock, 1, "1", "电脑端登录", "0", "0", "code$$x$$0", "1")
	checkAdv(t, advServe(t, svc, "&model=pic&title=电脑端登录"),
		`{"state":100,"info":{"id":1,"class":1,"advTitle":"电脑端登录","type":"code","body":"x","mark":0}}`)
	met(t, mock)

	// & 经 htmlspecialchars 变成 &amp; 后再查，查不到 → 101。
	svc, mock = newAdvMock(t)
	mock.ExpectQuery(advTitleSQL).WithArgs("a&amp;b").WillReturnRows(sqlmock.NewRows([]string{"id"}))
	checkAdv(t, advServe(t, svc, "&model=pic&title=a%26b"), `{"state":101,"info":"广告不存在！"}`)
	met(t, mock)

	// model/title 都非空时忽略 id。
	svc, mock = newAdvMock(t)
	mock.ExpectQuery(advTitleSQL).WithArgs("x").WillReturnRows(sqlmock.NewRows([]string{"id"}))
	checkAdv(t, advServe(t, svc, "&id=1&model=pic&title=x"), `{"state":101,"info":"广告不存在！"}`)
	met(t, mock)

	// tuan_：无 tuan_city cookie → 城市不存在，不查库。
	svc, mock = newAdvMock(t)
	checkAdv(t, advServe(t, svc, "&model=tuan_&title=abc"), `{"state":101,"info":"城市不存在！"}`)
	met(t, mock)
}

func TestAdvCityOverride(t *testing.T) {
	// pic：分站版没有 link 键。
	svc, mock := newAdvMock(t)
	expectAdv(mock, 1, "1", "T", "0", "0", "pic$$a.jpg$$https://a.test$$t$$1$$2$$0", "1")
	mock.ExpectQuery(advCitySQL).WithArgs(int64(1), int64(5)).WillReturnRows(sqlmock.NewRows([]string{"body"}).AddRow("pic$$c.jpg$$https://c.test$$ct$$3$$4$$1"))
	checkAdv(t, advServe(t, svc, "&id=1&cityid=5"),
		`{"state":100,"info":{"id":1,"class":1,"advTitle":"T","type":"pic","src":"c.jpg","turl":"c.jpg","href":"https://c.test","title":"ct","width":3,"height":4,"mark":1,"advMarkState":1,"advMarkPostion":3,"markState":1}}`)
	met(t, mock)

	// class 2：分站版不追加 appFullScreen。
	svc, mock = newAdvMock(t)
	expectAdv(mock, 3, "2", "招聘求职", "0", "0", "1$$1$$a.jpg##t##https://a.test##d##0", "1")
	mock.ExpectQuery(advCitySQL).WithArgs(int64(3), int64(5)).WillReturnRows(sqlmock.NewRows([]string{"body"}).AddRow("2$$3$$c.jpg##ct##https://c.test##cd##1"))
	got := advServe(t, svc, "&id=3&cityid=5", withUA(iosUA))
	if !strings.Contains(got, `"width":2,"height":3`) || strings.Contains(got, "appFullScreen") {
		t.Errorf("分站 class 2: %s", got)
	}
	met(t, mock)

	// 分站无数据 → 保留默认。
	svc, mock = newAdvMock(t)
	expectAdv(mock, 1, "1", "T", "0", "0", "code$$x$$0", "1")
	mock.ExpectQuery(advCitySQL).WithArgs(int64(1), int64(5)).WillReturnRows(sqlmock.NewRows([]string{"body"}))
	checkAdv(t, advServe(t, svc, "&id=1&cityid=5"), `{"state":100,"info":{"id":1,"class":1,"advTitle":"T","type":"code","body":"x","mark":0}}`)
	met(t, mock)

	// cityid=abc → 0，不查分站表。
	svc, mock = newAdvMock(t)
	expectAdv(mock, 1, "1", "T", "0", "0", "code$$x$$0", "1")
	advServe(t, svc, "&id=1&cityid=abc")
	met(t, mock)
}

func TestAdvJSONP(t *testing.T) {
	svc, mock := newAdvMock(t)
	checkAdv(t, advServe(t, svc, "&callback=cb"), `cb({"state":101,"info":"广告ID不得为空！"})`)
	met(t, mock)
}

func TestAdvNilDB(t *testing.T) {
	svc, err := New(Dep{TablePrefix: "huoniao_"})
	if err != nil {
		t.Fatal(err)
	}
	checkAdv(t, advServe(t, svc, "&id=1"), `{"state":102,"info":"No data!"}`)
}
