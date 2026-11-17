// 逐条翻译自 services/api/test/gateway-spike.test.js 的第 1 条（BEHAVIOR：签名算法）。
//
// 该文件另外 3 条是对 webroot/api/handlers/waimai.class.php 的 PHP 源码静态断言（不在 Go 重写范围），
// 2 条联机用例见 gateway_live_test.go（//go:build integration 隔离）。
package gateway

import (
	"regexp"
	"strings"
	"testing"
)

func TestGatewaySign(t *testing.T) {
	t.Run("网关签名可复现且随内容变化", func(t *testing.T) {
		first := Sign("s", "1", "deal", "{}")
		if !regexp.MustCompile(`^[0-9a-f]{64}$`).MatchString(first) {
			t.Fatalf("签名应为 64 位小写十六进制，实际 %q", first)
		}
		if again := Sign("s", "1", "deal", "{}"); again != first {
			t.Fatalf("相同输入必须得到相同签名，实际 %q vs %q", first, again)
		}
		if other := Sign("s", "2", "deal", "{}"); other == first {
			t.Fatal("timestamp 不同时签名必须不同")
		}
		if other := Sign("s", "1", "order_paid", "{}"); other == first {
			t.Fatal("action 不同时签名必须不同")
		}
		if strings.ContainsAny(first, "ABCDEF") {
			t.Fatalf("签名必须是小写十六进制，实际 %q", first)
		}
	})
}
