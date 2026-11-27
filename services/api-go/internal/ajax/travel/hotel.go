// hotel.go 是 travel 批次2（#371）的 hotelList / hotelDetail。
package travel

import (
	"context"
	"net/url"
	"strconv"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// hotelList（travel.class.php:1541-1862）：酒店民宿分页列表。
//
// 口径要点：
//   - store/u/addrid/orderby/page/pageSize (int) 强转，其余直取；
//   - typeid/noid 走 convertArrToStrWithComma（多值参数逗号拼接）→ in/not in；
//   - 前台 cityid → company in (sids) / 0=1；会员态 → company=首店 / 1=2；
//   - price 区间直查 hotel.price；search 匹配 store.title/address；
//   - `$state` 过滤只进列表 SQL（不影响 gray/audit/refuse 统计）；
//   - sale 取 travel_hotelroom valid=0 首行；tagArrr 来自 factag（py 前置）。
func (s *Service) hotelList(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	host := reqHost(req)
	p := req.Params

	store := phpInt(p.Get("store"))
	u := phpInt(p.Get("u"))
	page := phpDefaultPage(p.Get("page"), 1)
	pageSize := phpDefaultPage(p.Get("pageSize"), 10)
	state := p.Get("state")

	// staff 分支（is_staff/companyuid）未复刻：非 staff 用户行为完全一致（#371 规则评论）。
	viewer := s.viewerID(ctx, req)

	typeid := commaJoin(p, "typeid")
	noid := commaJoin(p, "noid")

	where := ""
	var wargs []any // 与 where 片段占位符一一对应
	if ids, ok := phpIntList(typeid); !ok {
		return respFail(infoNoDataCnt)
	} else if ids != nil {
		where += " AND `typeid` in (" + strings.Join(ids, ",") + ")"
	}
	if ids, ok := phpIntList(noid); !ok {
		return respFail(infoNoDataCnt)
	} else if ids != nil {
		where += " AND `id` not in (" + strings.Join(ids, ",") + ")"
	}
	if u != 1 {
		where += " AND `state` = 1"
		if cityid := s.cityID(ctx, req, p.Get("cityid")); cityid > 0 {
			where += s.listFrontCity(ctx, cityid)
		}
	} else {
		// PHP: userType==2 && !verifyModuleAuth(travel) && is_staff!=1 → 商家权限验证失败；
		// 该分支依赖 enterprise 会员 + 模块鉴权表，未复刻（非企业用户不可达）。
		where += s.listMemberOwn(ctx, viewer)
	}
	if store != 0 {
		where += " AND `company` = '" + strconv.Itoa(store) + "'"
	}
	if truthy(p.Get("addrid")) {
		lower := s.lowerAddrs(ctx, p.Get("addrid"))
		if lower == "" {
			// 非数字 addrid → PHP 语法错误面（验证口径：按空结果降级）。
			return respFail(infoNoDataCnt)
		}
		where += " AND `addrid` in (" + lower + ")"
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
		// PHP empty() 语义：",200" → commaJoin "0,200" → empty("0") 为真 → 走仅上限分支
		// （不是 BETWEEN）；"200," → 仅下限。用 truthy（"0" 为 falsy）选分支。
		switch {
		case !truthy(p0):
			where += " AND `price` < " + p1
		case !truthy(p1):
			where += " AND `price` > " + p0
		default:
			where += " AND `price` BETWEEN " + p0 + " AND " + p1
		}
	}
	search := p.Get("search")
	if !truthy(search) {
		search = p.Get("keywords")
	}
	frag, sargs := s.listLikeSearch(ctx, search, "`title`")
	where += frag
	wargs = append(wargs, sargs...)

	lng, lat := p.Get("lng"), p.Get("lat")
	hasGeo := truthy(lng) && truthy(lat)
	var selectExtra string
	var extraArgs []any
	if hasGeo {
		selectExtra = distanceSelect + ", "
		extraArgs = append(extraArgs, lat, lat, lng)
	}

	archives := "SELECT `id`, `title`, `userid`, `company`, `address`, `pics`, `video`, `price`, `tag`, `cityid`, `typeid`, `addrid`, `click`, `pubdate`, " +
		selectExtra + "`state`, `lng`, `lat`, `factag` FROM `" + s.prefix + "travel_hotel` WHERE 1 = 1" + where

	totalCount := s.countTotal(ctx, "SELECT COUNT(`id`) total FROM `"+s.prefix+"travel_hotel` WHERE 1 = 1"+where, wargs...)
	if looseZero(totalCount) {
		return respFail(infoNoDataCnt)
	}

	pageinfo := basePageinfo(page, pageSize, totalCount)
	if u == 1 && viewer > -1 {
		// archives 的占位符顺序 = SELECT（distance 3 个）→ WHERE（wargs）。
		gray, audit, refuse := s.grayAuditRefuse(ctx, archives, "`state`", append(append([]any{}, extraArgs...), wargs...))
		pageinfo.set("gray", gray)
		pageinfo.set("audit", audit)
		pageinfo.set("refuse", refuse)
	}

	// `$state != ''` 只对列表 SQL 生效（gray/audit/refuse 已统计完）。
	// PHP 无引号拼 `$state`：非数字 → SQL 语法错误 → 查询错误面（按空列表降级）。
	where1 := ""
	if state != "" {
		if !isNumericString(state) {
			return respOK(pagedPayloadList(pageinfo, []any{}))
		}
		where1 = " AND `state` = " + state
	}
	orderBy := hotelListOrderby(p.Get("orderby"))
	q := archives + where1 + orderBy + limitClause(page, pageSize)
	rows, ok := s.queryRows(ctx, q, append(extraArgs, wargs...)...)
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
		item.set("price", val.get("price"))
		item.set("cityid", val.get("cityid"))
		item.set("typeid", val.get("typeid"))
		item.set("address", val.get("address"))
		item.set("lng", val.get("lng"))
		item.set("lat", val.get("lat"))
		typename := ""
		if truthy(val.str("typeid")) {
			typename = typeNameByID(travelhotelTypeItems(), val.str("typeid"))
		}
		item.set("typename", typename)

		// sale：travel_hotelroom valid=0 首行 sale；查无/空 → 0。
		sale := any(0)
		if rr, ok := s.queryRows(ctx, "SELECT `sale` FROM `"+s.prefix+
			"travel_hotelroom` WHERE `hotelid` = '"+val.str("id")+"' AND `valid` = 0"); ok && len(rr) > 0 {
			if truthyAny(rr[0].get("sale")) {
				sale = rr[0].get("sale")
			}
		}
		item.set("sale", sale)

		// tagArrr：factag 按 "|" explode → {py: GetPinyin, val: v}（注意 py 在前）。
		tagArrr := []any{}
		if truthy(val.str("factag")) {
			for k, v := range strings.Split(val.str("factag"), "|") {
				m := newOmap()
				m.set("py", getPinyin(v))
				m.set("val", v)
				tagArrr = appendAt(tagArrr, k, m)
			}
		}
		item.set("tagArrr", tagArrr)

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
		item.set("url", s.urlOf(ctx, host, "hotel-detail", val.str("id")))
		item.set("store", s.nestedStore(ctx, host, req, viewer, val.str("company")))

		list = append(list, item)
	}
	return respOK(pagedPayloadList(pageinfo, list))
}

// hotelListOrderby 复刻 hotelList 的 switch：3/4 的 price 档带 click 前缀。
func hotelListOrderby(raw string) string {
	switch phpSwitchInt(raw) {
	case 1:
		return " ORDER BY `click` DESC, `weight` DESC, `id` DESC"
	case 2:
		return " ORDER BY `pubdate` DESC, `weight` DESC, `id` DESC"
	case 3:
		return " ORDER BY `price` DESC, `click` DESC, `weight` DESC, `pubdate` DESC, `id` DESC"
	case 4:
		return " ORDER BY `price` ASC, `click` DESC, `weight` DESC, `pubdate` DESC, `id` DESC"
	default:
		return " ORDER BY `weight` DESC, `id` DESC"
	}
}

// hotelDetail（travel.class.php:1863-2024）。
func (s *Service) hotelDetail(req *ajax.Request) ajax.Response {
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

	// `$where` 在 PHP 中未定义（state 过滤被注释）→ 无 state 条件。
	q := "SELECT `id`, `title`, `userid`, `company`, `pics`, `price`, `tag`,`factag`, `video`, `lng`, `lat`, `cityid`, `typeid`, `addrid`, `address`, `click`, `pubdate`, `state`,`note` FROM `" +
		s.prefix + "travel_hotel` WHERE `id` = " + id
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
	d.set("price", r.get("price"))
	d.set("cityid", r.get("cityid"))
	d.set("click", r.get("click"))
	d.set("pubdate", r.get("pubdate"))
	d.set("state", r.get("state"))
	d.set("addrid", r.get("addrid"))
	d.set("address", r.get("address"))
	d.set("tag", r.get("tag"))
	d.set("note", r.get("note"))
	d.set("video", r.get("video"))
	videopath := ""
	if truthy(r.str("video")) {
		videopath = s.filePath(ctx, host, r.str("video"))
	}
	d.set("videopath", videopath)
	d.set("typeid", r.get("typeid"))
	typename := ""
	if truthy(r.str("typeid")) {
		typename = typeNameByID(travelhotelTypeItems(), r.str("typeid"))
	}
	d.set("typename", typename)

	// tagArrr 来自配置 $customtravelhotelTag：canary travel.inc.php 未定义 → 恒 []。
	d.set("tagArrr", []any{})

	// 房型：travel_hotelroom valid=0，ORDER BY weight DESC, pubdate DESC, id DESC。
	workArr := []any{}
	rr, ok2 := s.queryRows(ctx, "SELECT `id`, `title`, `area`, `iswindow`, `typeid`, `breakfast`, `price`, `specialtime`,`pics` FROM `"+
		s.prefix+"travel_hotelroom` WHERE `hotelid` = '"+id+"' AND `valid` = 0 ORDER BY  `weight` DESC, `pubdate` DESC, `id` DESC")
	if ok2 {
		for k, rv := range rr {
			m := newOmap()
			m.set("id", rv.get("id"))
			m.set("title", rv.get("title"))
			m.set("area", rv.get("area"))
			m.set("iswindow", rv.get("iswindow"))
			m.set("typeid", rv.get("typeid"))
			m.set("breakfast", rv.get("breakfast"))
			m.set("price", rv.get("price"))
			// roomImgPath：pics 非空 explode（不经 getFilePath），空 → []。
			roomImgPath := []any{}
			if rv.str("pics") != "" {
				for _, v := range strings.Split(rv.str("pics"), ",") {
					roomImgPath = append(roomImgPath, v)
				}
			}
			m.set("roomImgPath", roomImgPath)
			iswindowname := ""
			if rv.str("iswindow") != "" {
				iswindowname = typeNameByID(iswindowTypeItems(), rv.str("iswindow"))
			}
			m.set("iswindowname", iswindowname)
			roomType := ""
			if rv.str("typeid") != "" {
				roomType = typeNameByID(roomTypeItems(), rv.str("typeid"))
			}
			m.set("typename", roomType)
			breakfastname := ""
			if rv.str("breakfast") != "" {
				breakfastname = typeNameByID(breakfastTypeItems(), rv.str("breakfast"))
			}
			m.set("breakfastname", breakfastname)
			st, stj := specialtimeOut(rv.str("specialtime"))
			m.set("specialtime", st)
			m.set("specialtimejson", stj)
			workArr = appendAt(workArr, k, m)
		}
	}
	d.set("workArr", workArr)

	if truthy(r.str("addrid")) {
		d.set("addrname", addrnameOf(ctx, s, r.str("addrid")))
	} else {
		d.set("addrname", "")
	}
	d.set("tagAll", tagAllOf(r.str("tag")))

	// factagAll = explode("|", factag)（factag 空 → $factag 未定义 → null）。
	var factagAll any
	if truthy(r.str("factag")) {
		fa := []any{}
		for k, v := range strings.Split(r.str("factag"), "|") {
			fa = appendAt(fa, k, v)
		}
		factagAll = fa
	}
	d.set("factagAll", factagAll)

	factagArrall := []any{}
	if truthy(r.str("factag")) {
		for k, v := range strings.Split(r.str("factag"), "|") {
			m := newOmap()
			m.set("jc", v)
			m.set("py", getPinyin(v))
			factagArrall = appendAt(factagArrall, k, m)
		}
	}
	d.set("factagArrall", factagArrall)

	d.set("pics", s.pathSourceList(ctx, host, r.str("pics")))
	d.set("store", s.nestedStore(ctx, host, req, viewer, r.str("company")))
	d.set("companyurl", s.urlOf(ctx, host, "store-detail", r.str("company")))

	// collect 无 uid 守卫（未登录时 checkIsCollect 内部判空）。
	collect := ""
	if s.collectCheck != nil {
		collect = s.collectCheck(req, "travel", "hotel-detail", "add", r.str("id"))
	}
	d.set("collect", boolInt(collect == "has"))

	return respOK(d)
}

// commaJoin 复刻 convertArrToStrWithComma（$int=true）：”/Placeholder → ”；
// 多值/逗号串逐个 (int)（0 保留）；标量 (int) 后为 0 丢弃。
func commaJoin(p url.Values, key string) string {
	vals := p[key]
	if len(vals) == 0 {
		return ""
	}
	if len(vals) == 1 {
		v := vals[0]
		if v == "" || v == "pricePlaceholder" || strings.Contains(v, "Placeholder") {
			return ""
		}
		if strings.Contains(v, ",") {
			vals = strings.Split(v, ",")
		} else {
			if phpInt(v) == 0 {
				return ""
			}
			return strconv.Itoa(phpInt(v))
		}
	}
	parts := make([]string, 0, len(vals))
	for _, v := range vals {
		parts = append(parts, strconv.Itoa(phpInt(v)))
	}
	return strings.Join(parts, ",")
}
