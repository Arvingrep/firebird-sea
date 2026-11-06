// Package addrshare 实现地址分享（代下单）：把一条收货地址变成一个带一次性 token 的
// Telegram 深链，接收方点开即可把这条地址存进自己的地址簿。
//
// 安全边界：创建需要登录令牌；读取只凭 token（不可枚举、默认 7 天过期、独立限流）；
// 内容一律做长度裁剪与换行清理——这是唯一一道拦住「快照里塞 1MB 文本」的闸门。
//
// 只接收「位置」字段：收货人与联系方式由接收方用自己的 Telegram 身份生成，
// 否则分享者可以在客户端伪造他人姓名/电话并被服务端采信。
package addrshare

import (
	"bytes"
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math"
	"net"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/httpbody"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/token"
)

const (
	// 字段长度上限（与 Node 的 LIMITS 一致）。
	StreetLimit   = 300
	AddressLimit  = 400
	AreaCodeLimit = 8
	CoordLimit    = 24

	// MaxPerUID 是每个会员保留的有效分享条数。GET 是公开接口，
	// 长期堆积等于长期暴露地址与坐标。
	MaxPerUID = 20

	// PurgeInterval 是过期清理的进程内节流窗口：每次创建都清会多打一次全表 DELETE。
	PurgeInterval = 600 * time.Second

	// DefaultTTL 是分享有效期（7 天）。
	DefaultTTL = 7 * 24 * time.Hour

	// TokenPattern：32 位小写 hex，即 16 字节随机数。不可枚举是这套方案的前提。
	TokenPattern = `^[0-9a-f]{32}$`

	// botUsernameRetry：getMe 失败后 2 分钟内不重试，避免 Telegram 侧限流拖慢创建接口。
	botUsernameRetry = 120 * time.Second
	// getMeTimeout 与 Node 的 AbortSignal.timeout(5000) 一致。
	getMeTimeout = 5 * time.Second

	// DefaultShareLimit / DefaultShareReadLimit 对应 TMA_SHARE_MAX / TMA_SHARE_READ_MAX。
	// 创建要写库且能生成公开链接，所以更紧；读取只是查一行。
	DefaultShareLimit     = 10
	DefaultShareReadLimit = 60
	// LimitWindow 是限流窗口。
	LimitWindow = 60 * time.Second

	// maxSafeInteger 复刻 Number.isSafeInteger 的上界。
	maxSafeInteger = int64(1)<<53 - 1
)

var (
	tokenRe = regexp.MustCompile(TokenPattern)
	// 换行/制表符先压成空格再 TrimSpace：快照可能被写进 TSV 或被单行日志读取，
	// 残留换行会把一条记录劈成两行。
	breakRunRe = regexp.MustCompile(`[\r\n\t]+`)
)

// Payload 是分享出去的地址快照。字段顺序即 JSON 序列化顺序（street/address/lat/lng/areaCode），
// 落库后读回的顺序因此与首次写入一致。
type Payload struct {
	Street   string `json:"street"`
	Address  string `json:"address"`
	Lat      string `json:"lat"`
	Lng      string `json:"lng"`
	AreaCode string `json:"areaCode"`
}

// TokenVerifier 是令牌服务的最小能力（*token.Service 满足它，测试可注入假实现）。
type TokenVerifier interface {
	Verify(raw string) (token.Claims, error)
}

// Dep 注入路由依赖，测试可逐项替换。
type Dep struct {
	DB     *sql.DB
	Tokens TokenVerifier
	// BotToken 只用于拼 getMe 与 t.me 深链；缺失时 url 降级为 null，创建流程照常完成。
	BotToken string
	// TTL 缺省 DefaultTTL。
	TTL time.Duration
	Now func() time.Time
	// AllowCreate / AllowRead 是外部注入的限流器，入参是 ClientKey。
	// 为 nil 表示不限流（Node 同一写法）。
	AllowCreate func(key string) bool
	AllowRead   func(key string) bool
	HTTPClient  *http.Client
	// TrustProxyHops 与 express 的 trust proxy 数字语义一致：信任最后 N 跳代理。
	// 0 表示直接用 RemoteAddr——裸奔到公网时这是唯一不可伪造的来源。
	TrustProxyHops int
	// Logf 接收一行结构化告警（默认写 stderr）。绝不写入地址内容与 botToken。
	Logf func(line string)
}

// Router 是两个 handler 的持有者。可变状态只有 bot 用户名缓存与清理节流时间戳。
type Router struct {
	db       *sql.DB
	tokens   TokenVerifier
	botToken string
	ttl      time.Duration
	now      func() time.Time
	allowNew func(string) bool
	allowGet func(string) bool
	client   *http.Client
	hops     int
	logf     func(string)

	mu          sync.Mutex
	botUsername string
	botTriedAt  time.Time
	lastPurge   time.Time
}

// New 构造路由。Tokens 缺失属于装配错误：没有它任何人都能创建分享，
// 会把公开链接变成任意内容的投放点，因此直接返回 error 而不是降级。
func New(d Dep) (*Router, error) {
	if d.Tokens == nil {
		return nil, errors.New("addrshare: tokens required")
	}
	now := d.Now
	if now == nil {
		now = time.Now
	}
	ttl := d.TTL
	if ttl <= 0 {
		ttl = DefaultTTL
	}
	logf := d.Logf
	if logf == nil {
		logf = func(line string) { fmt.Fprintln(os.Stderr, line) }
	}
	return &Router{
		db:       d.DB,
		tokens:   d.Tokens,
		botToken: d.BotToken,
		ttl:      ttl,
		now:      now,
		allowNew: d.AllowCreate,
		allowGet: d.AllowRead,
		client:   d.HTTPClient,
		hops:     d.TrustProxyHops,
		logf:     logf,
	}, nil
}

// Mount 把两个 handler 挂到 mux：POST {prefix}/share、GET {prefix}/shared/{token}。
// 用 Go 1.22 的 pattern 语法，无需第三方路由。
func (r *Router) Mount(mux *http.ServeMux, prefix string) {
	mux.HandleFunc("POST "+prefix+"/share", r.Share)
	mux.HandleFunc("GET "+prefix+"/shared/{token}", r.Shared)
}

// Share 创建一条分享（POST）。
func (r *Router) Share(w http.ResponseWriter, req *http.Request) {
	if r.allowNew != nil && !r.allowNew(r.ClientKey(req)) {
		writeError(w, http.StatusTooManyRequests, "RATE_LIMITED", "Too many requests")
		return
	}

	claims, authorized := r.authorize(req)
	if !authorized {
		writeError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Please reopen the Mini App from Telegram")
		return
	}

	body := parseBody(req)
	payload := Payload{
		Street:   clip(body["street"], StreetLimit),
		Address:  clip(body["address"], AddressLimit),
		Lat:      clip(body["lat"], CoordLimit),
		Lng:      clip(body["lng"], CoordLimit),
		AreaCode: clip(body["areaCode"], AreaCodeLimit),
	}
	// areaCode 只是地区码，缺失时给 "1"（Node 同款兜底），避免下游拿到空串。
	if payload.AreaCode == "" {
		payload.AreaCode = "1"
	}
	if payload.Street == "" || payload.Lat == "" || payload.Lng == "" {
		writeError(w, http.StatusBadRequest, "INVALID", "Address incomplete")
		return
	}

	mid := claims.Mid
	if mid <= 0 || mid > maxSafeInteger {
		writeError(w, http.StatusForbidden, "NO_MEMBER", "Member not found")
		return
	}

	tokenValue, err := newToken()
	if err != nil {
		// 随机源不可用时宁可失败也不能退化成可预测 token（可枚举 = 地址泄露）。
		writeError(w, http.StatusInternalServerError, "INTERNAL", "Please retry")
		return
	}
	now := r.now()
	expiresAt := now.Add(r.ttl)

	ctx := req.Context()
	r.maybePurge(ctx, now)

	if err := r.store(ctx, tokenValue, mid, payload, now, expiresAt); err != nil {
		writeError(w, http.StatusBadGateway, "STORE_FAILED", "Please retry")
		return
	}

	// 取用户名失败不影响创建结果：url 降级为 null，前端改走纯文本分享。
	response := shareData{Token: tokenValue, ExpiresAt: expiresAt.Unix()}
	if username := r.resolveBotUsername(ctx); username != "" {
		link := "https://t.me/" + username + "?startapp=addr_" + tokenValue
		response.URL = &link
	}
	writeJSON(w, http.StatusOK, shareResponse{Success: true, Data: response})
}

// Shared 凭 token 公开读取地址快照（GET）。不校验登录、不返回 uid 等归属信息。
func (r *Router) Shared(w http.ResponseWriter, req *http.Request) {
	if r.allowGet != nil && !r.allowGet(r.ClientKey(req)) {
		writeError(w, http.StatusTooManyRequests, "RATE_LIMITED", "Too many requests")
		return
	}

	tokenValue := pathToken(req)
	if !tokenRe.MatchString(tokenValue) {
		writeError(w, http.StatusNotFound, "NOT_FOUND", "")
		return
	}

	raw, err := r.lookup(req.Context(), tokenValue)
	if err != nil {
		writeError(w, http.StatusBadGateway, "LOOKUP_FAILED", "")
		return
	}
	if len(raw) == 0 {
		writeError(w, http.StatusNotFound, "NOT_FOUND", "")
		return
	}

	var data any
	if err := json.Unmarshal(raw, &data); err != nil {
		writeError(w, http.StatusBadGateway, "CORRUPT", "")
		return
	}
	writeJSON(w, http.StatusOK, sharedResponse{Success: true, Data: data})
}

// authorize 解析 `Authorization: Bearer <token>`。任何一步失败都按未登录处理，
// 不区分「没带头」与「token 过期」——否则等于给攻击者一个探测令牌状态的接口。
func (r *Router) authorize(req *http.Request) (token.Claims, bool) {
	matched := bearerRe.FindStringSubmatch(req.Header.Get("Authorization"))
	if matched == nil {
		return token.Claims{}, false
	}
	claims, err := r.tokens.Verify(matched[1])
	if err != nil {
		return token.Claims{}, false
	}
	return claims, true
}

var bearerRe = regexp.MustCompile(`^Bearer (.+)$`)

// store 在一个事务里写入分享并裁掉超额记录。
//
// 两条语句必须同事务：只插入不裁剪会让「最近 20 条」的承诺失效（公开接口长期暴露历史地址）；
// 裁剪先于插入完成则会误删刚写的这一条。
func (r *Router) store(ctx context.Context, tokenValue string, mid int64, payload Payload, createdAt, expiresAt time.Time) error {
	if r.db == nil {
		return errors.New("addrshare: db not configured")
	}
	raw, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback() }()

	if _, err := tx.ExecContext(ctx,
		"INSERT INTO fbs_addr_share (token, uid, payload, created_at, expires_at) VALUES (?, ?, ?, ?, ?)",
		tokenValue, mid, string(raw), createdAt.Unix(), expiresAt.Unix()); err != nil {
		return err
	}

	// 只保留该会员最近 MaxPerUID 条。MySQL 不允许 DELETE 的子查询引用同表，
	// 必须再套一层派生表 `AS keep` ——去掉它就会报 1093。
	if _, err := tx.ExecContext(ctx,
		"DELETE FROM fbs_addr_share WHERE uid = ? AND token NOT IN ("+
			"SELECT token FROM (SELECT token FROM fbs_addr_share WHERE uid = ? "+
			"ORDER BY created_at DESC, token DESC LIMIT ?) AS keep)",
		mid, mid, MaxPerUID); err != nil {
		return err
	}
	return tx.Commit()
}

// lookup 按 token 读快照；未命中返回 (nil, nil)。
//
// 与 Node 的一处有意差异：Node 走 `mariadb -N -B` 批处理，输出里的反斜杠会被二次转义，
// 所以它只能 `SELECT HEX(payload)` 再手工 hex 解码。Go 用驱动读原始字节，
// 直接 SELECT payload 就能精确还原含引号与反斜杠的 JSON，少一次编解码也就少一个出错点。
func (r *Router) lookup(ctx context.Context, tokenValue string) ([]byte, error) {
	if r.db == nil {
		return nil, errors.New("addrshare: db not configured")
	}
	var payload []byte
	err := r.db.QueryRowContext(ctx,
		"SELECT payload FROM fbs_addr_share WHERE token = ? AND expires_at > ? LIMIT 1",
		tokenValue, r.now().Unix()).Scan(&payload)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return payload, nil
}

// maybePurge 按进程节流清理过期分享。清理失败只告警不阻断：过期数据是卫生问题，
// 不该让创建接口跟着失败。
func (r *Router) maybePurge(ctx context.Context, now time.Time) {
	r.mu.Lock()
	if !r.lastPurge.IsZero() && now.Sub(r.lastPurge) < PurgeInterval {
		r.mu.Unlock()
		return
	}
	r.lastPurge = now
	r.mu.Unlock()

	if r.db == nil {
		return
	}
	if _, err := r.db.ExecContext(ctx, "DELETE FROM fbs_addr_share WHERE expires_at <= ?", now.Unix()); err != nil {
		r.warn(struct {
			Evt string `json:"evt"`
			Msg string `json:"msg"`
		}{Evt: "addrshare_purge_failed", Msg: err.Error()})
	}
}

// resolveBotUsername 拉取并缓存 bot 用户名。只在第一次成功前尝试，
// 失败后 botUsernameRetry 内不重试（与 Node 的 botTriedAt 节流一致）。
func (r *Router) resolveBotUsername(ctx context.Context) string {
	r.mu.Lock()
	if r.botUsername != "" {
		cached := r.botUsername
		r.mu.Unlock()
		return cached
	}
	if r.botToken == "" {
		r.mu.Unlock()
		return ""
	}
	now := r.now()
	if !r.botTriedAt.IsZero() && now.Sub(r.botTriedAt) < botUsernameRetry {
		r.mu.Unlock()
		return ""
	}
	// 先把「尝试时间」写下去再发请求：并发请求看到这个时间戳就直接降级，
	// 不会一起去打 Telegram。网络调用本身不持锁，避免一个慢请求拖住创建接口。
	r.botTriedAt = now
	r.mu.Unlock()

	username := r.fetchBotUsername(ctx)
	if username == "" {
		return ""
	}
	r.mu.Lock()
	r.botUsername = username
	r.mu.Unlock()
	return username
}

func (r *Router) fetchBotUsername(ctx context.Context) string {
	endpoint := "https://api.telegram.org/bot" + r.botToken + "/getMe"
	reqCtx, cancel := context.WithTimeout(ctx, getMeTimeout)
	defer cancel()

	request, err := http.NewRequestWithContext(reqCtx, http.MethodGet, endpoint, nil)
	if err != nil {
		return ""
	}
	client := r.client
	if client == nil {
		client = &http.Client{Timeout: getMeTimeout}
	}
	response, err := client.Do(request)
	if err != nil {
		return ""
	}
	defer func() { _ = response.Body.Close() }()

	var out struct {
		OK     bool `json:"ok"`
		Result struct {
			Username string `json:"username"`
		} `json:"result"`
	}
	if err := json.NewDecoder(io.LimitReader(response.Body, 1<<20)).Decode(&out); err != nil {
		return ""
	}
	if !out.OK {
		return ""
	}
	return out.Result.Username
}

func (r *Router) warn(value any) {
	line, err := json.Marshal(value)
	if err != nil {
		return
	}
	r.logf(string(line))
}

// ClientKey 取限流身份。TrustProxyHops > 0 时按 express 的语义取
// 「X-Forwarded-For + RemoteAddr」链条里倒数第 hops+1 个地址，
// 否则直接用 RemoteAddr——客户端伪造的 XFF 在裸奔部署下不可信。
func (r *Router) ClientKey(req *http.Request) string {
	remote := hostOnly(req.RemoteAddr)
	if r.hops <= 0 {
		return remote
	}
	chain := make([]string, 0, 8)
	for _, part := range strings.Split(req.Header.Get("X-Forwarded-For"), ",") {
		if trimmed := strings.TrimSpace(part); trimmed != "" {
			chain = append(chain, trimmed)
		}
	}
	if remote != "" {
		chain = append(chain, remote)
	}
	index := len(chain) - 1 - r.hops
	if index < 0 || index >= len(chain) {
		return remote
	}
	return chain[index]
}

func hostOnly(addr string) string {
	if addr == "" {
		return ""
	}
	if host, _, err := net.SplitHostPort(addr); err == nil {
		return host
	}
	return addr
}

// pathToken 取 URL 里的 token：优先 mux 的通配符，未挂 mux 时（如单测直接调用）从路径尾段取。
func pathToken(req *http.Request) string {
	if value := req.PathValue("token"); value != "" {
		return value
	}
	cleaned := strings.TrimSuffix(req.URL.Path, "/")
	index := strings.LastIndex(cleaned, "/")
	if index < 0 {
		return cleaned
	}
	return cleaned[index+1:]
}

// clip 复刻 Node 的 clip：String(v) → 换行/制表符压成空格 → TrimSpace → 截断。
//
// 截断按 rune 计。Node 的 slice 按 UTF-16 码元计，对 BMP 字符（含全部常用汉字）两者一致；
// 只有 emoji 等增补平面字符在边界上会差一位，这里取「不切断字符」更安全的一侧。
func clip(value any, limit int) string {
	text := strings.TrimSpace(breakRunRe.ReplaceAllString(jsString(value), " "))
	runes := []rune(text)
	if len(runes) <= limit {
		return text
	}
	return string(runes[:limit])
}

// jsString 复刻 JS 的 String(v)：null/undefined 变空串，数字用最短十进制表示。
// 地址字段可能来自 JSON 数字（lat/lng），直接按 Go 类型断言会静默变成空串导致 400。
func jsString(value any) string {
	switch typed := value.(type) {
	case nil:
		return ""
	case string:
		return typed
	case bool:
		if typed {
			return "true"
		}
		return "false"
	case float64:
		return jsNumber(typed)
	case json.Number:
		return typed.String()
	case []any:
		parts := make([]string, 0, len(typed))
		for _, item := range typed {
			parts = append(parts, jsString(item))
		}
		return strings.Join(parts, ",")
	case map[string]any:
		// JS 的 String({}) 就是这句；保持一字不差比「聪明地拒绝」更省事。
		return "[object Object]"
	}
	return ""
}

func jsNumber(value float64) string {
	if math.IsNaN(value) {
		return "NaN"
	}
	if math.IsInf(value, 1) {
		return "Infinity"
	}
	if math.IsInf(value, -1) {
		return "-Infinity"
	}
	// JS 在 |v| < 1e21 的整数上一律输出完整十进制（1e6 → "1000000"，不是 "1e+06"）。
	if value == math.Trunc(value) && math.Abs(value) < 1e21 {
		return strconv.FormatInt(int64(value), 10)
	}
	return strconv.FormatFloat(value, 'g', -1, 64)
}

func newToken() (string, error) {
	buf := make([]byte, 16)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return hex.EncodeToString(buf), nil
}

// parseBody 取请求体字段，口径与 Node 的 express.json + express.urlencoded 一致：
// 解析方式由 Content-Type 决定（不再按首字节嗅探 —— 那会把 text/plain 的 JSON 也收进来）。
// 解析失败按「没有字段」处理：后续参数校验会以 400 INVALID 收口。
func parseBody(req *http.Request) map[string]any {
	return httpbody.FieldsOf(req)
}

type errorDetail struct {
	Code string `json:"code"`
	// Message 省略时输出 {"code":"NOT_FOUND"}，与 Node 的 error 对象逐字一致。
	Message string `json:"message,omitempty"`
}

type failureBody struct {
	Success bool        `json:"success"`
	Error   errorDetail `json:"error"`
}

type shareData struct {
	Token string `json:"token"`
	// URL 未就绪时为 null（不是空串），前端据此降级为纯文本分享。
	URL       *string `json:"url"`
	ExpiresAt int64   `json:"expiresAt"`
}

type shareResponse struct {
	Success bool      `json:"success"`
	Data    shareData `json:"data"`
}

type sharedResponse struct {
	Success bool `json:"success"`
	Data    any  `json:"data"`
}

func writeError(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, failureBody{Error: errorDetail{Code: code, Message: message}})
}

// writeJSON 与 Node 的 res.json 对齐：不转义 <、>、&，也不追加结尾换行。
// 默认编码器会把 `<` 写成 `\u003c` 并在末尾补 0x0a —— 两者对 JSON 语义无影响，
// 但会让「与 Node 逐字节比对」的验收手段失效，排障时也多出一处噪音。
func writeJSON(w http.ResponseWriter, status int, body any) {
	buf := &bytes.Buffer{}
	encoder := json.NewEncoder(buf)
	encoder.SetEscapeHTML(false)
	if err := encoder.Encode(body); err != nil {
		http.Error(w, `{"success":false,"error":{"code":"INTERNAL_ERROR","message":"encode failed"}}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_, _ = w.Write(bytes.TrimSuffix(buf.Bytes(), []byte("\n")))
}
