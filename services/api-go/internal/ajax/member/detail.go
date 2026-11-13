package member

import (
	"context"
	"crypto/md5"
	"crypto/rand"
	"database/sql"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"math"
	"net"
	"net/http"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/fburl"
)

// 迁移自 member.class.php detail()（124-1228），issue #253。
//
// 与直觉不符、但必须照搬的 PHP 行为：
//   - userType 收尾被 `busiState ? userType : 1` 覆盖：非商家、simple=1、以及未登录看商家
//     一律输出 1；只有「已登录 + mtype=2 + 非 simple + business_list.state 真值」才是 2。
//   - 消费金（usebonus/monBonus/surplusbonus）按「当前登录者」而不是被查看会员统计。
//   - surplusbonus 先 sprintf("%.2f")，随后 `+= 退款金额` 变回数字，最终永远是 number。
//   - emailEncrypt 的第三组是 (.*?) 非贪婪、匹配空串，preg_replace 只吃掉 "abc@" 这一小段，
//     域名原样留在后面 → 结果是 "abc***@example.com"（不是常见打码，也没有丢域名）。
//   - friend 分支在主表查不到时仍然执行：id 不存在 + friend=1 返回 100 {"isfriend":0}。
//   - 主表查不到时返回空数组 → 外层 handlers 改写为 102 "No data!"。
//
// 未迁移依赖（命中时整条 action 返回 102，而不是编造数据；与 getComment 同一口径）：
//   - need_data（userQuanList / collectList / follow / upList / fabuStatistics 未迁移）；
//   - shop=1 且 userType==2（各模块 storeDetail 未迁移）；
//   - $_REQUEST['from']=homepage（fabuCount / getMemberModule / 圈子统计未迁移）。

const (
	normalLevelName = "普通会员" // siteConfig[21][31]
	noPhotoPath     = "/static/images/noPhoto_100.jpg"
	// phpEncryptKey 与 charset.class.php:560 的 RenrenCrypt 密钥一致；
	// Dep.CryptKey 非空时以注入值为准（identity 已支持 FB_RENREN_CRYPT_KEY 轮换）。
	phpEncryptKey = "KaCXPpoD1vyD[XUWwxhFhkXJulzS~u"
)

// errDetailNeedData 表示命中了尚未迁移的 need_data 依赖。
var errDetailNeedData = errors.New("member.detail: need_data 依赖尚未迁移")

var (
	idcardPattern = regexp.MustCompile(`([0-9]{5})[0-9]{11}(.*?)`)
	emailPattern  = regexp.MustCompile(`([0-9a-zA-Z]{3})(.*?)@(.*?)`)
	phonePattern  = regexp.MustCompile(`(1[34578][0-9])[0-9]{4}([0-9]{4})`)
	mobileUA      = regexp.MustCompile(`iphone|ios|android|mini|mobile|mobi|nokia|symbian|ipod|ipad|windows\s+phone|mqqbrowser|wp7|wp8|ucbrowser7|ucweb|360\s+aphone\s+browser|applewebkit|cfnetwork|harmony`)
)

// needDataKeys 是 PHP need_data 里逐个 in_array 的键。
var needDataKeys = []string{"quan", "collect", "footPrint", "fans", "follow", "fabu", "qiandao", "zan"}

// detailCols 是 detail() 引用到的全部 member 列（PHP 用 SELECT *，这里显式列出便于 sqlmock 校验）。
const detailCols = "`id`, `password`, `paypwd`, `idcardFront`, `idcardBack`, `mtype`, `level`, " +
	"`certifyState`, `nation`, `licenseState`, `promotion`, `birthday`, `lastloginipaddr`, `expired`, " +
	"`username`, `realname`, `delivery_count`, `certifyInfo`, `idcard`, `paypwdCheck`, `email`, " +
	"`emailCheck`, `areaCode`, `phone`, `phoneCheck`, `phoneBindTime`, `qq`, `regtime`, `regip`, " +
	"`regipaddr`, `lastlogintime`, `lastloginip`, `tempbg`, `pctempbg`, `mtempbgurl`, `is_editname`, " +
	"`noawardlegoutime`, `is_noawardlegou`, `nickname_audit`, `nickname_state`, `photo_audit`, " +
	"`photo_state`, `money`, `freeze`, `bonus`, `point`, `company`, `nickname`, `photo`, `sex`, " +
	"`wechat_subscribe`, `online`, `cityid`, `addr`, `description`, `last_level`, `last_expired`, " +
	"`wechat_conn`, `wechat_openid`, `wechat_mini_openid`, `alipay_conn`, `zhaopin_company`, " +
	"`zhaopin_resume`, `license`, `address`, `licenseInfo`"

// memberDetailCols 与 detailCols 顺序一致，供测试构造 sqlmock 行。
var memberDetailCols = []string{
	"id", "password", "paypwd", "idcardFront", "idcardBack", "mtype", "level",
	"certifyState", "nation", "licenseState", "promotion", "birthday", "lastloginipaddr", "expired",
	"username", "realname", "delivery_count", "certifyInfo", "idcard", "paypwdCheck", "email",
	"emailCheck", "areaCode", "phone", "phoneCheck", "phoneBindTime", "qq", "regtime", "regip",
	"regipaddr", "lastlogintime", "lastloginip", "tempbg", "pctempbg", "mtempbgurl", "is_editname",
	"noawardlegoutime", "is_noawardlegou", "nickname_audit", "nickname_state", "photo_audit",
	"photo_state", "money", "freeze", "bonus", "point", "company", "nickname", "photo", "sex",
	"wechat_subscribe", "online", "cityid", "addr", "description", "last_level", "last_expired",
	"wechat_conn", "wechat_openid", "wechat_mini_openid", "alipay_conn", "zhaopin_company",
	"zhaopin_resume", "license", "address", "licenseInfo",
}

type rowMap map[string]sql.NullString

func (r rowMap) s(k string) string { return r[k].String }

// v 输出 PDO 的原始值：NULL → nil，其余是字符串（PDO 默认模拟预处理，整数也返回字符串）。
func (r rowMap) v(k string) any {
	if !r[k].Valid {
		return nil
	}
	return r[k].String
}

// detail 迁移自 detail()。action 入口不带参数，$uid/$isloginUser/$simple 全部走 $this->param。
func (s *Service) detail(req *ajax.Request) ajax.Response {
	if s.db == nil {
		return noData()
	}
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	p := newParams(req)

	viewer, err := s.identityID(ctx, req.HTTP)
	if err != nil {
		return noData()
	}

	id := int64(p.detailID())
	if id == 0 && viewer > 0 {
		id = viewer
	}
	simple := p.intval("simple") != 0

	// `is_array($_param) && ($_param['shop'] || $_param['friend'] || $_param['from'] || $_param['userkey'])`
	shop, friend, from := 0, 0, 0
	if p.truthyKey("shop") || p.truthyKey("friend") || p.truthyKey("from") || p.hasKey("userkey") {
		shop, friend, from = p.intval("shop"), p.intval("friend"), p.intval("from")
		if p.hasKey("userkey") {
			// 查不到时 PHP 执行 `$id = $id['id']`（int 取下标）→ null → 0。
			id = s.memberIDByUserkey(ctx, p.scalar("userkey"))
		} else {
			id = int64(p.detailID())
		}
	}

	if id <= 0 {
		return fail(infoLoginTimeout)
	}

	built, err := s.buildDetail(ctx, req.HTTP, id, simple, viewer, p.scalar("need_data"))
	if err != nil {
		return noData()
	}

	var core *Object
	userType := 1
	if built != nil {
		core = built.obj
		userType = built.userType
	}

	// 好友校验：主表查不到也执行（PHP 在 if($results) 之外）。
	if friend != 0 {
		who := from
		if who == 0 {
			who = int(viewer)
		}
		isfriend := 0
		var delfrom, delto sql.NullString
		err := s.db.QueryRowContext(ctx,
			"SELECT `delfrom`, `delto` FROM "+s.friendTable+" WHERE ((`fid` = ? AND `tid` = ?) OR (`fid` = ? AND `tid` = ?)) AND `state` = 1 AND `delfrom` = 0 AND `delto` = 0",
			who, id, id, who).Scan(&delfrom, &delto)
		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			return noData()
		}
		if err == nil && !truthyPHP(delfrom) && !truthyPHP(delto) {
			isfriend = 1
		}
		if core == nil {
			core = NewObject()
		}
		core.Set("isfriend", isfriend)
	}

	// 店铺列表依赖各模块 storeDetail（未迁移），命中即降级。
	if shop != 0 && !simple && built != nil && userType == 2 {
		return noData()
	}

	// 个人主页数据依赖 fabuCount / getMemberModule 等未迁移 action。
	if requestString(req.HTTP, "from") == "homepage" {
		if built != nil {
			return noData()
		}
		// 主表查不到时 PHP 的 homepageData 是空数组。
		if core == nil {
			core = NewObject()
		}
		core.Set("homepageData", []any{})
	}

	if core == nil {
		return noData()
	}
	return ajax.Response{State: ajax.StateOK, Info: core}
}

// userDetailHook 是 Dep.UserDetail 的默认实现（New 里自接线）。
//
// 对应 getComment 的 `$this->param = <userid>; $user = $this->detail();`：
// param 是标量，simple/shop/friend 全为 0，只走主投影。
// 返回值与 PHP 一致：查不到 → []；id<=0 → {"state":200,"info":"登录超时..."}。
func (s *Service) userDetailHook(ctx context.Context, req *http.Request, id string, valid bool) (any, error) {
	if s.db == nil {
		return []any{}, nil
	}
	viewer, err := s.identityID(ctx, req)
	if err != nil {
		return nil, err
	}
	n := int64(0)
	if valid {
		n = int64(phpIntval(id))
	}
	// PHP：!$id && $userid > 0 → 取登录会员（内部调用时同样如此）。
	if n == 0 && viewer > 0 {
		n = viewer
	}
	if n <= 0 {
		o := NewObject()
		o.Set("state", 200)
		o.Set("info", infoLoginTimeout)
		return o, nil
	}
	built, err := s.buildDetail(ctx, req, n, false, viewer, "")
	if err != nil {
		return nil, err
	}
	if built == nil {
		return []any{}, nil
	}
	return built.obj, nil
}

type builtDetail struct {
	obj      *Object
	userType int
}

// buildDetail 复刻 detail() 在 $results 命中后的整段拼装（ksort 之前）。
// 返回 (nil,nil) 表示会员不存在。
func (s *Service) buildDetail(ctx context.Context, req *http.Request, id int64, simple bool, viewer int64, needData string) (*builtDetail, error) {
	// need_data 全部依赖本类其它 action（未迁移）；只有登录者本人会走到这段。
	// 提前降级，避免跑完一半查询再丢弃结果。
	if viewer == id && hasNeedData(needData) {
		return nil, errDetailNeedData
	}
	row, found, err := s.loadMember(ctx, id)
	if err != nil || !found {
		return nil, err
	}

	now := s.now()
	host := ""
	if req != nil {
		host = req.Host
	}
	base := s.baseURL(ctx, host)
	attach := func(p string) string {
		if p == "" {
			return ""
		}
		return base + "/include/attachment.php?f=" + p
	}
	file := func(p string) string {
		if !truthyStr(p) {
			return ""
		}
		if s.files == nil {
			return p
		}
		u, err := s.files.File(ctx, p, fburl.Options{Host: host})
		if err != nil {
			return ""
		}
		return u
	}
	urlPath := func(p fburl.Params) string {
		if s.files == nil {
			return ""
		}
		u, err := s.files.URL(ctx, p, fburl.Options{Host: host})
		if err != nil {
			return ""
		}
		return u
	}

	logged := viewer == id
	f := map[string]any{}
	r := row

	mtype := phpIntval(r.s("mtype"))

	f["userid"] = r.v("id")

	// —— 敏感字段：userid == id（isloginUser 在 ajax 路径恒 false）——
	if logged {
		// PHP: base64_encode(php_encrypt(...))，而 php_encrypt 自身已返回 base64 → 两层。
		f["userid_encode"] = base64.StdEncoding.EncodeToString(
			[]byte(s.encryptUserID(fmt.Sprintf("%d&%s", id, r.s("password")))))
		f["idcardFront"] = r.v("idcardFront")
		f["idcardBack"] = r.v("idcardBack")
		f["idcardFrontSource"] = attach(r.s("idcardFront"))
		f["idcardBackSource"] = attach(r.s("idcardBack"))
	}

	f["cookiePre"] = s.cookiePrefix + "login_user"
	f["userType"] = mtype
	f["level"] = phpIntval(r.s("level"))
	f["certifyState"] = phpIntval(r.s("certifyState"))
	f["nation"] = r.v("nation")

	levelName := any(normalLevelName)
	levelIcon := ""
	privilege := any([]any{})

	// `$results[0]['level'] && !$simple`
	if truthyPHP(r["level"]) && !simple {
		var name, icon, priv sql.NullString
		err := s.db.QueryRowContext(ctx,
			"SELECT `name`, `icon`, `privilege` FROM "+s.levelTable+" WHERE `id` = ?",
			phpIntval(r.s("level"))).Scan(&name, &icon, &priv)
		if err == nil {
			if name.Valid {
				levelName = name.String
			} else {
				levelName = nil
			}
			if priv.String != "" {
				if v := unserializeValue(priv.String); v != false {
					privilege = v
				} else {
					privilege = false
				}
			}
			if icon.String != "" {
				levelIcon = attach(icon.String)
			}
		}
		// 查询失败与查不到同样处理：保留默认值（PHP 的 dsqlOper 失败也返回空）。
	}

	f["licenseState"] = r.v("licenseState") // mtype=2 且登录时下面覆盖成 int
	f["promotion"] = phpFloatValue(r.s("promotion"))
	f["birthday"] = r.v("birthday")
	f["iphome"] = getIPHome(r.s("lastloginipaddr"), s.ipHomeMode)

	if logged {
		f["privilege"] = privilege
		f["expired"] = phpIntval(r.s("expired"))
		f["username"] = r.v("username")
		f["realname"] = r.v("realname")
		f["delivery_count"] = r.v("delivery_count")
		pwd := 0
		if truthyPHP(r["password"]) {
			pwd = 1
		}
		f["pwd"] = pwd
		f["certifyInfo"] = r.v("certifyInfo")
		f["idcard"] = idcardPattern.ReplaceAllString(r.s("idcard"), "$1*************$2")
		f["paypwdCheck"] = r.v("paypwdCheck")
		f["email"] = r.v("email")
		f["emailEncrypt"] = emailPattern.ReplaceAllString(r.s("email"), "$1***@$3")
		f["emailCheck"] = r.v("emailCheck")
		areaCode := any("86")
		if !phpEmptyString(r.s("areaCode")) {
			areaCode = r.v("areaCode")
		}
		f["areaCode"] = areaCode
		phone := normalizePhone(r.s("phone"))
		f["phone"] = phone
		f["phoneEncrypt"] = phonePattern.ReplaceAllString(phone, "$1****$2")
		f["phoneCheck"] = r.v("phoneCheck")
		f["phoneBindTime"] = phpIntval(r.s("phoneBindTime"))
		f["qq"] = r.v("qq")

		msgnum := 0
		if !simple {
			var n sql.NullInt64
			err := s.db.QueryRowContext(ctx,
				"SELECT count(log.`id`) totalCount FROM "+s.logTable+" log LEFT JOIN "+s.letterTable+
					" l ON l.`id` = log.`lid` WHERE log.`state` = 0 AND l.`type` = 0 AND log.`uid` = ?", id).Scan(&n)
			if err == nil {
				msgnum = int(n.Int64)
			}
		}
		f["message"] = msgnum

		f["regtime"] = phpDateTime(phpInt64(r.s("regtime")))
		f["regtimeold"] = r.v("regtime")
		f["regip"] = r.v("regip")
		f["regipaddr"] = r.v("regipaddr")
		lastLogin := ""
		if truthyPHP(r["lastlogintime"]) {
			lastLogin = phpDateTime(phpInt64(r.s("lastlogintime")))
		}
		f["lastlogintime"] = lastLogin
		f["lastloginip"] = r.v("lastloginip")
		f["lastloginipaddr"] = r.v("lastloginipaddr")
		f["tempbg"] = r.v("tempbg")
		f["pctempbg"] = r.v("pctempbg")
		f["mtempbgurl"] = r.v("mtempbgurl")
		f["is_editname"] = r.v("is_editname")
		f["noawardlegoutime"] = r.v("noawardlegoutime")
		f["is_noawardlegou"] = r.v("is_noawardlegou")

		if !simple {
			s.addBonusFields(ctx, viewer, now, f)
		}

		f["nickname_audit"] = r.v("nickname_audit")
		f["nickname_state"] = r.v("nickname_state")
		f["photo_audit"] = attach(r.s("photo_audit"))
		f["photo_state"] = r.v("photo_state")
	}

	f["money"] = phpFloatValue(r.s("money"))
	f["freeze"] = phpFloatValue(r.s("freeze"))
	f["bonus"] = phpFloatValue(r.s("bonus"))
	point := 0
	if s.pointState {
		point = phpIntval(r.s("point"))
	}
	f["point"] = point

	f["levelName"] = levelName
	f["levelIcon"] = levelIcon

	if mtype == 2 {
		nickname := r.v("nickname")
		if truthyPHP(r["company"]) {
			nickname = r.v("company")
		}
		f["nickname"] = nickname
		f["person"] = r.v("realname")
	} else {
		f["nickname"] = r.v("nickname")
	}

	if truthyPHP(r["photo"]) {
		if strings.Contains(r.s("photo"), "http") {
			f["photo"] = r.s("photo")
		} else {
			f["photo"] = file(r.s("photo"))
		}
	} else {
		f["photo"] = attach(noPhotoPath)
	}
	f["photoSource"] = r.v("photo")
	f["sex"] = r.v("sex")
	f["wechat_subscribe"] = r.v("wechat_subscribe")
	if isAppRequest(req) {
		f["online"] = 1
	} else {
		f["online"] = r.v("online")
	}
	f["cityid"] = r.v("cityid")
	f["addrid"] = r.v("addr")
	f["description"] = strings.NewReplacer("\r\n", "<br />", "\r", "<br />", "\n", "<br />").Replace(r.s("description"))

	if !simple {
		f["addrName"] = s.addrName(ctx, r.s("addr"))
	}

	if logged {
		lastLevelName := ""
		if truthyPHP(r["last_level"]) && !simple {
			var name sql.NullString
			err := s.db.QueryRowContext(ctx,
				"SELECT `name` FROM "+s.levelTable+" WHERE `id` = ?", phpIntval(r.s("last_level"))).Scan(&name)
			if err == nil {
				lastLevelName = name.String
			}
		}
		f["last_levelName"] = lastLevelName
		lastExpired := phpIntval(r.s("last_expired"))
		f["last_expired"] = lastExpired

		levelValidity := ""
		switch {
		case phpIntval(r.s("expired")) != 0:
			levelValidity = "权益到期：" + time.Unix(int64(phpIntval(r.s("expired"))), 0).In(gmt8).Format("2006/01/02")
		case lastExpired != 0:
			days := int64(math.Ceil(float64(now.Unix()-int64(lastExpired)) / 86400))
			levelValidity = "已过期" + strconv.FormatInt(days, 10) + "天"
		}
		f["levelValidity"] = levelValidity

	}

	// —— 商家 / 员工扩展 ——
	isStaff := 0
	autharr := any([]any{})
	staffid := 0
	companyuid := 0
	hidePackage := any([]any{})
	// 注意：$detail['busiState'] 只在「已登录」时写入；未登录时收尾的
	// `userType = $detail['busiState'] ? ... : 1` 一定取 1（照搬）。
	var busiState sql.NullString
	busiStateSet := false

	if mtype == 2 {
		f["company"] = r.v("company")
		f["address"] = r.v("address")
		f["license"] = r.v("license")
		f["licenseSource"] = attach(r.s("license"))

		if logged {
			f["licenseState"] = phpIntval(r.s("licenseState"))
			f["licenseInfo"] = r.v("licenseInfo")
		}

		if !simple {
			var busiID, busiType, busiExpired, pkg, hide, sortPkg, diancan, dingzuo, paidui, maidan sql.NullString
			var bstate sql.NullString
			err := s.db.QueryRowContext(ctx,
				"SELECT `id`, `type`, `expired`, `state`, `package`, `hidePackage`, `sortPackage`, "+
					"`diancan_state`, `dingzuo_state`, `paidui_state`, `maidan_state` FROM "+s.businessTable+
					" WHERE `uid` = ? AND `state` != 4", id).
				Scan(&busiID, &busiType, &busiExpired, &bstate, &pkg, &hide, &sortPkg, &diancan, &dingzuo, &paidui, &maidan)
			if err == nil {
				f["busiId"] = busiID.String
				f["busiType"] = busiType.String
				if logged {
					busiState, busiStateSet = bstate, true
					f["busiState"] = bstate.String
					f["busiExpired"] = busiExpired.String
					f["hidePackage"] = explodeComma(hide.String)
				}
			} else {
				f["busiId"] = 0
				f["busiType"] = 0
			}
			companyID := 0
			if busiID.Valid {
				companyID = phpIntval(busiID.String)
			}
			f["companyUrl"] = urlPath(fburl.Params{
				{Key: "service", Value: "business"}, {Key: "template", Value: "detail"},
				{Key: "id", Value: strconv.Itoa(companyID)},
			})
		}
	} else if !simple {
		var sid, auth, uid sql.NullString
		err := s.db.QueryRowContext(ctx,
			"SELECT s.`id`, s.`auth`, l.`uid` FROM "+s.staffTable+" s LEFT JOIN "+s.businessTable+
				" l ON s.`sid` = l.`id` WHERE s.`uid` = ?", id).Scan(&sid, &auth, &uid)
		if err == nil {
			isStaff = 1
			staffid = phpIntval(sid.String)
			if auth.String != "" {
				autharr = unserializeValue(auth.String)
			}
			companyuid = phpIntval(uid.String)
		}
		f["hidePackage"] = hidePackage
	}

	// `$detail['userType'] = $detail['busiState'] ? $detail['userType'] : 1;`
	userType := 1
	if busiStateSet && truthyPHP(busiState) {
		userType = mtype
	}
	f["userType"] = userType
	f["companyuid"] = companyuid
	f["is_staff"] = isStaff
	f["autharr"] = autharr
	f["staffid"] = staffid

	if logged {
		total := 100
		if phpEmptyString(r.s("paypwd")) {
			total -= 20
		}
		if mtype == 1 && !looseEqOne(r["certifyState"]) {
			total -= 20
		} else if mtype == 2 && !looseEqOne(r["licenseState"]) {
			total -= 20
		}
		if !looseEqOne(r["phoneCheck"]) {
			total -= 20
		}
		if !looseEqOne(r["emailCheck"]) {
			total -= 20
		}
		if !simple {
			var n int
			err := s.db.QueryRowContext(ctx,
				"SELECT COUNT(*) FROM "+s.securityTable+" WHERE `uid` = ?", id).Scan(&n)
			if err != nil {
				n = 0
			}
			if n < 1 {
				total -= 20
				f["question"] = 0
			} else {
				f["question"] = 1
			}
		}
		f["security"] = total
	}

	if viewer == id {
		f["wechat_conn"] = r.v("wechat_conn")
		f["wechat_openid"] = r.v("wechat_openid")
		f["wechat_mini_openid"] = r.v("wechat_mini_openid")
		f["alipay_conn"] = r.v("alipay_conn")
		f["realname"] = r.v("realname")
	}

	datingUID := any(0)
	if !simple {
		var did sql.NullString
		err := s.db.QueryRowContext(ctx,
			"SELECT `id` FROM "+s.datingTable+" WHERE `userid` = ? AND `type` = 0 ORDER BY `id` ASC LIMIT 1", id).Scan(&did)
		if err == nil {
			datingUID = did.String
		}
	}
	f["dating_uid"] = datingUID

	f["zhaopin_company"] = phpIntval(r.s("zhaopin_company"))
	f["zhaopin_resume"] = phpIntval(r.s("zhaopin_resume"))

	// ksort($detail)：键按字母序输出。
	keys := make([]string, 0, len(f))
	for k := range f {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	o := NewObject()
	for _, k := range keys {
		o.Set(k, f[k])
	}
	return &builtDetail{obj: o, userType: userType}, nil
}

// hasNeedData 判断 need_data 是否含任一已实现之外的已知键。
func hasNeedData(raw string) bool {
	if raw == "" {
		return false
	}
	parts := strings.Split(raw, ",")
	for _, p := range parts {
		for _, k := range needDataKeys {
			if p == k {
				return true
			}
		}
	}
	return false
}

// loadMember 对应主查询；查不到返回 found=false。
func (s *Service) loadMember(ctx context.Context, id int64) (rowMap, bool, error) {
	rows, err := s.db.QueryContext(ctx,
		"SELECT "+detailCols+" FROM "+s.memberTable+
			" WHERE `state` = 1 AND `mtype` != 0 AND `mtype` != 3 AND `id` = ?", id)
	if err != nil {
		return nil, false, err
	}
	defer func() { _ = rows.Close() }()
	if !rows.Next() {
		return nil, false, rows.Err()
	}
	cols, err := rows.Columns()
	if err != nil {
		return nil, false, err
	}
	vals := make([]sql.NullString, len(cols))
	ptrs := make([]any, len(cols))
	for i := range vals {
		ptrs[i] = &vals[i]
	}
	if err := rows.Scan(ptrs...); err != nil {
		return nil, false, err
	}
	out := make(rowMap, len(cols))
	for i, c := range cols {
		out[c] = vals[i]
	}
	return out, true, nil
}

// addBonusFields 复刻本月消费金三键（含退款回加）。SQL 用的是登录者，不是被查看 id。
func (s *Service) addBonusFields(ctx context.Context, viewer int64, now time.Time, f map[string]any) {
	begin := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, gmt8).Unix()
	over := time.Date(now.Year(), now.Month()+1, 0, 0, 0, 0, 0, gmt8).Unix()

	bonusPrice := 0.0
	var sum sql.NullString
	err := s.db.QueryRowContext(ctx,
		"SELECT SUM(`amount`) bonusPrice FROM "+s.bonusTable+
			" WHERE `userid` = ? AND `date` >= ? AND `date` <= ? AND `type` = 0", viewer, begin, over).Scan(&sum)
	if err == nil {
		bonusPrice = phpFloatValue(sum.String)
	}

	monBonus := 0.0
	var payConfig sql.NullString
	err = s.db.QueryRowContext(ctx,
		"SELECT `pay_config` FROM "+s.paymentTable+" WHERE `pay_code` = 'huoniao_bonus'").Scan(&payConfig)
	if err == nil && payConfig.String != "" {
		if raw, ok := phpUnserializeRaw(payConfig.String); ok {
			if arr, ok := raw.(*phpArray); ok {
				if item, ok := phpArrayIndex(arr, 0); ok {
					if m, ok := item.(*phpArray); ok {
						if val, ok := m.get("value"); ok {
							monBonus = phpFloatValue(phpScalarString(val))
						}
					}
				}
			}
		}
	}

	f["usebonus"] = bonusPrice
	f["monBonus"] = monBonus

	refund := 0.0
	var tui sql.NullString
	err = s.db.QueryRowContext(ctx,
		"SELECT SUM(`amount`) amount FROM "+s.bonusTable+
			" WHERE `userid` = ? AND `date` >= ? AND `date` <= ? AND `info` like '%消费金退款%'", viewer, begin, over).Scan(&tui)
	if err == nil {
		refund = phpFloatValue(tui.String)
	}

	f["usebonus"] = bonusPrice - refund
	// PHP 先 sprintf("%.2f", $monBonus - $bonusPrice)（字符串，两位小数），
	// 再 += 退款金额（数字）→ 最终永远是 number，但小数位被 sprintf 截到两位。
	surplus := math.Round((monBonus-bonusPrice)*100) / 100
	f["surplusbonus"] = surplus + refund
}

// addrName 对应 getParentArr('site_area', addr) + parent_foreach + array_reverse + join。
func (s *Service) addrName(ctx context.Context, addr string) string {
	cur := phpIntval(addr)
	var names []string
	for depth := 0; cur > 0 && depth < 64; depth++ {
		var id, parent, typename sql.NullString
		err := s.db.QueryRowContext(ctx,
			"SELECT `id`, `parentid`, `typename`, `weight` FROM "+s.areaTable+
				" WHERE `id` = ?", cur).Scan(&id, &parent, &typename, new(sql.NullString))
		if err != nil {
			break
		}
		names = append(names, typename.String)
		if phpIntval(parent.String) == 0 {
			break
		}
		cur = phpIntval(parent.String)
	}
	for i, j := 0, len(names)-1; i < j; i, j = i+1, j-1 {
		names[i], names[j] = names[j], names[i]
	}
	return strings.Join(names, " > ")
}

// baseURL 是 $cfg_secureAccess.$cfg_basehost；与 siteconfig/article 的取法一致。
func (s *Service) baseURL(ctx context.Context, host string) string {
	if s.files != nil {
		if b, err := s.files.Domain(ctx, "", 0, false, fburl.Options{Host: host}); err == nil {
			return b
		}
	}
	if h, _, err := net.SplitHostPort(host); err == nil {
		host = h
	}
	return "http://" + host
}

// memberIDByUserkey 复刻 detail() 的 userkey 分支；只用于覆盖被查看的 id。
// 失败/查不到一律返回 0（PHP 对 int 取下标得到 null）。
// userkey 是 base64(php_encrypt(...))，而 php_encrypt 自身也返回 base64，
// 所以 PHP 的 php_decrypt(base64_decode($userkey)) 实际解两层。
func (s *Service) memberIDByUserkey(ctx context.Context, userkey string) int64 {
	if !truthyStr(userkey) {
		return 0
	}
	inner := phpBase64Decode(userkey)
	raw := phpBase64Decode(string(inner))
	plain := renrenDecrypt(raw, s.cryptKey)
	openid := strings.Split(plain, "@@@@")[0]
	var id sql.NullString
	err := s.db.QueryRowContext(ctx,
		"SELECT `id` FROM "+s.memberTable+" WHERE `wechat_mini_openid` = ?", openid).Scan(&id)
	if err != nil {
		return 0
	}
	return int64(phpIntval(id.String))
}

// encryptUserID 复刻 RenrenCrypt::php_encrypt：随机 md5 盐 + 逐字节异或 + 二次 __key，
// 最后和 PHP 一样自带一层 base64（调用方还会再 base64 一次）。
func (s *Service) encryptUserID(txt string) string {
	buf := make([]byte, 16)
	if _, err := rand.Read(buf); err != nil {
		return base64.StdEncoding.EncodeToString([]byte(txt))
	}
	sum := md5.Sum(buf)
	key := hex.EncodeToString(sum[:])
	var tmp []byte
	ctr := 0
	for i := 0; i < len(txt); i++ {
		if ctr == len(key) {
			ctr = 0
		}
		tmp = append(tmp, key[ctr], txt[i]^key[ctr])
		ctr++
	}
	return base64.StdEncoding.EncodeToString(renrenXORKey(tmp, s.cryptKey))
}

// phpBase64Decode 对应 PHP 非 strict 的 base64_decode：忽略字母表外字符、不要求补齐 '='。
// 只剩一个有效字符时 PHP 返回空串（不是 false），这里等价返回空切片。
func phpBase64Decode(s string) []byte {
	const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
	var idx [256]int8
	for i := range idx {
		idx[i] = -1
	}
	for i := 0; i < len(alphabet); i++ {
		idx[alphabet[i]] = int8(i)
	}
	var out []byte
	var acc uint32
	bits, n := 0, 0
	for i := 0; i < len(s); i++ {
		c := s[i]
		if c == '=' {
			continue
		}
		v := idx[c]
		if v < 0 {
			continue
		}
		n++
		acc = acc<<6 | uint32(v)
		bits += 6
		if bits >= 8 {
			bits -= 8
			out = append(out, byte(acc>>uint(bits)))
			acc &= 1<<uint(bits) - 1
		}
	}
	if n%4 == 1 {
		return nil
	}
	return out
}

// renrenXORKey 是 RenrenCrypt::__key：与 md5(key) 的十六进制串循环异或。
func renrenXORKey(txt, key []byte) []byte {
	sum := md5.Sum(key)
	ks := []byte(hex.EncodeToString(sum[:]))
	out := make([]byte, len(txt))
	ctr := 0
	for i := range txt {
		if ctr == len(ks) {
			ctr = 0
		}
		out[i] = txt[i] ^ ks[ctr]
		ctr++
	}
	return out
}

// renrenDecrypt 是 RenrenCrypt::php_decrypt（入参已 base64 解码）。
func renrenDecrypt(raw, key []byte) string {
	txt := renrenXORKey(raw, key)
	out := make([]byte, 0, len(txt)/2)
	for i := 0; i < len(txt); i++ {
		md := txt[i]
		i++
		if i >= len(txt) {
			break
		}
		out = append(out, txt[i]^md)
	}
	return string(out)
}

// —— PHP 值语义小工具 ——

func truthyPHP(v sql.NullString) bool { return v.Valid && v.String != "" && v.String != "0" }

// phpEmptyString 对应 empty($str)：NULL、""、"0" 为真。
func phpEmptyString(s string) bool { return s == "" || s == "0" }

func phpInt64(s string) int64 { return int64(phpIntval(s)) }

// phpFloatValue 对应 (float)$str：取数字前缀，"abc"→0。
func phpFloatValue(s string) float64 {
	m := numberPrefix.FindString(s)
	if m == "" {
		return 0
	}
	f, err := strconv.ParseFloat(strings.TrimLeft(m, " \t\n\r\v\f"), 64)
	if err != nil {
		return 0
	}
	return f
}

// looseEqOne 对应 `$v == 1`（PDO 字符串）。
func looseEqOne(v sql.NullString) bool {
	if !v.Valid {
		return false
	}
	s := strings.TrimSpace(v.String)
	if !isNumeric(s) {
		return false
	}
	f, err := strconv.ParseFloat(s, 64)
	return err == nil && f == 1
}

func phpDateTime(ts int64) string {
	return time.Unix(ts, 0).In(gmt8).Format("2006-01-02 15:04:05")
}

func explodeComma(s string) []any {
	parts := strings.Split(s, ",")
	out := make([]any, len(parts))
	for i, p := range parts {
		out[i] = p
	}
	return out
}

// normalizePhone 对应
// `$phone = $phone ? preg_replace('/(\'|\")/', ”, str_replace(PHP_EOL, ”, trim($phone))) : $phone;`
func normalizePhone(s string) string {
	if phpEmptyString(s) {
		return s
	}
	s = strings.Trim(s, phpTrimChars)
	s = strings.ReplaceAll(s, "\n", "")
	return strings.NewReplacer("'", "", `"`, "").Replace(s)
}

// —— PHP unserialize（N/b/i/d/s/a），privilege 与 pay_config 用 ——

type phpArray struct {
	keys []any
	vals []any
}

func (a *phpArray) get(k string) (any, bool) {
	for i, key := range a.keys {
		if fmt.Sprint(key) == k {
			return a.vals[i], true
		}
	}
	return nil, false
}

func phpArrayIndex(v any, i int) (any, bool) {
	a, ok := v.(*phpArray)
	if !ok || i < 0 || i >= len(a.vals) {
		return nil, false
	}
	return a.vals[i], true
}

type phpUnser struct {
	s string
	i int
}

func (p *phpUnser) until(c byte) (string, bool) {
	j := strings.IndexByte(p.s[p.i:], c)
	if j < 0 {
		return "", false
	}
	out := p.s[p.i : p.i+j]
	p.i += j + 1
	return out, true
}

func (p *phpUnser) expect(lit string) bool {
	if strings.HasPrefix(p.s[p.i:], lit) {
		p.i += len(lit)
		return true
	}
	return false
}

func (p *phpUnser) value() (any, bool) {
	if p.i+1 >= len(p.s) {
		return nil, false
	}
	t := p.s[p.i]
	switch t {
	case 'N':
		return nil, p.expect("N;")
	case 'b', 'i', 'd':
		if !p.expect(string(t) + ":") {
			return nil, false
		}
		tok, ok := p.until(';')
		if !ok {
			return nil, false
		}
		switch t {
		case 'b':
			return tok == "1", tok == "0" || tok == "1"
		case 'i':
			n, err := strconv.ParseInt(tok, 10, 64)
			return n, err == nil
		default:
			f, err := strconv.ParseFloat(tok, 64)
			return f, err == nil
		}
	case 's':
		if !p.expect("s:") {
			return nil, false
		}
		ln, ok := p.until(':')
		n, err := strconv.Atoi(ln)
		if !ok || err != nil || n < 0 || !p.expect(`"`) || p.i+n > len(p.s) {
			return nil, false
		}
		str := p.s[p.i : p.i+n]
		p.i += n
		if !p.expect(`";`) {
			return nil, false
		}
		return str, true
	case 'a':
		if !p.expect("a:") {
			return nil, false
		}
		cnt, ok := p.until(':')
		n, err := strconv.Atoi(cnt)
		if !ok || err != nil || n < 0 || !p.expect("{") {
			return nil, false
		}
		arr := &phpArray{}
		for k := 0; k < n; k++ {
			key, ok := p.value()
			if !ok {
				return nil, false
			}
			switch key.(type) {
			case string, int64:
			default:
				return nil, false
			}
			val, ok := p.value()
			if !ok {
				return nil, false
			}
			arr.keys = append(arr.keys, key)
			arr.vals = append(arr.vals, val)
		}
		return arr, p.expect("}")
	}
	return nil, false
}

// unserializeValue 对应 unserialize()：失败返回 false（PHP 的 false）；
// 顺序数组 → JSON 数组，关联数组 → 有序对象。
func unserializeValue(s string) any {
	v, ok := phpUnserializeRaw(s)
	if !ok {
		return false
	}
	return phpJSONValue(v)
}

// phpUnserializeRaw 返回未转换的 phpArray 树，供需要按下标取值的调用方使用。
func phpUnserializeRaw(s string) (any, bool) {
	p := &phpUnser{s: s}
	v, ok := p.value()
	if !ok || p.i != len(p.s) {
		return nil, false
	}
	return v, true
}

func phpJSONValue(v any) any {
	a, ok := v.(*phpArray)
	if !ok {
		return v
	}
	seq := true
	for i, k := range a.keys {
		if n, ok := k.(int64); !ok || n != int64(i) {
			seq = false
			break
		}
	}
	if seq {
		out := make([]any, len(a.vals))
		for i, x := range a.vals {
			out[i] = phpJSONValue(x)
		}
		return out
	}
	o := NewObject()
	for i, k := range a.keys {
		o.Set(fmt.Sprint(k), phpJSONValue(a.vals[i]))
	}
	return o
}

// phpScalarString 只用于 unserialize 出来的标量转字符串（避免与 comment.go 的 phpString 重名）。
func phpScalarString(v any) string {
	switch x := v.(type) {
	case nil:
		return ""
	case string:
		return x
	case int64:
		return strconv.FormatInt(x, 10)
	case float64:
		return strconv.FormatFloat(x, 'f', -1, 64)
	case bool:
		if x {
			return "1"
		}
		return ""
	}
	return fmt.Sprint(v)
}

// —— 请求参数辅助 ——

// detailID 对应 ajax.php 对 id 做 convertArrToStrWithComma 后再取 (int)。
func (p params) detailID() int {
	if arr, ok := p.array("id"); ok {
		return phpIntval(convertArrToStrWithComma("", arr, true))
	}
	return phpIntval(convertArrToStrWithComma(p.scalar("id"), nil, false))
}

func (p params) hasKey(key string) bool {
	if _, ok := p.req.Params[key]; ok {
		return true
	}
	_, ok := p.req.Params[key+"[]"]
	return ok
}

// truthyKey 复刻 PHP 对数组项的真值判断（""、"0" 为假；非空数组为真）。
func (p params) truthyKey(key string) bool {
	if arr, ok := p.array(key); ok {
		return len(arr) > 0
	}
	v := p.scalar(key)
	return v != "" && v != "0"
}

// requestString 对应 $_REQUEST[key]：GET < POST < COOKIE（#233 的裁决）。
func requestString(req *http.Request, key string) string {
	if req == nil {
		return ""
	}
	if c, err := req.Cookie(key); err == nil {
		return c.Value
	}
	return req.URL.Query().Get(key)
}

// isAppRequest 复刻 isAndroidApp / isIOSApp / isHarmonyApp。
func isAppRequest(req *http.Request) bool {
	if req == nil {
		return false
	}
	ua := strings.ToLower(req.UserAgent())
	hasHuoniao := strings.Contains(ua, "huoniao")
	hasAndroid := strings.Contains(ua, "android")
	hasHarmony := strings.Contains(ua, "harmony")
	if hasHuoniao && hasAndroid && !hasHarmony {
		return true
	}
	if hasHuoniao && hasHarmony {
		return true
	}
	if strings.Contains(ua, "huoniao_ios") && !hasAndroid && !hasHarmony {
		return true
	}
	query := strings.ToLower(req.URL.RawQuery)
	if isMobileRequest(ua, req) && (strings.Contains(query, "appfullscreen") || strings.Contains(query, "appindex")) &&
		strings.Index(ua, "iphone") > 0 && !hasAndroid && !hasHarmony {
		return true
	}
	return strings.Contains(ua, "cfnetwork") && strings.Contains(ua, "darwin")
}

// isMobileRequest 复刻 isMobile()（Cookie HN_tg=1 也算移动端）。
func isMobileRequest(ua string, req *http.Request) bool {
	if req != nil {
		if c, err := req.Cookie("HN_tg"); err == nil && c.Value == "1" {
			return true
		}
	}
	return mobileUA.MatchString(ua)
}
