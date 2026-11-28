// Package travel 是 ajax.php 的 travel 服务（#370 批次1：21 个类型/字典只读 action）。
package travel

import (
	"context"
	"database/sql"
	"errors"
	"net/http"
	"regexp"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/fburl"
)

// errInvalidPrefix 是表前缀含非法字符时的启动期错误。
var errInvalidPrefix = errors.New("ajax: travel 表前缀含非法字符")

const (
	// stateNoData 对应 handlers.class.php:84-87：action 返回 falsy（空数组 / null / ""）时
	// 外层包装固定为 state=102、info="No data!"。
	stateNoData = 102
	infoNoData  = "No data!"

	// stateParamFailed 是 action 返回 array("state"=>200,...) 时 handlers::getHandle 的
	// 改写结果（handlers.class.php:62-64：200/101 → 101，info 原样）。
	stateParamFailed = 101

	// infoTypeFailed 是 dsql::getTypeList catch 分支的固定文案（dsql.class.php getTypeList 末尾）。
	infoTypeFailed = "分类获取失败！"

	// infoNoTravelItem / infoNoCountry 是 travelitem / countrytype 在总条数为 0 时的文案
	// （$langData['siteConfig'][21][64]，运行时 zh-CN 语言包取值）。
	infoNoTravelItem = "暂无数据！"

	// infoNoCountryDetail 是 countryDetail 缺 id 时的文案（$langData['travel'][12][13]）。
	infoNoCountryDetail = "请填写联系人"

	// infoAddrFormat 是 addr 参数非数组时的文案（$langData['travel'][12][23]）；
	// 该分支在 ajax 入口下是死代码（$this->param 恒为数组），保留仅为对齐源码。
	infoAddrFormat = "格式错误"
)

// prefixPattern 约束表前缀：前缀会被拼进 SQL，必须防注入（口径同 article）。
var prefixPattern = regexp.MustCompile(`^[A-Za-z0-9_]+$`)

// ZanCheckFunc 对应 checkIsZan()（member 服务注入）：module/temp/id，返回 "has"/"no"。
type ZanCheckFunc func(req *ajax.Request, module, temp, id string) string

// Identity 对应 userLogin->getMemberID()：未登录返回 -1（fbidentity.Resolver 满足该接口）。
type Identity interface {
	MemberID(ctx context.Context, req *http.Request) (int64, error)
}

// Dep 是 travel 服务的依赖。
type Dep struct {
	// DB 是业务连接池。nil 表示「DB_HOST 未配置、本地纯内存模式」，
	// 此时 DB 类 action 按「查不到数据」降级（state=102 / 101），不让启动失败。
	DB *sql.DB
	// TablePrefix 是火鸟表前缀，对应 PHP 的 $DB_PREFIX。
	TablePrefix string
	// Files 用于 getFilePath（图片转绝对地址）。nil 时路径原样输出、iconSource 恒为空串。
	Files *fburl.Resolver
	// Identity 识别当前会员（countryDetail 的 collect 校验用）。nil 时一律按未登录（-1）。
	Identity Identity
	// WebLogo / Hotline 对应 PHP 的 $cfg_weblogo / $cfg_hotline（config 用）。
	// Hotline 为空时按 canary 现状值回落。
	WebLogo, Hotline string
	// SameAddrState 对应 $cfg_sameAddr_state（siteConfig.inc.php:180 canary = 1）。
	// getTypeList 的 hideSameCity 分支只在它为 0 时生效；canary 上恒为 1 → 分支不生效，
	// 这里保留常量语义以便后续接入运行时配置。
	SameAddrState int
	// CollectCheck 对应 checkIsCollect()（countryDetail 的收藏校验）。nil 时按未登录处理。
	CollectCheck CollectCheckFunc
	// ZanCheck 对应 checkIsZan()（videoDetail 的点赞校验）。nil 时按未点赞处理。
	ZanCheck ZanCheckFunc
	// MemberDetail 对应 getMemberDetail() → handlers("member","detail")：storeDetail 的
	// member 投影。nil 时输出空数组 []。
	MemberDetail ajax.Handler
	// CookiePrefix 是 $cfg_cookiePre（getCityId 的 siteCityInfo cookie 键前缀）。
	CookiePrefix string
	// DefaultCityID 对应 PHP getCityId() 在「无 cityid 参数、无 siteCityInfo cookie」时的
	// 兜底链：ajax.php 引导 → checkDefaultCity() → siteCity() 先读
	// data/cache/system_site_city.json（本地/canary 该文件 expire_time 恒有效，
	// 内置默认分站 cityid=10000）。由 cmd/api 在启动期解析 PHP_ROOT 环境变量注入；
	// 0 表示无默认分站（等同 PHP 最终 (int)$cid = 0）。L1 测试不注入。
	DefaultCityID int
	// CommentCheck 对应 include/config/travel.inc.php 的 $customCommentCheck
	// （sendCommon 的 ischeck；仓库/本地/canary 均为 1，main.go 默认 1）。
	CommentCheck int
	// Identity 识别当前会员（countryDetail 的 collect 校验用）。nil 时一律按未登录（-1）。
}

// Service 是 travel 服务的运行期对象。
type Service struct {
	db           *sql.DB
	prefix       string
	files        *fburl.Resolver
	ident        Identity
	logo         string
	hot          string
	collectCheck CollectCheckFunc
	zanCheck     ZanCheckFunc
	memberDetail ajax.Handler
	cookiePrefix string
	defaultCity  int
	commentCheck int
}

// defaultTravelLogo / defaultTravelHotline 是 canary 的 $cfg_weblogo / $cfg_hotline
// 运行期值（不在仓库里；与 article 的 defaultPic / DefaultHotline 同源快照）。
const (
	defaultTravelLogo    = "https://storage.googleapis.com/fbird-sea-uploads/siteConfig/logo/fbird_logo.png"
	defaultTravelHotline = "Telegram / WhatsApp 在线客服支持"
)

// New 构造 travel 服务；表前缀含非法字符是配置错误，返回错误让启动期失败。
func New(dep Dep) (*Service, error) {
	if !prefixPattern.MatchString(dep.TablePrefix) {
		return nil, errInvalidPrefix
	}
	logo := dep.WebLogo
	if logo == "" {
		logo = defaultTravelLogo
	}
	hot := dep.Hotline
	if hot == "" {
		hot = defaultTravelHotline
	}
	return &Service{
		db:           dep.DB,
		prefix:       dep.TablePrefix,
		files:        dep.Files,
		ident:        dep.Identity,
		logo:         logo,
		hot:          hot,
		collectCheck: dep.CollectCheck,
		zanCheck:     dep.ZanCheck,
		memberDetail: dep.MemberDetail,
		cookiePrefix: dep.CookiePrefix,
		defaultCity:  dep.DefaultCityID,
		commentCheck: dep.CommentCheck,
	}, nil
}

// Register 把 21 个 action 注册进 router（批次1 全量清单见 #370）。
func Register(router *ajax.Router, s *Service) {
	router.Register("travel", "config", s.config)
	router.Register("travel", "addr", s.addr)
	router.Register("travel", "rentcartype", s.rentcartype)
	router.Register("travel", "visatype", s.visatype)
	router.Register("travel", "strategytype", s.strategytype)
	router.Register("travel", "travelitem", s.travelitem)
	router.Register("travel", "countrytype", s.countrytype)
	router.Register("travel", "countryDetail", s.countryDetail)
	router.Register("travel", "module_type", s.moduleTypeList)
	router.Register("travel", "iswindow_type", s.iswindowType)
	router.Register("travel", "visa_type", s.visaTypeList)
	router.Register("travel", "room_type", s.roomType)
	router.Register("travel", "breakfast_type", s.breakfastType)
	router.Register("travel", "travelhotel_type", s.travelhotelType)
	router.Register("travel", "travelagency_type", s.travelagencyType)
	router.Register("travel", "star_type", s.starType)
	router.Register("travel", "continent_type", s.continentType)
	router.Register("travel", "typeid_type", s.typeidType)
	router.Register("travel", "gettypename", s.gettypenameAction)
	router.Register("travel", "moduleType", s.moduleTypeWeek)
	router.Register("travel", "getname", s.getnameAction)

	// 批次2（#371）：商家列表/详情读 19 个。
	router.Register("travel", "storeList", s.storeList)
	router.Register("travel", "storeDetail", s.storeDetailAction)
	router.Register("travel", "hotelList", s.hotelList)
	router.Register("travel", "hotelDetail", s.hotelDetail)
	router.Register("travel", "ticketList", s.ticketList)
	router.Register("travel", "ticketDetail", s.ticketDetail)
	router.Register("travel", "rentcarList", s.rentcarList)
	router.Register("travel", "rentcarDetail", s.rentcarDetail)
	router.Register("travel", "visaList", s.visaList)
	router.Register("travel", "visaDetail", s.visaDetail)
	router.Register("travel", "agencyList", s.agencyList)
	router.Register("travel", "agencyDetail", s.agencyDetail)
	router.Register("travel", "videoList", s.videoList)
	router.Register("travel", "videoDetail", s.videoDetail)
	router.Register("travel", "strategyList", s.strategyList)
	router.Register("travel", "strategyDetail", s.strategyDetail)
	router.Register("travel", "companyAllDataList", s.companyAllDataList)
	router.Register("travel", "getAlldata", s.getAlldata)
	router.Register("travel", "searchTravel", s.searchTravel)

	// 批次3（#372）：评论互动 5 个（common/getCommonList 读，sendCommon/dingCommon
	// 写仅 L1，commentDetail 读）。
	router.Register("travel", "common", s.common)
	router.Register("travel", "getCommonList", s.getCommonList)
	router.Register("travel", "dingCommon", s.dingCommon)
	router.Register("travel", "sendCommon", s.sendCommon)
	router.Register("travel", "commentDetail", s.commentDetail)

	// 批次5（#374）：订单读与轻写 7 个（delOrder/oneKeyContinued 写仅 L1）。
	router.Register("travel", "orderList", s.orderList)
	router.Register("travel", "orderDetail", s.orderDetail)
	router.Register("travel", "checkPayAmount", s.checkPayAmount)
	router.Register("travel", "payCheck", s.payCheckAction)
	router.Register("travel", "verifyQuan", s.verifyQuan)
	router.Register("travel", "delOrder", s.delOrder)
	router.Register("travel", "oneKeyContinued", s.oneKeyContinued)
}
