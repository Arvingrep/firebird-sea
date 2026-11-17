package dispatch

import (
	"os"
	"testing"
)

// readSource 读本包的源文件，供「源码约束」类用例做结构性断言
// （对应 Node 用例里 readFileSync('../src/dispatchRoute.js') 的写法）。
func readSource(t *testing.T, name string) string {
	t.Helper()
	raw, err := os.ReadFile(name)
	if err != nil {
		t.Fatalf("读取 %s 失败: %v", name, err)
	}
	return string(raw)
}
