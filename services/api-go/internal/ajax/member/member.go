// Package member 是 ajax.php 的 member 服务（迁移进行中，总方案见 #298）。
package member

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"
	"unicode/utf8"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/fburl"
)

const (
	// handlers.class.php:67-79：action 返回 state 200 / 101 时，外层统一改写成 101，info 原样保留。
	stateFail = 101
	// handlers.class.php:84-87：空返回 → 102 "No data!"。
	stateNoData = 102
	infoNoData  = "No data!"

	// zh-CN/siteConfig.inc.php 里 [21][64] 与 [20][262] 的文案。
	infoEmpty        = "暂无数据！"
	infoLoginTimeout = "登录超时，请重新登录！"

	// ajax.php:56-121：page / pageSize 的上限。
	maxPage = 50000
)

var (
	prefixPattern  = regexp.MustCompile(`^[A-Za-z0-9_]+$`)
	numericPattern = regexp.MustCompile(`^[ \t\n\r\v\f]*[+-]?([0-9]+(\.[0-9]*)?|\.[0-9]+)([eE][+-]?[0-9]+)?$`)
	numberPrefix   = regexp.MustCompile(`^[ \t\n\r\v\f]*[+-]?([0-9]+(\.[0-9]*)?|\.[0-9]+)([eE][+-]?[0-9]+)?`)
	// date() 用的是应用时区 Etc/GMT-8，即 UTC+8。
	gmt8 = time.FixedZone("Etc/GMT-8", 8*3600)
)

// Identity 对应 userLogin->getMemberID()：返回当前请求的会员 ID，未登录返回 -1
// （fbidentity.Resolver 满足该接口）。只有数据库故障才返回 error。
type Identity interface {
	MemberID(ctx context.Context, req *http.Request) (int64, error)
}

// Dep 是 member 服务的依赖。
type Dep struct {
	// DB 是业务连接池；nil 表示本地纯内存模式，所有 action 按「查不到数据」降级。
	DB          *sql.DB
	TablePrefix string
	// Identity 为 nil 时一律按匿名（-1）处理。
	Identity Identity
	// URLPath 对应 getUrlPath(member/message_detail)：id 是消息 ID，caller 是调用方会员 ID
	// （用来判断 userType，决定是否带 type=user）。为 nil 时 url 输出空串。
	// 等 #330 落地后接上；对比用例里 url 暂时在 ignoreFields 中。
	URLPath func(caller int64, id string) string

	// 以下可选依赖只给 member.reward 用（对应 PHP 的 getUrlPath / getFilePath / getAttachemntFile / getIpHome
	// 和 cfg_cookiePre / cfg_pointState / 已安装模块）。为 nil / 零值时 url 输出空串，文件路径原样输出。
	// ModuleURL 对应 getUrlPath(['service'=>service,'template'=>template,'id'=>id])。
	ModuleURL      func(service, template string, id int64) string
	FilePath       func(path string) string
	AttachmentFile func(path string) string
	IPHome         func(ipaddr string) string
	CookiePre      string
	PointState     bool
	DatingEnabled  bool
	// —— getComment（#251）的依赖。member.detail / 各模块 detail / checkCourierAccount 尚未迁移，
	// 为 nil 且请求确实用到时，getComment 返回 102 而不是编造数据。——

	// Files 对应 getFilePath / getUrlPath；nil 时图片原样输出、detail.url 为空串。
	Files *fburl.Resolver
	// UserDetail 对应 member.detail（#253）。
	UserDetail UserDetailFunc
	// ModuleDetail 对应 handlers(module, action)->getHandle(aid)（article.detail 是 #260）。
	ModuleDetail ModuleDetailFunc
	// DecodeAttachment 对应 decodeAttachmentUrl()；nil 时原样返回。
	DecodeAttachment func(string) string
	// CourierID 对应 waimai checkCourierAccount()（peisongid=1）。
	CourierID func(ctx context.Context, req *http.Request) (int64, error)
	// IPHomeMode 对应 $cfg_iphome（0 不显示 1 省 2 市 3 省+市）；nil 取仓库配置的 3。
	IPHomeMode *int
	// CookiePrefix 对应 $cfg_cookiePre（member.detail 的 login cookie 前缀）；空取 HN_。
	CookiePrefix string
	// DetailPointState 对应 $cfg_pointState（member.detail 用）；nil 取仓库配置（开启）。
	DetailPointState *bool
	// CryptKey 是 RenrenCrypt 密钥（userid_encode 用）；nil 取 PHP 常量。
	CryptKey []byte
	// MemberLogSaveDays 对应 $max_memberBehaviorLog_save_day（member_log 保留天数）。
	// nil / 0 表示未配置，memberLog 不做过期清理（与 PHP 一致）。
	MemberLogSaveDays *int
	// DisableLikeState 对应 $cfg_disableLikeState（禁止点赞开关，getZan 用）；nil 取 canary 的 0。
	DisableLikeState *int
	// DisableLikeInfo 对应 $cfg_disableLikeInfo（禁止点赞提示语）；nil / 空串取 PHP 默认文案。
	DisableLikeInfo *string

	// —— replyComment（#259）的依赖。配置源是站点运行期配置，不在仓库里；
	// nil 时取 canary 的关态（0 / 空串 / 默认文案），与 main.go 未装配的 DisableLike* 同口径。——

	// DisableCommentState 对应 $cfg_disableCommentState（禁止评论开关）；nil 取 0。
	DisableCommentState *int
	// DisableCommentInfo 对应 $cfg_disableCommentInfo；nil / 空串取 PHP 默认文案。
	DisableCommentInfo *string
	// MemberVerified 对应 $cfg_memberVerified（实名认证开关）；nil 取 0。
	MemberVerified *int
	// MemberVerifiedInfo 对应 $cfg_memberVerifiedInfo（实名不过时 201 的 info）；nil 输出 null。
	MemberVerifiedInfo *string
	// MemberBindPhone 对应 $cfg_memberBindPhone（手机认证开关）；nil 取 0。
	MemberBindPhone *int
	// MemberBindPhoneInfo 对应 $cfg_memberBindPhoneInfo（手机不过时 202 的 info）；nil 输出 null。
	MemberBindPhoneInfo *string
	// PeriodicCheckPhone 对应 $cfg_periodicCheckPhone（手机周期检查开关）；PeriodicCheckPhoneCycle
	// 对应 $cfg_periodicCheckPhoneCycle（天，×86400 换算成秒）。
	PeriodicCheckPhone      *int
	PeriodicCheckPhoneCycle *int
	// ModuleCommentCheck 对应 include/config/<module>.inc.php 的 $customCommentCheck
	// （replyComment / sendComment 的 ischeck）；nil 时按仓库配置文件现值（见 defaultCommentCheck）。
	ModuleCommentCheck func(module string) int
	// —— sendComment（#262）的依赖 ——
	// ReturnInteractionComment 对应 $cfg_returnInteraction_comment（评论返积分数量）；
	// ReturnInteractionCommentDay 对应 $cfg_returnInteraction_commentDay（每天上限）。
	// 仓库 pointsConfig.inc.php 没有这两个键 → nil 取 0 = 不发放。
	ReturnInteractionComment    *int
	ReturnInteractionCommentDay *int
	// PointName 对应 $cfg_pointName（默认「积分」）。
	PointName *string

	// —— updateAccount（#261）的依赖。站点运行期配置不在仓库里，nil / 零值取 canary 关态。——

	// NicknameEditState 对应 $cfg_nicknameEditState（昵称修改开关）；nil 取 canary 的 0。
	NicknameEditState *int
	// NicknameEditInfo 对应 $cfg_nicknameEditInfo；nil / 空串取 PHP 默认文案。
	NicknameEditInfo *string
	// NicknameEditAudit 对应 $cfg_nicknameEditAudit（昵称审核开关）；nil 取 canary 的 0。
	NicknameEditAudit *int
	// PwdLevel 对应 $cfg_pwdLevel（密码复杂度 0-3）；canary 未配置 → nil 取 0（不校验）。
	PwdLevel *int
	// CardState 对应 $cfg_cardState（身份证 OCR 开关）；nil 取 canary 的 0（人工审核）。
	CardState *int
	// SiteCityName / SiteCityID 对应 $siteCityInfo['name'] / ['cityid']（certify 的管理员
	// 通知参数）；空串时按「站点数组为空」序列化为 null。
	SiteCityName string
	SiteCityID   string
	// NotifyVars 对应邮件模板（getInfoTempContent）的 $cfg_webname / $cfg_shortname /
	// $cfg_attachment.$cfg_weblogo / $cfg_hotline / $cfg_basehost 替换变量；nil 时这些
	// 占位符原样保留（$link / $time 由实现内部给出）。
	NotifyVars map[string]string
	// SendMail 对应 sendmail()（chemail）；返回非空串表示失败原因。nil 视为发送失败。
	SendMail func(ctx context.Context, to, title, body string) string
	// WxPhoneNumber 对应 do=chphone 的微信小程序支路（getuserphonenumber，需要 access_token
	// 服务）；nil 时按「手机号码解析失败」返回。errCode 非空时返回 ErrCode/ErrMsg 文案。
	WxPhoneNumber func(ctx context.Context, code string) (errCode, errMsg, areaCode, phone string)
	// DyPhoneNumber 对应抖音小程序支路（jscode2session + WXBizDataCrypt）；decErrCode 是
	// 解密错误码（PHP WXBizDataCrypt::decryptData 的返回值，空手机号提示会拼上它）；nil 同上。
	DyPhoneNumber func(ctx context.Context, code, encryptedData, iv string) (errNo, errTips, decErrCode, areaCode, phone string)
	// 以下三个对应 cfg_cardState=1 的阿里云 OCR / 实名核验（zid.market.alicloudapi.com，
	// AppCode 取 unserialize($cfg_juhe)['aliyun']）。nil 表示 AppCode 为空 / 服务未接入，
	// PHP 侧此时 json_decode 返回 null、error_code 判 0 后因缺少 result 走解析失败分支，
	// Go 按 error_code 非 0 处理，行为一致（分支标注 untested，canary 未开通）。
	IdentCardPositive func(ctx context.Context, imageURL string) (errorCode int, name, idcardNo string)
	IdentCardContrary func(ctx context.Context, imageURL string) (errorCode int, imageStatus, startDate, endDate string)
	IDCheck           func(ctx context.Context, idcard, realname string) (errorCode int, isok bool)
	// Clock 仅测试用；nil 取 time.Now。
	Clock func() time.Time
}

// Service 是 member 服务的实现。
type Service struct {
	db       *sql.DB
	identity Identity
	urlPath  func(caller int64, id string) string

	prefix                    string
	moduleURL                 func(service, template string, id int64) string
	filePath, attachmentFile  func(path string) string
	ipHome                    func(ipaddr string) string
	cookiePre                 string
	pointState, datingEnabled bool

	logTable, letterTable, upTable, commentTable, memberTable string
	paotuiTable, tiebaTable, followTable                      string
	friendTable                                               string
	levelTable, businessTable, staffTable, securityTable      string
	datingTable, areaTable, bonusTable, paymentTable          string
	// collectTable 是 member_collect（member.collect 的收藏表）。
	collectTable string
	// sitesmsTable / notifyTable / msgLogTable / updateMsgTable 是 updateAccount 的表：
	// 短信平台配置、通知模板、验证码与邮件日志、管理员通知队列。
	smsTable, notifyTable, msgLogTable, updateMsgTable string
	// publicCommentTable 是 replyComment 的 INSERT 目标（public_comment_all 是它的 MRG 合并表）；
	// businessListTable 是实名门禁推导 busiState 用的商家表。
	publicCommentTable, businessListTable string
	// behaviorTable 是 member_log（memberLog 写的行为日志），selfMediaTable 是文章自媒体号表。
	behaviorTable, selfMediaTable string
	// siteModuleTable（getModuleTitle）、subTableListTable / articleListTable / travelVideoTable
	// 是 getZan 用的表：分表清单、文章主表、travel_video 计数表。
	siteModuleTable, subTableListTable, articleListTable, travelVideoTable string

	files            *fburl.Resolver
	userDetail       UserDetailFunc
	moduleDetail     ModuleDetailFunc
	decodeAttachment func(string) string
	courierID        func(ctx context.Context, req *http.Request) (int64, error)
	ipHomeMode       int
	cookiePrefix     string
	detailPointState bool
	cryptKey         []byte
	clock            func() time.Time
	// getZan 的禁止点赞开关与提示语（cfg_disableLikeState / cfg_disableLikeInfo）。
	disableLikeState int
	disableLikeInfo  string

	// replyComment 的禁止评论开关与实名/手机门禁配置（nil 取 canary 关态）。
	disableCommentState int
	disableCommentInfo  string
	memberVerified      int
	memberVerifiedInfo  *string
	memberBindPhone     int
	memberBindPhoneInfo *string
	periodicCheckPhone  int
	periodicCheckCycle  int
	moduleCommentCheck  func(module string) int

	// sendComment（#262）的积分配置：评论返积分数量 / 每天上限 / 积分名。
	returnInteractionComment int
	returnInteractionDay     int
	pointName                string

	// memberLog 的过期清理状态：logSaveDays>0 时每 6 小时最多清理一次（PHP 用 cache 节流）。
	logSaveDays  int
	logCleanMu   sync.Mutex
	logCleanedAt time.Time

	// updateAccount 的开关与依赖（nil 取 canary 关态）。
	nicknameEditState int
	nicknameEditInfo  string
	nicknameEditAudit int
	pwdLevel          int
	cardState         int
	siteCityName      string
	siteCityID        string
	notifyVars        map[string]string
	sendMail          func(ctx context.Context, to, title, body string) string
	wxPhoneNumber     func(ctx context.Context, code string) (errCode, errMsg, areaCode, phone string)
	dyPhoneNumber     func(ctx context.Context, code, encryptedData, iv string) (errNo, errTips, decErrCode, areaCode, phone string)
	identCardPositive func(ctx context.Context, imageURL string) (int, string, string)
	identCardContrary func(ctx context.Context, imageURL string) (int, string, string, string)
	idCheck           func(ctx context.Context, idcard, realname string) (int, bool)
}

// New 校验依赖并预拼表名。
func New(dep Dep) (*Service, error) {
	if !prefixPattern.MatchString(dep.TablePrefix) {
		return nil, fmt.Errorf("member: TablePrefix %q 含非法字符", dep.TablePrefix)
	}
	t := func(name string) string { return "`" + dep.TablePrefix + name + "`" }
	mode := 3
	if dep.IPHomeMode != nil {
		mode = *dep.IPHomeMode
	}
	logSaveDays := 0
	if dep.MemberLogSaveDays != nil {
		logSaveDays = *dep.MemberLogSaveDays
	}
	disableLikeState := 0
	if dep.DisableLikeState != nil {
		disableLikeState = *dep.DisableLikeState
	}
	disableLikeInfo := ""
	if dep.DisableLikeInfo != nil {
		disableLikeInfo = *dep.DisableLikeInfo
	}
	disableCommentState := 0
	if dep.DisableCommentState != nil {
		disableCommentState = *dep.DisableCommentState
	}
	disableCommentInfo := ""
	if dep.DisableCommentInfo != nil {
		disableCommentInfo = *dep.DisableCommentInfo
	}
	memberVerified := 0
	if dep.MemberVerified != nil {
		memberVerified = *dep.MemberVerified
	}
	memberBindPhone := 0
	if dep.MemberBindPhone != nil {
		memberBindPhone = *dep.MemberBindPhone
	}
	periodicCheckPhone := 0
	if dep.PeriodicCheckPhone != nil {
		periodicCheckPhone = *dep.PeriodicCheckPhone
	}
	periodicCheckCycle := 0
	if dep.PeriodicCheckPhoneCycle != nil {
		periodicCheckCycle = *dep.PeriodicCheckPhoneCycle
	}
	cookiePrefix := dep.CookiePrefix
	if cookiePrefix == "" {
		cookiePrefix = "HN_"
	}
	detailPointState := true
	if dep.DetailPointState != nil {
		detailPointState = *dep.DetailPointState
	}
	cryptKey := dep.CryptKey
	if len(cryptKey) == 0 {
		cryptKey = []byte(phpEncryptKey)
	}
	returnInteractionComment := 0
	if dep.ReturnInteractionComment != nil {
		returnInteractionComment = *dep.ReturnInteractionComment
	}
	returnInteractionDay := 0
	if dep.ReturnInteractionCommentDay != nil {
		returnInteractionDay = *dep.ReturnInteractionCommentDay
	}
	pointName := infoPointName
	if dep.PointName != nil && *dep.PointName != "" {
		pointName = *dep.PointName
	}
	moduleCommentCheck := dep.ModuleCommentCheck
	if moduleCommentCheck == nil {
		moduleCommentCheck = func(module string) int { return defaultCommentCheck[module] }
	}
	nicknameEditState := 0
	if dep.NicknameEditState != nil {
		nicknameEditState = *dep.NicknameEditState
	}
	nicknameEditInfo := ""
	if dep.NicknameEditInfo != nil {
		nicknameEditInfo = *dep.NicknameEditInfo
	}
	nicknameEditAudit := 0
	if dep.NicknameEditAudit != nil {
		nicknameEditAudit = *dep.NicknameEditAudit
	}
	pwdLevel := 0
	if dep.PwdLevel != nil {
		pwdLevel = *dep.PwdLevel
	}
	cardState := 0
	if dep.CardState != nil {
		cardState = *dep.CardState
	}
	svc := &Service{
		db: dep.DB, identity: dep.Identity, urlPath: dep.URLPath, prefix: dep.TablePrefix,
		moduleURL: dep.ModuleURL, filePath: dep.FilePath, attachmentFile: dep.AttachmentFile, ipHome: dep.IPHome,
		cookiePre: dep.CookiePre, pointState: dep.PointState, datingEnabled: dep.DatingEnabled,
		files: dep.Files, userDetail: dep.UserDetail, moduleDetail: dep.ModuleDetail,
		decodeAttachment: dep.DecodeAttachment, courierID: dep.CourierID, ipHomeMode: mode, clock: dep.Clock,
		paotuiTable: t("paotui_order"), tiebaTable: t("tieba_list"), followTable: t("member_follow"),
		collectTable: t("member_collect"),
		smsTable:     t("sitesms"), notifyTable: t("site_notify"),
		msgLogTable: t("site_messagelog"), updateMsgTable: t("updatemessage"),
		behaviorTable: t("member_log"), selfMediaTable: t("article_selfmedia"),
		logTable: t("member_letter_log"), letterTable: t("member_letter"),
		upTable: t("public_up_all"), commentTable: t("public_comment_all"), memberTable: t("member"),
		siteModuleTable: t("site_module"), subTableListTable: t("site_sub_tablelist"),
		articleListTable: t("articlelist"), travelVideoTable: t("travel_video"),
		publicCommentTable: t("public_comment"), businessListTable: t("business_list"),
		logSaveDays: logSaveDays, disableLikeState: disableLikeState, disableLikeInfo: disableLikeInfo,
		disableCommentState: disableCommentState, disableCommentInfo: disableCommentInfo,
		memberVerified: memberVerified, memberVerifiedInfo: dep.MemberVerifiedInfo,
		memberBindPhone: memberBindPhone, memberBindPhoneInfo: dep.MemberBindPhoneInfo,
		periodicCheckPhone: periodicCheckPhone, periodicCheckCycle: periodicCheckCycle,
		moduleCommentCheck:       moduleCommentCheck,
		returnInteractionComment: returnInteractionComment, returnInteractionDay: returnInteractionDay,
		pointName:    pointName,
		cookiePrefix: cookiePrefix, detailPointState: detailPointState, cryptKey: cryptKey,
		nicknameEditState: nicknameEditState, nicknameEditInfo: nicknameEditInfo,
		nicknameEditAudit: nicknameEditAudit, pwdLevel: pwdLevel, cardState: cardState,
		siteCityName: dep.SiteCityName, siteCityID: dep.SiteCityID, notifyVars: dep.NotifyVars,
		sendMail: dep.SendMail, wxPhoneNumber: dep.WxPhoneNumber, dyPhoneNumber: dep.DyPhoneNumber,
		identCardPositive: dep.IdentCardPositive, identCardContrary: dep.IdentCardContrary, idCheck: dep.IDCheck,
		friendTable: t("member_friend"),
		levelTable:  t("member_level"), businessTable: t("business_list"), staffTable: t("staff"),
		securityTable: t("member_security"), datingTable: t("dating_member"), areaTable: t("site_area"),
		bonusTable: t("member_bonus"), paymentTable: t("site_payment"),
	}
	// member.detail 已迁移：默认把自身投影接到 getComment 的 userDetail 钩子上，
	// 消除此前 nil → 102 的回退（Dep.UserDetail 仍可覆盖，测试用）。
	if svc.userDetail == nil {
		svc.userDetail = svc.userDetailHook
	}
	return svc, nil
}

// Register 注册本服务的全部 action。
func Register(router *ajax.Router, s *Service) {
	router.Register("member", "message", s.message)
	router.Register("member", "reward", s.reward)
	router.Register("member", "getComment", s.getComment)
	router.Register("member", "detail", s.detail)
	router.Register("member", "followMember", s.followMember)
	router.Register("member", "collect", s.collect)
	router.Register("member", "getZan", s.getZan)
	router.Register("member", "replyComment", s.replyComment)
	router.Register("member", "dingComment", s.dingComment)
	router.Register("member", "sendComment", s.sendComment)
	router.Register("member", "updateAccount", s.updateAccount)
}

// defaultCommentCheck 是 include/config/<module>.inc.php 里 $customCommentCheck 的仓库现值
// （sendComment/replyComment 的 ischeck）。没有配置文件或未列出的模块按 0（发表后待审核）。
var defaultCommentCheck = map[string]int{
	"article": 0, "awardlegou": 0, "circle": 1, "huodong": 1, "image": 1, "info": 0,
	"live": 0, "marry": 1, "paimai": 0, "pension": 1, "quanjing": 1, "sfcar": 0,
	"shop": 0, "tieba": 0, "travel": 1, "video": 1, "vote": 1,
	// tuan / homemaking / business / waimai：仓库内无配置（waimai 只有 .example）→ 0。
}

// phpFloat 复刻 PHP 7.1+ json_encode 对 float 的输出：整数值带 ".0"（ceil() 返回 float），-0 写 "-0.0"。
type phpFloat float64

func (f phpFloat) MarshalJSON() ([]byte, error) {
	v := float64(f)
	s := strconv.FormatFloat(v, 'f', -1, 64)
	if !strings.ContainsAny(s, ".") {
		s += ".0"
	}
	return []byte(s), nil
}

type pageInfo struct {
	Page          int      `json:"page"`
	PageSize      int      `json:"pageSize"`
	TotalPage     phpFloat `json:"totalPage"`
	TotalCount    int      `json:"totalCount"`
	Unread        int      `json:"unread"`
	Read          int      `json:"read"`
	IM            *int     `json:"im,omitempty"`
	Upunread      *int     `json:"upunread,omitempty"`
	Commentunread *int     `json:"commentunread,omitempty"`
	Total         *int     `json:"total,omitempty"`
}

type item struct {
	Date      string          `json:"date"`
	Timestamp *string         `json:"timestamp"`
	State     *string         `json:"state"`
	Title     *string         `json:"title"`
	ID        *string         `json:"id"`
	Body      json.RawMessage `json:"body"`
	URL       string          `json:"url"`
}

type statsInfo struct {
	PageInfo pageInfo `json:"pageInfo"`
}

type listInfo struct {
	PageInfo pageInfo `json:"pageInfo"`
	List     []item   `json:"list"`
}

func fail(info string) ajax.Response { return ajax.Response{State: stateFail, Info: info} }
func noData() ajax.Response          { return ajax.Response{State: stateNoData, Info: infoNoData} }

// message 迁移自 member.class.php:2231-2395。分支与口径见 #245 的「业务规则：member.message」。
func (s *Service) message(req *ajax.Request) ajax.Response {
	if s.db == nil {
		return noData()
	}
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	p := newParams(req)

	// param 为空时 $type 是 int 0，PHP 7 里 0 == 'tongji' 为真 → 统计分支。
	// param 非空但没传 type 时是 null，null == 'tongji' 为假 → 列表分支。
	paramEmpty := len(req.Params) == 0
	tongji := paramEmpty || p.scalar("type") == "tongji"

	// —— uid：userid 为真值（非 "" / "0"）就原样用，否则取登录会员；匿名是 -1，不报登录错误 ——
	var uid any
	if userid, ok := p.truthyUserID(); ok {
		if userid.isArray || !isNumeric(userid.value) {
			return fail(infoLoginTimeout)
		}
		uid = userid.value
	} else {
		id, err := s.identityID(ctx, req.HTTP)
		if err != nil {
			return noData()
		}
		uid = id
	}

	pageSize := p.pageLike("pageSize", 10)
	page := p.pageLike("page", 1)
	if pageSize == 0 {
		pageSize = 10
	}
	if page == 0 {
		page = 1
	}
	imFlag := p.intval("im") != 0

	// —— 统计分支专用的两个数 ——
	var upunread, commentunread int
	if tongji {
		var err error
		if upunread, err = s.count(ctx, "SELECT COUNT(*) FROM "+s.upTable+" WHERE `isread` = 0 AND `uid` = ?", uid); err != nil {
			return noData()
		}
		if commentunread, err = s.commentUnread(ctx, uid); err != nil {
			return noData()
		}
	}

	// —— 未读 / 已读永远是全量，不受 state 影响 ——
	base := "SELECT COUNT(*) FROM " + s.logTable + " WHERE `uid` = ?"
	unread, err := s.count(ctx, base+" AND `state` = 0", uid)
	if err != nil {
		return noData()
	}
	read, err := s.count(ctx, base+" AND `state` = 1", uid)
	if err != nil {
		return noData()
	}

	// —— state：不传 / "" / 非空值 三种口径 ——
	state, stateSet := p.state()
	countSQL, countArgs := base, []any{uid}
	var stateNum int64
	if stateSet && state != "" {
		stateNum = leadingInt(state)
		countSQL += " AND `state` = ?"
		countArgs = append(countArgs, stateNum)
	}
	totalCount, err := s.count(ctx, countSQL, countArgs...)
	if err != nil {
		return noData()
	}
	if totalCount == 0 && !tongji {
		return fail(infoEmpty)
	}

	numerator := totalCount
	switch {
	case !stateSet:
		// null !== "" 且 null == 0 → 取未读
		numerator = unread
	case state != "":
		// 字符串与 0 / 1 做松散比较，取的是开头的整数：'0,1' == 0、'1,2' == 1。
		switch stateNum {
		case 0:
			numerator = unread
		case 1:
			numerator = read
		}
	}
	// state === ""（传了 0 / 空串 / abc）：不进分支，保持 totalCount。

	info := pageInfo{
		Page: page, PageSize: pageSize,
		TotalPage:  phpFloat(math.Ceil(float64(numerator) / float64(pageSize))),
		TotalCount: totalCount, Unread: unread, Read: read,
	}

	if imFlag {
		im := 0
		var raw sql.NullInt64
		err := s.db.QueryRowContext(ctx, "SELECT `im_unread_count` FROM "+s.memberTable+" WHERE `id` = ?", uid).Scan(&raw)
		if err != nil && err != sql.ErrNoRows {
			return noData()
		}
		if err == nil {
			im = int(raw.Int64)
		}
		info.IM = &im
	}

	if tongji {
		info.Upunread, info.Commentunread = &upunread, &commentunread
		imValue := 0
		if info.IM != nil {
			imValue = *info.IM
		}
		total := unread + imValue + upunread + commentunread
		info.Total = &total
		return ajax.Response{State: ajax.StateOK, Info: statsInfo{PageInfo: info}}
	}

	list := []item{}
	atpage := pageSize * (page - 1)
	// POST 的 page / pageSize 没有 <=0 归一：负数会让 LIMIT 语法错误，PHP 侧 results 为 false，list 为空数组。
	if atpage >= 0 && pageSize > 0 {
		list, err = s.list(ctx, req.HTTP, uid, stateSet && state != "", stateNum, atpage, pageSize)
		if err != nil {
			return noData()
		}
	}
	return ajax.Response{State: ajax.StateOK, Info: listInfo{PageInfo: info, List: list}}
}

func (s *Service) count(ctx context.Context, query string, args ...any) (int, error) {
	var n int
	if err := s.db.QueryRowContext(ctx, query, args...).Scan(&n); err != nil {
		return 0, err
	}
	return n, nil
}

// commentUnread 对应 tongji 分支的评论未读：先取自己名下 ischeck=1 的评论 id，
// 非空 → sid IN (…) 或 (masterid=uid AND sid=0)；为空 → 只看 masterid=uid AND sid=0。
func (s *Service) commentUnread(ctx context.Context, uid any) (int, error) {
	rows, err := s.db.QueryContext(ctx, "SELECT `id` FROM "+s.commentTable+" WHERE `ischeck` = 1 AND `userid` = ?", uid)
	if err != nil {
		return 0, err
	}
	var ids []string
	for rows.Next() {
		var id int64
		if err := rows.Scan(&id); err != nil {
			_ = rows.Close()
			return 0, err
		}
		ids = append(ids, strconv.FormatInt(id, 10))
	}
	if err := rows.Err(); err != nil {
		_ = rows.Close()
		return 0, err
	}
	_ = rows.Close()

	query := "SELECT COUNT(*) FROM " + s.commentTable + " WHERE `isread` = 0 AND "
	if len(ids) > 0 {
		query += "(`sid` IN (" + strings.Join(ids, ",") + ") OR (`masterid` = ? AND `sid` = 0))"
	} else {
		query += "`masterid` = ? AND `sid` = 0"
	}
	return s.count(ctx, query, uid)
}

func (s *Service) list(ctx context.Context, req *http.Request, uid any, hasState bool, stateNum int64, atpage, pageSize int) ([]item, error) {
	query := "SELECT log.`id`, log.`state`, l.`title`, l.`date`, l.`body`, l.`urlParam` FROM " + s.logTable +
		" log LEFT JOIN " + s.letterTable + " l ON l.`id` = log.`lid` WHERE log.`uid` = ?"
	args := []any{uid}
	if hasState {
		query += " AND log.`state` = ?"
		args = append(args, stateNum)
	}
	query += " ORDER BY log.`id` DESC LIMIT ?, ?"
	args = append(args, atpage, pageSize)

	rows, err := s.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()

	caller := int64(-1)
	if s.urlPath != nil {
		// url 的模板参数取决于调用方身份，不是目标 uid。
		caller = s.memberID(ctx, req)
	}
	out := []item{}
	for rows.Next() {
		var id, state, title, date, body, urlParam sql.NullString
		if err := rows.Scan(&id, &state, &title, &date, &body, &urlParam); err != nil {
			return nil, err
		}
		it := item{
			Date:  formatDate(date),
			Title: ptr(title), ID: ptr(id), State: ptr(state), Timestamp: ptr(date),
			Body: renderBody(body),
		}
		it.URL = s.renderURL(urlParam, caller, id.String)
		out = append(out, it)
	}
	return out, rows.Err()
}

// memberID 对应 getMemberID()：没有识别器或识别出错都按匿名 -1。
func (s *Service) memberID(ctx context.Context, req *http.Request) int64 {
	id, err := s.identityID(ctx, req)
	if err != nil {
		return -1
	}
	return id
}

func (s *Service) identityID(ctx context.Context, req *http.Request) (int64, error) {
	if s.identity == nil || req == nil {
		return -1, nil
	}
	return s.identity.MemberID(ctx, req)
}

func ptr(v sql.NullString) *string {
	if !v.Valid {
		return nil
	}
	return &v.String
}

// formatDate 对应 date("Y-m-d H:i:s", $val['date'])：LEFT JOIN 未命中时 date 为 NULL，按 0 处理。
func formatDate(v sql.NullString) string {
	ts, _ := strconv.ParseInt(strings.TrimSpace(v.String), 10, 64)
	return time.Unix(ts, 0).In(gmt8).Format("2006-01-02 15:04:05")
}

// renderBody 对应 strstr(body,'first') && strstr(body,'remark') ? json_decode(body, true) : body。
// 命中时透传原字节（紧凑化）以保留键顺序；解码失败 → null。
func renderBody(body sql.NullString) json.RawMessage {
	if !body.Valid {
		return json.RawMessage("null")
	}
	if strings.Contains(body.String, "first") && strings.Contains(body.String, "remark") {
		if !utf8.ValidString(body.String) || !json.Valid([]byte(body.String)) {
			return json.RawMessage("null")
		}
		var buf bytes.Buffer
		if err := json.Compact(&buf, []byte(body.String)); err != nil {
			return json.RawMessage("null")
		}
		out := buf.String()
		if out == "{}" { // 关联数组解码后的空数组
			out = "[]"
		}
		return json.RawMessage(out)
	}
	quoted, _ := json.Marshal(body.String)
	return quoted
}

// renderURL 对应 urlParam 的两条分支。
// serialized string（s:N:"…";）：strstr(...) > -1 恒为真（false > -1 也为真），
// 所以任何非空字符串都直接当 url（PHP 松散比较 bug，照抄）；
// 其余（serialized array、空、反序列化失败）→ getUrlPath。
// 注意：字符串里含 wxMiniprogram:// 时 PHP 还会按 cfg_miniProgramId 补小程序 ID，
// 该配置 Go 侧暂无来源，这里原样输出（见 PR 遗留问题）。
func (s *Service) renderURL(urlParam sql.NullString, caller int64, id string) string {
	if urlParam.Valid && urlParam.String != "" {
		if str, ok := unserializeString(urlParam.String); ok && str != "" {
			return str
		}
	}
	if s.urlPath != nil {
		return s.urlPath(caller, id)
	}
	return ""
}

// unserializeString 只识别 PHP serialize 出来的 string：s:<len>:"<bytes>";
func unserializeString(v string) (string, bool) {
	if !strings.HasPrefix(v, `s:`) {
		return "", false
	}
	rest := v[2:]
	colon := strings.IndexByte(rest, ':')
	if colon <= 0 {
		return "", false
	}
	n, err := strconv.Atoi(rest[:colon])
	if err != nil || n < 0 {
		return "", false
	}
	rest = rest[colon+1:]
	if len(rest) != n+3 || rest[0] != '"' || rest[len(rest)-2:] != `";` {
		return "", false
	}
	return rest[1 : 1+n], true
}

func isNumeric(v string) bool { return numericPattern.MatchString(v) }

// leadingInt 取字符串开头的整数（state 只会是 convertArrToStrWithComma 的输出：整数用逗号拼）。
func leadingInt(v string) int64 {
	end := 0
	if end < len(v) && (v[end] == '-' || v[end] == '+') {
		end++
	}
	for end < len(v) && v[end] >= '0' && v[end] <= '9' {
		end++
	}
	n, _ := strconv.ParseInt(v[:end], 10, 64)
	return n
}
