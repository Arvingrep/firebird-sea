//go:build tools

// Package tools 只用来锁定运行期依赖版本，不参与编译。
//
// MySQL 驱动要在 main 里（B3 的服务装配与 migrate 命令）以 sql.Open("mysql", dsn)
// 的形式注册，本批 B1 的包都只接收现成的 *sql.DB，所以在这里显式保留依赖，
// 让 go.mod/go.sum 现在就钉死版本，避免后续批次各拉一个不同版本。
package tools

import _ "github.com/go-sql-driver/mysql"
