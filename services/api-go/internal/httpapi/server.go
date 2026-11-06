// Package httpapi 把 B1/B2 的各模块按 Node 版 server.js 的装配顺序接到一个
// net/http.ServeMux 上（无 Web 框架），并提供 Routes() 供契约检查比对。
//
// 路由口径：除了 app 级静态资源与健康检查，凡是 Node 版挂在 /tg-api 下的
// router.xxx 都必须逐条对应；多一条少一条都会让 scripts/api-contract-check.js 的
// Go 版（internal/contract）报差异。
package httpapi

import (
	"bytes"
	"context"
	"database/sql"
	"io"
	"net"
	"net/http"
	"net/url"
	"os"
	"strings"
	"sync/atomic"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/addrshare"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/bridge"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/calltest"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/coins"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/fbproxy"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/httpbody"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/payment"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/tgauth"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/token"
)

// MaxBodyBytes 与 express.json 的默认 100kb 上限一致。
const MaxBodyBytes = 100 * 1024

// tmaCSP 与 server.js 的 TMA_CSP 逐字一致：脚本只允许自身与 Telegram 官方脚本；
// 只允许被 Telegram 内嵌；连接仅限同源（代理）。
// 这条一致性由 selfcheck 里的 parity 测试直接读 services/api/src/server.js 比对，不靠人眼。
const tmaCSP = "default-src 'self'; script-src 'self' https://telegram.org https://maps.googleapis.com https://maps.gstatic.com; style-src 'self' 'unsafe-inline' https://maps.googleapis.com; " +
	"img-src 'self' data: https:; connect-src 'self' https://maps.googleapis.com; frame-ancestors https://web.telegram.org https://*.telegram.org; base-uri 'self'"

// callTestBusy 是 call-test 的全局单飞闸门（Node 是模块级 let）。包级而非 Server 字段：
// 语义就是「整个进程同一时刻只允许一个呼叫测试」，多建几个 Server 不该绕过。
var callTestBusy atomic.Bool

// LoginService 是既有登录编排（member.LoginService 满足它）。
type LoginService interface {
	Login(ctx context.Context, initData string) (int, any)
}

// Auth 是登录/令牌/凭证三件套。为 nil 表示 TMA 登录模块未装配：
// /auth/telegram、/auth/logout 一律 503，/addr/* 整段不注册。
type Auth struct {
	Login       LoginService
	Tokens      *token.Service
	Credentials func(ctx context.Context, memberID int64) (string, error)
}

// Dep 注入装配依赖。测试逐项替换，生产由 cmd/api 装配。
type Dep struct {
	Env      func(string) string
	Now      func() time.Time
	DB       *sql.DB
	BotToken string
	// ValidateInitData 可注入；默认走 tgauth.Validate（1h 时效，与 Node 的 telegramAuth 一致：
	// MAX_AUTH_AGE_SECONDS = 3600。这里不是 24h —— 单位写错会让人以为 Go 侧放宽了时效）。
	ValidateInitData func(initData, botToken string) tgauth.Result

	Auth     *Auth
	Payments *payment.Manager
	Coins    *coins.Client
	Checkout http.HandlerFunc
	// TelegramWeb 是 /tg-api/auth/telegram-web（tglogin.New 的产物）。
	TelegramWeb http.HandlerFunc
	Bridge      *bridge.Route
	Addr        *addrshare.Router
	FBProxy     *fbproxy.Proxy

	// TMAStaticDir 为空或目录不存在时不挂载 /tma（Node 的 existsSync 守卫）。
	TMAStaticDir string
	// TrustProxyHops > 0 时按 X-Forwarded-For 从右往左取第 N 个作为 clientKey。
	TrustProxyHops int
	// RunCallTest 可注入（默认 calltest.Run）。
	RunCallTest func(ctx context.Context, url string, payload any, opt calltest.Options) calltest.Result
	Logf        func(line string)
}

// Route 是契约检查用的路由声明。Method 为 "ALL" 表示不限定方法（等价 router.all）。
type Route struct {
	Method string
	Path   string
	// Conditional 说明该路由在什么条件下才注册（空 = 总是注册）。
	Conditional string
}

// Server 持有 mux 与装配后的依赖。
type Server struct {
	env         func(string) string
	now         func() time.Time
	db          *sql.DB
	botToken    string
	validate    func(string, string) tgauth.Result
	auth        *Auth
	payments    *payment.Manager
	coins       *coins.Client
	checkout    http.HandlerFunc
	telegramWeb http.HandlerFunc
	bridge      *bridge.Route
	addr        *addrshare.Router
	fbProxy     *fbproxy.Proxy
	staticDir   string
	hops        int
	runCallTest func(context.Context, string, any, calltest.Options) calltest.Result
	logf        func(string)

	verifyLimiter func(string) bool

	mux http.Handler
}

// NewServer 按 server.js 的条件装配全部路由。
func NewServer(d Dep) *Server {
	env := d.Env
	if env == nil {
		env = os.Getenv
	}
	now := d.Now
	if now == nil {
		now = time.Now
	}
	logf := d.Logf
	if logf == nil {
		logf = func(line string) { _, _ = os.Stderr.WriteString(line + "\n") }
	}
	validate := d.ValidateInitData
	if validate == nil {
		validate = func(initData, botToken string) tgauth.Result {
			return tgauth.Validate(initData, botToken, tgauth.Options{Now: now})
		}
	}
	runner := d.RunCallTest
	if runner == nil {
		runner = calltest.Run
	}

	s := &Server{
		env:         env,
		now:         now,
		db:          d.DB,
		botToken:    d.BotToken,
		validate:    validate,
		auth:        d.Auth,
		payments:    d.Payments,
		coins:       d.Coins,
		checkout:    d.Checkout,
		telegramWeb: d.TelegramWeb,
		bridge:      d.Bridge,
		addr:        d.Addr,
		fbProxy:     d.FBProxy,
		staticDir:   d.TMAStaticDir,
		// TrustProxyHops 为 0 即「不信任 X-Forwarded-For」，与 express 未配置
		// trust proxy 时 req.ip == RemoteAddr 的行为一致。
		hops:        d.TrustProxyHops,
		runCallTest: runner,
		logf:        logf,
	}
	s.verifyLimiter = token.NewLimiter(30, 60*time.Second, now)
	s.mux = s.build()
	return s
}

// Handler 返回带中间件的最终 handler。
func (s *Server) Handler() http.Handler { return s.mux }

// Routes 返回契约检查用的路由表（顺序无关）。
//
// 与 OpenAPI 的已知口径差：`/`、`/health`、`/tma`、`/tma/`、
// `/tg-api/payment/mock-webhook` 不在 spec 收录范围内（不是对外 API）。
func (s *Server) Routes() []Route {
	routes := []Route{
		{Method: "GET", Path: "/"},
		{Method: "GET", Path: "/health"},
		{Method: "GET", Path: "/tg-api/health"},
		{Method: "POST", Path: "/tg-api/auth/tg-verify"},
		{Method: "POST", Path: "/tg-api/auth/telegram"},
		{Method: "POST", Path: "/tg-api/auth/logout"},
		{Method: "GET", Path: "/tg-api/auth/bridge"},
		{Method: "POST", Path: "/tg-api/auth/bridge"},
		{Method: "POST", Path: "/tg-api/auth/telegram-web"},
		{Method: "GET", Path: "/tg-api/services"},
		{Method: "POST", Path: "/tg-api/payment/create-charge"},
		{Method: "POST", Path: "/tg-api/checkout"},
		{Method: "GET", Path: "/tg-api/payment/status/{chargeId}"},
		{Method: "GET", Path: "/tg-api/rates/coins-ph"},
		{Method: "GET", Path: "/tg-api/rates/convert"},
		{Method: "GET", Path: "/tg-api/wallet/coins-ph/balance"},
		{Method: "POST", Path: "/tg-api/call-test"},
		{Method: "ALL", Path: "/tg-api/fb/{service}/{action}", Conditional: "FB_UPSTREAM_URL"},
		{Method: "POST", Path: "/tg-api/addr/share", Conditional: "auth"},
		{Method: "GET", Path: "/tg-api/addr/shared/{token}", Conditional: "auth"},
		{Method: "POST", Path: "/tg-api/payment/mock-webhook", Conditional: "ENV != production"},
		{Method: "GET", Path: "/tma", Conditional: "TMA_STATIC_DIR"},
		{Method: "GET", Path: "/tma/", Conditional: "TMA_STATIC_DIR"},
	}
	return routes
}

// ConditionKeys 返回按条件注册的路由的条件名，供契约检查说明口径。
func (s *Server) ConditionKeys() []string {
	seen := map[string]bool{}
	keys := make([]string, 0, 4)
	for _, route := range s.Routes() {
		if route.Conditional == "" || seen[route.Conditional] {
			continue
		}
		seen[route.Conditional] = true
		keys = append(keys, route.Conditional)
	}
	return keys
}

func (s *Server) build() http.Handler {
	mux := http.NewServeMux()

	// 1. 健康检查：`/{$}` 是「精确根」，写成 `/` 会吞掉所有未匹配路径。
	mux.HandleFunc("GET /{$}", s.health)
	mux.HandleFunc("GET /health", s.health)
	mux.HandleFunc("GET /tg-api/health", s.health)

	// 2. Telegram Mini App 鉴权
	mux.HandleFunc("POST /tg-api/auth/tg-verify", s.tgVerify)
	mux.HandleFunc("POST /tg-api/auth/telegram", s.authTelegram)
	mux.HandleFunc("POST /tg-api/auth/logout", s.authLogout)

	// 2b. 白名单代理：仅在 FB_UPSTREAM_URL 配置时注册（与 Node 的 if (fbUpstream) 一致）。
	if s.fbProxy != nil {
		mux.HandleFunc("/tg-api/fb/{service}/{action}", s.fbProxyHandle)
	}

	// 2c. 地址分享：auth 未装配时整段 404（Node 的 if (auth) 守卫）。
	if s.addr != nil {
		mux.HandleFunc("POST /tg-api/addr/share", s.addr.Share)
		mux.HandleFunc("GET /tg-api/addr/shared/{token}", s.addr.Shared)
	}

	// 2d. TMA 静态资源：目录不存在就不挂载（/tma 返回 404 而不是 500）。
	if s.staticDir != "" && dirExists(s.staticDir) {
		static := http.StripPrefix("/tma", http.FileServer(http.Dir(s.staticDir)))
		// 301 也要过 tmaHeaders：Node 的 `app.use('/tma', ...)` 挂在 static 之前，
		// 对 redirect 同样生效。少了这层，浏览器会带着「没有 CSP 的 301」跳到 /tma/，
		// 而在部分客户端里响应头以首个响应为准，CSP 就整段丢了。
		mux.Handle("GET /tma", s.tmaHeaders(http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			http.Redirect(w, req, "/tma/", http.StatusMovedPermanently)
		})))
		mux.Handle("/tma/", s.tmaHeaders(static))
	}

	// 3. 四大核心模块元数据
	mux.HandleFunc("GET /tg-api/services", s.services)

	// 4. 支付
	mux.HandleFunc("POST /tg-api/payment/create-charge", s.createCharge)
	mux.HandleFunc("GET /tg-api/payment/status/{chargeId}", s.paymentStatus)
	if s.env("NODE_ENV") != "production" {
		mux.HandleFunc("POST /tg-api/payment/mock-webhook", s.mockWebhook)
	}

	// 5. 收银台与顾客免密登录
	if s.checkout != nil {
		mux.HandleFunc("POST /tg-api/checkout", s.checkout)
	}
	if s.telegramWeb != nil {
		mux.HandleFunc("POST /tg-api/auth/telegram-web", s.telegramWeb)
	}

	// 6. Coins.ph 行情/换算/余额
	mux.HandleFunc("GET /tg-api/rates/coins-ph", s.ratesTicker)
	mux.HandleFunc("GET /tg-api/rates/convert", s.ratesConvert)
	mux.HandleFunc("GET /tg-api/wallet/coins-ph/balance", s.walletBalance)

	// 7. 呼叫自测
	mux.HandleFunc("POST /tg-api/call-test", s.callTest)

	// 8. 登录桥（放最后，与 Node 的挂载顺序一致：它天然要写 Set-Cookie）
	if s.bridge != nil {
		mux.HandleFunc("GET /tg-api/auth/bridge", s.bridge.GetLanding)
		mux.HandleFunc("POST /tg-api/auth/bridge", s.bridge.PostBridge)
	}

	return s.wrap(mux)
}

// wrap 是中间件链：CORS → body 上限 + 解析 → 路由。
//
// body 只在这里读一次并按 Content-Type 解析成 map（httpbody.Parse），结果连同原始字节
// 一起挂进 context：下游（bridge / tglogin / checkout / addrshare / fbproxy）直接取用，
// 不再各自 ParseForm 或重读 Body —— 也不会出现「入口嗅探成 JSON、下游按表单再解析一遍」这种分裂。
func (s *Server) wrap(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		s.applyCORS(w, req)
		if req.Method == http.MethodOptions {
			// express 的 cors() 会直接结束预检请求，不进路由。
			w.WriteHeader(http.StatusNoContent)
			return
		}
		if req.Body != nil {
			raw, err := io.ReadAll(io.LimitReader(req.Body, MaxBodyBytes+1))
			if err != nil {
				writeJSON(w, http.StatusBadRequest, stringError{Success: false, Error: "Malformed request body"})
				return
			}
			if len(raw) > MaxBodyBytes {
				writeJSON(w, http.StatusRequestEntityTooLarge, stringError{Success: false, Error: "Payload too large"})
				return
			}
			// 原始字节写回：仍可能有下游需要原文（例如 fb 代理转发 body）。
			req.Body = io.NopCloser(bytes.NewReader(raw))
			req = httpbody.With(req, raw, httpbody.Parse(req.Header.Get("Content-Type"), raw))
		}
		next.ServeHTTP(w, req)
	})
}

// applyCORS 复刻 Node 的 cors 行为：
// CORS_ORIGINS 为空 → `*`；非空 → 命中则回显 Origin 并加 Vary，未命中不加 ACAO。
func (s *Server) applyCORS(w http.ResponseWriter, req *http.Request) {
	origins := splitList(s.env("CORS_ORIGINS"))
	origin := req.Header.Get("Origin")
	if len(origins) == 0 {
		w.Header().Set("Access-Control-Allow-Origin", "*")
	} else if origin != "" && contains(origins, origin) {
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Add("Vary", "Origin")
	}
	if req.Method != http.MethodOptions {
		return
	}
	w.Header().Set("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE")
	if requested := req.Header.Get("Access-Control-Request-Headers"); requested != "" {
		w.Header().Set("Access-Control-Allow-Headers", requested)
		w.Header().Add("Vary", "Access-Control-Request-Headers")
	}
}

// tmaHeaders 给 /tma 的每个响应加 CSP 与缓存策略：静态资源 1 小时，
// index.html 必须 no-cache（否则前端发版后用户永远拿到旧入口）。
func (s *Server) tmaHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		w.Header().Set("Content-Security-Policy", tmaCSP)
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Referrer-Policy", "no-referrer")
		rel := strings.TrimPrefix(req.URL.Path, "/tma")
		if rel == "" || rel == "/" || strings.HasSuffix(rel, "/index.html") {
			w.Header().Set("Cache-Control", "no-cache")
		} else {
			w.Header().Set("Cache-Control", "max-age=3600")
		}
		next.ServeHTTP(w, req)
	})
}

// hostOnly 去掉 RemoteAddr 里的端口。不依赖 net.SplitHostPort 的报错分支：
// 某些测试/中间件会把 RemoteAddr 写成裸 IP，SplitHostPort 会失败，这里退回原值。
func hostOnly(address string) string {
	if host, _, err := net.SplitHostPort(address); err == nil {
		return host
	}
	return address
}

// SecureRequest 复刻 express 的 `req.secure`（= `req.protocol === 'https'`）：
// 只有信任代理（hops > 0）时才采信 X-Forwarded-Proto，否则一律看连接本身。
//
// 为什么必须区分「信任」：XFP 是客户端可伪造的请求头。不信任代理时采信它，
// 攻击者随手加一行就能让服务端以为走的是 https；反之在 Traefik 终止 TLS 的
// 生产链路上，到容器的连接永远是明文 http，只看连接又会漏掉 Secure ——
// 两种错法都会让「非 HttpOnly 的 24 小时凭证」裸奔。
//
// 取值口径与 express 一致：XFP 可能被写成逗号列表，取**最左**那一项
// （链路上最外层那个代理看到的协议，也就是浏览器真实用的协议）。
// 本条链路上 XFP 只有一个值，最左 == 最右；写成列表只是多代理误配时的兜底。
func SecureRequest(hops int) func(*http.Request) bool {
	return func(req *http.Request) bool {
		if hops > 0 {
			if forwarded := req.Header.Get("X-Forwarded-Proto"); forwarded != "" {
				first, _, _ := strings.Cut(forwarded, ",")
				return strings.EqualFold(strings.TrimSpace(first), "https")
			}
		}
		return req.TLS != nil
	}
}

// clientKey 是限流分桶键。TrustProxyHops > 0 时按 express 语义取
// 「X-Forwarded-For + RemoteAddr」链条里倒数第 hops+1 个地址；否则只认 RemoteAddr。
func (s *Server) clientKey(req *http.Request) string {
	remote := hostOnly(req.RemoteAddr)
	if s.hops <= 0 {
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
	index := len(chain) - 1 - s.hops
	if index < 0 || index >= len(chain) {
		return remote
	}
	return chain[index]
}

// queryStrings 把 URL query 转成代理需要的 map[string]string。
//
// 重复 key 在 Node 的 req.query 里是数组，而 sanitizeParams 会丢弃非字符串值 ——
// 所以这里也把「出现多次」的 key 整个丢掉，保持同一套过滤结果。
func queryStrings(values url.Values) map[string]string {
	out := make(map[string]string, len(values))
	for key, list := range values {
		if len(list) != 1 {
			continue
		}
		out[key] = list[0]
	}
	return out
}

func dirExists(dir string) bool {
	info, err := os.Stat(dir)
	return err == nil && info.IsDir()
}

func splitList(value string) []string {
	parts := strings.Split(value, ",")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		if trimmed := strings.TrimSpace(part); trimmed != "" {
			out = append(out, trimmed)
		}
	}
	return out
}

func contains(list []string, want string) bool {
	for _, item := range list {
		if item == want {
			return true
		}
	}
	return false
}

// BodyOf 取请求体字段（JSON 对象或 x-www-form-urlencoded，由 Content-Type 决定）。
// 解析失败返回空 map：后续参数校验会以 400 收口，不需要单独的解析错误分支。
func BodyOf(req *http.Request) map[string]any {
	return httpbody.FieldsOf(req)
}

// QueryOf 取 URL query 的单值（重复 key 取首个，与 URLSearchParams.get 一致）。
func QueryOf(req *http.Request, key string) string {
	return req.URL.Query().Get(key)
}
