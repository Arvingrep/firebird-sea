// 逐条翻译自 services/api/test/credential-provider.test.js 的 3 条 BEHAVIOR 用例
// （该文件第 4 条是对 webroot/api/fbs/*.php 的源码静态断言，不在 Go 重写范围，未翻译）。
package credential

import (
	"context"
	"errors"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

// ttClock 是可推进的固定时钟。
type ttClock struct {
	mu     sync.Mutex
	moment time.Time
}

func (c *ttClock) now() time.Time {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.moment
}

func (c *ttClock) advance(d time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.moment = c.moment.Add(d)
}

// ttGateway 是 Gateway 替身：可注入响应、错误、并发计数与阻塞闸门。
type ttGateway struct {
	calls   int64
	res     map[string]any
	err     error
	entered chan struct{}
	release chan struct{}
}

func (g *ttGateway) IssueSession(_ context.Context, _ map[string]any) (map[string]any, error) {
	atomic.AddInt64(&g.calls, 1)
	if g.entered != nil {
		g.entered <- struct{}{}
	}
	if g.release != nil {
		<-g.release
	}
	if g.err != nil {
		return nil, g.err
	}
	return g.res, nil
}

func (g *ttGateway) callCount() int { return int(atomic.LoadInt64(&g.calls)) }

// ttOKResponse 对应 Node 的 okRes。
func ttOKResponse() map[string]any {
	return map[string]any{
		"state": 100,
		"info": map[string]any{
			"cookie_name":  "HN_login_user",
			"cookie_value": "QUJD+/==",
			"ttl":          300,
		},
	}
}

func TestCredentialProvider(t *testing.T) {
	ctx := context.Background()

	t.Run("换取凭证并在缓存期内复用，过期后重新换取", func(t *testing.T) {
		clock := &ttClock{moment: time.Unix(0, 0)}
		gateway := &ttGateway{res: ttOKResponse()}
		provider := New(Dep{Gateway: gateway, CacheSeconds: 120, Now: clock.now})

		cookie, err := provider.Provide(ctx, 5)
		if err != nil {
			t.Fatalf("首次换取应成功，实际 %v", err)
		}
		if cookie != "HN_login_user=QUJD+/==" {
			t.Fatalf("Cookie 片段应为 HN_login_user=QUJD+/==，实际 %q", cookie)
		}
		if _, err := provider.Provide(ctx, 5); err != nil {
			t.Fatalf("缓存内复用应成功，实际 %v", err)
		}
		if got := gateway.callCount(); got != 1 {
			t.Fatalf("缓存期内应只换取 1 次，实际 %d", got)
		}
		clock.advance(121 * time.Second)
		if _, err := provider.Provide(ctx, 5); err != nil {
			t.Fatalf("过期后重新换取应成功，实际 %v", err)
		}
		if got := gateway.callCount(); got != 2 {
			t.Fatalf("过期后应重新换取（共 2 次），实际 %d", got)
		}
	})

	t.Run("并发请求共享同一次换取", func(t *testing.T) {
		gateway := &ttGateway{
			res:     ttOKResponse(),
			entered: make(chan struct{}, 4),
			release: make(chan struct{}),
		}
		provider := New(Dep{Gateway: gateway})

		var wg sync.WaitGroup
		errs := make([]error, 3)
		for i := 0; i < 3; i++ {
			wg.Add(1)
			go func(index int) {
				defer wg.Done()
				_, errs[index] = provider.Provide(ctx, 7)
			}(i)
		}

		// 等第一个换取真正进入网关，再放行；其余两个此刻已在 inflight 上等待。
		<-gateway.entered
		time.Sleep(5 * time.Millisecond)
		close(gateway.release)
		wg.Wait()

		for i, err := range errs {
			if err != nil {
				t.Fatalf("第 %d 个并发请求失败: %v", i+1, err)
			}
		}
		if got := gateway.callCount(); got != 1 {
			t.Fatalf("并发请求应共享同一次换取（1 次），实际 %d", got)
		}
	})

	t.Run("网关失败或返回含非法字符的凭证时抛错（防 Cookie 头注入）", func(t *testing.T) {
		badResponses := []map[string]any{
			{"state": 500, "info": "x"},
			{"state": 100, "info": map[string]any{"cookie_name": "a", "cookie_value": "v;evil=1"}},
			{"state": 100, "info": map[string]any{"cookie_name": "a b", "cookie_value": "v"}},
		}
		for index, res := range badResponses {
			provider := New(Dep{Gateway: &ttGateway{res: res}})
			if _, err := provider.Provide(ctx, 1); !errors.Is(err, ErrIssueSession) {
				t.Fatalf("第 %d 组非法响应应返回 ErrIssueSession，实际 %v", index+1, err)
			}
		}

		provider := New(Dep{Gateway: &ttGateway{err: errors.New("gateway down")}})
		if _, err := provider.Provide(ctx, 1); err == nil {
			t.Fatal("网关错误必须向上抛出")
		}
	})
}
