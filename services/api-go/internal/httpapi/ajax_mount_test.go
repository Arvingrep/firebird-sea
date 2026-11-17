package httpapi

import (
	"net/http"
	"testing"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

func ajaxServer(t *testing.T, env map[string]string) *Server {
	t.Helper()
	router := ajax.NewRouter(func(string) {})
	router.Register("siteConfig", "ping", func(*ajax.Request) ajax.Response {
		return ajax.Response{State: ajax.StateOK, Info: "pong"}
	})
	return NewServer(Dep{Env: routeEnvFrom(env), Ajax: router, Logf: func(string) {}})
}

const (
	ajaxPing       = "/include/ajax.php?service=siteConfig&action=ping"
	goCompatPing   = "/go-compat/include/ajax.php?service=siteConfig&action=ping"
	wantPingBody   = `{"state":100,"info":"pong"}`
	goCompatEnvKey = "GO_COMPAT_ENABLED"
)

func TestAjaxEntryAlwaysMounted(t *testing.T) {
	server := ajaxServer(t, nil)
	for _, method := range []string{http.MethodGet, http.MethodPost} {
		if code, body := routeServe(t, server, method, ajaxPing); code != http.StatusOK || body != wantPingBody {
			t.Fatalf("%s 状态码 = %d，响应体 = %s", method, code, body)
		}
	}
	if code, _ := routeServe(t, server, http.MethodGet, "/include/ajax.php?service=siteConfig&action=nope"); code != http.StatusNotFound {
		t.Fatalf("未注册 action 状态码 = %d，want 404", code)
	}
}

func TestGoCompatEntryFollowsSwitch(t *testing.T) {
	for name, item := range map[string]struct {
		env  map[string]string
		want int
	}{
		"默认关":    {nil, http.StatusNotFound},
		"false":  {map[string]string{goCompatEnvKey: "false"}, http.StatusNotFound},
		"拼错不算开":  {map[string]string{goCompatEnvKey: "yes"}, http.StatusNotFound},
		"true 开": {map[string]string{goCompatEnvKey: "true"}, http.StatusOK},
	} {
		t.Run(name, func(t *testing.T) {
			if code, _ := routeServe(t, ajaxServer(t, item.env), http.MethodGet, goCompatPing); code != item.want {
				t.Fatalf("状态码 = %d，want %d", code, item.want)
			}
		})
	}
}

func TestGoCompatEntryUnregisteredIs404WhenOn(t *testing.T) {
	server := ajaxServer(t, map[string]string{goCompatEnvKey: "true"})
	if code, _ := routeServe(t, server, http.MethodGet, "/go-compat/include/ajax.php?service=article&action=ping"); code != http.StatusNotFound {
		t.Fatalf("状态码 = %d，want 404", code)
	}
}

// 测试里常常不注入 Ajax；两个入口都不挂，不能因为 nil 崩溃。
func TestAjaxEntriesNotMountedWithoutRouter(t *testing.T) {
	server := NewServer(Dep{Env: routeEnvFrom(map[string]string{goCompatEnvKey: "true"}), Logf: func(string) {}})
	for _, target := range []string{ajaxPing, goCompatPing} {
		if code, _ := routeServe(t, server, http.MethodGet, target); code != http.StatusNotFound {
			t.Fatalf("%s 状态码 = %d，want 404", target, code)
		}
	}
}
