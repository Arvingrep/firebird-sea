package member

import (
	"errors"
	"testing"
	"time"

	"database/sql/driver"
	sqlmock "github.com/DATA-DOG/go-sqlmock"
)

// 迁移自 member.class.php:13866-13915 的 followMember（#255）。
// 期望串是完整 SQL（QueryMatcherEqual），参数用 sqlmock 的精确匹配 + argEq 断言文案。

const (
	qFollowCount  = "SELECT COUNT(*) FROM `huoniao_member_follow` WHERE `tid` = ? AND `fid` = ?"
	qSelfMedia    = "SELECT `userid` FROM `huoniao_article_selfmedia` WHERE `id` = ?"
	qFollowInsert = "INSERT INTO `huoniao_member_follow` (`fid`, `tid`, `date`, `fortype`) VALUES (?, ?, ?, ?)"
	qFollowDelete = "DELETE FROM `huoniao_member_follow` WHERE `tid` = ? AND `fid` = ?"
	qLogCount     = "SELECT COUNT(*) FROM `huoniao_member_log` WHERE `md5` = ? AND `uid` = ? AND `ip` = ? AND `pubdate` = ?"
	qLogInsert    = "INSERT INTO `huoniao_member_log` (`uid`, `module`, `temp`, `aid`, `type`, `note`, `link`, `ip`, `ipaddr`, `useragent`, `sql`, `pubdate`, `md5`, `url`, `param`, `referer`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"

	okBody = `{"state":100,"info":"ok"}`
	// fixedNow 的秒级时间戳（comment_test.go 里的 fixedNow = 1700000000）。
	followNow = int64(1700000000)
)

// argEq 断言某个字符串参数的具体取值（sqlmock 自带的匹配器只能全精确或全任意）。
type argEq string

func (a argEq) Match(v driver.Value) bool {
	s, ok := v.(string)
	return ok && s == string(a)
}

func newFollowService(t *testing.T, identity Identity) (*Service, sqlmock.Sqlmock) {
	t.Helper()
	db, mock, err := sqlmock.New(sqlmock.QueryMatcherOption(sqlmock.QueryMatcherEqual))
	if err != nil {
		t.Fatalf("sqlmock: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })
	svc, err := New(Dep{
		DB: db, TablePrefix: "huoniao_", Identity: identity,
		Clock: func() time.Time { return fixedNow },
	})
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	return svc, mock
}

// logSQL 是 member_log.sql 列的期望值：实现里存的是 addslashes(SQL 原文)，转义本身由
// TestAddSlashes 单独覆盖，这里复用同一个函数避免把每条用例都写成带反斜杠的字面量。
func logSQL(sqlText string) argEq { return argEq(addSlashes(sqlText)) }

// expectLog 期待 member_log 的去重查询 + 写入。
func expectLog(m sqlmock.Sqlmock, uid string, seen int, action, note, sqlText string) {
	m.ExpectQuery(qLogCount).
		WithArgs(sqlmock.AnyArg(), uid, sqlmock.AnyArg(), followNow).
		WillReturnRows(count(seen))
	if seen > 0 {
		return
	}
	m.ExpectExec(qLogInsert).
		WithArgs(uid, "member", "follow", int64(0), action, argEq(note), "", sqlmock.AnyArg(), "",
			sqlmock.AnyArg(), logSQL(sqlText), followNow, sqlmock.AnyArg(), sqlmock.AnyArg(),
			sqlmock.AnyArg(), sqlmock.AnyArg()).
		WillReturnResult(sqlmock.NewResult(1, 1))
}

// id 经 ajax.php 归一后为空串 → 101 参数错误，且不碰数据库。
func TestFollowMemberBadID(t *testing.T) {
	for _, q := range []string{"", "&id=abc", "&id=0", "&id="} {
		svc, m := newFollowService(t, fakeIdentity(7))
		got := do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember"+q, "")
		eq(t, got, `{"state":101,"info":"参数错误"}`)
		met(t, m)
	}
}

// 未登录（getMemberID 为 -1）→ 101 登录超时；handler 里的 200 被外层改写成 101。
func TestFollowMemberAnonymous(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(-1))
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember&id=9", "")
	eq(t, got, `{"state":101,"info":"登录超时，请重新登录！"}`)
	met(t, m)
}

// 会员关注自己：empty($for) 才判，for=media 不判。
func TestFollowMemberSelf(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember&id=7", "")
	eq(t, got, `{"state":101,"info":"不能关注自己"}`)
	met(t, m)
}

// for=media：自媒体 id 命中且 userid 就是自己 → 101 不能关注自己的自媒体账号。
func TestFollowMemberSelfMedia(self *testing.T) {
	svc, m := newFollowService(self, fakeIdentity(7))
	m.ExpectQuery(qSelfMedia).WithArgs("42").WillReturnRows(sqlmock.NewRows([]string{"userid"}).AddRow("7"))
	got := do(self, svc, "GET", "/include/ajax.php?service=member&action=followMember&id=42&for=media", "")
	eq(self, got, `{"state":101,"info":"不能关注自己的自媒体账号"}`)
	met(self, m)
}

// for=media 命中：关注目标改成自媒体的 userid，fortype 写 "media"。
func TestFollowMemberInsertByMedia(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qSelfMedia).WithArgs("42").WillReturnRows(sqlmock.NewRows([]string{"userid"}).AddRow("9"))
	m.ExpectQuery(qFollowCount).WithArgs("7", "9").WillReturnRows(count(0))
	m.ExpectExec(qFollowInsert).WithArgs("9", "7", followNow, "media").WillReturnResult(sqlmock.NewResult(1, 1))
	expectLog(m, "7", 0, "insert", "添加会员关注(9=>7=>media)",
		"INSERT INTO `huoniao_member_follow` (`fid`, `tid`, `date`, `fortype`) VALUES ('9', '7', '1700000000', 'media')")
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember&id=42&for=media", "")
	eq(t, got, okBody)
	met(t, m)
}

// for=media 查不到自媒体：不报错，id 保持原值当会员 id 用。
func TestFollowMemberMediaMissingFallsBackToMemberID(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qSelfMedia).WithArgs("42").WillReturnRows(sqlmock.NewRows([]string{"userid"}))
	m.ExpectQuery(qFollowCount).WithArgs("7", "42").WillReturnRows(count(0))
	m.ExpectExec(qFollowInsert).WithArgs("42", "7", followNow, "media").WillReturnResult(sqlmock.NewResult(1, 1))
	expectLog(m, "7", 0, "insert", "添加会员关注(42=>7=>media)",
		"INSERT INTO `huoniao_member_follow` (`fid`, `tid`, `date`, `fortype`) VALUES ('42', '7', '1700000000', 'media')")
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember&id=42&for=media", "")
	eq(t, got, okBody)
	met(t, m)
}

// 已关注（COUNT>0）→ DELETE，且删除不看 fortype。
func TestFollowMemberToggleDelete(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qFollowCount).WithArgs("7", "9").WillReturnRows(count(1))
	m.ExpectExec(qFollowDelete).WithArgs("7", "9").WillReturnResult(sqlmock.NewResult(0, 1))
	expectLog(m, "7", 0, "delete", "删除会员关注(9=>7)",
		"DELETE FROM `huoniao_member_follow` WHERE `tid` = '7' AND `fid` = '9'")
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember&id=9", "")
	eq(t, got, okBody)
	met(t, m)
}

// from 优先于登录态，且完全不校验 cookie：匿名也能按 from 代操作。
func TestFollowMemberFromParamOverridesIdentity(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(-1))
	m.ExpectQuery(qFollowCount).WithArgs("9", "7").WillReturnRows(count(0))
	m.ExpectExec(qFollowInsert).WithArgs("7", "9", followNow, "").WillReturnResult(sqlmock.NewResult(1, 1))
	expectLog(m, "9", 0, "insert", "添加会员关注(7=>9=>)",
		"INSERT INTO `huoniao_member_follow` (`fid`, `tid`, `date`, `fortype`) VALUES ('7', '9', '1700000000', '')")
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember&id=7&from=9", "")
	eq(t, got, okBody)
	met(t, m)
}

// from 非数字串：PHP 松散比较把 'abc' 当 0 → 登录超时；'123abc' 当 123 → 继续，原串进 SQL。
func TestFollowMemberFromLooseCompare(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember&id=9&from=abc", "")
	eq(t, got, `{"state":101,"info":"登录超时，请重新登录！"}`)
	met(t, m)

	svc, m = newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qFollowCount).WithArgs("123abc", "9").WillReturnRows(count(0))
	m.ExpectExec(qFollowInsert).WithArgs("9", "123abc", followNow, "").WillReturnResult(sqlmock.NewResult(1, 1))
	expectLog(m, "123abc", 0, "insert", "添加会员关注(9=>123abc=>)",
		"INSERT INTO `huoniao_member_follow` (`fid`, `tid`, `date`, `fortype`) VALUES ('9', '123abc', '1700000000', '')")
	got = do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember&id=9&from=123abc", "")
	eq(t, got, okBody)
	met(t, m)
}

// id=1,2 是逗号整数串：整体原样进 SQL（由 MySQL 截断成 1），不是取首值。
func TestFollowMemberCommaIDGoesThrough(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qFollowCount).WithArgs("7", "1,2").WillReturnRows(count(0))
	m.ExpectExec(qFollowInsert).WithArgs("1,2", "7", followNow, "").WillReturnResult(sqlmock.NewResult(1, 1))
	expectLog(m, "7", 0, "insert", "添加会员关注(1,2=>7=>)",
		"INSERT INTO `huoniao_member_follow` (`fid`, `tid`, `date`, `fortype`) VALUES ('1,2', '7', '1700000000', '')")
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember&id=1,2", "")
	eq(t, got, okBody)
	met(t, m)
}

// 写库失败也返回 ok（PHP 侧不检查 dsqlOper 的返回值），日志照写。
func TestFollowMemberWriteFailureStillOK(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qFollowCount).WithArgs("7", "9").WillReturnRows(count(0))
	m.ExpectExec(qFollowInsert).WithArgs("9", "7", followNow, "").WillReturnError(errors.New("boom"))
	expectLog(m, "7", 0, "insert", "添加会员关注(9=>7=>)",
		"INSERT INTO `huoniao_member_follow` (`fid`, `tid`, `date`, `fortype`) VALUES ('9', '7', '1700000000', '')")
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember&id=9", "")
	eq(t, got, okBody)
	met(t, m)
}

// 同一秒内同 (md5, uid, ip) 已记过 → 不重复写 member_log。
func TestFollowMemberLogDeduplicated(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qFollowCount).WithArgs("7", "9").WillReturnRows(count(1))
	m.ExpectExec(qFollowDelete).WithArgs("7", "9").WillReturnResult(sqlmock.NewResult(0, 1))
	expectLog(m, "7", 1, "delete", "", "")
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember&id=9", "")
	eq(t, got, okBody)
	met(t, m)
}

// for 没有白名单：任意值原样写进 fortype，"media" 才触发自媒体解析。
func TestFollowMemberForIsNotWhitelisted(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qFollowCount).WithArgs("7", "9").WillReturnRows(count(0))
	m.ExpectExec(qFollowInsert).WithArgs("9", "7", followNow, "live").WillReturnResult(sqlmock.NewResult(1, 1))
	expectLog(m, "7", 0, "insert", "添加会员关注(9=>7=>live)",
		"INSERT INTO `huoniao_member_follow` (`fid`, `tid`, `date`, `fortype`) VALUES ('9', '7', '1700000000', 'live')")
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember&id=9&for=live", "")
	eq(t, got, okBody)
	met(t, m)
}

// 本地无数据库（DB=nil）时按「查不到数据」降级，不编造成功。
func TestFollowMemberNoDB(t *testing.T) {
	svc, err := New(Dep{TablePrefix: "huoniao_"})
	if err != nil {
		t.Fatal(err)
	}
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember&id=9", "")
	eq(t, got, `{"state":102,"info":"No data!"}`)
}

// addslashes 的四个字符（' " \\ 与 NUL）都要转义，其余原样——member_log.sql 列存的就是这个形态。
func TestAddSlashes(t *testing.T) {
	got := addSlashes(`a'b"c\d` + "\x00" + `e`)
	want := `a\'b\"c\\d\0e`
	if got != want {
		t.Fatalf("addSlashes = %q\nwant       %q", got, want)
	}
	if addSlashes("普通 SQL (`t` = '1')") != "普通 SQL (`t` = \\'1\\')" {
		t.Fatalf("引号没有转义: %q", addSlashes("普通 SQL (`t` = '1')"))
	}
}
