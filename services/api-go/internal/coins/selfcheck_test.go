// 契约护栏（不是临时自检）：用例锁定与 Node 版逐字对齐的对外行为 —— 状态码、错误码、
// JSON 字段名与字段顺序、空数组形态。改实现前先看这里；合并前不要按临时文件删。
package coins

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync/atomic"
	"testing"
	"time"
)

func TestSelfCheckSign(t *testing.T) {
	got := Sign("timestamp=1&recvWindow=5000", "secret")
	if len(got) != 64 {
		t.Fatalf("signature length: %d", len(got))
	}
	if got != Sign("timestamp=1&recvWindow=5000", "secret") {
		t.Fatal("signature must be deterministic")
	}
	if got == Sign("timestamp=1&recvWindow=5000", "other") {
		t.Fatal("signature must depend on secret")
	}
}

func TestSelfCheckTickerAndConversionCache(t *testing.T) {
	var calls int64
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		atomic.AddInt64(&calls, 1)
		if r.URL.Path != "/openapi/quote/v1/ticker/price" {
			w.WriteHeader(http.StatusNotFound)
			_, _ = w.Write([]byte(`{}`))
			return
		}
		if r.URL.Query().Get("symbol") != "USDTPHP" {
			t.Errorf("unexpected symbol: %q", r.URL.Query().Get("symbol"))
		}
		_, _ = w.Write([]byte(`{"symbol":"USDTPHP","price":"62.5"}`))
	}))
	defer server.Close()

	client := New(Dep{BaseURL: server.URL, HTTPClient: server.Client()})
	ticker, err := client.TickerPrice(context.Background(), "USDTPHP")
	if err != nil {
		t.Fatalf("TickerPrice: %v", err)
	}
	if ticker.Symbol != "USDTPHP" || ticker.Price != 62.5 {
		t.Fatalf("unexpected ticker: %+v", ticker)
	}

	conversion, err := client.ConvertPHPToUSDT(context.Background(), 625)
	if err != nil {
		t.Fatalf("ConvertPHPToUSDT: %v", err)
	}
	if conversion.Rate != 62.5 || conversion.USDT != 10 || !conversion.Cached {
		t.Fatalf("expected cached rate 62.5 -> 10 USDT, got %+v", conversion)
	}
	if atomic.LoadInt64(&calls) != 1 {
		t.Fatalf("cached rate must not refetch, calls=%d", calls)
	}
}

func TestSelfCheckConversionFallsBack(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte(`{"error":"down"}`))
	}))
	defer server.Close()

	client := New(Dep{BaseURL: server.URL, HTTPClient: server.Client()})
	conversion, err := client.ConvertPHPToUSDT(context.Background(), 1000)
	if err != nil {
		t.Fatalf("ConvertPHPToUSDT should fall back, got %v", err)
	}
	if conversion.Rate != FallbackRate || conversion.USDT != round2(1000/FallbackRate) || !conversion.Cached {
		t.Fatalf("expected fallback rate, got %+v", conversion)
	}
	if conversion.Timestamp == 0 {
		t.Fatal("timestamp should be set")
	}
}

func TestSelfCheckErrorMessages(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/openapi/quote/v1/ticker/24hr" {
			w.WriteHeader(http.StatusBadRequest)
			_, _ = w.Write([]byte(`{"code":-1,"msg":"bad symbol"}`))
			return
		}
		_, _ = w.Write([]byte(`<html>oops</html>`))
	}))
	defer server.Close()

	client := New(Dep{BaseURL: server.URL, HTTPClient: server.Client()})
	if _, err := client.TickerPrice(context.Background(), "USDTPHP"); err == nil || !strings.HasPrefix(err.Error(), "Invalid JSON response: ") {
		t.Fatalf("expected invalid json error, got %v", err)
	}
	if _, err := client.Stats24hr(context.Background(), "USDTPHP"); err == nil ||
		!strings.HasPrefix(err.Error(), "Coins.ph API [400]: ") {
		t.Fatalf("expected status error, got %v", err)
	}
	if _, err := client.AccountBalance(context.Background(), "", ""); err == nil ||
		err.Error() != "Missing COINS_PH_API_KEY or COINS_PH_API_SECRET" {
		t.Fatalf("expected missing key error, got %v", err)
	}
}

func TestSelfCheckTimeout(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		time.Sleep(100 * time.Millisecond)
		_, _ = w.Write([]byte(`{}`))
	}))
	defer server.Close()
	// 注入一个立即超时的客户端，比等 8s 更可靠。
	client := New(Dep{BaseURL: server.URL, HTTPClient: &http.Client{Timeout: 5 * time.Millisecond}})
	if _, err := client.TickerPrice(context.Background(), "USDTPHP"); err == nil || err.Error() != "Coins.ph request timeout" {
		t.Fatalf("expected timeout error, got %v", err)
	}
}
