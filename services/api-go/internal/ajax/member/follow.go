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
	ctx := context.Background()
	var httpReq *http.Request
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
		httpReq = req.HTTP
	}

	// ajax.php:76 已把 id 归一成「整数」或「逗号拼接的整数」；取整为 0 时是空串。
	id := paramID(req, "id")
	// 数组分支（id[]=0）拼出来是 "0"，PHP 的 empty("0") 同样为真；只有 "0,0" 这类才是非空。
	if id == "" || id == "0" {
		return fail(infoParamError)
	}

	p := newParams(req)
	forType := p.scalar("for")
	if arr, ok := p.array("for"); ok && len(arr) > 0 {
		// `$for` 是数组时：empty(array) 为假、== "media" 为假，插进 SQL 时 PHP 转成 "Array"。
		forType = "Array"
	}

	// $userid = $this->param['from'] ? $this->param['from'] : $userLogin->getMemberID();
	// from 存在时完全不校验 cookie（现有鉴权缺口，照搬；见 #255 规则评论「待 Arvin 确认 1」）。
	// 已知偏差：from 传成数组（from[]=x）时 PHP 的 $userid 是数组（<= 0 为假、拼进 SQL 变 "Array"），
	// 这里按「没传 from」处理，改走 cookie 身份。
	from := p.scalar("from")
	userid := from
	// $userid 的类型随来源变化：cookie 路径是 getMemberID() 的 int，from 路径是字符串。
	// PHP 7 里 int 与字符串比较会把字符串按 (int) 前导数字转换（7 == "7,8" 为真），
	// 两个字符串比较才走「都数字串则比数值，否则比字符串」，所以这里要记住来源。
	useridIsInt := false
	if from == "" || from == "0" {
		n, err := s.identityID(ctx, httpReq)
		if err != nil {
			return noData()
		}
		if n <= 0 {
			return fail(infoLoginTimeout)
		}
		userid = strconv.FormatInt(n, 10)
		useridIsInt = true
	} else if leadingNumber(from) <= 0 {
		// `$userid <= 0` 是 PHP 松散比较：'abc' 当 0 → 登录超时；'123abc' 当 123 → 继续。
		return fail(infoLoginTimeout)
	}

	// `empty($for)` 为真（"" 或 "0"）时才判「关注自己」。
	if forType == "" || forType == "0" {
		if equalMember(useridIsInt, userid, id) {
			return fail(infoSelfFollow)
		}
	}

	if forType == followMedia {
		// 自媒体 id 与会员 id 命名空间混用：命中就用自媒体的 userid 当关注目标，
		// 查不到则**不报错**、$id 保持原值继续当会员 id 用（13887-13892）。
		if s.db == nil {
			return noData()
		}
		var selfMediaUserID sql.NullString
		err := s.db.QueryRowContext(ctx,
			"SELECT `userid` FROM "+s.selfMediaTable+" WHERE `id` = ?", id).Scan(&selfMediaUserID)
		switch {
		case err == sql.ErrNoRows:
		case err != nil:
			return noData()
		default:
			// PHP 命中就无条件 `$id = $auserid`（userid 为 NULL 时拼进 SQL 等同空串）。
			if equalMember(useridIsInt, userid, selfMediaUserID.String) {
				return fail(infoSelfMedia)
			}
			id = selfMediaUserID.String
		}
	}

	// 本地无数据库（DB=nil）时按「查不到数据」降级：参数校验与登录校验已经在上面跑完，
	// 走到这里说明确实需要读写 member_follow。
	if s.db == nil {
		return noData()
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
		sqlText = "INSERT INTO " + s.followTable + " (`fid`, `tid`, `date`, `fortype`) VALUES ('" +
			id + "', '" + userid + "', '" + nowText + "', '" + forType + "')"
		_, _ = s.db.ExecContext(ctx,
			"INSERT INTO "+s.followTable+" (`fid`, `tid`, `date`, `fortype`) VALUES (?, ?, ?, ?)",
			id, userid, now, forType)
		action, note = "insert", "添加会员关注("+id+"=>"+userid+"=>"+forType+")"
	} else {
		sqlText = "DELETE FROM " + s.followTable + " WHERE `tid` = '" + userid + "' AND `fid` = '" + id + "'"
		_, _ = s.db.ExecContext(ctx,
			"DELETE FROM "+s.followTable+" WHERE `tid` = ? AND `fid` = ?", userid, id)
		action, note = "delete", "删除会员关注("+id+"=>"+userid+")"
	}
	// memberLog 里 `$uid = (int)$uid`：from=123abc 记 123，from=0.5 取整为 0 后整条不记。
	s.memberLog(ctx, httpReq, strconv.Itoa(phpIntval(userid)), "member", "follow", 0, action, note, "", sqlText)

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

// equalMember 复刻 PHP 7.4（deploy/docker/Dockerfile.base）里 `$userid == $other` 的语义。
//   - $userid 是 int（cookie 路径）：int 与字符串比较一律把字符串转成数值，7 == "7,8" 为真；
//   - $userid 是字符串（from 路径）：两侧都是数字串按数值比（"007" == "7"），否则按字符串比。
func equalMember(useridIsInt bool, userid, other string) bool {
	if useridIsInt {
		return leadingNumber(userid) == leadingNumber(other)
	}
	if isNumeric(userid) && isNumeric(other) {
		return leadingNumber(userid) == leadingNumber(other)
	}
	return userid == other
}
