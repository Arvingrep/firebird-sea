// Package credential 为已登录会员向火鸟网关换取会话凭证（T3.2）。
//
// 凭证只在进程内存里短暂缓存，不落盘、不写日志：它是火鸟侧的完整会话能力，
// 泄漏等于把会员账号交给对方。
package credential

import (
	"context"
	"errors"
	"regexp"
	"strconv"
	"sync"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/gateway"
)

// 默认缓存 120 秒：够抵消一次页面里多个接口的重复换取，又短到凭证失效后不会长期用旧的。
const defaultCacheSeconds = 120

// 凭证会原样拼进 Cookie 头，所以两侧都必须限定字符集，否则一个分号就能注入额外 Cookie。
var (
	cookieNamePattern  = regexp.MustCompile(`^[A-Za-z0-9_]+$`)
	cookieValuePattern = regexp.MustCompile(`^[A-Za-z0-9+/=]+$`)
)

// ErrIssueSession 对应 Node 的 'issue_session failed'。
var ErrIssueSession = errors.New("issue_session failed")

// Gateway 是换取凭证所需的最小网关能力（gateway.IssueSession 的包装即可满足）。
type Gateway interface {
	IssueSession(ctx context.Context, params map[string]any) (map[string]any, error)
}

// Dep 注入凭证提供者的依赖。
type Dep struct {
	Gateway      Gateway
	CacheSeconds int
	Now          func() time.Time
}

type cacheEntry struct {
	cookie string
	until  time.Time
}

type inflight struct {
	done   chan struct{}
	cookie string
	err    error
}

// Provider 做缓存 + 并发去重：同一会员的并发请求只触发一次网关换取。
type Provider struct {
	gw           Gateway
	cacheSeconds int
	now          func() time.Time

	mu       sync.Mutex
	cache    map[int64]cacheEntry
	inflight map[int64]*inflight
}

func New(d Dep) *Provider {
	seconds := d.CacheSeconds
	if seconds <= 0 {
		seconds = defaultCacheSeconds
	}
	now := d.Now
	if now == nil {
		now = time.Now
	}
	return &Provider{
		gw:           d.Gateway,
		cacheSeconds: seconds,
		now:          now,
		cache:        make(map[int64]cacheEntry),
		inflight:     make(map[int64]*inflight),
	}
}

// Provide 返回 `name=value` 形态的 Cookie 片段（由调用方放进 Cookie 头）。
func (p *Provider) Provide(ctx context.Context, memberID int64) (string, error) {
	p.mu.Lock()
	if hit, ok := p.cache[memberID]; ok && hit.until.After(p.now()) {
		p.mu.Unlock()
		return hit.cookie, nil
	}
	if call, ok := p.inflight[memberID]; ok {
		p.mu.Unlock()
		select {
		case <-call.done:
			return call.cookie, call.err
		case <-ctx.Done():
			return "", ctx.Err()
		}
	}
	call := &inflight{done: make(chan struct{})}
	p.inflight[memberID] = call
	p.mu.Unlock()

	cookie, ttl, err := p.fetch(ctx, memberID)

	p.mu.Lock()
	call.cookie, call.err = cookie, err
	delete(p.inflight, memberID)
	close(call.done)
	if err == nil {
		p.cache[memberID] = cacheEntry{cookie: cookie, until: p.now().Add(time.Duration(ttl) * time.Second)}
		p.prune()
	}
	p.mu.Unlock()
	return cookie, err
}

// fetch 返回 cookie 片段与应采用的缓存秒数。
func (p *Provider) fetch(ctx context.Context, memberID int64) (string, int, error) {
	res, err := p.gw.IssueSession(ctx, map[string]any{"member_id": strconv.FormatInt(memberID, 10)})
	if err != nil {
		return "", 0, err
	}
	state, _ := gateway.Int(res, "state")
	info, ok := gateway.Map(res, "info")
	if state != 100 || !ok {
		return "", 0, ErrIssueSession
	}
	name, _ := gateway.Str(info, "cookie_name")
	value, _ := gateway.Str(info, "cookie_value")
	if !cookieNamePattern.MatchString(name) || !cookieValuePattern.MatchString(value) {
		return "", 0, ErrIssueSession
	}
	ttl := p.cacheSeconds
	if want, ok := gateway.Int(info, "ttl"); ok && want > 0 && want < int64(ttl) {
		// 取更短的一方：网关说 60s 而我们想缓存 120s 时按 60s 走，
		// 否则会拿着上游已失效的凭证继续打网关。
		ttl = int(want)
	}
	return name + "=" + value, ttl, nil
}

// prune 只在缓存条数超过 2000 时清理过期项：正常量级下不值得每次换取都遍历。
func (p *Provider) prune() {
	if len(p.cache) <= 2000 {
		return
	}
	now := p.now()
	for id, entry := range p.cache {
		if !entry.until.After(now) {
			delete(p.cache, id)
		}
	}
}
