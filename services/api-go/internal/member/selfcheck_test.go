// 契约护栏（不是临时自检）：用例锁定与 Node 版逐字对齐的对外行为 —— 登录/映射的状态码、
// 错误码与「后端故障时不放行」。改实现前先看这里；合并前不要按临时文件删。
package member

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/token"
)

const selfBotToken = "login-test-bot-token"

// signSelf 复刻 Node 测试里的 sign()：排序后用 \n 连接。
func signSelf(fields map[string]string) string {
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
	inner.Write([]byte(selfBotToken))
	outer := hmac.New(sha256.New, inner.Sum(nil))
	outer.Write([]byte(strings.Join(lines, "\n")))
	withHash := map[string]string{"hash": hex.EncodeToString(outer.Sum(nil))}
	for k, v := range fields {
		withHash[k] = v
	}
	values := url.Values{}
	for k, v := range withHash {
		values.Set(k, v)
	}
	return values.Encode()
}

type fakeMembers struct {
	mu     sync.Mutex
	audits []string
	err    error
}

func (f *fakeMembers) FindOrCreate(_ context.Context, tgID int64) (int64, bool, error) {
	if f.err != nil {
		return 0, false, f.err
	}
	return 100 + tgID%10, true, nil
}

func (f *fakeMembers) Audit(_ context.Context, tgID int64, action, _, _ string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.audits = append(f.audits, strconv.FormatInt(tgID, 10)+":"+action)
	return nil
}

func (f *fakeMembers) has(entry string) bool {
	f.mu.Lock()
	defer f.mu.Unlock()
	for _, got := range f.audits {
		if got == entry {
			return true
		}
	}
	return false
}

func (f *fakeMembers) count(entry string) int {
	f.mu.Lock()
	defer f.mu.Unlock()
	n := 0
	for _, got := range f.audits {
		if got == entry {
			n++
		}
	}
	return n
}

type selfClock struct {
	mu sync.Mutex
	t  time.Time
}

func (c *selfClock) now() time.Time {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.t
}

type replayCounter struct {
	mu    sync.Mutex
	seen  map[string]int
	limit int
}

func (r *replayCounter) allow(_ context.Context, key string) (bool, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.seen[key]++
	return r.seen[key] <= r.limit, nil
}

func buildSelfService(t *testing.T) (*LoginService, *token.Service, *fakeMembers, *selfClock) {
	t.Helper()
	clock := &selfClock{t: time.Unix(1700000000, 0)}
	tokens, err := token.NewService(token.Dep{
		Secret: "login-test-secret-0123",
		Env:    "canary",
		TTL:    time.Minute,
		Now:    clock.now,
	})
	if err != nil {
		t.Fatalf("token.NewService: %v", err)
	}
	members := &fakeMembers{}
	svc := NewLoginService(LoginDep{
		BotToken:    selfBotToken,
		Tokens:      tokens,
		Members:     members,
		AllowLogin:  token.NewLimiter(3, time.Minute, clock.now),
		AllowReplay: (&replayCounter{seen: map[string]int{}, limit: 2}).allow,
		Now:         clock.now,
		AuditEvery:  time.Minute,
	})
	return svc, tokens, members, clock
}

func initDataFor(clock *selfClock, tgID int64, extra map[string]string) string {
	t := func() string { return strconv.FormatInt(clock.now().Unix(), 10) }
	fields := map[string]string{
		"auth_date": t(),
		"user":      `{"id":` + strconv.FormatInt(tgID, 10) + `}`,
	}
	for k, v := range extra {
		fields[k] = v
	}
	return signSelf(fields)
}

func TestSelfCheckLoginSuccess(t *testing.T) {
	svc, tokens, members, clock := buildSelfService(t)
	status, body := svc.Login(context.Background(), initDataFor(clock, 55, nil))
	if status != 200 {
		t.Fatalf("status: %d body=%+v", status, body)
	}
	payload, ok := body.(loginBody)
	if !ok || !payload.Success {
		t.Fatalf("unexpected body: %#v", body)
	}
	claims, err := tokens.Verify(payload.Data.Token)
	if err != nil || claims.Sub != "55" {
		t.Fatalf("token should verify with sub=55: %v %+v", err, claims)
	}
	if payload.Data.MemberID != 105 {
		t.Fatalf("memberId: %d", payload.Data.MemberID)
	}
	if !members.has("55:login") {
		t.Fatal("expected login audit")
	}
}

func TestSelfCheckLoginRejectsBadInitData(t *testing.T) {
	svc, _, _, clock := buildSelfService(t)
	good := initDataFor(clock, 55, nil)

	status, body := svc.Login(context.Background(), strings.Replace(good, "55", "56", 1))
	if status != 401 {
		t.Fatalf("tampered initData: want 401, got %d", status)
	}
	if detail, ok := body.(errorBody); !ok || detail.Error.Code != "INVALID_INIT_DATA" {
		t.Fatalf("unexpected body: %#v", body)
	}
	if status, _ := svc.Login(context.Background(), ""); status != 401 {
		t.Fatalf("empty initData: want 401, got %d", status)
	}
	// 签名有效但缺 auth_date
	missingAuth := signSelf(map[string]string{"user": `{"id":1}`})
	if status, _ := svc.Login(context.Background(), missingAuth); status != 401 {
		t.Fatalf("missing auth_date: want 401, got %d", status)
	}
}

func TestSelfCheckLoginRateLimitAndAuditSampling(t *testing.T) {
	svc, _, members, clock := buildSelfService(t)
	for i := 0; i < 3; i++ {
		status, _ := svc.Login(context.Background(), initDataFor(clock, 77, map[string]string{"query_id": "q" + strconv.Itoa(i)}))
		if status != 200 {
			t.Fatalf("attempt %d: want 200, got %d", i, status)
		}
	}
	for i := 0; i < 5; i++ {
		status, body := svc.Login(context.Background(), initDataFor(clock, 77, map[string]string{"query_id": "x" + strconv.Itoa(i)}))
		if status != 429 {
			t.Fatalf("attempt %d: want 429, got %d", i, status)
		}
		if detail, ok := body.(errorBody); !ok || detail.Error.Code != "RATE_LIMITED" {
			t.Fatalf("unexpected body: %#v", body)
		}
	}
	if got := members.count("77:login_rate_limited"); got != 1 {
		t.Fatalf("audit sampling should write once, got %d", got)
	}
}

func TestSelfCheckLoginReplayLimit(t *testing.T) {
	svc, _, _, clock := buildSelfService(t)
	initData := initDataFor(clock, 88, nil)
	for i := 0; i < 2; i++ {
		if status, _ := svc.Login(context.Background(), initData); status != 200 {
			t.Fatalf("attempt %d: want 200, got %d", i, status)
		}
	}
	status, body := svc.Login(context.Background(), initData)
	if status != 429 {
		t.Fatalf("want 429, got %d", status)
	}
	if detail, ok := body.(errorBody); !ok || detail.Error.Code != "REPLAY_LIMITED" {
		t.Fatalf("unexpected body: %#v", body)
	}
}

func TestSelfCheckLoginFailsClosedWhenReplayBackendBreaks(t *testing.T) {
	_, _, _, clock := buildSelfService(t)
	broken := NewLoginService(LoginDep{
		BotToken:    selfBotToken,
		Tokens:      mustTokens(t),
		Members:     &fakeMembers{},
		AllowReplay: func(context.Context, string) (bool, error) { return false, errors.New("db down") },
		Now:         clock.now,
	})
	status, body := broken.Login(context.Background(), initDataFor(clock, 99, nil))
	// 后端故障 ≠ 用太多次：Node 里 allowReplay 抛错会冒泡到路由的 catch → 502 LOGIN_FAILED，
	// bridge 侧则是 502 BRIDGE_FAILED。仍然是 fail-closed（不会下发令牌），只是状态码要一致。
	if status != 502 {
		t.Fatalf("replay backend 故障应 502（Node 的 catch 分支），实得 %d", status)
	}
	if detail, ok := body.(errorBody); !ok || detail.Error.Code != "LOGIN_FAILED" {
		t.Fatalf("unexpected body: %#v", body)
	}
}

func TestSelfCheckLoginMemberError(t *testing.T) {
	clock := &selfClock{t: time.Unix(1700000000, 0)}
	svc := NewLoginService(LoginDep{
		BotToken: selfBotToken,
		Tokens:   mustTokens(t),
		Members:  &fakeMembers{err: errors.New("gateway down")},
		Now:      clock.now,
	})
	status, _ := svc.Login(context.Background(), initDataFor(clock, 12, nil))
	if status != 502 {
		t.Fatalf("member failure should be 502, got %d", status)
	}
}

func mustTokens(t *testing.T) *token.Service {
	t.Helper()
	tokens, err := token.NewService(token.Dep{Secret: "login-test-secret-0123", Env: "canary"})
	if err != nil {
		t.Fatalf("token.NewService: %v", err)
	}
	return tokens
}

func TestSelfCheckInvalidTgID(t *testing.T) {
	m := NewMap(Dep{})
	for _, bad := range []int64{0, -1} {
		if _, _, err := m.FindOrCreate(context.Background(), bad); !errors.Is(err, ErrInvalidTgID) {
			t.Fatalf("tgID %d: want invalid tg id, got %v", bad, err)
		}
		if _, err := m.Lookup(context.Background(), bad); !errors.Is(err, ErrInvalidTgID) {
			t.Fatalf("lookup tgID %d: want invalid tg id, got %v", bad, err)
		}
		if err := m.Audit(context.Background(), bad, "login", "tg:0", ""); !errors.Is(err, ErrInvalidTgID) {
			t.Fatalf("audit tgID %d: want invalid tg id, got %v", bad, err)
		}
	}
}
