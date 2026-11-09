// Package example 演示 internal/modules/<service> 的最小结构与路由注册方式。
// #233（ajax.php 兼容入口）落地后，真实模块会按 service 名替换这里的示例；
// 在那之前它给骨架一条可实测的端到端链路（路由 → 中间件 → 响应）。
package example

import (
	"encoding/json"
	"net/http"
)

// Handler 是一个模块的处理器集合；每个模块一个包，路由在 Register 里集中声明。
type Handler struct{}

// Register 把本模块的路由挂到 mux 上。Go 1.22 路由模式串：方法 + 路径。
func (h *Handler) Register(mux *http.ServeMux) {
	mux.HandleFunc("GET /demo/ping", h.ping)
}

// ping 返回火鸟风格的最小 JSON（{"state":100} 表示成功，与 PHP 口径一致），
// 仅用于验证骨架链路，不是业务接口。
func (h *Handler) ping(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	_ = json.NewEncoder(w).Encode(map[string]any{"state": 100, "info": "pong"})
}
