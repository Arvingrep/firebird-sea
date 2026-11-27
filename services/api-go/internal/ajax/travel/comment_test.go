// comment_test.go 是批次3（#372）评论互动 5 个 action 的 L1 测试。
// 口径：sqlmock 精确匹配 SQL（QueryMatcherEqual），断言 JSON 输出与键序。
package travel

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"testing"
	"time"

	sqlmock "github.com/DATA-DOG/go-sqlmock"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// fakeIdentity 恒返回 uid（登录态）。
type fakeIdentity struct{ uid int64 }

func (f fakeIdentity) MemberID(context.Context, *http.Request) (int64, error) { return f.uid, nil }

// newCommentService 与 newService 同口径，额外注入 CommentCheck / Identity / MemberDetail。
func newCommentService(t *testing.T, uid int64) (*Service, sqlmock.Sqlmock) {
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
			// getMemberInfo 语义：无条件取 info（id=0 也会转调，fake 里只回一个固定对象）。
			return ajax.Response{State: ajax.StateOK, Info: map[string]any{"id": "1", "nickname": "admin"}}
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

const (
	qCommonCount = "SELECT `id` FROM `huoniao_travelcommon` WHERE `aid` = ? AND `ischeck` = 1 AND `floor` = 0 ORDER BY `id` DESC"
	qCommonRows  = "SELECT `id`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `duser` FROM `huoniao_travelcommon` WHERE `aid` = ? AND `ischeck` = 1 AND `floor` = 0 ORDER BY `id` DESC LIMIT ?, ?"
	qChildCount  = "SELECT `id` FROM `huoniao_travelcommon` WHERE `floor` = ? AND `ischeck` = 1 ORDER BY `id` ASC"
	qChildRows   = "SELECT `id`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `duser` FROM `huoniao_travelcommon` WHERE `floor` = ? AND `ischeck` = 1 ORDER BY `id` ASC LIMIT ?, ?"
)

// commonRows 构造 9 列评论行（dtime = now-4h → ftime 恒 "4小时前"，离分钟/小时
// 边界足够远，测试稳定）。
func fourHoursAgo() string { return fmt.Sprintf("%d", time.Now().Add(-4*time.Hour).Unix()) }

func commonRows(ids ...string) *sqlmock.Rows {
	dt := fourHoursAgo()
	r := sqlmock.NewRows([]string{"id", "userid", "content", "dtime", "ip", "ipaddr", "good", "bad", "duser"})
	for _, id := range ids {
		r.AddRow(id, "1", "评论"+id, dt, "127.0.0.1", "", "3", "0", "1")
	}
	return r
}

// —— common ——

func TestCommonNormalWithRecursion(t *testing.T) {
	svc, mock := newCommentService(t, 0)
	// 顶层 2 行（id 1、2），id1 楼下 1 行（id3），id3 楼下无。
	mock.ExpectQuery(qCommonCount).WithArgs("1").WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1).AddRow(2))
	mock.ExpectQuery(qCommonRows).WithArgs("1", 0, 10).WillReturnRows(commonRows("1", "2"))
	mock.ExpectQuery(qChildCount).WithArgs(1).WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(3))
	mock.ExpectQuery(qChildRows).WithArgs(1, 0, 100).WillReturnRows(commonRows("3"))
	mock.ExpectQuery(qChildCount).WithArgs(3).WillReturnRows(sqlmock.NewRows([]string{"id"})) // id3 楼下空 → lower null
	mock.ExpectQuery(qChildCount).WithArgs(2).WillReturnRows(sqlmock.NewRows([]string{"id"})) // id2 楼下空 → lower null

	got := serve(t, svc, "/include/ajax.php?service=travel&action=common&newsid=1")
	dt := fourHoursAgo()
	want := fmt.Sprintf(`{"state":100,"info":{"pageInfo":{"page":1,"pageSize":10,"totalPage":1.0,"totalCount":2},"list":[`+
		`{"id":"1","userinfo":{"id":"1","nickname":"admin"},"content":"评论1","dtime":"%s","ftime":"4小时前","ip":"127.0.0.1","ipaddr":"","good":"3","bad":"0","already":0,"lower":[{"id":"3","userinfo":{"id":"1","nickname":"admin"},"content":"评论3","dtime":"%s","ftime":"4小时前","ip":"127.0.0.1","ipaddr":"","good":"3","bad":"0","already":0,"lower":null}]},`+
		`{"id":"2","userinfo":{"id":"1","nickname":"admin"},"content":"评论2","dtime":"%s","ftime":"4小时前","ip":"127.0.0.1","ipaddr":"","good":"3","bad":"0","already":0,"lower":null}]}}`, dt, dt, dt)
	if got != want {
		t.Fatalf("common 响应体 =\n%s\nwant\n%s", got, want)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("SQL 期望未满足: %v", err)
	}
}

func TestCommonHotOrderAndTypeidAndPaging(t *testing.T) {
	svc, mock := newCommentService(t, 0)
	mock.ExpectQuery("SELECT `id` FROM `huoniao_travelcommon` WHERE `aid` = ? AND `type` = ? AND `ischeck` = 1 AND `floor` = 0 ORDER BY `good` DESC, `id` DESC").
		WithArgs("1", "2").WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
	mock.ExpectQuery("SELECT `id`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `duser` FROM `huoniao_travelcommon` WHERE `aid` = ? AND `type` = ? AND `ischeck` = 1 AND `floor` = 0 ORDER BY `good` DESC, `id` DESC LIMIT ?, ?").
		WithArgs("1", "2", 10, 10).WillReturnRows(sqlmock.NewRows([]string{"id", "userid", "content", "dtime", "ip", "ipaddr", "good", "bad", "duser"}).AddRow("6", "1", "c", fmt.Sprintf("%d", time.Now().Add(-4*time.Hour).Unix()), "127.0.0.1", "", "2", "0", ""))
	mock.ExpectQuery(qChildCount).WithArgs(6).WillReturnRows(sqlmock.NewRows([]string{"id"}))

	got := serve(t, svc, "/include/ajax.php?service=travel&action=common&newsid=1&orderby=hot&typeid=2&page=2&pageSize=10")
	// page/pageSize 经入口归一是 int；page=2 → LIMIT 10,10。
	wantSub := `"pageInfo":{"page":2,"pageSize":10,"totalPage":1.0,"totalCount":1}`
	if !strings.Contains(got, wantSub) {
		t.Fatalf("common 分页 pageinfo 不符 = %s", got)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("SQL 期望未满足: %v", err)
	}
}

func TestCommonEmptyAndBadNewsid(t *testing.T) {
	svc, mock := newCommentService(t, 0)
	// totalCount=0 → 101 暂无数据！
	mock.ExpectQuery(qCommonCount).WithArgs("0").WillReturnRows(sqlmock.NewRows([]string{"id"}))
	got := serve(t, svc, "/include/ajax.php?service=travel&action=common&newsid=0")
	if got != `{"state":101,"info":"暂无数据！"}` {
		t.Fatalf("common newsid=0 = %s", got)
	}
	// newsid 非数字 → PHP SQL 语法错误面 → 已知偏差按空结果降级（无 SQL 执行）。
	got = serve(t, svc, "/include/ajax.php?service=travel&action=common&newsid=abc")
	if got != `{"state":101,"info":"暂无数据！"}` {
		t.Fatalf("common newsid=abc = %s", got)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("SQL 期望未满足: %v", err)
	}
}

func TestCommonAlreadyWithLogin(t *testing.T) {
	svc, mock := newCommentService(t, 1)
	mock.ExpectQuery(qCommonCount).WithArgs("1").WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
	mock.ExpectQuery(qCommonRows).WithArgs("1", 0, 10).WillReturnRows(commonRows("1"))
	mock.ExpectQuery(qChildCount).WithArgs(1).WillReturnRows(sqlmock.NewRows([]string{"id"}))

	got := serve(t, svc, "/include/ajax.php?service=travel&action=common&newsid=1")
	// 登录 uid=1 ∈ duser("1") → already=1（含子层）。
	if !strings.Contains(got, `"already":1`) {
		t.Fatalf("common 登录 already=1 不符 = %s", got)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("SQL 期望未满足: %v", err)
	}
}

// —— getCommonList ——

func TestGetCommonListNormalAndEmptyFid(t *testing.T) {
	svc, mock := newCommentService(t, 0)
	// fid 空 → 101 格式错误（travel[12][23]）。
	got := serve(t, svc, "/include/ajax.php?service=travel&action=getCommonList")
	if got != `{"state":101,"info":"格式错误"}` {
		t.Fatalf("getCommonList fid 空 = %s", got)
	}

	// fid=1 → 1 行（ftime = dtime 原始值）+ 楼下空 → lower null。
	mock.ExpectQuery(qChildCount).WithArgs(1).WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(3))
	mock.ExpectQuery(qChildRows).WithArgs(1, 0, 99999).WillReturnRows(commonRows("3"))
	mock.ExpectQuery(qChildCount).WithArgs(3).WillReturnRows(sqlmock.NewRows([]string{"id"}))

	got = serve(t, svc, "/include/ajax.php?service=travel&action=getCommonList&fid=1")
	want := `{"state":100,"info":{"pageInfo":{"page":1,"pageSize":99999,"totalPage":1.0,"totalCount":1},"list":[` +
		`{"id":"3","userinfo":{"id":"1","nickname":"admin"},"content":"评论3","dtime":"` + fourHoursAgo() + `","ftime":"4小时前","ip":"127.0.0.1","ipaddr":"","good":"3","bad":"0","already":0,"lower":null}]}}`
	if got != want {
		t.Fatalf("getCommonList =\n%s\nwant\n%s", got, want)
	}
}

func TestGetCommonListEmptyResult(t *testing.T) {
	svc, mock := newCommentService(t, 0)
	mock.ExpectQuery(qChildCount).WithArgs(999).WillReturnRows(sqlmock.NewRows([]string{"id"}))
	got := serve(t, svc, "/include/ajax.php?service=travel&action=getCommonList&fid=999")
	if got != `{"state":101,"info":"暂无数据！"}` {
		t.Fatalf("getCommonList fid=999 = %s", got)
	}
}

// —— dingCommon ——

func TestDingCommonGates(t *testing.T) {
	svc, mock := newCommentService(t, 0)
	// id 空 / "0" → 裸字符串文案（外层 state=100）。
	got := serve(t, svc, "/include/ajax.php?service=travel&action=dingCommon")
	if got != `{"state":100,"info":"请传递评论ID！"}` {
		t.Fatalf("dingCommon id 空 = %s", got)
	}
	// 未登录 → 登录超时（在 SELECT 之前，无 SQL）。
	got = serve(t, svc, "/include/ajax.php?service=travel&action=dingCommon&id=5")
	if got != `{"state":100,"info":"登录超时，请重新登录！"}` {
		t.Fatalf("dingCommon 未登录 = %s", got)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("SQL 期望未满足: %v", err)
	}
}

func TestDingCommonSuccessAndAlready(t *testing.T) {
	svc, mock := newCommentService(t, 1)
	// 行存在、duser 空 → 顶成功 → "ok"。
	mock.ExpectQuery("SELECT `duser` FROM `huoniao_travelcommon` WHERE `id` = ?").WithArgs("7").
		WillReturnRows(sqlmock.NewRows([]string{"duser"}).AddRow(""))
	mock.ExpectExec("UPDATE `huoniao_travelcommon` SET `good` = `good` + 1 WHERE `id` = ?").WithArgs("7").WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec("UPDATE `huoniao_travelcommon` SET `duser` = ? WHERE `id` = ?").WithArgs("1", "7").WillReturnResult(sqlmock.NewResult(0, 1))
	got := serve(t, svc, "/include/ajax.php?service=travel&action=dingCommon&id=7")
	if got != `{"state":100,"info":"ok"}` {
		t.Fatalf("dingCommon 成功 = %s", got)
	}

	// 已顶过（duser 含 1）→ 已顶过！。
	mock.ExpectQuery("SELECT `duser` FROM `huoniao_travelcommon` WHERE `id` = ?").WithArgs("7").
		WillReturnRows(sqlmock.NewRows([]string{"duser"}).AddRow("1"))
	got = serve(t, svc, "/include/ajax.php?service=travel&action=dingCommon&id=7")
	if got != `{"state":100,"info":"已顶过！"}` {
		t.Fatalf("dingCommon 已顶 = %s", got)
	}

	// duser="0" → PHP empty("0") → nuser 只写 uid（不带 "0," 前缀）。
	mock.ExpectQuery("SELECT `duser` FROM `huoniao_travelcommon` WHERE `id` = ?").WithArgs("7").
		WillReturnRows(sqlmock.NewRows([]string{"duser"}).AddRow("0"))
	mock.ExpectExec("UPDATE `huoniao_travelcommon` SET `good` = `good` + 1 WHERE `id` = ?").WithArgs("7").WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec("UPDATE `huoniao_travelcommon` SET `duser` = ? WHERE `id` = ?").WithArgs("1", "7").WillReturnResult(sqlmock.NewResult(0, 1))
	if got := serve(t, svc, "/include/ajax.php?service=travel&action=dingCommon&id=7"); got != `{"state":100,"info":"ok"}` {
		t.Fatalf("dingCommon duser=0 = %s", got)
	}

	// 行不存在 → 评论不存在或已删除！。
	mock.ExpectQuery("SELECT `duser` FROM `huoniao_travelcommon` WHERE `id` = ?").WithArgs("9").
		WillReturnError(sql.ErrNoRows)
	got = serve(t, svc, "/include/ajax.php?service=travel&action=dingCommon&id=9")
	if got != `{"state":100,"info":"评论不存在或已删除！"}` {
		t.Fatalf("dingCommon 不存在 = %s", got)
	}

	// 多段 id（"1,2"）→ PHP SQL 错误面 → 已知偏差按「评论不存在或已删除！」（无 SQL）。
	got = serve(t, svc, "/include/ajax.php?service=travel&action=dingCommon&id=1,2")
	if got != `{"state":100,"info":"评论不存在或已删除！"}` {
		t.Fatalf("dingCommon id=1,2 = %s", got)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("SQL 期望未满足: %v", err)
	}
}

// —— sendCommon ——

func TestSendCommonParamErrors(t *testing.T) {
	svc, mock := newCommentService(t, 1)
	for _, target := range []string{
		"/include/ajax.php?service=travel&action=sendCommon",                            // aid/content 全空
		"/include/ajax.php?service=travel&action=sendCommon&aid=0&content=x",            // aid "0" → empty
		"/include/ajax.php?service=travel&action=sendCommon&aid=5&content=0",            // content "0" → empty
		"/include/ajax.php?service=travel&action=sendCommon&aid=5",                      // content 缺失
	} {
		got := serve(t, svc, target)
		if got != `{"state":101,"info":"必填项不得为空！"}` {
			t.Fatalf("sendCommon %s = %s", target, got)
		}
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("SQL 期望未满足: %v", err)
	}
}

func TestSendCommonSuccess(t *testing.T) {
	svc, mock := newCommentService(t, 1)
	mock.ExpectExec("INSERT INTO `huoniao_travelcommon` (`aid`, `floor`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `ischeck`, `duser`, `type`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").
		WithArgs("5", "3", int64(1), "hello 评论", sqlmock.AnyArg(), sqlmock.AnyArg(), "", 0, 0, 1, "", 3).
		WillReturnResult(sqlmock.NewResult(9, 1))
	// 回查：dtime 取旧值 → now-dtime > 30 → ftime = dtime 原始值分支。
	mock.ExpectQuery("SELECT `id`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad` FROM `huoniao_travelcommon` WHERE `id` = ?").
		WithArgs(int64(9)).
		WillReturnRows(sqlmock.NewRows([]string{"id", "userid", "content", "dtime", "ip", "ipaddr", "good", "bad"}).
			AddRow("9", "1", "hello 评论", "1795805151", "127.0.0.1", "", "0", "0"))

	got := serve(t, svc, "/include/ajax.php?service=travel&action=sendCommon&aid=5&id=3&type=3&content=hello+%E8%AF%84%E8%AE%BA")
	want := `{"state":100,"info":{"id":"9","userinfo":{"id":"1","nickname":"admin"},"content":"hello 评论","dtime":"1795805151","ftime":"1795805151","ip":"127.0.0.1","ipaddr":"","good":"0","bad":"0"}}`
	if got != want {
		t.Fatalf("sendCommon =\n%s\nwant\n%s", got, want)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("SQL 期望未满足: %v", err)
	}
}

func TestSendCommonContentQuoteRoundTrip(t *testing.T) {
	// 带引号内容走 addslashes/strip 往返：入库内容 = 原文（S(A(x))=x）。
	svc, mock := newCommentService(t, 1)
	mock.ExpectExec("INSERT INTO `huoniao_travelcommon` (`aid`, `floor`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `ischeck`, `duser`, `type`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").
		// 入库 = 转义视图（PHP addslashes($param) 叠层后 filter 保回，MySQL 解析后剩一层）。
		WithArgs("5", "", int64(1), `it\'s \"ok\"`, sqlmock.AnyArg(), sqlmock.AnyArg(), "", 0, 0, 1, "", 0).
		WillReturnResult(sqlmock.NewResult(0, 1)) // lastid=0 → 评论失败！
	got := serve(t, svc, "/include/ajax.php?service=travel&action=sendCommon&aid=5&content=it%27s+%22ok%22")
	if got != `{"state":101,"info":"评论失败！"}` {
		t.Fatalf("sendCommon lastid=0 = %s", got)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("SQL 期望未满足: %v", err)
	}
}

func TestSendCommonInsertError(t *testing.T) {
	svc, mock := newCommentService(t, 1)
	mock.ExpectExec("INSERT INTO `huoniao_travelcommon` (`aid`, `floor`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `ischeck`, `duser`, `type`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").
		WithArgs("5", "", int64(1), "x", sqlmock.AnyArg(), sqlmock.AnyArg(), "", 0, 0, 1, "", 0).
		WillReturnError(errors.New("db down"))
	got := serve(t, svc, "/include/ajax.php?service=travel&action=sendCommon&aid=5&content=x")
	if got != `{"state":101,"info":"评论失败！"}` {
		t.Fatalf("sendCommon 插入失败 = %s", got)
	}
}

func TestFloorTimeBranches(t *testing.T) {
	now := timeNow(t)
	cases := []struct {
		sec  int64
		want string
	}{
		{0, "刚刚"},
		{30, "刚刚"},
		{61, "1分钟前"},
		{3601, "1小时前"},
		{86401, "1天前"},
	}
	for _, c := range cases {
		if got := floorTime(c.sec, now); got != c.want {
			t.Errorf("floorTime(%d) = %q, want %q", c.sec, got, c.want)
		}
	}
	// days>7 → date("Y-m-d", now-sec)（Etc/GMT-8）。
	got := floorTime(8*86400, now)
	want := now.AddDate(0, 0, -8).In(gmt8).Format("2006-01-02")
	if got != want {
		t.Errorf("floorTime(8d) = %q, want %q", got, want)
	}
}

// —— commentDetail ——

func TestCommentDetailNotFound(t *testing.T) {
	svc, mock := newCommentService(t, 0)
	mock.ExpectQuery("SELECT `id`, `aid`, `floor`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `ischeck`, `duser`, `type` FROM `huoniao_travelcommon` WHERE `id` = ? AND `isCheck` = 1").
		WithArgs(5).WillReturnRows(sqlmock.NewRows([]string{"id", "aid", "floor", "userid", "content", "dtime", "ip", "ipaddr", "good", "bad", "ischeck", "duser", "type"}))
	got := serve(t, svc, "/include/ajax.php?service=travel&action=commentDetail&id=5")
	if got != `{"state":102,"info":"No data!"}` {
		t.Fatalf("commentDetail 无行 = %s", got)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("SQL 期望未满足: %v", err)
	}
}

func TestCommentDetailFullShape(t *testing.T) {
	svc, mock := newCommentService(t, 1)
	row := sqlmock.NewRows([]string{"id", "aid", "floor", "userid", "content", "dtime", "ip", "ipaddr", "good", "bad", "ischeck", "duser", "type"}).
		AddRow("3", "1", "1", "1", "子评论", "1795808721", "127.0.0.1", "", "0", "0", "1", "1", "0")
	mock.ExpectQuery("SELECT `id`, `aid`, `floor`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `ischeck`, `duser`, `type` FROM `huoniao_travelcommon` WHERE `id` = ? AND `isCheck` = 1").
		WithArgs(3).WillReturnRows(row)
	// 父评论 id=1 存在。
	mock.ExpectQuery("SELECT `content`, `userid` FROM `huoniao_travelcommon` WHERE `id` = ? AND `isCheck` = 1").
		WithArgs("1").WillReturnRows(sqlmock.NewRows([]string{"content", "userid"}).AddRow("父评论", "1"))
	// 父作者名（无 photo 列）。
	mock.ExpectQuery("SELECT id, mtype, nickname, company FROM `huoniao_member` WHERE `id` IN (1)").
		WillReturnRows(sqlmock.NewRows([]string{"id", "mtype", "nickname", "company"}).AddRow("1", "0", "admin", ""))
	// 赞用户（duser="1"）。
	mock.ExpectQuery("SELECT `id`, `mtype`, `nickname`, `company`, `photo` FROM `huoniao_member` WHERE `id` IN (1)").
		WillReturnRows(sqlmock.NewRows([]string{"id", "mtype", "nickname", "company", "photo"}).AddRow("1", "0", "admin", "", ""))
	// user 投影（userid=1）。
	mock.ExpectQuery("SELECT `id`, `mtype`, `nickname`, `company`, `photo` FROM `huoniao_member` WHERE `id` = ?").
		WithArgs("1").WillReturnRows(sqlmock.NewRows([]string{"id", "mtype", "nickname", "company", "photo"}).AddRow("1", "0", "admin", "", ""))

	got := serve(t, svc, "/include/ajax.php?service=travel&action=commentDetail&id=3")
	want := `{"state":100,"info":{"id":"3","aid":"1","parcontent":"父评论","parusername":"admin","floor":"1","userid":"1","content":"子评论","dtime":"1795808721","ip":"127.0.0.1","ipaddr":"","good":"0","bad":"0","ischeck":"1","zan_userArr":[{"id":"1","nickname":"admin","photo":""}],"duser":"1","type":"0","zan_has":1,"user":{"id":"1","nickname":"admin","photo":""}}}`
	if got != want {
		t.Fatalf("commentDetail =\n%s\nwant\n%s", got, want)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("SQL 期望未满足: %v", err)
	}
}

func TestCommentDetailAnonAndMissingMember(t *testing.T) {
	svc, mock := newCommentService(t, 0)
	row := sqlmock.NewRows([]string{"id", "aid", "floor", "userid", "content", "dtime", "ip", "ipaddr", "good", "bad", "ischeck", "duser", "type"}).
		AddRow("8", "1", "0", "1", "顶层", "1795809002", "192.168.117.1", "未知", "0", "0", "1", "", "0")
	mock.ExpectQuery("SELECT `id`, `aid`, `floor`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `ischeck`, `duser`, `type` FROM `huoniao_travelcommon` WHERE `id` = ? AND `isCheck` = 1").
		WithArgs(8).WillReturnRows(row)
	// floor=0 → 无 par 查询；duser="" → zan_userArr=[]；user 会员查不到 → null。
	mock.ExpectQuery("SELECT `id`, `mtype`, `nickname`, `company`, `photo` FROM `huoniao_member` WHERE `id` = ?").
		WithArgs("1").WillReturnRows(sqlmock.NewRows([]string{"id", "mtype", "nickname", "company", "photo"}))

	got := serve(t, svc, "/include/ajax.php?service=travel&action=commentDetail&id=8")
	wantSub := `"zan_userArr":[],"duser":"","type":"0","zan_has":0,"user":null}`
	if !strings.Contains(got, wantSub) || strings.Contains(got, `"parcontent"`) {
		t.Fatalf("commentDetail floor=0 形态不符 = %s", got)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("SQL 期望未满足: %v", err)
	}
}

func TestCommentDetailZanHasNeedsMemberRow(t *testing.T) {
	// duser 含 uid=1，但 member 查询无行 → PHP `$res` falsy → zan_has=0。
	svc, mock := newCommentService(t, 1)
	mock.ExpectQuery("SELECT `id`, `aid`, `floor`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `ischeck`, `duser`, `type` FROM `huoniao_travelcommon` WHERE `id` = ? AND `isCheck` = 1").
		WithArgs(2).WillReturnRows(sqlmock.NewRows([]string{"id", "aid", "floor", "userid", "content", "dtime", "ip", "ipaddr", "good", "bad", "ischeck", "duser", "type"}).
		AddRow("2", "1", "0", "1", "顶层", "1795808691", "127.0.0.1", "", "11", "1", "1", "1", "2"))
	mock.ExpectQuery("SELECT `id`, `mtype`, `nickname`, `company`, `photo` FROM `huoniao_member` WHERE `id` IN (1)").
		WillReturnRows(sqlmock.NewRows([]string{"id", "mtype", "nickname", "company", "photo"}))
	mock.ExpectQuery("SELECT `id`, `mtype`, `nickname`, `company`, `photo` FROM `huoniao_member` WHERE `id` = ?").
		WithArgs("1").WillReturnRows(sqlmock.NewRows([]string{"id", "mtype", "nickname", "company", "photo"}).AddRow("1", "0", "admin", "", ""))

	got := serve(t, svc, "/include/ajax.php?service=travel&action=commentDetail&id=2")
	if !strings.Contains(got, `"zan_has":0`) {
		t.Fatalf("commentDetail 会员行缺失 zan_has=0 不符 = %s", got)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("SQL 期望未满足: %v", err)
	}
}

// timeNow 取测试时点（floorTime 日期分支断言用）。
func timeNow(t *testing.T) time.Time {
	t.Helper()
	return time.Now()
}

func TestCnSubstrRLatin1Width(t *testing.T) {
	// ©（U+00A9）首字节 C2=194 → PHP ord() 计宽 1：300 个截为 250 个（评审修正点）。
	if got := cnSubstrR(strings.Repeat("©", 300), 250); got != strings.Repeat("©", 250) {
		t.Errorf("cnSubstrR © 宽度不符：len(runes)=%d", len([]rune(got)))
	}
	// 小写 ASCII 每字符 0.5 → 250 宽度 = 500 字符。
	if got := cnSubstrR(strings.Repeat("a", 600), 250); got != strings.Repeat("a", 500) {
		t.Errorf("cnSubstrR ASCII 宽度不符：len=%d", len(got))
	}
	// 中文（首字节 ≥224）计 1。
	if got := cnSubstrR(strings.Repeat("旅", 300), 250); got != strings.Repeat("旅", 250) {
		t.Errorf("cnSubstrR CJK 宽度不符：len(runes)=%d", len([]rune(got)))
	}
	// 大写字母计 1。
	if got := cnSubstrR(strings.Repeat("A", 600), 250); got != strings.Repeat("A", 250) {
		t.Errorf("cnSubstrR A-Z 宽度不符：len=%d", len(got))
	}
}
