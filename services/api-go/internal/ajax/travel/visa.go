// visa.go 是 travel 批次2（#371）的 visaList / visaDetail。
package travel

import (
	"context"
	"strings"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// visaList（travel.class.php:3583-3839）：签证分页列表。
//
// 口径要点：
//   - 无 keywords 回退（search 直接用）；
//   - addrid 经 store 间接过滤（无店 → 1=2）；
//   - 会员态 state 过滤在 u==1 分支内；
//   - typename/countryname 直查 visatype / visacountrytype。
func (s *Service) visaList(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	host := reqHost(req)
	p := req.Params

	search := p.Get("search")
	store := p.Get("store")
	state := p.Get("state")
	typeid := p.Get("typeid")
	country := p.Get("country")
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
	if truthy(typeid) {
		where += " AND `typeid` = '" + typeid + "'"
	}
	if truthy(country) {
		where += " AND `country` = '" + country + "'"
	}
	if truthy(p.Get("addrid")) {
		lower := s.lowerAddrs(ctx, p.Get("addrid"))
		sids := s.storeAddrSids(ctx, lower)
		if len(sids) > 0 {
			where += " AND `company` in (" + strings.Join(sids, ",") + ")"
		} else {
			where += " AND 1 = 2"
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

	archives := "SELECT `id`, `price`, `title`, `sale`, `subtitle`, `userid`, `company`, `pics`, `video`, `typeid`, `country`, `click`, `pubdate`, `state` FROM `" +
		s.prefix + "travel_visa` WHERE 1 = 1" + where

	totalCount := s.countTotal(ctx, "SELECT COUNT(`id`) total FROM `"+s.prefix+"travel_visa` WHERE 1 = 1"+where)
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

	q := archives + visaListOrderby(p.Get("orderby")) + limitClause(page, pageSize)
	rows, ok := s.queryRows(ctx, q)
	if !ok {
		return respOK(pagedPayloadList(pageinfo, []any{}))
	}
	list := make([]any, 0, len(rows))
	for _, val := range rows {
		item := newOmap()
		item.set("id", val.get("id"))
		item.set("title", val.get("title"))
		item.set("subtitle", val.get("subtitle"))
		item.set("userid", val.get("userid"))
		item.set("company", val.get("company"))
		item.set("click", val.get("click"))
		item.set("pubdate", val.get("pubdate"))
		item.set("state", val.get("state"))
		item.set("typeid", val.get("typeid"))
		item.set("country", val.get("country"))
		item.set("price", val.get("price"))
		item.set("sale", val.get("sale"))
		item.set("typename", s.typeNameDB(ctx, "travel_visatype", val.str("typeid")))
		item.set("countryname", s.typeNameDB(ctx, "travel_visacountrytype", val.str("country")))
		litpic := ""
		if truthy(val.str("pics")) {
			litpic = s.filePath(ctx, host, strings.Split(val.str("pics"), ",")[0])
		}
		item.set("litpic", litpic)
		item.set("video", s.filePath(ctx, host, val.str("video")))
		item.set("url", s.urlOf(ctx, host, "visa-detail", val.str("id")))
		item.set("store", s.nestedStore(ctx, host, req, viewer, val.str("company")))
		list = append(list, item)
	}
	return respOK(pagedPayloadList(pageinfo, list))
}

// visaListOrderby 复刻 visaList 的 switch（case 5 实为 sale DESC——注释写"价格升序"是错的）。
func visaListOrderby(raw string) string {
	switch phpSwitchInt(raw) {
	case 1:
		return " ORDER BY `click` DESC, `weight` DESC, `id` DESC"
	case 2:
		return " ORDER BY `pubdate` DESC, `weight` DESC, `id` DESC"
	case 3:
		return " ORDER BY `price` DESC, `weight` DESC, `pubdate` DESC, `id` DESC"
	case 4:
		return " ORDER BY `price` ASC, `weight` DESC, `pubdate` DESC, `id` DESC"
	case 5:
		return " ORDER BY `sale` DESC, `weight` DESC, `pubdate` DESC, `id` DESC"
	default:
		return " ORDER BY `weight` DESC, `id` DESC"
	}
}

// visaDetail（travel.class.php:3840-4060）。
func (s *Service) visaDetail(req *ajax.Request) ajax.Response {
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

	q := "SELECT `id`, `title`, `subtitle`, `country`, `entrytimes`, `staytimes`, `earliestdate`, `valid`, `processingtime`, `scope`, `materials`, `serviceincludes`, `others`, `reminder`, `notice`, `processingflow`, `incumbentsscience`, `retireescience`, `professionalscience`, `studentsscience`, `childrenscience`, `userid`, `price`, `company`, `pics`, `typeid`, `video`, `click`, `pubdate`, `state` FROM `" +
		s.prefix + "travel_visa` WHERE `id` = " + id
	rows, ok := s.queryRows(ctx, q)
	if !ok || len(rows) == 0 {
		return respNoData()
	}
	r := rows[0]
	viewer := s.viewerID(ctx, req)

	d := newOmap()
	d.set("id", r.get("id"))
	d.set("title", r.get("title"))
	d.set("subtitle", r.get("subtitle"))
	d.set("userid", r.get("userid"))
	d.set("company", r.get("company"))
	d.set("typeid", r.get("typeid"))
	d.set("country", r.get("country"))
	d.set("click", r.get("click"))
	d.set("pubdate", r.get("pubdate"))
	d.set("state", r.get("state"))
	d.set("staytimes", r.get("staytimes"))
	d.set("earliestdates", r.get("earliestdate"))
	d.set("earliestdate", phpDate(r.str("earliestdate")))
	d.set("price", r.get("price"))
	d.set("video", r.get("video"))
	videopath := ""
	if truthy(r.str("video")) {
		videopath = s.filePath(ctx, host, r.str("video"))
	}
	d.set("videopath", videopath)
	d.set("valid", r.get("valid"))
	d.set("processingtime", r.get("processingtime"))
	d.set("scope", phpNl2br(r.str("scope")))
	d.set("materials", phpNl2br(r.str("materials")))
	d.set("serviceincludes", phpNl2br(r.str("serviceincludes")))
	visaname := ""
	if truthy(r.str("entrytimes")) {
		visaname = typeNameByID(visaTypeItems(), r.str("entrytimes"))
	}
	d.set("visaname", visaname)
	d.set("others", r.get("others"))
	d.set("reminder", r.get("reminder"))
	d.set("notice", r.get("notice"))
	d.set("processingflow", r.get("processingflow"))
	d.set("common", s.commentTotal(ctx, "travel-visa", id))

	// processingflow / 5 个 science 块：按 "|||" + "$$$" 拆 {title, note: nl2br}；
	// xxname = implode(',', titles)（空 → ''）、xxnum = count（空块 → 0）。
	d.set("processingflowArr", scienceArr(r.str("processingflow")))
	sci := func(field, arrKey, nameKey, numKey string) {
		blocks := scienceArr(r.str(field))
		titles := []string{}
		for _, b := range blocks {
			titles = append(titles, b.(*omap).vals["title"].(string))
		}
		d.set(arrKey, blocks)
		if len(titles) > 0 {
			d.set(nameKey, strings.Join(titles, ","))
		} else {
			d.set(nameKey, "")
		}
		d.set(numKey, len(blocks))
	}
	sci(r.str("incumbentsscience"), "incumbentsscienceArr", "incumbentsname", "incumbentsnum")
	sci(r.str("retireescience"), "retireescienceArr", "retireename", "retireenum")
	sci(r.str("professionalscience"), "professionalscienceArr", "professionalname", "professionalnum")
	sci(r.str("studentsscience"), "studentsscienceArr", "studentsname", "studentsnum")
	// children 的 Arr 键名拼写就是 childrenscienceceArr（PHP 源码如此，照抄）。
	sci(r.str("childrenscience"), "childrenscienceceArr", "childrenname", "childrennum")

	d.set("typename", s.typeNameDB(ctx, "travel_visatype", r.str("typeid")))
	d.set("countryname", s.typeNameDB(ctx, "travel_visacountrytype", r.str("country")))
	d.set("pics", s.pathSourceList(ctx, host, r.str("pics")))
	d.set("store", s.nestedStore(ctx, host, req, viewer, r.str("company")))
	d.set("companyurl", s.urlOf(ctx, host, "store-detail", r.str("company")))

	collect := ""
	if s.collectCheck != nil {
		collect = s.collectCheck(req, "travel", "visa-detail", "add", r.str("id"))
	}
	d.set("collect", boolInt(collect == "has"))

	return respOK(d)
}

// visaTypeItems 是 visa_type 静态列表（复用 static_types 的语义）。
func visaTypeItems() []staticItem {
	return []staticItem{
		{0, langTravel12_101, []any{}},
		{1, langTravel12_102, []any{}},
		{2, langTravel12_103, []any{}},
	}
}

// scienceArr 复刻 `"|||"` + `"$$$"` 拆分：{title: v[0], note: nl2br(v[1])}；
// 字段空 → []（PHP explode("|||", "") → [""] → 段内无 "$$$" → title="" note=nl2br("")=""?
// 注意 PHP：$str 非空才 explode；空串时 $xxArr 恒 []）。
func scienceArr(raw string) []any {
	out := []any{}
	if !truthy(raw) {
		return out
	}
	for k, seg := range strings.Split(raw, "|||") {
		parts := strings.Split(seg, "$$$")
		m := newOmap()
		if len(parts) > 0 {
			m.set("title", parts[0])
		}
		note := ""
		if len(parts) > 1 {
			note = phpNl2br(parts[1])
		}
		m.set("note", note)
		out = appendAt(out, k, m)
	}
	return out
}

// phpDate 复刻 date("Y-m-d", ts)：ts falsy → ”；按进程本地时区
// （compare 环境 Go/PHP 同主机同 TZ）。
func phpDate(ts string) string {
	if !truthy(ts) {
		return ""
	}
	n := phpInt(ts)
	if n == 0 && !isNumericString(ts) {
		return ""
	}
	return time.Unix(int64(n), 0).Format("2006-01-02")
}
