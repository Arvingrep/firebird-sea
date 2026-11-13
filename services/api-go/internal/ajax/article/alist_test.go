package article

import (
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"testing"

	sqlmock "github.com/DATA-DOG/go-sqlmock"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// 主查询的公共片段（article.class.php:667 / 761-774 原样拼接）。
const (
	alAnonWhere = " AND lt.`arcrank` = 1 AND lt.`waitpay` = 0 AND lt.`del` = 0 AND lt.`media_state` = 1"
	alCount     = "SELECT COUNT(*) total FROM `huoniao_articlelist_all` lt WHERE `del` = 0"
	alSub       = "SELECT lt.`id` FROM `huoniao_articlelist_all` lt  WHERE lt.`del` = 0"
	alOrder     = " ORDER BY lt.`weight` DESC, lt.`pubdate` DESC, lt.`id` DESC"
	alFields    = "SELECT l.`id`, l.`title`, l.`admin`, l.`media`, l.`subtitle`, l.`typeid`, l.`flag`, l.`weight`, " +
		"l.`keywords`, l.`description`, l.`source`, l.`redirecturl`, l.`litpic`, l.`color`, l.`click`, l.`arcrank`, " +
		"l.`pubdate`, l.`typeset`, l.`videotype`, l.`videourl`, l.`prop`, (SELECT COUNT(`id`)  FROM `huoniao_public_comment_all` " +
		"WHERE `aid` = l.`id` AND `ischeck` = 1 AND `type` = 'article-detail') AS total, l.`waitpay`, l.`admin`, " +
		"l.`mold`, l.`zan`, l.`writer`, l.`videotime`, l.`videotype`, l.`videourl`, l.`zhuanti`"
	alCommentFields = "SELECT l.`id`, l.`title`, l.`admin`, l.`media`, l.`subtitle`, l.`flag`, l.`weight`, l.`keywords`, " +
		"l.`description`, l.`redirecturl`, l.`litpic`, l.`color`, l.`click`, l.`arcrank`, l.`pubdate`, l.`prop`, " +
		"(SELECT COUNT(`id`)  FROM `huoniao_public_comment_all` WHERE `aid` = l.`id` AND `ischeck` = 1 AND `type` = 'article-detail') AS total, " +
		"l.`waitpay`, l.`admin`, l.`mold`, l.`zan`, l.`writer`, l.`videotime`, l.`videotype`, l.`videourl`, l.`zhuanti`"
	alTypeChain = "SELECT `id`, `parentid`, `typename`, `weight` FROM `huoniao_articletype` WHERE `id` = ?"
	alRewardCnt = "SELECT COUNT(`id`) total FROM `huoniao_member_reward` WHERE `aid` = ? AND `module` = 'article' AND `state` = 1"
)

// alListSQL 拼出列表查询（外层字段 + INNER JOIN 子查询）。
func alListSQL(fields, where, extra, limit string) string {
	return fields + " FROM `huoniao_articlelist_all` l INNER JOIN (" + alSub + where + extra + limit +
		") AS tmp ON tmp.`id` = l.`id`"
}

var alRowCols = []string{
	"id", "title", "admin", "media", "subtitle", "typeid", "flag", "weight", "keywords", "description",
	"source", "redirecturl", "litpic", "color", "click", "arcrank", "pubdate", "typeset", "videotype",
	"videourl", "prop", "total", "waitpay", "mold", "zan", "writer", "videotime", "zhuanti",
}

// alRow 返回一行默认值（mold=0、无媒体号/专题）；改几个字段即可复用。
func alRow() *sqlmock.Rows {
	return sqlmock.NewRows(alRowCols).AddRow(
		"9", "标题", "3", "0", "", "7", "H,B", "1", "a,b，c", "d",
		"新华社", "", "", "#f00", "12345", "1", "1700000000", "1", "0",
		"", "1", "2", "0", "0", "5", "", "0", "0",
	)
}

func alGet(t *testing.T, svc *Service, query string) string {
	t.Helper()
	router := ajax.NewRouter(func(string) {})
	Register(router, svc)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/include/ajax.php?service=article&action=alist"+query, nil))
	return rec.Body.String()
}

func TestAlistNormal(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(alCount + alAnonWhere).WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("12"))
	mock.ExpectQuery(alListSQL(alFields, alAnonWhere, alOrder, " LIMIT 0, 10")).WillReturnRows(alRow())
	mock.ExpectQuery(alTypeChain).WithArgs(7).
		WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow("7", "0", "新闻", "1"))
	mock.ExpectQuery(alRewardCnt).WithArgs(9).WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("0"))

	got := alGet(t, svc, "")
	want := `{"state":100,"info":{"pageInfo":{"page":1,"pageSize":10,"totalPage":2.0,"totalCount":"12"},"list":[` +
		`{"id":"9","title":"<font style=\"color:#f00\"><strong>标题</strong></font>",` +
		`"puretitle":"标题","subtitle":"","typeid":"7","admin":"3","typeName":["新闻"],"typeUrl":[""],` +
		`"flag":"h,b","keywords":"a b c","keywordsArr":["a","b","c"],"description":"d","writer":"",` +
		`"redirecturl":"","litpic":"","color":"#f00","click":"12345","click_":"1.2万","mold":"0","prop":1,` +
		`"pubdate":"1700000000","common":"2","url":"","videotime_":null,` +
		`"reward":{"count":"0","amount":0},"media":null,"source":"新华社","zannum":5,"typeset":1,"zhuanti":[]}]}}`
	if got != want {
		t.Fatalf("响应体 = %s\nwant     %s", got, want)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatal(err)
	}
}

// 翻页：GET 负数取默认、超限取 50000，POST 0 落默认。
func TestAlistPaging(t *testing.T) {
	t.Run("page=3&pageSize=20", func(t *testing.T) {
		svc, mock := newService(t)
		mock.ExpectQuery(alCount + alAnonWhere).WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("100"))
		mock.ExpectQuery(alListSQL(alFields, alAnonWhere, alOrder, " LIMIT 40, 20")).WillReturnRows(sqlmock.NewRows(alRowCols))
		got := alGet(t, svc, "&page=3&pageSize=20")
		want := `{"state":100,"info":{"pageInfo":{"page":3,"pageSize":20,"totalPage":5.0,"totalCount":"100"},"list":[]}}`
		if got != want {
			t.Fatalf("响应体 = %s\nwant     %s", got, want)
		}
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatal(err)
		}
	})
	t.Run("GET page=-3&pageSize=-1 取默认", func(t *testing.T) {
		svc, mock := newService(t)
		mock.ExpectQuery(alCount + alAnonWhere).WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("1"))
		mock.ExpectQuery(alListSQL(alFields, alAnonWhere, alOrder, " LIMIT 0, 10")).WillReturnRows(sqlmock.NewRows(alRowCols))
		alGet(t, svc, "&page=-3&pageSize=-1")
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatal(err)
		}
	})
}

func TestAlistEmpty(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(alCount + alAnonWhere).WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("0"))
	// totalCount==0 → state=200 "暂无数据！" → 外层改写成 101（不是 102）。
	if got, want := alGet(t, svc, ""), `{"state":101,"info":"暂无数据！"}`; got != want {
		t.Fatalf("响应体 = %s\nwant     %s", got, want)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatal(err)
	}
}

// isAjax 有值时不查 COUNT、pageInfo 输出空数组，totalCount=0 也不走 101。
func TestAlistIsAjax(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(alListSQL(alFields, alAnonWhere, alOrder, " LIMIT 0, 10")).WillReturnRows(alRow())
	mock.ExpectQuery(alTypeChain).WithArgs(7).
		WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow("7", "0", "新闻", "1"))
	mock.ExpectQuery(alRewardCnt).WithArgs(9).WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("0"))

	got := alGet(t, svc, "&isAjax=1")
	want := `{"state":100,"info":{"pageInfo":[],"list":[{"id":"9","title":"<font style=\"color:#f00\"><strong>标题</strong></font>",` +
		`"puretitle":"标题","subtitle":"","typeid":"7","admin":"3","typeName":["新闻"],"typeUrl":[""],` +
		`"flag":"h,b","keywords":"a b c","keywordsArr":["a","b","c"],"description":"d","writer":"",` +
		`"redirecturl":"","litpic":"","color":"#f00","click":"12345","click_":"1.2万","mold":"0","prop":1,` +
		`"pubdate":"1700000000","common":"2","url":"","videotime_":null,` +
		`"reward":{"count":"0","amount":0},"media":null,"source":"新华社","zannum":5,"typeset":1,"zhuanti":[]}]}}`
	if got != want {
		t.Fatalf("响应体 = %s\nwant     %s", got, want)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatal(err)
	}
}

// 非法 flag：$flag_where 是空串 → 拼出悬空 AND → COUNT 报错 → 0 → 101，且不查库。
func TestAlistBadFlag(t *testing.T) {
	svc, _ := newService(t)
	if got, want := alGet(t, svc, "&flag=zzz"), `{"state":101,"info":"暂无数据！"}`; got != want {
		t.Fatalf("响应体 = %s\nwant     %s", got, want)
	}
}

// orderby=2.1：时间条件只进子查询（$order），COUNT 仍是全量 → 口径分裂。
func TestAlistOrderbyTodaySplitCount(t *testing.T) {
	ts := alistNow()
	svc, mock := newService(t)
	mock.ExpectQuery(alCount + alAnonWhere).WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("50"))
	timeCond := " AND `pubdate` > " + strconv.FormatInt(ts.todayk, 10) + " AND `pubdate` < " + strconv.FormatInt(ts.todaye, 10) +
		" ORDER BY lt.`click` DESC, lt.`weight` DESC, lt.`id` DESC"
	mock.ExpectQuery(alListSQL(alFields, alAnonWhere, timeCond, " LIMIT 0, 10")).WillReturnRows(sqlmock.NewRows(alRowCols))
	got := alGet(t, svc, "&orderby=2.1")
	if want := `{"state":100,"info":{"pageInfo":{"page":1,"pageSize":10,"totalPage":5.0,"totalCount":"50"},"list":[]}}`; got != want {
		t.Fatalf("响应体 = %s\nwant     %s", got, want)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatal(err)
	}
}

// orderby=4.1：评论排行分支的时间条件进 $where → COUNT 也带；字段列表不含 typeid/source/typeset。
func TestAlistOrderbyCommentRank(t *testing.T) {
	ts := alistNow()
	where := alAnonWhere + " AND lt.`pubdate` > " + strconv.FormatInt(ts.todayk, 10) +
		" AND lt.`pubdate` < " + strconv.FormatInt(ts.todaye, 10)
	cols := []string{"id", "title", "admin", "media", "subtitle", "flag", "weight", "keywords", "description",
		"redirecturl", "litpic", "color", "click", "arcrank", "pubdate", "prop", "total", "waitpay",
		"mold", "zan", "writer", "videotime", "videotype", "videourl", "zhuanti"}
	svc, mock := newService(t)
	mock.ExpectQuery(alCount + where).WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("3"))
	mock.ExpectQuery(alListSQL(alCommentFields, where, alOrder, " LIMIT 0, 10")).WillReturnRows(
		sqlmock.NewRows(cols).AddRow("9", "标题", "3", "0", "", "H,B", "1", "a", "d", "", "", "", "1", "1",
			"1700000000", "0", "4", "0", "0", "5", "", "0", "0", "", "0"))
	mock.ExpectQuery(alRewardCnt).WithArgs(9).WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("0"))
	got := alGet(t, svc, "&orderby=4.1")
	want := `{"state":100,"info":{"pageInfo":{"page":1,"pageSize":10,"totalPage":1.0,"totalCount":"3"},"list":[` +
		`{"id":"9","title":"<strong>标题</strong>","puretitle":"标题","subtitle":"","typeid":null,` +
		`"admin":"3","typeName":[],"typeUrl":[""],"flag":"h,b","keywords":"a","keywordsArr":["a"],"description":"d",` +
		`"writer":"","redirecturl":"","litpic":"","color":"","click":"1","click_":"1","mold":"0","prop":0,` +
		`"pubdate":"1700000000","common":"4","url":"","videotime_":null,"reward":{"count":"0","amount":0},` +
		`"media":null,"source":null,"zannum":5,"typeset":0,"zhuanti":[]}]}}`
	if got != want {
		t.Fatalf("响应体 = %s\nwant     %s", got, want)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatal(err)
	}
}

// u=1 且已登录：只看本人（admin=登录 uid、cityid != 0），列表项带 arcrank/waitpay，
// pageInfo 追加 gray/audit/refuse；state 只进子查询。
func TestAlistAdminBranch(t *testing.T) {
	where := " AND lt.`admin` = ? AND lt.`cityid` != 0"
	svc, mock := newService(t)
	svc.members = sdFakeMember(4)
	mock.ExpectQuery(alCount + where).WithArgs(int64(4)).WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("2"))
	for _, cond := range []string{" AND lt.`arcrank` = 0", " AND lt.`arcrank` = 1", " AND lt.`arcrank` = 2"} {
		mock.ExpectQuery(alCount + where + cond).WithArgs(int64(4)).WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("1"))
	}
	mock.ExpectQuery(alListSQL(alFields, where, alOrder, " LIMIT 0, 10")).WithArgs(int64(4)).WillReturnRows(alRow())
	mock.ExpectQuery(alTypeChain).WithArgs(7).
		WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow("7", "0", "新闻", "1"))
	mock.ExpectQuery(alRewardCnt).WithArgs(9).WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("0"))

	got := alGet(t, svc, "&u=1")
	want := `{"state":100,"info":{"pageInfo":{"page":1,"pageSize":10,"totalPage":1.0,"totalCount":"2",` +
		`"gray":"1","audit":"1","refuse":"1"},"list":[` +
		`{"id":"9","title":"<font style=\"color:#f00\"><strong>标题</strong></font>",` +
		`"puretitle":"标题","subtitle":"","typeid":"7","admin":"3","typeName":["新闻"],"typeUrl":[""],` +
		`"flag":"h,b","keywords":"a b c","keywordsArr":["a","b","c"],"description":"d","writer":"",` +
		`"redirecturl":"","litpic":"","color":"#f00","click":"12345","click_":"1.2万","mold":"0","prop":1,` +
		`"arcrank":"1","waitpay":"0","pubdate":"1700000000","common":"2","url":"","videotime_":null,` +
		`"reward":{"count":"0","amount":0},"media":null,"source":"新华社","zannum":5,"typeset":1,"zhuanti":[]}]}}`
	if got != want {
		t.Fatalf("响应体 = %s\nwant     %s", got, want)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatal(err)
	}
}

// 未登录（匿名 ruid=-1）也要能正常出列表。
func TestAlistAnonymousHasNoArcrankField(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery(alCount + alAnonWhere).WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("1"))
	mock.ExpectQuery(alListSQL(alFields, alAnonWhere, alOrder, " LIMIT 0, 10")).WillReturnRows(alRow())
	mock.ExpectQuery(alTypeChain).WithArgs(7).
		WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow("7", "0", "新闻", "1"))
	mock.ExpectQuery(alRewardCnt).WithArgs(9).WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("0"))
	got := alGet(t, svc, "")
	if strings.Contains(got, `"arcrank"`) {
		t.Fatalf("未登录不应输出 arcrank：%s", got)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatal(err)
	}
}

// dynamicid>0 且 article.detail 未迁移（Dep.Detail 为 nil）→ 102。
func TestAlistDynamicIDWithoutDetail(t *testing.T) {
	svc, mock := newService(t)
	where := alAnonWhere + " AND lt.`id` < 100"
	mock.ExpectQuery(alCount + where).WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("1"))
	mock.ExpectQuery(alListSQL(alFields, where, alOrder, " LIMIT 0, 10")).WillReturnRows(alRow())
	if got, want := alGet(t, svc, "&dynamicid=100"), `{"state":102,"info":"No data!"}`; got != want {
		t.Fatalf("响应体 = %s\nwant     %s", got, want)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatal(err)
	}
}

// media=is → `media <> 0`；media=abc → 原样插值报错 → 101。
func TestAlistMediaFilter(t *testing.T) {
	t.Run("media=is", func(t *testing.T) {
		svc, mock := newService(t)
		where := alAnonWhere + " AND lt.`media` <> 0"
		mock.ExpectQuery(alCount + where).WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("1"))
		mock.ExpectQuery(alListSQL(alFields, where, alOrder, " LIMIT 0, 10")).WillReturnRows(alRow())
		mock.ExpectQuery(alTypeChain).WithArgs(7).
			WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow("7", "0", "新闻", "1"))
		mock.ExpectQuery(alRewardCnt).WithArgs(9).WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("0"))
		alGet(t, svc, "&media=is")
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatal(err)
		}
	})
	t.Run("media=abc → 101", func(t *testing.T) {
		svc, _ := newService(t)
		if got, want := alGet(t, svc, "&media=abc"), `{"state":101,"info":"暂无数据！"}`; got != want {
			t.Fatalf("响应体 = %s\nwant     %s", got, want)
		}
	})
}

// group_img + mold=2：图集、附件宽高、时长、播放地址都按 PHP 口径输出。
func TestAlistGroupImgAndVideo(t *testing.T) {
	cols := append([]string{}, alRowCols...)
	svc, mock := newService(t)
	mock.ExpectQuery(alCount + alAnonWhere).WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("1"))
	mock.ExpectQuery(alListSQL(alFields, alAnonWhere, alOrder, " LIMIT 0, 10")).WillReturnRows(
		sqlmock.NewRows(cols).AddRow(
			"9", "视频", "3", "0", "", "7", "", "1", "", "d",
			"新华社", "", "123", "#f00", "1", "1", "1700000000", "1", "0",
			"/v.mp4", "1", "0", "0", "2", "5", "", "125", "0"))
	mock.ExpectQuery(alTypeChain).WithArgs(7).
		WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow("7", "0", "新闻", "1"))
	mock.ExpectQuery("SELECT `picPath`, `picInfo` FROM `huoniao_articlepic` WHERE `aid` = ? ORDER BY `id` ASC LIMIT 0, 6").
		WithArgs(9).WillReturnRows(sqlmock.NewRows([]string{"picPath", "picInfo"}).AddRow("p1.jpg", "说明"))
	mock.ExpectQuery("SELECT COUNT(`id`) total FROM `huoniao_articlepic` WHERE `aid` = ?").
		WithArgs(9).WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("3"))
	// litpic="123" 解密后不是数字 → 走 path 分支。
	mock.ExpectQuery("SELECT `width`, `height` FROM `huoniao_attachment` WHERE `path` = ?").
		WithArgs("123").WillReturnRows(sqlmock.NewRows([]string{"width", "height"}).AddRow("640", "480"))
	mock.ExpectQuery(alRewardCnt).WithArgs(9).WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("0"))

	got := alGet(t, svc, "&group_img=1")
	for _, want := range []string{
		`"group_img":[{"path":"p1.jpg","info":"说明"}],"group_imgnum":3`,
		`"picwidth":640,"picheight":480,"videotime":125,"videourl":"/v.mp4","videotype":0,"videotime_":"2:5"`,
	} {
		if !strings.Contains(got, want) {
			t.Fatalf("响应体 = %s\n缺少     %s", got, want)
		}
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatal(err)
	}
}
