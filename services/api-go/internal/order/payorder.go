// Package order 提供收银台所需的只读订单查询（Story 2.1）。
//
// 金额与买家归属必须由服务端从火鸟 pay_log 读取，绝不接受客户端提交：
// 否则用户能把 100 元的订单改成 1 元，或替别人的订单付款换取归属。
package order

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"regexp"
	"strconv"
)

// 错误码与 Node 版逐字一致，调用方（路由/前端）按码分支。
const (
	CodeBadRequest   = "BAD_REQUEST"
	CodeNotFound     = "ORDER_NOT_FOUND"
	CodeInvalid      = "ORDER_INVALID"
	CodeNotPayable   = "ORDER_NOT_PAYABLE"
	CodeForbidden    = "ORDER_FORBIDDEN"
	CodeUnauthorized = "UNAUTHORIZED"
)

// OrderError 携带业务错误码与中文文案。
type OrderError struct {
	Code    string
	Message string
}

func (e *OrderError) Error() string { return e.Message }

var (
	// safeOrder 白名单：ordernum 会作为绑定参数，这里再挡一次格式，
	// 避免把控制字符/引号带进日志与后续 SQL 上下游。
	safeOrder = regexp.MustCompile(`^[A-Za-z0-9_-]{1,64}$`)
	// safePrefix 白名单：表前缀会被拼进 SQL 标识符（标识符无法参数化），
	// 所以只能用「严格字符集 + 长度上限」代替，任何引号、反引号、分号一律拒绝。
	safePrefix = regexp.MustCompile(`^[A-Za-z0-9_]{1,32}$`)
	// safeTgUser 与网关的 tg_user_id 校验保持一致：1~32 位纯数字。
	safeTgUser = regexp.MustCompile(`^\d{1,32}$`)
	// decimal2 只认 decimal(8,2) 的文本形态，用整数运算换算 centavos，全程不碰浮点。
	decimal2 = regexp.MustCompile(`^(\d+)\.(\d{2})$`)
)

// CentavosFromDecimal 把 `125.00` 换成 12500。拒绝 `125`/`125.0`/负数/非数字：
// 金额格式异常说明上游数据或调用方有问题，静默取整只会让对账更难查。
func CentavosFromDecimal(text string) (int64, error) {
	m := decimal2.FindStringSubmatch(text)
	if m == nil {
		return 0, &OrderError{Code: CodeInvalid, Message: "订单金额格式异常"}
	}
	whole, err := strconv.ParseInt(m[1], 10, 64)
	if err != nil || whole > (1<<62)/100 {
		return 0, &OrderError{Code: CodeInvalid, Message: "订单金额格式异常"}
	}
	cents, err := strconv.ParseInt(m[2], 10, 64)
	if err != nil {
		return 0, &OrderError{Code: CodeInvalid, Message: "订单金额格式异常"}
	}
	return whole*100 + cents, nil
}

// ReadPayOrder 读取待支付订单的权威金额（centavos）与火鸟会员 id。
//
// 表名前缀来自部署配置，无法用占位符绑定，因此先过 safePrefix 白名单再拼接；
// 这是本包唯一拼接 SQL 的位置，也是全仓允许的例外。
func ReadPayOrder(ctx context.Context, db *sql.DB, ordernum, prefix string) (int64, int64, error) {
	if !safeOrder.MatchString(ordernum) {
		return 0, 0, &OrderError{Code: CodeBadRequest, Message: "ordernum 格式无效"}
	}
	if !safePrefix.MatchString(prefix) {
		return 0, 0, &OrderError{Code: CodeInvalid, Message: "表前缀配置无效"}
	}

	query := fmt.Sprintf(
		"SELECT amount, uid, state FROM `%spay_log` WHERE ordernum = ? ORDER BY id DESC LIMIT 1", prefix)
	var (
		amount string
		uid    int64
		state  string
	)
	err := db.QueryRowContext(ctx, query, ordernum).Scan(&amount, &uid, &state)
	if errors.Is(err, sql.ErrNoRows) {
		return 0, 0, &OrderError{Code: CodeNotFound, Message: "订单不存在或尚未生成支付单"}
	}
	if err != nil {
		return 0, 0, err
	}

	// pay_log.state 是 tinyint，驱动会转成 "0"；这里按字符串比较以对齐 Node 的 CLI 文本语义。
	if state != "0" {
		return 0, 0, &OrderError{Code: CodeNotPayable, Message: "订单已支付或状态不允许结账"}
	}
	if uid <= 0 {
		return 0, 0, &OrderError{Code: CodeInvalid, Message: "订单归属异常"}
	}
	centavos, err := CentavosFromDecimal(amount)
	if err != nil {
		return 0, 0, err
	}
	if centavos <= 0 {
		return 0, 0, &OrderError{Code: CodeInvalid, Message: "订单金额必须为正"}
	}
	return centavos, uid, nil
}

// AssertOwnership 校验请求的 Telegram 用户确实映射到订单的 pay_log.uid。
// 这是收银台唯一的横向越权防线：少了它，任何已登录用户都能拿别人的订单号下单。
func AssertOwnership(ctx context.Context, db *sql.DB, tgUserID string, memberID int64) error {
	if !safeTgUser.MatchString(tgUserID) {
		return &OrderError{Code: CodeUnauthorized, Message: "用户标识无效"}
	}
	var bound int64
	err := db.QueryRowContext(ctx,
		"SELECT member_id FROM fbs_member_map WHERE tg_user_id = ? LIMIT 1", tgUserID).Scan(&bound)
	if errors.Is(err, sql.ErrNoRows) {
		return &OrderError{Code: CodeForbidden, Message: "无权为该订单创建收银台"}
	}
	if err != nil {
		return err
	}
	if bound != memberID {
		return &OrderError{Code: CodeForbidden, Message: "无权为该订单创建收银台"}
	}
	return nil
}
