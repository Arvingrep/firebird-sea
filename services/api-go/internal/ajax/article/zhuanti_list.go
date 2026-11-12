package article

import (
	"context"
	"database/sql"
	"fmt"
	"math"
	"regexp"
	"strconv"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/fburl"
)

// zhuantiList 的「暂无数据」：action 返回 state=200，外层 handlers.class.php:60 改写成 101，info 原样。
const (
	stateZhuantiEmpty = 101
	infoZhuantiEmpty  = "暂无数据"
	// stateZhuantiFailed 是 Go 侧基础设施错误（fburl 解析失败），PHP 无对应分支。
	stateZhuantiFailed = 101
	infoZhuantiFailed  = "获取失败"
)

// zlMaxPage 对应 ajax.php 对 page/pageSize 的 50000 封顶。
const zlMaxPage = 50000

// phpCeilFloat 是 PHP ceil() 的结果：float，json_encode 对整数值输出 "N.0"。
type phpCeilFloat float64

func (f phpCeilFloat) MarshalJSON() ([]byte, error) {
	v := float64(f)
	if v == math.Trunc(v) && math.Abs(v) < 1e15 {
		return []byte(strconv.FormatFloat(v, 'f', 1, 64)), nil
	}
	return []byte(strconv.FormatFloat(v, 'g', -1, 64)), nil
}

type zlPageInfo struct {
	Page       int          `json:"page"`
	PageSize   int          `json:"pageSize"`
	TotalPage  phpCeilFloat `json:"totalPage"`
	TotalCount string       `json:"totalCount"`
}

type zlNewsItem struct {
	ID       *string `json:"id"`
	Typename *string `json:"typename"`
	Title    *string `json:"title"`
	Source   *string `json:"source"`
	Litpic   string  `json:"litpic"`
	URL      string  `json:"url"`
}

type zlNews struct {
	PageInfo zlPageInfo   `json:"pageInfo"`
	List     []zlNewsItem `json:"list"`
}

type zlNewsEmpty struct {
	List []zlNewsItem `json:"list"`
}

type zlLower struct {
	ID       *string `json:"id"`
	Typename *string `json:"typename"`
}

// zlItem 字段顺序与 PHP $list[$key] 一致（article.class.php:4326-4358）。
// id/typename/description/pubdate 是 PDO 原值（字符串或 NULL）。
type zlItem struct {
	ID          *string `json:"id"`
	Typename    *string `json:"typename"`
	Description *string `json:"description"`
	Pubdate     *string `json:"pubdate"`
	Click       *string `json:"click"`
	FlagR       int     `json:"flag_r"`
	FlagH       int     `json:"flag_h"`
	Litpic      string  `json:"litpic"`
	BannerLarge string  `json:"banner_large"`
	BannerSmall string  `json:"banner_small"`
	URL         string  `json:"url"`
	List        any     `json:"list,omitempty"`
	// Lower 只在 get_lower 时输出（PHP 只在该分支写键）；指向空切片时输出 []。
	Lower *[]zlLower `json:"lower,omitempty"`
}

type zlResult struct {
	PageInfo zlPageInfo `json:"pageInfo"`
	List     []zlItem   `json:"list"`
}

var zlIntLiteral = regexp.MustCompile(`^[ \t\n\r\x0B\x0C]*[+-]?[0-9]+[ \t\n\r\x0B\x0C]*$`)

// zlFlagFilter 复刻 `if($r){ (int)$r ? " AND flag_r = $r" : " AND flag_r > 0" }`。
// 返回 where 片段、参数、以及「拼进 SQL 后会报错/无匹配」标志（→ 暂无数据）。
// ajax.php 会把 "undefined" 改成 ""，PHP 真值判断排除 "" 与 "0"。
func zlFlagFilter(col, raw string) (frag string, args []any, empty bool) {
	if raw == "undefined" || raw == "" || raw == "0" {
		return "", nil, false
	}
	n := phpInt(raw)
	if n == 0 {
		return " AND `" + col + "` > 0", nil, false
	}
	if !zlIntLiteral.MatchString(raw) {
		// 如 "1abc" 拼进 SQL 是语法错误，"1.5" 对整型列恒不匹配：PHP 都表现为 0 行。
		return "", nil, true
	}
	return " AND `" + col + "` = ?", []any{n}, false
}

// zlPageParam 复刻 ajax.php 对 page/pageSize 的归一（GET 与 POST 规则不同，POST 覆盖 GET）：
// GET：(int)，<=0 取默认，>50000 取 50000；POST：只有 (int) 与封顶。
// 之后 action 内的 empty() 把 0 再落到默认值。
func zlPageParam(req *ajax.Request, key string, def int) int {
	if !req.Params.Has(key) {
		return def
	}
	v := phpInt(req.Params.Get(key))
	fromPost := req.HTTP != nil && req.HTTP.PostForm != nil && req.HTTP.PostForm.Has(key)
	if !fromPost && v <= 0 {
		v = def
	}
	if v > zlMaxPage {
		v = zlMaxPage
	}
	if v == 0 {
		v = def
	}
	return v
}

// zhuantiList 迁移自 article.class.php:4272-4360，规则见 issue #243 评论。
func (s *Service) zhuantiList(req *ajax.Request) ajax.Response {
	empty := ajax.Response{State: stateZhuantiEmpty, Info: infoZhuantiEmpty}
	if s.db == nil {
		return empty
	}
	ctx := context.Background()
	if req.HTTP != nil && req.HTTP.Context() != nil {
		ctx = req.HTTP.Context()
	}
	host := ""
	if req.HTTP != nil {
		host = req.HTTP.Host
	}
	q := req.Params
	getNews := phpInt(q.Get("get_news")) != 0
	getLower := phpInt(q.Get("get_lower")) != 0
	thumb := phpInt(q.Get("thumb")) != 0
	typeid := phpInt(q.Get("typeid"))
	page := zlPageParam(req, "page", 1)
	pageSize := zlPageParam(req, "pageSize", 10)

	where := ""
	var args []any
	if typeid != 0 {
		where += " AND `typeid` = ?"
		args = append(args, typeid)
	}
	for _, f := range []struct{ col, key string }{{"flag_r", "r"}, {"flag_h", "h"}} {
		frag, a, bad := zlFlagFilter(f.col, q.Get(f.key))
		if bad {
			return empty
		}
		where += frag
		args = append(args, a...)
	}

	var total int64
	cq := "SELECT COUNT(`id`) c FROM " + s.zlTable + " WHERE `state` = 1 AND `parentid` = 0" + where
	if err := s.db.QueryRowContext(ctx, cq, args...).Scan(&total); err != nil || total == 0 {
		return empty
	}
	info := zlPageInfo{
		Page:       page,
		PageSize:   pageSize,
		TotalPage:  phpCeilFloat(math.Ceil(float64(total) / float64(pageSize))),
		TotalCount: strconv.FormatInt(total, 10),
	}

	order := " ORDER BY `weight` DESC, `id` DESC"
	switch q.Get("orderby") {
	case "time":
		order = " ORDER BY `pubdate` DESC, `id` DESC"
	case "click":
		order = " ORDER BY `click` DESC, `pubdate` DESC"
	}
	offset := int64(page-1) * int64(pageSize)
	lq := "SELECT `id`, `typename`, `description`, `pubdate`, `click`, `flag_r`, `flag_h`, `litpic`, `banner_large`, `banner_small` FROM " +
		s.zlTable + " WHERE `state` = 1 AND `parentid` = 0" + where + order + fmt.Sprintf(" LIMIT %d, %d", offset, pageSize)
	rows, ok := s.zlQuery(ctx, lq, 10, args...)
	list := []zlItem{}
	if ok { // 查询失败（如 POST 负数 LIMIT）→ PHP results 为空 → list: []
		for _, r := range rows {
			item := zlItem{
				ID: r[0], Typename: r[1], Description: r[2], Pubdate: r[3],
				Click: zlClick(r[4]), FlagR: phpInt(zlStr(r[5])), FlagH: phpInt(zlStr(r[6])),
			}
			var err error
			if item.Litpic, err = s.zlFile(ctx, host, zlStr(r[7])); err != nil {
				return ajax.Response{State: stateZhuantiFailed, Info: infoZhuantiFailed}
			}
			if item.BannerLarge, err = s.zlFile(ctx, host, zlStr(r[8])); err != nil {
				return ajax.Response{State: stateZhuantiFailed, Info: infoZhuantiFailed}
			}
			if item.BannerSmall, err = s.zlFile(ctx, host, zlStr(r[9])); err != nil {
				return ajax.Response{State: stateZhuantiFailed, Info: infoZhuantiFailed}
			}
			id := zlStr(r[0])
			if item.URL, err = s.zlURL(ctx, host, fburl.Params{{Key: "service", Value: "article"}, {Key: "template", Value: "zt_detail"}, {Key: "id", Value: id}}); err != nil {
				return ajax.Response{State: stateZhuantiFailed, Info: infoZhuantiFailed}
			}
			zid := phpInt(id)
			if getNews {
				news, err := s.zlNews(ctx, host, zid, thumb)
				if err != nil {
					return ajax.Response{State: stateZhuantiFailed, Info: infoZhuantiFailed}
				}
				item.List = news
			}
			if getLower {
				lower := []zlLower{}
				item.Lower = &lower
				lr, _ := s.zlQuery(ctx, "SELECT `id`, `typename` FROM "+s.zlTable+" WHERE `parentid` = ?", 2, zid)
				for _, x := range lr {
					lower = append(lower, zlLower{ID: x[0], Typename: x[1]})
				}
			}
			list = append(list, item)
		}
	}
	return ajax.Response{State: ajax.StateOK, Info: zlResult{PageInfo: info, List: list}}
}

// zlNews 复刻 zhuantiNews（param 被 zhuantiList 整体替换：page=1、pageSize=10、orderby=0）。
// 无数据（state=200）时 zhuantiList 把它换成 {list: []}。
func (s *Service) zlNews(ctx context.Context, host string, zhuanti int, thumb bool) (any, error) {
	emptyNews := zlNewsEmpty{List: []zlNewsItem{}}
	ids := s.zlDescendants(ctx, zhuanti)
	where := " z.`state` = 1 AND a.`arcrank` = 1 AND a.`media_state` = 1 AND a.`del` = 0 AND l.`typeid` IN (" +
		strings.TrimSuffix(strings.Repeat("?,", len(ids)), ",") + ")"
	args := make([]any, len(ids))
	for i, id := range ids {
		args[i] = id
	}
	if thumb {
		where += " AND a.`litpic` <> ''"
	}
	from := " FROM " + s.zlListTable + " l LEFT JOIN " + s.zlTable + " z ON z.`id` = l.`typeid` LEFT JOIN " + s.zlNewsTable + " a ON a.`id` = l.`aid` WHERE " + where
	var total int64
	if err := s.db.QueryRowContext(ctx, "SELECT COUNT(l.`id`) c"+from, args...).Scan(&total); err != nil || total == 0 {
		return emptyNews, nil
	}
	const pageSize = 10
	info := zlPageInfo{Page: 1, PageSize: pageSize, TotalPage: phpCeilFloat(math.Ceil(float64(total) / pageSize)), TotalCount: strconv.FormatInt(total, 10)}
	rows, ok := s.zlQuery(ctx, "SELECT z.`typename`, a.`id` aid, a.`title`, a.`litpic`, a.`flag`, a.`redirecturl`, a.`typeid` atypeid, a.`source`"+
		from+" ORDER BY a.`weight` DESC, a.`id` DESC LIMIT 0, 10", 8, args...)
	list := []zlNewsItem{}
	if ok {
		for _, r := range rows {
			u, err := s.zlURL(ctx, host, fburl.Params{
				{Key: "service", Value: "article"}, {Key: "template", Value: "detail"}, {Key: "id", Value: zlStr(r[1])},
				{Key: "flag", Value: zlStr(r[4])}, {Key: "redirecturl", Value: zlStr(r[5])}, {Key: "typeid", Value: zlStr(r[6])},
			})
			if err != nil {
				return nil, err
			}
			pic, err := s.zlFile(ctx, host, zlStr(r[3]))
			if err != nil {
				return nil, err
			}
			list = append(list, zlNewsItem{ID: r[1], Typename: r[0], Title: r[2], Source: r[7], Litpic: pic, URL: u})
		}
	}
	return zlNews{PageInfo: info, List: list}, nil
}

// zlDescendants 复刻 `getTypeList($id,"article_zhuanti")` + arr_foreach：本专题 + 全部后代 id
// （按 parentid 递归，不过滤 state；visited 防环）。查询失败当作无子类。
func (s *Service) zlDescendants(ctx context.Context, root int) []int {
	ids := []int{root}
	seen := map[int]bool{root: true}
	frontier := []int{root}
	for len(frontier) > 0 {
		args := make([]any, len(frontier))
		for i, id := range frontier {
			args[i] = id
		}
		rows, ok := s.zlQuery(ctx, "SELECT `id` FROM "+s.zlTable+" WHERE `parentid` IN ("+
			strings.TrimSuffix(strings.Repeat("?,", len(frontier)), ",")+")", 1, args...)
		if !ok {
			break
		}
		frontier = nil
		for _, r := range rows {
			if id := phpInt(zlStr(r[0])); id != 0 && !seen[id] {
				seen[id] = true
				ids = append(ids, id)
				frontier = append(frontier, id)
			}
		}
	}
	return ids
}

// zlQuery 执行查询并把 n 列都读成可空字符串（等价 PDO 字符串结果）。ok=false 表示查询失败。
func (s *Service) zlQuery(ctx context.Context, query string, n int, args ...any) ([][]*string, bool) {
	rs, err := s.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, false
	}
	defer func() { _ = rs.Close() }()
	var out [][]*string
	for rs.Next() {
		vals := make([]sql.NullString, n)
		dest := make([]any, n)
		for i := range vals {
			dest[i] = &vals[i]
		}
		if err := rs.Scan(dest...); err != nil {
			return nil, false
		}
		row := make([]*string, n)
		for i := range vals {
			if vals[i].Valid {
				v := vals[i].String
				row[i] = &v
			}
		}
		out = append(out, row)
	}
	if rs.Err() != nil {
		return nil, false
	}
	return out, true
}

func zlStr(p *string) string {
	if p == nil {
		return ""
	}
	return *p
}

// zlClick 复刻 `$click >= 10000 ? sprintf("%.1f", $click/10000)."万" : $click`。
func zlClick(p *string) *string {
	if p == nil {
		return nil
	}
	if f, err := strconv.ParseFloat(*p, 64); err == nil && f >= 10000 {
		v := strconv.FormatFloat(f/10000, 'f', 1, 64) + "万"
		return &v
	}
	return p
}

func (s *Service) zlFile(ctx context.Context, host, path string) (string, error) {
	if s.files == nil {
		return path, nil
	}
	return s.files.File(ctx, path, fburl.Options{Host: host})
}

func (s *Service) zlURL(ctx context.Context, host string, p fburl.Params) (string, error) {
	if s.files == nil {
		return "", nil
	}
	return s.files.URL(ctx, p, fburl.Options{Host: host})
}
