// 逐条翻译自 services/api/test/tma-token.test.js 的 6 条令牌用例（另 1 条限流在 limiter_test.go）。
//
// Node 的 svc() 用 `let t = 1000` 秒级秒表，本文件用同语义的可推进固定时钟。
package token

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"strings"
	"testing"
	"time"
)

// ttSecret 对应 Node 的 SECRET。
const ttSecret = "unit-test-secret-0123456789"

// ttClock 是可推进的固定时钟（秒级，与 Node 的 now: () => t 一致）。
type ttClock struct{ sec int64 }

func (c *ttClock) now() time.Time { return time.Unix(c.sec, 0) }

func (c *ttClock) tick(seconds int64) { c.sec += seconds }

// ttService 对应 Node 的 svc(over)：ttl 60s、env canary、时钟从 1000 起。
func ttService(t *testing.T, clock *ttClock) *Service {
	t.Helper()
	svc, err := NewService(Dep{
		Secret: ttSecret,
		Env:    "canary",
		TTL:    60 * time.Second,
		Now:    clock.now,
	})
	if err != nil {
		t.Fatalf("构造令牌服务失败: %v", err)
	}
	return svc
}

func TestTMAToken(t *testing.T) {
	t.Run("签发的令牌可验证并携带 tg_id、会员 id、env", func(t *testing.T) {
		svc := ttService(t, &ttClock{sec: 1000})
		issued := svc.Issue(42, 7)
		claims, err := svc.Verify(issued.Token)
		if err != nil {
			t.Fatalf("刚签发的令牌应验证通过，实际 %v", err)
		}
		if claims.Sub != "42" {
			t.Fatalf("claims.sub 应为 \"42\"，实际 %q", claims.Sub)
		}
		if claims.Mid != 7 {
			t.Fatalf("claims.mid 应为 7，实际 %d", claims.Mid)
		}
		if claims.Env != "canary" {
			t.Fatalf("claims.env 应为 canary，实际 %q", claims.Env)
		}
	})

	t.Run("篡改载荷或签名被拒绝", func(t *testing.T) {
		svc := ttService(t, &ttClock{sec: 1000})
		issued := svc.Issue(42, 7)
		body, sig, ok := strings.Cut(issued.Token, ".")
		if !ok {
			t.Fatalf("令牌应为 body.sig 两段，实际 %q", issued.Token)
		}

		payload, err := base64.RawURLEncoding.DecodeString(body)
		if err != nil {
			t.Fatalf("payload 应为 base64url: %v", err)
		}
		var claims map[string]any
		if err := json.Unmarshal(payload, &claims); err != nil {
			t.Fatalf("payload 应为 JSON 对象: %v", err)
		}
		claims["mid"] = 1
		evilPayload, err := json.Marshal(claims)
		if err != nil {
			t.Fatalf("重编码 payload 失败: %v", err)
		}
		evil := base64.RawURLEncoding.EncodeToString(evilPayload)

		if _, err := svc.Verify(evil + "." + sig); err == nil {
			t.Fatal("篡改载荷必须被拒绝")
		}
		if _, err := svc.Verify(body + "." + sig[:len(sig)-2] + "AA"); err == nil {
			t.Fatal("篡改签名必须被拒绝")
		}
		if _, err := svc.Verify("garbage"); err == nil {
			t.Fatal("无分隔符的垃圾串必须被拒绝")
		}
		if _, err := svc.Verify(""); err == nil {
			t.Fatal("空令牌必须被拒绝")
		}
	})

	t.Run("过期令牌被拒绝", func(t *testing.T) {
		clock := &ttClock{sec: 1000}
		svc := ttService(t, clock)
		issued := svc.Issue(1, 1)
		clock.tick(61)
		if _, err := svc.Verify(issued.Token); !errors.Is(err, ErrExpired) {
			t.Fatalf("过期后应返回 expired，实际 %v", err)
		}
	})

	t.Run("吊销后立即失效", func(t *testing.T) {
		svc := ttService(t, &ttClock{sec: 1000})
		issued := svc.Issue(1, 1)
		if !svc.Revoke(issued.Token) {
			t.Fatal("Revoke 应返回 true")
		}
		if _, err := svc.Verify(issued.Token); !errors.Is(err, ErrRevoked) {
			t.Fatalf("吊销后应返回 revoked，实际 %v", err)
		}
	})

	t.Run("canary 令牌在 prod 环境无效（反之亦然）", func(t *testing.T) {
		clock := &ttClock{sec: 1000}
		canary, err := NewService(Dep{Secret: ttSecret, Env: "canary", Now: clock.now})
		if err != nil {
			t.Fatalf("构造 canary 服务失败: %v", err)
		}
		prod, err := NewService(Dep{Secret: ttSecret, Env: "prod", Now: clock.now})
		if err != nil {
			t.Fatalf("构造 prod 服务失败: %v", err)
		}
		issued := canary.Issue(1, 1)
		if _, err := prod.Verify(issued.Token); !errors.Is(err, ErrWrongEnv) {
			t.Fatalf("prod 验证 canary 令牌应返回 wrong_env，实际 %v", err)
		}
		if prod.Issue(1, 1).Token == issued.Token {
			t.Fatal("不同环境的签名结果不应相同")
		}
	})

	t.Run("缺失密钥或环境时拒绝创建服务", func(t *testing.T) {
		if _, err := NewService(Dep{Secret: "short", Env: "canary"}); err == nil {
			t.Fatal("过短的 secret 必须被拒绝")
		}
		if _, err := NewService(Dep{Secret: ttSecret}); err == nil {
			t.Fatal("缺失 env 必须被拒绝")
		}
	})
}
