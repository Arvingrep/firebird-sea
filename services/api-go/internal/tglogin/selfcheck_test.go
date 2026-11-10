// 契约护栏（不是临时自检）：用例锁定与 Node 版逐字对齐的对外行为 —— 状态码、错误码、
// JSON 字段名与字段顺序。改实现前先看这里；合并前不要按临时文件删。
package tglogin

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/gateway"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/tgauth"
)

const testBotToken = "123456:TEST-TOKEN"

func sha256Hex(value string) string {
	sum := sha256.Sum256([]byte(value))
	return hex.EncodeToString(sum[:])
}

type fakeGateway struct {
	member    map[string]any
	memberErr error
	session   map[string]any
	sessErr   error
	// merchant 是 merchant_session 的响应（role=merchant 分支专用）。
	merchant    map[string]any
	merchantErr error
	// sawInitDataHash 记录 issue_session 是否带上了 initData 的 sha256（防重放配额）。
	sawInitDataHash string
	// sawMerchantParams 记录 merchant_session 的入参（防重放记账断言用）。
	sawMerchantParams map[string]any
	// memberCallsCount 单独数 MemberFindOrCreate（merchant 分支的「绝不建号」断言用）。
	memberCallsCount int
	calls            int
}

func (f *fakeGateway) MemberFindOrCreate(context.Context, map[string]any) (map[string]any, error) {
	f.calls++
	f.memberCallsCount++
	return f.member, f.memberErr
}

func (f *fakeGateway) IssueSession(_ context.Context, params map[string]any) (map[string]any, error) {
	f.calls++
	if hash, ok := params["init_data_hash"].(string); ok {
		f.sawInitDataHash = hash
	}
	return f.session, f.sessErr
}

func (f *fakeGateway) MerchantSession(_ context.Context, params map[string]any) (map[string]any, error) {
	f.calls++
	f.sawMerchantParams = params
	return f.merchant, f.merchantErr
}

// memberCalls 返回 MemberFindOrCreate 的调用次数（merchant 分支的「绝不建号」断言用）。
func (f *fakeGateway) memberCalls() int { return f.memberCallsCount }

func validValidate(initData, _ string) tgauth.Result {
	if initData == "expired" {
		return tgauth.Result{Error: "initData expired"}
	}
	if initData != "good" {
		return tgauth.Result{Error: "Hash mismatch: Potential tampering detected"}
	}
	return tgauth.Result{
		Valid:    true,
		AuthDate: 1700000000,
		User: &tgauth.User{
			ID:  777,
			Raw: json.RawMessage(`{"id":777,"first_name":"Metro","username":"metro"}`),
		},
	}
}

func okMember(id int64) map[string]any {
	return map[string]any{"success": true, "data": map[string]any{"member_id": float64(id)}}
}

func okSession(memberID int64, cookies ...string) map[string]any {
	raw := make([]any, 0, len(cookies))
	for _, cookie := range cookies {
		raw = append(raw, cookie)
	}
	return map[string]any{
		"success": true,
		"data":    map[string]any{"set_cookies": raw, "member_id": float64(memberID)},
	}
}

func newHandler(t *testing.T, gw Gateway) http.HandlerFunc {
	t.Helper()
	return New(Dep{
		Env: func(key string) string {
			if key == "FBS_GATEWAY_URL" {
				return "http://gateway.internal"
			}
			if key == "FBS_GATEWAY_SECRET" {
				return "secret"
			}
			return ""
		},
		BotToken:         testBotToken,
		ValidateInitData: validValidate,
		Gateway:          gw,
		Logf:             func(string) {},
	})
}

func post(handler http.HandlerFunc, form url.Values, headers map[string]string) *httptest.ResponseRecorder {
	request := httptest.NewRequest(http.MethodPost, "/tg-api/auth/telegram-web", strings.NewReader(form.Encode()))
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	for key, value := range headers {
		request.Header.Set(key, value)
	}
	recorder := httptest.NewRecorder()
	handler(recorder, request)
	return recorder
}

func decode(t *testing.T, recorder *httptest.ResponseRecorder) map[string]any {
	t.Helper()
	var body map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &body); err != nil {
		t.Fatalf("响应不是合法 JSON：%q", recorder.Body.String())
	}
	return body
}

func errorCode(t *testing.T, recorder *httptest.ResponseRecorder) string {
	t.Helper()
	detail, ok := decode(t, recorder)["error"].(map[string]any)
	if !ok {
		t.Fatalf("响应缺少 error 对象：%q", recorder.Body.String())
	}
	code, _ := detail["code"].(string)
	return code
}

// TestSelfCheckStatusTable 逐条钉住 code → HTTP 状态表。
// 特别是 DB_UNAVAILABLE 必须是 503：PHP 侧回 500，但「连不上库」对外是瞬态故障，
// 按 500 判会让客户端放弃重试。看到 PHP 是 500 不要当 bug 改回去。
func TestSelfCheckStatusTable(t *testing.T) {
	cases := map[string]int{
		"INVALID_SIGNATURE":             401,
		"MISSING_PARAM":                 400,
		"MEMBER_DISABLED":               403,
		"MEMBER_CANCELLED":              403,
		"REPLAY_LIMITED":                429,
		"GATEWAY_UNAVAILABLE":           502,
		"GATEWAY_SECRET_NOT_CONFIGURED": 500,
		"CONFIG_MISSING":                500,
		"CONFIG_INVALID":                500,
		"MEMBER_CREATE_FAILED":          500,
		"DB_QUERY_FAILED":               500,
		"UNKNOWN_ACTION":                500,
		"INTERNAL_ERROR":                500,
		"DB_UNAVAILABLE":                503,
		"INVALID_INIT_DATA":             401,
		"EXPIRED_INIT_DATA":             401,
		"ROLE_NOT_SUPPORTED":            501,
	}
	for code, want := range cases {
		if got := StatusForCode(code); got != want {
			t.Fatalf("StatusForCode(%q) = %d，期望 %d", code, got, want)
		}
	}
	// 未识别码兜底 500 而不是 503：503 会诱导客户端重试，放大重放与限流压力。
	if got := StatusForCode("SOMETHING_NEW"); got != 500 {
		t.Fatalf("未识别码应兜底 500，实得 %d", got)
	}
}

func TestSelfCheckGatewayNotConfiguredIs500(t *testing.T) {
	handler := New(Dep{
		Env:              func(string) string { return "" },
		BotToken:         testBotToken,
		ValidateInitData: validValidate,
		Gateway:          &fakeGateway{},
		Logf:             func(string) {},
	})
	recorder := post(handler, url.Values{"initData": {"good"}}, nil)
	if recorder.Code != http.StatusInternalServerError {
		t.Fatalf("静态配置错应 500，实得 %d", recorder.Code)
	}
	if code := errorCode(t, recorder); code != "GATEWAY_SECRET_NOT_CONFIGURED" {
		t.Fatalf("code 应为 GATEWAY_SECRET_NOT_CONFIGURED，实得 %q", code)
	}
	// 500 是「重试无用」，不该给 Retry-After。
	if retry := recorder.Header().Get("Retry-After"); retry != "" {
		t.Fatalf("500 不该带 Retry-After，实得 %q", retry)
	}
}

func TestSelfCheckMissingParam(t *testing.T) {
	gw := &fakeGateway{member: okMember(1), session: okSession(1, "a=1")}
	recorder := post(newHandler(t, gw), url.Values{}, nil)
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("缺 initData 应 400，实得 %d", recorder.Code)
	}
	if code := errorCode(t, recorder); code != "MISSING_PARAM" {
		t.Fatalf("code 应为 MISSING_PARAM，实得 %q", code)
	}
	if gw.calls != 0 {
		t.Fatal("参数缺失不该打网关")
	}
}

func TestSelfCheckExpiredAndInvalidInitData(t *testing.T) {
	gw := &fakeGateway{}
	handler := newHandler(t, gw)

	expired := post(handler, url.Values{"initData": {"expired"}}, nil)
	if expired.Code != http.StatusUnauthorized || errorCode(t, expired) != "EXPIRED_INIT_DATA" {
		t.Fatalf("过期 initData 应 401 EXPIRED_INIT_DATA，实得 %d / %q",
			expired.Code, errorCode(t, expired))
	}

	invalid := post(handler, url.Values{"initData": {"tampered"}}, nil)
	if invalid.Code != http.StatusUnauthorized || errorCode(t, invalid) != "INVALID_INIT_DATA" {
		t.Fatalf("非法 initData 应 401 INVALID_INIT_DATA，实得 %d / %q",
			invalid.Code, errorCode(t, invalid))
	}
	if gw.calls != 0 {
		t.Fatal("验签失败不该打网关")
	}
}

func TestSelfCheckRoleNotSupported(t *testing.T) {
	gw := &fakeGateway{member: okMember(1), session: okSession(1, "a=1")}
	recorder := post(newHandler(t, gw), url.Values{"initData": {"good"}, "role": {"courier"}}, nil)
	if recorder.Code != http.StatusNotImplemented {
		t.Fatalf("骑手线应 501，实得 %d", recorder.Code)
	}
	if code := errorCode(t, recorder); code != "ROLE_NOT_SUPPORTED" {
		t.Fatalf("code 应为 ROLE_NOT_SUPPORTED，实得 %q", code)
	}
	// 未知 role 一律 501 且**不触达网关**（courier 也不走本端点）。
	if gw.calls != 0 {
		t.Fatalf("501 分支不该打网关，实际 %d 次", gw.calls)
	}
}

func TestSelfCheckUnknownRoleStill501(t *testing.T) {
	for _, role := range []string{"admin", "courier", "shop", ""} {
		gw := &fakeGateway{member: okMember(1), session: okSession(1, "a=1")}
		form := url.Values{"initData": {"good"}}
		if role != "" {
			form.Set("role", role)
		}
		recorder := post(newHandler(t, gw), form, nil)
		if role == "" {
			// 空 role 回落 customer，应成功而不是 501。
			if recorder.Code != http.StatusOK {
				t.Fatalf("缺 role 应回落 customer（200），实得 %d", recorder.Code)
			}
			continue
		}
		if recorder.Code != http.StatusNotImplemented || errorCode(t, recorder) != "ROLE_NOT_SUPPORTED" {
			t.Fatalf("role=%q 应 501 ROLE_NOT_SUPPORTED，实得 %d / %q",
				role, recorder.Code, errorCode(t, recorder))
		}
		if gw.calls != 0 {
			t.Fatalf("role=%q 不该触达网关", role)
		}
	}
}

// TestSelfCheckMerchantRoleSession 是 merchant 分支的核心用例（方案 A）：
//   - MerchantSession 被调且带 init_data_hash（防重放记账）；
//   - MemberFindOrCreate **不被调**（商家绝不建号）；
//   - set_cookies 逐字透传、redirect=/wmsj/、member_map_synced 恒 false。
func TestSelfCheckMerchantRoleSession(t *testing.T) {
	cookies := []string{
		"HN_login_user=YWJjZGVm; Path=/; Domain=.example.com; HttpOnly",
		"HN_tg=1; Path=/; Domain=.example.com; Max-Age=2592000",
	}
	gw := &fakeGateway{merchant: map[string]any{
		"success": true,
		"data": map[string]any{
			"member_id":   float64(2),
			"shop_ids":    []any{float64(1), float64(5)},
			"redirect":    "/wmsj/",
			"set_cookies": []any{cookies[0], cookies[1]},
		},
	}}
	recorder := post(newHandler(t, gw), url.Values{"initData": {"good"}, "role": {"merchant"}}, nil)

	if recorder.Code != http.StatusOK {
		t.Fatalf("merchant 登录应 200，实得 %d（body=%q）", recorder.Code, recorder.Body.String())
	}
	// Cookie 必须原样透传：不增、不删、不改属性、不重排。
	got := recorder.Header()["Set-Cookie"]
	if len(got) != len(cookies) {
		t.Fatalf("Set-Cookie 条数应为 %d，实得 %d：%v", len(cookies), len(got), got)
	}
	for index, want := range cookies {
		if got[index] != want {
			t.Fatalf("第 %d 条 Cookie 被改写：%q → %q", index+1, want, got[index])
		}
	}

	body := decode(t, recorder)
	data := body["data"].(map[string]any)
	if data["member_id"] != float64(2) {
		t.Fatalf("data.member_id 应为 2，实得 %v", data["member_id"])
	}
	if data["redirect"] != "/wmsj/" {
		t.Fatalf("data.redirect 应为 /wmsj/，实得 %v", data["redirect"])
	}
	if data["member_map_synced"] != false {
		t.Fatalf("merchant 分支 member_map_synced 必须恒 false，实得 %v", data["member_map_synced"])
	}

	// 防重放记账：merchant_session 带 sha256(initData)。
	params := gw.sawMerchantParams
	if params == nil {
		t.Fatal("MerchantSession 未被调用")
	}
	if got, _ := params["init_data_hash"].(string); got != sha256Hex("good") {
		t.Fatalf("merchant_session 应带 initData 的 sha256，实得 %q", got)
	}
	// MemberFindOrCreate 绝不被调：网关建号会把商家变成「有 cookie 无店铺」的空会员。
	if gw.memberCalls() != 0 {
		t.Fatalf("merchant 分支不得调用 MemberFindOrCreate，实际 %d 次", gw.memberCalls())
	}
}

// TestSelfCheckMerchantRedirectSanitized 钉住 redirect 过 SafeRedirect：
// 网关返回协议相对路径也必须回落 /wmsj/。
func TestSelfCheckMerchantRedirectSanitized(t *testing.T) {
	for _, redirect := range []string{"//evil.example.com/", "https://evil/", "/a\\b", ""} {
		gw := &fakeGateway{merchant: map[string]any{
			"success": true,
			"data": map[string]any{
				"member_id":   float64(2),
				"redirect":    redirect,
				"set_cookies": []any{"HN_login_user=abc"},
			},
		}}
		recorder := post(newHandler(t, gw), url.Values{"initData": {"good"}, "role": {"merchant"}}, nil)
		if recorder.Code != http.StatusOK {
			t.Fatalf("redirect=%q 应 200，实得 %d", redirect, recorder.Code)
		}
		if got := decode(t, recorder)["data"].(map[string]any)["redirect"]; got != "/wmsj/" {
			t.Fatalf("redirect=%q 应被净化成 /wmsj/，实得 %v", redirect, got)
		}
	}
}

// TestSelfCheckMerchantGatewayFailurePassthrough 钉住网关失败码原样透传
// （MERCHANT_NOT_BOUND → 404，文案给可执行动作）。
func TestSelfCheckMerchantGatewayFailurePassthrough(t *testing.T) {
	cases := []struct {
		err        error
		wantStatus int
		wantCode   string
	}{
		{
			err: &gateway.Error{
				Code:    gateway.CodeHTTPError,
				Message: "gateway rejected",
				Payload: map[string]any{
					"success": false,
					"error":   map[string]any{"code": "MERCHANT_NOT_BOUND", "message": "x"},
				},
			},
			wantStatus: http.StatusNotFound, wantCode: "MERCHANT_NOT_BOUND",
		},
		{
			err:        &gateway.Error{Code: gateway.CodeTimeout, Message: "timeout"},
			wantStatus: http.StatusBadGateway, wantCode: "GATEWAY_UNAVAILABLE",
		},
	}
	for _, item := range cases {
		gw := &fakeGateway{merchantErr: item.err}
		recorder := post(newHandler(t, gw), url.Values{"initData": {"good"}, "role": {"merchant"}}, nil)
		if recorder.Code != item.wantStatus || errorCode(t, recorder) != item.wantCode {
			t.Fatalf("应 %d / %q，实得 %d / %q",
				item.wantStatus, item.wantCode, recorder.Code, errorCode(t, recorder))
		}
	}
}

// TestSelfCheckMerchantInvalidSessionPayload 钉住「2xx 但形状不对 → 502 GATEWAY_UNAVAILABLE」。
func TestSelfCheckMerchantInvalidSessionPayload(t *testing.T) {
	for name, merchant := range map[string]map[string]any{
		"缺 set_cookies": {"success": true, "data": map[string]any{"member_id": float64(2)}},
		"空 set_cookies": {"success": true, "data": map[string]any{"member_id": float64(2), "set_cookies": []any{}}},
		"member_id 为 0": {"success": true, "data": map[string]any{"member_id": float64(0), "set_cookies": []any{"a=1"}}},
		"success false": {"success": false},
	} {
		gw := &fakeGateway{merchant: merchant}
		recorder := post(newHandler(t, gw), url.Values{"initData": {"good"}, "role": {"merchant"}}, nil)
		if recorder.Code != http.StatusBadGateway || errorCode(t, recorder) != "GATEWAY_UNAVAILABLE" {
			t.Fatalf("%s 应 502 GATEWAY_UNAVAILABLE，实得 %d / %q",
				name, recorder.Code, errorCode(t, recorder))
		}
		if recorder.Header().Get("Set-Cookie") != "" {
			t.Fatalf("%s：失败时不得下发任何 Cookie", name)
		}
	}
}

func TestSelfCheckDBUnavailableIs503WithRetryAfter(t *testing.T) {
	gw := &fakeGateway{
		memberErr: &gateway.Error{
			Code:    gateway.CodeHTTPError,
			Message: "gateway rejected",
			Payload: map[string]any{
				"success": false,
				"error":   map[string]any{"code": "DB_UNAVAILABLE", "message": "db down"},
			},
		},
	}
	recorder := post(newHandler(t, gw), url.Values{"initData": {"good"}}, nil)
	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("DB_UNAVAILABLE 应 503，实得 %d", recorder.Code)
	}
	if retry := recorder.Header().Get("Retry-After"); retry != "60" {
		t.Fatalf("503 必须带 Retry-After: 60，实得 %q", retry)
	}
	if code := errorCode(t, recorder); code != "DB_UNAVAILABLE" {
		t.Fatalf("网关 code 应原样透传，实得 %q", code)
	}
}

func TestSelfCheckGatewayTimeoutMapsToUnavailable(t *testing.T) {
	gw := &fakeGateway{memberErr: &gateway.Error{Code: gateway.CodeTimeout, Message: "timeout"}}
	recorder := post(newHandler(t, gw), url.Values{"initData": {"good"}}, nil)
	if recorder.Code != http.StatusBadGateway {
		t.Fatalf("网关超时应 502，实得 %d", recorder.Code)
	}
	if code := errorCode(t, recorder); code != "GATEWAY_UNAVAILABLE" {
		t.Fatalf("code 应为 GATEWAY_UNAVAILABLE，实得 %q", code)
	}
	if retry := recorder.Header().Get("Retry-After"); retry != "" {
		t.Fatalf("502 不该带 Retry-After，实得 %q", retry)
	}
}

func TestSelfCheckSuccessPassesCookiesThrough(t *testing.T) {
	cookies := []string{
		"HN_login_user=YWJjZGVm; Path=/; Domain=.example.com; HttpOnly",
		"HN_login_pass=Z2hp; Path=/; Domain=.example.com",
	}
	gw := &fakeGateway{member: okMember(8888), session: okSession(8888, cookies...)}
	recorder := post(newHandler(t, gw), url.Values{"initData": {"good"}}, nil)

	if recorder.Code != http.StatusOK {
		t.Fatalf("成功应 200，实得 %d（body=%q）", recorder.Code, recorder.Body.String())
	}
	// Cookie 必须原样透传：不增、不删、不改属性、不重排。
	got := recorder.Header()["Set-Cookie"]
	if len(got) != len(cookies) {
		t.Fatalf("Set-Cookie 条数应为 %d，实得 %d：%v", len(cookies), len(got), got)
	}
	for index, want := range cookies {
		if got[index] != want {
			t.Fatalf("第 %d 条 Cookie 被改写：%q → %q", index+1, want, got[index])
		}
	}

	body := decode(t, recorder)
	if body["success"] != true {
		t.Fatalf("success 应为 true，实得 %v", body["success"])
	}
	data, ok := body["data"].(map[string]any)
	if !ok {
		t.Fatalf("响应缺 data 对象：%q", recorder.Body.String())
	}
	if data["member_id"] != float64(8888) {
		t.Fatalf("data.member_id 应为 8888，实得 %v", data["member_id"])
	}
	if data["redirect"] != "/" {
		t.Fatalf("data.redirect 应为 /，实得 %v", data["redirect"])
	}
	if data["member_map_synced"] != true {
		t.Fatalf("db 为 nil 时 member_map_synced 应为 true（不误报），实得 %v", data["member_map_synced"])
	}
	if _, ok := data["at"].(float64); !ok {
		t.Fatalf("data.at 应为毫秒时间戳，实得 %v", data["at"])
	}

	// 只传 hash 不传原文：原文里是用户资料，没必要扩大暴露面。
	if gw.sawInitDataHash != sha256Hex("good") {
		t.Fatalf("issue_session 应带 initData 的 sha256，实得 %q", gw.sawInitDataHash)
	}
}

func TestSelfCheckMemberMapFailureIsFailOpen(t *testing.T) {
	conn, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("构造 sqlmock 失败: %v", err)
	}
	defer func() { _ = conn.Close() }()
	mock.ExpectExec("INSERT INTO `fbs_member_map`").
		WithArgs("777", int64(8888)).
		WillReturnError(errors.New("db exploded"))

	handler := New(Dep{
		Env: func(key string) string {
			switch key {
			case "FBS_GATEWAY_URL":
				return "http://gateway.internal"
			case "FBS_GATEWAY_SECRET":
				return "secret"
			}
			return ""
		},
		DB:               conn,
		BotToken:         testBotToken,
		ValidateInitData: validValidate,
		Gateway:          &fakeGateway{member: okMember(8888), session: okSession(8888, "HN_login_user=abc")},
		Logf:             func(string) {},
	})

	recorder := post(handler, url.Values{"initData": {"good"}}, nil)
	if recorder.Code != http.StatusOK {
		t.Fatalf("映射表写失败必须 fail-open（登录态已建立），实得 %d", recorder.Code)
	}
	data := decode(t, recorder)["data"].(map[string]any)
	if data["member_map_synced"] != false {
		t.Fatalf("写失败时 member_map_synced 必须为 false 留痕，实得 %v", data["member_map_synced"])
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("member_map 写入未按预期执行: %v", err)
	}
}

func TestSelfCheckMemberMapUsesBareTableName(t *testing.T) {
	// 表名不带 DB_TABLE_PREFIX：fbs_* 是自有表，由 migrations 以裸名创建。
	// 写成带前缀会让写入恒定 1146 失败 → 表永远为空 → 收银台归属校验恒 403。
	conn, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("构造 sqlmock 失败: %v", err)
	}
	defer func() { _ = conn.Close() }()
	mock.ExpectExec("INSERT INTO `fbs_member_map` \\(tg_user_id, member_id\\) VALUES \\(\\?, \\?\\) ON DUPLICATE KEY UPDATE").
		WithArgs("777", int64(8888)).
		WillReturnResult(sqlmock.NewResult(0, 1))

	handler := New(Dep{
		Env: func(key string) string {
			if key == "FBS_GATEWAY_URL" {
				return "http://gateway.internal"
			}
			if key == "FBS_GATEWAY_SECRET" {
				return "secret"
			}
			return ""
		},
		DB:               conn,
		BotToken:         testBotToken,
		ValidateInitData: validValidate,
		Gateway:          &fakeGateway{member: okMember(8888), session: okSession(8888, "HN_login_user=abc")},
		Logf:             func(string) {},
	})
	recorder := post(handler, url.Values{"initData": {"good"}}, nil)
	if recorder.Code != http.StatusOK {
		t.Fatalf("成功应 200，实得 %d", recorder.Code)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("SQL 形状不符: %v", err)
	}
}

func TestSelfCheckIssueSessionMissingCookies(t *testing.T) {
	gw := &fakeGateway{member: okMember(8888), session: map[string]any{
		"success": true,
		"data":    map[string]any{"member_id": float64(8888)},
	}}
	recorder := post(newHandler(t, gw), url.Values{"initData": {"good"}}, nil)
	if recorder.Code != http.StatusBadGateway {
		t.Fatalf("缺 set_cookies 应 502，实得 %d", recorder.Code)
	}
	if code := errorCode(t, recorder); code != "GATEWAY_UNAVAILABLE" {
		t.Fatalf("code 应为 GATEWAY_UNAVAILABLE，实得 %q", code)
	}
	if recorder.Header().Get("Set-Cookie") != "" {
		t.Fatal("失败时不得下发任何 Cookie")
	}
}

func TestSelfCheckMemberIDNotPositive(t *testing.T) {
	gw := &fakeGateway{member: okMember(8888), session: map[string]any{
		"success": true,
		"data":    map[string]any{"set_cookies": []any{"a=1"}, "member_id": float64(0)},
	}}
	recorder := post(newHandler(t, gw), url.Values{"initData": {"good"}}, nil)
	if recorder.Code != http.StatusBadGateway {
		t.Fatalf("member_id 非正整数应 502，实得 %d", recorder.Code)
	}
}

func TestSelfCheckInitDataFromCustomHeader(t *testing.T) {
	gw := &fakeGateway{member: okMember(8888), session: okSession(8888, "HN_login_user=abc")}
	// TMA 前端把 initData 放自定义头；body 里可以没有。
	recorder := post(newHandler(t, gw), url.Values{}, map[string]string{"x-telegram-init-data": "good"})
	if recorder.Code != http.StatusOK {
		t.Fatalf("自定义头里的 initData 应被采信，实得 %d（body=%q）", recorder.Code, recorder.Body.String())
	}
}
