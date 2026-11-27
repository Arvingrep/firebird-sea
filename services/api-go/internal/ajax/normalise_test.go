package ajax

import (
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
)

// normalise 复刻入口归一，返回归一后的 Params（断言辅助）。
func normalise(t *testing.T, target string) Params {
	t.Helper()
	req := httptest.NewRequest("GET", target, nil)
	got, blocked := NormaliseParams(req)
	if blocked {
		t.Fatalf("%s 意外 blocked", target)
	}
	return Params{Values: got}
}

// Params 是断言辅助用的薄包装（避免直接依赖 url.Values 的多键遍历顺序）。
type Params struct {
	Values map[string][]string
}

func (p Params) get(key string) string {
	vs := p.Values[key]
	if len(vs) == 0 {
		return "<missing>"
	}
	return vs[0]
}

// —— verb 不对称（#364 的核心对齐点）——

func TestPagePageSizeVerbAsymmetry(t *testing.T) {
	// GET：<=0 取默认（page 1 / pageSize 10），上限 50000；POST 只做上限，负数保留。
	cases := []struct {
		name, target, key, want string
	}{
		{"GET page=0 默认 1", "/x?page=0", "page", "1"},
		{"GET pageSize=0 默认 10", "/x?pageSize=0", "pageSize", "10"},
		{"GET page=-3 默认 1", "/x?page=-3", "page", "1"},
		{"GET 越界 clamp 50000", "/x?page=99999999", "page", "50000"},
		{"GET 正常值不变", "/x?page=7&pageSize=2", "page", "7"},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			if got := normalise(t, c.target).get(c.key); got != c.want {
				t.Fatalf("%s = %q, want %q", c.key, got, c.want)
			}
		})
	}

	postCase := func(t *testing.T, name, form, key, want string) {
		t.Run(name, func(t *testing.T) {
			req := httptest.NewRequest("POST", "/x", strings.NewReader(form))
			req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
			got, blocked := NormaliseParams(req)
			if blocked {
				t.Fatal("意外 blocked")
			}
			vs := got[key]
			if len(vs) == 0 || vs[0] != want {
				t.Fatalf("%s = %v, want %q", key, vs, want)
			}
		})
	}
	postCase(t, "POST page=0 不取默认", "page=0", "page", "0")
	postCase(t, "POST page=-3 保留负数", "page=-3", "page", "-3")
	postCase(t, "POST 越界 clamp 50000", "page=99999999", "page", "50000")
	postCase(t, "POST 正常值不变", "page=7", "page", "7")
}

// page/pageSize == 'touchHome' 不进归一分支（POST 同样），原样走 RemoveXSS 链。
func TestPageTouchHomePassthrough(t *testing.T) {
	if got := normalise(t, "/x?page=touchHome&pageSize=touchHome").get("page"); got != "touchHome" {
		t.Fatalf("page = %q, want touchHome", got)
	}
}

// rsaEncrypt 分支：GET 有 resetpwd 守卫（data 键不解密、其它键解密），POST 没有。
func TestRsaEncryptResetpwdGuard(t *testing.T) {
	payload := strings.Repeat("a", 172)
	defer func(orig func(string) string) { RSADecrypt = orig }(RSADecrypt)
	RSADecrypt = func(s string) string { return "DEC:" + s }

	req := httptest.NewRequest("GET", "/x?action=resetpwd&rsaEncrypt=1&data="+payload+"&phone="+payload, nil)
	got, _ := NormaliseParams(req)
	if vs := got["data"]; len(vs) == 0 || vs[0] != payload {
		t.Fatalf("GET resetpwd 的 data 不应解密: %v", vs)
	}
	if vs := got["phone"]; len(vs) == 0 || vs[0] != "DEC:"+payload {
		t.Fatalf("GET resetpwd 的 phone 应解密: %v", vs)
	}

	req = httptest.NewRequest("GET", "/x?action=other&rsaEncrypt=1&data="+payload, nil)
	got, _ = NormaliseParams(req)
	if vs := got["data"]; len(vs) == 0 || vs[0] != "DEC:"+payload {
		t.Fatalf("非 resetpwd 时 data 应解密: %v", vs)
	}

	req = httptest.NewRequest("POST", "/x?action=resetpwd", strings.NewReader("rsaEncrypt=1&data="+payload))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	got, _ = NormaliseParams(req)
	if vs := got["data"]; len(vs) == 0 || vs[0] != "DEC:"+payload {
		t.Fatalf("POST 无守卫，data 应解密: %v", vs)
	}

	// rsaEncrypt != 1 时整个分支不生效。
	req = httptest.NewRequest("GET", "/x?action=other&rsaEncrypt=0&data="+payload, nil)
	got, _ = NormaliseParams(req)
	if vs := got["data"]; len(vs) == 0 || vs[0] != payload {
		t.Fatalf("rsaEncrypt=0 时不应解密: %v", vs)
	}
}

// —— 特殊键分支 ——

func TestAmountIDUndefinedBranches(t *testing.T) {
	p := normalise(t, "/x?amount=12.50&id=1,2,abc&cityid=undefined&price=pricePlaceholder&foo=undefined&lng=undefined&lat=1.5&amount2=1e3")
	for key, want := range map[string]string{
		"amount": "12.5", "id": "1,2,0", "cityid": "",
		"price": "", "foo": "", "lng": "", "lat": "1.5",
		"amount2": "1e3", // 只有精确键名 amount 才强转，amount2 走终态 else 原样保留
	} {
		if got := p.get(key); got != want {
			t.Fatalf("%s = %q, want %q", key, got, want)
		}
	}
}

// JSON（'[{' 或能解码成 PHP 数组/关联数组）原样透传，不进 RemoveXSS 链。
func TestJSONPassthrough(t *testing.T) {
	for key, raw := range map[string]string{
		"j1": `[{"a":1}]`, "j2": "{}", "j3": "[1,2]", "j4": `{"k":"v"}`,
	} {
		if got := normalise(t, "/x?"+key+"="+strings.ReplaceAll(raw, `"`, `%22`)).get(key); got != raw {
			t.Fatalf("%s = %q, want %q（JSON 应原样透传）", key, got, raw)
		}
	}
	// 非 JSON 字符串正常走链
	if got := normalise(t, "/x?m=[1").get("m"); got != "[1" {
		t.Fatalf("m = %q, want [1", got)
	}
}

// —— RemoveXSS 链（终态 else）——

func TestTerminalElseXSSChain(t *testing.T) {
	cases := []struct{ name, in, want string }{
		{"script 标签", "<script>alert(1)</script>", "<sc<x>ript>alert(1)</sc<x>ript>"},
		{"迭代不动点", "scrscriptipt", "scrsc<x>riptipt"},
		{"onerror", "onerror=x", "on<x>error=x"},
		{"实体编码 script", "&#x73;cript", "sc<x>ript"},
		{"十进制实体", "&#115;cript", "sc<x>ript"},
		{"实体交错", "ja&#x0A;vascript", "ja<x>vasc<x>ript"}, // javascript 交错命中后，残留的 script 再被打断一次
		{"普通文本不受影响", "你好 world 123", "你好 world 123"},
		{"反斜杠对剥一次", `ab\cd`, "abcd"},
		{"成对反斜杠剥一次", `a\\b`, `a\b`},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			target := "/x?a=" + urlQueryEscape(c.in)
			if got := normalise(t, target).get("a"); got != c.want {
				t.Fatalf("a = %q, want %q", got, c.want)
			}
		})
	}
}

// urlQueryEscape 对应 PHP http_build_query 的 RFC1738 口径（空格 → +）。
func urlQueryEscape(s string) string {
	return strings.ReplaceAll(strings.ReplaceAll(url.QueryEscape(s), "%2B", "+"), "%20", "+")
}

// 键名归一：description 之外做 htmlspecialchars(RemoveXSS(key))。
func TestKeyNormalisation(t *testing.T) {
	p := normalise(t, "/x?a%3Cb=1&description=<script>&v=2")
	if got := p.get("a&lt;b"); got != "1" {
		t.Fatalf("a&lt;b = %q, want 1", got)
	}
	if got := p.get("description"); got != "<sc<x>ript>" {
		t.Fatalf("description = %q（键名不归一，但值仍走 RemoveXSS 链）", got)
	}
	if got := p.get("v"); got != "2" {
		t.Fatalf("v = %q, want 2", got)
	}
}

// service/action/callback/_ 不进 Params；POST 覆盖 GET；数组键保留 k[] 约定。
func TestMergeAndExcludedKeys(t *testing.T) {
	req := httptest.NewRequest("POST", "/x?service=member&action=ping&callback=cb&_=1&a=1&list[]=x&list[]=y",
		strings.NewReader("service=evil&a=2&list[]=z"))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	got, blocked := NormaliseParams(req)
	if blocked {
		t.Fatal("意外 blocked")
	}
	for _, k := range []string{"service", "action", "callback", "_"} {
		if _, exists := got[k]; exists {
			t.Fatalf("%s 不应进入 Params", k)
		}
	}
	if vs := got["a"]; len(vs) != 1 || vs[0] != "2" {
		t.Fatalf("a = %v, want [2]（POST 覆盖）", vs)
	}
	if vs := got["list[]"]; len(vs) != 1 || vs[0] != "z" {
		t.Fatalf("list[] = %v, want [z]（POST 数组整体覆盖）", vs)
	}
}

// blocked：键名或值以 _GET/_POST/_COOKIE 开头 → PHP exit('Request var not allow!')。
func TestGPCBlocked(t *testing.T) {
	req := httptest.NewRequest("GET", "/x?a=_GETfoo", nil)
	if _, blocked := NormaliseParams(req); !blocked {
		t.Fatal("值以 _GET 开头应 blocked")
	}
	req = httptest.NewRequest("GET", "/x?_GETx=1", nil)
	if _, blocked := NormaliseParams(req); !blocked {
		t.Fatal("键名以 _GET 开头应 blocked")
	}
	req = httptest.NewRequest("GET", "/x?a=ok", nil)
	req.Header.Set("Cookie", "sid=_COOKIEv")
	if _, blocked := NormaliseParams(req); !blocked {
		t.Fatal("Cookie 值以 _COOKIE 开头应 blocked")
	}
	req = httptest.NewRequest("GET", "/x?a=GETxxx", nil)
	if _, blocked := NormaliseParams(req); blocked {
		t.Fatal("前缀必须完整匹配 _GET/_POST/_COOKIE")
	}
}
