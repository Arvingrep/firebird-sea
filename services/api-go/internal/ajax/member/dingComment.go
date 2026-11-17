package member

import (
	"context"
	"database/sql"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// dingComment 的文案（zh-CN/siteConfig.inc.php：[33][46] 原评价不存在、[33][48] 您已经赞过、
// [20][244] 操作成功、[21][72] 操作失败）。
const (
	infoCommentNotExist = "原评价不存在"
	infoAlreadyLiked    = "您已经赞过"
	infoOperateOK       = "操作成功"
	infoOperateFailed   = "操作失败，请重试！"
)

// dingComment 迁移自 member.class.php:18022-18108（member.dingComment，评论点赞/取消）。
// 业务口径见 #257 的「业务规则」评论。
//
// 出口与 handlers.class.php:67-93 的包装对应：函数内 state=200 → 外层 101；返回字符串 →
// {"state":100,"info":"操作成功"}。这里直接构造最终响应，所以成功用 StateOK + 文案。
//
// 照搬的 PHP 细节：
//   - type 只认 "add"，其余（含缺省、数组）都是取消；
//   - 取消时当前用户不在 zan_user 里 → 直接返回「操作成功」，不调 getZan、不写任何库；
//   - 自赞检查已注释（18054-18056），可以给自己点赞；
//   - 18066 的 `$action != 'paotui-order' || $action != 'waimai-order'` 两边都是 !=，恒真，
//     else 的 module='waimai' 分支不可达 → 只实现恒走的 if 分支；
//   - 18058 的 $zan_ip 不在 SELECT 列里、赋值后也没用过，不实现；
//   - 18097 的 UPDATE 没有 ischeck 条件，取消清空后 zan=0、zan_user 是空串（空数组 join 的结果）。
//
// 连带写走本包已迁移的 getZan（#258）：PHP 在这里把 id/uid/module/temp/type 写回 $this->param
// 后调 $this->getZan()，返回值被丢弃。Go 侧用「改写参数后的子请求」调用 s.getZan，保持与
// getZan 单点实现一致（含它已声明的偏差：updateMemberNotice 通知链路未迁移）。
func (s *Service) dingComment(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	var httpReq *http.Request
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
		httpReq = req.HTTP
	}

	// 18029-18034：$cfg_disableLikeState 非 0 时直接返回配置的提示语（空/"0" 用默认文案）。
	if s.disableLikeState != 0 {
		info := s.disableLikeInfo
		if info == "" || info == "0" {
			info = infoDisableLikeDefault
		}
		return fail(info)
	}

	// 18036-18039：登录门禁先于参数校验；getMemberID() 出错也按 -1 处理。
	userid := s.memberID(ctx, httpReq)
	if userid == -1 {
		return fail(infoLoginTimeout)
	}

	// 18042：ajax.php:78 已把 id 归一成整数或「逗号拼接的整数」，函数内再 (int) → "1,2" 变 1。
	id := phpIntval(paramID(req, "id"))
	// 18043+18076：$type 是 $param['type'] 原值（数组不算 "add"）。
	isAdd := newParams(req).scalar("type") == "add"

	// 18045：empty($id) → 参数错误。
	if id == 0 {
		return fail(infoParamError)
	}

	// 本地无数据库：参数与登录都校验完了，后面确实要读写 public_comment_all。
	if s.db == nil {
		return noData()
	}

	// 18050-18052：ischeck != 1 与「没有这一行」都走 else → 原评价不存在。
	var author, zanUser, action sql.NullString
	err := s.db.QueryRowContext(ctx,
		"SELECT `userid`, `zan_user`, `type` FROM "+s.commentTable+" WHERE `id` = ? AND `ischeck` = 1", id).
		Scan(&author, &zanUser, &action)
	switch {
	case err == sql.ErrNoRows:
		return fail(infoCommentNotExist)
	case err != nil:
		// 已知偏差：PHP 的 dsqlOper 查询异常时返回一段 JSON 字符串（truthy），随后按
		// $ret[0]['userid'] 取到垃圾值继续走流程；这种损坏状态不模拟，沿用本包
		// #255/#256/#258 的口径，库异常按 102 降级。
		return noData()
	}

	// 18062：$zan_user 为 NULL 或 "0" 时是空数组。
	zanArr := []string{}
	if truthyStr(zanUser.String) {
		zanArr = strings.Split(zanUser.String, ",")
	}

	// 18066-18073：module 是 action 的第一段，temp 是整个 action。
	module := strings.Split(action.String, "-")[0]
	temp := action.String

	// 18076-18085：add 判重后追加；取消时找不到就提前返回（字符串返回 → 外层 100）。
	if isAdd {
		if memberIndex(zanArr, userid) >= 0 {
			return fail(infoAlreadyLiked)
		}
		zanArr = append(zanArr, strconv.FormatInt(userid, 10))
	} else {
		k := memberIndex(zanArr, userid)
		if k < 0 {
			return ajax.Response{State: ajax.StateOK, Info: infoOperateOK}
		}
		zanArr = append(zanArr[:k], zanArr[k+1:]...)
	}

	// 18087-18093：把评论 id / 作者 / module / temp / type=1 写回参数后调 getZan()，返回值丢弃。
	s.dingCommentGetZan(ctx, httpReq, req, id, author.String, module, temp)

	// 18097-18103：zan 是 join 后的元素个数，zan_user 是 join 结果（清空后是空串）。
	zanText := strings.Join(zanArr, ",")
	_, err = s.db.ExecContext(ctx,
		"UPDATE "+s.commentTable+" SET `zan` = ?, `zan_user` = ? WHERE `id` = ?",
		len(zanArr), zanText, id)
	if err != nil {
		return fail(infoOperateFailed)
	}
	return ajax.Response{State: ajax.StateOK, Info: infoOperateOK}
}

// dingCommentGetZan 调用已迁移的 getZan，参数按 PHP 的「$this->param 改写」重建：
// id=评论 id、uid=评论作者、module/temp=评论 type 拆出的模块与动作、type=1；
// 其余键（check / title / userid …）原样透传，因为 PHP 只覆盖这五个。
func (s *Service) dingCommentGetZan(ctx context.Context, httpReq *http.Request, req *ajax.Request,
	id int, authorUID, module, temp string) {
	overridden := map[string]bool{
		"id": true, "uid": true, "module": true, "temp": true, "type": true,
	}
	params := url.Values{}
	for k, v := range req.Params {
		if overridden[k] || overridden[strings.TrimSuffix(k, "[]")] {
			continue // 连同 id[] / type[] 之类的数组形态一起去掉：PHP 里已被标量覆盖
		}
		params[k] = v
	}
	params.Set("id", strconv.Itoa(id))
	params.Set("uid", authorUID)
	params.Set("module", module)
	params.Set("temp", temp)
	params.Set("type", "1")

	sub := &ajax.Request{Service: req.Service, Action: req.Action, Params: params, HTTP: httpReq}
	_ = s.getZan(sub) // 返回的 state/info 在 PHP 里被丢弃，只保留它的连带写
}

// memberIndex 复刻 in_array / array_search 的默认（非严格）比较：$userid 是 int、
// 数组元素是字符串，PHP 7 按数值比（"7abc" 也算 7、0 == "abc" 为真）。
// 返回第一个匹配的下标，没有返回 -1。
func memberIndex(arr []string, userid int64) int {
	want := strconv.FormatInt(userid, 10)
	for i, v := range arr {
		if equalMember(true, want, v) {
			return i
		}
	}
	return -1
}
