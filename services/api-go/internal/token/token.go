// Package token 实现 TMA 会话令牌（T2.2）：base64url(payload).base64url(HMAC-SHA256(payload))。
//
// 令牌自带 sub(tg id)、mid(火鸟会员 id) 与 env，服务端不保存会话即可验签；
// 吊销与重放状态是显式的两件事：进程内 map + 可选的共享后端（多副本场景由 state 包实现）。
package token

import (
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"
)

// 错误值为英文小写下划线串，前端与日志可直接判别（与 Node 版 error 字段逐字一致）。
var (
	ErrMissing      = errors.New("missing")
	ErrMalformed    = errors.New("malformed")
	ErrBadSignature = errors.New("bad_signature")
	ErrWrongEnv     = errors.New("wrong_env")
	ErrExpired      = errors.New("expired")
	ErrRevoked      = errors.New("revoked")
)

// DefaultTTL 对应 Node 的 ttlSeconds=900。
const DefaultTTL = 900 * time.Second

// Revoker 是共享吊销后端（跨副本生效）。state.RevocationStore 满足该接口。
// IsRevoked 必须在验证路径上同步返回，因此实现方应只读本地快照，不做网络/DB 往返。
type Revoker interface {
	IsRevoked(jti string) bool
	Revoke(jti string, exp int64) error
}

// Dep 是构造令牌服务的依赖。Secret/Env 必填，其余零值即默认行为。
type Dep struct {
	Secret     string
	Env        string
	TTL        time.Duration
	Now        func() time.Time
	Revocation Revoker
}

// Token 是签发结果，字段名与 Node 版 issue() 返回一致。
type Token struct {
	Token     string
	ExpiresAt int64
	JTI       string
}

// Claims 是验签通过的载荷。
type Claims struct {
	Sub string `json:"sub"`
	Mid int64  `json:"mid"`
	Env string `json:"env"`
	Iat int64  `json:"iat"`
	Exp int64  `json:"exp"`
	JTI string `json:"jti"`
}

// Service 是并发安全的令牌服务。
type Service struct {
	secret     string
	env        string
	ttlSeconds int64
	now        func() time.Time
	revocation Revoker

	mu      sync.RWMutex
	revoked map[string]int64 // jti -> exp
}

// NewService 校验配置并返回服务。secret 过短等同于缺失：短密钥可被离线爆破，
// 一旦被爆破攻击者就能伪造任意会员身份。
func NewService(d Dep) (*Service, error) {
	if len(d.Secret) < 16 {
		return nil, errors.New("TMA_TOKEN_SECRET 缺失或过短")
	}
	if d.Env == "" {
		return nil, errors.New("TMA_ENV 缺失")
	}
	ttl := d.TTL
	if ttl <= 0 {
		ttl = DefaultTTL
	}
	now := d.Now
	if now == nil {
		now = time.Now
	}
	return &Service{
		secret:     d.Secret,
		env:        d.Env,
		ttlSeconds: int64(ttl / time.Second),
		now:        now,
		revocation: d.Revocation,
		revoked:    make(map[string]int64),
	}, nil
}

// Issue 签发令牌。payload 的字段顺序固定为 sub/mid/env/iat/exp/jti，
// 否则同一输入会产出不同字节串，会让「同 payload 比对」类测试随机失败。
func (s *Service) Issue(tgID, memberID int64) Token {
	iat := s.now().Unix()
	p := Claims{
		Sub: fmt.Sprintf("%d", tgID),
		Mid: memberID,
		Env: s.env,
		Iat: iat,
		Exp: iat + s.ttlSeconds,
		JTI: newUUID(),
	}
	payload, _ := json.Marshal(p) // 纯字符串/整数结构，不会失败
	body := base64.RawURLEncoding.EncodeToString(payload)
	sig := s.sign(body)
	return Token{
		Token:     body + "." + base64.RawURLEncoding.EncodeToString(sig),
		ExpiresAt: p.Exp,
		JTI:       p.JTI,
	}
}

// Verify 验签并检查环境、有效期与吊销状态。失败返回上面的哨兵错误。
func (s *Service) Verify(raw string) (Claims, error) {
	if raw == "" {
		return Claims{}, ErrMissing
	}
	parts := strings.Split(raw, ".")
	if len(parts) != 2 {
		return Claims{}, ErrMalformed
	}
	expected := s.sign(parts[0])
	given, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return Claims{}, ErrMalformed
	}
	if len(given) != len(expected) || !hmac.Equal(given, expected) {
		return Claims{}, ErrBadSignature
	}

	payload, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return Claims{}, ErrMalformed
	}
	var claims Claims
	if err := json.Unmarshal(payload, &claims); err != nil {
		return Claims{}, ErrMalformed
	}
	if claims.Env != s.env {
		return Claims{}, ErrWrongEnv
	}
	if claims.Exp <= s.now().Unix() {
		return Claims{}, ErrExpired
	}
	s.purge()
	if s.isRevoked(claims.JTI) {
		return Claims{}, ErrRevoked
	}
	return claims, nil
}

// Revoke 只写进程内状态（单副本语义）。
func (s *Service) Revoke(raw string) bool {
	claims, err := s.Verify(raw)
	if err != nil {
		return false
	}
	s.mu.Lock()
	s.revoked[claims.JTI] = claims.Exp
	s.mu.Unlock()
	return true
}

// RevokeAsync 同时写本地与共享后端。共享后端失败必须把错误抛给调用方——
// 静默吞掉会让调用方误以为令牌已在全集群失效，实际只在本副本失效。
func (s *Service) RevokeAsync(ctx context.Context, raw string) (bool, error) {
	claims, err := s.Verify(raw)
	if err != nil {
		return false, nil
	}
	s.mu.Lock()
	s.revoked[claims.JTI] = claims.Exp
	s.mu.Unlock()
	if s.revocation != nil {
		if err := s.revocation.Revoke(claims.JTI, claims.Exp); err != nil {
			return true, err
		}
	}
	return true, nil
}

func (s *Service) isRevoked(jti string) bool {
	s.mu.RLock()
	_, local := s.revoked[jti]
	s.mu.RUnlock()
	if local {
		return true
	}
	return s.revocation != nil && s.revocation.IsRevoked(jti)
}

func (s *Service) purge() {
	now := s.now().Unix()
	s.mu.Lock()
	for jti, exp := range s.revoked {
		if exp <= now {
			delete(s.revoked, jti)
		}
	}
	s.mu.Unlock()
}

func (s *Service) sign(body string) []byte {
	m := hmac.New(sha256.New, []byte(s.secret))
	m.Write([]byte(body))
	return m.Sum(nil)
}

// newUUID 生成 RFC 4122 v4（小写、带连字符），满足 state 包对 jti 的 `^[0-9a-f-]{36}$` 校验。
func newUUID() string {
	var b [16]byte
	if _, err := rand.Read(b[:]); err != nil {
		// crypto/rand 失败意味着系统熵源不可用，此时继续签发可预测的 jti 更危险。
		panic("token: crypto/rand unavailable: " + err.Error())
	}
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	s := hex.EncodeToString(b[:])
	return s[0:8] + "-" + s[8:12] + "-" + s[12:16] + "-" + s[16:20] + "-" + s[20:32]
}

// NewLimiter 构造固定窗口计数器：同一个 key 在 window 内最多 max 次。
// 返回闭包而不是结构体，是为了让调用方直接把它注入成 AllowLogin/AllowReplay 回调。
func NewLimiter(max int, window time.Duration, now func() time.Time) func(key string) bool {
	if now == nil {
		now = time.Now
	}
	var (
		mu   sync.Mutex
		hits = make(map[string]limiterHit)
	)
	return func(key string) bool {
		mu.Lock()
		defer mu.Unlock()
		t := now()
		h, ok := hits[key]
		if !ok || !h.resetAt.After(t) {
			hits[key] = limiterHit{count: 1, resetAt: t.Add(window)}
			// 只在新增 key 时做一次清理：map 增长到万级说明有人在扫 key，
			// 无界增长会把内存变成攻击面。
			if len(hits) > 10000 {
				for k, v := range hits {
					if !v.resetAt.After(t) {
						delete(hits, k)
					}
				}
			}
			return true
		}
		if h.count >= max {
			return false
		}
		h.count++
		hits[key] = h
		return true
	}
}

type limiterHit struct {
	count   int
	resetAt time.Time
}
