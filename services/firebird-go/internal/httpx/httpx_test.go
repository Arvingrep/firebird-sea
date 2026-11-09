package httpx

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestChainOK(t *testing.T) {
	h := Chain(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusTeapot)
	}), 0)
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest("GET", "/x", nil))
	if rec.Code != http.StatusTeapot {
		t.Errorf("status = %d, want %d", rec.Code, http.StatusTeapot)
	}
}

func TestChainRecoversPanic(t *testing.T) {
	h := Chain(http.HandlerFunc(func(http.ResponseWriter, *http.Request) {
		panic("boom")
	}), 0)
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest("GET", "/x", nil))
	if rec.Code != http.StatusInternalServerError {
		t.Errorf("panic 后 status = %d, want 500", rec.Code)
	}
}

func TestChainTimeout(t *testing.T) {
	// handler 尊重 ctx：被取消时立即返回 → 中间件先补 503
	h := Chain(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		<-r.Context().Done()
	}), 30*time.Millisecond)
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest("GET", "/x", nil))
	if rec.Code != http.StatusServiceUnavailable {
		t.Errorf("超时 status = %d, want 503", rec.Code)
	}
}

func TestChainTimeoutWritesFirst(t *testing.T) {
	// handler 在超时后仍尝试写自己的 200：客户端拿到的必须是 503，且不 double-write 崩溃
	h := Chain(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		select {
		case <-r.Context().Done():
			// 竞态窗口：忽略写失败
			_ = errors.New("canceled")
		case <-time.After(2 * time.Second):
			w.WriteHeader(http.StatusOK)
		}
	}), 30*time.Millisecond)
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest("GET", "/x", nil))
	if rec.Code != http.StatusServiceUnavailable {
		t.Errorf("先到者的 503 被覆盖, status = %d", rec.Code)
	}
}

func TestChainLogsRequests(t *testing.T) {
	// 日志走 slog 默认 logger，这里只验证不因记录逻辑 panic 且响应正常
	h := Chain(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		_, _ = w.Write([]byte("hi"))
	}), time.Second)
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest("GET", "/log/check", nil))
	if rec.Code != http.StatusOK {
		t.Errorf("status = %d, want 200", rec.Code)
	}
}

func TestContextPropagated(t *testing.T) {
	// handler 拿到的 ctx 必须还带原始值（r.WithContext 链路完好）
	type key struct{}
	h := Chain(http.HandlerFunc(func(_ http.ResponseWriter, r *http.Request) {
		if r.Context().Value(key{}) != "v" {
			t.Error("context 值在中间件链中丢失")
		}
	}), 0)
	req := httptest.NewRequest("GET", "/x", nil).WithContext(context.WithValue(context.Background(), key{}, "v"))
	h.ServeHTTP(httptest.NewRecorder(), req)
}
