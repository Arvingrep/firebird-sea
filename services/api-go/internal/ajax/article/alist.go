package article

import (
	"context"
	"crypto/md5"
	"database/sql"
	"encoding/base64"
	"encoding/hex"
	"math"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/fburl"
)

// alist 的「暂无数据」：action 返回 state=200 + info，外层 handlers.class.php:60 把 200/101
// 统一改写成 101、info 原样。注意 info 带全角感叹号（article.class.php:676）。
const (
	stateAlistEmpty = 101
	infoAlistEmpty  = "暂无数据！"
)

// alistTZ 是 PHP 侧 date()/strtotime()/mktime() 的时区：$cfg_timeZone = 8 →
// date_default_timezone_set('Etc/GMT-8')（common.inc.php:183），即 UTC+8。
var alistTZ = time.FixedZone("Etc/GMT-8", 8*3600)

// alistHTTPS 对应 $cfg_httpSecureAccess（config/siteConfig.inc.php:47 为 '1'），
// 只用于 article.class.php:973「真实播放地址必须是 https」的判断。
const alistHTTPS = true

// alistNumericLiteral 识别「拼进 SQL 后不会报错」的数字字面量。
// PHP 把参数原样插值进 SQL（只经过 addslashes），非数字会直接成为 SQL 语法错误；
// 这里用白名单得到同样的失败口径（→ COUNT 0 → 101）。
var alistNumericLiteral = regexp.MustCompile(`^[ \t]*[+-]?([0-9]+(\.[0-9]*)?|\.[0-9]+)[ \t]*$`)

// alistNumeric 等价 PHP is_numeric（允许前后空白、符号、小数、指数）。
var alistNumeric = regexp.MustCompile(`^[ \t\n\r\x0B\x0C]*[+-]?([0-9]+(\.[0-9]*)?|\.[0-9]+)([eE][+-]?[0-9]+)?[ \t\n\r\x0B\x0C]*$`)

// alistWhere 累积 WHERE 片段与占位符参数。
//
// bad 表示「PHP 拼出来的 SQL 一定是语法错误」：例如 flag 全部不认识时拼出悬空 `AND `，
// 或 notid/typeid/media/uid 含非数字字面量。PHP 的可见结果是 COUNT 失败 → totalCount 0
// → 101；isAjax 时只有列表查询失败 → list 空。两者由调用方按 bad 复刻。
type alistWhere struct {
	b    strings.Builder
	args []any
	bad  bool
}

func (w *alistWhere) add(frag string, args ...any) {
	w.b.WriteString(frag)
	w.args = append(w.args, args...)
}

func (w *alistWhere) str() string { return w.b.String() }

// alistTimeBounds 复刻 article.class.php:535-551 的时间戳（本地时区 UTC+8）。
type alistTimeBounds struct {
	todayk, todaye int64 // 今天 00:00:00 / 23:59:59
	time1, time2   int64 // 昨天
	time3, time4   int64 // 本周（周一 00:00:00 / 周日 23:59:59）
	btime, ovtime  int64 // 本月第一天 00:00:00 / 下月第一天 00:00:00
}

func alistNow() alistTimeBounds {
	now := time.Now().In(alistTZ)
	year, month, day := now.Date()
	midnight := time.Date(year, month, day, 0, 0, 0, 0, alistTZ)
	endOfDay := func(t time.Time) int64 { return t.Add(24*time.Hour - time.Second).Unix() }
	yesterday := midnight.AddDate(0, 0, -1)
	// PHP date('N')：周一=1、周日=7。
	weekday := int(now.Weekday())
	if weekday == 0 {
		weekday = 7
	}
	monday := midnight.AddDate(0, 0, -(weekday - 1))
	monthStart := time.Date(year, month, 1, 0, 0, 0, 0, alistTZ)
	return alistTimeBounds{
		todayk: midnight.Unix(),
		todaye: endOfDay(midnight),
		time1:  yesterday.Unix(),
		time2:  endOfDay(yesterday),
		time3:  monday.Unix(),
		time4:  endOfDay(monday.AddDate(0, 0, 6)),
		btime:  monthStart.Unix(),
		ovtime: monthStart.AddDate(0, 1, 0).Unix(),
	}
}

// alistLeadingNumber 用于 PHP 7.4 的「字符串→数字」转换（"1abc"→1、"abc"→0、
// "1.5"→1.5、""→0）。线上镜像是 php:7.4-fpm-alpine（deploy/docker/Dockerfile.base:8），
// 松散比较时数字串转数字、非数字串取前导数字，所以 $u != 1 等判断要走这个口径，
// 不能用 strconv.Atoi 那样的严格解析。
var alistLeadingNumber = regexp.MustCompile(`^[ \t\n\r\x0B\x0C]*[+-]?([0-9]+(\.[0-9]*)?|\.[0-9]+)([eE][+-]?[0-9]+)?`)

func alistNum(raw string) float64 {
	m := alistLeadingNumber.FindString(raw)
	if m == "" {
		return 0
	}
	f, err := strconv.ParseFloat(strings.TrimLeft(m, " \t\n\r\x0B\x0C"), 64)
	if err != nil {
		return 0
	}
	return f
}

// alistEqInt 复刻 `$raw == $want`（PHP 7.4 松散比较）。
func alistEqInt(raw string, want int) bool { return alistNum(raw) == float64(want) }

// alistObj 是保序的 JSON 对象，语义同 sdMap（重复赋值不改变位置），但值走 marshalPairs
// 的「不转义 HTML」口径：标题里的 <font>/<strong> 必须和 PHP json_encode 一样原样输出。
type alistObj struct{ m *sdMap }

func newAlistObj() *alistObj { return &alistObj{m: newSdMap()} }

func (o *alistObj) set(k string, v any) { o.m.set(k, v) }

func (o *alistObj) MarshalJSON() ([]byte, error) {
	return marshalPairs(o.m.keys, func(i int) any { return o.m.vals[o.m.keys[i]] })
}

// alistRow 是主查询的一行：保留 NULL 与字符串原值（等价 PDO FETCH_ASSOC）。
type alistRow struct {
	row map[string]any
}

func (f alistRow) get(key string) any { return f.row[key] }

func (f alistRow) str(key string) string { return sdStr(f.row[key]) }

// truthy 复刻 PHP 对列值的真值判断（NULL/""/"0" 为假）。
func (f alistRow) truthy(key string) bool { return sdTruthy(f.row[key]) }

// alistResult 是成功返回：字段顺序同 PHP array("pageInfo" => .., "list" => ..)。
type alistResult struct {
	PageInfo any   `json:"pageInfo"`
	List     []any `json:"list"`
}

// rewardInfo 对应 $data = array("count" => .., "amount" => ..)（article.class.php:1001）。
type rewardInfo struct {
	count  any
	amount any
}

func (r rewardInfo) MarshalJSON() ([]byte, error) {
	return marshalPairs([]string{"count", "amount"}, func(i int) any {
		if i == 0 {
			return r.count
		}
		return r.amount
	})
}

// groupImg 对应图集条目 array("path" => .., "info" => ..)（article.class.php:890-891）。
type groupImg struct {
	path string
	info any
}

func (g groupImg) MarshalJSON() ([]byte, error) {
	return marshalPairs([]string{"path", "info"}, func(i int) any {
		if i == 0 {
			return g.path
		}
		return g.info
	})
}

// alistTypeNode 是 getParentArr 链上的一节（分类 id / 名称）。
type alistTypeNode struct {
	id       string
	typename string
}

// alist 迁移自 article.class.php:336-1074（issue #252）。
//
// 口径要点（与 PHP 逐行对齐，改动前请先读原文）：
//   - COUNT 只带 $where（不含 $where1、不含 order），所以 orderby=2.1~2.4 的时间条件
//     只过滤列表、不影响 totalCount；orderby=4.x 的时间条件进 $where，两边都生效。
//   - 分页结构照搬 INNER JOIN 子查询：外层取全字段，内层只取 id + ORDER BY + LIMIT。
//   - 不实现 getCache / $HN_memory / $_G 缓存（与仓库既有迁移一致，直接实时查询）；
//     也不实现 siteSearchLog()：写搜索日志属于写操作，超出本 issue 只读迁移范围。
func (s *Service) alist(req *ajax.Request) ajax.Response {
	noData := ajax.Response{State: stateAlistEmpty, Info: infoAlistEmpty}
	if s.db == nil {
		return noData
	}
	ctx := context.Background()
	host := ""
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
		host = req.HTTP.Host
	}

	// $loginUid = $userLogin->getMemberID()，未登录为 -1。
	loginUid := int64(-1)
	if s.members != nil && req.HTTP != nil {
		if id, err := s.members.MemberID(ctx, req.HTTP); err == nil && id > -1 {
			loginUid = id
		}
	}

	// —— 参数：ajax.php 已做 "undefined"→""，(id|cityid|sid|state) 走强转名单 ——
	mold := sdParam(req, "mold")
	typeid := sdParam(req, "typeid")
	notid := sdParam(req, "notid")
	title := sdParam(req, "title")
	flag := sdParam(req, "flag")
	thumb := sdParam(req, "thumb")
	litpic := sdParam(req, "litpic")
	orderby := sdParam(req, "orderby")
	u := sdParam(req, "u")
	uid := sdParam(req, "uid")
	state := commaInts(req.Params, "state")
	groupImg := sdParam(req, "group_img")
	isAjax := sdParam(req, "isAjax")
	media := sdParam(req, "media")
	getZan := sdParam(req, "get_zan")
	zhuanti := sdParam(req, "zhuanti")
	buMonth := sdParam(req, "buMonth")
	mediaArctype := phpInt(sdParam(req, "media_arctype"))
	dynamicid := phpInt(sdParam(req, "dynamicid"))
	idParam := commaInts(req.Params, "id")
	page := smPageParam(req, "page", 1)
	pageSize := smPageParam(req, "pageSize", 10)

	where, where1 := &alistWhere{}, &alistWhere{}
	uIs1 := alistEqInt(u, 1)

	// 数据共享：canary 的 $customDataShare = 1（config/article.inc.php:24）→ 不拼城市条件。
	if !s.dataShare {
		if cityid := s.smCityID(req); cityid != 0 && !uIs1 && !smPHPTruthy(uid) {
			where.add(" AND lt.`cityid` = ?", cityid)
		} else {
			where.add(" AND lt.`cityid` !=0 ")
		}
	}

	// 指定信息 id（已经过 convertArrToStrWithComma，逐项 (int) 后过滤掉 0）。
	if smPHPTruthy(idParam) {
		kept := make([]string, 0, 8)
		for _, v := range strings.Split(idParam, ",") {
			if n := phpInt(v); n != 0 {
				kept = append(kept, strconv.Itoa(n))
			}
		}
		if len(kept) == 0 {
			where.bad = true // PHP 会拼出 `IN ()`，SQL 语法错误
		} else {
			where.add(" AND lt.`id` IN (" + strings.Join(kept, ",") + ")")
		}
	}

	// 会员维度：$u != 1 只看已审/已付/未删；$u == 1 只看本人（且不看审核状态）。
	if !uIs1 {
		where.add(" AND lt.`arcrank` = 1 AND lt.`waitpay` = 0 AND lt.`del` = 0 AND lt.`media_state` = 1")
		if smPHPTruthy(uid) {
			if alistNumericLiteral.MatchString(uid) {
				where.add(" AND lt.`admin` = " + strings.TrimSpace(uid))
			} else {
				where.bad = true // admin = abc → SQL 报错
			}
		}
	} else {
		where.add(" AND lt.`admin` = ? AND lt.`cityid` != 0", loginUid)
		if state != "" {
			// $where1 只进子查询、不进 COUNT（口径分裂，照搬）。
			if alistNumericLiteral.MatchString(state) {
				where1.add(" AND lt.`arcrank` = " + strings.TrimSpace(state))
			} else {
				where1.bad = true
			}
		}
	}

	if smPHPTruthy(media) {
		if media == "is" {
			where.add(" AND lt.`media` <> 0")
		} else if alistNumericLiteral.MatchString(media) {
			where.add(" AND lt.`media` = " + strings.TrimSpace(media))
		} else {
			where.bad = true
		}
	}

	if smPHPTruthy(zhuanti) {
		if zid := phpInt(zhuanti); zid != 0 {
			lower := strconv.Itoa(zid)
			if tips := s.alistDescendants(ctx, zid, s.zhuantiTable); len(tips) > 1 {
				for _, id := range tips[1:] {
					lower += "," + strconv.Itoa(id)
				}
			}
			where.add(" AND lt.`zhuanti` in (" + lower + ")")
		} else {
			where.add(" AND lt.`zhuanti` > 0")
		}
	}

	if mold != "" {
		if strings.Contains(mold, ",") {
			parts := strings.Split(mold, ",")
			for i, v := range parts {
				parts[i] = "lt.`mold` = " + strconv.Itoa(phpInt(v))
			}
			where.add(" AND (" + strings.Join(parts, " || ") + ")")
		} else {
			where.add(" AND lt.`mold` = " + strconv.Itoa(phpInt(mold)))
		}
	}

	if mediaArctype != 0 {
		where.add(" AND lt.`media_arctype` = " + strconv.Itoa(mediaArctype))
	}

	// 不能包含哪些新闻（原样插值，非数字即 SQL 语法错误）。
	if smPHPTruthy(notid) {
		parts := strings.Split(notid, ",")
		ok := true
		for i, v := range parts {
			if !alistNumericLiteral.MatchString(v) {
				ok = false
				break
			}
			parts[i] = strings.TrimSpace(v)
		}
		if ok {
			where.add(" AND lt.`id` not in (" + strings.Join(parts, ",") + ")")
		} else {
			where.bad = true
		}
	}

	// 模糊查询关键字：PHP 每个词拼 `title` like '%v%' OR `keywords` like '%v%'。
	if smPHPTruthy(title) {
		clauses := make([]string, 0, 4)
		var args []any
		for _, v := range strings.Split(title, " ") {
			if v == "" {
				continue
			}
			clauses = append(clauses, "`title` like ? OR `keywords` like ?")
			args = append(args, "%"+v+"%", "%"+v+"%")
		}
		where.add(" AND ("+strings.Join(clauses, " OR ")+")", args...)
	}

	// 匹配自定义属性：只认 h/r/b/t/p；一个都不认识时 $flag_where 是空串，
	// substr('',0,-4) 仍是 ''，于是拼出悬空 `AND ` → SQL 报错（照搬，不"修正"）。
	if smPHPTruthy(flag) {
		flags := strings.Split(flag, ",")
		flagWhere := ""
		for _, f := range []struct{ key, col string }{
			{"h", "flag_h"}, {"r", "flag_r"}, {"b", "flag_b"}, {"t", "flag_t"}, {"p", "flag_p"},
		} {
			for _, v := range flags {
				if v == f.key {
					flagWhere += " lt.`" + f.col + "` = 1 AND "
					break
				}
			}
		}
		flagWhere = strings.TrimSuffix(flagWhere, " AND ")
		where.add(" AND " + flagWhere)
		if flagWhere == "" {
			where.bad = true
		}
	}

	// 缩略图：$thumb 为空时回退 $litpic，之后是严格字符串比较（=== "0" / === "1"）。
	if !smPHPTruthy(thumb) {
		thumb = litpic
	}
	if thumb == "0" {
		where.add(" AND lt.`flag_p` = 0 ")
	} else if thumb == "1" {
		where.add(" AND lt.`flag_p` = 1 ")
	}

	// 遍历分类（getTypeList 递归子类；$lower 的第一项是参数原值，所以是原样插值）。
	if smPHPTruthy(typeid) {
		tips := s.alistDescendants(ctx, phpInt(typeid), s.typeTable)
		lower := typeid
		for _, id := range tips[1:] {
			lower += "," + strconv.Itoa(id)
		}
		if alistLiteralList(lower) {
			where.add(" AND lt.`typeid` in (" + lower + ")")
		} else {
			where.bad = true
		}
	}

	if dynamicid != 0 {
		where.add(" AND lt.`id` < " + strconv.Itoa(dynamicid))
	}

	ts := alistNow()
	order := " ORDER BY lt.`weight` DESC, lt.`pubdate` DESC, lt.`id` DESC"
	switch orderby {
	case "1":
		order = " ORDER BY lt.`pubdate` DESC, lt.`weight` DESC, lt.`id` DESC"
	case "2":
		order = " ORDER BY lt.`click` DESC, lt.`weight` DESC, lt.`id` DESC"
	case "2.1":
		order = " AND `pubdate` > " + i64(ts.todayk) + " AND `pubdate` < " + i64(ts.todaye) +
			" ORDER BY lt.`click` DESC, lt.`weight` DESC, lt.`id` DESC"
	case "2.2":
		order = " AND `pubdate` > " + i64(ts.time1) + " AND `pubdate` < " + i64(ts.time2) +
			"  ORDER BY lt.`click` DESC, lt.`weight` DESC, lt.`id` DESC"
	case "2.3":
		order = " AND `pubdate` > " + i64(ts.time3) + " AND `pubdate` < " + i64(ts.time4) +
			"  ORDER BY lt.`click` DESC, lt.`weight` DESC, lt.`id` DESC"
	case "2.4":
		order = " AND `pubdate` > " + i64(ts.btime) + " AND `pubdate` < " + i64(ts.ovtime) +
			" ORDER BY lt.`click` DESC, lt.`weight` DESC, lt.`id` DESC"
	case "3":
		order = " ORDER BY rand()"
	}

	// 评论排行分支：orderby 里含 "4" 即走（PHP strstr）；4.1~4.4 的时间条件进 $where，
	// 所以 COUNT 也跟着过滤；排序仍是默认（PHP 里 ORDER BY total DESC 被注释掉）。
	commentRank := strings.Contains(orderby, "4")
	if commentRank {
		switch orderby {
		case "4.1":
			where.add(" AND lt.`pubdate` > " + i64(ts.todayk) + " AND lt.`pubdate` < " + i64(ts.todaye))
		case "4.2":
			where.add(" AND lt.`pubdate` > " + i64(ts.time1) + " AND lt.`pubdate` < " + i64(ts.time2))
		case "4.3":
			where.add(" AND lt.`pubdate` > " + i64(ts.time3) + " AND lt.`pubdate` < " + i64(ts.time4))
		case "4.4":
			where.add(" AND lt.`pubdate` >  " + i64(ts.btime) + " AND lt.`pubdate` < " + i64(ts.ovtime))
		}
	}

	pageInfo := newSdMap()

	// 总分页数：只有非 isAjax 才算（isAjax 时 pageInfo 输出空数组，也不走 101）。
	if !smPHPTruthy(isAjax) {
		count := ""
		if !where.bad {
			var total sql.NullString
			q := "SELECT COUNT(*) total FROM " + s.alTable + " lt WHERE `del` = 0" + where.str()
			if err := s.db.QueryRowContext(ctx, q, where.args...).Scan(&total); err == nil && total.Valid {
				count = total.String
			}
		}
		if count == "" || count == "0" {
			return noData
		}
		pageInfo.set("page", page)
		pageInfo.set("pageSize", pageSize)
		pageInfo.set("totalPage", phpCeilFloat(math.Ceil(float64(phpInt(count))/float64(pageSize))))
		pageInfo.set("totalCount", count)
	}

	// 会员中心：$u == 1 且已登录时追加灰度/待审/拒绝计数（顺序在 totalCount 之后）。
	if uIs1 && loginUid > -1 {
		if smPHPTruthy(buMonth) {
			// 按月统计各 mold 的条数，直接返回 {total0..total3}（没有 state 包裹）。
			const monthCond = " AND DATE_FORMAT(FROM_UNIXTIME(lt.`pubdate`), '%Y-%m') = ?"
			totals := newSdMap()
			for _, m := range []int{0, 1, 2, 3} {
				var n any = int64(0)
				if !where.bad {
					var c sql.NullString
					q := "SELECT COUNT(*) total FROM " + s.alTable + " lt WHERE lt.`mold` = " + strconv.Itoa(m) +
						" AND lt.`del` = 0" + where.str() + monthCond
					args := append(append([]any{}, where.args...), buMonth)
					if err := s.db.QueryRowContext(ctx, q, args...).Scan(&c); err == nil && c.Valid {
						n = c.String
					}
				}
				totals.set("total"+strconv.Itoa(m), n)
			}
			return ajax.Response{State: ajax.StateOK, Info: totals}
		}
		for _, st := range []struct {
			arcrank int
			key     string
		}{{0, "gray"}, {1, "audit"}, {2, "refuse"}} {
			var n any = int64(0)
			if !where.bad {
				var c sql.NullString
				q := "SELECT COUNT(*) total FROM " + s.alTable + " lt WHERE `del` = 0" + where.str() +
					" AND lt.`arcrank` = " + strconv.Itoa(st.arcrank)
				if err := s.db.QueryRowContext(ctx, q, where.args...).Scan(&c); err == nil && c.Valid {
					n = c.String
				}
			}
			pageInfo.set(st.key, n)
		}
	}

	// $u 为真值且有 buMonth：直接返回 pageInfo，列表被丢弃。isAjax 时 pageInfo 是空数组
	// （PHP 里是 falsy），外层照样降级成 102。
	if smPHPTruthy(u) && smPHPTruthy(buMonth) {
		if len(pageInfo.keys) == 0 {
			return ajax.Response{State: stateNoData, Info: infoNoData}
		}
		return ajax.Response{State: ajax.StateOK, Info: pageInfo}
	}

	atPage := pageSize * (page - 1)
	limit := " LIMIT " + strconv.Itoa(atPage) + ", " + strconv.Itoa(pageSize)
	// PHP 的 $keyStr 是未定义变量（空串），所以这里保留 "lt  WHERE" 两个空格。
	sub := "SELECT lt.`id` FROM " + s.alTable + " lt  WHERE lt.`del` = 0" +
		where.str() + where1.str() + order + limit
	query := s.alistFields(commentRank) + " FROM " + s.alTable + " l INNER JOIN (" + sub + ") AS tmp ON tmp.`id` = l.`id`"

	list := []any{}
	var rows []map[string]any
	if !where.bad && !where1.bad {
		// 查询失败（POST 负数 LIMIT、非法 state 等）等价 PHP $results 为假 → list 空。
		rows, _ = s.sdScanRows(ctx, query, append(append([]any{}, where.args...), where1.args...)...)
	}

	// PHP 里 $videotime_ / $articleDetail['realVideoUrl'] 都不在循环内重置，mold=0 的条目
	// 会带着上一条视频条目的残留值；这里同样跨条目保留。
	var videotimeOut any
	realVideoURL := ""
	mediaCache := map[string]any{}

	for _, row := range rows {
		val := alistRow{row: row}
		if dynamicid != 0 {
			// dynamicid > 0：每条都改成 $this->param = id; return $this->detail()。
			// #260 article.detail 尚未迁移：Dep.Detail 为 nil 时降级 102（已知偏差）。
			if s.detail == nil {
				return ajax.Response{State: stateNoData, Info: infoNoData}
			}
			detailReq := &ajax.Request{
				Service: "article", Action: "detail",
				Params: url.Values{"id": {val.str("id")}}, HTTP: req.HTTP,
			}
			resp := s.detail(detailReq)
			if resp.State == ajax.StateOK {
				list = append(list, resp.Info)
			} else {
				d := newSdMap()
				d.set("state", resp.State)
				d.set("info", resp.Info)
				list = append(list, d)
			}
			continue
		}
		list = append(list, s.alistItem(ctx, req, host, val, uIs1, loginUid, groupImg, getZan, mediaCache, &videotimeOut, &realVideoURL))
	}

	var info any = pageInfo
	if len(pageInfo.keys) == 0 {
		info = []any{}
	}
	return ajax.Response{State: ajax.StateOK, Info: alistResult{PageInfo: info, List: list}}
}

// alistItem 复刻 article.class.php:797-1070 单条列表项。字段必须按 PHP 的赋值顺序输出。
//
// fburl 解析失败（App UA 等尚未移植的链接分支、或查库失败）时该字段退化为空串并继续：
// PHP 的 getUrlPath/getFilePath 没有错误出口，最坏情况是 url=false / 图片原样返回，
// 列表本身照常输出；这里不能让一条链接把整页降级成 101。
func (s *Service) alistItem(
	ctx context.Context, req *ajax.Request, host string, val alistRow,
	uIs1 bool, loginUid int64, groupImgParam, getZan string,
	mediaCache map[string]any, videotimeOut *any, realVideoURL *string,
) *alistObj {
	pid := phpInt(val.str("id"))
	flagVal := strings.ToLower(val.str("flag"))
	moldVal := val.str("mold")

	item := newAlistObj()
	item.set("id", val.get("id"))

	// 标题：color → <font>，flag 含 b → <strong>，闭合顺序 </strong></font>。
	className, className1, htmlName, htmlName1 := "", "", "", ""
	if val.truthy("color") {
		className = `<font style="color:` + val.str("color") + `">`
		className1 = "</font>"
	}
	for _, f := range strings.Split(flagVal, ",") {
		if f == "b" {
			htmlName, htmlName1 = "<strong>", "</strong>"
			break
		}
	}
	item.set("title", className+htmlName+val.str("title")+htmlName1+className1)
	item.set("puretitle", val.get("title"))
	item.set("subtitle", val.get("subtitle"))
	item.set("typeid", val.get("typeid"))
	item.set("admin", val.get("admin"))

	// typeName / typeUrl：getParentArr + parent_foreach + array_reverse（根 → 自身）。
	chain := s.alistTypeChain(ctx, phpInt(val.str("typeid")))
	names := make([]any, 0, len(chain))
	for _, n := range chain {
		names = append(names, n.typename)
	}
	item.set("typeName", names)
	topTypeID := ""
	if len(chain) > 0 {
		topTypeID = chain[0].id
	}
	typeURL, _ := s.zlURL(ctx, host, fburl.Params{
		{Key: "service", Value: "article"},
		{Key: "template", Value: "list"},
		{Key: "typeid", Value: topTypeID},
	})
	item.set("typeUrl", []string{typeURL})

	item.set("flag", flagVal)

	// keywords：逗号（半角/全角）都换成空格；keywordsArr 按空格切，空串为 []。
	keywords := strings.ReplaceAll(val.str("keywords"), ",", " ")
	keywords = strings.ReplaceAll(keywords, "，", " ")
	item.set("keywords", keywords)
	keywordArr := []string{}
	if sdTruthy(keywords) {
		keywordArr = strings.Split(keywords, " ")
	}
	item.set("keywordsArr", keywordArr)

	item.set("description", val.get("description"))
	item.set("writer", val.get("writer"))
	item.set("redirecturl", val.get("redirecturl"))
	litpicOut := ""
	if val.truthy("litpic") {
		litpicOut, _ = s.zlFile(ctx, host, val.str("litpic"))
	}
	item.set("litpic", litpicOut)
	item.set("color", val.get("color"))
	item.set("click", val.get("click"))
	item.set("click_", alistClick(val))

	item.set("mold", val.get("mold"))
	item.set("prop", phpInt(val.str("prop")))

	// 会员中心显示信息状态和支付状态（位置在 pubdate 之前）。
	if uIs1 && loginUid > -1 {
		item.set("arcrank", val.get("arcrank"))
		item.set("waitpay", val.get("waitpay"))
	}
	item.set("pubdate", val.get("pubdate"))
	item.set("common", val.get("total"))

	detailURL, _ := s.zlURL(ctx, host, fburl.Params{
		{Key: "service", Value: "article"},
		{Key: "template", Value: "detail"},
		{Key: "id", Value: val.str("id")},
		{Key: "flag", Value: flagVal},
		{Key: "redirecturl", Value: val.str("redirecturl")},
		{Key: "typeid", Value: val.str("typeid")},
	})
	item.set("url", detailURL)

	// 图集：$group_img 为真值或 mold=1 才查，最多 6 张。
	if smPHPTruthy(groupImgParam) || alistEqInt(moldVal, 1) {
		pics, _ := s.sdScanRows(ctx, "SELECT `picPath`, `picInfo` FROM "+s.alPicTable+" WHERE `aid` = ? ORDER BY `id` ASC LIMIT 0, 6", pid)
		imgCount := 0
		if len(pics) > 0 {
			imgs := make([]groupImg, 0, len(pics))
			for _, p := range pics {
				path, _ := s.zlFile(ctx, host, sdStr(p["picPath"]))
				imgs = append(imgs, groupImg{path: path, info: p["picInfo"]})
			}
			item.set("group_img", imgs)
			var c sql.NullString
			_ = s.db.QueryRowContext(ctx, "SELECT COUNT(`id`) total FROM "+s.alPicTable+" WHERE `aid` = ?", pid).Scan(&c)
			imgCount = phpInt(c.String)
		} else if alistEqInt(moldVal, 1) {
			item.set("group_img", []groupImg{})
		}
		item.set("group_imgnum", imgCount)
	}

	// 视频（mold=2 视频 / mold=3 短视频）：缩略图宽高、时长、播放地址。
	if alistEqInt(moldVal, 2) || alistEqInt(moldVal, 3) {
		litpicRaw := val.str("litpic")
		fid := alistRenrenDecrypt(alistPHPBase64Decode(litpicRaw))
		lookup := func(q, arg string) (string, string, bool) {
			rows, ok := s.sdScanRows(ctx, q, arg)
			if !ok || len(rows) == 0 {
				return "", "", false
			}
			return sdStr(rows[0]["width"]), sdStr(rows[0]["height"]), true
		}
		var width, height string
		var found bool
		if alistNumeric.MatchString(fid) {
			width, height, found = lookup("SELECT `width`, `height` FROM "+s.alAttachmentTable+" WHERE `id` = ?", fid)
		} else {
			// $rpic = str_replace('/uploads', '', $litpic)
			rpic := strings.ReplaceAll(litpicRaw, "/uploads", "")
			width, height, found = lookup("SELECT `width`, `height` FROM "+s.alAttachmentTable+" WHERE `path` = ?", rpic)
			if !found && strings.Contains(litpicRaw, "//") {
				// explode('//', litpic)：https 的取第 3 段（通常不存在 → "/"），否则取第 2 段。
				parts := strings.Split(litpicRaw, "//")
				seg := ""
				if strings.Contains(litpicRaw, "https://") {
					if len(parts) > 2 {
						seg = parts[2]
					}
				} else if len(parts) > 1 {
					seg = parts[1]
				}
				width, height, found = lookup("SELECT `width`, `height` FROM "+s.alAttachmentTable+" WHERE `path` = ?", "/"+seg)
			}
		}
		if found && sdTruthy(width) && sdTruthy(height) {
			item.set("picwidth", phpInt(width))
			item.set("picheight", phpInt(height))
		}

		item.set("videotime", phpInt(val.str("videotime")))
		*videotimeOut = alistVideoTime(phpInt(val.str("videotime")), val.truthy("videotime"))

		videotype := val.get("videotype")
		var videourl string
		if sdTruthy(videotype) && alistIsMobile(req) {
			videourl = val.str("videourl")
			*realVideoURL = alistRealVideoURL(videourl)
		} else {
			videourl, _ = s.zlFile(ctx, host, val.str("videourl"))
		}
		// 真实播放地址不是 MP4、或站点开了 HTTPS 但地址不是 HTTPS 时不用它。
		if *realVideoURL != "" && alistIsMobile(req) && strings.Contains(*realVideoURL, ".mp4") &&
			(!alistHTTPS || strings.Contains(*realVideoURL, "https://")) {
			videotype = 0
			videourl = *realVideoURL
		}
		item.set("videourl", videourl)
		item.set("videotype", phpInt(sdStr(videotype)))
	}
	item.set("videotime_", *videotimeOut)

	// 打赏（PHP 有 $HN_memory 缓存，这里实时查，对比用例不需要忽略：结果一致）。
	item.set("reward", s.alistReward(ctx, pid))

	// 媒体号：等价 selfmediaDetail(0, mediaid)；$_G 的请求级缓存在这里用 map 复刻。
	mediaID := val.str("media")
	var mediaObj any
	if sdTruthy(val.get("media")) {
		if cached, ok := mediaCache[mediaID]; ok {
			mediaObj = cached
		} else {
			// PHP 是 $this->selfmediaDetail(0, $mediaid)：uid 固定 0、只带 aid。
			// 请求里的 uid/type 等参数不能透传，否则会按 uid 查到别的自媒体号。
			resp := s.selfmediaDetail(&ajax.Request{
				Service: "article", Action: "selfmediaDetail",
				Params: url.Values{"aid": {mediaID}}, HTTP: req.HTTP,
			})
			if resp.State == ajax.StateOK {
				mediaObj = resp.Info
			}
			mediaCache[mediaID] = mediaObj
		}
	}
	item.set("media", mediaObj)
	if mediaObj != nil {
		item.set("source", alistMediaName(mediaObj))
	} else {
		item.set("source", val.get("source"))
	}

	// writer 为空时回退媒体号名称，再为空输出空串（empty() 把 "0" 也算空）。
	if !sdTruthy(val.get("writer")) {
		if mediaObj != nil {
			item.set("writer", alistMediaName(mediaObj))
		} else {
			item.set("writer", "")
		}
	}

	if smPHPTruthy(getZan) {
		item.set("zan", s.alistIsZan(ctx, pid, loginUid))
	}
	item.set("zannum", phpInt(val.str("zan")))
	item.set("typeset", phpInt(val.str("typeset")))

	// 专题：查父级专题的 id/typename 拼出 {url, title}；查不到输出 []。
	var zhuantiVal any = []any{}
	if val.truthy("zhuanti") {
		rows, ok := s.sdScanRows(ctx, "SELECT zt.`id`, zt.`typename` FROM "+s.zhuantiTable+
			" z LEFT JOIN "+s.zhuantiTable+" zt ON zt.`id` = z.`parentid` WHERE z.`id` = ?", phpInt(val.str("zhuanti")))
		if ok && len(rows) > 0 {
			ztURL, _ := s.zlURL(ctx, host, fburl.Params{
				{Key: "service", Value: "article"},
				{Key: "template", Value: "zt_detail"},
				{Key: "id", Value: sdStr(rows[0]["id"])},
			})
			zt := newSdMap()
			zt.set("url", ztURL)
			zt.set("title", rows[0]["typename"])
			zhuantiVal = zt
		}
	}
	item.set("zhuanti", zhuantiVal)

	return item
}

// alistFields 是主查询的字段列表（article.class.php:637 / 667 原样）。
// 评论排行分支不含 typeid/source/typeset，于是这些字段在输出里变成 null / [] / 0。
func (s *Service) alistFields(commentRank bool) string {
	comment := "(SELECT COUNT(`id`)  FROM " + s.alCommentTable +
		" WHERE `aid` = l.`id` AND `ischeck` = 1 AND `type` = 'article-detail') AS total"
	if commentRank {
		return "SELECT l.`id`, l.`title`, l.`admin`, l.`media`, l.`subtitle`, l.`flag`, l.`weight`, l.`keywords`, " +
			"l.`description`, l.`redirecturl`, l.`litpic`, l.`color`, l.`click`, l.`arcrank`, l.`pubdate`, l.`prop`, " +
			comment + ", l.`waitpay`, l.`admin`, l.`mold`, l.`zan`, l.`writer`, l.`videotime`, l.`videotype`, " +
			"l.`videourl`, l.`zhuanti`"
	}
	return "SELECT l.`id`, l.`title`, l.`admin`, l.`media`, l.`subtitle`, l.`typeid`, l.`flag`, l.`weight`, " +
		"l.`keywords`, l.`description`, l.`source`, l.`redirecturl`, l.`litpic`, l.`color`, l.`click`, l.`arcrank`, " +
		"l.`pubdate`, l.`typeset`, l.`videotype`, l.`videourl`, l.`prop`, " + comment + ", l.`waitpay`, l.`admin`, " +
		"l.`mold`, l.`zan`, l.`writer`, l.`videotime`, l.`videotype`, l.`videourl`, l.`zhuanti`"
}

// alistClick 复刻 `$click >= 10000 ? sprintf("%.1f", $click/10000)."万" : $click`。
func alistClick(val alistRow) any {
	raw := val.get("click")
	if raw == nil {
		return nil
	}
	if f := alistNum(val.str("click")); f >= 10000 {
		return strconv.FormatFloat(f/10000, 'f', 1, 64) + "万"
	}
	return raw
}

// alistVideoTime 复刻 article.class.php:938-961 的时长格式化：
// 分钟/小时都不补零，秒数超过 60 才进位，$val['videotime'] 为 0 时固定 "00:00"。
func alistVideoTime(total int, truthy bool) string {
	out := "00:00"
	if !truthy {
		return out
	}
	theTime, minutes, hours := total, 0, 0
	if theTime > 60 {
		minutes = theTime / 60
		theTime = theTime % 60
		if minutes > 60 {
			hours = minutes / 60
			minutes = minutes % 60
		}
	}
	out = strconv.Itoa(theTime)
	switch {
	case minutes > 0 && hours > 0:
		out = strconv.Itoa(hours) + ":" + strconv.Itoa(minutes) + ":" + out
	case minutes > 0:
		out = strconv.Itoa(minutes) + ":" + out
	default:
		out = "00:" + out
	}
	return out
}

// alistIsMobile 复刻 isMobile()：HN_tg=1 直接短路，否则看 UA。
// 正则里带大写字母的分支（Nokia/Symbian/iPod/AppleWebKit…）在 strtolower 之后永远
// 匹配不上，历史行为不能"修"，所以只列小写子串（口径同 siteconfig）。
func alistIsMobile(req *ajax.Request) bool {
	if req.HTTP == nil {
		return false
	}
	if ck, err := req.HTTP.Cookie("HN_tg"); err == nil && ck.Value == "1" {
		return true
	}
	ua := strings.ToLower(req.HTTP.UserAgent())
	for _, n := range []string{"iphone", "ios", "android", "mini", "mobile", "mobi", "wp7", "wp8", "cfnetwork", "harmony"} {
		if strings.Contains(ua, n) {
			return true
		}
	}
	return false
}

// alistRealVideoURL 复刻 getRealVideoUrl（common.func.php:13251）：空串返回空；
// 非腾讯视频原样返回。腾讯视频的真实地址要 curl vv.video.qq.com（解析失败时 PHP 也
// 返回原地址），这里不发起外部请求，按"解析失败"口径返回原地址。
func alistRealVideoURL(raw string) string { return raw }

// alistIsZan 复刻 checkIsZan(member.getZan, check=1)：public_up_all 里有行即 'has'。
// 查询失败时 dsqlOper 返回的是非空字符串（真值），PHP 的 !empty($res) 同样成立 → 1。
func (s *Service) alistIsZan(ctx context.Context, aid int, loginUid int64) int {
	rows, ok := s.sdScanRows(ctx, "SELECT `id` FROM "+s.alUpTable+
		" WHERE `type` = 0 AND `action` = 'detail' AND `module` = 'article' AND `tid` = ? AND `ruid` = ?", aid, loginUid)
	if !ok || len(rows) > 0 {
		return 1
	}
	return 0
}

// alistReward 复刻 article.class.php:984-1007：count 是 PDO 字符串，amount 是 SUM 的
// DECIMAL 字符串；count 为 0 时 amount 直接是 int 0。
func (s *Service) alistReward(ctx context.Context, aid int) rewardInfo {
	var count any = int64(0)
	var amount any = int64(0)
	var c sql.NullString
	q := "SELECT COUNT(`id`) total FROM " + s.alRewardTable + " WHERE `aid` = ? AND `module` = 'article' AND `state` = 1"
	if err := s.db.QueryRowContext(ctx, q, aid).Scan(&c); err == nil && c.Valid {
		count = c.String
	}
	if sdTruthy(count) {
		var amt sql.NullString
		q = "SELECT SUM(`amount`) totalAmount FROM " + s.alRewardTable + " WHERE `module` = 'article' AND `aid` = ? AND `state` = 1"
		if err := s.db.QueryRowContext(ctx, q, aid).Scan(&amt); err == nil {
			if amt.Valid {
				amount = amt.String
			} else {
				amount = nil
			}
		}
	}
	return rewardInfo{count: count, amount: amount}
}

// alistMediaName 取媒体号对象里的 ac_name（缺失为 nil，与 PHP 读未定义下标一致）。
func alistMediaName(media any) any {
	if m, ok := media.(*sdMap); ok {
		if v, exists := m.vals["ac_name"]; exists {
			return v
		}
	}
	return nil
}

// alistTypeChain 复刻 getParentArr("articletype", $typeid) + parent_foreach + array_reverse：
// 返回 根 → 自身 的分类链。查不到（含 typeid 为 0）时返回空，等价 PHP 的 []。
func (s *Service) alistTypeChain(ctx context.Context, typeid int) []alistTypeNode {
	var chain []alistTypeNode
	// 防御脏数据成环；PHP 会无限递归，这里截断。
	for depth := 0; typeid != 0 && depth < 64; depth++ {
		rows, ok := s.sdScanRows(ctx, "SELECT `id`, `parentid`, `typename`, `weight` FROM "+
			s.typeTable+" WHERE `id` = ?", typeid)
		if !ok || len(rows) == 0 {
			break
		}
		node := alistTypeNode{id: sdStr(rows[0]["id"]), typename: sdStr(rows[0]["typename"])}
		chain = append([]alistTypeNode{node}, chain...)
		parent := phpInt(sdStr(rows[0]["parentid"]))
		if parent == 0 {
			break
		}
		typeid = parent
	}
	return chain
}

// alistDescendants 复刻 getTypeList($id, $tab) + arr_foreach：本分类 + 全部后代 id
// （按 parentid 递归，不过滤 state；seen 防环）。查询失败当作无子类。
func (s *Service) alistDescendants(ctx context.Context, root int, table string) []int {
	ids := []int{root}
	seen := map[int]bool{root: true}
	frontier := []int{root}
	for len(frontier) > 0 {
		args := make([]any, len(frontier))
		for i, id := range frontier {
			args[i] = id
		}
		rows, ok := s.zlQuery(ctx, "SELECT `id` FROM "+table+" WHERE `parentid` IN ("+
			strings.TrimSuffix(strings.Repeat("?,", len(frontier)), ",")+")", 1, args...)
		if !ok {
			break
		}
		frontier = nil
		for _, r := range rows {
			if id := phpInt(zlStr(r[0])); id != 0 && !seen[id] {
				seen[id] = true
				ids = append(ids, id)
				frontier = append(frontier, id)
			}
		}
	}
	return ids
}

// alistLiteralList 判断 "1,2,3" 是否全由数字字面量组成。
func alistLiteralList(raw string) bool {
	if raw == "" {
		return false
	}
	for _, v := range strings.Split(raw, ",") {
		if !alistNumericLiteral.MatchString(v) {
			return false
		}
	}
	return true
}

func i64(v int64) string { return strconv.FormatInt(v, 10) }

// —— 以下三个函数是 RenrenCrypt 解密的最小移植，用于 mold=2/3 按缩略图取附件宽高 ——
//
// fburl/phputil.go 有同样的实现但不导出，且本 issue 不允许改该包，故在此保留一份逐字等价
// 的拷贝（算法、密钥、宽松 base64 过滤都不改，否则解密结果会对不上）。

const alistCryptKey = "KaCXPpoD1vyD[XUWwxhFhkXJulzS~u"

// alistPHPBase64Decode 复刻非严格 base64_decode：字母表外的字符跳过、补零可选。
func alistPHPBase64Decode(s string) string {
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

// alistRenrenDecrypt 复刻 RenrenCrypt::php_decrypt（内部还会再 base64 解码一次）。
func alistRenrenDecrypt(txt string) string {
	sum := md5.Sum([]byte(alistCryptKey))
	key := hex.EncodeToString(sum[:])
	t := alistPHPBase64Decode(txt)
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
