// Package calltest 是一次性语音呼叫自检：失败/超时自动原生重试。
//
// 为什么在服务端重试而不是让前端重试：呼叫是外部副作用，前端重试会在弱网下
// 放大成多次呼叫；统一在这里做有限次重试，重试次数与间隔可控。
package calltest

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

const (
	// RetryMax 是「首次之外」的重试次数，总尝试次数为 RetryMax+1。
	RetryMax = 2
	// RetryDelay 与 Node 版硬编码的 3s 一致。
	RetryDelay = 3 * time.Second
	// Timeout 是单次尝试的超时。
	Timeout = 5 * time.Second
)

// Options 允许注入 sleep/client/logger，测试里把 3s 等成 10ms。
type Options struct {
	Delay   time.Duration
	Timeout time.Duration
	Client  *http.Client
	Sleep   func(d time.Duration)
	// LogError 收到终态失败日志；默认写 stderr。
	LogError func(message string)
}

// Result 的 JSON 形态与调用方约定一致：成功只有 passed/attempts，失败追加 error。
type Result struct {
	Passed   bool   `json:"passed"`
	Attempts int    `json:"attempts"`
	Error    string `json:"error,omitempty"`
}

// Run 发起呼叫自检。任一次成功即通过；全失败记录终态异常日志并返回 passed=false。
func Run(ctx context.Context, url string, payload any, opt Options) Result {
	delay := opt.Delay
	if delay <= 0 {
		delay = RetryDelay
	}
	timeout := opt.Timeout
	if timeout <= 0 {
		timeout = Timeout
	}
	sleep := opt.Sleep
	if sleep == nil {
		sleep = func(d time.Duration) { sleepCtx(ctx, d) }
	}
	logError := opt.LogError
	if logError == nil {
		logError = func(message string) { fmt.Fprintln(os.Stderr, message) }
	}

	body, err := json.Marshal(payload)
	if err != nil {
		// 载荷序列化失败是调用方 bug，重试没有意义；但返回结构要与其他失败一致。
		attempts := RetryMax + 1
		logError(fmt.Sprintf("[call-test] FINAL FAILURE after %d attempts: %s", attempts, err))
		return Result{Passed: false, Attempts: attempts, Error: err.Error()}
	}

	var lastErr error
	for attempt := 1; attempt <= RetryMax+1; attempt++ {
		if err := attemptCall(ctx, opt.Client, url, body, timeout); err != nil {
			lastErr = err
			if attempt <= RetryMax {
				sleep(delay)
			}
			continue
		}
		return Result{Passed: true, Attempts: attempt}
	}

	attempts := RetryMax + 1
	message := ""
	if lastErr != nil {
		message = lastErr.Error()
	}
	logError(fmt.Sprintf("[call-test] FINAL FAILURE after %d attempts: %s", attempts, message))
	return Result{Passed: false, Attempts: attempts, Error: message}
}

func attemptCall(ctx context.Context, client *http.Client, url string, body []byte, timeout time.Duration) error {
	reqCtx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	req, err := http.NewRequestWithContext(reqCtx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	if client == nil {
		client = &http.Client{Timeout: timeout}
	}
	res, err := client.Do(req)
	if err != nil {
		return err
	}
	defer func() { _ = res.Body.Close() }()
	_, _ = io.Copy(io.Discard, res.Body)

	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return fmt.Errorf("Call test upstream [%d]", res.StatusCode)
	}
	return nil
}

// sleepCtx 让注入的默认 sleep 也能被 ctx 提前打断，避免关停时白等 3 秒。
func sleepCtx(ctx context.Context, d time.Duration) {
	timer := time.NewTimer(d)
	defer timer.Stop()
	select {
	case <-ctx.Done():
	case <-timer.C:
	}
}
