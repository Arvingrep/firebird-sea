// Command record 读取导出的 nginx 访问日志，生成 testdata/compare/*.recorded.json（测试 L3）。
//
// 日志由有集群权限的人用 kubectl logs 导出；本命令不连集群。
// 用法：go run ./cmd/record -log nginx.log [-service article] [-max 20] [-out testdata/compare]
package main

import (
	"flag"
	"fmt"
	"os"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/recorder"
)

func main() {
	logPath := flag.String("log", "", "导出的 nginx 访问日志文件（必填）")
	out := flag.String("out", "testdata/compare", "输出目录")
	max := flag.Int("max", 20, "每个 service.action 最多保留的用例数")
	service := flag.String("service", "", "只生成某个 service（如 article），留空为全部")
	flag.Parse()
	if *logPath == "" {
		fmt.Fprintln(os.Stderr, "错误: 必须指定 -log")
		os.Exit(2)
	}
	f, err := os.Open(*logPath)
	if err != nil {
		fmt.Fprintln(os.Stderr, "错误:", err)
		os.Exit(2)
	}
	defer f.Close()
	files, err := recorder.Record(f, *max)
	if err != nil {
		fmt.Fprintln(os.Stderr, "错误:", err)
		os.Exit(2)
	}
	for k := range files {
		if *service != "" && !strings.HasPrefix(k, *service+".") {
			delete(files, k)
		}
	}
	if err := recorder.Write(*out, files); err != nil {
		fmt.Fprintln(os.Stderr, "错误:", err)
		os.Exit(2)
	}
	for k, v := range files {
		fmt.Printf("%s.recorded.json  %d 条\n", k, len(v.Cases))
	}
}
