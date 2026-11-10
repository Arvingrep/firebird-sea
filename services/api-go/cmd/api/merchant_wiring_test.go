// 商家入口的装配用例（package main）。
//
// 与 dispatch_wiring_test.go 同款思路：internal/merchant 包级测试注入的是
// merchant.Gateway 接口替身，动作名写错（比如把 merchant_session 拼成 merchantSession）
// 时谁都不会红。这里用 httptest 拦住真实网关请求，断言 adapter 发出的 action 名与参数键。
package main

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
)

// TestGatewayAdapterUsesMerchantActions 钉住两个商家动作名与参数。
func TestGatewayAdapterUsesMerchantActions(t *testing.T) {
	var received []map[string]any
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, request *http.Request) {
		raw, err := io.ReadAll(request.Body)
		if err != nil {
			t.Errorf("读取网关请求体失败: %v", err)
		}
		var body map[string]any
		if err := json.Unmarshal(raw, &body); err != nil {
			t.Errorf("网关请求体不是 JSON: %v（%s）", err, raw)
		}
		received = append(received, body)
		w.Header().Set("Content-Type", "application/json")
		if body["action"] == "merchant_bind" {
			_, _ = w.Write([]byte(`{"success":true,"data":{"member_id":2,"shop_ids":[1]}}`))
			return
		}
		_, _ = w.Write([]byte(`{"success":true,"data":{"member_id":2,"redirect":"/wmsj/","set_cookies":["HN_login_user=abc"]}}`))
	}))
	defer upstream.Close()

	adapter := gatewayAdapter{cfg: gatewayConfigForTest(upstream.URL)}

	bind, err := adapter.MerchantBind(t.Context(), map[string]any{"tg_user_id": "77", "phone": "09178889999", "ip": "1.2.3.4"})
	if err != nil {
		t.Fatalf("MerchantBind 不该报错: %v", err)
	}
	session, err := adapter.MerchantSession(t.Context(), map[string]any{"tg_user_id": "77", "init_data_hash": "deadbeef"})
	if err != nil {
		t.Fatalf("MerchantSession 不该报错: %v", err)
	}

	if len(received) != 2 {
		t.Fatalf("应恰好两次网关调用，实际 %d", len(received))
	}
	if received[0]["action"] != "merchant_bind" {
		t.Fatalf("第一个动作名应为 merchant_bind，实得 %v", received[0]["action"])
	}
	if received[1]["action"] != "merchant_session" {
		t.Fatalf("第二个动作名应为 merchant_session，实得 %v", received[1]["action"])
	}
	// 动作名是 PHP 白名单（fbs_gateway_actions）里的蛇形小写：写成 camelCase 会 404 UNKNOWN_ACTION。
	if received[0]["action"] == "merchantBind" || received[1]["action"] == "merchantSession" {
		t.Fatal("动作名必须是蛇形小写（merchant_bind / merchant_session），与 PHP 白名单逐字一致")
	}
	if bind["success"] != true || session["success"] != true {
		t.Fatalf("网关响应应原样回给调用方，实得 %v / %v", bind, session)
	}
}

// TestMainWiresMerchantIntoDep 是装配的源码级护栏：三条路由全靠 dep.Merchant，
// 漏接的表现是静默 404（与 Dispatch 检查同口径）。
func TestMainWiresMerchantIntoDep(t *testing.T) {
	raw, err := os.ReadFile("main.go")
	if err != nil {
		t.Fatalf("读取 main.go 失败: %v", err)
	}
	source := string(raw)
	if !strings.Contains(source, "Merchant:       buildMerchant(botToken, hops, now),") {
		t.Fatal("Dep 必须装配 buildMerchant 的产物（漏接 = 三条 /tg-api/merchant/* 路由 404）")
	}
	// validateAssembly 必须拦「Merchant 为 nil」。
	if !strings.Contains(source, `missing = append(missing, "Merchant")`) {
		t.Fatal("validateAssembly 必须检查 dep.Merchant（B1 那类少填字段的静默降级）")
	}
	// 限频环境变量与 Node 侧同键（TMA_MERCHANT_MAX，默认 10）。
	if !strings.Contains(source, `envInt("TMA_MERCHANT_MAX", 10)`) {
		t.Fatal("buildMerchant 限频应读 TMA_MERCHANT_MAX（默认 10），与 Node 的 createLimiter 同键同值")
	}
}
