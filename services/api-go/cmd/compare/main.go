// Command compare 是 PHP / Go 对比工具（测试 L2）。
//
// 读取 testdata/compare/<service>.<action>.json 的用例，同时请求 PHP 的
// /include/ajax.php 与 Go 的 /go-compat/include/ajax.php，逐字段比对 JSON。
//
// 退出码：0 零差异；1 有差异；2 用例/参数/请求错误。
package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/compare"
)

func main() {
	php := flag.String("php", "https://canary.fbird.men", "PHP 站点根")
	gov := flag.String("go", "", "Go 兼容层所在站点根，默认同 -php")
	prefix := flag.String("go-prefix", "/go-compat", "Go 兼容入口前缀")
	dir := flag.String("cases", "testdata/compare", "用例目录")
	cookie := flag.String("cookie", os.Getenv("COMPARE_COOKIE"), "requiresLogin 用例使用的 Cookie（默认读 COMPARE_COOKIE）")
	only := flag.String("only", "", "只跑某个 <service>.<action>")
	flag.Parse()
	if *gov == "" {
		*gov = *php
	}
	res, err := compare.Run(compare.Options{PHPBase: *php, GoBase: *gov, GoPrefix: *prefix, Dir: *dir, Cookie: *cookie, Only: *only})
	if err != nil {
		fmt.Fprintln(os.Stderr, "错误:", err)
		os.Exit(2)
	}
	res.Print(os.Stdout)
	if res.DiffCount() > 0 {
		os.Exit(1)
	}
}
