package siteconfig

// touchHomePageFooter 迁移自 webroot/api/handlers/siteConfig.class.php:2898-4302，
// 业务规则见 issue #254「业务规则：siteConfig.touchHomePageFooter」评论（与源码冲突处以源码为准）。
//
// 结构：无登录门禁、无写操作、无错误出口——任何参数组合都返回 state=100 + 菜单数组
// （102/101 在本 action 不可达）。决定菜单来源的 4 层：
//
//	第 0 层（2921-2925）：SELECT * FROM #@__app_config LIMIT 1（无 ORDER BY）→
//	    customBottomButton 非空才 unserialize，否则空数组；查不到行时变量按 falsy 处理。
//	第 1 层（2952-2959）：platform 非空且非 default 时，用**终端**下标覆盖整个
//	    $customBottomButton（不是模块下标！）；覆盖结果为空且 isApp() 时回退 ['app']。
//	    现状照搬：只要传了 platform，自定义菜单就整体失效（疑似 bug，见报备 1）。
//	第 2 层（2961-4259）：version == '2.0' 三选一——平铺 100 项 / 模块自定义（cart→shop）
//	    / 32 个模块硬编码 + 兜底；硬编码分支里才把 android/ios/harmony 折叠成 'app'（3040）。
//	第 3 层（4261-4294）：version != '2.0' 固定 5 项，文案取 $langData['siteConfig']（zh-CN）。
//
// 已知偏差（有意为之，不是疏漏）：
//   - 传 platform 会整体关掉自定义菜单：第 1 层行为照搬，不「顺手修好」（报备 1）；
//   - paotui 死代码照搬：2916 已把 module 重写成 waimai，3424 的 elseif('paotui') 永远
//     不命中，这里保留成注释标注的不可达分支（报备 2）；
//   - cartNum：shop.getCartList 未迁移，匿名实测 state != 100 → 恒 0（报备 3 / 规则评论 §7）；
//   - isIOSApp() 是纯 UA 判定，对比工具用 Go 默认 UA 时两边都判 false，所以 iOS 的
//     code 分支只能 L1 覆盖（规则评论 §3）；
//   - member 链接：fburl.URL 对 service=member 返回 ErrUnsupported（#330 范围外），
//     这里按 getUrlPath 的 member 分支（common.func.php:4859-4991）本地复刻，域名部分
//     复刻 member.config 的 userDomain/busiDomain（member.class.php:73-94）+
//     $cfg_userSubDomain/$cfg_busiSubDomain（Dep 注入，canary member.inc.php = 2/2）；
//   - article/tieba/job 的 App 端原生页链接改写（fburl 判 IsApp/IsAndroidApp 时返回
//     ErrUnsupported）：App UA 下这些 url 输出空串，PHP 会输出完整链接；
//   - RemoveXSS / removeInvisibleCharacters 等入口清洗未复刻（同 adv 的口径）；
//   - $customBottomButton 反序列化成非数组标量时，PHP 的字符串下标边缘行为未复刻，
//     一律按「无自定义菜单」处理。

import (
	"context"
	"database/sql"
	"math"
	"net"
	"strconv"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/fburl"
)

// iOS 端暂不支持的原生页面 code 列表（2972/3016/4210 的同一串 || 链）。
var iosBlockedCodes = map[string]bool{
	"fabu": true, "info": true, "sfcar": true, "tieba": true, "circle": true,
	"circle_topic": true, "shop": true, "shop_category": true, "job": true, "user_center": true,
}

// fbP 是 fburl.Param 的简写。
func fbP(k, v string) fburl.Param { return fburl.Param{Key: k, Value: v} }

// fbGet / fbDel 是 fburl.Params 的取值与删除（Params 的 lookup/del 未导出，包内自己补一份）。
func fbGet(p fburl.Params, k string) string {
	for _, kv := range p {
		if kv.Key == k {
			return kv.Value
		}
	}
	return ""
}

func fbDel(p fburl.Params, k string) fburl.Params {
	out := make(fburl.Params, 0, len(p))
	for _, kv := range p {
		if kv.Key == k {
			continue
		}
		out = append(out, kv)
	}
	return out
}

// touchHomePageFooter 是 siteConfig.touchHomePageFooter 的 Go 实现。
func (s *Service) touchHomePageFooter(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	cl := newClient(req)
	opts := s.options(req, cl)

	version := req.Params.Get("version")
	module := req.Params.Get("module")
	if phpEmpty(module) { // $param['module'] ? ... : 'siteConfig'（PHP "0" 也是空）
		module = "siteConfig"
	}
	// 2916-2918：paotui → waimai，重写发生在所有分支之前（3424 的 paotui 硬编码分支因此是死代码）。
	if module == "paotui" {
		module = "waimai"
	}
	platform := req.Params.Get("platform")
	def := phpIntval(req.Params.Get("default")) != 0 // (int)$param['default']，非 0 = 强制默认数据

	// $tplDir 恒为 $cfg_secureAccess.$cfg_basehost."/static/"（2910，$tplDir 在函数内从未赋值）。
	base := s.base(ctx, opts)
	tplDir := base + "/static/"
	iosIndex := base // $ios_index = $cfg_secureAccess.$cfg_basehost（2920）

	// ---- 第 0 层：读一次 app_config（2921-2925） ----
	var cb any // $customBottomButton；nil 表示空数组 / 未定义 / unserialize 失败
	if s.db != nil {
		if raw := s.appConfigValue(ctx, "customBottomButton"); truthy(raw) {
			if arr, ok := cbParse(raw.String); ok {
				cb = arr
			}
		}
	}

	// 未指定终端的，判断 userAgent（2928-2949）；判不出保持空串。
	if phpEmpty(platform) {
		switch {
		case cl.isAndroidApp():
			platform = "android"
		case cl.isIOSApp():
			platform = "ios"
		case cl.isHarmonyApp():
			platform = "harmony"
		case cl.isWxMiniprogram():
			platform = "wxmini"
		case cl.isByteMiniprogram():
			platform = "dymini"
		}
	}

	// ---- 第 1 层：platform 用终端下标覆盖 $customBottomButton（2952-2959，关键坑） ----
	if platform != "" && !def {
		if m, ok := cb.(*cbArr); ok {
			sub := m.get(platform)
			if !cbTruthy(sub) && cl.isApp() {
				cb = m.get("app")
			} else {
				cb = sub
			}
		}
	}

	var menu any
	if version == "2.0" { // 严格等于 '2.0' 才走新版
		if m, ok := cb.(*cbArr); ok && m.count() == 100 && module == "siteConfig" && !def {
			// 平铺 100 项（2962-2987）：直接把 100 项当菜单，不走模块键。
			menu = phpMenu(m, s.touchFlatMenu(ctx, m, cl, opts))
		} else {
			// 调用指定模块的（2990-2996）：商城购物车特殊处理，cart → shop。
			if module == "cart" {
				module = "shop"
			}
			if m, ok := cb.(*cbArr); ok && cbTruthy(m.get(module)) && !def {
				// 模块自定义菜单（2997-3033）。
				menu = phpMenu(m.get(module), s.touchCustomModuleMenu(ctx, m.get(module), module, cl, opts))
			} else {
				menu = s.touchHardcodeMenu(ctx, module, platform, cl, opts, tplDir, iosIndex, cb, def)
			}
		}
	} else {
		// 旧版（4261-4294）：固定 5 项，不看 platform、不看 module。
		menu = s.touchOldMenu(ctx, opts, tplDir, iosIndex)
	}
	return ajax.Response{State: ajax.StateOK, Info: menu}
}

// appConfigValue 读 app_config 第一行的指定列（PHP SELECT * 后取 $ret[0][col]；
// 2921 无 ORDER BY，多行时取到哪行与 MySQL 返回顺序一致，这里同构 LIMIT 1）。
func (s *Service) appConfigValue(ctx context.Context, col string) sql.NullString {
	rows, err := s.db.QueryContext(ctx, "SELECT * FROM "+s.appConfigTable+" LIMIT 1")
	if err != nil {
		return sql.NullString{}
	}
	defer rows.Close()
	cols, err := rows.Columns()
	if err != nil {
		return sql.NullString{}
	}
	if !rows.Next() {
		return sql.NullString{}
	}
	vals := make([]sql.NullString, len(cols))
	ptrs := make([]any, len(cols))
	for i := range vals {
		ptrs[i] = &vals[i]
	}
	if err := rows.Scan(ptrs...); err != nil {
		return sql.NullString{}
	}
	for i, c := range cols {
		if c == col {
			return vals[i]
		}
	}
	return sql.NullString{}
}

// ---- PHP unserialize（保序） ----

// cbKV 是 unserialize 数组的一个键值对；PHP 数组的插入序必须保留，
// 否则平铺 100 项 / 模块自定义的菜单顺序会乱（Go map 按键排序）。
type cbKV struct {
	Key string
	Val any
}

// cbArr 是保序的 PHP 数组（unserialize 结果）。
type cbArr struct {
	keys []string
	vals map[string]any
}

func (a *cbArr) get(k string) any {
	if a == nil {
		return nil
	}
	return a.vals[k]
}

func (a *cbArr) count() int {
	if a == nil {
		return 0
	}
	return len(a.keys)
}

func (a *cbArr) pairs() []cbKV {
	if a == nil {
		return nil
	}
	out := make([]cbKV, len(a.keys))
	for i, k := range a.keys {
		out[i] = cbKV{k, a.vals[k]}
	}
	return out
}

// cbParse 解析 serialize 串，顶层必须是数组；失败（PHP unserialize 返回 false）→ ok=false。
type cbParser struct {
	s string
	i int
}

func cbParse(raw string) (*cbArr, bool) {
	p := &cbParser{s: raw}
	v, ok := p.value()
	if !ok {
		return nil, false
	}
	a, _ := v.(*cbArr)
	return a, a != nil
}

func (p *cbParser) until(c byte) (string, bool) {
	j := strings.IndexByte(p.s[p.i:], c)
	if j < 0 {
		return "", false
	}
	out := p.s[p.i : p.i+j]
	p.i += j + 1
	return out, true
}

func (p *cbParser) expect(lit string) bool {
	if strings.HasPrefix(p.s[p.i:], lit) {
		p.i += len(lit)
		return true
	}
	return false
}

// value 与 phpunser.go 的规则一致（N/b/i/d/s/a），唯一差别：a 产出 *cbArr 保序。
func (p *cbParser) value() (any, bool) {
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
		arr := &cbArr{vals: make(map[string]any, n)}
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
			arr.keys = append(arr.keys, ks)
			arr.vals[ks] = val
		}
		return arr, p.expect("}")
	}
	return nil, false
}

// ---- PHP 语义小工具（unserialize 值） ----

// cbTruthy 复刻 PHP 对 unserialize 值的真值判断（含空数组为假）。
func cbTruthy(v any) bool {
	switch x := v.(type) {
	case nil:
		return false
	case bool:
		return x
	case int64:
		return x != 0
	case float64:
		return x != 0
	case string:
		return x != "" && x != "0"
	case *cbArr:
		return len(x.keys) > 0
	}
	return false
}

// cbStr 是 PHP 字符串上下文（拼接、strstr 等）的值转换。
func cbStr(v any) string {
	switch x := v.(type) {
	case nil:
		return ""
	case bool:
		if x {
			return "1"
		}
		return ""
	case int64:
		return strconv.FormatInt(x, 10)
	case float64:
		if x == math.Trunc(x) && math.Abs(x) < 1e15 {
			return strconv.FormatInt(int64(x), 10)
		}
		return strconv.FormatFloat(x, 'f', -1, 64)
	case string:
		return x
	}
	return ""
}

// cbJSON 把 unserialize 值转成 JSON 值：null 保持 null（如未配置的 miniPath/code）。
func cbJSON(v any) any {
	switch v.(type) {
	case nil:
		return nil
	case string, int64, float64, bool:
		return v
	default:
		return cbStr(v)
	}
}

// cbIntField 复刻 `$val['x'] ? (int)$val['x'] : 0`（fabu/message）。
func cbIntField(v any) int64 {
	if !cbTruthy(v) {
		return 0
	}
	switch x := v.(type) {
	case bool:
		if x {
			return 1
		}
		return 0
	case int64:
		return x
	case float64:
		return int64(x)
	case string:
		return phpIntval(x)
	}
	return 0
}

// phpMenu 把 (键, 项) 对还原成 PHP 数组的 JSON 形态：键为 0..n-1 连续数字 → JSON 数组，
// 否则 → JSON 对象（键为原键）；空数组 → []。
func phpMenu(sub any, items []ordObj) any {
	a, _ := sub.(*cbArr)
	keys := []string{}
	if a != nil {
		keys = a.keys
	}
	seq := true
	for i, k := range keys {
		if k != strconv.Itoa(i) {
			seq = false
			break
		}
	}
	if seq {
		out := make([]ordObj, 0, len(items))
		out = append(out, items...)
		return out
	}
	if len(keys) != len(items) { // 理论不可达：items 与 keys 一一对应
		return items
	}
	o := make(ordObj, 0, len(items))
	for i, it := range items {
		o = append(o, advField{keys[i], it})
	}
	return o
}

// ---- 自定义菜单生成器 ----

// fileField 复刻 `$val['icon'] ? getFilePath($val['icon']) : ”`。
func (s *Service) fileField(ctx context.Context, v any, o fburl.Options) string {
	if !cbTruthy(v) {
		return ""
	}
	return s.filePath(ctx, cbStr(v), o)
}

// touchFlatMenu 是平铺 100 项分支（2963-2986）。9 键恒存在；此分支 module 恒为
// siteConfig，触不到 shop 的 cartNum 判断，cartNum 恒 0（shop.getCartList 未迁移，报备 4）。
func (s *Service) touchFlatMenu(ctx context.Context, m *cbArr, cl client, opts fburl.Options) []ordObj {
	out := make([]ordObj, 0, m.count())
	for _, kv := range m.pairs() {
		val, _ := kv.Val.(*cbArr)
		// 2972：只有 iOS 过滤，无收尾覆盖。
		var code any
		if cl.isIOSApp() && iosBlockedCodes[cbStr(val.get("code"))] {
			code = ""
		} else {
			code = cbJSON(val.get("code"))
		}
		out = append(out, ordObj{
			{"name", cbJSON(val.get("name"))},
			{"icon", s.fileField(ctx, val.get("icon"), opts)},
			{"icon_h", s.fileField(ctx, val.get("icon_h"), opts)},
			{"url", cbJSON(val.get("url"))},
			{"miniPath", cbJSON(val.get("miniPath"))},
			{"fabu", cbIntField(val.get("fabu"))},
			{"message", cbIntField(val.get("message"))},
			{"code", code},
			{"cartNum", int64(0)},
		})
	}
	return out
}

// touchCustomModuleMenu 是模块自定义分支（2999-3032）。
// 9 键：miniPath 未配置时是显式 null（3012 无真值判断）；cartNum 对每一项都输出
// （3031 在 if 外）——issue 评论「仅 key==2 && shop 带 cartNum」与源码不符，以源码为准。
func (s *Service) touchCustomModuleMenu(ctx context.Context, sub any, module string, cl client, opts fburl.Options) []ordObj {
	arr, _ := sub.(*cbArr)
	out := make([]ordObj, 0, arr.count())
	for _, kv := range arr.pairs() {
		val, _ := kv.Val.(*cbArr)

		// 3001-3006：APP 端 URL 特殊处理，口径是 isApp()（UA）且 module != 'task'。
		var u any = cbJSON(val.get("url"))
		if cl.isApp() && module != "task" {
			sep := "?"
			if strings.Contains(cbStr(u), "?") {
				sep = "&"
			}
			u = cbStr(u) + sep + "appIndex=1"
		}

		// 3016：先算 shop/cart 特判 + iOS 过滤；3018 再收尾覆盖（iOS 恒 ''）。
		var code any
		if module == "shop" && strings.Contains(cbStr(u), "cart") && !cl.isIOSApp() {
			code = "cart"
		} else if cl.isIOSApp() && iosBlockedCodes[cbStr(val.get("code"))] {
			code = ""
		} else {
			code = cbJSON(val.get("code"))
		}
		if cl.isIOSApp() { // 3018：取消 iOS 端所有原生页面
			code = ""
		}

		o := ordObj{
			{"name", cbJSON(val.get("name"))},
			{"icon", s.fileField(ctx, val.get("icon"), opts)},
			{"icon_h", s.fileField(ctx, val.get("icon_h"), opts)},
			{"url", u},
			{"miniPath", cbJSON(val.get("miniPath"))},
			{"fabu", cbIntField(val.get("fabu"))},
			{"message", cbIntField(val.get("message"))},
			{"code", code},
		}
		// 3020-3031：cartNum 键对每一项都执行（`$key == 2 && $module == 'shop'` 只在购物车项
		// 调 shop.getCartList，未迁移且匿名 state != 100 → 0），所以这里恒 0。
		o = append(o, advField{"cartNum", int64(0)})
		out = append(out, o)
	}
	return out
}

// touchCustomSiteConfigMenu 是兜底分支里的 siteConfig 自定义菜单（4192-4214）。
// 7 键：无 miniPath、无 cartNum；URL 追加口径是折叠后的 platform == 'app'（4199）；
// 4210 算出的 code 被 4212 无条件覆盖（非 iOS → $val['code'] 原值，iOS → ”）。
func (s *Service) touchCustomSiteConfigMenu(ctx context.Context, sub any, platform string, cl client, opts fburl.Options) []ordObj {
	arr, _ := sub.(*cbArr)
	out := make([]ordObj, 0, arr.count())
	for _, kv := range arr.pairs() {
		val, _ := kv.Val.(*cbArr)

		var u any = cbJSON(val.get("url"))
		if platform == "app" {
			sep := "?"
			if strings.Contains(cbStr(u), "?") {
				sep = "&"
			}
			u = cbStr(u) + sep + "appIndex=1"
		}

		var code any
		if cl.isIOSApp() {
			code = ""
		} else {
			code = cbJSON(val.get("code"))
		}

		out = append(out, ordObj{
			{"name", cbJSON(val.get("name"))},
			{"icon", s.fileField(ctx, val.get("icon"), opts)},
			{"icon_h", s.fileField(ctx, val.get("icon_h"), opts)},
			{"url", u},
			{"fabu", cbIntField(val.get("fabu"))},
			{"message", cbIntField(val.get("message"))},
			{"code", code},
		})
	}
	return out
}

// ---- 硬编码菜单（3036-4258） ----

// touchItem 是硬编码菜单的一项；键序固定 name, icon_h, icon, url, [miniPath],
// fabu, message, code, [cartNum]（注意 icon_h 在 icon 之前）。
type touchItem struct {
	name, iconH, icon, url string
	miniPath               string
	hasMini                bool
	fabu, message          int64
	code                   string
	cartNum                int64
	hasCart                bool
}

func (it touchItem) ord() ordObj {
	o := ordObj{
		{"name", it.name}, {"icon_h", it.iconH}, {"icon", it.icon}, {"url", it.url},
	}
	if it.hasMini {
		o = append(o, advField{"miniPath", it.miniPath})
	}
	o = append(o, advField{"fabu", it.fabu}, advField{"message", it.message}, advField{"code", it.code})
	if it.hasCart {
		o = append(o, advField{"cartNum", it.cartNum})
	}
	return o
}

func touchMenu(items ...touchItem) []ordObj {
	out := make([]ordObj, 0, len(items))
	for _, it := range items {
		out = append(out, it.ord())
	}
	return out
}

// touchHardcodeMenu 是 2.0 版的硬编码菜单分支（3036-4258），含兜底。
func (s *Service) touchHardcodeMenu(ctx context.Context, module, platform string, cl client, opts fburl.Options,
	tplDir, iosIndex string, cb any, def bool) any {

	// 3036-3040：域名中不需要分站信息 + 终端折叠（只有硬编码分支才折叠）。
	opts.DomainNoCity = true
	if platform == "android" || platform == "ios" || platform == "harmony" {
		platform = "app"
	}

	mod := module
	// ico 拼 $tplDir 相对路径 + "?v=" . $cfg_staticVersion（只有 2.0 版本图标带 ?v=）。
	ico := func(rel string) string { return tplDir + rel + "?v=" + s.staticVersion }
	ico2 := func(file string) string { return ico("images/touchHomePageFooter/2.0/" + mod + "/" + file) }
	// ap 是 `$platform == 'app' ? '...' : ''` 的参数尾巴。
	ap := func(s string) string {
		if platform == "app" {
			return s
		}
		return ""
	}
	// cc 是 `!isIOSApp() ? 'x' : ''` 的 code 口径（纯 UA 判定，与 platform 参数无关）。
	cc := func(c string) string {
		if cl.isIOSApp() {
			return ""
		}
		return c
	}
	u := func(kv ...fburl.Param) string { return s.getUrlPath(ctx, opts, fburl.Params(kv)) }

	switch module {
	case "article": // 资讯（3043-3084）
		return touchMenu(
			touchItem{"资讯", ico2("ficon1.png"), ico2("aficon1.png"),
				u(fbP("service", mod), fbP("param", ap("appIndex=1&appTitle"))),
				"/pages/packages/article/index/index", true, 0, 0, cc("article"), 0, false},
			touchItem{"媒体号", ico2("ficon2.png"), ico2("aficon2.png"),
				u(fbP("service", mod), fbP("template", "index"), fbP("param", "type=media"+ap("&appIndex=1"))),
				"/pages/packages/article/index/index?type=media", true, 0, 0, cc("article_media"), 0, false},
			touchItem{"发布", ico2("ficon3.png"), ico2("aficon3.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "fabu"),
					fbP("module", mod), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 1, 0, cc("fabu"), 0, false},
			touchItem{"消息", ico2("ficon4.png"), ico2("aficon4.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "message"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"/pages/member/message/index?module=" + mod, true, 0, 1, "", 0, false},
			touchItem{"我的", ico2("ficon5.png"), ico2("aficon5.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "index_article"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"", false, 0, 0, "", 0, false},
		)

	case "info": // 二手信息（3088-3129）
		return touchMenu(
			touchItem{"信息", ico2("ficon1.png"), ico2("aficon1.png"),
				u(fbP("service", mod), fbP("param", ap("appIndex=1&appTitle"))),
				"/pages/packages/info/index/index", true, 0, 0, cc("info"), 0, false},
			touchItem{"分类", ico2("ficon2.png"), ico2("aficon2.png"),
				u(fbP("service", mod), fbP("template", "category"), fbP("param", ap("appIndex=1&appTitle"))),
				"/pages/packages/info/category/category", true, 0, 0, "", 0, false},
			touchItem{"发布", ico2("ficon3.png"), ico2("aficon3.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "fabu"),
					fbP("module", mod), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 1, 0, "", 0, false},
			touchItem{"消息", ico2("ficon4.png"), ico2("aficon4.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "message"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"/pages/member/message/index?module=" + mod, true, 0, 1, "", 0, false},
			touchItem{"我的", ico2("ficon5.png"), ico2("aficon5.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "index_info"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"", false, 0, 0, "", 0, false},
		)

	case "house": // 房产门户（3133-3172）
		return touchMenu(
			touchItem{"房产", ico2("ficon1.png"), ico2("aficon1.png"),
				u(fbP("service", mod), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, cc("house"), 0, false},
			touchItem{"地图找房", ico2("ficon2.png"), ico2("aficon2.png"),
				u(fbP("service", mod), fbP("template", "map"), fbP("action", "loupan"),
					fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, "", 0, false},
			touchItem{"发布", ico2("ficon3.png"), ico2("aficon3.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "house"),
					fbP("param", ap("appIndex=1&appTitle"))) + "#fabu",
				"", false, 1, 0, "", 0, false},
			touchItem{"消息", ico2("ficon4.png"), ico2("aficon4.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "message"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"/pages/member/message/index?module=" + mod, true, 0, 1, "", 0, false},
			touchItem{"我的", ico2("ficon5.png"), ico2("aficon5.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "index_house"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"", false, 0, 0, "", 0, false},
		)

	case "job": // 招聘求职（3176-3209）：图标是 active_N / default_N
		return touchMenu(
			touchItem{"招聘", ico2("active_1.png"), ico2("default_1.png"),
				u(fbP("service", mod), fbP("param", ap("appIndex=1&appFullScreen=1"))),
				"/pages/packages/job/index/index", true, 0, 0, cc("job"), 0, false},
			touchItem{"面试日程", ico2("active_2.png"), ico2("default_2.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "job-invitation")),
				"", false, 0, 0, "", 0, false},
			touchItem{"消息", ico2("active_3.png"), ico2("default_3.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "message"),
					fbP("param", "module=job"+ap("&appIndex=1&appFullScreen"))),
				"/pages/member/message/index?module=" + mod, true, 0, 1, "", 0, false},
			touchItem{"我的", ico2("active_4.png"), ico2("default_4.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "index_job"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"", false, 0, 0, "", 0, false},
		)

	case "zhaopin": // 城市招聘（3213-3256）
		return touchMenu(
			touchItem{"首页", ico2("ficon1.png"), ico2("aficon1.png"),
				u(fbP("service", mod), fbP("param", ap("appIndex=1&appFullScreen=1"))),
				"/pages/packages/zhaopin/index/index", true, 0, 0, cc("zhaopin"), 0, false},
			touchItem{"职位", ico2("ficon2.png"), ico2("aficon2.png"),
				u(fbP("service", mod), fbP("template", "job-list")),
				"/pages/packages/zhaopin/qzJobList/qzJobList", true, 0, 0, "", 0, false},
			touchItem{"公司", ico2("ficon3.png"), ico2("aficon3.png"),
				u(fbP("service", mod), fbP("template", "company-list")),
				"/pages/packages/zhaopin/companyList/companyList", true, 0, 0, "", 0, false},
			touchItem{"消息", ico2("ficon4.png"), ico2("aficon4.png"),
				u(fbP("service", mod), fbP("template", "msg-list")),
				"/pages/packages/zhaopin_center/zp_center/msgList/msgList", true, 0, 1, "", 0, false},
			touchItem{"我的", ico2("ficon5.png"), ico2("aficon5.png"),
				u(fbP("service", mod), fbP("template", "u_center")),
				"/pages/packages/zhaopin_center/zp_center/index/index", true, 0, 0, "", 0, false},
		)

	case "tieba": // 贴吧社区（3260-3285）
		return touchMenu(
			touchItem{"贴吧", ico2("ficon1.png"), ico2("aficon1.png"),
				u(fbP("service", mod), fbP("param", ap("appIndex=1&appTitle"))),
				"/pages/packages/tieba/index/index", true, 0, 0, cc("tieba"), 0, false},
			touchItem{"发布", ico2("ficon2.png"), ico2("aficon2.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "fabu-tieba"),
					fbP("param", ap("appIndex=1&appTitle=1&appFabuTieba=1"))) + "#fabu",
				"", false, 1, 0, "", 0, false},
			touchItem{"我的", ico2("ficon3.png"), ico2("aficon3.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "index_tieba"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"", false, 0, 0, "", 0, false},
		)

	case "shop": // 在线商城（3289-3341）；源码 `|| $module == 'cart'` 不可达（2994 已重写）
		// 3293-3299：cartNum 来自 shop.getCartList，未迁移 → 匿名恒 0。
		cartNum := int64(0)
		return touchMenu(
			touchItem{"商城", ico2("ficon1.png"), ico2("aficon1.png"),
				u(fbP("service", mod), fbP("param", ap("appIndex=1&appTitle"))),
				"/pages/packages/shop/index/index", true, 0, 0, cc("shop"), 0, false},
			touchItem{"分类", ico2("ficon2.png"), ico2("aficon2.png"),
				u(fbP("service", mod), fbP("template", "category"), fbP("param", ap("appIndex=1&appTitle"))),
				"/pages/packages/shop/category/category", true, 0, 0, "", 0, false},
			touchItem{"购物车", ico2("ficon3.png"), ico2("aficon3.png"),
				u(fbP("service", mod), fbP("template", "cart"), fbP("param", ap("appIndex=1&appTitle"))),
				"/pages/packages/shop/cart/cart", true, 0, 0, cc("cart"), cartNum, true},
			touchItem{"消息", ico2("ficon4.png"), ico2("aficon4.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "message"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"/pages/member/message/index?module=" + mod, true, 0, 1, "", 0, false},
			touchItem{"我的", ico2("ficon5.png"), ico2("aficon5.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "index_shop"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"", false, 0, 0, "", 0, false},
		)

	case "education": // 教育培训（3345-3384）
		return touchMenu(
			touchItem{"教育", ico2("ficon1.png"), ico2("aficon1.png"),
				u(fbP("service", mod), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, cc("education"), 0, false},
			touchItem{"机构", ico2("ficon2.png"), ico2("aficon2.png"),
				u(fbP("service", mod), fbP("template", "store"), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, "", 0, false},
			touchItem{"家教", ico2("ficon3.png"), ico2("aficon3.png"),
				u(fbP("service", mod), fbP("template", "tutor"), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, "", 0, false},
			touchItem{"消息", ico2("ficon4.png"), ico2("aficon4.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "message"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"/pages/member/message/index?module=" + mod, true, 0, 1, "", 0, false},
			touchItem{"我的", ico2("ficon5.png"), ico2("aficon5.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "index_education"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"", false, 0, 0, "", 0, false},
		)

	case "waimai": // 美食外卖（3388-3420）
		return touchMenu(
			touchItem{"外卖", ico2("ficon1.png"), ico2("aficon1.png"),
				u(fbP("service", mod), fbP("param", ap("appIndex=1&appTitle"))),
				"/pages/packages/waimai/index/index", true, 0, 0, cc("waimai"), 0, false},
			touchItem{"跑腿", ico2("ficon2.png"), ico2("aficon2.png"),
				u(fbP("service", mod), fbP("template", "paotui"), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, "", 0, false},
			touchItem{"订单", ico2("ficon3.png"), ico2("aficon3.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "order"),
					fbP("action", "waimai"), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, "", 0, false},
			touchItem{"我的", ico2("ficon4.png"), ico2("aficon4.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "index_waimai"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"", false, 0, 0, "", 0, false},
		)

	case "paotui": // 外卖跑腿（3424-3456）：死代码照搬——2916 已把 module 重写成 waimai，永不可达
		return touchMenu(
			touchItem{"外卖", ico2("ficon1.png"), ico2("aficon1.png"),
				u(fbP("service", "waimai"), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, cc("waimai"), 0, false},
			touchItem{"跑腿", ico2("ficon2.png"), ico2("aficon2.png"),
				u(fbP("service", "waimai"), fbP("template", "paotui"), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, "", 0, false},
			touchItem{"订单", ico2("ficon3.png"), ico2("aficon3.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "order"),
					fbP("action", "paotui"), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, "", 0, false},
			touchItem{"我的", ico2("ficon4.png"), ico2("aficon4.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("param", ap("appIndex=1&appFullScreen"))),
				"/pages/member/index/index?module=" + mod, true, 0, 0, "user_center", 0, false}, // 3454：字面量，不经 iOS 过滤
		)

	case "tuan": // 团购秒杀（3460-3494）
		return touchMenu(
			touchItem{"团购", ico2("ficon1.png"), ico2("aficon1.png"),
				u(fbP("service", mod), fbP("param", ap("appIndex=1&appTitle"))),
				"/pages/packages/tuan/index/index", true, 0, 0, cc("tuan"), 0, false},
			touchItem{"好店", ico2("ficon2.png"), ico2("aficon2.png"),
				u(fbP("service", mod), fbP("template", "haodian"), fbP("param", ap("appIndex=1&appTitle"))),
				"/pages/packages/tuan/haodian/haodian", true, 0, 0, "", 0, false},
			touchItem{"消息", ico2("ficon3.png"), ico2("aficon3.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "message"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"/pages/member/message/index?module=" + mod, true, 0, 1, "", 0, false},
			touchItem{"我的", ico2("ficon4.png"), ico2("aficon4.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "index_tuan"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"", false, 0, 0, "", 0, false},
		)

	case "huodong": // 同城活动（3498-3537）
		return touchMenu(
			touchItem{"活动", ico2("ficon1.png"), ico2("aficon1.png"),
				u(fbP("service", mod), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, cc("huodong"), 0, false},
			touchItem{"推荐", ico2("ficon2.png"), ico2("aficon2.png"),
				u(fbP("service", mod), fbP("template", "list"), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, "", 0, false},
			touchItem{"发布", ico2("ficon3.png"), ico2("aficon3.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "fabu-huodong"),
					fbP("param", ap("appIndex=1&appTitle"))) + "#fabu",
				"", false, 1, 0, "", 0, false},
			touchItem{"消息", ico2("ficon4.png"), ico2("aficon4.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "message"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"/pages/member/message/index?module=" + mod, true, 0, 1, "", 0, false},
			touchItem{"我的", ico2("ficon5.png"), ico2("aficon5.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "index_huodong"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"", false, 0, 0, "", 0, false},
		)

	case "pension": // 养老机构（3541-3573）
		return touchMenu(
			touchItem{"养老", ico2("ficon1.png"), ico2("aficon1.png"),
				u(fbP("service", mod), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, "", 0, false},
			touchItem{"地图", ico2("ficon2.png"), ico2("aficon2.png"),
				u(fbP("service", mod), fbP("template", "map"), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, "", 0, false},
			touchItem{"消息", ico2("ficon3.png"), ico2("aficon3.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "message"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"/pages/member/message/index?module=" + mod, true, 0, 1, "", 0, false},
			touchItem{"我的", ico2("ficon4.png"), ico2("aficon4.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "index_pension"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"", false, 0, 0, "", 0, false},
		)

	case "travel": // 在线旅游（3577-3609）
		return touchMenu(
			touchItem{"旅游", ico2("ficon1.png"), ico2("aficon1.png"),
				u(fbP("service", mod), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, cc("travel"), 0, false},
			touchItem{"订单", ico2("ficon2.png"), ico2("aficon2.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "order"),
					fbP("action", mod), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, "", 0, false},
			touchItem{"消息", ico2("ficon3.png"), ico2("aficon3.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "message"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"/pages/member/message/index?module=" + mod, true, 0, 1, "", 0, false},
			touchItem{"我的", ico2("ficon4.png"), ico2("aficon4.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "index_travel"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"", false, 0, 0, "", 0, false},
		)

	case "marry": // 婚嫁频道（3613-3639）
		return touchMenu(
			touchItem{"婚嫁", ico2("ficon1.png"), ico2("aficon1.png"),
				u(fbP("service", mod), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, cc("marry"), 0, false},
			touchItem{"消息", ico2("ficon2.png"), ico2("aficon2.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "message"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"/pages/member/message/index?module=" + mod, true, 0, 1, "", 0, false},
			touchItem{"我的", ico2("ficon3.png"), ico2("aficon3.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("param", ap("appIndex=1&appFullScreen"))),
				"/pages/member/index/index?module=" + mod, true, 0, 0, cc("user_center"), 0, false},
		)

	case "homemaking": // 家政服务（3643-3675）
		return touchMenu(
			touchItem{"家政", ico2("ficon1.png"), ico2("aficon1.png"),
				u(fbP("service", mod), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, cc("homemaking"), 0, false},
			touchItem{"订单", ico2("ficon2.png"), ico2("aficon2.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "order"),
					fbP("action", mod), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, "", 0, false},
			touchItem{"消息", ico2("ficon3.png"), ico2("aficon3.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "message"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"/pages/member/message/index?module=" + mod, true, 0, 1, "", 0, false},
			touchItem{"我的", ico2("ficon4.png"), ico2("aficon4.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "index_homemaking"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"", false, 0, 0, "", 0, false},
		)

	case "car": // 二手汽车（3679-3718）
		return touchMenu(
			touchItem{"汽车", ico2("ficon1.png"), ico2("aficon1.png"),
				u(fbP("service", mod), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, cc("car"), 0, false},
			touchItem{"公司", ico2("ficon2.png"), ico2("aficon2.png"),
				u(fbP("service", mod), fbP("template", "store"), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, "", 0, false},
			touchItem{"发布", ico2("ficon3.png"), ico2("aficon3.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "fabu"),
					fbP("action", "car"), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 1, 0, "", 0, false},
			touchItem{"消息", ico2("ficon4.png"), ico2("aficon4.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "message"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"/pages/member/message/index?module=" + mod, true, 0, 1, "", 0, false},
			touchItem{"我的", ico2("ficon5.png"), ico2("aficon5.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "index_car"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"", false, 0, 0, "", 0, false},
		)

	case "renovation": // 装修门户（3722-3754）：消息项的图标跳过了 ficon3（源码 3741-3742 就是 ficon4/aficon4）
		return touchMenu(
			touchItem{"装修", ico2("ficon1.png"), ico2("aficon1.png"),
				u(fbP("service", mod), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, "", 0, false},
			touchItem{"公司", ico2("ficon2.png"), ico2("aficon2.png"),
				u(fbP("service", mod), fbP("template", "company"), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, "", 0, false},
			touchItem{"消息", ico2("ficon4.png"), ico2("aficon4.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "message"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"/pages/member/message/index?module=" + mod, true, 0, 1, "", 0, false},
			touchItem{"我的", ico2("ficon5.png"), ico2("aficon5.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "index_renovation"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"", false, 0, 0, "", 0, false},
		)

	case "dating": // 互动交友（3758-3790）
		return touchMenu(
			touchItem{"交友", ico2("ficon1.png"), ico2("aficon1.png"),
				u(fbP("service", mod), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, "", 0, false},
			touchItem{"动态", ico2("ficon2.png"), ico2("aficon2.png"),
				u(fbP("service", mod), fbP("template", "dongtai"), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, "", 0, false},
			touchItem{"消息", ico2("ficon3.png"), ico2("aficon3.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "message"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"/pages/member/message/index?module=" + mod, true, 0, 1, "", 0, false},
			touchItem{"我的", ico2("ficon4.png"), ico2("aficon4.png"),
				u(fbP("service", mod), fbP("template", "my"), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, "", 0, false},
		)

	case "integral": // 积分商城（3794-3826）
		return touchMenu(
			touchItem{"积分", ico2("ficon1.png"), ico2("aficon1.png"),
				u(fbP("service", mod), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, "", 0, false},
			touchItem{"分类", ico2("ficon2.png"), ico2("aficon2.png"),
				u(fbP("service", mod), fbP("template", "category"), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, "", 0, false},
			touchItem{"排行榜", ico2("ficon3.png"), ico2("aficon3.png"),
				u(fbP("service", mod), fbP("template", "ranking"), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, "", 0, false},
			touchItem{"我的", ico2("ficon4.png"), ico2("aficon4.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("param", ap("appIndex=1&appFullScreen"))),
				"/pages/member/index/index?module=" + mod, true, 0, 0, cc("user_center"), 0, false},
		)

	case "circle": // 圈子动态（3830-3870）；源码 3838/3845 用 isIosApp()——PHP 函数名不区分大小写，同 isIOSApp
		return touchMenu(
			touchItem{"圈子", ico2("ficon1.png"), ico2("aficon1.png"),
				u(fbP("service", mod), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, cc("circle"), 0, false},
			touchItem{"话题", ico2("ficon2.png"), ico2("aficon2.png"),
				u(fbP("service", mod), fbP("param", ap("appIndex=1&appTitle"))) + "#4",
				"", false, 0, 0, cc("circle_topic"), 0, false},
			touchItem{"发布", ico2("ficon3.png"), ico2("aficon3.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "fabu_circle"),
					fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 1, 0, "", 0, false},
			touchItem{"消息", ico2("ficon4.png"), ico2("aficon4.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "message"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"/pages/member/message/index?module=" + mod, true, 0, 1, "", 0, false},
			touchItem{"我的", ico2("ficon5.png"), ico2("aficon5.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("param", ap("appIndex=1&appFullScreen"))),
				"/pages/member/index/index?module=" + mod, true, 0, 0, cc("user_center"), 0, false},
		)

	case "business": // 商家（3874-3913）
		return touchMenu(
			touchItem{"商家", ico2("ficon1.png"), ico2("aficon1.png"),
				u(fbP("service", mod), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, cc("business"), 0, false},
			touchItem{"推荐", ico2("ficon2.png"), ico2("aficon2.png"),
				u(fbP("service", mod), fbP("template", "list"), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, "", 0, false},
			touchItem{"入驻", ico2("ficon3.png"), ico2("aficon3.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "enter_contrast"),
					fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 1, 0, "", 0, false},
			touchItem{"消息", ico2("ficon4.png"), ico2("aficon4.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "message"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"/pages/member/message/index?module=" + mod, true, 0, 1, "", 0, false},
			touchItem{"我的", ico2("ficon5.png"), ico2("aficon5.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "index_business"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"", false, 0, 0, "", 0, false},
		)

	case "sfcar": // 顺风车（3917-3957）
		// 3932：源码数组里 'param' 出现两次（'module=sfcar' 被 3931 的第二个 param 覆盖），
		// PHP 后值胜出，这里只保留最后一个 param。
		return touchMenu(
			touchItem{"顺风车", ico2("ficon1.png"), ico2("aficon1.png"),
				u(fbP("service", mod), fbP("param", ap("appIndex=1&appTitle"))),
				"/pages/packages/sfcar/index/index", true, 0, 0, cc("sfcar"), 0, false},
			touchItem{"收藏", ico2("ficon2.png"), ico2("aficon2.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "collection"),
					fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, "", 0, false},
			touchItem{"发布", ico2("ficon3.png"), ico2("aficon3.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "fabu"),
					fbP("action", "sfcar"), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 1, 0, "", 0, false},
			touchItem{"消息", ico2("ficon4.png"), ico2("aficon4.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "message"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"/pages/member/message/index?module=" + mod, true, 0, 1, "", 0, false},
			touchItem{"我的", ico2("ficon5.png"), ico2("aficon5.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "index_sfcar"),
					fbP("param", ap("appTitle=1"))),
				"", false, 0, 0, "", 0, false},
		)

	case "huangye": // 黄页（3961-4001）
		return touchMenu(
			touchItem{"黄页", ico2("ficon1.png"), ico2("aficon1.png"),
				u(fbP("service", mod), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, "", 0, false},
			touchItem{"推荐", ico2("ficon2.png"), ico2("aficon2.png"),
				u(fbP("service", mod), fbP("template", "list"), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, "", 0, false},
			touchItem{"入驻", ico2("ficon3.png"), ico2("aficon3.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "enter_contrast"),
					fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 1, 0, "", 0, false},
			touchItem{"消息", ico2("ficon4.png"), ico2("aficon4.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "message"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"/pages/member/message/index?module=" + mod, true, 0, 1, "", 0, false},
			touchItem{"我的", ico2("ficon5.png"), ico2("aficon5.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("param", ap("appIndex=1&appFullScreen"))),
				"/pages/member/index/index?module=" + mod, true, 0, 0, cc("user_center"), 0, false},
		)

	case "live": // 直播（4005-4043）
		return touchMenu(
			touchItem{"首页", ico2("ficon1.png"), ico2("aficon1.png"),
				u(fbP("service", mod), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, "", 0, false},
			touchItem{"主播", ico2("ficon2.png"), ico2("aficon2.png"),
				u(fbP("service", mod), fbP("template", "anchorlist"), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, "", 0, false},
			touchItem{"发布", ico2("ficon3.png"), ico2("aficon3.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "fabu"),
					fbP("action", "live"), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 1, 0, "", 0, false},
			touchItem{"关注", ico2("ficon4.png"), ico2("aficon4.png"),
				u(fbP("service", mod), fbP("template", "myanchor"), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, "", 0, false},
			touchItem{"我的", ico2("ficon5.png"), ico2("aficon5.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "index_live"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"", false, 0, 0, "", 0, false},
		)

	case "vote": // 投票（4047-4073）
		return touchMenu(
			touchItem{"投票", ico2("ficon1.png"), ico2("aficon1.png"),
				u(fbP("service", mod), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, "", 0, false},
			touchItem{"消息", ico2("ficon2.png"), ico2("aficon2.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "message"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"/pages/member/message/index?module=vote", true, 0, 1, "", 0, false},
			touchItem{"我的", ico2("ficon3.png"), ico2("aficon3.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("param", ap("appIndex=1&appFullScreen"))),
				"/pages/member/index/index?module=" + mod, true, 0, 0, cc("user_center"), 0, false},
		)

	case "paimai": // 拍卖（4077-4110）：图标路径不带模块目录（4082/4089/4096/4104 硬编码）
		return touchMenu(
			touchItem{"拍卖", ico("images/touchHomePageFooter/2.0/ficon1.png"), ico("images/touchHomePageFooter/2.0/aficon1.png"),
				u(fbP("service", mod), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, "", 0, false},
			touchItem{"分类", ico("images/touchHomePageFooter/2.0/info/ficon2.png"), ico("images/touchHomePageFooter/2.0/info/aficon2.png"),
				u(fbP("service", mod), fbP("template", "category"), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, "", 0, false},
			touchItem{"消息", ico("images/touchHomePageFooter/2.0/ficon4.png"), ico("images/touchHomePageFooter/2.0/aficon4.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "message"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"/pages/member/message/index?module=paimai", true, 0, 1, "", 0, false},
			touchItem{"我的", ico("images/touchHomePageFooter/2.0/ficon5.png"), ico("images/touchHomePageFooter/2.0/aficon5.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("param", ap("appIndex=1&appFullScreen"))),
				"/pages/member/index/index?module=" + mod, true, 0, 0, cc("user_center"), 0, false},
		)

	case "task": // 任务悬赏（4114-4156）
		return touchMenu(
			touchItem{"首页", ico2("ficon1.png"), ico2("aficon1.png"),
				u(fbP("service", mod), fbP("param", ap("appIndex=1"))),
				"/pages/packages/task/index/index", true, 0, 0, "", 0, false},
			touchItem{"推荐", ico2("ficon2.png"), ico2("aficon2.png"),
				u(fbP("service", mod), fbP("template", "list"), fbP("param", ap("appTitle=1"))),
				"/pages/packages/task/list/list", true, 0, 0, "", 0, false},
			touchItem{"推广", ico2("ficon3.png"), ico2("aficon3.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "invite"),
					fbP("param", "module=task"+ap("&appIndex=1&appTitle=1"))),
				"", false, 0, 0, "", 0, false},
			touchItem{"消息", ico2("ficon4.png"), ico2("aficon4.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "message"),
					fbP("param", "module=task"+ap("&appIndex=1&appFullScreen"))),
				"/pages/member/message/index?module=task", true, 0, 1, "", 0, false},
			touchItem{"我的", ico2("ficon5.png"), ico2("aficon5.png"),
				u(fbP("service", mod), fbP("template", "my"), fbP("param", ap("appTitle=1"))),
				"/pages/packages/task/my/my", true, 0, 0, "", 0, false},
		)

	case "quanjing", "image", "video", "paper", "awardlegou": // VR全景等共用一支（4160-4186）：图标路径不带模块目录
		return touchMenu(
			touchItem{"首页", ico("images/touchHomePageFooter/2.0/ficon1.png"), ico("images/touchHomePageFooter/2.0/aficon1.png"),
				u(fbP("service", mod), fbP("param", ap("appIndex=1&appTitle"))),
				"", false, 0, 0, "", 0, false},
			touchItem{"消息", ico("images/touchHomePageFooter/2.0/ficon2.png"), ico("images/touchHomePageFooter/2.0/aficon2.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "message"),
					fbP("param", ap("appIndex=1&appFullScreen"))),
				"/pages/member/message/index?module=" + mod, true, 0, 1, "", 0, false},
			touchItem{"我的", ico("images/touchHomePageFooter/2.0/ficon5.png"), ico("images/touchHomePageFooter/2.0/aficon5.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("param", ap("appIndex=1&appFullScreen"))),
				"/pages/member/index/index?module=" + mod, true, 0, 0, cc("user_center"), 0, false},
		)

	default: // 其他模块（4190-4257）
		if m, ok := cb.(*cbArr); ok && cbTruthy(m.get("siteConfig")) && !def {
			// 4192-4214：siteConfig 自定义菜单。
			return phpMenu(m.get("siteConfig"), s.touchCustomSiteConfigMenu(ctx, m.get("siteConfig"), platform, cl, opts))
		}
		// 4217-4256：兜底默认菜单。
		return touchMenu(
			touchItem{"首页", ico("images/touchHomePageFooter/2.0/ficon1.png"), ico("images/touchHomePageFooter/2.0/aficon1.png"),
				iosIndex, // 4222：url 直接用 $ios_index，不走 getUrlPath
				"/pages/index/index", true, 0, 0, "", 0, false},
			touchItem{"圈子", ico("images/touchHomePageFooter/2.0/ficon2.png"), ico("images/touchHomePageFooter/2.0/aficon2.png"),
				u(fbP("service", "circle")) + "?from=app",
				"", false, 0, 0, cc("circle"), 0, false},
			touchItem{"发布", ico("images/touchHomePageFooter/2.0/ficon3.png"), ico("images/touchHomePageFooter/2.0/aficon3.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "fabuJoin_touch_popup_3.4"),
					fbP("param", ap("appIndex=1&appTitle=1"))),
				"", false, 1, 0, cc("fabu"), 0, false},
			touchItem{"消息", ico("images/touchHomePageFooter/2.0/ficon4.png"), ico("images/touchHomePageFooter/2.0/aficon4.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("template", "message"),
					fbP("param", ap("appIndex=1"))),
				"/pages/member/message/index", true, 0, 1, "", 0, false},
			touchItem{"我的", ico("images/touchHomePageFooter/2.0/ficon5.png"), ico("images/touchHomePageFooter/2.0/aficon5.png"),
				u(fbP("service", "member"), fbP("type", "user"), fbP("param", ap("appIndex=1"))),
				"/pages/member/index/index", true, 0, 0, cc("user_center"), 0, false},
		)
	}
}

// ---- 旧版菜单（4261-4294） ----

// touchOldMenu 是 version != '2.0' 的固定 5 项（4262-4293）；文案取 $langData['siteConfig']
// 的 zh-CN 字面量（webroot/include/lang/zh-CN/siteConfig.inc.php）：
// [0][0]=首页、[16][0]=同城圈、[11][0]=发布、[16][1]=逛附近、[10][0]=我的。
// 图标是 $tplDir."images/ficonN.png"——无 /2.0/、无 ?v=；键序 name, icon, icon_h, url。
func (s *Service) touchOldMenu(ctx context.Context, opts fburl.Options, tplDir, iosIndex string) []ordObj {
	u := func(kv ...fburl.Param) string { return s.getUrlPath(ctx, opts, fburl.Params(kv)) }
	item := func(name, n, url string) ordObj {
		return ordObj{
			{"name", name},
			{"icon", tplDir + "images/f" + n + ".png"},
			{"icon_h", tplDir + "images/af" + n + ".png"},
			{"url", url},
		}
	}
	return []ordObj{
		item("首页", "icon1", iosIndex), // 4267：url 直接用 $ios_index
		item("同城圈", "icon2", u(fbP("service", "siteConfig"), fbP("template", "tcquan"))),
		item("发布", "icon3", u(fbP("service", "siteConfig"), fbP("template", "post"))),
		item("逛附近", "icon4", u(fbP("service", "business"))),
		item("我的", "icon5", u(fbP("service", "member"), fbP("type", "user"))),
	}
}

// ---- getUrlPath（common.func.php:4437-5027 的本 action 所需子集） ----

// getUrlPath 复刻 PHP getUrlPath：member 分支本地复刻，其余走 fburl（#330）。
// cityid 只进 PHP 的缓存键，不影响输出；$domainNoCity 通过 Options.DomainNoCity 传入。
func (s *Service) getUrlPath(ctx context.Context, o fburl.Options, p fburl.Params) string {
	if fbGet(p, "service") == "member" {
		return s.memberURLPath(ctx, o, p)
	}
	if s.files == nil {
		return ""
	}
	u, err := s.files.URL(ctx, p, o)
	if err != nil {
		return ""
	}
	return u
}

// memberURLPath 复刻 getUrlPath 的 member 分支（common.func.php:4859-4991）+ 尾部拼接。
// member.config（member.class.php:35-112）未整体迁移，这里只复刻它用到的
// userDomain/busiDomain：getDomain('member', user|busi)（common.func.php:2913-2951，查
// #@__domain，无 state 过滤、无 ORDER BY）+ $cfg_userSubDomain/$cfg_busiSubDomain。
// member 强制走伪静态（common.func.php:4923/4935 的 `$cfg_urlRewrite || $service == "member"`）。
// 查不到 domain 行时 getDomain 返回空 domain、member.config 仍算成功（state 100），
// 所以「handler 失败 → $domain = base."/member"」的回退只在无 DB 时出现（Go 降级口径）。
func (s *Service) memberURLPath(ctx context.Context, o fburl.Options, p fburl.Params) string {
	base := s.base(ctx, o)
	host := o.Host
	if h, _, err := net.SplitHostPort(host); err == nil {
		host = h
	}

	params := p
	domain := ""
	success := s.db != nil
	if success {
		part := "busi"
		sub := s.busiSubDomain
		if fbGet(p, "type") == "user" {
			part = "user"
			sub = s.userSubDomain
		}
		var d sql.NullString
		err := s.db.QueryRowContext(ctx,
			"SELECT `domain` FROM "+s.domainTable+" WHERE `module` = 'member' AND `part` = ?", part).Scan(&d)
		if err != nil && err != sql.ErrNoRows {
			// 查询失败按空 domain 处理（getDomain 查不到行也返回空 domain，config 仍成功）。
		}
		row := ""
		if d.Valid {
			row = d.String
		}
		scheme := "http://"
		if strings.HasPrefix(base, "https://") {
			scheme = "https://"
		}
		switch sub {
		case 0:
			domain = scheme + row
		case 1:
			domain = scheme + row + "." + strings.ReplaceAll(host, "www.", "")
		default:
			domain = base + "/" + row
		}
		params = fbDel(p, "type") // 4888：成功路径 unset($params['type'])
	} else {
		domain = base + "/member" // 4891：handler 失败的回退（$cfg_secureAccess.$cfg_basehost."/".$service）
	}

	// param 要按 PHP 的 parse_str + http_build_query 口径重新编码（没写 `=` 的键补成 `k=`），
	// 与 fburl.URL 的动态分支同一口径；否则 `appIndex=1&appTitle` 会少一个尾 `=`。
	params = fburl.EncodeParam(params)

	after := ""
	if v := fbGet(params, "param"); v != "" && v != "0" {
		after = "?" + v
	}

	// 4916-4927：paramRewrite = 除 service/param（及 flag/redirecturl）外的全部值，按插入序。
	var rw []string
	for _, kv := range params {
		switch kv.Key {
		case "flag", "redirecturl", "service", "param":
			continue
		}
		rw = append(rw, kv.Value)
	}

	if len(rw) > 0 {
		template := fbGet(params, "template")
		prefix := ""
		if template == "chat" { // 4973：member chat 前缀 im/
			prefix = "im/"
		}
		ext := ".html"
		if template == "announcement-detail" {
			ext = ""
		}
		sep := "/"
		if strings.HasSuffix(domain, "/") {
			sep = ""
		}
		return domain + sep + prefix + strings.Join(rw, "-") + ext + after
	}
	// 4983：无 rewrite 值（如只传 service+type+param）→ domain + ($after ? '/' : '') + $after。
	sep := ""
	if !strings.HasSuffix(domain, "/") && after != "" {
		sep = "/"
	}
	return domain + sep + after
}
