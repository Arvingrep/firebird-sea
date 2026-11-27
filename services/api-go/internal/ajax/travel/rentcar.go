// rentcar.go 是 travel 批次2（#371）的 rentcarList / rentcarDetail。
package travel

import (
	"context"
	"strconv"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// rentcarList（travel.class.php:2963-3250）：租车分页列表。
//
// 口径要点：
//   - 前台 cityid：`cityid = $cityid AND company in (ids)`（有店）/ 仅 cityid（无店），
//     与 hotel/ticket 的 company-in-only 口径不同（store 查询不带 state=1）；
//   - addrid：先查 store by addrid → `(company in OR addrid in)` / 仅 addrid；
//   - 会员态 `$state` 过滤只进列表 SQL（$where1），不影响 totalCount 与 gray 统计；
//   - typeid 走 IN 展开；price 区间直查；typename 直查 rentcartype 表。
func (s *Service) rentcarList(req *ajax.Request) ajax.Response {
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
	typeid := commaJoin(p, "typeid")
	noid := commaJoin(p, "noid")
	page := phpDefaultPage(p.Get("page"), 1)
	pageSize := phpDefaultPage(p.Get("pageSize"), 10)
	viewer := s.viewerID(ctx, req)

	where := ""
	if phpInt(p.Get("u")) != 1 {
		where += " AND `state` = 1"
		if cityid := s.cityID(ctx, req, p.Get("cityid")); cityid > 0 {
			sids := s.cityStoreSids(ctx, strconv.Itoa(cityid), false)
			if len(sids) > 0 {
				where += " AND `cityid` = '" + strconv.Itoa(cityid) + "' AND `company` in (" + strings.Join(sids, ",") + ")"
			} else {
				where += " AND `cityid` = '" + strconv.Itoa(cityid) + "'"
			}
		}
	} else {
		// 会员态商家鉴权未复刻（同 hotel/ticket）。
		where += s.listMemberOwn(ctx, viewer)
	}
	if truthy(store) {
		where += " AND `company` = '" + store + "'"
	}
	if truthy(typeid) {
		where += " AND `typeid` IN (" + typeid + ")"
	}
	if truthy(noid) {
		where += " AND `id` NOT IN (" + noid + ")"
	}
	price := commaJoin(p, "price")
	if truthy(price) {
		pr := strings.Split(price, ",")
		p0, p1 := "", ""
		if len(pr) > 0 {
			p0 = pr[0]
		}
		if len(pr) > 1 {
			p1 = pr[1]
		}
		switch {
		case p0 == "" && truthy(p1):
			where += " AND `price` < " + p1
		case p1 == "" && truthy(p0):
			where += " AND `price` > " + p0
		case p0 != "" && p1 != "":
			where += " AND `price` BETWEEN " + p0 + " AND " + p1
		}
	}
	if truthy(p.Get("addrid")) {
		lower := s.lowerAddrs(ctx, p.Get("addrid"))
		sids := s.storeAddrSids(ctx, lower)
		if len(sids) > 0 {
			where += " AND (`company` in (" + strings.Join(sids, ",") + ") OR `addrid` in (" + lower + "))"
		} else {
			where += " AND `addrid` in (" + lower + ")"
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

	archives := "SELECT `id`, `price`, `title`, `userid`, `company`, `address`, `pics`, `video`, `typeid`, `tag`, `cityid`, `addrid`, `click`, `pubdate`, `state` FROM `" +
		s.prefix + "travel_rentcar` WHERE 1 = 1" + where

	totalCount := s.countTotal(ctx, "SELECT COUNT(`id`) total FROM `"+s.prefix+"travel_rentcar` WHERE 1 = 1"+where)
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

	// $where1：state 过滤只对列表 SQL 生效（PHP：$archives.$where1.$orderby_.$where）。
	where1 := ""
	if phpInt(p.Get("u")) == 1 && state != "" {
		where1 = " AND `state` = " + state
	}
	orderBy := rentcarListOrderby(p.Get("orderby"))
	q := archives + where1 + orderBy + limitClause(page, pageSize)
	rows, ok := s.queryRows(ctx, q)
	if !ok {
		return respOK(pagedPayloadList(pageinfo, []any{}))
	}
	list := make([]any, 0, len(rows))
	for _, val := range rows {
		item := newOmap()
		item.set("id", val.get("id"))
		item.set("title", val.get("title"))
		item.set("userid", val.get("userid"))
		item.set("company", val.get("company"))
		item.set("click", val.get("click"))
		item.set("pubdate", val.get("pubdate"))
		item.set("state", val.get("state"))
		item.set("typeid", val.get("typeid"))
		item.set("cityid", val.get("cityid"))
		item.set("price", val.get("price"))
		item.set("typename", s.typeNameDB(ctx, "travel_rentcartype", val.str("typeid")))
		item.set("addrname", addrnameOf(ctx, s, val.str("addrid")))
		item.set("tagAll", tagAllOf(val.str("tag")))
		litpic := ""
		if truthy(val.str("pics")) {
			litpic = s.filePath(ctx, host, strings.Split(val.str("pics"), ",")[0])
		}
		item.set("litpic", litpic)
		item.set("video", s.filePath(ctx, host, val.str("video")))
		item.set("url", s.urlOf(ctx, host, "rentcar-detail", val.str("id")))
		item.set("store", s.nestedStore(ctx, host, req, viewer, val.str("company")))
		list = append(list, item)
	}
	return respOK(pagedPayloadList(pageinfo, list))
}

// rentcarListOrderby 复刻 rentcarList 的 switch。
func rentcarListOrderby(raw string) string {
	switch phpSwitchInt(raw) {
	case 1:
		return " ORDER BY `click` DESC, `weight` DESC, `id` DESC"
	case 2:
		return " ORDER BY `pubdate` DESC, `weight` DESC, `id` DESC"
	case 3:
		return " ORDER BY `price` DESC, `weight` DESC, `id` DESC"
	case 4:
		return " ORDER BY `price` ASC, `weight` DESC, `id` DESC"
	default:
		return " ORDER BY `weight` DESC, `id` DESC"
	}
}

// rentcarDetail（travel.class.php:3251-3369）。
func (s *Service) rentcarDetail(req *ajax.Request) ajax.Response {
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

	q := "SELECT `id`, `title`, `userid`, `price`, `company`, `pics`, `typeid`, `tag`, `video`, `lng`, `lat`, `cityid`, `addrid`, `address`, `click`, `pubdate`, `state` FROM `" +
		s.prefix + "travel_rentcar` WHERE `id` = " + id
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
	d.set("typeid", r.get("typeid"))
	d.set("lng", r.get("lng"))
	d.set("lat", r.get("lat"))
	d.set("cityid", r.get("cityid"))
	d.set("click", r.get("click"))
	d.set("pubdate", r.get("pubdate"))
	d.set("state", r.get("state"))
	d.set("addrid", r.get("addrid"))
	d.set("address", r.get("address"))
	d.set("tag", r.get("tag"))
	d.set("price", r.get("price"))
	d.set("video", r.get("video"))
	videopath := ""
	if truthy(r.str("video")) {
		videopath = s.filePath(ctx, host, r.str("video"))
	}
	d.set("videopath", videopath)
	d.set("typename", s.typeNameDB(ctx, "travel_rentcartype", r.str("typeid")))
	d.set("addrname", addrnameOf(ctx, s, r.str("addrid")))
	d.set("tagAll", tagAllOf(r.str("tag")))
	d.set("pics", s.pathSourceList(ctx, host, r.str("pics")))
	d.set("store", s.nestedStore(ctx, host, req, viewer, r.str("company")))
	d.set("companyurl", s.urlOf(ctx, host, "store-detail", r.str("company")))

	collect := ""
	if s.collectCheck != nil {
		collect = s.collectCheck(req, "travel", "rentcar-detail", "add", r.str("id"))
	}
	d.set("collect", boolInt(collect == "has"))

	return respOK(d)
}
