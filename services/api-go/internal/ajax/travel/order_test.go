// order_test.go 是批次5（#374）订单读与轻写 7 个 action 的 L1 测试。
// 口径：sqlmock 精确匹配 SQL（QueryMatcherEqual），断言 JSON 输出与键序。
// 注意 PHP 查询顺序：payCheck 内 = 订单 → 商品 → detail → 自店 → empty 检查。
package travel

import (
	"fmt"
	"strings"
	"testing"

	sqlmock "github.com/DATA-DOG/go-sqlmock"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// qPayCheckOrder 是 payCheck 逐单查询。
const qPayCheckOrder = "SELECT `proid`, `procount`, `orderprice`, `orderstate`, `type` FROM `huoniao_travel_order` WHERE `ordernum` = ? AND `userid` = 1"

// qPayCheckStore 是 payCheck 自店查询。
const qPayCheckStore = "SELECT `id` FROM `huoniao_travel_store` WHERE `userid` = 1"

// qTicketinfo 是 payCheck/orderList 的 ticketinfo 商品查询。
const qTicketinfo = "SELECT `id`, `title`, `ticketid`, `price`, `specialtime` FROM `huoniao_travel_ticketinfo` WHERE `id` = 100"

// qTicketDetail 是 ticketDetail 主查询。
const qTicketDetail = "SELECT `id`, `title`, `userid`, `note`, `company`, `pics`, `opentime`, `tag`, `video`, `lng`, `lat`, `cityid`, `travelname`, `addrid`, `address`, `click`, `pubdate`, `state`, `jdnote`, `date`, `openStart`, `openEnd`, `level` FROM `huoniao_travel_ticket` WHERE `id` = 10"

// qPayTotal 是 checkPayAmount 的 totalPrice 逐单查询。
const qPayTotal = "SELECT `procount`, `payprice` AS `orderprice` FROM `huoniao_travel_order` WHERE `ordernum` = ?"

func orderRow(ordernum, proid, orderstate, typ string) *sqlmock.Rows {
	return sqlmock.NewRows([]string{"proid", "procount", "orderprice", "orderstate", "type"}).
		AddRow(proid, "2", "100.00", orderstate, typ)
}

func emptyOrderRows() *sqlmock.Rows {
	return sqlmock.NewRows([]string{"proid", "procount", "orderprice", "orderstate", "type"})
}

// ticketinfoRows / ticketDetailRows 构造 type=1 商品链。
func ticketinfoRows() *sqlmock.Rows {
	return sqlmock.NewRows([]string{"id", "title", "ticketid", "price", "specialtime"}).
		AddRow("100", "门票A", "10", "50.00", "")
}

func ticketDetailRows() *sqlmock.Rows {
	return sqlmock.NewRows([]string{"id", "title", "userid", "note", "company", "pics", "opentime", "tag", "video", "lng", "lat", "cityid", "travelname", "addrid", "address", "click", "pubdate", "state", "jdnote", "date", "openStart", "openEnd", "level"}).
		AddRow("10", "景点A", "2", "", "2", "", "每日", "", "", "120.1", "30.2", "0", "", "0", "", "5", "1600000000", "1", "", "", "", "", "0")
}

// newOrderService 与 newCommentService 同构，MemberDetail fake 可定制（money 等）。
func newOrderService(t *testing.T, uid int64, memberInfo map[string]any) (*Service, sqlmock.Sqlmock) {
	t.Helper()
	db, mock, err := sqlmock.New(sqlmock.QueryMatcherOption(sqlmock.QueryMatcherEqual))
	if err != nil {
		t.Fatalf("sqlmock: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })
	svc, err := New(Dep{
		DB:           db,
		TablePrefix:  "huoniao_",
		CommentCheck: 1,
		MemberDetail: func(req *ajax.Request) ajax.Response {
			return ajax.Response{State: ajax.StateOK, Info: memberInfo}
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

// mockPayCheckOK 依次 mock 订单 → ticketinfo → ticketDetail（内部余下查询不 mock，
// 走降级默认）→ 自店空。
func mockPayCheckOK(mock sqlmock.Sqlmock, ordernum string) {
	mock.ExpectQuery(qPayCheckOrder).WithArgs(ordernum).WillReturnRows(orderRow(ordernum, "100", "0", "1"))
	mock.ExpectQuery(qTicketinfo).WillReturnRows(ticketinfoRows())
	mock.ExpectQuery(qTicketDetail).WillReturnRows(ticketDetailRows())
	mock.ExpectQuery(qPayCheckStore).WillReturnRows(sqlmock.NewRows([]string{"id"}))
}

// —— payCheck ——

func TestPayCheckParamAndMissing(t *testing.T) {
	svc, _ := newCommentService(t, 1)

	// 空 ordernum → 订单号传递失败
	got := serve(t, svc, "/include/ajax.php?service=travel&action=payCheck")
	if got != `{"state":101,"info":"订单号传递失败！"}` {
		t.Fatalf("payCheck 空 ordernum = %s", got)
	}

	// 订单不存在（userid=1 查无行）
	svc2, mock := newCommentService(t, 1)
	mock.ExpectQuery(qPayCheckOrder).WithArgs("NO1").WillReturnRows(emptyOrderRows())
	got = serve(t, svc2, "/include/ajax.php?service=travel&action=payCheck&ordernum=NO1")
	if got != `{"state":101,"info":"订单不存在或已删除，请确认后重试！"}` {
		t.Fatalf("payCheck 订单不存在 = %s", got)
	}

	// 状态异常
	svc3, mock := newCommentService(t, 1)
	mock.ExpectQuery(qPayCheckOrder).WithArgs("NO2").WillReturnRows(orderRow("NO2", "100", "1", "1"))
	got = serve(t, svc3, "/include/ajax.php?service=travel&action=payCheck&ordernum=NO2")
	if got != `{"state":101,"info":"订单状态异常，请确认后重试！"}` {
		t.Fatalf("payCheck 状态异常 = %s", got)
	}
}

func TestPayCheckOK(t *testing.T) {
	svc, mock := newCommentService(t, 1)
	mockPayCheckOK(mock, "NO3")
	got := serve(t, svc, "/include/ajax.php?service=travel&action=payCheck&ordernum=NO3")
	if got != `{"state":100,"info":"ok"}` {
		t.Fatalf("payCheck ok = %s", got)
	}
}

func TestPayCheckOwnStore(t *testing.T) {
	// 自店：ticketDetail.company(=2) == store.id(=2) → 企业会员不得购买自己公司的
	svc, mock := newCommentService(t, 1)
	mock.ExpectQuery(qPayCheckOrder).WithArgs("NO3").WillReturnRows(orderRow("NO3", "100", "0", "1"))
	mock.ExpectQuery(qTicketinfo).WillReturnRows(ticketinfoRows())
	mock.ExpectQuery(qTicketDetail).WillReturnRows(ticketDetailRows())
	mock.ExpectQuery(qPayCheckStore).
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow("2"))
	got := serve(t, svc, "/include/ajax.php?service=travel&action=payCheck&ordernum=NO3")
	if got != `{"state":101,"info":"企业会员不得购买自己公司的！"}` {
		t.Fatalf("payCheck 自店 = %s", got)
	}
}

// —— checkPayAmount ——

func TestCheckPayAmountPayCheckFailFirst(t *testing.T) {
	// PHP 顺序：payCheck 先跑（含未登录：userid=-1 → 订单不存在透传，非登录超时）
	svc, mock := newCommentService(t, 0)
	mock.ExpectQuery("SELECT `proid`, `procount`, `orderprice`, `orderstate`, `type` FROM `huoniao_travel_order` WHERE `ordernum` = ? AND `userid` = -1").
		WithArgs("NOX").WillReturnRows(emptyOrderRows())
	got := serve(t, svc, "/include/ajax.php?service=travel&action=checkPayAmount&ordernum=NOX")
	if got != `{"state":101,"info":"订单不存在或已删除，请确认后重试！"}` {
		t.Fatalf("checkPayAmount payCheck 失败 = %s", got)
	}
}

func TestCheckPayAmountGates(t *testing.T) {
	// 空 ordernum（payCheck 通过后才会走到）
	svc, mock := newCommentService(t, 1)
	mockPayCheckOK(mock, "NO3")
	// payCheck 通过 → "ok"；但 ordernum 还是 NO3……空 ordernum 时 payCheck 先失败，
	// 这里直接验证「balance 有值缺 paypwd」门禁。
	got := serve(t, svc, "/include/ajax.php?service=travel&action=checkPayAmount&ordernum=NO3&useBalance=1&balance=50")
	if got != `{"state":101,"info":"请输入支付密码！"}` {
		t.Fatalf("checkPayAmount 缺支付密码 = %s", got)
	}
}

func TestCheckPayAmountSuccess(t *testing.T) {
	// 定制 memberDetail fake（带 money=1000），newCommentService 的 fake 无 money。
	svc, mock := newOrderService(t, 1, map[string]any{"id": "1", "money": "1000"})
	mockPayCheckOK(mock, "NO3")
	mock.ExpectQuery(qPayTotal).WithArgs("NO3").
		WillReturnRows(sqlmock.NewRows([]string{"procount", "orderprice"}).AddRow("2", "100.00"))
	stored := saltedHashOf("123456", "seed0000")
	mock.ExpectQuery("SELECT `paypwd` FROM `huoniao_member` WHERE `id` = 1").
		WillReturnRows(sqlmock.NewRows([]string{"paypwd"}).AddRow(stored))

	got := serve(t, svc, "/include/ajax.php?service=travel&action=checkPayAmount&ordernum=NO3&useBalance=1&balance=30&paypwd=123456")
	if got != `{"state":100,"info":"70.00"}` {
		t.Fatalf("checkPayAmount 成功 = %s", got)
	}
}

func TestCheckPayAmountWrongPwdAndShort(t *testing.T) {
	// 密码错误
	svc, mock := newCommentService(t, 1)
	mockPayCheckOK(mock, "NO3")
	mock.ExpectQuery(qPayTotal).WithArgs("NO3").
		WillReturnRows(sqlmock.NewRows([]string{"procount", "orderprice"}).AddRow("2", "100.00"))
	mock.ExpectQuery("SELECT `paypwd` FROM `huoniao_member` WHERE `id` = 1").
		WillReturnRows(sqlmock.NewRows([]string{"paypwd"}).AddRow(saltedHashOf("123456", "seed0000")))
	got := serve(t, svc, "/include/ajax.php?service=travel&action=checkPayAmount&ordernum=NO3&useBalance=1&balance=30&paypwd=999999")
	if got != `{"state":101,"info":"支付密码输入错误，请重试！"}` {
		t.Fatalf("checkPayAmount 密码错误 = %s", got)
	}

	// 余额不足（money 来自 memberDetail fake → 0）
	svc2, mock2 := newCommentService(t, 1)
	mockPayCheckOK(mock2, "NO3")
	mock2.ExpectQuery(qPayTotal).WithArgs("NO3").
		WillReturnRows(sqlmock.NewRows([]string{"procount", "orderprice"}).AddRow("2", "100.00"))
	mock2.ExpectQuery("SELECT `paypwd` FROM `huoniao_member` WHERE `id` = 1").
		WillReturnRows(sqlmock.NewRows([]string{"paypwd"}).AddRow(saltedHashOf("123456", "seed0000")))
	got = serve(t, svc2, "/include/ajax.php?service=travel&action=checkPayAmount&ordernum=NO3&useBalance=1&balance=30&paypwd=123456")
	if got != `{"state":101,"info":"您的余额不足，支付失败！"}` {
		t.Fatalf("checkPayAmount 余额不足 = %s", got)
	}
}

// —— delOrder ——

func TestDelOrderPaths(t *testing.T) {
	const qSel = "SELECT * FROM `huoniao_travel_order` WHERE `id` = 5"
	full := []string{"id", "ordernum", "store", "proid", "userid", "orderstate"}

	// 非数字 id
	svc, _ := newCommentService(t, 1)
	got := serve(t, svc, "/include/ajax.php?service=travel&action=delOrder&id=abc")
	if got != `{"state":101,"info":"格式错误"}` {
		t.Fatalf("delOrder 非数字 = %s", got)
	}

	// 未登录（delOrder 自身有登录门禁，先于查询）
	svc2, _ := newCommentService(t, 0)
	got = serve(t, svc2, "/include/ajax.php?service=travel&action=delOrder&id=5")
	if got != `{"state":101,"info":"登录超时，请重新登录！"}` {
		t.Fatalf("delOrder 未登录 = %s", got)
	}

	// 订单不存在
	svc3, mock := newCommentService(t, 1)
	mock.ExpectQuery(qSel).WillReturnRows(sqlmock.NewRows(full))
	got = serve(t, svc3, "/include/ajax.php?service=travel&action=delOrder&id=5")
	if got != `{"state":101,"info":"订单不存在，或已经删除！"}` {
		t.Fatalf("delOrder 不存在 = %s", got)
	}

	// 权限不足（userid=2 ≠ 1）
	svc4, mock := newCommentService(t, 1)
	mock.ExpectQuery(qSel).WillReturnRows(sqlmock.NewRows(full).AddRow("5", "NO1", "2", "100", "2", "1"))
	got = serve(t, svc4, "/include/ajax.php?service=travel&action=delOrder&id=5")
	if got != `{"state":101,"info":"权限不足，请确认帐户信息后再进行操作！"}` {
		t.Fatalf("delOrder 权限不足 = %s", got)
	}

	// 不可删除状态（orderstate=1）
	svc5, mock := newCommentService(t, 1)
	mock.ExpectQuery(qSel).WillReturnRows(sqlmock.NewRows(full).AddRow("5", "NO1", "2", "100", "1", "1"))
	got = serve(t, svc5, "/include/ajax.php?service=travel&action=delOrder&id=5")
	if got != `{"state":101,"info":"订单为不可删除状态！"}` {
		t.Fatalf("delOrder 不可删 = %s", got)
	}

	// 成功（orderstate=0）
	svc6, mock := newCommentService(t, 1)
	mock.ExpectQuery(qSel).WillReturnRows(sqlmock.NewRows(full).AddRow("5", "NO1", "2", "100", "1", "0"))
	mock.ExpectExec("DELETE FROM `huoniao_travel_order` WHERE `id` = 5").WillReturnResult(sqlmock.NewResult(0, 1))
	got = serve(t, svc6, "/include/ajax.php?service=travel&action=delOrder&id=5")
	if got != `{"state":100,"info":"删除成功！"}` {
		t.Fatalf("delOrder 成功 = %s", got)
	}
}

// —— verifyQuan ——

func TestVerifyQuanPaths(t *testing.T) {
	const qQuan = "SELECT q.`usedate`, q.`expireddate`, o.`proid`, o.`departuretime`, o.`type`, o.`orderprice`, o.`procount` FROM `huoniao_travelquan` q LEFT JOIN `huoniao_travel_order` o ON o.`id` = q.`orderid` LEFT JOIN `huoniao_travel_store` s ON o.`store` = s.`id` WHERE (o.`orderstate` = 1 OR o.`orderstate` = 2) AND q.`cardnum` = ? AND s.`userid` = 1"
	quanCols := []string{"usedate", "expireddate", "proid", "departuretime", "type", "orderprice", "procount"}

	// 非数字 code
	svc, _ := newCommentService(t, 1)
	got := serve(t, svc, "/include/ajax.php?service=travel&action=verifyQuan&code=abc")
	if got != `{"state":101,"info":"格式错误"}` {
		t.Fatalf("verifyQuan 非数字 = %s", got)
	}

	// 券不存在
	svc2, mock := newCommentService(t, 1)
	mock.ExpectQuery(qQuan).WithArgs("88881111").WillReturnRows(sqlmock.NewRows(quanCols))
	got = serve(t, svc2, "/include/ajax.php?service=travel&action=verifyQuan&code=88881111")
	if got != `{"state":101,"info":"密码错误，请与消费者确认提供的密码是否正确！"}` {
		t.Fatalf("verifyQuan 不存在 = %s", got)
	}

	// 已使用
	svc3, mock := newCommentService(t, 1)
	mock.ExpectQuery(qQuan).WithArgs("88881111").
		WillReturnRows(sqlmock.NewRows(quanCols).AddRow("1700000000", "1900000000", "100", "0", "1", "100.00", "2"))
	got = serve(t, svc3, "/include/ajax.php?service=travel&action=verifyQuan&code=88881111")
	if !strings.Contains(got, `"info":"验证失败，此券已于`) {
		t.Fatalf("verifyQuan 已使用 = %s", got)
	}

	// 过期（type=1）
	svc4, mock := newCommentService(t, 1)
	mock.ExpectQuery(qQuan).WithArgs("88881111").
		WillReturnRows(sqlmock.NewRows(quanCols).AddRow("0", "1000", "100", "0", "1", "100.00", "2"))
	got = serve(t, svc4, "/include/ajax.php?service=travel&action=verifyQuan&code=88881111")
	if got != `{"state":101,"info":"验证失败，此券已经过期！"}` {
		t.Fatalf("verifyQuan 过期 = %s", got)
	}

	// 过期但 type=3 且出发时间未过 → 隐式 null → 102
	svc5, mock := newCommentService(t, 1)
	mock.ExpectQuery(qQuan).WithArgs("88881111").
		WillReturnRows(sqlmock.NewRows(quanCols).AddRow("0", "1000", "200", "4102444800", "3", "100.00", "2"))
	got = serve(t, svc5, "/include/ajax.php?service=travel&action=verifyQuan&code=88881111")
	if got != `{"state":102,"info":"No data!"}` {
		t.Fatalf("verifyQuan type3 未出发 = %s", got)
	}

	// 有效：type=1 成功文案
	svc6, mock := newCommentService(t, 1)
	mock.ExpectQuery(qQuan).WithArgs("88881111").
		WillReturnRows(sqlmock.NewRows(quanCols).AddRow("0", "4102444800", "100", "0", "1", "100.00", "2"))
	mock.ExpectQuery(qTicketinfo).WillReturnRows(ticketinfoRows())
	mock.ExpectQuery(qTicketDetail).WillReturnRows(ticketDetailRows())
	got = serve(t, svc6, "/include/ajax.php?service=travel&action=verifyQuan&code=88881111")
	if !strings.Contains(got, "验证成功，项目：<a href='") || !strings.Contains(got, "门票A</a> × 2张 [50.00元]") {
		t.Fatalf("verifyQuan 成功文案 = %s", got)
	}
}

// —— oneKeyContinued ——

const qOneKeyOrder = "SELECT `id`, `walktime`, `departuretime`, `orderstate`, `proid`, `procount`, `people`, `contact` FROM `huoniao_travel_order` WHERE `id` = 5"
const qHotelroom = "SELECT `id`, `title`, `hotelid`, `price`, `specialtime` FROM `huoniao_travel_hotelroom` WHERE `id` = 200"
const qHotelDetail = "SELECT `id`, `title`, `userid`, `company`, `pics`, `price`, `tag`,`factag`, `video`, `lng`, `lat`, `cityid`, `typeid`, `addrid`, `address`, `click`, `pubdate`, `state`,`note` FROM `huoniao_travel_hotel` WHERE `id` = 20"
const qStoreDetailNested = "SELECT `id`, `cityid`, `title`, `userid`, `lng`, `flag`, `lat`, `addrid`, `address`, `tel`, `contact`, `pics`, `video`, `note`, `license`, `servicetime`, `click`, `pubdate`, `state`, `bind_module`,`date`,`openStart`,`openEnd`, `refuse`  FROM `huoniao_travel_store` WHERE `id` = 2 AND `state` = 1"

func TestOneKeyContinuedPaths(t *testing.T) {
	orderCols := []string{"id", "walktime", "departuretime", "orderstate", "proid", "procount", "people", "contact"}

	// 空 id
	svc, _ := newCommentService(t, 1)
	got := serve(t, svc, "/include/ajax.php?service=travel&action=oneKeyContinued")
	if got != `{"state":101,"info":"格式错误"}` {
		t.Fatalf("oneKeyContinued 空 id = %s", got)
	}

	// 订单不存在
	svc2, mock := newCommentService(t, 1)
	mock.ExpectQuery(qOneKeyOrder).WillReturnRows(sqlmock.NewRows(orderCols))
	got = serve(t, svc2, "/include/ajax.php?service=travel&action=oneKeyContinued&id=5")
	if got != `{"state":101,"info":"房间信息不存在"}` {
		t.Fatalf("oneKeyContinued 订单不存在 = %s", got)
	}

	// 未到出发时间（orderstate=3，departuretime=明天）→ 该房间已出售
	svc3, mock := newCommentService(t, 1)
	future := fmt.Sprintf("%d", todayStart()+86400)
	mock.ExpectQuery(qOneKeyOrder).WillReturnRows(sqlmock.NewRows(orderCols).AddRow("5", "1000", future, "3", "200", "2", "", ""))
	got = serve(t, svc3, "/include/ajax.php?service=travel&action=oneKeyContinued&id=5")
	if !strings.Contains(got, "该房间已出售，与") {
		t.Fatalf("oneKeyContinued 已出售 = %s", got)
	}

	// hotelroom 不存在 → 房间信息不存在
	svc4, mock := newCommentService(t, 1)
	mock.ExpectQuery(qOneKeyOrder).WillReturnRows(sqlmock.NewRows(orderCols).AddRow("5", "1000", "900", "3", "200", "2", "", ""))
	mock.ExpectQuery(qHotelroom).WillReturnRows(sqlmock.NewRows([]string{"id", "title", "hotelid", "price", "specialtime"}))
	got = serve(t, svc4, "/include/ajax.php?service=travel&action=oneKeyContinued&id=5")
	if got != `{"state":101,"info":"房间信息不存在"}` {
		t.Fatalf("oneKeyContinued 房间不存在 = %s", got)
	}

	// 成功插入（INSERT 参数含随机 ordernum → AnyArg）
	svc5, mock := newCommentService(t, 1)
	mock.ExpectQuery(qOneKeyOrder).WillReturnRows(sqlmock.NewRows(orderCols).AddRow("5", "1000", "900", "3", "200", "2", `[{"name":"张三"}]`, "13800000000"))
	mock.ExpectQuery(qHotelroom).
		WillReturnRows(sqlmock.NewRows([]string{"id", "title", "hotelid", "price", "specialtime"}).AddRow("200", "大床房", "20", "288.00", ""))
	mock.ExpectQuery(qHotelDetail).
		WillReturnRows(sqlmock.NewRows([]string{"id", "title", "userid", "company", "pics", "price", "tag", "factag", "video", "lng", "lat", "cityid", "typeid", "addrid", "address", "click", "pubdate", "state", "note"}).
			AddRow("20", "酒店A", "2", "2", "", "0.00", "", "", "", "120.1", "30.2", "0", "0", "0", "地址", "5", "1600000000", "1", ""))
	mock.ExpectQuery(qStoreDetailNested).
		WillReturnRows(sqlmock.NewRows([]string{"id", "cityid", "title", "userid", "lng", "flag", "lat", "addrid", "address", "tel", "contact", "pics", "video", "note", "license", "servicetime", "click", "pubdate", "state", "bind_module", "date", "openStart", "openEnd", "refuse"}).
			AddRow("2", "0", "商家A", "2", "", "", "", "0", "", "", "", "", "", "", "", "0", "5", "1600000000", "1", "", "0", "", "", "0"))
	mock.ExpectExec("INSERT INTO `huoniao_travel_order` (`ordernum`, `store`, `proid`, `userid`, `orderstate`, `orderdate`, `procount`, `people`, `contact`, `orderprice`, `type`, `tab`, `walktime`, `nopaydate`, `departuretime`) VALUES (?, ?, ?, ?, '0', ?, ?, ?, ?, ?, '3', 'travel', ?, ?, ?)").
		WithArgs(sqlmock.AnyArg(), "2", "200", int64(1), sqlmock.AnyArg(), "2", `[{"name":"张三"}]`, "13800000000", "288.00",
			sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg()).
		WillReturnResult(sqlmock.NewResult(9, 1))
	got = serve(t, svc5, "/include/ajax.php?service=travel&action=oneKeyContinued&id=5")
	// 测试环境无 fburl Resolver → URL 为空串（L2 compare 环境有真实 URL）。
	if got != `{"state":100,"info":""}` {
		t.Fatalf("oneKeyContinued 成功（空 Resolver）= %s", got)
	}
}

// —— orderList / orderDetail 门禁 ——

func TestOrderListUnauthenticatedGoesEmpty(t *testing.T) {
	// PHP：userid 空 → getMemberID()=-1 → empty(-1)=false → userid=-1 继续查询 → 空结果。
	svc, mock := newCommentService(t, 0)
	arch := "SELECT o.`id`, o.`ordernum`, o.`store`, o.`proid`, o.`userid`, o.`procount`, o.`orderprice`, o.`orderstate`, o.`orderdate`, o.`paydate`, o.`paytype`, s.`title`, o.`ret-state`, o.`type`, o.`walktime` FROM `huoniao_travel_order` o  LEFT JOIN `huoniao_travel_store` s ON o.`store` = s.`id` LEFT JOIN `huoniao_member` m ON m.`id` = s.`userid` WHERE 1 = 1 AND o.`userid` = '-1' "
	empty := sqlmock.NewRows([]string{"id"})
	mock.ExpectQuery(arch).WillReturnRows(empty) // totalCount
	for _, extra := range []string{
		" AND `orderstate` = 0",
		" AND `orderstate` = 1",
		" AND `orderstate` = 2",
		" AND `orderstate` = 3",
		" AND `orderstate` = 4",
		" AND `orderstate` = 5",
		" AND `orderstate` = 6",
		" AND `orderstate` = 7",
		" AND `orderstate` = 8 and `ret-state` = 1 ",
		" AND `orderstate` = 9",
		" AND `orderstate` = 10 and `ret-state` = 1 ",
		" AND (`orderstate` = 2 or `orderstate` = 4)",
	} {
		mock.ExpectQuery(arch+extra).WillReturnRows(empty)
	}
	got := serve(t, svc, "/include/ajax.php?service=travel&action=orderList")
	want := `{"state":100,"info":{"pageInfo":{"page":1,"pageSize":10,"totalPage":0.0,"totalCount":0,` +
		`"state0":0,"state1":0,"state2":0,"state3":0,"state4":0,"state5":0,"state6":0,"state7":0,` +
		`"state8":0,"state9":0,"state10":0,"state20":0},"list":[]}}`
	if got != want {
		t.Fatalf("orderList 空 = %s\nwant %s", got, want)
	}
}

func TestOrderDetailPaths(t *testing.T) {
	// 非数字 id
	svc, _ := newCommentService(t, 1)
	got := serve(t, svc, "/include/ajax.php?service=travel&action=orderDetail&id=abc")
	if got != `{"state":101,"info":"格式错误"}` {
		t.Fatalf("orderDetail 非数字 = %s", got)
	}

	// 无行 → 空数组被包装层判 falsy → 102 No data!
	svc2, mock := newCommentService(t, 1)
	mock.ExpectQuery("SELECT o.*, s.`id` AS `sid` FROM `huoniao_travel_order` o  LEFT JOIN `huoniao_travel_store` s ON o.`store` = s.`id` WHERE ( o.`userid` = '1' OR s.`userid` = '1') AND o.`id` = 5").
		WillReturnRows(sqlmock.NewRows([]string{"id"}))
	got = serve(t, svc2, "/include/ajax.php?service=travel&action=orderDetail&id=5")
	if got != `{"state":102,"info":"No data!"}` {
		t.Fatalf("orderDetail 无行 = %s", got)
	}
}
