package article

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/fburl"
)

// MemberResolver 识别当前请求的火鸟会员，语义同 userLogin::getMemberID()：未登录返回 -1。
// *fbidentity.Resolver 满足本接口。
type MemberResolver interface {
	MemberID(ctx context.Context, req *http.Request) (int64, error)
}

// sdDsqlFailure 是 dsqlOper 查询异常时的非空返回值（getCache 原样透传，同 #244）。
const sdDsqlFailure = `{"state": 200, "info": "操作失败！"}`

// sdDict 是 PHP 里写死的字典（id 从 1 开始）。
type sdDict []struct {
	id   int
	name string
}

var (
	sdType2 = sdDict{{1, "机构媒体"}, {2, "群媒体"}}
	sdType4 = sdDict{{1, "政府机关"}, {2, "事业单位"}}
	// selfmedia_type42：注意 PHP 用 mb_type（不是 mb_level）去查它。
	sdType42 = sdDict{{1, "国家级"}, {2, "省部级"}, {3, "厅局（地市）级"}, {4, "县处级"}}
	sdLicens = sdDict{
		{1, "《广播电视播出机构许可证》"}, {2, "《广播电视频道许可证》"}, {3, "《中华人民共和国报纸出版许可证》"},
		{4, "《中华人民共和国期刊出版许可证》"}, {5, "《互联网新闻信息服务许可证》"}, {6, "《信息网络传播视听节目许可证》"},
		{7, "《网络文化经营许可证》"}, {8, "《电子出版物出版许可证》"}, {9, "《中华人民共和国出版物经营许可证》"},
		{10, "《中华人民共和国互联网出版许可证》"},
	}
)

// sdLooseInt 把行值按 PHP 弱类型比较的口径转成整数；ok=false 表示不可能与任何 id 相等（NULL 等）。
func sdLooseInt(v any) (int, bool) {
	switch x := v.(type) {
	case string:
		return phpInt(x), true
	case int64:
		return int(x), true
	case float64:
		return int(x), true
	case bool:
		if x {
			return 1, true
		}
		return 0, true
	}
	return 0, false
}

// lookup 复刻 gettypename：array_search 未命中时 $list[false] 取下标 0 → 第一项。
func (d sdDict) lookup(id any) string {
	if n, ok := sdLooseInt(id); ok {
		for _, it := range d {
			if it.id == n {
				return it.name
			}
		}
	}
	return d[0].name
}

// sdMap 保持 PHP 数组的键插入顺序；重复赋值不改变位置。
type sdMap struct {
	keys []string
	vals map[string]any
}

func newSdMap() *sdMap { return &sdMap{vals: map[string]any{}} }

func (m *sdMap) set(k string, v any) {
	if _, ok := m.vals[k]; !ok {
		m.keys = append(m.keys, k)
	}
	m.vals[k] = v
}

func (m *sdMap) MarshalJSON() ([]byte, error) {
	var b bytes.Buffer
	b.WriteByte('{')
	for i, k := range m.keys {
		if i > 0 {
			b.WriteByte(',')
		}
		kb, _ := json.Marshal(k)
		b.Write(kb)
		b.WriteByte(':')
		vb, err := json.Marshal(m.vals[k])
		if err != nil {
			return nil, err
		}
		b.Write(vb)
	}
	b.WriteByte('}')
	return b.Bytes(), nil
}

// sdStr 把行值转成 PHP 字符串语义（NULL → ""）。
func sdStr(v any) string {
	switch x := v.(type) {
	case nil:
		return ""
	case string:
		return x
	case int64:
		return strconv.FormatInt(x, 10)
	case float64:
		return strconv.FormatFloat(x, 'f', -1, 64)
	case bool:
		if x {
			return "1"
		}
		return ""
	}
	return ""
}

// sdTruthy 复刻 PHP 真值：NULL、""、"0"、0、false、空数组为假。
func sdTruthy(v any) bool {
	switch x := v.(type) {
	case nil:
		return false
	case string:
		return x != "" && x != "0"
	case int64:
		return x != 0
	case float64:
		return x != 0
	case bool:
		return x
	case map[string]any:
		return len(x) > 0
	}
	return true
}

// sdParam 取 ajax.php 归一后的参数："undefined" 改写成 ""。
func sdParam(req *ajax.Request, key string) string {
	if v := req.Params.Get(key); v != "undefined" {
		return v
	}
	return ""
}

// selfmediaDetail 迁移自 article.class.php:3876-4062，规则见 issue #246「业务规则」评论。
//
//	uid 优先于 aid；uid!=0 先过 selfmedia_verify（失败一律 102）并用行 id 覆盖 aid；
//	无行 → 102；登录者是本人 → 追加会员中心字段（并按 editlog 草稿覆盖）。
func (s *Service) selfmediaDetail(req *ajax.Request) ajax.Response {
	noData := ajax.Response{State: stateNoData, Info: infoNoData}
	if s.db == nil {
		return noData
	}
	ctx := context.Background()
	host := ""
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
		host = req.HTTP.Host
	}

	uid := phpInt(sdParam(req, "uid"))
	aid := phpInt(sdParam(req, "aid"))
	switch {
	case uid != 0:
		id, ok := s.sdVerify(ctx, uid)
		if !ok {
			return noData
		}
		aid = id
	case aid == 0:
		return noData
	}

	row, ok := s.sdRow(ctx, aid)
	if !ok {
		return noData
	}

	loginUid := int64(-1)
	if s.members != nil && req.HTTP != nil {
		if id, err := s.members.MemberID(ctx, req.HTTP); err == nil && id > -1 {
			loginUid = id
		}
	}
	userid, useridErr := strconv.ParseInt(sdStr(row["userid"]), 10, 64)
	useridOK := row["userid"] != nil && useridErr == nil
	isOwner := useridOK && loginUid == userid
	origUserid := row["userid"] // 统计与 isfollow 用的是合并前的 $d / 草稿覆盖前的值，下面单独处理

	if isOwner && sdLooseInt0(row["state"], 1) && sdLooseEqZero(row["editstate"]) && sdTruthy(row["editlog"]) {
		if draft, ok := sdUnserializeData(sdStr(row["editlog"])); ok {
			for k, v := range draft {
				row[k] = v
			}
		}
	}

	d := newSdMap()
	d.set("id", row["id"])
	d.set("userid", row["userid"])
	d.set("type", row["type"])
	d.set("cityid", row["cityid"])
	d.set("ac_name", row["ac_name"])
	d.set("ac_profile", row["ac_profile"])
	file := func(v any) (string, error) { return s.zlFile(ctx, host, sdStr(v)) }
	fileIf := func(v any) (any, error) {
		if !sdTruthy(v) {
			return "", nil
		}
		return file(v)
	}
	fail := ajax.Response{State: stateZhuantiFailed, Info: infoZhuantiFailed}
	photo, err := fileIf(row["ac_photo"])
	if err != nil {
		return fail
	}
	d.set("ac_photo", photo)
	d.set("ac_addrid", row["ac_addrid"])
	d.set("ac_field", row["ac_field"])
	d.set("ac_fieldname", s.sdFieldName(ctx, req, row["ac_field"]))
	u, err := s.zlURL(ctx, host, fburl.Params{
		{Key: "service", Value: "article"}, {Key: "template", Value: "mddetail"}, {Key: "id", Value: sdStr(row["id"])},
	})
	if err != nil {
		return fail
	}
	d.set("url", u)

	click, articles, fans := s.sdStats(ctx, origUserid)
	d.set("click", click)

	var mbType, mbLevel any = 0, 0
	mbTypename, mbLevelname := "", ""
	switch t, _ := sdLooseInt(row["type"]); t {
	case 2:
		mbType = row["mb_type"]
		mbTypename = sdType2.lookup(row["mb_type"])
	case 4:
		mbType = row["mb_type"]
		mbLevel = row["mb_level"]
		mbTypename = sdType4.lookup(row["mb_type"])
		mbLevelname = sdType42.lookup(row["mb_type"])
	}
	d.set("mb_type", mbType)
	d.set("mb_typename", mbTypename)
	d.set("mb_level", mbLevel)
	d.set("mb_levelname", mbLevelname)

	list, err := s.sdImageList(ctx, host, row["ac_banner"])
	if err != nil {
		return fail
	}
	d.set("ac_banner", row["ac_banner"])
	d.set("ac_bannerList", list)

	d.set("isfollow", s.sdIsFollow(ctx, loginUid, origUserid))
	d.set("total_article", articles)
	d.set("total_fans", fans)
	d.set("state", row["state"])

	if isOwner {
		d.set("ac_photoSource", row["ac_photo"])
		d.set("mb_name", row["mb_name"])
		d.set("mb_code", row["mb_code"])
		v, err := fileIf(row["mb_license"])
		if err != nil {
			return fail
		}
		d.set("mb_license", v)
		d.set("mb_licenseSource", row["mb_license"])
		d.set("op_name", row["op_name"])
		d.set("op_phone", row["op_phone"])
		d.set("op_email", row["op_email"])
		d.set("op_idcard", row["op_idcard"])
		if v, err = fileIf(row["op_idcardfront"]); err != nil {
			return fail
		}
		d.set("op_idcardfront", v)
		d.set("op_idcardfrontSource", row["op_idcardfront"])
		d.set("org_major_license_type", row["org_major_license_type"])
		d.set("org_major_license_typename", sdLicens.lookup(row["org_major_license_type"]))
		if v, err = fileIf(row["org_major_license"]); err != nil {
			return fail
		}
		d.set("org_major_license", v)
		d.set("org_major_licenseSource", row["org_major_license"])
		d.set("outer", row["outer"])
		d.set("editstate", row["editstate"])
		proves, err := s.sdImageList(ctx, host, row["prove"])
		if err != nil {
			return fail
		}
		d.set("prove", row["prove"])
		d.set("proveList", proves)
		// op_authorize 无条件走 getFilePath（空串 → ""）。
		auth, err := file(row["op_authorize"])
		if err != nil {
			return fail
		}
		d.set("op_authorize", auth)
		d.set("op_authorizeSource", row["op_authorize"])
	}
	return ajax.Response{State: ajax.StateOK, Info: d}
}

// sdLooseInt0 复刻 `$v == want`（want 为整数，v 来自 DB 字符串）。
func sdLooseInt0(v any, want int) bool {
	n, ok := sdLooseInt(v)
	return ok && n == want
}

// sdLooseEqZero 复刻 `$v == 0`：NULL、""、非数字串（PHP 7.4）与 "0" 都成立。
func sdLooseEqZero(v any) bool {
	if v == nil {
		return true
	}
	n, ok := sdLooseInt(v)
	return ok && n == 0
}

// sdScanRows 把 SELECT 结果按列名读成 map（值为 string 或 nil）。
func (s *Service) sdScanRows(ctx context.Context, query string, args ...any) ([]map[string]any, bool) {
	rs, err := s.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, false
	}
	defer func() { _ = rs.Close() }()
	cols, err := rs.Columns()
	if err != nil {
		return nil, false
	}
	var out []map[string]any
	for rs.Next() {
		vals := make([]sql.NullString, len(cols))
		dest := make([]any, len(cols))
		for i := range vals {
			dest[i] = &vals[i]
		}
		if err := rs.Scan(dest...); err != nil {
			return nil, false
		}
		row := make(map[string]any, len(cols))
		for i, c := range cols {
			if vals[i].Valid {
				row[c] = vals[i].String
			} else {
				row[c] = nil
			}
		}
		out = append(out, row)
	}
	if rs.Err() != nil {
		return nil, false
	}
	return out, true
}

// sdVerify 复刻 selfmedia_verify($uid, "", "check")：返回自媒体 id；任何非 ok 都是 false。
func (s *Service) sdVerify(ctx context.Context, uid int) (int, bool) {
	rows, ok := s.sdScanRows(ctx, "SELECT `id`, `state` FROM "+s.sdTable+" WHERE `userid` = ?", uid)
	if !ok {
		return 0, false
	}
	var idVal any
	if len(rows) > 0 {
		// state 0 审核中、2 已拒绝：文案被调用方丢弃，一律 102。
		if st, _ := sdLooseInt(rows[0]["state"]); st == 0 || st == 2 {
			return 0, false
		}
		idVal = rows[0]["id"]
	} else {
		// 没有入驻时，看是不是其它号的管理员（LEFT JOIN：s.id 可能为 NULL → 后续 SQL 报错 → 102）。
		mrows, ok := s.sdScanRows(ctx, "SELECT s.`id` FROM "+s.sdManagerTable+" m LEFT JOIN "+s.sdTable+" s ON s.`id` = m.`aid` WHERE m.`userid` = ?", uid)
		if !ok || len(mrows) == 0 {
			return 0, false
		}
		idVal = mrows[0]["id"]
	}
	id, err := strconv.Atoi(sdStr(idVal))
	if idVal == nil || err != nil {
		return 0, false
	}
	return id, true
}

func (s *Service) sdRow(ctx context.Context, aid int) (map[string]any, bool) {
	rows, ok := s.sdScanRows(ctx, "SELECT * FROM "+s.sdTable+" WHERE `id` = ?", aid)
	if !ok || len(rows) == 0 {
		return nil, false
	}
	return rows[0], true
}

// sdFieldName 复刻 gettypename("selfmedia_field", ac_field)：字典来自库，未命中取第一项，空表为 null。
// selfmedia_field() 自己会读请求里的 type 参数做过滤（本 action 一般不传）。
func (s *Service) sdFieldName(ctx context.Context, req *ajax.Request, id any) any {
	query := "SELECT `id`, `typename` FROM " + s.fieldTable
	var args []any
	if t := phpInt(sdParam(req, "type")); t != 0 {
		query += " WHERE `type` = ?"
		args = append(args, t)
	}
	rows, ok := s.sdScanRows(ctx, query+" ORDER BY `weight` ASC", args...)
	if !ok || len(rows) == 0 {
		return nil
	}
	if n, ok := sdLooseInt(id); ok {
		for _, r := range rows {
			if rn, _ := sdLooseInt(r["id"]); rn == n {
				return r["typename"]
			}
		}
	}
	return rows[0]["typename"]
}

// sdStats 返回 click、total_article（(int)）与 total_fans（字符串，不转型）。
// PHP 用 getCache 缓存 3600s；Go 直接实时查询，对比用例把这三个字段列入 ignoreFields。
func (s *Service) sdStats(ctx context.Context, userid any) (int, int, string) {
	uid, err := strconv.ParseInt(sdStr(userid), 10, 64)
	if userid == nil || err != nil {
		return 0, 0, sdDsqlFailure
	}
	const cond = " WHERE `admin` = ? AND `arcrank` = 1 AND `waitpay` = 0 AND `del` = 0"
	var clicks, articles sql.NullString
	if err := s.db.QueryRowContext(ctx, "SELECT SUM(`click`) c FROM "+s.sdNewsTable+cond, uid).Scan(&clicks); err != nil {
		clicks = sql.NullString{}
	}
	if err := s.db.QueryRowContext(ctx, "SELECT COUNT(`id`) c FROM "+s.sdNewsTable+cond, uid).Scan(&articles); err != nil {
		articles = sql.NullString{}
	}
	fans := sdDsqlFailure
	var fc sql.NullString
	if err := s.db.QueryRowContext(ctx, "SELECT COUNT(`id`) c FROM "+s.sdFollowTable+" WHERE `fid` = ?", uid).Scan(&fc); err == nil {
		fans = fc.String
	}
	return smIntOf(clicks.String), smIntOf(articles.String), fans
}

func smIntOf(v string) int {
	if n, err := strconv.ParseInt(v, 10, 64); err == nil {
		return int(n)
	}
	return phpInt(v)
}

// sdIsFollow：匿名 0；本人 2；member_follow(tid=登录uid, fid=行userid) 有行 1，否则 0。
func (s *Service) sdIsFollow(ctx context.Context, loginUid int64, userid any) int {
	if loginUid <= -1 {
		return 0
	}
	uid, err := strconv.ParseInt(sdStr(userid), 10, 64)
	if userid == nil || err != nil {
		return 1 // `fid = ` 后为空，SQL 报错 → 失败串为真值
	}
	if loginUid == uid {
		return 2
	}
	var id sql.NullString
	err = s.db.QueryRowContext(ctx, "SELECT `id` FROM "+s.sdFollowTable+" WHERE `tid` = ? AND `fid` = ? LIMIT 1", loginUid, uid).Scan(&id)
	if err == sql.ErrNoRows {
		return 0
	}
	return 1
}

type sdImage struct {
	Path       string  `json:"path"`
	PathSource string  `json:"pathSource"`
	Info       *string `json:"info"`
}

// sdImageList 复刻 ac_banner / prove 的解析：非空且不是占位串 "ac_banner" 时按 , 再按 | 拆；
// 缺少 | 时 PHP 读 $info[1] 得 null（只有 notice）。
func (s *Service) sdImageList(ctx context.Context, host string, raw any) ([]sdImage, error) {
	out := []sdImage{}
	str := sdStr(raw)
	if !sdTruthy(raw) || str == "ac_banner" {
		return out, nil
	}
	for _, item := range strings.Split(str, ",") {
		parts := strings.Split(item, "|")
		path, err := s.zlFile(ctx, host, parts[0])
		if err != nil {
			return nil, err
		}
		img := sdImage{Path: path, PathSource: parts[0]}
		if len(parts) > 1 {
			info := parts[1]
			img.Info = &info
		}
		out = append(out, img)
	}
	return out, nil
}
