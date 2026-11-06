// 契约护栏（不是临时自检）：用例锁定与 Node 版逐字对齐的对外行为。
// DB 路径需要真实 MySQL，这里只覆盖纯内存与校验分支；合并前不要按临时文件删。
package state

import (
	"context"
	"encoding/json"
	"testing"
	"time"
)

func TestSelfCheckMemoryIdempotencyLifecycle(t *testing.T) {
	clock := time.Unix(0, 0)
	store := NewMemoryIdempotencyStore(MemoryIdempotencyDep{
		TTL: 10 * time.Minute,
		Now: func() time.Time { return clock },
	})
	ctx := context.Background()

	first, err := store.Begin(ctx, "key-1")
	if err != nil || first.Status != IdemNew {
		t.Fatalf("first begin: %+v %v", first, err)
	}
	second, err := store.Begin(ctx, "key-1")
	if err != nil || second.Status != IdemPending {
		t.Fatalf("second begin: %+v %v", second, err)
	}
	if err := store.Finish(ctx, "key-1", map[string]any{"state": 100}); err != nil {
		t.Fatalf("finish: %v", err)
	}
	third, err := store.Begin(ctx, "key-1")
	if err != nil || third.Status != IdemDone {
		t.Fatalf("third begin: %+v %v", third, err)
	}
	var body map[string]any
	if err := json.Unmarshal(third.Body, &body); err != nil {
		t.Fatalf("body: %v", err)
	}
	if body["state"] != float64(100) {
		t.Fatalf("body mismatch: %v", body)
	}

	if err := store.Abort(ctx, "key-1"); err != nil {
		t.Fatalf("abort: %v", err)
	}
	after, err := store.Begin(ctx, "key-1")
	if err != nil || after.Status != IdemNew {
		t.Fatalf("after abort: %+v %v", after, err)
	}
}

func TestSelfCheckMemoryIdempotencyTTL(t *testing.T) {
	clock := time.Unix(0, 0)
	store := NewMemoryIdempotencyStore(MemoryIdempotencyDep{
		TTL: time.Minute,
		Now: func() time.Time { return clock },
	})
	ctx := context.Background()
	if _, err := store.Begin(ctx, "k"); err != nil {
		t.Fatalf("begin: %v", err)
	}
	clock = clock.Add(61 * time.Second)
	again, err := store.Begin(ctx, "k")
	if err != nil || again.Status != IdemNew {
		t.Fatalf("expired entry should be treated as new: %+v %v", again, err)
	}
}

func TestSelfCheckRevocationRejectsInvalidArgs(t *testing.T) {
	// 参数校验必须先于任何 DB 访问：这里故意传 nil db，非法入参不应触发 panic。
	store := NewRevocationStore(RevocationDep{})
	for _, jti := range []string{"", "not-a-uuid", "0123456789abcdef0123456789abcde"} {
		if err := store.Revoke(jti, 123); err == nil {
			t.Fatalf("jti %q should be rejected", jti)
		}
	}
	if err := store.Revoke("01234567-89ab-cdef-0123-456789abcdef", 0); err == nil {
		t.Fatal("non-positive exp should be rejected")
	}
	if store.IsRevoked("01234567-89ab-cdef-0123-456789abcdef") {
		t.Fatal("nothing should be revoked yet")
	}
}

func TestSelfCheckReplayCounterNeedsDB(t *testing.T) {
	counter := NewReplayCounter(ReplayDep{Max: 2, TTL: time.Hour})
	if _, err := counter.Allow(context.Background(), "h:"+repeatHex('a', 64)); err == nil {
		t.Fatal("expected db-not-configured error")
	}
}

func TestSelfCheckPatterns(t *testing.T) {
	if !hex64Pattern.MatchString(repeatHex('a', 64)) {
		t.Fatal("64 hex chars should match")
	}
	if hex64Pattern.MatchString(repeatHex('A', 64)) {
		t.Fatal("uppercase hex must not match (Node 语义)")
	}
	if jtiPattern.MatchString("0123456789abcdef0123456789abcdef") {
		t.Fatal("uuid-less 32-hex string must not match")
	}
	if !jtiPattern.MatchString("01234567-89ab-cdef-0123-456789abcdef") {
		t.Fatal("uuid should match")
	}
}

func repeatHex(c byte, n int) string {
	out := make([]byte, n)
	for i := range out {
		out[i] = c
	}
	return string(out)
}
