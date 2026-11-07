// Package gateway 是火鸟 PHP 网关客户端（AD-3）。
//
// 网关入口固定为带 .php 后缀的单一文件，action 放 JSON body：
// 业务 PHP 走 nginx 的 `location ~ \.php$`，只有 .php 结尾的路径能命中；
// 无后缀路径会落到 try_files → /index.php?$args，被火鸟前端控制器接走返回 HTML，
// 表现为 GATEWAY_BAD_JSON。所以 BaseURL 只到域名（可带端口），路径由本包拼。
package gateway

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math"
	"net"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

const (
	// Path 是网关唯一入口。
	Path = "/api/fbs/index.php"
	// DefaultTimeout 防止请求永久挂起（Node 版同值）。
	DefaultTimeout = 8 * time.Second

	// 错误码与 Node 版一致，调用方按码分支而不是按文案匹配。
	CodeHTTPError = "GATEWAY_HTTP_ERROR"
	CodeBadJSON   = "GATEWAY_BAD_JSON"
	CodeTimeout   = "GATEWAY_TIMEOUT"
)

// Config 是调用参数。HTTPClient 可注入（测试用 httptest 或自定义 RoundTripper）；
// 不注入时用带 Timeout 的默认客户端。
type Config struct {
	BaseURL    string
	Secret     string
	Timeout    time.Duration
	HTTPClient *http.Client
	Now        func() time.Time
}

// Error 带类型的网关错误，字段与 Node 版 err.status/err.payload/err.body 对应。
type Error struct {
	Code    string
	Message string
	Status  int
	Payload any
	Body    string
}

func (e *Error) Error() string { return e.Message }

// Sign 复刻签名串：timestamp + '\n' + action + '\n' + body，HMAC-SHA256 十六进制。
func Sign(secret, timestamp, action, body string) string {
	m := hmac.New(sha256.New, []byte(secret))
	m.Write([]byte(timestamp + "\n" + action + "\n" + body))
	return hex.EncodeToString(m.Sum(nil))
}

// 请求体用结构体而不是 map，保证 `{"action":...,"params":{...}}` 的字段顺序稳定——
// 签名覆盖 body 原文，顺序一变签名就对不上。
type requestBody struct {
	Action string         `json:"action"`
	Params map[string]any `json:"params"`
}

// Call 发起一次网关调用。非 2xx 一律返回 *Error（CodeHTTPError），
// 调用方不必再判状态码；超时返回 CodeTimeout，坏 JSON 返回 CodeBadJSON。
func Call(ctx context.Context, cfg Config, action string, params map[string]any) (map[string]any, error) {
	if params == nil {
		params = map[string]any{}
	}
	body, err := json.Marshal(requestBody{Action: action, Params: params})
	if err != nil {
		return nil, fmt.Errorf("gateway: encode request body: %w", err)
	}

	endpoint, err := resolve(cfg.BaseURL)
	if err != nil {
		return nil, err
	}

	timeout := cfg.Timeout
	if timeout <= 0 {
		timeout = DefaultTimeout
	}
	now := cfg.Now
	if now == nil {
		now = time.Now
	}
	timestamp := strconv.FormatInt(now().Unix(), 10)

	reqCtx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	req, err := http.NewRequestWithContext(reqCtx, http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Fbs-Timestamp", timestamp)
	req.Header.Set("X-Fbs-Signature", Sign(cfg.Secret, timestamp, action, string(body)))

	client := cfg.HTTPClient
	if client == nil {
		client = &http.Client{Timeout: timeout}
	}

	res, err := client.Do(req)
	if err != nil {
		if errors.Is(err, context.DeadlineExceeded) || isTimeout(err) {
			return nil, &Error{
				Code:    CodeTimeout,
				Message: fmt.Sprintf("网关请求超时（%dms）", timeout.Milliseconds()),
			}
		}
		return nil, err
	}
	defer func() { _ = res.Body.Close() }()

	data, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}

	if res.StatusCode < 200 || res.StatusCode >= 300 {
		var payload any
		_ = json.Unmarshal(data, &payload) // 非 JSON 错误页解析失败就留 nil，保留原文即可
		return nil, &Error{
			Code:    CodeHTTPError,
			Message: fmt.Sprintf("网关返回 HTTP %d", res.StatusCode),
			Status:  res.StatusCode,
			Payload: payload,
			Body:    truncate(data, 500),
		}
	}

	var decoded any
	if err := json.Unmarshal(data, &decoded); err != nil {
		return nil, &Error{
			Code:    CodeBadJSON,
			Message: fmt.Sprintf("网关返回非 JSON: %s", truncate(data, 200)),
		}
	}
	if obj, ok := decoded.(map[string]any); ok {
		return obj, nil
	}
	// 契约只接受对象响应；数组/标量说明命中了别的路由（例如前端控制器）。
	return nil, &Error{
		Code:    CodeBadJSON,
		Message: fmt.Sprintf("网关返回非 JSON 对象: %s", truncate(data, 200)),
	}
}

// resolve 复刻 new URL(Path, BaseURL)：以 '/' 开头的路径会丢弃 base 的路径部分，
// 因此 BaseURL 写成 https://host/api 也不会拼出双路径。
func resolve(baseURL string) (string, error) {
	u, err := url.Parse(baseURL)
	if err != nil {
		return "", fmt.Errorf("gateway: invalid base url: %w", err)
	}
	if u.Scheme == "" || u.Host == "" {
		return "", fmt.Errorf("gateway: invalid base url: %q", baseURL)
	}
	u.Path = Path
	u.RawQuery = ""
	u.Fragment = ""
	return u.String(), nil
}

func isTimeout(err error) bool {
	var ne net.Error
	return errors.As(err, &ne) && ne.Timeout()
}

// truncate 按 rune 截断，避免把多字节字符截成半个导致日志里出现乱码。
func truncate(data []byte, limit int) string {
	runes := []rune(string(data))
	if len(runes) <= limit {
		return string(runes)
	}
	return string(runes[:limit])
}

// 各动作的语义化包装：签名与超时策略共用，调用方只关心业务参数。
func Deal(ctx context.Context, cfg Config, params map[string]any) (map[string]any, error) {
	return Call(ctx, cfg, "deal", params)
}

func OrderPaid(ctx context.Context, cfg Config, params map[string]any) (map[string]any, error) {
	return Call(ctx, cfg, "order_paid", params)
}

// CancelOrder 的 action 名是 camelCase，与 PHP 端白名单一致，不要改成 cancel_order。
func CancelOrder(ctx context.Context, cfg Config, params map[string]any) (map[string]any, error) {
	return Call(ctx, cfg, "cancelOrder", params)
}

// MemberFindOrCreate 是免密登录桥的建号/查号动作。
func MemberFindOrCreate(ctx context.Context, cfg Config, params map[string]any) (map[string]any, error) {
	return Call(ctx, cfg, "member_find_or_create", params)
}

// IssueSession 用会员 id 换取火鸟会话 Cookie（服务端之间传递，不回传前端）。
func IssueSession(ctx context.Context, cfg Config, params map[string]any) (map[string]any, error) {
	return Call(ctx, cfg, "issue_session", params)
}

// RiderBind 是骑手绑定（T6）：PHP 侧按归一后手机号查唯一可用骑手、做冲突检查
// （绝不静默顶替）、按 tg/phone/ip 三维度限频并写审计。业务失败走非 2xx，
// 调用方靠 *Error 的 Status + Payload.error.code 还原用户提示（见 internal/rider）。
func RiderBind(ctx context.Context, cfg Config, params map[string]any) (map[string]any, error) {
	return Call(ctx, cfg, "rider_bind", params)
}

// RiderQL 签一个短期一次性工作台直达 URL（ql.html 落地种骑手 cookie）。
func RiderQL(ctx context.Context, cfg Config, params map[string]any) (map[string]any, error) {
	return Call(ctx, cfg, "rider_ql", params)
}

// ---- 响应字段读取 ----
//
// 网关响应是任意 JSON：encoding/json 把数字解成 float64，而测试替身常直接塞
// int/int64/json.Number，甚至字符串。统一在这里收口，免得每个调用方各写一份断言。

func Int(m map[string]any, key string) (int64, bool) {
	v, ok := m[key]
	if !ok {
		return 0, false
	}
	switch n := v.(type) {
	case float64:
		if n != float64(int64(n)) {
			return 0, false
		}
		return int64(n), true
	case float32:
		if float64(n) != math.Trunc(float64(n)) {
			return 0, false
		}
		return int64(n), true
	case int:
		return int64(n), true
	case int32:
		return int64(n), true
	case int64:
		return n, true
	case json.Number:
		i, err := n.Int64()
		return i, err == nil
	case string:
		i, err := strconv.ParseInt(strings.TrimSpace(n), 10, 64)
		return i, err == nil
	}
	return 0, false
}

func Float(m map[string]any, key string) (float64, bool) {
	v, ok := m[key]
	if !ok {
		return 0, false
	}
	switch n := v.(type) {
	case float64:
		return n, true
	case float32:
		return float64(n), true
	case int:
		return float64(n), true
	case int64:
		return float64(n), true
	case json.Number:
		f, err := n.Float64()
		return f, err == nil
	case string:
		f, err := strconv.ParseFloat(strings.TrimSpace(n), 64)
		return f, err == nil
	}
	return 0, false
}

func Str(m map[string]any, key string) (string, bool) {
	v, ok := m[key]
	if !ok {
		return "", false
	}
	s, ok := v.(string)
	return s, ok
}

func Bool(m map[string]any, key string) bool {
	switch v := m[key].(type) {
	case bool:
		return v
	case float64:
		return v != 0
	case int:
		return v != 0
	case int64:
		return v != 0
	case json.Number:
		i, err := v.Int64()
		return err == nil && i != 0
	case string:
		// 对齐 JS Boolean(v)：空串为 false，其它任何非空串（含 "0"）都为 true。
		return v != ""
	}
	return false
}

func Map(m map[string]any, key string) (map[string]any, bool) {
	v, ok := m[key]
	if !ok {
		return nil, false
	}
	obj, ok := v.(map[string]any)
	return obj, ok
}
