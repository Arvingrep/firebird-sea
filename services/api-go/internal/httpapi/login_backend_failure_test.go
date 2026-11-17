// 重放计数后端故障 → 502（T3 补口，不翻译自 Node —— Node 侧是「抛错冒泡」，没有独立用例）。
//
// Node 里 `/auth/telegram` 与 `/auth/bridge` 都复用 loginService.login()；allowReplay 抛错时
// 请求一路冒泡到各自路由的 catch：`/auth/telegram` → 502 LOGIN_FAILED，桥 → 502 BRIDGE_FAILED。
// Go 侧把「计数后端故障」收敛成登录编排返回 502，因此这两条路由各自的落地口径必须分别钉住：
//
//   - 不能是 429：那会让客户端以为「是自己用太多次」，实际是我们自己的库挂了；
//   - 不能放行：防重放失效时下发凭证，正是这套机制要防的事；
//   - 桥失败路径不得留 Set-Cookie：502 配一条合法凭证是最糟的组合。
package httpapi

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/bridge"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/member"
)

const lbfBotToken = "t3-replay-failure-bot-token"

// lbfNow 固定时钟：initData 的 auth_date 必须与登录编排看到的 now 对齐。
var lbfNow = time.Date(2026, 11, 6, 12, 0, 0, 0, time.UTC)

// lbfMembers 是 LoginMembers 的替身；本用例的失败点在 allowReplay，它本不该被调用。
type lbfMembers struct{}

func (lbfMembers) FindOrCreate(context.Context, int64) (int64, bool, error) { return 1, false, nil }

func (lbfMembers) Audit(context.Context, int64, string, string, string) error { return nil }

// lbfInitData 按 Telegram 官方算法签一份有效期内的 initData。
func lbfInitData(t *testing.T, tgID int64) string {
	t.Helper()
	user := `{"id":` + strconv.FormatInt(tgID, 10) + `}`
	authDate := strconv.FormatInt(lbfNow.Unix(), 10)
	dataCheckString := "auth_date=" + authDate + "\nuser=" + user

	secret := hmac.New(sha256.New, []byte("WebAppData"))
	secret.Write([]byte(lbfBotToken))
	mac := hmac.New(sha256.New, secret.Sum(nil))
	mac.Write([]byte(dataCheckString))

	values := url.Values{}
	values.Set("auth_date", authDate)
	values.Set("user", user)
	values.Set("hash", hex.EncodeToString(mac.Sum(nil)))
	return values.Encode()
}

// lbfServer 按生产形状装配：真实 loginService（重放计数器故障）+ 真实登录桥。
func lbfServer(t *testing.T) (*Server, string) {
	t.Helper()
	now := func() time.Time { return lbfNow }
	login := member.NewLoginService(member.LoginDep{
		BotToken: lbfBotToken,
		Members:  lbfMembers{},
		// 关键注入：计数后端不可用。返回 (true, err) 是为了证伪「先看 allowed 再看 err」
		// 这种顺序写反的实现在故障时仍会放行。
		AllowReplay: func(context.Context, string) (bool, error) {
			return true, errors.New("fbs_replay: connection refused")
		},
		Now: now,
	})
	bridgeRoute, err := bridge.New(bridge.Dep{
		BotToken:           lbfBotToken,
		LoginService:       login,
		CredentialProvider: func(context.Context, int64) (string, error) { return "login_user=abc", nil },
		CookieDomain:       "example.com",
		ForceSecure:        true,
		Now:                now,
		Warn:               func(any) {},
	})
	if err != nil {
		t.Fatalf("构造登录桥失败: %v", err)
	}
	server := NewServer(Dep{
		Env:    fqEnv(map[string]string{"NODE_ENV": "test"}),
		Now:    now,
		Auth:   &Auth{Login: login},
		Bridge: bridgeRoute,
		Logf:   func(string) {},
	})
	return server, lbfInitData(t, 4242)
}

// TestLoginReplayBackendFailureIs502 覆盖两条登录入口在「重放计数后端故障」下的落地口径。
func TestLoginReplayBackendFailureIs502(t *testing.T) {
	t.Run("POST /tg-api/auth/telegram 重放后端故障：502 LOGIN_FAILED，不放行", func(t *testing.T) {
		server, initData := lbfServer(t)
		request := httptest.NewRequest(http.MethodPost, "/tg-api/auth/telegram",
			strings.NewReader(`{"initData":"`+initData+`"}`))
		request.Header.Set("Content-Type", "application/json")
		recorder := httptest.NewRecorder()
		server.Handler().ServeHTTP(recorder, request)

		if recorder.Code != http.StatusBadGateway {
			t.Fatalf("status = %d, want 502（body=%s）", recorder.Code, recorder.Body.String())
		}
		body := recorder.Body.String()
		if !strings.Contains(body, `"code":"LOGIN_FAILED"`) {
			t.Fatalf("错误码应为 LOGIN_FAILED，实得 %s", body)
		}
		// 429 是「用太多次」的口径，用在这里会把我们自己的故障甩给客户端。
		if strings.Contains(body, "REPLAY_LIMITED") || strings.Contains(body, "RATE_LIMITED") {
			t.Fatalf("后端故障不得报成限流：%s", body)
		}
		// fail-closed：不得下发任何令牌。
		if strings.Contains(body, `"token"`) {
			t.Fatalf("故障路径不得签发令牌：%s", body)
		}
	})

	t.Run("POST /tg-api/auth/bridge 重放后端故障：502 BRIDGE_FAILED 且无 Set-Cookie", func(t *testing.T) {
		server, initData := lbfServer(t)
		request := httptest.NewRequest(http.MethodPost, "/tg-api/auth/bridge",
			strings.NewReader(url.Values{"initData": {initData}}.Encode()))
		request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		request.Header.Set("Origin", "https://example.com")
		recorder := httptest.NewRecorder()
		server.Handler().ServeHTTP(recorder, request)

		if recorder.Code != http.StatusBadGateway {
			t.Fatalf("status = %d, want 502（body=%s）", recorder.Code, recorder.Body.String())
		}
		if cookies := recorder.Header()["Set-Cookie"]; len(cookies) != 0 {
			t.Fatalf("失败路径不得下发 Cookie：%v", cookies)
		}
		body := recorder.Body.String()
		if !strings.Contains(body, "BRIDGE_FAILED") {
			t.Fatalf("错误页应带 BRIDGE_FAILED，实得 %s", body)
		}
		// LOGIN_FAILED 是 /auth/telegram 的口径，桥侧不该透出。
		if strings.Contains(body, "LOGIN_FAILED") {
			t.Fatalf("桥侧不该透出 LOGIN_FAILED：%s", body)
		}
		if recorder.Code == http.StatusFound {
			t.Fatal("故障路径不得 302 跳转（那等于登录成功）")
		}
	})
}
