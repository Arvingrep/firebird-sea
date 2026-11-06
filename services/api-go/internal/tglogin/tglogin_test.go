// Telegram 顾客免密登录桥的正式测试套件。
// 逐条翻译自 services/api/test/tg-login.test.js（17 条）。
//
// 与 Node 版的映射：
//   - Node 的假网关带 cfg 参数（`calls.member[0].cfg.secret`）；Go 的 Gateway 接口不带 cfg，
//     Config 在装配层（main）构造。因此「secret 被读取」这一条改成断言处理器确实读了
//     FBS_GATEWAY_URL / FBS_GATEWAY_SECRET 两个环境变量，真正的签名正确性由第 9 条
//     （打真实 httptest 服务器、复算 X-Fbs-Signature）覆盖 —— 后者比读 cfg 更强。
//   - Node 用 fakeDb 收集 SQL 文本再 includes；Go 用「先记录实际 SQL 再断言」的
//     QueryMatcher，等价物且能顺便证明「表名零前缀」「一条 SQL 都没发」这类否定断言。
package tglogin

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"reflect"
	"regexp"
	"sort"
	"strings"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/gateway"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/tgauth"
)

const (
	tlBotToken      = "test-bot-token-not-a-secret"
	tlGatewayURL    = "http://gw.local/api/fbs"
	tlGatewaySecret = "gw-secret"
	tlTgUserID      = int64(100200)
	tlMemberID      = int64(4242)
	// tlNowMillis 对应 Node 注入的 now: () => 1700000000000。
	tlNowMillis = int64(1700000000000)
	// tlGatewayReplayTTL 来自 webroot/api/fbs/bridge.php 的 FBS_BRIDGE_REPLAY_TTL（7200s）。
	tlGatewayReplayTTL = 7200
)

// tlCookies 是网关下发的完整 Set-Cookie 列表：桥必须逐字节原样透传（不增、不删、不改、不重排）。
var tlCookies = []string{
	"HN_login_user=QUJD; expires=Sun, 19 Nov 2023 02:13:20 GMT; Max-Age=360000; path=/; domain=fbird.men; secure; SameSite=None",
	"HN_userid=4242; expires=Sun, 19 Nov 2023 02:13:20 GMT; Max-Age=360000; path=/; domain=fbird.men; secure; SameSite=None",
	"HN_tg=1; expires=Thu, 14 Dec 2023 22:13:20 GMT; Max-Age=2592000; path=/; domain=fbird.men; secure; SameSite=None",
}

// tlBody 是 Node 的 post()：POST 一个 JSON 体到桥端点。
func tlPost(t *testing.T, handler http.HandlerFunc, body map[string]any) *httptest.ResponseRecorder {
	t.Helper()
	payload, err := json.Marshal(body)
	if err != nil {
		t.Fatalf("marshal body: %v", err)
	}
	request := httptest.NewRequest(http.MethodPost, "/tg-api/auth/telegram-web", strings.NewReader(string(payload)))
	request.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()
	handler(recorder, request)
	return recorder
}

func tlJSON(t *testing.T, recorder *httptest.ResponseRecorder) map[string]any {
	t.Helper()
	var body map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &body); err != nil {
		t.Fatalf("响应不是合法 JSON：%q", recorder.Body.String())
	}
	return body
}

func tlErrorCode(t *testing.T, recorder *httptest.ResponseRecorder) string {
	t.Helper()
	detail, ok := tlJSON(t, recorder)["error"].(map[string]any)
	if !ok {
		t.Fatalf("响应缺少 error 对象：%q", recorder.Body.String())
	}
	code, _ := detail["code"].(string)
	return code
}

func tlData(t *testing.T, recorder *httptest.ResponseRecorder) map[string]any {
	t.Helper()
	data, ok := tlJSON(t, recorder)["data"].(map[string]any)
	if !ok {
		t.Fatalf("响应缺 data 对象：%q", recorder.Body.String())
	}
	return data
}

func tlSha256Hex(value string) string {
	sum := sha256.Sum256([]byte(value))
	return hex.EncodeToString(sum[:])
}

// tlFakeValidate 对应 Node 注入的 validateInitData：
// 'good' 通过（user.id=100200，带 first_name/username），其余按签名不符处理。
func tlFakeValidate(initData, _ string) tgauth.Result {
	if initData != "good" {
		return tgauth.Result{Error: "Hash mismatch: Potential tampering detected"}
	}
	return tgauth.Result{
		Valid:    true,
		AuthDate: 1700000000,
		User: &tgauth.User{
			ID:  tlTgUserID,
			Raw: json.RawMessage(`{"id":100200,"first_name":"M","username":"mm"}`),
		},
	}
}

// tlGateway 是 Gateway 的替身：记下每次调用的 params，可按脚本返回或抛错。
type tlGateway struct {
	memberCalls  []map[string]any
	sessionCalls []map[string]any
	member       map[string]any
	session      map[string]any
	memberErr    error
	sessionErr   error
}

func (g *tlGateway) MemberFindOrCreate(_ context.Context, params map[string]any) (map[string]any, error) {
	g.memberCalls = append(g.memberCalls, params)
	if g.memberErr != nil {
		return nil, g.memberErr
	}
	return g.member, nil
}

func (g *tlGateway) IssueSession(_ context.Context, params map[string]any) (map[string]any, error) {
	g.sessionCalls = append(g.sessionCalls, params)
	if g.sessionErr != nil {
		return nil, g.sessionErr
	}
	return g.session, nil
}

func (g *tlGateway) callCount() int { return len(g.memberCalls) + len(g.sessionCalls) }

func tlMemberOK() map[string]any {
	return map[string]any{"success": true, "data": map[string]any{"member_id": float64(tlMemberID), "created": true}}
}

func tlSessionOK(cookies ...string) map[string]any {
	raw := make([]any, 0, len(cookies))
	for _, cookie := range cookies {
		raw = append(raw, cookie)
	}
	return map[string]any{
		"success": true,
		"data":    map[string]any{"member_id": float64(tlMemberID), "created": true, "set_cookies": raw},
	}
}

func tlOKGateway() *tlGateway {
	return &tlGateway{member: tlMemberOK(), session: tlSessionOK(tlCookies...)}
}

// tlGatewayHTTPError 对应 Node 的 gatewayHttpError：非 2xx，响应体放在 Payload 里。
func tlGatewayHTTPError(status int, code string) error {
	failure := &gateway.Error{
		Code:    gateway.CodeHTTPError,
		Message: fmt.Sprintf("网关返回 HTTP %d", status),
		Status:  status,
	}
	if code != "" {
		failure.Payload = map[string]any{
			"success": false,
			"error":   map[string]any{"code": code, "message": "gateway said so"},
		}
	}
	return failure
}

// tlEnv 记录被读取的环境变量 key：等价于 Node 断言「cfg 里带上了 secret」。
type tlEnv struct {
	values map[string]string
	read   []string
}

func (e *tlEnv) get(key string) string {
	e.read = append(e.read, key)
	return e.values[key]
}

func (e *tlEnv) sawKey(key string) bool {
	for _, seen := range e.read {
		if seen == key {
			return true
		}
	}
	return false
}

func tlDefaultEnv() *tlEnv {
	return &tlEnv{values: map[string]string{
		"FBS_GATEWAY_URL":    tlGatewayURL,
		"FBS_GATEWAY_SECRET": tlGatewaySecret,
	}}
}

// tlDep 对应 Node 的 startApp 默认参数。
func tlDep() (Dep, *tlEnv) {
	env := tlDefaultEnv()
	return Dep{
		Env:              env.get,
		BotToken:         tlBotToken,
		ValidateInitData: tlFakeValidate,
		Gateway:          tlOKGateway(),
		Now:              func() time.Time { return time.UnixMilli(tlNowMillis) },
		Logf:             func(string) {},
	}, env
}

// tlRecordingMatcher 先记下实际执行的 SQL，再交回原本的正则匹配。
// Node 的 fakeDb 就是把 sql 文本 push 进数组，这里用同样的思路把「没有前缀」
// 与「一条 SQL 都没发」这两条否定断言变得可验证。
type tlRecordingMatcher struct {
	seen *[]string
	base sqlmock.QueryMatcher
}

func (m tlRecordingMatcher) Match(expectedSQL, actualSQL string) error {
	*m.seen = append(*m.seen, actualSQL)
	return m.base.Match(expectedSQL, actualSQL)
}

func tlMockDB(t *testing.T) (*sql.DB, sqlmock.Sqlmock, *[]string) {
	t.Helper()
	seen := &[]string{}
	db, mock, err := sqlmock.New(sqlmock.QueryMatcherOption(
		tlRecordingMatcher{seen: seen, base: sqlmock.QueryMatcherRegexp},
	))
	if err != nil {
		t.Fatalf("sqlmock: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })
	return db, mock, seen
}

// tlSignInitData 用真实 HMAC 规则签一份 initData（与 Node signInitData 逐字一致）：
// secret = HMAC(key="WebAppData", msg=botToken)，hash = HMAC(key=secret, msg=data_check_string)。
func tlSignInitData(t *testing.T, fields map[string]string, token string) string {
	t.Helper()
	keys := make([]string, 0, len(fields))
	for key := range fields {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	parts := make([]string, 0, len(keys))
	for _, key := range keys {
		parts = append(parts, key+"="+fields[key])
	}
	secret := hmac.New(sha256.New, []byte("WebAppData"))
	secret.Write([]byte(token))
	signer := hmac.New(sha256.New, secret.Sum(nil))
	signer.Write([]byte(strings.Join(parts, "\n")))

	values := url.Values{}
	for key, value := range fields {
		values.Set(key, value)
	}
	values.Set("hash", hex.EncodeToString(signer.Sum(nil)))
	return values.Encode()
}

// errDBDown 模拟映射表写入时的库故障。
var errDBDown = errors.New("db down")

func regexpQuoteMeta(expression string) string { return regexp.QuoteMeta(expression) }

func tlDeepEqual(got, want any) bool { return reflect.DeepEqual(got, want) }

// tlMemberMapSQL 是 fbs_member_map 的 upsert 语句：表名是裸名，不带 DB_TABLE_PREFIX。
const tlMemberMapSQL = "INSERT INTO `fbs_member_map` (tg_user_id, member_id) VALUES (?, ?) " +
	"ON DUPLICATE KEY UPDATE member_id = VALUES(member_id)"

func TestTgLogin(t *testing.T) {
	t.Run("happy path：对象形成功体 + Set-Cookie 原样透传（不增不删不改）+ redirect=/", func(t *testing.T) {
		dep, env := tlDep()
		gw := tlOKGateway()
		dep.Gateway = gw
		handler := New(dep)

		recorder := tlPost(t, handler, map[string]any{"initData": "good", "role": "customer"})
		if recorder.Code != http.StatusOK {
			t.Fatalf("status = %d, want 200（body=%q）", recorder.Code, recorder.Body.String())
		}

		body := tlJSON(t, recorder)
		if body["success"] != true {
			t.Fatalf("success = %v, want true", body["success"])
		}
		if _, present := body["error"]; present {
			t.Fatalf("成功响应不得含 error 字段，实得 %v", body["error"])
		}
		data := tlData(t, recorder)
		if data["member_id"] != float64(tlMemberID) {
			t.Fatalf("data.member_id = %v, want %d", data["member_id"], tlMemberID)
		}
		if data["redirect"] != "/" {
			t.Fatalf("data.redirect = %v, want /", data["redirect"])
		}
		if data["member_map_synced"] != true {
			t.Fatalf("data.member_map_synced = %v, want true", data["member_map_synced"])
		}
		if data["at"] != float64(tlNowMillis) {
			t.Fatalf("data.at = %v, want %d", data["at"], tlNowMillis)
		}

		// Set-Cookie 必须逐字节等于网关返回值：属性差一个字符浏览器就不认账。
		cookies := recorder.Header()["Set-Cookie"]
		if len(cookies) != len(tlCookies) {
			t.Fatalf("Set-Cookie 条数 = %d, want %d：%v", len(cookies), len(tlCookies), cookies)
		}
		for index, want := range tlCookies {
			if cookies[index] != want {
				t.Fatalf("第 %d 条 Cookie 被改写：\n got: %q\nwant: %q", index+1, cookies[index], want)
			}
		}

		if len(gw.memberCalls) != 1 || len(gw.sessionCalls) != 1 {
			t.Fatalf("网关调用次数 = member %d / session %d，want 1/1", len(gw.memberCalls), len(gw.sessionCalls))
		}

		// 防重放：issue_session 只拿 tg_user_id + sha256(initData)，原文不出进程。
		wantSession := map[string]any{
			"tg_user_id":     tlTgUserID,
			"init_data_hash": tlSha256Hex("good"),
		}
		if got := gw.sessionCalls[0]; len(got) != len(wantSession) ||
			got["tg_user_id"] != wantSession["tg_user_id"] ||
			got["init_data_hash"] != wantSession["init_data_hash"] {
			t.Fatalf("issue_session 入参只允许 tg_user_id + init_data_hash，实得 %#v", got)
		}
		encoded, err := json.Marshal(gw.sessionCalls[0])
		if err != nil {
			t.Fatalf("marshal session params: %v", err)
		}
		if strings.Contains(string(encoded), `"good"`) {
			t.Fatalf("不得把 initData 原文传给网关，实得 %s", encoded)
		}

		if gw.memberCalls[0]["first_name"] != "M" {
			t.Fatalf("member_find_or_create 应带 first_name=M，实得 %#v", gw.memberCalls[0])
		}
		// Node 断言 cfg.secret 被传到网关；Go 的 Config 在装配层构造，
		// 这里断言处理器确实读取了两个网关配置项（缺失即 500，见下一条用例）。
		if !env.sawKey("FBS_GATEWAY_URL") || !env.sawKey("FBS_GATEWAY_SECRET") {
			t.Fatalf("处理器必须同时读取 FBS_GATEWAY_URL 与 FBS_GATEWAY_SECRET，实得 %v", env.read)
		}
	})

	t.Run("role 默认 customer", func(t *testing.T) {
		dep, _ := tlDep()
		recorder := tlPost(t, New(dep), map[string]any{"initData": "good"})
		if recorder.Code != http.StatusOK {
			t.Fatalf("status = %d, want 200（body=%q）", recorder.Code, recorder.Body.String())
		}
	})

	t.Run("role=courier：501 ROLE_NOT_SUPPORTED，且不触达网关", func(t *testing.T) {
		dep, _ := tlDep()
		gw := tlOKGateway()
		dep.Gateway = gw
		recorder := tlPost(t, New(dep), map[string]any{"initData": "good", "role": "courier"})

		if recorder.Code != http.StatusNotImplemented {
			t.Fatalf("status = %d, want 501", recorder.Code)
		}
		if body := tlJSON(t, recorder); body["success"] != false {
			t.Fatalf("success = %v, want false", body["success"])
		}
		if code := tlErrorCode(t, recorder); code != "ROLE_NOT_SUPPORTED" {
			t.Fatalf("error.code = %q, want ROLE_NOT_SUPPORTED", code)
		}
		if gw.callCount() != 0 {
			t.Fatalf("骑手线不得触达网关，实得 %d 次", gw.callCount())
		}
	})

	t.Run("缺 initData：400 MISSING_PARAM（对象形）", func(t *testing.T) {
		dep, _ := tlDep()
		recorder := tlPost(t, New(dep), map[string]any{})

		if recorder.Code != http.StatusBadRequest {
			t.Fatalf("status = %d, want 400", recorder.Code)
		}
		if body := tlJSON(t, recorder); body["success"] != false {
			t.Fatalf("success = %v, want false", body["success"])
		}
		if code := tlErrorCode(t, recorder); code != "MISSING_PARAM" {
			t.Fatalf("error.code = %q, want MISSING_PARAM", code)
		}
		detail := tlJSON(t, recorder)["error"].(map[string]any)
		if message, ok := detail["message"].(string); !ok || message == "" {
			t.Fatalf("error.message 必须是非空字符串，实得 %v", detail["message"])
		}
	})

	t.Run("验签失败：401 INVALID_INIT_DATA，不下发 Cookie", func(t *testing.T) {
		dep, _ := tlDep()
		recorder := tlPost(t, New(dep), map[string]any{"initData": "tampered"})

		if recorder.Code != http.StatusUnauthorized {
			t.Fatalf("status = %d, want 401", recorder.Code)
		}
		if code := tlErrorCode(t, recorder); code != "INVALID_INIT_DATA" {
			t.Fatalf("error.code = %q, want INVALID_INIT_DATA", code)
		}
		if cookie := recorder.Header().Get("Set-Cookie"); cookie != "" {
			t.Fatalf("验签失败不得下发 Cookie，实得 %q", cookie)
		}
	})

	t.Run("真验签：2 小时前的 initData → 401 EXPIRED_INIT_DATA；收银台默认 24h 口径未被改动", func(t *testing.T) {
		twoHoursAgo := tlSignInitData(t, map[string]string{
			"auth_date": fmt.Sprintf("%d", time.Now().Unix()-7200),
			"user":      `{"id":100200}`,
		}, tlBotToken)

		// 用真实 tgauth.Validate（ValidateInitData 留空）：这条用例要证明的是
		// 「登录桥显式把时效收窄到 MaxAgeSeconds」，而不是替身自己判过期。
		dep, _ := tlDep()
		dep.ValidateInitData = nil
		dep.Now = nil // 默认 time.Now，与 Node 的「不注入 now」一致
		dep.Gateway = tlOKGateway()
		recorder := tlPost(t, New(dep), map[string]any{"initData": twoHoursAgo})

		if recorder.Code != http.StatusUnauthorized {
			t.Fatalf("status = %d, want 401（body=%q）", recorder.Code, recorder.Body.String())
		}
		if code := tlErrorCode(t, recorder); code != "EXPIRED_INIT_DATA" {
			t.Fatalf("error.code = %q, want EXPIRED_INIT_DATA", code)
		}

		// 1 小时口径下 2 小时前的 initData 必然过期；两条口径都要判过期，
		// 任一放宽都会让「同一份 initData 的有效期」跑出网关的重放计数窗口。
		defaultResult := tgauth.Validate(twoHoursAgo, tlBotToken, tgauth.Options{})
		if defaultResult.Valid {
			t.Fatal("tgauth 默认口径（1h）必须判 2 小时前的 initData 过期")
		}
		if !strings.Contains(strings.ToLower(defaultResult.Error), "expired") {
			t.Fatalf("默认口径的错误文案应含 expired，实得 %q", defaultResult.Error)
		}
		narrowResult := tgauth.Validate(twoHoursAgo, tlBotToken, tgauth.Options{MaxAgeSeconds: MaxAgeSeconds})
		if narrowResult.Valid {
			t.Fatalf("MaxAgeSeconds=%d 口径必须判过期", MaxAgeSeconds)
		}
		if !strings.Contains(narrowResult.Error, "expired") {
			t.Fatalf("登录桥口径的错误文案应含 expired，实得 %q", narrowResult.Error)
		}

		recent := tlSignInitData(t, map[string]string{
			"auth_date": fmt.Sprintf("%d", time.Now().Unix()-300),
			"user":      `{"id":100200}`,
		}, tlBotToken)
		if result := tgauth.Validate(recent, tlBotToken, tgauth.Options{MaxAgeSeconds: MaxAgeSeconds}); !result.Valid {
			t.Fatalf("5 分钟前的 initData 必须通过，实得 %q", result.Error)
		}
	})

	t.Run("网关地址/密钥未配置：500 GATEWAY_SECRET_NOT_CONFIGURED（静态配置错，重试无用）", func(t *testing.T) {
		dep, env := tlDep()
		env.values["FBS_GATEWAY_URL"] = ""
		env.values["FBS_GATEWAY_SECRET"] = ""
		recorder := tlPost(t, New(dep), map[string]any{"initData": "good"})

		if recorder.Code != http.StatusInternalServerError {
			t.Fatalf("status = %d, want 500", recorder.Code)
		}
		if code := tlErrorCode(t, recorder); code != "GATEWAY_SECRET_NOT_CONFIGURED" {
			t.Fatalf("error.code = %q, want GATEWAY_SECRET_NOT_CONFIGURED", code)
		}
		// 500 是「重试无用」：给 Retry-After 只会诱导客户端白白消耗重放额度。
		if retry := recorder.Header().Get("Retry-After"); retry != "" {
			t.Fatalf("500 不该带 Retry-After，实得 %q", retry)
		}
	})

	t.Run("网关 success:false 的 code 原样透传，HTTP 码按登录专属表映射", func(t *testing.T) {
		cases := []struct {
			gatewayStatus int
			code          string
			wantStatus    int
		}{
			{401, "INVALID_SIGNATURE", 401},
			{403, "MEMBER_DISABLED", 403},
			{403, "MEMBER_CANCELLED", 403},
			{429, "REPLAY_LIMITED", 429},
			{400, "MISSING_PARAM", 400},
			{503, "GATEWAY_SECRET_NOT_CONFIGURED", 500},
			// 有意改判：PHP 侧是 500，但「连不上库」对外是瞬态故障，重试有效 → 503。
			// 看到 PHP 是 500 不要当 bug 改回去。
			{500, "DB_UNAVAILABLE", 503},
			{500, "DB_QUERY_FAILED", 500},
			{500, "INTERNAL_ERROR", 500},
		}
		for _, item := range cases {
			dep, _ := tlDep()
			failure := tlGatewayHTTPError(item.gatewayStatus, item.code)
			dep.Gateway = &tlGateway{memberErr: failure}
			recorder := tlPost(t, New(dep), map[string]any{"initData": "good"})

			if code := tlErrorCode(t, recorder); code != item.code {
				t.Fatalf("%s 的 code 必须原样透传，实得 %q", item.code, code)
			}
			if recorder.Code != item.wantStatus {
				t.Fatalf("%s → status = %d, want %d", item.code, recorder.Code, item.wantStatus)
			}
			if body := tlJSON(t, recorder); body["success"] != false {
				t.Fatalf("%s：success = %v, want false", item.code, body["success"])
			}
			if strings.Contains(recorder.Body.String(), "gateway said so") {
				t.Fatalf("%s：不得把网关原文 message 透给前端，实得 %q", item.code, recorder.Body.String())
			}
			if item.wantStatus == http.StatusServiceUnavailable {
				if retry := recorder.Header().Get("Retry-After"); retry != "60" {
					t.Fatalf("%s：503 必须带 Retry-After: 60，实得 %q", item.code, retry)
				}
			} else if retry := recorder.Header().Get("Retry-After"); retry != "" {
				t.Fatalf("%s（%d）：非 503 不该带 Retry-After，实得 %q", item.code, item.wantStatus, retry)
			}
		}
	})

	t.Run("gatewayClient：POST 到 /api/fbs/index.php，action 在 body，签名可复算", func(t *testing.T) {
		type seenRequest struct {
			path, body string
			signature  string
			timestamp  string
		}
		seen := make(chan seenRequest, 4)
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			raw, _ := io.ReadAll(r.Body)
			seen <- seenRequest{
				path:      r.URL.Path,
				body:      string(raw),
				signature: r.Header.Get("X-Fbs-Signature"),
				timestamp: r.Header.Get("X-Fbs-Timestamp"),
			}
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"success":true,"data":{"member_id":1,"created":true}}`))
		}))
		defer server.Close()

		result, err := gateway.MemberFindOrCreate(context.Background(),
			gateway.Config{BaseURL: server.URL, Secret: "s3cr3t"},
			map[string]any{"tg_user_id": 42})
		if err != nil {
			t.Fatalf("网关调用失败: %v", err)
		}
		got := <-seen

		// 路径必须带 .php：无后缀会被火鸟前端控制器截走并返回 HTML。
		if got.path != "/api/fbs/index.php" {
			t.Fatalf("请求路径 = %q, want /api/fbs/index.php", got.path)
		}
		var decoded map[string]any
		if err := json.Unmarshal([]byte(got.body), &decoded); err != nil {
			t.Fatalf("请求体不是合法 JSON: %q", got.body)
		}
		want := map[string]any{"action": "member_find_or_create", "params": map[string]any{"tg_user_id": float64(42)}}
		if !tlDeepEqual(decoded, want) {
			t.Fatalf("请求体 = %#v，want %#v", decoded, want)
		}
		if wantSign := gateway.Sign("s3cr3t", got.timestamp, "member_find_or_create", got.body); got.signature != wantSign {
			t.Fatalf("X-Fbs-Signature = %q，复算得 %q", got.signature, wantSign)
		}
		if result["success"] != true {
			t.Fatalf("响应 success = %v, want true", result["success"])
		}

		// baseUrl 误带路径也不会拼出双路径（new URL(Path, BaseURL) 语义）。
		paths := make(chan string, 1)
		server2 := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			paths <- r.URL.Path
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"success":true,"data":{}}`))
		}))
		defer server2.Close()
		if _, err := gateway.IssueSession(context.Background(),
			gateway.Config{BaseURL: server2.URL + "/wrong/prefix", Secret: "s"},
			map[string]any{"tg_user_id": 1}); err != nil {
			t.Fatalf("网关调用失败: %v", err)
		}
		if path := <-paths; path != "/api/fbs/index.php" {
			t.Fatalf("带前缀的 BaseURL 应被丢弃，实得路径 %q", path)
		}
	})

	t.Run("未识别码：透传 code 本身（动态），HTTP 落 500 而不是 503", func(t *testing.T) {
		dep, _ := tlDep()
		dep.Gateway = &tlGateway{memberErr: tlGatewayHTTPError(http.StatusTeapot, "SOMETHING_NEW")}
		recorder := tlPost(t, New(dep), map[string]any{"initData": "good"})

		if code := tlErrorCode(t, recorder); code != "SOMETHING_NEW" {
			t.Fatalf("error.code = %q, want SOMETHING_NEW", code)
		}
		if recorder.Code != http.StatusInternalServerError {
			t.Fatalf("未识别码应落 500，实得 %d", recorder.Code)
		}
		if retry := recorder.Header().Get("Retry-After"); retry != "" {
			t.Fatalf("500 不该带 Retry-After，实得 %q", retry)
		}
		// 兜底 500 而不是 503：503 会诱导客户端自动重试，放大重放与限流压力。
		if status := StatusForCode("SOMETHING_NEW"); status != http.StatusInternalServerError {
			t.Fatalf("StatusForCode(SOMETHING_NEW) = %d, want 500", status)
		}
	})

	t.Run("网关不可达 / 超时 / 非契约响应：502 GATEWAY_UNAVAILABLE", func(t *testing.T) {
		// 超时
		dep, _ := tlDep()
		dep.Gateway = &tlGateway{memberErr: &gateway.Error{Code: gateway.CodeTimeout, Message: "timeout"}}
		recorder := tlPost(t, New(dep), map[string]any{"initData": "good"})
		if recorder.Code != http.StatusBadGateway {
			t.Fatalf("超时：status = %d, want 502", recorder.Code)
		}
		if code := tlErrorCode(t, recorder); code != "GATEWAY_UNAVAILABLE" {
			t.Fatalf("超时：error.code = %q, want GATEWAY_UNAVAILABLE", code)
		}

		// 200 但返回 HTML（nginx 没路由到 index.php 的典型症状）
		depHTML, _ := tlDep()
		depHTML.Gateway = &tlGateway{memberErr: tlGatewayHTTPError(http.StatusOK, "")}
		htmlRecorder := tlPost(t, New(depHTML), map[string]any{"initData": "good"})
		if htmlRecorder.Code != http.StatusBadGateway {
			t.Fatalf("非契约响应：status = %d, want 502", htmlRecorder.Code)
		}
		if code := tlErrorCode(t, htmlRecorder); code != "GATEWAY_UNAVAILABLE" {
			t.Fatalf("非契约响应：error.code = %q, want GATEWAY_UNAVAILABLE", code)
		}
	})

	t.Run("网关返回空 set_cookies：502，不返回半截登录态", func(t *testing.T) {
		dep, _ := tlDep()
		dep.Gateway = &tlGateway{member: tlMemberOK(), session: tlSessionOK()}
		recorder := tlPost(t, New(dep), map[string]any{"initData": "good"})

		if recorder.Code != http.StatusBadGateway {
			t.Fatalf("status = %d, want 502", recorder.Code)
		}
		if cookie := recorder.Header().Get("Set-Cookie"); cookie != "" {
			t.Fatalf("不得返回半截登录态，实得 Set-Cookie = %q", cookie)
		}
	})

	t.Run("fbs_member_map 幂等 upsert：两次登录都执行 ON DUPLICATE KEY UPDATE", func(t *testing.T) {
		db, mock, seen := tlMockDB(t)
		// 两次登录 = 两次 upsert；顺序与次数都由期望队列保证。
		for i := 0; i < 2; i++ {
			mock.ExpectExec(regexpQuoteMeta(tlMemberMapSQL)).
				WithArgs("100200", tlMemberID).
				WillReturnResult(sqlmock.NewResult(0, 1))
		}

		dep, _ := tlDep()
		dep.DB = db
		handler := New(dep)
		for i := 0; i < 2; i++ {
			recorder := tlPost(t, handler, map[string]any{"initData": "good"})
			if recorder.Code != http.StatusOK {
				t.Fatalf("第 %d 次登录 status = %d, want 200", i+1, recorder.Code)
			}
		}
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("每次登录都要落一条 map 记录：%v", err)
		}

		mapSQLs := make([]string, 0, 2)
		for _, statement := range *seen {
			if strings.Contains(statement, "fbs_member_map") {
				mapSQLs = append(mapSQLs, statement)
			}
		}
		if len(mapSQLs) != 2 {
			t.Fatalf("fbs_member_map 写入次数 = %d, want 2（实得 %v）", len(mapSQLs), *seen)
		}
		for _, statement := range mapSQLs {
			// fbs_* 是自有表，裸名，不带 DB_TABLE_PREFIX。
			if !strings.HasPrefix(statement, "INSERT INTO `fbs_member_map`") {
				t.Fatalf("表名必须是裸名，实得 %q", statement)
			}
			if !strings.Contains(statement, "ON DUPLICATE KEY UPDATE member_id = VALUES(member_id)") {
				t.Fatalf("必须是幂等 upsert，实得 %q", statement)
			}
		}
	})

	t.Run("fbs_member_map 表名不得带 DB_TABLE_PREFIX（回归 B1：带前缀会让写入恒 1146、收银台恒 403）", func(t *testing.T) {
		db, mock, seen := tlMockDB(t)
		mock.ExpectExec(regexpQuoteMeta(tlMemberMapSQL)).
			WithArgs("100200", tlMemberID).
			WillReturnResult(sqlmock.NewResult(0, 1))

		dep, env := tlDep()
		env.values["DB_TABLE_PREFIX"] = "huoniao_"
		dep.DB = db
		recorder := tlPost(t, New(dep), map[string]any{"initData": "good"})
		if recorder.Code != http.StatusOK {
			t.Fatalf("status = %d, want 200（body=%q）", recorder.Code, recorder.Body.String())
		}
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("必须真的按裸表名写入：%v", err)
		}
		if len(*seen) == 0 {
			t.Fatal("必须真的尝试写入")
		}
		for _, statement := range *seen {
			if strings.Contains(statement, "huoniao_fbs_member_map") {
				t.Fatalf("不得出现任何前缀拼接：%q", statement)
			}
		}
	})

	t.Run("网关返回非法 member_id（非正整数）：502，不下发 Cookie、不写 map", func(t *testing.T) {
		badValues := []any{float64(0), float64(-1), "abc", nil, float64(1.5)}
		for _, bad := range badValues {
			db, mock, seen := tlMockDB(t)
			// 一条期望都不装：只要真写了 map，sqlmock 会报未预期语句并把响应变成别的样子。
			dep, _ := tlDep()
			dep.DB = db
			dep.Gateway = &tlGateway{
				member:  tlMemberOK(),
				session: map[string]any{"success": true, "data": map[string]any{"set_cookies": []any{"a=1"}, "member_id": bad}},
			}
			recorder := tlPost(t, New(dep), map[string]any{"initData": "good"})

			if recorder.Code != http.StatusBadGateway {
				t.Fatalf("member_id=%v：status = %d, want 502（body=%q）", bad, recorder.Code, recorder.Body.String())
			}
			if code := tlErrorCode(t, recorder); code != "GATEWAY_UNAVAILABLE" {
				t.Fatalf("member_id=%v：error.code = %q, want GATEWAY_UNAVAILABLE", bad, code)
			}
			if cookie := recorder.Header().Get("Set-Cookie"); cookie != "" {
				t.Fatalf("member_id=%v：不得下发 Cookie，实得 %q", bad, cookie)
			}
			if len(*seen) != 0 {
				t.Fatalf("member_id=%v：不得写 map，实得 %v", bad, *seen)
			}
			if err := mock.ExpectationsWereMet(); err != nil {
				t.Fatalf("member_id=%v：%v", bad, err)
			}
		}
	})

	t.Run("登录时效不得超过网关的防重放计数窗口（跨端不变量）", func(t *testing.T) {
		// 计数窗口从「首次成功使用」起算：只有 登录时效 ≤ 窗口，同一份 initData 的整个
		// 可用期才落在同一个窗口里（5 次/份）。调大这里而不同步调大 PHP 侧 TTL，
		// 等于静默放宽重放额度。
		if MaxAgeSeconds > tlGatewayReplayTTL {
			t.Fatalf("MaxAgeSeconds=%d 超过网关计数窗口 %ds，需同步调大 FBS_BRIDGE_REPLAY_TTL",
				MaxAgeSeconds, tlGatewayReplayTTL)
		}
	})

	t.Run("fbs_member_map 写失败不影响登录态（cookie 已下发），但响应体标记 member_map_synced=false", func(t *testing.T) {
		db, mock, _ := tlMockDB(t)
		mock.ExpectExec(regexpQuoteMeta(tlMemberMapSQL)).
			WithArgs("100200", tlMemberID).
			WillReturnError(errDBDown)

		dep, _ := tlDep()
		dep.DB = db
		recorder := tlPost(t, New(dep), map[string]any{"initData": "good"})

		if recorder.Code != http.StatusOK {
			t.Fatalf("映射表写失败必须 fail-open，实得 %d（body=%q）", recorder.Code, recorder.Body.String())
		}
		cookies := recorder.Header()["Set-Cookie"]
		if len(cookies) != len(tlCookies) {
			t.Fatalf("登录态必须照常下发，实得 %v", cookies)
		}
		for index, want := range tlCookies {
			if cookies[index] != want {
				t.Fatalf("第 %d 条 Cookie 被改写：%q → %q", index+1, want, cookies[index])
			}
		}
		if body := tlJSON(t, recorder); body["success"] != true {
			t.Fatalf("success = %v, want true", body["success"])
		}
		if data := tlData(t, recorder); data["member_map_synced"] != false {
			t.Fatalf("写失败时必须留痕 member_map_synced=false，实得 %v", data["member_map_synced"])
		}
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("member_map 写入未按预期执行：%v", err)
		}
	})
}
