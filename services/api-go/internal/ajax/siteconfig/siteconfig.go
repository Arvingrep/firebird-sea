// Package siteconfig 是 ajax.php 的 siteConfig 服务。
package siteconfig

import "github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"

// Register 注册本服务的 action。
func Register(router *ajax.Router) {
	router.Register("siteConfig", "ping", ping)
}

// ping 是兼容层的示例 action，只用于验证 /go-compat 入口，PHP 没有对应实现，不进白名单。
func ping(*ajax.Request) ajax.Response {
	return ajax.Response{State: ajax.StateOK, Info: "pong"}
}
