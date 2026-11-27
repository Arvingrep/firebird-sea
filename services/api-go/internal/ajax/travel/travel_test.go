package travel

import (
	"database/sql"
	"net/http"
	"net/http/httptest"
	"testing"

	sqlmock "github.com/DATA-DOG/go-sqlmock"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// newService 起一个 sqlmock 连接池和挂在它上面的 travel 服务（口径同 article 测试）。
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

// —— 静态字典（10 + moduleType）——

func TestStaticTypeListsExactJSON(t *testing.T) {
	svc, _ := newService(t)
	cases := map[string]string{
		"module_type":       `{"state":100,"info":[{"id":1,"typename":"酒店","lower":[]},{"id":2,"typename":"景点门票","lower":[]},{"id":3,"typename":"租车","lower":[]},{"id":4,"typename":"旅行社","lower":[]},{"id":5,"typename":"视频","lower":[]},{"id":6,"typename":"旅游攻略","lower":[]},{"id":7,"typename":"签证","lower":[]}]}`,
		"iswindow_type":     `{"state":100,"info":[{"id":0,"typename":"无窗","lower":[]},{"id":1,"typename":"有窗","lower":[]}]}`,
		"visa_type":         `{"state":100,"info":[{"id":0,"typename":"单次","lower":[]},{"id":1,"typename":"多次","lower":[]},{"id":2,"typename":"以使领馆签发为准","lower":[]}]}`,
		"room_type":         `{"state":100,"info":[{"id":0,"typename":"双床","lower":[]},{"id":1,"typename":"多床","lower":[]},{"id":2,"typename":"大床","lower":[]}]}`,
		"breakfast_type":    `{"state":100,"info":[{"id":0,"typename":"不含早餐","lower":[]},{"id":1,"typename":"含早餐","lower":[]}]}`,
		"travelhotel_type":  `{"state":100,"info":[{"id":1,"typename":"星级酒店","lower":[]},{"id":2,"typename":"民宿","lower":[]}]}`,
		"travelagency_type": `{"state":100,"info":[{"id":0,"typename":"一日游","lower":[]},{"id":1,"typename":"跟团游","lower":[]}]}`,
		"star_type":         `{"state":100,"info":[{"id":1,"typename":"A级","lower":[]},{"id":2,"typename":"2A级","lower":[]},{"id":3,"typename":"3A级","lower":[]},{"id":4,"typename":"4A级","lower":[]},{"id":5,"typename":"5A级","lower":[]}]}`,
		"continent_type":    `{"state":100,"info":[{"id":1,"typename":"亚洲","lower":[]},{"id":2,"typename":"大洋洲","lower":[]},{"id":3,"typename":"美洲","lower":[]},{"id":4,"typename":"欧洲","lower":[]},{"id":5,"typename":"非洲","lower":[]}]}`,
		"typeid_type":       `{"state":100,"info":[{"id":0,"typename":"免签","lower":[]},{"id":1,"typename":"落地签","lower":[]},{"id":2,"typename":"单次","lower":[]}]}`,
		"moduleType":        `{"state":100,"info":[{"id":1,"typename":"周一","lower":[]},{"id":2,"typename":"周二","lower":[]},{"id":3,"typename":"周三","lower":[]},{"id":4,"typename":"周四","lower":[]},{"id":5,"typename":"周五","lower":[]},{"id":6,"typename":"周六","lower":[]},{"id":7,"typename":"周日","lower":[]}]}`,
	}
	for action, want := range cases {
		got := serve(t, svc, "/include/ajax.php?service=travel&action="+action)
		if got != want {
			t.Errorf("%s 响应体 = %s\nwant            %s", action, got, want)
		}
	}
}

// —— getTypeList 系（canary 本地表不存在 → catch → 101 分类获取失败！）——

func TestRentcartypeTableMissing(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery("SELECT * FROM `huoniao_travel_rentcartype` WHERE `parentid` = 0 ORDER BY `weight` LIMIT 0, 1000").
		WillReturnError(sql.ErrConnDone)
	got := serve(t, svc, "/include/ajax.php?service=travel&action=rentcartype")
	want := `{"state":101,"info":"分类获取失败！"}`
	if got != want {
		t.Fatalf("响应体 = %s\nwant     %s", got, want)
	}
}

func TestVisatypeAndStrategytypeTableMissing(t *testing.T) {
	svc, mock := newService(t)
	for _, tc := range []struct{ action, table string }{
		{"visatype", "travel_visatype"},
		{"strategytype", "travel_strategytype"},
	} {
		mock.ExpectQuery("SELECT * FROM `huoniao_" + tc.table + "` WHERE `parentid` = 0 ORDER BY `weight` LIMIT 0, 1000").
			WillReturnError(sql.ErrConnDone)
		got := serve(t, svc, "/include/ajax.php?service=travel&action="+tc.action)
		if got != `{"state":101,"info":"分类获取失败！"}` {
			t.Fatalf("%s 响应体 = %s", tc.action, got)
		}
	}
}

// getTypeList 正常路径 + value=1 压缩映射 + 空结果 102。
func TestTypeListNormalAndValueMapping(t *testing.T) {
	svc, mock := newService(t)
	q := "SELECT * FROM `huoniao_travel_rentcartype` WHERE `parentid` = 0 ORDER BY `weight` LIMIT 0, 1000"
	mock.ExpectQuery(q).WillReturnRows(
		sqlmock.NewRows([]string{"id", "parentid", "typename", "weight", "litpic"}).
			AddRow(3, 0, "商务车", 5, "").
			AddRow(7, 0, "SUV", 2, ""),
	)
	mock.ExpectQuery("SELECT `id` FROM `huoniao_travel_rentcartype` WHERE `parentid` = 3").
		WillReturnRows(sqlmock.NewRows([]string{"id"}))
	mock.ExpectQuery("SELECT `id` FROM `huoniao_travel_rentcartype` WHERE `parentid` = 7").
		WillReturnRows(sqlmock.NewRows([]string{"id"}))
	got := serve(t, svc, "/include/ajax.php?service=travel&action=rentcartype")
	// 无 icon 列 → 无 iconturl/icon 键；无 title 列 → title 回落 typename；son=false → lower 计数（无子级不写键）。
	want := `{"state":100,"info":[{"id":3,"parentid":0,"typename":"商务车","title":"商务车"},{"id":7,"parentid":0,"typename":"SUV","title":"SUV"}]}`
	if got != want {
		t.Fatalf("响应体 = %s\nwant     %s", got, want)
	}

	mock.ExpectQuery(q).WillReturnRows(
		sqlmock.NewRows([]string{"id", "parentid", "typename", "weight", "litpic"}).AddRow(3, 0, "商务车", 5, ""),
	)
	mock.ExpectQuery("SELECT `id` FROM `huoniao_travel_rentcartype` WHERE `parentid` = 3").
		WillReturnRows(sqlmock.NewRows([]string{"id"}))
	got = serve(t, svc, "/include/ajax.php?service=travel&action=rentcartype&value=1")
	want = `{"state":100,"info":[{"id":3,"value":"商务车"}]}`
	if got != want {
		t.Fatalf("value=1 响应体 = %s\nwant     %s", got, want)
	}

	mock.ExpectQuery(q).WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}))
	got = serve(t, svc, "/include/ajax.php?service=travel&action=rentcartype")
	want = `{"state":102,"info":"No data!"}`
	if got != want {
		t.Fatalf("空结果响应体 = %s\nwant     %s", got, want)
	}
}

// son=1 递归：无子级时 lower=""（getTypeList return ""），有子级时 lower 为数组。
func TestTypeListSonRecursive(t *testing.T) {
	svc, mock := newService(t)
	root := "SELECT * FROM `huoniao_travel_rentcartype` WHERE `parentid` = 0 ORDER BY `weight` LIMIT 0, 1000"
	child := "SELECT * FROM `huoniao_travel_rentcartype` WHERE `parentid` = 3 ORDER BY `weight` LIMIT 0, 100000"
	mock.ExpectQuery(root).WillReturnRows(
		sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow(3, 0, "商务车", 5),
	)
	mock.ExpectQuery(child).WillReturnRows(
		sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow(9, 3, "7座", 1),
	)
	mock.ExpectQuery("SELECT * FROM `huoniao_travel_rentcartype` WHERE `parentid` = 9 ORDER BY `weight` LIMIT 0, 100000").
		WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}))
	got := serve(t, svc, "/include/ajax.php?service=travel&action=rentcartype&son=1")
	want := `{"state":100,"info":[{"id":3,"parentid":0,"typename":"商务车","title":"商务车","lower":[{"id":9,"parentid":3,"typename":"7座","title":"7座","lower":""}]}]}`
	if got != want {
		t.Fatalf("son=1 响应体 = %s\nwant     %s", got, want)
	}
}

// —— addr ——

func TestAddrAdminCityBranch(t *testing.T) {
	svc, mock := newService(t)
	// 匿名管理员全量分支：state=1 的城市 cid。
	mock.ExpectQuery("SELECT `cid` FROM `huoniao_site_city` WHERE `state` = 1 ORDER BY `id`").
		WillReturnRows(sqlmock.NewRows([]string{"cid"}).AddRow("1").AddRow("2"))
	mock.ExpectQuery("SELECT c.*, a.`id` cid, a.`typename`, a.`pinyin` FROM `huoniao_site_city` c LEFT JOIN `huoniao_site_area` a ON a.`id` = c.`cid` WHERE c.`cid` in (1,2) ORDER BY c.`id`").
		WillReturnRows(sqlmock.NewRows([]string{"id", "cid", "typename", "pinyin", "hot"}).
			AddRow(1, 1, "北京", "beijing", "0").
			AddRow(2, 2, "上海", "shanghai", "0"))
	mock.ExpectQuery("SELECT count(*) totalCount FROM `huoniao_site_area` WHERE `parentid` = 1 ORDER BY `weight`").
		WillReturnRows(sqlmock.NewRows([]string{"totalCount"}).AddRow("16"))
	mock.ExpectQuery("SELECT count(*) totalCount FROM `huoniao_site_area` WHERE `parentid` = 2 ORDER BY `weight`").
		WillReturnRows(sqlmock.NewRows([]string{"totalCount"}).AddRow("16"))
	got := serve(t, svc, "/include/ajax.php?service=travel&action=addr")
	want := `{"state":100,"info":[{"id":"1","typename":"北京","pinyin":"beijing","hot":"0","lower":"16"},{"id":"2","typename":"上海","pinyin":"shanghai","hot":"0","lower":"16"}]}`
	if got != want {
		t.Fatalf("addr 响应体 = %s\nwant     %s", got, want)
	}
}

func TestAddrSiteAreaChildren(t *testing.T) {
	svc, mock := newService(t)
	q := "SELECT * FROM `huoniao_site_area` WHERE `parentid` = 1 ORDER BY `weight` LIMIT 0, 2"
	mock.ExpectQuery(q).WillReturnRows(
		sqlmock.NewRows([]string{"id", "parentid", "typename", "weight", "level", "longitude", "latitude", "pinyin", "weather_code"}).
			AddRow(35, 1, "朝阳", 1, "2", "116.4495587295", "39.92637452308", "Chaoyang", "101010300").
			AddRow(36, 1, "昌平", 2, "2", "116.23785956149", "40.226798837231", "Changping", "101010700"),
	)
	// 每行的 lower 计数。
	mock.ExpectQuery("SELECT `id` FROM `huoniao_site_area` WHERE `parentid` = 35").
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1).AddRow(2))
	mock.ExpectQuery("SELECT `id` FROM `huoniao_site_area` WHERE `parentid` = 36").
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
	got := serve(t, svc, "/include/ajax.php?service=travel&action=addr&type=1&pageSize=2")
	// pinyin 输出小写；url 按 #238 口径不输出（compare ignoreFields）。
	want := `{"state":100,"info":[{"id":35,"parentid":1,"typename":"朝阳","level":"2","longitude":"116.4495587295","latitude":"39.92637452308","title":"朝阳","pinyin":"chaoyang","weather_code":"101010300","lower":2},{"id":36,"parentid":1,"typename":"昌平","level":"2","longitude":"116.23785956149","latitude":"40.226798837231","title":"昌平","pinyin":"changping","weather_code":"101010700","lower":1}]}`
	if got != want {
		t.Fatalf("addr type=1 响应体 = %s\nwant     %s", got, want)
	}
}

// —— travelitem / countrytype（canary 本地表不存在 → 恒 101 暂无数据！）——

func TestTravelItemCountQueryFails(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery("SELECT COUNT(`id`) total FROM `huoniao_travelitem` WHERE 1 = 1").
		WillReturnError(sql.ErrConnDone)
	got := serve(t, svc, "/include/ajax.php?service=travel&action=travelitem")
	want := `{"state":101,"info":"暂无数据！"}`
	if got != want {
		t.Fatalf("响应体 = %s\nwant     %s", got, want)
	}
}

func TestTravelitemAidInjectionRejected(t *testing.T) {
	svc, _ := newService(t)
	// PHP 把 aid 原样拼 SQL（注入面）；Go 拒绝非数字组合，直接按「无数据」口径。
	got := serve(t, svc, "/include/ajax.php?service=travel&action=travelitem&aid=1)or(1=1")
	want := `{"state":101,"info":"暂无数据！"}`
	if got != want {
		t.Fatalf("aid 注入响应体 = %s\nwant     %s", got, want)
	}
}

func TestCountrytypeCountQueryFails(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery("SELECT COUNT(`id`) total FROM `huoniao_travel_visacountrytype` WHERE 1 = 1").
		WillReturnError(sql.ErrConnDone)
	got := serve(t, svc, "/include/ajax.php?service=travel&action=countrytype")
	want := `{"state":101,"info":"暂无数据！"}`
	if got != want {
		t.Fatalf("响应体 = %s\nwant     %s", got, want)
	}
}

// —— countryDetail ——

func TestCountryDetailMissingID(t *testing.T) {
	svc, _ := newService(t)
	got := serve(t, svc, "/include/ajax.php?service=travel&action=countryDetail")
	want := `{"state":101,"info":"请填写联系人"}`
	if got != want {
		t.Fatalf("缺 id 响应体 = %s\nwant     %s", got, want)
	}
}

func TestCountryDetailTableMissingBraceShape(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery("SELECT `id`, `pubdate`, `typename`, `icon`, `pinyin`, `py`, `hot`, `continent`, `typeid`, `duration`, `condition`, `price`, `click`, `expenses`  FROM `huoniao_travel_visacountrytype` WHERE `id` = 1 AND `state` = 1").
		WillReturnError(sql.ErrConnDone)
	got := serve(t, svc, "/include/ajax.php?service=travel&action=countryDetail&id=1")
	// PHP 对 dsqlOper 错误串做字符串下标读取 → 全部字段 "{"；continentname/typeidname
	// 经 gettypename("{")：continent 回落首项（亚洲）、typeid 0 命中（免签）。canary 实测一致。
	want := `{"state":100,"info":{"id":"{","click":"{","pubdate":"{","typename":"{","icon":"{","iconSource":"","pinyin":"{","py":"{","hot":"{","continent":"{","continentname":"亚洲","typeid":"{","typeidname":"免签","duration":"{","condition":"{","price":"{","expenses":"{","collect":0}}`
	if got != want {
		t.Fatalf("响应体 = %s\nwant     %s", got, want)
	}
}

// —— config ——

func TestConfigSnapshot(t *testing.T) {
	svc, _ := newService(t)
	got := serve(t, svc, "/include/ajax.php?service=travel&action=config")
	// 与 canary PHP 实测（2026-11-27 curl）逐字段对齐；logoUrl/channelDomain 依赖
	// fburl resolver，compare L2 验证。
	if got[:13] != `{"state":100,` {
		t.Fatalf("config state 异常: %s", got[:30])
	}
	for _, key := range []string{
		`"channelName":"旅游度假"`, `"subDomain":2`, `"channelSwitch":0`,
		`"closeCause":"站点升级中。。。"`, `"title":"旅游度假"`, `"keywords":"旅游度假"`,
		`"description":"旅游度假描述"`, `"template":"skin2"`, `"touchTemplate":"skin1"`,
		`"map":1`, `"softSize":20480`, `"softType":"zip|gz|rar|iso|doc|xsl|ppt|wps"`,
		`"thumbSize":2048`, `"thumbType":"jpg|jpeg|gif|png|swf"`,
		`"storeatlasMax":9`, `"travelhotelatlasMax":6`, `"travelticketatlasMax":5`,
		`"travelstrategyatlasMax":4`, `"travelrentcaratlasMax":3`, `"travelvisaatlasMax":2`,
		`"travelagencyatlasMax":4`, `"travelTrainCheck":"1"`,
		`"travelTrainTouchUrl":"https://m.ly.com/universal/touch/?refid=15628257#/index"`,
		`"travelTrainPcUrl":null`, `"travelPlaneCheck":"1"`,
		`"travelPlaneTouchUrl":"https://m.ly.com/flightnew?refid=15628257"`,
		`"travelPlanePcUrl":null`,
	} {
		if !contains(got, key) {
			t.Errorf("config 缺字段 %s", key)
		}
	}
}

func contains(s, sub string) bool {
	return len(s) >= len(sub) && (index(s, sub) >= 0)
}

func index(s, sub string) int {
	for i := 0; i+len(sub) <= len(s); i++ {
		if s[i:i+len(sub)] == sub {
			return i
		}
	}
	return -1
}

// —— gettypename / getname：PHP 无参调用致命 → HTTP 500 空 body；Go 复刻空 body ——

func TestGettypenameGetnameEmptyBody(t *testing.T) {
	svc, _ := newService(t)
	for _, action := range []string{"gettypename", "getname"} {
		got := serve(t, svc, "/include/ajax.php?service=travel&action="+action)
		if got != "" {
			t.Fatalf("%s 应为空 body（PHP 致命 500），got %q", action, got)
		}
	}
}

// value=1 + 表缺失：PHP foreach 遍历 getTypeList 错误数组，把 info 文案切成非法
// UTF-8 单字节 → json_encode 失败 → 空 body（HTTP 200）。Go 复刻空 body。
func TestTypeListValueParamErrorQuirk(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery("SELECT * FROM `huoniao_travel_rentcartype` WHERE `parentid` = 5 ORDER BY `weight` LIMIT 0, 1000").
		WillReturnError(sql.ErrConnDone)
	got := serve(t, svc, "/include/ajax.php?service=travel&action=rentcartype&type=5&value=1&son=1")
	if got != "" {
		t.Fatalf("value=1 错误路径应为空 body，got %q", got)
	}
}

// —— codex P2 修复回归 ——

// P2-3：phpInt 应复刻 PHP 7.4 (int) 全语义（整体数字串含科学计数法完整转换，
// 否则前缀截断；docker php7.4 实测口径）。
func TestPhpIntFullSemantics(t *testing.T) {
	cases := map[string]int{
		"1e2": 100, "1e2abc": 100, "12abc": 12, "abc": 0, "": 0,
		"1.9": 1, "-3": -3, "  5 ": 5, "0x1A": 0, "1e20": 9223372036854775807,
		"9223372036854775807": 9223372036854775807,
	}
	for in, want := range cases {
		if got := phpInt(in); got != want {
			t.Fatalf("phpInt(%q) = %d, want %d", in, got, want)
		}
	}
}

// P2-4：value=1 错误路径带 callback → PHP 输出 cb()（json_encode(false) 拼接为空串）。
func TestTypeListValueParamErrorQuirkWithCallback(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery("SELECT * FROM `huoniao_travel_rentcartype` WHERE `parentid` = 5 ORDER BY `weight` LIMIT 0, 1000").
		WillReturnError(sql.ErrConnDone)
	got := serve(t, svc, "/include/ajax.php?service=travel&action=rentcartype&type=5&value=1&callback=cb")
	if got != "cb()" {
		t.Fatalf("value=1 + callback 应输出 cb()，got %q", got)
	}
}

// P2-5：countrytype hot="0" 走 PHP empty() 语义 → 不加 hot 过滤；typeid="0" 保持
// != '' 语义 → 仍加过滤。
func TestCountrytypeEmptySemantics(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery("SELECT COUNT(`id`) total FROM `huoniao_travel_visacountrytype` WHERE 1 = 1").
		WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("0"))
	got := serve(t, svc, "/include/ajax.php?service=travel&action=countrytype&hot=0&continent=0")
	if got != `{"state":101,"info":"暂无数据！"}` {
		t.Fatalf("hot=0&continent=0 应跳过过滤（empty 语义），got %s", got)
	}

	mock.ExpectQuery("SELECT COUNT(`id`) total FROM `huoniao_travel_visacountrytype` WHERE 1 = 1 AND `typeid` = '0' or `typeid` = 2").
		WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("0"))
	got = serve(t, svc, "/include/ajax.php?service=travel&action=countrytype&typeid=0")
	if got != `{"state":101,"info":"暂无数据！"}` {
		t.Fatalf("typeid=0 应保持 != '' 过滤，got %s", got)
	}
}

// P2-1：pageinfo 数字化——page/pageSize/totalPage 数字、totalCount 字符串
// （PDO emulated prepares 恒字符串，canary 实测 "totalCount":"2"）。
func TestTravelitemPageinfoTypes(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery("SELECT COUNT(`id`) total FROM `huoniao_travelitem` WHERE 1 = 1").
		WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("2"))
	mock.ExpectQuery("SELECT  `id`, `parentid`, `typename`, `weight`, `description`, `pubdate`, `typeid` FROM `huoniao_travelitem` WHERE 1=1  ORDER BY `weight` DESC, `pubdate` DESC, `id` DESC LIMIT 0, 10").
		WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight", "description", "pubdate", "typeid"}).
			AddRow("9001", "0", "测试甲", "5", "desc1", "1700000000", "1"))
	got := serve(t, svc, "/include/ajax.php?service=travel&action=travelitem")
	want := `{"state":100,"info":{"pageInfo":{"page":1,"pageSize":10,"totalPage":1,"totalCount":"2"},` +
		`"list":[{"id":"9001","parentid":"0","typename":"测试甲","weight":"5","pubdate":"1700000000","typeid":"1","typeidname":"原件","description":"desc1"}]}}`
	if got != want {
		t.Fatalf("pageinfo 类型不符\ngot:  %s\nwant: %s", got, want)
	}
}

// P2-5：travelitem aid="0" 是 PHP falsy → 不加过滤。
func TestTravelitemAidZeroSkipsFilter(t *testing.T) {
	svc, mock := newService(t)
	mock.ExpectQuery("SELECT COUNT(`id`) total FROM `huoniao_travelitem` WHERE 1 = 1").
		WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("0"))
	got := serve(t, svc, "/include/ajax.php?service=travel&action=travelitem&aid=0")
	if got != `{"state":101,"info":"暂无数据！"}` {
		t.Fatalf("aid=0 应跳过过滤，got %s", got)
	}
}
