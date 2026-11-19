package member

import (
	"crypto/md5"
	"database/sql/driver"
	"encoding/hex"
	"errors"
	"testing"
	"time"

	sqlmock "github.com/DATA-DOG/go-sqlmock"
)

// 迁移自 member.class.php:13866-13915 的 followMember（#255）。
// SQL 用 QueryMatcherEqual 全串匹配，参数用 sqlmock 精确值 + argEq 断言文案。

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

	// httptest.NewRequest 固定给的主机与来源地址，member_log 的 url / ip 列就取这两个值。
	testLogIP  = "192.0.2.1:1234"
	testLogURL = "http://example.com/include/ajax.php"
)

// argEq 断言某个字符串参数的具体取值（sqlmock 自带的匹配器只能全精确或全任意）。
type argEq string

func (a argEq) Match(v driver.Value) bool {
	s, ok := v.(string)
	return ok && s == string(a)
}

func md5Hex(v string) string {
	sum := md5.Sum([]byte(v))
	return hex.EncodeToString(sum[:])
}

func newFollowService(t *testing.T, identity Identity) (*Service, sqlmock.Sqlmock) {
	return newFollowServiceWith(t, identity, nil)
}

func newFollowServiceWith(t *testing.T, identity Identity, mut func(*Dep)) (*Service, sqlmock.Sqlmock) {
	t.Helper()
	db, mock, err := sqlmock.New(sqlmock.QueryMatcherOption(sqlmock.QueryMatcherEqual))
	if err != nil {
		t.Fatalf("sqlmock: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })
	dep := Dep{
		DB: db, TablePrefix: "huoniao_", Identity: identity,
		Clock: func() time.Time { return fixedNow },
	}
	if mut != nil {
		mut(&dep)
	}
	svc, err := New(dep)
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	return svc, mock
}

// expectLog 期待 member_log 的去重查询 + 写入；param 是该请求的 service/action/业务参数按字典序拼接。
func expectLog(m sqlmock.Sqlmock, uid string, seen int, action, note, param, sqlText string) {
	m.ExpectQuery(qLogCount).
		WithArgs(md5Hex(note), uid, testLogIP, followNow).
		WillReturnRows(count(seen))
	if seen > 0 {
		return
	}
	m.ExpectExec(qLogInsert).
		WithArgs(uid, "member", "follow", int64(0), action, argEq(note), "", testLogIP, "", "",
			argEq(sqlText), followNow, md5Hex(note), testLogURL, argEq(param), "").
		WillReturnResult(sqlmock.NewResult(1, 1))
}

// id 经 ajax.php 归一后为空串（或数组拼成的 "0"）→ 101 参数错误，且不碰数据库。
func TestFollowMemberBadID(t *testing.T) {
	for _, q := range []string{"", "&id=abc", "&id=0", "&id=", "&id%5B%5D=0", "&id%5B%5D=abc"} {
		svc, m := newFollowService(t, fakeIdentity(7))
		got := do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember"+q, "")
		eq(t, got, `{"state":101,"info":"参数错误"}`)
		met(t, m)
	}
}

// id[]=1&id[]=2 走数组分支，拼成 "1,2" 后不是空串。
func TestFollowMemberArrayIDIsCommaString(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qFollowCount).WithArgs("7", "1,2").WillReturnRows(count(0))
	m.ExpectExec(qFollowInsert).WithArgs("1,2", "7", followNow, "").WillReturnResult(sqlmock.NewResult(1, 1))
	expectLog(m, "7", 0, "insert", "添加会员关注(1,2=>7=>)",
		"action=followMember&id[]=1&id[]=2&service=member",
		"INSERT INTO `huoniao_member_follow` (`fid`, `tid`, `date`, `fortype`) VALUES ('1,2', '7', '1700000000', '')")
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember&id%5B%5D=1&id%5B%5D=2", "")
	eq(t, got, okBody)
	met(t, m)
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
func TestFollowMemberSelfMedia(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qSelfMedia).WithArgs("42").WillReturnRows(sqlmock.NewRows([]string{"userid"}).AddRow("7"))
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember&id=42&for=media", "")
	eq(t, got, `{"state":101,"info":"不能关注自己的自媒体账号"}`)
	met(t, m)
}

// for=media 命中：关注目标改成自媒体的 userid，fortype 写 "media"。
func TestFollowMemberInsertByMedia(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qSelfMedia).WithArgs("42").WillReturnRows(sqlmock.NewRows([]string{"userid"}).AddRow("9"))
	m.ExpectQuery(qFollowCount).WithArgs("7", "9").WillReturnRows(count(0))
	m.ExpectExec(qFollowInsert).WithArgs("9", "7", followNow, "media").WillReturnResult(sqlmock.NewResult(1, 1))
	expectLog(m, "7", 0, "insert", "添加会员关注(9=>7=>media)",
		"action=followMember&for=media&id=42&service=member",
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
		"action=followMember&for=media&id=42&service=member",
		"INSERT INTO `huoniao_member_follow` (`fid`, `tid`, `date`, `fortype`) VALUES ('42', '7', '1700000000', 'media')")
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember&id=42&for=media", "")
	eq(t, got, okBody)
	met(t, m)
}

// for=media 命中但 userid 为 NULL：PHP 无条件 `$id = null`，拼进 SQL 等同空串。
func TestFollowMemberMediaNullUserID(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qSelfMedia).WithArgs("42").WillReturnRows(sqlmock.NewRows([]string{"userid"}).AddRow(nil))
	m.ExpectQuery(qFollowCount).WithArgs("7", "").WillReturnRows(count(0))
	m.ExpectExec(qFollowInsert).WithArgs("", "7", followNow, "media").WillReturnResult(sqlmock.NewResult(1, 1))
	expectLog(m, "7", 0, "insert", "添加会员关注(=>7=>media)",
		"action=followMember&for=media&id=42&service=member",
		"INSERT INTO `huoniao_member_follow` (`fid`, `tid`, `date`, `fortype`) VALUES ('', '7', '1700000000', 'media')")
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
		"action=followMember&id=9&service=member",
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
		"action=followMember&from=9&id=7&service=member",
		"INSERT INTO `huoniao_member_follow` (`fid`, `tid`, `date`, `fortype`) VALUES ('7', '9', '1700000000', '')")
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember&id=7&from=9", "")
	eq(t, got, okBody)
	met(t, m)
}

// from 非数字串：PHP 松散比较把 'abc' 当 0 → 登录超时；'123abc' 当 123 → 继续，
// SQL 里用原串（MySQL 截断成 123），member_log 的 uid 是 (int) 后的 123。
func TestFollowMemberFromLooseCompare(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember&id=9&from=abc", "")
	eq(t, got, `{"state":101,"info":"登录超时，请重新登录！"}`)
	met(t, m)

	svc, m = newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qFollowCount).WithArgs("123abc", "9").WillReturnRows(count(0))
	m.ExpectExec(qFollowInsert).WithArgs("9", "123abc", followNow, "").WillReturnResult(sqlmock.NewResult(1, 1))
	expectLog(m, "123", 0, "insert", "添加会员关注(9=>123abc=>)",
		"action=followMember&from=123abc&id=9&service=member",
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
		"action=followMember&id=1,2&service=member",
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
		"action=followMember&id=9&service=member",
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
	expectLog(m, "7", 1, "delete", "删除会员关注(9=>7)", "", "")
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
		"action=followMember&for=live&id=9&service=member",
		"INSERT INTO `huoniao_member_follow` (`fid`, `tid`, `date`, `fortype`) VALUES ('9', '7', '1700000000', 'live')")
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember&id=9&for=live", "")
	eq(t, got, okBody)
	met(t, m)
}

// for 是数组时 PHP 会把它转成 "Array" 写进 fortype，而且 empty(array) 为假 → 不判「关注自己」。
func TestFollowMemberArrayForBecomesArrayString(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qFollowCount).WithArgs("7", "7").WillReturnRows(count(0))
	m.ExpectExec(qFollowInsert).WithArgs("7", "7", followNow, "Array").WillReturnResult(sqlmock.NewResult(1, 1))
	expectLog(m, "7", 0, "insert", "添加会员关注(7=>7=>Array)",
		"action=followMember&for[]=live&id=7&service=member",
		"INSERT INTO `huoniao_member_follow` (`fid`, `tid`, `date`, `fortype`) VALUES ('7', '7', '1700000000', 'Array')")
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember&id=7&for%5B%5D=live", "")
	eq(t, got, okBody)
	met(t, m)
}

// for=0 在 PHP 里 empty() 为真 → 仍会判「关注自己」，且 fortype 写 "0"。
func TestFollowMemberForZeroIsEmpty(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember&id=7&for=0", "")
	eq(t, got, `{"state":101,"info":"不能关注自己"}`)
	met(t, m)
}

// 本地无数据库（DB=nil）时：参数/登录校验照旧（不依赖库），真正要读写 member_follow 才降级 102。
func TestFollowMemberNoDB(t *testing.T) {
	svc, err := New(Dep{TablePrefix: "huoniao_"})
	if err != nil {
		t.Fatal(err)
	}
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember", "")
	eq(t, got, `{"state":101,"info":"参数错误"}`)
	got = do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember&id=9", "")
	eq(t, got, `{"state":101,"info":"登录超时，请重新登录！"}`)

	svc, err = New(Dep{TablePrefix: "huoniao_", Identity: fakeIdentity(7)})
	if err != nil {
		t.Fatal(err)
	}
	got = do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember&id=9", "")
	eq(t, got, `{"state":102,"info":"No data!"}`)
}

// cookie 路径下 $userid 是 int：PHP 7 里 7 == "7,8" 为真（字符串按 (int) 转成 7），仍判「关注自己」。
func TestFollowMemberIntCompareAgainstCommaID(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember&id=7,8", "")
	eq(t, got, `{"state":101,"info":"不能关注自己"}`)
	met(t, m)

	// 同一个 id 走 from（字符串）路径时 7 是字符串，"7" 与 "7,8" 都不是数字串 → 按字符串比 → 不相等，继续关注。
	svc, m = newFollowService(t, fakeIdentity(9))
	m.ExpectQuery(qFollowCount).WithArgs("7", "7,8").WillReturnRows(count(0))
	m.ExpectExec(qFollowInsert).WithArgs("7,8", "7", followNow, "").WillReturnResult(sqlmock.NewResult(1, 1))
	expectLog(m, "7", 0, "insert", "添加会员关注(7,8=>7=>)",
		"action=followMember&from=7&id=7,8&service=member",
		"INSERT INTO `huoniao_member_follow` (`fid`, `tid`, `date`, `fortype`) VALUES ('7,8', '7', '1700000000', '')")
	got = do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember&id=7,8&from=7", "")
	eq(t, got, okBody)
	met(t, m)
}

// member_log 过期清理：配了 MemberLogSaveDays 就删 pubdate 早于 now-days*86400 的行，6 小时内只删一次。
// 清理发生在 memberLog 内部，也就是关注/取关写完之后。
func TestFollowMemberLogCleanupThrottled(t *testing.T) {
	days := 30
	svc, m := newFollowServiceWith(t, fakeIdentity(7), func(d *Dep) { d.MemberLogSaveDays = &days })
	m.ExpectQuery(qFollowCount).WithArgs("7", "9").WillReturnRows(count(0))
	m.ExpectExec(qFollowInsert).WithArgs("9", "7", followNow, "").WillReturnResult(sqlmock.NewResult(1, 1))
	m.ExpectExec("DELETE FROM `huoniao_member_log` WHERE `pubdate` < ?").
		WithArgs(int64(1700000000 - 30*86400)).
		WillReturnResult(sqlmock.NewResult(0, 3))
	expectLog(m, "7", 0, "insert", "添加会员关注(9=>7=>)",
		"action=followMember&id=9&service=member",
		"INSERT INTO `huoniao_member_follow` (`fid`, `tid`, `date`, `fortype`) VALUES ('9', '7', '1700000000', '')")
	eq(t, do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember&id=9", ""), okBody)
	met(t, m)

	// 同一秒的第二次请求：节流命中，不再 DELETE（未登记该期望，出现即报错）。
	m.ExpectQuery(qFollowCount).WithArgs("7", "9").WillReturnRows(count(1))
	m.ExpectExec(qFollowDelete).WithArgs("7", "9").WillReturnResult(sqlmock.NewResult(0, 1))
	expectLog(m, "7", 1, "delete", "删除会员关注(9=>7)", "", "")
	eq(t, do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember&id=9", ""), okBody)
	met(t, m)
}

// DELETE 失败也照样节流：PHP 的 cache_write 不看 dsqlOper 结果，第二次请求不应重试 DELETE。
func TestFollowMemberLogCleanupFailureStillThrottled(t *testing.T) {
	days := 30
	svc, m := newFollowServiceWith(t, fakeIdentity(7), func(d *Dep) { d.MemberLogSaveDays = &days })
	m.ExpectQuery(qFollowCount).WithArgs("7", "9").WillReturnRows(count(0))
	m.ExpectExec(qFollowInsert).WithArgs("9", "7", followNow, "").WillReturnResult(sqlmock.NewResult(1, 1))
	m.ExpectExec("DELETE FROM `huoniao_member_log` WHERE `pubdate` < ?").
		WithArgs(int64(1700000000 - 30*86400)).
		WillReturnError(errors.New("table is locked"))
	expectLog(m, "7", 0, "insert", "添加会员关注(9=>7=>)",
		"action=followMember&id=9&service=member",
		"INSERT INTO `huoniao_member_follow` (`fid`, `tid`, `date`, `fortype`) VALUES ('9', '7', '1700000000', '')")
	eq(t, do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember&id=9", ""), okBody)
	met(t, m)

	m.ExpectQuery(qFollowCount).WithArgs("7", "9").WillReturnRows(count(1))
	m.ExpectExec(qFollowDelete).WithArgs("7", "9").WillReturnResult(sqlmock.NewResult(0, 1))
	expectLog(m, "7", 1, "delete", "删除会员关注(9=>7)", "", "")
	eq(t, do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember&id=9", ""), okBody)
	met(t, m)
}

// 去重查询失败时 PHP 仍会写日志（if($ret && ...) 不成立），Go 同样继续 INSERT。
func TestFollowMemberLogCountErrorStillWrites(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qFollowCount).WithArgs("7", "9").WillReturnRows(count(0))
	m.ExpectExec(qFollowInsert).WithArgs("9", "7", followNow, "").WillReturnResult(sqlmock.NewResult(1, 1))
	m.ExpectQuery(qLogCount).WillReturnError(errors.New("log table missing"))
	m.ExpectExec(qLogInsert).
		WithArgs("7", "member", "follow", int64(0), "insert", argEq("添加会员关注(9=>7=>)"), "", testLogIP, "", "",
			argEq("INSERT INTO `huoniao_member_follow` (`fid`, `tid`, `date`, `fortype`) VALUES ('9', '7', '1700000000', '')"),
			followNow, md5Hex("添加会员关注(9=>7=>)"), testLogURL, argEq("action=followMember&id=9&service=member"), "").
		WillReturnResult(sqlmock.NewResult(1, 1))
	eq(t, do(t, svc, "GET", "/include/ajax.php?service=member&action=followMember&id=9", ""), okBody)
	met(t, m)
}
