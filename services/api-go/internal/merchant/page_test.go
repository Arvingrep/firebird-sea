// GET /tg-api/merchant/bind（落地页）的测试套件。
//
// 结构与 internal/rider/page_test.go 同构；黄金样本全部由**真实 Node 实现**
// （services/api/src/merchantRoute.js）产出，生成脚本按约定不提交，步骤照抄即可复现：
//
//  1. 在临时目录写 gen.js：
//     ① crypto.randomBytes = (n) => Buffer.alloc(n, 0x41)（nonce 恒为 goldenNonce）；
//     ② 读 merchantRoute.js 源码进内存，把 module.exports 换成同时导出
//     renderLandingPage / renderErrorPage（**不改磁盘文件**），相对 require 改绝对路径；
//     ③ 全配置 createMerchantRoute({...}).getLanding({}, res) → landing.golden；
//     ④ gateway 传 null（notConfigured）再调 getLanding → error-503.golden；
//     ⑤ 直接调 renderErrorPage('E<script>&"', '<script>alert(1)</script> & "x" \'y')
//     → error-escape.golden。
//  2. 跑 node gen.js，把它打印的字节数与 sha256 抄进本文件的 goldenPIN 表。
//
// 为什么要 sha256 钉住 fixture 本身：黄金样本是这条路由唯一的真值锚点，如果它被
// 「顺手改一下让测试变绿」，测试就退化成自证。PIN 一破，先怀疑 fixture 被改。
package merchant

import (
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

const (
	// goldenNonce 是生成脚本里 stub randomBytes(16) → 0x41 × 16 的 base64 结果。
	goldenNonce = "QUFBQUFBQUFBQUFBQUFBQQ=="

	// goldenCSP 直接取自 Node 产出的响应头（含上面那个 nonce），逐字对照。
	goldenCSP = "default-src 'none'; script-src 'self' https://telegram.org 'nonce-" + goldenNonce +
		"'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors https://web.telegram.org https://*.telegram.org; base-uri 'none'"

	// 错误页转义样本的两个入参（与生成脚本 ⑤ 完全一致；code 末尾没有撇号——
	// 生成脚本里那个 ' 是 JS 字面量的结束引号）。
	goldenEscapeCode    = `E<script>&"`
	goldenEscapeMessage = `<script>alert(1)</script> & "x" 'y`
)

// goldenPIN 是 testdata 下每个 fixture 的 sha256（生成脚本打印的值）。
var goldenPIN = map[string]string{
	"landing.golden":      "f0dc1944ed63f8d049d276a34de3b8c84411e26f40e39b0e5e79b8712677bcce",
	"error-503.golden":    "925d2d00471fd84ab555b35b74a7594c97193dd0e34f391097224e2354451443",
	"error-escape.golden": "8702845dd5f987f23ed7e38bc9a508c6b1294622c395daeecc2ab83ad1e21104",
}

// pgFixedNonce 是固定 nonce 的注入点（Node 侧对应 stub crypto.randomBytes）。
func pgFixedNonce() (string, error) { return goldenNonce, nil }

// pgConfigured 装配一个「依赖齐备」的 Route，nonce 固定。
func pgConfigured(t *testing.T) *Route {
	t.Helper()
	return bgRoute(t, nil, func(dep *Dep) { dep.Nonce = pgFixedNonce })
}

// pgGetLanding 走处理器发一次 GET /tg-api/merchant/bind。
func pgGetLanding(t *testing.T, route *Route) *httptest.ResponseRecorder {
	t.Helper()
	recorder := httptest.NewRecorder()
	route.GetLanding(recorder, httptest.NewRequest(http.MethodGet, "/tg-api/merchant/bind", nil))
	return recorder
}

// pgGolden 读 fixture 并校验 PIN：PIN 不符直接失败，避免「改 fixture 让测试变绿」。
func pgGolden(t *testing.T, name string) string {
	t.Helper()
	raw, err := os.ReadFile(filepath.Join("testdata", name))
	if err != nil {
		t.Fatalf("读取黄金样本 %s 失败（生成方式见本文件顶部注释）: %v", name, err)
	}
	sum := sha256.Sum256(raw)
	got := hex.EncodeToString(sum[:])
	if want, pinned := goldenPIN[name]; pinned && got != want {
		t.Fatalf("黄金样本 %s 的 sha256 变了：%s（PIN 记录 %s）。先确认 fixture 是否被改动", name, got, want)
	}
	return string(raw)
}

// pgAssertSameBytes 做逐字节比对，失败时给出首个差异位置与上下文。
func pgAssertSameBytes(t *testing.T, label, got, want string) {
	t.Helper()
	if got == want {
		return
	}
	limit := len(got)
	if len(want) < limit {
		limit = len(want)
	}
	at := limit
	for index := 0; index < limit; index++ {
		if got[index] != want[index] {
			at = index
			break
		}
	}
	from := at - 60
	if from < 0 {
		from = 0
	}
	gotEnd, wantEnd := at+60, at+60
	if gotEnd > len(got) {
		gotEnd = len(got)
	}
	if wantEnd > len(want) {
		wantEnd = len(want)
	}
	t.Fatalf("%s 与 Node 产出不是逐字节相同：首个差异在字节 %d\n got=%d 字节 %q\nwant=%d 字节 %q",
		label, at, len(got), got[from:gotEnd], len(want), want[from:wantEnd])
}

func TestMerchantLandingHeadersMatchNode(t *testing.T) {
	recorder := pgGetLanding(t, pgConfigured(t))

	if recorder.Code != http.StatusOK {
		t.Fatalf("落地页状态码应为 200，实际 %d", recorder.Code)
	}
	if got := recorder.Header().Get("Content-Type"); got != "text/html; charset=utf-8" {
		t.Fatalf("Content-Type = %q", got)
	}
	for header, want := range map[string]string{
		"Cache-Control":           "no-store",
		"Referrer-Policy":         "no-referrer",
		"X-Content-Type-Options":  "nosniff",
		"Content-Security-Policy": goldenCSP,
	} {
		if got := recorder.Header().Get(header); got != want {
			t.Fatalf("%s = %q，want %q", header, got, want)
		}
	}
}

func TestMerchantLandingBodyMatchesNodeGolden(t *testing.T) {
	recorder := pgGetLanding(t, pgConfigured(t))
	pgAssertSameBytes(t, "落地页 body", recorder.Body.String(), pgGolden(t, "landing.golden"))
}

// 钉住「CSP 头里的 nonce」与「body 里 <script nonce="...">」是同一个值。
func TestMerchantLandingUsesGivenNonceInBothPlaces(t *testing.T) {
	recorder := pgGetLanding(t, pgConfigured(t))
	if !strings.Contains(recorder.Body.String(), `<script nonce="`+goldenNonce+`">`) {
		t.Fatalf("body 里应出现 nonce=%q 的 script 标签", goldenNonce)
	}
	if !strings.Contains(recorder.Header().Get("Content-Security-Policy"), "'nonce-"+goldenNonce+"'") {
		t.Fatalf("CSP 头里应出现 'nonce-%s'", goldenNonce)
	}
}

// —— 503 门禁：缺 botToken / 缺网关 ——
//
// 商家链路**没有** DB 依赖（映射查询全在 PHP），所以门禁只有两条，比 rider 少一类。

func TestMerchantLandingNotConfiguredGates(t *testing.T) {
	cases := []struct {
		name   string
		mutate func(*Dep)
	}{
		{name: "botToken 空", mutate: func(dep *Dep) { dep.BotToken = "" }},
		{name: "网关未配", mutate: func(dep *Dep) { dep.Gateway = nil }},
	}
	for _, testCase := range cases {
		t.Run(testCase.name, func(t *testing.T) {
			route := bgRoute(t, nil, func(dep *Dep) {
				testCase.mutate(dep)
				dep.Nonce = pgFixedNonce
			})
			if !route.NotConfigured() {
				t.Fatalf("%s 时构造期应判定 notConfigured", testCase.name)
			}
			recorder := pgGetLanding(t, route)
			if recorder.Code != http.StatusServiceUnavailable {
				t.Fatalf("%s 时 GET 应为 503，实际 %d", testCase.name, recorder.Code)
			}
			pgAssertSameBytes(t, testCase.name+" 的错误页", recorder.Body.String(), pgGolden(t, "error-503.golden"))

			// 同一份配置下 POST bind / session 也是 503（同一个 notConfigured 判定）。
			post := bgServe(t, route, bgForm("signed:77", "09178889999"))
			if post.Code != http.StatusServiceUnavailable {
				t.Fatalf("%s 时 POST /merchant/bind 也应为 503，实际 %d", testCase.name, post.Code)
			}
			sess := bgServeJSON(t, route, `{"initData":"signed:77"}`)
			if sess.Code != http.StatusServiceUnavailable {
				t.Fatalf("%s 时 POST /merchant/session 也应为 503，实际 %d", testCase.name, sess.Code)
			}
		})
	}
}

// —— 错误页：503 逐字节 + 转义 ——

func TestMerchantErrorPage503MatchesNodeGolden(t *testing.T) {
	route := bgRoute(t, nil, func(dep *Dep) { dep.Gateway = nil })
	recorder := pgGetLanding(t, route)
	pgAssertSameBytes(t, "503 错误页 body", recorder.Body.String(), pgGolden(t, "error-503.golden"))
	// Node 的 sendError 不设 CSP：错误页没有内联脚本，也没有 nonce。
	if got := recorder.Header().Get("Content-Security-Policy"); got != "" {
		t.Fatalf("错误页不该带 CSP，实际 %q", got)
	}
}

func TestMerchantErrorPageEscapesCodeAndMessage(t *testing.T) {
	got := renderErrorPage(goldenEscapeCode, goldenEscapeMessage)
	pgAssertSameBytes(t, "转义错误页 body", got, pgGolden(t, "error-escape.golden"))

	if strings.Contains(got, "<script>alert(1)</script>") {
		t.Fatal("message 里的 <script> 未被转义：这是反射 XSS")
	}
	if strings.Contains(got, `E<script>`) {
		t.Fatal("code 里的 <script> 未被转义：这是反射 XSS")
	}
}

// —— Node 落地页要素断言（merchantRoute 文案换商家）——

func TestMerchantLandingPageMatchesNodeAssertions(t *testing.T) {
	recorder := pgGetLanding(t, pgConfigured(t))
	body := recorder.Body.String()

	for _, want := range []struct{ fragment, why string }{
		{"https://telegram.org/js/telegram-web-app.js", "必须加载 TG 的 WebApp 脚本，否则取不到 initData"},
		{`method="POST"`, "表单必须是 POST（initData 不进 URL）"},
		{`action="/tg-api/merchant/bind"`, "提交地址取自 createMerchantRoute 的默认 postPath"},
		{`name="initData"`, "隐藏域承载 initData"},
		{`name="phone"`, "手机号输入框"},
		{"商家后台", "文案必须是商家而不是骑手"},
		{"09178889999", "member.phone 实测形态的示例写法"},
		{"+639178889999", "+63 写法要有示例"},
		{"空格横线括号会自动忽略", "要解释归一行为"},
	} {
		if !strings.Contains(body, want.fragment) {
			t.Fatalf("body 缺 %q：%s", want.fragment, want.why)
		}
	}
	// 骑手文案不得混入。
	if strings.Contains(body, "骑手") || strings.Contains(body, "工作台") {
		t.Fatal("落地页混入了骑手文案：商家与骑手是两个模板，不许合并")
	}

	// pattern 里的反斜杠只能有一个（JS 的 `\\-` 在运行时就是一个反斜杠）。
	if !strings.Contains(body, `pattern="[0-9+\-() ]{7,20}"`) {
		t.Fatal("手机号 pattern 应为 [0-9+\\-() ]{7,20}（单个反斜杠），否则浏览器校验规则与 Node 不同")
	}
	if strings.Count(body, `action="`) != 1 {
		t.Fatalf("页面应恰好有一个 action 属性，实际 %d 个", strings.Count(body, `action="`))
	}
	// 按钮是商家蓝（#1F6FEB），不是骑手绿（#2E7D32）。
	if !strings.Contains(body, "#1F6FEB") || strings.Contains(body, "#2E7D32") {
		t.Fatal("落地页按钮配色与 Node 模板不一致")
	}
}
