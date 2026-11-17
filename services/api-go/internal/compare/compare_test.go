package compare

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestParseCaseFile(t *testing.T) {
	bad := map[string]string{
		"缺 cases":      `{"service":"a","action":"b"}`,
		"cases 为空":     `{"service":"a","action":"b","cases":[]}`,
		"method 非法":    `{"service":"a","action":"b","cases":[{"name":"x","method":"PUT"}]}`,
		"多余字段":         `{"service":"a","action":"b","cases":[{"name":"x","method":"GET","foo":1}]}`,
		"params 值非字符串": `{"service":"a","action":"b","cases":[{"name":"x","method":"GET","params":{"p":1}}]}`,
		"ignore 含空串":   `{"service":"a","action":"b","cases":[{"name":"x","method":"GET","ignoreFields":[""]}]}`,
		"缺 service":    `{"action":"b","cases":[{"name":"x","method":"GET"}]}`,
		"不是 JSON":      `nope`,
	}
	for name, src := range bad {
		if _, err := ParseCaseFile([]byte(src)); err == nil {
			t.Errorf("%s: 应报错", name)
		}
	}
	f, err := ParseCaseFile([]byte(`{"$schema":"./schema.json","service":"a","action":"b","cases":[{"name":"x","method":"GET","params":{"p":"1"},"ignoreFields":["info.ts"]}]}`))
	if err != nil {
		t.Fatal(err)
	}
	if f.Service != "a" || f.Cases[0].Params["p"] != "1" || f.Cases[0].IgnoreFields[0] != "info.ts" {
		t.Fatalf("解析结果不对: %+v", f)
	}
}

func TestSchemaFileMatchesParser(t *testing.T) {
	raw, err := os.ReadFile(filepath.Join("..", "..", "testdata", "compare", "schema.json"))
	if err != nil {
		t.Fatal(err)
	}
	var s map[string]any
	if err := json.Unmarshal(raw, &s); err != nil {
		t.Fatalf("schema.json 不是合法 JSON: %v", err)
	}
	// 仓库里所有用例文件（含 #299 录制的）都必须通过解析器校验。
	files, _ := filepath.Glob(filepath.Join("..", "..", "testdata", "compare", "*.json"))
	for _, p := range files {
		if filepath.Base(p) == "schema.json" {
			continue
		}
		b, _ := os.ReadFile(p)
		if _, err := ParseCaseFile(b); err != nil {
			t.Errorf("%s: %v", p, err)
		}
	}
}

func TestDiff(t *testing.T) {
	parse := func(s string) any {
		var v any
		if err := json.Unmarshal([]byte(s), &v); err != nil {
			t.Fatal(err)
		}
		return v
	}
	cases := []struct {
		name         string
		a, b, ignore string
		want         []string // 期望的路径
	}{
		{"相同", `{"state":100,"info":"ok"}`, `{"state":100,"info":"ok"}`, ``, nil},
		{"值不同", `{"state":100,"info":"ok"}`, `{"state":100,"info":"no"}`, ``, []string{"info"}},
		{"缺字段", `{"a":1,"b":2}`, `{"a":1}`, ``, []string{"b"}},
		{"多字段", `{"a":1}`, `{"a":1,"b":2}`, ``, []string{"b"}},
		{"类型不同", `{"a":1}`, `{"a":"1"}`, ``, []string{"a"}},
		{"数组长度", `{"l":[1,2]}`, `{"l":[1]}`, ``, []string{"l[1]"}},
		{"数组元素", `{"l":[{"id":1},{"id":2}]}`, `{"l":[{"id":1},{"id":3}]}`, ``, []string{"l[1].id"}},
		{"忽略字段", `{"state":100,"info":{"ts":1}}`, `{"state":100,"info":{"ts":2}}`, `info.ts`, nil},
		{"忽略数组任意下标", `{"l":[{"id":1,"t":1},{"id":2,"t":2}]}`, `{"l":[{"id":1,"t":9},{"id":2,"t":8}]}`, `l[].t`, nil},
		{"忽略不影响其他", `{"a":1,"b":1}`, `{"a":2,"b":2}`, `a`, []string{"b"}},
		{"整数与浮点同值", `{"a":1}`, `{"a":1.0}`, ``, nil},
		{"null 与缺失不同", `{"a":null}`, `{}`, ``, []string{"a"}},
	}
	for _, c := range cases {
		var ign []string
		if c.ignore != "" {
			ign = []string{c.ignore}
		}
		got := Diff(parse(c.a), parse(c.b), ign)
		var paths []string
		for _, d := range got {
			paths = append(paths, d.Path)
		}
		if strings.Join(paths, ",") != strings.Join(c.want, ",") {
			t.Errorf("%s: 路径 %v, 期望 %v", c.name, paths, c.want)
		}
	}
	d := Diff(parse(`{"info":"ok"}`), parse(`{"info":"no"}`), nil)
	if len(d) != 1 || d[0].PHP != `"ok"` || d[0].Go != `"no"` {
		t.Errorf("差异应带两边的值: %+v", d)
	}
}

// 假 PHP / 假 Go：同一路径返回可控的 JSON。
func fake(body *string, gotPath *string, gotCookie *string) *httptest.Server {
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if gotPath != nil {
			*gotPath = r.URL.Path + "?" + r.URL.RawQuery
		}
		if gotCookie != nil {
			*gotCookie = r.Header.Get("Cookie")
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(*body))
	}))
}

func writeCase(t *testing.T, dir, name, content string) {
	t.Helper()
	if err := os.WriteFile(filepath.Join(dir, name), []byte(content), 0o644); err != nil {
		t.Fatal(err)
	}
}

func TestRunZeroAndNonZeroDiff(t *testing.T) {
	phpBody := `{"state":100,"info":{"v":"1","ts":1}}`
	goBody := `{"state":100,"info":{"v":"1","ts":2}}`
	var phpPath, goPath string
	php := fake(&phpBody, &phpPath, nil)
	gos := fake(&goBody, &goPath, nil)
	defer php.Close()
	defer gos.Close()

	dir := t.TempDir()
	writeCase(t, dir, "a.b.json", `{"service":"a","action":"b","cases":[{"name":"c1","method":"GET","params":{"id":"7"},"ignoreFields":["info.ts"]}]}`)

	opts := Options{PHPBase: php.URL, GoBase: gos.URL, GoPrefix: "/go-compat", Dir: dir}
	res, err := Run(opts)
	if err != nil {
		t.Fatal(err)
	}
	if res.DiffCount() != 0 {
		t.Fatalf("忽略 ts 后应零差异: %+v", res)
	}
	if !strings.HasPrefix(phpPath, "/include/ajax.php?") || !strings.Contains(phpPath, "service=a") || !strings.Contains(phpPath, "action=b") || !strings.Contains(phpPath, "id=7") {
		t.Errorf("PHP 请求不对: %s", phpPath)
	}
	if !strings.HasPrefix(goPath, "/go-compat/include/ajax.php?") {
		t.Errorf("Go 请求应走 /go-compat: %s", goPath)
	}

	// 人为改一个返回字段 → 必须检出。
	goBody = `{"state":100,"info":{"v":"CHANGED","ts":2}}`
	res, err = Run(opts)
	if err != nil {
		t.Fatal(err)
	}
	if res.DiffCount() != 1 {
		t.Fatalf("应检出 1 处差异: %+v", res)
	}
	var sb strings.Builder
	res.Print(&sb)
	out := sb.String()
	if !strings.Contains(out, "info.v") || !strings.Contains(out, `"1"`) || !strings.Contains(out, `"CHANGED"`) {
		t.Errorf("输出应含字段路径和两边的值: %s", out)
	}
}

func TestRunPostAndLogin(t *testing.T) {
	body := `{"state":100}`
	var cookie string
	php := fake(&body, nil, &cookie)
	gos := fake(&body, nil, nil)
	defer php.Close()
	defer gos.Close()
	dir := t.TempDir()
	writeCase(t, dir, "a.b.json", `{"service":"a","action":"b","cases":[{"name":"c1","method":"POST","params":{"x":"1"},"requiresLogin":true}]}`)

	opts := Options{PHPBase: php.URL, GoBase: gos.URL, GoPrefix: "/go-compat", Dir: dir}
	if _, err := Run(opts); err == nil {
		t.Fatal("需要登录但没给 cookie，应报错")
	}
	opts.Cookie = "PHPSESSID=abc"
	res, err := Run(opts)
	if err != nil || res.DiffCount() != 0 {
		t.Fatalf("err=%v res=%+v", err, res)
	}
	if cookie != "PHPSESSID=abc" {
		t.Errorf("cookie 未带上: %q", cookie)
	}
}

func TestRunNonJSONAndBadFile(t *testing.T) {
	body := `<html>oops</html>`
	php := fake(&body, nil, nil)
	gos := fake(&body, nil, nil)
	defer php.Close()
	defer gos.Close()
	dir := t.TempDir()
	writeCase(t, dir, "a.b.json", `{"service":"a","action":"b","cases":[{"name":"c1","method":"GET"}]}`)
	res, err := Run(Options{PHPBase: php.URL, GoBase: gos.URL, GoPrefix: "/go-compat", Dir: dir})
	if err != nil {
		t.Fatal(err)
	}
	// 非 JSON 响应：两边文本一致算通过，不一致算差异。
	if res.DiffCount() != 0 {
		t.Errorf("文本相同应通过: %+v", res)
	}

	writeCase(t, dir, "bad.x.json", `{"service":"bad"}`)
	if _, err := Run(Options{PHPBase: php.URL, GoBase: gos.URL, GoPrefix: "/go-compat", Dir: dir}); err == nil {
		t.Fatal("用例不符合 schema 应报错")
	}
}

func TestFilenameMustMatchServiceAction(t *testing.T) {
	body := `{}`
	s := fake(&body, nil, nil)
	defer s.Close()
	dir := t.TempDir()
	writeCase(t, dir, "x.y.json", `{"service":"a","action":"b","cases":[{"name":"c","method":"GET"}]}`)
	if _, err := Run(Options{PHPBase: s.URL, GoBase: s.URL, GoPrefix: "/go-compat", Dir: dir}); err == nil {
		t.Fatal("文件名与 service.action 不一致应报错")
	}
}
