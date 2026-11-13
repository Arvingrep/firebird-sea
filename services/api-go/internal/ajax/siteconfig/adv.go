package siteconfig

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"math"
	"regexp"
	"strconv"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/fburl"
)

// adv 迁移自 siteConfig.class.php:1698-2124（规则见 issue #250）。
//
// 出口只有三种：100 广告对象 / 101 业务错误（handlers 把 state=200 改写成 101）/ 102 No data!。
// 读 advlist、advlist_city，写 0 处。
//
// 不实现的两支（经 ajax.php 参数白名单不可达，见 #250 Q2）：
//   - is_numeric($param)：getHandle 传入的 $param 恒为数组，「普通模式 $id = $param」是死代码；
//   - $param['id'] == "stream"：id 经 convertArrToStrWithComma 后不可能等于 "stream"，
//     随机广告位 + advTitle 覆盖逻辑同为死代码。
//
// 已知偏差：
//   - 标题查不到时，PHP 对有 huoniaoOfficial 后台权限的登录用户返回占位广告（后台预览用），
//     这里没有后台权限判定，一律按匿名返回 101 广告不存在！；
//   - model=tuan_ 依赖未迁移的 tuan()->getCity()，这里一律按「无 tuan_city cookie」返回 101 城市不存在！；
//   - RemoveXSS / removeInvisibleCharacters 对 model、title 的清洗未复刻，只复刻 htmlspecialchars。
func (s *Service) adv(req *ajax.Request) ajax.Response {
	noData := ajax.Response{State: stateNoData, Info: infoNoData}
	if s.db == nil {
		return noData
	}
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}

	var id string
	model := req.Params.Get("model")
	title := phpHTMLSpecialChars(req.Params.Get("title"))
	if title == "undefined" { // ajax.php：值为 undefined 一律置空
		title = ""
	}
	if model == "undefined" {
		model = ""
	}

	if model != "" && title != "" {
		if model == "tuan_" {
			return advFail("城市不存在！")
		}
		var found sql.NullInt64
		err := s.db.QueryRowContext(ctx, "SELECT `id` FROM "+s.advTable+" WHERE `title` = ? ORDER BY `id` DESC LIMIT 1", title).Scan(&found)
		if err != nil {
			if err == sql.ErrNoRows {
				return advFail("广告不存在！")
			}
			return noData
		}
		id = strconv.FormatInt(found.Int64, 10)
	} else {
		id = convertIDParam(req)
	}

	if id == "" || id == "0" {
		return advFail("广告ID不得为空！")
	}
	if !advNumeric(id) {
		return advFail("格式错误！")
	}
	idNum, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		return noData
	}

	var (
		cla, advTitle, body sql.NullString
		start, end, state   sql.NullString
	)
	err = s.db.QueryRowContext(ctx, "SELECT `class`, `title`, `starttime`, `endtime`, `body`, `state` FROM "+s.advTable+" WHERE `id` = ?", idNum).
		Scan(&cla, &advTitle, &start, &end, &body, &state)
	if err != nil {
		return noData
	}
	if !eqOne(state) {
		return advFail("广告已隐藏！")
	}
	date := float64(s.now().Unix()) // GetMkTime(time())，站点时区 Etc/GMT-8 下即当前 Unix 时间
	if st := phpNum(start); date < st && truthy(start) {
		return advFail("广告还未开始！")
	}
	if en := phpNum(end); date > en && truthy(end) {
		return advFail("广告已结束！")
	}

	claNum := int(phpIntval(cla.String))
	cl := newClient(req)
	opts := s.options(req, cl)
	b := &advBuilder{s: s, ctx: ctx, cl: cl, opts: opts, base: s.base(ctx, opts), title: advTitle.String}

	obj := ordObj{{"id", idNum}, {"class", int64(claNum)}, {"advTitle", advTitle.String}}
	obj = append(obj, b.build(claNum, strings.Split(body.String, "$$"), false)...)

	// 分站覆盖：命中 advlist_city 就打掉整个 $adlist 重建（头部同结构，class 2 缺 appFullScreen，pic 缺 link）。
	// getCityId() 在 ajax 直调下只剩 param cityid。
	if cityid := phpIntval(convertIDValue(req, "cityid")); cityid != 0 {
		var cityBody sql.NullString
		err := s.db.QueryRowContext(ctx, "SELECT `body` FROM "+s.advCityTable+" WHERE `aid` = ? AND `cityid` = ?", idNum, cityid).Scan(&cityBody)
		if err == nil {
			obj = ordObj{{"id", idNum}, {"class", int64(claNum)}, {"advTitle", advTitle.String}}
			obj = append(obj, b.build(claNum, strings.Split(cityBody.String, "$$"), true)...)
		}
	}
	return ajax.Response{State: ajax.StateOK, Info: obj}
}

// advFail 是 PHP 的 array("state"=>200,"info"=>...)，handlers 改写成 101。
func advFail(info string) ajax.Response { return ajax.Response{State: 101, Info: info} }

// ---- 参数 ----

// convertIDParam 复刻 ajax.php 对 id 的 convertArrToStrWithComma。
func convertIDParam(req *ajax.Request) string { return convertIDValue(req, "id") }

func convertIDValue(req *ajax.Request, key string) string {
	if arr, ok := req.Params[key+"[]"]; ok && len(arr) > 0 {
		out := make([]string, len(arr))
		for i, v := range arr {
			out[i] = strconv.FormatInt(phpIntval(v), 10)
		}
		return strings.Join(out, ",")
	}
	v := req.Params.Get(key)
	if v == "" || v == "pricePlaceholder" || strings.Contains(v, "Placeholder") {
		return ""
	}
	if strings.Contains(v, ",") {
		parts := strings.Split(v, ",")
		for i, p := range parts {
			parts[i] = strconv.FormatInt(phpIntval(p), 10)
		}
		return strings.Join(parts, ",")
	}
	n := phpIntval(v)
	if n == 0 {
		return ""
	}
	return strconv.FormatInt(n, 10)
}

var (
	phpIntRe     = regexp.MustCompile(`^[ \t\n\r\v\f]*[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?`)
	advNumericRe = regexp.MustCompile(`^[ \t\n\r\v\f]*[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?[ \t\n\r\v\f]*$`)
)

// phpIntval 复刻 (int)"字符串"：取前缀数字，小数/科学计数法先转浮点再截断。
func phpIntval(s string) int64 {
	m := phpIntRe.FindString(s)
	if m == "" {
		return 0
	}
	f, err := strconv.ParseFloat(strings.TrimSpace(m), 64)
	if err != nil || math.IsNaN(f) {
		return 0
	}
	if f >= math.MaxInt64 || f <= math.MinInt64 {
		return 0
	}
	return int64(f)
}

func advNumeric(s string) bool { return advNumericRe.MatchString(s) }

// phpNum 复刻整数与数字字符串的比较口径（非数字当 0，NULL 当 0）。
func phpNum(v sql.NullString) float64 {
	if !v.Valid {
		return 0
	}
	m := phpIntRe.FindString(v.String)
	if m == "" {
		return 0
	}
	f, _ := strconv.ParseFloat(strings.TrimSpace(m), 64)
	return f
}

// phpHTMLSpecialChars 复刻 PHP 7.4 默认的 htmlspecialchars（ENT_COMPAT：不转单引号）。
var specialChars = strings.NewReplacer("&", "&amp;", `"`, "&quot;", "<", "&lt;", ">", "&gt;")

func phpHTMLSpecialChars(s string) string { return specialChars.Replace(s) }

// ---- 有序对象 ----

type advField struct {
	K string
	V any
}

// ordObj 保持 PHP 数组的键序输出 JSON。
type ordObj []advField

func (o ordObj) MarshalJSON() ([]byte, error) {
	var buf bytes.Buffer
	buf.WriteByte('{')
	for i, f := range o {
		if i > 0 {
			buf.WriteByte(',')
		}
		k, _ := json.Marshal(f.K)
		buf.Write(k)
		buf.WriteByte(':')
		var vb bytes.Buffer
		enc := json.NewEncoder(&vb)
		enc.SetEscapeHTML(false)
		if err := enc.Encode(f.V); err != nil {
			return nil, err
		}
		buf.Write(bytes.TrimRight(vb.Bytes(), "\n"))
	}
	buf.WriteByte('}')
	return buf.Bytes(), nil
}

// ---- 按 class 组装 ----

type advBuilder struct {
	s     *Service
	ctx   context.Context
	cl    client
	opts  fburl.Options
	base  string
	title string
}

// at 取 explode 结果的第 i 项；越界在 PHP 里是 null（notice），JSON 输出 null。
func at(parts []string, i int) any {
	if i < len(parts) {
		return parts[i]
	}
	return nil
}

func atStr(parts []string, i int) string {
	if i < len(parts) {
		return parts[i]
	}
	return ""
}

func atInt(parts []string, i int) int64 { return phpIntval(atStr(parts, i)) }

// link 复刻三条改写规则 + APP 端补域名；原值为 null 时保持 null。
func (b *advBuilder) link(parts []string, i int) any {
	if i >= len(parts) {
		return nil
	}
	l := parts[i]
	app := b.cl.isApp()
	switch {
	case app && strings.Contains(l, "miniProgramLive_"):
		l = b.base + "/include/json.php?action=getMiniProgramLive&id=" + strings.ReplaceAll(l, "miniProgramLive_", "")
	case app && strings.Contains(l, "wxMiniprogram://"):
		l = b.base + "/include/json.php?action=openWxMiniProgram&param=" + l
	case !b.cl.isWxMiniprogram() && strings.Contains(l, "openxcx_"):
		l = b.base + "/include/json.php?action=getWxMiniProgram"
	}
	if app && strings.HasPrefix(l, "/") {
		l = b.base + l
	}
	return l
}

// realFile 是 getRealFilePath（#330 internal/fburl）。src/turl 在对比用例里按裁决 A 忽略。
func (b *advBuilder) realFile(v any) string {
	p, _ := v.(string)
	if p == "" {
		return ""
	}
	if b.s.files == nil {
		return p
	}
	u, err := b.s.files.RealFile(b.ctx, p, true, true, b.opts)
	if err != nil {
		return ""
	}
	return u
}

func (b *advBuilder) build(cla int, body []string, city bool) ordObj {
	var o ordObj
	add := func(k string, v any) { o = append(o, advField{k, v}) }
	mark := b.s.advMarkState
	pos := b.s.advMarkPostion

	switch cla {
	case 1:
		typ := body[0]
		add("type", typ)
		switch typ {
		case "code":
			add("body", at(body, 1))
			add("mark", atInt(body, 2))
		case "text":
			add("title", at(body, 1))
			add("color", at(body, 2))
			add("link", b.link(body, 3))
			add("size", atInt(body, 4))
			add("mark", atInt(body, 5))
		case "pic":
			add("src", b.realFile(at(body, 1)))
			add("turl", b.realFile(at(body, 1)))
			l := b.link(body, 2)
			add("href", l)
			if !city { // 分站版没有 link 键
				add("link", l)
			}
			add("title", at(body, 3))
			add("width", atInt(body, 4))
			add("height", atInt(body, 5))
			add("mark", atInt(body, 6))
			add("advMarkState", int64(mark))
			add("advMarkPostion", int64(pos))
			add("markState", atInt(body, 6))
		case "flash":
			add("src", at(body, 1))
			add("width", atInt(body, 2))
			add("height", atInt(body, 3))
			add("mark", atInt(body, 4))
		}
	case 2:
		add("width", atInt(body, 0))
		add("height", atInt(body, 1))
		list := []ordObj{}
		for _, v := range strings.Split(atStr(body, 2), "||") {
			bod := strings.Split(v, "##")
			l := b.link(bod, 2)
			// 苹果端 APP 给招聘求职广告位的链接追加全屏关键字（分站版没有这段）。
			if !city && b.cl.isIOSApp() && strings.Contains(b.title, "招聘求职") {
				ls, _ := l.(string)
				if strings.Contains(ls, "?") {
					ls += "&appFullScreen"
				} else {
					ls += "?appFullScreen"
				}
				l = ls
			}
			list = append(list, ordObj{
				{"src", b.realFile(at(bod, 0))},
				{"turl", b.realFile(at(bod, 0))},
				{"title", at(bod, 1)},
				{"link", l},
				{"url", l},
				{"desc", at(bod, 3)},
				{"mark", atInt(bod, 4)},
				{"advMarkState", int64(mark)},
				{"advMarkPostion", int64(pos)},
				{"markState", atInt(bod, 4)},
			})
		}
		add("list", list)
	case 3:
		add("time", atInt(body, 0))
		add("width", atInt(body, 1))
		add("link", at(body, 2))
		add("large", at(body, 3))
		add("largeHeight", atInt(body, 4))
		add("small", at(body, 5))
		add("smallHeight", atInt(body, 6))
		add("mark", atInt(body, 7))
	case 4:
		add("width", atInt(body, 0))
		add("adwidth", atInt(body, 1))
		add("adheight", atInt(body, 2))
		add("topheight", atInt(body, 3))
		side := func(i int) ordObj {
			p := strings.Split(atStr(body, i), "##")
			return ordObj{{"src", at(p, 0)}, {"link", at(p, 1)}, {"title", at(p, 2)}, {"mark", atInt(p, 3)}}
		}
		add("left", side(4))
		add("right", side(5))
	case 5:
		add("body", body)
	case 6:
		add("body", strings.ReplaceAll(body[0], `"/include/attachment.php`, `"`+b.base+`/include/attachment.php`))
		add("link", at(body, 1))
	}
	return o
}
