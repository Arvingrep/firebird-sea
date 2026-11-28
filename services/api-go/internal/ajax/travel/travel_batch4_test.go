// travel_batch4_test.go 是 travel 批次4（#373）商家后台写 9 个 action 的 L1 用例：
// 门禁分支（登录 / userType / staff / verifyModuleAuth / 店铺状态）、字段校验、
// 写路径的 SQL 形态（sqlmock 精确匹配）与成功响应包装。写路径仅 L1（#355 口径）。
package travel

import (
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"

	sqlmock "github.com/DATA-DOG/go-sqlmock"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// newOperService 构造带身份与 member.info 桩的服务。info 为 getMemberInfo 的 info
// 投影（userType/is_staff/autharr/companyuid 由用例给定）。
func newOperService(t *testing.T, uid int64, info map[string]any) (*Service, sqlmock.Sqlmock) {
	t.Helper()
	db, mock, err := sqlmock.New(sqlmock.QueryMatcherOption(sqlmock.QueryMatcherEqual))
	if err != nil {
		t.Fatalf("sqlmock: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })
	svc, err := New(Dep{
		DB:          db,
		TablePrefix: "huoniao_",
		MemberDetail: func(req *ajax.Request) ajax.Response {
			return ajax.Response{State: ajax.StateOK, Info: info}
		},
	})
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	if uid > 0 {
		svc.ident = fakeIdentity{uid: uid}
	}
	return svc, mock
}

// serveParams 走真实 Router（GET + url.Values 编码）。
func serveParams(t *testing.T, svc *Service, action string, params url.Values) string {
	t.Helper()
	router := ajax.NewRouter(func(string) {})
	Register(router, svc)
	target := "/include/ajax.php?service=travel&action=" + action
	if enc := params.Encode(); enc != "" {
		target += "&" + enc
	}
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, target, nil))
	return recorder.Body.String()
}

// operInfo 构造 member.info 桩：ut=userType；staff>0 时 is_staff=1、companyuid=staffComp、
// autharr=modules（可含 travel）。
func operInfo(ut int, staff int, staffComp int, authModules ...string) map[string]any {
	m := map[string]any{"id": "5", "userType": ut, "is_staff": staff, "companyuid": staffComp}
	if staff == 1 && len(authModules) > 0 {
		arr := []any{}
		for _, v := range authModules {
			arr = append(arr, v)
		}
		m["autharr"] = map[string]any{"travel": arr}
	} else {
		m["autharr"] = []any{}
	}
	return m
}

// —— 门禁矩阵 ——

func TestOperLoginTimeout(t *testing.T) {
	svc, _ := newOperService(t, 0, operInfo(1, 0, 0))
	for _, action := range []string{"storeConfig", "storeConfigModule", "operHotel", "operTicket",
		"operRentcar", "operVisa", "operAgency", "operVideo", "operStrategy"} {
		got := serveParams(t, svc, action, url.Values{})
		want := `{"state":101,"info":"登录超时，请重新登录！"}`
		if got != want {
			t.Errorf("%s 未登录 = %s, want %s", action, got, want)
		}
	}
}

func TestStoreConfigUserTypeError(t *testing.T) {
	svc, _ := newOperService(t, 5, operInfo(1, 0, 0))
	got := serveParams(t, svc, "storeConfig", url.Values{})
	if got != `{"state":101,"info":"账号验证错误，操作失败"}` {
		t.Fatalf("普通会员 = %s", got)
	}
}

func TestStoreConfigMerchantVerifyModuleAuthAlwaysFalse(t *testing.T) {
	// userType=2：verifyModuleAuth('travel') 运行期恒 false（cfg_BusinessJoinConfig 被注释）
	// → 200 商家权限验证失败 → 101。
	svc, _ := newOperService(t, 5, operInfo(2, 0, 0))
	got := serveParams(t, svc, "storeConfig", url.Values{})
	if got != `{"state":101,"info":"商家权限验证失败"}` {
		t.Fatalf("商家 = %s", got)
	}
}

func TestOperStaffNoAuthRejected(t *testing.T) {
	svc, _ := newOperService(t, 5, operInfo(1, 1, 9))
	got := serveParams(t, svc, "operHotel", url.Values{})
	if got != `{"state":101,"info":"商家权限验证失败！"}` {
		t.Fatalf("staff 无权限 = %s", got)
	}
}

// —— storeConfig / storeConfigModule ——

func TestStoreConfigInsertSuccess(t *testing.T) {
	svc, mock := newOperService(t, 5, operInfo(1, 1, 5, "1"))
	mock.ExpectQuery("SELECT `id` FROM `huoniao_travel_store` WHERE `userid` = ?").
		WillReturnRows(sqlmock.NewRows([]string{"id"}))
	mock.ExpectExec("INSERT INTO `huoniao_travel_store` (`cityid`, `title`, `userid`, `addrid`, `address`, `tel`, `contact`, `pics`, `video`, `note`, `pubdate`, `bind_module`, `license`, `servicetime`, `state`, `date`, `openStart`, `openEnd`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '0', ?, ?, ?)").
		WillReturnResult(sqlmock.NewResult(9, 1))
	mock.ExpectExec("UPDATE `huoniao_travel_video` SET `usertype` = 1, `userid` = ? WHERE `userid` = ?").
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec("UPDATE `huoniao_travel_strategy` SET `usertype` = 1, `userid` = ? WHERE `userid` = ?").
		WillReturnResult(sqlmock.NewResult(0, 1))
	got := serveParams(t, svc, "storeConfig", url.Values{
		"title": {"测试酒店"}, "cityid": {"2"}, "tel": {"13800000000"},
		"contact": {"张三"}, "pics": {"/a.jpg"}, "addrid": {"3"},
	})
	if got != `{"state":100,"info":"配置成功，您的商铺正在审核中，请耐心等待！"}` {
		t.Fatalf("新商铺 = %s", got)
	}
}

func TestStoreConfigUpdateSuccess(t *testing.T) {
	svc, mock := newOperService(t, 5, operInfo(1, 1, 5, "1"))
	mock.ExpectQuery("SELECT `id` FROM `huoniao_travel_store` WHERE `userid` = ?").
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(7))
	mock.ExpectExec("UPDATE `huoniao_travel_store` SET `cityid` = ?, `title` = ?, `userid` = ?, `addrid` = ?, `address` = ?, `tel` = ?, `contact` = ?, `pics` = ?, `video` = ?, `note` = ?, `bind_module` = ?, `license` = ?, `servicetime` = ?, `state` = '0', `date` = ?, `openStart` = ?, `openEnd` = ? WHERE `userid` = ?").
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec("UPDATE `huoniao_travel_video` SET `usertype` = 1, `userid` = ? WHERE `userid` = ?").
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec("UPDATE `huoniao_travel_strategy` SET `usertype` = 1, `userid` = ? WHERE `userid` = ?").
		WillReturnResult(sqlmock.NewResult(0, 1))
	got := serveParams(t, svc, "storeConfig", url.Values{
		"title": {"测试酒店"}, "cityid": {"2"}, "tel": {"13800000000"},
		"contact": {"张三"}, "pics": {"/a.jpg"},
	})
	if got != `{"state":100,"info":"保存成功！"}` {
		t.Fatalf("已有商铺 = %s", got)
	}
}

func TestStoreConfigFieldValidations(t *testing.T) {
	cases := []struct {
		name, want string
		params     url.Values
	}{
		{"缺cityid", "请选择所在地区", url.Values{"title": {"x"}, "tel": {"1"}, "contact": {"c"}, "pics": {"p"}}},
		{"缺tel", "请填写联系方式", url.Values{"title": {"x"}, "cityid": {"1"}, "contact": {"c"}, "pics": {"p"}}},
		{"缺contact", "请填写联系人", url.Values{"title": {"x"}, "cityid": {"1"}, "tel": {"1"}, "pics": {"p"}}},
		{"缺pics", "请上传图集", url.Values{"title": {"x"}, "cityid": {"1"}, "tel": {"1"}, "contact": {"c"}}},
	}
	for _, tc := range cases {
		svc, _ := newOperService(t, 5, operInfo(1, 1, 5, "1"))
		got := serveParams(t, svc, "storeConfig", tc.params)
		want := `{"state":101,"info":"` + tc.want + `"}`
		if got != want {
			t.Errorf("%s = %s, want %s", tc.name, got, want)
		}
	}
}

func TestStoreConfigModuleGateAndSave(t *testing.T) {
	// store 不存在 → 200「还未开通旅游店铺…」→ 101。
	svc, mock := newOperService(t, 5, operInfo(1, 1, 5, "1"))
	mock.ExpectQuery("SELECT `id`, `title` FROM `huoniao_travel_store` WHERE `userid` = ?").
		WillReturnRows(sqlmock.NewRows([]string{"id", "title"}))
	got := serveParams(t, svc, "storeConfigModule", url.Values{"bind_module": {"hotel"}})
	if got != `{"state":101,"info":"还未开通旅游店铺，请开通后再操作~"}` {
		t.Fatalf("无店 = %s", got)
	}

	// 成功 → 100 保存成功！
	svc2, mock2 := newOperService(t, 5, operInfo(1, 1, 5, "1"))
	mock2.ExpectQuery("SELECT `id`, `title` FROM `huoniao_travel_store` WHERE `userid` = ?").
		WillReturnRows(sqlmock.NewRows([]string{"id", "title"}).AddRow(7, "测试酒店"))
	mock2.ExpectExec("UPDATE `huoniao_travel_store` SET `bind_module` = ? WHERE `userid` = ?").
		WillReturnResult(sqlmock.NewResult(0, 1))
	got2 := serveParams(t, svc2, "storeConfigModule", url.Values{"bind_module": {"hotel,ticket"}})
	if got2 != `{"state":100,"info":"保存成功！"}` {
		t.Fatalf("保存 = %s", got2)
	}
}

// —— operHotel ——

const (
	qStoreGate       = "SELECT `id`, `state` FROM `huoniao_travel_store` WHERE `userid` = ?"
	qHotelExist      = "SELECT l.`id` FROM `huoniao_travel_hotel` l LEFT JOIN `huoniao_travel_store` s ON s.`id` = l.`company` WHERE l.`id` = ?"
	qHotelDelSel     = "SELECT l.`id`, l.`title`, l.`pics`, l.`video`, s.`userid` FROM `huoniao_travel_hotel` l LEFT JOIN `huoniao_travel_store` s ON s.`id` = l.`company` WHERE l.`id` = ?"
	qHotelInsert     = "INSERT INTO `huoniao_travel_hotel` (`userid`, `company`, `title`, `cityid`, `typeid`, `addrid`, `address`, `pics`, `video`, `price`, `tag`, `pubdate`, `state`, `factag`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
	qHotelUpdate     = "UPDATE `huoniao_travel_hotel` SET `userid` = ?, `company` = ?, `title` = ?, `cityid` = ?, `typeid` = ?, `addrid` = ?, `address` = ?, `pics` = ?, `video` = ?, `price` = ?, `tag` = ?, `factag` = ?, `state` = ? WHERE `id` = ?"
	qHotelRoomIns    = "INSERT INTO `huoniao_travel_hotelroom` (`title`, `hotelid`, `area`, `iswindow`, `typeid`, `breakfast`, `price`, `specialtime`, `pubdate`, `pics`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
	qHotelRoomUpd    = "UPDATE `huoniao_travel_hotelroom` SET `title` = ?, `hotelid` = ?, `area` = ?, `iswindow` = ?, `typeid` = ?, `breakfast` = ?, `price` = ?, `specialtime` = ?, `pics` = ? WHERE `id` = ?"
	qHotelRoomUpdIns = "INSERT INTO `huoniao_travel_hotelroom` (`title`, `hotelid`, `area`, `iswindow`, `typeid`, `breakfast`, `price`, `specialtime`, `pics`, `pubdate`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
	qHotelRoomDel    = "DELETE FROM `huoniao_travel_hotelroom` WHERE `hotelid` = ?"
	qHotelDel        = "DELETE FROM `huoniao_travel_hotel` WHERE `id` = ?"
)

// expectStoreOK 起一个店铺门禁通过的期望链（state=1、storeid=7）。
func expectStoreOK(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(qStoreGate).
		WillReturnRows(sqlmock.NewRows([]string{"id", "state"}).AddRow(7, "1"))
}

func expectStoreState(mock sqlmock.Sqlmock, state string) {
	mock.ExpectQuery(qStoreGate).
		WillReturnRows(sqlmock.NewRows([]string{"id", "state"}).AddRow(7, state))
}

func TestOperHotelStoreGates(t *testing.T) {
	// 无店 → 200 [12][28] → 101。
	svc, mock := newOperService(t, 5, operInfo(1, 0, 0))
	mock.ExpectQuery(qStoreGate).WillReturnRows(sqlmock.NewRows([]string{"id", "state"}))
	got := serveParams(t, svc, "operHotel", url.Values{"oper": {"add"}})
	if got != `{"state":101,"info":"您还未开通婚嫁公司！"}` {
		t.Fatalf("无店 = %s", got)
	}
	// state=0 / state=2。
	for state, want := range map[string]string{
		"0": "您的公司信息还在审核中，请通过审核后再发布！",
		"2": "您的公司信息审核失败，请通过审核后再发布！",
	} {
		svc2, mock2 := newOperService(t, 5, operInfo(1, 0, 0))
		expectStoreState(mock2, state)
		got2 := serveParams(t, svc2, "operHotel", url.Values{"oper": {"add"}})
		wantJSON := `{"state":101,"info":"` + want + `"}`
		if got2 != wantJSON {
			t.Errorf("state=%s = %s, want %s", state, got2, wantJSON)
		}
	}
}

func TestOperHotelValidations(t *testing.T) {
	cases := []struct {
		name, want string
		params     url.Values
	}{
		{"缺title", "请输入公司名称！", url.Values{"oper": {"add"}, "addrid": {"1"}, "pics": {"/a.jpg"}}},
		{"缺addrid", "请输入所在地区！", url.Values{"oper": {"add"}, "title": {"x"}, "pics": {"/a.jpg"}}},
		{"缺pics", "请上传图片图片", url.Values{"oper": {"add"}, "title": {"x"}, "addrid": {"1"}}},
	}
	for _, tc := range cases {
		svc, mock := newOperService(t, 5, operInfo(1, 0, 0))
		expectStoreOK(mock)
		got := serveParams(t, svc, "operHotel", tc.params)
		want := `{"state":101,"info":"` + tc.want + `"}`
		if got != want {
			t.Errorf("%s = %s, want %s", tc.name, got, want)
		}
	}
	// del 非数值 id → 格式错误。
	svc2, mock2 := newOperService(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock2)
	got2 := serveParams(t, svc2, "operHotel", url.Values{"oper": {"del"}, "id": {"abc"}})
	if got2 != `{"state":101,"info":"格式错误"}` {
		t.Fatalf("del abc = %s", got2)
	}
}

func TestOperHotelAddSuccessWithRooms(t *testing.T) {
	svc, mock := newOperService(t, 5, operInfo(1, 0, 0))
	rooms := `[{"title":"大床房","area":"30","iswindow":"1","typeid":"0","breakfast":"1","price":"199","specialtime":"[{\"date\":\"2025-01-01\",\"price\":\"299\"}]","imgpath":"/r.jpg"}]`
	expectStoreOK(mock)
	mock.ExpectExec(qHotelInsert).WillReturnResult(sqlmock.NewResult(42, 1))
	mock.ExpectExec(qHotelRoomIns).WillReturnResult(sqlmock.NewResult(1, 1))
	got := serveParams(t, svc, "operHotel", url.Values{
		"oper": {"add"}, "title": {"测试酒店"}, "addrid": {"3"}, "pics": {"/a.jpg"},
		"price": {"199.5"}, "roomlist": {rooms},
	})
	want := `{"state":100,"info":"发布成功！"}`
	if got != want {
		t.Fatalf("add = %s\nwant %s", got, want)
	}
}

func TestOperHotelUpdateWithRoomDiff(t *testing.T) {
	svc, mock := newOperService(t, 5, operInfo(1, 0, 0))
	rooms := `[{"id":"3","title":"改房","area":"40","iswindow":"0","typeid":"1","breakfast":"0","price":"399","specialtime":"","imgpath":"/b.jpg"},{"title":"新房","area":"50","iswindow":"1","typeid":"0","breakfast":"1","price":"499","specialtime":"","imgpath":"/c.jpg"}]`
	expectStoreOK(mock)
	mock.ExpectQuery(qHotelExist).
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(11))
	mock.ExpectExec(qHotelUpdate).WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(qHotelRoomUpd).WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(qHotelRoomUpdIns).WillReturnResult(sqlmock.NewResult(1, 1))
	got := serveParams(t, svc, "operHotel", url.Values{
		"oper": {"update"}, "id": {"11"}, "title": {"测试酒店"}, "addrid": {"3"},
		"pics": {"/a.jpg"}, "roomlist": {rooms},
	})
	if got != `{"state":100,"info":"修改成功！"}` {
		t.Fatalf("update = %s", got)
	}
}

func TestOperHotelUpdateNonNumericID(t *testing.T) {
	// update 不校验 is_numeric：非数值 id → SQL 错误面 → 200 [12][34] → 101。
	svc, mock := newOperService(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock)
	got := serveParams(t, svc, "operHotel", url.Values{
		"oper": {"update"}, "id": {"abc"}, "title": {"x"}, "addrid": {"1"}, "pics": {"/a.jpg"},
	})
	if got != `{"state":101,"info":"发布到数据时发生错误，请检查字段内容！"}` {
		t.Fatalf("update abc = %s", got)
	}
}

func TestOperHotelDelPaths(t *testing.T) {
	// 成功。
	svc, mock := newOperService(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock)
	mock.ExpectQuery(qHotelDelSel).
		WillReturnRows(sqlmock.NewRows([]string{"id", "title", "pics", "video", "userid"}).
			AddRow(11, "测试酒店", "/a.jpg", "", "5"))
	mock.ExpectExec(qHotelRoomDel).WillReturnResult(sqlmock.NewResult(0, 2))
	mock.ExpectExec(qHotelDel).WillReturnResult(sqlmock.NewResult(0, 1))
	got := serveParams(t, svc, "operHotel", url.Values{"oper": {"del"}, "id": {"11"}})
	if got != `{"state":100,"info":"删除成功！"}` {
		t.Fatalf("del = %s", got)
	}
	// 非本人 → 权限不足。
	svc2, mock2 := newOperService(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock2)
	mock2.ExpectQuery(qHotelDelSel).
		WillReturnRows(sqlmock.NewRows([]string{"id", "title", "pics", "video", "userid"}).
			AddRow(11, "测试酒店", "/a.jpg", "", "99"))
	got2 := serveParams(t, svc2, "operHotel", url.Values{"oper": {"del"}, "id": {"11"}})
	if got2 != `{"state":101,"info":"权限不足，请确认帐户信息后再进行操作！"}` {
		t.Fatalf("del 非本人 = %s", got2)
	}
	// 不存在。
	svc3, mock3 := newOperService(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock3)
	mock3.ExpectQuery(qHotelDelSel).WillReturnRows(sqlmock.NewRows([]string{"id", "title", "pics", "video", "userid"}))
	got3 := serveParams(t, svc3, "operHotel", url.Values{"oper": {"del"}, "id": {"11"}})
	if got3 != `{"state":101,"info":"信息不存在，或已经删除！"}` {
		t.Fatalf("del 不存在 = %s", got3)
	}
}

func TestOperHotelDelHotelRoomAndUnknownOper(t *testing.T) {
	svc, mock := newOperService(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock)
	mock.ExpectQuery("SELECT `title` FROM `huoniao_travel_hotelroom` WHERE `id` = ?").
		WillReturnRows(sqlmock.NewRows([]string{"title"}).AddRow("大床房"))
	mock.ExpectExec("DELETE FROM `huoniao_travel_hotelroom` WHERE `id` = ?").
		WillReturnResult(sqlmock.NewResult(0, 1))
	got := serveParams(t, svc, "operHotel", url.Values{"oper": {"delhotelroom"}, "id": {"3"}})
	if got != `{"state":100,"info":"删除成功！"}` {
		t.Fatalf("delhotelroom = %s", got)
	}

	// oper 不命中 → 102 No data!。
	svc2, mock2 := newOperService(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock2)
	got2 := serveParams(t, svc2, "operHotel", url.Values{"oper": {"view"}})
	if got2 != `{"state":102,"info":"No data!"}` {
		t.Fatalf("未知 oper = %s", got2)
	}
}

// —— operTicket ——

const (
	qTicketExist  = "SELECT l.`id` FROM `huoniao_travel_ticket` l LEFT JOIN `huoniao_travel_store` s ON s.`id` = l.`company` WHERE l.`id` = ?"
	qTicketDelSel = "SELECT l.`id`, l.`title`, l.`pics`, l.`video`, s.`userid` FROM `huoniao_travel_ticket` l LEFT JOIN `huoniao_travel_store` s ON s.`id` = l.`company` WHERE l.`id` = ?"
	qTicketInsert = "INSERT INTO `huoniao_travel_ticket` (`note`, `userid`, `company`, `title`, `cityid`, `opentime`, `addrid`, `address`, `pics`, `video`, `travelname`, `tag`, `pubdate`, `state`, `date`, `openStart`, `openEnd`, `level`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
	qTInfoIns     = "INSERT INTO `huoniao_travel_ticketinfo` (`typeid`, `title`, `ticketid`, `price`, `specialtime`, `pubdate`) VALUES ('0', ?, ?, ?, ?, ?)"
	qTInfoUpd     = "UPDATE `huoniao_travel_ticketinfo` SET `typeid` = '0', `title` = ?, `ticketid` = ?, `price` = ?, `specialtime` = ? WHERE `id` = ?"
	qTInfoNotIn   = "DELETE FROM `huoniao_travel_ticketinfo` WHERE `ticketid` = ? AND `id` NOT IN (3,4)"
	qTInfoDelT0   = "DELETE FROM `huoniao_travel_ticketinfo` WHERE `typeid` = 0 AND `ticketid` = ?"
	qTicketDel    = "DELETE FROM `huoniao_travel_ticket` WHERE `id` = ?"
)

func ticketParams() url.Values {
	return url.Values{
		"oper": {"add"}, "title": {"景点A"}, "address": {"路1号"}, "pics": {"/a.jpg"},
		"body": {"说明"}, "level": {"3"},
		"ticketlist": {`[{"title":"成人票","price":"80","specialtime":""},{"title":"儿童票","price":"40","specialtime":""}]`},
	}
}

func TestOperTicketStaffBeforeUserTypeGate(t *testing.T) {
	// staff 无 autharr：在 userType 门禁与店铺门禁之前就拒绝（顺序与 operHotel 不同）。
	svc, _ := newOperService(t, 5, operInfo(2, 1, 9))
	got := serveParams(t, svc, "operTicket", url.Values{})
	if got != `{"state":101,"info":"商家权限验证失败！"}` {
		t.Fatalf("staff = %s", got)
	}
}

func TestOperTicketAddRequiresTicketlist(t *testing.T) {
	for _, tl := range []string{"", "[]"} {
		svc, mock := newOperService(t, 5, operInfo(1, 0, 0))
		expectStoreOK(mock)
		p := ticketParams()
		p.Set("ticketlist", tl)
		got := serveParams(t, svc, "operTicket", p)
		if got != `{"state":101,"info":"请填写门票信息！"}` {
			t.Fatalf("ticketlist=%q = %s", tl, got)
		}
	}
}

func TestOperTicketAddSuccessReturnsAid(t *testing.T) {
	svc, mock := newOperService(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock)
	mock.ExpectExec(qTicketInsert).WillReturnResult(sqlmock.NewResult(31, 1))
	mock.ExpectExec(qTInfoIns).WillReturnResult(sqlmock.NewResult(1, 1))
	mock.ExpectExec(qTInfoIns).WillReturnResult(sqlmock.NewResult(2, 1))
	got := serveParams(t, svc, "operTicket", ticketParams())
	if got != `{"state":100,"info":31}` {
		t.Fatalf("add = %s", got)
	}
}

func TestOperTicketUpdateNotidDiff(t *testing.T) {
	svc, mock := newOperService(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock)
	mock.ExpectQuery(qTicketExist).WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(31))
	mock.ExpectExec("UPDATE `huoniao_travel_ticket` SET `note` = ?, `userid` = ?, `company` = ?, `title` = ?, `cityid` = ?, `opentime` = ?, `addrid` = ?, `address` = ?, `pics` = ?, `video` = ?, `travelname` = ?, `tag` = ?, `state` = ?, `date` = ?, `openStart` = ?, `openEnd` = ?, `level` = ? WHERE `id` = ?").
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(qTInfoUpd).WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(qTInfoIns).WillReturnResult(sqlmock.NewResult(4, 1))
	mock.ExpectExec(qTInfoNotIn).WillReturnResult(sqlmock.NewResult(0, 1))
	p := ticketParams()
	p.Set("oper", "update")
	p.Set("id", "31")
	p.Set("ticketlist", `[{"id":"3","title":"成人票","price":"80","specialtime":""},{"title":"儿童票","price":"40","specialtime":""}]`)
	got := serveParams(t, svc, "operTicket", p)
	if got != `{"state":100,"info":"修改成功！"}` {
		t.Fatalf("update = %s", got)
	}
}

func TestOperTicketDelSuccess(t *testing.T) {
	svc, mock := newOperService(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock)
	mock.ExpectQuery(qTicketDelSel).
		WillReturnRows(sqlmock.NewRows([]string{"id", "title", "pics", "video", "userid"}).
			AddRow(31, "景点A", "/a.jpg", "", "5"))
	mock.ExpectExec(qTInfoDelT0).WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(qTicketDel).WillReturnResult(sqlmock.NewResult(0, 1))
	got := serveParams(t, svc, "operTicket", url.Values{"oper": {"del"}, "id": {"31"}})
	if got != `{"state":100,"info":"删除成功！"}` {
		t.Fatalf("del = %s", got)
	}
}

// —— operRentcar / operVisa ——

func TestOperRentcarPriceZeroRejected(t *testing.T) {
	// PHP 7.4 `$price == ''`：'' → 0，price=0 命中校验。
	svc, mock := newOperService(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock)
	got := serveParams(t, svc, "operRentcar", url.Values{
		"oper": {"add"}, "title": {"商务车"}, "typeid": {"1"}, "address": {"路1"}, "pics": {"/a.jpg"},
	})
	if got != `{"state":101,"info":"请输入租金"}` {
		t.Fatalf("price=0 = %s", got)
	}
}

func TestOperRentcarAddSuccessReturnsAid(t *testing.T) {
	svc, mock := newOperService(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock)
	mock.ExpectExec("INSERT INTO `huoniao_travel_rentcar` (`typeid`, `userid`, `company`, `title`, `cityid`, `addrid`, `address`, `pics`, `video`, `price`, `tag`, `pubdate`, `state`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").
		WillReturnResult(sqlmock.NewResult(55, 1))
	got := serveParams(t, svc, "operRentcar", url.Values{
		"oper": {"add"}, "title": {"商务车"}, "typeid": {"1"}, "address": {"路1"},
		"pics": {"/a.jpg"}, "price": {"300.5"},
	})
	if got != `{"state":100,"info":55}` {
		t.Fatalf("add = %s", got)
	}
}

func TestOperVisaEarliestdateInvalid(t *testing.T) {
	svc, mock := newOperService(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock)
	got := serveParams(t, svc, "operVisa", url.Values{
		"oper": {"add"}, "title": {"日本签"}, "scope": {"单次"}, "serviceincludes": {"含"},
		"country": {"3"}, "typeid": {"1"}, "price": {"500"}, "entrytimes": {"1"},
		"staytimes": {"15"}, "earliestdate": {"不是日期"}, "valid": {"90"},
		"processingtime": {"7"}, "pics": {"/a.jpg"},
	})
	if got != `{"state":101,"info":"请选择最早可预订时间"}` {
		t.Fatalf("earliestdate = %s", got)
	}
}

func TestOperVisaAddSuccessReturnsAid(t *testing.T) {
	svc, mock := newOperService(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock)
	mock.ExpectExec("INSERT INTO `huoniao_travel_visa` (`userid`, `company`, `title`, `subtitle`, `country`, `typeid`, `price`, `entrytimes`, `staytimes`, `earliestdate`, `valid`, `processingtime`, `pics`, `video`, `scope`, `materials`, `serviceincludes`, `incumbentsscience`, `retireescience`, `professionalscience`, `studentsscience`, `childrenscience`, `others`, `reminder`, `notice`, `processingflow`, `pubdate`, `state`, `note`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").
		WillReturnResult(sqlmock.NewResult(66, 1))
	got := serveParams(t, svc, "operVisa", url.Values{
		"oper": {"add"}, "title": {"日本签"}, "scope": {"单次"}, "serviceincludes": {"含"},
		"country": {"3"}, "typeid": {"1"}, "price": {"500"}, "entrytimes": {"1"},
		"staytimes": {"15"}, "earliestdate": {"2026-01-15"}, "valid": {"90"},
		"processingtime": {"7"}, "pics": {"/a.jpg"}, "note": {"备注"}, "subtitle": {"副"},
	})
	if got != `{"state":100,"info":66}` {
		t.Fatalf("add = %s", got)
	}
}

// —— operAgency ——

const (
	qAgencyExist  = "SELECT l.`id`, l.`level` FROM `huoniao_travel_agency` l LEFT JOIN `huoniao_travel_store` s ON s.`id` = l.`company` WHERE l.`id` = ?"
	qAgencyDelSel = "SELECT l.`id`, l.`title`, l.`pics`, l.`video`, l.`imglist`, s.`userid` FROM `huoniao_travel_agency` l LEFT JOIN `huoniao_travel_store` s ON s.`id` = l.`company` WHERE l.`id` = ?"
	qAgencyInsert = "INSERT INTO `huoniao_travel_agency` (`tag`, `imglist`, `userid`, `company`, `title`, `typeid`, `cityid`, `addrid`, `address`, `missiontype`, `missiontime`, `pics`, `video`, `travelservice`, `note`, `itinerary`, `expense`, `instructions`, `pubdate`, `state`, `level`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
	qAInfoIns     = "INSERT INTO `huoniao_travel_ticketinfo` (`typeid`, `title`, `ticketid`, `price`, `specialtime`, `pubdate`, `weight`) VALUES ('1', ?, ?, ?, ?, ?, ?)"
	qAInfoInsID   = "INSERT INTO `huoniao_travel_ticketinfo` (`id`, `typeid`, `title`, `ticketid`, `price`, `specialtime`, `pubdate`, `weight`) VALUES (?, '1', ?, ?, ?, ?, ?, ?)"
	qAInfoDelAll  = "DELETE FROM `huoniao_travel_ticketinfo` WHERE `ticketid` = ?"
	qAInfoDelT1   = "DELETE FROM `huoniao_travel_ticketinfo` WHERE `typeid` = 1 AND `ticketid` = ?"
	qAgencyDel    = "DELETE FROM `huoniao_travel_agency` WHERE `id` = ?"
)

func TestOperAgencyTypeidEmptyStringGate(t *testing.T) {
	// typeid 不做 (int)：`$typeid == ''` 仅空串命中；'0' 放行（会命中下一个校验）。
	svc, mock := newOperService(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock)
	got := serveParams(t, svc, "operAgency", url.Values{
		"oper": {"add"}, "title": {"周边游"}, "addrid": {"1"}, "address": {"路"}, "pics": {"/a.jpg"},
	})
	if got != `{"state":101,"info":"请选择旅游类型"}` {
		t.Fatalf("typeid 缺 = %s", got)
	}
	svc2, mock2 := newOperService(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock2)
	// typeid='0' 放行 → 走到 add 分支（typeid=0 照插入）。
	mock2.ExpectExec(qAgencyInsert).WillReturnResult(sqlmock.NewResult(22, 1))
	got2 := serveParams(t, svc2, "operAgency", url.Values{
		"oper": {"add"}, "title": {"周边游"}, "typeid": {"0"}, "addrid": {"1"}, "address": {"路"}, "pics": {"/a.jpg"},
	})
	if got2 != `{"state":100,"info":22}` {
		t.Fatalf("typeid=0 = %s", got2)
	}
}

func TestOperAgencyAddReversedWeights(t *testing.T) {
	// ticketlist 反转后按反转下标写 weight：两条 → 首条 weight=1、次条 weight=0。
	svc, mock := newOperService(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock)
	mock.ExpectExec(qAgencyInsert).WillReturnResult(sqlmock.NewResult(21, 1))
	mock.ExpectExec(qAInfoIns).WillReturnResult(sqlmock.NewResult(1, 1)) // 第二天 weight=0
	mock.ExpectExec(qAInfoIns).WillReturnResult(sqlmock.NewResult(2, 1)) // 第一天 weight=1
	got := serveParams(t, svc, "operAgency", url.Values{
		"oper": {"add"}, "title": {"周边游"}, "typeid": {"1"}, "addrid": {"1"},
		"address": {"路"}, "pics": {"/a.jpg"},
		"ticketlist": {`[{"title":"第一天","price":"100","specialtime":""},{"title":"第二天","price":"200","specialtime":""}]`},
	})
	if got != `{"state":100,"info":21}` {
		t.Fatalf("add = %s", got)
	}
}

func TestOperAgencyUpdateReinsertWithID(t *testing.T) {
	svc, mock := newOperService(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock)
	mock.ExpectQuery(qAgencyExist).
		WillReturnRows(sqlmock.NewRows([]string{"id", "level"}).AddRow(21, "4"))
	mock.ExpectExec("UPDATE `huoniao_travel_agency` SET `tag` = ?, `imglist` = ?, `userid` = ?, `company` = ?, `title` = ?, `typeid` = ?, `cityid` = ?, `addrid` = ?, `address` = ?, `missiontime` = ?, `missiontype` = ?, `pics` = ?, `video` = ?, `travelservice` = ?, `note` = ?, `itinerary` = ?, `expense` = ?, `instructions` = ?, `state` = ?, `level` = ? WHERE `id` = ?").
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(qAInfoDelAll).WillReturnResult(sqlmock.NewResult(0, 1))
	// 反转序：第二天（无 id → 普通 INSERT，weight=0）→ 第一天（id=9 → 带 id INSERT，weight=1）。
	mock.ExpectExec(qAInfoIns).WillReturnResult(sqlmock.NewResult(10, 1))
	mock.ExpectExec(qAInfoInsID).WillReturnResult(sqlmock.NewResult(9, 1))
	got := serveParams(t, svc, "operAgency", url.Values{
		"oper": {"update"}, "id": {"21"}, "title": {"周边游"}, "typeid": {"1"},
		"addrid": {"1"}, "address": {"路"}, "pics": {"/a.jpg"},
		"ticketlist": {`[{"id":"9","title":"第一天","price":"100","specialtime":""},{"title":"第二天","price":"200","specialtime":""}]`},
	})
	if got != `{"state":100,"info":"修改成功！"}` {
		t.Fatalf("update = %s", got)
	}
}

func TestOperAgencyDelDeletesTypeid1(t *testing.T) {
	svc, mock := newOperService(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock)
	mock.ExpectQuery(qAgencyDelSel).
		WillReturnRows(sqlmock.NewRows([]string{"id", "title", "pics", "video", "imglist", "userid"}).
			AddRow(21, "周边游", "/a.jpg", "", "/b.jpg", "5"))
	mock.ExpectExec(qAInfoDelT1).WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(qAgencyDel).WillReturnResult(sqlmock.NewResult(0, 1))
	got := serveParams(t, svc, "operAgency", url.Values{"oper": {"del"}, "id": {"21"}})
	if got != `{"state":100,"info":"删除成功！"}` {
		t.Fatalf("del = %s", got)
	}
}

// —— operVideo / operStrategy ——

func TestOperVideoAddStoreOwnerAndFallback(t *testing.T) {
	// 店铺存在 → usertype=1、userid=店铺id（7）。
	svc, mock := newOperService(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock)
	mock.ExpectExec("INSERT INTO `huoniao_travel_video` (`usertype`, `userid`, `title`, `litpic`, `video`, `pubdate`, `state`) VALUES (?, ?, ?, ?, ?, ?, ?)").
		WillReturnResult(sqlmock.NewResult(77, 1))
	got := serveParams(t, svc, "operVideo", url.Values{
		"oper": {"add"}, "title": {"视频A"}, "litpic": {"/c.jpg"}, "video": {"/v.mp4"},
	})
	if got != `{"state":100,"info":77}` {
		t.Fatalf("add 有店 = %s", got)
	}

	// 店铺不存在 → usertype=0、userid=会员id（5）→ 同样成功。
	svc2, mock2 := newOperService(t, 5, operInfo(1, 0, 0))
	mock2.ExpectQuery(qStoreGate).WillReturnRows(sqlmock.NewRows([]string{"id", "state"}))
	mock2.ExpectExec("INSERT INTO `huoniao_travel_video` (`usertype`, `userid`, `title`, `litpic`, `video`, `pubdate`, `state`) VALUES (?, ?, ?, ?, ?, ?, ?)").
		WillReturnResult(sqlmock.NewResult(78, 1))
	got2 := serveParams(t, svc2, "operVideo", url.Values{
		"oper": {"add"}, "title": {"视频A"}, "litpic": {"/c.jpg"}, "video": {"/v.mp4"},
	})
	if got2 != `{"state":100,"info":78}` {
		t.Fatalf("add 无店 = %s", got2)
	}
}

func TestOperVideoDelScopedToOwner(t *testing.T) {
	svc, mock := newOperService(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock)
	mock.ExpectQuery("SELECT l.`id`, l.`title`, l.`litpic`, l.`video`, l.`userid` FROM `huoniao_travel_video` l WHERE l.`id` = ? AND l.`userid` = ?").
		WillReturnRows(sqlmock.NewRows([]string{"id", "title", "litpic", "video", "userid"}).
			AddRow(77, "视频A", "/c.jpg", "/v.mp4", "7"))
	mock.ExpectExec("DELETE FROM `huoniao_travel_video` WHERE `id` = ?").
		WillReturnResult(sqlmock.NewResult(0, 1))
	got := serveParams(t, svc, "operVideo", url.Values{"oper": {"del"}, "id": {"77"}})
	if got != `{"state":100,"info":"删除成功！"}` {
		t.Fatalf("del = %s", got)
	}
}

func TestOperStrategyAddAndDel(t *testing.T) {
	svc, mock := newOperService(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock)
	mock.ExpectExec("INSERT INTO `huoniao_travel_strategy` (`typeid`, `usertype`, `userid`, `title`, `litpic`, `pics`, `note`, `pubdate`, `state`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").
		WillReturnResult(sqlmock.NewResult(88, 1))
	got := serveParams(t, svc, "operStrategy", url.Values{
		"oper": {"add"}, "title": {"攻略A"}, "typeid": {"2"}, "pics": {"/a.jpg"}, "note": {"正文"},
	})
	if got != `{"state":100,"info":88}` {
		t.Fatalf("add = %s", got)
	}

	svc2, mock2 := newOperService(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock2)
	mock2.ExpectQuery("SELECT l.`id`, l.`title`, l.`litpic`, l.`pics`, l.`userid` FROM `huoniao_travel_strategy` l WHERE l.`id` = ? AND l.`userid` = ?").
		WillReturnRows(sqlmock.NewRows([]string{"id", "title", "litpic", "pics", "userid"}).
			AddRow(88, "攻略A", "", "/a.jpg", "7"))
	mock2.ExpectExec("DELETE FROM `huoniao_travel_strategy` WHERE `id` = ?").
		WillReturnResult(sqlmock.NewResult(0, 1))
	got2 := serveParams(t, svc2, "operStrategy", url.Values{"oper": {"del"}, "id": {"88"}})
	if got2 != `{"state":100,"info":"删除成功！"}` {
		t.Fatalf("del = %s", got2)
	}
}

// —— memberLog 注入 ——

func TestOperHotelAddWritesMemberLog(t *testing.T) {
	db, mock, err := sqlmock.New(sqlmock.QueryMatcherOption(sqlmock.QueryMatcherEqual))
	if err != nil {
		t.Fatalf("sqlmock: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })
	var gotNote, gotModule, gotTemp, gotAction string
	var gotAid int64
	svc, err := New(Dep{
		DB: db, TablePrefix: "huoniao_",
		MemberDetail: func(req *ajax.Request) ajax.Response {
			return ajax.Response{State: ajax.StateOK, Info: operInfo(1, 0, 0)}
		},
		MemberLog: func(req *http.Request, uid, module, temp string, aid int64,
			action, note, link, sqlText string) {
			gotNote, gotModule, gotTemp, gotAction, gotAid = note, module, temp, action, aid
		},
	})
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	svc.ident = fakeIdentity{uid: 5}

	expectStoreOK(mock)
	mock.ExpectExec(qHotelInsert).WillReturnResult(sqlmock.NewResult(42, 1))
	got := serveParams(t, svc, "operHotel", url.Values{
		"oper": {"add"}, "title": {"测试酒店"}, "addrid": {"3"}, "pics": {"/a.jpg"},
	})
	if got != `{"state":100,"info":"发布成功！"}` {
		t.Fatalf("add = %s", got)
	}
	if gotNote != "开通酒店店铺(测试酒店)" || gotModule != "travel" || gotTemp != "hotel" ||
		gotAction != "insert" || gotAid != 42 {
		t.Fatalf("memberLog = %q/%q/%q/%q/%d", gotNote, gotModule, gotTemp, gotAction, gotAid)
	}
}

// —— phpSerializeValue ——

func TestPHPSerializeValue(t *testing.T) {
	cases := map[string]string{
		phpSerializeValue(nil): "N;",
		phpSerializeValue(jsonDecodeList(`[{"date":"2025-01-01","price":"299"}]`)): `a:1:{i:0;a:2:{s:4:"date";s:10:"2025-01-01";s:5:"price";s:3:"299";}}`,
		phpSerializeValue(jsonDecodeList(``)):                                      "N;", // json_decode("") → null
		phpSerializeValue(jsonDecodeList(`not json`)):                              "N;",
		phpSerializeValue(jsonDecodeList(`{"a":1,"b":[2,3]}`)):                     `a:2:{s:1:"a";i:1;s:1:"b";a:2:{i:0;i:2;i:1;i:3;}}`,
		phpSerializeValue(jsonDecodeList(`[1.5,"x"]`)):                             `a:2:{i:0;d:1.5;i:1;s:1:"x";}`,
		phpSerializeValue(jsonDecodeList(`[2.0]`)):                                 `a:1:{i:0;d:2;}`,
	}
	for got, want := range cases {
		if got != want {
			t.Errorf("serialize = %q, want %q", got, want)
		}
	}
}

// —— 字面量防退化（转义链的入库口径）——

func TestOperFilteredChain(t *testing.T) {
	// title = filter(addslashes(E)) 再剥一层 → filter(E)；E 与原文相同时存原文。
	if got := operFiltered(`测试<b>x</b>`); got != `测试<b>x</b>` {
		t.Errorf("operFiltered = %q", got)
	}
	// 裸字段：E 的 addslashes 层被 INSERT 字面量剥掉 → 存原文。
	if got := operRaw(`a'b`); got != "a'b" {
		t.Errorf("operRaw = %q", got)
	}
	if got := operRaw(`a\'b`); got != "a'b" {
		t.Errorf("operRaw 转义视图 = %q", got)
	}
}
