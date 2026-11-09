// Package recorder 从 nginx 访问日志里抽取 GET /include/ajax.php 请求，
// 生成 cmd/compare（#235）能直接读取的 <service>.<action>.recorded.json 用例。
//
// 只录 GET；去掉 cookie（日志本身没有）、token、手机号、邮箱、地址、经纬度等个人信息。
// 脱敏策略偏保守：命中的参数整个丢弃，不尝试打码。
package recorder

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/compare"
)

// requestRe 在整行里找 "GET /include/ajax.php?..."，兼容 kubectl logs 加的时间戳前缀。
var requestRe = regexp.MustCompile(`"GET /include/ajax\.php\?([^" ]*) HTTP/[0-9.]+"`)

// 参数名（小写后子串匹配）命中即丢弃。
var sensitiveKeys = []string{
	"token", "cookie", "session", "sess", "passw", "pwd", "secret", "sign", "auth", "key",
	"mobile", "phone", "tel", "email", "mail", "addr", "lat", "lng", "lon", "location", "position",
	"idcard", "realname", "username", "nickname", "openid", "unionid", "code", "ticket", "uid",
}

// 与业务无关的噪音参数。
var noiseKeys = map[string]bool{"_": true, "callback": true, "t": true, "timestamp": true, "ts": true}

var (
	phoneRe = regexp.MustCompile(`\d{7,}`)                   // 任何 7 位以上连续数字（手机号、证件号、卡号）
	emailRe = regexp.MustCompile(`[^\s@]+@[^\s@]+`)          // 邮箱
	geoRe   = regexp.MustCompile(`^-?\d{1,3}\.\d{3,}$`)      // 精确小数（经纬度）
	longTok = regexp.MustCompile(`^[A-Za-z0-9_\-+/=]{32,}$`) // 疑似令牌
)

func sensitive(k, v string) bool {
	lk := strings.ToLower(k)
	for _, s := range sensitiveKeys {
		if strings.Contains(lk, s) {
			return true
		}
	}
	return phoneRe.MatchString(v) || emailRe.MatchString(v) || geoRe.MatchString(v) || longTok.MatchString(v)
}

// Record 读取日志，返回 "<service>.<action>" → 用例文件。每个 action 去重后最多 max 条（按出现顺序）。
func Record(r io.Reader, max int) (map[string]*compare.CaseFile, error) {
	files := map[string]*compare.CaseFile{}
	seen := map[string]map[string]bool{}
	sc := bufio.NewScanner(r)
	sc.Buffer(make([]byte, 1<<20), 1<<20)
	for sc.Scan() {
		m := requestRe.FindStringSubmatch(sc.Text())
		if m == nil {
			continue
		}
		q, err := url.ParseQuery(m[1])
		if err != nil {
			continue
		}
		svc, act := q.Get("service"), q.Get("action")
		if svc == "" || act == "" || strings.ContainsAny(svc+act, `/\.`) {
			continue
		}
		params := map[string]string{}
		for k, vs := range q {
			if k == "service" || k == "action" || noiseKeys[k] || len(vs) == 0 || sensitive(k, vs[0]) {
				continue
			}
			params[k] = vs[0]
		}
		name := svc + "." + act
		sig := signature(params)
		if seen[name] == nil {
			seen[name] = map[string]bool{}
		}
		if seen[name][sig] {
			continue
		}
		f := files[name]
		if f == nil {
			f = &compare.CaseFile{Schema: "./schema.json", Service: svc, Action: act}
			files[name] = f
		}
		if len(f.Cases) >= max {
			continue
		}
		seen[name][sig] = true
		f.Cases = append(f.Cases, compare.Case{
			Name: fmt.Sprintf("录制 %d", len(f.Cases)+1), Method: "GET", Params: params,
			IgnoreFields: []string{},
		})
	}
	return files, sc.Err()
}

func signature(p map[string]string) string {
	ks := make([]string, 0, len(p))
	for k := range p {
		ks = append(ks, k)
	}
	sort.Strings(ks)
	var b strings.Builder
	for _, k := range ks {
		b.WriteString(url.QueryEscape(k) + "=" + url.QueryEscape(p[k]) + "&")
	}
	return b.String()
}

// Write 把用例文件写成 <dir>/<service>.<action>.recorded.json。
func Write(dir string, files map[string]*compare.CaseFile) error {
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return err
	}
	for name, f := range files {
		raw, err := json.MarshalIndent(f, "", "  ")
		if err != nil {
			return err
		}
		if err := os.WriteFile(filepath.Join(dir, name+".recorded.json"), append(raw, '\n'), 0o644); err != nil {
			return err
		}
	}
	return nil
}
