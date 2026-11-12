package article

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"math"
	"net/url"
	"regexp"
	"strconv"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/fburl"
)

// selfmedia 的「暂无数据」：action 返回 {state:200, info:"暂无数据"}，
// 外层 handlers.class.php 改写成 state=101、info 原样（与 #243 zhuantiList 同口径）。
const (
	stateSelfmediaEmpty = 101
	infoSelfmediaEmpty  = "暂无数据"
)

// smMaxPage 对应 ajax.php 对 page/pageSize 的 50000 封顶。
const smMaxPage = 50000

// smAnonymous 与 userLogin::getMemberID() 未登录时的 -1 一致。
const smAnonymous int64 = -1

// selfmediaTypes 是 selfmedia_type(true) 的 id→名称映射（article.class.php:3143-3160）。
// PHP 按数组键取值，"1".."5" 之外（含 NULL、"01"）取不到 → null。
var selfmediaTypes = map[string]string{
	"1": "个人/自媒体",
	"2": "媒体",
	"3": "企业",
	"4": "政府",
	"5": "其他组织",
}

// smNumeric 是 PHP 8 的数字字符串（允许前后空白、小数、指数；不含十六进制）。
// 这类 from 拼进 SQL 是合法数值比较；其余取值拼进 SQL 会报错（或被当作列名）。
var smNumeric = regexp.MustCompile(`^[ \t\n\r\x0B\x0C]*[+-]?([0-9]+(\.[0-9]*)?|\.[0-9]+)([eE][+-]?[0-9]+)?[ \t\n\r\x0B\x0C]*$`)

// smDsqlFailure 是 dsqlOper 查询异常时的返回值（$cfg_siteDebug 关闭时，同 #239）。
// 它是非空字符串：PHP 里为真值，被 getCache 的 name 取值原样透传。
const smDsqlFailure = `{"state": 200, "info": "操作失败！"}`

// smCeilFloat 是 PHP ceil() 的结果。canary 的 json_encode 对整数值输出 "1"（不是 "1.0"，
// 实测 totalPage:1），这里按同样字节输出；-0（POST 负 pageSize）输出 "-0"。
type smCeilFloat float64

func (f smCeilFloat) MarshalJSON() ([]byte, error) {
	v := float64(f)
	if v == math.Trunc(v) && math.Abs(v) < 1e15 {
		return []byte(strconv.FormatFloat(v, 'f', -1, 64)), nil
	}
	return []byte(strconv.FormatFloat(v, 'g', -1, 64)), nil
}

type smPageInfo struct {
	Page       int         `json:"page"`
	PageSize   int         `json:"pageSize"`
	TotalPage  smCeilFloat `json:"totalPage"`
	TotalCount string      `json:"totalCount"`
}

// smItem 字段顺序与 PHP $list[$key] 一致（article.class.php:3797-3843）。
// id/typeid/name/profile/field/pubdate 是 PDO 原值（字符串或 NULL）。
type smItem struct {
	ID           *string `json:"id"`
	Typeid       *string `json:"typeid"`
	Type         *string `json:"type"`
	Name         *string `json:"name"`
	Profile      *string `json:"profile"`
	Field        *string `json:"field"`
	Photo        string  `json:"photo"`
	Pubdate      *string `json:"pubdate"`
	TotalArticle int     `json:"total_article"`
	Click        int     `json:"click"`
	// TotalFans 没有 (int) 转型：正常是 COUNT 的字符串；查询失败时是 dsql 失败串。
	TotalFans string `json:"total_fans"`
	URL       string `json:"url"`
	IsFollow  int    `json:"isfollow"`
}

type smResult struct {
	PageInfo smPageInfo `json:"pageInfo"`
	List     []smItem   `json:"list"`
}

// smParam 取经 ajax.php 归一后的普通参数：值为 "undefined" 时 ajax.php 改写成 ""。
func smParam(req *ajax.Request, key string) string {
	v := req.Params.Get(key)
	if v == "undefined" {
		return ""
	}
	return v
}

// smPHPTruthy 复刻 PHP 对字符串的真值判断："" 与 "0" 为假。
func smPHPTruthy(v string) bool { return v != "" && v != "0" }

// smPageParam 复刻 ajax.php 对 page/pageSize 的归一（POST 覆盖 GET）：
// GET：(int)，<=0 取默认，>50000 取 50000；POST：只有 (int) 与封顶。
// 之后 action 内的 empty() 再把 0 落到默认值，所以 POST 负数会原样留下。
func smPageParam(req *ajax.Request, key string, def int) int {
	if !req.Params.Has(key) {
		return def
	}
	v := phpInt(req.Params.Get(key))
	fromPost := req.HTTP != nil && req.HTTP.PostForm != nil && req.HTTP.PostForm.Has(key)
	if !fromPost && v <= 0 {
		v = def
	}
	if v > smMaxPage {
		v = smMaxPage
	}
	if v == 0 {
		v = def
	}
	return v
}

// smLogin 是 loginUid 的解析结果。
type smLogin struct {
	kind int
	uid  float64 // kind==smLoginNum 时有效
}

const (
	smLoginAnon = iota // getMemberID() 未登录（-1）
	smLoginNum         // 数值：会员 ID，或数字字符串形式的 from
	smLoginRaw         // 非数字的 from：拼进 SQL 会报错
)

// resolveLogin 复刻 `$loginUid = $param['from'] ? $param['from'] : $userLogin->getMemberID()`。
// from 非空即当作 loginUid（issue #244 Q1：按现状零差异复刻，任何调用方可指定视角）。
func (s *Service) resolveLogin(req *ajax.Request) smLogin {
	if from := smParam(req, "from"); smPHPTruthy(from) {
		if !smNumeric.MatchString(from) {
			return smLogin{kind: smLoginRaw}
		}
		n, err := strconv.ParseFloat(strings.Trim(from, " \t\n\r\x0B\x0C"), 64)
		if err != nil {
			return smLogin{kind: smLoginRaw}
		}
		return smLogin{kind: smLoginNum, uid: n}
	}
	if s.members == nil || req.HTTP == nil {
		return smLogin{kind: smLoginAnon}
	}
	uid, err := s.members.MemberID(req.HTTP.Context(), req.HTTP)
	if err != nil || uid <= smAnonymous {
		// 会员库故障：只影响 isfollow 展示，按未登录处理，不让列表整体失败。
		return smLogin{kind: smLoginAnon}
	}
	return smLogin{kind: smLoginNum, uid: float64(uid)}
}

// smCityID 复刻 getCityId($param['cityid'])（common.func.php:11949）：
// cityid 参数非空（PHP empty：""/"0" 为空）直接 (int) 取用；否则读 siteCityInfo cookie
// （先 siteCityInfo_iOS_APP，再 siteCityInfo），JSON 对象里的 cityid 转 int。
// 没有 cookie 时 PHP 会回环 curl 取分站，这里不复刻，按 0（不过滤）处理。
func (s *Service) smCityID(req *ajax.Request) int {
	if c := smParam(req, "cityid"); smPHPTruthy(c) {
		return phpInt(c)
	}
	if req.HTTP == nil {
		return 0
	}
	var raw string
	for _, name := range []string{"siteCityInfo_iOS_APP", "siteCityInfo"} {
		if c, err := req.HTTP.Cookie(s.cookiePrefix + name); err == nil && c.Value != "" {
			raw = c.Value
			break
		}
	}
	if raw == "" {
		return 0
	}
	if u, err := url.QueryUnescape(raw); err == nil {
		raw = u
	}
	var info map[string]any
	if json.Unmarshal([]byte(raw), &info) != nil {
		return 0
	}
	switch v := info["cityid"].(type) {
	case float64:
		return int(v)
	case string:
		return phpInt(v)
	case bool:
		if v {
			return 1
		}
	}
	return 0
}

// selfmedia 迁移自 article.class.php:3722-3850，规则见 issue #244「业务规则」评论。
//
//	COUNT(state=1 + 筛选) == 0 → 101 暂无数据
//	否则 → 100 {pageInfo, list}；越界页 list 为 []，pageInfo 照算
func (s *Service) selfmedia(req *ajax.Request) ajax.Response {
	empty := ajax.Response{State: stateSelfmediaEmpty, Info: infoSelfmediaEmpty}
	if s.db == nil {
		return empty
	}
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}

	page := smPageParam(req, "page", 1)
	pageSize := smPageParam(req, "pageSize", 10)

	where := " WHERE `state` = 1"
	var args []any
	// customDataShare=1（canary 现状）不拼 cityid；=0 时按 getCityId 的结果过滤，结果为 0 则不加条件。
	if !s.dataShare {
		if cityid := s.smCityID(req); cityid != 0 {
			where += " AND `cityid` = ?"
			args = append(args, cityid)
		}
	}
	if t := phpInt(smParam(req, "type")); t != 0 {
		where += " AND `type` = ?"
		args = append(args, t)
	}
	if f := phpInt(smParam(req, "ac_field")); f != 0 {
		where += " AND `ac_field` = ?"
		args = append(args, f)
	}
	if title := smParam(req, "title"); smPHPTruthy(title) {
		// PHP 直接拼进 LIKE '%$title%'（ajax.php 已 addslashes）；这里参数化，% 与 _ 仍是通配符。
		like := "%" + title + "%"
		where += " AND (`ac_name` LIKE ? OR `ac_profile` LIKE ? OR `ac_field` LIKE ?)"
		args = append(args, like, like, like)
	}

	var total sql.NullString
	if err := s.db.QueryRowContext(ctx, "SELECT COUNT(`id`) total FROM "+s.smTable+where, args...).Scan(&total); err != nil {
		// PHP：查询失败 → $res 为 false → totalCount 为 null，== 0 成立 → 暂无数据。
		return empty
	}
	totalCount, _ := strconv.ParseInt(total.String, 10, 64)
	if totalCount == 0 {
		return empty
	}

	result := smResult{
		PageInfo: smPageInfo{
			Page:       page,
			PageSize:   pageSize,
			TotalPage:  smCeilFloat(math.Ceil(float64(totalCount) / float64(pageSize))),
			TotalCount: total.String,
		},
		List: []smItem{},
	}

	order := " ORDER BY `weight` DESC, `id` DESC"
	if smParam(req, "orderby") == "time" {
		order = " ORDER BY `pubdate` DESC"
	}
	// POST 通道 page/pageSize 可为负：PHP 拼出的 LIMIT 是语法错误 → 结果为空，list 仍是 []。
	if page < 1 || pageSize < 1 {
		return ajax.Response{State: ajax.StateOK, Info: result}
	}
	offset := int64(pageSize) * int64(page-1)
	listQuery := "SELECT `id`, `userid`, `type`, `ac_name`, `ac_profile`, `ac_field`, `ac_photo`, `pubdate` FROM " +
		s.smTable + where + order + " LIMIT " + strconv.FormatInt(offset, 10) + ", " + strconv.Itoa(pageSize)

	type smRow struct {
		id, userid, typ, name, profile, field, photo, pubdate sql.NullString
	}
	rows, err := s.db.QueryContext(ctx, listQuery, args...)
	if err != nil {
		// PHP：getCache 拿到 false → 跳过组装，照常返回 pageInfo + 空 list。
		return ajax.Response{State: ajax.StateOK, Info: result}
	}
	var raw []smRow
	for rows.Next() {
		var r smRow
		if err := rows.Scan(&r.id, &r.userid, &r.typ, &r.name, &r.profile, &r.field, &r.photo, &r.pubdate); err != nil {
			_ = rows.Close()
			return ajax.Response{State: ajax.StateOK, Info: result}
		}
		raw = append(raw, r)
	}
	rowsErr := rows.Err()
	_ = rows.Close()
	if rowsErr != nil {
		return ajax.Response{State: ajax.StateOK, Info: result}
	}

	host := ""
	if req.HTTP != nil {
		host = req.HTTP.Host
	}
	login := s.resolveLogin(req)
	for _, r := range raw {
		item := smItem{
			ID:        nullable(r.id),
			Typeid:    nullable(r.typ),
			Name:      nullable(r.name),
			Profile:   nullable(r.profile),
			Field:     nullable(r.field),
			Pubdate:   nullable(r.pubdate),
			TotalFans: smDsqlFailure,
		}
		// photo：ac_photo 有值才 getFilePath()（File 对空/"0" 返回 ""）；
		// url：getUrlPath({service:article, template:mddetail, id})，规则见 #244 业务规则评论。
		var err error
		if item.Photo, err = s.zlFile(ctx, host, r.photo.String); err != nil {
			return ajax.Response{State: stateZhuantiFailed, Info: infoZhuantiFailed}
		}
		if item.URL, err = s.zlURL(ctx, host, fburl.Params{
			{Key: "service", Value: "article"}, {Key: "template", Value: "mddetail"}, {Key: "id", Value: r.id.String},
		}); err != nil {
			return ajax.Response{State: stateZhuantiFailed, Info: infoZhuantiFailed}
		}
		if r.typ.Valid {
			if name, ok := selfmediaTypes[r.typ.String]; ok {
				item.Type = &name
			}
		}

		// userid 是会员 ID 列（整型）；拿不到整数时 PHP 拼出的 SQL 报错，统计按失败处理。
		userid, uidErr := strconv.ParseInt(r.userid.String, 10, 64)
		if r.userid.Valid && uidErr == nil {
			item.TotalArticle, item.Click, item.TotalFans = s.selfmediaStats(ctx, userid)
		}
		item.IsFollow = s.selfmediaIsFollow(ctx, login, userid, r.userid.Valid && uidErr == nil)
		result.List = append(result.List, item)
	}
	return ajax.Response{State: ajax.StateOK, Info: result}
}

// selfmediaStats 返回 total_article、click、total_fans。
// 与 PHP 一致：前两者 (int) 转型（NULL/失败串 → 0）；total_fans 是 COUNT 原值字符串，失败为 dsql 失败串。
func (s *Service) selfmediaStats(ctx context.Context, userid int64) (int, int, string) {
	const cond = " WHERE `admin` = ? AND `arcrank` = 1 AND `waitpay` = 0 AND `del` = 0"
	var articles, clicks sql.NullString
	if err := s.db.QueryRowContext(ctx, "SELECT COUNT(`id`) c FROM "+s.smNewsTable+cond, userid).Scan(&articles); err != nil {
		articles = sql.NullString{}
	}
	if err := s.db.QueryRowContext(ctx, "SELECT SUM(`click`) c FROM "+s.smNewsTable+cond, userid).Scan(&clicks); err != nil {
		clicks = sql.NullString{}
	}
	fans := smDsqlFailure
	var fansCount sql.NullString
	if err := s.db.QueryRowContext(ctx, "SELECT COUNT(`id`) c FROM "+s.smFollowTable+" WHERE `fid` = ?", userid).Scan(&fansCount); err == nil {
		fans = fansCount.String
	}
	return smInt(articles.String), smInt(clicks.String), fans
}

// smInt 是 (int) 对 COUNT/SUM 结果的转型：NULL / 非整数 → 0（SUM 不受 phpInt 的 2^31 截断）。
func smInt(v string) int {
	n, err := strconv.ParseInt(v, 10, 64)
	if err != nil {
		return phpInt(v)
	}
	return int(n)
}

// selfmediaIsFollow 复刻 article.class.php:3827-3842：
//
//	loginUid > -1 才判断；loginUid == userid → 2；
//	否则查 member_follow(tid=loginUid, fid=userid)：有行 → 1，无行 → 0。
//
// dsqlOper 出错时返回非空的失败串（真值）→ 1。所以 from=abc、userid 为 NULL、
// 查询失败这几种「SQL 报错」情况 PHP 都输出 1（canary 实测 from=abc → 1）。
func (s *Service) selfmediaIsFollow(ctx context.Context, login smLogin, userid int64, useridOK bool) int {
	switch login.kind {
	case smLoginAnon:
		return 0
	case smLoginRaw:
		// 非数字串与 -1 比较为真、与 userid 比较为假，拼进 SQL 报错 → 失败串 → 1。
		return 1
	}
	if login.uid <= -1 {
		return 0
	}
	if !useridOK {
		// `fid = ` 后面为空，SQL 报错 → 1。
		return 1
	}
	if login.uid == float64(userid) {
		return 2
	}
	if login.uid != math.Trunc(login.uid) || math.Abs(login.uid) > 9e18 {
		// tid 是整型列，非整数（或超出范围）的数值比较不会命中任何行。
		return 0
	}
	var id sql.NullString
	err := s.db.QueryRowContext(ctx,
		"SELECT `id` FROM "+s.smFollowTable+" WHERE `tid` = ? AND `fid` = ? LIMIT 1", int64(login.uid), userid).Scan(&id)
	if errors.Is(err, sql.ErrNoRows) {
		return 0
	}
	// 有行 → 1；查询失败 → PHP 拿到失败串（真值）→ 同样是 1。
	return 1
}

// nullable 把 PDO 的字符串/NULL 原值转成 JSON 的 "..." / null。
func nullable(v sql.NullString) *string {
	if !v.Valid {
		return nil
	}
	s := v.String
	return &s
}
