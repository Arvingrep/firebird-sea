// 契约护栏（不是临时自检）：用例锁定令牌签发/校验与限流分桶的语义。改实现前先看这里；
// 合并前不要按临时文件删。
package token

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"strings"
	"testing"
	"time"
)

const selfSecret = "unit-test-secret-0123456789"

func newSelfService(t *testing.T, env string, clock *time.Time) *Service {
	t.Helper()
	svc, err := NewService(Dep{
		Secret: selfSecret,
		Env:    env,
		TTL:    60 * time.Second,
		Now:    func() time.Time { return *clock },
	})
	if err != nil {
		t.Fatalf("NewService: %v", err)
	}
	return svc
}

func TestSelfCheckIssueVerify(t *testing.T) {
	clock := time.Unix(1000, 0)
	svc := newSelfService(t, "canary", &clock)

	issued := svc.Issue(42, 7)
	if issued.ExpiresAt != 1060 {
		t.Fatalf("expiresAt: got %d", issued.ExpiresAt)
	}
	if !strings.Contains(issued.Token, ".") {
		t.Fatalf("token should have two parts: %q", issued.Token)
	}

	claims, err := svc.Verify(issued.Token)
	if err != nil {
		t.Fatalf("Verify: %v", err)
	}
	if claims.Sub != "42" || claims.Mid != 7 || claims.Env != "canary" {
		t.Fatalf("claims mismatch: %+v", claims)
	}

	// payload 字段顺序必须是 sub/mid/env/iat/exp/jti（签名覆盖原文，顺序是契约）。
	body := strings.Split(issued.Token, ".")[0]
	raw, err := base64.RawURLEncoding.DecodeString(body)
	if err != nil {
		t.Fatalf("decode body: %v", err)
	}
	want := `{"sub":"42","mid":7,"env":"canary","iat":1000,"exp":1060,"jti":"`
	if !strings.HasPrefix(string(raw), want) {
		t.Fatalf("payload order mismatch: %s", raw)
	}
	// jti 必须满足 state 包的 36 位 hex-连字符形态，否则跨副本吊销写不进去。
	if len(claims.JTI) != 36 || strings.Count(claims.JTI, "-") != 4 {
		t.Fatalf("jti shape: %q", claims.JTI)
	}
}

func TestSelfCheckRejectsTampered(t *testing.T) {
	clock := time.Unix(1000, 0)
	svc := newSelfService(t, "canary", &clock)
	issued := svc.Issue(42, 7)
	parts := strings.Split(issued.Token, ".")

	var claims map[string]any
	payload, _ := base64.RawURLEncoding.DecodeString(parts[0])
	if err := json.Unmarshal(payload, &claims); err != nil {
		t.Fatalf("unmarshal payload: %v", err)
	}
	claims["mid"] = 1
	evilPayload, _ := json.Marshal(claims)
	evil := base64.RawURLEncoding.EncodeToString(evilPayload) + "." + parts[1]
	if _, err := svc.Verify(evil); !errors.Is(err, ErrBadSignature) {
		t.Fatalf("expected bad_signature, got %v", err)
	}

	if _, err := svc.Verify("garbage"); !errors.Is(err, ErrMalformed) {
		t.Fatalf("expected malformed, got %v", err)
	}
	if _, err := svc.Verify(""); !errors.Is(err, ErrMissing) {
		t.Fatalf("expected missing, got %v", err)
	}
}

func TestSelfCheckExpiryAndEnv(t *testing.T) {
	clock := time.Unix(1000, 0)
	svc := newSelfService(t, "canary", &clock)
	issued := svc.Issue(1, 1)

	clock = clock.Add(61 * time.Second)
	if _, err := svc.Verify(issued.Token); !errors.Is(err, ErrExpired) {
		t.Fatalf("expected expired, got %v", err)
	}

	clock = time.Unix(1000, 0)
	prod := newSelfService(t, "prod", &clock)
	if _, err := prod.Verify(issued.Token); !errors.Is(err, ErrWrongEnv) {
		t.Fatalf("expected wrong_env, got %v", err)
	}
	if prod.Issue(1, 1).Token == issued.Token {
		t.Fatal("prod token must differ from canary token")
	}
}

type selfRevoker struct {
	revoked map[string]int64
	fail    error
}

func (r *selfRevoker) IsRevoked(jti string) bool {
	_, ok := r.revoked[jti]
	return ok
}

func (r *selfRevoker) Revoke(jti string, exp int64) error {
	if r.fail != nil {
		return r.fail
	}
	r.revoked[jti] = exp
	return nil
}

func TestSelfCheckRevokeLocalAndShared(t *testing.T) {
	clock := time.Unix(1000, 0)
	backend := &selfRevoker{revoked: map[string]int64{}}
	svc, err := NewService(Dep{
		Secret:     selfSecret,
		Env:        "canary",
		TTL:        time.Minute,
		Now:        func() time.Time { return clock },
		Revocation: backend,
	})
	if err != nil {
		t.Fatalf("NewService: %v", err)
	}

	issued := svc.Issue(1, 1)
	if _, err := svc.Verify(issued.Token); err != nil {
		t.Fatalf("fresh token should verify: %v", err)
	}
	if ok, err := svc.RevokeAsync(context.Background(), issued.Token); err != nil || !ok {
		t.Fatalf("RevokeAsync: ok=%v err=%v", ok, err)
	}
	if _, err := svc.Verify(issued.Token); !errors.Is(err, ErrRevoked) {
		t.Fatalf("expected revoked, got %v", err)
	}
	if _, ok := backend.revoked[issued.JTI]; !ok {
		t.Fatal("shared backend must receive the revocation")
	}

	// 共享后端失败必须把错误透出，不能假装已跨副本生效。
	broken, err := NewService(Dep{
		Secret:     selfSecret,
		Env:        "canary",
		TTL:        time.Minute,
		Now:        func() time.Time { return clock },
		Revocation: &selfRevoker{revoked: map[string]int64{}, fail: errors.New("db down")},
	})
	if err != nil {
		t.Fatalf("NewService: %v", err)
	}
	another := broken.Issue(2, 2)
	if _, err := broken.RevokeAsync(context.Background(), another.Token); err == nil {
		t.Fatal("expected backend error to surface")
	}

	local := svc.Issue(3, 3)
	if !svc.Revoke(local.Token) {
		t.Fatal("Revoke should return true for valid token")
	}
	if _, err := svc.Verify(local.Token); !errors.Is(err, ErrRevoked) {
		t.Fatalf("expected revoked after sync revoke, got %v", err)
	}
	if svc.Revoke("not-a-token") {
		t.Fatal("Revoke must reject invalid token")
	}
}

func TestSelfCheckNewServiceValidation(t *testing.T) {
	if _, err := NewService(Dep{Secret: "short", Env: "canary"}); err == nil || err.Error() != "TMA_TOKEN_SECRET 缺失或过短" {
		t.Fatalf("short secret: %v", err)
	}
	if _, err := NewService(Dep{Secret: selfSecret}); err == nil || err.Error() != "TMA_ENV 缺失" {
		t.Fatalf("missing env: %v", err)
	}
}

func TestSelfCheckLimiter(t *testing.T) {
	clock := time.Unix(0, 0)
	allow := NewLimiter(2, 10*time.Second, func() time.Time { return clock })

	if !allow("a") || !allow("a") {
		t.Fatal("first two hits should pass")
	}
	if allow("a") {
		t.Fatal("third hit should be limited")
	}
	if !allow("b") {
		t.Fatal("different key has its own window")
	}
	clock = clock.Add(11 * time.Second)
	if !allow("a") {
		t.Fatal("window should reset")
	}
}
