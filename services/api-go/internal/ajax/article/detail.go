package article

import (
	"context"
	"database/sql"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/fburl"
)

// detailInfoParamError 是 detail() 唯一的一条参数错误文案（article.class.php:1091）：
// action 返回 state=200，外层 handlers::getHandle 统一改写成 101（只改码不改文案）。
const detailInfoParamError = "格式错误！"

// detailEmpty 复刻 PHP empty() 对字符串的判定："" 与 "0" 都算空。
func detailEmpty(s string) bool { return s == "" || s == "0" }

// quoteTable 给表名补反引号（表名来自 site_sub_tablelist，拼进 SQL 前统一加引号）。
func quoteTable(name string) string {
	if strings.HasPrefix(name, "`") {
		return name
	}
	return "`" + strings.Trim(name, "`") + "`"
}

// detailNumeric 复刻 PHP is_numeric()（去掉首尾空白后可选的符号 + 十进制/科学计数法）。
// ajax.php 已把 id 归一成整数串，这里再兜一层，免得脏输入直接进 SQL。
var detailNumeric = regexp.MustCompile(`^[ \t\n\r\v\f]*[+-]?([0-9]+(\.[0-9]*)?|\.[0-9]+)([eE][+-]?[0-9]+)?$`)

// detailAttachmentRe 复刻 article.class.php:1207 的 preg_match_all("/$attachment(.*)[\"|'|&| ]/isU", $body)：
// $attachment 是去掉域名与前导斜杠的 "/include/attachment.php?f="（1200-1205），
// /isU 下 (.*) 变成惰性匹配，遇到引号、单引号、&、竖线或空格结束。
var detailAttachmentRe = regexp.MustCompile(`(?is)include/attachment\.php\?f=(.*?)["'|& ]`)

// detailOut 是按 PHP 赋值顺序输出的 info 数组。PHP 的关联数组保序，
// Go 的 map 会按键排序，所以这里自己维护 keys/vals；重复 set 同一键只改值不动位置
// （mold 在 1387 被重新赋值，位置仍是第一次赋值处）。
type detailOut struct {
	keys []string
	vals []any
}

func (o *detailOut) set(key string, val any) {
	for i, k := range o.keys {
		if k == key {
			o.vals[i] = val
			return
		}
	}
	o.keys = append(o.keys, key)
	o.vals = append(o.vals, val)
}

func (o *detailOut) MarshalJSON() ([]byte, error) {
	return marshalPairs(o.keys, func(i int) any { return o.vals[i] })
}

// zhuantiRef 是 detail 的 zhuanti 字段（article.class.php:1401-1406）。
// id / title 来自 LEFT JOIN，父专题不存在时是 NULL，PHP 原样输出 null。
type zhuantiRef struct {
	ID    any    `json:"id"`
	URL   string `json:"url"`
	Title any    `json:"title"`
}

// Detail 导出 detail 自身，供 alist 的 dynamicid 分支与外部装配使用
// （Dep.Detail 需要拿到已经构造好的 Service）。
func (s *Service) Detail(req *ajax.Request) ajax.Response { return s.detailAction(req) }

// detailAction 迁移自 article.class.php:1081-1455，规则见 issue #260「业务规则」评论。
//
// 与 PHP 的已知偏差（均在 PR 里声明）：
//   - 后台管理员会话（getUserID() != -1）没有迁移：Go 侧没有 admin cookie 校验，
//     路径恒按「非管理员」处理，管理员看不到未发布/已删文章。
//   - getCache("article_detail") 不复刻：PHP 的缓存键只有 id（会员看草稿会串到匿名请求），
//     这里直接读库，返回值与 PHP 首次请求一致。
//   - getRealVideoUrl 只做「非腾讯视频原样返回」：腾讯视频要外部 curl，见 alistRealVideoURL。
//   - htmlentities 只转义 & < >：其余带命名实体的字符（é、© 等）不在兼容层范围内。
//   - updateHistoryClick 的「超 50 万行清 3 个月前数据」不迁移（纯副作用 + 6 小时缓存节流）。
func (s *Service) detailAction(req *ajax.Request) ajax.Response {
	noData := ajax.Response{State: stateNoData, Info: infoNoData}

	ctx := context.Background()
	host := ""
	var httpReq *http.Request
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
		host = req.HTTP.Host
		httpReq = req.HTTP
	}

	// ajax.php 已把 id 归一成整数串（数组会拼成 "1,2"）；is_numeric 不通过就是格式错误。
	idRaw := normalizeIDParam(req.Params)
	if !detailNumeric.MatchString(idRaw) {
		return ajax.Response{State: stateParamError, Info: detailInfoParamError}
	}
	id := detailCanonicalID(idRaw)

	// $userid = $userLogin->getMemberID()：未登录是 -1。
	login := int64(-1)
	if s.members != nil && httpReq != nil {
		if v, err := s.members.MemberID(ctx, httpReq); err == nil {
			login = v
		}
	}

	if s.db == nil {
		return noData
	}

	row, ok := s.detailRow(ctx, id, login)
	if !ok {
		return noData
	}

	out := &detailOut{}
	clijoin := func(k string) any { return row[k] }

	out.set("id", clijoin("id"))
	out.set("title", clijoin("title"))
	out.set("cityid", clijoin("cityid"))
	out.set("subtitle", htmlNoQuotes(sdStr(row["subtitle"])))
	out.set("flag", clijoin("flag"))
	out.set("redirecturl", htmlNoQuotes(sdStr(row["redirecturl"])))

	litpic := ""
	if !sdTruthy(row["litpic"]) {
		litpic = s.detailShareImage(ctx, host)
	} else {
		litpic = s.detailFile(ctx, host, sdStr(row["litpic"]))
	}
	out.set("litpic", litpic)
	if sdTruthy(row["litpic"]) {
		out.set("litpicSource", sdStr(row["litpic"]))
	} else {
		out.set("litpicSource", "")
	}

	out.set("source", htmlNoQuotes(sdStr(row["source"])))
	out.set("sourceurl", htmlNoQuotes(sdStr(row["sourceurl"])))
	writer := htmlNoQuotes(sdStr(row["writer"]))
	out.set("writer", writer)
	out.set("typeid", clijoin("typeid"))
	out.set("admin", clijoin("admin"))

	prop := phpInt(sdStr(row["prop"]))
	out.set("prop", prop)
	if prop == 0 {
		out.set("article_prop", 1)
	} else {
		out.set("article_prop", 0)
	}
	out.set("admin_nickname", row["nickname"])

	// getUrlPath({service:article, template:detail, id, flag, redirecturl, typeid})。
	// fburl 未装配 / 解析失败时输出空串，与 #252 的口径一致（不让一条链接把整页降级）。
	articleURL := ""
	if s.files != nil {
		if u, err := s.files.URL(ctx, fburl.Params{
			{Key: "service", Value: "article"},
			{Key: "template", Value: "detail"},
			{Key: "id", Value: sdStr(row["id"])},
			{Key: "flag", Value: sdStr(row["flag"])},
			{Key: "redirecturl", Value: sdStr(row["redirecturl"])},
			{Key: "typeid", Value: sdStr(row["typeid"])},
		}, fburl.Options{Host: host}); err == nil {
			articleURL = u
		}
	}
	out.set("url", articleURL)

	mold := sdStr(row["mold"])
	out.set("mold", row["mold"])

	// getParentArr("articletype", $typeid)：typeid 无效时链为空 → typeName 为空串。
	chain := s.alistTypeChain(ctx, phpInt(sdStr(row["typeid"])))
	names := make([]string, 0, len(chain))
	for _, node := range chain {
		names = append(names, node.typename)
	}
	out.set("typeName", strings.Join(names, " > "))

	keywords := strings.ReplaceAll(htmlNoQuotes(sdStr(row["keywords"])), ",", " ")
	out.set("keywords", keywords)
	out.set("keywordsList", strings.Split(keywords, " "))
	out.set("description", strings.NewReplacer("\r\n", "", "\r", "", "\n", "").Replace(stripTags(sdStr(row["description"]))))
	out.set("notpost", clijoin("notpost"))
	// click 在 PHP 里是 int：getCache 末尾对 sign 含 "detail" 的单行结果做了
	// `$results[0]['click']++/--`（common.func.php:14449-14454），字符串被自增成整数，
	// 所以外面看到的是自增前的整数值（同一段代码把自增后的值写回缓存，抵消 detail 末尾的
	// 数据库 +1）。Go 不复刻缓存，直接输出自增前的整数值，两边口径一致。
	out.set("click", phpInt(sdStr(row["click"])))
	out.set("color", clijoin("color"))
	out.set("arcrank", clijoin("arcrank"))
	out.set("pubdate", clijoin("pubdate"))
	out.set("reward_switch", phpInt(sdStr(row["reward_switch"])))

	switch phpInt(mold) {
	case 0, 1:
		body, mbody := s.detailBody(ctx, host, httpReq, id, row)
		out.set("body", body)
		out.set("mbody", mbody)
		if phpInt(mold) == 1 {
			out.set("imglist", s.detailImageList(ctx, host, id))
		}
	case 2:
		s.detailVideo(ctx, host, httpReq, row, out)
	case 3:
		out.set("videoSource", row["videourl"])
		out.set("video", s.detailFile(ctx, host, sdStr(row["videourl"])))
	}

	out.set("common", s.detailCount(ctx, "SELECT COUNT(*) FROM "+s.dtCommentAll+
		" WHERE `ischeck` = 1 AND `type` = 'article-detail' AND `aid` = ?", id))
	out.set("rewardcount", s.detailCount(ctx, "SELECT COUNT(*) FROM "+s.dtReward+
		" WHERE `module` = 'article' AND `aid` = ? AND `state` = 1", id))

	admin := sdStr(row["admin"])
	out.set("member", s.detailMemberField(req, httpReq, admin, login))
	media := s.detailMedia(req, httpReq, admin)
	out.set("media", media)
	if detailEmpty(writer) {
		name := ""
		if v, ok := alistMediaName(media).(string); ok {
			name = v
		}
		out.set("writer", name)
	}

	// isfollow 恒 0：PHP 判的是循环残留变量 $val（mold=0/1 时没有 admin/ruid 键），
	// 「已关注 / 自己」两个分支是死代码。照搬，不在迁移里"修好"（会让 H5 按钮状态变化）。
	out.set("isfollow", 0)

	collect := 0
	if s.collectCheck != nil && id != "" {
		if s.collectCheck(req, "article", "detail", "add", id) == "has" {
			collect = 1
		}
	}
	out.set("collect", collect)

	zan := 0
	if s.zanCheck != nil && id != "" {
		if s.zanCheck(req, "article", "detail", id) == "has" {
			zan = 1
		}
	}
	out.set("zan", zan)
	out.set("zannum", clijoin("zan"))

	mediaArctype, mediaArctypeName := s.detailMediaArctype(ctx, row["media_arctype"])
	out.set("typeset", clijoin("typeset"))
	out.set("media_arctype", mediaArctype)
	out.set("media_arctypeName", mediaArctypeName)

	out.set("zhuanti", s.detailZhuanti(ctx, host, row["zhuanti"]))

	// 评论接口 / 点赞列表内部回调详情时不重复计数（article.class.php:1419）。
	if !detailSkipClick(httpReq) {
		s.detailClick(ctx, id, row, login)
	}

	return ajax.Response{State: ajax.StateOK, Info: out}
}

// detailCanonicalID 把 ajax.php 归一后的 id 串还原成 SQL 用的字面量：
// 逗号串（"1,2"）PHP 里会被 is_numeric 拒掉，所以这里只处理单值。
func detailCanonicalID(raw string) string {
	if _, err := strconv.ParseFloat(strings.TrimSpace(raw), 64); err != nil {
		return ""
	}
	return strings.TrimSpace(raw)
}

// detailRow 是主查询：articlelist_all（MRG_MyISAM 合并表，覆盖全部分表）左连会员取 nickname。
// 可见性条件见规则评论第二节：非管理员 + 匿名只放行已发布；已登录会员额外放行自己名下的；
// 两种身份末尾都固定追加 media_state=1。
func (s *Service) detailRow(ctx context.Context, id string, login int64) (map[string]any, bool) {
	where := " AND `arcrank` = 1 AND `del` = 0 AND `waitpay` = 0"
	if login > -1 {
		where = " AND (`arcrank` = 1 AND `del` = 0 AND `waitpay` = 0 OR `admin` = " +
			strconv.FormatInt(login, 10) + ")"
	}
	where += " AND `media_state` = 1"

	query := "SELECT a.*, m.`nickname` FROM " + s.listTable + " a LEFT JOIN " + s.dtMemberTable +
		" m ON m.`id` = a.`admin` WHERE a.`id` = " + id + where + " ORDER BY a.`id` DESC"
	rows, ok := s.sdScanRows(ctx, query)
	if !ok || len(rows) == 0 {
		return nil, false
	}
	return rows[0], true
}

// detailCount 取 totalCount；查询失败按 0 处理（PHP dsqlOper 失败时 totalCount 是 false，
// 进 JSON 是 false，但站点正常运行时不会走到）。
func (s *Service) detailCount(ctx context.Context, query, id string) int {
	var n int
	if err := s.db.QueryRowContext(ctx, query, id).Scan(&n); err != nil {
		return 0
	}
	return n
}

// detailMember 对应 $userLogin->getMemberInfo($admin, 1)：转调 member.detail（simple=1），
// info 原样透传；取不到（102/101，或 admin 为空）时给空数组。
func (s *Service) detailMemberField(req *ajax.Request, httpReq *http.Request, admin string, login int64) any {
	if s.memberDetail == nil {
		return []any{}
	}
	// getMemberInfo($uid, 1)：empty($uid) 时改用当前登录会员；$mid > -1 才查，匿名直接空数组。
	uid := admin
	if detailEmpty(uid) {
		if login <= -1 {
			return []any{}
		}
		uid = strconv.FormatInt(login, 10)
	}
	if uid == "" || uid == "0" {
		return []any{}
	}
	sub := &ajax.Request{
		Service: "member", Action: "detail", HTTP: httpReq,
		Params: url.Values{"id": {uid}, "simple": {"1"}},
	}
	if resp := s.memberDetail(sub); resp.State == ajax.StateOK {
		return resp.Info
	}
	return []any{}
}

// detailMedia 对应 $this->selfmediaDetail($admin)：拿不到时 PHP 输出 null（不是 []）。
func (s *Service) detailMedia(req *ajax.Request, httpReq *http.Request, admin string) any {
	if admin == "" || admin == "0" || s.db == nil {
		return nil
	}
	sub := &ajax.Request{
		Service: "article", Action: "selfmediaDetail", HTTP: httpReq,
		Params: url.Values{"uid": {admin}},
	}
	if resp := s.selfmediaDetail(sub); resp.State == ajax.StateOK {
		return resp.Info
	}
	return nil
}

// detailMediaArctype 对应 1390-1404：有值查类型名，查不到时把 id 置 0（int）、名字置空串。
func (s *Service) detailMediaArctype(ctx context.Context, raw any) (any, string) {
	if !sdTruthy(raw) {
		return raw, ""
	}
	rows, ok := s.sdScanRows(ctx, "SELECT `typename` FROM "+s.dtSdArctype+" WHERE `id` = ?", sdStr(raw))
	if ok && len(rows) > 0 {
		return raw, sdStr(rows[0]["typename"])
	}
	return 0, ""
}

// detailZhuanti 对应 1406-1417：按 zhuanti 找到父专题（z.parentid），输出父的 id/名字。
// 无值或查不到 → PHP 空数组，这里给 []any{}（JSON []）。
func (s *Service) detailZhuanti(ctx context.Context, host string, raw any) any {
	if !sdTruthy(raw) {
		return []any{}
	}
	rows, ok := s.sdScanRows(ctx, "SELECT zt.`id`, zt.`typename` FROM "+s.zhuantiTable+
		" z LEFT JOIN "+s.zhuantiTable+" zt ON zt.`id` = z.`parentid` WHERE z.`id` = ?", sdStr(raw))
	if !ok || len(rows) == 0 {
		return []any{}
	}
	ref := zhuantiRef{ID: rows[0]["id"], Title: rows[0]["typename"]}
	if s.files != nil {
		if u, err := s.files.URL(ctx, fburl.Params{
			{Key: "service", Value: "article"},
			{Key: "template", Value: "zt_detail"},
			{Key: "id", Value: sdStr(rows[0]["id"])},
		}, fburl.Options{Host: host}); err == nil {
			ref.URL = u
		}
	}
	return ref
}

// detailFile 是 getFilePath：fburl 未装配时原样返回（与 selfmedia 口径一致）。
func (s *Service) detailFile(ctx context.Context, host, path string) string {
	if s.files == nil {
		return path
	}
	u, err := s.files.File(ctx, path, fburl.Options{Host: host})
	if err != nil {
		return path
	}
	return u
}

// detailShareImage 是 getShareImage("article")：$cfg_sharePic（config/article.inc.php 的
// $customSharePic 在 canary 为空，取系统默认分享图），再过 getFilePath。
func (s *Service) detailShareImage(ctx context.Context, host string) string {
	return s.detailFile(ctx, host, s.sharePic)
}

// detailBody 复刻 1169-1258：取 body，改写绝对附件地址，再把附件参数换成真实地址，最后 nl2br。
// mbody 为空时回退到 body（PHP: empty($mbody) ? nl2br($body) : nl2br($mbody)）。
func (s *Service) detailBody(ctx context.Context, host string, httpReq *http.Request, id string, row map[string]any) (string, string) {
	body := ""
	rows, ok := s.sdScanRows(ctx, "SELECT `body` FROM "+s.dtArticle+" WHERE `aid` = "+id+" ORDER BY `id` DESC")
	if ok && len(rows) > 0 {
		body = sdStr(rows[0]["body"])
	}
	mbody := sdStr(row["mbody"])

	body = s.detailRewriteAttachmentURLs(ctx, host, httpReq, body)
	mbody = s.detailRewriteAttachmentURLs(ctx, host, httpReq, mbody)

	if detailEmpty(mbody) {
		return nl2br(body), nl2br(body)
	}
	return nl2br(body), nl2br(mbody)
}

// detailRewriteAttachmentURLs 复刻两轮 preg_replace + 附件真实地址替换：
//
//	{secure}\/\/{basehost}\/include\/attachment.php   → /include/attachment.php
//	{secure}\/\/www.{basehost}\/include\/attachment.php → /include/attachment.php
//	/include/attachment.php?f=<参数>                  → getRealFilePath(<参数>, false)
//
// PHP 的正则是把配置串直接拼进 /.../ 里（域名里的 . 没转义），这里照同样方式编译。
func (s *Service) detailRewriteAttachmentURLs(ctx context.Context, host string, httpReq *http.Request, body string) string {
	if body == "" {
		return body
	}
	basehost := host
	if h, _, err := splitHostPort(host); err == nil {
		basehost = h
	}
	secureAccess := detailSecureAccess(httpReq)
	for _, prefix := range []string{"", "www."} {
		u := strings.ReplaceAll(secureAccess, "//", `\/\/`) + prefix + basehost + `\/include\/attachment.php`
		if re, err := regexp.Compile(u); err == nil {
			body = re.ReplaceAllString(body, "/include/attachment.php")
		}
	}
	if s.files == nil {
		return body
	}
	matches := detailAttachmentRe.FindAllStringSubmatch(body, -1)
	seen := map[string]bool{}
	for _, m := range matches {
		v := m[1]
		if v == "" || seen[v] {
			continue
		}
		seen[v] = true
		real, err := s.files.RealFile(ctx, v, false, false, fburl.Options{Host: host})
		if err != nil || real == "" {
			continue
		}
		body = strings.ReplaceAll(body, "/include/attachment.php?f="+v, real)
	}
	return body
}

// detailSecureAccess 对应 $cfg_secureAccess（common.inc.php:121：$cfg_httpSecureAccess ? https : http）。
// 站点 HTTPS 开关不在仓库里，这里按请求的协议推断（nginx 终止 TLS 时看 X-Forwarded-Proto）。
func detailSecureAccess(req *http.Request) string {
	if req == nil {
		return "http://"
	}
	if req.TLS != nil || strings.EqualFold(req.Header.Get("X-Forwarded-Proto"), "https") {
		return "https://"
	}
	return "http://"
}

// detailImageList 是 mold=1 的图集（1266-1284）：无行 → 空数组。
func (s *Service) detailImageList(ctx context.Context, host, id string) any {
	rows, ok := s.sdScanRows(ctx, "SELECT * FROM "+s.dtPic+" WHERE `aid` = "+id+" ORDER BY `id` ASC")
	if !ok || len(rows) == 0 {
		return []any{}
	}
	list := make([]any, 0, len(rows))
	for _, r := range rows {
		item := &detailOut{}
		item.set("pathSource", r["picPath"])
		item.set("path", s.detailFile(ctx, host, sdStr(r["picPath"])))
		item.set("info", r["picInfo"])
		list = append(list, item)
	}
	return list
}

// detailVideo 是 mold=2 分支（1286-1316）。
//
// 注意 videotype==0 时 PHP 从未给 realVideoUrl 赋值，条件里读到的是 null，
// 所以输出里**没有** realVideoUrl 这个键（不要补成 null）。
func (s *Service) detailVideo(ctx context.Context, host string, httpReq *http.Request, row map[string]any, out *detailOut) {
	videotype := phpInt(sdStr(row["videotype"]))
	out.set("videoSource", row["videourl"])

	videourl := ""
	realVideoURL := ""
	hasReal := false
	if videotype != 0 {
		videourl = sdStr(row["videourl"])
		if s.realVideoURL != nil {
			realVideoURL = s.realVideoURL(ctx, videourl)
		} else {
			realVideoURL = alistRealVideoURL(videourl)
		}
		out.set("realVideoUrl", realVideoURL)
		hasReal = true
	} else {
		videourl = s.detailFile(ctx, host, sdStr(row["videourl"]))
	}

	// 真实地址是 mp4、移动端、且 HTTPS 开关允许时改用真实地址（PHP 1320）。
	if hasReal && realVideoURL != "" && alistIsMobile(&ajax.Request{HTTP: httpReq}) &&
		strings.Contains(realVideoURL, ".mp4") &&
		(detailSecureAccess(httpReq) != "https://" || strings.Contains(realVideoURL, "https://")) {
		videotype = 0
		videourl = realVideoURL
	}
	out.set("video", videourl)
	out.set("videotype", videotype)
	out.set("videotype_", phpInt(sdStr(row["videotype"])))

	hour, minute, second := detailTimeParts(sdStr(row["videotime"]))
	out.set("videotime", row["videotime"])
	out.set("video_hour", hour)
	out.set("video_minute", minute)
	out.set("video_second", second)
}

// detailTimeParts 复刻 1308-1315：videotime 为假时三者都是 0（但键都在）。
func detailTimeParts(raw string) (int, int, int) {
	total := phpInt(raw)
	if total == 0 {
		return 0, 0, 0
	}
	return total / 3600, total / 60 % 60, total % 60
}

// detailSkipClick 复刻 1419 的门禁：评论列表、点赞列表内部回调详情时不计数。
// $_REQUEST['action'] 取的是原始请求 URL 上的 action（子请求的 Action 字段是 "detail"）。
func detailSkipClick(req *http.Request) bool {
	if req == nil {
		return false
	}
	action := req.URL.Query().Get("action")
	return action == "getComment" || action == "upList"
}

// detailClick 复刻 1419-1445：阅读数 +1、自媒体浏览数 +1、登录会员写浏览足迹。
//
// PHP 的 UPDATE 打在 articlelist_all（MRG_MyISAM）上会被 MySQL 拒绝（read only），
// dsql 转而异步重建合并表、当次不生效；这里按规则评论的口径写真实分表（site_sub_tablelist
// 定位，命中不到用主表 articlelist），保证计数真的会累加。
func (s *Service) detailClick(ctx context.Context, id string, row map[string]any, login int64) {
	if table, err := s.articleListSubTable(ctx, id); err == nil {
		_, _ = s.db.ExecContext(ctx, "UPDATE "+quoteTable(table)+" SET `click` = `click` + 1 WHERE `id` = ?", id)
	}

	admin := sdStr(row["admin"])
	if admin != "" {
		_, _ = s.db.ExecContext(ctx, "UPDATE "+s.sdTable+" SET `click` = `click` + 1 WHERE `userid` = ?", admin)
	}

	adminID, err := strconv.ParseInt(admin, 10, 64)
	if login > 0 && err == nil && login != adminID {
		s.detailHistoryClick(ctx, login, admin, id)
	}
}

// detailHistoryClick 复刻 updateHistoryClick（common.func.php:16427）：当天已有该会员
// 对该文章的足迹就更新 date，否则插入。超过 50 万行时的历史清理不做（见函数头偏差）。
func (s *Service) detailHistoryClick(ctx context.Context, uid int64, fuid, aid string) {
	rows, ok := s.sdScanRows(ctx, "SELECT `id` FROM "+s.dtHistory+
		" WHERE `uid` = ? AND `fuid` = ? AND `aid` = ? AND `module2` = 'detail'", uid, fuid, aid)
	if !ok {
		return
	}
	now := time.Now().Unix()
	if len(rows) == 0 {
		_, _ = s.db.ExecContext(ctx, "INSERT INTO "+s.dtHistory+
			" (`uid`, `fuid`, `aid`, `module`, `module2`, `date`) VALUES (?, ?, ?, 'article', 'detail', ?)",
			uid, fuid, aid, now)
		return
	}
	_, _ = s.db.ExecContext(ctx, "UPDATE "+s.dtHistory+
		" SET `date` = ? WHERE `uid` = ? AND `fuid` = ? AND `aid` = ?", now, uid, fuid, aid)
}

// articleListSubTable 定位文章所在的实际表（SubTable('articlelist')->getSubTableById）：
// 分表清单来自 site_sub_tablelist（service='articlelist'，ORDER BY id desc），末尾补主表。
// begin_id 命中（PHP 松散比较）直接用；否则把 begin_id 列 + id + 0 排序后取 id 的前一个值。
// canary 的 site_sub_tablelist 为空，恒返回主表 huoniao_articlelist。
func (s *Service) articleListSubTable(ctx context.Context, id string) (string, error) {
	type entry struct {
		table   string
		beginID *string
	}
	rows, err := s.db.QueryContext(ctx,
		"SELECT `table_name`, `begin_id` FROM "+s.dtSubTableList+" WHERE `service` = 'articlelist' ORDER BY `id` DESC")
	if err != nil {
		return "", err
	}
	defer func() { _ = rows.Close() }()
	entries := []entry{}
	for rows.Next() {
		var table string
		var begin sql.NullString
		if err := rows.Scan(&table, &begin); err != nil {
			return "", err
		}
		e := entry{table: table}
		if begin.Valid {
			b := begin.String
			e.beginID = &b
		}
		entries = append(entries, e)
	}
	if err := rows.Err(); err != nil {
		return "", err
	}
	entries = append(entries, entry{table: s.dtArticleList})

	for _, e := range entries {
		if e.beginID != nil && detailLooseEqual(*e.beginID, id) {
			return e.table, nil
		}
	}
	vals := make([]string, 0, len(entries)+2)
	for _, e := range entries {
		if e.beginID != nil {
			vals = append(vals, *e.beginID)
		} else {
			vals = append(vals, "")
		}
	}
	vals = append(vals, id, "0")
	sortLikePHPInts(vals)
	pos := -1
	for i, v := range vals {
		if detailLooseEqual(v, id) {
			pos = i
			break
		}
	}
	searchBegin := ""
	if pos > 0 {
		searchBegin = vals[pos-1]
	}
	if alistNum(searchBegin) == 0 {
		return s.dtArticleList, nil
	}
	for _, e := range entries {
		if e.beginID != nil && detailLooseEqual(*e.beginID, searchBegin) {
			return e.table, nil
		}
	}
	return entries[0].table, nil
}

// detailLooseEqual 复刻 PHP == 的「两边都是数字串则按数值比」口径（"05" == "5"）。
func detailLooseEqual(a, b string) bool {
	na, nb := detailNumeric.MatchString(a), detailNumeric.MatchString(b)
	if na && nb {
		return alistNum(a) == alistNum(b)
	}
	if !na && !nb {
		return a == b
	}
	return false
}

// sortLikePHPInts 按 PHP sort() 的数值比较给 begin_id 列排序（空串按 0）。
func sortLikePHPInts(vals []string) {
	for i := 1; i < len(vals); i++ {
		for j := i; j > 0 && alistNum(vals[j]) < alistNum(vals[j-1]); j-- {
			vals[j], vals[j-1] = vals[j-1], vals[j]
		}
	}
}

// htmlNoQuotes 复刻 htmlentities($s, ENT_NOQUOTES, "utf-8") 里真正影响输出的部分：
// 只转 & < >，引号不转（ENT_NOQUOTES）。带命名实体的非 ASCII 字符（é、© 等）不处理，
// 已在函数头声明为已知偏差。
func htmlNoQuotes(s string) string {
	if !strings.ContainsAny(s, "&<>") {
		return s
	}
	var b strings.Builder
	b.Grow(len(s) + 8)
	for _, r := range s {
		switch r {
		case '&':
			b.WriteString("&amp;")
		case '<':
			b.WriteString("&lt;")
		case '>':
			b.WriteString("&gt;")
		default:
			b.WriteRune(r)
		}
	}
	return b.String()
}

// detailTagRe 匹配 strip_tags 会吃掉的部分：HTML 注释与标签。
var detailTagRe = regexp.MustCompile(`(?s)<!--.*?-->|</?[a-zA-Z!][^>]*>`)

// stripTags 复刻 strip_tags：去掉标签与注释，保留文本（PHP 对不成对的 "<" 原样保留）。
func stripTags(s string) string {
	if !strings.Contains(s, "<") {
		return s
	}
	return detailTagRe.ReplaceAllString(s, "")
}

// nl2br 复刻 PHP nl2br：在换行符前插入 <br />，换行符本身保留。
// PHP 先处理 \r\n 与 \n\r，再处理单个 \n / \r。
func nl2br(s string) string {
	if !strings.ContainsAny(s, "\r\n") {
		return s
	}
	var b strings.Builder
	b.Grow(len(s) + 16)
	for i := 0; i < len(s); i++ {
		switch {
		case s[i] == '\r' && i+1 < len(s) && s[i+1] == '\n':
			b.WriteString("<br />\r\n")
			i++
		case s[i] == '\n' && i+1 < len(s) && s[i+1] == '\r':
			b.WriteString("<br />\n\r")
			i++
		case s[i] == '\n':
			b.WriteString("<br />\n")
		case s[i] == '\r':
			b.WriteString("<br />\r")
		default:
			b.WriteByte(s[i])
		}
	}
	return b.String()
}

// splitHostPort 拆 host:port；没有端口时原样返回。
func splitHostPort(host string) (string, string, error) {
	if i := strings.LastIndex(host, ":"); i >= 0 && !strings.Contains(host[i:], "]") {
		return host[:i], host[i+1:], nil
	}
	return host, "", nil
}
