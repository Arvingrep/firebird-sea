// 逐条翻译自 services/api/test/login-service.test.js（5 条，全部 BEHAVIOR）。
//
// Node 用 fake memberMap + 真实 limiter/token 服务；这里同样只替换成员能力，
// 限流、防重放、验签、签发令牌全部走真实实现，时钟统一注入。
package member

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/token"
)

const (
	ttLoginBotToken = "login-test-bot-token"
	ttLoginSecret   = "login-test-secret-0123"
)

// ttClock 是可推进的固定时钟（秒级）。
type ttClock struct {
	mu  sync.Mutex
	sec int64
}

func (c *ttClock) now() time.Time {
	c.mu.Lock()
	defer c.mu.Unlock()
	return time.Unix(c.sec, 0)
}

// ttMembers 是 LoginMembers 的替身：memberId = 100 + tgId%10，并记录审计条目。
type ttMembers struct {
	mu     sync.Mutex
	audits []string
}

func (m *ttMembers) FindOrCreate(_ context.Context, tgID int64) (int64, bool, error) {
	return 100 + tgID%10, true, nil
}

func (m *ttMembers) Audit(_ context.Context, tgID int64, action, _, _ string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.audits = append(m.audits, strconv.FormatInt(tgID, 10)+":"+action)
	return nil
}

func (m *ttMembers) entries() []string {
	m.mu.Lock()
	defer m.mu.Unlock()
	return append([]string(nil), m.audits...)
}

func (m *ttMembers) count(entry string) int {
	total := 0
	for _, a := range m.entries() {
		if a == entry {
			total++
		}
	}
	return total
}

func (m *ttMembers) has(entry string) bool { return m.count(entry) > 0 }

// ttLoginRig 聚合 Node build() 返回的 { svc, tokens, auditLog }。
type ttLoginRig struct {
	service *LoginService
	tokens  *token.Service
	members *ttMembers
	clock   *ttClock
}

func ttBuild(t *testing.T) *ttLoginRig {
	t.Helper()
	clock := &ttClock{sec: 1700000000}
	tokens, err := token.NewService(token.Dep{
		Secret: ttLoginSecret,
		Env:    "canary",
		Now:    clock.now,
	})
	if err != nil {
		t.Fatalf("构造令牌服务失败: %v", err)
	}
	members := &ttMembers{}
	allowLogin := token.NewLimiter(3, 60*time.Second, clock.now)
	allowReplayLimiter := token.NewLimiter(2, 3600*time.Second, clock.now)
	service := NewLoginService(LoginDep{
		BotToken:   ttLoginBotToken,
		Tokens:     tokens,
		Members:    members,
		AllowLogin: allowLogin,
		AllowReplay: func(_ context.Context, key string) (bool, error) {
			return allowReplayLimiter(key), nil
		},
		Now: clock.now,
	})
	return &ttLoginRig{service: service, tokens: tokens, members: members, clock: clock}
}

// ttInitData 复刻 Node 的 initFor(id, extra)：auth_date 取注入时钟。
func ttInitData(t *testing.T, clock *ttClock, tgID int64, extra map[string]string) string {
	t.Helper()
	fields := map[string]string{
		"auth_date": strconv.FormatInt(clock.now().Unix(), 10),
		"user":      `{"id":` + strconv.FormatInt(tgID, 10) + `}`,
	}
	for k, v := range extra {
		fields[k] = v
	}
	keys := make([]string, 0, len(fields))
	for k := range fields {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	lines := make([]string, 0, len(keys))
	for _, k := range keys {
		lines = append(lines, k+"="+fields[k])
	}
	inner := hmac.New(sha256.New, []byte("WebAppData"))
	inner.Write([]byte(ttLoginBotToken))
	outer := hmac.New(sha256.New, inner.Sum(nil))
	outer.Write([]byte(strings.Join(lines, "\n")))

	values := url.Values{}
	for _, k := range keys {
		values.Set(k, fields[k])
	}
	values.Set("hash", hex.EncodeToString(outer.Sum(nil)))
	return values.Encode()
}

// ttLoginBody 把 Login 的 any 响应断言成成功体，供各用例取 token。
func ttLoginBody(t *testing.T, body any) loginBody {
	t.Helper()
	typed, ok := body.(loginBody)
	if !ok {
		t.Fatalf("成功响应应为 loginBody，实际 %T", body)
	}
	return typed
}

func ttErrorCode(t *testing.T, body any) string {
	t.Helper()
	typed, ok := body.(errorBody)
	if !ok {
		t.Fatalf("失败响应应为 errorBody，实际 %T", body)
	}
	return typed.Error.Code
}

func TestLoginService(t *testing.T) {
	ctx := context.Background()

	t.Run("有效 initData 登录成功并签发可验证令牌", func(t *testing.T) {
		rig := ttBuild(t)
		status, body := rig.service.Login(ctx, ttInitData(t, rig.clock, 55, nil))
		if status != 200 {
			t.Fatalf("状态码应为 200，实际 %d", status)
		}
		claims, err := rig.tokens.Verify(ttLoginBody(t, body).Data.Token)
		if err != nil {
			t.Fatalf("签发的令牌应可验证，实际 %v", err)
		}
		if claims.Sub != "55" {
			t.Fatalf("claims.sub 应为 \"55\"，实际 %q", claims.Sub)
		}
		if !rig.members.has("55:login") {
			t.Fatalf("应写登录审计，实际 %v", rig.members.entries())
		}
	})

	t.Run("篡改或缺字段的 initData 返回 401", func(t *testing.T) {
		rig := ttBuild(t)
		good := ttInitData(t, rig.clock, 55, nil)
		if status, _ := rig.service.Login(ctx, strings.Replace(good, "55", "56", 1)); status != 401 {
			t.Fatalf("篡改 user 应返回 401，实际 %d", status)
		}
		if status, _ := rig.service.Login(ctx, ""); status != 401 {
			t.Fatalf("空 initData 应返回 401，实际 %d", status)
		}
		// Node 的第三条是「签名有效但缺 auth_date」：直接对该字段集合签名。
		if status, _ := rig.service.Login(ctx, ttSignFields(t, map[string]string{"user": `{"id":1}`})); status != 401 {
			t.Fatalf("缺 auth_date 应返回 401，实际 %d", status)
		}
	})

	t.Run("同一 tg_id 高频登录返回 429 并写审计", func(t *testing.T) {
		rig := ttBuild(t)
		for i := 0; i < 3; i++ {
			status, _ := rig.service.Login(ctx, ttInitData(t, rig.clock, 77, map[string]string{
				"query_id": "q" + strconv.Itoa(i),
			}))
			if status != 200 {
				t.Fatalf("第 %d 次登录应成功，实际 %d", i+1, status)
			}
		}
		status, _ := rig.service.Login(ctx, ttInitData(t, rig.clock, 77, map[string]string{"query_id": "q9"}))
		if status != 429 {
			t.Fatalf("超限应返回 429，实际 %d", status)
		}
		if !rig.members.has("77:login_rate_limited") {
			t.Fatalf("应写限流审计，实际 %v", rig.members.entries())
		}
	})

	t.Run("限流审计采样：窗口内重复 429 只写一条审计", func(t *testing.T) {
		rig := ttBuild(t)
		for i := 0; i < 3; i++ {
			_, _ = rig.service.Login(ctx, ttInitData(t, rig.clock, 66, map[string]string{
				"query_id": "q" + strconv.Itoa(i),
			}))
		}
		for i := 0; i < 5; i++ {
			_, _ = rig.service.Login(ctx, ttInitData(t, rig.clock, 66, map[string]string{
				"query_id": "x" + strconv.Itoa(i),
			}))
		}
		if got := rig.members.count("66:login_rate_limited"); got != 1 {
			t.Fatalf("窗口内限流审计应只写 1 条，实际 %d 条（%v）", got, rig.members.entries())
		}
	})

	t.Run("同一 initData 重复换发超过上限返回 429", func(t *testing.T) {
		rig := ttBuild(t)
		data := ttInitData(t, rig.clock, 88, nil)
		if status, _ := rig.service.Login(ctx, data); status != 200 {
			t.Fatalf("第 1 次换发应成功，实际 %d", status)
		}
		if status, _ := rig.service.Login(ctx, data); status != 200 {
			t.Fatalf("第 2 次换发应成功，实际 %d", status)
		}
		status, body := rig.service.Login(ctx, data)
		if status != 429 {
			t.Fatalf("第 3 次换发应返回 429，实际 %d", status)
		}
		if code := ttErrorCode(t, body); code != "REPLAY_LIMITED" {
			t.Fatalf("错误码应为 REPLAY_LIMITED，实际 %q", code)
		}
	})
}

// ttSignFields 对任意字段集合签名（用于构造「签名有效但缺 auth_date」这类输入）。
func ttSignFields(t *testing.T, fields map[string]string) string {
	t.Helper()
	keys := make([]string, 0, len(fields))
	for k := range fields {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	lines := make([]string, 0, len(keys))
	for _, k := range keys {
		lines = append(lines, k+"="+fields[k])
	}
	inner := hmac.New(sha256.New, []byte("WebAppData"))
	inner.Write([]byte(ttLoginBotToken))
	outer := hmac.New(sha256.New, inner.Sum(nil))
	outer.Write([]byte(strings.Join(lines, "\n")))

	values := url.Values{}
	for _, k := range keys {
		values.Set(k, fields[k])
	}
	values.Set("hash", hex.EncodeToString(outer.Sum(nil)))
	return values.Encode()
}
