// 逐条翻译自 services/api/test/route-prefix-config.test.js 的 4 条 AC2 行为用例
// （该文件另 4 条是对 Traefik/Helm/server.js 的静态断言，不在 Go 重写范围，未翻译）。
package config

import (
	"strings"
	"testing"
)

// ttEnv 构造注入式环境查询函数（与 selfcheck_test.go 的 envFrom 同义，改名避免冲突）。
func ttEnv(values map[string]string) func(string) string {
	return func(key string) string { return values[key] }
}

// ttGood 对应 Node 测试里的 good 常量：一份合法的生产配置。
func ttGood() map[string]string {
	return map[string]string{
		"NODE_ENV":                    "production",
		"TELEGRAM_BOT_TOKEN":          "123456:real-looking-token",
		"TRON_MASTER_RECEIVE_ADDRESS": "TLsV52sRDL79HXGGm9yzwKibb6BeruhUzy",
	}
}

func ttWith(key, value string) map[string]string {
	values := ttGood()
	values[key] = value
	return values
}

func TestProductionConfig(t *testing.T) {
	t.Run("AC2 生产环境：演示令牌被拒绝", func(t *testing.T) {
		errs := ValidateProductionConfig(ttEnv(ttWith("TELEGRAM_BOT_TOKEN", DemoBotToken)))
		if !ttAnyContains(errs, "TELEGRAM_BOT_TOKEN") {
			t.Fatalf("演示令牌应被拒绝，实际 problems=%v", errs)
		}
	})

	t.Run("AC2 生产环境：占位符收款地址被拒绝", func(t *testing.T) {
		errs := ValidateProductionConfig(ttEnv(ttWith("TRON_MASTER_RECEIVE_ADDRESS", "TW4Q8tq6U1z3wWkEXAMPLETRONADDR9999")))
		if !ttAnyContains(errs, "TRON_MASTER_RECEIVE_ADDRESS") {
			t.Fatalf("占位符地址应被拒绝，实际 problems=%v", errs)
		}
	})

	t.Run("AC2 生产环境：缺少必填变量时 assertProductionConfig 抛出明确错误", func(t *testing.T) {
		err := AssertProductionConfig(ttEnv(map[string]string{"NODE_ENV": "production"}))
		if err == nil {
			t.Fatal("缺少必填变量时必须返回错误")
		}
		message := err.Error()
		tokenIndex := strings.Index(message, "缺少必填环境变量 TELEGRAM_BOT_TOKEN")
		addressIndex := strings.Index(message, "TRON_MASTER_RECEIVE_ADDRESS")
		if tokenIndex < 0 || addressIndex < 0 {
			t.Fatalf("错误文案应同时点名两个必填变量，实际 %q", message)
		}
		if tokenIndex > addressIndex {
			t.Fatalf("必填变量顺序应与 REQUIRED_IN_PRODUCTION 一致，实际 %q", message)
		}
	})

	t.Run("AC2 合法生产配置与非生产环境均放行", func(t *testing.T) {
		if problems := ValidateProductionConfig(ttEnv(ttGood())); len(problems) != 0 {
			t.Fatalf("合法生产配置不应报错，实际 %v", problems)
		}
		if problems := ValidateProductionConfig(ttEnv(map[string]string{"NODE_ENV": "development"})); len(problems) != 0 {
			t.Fatalf("非生产环境不应报错，实际 %v", problems)
		}
	})
}

func ttAnyContains(messages []string, fragment string) bool {
	for _, m := range messages {
		if strings.Contains(m, fragment) {
			return true
		}
	}
	return false
}
