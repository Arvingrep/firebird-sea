// SafeRedirect 与响应形状辅助函数的测试。
//
// safeRedirect 是开放重定向防线：网关返回值也走这里——「来自内部」不等于「可信」，
// 开放重定向在登录链路上是直接可利用的。每个拒绝分支都对应 Node safeRedirect 的一行。
package merchant

import "testing"

func TestSafeRedirect(t *testing.T) {
	cases := []struct {
		name  string
		input string
		want  string
	}{
		{"站内根", "/wmsj/", "/wmsj/"},
		{"站内深路径", "/wmsj/order/waimaiOrder.php", "/wmsj/order/waimaiOrder.php"},
		{"首尾空白被裁", "  /wmsj/  ", "/wmsj/"},
		{"缺失回兜底", "", "/wmsj/"},
		{"纯空白回兜底", "   ", "/wmsj/"},
		{"相对路径拒绝", "wmsj/", "/wmsj/"},
		{"协议相对路径拒绝", "//evil.example.com/x", "/wmsj/"},
		{"绝对 URL 拒绝", "https://evil.example.com/", "/wmsj/"},
		{"反斜杠开头拒绝", "\\/evil", "/wmsj/"},
		{"内嵌反斜杠拒绝", "/a\\b", "/wmsj/"},
		{"控制字符拒绝", "/a\tb", "/wmsj/"},
		{"换行拒绝", "/a\nb", "/wmsj/"},
		{"超长拒绝", "/" + string(make([]byte, 0)) + repeat("a", 201), "/wmsj/"},
		{"恰好 200 合法", "/" + repeat("a", 199), "/" + repeat("a", 199)},
	}
	for _, item := range cases {
		t.Run(item.name, func(t *testing.T) {
			if got := SafeRedirect(item.input); got != item.want {
				t.Fatalf("SafeRedirect(%q) = %q，want %q", item.input, got, item.want)
			}
		})
	}
}

// TestMerchantHomePinned 钉住兜底值：redirect 兜底就是商家后台根。
func TestMerchantHomePinned(t *testing.T) {
	if MerchantHome != "/wmsj/" {
		t.Fatalf("MerchantHome 应为 /wmsj/，实际 %q", MerchantHome)
	}
}

// repeat 补一个不依赖 strings 的小助手（测试内使用）。
func repeat(s string, n int) string {
	out := make([]byte, 0, len(s)*n)
	for i := 0; i < n; i++ {
		out = append(out, s...)
	}
	return string(out)
}
