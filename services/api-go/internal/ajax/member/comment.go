package member

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/fburl"
)

// 迁移自 member.class.php getComment()（18114-18639）与 getChildComment()（18640-18830），issue #251。
//
// 依赖（member.detail / 各模块 detail / decodeAttachmentUrl / checkCourierAccount）尚未迁移，
// 通过 Dep 里的钩子注入；缺钩子而又必须用到时按「内部错误」返回 102，不自行编造数据。

const (
	infoParamError = "参数错误" // siteConfig[33][13]
	infoAnonymous  = "匿名用户" // siteConfig[34][10]
	infoGone       = "信息不存在或已删除"
	// siteConfig[13][41..47]
	ftimeMinute, ftimeHour, ftimeDay, ftimeNow = "分钟前", "小时前", "天前", "刚刚"
)

// sco1Txt 是 siteConfig[34][9]。
var sco1Txt = map[string]string{"0": "", "1": "失望", "2": "一般", "3": "还行", "4": "满意", "5": "超赞"}

var errMissingDep = errors.New("member.getComment: 缺少依赖钩子")

// Object 是保持插入顺序的 JSON 对象（PHP 关联数组的键序即输出顺序）。
type Object struct {
	keys []string
	vals map[string]any
}

// NewObject 创建空对象。
func NewObject() *Object { return &Object{vals: map[string]any{}} }

// Set 设置键；已存在则原位覆盖（与 PHP 数组一致）。
func (o *Object) Set(k string, v any) {
	if _, ok := o.vals[k]; !ok {
		o.keys = append(o.keys, k)
	}
	o.vals[k] = v
}

// Get 读取键。
func (o *Object) Get(k string) (any, bool) { v, ok := o.vals[k]; return v, ok }

// MarshalJSON 按插入顺序输出。
func (o *Object) MarshalJSON() ([]byte, error) {
	var b bytes.Buffer
	b.WriteByte('{')
	for i, k := range o.keys {
		if i > 0 {
			b.WriteByte(',')
		}
		kb, _ := json.Marshal(k)
		b.Write(kb)
		b.WriteByte(':')
		vb, err := json.Marshal(o.vals[k])
		if err != nil {
			return nil, err
		}
		b.Write(vb)
	}
	b.WriteByte('}')
	return b.Bytes(), nil
}

// ModuleDetailFunc 对应 `(new handlers(module, action))->getHandle(aid)`：
// ok=false 表示返回 state != 100；ok=true 且 info==nil 表示 state==100 但 info 不是数组。
type ModuleDetailFunc func(ctx context.Context, req *http.Request, module, action, aid string) (info *Object, ok bool, err error)

// UserDetailFunc 对应 `$this->param = $id; $this->detail()`（member.detail，#253）。
// valid=false 表示参数是 null（例如查不到上级评论）。会员已删时按 PHP 返回字符串 "No data!"。
type UserDetailFunc func(ctx context.Context, req *http.Request, id string, valid bool) (any, error)

// phpTruthy 复刻 PHP 真值判断（用于 detail['url']）。
func phpTruthy(v any) bool {
	switch x := v.(type) {
	case nil:
		return false
	case string:
		return x != "" && x != "0"
	case bool:
		return x
	case int:
		return x != 0
	case int64:
		return x != 0
	case float64:
		return x != 0
	case []any:
		return len(x) > 0
	case *Object:
		return len(x.keys) > 0
	}
	return true
}

func nstr(v sql.NullString) any {
	if !v.Valid {
		return nil
	}
	return v.String
}

func truthyStr(s string) bool { return s != "" && s != "0" }

// ---- 无状态工具：FloorTime / getIpHome ----

// floorTime 复刻 FloorTime($seconds)（n=1）。
func floorTime(sec int64, now time.Time) string {
	days := int64(math.Floor(float64(sec) / 86400))
	hours := int64(float64(sec)/3600) % 24
	minutes := int64(float64(sec)/60) % 60
	times := ftimeNow
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
		times = time.Unix(now.Unix()-sec, 0).In(gmt8).Format("2006-01-02")
	}
	return times
}

var ipNoise = []string{"未知", "本地局域网", "内网IP", "电信", "移动", "联通", "鹏博士", "鹏博士宽带", "长城宽带", "华数传媒", "移动/基站WiFi", "阿里云", "东方有线", "腾讯云", "联通漕河泾数据中心", "有线宽带", "电信数据上网公共出口", "移动数据上网公共出口", "广电", "方正宽带", "歌华", "皓宽网络", "科技网", "BGP多线", "世纪互联", "华为云", "铁通", "联通/基站WiFi"}
var ipRegion = []string{"回族自治区", "壮族自治区", "维吾尔自治区", "自治区", "朝鲜族自治州", "土家族苗族自治州", "土家族苗族自治州", "藏族羌族自治州", "蒙古族藏族自治州", "藏族自治州", "哈尼族彝族自治州", "彝族自治州", "南苗族侗族自治州", "布依族苗族自治州", "南布依族苗族自治州", "壮族苗族自治州", "傣族自治州", "白族自治州", "傣族景颇族自治州", "傈僳族自治州", "回族自治州", "哈萨克自治州", "蒙古自治州", "自治州", "省", "市"}

const phpTrimChars = " \t\n\r\x00\x0B"

// getIPHome 复刻 getIpHome($ipaddr)；mode 即 $cfg_iphome（0 不显示 1 省 2 市 3 省+市）。
func getIPHome(ipaddr string, mode int) string {
	if mode == 0 || !truthyStr(ipaddr) {
		return ""
	}
	for _, s := range ipNoise {
		ipaddr = strings.ReplaceAll(ipaddr, s, "")
	}
	ipaddr = strings.Trim(ipaddr, phpTrimChars)
	for _, s := range ipRegion {
		ipaddr = strings.ReplaceAll(ipaddr, s, " ")
	}
	ipaddr = strings.Trim(ipaddr, phpTrimChars)
	// explode(' ') + array_filter：按原下标取 [0] / [1]，被过滤掉的空段会让下标错位。
	parts := strings.Split(ipaddr, " ")
	at := func(i int) string {
		if i < len(parts) && truthyStr(parts[i]) {
			return parts[i]
		}
		return ""
	}
	province, city := at(0), at(1)
	switch mode {
	case 3:
		if city == province {
			return province
		}
		return province + city
	case 2:
		if city != "" {
			return city
		}
		return province
	case 1:
		return province
	}
	return ""
}

// ---- 请求内状态 ----

type commentCtx struct {
	ctx    context.Context
	req    *http.Request
	userid int64
	// temp 对应 $this->temp：getChildComment 里按 userid 缓存的 detail。
	// PHP 数组按值复制，递归返回后父层局部副本不含子层新增，这里照搬该语义。
	temp map[string]any
}

func cloneTemp(m map[string]any) map[string]any {
	out := make(map[string]any, len(m))
	for k, v := range m {
		out[k] = v
	}
	return out
}

func (s *Service) detailOf(c *commentCtx, id string, valid bool) (any, error) {
	if s.userDetail == nil {
		return nil, errMissingDep
	}
	return s.userDetail(c.ctx, c.req, id, valid)
}

func (s *Service) now() time.Time {
	if s.clock != nil {
		return s.clock()
	}
	return time.Now()
}

func (s *Service) file(c *commentCtx, path string) (string, error) {
	if !truthyStr(path) {
		return "", nil
	}
	if s.files == nil {
		return path, nil
	}
	host := ""
	if c.req != nil {
		host = c.req.Host
	}
	return s.files.File(c.ctx, path, fburl.Options{Host: host})
}

func (s *Service) urlPathOf(c *commentCtx, p fburl.Params) (string, error) {
	if s.files == nil {
		return "", nil
	}
	host := ""
	if c.req != nil {
		host = c.req.Host
	}
	return s.files.URL(c.ctx, p, fburl.Options{Host: host})
}

// ---- where 拼装 ----

type cond struct {
	sql  strings.Builder
	args []any
}

func (w *cond) add(frag string, args ...any) {
	w.sql.WriteString(frag)
	w.args = append(w.args, args...)
}

func int64s(v []int64) string {
	parts := make([]string, len(v))
	for i, x := range v {
		parts[i] = strconv.FormatInt(x, 10)
	}
	return strings.Join(parts, ",")
}

func (s *Service) countRows(c *commentCtx, query string, args ...any) (int, error) {
	var n int
	if err := s.db.QueryRowContext(c.ctx, query, args...).Scan(&n); err != nil {
		return 0, err
	}
	return n, nil
}

// getOneUserID 对应 `SELECT userid ... WHERE id = N` + getOne / results[0]；查不到 valid=false。
func (s *Service) getOneUserID(c *commentCtx, id string) (val string, valid bool, err error) {
	var v sql.NullString
	err = s.db.QueryRowContext(c.ctx, "SELECT `userid` FROM "+s.commentTable+" WHERE `id` = ?", id).Scan(&v)
	if errors.Is(err, sql.ErrNoRows) {
		return "", false, nil
	}
	if err != nil {
		return "", false, err
	}
	return v.String, v.Valid, nil
}

// ---- getComment ----

const commentCols = "`id`, `pid`, `sid`, `type`, `ipaddr`, `aid`, `oid`, `userid`, `rating`, `sco1`, `content`, `pics`, `audio`, `video`, `dtime`, `ip`, `zan`, `zan_user`, `isanony`, `specation`, `peisongid`, `star`, `starps`, `contentps`, `reply`, `replydate`, `time`, `top`, `masterid`"

type commentRow struct {
	v [29]sql.NullString
}

// 列下标，顺序同 commentCols。
const (
	cID = iota
	cPID
	cSID
	cType
	cIPAddr
	cAID
	cOID
	cUserID
	cRating
	cSco1
	cContent
	cPics
	cAudio
	cVideo
	cDtime
	cIP
	cZan
	cZanUser
	cIsAnony
	cSpecation
	cPeisongID
	cStar
	cStarps
	cContentps
	cReply
	cReplydate
	cTime
	cTop
	cMasterID
)

func (s *Service) getComment(req *ajax.Request) ajax.Response {
	if s.db == nil {
		return noData()
	}
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	userid, err := s.identityID(ctx, req.HTTP)
	if err != nil {
		return noData()
	}
	c := &commentCtx{ctx: ctx, req: req.HTTP, userid: userid, temp: map[string]any{}}
	p := newParams(req)

	typ, gettype, sco1 := p.scalar("type"), p.scalar("gettype"), p.scalar("sco1")
	filter, orderby := p.scalar("filter"), p.scalar("orderby")
	pid, aid, oid := p.intval("pid"), p.intval("aid"), p.intval("oid")
	content, audio, pics, video := p.intval("content"), p.intval("audio"), p.intval("pics"), p.intval("video")
	son, u, onlyself, isAjax := p.intval("son"), p.intval("u"), p.intval("onlyself"), p.intval("isAjax")
	uid, peisongid := p.intval("uid"), p.intval("peisongid")
	page, pageSize := p.pageLike("page", 1), p.pageLike("pageSize", 10)
	if pageSize == 0 {
		pageSize = 10
	}
	if page == 0 {
		page = 1
	}
	tieba := typ == "tieba-detail"

	// $where / $where_tieba 未初始化时按空串拼接。
	var where, whereTieba cond
	both := func(frag string, args ...any) {
		where.add(frag, args...)
		whereTieba.add(frag, args...)
	}

	if peisongid == 0 && u == 0 {
		if !truthyStr(typ) || aid == 0 {
			return fail(infoParamError)
		}
		where.add(" AND `type` = ? AND `aid` = ? AND `pid` = ?", typ, aid, pid)
		if tieba {
			// 贴吧统计口径：不含 pid。
			whereTieba.add(" AND `type` = ? AND `aid` = ?", typ, aid)
		}
	}

	if u == 1 && onlyself == 1 {
		// 先查自己名下 ischeck=1 的评论 id。
		rows, err := s.db.QueryContext(ctx, "SELECT `id` FROM "+s.commentTable+" WHERE `ischeck` = 1 AND `userid` = ?", userid)
		if err != nil {
			return noData()
		}
		var sidList []int64
		for rows.Next() {
			var id int64
			if err := rows.Scan(&id); err != nil {
				_ = rows.Close()
				return noData()
			}
			sidList = append(sidList, id)
		}
		if err := rows.Err(); err != nil {
			_ = rows.Close()
			return noData()
		}
		_ = rows.Close()
		if len(sidList) > 0 {
			both(" AND `userid` != ? AND  (`sid` in("+int64s(sidList)+") or (`masterid` = ? AND `sid` = '0'))", userid, userid)
		} else {
			both(" AND `userid` != ? AND  `masterid` = ? AND `sid` = '0'", userid, userid)
		}
	}
	// u==1 且 onlyself!=1：$where1 建了没拼进 $where，主查询无用户过滤（PHP 行为）。
	if u == 2 {
		both(" AND  `userid` = ?", userid)
	}
	if truthyStr(gettype) {
		both(" AND `type` like ?", "%"+gettype+"%")
	}
	if pid != 0 {
		both(" AND `pid` = ?", pid)
	}
	if uid != 0 {
		both(" AND `userid` = ?", uid)
	}
	if oid != 0 {
		both(" AND `oid` = ?", oid)
	}
	if peisongid != 0 {
		if peisongid == 1 {
			if s.courierID == nil {
				return noData() // checkCourierAccount() 未迁移
			}
			id, err := s.courierID(ctx, req.HTTP)
			if err != nil {
				return noData()
			}
			peisongid = int(id)
		}
		both(" AND `peisongid` = ?", peisongid)
	}
	if truthyStr(filter) {
		switch filter {
		case "pic", "img":
			both(" AND `pics` <> ''")
		case "lower":
			both(" AND `rating` < 3")
		case "h":
			both(" AND `rating` = 1")
		case "z":
			both(" AND `rating` = 2")
		case "c":
			both(" AND `rating` = 3")
		}
	}
	if content != 0 {
		both(" AND `content` != ''")
	}
	if audio != 0 {
		both(" AND `audio` != ''")
	}
	if pics != 0 {
		both(" AND `pics` != ''")
	}
	if video != 0 {
		both(" AND `video` != ''")
	}

	t := s.commentTable
	var pageInfoOut any = json.RawMessage("[]") // isAjax=1 时 $pageinfo 保持 array()
	if isAjax == 0 {
		var totalCount int
		if tieba {
			totalCount, err = s.countRows(c, "SELECT COUNT(*) FROM "+t+" WHERE `pid` = 0 AND `ischeck` = 1"+whereTieba.sql.String(), whereTieba.args...)
		} else {
			totalCount, err = s.countRows(c, "SELECT COUNT(*) FROM "+t+" WHERE `ischeck` = 1"+where.sql.String(), where.args...)
		}
		if err != nil {
			return noData()
		}
		if totalCount == 0 {
			return fail(infoEmpty)
		}
		info := NewObject()
		info.Set("page", page)
		info.Set("pageSize", pageSize)
		info.Set("totalPage", phpFloat(math.Ceil(float64(totalCount)/float64(pageSize))))
		info.Set("totalCount", totalCount)

		for n := 1; n <= 5; n++ {
			cnt, err := s.countRows(c, "SELECT COUNT(*) FROM "+t+" WHERE `ischeck` = 1 AND `sco1` = "+strconv.Itoa(n)+where.sql.String(), where.args...)
			if err != nil {
				return noData()
			}
			info.Set("sco"+strconv.Itoa(n), cnt)
		}

		ratings, err := s.db.QueryContext(ctx, "SELECT `rating` FROM "+t+" WHERE `ischeck` = 1 "+where.sql.String(), where.args...)
		if err != nil {
			return noData()
		}
		var hao, zhong, cha int
		for ratings.Next() {
			var r sql.NullString
			if err := ratings.Scan(&r); err != nil {
				_ = ratings.Close()
				return noData()
			}
			if r.Valid {
				switch phpIntval(r.String) {
				case 1:
					hao++
				case 2:
					zhong++
				case 3:
					cha++
				}
			}
		}
		if err := ratings.Err(); err != nil {
			_ = ratings.Close()
			return noData()
		}
		_ = ratings.Close()
		info.Set("sco6", hao)
		info.Set("sco7", zhong)
		info.Set("sco8", cha)

		var a1, a2, a3 sql.NullString
		if err := s.db.QueryRowContext(ctx, "SELECT avg(c.`sco1`) s1, avg(c.`sco2`) s2, avg(c.`sco3`) s3 FROM "+t+" c WHERE c.`ischeck` = 1"+where.sql.String(), where.args...).Scan(&a1, &a2, &a3); err != nil {
			return noData()
		}
		info.Set("score1", phpIntval(a1.String))
		info.Set("score2", phpIntval(a2.String))
		info.Set("score3", phpIntval(a3.String))

		picCount, err := s.countRows(c, "SELECT COUNT(*) FROM "+t+" WHERE `ischeck` = 1 AND `pics` != ''"+where.sql.String(), where.args...)
		if err != nil {
			return noData()
		}
		info.Set("pic", picCount)
		pageInfoOut = info
	}

	// sco1 只作用于主查询（统计之后才拼）。sco1 里出现非整数片段在 PHP 里是 SQL 语法错误 → results=false → 空列表。
	badSco1 := false
	if truthyStr(sco1) {
		parts := strings.Split(sco1, ",")
		conds := make([]string, len(parts))
		for i, v := range parts {
			v = strings.TrimSpace(v)
			if n, err := strconv.ParseInt(v, 10, 64); err == nil {
				conds[i] = "`sco1` = " + strconv.FormatInt(n, 10)
			} else {
				badSco1 = true
			}
		}
		if !badSco1 {
			where.add(" AND (" + strings.Join(conds, " || ") + ")")
		}
	}

	atpage := pageSize * (page - 1)
	order := " ORDER BY `id` DESC"
	switch {
	case orderby == "hot":
		order = " ORDER BY `zan` DESC, `id` DESC"
	case phpLooseEqualsOne(orderby):
		order = " ORDER BY `id` ASC"
		if tieba {
			order = " ORDER BY `top` DESC, `id` ASC"
		}
	case tieba:
		order = " ORDER BY `top` DESC, `id` DESC"
	}

	var results []commentRow
	// 负数 LIMIT 是 SQL 语法错误，PHP 侧 results=false，list 为空。
	if !badSco1 && atpage >= 0 && pageSize > 0 {
		q := "SELECT " + commentCols + " FROM " + t + " WHERE `ischeck` = 1" + where.sql.String() + order + " LIMIT ?, ?"
		args := append(append([]any{}, where.args...), atpage, pageSize)
		rows, err := s.db.QueryContext(ctx, q, args...)
		if err != nil {
			return noData()
		}
		for rows.Next() {
			var r commentRow
			dest := make([]any, len(r.v))
			for i := range r.v {
				dest[i] = &r.v[i]
			}
			if err := rows.Scan(dest...); err != nil {
				_ = rows.Close()
				return noData()
			}
			results = append(results, r)
		}
		if err := rows.Err(); err != nil {
			_ = rows.Close()
			return noData()
		}
		_ = rows.Close()
	}

	list := []*Object{}
	aaa := len(results)
	// $param 在详情分支里会被整体改写（见 detailBranch），rid / sid 只在没被改写前随请求残留。
	childRid, childSid := p.intval("rid"), p.intval("sid")
	var user any // PHP 的 $user 在行间残留；u 不是 0/1/2 时第一行为 null
	var tiziTotal any
	now := s.now()

	for _, r := range results {
		row := NewObject()
		get := func(i int) string { return r.v[i].String }

		if u == 1 && onlyself == 1 && truthyStr(get(cSID)) {
			var pid2, pcontent sql.NullString
			err := s.db.QueryRowContext(ctx, "SELECT `id`, `content` FROM "+t+" WHERE `ischeck` = 1 AND `id` = ?", get(cSID)).Scan(&pid2, &pcontent)
			if err != nil && !errors.Is(err, sql.ErrNoRows) {
				return noData()
			}
			if err == nil && truthyStr(pid2.String) {
				parent := NewObject()
				parent.Set("id", nstr(pid2))
				parent.Set("content", s.decode(pcontent.String))
				row.Set("parent", parent)
			}
		}

		row.Set("count", aaa)
		row.Set("id", nstr(r.v[cID]))
		row.Set("sid", nstr(r.v[cSID]))
		row.Set("pid", nstr(r.v[cPID]))
		row.Set("type", nstr(r.v[cType]))
		row.Set("oid", nstr(r.v[cOID]))
		row.Set("ipaddr", nstr(r.v[cIPAddr]))
		row.Set("iphome", getIPHome(get(cIPAddr), s.ipHomeMode))
		row.Set("specation", strReplaceNullable(r.v[cSpecation], "$$$", "，"))
		row.Set("isanony", nstr(r.v[cIsAnony]))
		row.Set("ftime", floorTime(now.Unix()-int64(phpIntval(get(cDtime))), now))
		row.Set("peisongid", nstr(r.v[cPeisongID]))
		row.Set("star", nstr(r.v[cStar]))
		row.Set("starps", nstr(r.v[cStarps]))
		row.Set("contentps", nstr(r.v[cContentps]))
		row.Set("reply", nstr(r.v[cReply]))
		row.Set("time", nstr(r.v[cTime]))
		row.Set("replydate", nstr(r.v[cReplydate]))
		replydatef := ""
		if truthyStr(get(cReplydate)) {
			replydatef = time.Unix(int64(phpIntval(get(cReplydate))), 0).In(gmt8).Format("2006-01-02 15:04:05")
		}
		row.Set("replydatef", replydatef)
		row.Set("top", nstr(r.v[cTop]))

		isSelf := 0
		if r.v[cUserID].Valid && int64(phpIntval(get(cUserID))) == userid {
			isSelf = 1
		}
		row.Set("is_self", isSelf)

		if !truthyStr(get(cIsAnony)) {
			switch {
			case u == 0 || u == 1:
				user, err = s.detailOf(c, get(cUserID), r.v[cUserID].Valid)
			case u == 2:
				if truthyStr(get(cSID)) {
					uidStr, valid, qerr := s.getOneUserID(c, get(cSID))
					if qerr != nil {
						return noData()
					}
					user, err = s.detailOf(c, uidStr, valid)
				} else {
					user, err = s.detailOf(c, get(cMasterID), r.v[cMasterID].Valid)
				}
			}
			if err != nil {
				return noData()
			}
		} else {
			anon := NewObject()
			anon.Set("nickname", infoAnonymous)
			anon.Set("photo", "")
			user = anon
		}
		row.Set("user", user)

		row.Set("rating", nstr(r.v[cRating]))
		row.Set("sco1", nstr(r.v[cSco1]))
		if txt, ok := sco1Txt[get(cSco1)]; ok && r.v[cSco1].Valid {
			row.Set("sco1Txt", txt)
		} else {
			row.Set("sco1Txt", nil)
		}
		row.Set("content", s.decode(get(cContent)))
		row.Set("dtime", nstr(r.v[cDtime]))

		if get(cType) != "paotui-order" {
			if err := s.detailBranch(c, row, get(cType), get(cAID)); err != nil {
				return noData()
			}
			// 上面把 PHP 的 $param 整体改写成 {service, template, id}，之后传给 getChildComment 的不再带 rid / sid。
			childRid, childSid = 0, 0
		} else {
			var sid2, title sql.NullString
			err := s.db.QueryRowContext(ctx, "SELECT o.`id`, o.`shop` shopname FROM ("+t+" c LEFT JOIN "+s.paotuiTable+" o ON c.`oid` = o.`id`) WHERE c.`oid` = ? LIMIT 1", get(cOID)).Scan(&sid2, &title)
			if err != nil && !errors.Is(err, sql.ErrNoRows) {
				return noData()
			}
			if err == nil {
				d := NewObject()
				d.Set("id", nstr(sid2))
				d.Set("title", nstr(title))
				row.Set("detail", d)
			}
		}

		picsArr := []string{}
		if truthyStr(get(cPics)) {
			for _, one := range strings.Split(get(cPics), ",") {
				f, err := s.file(c, one)
				if err != nil {
					return noData()
				}
				picsArr = append(picsArr, f)
			}
		}
		row.Set("pics", picsArr)
		for _, col := range []struct {
			key string
			idx int
		}{{"audio", cAudio}, {"video", cVideo}} {
			f := ""
			if truthyStr(get(col.idx)) {
				if f, err = s.file(c, get(col.idx)); err != nil {
					return noData()
				}
			}
			row.Set(col.key, f)
		}
		row.Set("ip", nstr(r.v[cIP]))
		row.Set("zan", nstr(r.v[cZan]))
		row.Set("zan_has", zanHas(userid, get(cZanUser)))

		if tieba {
			memberID := get(cUserID)
			var n sql.NullString
			err := s.db.QueryRowContext(ctx, "SELECT count(`id`) t FROM "+s.tiebaTable+" WHERE `state` = 1 AND `uid` = ?", memberID).Scan(&n)
			if err == nil {
				tiziTotal = n.String // $$tizi_memberTotal 双 $ bug：查询失败时沿用上一行（首行为 null）
			} else if !errors.Is(err, sql.ErrNoRows) {
				return noData()
			}
			row.Set("tizi_memberTotal", tiziTotal)

			var jh any = 0
			err = s.db.QueryRowContext(ctx, "SELECT count(`id`) t FROM "+s.tiebaTable+" WHERE `state` = 1 AND `jinghua` = 1 AND `uid` = ?", memberID).Scan(&n)
			if err == nil {
				jh = n.String
			} else if !errors.Is(err, sql.ErrNoRows) {
				return noData()
			}
			row.Set("tizi_memberJinghuaTotal", jh)

			var reply any = 0
			err = s.db.QueryRowContext(ctx, "SELECT count(`id`) t FROM "+t+" WHERE `ischeck` = 1 AND `type` = 'tieba-detail' AND `pid` = ?", get(cID)).Scan(&n)
			if err == nil {
				reply = n.String
			} else if !errors.Is(err, sql.ErrNoRows) {
				return noData()
			}
			row.Set("replynums", reply)
		}

		if userid != -1 {
			var one int64
			err := s.db.QueryRowContext(ctx, "SELECT `id` FROM "+s.followTable+" WHERE `tid` = ? AND `fid` = ? LIMIT 1", userid, get(cUserID)).Scan(&one)
			if err != nil && !errors.Is(err, sql.ErrNoRows) {
				return noData()
			}
			isfollow := 0
			if err == nil {
				isfollow = 1
			}
			row.Set("isfollow", isfollow)
		}

		if son != 0 && phpIntval(get(cPID)) == 0 {
			child, err := s.getChild(c, phpIntval(get(cID)), childRid, childSid, 1, 100)
			if err != nil {
				return noData()
			}
			lower := NewObject()
			lower.Set("count", child.totalAll)
			if len(child.list) > 0 {
				lower.Set("list", child.list)
			} else {
				// $lower 刚初始化为 array()，state 200 时 $child['list'] 取不到 → 空串（见 PHP 的恒真判断）。
				lower.Set("list", "")
			}
			row.Set("lower", lower)
		}
		list = append(list, row)
	}

	return ajax.Response{State: ajax.StateOK, Info: struct {
		PageInfo any       `json:"pageInfo"`
		List     []*Object `json:"list"`
	}{pageInfoOut, list}}
}

func phpLooseEqualsOne(s string) bool {
	if !numericPattern.MatchString(s) {
		return false
	}
	f, err := strconv.ParseFloat(strings.TrimLeft(s, " \t\n\r\v\f"), 64)
	return err == nil && f == 1
}

func strReplaceNullable(v sql.NullString, old, repl string) any {
	if !v.Valid {
		return ""
	}
	return strings.ReplaceAll(v.String, old, repl)
}

func (s *Service) decode(v string) string {
	if s.decodeAttachment != nil {
		return s.decodeAttachment(v)
	}
	return v
}

func zanHas(userid int64, zanUser string) int {
	if userid == -1 || !truthyStr(zanUser) {
		return 0
	}
	for _, one := range strings.Split(zanUser, ",") {
		if int64(phpIntval(one)) == userid {
			return 1
		}
	}
	return 0
}

// detailBranch 复刻非 paotui-order 评论的 detail 解析（module-action → handlers->getHandle）。
func (s *Service) detailBranch(c *commentCtx, row *Object, typ, aid string) error {
	module, action, hasAction := strings.Cut(typ, "-")
	if i := strings.Index(action, "-"); i >= 0 { // explode('-')[1] 只取第二段
		action = action[:i]
	}
	_ = hasAction
	actionOrig := action

	switch {
	case module == "business" || (module == "info" && action == "business") || (module == "waimai" && action == "order"):
		action = "storeDetail"
	case (module == "tuan" && action == "order") || (module == "shop" && action == "order"):
		action = "detail"
	case module == "circle":
		action = "blogdetail"
	}
	template := action
	if action == "blogdetail" {
		template = "blog_detail"
	}
	param := fburl.Params{{Key: "service", Value: module}, {Key: "template", Value: template}, {Key: "id", Value: aid}}

	if s.moduleDetail == nil {
		return errMissingDep
	}
	info, ok, err := s.moduleDetail(c.ctx, c.req, module, action, aid)
	if err != nil {
		return err
	}
	if ok {
		if info == nil {
			return nil // state==100 但 info 不是数组：什么都不设
		}
		d := cloneObject(info)
		row.Set("detail", d)
		if module == "circle" {
			pa, _ := info.Get("picadr")
			d.Set("pics", pa)
		}
		// 规则文档写 waimai-order → title=shopname；但 PHP 此处判断 $action == "order"，
		// 而 $action 前面已被改写成 storeDetail，该分支恒不触发，照搬不实现。
		if module == "info" && actionOrig == "business" {
			idv, _ := info.Get("id")
			param = fburl.Params{{Key: "service", Value: module}, {Key: "template", Value: "business"}, {Key: "id", Value: phpString(idv)}}
		}
		if u, _ := info.Get("url"); !phpTruthy(u) {
			url, err := s.urlPathOf(c, param)
			if err != nil {
				return err
			}
			d.Set("url", url)
		}
		return nil
	}

	info, ok, err = s.moduleDetail(c.ctx, c.req, module, action+"Detail", aid)
	if err != nil {
		return err
	}
	if ok {
		if info == nil {
			return nil
		}
		d := cloneObject(info)
		row.Set("detail", d)
		if module == "travel" || (module == "marry" && actionOrig == "store") || (module == "marry" && actionOrig == "rental") {
			idv, _ := info.Get("id")
			param = fburl.Params{{Key: "service", Value: module}, {Key: "template", Value: actionOrig + "-detail"}, {Key: "id", Value: phpString(idv)}}
		}
		if u, _ := info.Get("url"); !phpTruthy(u) {
			url, err := s.urlPathOf(c, param)
			if err != nil {
				return err
			}
			d.Set("url", url)
		}
		return nil
	}
	d := NewObject()
	d.Set("id", aid)
	d.Set("title", infoGone)
	row.Set("detail", d)
	return nil
}

func cloneObject(o *Object) *Object {
	n := NewObject()
	for _, k := range o.keys {
		n.Set(k, o.vals[k])
	}
	return n
}

func phpString(v any) string {
	switch x := v.(type) {
	case nil:
		return ""
	case string:
		return x
	case json.Number:
		return x.String()
	case float64:
		return strconv.FormatFloat(x, 'f', -1, 64)
	}
	return fmt.Sprint(v)
}

// ---- getChildComment ----

type childResult struct {
	state200 bool
	info     string
	list     []*Object // nil 表示 state 200 / 无 list
	totalAll int
}

type childRow struct {
	id, pid, typ, oid, rid, sid, ipaddr, zan, dtime, userid, zanUser, content, ip sql.NullString
}

func (s *Service) getChild(c *commentCtx, pid, rid, sid, page, pageSize int) (childResult, error) {
	if pid == 0 && rid == 0 && sid == 0 {
		return childResult{state200: true, info: infoParamError}, nil
	}
	if pageSize == 0 {
		pageSize = 10
	}
	if page == 0 {
		page = 1
	}
	t := s.commentTable

	var where string
	if rid != 0 {
		where = fmt.Sprintf(" AND `rid` = %d", rid)
	} else {
		where = fmt.Sprintf(" AND `pid` = %d AND (`rid` = 0 OR `rid` = %d)", pid, pid)
	}
	where += " AND `ischeck` = 1"

	var totalAll int
	// check 对应每个分支里「总条数 / 含三级总条数 / 0 条短路」的重复代码。
	check := func(allWhere string) (bool, error) {
		total, err := s.countRows(c, "SELECT COUNT(*) FROM "+t+" WHERE 1 = 1"+where)
		if err != nil {
			return false, err
		}
		if totalAll, err = s.countRows(c, "SELECT COUNT(*) FROM "+t+" WHERE 1 = 1"+allWhere); err != nil {
			return false, err
		}
		return total == 0, nil
	}
	if sid != 0 {
		where = fmt.Sprintf(" AND `sid` = %d", sid) // 直接覆盖整个 where，连 ischeck 也丢了
		if empty, err := check(fmt.Sprintf(" AND `sid` = %d AND `ischeck` = 1", sid)); err != nil || empty {
			return childResult{state200: err == nil, info: infoEmpty}, err
		}
	}
	if rid != 0 {
		if empty, err := check(fmt.Sprintf(" AND `rid` = %d AND `ischeck` = 1", rid)); err != nil || empty {
			return childResult{state200: err == nil, info: infoEmpty}, err
		}
	} else if pid != 0 {
		if empty, err := check(fmt.Sprintf(" AND `pid` = %d AND `ischeck` = 1", pid)); err != nil || empty {
			return childResult{state200: err == nil, info: infoEmpty}, err
		}
	}

	atpage := pageSize * (page - 1)
	var rows []childRow
	if atpage >= 0 && pageSize > 0 {
		q := "SELECT `id`, `pid`, `type`, `oid`, `rid`, `sid`, `ipaddr`, `zan`, `dtime`, `userid`, `zan_user`, `content`, `ip` FROM " + t +
			" WHERE 1 = 1" + where + " ORDER BY `id` ASC LIMIT ?, ?"
		rs, err := s.db.QueryContext(c.ctx, q, atpage, pageSize)
		if err != nil {
			return childResult{}, err
		}
		for rs.Next() {
			var r childRow
			if err := rs.Scan(&r.id, &r.pid, &r.typ, &r.oid, &r.rid, &r.sid, &r.ipaddr, &r.zan, &r.dtime, &r.userid, &r.zanUser, &r.content, &r.ip); err != nil {
				_ = rs.Close()
				return childResult{}, err
			}
			rows = append(rows, r)
		}
		if err := rs.Err(); err != nil {
			_ = rs.Close()
			return childResult{}, err
		}
		_ = rs.Close()
	}

	list := []*Object{}
	temp := cloneTemp(c.temp)
	now := s.now()
	for _, r := range rows {
		row := NewObject()
		row.Set("id", nstr(r.id))
		row.Set("pid", nstr(r.pid))
		row.Set("type", nstr(r.typ))
		row.Set("oid", nstr(r.oid))
		row.Set("rid", nstr(r.rid))
		row.Set("sid", nstr(r.sid))
		row.Set("ipaddr", nstr(r.ipaddr))
		row.Set("iphome", getIPHome(r.ipaddr.String, s.ipHomeMode))
		row.Set("zan", nstr(r.zan))
		row.Set("ftime", floorTime(now.Unix()-int64(phpIntval(r.dtime.String)), now))

		// 缓存键是 userid；isset 对 null 值为假。
		var user any
		if cached, ok := temp[r.userid.String]; ok && cached != nil {
			user = cached
		} else {
			d, err := s.detailOf(c, r.userid.String, r.userid.Valid)
			if err != nil {
				return childResult{}, err
			}
			user = d
			temp[r.userid.String] = d
		}
		row.Set("user", user)

		var replyTo any = []any{}
		if truthyStr(r.sid.String) {
			uidStr, valid, err := s.getOneUserID(c, r.sid.String)
			if err != nil {
				return childResult{}, err
			}
			if valid || uidStr != "" {
				if replyTo, err = s.detailOf(c, uidStr, valid); err != nil {
					return childResult{}, err
				}
			}
		}
		row.Set("reply_to_user", replyTo)
		row.Set("zan_has", zanHas(c.userid, r.zanUser.String))

		if rid != 0 {
			var member any = []any{}
			uidStr, valid, err := s.getOneUserID(c, r.sid.String)
			if err != nil {
				return childResult{}, err
			}
			if valid || uidStr != "" {
				if cached, ok := temp[uidStr]; ok && cached != nil {
					member = cached
				} else {
					// 疑似 PHP bug：detail 参数取的是 $value['uid']，该列在 SELECT * 里不存在 → null。
					d, err := s.detailOf(c, "", false)
					if err != nil {
						return childResult{}, err
					}
					member = d
					temp[uidStr] = d
				}
			}
			row.Set("member", member)
		}

		c.temp = cloneTemp(temp)

		row.Set("content", nstr(r.content))
		row.Set("dtime", nstr(r.dtime))
		row.Set("ip", nstr(r.ip))

		if rid == 0 {
			lower := NewObject()
			child, err := s.getChild(c, pid, phpIntval(r.id.String), sid, 1, 100)
			if err != nil {
				return childResult{}, err
			}
			var lowerList any = []any{}
			count := 0
			if !child.state200 {
				lowerList = child.list
				count = child.totalAll
			}
			lower.Set("count", count)
			lower.Set("list", lowerList)
			row.Set("lower", lower)
		}
		list = append(list, row)
	}
	return childResult{list: list, totalAll: totalAll}, nil
}
