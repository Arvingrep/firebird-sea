// 契约护栏（不是临时自检）：用例锁定与 Node 版逐字对齐的对外行为 —— 启动自检的判定口径
// 与错误文案。改实现前先看这里；合并前不要按临时文件删。
package config

import (
	"strings"
	"testing"
)

func envFrom(values map[string]string) func(string) string {
	return func(key string) string { return values[key] }
}

func TestSelfCheckNonProductionAlwaysClean(t *testing.T) {
	if problems := ValidateProductionConfig(envFrom(map[string]string{"NODE_ENV": "development"})); len(problems) != 0 {
		t.Fatalf("unexpected problems: %v", problems)
	}
	if err := AssertProductionConfig(envFrom(map[string]string{})); err != nil {
		t.Fatalf("empty env outside production must pass: %v", err)
	}
}

func TestSelfCheckProductionReportsEveryProblem(t *testing.T) {
	problems := ValidateProductionConfig(envFrom(map[string]string{"NODE_ENV": "production"}))
	if len(problems) != 2 {
		t.Fatalf("expected both required vars reported, got %v", problems)
	}
	if problems[0] != "缺少必填环境变量 TELEGRAM_BOT_TOKEN" ||
		problems[1] != "缺少必填环境变量 TRON_MASTER_RECEIVE_ADDRESS" {
		t.Fatalf("unexpected messages: %v", problems)
	}
}

func TestSelfCheckDemoTokenAndPlaceholderAddress(t *testing.T) {
	cases := []struct {
		name  string
		token string
		addr  string
		want  []string
	}{
		{
			name:  "demo prefix token",
			token: "DEMO_abc",
			addr:  "TW4Q8tq6U1z3wWkEXAMPLETRONADDR9999",
			want: []string{
				"TELEGRAM_BOT_TOKEN 是演示令牌，生产环境不允许",
				"TRON_MASTER_RECEIVE_ADDRESS 是占位符或格式非法的收款地址",
			},
		},
		{
			name:  "demo bot token constant",
			token: "prefix-DEMO_BOT_TOKEN_123456",
			addr:  "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
			want:  []string{"TELEGRAM_BOT_TOKEN 是演示令牌，生产环境不允许"},
		},
		{
			name:  "bad address format",
			token: "123456:real-looking-token",
			addr:  "0xdeadbeef",
			want:  []string{"TRON_MASTER_RECEIVE_ADDRESS 是占位符或格式非法的收款地址"},
		},
		{
			name:  "clean production config",
			token: "123456:real-looking-token",
			addr:  "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
			want:  nil,
		},
	}
	for _, c := range cases {
		got := ValidateProductionConfig(envFrom(map[string]string{
			"NODE_ENV":                    "production",
			"TELEGRAM_BOT_TOKEN":          c.token,
			"TRON_MASTER_RECEIVE_ADDRESS": c.addr,
		}))
		if len(got) != len(c.want) {
			t.Fatalf("%s: want %v, got %v", c.name, c.want, got)
		}
		for i := range c.want {
			if got[i] != c.want[i] {
				t.Fatalf("%s: want %v, got %v", c.name, c.want, got)
			}
		}
	}
}

func TestSelfCheckAssertAggregatesMessages(t *testing.T) {
	err := AssertProductionConfig(envFrom(map[string]string{"NODE_ENV": "production"}))
	if err == nil {
		t.Fatal("expected error")
	}
	message := err.Error()
	if !strings.HasPrefix(message, "生产配置自检失败，拒绝启动:\n - ") {
		t.Fatalf("unexpected prefix: %q", message)
	}
	if strings.Count(message, "\n - ") != 2 {
		t.Fatalf("expected two bullet lines: %q", message)
	}
}
