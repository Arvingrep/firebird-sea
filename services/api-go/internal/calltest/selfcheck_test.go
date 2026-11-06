// 契约护栏（不是临时自检）：用例锁定与 Node 版逐字对齐的对外行为 —— 状态码、错误码、
// JSON 字段名与字段顺序、空数组形态。改实现前先看这里；合并前不要按临时文件删。
package calltest

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync/atomic"
	"testing"
	"time"
)

// 用一个可切换状态的本地服务模拟上游；重试间隔注入成 1ms，避免测试等 6 秒。
func serveStatuses(t *testing.T, statuses ...int) (*httptest.Server, *int64) {
	t.Helper()
	var calls int64
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		n := atomic.AddInt64(&calls, 1)
		index := int(n) - 1
		if index >= len(statuses) {
			index = len(statuses) - 1
		}
		w.WriteHeader(statuses[index])
		_, _ = w.Write([]byte(`{}`))
	}))
	t.Cleanup(server.Close)
	return server, &calls
}

func TestSelfCheckRetryThenSuccess(t *testing.T) {
	server, calls := serveStatuses(t, http.StatusInternalServerError, http.StatusOK)
	result := Run(context.Background(), server.URL, map[string]any{}, Options{Delay: time.Millisecond})
	if !result.Passed || result.Attempts != 2 {
		t.Fatalf("want passed at attempt 2, got %+v", result)
	}
	if *calls != 2 {
		t.Fatalf("upstream calls: %d", *calls)
	}
}

func TestSelfCheckFirstAttemptSuccess(t *testing.T) {
	server, calls := serveStatuses(t, http.StatusOK)
	result := Run(context.Background(), server.URL, map[string]any{}, Options{Delay: time.Millisecond})
	if !result.Passed || result.Attempts != 1 || result.Error != "" {
		t.Fatalf("want single successful attempt, got %+v", result)
	}
	if *calls != 1 {
		t.Fatalf("upstream calls: %d", *calls)
	}
}

func TestSelfCheckAllAttemptsFail(t *testing.T) {
	server, calls := serveStatuses(t, http.StatusInternalServerError)
	var logs []string
	result := Run(context.Background(), server.URL, map[string]any{}, Options{
		Delay:    time.Millisecond,
		LogError: func(message string) { logs = append(logs, message) },
	})
	if result.Passed || result.Attempts != 3 {
		t.Fatalf("want 3 failed attempts, got %+v", result)
	}
	if *calls != 3 {
		t.Fatalf("upstream calls: %d", *calls)
	}
	if len(logs) != 1 || !strings.Contains(logs[0], "[call-test] FINAL FAILURE after 3 attempts") {
		t.Fatalf("unexpected logs: %v", logs)
	}
	if result.Error != "Call test upstream [500]" {
		t.Fatalf("upstream error message: %q", result.Error)
	}
}

func TestSelfCheckConnectionRefused(t *testing.T) {
	server, _ := serveStatuses(t, http.StatusOK)
	url := server.URL
	server.Close()
	var logs []string
	result := Run(context.Background(), url, map[string]any{}, Options{
		Delay:    time.Millisecond,
		LogError: func(message string) { logs = append(logs, message) },
	})
	if result.Passed || result.Attempts != 3 {
		t.Fatalf("want 3 failed attempts, got %+v", result)
	}
	if len(logs) != 1 || !strings.Contains(logs[0], "FINAL FAILURE after 3 attempts") {
		t.Fatalf("unexpected logs: %v", logs)
	}
}

func TestSelfCheckPerAttemptTimeout(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		time.Sleep(100 * time.Millisecond)
		_, _ = w.Write([]byte(`{}`))
	}))
	defer server.Close()

	result := Run(context.Background(), server.URL, map[string]any{}, Options{
		Delay:    time.Millisecond,
		Timeout:  10 * time.Millisecond,
		LogError: func(string) {},
	})
	if result.Passed || result.Attempts != 3 {
		t.Fatalf("want timeout failures, got %+v", result)
	}
}
