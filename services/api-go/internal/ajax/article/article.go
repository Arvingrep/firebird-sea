// Package article 是 ajax.php 的 article 服务（迁移进行中，总方案见 #298）。
package article

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/url"
	"regexp"
	"strconv"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/fburl"
)

// stateNoData 对应 handlers.class.php:84-87：action 返回「空数组 / false」时
// 外层包装固定为 state=102、info="No data!"。selfmedia_field 查不到行时 PHP
// 返回空数组（空数组在 PHP 里是 falsy），所以走的是这条分支而不是 state=100。
const stateNoData = 102

// infoNoData 是 state=102 时固定的提示文案（handlers.class.php:86）。
const infoNoData = "No data!"

// prefixPattern 约束表前缀：前缀会被拼进 SQL，必须防注入（口径同 fbidentity）。
var prefixPattern = regexp.MustCompile(`^[A-Za-z0-9_]+$`)

// Dep 是 article 服务的依赖。
type Dep struct {
	// DB 是业务连接池。nil 表示「DB_HOST 未配置、本地纯内存模式」，
	// 此时所有 action 按「查不到数据」降级（state=102），不让启动失败。
	DB *sql.DB
	// TablePrefix 是火鸟表前缀，对应 PHP 的 $DB_PREFIX
	// （entrypoint-web.sh: `${DB_PREFIX:-huoniao_}`，两处默认必须一致）。
	TablePrefix string
	// Files 用于 getFilePath / getUrlPath（图片转绝对地址、专题链接）。nil 时图片原样输出、url 为空串。
	Files *fburl.Resolver
	// Members 识别当前会员（selfmedia / selfmediaDetail 的 isfollow / 本人段用）。nil 时一律按未登录（-1）。
	Members MemberResolver
	// CustomDataShare 对应 PHP config/article.inc.php 的 $customDataShare。nil 按 canary 现状取 1（共享，不按城市过滤）；
	// 指向 false 时 selfmedia 走 getCityId 并加 cityid 条件。
	CustomDataShare *bool
	// CookiePrefix 是 PHP $cfg_cookiePre（COOKIE_PREFIX，默认 HN_），用于读 siteCityInfo cookie。空串取 HN_。
	CookiePrefix string
	// SharePic / WebLogo / Hotline 对应 PHP $cfg_sharePic / $cfg_weblogo / $cfg_hotline（article.config 用）。
	// 空串分别回落到 canary 现状值。
	SharePic, WebLogo, Hotline string
}

// Service 是 article 服务的实现。
type Service struct {
	db         *sql.DB
	fieldTable string
	typeTable  string
	files      *fburl.Resolver
	// zhuantiTable 是 #@__article_zhuanti（专题 / 子分类同表，靠 parentid 区分）。
	zhuantiTable string
	// zlListTable / zlNewsTable 是 zhuantiList 用到的关联表（已带前缀）。
	zlListTable, zlNewsTable string
	// sd* 是 selfmediaDetail 用到的表名（已带前缀）。
	sdTable, sdManagerTable, sdNewsTable, sdFollowTable string
	// sm* 是 selfmedia 用到的表名（已带前缀）。
	smTable, smNewsTable, smFollowTable string
	members                             MemberResolver
	dataShare                           bool
	cookiePrefix                        string
	sharePic, webLogo, hotline          string
}

// New 校验依赖并预拼表名（#@__article_selfmedia_field）。
func New(dep Dep) (*Service, error) {
	if !prefixPattern.MatchString(dep.TablePrefix) {
		return nil, fmt.Errorf("article: TablePrefix %q 含非法字符", dep.TablePrefix)
	}
	cookiePrefix := dep.CookiePrefix
	if cookiePrefix == "" {
		cookiePrefix = "HN_"
	}
	return &Service{
		db:             dep.DB,
		fieldTable:     "`" + dep.TablePrefix + "article_selfmedia_field`",
		typeTable:      "`" + dep.TablePrefix + "articletype`",
		zhuantiTable:   "`" + dep.TablePrefix + "article_zhuanti`",
		zlListTable:    "`" + dep.TablePrefix + "article_zhuantilist`",
		zlNewsTable:    "`" + dep.TablePrefix + "articlelist_all`",
		files:          dep.Files,
		sdTable:        "`" + dep.TablePrefix + "article_selfmedia`",
		sdManagerTable: "`" + dep.TablePrefix + "article_selfmedia_manager`",
		sdNewsTable:    "`" + dep.TablePrefix + "articlelist_all`",
		sdFollowTable:  "`" + dep.TablePrefix + "member_follow`",
		smTable:        "`" + dep.TablePrefix + "article_selfmedia`",
		smNewsTable:    "`" + dep.TablePrefix + "articlelist_all`",
		smFollowTable:  "`" + dep.TablePrefix + "member_follow`",
		members:        dep.Members,
		dataShare:      dep.CustomDataShare == nil || *dep.CustomDataShare,
		cookiePrefix:   cookiePrefix,
		sharePic:       orDefault(dep.SharePic, defaultPic),
		webLogo:        orDefault(dep.WebLogo, defaultPic),
		hotline:        orDefault(dep.Hotline, DefaultHotline),
	}, nil
}

// Register 注册本服务的全部 action。
func Register(router *ajax.Router, s *Service) {
	router.Register("article", "selfmedia_field", s.selfmediaField)
	router.Register("article", "type", s.typeList)
	router.Register("article", "zhuantiDetail", s.zhuantiDetail)
	router.Register("article", "zhuantiList", s.zhuantiList)
	router.Register("article", "selfmediaDetail", s.selfmediaDetail)
	router.Register("article", "selfmedia", s.selfmedia)
	router.Register("article", "config", s.config)
}

// fieldItem 是 selfmedia_field 返回的一行。字段顺序与 PHP 数组一致
// （article.class.php:3221-3224）；lower 恒为空数组，是 PHP 写死的占位
// （分级字段在后台单独维护，前台接口从未填充过它）。
type fieldItem struct {
	ID       int    `json:"id"`
	Typename string `json:"typename"`
	Lower    []any  `json:"lower"`
}

// selfmediaField 迁移自 article.class.php:3207-3229：
//
//	$type = (int)$param['type'];                      // 缺参/非数字 → 0
//	SELECT * FROM article_selfmedia_field [WHERE type = $type] ORDER BY weight ASC
//	每行只取 id、typename，lower 固定 []；查不到行 → 空数组 → 外层 102 "No data!"
func (s *Service) selfmediaField(req *ajax.Request) ajax.Response {
	if s.db == nil {
		// 本地纯内存模式没有火鸟库：按「查不到数据」降级，与 PHP 无库时的
		// 可观测行为（dsqlOper 返回 false → 102）一致。
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}

	query := "SELECT `id`, `typename` FROM " + s.fieldTable
	var args []any
	// PHP 的 (int) 是截断转换（"3abc"→3、"3.7"→3、"abc"→0），不是严格解析；
	// type=0 表示「不过滤」，所以这里不能像 Atoi 那样把 "3abc" 当参数错误。
	if t := phpInt(req.Params.Get("type")); t != 0 {
		query += " WHERE `type` = ?"
		args = append(args, t)
	}
	query += " ORDER BY `weight` ASC"

	rows, err := s.db.QueryContext(context.Background(), query, args...)
	if err != nil {
		// PHP 侧查询出错时 dsqlOper 返回 false，可观测结果同样是 102 "No data!"。
		// 这里保持同一口径（查询失败不放大成 5xx，避免前端拿到与 PHP 不同的形状）。
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}
	defer func() { _ = rows.Close() }()

	list := []fieldItem{}
	for rows.Next() {
		var (
			id       int
			typename sql.NullString
		)
		if err := rows.Scan(&id, &typename); err != nil {
			return ajax.Response{State: stateNoData, Info: infoNoData}
		}
		list = append(list, fieldItem{ID: id, Typename: typename.String, Lower: []any{}})
	}
	if err := rows.Err(); err != nil {
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}

	// handlers.class.php:67/84：空返回 → 102 "No data!"；非空且无 state 键 → 100 + 原样数组。
	if len(list) == 0 {
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}
	return ajax.Response{State: ajax.StateOK, Info: list}
}

// phpInt 复刻 PHP `(int)` 对字符串的截断转换：跳过前导空白、可选正负号、
// 取连续数字；没有数字就是 0（"abc"→0、""→0、"3abc"→3、"3.7"→3、" 12"→12）。
func phpInt(raw string) int {
	trimmed := strings.TrimLeft(raw, " \t\n\r\x0B\x0C")
	i, negative := 0, false
	if i < len(trimmed) && (trimmed[i] == '+' || trimmed[i] == '-') {
		negative = trimmed[i] == '-'
		i++
	}
	start := i
	value := 0
	for ; i < len(trimmed) && trimmed[i] >= '0' && trimmed[i] <= '9'; i++ {
		value = value*10 + int(trimmed[i]-'0')
		if value > 1<<31 {
			// PHP 在 64 位机器上溢出会继续累积成大整数，再截断回 int；
			// type 只是过滤参数，远超 int 范围的输入按「无此类型」处理即可。
			value = 1 << 31
			break
		}
	}
	if i == start {
		return 0
	}
	if negative {
		return -value
	}
	return value
}

// stateParamError 是「参数错误」：PHP action 返回 state=200，外层
// handlers::getHandle 统一改写成 101。
const stateParamError = 101

// orderedRow 是按列顺序输出的一行（PHP `SELECT *` 的关联数组顺序 = 表列顺序，
// Go 的 map 会按键排序，所以必须自己保序）。值全部是 string：PDO FETCH_ASSOC
// 默认把所有列都当字符串返回，PHP 没有做 (int) 转换。
type orderedRow struct {
	keys []string
	vals []string
}

func (r orderedRow) MarshalJSON() ([]byte, error) {
	return marshalPairs(r.keys, func(i int) any { return r.vals[i] })
}

func marshalPairs(keys []string, val func(i int) any) ([]byte, error) {
	var b strings.Builder
	b.WriteByte('{')
	for i, k := range keys {
		if i > 0 {
			b.WriteByte(',')
		}
		kb, _ := json.Marshal(k)
		vb, err := json.Marshal(val(i))
		if err != nil {
			return nil, err
		}
		b.Write(kb)
		b.WriteByte(':')
		b.Write(vb)
	}
	b.WriteByte('}')
	return []byte(b.String()), nil
}

// queryRows 执行 SELECT * 并把每行保序读成字符串。
func (s *Service) queryRows(query string, args ...any) ([]orderedRow, bool) {
	rows, err := s.db.QueryContext(context.Background(), query, args...)
	if err != nil {
		return nil, false
	}
	defer func() { _ = rows.Close() }()
	cols, err := rows.Columns()
	if err != nil {
		return nil, false
	}
	out := []orderedRow{}
	for rows.Next() {
		raw := make([]sql.NullString, len(cols))
		dest := make([]any, len(cols))
		for i := range raw {
			dest[i] = &raw[i]
		}
		if err := rows.Scan(dest...); err != nil {
			return nil, false
		}
		vals := make([]string, len(cols))
		for i := range raw {
			vals[i] = raw[i].String
		}
		out = append(out, orderedRow{keys: cols, vals: vals})
	}
	if rows.Err() != nil {
		return nil, false
	}
	return out, true
}

// zhuantiInfo 是 zhuantiDetail 的 info。字段顺序与 PHP $detail 一致
// （article.class.php:4361-4393）；litpic / banner_* / url 已由 fburl 解析。
type zhuantiInfo struct {
	main orderedRow
	// lower 正常是 []orderedRow；子分类查询异常时是 PHP dsqlOper 的失败字符串。
	lower any
	// litpic、bannerLarge、bannerSmall、url 是 getFilePath / getUrlPath 的结果。
	litpic, bannerLarge, bannerSmall, url string
}

func (z zhuantiInfo) MarshalJSON() ([]byte, error) {
	get := func(k string) string {
		for i, c := range z.main.keys {
			if c == k {
				return z.main.vals[i]
			}
		}
		return ""
	}
	keys := []string{"id", "typename", "description", "pubdate", "litpic", "banner_large", "banner_small", "url", "lower"}
	return marshalPairs(keys, func(i int) any {
		switch keys[i] {
		case "litpic":
			return z.litpic
		case "banner_large":
			return z.bannerLarge
		case "banner_small":
			return z.bannerSmall
		case "url":
			return z.url
		case "lower":
			return z.lower
		}
		return get(keys[i])
	})
}

// resolveZhuanti 填充 litpic / banner_* / url。s.files 为 nil（本地纯内存模式）时
// 图片原样输出、url 为空。
func (s *Service) resolveZhuanti(ctx context.Context, host string, id int, z *zhuantiInfo) error {
	get := func(k string) string {
		for i, c := range z.main.keys {
			if c == k {
				return z.main.vals[i]
			}
		}
		return ""
	}
	z.litpic, z.bannerLarge, z.bannerSmall = get("litpic"), get("banner_large"), get("banner_small")
	if s.files == nil {
		return nil
	}
	o := fburl.Options{Host: host}
	var err error
	for _, p := range []*string{&z.litpic, &z.bannerLarge, &z.bannerSmall} {
		if *p, err = s.files.File(ctx, *p, o); err != nil {
			return err
		}
	}
	z.url, err = s.files.URL(ctx, fburl.Params{
		{Key: "service", Value: "article"},
		{Key: "template", Value: "zt_detail"},
		{Key: "id", Value: strconv.Itoa(id)},
	}, o)
	return err
}

// zhuantiDetail 迁移自 article.class.php:4361-4393：
//
//	$id = (int)$param['id']; empty → 参数错误
//	SELECT * FROM article_zhuanti WHERE id=$id AND state=1 AND parentid=0
//	无行 → 102；有行 → lower = SELECT * ... WHERE parentid=$id AND state=1 ORDER BY weight DESC（整行原样）
//
// dsqlFailure 是 dsqlOper 异常返回值（$cfg_siteDebug 关闭时）。
const dsqlFailure = `{"state": 200, "info": "操作失败！"}`

// normalizeIDParam 复刻 ajax.php 对 id 调用的 convertArrToStrWithComma($value)
// （common.inc.php:1793，$int=true）。PHP 里 id=… 与 id[]=… 是同一个键 id，
// 这里两种键都读（mergeParams 保证同名只留后来源的一种）。
func normalizeIDParam(params url.Values) string {
	if arr, ok := params["id[]"]; ok && len(arr) > 0 {
		out := make([]string, len(arr))
		for i, v := range arr {
			out[i] = strconv.Itoa(phpInt(v))
		}
		return strings.Join(out, ",")
	}
	raw := params.Get("id")
	if raw == "" || strings.Contains(raw, "Placeholder") {
		return ""
	}
	if strings.Contains(raw, ",") {
		parts := strings.Split(raw, ",")
		for i, v := range parts {
			parts[i] = strconv.Itoa(phpInt(v))
		}
		return strings.Join(parts, ",")
	}
	if n := phpInt(raw); n != 0 {
		return strconv.Itoa(n)
	}
	return ""
}

func (s *Service) zhuantiDetail(req *ajax.Request) ajax.Response {
	// ajax.php 先用 convertArrToStrWithComma 把 id 归一为逗号串，再 (int) 截断；
	// phpInt("5,6") == 5。
	id := phpInt(normalizeIDParam(req.Params))
	if id == 0 {
		return ajax.Response{State: stateParamError, Info: "参数错误"}
	}
	if s.db == nil {
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}
	mains, ok := s.queryRows("SELECT * FROM "+s.zhuantiTable+" WHERE `id` = ? AND `state` = 1 AND `parentid` = 0", id)
	if !ok || len(mains) == 0 {
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}
	lower, ok := s.queryRows("SELECT * FROM "+s.zhuantiTable+" WHERE `parentid` = ? AND `state` = 1 ORDER BY `weight` DESC", id)
	var lowerVal any = lower
	if !ok {
		// dsql.class.php:1156：dsqlOper 异常时返回的是 JSON 字符串（非 false；
		// $cfg_siteDebug 关闭时为下面这个固定串），article.class.php:4384 原样放进 lower，
		// 主详情保留，外层仍是 100。
		lowerVal = dsqlFailure
	}
	info := zhuantiInfo{main: mains[0], lower: lowerVal}
	host := ""
	if req.HTTP != nil {
		host = req.HTTP.Host
	}
	if err := s.resolveZhuanti(context.Background(), host, id, &info); err != nil {
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}
	return ajax.Response{State: ajax.StateOK, Info: info}
}

// defaultPic 是 canary 现状的 $cfg_sharePic / $cfg_weblogo。
const defaultPic = "https://storage.googleapis.com/fbird-sea-uploads/siteConfig/logo/fbird_logo.png"

func orDefault(v, d string) string {
	if v == "" {
		return d
	}
	return v
}
