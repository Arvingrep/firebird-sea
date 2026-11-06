//go:build integration

// 联机用例：逐条翻译自 services/api/test/gateway-spike.test.js 的第 5、6 条。
//
// 默认构建不参与编译（Node 侧等价物是「未设置环境变量则 skip」）；
// 用 `go test -tags integration ./internal/gateway` 触发，缺环境变量时仍会 skip。
package gateway

import (
	"context"
	"os"
	"strconv"
	"testing"
)

func ttLiveConfig(t *testing.T) Config {
	t.Helper()
	baseURL, secret := os.Getenv("FBS_GATEWAY_URL"), os.Getenv("FBS_GATEWAY_SECRET")
	if baseURL == "" || secret == "" {
		t.Skip("未设置 FBS_GATEWAY_URL/FBS_GATEWAY_SECRET")
	}
	return Config{BaseURL: baseURL, Secret: secret}
}

func ttEnvInt(t *testing.T, key string) int64 {
	t.Helper()
	value, err := strconv.ParseInt(os.Getenv(key), 10, 64)
	if err != nil {
		t.Fatalf("环境变量 %s 必须是整数: %v", key, err)
	}
	return value
}

func TestGatewayLive(t *testing.T) {
	ctx := context.Background()

	t.Run("AC1 联机：deal → order_paid 后订单 state=2", func(t *testing.T) {
		cfg := ttLiveConfig(t)
		deal, err := Deal(ctx, cfg, map[string]any{
			"uid": ttEnvInt(t, "FBS_TEST_UID"),
			"sid": ttEnvInt(t, "FBS_TEST_SID"),
		})
		if err != nil {
			t.Fatalf("deal 失败: %v", err)
		}
		ordernum, ok := Str(deal, "ordernum")
		if !ok || ordernum == "" {
			t.Fatalf("deal 响应缺 ordernum: %v", deal)
		}
		paid, err := OrderPaid(ctx, cfg, map[string]any{"ordernum": ordernum, "paytype": "usdt"})
		if err != nil {
			t.Fatalf("order_paid 失败: %v", err)
		}
		order, ok := Map(paid, "order")
		if !ok {
			t.Fatalf("order_paid 响应缺 order: %v", paid)
		}
		state, ok := Int(order, "state")
		if !ok || state != 2 {
			t.Fatalf("订单 state 应为 2，实际 %v", order["state"])
		}
	})

	t.Run("AC2 联机：已付订单取消后记录 state 与 refrundstate", func(t *testing.T) {
		cfg := ttLiveConfig(t)
		deal, err := Deal(ctx, cfg, map[string]any{
			"uid": ttEnvInt(t, "FBS_TEST_UID"),
			"sid": ttEnvInt(t, "FBS_TEST_SID"),
		})
		if err != nil {
			t.Fatalf("deal 失败: %v", err)
		}
		ordernum, ok := Str(deal, "ordernum")
		if !ok || ordernum == "" {
			t.Fatalf("deal 响应缺 ordernum: %v", deal)
		}
		if _, err := OrderPaid(ctx, cfg, map[string]any{"ordernum": ordernum, "paytype": "usdt"}); err != nil {
			t.Fatalf("order_paid 失败: %v", err)
		}
		cancelled, err := CancelOrder(ctx, cfg, map[string]any{
			"ordernum": ordernum,
			"uid":      ttEnvInt(t, "FBS_TEST_UID"),
		})
		if err != nil {
			t.Fatalf("cancelOrder 失败: %v", err)
		}
		order, ok := Map(cancelled, "order")
		if !ok {
			t.Fatalf("cancelOrder 响应缺 order: %v", cancelled)
		}
		state, _ := Int(order, "state")
		if state != 6 {
			t.Fatalf("取消后 state 应为 6，实际 %v", order["state"])
		}
		refundState, _ := Int(order, "refrundstate")
		if refundState != 1 {
			t.Fatalf("已付订单取消后 refrundstate 应为 1，实际 %v", order["refrundstate"])
		}
	})
}
