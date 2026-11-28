package travel

// 批次5（#374）：订单读与轻写 7 个 action。
//
// 来源（webroot/api/handlers/travel.class.php）：
//   orderList       L7433-7758（读）
//   orderDetail     L7805-8069（读）
//   checkPayAmount  L6637-6711（读，涉及资金字段展示）
//   payCheck        L6717-6800（读）
//   verifyQuan      L8576-8702（读）
//   delOrder        L7764-7799（写·删行，只做 L1）
//   oneKeyContinued L9147-9248（写·续住 INSERT，只做 L1）
//
// 通用语义（#374 规则评论）：
//   - aesDecrypt 在无 cfg_aes_key 环境（canary/本地）恒等返回。
//   - staff 分支（is_staff/companyuid）与 userType==2 verifyModuleAuth 沿用 #371
//     先例不复刻（非 staff 用户行为完全一致）。
//   - PHP return array("state"=>200/101,..) → 外层 101（respFail）；plain string →
//     100/info；返回 null → 102 No data。
//   - payurl / oneKeyContinued 的 base64(php_encrypt(..)) 盐随机 → L2 逐字节必漂移，
//     compare 用例 ignoreFields 掉或只取已付单。
//   - orderList 的 state 过滤 PHP 是裸拼接（注入面），Go 侧按 phpInt 参数化（非数字
//     state 的 PHP SQL 报错分支不复刻，记为已知偏差）。

import (
	"context"
	"crypto/md5"
	"crypto/rand"
	"crypto/sha1"
	"database/sql"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"math"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/fburl"
)

// —— 文案常量（zh-CN 语言包运行值快照）——
const (
	infoLoginTimeout  = "登录超时，请重新登录！"       // siteConfig[20][262]
	infoOrderNumEmpty = "提交失败，订单号不能为空！"   // travel[13][15]
	infoPayPwdEmpty   = "请输入支付密码！"           // travel[13][16]
	infoPayPwdWrong   = "支付密码输入错误，请重试！"    // travel[13][19]
	infoBalanceShort  = "您的余额不足，支付失败！"      // travel[13][20]
	infoTitBalance    = "余额"                     // travel[13][21]
	infoUseOverPrefix = "您使用的"                  // travel[13][22]
	infoUseOverJoin   = "和"                       // travel[13][23]
	infoUseOverSuffix = "超出订单总费用，请重新输入要使用的" // travel[13][24]
	infoPayNoOrderNum = "订单号传递失败！"             // travel[13][25]
	infoMultiBadState = "订单中包含状态异常的订单，请确认后重试！" // travel[13][26]
	infoOneBadState   = "订单状态异常，请确认后重试！"       // travel[13][27]
	infoBuyOwnCompany = "企业会员不得购买自己公司的！"       // travel[13][28]
	infoMultiNoGoods  = "订单中包含不存在或已下架的商品，请确认后重试！" // travel[13][29]
	infoOneNoGoods    = "提交失败，您要购买的商品不存在或已下架！"   // travel[13][30]
	infoMultiNoOrder  = "订单中包含不存在的订单，请确认后重试！"     // travel[13][31]
	infoOneNoOrder    = "订单不存在或已删除，请确认后重试！"       // travel[13][32]
	infoMemberIDEmpty = "会员ID不得为空！"               // travel[13][35]
	infoDelOK         = "删除成功！"                    // travel[13][39]
	infoDelBadState   = "订单为不可删除状态！"              // travel[13][40]
	infoDelNoPerm     = "权限不足，请确认帐户信息后再进行操作！"   // travel[13][41]
	infoDelNoOrder    = "订单不存在，或已经删除！"             // travel[13][42]
	infoQuanUsedPre   = "验证失败，此券已于"                // travel[13][54]
	infoQuanUsedSuf   = "使用过了！"                    // travel[13][55]
	infoQuanExpired   = "验证失败，此券已经过期！"            // travel[13][56]
	infoQuanNoInfo    = "验证失败，信息不存在！"              // travel[13][57]
	infoQuanOK        = "验证成功，项目："                 // travel[13][58]
	infoQuanPwdWrong  = "密码错误，请与消费者确认提供的密码是否正确！" // travel[13][61]
	infoRoomNotFound  = "房间信息不存在"                  // travel[13][71]
	infoRoomSoldPre   = "该房间已出售，与"                 // travel[13][102]
	infoRoomSoldSuf   = "到期"                       // travel[13][103]
	infoBuyOwnTicket  = "企业会员不可以购买自己的门票！"         // travel[13][14]
	infoBalanceWord   = "余额"                       // siteConfig[19][363] / homemaking[9][43]
	infoPayDelivery   = "货到付款"                     // shop[5][80]
	infoPointWord     = "积分"                       // canary $cfg_pointName
	infoOrderFail     = "下单失败"                     // homemaking[9][99]
	infoQuanUnit      = "张"                         // travel[5][17]
)

// travelCryptKey 见 list_shared.go（RenrenCrypt 密钥，与 member 包 phpEncryptKey 同源）。

// pointRatio 对应 $cfg_pointRatio（pointsConfig.inc.php canary = 100）。
const pointRatio = 100.0

// —— 值工具 ——

// asString 复刻 PHP 变量的字符串插值：null → ""。
func asString(v any) string {
	switch t := v.(type) {
	case nil:
		return ""
	case string:
		return t
	case bool:
		if t {
			return "1"
		}
		return ""
	}
	return fmt.Sprintf("%v", v)
}

// phpEmptyAny 复刻 PHP empty()：nil / "" / "0" / false / 0 为空。
func phpEmptyAny(v any) bool {
	switch t := v.(type) {
	case nil:
		return true
	case string:
		return !truthy(t)
	case bool:
		return !t
	case float64:
		return t == 0
	case int:
		return t == 0
	case int64:
		return t == 0
	}
	return false
}

// fieldOf 复刻 PHP 的 $arr['k']（$arr 可为 *omap / map / []any / 字符串 / nil）。
func fieldOf(v any, k string) any {
	switch t := v.(type) {
	case *omap:
		if t == nil {
			return nil
		}
		return t.vals[k]
	case map[string]any:
		return t[k]
	case map[string]string:
		return t[k]
	}
	return nil
}

// —— 内部 detail 转调 ——

// detailCall 复刻 PHP 的 `$this->param = X; $this->xxxDetail();`：内部转调 detail
// action，返回值还原 PHP 内部视角：
//   - state 100 → Info（PHP 返回的数据数组）；
//   - state 102 → nil（PHP action 内部返回 falsy，empty($proDetail) 为真）；
//   - 其他（101）→ {state, info} omap（PHP 返回 array("state"=>..,"info"=>..)）。
func detailCall(req *ajax.Request, id string, h ajax.Handler) any {
	sub := &ajax.Request{Service: "travel", Action: "_internal", HTTP: req.HTTP}
	sub.Params = url.Values{}
	sub.Params.Set("id", id)
	sub.ParamsEscaped = sub.Params
	resp := h(sub)
	switch resp.State {
	case ajax.StateOK:
		return resp.Info
	case stateNoData:
		return nil
	default:
		m := newOmap()
		m.set("state", resp.State)
		m.set("info", resp.Info)
		return m
	}
}

// failOmap 构造 PHP array("state"=>200, "info"=>..)（payCheck/checkPayAmount 内部
// 传递用；作为 action 返回时用 respFail 包装）。
func failOmap(info string) *omap {
	m := newOmap()
	m.set("state", 200)
	m.set("info", info)
	return m
}

// —— 加密 / 哈希 / 时间 ——

// renrenEncryptOrder 复刻 RenrenCrypt::php_encrypt（member encryptUserID 同款算法：
// 随机 md5 盐 + 逐字节异或插入 + __key 二次异或，自带一层 base64）。
func renrenEncryptOrder(txt string) string {
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
	return base64.StdEncoding.EncodeToString(renrenXorKeyCopy(tmp, []byte(travelCryptKey)))
}

// renrenXorKeyCopy 是 RenrenCrypt::__key：与 md5(key) 的十六进制串循环异或。
func renrenXorKeyCopy(txt, key []byte) []byte {
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

// saltedHashOf 复刻 userLogin::_getSaltedHash：stored 前 7 位当盐，salt+sha1(salt+str)。
func saltedHashOf(str, stored string) string {
	n := 7
	if len(stored) < n {
		n = len(stored)
	}
	salt := stored[:n]
	sum := sha1.Sum([]byte(salt + str))
	return salt + hex.EncodeToString(sum[:])
}

// floorTimeN2 复刻 FloorTime($seconds, $n=2)：>7 天分支输出 "Y-m-d H:i:s"。
func floorTimeN2(sec int64, now time.Time) string {
	days := int64(math.Floor(float64(sec) / 86400))
	if days > 7 {
		return time.Unix(now.Unix()-sec, 0).In(gmt8).Format("2006-01-02 15:04:05")
	}
	return floorTime(sec, now)
}

// phpDateLocal 按 Etc/GMT-8 输出 date() 格式。
func phpDateLocal(sec int64, layout string) string {
	return time.Unix(sec, 0).In(gmt8).Format(layout)
}

// todayStart 复刻 GetMkTime(date('Y-m-d'))：今天 0 点（Etc/GMT-8）。
func todayStart() int64 {
	n := time.Now().In(gmt8)
	return time.Date(n.Year(), n.Month(), n.Day(), 0, 0, 0, 0, gmt8).Unix()
}

// phpGetMkTime 复刻 time.class.php GetMkTime()（codex 评审 P1 修复：specialtime
// 的 stime/etime 是日期串，phpInt 会把 "2026-11-29" 截成 2026）：
//   - 纯数字串原样返回（PHP return $dtime → 数值上下文）；
//   - 否则归一中文分隔符（年月日时分秒）与空白，按 Y-M-D [H:I:S]（点号日期兜底）
//     解析，两位年补 "20"，空段归 0，mktime 在 Etc/GMT-8 时区取值；
//   - mktime 结果为 0（PHP !empty 判假）→ 回落 time()。
func phpGetMkTime(s string) int64 {
	nonDigit := false
	for _, r := range s {
		if r < '0' || r > '9' {
			nonDigit = true
			break
		}
	}
	if !nonDigit {
		return int64(phpInt(s))
	}
	s = strings.NewReplacer(
		"\r", " ", "\n", " ", "\t", " ",
		"日", " ", "秒", " ",
		"年", "-", "月", "-", "时", ":", "分", ":",
	).Replace(strings.TrimSpace(s))
	var b strings.Builder
	space := false
	for _, r := range s {
		if r == ' ' {
			if space {
				continue
			}
			space = true
		} else {
			space = false
		}
		b.WriteRune(r)
	}
	s = strings.TrimSpace(b.String())

	var dt [6]int64
	dt[0], dt[1], dt[2] = 1970, 1, 1
	ds := strings.Split(s, " ")
	ymd := strings.Split(ds[0], "-")
	if len(ymd) < 2 {
		ymd = strings.Split(ds[0], ".")
	}
	// PHP 对原始年串 strlen($dt[0])==2 判断（导零 "01" → "2001"），
	// 必须在数值化之前做，phpInt 会吞掉前导零（codex 复审指出）。
	yearStr := ""
	if len(ymd) > 0 {
		yearStr = ymd[0]
	}
	if len(yearStr) == 2 {
		yearStr = "20" + yearStr
	}
	year := int64(phpInt(yearStr))
	if yearStr == "" {
		year = 1970
	}
	if len(ymd) > 1 {
		dt[1] = int64(phpInt(ymd[1]))
	}
	if len(ymd) > 2 {
		dt[2] = int64(phpInt(ymd[2]))
	}
	if len(ds) > 1 {
		hms := strings.Split(ds[1], ":")
		if len(hms) > 0 {
			dt[3] = int64(phpInt(hms[0]))
		}
		if len(hms) > 1 {
			dt[4] = int64(phpInt(hms[1]))
		}
		if len(hms) > 2 {
			dt[5] = int64(phpInt(hms[2]))
		}
	}
	mt := time.Date(int(year), time.Month(dt[1]), int(dt[2]),
		int(dt[3]), int(dt[4]), int(dt[5]), 0, gmt8).Unix()
	if mt == 0 {
		return time.Now().Unix()
	}
	return mt
}

// createOrdernum 复刻 create_ordernum()：y(2)+月hex(大写)+d+time 后 5 位+
// microtime 第 2-5 位（小数前 4 位）+sprintf('%02d', rand(0,99))。
func createOrdernum() string {
	n := time.Now().In(gmt8)
	ts := strconv.FormatInt(n.Unix(), 10)
	if len(ts) > 5 {
		ts = ts[len(ts)-5:]
	}
	micro := fmt.Sprintf("%06d", n.Nanosecond()/1000)
	if len(micro) > 4 {
		micro = micro[:4]
	}
	return n.Format("06") + strings.ToUpper(strconv.FormatInt(int64(n.Month()), 16)) + n.Format("02") +
		ts + micro + rand2Digits()
}

// rand2Digits 复刻 sprintf('%02d', rand(0, 99))。
func rand2Digits() string {
	b := make([]byte, 1)
	if _, err := rand.Read(b); err != nil {
		return "00"
	}
	return fmt.Sprintf("%02d", int(b[0])%100)
}

// strSplitJoin 复刻 join(" ", str_split(cardnum, 4))。
func strSplitJoin(s string, n int) string {
	if s == "" {
		return ""
	}
	var parts []string
	for i := 0; i < len(s); i += n {
		end := i + n
		if end > len(s) {
			end = len(s)
		}
		parts = append(parts, s[i:end])
	}
	return strings.Join(parts, " ")
}

// encodeOrdernum 复刻 base64_encode(php_encrypt($ordernum))（php_encrypt 自带一层
// base64，这里对字符串再编一次 → 两层）。
func encodeOrdernum(ordernum string) string {
	return base64.StdEncoding.EncodeToString([]byte(renrenEncryptOrder(ordernum)))
}

// currencyShort 复刻 echoCurrency(array("type"=>"short"))（canary 默认「元」）。
func currencyShort() string { return "元" }

// —— 共用查询 ——

// paytypeOf 复刻 site_payment 查不到时的映射（orderList 分支含 delivery）。
func (s *Service) paytypeOf(ctx context.Context, code string) string {
	if name := s.paymentName(ctx, code); name != "" {
		return name
	}
	switch code {
	case "point,money":
		return infoPointWord + "+" + infoBalanceWord
	case "point":
		return infoPointWord
	case "money":
		return infoBalanceWord
	case "delivery":
		return infoPayDelivery
	}
	return ""
}

// paytypeOfNoDelivery 复刻 orderDetail 分支（无 delivery case）。
func (s *Service) paytypeOfNoDelivery(ctx context.Context, code string) string {
	if name := s.paymentName(ctx, code); name != "" {
		return name
	}
	switch code {
	case "point,money":
		return infoPointWord + "+" + infoBalanceWord
	case "point":
		return infoPointWord
	case "money":
		return infoBalanceWord
	}
	return ""
}

func (s *Service) paymentName(ctx context.Context, code string) string {
	if s.db == nil || code == "" {
		return ""
	}
	var name sql.NullString
	_ = s.db.QueryRowContext(ctx,
		"SELECT `pay_name` FROM `"+s.prefix+"site_payment` WHERE `pay_code` = ?", code).Scan(&name)
	if name.Valid {
		return name.String
	}
	return ""
}

// urlOfRaw 直接以 Params 组 URL（payurl / cardnumUrl 的 param= 形式）。
func (s *Service) urlOfRaw(ctx context.Context, host string, pairs ...string) string {
	if s.files == nil {
		return ""
	}
	p := fburl.Params{}
	for i := 0; i+1 < len(pairs); i += 2 {
		p = append(p, fburl.Param{Key: pairs[i], Value: pairs[i+1]})
	}
	u, err := s.files.URL(ctx, p, fburl.Options{Host: host})
	if err != nil {
		return ""
	}
	return u
}

// cardnumRows 查询并渲染服务码（orderList / orderDetail 共用）：
// 返回 (渲染列表, 首卡原值, 逗号串)。
func (s *Service) cardnumRows(ctx context.Context, orderid string) ([]*omap, string, string) {
	rows, ok := s.queryRows(ctx,
		"SELECT `cardnum`, `usedate`, `expireddate` FROM `"+s.prefix+"travelquan` WHERE `orderid` = "+orderid)
	if !ok || len(rows) == 0 {
		return nil, "", ""
	}
	var list []*omap
	var raws []string
	first := ""
	for k, r := range rows {
		m := newOmap()
		m.set("cardnum", strSplitJoin(r.str("cardnum"), 4))
		m.set("usedate", r.get("usedate"))
		m.set("expireddate", r.get("expireddate"))
		list = append(list, m)
		raws = append(raws, r.str("cardnum"))
		if k == 0 {
			first = r.str("cardnum")
		}
	}
	return list, first, strings.Join(raws, ",")
}

// —— payCheck（travel.class.php:6717-6800）——

// payCheckImpl 还原 PHP 内部返回视角："ok" 字符串或 array(state=200,info) omap。
// 无登录门禁（userid=-1 直接进 SQL → 查不到 → 「订单不存在」）。
// $proDetail 跨迭代残留；$ret 每迭代被自店查询覆盖、type4 不重赋（同 PHP）。
func (s *Service) payCheckImpl(req *ajax.Request) any {
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	ordernum := req.Params.Get("ordernum")
	if !truthy(ordernum) {
		return failOmap(infoPayNoOrderNum)
	}
	userid := s.viewerID(ctx, req)

	ordernumArr := strings.Split(ordernum, ",")
	var proDetail any // PHP $proDetail 跨迭代残留
	for _, value := range ordernumArr {
		rows, ok := s.queryRows(ctx,
			"SELECT `proid`, `procount`, `orderprice`, `orderstate`, `type` FROM `"+
				s.prefix+"travel_order` WHERE `ordernum` = ? AND `userid` = "+
				strconv.FormatInt(userid, 10), value)
		if !ok || len(rows) == 0 {
			if len(ordernumArr) > 1 {
				return failOmap(infoMultiNoOrder)
			}
			return failOmap(infoOneNoOrder)
		}
		r := rows[0]
		if asString(r.get("orderstate")) != "0" {
			if len(ordernumArr) > 1 {
				return failOmap(infoMultiBadState)
			}
			return failOmap(infoOneBadState)
		}
		proid := r.str("proid")
		typ := r.str("type")

		switch typ {
		case "1", "2":
			ret, _ := s.queryRows(ctx,
				"SELECT `id`, `title`, `ticketid`, `price`, `specialtime` FROM `"+
					s.prefix+"travel_ticketinfo` WHERE `id` = "+proid)
			if len(ret) > 0 {
				if typ == "1" {
					proDetail = detailCall(req, ret[0].str("ticketid"), s.ticketDetail)
				} else {
					proDetail = detailCall(req, ret[0].str("ticketid"), s.agencyDetail)
				}
			}
		case "3":
			ret, _ := s.queryRows(ctx,
				"SELECT `id`, `title`, `hotelid`, `price`, `specialtime` FROM `"+
					s.prefix+"travel_hotelroom` WHERE `id` = "+proid)
			if len(ret) > 0 {
				proDetail = detailCall(req, ret[0].str("hotelid"), s.hotelDetail)
			}
		case "4":
			proDetail = detailCall(req, proid, s.visaDetail)
		}

		// 验证是否为自己的店铺（自店查询覆盖 $ret，同 PHP）
		storeRet, _ := s.queryRows(ctx,
			"SELECT `id` FROM `"+s.prefix+"travel_store` WHERE `userid` = "+
				strconv.FormatInt(userid, 10))
		if len(storeRet) > 0 {
			// PHP ==：company（store id）与 store.id 数值松散比较。
			if looseStrEqual(asString(fieldOf(proDetail, "company")), storeRet[0].str("id")) {
				return failOmap(infoBuyOwnCompany)
			}
		}

		// if(empty($proDetail))：nil（falsy 返回）→ 空；state 报错数组非 empty。
		if proDetail == nil {
			if len(ordernumArr) > 1 {
				return failOmap(infoMultiNoGoods)
			}
			return failOmap(infoOneNoGoods)
		}
	}
	return dsqlUpdateOK // "ok"
}

// payCheckAction 支付前验证（读）。
func (s *Service) payCheckAction(req *ajax.Request) ajax.Response {
	pc := s.payCheckImpl(req)
	if s, ok := pc.(string); ok && s == dsqlUpdateOK {
		return ajax.Response{State: ajax.StateOK, Info: s}
	}
	return respFail(asString(fieldOf(pc, "info")))
}

// —— checkPayAmount（travel.class.php:6637-6711）——

func (s *Service) checkPayAmount(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}

	// 订单状态验证：payCheck 先跑；非 "ok" → array("state"=>200, info=payCheck.info)。
	pc := s.payCheckImpl(req)
	if s, ok := pc.(string); !ok || s != dsqlUpdateOK {
		return respFail(asString(fieldOf(pc, "info")))
	}

	ordernum := req.Params.Get("ordernum")
	useBalance := req.Params.Get("useBalance")
	balance := req.Params.Get("balance")
	paypwd := req.Params.Get("paypwd")

	userid := s.viewerID(ctx, req)
	if userid == -1 {
		return respFail(infoLoginTimeout)
	}
	if !truthy(ordernum) {
		return respFail(infoOrderNumEmpty)
	}
	if truthy(balance) && !truthy(paypwd) { // !empty($balance) && empty($paypwd)
		return respFail(infoPayPwdEmpty)
	}

	totalPrice := 0.0
	for _, value := range strings.Split(ordernum, ",") {
		rows, ok := s.queryRows(ctx,
			"SELECT `procount`, `payprice` AS `orderprice` FROM `"+
				s.prefix+"travel_order` WHERE `ordernum` = ?", value)
		if ok && len(rows) > 0 {
			// $totalPrice += $orderprice：null/非数字按 PHP 数值语义加 0。
			totalPrice += phpLooseFloat(asString(rows[0].get("orderprice")))
		}
	}

	userinfo := s.userInfoOf(req, "")
	usermoney := phpLooseFloat(asString(fieldOf(userinfo, "money")))

	useTotal := 0.0
	var tit []string
	if useBalance == "1" && truthy(balance) && truthy(paypwd) {
		var stored sql.NullString
		_ = s.db.QueryRowContext(ctx,
			"SELECT `paypwd` FROM `"+s.prefix+"member` WHERE `id` = "+
				strconv.FormatInt(userid, 10)).Scan(&stored)
		hash := saltedHashOf(paypwd, stored.String)
		if stored.String != hash {
			return respFail(infoPayPwdWrong)
		}
		// PHP $usermoney < $balance：数值比较（非数字按 PHP 8 报 TypeError，不复刻）。
		if usermoney < phpLooseFloat(balance) {
			return respFail(infoBalanceShort)
		}
		useTotal += phpLooseFloat(balance)
		tit = append(tit, infoTitBalance)
	}

	if useTotal > totalPrice {
		joined := strings.Join(tit, infoUseOverJoin)
		return respFail(infoUseOverPrefix + joined + infoUseOverSuffix + joined)
	}

	return ajax.Response{State: ajax.StateOK,
		Info: fmt.Sprintf("%.2f", totalPrice-useTotal)}
}

// —— delOrder（travel.class.php:7764-7799）——

func (s *Service) delOrder(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	id := req.Params.Get("id")
	if !isNumericString(id) {
		return respFail(infoAddrFormat)
	}
	uid := s.viewerID(ctx, req)
	if uid == -1 {
		return respFail(infoLoginTimeout)
	}
	if s.db == nil {
		return respNoData()
	}
	rows, ok := s.queryRows(ctx,
		"SELECT * FROM `"+s.prefix+"travel_order` WHERE `id` = "+id)
	if !ok || len(rows) == 0 {
		return ajax.Response{State: stateParamFailed, Info: infoDelNoOrder}
	}
	r := rows[0]
	if r.str("userid") != strconv.FormatInt(uid, 10) {
		return ajax.Response{State: stateParamFailed, Info: infoDelNoPerm}
	}
	switch r.str("orderstate") {
	case "0", "7", "3", "9":
		if _, err := s.db.ExecContext(ctx,
			"DELETE FROM `"+s.prefix+"travel_order` WHERE `id` = "+id); err != nil {
			return respNoData()
		}
		return ajax.Response{State: ajax.StateOK, Info: infoDelOK}
	}
	return ajax.Response{State: stateParamFailed, Info: infoDelBadState}
}

// —— orderList（travel.class.php:7433-7758）——

func (s *Service) orderList(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	host := reqHost(req)

	store := phpInt(req.Params.Get("store"))
	typ := phpInt(req.Params.Get("type"))
	state := req.Params.Get("state")
	userid := phpInt(req.Params.Get("userid"))
	page := phpInt(req.Params.Get("page"))
	pageSize := phpInt(req.Params.Get("pageSize"))
	title := strings.TrimSpace(req.Params.Get("title"))

	if userid == 0 { // PHP empty($userid)
		userid = int(s.viewerID(ctx, req))
	}
	if userid == 0 {
		return respFail(infoMemberIDEmpty)
	}

	where := ""
	var likeArgs []any
	if title != "" {
		if store != 0 {
			where += " AND (o.`ordernum` LIKE ? OR s.`title` LIKE ? OR m.`nickname` LIKE ?)"
			pat := "%" + title + "%"
			likeArgs = append(likeArgs, pat, pat, pat)
		} else {
			where += " AND (o.`ordernum` LIKE ? OR s.`title` LIKE ?)"
			pat := "%" + title + "%"
			likeArgs = append(likeArgs, pat, pat)
		}
	}

	typeFilter := ""
	if typ != 0 {
		typeFilter = " AND o.`type` = " + strconv.Itoa(typ) + " "
	}

	var archives string
	if store == 0 {
		where += " AND o.`userid` = '" + strconv.Itoa(userid) + "' "
		where += typeFilter
		archives = "SELECT o.`id`, o.`ordernum`, o.`store`, o.`proid`, o.`userid`, o.`procount`, o.`orderprice`, o.`orderstate`, o.`orderdate`, o.`paydate`, o.`paytype`, s.`title`, o.`ret-state`, o.`type`, o.`walktime` FROM `"+
			s.prefix+"travel_order` o  LEFT JOIN `"+s.prefix+"travel_store` s ON o.`store` = s.`id` LEFT JOIN `"+
			s.prefix+"member` m ON m.`id` = s.`userid` WHERE 1 = 1" + where
	} else {
		where += " AND s.`userid` = '" + strconv.Itoa(userid) + "' AND o.`orderstate` != 0 "
		where += typeFilter
		archives = "SELECT o.`id`, o.`ordernum`, o.`store`, o.`proid`, o.`userid`, o.`procount`, o.`orderprice`, o.`orderstate`, o.`orderdate`, o.`paydate`, o.`paytype`, o.`ret-state`, o.`type`, o.`walktime` FROM `"+
			s.prefix+"travel_order` o LEFT JOIN `"+s.prefix+"travel_store` s ON o.`store` = s.`id` LEFT JOIN `"+
			s.prefix+"member` m ON m.`id` = s.`userid` WHERE 1 = 1" + where
	}

	if pageSize == 0 {
		pageSize = 10
	}
	if page == 0 {
		page = 1
	}

	totalCount := s.countRows(ctx, archives, likeArgs...)
	totalPage := phpCeil(strconv.Itoa(totalCount), float64(pageSize))

	stateCount := func(extra string) int {
		return s.countRows(ctx, archives+extra, likeArgs...)
	}
	pageinfo := newOmap()
	pageinfo.set("page", page)
	pageinfo.set("pageSize", pageSize)
	pageinfo.set("totalPage", totalPage)
	pageinfo.set("totalCount", totalCount)
	pageinfo.set("state0", stateCount(" AND `orderstate` = 0"))
	pageinfo.set("state1", stateCount(" AND `orderstate` = 1"))
	pageinfo.set("state2", stateCount(" AND `orderstate` = 2"))
	pageinfo.set("state3", stateCount(" AND `orderstate` = 3"))
	pageinfo.set("state4", stateCount(" AND `orderstate` = 4"))
	pageinfo.set("state5", stateCount(" AND `orderstate` = 5"))
	pageinfo.set("state6", stateCount(" AND `orderstate` = 6"))
	pageinfo.set("state7", stateCount(" AND `orderstate` = 7"))
	pageinfo.set("state8", stateCount(" AND `orderstate` = 8 and `ret-state` = 1 "))
	pageinfo.set("state9", stateCount(" AND `orderstate` = 9"))
	pageinfo.set("state10", stateCount(" AND `orderstate` = 10 and `ret-state` = 1 "))
	pageinfo.set("state20", stateCount(" AND (`orderstate` = 2 or `orderstate` = 4)"))

	if totalCount == 0 {
		return ajax.Response{State: ajax.StateOK, Info: pagedPayloadList(pageinfo, []any{})}
	}

	// state 过滤：PHP 裸拼接（注入面）→ Go 按 phpInt 参数化（非数字 state 的 SQL
	// 报错分支不复刻）。
	listWhere := ""
	stateInt := phpInt(state)
	if state != "" && state != "20" {
		listWhere = " AND `orderstate` = " + strconv.Itoa(stateInt)
	}
	if state == "8" {
		listWhere = " AND `ret-state` = 1"
	}
	if state == "20" {
		listWhere = " AND (`orderstate` = 2 or `orderstate` = 4)"
	}
	atpage := pageSize * (page - 1)
	listWhere += " ORDER BY `id` DESC LIMIT " + strconv.Itoa(atpage) + ", " + strconv.Itoa(pageSize)

	rows, ok := s.queryRows(ctx, archives+listWhere, likeArgs...)
	list := []any{}
	if ok {
		// PHP 跨行残留变量：$ret / $proDetail / $param。
		var ret []rowVal
		var proDetail any
		// $param 在循环前先被赋成 member orderdetail 链接（L7592-7600），
		// type∉1..4 的行直接沿用（首行/跨行泄漏同源）。
		urlPairs := []string{"service", "member", "type", "user", "template", "orderdetail",
			"module", "travel", "id", "%id%", "param", "rates=1"}
		for _, val := range rows {
			item := newOmap()
			item.set("id", val.get("id"))
			item.set("ordernum", val.get("ordernum"))
			item.set("proid", val.get("proid"))
			item.set("procount", val.get("procount"))
			item.set("store", val.get("store"))
			item.set("walktime", phpInt(val.str("walktime")))
			item.set("paytypeold", val.get("paytype"))
			item.set("paytype", s.paytypeOf(ctx, val.str("paytype")))
			item.set("company", val.get("title"))
			// orderprice：float(10,2) 列，PHP PDO 文本协议返回 "50.00" 原样透传；
			// Go 二进制协议是 float64 → 按 %.2f 还原（同 ticketList price 口径）。
			item.set("orderprice", phpSprintf2f(val.str("orderprice")))
			item.set("orderstate", val.get("orderstate"))
			item.set("orderdate", val.get("orderdate"))
			item.set("paydate", val.get("paydate"))
			item.set("retState", val.get("ret-state"))
			item.set("member", s.memberProjection(req, val.str("userid")))

			unitprice := 0.0
			rowType := val.str("type")
			switch rowType {
			case "1", "2":
				proid := val.str("proid")
				ret, _ = s.queryRows(ctx,
					"SELECT `id`, `title`, `ticketid`, `price`, `specialtime` FROM `"+
						s.prefix+"travel_ticketinfo` WHERE `id` = "+proid)
				if len(ret) > 0 {
					unitprice = phpLooseFloat(ret[0].str("price"))
					if rowType == "1" {
						proDetail = detailCall(req, ret[0].str("ticketid"), s.ticketDetail)
					} else {
						proDetail = detailCall(req, ret[0].str("ticketid"), s.agencyDetail)
					}
					item.set("title", fieldOf(proDetail, "title"))
					if rowType == "2" {
						item.set("subtype", phpInt(asString(fieldOf(proDetail, "typeid"))))
					}
				}
				tmpl := "agency-detail"
				if rowType == "1" {
					tmpl = "ticket-detail"
				}
				urlPairs = []string{"service", "travel", "template", tmpl,
					"id", asString(fieldOf(proDetail, "id"))}
			case "3":
				proid := val.str("proid")
				ret, _ = s.queryRows(ctx,
					"SELECT `id`, `title`, `hotelid`, `price`, `specialtime` FROM `"+
						s.prefix+"travel_hotelroom` WHERE `id` = "+proid)
				if len(ret) > 0 {
					unitprice = phpLooseFloat(ret[0].str("price"))
					proDetail = detailCall(req, ret[0].str("hotelid"), s.hotelDetail)
					item.set("title", fieldOf(proDetail, "title"))
				}
				urlPairs = []string{"service", "travel", "template", "hotel-detail",
					"id", asString(fieldOf(proDetail, "id"))}
			case "4":
				proDetail = detailCall(req, val.str("proid"), s.visaDetail)
				unitprice = phpLooseFloat(asString(fieldOf(proDetail, "price")))
				item.set("title", fieldOf(proDetail, "title"))
				ret, _ = s.queryRows(ctx,
					"SELECT `typename` AS `title` FROM `"+s.prefix+"travel_visatype` WHERE `id` = "+
						asString(fieldOf(proDetail, "typeid")))
				urlPairs = []string{"service", "travel", "template", "visa-detail",
					"id", asString(fieldOf(proDetail, "id"))}
			}

			item.set("unitprice", unitprice)
			// product.title = $ret[0]['title'] ? $ret[0]['title'] : $proDetail['title']
			var retTitle any
			if len(ret) > 0 {
				retTitle = ret[0].get("title")
			}
			prodTitle := retTitle
			if phpEmptyAny(prodTitle) {
				prodTitle = fieldOf(proDetail, "title")
			}
			prod := newOmap()
			prod.set("title", prodTitle)
			prod.set("litpic", nil)
			if pics, okc := fieldOf(proDetail, "pics").([]any); okc && len(pics) > 0 {
				prod.set("litpic", fieldOf(pics[0], "path"))
			}
			if urlPairs != nil { // PHP $param 未定义 → getUrlPath(null) → null
				prod.set("url", s.urlOfRaw(ctx, host, urlPairs...))
			} else {
				prod.set("url", nil)
			}
			item.set("product", prod)

			// 未付款的提供付款链接（随机盐 → compare ignoreFields）
			if val.str("orderstate") == "0" {
				encodeid := encodeOrdernum(val.str("ordernum"))
				item.set("payurl", s.urlOfRaw(ctx, host,
					"service", "travel", "template", "pay", "param", "ordernum="+encodeid))
			}

			item.set("type", val.get("type"))
			if (rowType == "1" || rowType == "2" || rowType == "3" || rowType == "4") &&
				val.str("orderstate") != "0" {
				_, first, joined := s.cardnumRows(ctx, val.str("id"))
				if first != "" { // PHP if($cardResult)
					item.set("cardnum", first)
					// PHP 这里同时覆写 $param（verify-travel），并残留到下一行
					// type∉1..4 的 product.url —— 复刻跨行泄漏。
					urlPairs = []string{"service", "member", "template", "verify-travel",
						"param", "cardnum=" + joined}
					item.set("cardnumUrl", s.urlOfRaw(ctx, host, urlPairs...))
				}
			}
			list = append(list, item)
		}
	}
	return ajax.Response{State: ajax.StateOK, Info: pagedPayloadList(pageinfo, list)}
}

// —— orderDetail（travel.class.php:7805-8069）——

func (s *Service) orderDetail(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	host := reqHost(req)

	id := req.Params.Get("id")
	userid := s.viewerID(ctx, req)

	if !isNumericString(id) {
		return respFail(infoAddrFormat)
	}
	if s.db == nil {
		return respNoData()
	}

	rows, ok := s.queryRows(ctx,
		"SELECT o.*, s.`id` AS `sid` FROM `"+s.prefix+"travel_order` o  LEFT JOIN `"+
			s.prefix+"travel_store` s ON o.`store` = s.`id` WHERE ( o.`userid` = '"+
			strconv.FormatInt(userid, 10)+"' OR s.`userid` = '"+
			strconv.FormatInt(userid, 10)+"') AND o.`id` = "+id)
	if !ok || len(rows) == 0 {
		// PHP：$orderDetail 保持 array() → 末尾 return 空数组 → 包装层判 falsy → null → 102 No data!
		return respNoData()
	}
	r := rows[0]
	d := newOmap()
	d.set("ordernum", r.get("ordernum"))
	d.set("walktime", r.get("walktime"))
	d.set("departuretime", r.get("departuretime"))
	d.set("userid", r.get("userid"))
	// contact：先赋原值，后又被 aesDecrypt 覆盖（键序保持原位；aes 恒等 → 同值）。
	d.set("contact", r.get("contact"))
	d.set("failnote", r.get("failnote"))
	d.set("status", r.get("status"))
	d.set("proid", r.get("proid"))
	d.set("enddate", floorTimeN2(int64(phpInt(r.str("nopaydate"))), time.Now()))
	d.set("member", s.memberProjection(req, r.str("userid")))

	// 商品信息
	proid := r.str("proid")
	rowType := r.str("type")
	var detail any
	var ret []rowVal
	// $sql 未定义（type∉1..4 的 else 分支）→ dsqlOper 报错串 → PHP $ret = "{..."
	// 字符串（truthy）→ $ret[0]['title'] / $ret[0]['price'] = 首字符 "{"（#371 口径）。
	retErrStr := false
	if rowType == "4" {
		detail = detailCall(req, proid, s.visaDetail)
		d.set("title", fieldOf(detail, "title"))
	} else {
		var okr bool
		if rowType == "1" || rowType == "2" {
			ret, okr = s.queryRows(ctx,
				"SELECT `id`, `title`, `ticketid`, `price`, `specialtime` FROM `"+
					s.prefix+"travel_ticketinfo` WHERE `id` = "+proid)
		} else if rowType == "3" {
			ret, okr = s.queryRows(ctx,
				"SELECT `id`, `title`, `hotelid`, `price`, `specialtime` FROM `"+
					s.prefix+"travel_hotelroom` WHERE `id` = "+proid)
		} else {
			retErrStr = true
		}
		if !okr && !retErrStr {
			retErrStr = true
		}
		if retErrStr {
			// PHP：$ret 为 truthy 字符串 → if(!empty($ret)) 进入，$ret[0]['x'] = "{"
			d.set("title", "{")
			d.set("price", "{")
		} else if len(ret) > 0 {
			d.set("title", ret[0].get("title"))
			// float(10,2) 列按 PHP 文本协议口径还原两位小数。
			d.set("price", floatCol(ret[0].get("price")))
			if rowType == "1" {
				detail = detailCall(req, ret[0].str("ticketid"), s.ticketDetail)
			} else if rowType == "2" {
				detail = detailCall(req, ret[0].str("ticketid"), s.agencyDetail)
			} else if rowType == "3" {
				detail = detailCall(req, ret[0].str("hotelid"), s.hotelDetail)
			}
		}
	}
	// product（$detail 可为报错数组 → 各字段 null）
	prod := newOmap()
	prod.set("id", fieldOf(detail, "id"))
	prod.set("title", fieldOf(detail, "title"))
	prod.set("opentime", fieldOf(detail, "weekk"))
	prod.set("address", fieldOf(detail, "address"))
	prod.set("travelservice", fieldOf(detail, "travelservice"))
	prod.set("missiontime", fieldOf(detail, "missiontime"))
	prod.set("lng", fieldOf(detail, "lng"))
	prod.set("lat", fieldOf(detail, "lat"))
	prod.set("litpic", nil)
	if pics, okc := fieldOf(detail, "pics").([]any); okc && len(pics) > 0 {
		prod.set("litpic", fieldOf(pics[0], "path"))
	}
	// product.price = $detail['price'] ? $detail['price'] : $ret[0]['price']
	// （PHP 对浮点列字符串的真值判断；Go 侧先按 floatCol 还原口径再判真值）。
	prodPrice := floatCol(fieldOf(detail, "price"))
	if prodPrice == nil || !phpTruthyStr(prodPrice) {
		if retErrStr {
			prodPrice = "{" // $ret[0]['price'] = 首字符
		} else if len(ret) > 0 {
			prodPrice = floatCol(ret[0].get("price"))
		} else {
			prodPrice = nil
		}
	}
	prod.set("price", prodPrice)

	var urlPairs []string
	switch rowType {
	case "4":
		urlPairs = []string{"service", "travel", "template", "visa-detail",
			"id", asString(fieldOf(detail, "id"))}
	case "1":
		urlPairs = []string{"service", "travel", "template", "ticket-detail",
			"id", asString(fieldOf(detail, "id"))}
	case "2":
		urlPairs = []string{"service", "travel", "template", "agency-detail",
			"id", asString(fieldOf(detail, "id"))}
	case "3":
		urlPairs = []string{"service", "travel", "template", "hotel-detail",
			"id", asString(fieldOf(detail, "id"))}
	}
	if urlPairs != nil {
		prod.set("url", s.urlOfRaw(ctx, host, urlPairs...))
	} else {
		prod.set("url", nil)
	}
	d.set("product", prod)

	d.set("procount", r.get("procount"))
	// totalAmount = orderprice（+= 数值化）
	// float(10,2) 列按 %.2f 还原 PHP 文本协议口径（同 orderList）。
	d.set("orderprice", phpSprintf2f(r.str("orderprice")))
	d.set("totalmoney", phpLooseFloat(r.str("orderprice")))
	d.set("pointprice", phpLooseFloat(r.str("point"))/pointRatio)
	d.set("balance", phpSprintf2f(r.str("balance")))
	d.set("payprice", phpSprintf2f(r.str("payprice")))
	d.set("orderstate", r.get("orderstate"))
	d.set("orderdate", r.get("orderdate"))
	d.set("type", rowType)
	// aesDecrypt 恒等；people 仅当 json_decode 结果是「数组」时替换为解码值
	//（PHP 不带 assoc 参数 → 对象解码是 stdClass → is_array false → 保持原串）。
	people := r.str("people")
	var peopleArr []any
	if json.Unmarshal([]byte(people), &peopleArr) == nil {
		d.set("people", peopleArr)
	} else {
		d.set("people", people)
	}
	d.set("note", r.get("note"))
	d.set("idcard", r.get("idcard"))
	d.set("backpeople", r.get("backpeople"))
	d.set("backcontact", r.get("backcontact"))
	d.set("backaddress", r.get("backaddress"))
	d.set("email", r.get("email"))
	d.set("applicantinformation", r.get("applicantinformation"))

	applicantArr := []any{}
	if truthy(r.str("applicantinformation")) {
		for _, v := range strings.Split(r.str("applicantinformation"), "|||") {
			parts := strings.Split(v, "$$$")
			m := newOmap()
			m.set("name", parts[0])
			if len(parts) > 1 {
				m.set("birth", parts[1])
			} else {
				m.set("birth", nil)
			}
			if len(parts) > 2 {
				m.set("typename", parts[2])
			} else {
				m.set("typename", nil)
			}
			applicantArr = append(applicantArr, m)
		}
	}
	d.set("applicantinformationArr", applicantArr)

	// 未付款的提供付款链接（随机盐）
	if r.str("orderstate") == "0" {
		encodeid := encodeOrdernum(r.str("ordernum"))
		d.set("payurl", s.urlOfRaw(ctx, host,
			"service", "travel", "template", "pay", "param", "ordernum="+encodeid))
	}

	d.set("paytype", s.paytypeOfNoDelivery(ctx, r.str("paytype")))
	d.set("paydate", r.get("paydate"))

	// 服务码
	if (rowType == "1" || rowType == "2" || rowType == "3" || rowType == "4") &&
		r.str("orderstate") != "0" {
		cards, _, joined := s.cardnumRows(ctx, r.str("id"))
		if len(cards) > 0 { // PHP if($cardnum)
			d.set("cardnum", cards)
			d.set("cardnumUrl", s.urlOfRaw(ctx, host,
				"service", "member", "template", "verify-travel", "param", "cardnum="+joined))
		}
	}

	d.set("retState", r.get("ret-state"))
	d.set("retType", r.get("ret-type"))
	d.set("retNote", r.get("ret-note"))

	renderPics := func(raw string) []any {
		out := []any{}
		if truthy(raw) {
			for _, v := range strings.Split(raw, ",") {
				m := newOmap()
				m.set("val", v)
				m.set("path", s.filePath(ctx, host, v))
				out = append(out, m)
			}
		}
		return out
	}
	d.set("retPics", renderPics(r.str("ret-pics")))
	d.set("retDate", r.get("ret-date"))
	d.set("picslist", renderPics(r.str("pics")))
	d.set("retOkdate", r.get("ret-ok-date"))
	d.set("now", time.Now().Unix())

	// 卖家信息：storeDetail((int)sid)；sid null → (int)null = 0 → 查无行 → []。
	sid := strconv.Itoa(phpInt(r.str("sid")))
	sdetail, _ := s.storeDetailRaw(ctx, host, url.Values{"id": []string{sid}},
		s.viewerID(ctx, req), req)
	if sdetail == nil {
		d.set("store", []any{})
	} else {
		d.set("store", sdetail)
	}

	return ajax.Response{State: ajax.StateOK, Info: d}
}

// floatCol 复刻 float(10,2) 列在 PHP 文本协议下的 "X.XX" 字符串口径：
// 数值字符串按 %.2f 还原；非数值（dsql 错误串残留的 "{" 等）原样透传。
func floatCol(v any) any {
	if v == nil {
		return nil
	}
	s := asString(v)
	if isNumericString(s) {
		return phpSprintf2f(s)
	}
	return s
}

// phpTruthyStr 复刻 PHP 字符串真值（"" / "0" 为假，"0.00" 为真）。
// floatCol 只产 string 或 nil，非字符串非 nil 一律视为真（PHP 标量真值口径）。
func phpTruthyStr(v any) bool {
	s, ok := v.(string)
	if !ok {
		return v != nil
	}
	return truthy(s)
}

// —— verifyQuan（travel.class.php:8576-8702）——

func (s *Service) verifyQuan(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	host := reqHost(req)

	code := req.Params.Get("code")
	now := time.Now().Unix()
	now1 := todayStart()

	if !isNumericString(code) {
		return respFail(infoAddrFormat)
	}
	uid := s.viewerID(ctx, req)
	if uid == -1 {
		return respFail(infoLoginTimeout)
	}

	rows, ok := s.queryRows(ctx,
		"SELECT q.`usedate`, q.`expireddate`, o.`proid`, o.`departuretime`, o.`type`, o.`orderprice`, o.`procount` FROM `"+
			s.prefix+"travelquan` q LEFT JOIN `"+s.prefix+"travel_order` o ON o.`id` = q.`orderid` LEFT JOIN `"+
			s.prefix+"travel_store` s ON o.`store` = s.`id` WHERE (o.`orderstate` = 1 OR o.`orderstate` = 2) AND q.`cardnum` = ? AND s.`userid` = "+
			strconv.FormatInt(uid, 10), code)
	if !ok || len(rows) == 0 {
		return ajax.Response{State: stateParamFailed, Info: infoQuanPwdWrong}
	}
	r := rows[0]
	usedate := int64(phpInt(r.str("usedate")))
	expireddate := int64(phpInt(r.str("expireddate")))
	proid := r.str("proid")
	typ := r.str("type")
	departuretime := int64(phpInt(r.str("departuretime")))
	procount := r.str("procount")

	if usedate != 0 {
		return ajax.Response{State: stateParamFailed,
			Info: infoQuanUsedPre + phpDateLocal(usedate, "2006-01-02 15:04:05") + infoQuanUsedSuf}
	} else if expireddate < now1 {
		if typ == "3" {
			if departuretime < now1 {
				return ajax.Response{State: stateParamFailed, Info: infoQuanExpired}
			}
			// type3 且出发时间未过 → 不 return → 隐式 null → 102 No data!
			return respNoData()
		}
		return ajax.Response{State: stateParamFailed, Info: infoQuanExpired}
	}

	// 可以使用
	var ret []rowVal
	var detail any
	switch typ {
	case "1", "2":
		ret, _ = s.queryRows(ctx,
			"SELECT `id`, `title`, `ticketid`, `price`, `specialtime` FROM `"+
				s.prefix+"travel_ticketinfo` WHERE `id` = "+proid)
	case "3":
		ret, _ = s.queryRows(ctx,
			"SELECT `id`, `title`, `hotelid`, `price`, `specialtime` FROM `"+
				s.prefix+"travel_hotelroom` WHERE `id` = "+proid)
	case "4":
		ret, _ = s.queryRows(ctx,
			"SELECT `id`, `title`, `price` FROM `"+s.prefix+"travel_visa` WHERE `id` = "+proid)
	}
	if len(ret) == 0 {
		return ajax.Response{State: stateParamFailed, Info: infoQuanNoInfo}
	}
	title := ret[0].str("title")
	switch typ {
	case "1":
		detail = detailCall(req, ret[0].str("ticketid"), s.ticketDetail)
	case "2":
		detail = detailCall(req, ret[0].str("ticketid"), s.agencyDetail)
	case "3":
		detail = detailCall(req, ret[0].str("hotelid"), s.hotelDetail)
	case "4":
		detail = detailCall(req, ret[0].str("id"), s.visaDetail)
	}
	tmpl := ""
	switch typ {
	case "1":
		tmpl = "ticket-detail"
	case "2":
		tmpl = "agency-detail"
	case "3":
		tmpl = "hotel-detail"
	case "4":
		tmpl = "visa-detail"
	}
	u := s.urlOfRaw(ctx, host, "service", "travel", "template", tmpl,
		"id", asString(fieldOf(detail, "id")))
	_ = now // PHP $now 取了没用，保留语义
	return ajax.Response{State: ajax.StateOK, Info: infoQuanOK +
		"<a href='" + u + "' target='_blank'>" + title + "</a> × " + procount + infoQuanUnit +
		" [" + ret[0].str("price") + currencyShort() + "]"}
}

// —— oneKeyContinued（travel.class.php:9147-9248）——

func (s *Service) oneKeyContinued(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	host := reqHost(req)

	userid := s.viewerID(ctx, req)
	if userid == -1 {
		return respFail(infoLoginTimeout)
	}
	id := req.Params.Get("id")
	if !truthy(id) { // PHP empty($id)
		return respFail(infoAddrFormat)
	}
	if s.db == nil {
		return respNoData()
	}

	rows, ok := s.queryRows(ctx,
		"SELECT `id`, `walktime`, `departuretime`, `orderstate`, `proid`, `procount`, `people`, `contact` FROM `"+
			s.prefix+"travel_order` WHERE `id` = "+id)
	if !ok || len(rows) == 0 {
		return respFail(infoRoomNotFound)
	}
	r := rows[0]
	orderstate := r.str("orderstate")
	departuretime := int64(phpInt(r.str("departuretime")))
	walktime := int64(phpInt(r.str("walktime")))
	proid := r.str("proid")

	now := todayStart()
	if (orderstate == "1" && departuretime > now) || (orderstate == "3" && departuretime > now) {
		return respFail(infoRoomSoldPre + phpDateLocal(departuretime, "2006-01-02") + infoRoomSoldSuf)
	}

	daytime := departuretime - walktime
	newWalktime := now
	newDeparture := now + daytime

	hret, _ := s.queryRows(ctx,
		"SELECT `id`, `title`, `hotelid`, `price`, `specialtime` FROM `"+
			s.prefix+"travel_hotelroom` WHERE `id` = "+proid)
	if len(hret) == 0 {
		// PHP is_array($ret) false（false）→ 房间信息不存在。
		return respFail(infoRoomNotFound)
	}
	detail := detailCall(req, hret[0].str("hotelid"), s.hotelDetail)

	// $store = $detail['store']['id']（先于 is_array 检查——PHP 源码顺序如此；
	// detail 为报错数组时 store 未置 → null → 不命中自店拦截）。
	store := fieldOf(fieldOf(detail, "store"), "id")
	if looseStrEqual(asString(fieldOf(fieldOf(detail, "store"), "userid")),
		strconv.FormatInt(userid, 10)) {
		return respFail(infoBuyOwnTicket)
	}
	// if(!is_array($detail))：nil（falsy）→ 房间信息不存在；报错数组是 array → 继续。
	if detail == nil {
		return respFail(infoRoomNotFound)
	}

	price := hret[0].str("price")
	if truthy(hret[0].str("specialtime")) {
		if vals, ok2 := phpUnserAny(hret[0].str("specialtime")); ok2 {
			if arr, ok3 := vals.(*omap); ok3 {
				var priceArr []string
				for _, k := range arr.keys { // foreach($specialtime as $val)
					m, _ := arr.vals[k].(*omap)
					if m == nil {
						continue
					}
					stime := phpGetMkTime(asString(m.vals["stime"]))
					etime := phpGetMkTime(asString(m.vals["etime"]))
					if newWalktime >= stime && newWalktime < etime {
						priceArr = append(priceArr, asString(m.vals["price"]))
					}
				}
				if len(priceArr) > 0 {
					price = priceArr[len(priceArr)-1] // array_pop
				}
			}
		}
	}

	ordernum := createOrdernum()
	pubdate := time.Now().Unix()
	nopaydate := pubdate + 1800
	people := asString(r.get("people"))
	contact := asString(r.get("contact"))
	procount := asString(r.get("procount"))

	res, err := s.db.ExecContext(ctx,
		"INSERT INTO `"+s.prefix+"travel_order` (`ordernum`, `store`, `proid`, `userid`, `orderstate`, `orderdate`, `procount`, `people`, `contact`, `orderprice`, `type`, `tab`, `walktime`, `nopaydate`, `departuretime`) "+
			"VALUES (?, ?, ?, ?, '0', ?, ?, ?, ?, ?, '3', 'travel', ?, ?, ?)",
		ordernum, asString(store), proid, userid, pubdate, procount, people, contact, price,
		newWalktime, nopaydate, newDeparture)
	if err != nil {
		return respFail(infoOrderFail)
	}
	if n, e := res.RowsAffected(); e == nil && n == 0 {
		return respFail(infoOrderFail)
	}

	ids := base64.StdEncoding.EncodeToString([]byte(renrenEncryptOrder(ordernum)))
	return ajax.Response{State: ajax.StateOK,
		Info: s.urlOfRaw(ctx, host, "service", "travel", "template", "comfirm",
			"param", "ordernum="+ids)}
}
