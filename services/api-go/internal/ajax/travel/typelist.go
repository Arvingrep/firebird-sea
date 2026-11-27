package travel

import (
	"context"
	"database/sql"
	"errors"
	"math"
	"regexp"
	"strconv"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/fburl"
)

// phpInt 复刻 PHP 7.4 对字符串的 (int)：整体为数字串（允许首尾空白、科学计数法）时
// 按浮点解析后截断（"1e2"→100、"1e2abc"→100、"1.9"→1、"  5 "→5、"0x1A"→0、"abc"→0），
// 溢出饱和到 int64 极值。口径与 ajax.phpIntval 一致（docker php7.4 实测核对）。
func phpInt(raw string) int {
	m := leadingNumber.FindString(raw)
	if m == "" {
		return 0
	}
	m = strings.TrimLeft(m, " \t\n\r\x0B\x0C")
	if intPrefix.MatchString(m) {
		n, err := strconv.ParseInt(m, 10, 64)
		if err != nil {
			if strings.HasPrefix(m, "-") {
				return -9223372036854775808
			}
			return 9223372036854775807
		}
		return int(n)
	}
	f, err := strconv.ParseFloat(m, 64)
	if err != nil && !math.IsInf(f, 0) {
		return 0
	}
	switch {
	case f >= 9223372036854775807:
		return 9223372036854775807
	case f <= -9223372036854775808:
		return -9223372036854775808
	}
	return int(f)
}

// phpSon 复刻 `$param['son'] == 0 ? false : true`（PHP 7.4：字符串与 0 比较时
// 取前导数字，无数字为 0）。缺参 null==0 → false；"abc"、""、"0" → false。
// 口径同 article.phpSon（leadingNumber 正则 + ParseFloat）。
var leadingNumber = regexp.MustCompile(`^[ \t\n\r\x0B\x0C]*[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?`)

// intPrefix 是 phpInt 的纯整数串判定（前缀解析后为 \d+ 才走整型路径）。
var intPrefix = regexp.MustCompile(`^[+-]?[0-9]+$`)

func phpSon(raw string) bool {
	m := leadingNumber.FindString(raw)
	if m == "" {
		return false
	}
	f, err := strconv.ParseFloat(strings.TrimLeft(m, " \t\n\r\x0B\x0C"), 64)
	return err != nil || f != 0
}

// typeRow 是 getTypeList 返回的一行；字段顺序与 PHP $return[$kk] 赋值顺序一致
// （dsql.class.php getTypeList：id、parentid、typename、[level]、[longitude/latitude]、
// title、[note]、[litpic]、[iconturl/icon]、url、site_area 的 pinyin/weather_code、lower）。
//
// url 按 #238 裁决口径（article.type 同做法）暂不输出：getUrlPath 待 #330（fburl）接入后补，
// 对比用例以 ignoreFields 忽略。本地 canary 环境 site_area 的 url 恒为 null，
// travel_*type 表在 huoniao_ 前缀下不存在（查询报错 → 101），url 不会出现在真实响应里。
type typeRow struct {
	ID        int     `json:"id"`
	ParentID  int     `json:"parentid"`
	Typename  string  `json:"typename"`
	Level     *string `json:"level,omitempty"`
	Longitude *string `json:"longitude,omitempty"`
	Latitude  *string `json:"latitude,omitempty"`
	Title     string  `json:"title"`
	// Note 仅当表有 note 列时输出（PHP isset($results[$kk]['note'])）。
	Note *string `json:"note,omitempty"`
	Litpic *string `json:"litpic,omitempty"`
	// IconURL / Icon 仅当表有 icon 列时输出（PHP isset($v['icon'])）：
	// iconturl = empty(icon) ? '' : getFilePath(icon)；icon = iconturl（API 侧 HUONIAOADMIN=''）。
	IconURL *string `json:"iconturl,omitempty"`
	Icon    *string `json:"icon,omitempty"`
	// Pinyin / WeatherCode 仅 site_area 输出（PHP 恒写，空值也是 ""）；其它表不写键 → nil。
	Pinyin      *string `json:"pinyin,omitempty"`
	WeatherCode *string `json:"weather_code,omitempty"`
	Lower       any     `json:"lower,omitempty"`
}

// getTypeList 移植 dsql::getTypeList（dsql.class.php:204-449）中 travel 批次1 用到的路径。
// 表按 huoniao_ 前缀拼进 SQL；表不存在（canary 本地 huoniao_travel_rentcartype 等）时
// PHP 的 catch 分支返回 array(state=200, info="分类获取失败！") → getHandle 改写成 101。
//
// 口径说明（相对 PHP 的刻意偏差）：
//  1. url 键不输出（#238 裁决，见 typeRow 注释）；
//  2. hideSameCity 的 siteCity 过滤在 canary 不生效（$cfg_sameAddr_state=1），未实现该分支；
//  3. son=true 的递归 limit 固定 PHP 的 1,100000。
func (s *Service) getTypeList(ctx context.Context, host, tab string, id int, son bool, page, pageSize int) ([]typeRow, error) {
	if page == 0 {
		page = 1
	}
	if pageSize == 0 {
		pageSize = 1000
	}
	offset := pageSize * (page - 1)
	if s.db == nil {
		return nil, errDBUnavailable
	}
	q := "SELECT * FROM `" + s.prefix + tab + "` WHERE `parentid` = " + strconv.Itoa(id) + " ORDER BY `weight` LIMIT " +
		strconv.Itoa(offset) + ", " + strconv.Itoa(pageSize)
	rows, err := s.db.QueryContext(ctx, q)
	if err != nil {
		// PHP: prepare/execute 抛异常 → catch → array(state=200, info=分类获取失败！)
		return nil, err
	}
	cols, err := rows.Columns()
	if err != nil {
		_ = rows.Close()
		return nil, err
	}
	var records []map[string]string
	for rows.Next() {
		vals := make([]sql.NullString, len(cols))
		dest := make([]any, len(cols))
		for i := range vals {
			dest[i] = &vals[i]
		}
		if err := rows.Scan(dest...); err != nil {
			_ = rows.Close()
			return nil, err
		}
		rec := make(map[string]string, len(cols))
		for i, c := range cols {
			rec[c] = vals[i].String
		}
		records = append(records, rec)
	}
	if err := rows.Err(); err != nil {
		_ = rows.Close()
		return nil, err
	}
	_ = rows.Close()

	items := make([]typeRow, 0, len(records))
	for _, r := range records {
		item := typeRow{
			ID:       phpInt(r["id"]),
			ParentID: phpInt(r["parentid"]),
			Typename: r["typename"],
		}
		if v, ok := r["level"]; ok {
			lv := v
			item.Level = &lv
		}
		if v, ok := r["longitude"]; ok {
			lon := v
			item.Longitude = &lon
			lat := r["latitude"]
			item.Latitude = &lat
		}
		// PHP: $v['title'] ? $v['title'] : $v['typename']（"0" 也是 falsy）
		if t := r["title"]; t != "" && t != "0" {
			item.Title = t
		} else {
			item.Title = item.Typename
		}
		// litpic：PHP 仅在原始 litpic 为真值时写入该键（getFilePath 结果可能是 ""）。
		if l := r["litpic"]; l != "" && l != "0" {
			pic := l
			if s.files != nil {
				if pic, err = s.files.File(ctx, l, fburl.Options{Host: host}); err != nil {
					return nil, err
				}
			}
			item.Litpic = &pic
		}
		// note：PHP isset($results[$kk]['note']) → 列存在才写键（值原样）。
		if v, ok := r["note"]; ok {
			note := v
			item.Note = &note
		}
		// iconturl/icon：PHP isset($v['icon']) → 列存在才写键；iconturl = empty(icon)
		// ? '' : getFilePath(icon)；icon = iconturl（API 侧 HUONIAOADMIN 恒空）。
		if v, ok := r["icon"]; ok {
			iu := ""
			if v != "" && v != "0" && s.files != nil {
				if u, ferr := s.files.File(ctx, v, fburl.Options{Host: host}); ferr == nil {
					iu = u
				}
			}
			item.IconURL = &iu
			item.Icon = &iu
		}
		if tab == "site_area" {
			py := strings.ToLower(r["pinyin"])
			item.Pinyin = &py
			wc := r["weather_code"]
			item.WeatherCode = &wc
		}
		if son {
			children, err := s.getTypeList(ctx, host, tab, item.ID, true, 1, 100000)
			if err != nil {
				return nil, err
			}
			if len(children) == 0 {
				item.Lower = "" // getTypeList 无行时 return ""
			} else {
				item.Lower = children
			}
		} else {
			// 子分类数量不带条件（PHP 原样），只在 >0 时写键。
			var n int
			cq := "SELECT `id` FROM `" + s.prefix + tab + "` WHERE `parentid` = " + strconv.Itoa(item.ID)
			if s.db != nil {
				crows, err := s.db.QueryContext(ctx, cq)
				if err != nil {
					return nil, err
				}
				n = 0
				for crows.Next() {
					n++
				}
				_ = crows.Close()
			}
			if n > 0 {
				item.Lower = n
			}
		}
		items = append(items, item)
	}
	return items, nil
}

// errDBUnavailable 是 DB 未配置时的降级标记：PHP 侧同一输入走 getTypeList catch（101）。
var errDBUnavailable = errors.New("travel: db unavailable")

// typeListAction 是 rentcartype / visatype / strategytype 三个同构 action 的公共实现
// （travel.class.php:250-354）：参数 type/value/page/pageSize/son → getTypeList；
// value=1 时把每行压成 {id, value=typename}；结果为空（getTypeList 返回 ""）→ 102。
func (s *Service) typeListAction(req *ajax.Request, tab string) ajax.Response {
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	typ := phpInt(req.Params.Get("type"))
	value := phpInt(req.Params.Get("value"))
	page := phpInt(req.Params.Get("page"))
	pageSize := phpInt(req.Params.Get("pageSize"))
	son := phpSon(req.Params.Get("son"))

	rows, err := s.getTypeList(ctx, reqHost(req), tab, typ, son, page, pageSize)
	if err != nil {
		// PHP：getTypeList catch 返回 array(state=200, info=...) —— 真值数组。
		// value=0 时原样返回 → getHandle 命中 state==200 → 101 分类获取失败！；
		// value=1 时 foreach 把错误数组当行集遍历，info 文案被字符串下标切成单个字节
		// （非法 UTF-8）→ json_encode 失败 → false。输出段 echo $callback."(".json_encode(...)
		// 把 false 拼成空串 → 有 callback 输出 cb()（4 字节）、无 callback 空 body
		// （HTTP 200，canary 实测一致）。JSONP 包装口径见 ajax.CallbackName。
		if value != 0 {
			body := ""
			if cb := ajax.CallbackName(req.HTTP); cb != "" {
				body = cb + "()"
			}
			return ajax.Response{Raw: &ajax.Raw{Body: body}}
		}
		return ajax.Response{State: stateParamFailed, Info: infoTypeFailed}
	}
	if len(rows) == 0 {
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}
	if value != 0 {
		// PHP: $list[$key]['id'] = $value['id']; $list[$key]['value'] = $value['typename'];
		list := make([]map[string]any, 0, len(rows))
		for _, r := range rows {
			list = append(list, map[string]any{"id": r.ID, "value": r.Typename})
		}
		return ajax.Response{State: ajax.StateOK, Info: list}
	}
	return ajax.Response{State: ajax.StateOK, Info: rows}
}

func (s *Service) rentcartype(req *ajax.Request) ajax.Response {
	return s.typeListAction(req, "travel_rentcartype")
}

func (s *Service) visatype(req *ajax.Request) ajax.Response {
	return s.typeListAction(req, "travel_visatype")
}

func (s *Service) strategytype(req *ajax.Request) ajax.Response {
	return s.typeListAction(req, "travel_strategytype")
}

// reqHost 取请求 Host（fburl 拼绝对地址用）；无 HTTP 上下文（单测直调）为空串。
func reqHost(req *ajax.Request) string {
	if req.HTTP == nil {
		return ""
	}
	return req.HTTP.Host
}

// phpLooseFloat 复刻 PHP 7.4 字符串参与数值比较的语义：取前导数字（含小数/科学计数），
// 无数字为 0。
func phpLooseFloat(raw string) float64 {
	m := leadingNumber.FindString(raw)
	if m == "" {
		return 0
	}
	f, err := strconv.ParseFloat(strings.TrimLeft(m, " \t\n\r\x0B\x0C"), 64)
	if err != nil {
		return 0
	}
	return f
}
