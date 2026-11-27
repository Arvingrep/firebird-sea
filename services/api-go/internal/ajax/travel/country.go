package travel

import (
	"context"
	"math"
	"regexp"
	"strconv"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/fburl"
)

// travelItemRow 是 travelitem list 行；字段顺序与 PHP $list[$key] 赋值顺序一致
// （travel.class.php:392-410）。
type travelItemRow struct {
	ID          string `json:"id"`
	ParentID    string `json:"parentid"`
	Typename    string `json:"typename"`
	Weight      string `json:"weight"`
	Pubdate     string `json:"pubdate"`
	Typeid      string `json:"typeid"`
	Typeidname  string `json:"typeidname"`
	Description string `json:"description"`
}

// pageinfo 是 travelitem / countrytype 的分页头（PHP 数组顺序一致）。
type pageinfo struct {
	Page       string `json:"page"`
	PageSize   string `json:"pageSize"`
	TotalPage  string `json:"totalPage"`
	TotalCount string `json:"totalCount"`
}

// pagedPayload 保持 PHP array("pageInfo"=>.., "list"=>..) 的键序（Go map 会按字母序）。
type pagedPayload struct {
	PageInfo pageinfo `json:"pageInfo"`
	List     any      `json:"list"`
}

// countryDetailInfo 保持 PHP $storeDetail 的赋值键序。
type countryDetailInfo struct {
	ID            string `json:"id"`
	Click         string `json:"click"`
	Pubdate       string `json:"pubdate"`
	Typename      string `json:"typename"`
	Icon          string `json:"icon"`
	IconSource    string `json:"iconSource"`
	Pinyin        string `json:"pinyin"`
	Py            string `json:"py"`
	Hot           string `json:"hot"`
	Continent     string `json:"continent"`
	Continentname string `json:"continentname"`
	Typeid        string `json:"typeid"`
	Typeidname    string `json:"typeidname"`
	Duration      string `json:"duration"`
	Condition     string `json:"condition"`
	Price         string `json:"price"`
	Expenses      string `json:"expenses"`
	Collect       int    `json:"collect"`
}

// aidPattern 约束 aid 只能是数字/逗号：PHP 把 $aid 原样拼进 `id in ($aid)`（存在注入），
// Go 侧拒绝非数字组合并按「无匹配」处理，行为差异在 #370 业务规则评论报备。
var aidPattern = regexp.MustCompile(`^[0-9]+(,[0-9]+)*$`)

// travelitem（travel.class.php:355-429）：签证所需材料分页列表。
//
// 口径要点：
//   - 分页参数 page/pageSize：PHP empty→默认 1/10（注意这里不走 ajax.php 的 GET 默认逻辑，
//     因为 travelitem 直接读 $this->param，"0" 是 empty → 默认）；
//   - 总条数经 getCache 包装（缓存对结果无影响，Go 直接查）；
//   - huoniao_travelitem 表在 canary 本地不存在 → count 查询返回错误串 → PHP
//     `'{...}' == 0` 为 true → 恒走「暂无数据！」（state 200 → 101）。Go：查询错误 → 同响应；
//   - typeidname 映射：1=原件、2=复印件、其他=电子稿（语言包 [12][97..99]）。
func (s *Service) travelitem(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	where := ""
	if aid := req.Params.Get("aid"); aid != "" {
		if !aidPattern.MatchString(aid) {
			// PHP 拼进 SQL 会直接报错 → count 失败 → 暂无数据。Go 同响应。
			return ajax.Response{State: stateParamFailed, Info: infoNoTravelItem}
		}
		where = " AND `id` in (" + aid + ")"
	}

	pageSize := req.Params.Get("pageSize")
	if pageSize == "" || pageSize == "0" {
		pageSize = "10"
	}
	page := req.Params.Get("page")
	if page == "" || page == "0" {
		page = "1"
	}

	if s.db == nil {
		return ajax.Response{State: stateParamFailed, Info: infoNoTravelItem}
	}
	var totalCount string
	err := s.db.QueryRowContext(ctx,
		"SELECT COUNT(`id`) total FROM `"+s.prefix+"travelitem` WHERE 1 = 1"+where).Scan(&totalCount)
	if err != nil || totalCount == "0" {
		// PHP：dsqlOper 异常返回错误串（==0 为 true）或真 0 → 暂无数据。
		return ajax.Response{State: stateParamFailed, Info: infoNoTravelItem}
	}
	totalPage := int(math.Ceil(phpLooseFloat(totalCount) / phpLooseFloat(pageSize)))

	atpage := int(phpLooseFloat(pageSize) * (phpLooseFloat(page) - 1))
	order := " ORDER BY `weight` DESC, `pubdate` DESC, `id` DESC"
	q := "SELECT  `id`, `parentid`, `typename`, `weight`, `description`, `pubdate`, `typeid` FROM `" +
		s.prefix + "travelitem` WHERE 1=1 " + where + order +
		" LIMIT " + strconv.Itoa(atpage) + ", " + pageSize
	rows, qerr := s.db.QueryContext(ctx, q)
	if qerr != nil {
		return ajax.Response{State: stateParamFailed, Info: infoNoTravelItem}
	}
	defer func() { _ = rows.Close() }()
	list := []travelItemRow{}
	for rows.Next() {
		var r travelItemRow
		if err := rows.Scan(&r.ID, &r.ParentID, &r.Typename, &r.Weight, &r.Description, &r.Pubdate, &r.Typeid); err != nil {
			return ajax.Response{State: stateParamFailed, Info: infoNoTravelItem}
		}
		switch r.Typeid {
		case "1":
			r.Typeidname = langTravel12_97
		case "2":
			r.Typeidname = langTravel12_98
		default:
			r.Typeidname = langTravel12_99
		}
		list = append(list, r)
	}
	if err := rows.Err(); err != nil {
		return ajax.Response{State: stateParamFailed, Info: infoNoTravelItem}
	}
	return ajax.Response{State: ajax.StateOK, Info: pagedPayload{
		PageInfo: pageinfo{Page: page, PageSize: pageSize, TotalPage: strconv.Itoa(totalPage), TotalCount: totalCount},
		List:     list,
	}}
}

// countryRow 是 countrytype list 行（travel.class.php:492-524 赋值顺序）。
// url 按 #238 口径不输出，compare 用 ignoreFields 忽略。
type countryRow struct {
	ID            string `json:"id"`
	Parentid      string `json:"parentid"`
	Typename      string `json:"typename"`
	Weight        string `json:"weight"`
	Pubdate       string `json:"pubdate"`
	Price         string `json:"price"`
	Continent     string `json:"continent"`
	Typeid        string `json:"typeid"`
	Pinyin        string `json:"pinyin"`
	Py            string `json:"py"`
	Firstword     string `json:"firstword"`
	Hot           string `json:"hot"`
	Icon          string `json:"icon"`
	Typeidname    string `json:"typeidname"`
	Continentname string `json:"continentname"`
}

// countrytype（travel.class.php:430-489）：签证国家分页列表。
//
// 口径要点：
//   - 过滤 hot/continent/typeid：PHP 原样拼 SQL（注入面），Go 对 continent/typeid 做
//     白名单校验（数字），非法值按「无匹配」→ 暂无数据；偏差已报备；
//   - typeid 条件是 `AND typeid = '$typeid' or typeid = 2`——SQL 优先级把它拆成
//     `(1=1 AND typeid=x) OR typeid=2`，Go 按同款括号复刻；
//   - orderby：1→py DESC, hot DESC；2→hot DESC；3→py ASC, hot DESC；其他→weight DESC, pubdate DESC, id DESC；
//   - huoniao_travel_visacountrytype 在 canary 本地不存在 → 恒「暂无数据！」（101）。
func (s *Service) countrytype(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	where := ""
	if hot := req.Params.Get("hot"); hot != "" {
		where = " AND `hot` = 1"
	}
	if continent := req.Params.Get("continent"); continent != "" {
		if !numericPattern.MatchString(continent) {
			return ajax.Response{State: stateParamFailed, Info: infoNoTravelItem}
		}
		where = " AND `continent` = '" + continent + "'"
	}
	typeid := req.Params.Get("typeid")
	if typeid != "" {
		if !numericPattern.MatchString(typeid) {
			return ajax.Response{State: stateParamFailed, Info: infoNoTravelItem}
		}
		where = " AND `typeid` = '" + typeid + "' or `typeid` = 2"
	}

	order := " ORDER BY `weight` DESC, `pubdate` DESC, `id` DESC"
	switch req.Params.Get("orderby") {
	case "1":
		order = " ORDER BY `py` DESC, `hot` DESC"
	case "2":
		order = " ORDER BY `hot` DESC"
	case "3":
		order = " ORDER BY `py` ASC, `hot` DESC"
	}

	pageSize := req.Params.Get("pageSize")
	if pageSize == "" || pageSize == "0" {
		pageSize = "10"
	}
	page := req.Params.Get("page")
	if page == "" || page == "0" {
		page = "1"
	}

	if s.db == nil {
		return ajax.Response{State: stateParamFailed, Info: infoNoTravelItem}
	}
	var totalCount string
	err := s.db.QueryRowContext(ctx,
		"SELECT COUNT(`id`) total FROM `"+s.prefix+"travel_visacountrytype` WHERE 1 = 1"+where).Scan(&totalCount)
	if err != nil || totalCount == "0" {
		return ajax.Response{State: stateParamFailed, Info: infoNoTravelItem}
	}
	totalPage := int(math.Ceil(phpLooseFloat(totalCount) / phpLooseFloat(pageSize)))

	atpage := int(phpLooseFloat(pageSize) * (phpLooseFloat(page) - 1))
	q := "SELECT  `id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `pinyin`, `py`, `hot`, `price`, `continent`, `typeid` FROM `" +
		s.prefix + "travel_visacountrytype` WHERE 1=1 " + where + order +
		" LIMIT " + strconv.Itoa(atpage) + ", " + pageSize
	rows, qerr := s.db.QueryContext(ctx, q)
	if qerr != nil {
		return ajax.Response{State: stateParamFailed, Info: infoNoTravelItem}
	}
	defer func() { _ = rows.Close() }()
	list := []countryRow{}
	for rows.Next() {
		var r countryRow
		if err := rows.Scan(&r.ID, &r.Parentid, &r.Typename, &r.Weight, &r.Pubdate, &r.Icon,
			&r.Pinyin, &r.Py, &r.Hot, &r.Price, &r.Continent, &r.Typeid); err != nil {
			return ajax.Response{State: stateParamFailed, Info: infoNoTravelItem}
		}
		if r.Py != "" {
			r.Firstword = strings.ToUpper(r.Py[:1])
		}
		// icon：PHP empty($val['icon']) ? '' : getFilePath(icon)
		if r.Icon != "" && r.Icon != "0" && s.files != nil {
			if u, err := s.files.File(ctx, r.Icon, fburl.Options{Host: reqHost(req)}); err == nil {
				r.Icon = u
			} else {
				r.Icon = ""
			}
		} else if r.Icon == "0" {
			r.Icon = ""
		}
		// PHP: typeid==2 时用请求参数 typeid 查名（源码 bug，照抄），否则用行 typeid。
		if r.Typeid == "2" {
			r.Typeidname = typeNameByID(typeidTypeItems(), typeid)
		} else {
			r.Typeidname = typeNameByID(typeidTypeItems(), r.Typeid)
		}
		r.Continentname = continentNameFor(r.Continent)
		list = append(list, r)
	}
	if err := rows.Err(); err != nil {
		return ajax.Response{State: stateParamFailed, Info: infoNoTravelItem}
	}
	return ajax.Response{State: ajax.StateOK, Info: pagedPayload{
		PageInfo: pageinfo{Page: page, PageSize: pageSize, TotalPage: strconv.Itoa(totalPage), TotalCount: totalCount},
		List:     list,
	}}
}

// numericPattern 约定 continent/typeid 只接受数字串（PHP 原样拼 SQL 的注入面在 Go 关闭）。
var numericPattern = regexp.MustCompile(`^[0-9]+$`)

// countryDetail（travel.class.php:542-596）：签证国家详情。
//
// 口径要点：
//   - id：$this->param 恒为数组 → (int)$id['id']；缺参 → 0 → 101 请填写联系人；
//   - 查询 `WHERE id = $id AND state = 1`；huoniao_travel_visacountrytype 本地不存在 →
//     dsqlOper 返回错误串 '{"state": 200, "info": "操作失败！"}' → PHP 对字符串做
//     $results[0]['xxx'] → 非法偏移，全部取首字符 "{"（实测输出 id:"{" 等）；
//     Go 复刻该字符串行为：所有字段 "{"，iconSource 按 getFilePath("{")="" 处理；
//   - collect：uid==-1（未登录）恒 ""；登录时经 member 的 CollectCheck（check=1）→
//     "has"→1 否则 0。canary 本地恒未登录 → 0。
func (s *Service) countryDetail(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	id := phpInt(req.Params.Get("id"))
	if id == 0 {
		return ajax.Response{State: stateParamFailed, Info: infoNoCountryDetail}
	}
	if s.db == nil {
		return ajax.Response{State: stateParamFailed, Info: infoNoCountryDetail}
	}
	q := "SELECT `id`, `pubdate`, `typename`, `icon`, `pinyin`, `py`, `hot`, `continent`, `typeid`, `duration`, `condition`, `price`, `click`, `expenses`  FROM `" +
		s.prefix + "travel_visacountrytype` WHERE `id` = " + strconv.Itoa(id) + " AND `state` = 1"
	rows, err := s.db.QueryContext(ctx, q)
	if err != nil {
		// 复刻 PHP 对错误串的字符串下标行为：所有字段为 "{"。
		return ajax.Response{State: ajax.StateOK, Info: dsqlErrorDetailShape()}
	}
	defer func() { _ = rows.Close() }()
	if !rows.Next() {
		// PHP: getCache 结果空数组 → $results falsy → return $storeDetail = [] → 102。
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}
	var id_, pubdate, typename, icon, pinyin, py, hot, continent, typeid, duration, condition, price, click, expenses string
	if err := rows.Scan(&id_, &pubdate, &typename, &icon, &pinyin, &py, &hot, &continent, &typeid,
		&duration, &condition, &price, &click, &expenses); err != nil {
		return ajax.Response{State: stateParamFailed, Info: infoNoCountryDetail}
	}

	iconSource := ""
	if icon != "" && icon != "0" && s.files != nil {
		if u, ferr := s.files.File(ctx, icon, fburl.Options{Host: reqHost(req)}); ferr == nil {
			iconSource = u
		}
	}

	// collect 校验（登录态）。
	collect := ""
	if s.ident != nil && req.HTTP != nil {
		if uid, uerr := s.ident.MemberID(ctx, req.HTTP); uerr == nil && uid != -1 {
			if s.collectCheck != nil {
				collect = s.collectCheck(req, "travel", "visacountry-detail", "add", id_)
			}
		}
	}

	return ajax.Response{State: ajax.StateOK, Info: countryDetailInfo{
		ID:            id_,
		Click:         click,
		Pubdate:       pubdate,
		Typename:      typename,
		Icon:          icon,
		IconSource:    iconSource,
		Pinyin:        pinyin,
		Py:            py,
		Hot:           hot,
		Continent:     continent,
		Continentname: continentNameFor(continent),
		Typeid:        typeid,
		Typeidname:    typeNameByID(typeidTypeItems(), typeid),
		Duration:      duration,
		Condition:     condition,
		Price:         price,
		Expenses:      expenses,
		Collect:       boolInt(collect == "has"),
	}}
}

// dsqlErrorDetailShape 复刻 countryDetail 对 dsqlOper 错误串的字符串下标读取：
// PHP `'{"state"...}'[0]['xxx']` → 非法字符串偏移 → 全部返回首字符 "{"。
// 键顺序即 PHP $storeDetail 赋值顺序；continentname/typeidname 走 gettypename("{")：
// continent 列表无 0 → 回落第一项（亚洲）；typeid 列表 0 命中（免签）—— 与实测一致。
func dsqlErrorDetailShape() countryDetailInfo {
	const brace = "{"
	return countryDetailInfo{
		ID:            brace,
		Click:         brace,
		Pubdate:       brace,
		Typename:      brace,
		Icon:          brace,
		IconSource:    "",
		Pinyin:        brace,
		Py:            brace,
		Hot:           brace,
		Continent:     brace,
		Continentname: continentNameFor(brace),
		Typeid:        brace,
		Typeidname:    typeNameByID(typeidTypeItems(), brace),
		Duration:      brace,
		Condition:     brace,
		Price:         brace,
		Expenses:      brace,
		Collect:       0,
	}
}

// continentNameFor 复刻 PHP `$val['continent'] ? gettypename(...) : ”`（"0" 是 falsy）。
func continentNameFor(continent string) string {
	if continent == "" || continent == "0" {
		return ""
	}
	return typeNameByID(continentTypeItems(), continent)
}

func boolInt(b bool) int {
	if b {
		return 1
	}
	return 0
}

// CollectCheckFunc 对应 checkIsCollect()（member 服务注入）：module/temp/action/id，
// 返回 "has" / "no" / "ok"，state != 100 时为空串。
type CollectCheckFunc func(req *ajax.Request, module, temp, action, id string) string
