// Node 对等契约的正式用例（M1 / M2 / M4）。
//
// 这三条此前**唯一**的护栏是实现方的 selfcheck_test.go（Ray 复审点出）。selfcheck 是临时产物、
// 将来会被删，所以这里各补一条正式用例，命名用业务语义，断言口径不变：
//
//	M1 非有限金额 → JSON null（Node 的 JSON.stringify(NaN) === "null"）
//	M2 盘口空值 → 恒为 []（Node 的 `(res.bids || []).map(...)`）
//	M4 TMA CSP 与 services/api/src/server.js 逐字一致（**读真实文件**，不抄字面量）
//
// 本文件不引用 selfcheck_test.go 的任何辅助函数：那些文件删除后，这里必须仍能独立编译运行。
package httpapi

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"regexp"
	"strings"
	"testing"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/coins"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/payment"
)

// pcNow 是所有金额/时间戳断言的基准时刻：固定后 chargeId / createdAt / expiresAt 才是定值。
var pcNow = time.Unix(1700000000, 0)

// pcServer 按生产形态装配：固定时钟 + 固定随机源（Rand 恒 0 → 尾数恒 +0.01、chargeId 后缀恒 _0）。
func pcServer(t *testing.T, mutate func(*Dep)) *Server {
	t.Helper()
	dep := Dep{
		Env:  func(string) string { return "test" },
		Now:  func() time.Time { return pcNow },
		Logf: func(string) {},
	}
	if mutate != nil {
		mutate(&dep)
	}
	return NewServer(dep)
}

// pcPostJSON 发一次 JSON POST，返回原始响应（逐字节断言需要 body 原文，不能先解码）。
func pcPostJSON(t *testing.T, server *Server, target, body string) *httptest.ResponseRecorder {
	t.Helper()
	request := httptest.NewRequest(http.MethodPost, target, strings.NewReader(body))
	request.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()
	server.Handler().ServeHTTP(recorder, request)
	return recorder
}

// pcPaymentServer 装配一个内存收银台：Rand 恒 0 让尾数分配与 chargeId 都可预测。
func pcPaymentServer(t *testing.T) *Server {
	t.Helper()
	return pcServer(t, func(dep *Dep) {
		dep.Payments = payment.New(payment.Dep{
			Now:  func() time.Time { return pcNow },
			Rand: func() float64 { return 0 },
		})
	})
}

// TestCreateChargeNonFiniteAmountSerializesNull 钉住 M1：非有限金额不许把 200 变成 500。
//
// Node 的 `Number("abc")` 是 NaN，而 `NaN <= 0` 为 false —— 所以它**放行**并建单，
// 只是 JSON.stringify 把 NaN 写成 null。Go 若让 NaN 流进 encoding/json，编码直接报错、
// 被 writeJSON 兜底成 500：调用方看到的是「失败」，会重试一笔本该成功的订单。
//
// 四种输入对应 Node 的四条分支，状态码必须逐条对上：
//
//	"abc"  → NaN → 200 + null
//	{}     → NaN → 200 + null
//	[]     → Number([]) === 0 → 400（不是 NaN，不能放行）
//	[5]    → Number([5]) === 5 → 200 且 baseAmount 为 5
func TestCreateChargeNonFiniteAmountSerializesNull(t *testing.T) {
	const notEscaped = "NAN<&>_1" // 顺带钉住「不许把 <、>、& 写成 \u003c/\u003e/\u0026」
	nowMs := pcNow.UnixMilli()
	// 字段顺序与 Node 返回对象一致（chargeId, orderId, baseAmount, amountToPay, currency, network,
	// receiveAddress, status, createdAt, expiresAt, txHash）。
	nullBody := fmt.Sprintf(`{"success":true,"data":{"chargeId":"CHG_%d_0","orderId":%q,`+
		`"baseAmount":null,"amountToPay":null,"currency":"USDT","network":"TRC-20",`+
		`"receiveAddress":%q,"status":"PENDING","createdAt":%d,"expiresAt":%d,"txHash":null}}`,
		nowMs, notEscaped, payment.DefaultMasterAddress, nowMs, nowMs+int64(payment.DefaultWindow/time.Millisecond))

	t.Run("amountUsdt=\"abc\"：200 且两个金额字段都是 null", func(t *testing.T) {
		server := pcPaymentServer(t)
		recorder := pcPostJSON(t, server, "/tg-api/payment/create-charge",
			`{"orderId":"NAN<&>_1","amountUsdt":"abc"}`)
		if recorder.Code != http.StatusOK {
			t.Fatalf("Number(\"abc\") 是 NaN 且 NaN<=0 为 false —— Node 会放行，实得 %d（%s）",
				recorder.Code, recorder.Body.String())
		}
		if body := recorder.Body.String(); body != nullBody {
			t.Fatalf("响应体与 Node 不是逐字节相同：\n want=%s\n  got=%s", nullBody, body)
		}
		for _, escaped := range []string{`\u003c`, `\u003e`, `\u0026`} {
			if strings.Contains(recorder.Body.String(), escaped) {
				t.Fatalf("响应体出现 HTML 转义序列 %s：%s", escaped, recorder.Body.String())
			}
		}
	})

	t.Run("amountUsdt={}：Number({}) 是 NaN，同样 200 + null", func(t *testing.T) {
		server := pcPaymentServer(t)
		recorder := pcPostJSON(t, server, "/tg-api/payment/create-charge",
			`{"orderId":"NAN<&>_1","amountUsdt":{}}`)
		if recorder.Code != http.StatusOK {
			t.Fatalf("Number({}) 是 NaN —— 应 200，实得 %d（%s）", recorder.Code, recorder.Body.String())
		}
		if body := recorder.Body.String(); body != nullBody {
			t.Fatalf("响应体与 Node 不是逐字节相同：\n want=%s\n  got=%s", nullBody, body)
		}
	})

	t.Run("amountUsdt=[]：Number([]) 是 0 → 400，不能当 NaN 放行", func(t *testing.T) {
		server := pcPaymentServer(t)
		recorder := pcPostJSON(t, server, "/tg-api/payment/create-charge",
			`{"orderId":"NAN<&>_1","amountUsdt":[]}`)
		if recorder.Code != http.StatusBadRequest {
			t.Fatalf("Number([]) === 0 且 0<=0 —— 应 400，实得 %d（%s）", recorder.Code, recorder.Body.String())
		}
		const want = `{"success":false,"error":"Invalid orderId or amount"}`
		if body := recorder.Body.String(); body != want {
			t.Fatalf("400 响应体应逐字节等于 %s，实得 %s", want, body)
		}
	})

	t.Run("amountUsdt=[5]：Number([5]) 是 5 → 200 且 baseAmount 为 5", func(t *testing.T) {
		server := pcPaymentServer(t)
		recorder := pcPostJSON(t, server, "/tg-api/payment/create-charge",
			`{"orderId":"NAN<&>_1","amountUsdt":[5]}`)
		if recorder.Code != http.StatusOK {
			t.Fatalf("Number([5]) === 5 —— 应 200，实得 %d（%s）", recorder.Code, recorder.Body.String())
		}
		// 尾数 Rand=0 → +0.01，所以 amountToPay 是 5.01。
		want := fmt.Sprintf(`{"success":true,"data":{"chargeId":"CHG_%d_0","orderId":%q,`+
			`"baseAmount":5,"amountToPay":5.01,"currency":"USDT","network":"TRC-20",`+
			`"receiveAddress":%q,"status":"PENDING","createdAt":%d,"expiresAt":%d,"txHash":null}}`,
			nowMs, notEscaped, payment.DefaultMasterAddress, nowMs, nowMs+int64(payment.DefaultWindow/time.Millisecond))
		if body := recorder.Body.String(); body != want {
			t.Fatalf("响应体与 Node 不是逐字节相同：\n want=%s\n  got=%s", want, body)
		}
	})
}

// pcDepthTransport 让 coins.Client 打到固定响应：ticker 恒 62.5，depth 由用例给定。
type pcDepthTransport struct{ depthBody string }

func (t pcDepthTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	body := `{"symbol":"USDTPHP","price":"62.5"}`
	if strings.Contains(req.URL.Path, "depth") {
		body = t.depthBody
	}
	return &http.Response{
		StatusCode: http.StatusOK,
		Header:     http.Header{"Content-Type": []string{"application/json"}},
		Body:       io.NopCloser(strings.NewReader(body)),
		Request:    req,
	}, nil
}

// TestOrderBookEmptyArraysNotNull 钉住 M2：盘口空值必须是 []，不能是 null。
//
// Node 是 `(res.bids || []).map(...)`：上游给 null / 缺字段 / 类型不对，输出恒为 []。
// Go 留 nil 切片会被写成 `null`，前端 `depth.bids[0]` 直接抛错（不是「空列表」而是「崩」）。
func TestOrderBookEmptyArraysNotNull(t *testing.T) {
	// 三条输入归一后是同一个响应体：符号取请求值、价格取 ticker、盘口两个数组为空。
	const want = `{"success":true,"data":{"symbol":"USDTPHP","price":62.5,` +
		`"orderBook":{"symbol":"USDTPHP","lastUpdateId":1,"bids":[],"asks":[]}}}`

	cases := []struct {
		name  string
		depth string
	}{
		{"上游给 null", `{"symbol":"USDTPHP","lastUpdateId":1,"bids":null,"asks":null}`},
		{"上游缺字段", `{"symbol":"USDTPHP","lastUpdateId":1}`},
		{"上游类型不对", `{"symbol":"USDTPHP","lastUpdateId":1,"bids":"oops","asks":42}`},
	}
	for _, item := range cases {
		t.Run(item.name, func(t *testing.T) {
			server := pcServer(t, func(dep *Dep) {
				dep.Coins = coins.New(coins.Dep{HTTPClient: &http.Client{Transport: pcDepthTransport{depthBody: item.depth}}})
			})
			recorder := httptest.NewRecorder()
			server.Handler().ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/tg-api/rates/coins-ph", nil))
			if recorder.Code != http.StatusOK {
				t.Fatalf("应 200，实得 %d（%s）", recorder.Code, recorder.Body.String())
			}
			if body := recorder.Body.String(); body != want {
				t.Fatalf("盘口空值必须输出 []（不是 null）：\n want=%s\n  got=%s", want, body)
			}
		})
	}
}

// TestTMACSPMatchesNodeSource 钉住 M4：CSP 与 services/api/src/server.js 的 TMA_CSP 逐字一致。
//
// 必须读真实 Node 源文件：抄一份字面量等于自己跟自己比，两边同时改错仍然全绿。
// 这条 CSP 的 style-src 曾经少一个 'self'，一旦启用 TMA_STATIC_DIR，同域 CSS 会被整段拦掉
// —— 表现是「页面出来了但完全没样式」，靠人眼很难归因到一行响应头。
func TestTMACSPMatchesNodeSource(t *testing.T) {
	const nodeSource = "../../../api/src/server.js"
	raw, err := os.ReadFile(nodeSource)
	if err != nil {
		t.Fatalf("读取 %s 失败（parity 校验需要它，不要改成跳过）：%v", nodeSource, err)
	}
	// server.js 里 TMA_CSP 是两段字符串拼接：`const TMA_CSP = "..." + \n "..."`。
	pattern := regexp.MustCompile(`(?s)const TMA_CSP = "([^"]*)"\s*\+\s*\n\s*"([^"]*)"`)
	matched := pattern.FindStringSubmatch(string(raw))
	if len(matched) != 3 {
		t.Fatal("没能在 server.js 里定位 TMA_CSP 的两段拼接：要么 Node 侧改了写法，" +
			"要么这条 parity 校验失效 —— 请修正则，不要删用例")
	}
	if want := matched[1] + matched[2]; tmaCSP != want {
		t.Fatalf("TMA CSP 与 Node 源不一致：\n node=%s\n   go=%s", want, tmaCSP)
	}
}

// pcRateTransport 返回固定行情 62.88，让 /rates/convert 的汇率是定值。
//
// 本文件不许引用 selfcheck_test.go 的辅助函数（见文件头约定），所以这里自带一个。
type pcRateTransport struct{}

func (pcRateTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	return &http.Response{
		StatusCode: http.StatusOK,
		Header:     http.Header{"Content-Type": []string{"application/json"}},
		Body:       io.NopCloser(strings.NewReader(`{"symbol":"USDTPHP","price":"62.88"}`)),
		Request:    req,
	}, nil
}

// TestRatesConvertNonNumericParity 钉住「非数字金额 → 200 + null」与 Node 完全一致。
//
// Node（server.js:357-358）：
//
//	const php = parseFloat(req.query.php || '0');   // parseFloat('abc') → NaN
//	if (php <= 0) { ... 400 ... }                   // NaN <= 0 → **false** → 放行
//
// 放行后 `(NaN / rate).toFixed(2)` → "NaN" → `Number("NaN")` → NaN，`res.json` 把它写成 null。
// 期望值不是推断出来的：在 node 里跑 `convertPhpToUsdt(NaN)`（预置 rateCache 62.88）实测输出
//
//	{"php":null,"usdt":null,"rate":62.88,"cached":true,"timestamp":<ms>}
//
// 这里只把 timestamp 固定成基准时刻，其余逐字节比对。
//
// 为什么必须有这条正式用例：Go 侧原来写的是 `!(php > 0)` —— 它和 `<= 0` **只在 NaN 上不同**，
// 于是同一个输入类在 /payment/create-charge 是 200+null、在 /rates/convert 是 400。
// 这种跨端点不一致比 Node 的宽松本身更难解释，所以行为对齐 Node 优先，哪怕 400 看起来更「正确」。
func TestRatesConvertNonNumericParity(t *testing.T) {
	const want = `{"success":true,"data":{"php":null,"usdt":null,"rate":62.88,"cached":true,"timestamp":1700000000000}}`

	client := coins.New(coins.Dep{
		HTTPClient: &http.Client{Transport: pcRateTransport{}},
		Now:        func() time.Time { return pcNow },
	})
	// 预置汇率缓存：先取一次行情写进 rates，30s TTL 内后续换算命中缓存
	//（cached:true、rate 定值）。不预热的话第一次会自己拉行情，cached 变成 false。
	if _, err := client.TickerPrice(context.Background(), "USDTPHP"); err != nil {
		t.Fatalf("预热汇率缓存失败：%v", err)
	}

	server := pcServer(t, func(dep *Dep) { dep.Coins = client })
	recorder := httptest.NewRecorder()
	server.Handler().ServeHTTP(recorder,
		httptest.NewRequest(http.MethodGet, "/tg-api/rates/convert?php=abc", nil))

	if recorder.Code != http.StatusOK {
		t.Fatalf("php=abc 应 200（NaN 放行，Node 语义），实得 %d %s", recorder.Code, recorder.Body.String())
	}
	body := recorder.Body.String()
	if body != want {
		t.Fatalf("响应体与 Node 不一致：\n node=%s\n   go=%s", want, body)
	}
	// 显式排除结尾换行：res.json 不补换行。有了换行，逐字节对拍之外的一切
	//（例如拿 curl 输出直接 diff）都会带上一个看不见的差异。
	if strings.HasSuffix(body, "\n") {
		t.Fatalf("响应体不该有结尾换行：%q", body)
	}
	// php / usdt 必须是 JSON null 而不是字符串 "NaN"：这是整条用例的重点。
	if strings.Contains(body, `"NaN"`) {
		t.Fatalf("不得把 NaN 写成字符串：%s", body)
	}
}
