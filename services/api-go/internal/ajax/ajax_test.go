package ajax

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

// serve 发一次请求到 Router，返回状态码、Content-Type 与响应体。
func serve(router *Router, req *http.Request) (int, string, string) {
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, req)
	return recorder.Code, recorder.Header().Get("Content-Type"), recorder.Body.String()
}

func get(target string) *http.Request {
	return httptest.NewRequest(http.MethodGet, target, nil)
}

func postForm(target, body string) *http.Request {
	req := httptest.NewRequest(http.MethodPost, target, strings.NewReader(body))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	return req
}

func pongRouter() *Router {
	router := NewRouter(func(string) {})
	router.Register("siteConfig", "ping", func(*Request) Response {
		return Response{State: StateOK, Info: "pong"}
	})
	return router
}

func TestRegisteredActionReturnsStateAndInfo(t *testing.T) {
	code, contentType, body := serve(pongRouter(), get("/include/ajax.php?service=siteConfig&action=ping"))
	if code != http.StatusOK {
		t.Fatalf("状态码 = %d，want 200", code)
	}
	if contentType != "application/json" {
		t.Fatalf("Content-Type = %q，want application/json", contentType)
	}
	if body != `{"state":100,"info":"pong"}` {
		t.Fatalf("响应体 = %s", body)
	}
}

func TestUnregisteredReturns404(t *testing.T) {
	for name, target := range map[string]string{
		"未注册 service": "/include/ajax.php?service=article&action=ping",
		"未注册 action":  "/include/ajax.php?service=siteConfig&action=config",
		"缺 service":   "/include/ajax.php?action=ping",
		"缺 action":    "/include/ajax.php?service=siteConfig",
		"都缺":          "/include/ajax.php",
		"大小写不同":       "/include/ajax.php?service=siteconfig&action=ping",
	} {
		t.Run(name, func(t *testing.T) {
			if code, _, _ := serve(pongRouter(), get(target)); code != http.StatusNotFound {
				t.Fatalf("状态码 = %d，want 404", code)
			}
		})
	}
}

// nginx 只按 URL 上的 service/action 分流（#234）。如果 Go 还认请求体里的 service/action，
// URL 写白名单里的 action、请求体写别的，就能绕过白名单调到未放行的实现。
func TestDispatchIgnoresServiceAndActionInBody(t *testing.T) {
	router := pongRouter()
	if code, _, _ := serve(router, postForm("/include/ajax.php", "service=siteConfig&action=ping")); code != http.StatusNotFound {
		t.Fatalf("URL 上没有 service/action 时状态码 = %d，want 404", code)
	}
	if code, _, _ := serve(router, postForm("/include/ajax.php?service=article&action=list", "service=siteConfig&action=ping")); code != http.StatusNotFound {
		t.Fatalf("请求体不该覆盖 URL：状态码 = %d，want 404", code)
	}
}

// nginx 的 $arg_service 取第一个同名参数，分发必须和它取同一个。
func TestDispatchUsesFirstDuplicateLikeNginx(t *testing.T) {
	code, _, _ := serve(pongRouter(), get("/include/ajax.php?service=siteConfig&service=article&action=ping"))
	if code != http.StatusOK {
		t.Fatalf("状态码 = %d，want 200", code)
	}
}

func TestParamsMergeLikeAjaxPHP(t *testing.T) {
	var got *Request
	router := NewRouter(func(string) {})
	router.Register("article", "list", func(req *Request) Response {
		got = req
		return Response{State: StateOK}
	})
	serve(router, postForm(
		"/include/ajax.php?service=article&action=list&page=1&id=7&callback=cb&_=123",
		"page=2&title=hello",
	))
	if got == nil {
		t.Fatal("处理函数没有被调用")
	}
	if got.Service != "article" || got.Action != "list" {
		t.Fatalf("Service/Action = %q/%q", got.Service, got.Action)
	}
	// ajax.php 先读 $_GET 再读 $_POST，同名时 POST 胜出。
	for key, want := range map[string]string{"page": "2", "id": "7", "title": "hello"} {
		if value := got.Params.Get(key); value != want {
			t.Fatalf("Params[%s] = %q，want %q", key, value, want)
		}
	}
	for _, reserved := range []string{"service", "action", "callback", "_"} {
		if got.Params.Has(reserved) {
			t.Fatalf("Params 不该包含保留参数 %s", reserved)
		}
	}
}

func TestJSONP(t *testing.T) {
	const plain = `{"state":100,"info":"pong"}`
	base := "/include/ajax.php?service=siteConfig&action=ping&callback="
	for name, item := range map[string]struct{ callback, want string }{
		"jQuery 回调名":     {"jQuery1234_5678", "jQuery1234_5678(" + plain + ")"},
		"带点的回调名":         {"app.cb", "app.cb(" + plain + ")"},
		"空回调":            {"", plain},
		"脚本注入退回 JSON":    {"alert(1)//", plain},
		"HTML 注入退回 JSON": {"%3Cscript%3E", plain},
		"超长退回 JSON":      {strings.Repeat("a", 129), plain},
	} {
		t.Run(name, func(t *testing.T) {
			code, contentType, body := serve(pongRouter(), get(base+item.callback))
			if code != http.StatusOK || body != item.want {
				t.Fatalf("状态码 = %d，响应体 = %s，want %s", code, body, item.want)
			}
			if contentType != "application/json" {
				t.Fatalf("Content-Type = %q", contentType)
			}
		})
	}
}

func TestJSONPCallbackFromPostBody(t *testing.T) {
	_, _, body := serve(pongRouter(), postForm("/include/ajax.php?service=siteConfig&action=ping", "callback=cb"))
	if body != `cb({"state":100,"info":"pong"})` {
		t.Fatalf("响应体 = %s", body)
	}
}

// 对应 json_encode 的 JSON_UNESCAPED_UNICODE：中文不转义，< > & 也不转义，末尾没有换行。
func TestEncodingMatchesJSONUnescapedUnicode(t *testing.T) {
	router := NewRouter(func(string) {})
	router.Register("siteConfig", "text", func(*Request) Response {
		return Response{State: StateOK, Info: "中文<b>&"}
	})
	_, _, body := serve(router, get("/include/ajax.php?service=siteConfig&action=text"))
	if body != `{"state":100,"info":"中文<b>&"}` {
		t.Fatalf("响应体 = %q", body)
	}
}

func TestUnencodableResponseIs500AndLogged(t *testing.T) {
	var logged []string
	router := NewRouter(func(line string) { logged = append(logged, line) })
	router.Register("siteConfig", "bad", func(*Request) Response {
		return Response{State: StateOK, Info: make(chan int)}
	})
	code, _, _ := serve(router, get("/include/ajax.php?service=siteConfig&action=bad"))
	if code != http.StatusInternalServerError {
		t.Fatalf("状态码 = %d，want 500", code)
	}
	if len(logged) != 1 || !strings.Contains(logged[0], "siteConfig.bad") {
		t.Fatalf("日志 = %v，应写明是哪个 action", logged)
	}
}

func TestRegisterDuplicatePanics(t *testing.T) {
	defer func() {
		if recover() == nil {
			t.Fatal("重复注册应当 panic：静默覆盖会让两个实现里有一个永远不被调用")
		}
	}()
	router := pongRouter()
	router.Register("siteConfig", "ping", func(*Request) Response { return Response{} })
}
