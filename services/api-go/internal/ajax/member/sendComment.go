package member

import (
	"context"
	"database/sql"
	"math"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// sendComment 的文案（zh-CN/siteConfig.inc.php [19][334]、shop.inc.php [4][29..33]，
// 其余为 member.class.php 里硬编码的字符串）。
const (
	infoCommentEmpty   = "评价内容为空"   // 17113
	infoChooseRating   = "请选择评分"    // siteConfig[19][334]
	infoVdimgckError   = "验证码输入错误"  // 17128
	infoWaimaiStarShop = "请给店铺打分！"  // 17136
	infoWaimaiStarPS   = "请给配送员打分！" // 17137
	infoTuanStoreGone  = "商家不存在，评价失败！"
	infoTuanSelfStore  = "自家店铺不能评论！"
	infoTuanShort      = "请输入评价内容，最少15个字！"
	infoOrderGone      = "订单不存在，评价失败！"
	infoOrderGoneShort = "订单不存在！"
	infoOrderNoPerm    = "验证账户权限失败，请使用购买过此商品的账号登录后再评价！"
	infoOrderBadState  = "订单当前状态不可评价，请使用后再评价！"
	infoOrderInfoWrong = "订单信息错误"
	infoAlreadyComment = "您已经评价过该商品"
	infoShopChooseRate = "请选择商品评价！" // shop[4][29]
	infoShopSco1       = "请给商品描述打分" // shop[4][30]
	infoShopSco2       = "请给商家服务打分" // shop[4][31]
	infoShopSco3       = "请给商品质量打分" // shop[4][32]
	infoShopContent    = "请输入评价内容！" // shop[4][33]
	infoPointName      = "积分"       // pointsConfig.inc.php 的 $cfg_pointName 现值
)

// stripTagsRe 复刻 strip_tags 的「去掉 HTML 标签」部分（circle-dynamic 的 content）。
var stripTagsRe = regexp.MustCompile(`<[^>]*>?`)

// sendCommentArgs 是 sendComment 解析后的请求参数（对应 PHP 17062-17095 的局部变量）。
type sendCommentArgs struct {
	typ   string
	check bool
	shop  bool

	pid, aid, oid            int
	rating, sco1, sco2, sco3 int
	peisongid, star, starps  int
	isanony                  int
	content                  string
	pics, audio, video       string
	contentps, reply         string
	// shop-order 的逐商品字段：下标是 "pid_speid"。
	shopRating, shopSco1, shopSco2, shopSco3, shopContent, shopPics map[string]string

	module    string
	ischeck   int
	ip        string
	dtime     int64
	timeVal   int
	speid     string
	specation string
}

// parseSendComment 复刻 sendComment 开头的参数读取。content 的清洗链见下方分支注释
// （PHP 17070-17073：filterSensitiveWords(addslashes(...)) → trim + 去 &nbsp; →
// circle-dynamic 再 strip_tags；#364 起入口归一已带 RemoveXSS）。
func parseSendComment(p params, httpReq *http.Request, now int64) *sendCommentArgs {
	a := &sendCommentArgs{}
	a.typ, _ = p.phpRaw("type")
	a.shop = a.typ == "shop-order"
	a.check = p.phpTruthy("check")
	a.pid, a.aid, a.oid = p.intval("pid"), p.intval("aid"), p.intval("oid")
	a.rating, a.sco1, a.sco2, a.sco3 = p.intval("rating"), p.intval("sco1"), p.intval("sco2"), p.intval("sco3")
	if a.shop {
		a.shopRating = p.keyedArray("rating")
		a.shopSco1 = p.keyedArray("sco1")
		a.shopSco2 = p.keyedArray("sco2")
		a.shopSco3 = p.keyedArray("sco3")
		a.shopContent = p.keyedArray("content")
		a.shopPics = p.keyedArray("pics")
	} else {
		// content[] 走数组：PHP 里 addslashes(array) 返回 null → 内容是空 → 评价内容为空。
		// 已知偏差：这种畸形入参在 Go 侧按空内容处理，不模拟 PHP 的 warning。
		raw := ""
		if _, isArr := p.req.Params["content[]"]; !isArr {
			raw, _ = p.phpRaw("content")
		}
		// PHP 17070-17073：content = $type=='shop-order' ? $param['content']
		//   : filterSensitiveWords(addslashes($param['content']))，
		// 随后非 shop-order 做 trim + 去 &nbsp;，circle-dynamic 再 strip_tags。
		// $param['content'] 是入口归一的转义值；Params 保存的是 MySQL 解析后口径，
		// 先 addslashes 还原成转义值，再走 PHP 的 handler 链，存储前按 MySQL 字面量
		// 解析口径剥回（S(A(x))=x，往返无损）。
		if a.typ != "shop-order" && raw != "" {
			escaped := ajax.PHPAddslashes(raw)
			escaped = ajax.FilterSensitiveWords(ajax.PHPAddslashes(escaped), true)
			escaped = strings.Trim(strings.ReplaceAll(escaped, "&nbsp;", ""), phpTrimChars)
			if a.typ == "circle-dynamic" {
				escaped = stripTagsRe.ReplaceAllString(escaped, "")
			}
			raw = ajax.PHPStripslashes(escaped)
		} else {
			content := strings.Trim(strings.ReplaceAll(raw, "&nbsp;", ""), phpTrimChars)
			if a.typ == "circle-dynamic" {
				content = stripTagsRe.ReplaceAllString(content, "")
			}
			raw = content
		}
		a.content = raw
	}
	a.pics, _ = p.phpRaw("pics")
	a.audio, _ = p.phpRaw("audio")
	a.video, _ = p.phpRaw("video")
	a.contentps, _ = p.phpRaw("contentps")
	a.reply, _ = p.phpRaw("reply")
	a.peisongid, a.star, a.starps = p.intval("peisongid"), p.intval("star"), p.intval("starps")
	a.isanony = p.intval("isanony")
	// module 取 type 按 '-' 的前段；paotui/waimai 订单强制 waimai（17097-17105）。
	if a.typ == "paotui-order" || a.typ == "waimai-order" {
		a.module = "waimai"
	} else {
		a.module, _, _ = strings.Cut(a.typ, "-")
	}
	// public_comment.ip 用 GetIP()（不带端口）；只有 memberLog 的 ip 列才拼 :port。
	a.ip = plainIP(httpReq)
	// ipaddr（getIpAddr）需要 IP 库，Go 侧写空串
	a.dtime = now
	return a
}

// sco1Optional 复刻 17124 的 sco1 白名单。注意 huodong-detai 是 PHP 的拼写错误：
// 真实 type huodong-detail 不在白名单里，反而要求评分；照搬。
func sco1Optional(typ string) bool {
	switch typ {
	case "quanjing-detail", "homemaking-order", "info-detail", "info-business",
		"travel-ticket", "travel-video", "travel-strategy", "travel-hotel", "travel-visa", "travel-agency",
		"marry-store", "marry-rental", "article-detail", "waimai-order", "paotui-order",
		"video-detail", "tieba-detail", "circle-dynamic", "huodong-detai":
		return true
	}
	return strings.Contains(typ, "marry-")
}

// sendComment 迁移自 member.class.php:17010-17818（member.sendComment，#262）。
//
// 门禁顺序与 replyComment 同构（先命中先返回）：禁止评论 200（先于登录）→ 登录 200 →
// 实名 201 → 手机 202 → empty(type)||empty(aid) 200 参数错误 → empty(content) 200 →
// 评分白名单 200 → tieba PC 验证码 200 → waimai star/starps 200。外层包装：200 改写 101，
// 201/202 原样透传（handlers.class.php:66-73），这里直接产出最终 state。
//
// 主流程：masterid 由 type 分支查表（见下方 switch）→ 父评论不存在时 pid 静默降级 0 →
// type 形如 `x_goods`/`x_store` 的订单校验 → tuan/waimai/paotui 订单查已有评价（有则改评价）→
// INSERT public_comment → 记录 memberLog → ischeck==1 时发积分（按配置，默认 0 不发放）→
// tuan/waimai/paotui 订单置已评价 → 按 check / 安卓 App+format=json / 普通 三种出口返回。
//
// 与 PHP 的已知偏差（口径同 #255/#256/#258/#259）：
//   - updateMemberNotice / updateAdminNotice（会员评论通知、管理员审核通知）未迁移：纯副作用
//     （updatemessage/站内信/推送），失败也不影响返回；为取通知目标 tid 的父评论作者查询一并跳过；
//   - clearCache('tieba_detail'/'tieba_list') 是站点侧缓存清理，Go 侧无缓存层，跳过；
//   - INSERT 后 dsqlOper lastid 的 public_comment 分表 checkCreateTable 是建表维护动作，跳过；
//   - getIpAddr 需要 IP 库，ipaddr 写空串（check 输出里的 ipaddr/iphome 因此为空）；
//   - filterSensitiveWords 的华为云/阿里云内容审核经 ajax.SensitiveWordsModerator 注入
//     （本地 cfg_moderationWB=0 关闭）；$cfg_replacestr 经 ajax.ReplaceWords（本地 '傻子'），
//     17070 的清洗链已按 PHP 原文复刻（#364）
//   - 改评价路径（shop/homemaking/commentid>0）按默认口径写 public_comment 真表，而不是照搬
//     MRG 表 UPDATE 失败的线上行为；
//   - 改评价 UPDATE 失败时 PHP 仍会发通知/发积分再返回「评价失败」，Go 直接返回 101；
//   - shop-order 的 orderDetail 依赖：只复刻订单/商品校验与 store 归属所需的内联 SQL，
//     is_staff 的 companyuid 替换（member.detail）未复刻，员工账号可能被判「订单不存在」；
//   - homemaking-order 的 orderDetail 只复刻订单归属/状态查询，product/storeDetail 等深层
//     依赖不参与判定，跳过；
//   - homemaking-order 的 `$order['common']` 在 orderDetail 返回值里并不存在（恒 null），
//     所以永远走 INSERT 分支；`UPDATE homemaking_order ... WHERE id = '$aid'` 里的 $aid
//     已被 lastid 覆盖成评论 id，照搬这个 bug；
//   - shop-order 的 `$masterid = $results[0]['userid']` 取的是商品查询结果（没有 userid 列），
//     恒为 null；这里统一写空串（INSERT 前 (int) 后仍是 0），照搬结果不照搬查询；
//   - `_goods` 的 tuan/waimai 分支：PHP 只拼 SQL 未执行，$ret 未定义 → 恒「订单信息错误」，
//     照搬。极端情况下（aid&&pid 命中父评论）PHP 的 $ret 会残留上一次查询结果而放过，
//     这里按默认口径维持恒失败。
func (s *Service) sendComment(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	var httpReq *http.Request
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
		httpReq = req.HTTP
	}
	p := newParams(req)

	// 1. 禁止评论开关（17022-17030）：先于登录，匿名也拦截。
	if s.disableCommentState != 0 {
		info := s.disableCommentInfo
		if !truthyStr(info) {
			info = infoDisableCommentDefault
		}
		return fail(info)
	}

	// 2. 登录门禁（17034-17037）。
	userid, err := s.identityID(ctx, httpReq)
	if err != nil {
		return noData()
	}
	if userid == -1 {
		return fail(infoLoginTimeout)
	}

	// 3/4. 实名 201 / 手机 202（17041-17060），与 replyComment 共用。
	if resp, blocked := s.verifiedPhoneGate(ctx, userid); blocked {
		return resp
	}

	// 参数（17062-17095）。
	a := parseSendComment(p, httpReq, s.now().Unix())
	// ischeck 来自 include/config/<module>.inc.php 的 $customCommentCheck（17105）。
	if s.moduleCommentCheck != nil {
		a.ischeck = s.moduleCommentCheck(a.module)
	}

	// 5. empty($type) || empty($aid)（17107-17109）。
	if !truthyStr(a.typ) || a.aid == 0 {
		return fail(infoParamError)
	}

	// 6. empty($content)（17111-17113）：'0' 也算空，shop-order 看数组是否非空。
	if s.contentEmpty(p, a) {
		return fail(infoCommentEmpty)
	}

	// 7. 评分白名单（17124）：shop-order 的 sco1 是数组，看数组是否非空。
	if !sco1Optional(a.typ) {
		if a.shop {
			if !p.phpTruthy("sco1") && len(a.shopSco1) == 0 {
				return fail(infoChooseRating)
			}
		} else if a.sco1 == 0 {
			return fail(infoChooseRating)
		}
	}

	// 8. PC 端贴吧验证码（17126-17129）：Go 无 session，非移动端恒失败（默认口径 ③）。
	if a.typ == "tieba-detail" {
		ua := ""
		if httpReq != nil {
			ua = strings.ToLower(httpReq.Header.Get("User-Agent"))
		}
		if !isMobileRequest(ua, httpReq) {
			return fail(infoVdimgckError)
		}
	}

	// 9. waimai 打分（17134-17142）。注意 PHP 的 elseif 写的是 paitui-order（拼写错），
	// 所以 paotui-order 也进 else 把 star 置 0。
	if a.typ == "waimai-order" {
		if a.star == 0 {
			return fail(infoWaimaiStarShop)
		}
		if a.starps == 0 {
			return fail(infoWaimaiStarPS)
		}
	} else {
		a.star = 0
	}

	// 本地无数据库（DB=nil）时按「查不到数据」降级：后面必然要读写评论/订单表。
	if s.db == nil {
		return noData()
	}

	// —— masterid 分支（17145-17585）——
	masterid := "0"
	setMaster := func(v string, ok bool) {
		if ok {
			masterid = v
		}
	}
	switch a.typ {
	case "business": // 17146
		setMaster(s.masteridLookup(ctx, "SELECT `uid` FROM "+s.table("business_list")+" WHERE `id` = ?", a.aid))
	case "pension-store": // 17154：`$module = 'pension'` 是单等号赋值，恒真
		setMaster(s.masteridLookup(ctx, "SELECT `userid` FROM "+s.table("pension_store")+" WHERE `id` = ?", a.aid))
	case "info-business": // 17161
		setMaster(s.masteridLookup(ctx, "SELECT `uid` FROM "+s.table("infoshop")+" WHERE `id` = ?", a.aid))
	case "info-detail": // 17168
		setMaster(s.masteridLookup(ctx, "SELECT `userid` FROM "+s.table("infolist")+" WHERE `id` = ?", a.aid))
	case "huodong-detail": // 17175
		setMaster(s.masteridLookup(ctx, "SELECT `uid` FROM "+s.table("huodong_list")+" WHERE `id` = ?", a.aid))
	case "article-detail": // 17182
		setMaster(s.masteridLookup(ctx, "SELECT `admin` FROM "+s.table("articlelist_all")+" WHERE `id` = ?", a.aid))
	case "tieba-detail": // 17189
		setMaster(s.masteridLookup(ctx, "SELECT `uid` FROM "+s.table("tieba_list")+" WHERE `id` = ?", a.aid))
	case "video-detail": // 17196
		setMaster(s.masteridLookup(ctx, "SELECT `writer` FROM "+s.table("videolist")+" WHERE `id` = ?", a.aid))
	case "quanjing-detail": // 17203
		setMaster(s.masteridLookup(ctx, "SELECT `admin` FROM "+s.table("quanjinglist")+" WHERE `id` = ?", a.aid))
	case "marry-store": // 17210
		setMaster(s.masteridLookup(ctx, "SELECT `userid` FROM "+s.table("marry_store")+" WHERE `id` = ?", a.aid))
	case "marry-rental": // 17217：weddingcar.company → marry_store.userid
		if company, ok := s.masteridLookup(ctx, "SELECT `company` FROM "+s.table("marry_weddingcar")+" WHERE `id` = ?", a.aid); ok {
			setMaster(s.masteridLookup(ctx, "SELECT `userid` FROM "+s.table("marry_store")+" WHERE `id` = ?", company))
		}
	case "travel-store": // 17230
		setMaster(s.masteridLookup(ctx, "SELECT `userid` FROM "+s.table("travel_store")+" WHERE `id` = ?", a.aid))
	case "travel-ticket": // 17237
		if company, ok := s.masteridLookup(ctx, "SELECT `company` FROM "+s.table("travel_ticket")+" WHERE `id` = ?", a.aid); ok {
			setMaster(s.masteridLookup(ctx, "SELECT `userid` FROM "+s.table("travel_store")+" WHERE `id` = ?", company))
		}
	case "travel-video", "travel-strategy", "travel-hotel": // 17248/17280/17323
		// travel-hotel 查的也是 travel_video（PHP 历史 bug，照搬）。
		table := "travel_video"
		if a.typ == "travel-strategy" {
			table = "travel_strategy"
		}
		var usertype, uid sql.NullString
		if err := s.db.QueryRowContext(ctx,
			"SELECT `usertype`, `userid` FROM "+s.table(table)+" WHERE `id` = ?", a.aid).Scan(&usertype, &uid); err == nil {
			if phpIntval(usertype.String) == 1 {
				setMaster(s.masteridLookup(ctx, "SELECT `userid` FROM "+s.table("travel_store")+" WHERE `id` = ?", uid.String))
			} else {
				masterid = uid.String
			}
		}
	case "travel-visa": // 17300
		if company, ok := s.masteridLookup(ctx, "SELECT `company` FROM "+s.table("travel_visa")+" WHERE `id` = ?", a.aid); ok {
			setMaster(s.masteridLookup(ctx, "SELECT `userid` FROM "+s.table("travel_store")+" WHERE `id` = ?", company))
		}
	case "travel-agency": // 17312
		if company, ok := s.masteridLookup(ctx, "SELECT `company` FROM "+s.table("travel_agency")+" WHERE `id` = ?", a.aid); ok {
			setMaster(s.masteridLookup(ctx, "SELECT `userid` FROM "+s.table("travel_store")+" WHERE `id` = ?", company))
		}
	case "tuan-store": // 17342
		if len(a.content) < 15 {
			return fail(infoTuanShort)
		}
		uid, found := s.masteridLookup(ctx, "SELECT `uid` FROM "+s.table("tuan_store")+" WHERE `id` = ?", a.aid)
		if !found {
			return fail(infoTuanStoreGone)
		}
		masterid = uid
		if equalMember(true, strconv.FormatInt(userid, 10), uid) {
			return fail(infoTuanSelfStore)
		}
	case "tuan-order": // 17353
		var oUser, oState, oProid, oID sql.NullString
		err := s.db.QueryRowContext(ctx,
			"SELECT `userid`, `orderstate`, `proid`, `id` FROM "+s.table("tuan_order")+" WHERE `id` = ?", a.aid).
			Scan(&oUser, &oState, &oProid, &oID)
		if err != nil {
			return fail(infoOrderGone)
		}
		a.oid = phpIntval(oID.String)
		a.aid = phpIntval(oProid.String)
		if sid, ok := s.masteridLookup(ctx, "SELECT `sid` FROM "+s.table("tuanlist")+" WHERE `id` = ?", a.aid); ok {
			setMaster(s.masteridLookup(ctx, "SELECT `uid` FROM "+s.table("tuan_store")+" WHERE `id` = ?", sid))
		}
		if int64(phpIntval(oUser.String)) != userid {
			return fail(infoOrderNoPerm)
		}
		if phpIntval(oState.String) != 3 {
			return fail(infoOrderBadState)
		}
	case "shop-order": // 17372-17472：单独出口
		return s.sendCommentShopOrder(ctx, httpReq, a, userid)
	case "homemaking-order": // 17474-17532：单独出口（订单号用 $pid）
		return s.sendCommentHomemakingOrder(ctx, httpReq, a, userid)
	case "waimai-order": // 17533
		base := s.table("waimai_order")
		table, err := s.subTableByID(ctx, "waimai_order", base, strconv.Itoa(a.aid))
		if err != nil {
			return fail(infoOrderGoneShort)
		}
		var oID, oSid, oIsComment, oUID, oPeisong, oPaydate, oOkdate sql.NullString
		err = s.db.QueryRowContext(ctx,
			"SELECT `id`, `sid`, `iscomment`, `uid`, `peisongid`, `paydate`, `okdate` FROM "+quoteIdent(table)+" WHERE `id` = ?", a.aid).
			Scan(&oID, &oSid, &oIsComment, &oUID, &oPeisong, &oPaydate, &oOkdate)
		if err != nil {
			return fail(infoOrderGoneShort)
		}
		a.aid = phpIntval(oSid.String)
		a.oid = phpIntval(oID.String)
		a.peisongid = phpIntval(oPeisong.String)
		a.timeVal = waimaiDuration(oPaydate.String, oOkdate.String)
		setMaster(s.masteridLookup(ctx, "SELECT `userid` FROM "+s.table("waimai_store")+" WHERE `id` = ?", oSid.String))
	case "paotui-order": // 17555
		var oID, oPeisong, oPaydate, oOkdate sql.NullString
		err := s.db.QueryRowContext(ctx,
			"SELECT `id`, `iscomment`, `peisongid`, `paydate`, `okdate` FROM "+s.table("paotui_order")+" WHERE `id` = ?", a.aid).
			Scan(&oID, new(sql.NullString), &oPeisong, &oPaydate, &oOkdate)
		if err != nil {
			return fail(infoOrderGoneShort)
		}
		a.peisongid = phpIntval(oPeisong.String)
		a.oid = phpIntval(oID.String)
		a.aid = 0
		a.timeVal = waimaiDuration(oPaydate.String, oOkdate.String)
	case "circle-dynamic": // 17568
		setMaster(s.masteridLookup(ctx, "SELECT `userid` FROM "+s.table("circle_dynamic")+" WHERE `id` = ?", a.aid))
	}

	// 父评论降级（17579-17586）：父评论不存在时 pid=0，静默不报错。
	if a.aid != 0 && a.pid != 0 {
		var one sql.NullString
		if err := s.db.QueryRowContext(ctx,
			"SELECT `id` FROM "+s.commentTable+" WHERE `type` = ? AND `aid` = ? AND `pid` = 0", a.typ, a.aid).
			Scan(&one); err != nil {
			a.pid = 0
		}
	}

	// `x_goods` / `x_store`（17588-17630）。
	if parts := strings.Split(a.typ, "_"); len(parts) == 2 {
		switch parts[1] {
		case "goods":
			a.pid = 0
			if a.oid == 0 {
				return fail(infoParamError)
			}
			if parts[0] != "shop" {
				// tuan/waimai：PHP 只拼 SQL 未执行 → $ret 未定义 → 恒「订单信息错误」（默认口径 ②）。
				return fail(infoOrderInfoWrong)
			}
			var one sql.NullString
			err := s.db.QueryRowContext(ctx,
				"SELECT o.`id` FROM "+s.table("shop_order")+" o LEFT JOIN "+s.table("shop_order_product")+
					" p ON p.`orderid` = o.`id` WHERE o.`id` = ? AND o.`userid` = ? AND p.`proid` = ?",
				a.oid, userid, a.aid).Scan(&one)
			if err != nil {
				return fail(infoOrderInfoWrong)
			}
			// 验证评价是否已存在（17619-17624）。
			if err := s.db.QueryRowContext(ctx,
				"SELECT `id` FROM "+s.commentTable+" WHERE `aid` = ? AND `oid` = ? AND `userid` = ? AND `type` = ?",
				a.aid, a.oid, userid, a.typ).Scan(&one); err == nil {
				return fail(infoAlreadyComment)
			}
		case "store":
			a.oid = 0
		}
	}

	// 团购/外卖/跑腿：同一订单已有评价则改评价（17634-17646）。
	commentid := 0
	if a.typ == "tuan-order" || a.typ == "waimai-order" || a.typ == "paotui-order" {
		var one sql.NullString
		if err := s.db.QueryRowContext(ctx,
			"SELECT `id` FROM "+s.commentTable+" WHERE `type` = ? and `oid` = ?", a.typ, a.oid).
			Scan(&one); err == nil {
			commentid = phpIntval(one.String)
		}
	}

	var ret string
	if commentid > 0 && a.oid != 0 {
		sqlText, args := s.updateCommentSQL(a, masterid)
		if _, err := s.db.ExecContext(ctx, sqlText, args...); err != nil {
			return fail(infoReplyFail)
		}
		ret = strconv.Itoa(commentid)
		s.memberLog(ctx, httpReq, strconv.FormatInt(userid, 10), "member", "comment", 0,
			"update", "修改评价("+a.typ+"=>"+strconv.Itoa(a.oid)+")", "", interpolate(sqlText, args...))
	} else {
		sqlText, args := s.insertCommentSQL(a, masterid, userid)
		res, err := s.db.ExecContext(ctx, sqlText, args...)
		if err != nil {
			return fail(infoReplyFail)
		}
		lastid, err := res.LastInsertId()
		if err != nil {
			return fail(infoReplyFail)
		}
		ret = strconv.FormatInt(lastid, 10)

		// 贴吧：审核通过的重放才加计数（17648-17656）。清缓存 Go 侧无对应层，跳过。
		if a.ischeck == 1 && a.typ == "tieba-detail" {
			_, _ = s.db.ExecContext(ctx, "UPDATE "+s.table("tieba_list")+" SET `comment` = `comment` +1 WHERE `id` = ?", a.aid)
		}
		s.memberLog(ctx, httpReq, strconv.FormatInt(userid, 10), "member", "comment", 0,
			"insert", "发表评价("+a.typ+"=>"+strconv.Itoa(a.aid)+"=>"+a.content+")", "", interpolate(sqlText, args...))
	}

	// tid / updateMemberNotice（17663-17717）：通知链路未迁移，跳过（见函数头偏差）。

	// 积分（17718-17758）：仅 ischeck==1，且按配置（默认 0 不发放，默认口径 ④）。
	if a.ischeck == 1 {
		s.awardCommentPoint(ctx, userid)
	}

	// 管理员通知（17760-17767）：未迁移。

	if !isNumeric(ret) {
		return fail(infoReplyFail)
	}

	// 订单置已评价（17768-17781）：只有这三类。
	switch a.typ {
	case "tuan-order":
		_, _ = s.db.ExecContext(ctx, "UPDATE "+s.table("tuan_order")+" SET `common` = 1 WHERE `id` = ?", a.oid)
	case "waimai-order":
		// 分表按 oid 定位不到时 PHP 拼出的 SQL 会失败（结果被忽略），这里同样跳过。
		if table, err := s.subTableByID(ctx, "waimai_order", s.table("waimai_order"), strconv.Itoa(a.oid)); err == nil {
			_, _ = s.db.ExecContext(ctx, "UPDATE "+quoteIdent(table)+" SET `iscomment` = 1 WHERE `id` = ?", a.oid)
		}
	case "paotui-order":
		_, _ = s.db.ExecContext(ctx, "UPDATE "+s.table("paotui_order")+" SET `iscomment` = 1 WHERE `id` = ?", a.oid)
	}

	// check：回查新评价，返回 userinfo 全量（17783-17802）。
	if a.check {
		var cID, cUserID, cContent, cDtime, cIP, cIPAddr, cZan, cZanUser, cIsCheck sql.NullString
		err := s.db.QueryRowContext(ctx,
			"SELECT `id`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `zan`, `zan_user`, `ischeck` FROM "+s.commentTable+" WHERE `id` = ?", phpIntval(ret)).
			Scan(&cID, &cUserID, &cContent, &cDtime, &cIP, &cIPAddr, &cZan, &cZanUser, &cIsCheck)
		if err == nil {
			if s.userDetail == nil {
				return noData() // userinfo 需要 member.detail（#253）
			}
			userinfo, err := s.userDetail(ctx, httpReq, cUserID.String, cUserID.Valid)
			if err != nil {
				return noData()
			}
			now := s.now()
			list := NewObject()
			list.Set("id", phpIntval(cID.String))
			list.Set("userinfo", userinfo)
			list.Set("content", cContent.String)
			list.Set("dtime", phpIntval(cDtime.String))
			list.Set("ftime", floorTime(now.Unix()-int64(phpIntval(cDtime.String)), now))
			list.Set("ip", cIP.String)
			list.Set("ipaddr", cIPAddr.String)
			list.Set("iphome", getIPHome(cIPAddr.String, s.ipHomeMode))
			list.Set("zan", phpIntval(cZan.String))
			list.Set("ischeck", phpIntval(cIsCheck.String))
			list.Set("message", commentMessage(a.ischeck))
			list.Set("returnPoint", s.returnInteractionComment)
			list.Set("pointName", s.pointName)
			return ajax.Response{State: ajax.StateOK, Info: list}
		}
	}

	// 安卓 App 或 format=json 的资讯详情（17804-17815）：字段名是 isCheck。
	if a.typ == "article-detail" && (isAndroidAppUA(httpReq) || requestFormat(httpReq, p) == "json") {
		info := NewObject()
		info.Set("message", commentMessage(a.ischeck))
		info.Set("returnPoint", s.returnInteractionComment)
		info.Set("pointName", s.pointName)
		info.Set("isCheck", a.ischeck)
		info.Set("lastid", phpIntval(ret))
		return ajax.Response{State: ajax.StateOK, Info: info}
	}
	return ajax.Response{State: ajax.StateOK, Info: infoReplySuccess}
}

// contentEmpty 复刻 empty($content)：'0' 算空；shop-order 的 content 是数组，看数组/标量是否非空。
//
// PHP 的顺序是 17070 先清洗（非 shop-order 走 trim + 去 &nbsp;，circle-dynamic 再 strip_tags），
// 17101 才 empty($content) —— 所以判空看的是**清洗后**的值：全空格、"&nbsp;"、纯标签在 PHP
// 里都算空。a.content 正是清洗后的结果（见 parseSendComment），这里直接用它，不能拿原始
// $_REQUEST 再判一次，否则会放行 PHP 会拒的空壳评论。
func (s *Service) contentEmpty(p params, a *sendCommentArgs) bool {
	if a.shop {
		return !p.phpTruthy("content") && len(a.shopContent) == 0
	}
	// content[] 走数组时 addslashes(array) 是 null，a.content 恒为 ""，同样落到这里判空。
	return a.content == "" || a.content == "0"
}

// commentMessage 对应 ischeck==1 ? 评价成功！ : 评论成功，将在审核后显示。
func commentMessage(ischeck int) string {
	if ischeck == 1 {
		return infoReplySuccess
	}
	return infoReplyAuditing
}

// requestFormat 对应 $_REQUEST['format']：Cookie 覆盖 GET/POST（variables_order=EGPCS）。
func requestFormat(req *http.Request, p params) string {
	if req != nil {
		if c, err := req.Cookie("format"); err == nil {
			return c.Value
		}
	}
	return p.scalar("format")
}

// waimaiDuration 复刻 ceil((okdate - paydate) / 60)（PHP 的 ceil 返回 float，拼进 SQL 后是整数串）。
func waimaiDuration(paydate, okdate string) int {
	return int(math.Ceil(float64(phpIntval(okdate)-phpIntval(paydate)) / 60))
}

// masteridLookup 对应「查一列、命中就覆盖 masterid」的模式：查询失败/无记录返回 ok=false
// （PHP 的 dsqlOper 此时返回 false，masterid 保持原值）。
func (s *Service) masteridLookup(ctx context.Context, query string, args ...any) (string, bool) {
	var v sql.NullString
	if err := s.db.QueryRowContext(ctx, query, args...).Scan(&v); err != nil {
		return "", false
	}
	return v.String, true
}

// table 按前缀拼业务表名。sendComment 涉及二十余张只读一次的表，逐个挂 Dep 字段没有收益。
func (s *Service) table(name string) string { return "`" + s.prefix + name + "`" }

// interpolate 把参数化 SQL 还原成 PHP 风格的留档串（只给 memberLog 的 sql 字段用）。
func interpolate(query string, args ...any) string {
	var b strings.Builder
	i := 0
	for _, r := range query {
		if r == '?' && i < len(args) {
			b.WriteString("'" + stringifyArg(args[i]) + "'")
			i++
			continue
		}
		b.WriteRune(r)
	}
	return b.String()
}

func stringifyArg(v any) string {
	switch x := v.(type) {
	case nil:
		return ""
	case string:
		return x
	case int:
		return strconv.Itoa(x)
	case int64:
		return strconv.FormatInt(x, 10)
	case float64:
		return strconv.FormatFloat(x, 'f', -1, 64)
	case bool:
		if x {
			return "1"
		}
		return "0"
	}
	return ""
}

// updateCommentSQL 是 commentid>0 的改评价语句（17635-17641）。按默认口径写 public_comment 真表。
func (s *Service) updateCommentSQL(a *sendCommentArgs, masterid string) (string, []any) {
	q := "UPDATE " + s.publicCommentTable + " SET `masterid` = ?, `ischeck` = ?, `ipaddr` = ?, `ip` = ?, `dtime` = ?, `content` = ?, `pics` = ?, `sco3` = ?, `sco2` = ?, `sco1` = ?, `rating` = ?, `peisongid` = ?, `star` = ?, `starps` = ?, `contentps` = ?, `isanony` = ? WHERE `oid` = ?"
	return q, []any{masterid, a.ischeck, "", a.ip, a.dtime, a.content, a.pics, a.sco3, a.sco2, a.sco1,
		a.rating, a.peisongid, a.star, a.starps, a.contentps, a.isanony, a.oid}
}

// insertCommentSQL 是主路径的 INSERT（17646-17648）。speid/specation/time 在 PHP 里是未定义
// 变量（null → 空串），只有 waimai/paotui 会写 time。
func (s *Service) insertCommentSQL(a *sendCommentArgs, masterid string, userid int64) (string, []any) {
	q := "INSERT INTO " + s.publicCommentTable +
		" (`masterid`, `pid`, `type`, `aid`, `oid`, `userid`, `rating`, `sco1`, `content`, `pics`, `audio`, `video`, `dtime`, `ip`, `ipaddr`, `ischeck`, `zan`, `zan_user`, `sco2`, `sco3`, `speid`, `specation`, `peisongid`, `star`, `starps`, `contentps`, `isanony`, `time`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
	return q, []any{masterid, a.pid, a.typ, a.aid, a.oid, userid, a.rating, a.sco1, a.content, a.pics,
		a.audio, a.video, a.dtime, a.ip, "", a.ischeck, 0, "", a.sco2, a.sco3, a.speid, a.specation,
		a.peisongid, a.star, a.starps, a.contentps, a.isanony, a.timeVal}
}

// awardCommentPoint 复刻 17418-17457 / 17719-17757 / countIntegral（common.func.php:16963）：
// 当天互动积分未达上限且配置了返积分数量才发放；未配置（默认 0）时什么都不做。
func (s *Service) awardCommentPoint(ctx context.Context, userid int64) {
	if s.returnInteractionComment <= 0 {
		return
	}
	now := s.now().In(gmt8)
	start := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, gmt8).Unix()
	end := start + 86400
	var total sql.NullString
	if err := s.db.QueryRowContext(ctx,
		"SELECT SUM(`amount`) total FROM "+s.table("member_point")+
			" WHERE `userid` = ? AND `type` = 1 AND `interaction` = '1' AND `date` >= ? AND `date` < ?",
		userid, start, end).Scan(&total); err != nil {
		return
	}
	if phpIntval(total.String) >= s.returnInteractionDay {
		return
	}
	if _, err := s.db.ExecContext(ctx,
		"UPDATE "+s.memberTable+" SET `point` = `point` + ? WHERE `id` = ?",
		s.returnInteractionComment, userid); err != nil {
		return
	}
	var point sql.NullString
	if err := s.db.QueryRowContext(ctx,
		"SELECT `point` FROM "+s.memberTable+" WHERE `id` = ?", userid).Scan(&point); err != nil {
		return
	}
	_, _ = s.db.ExecContext(ctx,
		"INSERT INTO "+s.table("member_point")+" (`userid`, `type`, `amount`, `info`, `date`, `ctype`, `interaction`, `balance`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
		userid, 1, s.returnInteractionComment, "发表评论", s.now().Unix(), "zengsong", "1", point.String)
}

// sendCommentShopOrder 复刻 17372-17472：逐商品写评价。
// 订单/商品校验用 shop.orderDetail（shop.class.php:14283）里与评价相关的那几条 SQL 复刻。
func (s *Service) sendCommentShopOrder(ctx context.Context, httpReq *http.Request, a *sendCommentArgs, userid int64) ajax.Response {
	// orderDetail 的可见范围还带配送员 cookie（shop.class.php:14307 的 $did）。
	courier := 0
	if httpReq != nil {
		if c, err := httpReq.Cookie("courier"); err == nil {
			courier = phpIntval(c.Value)
		}
	}
	var oUser, oState, oCommon sql.NullString
	err := s.db.QueryRowContext(ctx,
		"SELECT o.`userid`, o.`orderstate`, o.`common`, o.`store` FROM "+s.table("shop_order")+" o"+
			" LEFT JOIN "+s.table("shop_store")+" s ON s.`id` = o.`store`"+
			" LEFT JOIN "+s.table("shop_branch_store")+" b ON b.`id` = o.`branchid`"+
			" WHERE (o.`userid` = ? OR s.`userid` = ? OR b.`userid` = ? OR (o.`peisongid` = ? AND ? != 0)) AND o.`id` = ? LIMIT 1",
		userid, userid, userid, courier, courier, a.aid).Scan(&oUser, &oState, &oCommon, new(sql.NullString))
	if err != nil {
		return fail(infoOrderGone)
	}
	if int64(phpIntval(oUser.String)) != userid {
		return fail(infoOrderNoPerm)
	}
	if phpIntval(oState.String) != 3 {
		return fail(infoOrderBadState)
	}

	type product struct {
		proid, orderid, speid, specation string
	}
	var products []product
	rows, err := s.db.QueryContext(ctx,
		"SELECT p.`proid`, p.`orderid`, p.`speid`, p.`specation` FROM "+s.table("shop_order_product")+" p"+
			" LEFT JOIN "+s.table("shop_product")+" l ON l.`id` = p.`proid`"+
			" WHERE l.`id` IS NOT NULL AND p.`orderid` = ?", a.aid)
	if err == nil {
		for rows.Next() {
			var p product
			if err := rows.Scan(&p.proid, &p.orderid, &p.speid, &p.specation); err != nil {
				break
			}
			products = append(products, p)
		}
		_ = rows.Close()
	}

	for _, p := range products {
		// 键 $pid."_".$speid：PHP 的 $pid 是 shop.orderDetail 里 $proDetail[$p]['id']，即
		// shop_product.id（商品查询按 l.id = p.proid 关联，两者相等），speid 取订单商品行。
		key := strconv.Itoa(phpIntval(p.proid)) + "_" + p.speid
		rating, sco1, sco2, sco3 := a.shopRating[key], a.shopSco1[key], a.shopSco2[key], a.shopSco3[key]
		content := strings.Trim(strings.ReplaceAll(a.shopContent[key], "&nbsp;", ""), phpTrimChars)
		pics := a.shopPics[key]
		if !truthyStr(rating) {
			return fail(infoShopChooseRate)
		}
		if !truthyStr(sco1) {
			return fail(infoShopSco1)
		}
		if !truthyStr(sco2) {
			return fail(infoShopSco2)
		}
		if !truthyStr(sco3) {
			return fail(infoShopSco3)
		}
		if !truthyStr(content) {
			return fail(infoShopContent)
		}

		// PHP 在 17417 把 $masterid 赋成商品行里不存在的 userid（恒 null，见函数头偏差）。
		if phpIntval(oCommon.String) == 1 {
			q := "UPDATE " + s.publicCommentTable + " SET `masterid` = ?, `ischeck` = ?, `ipaddr` = ?, `ip` = ?, `dtime` = ?, `content` = ?, `pics` = ?, `sco3` = ?, `sco2` = ?, `sco1` = ?, `rating` = ?, `isanony` = ? WHERE `oid` = ?"
			args := []any{"", a.ischeck, "", a.ip, a.dtime, content, pics, sco3, sco2, sco1, rating, a.isanony, phpIntval(p.orderid)}
			if _, err := s.db.ExecContext(ctx, q, args...); err != nil {
				return fail(infoReplyFail)
			}
			s.memberLog(ctx, httpReq, strconv.FormatInt(userid, 10), "member", "comment", 0,
				"update", "修改评价(shop=>"+p.orderid+")", "", interpolate(q, args...))
			continue
		}

		q := "INSERT INTO " + s.publicCommentTable +
			" (`pid`, `type`, `aid`, `oid`, `userid`, `rating`, `sco1`, `content`, `pics`, `audio`, `video`, `dtime`, `ip`, `ipaddr`, `ischeck`, `zan`, `zan_user`, `sco2`, `sco3`, `speid`, `specation`, `masterid`, `isanony`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
		args := []any{0, a.typ, p.proid, p.orderid, userid, rating, sco1, content, pics, a.audio, a.video,
			a.dtime, a.ip, "", a.ischeck, 0, "", sco2, sco3, p.speid, p.specation, 0, a.isanony}
		res, err := s.db.ExecContext(ctx, q, args...)
		if err != nil {
			return fail(infoReplyFail)
		}
		// $aid 被 lastid 覆盖（后续通知里的 id 变成评论 id），memberLog 的 aid 也用它。
		lastid, err := res.LastInsertId()
		if err != nil {
			return fail(infoReplyFail)
		}
		s.memberLog(ctx, httpReq, strconv.FormatInt(userid, 10), "member", "comment", lastid,
			"insert", "发表评价(shop=>"+p.orderid+")", "", interpolate(q, args...))
	}

	// 积分不受 ischeck 控制（这段在 if($ischeck==1) 之外，17412-17457）。
	s.awardCommentPoint(ctx, userid)
	_, _ = s.db.ExecContext(ctx, "UPDATE "+s.table("shop_order")+" SET `common` = 1 WHERE `id` = ?", a.aid)
	// 注释掉的安卓返回之后，PHP 恒 return 字符串 → 外层 100 + 「评价成功！」。
	return ajax.Response{State: ajax.StateOK, Info: infoReplySuccess}
}

// sendCommentHomemakingOrder 复刻 17474-17532。订单号用的是 $pid 而不是 $aid。
func (s *Service) sendCommentHomemakingOrder(ctx context.Context, httpReq *http.Request, a *sendCommentArgs, userid int64) ajax.Response {
	// homemaking.orderDetail 先按当前会员查派单员 id（homemaking.class.php:4881-4890）。
	dispatch := ""
	var personal sql.NullString
	if err := s.db.QueryRowContext(ctx,
		"SELECT `id`, `company`, `state` FROM "+s.table("homemaking_personal")+" WHERE `userid` = ?", userid).
		Scan(&personal, new(sql.NullString), new(sql.NullString)); err == nil {
		dispatch = personal.String
	}
	var oUser, oState sql.NullString
	err := s.db.QueryRowContext(ctx,
		"SELECT o.`userid`, o.`orderstate` FROM "+s.table("homemaking_order")+" o"+
			" LEFT JOIN "+s.table("homemaking_list")+" l ON o.`proid` = l.`id`"+
			" LEFT JOIN "+s.table("homemaking_store")+" s ON l.`company` = s.`id`"+
			" WHERE (o.`dispatchid` = ? OR o.`userid` = ? OR s.`userid` = ?) AND o.`id` = ? LIMIT 1",
		dispatch, userid, userid, a.pid).Scan(&oUser, &oState)
	if err != nil {
		return fail(infoOrderGone)
	}
	if int64(phpIntval(oUser.String)) != userid {
		return fail(infoOrderNoPerm)
	}
	state := phpIntval(oState.String)
	if state != 11 && state != 12 {
		return fail(infoOrderBadState)
	}
	orderUser := int64(phpIntval(oUser.String))

	q := "INSERT INTO " + s.publicCommentTable +
		" (`pid`, `type`, `aid`, `oid`, `userid`, `rating`, `sco1`, `content`, `pics`, `audio`, `video`, `dtime`, `ip`, `ipaddr`, `ischeck`, `zan`, `zan_user`, `sco2`, `sco3`, `speid`, `specation`, `masterid`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
	args := []any{0, a.typ, a.aid, a.pid, orderUser, a.rating, a.sco1, a.content, a.pics, a.audio, a.video,
		a.dtime, a.ip, "", a.ischeck, 0, "", a.sco2, a.sco3, "0", "0", 0}
	res, err := s.db.ExecContext(ctx, q, args...)
	if err != nil {
		return fail(infoReplyFail)
	}
	lastid, err := res.LastInsertId()
	if err != nil {
		return fail(infoReplyFail)
	}
	// PHP 在 INSERT 分支传的是 'update'（17498-17500），照搬。
	s.memberLog(ctx, httpReq, strconv.FormatInt(orderUser, 10), "member", "comment", lastid,
		"update", "发表评价(homemaking=>"+strconv.Itoa(a.pid)+")", "", interpolate(q, args...))

	// `WHERE id = '$aid'` 里的 $aid 已被 lastid 覆盖，照搬（更新不到订单）。
	_, _ = s.db.ExecContext(ctx, "UPDATE "+s.table("homemaking_order")+" SET `orderstate` = 12, `common` = 1 WHERE `id` = ?", lastid)
	return ajax.Response{State: ajax.StateOK, Info: infoReplySuccess}
}
