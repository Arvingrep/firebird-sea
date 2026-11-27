// travel_batch2_test.go 是批次2（#371）列表/详情 action 的 L1 测试。
// 口径：sqlmock 精确匹配 SQL（QueryMatcherEqual），断言 JSON 输出与键序。
package travel

import (
	"database/sql"
	"encoding/json"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	sqlmock "github.com/DATA-DOG/go-sqlmock"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/compare"
)

// —— 共享 helper 单测 ——

func TestTelEncrypt(t *testing.T) {
	cases := map[string]string{
		"13812345678":    "138****5678",
		"15812345678":    "158****5678",
		"12812345678":    "12812345678", // 号段不含 2
		"1381234567":     "1381234567",  // 位数不足
		"":               "",
		"+8613812345678": "+86138****5678",
	}
	for in, want := range cases {
		if got := telEncrypt(in); got != want {
			t.Errorf("telEncrypt(%q) = %q, want %q", in, got, want)
		}
	}
}

func TestDistanceText(t *testing.T) {
	cases := map[string]string{
		"999.44":  "999.4m",
		"1000":    "1000.0m", // >1000 才进 km
		"1000.5":  "1.0km",
		"12345.6": "12.3km",
		"0":       "0.0m",
	}
	for in, want := range cases {
		if got := distanceText(phpLooseFloat(in)); got != want {
			t.Errorf("distanceText(%q) = %q, want %q", in, got, want)
		}
	}
}

func TestGetPinyin(t *testing.T) {
	cases := map[string]string{
		"旅游":   "lvyou",
		"酒店":   "jiudian",
		"海景房":  "haijingfang",
		"Free": "free", // 大写被 strtolower
		"A":    "A",    // 单字符原样返回（不走 strtolower）
		"a-b":  "a_b",  // 非字母数字 → _
	}
	for in, want := range cases {
		if got := getPinyin(in); got != want {
			t.Errorf("getPinyin(%q) = %q, want %q", in, got, want)
		}
	}
}

func TestTagAllOf(t *testing.T) {
	if got := tagAllOf(""); len(got) != 0 {
		t.Errorf("tagAllOf(\"\") = %v, want 空", got)
	}
	got := tagAllOf("海景|Free")
	if len(got) != 2 {
		t.Fatalf("tagAllOf 长度 = %d", len(got))
	}
	m := got[0].(*omap)
	if m.vals["jc"] != "海景" || m.vals["py"] != "haijing" {
		t.Errorf("tagAll[0] = %v", m.vals)
	}
	m2 := got[1].(*omap)
	if m2.vals["py"] != "free" {
		t.Errorf("tagAll[1].py = %v", m2.vals["py"])
	}
}

func TestCnSubstrR(t *testing.T) {
	if got := cnSubstrR("旅游度假abc", 4); got != "旅游度假" {
		t.Errorf("cnSubstrR CJK = %q", got)
	}
	// 小写/半角标点按 0.5 宽计：4 宽 = 8 个半角。
	if got := cnSubstrR("abcdefghij", 4); got != "abcdefgh" {
		t.Errorf("cnSubstrR ascii = %q", got)
	}
}

func TestPhpStripTags(t *testing.T) {
	cases := map[string]string{
		"<p>a<b>c</b></p>":     "ac",
		"a<img src=\"x>y\"/>b": "ab", // 属性内 > 不结束标签
		"a<!-- 注释 -->b":        "ab",
		"a<br/>b":              "ab",
	}
	for in, want := range cases {
		if got := phpStripTags(in); got != want {
			t.Errorf("phpStripTags(%q) = %q, want %q", in, got, want)
		}
	}
}

func TestPhpNl2br(t *testing.T) {
	if got := phpNl2br("a\nb"); got != "a<br />\nb" {
		t.Errorf("phpNl2br = %q", got)
	}
	if got := phpNl2br("a\r\nb"); got != "a<br />\r\nb" {
		t.Errorf("phpNl2br crlf = %q", got)
	}
}

func TestScienceArr(t *testing.T) {
	if got := scienceArr(""); len(got) != 0 {
		t.Errorf("scienceArr(\"\") 非空")
	}
	got := scienceArr("材料A$$$说明1|||材料B$$$说明2")
	if len(got) != 2 {
		t.Fatalf("scienceArr 长度 = %d", len(got))
	}
	m := got[0].(*omap)
	if m.vals["title"] != "材料A" || m.vals["note"] != "说明1" {
		t.Errorf("scienceArr[0] = %v", m.vals)
	}
}

func TestSpecialtimeOut(t *testing.T) {
	// PHP serialize 关联数组。
	st, stj := specialtimeOut(`a:2:{s:5:"start";s:2:"09";s:3:"end";s:2:"18";}`)
	if om, ok := st.(*omap); !ok || om.vals["start"] != "09" || om.vals["end"] != "18" {
		t.Errorf("specialtime = %v", st)
	}
	if stj != `{"start":"09","end":"18"}` {
		t.Errorf("specialtimejson = %q", stj)
	}
	// 空值 → "" / ""。
	if st, stj = specialtimeOut(""); st != "" || stj != "" {
		t.Errorf("specialtimeOut(\"\") = %v, %q", st, stj)
	}
}

func TestPhpSprintf2f(t *testing.T) {
	cases := map[string]string{
		"80.0000": "80.00",
		"0":       "0.00",
		"":        "0.00",
		"abc":     "0.00",
		"3.567":   "3.57",
	}
	for in, want := range cases {
		if got := phpSprintf2f(in); got != want {
			t.Errorf("phpSprintf2f(%q) = %q, want %q", in, got, want)
		}
	}
}

func TestCommaJoin(t *testing.T) {
	b := func(s string) map[string][]string { return map[string][]string{"typeid": {s}} }
	if got := commaJoin(b("1,2"), "typeid"); got != "1,2" {
		t.Errorf("commaJoin 1,2 = %q", got)
	}
	if got := commaJoin(b("01,abc,2"), "typeid"); got != "1,0,2" {
		t.Errorf("commaJoin 01,abc,2 = %q", got)
	}
	if got := commaJoin(b("0"), "typeid"); got != "" {
		t.Errorf("commaJoin 标量 0 = %q", got)
	}
	if got := commaJoin(b(""), "typeid"); got != "" {
		t.Errorf("commaJoin 空串 = %q", got)
	}
}

func TestStoreListOrderby(t *testing.T) {
	cases := map[string]string{
		"1": " ORDER BY `click` DESC, `weight` DESC, `id` DESC",
		"2": " ORDER BY `pubdate` DESC, `weight` DESC, `id` DESC",
		"3": "",
		"4": "",
		"0": " ORDER BY `weight` DESC, `id` DESC",
		"":  " ORDER BY `weight` DESC, `id` DESC",
		"x": " ORDER BY `weight` DESC, `id` DESC",
	}
	for in, want := range cases {
		if got := storeListOrderby(in, false); got != want {
			t.Errorf("storeListOrderby(%q) = %q, want %q", in, got, want)
		}
	}
	if got := storeListOrderby("4", true); got != " ORDER BY distance ASC" {
		t.Errorf("storeListOrderby(4,geo) = %q", got)
	}
}

func TestPhpSwitchInt(t *testing.T) {
	if phpSwitchInt("01") != 1 {
		t.Errorf("phpSwitchInt(01) != 1")
	}
	if phpSwitchInt("1abc") != switchNoMatch {
		t.Errorf("phpSwitchInt(1abc) 应不匹配（PHP8 字符串比较）")
	}
	if phpSwitchInt("abc") != switchNoMatch {
		t.Errorf("phpSwitchInt(abc) 应不匹配")
	}
}

func TestPhpLooseTypes(t *testing.T) {
	if looseZero("0") != true || looseZero("") != true || looseZero("00.0") != true || looseZero("5") != false {
		t.Errorf("looseZero 口径错误")
	}
	if phpRound2(3.567) != 3.57 || phpRound2(2.5) != 2.5 {
		t.Errorf("phpRound2 口径错误")
	}
	if phpStripslashes(`a\"b`) != `a"b` {
		t.Errorf("phpStripslashes = %q", phpStripslashes(`a\"b`))
	}
}

// sqlNull 是 SQL NULL 值的占位。
func sqlNull() any { return sql.NullString{} }

// —— action 级测试 ——

// storeList 全链路：count + 列表 + tickarr，断言 JSON 键序与值。
func TestStoreListFull(t *testing.T) {
	svc, mock := newService(t)
	mock.MatchExpectationsInOrder(false)

	count := mock.ExpectQuery("SELECT COUNT(`id`) total FROM `huoniao_travel_store` WHERE 1 = 1 AND `state` = 1")
	count.WillReturnRows(sqlmockRows("total").AddRow("2"))

	list := mock.ExpectQuery("SELECT `bind_module`, `title`, `pubdate`, `pics`, `video`, `license`, `lat`, `lng`, `id`,`userid`, `address`, `tel`, `addrid`,  `contact`,`flag` FROM `huoniao_travel_store` WHERE 1 = 1 AND `state` = 1" +
		" ORDER BY `weight` DESC, `id` DESC LIMIT 0, 10")
	list.WillReturnRows(
		sqlmockRows("bind_module", "title", "pubdate", "pics", "video", "license", "lat", "lng", "id", "userid", "address", "tel", "addrid", "contact", "flag").
			AddRow("1,2", "旅行社甲", "1700000000", "a.jpg,b.jpg", "v.mp4", "1", "30.1", "120.2", "11", "5", "地址一", "13812345678", "2", "联系人", "flagX").
			AddRow("", "旅行社乙", "1700000001", "", "", "", "", "", "12", "6", "地址二", "", "", "", ""))

	tick := mock.ExpectQuery("SELECT `id`, `pics`, (SELECT min(c.`price`) minprice FROM `huoniao_travel_ticketinfo` c WHERE c.`ticketid` = l.`id` AND c.`typeid` = '1' ) AS price, `state`  FROM `huoniao_travel_agency` l WHERE company = 11 ORDER BY  `pubdate`  DESC LIMIT 0,2")
	tick.WillReturnRows(sqlmockRows("id", "pics", "price", "state").AddRow("77", "t.jpg,x.jpg", "299.0000", "1"))

	got := serve(t, svc, "/include/ajax.php?service=travel&action=storeList")
	want := `{"state":100,"info":{"pageInfo":{"page":1,"pageSize":10,"totalPage":1.0,"totalCount":"2"},"list":[` +
		`{"id":"11","title":"旅行社甲","address":"地址一","tel":"13812345678","telEncrypt":"138****5678","lng":"120.2","lat":"30.1","flag":"flagX","pubdate":"1700000000","bind_module":"1,2","contact":"联系人","license":"1","video":"v.mp4","distance":"0.0m",` +
		`"tickarr":[{"pics":"","id":"77","minprice":"299.0000","url":""}],` +
		`"bind_moduleArr":[{"id":"1","val":"酒店"},{"id":"2","val":"景点门票"}],"bind_moduleArr_":["1","2"],` +
		`"litpic":"","addrname":[],"url":""},` +
		`{"id":"12","title":"旅行社乙","address":"地址二","tel":"","telEncrypt":"","lng":"","lat":"","flag":"","pubdate":"1700000001","bind_module":"","contact":"","license":"","video":"","distance":"0.0m","tickarr":[],"bind_moduleArr":[],"bind_moduleArr_":[],"litpic":"","addrname":"","url":""}]}}`
	if got != want {
		t.Errorf("storeList 响应不一致：\ngot  %s\nwant %s", got, want)
	}
}

// sqlmockRows 是列名构造的小助手（AddRow 链式返回 *Rows）。
func sqlmockRows(cols ...string) *sqlmock.Rows {
	return sqlmock.NewRows(cols)
}

// storeDetail：数字 id 命中行的全字段序（含 member 投影 / collect / minPrice）。
func TestStoreDetailFull(t *testing.T) {
	svc, mock := newService(t)
	mock.MatchExpectationsInOrder(false)

	svc.memberDetail = func(req *ajax.Request) ajax.Response {
		if req.Params.Get("id") == "5" {
			return ajax.Response{State: 100, Info: map[string]any{"userid": "5", "nickname": "店主"}}
		}
		return ajax.Response{State: 102, Info: "No data!"}
	}

	mock.ExpectQuery("SELECT `id`, `cityid`, `title`, `userid`, `lng`, `flag`, `lat`, `addrid`, `address`, `tel`, `contact`, `pics`, `video`, `note`, `license`, `servicetime`, `click`, `pubdate`, `state`, `bind_module`,`date`,`openStart`,`openEnd`, `refuse`  FROM `huoniao_travel_store` WHERE `id` = 11 AND `state` = 1").
		WillReturnRows(sqlmockRows("id", "cityid", "title", "userid", "lng", "flag", "lat", "addrid", "address", "tel", "contact", "pics", "video", "note", "license", "servicetime", "click", "pubdate", "state", "bind_module", "date", "openStart", "openEnd", "refuse").
			AddRow("11", "1", "旅行社甲", "5", "120.2", "", "30.1", "2", "地址一", "13812345678", "联系人", "a.jpg,b.jpg", "v.mp4", "<p>简介</p>", "1", "ST", "9", "1700000000", "1", "1,2", "1,2", "09:00", "18:00", "0"))

	// circleAddrid
	mock.ExpectQuery("SELECT `parentid` FROM `huoniao_site_area` WHERE `id` = '2'").
		WillReturnRows(sqlmockRows("parentid").AddRow("1"))
	// addrname 链（addrid=2 → 自己 → parent 1）
	mock.ExpectQuery("SELECT `id`, `parentid`, `typename` FROM `huoniao_site_area` WHERE `id` = 2 ORDER BY `weight` LIMIT 1").
		WillReturnRows(sqlmockRows("id", "parentid", "typename").AddRow("2", "1", "西湖区"))
	mock.ExpectQuery("SELECT `id`, `parentid`, `typename` FROM `huoniao_site_area` WHERE `id` = 1 ORDER BY `weight` LIMIT 1").
		WillReturnRows(sqlmockRows("id", "parentid", "typename").AddRow("1", "0", "杭州市"))
	// collect（member 注入返回 no）
	// minPrice
	mock.ExpectQuery("SELECT (SELECT avg(c.`price`) FROM `huoniao_travel_ticketinfo` c WHERE c.`ticketid` = l.`id` AND c.`typeid` = '1' ) AS price FROM `huoniao_travel_agency` l WHERE `company` = 11").
		WillReturnRows(sqlmockRows("price").AddRow("258.3333"))

	got := serve(t, svc, "/include/ajax.php?service=travel&action=storeDetail&id=11")
	want := `{"state":100,"info":` +
		`{"id":"11","cityid":"1","flag":"","title":"旅行社甲","userid":"5","address":"地址一","lng":"120.2","lat":"30.1","tel":"13812345678","telEncrypt":"138****5678","contact":"联系人","click":"9","state":"1","refuse":"0","license":"1",` +
		`"servicetime":"1,2","openStart":"09:00","openEnd":"18:00","note":"<p>简介</p>","video":"v.mp4","videoSource":"","bind_module":"1,2",` +
		`"bind_moduleArr":[{"id":"1","val":"酒店"},{"id":"2","val":"景点门票"}],"bind_moduleArr_":["1","2"],` +
		`"weekk":"周一,周二","openweek":[{"id":"1","val":"周一"},{"id":"2","val":"周二"}],"openweek_":["1","2"],` +
		`"member":{"nickname":"店主","userid":"5"},` +
		`"addrid":"2","circleAddrid":"1","addrname":["杭州市","西湖区"],"city":"1",` +
		`"collect":0,"pics":[{"path":"","pathSource":"a.jpg"},{"path":"","pathSource":"b.jpg"}],"minPrice":258.33}}`
	if got != want {
		t.Errorf("storeDetail 响应不一致：\ngot  %s\nwant %s", got, want)
	}
}

// videoList：$userArr 残留 bug 照抄 + attachment 宽高。
func TestVideoListUserResidual(t *testing.T) {
	svc, mock := newService(t)
	mock.MatchExpectationsInOrder(false)

	count := mock.ExpectQuery("SELECT COUNT(s.`id`) total FROM `huoniao_travel_video` s LEFT JOIN `huoniao_travel_store` z ON z.`id` = s.`userid` WHERE (s.`usertype` = 0 OR (s.`usertype` = 1 AND s.`userid` = z.`id` AND z.`state` = 1))  AND s.`state` = 1 ")
	count.WillReturnRows(sqlmockRows("total").AddRow("2"))

	list := mock.ExpectQuery("SELECT s.`id`, s.`usertype`, s.`userid`, s.`title`, s.`litpic`, s.`video`, s.`click`, s.`pubdate`, s.`state`, z.`id` as comid FROM `huoniao_travel_video` s LEFT JOIN `huoniao_travel_store` z ON z.`id` = s.`userid` WHERE (s.`usertype` = 0 OR (s.`usertype` = 1 AND s.`userid` = z.`id` AND z.`state` = 1))  AND s.`state` = 1  ORDER BY s.`weight` DESC, s.`id` DESC LIMIT 0, 10")
	list.WillReturnRows(sqlmockRows("id", "usertype", "userid", "title", "litpic", "video", "click", "pubdate", "state", "comid").
		AddRow("1", "0", "9", "视频一", "", "", "3", "1700000000", "1", sqlNull()).
		AddRow("2", "0", "999999", "视频二", "", "", "4", "1700000001", "1", sqlNull()))

	// 第一条 member 命中；第二条查无 → user 残留第一条（PHP bug）。
	mock.ExpectQuery("SELECT `nickname`, `username`, `photo` FROM `huoniao_member` WHERE `id` = 9").
		WillReturnRows(sqlmockRows("nickname", "username", "photo").AddRow("网友A", "", "p.jpg"))
	mock.ExpectQuery("SELECT `nickname`, `username`, `photo` FROM `huoniao_member` WHERE `id` = 999999").
		WillReturnRows(sqlmockRows("nickname", "username", "photo"))
	// countcomment（每条一次）
	mock.ExpectQuery("SELECT `id` FROM `huoniao_public_comment_all` WHERE `ischeck` = 1 AND `type` = 'travel-video' AND `aid` = '1' AND `pid` = 0").
		WillReturnRows(sqlmockRows("id").AddRow("1"))
	mock.ExpectQuery("SELECT `id` FROM `huoniao_public_comment_all` WHERE `ischeck` = 1 AND `type` = 'travel-video' AND `aid` = '2' AND `pid` = 0").
		WillReturnRows(sqlmockRows("id"))

	got := serve(t, svc, "/include/ajax.php?service=travel&action=videoList")
	if !strings.Contains(got, `"user":{"nickname":"网友A","photo":""}`) &&
		!strings.Contains(got, `"photo":"p.jpg"`) {
		t.Errorf("videoList user 投影异常：%s", got)
	}
	// 第二条应残留第一条的 user（PHP bug 照抄）。
	if strings.Count(got, `"nickname":"网友A"`) != 2 {
		t.Errorf("user 残留未复刻：%s", got)
	}
}

// gettypename 松散匹配回落（array_search 失败 → 第一项）。
func TestTypeNameByIDFallback(t *testing.T) {
	if got := typeNameByID(starTypeItems(), "99"); got != "A级" {
		t.Errorf("typeNameByID 回落 = %q", got)
	}
	if got := typeNameByID(starTypeItems(), "3"); got != "3A级" {
		t.Errorf("typeNameByID(3) = %q", got)
	}
}

// 19 个 action 全部注册（路由可达，非 404）。
func TestBatch2Registered(t *testing.T) {
	svc, _ := newService(t)
	actions := []string{
		"storeList", "storeDetail", "hotelList", "hotelDetail", "ticketList", "ticketDetail",
		"rentcarList", "rentcarDetail", "visaList", "visaDetail", "agencyList", "agencyDetail",
		"videoList", "videoDetail", "strategyList", "strategyDetail",
		"companyAllDataList", "getAlldata", "searchTravel",
	}
	router := ajax.NewRouter(func(string) {})
	Register(router, svc)
	for _, a := range actions {
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, httptest.NewRequest("GET", "/include/ajax.php?service=travel&action="+a, nil))
		if rec.Code == 404 {
			t.Errorf("travel.%s 未注册", a)
		}
	}
}

// —— compare 用例文件可解析 ——

func TestBatch2CompareCasesParse(t *testing.T) {
	for _, a := range []string{"storeList", "storeDetail", "hotelList", "hotelDetail", "ticketList",
		"ticketDetail", "rentcarList", "rentcarDetail", "visaList", "visaDetail", "agencyList",
		"agencyDetail", "videoList", "videoDetail", "strategyList", "strategyDetail",
		"companyAllDataList", "getAlldata", "searchTravel"} {
		var cf compare.CaseFile
		b, err := os.ReadFile("../../../testdata/compare/travel." + a + ".json")
		if err != nil {
			t.Fatalf("travel.%s 用例缺失: %v", a, err)
		}
		if err := json.Unmarshal(b, &cf); err != nil {
			t.Errorf("travel.%s 用例解析失败: %v", a, err)
		}
		if len(cf.Cases) == 0 {
			t.Errorf("travel.%s 用例为空", a)
		}
	}
}
