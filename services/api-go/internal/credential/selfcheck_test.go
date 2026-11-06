// 契约护栏（不是临时自检）：用例锁定与 Node 版逐字对齐的对外行为 —— 状态码、错误码、
// JSON 字段名与字段顺序、空数组形态。改实现前先看这里；合并前不要按临时文件删。
package credential

import (
	"context"
	"sync"
	"testing"
	"time"
)

type fakeGateway struct {
	mu    sync.Mutex
	calls int
	delay time.Duration
	res   map[string]any
	err   error
}

func (f *fakeGateway) IssueSession(_ context.Context, params map[string]any) (map[string]any, error) {
	f.mu.Lock()
	f.calls++
	delay, res, err := f.delay, f.res, f.err
	f.mu.Unlock()
	if delay > 0 {
		time.Sleep(delay)
	}
	if params["member_id"] != "5" && params["member_id"] != "7" && params["member_id"] != "1" {
		// 只做一次弱断言：member_id 必须以字符串传递（与 Node 版 String(memberId) 一致）。
		return nil, errUnexpectedParam
	}
	return res, err
}

var errUnexpectedParam = &unexpectedParamError{}

type unexpectedParamError struct{}

func (*unexpectedParamError) Error() string { return "unexpected member_id" }

func okResponse() map[string]any {
	return map[string]any{
		"state": 100,
		"info": map[string]any{
			"cookie_name":  "HN_login_user",
			"cookie_value": "QUJD+/==",
			"ttl":          300,
		},
	}
}

func TestSelfCheckCacheReuseAndRefresh(t *testing.T) {
	clock := time.Unix(0, 0)
	gateway := &fakeGateway{res: okResponse()}
	provider := New(Dep{Gateway: gateway, CacheSeconds: 120, Now: func() time.Time { return clock }})

	cookie, err := provider.Provide(context.Background(), 5)
	if err != nil || cookie != "HN_login_user=QUJD+/==" {
		t.Fatalf("first provide: %q %v", cookie, err)
	}
	if _, err := provider.Provide(context.Background(), 5); err != nil {
		t.Fatalf("second provide: %v", err)
	}
	if gateway.calls != 1 {
		t.Fatalf("cache should serve the second call, calls=%d", gateway.calls)
	}

	clock = clock.Add(121 * time.Second)
	if _, err := provider.Provide(context.Background(), 5); err != nil {
		t.Fatalf("third provide: %v", err)
	}
	if gateway.calls != 2 {
		t.Fatalf("expected refresh after ttl, calls=%d", gateway.calls)
	}
}

func TestSelfCheckConcurrentDedupe(t *testing.T) {
	gateway := &fakeGateway{res: okResponse(), delay: 20 * time.Millisecond}
	provider := New(Dep{Gateway: gateway})

	var wg sync.WaitGroup
	for i := 0; i < 3; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			if _, err := provider.Provide(context.Background(), 7); err != nil {
				t.Errorf("provide: %v", err)
			}
		}()
	}
	wg.Wait()
	if gateway.calls != 1 {
		t.Fatalf("concurrent calls must share one fetch, calls=%d", gateway.calls)
	}
}

func TestSelfCheckRejectsBadCredential(t *testing.T) {
	cases := []map[string]any{
		{"state": 500, "info": "x"},
		{"state": 100, "info": map[string]any{"cookie_name": "a", "cookie_value": "v;evil=1"}},
		{"state": 100, "info": map[string]any{"cookie_name": "a b", "cookie_value": "v"}},
		{"state": 100},
	}
	for i, res := range cases {
		provider := New(Dep{Gateway: &fakeGateway{res: res}})
		if _, err := provider.Provide(context.Background(), 1); err == nil {
			t.Fatalf("case %d: expected error", i)
		}
	}
}

func TestSelfCheckGatewayErrorSurfaces(t *testing.T) {
	provider := New(Dep{Gateway: &fakeGateway{err: context.DeadlineExceeded}})
	if _, err := provider.Provide(context.Background(), 1); err == nil {
		t.Fatal("expected gateway error")
	}
}

func TestSelfCheckTTLIsCappedByConfig(t *testing.T) {
	clock := time.Unix(0, 0)
	// 网关说 10 秒，配置说 120 秒：应取更短的 10 秒。
	res := map[string]any{
		"state": 100,
		"info": map[string]any{
			"cookie_name":  "HN_login_user",
			"cookie_value": "QUJD+/==",
			"ttl":          10,
		},
	}
	gateway := &fakeGateway{res: res}
	provider := New(Dep{Gateway: gateway, CacheSeconds: 120, Now: func() time.Time { return clock }})

	if _, err := provider.Provide(context.Background(), 5); err != nil {
		t.Fatalf("provide: %v", err)
	}
	clock = clock.Add(11 * time.Second)
	if _, err := provider.Provide(context.Background(), 5); err != nil {
		t.Fatalf("provide: %v", err)
	}
	if gateway.calls != 2 {
		t.Fatalf("expected refresh after gateway ttl, calls=%d", gateway.calls)
	}
}
