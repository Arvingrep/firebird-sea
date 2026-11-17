package member

import (
	"context"
	"database/sql/driver"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	sqlmock "github.com/DATA-DOG/go-sqlmock"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// 迁移自 member.class.php:17010-17818 的 sendComment（#262）。
// SQL 用 QueryMatcherEqual 全串匹配；memberLog 的 note 用 argEq 断言，sql 字段只断言非空。

const (
	qSendArticleMaster = "SELECT `admin` FROM `huoniao_articlelist_all` WHERE `id` = ?"
	qSendTiebaMaster   = "SELECT `uid` FROM `huoniao_tieba_list` WHERE `id` = ?"
	qSendTuanStore     = "SELECT `uid` FROM `huoniao_tuan_store` WHERE `id` = ?"
	qSendTuanOrder     = "SELECT `userid`, `orderstate`, `proid`, `id` FROM `huoniao_tuan_order` WHERE `id` = ?"
	qSendTuanList      = "SELECT `sid` FROM `huoniao_tuanlist` WHERE `id` = ?"
	qSendParent        = "SELECT `id` FROM `huoniao_public_comment_all` WHERE `type` = ? AND `aid` = ? AND `pid` = 0"
	qSendExisting      = "SELECT `id` FROM `huoniao_public_comment_all` WHERE `type` = ? and `oid` = ?"
	qSendGoodsExisting = "SELECT `id` FROM `huoniao_public_comment_all` WHERE `aid` = ? AND `oid` = ? AND `userid` = ? AND `type` = ?"
	qSendShopGoods     = "SELECT o.`id` FROM `huoniao_shop_order` o LEFT JOIN `huoniao_shop_order_product` p ON p.`orderid` = o.`id` WHERE o.`id` = ? AND o.`userid` = ? AND p.`proid` = ?"
	qTiebaBump         = "UPDATE `huoniao_tieba_list` SET `comment` = `comment` +1 WHERE `id` = ?"
	qTuanOrderDone     = "UPDATE `huoniao_tuan_order` SET `common` = 1 WHERE `id` = ?"
	qPaotuiDone        = "UPDATE `huoniao_paotui_order` SET `iscomment` = 1 WHERE `id` = ?"

	qSendInsert = "INSERT INTO `huoniao_public_comment` (`masterid`, `pid`, `type`, `aid`, `oid`, `userid`, `rating`, `sco1`, `content`, `pics`, `audio`, `video`, `dtime`, `ip`, `ipaddr`, `ischeck`, `zan`, `zan_user`, `sco2`, `sco3`, `speid`, `specation`, `peisongid`, `star`, `starps`, `contentps`, `isanony`, `time`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
	qSendUpdate = "UPDATE `huoniao_public_comment` SET `masterid` = ?, `ischeck` = ?, `ipaddr` = ?, `ip` = ?, `dtime` = ?, `content` = ?, `pics` = ?, `sco3` = ?, `sco2` = ?, `sco1` = ?, `rating` = ?, `peisongid` = ?, `star` = ?, `starps` = ?, `contentps` = ?, `isanony` = ? WHERE `oid` = ?"

	qShopOrder = "SELECT o.`userid`, o.`orderstate`, o.`common`, o.`store` FROM `huoniao_shop_order` o LEFT JOIN `huoniao_shop_store` s ON s.`id` = o.`store` LEFT JOIN `huoniao_shop_branch_store` b ON b.`id` = o.`branchid` WHERE (o.`userid` = ? OR s.`userid` = ? OR b.`userid` = ? OR (o.`peisongid` = ? AND ? != 0)) AND o.`id` = ? LIMIT 1"
	qShopProds = "SELECT p.`proid`, p.`orderid`, p.`speid`, p.`specation` FROM `huoniao_shop_order_product` p LEFT JOIN `huoniao_shop_product` l ON l.`id` = p.`proid` WHERE l.`id` IS NOT NULL AND p.`orderid` = ?"
	qShopDone  = "UPDATE `huoniao_shop_order` SET `common` = 1 WHERE `id` = ?"
	qShopIns   = "INSERT INTO `huoniao_public_comment` (`pid`, `type`, `aid`, `oid`, `userid`, `rating`, `sco1`, `content`, `pics`, `audio`, `video`, `dtime`, `ip`, `ipaddr`, `ischeck`, `zan`, `zan_user`, `sco2`, `sco3`, `speid`, `specation`, `masterid`, `isanony`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
	qShopUpd   = "UPDATE `huoniao_public_comment` SET `masterid` = ?, `ischeck` = ?, `ipaddr` = ?, `ip` = ?, `dtime` = ?, `content` = ?, `pics` = ?, `sco3` = ?, `sco2` = ?, `sco1` = ?, `rating` = ?, `isanony` = ? WHERE `oid` = ?"

	qHmsPersonal = "SELECT `id`, `company`, `state` FROM `huoniao_homemaking_personal` WHERE `userid` = ?"
	qHmsOrder    = "SELECT o.`userid`, o.`orderstate` FROM `huoniao_homemaking_order` o LEFT JOIN `huoniao_homemaking_list` l ON o.`proid` = l.`id` LEFT JOIN `huoniao_homemaking_store` s ON l.`company` = s.`id` WHERE (o.`dispatchid` = ? OR o.`userid` = ? OR s.`userid` = ?) AND o.`id` = ? LIMIT 1"
	qHmsIns      = "INSERT INTO `huoniao_public_comment` (`pid`, `type`, `aid`, `oid`, `userid`, `rating`, `sco1`, `content`, `pics`, `audio`, `video`, `dtime`, `ip`, `ipaddr`, `ischeck`, `zan`, `zan_user`, `sco2`, `sco3`, `speid`, `specation`, `masterid`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
	qHmsDone     = "UPDATE `huoniao_homemaking_order` SET `orderstate` = 12, `common` = 1 WHERE `id` = ?"

	qWaimaiSubs  = "SELECT `table_name`, `begin_id` FROM `huoniao_site_sub_tablelist` WHERE `service` = ? ORDER BY `id` DESC"
	qWaimaiOrder = "SELECT `id`, `sid`, `iscomment`, `uid`, `peisongid`, `paydate`, `okdate` FROM `huoniao_waimai_order` WHERE `id` = ?"
	qWaimaiStore = "SELECT `userid` FROM `huoniao_waimai_store` WHERE `id` = ?"
	qWaimaiDone  = "UPDATE `huoniao_waimai_order` SET `iscomment` = 1 WHERE `id` = ?"
	qPaotuiOrder = "SELECT `id`, `iscomment`, `peisongid`, `paydate`, `okdate` FROM `huoniao_paotui_order` WHERE `id` = ?"

	qPointSum    = "SELECT SUM(`amount`) total FROM `huoniao_member_point` WHERE `userid` = ? AND `type` = 1 AND `interaction` = '1' AND `date` >= ? AND `date` < ?"
	qPointUpdate = "UPDATE `huoniao_member` SET `point` = `point` + ? WHERE `id` = ?"
	qPointSelect = "SELECT `point` FROM `huoniao_member` WHERE `id` = ?"
	qPointInsert = "INSERT INTO `huoniao_member_point` (`userid`, `type`, `amount`, `info`, `date`, `ctype`, `interaction`, `balance`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
)

// sendRow 是主路径 INSERT 的参数集合（顺序同 qSendInsert）。
type sendRow struct {
	masterid           string
	pid, aid, oid      int
	typ                string
	userid             int64
	rating, sco1       int
	content            string
	pics, audio, video string
	ischeck            int
	sco2, sco3         int
	peisongid          int
	star, starps       int
	isanony            int
	timeVal            int
}

func (r sendRow) args() []driver.Value {
	return []driver.Value{r.masterid, r.pid, r.typ, r.aid, r.oid, r.userid, r.rating, r.sco1, r.content,
		r.pics, r.audio, r.video, followNow, testLogIP, "", r.ischeck, 0, "", r.sco2, r.sco3, "", "",
		r.peisongid, r.star, r.starps, "", r.isanony, r.timeVal}
}

// scGet 请求 sendComment，query 不含 service/action。
func scGet(t *testing.T, svc *Service, query string) string {
	t.Helper()
	return do(t, svc, "GET", "/include/ajax.php?service=member&action=sendComment&"+query, "")
}

// scGetUA 带自定义 UA（安卓 App / 贴吧移动端判定用）。
func scGetUA(t *testing.T, svc *Service, query, ua string) string {
	t.Helper()
	router := ajax.NewRouter(func(string) {})
	Register(router, svc)
	req := httptest.NewRequest("GET", "/include/ajax.php?service=member&action=sendComment&"+query, strings.NewReader(""))
	req.Header.Set("User-Agent", ua)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)
	return rec.Body.String()
}

// expectSendLog 期待 memberLog 的去重查询 + 写入；aid 是行为日志的 aid（shop/homemaking 为 lastid）。
func expectSendLog(m sqlmock.Sqlmock, uid string, aid int64, action, note, param string) {
	expectSendLogUA(m, uid, aid, action, note, param, "")
}

func expectSendLogUA(m sqlmock.Sqlmock, uid string, aid int64, action, note, param, ua string) {
	m.ExpectQuery(qLogCount).
		WithArgs(md5Hex(note), uid, testLogIP, followNow).
		WillReturnRows(count(0))
	m.ExpectExec(qLogInsert).
		WithArgs(uid, "member", "comment", aid, action, argEq(note), "", testLogIP, "", ua,
			sqlmock.AnyArg(), followNow, md5Hex(note), testLogURL, argEq(param), "").
		WillReturnResult(sqlmock.NewResult(1, 1))
}

func rowsOf(cols ...string) *sqlmock.Rows { return sqlmock.NewRows(cols) }

// —— 门禁 1-4 ——

func TestSendDisableComment(t *testing.T) {
	state, info := 1, "评论维护中"
	svc, m := newFollowServiceWith(t, fakeIdentity(-1), func(d *Dep) {
		d.DisableCommentState = &state
		d.DisableCommentInfo = &info
	})
	eq(t, scGet(t, svc, "type=article-detail&aid=1&content=hi"), `{"state":101,"info":"评论维护中"}`)
	met(t, m)

	svc, m = newFollowServiceWith(t, fakeIdentity(-1), func(d *Dep) {
		d.DisableCommentState = &state
	})
	eq(t, scGet(t, svc, ""), `{"state":101,"info":"功能维护中，暂停使用！"}`)
	met(t, m)
}

func TestSendLoginGateBeforeParams(t *testing.T) {
	for _, q := range []string{"", "type=article-detail&aid=1&content=hi", "check=1"} {
		svc, m := newFollowService(t, fakeIdentity(-1))
		eq(t, scGet(t, svc, q), `{"state":101,"info":"登录超时，请重新登录！"}`)
		met(t, m)
	}
}

func TestSendVerifiedGate(t *testing.T) {
	verified := 1
	info := "请先实名认证"
	svc, m := newFollowServiceWith(t, fakeIdentity(7), func(d *Dep) {
		d.MemberVerified = &verified
		d.MemberVerifiedInfo = &info
	})
	m.ExpectQuery(qGateMember).WithArgs(int64(7)).
		WillReturnRows(gateRow("1", "0", "0", "13800000000", "1", "0"))
	eq(t, scGet(t, svc, "type=article-detail&aid=1&content=hi"), `{"state":201,"info":"请先实名认证"}`)
	met(t, m)
}

func TestSendBindPhoneGate(t *testing.T) {
	phone := 1
	info := "请先绑定手机号"
	svc, m := newFollowServiceWith(t, fakeIdentity(7), func(d *Dep) {
		d.MemberBindPhone = &phone
		d.MemberBindPhoneInfo = &info
	})
	m.ExpectQuery(qGateMember).WithArgs(int64(7)).
		WillReturnRows(gateRow("1", "1", "0", "", "0", "0"))
	eq(t, scGet(t, svc, "type=article-detail&aid=1&content=hi"), `{"state":202,"info":"请先绑定手机号"}`)
	met(t, m)

	// 周期校验过期优先给「请先验证手机号码」（periodic 开关 + 绑定时间过旧）。
	periodic, cycle := 1, 30
	svc, m = newFollowServiceWith(t, fakeIdentity(7), func(d *Dep) {
		d.MemberBindPhone = &phone
		d.MemberBindPhoneInfo = &info
		d.PeriodicCheckPhone = &periodic
		d.PeriodicCheckPhoneCycle = &cycle
	})
	m.ExpectQuery(qGateMember).WithArgs(int64(7)).
		WillReturnRows(gateRow("1", "1", "0", "13800000000", "1", "1000"))
	eq(t, scGet(t, svc, "type=article-detail&aid=1&content=hi"), `{"state":202,"info":"请先验证手机号码"}`)
	met(t, m)
}

// —— 门禁 5-9 ——

func TestSendParamGates(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	eq(t, scGet(t, svc, "content=hi"), `{"state":101,"info":"参数错误"}`)
	eq(t, scGet(t, svc, "type=article-detail&content=hi"), `{"state":101,"info":"参数错误"}`)
	eq(t, scGet(t, svc, "type=article-detail&aid=1"), `{"state":101,"info":"评价内容为空"}`)
	eq(t, scGet(t, svc, "type=article-detail&aid=1&content=0"), `{"state":101,"info":"评价内容为空"}`)
	eq(t, scGet(t, svc, "type=huodong-detail&aid=1&content=hi"), `{"state":101,"info":"请选择评分"}`)
	eq(t, scGet(t, svc, "type=tieba-detail&aid=1&content=hi"), `{"state":101,"info":"验证码输入错误"}`)
	eq(t, scGet(t, svc, "type=waimai-order&aid=1&content=hi"), `{"state":101,"info":"请给店铺打分！"}`)
	eq(t, scGet(t, svc, "type=waimai-order&aid=1&content=hi&star=5"), `{"state":101,"info":"请给配送员打分！"}`)
	met(t, m)
}

// sco1 白名单里的 huodong-detai 是 PHP 的拼写错误：它不需要评分（module 仍是 huodong）。
func TestSendHuodongDetaiTypoInWhitelist(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectExec(qSendInsert).
		WithArgs(sendRow{masterid: "0", typ: "huodong-detai", aid: 9, userid: 7, content: "hi", ischeck: 1}.args()...).
		WillReturnResult(sqlmock.NewResult(336, 1))
	expectSendLog(m, "7", 0, "insert", "发表评价(huodong-detai=>9=>hi)",
		"action=sendComment&aid=9&content=hi&service=member&type=huodong-detai")
	eq(t, scGet(t, svc, "type=huodong-detai&aid=9&content=hi"), `{"state":100,"info":"评价成功！"}`)
	met(t, m)
}

// —— article-detail 主路径 ——

func TestSendArticleDetailInsert(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qSendArticleMaster).WithArgs(int64(99)).WillReturnRows(rowsOf("admin").AddRow("0"))
	m.ExpectExec(qSendInsert).
		WithArgs(sendRow{masterid: "0", typ: "article-detail", aid: 99, userid: 7, content: "hi"}.args()...).
		WillReturnResult(sqlmock.NewResult(321, 1))
	expectSendLog(m, "7", 0, "insert", "发表评价(article-detail=>99=>hi)",
		"action=sendComment&aid=99&content=hi&service=member&type=article-detail")
	eq(t, scGet(t, svc, "type=article-detail&aid=99&content=hi"), `{"state":100,"info":"评价成功！"}`)
	met(t, m)
}

// 未识别 type 没有白名单，也会写一条评论（masterid 默认 0）。
func TestSendUnknownTypeStillInserts(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectExec(qSendInsert).
		WithArgs(sendRow{masterid: "0", typ: "whatever", aid: 5, userid: 7, content: "hi", sco1: 5}.args()...).
		WillReturnResult(sqlmock.NewResult(322, 1))
	expectSendLog(m, "7", 0, "insert", "发表评价(whatever=>5=>hi)",
		"action=sendComment&aid=5&content=hi&sco1=5&service=member&type=whatever")
	eq(t, scGet(t, svc, "type=whatever&aid=5&content=hi&sco1=5"), `{"state":100,"info":"评价成功！"}`)
	met(t, m)
}

// check=1：回查新评价，userinfo 走 member.detail 钩子（返回结构同 getComment）。
func TestSendCheckResponse(t *testing.T) {
	svc, m := newFollowServiceWith(t, fakeIdentity(7), func(d *Dep) {
		d.UserDetail = func(context.Context, *http.Request, string, bool) (any, error) {
			return map[string]any{"nickname": "张三"}, nil
		}
	})
	m.ExpectQuery(qSendArticleMaster).WithArgs(int64(99)).WillReturnRows(rowsOf("admin").AddRow("0"))
	m.ExpectExec(qSendInsert).
		WithArgs(sendRow{masterid: "0", typ: "article-detail", aid: 99, userid: 7, content: "hi"}.args()...).
		WillReturnResult(sqlmock.NewResult(323, 1))
	expectSendLog(m, "7", 0, "insert", "发表评价(article-detail=>99=>hi)",
		"action=sendComment&aid=99&check=1&content=hi&service=member&type=article-detail")
	m.ExpectQuery(qLookup).WithArgs(int64(323)).
		WillReturnRows(lookupRow("323", "7", "hi", "1700000000", testLogIP, "", "0", "", "0"))
	got := scGet(t, svc, "type=article-detail&aid=99&content=hi&check=1")
	eq(t, got, `{"state":100,"info":{"id":323,"userinfo":{"nickname":"张三"},"content":"hi","dtime":1700000000,"ftime":"刚刚","ip":"192.0.2.1:1234","ipaddr":"","iphome":"","zan":0,"ischeck":0,"message":"评论成功，将在审核后显示。","returnPoint":0,"pointName":"积分"}}`)
	met(t, m)
}

// 安卓 App UA + article-detail：message/isCheck/lastid。
func TestSendAndroidArticleDetail(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qSendArticleMaster).WithArgs(int64(99)).WillReturnRows(rowsOf("admin").AddRow("0"))
	m.ExpectExec(qSendInsert).
		WithArgs(sendRow{masterid: "0", typ: "article-detail", aid: 99, userid: 7, content: "hi"}.args()...).
		WillReturnResult(sqlmock.NewResult(324, 1))
	expectSendLogUA(m, "7", 0, "insert", "发表评价(article-detail=>99=>hi)",
		"action=sendComment&aid=99&content=hi&service=member&type=article-detail", "huoniao_android_1.0")
	got := scGetUA(t, svc, "type=article-detail&aid=99&content=hi", "huoniao_android_1.0")
	eq(t, got, `{"state":100,"info":{"message":"评论成功，将在审核后显示。","returnPoint":0,"pointName":"积分","isCheck":0,"lastid":324}}`)
	met(t, m)
}

// format=json 的资讯 H5 同样走 App 分支。
func TestSendFormatJSONArticleDetail(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qSendArticleMaster).WithArgs(int64(99)).WillReturnRows(rowsOf("admin").AddRow("0"))
	m.ExpectExec(qSendInsert).
		WithArgs(sendRow{masterid: "0", typ: "article-detail", aid: 99, userid: 7, content: "hi"}.args()...).
		WillReturnResult(sqlmock.NewResult(325, 1))
	expectSendLog(m, "7", 0, "insert", "发表评价(article-detail=>99=>hi)",
		"action=sendComment&aid=99&content=hi&format=json&service=member&type=article-detail")
	got := scGet(t, svc, "type=article-detail&aid=99&content=hi&format=json")
	eq(t, got, `{"state":100,"info":{"message":"评论成功，将在审核后显示。","returnPoint":0,"pointName":"积分","isCheck":0,"lastid":325}}`)
	met(t, m)
}

// —— 贴吧：移动端放行，ischeck==1 时 comment+1 ——

func TestSendTiebaMobileIscheckBump(t *testing.T) {
	svc, m := newFollowServiceWith(t, fakeIdentity(7), func(d *Dep) {
		d.ModuleCommentCheck = func(string) int { return 1 }
	})
	m.ExpectQuery(qSendTiebaMaster).WithArgs(int64(88)).WillReturnRows(rowsOf("uid").AddRow("9"))
	m.ExpectExec(qSendInsert).
		WithArgs(sendRow{masterid: "9", typ: "tieba-detail", aid: 88, userid: 7, content: "hi", ischeck: 1}.args()...).
		WillReturnResult(sqlmock.NewResult(326, 1))
	m.ExpectExec(qTiebaBump).WithArgs(int64(88)).WillReturnResult(sqlmock.NewResult(0, 1))
	expectSendLogUA(m, "7", 0, "insert", "发表评价(tieba-detail=>88=>hi)",
		"action=sendComment&aid=88&content=hi&service=member&type=tieba-detail", "iphone")
	got := scGetUA(t, svc, "type=tieba-detail&aid=88&content=hi", "iphone")
	eq(t, got, `{"state":100,"info":"评价成功！"}`)
	met(t, m)
}

// —— tuan-store / tuan-order ——

func TestSendTuanStoreGates(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	eq(t, scGet(t, svc, "type=tuan-store&aid=3&content=hi&sco1=5"), `{"state":101,"info":"请输入评价内容，最少15个字！"}`)
	m.ExpectQuery(qSendTuanStore).WithArgs(int64(3)).WillReturnRows(rowsOf("uid"))
	eq(t, scGet(t, svc, "type=tuan-store&aid=3&content=0123456789abcdef&sco1=5"), `{"state":101,"info":"商家不存在，评价失败！"}`)

	m.ExpectQuery(qSendTuanStore).WithArgs(int64(3)).WillReturnRows(rowsOf("uid").AddRow("7"))
	eq(t, scGet(t, svc, "type=tuan-store&aid=3&content=0123456789abcdef&sco1=5"), `{"state":101,"info":"自家店铺不能评论！"}`)
	met(t, m)
}

func TestSendTuanStoreInsert(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qSendTuanStore).WithArgs(int64(3)).WillReturnRows(rowsOf("uid").AddRow("9"))
	m.ExpectExec(qSendInsert).
		WithArgs(sendRow{masterid: "9", typ: "tuan-store", aid: 3, userid: 7, content: "0123456789abcdef", sco1: 5}.args()...).
		WillReturnResult(sqlmock.NewResult(327, 1))
	expectSendLog(m, "7", 0, "insert", "发表评价(tuan-store=>3=>0123456789abcdef)",
		"action=sendComment&aid=3&content=0123456789abcdef&sco1=5&service=member&type=tuan-store")
	eq(t, scGet(t, svc, "type=tuan-store&aid=3&content=0123456789abcdef&sco1=5"), `{"state":100,"info":"评价成功！"}`)
	met(t, m)
}

func TestSendTuanOrderGates(t *testing.T) {
	q := "type=tuan-order&aid=3&content=hi&sco1=5"

	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qSendTuanOrder).WithArgs(int64(3)).WillReturnRows(rowsOf("userid", "orderstate", "proid", "id"))
	eq(t, scGet(t, svc, q), `{"state":101,"info":"订单不存在，评价失败！"}`)

	m.ExpectQuery(qSendTuanOrder).WithArgs(int64(3)).
		WillReturnRows(rowsOf("userid", "orderstate", "proid", "id").AddRow("8", "3", "55", "66"))
	m.ExpectQuery(qSendTuanList).WithArgs(int64(55)).WillReturnRows(rowsOf("sid").AddRow("4"))
	m.ExpectQuery(qSendTuanStore).WithArgs("4").WillReturnRows(rowsOf("uid").AddRow("9"))
	eq(t, scGet(t, svc, q), `{"state":101,"info":"验证账户权限失败，请使用购买过此商品的账号登录后再评价！"}`)

	m.ExpectQuery(qSendTuanOrder).WithArgs(int64(3)).
		WillReturnRows(rowsOf("userid", "orderstate", "proid", "id").AddRow("7", "1", "55", "66"))
	m.ExpectQuery(qSendTuanList).WithArgs(int64(55)).WillReturnRows(rowsOf("sid").AddRow("4"))
	m.ExpectQuery(qSendTuanStore).WithArgs("4").WillReturnRows(rowsOf("uid").AddRow("9"))
	eq(t, scGet(t, svc, q), `{"state":101,"info":"订单当前状态不可评价，请使用后再评价！"}`)
	met(t, m)
}

func TestSendTuanOrderInsertAndMark(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qSendTuanOrder).WithArgs(int64(3)).
		WillReturnRows(rowsOf("userid", "orderstate", "proid", "id").AddRow("7", "3", "55", "66"))
	m.ExpectQuery(qSendTuanList).WithArgs(int64(55)).WillReturnRows(rowsOf("sid").AddRow("4"))
	m.ExpectQuery(qSendTuanStore).WithArgs("4").WillReturnRows(rowsOf("uid").AddRow("9"))
	m.ExpectQuery(qSendExisting).WithArgs("tuan-order", 66).WillReturnRows(rowsOf("id"))
	m.ExpectExec(qSendInsert).
		WithArgs(sendRow{masterid: "9", typ: "tuan-order", aid: 55, oid: 66, userid: 7, content: "hi", sco1: 5}.args()...).
		WillReturnResult(sqlmock.NewResult(328, 1))
	expectSendLog(m, "7", 0, "insert", "发表评价(tuan-order=>55=>hi)",
		"action=sendComment&aid=3&content=hi&sco1=5&service=member&type=tuan-order")
	m.ExpectExec(qTuanOrderDone).WithArgs(66).WillReturnResult(sqlmock.NewResult(0, 1))
	eq(t, scGet(t, svc, "type=tuan-order&aid=3&content=hi&sco1=5"), `{"state":100,"info":"评价成功！"}`)
	met(t, m)
}

// 同一订单已有评价：UPDATE 改评价（写 public_comment 真表），返回成功。
func TestSendTuanOrderUpdateExisting(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qSendTuanOrder).WithArgs(int64(3)).
		WillReturnRows(rowsOf("userid", "orderstate", "proid", "id").AddRow("7", "3", "55", "66"))
	m.ExpectQuery(qSendTuanList).WithArgs(int64(55)).WillReturnRows(rowsOf("sid").AddRow("4"))
	m.ExpectQuery(qSendTuanStore).WithArgs("4").WillReturnRows(rowsOf("uid").AddRow("9"))
	m.ExpectQuery(qSendExisting).WithArgs("tuan-order", 66).WillReturnRows(rowsOf("id").AddRow("70"))
	m.ExpectExec(qSendUpdate).
		WithArgs("9", 0, "", testLogIP, followNow, "hi", "", 0, 0, 5, 0, 0, 0, 0, "", 0, 66).
		WillReturnResult(sqlmock.NewResult(0, 1))
	expectSendLog(m, "7", 0, "update", "修改评价(tuan-order=>66)",
		"action=sendComment&aid=3&content=hi&sco1=5&service=member&type=tuan-order")
	m.ExpectExec(qTuanOrderDone).WithArgs(66).WillReturnResult(sqlmock.NewResult(0, 1))
	eq(t, scGet(t, svc, "type=tuan-order&aid=3&content=hi&sco1=5"), `{"state":100,"info":"评价成功！"}`)
	met(t, m)
}

// —— shop-order ——

func shopOrderRow(userid, orderstate, common any) *sqlmock.Rows {
	return rowsOf("userid", "orderstate", "common", "store").AddRow(userid, orderstate, common, "4")
}

func TestSendShopOrderOrderGates(t *testing.T) {
	q := "type=shop-order&aid=7&content%5B55_0%5D=hi&rating%5B55_0%5D=3&sco1%5B55_0%5D=5&sco2%5B55_0%5D=4&sco3%5B55_0%5D=3"

	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qShopOrder).WithArgs(int64(7), int64(7), int64(7), 0, 0, int64(7)).
		WillReturnRows(rowsOf("userid", "orderstate", "common", "store"))
	eq(t, scGet(t, svc, q), `{"state":101,"info":"订单不存在，评价失败！"}`)

	m.ExpectQuery(qShopOrder).WithArgs(int64(7), int64(7), int64(7), 0, 0, int64(7)).
		WillReturnRows(shopOrderRow("8", "3", "0"))
	eq(t, scGet(t, svc, q), `{"state":101,"info":"验证账户权限失败，请使用购买过此商品的账号登录后再评价！"}`)

	m.ExpectQuery(qShopOrder).WithArgs(int64(7), int64(7), int64(7), 0, 0, int64(7)).
		WillReturnRows(shopOrderRow("7", "1", "0"))
	eq(t, scGet(t, svc, q), `{"state":101,"info":"订单当前状态不可评价，请使用后再评价！"}`)
	met(t, m)
}

func TestSendShopOrderPerProductGates(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qShopOrder).WithArgs(int64(7), int64(7), int64(7), 0, 0, int64(7)).
		WillReturnRows(shopOrderRow("7", "3", "0"))
	m.ExpectQuery(qShopProds).WithArgs(int64(7)).
		WillReturnRows(rowsOf("proid", "orderid", "speid", "specation").AddRow("55", "7", "0", ""))
	got := scGet(t, svc, "type=shop-order&aid=7&content%5B55_0%5D=hi&sco1%5B55_0%5D=5&sco2%5B55_0%5D=4&sco3%5B55_0%5D=3")
	eq(t, got, `{"state":101,"info":"请选择商品评价！"}`)

	m.ExpectQuery(qShopOrder).WithArgs(int64(7), int64(7), int64(7), 0, 0, int64(7)).
		WillReturnRows(shopOrderRow("7", "3", "0"))
	m.ExpectQuery(qShopProds).WithArgs(int64(7)).
		WillReturnRows(rowsOf("proid", "orderid", "speid", "specation").AddRow("55", "7", "0", ""))
	got = scGet(t, svc, "type=shop-order&aid=7&rating%5B55_0%5D=3&sco1%5B55_0%5D=5&sco2%5B55_0%5D=4&sco3%5B55_0%5D=3&content%5B55_0%5D=0")
	eq(t, got, `{"state":101,"info":"请输入评价内容！"}`)
	met(t, m)
}

func TestSendShopOrderInsert(t *testing.T) {
	q := "type=shop-order&aid=7&content%5B55_0%5D=hi&rating%5B55_0%5D=3&sco1%5B55_0%5D=5&sco2%5B55_0%5D=4&sco3%5B55_0%5D=3&pics%5B55_0%5D=a.jpg"
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qShopOrder).WithArgs(int64(7), int64(7), int64(7), 0, 0, int64(7)).
		WillReturnRows(shopOrderRow("7", "3", "0"))
	m.ExpectQuery(qShopProds).WithArgs(int64(7)).
		WillReturnRows(rowsOf("proid", "orderid", "speid", "specation").AddRow("55", "7", "0", "红色"))
	m.ExpectExec(qShopIns).
		WithArgs(0, "shop-order", "55", "7", int64(7), "3", "5", "hi", "a.jpg", "", "",
			followNow, testLogIP, "", 0, 0, "", "4", "3", "0", "红色", 0, 0).
		WillReturnResult(sqlmock.NewResult(329, 1))
	expectSendLog(m, "7", 329, "insert", "发表评价(shop=>7)",
		"action=sendComment&aid=7&content[55_0]=hi&pics[55_0]=a.jpg&rating[55_0]=3&sco1[55_0]=5&sco2[55_0]=4&sco3[55_0]=3&service=member&type=shop-order")
	m.ExpectExec(qShopDone).WithArgs(int64(7)).WillReturnResult(sqlmock.NewResult(0, 1))
	eq(t, scGet(t, svc, q), `{"state":100,"info":"评价成功！"}`)
	met(t, m)
}

// 已评价过（common=1）：走 UPDATE，写 public_comment 真表。
func TestSendShopOrderUpdate(t *testing.T) {
	q := "type=shop-order&aid=7&content%5B55_0%5D=hi&rating%5B55_0%5D=3&sco1%5B55_0%5D=5&sco2%5B55_0%5D=4&sco3%5B55_0%5D=3"
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qShopOrder).WithArgs(int64(7), int64(7), int64(7), 0, 0, int64(7)).
		WillReturnRows(shopOrderRow("7", "3", "1"))
	m.ExpectQuery(qShopProds).WithArgs(int64(7)).
		WillReturnRows(rowsOf("proid", "orderid", "speid", "specation").AddRow("55", "7", "0", ""))
	m.ExpectExec(qShopUpd).
		WithArgs("", 0, "", testLogIP, followNow, "hi", "", "3", "4", "5", "3", 0, 7).
		WillReturnResult(sqlmock.NewResult(0, 1))
	expectSendLog(m, "7", 0, "update", "修改评价(shop=>7)",
		"action=sendComment&aid=7&content[55_0]=hi&rating[55_0]=3&sco1[55_0]=5&sco2[55_0]=4&sco3[55_0]=3&service=member&type=shop-order")
	m.ExpectExec(qShopDone).WithArgs(int64(7)).WillReturnResult(sqlmock.NewResult(0, 1))
	eq(t, scGet(t, svc, q), `{"state":100,"info":"评价成功！"}`)
	met(t, m)
}

// —— homemaking-order（订单号用 pid） ——

func TestSendHomemakingOrderGates(t *testing.T) {
	q := "type=homemaking-order&aid=3&pid=55&content=hi"

	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qHmsPersonal).WithArgs(int64(7)).WillReturnRows(rowsOf("id", "company", "state"))
	m.ExpectQuery(qHmsOrder).WithArgs("", int64(7), int64(7), int64(55)).
		WillReturnRows(rowsOf("userid", "orderstate"))
	eq(t, scGet(t, svc, q), `{"state":101,"info":"订单不存在，评价失败！"}`)

	m.ExpectQuery(qHmsPersonal).WithArgs(int64(7)).WillReturnRows(rowsOf("id", "company", "state"))
	m.ExpectQuery(qHmsOrder).WithArgs("", int64(7), int64(7), int64(55)).
		WillReturnRows(rowsOf("userid", "orderstate").AddRow("8", "11"))
	eq(t, scGet(t, svc, q), `{"state":101,"info":"验证账户权限失败，请使用购买过此商品的账号登录后再评价！"}`)

	m.ExpectQuery(qHmsPersonal).WithArgs(int64(7)).WillReturnRows(rowsOf("id", "company", "state"))
	m.ExpectQuery(qHmsOrder).WithArgs("", int64(7), int64(7), int64(55)).
		WillReturnRows(rowsOf("userid", "orderstate").AddRow("7", "5"))
	eq(t, scGet(t, svc, q), `{"state":101,"info":"订单当前状态不可评价，请使用后再评价！"}`)
	met(t, m)
}

func TestSendHomemakingOrderInsert(t *testing.T) {
	q := "type=homemaking-order&aid=3&pid=55&content=hi"
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qHmsPersonal).WithArgs(int64(7)).WillReturnRows(rowsOf("id", "company", "state").AddRow("11", "2", "1"))
	m.ExpectQuery(qHmsOrder).WithArgs("11", int64(7), int64(7), int64(55)).
		WillReturnRows(rowsOf("userid", "orderstate").AddRow("7", "11"))
	m.ExpectExec(qHmsIns).
		WithArgs(0, "homemaking-order", 3, 55, int64(7), 0, 0, "hi", "", "", "", followNow, testLogIP, "", 0, 0, "", 0, 0, "0", "0", 0).
		WillReturnResult(sqlmock.NewResult(330, 1))
	// INSERT 分支的 memberLog 传的是 'update'（照搬）。
	expectSendLog(m, "7", 330, "update", "发表评价(homemaking=>55)",
		"action=sendComment&aid=3&content=hi&pid=55&service=member&type=homemaking-order")
	// $aid 被 lastid 覆盖，UPDATE 用评论 id（照搬）。
	m.ExpectExec(qHmsDone).WithArgs(int64(330)).WillReturnResult(sqlmock.NewResult(0, 1))
	eq(t, scGet(t, svc, q), `{"state":100,"info":"评价成功！"}`)
	met(t, m)
}

// —— waimai-order（分表按 site_sub_tablelist）——

func TestSendWaimaiOrder(t *testing.T) {
	q := "type=waimai-order&aid=66&content=hi&star=5&starps=4"
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qWaimaiSubs).WithArgs("waimai_order").WillReturnRows(rowsOf("table_name", "begin_id"))
	m.ExpectQuery(qWaimaiOrder).WithArgs(int64(66)).
		WillReturnRows(rowsOf("id", "sid", "iscomment", "uid", "peisongid", "paydate", "okdate").
			AddRow("66", "12", "0", "7", "8", "1000", "1180"))
	m.ExpectQuery(qWaimaiStore).WithArgs("12").WillReturnRows(rowsOf("userid").AddRow("9"))
	m.ExpectQuery(qSendExisting).WithArgs("waimai-order", 66).WillReturnRows(rowsOf("id"))
	m.ExpectExec(qSendInsert).
		WithArgs(sendRow{masterid: "9", typ: "waimai-order", aid: 12, oid: 66, userid: 7, content: "hi",
			star: 5, starps: 4, peisongid: 8, timeVal: 3}.args()...).
		WillReturnResult(sqlmock.NewResult(331, 1))
	expectSendLog(m, "7", 0, "insert", "发表评价(waimai-order=>12=>hi)",
		"action=sendComment&aid=66&content=hi&service=member&star=5&starps=4&type=waimai-order")
	m.ExpectQuery(qWaimaiSubs).WithArgs("waimai_order").WillReturnRows(rowsOf("table_name", "begin_id"))
	m.ExpectExec(qWaimaiDone).WithArgs(66).WillReturnResult(sqlmock.NewResult(0, 1))
	eq(t, scGet(t, svc, q), `{"state":100,"info":"评价成功！"}`)
	met(t, m)
}

func TestSendWaimaiOrderMissing(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qWaimaiSubs).WithArgs("waimai_order").WillReturnRows(rowsOf("table_name", "begin_id"))
	m.ExpectQuery(qWaimaiOrder).WithArgs(int64(66)).
		WillReturnRows(rowsOf("id", "sid", "iscomment", "uid", "peisongid", "paydate", "okdate"))
	eq(t, scGet(t, svc, "type=waimai-order&aid=66&content=hi&star=5&starps=4"), `{"state":101,"info":"订单不存在！"}`)
	met(t, m)
}

// —— paotui-order（star 不校验，aid 置 0）——

func TestSendPaotuiOrder(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qPaotuiOrder).WithArgs(int64(77)).
		WillReturnRows(rowsOf("id", "iscomment", "peisongid", "paydate", "okdate").
			AddRow("77", "0", "9", "1000", "1120"))
	m.ExpectQuery(qSendExisting).WithArgs("paotui-order", 77).WillReturnRows(rowsOf("id"))
	m.ExpectExec(qSendInsert).
		WithArgs(sendRow{masterid: "0", typ: "paotui-order", aid: 0, oid: 77, userid: 7, content: "hi",
			peisongid: 9, timeVal: 2}.args()...).
		WillReturnResult(sqlmock.NewResult(332, 1))
	expectSendLog(m, "7", 0, "insert", "发表评价(paotui-order=>0=>hi)",
		"action=sendComment&aid=77&content=hi&service=member&type=paotui-order")
	m.ExpectExec(qPaotuiDone).WithArgs(77).WillReturnResult(sqlmock.NewResult(0, 1))
	eq(t, scGet(t, svc, "type=paotui-order&aid=77&content=hi"), `{"state":100,"info":"评价成功！"}`)
	met(t, m)
}

// —— _goods / _store ——

func TestSendGoodsBranches(t *testing.T) {
	// tuan/waimai 商品评价：SQL 未执行 → 恒「订单信息错误」。
	svc, m := newFollowService(t, fakeIdentity(7))
	eq(t, scGet(t, svc, "type=tuan_goods&aid=55&oid=7&content=hi&sco1=5"), `{"state":101,"info":"订单信息错误"}`)
	eq(t, scGet(t, svc, "type=waimai_goods&aid=55&oid=7&content=hi&sco1=5"), `{"state":101,"info":"订单信息错误"}`)
	// oid 为空 → 参数错误。
	eq(t, scGet(t, svc, "type=shop_goods&aid=55&content=hi&sco1=5"), `{"state":101,"info":"参数错误"}`)
	met(t, m)

	// shop 订单/商品不匹配 → 订单信息错误。
	svc, m = newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qSendShopGoods).WithArgs(int64(7), int64(7), int64(55)).WillReturnRows(rowsOf("id"))
	eq(t, scGet(t, svc, "type=shop_goods&aid=55&oid=7&content=hi&sco1=5"), `{"state":101,"info":"订单信息错误"}`)

	// 已评价过。
	m.ExpectQuery(qSendShopGoods).WithArgs(int64(7), int64(7), int64(55)).WillReturnRows(rowsOf("id").AddRow("7"))
	m.ExpectQuery(qSendGoodsExisting).WithArgs(55, 7, int64(7), "shop_goods").WillReturnRows(rowsOf("id").AddRow("70"))
	eq(t, scGet(t, svc, "type=shop_goods&aid=55&oid=7&content=hi&sco1=5"), `{"state":101,"info":"您已经评价过该商品"}`)
	met(t, m)
}

func TestSendShopGoodsInsert(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qSendShopGoods).WithArgs(int64(7), int64(7), int64(55)).WillReturnRows(rowsOf("id").AddRow("7"))
	m.ExpectQuery(qSendGoodsExisting).WithArgs(55, 7, int64(7), "shop_goods").WillReturnRows(rowsOf("id"))
	m.ExpectExec(qSendInsert).
		WithArgs(sendRow{masterid: "0", typ: "shop_goods", aid: 55, oid: 7, userid: 7, content: "hi", sco1: 5}.args()...).
		WillReturnResult(sqlmock.NewResult(333, 1))
	expectSendLog(m, "7", 0, "insert", "发表评价(shop_goods=>55=>hi)",
		"action=sendComment&aid=55&content=hi&oid=7&sco1=5&service=member&type=shop_goods")
	eq(t, scGet(t, svc, "type=shop_goods&aid=55&oid=7&content=hi&sco1=5"), `{"state":100,"info":"评价成功！"}`)
	met(t, m)
}

// —— 父评论降级 ——

func TestSendParentCommentDowngrade(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qSendArticleMaster).WithArgs(int64(99)).WillReturnRows(rowsOf("admin").AddRow("0"))
	m.ExpectQuery(qSendParent).WithArgs("article-detail", 99).WillReturnRows(rowsOf("id").AddRow("70"))
	m.ExpectExec(qSendInsert).
		WithArgs(sendRow{masterid: "0", pid: 70, typ: "article-detail", aid: 99, userid: 7, content: "hi"}.args()...).
		WillReturnResult(sqlmock.NewResult(334, 1))
	expectSendLog(m, "7", 0, "insert", "发表评价(article-detail=>99=>hi)",
		"action=sendComment&aid=99&content=hi&pid=70&service=member&type=article-detail")
	eq(t, scGet(t, svc, "type=article-detail&aid=99&pid=70&content=hi"), `{"state":100,"info":"评价成功！"}`)
	met(t, m)

	// 父评论不存在 → pid 静默降级 0。
	svc, m = newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qSendArticleMaster).WithArgs(int64(99)).WillReturnRows(rowsOf("admin").AddRow("0"))
	m.ExpectQuery(qSendParent).WithArgs("article-detail", 99).WillReturnRows(rowsOf("id"))
	m.ExpectExec(qSendInsert).
		WithArgs(sendRow{masterid: "0", typ: "article-detail", aid: 99, userid: 7, content: "hi"}.args()...).
		WillReturnResult(sqlmock.NewResult(335, 1))
	expectSendLog(m, "7", 0, "insert", "发表评价(article-detail=>99=>hi)",
		"action=sendComment&aid=99&content=hi&pid=70&service=member&type=article-detail")
	eq(t, scGet(t, svc, "type=article-detail&aid=99&pid=70&content=hi"), `{"state":100,"info":"评价成功！"}`)
	met(t, m)
}

// 积分按配置执行：ischeck==1 且配了返积分数量/上限时才发（默认 0 不发放）。
func TestSendAwardPointByConfig(t *testing.T) {
	reward, day := 5, 10
	svc, m := newFollowServiceWith(t, fakeIdentity(7), func(d *Dep) {
		d.ModuleCommentCheck = func(string) int { return 1 }
		d.ReturnInteractionComment = &reward
		d.ReturnInteractionCommentDay = &day
	})
	m.ExpectQuery(qSendArticleMaster).WithArgs(int64(99)).WillReturnRows(rowsOf("admin").AddRow("0"))
	m.ExpectExec(qSendInsert).
		WithArgs(sendRow{masterid: "0", typ: "article-detail", aid: 99, userid: 7, content: "hi", ischeck: 1}.args()...).
		WillReturnResult(sqlmock.NewResult(337, 1))
	expectSendLog(m, "7", 0, "insert", "发表评价(article-detail=>99=>hi)",
		"action=sendComment&aid=99&content=hi&service=member&type=article-detail")
	m.ExpectQuery(qPointSum).WithArgs(int64(7), int64(1699977600), int64(1700064000)).
		WillReturnRows(rowsOf("total").AddRow("0"))
	m.ExpectExec(qPointUpdate).WithArgs(5, int64(7)).WillReturnResult(sqlmock.NewResult(0, 1))
	m.ExpectQuery(qPointSelect).WithArgs(int64(7)).WillReturnRows(rowsOf("point").AddRow("105"))
	m.ExpectExec(qPointInsert).WithArgs(int64(7), 1, 5, "发表评论", followNow, "zengsong", "1", "105").
		WillReturnResult(sqlmock.NewResult(1, 1))
	eq(t, scGet(t, svc, "type=article-detail&aid=99&content=hi"), `{"state":100,"info":"评价成功！"}`)
	met(t, m)
}

// —— 写库失败 ——

func TestSendInsertFailed(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qSendArticleMaster).WithArgs(int64(99)).WillReturnRows(rowsOf("admin").AddRow("0"))
	m.ExpectExec(qSendInsert).WillReturnError(errors.New("boom"))
	eq(t, scGet(t, svc, "type=article-detail&aid=99&content=hi"), `{"state":101,"info":"评价失败"}`)
	met(t, m)
}
