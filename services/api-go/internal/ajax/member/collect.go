package member

import (
	"context"
	"net/http"
	"strconv"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// collect 迁移自 member.class.php:5738-5819（member.collect）。分支与口径见 #256 的「业务规则」评论。
//
// 语义：往 member_collect 里增删一条（或多条）收藏。**没有 UPDATE**，共 4 处写：
// 多条 add 的 INSERT、多条 del 的 DELETE、单条 add 的 INSERT、单条 del 的 DELETE。
// 返回值只有三种字符串：单条 add 写入成功 "ok"、已收藏 "has"、check=1 且未收藏 "no"；
// 外层包装（handlers.class.php:88-93）把字符串包成 state=100，空返回包成 102。
func (s *Service) collect(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	var httpReq *http.Request
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
		httpReq = req.HTTP
	}

	p := newParams(req)
	// module / temp / type / check 走 ajax.php 的 addslashes 分支：值是字符串（数组则原样保留，
	// 拼进 SQL 是 "Array"）。text 把两种情况都归成可直接比较的字符串。
	module, _ := p.text("module")
	temp, _ := p.text("temp")
	typeVal, _ := p.text("type")
	checkVal, _ := p.text("check")

	// ajax.php:76 已把 id 归一成「整数」或「逗号拼接的整数」；取整为 0 时是空串。
	id := paramID(req, "id")

	// 总门禁：`!empty($module) && !empty($temp) && !empty($id) && $userid > -1`，
	// 任一不满足都走函数末尾的空返回 → 102 "No data!"（collect 没有登录错误文案）。
	if phpEmpty(module) || phpEmpty(temp) || phpEmpty(id) {
		return noData()
	}

	// $userid = $userLogin->getMemberID()：collect 没有 from 后门，只用登录态。
	userid, err := s.identityID(ctx, httpReq)
	if err != nil {
		return noData()
	}
	if userid <= -1 {
		return noData()
	}

	// 参数与登录都过了，下面确实要读写 member_collect；本地无数据库时按「查不到数据」降级。
	if s.db == nil {
		return noData()
	}
	uid := strconv.FormatInt(userid, 10)

	// 多条 ID：`strstr($id, ",")`，按逗号 explode 后逐段处理（空段也进循环）。
	if strings.Contains(id, ",") {
		for _, aid := range strings.Split(id, ",") {
			switch typeVal {
			case "add":
				s.collectAdd(ctx, httpReq, module, temp, aid, uid)
			case "del":
				s.collectDelete(ctx, httpReq, module, temp, aid, uid)
			}
		}
		// 无效 type 时循环空转，仍然恒返回 "ok"（与单条分支的 102 不同）。
		return ajax.Response{State: ajax.StateOK, Info: "ok"}
	}

	switch typeVal {
	case "add":
		n, err := s.collectCount(ctx, module, temp, id, uid)
		if err != nil {
			return noData()
		}
		if n > 0 {
			return ajax.Response{State: ajax.StateOK, Info: "has"}
		}
		// `$check == 1` 是 PHP 松散比较：'1'、'01'、'1abc' 都为真，缺省 / 'abc' 为假。
		if leadingNumber(checkVal) == 1 {
			return ajax.Response{State: ajax.StateOK, Info: "no"}
		}
		s.collectInsert(ctx, httpReq, module, temp, id, uid)
		return ajax.Response{State: ajax.StateOK, Info: "ok"}
	case "del":
		// 不判存在、不检查影响行数，删 0 行也写日志。
		s.collectDelete(ctx, httpReq, module, temp, id, uid)
		return ajax.Response{State: ajax.StateOK, Info: "ok"}
	}
	// 无效 type：单条分支走完没有 return → 102。
	return noData()
}

// collectAdd 是多条分支的单段「先查后插」，已收藏则静默跳过（不写日志、不报错）。
// 并发下没有唯一索引兜底，重复收藏照搬 PHP 行为。
func (s *Service) collectAdd(ctx context.Context, req *http.Request, module, temp, aid, uid string) {
	n, err := s.collectCount(ctx, module, temp, aid, uid)
	if err != nil || n != 0 {
		return
	}
	s.collectInsert(ctx, req, module, temp, aid, uid)
}

func (s *Service) collectCount(ctx context.Context, module, temp, aid, uid string) (int, error) {
	return s.count(ctx,
		"SELECT COUNT(*) FROM "+s.collectTable+
			" WHERE `module` = ? AND `action` = ? AND `aid` = ? AND `userid` = ?",
		module, temp, aid, uid)
}

// collectInsert 对应 INSERT + `lastid` + memberLog(insert)，note 里带自增 id。
func (s *Service) collectInsert(ctx context.Context, req *http.Request, module, temp, aid, uid string) {
	now := s.now().Unix()
	res, err := s.db.ExecContext(ctx,
		"INSERT INTO "+s.collectTable+" (`module`, `action`, `aid`, `userid`, `pubdate`) VALUES (?, ?, ?, ?, ?)",
		module, temp, aid, uid, now)
	if err != nil {
		// PHP 不检查 dsqlOper 的返回值：写失败也照样返回 ok、照样写日志（$cid 为 0）。
		_ = err
	}
	var cid int64
	if res != nil {
		cid, _ = res.LastInsertId()
	}
	note := "添加收藏信息(" + strconv.FormatInt(cid, 10) + "=>" + module + "=>" + temp + "=>" + aid + ")"
	sqlText := "INSERT INTO " + s.collectTable + " (`module`, `action`, `aid`, `userid`, `pubdate`) VALUES ('" +
		module + "', '" + temp + "', '" + aid + "', '" + uid + "', " + strconv.FormatInt(now, 10) + ")"
	s.memberLog(ctx, req, uid, "member", "collect", 0, "insert", note, "", sqlText)
}

func (s *Service) collectDelete(ctx context.Context, req *http.Request, module, temp, aid, uid string) {
	_, _ = s.db.ExecContext(ctx,
		"DELETE FROM "+s.collectTable+
			" WHERE `module` = ? AND `action` = ? AND `aid` = ? AND `userid` = ?",
		module, temp, aid, uid)
	note := "删除收藏信息(" + module + "=>" + temp + "=>" + aid + ")"
	sqlText := "DELETE FROM " + s.collectTable + " WHERE `module` = '" + module + "' AND `action` = '" + temp +
		"' AND `aid` = '" + aid + "' AND `userid` = '" + uid + "'"
	s.memberLog(ctx, req, uid, "member", "collect", 0, "delete", note, "", sqlText)
}

// phpEmpty 复刻 PHP 的 empty()："" 与 "0" 都为真。
func phpEmpty(v string) bool { return v == "" || v == "0" }

// text 返回某个键在 ajax.php 归一后的字符串形态；数组键（k[]）在 PHP 里保持数组，
// 拼进 SQL / 参与松散比较时按 "Array" 处理，这里直接归一成该字面量。
func (p params) text(key string) (string, bool) {
	if arr, ok := p.req.Params[key+"[]"]; ok && len(arr) > 0 {
		return "Array", true
	}
	return p.scalar(key), false
}
