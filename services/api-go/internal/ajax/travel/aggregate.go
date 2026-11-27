// aggregate.go 是 travel 批次2（#371）的 companyAllDataList / getAlldata / searchTravel。
package travel

import (
	"context"
	"net/url"
	"sort"
	"strconv"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// companyAllDataList（travel.class.php:9614-9754）：店内聚合列表（6 组子调用）。
//
// 口径要点：
//   - 子调用是 self::xxxList()（内部直调，不经 handlers）：state==200 视为失败；
//     正常返回 array(pageInfo, list)（无 state 键）；
//   - visa 子调用复用 rentcar 的 param（不重设——照抄）；
//   - video 子调用 u=1 + uid（会员口径）；
//   - 合并后 array_sort(pubdate, desc)（PHP8 arsort 稳定），重建连续索引。
func (s *Service) companyAllDataList(req *ajax.Request) ajax.Response {
	p := req.Params

	store := phpInt(p.Get("store"))

	type sub struct {
		key   string
		count any
		items []any
	}
	_ = sub{}
	newParams := func(kv map[string]string) *ajax.Request {
		v := map[string][]string{}
		for k, val := range kv {
			v[k] = []string{val}
		}
		return &ajax.Request{Service: "travel", Params: url.Values(v), ParamsEscaped: url.Values(v), HTTP: req.HTTP}
	}
	runList := func(r2 *ajax.Request, fn func(*ajax.Request) ajax.Response) (any, []any, bool) {
		resp := fn(r2)
		if resp.State != ajax.StateOK {
			// state=200（暂无数据）→ 失败。
			return nil, nil, false
		}
		if om, ok := resp.Info.(*omap); ok {
			pi, _ := om.vals["pageInfo"].(*omap)
			list, _ := om.vals["list"].([]any)
			var cnt any
			if pi != nil {
				cnt = pi.vals["totalCount"]
			}
			return cnt, list, true
		}
		return nil, nil, false
	}

	pageinfo := newOmap()
	merged := []any{}

	// ticket
	if cnt, items, ok := runList(newParams(map[string]string{"store": strconv.Itoa(store), "pageSize": "5"}), s.ticketList); ok {
		pageinfo.set("ticket", cnt)
		for _, it := range items {
			if om, ok := it.(*omap); ok {
				om.set("styleType", "ticket")
			}
		}
		merged = append(merged, items...)
	} else {
		pageinfo.set("ticket", 0)
	}
	// agency0 / agency1
	for _, tid := range []string{"0", "1"} {
		key := "agency" + tid
		if cnt, items, ok := runList(newParams(map[string]string{"store": strconv.Itoa(store), "typeid": tid, "pageSize": "5"}), s.agencyList); ok {
			pageinfo.set(key, cnt)
			st := key
			for _, it := range items {
				if om, ok := it.(*omap); ok {
					om.set("styleType", st)
				}
			}
			merged = append(merged, items...)
		} else {
			pageinfo.set(key, 0)
		}
	}
	// rentcar
	if cnt, items, ok := runList(newParams(map[string]string{"store": strconv.Itoa(store), "pageSize": "5"}), s.rentcarList); ok {
		pageinfo.set("rentcar", cnt)
		for _, it := range items {
			if om, ok := it.(*omap); ok {
				om.set("styleType", "rentcar")
			}
		}
		merged = append(merged, items...)
	} else {
		pageinfo.set("rentcar", 0)
	}
	// visa：复用 rentcar 的 param（PHP 不重设）。
	if cnt, items, ok := runList(newParams(map[string]string{"store": strconv.Itoa(store), "pageSize": "5"}), s.visaList); ok {
		pageinfo.set("visa", cnt)
		for _, it := range items {
			if om, ok := it.(*omap); ok {
				om.set("styleType", "visa")
			}
		}
		merged = append(merged, items...)
	} else {
		pageinfo.set("visa", 0)
	}
	// video：u=1 + uid（会员口径）。
	if cnt, items, ok := runList(newParams(map[string]string{"u": "1", "uid": strconv.Itoa(phpInt(p.Get("uid"))), "pageSize": "5"}), s.videoList); ok {
		pageinfo.set("video", cnt)
		for _, it := range items {
			if om, ok := it.(*omap); ok {
				om.set("styleType", "video")
			}
		}
		merged = append(merged, items...)
	} else {
		pageinfo.set("video", 0)
	}

	// array_sort($list, 'pubdate', 'desc')：arsort（PHP8 稳定），数值串按数值比较。
	sort.SliceStable(merged, func(i, j int) bool {
		a := omapField(merged[i], "pubdate")
		b := omapField(merged[j], "pubdate")
		return phpLooseFloat(a) > phpLooseFloat(b)
	})

	return respOK(pagedPayloadList(pageinfo, merged))
}

// omapField 取 omap 项的字段字符串（非 omap → ""）。
func omapField(v any, key string) string {
	if om, ok := v.(*omap); ok {
		switch t := om.vals[key].(type) {
		case string:
			return t
		case int:
			return strconv.Itoa(t)
		case int64:
			return strconv.FormatInt(t, 10)
		}
	}
	return ""
}

// getAlldata（travel.class.php:9755-9826）。
//
// 口径要点（PHP bug 照抄）：
//   - `$uid` 先取登录态后被 param['uid'] 无条件覆盖（缺失 → null → SQL 语法错误 → 暂无数据）；
//   - `$userid` 引用未定义的 $param 恒 null 且从未进 SQL；
//   - UNION（video 含 zan，strategy 补 ”）LEFT JOIN member；COUNT 是 rowCount(int)；
//   - 无 ORDER BY；list 每条先重复赋 user{photo, username}。
func (s *Service) getAlldata(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	host := reqHost(req)
	p := req.Params

	// PHP：整段包在 if(!empty($this->param)) 里——无任何参数时函数落到末尾返回 null
	// → handlers::getHandle 包成 102 "No data!"（而非 101 暂无数据）。
	if len(p) == 0 {
		return respNoData()
	}

	uidRaw := p.Get("uid")
	// PHP：$uid = param['uid']（缺失 → null），直接拼 SQL。
	//   - 缺失/非数字 → `userid = ` / `userid = abc` 语法错误 → dsqlOper totalCount 0
	//     → 200 暂无数据！（包成 101）
	//   - uid="0" → `userid = 0` 合法 → 0 行 → 同上。
	//   （此前按登录态 viewerID 回退是错的——PHP 从不回退，有数据时响应不等价。）
	if !isNumericString(uidRaw) {
		return respFail(infoGetAlldataNoData)
	}
	uid := uidRaw

	pageSize := phpDefaultPage(p.Get("pageSize"), 10)
	page := phpDefaultPage(p.Get("page"), 1)

	if s.db == nil {
		return respFail(infoGetAlldataNoData)
	}

	unions := "SELECT `id`, `userid`, `title`, `litpic`, `pubdate`, `zan`, 'video' moduletype FROM `" + s.prefix +
		"travel_video`    WHERE `userid` = " + uid + " AND `state` = 1 AND `usertype` = 0" +
		" UNION ALL " +
		"SELECT `id`, `userid`, `title`, `litpic`, `pubdate`, '', 'strategy' moduletype FROM `" + s.prefix +
		"travel_strategy` WHERE `userid` = " + uid + " AND `state` = 1 AND `usertype` = 0"
	archives := "SELECT unall.*, m.`photo`, m.`username` FROM (" + unions + ") as unall LEFT JOIN `" +
		s.prefix + "member` m ON unall.`userid` = m.`id`"

	totalCount := s.countRows(ctx, archives)
	if totalCount < 0 {
		totalCount = 0
	}
	if totalCount == 0 {
		return respFail(infoGetAlldataNoData)
	}

	pageinfo := newOmap()
	pageinfo.set("page", page)
	pageinfo.set("pageSize", pageSize)
	pageinfo.set("totalPage", phpCeil(strconv.Itoa(totalCount), float64(pageSize)))
	pageinfo.set("totalCount", totalCount)

	q := archives + limitClause(page, pageSize)
	rows, ok := s.queryRows(ctx, q)
	if !ok {
		return respOK(pagedPayloadList(pageinfo, []any{}))
	}
	list := make([]any, 0, len(rows))
	for _, val := range rows {
		item := newOmap()
		// user 每条重复赋值（PHP 照抄）。
		u2 := newOmap()
		u2.set("photo", s.filePath(ctx, host, val.str("photo")))
		u2.set("username", val.get("username"))
		item.set("user", u2)
		item.set("title", val.get("title"))
		item.set("zan", val.get("zan"))
		item.set("litpic", s.filePath(ctx, host, val.str("litpic")))
		item.set("pubdate", val.get("pubdate"))
		item.set("moduletype", val.get("moduletype"))
		item.set("url", s.urlOf(ctx, host, val.str("moduletype")+"-detail", val.str("id")))
		list = append(list, item)
	}
	return respOK(pagedPayloadList(pageinfo, list))
}

// searchTravel（travel.class.php:9850-10240）：全站旅游搜索（7 表合并、PHP 端分页）。
//
// 口径要点（PHP bug 照抄）：
//   - store 分支未 SELECT distance 却引用 → 无坐标时恒 "0.0m"；
//   - 跟团游分支没有 addrname/tagAll；
//   - visa 的 typename 先赋 travelagency_type 再被 visatype 直查覆盖；
//     visa 的 url template 误用 rentcar-detail；
//   - searchtype 过滤、count、array_slice 分页（totalCount 为 int）。
func (s *Service) searchTravel(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	host := reqHost(req)
	p := req.Params

	keywords := p.Get("keywords")
	if !truthy(keywords) {
		return respFail(infoFormatError)
	}
	searchtype := phpInt(p.Get("searchtype"))
	page := phpDefaultPage(p.Get("page"), 1)
	pageSize := phpDefaultPage(p.Get("pageSize"), 10)
	lng, lat := p.Get("lng"), p.Get("lat")
	hasGeo := truthy(lng) && truthy(lat)

	// keywords LIKE 用占位符绑定（PHP 原样拼接；绑定对合法输入结果一致，封死注入面）。
	where := " AND `title` like ? "
	whereArgs := []any{"%" + keywords + "%"}
	var dist string
	var distArgs []any
	if hasGeo {
		dist = distanceSelect + ","
		distArgs = []any{lat, lat, lng}
	}

	appendCommon := func(m *omap, val rowVal, searchtype int, template string, withAddr bool, hasDistanceCol bool) {
		// flagname（ticket / 一日游有；由调用方处理）。
		if withAddr {
			if truthy(val.str("addrid")) {
				m.set("addrname", addrnameOf(ctx, s, val.str("addrid")))
			} else {
				m.set("addrname", "")
			}
			m.set("tagAll", tagAllOf(val.str("tag")))
		}
		if hasDistanceCol {
			if hasGeo {
				m.set("distance", distanceText(phpLooseFloat(val.str("distance"))))
			} else {
				m.set("distance", "0.0m")
			}
		} else {
			// store：distance 未 SELECT → 新键，恒 "0.0m"（无坐标）/计算值（有坐标）。
			if hasGeo {
				m.set("distance", "0.0m") // 未 SELECT distance 列 → $val['distance'] 为 null → "0.0m"（照抄）
			} else {
				m.set("distance", "0.0m")
			}
		}
		litpic := ""
		if truthy(val.str("pics")) {
			litpic = s.filePath(ctx, host, strings.Split(val.str("pics"), ",")[0])
		}
		m.set("litpic", litpic)
		video := ""
		if truthy(val.str("video")) {
			video = s.filePath(ctx, host, val.str("video"))
		}
		m.set("video", video)
		m.set("searchtype", searchtype)
		m.set("url", s.urlOf(ctx, host, template, val.str("id")))
	}

	list := []any{}

	// 景点门票
	if rows, ok := s.queryRows(ctx, "SELECT `id`, `title`, `flag`, `rec`, `userid`, `company`, `address`, `pics`, `video`, `opentime`, `tag`, `cityid`, `travelname`, `addrid`, `click`, `pubdate`,"+dist+"`state`, (SELECT min(c.`price`) FROM `"+s.prefix+
		"travel_ticketinfo` c WHERE c.`ticketid` = l.`id` AND c.`typeid` = '0' ) AS price, (SELECT sum(c.`sale`) FROM `"+s.prefix+
		"travel_ticketinfo` c WHERE c.`ticketid` = l.`id` AND c.`typeid` = '0' ) AS sale  FROM `"+s.prefix+"travel_ticket` l WHERE 1 = 1"+where, append(append([]any{}, distArgs...), whereArgs...)...); ok {
		for _, val := range rows {
			m := val.omapOf()
			flagname := ""
			if truthy(val.str("flag")) {
				flagname = typeNameByID(starTypeItems(), val.str("flag"))
			}
			m.set("flagname", flagname)
			appendCommon(m, val, 1, "ticket-detail", true, true)
			list = append(list, m)
		}
	}

	// 旅行社（未 SELECT distance）
	if rows, ok := s.queryRows(ctx, "SELECT `bind_module`, `title`, `pubdate`, `pics`, `video`, `license`, `lat`, `lng`, `id`,`userid`, `address`, `tel`, `addrid`, `contact`,`flag` FROM `"+
		s.prefix+"travel_store` WHERE 1 = 1"+where, whereArgs...); ok {
		for _, val := range rows {
			m := val.omapOf()
			m.set("distance", "0.0m") // $val['distance'] 未定义 → sprintf(null)="0.0"+米 → "0.0m"（有坐标时 PHP 同样因列缺失输出 0.0m）
			if truthy(val.str("addrid")) {
				m.set("addrname", addrnameOf(ctx, s, val.str("addrid")))
			} else {
				m.set("addrname", "")
			}
			m.set("tagAll", tagAllOf(val.str("tag")))
			litpic := ""
			if truthy(val.str("pics")) {
				litpic = s.filePath(ctx, host, strings.Split(val.str("pics"), ",")[0])
			}
			m.set("litpic", litpic)
			video := ""
			if truthy(val.str("video")) {
				video = s.filePath(ctx, host, val.str("video"))
			}
			m.set("video", video)
			m.set("searchtype", 2)
			m.set("url", s.urlOf(ctx, host, "store-detail", val.str("id")))
			list = append(list, m)
		}
	}

	// 酒店民宿
	if rows, ok := s.queryRows(ctx, "SELECT `id`, `title`, `userid`, `company`, `address`, `pics`, `video`, `price`, `tag`, `cityid`, `typeid`, `addrid`, `click`, `pubdate`,"+dist+" `state`,`lng`,`lat`,`factag` FROM `"+
		s.prefix+"travel_hotel` WHERE 1 = 1"+where, append(append([]any{}, distArgs...), whereArgs...)...); ok {
		for _, val := range rows {
			m := val.omapOf()
			if hasGeo {
				m.set("distance", distanceText(phpLooseFloat(val.str("distance"))))
			} else {
				m.set("distance", "0.0m")
			}
			if truthy(val.str("addrid")) {
				m.set("addrname", addrnameOf(ctx, s, val.str("addrid")))
			} else {
				m.set("addrname", "")
			}
			m.set("tagAll", tagAllOf(val.str("tag")))
			litpic := ""
			if truthy(val.str("pics")) {
				litpic = s.filePath(ctx, host, strings.Split(val.str("pics"), ",")[0])
			}
			m.set("litpic", litpic)
			video := ""
			if truthy(val.str("video")) {
				video = s.filePath(ctx, host, val.str("video"))
			}
			m.set("video", video)
			m.set("searchtype", 3)
			m.set("url", s.urlOf(ctx, host, "hotel-detail", val.str("id")))
			list = append(list, m)
		}
	}

	// 一日游 / 跟团游（agency typeid=0 / typeid=1；跟团游无 addrname/tagAll）
	agencyQ := func(typeid string) string {
		return "SELECT `id`, `title`, `userid`, `company`, `flag`, `address`, `missiontime`, `pics`, `video`, `travelservice`, `tag`, `cityid`, `typeid`, `addrid`, `click`, `pubdate`, `ywday`,(SELECT avg(c.`price`) FROM `" +
			s.prefix + "travel_ticketinfo` c WHERE c.`ticketid` = l.`id` AND c.`typeid` = '1' ) AS price, (SELECT sum(c.`sale`) FROM `" + s.prefix +
			"travel_ticketinfo` c WHERE c.`ticketid` = l.`id` AND c.`typeid` = '1' ) AS sale, `state`  FROM `" + s.prefix + "travel_agency` l WHERE `typeid` = " + typeid + where
	}
	if rows, ok := s.queryRows(ctx, agencyQ("0")); ok {
		for _, val := range rows {
			m := val.omapOf()
			flagname := ""
			if truthy(val.str("flag")) {
				flagname = typeNameByID(starTypeItems(), val.str("flag"))
			}
			m.set("flagname", flagname)
			if truthy(val.str("addrid")) {
				m.set("addrname", addrnameOf(ctx, s, val.str("addrid")))
			} else {
				m.set("addrname", "")
			}
			m.set("tagAll", tagAllOf(val.str("tag")))
			litpic := ""
			if truthy(val.str("pics")) {
				litpic = s.filePath(ctx, host, strings.Split(val.str("pics"), ",")[0])
			}
			m.set("litpic", litpic)
			video := ""
			if truthy(val.str("video")) {
				video = s.filePath(ctx, host, val.str("video"))
			}
			m.set("video", video)
			m.set("searchtype", 4)
			m.set("url", s.urlOf(ctx, host, "agency-detail", val.str("id")))
			list = append(list, m)
		}
	}
	if rows, ok := s.queryRows(ctx, agencyQ("1")); ok {
		for _, val := range rows {
			m := val.omapOf()
			flagname := ""
			if truthy(val.str("flag")) {
				flagname = typeNameByID(starTypeItems(), val.str("flag"))
			}
			m.set("flagname", flagname)
			litpic := ""
			if truthy(val.str("pics")) {
				litpic = s.filePath(ctx, host, strings.Split(val.str("pics"), ",")[0])
			}
			m.set("litpic", litpic)
			video := ""
			if truthy(val.str("video")) {
				video = s.filePath(ctx, host, val.str("video"))
			}
			m.set("video", video)
			m.set("searchtype", 5)
			m.set("url", s.urlOf(ctx, host, "agency-detail", val.str("id")))
			list = append(list, m)
		}
	}

	// 租车
	if rows, ok := s.queryRows(ctx, "SELECT `id`, `price`, `title`, `userid`, `company`, `address`, `pics`, `video`, `typeid`, `tag`, `cityid`, `addrid`, `click`, `pubdate`, `state`  FROM `"+
		s.prefix+"travel_rentcar` WHERE 1 = 1"+where, whereArgs...); ok {
		for _, val := range rows {
			m := val.omapOf()
			if truthy(val.str("addrid")) {
				m.set("addrname", addrnameOf(ctx, s, val.str("addrid")))
			} else {
				m.set("addrname", "")
			}
			m.set("tagAll", tagAllOf(val.str("tag")))
			litpic := ""
			if truthy(val.str("pics")) {
				litpic = s.filePath(ctx, host, strings.Split(val.str("pics"), ",")[0])
			}
			m.set("litpic", litpic)
			video := ""
			if truthy(val.str("video")) {
				video = s.filePath(ctx, host, val.str("video"))
			}
			m.set("video", video)
			m.set("searchtype", 6)
			m.set("url", s.urlOf(ctx, host, "rentcar-detail", val.str("id")))
			list = append(list, m)
		}
	}

	// 签证（typename 覆盖、url template 误用 rentcar-detail——照抄）
	if rows, ok := s.queryRows(ctx, "SELECT `id`, `price`, `title`, `sale`,`subtitle`, `userid`, `company`, `pics`, `video`, `typeid`, `country`, `click`, `pubdate`, `state`  FROM `"+
		s.prefix+"travel_visa` WHERE 1 = 1"+where, whereArgs...); ok {
		for _, val := range rows {
			m := val.omapOf()
			typename := ""
			if val.str("typeid") != "" {
				typename = typeNameByID(travelagencyTypeItems(), val.str("typeid"))
			}
			m.set("typename", typename)
			// 覆盖：visatype 直查（$ret[0]['typename'] truthy else ''；错误/空 → ''）。
			m.set("typename", s.typeNameDB(ctx, "travel_visatype", val.str("typeid")))
			m.set("countryname", s.typeNameDB(ctx, "travel_visacountrytype", val.str("country")))
			litpic := ""
			if truthy(val.str("pics")) {
				litpic = s.filePath(ctx, host, strings.Split(val.str("pics"), ",")[0])
			}
			m.set("litpic", litpic)
			video := ""
			if truthy(val.str("video")) {
				video = s.filePath(ctx, host, val.str("video"))
			}
			m.set("video", video)
			m.set("searchtype", 7)
			m.set("url", s.urlOf(ctx, host, "rentcar-detail", val.str("id")))
			list = append(list, m)
		}
	}

	// searchtype 过滤 + 分页（PHP array_slice）。
	filtered := list
	if searchtype != 0 {
		filtered = []any{}
		for _, it := range list {
			if phpLooseFloat(omapField(it, "searchtype")) == float64(searchtype) {
				filtered = append(filtered, it)
			}
		}
	}
	totalCount := len(filtered)
	if totalCount == 0 {
		return respFail(infoNoDataCnt)
	}
	pageinfo := newOmap()
	pageinfo.set("page", page)
	pageinfo.set("pageSize", pageSize)
	pageinfo.set("totalPage", phpCeil(strconv.Itoa(totalCount), float64(pageSize)))
	pageinfo.set("totalCount", totalCount)

	start := (page - 1) * pageSize
	end := start + pageSize
	if start > len(filtered) {
		start = len(filtered)
	}
	if end > len(filtered) {
		end = len(filtered)
	}
	return respOK(pagedPayloadList(pageinfo, filtered[start:end]))
}
