// GET /tg-api/rider/bind（落地页）的测试套件。
//
// 翻译来源：
//   - services/api/test/rider-route.test.js:122-149（两条落地页用例，逐条对应在
//     TestLandingPageMatchesNodeAssertions 里）
//   - 同文件 350-360（配置缺失 GET 也 503 → TestLandingNotConfiguredGates）
//   - services/api/src/riderRoute.js:151-170（sendError / getLanding）、33-98（两个模板）
//
// # 黄金样本是怎么来的（复现步骤）
//
// testdata/*.golden 全部由**真实 Node 实现**产出，不是手抄的 HTML。生成脚本是临时的、
// 按约定不提交，这里留完整步骤，照抄即可复现：
//
//  1. 在一个临时目录（例如 /tmp/fbs-rider-golden/gen.js）写：
//
//     const path = require('node:path');
//     const crypto = require('node:crypto');
//     // ① 固定随机源：16 字节全 0x41 → nonce 恒为 "QUFBQUFBQUFBQUFBQUFBQQ=="。
//     //    riderRoute.js 持有的是同一个 module 对象，改属性即对被测代码生效。
//     crypto.randomBytes = (n) => Buffer.alloc(n, 0x41);
//     const { createRiderRoute } = require('<repo>/services/api/src/riderRoute.js');
//     // ② 极简 res stub，setHeader 全小写键、type('html') 落 text/html; charset=utf-8，
//     //    与 Express 的 res.type('html') 一致（Node 测试 makeRes 同款）。
//     const res = { headers: {}, setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
//     status(c) { this.statusCode = c; return this; },
//     type(t) { this.headers['content-type'] = 'text/html; charset=utf-8'; return this; },
//     send(b) { this.body = String(b); return this; } };
//     // ③ 200：全配置（botToken + validateInitData + gateway + conn 都非空）
//     createRiderRoute({ botToken: 'test-bot-token-not-a-secret', validateInitData: () => ({ valid: true }),
//     gateway: { riderBind: async () => ({}), riderQl: async () => ({}) },
//     conn: { query: async () => ” } }).getLanding({}, res);
//     fs.writeFileSync('testdata/landing.golden', res.body);
//     // ④ 503：gateway 传 null（notConfigured），同样调 getLanding → 落 error-503.golden
//     // ⑤ 转义样本：getLanding 的 code/message 是常量，触发不到自定义内容，
//     //    所以把 riderRoute.js 源码读进内存、只在 module.exports 里补上 renderErrorPage
//     //    （**不改磁盘文件**），再用 code='E<script>&"\”、message='<script>alert(1)</script> & "x" \'y\”
//     //    调它，落 error-escape.golden。
//
//  2. 跑 `node gen.js`，把它打印的 body 字节数与 sha256 抄进本文件的 goldenPIN 表。
//
// 为什么要 sha256 钉住 fixture 本身：黄金样本是这条路由唯一的真值锚点，如果它被「顺手
// 改一下让测试变绿」，测试就退化成自证。PIN 一破，先怀疑 fixture 被改，而不是实现。
package rider

import (
	"bytes"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

const (
	// goldenNonce 是生成脚本里 stub randomBytes(16) → 0x41 × 16 的 base64 结果
	// （标准 base64，带 == 填充，共 24 字符）。测试里用 pgFixedNonce 原样返回它。
	goldenNonce = "QUFBQUFBQUFBQUFBQUFBQQ=="

	// goldenCSP 直接取自 Node 产出的响应头（含上面那个 nonce），逐字对照。
	goldenCSP = "default-src 'none'; script-src 'self' https://telegram.org 'nonce-" + goldenNonce +
		"'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors https://web.telegram.org https://*.telegram.org; base-uri 'none'"

	// 错误页转义样本的两个入参（与生成脚本 ⑤ 完全一致）。
	goldenEscapeCode    = `E<script>&"'`
	goldenEscapeMessage = `<script>alert(1)</script> & "x" 'y'`
)

// goldenPIN 是 testdata 下每个 fixture 的 sha256（生成脚本打印的值）。
// 改实现不改 fixture 才有可能变绿；fixture 被动过则先红在 PIN 上。
var goldenPIN = map[string]string{
	"landing.golden":      "ca0c3bbffdd303fcf224e19456c9e1318f6c1bfe753632a3f37d2ccff17f594b",
	"error-503.golden":    "60f1f07aa25f80db013d4564db4dbde2d2eede1af3e3a183a85a454edc6e9b8f",
	"error-escape.golden": "5ea3e1a2a975c3e62ab07cadaf34c79d923cea09ecbf3467d16acc7f5ab3070c",
}

// pgFixedNonce 是固定 nonce 的注入点（Node 侧对应 stub crypto.randomBytes）。
func pgFixedNonce() (string, error) { return goldenNonce, nil }

// pgConfigured 装配一个「四件依赖齐备」的 Route（Node 的 makeDeps 等价物），nonce 固定。
func pgConfigured(t *testing.T) *Route {
	t.Helper()
	return rwRoute(t, func(dep *Dep) { dep.Nonce = pgFixedNonce })
}

// pgGetLanding 走处理器发一次 GET /tg-api/rider/bind。
func pgGetLanding(t *testing.T, route *Route) *httptest.ResponseRecorder {
	t.Helper()
	recorder := httptest.NewRecorder()
	route.GetLanding(recorder, httptest.NewRequest(http.MethodGet, "/tg-api/rider/bind", nil))
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

// pgAssertSameBytes 做逐字节比对，失败时给出首个差异位置与上下文
// （不比肉眼扫 HTML：差异往往是一个空格或一个反斜杠）。
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

// —— 1. 200：状态、头、body（行为清单第 3-6 条）——

func TestLandingPageHeadersMatchNode(t *testing.T) {
	recorder := pgGetLanding(t, pgConfigured(t))

	if recorder.Code != http.StatusOK {
		t.Fatalf("落地页状态码应为 200，实际 %d", recorder.Code)
	}
	// Node 的 res.type('html') 落的就是这一串。
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

func TestLandingPageBodyMatchesNodeGolden(t *testing.T) {
	recorder := pgGetLanding(t, pgConfigured(t))
	pgAssertSameBytes(t, "落地页 body", recorder.Body.String(), pgGolden(t, "landing.golden"))
}

// TestLandingPageUsesGivenNonceInBothPlaces 钉住「CSP 头里的 nonce」与「body 里
// <script nonce="...">」是同一个值 —— 两处不一致时浏览器会静默丢掉内联脚本，
// 表现就是「TG 里打开一片空白、没有任何报错」。
func TestLandingPageUsesGivenNonceInBothPlaces(t *testing.T) {
	recorder := pgGetLanding(t, pgConfigured(t))
	if !strings.Contains(recorder.Body.String(), `<script nonce="`+goldenNonce+`">`) {
		t.Fatalf("body 里应出现 nonce=%q 的 script 标签", goldenNonce)
	}
	if !strings.Contains(recorder.Header().Get("Content-Security-Policy"), "'nonce-"+goldenNonce+"'") {
		t.Fatalf("CSP 头里应出现 'nonce-%s'", goldenNonce)
	}
}

// —— 2. nonce 本身：24 字符标准 base64、两次请求不同（行为清单第 3 条）——

func TestLandingPageNonceIsStandardBase64Of16Bytes(t *testing.T) {
	// 先自证黄金样本的前提没写错：16 字节 0x41 的标准 base64 就是 goldenNonce。
	selfCheck := base64.StdEncoding.EncodeToString(bytes.Repeat([]byte{0x41}, 16))
	if selfCheck != goldenNonce {
		t.Fatalf("黄金样本前提失配：16×0x41 的 base64 = %q，而 fixture 用的是 %q", selfCheck, goldenNonce)
	}

	recorder := pgGetLanding(t, rwRoute(t, nil)) // 不注入 Nonce → 走 htmlpage.NewNonce（生产路径）
	csp := recorder.Header().Get("Content-Security-Policy")
	nonce := pgCSPNonce(t, csp)
	if len(nonce) != 24 {
		t.Fatalf("nonce 长度应为 24（16 字节标准 base64），实际 %d：%q", len(nonce), nonce)
	}
	decoded, err := base64.StdEncoding.Strict().DecodeString(nonce)
	if err != nil {
		t.Fatalf("nonce %q 不是合法的标准 base64（带填充）: %v", nonce, err)
	}
	if len(decoded) != 16 {
		t.Fatalf("nonce 解码后应为 16 字节，实际 %d", len(decoded))
	}
	if !strings.Contains(recorder.Body.String(), `<script nonce="`+nonce+`">`) {
		t.Fatalf("body 里的 script nonce 与 CSP 头不一致（nonce=%q）", nonce)
	}
}

func TestLandingPageNonceChangesPerRequest(t *testing.T) {
	route := rwRoute(t, nil)
	first := pgCSPNonce(t, pgGetLanding(t, route).Header().Get("Content-Security-Policy"))
	second := pgCSPNonce(t, pgGetLanding(t, route).Header().Get("Content-Security-Policy"))
	if first == second {
		t.Fatalf("两次请求的 nonce 相同（%q）：随机源没生效，nonce 会被缓存复用", first)
	}
}

// pgCSPNonce 从 CSP 头里取 'nonce-...' 的值。
func pgCSPNonce(t *testing.T, csp string) string {
	t.Helper()
	_, rest, found := strings.Cut(csp, "'nonce-")
	if !found {
		t.Fatalf("CSP 里没有 nonce：%q", csp)
	}
	nonce, _, found := strings.Cut(rest, "'")
	if !found || nonce == "" {
		t.Fatalf("CSP 里的 nonce 格式不对：%q", csp)
	}
	return nonce
}

// —— 3. 503 门禁：四类缺失（行为清单第 1、2 条）——

// TestLandingNotConfiguredGates 逐个拆依赖，证明「缺 botToken / 缺网关即 503」。
// 顺序照 Node createRiderRoute 的 missing 顺序（riderRoute.js:124-129）。
//
// 另外两条**不是**门禁，各有专门用例：
//   - 「initData 验签模块未装」在 Go 侧结构上不可达（validate 恒有默认实现），
//     见 TestLandingNilValidateFallsBackToDefault；
//   - 「DB 空」在 Node 侧也不可达（conn 恒非空），见 TestLandingNilDBStillServes。
func TestLandingNotConfiguredGates(t *testing.T) {
	cases := []struct {
		name   string
		mutate func(*Dep)
	}{
		{name: "botToken 空", mutate: func(dep *Dep) { dep.BotToken = "" }},
		{name: "网关未配", mutate: func(dep *Dep) { dep.Gateway = nil }},
	}
	for _, testCase := range cases {
		t.Run(testCase.name, func(t *testing.T) {
			route := rwRoute(t, func(dep *Dep) {
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
			// GET 自身不用网关，但仍受它门禁——这是 Node 的实际行为
			// （riderRoute.js:123-132 构造期算好，getLanding 第 159 行直接复用）。
			pgAssertSameBytes(t, testCase.name+" 的错误页", recorder.Body.String(), pgGolden(t, "error-503.golden"))
			pgAssertErrorHeaders(t, recorder, "")

			// 同一份配置下 POST session 也是 503（同一个 notConfigured 判定），
			// 保证「门禁口径只有一处」。
			post := rwServe(t, route, rwBody("signed:77"), "")
			if post.Code != http.StatusServiceUnavailable {
				t.Fatalf("%s 时 POST /rider/session 也应为 503，实际 %d", testCase.name, post.Code)
			}
		})
	}
}

// TestLandingNilDBStillServes 钉住「DB 不是门禁」这条 Node 事实。
//
// Node 的 conn 恒非空：server.js:458 传 cliConn()，它无条件返回一个 query 对象
// （migrate.js:37-52），DB_HOST 缺失只会在真正 spawn 时失败。所以 riderRoute.js:128
// 的 `if (!conn)` 在生产装配里是死代码，缺库时 GET 照样 200。
// Go 早期把 nil DB 当门禁，凭空造出一条 Node 没有的 503（真双进程对拍：Node 200 / Go 503），
// 这条用例钉死回归。
func TestLandingNilDBStillServes(t *testing.T) {
	route := rwRoute(t, func(dep *Dep) {
		dep.DB = nil
		dep.Nonce = pgFixedNonce
	})
	if route.NotConfigured() {
		t.Fatal("nil DB 不该被判成未配置：Node 的 conn 恒非空")
	}
	recorder := pgGetLanding(t, route)
	if recorder.Code != http.StatusOK {
		t.Fatalf("缺 DB 时落地页应为 200（Node 行为），实际 %d", recorder.Code)
	}
	pgAssertSameBytes(t, "缺 DB 时的落地页 body", recorder.Body.String(), pgGolden(t, "landing.golden"))
}

// TestLandingNilValidateFallsBackToDefault 记录第四道门禁的结构差异：
// Node 的 `if (!validateInitData) missing.push(...)` 在 Go 侧没有对应分支
// （nil 一律回落到 tgauth.Validate），所以「只缺验签模块」不会 503。
func TestLandingNilValidateFallsBackToDefault(t *testing.T) {
	route := rwRoute(t, func(dep *Dep) {
		dep.ValidateInitData = nil
		dep.Nonce = pgFixedNonce
	})
	if route.NotConfigured() {
		t.Fatal("nil ValidateInitData 应回落到默认实现，不该被判成未配置")
	}
	if code := pgGetLanding(t, route).Code; code != http.StatusOK {
		t.Fatalf("其它依赖齐备时落地页应为 200，实际 %d", code)
	}
}

// pgAssertErrorHeaders 断言错误页的头：三件安全头 + text/html；
// csp 为空表示 Node 的 sendError **不**设 CSP（与 200 分支的差别，别顺手补上）。
func pgAssertErrorHeaders(t *testing.T, recorder *httptest.ResponseRecorder, csp string) {
	t.Helper()
	if got := recorder.Header().Get("Content-Type"); got != "text/html; charset=utf-8" {
		t.Fatalf("错误页 Content-Type = %q", got)
	}
	for header, want := range map[string]string{
		"Cache-Control":           "no-store",
		"Referrer-Policy":         "no-referrer",
		"X-Content-Type-Options":  "nosniff",
		"Content-Security-Policy": csp,
	} {
		if got := recorder.Header().Get(header); got != want {
			t.Fatalf("错误页 %s = %q，want %q", header, got, want)
		}
	}
}

// —— 4. 错误页：503 逐字节 + 转义（行为清单第 2 条）——

func TestErrorPage503MatchesNodeGolden(t *testing.T) {
	route := rwRoute(t, func(dep *Dep) { dep.Gateway = nil })
	recorder := pgGetLanding(t, route)
	pgAssertSameBytes(t, "503 错误页 body", recorder.Body.String(), pgGolden(t, "error-503.golden"))
	// Node 的 sendError 不设 CSP：错误页没有内联脚本，也没有 nonce。
	pgAssertErrorHeaders(t, recorder, "")
}

// TestErrorPageEscapesCodeAndMessage 用带标签/引号/& 的 code 与 message 证明转义生效，
// 并与 Node 产出逐字节对照（escapeHtml 的五个实体必须逐字一致，`'` 是 &#39; 不是 &#x27;）。
func TestErrorPageEscapesCodeAndMessage(t *testing.T) {
	got := renderErrorPage(goldenEscapeCode, goldenEscapeMessage)
	pgAssertSameBytes(t, "转义错误页 body", got, pgGolden(t, "error-escape.golden"))

	if strings.Contains(got, "<script>alert(1)</script>") {
		t.Fatal("message 里的 <script> 未被转义：这是反射 XSS")
	}
	if strings.Contains(got, `E<script>`) {
		t.Fatal("code 里的 <script> 未被转义：这是反射 XSS")
	}
	if !strings.Contains(got, "&lt;script&gt;alert(1)&lt;/script&gt;") {
		t.Fatalf("message 应按 Node 的实体表转义，实际 body=%s", got)
	}
}

// —— 5. Node 两条落地页用例的逐条翻译（rider-route.test.js:122-149）——

func TestLandingPageMatchesNodeAssertions(t *testing.T) {
	recorder := pgGetLanding(t, pgConfigured(t))
	body := recorder.Body.String()

	// Node 用例 1：页面要素齐全。
	for _, want := range []struct{ fragment, why string }{
		{"https://telegram.org/js/telegram-web-app.js", "必须加载 TG 的 WebApp 脚本，否则取不到 initData"},
		{`method="POST"`, "表单必须是 POST（initData 不进 URL）"},
		{`action="/tg-api/rider/bind"`, "提交地址取自 createRiderRoute 的默认 postPath"},
		{`name="initData"`, "隐藏域承载 initData"},
		{`name="phone"`, "手机号输入框"},
		{"请从 Telegram 内打开", "无 initData 的非 TG 环境要有提示文案"},
		// Node 用例 2：可接受的手机号写法与归一说明（M4）。
		{"09171234567", "示例写法要出现在页面上"},
		{"+639171234567", "+63 写法要有示例"},
		{"空格横线括号会自动忽略", "要解释归一行为"},
	} {
		if !strings.Contains(body, want.fragment) {
			t.Fatalf("body 缺 %q：%s", want.fragment, want.why)
		}
	}

	// 开头的 doctype 必须是小写 <!doctype html>（Node 模板逐字如此）。
	if !strings.HasPrefix(body, "<!doctype html>\n") {
		head := body
		if len(head) > 20 {
			head = head[:20]
		}
		t.Fatalf("body 应以小写 <!doctype html> 开头，实际前 20 字节 %q", head)
	}
	// pattern 里的反斜杠只能有一个（JS 的 `\\-` 在运行时就是一个反斜杠）。
	if !strings.Contains(body, `pattern="[0-9+\-() ]{7,20}"`) {
		t.Fatal("手机号 pattern 应为 [0-9+\\-() ]{7,20}（单个反斜杠），否则浏览器校验规则与 Node 不同")
	}
	if strings.Contains(body, `\\-`) {
		t.Fatal("pattern 里出现了两个反斜杠：Go 侧多转义了一层")
	}
	// 表单只提交到本路径，且不许出现别的 action。
	if strings.Count(body, `action="`) != 1 {
		t.Fatalf("页面应恰好有一个 action 属性，实际 %d 个", strings.Count(body, `action="`))
	}

	// Node 用例 1 的 CSP 三段 + 头里的 no-store。
	csp := recorder.Header().Get("Content-Security-Policy")
	for _, fragment := range []string{
		"script-src 'self' https://telegram.org 'nonce-",
		"frame-ancestors https://web.telegram.org",
		"form-action 'self'",
	} {
		if !strings.Contains(csp, fragment) {
			t.Fatalf("CSP 缺片段 %q，实际 %q", fragment, csp)
		}
	}
	if got := recorder.Header().Get("Cache-Control"); got != "no-store" {
		t.Fatalf("Cache-Control 应为 no-store，实际 %q", got)
	}

	// nonce 一致性（Node 用例 1 最后两行）。
	nonce := pgCSPNonce(t, csp)
	if !strings.Contains(body, `nonce="`+nonce+`"`) {
		t.Fatalf("script 标签须带同一 nonce（%q）", nonce)
	}
}
