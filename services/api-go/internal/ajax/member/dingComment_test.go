package member

import (
	"errors"
	"testing"

	sqlmock "github.com/DATA-DOG/go-sqlmock"
)

// 迁移自 member.class.php:18022-18108（dingComment）的 L1 测试（#257）。
// dingComment 的连带写走本包已迁移的 getZan（#258），所以这里的期望序列是
// getZan 的 SQL（site_module → public_up_all → member 用户名 → DELETE/INSERT → member_log），
// 最后才是 dingComment 自己的 UPDATE public_comment_all。

const (
	qDingComment = "SELECT `userid`, `zan_user`, `type` FROM `huoniao_public_comment_all` WHERE `id` = ? AND `ischeck` = 1"
	qDingUpdate  = "UPDATE `huoniao_public_comment_all` SET `zan` = ?, `zan_user` = ? WHERE `id` = ?"

	okDing = `{"state":100,"info":"操作成功"}`
)

// dingCommentRow 造一条 public_comment_all 记录（userid, zan_user, type）。
func dingCommentRow(author, zanUser, action any) *sqlmock.Rows {
	return sqlmock.NewRows([]string{"userid", "zan_user", "type"}).AddRow(author, zanUser, action)
}

// expectDingModuleTitle 是 getZan 在门禁之前无条件执行的 getModuleTitle。
func expectDingModuleTitle(m sqlmock.Sqlmock, module, title string) {
	m.ExpectQuery(qModuleTitle).WithArgs(module).WillReturnRows(moduleRows(title, nil))
}

// expectDingUsername 是 getZan 里 $userinfo = getMemberInfo() 取 username 的那次查询。
func expectDingUsername(m sqlmock.Sqlmock, userid int64, name string) {
	m.ExpectQuery(qUsername).WithArgs(userid).
		WillReturnRows(sqlmock.NewRows([]string{"username"}).AddRow(name))
}

// expectDingUpCheck 是 getZan 查 public_up_all 是否已有这次点赞（type 恒 1、tid 是评论 id）。
func expectDingUpCheck(m sqlmock.Sqlmock, temp, module, tid string, userid int64, foundRow bool) {
	rows := sqlmock.NewRows([]string{"id"})
	if foundRow {
		rows = rows.AddRow(3)
	}
	m.ExpectQuery(qUpCheck).WithArgs(1, temp, module, tid, userid).WillReturnRows(rows)
}

// 未登录：getMemberID() == -1 → 101 登录超时，先于参数校验（issue 正文写的「匿名可测参数错误」不成立）。
func TestDingCommentAnonymous(t *testing.T) {
	svc, m := newFollowServiceWith(t, fakeIdentity(-1), nil)
	for _, q := range []string{"", "&id=1", "&id=abc", "&id=0&type=add"} {
		got := do(t, svc, "GET", "/include/ajax.php?service=member&action=dingComment"+q, "")
		eq(t, got, `{"state":101,"info":"登录超时，请重新登录！"}`)
	}
	met(t, m)
}

// id 经 ajax.php 归一 + (int) 后为 0 → 101 参数错误，不读库。
func TestDingCommentBadID(t *testing.T) {
	for _, q := range []string{"", "&id=abc", "&id=0", "&id=", "&id%5B%5D=0", "&id%5B%5D=abc"} {
		svc, m := newFollowServiceWith(t, fakeIdentity(7), nil)
		got := do(t, svc, "GET", "/include/ajax.php?service=member&action=dingComment"+q, "")
		eq(t, got, `{"state":101,"info":"参数错误"}`)
		met(t, m)
	}
}

// ischeck != 1 与「没有这行」是同一个出口（PHP 的 if($ret) 为假）→ 101 原评价不存在。
func TestDingCommentNotFound(t *testing.T) {
	svc, m := newFollowServiceWith(t, fakeIdentity(7), nil)
	m.ExpectQuery(qDingComment).WithArgs(1).WillReturnRows(sqlmock.NewRows([]string{"userid", "zan_user", "type"}))
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=dingComment&id=1&type=add", "")
	eq(t, got, `{"state":101,"info":"原评价不存在"}`)
	met(t, m)
}

// 查评论失败：dsqlOper 在 PHP 侧会吞异常返回垃圾串，Go 按本包口径降级 102。
func TestDingCommentQueryError(t *testing.T) {
	svc, m := newFollowServiceWith(t, fakeIdentity(7), nil)
	m.ExpectQuery(qDingComment).WithArgs(1).WillReturnError(errors.New("boom"))
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=dingComment&id=1&type=add", "")
	eq(t, got, `{"state":102,"info":"No data!"}`)
	met(t, m)
}

// 点赞：zan_user 为空 → 追加自己；getZan 写 public_up_all + member_log；最后 UPDATE 评论表。
func TestDingCommentAdd(t *testing.T) {
	svc, m := newFollowServiceWith(t, fakeIdentity(7), nil)
	m.ExpectQuery(qDingComment).WithArgs(1).WillReturnRows(dingCommentRow("9", "", "article-detail"))
	expectDingModuleTitle(m, "article", "文章")
	expectDingUpCheck(m, "article-detail", "article", "1", 7, false)
	expectDingUsername(m, 7, "小明")
	m.ExpectExec(qUpInsert).WithArgs("9", "1", int64(7), "article", "article-detail",
		int64(1700000000), 1).WillReturnResult(sqlmock.NewResult(1, 1))
	expectLogZan(m, "7", 1, "article", "insert", "点赞( => 文章小明点赞了您的评论)",
		"action=dingComment&id=1&service=member&type=add",
		"INSERT INTO `huoniao_public_up_all` (`uid`, `tid`, `ruid`, `module`, `action`, `puctime`, `type`) "+
			"VALUES ('9', '1', '7', 'article', 'article-detail', '1700000000', '1')")
	m.ExpectExec(qDingUpdate).WithArgs(1, "7", 1).WillReturnResult(sqlmock.NewResult(0, 1))

	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=dingComment&id=1&type=add", "")
	eq(t, got, okDing)
	met(t, m)
}

// zan_user 是 "0" 时与空串等价（PHP 的 falsy），同样走追加；NULL 作者 → INSERT 的 uid 是空串。
func TestDingCommentZanUserZeroAndNullAuthor(t *testing.T) {
	svc, m := newFollowServiceWith(t, fakeIdentity(7), nil)
	m.ExpectQuery(qDingComment).WithArgs(1).WillReturnRows(dingCommentRow(nil, "0", "article-detail"))
	expectDingModuleTitle(m, "article", "文章")
	expectDingUpCheck(m, "article-detail", "article", "1", 7, false)
	expectDingUsername(m, 7, "小明")
	m.ExpectExec(qUpInsert).WithArgs("", "1", int64(7), "article", "article-detail",
		int64(1700000000), 1).WillReturnResult(sqlmock.NewResult(1, 1))
	expectLogZan(m, "7", 1, "article", "insert", "点赞( => 文章小明点赞了您的评论)",
		"action=dingComment&id=1&service=member&type=add",
		"INSERT INTO `huoniao_public_up_all` (`uid`, `tid`, `ruid`, `module`, `action`, `puctime`, `type`) "+
			"VALUES ('', '1', '7', 'article', 'article-detail', '1700000000', '1')")
	m.ExpectExec(qDingUpdate).WithArgs(1, "7", 1).WillReturnResult(sqlmock.NewResult(0, 1))

	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=dingComment&id=1&type=add", "")
	eq(t, got, okDing)
	met(t, m)
}

// add 且已经在 zan_user 里 → 101「您已经赞过」，不调 getZan、不写库。
func TestDingCommentAlreadyLiked(t *testing.T) {
	svc, m := newFollowServiceWith(t, fakeIdentity(7), nil)
	m.ExpectQuery(qDingComment).WithArgs(1).WillReturnRows(dingCommentRow("9", "7,8", "article-detail"))
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=dingComment&id=1&type=add", "")
	eq(t, got, `{"state":101,"info":"您已经赞过"}`)
	met(t, m)
}

// 取消：在 zan_user 里 → getZan 删 public_up_all + 写日志，再 UPDATE 评论表。
func TestDingCommentCancel(t *testing.T) {
	svc, m := newFollowServiceWith(t, fakeIdentity(7), nil)
	m.ExpectQuery(qDingComment).WithArgs(1).WillReturnRows(dingCommentRow("9", "7,8", "article-detail"))
	expectDingModuleTitle(m, "article", "文章")
	expectDingUpCheck(m, "article-detail", "article", "1", 7, true)
	expectDingUsername(m, 7, "小明")
	m.ExpectExec(qUpDelete).WithArgs(1, "article-detail", "article", "1", int64(7)).
		WillReturnResult(sqlmock.NewResult(0, 1))
	expectLogZan(m, "7", 1, "article", "delete", "取消点赞( => 文章小明取消了点赞您的评论)",
		"action=dingComment&id=1&service=member",
		"DELETE FROM `huoniao_public_up_all` WHERE `type` = '1' and `action` = 'article-detail' "+
			"and `module` = 'article' and `tid` = '1' and `ruid` = '7'")
	m.ExpectExec(qDingUpdate).WithArgs(1, "8", 1).WillReturnResult(sqlmock.NewResult(0, 1))

	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=dingComment&id=1", "")
	eq(t, got, okDing)
	met(t, m)
}

// 取消到空：zan=0、zan_user 是空串（PHP 空数组 join 的结果，不是 NULL）。
func TestDingCommentCancelToEmpty(t *testing.T) {
	svc, m := newFollowServiceWith(t, fakeIdentity(7), nil)
	m.ExpectQuery(qDingComment).WithArgs(1).WillReturnRows(dingCommentRow("9", "7", "article-detail"))
	expectDingModuleTitle(m, "article", "文章")
	expectDingUpCheck(m, "article-detail", "article", "1", 7, true)
	expectDingUsername(m, 7, "小明")
	m.ExpectExec(qUpDelete).WithArgs(1, "article-detail", "article", "1", int64(7)).
		WillReturnResult(sqlmock.NewResult(0, 1))
	expectLogZan(m, "7", 1, "article", "delete", "取消点赞( => 文章小明取消了点赞您的评论)",
		"action=dingComment&id=1&service=member",
		"DELETE FROM `huoniao_public_up_all` WHERE `type` = '1' and `action` = 'article-detail' "+
			"and `module` = 'article' and `tid` = '1' and `ruid` = '7'")
	m.ExpectExec(qDingUpdate).WithArgs(0, "", 1).WillReturnResult(sqlmock.NewResult(0, 1))

	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=dingComment&id=1", "")
	eq(t, got, okDing)
	met(t, m)
}

// 取消但用户不在 zan_user 里 → 直接返回字符串「操作成功」，不同步 public_up_all、不写库。
func TestDingCommentCancelNoChange(t *testing.T) {
	svc, m := newFollowServiceWith(t, fakeIdentity(7), nil)
	m.ExpectQuery(qDingComment).WithArgs(1).WillReturnRows(dingCommentRow("9", "8", "article-detail"))
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=dingComment&id=1", "")
	eq(t, got, okDing)
	met(t, m)
}

// UPDATE 失败 → 101「操作失败，请重试！」（getZan 已经写完，不回滚，照 PHP）。
func TestDingCommentUpdateFailed(t *testing.T) {
	svc, m := newFollowServiceWith(t, fakeIdentity(7), nil)
	m.ExpectQuery(qDingComment).WithArgs(1).WillReturnRows(dingCommentRow("9", "", "article-detail"))
	expectDingModuleTitle(m, "article", "文章")
	expectDingUpCheck(m, "article-detail", "article", "1", 7, false)
	expectDingUsername(m, 7, "小明")
	m.ExpectExec(qUpInsert).WithArgs("9", "1", int64(7), "article", "article-detail",
		int64(1700000000), 1).WillReturnResult(sqlmock.NewResult(1, 1))
	expectLogZan(m, "7", 1, "article", "insert", "点赞( => 文章小明点赞了您的评论)",
		"action=dingComment&id=1&service=member&type=add",
		"INSERT INTO `huoniao_public_up_all` (`uid`, `tid`, `ruid`, `module`, `action`, `puctime`, `type`) "+
			"VALUES ('9', '1', '7', 'article', 'article-detail', '1700000000', '1')")
	m.ExpectExec(qDingUpdate).WithArgs(1, "7", 1).WillReturnError(errors.New("boom"))

	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=dingComment&id=1&type=add", "")
	eq(t, got, `{"state":101,"info":"操作失败，请重试！"}`)
	met(t, m)
}

// check=1 透传给 getZan：只探测已赞/未赞（返回值被丢弃），不写 public_up_all、不写日志；
// dingComment 自己的 UPDATE 照常执行。
func TestDingCommentCheckSkipsZanWrites(t *testing.T) {
	svc, m := newFollowServiceWith(t, fakeIdentity(7), nil)
	m.ExpectQuery(qDingComment).WithArgs(1).WillReturnRows(dingCommentRow("9", "", "article-detail"))
	expectDingModuleTitle(m, "article", "文章")
	expectDingUpCheck(m, "article-detail", "article", "1", 7, false)
	m.ExpectExec(qDingUpdate).WithArgs(1, "7", 1).WillReturnResult(sqlmock.NewResult(0, 1))

	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=dingComment&id=1&type=add&check=1", "")
	eq(t, got, okDing)
	met(t, m)
}

// module 取评论 type 的第一段、temp 是整个 type；请求里自带的 module/uid/type 被覆盖。
func TestDingCommentOverridesRequestParams(t *testing.T) {
	svc, m := newFollowServiceWith(t, fakeIdentity(7), nil)
	m.ExpectQuery(qDingComment).WithArgs(1).
		WillReturnRows(dingCommentRow("9", "", "article-detail-x"))
	expectDingModuleTitle(m, "article", "文章")
	expectDingUpCheck(m, "article-detail-x", "article", "1", 7, false)
	expectDingUsername(m, 7, "小明")
	m.ExpectExec(qUpInsert).WithArgs("9", "1", int64(7), "article", "article-detail-x",
		int64(1700000000), 1).WillReturnResult(sqlmock.NewResult(1, 1))
	expectLogZan(m, "7", 1, "article", "insert", "点赞( => 文章小明点赞了您的评论)",
		"action=dingComment&id=1&module=job&service=member&temp=detail&type=add&uid=999",
		"INSERT INTO `huoniao_public_up_all` (`uid`, `tid`, `ruid`, `module`, `action`, `puctime`, `type`) "+
			"VALUES ('9', '1', '7', 'article', 'article-detail-x', '1700000000', '1')")
	m.ExpectExec(qDingUpdate).WithArgs(1, "7", 1).WillReturnResult(sqlmock.NewResult(0, 1))

	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=dingComment"+
		"&id=1&type=add&module=job&temp=detail&uid=999", "")
	eq(t, got, okDing)
	met(t, m)
}

// id[] 数组形态经 ajax.php 归一成 "5"，再 (int) → 5。
func TestDingCommentArrayID(t *testing.T) {
	svc, m := newFollowServiceWith(t, fakeIdentity(7), nil)
	m.ExpectQuery(qDingComment).WithArgs(5).WillReturnRows(dingCommentRow("9", "", "article-detail"))
	expectDingModuleTitle(m, "article", "文章")
	expectDingUpCheck(m, "article-detail", "article", "5", 7, false)
	expectDingUsername(m, 7, "小明")
	m.ExpectExec(qUpInsert).WithArgs("9", "5", int64(7), "article", "article-detail",
		int64(1700000000), 1).WillReturnResult(sqlmock.NewResult(1, 1))
	expectLogZan(m, "7", 5, "article", "insert", "点赞( => 文章小明点赞了您的评论)",
		"action=dingComment&id[]=5&service=member&type=add",
		"INSERT INTO `huoniao_public_up_all` (`uid`, `tid`, `ruid`, `module`, `action`, `puctime`, `type`) "+
			"VALUES ('9', '5', '7', 'article', 'article-detail', '1700000000', '1')")
	m.ExpectExec(qDingUpdate).WithArgs(1, "7", 5).WillReturnResult(sqlmock.NewResult(0, 1))

	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=dingComment&id%5B%5D=5&type=add", "")
	eq(t, got, okDing)
	met(t, m)
}

// title 是请求参数，原样进 memberLog 的 note（$.title  => $content）。
func TestDingCommentTitleFromRequest(t *testing.T) {
	svc, m := newFollowServiceWith(t, fakeIdentity(7), nil)
	m.ExpectQuery(qDingComment).WithArgs(1).WillReturnRows(dingCommentRow("9", "", "article-detail"))
	expectDingModuleTitle(m, "article", "文章")
	expectDingUpCheck(m, "article-detail", "article", "1", 7, false)
	expectDingUsername(m, 7, "小明")
	m.ExpectExec(qUpInsert).WithArgs("9", "1", int64(7), "article", "article-detail",
		int64(1700000000), 1).WillReturnResult(sqlmock.NewResult(1, 1))
	expectLogZan(m, "7", 1, "article", "insert", "点赞(标题 => 文章小明点赞了您的评论)",
		"action=dingComment&id=1&service=member&title=标题&type=add",
		"INSERT INTO `huoniao_public_up_all` (`uid`, `tid`, `ruid`, `module`, `action`, `puctime`, `type`) "+
			"VALUES ('9', '1', '7', 'article', 'article-detail', '1700000000', '1')")
	m.ExpectExec(qDingUpdate).WithArgs(1, "7", 1).WillReturnResult(sqlmock.NewResult(0, 1))

	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=dingComment&id=1&type=add&title=标题", "")
	eq(t, got, okDing)
	met(t, m)
}

// 禁止点赞开关：非 0 直接返回提示语，先于登录校验、不读库；配置为空/"0" 用默认文案。
func TestDingCommentDisabled(t *testing.T) {
	svc, m := newFollowServiceWith(t, fakeIdentity(-1), func(d *Dep) {
		state := 1
		d.DisableLikeState = &state
	})
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=dingComment&id=1&type=add", "")
	eq(t, got, `{"state":101,"info":"功能维护中，暂停使用！"}`)
	met(t, m)

	svc, m = newFollowServiceWith(t, fakeIdentity(-1), func(d *Dep) {
		state, info := 2, "点赞维护中"
		d.DisableLikeState = &state
		d.DisableLikeInfo = &info
	})
	got = do(t, svc, "GET", "/include/ajax.php?service=member&action=dingComment&id=1&type=add", "")
	eq(t, got, `{"state":101,"info":"点赞维护中"}`)
	met(t, m)
}

// 无数据库：门禁都过了才降级 102。
func TestDingCommentNoDB(t *testing.T) {
	svc, _ := newService(t, fakeIdentity(7))
	svc.db = nil
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=dingComment&id=1&type=add", "")
	eq(t, got, `{"state":102,"info":"No data!"}`)
}
