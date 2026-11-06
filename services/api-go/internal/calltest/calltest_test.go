// 逐条翻译自 services/api/test/call-test.test.js（4 条，全部 BEHAVIOR）。
//
// 用 httptest 起本地服务模拟上游（与 Node 的 node:http 等价）；
// 重试间隔注入成 10ms 并记录而不真睡，绝不触发默认的 3s 等待。
package calltest

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

// ttServe 按顺序返回状态码（用完后重复最后一个），并统计请求次数。
func ttServe(t *testing.T, statuses ...int) (*httptest.Server, func() int) {
	t.Helper()
	var calls int64
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		n := int(atomic.AddInt64(&calls, 1)) - 1
		index := n
		if index >= len(statuses) {
			index = len(statuses) - 1
		}
		w.WriteHeader(statuses[index])
		_, _ = w.Write([]byte("{}"))
	}))
	t.Cleanup(server.Close)
	return server, func() int { return int(atomic.LoadInt64(&calls)) }
}

// ttLogs 收集终态失败日志（对应 Node 的 logger.error 数组）。
type ttLogs struct {
	mu       sync.Mutex
	messages []string
}

func (l *ttLogs) log(message string) {
	l.mu.Lock()
	defer l.mu.Unlock()
	l.messages = append(l.messages, message)
}

func (l *ttLogs) all() []string {
	l.mu.Lock()
	defer l.mu.Unlock()
	return append([]string(nil), l.messages...)
}

// ttOptions 对应 Node 的 { delayMs: 10, logger }：间隔注入 + 记录 sleep 而不真睡。
func ttOptions(logs *ttLogs, sleeps *[]time.Duration) Options {
	var mu sync.Mutex
	return Options{
		Delay: 10 * time.Millisecond,
		Sleep: func(d time.Duration) {
			mu.Lock()
			defer mu.Unlock()
			*sleeps = append(*sleeps, d)
		},
		LogError: logs.log,
	}
}

func TestCallTest(t *testing.T) {
	ctx := context.Background()

	t.Run("首次失败、重试成功即通过", func(t *testing.T) {
		server, _ := ttServe(t, 500, 200)
		var sleeps []time.Duration
		logs := &ttLogs{}
		result := Run(ctx, server.URL, map[string]any{}, ttOptions(logs, &sleeps))
		if !result.Passed || result.Attempts != 2 {
			t.Fatalf("应 {passed:true, attempts:2}，实际 %+v", result)
		}
		if len(sleeps) != 1 || sleeps[0] != 10*time.Millisecond {
			t.Fatalf("重试间隔应注入 10ms 且只等 1 次，实际 %v", sleeps)
		}
		if len(logs.all()) != 0 {
			t.Fatalf("重试成功不应写终态日志，实际 %v", logs.all())
		}
	})

	t.Run("首次即成功：仅 1 次请求", func(t *testing.T) {
		server, calls := ttServe(t, 200)
		var sleeps []time.Duration
		logs := &ttLogs{}
		result := Run(ctx, server.URL, map[string]any{}, ttOptions(logs, &sleeps))
		if !result.Passed || result.Attempts != 1 {
			t.Fatalf("应 {passed:true, attempts:1}，实际 %+v", result)
		}
		if got := calls(); got != 1 {
			t.Fatalf("上游应只被请求 1 次，实际 %d", got)
		}
	})

	t.Run("连接拒绝：重试 2 次后记录终态日志", func(t *testing.T) {
		server, _ := ttServe(t, 200)
		url := server.URL
		server.Close() // 关闭后连接被拒绝（等价于 Node 的 server.close）

		var sleeps []time.Duration
		logs := &ttLogs{}
		result := Run(ctx, url, map[string]any{}, ttOptions(logs, &sleeps))
		if result.Passed {
			t.Fatalf("连接拒绝时不应通过，实际 %+v", result)
		}
		if result.Attempts != 3 {
			t.Fatalf("总尝试次数应为 3，实际 %d", result.Attempts)
		}
		messages := logs.all()
		if len(messages) == 0 || !strings.Contains(messages[0], "FINAL FAILURE after 3 attempts") {
			t.Fatalf("首条终态日志应含 FINAL FAILURE after 3 attempts，实际 %v", messages)
		}
	})

	t.Run("三次均失败：共 3 次请求并记录终态异常日志", func(t *testing.T) {
		server, calls := ttServe(t, 500)
		var sleeps []time.Duration
		logs := &ttLogs{}
		result := Run(ctx, server.URL, map[string]any{}, ttOptions(logs, &sleeps))
		if result.Passed {
			t.Fatalf("三次均失败时不应通过，实际 %+v", result)
		}
		if got := calls(); got != 3 {
			t.Fatalf("上游应被请求 3 次，实际 %d", got)
		}
		if got := len(logs.all()); got != 1 {
			t.Fatalf("终态异常日志应只写 1 条，实际 %d（%v）", got, logs.all())
		}
	})
}
