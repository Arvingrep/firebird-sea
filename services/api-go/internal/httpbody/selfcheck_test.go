// 契约护栏（不是临时自检）：用例锁定 express 的 body 解析口径 —— 解析方式由 Content-Type
// 决定、非字符串值视为缺失。改实现前先看这里；合并前不要按临时文件删。
package httpbody

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

// TestSelfCheckParseFollowsContentType 钉住「解析方式由 Content-Type 决定」。
//
// 这是与 express.json + express.urlencoded 的等价核心：类型不匹配时 body 一律不解析，
// 而不是看内容长什么样。之前按首字节嗅探，等于把 `text/plain` 的 JSON 也收了进来。
func TestSelfCheckParseFollowsContentType(t *testing.T) {
	cases := []struct {
		name        string
		contentType string
		raw         string
		wantKey     string
		wantValue   any
	}{
		{"json", "application/json", `{"a":"1"}`, "a", "1"},
		{"json+charset", "application/json; charset=utf-8", `{"a":"1"}`, "a", "1"},
		{"json 子类型", "application/vnd.api+json", `{"a":"1"}`, "a", "1"},
		{"表单", "application/x-www-form-urlencoded", "a=1&b=2", "a", "1"},
		{"无类型不解析", "", `{"a":"1"}`, "", nil},
		{"text/plain 不解析", "text/plain", `{"a":"1"}`, "", nil},
		{"multipart 不解析", "multipart/form-data; boundary=x", "a=1", "", nil},
	}
	for _, item := range cases {
		t.Run(item.name, func(t *testing.T) {
			fields := Parse(item.contentType, []byte(item.raw))
			if item.wantKey == "" {
				if len(fields) != 0 {
					t.Fatalf("不该解析出字段，实得 %v", fields)
				}
				return
			}
			if got := fields[item.wantKey]; got != item.wantValue {
				t.Fatalf("fields[%q] = %v，期望 %v", item.wantKey, got, item.wantValue)
			}
		})
	}
}

// TestSelfCheckParseKeepsJSONTypes 确认 JSON 路径保留原始类型：
// 数组/对象/数字必须保持非字符串，下游据此才能按 Node 的 `typeof` 语义判「不可用」。
func TestSelfCheckParseKeepsJSONTypes(t *testing.T) {
	fields := Parse("application/json", []byte(`{"obj":{"x":1},"arr":[1],"num":5,"str":"s"}`))
	if _, ok := fields["obj"].(map[string]any); !ok {
		t.Fatalf("对象应保持 map 类型，实得 %T", fields["obj"])
	}
	if _, ok := fields["arr"].([]any); !ok {
		t.Fatalf("数组应保持切片类型，实得 %T", fields["arr"])
	}
	if _, ok := fields["num"].(float64); !ok {
		t.Fatalf("数字应保持 float64，实得 %T", fields["num"])
	}
	if Text(fields, "obj") != "" || Text(fields, "arr") != "" || Text(fields, "num") != "" {
		t.Fatal("Text 只接受字符串，其它类型必须视为缺失")
	}
	if Text(fields, "str") != "s" {
		t.Fatal("字符串字段应原样返回")
	}
}

// TestSelfCheckFieldsOfUsesContext 覆盖生产路径：中间件解析一次，下游直接取。
func TestSelfCheckFieldsOfUsesContext(t *testing.T) {
	request := httptest.NewRequest(http.MethodPost, "/x", strings.NewReader(`{"a":"1"}`))
	request.Header.Set("Content-Type", "application/json")
	request = With(request, []byte(`{"a":"1"}`), map[string]any{"a": "from-context"})

	if got := Text(FieldsOf(request), "a"); got != "from-context" {
		t.Fatalf("应优先用 context 里的解析结果，实得 %q", got)
	}
	if raw := RawOf(request); string(raw) != `{"a":"1"}` {
		t.Fatalf("原始字节应保留，实得 %q", raw)
	}
}

// TestSelfCheckFieldsOfFallsBackByContentType 覆盖「直接调用处理函数」的场景：
// 没有 context 时按同一套 Content-Type 规则现解析，且不消耗 body（同请求可能被读两次）。
func TestSelfCheckFieldsOfFallsBackByContentType(t *testing.T) {
	request := httptest.NewRequest(http.MethodPost, "/x", strings.NewReader("a=1"))
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	if got := Text(FieldsOf(request), "a"); got != "1" {
		t.Fatalf("回退解析应得到 a=1，实得 %q", got)
	}
	// body 必须能再读一次。
	if got := Text(FieldsOf(request), "a"); got != "1" {
		t.Fatalf("第二次读取应仍然可用，实得 %q", got)
	}

	// 类型不匹配时回退也不解析（与生产路径一致）。
	plain := httptest.NewRequest(http.MethodPost, "/x", strings.NewReader(`{"a":"1"}`))
	plain.Header.Set("Content-Type", "text/plain")
	if got := Text(FieldsOf(plain), "a"); got != "" {
		t.Fatalf("text/plain 不该被解析，实得 %q", got)
	}
}
