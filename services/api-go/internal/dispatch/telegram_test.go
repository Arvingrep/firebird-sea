// 默认 sendMessage 实现（SendTelegram）的用例。
//
// Node 侧 sendTelegramMessage 没有独立单测（它靠 fetch 打真实端点，Node 用例统一注入
// sendMessage 替身）。但 Go 侧这段是**新写的**（含 429 的 retry_after 解析、超时、
// 以及「传输层错误不许把 token 带进日志」），漏测就等于把日志卫生押在注释上。
//
// 拦截方式：注入自定义 RoundTripper，URL 仍是真实的 api.telegram.org ——
// 这样断言的是「真的打这个端点」，而不是「打到了测试服务器」。
package dispatch

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"
	"testing"
	"time"
)

type roundTripFunc func(*http.Request) (*http.Response, error)

func (f roundTripFunc) RoundTrip(request *http.Request) (*http.Response, error) { return f(request) }

// asSendError 是 errors.As 的薄包装，只为让断言读起来短一点。
func asSendError(err error, target **SendError) bool { return errors.As(err, target) }

// urlError 模拟 net/http 的 url.Error：原文里带完整请求 URL（含 bot token）。
type urlError struct{ text string }

func (e *urlError) Error() string { return e.text }

// telegramClient 返回一个「记录请求 + 固定响应」的 http.Client。
func telegramClient(t *testing.T, status int, body string, captured *http.Request, sentBody *string) *http.Client {
	t.Helper()
	return &http.Client{Transport: roundTripFunc(func(request *http.Request) (*http.Response, error) {
		*captured = *request
		raw, err := io.ReadAll(request.Body)
		if err != nil {
			t.Errorf("读取请求体失败: %v", err)
		}
		*sentBody = string(raw)
		return &http.Response{
			StatusCode: status,
			Body:       io.NopCloser(strings.NewReader(body)),
			Header:     http.Header{"Content-Type": []string{"application/json"}},
			Request:    request,
		}, nil
	})}
}

// TestSendTelegramRequestContract 钉住端点、方法与请求体（含 reply_markup 的嵌套形状）。
func TestSendTelegramRequestContract(t *testing.T) {
	var captured http.Request
	var body string
	client := telegramClient(t, http.StatusOK, `{"ok":true,"result":{"message_id":1}}`, &captured, &body)

	message := Message{
		ChatID:      testTGUser,
		Text:        "🛵 您有新的配送订单\n订单号：1001",
		ReplyMarkup: &ReplyMarkup{InlineKeyboard: [][]InlineButton{{{Text: "查看订单", URL: testQLURL}}}},
	}
	if err := SendTelegram(context.Background(), testBotToken, message, SendOptions{Timeout: time.Second, Client: client}); err != nil {
		t.Fatalf("ok:true 应成功: %v", err)
	}

	wantURL := "https://api.telegram.org/bot" + testBotToken + "/sendMessage"
	if captured.URL.String() != wantURL {
		t.Fatalf("端点应为 %s，实得 %s", wantURL, captured.URL)
	}
	if captured.Method != http.MethodPost {
		t.Fatalf("方法应为 POST，实得 %s", captured.Method)
	}
	if got := captured.Header.Get("Content-Type"); got != "application/json" {
		t.Fatalf("Content-Type 应为 application/json，实得 %q", got)
	}
	// want 是 Node 版同场景的真实输出（用 Node 直接跑 createDispatchRoute 抓的
	// JSON.stringify(payload)），逐字节对齐：字段顺序、emoji 原样、换行转义都必须一致。
	want := `{"chat_id":555000111,"text":"🛵 您有新的配送订单\n订单号：1001","reply_markup":{"inline_keyboard":[[{"text":"查看订单","url":"https://canary.fbird.men/ql.html?token=FAKE"}]]}}`
	if body != want {
		t.Fatalf("请求体逐字节不符\n got=%s\nwant=%s", body, want)
	}
}

// TestSendTelegramOmitsReplyMarkupWhenNoURL 对应 Node「reply_markup 缺省」：
// Node 是 undefined（JSON.stringify 整键省掉），Go 必须**没有这个键**而不是 null。
func TestSendTelegramOmitsReplyMarkupWhenNoURL(t *testing.T) {
	var captured http.Request
	var body string
	client := telegramClient(t, http.StatusOK, `{"ok":true}`, &captured, &body)

	message := Message{ChatID: testTGUser, Text: "📤 订单已被客服收回，无需继续配送\n订单号：1001"}
	if err := SendTelegram(context.Background(), testBotToken, message, SendOptions{Client: client}); err != nil {
		t.Fatalf("应成功: %v", err)
	}
	if strings.Contains(body, "reply_markup") {
		t.Fatalf("无 URL 时请求体不得出现 reply_markup：%s", body)
	}
	if strings.Contains(body, "null") {
		t.Fatalf("无 URL 时不得输出 null：%s", body)
	}
}

// TestSendTelegramNon2xxCarriesRetryAfter 对应 Node 的「429 把 retry_after 挂到 error 上」。
func TestSendTelegramNon2xxCarriesRetryAfter(t *testing.T) {
	var captured http.Request
	var body string
	client := telegramClient(t, http.StatusTooManyRequests,
		`{"ok":false,"description":"Too Many Requests: retry after 3","parameters":{"retry_after":3}}`,
		&captured, &body)

	err := SendTelegram(context.Background(), testBotToken, Message{ChatID: testTGUser, Text: "x"}, SendOptions{Client: client})
	var sendErr *SendError
	if !asSendError(err, &sendErr) {
		t.Fatalf("应返回 *SendError，实得 %T: %v", err, err)
	}
	if sendErr.HTTPStatus != http.StatusTooManyRequests {
		t.Fatalf("HTTPStatus 应为 429，实得 %d", sendErr.HTTPStatus)
	}
	if sendErr.RetryAfter != 3 {
		t.Fatalf("RetryAfter 应为 3，实得 %d", sendErr.RetryAfter)
	}
	if !strings.Contains(sendErr.Snippet, "Too Many Requests") {
		t.Fatalf("Snippet 应含响应原文片段，实得 %q", sendErr.Snippet)
	}
	if strings.Contains(err.Error(), testBotToken) {
		t.Fatalf("错误消息不得含 bot token：%s", err.Error())
	}
}

// 2xx 但 ok !== true 也算失败（Node 的 `body.ok !== true`）。
func TestSendTelegramOkFalseIsFailure(t *testing.T) {
	var captured http.Request
	var body string
	client := telegramClient(t, http.StatusOK, `{"ok":false,"description":"Bad Request: chat not found"}`, &captured, &body)

	err := SendTelegram(context.Background(), testBotToken, Message{ChatID: testTGUser, Text: "x"}, SendOptions{Client: client})
	if err == nil {
		t.Fatal("ok:false 必须算失败")
	}
	if want := "telegram rejected: Bad Request: chat not found"; err.Error() != want {
		t.Fatalf("错误消息应为 %q，实得 %q", want, err.Error())
	}
}

// 非 2xx 且响应体不是 JSON（网关/反代错误页）时，错误里保留原文片段但不崩。
func TestSendTelegramNonJSONErrorBody(t *testing.T) {
	var captured http.Request
	var body string
	client := telegramClient(t, http.StatusBadGateway, "<html>bad gateway</html>", &captured, &body)

	err := SendTelegram(context.Background(), testBotToken, Message{ChatID: testTGUser, Text: "x"}, SendOptions{Client: client})
	var sendErr *SendError
	if !asSendError(err, &sendErr) {
		t.Fatalf("应返回 *SendError，实得 %T", err)
	}
	if sendErr.HTTPStatus != http.StatusBadGateway || sendErr.RetryAfter != 0 {
		t.Fatalf("应为 502 且 RetryAfter=0，实得 %d/%d", sendErr.HTTPStatus, sendErr.RetryAfter)
	}
	if !strings.Contains(sendErr.Snippet, "bad gateway") {
		t.Fatalf("Snippet 应含原文，实得 %q", sendErr.Snippet)
	}
}

// 【安全】传输层错误原文里带完整 URL（含 bot token），必须被压掉。
func TestSendTelegramTransportErrorHidesToken(t *testing.T) {
	endpoint := "https://api.telegram.org/bot" + testBotToken + "/sendMessage"
	client := &http.Client{Transport: roundTripFunc(func(*http.Request) (*http.Response, error) {
		// 模拟 net/http 的真实措辞：`Post "<url>": dial tcp ...`
		return nil, &urlError{text: `Post "` + endpoint + `": dial tcp: lookup api.telegram.org: no such host`}
	})}

	err := SendTelegram(context.Background(), testBotToken, Message{ChatID: testTGUser, Text: "x"}, SendOptions{Client: client})
	if err == nil {
		t.Fatal("传输层错误必须算失败")
	}
	if strings.Contains(err.Error(), testBotToken) {
		t.Fatalf("错误消息泄漏了 bot token：%s", err.Error())
	}
	if !strings.Contains(err.Error(), "telegram request failed") {
		t.Fatalf("错误消息应只剩失败类别，实得 %q", err.Error())
	}
}

// 超时：请求必须按 ctx 截止返回，且错误里不含 token。
func TestSendTelegramTimeout(t *testing.T) {
	client := &http.Client{Transport: roundTripFunc(func(request *http.Request) (*http.Response, error) {
		<-request.Context().Done()
		return nil, request.Context().Err()
	})}

	start := time.Now()
	err := SendTelegram(context.Background(), testBotToken, Message{ChatID: testTGUser, Text: "x"},
		SendOptions{Timeout: 20 * time.Millisecond, Client: client})
	elapsed := time.Since(start)

	if err == nil {
		t.Fatal("超时必须算失败")
	}
	if !strings.Contains(err.Error(), "timed out") {
		t.Fatalf("错误消息应说明超时，实得 %q", err.Error())
	}
	if strings.Contains(err.Error(), testBotToken) {
		t.Fatalf("超时错误不得含 bot token：%s", err.Error())
	}
	if elapsed > 2*time.Second {
		t.Fatalf("超时应按 20ms 生效，实际耗时 %v", elapsed)
	}
}

// 默认实现要真的接在 Route 上（不注入 SendMessage 时走它）—— 否则「生产用真实 Bot API」
// 这句话没有机器校验。
func TestRouteUsesDefaultSender(t *testing.T) {
	var captured http.Request
	var body string
	h := newHarness(t, func(dep *Dep) {
		dep.SendMessage = nil
		dep.HTTPClient = telegramClient(t, http.StatusOK, `{"ok":true}`, &captured, &body)
	})
	h.postJSON(t, okBody("grab"))
	h.drain(t)

	if !strings.Contains(captured.URL.String(), "/bot"+testBotToken+"/sendMessage") {
		t.Fatalf("应打到真实 Bot API 端点，实得 %v", captured.URL)
	}
	var payload Message
	if err := json.Unmarshal([]byte(body), &payload); err != nil {
		t.Fatalf("请求体不是合法 JSON: %v（%s）", err, body)
	}
	if payload.ChatID != testTGUser || !strings.Contains(payload.Text, "抢单成功") {
		t.Fatalf("请求体内容不符：%+v", payload)
	}
}
