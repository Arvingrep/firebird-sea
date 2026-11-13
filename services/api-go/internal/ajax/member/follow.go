package member

import (
	"context"
	"database/sql"
	"net/http"
	"strconv"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// zh-CN/siteConfig.inc.php：`[33][36]` 不能关注自己、`[33][37]` 不能关注自己的自媒体账号
// （`[33][13]` 参数错误复用 comment.go 的 infoParamError，`[20][262]` 登录超时见 member.go）。
const (
	infoSelfFollow = "不能关注自己"
	infoSelfMedia  = "不能关注自己的自媒体账号"

	// followMedia 是 `$for == "media"` 里唯一被识别的取值，其余值原样写进 fortype。
	followMedia = "media"
)

// followMember 迁移自 member.class.php:13866-13915（member.followMember）。
//
// 语义：同一对 (tid=操作人, fid=目标) 反复调用是「关注 ↔ 取关」开关——
// COUNT=0 时 INSERT，否则 DELETE；判重与删除都**不看 fortype**（13896/13908 的注释：
// 新版个人中心不再判断关注来源），所以 for=media 与会员关注共用同一行。
// 接口不回传最终的关注状态，成功恒为 `state=100, info="ok"`，四种错误由外层统一改写成 101。
func (s *Service) followMember(req *ajax.Request) ajax.Response {
	if s.db == nil {
		return noData()
	}
	ctx := context.Background()
	var httpReq *http.Request
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
		httpReq = req.HTTP
	}

	// ajax.php:76 已把 id 归一成「整数」或「逗号拼接的整数」；取整为 0 时是空串。
	id := paramID(req, "id")
	if id == "" {
		return fail(infoParamError)
	}

	p := newParams(req)
	forType := p.scalar("for")

	// $userid = $this->param['from'] ? $this->param['from'] : $userLogin->getMemberID();
	// from 存在时完全不校验 cookie（现有鉴权缺口，照搬；见 #255 规则评论「待 Arvin 确认 1」）。
	from := p.scalar("from")
	userid := from
	if from == "" || from == "0" {
		n, err := s.identityID(ctx, httpReq)
		if err != nil {
			return noData()
		}
		if n <= 0 {
			return fail(infoLoginTimeout)
		}
		userid = strconv.FormatInt(n, 10)
	} else if leadingNumber(from) <= 0 {
		// `$userid <= 0` 是 PHP 松散比较：'abc' 当 0 → 登录超时；'123abc' 当 123 → 继续。
		return fail(infoLoginTimeout)
	}

	// `empty($for)` 为真（"" 或 "0"）时才判「关注自己」。
	if forType == "" || forType == "0" {
		if phpLooseEqual(userid, id) {
			return fail(infoSelfFollow)
		}
	}

	if forType == followMedia {
		// 自媒体 id 与会员 id 命名空间混用：命中就用自媒体的 userid 当关注目标，
		// 查不到则**不报错**、$id 保持原值继续当会员 id 用（13887-13892）。
		var selfMediaUserID sql.NullString
		err := s.db.QueryRowContext(ctx,
			"SELECT `userid` FROM "+s.selfMediaTable+" WHERE `id` = ?", id).Scan(&selfMediaUserID)
		switch {
		case err == sql.ErrNoRows:
		case err != nil:
			return noData()
		default:
			if selfMediaUserID.Valid && selfMediaUserID.String != "" {
				if phpLooseEqual(selfMediaUserID.String, userid) {
					return fail(infoSelfMedia)
				}
				id = selfMediaUserID.String
			}
		}
	}

	count, err := s.count(ctx,
		"SELECT COUNT(*) FROM "+s.followTable+" WHERE `tid` = ? AND `fid` = ?", userid, id)
	if err != nil {
		return noData()
	}

	// 无事务、不检查写入结果：PHP 侧即使写库失败也返回 ok。
	now := s.now().Unix()
	nowText := strconv.FormatInt(now, 10)
	var sqlText, note, action string
	if count == 0 {
		sqlText = addSlashes("INSERT INTO " + s.followTable + " (`fid`, `tid`, `date`, `fortype`) VALUES ('" +
			id + "', '" + userid + "', '" + nowText + "', '" + forType + "')")
		_, _ = s.db.ExecContext(ctx,
			"INSERT INTO "+s.followTable+" (`fid`, `tid`, `date`, `fortype`) VALUES (?, ?, ?, ?)",
			id, userid, now, forType)
		action, note = "insert", "添加会员关注("+id+"=>"+userid+"=>"+forType+")"
	} else {
		sqlText = addSlashes("DELETE FROM " + s.followTable + " WHERE `tid` = '" + userid + "' AND `fid` = '" + id + "'")
		_, _ = s.db.ExecContext(ctx,
			"DELETE FROM "+s.followTable+" WHERE `tid` = ? AND `fid` = ?", userid, id)
		action, note = "delete", "删除会员关注("+id+"=>"+userid+")"
	}
	s.memberLog(ctx, httpReq, userid, "member", "follow", 0, action, note, "", sqlText)

	// handler 返回字符串 "ok"，外层包成 state=100 / info="ok"（handlers.class.php）。
	return ajax.Response{State: ajax.StateOK, Info: "ok"}
}

// paramID 复刻 ajax.php 对 id/cityid/sid/state 的 convertArrToStrWithComma：
// 单值取 (int)，含逗号逐项取 (int) 后拼接，数组逐项取 (int) 后拼接，取整为 0 归一成空串。
func paramID(req *ajax.Request, key string) string {
	if v, ok := req.Params[key]; ok && len(v) > 0 {
		return convertArrToStrWithComma(v[len(v)-1], nil, false)
	}
	if arr, ok := req.Params[key+"[]"]; ok {
		return convertArrToStrWithComma("", arr, true)
	}
	return ""
}

// leadingNumber 取字符串开头的数字，对应 PHP 把非数字串当 0 的数值转换（'abc'→0、'123abc'→123）。
func leadingNumber(v string) float64 {
	m := numberPrefix.FindString(v)
	if m == "" {
		return 0
	}
	f, err := strconv.ParseFloat(strings.TrimSpace(m), 64)
	if err != nil {
		return 0
	}
	return f
}

// phpLooseEqual 复刻 PHP 7 的 `==`：两侧都是数字串时按数值比较（'007' == '7'），否则按字符串比较。
func phpLooseEqual(a, b string) bool {
	if isNumeric(a) && isNumeric(b) {
		return leadingNumber(a) == leadingNumber(b)
	}
	return a == b
}

// addSlashes 复刻 addslashes：memberLog 把 SQL 原文存进 member_log.sql 列时用过一次。
func addSlashes(v string) string {
	var b strings.Builder
	b.Grow(len(v))
	for _, r := range v {
		switch r {
		case '\'', '"', '\\':
			b.WriteByte('\\')
		case 0:
			b.WriteString(`\0`)
			continue
		}
		b.WriteRune(r)
	}
	return b.String()
}
