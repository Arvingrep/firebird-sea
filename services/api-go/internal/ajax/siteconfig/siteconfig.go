// Package siteconfig 是 ajax.php 的 siteConfig 服务。
package siteconfig

import (
	"context"
	"database/sql"
	"fmt"
	"net"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/fburl"
)

// stateNoData / infoNoData：action 返回空数组时 handlers.class.php 固定包成 102 "No data!"（不是 101）。
const (
	stateNoData = 102
	infoNoData  = "No data!"
)

var prefixPattern = regexp.MustCompile(`^[A-Za-z0-9_]+$`)

// MemberResolver 识别当前会员，未登录返回 <=0。
type MemberResolver interface {
	MemberID(ctx context.Context, req *http.Request) (int64, error)
}

// Dep 是 siteConfig 服务的依赖。
type Dep struct {
	// DB 为 nil 时 siteModule 按「查不到数据」降级（102）。
	DB          *sql.DB
	TablePrefix string
	// Files 用于 getFilePath / getUrlPath / getDomainFullUrl。nil 时 icon 原样、url 的域名部分为空。
	Files *fburl.Resolver
	// Members 识别会员（homemaking.personal）。nil 一律按未登录。
	Members MemberResolver
	// SharePic / WebLogo / Hotline / StaticVersion 对应 PHP 的 $cfg_sharePic / $cfg_weblogo /
	// $cfg_hotline / $cfg_staticVersion（运行期站点配置，不在仓库里）。
	SharePic, WebLogo, Hotline, StaticVersion string
	// AdvMarkState / AdvMarkPostion 对应 $cfg_advMarkState / $cfg_advMarkPostion（adv 用）。
	AdvMarkState, AdvMarkPostion int
	// Now 为 nil 时用 time.Now，测试注入固定时间。
	Now func() time.Time
}

// Service 是 siteConfig 服务的实现。
type Service struct {
	db                                                 *sql.DB
	moduleTable, cityTable, appConfigTable, personalTb string
	files                                              *fburl.Resolver
	members                                            MemberResolver
	sharePic, webLogo, hotline, staticVersion          string
	advTable, advCityTable                             string
	advMarkState, advMarkPostion                       int
	now                                                func() time.Time
}

// New 校验依赖并预拼表名。
func New(dep Dep) (*Service, error) {
	if !prefixPattern.MatchString(dep.TablePrefix) {
		return nil, fmt.Errorf("siteconfig: TablePrefix %q 含非法字符", dep.TablePrefix)
	}
	p := dep.TablePrefix
	now := dep.Now
	if now == nil {
		now = time.Now
	}
	return &Service{
		advTable:       "`" + p + "advlist`",
		advCityTable:   "`" + p + "advlist_city`",
		advMarkState:   dep.AdvMarkState,
		advMarkPostion: dep.AdvMarkPostion,
		now:            now,
		db:             dep.DB,
		moduleTable:    "`" + p + "site_module`",
		cityTable:      "`" + p + "site_city`",
		appConfigTable: "`" + p + "app_config`",
		personalTb:     "`" + p + "homemaking_personal`",
		files:          dep.Files,
		members:        dep.Members,
		sharePic:       dep.SharePic,
		webLogo:        dep.WebLogo,
		hotline:        dep.Hotline,
		staticVersion:  dep.StaticVersion,
	}, nil
}

// Register 注册本服务的 action。s 为 nil 时只注册 ping。
func Register(router *ajax.Router, s *Service) {
	router.Register("siteConfig", "ping", ping)
	if s != nil {
		router.Register("siteConfig", "siteModule", s.siteModule)
		router.Register("siteConfig", "adv", s.adv)
	}
}

// ping 是兼容层的示例 action，只用于验证 /go-compat 入口，PHP 没有对应实现，不进白名单。
func ping(*ajax.Request) ajax.Response {
	return ajax.Response{State: ajax.StateOK, Info: "pong"}
}

// ---- 端识别（common.func.php:4292-4400、common.inc.php:1709-1760） ----

// client 是一次请求的端识别结果。
type client struct {
	ua          string // 小写
	query       string // 小写 QUERY_STRING
	tg          bool   // cookie HN_tg === '1'
	platformReq string // $_REQUEST['platform_name']
}

func newClient(req *ajax.Request) client {
	c := client{}
	if req.HTTP == nil {
		return c
	}
	c.ua = strings.ToLower(req.HTTP.UserAgent())
	if req.HTTP.URL != nil {
		c.query = strings.ToLower(req.HTTP.URL.RawQuery)
	}
	if ck, err := req.HTTP.Cookie("HN_tg"); err == nil && ck.Value == "1" {
		c.tg = true
	}
	c.platformReq = req.Params.Get("platform_name")
	return c
}

// 正则里带大写字母的分支（Nokia、Symbian、iPod、iPad、MQQBrowser、UCWEB、AppleWebKit……）
// 在 strtolower 之后永远匹配不上，历史行为不能"修"，所以这里只留小写子串。
var mobileNeedles = []string{"iphone", "ios", "android", "mini", "mobile", "mobi", "wp7", "wp8", "cfnetwork", "harmony"}

func (c client) isMobile() bool {
	if c.tg {
		return true
	}
	return containsAny(c.ua, mobileNeedles)
}

func (c client) isWxMiniprogram() bool {
	if strings.Contains(c.ua, "micromessenger") && (strings.Contains(c.ua, "wechatdevtools") || strings.Contains(c.ua, "miniprogram")) {
		return true
	}
	return c.platformReq == "wx_miniprogram"
}

func (c client) isBaiduMiniprogram() bool { return strings.Contains(c.ua, "swan-baiduboxapp") }

func (c client) isQqMiniprogram() bool {
	return strings.Contains(c.ua, "qq") && strings.Contains(c.ua, "miniprogram")
}

func (c client) isByteMiniprogram() bool {
	return strings.Contains(c.ua, "toutiaomicroapp") || c.platformReq == "dy_miniprogram"
}

func (c client) isAndroidApp() bool {
	return strings.Contains(c.ua, "huoniao") && strings.Contains(c.ua, "android") && !strings.Contains(c.ua, "harmony")
}

func (c client) isHarmonyApp() bool {
	return strings.Contains(c.ua, "huoniao") && strings.Contains(c.ua, "harmony")
}

func (c client) isIOSApp() bool {
	noAndroid := !strings.Contains(c.ua, "android")
	noHarmony := !strings.Contains(c.ua, "harmony")
	if strings.Contains(c.ua, "huoniao_ios") && noAndroid && noHarmony {
		return true
	}
	// PHP 用 strpos(...) != false：iphone 出现在下标 0 时为 false，这里一并复刻。
	if c.isMobile() && (strings.Contains(c.query, "appfullscreen") || strings.Contains(c.query, "appindex")) &&
		strings.Index(c.ua, "iphone") > 0 && noAndroid && noHarmony {
		return true
	}
	return strings.Contains(c.ua, "cfnetwork") && strings.Contains(c.ua, "darwin")
}

func (c client) isApp() bool { return c.isAndroidApp() || c.isIOSApp() || c.isHarmonyApp() }

func containsAny(s string, subs []string) bool {
	for _, x := range subs {
		if strings.Contains(s, x) {
			return true
		}
	}
	return false
}

// ---- PHP 语义小工具 ----

// truthy 复刻 PHP 对 PDO 字符串列的真值判断：NULL、""、"0" 为假。
func truthy(v sql.NullString) bool { return v.Valid && v.String != "" && v.String != "0" }

// eqOne 复刻 `$v == 1`：数字字符串按数值比较。
func eqOne(v sql.NullString) bool {
	if !v.Valid {
		return false
	}
	f, err := strconv.ParseFloat(strings.TrimSpace(v.String), 64)
	return err == nil && f == 1
}

func ptr(v sql.NullString) *string {
	if !v.Valid {
		return nil
	}
	s := v.String
	return &s
}

func strPtr(s string) *string { return &s }

// phpTruthyArray 复刻 PHP 数组元素的真值（unserialize 后的值）。
func phpTruthyValue(v any) bool {
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
	case map[string]any:
		return len(x) > 0
	}
	return false
}

// ---- siteModule ----

// item 字段顺序与 siteConfig.class.php:421-440 的 $_data 一致。
type item struct {
	ID          *string `json:"id"`
	Name        *string `json:"name"`
	Icon        string  `json:"icon"`
	Code        string  `json:"code"`
	Bold        *string `json:"bold"`
	Target      *string `json:"target"`
	Color       *string `json:"color"`
	Wx          *string `json:"wx"`
	App         *string `json:"app"`
	SearchURL   string  `json:"searchUrl"`
	URL         string  `json:"url"`
	Title       *string `json:"title"`
	Description *string `json:"description"`
	Logo        *string `json:"logo"`
	Disabled    int     `json:"disabled"`
	Personal    *int    `json:"personal,omitempty"`
}

// modInfo 是模块 config handler 的 info 里 siteModule 用到的部分。
type modInfo struct {
	title, description, channelDomain string
}

// mcState 复刻 PHP 的 $moduleConfig 变量（循环开头不重置，按现状复刻串味 bug）：
//
//	mcNone：未赋值；mcResp：handler 的完整返回 {state, info}；mcInfo：已取 ['info'] 之后的数组（info==nil 即 null）。
type mcState struct {
	kind  int
	state int
	info  *modInfo
}

const (
	mcNone = iota
	mcResp
	mcInfo
)

type siteRow struct {
	id, typ, title, subject, name, icon, link, bold, target, color sql.NullString
	wx, bd, qm, dy, app, pc, h5, harmony, android, ios             sql.NullString
}

// siteModule 迁移自 siteConfig.class.php:261-459，规则见 issue #247「业务规则」评论。
func (s *Service) siteModule(req *ajax.Request) ajax.Response {
	empty := ajax.Response{State: stateNoData, Info: infoNoData}
	if s.db == nil {
		return empty
	}
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	cl := newClient(req)

	platform := req.Params.Get("platform")
	typ := req.Params.Get("type")
	cityid := req.Params.Get("cityid")
	page := req.Params.Get("page")

	// getCityId() 在 ajax 直调下兜底链全空 → 0；cookie siteCityInfo / Referer 自请求不复刻。
	if phpEmpty(cityid) {
		cityid = "0"
	}

	cityConfig := s.cityConfig(ctx, cityid)

	isWx := platform == "wx_miniprogram" || cl.isWxMiniprogram()
	isBd := platform == "bd_miniprogram" || cl.isBaiduMiniprogram()
	isQq := platform == "qm_miniprogram" || cl.isQqMiniprogram()
	isDy := platform == "dy_miniprogram" || cl.isByteMiniprogram()

	if page == "touchHome" {
		typ = "1"
	}
	where := ""
	if phpEmpty(typ) {
		where = " AND `type` = 0"
	}
	mobile := cl.isMobile()
	if mobile {
		where += " AND `name` != 'special' AND `name` != 'website'"
	}

	disabled := s.disabledModules(ctx, cl)

	opts := s.options(req, cl)
	base := s.base(ctx, opts)
	businessDomain, _ := s.urlPath(ctx, "business", opts)

	rows, err := s.db.QueryContext(ctx, "SELECT `id`, `type`, `title`, `subject`, `name`, `icon`, `link`, `bold`, `target`, `color`, `wx`, `bd`, `qm`, `dy`, `app`, `pc`, `h5`, `harmony`, `android`, `ios` FROM "+
		s.moduleTable+" WHERE `state` = 0 AND `parentid` = 1"+where+" ORDER BY `weight`, `id`")
	if err != nil {
		return empty
	}
	var all []siteRow
	for rows.Next() {
		var r siteRow
		if rows.Scan(&r.id, &r.typ, &r.title, &r.subject, &r.name, &r.icon, &r.link, &r.bold, &r.target, &r.color,
			&r.wx, &r.bd, &r.qm, &r.dy, &r.app, &r.pc, &r.h5, &r.harmony, &r.android, &r.ios) != nil {
			_ = rows.Close()
			return empty
		}
		all = append(all, r)
	}
	if rows.Err() != nil {
		_ = rows.Close()
		return empty
	}
	_ = rows.Close()

	list := []item{}
	var (
		mc       mcState
		curShare string // 方法作用域里的 $customSharePic：被 require 的 inc 文件写入，跨迭代保留
		sharePic = s.sharePic
	)
	app := cl.isApp()
	for _, v := range all {
		visible := false
		if !mobile {
			visible = truthy(v.pc)
		} else {
			noMini := !isWx && !isBd && !isQq && !isDy
			visible = (noMini && truthy(v.h5) && !app) ||
				(isWx && truthy(v.wx) && !app) ||
				(isBd && truthy(v.bd) && !app) ||
				(isQq && truthy(v.qm) && !app) ||
				(isDy && truthy(v.dy) && !app) ||
				(cl.isAndroidApp() && eqOne(v.android)) ||
				(cl.isIOSApp() && eqOne(v.ios)) ||
				(cl.isHarmonyApp() && eqOne(v.harmony))
		}
		if !visible {
			continue
		}
		sName := v.name.String
		// 城市开关：config 里该模块 state 为真 = 禁用。
		if m, ok := cityConfig[sName].(map[string]any); ok && phpTruthyValue(m["state"]) {
			continue
		}
		if page == "touchHome" && (sName == "special" || sName == "website") {
			continue
		}

		// require config/<name>.inc.php：写入局部 $customSharePic（没定义该变量的 inc 保留旧值）。
		meta, known := moduleTable[sName]
		if known && meta.hasSharePic {
			curShare = meta.sharePic
		}

		// new handlers($sName, "config")->getHandle()：只有 sName 非空才会重新赋值。
		if sName != "" {
			if known {
				mc = mcState{kind: mcResp, state: 100, info: s.moduleInfo(ctx, sName, meta, opts)}
			} else {
				mc = mcState{kind: mcResp, state: 200}
			}
		}

		// PHP 两处判断不同：输出豁免与 business 改写是松散 == 1；URL 分支是真值判断。
		typOne := eqOne(v.typ)
		typTruthy := truthy(v.typ)
		if !((mc.kind == mcResp && mc.state == 100) || typOne) {
			continue
		}
		// $moduleConfig = $moduleConfig['info']：mcResp 取其 info；mcInfo/mcNone 上没有 'info' 键 → null。
		var info *modInfo
		if mc.kind == mcResp {
			info = mc.info
		}
		mc = mcState{kind: mcInfo, info: info}

		link := v.link
		name := v.name
		if typOne && v.link.String == "{#$business_channelDomain#}" && !strings.Contains(v.link.String, ".html") {
			name = sql.NullString{String: "business", Valid: true}
			link = sql.NullString{String: businessDomain, Valid: true}
		}

		var url string
		if typTruthy {
			url = link.String
			switch {
			case (app || !mobile) && strings.Contains(link.String, "miniProgramLive_"):
				url = base + "/include/json.php?action=getMiniProgramLive&id=" + strings.ReplaceAll(link.String, "miniProgramLive_", "")
			case (app || !mobile) && strings.Contains(link.String, "wxMiniprogram://"):
				url = base + "/include/json.php?action=openWxMiniProgram&param=" + link.String
			case !cl.isWxMiniprogram() && strings.Contains(link.String, "openxcx_"):
				url = base + "/include/json.php?action=getWxMiniProgram"
			}
		} else if info != nil {
			url = info.channelDomain
			if app {
				url += "?appTitle"
			}
		} else if app {
			url = "?appTitle"
		}
		if strings.Contains(url, "work.weixin.qq.com") && cl.isIOSApp() {
			url = "tel:" + s.hotline
		}

		icon := ""
		if !truthy(v.icon) {
			icon = base + "/static/images/admin/nav/" + name.String + ".png?v=" + s.staticVersion
		} else {
			icon = s.filePath(ctx, v.icon.String, opts)
		}
		code := ""
		if truthy(name) {
			code = name.String
		} else if cl.isAndroidApp() && strings.Contains(url, "service=shop") {
			code = "shop"
		}
		itemName := ptr(v.title)
		if truthy(v.subject) {
			itemName = ptr(v.subject)
		}

		d := item{
			ID:        ptr(v.id),
			Name:      itemName,
			Icon:      icon,
			Code:      code,
			Bold:      ptr(v.bold),
			Target:    ptr(v.target),
			Color:     ptr(v.color),
			Wx:        ptr(v.wx),
			App:       ptr(v.app),
			SearchURL: base + "/search-list.html?action=" + sName + "&keywords=",
			URL:       strings.ReplaceAll(url, "$city", cityid),
		}
		if info != nil {
			d.Title = strPtr(info.title)
			d.Description = strPtr(info.description)
		}
		switch {
		case !phpEmpty(curShare):
			d.Logo = strPtr(base + "/include/attachment.php?f=" + curShare)
		case !phpEmpty(sharePic):
			d.Logo = strPtr(base + "/include/attachment.php?f=" + sharePic)
		case info != nil:
			d.Logo = strPtr(base + "/include/attachment.php?f=" + s.webLogo)
		}
		if disabled[name.String] {
			d.Disabled = 1
		}
		if name.String == "homemaking" {
			personal := 0
			if s.isPersonal(ctx, req) {
				personal = 1
			}
			d.Personal = &personal
		}
		list = append(list, d)
	}
	if len(list) == 0 {
		return empty
	}
	return ajax.Response{State: ajax.StateOK, Info: list}
}

func phpEmpty(s string) bool { return s == "" || s == "0" }

// moduleInfo 复刻模块 config() 里 siteModule 用到的三项：title / description / channelDomain。
func (s *Service) moduleInfo(ctx context.Context, name string, m moduleMeta, o fburl.Options) *modInfo {
	// ajax 直调时 $siteCityInfo 未设置 → $cityName 为 null → '$city' 被替换成空串。
	info := &modInfo{
		title:       strings.ReplaceAll(m.title, "$city", ""),
		description: strings.ReplaceAll(strings.Trim(m.description, " \t\n\r\x00\x0B"), "$city", ""),
	}
	if s.files != nil {
		if d, err := s.files.Domain(ctx, name, m.subDomain, false, o); err == nil {
			info.channelDomain = d
		}
	}
	return info
}

// cityConfig 读 site_city.config 并 unserialize；无行 / 失败 / 空数组 → nil（不过滤）。
// cityid 原样拼进 PHP 的 SQL；只有纯数字才可能命中行，其余（abc）视为无行。
var digitsOnly = regexp.MustCompile(`^-?[0-9]+$`)

func (s *Service) cityConfig(ctx context.Context, cityid string) map[string]any {
	if phpEmpty(cityid) || !digitsOnly.MatchString(cityid) {
		return nil
	}
	var raw sql.NullString
	if err := s.db.QueryRowContext(ctx, "SELECT `config` FROM "+s.cityTable+" WHERE `cid` = "+cityid).Scan(&raw); err != nil || !raw.Valid {
		return nil
	}
	p := &phpUnser{s: raw.String}
	v, ok := p.value()
	if !ok {
		return nil
	}
	m, ok := v.(map[string]any)
	if !ok || len(m) == 0 {
		return nil
	}
	return m
}

// disabledModules 仅 APP 端读 app_config.disabledModule（逗号分隔）。
func (s *Service) disabledModules(ctx context.Context, cl client) map[string]bool {
	out := map[string]bool{}
	if !cl.isApp() {
		return out
	}
	var raw sql.NullString
	if err := s.db.QueryRowContext(ctx, "SELECT `disabledModule` FROM "+s.appConfigTable+" LIMIT 1").Scan(&raw); err != nil || !truthy(raw) {
		return out
	}
	for _, n := range strings.Split(raw.String, ",") {
		out[n] = true
	}
	return out
}

// isPersonal：getMemberID()>0 且 homemaking_personal 有行。
func (s *Service) isPersonal(ctx context.Context, req *ajax.Request) bool {
	if s.members == nil || req.HTTP == nil {
		return false
	}
	uid, err := s.members.MemberID(ctx, req.HTTP)
	if err != nil || uid <= 0 {
		return false
	}
	var id sql.NullString
	err = s.db.QueryRowContext(ctx, "SELECT `id` FROM "+s.personalTb+" WHERE `userid` = ? LIMIT 1", uid).Scan(&id)
	return err == nil
}

func (s *Service) options(req *ajax.Request, cl client) fburl.Options {
	host := ""
	if req.HTTP != nil {
		host = req.HTTP.Host
	}
	return fburl.Options{Host: host, IsApp: cl.isApp(), IsAndroidApp: cl.isAndroidApp(), IsMobile: cl.isMobile()}
}

// base 是 $cfg_secureAccess.$cfg_basehost。
func (s *Service) base(ctx context.Context, o fburl.Options) string {
	if s.files != nil {
		if b, err := s.files.Domain(ctx, "", 0, false, o); err == nil {
			return b
		}
	}
	host := o.Host
	if h, _, err := net.SplitHostPort(host); err == nil {
		host = h
	}
	return "http://" + host
}

func (s *Service) urlPath(ctx context.Context, service string, o fburl.Options) (string, error) {
	if s.files == nil {
		return "", nil
	}
	u, err := s.files.URL(ctx, fburl.Params{{Key: "service", Value: service}}, o)
	if err != nil {
		return "", err
	}
	return u, nil
}

func (s *Service) filePath(ctx context.Context, path string, o fburl.Options) string {
	if s.files == nil {
		return path
	}
	u, err := s.files.File(ctx, path, o)
	if err != nil {
		return ""
	}
	return u
}
