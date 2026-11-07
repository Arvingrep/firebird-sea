package dispatch

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"time"
)

// telegramEndpointBase 是 Bot API 的固定前缀（Node 直接模板拼接同一个串）。
// 端点里含 bot token，所以它**永远**不进日志（见 SendTelegram 的错误包装）。
const telegramEndpointBase = "https://api.telegram.org/bot"

// maxTelegramResponseBytes 是响应体读取上限：只需 ok / description / retry_after，
// 读太多没意义，还要防一个失控响应把内存吃掉。
const maxTelegramResponseBytes = 1 << 16

// Message 是 Telegram sendMessage 的请求体。
//
// reply_markup 用指针 + omitempty：Node 在无 URL 时把它设成 undefined，JSON.stringify
// 会整个键省掉。Go 若写成非指针（或漏 omitempty）就会输出 `"reply_markup":null`，
// 那是 Node 从不产生的形态。
type Message struct {
	ChatID      int64        `json:"chat_id"`
	Text        string       `json:"text"`
	ReplyMarkup *ReplyMarkup `json:"reply_markup,omitempty"`
}

// ReplyMarkup 的嵌套形状必须与 Node 逐层一致：inline_keyboard[0][0] = {text, url}。
type ReplyMarkup struct {
	InlineKeyboard [][]InlineButton `json:"inline_keyboard"`
}

// InlineButton 是「查看订单」按钮（url 为网关签出的一次性工作台直达 URL）。
type InlineButton struct {
	Text string `json:"text"`
	URL  string `json:"url"`
}

// SendOptions 是默认发送实现的参数。
type SendOptions struct {
	// Timeout 默认 5s（Node 的 sendTimeoutMs = 5000）。
	Timeout time.Duration
	// Client 可注入（测试用自定义 RoundTripper 拦截；生产的 URL 仍是真实端点）。
	Client *http.Client
}

// SendError 是 sendMessage 失败的结构化形态。
//
// Node 是把 httpStatus / retryAfter / snippet 挂在 Error 实例上；Go 用独立类型 +
// errors.As 取，退避逻辑（backoffSeconds）与日志片段（describeSendError）都读它。
type SendError struct {
	Message    string
	HTTPStatus int
	// RetryAfter 来自 Telegram 429 的 parameters.retry_after（没有则 0）。
	RetryAfter int
	// Snippet 是响应原文片段（截 200 字符），只进日志，不含请求 URL。
	Snippet string
}

func (e *SendError) Error() string { return e.Message }

// telegramResponse 只解出失败判定与退避需要的字段。
type telegramResponse struct {
	OK          bool   `json:"ok"`
	Description string `json:"description"`
	Parameters  *struct {
		RetryAfter int `json:"retry_after"`
	} `json:"parameters"`
}

// SendTelegram 是默认的 sendMessage 实现（从 services/news-sync/src/io.js makeAlerter 移植，
// Node 版在 dispatchRoute.js 里补了 retry_after 与响应片段）。
//
// 失败判定与 Node 一致：非 2xx 算失败（带 retry_after 与原文片段）；
// 2xx 但 ok !== true 也算失败。
func SendTelegram(ctx context.Context, botToken string, message Message, opt SendOptions) error {
	body, err := encodeJSONNoEscape(message)
	if err != nil {
		// 编码失败只可能是我们自己的 payload 有非法值（如 NaN），不含 token。
		return fmt.Errorf("telegram: encode payload: %w", err)
	}
	timeout := opt.Timeout
	if timeout <= 0 {
		timeout = defaultSendTimeout
	}
	requestCtx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	endpoint := telegramEndpointBase + botToken + "/sendMessage"
	request, err := http.NewRequestWithContext(requestCtx, http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		return &SendError{Message: "telegram request invalid"}
	}
	request.Header.Set("Content-Type", "application/json")

	client := opt.Client
	if client == nil {
		client = &http.Client{Timeout: timeout}
	}
	response, err := client.Do(request)
	if err != nil {
		// 【安全】传输层错误的 Error() 里带完整 URL，而 URL 含 bot token ——
		// 只保留失败类别，绝不透传原文（Node 的 fetch 只说 "fetch failed"，同理）。
		return &SendError{Message: describeTransportError(err)}
	}
	defer func() { _ = response.Body.Close() }()

	data, err := io.ReadAll(io.LimitReader(response.Body, maxTelegramResponseBytes))
	if err != nil {
		return &SendError{Message: "telegram response unreadable"}
	}
	var parsed telegramResponse
	// 非 JSON 走下面的原文片段分支（Node 同样容错：JSON.parse 失败就留 null）。
	_ = json.Unmarshal(data, &parsed)
	snippet := truncate(string(data), logMessageLimit)

	if response.StatusCode < 200 || response.StatusCode >= 300 {
		sendErr := &SendError{
			Message:    fmt.Sprintf("telegram HTTP %d", response.StatusCode),
			HTTPStatus: response.StatusCode,
			Snippet:    snippet,
		}
		if parsed.Parameters != nil {
			sendErr.RetryAfter = parsed.Parameters.RetryAfter
		}
		return sendErr
	}
	if !parsed.OK {
		description := parsed.Description
		if description == "" {
			description = "ok!=true"
		}
		return &SendError{Message: "telegram rejected: " + description, Snippet: snippet}
	}
	return nil
}

// describeTransportError 把传输层错误压成不含 URL/凭据的一句话。
func describeTransportError(err error) string {
	if errors.Is(err, context.DeadlineExceeded) || errors.Is(err, context.Canceled) {
		return "telegram request timed out"
	}
	var netErr net.Error
	if errors.As(err, &netErr) && netErr.Timeout() {
		return "telegram request timed out"
	}
	return "telegram request failed"
}
