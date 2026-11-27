// list_shared.go 是 travel 批次2（#371）列表/详情 action 的共享设施：
// 输出键序保持、telEncrypt、distance 文案、site_area 链与递归、拼音表、
// PHP 杂项函数复刻（strip_tags / nl2br / cn_substrR / unserialize）。
package travel

import (
	"bytes"
	"context"
	"crypto/md5"
	"database/sql"
	_ "embed"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"sync"
	"fmt"
	"math"
	"regexp"
	"strconv"
	"strings"
	"unicode/utf8"
)

// —— 有序 JSON 对象 ——
// PHP 关联数组的键序 = 赋值序；Go map 会按字母序重排，所有派生对象用 omap。

type omap struct {
	keys []string
	vals map[string]any
}

func newOmap() *omap { return &omap{vals: map[string]any{}} }

// cloneOmap 浅拷贝（键序保持）。PHP 数组赋值是值语义：把 $userArr 赋给条目时是
// 拷贝，后续对 $userArr 的修改不影响已赋出的条目；但残留字段仍跨条目延续。
// 共享 *omap 指针会把"后来的用户"回写进历史条目——每个条目落库前快照一份。
func cloneOmap(m *omap) *omap {
	c := &omap{keys: append([]string(nil), m.keys...), vals: make(map[string]any, len(m.vals))}
	for k, v := range m.vals {
		c.vals[k] = v
	}
	return c
}

func (m *omap) set(k string, v any) {
	if _, ok := m.vals[k]; !ok {
		m.keys = append(m.keys, k)
	}
	m.vals[k] = v
}

// setAll 顺序写入（storeDetail 的 servicetime 先赋原值再被覆盖等场景直接连续 set）。
func (m *omap) setAll(kv ...any) {
	for i := 0; i+1 < len(kv); i += 2 {
		m.set(kv[i].(string), kv[i+1])
	}
}

func (m *omap) MarshalJSON() ([]byte, error) {
	var b bytes.Buffer
	b.WriteByte('{')
	for i, k := range m.keys {
		if i > 0 {
			b.WriteByte(',')
		}
		kb, _ := json.Marshal(k)
		b.Write(kb)
		b.WriteByte(':')
		vb, err := marshalNoEscape(m.vals[k])
		if err != nil {
			return nil, err
		}
		b.Write(vb)
	}
	b.WriteByte('}')
	return b.Bytes(), nil
}

// marshalNoEscape 是关闭 HTML 转义的 json.Marshal（PHP json_encode 默认不转义 < > &）。
func marshalNoEscape(v any) ([]byte, error) {
	var buf bytes.Buffer
	enc := json.NewEncoder(&buf)
	enc.SetEscapeHTML(false)
	if err := enc.Encode(v); err != nil {
		return nil, err
	}
	return bytes.TrimRight(buf.Bytes(), "\n"), nil
}

// phpCeilF 是 PHP ceil() 的返回：float。PHP json_encode 对整数值 float 输出 "N.0"
// （如 1.0 → "1.0"），Go 的 int/float64 Marshal 都给不出这个形态，用自定义类型。
type phpCeilF float64

func (f phpCeilF) MarshalJSON() ([]byte, error) {
	if float64(f) == math.Trunc(float64(f)) && math.Abs(float64(f)) < 1e15 {
		return []byte(strconv.FormatFloat(float64(f), 'f', 1, 64)), nil
	}
	return json.Marshal(float64(f))
}

// phpCeil 复刻 ceil($totalCount/$pageSize)：字符串 count 参与除法按 PHP 数字语义。
func phpCeil(count string, pageSize float64) phpCeilF {
	num := phpLooseFloat(count)
	return phpCeilF(math.Ceil(num / pageSize))
}

// telEncrypt 复刻 storeList/storeDetail 的手机号打码（PHP preg_replace /is）。
// 非 11 位手机号原样输出（正则不命中）。
var telPattern = regexp.MustCompile(`(1[34578]{1}[0-9])[0-9]{4}([0-9]{4})`)

func telEncrypt(tel string) string {
	return telPattern.ReplaceAllString(tel, "${1}****${2}")
}

// distanceText 复刻 storeList/ticketList/hotelList/searchTravel 的距离文案：
// `>1000 ? sprintf("%.1f", d/1000) . "千米" : sprintf("%.1f", d) . "米"`，
// 随后 str_replace 千米→km、米→m（canary siteConfig[13][22]=米、[13][23]=千米，
// 运行时拼接结果必然命中其一）。
func distanceText(d float64) string {
	if d > 1000 {
		return fmt.Sprintf("%.1f", d/1000) + "km"
	}
	return fmt.Sprintf("%.1f", d) + "m"
}

// —— 批次2（#371）语言包文案（webroot/include/lang/zh-CN 实测值）——

const (
	// infoFormatError 是 $langData['travel'][12][23]（详情类非数字 id 的报错）。
	infoFormatError = "格式错误"
	// infoNoCompany 是 $langData['travel'][12][24]（storeDetail 会员无店）。
	infoNoCompany = "该会员暂未开通公司"
	// infoStaffFail 是 $langData['travel'][12][14]（会员态商家鉴权失败；hotelList 的
	// 同语义分支是硬编码 "商家权限验证失败！"——带叹号，两处口径不同照抄）。
	infoStaffFail = "商家权限验证失败"
	// infoNoDataCnt 是 $langData['siteConfig'][21][64]（列表 totalCount==0）。
	infoNoDataCnt = "暂无数据！"
	// infoMarryFormat 是 $langData['marry'][5][10]（hotel/ticket/visa/agency/rentcar/
	// video/strategy 列表的非数组 param 分支——死代码，仅留档）。
	infoMarryFormat = "格式错误！"
	// infoGetAlldataFormat / infoGetAlldataNoData 是 getAlldata 的硬编码文案（非 langData）。
	infoGetAlldataFormat  = "格式错误！"
	infoGetAlldataNoData  = "暂无数据！"
	infoStaffFailHardcode = "商家权限验证失败！"
)

// phpFloatOf 是 PHP float 的 JSON 形态：整数值输出 "N.0"（json_encode(0.0) → "0.0"），
// 非整数走最短往返表示（serialize_precision=-1，PHP 7.1+）。
func phpFloatOf(f float64) phpCeilF { return phpCeilF(f) }

// jsonUnmarshal 是 encoding/json.Unmarshal 的本地别名（避免多处重复 import）。
func jsonUnmarshal(b []byte, v any) error { return json.Unmarshal(b, v) }

// distanceSelect 是 storeList / ticketList / hotelList / searchTravel 共用的
// Haversine 距离列（lng/lat 均非空时才拼进 SELECT，占位参数顺序 lat, lat, lng）。
const distanceSelect = "(2 * 6378.137* ASIN(SQRT(POW(SIN(3.1415926535898*(?-" +
	"`lat`)/360),2)+COS(3.1415926535898*?/180)* COS(`lat` * 3.1415926535898/180)*" +
	"POW(SIN(3.1415926535898*(?-`lng`)/360),2))))*1000 AS distance"

// distanceArgs 返回 distanceSelect 的占位参数（lat, lat, lng）。
func distanceArgs(lng, lat string) []any { return []any{lat, lat, lng} }

// truthy 复刻 PHP 对「来自请求/DB 的标量」的真值判断："" 与 "0" 为假。
func truthy(s string) bool { return s != "" && s != "0" }

// truthyAny 复刻 PHP empty() 对 DB 值的判断（nil/""/"0" 为假）。
func truthyAny(v any) bool {
	switch t := v.(type) {
	case nil:
		return false
	case string:
		return t != "" && t != "0"
	case []any:
		return len(t) > 0
	default:
		return true
	}
}

// —— site_area 链（getParentArr + parent_foreach + array_reverse [+ splice]）——

type areaRow struct {
	ID       string
	ParentID string
	Typename string
}

// areaChain 复刻 getParentArr("site_area", $addrid)：从自身向上到根，
// 返回顺序 = self, parent, ..., root（与 parent_foreach 收集序一致）。
// addrid 为空/查不到 → nil。
func (s *Service) areaChain(ctx context.Context, id int) []areaRow {
	if id == 0 || s.db == nil {
		return nil
	}
	var out []areaRow
	cur := id
	seen := map[int]bool{}
	for cur != 0 && !seen[cur] {
		seen[cur] = true
		var r areaRow
		err := s.db.QueryRowContext(ctx,
			"SELECT `id`, `parentid`, `typename` FROM `"+s.prefix+"site_area` WHERE `id` = "+strconv.Itoa(cur)+
				" ORDER BY `weight` LIMIT 1").
			Scan(&r.ID, &r.ParentID, &r.Typename)
		if err != nil {
			if err == sql.ErrNoRows {
				return nil
			}
			return nil
		}
		out = append(out, r)
		pid := phpInt(r.ParentID)
		if pid == 0 {
			break
		}
		cur = pid
	}
	return out
}

// areaNames 复刻 `array_reverse(parent_foreach($addrName,"typename"))` + splice 口径：
// 链 ≥3 级时丢弃第一项（省级）。
func areaNames(chain []areaRow) []any {
	if len(chain) == 0 {
		return []any{}
	}
	// parent_foreach 收集序 = 链序（self→root）；array_reverse → root→self。
	names := make([]any, 0, len(chain))
	for i := len(chain) - 1; i >= 0; i-- {
		names = append(names, chain[i].Typename)
	}
	if len(names) > 2 {
		names = names[1:]
	}
	return names
}

// addrnameOf 复刻列表的 addrname 赋值：addrid 空 → ""（字符串）；
// 非空但查不到 → []（空数组）；否则 splice 后的名称数组。
func addrnameOf(ctx context.Context, s *Service, addrid string) any {
	if !truthy(addrid) {
		return ""
	}
	return addrnameFromChain(addrid, s.areaChain(ctx, phpInt(addrid)))
}

// addrnameFromChain 是 addrnameOf 的链版（storeDetail 需要同一链算 city，避免二次查询）。
func addrnameFromChain(addrid string, chain []areaRow) any {
	if !truthy(addrid) {
		return ""
	}
	return areaNames(chain)
}

// cityOf 复刻 storeDetail 的 city：id 链 array_reverse 后 `count>2 ? arr[1] : arr[0]`；
// 链空 → PHP 取不存在的下标 → null。
func cityOf(chain []areaRow) any {
	if len(chain) == 0 {
		return nil
	}
	ids := make([]string, 0, len(chain))
	for i := len(chain) - 1; i >= 0; i-- {
		ids = append(ids, chain[i].ID)
	}
	if len(ids) > 2 {
		return ids[1]
	}
	return ids[0]
}

// areaDescendants 复刻 addrid 递归展开：dsql::getTypeList($addrid,"site_area") 的
// 子树 + arr_foreach 收集全部 id（含自身？不含——PHP 拼接为 addrid.",".join(lower)）。
// BFS 按层、层内按 weight（getTypeList 的 ORDER BY weight）。
func (s *Service) areaDescendants(ctx context.Context, id int) []int {
	if id == 0 || s.db == nil {
		return nil
	}
	var out []int
	frontier := []int{id}
	for len(frontier) > 0 {
		ids := make([]string, 0, len(frontier))
		for _, v := range frontier {
			ids = append(ids, strconv.Itoa(v))
		}
		rows, err := s.db.QueryContext(ctx,
			"SELECT `id` FROM `"+s.prefix+"site_area` WHERE `parentid` IN ("+strings.Join(ids, ",")+
				") ORDER BY `weight` LIMIT 100000")
		if err != nil {
			return out
		}
		next := []int{}
		for rows.Next() {
			var v int
			if rows.Scan(&v) == nil {
				out = append(out, v)
				next = append(next, v)
			}
		}
		_ = rows.Close()
		frontier = next
	}
	return out
}

// lowerAddrs 复刻 `$lower = addrid.",".join(',',arr_foreach(...))`（无子级 → addrid 原样）。
func (s *Service) lowerAddrs(ctx context.Context, addrid string) string {
	// 非数字 addrid 直接拒绝：PHP 把原始 $addrid 拼进 `in (...)`（无引号），
	// 非数字 → SQL 语法错误 → 查询错误面。返回 "" 由调用方按 #371 验证口径降级。
	if !isNumericString(addrid) {
		return ""
	}
	kids := s.areaDescendants(ctx, phpInt(addrid))
	if len(kids) == 0 {
		return addrid
	}
	parts := make([]string, 0, len(kids)+1)
	parts = append(parts, addrid)
	for _, v := range kids {
		parts = append(parts, strconv.Itoa(v))
	}
	return strings.Join(parts, ",")
}

// —— 拼音（GetPinyin：GBK 表 pinyin.dat）——
// PHP 链路：utf82gb(iconv UTF-8→GBK) → 逐 GBK 字节对查表 → 非字母数字补 "_" → strtolower。
// Go 侧在构建期把 pinyin.dat（GBK 键）转换成 UTF-8 键表（pinyin_table.txt，go:embed），
// 查不到的 CJK 与 ASCII 非字母数字一律 "_"（iconv 失败 → "?" 的偏差仅在表外字符出现，
// 本地 L2 无法触达，已在 #371 业务规则评论报备）。

//go:embed pinyin_table.txt
var pinyinData string

// pinyinOnce 保证并发首次调用只初始化一次（HTTP 并发可同时触发 getPinyin）。
var pinyinOnce sync.Once
var pinyinMap map[string]string

func pinyinTable() map[string]string {
	pinyinOnce.Do(func() {
		m := make(map[string]string)
		for _, line := range strings.Split(pinyinData, "\n") {
			line = strings.TrimRight(line, "\r")
			if i := strings.IndexByte(line, '\t'); i > 0 {
				m[line[:i]] = line[i+1:]
			}
		}
		pinyinMap = m
	})
	return pinyinMap
}

func getPinyin(str string) string {
	pinyinMap := pinyinTable()
	s := strings.TrimSpace(str)
	// PHP：GBK 字节数 < 2（空串或单 ASCII 字符）原样返回，不走 strtolower。
	if utf8.RuneCountInString(s) < 2 && len(s) < 2 {
		return s
	}
	var b strings.Builder
	for _, r := range s {
		if r < 0x80 {
			// preg_match("/[a-z0-9]/i")：字母数字透传，其余（标点等）→ "_"
			if r >= 'a' && r <= 'z' || r >= '0' && r <= '9' || r >= 'A' && r <= 'Z' {
				b.WriteRune(r)
			} else {
				b.WriteByte('_')
			}
			continue
		}
		if py, ok := pinyinMap[string(r)]; ok {
			b.WriteString(py)
		} else {
			b.WriteByte('_')
		}
	}
	return strings.ToLower(b.String())
}

// tagAllOf 复刻 tag 按 "|" explode → 每项 {jc: v, py: GetPinyin(v)}（tag 空 → []）。
func tagAllOf(tag string) []any {
	if !truthy(tag) {
		return []any{}
	}
	parts := strings.Split(tag, "|")
	out := make([]any, 0, len(parts))
	for _, v := range parts {
		m := newOmap()
		m.set("jc", v)
		m.set("py", getPinyin(v))
		out = append(out, m)
	}
	return out
}

// —— PHP 杂项函数复刻 ——

// phpStripTags 是 PHP strip_tags 的移植面覆盖：去 <!-- --> 注释与 <...> 标签
// （属性值内的 ">" 不结束标签）。<script>/<style> 整块内容删除按 PHP 口径同样处理。
func phpStripTags(s string) string {
	var b strings.Builder
	i := 0
	for i < len(s) {
		c := s[i]
		if c == '<' {
			if strings.HasPrefix(s[i:], "<!--") {
				if j := strings.Index(s[i+4:], "-->"); j >= 0 {
					i += 4 + j + 3
					continue
				}
				return b.String()
			}
			j := i + 1
			inQ := byte(0)
			for j < len(s) {
				ch := s[j]
				if inQ != 0 {
					if ch == inQ {
						inQ = 0
					}
				} else if ch == '"' || ch == '\'' {
					inQ = ch
				} else if ch == '>' {
					break
				}
				j++
			}
			if j >= len(s) {
				return b.String()
			}
			i = j + 1
			continue
		}
		b.WriteByte(c)
		i++
	}
	return b.String()
}

// phpNl2br 复刻 nl2br：在 \n（含 \r\n、\r）前插入 "<br />"。
func phpNl2br(s string) string {
	var b strings.Builder
	for i := 0; i < len(s); i++ {
		c := s[i]
		if c == '\r' {
			if i+1 < len(s) && s[i+1] == '\n' {
				b.WriteString("<br />\r\n")
				i++
			} else {
				b.WriteString("<br />\r")
			}
			continue
		}
		if c == '\n' {
			b.WriteString("<br />\n")
			continue
		}
		b.WriteByte(c)
	}
	return b.String()
}

// cnSubstrR 复刻 cn_substrR：按显示宽度截断（CJK/高位字节=1、大写字母=1、
// 小写字母/半角标点=0.5），超出不加省略号。
func cnSubstrR(s string, slen int) string {
	var b strings.Builder
	n := 0.0
	for _, r := range s {
		if n >= float64(slen) {
			break
		}
		b.WriteRune(r)
		if r >= 192 {
			n++
		} else if r >= 'A' && r <= 'Z' {
			n++
		} else {
			n += 0.5
		}
	}
	return b.String()
}

// phpUnserialize / specialtimejson：specialtime 存 serialize 数组，
// PHP 输出 unserialize 结果（JSON 数组）与 json_encode 的字符串。既有口径同 article。

// phpExplodeInts 把逗号串拆成 PHP intval 数组（convertArrToStrWithComma 的反向场景不用）。

// —— 搜索的店联表子查询（storeList 特有：匹配 member.title）——

// storeSidArr 复刻 `SELECT store.id FROM travel_store store LEFT JOIN member user
// ON user.id = store.userid WHERE user.title like '%kw%' OR store.address like '%kw%'`。
func (s *Service) storeSearchSids(ctx context.Context, kw string) []string {
	rows, err := s.db.QueryContext(ctx,
		"SELECT `store`.`id` FROM `"+s.prefix+"travel_store` store LEFT JOIN `"+s.prefix+
			"member` user ON `user`.`id` = `store`.`userid` WHERE `user`.`title` like ? OR `store`.`address` like ?",
		"%"+kw+"%", "%"+kw+"%")
	if err != nil {
		return nil
	}
	defer func() { _ = rows.Close() }()
	var out []string
	for rows.Next() {
		var v string
		if rows.Scan(&v) == nil {
			out = append(out, v)
		}
	}
	return out
}

// storeLikeSids 是 hotelList/ticketList/visaList/agencyList/rentcarList 的子查询
// （匹配 store.title / store.address）。
func (s *Service) storeLikeSids(ctx context.Context, kw string) []string {
	rows, err := s.db.QueryContext(ctx,
		"SELECT `store`.`id` FROM `"+s.prefix+"travel_store` store LEFT JOIN `"+s.prefix+
			"member` user ON `user`.`id` = `store`.`userid` WHERE `store`.`title` like ? OR `store`.`address` like ?",
		"%"+kw+"%", "%"+kw+"%")
	if err != nil {
		return nil
	}
	defer func() { _ = rows.Close() }()
	var out []string
	for rows.Next() {
		var v string
		if rows.Scan(&v) == nil {
			out = append(out, v)
		}
	}
	return out
}

// cityStoreSids 复刻 `SELECT id FROM travel_store WHERE state=1 AND cityid=$cityid`
// （hotel/ticket/agency/visa 前台 cityid 过滤用）；rentcarList 用 cityStoreSidsAll
// （不带 state=1）。
func (s *Service) cityStoreSids(ctx context.Context, cityid string, withState bool) []string {
	where := ""
	if withState {
		where = "`state` = 1 AND "
	}
	rows, err := s.db.QueryContext(ctx,
		"SELECT `id` FROM `"+s.prefix+"travel_store` WHERE "+where+"`cityid` = "+cityid)
	if err != nil {
		return nil
	}
	defer func() { _ = rows.Close() }()
	var out []string
	for rows.Next() {
		var v string
		if rows.Scan(&v) == nil {
			out = append(out, v)
		}
	}
	return out
}

// userStoreID 复刻 `SELECT id FROM travel_store WHERE userid=$uid` 的首条
// （会员态归属判断），无店返回 ""。
func (s *Service) userStoreID(ctx context.Context, uid int64) string {
	if uid <= 0 || s.db == nil {
		return ""
	}
	var v sql.NullString
	err := s.db.QueryRowContext(ctx,
		"SELECT `id` FROM `"+s.prefix+"travel_store` WHERE `userid` = "+strconv.FormatInt(uid, 10)).
		Scan(&v)
	if err != nil || !v.Valid {
		return ""
	}
	return v.String
}

// —— RenrenCrypt（videoList attachment 宽高）——

const travelCryptKey = "KaCXPpoD1vyD[XUWwxhFhkXJulzS~u"

// travelRenrenDecrypt 复刻 RenrenCrypt::php_decrypt（内部再 base64 一次）。
func travelRenrenDecrypt(txt string) string {
	sum := md5.Sum([]byte(travelCryptKey))
	key := hex.EncodeToString(sum[:])
	t := phpBase64Decode(txt)
	buf := make([]byte, len(t))
	for i := 0; i < len(t); i++ {
		buf[i] = t[i] ^ key[i%len(key)]
	}
	out := make([]byte, 0, len(buf)/2)
	for i := 0; i < len(buf); i++ {
		m := buf[i]
		i++
		if i < len(buf) {
			out = append(out, buf[i]^m)
		}
	}
	return string(out)
}

// phpBase64Decode 复刻 PHP base64_decode 的宽容口径（非法字符剔除、长度余 1 戠尾）。
func phpBase64Decode(s string) string {
	clean := make([]byte, 0, len(s))
	for i := 0; i < len(s); i++ {
		c := s[i]
		if c >= 'A' && c <= 'Z' || c >= 'a' && c <= 'z' || c >= '0' && c <= '9' || c == '+' || c == '/' {
			clean = append(clean, c)
		} else if c == '=' {
			break
		}
	}
	if len(clean)%4 == 1 {
		clean = clean[:len(clean)-1]
	}
	out, err := base64.RawStdEncoding.DecodeString(string(clean))
	if err != nil {
		return ""
	}
	return string(out)
}

// —— gettypename / getname（static 列表查找）——

func weekItems() []staticItem {
	return []staticItem{
		{1, langSC34_5_1, []any{}},
		{2, langSC34_5_2, []any{}},
		{3, langSC34_5_3, []any{}},
		{4, langSC34_5_4, []any{}},
		{5, langSC34_5_5, []any{}},
		{6, langSC34_5_6, []any{}},
		{7, langSC34_5_0, []any{}},
	}
}

func moduleTypeItems() []staticItem {
	return []staticItem{
		{1, langTravel7_13, []any{}},
		{2, langTravel1_0, []any{}},
		{3, langTravel9_2, []any{}},
		{4, langTravel5_0, []any{}},
		{5, langTravel3_1, []any{}},
		{6, langTravel0_7, []any{}},
		{7, langTravel5_5, []any{}},
	}
}

func starTypeItems() []staticItem {
	return []staticItem{
		{1, langTravel12_52, []any{}},
		{2, langTravel12_53, []any{}},
		{3, langTravel12_54, []any{}},
		{4, langTravel12_55, []any{}},
		{5, langTravel12_56, []any{}},
	}
}

func travelhotelTypeItems() []staticItem {
	return []staticItem{
		{1, langTravel12_0, []any{}},
		{2, langTravel12_1, []any{}},
	}
}

func travelagencyTypeItems() []staticItem {
	return []staticItem{
		{0, langTravel2_0, []any{}},
		{1, langTravel2_13, []any{}},
	}
}

func iswindowTypeItems() []staticItem {
	return []staticItem{
		{0, langTravel12_2, []any{}},
		{1, langTravel12_3, []any{}},
	}
}

func roomTypeItems() []staticItem {
	return []staticItem{
		{0, langTravel12_4, []any{}},
		{1, langTravel12_5, []any{}},
		{2, langTravel12_6, []any{}},
	}
}

func breakfastTypeItems() []staticItem {
	return []staticItem{
		{0, langTravel12_7, []any{}},
		{1, langTravel12_8, []any{}},
	}
}

// typeNameDB 是 DB 型 typename 直查（rentcartype/visatype/visacountrytype/strategytype）：
// `SELECT typename FROM <tab> WHERE id=<id>`，查不到 → PHP notice + ”。
func (s *Service) typeNameDB(ctx context.Context, tab, id string) string {
	if !truthy(id) || s.db == nil {
		// PHP：$typeid 非空才拼 SQL；空值时 SQL 为 WHERE id=，语句报错 → dsqlOper
		// 返回错误串 → $result['typename'] 非法下标 → notice + null → ''。
		return ""
	}
	var v sql.NullString
	err := s.db.QueryRowContext(ctx,
		"SELECT `typename` FROM `"+s.prefix+tab+"` WHERE `id` = "+id).Scan(&v)
	if err != nil || !v.Valid {
		return ""
	}
	return v.String
}

// —— PHP unserialize（specialtime）——
// 口径同 article/php_unserialize.go；数组用 omap 保插入序（json_encode 键序 = 插入序）。

func phpUnserAny(raw string) (any, bool) {
	p := &travelUnser{s: raw}
	return p.value()
}

type travelUnser struct {
	s string
	i int
}

func (p *travelUnser) until(c byte) (string, bool) {
	j := strings.IndexByte(p.s[p.i:], c)
	if j < 0 {
		return "", false
	}
	out := p.s[p.i : p.i+j]
	p.i += j + 1
	return out, true
}

func (p *travelUnser) expect(lit string) bool {
	if strings.HasPrefix(p.s[p.i:], lit) {
		p.i += len(lit)
		return true
	}
	return false
}

func (p *travelUnser) value() (any, bool) {
	if p.i+1 >= len(p.s) {
		return nil, false
	}
	t := p.s[p.i]
	switch t {
	case 'N':
		return nil, p.expect("N;")
	case 'b', 'i', 'd':
		if !p.expect(string(t) + ":") {
			return nil, false
		}
		tok, ok := p.until(';')
		if !ok {
			return nil, false
		}
		switch t {
		case 'b':
			return tok == "1", tok == "0" || tok == "1"
		case 'i':
			n, err := strconv.ParseInt(tok, 10, 64)
			return n, err == nil
		default:
			f, err := strconv.ParseFloat(tok, 64)
			return f, err == nil
		}
	case 's':
		if !p.expect("s:") {
			return nil, false
		}
		ln, ok := p.until(':')
		n, err := strconv.Atoi(ln)
		if !ok || err != nil || n < 0 || !p.expect(`"`) || p.i+n > len(p.s) {
			return nil, false
		}
		str := p.s[p.i : p.i+n]
		p.i += n
		if !p.expect(`";`) {
			return nil, false
		}
		return str, true
	case 'a':
		if !p.expect("a:") {
			return nil, false
		}
		cnt, ok := p.until(':')
		n, err := strconv.Atoi(cnt)
		if !ok || err != nil || n < 0 || !p.expect("{") {
			return nil, false
		}
		out := newOmap()
		for k := 0; k < n; k++ {
			key, ok := p.value()
			if !ok {
				return nil, false
			}
			var ks string
			switch kv := key.(type) {
			case string:
				ks = kv
			case int64:
				ks = strconv.FormatInt(kv, 10)
			default:
				return nil, false
			}
			val, ok := p.value()
			if !ok {
				return nil, false
			}
			out.set(ks, val)
		}
		return out, p.expect("}")
	}
	return nil, false
}

// phpArrayJSON 把 PHP 数组转 JSON 值：键恰为 "0".."n-1" 连续 → JSON 数组（按键序）；
// 否则关联对象原样。
func phpArrayJSON(v any) any {
	m, ok := v.(*omap)
	if !ok {
		return v
	}
	seq := len(m.keys) > 0
	for i, k := range m.keys {
		if k != strconv.Itoa(i) {
			seq = false
			break
		}
	}
	if seq {
		list := make([]any, len(m.keys))
		for i, k := range m.keys {
			list[i] = phpArrayJSON(m.vals[k])
		}
		return list
	}
	for _, k := range m.keys {
		m.vals[k] = phpArrayJSON(m.vals[k])
	}
	return m
}

// specialtimeOut 复刻 `$val['specialtime'] ? unserialize(...) : ”` 与
// `... ? json_encode(unserialize(...)) : ”` 的双输出。
// PHP json_encode(关联数组) 输出对象（键序=插入序）；json_encode 失败 → false（本处
// unserialize 成功则必成功）。
func specialtimeOut(raw string) (any, string) {
	if !truthy(raw) {
		return "", ""
	}
	v, ok := phpUnserAny(raw)
	if !ok {
		// unserialize 失败 → PHP false → JSON false / json_encode(false) → "false"。
		return false, "false"
	}
	v = phpArrayJSON(v)
	b, err := json.Marshal(v)
	if err != nil {
		return v, ""
	}
	return v, string(b)
}

// phpStripslashes 复刻 PHP stripslashes：去 ' " \ 与 NUL 前的反斜杠。
func phpStripslashes(s string) string {
	var b strings.Builder
	for i := 0; i < len(s); i++ {
		c := s[i]
		if c == '\\' && i+1 < len(s) {
			n := s[i+1]
			if n == '\'' || n == '"' || n == '\\' || n == 0 {
				i++
				b.WriteByte(n)
				continue
			}
		}
		b.WriteByte(c)
	}
	return b.String()
}

// jsonMarshal 是 json.Marshal 的本地别名。
func jsonMarshal(v any) ([]byte, error) { return json.Marshal(v) }

// storeAddrSids 是 rentcar/visa 的 addrid 间接过滤子查询：
// `SELECT id FROM travel_store WHERE addrid in ($lower)`。
func (s *Service) storeAddrSids(ctx context.Context, lower string) []string {
	if s.db == nil {
		return nil
	}
	rows, err := s.db.QueryContext(ctx,
		"SELECT `id` FROM `"+s.prefix+"travel_store` WHERE `addrid` in ("+lower+")")
	if err != nil {
		return nil
	}
	defer func() { _ = rows.Close() }()
	var out []string
	for rows.Next() {
		var v string
		if rows.Scan(&v) == nil {
			out = append(out, v)
		}
	}
	return out
}

// omapOf 把查询行转成按列序的 omap（searchTravel 的行直出场景）。
func (r rowVal) omapOf() *omap {
	m := newOmap()
	for _, c := range r.cols {
		m.set(c, r.vals[c])
	}
	return m
}

// getAlldata is wired in aggregate.go.
