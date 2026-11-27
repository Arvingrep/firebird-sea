// store.go 是 travel 批次2（#371）的 storeList / storeDetail。
// 业务规则与 PHP 行为逐条对齐 #371 业务规则评论（2026-11-27）。
package travel

import (
	"context"
	"database/sql"
	"net/url"
	"strconv"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/fburl"
)

// —— 行值口径 ——
// dsqlOper "results"（PDO emulated prepares）返回的列全部是字符串；NULL 保持 null。
// JSON 输出与 PHP json_encode 一致：字符串带引号、null 为 null。

type rowVal struct {
	cols []string
	vals map[string]any
}

// str 取列字符串（NULL → ""）。
func (r rowVal) str(k string) string {
	if v, ok := r.vals[k]; ok {
		if s, ok := v.(string); ok {
			return s
		}
	}
	return ""
}

func (r rowVal) get(k string) any { return r.vals[k] }

// queryRows 执行查询并按列名收集（所有列转 string，NULL → nil）。
// 查询错误 → ok=false（对应 dsqlOper 返回错误串，PHP 侧 `$results` 为非空字符串 →
// truthy → 但 $results[0][...] 是 "{"（非法下标）——多数调用点按空结果（falsy）降级；
// videoDetail 的 user 投影与 getAlldata 无参数分支按首字符 `{` 语义显式仿真，见 #371 规则评论）。
func (s *Service) queryRows(ctx context.Context, q string, args ...any) ([]rowVal, bool) {
	if s.db == nil {
		return nil, false
	}
	rows, err := s.db.QueryContext(ctx, q, args...)
	if err != nil {
		return nil, false
	}
	defer func() { _ = rows.Close() }()
	cols, err := rows.Columns()
	if err != nil {
		return nil, false
	}
	var out []rowVal
	for rows.Next() {
		raw := make([]sql.NullString, len(cols))
		ptrs := make([]any, len(cols))
		for i := range raw {
			ptrs[i] = &raw[i]
		}
		if rows.Scan(ptrs...) != nil {
			return out, true
		}
		vals := map[string]any{}
		for i, c := range cols {
			if raw[i].Valid {
				vals[c] = raw[i].String
			} else {
				vals[c] = nil
			}
		}
		out = append(out, rowVal{cols: cols, vals: vals})
	}
	return out, true
}

// countRows 复刻 dsqlOper($sql, "totalCount")：执行完整 SELECT 取 rowCount（int）。
// 查询错误 → -1（调用方按 PHP 错误串语义处理）。
func (s *Service) countRows(ctx context.Context, q string, args ...any) int {
	if s.db == nil {
		return -1
	}
	rows, err := s.db.QueryContext(ctx, q, args...)
	if err != nil {
		return -1
	}
	defer func() { _ = rows.Close() }()
	n := 0
	for rows.Next() {
		n++
	}
	return n
}

// countTotal 执行 COUNT 查询取首行（getCache(total) 口径：字符串；错误 → ""）。
func (s *Service) countTotal(ctx context.Context, q string, args ...any) string {
	var v sql.NullString
	if s.db == nil {
		return ""
	}
	err := s.db.QueryRowContext(ctx, q, args...).Scan(&v)
	if err != nil || !v.Valid {
		return ""
	}
	return v.String
}

// looseZero 复刻 PHP `$totalCount == 0` 的松散比较（""/"0" → true）。
func looseZero(count string) bool {
	if count == "" || count == "0" {
		return true
	}
	if isNumericString(count) {
		return phpLooseFloat(count) == 0
	}
	return false
}

// filePath 复刻 getFilePath：empty（""/"0"）→ ""；否则转绝对地址。
func (s *Service) filePath(ctx context.Context, host, path string) string {
	if !truthy(path) || s.files == nil {
		return ""
	}
	u, err := s.files.File(ctx, path, fburl.Options{Host: host})
	if err != nil {
		return ""
	}
	return u
}

// urlOf 复刻 getUrlPath（service/template/id）。
func (s *Service) urlOf(ctx context.Context, host, template, id string) string {
	if s.files == nil {
		return ""
	}
	u, err := s.files.URL(ctx, fburl.Params{
		{Key: "service", Value: "travel"},
		{Key: "template", Value: template},
		{Key: "id", Value: id},
	}, fburl.Options{Host: host})
	if err != nil {
		return ""
	}
	return u
}

// appendAt 复刻 PHP $arr[$k] = ... 的顺序追加（本批组装恒为连续下标）。
func appendAt(arr []any, k int, v any) []any {
	if k == len(arr) {
		return append(arr, v)
	}
	for len(arr) <= k {
		arr = append(arr, nil)
	}
	arr[k] = v
	return arr
}

// pagedPayloadList 保持 PHP array("pageInfo"=>.., "list"=>..) 的键序。
func pagedPayloadList(pageinfo *omap, list any) *omap {
	m := newOmap()
	m.set("pageInfo", pageinfo)
	m.set("list", list)
	return m
}

// phpDefaultPage 复刻 action 内 `empty($x) ? def : $x`（"0"/"" → 默认）。
func phpDefaultPage(raw string, def int) int {
	if !truthy(raw) {
		return def
	}
	return phpInt(raw)
}

// phpSwitchInt 复刻 PHP 8 的 switch($str) 与 int case 的松散比较：
// 数字字符串（含前导零）→ 数值；非数字串不匹配任何数字 case（PHP8 改为字符串比较）。
func phpSwitchInt(raw string) int {
	if isNumericString(raw) {
		return phpInt(raw)
	}
	return switchNoMatch
}

const switchNoMatch = -2147483648

func isNumericString(s string) bool {
	if s == "" {
		return false
	}
	i := 0
	if s[i] == '+' || s[i] == '-' {
		i++
	}
	digits := false
	dot := false
	for ; i < len(s); i++ {
		c := s[i]
		if c >= '0' && c <= '9' {
			digits = true
			continue
		}
		if c == '.' && !dot {
			dot = true
			continue
		}
		return false
	}
	return digits
}

// phpIntList 校验逗号分隔的 id 列表（PHP 把 typeid/noid/flag 等原始值不加引号拼进
// `in (...)`。这里逐项做 numeric 校验（MySQL 接受项内空格，PHP 拼接后同样合法，
// 故先 TrimSpace），任一项非数字时 PHP 会产生 SQL 语法错误。
// 注意：PHP 错误面并非统一 102——实测 hotelList/ticketList/storeList 等列表类
// action 经 totalCount 模式落到 101「暂无数据！」（与 respFail 一致），个别 action
// 可能落到 102「格式错误」；未逐一实测的 action 属已报备兼容性差异（见 PR #377）。
// 空串视为「无此参数」，ok=true。
func phpIntList(v string) ([]string, bool) {
	if !truthy(v) {
		return nil, true
	}
	parts := strings.Split(v, ",")
	for i, p := range parts {
		p = strings.TrimSpace(p)
		if !isNumericString(p) {
			return nil, false
		}
		parts[i] = p
	}
	return parts, true
}

// stateOmap 是 PHP `return array("state"=>200,"info"=>...)` 的原始形态。
func stateOmap(info string) *omap {
	m := newOmap()
	m.set("state", 200)
	m.set("info", info)
	return m
}

// memberProjection 复刻 getMemberDetail($uid)：转调 member 服务 detail（simple 缺省 0），
// state==100 取 info，否则空数组 []。
func (s *Service) memberProjection(req *ajax.Request, uid string) any {
	if s.memberDetail == nil {
		return []any{}
	}
	sub := &ajax.Request{Service: "member", Action: "detail", HTTP: req.HTTP}
	sub.Params = url.Values{}
	sub.Params.Set("id", uid)
	sub.ParamsEscaped = sub.Params
	resp := s.memberDetail(sub)
	if resp.State == ajax.StateOK {
		return resp.Info
	}
	return []any{}
}

// viewerID 复刻 $userLogin->getMemberID()：未登录 -1。
func (s *Service) viewerID(ctx context.Context, req *ajax.Request) int64 {
	if s.ident == nil || req.HTTP == nil {
		return -1
	}
	uid, err := s.ident.MemberID(ctx, req.HTTP)
	if err != nil {
		return -1
	}
	return uid
}

// cityID 复刻 getCityId($cid)：param cityid 优先（(int)），否则 siteCityInfo cookie
// （GetCookie 键 = $cfg_cookiePre . 'siteCityInfo'）。
func (s *Service) cityID(ctx context.Context, req *ajax.Request, cid string) int {
	if truthy(cid) {
		return phpInt(cid)
	}
	if req.HTTP == nil {
		return 0
	}
	name := "siteCityInfo"
	if s.cookiePrefix != "" {
		name = s.cookiePrefix + name
	}
	if c, err := req.HTTP.Cookie(name); err == nil && c.Value != "" {
		var m map[string]any
		if jsonUnmarshal([]byte(c.Value), &m) == nil {
			if v, ok := m["cityid"]; ok {
				switch t := v.(type) {
				case float64:
					return int(t)
				case string:
					return phpInt(t)
				}
			}
		}
	}
	return 0
}

// —— storeList（travel.class.php:666-904）——
//
// 口径要点（差异点已在 #371 业务规则评论逐条留档）：
//   - $this->param 恒为数组（ajax.php 构造），`!is_array` 分支是死代码，不实现；
//   - getCache 不复刻（实时查询）；siteSearchLog 是写操作不迁移（#355 口径）；
//   - orderby case 3 被注释 → 排序子句为空串；case 4 仅在 lng&lat 非空时生效；
//   - totalCount==0 → state 200 → handlers 改写 101（文案 暂无数据！）。
func (s *Service) storeList(req *ajax.Request) ajax.Response {
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
	addrid := p.Get("addrid")
	filter := p.Get("filter")
	lng := p.Get("lng")
	lat := p.Get("lat")
	page := phpDefaultPage(p.Get("page"), 1)
	pageSize := phpDefaultPage(p.Get("pageSize"), 10)

	where := " AND `state` = 1"
	var wargs []any // 与 where 片段中占位符顺序一一对应

	// dataShare：$customDataShare 在 canary travel.inc.php 未定义 → 恒 0（cityid 生效）。
	if cityid := s.cityID(ctx, req, p.Get("cityid")); cityid > 0 {
		where += " AND `cityid` = ?"
		wargs = append(wargs, cityid)
	}

	if truthy(filter) {
		where += " AND FIND_IN_SET(?, `bind_module`)"
		wargs = append(wargs, filter)
	}

	if truthy(addrid) {
		lower := s.lowerAddrs(ctx, addrid)
		if lower == "" {
			// 非数字 addrid：PHP 拼出 `in (1abc,...)` 语法错误 → 查询错误面（#371
			// 规则评论「验证口径」：统一按空结果降级）。
			return ajax.Response{State: stateParamFailed, Info: infoNoDataCnt}
		}
		where += " AND `addrid` in (" + lower + ")"
	}

	if truthy(search) {
		// siteSearchLog("travel", $search)：写操作，按 #355 口径不迁移。
		sids := s.storeSearchSids(ctx, search)
		if len(sids) > 0 {
			where += " AND (`title` like ? OR `address` like ? OR `userid` in (" + strings.Join(sids, ",") + "))"
			wargs = append(wargs, "%"+search+"%", "%"+search+"%")
		} else {
			where += " AND (`title` like ? OR `address` like ?)"
			wargs = append(wargs, "%"+search+"%", "%"+search+"%")
		}
	}

	hasGeo := truthy(lng) && truthy(lat)
	if truthy(p.Get("max_longitude")) && truthy(p.Get("min_longitude")) &&
		truthy(p.Get("max_latitude")) && truthy(p.Get("min_latitude")) {
		where += " AND `lng` <= ? AND `lng` >= ? AND `lat` <= ? AND `lat` >= ?"
		wargs = append(wargs, p.Get("max_longitude"), p.Get("min_longitude"), p.Get("max_latitude"), p.Get("min_latitude"))
	}

	var selectExtra string
	var extraArgs []any
	if hasGeo {
		selectExtra = distanceSelect + ","
		extraArgs = append(extraArgs, lat, lat, lng)
	}
	orderBy := storeListOrderby(p.Get("orderby"), hasGeo)

	totalCount := s.countTotal(ctx, "SELECT COUNT(`id`) total FROM `"+s.prefix+"travel_store` WHERE 1 = 1"+where, wargs...)
	if looseZero(totalCount) {
		return ajax.Response{State: stateParamFailed, Info: infoNoDataCnt}
	}

	pageinfo := newOmap()
	pageinfo.set("page", page)
	pageinfo.set("pageSize", pageSize)
	pageinfo.set("totalPage", phpCeil(totalCount, float64(pageSize)))
	pageinfo.set("totalCount", totalCount)

	atpage := pageSize * (page - 1)
	q := "SELECT `bind_module`, `title`, `pubdate`, `pics`, `video`, `license`, `lat`, `lng`, `id`,`userid`, `address`, `tel`, `addrid`, " +
		selectExtra + " `contact`,`flag` FROM `" + s.prefix + "travel_store` WHERE 1 = 1" + where +
		orderBy + " LIMIT " + strconv.Itoa(atpage) + ", " + strconv.Itoa(pageSize)
	rows, ok := s.queryRows(ctx, q, append(extraArgs, wargs...)...)
	if !ok {
		// dsqlOper 错误 → $results falsy → list 空数组（外层 102）。
		return ajax.Response{State: ajax.StateOK, Info: pagedPayloadList(pageinfo, []any{})}
	}
	list := make([]any, 0, len(rows))
	for _, val := range rows {
		item := newOmap()
		item.set("id", val.get("id"))
		item.set("title", val.get("title"))
		item.set("address", val.get("address"))
		item.set("tel", val.get("tel"))
		item.set("telEncrypt", telEncrypt(val.str("tel")))
		item.set("lng", val.get("lng"))
		item.set("lat", val.get("lat"))
		item.set("flag", val.get("flag"))
		item.set("pubdate", val.get("pubdate"))
		item.set("bind_module", val.get("bind_module"))
		item.set("contact", val.get("contact"))
		item.set("license", val.get("license"))
		item.set("video", val.get("video"))
		if hasGeo {
			item.set("distance", distanceText(phpLooseFloat(val.str("distance"))))
		} else {
			// 无坐标：$val['distance'] 未定义 → sprintf("%.1f", null)="0.0" + 米 → "0.0m"。
			item.set("distance", "0.0m")
		}

		// tickarr：旅行社最新发布的两条（travel_agency company=store.id）。
		item.set("tickarr", s.storeTickarr(ctx, host, val.str("id")))

		bindArr := []any{}
		bindRaw := []any{}
		if truthy(val.str("bind_module")) {
			for k, row := range strings.Split(val.str("bind_module"), ",") {
				m := newOmap()
				m.set("id", row)
				m.set("val", typeNameByID(moduleTypeItems(), row))
				bindArr = appendAt(bindArr, k, m)
				bindRaw = appendAt(bindRaw, k, row)
			}
		}
		item.set("bind_moduleArr", bindArr)
		item.set("bind_moduleArr_", bindRaw)

		litpic := ""
		if truthy(val.str("pics")) {
			pics := strings.Split(val.str("pics"), ",")
			litpic = s.filePath(ctx, host, pics[0])
		}
		item.set("litpic", litpic)

		item.set("addrname", addrnameOf(ctx, s, val.str("addrid")))

		item.set("url", s.urlOf(ctx, host, "store-detail", val.str("id")))

		list = append(list, item)
	}
	return ajax.Response{State: ajax.StateOK, Info: pagedPayloadList(pageinfo, list)}
}

// storeListOrderby 复刻 storeList 的 switch($orderby)（loose 数字比较）：
// 1 click / 2 pubdate / 3 空串（被注释）/ 4 距离（需坐标）/ default weight,id。
func storeListOrderby(raw string, hasGeo bool) string {
	switch phpSwitchInt(raw) {
	case 1:
		return " ORDER BY `click` DESC, `weight` DESC, `id` DESC"
	case 2:
		return " ORDER BY `pubdate` DESC, `weight` DESC, `id` DESC"
	case 3:
		return ""
	case 4:
		if hasGeo {
			return " ORDER BY distance ASC"
		}
		return ""
	default:
		return " ORDER BY `weight` DESC, `id` DESC"
	}
}

// storeTickarr 复刻 storeList 内嵌的旅行社两条查询与组装。
func (s *Service) storeTickarr(ctx context.Context, host, storeID string) []any {
	rows, ok := s.queryRows(ctx,
		"SELECT `id`, `pics`, (SELECT min(c.`price`) minprice FROM `"+s.prefix+
			"travel_ticketinfo` c WHERE c.`ticketid` = l.`id` AND c.`typeid` = '1' ) AS price, `state`  FROM `"+
			s.prefix+"travel_agency` l WHERE company = "+storeID+" ORDER BY  `pubdate`  DESC LIMIT 0,2")
	if !ok || len(rows) == 0 {
		return []any{}
	}
	out := make([]any, 0, len(rows))
	for _, b := range rows {
		m := newOmap()
		pics := strings.Split(b.str("pics"), ",")
		m.set("pics", s.filePath(ctx, host, pics[0]))
		m.set("id", b.get("id"))
		m.set("minprice", b.get("price"))
		m.set("url", s.urlOf(ctx, host, "agency-detail", b.str("id")))
		out = append(out, m)
	}
	return out
}

// —— storeDetail（travel.class.php:905-1075）——
//
// storeDetailRaw 是 storeDetail 的原始返回（含 state=200 错误数组与空数组形态），
// 供 hotelList/ticketList/rentcarList/agencyList/visaList 内联递归调用
// （PHP `$store = $this->storeDetail()` 拿到的就是原样数组）。
// 返回值：nil = 空数组（falsy）；isErr = PHP 原始 state=200 错误数组（成功形态无该标记）。
func (s *Service) storeDetailRaw(ctx context.Context, host string, param url.Values, viewer int64, req *ajax.Request) (*omap, bool) {
	// PHP：$this->param 恒为数组 → gettype = $this->param['gettype']（缺失 → null → 0）。
	gettype := param.Get("gettype")
	id := param.Get("id") // is_numeric(param) 恒 false → $id = $id['id']（缺失 → null）。

	if !isNumericString(id) && viewer == -1 {
		return stateOmap(infoFormatError), true
	}

	where := ""
	if phpInt(gettype) == 0 {
		where = " AND `state` = 1"
	}
	if !isNumericString(id) {
		// 已登录：按 userid 找自己的店（绕过 state 过滤）。
		if s.db == nil {
			return stateOmap(infoNoCompany), true
		}
		var first sql.NullString
		err := s.db.QueryRowContext(ctx,
			"SELECT `id` FROM `"+s.prefix+"travel_store` WHERE `userid` = "+strconv.FormatInt(viewer, 10)).
			Scan(&first)
		if err != nil || !first.Valid {
			return stateOmap(infoNoCompany), true
		}
		id = first.String
		where = ""
	}
	if s.db == nil {
		return nil, false
	}

	q := "SELECT `id`, `cityid`, `title`, `userid`, `lng`, `flag`, `lat`, `addrid`, `address`, `tel`, `contact`, `pics`, `video`, `note`, `license`, `servicetime`, `click`, `pubdate`, `state`, `bind_module`,`date`,`openStart`,`openEnd`, `refuse`  FROM `" +
		s.prefix + "travel_store` WHERE `id` = " + id + where
	rows, ok := s.queryRows(ctx, q)
	if !ok || len(rows) == 0 {
		// PHP: $results falsy → return $storeDetail = []（空数组）。
		return nil, false
	}
	r := rows[0]

	d := newOmap()
	d.set("id", r.get("id"))
	d.set("cityid", r.get("cityid"))
	d.set("flag", r.get("flag"))
	d.set("title", r.get("title"))
	d.set("userid", r.get("userid"))
	d.set("address", r.get("address"))
	d.set("lng", r.get("lng"))
	d.set("lat", r.get("lat"))
	d.set("tel", r.get("tel"))
	d.set("telEncrypt", telEncrypt(r.str("tel")))
	d.set("contact", r.get("contact"))
	d.set("click", r.get("click"))
	d.set("state", r.get("state"))
	d.set("refuse", r.get("refuse"))
	d.set("license", r.get("license"))
	// PHP 先赋 servicetime 字段值，随后立即被 date 字段覆盖（L293）——终值 = date。
	d.set("servicetime", r.get("date"))
	d.set("openStart", r.get("openStart"))
	d.set("openEnd", r.get("openEnd"))
	d.set("note", r.get("note"))
	d.set("video", r.get("video"))
	d.set("videoSource", s.filePath(ctx, host, r.str("video")))
	d.set("bind_module", r.get("bind_module"))

	bindArr, bindRaw := typePairs(moduleTypeItems(), r.str("bind_module"))
	d.set("bind_moduleArr", bindArr)
	d.set("bind_moduleArr_", bindRaw)

	// 星期：getname("moduleType", val) → moduleTypeWeek 列表查找。
	openweek, weekRaw := typePairs(weekItems(), r.str("date"))
	weekkParts := []string{}
	for _, m := range openweek {
		weekkParts = append(weekkParts, m.(*omap).vals["val"].(string))
	}
	d.set("weekk", strings.Join(weekkParts, ","))
	d.set("openweek", openweek)
	d.set("openweek_", weekRaw)

	// member = getMemberDetail($results[0]['userid'])：member.detail 全量投影（simple=0）。
	d.set("member", s.memberProjection(req, r.str("userid")))

	addrid := r.str("addrid")
	d.set("addrid", r.get("addrid"))
	if truthy(addrid) {
		var parentid sql.NullString
		_ = s.db.QueryRowContext(ctx,
			"SELECT `parentid` FROM `"+s.prefix+"site_area` WHERE `id` = '"+addrid+"'").Scan(&parentid)
		if parentid.Valid {
			d.set("circleAddrid", parentid.String)
		}
	}
	chain := s.areaChain(ctx, phpInt(addrid))
	d.set("addrname", addrnameFromChain(addrid, chain))
	d.set("city", cityOf(chain))
	d.set("address", r.get("address"))

	// collect：PHP 的 $uid 已被覆盖为店主 id，`$uid != -1` 恒真 → 恒执行校验
	//（校验内部用的是当前登录态）。
	collect := ""
	if s.collectCheck != nil {
		collect = s.collectCheck(req, "travel", "store-detail", "add", r.str("id"))
	}
	d.set("collect", boolInt(collect == "has"))

	imglist := []any{}
	if truthy(r.str("pics")) {
		for k, v := range strings.Split(r.str("pics"), ",") {
			m := newOmap()
			m.set("path", s.filePath(ctx, host, v))
			m.set("pathSource", v)
			imglist = appendAt(imglist, k, m)
		}
	}
	d.set("pics", imglist)

	// minPrice：avg(price) 子查询首行 → floatval(sprintf("%.2f")) → PHP float JSON（0 → 0.0）。
	minPrice := 0.0
	var price sql.NullString
	_ = s.db.QueryRowContext(ctx,
		"SELECT (SELECT avg(c.`price`) FROM `"+s.prefix+"travel_ticketinfo` c WHERE c.`ticketid` = l.`id` AND c.`typeid` = '1' ) AS price FROM `"+
			s.prefix+"travel_agency` l WHERE `company` = "+id).Scan(&price)
	if price.Valid && isNumericString(strings.TrimSpace(price.String)) {
		// floatval(sprintf("%.2f", ...))：先格式化两位小数再转 float。
		minPrice = phpLooseFloat(phpSprintf2f(price.String))
	}
	d.set("minPrice", phpFloatOf(minPrice))

	return d, false
}

// typePairs 复刻 `{id: v, val: gettypename(...)}` 数组对的组装（空源 → 两个 []）。
func typePairs(items []staticItem, raw string) ([]any, []any) {
	arr, rawArr := []any{}, []any{}
	if !truthy(raw) {
		return arr, rawArr
	}
	for k, v := range strings.Split(raw, ",") {
		m := newOmap()
		m.set("id", v)
		m.set("val", typeNameByID(items, v))
		arr = appendAt(arr, k, m)
		rawArr = appendAt(rawArr, k, v)
	}
	return arr, rawArr
}

// storeDetailAction 是 storeDetail 的 ajax 入口（handlers 包装语义）。
func (s *Service) storeDetailAction(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	viewer := s.viewerID(ctx, req)
	raw, isErr := s.storeDetailRaw(ctx, reqHost(req), req.Params, viewer, req)
	if raw == nil {
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}
	if isErr {
		// state=200 → handlers 改写 101（info 原样）。
		return ajax.Response{State: stateParamFailed, Info: raw.vals["info"]}
	}
	return ajax.Response{State: ajax.StateOK, Info: raw}
}
