// Package config 只做一件事：生产环境启动前的配置自检（AD-13）。
//
// 为什么要在启动时拒绝而不是运行时降级：演示令牌与占位收款地址一旦随生产镜像上线，
// 等于把鉴权密钥和收款目的地公开；宁可启动失败，也不要带着已知占位符提供服务。
package config

import (
	"errors"
	"os"
	"regexp"
	"strings"
)

// DemoBotToken 是仓库示例与本地联调用的固定令牌，生产环境必须拒绝。
const DemoBotToken = "DEMO_BOT_TOKEN_123456"

// requiredInProduction 与 Node 版 REQUIRED_IN_PRODUCTION 逐字对应。
var requiredInProduction = []string{"TELEGRAM_BOT_TOKEN", "TRON_MASTER_RECEIVE_ADDRESS"}

var (
	// tronAddress 是 TRON base58check 地址形态：T + 33 个 base58 字符。
	tronAddressPattern = regexp.MustCompile(`^T[1-9A-HJ-NP-Za-km-z]{33}$`)
	// placeholderMarker 兜住「格式像地址但含 EXAMPLE」的示例值。
	placeholderMarker = regexp.MustCompile(`(?i)EXAMPLE`)
	// demoTokenPrefix / demoTokenMarker 对应 Node 的正则 /^DEMO_|DEMO_BOT_TOKEN/：
	// 以 DEMO_ 开头，或整体包含 DEMO_BOT_TOKEN，都视为演示令牌。
	demoTokenPrefix = "DEMO_"
	demoTokenMarker = "DEMO_BOT_TOKEN"
)

// IsPlaceholderAddress 判断收款地址是不是占位符或格式非法。
func IsPlaceholderAddress(addr string) bool {
	return !tronAddressPattern.MatchString(addr) || placeholderMarker.MatchString(addr)
}

// ValidateProductionConfig 返回生产自检发现的问题；非 production 环境永远返回空。
// env 为 nil 时读进程环境，便于 main 直接调用；测试可注入 map 查询函数。
func ValidateProductionConfig(env func(string) string) []string {
	if env == nil {
		env = os.Getenv
	}
	if env("NODE_ENV") != "production" {
		return nil
	}

	var problems []string
	for _, key := range requiredInProduction {
		if env(key) == "" {
			problems = append(problems, "缺少必填环境变量 "+key)
		}
	}
	if token := env("TELEGRAM_BOT_TOKEN"); token != "" {
		if strings.HasPrefix(token, demoTokenPrefix) || strings.Contains(token, demoTokenMarker) {
			problems = append(problems, "TELEGRAM_BOT_TOKEN 是演示令牌，生产环境不允许")
		}
	}
	if addr := env("TRON_MASTER_RECEIVE_ADDRESS"); addr != "" && IsPlaceholderAddress(addr) {
		problems = append(problems, "TRON_MASTER_RECEIVE_ADDRESS 是占位符或格式非法的收款地址")
	}
	return problems
}

// AssertProductionConfig 在自检失败时返回聚合错误，文案与 Node 版一致（含换行与 " - " 前缀）。
func AssertProductionConfig(env func(string) string) error {
	problems := ValidateProductionConfig(env)
	if len(problems) == 0 {
		return nil
	}
	var b strings.Builder
	b.WriteString("生产配置自检失败，拒绝启动:")
	for _, p := range problems {
		b.WriteString("\n - ")
		b.WriteString(p)
	}
	return errors.New(b.String())
}
