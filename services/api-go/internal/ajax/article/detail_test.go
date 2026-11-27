package article

import (
	"database/sql/driver"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	sqlmock "github.com/DATA-DOG/go-sqlmock"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// —— detail 用到的 SQL 片段（与 detail.go 里拼出来的完全一致）——

const (
	dtMainAnon = "SELECT a.*, m.`nickname` FROM `huoniao_articlelist_all` a LEFT JOIN `huoniao_member` m ON m.`id` = a.`admin` " +
		"WHERE a.`id` = 9 AND `arcrank` = 1 AND `del` = 0 AND `waitpay` = 0 AND `media_state` = 1 ORDER BY a.`id` DESC"
	dtMainMine = "SELECT a.*, m.`nickname` FROM `huoniao_articlelist_all` a LEFT JOIN `huoniao_member` m ON m.`id` = a.`admin` " +
		"WHERE a.`id` = 9 AND (`arcrank` = 1 AND `del` = 0 AND `waitpay` = 0 OR `admin` = 2) AND `media_state` = 1 " +
		"ORDER BY a.`id` DESC"
	dtTypeChain = "SELECT `id`, `parentid`, `typename`, `weight` FROM `huoniao_articletype` WHERE `id` = ?"
	dtBody      = "SELECT `body` FROM `huoniao_article` WHERE `aid` = 9 ORDER BY `id` DESC"
	dtPics      = "SELECT * FROM `huoniao_articlepic` WHERE `aid` = 9 ORDER BY `id` ASC"
	dtCommon    = "SELECT COUNT(*) FROM `huoniao_public_comment_all` WHERE `ischeck` = 1 AND `type` = 'article-detail' AND `aid` = ?"
	dtReward    = "SELECT COUNT(*) FROM `huoniao_member_reward` WHERE `module` = 'article' AND `aid` = ? AND `state` = 1"
	dtSubList   = "SELECT `table_name`, `begin_id` FROM `huoniao_site_sub_tablelist` WHERE `service` = 'articlelist' ORDER BY `id` DESC"
	dtClickArt  = "UPDATE `huoniao_articlelist` SET `click` = `click` + 1 WHERE `id` = ?"
	dtClickSd   = "UPDATE `huoniao_article_selfmedia` SET `click` = `click` + 1 WHERE `userid` = ?"
	dtHistoryQ  = "SELECT `id` FROM `huoniao_article_historyclick` WHERE `uid` = ? AND `fuid` = ? AND `aid` = ? AND `module2` = 'detail'"
	dtHistoryI  = "INSERT INTO `huoniao_article_historyclick` (`uid`, `fuid`, `aid`, `module`, `module2`, `date`) VALUES (?, ?, ?, 'article', 'detail', ?)"
	dtArctypeQ  = "SELECT `typename` FROM `huoniao_article_selfmedia_arctype` WHERE `id` = ?"
	dtZhuantiQ  = "SELECT zt.`id`, zt.`typename` FROM `huoniao_article_zhuanti` z LEFT JOIN `huoniao_article_zhuanti` zt ON zt.`id` = z.`parentid` WHERE z.`id` = ?"
	dtSharePic  = "https://storage.googleapis.com/fbird-sea-uploads/siteConfig/logo/fbird_logo.png"
	dtMediaQ    = "SELECT `id`, `state` FROM `huoniao_article_selfmedia` WHERE `userid` = ?"
	dtMediaMgrQ = "SELECT s.`id` FROM `huoniao_article_selfmedia_manager` m LEFT JOIN `huoniao_article_selfmedia` s ON s.`id` = m.`aid` WHERE m.`userid` = ?"
)

var dtRowCols = []string{
	"id", "title", "cityid", "subtitle", "flag", "redirecturl", "litpic", "source", "sourceurl", "writer",
	"typeid", "admin", "nickname", "prop", "mold", "keywords", "description", "notpost", "click", "color",
	"arcrank", "pubdate", "reward_switch", "mbody", "videourl", "videotype", "videotime", "zan", "typeset",
	"media_arctype", "zhuanti",
}

// dtRow 返回一行默认值：mold=0、无作者、无图集/视频/专题。
func dtRow() *sqlmock.Rows {
	return sqlmock.NewRows(dtRowCols).AddRow(
		"9", "标题", "0", "", "", "", "", "", "", "",
		"7", "0", nil, "0", "0", "", "", "0", "5", "",
		"1", "1700000000", "0", "", "", "0", "0", "0", "1",
		"0", "0",
	)
}

// dtRowMod 复制默认行并改写部分列。
func dtRowMod(mod func(vals []driver.Value)) *sqlmock.Rows {
	vals := []driver.Value{
		"9", "标题", "0", "", "", "", "", "", "", "",
		"7", "0", nil, "0", "0", "", "", "0", "5", "",
		"1", "1700000000", "0", "", "", "0", "0", "0", "1",
		"0", "0",
	}
	mod(vals)
	return sqlmock.NewRows(dtRowCols).AddRow(vals...)
}

// dtSvc 构造一个带 sqlmock 的 service；可选注入会员识别器。
func dtSvc(t *testing.T, login int64) (*Service, sqlmock.Sqlmock) {
	t.Helper()
	db, mock, err := sqlmock.New(sqlmock.QueryMatcherOption(sqlmock.QueryMatcherEqual))
	if err != nil {
		t.Fatalf("sqlmock: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })
	dep := Dep{DB: db, TablePrefix: "huoniao_"}
	if login != 0 {
		dep.Members = fakeMembers{uid: login}
	}
	svc, err := New(dep)
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	return svc, mock
}

func dtGet(t *testing.T, svc *Service, query string) (string, map[string]any) {
	t.Helper()
	router := ajax.NewRouter(func(string) {})
	Register(router, svc)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/include/ajax.php?service=article&action=detail"+query, nil))
	body := rec.Body.String()
	var decoded map[string]any
	if err := json.Unmarshal([]byte(body), &decoded); err != nil {
		t.Fatalf("响应不是 JSON: %v (%s)", err, body)
	}
	return body, decoded
}

// expectWrites 补上阅读计数与自媒体计数两条 UPDATE（detail 每次命中都会写）。
func expectWrites(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(dtSubList).WillReturnRows(sqlmock.NewRows([]string{"table_name", "begin_id"}))
	mock.ExpectExec(dtClickArt).WithArgs("9").WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(dtClickSd).WithArgs("0").WillReturnResult(sqlmock.NewResult(0, 1))
}

func TestDetailNormalMold0(t *testing.T) {
	svc, mock := dtSvc(t, 0)
	mock.ExpectQuery(dtMainAnon).WillReturnRows(dtRowMod(func(v []driver.Value) {
		v[1] = "标题 & <b>x</b>"
		v[3] = "副标题"
		v[15] = "a,b"
		v[16] = "<p>简介</p>\n第二行"
	}))
	mock.ExpectQuery(dtTypeChain).WithArgs(7).
		WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow("7", "0", "新闻", "1"))
	mock.ExpectQuery(dtBody).WillReturnRows(sqlmock.NewRows([]string{"body"}).AddRow("第一行\n第二行"))
	mock.ExpectQuery(dtCommon).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("2"))
	mock.ExpectQuery(dtReward).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	expectWrites(mock)

	got, decoded := dtGet(t, svc, "&id=9")
	want := `{"state":100,"info":{` +
		`"id":"9","title":"标题 & <b>x</b>","cityid":"0","subtitle":"副标题","flag":"","redirecturl":"",` +
		`"litpic":"` + dtSharePic + `","litpicSource":"","source":"","sourceurl":"","writer":"","typeid":"7",` +
		`"admin":"0","prop":0,"article_prop":1,"admin_nickname":null,"url":"","mold":"0","typeName":"新闻",` +
		`"keywords":"a b","keywordsList":["a","b"],"description":"简介第二行","notpost":"0","click":5,` +
		`"color":"","arcrank":"1","pubdate":"1700000000","reward_switch":0,` +
		`"body":"第一行<br />\n第二行","mbody":"第一行<br />\n第二行",` +
		`"common":2,"rewardcount":0,"member":[],"media":null,"isfollow":0,"collect":0,"zan":0,"zannum":"0",` +
		`"typeset":"1","media_arctype":"0","media_arctypeName":"","zhuanti":[]}}`
	if got != want {
		t.Fatalf("响应不一致\n got: %s\nwant: %s", got, want)
	}
	if decoded["state"].(float64) != 100 {
		t.Fatalf("state 应为 100: %v", decoded["state"])
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("SQL 期望未满足: %v", err)
	}
}

func TestDetailKeywordEmptyListHasOneEmptyString(t *testing.T) {
	svc, mock := dtSvc(t, 0)
	mock.ExpectQuery(dtMainAnon).WillReturnRows(dtRow())
	mock.ExpectQuery(dtTypeChain).WithArgs(7).
		WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow("7", "0", "新闻", "1"))
	mock.ExpectQuery(dtBody).WillReturnRows(sqlmock.NewRows([]string{"body"}).AddRow("body"))
	mock.ExpectQuery(dtCommon).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	mock.ExpectQuery(dtReward).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	expectWrites(mock)

	_, decoded := dtGet(t, svc, "&id=9")
	info := decoded["info"].(map[string]any)
	list, ok := info["keywordsList"].([]any)
	if !ok || len(list) != 1 || list[0] != "" {
		t.Fatalf(`keywords 为空时 keywordsList 必须是 [""]（PHP explode(" ", "")）: %v`, info["keywordsList"])
	}
	if info["isfollow"].(float64) != 0 {
		t.Fatalf("isfollow 恒 0（PHP 死代码照搬）: %v", info["isfollow"])
	}
}

func TestDetailMold1Images(t *testing.T) {
	svc, mock := dtSvc(t, 0)
	mock.ExpectQuery(dtMainAnon).WillReturnRows(dtRowMod(func(v []driver.Value) { v[14] = "1" }))
	mock.ExpectQuery(dtTypeChain).WithArgs(7).
		WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow("7", "0", "新闻", "1"))
	mock.ExpectQuery(dtBody).WillReturnRows(sqlmock.NewRows([]string{"body"}).AddRow("正文"))
	mock.ExpectQuery(dtPics).WillReturnRows(sqlmock.NewRows([]string{"picPath", "picInfo"}).
		AddRow("/uploads/1.jpg", "图一").AddRow("/uploads/2.jpg", ""))
	mock.ExpectQuery(dtCommon).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	mock.ExpectQuery(dtReward).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	expectWrites(mock)

	_, decoded := dtGet(t, svc, "&id=9")
	imglist := decoded["info"].(map[string]any)["imglist"].([]any)
	if len(imglist) != 2 {
		t.Fatalf("imglist 应有 2 项: %v", imglist)
	}
	first := imglist[0].(map[string]any)
	if first["pathSource"] != "/uploads/1.jpg" || first["path"] != "/uploads/1.jpg" || first["info"] != "图一" {
		t.Fatalf("imglist 首项不对: %v", first)
	}
}

func TestDetailMold1EmptyImages(t *testing.T) {
	svc, mock := dtSvc(t, 0)
	mock.ExpectQuery(dtMainAnon).WillReturnRows(dtRowMod(func(v []driver.Value) { v[14] = "1" }))
	mock.ExpectQuery(dtTypeChain).WithArgs(7).
		WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow("7", "0", "新闻", "1"))
	mock.ExpectQuery(dtBody).WillReturnRows(sqlmock.NewRows([]string{"body"}).AddRow(""))
	mock.ExpectQuery(dtPics).WillReturnRows(sqlmock.NewRows([]string{"picPath", "picInfo"}))
	mock.ExpectQuery(dtCommon).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	mock.ExpectQuery(dtReward).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	expectWrites(mock)

	body, _ := dtGet(t, svc, "&id=9")
	if !containsJSON(body, `"imglist":[]`) {
		t.Fatalf("无图集时 imglist 应为 []: %s", body)
	}
	// mbody 为空 → 回退 body，两者都是 "" 的 nl2br。
	if !containsJSON(body, `"body":"","mbody":""`) {
		t.Fatalf("body/mbody 都应为空串: %s", body)
	}
}

func TestDetailMold2VideoRealURL(t *testing.T) {
	svc, mock := dtSvc(t, 0)
	mock.ExpectQuery(dtMainAnon).WillReturnRows(dtRowMod(func(v []driver.Value) {
		v[14] = "2"
		v[24] = "http://v.qq.com/x/page/abc.html"
		v[25] = "1"
		v[26] = "3725"
	}))
	mock.ExpectQuery(dtTypeChain).WithArgs(7).
		WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow("7", "0", "新闻", "1"))
	mock.ExpectQuery(dtCommon).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	mock.ExpectQuery(dtReward).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	expectWrites(mock)

	_, decoded := dtGet(t, svc, "&id=9")
	info := decoded["info"].(map[string]any)
	if _, has := info["realVideoUrl"]; !has {
		t.Fatalf("videotype=1 时必须有 realVideoUrl: %v", info)
	}
	if info["realVideoUrl"] != "http://v.qq.com/x/page/abc.html" {
		t.Fatalf("getRealVideoUrl 未解析时原样返回: %v", info["realVideoUrl"])
	}
	if info["video_hour"].(float64) != 1 || info["video_minute"].(float64) != 2 || info["video_second"].(float64) != 5 {
		t.Fatalf("时长拆分不对: %v/%v/%v", info["video_hour"], info["video_minute"], info["video_second"])
	}
	if info["videotime"] != "3725" {
		t.Fatalf("videotime 是库里原值（字符串）: %v", info["videotime"])
	}
}

func TestDetailMold2VideoNoRealURLKey(t *testing.T) {
	svc, mock := dtSvc(t, 0)
	mock.ExpectQuery(dtMainAnon).WillReturnRows(dtRowMod(func(v []driver.Value) {
		v[14] = "2"
		v[24] = "/uploads/a.mp4"
		v[25] = "0"
		v[26] = "0"
	}))
	mock.ExpectQuery(dtTypeChain).WithArgs(7).
		WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow("7", "0", "新闻", "1"))
	mock.ExpectQuery(dtCommon).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	mock.ExpectQuery(dtReward).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	expectWrites(mock)

	body, decoded := dtGet(t, svc, "&id=9")
	info := decoded["info"].(map[string]any)
	if _, has := info["realVideoUrl"]; has {
		t.Fatalf("videotype=0 时 PHP 从未赋值，不能出现 realVideoUrl 键: %s", body)
	}
	if info["video"] != "/uploads/a.mp4" {
		t.Fatalf("videotype=0 时 video 是 getFilePath 结果: %v", info["video"])
	}
	if info["video_hour"].(float64) != 0 || info["videotime"] != "0" {
		t.Fatalf("videotime=0 时三个时长字段都是 0: %v", info)
	}
}

func TestDetailMold3Video(t *testing.T) {
	svc, mock := dtSvc(t, 0)
	mock.ExpectQuery(dtMainAnon).WillReturnRows(dtRowMod(func(v []driver.Value) {
		v[14] = "3"
		v[24] = "/uploads/b.mp4"
	}))
	mock.ExpectQuery(dtTypeChain).WithArgs(7).
		WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow("7", "0", "新闻", "1"))
	mock.ExpectQuery(dtCommon).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	mock.ExpectQuery(dtReward).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	expectWrites(mock)

	_, decoded := dtGet(t, svc, "&id=9")
	info := decoded["info"].(map[string]any)
	if info["videoSource"] != "/uploads/b.mp4" || info["video"] != "/uploads/b.mp4" {
		t.Fatalf("mold=3 只输出 videoSource/video: %v", info)
	}
	for _, k := range []string{"body", "imglist", "videotype", "realVideoUrl"} {
		if _, has := info[k]; has {
			t.Fatalf("mold=3 不应输出 %s: %v", k, info)
		}
	}
}

func TestDetailEmptyResult(t *testing.T) {
	svc, mock := dtSvc(t, 0)
	mock.ExpectQuery(dtMainAnon).WillReturnRows(sqlmock.NewRows(dtRowCols))

	body, decoded := dtGet(t, svc, "&id=9")
	if decoded["state"].(float64) != 102 || decoded["info"] != "No data!" {
		t.Fatalf("空结果应为 102 No data!: %s", body)
	}
}

func TestDetailParamError(t *testing.T) {
	svc, _ := dtSvc(t, 0)
	for _, q := range []string{"", "&id=abc", "&id=0", "&id=1,2"} {
		body, decoded := dtGet(t, svc, q)
		if decoded["state"].(float64) != 101 || decoded["info"] != "格式错误！" {
			t.Fatalf("%q 应为 101 格式错误！: %s", q, body)
		}
	}
}

func TestDetailMediaStateFiltered(t *testing.T) {
	// media_state=0 由 SQL 过滤：查询本身带条件，这里验证条件串在（空结果即 102）。
	svc, mock := dtSvc(t, 0)
	mock.ExpectQuery(dtMainAnon).WillReturnRows(sqlmock.NewRows(dtRowCols))
	_, decoded := dtGet(t, svc, "&id=9")
	if decoded["state"].(float64) != 102 {
		t.Fatalf("media_state=1 恒定的过滤条件缺失: %v", decoded)
	}
}

func TestDetailLoggedInSeesOwnDraft(t *testing.T) {
	svc, mock := dtSvc(t, 2)
	mock.ExpectQuery(dtMainMine).WillReturnRows(dtRowMod(func(v []driver.Value) {
		v[11] = "2"
		v[20] = "0"
	}))
	mock.ExpectQuery(dtTypeChain).WithArgs(7).
		WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow("7", "0", "新闻", "1"))
	mock.ExpectQuery(dtBody).WillReturnRows(sqlmock.NewRows([]string{"body"}).AddRow("草稿正文"))
	mock.ExpectQuery(dtCommon).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	mock.ExpectQuery(dtReward).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	mock.ExpectQuery(dtSubList).WillReturnRows(sqlmock.NewRows([]string{"table_name", "begin_id"}))
	mock.ExpectExec(dtClickArt).WithArgs("9").WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(dtClickSd).WithArgs("2").WillReturnResult(sqlmock.NewResult(0, 1))
	// 本人看自己的文章不写浏览足迹（$userid != $admin 不成立）。

	_, decoded := dtGet(t, svc, "&id=9")
	if decoded["state"].(float64) != 100 {
		t.Fatalf("会员应能看到自己名下未发布文章: %v", decoded)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("SQL 期望未满足: %v", err)
	}
}

func TestDetailSkipsClickOnGetComment(t *testing.T) {
	svc, mock := dtSvc(t, 0)
	mock.ExpectQuery(dtMainAnon).WillReturnRows(dtRow())
	mock.ExpectQuery(dtTypeChain).WithArgs(7).
		WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow("7", "0", "新闻", "1"))
	mock.ExpectQuery(dtBody).WillReturnRows(sqlmock.NewRows([]string{"body"}).AddRow("正文"))
	mock.ExpectQuery(dtCommon).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	mock.ExpectQuery(dtReward).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	// 没有任何 UPDATE 期望：多写了会由 ExpectationsWereMet 报「unexpected call」。

	// 评论列表在 PHP 里是同一个请求内回调 detail（$_REQUEST['action'] 仍是 getComment），
	// 这里直接构造等价请求：Action 是 detail，URL 上是 getComment。
	req := httptest.NewRequest(http.MethodGet, "/include/ajax.php?service=article&action=getComment&id=9", nil)
	resp := svc.Detail(&ajax.Request{Service: "article", Action: "detail", Params: req.URL.Query(), HTTP: req})
	if resp.State != ajax.StateOK {
		t.Fatalf("详情本身应成功: %v", resp.State)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("评论接口回调详情不应计数: %v", err)
	}
}

func TestDetailZhuantiAndMediaArctype(t *testing.T) {
	svc, mock := dtSvc(t, 0)
	mock.ExpectQuery(dtMainAnon).WillReturnRows(dtRowMod(func(v []driver.Value) {
		v[29] = "11"
		v[30] = "5"
	}))
	mock.ExpectQuery(dtTypeChain).WithArgs(7).
		WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow("7", "0", "新闻", "1"))
	mock.ExpectQuery(dtBody).WillReturnRows(sqlmock.NewRows([]string{"body"}).AddRow(""))
	mock.ExpectQuery(dtCommon).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	mock.ExpectQuery(dtReward).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	mock.ExpectQuery(dtArctypeQ).WithArgs("11").
		WillReturnRows(sqlmock.NewRows([]string{"typename"}).AddRow("科技"))
	mock.ExpectQuery(dtZhuantiQ).WithArgs("5").
		WillReturnRows(sqlmock.NewRows([]string{"id", "typename"}).AddRow("3", "父专题"))
	expectWrites(mock)

	_, decoded := dtGet(t, svc, "&id=9")
	info := decoded["info"].(map[string]any)
	if info["media_arctype"] != "11" || info["media_arctypeName"] != "科技" {
		t.Fatalf("media_arctype 应为库里的值与类型名: %v/%v", info["media_arctype"], info["media_arctypeName"])
	}
	z := info["zhuanti"].(map[string]any)
	if z["id"] != "3" || z["title"] != "父专题" {
		t.Fatalf("zhuanti 取父专题的 id/名字: %v", z)
	}
}

func TestDetailMediaArctypeMissingResetsToZero(t *testing.T) {
	svc, mock := dtSvc(t, 0)
	mock.ExpectQuery(dtMainAnon).WillReturnRows(dtRowMod(func(v []driver.Value) { v[29] = "11" }))
	mock.ExpectQuery(dtTypeChain).WithArgs(7).
		WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow("7", "0", "新闻", "1"))
	mock.ExpectQuery(dtBody).WillReturnRows(sqlmock.NewRows([]string{"body"}).AddRow(""))
	mock.ExpectQuery(dtCommon).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	mock.ExpectQuery(dtReward).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	mock.ExpectQuery(dtArctypeQ).WithArgs("11").WillReturnRows(sqlmock.NewRows([]string{"typename"}))
	expectWrites(mock)

	_, decoded := dtGet(t, svc, "&id=9")
	info := decoded["info"].(map[string]any)
	if info["media_arctype"].(float64) != 0 || info["media_arctypeName"] != "" {
		t.Fatalf("类型行查不到时 media_arctype 置 0: %v/%v", info["media_arctype"], info["media_arctypeName"])
	}
}

func TestDetailHistoryForOtherAuthor(t *testing.T) {
	svc, mock := dtSvc(t, 2)
	mock.ExpectQuery(dtMainMine).WillReturnRows(dtRowMod(func(v []driver.Value) { v[11] = "3" }))
	mock.ExpectQuery(dtTypeChain).WithArgs(7).
		WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow("7", "0", "新闻", "1"))
	mock.ExpectQuery(dtBody).WillReturnRows(sqlmock.NewRows([]string{"body"}).AddRow(""))
	mock.ExpectQuery(dtCommon).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	mock.ExpectQuery(dtReward).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	mock.ExpectQuery(dtSubList).WillReturnRows(sqlmock.NewRows([]string{"table_name", "begin_id"}))
	mock.ExpectExec(dtClickArt).WithArgs("9").WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(dtClickSd).WithArgs("3").WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectQuery(dtHistoryQ).WithArgs(int64(2), "3", "9").WillReturnRows(sqlmock.NewRows([]string{"id"}))
	mock.ExpectExec(dtHistoryI).WithArgs(int64(2), "3", "9", sqlmock.AnyArg()).WillReturnResult(sqlmock.NewResult(1, 1))

	if _, decoded := dtGet(t, svc, "&id=9"); decoded["state"].(float64) != 100 {
		t.Fatalf("应成功: %v", decoded)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("浏览足迹未按 updateHistoryClick 写入: %v", err)
	}
}

func TestDetailMemberFieldUsesInjectedDetail(t *testing.T) {
	svc, mock := dtSvc(t, 0)
	svc.memberDetail = func(*ajax.Request) ajax.Response {
		return ajax.Response{State: ajax.StateOK, Info: map[string]any{"id": "3", "username": "作者"}}
	}
	mock.ExpectQuery(dtMainAnon).WillReturnRows(dtRowMod(func(v []driver.Value) { v[11] = "3" }))
	mock.ExpectQuery(dtTypeChain).WithArgs(7).
		WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow("7", "0", "新闻", "1"))
	mock.ExpectQuery(dtBody).WillReturnRows(sqlmock.NewRows([]string{"body"}).AddRow(""))
	mock.ExpectQuery(dtCommon).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	mock.ExpectQuery(dtReward).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	// 作者有自媒体号则 media 走 selfmediaDetail：验证失败时 PHP 输出 null，这里按 102 降级。
	mock.ExpectQuery(dtMediaQ).WithArgs(3).WillReturnRows(sqlmock.NewRows([]string{"id", "state"}))
	mock.ExpectQuery(dtMediaMgrQ).WithArgs(3).WillReturnRows(sqlmock.NewRows([]string{"id"}))
	expectWrites(mock)

	_, decoded := dtGet(t, svc, "&id=9")
	info := decoded["info"].(map[string]any)
	if m, ok := info["member"].(map[string]any); !ok || m["username"] != "作者" {
		t.Fatalf("member 字段应透传 member.detail 的 info: %v", info["member"])
	}
	if info["media"] != nil {
		t.Fatalf("自媒体校验失败时 media 应为 null: %v", info["media"])
	}
}

func TestDetailCollectAndZan(t *testing.T) {
	svc, mock := dtSvc(t, 0)
	svc.collectCheck = func(_ *ajax.Request, module, temp, action, id string) string {
		if module == "article" && temp == "detail" && action == "add" && id == "9" {
			return "has"
		}
		return ""
	}
	svc.zanCheck = func(_ *ajax.Request, module, temp, id string) string {
		if module == "article" && temp == "detail" && id == "9" {
			return "no"
		}
		return ""
	}
	mock.ExpectQuery(dtMainAnon).WillReturnRows(dtRow())
	mock.ExpectQuery(dtTypeChain).WithArgs(7).
		WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow("7", "0", "新闻", "1"))
	mock.ExpectQuery(dtBody).WillReturnRows(sqlmock.NewRows([]string{"body"}).AddRow(""))
	mock.ExpectQuery(dtCommon).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	mock.ExpectQuery(dtReward).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	expectWrites(mock)

	_, decoded := dtGet(t, svc, "&id=9")
	info := decoded["info"].(map[string]any)
	if info["collect"].(float64) != 1 {
		t.Fatalf(`collect 只在 info == "has" 时为 1: %v`, info["collect"])
	}
	if info["zan"].(float64) != 0 {
		t.Fatalf(`zan 必须严格等于 "has": %v`, info["zan"])
	}
}

func containsJSON(body, want string) bool {
	return len(body) >= len(want) && (func() bool {
		for i := 0; i+len(want) <= len(body); i++ {
			if body[i:i+len(want)] == want {
				return true
			}
		}
		return false
	})()
}

func TestDetailMold4OnlyBaseFields(t *testing.T) {
	svc, mock := dtSvc(t, 0)
	mock.ExpectQuery(dtMainAnon).WillReturnRows(dtRowMod(func(v []driver.Value) { v[14] = "4" }))
	mock.ExpectQuery(dtTypeChain).WithArgs(7).
		WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow("7", "0", "新闻", "1"))
	mock.ExpectQuery(dtCommon).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	mock.ExpectQuery(dtReward).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	expectWrites(mock)

	_, decoded := dtGet(t, svc, "&id=9")
	info := decoded["info"].(map[string]any)
	for _, k := range []string{"body", "mbody", "imglist", "video", "videoSource"} {
		if _, has := info[k]; has {
			t.Fatalf("mold=4 不应输出 %s: %v", k, info)
		}
	}
	if info["id"] != "9" {
		t.Fatalf("基础字段仍要输出: %v", info)
	}
}

func TestDetailPropAndNicknameAndEntities(t *testing.T) {
	svc, mock := dtSvc(t, 0)
	mock.ExpectQuery(dtMainAnon).WillReturnRows(dtRowMod(func(v []driver.Value) {
		v[1] = "a & b"
		v[12] = "阿文"
		v[13] = "1"
	}))
	mock.ExpectQuery(dtTypeChain).WithArgs(7).
		WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow("7", "0", "新闻", "1"))
	mock.ExpectQuery(dtBody).WillReturnRows(sqlmock.NewRows([]string{"body"}).AddRow(""))
	mock.ExpectQuery(dtCommon).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	mock.ExpectQuery(dtReward).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	expectWrites(mock)

	_, decoded := dtGet(t, svc, "&id=9")
	info := decoded["info"].(map[string]any)
	if info["title"] != "a & b" {
		t.Fatalf("title 不做 htmlentities（PHP 原样输出）: %v", info["title"])
	}
	if info["prop"].(float64) != 1 || info["article_prop"].(float64) != 0 {
		t.Fatalf("prop/article_prop 必须相反: %v/%v", info["prop"], info["article_prop"])
	}
	if info["admin_nickname"] != "阿文" {
		t.Fatalf("admin_nickname 取 m.nickname: %v", info["admin_nickname"])
	}
}

func TestDetailWriterFallsBackWhenZero(t *testing.T) {
	svc, mock := dtSvc(t, 0)
	mock.ExpectQuery(dtMainAnon).WillReturnRows(dtRowMod(func(v []driver.Value) { v[9] = "0" }))
	mock.ExpectQuery(dtTypeChain).WithArgs(7).
		WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow("7", "0", "新闻", "1"))
	mock.ExpectQuery(dtBody).WillReturnRows(sqlmock.NewRows([]string{"body"}).AddRow(""))
	mock.ExpectQuery(dtCommon).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	mock.ExpectQuery(dtReward).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	expectWrites(mock)

	_, decoded := dtGet(t, svc, "&id=9")
	// PHP empty("0") 为真 → 回退 media.ac_name；没有媒体号 → ''。
	if got := decoded["info"].(map[string]any)["writer"]; got != "" {
		t.Fatalf(`writer="0" 应走 empty() 回退，最终是空串: %v`, got)
	}
}

func TestDetailMbodyZeroFallsBackToBody(t *testing.T) {
	svc, mock := dtSvc(t, 0)
	mock.ExpectQuery(dtMainAnon).WillReturnRows(dtRowMod(func(v []driver.Value) { v[23] = "0" }))
	mock.ExpectQuery(dtTypeChain).WithArgs(7).
		WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow("7", "0", "新闻", "1"))
	mock.ExpectQuery(dtBody).WillReturnRows(sqlmock.NewRows([]string{"body"}).AddRow("PC 正文"))
	mock.ExpectQuery(dtCommon).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	mock.ExpectQuery(dtReward).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	expectWrites(mock)

	_, decoded := dtGet(t, svc, "&id=9")
	info := decoded["info"].(map[string]any)
	if info["mbody"] != "PC 正文" {
		t.Fatalf(`mbody="0" 时 PHP empty() 为真，应回退 body: %v`, info["mbody"])
	}
}

func TestDetailMemberFallsBackToLoginUser(t *testing.T) {
	svc, mock := dtSvc(t, 2)
	var gotID string
	svc.memberDetail = func(r *ajax.Request) ajax.Response {
		gotID = r.Params.Get("id")
		return ajax.Response{State: ajax.StateOK, Info: map[string]any{"id": gotID}}
	}
	mock.ExpectQuery(dtMainMine).WillReturnRows(dtRow())
	mock.ExpectQuery(dtTypeChain).WithArgs(7).
		WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow("7", "0", "新闻", "1"))
	mock.ExpectQuery(dtBody).WillReturnRows(sqlmock.NewRows([]string{"body"}).AddRow(""))
	mock.ExpectQuery(dtCommon).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	mock.ExpectQuery(dtReward).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	expectWrites(mock)

	_, decoded := dtGet(t, svc, "&id=9")
	if gotID != "2" {
		t.Fatalf("admin=0 时 getMemberInfo 用当前登录会员（实测取到 %q）", gotID)
	}
	if m := decoded["info"].(map[string]any)["member"].(map[string]any); m["id"] != "2" {
		t.Fatalf("member 应是登录者本人: %v", m)
	}
}

func TestDetailSkipsClickOnUpList(t *testing.T) {
	svc, mock := dtSvc(t, 0)
	mock.ExpectQuery(dtMainAnon).WillReturnRows(dtRow())
	mock.ExpectQuery(dtTypeChain).WithArgs(7).
		WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow("7", "0", "新闻", "1"))
	mock.ExpectQuery(dtBody).WillReturnRows(sqlmock.NewRows([]string{"body"}).AddRow(""))
	mock.ExpectQuery(dtCommon).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	mock.ExpectQuery(dtReward).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))

	req := httptest.NewRequest(http.MethodGet, "/include/ajax.php?service=article&action=upList&id=9", nil)
	_ = svc.Detail(&ajax.Request{Service: "article", Action: "detail", Params: req.URL.Query(), HTTP: req})
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("upList 回调详情不应计数: %v", err)
	}
}

func TestDetailHistoryUpdatesExistingRow(t *testing.T) {
	svc, mock := dtSvc(t, 2)
	mock.ExpectQuery(dtMainMine).WillReturnRows(dtRowMod(func(v []driver.Value) { v[11] = "3" }))
	mock.ExpectQuery(dtTypeChain).WithArgs(7).
		WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow("7", "0", "新闻", "1"))
	mock.ExpectQuery(dtBody).WillReturnRows(sqlmock.NewRows([]string{"body"}).AddRow(""))
	mock.ExpectQuery(dtCommon).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	mock.ExpectQuery(dtReward).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	mock.ExpectQuery(dtSubList).WillReturnRows(sqlmock.NewRows([]string{"table_name", "begin_id"}))
	mock.ExpectExec(dtClickArt).WithArgs("9").WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(dtClickSd).WithArgs("3").WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectQuery(dtHistoryQ).WithArgs(int64(2), "3", "9").
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow("77"))
	mock.ExpectExec("UPDATE `huoniao_article_historyclick` SET `date` = ? WHERE `uid` = ? AND `fuid` = ? AND `aid` = ?").
		WithArgs(sqlmock.AnyArg(), int64(2), "3", "9").WillReturnResult(sqlmock.NewResult(0, 1))

	if _, decoded := dtGet(t, svc, "&id=9"); decoded["state"].(float64) != 100 {
		t.Fatalf("应成功: %v", decoded)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("已有足迹时应 UPDATE 而不是 INSERT: %v", err)
	}
}

func TestDetailClickToSubTable(t *testing.T) {
	svc, mock := dtSvc(t, 0)
	mock.ExpectQuery(dtMainAnon).WillReturnRows(dtRow())
	mock.ExpectQuery(dtTypeChain).WithArgs(7).
		WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow("7", "0", "新闻", "1"))
	mock.ExpectQuery(dtBody).WillReturnRows(sqlmock.NewRows([]string{"body"}).AddRow(""))
	mock.ExpectQuery(dtCommon).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	mock.ExpectQuery(dtReward).WithArgs("9").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("0"))
	// begin_id=5 命中 id=9 的前一档 → 写分表（不加前导反引号也接受，见 quoteTable）。
	mock.ExpectQuery(dtSubList).WillReturnRows(sqlmock.NewRows([]string{"table_name", "begin_id"}).
		AddRow("huoniao_articlelist_5", "5"))
	mock.ExpectExec("UPDATE `huoniao_articlelist_5` SET `click` = `click` + 1 WHERE `id` = ?").
		WithArgs("9").WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(dtClickSd).WithArgs("0").WillReturnResult(sqlmock.NewResult(0, 1))

	if _, decoded := dtGet(t, svc, "&id=9"); decoded["state"].(float64) != 100 {
		t.Fatalf("应成功: %v", decoded)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("分表存在时应写分表而不是 _all: %v", err)
	}
}
