package member

import (
	"context"
	"database/sql"
	"encoding/json"
	"math"
	"math/big"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

const (
	// zh-CN/siteConfig.inc.php [21][65] 与 [21][31]。
	nicknameAnonymous = "匿名"
	levelNameDefault  = "普通会员"
	// member.detail 查不到会员时，handlers 把空数组改写成 102 "No data!"，getMemberInfo 取 info 就是这个字符串。
	memberInfoNoData = "No data!"
	// settlement.inc.php 之后 `global $cfg_liveFee` 把局部值覆盖成 NULL → 100 - NULL = 100，所以不读配置。
	liveFee = 100
)

// kv / obj 保证 JSON 键顺序与 PHP 数组插入顺序一致。
type kv struct {
	k string
	v any
}

type obj []kv

func (o obj) MarshalJSON() ([]byte, error) {
	var b strings.Builder
	b.WriteByte('{')
	for i, e := range o {
		if i > 0 {
			b.WriteByte(',')
		}
		k, _ := json.Marshal(e.k)
		v, err := json.Marshal(e.v)
		if err != nil {
			return nil, err
		}
		b.Write(k)
		b.WriteByte(':')
		b.Write(v)
	}
	b.WriteByte('}')
	return []byte(b.String()), nil
}

type rewardPageInfo struct {
	Page       int      `json:"page"`
	PageSize   int      `json:"pageSize"`
	TotalPage  phpFloat `json:"totalPage"`
	TotalCount int      `json:"totalCount"`
	Totalmoney phpFloat `json:"totalmoney"`
}

type rewardInfo struct {
	PageInfo rewardPageInfo `json:"pageInfo"`
	List     []obj          `json:"list"`
}

type rewardRow struct {
	rewardUser, amount, settle, date, num, giftID, module, aid, kind sql.NullString
}

// reward 迁移自 member.class.php:5082-5329（被打赏记录）。
func (s *Service) reward(req *ajax.Request) ajax.Response {
	if s.db == nil {
		return noData()
	}
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	p := newParams(req)
	uid, err := s.identityID(ctx, req.HTTP)
	if err != nil {
		return noData()
	}

	pageSize := p.pageLike("pageSize", 10)
	page := p.pageLike("page", 1)
	if pageSize == 0 {
		pageSize = 10
	}
	if page == 0 {
		page = 1
	}

	date, soure, typ, price := p.scalar("date"), p.scalar("soure"), p.scalar("type"), p.scalar("price")
	typ1, typ2 := looseEqualsInt(typ, 1), looseEqualsInt(typ, 2)
	soureOther := soure != "live" && soure != ""

	// —— 三路子查询（uid 是 int64，直接拼；soure 走绑定参数）——
	uidS := strconv.FormatInt(uid, 10)
	var memberArgs []any
	whereSoure := ""
	if soureOther {
		whereSoure = " AND `module` = ?"
		memberArgs = []any{soure}
		if typ1 {
			return fail(infoEmpty)
		}
	}
	whereType := ""
	if typ2 {
		whereType = " AND r.`gift_id` = 0 "
	}
	memberSQL := "(SELECT '' hid,`uid` reward_userid,`amount`,'' settle ,`date`,''num,''gift_id, `module`,`aid`,'member' rewardtype FROM " + s.t("member_reward") + " WHERE `state` = 1 AND `touid` = " + uidS + " " + whereSoure + ")"
	liveSQL := "(SELECT r.`id` hid, r.`reward_userid`, p.`amount`, p.`settle`, r.`date`, r.`num`, r.`gift_id`,''module, r.`live_id` aid, 'live' rewardtype FROM " + s.t("livelist") + " l LEFT JOIN " + s.t("live_reward") + " r  ON l.`id` = r.`live_id` LEFT JOIN " + s.t("live_payorder") + " p\n       ON p.`live_id` = r.`live_id`  WHERE l.`user` = " + uidS + " AND p.`status` = 1 AND r.`payid` = p.`order_id` " + whereType + ")"
	hongbaoSQL := "(SELECT '' hid,`recv_user` reward_userid,`recv_money` amount,'' settle ,l.`date`, ''num,''gift_id, '' module,hb.`live_id` aid ,'hongbao' rewardtype FROM " + s.t("live_hrecv_list") + " l LEFT JOIN " + s.t("live_hongbao") + " hb ON l.`hid` =  hb.`id` WHERE `recv_user` = " + uidS + " )"

	allSQL := "SELECT * FROM (" + memberSQL + " UNION ALL " + liveSQL + " UNION ALL " + hongbaoSQL + ") as alls WHERE 1 = 1"
	allArgs := append([]any(nil), memberArgs...)
	if typ1 || soure == "live" {
		if typ1 {
			allSQL = "SELECT * FROM " + liveSQL + " as alls WHERE  1 = 1 AND `gift_id` > 0"
			allArgs = nil
		} else if typ2 {
			allSQL = "SELECT * FROM (" + liveSQL + " UNION ALL " + hongbaoSQL + ")as alls WHERE  1 = 1 AND `gift_id` = 0"
			allArgs = nil
		}
	}
	if soureOther {
		allSQL = "SELECT * FROM " + memberSQL + " as alls  WHERE  1 = 1"
		allArgs = append([]any(nil), memberArgs...)
	}

	// —— 过滤 ——
	where := ""
	var whereArgs []any
	if date != "" {
		start := strToTime(date)
		end := monthEnd(start)
		where += " AND `date` >= ? AND `date` <= ?"
		whereArgs = append(whereArgs, start, end)
	}
	if price != "" {
		parts := strings.Split(price, ",")
		sp := phpFloatval(parts[0])
		ep := 0.0
		if len(parts) > 1 {
			ep = phpFloatval(parts[1])
		}
		switch {
		case sp == 0:
			where += " AND `amount` < ?"
			whereArgs = append(whereArgs, ep)
		case ep == 0:
			where += " AND `amount` > ?"
			whereArgs = append(whereArgs, sp)
		default:
			where += " AND `amount` BETWEEN ? AND ?"
			whereArgs = append(whereArgs, sp, ep)
		}
	}

	var totalCount int
	if err := s.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM ("+allSQL+where+") t", append(append([]any(nil), allArgs...), whereArgs...)...).Scan(&totalCount); err != nil {
		return noData()
	}
	// totalmoney 恒用三路全量 UNION（membersql 仍带 module 过滤、livesql 仍带 gift_id=0，因为它们是在上面拼好的）。
	sumSQL := "SELECT SUM(`amount`) allamount FROM (" + memberSQL + " UNION ALL " + liveSQL + " UNION ALL " + hongbaoSQL + ") as alls WHERE 1 = 1"
	var allAmount sql.NullString
	if err := s.db.QueryRowContext(ctx, sumSQL+where, append(append([]any(nil), memberArgs...), whereArgs...)...).Scan(&allAmount); err != nil {
		return noData()
	}
	if totalCount == 0 {
		return fail(infoEmpty)
	}
	info := rewardPageInfo{
		Page: page, PageSize: pageSize,
		TotalPage:  phpFloat(math.Ceil(float64(totalCount) / float64(pageSize))),
		TotalCount: totalCount,
		Totalmoney: phpFloat(phpFloatval(fmt2(phpFloatval(allAmount.String)))),
	}

	list := []obj{}
	atpage := pageSize * (page - 1)
	// 负数的 LIMIT 在 MySQL 里是语法错误：PHP 侧 results 为 false，list 为空数组。
	if atpage >= 0 && pageSize > 0 {
		rows, err := s.db.QueryContext(ctx, allSQL+where+" ORDER BY `date` DESC LIMIT ?, ?",
			append(append(append([]any(nil), allArgs...), whereArgs...), atpage, pageSize)...)
		if err != nil {
			return noData()
		}
		var got []rewardRow
		for rows.Next() {
			var hid sql.NullString
			var r rewardRow
			if err := rows.Scan(&hid, &r.rewardUser, &r.amount, &r.settle, &r.date, &r.num, &r.giftID, &r.module, &r.aid, &r.kind); err != nil {
				_ = rows.Close()
				return noData()
			}
			got = append(got, r)
		}
		err = rows.Err()
		_ = rows.Close()
		if err != nil {
			return noData()
		}
		titles := map[string]*string{}
		for _, r := range got {
			list = append(list, s.rewardItem(ctx, uid, r, titles))
		}
	}
	return ajax.Response{State: ajax.StateOK, Info: rewardInfo{PageInfo: info, List: list}}
}

func (s *Service) t(name string) string { return "`" + s.prefix + name + "`" }

func (s *Service) rewardItem(ctx context.Context, uid int64, r rewardRow, titles map[string]*string) obj {
	aid := phpIntval(r.aid.String)
	nickname := strPtr(nicknameAnonymous)
	var liveTitle, liveURL string
	if r.kind.String != "member" {
		if r.aid.Valid && r.aid.String != "" {
			var t sql.NullString
			if err := s.db.QueryRowContext(ctx, "SELECT `title` FROM "+s.t("livelist")+" WHERE `id` = ?", phpIntval(r.aid.String)).Scan(&t); err == nil {
				liveTitle = t.String
				liveURL = s.url("live", "h_detail", int64(aid))
			}
		}
	}
	rid := int64(phpIntval(r.rewardUser.String))
	date := formatDate(r.date)
	var out obj

	switch r.kind.String {
	case "member":
		title, url := strPtr(""), ""
		tab := r.module.String + "list"
		col := "title"
		switch r.module.String {
		case "tieba":
			tab = "tieba_list"
		case "circle":
			tab, col = "circle_dynamic_all", "content"
		}
		if prefixPattern.MatchString(tab) && r.aid.Valid {
			var t sql.NullString
			if err := s.db.QueryRowContext(ctx, "SELECT `"+col+"` title FROM "+s.t(tab)+" WHERE `id` = ?", phpIntval(r.aid.String)).Scan(&t); err == nil {
				title = ptr(t)
				tpl := "detail"
				if r.module.String == "circle" {
					tpl = "blog_detail"
				}
				url = s.url(r.module.String, tpl, int64(aid))
			}
		}
		out = obj{{"id", aid}, {"type", 0}, {"title", title}, {"url", url}}
		if rid != -1 {
			ui, nick := s.memberInfo(ctx, uid, rid)
			out = append(out, kv{"userinfo", ui})
			nickname = nick
		}
		modName := strPtr("")
		switch r.module.String {
		case "article", "circle", "tieba", "dating":
			modName = s.moduleTitle(ctx, r.module.String, titles)
		case "chat":
			modName = strPtr("在线聊天")
		}
		out = append(out, kv{"amount", fmt2(phpFloatval(r.amount.String))}, kv{"date", date}, kv{"module", modName})
	case "live":
		_, nickname = s.memberInfo(ctx, uid, rid)
		nick := ""
		if nickname != nil {
			nick = *nickname
		}
		typ := 0
		var title string
		if phpFloatval(r.giftID.String) > 0 {
			typ = 1
			var gift sql.NullString
			if err := s.db.QueryRowContext(ctx, "SELECT `gift_name`, `gift_litpic` FROM "+s.t("live_gift")+" WHERE `id` = ?", phpIntval(r.giftID.String)).Scan(&gift, new(sql.NullString)); err != nil {
				gift = sql.NullString{}
			}
			title = "直播:" + nick + "在" + liveTitle + "中送了" + r.num.String + "个" + gift.String
		} else {
			title = "直播:" + nick + "在" + liveTitle + "打赏了" + fmt2(phpFloatval(r.amount.String)) + "元"
		}
		amount := phpFloatval(r.amount.String)
		settle := phpFloatval(r.settle.String)
		var amountS, fee string
		if settle > 0 {
			amountS = fmt2(settle)
			if amount == 0 {
				fee = "INF%" // 除零按线上实测复刻
			} else {
				fee = fmt2(settle/amount*100) + "%"
			}
		} else {
			amountS = fmt2(amount * liveFee / 100)
			fee = strconv.Itoa(liveFee) + "%"
		}
		out = obj{{"url", liveURL}, {"id", aid}, {"type", typ}, {"title", title}, {"amount", amountS}, {"fee", fee},
			{"module", s.moduleTitle(ctx, "live", titles)}}
	default: // hongbao
		_, nickname = s.memberInfo(ctx, uid, rid)
		out = obj{{"id", aid}, {"url", liveURL}, {"type", 0}, {"title", "直播:" + liveTitle + "中获得红包"},
			{"amount", fmt2(phpFloatval(r.amount.String))}, {"module", s.moduleTitle(ctx, "live", titles)}}
	}
	out = append(out, kv{"reward_userid", rid}, kv{"user", nickname})
	if r.kind.String == "member" {
		return out
	}
	return append(out, kv{"date", date})
}

func (s *Service) url(service, template string, id int64) string {
	if s.moduleURL == nil {
		return ""
	}
	return s.moduleURL(service, template, id)
}

func strPtr(v string) *string { return &v }

// moduleTitle 对应 getModuleTitle(['name'=>x])：subject 优先，查不到返回 nil（JSON null）。
func (s *Service) moduleTitle(ctx context.Context, name string, cache map[string]*string) *string {
	if v, ok := cache[name]; ok {
		return v
	}
	var title, subject sql.NullString
	var out *string
	if err := s.db.QueryRowContext(ctx, "SELECT `title`, `subject` FROM "+s.t("site_module")+" WHERE `name` = ?", name).Scan(&title, &subject); err == nil {
		v := title.String
		if subject.String != "" && subject.String != "0" {
			v = subject.String
		}
		out = &v
	}
	cache[name] = out
	return out
}

// memberInfo 是 getMemberInfo(rid) 的最小投影（只给 reward 用），返回 userinfo 的 JSON 值与昵称。
// 昵称：查不到会员（"No data!" 字符串）→「匿名」；rid < -1（getMemberInfo 给空数组）→ nil（JSON null）。
// rid == 0 时 getMemberInfo 取当前登录会员（uid）。
// 注意：rid 恰好等于登录会员时 PHP 还会多输出一批敏感字段，这里不实现（见交付说明）。
func (s *Service) memberInfo(ctx context.Context, uid, rid int64) (any, *string) {
	if rid == 0 {
		rid = uid
	}
	if rid < 0 {
		return []any{}, nil
	}
	row := s.db.QueryRowContext(ctx, "SELECT `id`, `mtype`, `level`, `certifyState`, `nation`, `licenseState`, `promotion`, `birthday`, `lastloginipaddr`, `money`, `freeze`, `bonus`, `point`, `company`, `nickname`, `realname`, `photo`, `sex`, `wechat_subscribe`, `online`, `cityid`, `addr`, `description`, `address`, `license`, `zhaopin_company`, `zhaopin_resume` FROM "+s.t("member")+" WHERE `state` = 1 AND `mtype` != 0 AND `mtype` != 3 AND `id` = ?", rid)
	var m [27]sql.NullString
	dest := make([]any, len(m))
	for i := range m {
		dest[i] = &m[i]
	}
	if err := row.Scan(dest...); err != nil {
		return memberInfoNoData, strPtr(nicknameAnonymous)
	}
	const (
		cID = iota
		cMtype
		cLevel
		cCertify
		cNation
		cLicenseState
		cPromotion
		cBirthday
		cIP
		cMoney
		cFreeze
		cBonus
		cPoint
		cCompany
		cNickname
		cRealname
		cPhoto
		cSex
		cSubscribe
		cOnline
		cCityid
		cAddr
		cDesc
		cAddress
		cLicense
		cZCompany
		cZResume
	)
	str := func(i int) any { return ptr(m[i]) }
	file := func(f func(string) string, v string) string {
		if f == nil {
			return v
		}
		return f(v)
	}

	levelName, levelIcon := levelNameDefault, ""
	if lv := m[cLevel].String; lv != "" && lv != "0" {
		var name, icon sql.NullString
		if err := s.db.QueryRowContext(ctx, "SELECT `name`, `icon` FROM "+s.t("member_level")+" WHERE `id` = ?", phpIntval(lv)).Scan(&name, &icon); err == nil {
			levelName = name.String
			if icon.String != "" {
				levelIcon = file(s.attachmentFile, icon.String)
			}
		}
	}
	iphome := ""
	if s.ipHome != nil {
		iphome = s.ipHome(m[cIP].String)
	}
	point := 0
	if s.pointState {
		point = phpIntval(m[cPoint].String)
	}
	mtype := phpIntval(m[cMtype].String)
	nick := ptr(m[cNickname])
	if mtype == 2 && m[cCompany].String != "" {
		nick = ptr(m[cCompany])
	}
	var photo string
	switch ph := m[cPhoto].String; {
	case ph == "":
		photo = file(s.attachmentFile, "/static/images/noPhoto_100.jpg")
	case strings.Contains(ph, "http"):
		photo = ph
	default:
		photo = file(s.filePath, ph)
	}

	d := map[string]any{
		"userid": str(cID), "cookiePre": s.cookiePre + "login_user",
		// busiState 对非本人恒未设置 → userType 恒为 1。
		"userType": 1, "level": phpIntval(m[cLevel].String), "certifyState": phpIntval(m[cCertify].String),
		"nation": str(cNation), "licenseState": str(cLicenseState), "promotion": phpFloat(phpFloatval(m[cPromotion].String)),
		"birthday": str(cBirthday), "iphome": iphome,
		"money": phpFloat(phpFloatval(m[cMoney].String)), "freeze": phpFloat(phpFloatval(m[cFreeze].String)),
		"bonus": phpFloat(phpFloatval(m[cBonus].String)), "point": point,
		"levelName": levelName, "levelIcon": levelIcon, "nickname": nick,
		"photo": photo, "photoSource": str(cPhoto), "sex": str(cSex), "wechat_subscribe": str(cSubscribe), "online": str(cOnline),
		"cityid": str(cCityid), "addrid": str(cAddr),
		"description":     strings.NewReplacer("\r\n", "<br />", "\r", "<br />", "\n", "<br />").Replace(m[cDesc].String),
		"addrName":        s.addrName(ctx, phpIntval(m[cAddr].String)),
		"zhaopin_company": phpIntval(m[cZCompany].String), "zhaopin_resume": phpIntval(m[cZResume].String),
	}
	if mtype == 2 {
		d["person"] = str(cRealname)
		d["company"], d["address"], d["license"] = str(cCompany), str(cAddress), str(cLicense)
		d["licenseSource"] = ""
		if m[cLicense].String != "" {
			d["licenseSource"] = file(s.attachmentFile, m[cLicense].String)
		}
		var busiID, busiType any = 0, 0
		var bid, bt sql.NullString
		if err := s.db.QueryRowContext(ctx, "SELECT `id`, `type` FROM "+s.t("business_list")+" WHERE `uid` = ? AND `state` != 4", rid).Scan(&bid, &bt); err == nil {
			busiID, busiType = ptr(bid), ptr(bt)
		}
		d["busiId"], d["busiType"] = busiID, busiType
		d["companyUrl"] = s.url("business", "detail", int64(phpIntval(fmtAny(busiID))))
		d["companyuid"], d["is_staff"], d["autharr"], d["staffid"] = 0, 0, []any{}, 0
	} else {
		d["hidePackage"] = []any{}
		d["companyuid"], d["is_staff"], d["autharr"], d["staffid"] = 0, 0, []any{}, 0
		var sid, auth, cuid sql.NullString
		if err := s.db.QueryRowContext(ctx, "SELECT s.`id`,s.`auth`,l.`uid` FROM "+s.t("staff")+" s LEFT JOIN "+s.t("business_list")+" l ON s.`sid` = l.`id` WHERE  s.`uid` = ?", rid).Scan(&sid, &auth, &cuid); err == nil {
			d["is_staff"], d["staffid"], d["companyuid"] = 1, phpIntval(sid.String), phpIntval(cuid.String)
			if auth.String != "" {
				d["autharr"] = phpUnserializeJSON(auth.String)
			}
		}
	}
	d["dating_uid"] = 0
	if s.datingEnabled {
		var did sql.NullString
		if err := s.db.QueryRowContext(ctx, "SELECT `id` FROM "+s.t("dating_member")+" WHERE `userid` = ? AND `type` = 0 ORDER BY `id` ASC", rid).Scan(&did); err == nil {
			d["dating_uid"] = ptr(did)
		}
	}

	// detail() 末尾 ksort($detail)。
	keys := make([]string, 0, len(d))
	for k := range d {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	out := make(obj, 0, len(keys))
	for _, k := range keys {
		out = append(out, kv{k, d[k]})
	}
	return out, nick
}

func fmtAny(v any) string {
	if p, ok := v.(*string); ok && p != nil {
		return *p
	}
	return "0"
}

// addrName 对应 getParentArr("site_area") + parent_foreach("typename") + array_reverse + join(" > ")。
func (s *Service) addrName(ctx context.Context, addr int) string {
	var names []string
	seen := map[int]bool{}
	for id := addr; id != 0 && !seen[id] && len(seen) < 32; {
		seen[id] = true
		var parent int
		var name sql.NullString
		if err := s.db.QueryRowContext(ctx, "SELECT `parentid`, `typename` FROM "+s.t("site_area")+" WHERE `id` = ?", id).Scan(&parent, &name); err != nil {
			break
		}
		if name.String != "" {
			names = append(names, name.String)
		}
		id = parent
	}
	for i, j := 0, len(names)-1; i < j; i, j = i+1, j-1 {
		names[i], names[j] = names[j], names[i]
	}
	return strings.Join(names, " > ")
}

// ---- 小工具 ----

// looseEqualsInt 对应 PHP `$str == n`：只有数字串才按数值比较。
func looseEqualsInt(v string, n float64) bool {
	if !isNumeric(v) {
		return false
	}
	f, err := strconv.ParseFloat(strings.TrimSpace(v), 64)
	return err == nil && f == n
}

// phpFloatval 对应 (float)$str：取数字前缀。
func phpFloatval(s string) float64 {
	m := numberPrefix.FindString(s)
	if m == "" {
		return 0
	}
	f, _ := strconv.ParseFloat(strings.TrimSpace(m), 64)
	return f
}

// fmt2 对应 PHP sprintf('%.2f', v)：按十进制最短表示四舍五入（1.005 → 1.01，与 PHP 一致，与 C 不同）。
func fmt2(v float64) string {
	if math.IsInf(v, 0) || math.IsNaN(v) {
		return strconv.FormatFloat(v, 'f', 2, 64)
	}
	neg := v < 0
	str := strconv.FormatFloat(math.Abs(v), 'f', -1, 64)
	ip, fp, _ := strings.Cut(str, ".")
	for len(fp) < 3 {
		fp += "0"
	}
	n, _ := new(big.Int).SetString(ip+fp[:2], 10)
	if fp[2] >= '5' {
		n.Add(n, big.NewInt(1))
	}
	digits := n.String()
	for len(digits) < 3 {
		digits = "0" + digits
	}
	out := digits[:len(digits)-2] + "." + digits[len(digits)-2:]
	if neg {
		out = "-" + out
	}
	return out
}

// strToTime 是 strtotime() 对常见日期格式的子集实现（应用时区 UTC+8）；失败返回 0（PHP 的 false 拼进 SQL 后等价于 0）。
func strToTime(v string) int64 {
	v = strings.TrimSpace(v)
	for _, layout := range []string{
		"2006-01-02 15:04:05", "2006-01-02 15:04", "2006-1-2 15:04:05", "2006-1-2", "2006-01-02",
		"2006/01/02 15:04:05", "2006/1/2", "2006/01/02", "2006-01", "2006-1", "2006/01", "2006/1",
		"20060102", "2006年1月2日", "2006年1月",
	} {
		if t, err := time.ParseInLocation(layout, v, gmt8); err == nil {
			return t.Unix()
		}
	}
	return 0
}

// monthEnd 对应 mktime(23,59,59, date('m'), date('t'), date('y'))：两位年份 70-99 → 19xx，00-69 → 20xx。
func monthEnd(start int64) int64 {
	t := time.Unix(start, 0).In(gmt8)
	yy := t.Year() % 100
	year := 2000 + yy
	if yy >= 70 {
		year = 1900 + yy
	}
	days := time.Date(t.Year(), t.Month()+1, 0, 0, 0, 0, 0, gmt8).Day()
	return time.Date(year, t.Month(), days, 23, 59, 59, 0, gmt8).Unix()
}

// phpUnserializeJSON 把 PHP serialize 字符串转成可 JSON 编码的值；失败（unserialize 返回 false）→ false。
func phpUnserializeJSON(s string) any {
	p := &phpParser{s: s}
	v, ok := p.value()
	if !ok {
		return false
	}
	return v
}

type phpParser struct {
	s string
	i int
}

func (p *phpParser) until(c byte) (string, bool) {
	j := strings.IndexByte(p.s[p.i:], c)
	if j < 0 {
		return "", false
	}
	out := p.s[p.i : p.i+j]
	p.i += j + 1
	return out, true
}

func (p *phpParser) value() (any, bool) {
	if p.i+1 >= len(p.s) {
		return nil, false
	}
	t := p.s[p.i]
	if t == 'N' && p.s[p.i+1] == ';' {
		p.i += 2
		return nil, true
	}
	if p.s[p.i+1] != ':' {
		return nil, false
	}
	p.i += 2
	switch t {
	case 'b', 'i', 'd':
		raw, ok := p.until(';')
		if !ok {
			return nil, false
		}
		switch t {
		case 'b':
			return raw == "1", true
		case 'i':
			n, err := strconv.ParseInt(raw, 10, 64)
			return n, err == nil
		}
		f, err := strconv.ParseFloat(raw, 64)
		return phpFloat(f), err == nil
	case 's':
		ln, ok := p.until(':')
		n, err := strconv.Atoi(ln)
		if !ok || err != nil || n < 0 || p.i+n+3 > len(p.s) || p.s[p.i] != '"' || p.s[p.i+1+n:p.i+n+3] != `";` {
			return nil, false
		}
		out := p.s[p.i+1 : p.i+1+n]
		p.i += n + 3
		return out, true
	case 'a':
		cnt, ok := p.until(':')
		n, err := strconv.Atoi(cnt)
		if !ok || err != nil || n < 0 || p.i >= len(p.s) || p.s[p.i] != '{' {
			return nil, false
		}
		p.i++
		keys := make([]any, 0, n)
		vals := make([]any, 0, n)
		for k := 0; k < n; k++ {
			key, ok := p.value()
			if !ok {
				return nil, false
			}
			val, ok := p.value()
			if !ok {
				return nil, false
			}
			keys, vals = append(keys, key), append(vals, val)
		}
		if p.i >= len(p.s) || p.s[p.i] != '}' {
			return nil, false
		}
		p.i++
		list := true
		for idx, key := range keys {
			if n, ok := key.(int64); !ok || n != int64(idx) {
				list = false
			}
		}
		if list {
			return append([]any{}, vals...), true
		}
		o := make(obj, 0, n)
		for idx, key := range keys {
			o = append(o, kv{k: fmtKey(key), v: vals[idx]})
		}
		return o, true
	}
	return nil, false
}

func fmtKey(k any) string {
	if n, ok := k.(int64); ok {
		return strconv.FormatInt(n, 10)
	}
	s, _ := k.(string)
	return s
}
