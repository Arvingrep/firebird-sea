package member

import (
	"testing"

	sqlmock "github.com/DATA-DOG/go-sqlmock"
)

// 迁移自 member.class.php:18965-19133 的 getZan（#258）。
// SQL 用 QueryMatcherEqual 全串匹配；memberLog 的 note / sql 用 argEq 断言。

const (
	qUpCheck        = "SELECT `id` FROM `huoniao_public_up_all` WHERE `type` = ? and `action` = ? and `module` = ? and `tid` = ? and `ruid` = ?"
	qUpInsert       = "INSERT INTO `huoniao_public_up_all` (`uid`, `tid`, `ruid`, `module`, `action`, `puctime`, `type`) VALUES (?, ?, ?, ?, ?, ?, ?)"
	qUsername       = "SELECT `username` FROM `huoniao_member` WHERE `state` = 1 AND `mtype` != 0 AND `mtype` != 3 AND `id` = ?"
	qModuleTitle    = "SELECT `title`, `subject` FROM `huoniao_site_module` WHERE `name` = ?"
	qSubTables      = "SELECT `table_name`, `begin_id` FROM `huoniao_site_sub_tablelist` WHERE `service` = 'articlelist' ORDER BY `id` DESC"
	qArticleZan     = "UPDATE `huoniao_articlelist` SET `zan` = zan + 1 WHERE `id` = ?"
	qArticleZanDown = "UPDATE `huoniao_articlelist` SET `zan` = zan - 1 WHERE `id` = ?"
	qTravelZan      = "UPDATE `huoniao_travel_video` SET `zan` = zan + 1 WHERE `id` = ?"
	qTravelZanDown  = "UPDATE `huoniao_travel_video` SET `zan` = zan - 1 WHERE `id` = ?"
	qTiebaUp        = "UPDATE `huoniao_tieba_list` SET `up` = up + 1 WHERE `id` = ?"
	qTiebaUpDown    = "UPDATE `huoniao_tieba_list` SET `up` = up - 1 WHERE `id` = ?"
	qUpDelete       = "DELETE FROM `huoniao_public_up_all` WHERE `type` = '0' and `action` = 'detail' and `module` = 'article' and `tid` = '5' and `ruid` = '7'"
)

// zanGet 请求 getZan，query 形如 "id=5&module=article"（不含 service/action）。
func zanGet(t *testing.T, svc *Service, identity Identity, query string) string {
	t.Helper()
	return do(t, svc, "GET", "/include/ajax.php?service=member&action=getZan&"+query, "")
}

// newZanService 同 newService 但允许改 Dep（开关等）。
func newZanService(t *testing.T, identity Identity, mut func(*Dep)) (*Service, sqlmock.Sqlmock) {
	return newFollowServiceWith(t, identity, mut)
}

// moduleRows 是 site_module 查询的返回行。
func moduleRows(title, subject any) *sqlmock.Rows {
	return sqlmock.NewRows([]string{"title", "subject"}).AddRow(title, subject)
}

// expectLogZan 期待 member_log 的去重查询 + 写入（getZan 版本：module 是业务模块，temp 为空）。
func expectLogZan(m sqlmock.Sqlmock, uid string, aid int64, module, action, note, param, sqlText string) {
	m.ExpectQuery(qLogCount).
		WithArgs(md5Hex(note), uid, testLogIP, followNow).
		WillReturnRows(count(0))
	m.ExpectExec(qLogInsert).
		WithArgs(uid, module, "", aid, action, argEq(note), "", testLogIP, "", "",
			argEq(sqlText), followNow, md5Hex(note), testLogURL, argEq(param), "").
		WillReturnResult(sqlmock.NewResult(1, 1))
}

// 禁止点赞开关：非 0 直接返回提示语（先于登录校验，不查任何库）。
func TestGetZanDisableLike(t *testing.T) {
	// canary 未配置提示语（空串）→ PHP 默认文案。
	svc, m := newZanService(t, fakeIdentity(-1), func(d *Dep) {
		state := 1
		d.DisableLikeState = &state
	})
	got := zanGet(t, svc, fakeIdentity(-1), "id=5&module=article&temp=detail")
	eq(t, got, `{"state":101,"info":"功能维护中，暂停使用！"}`)
	met(t, m)

	// 配置了提示语原样返回；"0" 按 PHP 真值判断是假 → 仍走默认文案。
	svc, m = newZanService(t, fakeIdentity(-1), func(d *Dep) {
		state, info := 2, "点赞维护中"
		d.DisableLikeState = &state
		d.DisableLikeInfo = &info
	})
	got = zanGet(t, svc, fakeIdentity(-1), "check=1")
	eq(t, got, `{"state":101,"info":"点赞维护中"}`)
	met(t, m)
}

// check 模式匿名：跳过登录/参数门禁，查 site_module（模块名在门禁之前取）+ public_up_all，
// 未赞返回字符串 "no"。
func TestGetZanCheckAnonymousNo(t *testing.T) {
	svc, m := newZanService(t, fakeIdentity(-1), nil)
	m.ExpectQuery(qModuleTitle).WithArgs("article").WillReturnRows(moduleRows("资讯", nil))
	m.ExpectQuery(qUpCheck).WithArgs(0, "detail", "article", "5", int64(-1)).WillReturnRows(sqlmock.NewRows([]string{"id"}))
	got := zanGet(t, svc, fakeIdentity(-1), "id=5&module=article&temp=detail&check=1")
	eq(t, got, `{"state":100,"info":"no"}`)
	met(t, m)
}

// check 模式已赞返回 "has"。
func TestGetZanCheckAnonymousHas(t *testing.T) {
	svc, m := newZanService(t, fakeIdentity(-1), nil)
	m.ExpectQuery(qModuleTitle).WithArgs("article").WillReturnRows(moduleRows("资讯", "专题资讯"))
	m.ExpectQuery(qUpCheck).WithArgs(0, "detail", "article", "5", int64(-1)).
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(9))
	got := zanGet(t, svc, fakeIdentity(-1), "id=5&module=article&temp=detail&check=1")
	eq(t, got, `{"state":100,"info":"has"}`)
	met(t, m)
}

// check 的真值判断照 PHP：'0' 是假值（走正常门禁），任意非空非 '0' 字符串为真；check[] 非空数组为真。
func TestGetZanCheckTruthy(t *testing.T) {
	// check=0 → 假值 → 匿名直接登录超时，连 site_module 都不查（module 为空时）。
	svc, m := newZanService(t, fakeIdentity(-1), nil)
	got := zanGet(t, svc, fakeIdentity(-1), "id=5&check=0")
	eq(t, got, `{"state":101,"info":"登录超时，请重新登录！"}`)
	met(t, m)

	// check=1 时缺 id/module/temp 也照常探测。
	svc, m = newZanService(t, fakeIdentity(-1), nil)
	m.ExpectQuery(qUpCheck).WithArgs(0, "", "", "", int64(-1)).WillReturnRows(sqlmock.NewRows([]string{"id"}))
	got = zanGet(t, svc, fakeIdentity(-1), "check=1")
	eq(t, got, `{"state":100,"info":"no"}`)
	met(t, m)
}

// 正常路径门禁顺序：匿名先登录超时（moduleTitle 会先查一次 site_module）；已登录缺参数才是参数错误。
func TestGetZanGates(t *testing.T) {
	// 匿名 + module=article：getModuleTitle 在登录门禁之前执行。
	svc, m := newZanService(t, fakeIdentity(-1), nil)
	m.ExpectQuery(qModuleTitle).WithArgs("article").WillReturnRows(moduleRows("资讯", nil))
	got := zanGet(t, svc, fakeIdentity(-1), "id=5&module=article&temp=detail")
	eq(t, got, `{"state":101,"info":"登录超时，请重新登录！"}`)
	met(t, m)

	// 已登录：id/module/temp 任一为空 → 101 参数错误，不碰库。
	for _, q := range []string{
		"module=article&temp=detail",
		"id=5&temp=detail",
		"id=5&module=article",
		"id=5&module=article&temp=detail&temp=0",
	} {
		svc, m := newZanService(t, fakeIdentity(7), nil)
		got := zanGet(t, svc, fakeIdentity(7), q)
		eq(t, got, `{"state":101,"info":"参数错误"}`)
		met(t, m)
	}
}

// article+detail 首赞：分表清单为空 → 写主表 huoniao_articlelist；INSERT 底账；
// memberLog 记 insert；uid/title 原样进 SQL 与文案。
func TestGetZanArticleFirstLike(t *testing.T) {
	svc, m := newZanService(t, fakeIdentity(7), nil)
	m.ExpectQuery(qModuleTitle).WithArgs("article").WillReturnRows(moduleRows("资讯", nil))
	m.ExpectQuery(qUpCheck).WithArgs(0, "detail", "article", "5", int64(7)).WillReturnRows(sqlmock.NewRows([]string{"id"}))
	m.ExpectQuery(qUsername).WithArgs(int64(7)).WillReturnRows(sqlmock.NewRows([]string{"username"}).AddRow("tg_99990001"))
	m.ExpectQuery(qSubTables).WillReturnRows(sqlmock.NewRows([]string{"table_name", "begin_id"}))
	m.ExpectExec(qArticleZan).WithArgs("5").WillReturnResult(sqlmock.NewResult(0, 1))
	m.ExpectExec(qUpInsert).WithArgs("3", "5", int64(7), "article", "detail", followNow, 0).
		WillReturnResult(sqlmock.NewResult(9, 1))
	insertSQL := "INSERT INTO `huoniao_public_up_all` (`uid`, `tid`, `ruid`, `module`, `action`, `puctime`, `type`) VALUES ('3', '5', '7', 'article', 'detail', '1700000000', '0')"
	expectLogZan(m, "7", 5, "article", "insert", "点赞(T => 资讯tg_99990001点赞了您的信息)",
		"action=getZan&id=5&module=article&service=member&temp=detail&title=T&uid=3", insertSQL)
	got := zanGet(t, svc, fakeIdentity(7), "id=5&module=article&temp=detail&uid=3&title=T")
	eq(t, got, okBody)
	met(t, m)
}

// type=1 文案是「点赞了您的评论」；subject 有值时模块名取 subject。
func TestGetZanType1Comment(t *testing.T) {
	svc, m := newZanService(t, fakeIdentity(7), nil)
	m.ExpectQuery(qModuleTitle).WithArgs("tieba").WillReturnRows(moduleRows("贴吧", "社区"))
	m.ExpectQuery(qUpCheck).WithArgs(1, "detail", "tieba", "5", int64(7)).WillReturnRows(sqlmock.NewRows([]string{"id"}))
	m.ExpectQuery(qUsername).WithArgs(int64(7)).WillReturnRows(sqlmock.NewRows([]string{"username"}).AddRow("op"))
	m.ExpectExec(qTiebaUp).WithArgs("5").WillReturnResult(sqlmock.NewResult(0, 1))
	m.ExpectExec(qUpInsert).WithArgs("", "5", int64(7), "tieba", "detail", followNow, 1).
		WillReturnResult(sqlmock.NewResult(9, 1))
	insertSQL := "INSERT INTO `huoniao_public_up_all` (`uid`, `tid`, `ruid`, `module`, `action`, `puctime`, `type`) VALUES ('', '5', '7', 'tieba', 'detail', '1700000000', '1')"
	expectLogZan(m, "7", 5, "tieba", "insert", "点赞( => 社区op点赞了您的评论)",
		"action=getZan&id=5&module=tieba&service=member&temp=detail&type=1", insertSQL)
	got := zanGet(t, svc, fakeIdentity(7), "id=5&module=tieba&temp=detail&type=1")
	eq(t, got, okBody)
	met(t, m)
}

// travel+video-detail 写 travel_video.zan；travelVideo 计数失败 → 101 操作失败，且不 INSERT 底账。
func TestGetZanTravelAndFailure(t *testing.T) {
	svc, m := newZanService(t, fakeIdentity(7), nil)
	m.ExpectQuery(qUpCheck).WithArgs(0, "video-detail", "travel", "5", int64(7)).WillReturnRows(sqlmock.NewRows([]string{"id"}))
	m.ExpectQuery(qUsername).WithArgs(int64(7)).WillReturnRows(sqlmock.NewRows([]string{"username"}).AddRow("op"))
	m.ExpectExec(qTravelZan).WithArgs("5").WillReturnResult(sqlmock.NewResult(0, 1))
	m.ExpectExec(qUpInsert).WithArgs("", "5", int64(7), "travel", "video-detail", followNow, 0).
		WillReturnResult(sqlmock.NewResult(9, 1))
	insertSQL := "INSERT INTO `huoniao_public_up_all` (`uid`, `tid`, `ruid`, `module`, `action`, `puctime`, `type`) VALUES ('', '5', '7', 'travel', 'video-detail', '1700000000', '0')"
	expectLogZan(m, "7", 5, "travel", "insert", "点赞( => op点赞了您的信息)",
		"action=getZan&id=5&module=travel&service=member&temp=video-detail", insertSQL)
	got := zanGet(t, svc, fakeIdentity(7), "id=5&module=travel&temp=video-detail")
	eq(t, got, okBody)
	met(t, m)

	// 计数列写失败（dsqlOper 返回非 ok）→ 101 操作失败，不 INSERT。
	svc, m = newZanService(t, fakeIdentity(7), nil)
	m.ExpectQuery(qUpCheck).WithArgs(0, "video-detail", "travel", "5", int64(7)).WillReturnRows(sqlmock.NewRows([]string{"id"}))
	m.ExpectQuery(qUsername).WithArgs(int64(7)).WillReturnRows(sqlmock.NewRows([]string{"username"}).AddRow("op"))
	m.ExpectExec(qTravelZan).WithArgs("5").WillReturnError(errFake)
	got = zanGet(t, svc, fakeIdentity(7), "id=5&module=travel&temp=video-detail")
	eq(t, got, `{"state":101,"info":"操作失败，请重试！"}`)
	met(t, m)
}

// 其余 module/temp 组合不写计数列（恒 ok），只写底账。
func TestGetZanOtherModuleNoCounter(t *testing.T) {
	svc, m := newZanService(t, fakeIdentity(7), nil)
	m.ExpectQuery(qModuleTitle).WithArgs("live").WillReturnRows(moduleRows("直播", nil))
	m.ExpectQuery(qUpCheck).WithArgs(0, "detail", "live", "5", int64(7)).WillReturnRows(sqlmock.NewRows([]string{"id"}))
	m.ExpectQuery(qUsername).WithArgs(int64(7)).WillReturnRows(sqlmock.NewRows([]string{"username"}).AddRow("op"))
	m.ExpectExec(qUpInsert).WithArgs("", "5", int64(7), "live", "detail", followNow, 0).
		WillReturnResult(sqlmock.NewResult(9, 1))
	insertSQL := "INSERT INTO `huoniao_public_up_all` (`uid`, `tid`, `ruid`, `module`, `action`, `puctime`, `type`) VALUES ('', '5', '7', 'live', 'detail', '1700000000', '0')"
	expectLogZan(m, "7", 5, "live", "insert", "点赞( => 直播op点赞了您的信息)",
		"action=getZan&id=5&module=live&service=member&temp=detail", insertSQL)
	got := zanGet(t, svc, fakeIdentity(7), "id=5&module=live&temp=detail")
	eq(t, got, okBody)
	met(t, m)
}

// 取消路径：查重命中 → 计数 -1 → DELETE 底账（不校验结果）→ memberLog 记 delete，不通知。
func TestGetZanCancel(t *testing.T) {
	svc, m := newZanService(t, fakeIdentity(7), nil)
	m.ExpectQuery(qModuleTitle).WithArgs("article").WillReturnRows(moduleRows("资讯", nil))
	m.ExpectQuery(qUpCheck).WithArgs(0, "detail", "article", "5", int64(7)).
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(9))
	m.ExpectQuery(qUsername).WithArgs(int64(7)).WillReturnRows(sqlmock.NewRows([]string{"username"}).AddRow("tg_99990001"))
	m.ExpectQuery(qSubTables).WillReturnRows(sqlmock.NewRows([]string{"table_name", "begin_id"}))
	m.ExpectExec(qArticleZanDown).WithArgs("5").WillReturnResult(sqlmock.NewResult(0, 1))
	m.ExpectExec(qUpDelete).WillReturnResult(sqlmock.NewResult(0, 1))
	expectLogZan(m, "7", 5, "article", "delete", "取消点赞(T => 资讯tg_99990001取消了点赞您的信息)",
		"action=getZan&id=5&module=article&service=member&temp=detail&title=T&uid=3", qUpDelete)
	got := zanGet(t, svc, fakeIdentity(7), "id=5&module=article&temp=detail&uid=3&title=T")
	eq(t, got, okBody)
	met(t, m)

	// 已登录 check=1 → 已赞 "has"（不写任何库）。
	svc, m = newZanService(t, fakeIdentity(7), nil)
	m.ExpectQuery(qModuleTitle).WithArgs("article").WillReturnRows(moduleRows("资讯", nil))
	m.ExpectQuery(qUpCheck).WithArgs(0, "detail", "article", "5", int64(7)).
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(9))
	got = zanGet(t, svc, fakeIdentity(7), "id=5&module=article&temp=detail&check=1")
	eq(t, got, `{"state":100,"info":"has"}`)
	met(t, m)
}

// 取消路径计数写失败 → 101 操作失败，且不 DELETE public_up_all（计数与底账可能不一致，照 PHP）。
func TestGetZanCancelCounterFailure(t *testing.T) {
	svc, m := newZanService(t, fakeIdentity(7), nil)
	m.ExpectQuery(qUpCheck).WithArgs(0, "video-detail", "travel", "5", int64(7)).
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(9))
	m.ExpectQuery(qUsername).WithArgs(int64(7)).WillReturnRows(sqlmock.NewRows([]string{"username"}).AddRow("op"))
	m.ExpectExec(qTravelZanDown).WithArgs("5").WillReturnError(errFake)
	got := zanGet(t, svc, fakeIdentity(7), "id=5&module=travel&temp=video-detail")
	eq(t, got, `{"state":101,"info":"操作失败，请重试！"}`)
	met(t, m)
}

// article+detail 分表：site_sub_tablelist 有 begin_id=100 的分表时，
// id=5（小于 begin_id，前值 0）落主表，id=150 落分表，id=100 松散命中分表。
func TestGetZanArticleSubTable(t *testing.T) {
	subRows := func() *sqlmock.Rows {
		return sqlmock.NewRows([]string{"table_name", "begin_id"}).AddRow("huoniao_articlelist_1", "100")
	}
	// id=5：排序后前值是补进来的 0 → 主表。
	svc, m := newZanService(t, fakeIdentity(7), nil)
	m.ExpectQuery(qUpCheck).WithArgs(0, "detail", "article", "5", int64(7)).WillReturnRows(sqlmock.NewRows([]string{"id"}))
	m.ExpectQuery(qUsername).WithArgs(int64(7)).WillReturnRows(sqlmock.NewRows([]string{"username"}).AddRow("op"))
	m.ExpectQuery(qSubTables).WillReturnRows(subRows())
	m.ExpectExec(qArticleZan).WithArgs("5").WillReturnResult(sqlmock.NewResult(0, 1))
	m.ExpectExec(qUpInsert).WithArgs("", "5", int64(7), "article", "detail", followNow, 0).
		WillReturnResult(sqlmock.NewResult(9, 1))
	insertSQL := "INSERT INTO `huoniao_public_up_all` (`uid`, `tid`, `ruid`, `module`, `action`, `puctime`, `type`) VALUES ('', '5', '7', 'article', 'detail', '1700000000', '0')"
	expectLogZan(m, "7", 5, "article", "insert", "点赞( => op点赞了您的信息)",
		"action=getZan&id=5&module=article&service=member&temp=detail", insertSQL)
	eq(t, zanGet(t, svc, fakeIdentity(7), "id=5&module=article&temp=detail"), okBody)
	met(t, m)

	// id=150：前值 100 → 分表 huoniao_articlelist_1。
	svc, m = newZanService(t, fakeIdentity(7), nil)
	m.ExpectQuery(qUpCheck).WithArgs(0, "detail", "article", "150", int64(7)).WillReturnRows(sqlmock.NewRows([]string{"id"}))
	m.ExpectQuery(qUsername).WithArgs(int64(7)).WillReturnRows(sqlmock.NewRows([]string{"username"}).AddRow("op"))
	m.ExpectQuery(qSubTables).WillReturnRows(subRows())
	m.ExpectExec("UPDATE `huoniao_articlelist_1` SET `zan` = zan + 1 WHERE `id` = ?").WithArgs("150").
		WillReturnResult(sqlmock.NewResult(0, 1))
	m.ExpectExec(qUpInsert).WithArgs("", "150", int64(7), "article", "detail", followNow, 0).
		WillReturnResult(sqlmock.NewResult(9, 1))
	insertSQL150 := "INSERT INTO `huoniao_public_up_all` (`uid`, `tid`, `ruid`, `module`, `action`, `puctime`, `type`) VALUES ('', '150', '7', 'article', 'detail', '1700000000', '0')"
	expectLogZan(m, "7", 150, "article", "insert", "点赞( => op点赞了您的信息)",
		"action=getZan&id=150&module=article&service=member&temp=detail", insertSQL150)
	eq(t, zanGet(t, svc, fakeIdentity(7), "id=150&module=article&temp=detail"), okBody)
	met(t, m)

	// id=100：array_search 松散命中 begin_id → 直接用分表。
	svc, m = newZanService(t, fakeIdentity(7), nil)
	m.ExpectQuery(qUpCheck).WithArgs(0, "detail", "article", "100", int64(7)).WillReturnRows(sqlmock.NewRows([]string{"id"}))
	m.ExpectQuery(qUsername).WithArgs(int64(7)).WillReturnRows(sqlmock.NewRows([]string{"username"}).AddRow("op"))
	m.ExpectQuery(qSubTables).WillReturnRows(subRows())
	m.ExpectExec("UPDATE `huoniao_articlelist_1` SET `zan` = zan + 1 WHERE `id` = ?").WithArgs("100").
		WillReturnResult(sqlmock.NewResult(0, 1))
	m.ExpectExec(qUpInsert).WithArgs("", "100", int64(7), "article", "detail", followNow, 0).
		WillReturnResult(sqlmock.NewResult(9, 1))
	insertSQL100 := "INSERT INTO `huoniao_public_up_all` (`uid`, `tid`, `ruid`, `module`, `action`, `puctime`, `type`) VALUES ('', '100', '7', 'article', 'detail', '1700000000', '0')"
	expectLogZan(m, "7", 100, "article", "insert", "点赞( => op点赞了您的信息)",
		"action=getZan&id=100&module=article&service=member&temp=detail", insertSQL100)
	eq(t, zanGet(t, svc, fakeIdentity(7), "id=100&module=article&temp=detail"), okBody)
	met(t, m)
}

// 已登录会员不符合 detail 条件（state/mtype）时 username 为空 → 文案缺用户名。
// 这里用查不到行的分支模拟（ErrNoRows → 空串）。
func TestGetZanUsernameMissing(t *testing.T) {
	svc, m := newZanService(t, fakeIdentity(7), nil)
	m.ExpectQuery(qUpCheck).WithArgs(0, "detail", "article", "5", int64(7)).WillReturnRows(sqlmock.NewRows([]string{"id"}))
	m.ExpectQuery(qUsername).WithArgs(int64(7)).WillReturnError(errNoRows)
	m.ExpectQuery(qSubTables).WillReturnRows(sqlmock.NewRows([]string{"table_name", "begin_id"}))
	m.ExpectExec(qArticleZan).WithArgs("5").WillReturnResult(sqlmock.NewResult(0, 1))
	m.ExpectExec(qUpInsert).WithArgs("", "5", int64(7), "article", "detail", followNow, 0).
		WillReturnResult(sqlmock.NewResult(9, 1))
	insertSQL := "INSERT INTO `huoniao_public_up_all` (`uid`, `tid`, `ruid`, `module`, `action`, `puctime`, `type`) VALUES ('', '5', '7', 'article', 'detail', '1700000000', '0')"
	expectLogZan(m, "7", 5, "article", "insert", "点赞( => 点赞了您的信息)",
		"action=getZan&id=5&module=article&service=member&temp=detail", insertSQL)
	eq(t, zanGet(t, svc, fakeIdentity(7), "id=5&module=article&temp=detail"), okBody)
	met(t, m)
}

// errFake / errNoRows 与 comment_test.go 里的语义一致：Exec/Query 返回的假错误。
var (
	errFake   = errTest{}
	errNoRows = errTest{noRows: true}
)

type errTest struct{ noRows bool }

func (e errTest) Error() string {
	if e.noRows {
		return "sql: no rows in result set"
	}
	return "mock exec error"
}
