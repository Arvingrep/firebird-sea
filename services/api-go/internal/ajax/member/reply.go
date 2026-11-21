package member

import (
	"context"
	"database/sql"
	"net/http"
	"strconv"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// replyComment 的文案（webroot/include/lang/zh-CN/siteConfig.inc.php）。
const (
	infoDisableCommentDefault = "功能维护中，暂停使用！"   // cfg_disableCommentInfo 未配置时的默认提示（member.class.php:17826）
	infoReplyFail             = "评价失败"          // [33][44]
	infoReplyEmptyContent     = "请填写回复内容"       // [33][45]
	infoReplyNoOrigin         = "原评价不存在"        // [33][46]
	infoReplySuccess          = "评价成功！"         // [20][196]
	infoReplyAuditing         = "评论成功，将在审核后显示。" // 安卓 App 分支 ischeck!=1 的 message
	infoVerifyPhone           = "请先验证手机号码"      // 手机认证周期到期文案（member.class.php:17848）
)

// replyComment 迁移自 member.class.php:17817-18021（member.replyComment，#259）。
//
// 门禁顺序（先到先拦）：禁止评论开关（先于登录）→ 登录（没有 from 后门，与 #255 不同）
// → 实名认证 201 → 手机认证 202 → 参数（id/content，'0' 也算空）。
// 外层包装：200 出口统一改写成 101；201/202 因同时有 state+info 原样透传。
//
// 主流程：SELECT public_comment_all 取原评论（id,pid,rid,aid,type,masterid）；
// pid==0（PHP 7 松散比较，null/"0"/非数字串都算 0）→ 一级评论（rid=0、parent=本行）；
// pid!=0 → 再查父评论，查不到时 $parent 未定义继续跑（pid/type/aid 全 null，ischeck=0），
// 不补校验。oid 恒 0（两处 SELECT 都不含 oid 列）。INSERT 只写 public_comment 一条
// （public_comment_all 是 MRG 合并表，紧接的回查能看到刚插的行，Go 直接查同一张表等价），
// 成功记 memberLog（note=回复评价(type=>aid)）；ischeck==1 时的会员通知未迁移（纯副作用）。
// check 为真值（PHP 真值，'0' 是假）时回查新行拼 userinfo 结构返回；否则安卓 App UA 且
// type=article-detail 走 message/isCheck/lastid，其余输出「评价成功！」。没有
// $_REQUEST['format']=='json' 条件、没有 returnPoint/pointName（与 sendComment/addComment 不同）。
//
// 与 PHP 的已知偏差（不影响正常路径的响应，口径同 #255/#256/#258）：
//   - updateMemberNotice（ischeck==1 时的「会员-新评论通知」）与 updateAdminNotice（check
//     分支的管理员通知）未迁移：纯副作用（member_letter/站内信/推送），失败也不影响返回；
//     为取通知目标 tid 的 SELECT public_comment_all WHERE id=rid 一并跳过；
//   - INSERT 后 dsqlOper lastid 的 public_comment 分表 checkCreateTable 是建表维护动作，跳过；
//   - getIpAddr 需要 IP 库，ipaddr 写空串（回查输出里 ipaddr/iphome 也为空，PHP 侧取决于
//     IP 库的「省 市 运营商」）；
//   - customCommentCheck 读 include/config/<module>.inc.php，镜像里无统一配置源，
//     经 Dep.ModuleCommentCheck 注入；未注入按 0（待审核）；
//   - 实名/手机门禁字段取自 member.detail（getMemberInfo 委托）的投影：userType 是
//     busiState 真值 ? (int)mtype : 1，mtype==2 时 licenseState 强转 int、busiState 取
//     business_list 首行 state。会员不存在（或 state/mtype 不匹配）时 PHP 的 $userinfo 是
//     空数组，字段全 null：实名不拦、手机视为未绑定。门禁开关全关时不查这些库（无输出影响）；
//   - check=1 回查成功后的 userinfo 走 Dep.UserDetail（member.detail，#253）钩子，未注入时
//     按「缺依赖」降级 102（同 #251 getComment 的处理）；
//   - content 含反斜杠时 PHP 入口有 addslashes(stripslashes(...)) 归一，Go 参数化直存原值；
//     content 是 JSON 数组串（'[{...' 或合法 JSON）时 PHP 的 $param 会变成数组、拼进 SQL 成
//     "Array"，Go 原样存字符串。
func (s *Service) replyComment(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	var httpReq *http.Request
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
		httpReq = req.HTTP
	}
	p := newParams(req)

	// 1. 禁止评论开关：强转 int 后非 0 直接返回（先于登录校验，匿名也拦截）。
	if s.disableCommentState != 0 {
		info := s.disableCommentInfo
		if !truthyStr(info) { // PHP 真值判断：'' / '0' 都是假
			info = infoDisableCommentDefault
		}
		return fail(info)
	}

	// 2. 登录门禁：没有 from 后门，身份直接取登录者。
	userid, err := s.identityID(ctx, httpReq)
	if err != nil {
		return noData()
	}
	if userid == -1 {
		return fail(infoLoginTimeout)
	}

	// 3. 参数（在实名/手机门禁之后，但开关全关时门禁无库查询，先取参数不影响顺序）。
	// id 在 ajax.php 已按 convertArrToStrWithComma 归一（"0" 归一成空串），再 (int) 强转。
	id := phpIntval(paramID(req, "id"))
	content, contentOK := p.phpRaw("content")
	checkTruthy := p.phpTruthy("check") // PHP 真值：'' / '0' / 缺失 / 空数组为假

	// 4. 参数门禁：empty((int)$id) → 参数错误；empty($content)（'0' 也是空）→ 请填写回复内容。
	if id == 0 {
		return fail(infoParamError)
	}
	if !contentOK {
		return fail(infoReplyEmptyContent)
	}

	if s.db == nil {
		// 本地无数据库（DB=nil）时按「查不到数据」降级：登录与参数已过，接下来必然要读写评论表。
		return noData()
	}

	// 5. 实名认证 / 手机认证（getMemberInfo → member.detail 的门禁字段投影）。
	if resp, blocked := s.verifiedPhoneGate(ctx, userid); blocked {
		return resp
	}

	// 6. 原评论：SELECT id,pid,rid,aid,type,masterid FROM public_comment_all WHERE id = $id。
	var rowID, rowPID, rowRID, rowAID, rowType, rowMasterID sql.NullString
	err = s.db.QueryRowContext(ctx,
		"SELECT `id`, `pid`, `rid`, `aid`, `type`, `masterid` FROM "+s.commentTable+" WHERE `id` = ?",
		int64(id)).Scan(&rowID, &rowPID, &rowRID, &rowAID, &rowType, &rowMasterID)
	if err == sql.ErrNoRows {
		return fail(infoReplyNoOrigin)
	}
	if err != nil {
		// 已知偏差：PHP 查询异常时 $ret 为 false，会走「原评价不存在」；这里统一按 102 降级。
		return noData()
	}

	// 7. parent 归属：pid==0（PHP 7 松散比较：null/"0"/非数字串都算 0）是一级评论。
	var pid, ptype, paid string // 空串表示 PHP 的 null（未定义变量）
	rid := ""                   // 一级评论是 0；父行缺失时保持未定义（null）
	if leadingNumber(rowPID.String) == 0 {
		rid = ""
		pid, ptype, paid = rowID.String, rowType.String, rowAID.String
	} else {
		var parID, parPID, parRID, parAID, parType sql.NullString
		err := s.db.QueryRowContext(ctx,
			"SELECT `id`, `pid`, `rid`, `aid`, `type` FROM "+s.commentTable+" WHERE `id` = ?",
			rowPID.String).Scan(&parID, &parPID, &parRID, &parAID, &parType)
		if err == nil {
			// rid = 本行.rid 真值 ? 本行.rid : 本行.id（PHP 真值：'' / '0' 是假）。
			if truthyStr(rowRID.String) {
				rid = rowRID.String
			} else {
				rid = rowID.String
			}
			pid, ptype, paid = parID.String, parType.String, parAID.String
		}
	}
	masterid := rowMasterID.String

	// 8. module 映射与 ischeck：paotui/waimai 订单 → waimai；否则取 type 按 '-' 切第一段。
	module := ""
	if ptype == "paotui-order" || ptype == "waimai-order" {
		module = "waimai"
	} else {
		module, _, _ = strings.Cut(ptype, "-")
	}
	ischeck := 0
	if s.moduleCommentCheck != nil {
		ischeck = s.moduleCommentCheck(module)
	}

	now := s.now()
	dtime := now.Unix()
	ip, _ := requestIP(httpReq) // ipaddr（getIpAddr）需要 IP 库，Go 侧写空串

	// 9. rid 收口：rid==0（含未定义的 null）→ rid = 原评论 id。之后查被回复人 userid 当通知
	// 目标 tid——通知未迁移，查询一并跳过（tid 查不到时 PHP 通知发给自己，均不影响响应）。
	if leadingNumber(rid) == 0 {
		rid = strconv.Itoa(id)
	}

	// 10. INSERT public_comment（content 原样，无 addslashes、无判重）。
	sqlText := "INSERT INTO " + s.publicCommentTable + " (`masterid`, `pid`, `type`, `aid`, `oid`, `userid`, `rating`, `sco1`, `content`, `pics`, `audio`, `video`, `dtime`, `ip`, `ipaddr`, `ischeck`, `zan`, `zan_user`, `isanony`, `rid`, `sid`) VALUES ('" +
		masterid + "', '" + pid + "', '" + ptype + "', '" + paid + "', '0', '" + strconv.FormatInt(userid, 10) +
		"', '0', '0', '" + content + "', '', '', '', '" + strconv.FormatInt(dtime, 10) + "', '" + ip +
		"', '', '" + strconv.Itoa(ischeck) + "', '0', '', '0', '" + rid + "', '" + strconv.Itoa(id) + "')"
	res, err := s.db.ExecContext(ctx,
		"INSERT INTO "+s.publicCommentTable+" (`masterid`, `pid`, `type`, `aid`, `oid`, `userid`, `rating`, `sco1`, `content`, `pics`, `audio`, `video`, `dtime`, `ip`, `ipaddr`, `ischeck`, `zan`, `zan_user`, `isanony`, `rid`, `sid`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
		masterid, pid, ptype, paid, 0, userid, 0, 0, content, "", "", "", dtime, ip, "", ischeck, 0, "", 0, rid, id)
	if err != nil {
		return fail(infoReplyFail)
	}
	lastid, err := res.LastInsertId()
	if err != nil {
		return fail(infoReplyFail)
	}

	// memberLog：note 是 回复评价(type=>aid)，$type/$aid 是 parent 的（父行缺失时是 null → 空）。
	s.memberLog(ctx, httpReq, strconv.FormatInt(userid, 10), "member", "comment", 0,
		"insert", "回复评价("+ptype+"=>"+paid+")", "", sqlText)

	// ischeck==1 时的 updateMemberNotice（会员-新评论通知）未迁移：纯副作用，见函数头偏差说明。

	// 11. check 为真值：回查刚插的行拼 userinfo 结构；查不到（理论不可达）返回 null → 102。
	if checkTruthy {
		var cID, cUserID, cContent, cDtime, cIP, cIPAddr, cZan, cZanUser, cIsCheck sql.NullString
		err := s.db.QueryRowContext(ctx,
			"SELECT `id`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `zan`, `zan_user`, `ischeck` FROM "+s.commentTable+" WHERE `id` = ?",
			lastid).Scan(&cID, &cUserID, &cContent, &cDtime, &cIP, &cIPAddr, &cZan, &cZanUser, &cIsCheck)
		if err != nil {
			// PHP results 为 false/空 → 函数末尾隐式返回 null → 102 "No data!"。
			return noData()
		}
		if s.userDetail == nil {
			// userinfo 需要 member.detail（#253），未注入按「缺依赖」降级（同 #251）。
			return noData()
		}
		userinfo, err := s.userDetail(ctx, httpReq, cUserID.String, true)
		if err != nil {
			return noData()
		}
		list := NewObject()
		list.Set("id", cID.String)
		list.Set("userinfo", userinfo)
		list.Set("content", cContent.String)
		list.Set("dtime", cDtime.String)
		list.Set("ftime", floorTime(now.Unix()-int64(phpIntval(cDtime.String)), now))
		list.Set("ip", cIP.String)
		list.Set("ipaddr", cIPAddr.String)
		list.Set("iphome", getIPHome(cIPAddr.String, s.ipHomeMode))
		list.Set("zan", cZan.String)
		list.Set("ischeck", cIsCheck.String)
		return ajax.Response{State: ajax.StateOK, Info: list}
	}

	// 12. check 为假：安卓 App UA 且 type=article-detail → message/isCheck/lastid；否则文案。
	if isAndroidAppUA(httpReq) && ptype == "article-detail" {
		message := infoReplyAuditing
		if ischeck == 1 {
			message = infoReplySuccess
		}
		info := NewObject()
		info.Set("message", message)
		info.Set("isCheck", ischeck)
		info.Set("lastid", lastid)
		return ajax.Response{State: ajax.StateOK, Info: info}
	}
	return ajax.Response{State: ajax.StateOK, Info: infoReplySuccess}
}

// verifiedPhoneGate 是 sendComment / replyComment 共用的门禁 3、4（member.class.php:17042-17060 /
// 17831-17849）：实名认证不过 → 201；手机未绑定或周期校验过期 → 202。两个开关全关时不查库、
// 直接放行（PHP 仍会算 $userinfo，但门禁不拦，输出等价）。
// 返回 blocked=true 时调用方原样返回 resp；外部包装对 201/202 不改码（handlers.class.php:66-73）。
func (s *Service) verifiedPhoneGate(ctx context.Context, userid int64) (resp ajax.Response, blocked bool) {
	if s.memberVerified == 0 && s.memberBindPhone == 0 {
		return ajax.Response{}, false
	}
	if s.db == nil {
		// 本地无数据库（DB=nil）时门禁字段无从查起，按「缺依赖」降级。
		return noData(), true
	}
	gi, err := s.gateFields(ctx, userid)
	if err != nil {
		return noData(), true
	}
	if s.memberVerified != 0 && !gi.missing {
		// (userType==1 && certifyState!=1) || (userType==2 && licenseState!=1)（PHP 松散比较）。
		// 会员行缺失时 $userinfo 是 "No data!" 字符串，offset 取首字母 "N" → 两个分支都不命中。
		licenseOne := isNumeric(gi.license) && leadingNumber(gi.license) == 1
		if (gi.userType == 1 && gi.certify != 1) || (gi.userType == 2 && !licenseOne) {
			// info 非空（isset 为真）时 201/202 原样透传；info 是 null（cfg 未配置）时
			// isset 为假 → 外层按「无 state 键」包成 {state:100, info:{state:201, info:null}}。
			if s.memberVerifiedInfo == nil {
				return ajax.Response{State: ajax.StateOK, Info: ajax.Response{State: 201}}, true
			}
			return ajax.Response{State: 201, Info: s.memberVerifiedInfo}, true
		}
	}
	if s.memberBindPhone != 0 {
		// (!$phone || !$phoneCheck || (周期开关 && phoneBindTime && time()-phoneBindTime > cycle))
		cycle := int64(s.periodicCheckCycle) * 86400
		now := s.now().Unix()
		if gi.missing {
			// 会员行缺失：phone/phoneCheck 取首字母 "N"（真值），phoneBindTime "N" 数值化成 0
			// → 周期开关开着时 time()-0 > cycle 恒真 → 202「请先验证手机号码」（info 非空，
			// isset 为真 → 原样透传）；周期关着时门禁整体放行。
			if s.periodicCheckPhone != 0 && now > cycle {
				phoneDue := infoVerifyPhone
				return ajax.Response{State: 202, Info: &phoneDue}, true
			}
		} else {
			periodicDue := s.periodicCheckPhone != 0 && gi.phoneBind != 0 && now-gi.phoneBind > cycle
			if !truthyStr(gi.phone) || !truthyStr(gi.phoneCheck) || periodicDue {
				info := s.memberBindPhoneInfo
				if periodicDue {
					phoneDue := infoVerifyPhone
					info = &phoneDue
				}
				if info == nil {
					return ajax.Response{State: ajax.StateOK, Info: ajax.Response{State: 202}}, true
				}
				return ajax.Response{State: 202, Info: info}, true
			}
		}
	}
	return ajax.Response{}, false
}

// gateFields 是 getMemberInfo($userid)（委托 member.detail）里实名/手机门禁用到的字段投影。
// 会员不存在（state/mtype 不匹配）时 member.detail 返回空数组 → 外层包成 102 "No data!"，
// $userinfo 是字符串：offset 取首字母 "N"（真值、数值化为 0）——用 missing 表示这个状态，
// 门禁按字符串语义走（见 replyComment 里的分支）；license 为空串时 licenseOne 恒假。
type gateFields struct {
	missing    bool
	userType   int64  // busiState 真值 ? (int)mtype : 1（member.class.php:706）
	certify    int64  // (int)certifyState
	license    string // mtype==2 时是 (int) 后的字符串，否则原值
	phone      string // trim 后去引号/换行；null → 空串
	phoneCheck string // 原值
	phoneBind  int64  // (int)phoneBindTime
}

func (s *Service) gateFields(ctx context.Context, userid int64) (gateFields, error) {
	var gi gateFields
	var mtype, certify, license, phone, phoneCheck, phoneBind sql.NullString
	err := s.db.QueryRowContext(ctx,
		"SELECT `mtype`, `certifyState`, `licenseState`, `phone`, `phoneCheck`, `phoneBindTime` FROM "+s.memberTable+
			" WHERE `state` = 1 AND `mtype` != 0 AND `mtype` != 3 AND `id` = ?", userid).
		Scan(&mtype, &certify, &license, &phone, &phoneCheck, &phoneBind)
	if err == sql.ErrNoRows {
		return gateFields{missing: true}, nil
	}
	if err != nil {
		return gi, err
	}

	// mtype==2 时 detail 会查 business_list 首行 state 当 busiState（uid = id AND state != 4），
	// 查不到/查询失败按 0；userType 在 busiState 为假时强制回 1。
	busiState := int64(0)
	if phpIntval(mtype.String) == 2 {
		var state sql.NullString
		qerr := s.db.QueryRowContext(ctx,
			"SELECT `state` FROM "+s.businessListTable+" WHERE `uid` = ? AND `state` != 4", userid).Scan(&state)
		if qerr == nil && truthyStr(state.String) {
			busiState = int64(phpIntval(state.String))
		}
	}

	gi.certify = int64(phpIntval(certify.String))
	gi.license = license.String
	if mtype.Valid && phpIntval(mtype.String) == 2 {
		gi.license = strconv.Itoa(phpIntval(license.String))
	}
	if phone.Valid { // detail：真值时 trim + 去引号/换行，否则原值（Go 侧只留真值语义）
		v := strings.NewReplacer("'", "", "\"", "", "\r", "", "\n", "").Replace(strings.TrimSpace(phone.String))
		gi.phone = v
	}
	gi.phoneCheck = phoneCheck.String
	gi.phoneBind = int64(phpIntval(phoneBind.String))
	gi.userType = int64(phpIntval(mtype.String))
	if busiState == 0 {
		gi.userType = 1
	}
	return gi, nil
}

// isAndroidAppUA 复刻 common.func.php:4348 的 isAndroidApp()：UA 含 huoniao 与 android
// 且不含 harmony（大小写不敏感）。
func isAndroidAppUA(req *http.Request) bool {
	if req == nil {
		return false
	}
	ua := strings.ToLower(req.Header.Get("User-Agent"))
	// strpos(ua, 'harmony') == false 在 PHP 里命中「不存在」和「位置 0」两种情况，
	// 只有 harmony 出现在位置 > 0 才排除安卓 App。
	harmony := strings.Index(ua, "harmony")
	return strings.Contains(ua, "huoniao") && strings.Contains(ua, "android") && (harmony < 0 || harmony == 0)
}
