package token

import (
	"testing"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/tgauth"
)

// TestSelfCheckNodeTokenParity 用 Node 版真实产出的令牌/initData 反向校验 Go 实现，
// 确认 base64url 无 padding、字段顺序、WebAppData 双层 HMAC 与 Node 完全一致。
func TestSelfCheckNodeTokenParity(t *testing.T) {
	jsToken := "eyJzdWIiOiI0MiIsIm1pZCI6NywiZW52IjoiY2FuYXJ5IiwiaWF0IjoxMDAwLCJleHAiOjEwNjAsImp0aSI6ImRhOWRmNGZjLTkyMDktNGNmMC1iNzk3LTFkYjRjNDg2OTQzNSJ9.wMl7nWnb_BUgmgEuKIRz91TQNBgbrLVANfI0ssDjC2M"
	svc, err := NewService(Dep{Secret: "parity-secret-0123456789", Env: "canary", TTL: 60 * time.Second, Now: func() time.Time { return time.Unix(1000, 0) }})
	if err != nil {
		t.Fatal(err)
	}
	claims, err := svc.Verify(jsToken)
	if err != nil {
		t.Fatalf("go verify js token: %v", err)
	}
	if claims.Sub != "42" || claims.Mid != 7 || claims.JTI != "da9df4fc-9209-4cf0-b797-1db4c4869435" {
		t.Fatalf("claims mismatch: %+v", claims)
	}

	initData := "auth_date=1700000000&signature=opaque-sig&user=%7B%22id%22%3A42%2C%22first_name%22%3A%22A%22%7D&hash=c3b9c37813764453a4cfc2706daea7ecd795dee29fb669236f37c3391b60d835"
	got := tgauth.Validate(initData, "parity-bot-token", tgauth.Options{Now: func() time.Time { return time.Unix(1700000000, 0) }})
	if !got.Valid {
		t.Fatalf("go validate js initData: %q", got.Error)
	}
	if got.Hash != "c3b9c37813764453a4cfc2706daea7ecd795dee29fb669236f37c3391b60d835" || got.AuthDate != 1700000000 || got.User.ID != 42 {
		t.Fatalf("result mismatch: %+v", got)
	}
}
