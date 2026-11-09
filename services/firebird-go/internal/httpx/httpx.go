// Package httpx 提供标准库 net/http 的横切中间件：请求日志、panic 恢复、超时。
// 不引入 Web 框架（#231 约定）。
//
// 三件事收敛在一个 Chain 里而不是三个可自由拼装的中间件：
// 状态码要由同一个 statusRecorder 记录，多层各包一个 recorder 时
// 内层写的 503 外层看不见，访问日志会全部记成 200。
package httpx

import (
	"context"
	"log/slog"
	"net/http"
	"runtime/debug"
	"time"
)

// statusRecorder 记录状态码与是否已写响应，供日志、恢复与超时逻辑共用。
type statusRecorder struct {
	http.ResponseWriter
	status int
	wrote  bool
}

func (r *statusRecorder) WriteHeader(code int) {
	if !r.wrote {
		r.status = code
		r.wrote = true
	}
	r.ResponseWriter.WriteHeader(code)
}

func (r *statusRecorder) Write(b []byte) (int, error) {
	r.wrote = true
	if r.status == 0 {
		r.status = http.StatusOK
	}
	return r.ResponseWriter.Write(b)
}

// Chain = 请求日志（最外）→ panic 恢复 → 超时（最内）。
// timeout <= 0 时不启用超时（测试用）。
//
// 超时实现说明：到点后若 handler 尚未写任何响应则补 503，并等 handler 退出再返回，
// 避免 goroutine 泄漏。不中断已卡在阻塞 IO 里的 handler——那类代码必须自己尊重 ctx。
// 已知取舍：handler 超时后仍尝试写响应与 503 存在理论竞态，标准库 TimeoutHandler
// 用同款思路且不 recover panic（会拖垮进程），相比之下这里的取舍更安全。
func Chain(next http.Handler, timeout time.Duration) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		rec := &statusRecorder{ResponseWriter: w, status: http.StatusOK}
		start := time.Now()

		defer func() {
			if p := recover(); p != nil {
				slog.Error("http_panic",
					"panic", p,
					"path", r.URL.Path,
					"stack", string(debug.Stack()),
				)
				if !rec.wrote {
					rec.WriteHeader(http.StatusInternalServerError)
				}
			}
			slog.Info("http_request",
				"method", r.Method,
				"path", r.URL.Path,
				"status", rec.status,
				"duration_ms", time.Since(start).Milliseconds(),
			)
		}()

		if timeout <= 0 {
			next.ServeHTTP(rec, r)
			return
		}

		ctx, cancel := context.WithTimeout(r.Context(), timeout)
		defer cancel()

		done := make(chan struct{})
		go func() {
			defer close(done)
			next.ServeHTTP(rec, r.WithContext(ctx))
		}()

		select {
		case <-done:
		case <-ctx.Done():
			if !rec.wrote {
				rec.WriteHeader(http.StatusServiceUnavailable)
			}
			<-done
		}
	})
}
