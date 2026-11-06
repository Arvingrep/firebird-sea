// 契约护栏（不是临时自检）：用例锁定与 Node 版逐字对齐的对外行为 —— 验签口径、状态码、
// 错误码与 JSON 字段名。改实现前先看这里；合并前不要按临时文件删。
package tgauth

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"testing"
	"time"
)

const selfBotToken = "test-bot-token-not-a-secret"

// signSelf 复刻 Node 测试里的 sign()：排序后用 \n 连接，再套 WebAppData 密钥。
func signSelf(t *testing.T, fields map[string]string) string {
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
	check := strings.Join(lines, "\n")
	inner := hmac.New(sha256.New, []byte("WebAppData"))
	inner.Write([]byte(selfBotToken))
	outer := hmac.New(sha256.New, inner.Sum(nil))
	outer.Write([]byte(check))
	fields = cloneWithHash(fields, hex.EncodeToString(outer.Sum(nil)))
	values := url.Values{}
	for k, v := range fields {
		values.Set(k, v)
	}
	return values.Encode()
}

func cloneWithHash(fields map[string]string, hash string) map[string]string {
	out := make(map[string]string, len(fields)+1)
	for k, v := range fields {
		out[k] = v
	}
	out["hash"] = hash
	return out
}

func TestSelfCheckValidSignature(t *testing.T) {
	authDate := time.Now().Unix()
	initData := signSelf(t, map[string]string{
		"auth_date": itoa(authDate),
		"user":      `{"id":42,"first_name":"A"}`,
	})
	got := Validate(initData, selfBotToken, Options{})
	if !got.Valid || got.User == nil || got.User.ID != 42 {
		t.Fatalf("expected valid with user 42, got %+v", got)
	}
	if got.Hash == "" || len(got.Hash) != 64 {
		t.Fatalf("expected lowercased hash, got %q", got.Hash)
	}
}

func TestSelfCheckRejectsTamperedAndWrongToken(t *testing.T) {
	authDate := itoa(time.Now().Unix())
	good := signSelf(t, map[string]string{"auth_date": authDate, "query_id": "q1", "user": `{"id":1}`})
	if !Validate(good, selfBotToken, Options{}).Valid {
		t.Fatal("expected untampered initData to pass")
	}
	tampered := strings.Replace(good, "q1", "q2", 1)
	if Validate(tampered, selfBotToken, Options{}).Valid {
		t.Fatal("expected tampered query_id to fail")
	}
	clean := signSelf(t, map[string]string{"auth_date": authDate, "user": `{"id":1}`})
	if Validate(clean, "other-token", Options{}).Valid {
		t.Fatal("expected wrong bot token to fail")
	}
}

func TestSelfCheckSignatureFieldParticipates(t *testing.T) {
	fields := map[string]string{
		"auth_date": itoa(time.Now().Unix()),
		"user":      `{"id":7}`,
		"signature": "AAAA-opaque-signature-value",
	}
	initData := signSelf(t, fields)
	if got := Validate(initData, selfBotToken, Options{}); !got.Valid {
		t.Fatalf("expected initData with signature field to verify, got %q", got.Error)
	}
	tampered := strings.Replace(initData, "AAAA-opaque", "BBBB-opaque", 1)
	if Validate(tampered, selfBotToken, Options{}).Valid {
		t.Fatal("expected tampered signature field to fail")
	}
}

func TestSelfCheckTimeWindow(t *testing.T) {
	fresh := itoa(time.Now().Add(-5 * time.Minute).Unix())
	if got := Validate(signSelf(t, map[string]string{"auth_date": fresh, "user": `{"id":7}`}), selfBotToken, Options{}); !got.Valid {
		t.Fatalf("expected fresh initData to pass, got %q", got.Error)
	}
	old := itoa(time.Now().Add(-3601 * time.Second).Unix())
	if got := Validate(signSelf(t, map[string]string{"auth_date": old, "user": `{"id":7}`}), selfBotToken, Options{}); got.Error != "initData expired" {
		t.Fatalf("expected expired, got %q", got.Error)
	}
	future := itoa(time.Now().Add(3600 * time.Second).Unix())
	if got := Validate(signSelf(t, map[string]string{"auth_date": future, "user": `{"id":7}`}), selfBotToken, Options{}); got.Error != "initData auth_date is in the future" {
		t.Fatalf("expected future rejection, got %q", got.Error)
	}
	withinSkew := itoa(time.Now().Add(30 * time.Second).Unix())
	if got := Validate(signSelf(t, map[string]string{"auth_date": withinSkew, "user": `{"id":7}`}), selfBotToken, Options{}); !got.Valid {
		t.Fatalf("expected 30s skew to pass, got %q", got.Error)
	}
}

func TestSelfCheckFieldErrors(t *testing.T) {
	cases := []struct {
		name     string
		initData string
		want     string
	}{
		{"empty", "", "Missing initData"},
		{"no hash", "auth_date=1", "Missing or malformed hash parameter"},
		{"short hash", "auth_date=1&hash=zz", "Missing or malformed hash parameter"},
	}
	for _, c := range cases {
		if got := Validate(c.initData, selfBotToken, Options{}); got.Error != c.want {
			t.Errorf("%s: want %q, got %q", c.name, c.want, got.Error)
		}
	}
	if got := Validate("auth_date=1", "", Options{}); got.Error != "Server auth not configured" {
		t.Errorf("missing bot token: got %q", got.Error)
	}

	// 缺 auth_date / user / user.id
	noAuthDate := signSelf(t, map[string]string{"user": `{"id":7}`})
	if got := Validate(noAuthDate, selfBotToken, Options{}); got.Error != "Missing auth_date" {
		t.Errorf("missing auth_date: got %q", got.Error)
	}
	noUser := signSelf(t, map[string]string{"auth_date": itoa(time.Now().Unix())})
	if got := Validate(noUser, selfBotToken, Options{}); got.Error != "Missing user.id" {
		t.Errorf("missing user: got %q", got.Error)
	}
	badUser := signSelf(t, map[string]string{"auth_date": itoa(time.Now().Unix()), "user": `{"id":"abc"}`})
	if got := Validate(badUser, selfBotToken, Options{}); got.Error != "Missing user.id" {
		t.Errorf("string id: got %q", got.Error)
	}
	brokenJSON := signSelf(t, map[string]string{"auth_date": itoa(time.Now().Unix()), "user": `{oops`})
	if got := Validate(brokenJSON, selfBotToken, Options{}); got.Error != "Malformed user field" {
		t.Errorf("malformed user: got %q", got.Error)
	}
	// 42.5 不是 safe integer
	floatID := signSelf(t, map[string]string{"auth_date": itoa(time.Now().Unix()), "user": `{"id":42.5}`})
	if got := Validate(floatID, selfBotToken, Options{}); got.Error != "Missing user.id" {
		t.Errorf("float id: got %q", got.Error)
	}
}

func TestSelfCheckPercentAndPlusDecoding(t *testing.T) {
	// user 里带空格时，客户端会编码成 %20 或 +；两种都必须还原成同一个签名串。
	authDate := itoa(time.Now().Unix())
	fields := map[string]string{"auth_date": authDate, "user": `{"id":7,"first_name":"A B"}`}
	initData := signSelf(t, fields)
	if got := Validate(initData, selfBotToken, Options{}); !got.Valid {
		t.Fatalf("expected url-escaped initData to verify, got %q", got.Error)
	}
	if p := decodeComponent("A+B%20C"); p != "A B C" {
		t.Fatalf("decodeComponent: got %q", p)
	}
	if p := decodeComponent("100%"); p != "100%" {
		t.Fatalf("invalid percent sequence should be kept, got %q", p)
	}
}

func itoa(v int64) string { return strconv.FormatInt(v, 10) }

// signSelfRaw 用显式的有序参数列表计算签名（支持重复 key），dataCheckString 仍是
// 「除 hash 外的全部 k=v 行排序后 \n 连接」——与 URLSearchParams.entries() 一致。
func signSelfRaw(t *testing.T, pairs [][2]string) string {
	t.Helper()
	lines := make([]string, 0, len(pairs))
	for _, p := range pairs {
		if p[0] == "hash" {
			continue
		}
		lines = append(lines, p[0]+"="+p[1])
	}
	sort.Strings(lines)
	inner := hmac.New(sha256.New, []byte("WebAppData"))
	inner.Write([]byte(selfBotToken))
	outer := hmac.New(sha256.New, inner.Sum(nil))
	outer.Write([]byte(strings.Join(lines, "\n")))
	hash := hex.EncodeToString(outer.Sum(nil))

	parts := make([]string, 0, len(pairs)+1)
	for _, p := range pairs {
		parts = append(parts, url.QueryEscape(p[0])+"="+url.QueryEscape(p[1]))
	}
	parts = append(parts, "hash="+hash)
	return strings.Join(parts, "&")
}

// 重复 key 必须按「首个值」判定（URLSearchParams.get 语义）。取末个值会让攻击者
// 用一个重复的 auth_date/user 翻转服务端判定方向。
func TestSelfCheckDuplicateKeysFollowFirstValue(t *testing.T) {
	now := time.Now()
	oldDate := strconv.FormatInt(now.Add(-3601*time.Second).Unix(), 10)
	futureDate := strconv.FormatInt(now.Add(3600*time.Second).Unix(), 10)
	user := `{"id":7}`

	expiredFirst := signSelfRaw(t, [][2]string{
		{"auth_date", oldDate},
		{"auth_date", futureDate},
		{"user", user},
	})
	if got := Validate(expiredFirst, selfBotToken, Options{}); got.Error != "initData expired" {
		t.Fatalf("first auth_date wins: want expired, got %q", got.Error)
	}

	futureFirst := signSelfRaw(t, [][2]string{
		{"auth_date", futureDate},
		{"auth_date", oldDate},
		{"user", user},
	})
	if got := Validate(futureFirst, selfBotToken, Options{}); got.Error != "initData auth_date is in the future" {
		t.Fatalf("first auth_date wins: want future, got %q", got.Error)
	}

	nowDate := strconv.FormatInt(now.Unix(), 10)
	userFirst := signSelfRaw(t, [][2]string{
		{"auth_date", nowDate},
		{"user", `{"id":42}`},
		{"user", `{"id":99}`},
	})
	got := Validate(userFirst, selfBotToken, Options{})
	if !got.Valid || got.User == nil || got.User.ID != 42 {
		t.Fatalf("first user wins: got %+v", got)
	}
}
