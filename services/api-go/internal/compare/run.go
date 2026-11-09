package compare

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

// Options 是一次对比运行的参数。
type Options struct {
	PHPBase  string // PHP 站点根，如 https://canary.fbird.men
	GoBase   string // Go 兼容层所在站点根；通常与 PHPBase 相同
	GoPrefix string // Go 兼容入口前缀，默认 /go-compat
	Dir      string // 用例目录（testdata/compare）
	Cookie   string // requiresLogin 用例带上的 Cookie 头
	Only     string // 非空时只跑 <service>.<action>
	Client   *http.Client
}

// CaseResult 是单条用例的结果。
type CaseResult struct {
	File  string
	Name  string
	Diffs []Difference
}

// Result 是整次运行的结果。
type Result struct {
	Cases []CaseResult
}

// DiffCount 返回差异总数。
func (r *Result) DiffCount() int {
	n := 0
	for _, c := range r.Cases {
		n += len(c.Diffs)
	}
	return n
}

// Print 输出每条用例的结论；有差异时打印字段路径和 PHP / Go 两边的值。
func (r *Result) Print(w io.Writer) {
	for _, c := range r.Cases {
		if len(c.Diffs) == 0 {
			fmt.Fprintf(w, "PASS  %s  %s\n", c.File, c.Name)
			continue
		}
		fmt.Fprintf(w, "FAIL  %s  %s\n", c.File, c.Name)
		for _, d := range c.Diffs {
			p := d.Path
			if p == "" {
				p = "(根)"
			}
			fmt.Fprintf(w, "      %s\n        php: %s\n        go : %s\n", p, d.PHP, d.Go)
		}
	}
	fmt.Fprintf(w, "共 %d 条用例，%d 处差异\n", len(r.Cases), r.DiffCount())
}

// Run 读取 Dir 下所有用例文件并逐条对比。用例文件不合法、缺 Cookie、
// 请求失败都返回 error（调用方应以退出码 2 结束），差异则体现在 Result 里。
func Run(o Options) (*Result, error) {
	if o.Client == nil {
		o.Client = &http.Client{Timeout: 30 * time.Second}
	}
	if o.GoPrefix == "" {
		o.GoPrefix = "/go-compat"
	}
	files, err := filepath.Glob(filepath.Join(o.Dir, "*.json"))
	if err != nil {
		return nil, err
	}
	sort.Strings(files)
	res := &Result{}
	ran := 0
	for _, p := range files {
		base := filepath.Base(p)
		if base == "schema.json" {
			continue
		}
		raw, err := os.ReadFile(p)
		if err != nil {
			return nil, err
		}
		f, err := ParseCaseFile(raw)
		if err != nil {
			return nil, fmt.Errorf("%s: %w", base, err)
		}
		name := f.Service + "." + f.Action
		if base != name+".json" && base != name+".recorded.json" {
			return nil, fmt.Errorf("%s: 文件名应为 %s.json 或 %s.recorded.json", base, name, name)
		}
		if o.Only != "" && o.Only != name {
			continue
		}
		ran++
		for _, c := range f.Cases {
			if c.RequiresLogin && o.Cookie == "" {
				return nil, fmt.Errorf("%s / %s: 需要登录，请用 -cookie 或 COMPARE_COOKIE 提供", base, c.Name)
			}
			pb, err := fetch(o, o.PHPBase, "", f, c)
			if err != nil {
				return nil, fmt.Errorf("%s / %s: 请求 PHP 失败: %w", base, c.Name, err)
			}
			gb, err := fetch(o, o.GoBase, o.GoPrefix, f, c)
			if err != nil {
				return nil, fmt.Errorf("%s / %s: 请求 Go 失败: %w", base, c.Name, err)
			}
			res.Cases = append(res.Cases, CaseResult{File: base, Name: c.Name, Diffs: compareBodies(pb, gb, c.IgnoreFields)})
		}
	}
	if o.Only != "" && ran == 0 {
		return nil, fmt.Errorf("没有找到 %s 的用例文件", o.Only)
	}
	return res, nil
}

func compareBodies(php, gov []byte, ignore []string) []Difference {
	var a, b any
	ea := json.Unmarshal(php, &a)
	eb := json.Unmarshal(gov, &b)
	switch {
	case ea == nil && eb == nil:
		return Diff(a, b, ignore)
	case ea != nil && eb != nil:
		// 两边都不是 JSON：文本相同才算一致。
		if strings.TrimSpace(string(php)) == strings.TrimSpace(string(gov)) {
			return nil
		}
		return []Difference{{Path: "", PHP: abbreviate(php), Go: abbreviate(gov)}}
	default:
		return []Difference{{Path: "", PHP: abbreviate(php), Go: abbreviate(gov)}}
	}
}

func abbreviate(b []byte) string {
	s := strings.TrimSpace(string(b))
	if r := []rune(s); len(r) > 200 {
		return string(r[:200]) + "…"
	}
	return s
}

func fetch(o Options, base, prefix string, f *CaseFile, c Case) ([]byte, error) {
	if base == "" {
		return nil, errors.New("站点地址为空")
	}
	q := url.Values{}
	q.Set("service", f.Service)
	q.Set("action", f.Action)
	// service/action 只放 URL（分流只认 URL）；业务参数 GET 放查询串，POST 放表单。
	keys := make([]string, 0, len(c.Params))
	for k := range c.Params {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	form := url.Values{}
	for _, k := range keys {
		if k == "service" || k == "action" {
			return nil, fmt.Errorf("params 不能含 %s", k)
		}
		if c.Method == "GET" {
			q.Set(k, c.Params[k])
		} else {
			form.Set(k, c.Params[k])
		}
	}
	u := strings.TrimRight(base, "/") + prefix + "/include/ajax.php?" + q.Encode()
	var body io.Reader
	if c.Method == "POST" {
		body = strings.NewReader(form.Encode())
	}
	req, err := http.NewRequest(c.Method, u, body)
	if err != nil {
		return nil, err
	}
	if c.Method == "POST" {
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	}
	if c.RequiresLogin {
		req.Header.Set("Cookie", o.Cookie)
	}
	resp, err := o.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	return io.ReadAll(io.LimitReader(resp.Body, 8<<20))
}
