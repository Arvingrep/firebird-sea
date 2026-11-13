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
	// Clock 仅测试用；nil 取 time.Now。
	Clock func() time.Time
}

// Service 是 member 服务的实现。
type Service struct {
	db       *sql.DB
	identity Identity
	urlPath  func(caller int64, id string) string

	logTable, letterTable, upTable, commentTable, memberTable string
	paotuiTable, tiebaTable, followTable                      string

	files            *fburl.Resolver
	userDetail       UserDetailFunc
	moduleDetail     ModuleDetailFunc
	decodeAttachment func(string) string
	courierID        func(ctx context.Context, req *http.Request) (int64, error)
	ipHomeMode       int
	clock            func() time.Time
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
	return &Service{
		files: dep.Files, userDetail: dep.UserDetail, moduleDetail: dep.ModuleDetail,
		decodeAttachment: dep.DecodeAttachment, courierID: dep.CourierID, ipHomeMode: mode, clock: dep.Clock,
		paotuiTable: t("paotui_order"), tiebaTable: t("tieba_list"), followTable: t("member_follow"),
		db: dep.DB, identity: dep.Identity, urlPath: dep.URLPath,
		logTable: t("member_letter_log"), letterTable: t("member_letter"),
		upTable: t("public_up_all"), commentTable: t("public_comment_all"), memberTable: t("member"),
	}, nil
}

// Register 注册本服务的全部 action。
func Register(router *ajax.Router, s *Service) {
	router.Register("member", "message", s.message)
	router.Register("member", "getComment", s.getComment)
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
