// comment.go 是 travel 批次3（#372）评论互动 5 个 action：
// common / getCommonList / dingCommon / sendCommon / commentDetail
// （travel.class.php L5924-6294）。业务规则盘点见 #372 规则评论
// （issuecomment-7229447055）；L2 对比只覆盖读路径（common/getCommonList/
// commentDetail），写路径按 #355 口径仅做 L1。
package travel

import (
	"context"
	"database/sql"
	"math"
	"net/http"
	"regexp"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// —— 文案（zh-CN 语言包运行时值，实测见 #372 规则评论）——
const (
	infoTravelLoginTimeout = "登录超时，请重新登录！" // siteConfig[20][262]
	infoPassCommentID      = "请传递评论ID！"        // travel[12][67]
	infoAlreadyDing        = "已顶过！"             // travel[12][68]
	infoTravelCommentGone  = "评论不存在或已删除！"     // travel[12][69]
	infoTravelFieldEmpty   = "必填项不得为空！"        // travel[12][70]
	infoTravelCommentFail  = "评论失败！"            // travel[12][71]
)

// dsqlUpdateOK 是 dsqlOper(sql, "update") 的固定返回值（dsql.class.php:1013-1017），
// dingCommon 成功路径把它原样 return → handlers 包成 state=100 info="ok"。
const dsqlUpdateOK = "ok"

// gmt8 对应 GetMkTime 首次调用设置的 date_default_timezone_set('Etc/GMT-8')
// （$cfg_timeZone=8，siteConfig.inc.php:21）→ UTC+8；date("Y-m-d", $dtime) 与
// FloorTime 的日期分支都在此时区下取值。
var gmt8 = time.FixedZone("Etc/GMT-8", 8*3600)

// FloorTime 的相对时间文案（siteConfig[13][41..43,47]）。
const (
	ftimeJustNow = "刚刚"
	ftimeMinute  = "分钟前"
	ftimeHour    = "小时前"
	ftimeDay     = "天前"
)

// floorTime 复刻 FloorTime($seconds)（n=1，time.class.php:161-183）。
func floorTime(sec int64, now time.Time) string {
	days := int64(math.Floor(float64(sec) / 86400))
	hours := int64(float64(sec)/3600) % 24
	minutes := int64(float64(sec)/60) % 60
	times := ftimeJustNow
	if minutes >= 1 {
		times = strconv.FormatInt(minutes, 10) + ftimeMinute
	}
	if hours >= 1 {
		times = strconv.FormatInt(hours, 10) + ftimeHour
	}
	if days >= 1 {
		times = strconv.FormatInt(days, 10) + ftimeDay
	}
	if days > 7 {
		// date("Y-m-d", GetMkTime(time() - $seconds))：time()-seconds 是 int，
		// GetMkTime 对纯数字原样返回；date 走 Etc/GMT-8 时区。
		times = time.Unix(now.Unix()-sec, 0).In(gmt8).Format("2006-01-02")
	}
	return times
}

// ipExtractRe 复刻 GetIP 收尾的 preg_match("/[\d\.]{7,15}/")：取第一段 7–15 位的
// 数字/点串（IPv4 提取；IPv6/畸形值不命中 → "0.0.0.0"）。
var ipExtractRe = regexp.MustCompile(`[\d\.]{7,15}`)

// plainIP 复刻 GetIP()（common.func.php:282-331）：X-Forwarded-For 头存在时只看它
//（取第一个 trim 后 != "unknown" 的段，全 unknown → 空串），否则 HTTP_CLIENT_IP
//（isset 即取，含空串），否则 REMOTE_ADDR（Go 带 ":port"，由末尾正则剥掉），否则
// "0.0.0.0"；最后统一过 [\d\.]{7,15} 提取，不命中 → "0.0.0.0"。
func plainIP(req *http.Request) string {
	realip := ""
	if req == nil {
		return "0.0.0.0"
	}
	if xff, ok := req.Header[http.CanonicalHeaderKey("X-Forwarded-For")]; ok {
		for _, seg := range strings.Split(strings.Join(xff, ","), ",") {
			seg = strings.TrimSpace(seg)
			if seg != "unknown" {
				realip = seg
				break
			}
		}
	} else if ci, ok := req.Header[http.CanonicalHeaderKey("Client-IP")]; ok {
		realip = strings.Join(ci, ",")
	} else if req.RemoteAddr != "" {
		realip = req.RemoteAddr
	} else {
		realip = "0.0.0.0"
	}
	if m := ipExtractRe.FindString(realip); m != "" {
		return m
	}
	return "0.0.0.0"
}

// userInfoOf 复刻 userLogin::getMemberInfo($uid)（userLogin.class.php:687-703）：
//   - empty($uid)（含 "0"）→ mid = getMemberID()；
//   - mid > -1 → handlers("member","detail")，**无条件取返回的 info**（getMemberInfo
//     不看 state：member.detail 未命中时 PHP 拿到的是 101 的错误文案字符串）；
//   - 否则 []（未初始化的 $memberInfo 空数组）。
func (s *Service) userInfoOf(req *ajax.Request, uid string) any {
	mid := uid
	if !truthy(uid) {
		mid = strconv.FormatInt(s.viewerID(context.Background(), req), 10)
	}
	if phpInt(mid) <= -1 {
		return []any{}
	}
	if s.memberDetail == nil {
		return []any{}
	}
	sub := &ajax.Request{Service: "member", Action: "detail", HTTP: req.HTTP}
	sub.Params = url.Values{}
	sub.Params.Set("id", mid)
	sub.ParamsEscaped = sub.Params
	return s.memberDetail(sub).Info
}

// phpNumericRe 复刻 PHP 8 的数值字符串判定（is_numeric 语义）：首尾空白（空格/
// \t\n\r\v\f）允许，可选符号、整数/小数、科学计数法。十六进制等不算。
var phpNumericRe = regexp.MustCompile(`^[ \t\n\r\v\f]*[+-]?([0-9]+(\.[0-9]*)?|\.[0-9]+)([eE][+-]?[0-9]+)?[ \t\n\r\v\f]*$`)

// looseStrEqual 复刻 PHP 8 的字符串松散相等（`==`）：两侧都是数值字符串时按数值
// 比较（"01" == "1"、"1e0" == "1" 为真），否则按字节比较。
func looseStrEqual(a, b string) bool {
	if phpNumericRe.MatchString(a) && phpNumericRe.MatchString(b) {
		fa, _ := strconv.ParseFloat(strings.TrimSpace(a), 64)
		fb, _ := strconv.ParseFloat(strings.TrimSpace(b), 64)
		return fa == fb
	}
	return a == b
}

// inNumList 复刻 in_array($memberID(int), explode(",", $duser))：needle 为 int，
// PHP 8 字符串与 int 比较只在字符串是数值串时按数值比较，否则恒 false
//（"1e0"、"+1"、首尾空白均按 is_numeric 语义处理）。
func inNumList(uid int64, raw string) bool {
	for _, seg := range strings.Split(raw, ",") {
		if phpNumericRe.MatchString(seg) {
			if f, err := strconv.ParseFloat(strings.TrimSpace(seg), 64); err == nil && f == float64(uid) {
				return true
			}
		}
	}
	return false
}

// commonPage 是 common/getCommonList 共用的行数据（SELECT 列序即表列序）。
type commonRow struct {
	id, userid, content, dtime, ip, ipaddr, good, bad, duser string
}

// common 评论列表（travel.class.php:6008-6091，读）。
//
// 返回 array(pageInfo, list) → handlers 包成 state=100；totalCount==0 →
// state=200「暂无数据！」→ 101。newsid 原始值拼 SQL（无强转）：非数字 PHP 会产生
// SQL 语法错误（dsqlOper 返回错误串的怪面），Go 不复刻注入错误面，统一按
// 「暂无数据」101 降级（已知偏差，同 #371 phpIntList 口径）。
func (s *Service) common(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	host := reqHost(req)

	newsid := req.Params.Get("newsid")
	orderby := req.Params.Get("orderby")
	typeid := req.Params.Get("typeid")

	// 入口归一已对 GET 的 page/pageSize 做 (int)（<=0 取默认 1/10）；POST 可保留
	// 0/负值，action 内 empty() 对 0 兜底（负值 PHP 走 LIMIT 报错面，Go 随查询
	// 失败落到 101，已知偏差）。
	page := phpInt(req.Params.Get("page"))
	if page == 0 {
		page = 1
	}
	pageSize := phpInt(req.Params.Get("pageSize"))
	if pageSize == 0 {
		pageSize = 10
	}

	// newsid 非数字 → PHP SQL 语法错误 → 已知偏差按空结果降级。
	if !isNumericString(newsid) {
		return ajax.Response{State: stateParamFailed, Info: infoNoTravelItem}
	}

	where := " AND `ischeck` = 1 AND `floor` = 0"
	if typeid != "" { // PHP $typeid!=''（"0" 参与）
		where = " AND `type` = ?" + where
	}
	oby := " ORDER BY `id` DESC"
	if orderby == "hot" {
		oby = " ORDER BY `good` DESC, `id` DESC"
	}

	table := "`" + s.prefix + "travelcommon`"
	// 占位符顺序 = SQL 顺序：aid 在前，typeid（若有）在后。
	var countArgs []any
	countArgs = append(countArgs, newsid)
	if typeid != "" {
		countArgs = append(countArgs, typeid)
	}
	// PHP totalCount 查询 = SELECT id,... WHERE aid = newsid ...（无 LIMIT）。
	totalCount := s.countRows(ctx, "SELECT `id` FROM "+table+" WHERE `aid` = ?"+where+oby, countArgs...)
	if totalCount == 0 {
		return ajax.Response{State: stateParamFailed, Info: infoNoTravelItem}
	}
	if totalCount < 0 {
		// 查询错误面：PHP 会带着错误串继续走并返回空 list（不可复刻），按空结果降级。
		return ajax.Response{State: stateParamFailed, Info: infoNoTravelItem}
	}

	limArgs := append([]any{}, countArgs...)
	limArgs = append(limArgs, pageSize*(page-1), pageSize)
	rows, ok := s.queryRows(ctx,
		"SELECT `id`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `duser` FROM "+table+
			" WHERE `aid` = ?"+where+oby+" LIMIT ?, ?", limArgs...)
	if !ok {
		return ajax.Response{State: stateParamFailed, Info: infoNoTravelItem}
	}

	pageinfo := newOmap()
	pageinfo.set("page", page)
	pageinfo.set("pageSize", pageSize)
	pageinfo.set("totalPage", phpCeil(strconv.Itoa(totalCount), float64(pageSize)))
	pageinfo.set("totalCount", totalCount)

	list := make([]*omap, 0, len(rows))
	viewer := s.viewerID(ctx, req)
	for _, r := range rows {
		list = append(list, s.commonListRow(ctx, host, req, viewer, r))
	}
	return ajax.Response{State: ajax.StateOK, Info: pagedPayloadList(pageinfo, list)}
}

// getCommonList 楼中楼列表（travel.class.php:5924-6002，读）。
//
// fid (int) empty → state=200「格式错误」（travel[12][23]）→ 101；pageSize 默认
// 99999、page 默认 1；`floor=fid AND ischeck=1` ORDER BY id ASC。行渲染与 common
// 共用（ftime 分支不同），每行递归取下一层（page=1/pageSize=100）。
func (s *Service) getCommonList(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	host := reqHost(req)

	fid := phpInt(req.Params.Get("fid"))
	if fid == 0 { // PHP empty($fid)
		return ajax.Response{State: stateParamFailed, Info: infoAddrFormat}
	}
	page := phpInt(req.Params.Get("page"))
	if page == 0 {
		page = 1
	}
	pageSize := phpInt(req.Params.Get("pageSize"))
	if pageSize == 0 {
		pageSize = 99999
	}

	table := "`" + s.prefix + "travelcommon`"
	totalCount := s.countRows(ctx,
		"SELECT `id` FROM "+table+" WHERE `floor` = ? AND `ischeck` = 1 ORDER BY `id` ASC", fid)
	if totalCount == 0 {
		return ajax.Response{State: stateParamFailed, Info: infoNoTravelItem}
	}
	if totalCount < 0 {
		return ajax.Response{State: stateParamFailed, Info: infoNoTravelItem}
	}

	rows, ok := s.queryRows(ctx,
		"SELECT `id`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `duser` FROM "+table+
			" WHERE `floor` = ? AND `ischeck` = 1 ORDER BY `id` ASC LIMIT ?, ?",
		fid, pageSize*(page-1), pageSize)
	if !ok {
		return ajax.Response{State: stateParamFailed, Info: infoNoTravelItem}
	}

	pageinfo := newOmap()
	pageinfo.set("page", page)
	pageinfo.set("pageSize", pageSize)
	pageinfo.set("totalPage", phpCeil(strconv.Itoa(totalCount), float64(pageSize)))
	pageinfo.set("totalCount", totalCount)

	list := make([]*omap, 0, len(rows))
	viewer := s.viewerID(ctx, req)
	for _, r := range rows {
		list = append(list, s.commonListRow(ctx, host, req, viewer, r))
	}
	return ajax.Response{State: ajax.StateOK, Info: pagedPayloadList(pageinfo, list)}
}

// commonListRow 复刻 common/getCommonList 的行渲染。
//
// already：in_array(getMemberID(), explode(",", duser))（未登录 -1 恒不命中）。
// ftime 怪分支：floor((now - dtime/86400)%30) > 30 —— 括号包住整个减法（先减后取模，
// 结果 0..29），恒 ≤ 30 → **恒走 FloorTime(now - dtime)** 分支（compare 实测 4 小时前，
// 不是 date()）。common/getCommonList 两个 action 的 ftime 语义相同。
// lower：递归 getCommonList(fid=行id, page=1, pageSize=100)；子层 totalCount==0 →
// state=200 → PHP `$child['state'] != 200` 不成立 → lower=null。
func (s *Service) commonListRow(ctx context.Context, host string, req *ajax.Request, viewer int64, r rowVal) *omap {
	m := newOmap()
	m.set("id", r.str("id"))
	m.set("userinfo", s.userInfoOf(req, r.str("userid")))
	m.set("content", r.str("content"))
	m.set("dtime", r.str("dtime"))
	m.set("ftime", floorTime(time.Now().Unix()-int64(phpInt(r.str("dtime"))), time.Now()))
	m.set("ip", r.str("ip"))
	m.set("ipaddr", r.str("ipaddr"))
	m.set("good", r.str("good"))
	m.set("bad", r.str("bad"))
	if inNumList(viewer, r.str("duser")) {
		m.set("already", 1)
	} else {
		m.set("already", 0)
	}
	// 递归取下一层：fid=行 id、page=1、pageSize=100。
	if children, hasChildren := s.commonChildren(ctx, host, req, viewer, r.str("id")); hasChildren {
		m.set("lower", children)
	} else {
		m.set("lower", nil)
	}
	return m
}

// commonChildren 是 commonListRow 递归的内层（等价 getCommonList(fid=id,1,100)
// 只取 list）：hasChildren=false 对应子层 state=200（totalCount==0）→ lower=null。
func (s *Service) commonChildren(ctx context.Context, host string, req *ajax.Request, viewer int64, fid string) ([]*omap, bool) {
	fidN := phpInt(fid)
	if fidN == 0 {
		return nil, false
	}
	table := "`" + s.prefix + "travelcommon`"
	totalCount := s.countRows(ctx,
		"SELECT `id` FROM "+table+" WHERE `floor` = ? AND `ischeck` = 1 ORDER BY `id` ASC", fidN)
	if totalCount <= 0 {
		return nil, false
	}
	rows, ok := s.queryRows(ctx,
		"SELECT `id`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `duser` FROM "+table+
			" WHERE `floor` = ? AND `ischeck` = 1 ORDER BY `id` ASC LIMIT ?, ?",
		fidN, 0, 100)
	if !ok {
		return nil, false
	}
	list := make([]*omap, 0, len(rows))
	for _, r := range rows {
		list = append(list, s.commonListRow(ctx, host, req, viewer, r))
	}
	return list, true
}

// dingCommon 顶评论（travel.class.php:6092-6130，写）。
//
// 错误全部是裸字符串返回（handlers 包成 state=100）；成功 return dsqlOper("update")
// 恒为 "ok"（dsql.class.php:1013，不看影响行数）→ state=100 info="ok"。
// id 经入口归一是逗号整数串：单个数字照常；多段（"1,2"）PHP 会拼出语法错误并
// 返回错误串（不可复刻），Go 按「评论不存在或已删除！」降级（已知偏差）。
// `$type = $type ? $type : 0` 是未定义变量 no-op，不迁移。
func (s *Service) dingCommon(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}

	id := req.Params.Get("id")
	if !truthy(id) { // PHP empty($id)，"0" 也算空
		return ajax.Response{State: ajax.StateOK, Info: infoPassCommentID}
	}
	viewer := s.viewerID(ctx, req)
	if viewer == -1 || viewer == 0 {
		return ajax.Response{State: ajax.StateOK, Info: infoTravelLoginTimeout}
	}
	if !isNumericString(id) {
		return ajax.Response{State: ajax.StateOK, Info: infoTravelCommentGone}
	}
	if s.db == nil {
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}

	table := "`" + s.prefix + "travelcommon`"
	var duser sql.NullString
	if err := s.db.QueryRowContext(ctx,
		"SELECT `duser` FROM "+table+" WHERE `id` = ?", id).Scan(&duser); err != nil {
		return ajax.Response{State: ajax.StateOK, Info: infoTravelCommentGone}
	}

	// 已顶过：in_array(getMemberID(), explode(",", duser))。
	if inNumList(viewer, duser.String) {
		return ajax.Response{State: ajax.StateOK, Info: infoAlreadyDing}
	}

	// 附加会员ID：empty($duser)（含 "0"）→ nuser = memberID（int 拼 SQL）；否则 duser.uid。
	nuser := duser.String
	if !truthy(nuser) {
		nuser = strconv.FormatInt(viewer, 10)
	} else {
		nuser = nuser + "," + strconv.FormatInt(viewer, 10)
	}

	// 两条 UPDATE 都执行；返回值取第二条（恒 "ok"）。
	_, _ = s.db.ExecContext(ctx,
		"UPDATE "+table+" SET `good` = `good` + 1 WHERE `id` = ?", id)
	_, _ = s.db.ExecContext(ctx,
		"UPDATE "+table+" SET `duser` = ? WHERE `id` = ?", nuser, id)
	return ajax.Response{State: ajax.StateOK, Info: dsqlUpdateOK}
}

// sendCommon 发表评论（travel.class.php:6136-6181，写）。
//
// 无登录门禁：userid = getMemberID()（未登录 -1 照写入库）。content 清洗链：
// addslashes($param)（入口转义视图的还原，S(A(x))=x）→ empty 判空（"0" 算空）→
// cn_substrR(.,250)（作用在转义串上，可能截断转义序列）→ filterSensitiveWords
// （内部 addslashes(stripslashes()) 互抵一次；本地 cfg_moderationWB=0、
// cfg_replacestr='傻子'、末尾 RemoveXSS）→ INSERT 字面量再剥一层反斜杠（存原文）。
// ipaddr 需要 IP 库，Go 写空串（已知偏差，同 member.sendComment）。写路径仅 L1。
func (s *Service) sendCommon(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}

	aid := req.Params.Get("aid")
	floor := req.Params.Get("id") // PHP $id = $param['id'] → INSERT 的 floor 列
	typ := phpInt(req.Params.Get("type"))

	// PHP: $content = addslashes($param['content']) —— $param 是入口转义视图
	// （ParamsEscaped），action 自身的 addslashes 再叠一层；filter 内部的
	// addslashes(stripslashes()) 把它原样保回来，INSERT 字面量被 MySQL 解析后
	// 存的是「转义视图」（引号前带一层反斜杠，同 member.sendComment 的 A(P) 口径）。
	content := ajax.PHPAddslashes(req.ParamsEscaped.Get("content"))
	if !truthy(aid) || content == "" || content == "0" { // PHP empty()
		return ajax.Response{State: stateParamFailed, Info: infoTravelFieldEmpty}
	}
	content = cnSubstrR(content, 250)
	content = ajax.FilterSensitiveWords(content, true)
	// INSERT 字面量 '$content' 被 MySQL 再解一层反斜杠 → 存转义视图。
	content = ajax.PHPStripslashes(content)

	viewer := s.viewerID(ctx, req)
	if s.db == nil {
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}

	table := "`" + s.prefix + "travelcommon`"
	now := time.Now().Unix()
	ip := plainIP(req.HTTP)
	// getIpAddr 需要 IP 库 → 写空串（已知偏差）。
	res, err := s.db.ExecContext(ctx,
		"INSERT INTO "+table+" (`aid`, `floor`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `ischeck`, `duser`, `type`) "+
			"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
		aid, floor, viewer, content, now, ip, "", 0, 0, s.commentCheck, "", typ)
	if err != nil {
		return ajax.Response{State: stateParamFailed, Info: infoTravelCommentFail}
	}
	lid, err := res.LastInsertId()
	if err != nil || lid == 0 {
		return ajax.Response{State: stateParamFailed, Info: infoTravelCommentFail}
	}

	var cID, cUserID, cContent, cDtime, cIP, cIPAddr, cGood, cBad sql.NullString
	err = s.db.QueryRowContext(ctx,
		"SELECT `id`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad` FROM "+table+" WHERE `id` = ?", lid).
		Scan(&cID, &cUserID, &cContent, &cDtime, &cIP, &cIPAddr, &cGood, &cBad)
	if err != nil {
		// PHP: 回查失败 → 隐式 return null → handlers 102「No data!」。
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}

	list := newOmap()
	list.set("id", cID.String)
	list.set("userinfo", s.userInfoOf(req, cUserID.String))
	list.set("content", cContent.String)
	list.set("dtime", cDtime.String)
	// ftime：GetMkTime(time()) - dtime > 30 → dtime；否则 FloorTime(diff)。
	// 刚插入 → diff ≤ 30 → 「刚刚」。
	diff := now - int64(phpInt(cDtime.String))
	if diff > 30 {
		list.set("ftime", cDtime.String)
	} else {
		list.set("ftime", floorTime(diff, time.Unix(now, 0)))
	}
	list.set("ip", cIP.String)
	list.set("ipaddr", cIPAddr.String)
	list.set("good", cGood.String)
	list.set("bad", cBad.String)
	return ajax.Response{State: ajax.StateOK, Info: list}
}

// commentDetail 评价详情（travel.class.php:6186-6289，读）。
//
// SELECT *（键序=表列序）+ 派生键：floor>0 时在 floor 前插 parcontent/parusername；
// duser 前插 zan_userArr；尾部 zan_has 与 user。无行 → return null → 102「No data!」。
// isanony 列不存在（实测 SHOW COLUMNS）→ $ret['isanony'] 恒 null → 恒走实名分支；
// 会员查不到 → $userinfo 未定义 → PHP 8 warning → null。
func (s *Service) commentDetail(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	host := reqHost(req)

	id := phpInt(req.Params.Get("id"))
	viewer := s.viewerID(ctx, req)
	if s.db == nil {
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}

	table := "`" + s.prefix + "travelcommon`"
	rows, ok := s.queryRows(ctx,
		"SELECT `id`, `aid`, `floor`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `ischeck`, `duser`, `type` FROM "+
			table+" WHERE `id` = ? AND `isCheck` = 1", id)
	if !ok || len(rows) == 0 {
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}
	r := rows[0]

	d := newOmap()
	// 原始列直接透传（r.get 保留 SQL NULL → JSON null，同 PHP FETCH_ASSOC 的 null）；
	// 当前表所有列 NOT NULL，实测均为字符串。
	d.set("id", r.get("id"))
	d.set("aid", r.get("aid"))

	// 父级内容（floor>0 时）：parcontent/parusername 插在 floor 键之前。
	floorVal := r.str("floor")
	if truthy(floorVal) { // PHP if($value)
		parcontent := ""
		var parusername any = "" // $username 初始 ''
		if par, ok2 := s.queryRows(ctx,
			"SELECT `content`, `userid` FROM "+table+" WHERE `id` = ? AND `isCheck` = 1", floorVal); ok2 && len(par) > 0 {
			parcontent = par[0].str("content")
			parusername = s.memberDisplayName(ctx, host, par[0].str("userid"), "id, mtype, nickname, company")
		}
		d.set("parcontent", parcontent)
		d.set("parusername", parusername)
	}
	d.set("floor", r.get("floor"))
	d.set("userid", r.get("userid"))
	d.set("content", r.get("content"))
	d.set("dtime", r.get("dtime"))
	d.set("ip", r.get("ip"))
	d.set("ipaddr", r.get("ipaddr"))
	d.set("good", r.get("good"))
	d.set("bad", r.get("bad"))
	d.set("ischeck", r.get("ischeck"))

	// zan_userArr 插在 duser 键之前。
	duserVal := r.str("duser")
	zanUserArr, zanResTruthy := s.zanUserArr(ctx, host, duserVal)
	d.set("zan_userArr", zanUserArr)
	d.set("duser", r.get("duser"))
	d.set("type", r.get("type"))

	// zan_has：在 `if($res){ ... }` 内 → 查询结果 truthy（有行）且 uid != -1 且 uid ∈ duser。
	if zanResTruthy && viewer != -1 && inNumList(viewer, duserVal) {
		d.set("zan_has", 1)
	} else {
		d.set("zan_has", 0)
	}

	// user：isanony 恒 null（列不存在）→ 恒实名分支。会员查不到 → $userinfo 未定义 → null。
	var user any
	if mem, ok2 := s.queryRows(ctx,
		"SELECT `id`, `mtype`, `nickname`, `company`, `photo` FROM `"+s.prefix+"member` WHERE `id` = ?", r.str("userid")); ok2 && len(mem) > 0 {
		nickname := mem[0].str("nickname")
		if mem[0].str("mtype") == "2" && truthy(mem[0].str("company")) {
			nickname = mem[0].str("company")
		}
		// mtype==2 但 company 空 → nickname（列值）；company 列 NULL → str() "" → 回 nickname。
		photo := ""
		if truthy(mem[0].str("photo")) {
			photo = s.filePath(ctx, host, mem[0].str("photo"))
		}
		u := newOmap()
		u.set("id", mem[0].str("id"))
		u.set("nickname", nickname)
		u.set("photo", photo)
		user = u
	} else {
		user = nil // PHP $userinfo 未定义 → warning → null
	}
	d.set("user", user)
	return ajax.Response{State: ajax.StateOK, Info: d}
}

// memberDisplayName 复刻 commentDetail 里父级作者名查询：
// SELECT <cols> FROM member WHERE id IN (uid)；mtype==2 → company||nickname；
// 会员行缺失 → $res[0]['mtype'] warning → null → $username = $res[0]['nickname']
// 再 warning → null（JSON null）。
// cols 只用于构造 SQL（父级查询不带 photo："id, mtype, nickname, company"）。
func (s *Service) memberDisplayName(ctx context.Context, host string, uid, cols string) any {
	mtype2 := func(m rowVal) string {
		if m.str("mtype") == "2" {
			if truthy(m.str("company")) {
				return m.str("company")
			}
		}
		return m.str("nickname")
	}
	if !isNumericString(uid) {
		// PHP 拼 `id IN (abc)` → 语法错误 → 错误串 truthy → 各下标取 "{"。
		return "{"
	}
	mem, ok := s.queryRows(ctx,
		"SELECT "+cols+" FROM `"+s.prefix+"member` WHERE `id` IN ("+phpIntStrList(uid)+")")
	if !ok {
		return "{"
	}
	if len(mem) == 0 {
		// $res[0] 越界两次 → null。
		return nil
	}
	return mtype2(mem[0])
}

// phpIntStrList 把逗号分隔串的每段 (int) 化后重拼（PHP `IN (".value.")` 对非数字段
// 会产生语法错误，这里按 #371 口径取 intval，非数字段落 0 → 匹配不到）。
func phpIntStrList(raw string) string {
	parts := strings.Split(raw, ",")
	for i, p := range parts {
		parts[i] = strconv.Itoa(phpInt(p))
	}
	return strings.Join(parts, ",")
}

// zanUserArr 复刻 duser 键的赞用户列表：duser 非空 → member IN(duser)，按 explode
// 段与行 id 数值匹配（未匹配段跳过）；photo truthy → getFilePath，否则 ""。
// 第二个返回值对应 PHP `$res` 的 truthy（有行 → true；查询错误串 truthy → true，
// 但 foreach 不迭代 → 空数组），zan_has 判定依赖它。
func (s *Service) zanUserArr(ctx context.Context, host string, duser string) ([]*omap, bool) {
	out := []*omap{}
	if !truthy(duser) {
		return out, false
	}
	mem, ok := s.queryRows(ctx,
		"SELECT `id`, `mtype`, `nickname`, `company`, `photo` FROM `"+s.prefix+"member` WHERE `id` IN ("+phpIntStrList(duser)+")")
	if !ok {
		// dsqlOper 错误串 truthy：$res 为真 → zan_has 判定可进，foreach 不迭代。
		return out, true
	}
	if len(mem) == 0 {
		return out, false
	}
	for _, v := range strings.Split(duser, ",") {
		for _, m := range mem {
			if looseStrEqual(v, m.str("id")) {
				nickname := m.str("nickname")
				if m.str("mtype") == "2" && truthy(m.str("company")) {
					nickname = m.str("company")
				}
				photo := ""
				if truthy(m.str("photo")) {
					photo = s.filePath(ctx, host, m.str("photo"))
				}
				e := newOmap()
				e.set("id", v)
				e.set("nickname", nickname)
				e.set("photo", photo)
				out = append(out, e)
			}
		}
	}
	return out, true
}
