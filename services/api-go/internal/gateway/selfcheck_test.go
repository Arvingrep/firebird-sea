// 契约护栏（不是临时自检）：用例锁定与 Node 版逐字对齐的对外行为 —— 上游请求形态、
// 错误码与 JSON 字段名。改实现前先看这里；合并前不要按临时文件删。
package gateway

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestSelfCheckSign(t *testing.T) {
	a := Sign("s", "1", "deal", "{}")
	if len(a) != 64 || strings.ToLower(a) != a {
		t.Fatalf("signature shape: %q", a)
	}
	if a != Sign("s", "1", "deal", "{}") {
		t.Fatal("signature must be deterministic")
	}
	if a == Sign("s", "2", "deal", "{}") || a == Sign("s", "1", "order_paid", "{}") {
		t.Fatal("signature must depend on timestamp and action")
	}
}

func TestSelfCheckCallSendsSignedRequest(t *testing.T) {
	var (
		gotPath    string
		gotHeaders http.Header
		gotBody    []byte
	)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotPath = r.URL.Path
		gotHeaders = r.Header.Clone()
		gotBody, _ = io.ReadAll(r.Body)
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"state":100,"info":{"ordernum":"O1"}}`))
	}))
	defer server.Close()

	clock := time.Unix(1700000000, 0)
	res, err := Call(context.Background(), Config{
		BaseURL:    server.URL + "/ignored-prefix",
		Secret:     "top-secret",
		HTTPClient: server.Client(),
		Now:        func() time.Time { return clock },
	}, "deal", map[string]any{"uid": 42})
	if err != nil {
		t.Fatalf("Call: %v", err)
	}
	if gotPath != Path {
		t.Fatalf("path: want %q, got %q", Path, gotPath)
	}
	if !strings.HasPrefix(string(gotBody), `{"action":"deal","params":{`) {
		t.Fatalf("body shape: %s", gotBody)
	}
	timestamp := gotHeaders.Get("X-Fbs-Timestamp")
	if timestamp != "1700000000" {
		t.Fatalf("timestamp header: %q", timestamp)
	}
	if want := Sign("top-secret", timestamp, "deal", string(gotBody)); gotHeaders.Get("X-Fbs-Signature") != want {
		t.Fatalf("signature header mismatch: %q != %q", gotHeaders.Get("X-Fbs-Signature"), want)
	}
	if state, _ := Int(res, "state"); state != 100 {
		t.Fatalf("response not decoded: %v", res)
	}
	if info, ok := Map(res, "info"); !ok {
		t.Fatalf("info missing: %v", res)
	} else if order, _ := Str(info, "ordernum"); order != "O1" {
		t.Fatalf("info.ordernum: %q", order)
	}
}

func TestSelfCheckErrorMapping(t *testing.T) {
	httpErr := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusBadGateway)
		_, _ = w.Write([]byte(`{"error":"gateway down"}`))
	}))
	defer httpErr.Close()

	_, err := Call(context.Background(), Config{BaseURL: httpErr.URL, Secret: "s", HTTPClient: httpErr.Client()}, "deal", nil)
	var gwErr *Error
	if !errors.As(err, &gwErr) || gwErr.Code != CodeHTTPError {
		t.Fatalf("want GATEWAY_HTTP_ERROR, got %v", err)
	}
	if gwErr.Status != http.StatusBadGateway || gwErr.Body != `{"error":"gateway down"}` {
		t.Fatalf("unexpected error detail: %+v", gwErr)
	}
	if payload, ok := gwErr.Payload.(map[string]any); !ok || payload["error"] != "gateway down" {
		t.Fatalf("payload not decoded: %+v", gwErr.Payload)
	}

	badJSON := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte(`<html>h5 shell</html>`))
	}))
	defer badJSON.Close()
	_, err = Call(context.Background(), Config{BaseURL: badJSON.URL, Secret: "s", HTTPClient: badJSON.Client()}, "deal", nil)
	if !errors.As(err, &gwErr) || gwErr.Code != CodeBadJSON {
		t.Fatalf("want GATEWAY_BAD_JSON, got %v", err)
	}
	if !strings.Contains(gwErr.Message, "h5 shell") {
		t.Fatalf("message should keep body prefix: %q", gwErr.Message)
	}

	slow := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		time.Sleep(200 * time.Millisecond)
		_, _ = w.Write([]byte(`{"state":100}`))
	}))
	defer slow.Close()
	started := time.Now()
	_, err = Call(context.Background(), Config{
		BaseURL:    slow.URL,
		Secret:     "s",
		Timeout:    30 * time.Millisecond,
		HTTPClient: slow.Client(),
	}, "deal", nil)
	if !errors.As(err, &gwErr) || gwErr.Code != CodeTimeout {
		t.Fatalf("want GATEWAY_TIMEOUT, got %v", err)
	}
	if time.Since(started) > time.Second {
		t.Fatal("timeout should fire quickly")
	}
	if gwErr.Message != "网关请求超时（30ms）" {
		t.Fatalf("timeout message: %q", gwErr.Message)
	}
}

func TestSelfCheckResponseHelpers(t *testing.T) {
	var decoded map[string]any
	if err := json.Unmarshal([]byte(`{"state":100,"flag":true,"info":{"member_id":9},"ttl":"300"}`), &decoded); err != nil {
		t.Fatal(err)
	}
	if v, ok := Int(decoded, "state"); !ok || v != 100 {
		t.Fatalf("Int(state): %v %v", v, ok)
	}
	if !Bool(decoded, "flag") {
		t.Fatal("Bool(flag) should be true")
	}
	info, ok := Map(decoded, "info")
	if !ok {
		t.Fatal("Map(info) missing")
	}
	if v, ok := Int(info, "member_id"); !ok || v != 9 {
		t.Fatalf("Int(member_id): %v %v", v, ok)
	}
	if v, ok := Int(decoded, "ttl"); !ok || v != 300 {
		t.Fatalf("Int(string) should parse: %v %v", v, ok)
	}
	if _, ok := Int(decoded, "missing"); ok {
		t.Fatal("missing key must report false")
	}
}

func TestSelfCheckInvalidBaseURL(t *testing.T) {
	if _, err := Call(context.Background(), Config{BaseURL: "not-a-url", Secret: "s"}, "deal", nil); err == nil {
		t.Fatal("expected invalid base url error")
	}
}
