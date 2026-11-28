// travel_batch4_test.go 是 travel 批次4（#373）商家后台写 9 个 action 的 L1 用例：
// 门禁分支（登录 / userType / staff / verifyModuleAuth / 店铺状态）、字段校验、
// 写路径的 SQL 形态（sqlmock 精确匹配）与成功响应包装。写路径仅 L1（#355 口径）。
package travel

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"errors"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	sqlmock "github.com/DATA-DOG/go-sqlmock"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax/member"
)

// newOperService 构造带身份与 member.info 桩的服务。info 为 getMemberInfo 的 info
// 投影（userType/is_staff/autharr/companyuid 由用例给定）。
func newOperService(t *testing.T, uid int64, info map[string]any) (*Service, sqlmock.Sqlmock) {
	return newOperServiceInfo(t, uid, info)
}

// newOperServiceInfo 同 newOperService，但 info 形态不限（生产路径是 *member.Object）。
func newOperServiceInfo(t *testing.T, uid int64, info any) (*Service, sqlmock.Sqlmock) {
	t.Helper()
	db, mock, err := sqlmock.New(sqlmock.QueryMatcherOption(sqlmock.QueryMatcherEqual))
	if err != nil {
		t.Fatalf("sqlmock: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })
	// 写路径防假绿：测试结束时校验全部期望命中（参数级校验见各 WithArgs）。
	t.Cleanup(func() {
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("expectations not met: %v", err)
		}
	})
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

// —— exec 追踪（防"意外写被执行但错误被 `_, _ =` 吞掉"的假绿）——
// sqlmock 不会把意外调用记成未满足期望：unexpected call 只返回一个错误给调用方，
// 生产代码忽略错误后测试照常通过。因此需要 driver 层记录每条真正到达的语句。

// execRecorder 包装 sqlmock 连接，把每条 Exec/Query 的 SQL 记进 log。
type execRecorder struct {
	inner driver.Conn
	log   *[]string
}

func (r *execRecorder) Prepare(query string) (driver.Stmt, error) { return r.inner.Prepare(query) }
func (r *execRecorder) Close() error                              { return r.inner.Close() }
func (r *execRecorder) Begin() (driver.Tx, error)                 { return r.inner.Begin() }

func (r *execRecorder) ExecContext(ctx context.Context, query string,
	args []driver.NamedValue) (driver.Result, error) {
	*r.log = append(*r.log, query)
	if e, ok := r.inner.(driver.ExecerContext); ok {
		return e.ExecContext(ctx, query, args)
	}
	st, err := r.inner.Prepare(query)
	if err != nil {
		return nil, err
	}
	defer st.Close()
	vals := make([]driver.Value, len(args))
	for i, a := range args {
		vals[i] = a.Value
	}
	return st.Exec(vals)
}

func (r *execRecorder) QueryContext(ctx context.Context, query string,
	args []driver.NamedValue) (driver.Rows, error) {
	*r.log = append(*r.log, query)
	if q, ok := r.inner.(driver.QueryerContext); ok {
		return q.QueryContext(ctx, query, args)
	}
	st, err := r.inner.Prepare(query)
	if err != nil {
		return nil, err
	}
	defer st.Close()
	vals := make([]driver.Value, len(args))
	for i, a := range args {
		vals[i] = a.Value
	}
	return st.Query(vals)
}

// recorderConnector 单连接 connector：所有语句都经 execRecorder。
type recorderConnector struct {
	inner driver.Conn
	log   *[]string
}

type unusedDriver struct{}

func (unusedDriver) Open(string) (driver.Conn, error) { return nil, errors.New("unused") }

func (c *recorderConnector) Connect(context.Context) (driver.Conn, error) {
	return &execRecorder{inner: c.inner, log: c.log}, nil
}
func (c *recorderConnector) Driver() driver.Driver { return unusedDriver{} }

// newOperServiceTracked 同 newOperService，但 DB 经 execRecorder 包装，
// 返回到达 driver 的 SQL 序列（单连接，防池化绕过记录）。
func newOperServiceTracked(t *testing.T, uid int64, info map[string]any) (*Service, sqlmock.Sqlmock, *[]string) {
	t.Helper()
	db, mock, err := sqlmock.New(sqlmock.QueryMatcherOption(sqlmock.QueryMatcherEqual))
	if err != nil {
		t.Fatalf("sqlmock: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })
	t.Cleanup(func() {
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("expectations not met: %v", err)
		}
	})
	inner, ok := mock.(driver.Conn)
	if !ok {
		t.Fatalf("sqlmock 未实现 driver.Conn")
	}
	log := &[]string{}
	svc, err := New(Dep{
		DB: func() *sql.DB {
			d := sql.OpenDB(&recorderConnector{inner: inner, log: log})
			d.SetMaxOpenConns(1)
			return d
		}(),
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
	return svc, mock, log
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
	qVisaInsert      = "INSERT INTO `huoniao_travel_visa` (`userid`, `company`, `title`, `subtitle`, `country`, `typeid`, `price`, `entrytimes`, `staytimes`, `earliestdate`, `valid`, `processingtime`, `pics`, `video`, `scope`, `materials`, `serviceincludes`, `incumbentsscience`, `retireescience`, `professionalscience`, `studentsscience`, `childrenscience`, `others`, `reminder`, `notice`, `processingflow`, `pubdate`, `state`, `note`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
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
	mock.ExpectExec(qHotelRoomIns).WithArgs(
		"大床房", int64(42), "30", "1", "0", "1", "199",
		`a:1:{i:0;a:2:{s:4:"date";s:10:"2025-01-01";s:5:"price";s:3:"299";}}`,
		sqlmock.AnyArg(), "/r.jpg").
		WillReturnResult(sqlmock.NewResult(1, 1))
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
	mock.ExpectExec("UPDATE `huoniao_travel_hotelroom` SET `title` = ?, `hotelid` = ?, `area` = ?, `iswindow` = ?, `typeid` = ?, `breakfast` = ?, `price` = ?, `specialtime` = ?, `pics` = ? WHERE `id` = 3").
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(qHotelRoomUpdIns).WithArgs(
		"新房", int64(11), "50", "1", "0", "1", "499", "N;", "/c.jpg", sqlmock.AnyArg()).
		WillReturnResult(sqlmock.NewResult(1, 1))
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
	qTicketExist   = "SELECT l.`id` FROM `huoniao_travel_ticket` l LEFT JOIN `huoniao_travel_store` s ON s.`id` = l.`company` WHERE l.`id` = ?"
	qTicketDelSel  = "SELECT l.`id`, l.`title`, l.`pics`, l.`video`, s.`userid` FROM `huoniao_travel_ticket` l LEFT JOIN `huoniao_travel_store` s ON s.`id` = l.`company` WHERE l.`id` = ?"
	qTicketInsert  = "INSERT INTO `huoniao_travel_ticket` (`note`, `userid`, `company`, `title`, `cityid`, `opentime`, `addrid`, `address`, `pics`, `video`, `travelname`, `tag`, `pubdate`, `state`, `date`, `openStart`, `openEnd`, `level`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
	qTInfoIns      = "INSERT INTO `huoniao_travel_ticketinfo` (`typeid`, `title`, `ticketid`, `price`, `specialtime`, `pubdate`) VALUES ('0', ?, ?, ?, ?, ?)"
	qTInfoUpd      = "UPDATE `huoniao_travel_ticketinfo` SET `typeid` = '0', `title` = ?, `ticketid` = ?, `price` = ?, `specialtime` = ? WHERE `id` = ?"
	qTInfoUpd3     = "UPDATE `huoniao_travel_ticketinfo` SET `typeid` = '0', `title` = ?, `ticketid` = ?, `price` = ?, `specialtime` = ? WHERE `id` = 3"
	qTInfoUpd35    = "UPDATE `huoniao_travel_ticketinfo` SET `typeid` = '0', `title` = ?, `ticketid` = ?, `price` = ?, `specialtime` = ? WHERE `id` = 3.5"
	qTInfoUpdArith = "UPDATE `huoniao_travel_ticketinfo` SET `typeid` = '0', `title` = ?, `ticketid` = ?, `price` = ?, `specialtime` = ? WHERE `id` = 3+0"
	qTInfoNotIn    = "DELETE FROM `huoniao_travel_ticketinfo` WHERE `ticketid` = ? AND `id` NOT IN (3,4)"
	qTInfoDelT0    = "DELETE FROM `huoniao_travel_ticketinfo` WHERE `typeid` = 0 AND `ticketid` = ?"
	qTicketDel     = "DELETE FROM `huoniao_travel_ticket` WHERE `id` = ?"
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
	mock.ExpectExec(qTInfoIns).WithArgs("成人票", int64(31), "80", "N;", sqlmock.AnyArg()).
		WillReturnResult(sqlmock.NewResult(1, 1))
	mock.ExpectExec(qTInfoIns).WithArgs("儿童票", int64(31), "40", "N;", sqlmock.AnyArg()).
		WillReturnResult(sqlmock.NewResult(2, 1))
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
	mock.ExpectExec(qTInfoUpd3).WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(qTInfoIns).WithArgs("儿童票", int64(31), "40", "N;", sqlmock.AnyArg()).
		WillReturnResult(sqlmock.NewResult(4, 1))
	mock.ExpectExec(qTInfoNotIn).WithArgs(int64(31)).WillReturnResult(sqlmock.NewResult(0, 1))
	p := ticketParams()
	p.Set("oper", "update")
	p.Set("id", "31")
	p.Set("ticketlist", `[{"id":"3","title":"成人票","price":"80","specialtime":""},{"title":"儿童票","price":"40","specialtime":""}]`)
	got := serveParams(t, svc, "operTicket", p)
	if got != `{"state":100,"info":"修改成功！"}` {
		t.Fatalf("update = %s", got)
	}
}

func TestOperTicketElementID34UpdateSkippedDeleteStillRuns(t *testing.T) {
	// 元素 id="3,4"：UPDATE 的 WHERE `id` = 3,4 裸拼报 SQL 错（dsqlOper 吞掉，
	// 行不更新），但 notid 仍追加原值 → join 出 NOT IN (3,4,5) 是合法 SQL →
	// DELETE 照删（PHP 逐段数值字面量判定，区别于"错误串混入整条非法"）。
	svc, mock, log := newOperServiceTracked(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock)
	mock.ExpectQuery(qTicketExist).WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(31))
	mock.ExpectExec("UPDATE `huoniao_travel_ticket` SET `note` = ?, `userid` = ?, `company` = ?, `title` = ?, `cityid` = ?, `opentime` = ?, `addrid` = ?, `address` = ?, `pics` = ?, `video` = ?, `travelname` = ?, `tag` = ?, `state` = ?, `date` = ?, `openStart` = ?, `openEnd` = ?, `level` = ? WHERE `id` = ?").
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(qTInfoIns).WithArgs("儿童票", int64(31), "40", "N;", sqlmock.AnyArg()).
		WillReturnResult(sqlmock.NewResult(5, 1))
	mock.ExpectExec("DELETE FROM `huoniao_travel_ticketinfo` WHERE `ticketid` = ? AND `id` NOT IN (3,4,5)").
		WithArgs(int64(31)).WillReturnResult(sqlmock.NewResult(0, 1))
	p := ticketParams()
	p.Set("oper", "update")
	p.Set("id", "31")
	p.Set("ticketlist", `[{"id":"3,4","title":"成人票","price":"80","specialtime":""},{"title":"儿童票","price":"40","specialtime":""}]`)
	got := serveParams(t, svc, "operTicket", p)
	if got != `{"state":100,"info":"修改成功！"}` {
		t.Fatalf("element 3,4 = %s", got)
	}
	// 非数值 id 的 ticketinfo UPDATE 不应到达 driver。
	for _, q := range *log {
		if strings.HasPrefix(q, "UPDATE `huoniao_travel_ticketinfo`") {
			t.Errorf("id=3,4 的 UPDATE 不应执行（裸拼 SQL 错误面），实际执行了: %s", q)
		}
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
	// PHP GetMkTime("不是日期")：非数字 → mktime(0,0,0,1,1,0) 的年份映射 0→2000
	// → 946656000（实测 docker PHP 7.4），empty 检查通过 → 走到 INSERT。
	// mock 未配 INSERT 期望 → exec 报错 → [12][34]。
	svc, mock := newOperService(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock)
	got := serveParams(t, svc, "operVisa", url.Values{
		"oper": {"add"}, "title": {"日本签"}, "scope": {"单次"}, "serviceincludes": {"含"},
		"country": {"3"}, "typeid": {"1"}, "price": {"500"}, "entrytimes": {"1"},
		"staytimes": {"15"}, "earliestdate": {"不是日期"}, "valid": {"90"},
		"processingtime": {"7"}, "pics": {"/a.jpg"},
	})
	if got != `{"state":101,"info":"发布到数据时发生错误，请检查字段内容！"}` {
		t.Fatalf("earliestdate = %s", got)
	}
}

func TestGetMkTime(t *testing.T) {
	// 期望值全部来自 docker firebird-php（PHP 7.4.33）实测 GetMkTime。
	// 返回形态与 PHP 一致：纯数字（含空串）原样透传字符串，其余为 mktime 结果串。
	cases := map[string]string{
		"1768435200":    "1768435200", // 纯数字原样透传
		"00":            "00",         // "00" 不是 PHP empty → 校验放行，落列转 0
		"0001":          "0001",       // 同上，落列转 1
		"0":             "0",          // empty("0") → 校验拦截
		"":              "",           // 空串也走纯数字透传 → empty → 校验拦截
		"2026-01-15":    "1768406400", // 2026-01-15 00:00 UTC+8
		"2026-1-5 8:30": "1767573000", // 2026-01-05 08:30 UTC+8
		"不是日期":          "946656000",  // 年份 0 → 2000 映射
		"abc":           "946656000",  // 同上
	}
	for in, want := range cases {
		if got := getMkTime(in); got != want {
			t.Errorf("getMkTime(%q) = %q, want %q", in, got, want)
		}
	}
}

func TestMysqlNumericExpr(t *testing.T) {
	// 裸拼元素 id 的白名单：数值表达式（3、3.5、3+0、.5e1、括号/乘除加减）内嵌原文
	// 交 MySQL 求值；白名单外整条报 SQL 错误。不做 float64 求值——精确整数算术
	// （9007199254740993-9007199254740992+3=4）与高精度除法（1/3*3=0.9999…）只有
	// MySQL 自身能复现，Go 侧只保证「同一表达式文本、同一语句」。
	ok := []string{"3", "3.5", "3+0", "(3+0)*2", "1e0", "1+2*3", " 4 ", "-3", ".5", "3.", "1.2E+3", ".5e1", "3.5e-2", "9007199254740993-9007199254740992+3", "1/3*3"}
	bad := []string{"", "3;DROP", "3' ", "OR 1=1", "3)", "(3", "3+", "abc", "3 4", "1;2"}
	for _, in := range ok {
		if !mysqlNumericExpr(in) {
			t.Errorf("mysqlNumericExpr(%q) = false, want true", in)
		}
	}
	for _, in := range bad {
		if mysqlNumericExpr(in) {
			t.Errorf("mysqlNumericExpr(%q) = true, want false", in)
		}
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
	mock.ExpectExec(qAInfoIns).WithArgs("第二天", int64(21), "200", "N;", sqlmock.AnyArg(), "0").
		WillReturnResult(sqlmock.NewResult(1, 1))
	mock.ExpectExec(qAInfoIns).WithArgs("第一天", int64(21), "100", "N;", sqlmock.AnyArg(), "1").
		WillReturnResult(sqlmock.NewResult(2, 1))
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
	mock.ExpectExec(qAInfoDelAll).WithArgs(int64(21)).WillReturnResult(sqlmock.NewResult(0, 1))
	// 反转序：第二天（无 id → 普通 INSERT，weight=0）→ 第一天（id=9 → 带 id INSERT，weight=1）。
	mock.ExpectExec(qAInfoIns).WithArgs("第二天", int64(21), "200", "N;", sqlmock.AnyArg(), "0").
		WillReturnResult(sqlmock.NewResult(10, 1))
	// id 是带引号的字符串字面量（VALUES ('9')）→ 绑定原串，MySQL 列转 int 收 9。
	mock.ExpectExec(qAInfoInsID).WithArgs("9", "第一天", int64(21), "100", "N;", sqlmock.AnyArg(), "1").
		WillReturnResult(sqlmock.NewResult(9, 1))
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
		WithArgs(int64(1), int64(7), "视频A", "/c.jpg", "/v.mp4", sqlmock.AnyArg(), sqlmock.AnyArg()).
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
		WithArgs(int64(0), int64(5), "视频A", "/c.jpg", "/v.mp4", sqlmock.AnyArg(), sqlmock.AnyArg()).
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
		WithArgs(int64(77)).WillReturnResult(sqlmock.NewResult(0, 1))
	got := serveParams(t, svc, "operVideo", url.Values{"oper": {"del"}, "id": {"77"}})
	if got != `{"state":100,"info":"删除成功！"}` {
		t.Fatalf("del = %s", got)
	}
}

func TestOperStrategyAddAndDel(t *testing.T) {
	svc, mock := newOperService(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock)
	mock.ExpectExec("INSERT INTO `huoniao_travel_strategy` (`typeid`, `usertype`, `userid`, `title`, `litpic`, `pics`, `note`, `pubdate`, `state`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").
		WithArgs(int64(2), int64(1), int64(7), "攻略A", "", "/a.jpg", "正文", sqlmock.AnyArg(), sqlmock.AnyArg()).
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
		WithArgs(int64(88)).WillReturnResult(sqlmock.NewResult(0, 1))
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
	t.Cleanup(func() {
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("expectations not met: %v", err)
		}
	})
	var gotNote, gotModule, gotTemp, gotAction, gotSQL string
	var gotAid int64
	var gotUID string
	svc, err := New(Dep{
		DB: db, TablePrefix: "huoniao_",
		MemberDetail: func(req *ajax.Request) ajax.Response {
			return ajax.Response{State: ajax.StateOK, Info: operInfo(1, 0, 0)}
		},
		MemberLog: func(req *http.Request, uid, module, temp string, aid int64,
			action, note, link, sqlText string) {
			gotUID, gotNote, gotModule, gotTemp, gotAction, gotAid, gotSQL =
				uid, note, module, temp, action, aid, sqlText
		},
	})
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	svc.ident = fakeIdentity{uid: 5}

	expectStoreOK(mock)
	// WithArgs 断言持久化值：userid=5、company=7（店铺 id）、审核开关 state=1。
	mock.ExpectExec(qHotelInsert).WithArgs(
		int64(5), int64(7), "测试酒店", int64(0), int64(0), int64(3), "", "/a.jpg", "",
		"0", "", sqlmock.AnyArg(), int64(1), "").
		WillReturnResult(sqlmock.NewResult(42, 1))
	got := serveParams(t, svc, "operHotel", url.Values{
		"oper": {"add"}, "title": {"测试酒店"}, "addrid": {"3"}, "pics": {"/a.jpg"},
	})
	if got != `{"state":100,"info":"发布成功！"}` {
		t.Fatalf("add = %s", got)
	}
	if gotUID != "5" {
		t.Errorf("memberLog uid = %q, want \"5\"", gotUID)
	}
	if gotNote != "开通酒店店铺(测试酒店)" || gotModule != "travel" || gotTemp != "hotel" ||
		gotAction != "insert" || gotAid != 42 {
		t.Fatalf("memberLog = %q/%q/%q/%q/%d", gotNote, gotModule, gotTemp, gotAction, gotAid)
	}
	if !strings.HasPrefix(gotSQL, "INSERT INTO `huoniao_travel_hotel`") ||
		!strings.Contains(gotSQL, "'测试酒店'") {
		t.Errorf("memberLog sqlText = %q", gotSQL)
	}
}

// —— 三轮评审修复的流式验证（fractional id / 算术 NOT IN / earliestdate 透传）——

func TestOperVisaEarliestdatePassthrough(t *testing.T) {
	// earliestdate="00"：GetMkTime 纯数字透传 "00" → empty("00")=false → 校验放行 →
	// INSERT 绑定 phpInt64("00")=0（列转义与 PHP '00' 落列一致）。
	svc, mock := newOperService(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock)
	mock.ExpectExec(qVisaInsert).WillReturnResult(sqlmock.NewResult(66, 1))
	got := serveParams(t, svc, "operVisa", url.Values{
		"oper": {"add"}, "title": {"日本签"}, "scope": {"单次"}, "serviceincludes": {"含"},
		"country": {"3"}, "typeid": {"1"}, "price": {"500"}, "entrytimes": {"1"},
		"staytimes": {"15"}, "earliestdate": {"00"}, "valid": {"90"},
		"processingtime": {"7"}, "pics": {"/a.jpg"},
	})
	if got != `{"state":100,"info":66}` {
		t.Fatalf("earliestdate 00 = %s", got)
	}
	// "0" / ""：PHP empty → 校验拦截 [8][73]，不触库。
	for _, ed := range []string{"0", ""} {
		svc2, mock2 := newOperService(t, 5, operInfo(1, 0, 0))
		expectStoreOK(mock2)
		got2 := serveParams(t, svc2, "operVisa", url.Values{
			"oper": {"add"}, "title": {"日本签"}, "scope": {"单次"}, "serviceincludes": {"含"},
			"country": {"3"}, "typeid": {"1"}, "price": {"500"}, "entrytimes": {"1"},
			"staytimes": {"15"}, "earliestdate": {ed}, "valid": {"90"},
			"processingtime": {"7"}, "pics": {"/a.jpg"},
		})
		if got2 != `{"state":101,"info":"请选择最早可预订时间"}` {
			t.Errorf("earliestdate %q = %s", ed, got2)
		}
	}
	// "0001"：透传 "0001" → 落列 1 → INSERT 成功。
	svc3, mock3 := newOperService(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock3)
	mock3.ExpectExec(qVisaInsert).WillReturnResult(sqlmock.NewResult(67, 1))
	got3 := serveParams(t, svc3, "operVisa", url.Values{
		"oper": {"add"}, "title": {"日本签"}, "scope": {"单次"}, "serviceincludes": {"含"},
		"country": {"3"}, "typeid": {"1"}, "price": {"500"}, "entrytimes": {"1"},
		"staytimes": {"15"}, "earliestdate": {"0001"}, "valid": {"90"},
		"processingtime": {"7"}, "pics": {"/a.jpg"},
	})
	if got3 != `{"state":100,"info":67}` {
		t.Fatalf("earliestdate 0001 = %s", got3)
	}
}

func TestOperTicketTopLevelIDEntryCoerce(t *testing.T) {
	// 顶层 id="3.5"：入口归一（ajax.php:78 的 convertArrToStrWithComma (int) 强转，
	// 防表达式注入）先截成 3，handler 收到的就是 "3" —— SELECT 绑定 3，正常走流程。
	// 与 PHP 完全同构（评审 P1 的「父 id 截断误改行」在 PHP 侧同样发生，非偏差）。
	svc, mock, log := newOperServiceTracked(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock)
	mock.ExpectQuery(qTicketExist).WithArgs(int64(3)).
		WillReturnRows(sqlmock.NewRows([]string{"id"}))
	p := ticketParams()
	p.Set("oper", "update")
	p.Set("id", "3.5")
	got := serveParams(t, svc, "operTicket", p)
	if got != `{"state":101,"info":"信息不存在，或已经删除！"}` {
		t.Fatalf("top id 3.5 = %s", got)
	}
	found := false
	for _, q := range *log {
		if strings.HasPrefix(q, "SELECT l.`id` FROM `huoniao_travel_ticket`") {
			found = true
		}
	}
	if !found {
		t.Errorf("id=3.5 应经入口 (int) 化后照常触库 SELECT")
	}
}

func TestOperTicketFractionalElementBindsLiteral(t *testing.T) {
	// 元素 id="3.5"：UPDATE WHERE id = 3.5 是合法 SQL（绑定 3.5、命中 0 行，
	// 与 PHP 裸拼同语义）；notid 仍追加 "3.5" → join "3.5,4" 合法 → DELETE 照删。
	svc, mock, _ := newOperServiceTracked(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock)
	mock.ExpectQuery(qTicketExist).WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(31))
	mock.ExpectExec("UPDATE `huoniao_travel_ticket` SET `note` = ?, `userid` = ?, `company` = ?, `title` = ?, `cityid` = ?, `opentime` = ?, `addrid` = ?, `address` = ?, `pics` = ?, `video` = ?, `travelname` = ?, `tag` = ?, `state` = ?, `date` = ?, `openStart` = ?, `openEnd` = ?, `level` = ? WHERE `id` = ?").
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(qTInfoUpd35).WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec(qTInfoIns).WithArgs("儿童票", int64(31), "40", "N;", sqlmock.AnyArg()).
		WillReturnResult(sqlmock.NewResult(4, 1))
	mock.ExpectExec("DELETE FROM `huoniao_travel_ticketinfo` WHERE `ticketid` = ? AND `id` NOT IN (3.5,4)").
		WithArgs(int64(31)).WillReturnResult(sqlmock.NewResult(0, 1))
	p := ticketParams()
	p.Set("oper", "update")
	p.Set("id", "31")
	p.Set("ticketlist", `[{"id":"3.5","title":"成人票","price":"80","specialtime":""},{"title":"儿童票","price":"40","specialtime":""}]`)
	got := serveParams(t, svc, "operTicket", p)
	if got != `{"state":100,"info":"修改成功！"}` {
		t.Fatalf("element 3.5 = %s", got)
	}
}

func TestOperTicketArithElementUpdateAndDelete(t *testing.T) {
	// 元素 id="3+0"：UPDATE WHERE id = 3+0 是合法 SQL、命中行 3（求值绑定 3）；
	// join "3+0,4" 是合法 NOT IN 算术表达式 → DELETE 照删（PHP 裸拼语义）。
	svc, mock := newOperService(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock)
	mock.ExpectQuery(qTicketExist).WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(31))
	mock.ExpectExec("UPDATE `huoniao_travel_ticket` SET `note` = ?, `userid` = ?, `company` = ?, `title` = ?, `cityid` = ?, `opentime` = ?, `addrid` = ?, `address` = ?, `pics` = ?, `video` = ?, `travelname` = ?, `tag` = ?, `state` = ?, `date` = ?, `openStart` = ?, `openEnd` = ?, `level` = ? WHERE `id` = ?").
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(qTInfoUpdArith).WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(qTInfoIns).WithArgs("儿童票", int64(31), "40", "N;", sqlmock.AnyArg()).
		WillReturnResult(sqlmock.NewResult(4, 1))
	mock.ExpectExec("DELETE FROM `huoniao_travel_ticketinfo` WHERE `ticketid` = ? AND `id` NOT IN (3+0,4)").
		WithArgs(int64(31)).WillReturnResult(sqlmock.NewResult(0, 1))
	p := ticketParams()
	p.Set("oper", "update")
	p.Set("id", "31")
	p.Set("ticketlist", `[{"id":"3+0","title":"成人票","price":"80","specialtime":""},{"title":"儿童票","price":"40","specialtime":""}]`)
	got := serveParams(t, svc, "operTicket", p)
	if got != `{"state":100,"info":"修改成功！"}` {
		t.Fatalf("element 3+0 = %s", got)
	}
}

func TestOperHotelFractionalRoomIDBindsLiteral(t *testing.T) {
	// roomlist 元素 id="3.5"：UPDATE WHERE id = 3.5 绑定 3.5（合法 SQL、命中 0 行，
	// 不得 (int) 截断误改 id=3 的房间行——PHP 裸拼同语义）。
	svc, mock, _ := newOperServiceTracked(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock)
	mock.ExpectQuery(qHotelExist).WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(11))
	mock.ExpectExec(qHotelUpdate).WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec("UPDATE `huoniao_travel_hotelroom` SET `title` = ?, `hotelid` = ?, `area` = ?, `iswindow` = ?, `typeid` = ?, `breakfast` = ?, `price` = ?, `specialtime` = ?, `pics` = ? WHERE `id` = 3.5").
		WillReturnResult(sqlmock.NewResult(0, 0))
	got := serveParams(t, svc, "operHotel", url.Values{
		"oper": {"update"}, "id": {"11"}, "title": {"测试酒店"}, "addrid": {"3"}, "pics": {"/a.jpg"},
		"roomlist": {`[{"id":"3.5","title":"大床房","area":"30","iswindow":"1","typeid":"0","breakfast":"1","price":"199","specialtime":"","imgpath":"/r.jpg"}]`},
	})
	if got != `{"state":100,"info":"修改成功！"}` {
		t.Fatalf("fractional room = %s", got)
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
		// PHP 关联数组键的整数化：JSON "1" → int 键（serialize 出 i:1），插入序保持。
		phpSerializeValue(jsonDecodeList(`{"1":2,"b":3}`)): `a:2:{i:1;i:2;s:1:"b";i:3;}`,
		phpSerializeValue(jsonDecodeList(`{"01":2}`)):      `a:1:{s:2:"01";i:2;}`, // 前导零不整数化
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

// —— 评审加固用例（codex R1）：assoc 列表 / 错误面 / member.Object 生产形态 ——

// operInfoObject 构造生产路径的 *member.Object 桩（autharr 为有序对象）。
func operInfoObject(ut int, staff int, staffComp int, authModules ...string) *member.Object {
	o := member.NewObject()
	o.Set("id", "5")
	o.Set("userType", ut)
	o.Set("is_staff", staff)
	o.Set("companyuid", staffComp)
	auth := member.NewObject()
	arr := []any{}
	for _, v := range authModules {
		arr = append(arr, v)
	}
	auth.Set("travel", arr)
	o.Set("autharr", auth)
	return o
}

func TestOperStaffGateWithMemberObjectInfo(t *testing.T) {
	// 生产形态：member.detail 返回 *member.Object，autharr 是嵌套有序对象。
	// staff（type=2，autharr.travel 含 "2"）→ 门禁通过 → userid=companyuid=9；
	// 店铺门禁命中 → INSERT 的 userid 是店铺 id（7）。
	svc, mock := newOperServiceInfo(t, 5, operInfoObject(1, 1, 9, "2"))
	expectStoreOK(mock)
	mock.ExpectExec("INSERT INTO `huoniao_travel_video` (`usertype`, `userid`, `title`, `litpic`, `video`, `pubdate`, `state`) VALUES (?, ?, ?, ?, ?, ?, ?)").
		WithArgs(int64(1), int64(7), "视频A", "/c.jpg", "/v.mp4", sqlmock.AnyArg(), sqlmock.AnyArg()).
		WillReturnResult(sqlmock.NewResult(79, 1))
	got := serveParams(t, svc, "operVideo", url.Values{
		"oper": {"add"}, "title": {"视频A"}, "litpic": {"/c.jpg"}, "video": {"/v.mp4"},
	})
	if got != `{"state":100,"info":79}` {
		t.Fatalf("member.Object staff = %s", got)
	}

	// 同形态但 autharr.travel 无 "2" → 商家权限验证失败！
	svc2, _ := newOperServiceInfo(t, 5, operInfoObject(1, 1, 9, "1"))
	got2 := serveParams(t, svc2, "operVideo", url.Values{
		"oper": {"add"}, "title": {"视频A"}, "litpic": {"/c.jpg"}, "video": {"/v.mp4"},
	})
	if got2 != `{"state":101,"info":"商家权限验证失败！"}` {
		t.Fatalf("member.Object no auth = %s", got2)
	}
}

func TestOperHotelAssocRoomlistIterates(t *testing.T) {
	// assoc 形态 roomlist：PHP foreach 对关联数组也迭代（键被丢弃）。
	svc, mock := newOperService(t, 5, operInfo(1, 0, 0))
	rooms := `{"r1":{"title":"大床房","area":"30","iswindow":"1","typeid":"0","breakfast":"1","price":"199","specialtime":"","imgpath":"/r.jpg"}}`
	expectStoreOK(mock)
	mock.ExpectExec(qHotelInsert).WillReturnResult(sqlmock.NewResult(42, 1))
	mock.ExpectExec(qHotelRoomIns).WithArgs(
		"大床房", int64(42), "30", "1", "0", "1", "199", "N;", sqlmock.AnyArg(), "/r.jpg").
		WillReturnResult(sqlmock.NewResult(1, 1))
	got := serveParams(t, svc, "operHotel", url.Values{
		"oper": {"add"}, "title": {"测试酒店"}, "addrid": {"3"}, "pics": {"/a.jpg"},
		"price": {"199.5"}, "roomlist": {rooms},
	})
	if got != `{"state":100,"info":"发布成功！"}` {
		t.Fatalf("assoc roomlist = %s", got)
	}
}

func TestOperAgencyAssocTicketlistStringKeys(t *testing.T) {
	// array_reverse 对字符串键原样保留：foreach 插入序 [b=第二天, a=第一天]，
	// 反转后 [a=第一天(weight=a), b=第二天(weight=b)]——weight 是原始键。
	svc, mock := newOperService(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock)
	mock.ExpectExec(qAgencyInsert).WillReturnResult(sqlmock.NewResult(21, 1))
	mock.ExpectExec(qAInfoIns).WithArgs("第一天", int64(21), "100", "N;", sqlmock.AnyArg(), "a").
		WillReturnResult(sqlmock.NewResult(1, 1))
	mock.ExpectExec(qAInfoIns).WithArgs("第二天", int64(21), "200", "N;", sqlmock.AnyArg(), "b").
		WillReturnResult(sqlmock.NewResult(2, 1))
	got := serveParams(t, svc, "operAgency", url.Values{
		"oper": {"add"}, "title": {"周边游"}, "typeid": {"1"}, "addrid": {"1"},
		"address": {"路"}, "pics": {"/a.jpg"},
		"ticketlist": {`{"b":{"title":"第二天","price":"200","specialtime":""},"a":{"title":"第一天","price":"100","specialtime":""}}`},
	})
	if got != `{"state":100,"info":21}` {
		t.Fatalf("assoc ticketlist = %s", got)
	}
}

func TestOperTicketUpdateNotidInsertErrorKeepsRows(t *testing.T) {
	// INSERT 失败时 PHP 无条件 push lastid 错误串 → NOT IN 列表非法 → DELETE 整条
	// 报 SQL 错误（dsqlOper 吞掉）→ 已有行不被删除，流程继续（修改成功）。
	// 注意：sqlmock 不会把意外调用记成未满足期望——若 Go 误执行 DELETE，sqlmock
	// 返回的错误被生产代码 `_, _ =` 吞掉，ExpectationsWereMet 照常通过（假绿）。
	// 因此用 execRecorder 在 driver 层记录每条语句，显式断言 DELETE 从未到达。
	svc, mock, log := newOperServiceTracked(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock)
	mock.ExpectQuery(qTicketExist).WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(31))
	mock.ExpectExec("UPDATE `huoniao_travel_ticket` SET `note` = ?, `userid` = ?, `company` = ?, `title` = ?, `cityid` = ?, `opentime` = ?, `addrid` = ?, `address` = ?, `pics` = ?, `video` = ?, `travelname` = ?, `tag` = ?, `state` = ?, `date` = ?, `openStart` = ?, `openEnd` = ?, `level` = ? WHERE `id` = ?").
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(qTInfoUpd3).WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(qTInfoIns).WithArgs("儿童票", int64(31), "40", "N;", sqlmock.AnyArg()).
		WillReturnError(errors.New("insert failed"))
	p := ticketParams()
	p.Set("oper", "update")
	p.Set("id", "31")
	p.Set("ticketlist", `[{"id":"3","title":"成人票","price":"80","specialtime":""},{"title":"儿童票","price":"40","specialtime":""}]`)
	got := serveParams(t, svc, "operTicket", p)
	if got != `{"state":100,"info":"修改成功！"}` {
		t.Fatalf("notid error face = %s", got)
	}
	for _, q := range *log {
		if strings.HasPrefix(q, "DELETE FROM `huoniao_travel_ticketinfo`") {
			t.Errorf("非法 NOT IN 列表不应执行 DELETE，实际执行了: %s", q)
		}
	}
}

func TestOperHotelUpdateSelectErrorGoesToUpdate(t *testing.T) {
	// 存在性 SELECT 报错：dsqlOper 错误串 truthy → 继续走 UPDATE → 也报错 → [12][34]。
	svc, mock := newOperService(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock)
	mock.ExpectQuery(qHotelExist).WillReturnError(errors.New("select failed"))
	mock.ExpectExec(qHotelUpdate).WillReturnError(errors.New("update failed"))
	got := serveParams(t, svc, "operHotel", url.Values{
		"oper": {"update"}, "id": {"11"}, "title": {"测试酒店"}, "addrid": {"3"}, "pics": {"/a.jpg"},
	})
	if got != `{"state":101,"info":"发布到数据时发生错误，请检查字段内容！"}` {
		t.Fatalf("update select-error face = %s", got)
	}
}

func TestOperHotelDelSelectErrorFace(t *testing.T) {
	// del 存在性 SELECT 报错：$results[0]['userid'] 取到 '{' → 与 userid 不等 → [12][37]。
	svc, mock := newOperService(t, 5, operInfo(1, 0, 0))
	expectStoreOK(mock)
	mock.ExpectQuery(qHotelDelSel).WillReturnError(errors.New("select failed"))
	got := serveParams(t, svc, "operHotel", url.Values{"oper": {"del"}, "id": {"11"}})
	if got != `{"state":101,"info":"权限不足，请确认帐户信息后再进行操作！"}` {
		t.Fatalf("del select-error face = %s", got)
	}
}

func TestStoreGateSelectErrorFace(t *testing.T) {
	// 店铺门禁 SELECT 报错：错误串 truthy → $userResult[0]['state'] 取到 '{'
	// → `== 0` 为真 → [12][29]（审核中），不是 [12][28]。
	svc, mock := newOperService(t, 5, operInfo(1, 0, 0))
	mock.ExpectQuery(qStoreGate).WillReturnError(errors.New("select failed"))
	got := serveParams(t, svc, "operRentcar", url.Values{"oper": {"del"}, "id": {"1"}})
	if got != `{"state":101,"info":"您的公司信息还在审核中，请通过审核后再发布！"}` {
		t.Fatalf("store gate select-error face = %s", got)
	}
}
