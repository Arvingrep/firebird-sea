package member

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	sqlmock "github.com/DATA-DOG/go-sqlmock"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// 迁移自 member.class.php:17817-18021 的 replyComment（#259）。
// SQL 用 QueryMatcherEqual 全串匹配；memberLog 的 note / sql 用 argEq 断言。

const (
	qGateMember = "SELECT `mtype`, `certifyState`, `licenseState`, `phone`, `phoneCheck`, `phoneBindTime` FROM `huoniao_member` WHERE `state` = 1 AND `mtype` != 0 AND `mtype` != 3 AND `id` = ?"
	qBusiState  = "SELECT `state` FROM `huoniao_business_list` WHERE `uid` = ? AND `state` != 4"
	qOrigin     = "SELECT `id`, `pid`, `rid`, `aid`, `type`, `masterid` FROM `huoniao_public_comment_all` WHERE `id` = ?"
	qParent     = "SELECT `id`, `pid`, `rid`, `aid`, `type` FROM `huoniao_public_comment_all` WHERE `id` = ?"
	qLookup     = "SELECT `id`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `zan`, `zan_user`, `ischeck` FROM `huoniao_public_comment_all` WHERE `id` = ?"
	qInsert     = "INSERT INTO `huoniao_public_comment` (`masterid`, `pid`, `type`, `aid`, `oid`, `userid`, `rating`, `sco1`, `content`, `pics`, `audio`, `video`, `dtime`, `ip`, `ipaddr`, `ischeck`, `zan`, `zan_user`, `isanony`, `rid`, `sid`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
)

// replyGet 请求 replyComment，query 形如 "id=5&content=hi"（不含 service/action）。
func replyGet(t *testing.T, svc *Service, identity Identity, query string) string {
	t.Helper()
	return do(t, svc, "GET", "/include/ajax.php?service=member&action=replyComment&"+query, "")
}

// replyGetUA 同 replyGet 但带自定义 UA（安卓 App 分支用）。
func replyGetUA(t *testing.T, svc *Service, query, ua string) string {
	t.Helper()
	router := ajax.NewRouter(func(string) {})
	Register(router, svc)
	req := httptest.NewRequest("GET", "/include/ajax.php?service=member&action=replyComment&"+query, strings.NewReader(""))
	req.Header.Set("User-Agent", ua)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)
	return rec.Body.String()
}

// originRow 是原评论查询的返回行（id,pid,rid,aid,type,masterid）。
func originRow(id, pid, rid, aid, typ, masterid any) *sqlmock.Rows {
	return sqlmock.NewRows([]string{"id", "pid", "rid", "aid", "type", "masterid"}).AddRow(id, pid, rid, aid, typ, masterid)
}

// parentRow 是父评论查询的返回行（id,pid,rid,aid,type）。
func parentRow(id, pid, rid, aid, typ any) *sqlmock.Rows {
	return sqlmock.NewRows([]string{"id", "pid", "rid", "aid", "type"}).AddRow(id, pid, rid, aid, typ)
}

// gateRow 是实名/手机门禁字段查询的返回行（mtype,certifyState,licenseState,phone,phoneCheck,phoneBindTime）。
func gateRow(mtype, certify, license, phone, phoneCheck, phoneBind any) *sqlmock.Rows {
	return sqlmock.NewRows([]string{"mtype", "certifyState", "licenseState", "phone", "phoneCheck", "phoneBindTime"}).
		AddRow(mtype, certify, license, phone, phoneCheck, phoneBind)
}

// lookupRow 是 check=1 回查的返回行（id,userid,content,dtime,ip,ipaddr,zan,zan_user,ischeck）。
func lookupRow(id, userid, content, dtime, ip, ipaddr, zan, zanUser, ischeck any) *sqlmock.Rows {
	return sqlmock.NewRows([]string{"id", "userid", "content", "dtime", "ip", "ipaddr", "zan", "zan_user", "ischeck"}).
		AddRow(id, userid, content, dtime, ip, ipaddr, zan, zanUser, ischeck)
}

// replyInsertText 复刻 memberLog 留档的 PHP 风格 INSERT 串（值按 Go 实际传参插值）。
func replyInsertText(masterid, pid, typ, aid, content string, userid, ischeck int64, rid string, sid int64) string {
	return "INSERT INTO `huoniao_public_comment` (`masterid`, `pid`, `type`, `aid`, `oid`, `userid`, `rating`, `sco1`, `content`, `pics`, `audio`, `video`, `dtime`, `ip`, `ipaddr`, `ischeck`, `zan`, `zan_user`, `isanony`, `rid`, `sid`) VALUES ('" +
		masterid + "', '" + pid + "', '" + typ + "', '" + aid + "', '0', '" + strconvItoa64(userid) +
		"', '0', '0', '" + content + "', '', '', '', '" + strconvItoa64(followNow) + "', '" + testLogIP +
		"', '', '" + strconvItoa64(ischeck) + "', '0', '', '0', '" + rid + "', '" + strconvItoa64(sid) + "')"
}

func strconvItoa64(v int64) string {
	if v == followNow {
		return "1700000000"
	}
	return fmtInt(v)
}

// fmtInt 避免引入 strconv 的别名冲突。
func fmtInt(v int64) string {
	if v == 0 {
		return "0"
	}
	neg := v < 0
	if neg {
		v = -v
	}
	var buf [20]byte
	i := len(buf)
	for v > 0 {
		i--
		buf[i] = byte('0' + v%10)
		v /= 10
	}
	if neg {
		i--
		buf[i] = '-'
	}
	return string(buf[i:])
}

// expectLogReply 期待 member_log 的去重查询 + 写入（replyComment：temp=comment，aid=0，ua 是请求 UA）。
func expectLogReply(m sqlmock.Sqlmock, uid, note, param, sqlText, ua string) {
	m.ExpectQuery(qLogCount).
		WithArgs(md5Hex(note), uid, testLogIP, followNow).
		WillReturnRows(count(0))
	m.ExpectExec(qLogInsert).
		WithArgs(uid, "member", "comment", int64(0), "insert", argEq(note), "", testLogIP, "", ua,
			argEq(sqlText), followNow, md5Hex(note), testLogURL, argEq(param), "").
		WillReturnResult(sqlmock.NewResult(1, 1))
}

// 禁止评论开关最先判（先于登录门禁，匿名也拦截）：默认文案、自定义文案、"0" 视为假。
func TestReplyDisableComment(t *testing.T) {
	svc, m := newFollowServiceWith(t, fakeIdentity(-1), func(d *Dep) {
		state := 1
		d.DisableCommentState = &state
	})
	got := replyGet(t, svc, fakeIdentity(-1), "id=5&content=hi")
	eq(t, got, `{"state":101,"info":"功能维护中，暂停使用！"}`)
	met(t, m)

	svc, m = newFollowServiceWith(t, fakeIdentity(-1), func(d *Dep) {
		state, info := 2, "评论维护中"
		d.DisableCommentState = &state
		d.DisableCommentInfo = &info
	})
	got = replyGet(t, svc, fakeIdentity(-1), "")
	eq(t, got, `{"state":101,"info":"评论维护中"}`)
	met(t, m)
}

// 未登录：登录门禁先于参数门禁，任何参数都拦在「登录超时」（没有 from 后门）。
func TestReplyLoginGate(t *testing.T) {
	for _, q := range []string{"", "id=5&content=hi", "check=1"} {
		svc, m := newFollowService(t, fakeIdentity(-1))
		got := replyGet(t, svc, fakeIdentity(-1), q)
		eq(t, got, `{"state":101,"info":"登录超时，请重新登录！"}`)
		met(t, m)
	}
}

// 参数门禁：id 归一后取整为 0 → 参数错误；content 空（” / '0' / 缺失）→ 请填写回复内容。
// 实名/手机开关全关时不查门禁字段，这里不涉及任何 SQL。
func TestReplyParamGate(t *testing.T) {
	for _, q := range []string{"", "&id=abc", "&id=0", "&id=", "&id%5B%5D=0"} {
		svc, m := newFollowService(t, fakeIdentity(7))
		got := replyGet(t, svc, fakeIdentity(7), q)
		eq(t, got, `{"state":101,"info":"参数错误"}`)
		met(t, m)
	}
	for _, q := range []string{"&id=5", "&id=5&content=", "&id=5&content=0"} {
		svc, m := newFollowService(t, fakeIdentity(7))
		got := replyGet(t, svc, fakeIdentity(7), q)
		eq(t, got, `{"state":101,"info":"请填写回复内容"}`)
		met(t, m)
	}
}

// 原评论 id 查无 → 101 原评价不存在。
func TestReplyOriginMissing(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qOrigin).WithArgs(int64(5)).WillReturnRows(
		sqlmock.NewRows([]string{"id", "pid", "rid", "aid", "type", "masterid"}))
	got := replyGet(t, svc, fakeIdentity(7), "id=5&content=hi")
	eq(t, got, `{"state":101,"info":"原评价不存在"}`)
	met(t, m)
}

// 一级评论 + check=1：INSERT（ischeck=1）、memberLog、回查拼 userinfo 结构（键序同 PHP $list）。
func TestReplyFirstLevelCheck(t *testing.T) {
	svc, m := newFollowServiceWith(t, fakeIdentity(7), func(d *Dep) {
		d.ModuleCommentCheck = func(string) int { return 1 }
		d.UserDetail = func(context.Context, *http.Request, string, bool) (any, error) {
			return map[string]any{"nickname": "张三"}, nil
		}
	})
	m.ExpectQuery(qOrigin).WithArgs(int64(5)).
		WillReturnRows(originRow("5", "0", "0", "99", "article-detail", "0"))
	m.ExpectExec(qInsert).
		WithArgs("0", "5", "article-detail", "99", int64(0), int64(7), int64(0), int64(0), "hi",
			"", "", "", followNow, testLogIP, "", int64(1), int64(0), "", int64(0), "5", int64(5)).
		WillReturnResult(sqlmock.NewResult(123, 1))
	expectLogReply(m, "7", "回复评价(article-detail=>99)",
		"action=replyComment&check=1&content=hi&id=5&service=member",
		replyInsertText("0", "5", "article-detail", "99", "hi", 7, 1, "5", 5), "")
	m.ExpectQuery(qLookup).WithArgs(int64(123)).
		WillReturnRows(lookupRow("123", "7", "hi", "1700000000", "192.0.2.1:1234", "", "0", "", "1"))
	got := replyGet(t, svc, fakeIdentity(7), "id=5&content=hi&check=1")
	eq(t, got, `{"state":100,"info":{"id":"123","userinfo":{"nickname":"张三"},"content":"hi","dtime":"1700000000","ftime":"刚刚","ip":"192.0.2.1:1234","ipaddr":"","iphome":"","zan":"0","ischeck":"1"}}`)
	met(t, m)
}

// 一级评论 + 非 check 普通请求：info 是「评价成功！」；ischeck 默认 0（未注入 ModuleCommentCheck）。
func TestReplyFirstLevelNoCheck(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qOrigin).WithArgs(int64(5)).
		WillReturnRows(originRow("5", "0", "0", "99", "article-detail", "0"))
	m.ExpectExec(qInsert).
		WithArgs("0", "5", "article-detail", "99", int64(0), int64(7), int64(0), int64(0), "hi",
			"", "", "", followNow, testLogIP, "", int64(0), int64(0), "", int64(0), "5", int64(5)).
		WillReturnResult(sqlmock.NewResult(124, 1))
	expectLogReply(m, "7", "回复评价(article-detail=>99)",
		"action=replyComment&content=hi&id=5&service=member",
		replyInsertText("0", "5", "article-detail", "99", "hi", 7, 0, "5", 5), "")
	got := replyGet(t, svc, fakeIdentity(7), "id=5&content=hi")
	eq(t, got, `{"state":100,"info":"评价成功！"}`)
	met(t, m)
}

// 安卓 App UA + type=article-detail：message/isCheck/lastid（ischeck 0/1 两种文案）；
// harmony UA 或非 article-detail 回到普通文案。
func TestReplyAndroidArticleDetail(t *testing.T) {
	for _, tc := range []struct {
		ua, typ, ischeck, want string
	}{
		{"huoniao_android_1.0", "article-detail", "0", `{"state":100,"info":{"message":"评论成功，将在审核后显示。","isCheck":0,"lastid":125}}`},
		{"huoniao_android_1.0", "article-detail", "1", `{"state":100,"info":{"message":"评价成功！","isCheck":1,"lastid":125}}`},
		{"huoniao_harmony_1.0", "article-detail", "0", `{"state":100,"info":"评价成功！"}`},
		{"huoniao_android_1.0", "tieba-detail", "0", `{"state":100,"info":"评价成功！"}`},
	} {
		// 循环变量捕获：闭包取局部快照，避免拿到最后一个 tc。
		ischeck := phpIntval(tc.ischeck)
		svc, m := newFollowServiceWith(t, fakeIdentity(7), func(d *Dep) {
			d.ModuleCommentCheck = func(string) int { return ischeck }
		})
		m.ExpectQuery(qOrigin).WithArgs(int64(5)).
			WillReturnRows(originRow("5", "0", "0", "99", tc.typ, "0"))
		m.ExpectExec(qInsert).
			WithArgs("0", "5", tc.typ, "99", int64(0), int64(7), int64(0), int64(0), "hi",
				"", "", "", followNow, testLogIP, "", int64(ischeck), int64(0), "", int64(0), "5", int64(5)).
			WillReturnResult(sqlmock.NewResult(125, 1))
		expectLogReply(m, "7", "回复评价("+tc.typ+"=>99)",
			"action=replyComment&content=hi&id=5&service=member",
			replyInsertText("0", "5", tc.typ, "99", "hi", 7, int64(ischeck), "5", 5), tc.ua)
		got := replyGetUA(t, svc, "id=5&content=hi", tc.ua)
		eq(t, got, tc.want)
		met(t, m)
	}
}

// 二级评论：父行存在时 rid 沿用本行 rid（为假值时取本行 id），pid/type/aid 取父行。
func TestReplySecondLevel(t *testing.T) {
	svc, m := newFollowServiceWith(t, fakeIdentity(7), func(d *Dep) {
		d.ModuleCommentCheck = func(m string) int {
			if m != "article" {
				t.Fatalf("module = %q, want article", m)
			}
			return 0
		}
	})
	m.ExpectQuery(qOrigin).WithArgs(int64(5)).
		WillReturnRows(originRow("5", "3", "0", "99", "article-detail", "0"))
	m.ExpectQuery(qParent).WithArgs("3").
		WillReturnRows(parentRow("3", "0", "0", "88", "article-detail"))
	m.ExpectExec(qInsert).
		WithArgs("0", "3", "article-detail", "88", int64(0), int64(7), int64(0), int64(0), "hi",
			"", "", "", followNow, testLogIP, "", int64(0), int64(0), "", int64(0), "5", int64(5)).
		WillReturnResult(sqlmock.NewResult(126, 1))
	expectLogReply(m, "7", "回复评价(article-detail=>88)",
		"action=replyComment&content=hi&id=5&service=member",
		replyInsertText("0", "3", "article-detail", "88", "hi", 7, 0, "5", 5), "")
	got := replyGet(t, svc, fakeIdentity(7), "id=5&content=hi")
	eq(t, got, `{"state":100,"info":"评价成功！"}`)
	met(t, m)
}

// 二级评论父行被删：$parent 未定义继续跑——pid/type/aid 全空串、ischeck=0、module 为空、
// rid 未定义（null == 0）→ rid = 原评论 id。照搬，不补校验。
func TestReplyParentMissing(t *testing.T) {
	var checkModule string
	svc, m := newFollowServiceWith(t, fakeIdentity(7), func(d *Dep) {
		d.ModuleCommentCheck = func(m string) int { checkModule = m; return 0 }
	})
	m.ExpectQuery(qOrigin).WithArgs(int64(5)).
		WillReturnRows(originRow("5", "77", "0", "99", "article-detail", "0"))
	m.ExpectQuery(qParent).WithArgs("77").
		WillReturnRows(sqlmock.NewRows([]string{"id", "pid", "rid", "aid", "type"}))
	m.ExpectExec(qInsert).
		WithArgs("0", "", "", "", int64(0), int64(7), int64(0), int64(0), "hi",
			"", "", "", followNow, testLogIP, "", int64(0), int64(0), "", int64(0), "5", int64(5)).
		WillReturnResult(sqlmock.NewResult(127, 1))
	expectLogReply(m, "7", "回复评价(=>)",
		"action=replyComment&content=hi&id=5&service=member",
		replyInsertText("0", "", "", "", "hi", 7, 0, "5", 5), "")
	got := replyGet(t, svc, fakeIdentity(7), "id=5&content=hi")
	eq(t, got, `{"state":100,"info":"评价成功！"}`)
	met(t, m)
	if checkModule != "" {
		t.Fatalf("module = %q, want 空串（type 为 null）", checkModule)
	}
}

// 本行 rid 有值时沿用（父链收口），不被覆盖成原评论 id。
func TestReplySecondLevelKeepsRid(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qOrigin).WithArgs(int64(5)).
		WillReturnRows(originRow("5", "3", "2", "99", "article-detail", "0"))
	m.ExpectQuery(qParent).WithArgs("3").
		WillReturnRows(parentRow("3", "0", "0", "88", "article-detail"))
	m.ExpectExec(qInsert).
		WithArgs("0", "3", "article-detail", "88", int64(0), int64(7), int64(0), int64(0), "hi",
			"", "", "", followNow, testLogIP, "", int64(0), int64(0), "", int64(0), "2", int64(5)).
		WillReturnResult(sqlmock.NewResult(128, 1))
	expectLogReply(m, "7", "回复评价(article-detail=>88)",
		"action=replyComment&content=hi&id=5&service=member",
		replyInsertText("0", "3", "article-detail", "88", "hi", 7, 0, "2", 5), "")
	got := replyGet(t, svc, fakeIdentity(7), "id=5&content=hi")
	eq(t, got, `{"state":100,"info":"评价成功！"}`)
	met(t, m)
}

// INSERT 失败 → 101 评价失败，不记 memberLog。
func TestReplyInsertFail(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qOrigin).WithArgs(int64(5)).
		WillReturnRows(originRow("5", "0", "0", "99", "article-detail", "0"))
	m.ExpectExec(qInsert).
		WithArgs("0", "5", "article-detail", "99", int64(0), int64(7), int64(0), int64(0), "hi",
			"", "", "", followNow, testLogIP, "", int64(0), int64(0), "", int64(0), "5", int64(5)).
		WillReturnError(context.DeadlineExceeded)
	got := replyGet(t, svc, fakeIdentity(7), "id=5&content=hi")
	eq(t, got, `{"state":101,"info":"评价失败"}`)
	met(t, m)
}

// check=1 回查查不到（合并表可见性异常）→ PHP 返回 null → 102 "No data!"。
func TestReplyCheckLookupEmpty(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qOrigin).WithArgs(int64(5)).
		WillReturnRows(originRow("5", "0", "0", "99", "article-detail", "0"))
	m.ExpectExec(qInsert).
		WithArgs("0", "5", "article-detail", "99", int64(0), int64(7), int64(0), int64(0), "hi",
			"", "", "", followNow, testLogIP, "", int64(0), int64(0), "", int64(0), "5", int64(5)).
		WillReturnResult(sqlmock.NewResult(129, 1))
	expectLogReply(m, "7", "回复评价(article-detail=>99)",
		"action=replyComment&check=1&content=hi&id=5&service=member",
		replyInsertText("0", "5", "article-detail", "99", "hi", 7, 0, "5", 5), "")
	m.ExpectQuery(qLookup).WithArgs(int64(129)).
		WillReturnRows(sqlmock.NewRows([]string{"id", "userid", "content", "dtime", "ip", "ipaddr", "zan", "zan_user", "ischeck"}))
	got := replyGet(t, svc, fakeIdentity(7), "id=5&content=hi&check=1")
	eq(t, got, `{"state":102,"info":"No data!"}`)
	met(t, m)
}

// check=1 但 UserDetail（member.detail，#253）未注入 → 按缺依赖降级 102（同 #251 的口径）。
func TestReplyCheckUserDetailNil(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qOrigin).WithArgs(int64(5)).
		WillReturnRows(originRow("5", "0", "0", "99", "article-detail", "0"))
	m.ExpectExec(qInsert).
		WithArgs("0", "5", "article-detail", "99", int64(0), int64(7), int64(0), int64(0), "hi",
			"", "", "", followNow, testLogIP, "", int64(0), int64(0), "", int64(0), "5", int64(5)).
		WillReturnResult(sqlmock.NewResult(130, 1))
	expectLogReply(m, "7", "回复评价(article-detail=>99)",
		"action=replyComment&check=1&content=hi&id=5&service=member",
		replyInsertText("0", "5", "article-detail", "99", "hi", 7, 0, "5", 5), "")
	m.ExpectQuery(qLookup).WithArgs(int64(130)).
		WillReturnRows(lookupRow("130", "7", "hi", "1700000000", "192.0.2.1:1234", "", "0", "", "0"))
	got := replyGet(t, svc, fakeIdentity(7), "id=5&content=hi&check=1")
	eq(t, got, `{"state":102,"info":"No data!"}`)
	met(t, m)
}

// paotui/waimai 订单的 type 映射成 module=waimai（ModuleCommentCheck 收到 "waimai"）。
func TestReplyWaimaiModule(t *testing.T) {
	var gotModule string
	svc, m := newFollowServiceWith(t, fakeIdentity(7), func(d *Dep) {
		d.ModuleCommentCheck = func(m string) int { gotModule = m; return 0 }
	})
	m.ExpectQuery(qOrigin).WithArgs(int64(5)).
		WillReturnRows(originRow("5", "0", "0", "99", "paotui-order", "0"))
	m.ExpectExec(qInsert).
		WithArgs("0", "5", "paotui-order", "99", int64(0), int64(7), int64(0), int64(0), "hi",
			"", "", "", followNow, testLogIP, "", int64(0), int64(0), "", int64(0), "5", int64(5)).
		WillReturnResult(sqlmock.NewResult(131, 1))
	expectLogReply(m, "7", "回复评价(paotui-order=>99)",
		"action=replyComment&content=hi&id=5&service=member",
		replyInsertText("0", "5", "paotui-order", "99", "hi", 7, 0, "5", 5), "")
	got := replyGet(t, svc, fakeIdentity(7), "id=5&content=hi")
	eq(t, got, `{"state":100,"info":"评价成功！"}`)
	met(t, m)
	if gotModule != "waimai" {
		t.Fatalf("module = %q, want waimai", gotModule)
	}
}

// 实名认证：cfg_memberVerified 开、普通会员 certifyState != 1 → 201（info 原样透传，不改码）。
func TestReplyVerified201(t *testing.T) {
	svc, m := newFollowServiceWith(t, fakeIdentity(7), func(d *Dep) {
		verified, info := 1, "请先完成实名认证"
		d.MemberVerified = &verified
		d.MemberVerifiedInfo = &info
	})
	m.ExpectQuery(qGateMember).WithArgs(int64(7)).
		WillReturnRows(gateRow("1", "0", "0", "13800000000", "1", "1700000000"))
	got := replyGet(t, svc, fakeIdentity(7), "id=5&content=hi")
	eq(t, got, `{"state":201,"info":"请先完成实名认证"}`)
	met(t, m)

	// 未配置 info → info 输出 null（PHP 的 cfg 未设置是 null）。
	svc, m = newFollowServiceWith(t, fakeIdentity(7), func(d *Dep) {
		verified := 1
		d.MemberVerified = &verified
	})
	m.ExpectQuery(qGateMember).WithArgs(int64(7)).
		WillReturnRows(gateRow("1", "0", "0", "13800000000", "1", "1700000000"))
	got = replyGet(t, svc, fakeIdentity(7), "id=5&content=hi")
	eq(t, got, `{"state":201,"info":null}`)
	met(t, m)
}

// 实名认证通过 / 会员不存在（$userinfo 空数组，字段全 null，实名不拦）→ 继续走主流程。
func TestReplyVerifiedPass(t *testing.T) {
	for _, row := range []*sqlmock.Rows{
		gateRow("1", "1", "0", "13800000000", "1", "1700000000"),
		sqlmock.NewRows([]string{"mtype", "certifyState", "licenseState", "phone", "phoneCheck", "phoneBindTime"}),
	} {
		svc, m := newFollowServiceWith(t, fakeIdentity(7), func(d *Dep) {
			verified := 1
			d.MemberVerified = &verified
		})
		m.ExpectQuery(qGateMember).WithArgs(int64(7)).WillReturnRows(row)
		m.ExpectQuery(qOrigin).WithArgs(int64(5)).WillReturnRows(
			sqlmock.NewRows([]string{"id", "pid", "rid", "aid", "type", "masterid"}))
		got := replyGet(t, svc, fakeIdentity(7), "id=5&content=hi")
		eq(t, got, `{"state":101,"info":"原评价不存在"}`)
		met(t, m)
	}
}

// 企业会员（mtype=2）：busiState 取 business_list 首行 state，为真时 userType=2 走 license 门禁；
// licenseState 强转 int 后 != 1 → 201；busiState 为假时 userType 回 1，license 不参与。
func TestReplyVerifiedBusiness(t *testing.T) {
	// licenseState=0 → 201。
	svc, m := newFollowServiceWith(t, fakeIdentity(7), func(d *Dep) {
		verified, info := 1, "请先完成企业认证"
		d.MemberVerified = &verified
		d.MemberVerifiedInfo = &info
	})
	m.ExpectQuery(qGateMember).WithArgs(int64(7)).
		WillReturnRows(gateRow("2", "0", "0", "13800000000", "1", "1700000000"))
	m.ExpectQuery(qBusiState).WithArgs(int64(7)).WillReturnRows(
		sqlmock.NewRows([]string{"state"}).AddRow("2"))
	got := replyGet(t, svc, fakeIdentity(7), "id=5&content=hi")
	eq(t, got, `{"state":201,"info":"请先完成企业认证"}`)
	met(t, m)

	// licenseState=1 通过 → 继续主流程。
	svc, m = newFollowServiceWith(t, fakeIdentity(7), func(d *Dep) {
		verified := 1
		d.MemberVerified = &verified
	})
	m.ExpectQuery(qGateMember).WithArgs(int64(7)).
		WillReturnRows(gateRow("2", "0", "1", "13800000000", "1", "1700000000"))
	m.ExpectQuery(qBusiState).WithArgs(int64(7)).WillReturnRows(
		sqlmock.NewRows([]string{"state"}).AddRow("2"))
	m.ExpectQuery(qOrigin).WithArgs(int64(5)).WillReturnRows(
		sqlmock.NewRows([]string{"id", "pid", "rid", "aid", "type", "masterid"}))
	got = replyGet(t, svc, fakeIdentity(7), "id=5&content=hi")
	eq(t, got, `{"state":101,"info":"原评价不存在"}`)
	met(t, m)

	// busiState=0（business_list 无行）→ userType 回 1，certifyState=1 通过。
	svc, m = newFollowServiceWith(t, fakeIdentity(7), func(d *Dep) {
		verified := 1
		d.MemberVerified = &verified
	})
	m.ExpectQuery(qGateMember).WithArgs(int64(7)).
		WillReturnRows(gateRow("2", "1", "0", "13800000000", "1", "1700000000"))
	m.ExpectQuery(qBusiState).WithArgs(int64(7)).WillReturnRows(
		sqlmock.NewRows([]string{"state"}))
	m.ExpectQuery(qOrigin).WithArgs(int64(5)).WillReturnRows(
		sqlmock.NewRows([]string{"id", "pid", "rid", "aid", "type", "masterid"}))
	got = replyGet(t, svc, fakeIdentity(7), "id=5&content=hi")
	eq(t, got, `{"state":101,"info":"原评价不存在"}`)
	met(t, m)
}

// 手机认证：未绑定 / phoneCheck 假 → 202；周期到期 → 「请先验证手机号码」；通过 → 继续主流程。
func TestReplyPhoneGate(t *testing.T) {
	// phone 空 → 202，info null。
	svc, m := newFollowServiceWith(t, fakeIdentity(7), func(d *Dep) {
		bind := 1
		d.MemberBindPhone = &bind
	})
	m.ExpectQuery(qGateMember).WithArgs(int64(7)).
		WillReturnRows(gateRow("1", "0", "0", "", "1", "1700000000"))
	got := replyGet(t, svc, fakeIdentity(7), "id=5&content=hi")
	eq(t, got, `{"state":202,"info":null}`)
	met(t, m)

	// phoneCheck "0" → 202。
	svc, m = newFollowServiceWith(t, fakeIdentity(7), func(d *Dep) {
		bind, info := 1, "请先绑定手机"
		d.MemberBindPhone = &bind
		d.MemberBindPhoneInfo = &info
	})
	m.ExpectQuery(qGateMember).WithArgs(int64(7)).
		WillReturnRows(gateRow("1", "0", "0", "13800000000", "0", "1700000000"))
	got = replyGet(t, svc, fakeIdentity(7), "id=5&content=hi")
	eq(t, got, `{"state":202,"info":"请先绑定手机"}`)
	met(t, m)

	// 周期检查：绑定时间距今 10000000 秒 > 7 天 → 「请先验证手机号码」。
	svc, m = newFollowServiceWith(t, fakeIdentity(7), func(d *Dep) {
		bind, periodic, cycle := 1, 1, 7
		d.MemberBindPhone = &bind
		d.PeriodicCheckPhone = &periodic
		d.PeriodicCheckPhoneCycle = &cycle
	})
	m.ExpectQuery(qGateMember).WithArgs(int64(7)).
		WillReturnRows(gateRow("1", "0", "0", "13800000000", "1", "1690000000"))
	got = replyGet(t, svc, fakeIdentity(7), "id=5&content=hi")
	eq(t, got, `{"state":202,"info":"请先验证手机号码"}`)
	met(t, m)

	// 绑定时间在周期内 → 通过，继续主流程。
	svc, m = newFollowServiceWith(t, fakeIdentity(7), func(d *Dep) {
		bind, periodic, cycle := 1, 1, 7
		d.MemberBindPhone = &bind
		d.PeriodicCheckPhone = &periodic
		d.PeriodicCheckPhoneCycle = &cycle
	})
	m.ExpectQuery(qGateMember).WithArgs(int64(7)).
		WillReturnRows(gateRow("1", "0", "0", "13800000000", "1", "1699500000"))
	m.ExpectQuery(qOrigin).WithArgs(int64(5)).WillReturnRows(
		sqlmock.NewRows([]string{"id", "pid", "rid", "aid", "type", "masterid"}))
	got = replyGet(t, svc, fakeIdentity(7), "id=5&content=hi")
	eq(t, got, `{"state":101,"info":"原评价不存在"}`)
	met(t, m)
}

// pid 是非数字串时 PHP 7 的 "abc" == 0 为真 → 按一级评论处理（rid = 原评论 id）。
func TestReplyPidNonNumericIsFirstLevel(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qOrigin).WithArgs(int64(5)).
		WillReturnRows(originRow("5", "abc", "0", "99", "article-detail", "0"))
	m.ExpectExec(qInsert).
		WithArgs("0", "5", "article-detail", "99", int64(0), int64(7), int64(0), int64(0), "hi",
			"", "", "", followNow, testLogIP, "", int64(0), int64(0), "", int64(0), "5", int64(5)).
		WillReturnResult(sqlmock.NewResult(132, 1))
	expectLogReply(m, "7", "回复评价(article-detail=>99)",
		"action=replyComment&content=hi&id=5&service=member",
		replyInsertText("0", "5", "article-detail", "99", "hi", 7, 0, "5", 5), "")
	got := replyGet(t, svc, fakeIdentity(7), "id=5&content=hi")
	eq(t, got, `{"state":100,"info":"评价成功！"}`)
	met(t, m)
}

// content 是数组（content[]=x）→ PHP 拼进 SQL 的字面量是 "Array"。
func TestReplyContentArray(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qOrigin).WithArgs(int64(5)).
		WillReturnRows(originRow("5", "0", "0", "99", "article-detail", "0"))
	m.ExpectExec(qInsert).
		WithArgs("0", "5", "article-detail", "99", int64(0), int64(7), int64(0), int64(0), "Array",
			"", "", "", followNow, testLogIP, "", int64(0), int64(0), "", int64(0), "5", int64(5)).
		WillReturnResult(sqlmock.NewResult(133, 1))
	expectLogReply(m, "7", "回复评价(article-detail=>99)",
		"action=replyComment&content[]=x&id=5&service=member",
		replyInsertText("0", "5", "article-detail", "99", "Array", 7, 0, "5", 5), "")
	got := replyGet(t, svc, fakeIdentity(7), "id=5&content%5B%5D=x")
	eq(t, got, `{"state":100,"info":"评价成功！"}`)
	met(t, m)
}

// 编译期防呆：floorTime / getIPHome / isAndroidAppUA 在本文件路径上有被用到。
var _ = time.Now
