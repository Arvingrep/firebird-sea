// 派单通知的装配用例（package main）。
//
// 对应 Node 的两条「源码约束」用例里跟装配有关的部分，但**做成行为断言 + 一条源码断言**：
//   - 网关动作名必须是 rider_notify_url（server.js 2h 的装配），动作名写错 = 按钮永远拿不到 URL，
//     而包级测试注入的是假网关，谁都不会红。这里用 httptest 拦住真实网关请求，断言 action 字段。
//   - N3 优雅退出必须在 main 里接线（Node 那条用例读 server.js 正则断言 SIGTERM → drain →
//     close）。Go 侧同样读 main.go：SIGTERM 处理与 drain 的顺序没有别的地方能机器校验
//     （run() 里是阻塞等待信号，单测起不了真实信号路径）。
package main

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/gateway"
)

// TestGatewayAdapterUsesRiderNotifyURLAction 钉住网关动作名与参数。
func TestGatewayAdapterUsesRiderNotifyURLAction(t *testing.T) {
	var received map[string]any
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, request *http.Request) {
		raw, err := io.ReadAll(request.Body)
		if err != nil {
			t.Errorf("读取网关请求体失败: %v", err)
		}
		if err := json.Unmarshal(raw, &received); err != nil {
			t.Errorf("网关请求体不是 JSON: %v（%s）", err, raw)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"success":true,"data":{"url":"https://canary.fbird.men/ql.html?token=X"}}`))
	}))
	defer upstream.Close()

	adapter := gatewayAdapter{cfg: gatewayConfigForTest(upstream.URL)}
	result, err := adapter.RiderNotifyURL(t.Context(), map[string]any{"order_id": 1001, "courier_id": 9})
	if err != nil {
		t.Fatalf("RiderNotifyURL 不该报错: %v", err)
	}
	if received["action"] != "rider_notify_url" {
		t.Fatalf("网关动作名应为 rider_notify_url（server.js 2h），实得 %v", received["action"])
	}
	params, ok := received["params"].(map[string]any)
	if !ok {
		t.Fatalf("网关请求应带 params 对象，实得 %v", received["params"])
	}
	if params["order_id"] != float64(1001) || params["courier_id"] != float64(9) {
		t.Fatalf("params 应为 {order_id:1001, courier_id:9}，实得 %v", params)
	}
	if result["success"] != true {
		t.Fatalf("网关响应应原样回给调用方，实得 %v", result)
	}
}

// TestMainWiresDispatchDrainOnShutdown 是 N3 的机器校验：
// 在飞投递不在 httpServer.Shutdown 的等待范围内，不接线就等于发版必然丢通知 + 占位残留 1 天。
func TestMainWiresDispatchDrainOnShutdown(t *testing.T) {
	raw, err := os.ReadFile("main.go")
	if err != nil {
		t.Fatalf("读取 main.go 失败: %v", err)
	}
	source := string(raw)

	if !strings.Contains(source, "dispatchDrain = 8 * time.Second") {
		t.Fatal("drain 必须有 8s 上限（给 terminationGracePeriod 留余量，Node 同为 8000ms）")
	}
	drainIndex := strings.Index(source, "dep.Dispatch.Drain(")
	if drainIndex < 0 {
		t.Fatal("退出流程必须调用 dep.Dispatch.Drain 排空在飞投递（N3）")
	}
	shutdownIndex := strings.Index(source, "httpServer.Shutdown(ctx)")
	if shutdownIndex < 0 || drainIndex > shutdownIndex {
		t.Fatal("必须先 drain 在飞投递、再关 HTTP 监听（顺序反了等于没排空）")
	}
	// 派单路由必须真的装配进 Dep（漏接的表现是 PHP 挂点收到 404）。
	if !strings.Contains(source, "Dispatch:       buildDispatch(") {
		t.Fatal("Dep 必须装配 buildDispatch 的产物")
	}
}

// gatewayConfigForTest 返回指向测试服务器的网关配置（签名用固定密钥，只验请求形状）。
func gatewayConfigForTest(baseURL string) gateway.Config {
	return gateway.Config{BaseURL: baseURL, Secret: "gw-secret", Now: func() time.Time { return time.Unix(1700000000, 0) }}
}
