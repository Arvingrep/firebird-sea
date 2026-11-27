// agency.go 是 travel 批次2（#371）的 agencyList / agencyDetail。
package travel

import (
	"context"
	"math"
	"strconv"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// agencyList（travel.class.php:4305-4600）：一日游/跟团游分页列表（表别名 l）。
//
// 口径要点：
//   - price 区间基于 avg(ticketinfo typeid='1') 子查询（三态括号口径照抄）；
//   - price = avg round(2)（falsy → 0，注意是 round 非 sprintf）；
//   - ywday != 0 → AND ywday = $ywday；typeid 等值（不走 commaJoin）；
//   - orderby 1/2/3(sale,click)/4(flag,click)/5(price DESC,click)/6(price ASC,click)/default。
func (s *Service) agencyList(req *ajax.Request) ajax.Response {
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
	typeid := p.Get("typeid")
	flag := commaJoin(p, "flag")
	noid := commaJoin(p, "noid")
	ywday := phpInt(p.Get("ywday"))
	page := phpDefaultPage(p.Get("page"), 1)
	pageSize := phpDefaultPage(p.Get("pageSize"), 10)
	viewer := s.viewerID(ctx, req)

	where := ""
	if phpInt(p.Get("u")) != 1 {
		where += " AND `state` = 1"
		if cityid := s.cityID(ctx, req, p.Get("cityid")); cityid > 0 {
			where += s.listFrontCity(ctx, cityid)
		}
	} else {
		// 会员态商家鉴权未复刻；state 过滤在该分支内。
		where += s.listMemberOwn(ctx, viewer)
		if state != "" {
			where += " AND `state` = " + state
		}
	}
	if truthy(store) {
		where += " AND `company` = '" + store + "'"
	}
	if typeid != "" {
		where += " AND `typeid` = '" + typeid + "'"
	}
	if truthy(noid) {
		where += " AND `id` not in (" + noid + ")"
	}
	if truthy(flag) {
		where += " AND `flag` in (" + flag + ")"
	}
	if ywday != 0 {
		where += " AND `ywday`  = " + strconv.Itoa(ywday)
	}
	if truthy(p.Get("addrid")) {
		where += " AND `addrid` in (" + s.lowerAddrs(ctx, p.Get("addrid")) + ")"
	}

	const avgSub = "(SELECT avg(c.`price`) FROM `__T__travel_ticketinfo` c WHERE c.`ticketid` = l.`id` AND c.`typeid` = '1')"
	// 价格区间（canary 原文，含第一个分支的多余括号）。
	price := commaJoin(p, "price")
	if price != "" {
		pr := strings.Split(price, ",")
		p0, p1 := "", ""
		if len(pr) > 0 {
			p0 = pr[0]
		}
		if len(pr) > 1 {
			p1 = pr[1]
		}
		sub1 := strings.Replace(avgSub, "__T__", s.prefix, 1)
		sub2 := strings.Replace(avgSub+" AND c.`price`", "__T__", s.prefix, 1)
		switch {
		case p0 == "":
			where += " AND ( (" + sub1 + ") is null or (" + sub2 + " < " + p1 + "))"
		case p1 == "":
			where += " AND (" + sub2 + " > " + p0 + ")"
		default:
			where += " AND (" + sub2 + " BETWEEN " + p0 + " AND " + p1 + ")"
		}
	}
	if truthy(search) {
		sids := s.storeLikeSids(ctx, search)
		if len(sids) > 0 {
			where += " AND (`title` like '%" + search + "%' OR `company` in (" + strings.Join(sids, ",") + "))"
		} else {
			where += " AND `title` like '%" + search + "%'"
		}
	}

	archives := "SELECT `id`, `title`, `userid`, `company`, `flag`, `address`, `missiontime`, `pics`, `video`, `travelservice`, `tag`, `cityid`, `typeid`, `addrid`, `click`, `pubdate`, `ywday`,(" +
		strings.Replace(avgSub, "__T__", s.prefix, 1) + " ) AS price, (SELECT sum(c.`sale`) FROM `" + s.prefix +
		"travel_ticketinfo` c WHERE c.`ticketid` = l.`id` AND c.`typeid` = '1' ) AS sale, `state`  FROM `" +
		s.prefix + "travel_agency` l WHERE 1 = 1" + where

	totalCount := s.countTotal(ctx, "SELECT COUNT(`id`) total FROM `"+s.prefix+"travel_agency` l WHERE 1 = 1"+where)
	if looseZero(totalCount) {
		return respFail(infoNoDataCnt)
	}

	pageinfo := basePageinfo(page, pageSize, totalCount)
	if phpInt(p.Get("u")) == 1 && viewer > -1 {
		gray, audit, refuse := s.grayAuditRefuse(ctx, archives, "`state`", nil)
		pageinfo.set("gray", gray)
		pageinfo.set("audit", audit)
		pageinfo.set("refuse", refuse)
	}

	q := archives + agencyListOrderby(p.Get("orderby")) + limitClause(page, pageSize)
	rows, ok := s.queryRows(ctx, q)
	if !ok {
		return respOK(pagedPayloadList(pageinfo, []any{}))
	}
	list := make([]any, 0, len(rows))
	for _, val := range rows {
		item := newOmap()
		item.set("id", val.get("id"))
		item.set("title", val.get("title"))
		item.set("missiontime", val.get("missiontime"))
		item.set("userid", val.get("userid"))

		// price：round(price, 2)（falsy → 0）；PHP round 返回 float → JSON "N.0"/"N.NN"。
		priceOut := any(0.0)
		if truthyAny(val.get("price")) && isNumericString(val.str("price")) {
			priceOut = phpFloatOf(phpRound2(phpLooseFloat(val.str("price"))))
		}
		item.set("price", priceOut)

		item.set("company", val.get("company"))
		item.set("click", val.get("click"))
		item.set("pubdate", val.get("pubdate"))
		item.set("state", val.get("state"))
		item.set("ywday", val.get("ywday"))
		item.set("cityid", val.get("cityid"))
		item.set("typeid", val.get("typeid"))
		typename := ""
		if truthy(val.str("typeid")) {
			typename = typeNameByID(travelagencyTypeItems(), val.str("typeid"))
		}
		item.set("typename", typename)
		item.set("flag", val.get("flag"))
		flagname := ""
		if truthy(val.str("flag")) {
			flagname = typeNameByID(starTypeItems(), val.str("flag"))
		}
		item.set("flagname", flagname)
		item.set("sale", val.get("sale"))
		item.set("addrname", addrnameOf(ctx, s, val.str("addrid")))
		item.set("tagAll", tagAllOf(val.str("tag")))
		litpic := ""
		if truthy(val.str("pics")) {
			litpic = s.filePath(ctx, host, strings.Split(val.str("pics"), ",")[0])
		}
		item.set("litpic", litpic)
		item.set("video", s.filePath(ctx, host, val.str("video")))
		item.set("url", s.urlOf(ctx, host, "agency-detail", val.str("id")))

		st := s.nestedStore(ctx, host, req, viewer, val.str("company"))
		item.set("store", st)

		// travelservice：空则取 store.title，再空则 ''。
		travelservice := val.str("travelservice")
		if !truthy(travelservice) {
			if stMap, ok := st.(*omap); ok && stMap != nil {
				if t, ok := stMap.vals["title"].(string); ok && truthy(t) {
					travelservice = t
				}
			}
		}
		item.set("travelservice", travelservice)
		list = append(list, item)
	}
	return respOK(pagedPayloadList(pageinfo, list))
}

// phpRound2 复刻 PHP round($v, 2)（四舍五入；Go math.Round 对 .5 远离零，同 PHP）。
func phpRound2(f float64) float64 {
	return math.Round(f*100) / 100
}

// agencyListOrderby 复刻 agencyList 的 switch。
func agencyListOrderby(raw string) string {
	switch phpSwitchInt(raw) {
	case 1:
		return " ORDER BY `click` DESC, `weight` DESC, `id` DESC"
	case 2:
		return " ORDER BY `pubdate` DESC, `weight` DESC, `id` DESC"
	case 3:
		return " ORDER BY `sale` DESC, `click` DESC, `weight` DESC, `pubdate` DESC, `id` DESC"
	case 4:
		return " ORDER BY `flag` DESC, `click` DESC, `weight` DESC, `pubdate` DESC, `id` DESC"
	case 5:
		return " ORDER BY `price` DESC, `click` DESC, `weight` DESC, `pubdate` DESC, `id` DESC"
	case 6:
		return " ORDER BY `price` ASC, `click` DESC, `weight` DESC, `pubdate` DESC, `id` DESC"
	default:
		return " ORDER BY `weight` DESC, `pubdate` DESC, `id` DESC"
	}
}

// agencyDetail（travel.class.php:4601-4781）。
func (s *Service) agencyDetail(req *ajax.Request) ajax.Response {
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

	q := "SELECT `id`, `title`, `userid`, `flag`, `level`, `typeid`, `instructions`, `expense`, `itinerary`, `note`, `company`, `imglist`, `pics`, `missiontime`, `missiontype`, `tag`, `video`, `cityid`, `travelservice`, `addrid`, `address`, `click`, `pubdate`, `ywday`,(SELECT avg(c.`price`) FROM `" +
		s.prefix + "travel_ticketinfo` c WHERE c.`ticketid` = l.`id` AND c.`typeid` = '1' ) AS price, `state`  FROM `" +
		s.prefix + "travel_agency` l WHERE `id` = " + id
	rows, ok := s.queryRows(ctx, q)
	if !ok || len(rows) == 0 {
		return respNoData()
	}
	r := rows[0]
	viewer := s.viewerID(ctx, req)

	d := newOmap()
	d.set("id", r.get("id"))
	d.set("title", r.get("title"))
	d.set("userid", r.get("userid"))
	d.set("company", r.get("company"))
	d.set("missiontype", r.get("missiontype"))

	// missiontime：missiontype==1 → stripslashes(json_encode(explode(',', missiontime)))；
	// explode("",",") 在 PHP 是 [""]（Split 空串同样给 [""]，口径一致）。
	if r.str("missiontype") == "1" {
		parts := strings.Split(r.str("missiontime"), ",")
		b, _ := jsonMarshal(parts)
		d.set("missiontime", phpStripslashes(string(b)))
	} else {
		d.set("missiontime", r.get("missiontime"))
	}

	d.set("typeid", r.get("typeid"))
	d.set("cityid", r.get("cityid"))
	d.set("click", r.get("click"))
	d.set("pubdate", r.get("pubdate"))
	d.set("state", r.get("state"))
	d.set("addrid", r.get("addrid"))
	d.set("address", r.get("address"))
	d.set("note", r.get("note"))
	d.set("ywday", r.get("ywday"))

	priceOut := any(0.0)
	if truthyAny(r.get("price")) && isNumericString(r.str("price")) {
		priceOut = phpFloatOf(phpRound2(phpLooseFloat(r.str("price"))))
	}
	d.set("price", priceOut)

	d.set("tag", r.get("tag"))
	d.set("expense", r.get("expense"))
	d.set("instructions", r.get("instructions"))
	d.set("video", r.get("video"))
	videopath := ""
	if truthy(r.str("video")) {
		videopath = s.filePath(ctx, host, r.str("video"))
	}
	d.set("videopath", videopath)
	d.set("travelservice", r.get("travelservice"))
	typename := ""
	if truthy(r.str("typeid")) {
		typename = typeNameByID(travelagencyTypeItems(), r.str("typeid"))
	}
	d.set("typename", typename)
	d.set("flag", r.get("flag"))
	flagname := ""
	if truthy(r.str("flag")) {
		flagname = typeNameByID(starTypeItems(), r.str("flag"))
	}
	d.set("flagname", flagname)
	d.set("level", r.get("level"))
	d.set("common", s.commentTotal(ctx, "travel-agency", id))

	// itineraryArr：|||/$$$ 拆分，note 不做 nl2br。
	itineraryArr := []any{}
	if truthy(r.str("itinerary")) {
		for k, seg := range strings.Split(r.str("itinerary"), "|||") {
			parts := strings.Split(seg, "$$$")
			m := newOmap()
			if len(parts) > 0 {
				m.set("title", parts[0])
			}
			note := ""
			if len(parts) > 1 {
				note = parts[1]
			}
			m.set("note", note)
			itineraryArr = appendAt(itineraryArr, k, m)
		}
	}
	d.set("itineraryArr", itineraryArr)

	// workArr：ticketinfo typeid='1'，specialtime 有 is_array 兜底。
	workArr := []any{}
	rr, ok2 := s.queryRows(ctx, "SELECT `id`, `title`, `price`, `specialtime` FROM `"+
		s.prefix+"travel_ticketinfo` WHERE `typeid` = '1' AND `ticketid` = '"+id+"' ORDER BY `weight` DESC, `pubdate` DESC, `id` DESC")
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

	d.set("addrname", addrnameOf(ctx, s, r.str("addrid")))
	d.set("tagAll", tagAllOf(r.str("tag")))
	d.set("pics", s.pathSourceList(ctx, host, r.str("pics")))
	d.set("imglist", s.pathSourceList(ctx, host, r.str("imglist")))
	d.set("store", s.nestedStore(ctx, host, req, viewer, r.str("company")))
	d.set("companyurl", s.urlOf(ctx, host, "store-detail", r.str("company")))

	collect := ""
	if s.collectCheck != nil {
		collect = s.collectCheck(req, "travel", "agency-detail", "add", r.str("id"))
	}
	d.set("collect", boolInt(collect == "has"))

	return respOK(d)
}
