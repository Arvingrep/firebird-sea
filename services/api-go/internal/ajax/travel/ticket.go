// ticket.go 是 travel 批次2（#371）的 ticketList / ticketDetail。
package travel

import (
	"context"
	"strconv"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// ticketList（travel.class.php:2276-2602）：景点门票分页列表（表别名 l）。
//
// 口径要点：
//   - totalCount 经 (int) 强转 → JSON 数字（唯一一个带强转的列表）；
//   - business 参数覆盖 addrid 后递归展开；
//   - price=min(ticketinfo typeid='0') sprintf("%.2f")、sale=sum(typeid='0')；
//   - orderby 1/2/3/4/5(distance DESC)/6(sale)/7(flag)/8(price ASC)/default。
func (s *Service) ticketList(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	host := reqHost(req)
	p := req.Params

	search := p.Get("search")
	if !truthy(search) {
		search = p.Get("keywords")
	}
	store := p.Get("store")
	state := p.Get("state")
	flag := commaJoin(p, "flag")
	noid := commaJoin(p, "noid")
	page := phpDefaultPage(p.Get("page"), 1)
	pageSize := phpDefaultPage(p.Get("pageSize"), 10)
	viewer := s.viewerID(ctx, req)

	where := ""
	if truthy(p.Get("rec")) {
		where += " AND `rec` = 1"
	}
	if truthy(flag) {
		where += " AND `flag` in (" + flag + ")"
	}
	if truthy(noid) {
		where += " AND `id` not in (" + noid + ")"
	}
	if phpInt(p.Get("u")) != 1 {
		where += " AND `state` = 1"
		if cityid := s.cityID(ctx, req, p.Get("cityid")); cityid > 0 {
			where += s.listFrontCity(ctx, cityid)
		}
	} else {
		// 会员态商家鉴权（userType==2 && !verifyModuleAuth）未复刻：企业用户才会触发。
		where += s.listMemberOwn(ctx, viewer)
	}
	if truthy(store) {
		where += " AND `company` = '" + store + "'"
	}
	// business 覆盖 addrid。
	addrid := p.Get("addrid")
	if truthy(p.Get("business")) {
		addrid = p.Get("business")
	}
	if truthy(addrid) {
		where += " AND `addrid` in (" + s.lowerAddrs(ctx, addrid) + ")"
	}
	where += s.listLikeSearch(ctx, search, "`title`")

	lng, lat := p.Get("lng"), p.Get("lat")
	hasGeo := truthy(lng) && truthy(lat)
	var selectExtra string
	var extraArgs []any
	if hasGeo {
		// ticketList 的 distance 插在 pubdate 之后、state 之前。
		selectExtra = distanceSelect + ", "
		extraArgs = append(extraArgs, lat, lat, lng)
	}

	const minPriceSub = "(SELECT min(c.`price`) FROM `__T__travel_ticketinfo` c WHERE c.`ticketid` = l.`id` AND c.`typeid` = '0' ) AS price"
	const sumSaleSub = "(SELECT sum(c.`sale`) FROM `__T__travel_ticketinfo` c WHERE c.`ticketid` = l.`id` AND c.`typeid` = '0' ) AS sale"
	archives := "SELECT `id`, `title`, `flag`, `rec`, `userid`, `company`, `address`, `pics`, `video`, `opentime`, `tag`, `cityid`, `travelname`, `addrid`, `click`, `pubdate`, " +
		selectExtra + "`state`, " +
		strings.Replace(strings.Replace(minPriceSub, "__T__", s.prefix, 1), "__T__", s.prefix, 1) + ", " +
		strings.Replace(strings.Replace(sumSaleSub, "__T__", s.prefix, 1), "__T__", s.prefix, 1) +
		"  FROM `" + s.prefix + "travel_ticket` l WHERE 1 = 1" + where

	// (int) 强转：ticketList 的 totalCount 是 JSON 数字。
	totalCount := phpInt(s.countTotal(ctx, "SELECT COUNT(`id`) total FROM `"+s.prefix+"travel_ticket` l WHERE 1 = 1"+where))
	if totalCount == 0 {
		return respFail(infoNoDataCnt)
	}

	pageinfo := newOmap()
	pageinfo.set("page", page)
	pageinfo.set("pageSize", pageSize)
	pageinfo.set("totalPage", phpCeil(strconv.Itoa(totalCount), float64(pageSize)))
	pageinfo.set("totalCount", totalCount)

	if phpInt(p.Get("u")) == 1 && viewer > -1 {
		gray, audit, refuse := s.grayAuditRefuse(ctx, archives, "`state`", extraArgs)
		pageinfo.set("gray", gray)
		pageinfo.set("audit", audit)
		pageinfo.set("refuse", refuse)
	}

	// `$state != ''`：追加进 $archives（列表 SQL；gray 统计在其之前）。
	if state != "" {
		archives += " AND `state` = " + state
	}
	orderBy := ticketListOrderby(p.Get("orderby"), hasGeo)
	q := archives + orderBy + limitClause(page, pageSize)
	rows, ok := s.queryRows(ctx, q, extraArgs...)
	if !ok {
		return respOK(pagedPayloadList(pageinfo, []any{}))
	}
	list := make([]any, 0, len(rows))
	for _, val := range rows {
		item := newOmap()
		item.set("id", val.get("id"))
		item.set("price", phpSprintf2f(val.str("price")))
		item.set("title", val.get("title"))
		item.set("userid", val.get("userid"))
		item.set("company", val.get("company"))
		item.set("sale", val.get("sale"))
		item.set("click", val.get("click"))
		item.set("pubdate", val.get("pubdate"))
		item.set("state", val.get("state"))
		item.set("travelname", val.get("travelname"))
		item.set("cityid", val.get("cityid"))
		item.set("opentime", val.get("opentime"))
		item.set("flag", val.get("flag"))
		item.set("rec", val.get("rec"))
		flagname := ""
		if truthy(val.str("flag")) {
			flagname = typeNameByID(starTypeItems(), val.str("flag"))
		}
		item.set("flagname", flagname)
		if hasGeo {
			item.set("distance", distanceText(phpLooseFloat(val.str("distance"))))
		} else {
			item.set("distance", "0.0m")
		}
		item.set("addrname", addrnameOf(ctx, s, val.str("addrid")))
		item.set("tagAll", tagAllOf(val.str("tag")))
		litpic := ""
		if truthy(val.str("pics")) {
			litpic = s.filePath(ctx, host, strings.Split(val.str("pics"), ",")[0])
		}
		item.set("litpic", litpic)
		item.set("video", s.filePath(ctx, host, val.str("video")))
		item.set("url", s.urlOf(ctx, host, "ticket-detail", val.str("id")))
		item.set("store", s.nestedStore(ctx, host, req, viewer, val.str("company")))
		list = append(list, item)
	}
	return respOK(pagedPayloadList(pageinfo, list))
}

// ticketListOrderby 复刻 ticketList 的 switch（rec 第二键；distance 档是 DESC）。
func ticketListOrderby(raw string, hasGeo bool) string {
	switch phpSwitchInt(raw) {
	case 1:
		return " ORDER BY `click` DESC, `rec` DESC, `weight` DESC, `id` DESC"
	case 2:
		return " ORDER BY `pubdate` DESC, `rec` DESC, `weight` DESC, `id` DESC"
	case 3:
		return " ORDER BY `rec` DESC, `weight` DESC, `pubdate` DESC, `id` DESC"
	case 4:
		return " ORDER BY `price` DESC, `rec` DESC, `weight` DESC, `pubdate` DESC, `id` DESC"
	case 8:
		return " ORDER BY `price` ASC, `rec` DESC, `weight` DESC, `pubdate` DESC, `id` DESC"
	case 5:
		if hasGeo {
			return " ORDER BY distance DESC, `rec` DESC, `weight` DESC, `pubdate` DESC, `id` DESC"
		}
		return ""
	case 6:
		return " ORDER BY `sale` DESC, `rec` DESC, `weight` DESC, `pubdate` DESC, `id` DESC"
	case 7:
		return " ORDER BY `flag` DESC, `rec` DESC, `weight` DESC, `pubdate` DESC, `id` DESC"
	default:
		return " ORDER BY `weight` DESC, `pubdate` DESC, `id` DESC"
	}
}

// phpSprintf2f 复刻 sprintf("%.2f", $v)：null/非数字 → "0.00"。
func phpSprintf2f(v string) string {
	if v == "" || v == "0" {
		return "0.00"
	}
	if isNumericString(v) {
		return strconv.FormatFloat(phpLooseFloat(v), 'f', 2, 64)
	}
	// PHP 8：sprintf 对非数字串给 warning 且按 0 处理。
	return "0.00"
}

// ticketDetail（travel.class.php:2603-2774）。
func (s *Service) ticketDetail(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	host := reqHost(req)
	id := req.Params.Get("id")
	if !isNumericString(id) {
		return respFail(infoFormatError)
	}
	if s.db == nil {
		return respNoData()
	}

	q := "SELECT `id`, `title`, `userid`, `note`, `company`, `pics`, `opentime`, `tag`, `video`, `lng`, `lat`, `cityid`, `travelname`, `addrid`, `address`, `click`, `pubdate`, `state`, `jdnote`, `date`, `openStart`, `openEnd`, `level` FROM `" +
		s.prefix + "travel_ticket` WHERE `id` = " + id
	rows, ok := s.queryRows(ctx, q)
	if !ok || len(rows) == 0 {
		return respNoData()
	}
	r := rows[0]
	viewer := s.viewerID(ctx, req)

	d := newOmap()
	d.set("id", r.get("id"))
	d.set("lng", r.get("lng"))
	d.set("lat", r.get("lat"))
	d.set("title", r.get("title"))
	d.set("userid", r.get("userid"))
	d.set("company", r.get("company"))
	d.set("opentime", r.get("opentime"))
	d.set("cityid", r.get("cityid"))
	d.set("click", r.get("click"))
	d.set("pubdate", r.get("pubdate"))
	d.set("state", r.get("state"))
	d.set("addrid", r.get("addrid"))
	d.set("address", r.get("address"))
	d.set("note", r.get("note"))
	d.set("jdnote", r.get("jdnote"))
	d.set("tag", r.get("tag"))
	d.set("video", r.get("video"))
	videopath := ""
	if truthy(r.str("video")) {
		videopath = s.filePath(ctx, host, r.str("video"))
	}
	d.set("videopath", videopath)
	d.set("travelname", r.get("travelname"))
	d.set("openStart", r.get("openStart"))
	d.set("openEnd", r.get("openEnd"))
	d.set("level", r.get("level"))
	d.set("body", r.get("note")) // body = note 的重复输出

	openweek, weekRaw := typePairs(weekItems(), r.str("date"))
	weekkParts := []string{}
	for _, m := range openweek {
		weekkParts = append(weekkParts, m.(*omap).vals["val"].(string))
	}
	d.set("weekk", strings.Join(weekkParts, ","))
	d.set("openweek", openweek)
	d.set("openweek_", weekRaw)

	// workArr：ticketinfo typeid='0'，ORDER BY weight DESC, pubdate DESC, id DESC。
	workArr := []any{}
	rr, ok2 := s.queryRows(ctx, "SELECT `id`, `title`, `price`, `specialtime` FROM `"+
		s.prefix+"travel_ticketinfo` WHERE `typeid` = '0' AND `ticketid` = '"+id+"' ORDER BY `weight` DESC, `pubdate` DESC, `id` DESC")
	if ok2 {
		for k, rv := range rr {
			m := newOmap()
			m.set("id", rv.get("id"))
			m.set("title", rv.get("title"))
			m.set("price", rv.get("price"))
			st, stj := specialtimeOut(rv.str("specialtime"))
			m.set("specialtime", st)
			m.set("specialtimejson", stj)
			workArr = appendAt(workArr, k, m)
		}
	}
	d.set("workArr", workArr)

	// minprice：workArr 空恒 0；否则 min(array_column(workArr,'price'))——数值串按数值
	// 比较，返回原字符串（JSON 字符串）。
	if len(workArr) == 0 {
		d.set("minprice", 0)
	} else {
		minStr := ""
		first := true
		for _, w := range workArr {
			pr := w.(*omap).vals["price"]
			ps, _ := pr.(string)
			if first {
				minStr = ps
				first = false
				continue
			}
			if phpPriceLess(ps, minStr) {
				minStr = ps
			}
		}
		d.set("minprice", minStr)
	}

	d.set("common", s.commentTotal(ctx, "travel-ticket", id))
	d.set("addrname", addrnameOf(ctx, s, r.str("addrid")))
	d.set("tagAll", tagAllOf(r.str("tag")))
	d.set("pics", s.pathSourceList(ctx, host, r.str("pics")))
	d.set("store", s.nestedStore(ctx, host, req, viewer, r.str("company")))
	d.set("companyurl", s.urlOf(ctx, host, "store-detail", r.str("company")))

	collect := ""
	if s.collectCheck != nil {
		collect = s.collectCheck(req, "travel", "ticket-detail", "add", r.str("id"))
	}
	d.set("collect", boolInt(collect == "has"))

	return respOK(d)
}

// phpPriceLess 是 PHP min() 的数值串比较（非数值串按字符串比较；本列恒为数值串）。
func phpPriceLess(a, b string) bool {
	if isNumericString(a) && isNumericString(b) {
		return phpLooseFloat(a) < phpLooseFloat(b)
	}
	return a < b
}

// commentTotal 复刻 public_comment_all 的 totalCount（ischeck=1、pid=0）。
func (s *Service) commentTotal(ctx context.Context, typ, aid string) int {
	n := s.countRows(ctx, "SELECT `id` FROM `"+s.prefix+"public_comment_all` WHERE `ischeck` = 1 AND `type` = '"+typ+"' AND `aid` = '"+aid+"' AND `pid` = 0")
	if n < 0 {
		// dsqlOper 错误返回错误串 → $countcomment 赋错误串…… json_encode 后是字符串。
		// 但错误面只在表缺失时出现；canary 本地表存在 → 不可达，按 0 降级（#371 留档）。
		return 0
	}
	return n
}
