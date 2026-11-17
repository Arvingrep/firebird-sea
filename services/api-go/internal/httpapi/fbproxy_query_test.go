// 方括号键过滤（T3 补口，不翻译自 Node —— Node 侧靠 qs 的默认解析行为隐式成立）。
//
// 背景：Node 的参数来自 qs。`a[b]=1` 在 qs 里解析成 `{a:{b:'1'}}`，于是 sanitizeParams 的
// `typeof v !== 'string'` 把它整个丢掉。Go 的 url.ParseQuery 保留字面键 `a[b]`、值仍是字符串，
// 若不显式处理就会被当作合法参数转发给上游 —— 而 PHP 的 parse_str 又会把 `a[b]` 还原成嵌套数组，
// 白名单在这里出现等价性缺口：值能带着结构穿过白名单。
//
// 用例口径：走真实路由 → 真实代理 → httptest 上游，直接看上游收到的 query。
// 两个动作各一条，原因是「只有其中一条能证伪这条规则」：
//   - shopList 带参数白名单，方括号键即使不靠这条规则也会被白名单挡掉；
//   - storeDetail 没有参数白名单（Params 为 nil），是唯一能证明「方括号规则真的生效」的入口。
package httpapi

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/fbproxy"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/token"
)

// fqEnv 返回固定 Env（未列出的键为空串）。
func fqEnv(values map[string]string) func(string) string {
	return func(key string) string { return values[key] }
}

// fqServer 起一个挂好白名单代理的 Server，代理指向给定上游。
func fqServer(t *testing.T, upstream string) *Server {
	t.Helper()
	tokens, err := token.NewService(token.Dep{Secret: "0123456789abcdef", Env: "test"})
	if err != nil {
		t.Fatalf("构造令牌服务失败: %v", err)
	}
	proxy, err := fbproxy.New(fbproxy.Dep{
		UpstreamBase: upstream + "/include/ajax.php",
		Tokens:       tokens,
		Warn:         func(any) {},
	})
	if err != nil {
		t.Fatalf("构造代理失败: %v", err)
	}
	return NewServer(Dep{
		Env:     fqEnv(map[string]string{"NODE_ENV": "test"}),
		Now:     func() time.Time { return time.Unix(1700000000, 0) },
		FBProxy: proxy,
		Logf:    func(string) {},
	})
}

// fqForwardedQuery 发一次代理请求，返回上游实际收到的 query（解码后）与路由侧响应。
func fqForwardedQuery(t *testing.T, target string) (map[string][]string, int, string) {
	t.Helper()
	seen := make(chan map[string][]string, 1)
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		seen <- req.URL.Query()
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"state":100,"info":{"list":[]}}`))
	}))
	t.Cleanup(upstream.Close)

	server := fqServer(t, upstream.URL)
	recorder := httptest.NewRecorder()
	server.Handler().ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, target, nil))

	select {
	case values := <-seen:
		return values, recorder.Code, recorder.Body.String()
	default:
		return nil, recorder.Code, recorder.Body.String()
	}
}

// TestFBProxyQueryDropsBracketKeys 钉住「结构化键不得穿透白名单，平铺参数原样透传」。
func TestFBProxyQueryDropsBracketKeys(t *testing.T) {
	cases := []struct {
		name      string
		target    string
		forwarded map[string]string
	}{
		{
			name: "shopList：方括号键丢弃，平铺参数原样透传",
			// 百分号编码就是浏览器的真实发法；解码后才是 `a[b]` / `arr[]` / `order[status]`。
			target: "/tg-api/fb/waimai/shopList" +
				"?a%5Bb%5D=1&arr%5B%5D=x&order%5Bstatus%5D=1&page=1&keywords=x",
			forwarded: map[string]string{"page": "1", "keywords": "x"},
		},
		{
			name: "storeDetail（无参数白名单）：方括号键同样不得穿透",
			target: "/tg-api/fb/waimai/storeDetail" +
				"?a%5Bb%5D=1&arr%5B%5D=x&order%5Bstatus%5D=1&shopid=9",
			forwarded: map[string]string{"shopid": "9"},
		},
	}

	for _, item := range cases {
		t.Run(item.name, func(t *testing.T) {
			values, status, body := fqForwardedQuery(t, item.target)
			if status != http.StatusOK {
				t.Fatalf("匿名只读转发应 200，实得 %d（%s）", status, body)
			}
			if values == nil {
				t.Fatal("上游没有收到请求：query 过滤不该是「整条不转发」")
			}

			// 任何一个含方括号的键出现在上游 query 里都算穿透。
			for key := range values {
				if hasBracket(key) {
					t.Fatalf("结构化键穿透了白名单：%q（上游全部 query：%v）", key, values)
				}
			}

			// 平铺参数必须原样透传，值不能被改写。
			for key, want := range item.forwarded {
				if got := values[key]; len(got) != 1 || got[0] != want {
					t.Fatalf("%s 未原样透传：实得 %v，期望 [%q]（上游全部 query：%v）", key, got, want, values)
				}
			}
		})
	}
}

func hasBracket(key string) bool {
	for _, r := range key {
		if r == '[' || r == ']' {
			return true
		}
	}
	return false
}
