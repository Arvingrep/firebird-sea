package member

import (
	"context"
	"database/sql/driver"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"testing"
	"time"

	sqlmock "github.com/DATA-DOG/go-sqlmock"
)

// updateAccount（#261）的 L1 用例：对应规则评论（issue #261 第二条评论）第 8 节的 20 组。
// SQL 用 QueryMatcherEqual 全串匹配；落库值是「SQL 字面量解析后」的明文（stripslashes 一层），
// member_log 的 note / sql / param 用 argEq 断言 PHP 拼串原文（含转义反斜杠）。

const (
	qa = "/include/ajax.php?service=member&action=updateAccount"

	qNickDupPersonal = "SELECT count(`id`) totalCount FROM `huoniao_member` WHERE `nickname` = ? AND `id` != ?"
	qNickDupCompany  = "SELECT count(`id`) totalCount FROM `huoniao_member` WHERE (`company` = ? OR `nickname` = ?) AND `id` != ?"
	qNickUpdate      = "UPDATE `huoniao_member` SET `nickname` = ? WHERE `id` = ?"
	qNickUpdCompany  = "UPDATE `huoniao_member` SET `nickname` = ?, `company` = ? WHERE `id` = ?"
	qNickUpdAudit    = "UPDATE `huoniao_member` SET `nickname_audit` = ?, `nickname_state` = ? WHERE `id` = ?"

	qSelPassword  = "SELECT `password` FROM `huoniao_member` WHERE `id` = ?"
	qUpdPassword  = "UPDATE `huoniao_member` SET `password` = ? WHERE `id` = ?"
	qUpdPaypwdAdd = "UPDATE `huoniao_member` SET `paypwd` = ?, `paypwdCheck` = 1 WHERE `id` = ?"
	qSelPaypwd    = "SELECT `paypwd` FROM `huoniao_member` WHERE `id` = ?"
	qUpdPaypwd    = "UPDATE `huoniao_member` SET `paypwd` = ? WHERE `id` = ?"

	qIdcardDup          = "SELECT COUNT(*) FROM `huoniao_member` WHERE `idcard` = ? AND `id` != ?"
	qSelCertifyState    = "SELECT `certifyState` FROM `huoniao_member` WHERE `id` = ?"
	qSelLicenseState    = "SELECT `licenseState` FROM `huoniao_member` WHERE `id` = ?"
	qUpdCertifyPersonal = "UPDATE `huoniao_member` SET `realname` = ?, `idcard` = ?, `idcardFront` = ?, `idcardBack` = ?, `certifyState` = 3 WHERE `id` = ?"
	qUpdCertifyCompany  = "UPDATE `huoniao_member` SET `realname` = ?, `idcard` = ?, `idcardFront` = ?, `idcardBack` = ?, `license` = ?, `certifyState` = 3, `licenseState` = 3 WHERE `id` = ?"
	qUpdatemsgDup       = "SELECT `id` FROM `huoniao_updatemessage` WHERE `param` = ? LIMIT 1"
	qUpdatemsgInsert    = "INSERT INTO `huoniao_updatemessage` (`module`, `part`, `param`, `time`) VALUES (?, ?, ?, ?)"

	qCertifyData = "SELECT `mtype`, `certifyState`, `certifyInfo`, `realname`, `idcard`, `idcardFront`, `idcardBack`, `license`, `licenseState`, `licenseInfo` FROM `huoniao_member` WHERE `id` = ?"

	qSmsInternational = "SELECT `international` FROM `huoniao_sitesms` WHERE `state` = 1"
	qPhoneOccupied    = "SELECT COUNT(*) FROM `huoniao_member` WHERE (`mtype` = 1 OR `mtype` = 2) AND `phone` = ? AND `phoneCheck` = 1 AND (`areaCode` = ? OR `areaCode` = '') AND `id` <> ?"
	qPhoneOwner       = "SELECT `id` FROM `huoniao_member` WHERE (`mtype` = 1 OR `mtype` = 2) AND `phone` = ? AND `id` = ?"
	qDelVerifyUser    = "DELETE FROM `huoniao_site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `user` = ?"
	qSelVerify        = "SELECT `id`, `pubdate` FROM `huoniao_site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `user` = ? AND `code` = ?"
	qDelVerifyCode    = "DELETE FROM `huoniao_site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `user` = ? AND `code` = ?"
	qUpdBindPhone     = "UPDATE `huoniao_member` SET `areaCode` = ?, `phone` = ?, `phoneCheck` = 1, `phoneBindTime` = ? WHERE `id` = ?"
	qUpdUnbindPhone   = "UPDATE `huoniao_member` SET `phone` = ?, `phoneCheck` = ? WHERE `id` = ?"

	qEmailDup       = "SELECT COUNT(*) FROM `huoniao_member` WHERE `email` = ? AND `id` <> ?"
	qNotifyTemplate = "SELECT `email_state`, `email_title`, `email_body` FROM `huoniao_site_notify` WHERE `title` = ? AND `state` = 1 ORDER BY `id` DESC"
	qUpdEmail       = "UPDATE `huoniao_member` SET `email` = ? WHERE `id` = ?"
	qMsgLogInsert   = "INSERT INTO `huoniao_site_messagelog` (`type`, `lei`, `user`, `title`, `body`, `code`, `tempid`, `byid`, `state`, `pubdate`, `ip`, `reason`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"

	qSecurityCount = "SELECT COUNT(*) FROM `huoniao_member_security` WHERE `uid` = ?"
	qSecurityInset = "INSERT INTO `huoniao_member_security` (`uid`, `question`, `answer`) VALUES (?, ?, ?)"
)

// updGet 请求 updateAccount，query 不含 service/action。
func updGet(t *testing.T, svc *Service, query string) string {
	t.Helper()
	return do(t, svc, "GET", qa+"&"+query, "")
}

// stubDetail 是 getMemberInfo（member.detail 投影）的测试桩。
func stubDetail(nickname any, userType, pwd int) UserDetailFunc {
	return func(ctx context.Context, req *http.Request, id string, valid bool) (any, error) {
		o := NewObject()
		o.Set("userType", userType)
		o.Set("nickname", nickname)
		o.Set("pwd", pwd)
		return o, nil
	}
}

func newUpdateService(t *testing.T, identity Identity, mut func(*Dep)) (*Service, sqlmock.Sqlmock) {
	t.Helper()
	return newFollowServiceWith(t, identity, func(d *Dep) {
		if mut != nil {
			mut(d)
		}
	})
}

// expectUpdateLog 期待 member_log 的去重查询 + 写入（updateAccount 口径：temp 为空、aid=0）。
func expectUpdateLog(m sqlmock.Sqlmock, uid, note, param, sqlText string) {
	m.ExpectQuery(qLogCount).
		WithArgs(md5Hex(note), uid, testLogIP, followNow).
		WillReturnRows(count(0))
	m.ExpectExec(qLogInsert).
		WithArgs(uid, "member", "", int64(0), "update", argEq(note), "", testLogIP, "", "",
			argEq(sqlText), followNow, md5Hex(note), testLogURL, argEq(param), "").
		WillReturnResult(sqlmock.NewResult(1, 1))
}

// hashOf 按固定时钟复算 _getSaltedHash：salt = substr(md5(1700000000),0,7)。
func hashOf(str string) string {
	salt := md5Hex("1700000000")[:7]
	return salt + sha1Hex(salt+str)
}

// notifyParam 构造 updateAdminNotice 序列化后的 param（certify 通知）。
func notifyParam(nickname string) string {
	contentrn := "分站\r\n申请实名认证\r\n用户昵称：" + nickname + "\r\n用户ID：7"
	date := time.Unix(followNow, 0).In(gmt8).Format("2006-01-02 15:04:05")
	return `a:4:{s:4:"type";s:0:"";s:6:"cityid";N;s:6:"notify";` + phpSerializeString("管理员消息通知") +
		`s:6:"fields";a:2:{s:9:"contentrn";` + phpSerializeString(contentrn) +
		`s:4:"date";` + phpSerializeString(date) + `}}`
}

// —— 用例 1：匿名 → 101 登录超时（不查库） ——

func TestUpdateAccountAnonymous(t *testing.T) {
	for _, q := range []string{"do=nick&name=x", "do=password", "do=getCerfityData", ""} {
		svc, m := newUpdateService(t, fakeIdentity(-1), nil)
		target := qa
		if q != "" {
			target += "&" + q
		}
		got := do(t, svc, "GET", target, "")
		eq(t, got, `{"state":101,"info":"登录超时，请重新登录！"}`)
		met(t, m)
	}
}

// —— 用例 2：do 缺失 / 未命中 → 102 "No data!" ——

func TestUpdateAccountNoDo(t *testing.T) {
	for _, q := range []string{"", "do=unknown", "do=payPwdAdd", "do%5B%5D=nick"} {
		svc, m := newUpdateService(t, fakeIdentity(7), nil)
		target := qa
		if q != "" {
			target += "&" + q
		}
		got := do(t, svc, "GET", target, "")
		eq(t, got, `{"state":102,"info":"No data!"}`)
		met(t, m)
	}
}

// —— 用例 3：do=password 缺 new → 101「请输入完整！」 ——

func TestUpdatePasswordMissingNew(t *testing.T) {
	svc, m := newUpdateService(t, fakeIdentity(7), func(d *Dep) {
		d.UserDetail = stubDetail("老王", 1, 1)
	})
	got := updGet(t, svc, "do=password&old=PrevPass")
	eq(t, got, `{"state":101,"info":"请输入完整！"}`)
	met(t, m)
}

// —— 用例 4：旧密码错 → 101 ——

func TestUpdatePasswordWrongOld(t *testing.T) {
	svc, m := newUpdateService(t, fakeIdentity(7), func(d *Dep) {
		d.UserDetail = stubDetail("老王", 1, 1)
	})
	stored := md5Hex("prev")[:7] + sha1Hex(md5Hex("prev")[:7]+"PrevPass")
	m.ExpectQuery(qSelPassword).WithArgs(int64(7)).
		WillReturnRows(sqlmock.NewRows([]string{"password"}).AddRow(stored))
	got := updGet(t, svc, "do=password&old=WrongPass&new=Ab123456&confirm=Ab123456")
	eq(t, got, `{"state":101,"info":"您输入的当前密码不正确，请确认后重试！"}`)
	met(t, m)
}

// —— 用例 5：new ≠ confirm → 101 ——

func TestUpdatePasswordMismatch(t *testing.T) {
	svc, m := newUpdateService(t, fakeIdentity(7), func(d *Dep) {
		d.UserDetail = stubDetail("老王", 1, 1)
	})
	stored := md5Hex("prev")[:7] + sha1Hex(md5Hex("prev")[:7]+"PrevPass")
	m.ExpectQuery(qSelPassword).WithArgs(int64(7)).
		WillReturnRows(sqlmock.NewRows([]string{"password"}).AddRow(stored))
	got := updGet(t, svc, "do=password&old=PrevPass&new=Ab123456&confirm=Ab999999")
	eq(t, got, `{"state":101,"info":"两次输入的新密码不一致，请重新输入！"}`)
	met(t, m)
}

// —— 用例 6：修改成功 → 100 + 47 位哈希且可复算 ——

func TestUpdatePasswordSuccess(t *testing.T) {
	svc, m := newUpdateService(t, fakeIdentity(7), func(d *Dep) {
		d.UserDetail = stubDetail("老王", 1, 1)
	})
	stored := md5Hex("prev")[:7] + sha1Hex(md5Hex("prev")[:7]+"PrevPass")
	m.ExpectQuery(qSelPassword).WithArgs(int64(7)).
		WillReturnRows(sqlmock.NewRows([]string{"password"}).AddRow(stored))
	want := hashOf("Ab123456")
	m.ExpectExec(qUpdPassword).WithArgs(argEq(want), int64(7)).
		WillReturnResult(sqlmock.NewResult(0, 1))
	expectUpdateLog(m, "7", "修改登录密码",
		"action=updateAccount&confirm=Ab123456&do=password&new=Ab123456&old=PrevPass&service=member",
		"UPDATE `huoniao_member` SET `password` = '"+want+"' WHERE `id` = 7")
	got := updGet(t, svc, "do=password&old=PrevPass&new=Ab123456&confirm=Ab123456")
	eq(t, got, `{"state":100,"info":"修改成功！"}`)
	met(t, m)
	if len(want) != 47 || !regexp.MustCompile(`^[0-9a-f]{47}$`).MatchString(want) {
		t.Fatalf("哈希口径错误：%s", want)
	}
}

// —— 用例 7：密码含引号 → 哈希对象是 addslashes 后的值 ——

func TestUpdatePasswordAddslashesQuote(t *testing.T) {
	svc, m := newUpdateService(t, fakeIdentity(7), func(d *Dep) {
		d.UserDetail = stubDetail("老王", 1, 0) // 第三方登录账号：不校验旧密码
	})
	// 入参 ab'cd 经入口归一（stripslashes+addslashes）成 ab\'cd，哈希与一致
	// 性比较都用转义后的值。
	escaped := `ab\'cd`
	want := hashOf(escaped)
	m.ExpectExec(qUpdPassword).WithArgs(argEq(want), int64(7)).
		WillReturnResult(sqlmock.NewResult(0, 1))
	expectUpdateLog(m, "7", "修改登录密码",
		"action=updateAccount&confirm=ab'cd&do=password&new=ab'cd&service=member",
		"UPDATE `huoniao_member` SET `password` = '"+want+"' WHERE `id` = 7")
	got := updGet(t, svc, "do=password&new=ab'cd&confirm=ab'cd")
	eq(t, got, `{"state":100,"info":"修改成功！"}`)
	met(t, m)
}

func TestUpdatePasswordAddslashesBackslash(t *testing.T) {
	// 反斜杠：PHP 入口是 addslashes(stripslashes(v))，stripslashes 会把 \ 连同下一个
	// 字符一起剥掉（\0 → NUL），所以 ab\cd12345 归一后是 abcd12345，哈希的是它。
	svc, m := newUpdateService(t, fakeIdentity(7), func(d *Dep) {
		d.UserDetail = stubDetail("老王", 1, 0)
	})
	escaped := `abcd12345`
	want := hashOf(escaped)
	m.ExpectExec(qUpdPassword).WithArgs(argEq(want), int64(7)).
		WillReturnResult(sqlmock.NewResult(0, 1))
	expectUpdateLog(m, "7", "修改登录密码",
		"action=updateAccount&confirm=ab\\cd12345&do=password&new=ab\\cd12345&service=member",
		"UPDATE `huoniao_member` SET `password` = '"+want+"' WHERE `id` = 7")
	got := updGet(t, svc, `do=password&new=ab\cd12345&confirm=ab\cd12345`)
	eq(t, got, `{"state":100,"info":"修改成功！"}`)
	met(t, m)

	// \\ 与 \' 成对剥反斜杠：a\\b → a\b → 再加回去 a\\b；\' → ' → a\'b。
	svc, m = newUpdateService(t, fakeIdentity(7), func(d *Dep) {
		d.UserDetail = stubDetail("老王", 1, 0)
	})
	escaped2 := `a\\b123456`
	want2 := hashOf(escaped2)
	m.ExpectExec(qUpdPassword).WithArgs(argEq(want2), int64(7)).
		WillReturnResult(sqlmock.NewResult(0, 1))
	expectUpdateLog(m, "7", "修改登录密码",
		"action=updateAccount&confirm=a\\\\b123456&do=password&new=a\\\\b123456&service=member",
		"UPDATE `huoniao_member` SET `password` = '"+want2+"' WHERE `id` = 7")
	got = updGet(t, svc, `do=password&new=a\\b123456&confirm=a\\b123456`)
	eq(t, got, `{"state":100,"info":"修改成功！"}`)
	met(t, m)

	// 实体编码的引号：入口 RemoveXSS 的实体解码发生在转义之后，PHP handler 视图是
	// 裸引号 abc'def12345（不会再被转义）。哈希走 ParamsEscaped 转义视图，与 PHP 一致。
	svc, m = newUpdateService(t, fakeIdentity(7), func(d *Dep) {
		d.UserDetail = stubDetail("老王", 1, 0)
	})
	want3 := hashOf(`abc'def12345`)
	m.ExpectExec(qUpdPassword).WithArgs(argEq(want3), int64(7)).
		WillReturnResult(sqlmock.NewResult(0, 1))
	expectUpdateLog(m, "7", "修改登录密码",
		"action=updateAccount&confirm=abc&#39;def12345&do=password&new=abc&#39;def12345&service=member",
		"UPDATE `huoniao_member` SET `password` = '"+want3+"' WHERE `id` = 7")
	got = updGet(t, svc, `do=password&new=abc%26%2339%3Bdef12345&confirm=abc%26%2339%3Bdef12345`)
	eq(t, got, `{"state":100,"info":"修改成功！"}`)
	met(t, m)
}

func TestPhpStripslashesSemantics(t *testing.T) {
	// 对照 docker PHP 实测：stripslashes("ab\\cd")→"abcd"、("a\\\\b")→"a\\b"、
	// ("a\\\\\\\\")→"a\\\\"、("a\\")→"a"、addslashes("a\\0b")→"a\\\\0b"。
	cases := [][2]string{
		{`ab\cd`, "abcd"},
		{`a\'b`, "a'b"},
		{`a\nb`, "anb"},
		{"a\\0b", "a\x00b"},
		{`a\`, "a"},
		{`\\\`, `\`},
		{`a\\b`, `a\b`},
		{`a\\`, `a\`},
	}
	for _, c := range cases {
		if got := phpStripslashes(c[0]); got != c[1] {
			t.Fatalf("phpStripslashes(%q) = %q, want %q", c[0], got, c[1])
		}
	}
	if got := phpAddslashes("a\x00b"); got != `a\0b` {
		t.Fatalf("phpAddslashes NUL = %q, want a\\0b", got)
	}
	if got := phpAddslashes(`a\0b`); got != `a\\0b` {
		t.Fatalf("phpAddslashes backslash-0 = %q, want a\\\\0b", got)
	}
}

// —— 用例 8：paypwdAdd —— pay1 5 位 → 101；pay1≠pay2 但都 ≥6 → 100（固化 bug） ——

func TestUpdatePaypwdAdd(t *testing.T) {
	svc, m := newUpdateService(t, fakeIdentity(7), nil)
	got := updGet(t, svc, "do=paypwdAdd&pay1=12345&pay2=12345")
	eq(t, got, `{"state":101,"info":"支付密码太过简单，请重新输入！"}`)
	met(t, m)

	// pay2 只判非空，不判与 pay1 相等。
	svc, m = newUpdateService(t, fakeIdentity(7), nil)
	want := hashOf("abc123")
	m.ExpectExec(qUpdPaypwdAdd).WithArgs(argEq(want), int64(7)).
		WillReturnResult(sqlmock.NewResult(0, 1))
	expectUpdateLog(m, "7", "设置支付密码",
		"action=updateAccount&do=paypwdAdd&pay1=abc123&pay2=xyz789&service=member",
		"UPDATE `huoniao_member` SET `paypwd` = '"+want+"', `paypwdCheck` = 1 WHERE `id` = 7")
	got = updGet(t, svc, "do=paypwdAdd&pay1=abc123&pay2=xyz789")
	eq(t, got, `{"state":100,"info":"设置成功！"}`)
	met(t, m)
}

// —— 用例 9：paypwdEdit —— 第三方账号（paypwd 空）旧值必不等 → 101；旧值对 → 成功 ——

func TestUpdatePaypwdEdit(t *testing.T) {
	// paypwd 为 NULL（第三方登录账号）：复算必不等 → 101。
	svc, m := newUpdateService(t, fakeIdentity(7), nil)
	m.ExpectQuery(qSelPaypwd).WithArgs(int64(7)).
		WillReturnRows(sqlmock.NewRows([]string{"paypwd"}).AddRow(nil))
	got := updGet(t, svc, "do=paypwdEdit&old=Whatever&new=Ab123456&confirm=Ab123456")
	eq(t, got, `{"state":101,"info":"您输入的当前密码不正确，请确认后重试！"}`)
	met(t, m)

	// 旧值错 → 101。
	svc, m = newUpdateService(t, fakeIdentity(7), nil)
	stored := md5Hex("prev")[:7] + sha1Hex(md5Hex("prev")[:7]+"OldPay")
	m.ExpectQuery(qSelPaypwd).WithArgs(int64(7)).
		WillReturnRows(sqlmock.NewRows([]string{"paypwd"}).AddRow(stored))
	got = updGet(t, svc, "do=paypwdEdit&old=WrongPay&new=Ab123456&confirm=Ab123456")
	eq(t, got, `{"state":101,"info":"您输入的当前密码不正确，请确认后重试！"}`)
	met(t, m)

	// 成功。
	svc, m = newUpdateService(t, fakeIdentity(7), nil)
	m.ExpectQuery(qSelPaypwd).WithArgs(int64(7)).
		WillReturnRows(sqlmock.NewRows([]string{"paypwd"}).AddRow(stored))
	want := hashOf("Ab123456")
	m.ExpectExec(qUpdPaypwd).WithArgs(argEq(want), int64(7)).
		WillReturnResult(sqlmock.NewResult(0, 1))
	expectUpdateLog(m, "7", "修改支付密码",
		"action=updateAccount&confirm=Ab123456&do=paypwdEdit&new=Ab123456&old=OldPay&service=member",
		"UPDATE `huoniao_member` SET `paypwd` = '"+want+"' WHERE `id` = 7")
	got = updGet(t, svc, "do=paypwdEdit&old=OldPay&new=Ab123456&confirm=Ab123456")
	eq(t, got, `{"state":100,"info":"修改成功！"}`)
	met(t, m)
}

// —— 用例 10：nick 宽度截断（不按字符数） ——

func TestUpdateNickWidthTruncate(t *testing.T) {
	cases := []struct{ name, input, stored string }{
		{"21 个中文字截到 20 个", strings.Repeat("中", 21), strings.Repeat("中", 20)},
		{"40 个小写字母正好 20 宽不截断", strings.Repeat("a", 40), strings.Repeat("a", 40)},
		{"41 个小写字母截到 40 个", strings.Repeat("a", 41), strings.Repeat("a", 40)},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			svc, m := newUpdateService(t, fakeIdentity(7), func(d *Dep) {
				d.UserDetail = stubDetail("旧昵称", 1, 0)
			})
			m.ExpectQuery(qNickDupPersonal).WithArgs(c.stored, int64(7)).WillReturnRows(count(0))
			m.ExpectExec(qNickUpdate).WithArgs(c.stored, int64(7)).
				WillReturnResult(sqlmock.NewResult(0, 1))
			expectUpdateLog(m, "7", "修改昵称",
				"action=updateAccount&do=nick&name="+c.input+"&service=member",
				"UPDATE `huoniao_member` SET `nickname` = '"+c.stored+"' WHERE `id` = 7")
			got := updGet(t, svc, "do=nick&name="+c.input)
			eq(t, got, `{"state":100,"info":"修改成功！"}`)
			met(t, m)
		})
	}
}

// —— 用例 11：昵称被占用 → 101（企业口径走 company OR nickname） ——

func TestUpdateNickTaken(t *testing.T) {
	svc, m := newUpdateService(t, fakeIdentity(7), func(d *Dep) {
		d.UserDetail = stubDetail("旧昵称", 1, 0)
	})
	m.ExpectQuery(qNickDupPersonal).WithArgs("新昵称", int64(7)).WillReturnRows(count(1))
	got := updGet(t, svc, "do=nick&name=新昵称")
	eq(t, got, `{"state":101,"info":"昵称被占用，请换一个！"}`)
	met(t, m)

	svc, m = newUpdateService(t, fakeIdentity(7), func(d *Dep) {
		d.UserDetail = stubDetail("公司昵称", 2, 0)
	})
	m.ExpectQuery(qNickDupCompany).WithArgs("新公司", "新公司", int64(7)).WillReturnRows(count(1))
	got = updGet(t, svc, "do=nick&name=新公司")
	eq(t, got, `{"state":101,"info":"公司名称已存在，请确认后重试，或者联系网站客服申诉！"}`)
	met(t, m)
}

// 企业 + 审核开关关闭：UPDATE 同时写 nickname 和 company。
func TestUpdateNickCompanySuccess(t *testing.T) {
	svc, m := newUpdateService(t, fakeIdentity(7), func(d *Dep) {
		d.UserDetail = stubDetail("公司昵称", 2, 0)
	})
	m.ExpectQuery(qNickDupCompany).WithArgs("新公司", "新公司", int64(7)).WillReturnRows(count(0))
	m.ExpectExec(qNickUpdCompany).WithArgs("新公司", "新公司", int64(7)).
		WillReturnResult(sqlmock.NewResult(0, 1))
	expectUpdateLog(m, "7", "修改昵称",
		"action=updateAccount&do=nick&name=新公司&service=member",
		"UPDATE `huoniao_member` SET `nickname` = '新公司', `company` = '新公司' WHERE `id` = 7")
	got := updGet(t, svc, "do=nick&name=新公司")
	eq(t, got, `{"state":100,"info":"修改成功！"}`)
	met(t, m)
}

// 昵称审核开关：只写 nickname_audit / nickname_state，仍返回「修改成功！」。
func TestUpdateNickAudit(t *testing.T) {
	audit := 1
	svc, m := newUpdateService(t, fakeIdentity(7), func(d *Dep) {
		d.UserDetail = stubDetail("旧昵称", 1, 0)
		d.NicknameEditAudit = &audit
	})
	m.ExpectQuery(qNickDupPersonal).WithArgs("新昵称", int64(7)).WillReturnRows(count(0))
	m.ExpectExec(qNickUpdAudit).WithArgs("新昵称", "审核中", int64(7)).
		WillReturnResult(sqlmock.NewResult(0, 1))
	expectUpdateLog(m, "7", "修改昵称",
		"action=updateAccount&do=nick&name=新昵称&service=member",
		"UPDATE `huoniao_member` SET `nickname_audit` = '新昵称', `nickname_state` = '审核中' WHERE `id` = 7")
	got := updGet(t, svc, "do=nick&name=新昵称")
	eq(t, got, `{"state":100,"info":"修改成功！"}`)
	met(t, m)
}

// 昵称维护开关（cfg_nicknameEditState=1）→ 101 默认文案；name 空 → 101 请输入新昵称；
// detail 的 nickname 为 null（含会员不存在）→「昵称没有变化」（$nickname 未定义 bug）。
func TestUpdateNickGates(t *testing.T) {
	state := 1
	svc, m := newUpdateService(t, fakeIdentity(7), func(d *Dep) { d.NicknameEditState = &state })
	got := updGet(t, svc, "do=nick&name=x")
	eq(t, got, `{"state":101,"info":"功能维护中，暂停使用！"}`)
	met(t, m)

	svc, m = newUpdateService(t, fakeIdentity(7), func(d *Dep) {
		d.UserDetail = stubDetail("旧昵称", 1, 0)
	})
	got = updGet(t, svc, "do=nick&name=")
	eq(t, got, `{"state":101,"info":"请输入新昵称"}`)
	got = updGet(t, svc, "do=nick&name=0") // empty()：'0' 也算空
	eq(t, got, `{"state":101,"info":"请输入新昵称"}`)
	met(t, m)

	svc, m = newUpdateService(t, fakeIdentity(7), func(d *Dep) {
		d.UserDetail = stubDetail(nil, 1, 0)
	})
	got = updGet(t, svc, "do=nick&name=新昵称")
	eq(t, got, `{"state":101,"info":"昵称没有变化"}`)
	met(t, m)
}

// —— 用例 12：certify —— 缺 front / 已通过 / 首次提交（cardState=0 人工审核） ——

const certifyBase = "realname=张三&idcard=110101199001011234&front=f.jpg&back=b.jpg"

func TestUpdateCertifyMissingFront(t *testing.T) {
	svc, m := newUpdateService(t, fakeIdentity(7), func(d *Dep) {
		d.UserDetail = stubDetail("小明", 1, 0)
	})
	got := updGet(t, svc, "do=certify&realname=张三&idcard=110101199001011234&back=b.jpg")
	eq(t, got, `{"state":101,"info":"请输入完整！"}`)
	met(t, m)
}

func TestUpdateCertifyIdcardTaken(t *testing.T) {
	svc, m := newUpdateService(t, fakeIdentity(7), func(d *Dep) {
		d.UserDetail = stubDetail("小明", 1, 0)
	})
	m.ExpectQuery(qIdcardDup).WithArgs("110101199001011234", int64(7)).WillReturnRows(count(1))
	got := updGet(t, svc, "do=certify&"+certifyBase)
	eq(t, got, `{"state":101,"info":"您输入的身份证号码已经被其他帐号绑定！"}`)
	met(t, m)
}

func TestUpdateCertifyPersonalAlreadyPassed(t *testing.T) {
	svc, m := newUpdateService(t, fakeIdentity(7), func(d *Dep) {
		d.UserDetail = stubDetail("小明", 1, 0)
	})
	m.ExpectQuery(qIdcardDup).WithArgs("110101199001011234", int64(7)).WillReturnRows(count(0))
	m.ExpectQuery(qSelCertifyState).WithArgs(int64(7)).
		WillReturnRows(sqlmock.NewRows([]string{"certifyState"}).AddRow("1"))
	got := updGet(t, svc, "do=certify&"+certifyBase)
	eq(t, got, `{"state":101,"info":"您的实名认证已经通过审核！"}`)
	met(t, m)
}

// 个人首次提交：certifyState=3（待审）、birthday 不写（cardState=0 不解析身份证）、
// updatemessage 去重后 INSERT、member_log 记「实名认证」。
func TestUpdateCertifyPersonalFirst(t *testing.T) {
	svc, m := newUpdateService(t, fakeIdentity(7), func(d *Dep) {
		d.UserDetail = stubDetail("小明", 1, 0)
	})
	m.ExpectQuery(qIdcardDup).WithArgs("110101199001011234", int64(7)).WillReturnRows(count(0))
	m.ExpectQuery(qSelCertifyState).WithArgs(int64(7)).
		WillReturnRows(sqlmock.NewRows([]string{"certifyState"}).AddRow("0"))
	m.ExpectExec(qUpdCertifyPersonal).
		WithArgs("张三", "110101199001011234", "f.jpg", "b.jpg", int64(7)).
		WillReturnResult(sqlmock.NewResult(0, 1))
	expectUpdateLog(m, "7", "实名认证",
		"action=updateAccount&back=b.jpg&do=certify&front=f.jpg&idcard=110101199001011234&realname=张三&service=member",
		"UPDATE `huoniao_member` SET `realname` = '张三', `idcard` = '110101199001011234', `idcardFront` = 'f.jpg', `idcardBack` = 'b.jpg', `certifyState` = 3 WHERE `id` = 7")
	wantParam := notifyParam("小明")
	m.ExpectQuery(qUpdatemsgDup).WithArgs(argEq(wantParam)).WillReturnRows(sqlmock.NewRows([]string{"id"}))
	m.ExpectExec(qUpdatemsgInsert).WithArgs("member", "certify", argEq(wantParam), followNow).
		WillReturnResult(sqlmock.NewResult(1, 1))
	got := updGet(t, svc, "do=certify&"+certifyBase)
	eq(t, got, `{"state":100,"info":"提交成功，请等待工作人员审核！"}`)
	met(t, m)
}

// —— 用例 13：企业无 license → 101；已提交 → 101 ——

func TestUpdateCertifyCompany(t *testing.T) {
	svc, m := newUpdateService(t, fakeIdentity(7), func(d *Dep) {
		d.UserDetail = stubDetail("某某公司", 2, 0)
	})
	got := updGet(t, svc, "do=certify&"+certifyBase)
	eq(t, got, `{"state":101,"info":"请上传营业执照！"}`)
	met(t, m)

	svc, m = newUpdateService(t, fakeIdentity(7), func(d *Dep) {
		d.UserDetail = stubDetail("某某公司", 2, 0)
	})
	m.ExpectQuery(qIdcardDup).WithArgs("110101199001011234", int64(7)).WillReturnRows(count(0))
	m.ExpectQuery(qSelLicenseState).WithArgs(int64(7)).
		WillReturnRows(sqlmock.NewRows([]string{"licenseState"}).AddRow("3"))
	got = updGet(t, svc, "do=certify&"+certifyBase+"&license=lic.jpg")
	eq(t, got, `{"state":101,"info":"您的企业认证信息已经提交，请等待工作人员审核！"}`)
	met(t, m)
}

// userType 非 1/2（管理员等）：$archives 未定义 → SQL 异常 → 101「设置失败！」。
func TestUpdateCertifyUnknownUserType(t *testing.T) {
	// userType 非 1/2（管理员/城市管理员）：PHP 的 $archives 仍是身份证占用 SELECT，
	// dsqlOper("update") 恒 "ok" → 无 UPDATE，只写 memberLog + updateAdminNotice → 100。
	svc, m := newUpdateService(t, fakeIdentity(7), func(d *Dep) {
		d.UserDetail = stubDetail("管理员", 0, 0)
	})
	m.ExpectQuery(qIdcardDup).WithArgs("110101199001011234", int64(7)).WillReturnRows(count(0))
	expectUpdateLog(m, "7", "实名认证",
		"action=updateAccount&back=b.jpg&do=certify&front=f.jpg&idcard=110101199001011234&realname=张三&service=member",
		"SELECT `id` FROM `huoniao_member` WHERE `idcard` = '110101199001011234' AND `id` != 7")
	wantParam := notifyParam("管理员")
	m.ExpectQuery(qUpdatemsgDup).WithArgs(argEq(wantParam)).WillReturnRows(sqlmock.NewRows([]string{"id"}))
	m.ExpectExec(qUpdatemsgInsert).WithArgs("member", "certify", argEq(wantParam), followNow).
		WillReturnResult(sqlmock.NewResult(1, 1))
	got := updGet(t, svc, "do=certify&"+certifyBase)
	eq(t, got, `{"state":100,"info":"提交成功，请等待工作人员审核！"}`)
	met(t, m)
}

// —— 用例 14：getCerfityData —— 未提交 / 被驳回 / 已提交 / 企业 / 会员不存在 ——

func certDataRow(vals ...driver.Value) *sqlmock.Rows {
	cols := []string{"mtype", "certifyState", "certifyInfo", "realname", "idcard",
		"idcardFront", "idcardBack", "license", "licenseState", "licenseInfo"}
	return sqlmock.NewRows(cols).AddRow(vals...)
}

func TestGetCerfityData(t *testing.T) {
	// mtype=1 未提交 → 101。
	svc, m := newUpdateService(t, fakeIdentity(7), nil)
	m.ExpectQuery(qCertifyData).WithArgs(int64(7)).
		WillReturnRows(certDataRow("1", "0", nil, "张三", "110101199001011234", "f.jpg", "b.jpg", nil, nil, nil))
	got := updGet(t, svc, "do=getCerfityData")
	eq(t, got, `{"state":101,"info":"获取失败，您还未提交实名认证信息！"}`)
	met(t, m)

	// mtype=1 被驳回 → 101 + 驳回原因。
	svc, m = newUpdateService(t, fakeIdentity(7), nil)
	m.ExpectQuery(qCertifyData).WithArgs(int64(7)).
		WillReturnRows(certDataRow("1", "2", "证件照片模糊", "张三", "110101199001011234", "f.jpg", "b.jpg", nil, nil, nil))
	got = updGet(t, svc, "do=getCerfityData")
	eq(t, got, `{"state":101,"info":"证件照片模糊"}`)
	met(t, m)

	// mtype=1 已提交 → 100 + 四键（#330 未迁移，Files 未接入时 front/back 原样输出）。
	svc, m = newUpdateService(t, fakeIdentity(7), nil)
	m.ExpectQuery(qCertifyData).WithArgs(int64(7)).
		WillReturnRows(certDataRow("1", "1", nil, "张三", "110101199001011234", "f.jpg", "b.jpg", nil, nil, nil))
	got = updGet(t, svc, "do=getCerfityData")
	eq(t, got, `{"state":100,"info":{"realname":"张三","idcard":"110101199001011234","front":"f.jpg","back":"b.jpg"}}`)
	met(t, m)

	// mtype=2 → license 键在最前（PHP 数组插入顺序）。
	svc, m = newUpdateService(t, fakeIdentity(7), nil)
	m.ExpectQuery(qCertifyData).WithArgs(int64(7)).
		WillReturnRows(certDataRow("2", "1", nil, "张三", "110101199001011234", "f.jpg", "b.jpg", "lic.jpg", "1", nil))
	got = updGet(t, svc, "do=getCerfityData")
	eq(t, got, `{"state":100,"info":{"license":"lic.jpg","realname":"张三","idcard":"110101199001011234","front":"f.jpg","back":"b.jpg"}}`)
	met(t, m)

	// 会员不存在：$uinfo 为 null → 全 null 的 info（外层包成 100）。
	svc, m = newUpdateService(t, fakeIdentity(7), nil)
	m.ExpectQuery(qCertifyData).WithArgs(int64(7)).
		WillReturnRows(certDataRow(nil, nil, nil, nil, nil, nil, nil, nil, nil, nil))
	got = updGet(t, svc, "do=getCerfityData")
	eq(t, got, `{"state":100,"info":{"realname":null,"idcard":null,"front":"","back":""}}`)
	met(t, m)
}

// —— 用例 15：无 sitesms 行 → 101「短信平台未配置，发送失败！」 ——

func TestUpdateChphoneNoSmsConfig(t *testing.T) {
	svc, m := newUpdateService(t, fakeIdentity(7), nil)
	m.ExpectQuery(qSmsInternational).WillReturnRows(sqlmock.NewRows([]string{"international"}))
	got := updGet(t, svc, "do=chphone&areaCode=86&phone=13800138000&vdimgck=246810")
	eq(t, got, `{"state":101,"info":"短信平台未配置，发送失败！"}`)
	met(t, m)
}

// —— 用例 16：验证码错 / 过期；international=0 时区号被丢弃 ——

func TestUpdateChphoneVerifyCode(t *testing.T) {
	// international=0 → areaCode 强制空（丢弃 +86），user = '' + phone。
	svc, m := newUpdateService(t, fakeIdentity(7), nil)
	m.ExpectQuery(qSmsInternational).
		WillReturnRows(sqlmock.NewRows([]string{"international"}).AddRow("0"))
	m.ExpectQuery(qPhoneOccupied).WithArgs("13800138000", "", int64(7)).WillReturnRows(count(0))
	m.ExpectQuery(qSelVerify).WithArgs("13800138000", "246810").
		WillReturnRows(sqlmock.NewRows([]string{"id", "pubdate"}))
	got := updGet(t, svc, "do=chphone&areaCode=86&phone=13800138000&vdimgck=246810")
	eq(t, got, `{"state":101,"info":"验证码输入错误，请重试！"}`)
	met(t, m)

	// 验证码超过 300 秒 → 101。
	svc, m = newUpdateService(t, fakeIdentity(7), nil)
	m.ExpectQuery(qSmsInternational).
		WillReturnRows(sqlmock.NewRows([]string{"international"}).AddRow("1"))
	m.ExpectQuery(qPhoneOccupied).WithArgs("13800138000", "86", int64(7)).WillReturnRows(count(0))
	m.ExpectQuery(qSelVerify).WithArgs("8613800138000", "246810").
		WillReturnRows(sqlmock.NewRows([]string{"id", "pubdate"}).AddRow("9", followNow-301))
	got = updGet(t, svc, "do=chphone&areaCode=86&phone=13800138000&vdimgck=246810")
	eq(t, got, `{"state":101,"info":"验证码已过期，请重新获取！"}`)
	met(t, m)
}

// —— 用例 17：手机号被他号占用且无 changeUidByPhone → 删验证码行 + 101 ——

func TestUpdateChphoneOccupied(t *testing.T) {
	svc, m := newUpdateService(t, fakeIdentity(7), nil)
	m.ExpectQuery(qSmsInternational).
		WillReturnRows(sqlmock.NewRows([]string{"international"}).AddRow("1"))
	m.ExpectQuery(qPhoneOccupied).WithArgs("13800138000", "86", int64(7)).WillReturnRows(count(1))
	m.ExpectExec(qDelVerifyUser).WithArgs(argEq("8613800138000")).
		WillReturnResult(sqlmock.NewResult(0, 1))
	got := updGet(t, svc, "do=chphone&areaCode=86&phone=13800138000&vdimgck=246810")
	eq(t, got, `{"state":101,"info":"您输入的手机号码已经被其他帐号绑定！"}`)
	met(t, m)
}

// 验证码通过：删验证码行 → UPDATE（phoneCheck=1、phoneBindTime）→ member_log → 100。
func TestUpdateChphoneSuccess(t *testing.T) {
	svc, m := newUpdateService(t, fakeIdentity(7), nil)
	m.ExpectQuery(qSmsInternational).
		WillReturnRows(sqlmock.NewRows([]string{"international"}).AddRow("1"))
	m.ExpectQuery(qPhoneOccupied).WithArgs("13800138000", "86", int64(7)).WillReturnRows(count(0))
	m.ExpectQuery(qSelVerify).WithArgs("8613800138000", "246810").
		WillReturnRows(sqlmock.NewRows([]string{"id", "pubdate"}).AddRow("9", followNow-100))
	m.ExpectExec(qDelVerifyCode).WithArgs("8613800138000", "246810").
		WillReturnResult(sqlmock.NewResult(0, 1))
	m.ExpectExec(qUpdBindPhone).WithArgs("86", "13800138000", "1700000000", int64(7)).
		WillReturnResult(sqlmock.NewResult(0, 1))
	expectUpdateLog(m, "7", "账号绑定手机",
		"action=updateAccount&areaCode=86&do=chphone&phone=13800138000&service=member&vdimgck=246810",
		"UPDATE `huoniao_member` SET `areaCode` = '86', `phone` = '13800138000', `phoneCheck` = 1, `phoneBindTime` = '1700000000' WHERE `id` = '7'")
	got := updGet(t, svc, "do=chphone&areaCode=86&phone=13800138000&vdimgck=246810")
	eq(t, got, `{"state":100,"info":"验证通过！"}`)
	met(t, m)
}

// phoneData 平台判定失败（普通 H5 传 phoneData）：areaCode/phone 清空并置 phoneCheck=1
// 的自伤 bug 照搬。
func TestUpdateChphonePhoneDataPlatformMiss(t *testing.T) {
	svc, m := newUpdateService(t, fakeIdentity(7), nil)
	m.ExpectQuery(qPhoneOccupied).WithArgs("", "", int64(7)).WillReturnRows(count(0))
	m.ExpectExec(qUpdBindPhone).WithArgs("", "", "1700000000", int64(7)).
		WillReturnResult(sqlmock.NewResult(0, 1))
	expectUpdateLog(m, "7", "账号绑定手机(小程序端)",
		"action=updateAccount&do=chphone&phoneData=x&service=member",
		"UPDATE `huoniao_member` SET `areaCode` = '', `phone` = '', `phoneCheck` = 1, `phoneBindTime` = '1700000000' WHERE `id` = '7'")
	got := updGet(t, svc, "do=chphone&phoneData=x")
	eq(t, got, `{"state":100,"info":"验证通过！"}`)
	met(t, m)
}

// 微信小程序支路：code 缺失 → 参数错误；钩子 nil（Go 无 access_token 服务）→ 解析失败。
func TestUpdateChphoneWxBranch(t *testing.T) {
	svc, m := newUpdateService(t, fakeIdentity(7), nil)
	got := updGet(t, svc, "do=chphone&phoneData="+urlEncodeJSON("{}")+"&platform_name=wx_miniprogram")
	eq(t, got, `{"state":101,"info":"参数[code]传递失败，请检查后重试！"}`)
	met(t, m)

	svc, m = newUpdateService(t, fakeIdentity(7), nil)
	got = updGet(t, svc, "do=chphone&phoneData="+urlEncodeJSON(`{"code":"abc"}`)+"&platform_name=wx_miniprogram")
	eq(t, got, `{"state":101,"info":"手机号码解析失败，请重试，错误信息："}`)
	met(t, m)
}

// —— 用例 18：chemail —— 正则 / 占用 / 模板缺失 / 发送失败 / 成功 ——

func TestUpdateChemail(t *testing.T) {
	// a@b 不过正则（域名无点）。
	svc, m := newUpdateService(t, fakeIdentity(7), nil)
	got := updGet(t, svc, "do=chemail&email=a@b")
	eq(t, got, `{"state":101,"info":"请输入正确的邮箱地址！"}`)
	met(t, m)

	// 邮箱被占用。
	svc, m = newUpdateService(t, fakeIdentity(7), nil)
	m.ExpectQuery(qEmailDup).WithArgs("user@example.com", int64(7)).WillReturnRows(count(1))
	got = updGet(t, svc, "do=chemail&email=user@example.com")
	eq(t, got, `{"state":101,"info":"您输入的邮箱已经被其他帐号绑定！"}`)
	met(t, m)

	// 模板缺失（canary 无 site_notify 行）→ 101「邮件通知功能未开启，发送失败！」。
	svc, m = newUpdateService(t, fakeIdentity(7), nil)
	m.ExpectQuery(qEmailDup).WithArgs("user@example.com", int64(7)).WillReturnRows(count(0))
	m.ExpectQuery(qNotifyTemplate).WithArgs("会员-手机邮箱绑定-发送验证码").
		WillReturnRows(sqlmock.NewRows([]string{"email_state", "email_title", "email_body"}))
	got = updGet(t, svc, "do=chemail&email=user@example.com")
	eq(t, got, `{"state":101,"info":"邮件通知功能未开启，发送失败！"}`)
	met(t, m)

	// 发送失败（SendMail 未装配，对应 PHP SMTP 段为空）：sendmail 内 + 分支内两条
	// messageLog（lei='' 与 lei='bind'，state=1）→ 101。
	svc, m = newUpdateService(t, fakeIdentity(7), nil)
	m.ExpectQuery(qEmailDup).WithArgs("user@example.com", int64(7)).WillReturnRows(count(0))
	m.ExpectQuery(qNotifyTemplate).WithArgs("会员-手机邮箱绑定-发送验证码").
		WillReturnRows(sqlmock.NewRows([]string{"email_state", "email_title", "email_body"}).
			AddRow("1", "绑定邮箱", "请点击 $link 完成绑定"))
	m.ExpectExec(qMsgLogInsert).WithArgs("email", "", "user@example.com", "绑定邮箱", sqlmock.AnyArg(),
		"", "", int64(7), 1, followNow, "192.0.2.1", "").WillReturnResult(sqlmock.NewResult(1, 1))
	m.ExpectExec(qMsgLogInsert).WithArgs("email", "bind", "user@example.com", "绑定邮箱", sqlmock.AnyArg(),
		"", "", int64(7), 1, followNow, "192.0.2.1", "").WillReturnResult(sqlmock.NewResult(1, 1))
	got = updGet(t, svc, "do=chemail&email=user@example.com")
	eq(t, got, `{"state":101,"info":"邮件发送失败，请稍候重试！"}`)
	met(t, m)

	// 发送成功（钩子返回空串）：两条 messageLog(state=0) + UPDATE email + member_log → 100。
	svc, m = newUpdateService(t, fakeIdentity(7), func(d *Dep) {
		d.SendMail = func(ctx context.Context, to, title, body string) string { return "" }
	})
	m.ExpectQuery(qEmailDup).WithArgs("user@example.com", int64(7)).WillReturnRows(count(0))
	m.ExpectQuery(qNotifyTemplate).WithArgs("会员-手机邮箱绑定-发送验证码").
		WillReturnRows(sqlmock.NewRows([]string{"email_state", "email_title", "email_body"}).
			AddRow("1", "绑定邮箱", "请点击 $link 完成绑定"))
	m.ExpectExec(qMsgLogInsert).WithArgs("email", "", "user@example.com", "绑定邮箱", sqlmock.AnyArg(),
		"", "", int64(7), 0, followNow, "192.0.2.1", "").WillReturnResult(sqlmock.NewResult(1, 1))
	m.ExpectExec(qUpdEmail).WithArgs("user@example.com", int64(7)).WillReturnResult(sqlmock.NewResult(0, 1))
	expectUpdateLog(m, "7", "账号绑定邮箱",
		"action=updateAccount&do=chemail&email=user@example.com&service=member",
		"UPDATE `huoniao_member` SET `email` = 'user@example.com' WHERE `id` = '7'")
	m.ExpectExec(qMsgLogInsert).WithArgs("email", "bind", "user@example.com", "绑定邮箱", sqlmock.AnyArg(),
		"", "", int64(7), 0, followNow, "192.0.2.1", "").WillReturnResult(sqlmock.NewResult(1, 1))
	got = updGet(t, svc, "do=chemail&email=user@example.com")
	eq(t, got, `{"state":100,"info":"邮件发送成功，请在24小时内点击邮件中的链接继续操作！"}`)
	met(t, m)
}

// —— 用例 19：question —— 已设置 / 缺 q1 / q1="0"（empty 语义）/ 成功 ——

func TestUpdateQuestion(t *testing.T) {
	// 已设置过 → 101。
	svc, m := newUpdateService(t, fakeIdentity(7), nil)
	m.ExpectQuery(qSecurityCount).WithArgs(int64(7)).WillReturnRows(count(1))
	got := updGet(t, svc, "do=question&q1=最好的朋友&q2=第一个宠物&answer=旺财")
	eq(t, got, `{"state":101,"info":"您已经设置过安全保护问题！"}`)
	met(t, m)

	// 缺 q1 / q1="0"（empty 语义：'0' 也算空）。
	svc, m = newUpdateService(t, fakeIdentity(7), nil)
	m.ExpectQuery(qSecurityCount).WithArgs(int64(7)).WillReturnRows(count(0))
	got = updGet(t, svc, "do=question&q2=第一个宠物&answer=旺财")
	eq(t, got, `{"state":101,"info":"请选择问题一！"}`)
	got = updGet(t, svc, "do=question&q1=0&q2=第一个宠物&answer=旺财")
	eq(t, got, `{"state":101,"info":"请选择问题一！"}`)
	met(t, m)

	// 缺 q2 / answer。
	svc, m = newUpdateService(t, fakeIdentity(7), nil)
	m.ExpectQuery(qSecurityCount).WithArgs(int64(7)).WillReturnRows(count(0))
	got = updGet(t, svc, "do=question&q1=最好的朋友&answer=旺财")
	eq(t, got, `{"state":101,"info":"请选择问题二！"}`)
	got = updGet(t, svc, "do=question&q1=最好的朋友&q2=第一个宠物")
	eq(t, got, `{"state":101,"info":"请输入您的问题答案！"}`)
	met(t, m)

	// 成功：question 形如 q1$$q2，answer 明文。
	svc, m = newUpdateService(t, fakeIdentity(7), nil)
	m.ExpectQuery(qSecurityCount).WithArgs(int64(7)).WillReturnRows(count(0))
	m.ExpectExec(qSecurityInset).WithArgs(int64(7), "最好的朋友$$第一个宠物", "旺财").
		WillReturnResult(sqlmock.NewResult(1, 1))
	expectUpdateLog(m, "7", "设置密保问题",
		"action=updateAccount&answer=旺财&do=question&q1=最好的朋友&q2=第一个宠物&service=member",
		"INSERT INTO `huoniao_member_security` (`uid`, `question`, `answer`) VALUES ('7', '最好的朋友$$第一个宠物', '旺财')")
	got = updGet(t, svc, "do=question&q1=最好的朋友&q2=第一个宠物&answer=旺财")
	eq(t, got, `{"state":100,"info":"设置成功！"}`)
	met(t, m)
}

// —— 用例 20：member_log 同秒去重（同 note + 同 uid + 同 ip + 同秒 只 1 条） ——

func TestUpdateLogDedupSameSecond(t *testing.T) {
	svc, m := newUpdateService(t, fakeIdentity(7), func(d *Dep) {
		d.UserDetail = stubDetail("旧昵称", 1, 0)
	})
	// 第一次：完整链路。
	m.ExpectQuery(qNickDupPersonal).WithArgs("新昵称", int64(7)).WillReturnRows(count(0))
	m.ExpectExec(qNickUpdate).WithArgs("新昵称", int64(7)).WillReturnResult(sqlmock.NewResult(0, 1))
	expectUpdateLog(m, "7", "修改昵称",
		"action=updateAccount&do=nick&name=新昵称&service=member",
		"UPDATE `huoniao_member` SET `nickname` = '新昵称' WHERE `id` = 7")
	got := updGet(t, svc, "do=nick&name=新昵称")
	eq(t, got, `{"state":100,"info":"修改成功！"}`)

	// 同一秒再提交一次（clock 固定）：去重查询命中 → 不再写 member_log。
	m.ExpectQuery(qNickDupPersonal).WithArgs("新昵称", int64(7)).WillReturnRows(count(0))
	m.ExpectExec(qNickUpdate).WithArgs("新昵称", int64(7)).WillReturnResult(sqlmock.NewResult(0, 1))
	m.ExpectQuery(qLogCount).
		WithArgs(md5Hex("修改昵称"), "7", testLogIP, followNow).
		WillReturnRows(count(1))
	got = updGet(t, svc, "do=nick&name=新昵称")
	eq(t, got, `{"state":100,"info":"修改成功！"}`)
	met(t, m)
}

// —— 辅助：validatePassword 判定表（cfg_pwdLevel 0-3） ——

func TestValidatePasswordLevels(t *testing.T) {
	// 0：不校验。
	if phpValidatePassword("a", 0) != "ok" {
		t.Fatal("level 0 应不校验")
	}
	// 1：只查长度（strlen 数转义后的反斜杠）。
	if phpValidatePassword("1234567", 1) != "密码不安全，长度不得小于8位！" {
		t.Fatal("level 1 长度不足应拒绝")
	}
	if phpValidatePassword("12345678", 1) != "ok" {
		t.Fatal("level 1 长度足够应通过")
	}
	// 2：8 位 + 数字和字母。
	if phpValidatePassword("12345678", 2) != "密码不安全，必须包含数字和字母！" {
		t.Fatal("level 2 纯数字应拒绝")
	}
	if phpValidatePassword("abcd1234", 2) != "ok" {
		t.Fatal("level 2 数字+字母应通过")
	}
	// 3：大小写数字特殊且禁连续/重复三连。
	if phpValidatePassword("abcd1234", 3) != "密码不安全，必须包含数字、小写字母、大写字母和特殊字符，同时不能用连续或重复的字母和数字(如abc/cba/123/321/aaa/666等)" {
		t.Fatal("level 3 缺大写/特殊应拒绝")
	}
	if phpValidatePassword("Abc123!xyz", 3) != "密码不安全，必须包含数字、小写字母、大写字母和特殊字符，同时不能用连续或重复的字母和数字(如abc/cba/123/321/aaa/666等)" {
		t.Fatal("level 3 含 abc 连续应拒绝")
	}
	if phpValidatePassword("Aa1!aa1!", 3) != "ok" {
		t.Fatal("level 3 合格密码应通过")
	}
	if phpValidatePassword("Xy9$Xy9$", 3) != "ok" {
		t.Fatal("level 3 无三连应通过")
	}
}

// cnSubstrR 宽度算法抽查：数字按 0.5 宽计（ord < 65 落 else 分支）。
func TestCnSubstrRWidth(t *testing.T) {
	if got := cnSubstrR(strings.Repeat("1", 41), 20); got != strings.Repeat("1", 40) {
		t.Fatalf("数字 0.5 宽截断错误：%d", len(got))
	}
	if got := cnSubstrR("ABab12中", 20); got != "ABab12中" {
		t.Fatalf("混合宽度不应截断：%q", got)
	}
	if got := cnSubstrR(strings.Repeat("A", 21), 20); got != strings.Repeat("A", 20) {
		t.Fatalf("大写字母 1 宽截断错误")
	}
}

// urlEncodeJSON 编码 phoneData 的 JSON 串。
func urlEncodeJSON(s string) string {
	var b strings.Builder
	for i := 0; i < len(s); i++ {
		if (s[i] >= 'a' && s[i] <= 'z') || (s[i] >= 'A' && s[i] <= 'Z') || (s[i] >= '0' && s[i] <= '9') ||
			s[i] == '-' || s[i] == '_' || s[i] == '.' || s[i] == '~' {
			b.WriteByte(s[i])
		} else {
			fmt.Fprintf(&b, "%%%02X", s[i])
		}
	}
	return b.String()
}
