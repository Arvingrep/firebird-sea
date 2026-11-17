// Package coins 是 Coins.ph Pro 开放接口的客户端封装（PHP ↔ USDT 汇率与账户查询）。
//
// 只用公共行情接口做业务汇率换算；私有接口（账户余额）需要 Key，故配置缺失时明确报错，
// 不做「静默返回 0 余额」这种会让对账口径失真的兜底。
package coins

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/jsonfloat"
)

const (
	// DefaultBaseURL 与 Node 版一致。
	DefaultBaseURL = "https://api.pro.coins.ph"
	// DefaultTimeout 是单次请求超时。
	DefaultTimeout = 8 * time.Second
	// RateCacheTTL 是汇率缓存有效期：30s 内复用，避免每个收银台都打一次行情。
	RateCacheTTL = 30 * time.Second
	// FallbackRate 是行情不可用时的兜底汇率（PHP per USDT）。
	// 有缓存就用缓存，没有才用这个常量——它是「让收银台能开」的保守估计，不是实时价。
	FallbackRate = 62.88

	tickerSymbol = "USDTPHP"
)

// Dep 注入客户端依赖。HTTPClient/Now 可注入以便测试。
type Dep struct {
	BaseURL    string
	APIKey     string
	APISecret  string
	HTTPClient *http.Client
	Now        func() time.Time
}

type rateEntry struct {
	price     float64
	updatedAt time.Time
}

// Client 并发安全；汇率缓存按 symbol 保存最近一次成功报价。
type Client struct {
	baseURL   string
	apiKey    string
	apiSecret string
	http      *http.Client
	now       func() time.Time

	mu    sync.Mutex
	rates map[string]rateEntry
}

func New(d Dep) *Client {
	base := d.BaseURL
	if base == "" {
		base = DefaultBaseURL
	}
	now := d.Now
	if now == nil {
		now = time.Now
	}
	client := d.HTTPClient
	if client == nil {
		client = &http.Client{Timeout: DefaultTimeout}
	}
	return &Client{
		baseURL:   base,
		apiKey:    d.APIKey,
		apiSecret: d.APISecret,
		http:      client,
		now:       now,
		rates:     make(map[string]rateEntry),
	}
}

// Ticker 是行情最新价，raw 保留上游原文供排障。
type Ticker struct {
	Symbol string         `json:"symbol"`
	Price  float64        `json:"price"`
	Raw    map[string]any `json:"raw"`
}

// OrderBookLevel 是买单档位：Node 版多带一个 priceStr（原始字符串），保持逐字一致。
type OrderBookLevel struct {
	Price    float64 `json:"price"`
	PriceStr string  `json:"priceStr"`
	Qty      float64 `json:"qty"`
}

// AskLevel 是卖单档位（Node 版没有 priceStr）。
type AskLevel struct {
	Price float64 `json:"price"`
	Qty   float64 `json:"qty"`
}

type OrderBook struct {
	Symbol       string           `json:"symbol"`
	LastUpdateID int64            `json:"lastUpdateId"`
	Bids         []OrderBookLevel `json:"bids"`
	Asks         []AskLevel       `json:"asks"`
}

// TickerPrice 拉取最新价并写入汇率缓存。
func (c *Client) TickerPrice(ctx context.Context, symbol string) (Ticker, error) {
	if symbol == "" {
		symbol = tickerSymbol
	}
	res, err := c.request(ctx, http.MethodGet, "/openapi/quote/v1/ticker/price",
		[]queryPair{{"symbol", symbol}}, nil)
	if err != nil {
		return Ticker{}, err
	}
	sym, _ := res["symbol"].(string)
	price, _ := floatFrom(res["price"])
	if !math.IsNaN(price) && !math.IsInf(price, 0) {
		c.mu.Lock()
		c.rates[symbol] = rateEntry{price: price, updatedAt: c.now()}
		c.mu.Unlock()
	}
	return Ticker{Symbol: sym, Price: price, Raw: res}, nil
}

// OrderBook 拉取市场深度。
func (c *Client) OrderBook(ctx context.Context, symbol string, limit int) (OrderBook, error) {
	if symbol == "" {
		symbol = tickerSymbol
	}
	if limit <= 0 {
		limit = 5
	}
	res, err := c.request(ctx, http.MethodGet, "/openapi/quote/v1/depth",
		[]queryPair{{"symbol", symbol}, {"limit", strconv.Itoa(limit)}}, nil)
	if err != nil {
		return OrderBook{}, err
	}

	book := OrderBook{Symbol: symbol}
	// Bids/Asks 一开始就建成空切片，不依赖下面断言是否成功：
	// Node 是 `(res.bids || []).map(...)`，上游给 null / 缺字段 / 类型不对时恒输出 `[]`。
	// 留 nil 会被 encoding/json 写成 `null`，前端 `depth.bids[0]` 直接抛错 ——
	// 「空数组必须是 []」是 brief 的硬契约。
	book.Bids = make([]OrderBookLevel, 0, 4)
	book.Asks = make([]AskLevel, 0, 4)
	if v, ok := res["lastUpdateId"].(float64); ok {
		book.LastUpdateID = int64(v)
	}
	if rows, ok := res["bids"].([]any); ok {
		for _, row := range rows {
			levels, ok := row.([]any)
			if !ok || len(levels) < 2 {
				continue
			}
			priceStr, _ := levels[0].(string)
			price, _ := floatFrom(levels[0])
			qty, _ := floatFrom(levels[1])
			book.Bids = append(book.Bids, OrderBookLevel{Price: price, PriceStr: priceStr, Qty: qty})
		}
	}
	if rows, ok := res["asks"].([]any); ok {
		for _, row := range rows {
			levels, ok := row.([]any)
			if !ok || len(levels) < 2 {
				continue
			}
			price, _ := floatFrom(levels[0])
			qty, _ := floatFrom(levels[1])
			book.Asks = append(book.Asks, AskLevel{Price: price, Qty: qty})
		}
	}
	return book, nil
}

// Stats24hr 返回 24 小时统计原文（字段较多且随上游演进，不做强类型映射）。
func (c *Client) Stats24hr(ctx context.Context, symbol string) (map[string]any, error) {
	if symbol == "" {
		symbol = tickerSymbol
	}
	return c.request(ctx, http.MethodGet, "/openapi/quote/v1/ticker/24hr",
		[]queryPair{{"symbol", symbol}}, nil)
}

// AccountBalance 查询账户余额。overrideKey/overrideSecret 用于多租户场景，
// 为空时回落到实例配置。
func (c *Client) AccountBalance(ctx context.Context, overrideKey, overrideSecret string) (map[string]any, error) {
	key := overrideKey
	if key == "" {
		key = c.apiKey
	}
	secret := overrideSecret
	if secret == "" {
		secret = c.apiSecret
	}
	if key == "" || secret == "" {
		return nil, errors.New("Missing COINS_PH_API_KEY or COINS_PH_API_SECRET")
	}

	timestamp := strconv.FormatInt(c.now().UnixMilli(), 10)
	const recvWindow = "5000"
	queryString := encodePairs([]queryPair{{"timestamp", timestamp}, {"recvWindow", recvWindow}})
	signature := Sign(queryString, secret)

	pairs := []queryPair{
		{"timestamp", timestamp},
		{"recvWindow", recvWindow},
		{"signature", signature},
	}
	return c.request(ctx, http.MethodGet, "/openapi/v1/account", pairs, map[string]string{
		"X-COINS-APIKEY": key,
	})
}

// Conversion 是 PHP→USDT 的换算结果，字段与 Node 版逐字一致。
type Conversion struct {
	PHP       float64 `json:"php"`
	USDT      float64 `json:"usdt"`
	Rate      float64 `json:"rate"`
	Cached    bool    `json:"cached"`
	Timestamp int64   `json:"timestamp"`
}

// MarshalJSON 让 usdt / rate 按 JSON.stringify 的规则序列化。
//
// 为什么要特殊处理：`/rates/convert?php=1` 在行情为 0 时会算出 `1/0 = +Inf`，
// Node 的 JSON.stringify 把 Inf 写成 null（200），Go 的 encoding/json 会直接报错
// `json: unsupported value: +Inf`，落到 writeJSON 的兜底就是 500 —— 同一个请求两种状态码。
// 上下游字段顺序保持结构体声明顺序，与 Node 返回对象一致。
func (c Conversion) MarshalJSON() ([]byte, error) {
	return json.Marshal(struct {
		PHP       jsonfloat.Float `json:"php"`
		USDT      jsonfloat.Float `json:"usdt"`
		Rate      jsonfloat.Float `json:"rate"`
		Cached    bool            `json:"cached"`
		Timestamp int64           `json:"timestamp"`
	}{
		PHP:       jsonfloat.Float(c.PHP),
		USDT:      jsonfloat.Float(c.USDT),
		Rate:      jsonfloat.Float(c.Rate),
		Cached:    c.Cached,
		Timestamp: c.Timestamp,
	})
}

// ConvertPHPToUSDT 把比索金额换成 USDT。
//
// 缓存过期时尝试刷新；刷新失败沿用上一次缓存（没有缓存则用 FallbackRate），
// 但 cached 仍标记为 true——调用方据此知道这笔汇率不是刚才的行情。
func (c *Client) ConvertPHPToUSDT(ctx context.Context, phpAmount float64) (Conversion, error) {
	c.mu.Lock()
	entry, hasEntry := c.rates[tickerSymbol]
	c.mu.Unlock()

	rate := FallbackRate
	fromCache := true
	if hasEntry {
		rate = entry.price
	}

	if !hasEntry || c.now().Sub(entry.updatedAt) > RateCacheTTL {
		ticker, err := c.TickerPrice(ctx, tickerSymbol)
		if err != nil {
			// 行情抖动不该阻塞收银台，但必须留下痕迹（调用方可看日志里的 warning）。
			logWarning("⚠️ 汇率获取失败，使用上一次缓存汇率: " + err.Error())
		} else {
			rate = ticker.Price
			fromCache = false
		}
	}

	usdt := round2(phpAmount / rate)
	return Conversion{
		PHP:       phpAmount,
		USDT:      usdt,
		Rate:      rate,
		Cached:    fromCache,
		Timestamp: c.now().UnixMilli(),
	}, nil
}

// Sign 按 Coins.ph Pro 规则对 queryString 做 HMAC-SHA256 十六进制签名。
func Sign(queryString, secret string) string {
	m := hmac.New(sha256.New, []byte(secret))
	m.Write([]byte(queryString))
	return hex.EncodeToString(m.Sum(nil))
}

type queryPair struct{ key, value string }

// encodePairs 手工按插入顺序拼 query：url.Values.Encode 会按 key 排序，
// 而签名必须覆盖「实际发出的那一串」，顺序变了签名就对不上。
func encodePairs(pairs []queryPair) string {
	parts := make([]string, 0, len(pairs))
	for _, p := range pairs {
		parts = append(parts, url.QueryEscape(p.key)+"="+url.QueryEscape(p.value))
	}
	return strings.Join(parts, "&")
}

func (c *Client) request(ctx context.Context, method, path string, pairs []queryPair, headers map[string]string) (map[string]any, error) {
	base, err := url.Parse(c.baseURL)
	if err != nil {
		return nil, fmt.Errorf("coins: invalid base url: %w", err)
	}
	// 与 new URL(path, base) 一致：以 '/' 开头的 path 会丢弃 base 的路径部分。
	base.Path = path
	base.RawQuery = encodePairs(pairs)

	reqCtx, cancel := context.WithTimeout(ctx, DefaultTimeout)
	defer cancel()

	req, err := http.NewRequestWithContext(reqCtx, method, base.String(), nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "Firebird-SEA-Client/1.0")
	for k, v := range headers {
		req.Header.Set(k, v)
	}

	res, err := c.http.Do(req)
	if err != nil {
		if errors.Is(err, context.DeadlineExceeded) || isTimeout(err) {
			return nil, errors.New("Coins.ph request timeout")
		}
		return nil, err
	}
	defer func() { _ = res.Body.Close() }()

	data, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}

	// 顺序与 Node 版一致：先解 JSON，再判状态码。上游错误页常是 HTML，
	// 此时报「Invalid JSON response」比报状态码更能指出真实问题。
	var decoded any
	if err := json.Unmarshal(data, &decoded); err != nil {
		return nil, fmt.Errorf("Invalid JSON response: %s", string(data))
	}
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return nil, fmt.Errorf("Coins.ph API [%d]: %s", res.StatusCode, string(data))
	}
	obj, ok := decoded.(map[string]any)
	if !ok {
		return nil, fmt.Errorf("Invalid JSON response: %s", string(data))
	}
	return obj, nil
}

func floatFrom(v any) (float64, bool) {
	switch n := v.(type) {
	case float64:
		return n, true
	case string:
		f, err := strconv.ParseFloat(n, 64)
		return f, err == nil
	case json.Number:
		f, err := n.Float64()
		return f, err == nil
	}
	return math.NaN(), false
}

func isTimeout(err error) bool {
	var ne interface{ Timeout() bool }
	return errors.As(err, &ne) && ne.Timeout()
}

func round2(v float64) float64 { return math.Round(v*100) / 100 }

// logWarning 默认写 stderr；单独抽出便于后续替换为统一日志器。
var logWarning = func(message string) {
	fmt.Fprintln(os.Stderr, message)
}
