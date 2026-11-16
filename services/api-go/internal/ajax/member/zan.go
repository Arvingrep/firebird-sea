package member

import (
	"context"
	"database/sql"
	"net/http"
	"sort"
	"strconv"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// getZan 的文案（zh-CN/siteConfig.inc.php：[21][72] 操作失败、[20][262] 登录超时复用 infoLoginTimeout）。
const (
	infoOpFail = "操作失败，请重试！"
	// cfg_disableLikeInfo 未配置时的默认提示（member.class.php:18974）。
	infoDisableLikeDefault = "功能维护中，暂停使用！"
)

// getZan 迁移自 member.class.php:18965-19133（member.getZan，#258）。
//
// 顺序敏感：禁止点赞开关最先判（匿名也拦截）；随后无条件查 site_module 取模块名
// （getModuleTitle）；check 为真值时跳过登录门禁与参数门禁，只探测已赞（has）/未赞（no）；
// 正常路径先登录门禁（101）再参数门禁（101）。查重以 (type, action=temp, module, tid=id,
// ruid=操作者) 为准：有记录走取消，无记录走点赞。计数列只对 article+detail（articlelist
// 分表）、travel+video-detail（travel_video.zan）、tieba+detail（tieba_list.up）三种组合写，
// 其余组合不写计数；dsqlOper "update" 成功恒返回 "ok"（0 行也算成功），只有 SQL 异常才走
// 「操作失败，请重试！」且取消路径失败时不删 public_up_all。
//
// 与 PHP 的已知偏差（都不影响接口响应，注释口径同 #255/#256）：
//   - checkCache/clearCache 是站点侧缓存清理，Go 侧无缓存层，跳过；
//   - updateMemberNotice（点赞成功通知作者）未迁移：纯副作用（member_letter/推送），失败也
//     不影响返回 "ok"，等通知链路迁移后补；
//   - INSERT 后 dsqlOper lastid 的 public_up 分表 checkCreateTable 是建表维护动作，跳过。
func (s *Service) getZan(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	var httpReq *http.Request
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
		httpReq = req.HTTP
	}
	p := newParams(req)

	// 1. 禁止点赞开关：cfg_disableLikeState 强转 int 后非 0 直接返回（先于登录校验）。
	if s.disableLikeState != 0 {
		info := s.disableLikeInfo
		if info == "" || info == "0" { // PHP 真值判断：'' / '0' 都是假
			info = infoDisableLikeDefault
		}
		return fail(info)
	}

	// 2. 参数：id 在 ajax.php 已按 convertArrToStrWithComma 归一（"0" 归一成空串），
	//    module/temp/uid/title/check 原样（数组拼进 SQL 是字面量 "Array"），type 强转 int。
	id := paramID(req, "id")
	module, modulePresent := p.phpRaw("module")
	temp, tempPresent := p.phpRaw("temp")
	uid, _ := p.phpRaw("uid")
	title, _ := p.phpRaw("title")
	zanType := p.intval("type")
	checkTruthy := p.phpTruthy("check")

	// 3. getModuleTitle：在登录/参数门禁之前执行，check 与匿名模式下也会查 site_module。
	//    module 为空时 PHP empty($name) 不查询；查询失败/无记录返回 null（拼串为空）。
	modulename := ""
	if modulePresent && s.db != nil {
		modulename = s.moduleTitle(ctx, module)
	}

	// 4. userid 无条件取（$userLogin->getMemberID() 在 check 之前就调用）：check 模式匿名是 -1，
	//    已登录照常是会员 id，查重与底账都用它。
	userid, err := s.identityID(ctx, httpReq)
	if err != nil {
		return noData()
	}
	if !checkTruthy {
		if userid == -1 { // $userid == -1 → 登录超时
			return fail(infoLoginTimeout)
		}
		// 参数门禁：empty($id) || empty($module) || empty($temp)。id 由 ajax.php 归一，
		// "0" 已是空串；"0,0" 归一后仍是非空串，照 PHP 语义放行。
		if id == "" || !modulePresent || !tempPresent {
			return fail(infoParamError)
		}
	}

	// 本地无数据库（DB=nil）时按「查不到数据」降级：到这里必然要读写 public_up_all。
	if s.db == nil {
		return noData()
	}

	// 5. 查重：SELECT id FROM public_up_all WHERE type/action/module/tid/ruid。
	var recID sql.NullInt64
	err = s.db.QueryRowContext(ctx,
		"SELECT `id` FROM "+s.upTable+" WHERE `type` = ? and `action` = ? and `module` = ? and `tid` = ? and `ruid` = ?",
		zanType, temp, module, id, userid).Scan(&recID)
	if err != nil && err != sql.ErrNoRows {
		return noData()
	}
	exists := err == nil

	// 6. 通知文案：getMemberInfo() → member.detail 的 username（state=1 且 mtype 不为 0/3 才有）。
	//    只在文案会进响应/memberLog note 的路径上查；查不到（未匹配条件/库异常）按空串。
	username := ""
	if !checkTruthy {
		var uname sql.NullString
		qerr := s.db.QueryRowContext(ctx,
			"SELECT `username` FROM "+s.memberTable+" WHERE `state` = 1 AND `mtype` != 0 AND `mtype` != 3 AND `id` = ?",
			userid).Scan(&uname)
		if qerr == nil {
			username = uname.String
		}
	}

	if exists {
		// —— 取消路径 ——
		if checkTruthy {
			return ajax.Response{State: ajax.StateOK, Info: "has"}
		}
		content := modulename + username + "取消了点赞您的信息"
		if zanType == 1 {
			content = modulename + username + "取消了点赞您的评论"
		}

		if _, ok := s.zanCounter(ctx, id, module, temp, -1); !ok {
			// 计数写失败：不删 public_up_all（计数与底账可能不一致，照 PHP）。
			return fail(infoOpFail)
		}

		deleteSQL := "DELETE FROM " + s.upTable + " WHERE `type` = '" + strconv.Itoa(zanType) +
			"' and `action` = '" + temp + "' and `module` = '" + module +
			"' and `tid` = '" + id + "' and `ruid` = '" + strconv.FormatInt(userid, 10) + "'"
		// DELETE 删 0 行也不影响返回，写失败同样忽略（PHP 不检查返回值）。
		_, _ = s.db.ExecContext(ctx, deleteSQL)

		// 缓存清理（checkCache/clearCache）Go 侧无对应层，跳过；取消路径不通知（PHP 已注释死代码）。
		s.memberLog(ctx, httpReq, strconv.FormatInt(userid, 10), module, "", int64(phpIntval(id)),
			"delete", "取消点赞("+title+" => "+content+")", "", deleteSQL)
		return ajax.Response{State: ajax.StateOK, Info: "ok"}
	}

	// —— 点赞路径 ——
	if checkTruthy {
		return ajax.Response{State: ajax.StateOK, Info: "no"}
	}
	content := modulename + username + "点赞了您的信息"
	if zanType == 1 {
		content = modulename + username + "点赞了您的评论"
	}

	if _, ok := s.zanCounter(ctx, id, module, temp, 1); !ok {
		return fail(infoOpFail)
	}

	// INSERT 底账：PHP 不检查写库结果（lastid 也只用于 public_up 分表维护），失败照样返回 ok。
	insertSQL := "INSERT INTO " + s.upTable + " (`uid`, `tid`, `ruid`, `module`, `action`, `puctime`, `type`) VALUES ('" +
		uid + "', '" + id + "', '" + strconv.FormatInt(userid, 10) + "', '" + module + "', '" + temp +
		"', '" + strconv.FormatInt(s.now().Unix(), 10) + "', '" + strconv.Itoa(zanType) + "')"
	_, _ = s.db.ExecContext(ctx,
		"INSERT INTO "+s.upTable+" (`uid`, `tid`, `ruid`, `module`, `action`, `puctime`, `type`) VALUES (?, ?, ?, ?, ?, ?, ?)",
		uid, id, userid, module, temp, s.now().Unix(), zanType)

	s.memberLog(ctx, httpReq, strconv.FormatInt(userid, 10), module, "", int64(phpIntval(id)),
		"insert", "点赞("+title+" => "+content+")", "", insertSQL)
	// updateMemberNotice($uid, "会员-点赞提醒", ...)：纯副作用，未迁移（见函数头偏差说明）。
	return ajax.Response{State: ajax.StateOK, Info: "ok"}
}

// zanCounter 对应 getZan 里计数列的 ±1：只有三种组合真实写库，其余组合 PHP 把 $results
// 直接置 'ok'（不产生 SQL）。返回值 ok=false 对应 PHP 的 $results != 'ok'（SQL 异常），
// 0 行受影响在 PHP 里也是 'ok'，所以这里只看 ExecContext 是否报错。
func (s *Service) zanCounter(ctx context.Context, id, module, temp string, delta int) (string, bool) {
	sign := " + "
	if delta < 0 {
		sign = " - "
	}
	switch {
	case module == "article" && temp == "detail":
		table, err := s.articleSubTable(ctx, id)
		if err != nil {
			return "", false
		}
		q := quoteIdent(table)
		sqlText := "UPDATE " + q + " SET  `zan` = zan" + sign + "1 WHERE `id` = '" + id + "'"
		_, err = s.db.ExecContext(ctx, "UPDATE "+q+" SET `zan` = zan"+sign+"1 WHERE `id` = ?", id)
		return sqlText, err == nil
	case module == "travel" && temp == "video-detail":
		q := quoteIdent(s.travelVideoTable)
		sqlText := "UPDATE " + q + " SET  `zan` = zan" + sign + "1 WHERE `id` = '" + id + "'"
		_, err := s.db.ExecContext(ctx, "UPDATE "+q+" SET `zan` = zan"+sign+"1 WHERE `id` = ?", id)
		return sqlText, err == nil
	case module == "tieba" && temp == "detail":
		q := quoteIdent(s.tiebaTable)
		sqlText := "UPDATE " + q + " SET  `up` = up" + sign + "1 WHERE `id` = '" + id + "'"
		_, err := s.db.ExecContext(ctx, "UPDATE "+q+" SET `up` = up"+sign+"1 WHERE `id` = ?", id)
		return sqlText, err == nil
	default:
		return "", true
	}
}

// quoteIdent 给表名补反引号；已经带反引号的（Service 里预拼好的表名）先去掉再补，避免重复。
func quoteIdent(name string) string { return "`" + strings.Trim(name, "`") + "`" }

// articleSubTable 复刻 SubTable('articlelist', '#@__articlelist')->getSubTableById($id)：
// 分表清单来自 site_sub_tablelist（service='articlelist'，ORDER BY id desc），末尾补一张
// begin_id 为空的原始表。begin_id 命中（PHP 松散比较）直接用该表；否则把 id 与 0 混入
// begin_id 列排序后取 id 的前一个值：前值为 0（含空）用原始表，否则用该 begin_id 对应的
// 分表（PHP array_search 找不到时下标 false 会取第 0 行）。canary 该表当前为空，恒返回
// 原始表 huoniao_articlelist。
func (s *Service) articleSubTable(ctx context.Context, id string) (string, error) {
	type subEntry struct {
		table   string
		beginID *string
	}
	rows, err := s.db.QueryContext(ctx,
		"SELECT `table_name`, `begin_id` FROM "+s.subTableListTable+" WHERE `service` = 'articlelist' ORDER BY `id` DESC")
	if err != nil {
		return "", err
	}
	defer rows.Close()
	entries := []subEntry{}
	for rows.Next() {
		var table string
		var begin sql.NullString
		if err := rows.Scan(&table, &begin); err != nil {
			return "", err
		}
		e := subEntry{table: table}
		if begin.Valid {
			b := begin.String
			e.beginID = &b
		}
		entries = append(entries, e)
	}
	if err := rows.Err(); err != nil {
		return "", err
	}
	// PHP $ret[] = ['table_name' => old_table]：补在末尾，无 begin_id。
	entries = append(entries, subEntry{table: s.articleListTable})

	// 第一轮：array_search($id, begin_id 列)（松散比较），命中直接用。
	for _, e := range entries {
		if e.beginID != nil && looseEqual(*e.beginID, id) {
			return e.table, nil
		}
	}

	// 第二轮：begin_id 列 + id + 0 排序后，取 id 前一个元素。
	vals := make([]string, 0, len(entries)+2)
	for _, e := range entries {
		if e.beginID != nil {
			vals = append(vals, *e.beginID)
		} else {
			vals = append(vals, "") // array_column 缺列是 null，排序时按 0 处理
		}
	}
	vals = append(vals, id, "0")
	sort.SliceStable(vals, func(i, j int) bool {
		return leadingNumber(vals[i]) < leadingNumber(vals[j])
	})
	pos := -1
	for i, v := range vals {
		if looseEqual(v, id) {
			pos = i // array_search 取第一个命中
			break
		}
	}
	searchBegin := ""
	if pos > 0 {
		searchBegin = vals[pos-1]
	}
	// $search_begin_id == 0 是 PHP 7.4 松散比较：null/空串/"0"/"abc" 都按 0 处理 → 原始表。
	if leadingNumber(searchBegin) == 0 {
		return s.articleListTable, nil
	}
	for _, e := range entries {
		if e.beginID != nil && looseEqual(*e.beginID, searchBegin) {
			return e.table, nil
		}
	}
	// PHP $subTables[false] 等价第 0 行。
	return entries[0].table, nil
}

// moduleTitle 复刻 getModuleTitle：查 site_module，subject 为真值返回 subject，否则 title；
// 查询失败 / 无记录返回空串（PHP 返回 null，拼串时为空）。
func (s *Service) moduleTitle(ctx context.Context, module string) string {
	var title, subject sql.NullString
	err := s.db.QueryRowContext(ctx,
		"SELECT `title`, `subject` FROM "+s.siteModuleTable+" WHERE `name` = ?", module).Scan(&title, &subject)
	if err != nil {
		return ""
	}
	if subject.String != "" && subject.String != "0" {
		return subject.String
	}
	return title.String
}

// looseEqual 复刻 PHP 7.4 的松散相等（array_search 默认）：两侧都是数字串按数值比，
// 否则按字符串比。begin_id / id / 0 的组合都落在这两种情况里。
func looseEqual(a, b string) bool {
	if isNumeric(a) && isNumeric(b) {
		return leadingNumber(a) == leadingNumber(b)
	}
	return a == b
}
