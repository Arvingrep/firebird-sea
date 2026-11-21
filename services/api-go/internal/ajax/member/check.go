package member

import (
	"net/url"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// DetailHandler 导出 member.detail 的 handler，供其它 service 的跨 action 依赖注入
// （article.detail 的 getMemberInfo($uid, 1)，见 #260）。
func (s *Service) DetailHandler() ajax.Handler { return s.detail }

// CollectCheck 复刻 checkIsCollect()（common.func.php:6012）：把参数原样交给
// member.collect（type=add、check=1），返回 info 字符串（"has" / "no" / "ok"）。
// state 不是 100 时返回空串——PHP 那边返回 null，和 "has" 比较同样为假。
//
// 走真实 action 而不是内联 SQL：collect 的登录门禁（未登录 102）与分表口径都只在一处维护。
func (s *Service) CollectCheck(req *ajax.Request, module, temp, action, id string) string {
	sub := &ajax.Request{
		Service: "member", Action: "collect", HTTP: req.HTTP,
		Params: url.Values{
			"module": {module}, "temp": {temp}, "type": {action}, "id": {id}, "check": {"1"},
		},
	}
	return infoString(s.collect(sub))
}

// ZanCheck 复刻 checkIsZan()（common.func.php:6024）：调用 member.getZan（check=1）。
// check 模式匿名也会返回 100 + "no"，所以匿名请求会多一次查询——与 PHP 一致。
func (s *Service) ZanCheck(req *ajax.Request, module, temp, id string) string {
	sub := &ajax.Request{
		Service: "member", Action: "getZan", HTTP: req.HTTP,
		Params: url.Values{
			"module": {module}, "temp": {temp}, "id": {id}, "check": {"1"},
		},
	}
	return infoString(s.getZan(sub))
}

// infoString 取 state=100 时的 info 字符串；其余情况（102/101/异常）返回空串。
func infoString(resp ajax.Response) string {
	if resp.State != ajax.StateOK {
		return ""
	}
	s, _ := resp.Info.(string)
	return s
}
