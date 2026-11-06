// 契约护栏（不是临时自检）：用例锁定与 Node 版逐字对齐的对外行为 —— 状态码、错误码、
// JSON 字段名与字段顺序、空数组形态。改实现前先看这里；合并前不要按临时文件删。
package addrshare

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/migrate"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/token"
	_ "github.com/go-sql-driver/mysql"
)

const selfSecret = "addrshare-self-check-secret-0123"
const selfBotToken = "123456:self-check-bot-token"

func selfNow() time.Time { return time.Date(2026, 11, 6, 12, 0, 0, 0, time.UTC) }

func mustTokens(t *testing.T) *token.Service {
	t.Helper()
	service, err := token.NewService(token.Dep{Secret: selfSecret, Env: "test", Now: selfNow})
	if err != nil {
		t.Fatalf("token service: %v", err)
	}
	return service
}

// newRouter 构造一个不接 DB 的路由：只用于跑「校验与限流」这些前置分支。
func newRouter(t *testing.T, dep Dep) *Router {
	t.Helper()
	if dep.Tokens == nil {
		dep.Tokens = mustTokens(t)
	}
	if dep.Now == nil {
		dep.Now = selfNow
	}
	router, err := New(dep)
	if err != nil {
		t.Fatalf("new router: %v", err)
	}
	return router
}

func TestSelfCheckClip(t *testing.T) {
	cases := []struct {
		name  string
		value any
		limit int
		want  string
	}{
		{"plain", "  中山路 1 号  ", StreetLimit, "中山路 1 号"},
		// 换行/制表符先压成空格：快照一旦被写进 TSV 或单行日志，残留换行会劈开记录。
		{"newlines", "中山路\r\n1 号\t3 楼", StreetLimit, "中山路 1 号 3 楼"},
		{"numbers", 12.5, CoordLimit, "12.5"},
		{"integral-number", 121.0, CoordLimit, "121"},
		// JS 在 |v| < 1e21 的整数上输出完整十进制，不能写成 1e+06。
		{"big-integral", 1000000.0, CoordLimit, "1000000"},
		{"bool", true, AreaCodeLimit, "true"},
		{"null", nil, AreaCodeLimit, ""},
		{"object", map[string]any{"k": "v"}, 20, "[object Object]"},
		{"array", []any{1.0, 2.0}, AreaCodeLimit, "1,2"},
	}
	for _, c := range cases {
		if got := clip(c.value, c.limit); got != c.want {
			t.Errorf("%s: clip = %q, want %q", c.name, got, c.want)
		}
	}

	long := strings.Repeat("地", 400)
	if got := clip(long, StreetLimit); len([]rune(got)) != StreetLimit {
		t.Errorf("truncation: got %d runes, want %d", len([]rune(got)), StreetLimit)
	}
}

func TestSelfCheckTokenPattern(t *testing.T) {
	valid := []string{strings.Repeat("0", 32), "0123456789abcdef0123456789abcdef"}
	for _, value := range valid {
		if !tokenRe.MatchString(value) {
			t.Errorf("%q should pass", value)
		}
	}
	bad := []string{
		"", strings.Repeat("0", 31), strings.Repeat("0", 33),
		strings.Repeat("A", 32), // 大写不是 randomBytes().toString('hex') 的输出
		strings.Repeat("g", 32),
	}
	for _, value := range bad {
		if tokenRe.MatchString(value) {
			t.Errorf("%q should be rejected", value)
		}
	}
	// newToken 必须产出 32 位 hex 且不重复。
	seen := map[string]bool{}
	for i := 0; i < 100; i++ {
		value, err := newToken()
		if err != nil {
			t.Fatalf("newToken: %v", err)
		}
		if !tokenRe.MatchString(value) {
			t.Fatalf("newToken produced %q", value)
		}
		if seen[value] {
			t.Fatalf("duplicate token %q", value)
		}
		seen[value] = true
	}
}

func TestSelfCheckShareGuards(t *testing.T) {
	issued := mustTokens(t).Issue(1001, 77)

	post := func(router *Router, body string, bearer string) *httptest.ResponseRecorder {
		request := httptest.NewRequest(http.MethodPost, "/addr/share", strings.NewReader(body))
		// body 解析方式由 Content-Type 决定（与 express 一致）：不带类型时 body 视为空。
		if body != "" {
			request.Header.Set("Content-Type", "application/json")
		}
		if bearer != "" {
			request.Header.Set("Authorization", "Bearer "+bearer)
		}
		recorder := httptest.NewRecorder()
		router.Share(recorder, request)
		return recorder
	}

	// 限流最先执行：连令牌都不看（这里故意不带 Bearer，仍必须是 429 而不是 401）。
	router := newRouter(t, Dep{AllowCreate: func(string) bool { return false }})
	recorder := post(router, `{"street":"a","lat":"1","lng":"2"}`, "")
	if recorder.Code != http.StatusTooManyRequests || !strings.Contains(recorder.Body.String(), `"RATE_LIMITED"`) {
		t.Fatalf("rate limit: %d %s", recorder.Code, recorder.Body.String())
	}

	// 无 Bearer / 坏 Bearer 一律 401，文案与 Node 一致。
	router = newRouter(t, Dep{})
	for _, bearer := range []string{"", "garbage", "a.b.c"} {
		recorder = post(router, `{"street":"a","lat":"1","lng":"2"}`, bearer)
		if recorder.Code != http.StatusUnauthorized {
			t.Fatalf("bearer %q: status = %d, want 401", bearer, recorder.Code)
		}
		if !strings.Contains(recorder.Body.String(), "Please reopen the Mini App from Telegram") {
			t.Fatalf("bearer %q: body = %s", bearer, recorder.Body.String())
		}
	}

	// street / lat / lng 缺一即 400 INVALID。
	for _, body := range []string{
		`{"lat":"1","lng":"2"}`,
		`{"street":"a","lng":"2"}`,
		`{"street":"a","lat":"1"}`,
		`{"street":"   ","lat":"1","lng":"2"}`,
		``,
		`{oops`,
	} {
		recorder = post(router, body, issued.Token)
		if recorder.Code != http.StatusBadRequest || !strings.Contains(recorder.Body.String(), `"INVALID"`) {
			t.Fatalf("body %q: status = %d, body = %s", body, recorder.Code, recorder.Body.String())
		}
	}

	// 令牌里 mid 非法 → 403 NO_MEMBER（取中间态：签发 mid=0 的令牌）。
	noMember := mustTokens(t).Issue(1001, 0)
	recorder = post(router, `{"street":"a","lat":"1","lng":"2"}`, noMember.Token)
	if recorder.Code != http.StatusForbidden || !strings.Contains(recorder.Body.String(), `"NO_MEMBER"`) {
		t.Fatalf("no member: %d %s", recorder.Code, recorder.Body.String())
	}
}

func TestSelfCheckSharedGuards(t *testing.T) {
	router := newRouter(t, Dep{AllowRead: func(string) bool { return false }})
	recorder := httptest.NewRecorder()
	router.Shared(recorder, httptest.NewRequest(http.MethodGet, "/addr/shared/"+strings.Repeat("a", 32), nil))
	if recorder.Code != http.StatusTooManyRequests {
		t.Fatalf("status = %d, want 429", recorder.Code)
	}

	// 非法 token 直接 404，且响应体里没有 message 字段（与 Node 逐字一致）。
	router = newRouter(t, Dep{})
	for _, path := range []string{
		"/addr/shared/",
		"/addr/shared/xyz",
		"/addr/shared/" + strings.Repeat("A", 32),
		"/addr/shared/" + strings.Repeat("a", 31),
	} {
		recorder = httptest.NewRecorder()
		router.Shared(recorder, httptest.NewRequest(http.MethodGet, path, nil))
		if recorder.Code != http.StatusNotFound {
			t.Fatalf("%s: status = %d, want 404", path, recorder.Code)
		}
		if got := strings.TrimSpace(recorder.Body.String()); got != `{"success":false,"error":{"code":"NOT_FOUND"}}` {
			t.Fatalf("%s: body = %s", path, got)
		}
	}
}

func TestSelfCheckClientKey(t *testing.T) {
	request := httptest.NewRequest(http.MethodPost, "/addr/share", nil)
	request.RemoteAddr = "203.0.113.9:5555"

	// 未声明信任跳数：只认 RemoteAddr，XFF 一律忽略（客户端可伪造）。
	router := newRouter(t, Dep{})
	request.Header.Set("X-Forwarded-For", "1.1.1.1")
	if got := router.ClientKey(request); got != "203.0.113.9" {
		t.Fatalf("no trust: got %q", got)
	}

	// 信任 1 跳：取链条里倒数第 2 个（Traefik 追加的那一段）。
	oneHop := newRouter(t, Dep{TrustProxyHops: 1})
	request.Header.Set("X-Forwarded-For", "1.1.1.1, 2.2.2.2")
	if got := oneHop.ClientKey(request); got != "2.2.2.2" {
		t.Fatalf("1 hop: got %q", got)
	}

	// 信任 2 跳。
	twoHops := newRouter(t, Dep{TrustProxyHops: 2})
	if got := twoHops.ClientKey(request); got != "1.1.1.1" {
		t.Fatalf("2 hops: got %q", got)
	}

	// 链条不够长时退回 RemoteAddr，不能让空字符串变成所有人共享的桶。
	if got := newRouter(t, Dep{TrustProxyHops: 9}).ClientKey(request); got != "203.0.113.9" {
		t.Fatalf("over-long hops: got %q", got)
	}
}

func TestSelfCheckResponseShapes(t *testing.T) {
	// url 未就绪时必须是 null 而不是空串：前端据此降级为纯文本分享。
	raw, err := json.Marshal(shareResponse{Success: true, Data: shareData{Token: "abc", ExpiresAt: 1700000000}})
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	if got := string(raw); got != `{"success":true,"data":{"token":"abc","url":null,"expiresAt":1700000000}}` {
		t.Fatalf("share body = %s", got)
	}

	link := "https://t.me/demo_bot?startapp=addr_abc"
	raw, _ = json.Marshal(shareResponse{Success: true, Data: shareData{Token: "abc", URL: &link, ExpiresAt: 1}})
	if !strings.Contains(string(raw), `"url":"https://t.me/demo_bot?startapp=addr_abc"`) {
		t.Fatalf("share body = %s", raw)
	}

	// 读取响应把快照原样透传（键序与落库一致，前端按字段名取值）。
	raw, _ = json.Marshal(sharedResponse{Success: true, Data: json.RawMessage(`{"street":"a","areaCode":"1"}`)})
	if got := string(raw); got != `{"success":true,"data":{"street":"a","areaCode":"1"}}` {
		t.Fatalf("shared body = %s", got)
	}
}

// —— 以下是需要真实 MariaDB 的集成自检：设置 FBS_TEST_DSN 才跑 ——

func openTestDB(t *testing.T) *sql.DB {
	t.Helper()
	dsn := os.Getenv("FBS_TEST_DSN")
	if dsn == "" {
		t.Skip("FBS_TEST_DSN 未设置，跳过集成自检")
	}
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		t.Fatalf("open db: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })
	if err := db.Ping(); err != nil {
		t.Fatalf("ping db: %v", err)
	}
	migrations, err := filepath.Abs(filepath.Join("..", "..", "..", "api", "migrations"))
	if err != nil {
		t.Fatalf("resolve migrations: %v", err)
	}
	if _, err := migrate.Run(context.Background(), db, migrations); err != nil {
		t.Fatalf("migrate: %v", err)
	}
	return db
}

func TestSelfCheckStoreAndLookupRoundTrip(t *testing.T) {
	db := openTestDB(t)
	const uid = int64(9900000000001)
	_, _ = db.Exec("DELETE FROM fbs_addr_share WHERE uid = ?", uid)
	t.Cleanup(func() { _, _ = db.Exec("DELETE FROM fbs_addr_share WHERE uid = ?", uid) })

	now := selfNow()
	router := newRouter(t, Dep{DB: db})

	// 引号、反斜杠、中文、换行压缩后的内容必须逐字还原。
	payload := Payload{
		Street:   `"中山路" 1 号 \ 侧门`,
		Address:  `楼栋 A/B "后门"`,
		Lat:      "14.5995123",
		Lng:      "120.9842195",
		AreaCode: "1",
	}
	tokenValue, err := newToken()
	if err != nil {
		t.Fatalf("token: %v", err)
	}
	if err := router.store(context.Background(), tokenValue, uid, payload, now, now.Add(DefaultTTL)); err != nil {
		t.Fatalf("store: %v", err)
	}

	raw, err := router.lookup(context.Background(), tokenValue)
	if err != nil {
		t.Fatalf("lookup: %v", err)
	}
	var got Payload
	if err := json.Unmarshal(raw, &got); err != nil {
		t.Fatalf("corrupt payload %q: %v", string(raw), err)
	}
	if got != payload {
		t.Fatalf("round trip mismatch:\n got: %+v\nwant: %+v", got, payload)
	}
	// 落库必须是紧凑 JSON，而不是被转义成 \" 的字符串。
	if !strings.Contains(string(raw), `"street":"\"中山路\" 1 号 \\ 侧门"`) {
		t.Fatalf("unexpected stored payload: %s", string(raw))
	}

	// 未过期的 token 可读；把时间推到过期之后必须读不到（不是返回空快照）。
	if found, err := router.lookup(context.Background(), tokenValue); err != nil || len(found) == 0 {
		t.Fatalf("token should be readable before expiry: %v", err)
	}
	expired := router
	expired.now = func() time.Time { return now.Add(DefaultTTL + time.Second) }
	if found, err := expired.lookup(context.Background(), tokenValue); err != nil || len(found) != 0 {
		t.Fatalf("token must be unreadable after expiry: %v %q", err, string(found))
	}

	// 未知 token 返回 (nil,nil)，由 handler 转 404。
	if found, err := router.lookup(context.Background(), strings.Repeat("f", 32)); err != nil || found != nil {
		t.Fatalf("unknown token: %v %q", err, string(found))
	}
}

func TestSelfCheckTrimKeepsLatest20(t *testing.T) {
	db := openTestDB(t)
	const uid = int64(9900000000002)
	_, _ = db.Exec("DELETE FROM fbs_addr_share WHERE uid = ?", uid)
	t.Cleanup(func() { _, _ = db.Exec("DELETE FROM fbs_addr_share WHERE uid = ?", uid) })

	router := newRouter(t, Dep{DB: db})
	base := selfNow()
	tokens := make([]string, 0, MaxPerUID+5)
	for i := 0; i < MaxPerUID+5; i++ {
		tokenValue, err := newToken()
		if err != nil {
			t.Fatalf("token: %v", err)
		}
		createdAt := base.Add(time.Duration(i) * time.Second)
		payload := Payload{Street: fmt.Sprintf("路 %d", i), Lat: "1", Lng: "2", AreaCode: "1"}
		if err := router.store(context.Background(), tokenValue, uid, payload, createdAt, createdAt.Add(DefaultTTL)); err != nil {
			t.Fatalf("store %d: %v", i, err)
		}
		tokens = append(tokens, tokenValue)
	}

	var count int
	if err := db.QueryRow("SELECT COUNT(*) FROM fbs_addr_share WHERE uid = ?", uid).Scan(&count); err != nil {
		t.Fatalf("count: %v", err)
	}
	if count != MaxPerUID {
		t.Fatalf("kept %d rows, want %d", count, MaxPerUID)
	}

	// 保留的是最近 MaxPerUID 条：最早的 5 条必须已被裁掉。
	for index, tokenValue := range tokens {
		found, err := router.lookup(context.Background(), tokenValue)
		if err != nil {
			t.Fatalf("lookup %d: %v", index, err)
		}
		shouldKeep := index >= 5
		if shouldKeep && len(found) == 0 {
			t.Fatalf("token %d should be kept", index)
		}
		if !shouldKeep && len(found) != 0 {
			t.Fatalf("token %d should have been trimmed", index)
		}
	}
}

func TestSelfCheckPurgeRemovesExpired(t *testing.T) {
	db := openTestDB(t)
	const uid = int64(9900000000003)
	_, _ = db.Exec("DELETE FROM fbs_addr_share WHERE uid = ?", uid)
	t.Cleanup(func() { _, _ = db.Exec("DELETE FROM fbs_addr_share WHERE uid = ?", uid) })

	now := selfNow()
	router := newRouter(t, Dep{DB: db})
	live, _ := newToken()
	dead, _ := newToken()
	payload := Payload{Street: "a", Lat: "1", Lng: "2", AreaCode: "1"}
	if err := router.store(context.Background(), live, uid, payload, now, now.Add(DefaultTTL)); err != nil {
		t.Fatalf("store live: %v", err)
	}
	if err := router.store(context.Background(), dead, uid, payload, now.Add(-2*time.Hour), now.Add(-time.Hour)); err != nil {
		t.Fatalf("store dead: %v", err)
	}

	router.maybePurge(context.Background(), now)
	var count int
	if err := db.QueryRow("SELECT COUNT(*) FROM fbs_addr_share WHERE uid = ?", uid).Scan(&count); err != nil {
		t.Fatalf("count: %v", err)
	}
	if count != 1 {
		t.Fatalf("kept %d rows after purge, want 1", count)
	}

	// 节流：10 分钟内再调用不应再打库（这里通过「把 now 往前挪一点仍被跳过」间接验证）。
	router.maybePurge(context.Background(), now.Add(PurgeInterval-time.Second))
	if err := db.QueryRow("SELECT COUNT(*) FROM fbs_addr_share WHERE uid = ?", uid).Scan(&count); err != nil {
		t.Fatalf("count: %v", err)
	}
	if count != 1 {
		t.Fatalf("throttled purge should be a no-op, got %d", count)
	}
}

// 端到端：Share 写库 → Shared 读出，一次走完两个 handler。
func TestSelfCheckShareThenRead(t *testing.T) {
	db := openTestDB(t)
	const uid = int64(9900000000004)
	_, _ = db.Exec("DELETE FROM fbs_addr_share WHERE uid = ?", uid)
	t.Cleanup(func() { _, _ = db.Exec("DELETE FROM fbs_addr_share WHERE uid = ?", uid) })

	// getMe 用假客户端：返回固定 username，避免测试依赖外网。
	client := &http.Client{Transport: roundTripFunc(func(request *http.Request) (*http.Response, error) {
		if !strings.Contains(request.URL.Path, "/getMe") {
			t.Fatalf("unexpected request: %s", request.URL.String())
		}
		body := `{"ok":true,"result":{"username":"demo_shop_bot"}}`
		return &http.Response{
			StatusCode: http.StatusOK,
			Body:       io.NopCloser(strings.NewReader(body)),
			Header:     http.Header{"Content-Type": []string{"application/json"}},
		}, nil
	})}

	tokens := mustTokens(t)
	router := newRouter(t, Dep{DB: db, Tokens: tokens, BotToken: selfBotToken, HTTPClient: client})
	issued := tokens.Issue(1001, uid)

	request := httptest.NewRequest(http.MethodPost, "/addr/share",
		strings.NewReader(`{"street":"中山路\r\n1 号","address":"3 楼","lat":14.5995123,"lng":"120.9842195"}`))
	// 必须带 Content-Type：Node 只按头决定解析方式（express.json），express 不会因为
	// body 长得像 JSON 就解析它。httpbody 收紧成同一口径后，漏这行 body 会被当成空。
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Authorization", "Bearer "+issued.Token)
	recorder := httptest.NewRecorder()
	router.Share(recorder, request)
	if recorder.Code != http.StatusOK {
		t.Fatalf("share: %d %s", recorder.Code, recorder.Body.String())
	}

	var created struct {
		Success bool `json:"success"`
		Data    struct {
			Token     string  `json:"token"`
			URL       *string `json:"url"`
			ExpiresAt int64   `json:"expiresAt"`
		} `json:"data"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &created); err != nil {
		t.Fatalf("decode share: %v (%s)", err, recorder.Body.String())
	}
	if !created.Success || !tokenRe.MatchString(created.Data.Token) {
		t.Fatalf("unexpected share body: %s", recorder.Body.String())
	}
	if created.Data.URL == nil || !strings.HasPrefix(*created.Data.URL, "https://t.me/demo_shop_bot?startapp=addr_") {
		t.Fatalf("unexpected deep link: %s", recorder.Body.String())
	}
	if created.Data.ExpiresAt != selfNow().Add(DefaultTTL).Unix() {
		t.Fatalf("expiresAt = %d", created.Data.ExpiresAt)
	}

	// 换一个不认识的 bot token，getMe 失败时 url 必须降级为 null，创建照常成功。
	request = httptest.NewRequest(http.MethodPost, "/addr/share",
		strings.NewReader(`{"street":"中山路","lat":"1","lng":"2"}`))
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Authorization", "Bearer "+issued.Token)
	recorder = httptest.NewRecorder()
	noBot := newRouter(t, Dep{DB: db, Tokens: tokens})
	noBot.Share(recorder, request)
	if recorder.Code != http.StatusOK || !strings.Contains(recorder.Body.String(), `"url":null`) {
		t.Fatalf("no bot token: %d %s", recorder.Code, recorder.Body.String())
	}

	recorder = httptest.NewRecorder()
	router.Shared(recorder, httptest.NewRequest(http.MethodGet, "/addr/shared/"+created.Data.Token, nil))
	if recorder.Code != http.StatusOK {
		t.Fatalf("shared: %d %s", recorder.Code, recorder.Body.String())
	}
	var read struct {
		Success bool `json:"success"`
		Data    struct {
			Street   string `json:"street"`
			Address  string `json:"address"`
			Lat      string `json:"lat"`
			Lng      string `json:"lng"`
			AreaCode string `json:"areaCode"`
		} `json:"data"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &read); err != nil {
		t.Fatalf("decode shared: %v (%s)", err, recorder.Body.String())
	}
	// 换行被压成空格；数字 lat 被归一为字符串；areaCode 缺省为 "1"。
	if read.Data.Street != "中山路 1 号" {
		t.Fatalf("street = %q", read.Data.Street)
	}
	if read.Data.Address != "3 楼" || read.Data.Lat != "14.5995123" || read.Data.Lng != "120.9842195" {
		t.Fatalf("unexpected snapshot: %+v", read.Data)
	}
	if read.Data.AreaCode != "1" {
		t.Fatalf("areaCode = %q", read.Data.AreaCode)
	}
	// 快照里不能出现归属信息。
	if strings.Contains(recorder.Body.String(), "uid") {
		t.Fatalf("shared response must not leak uid: %s", recorder.Body.String())
	}
}

type roundTripFunc func(*http.Request) (*http.Response, error)

func (f roundTripFunc) RoundTrip(request *http.Request) (*http.Response, error) { return f(request) }
