package article

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

func cfgServe(t *testing.T, target, ua string) string {
	t.Helper()
	svc, err := New(Dep{TablePrefix: "huoniao_"})
	if err != nil {
		t.Fatal(err)
	}
	router := ajax.NewRouter(func(string) {})
	Register(router, svc)
	r := httptest.NewRequest(http.MethodGet, target, nil)
	r.Host = "canary.fbird.men"
	if ua != "" {
		r.Header.Set("User-Agent", ua)
	}
	w := httptest.NewRecorder()
	router.ServeHTTP(w, r)
	return w.Body.String()
}

func cfgInfo(t *testing.T, body string) (map[string]any, []string) {
	t.Helper()
	var env struct {
		State int             `json:"state"`
		Info  json.RawMessage `json:"info"`
	}
	if err := json.Unmarshal([]byte(body), &env); err != nil || env.State != 100 {
		t.Fatalf("响应异常: %v %s", err, body)
	}
	var m map[string]any
	_ = json.Unmarshal(env.Info, &m)
	// 取键顺序
	dec := json.NewDecoder(strings.NewReader(string(env.Info)))
	dec.Token()
	var keys []string
	for dec.More() {
		k, _ := dec.Token()
		keys = append(keys, k.(string))
		var skip json.RawMessage
		dec.Decode(&skip)
	}
	return m, keys
}

func TestConfigGolden(t *testing.T) {
	const url = "/include/ajax.php?service=article&action=config"
	m, keys := cfgInfo(t, cfgServe(t, url, ""))
	if len(keys) != 30 || keys[0] != "channelName" || keys[29] != "articleTypeOption" {
		t.Fatalf("字段数/顺序不对: %v", keys)
	}
	const pre = "http://canary.fbird.men/include/attachment.php?f="
	want := map[string]any{
		"logoUrl":           pre + defaultPic,
		"sharePic":          pre + defaultPic,
		"subDomain":         2.0,
		"channelSwitch":     0.0,
		"closeCause":        "站点升级中。。。",
		"hotline":           DefaultHotline,
		"softSize":          20480.0,
		"softType":          "zip|wa|rar|iso|doc|xsl|ppt|wps|xls|pdf|txt|csv",
		"thumbSize":         5120.0,
		"atlasSize":         5120.0,
		"atlasType":         "jpg|jpeg|gif|png|webp|svg",
		"rewardSwitch":      0.0,
		"rewardLimit":       100.0,
		"selfmediaGrantImg": pre + "VnpoWE1nSnFBVE1FUEZ3OQ==",
		"selfmediaGrantTpl": pre + "WHpBQlpBUnNCalJXYmxNeg==",
		"title":             "马尼拉华人资讯 - 本地新闻动态",
	}
	for k, v := range want {
		if m[k] != v {
			t.Errorf("%s = %v, want %v", k, m[k], v)
		}
	}
	if ro, _ := json.Marshal(m["rewardOption"]); string(ro) != "[1]" {
		t.Errorf("rewardOption = %s", ro)
	}
	if ao, _ := json.Marshal(m["articleTypeOption"]); string(ao) != `["pic","video","short_video","media","special"]` {
		t.Errorf("articleTypeOption = %s", ao)
	}
	if n := len([]rune(m["selfmediaAgreement"].(string))); n != 5993 {
		t.Errorf("agreement 长度 = %d, want 5993", n)
	}
}

func TestConfigParamDeadCode(t *testing.T) {
	a := cfgServe(t, "/include/ajax.php?service=article&action=config", "")
	b := cfgServe(t, "/include/ajax.php?service=article&action=config&param=channelName,hotline", "")
	if a != b {
		t.Fatal("param 指定字段分支是死代码，应与无参数一致")
	}
}

func TestConfigRewardSwitch(t *testing.T) {
	for name, tc := range map[string]struct{ url, ua string }{
		"platform": {"/include/ajax.php?service=article&action=config&platform_name=dy_miniprogram", ""},
		"ua":       {"/include/ajax.php?service=article&action=config", "Mozilla/5.0 ToutiaoMicroApp/1.0"},
	} {
		m, _ := cfgInfo(t, cfgServe(t, tc.url, tc.ua))
		if m["rewardSwitch"] != 1.0 {
			t.Errorf("%s: rewardSwitch = %v", name, m["rewardSwitch"])
		}
	}
}

func TestConfigJSONPAndCity(t *testing.T) {
	if got := cfgServe(t, "/include/ajax.php?service=article&action=config&callback=cb", ""); !strings.HasPrefix(got, "cb(") {
		t.Errorf("JSONP = %.20s", got)
	}
	a := cfgServe(t, "/include/ajax.php?service=article&action=config", "")
	for _, c := range []string{"2", "999"} {
		if b := cfgServe(t, "/include/ajax.php?service=article&action=config&cityid="+c, ""); a != b {
			t.Errorf("cityid=%s 输出应不变", c)
		}
	}
}
