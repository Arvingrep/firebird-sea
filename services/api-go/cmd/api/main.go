// Command api 是 Go 版 Firebird SEA Core API 的进程入口。
//
// 启动顺序与 Node 版 services/api/src/server.js 对齐：
//  1. 生产配置自检 —— 不过就退出。带着演示令牌/占位收款地址对外服务，等于把
//     「谁都能伪造 initData」和「收款打进无人持有的地址」两件事同时打开。
//  2. 建业务连接池 —— 不开 multiStatements（见 dsnFor 的注释）。
//  3. 跑迁移 —— 另开一条一次性连接，跑完即关。失败重试 3 次，仍失败就退出：
//     表结构不对时进程活着只会把每个请求变成 500。
//  4. 装配路由 —— 登录/令牌/凭证缺失属于「可降级」，进程照常起，相关端点各自 503，
//     这样 /health 仍能探活，排障时能看到「哪个依赖没配」而不是「容器起不来」。
//  5. 监听 PORT（默认 3000），收 SIGTERM/SIGINT 后优雅退出（15s）。
package main

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"syscall"
	"time"

	_ "github.com/go-sql-driver/mysql"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/addrshare"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax/article"
	ajaxmember "github.com/arvingrep/firebird-sea/services/api-go/internal/ajax/member"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax/siteconfig"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/bridge"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/checkout"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/coins"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/config"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/credential"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/dispatch"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/fbproxy"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/fburl"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/gateway"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/httpapi"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/member"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/merchant"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/migrate"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/payment"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/rider"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/state"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/tglogin"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/token"
)

const (
	// defaultPort 与 Node 的 `process.env.PORT || 3000` 一致。
	defaultPort = 3000
	// 连接池参数：10 个连接足够扛住单副本的 TMA 流量；3 分钟生命周期能让
	// MySQL 侧重启/切主后旧连接自然淘汰，不至于把死连接留在池子里反复超时。
	poolMaxOpen         = 10
	poolMaxIdle         = 5
	poolConnMaxLifetime = 3 * time.Minute
	// 迁移重试：容器启动时数据库可能还在初始化，3 次 × 5s 覆盖绝大多数冷启动窗口。
	migrationAttempts   = 3
	migrationRetryDelay = 5 * time.Second
	migrationTimeout    = 60 * time.Second
	// shutdownTimeout 给在途请求留 15s：扣款/下单这类写请求不能一刀切断。
	shutdownTimeout = 15 * time.Second
	// dispatchDrain 是 SIGTERM 后等在飞派单通知的上限（N3，与 Node 的
	// SIGTERM_DRAIN_MS = 8000 同值）：给 pod 的 terminationGracePeriod 留余量。
	dispatchDrain = 8 * time.Second
	// 只读头超时：慢速请求头是最廉价的连接占用手段，10s 足够任何正常客户端。
	readHeaderTimeout = 10 * time.Second
	// IdleTimeout 与常见反代 keep-alive 上限对齐，避免两侧同时认为连接还活着。
	idleTimeout = 75 * time.Second
)

func main() {
	if err := run(); err != nil {
		writeLog(os.Stderr, "api_exit", map[string]any{"error": err.Error()})
		os.Exit(1)
	}
}

func run() error {
	// 1. 生产配置自检。Node 是在模块顶层直接 throw，进程起不来；
	//    这里等价：返回错误 → main 打日志 → exit 1。
	if err := config.AssertProductionConfig(os.Getenv); err != nil {
		return err
	}

	now := time.Now
	botToken := os.Getenv("TELEGRAM_BOT_TOKEN")
	if botToken == "" {
		botToken = config.DemoBotToken
	}
	hops := envInt("TRUST_PROXY_HOPS", 0)

	// 2. 连接池。DB_HOST 缺失时不建池：本地跑纯内存接口（/health、/services、
	//    /payment/create-charge）不该被数据库拖住，与 Node 的惰性 cliConn() 等价。
	//
	//    这条路必须真的能走通：validateAssembly 只在「有库」时要求 Checkout 接上，
	//    所以下面这条 db_skipped 日志、buildCheckout 的 (nil,nil) 分支、server 的
	//    `if s.checkout != nil` 与 /tg-api/checkout 的 404 都是可达路径，不是死代码。
	var db *sql.DB
	if os.Getenv("DB_HOST") != "" {
		pool, err := openPool(dsnFor(false))
		if err != nil {
			return fmt.Errorf("打开数据库连接池失败: %w", err)
		}
		defer func() { _ = pool.Close() }()
		db = pool

		// 3. 迁移走独立连接。
		if err := runMigrations(); err != nil {
			return err
		}
	} else {
		writeLog(os.Stdout, "db_skipped", map[string]any{"reason": "DB_HOST not set"})
	}

	// 4. 装配。
	bundle, err := buildAuth(db, botToken, now)
	if err != nil {
		return err
	}
	if bundle != nil {
		defer bundle.stop()
	} else {
		// 只说「没装配」，不说缺哪个变量：这条日志会进集中日志平台，
		// 依赖清单本身也是信息面。
		writeLog(os.Stdout, "auth_not_configured", map[string]any{
			"detail": "TMA 登录模块未装配，/auth/telegram 与 /auth/addr/* 将降级",
		})
	}

	// 网关配置与 auth 无关：/auth/telegram-web 自己读 env 并在缺配置时 503
	// （Node 也是把 gatewayClient 模块原样传进去，由处理器自己判断）。
	gatewayCfg := gateway.Config{
		BaseURL: os.Getenv("FBS_GATEWAY_URL"),
		Secret:  os.Getenv("FBS_GATEWAY_SECRET"),
		Now:     now,
	}
	gatewayAPI := gatewayAdapter{cfg: gatewayCfg}

	coinsClient := coins.New(coins.Dep{
		BaseURL:   os.Getenv("COINS_PH_BASE_URL"),
		APIKey:    os.Getenv("COINS_PH_API_KEY"),
		APISecret: os.Getenv("COINS_PH_API_SECRET"),
		Now:       now,
	})

	bridgeRoute, err := buildBridge(bundle, botToken, hops, now)
	if err != nil {
		return err
	}

	addrRouter, err := buildAddrShare(bundle, db, botToken, hops, now)
	if err != nil {
		return err
	}

	proxy, err := buildFBProxy(bundle, now)
	if err != nil {
		return err
	}

	// 收银台装配单独收口：缺汇率源/缺 bot token 属于「配错了」，启动即失败；
	// 只缺数据库（本地裸跑）属于文档化的降级，不注册即可 —— 此时
	// validateAssembly 也不会拿 Checkout 为 nil 拦启动（见那里的 dep.DB 判断）。
	checkoutHandler, err := buildCheckout(db, coinsClient, botToken, now)
	if err != nil {
		return err
	}
	if checkoutHandler == nil {
		writeLog(os.Stdout, "checkout_not_configured", map[string]any{
			"reason": "DB_HOST not set",
		})
	}

	dep := httpapi.Dep{
		Env:            os.Getenv,
		Now:            now,
		DB:             db,
		BotToken:       botToken,
		Auth:           bundle.httpAuth(),
		Payments:       payment.New(payment.Dep{MasterAddress: os.Getenv("TRON_MASTER_RECEIVE_ADDRESS"), Now: now}),
		Coins:          coinsClient,
		Checkout:       checkoutHandler,
		TelegramWeb:    tglogin.New(tglogin.Dep{Env: os.Getenv, DB: db, BotToken: botToken, Gateway: gatewayAPI, Now: now}),
		Bridge:         bridgeRoute,
		Addr:           addrRouter,
		FBProxy:        proxy,
		Rider:          buildRider(db, botToken, hops, now),
		Merchant:       buildMerchant(botToken, hops, now),
		Dispatch:       buildDispatch(db, botToken, now),
		Ajax:           buildAjax(db),
		TMAStaticDir:   os.Getenv("TMA_STATIC_DIR"),
		TrustProxyHops: hops,
	}
	// 装配完整性自检：宁可进程起不来，也不要带着「某个依赖没接上」的降级状态对外服务。
	if err := validateAssembly(bundle, dep); err != nil {
		return err
	}
	handler := httpapi.NewServer(dep).Handler()

	// 5. 监听 + 优雅退出。
	port := envInt("PORT", defaultPort)
	httpServer := &http.Server{
		Addr:              ":" + strconv.Itoa(port),
		Handler:           handler,
		ReadHeaderTimeout: readHeaderTimeout,
		IdleTimeout:       idleTimeout,
		// 刻意不设 ReadTimeout/WriteTimeout：/call-test 要串行重试三次外部呼叫
		// （最长约 20s），一刀切的写超时会把「正在等结果」误判成失败。
	}

	serveErr := make(chan error, 1)
	go func() {
		writeLog(os.Stdout, "api_listening", map[string]any{
			"port":    port,
			"service": "Firebird-SEA-Core-API",
			"region":  "Philippines (Manila/Cebu)",
		})
		serveErr <- httpServer.ListenAndServe()
	}()

	signalCh := make(chan os.Signal, 1)
	signal.Notify(signalCh, syscall.SIGINT, syscall.SIGTERM)
	defer signal.Stop(signalCh)

	select {
	case err := <-serveErr:
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			return fmt.Errorf("HTTP 服务异常退出: %w", err)
		}
		return nil
	case received := <-signalCh:
		writeLog(os.Stdout, "api_shutdown", map[string]any{"signal": received.String()})
	}

	ctx, cancel := context.WithTimeout(context.Background(), shutdownTimeout)
	defer cancel()

	// N3：先排空在飞派单通知（上限 8s），再关 HTTP 监听。
	// dispatch 的投递是在响应之后脱离请求生命周期的 goroutine，**不在** httpServer.Shutdown
	// 的等待范围内；不接线的话发版（RollingUpdate 必发 SIGTERM）会把在飞 sendMessage
	// 直接杀死，并让去重占位残留满 1 天（同键事件那天再也发不出去）。
	// Node 的顺序同样如此：drain → close → exit。
	drainCtx, cancelDrain := context.WithTimeout(context.Background(), dispatchDrain)
	drainErr := dep.Dispatch.Drain(drainCtx)
	cancelDrain()
	if drainErr != nil {
		// 残余（超 8s 仍没发完的）靠带 order_id 的日志定位补发，不阻断退出。
		writeLog(os.Stderr, "dispatch_drain_timeout", map[string]any{"detail": drainErr.Error()})
	}

	if err := httpServer.Shutdown(ctx); err != nil {
		return fmt.Errorf("优雅退出超时: %w", err)
	}
	<-serveErr
	writeLog(os.Stdout, "api_stopped", map[string]any{})
	return nil
}

// —— 装配辅助 ——

// authBundle 是 Node server.js buildAuth() 的返回值对应物。
type authBundle struct {
	tokens     *token.Service
	login      *member.LoginService
	creds      *credential.Provider
	idem       state.IdemStore
	revocation *state.RevocationStore
}

// buildAuth 是 Node buildAuth() 的等价物：任一项前置缺失就返回 (nil, nil)，
// 由调用方降级（登录相关端点 503、/addr 整段不注册、/fb 的会员接口一律 401）。
func buildAuth(db *sql.DB, botToken string, now func() time.Time) (*authBundle, error) {
	secret := os.Getenv("TMA_TOKEN_SECRET")
	envName := os.Getenv("TMA_ENV")
	gatewayURL := os.Getenv("FBS_GATEWAY_URL")
	gatewaySecret := os.Getenv("FBS_GATEWAY_SECRET")
	if secret == "" || envName == "" || gatewayURL == "" || gatewaySecret == "" || db == nil {
		return nil, nil
	}
	gatewayAPI := gatewayAdapter{cfg: gateway.Config{BaseURL: gatewayURL, Secret: gatewaySecret, Now: now}}

	// 吊销表放共享库而不是进程内 Map：api 多副本运行时，副本 A 登出后
	// 副本 B 必须立刻不认这张令牌。
	revocation := state.NewRevocationStore(state.RevocationDep{DB: db, Now: now})
	revocation.Start(context.Background())

	tokens, err := token.NewService(token.Dep{
		Secret:     secret,
		Env:        envName,
		TTL:        time.Duration(envInt("TMA_TOKEN_TTL", 900)) * time.Second,
		Now:        now,
		Revocation: revocation,
	})
	if err != nil {
		// Node 的 createTokenService 在这里 throw，进程直接退出。保持一致：
		// 令牌服务配错了还「降级运行」，表现就是所有登录 500，比启动失败更难查。
		revocation.Stop()
		return nil, err
	}

	members := member.NewMap(member.Dep{DB: db, Gateway: gatewayAPI})
	creds := credential.New(credential.Dep{Gateway: gatewayAPI, Now: now})
	login := member.NewLoginService(member.LoginDep{
		BotToken: botToken,
		Tokens:   tokens,
		Members:  members,
		AllowLogin: token.NewLimiter(
			envInt("TMA_LOGIN_MAX", 10), time.Minute, now,
		),
		AllowReplay: state.NewReplayCounter(state.ReplayDep{
			DB:  db,
			Max: envInt("TMA_REPLAY_MAX", 5),
			TTL: time.Hour,
			Now: now,
		}).Allow,
		Now: now,
	})

	return &authBundle{
		tokens:     tokens,
		login:      login,
		creds:      creds,
		idem:       state.NewIdempotencyStore(state.IdempotencyDep{DB: db, Now: now}),
		revocation: revocation,
	}, nil
}

func (b *authBundle) stop() {
	if b != nil && b.revocation != nil {
		b.revocation.Stop()
	}
}

// httpAuth 把 bundle 摊成 httpapi.Auth；bundle 为 nil 时返回 nil。
func (b *authBundle) httpAuth() *httpapi.Auth {
	if b == nil {
		return nil
	}
	return &httpapi.Auth{Login: b.login, Tokens: b.tokens, Credentials: b.creds.Provide}
}

// buildBridge 构造登录桥。配置不齐时 New 自己会把它标成 notConfigured，
// 两个端点统一 503 —— 进程不因此退出，其它路由不受影响。
func buildBridge(bundle *authBundle, botToken string, hops int, now func() time.Time) (*bridge.Route, error) {
	forceSecure := os.Getenv("TMA_BRIDGE_FORCE_SECURE") != "false"
	if !forceSecure && os.Getenv("TMA_ENV") == "prod" {
		// n-5 守卫：生产环境显式关掉强制 Secure 必须留痕，不能静默降级。
		writeLog(os.Stderr, "bridge_insecure_cookie_warning", map[string]any{
			"detail": "TMA_BRIDGE_FORCE_SECURE=false 且 TMA_ENV=prod，Set-Cookie 将按请求协议判定，代理配置错误时凭证可能无 Secure 下发",
		})
	}
	dep := bridge.Dep{
		BotToken:     botToken,
		CookieDomain: os.Getenv("TMA_BRIDGE_COOKIE_DOMAIN"),
		MaxAge:       envInt("TMA_BRIDGE_COOKIE_MAX_AGE", 86400),
		ForceSecure:  forceSecure,
		// ForceSecure 关掉时（仅本地 http 调试）才用到：与限流分桶共用同一套
		// TRUST_PROXY_HOPS 语义，否则 TLS 在 Traefik 终止的链路上永远看不到 https，
		// 24 小时凭证会不带 Secure 下发。
		IsSecure:      httpapi.SecureRequest(hops),
		DefaultTarget: os.Getenv("TMA_BRIDGE_TARGET_DEFAULT"),
		Now:           now,
	}
	if bundle != nil {
		dep.LoginService = bundle.login
		dep.CredentialProvider = bundle.creds.Provide
	}
	route, err := bridge.New(dep)
	if err != nil {
		// 目前唯一会报错的是 Cookie Domain 格式非法 —— 浏览器会静默丢弃整条
		// Set-Cookie，表现是「点了没反应」，必须启动期就拦下。
		return nil, fmt.Errorf("登录桥配置非法: %w", err)
	}
	return route, nil
}

// buildAddrShare 只在 TMA 登录模块装配成功时构造（Node 的 `if (auth)` 守卫）。
// 没有令牌服务就无法区分「谁在分享」，公开链接会变成任意内容的投放点。
func buildAddrShare(bundle *authBundle, db *sql.DB, botToken string, hops int, now func() time.Time) (*addrshare.Router, error) {
	if bundle == nil {
		return nil, nil
	}
	return addrshare.New(addrshare.Dep{
		DB:       db,
		Tokens:   bundle.tokens,
		BotToken: botToken,
		// 创建要写库、还会生成一条对外可访问的链接，配额比读取紧得多。
		AllowCreate:    token.NewLimiter(envInt("TMA_SHARE_MAX", 10), time.Minute, now),
		AllowRead:      token.NewLimiter(envInt("TMA_SHARE_READ_MAX", 60), time.Minute, now),
		TrustProxyHops: hops,
		Now:            now,
	})
}

// buildFBProxy 只在 FB_UPSTREAM_URL 配置时构造（Node 的 `if (fbUpstream)` 守卫）。
func buildFBProxy(bundle *authBundle, now func() time.Time) (*fbproxy.Proxy, error) {
	upstream := os.Getenv("FB_UPSTREAM_URL")
	if upstream == "" {
		return nil, nil
	}
	verifier := (*token.Service)(nil)
	var idem state.IdemStore
	if bundle != nil {
		verifier = bundle.tokens
		idem = bundle.idem
	} else {
		// Node 在这一支注入 `{ verify: () => ({ valid: false }) }`。
		// Go 侧的等价物是「用一次性随机密钥构造的令牌服务」：没有副本持有该密钥，
		// 任何外部令牌都验不过，会员级接口稳定 401，匿名只读接口照常工作。
		random, err := throwawaySecret()
		if err != nil {
			return nil, err
		}
		verifier, err = token.NewService(token.Dep{Secret: random, Env: "no-auth", Now: now})
		if err != nil {
			return nil, err
		}
	}
	return fbproxy.New(fbproxy.Dep{
		UpstreamBase:       upstream,
		Tokens:             verifier,
		CredentialProvider: credentialProviderOf(bundle),
		IdempotencyStore:   idem,
		Allow:              token.NewLimiter(envInt("FB_RATE_MAX", 120), time.Minute, now),
		// 写接口（下单/取消/地址增删改）单独、更紧的配额，避免刷单骚扰商家。
		AllowWrite: token.NewLimiter(envInt("FB_WRITE_RATE_MAX", 20), time.Minute, now),
		Now:        now,
	})
}

func credentialProviderOf(bundle *authBundle) func(ctx context.Context, memberID int64) (string, error) {
	if bundle == nil {
		return nil
	}
	return bundle.creds.Provide
}

// buildRider 构造骑手绑定/工作台处理器（T6，server.js 2g 的等价装配）。
//
// 四组配置按 Node 的取法各自独立降级：
//   - gateway：`FBS_GATEWAY_URL && FBS_GATEWAY_SECRET ? {...} : null`，缺一即 null；
//   - 白名单：CORS_ORIGINS 每项取 host（解析失败的项丢弃），与对外 CORS 同一份清单；
//   - 限频：`createLimiter({ max: TMA_RIDER_MAX || 10, windowSeconds: 60 })`，按客户端 IP 分桶；
//   - DB：没有连接池时传 nil。这**不**等于 Node 的「未配置」——cliConn() 在缺库时
//     照样返回一个 query 对象（migrate.js:37-52），失败发生在 spawn；nil 只让查询
//     报错，端点照 Node 给 200（GET）/ 502（session 查询失败），不是 503。
//
// 与 Node 一样，缺配置**不**阻断启动：rider.New 只把端点标成 notConfigured，
// 由各端点自己返回 503，这样 /health 仍能探活。
func buildRider(db *sql.DB, botToken string, hops int, now func() time.Time) *rider.Route {
	dep := rider.Dep{
		BotToken:     botToken,
		DB:           db,
		AllowedHosts: rider.AllowedHostsFromOrigins(splitOrigins(os.Getenv("CORS_ORIGINS"))),
		// 限流分桶键必须与 httpapi 的 clientKey 同源（TRUST_PROXY_HOPS），否则同一客户端
		// 在「按 XFF 分桶」和「按 RemoteAddr 分桶」之间来回跳，额度形同双份。
		TrustProxyHops: hops,
		// 10 次/分钟与本项目其它写接口同一量级：绑定是低频动作，正常用户不会触发；
		// 而 PHP 侧另有 tg/phone/ip 三维度底账，这一层只挡「同一来源的快速重放」。
		Allow: token.NewLimiter(envInt("TMA_RIDER_MAX", 10), time.Minute, now),
	}
	gatewayURL := os.Getenv("FBS_GATEWAY_URL")
	secret := os.Getenv("FBS_GATEWAY_SECRET")
	if gatewayURL != "" && secret != "" {
		dep.Gateway = gatewayAdapter{cfg: gateway.Config{BaseURL: gatewayURL, Secret: secret, Now: now}}
	}
	return rider.New(dep)
}

// buildMerchant 构造商家免密入口处理器（方案 A，与 buildRider 并列同语义装配）。
//
// 与骑手的装配差异（都有意为之，不许"顺手对齐"）：
//   - **无 DB 参数**：映射查询全在 PHP（fbs_merchant_map 读、fbs_member_map 绝不写），
//     Go 侧直查会绕过 waimai_shop_manager 鉴权；
//   - **无白名单**：302 目标是站内路径 /wmsj/，过 merchant.SafeRedirect 校验，
//     不需要 CORS_ORIGINS 推导的域名白名单；
//   - 限频：`TMA_MERCHANT_MAX || 10` 次/分钟（Node 的 createLimiter 同值）。
//
// 缺配置不阻断启动：merchant.New 只把端点标成 notConfigured，由各端点自己 503。
func buildMerchant(botToken string, hops int, now func() time.Time) *merchant.Route {
	dep := merchant.Dep{
		BotToken: botToken,
		// 限流分桶键必须与 httpapi 的 clientKey 同源（TRUST_PROXY_HOPS），理由同 buildRider。
		TrustProxyHops: hops,
		Allow:          token.NewLimiter(envInt("TMA_MERCHANT_MAX", 10), time.Minute, now),
	}
	gatewayURL := os.Getenv("FBS_GATEWAY_URL")
	secret := os.Getenv("FBS_GATEWAY_SECRET")
	if gatewayURL != "" && secret != "" {
		dep.Gateway = gatewayAdapter{cfg: gateway.Config{BaseURL: gatewayURL, Secret: secret, Now: now}}
	}
	return merchant.New(dep)
}

// buildDispatch 构造派单 Telegram 通知处理器（T7，server.js 2h 的等价装配）。
//
// 三组配置按 Node 的取法各自独立降级：
//   - secret / botToken：与 Node 同源（FBS_GATEWAY_SECRET、TELEGRAM_BOT_TOKEN，
//     后者沿用 main 的 DEMO 兜底——Node 也是 `process.env.TELEGRAM_BOT_TOKEN || DEMO_BOT_TOKEN`）；
//   - gateway：`FBS_GATEWAY_URL && FBS_GATEWAY_SECRET ? {...} : null`，缺一即 null
//     （降级为无按钮纯文本）；
//   - DB：没有连接池时传 nil。这**不**等于「未配置」——Node 的 cliConn() 恒返回一个
//     query 对象（migrate.js:37-52），缺库只在查询时失败，端点照给 202。
//
// 与 Node 一样，缺配置不阻断启动：dispatch.New 只把端点标成 notConfigured，
// 由 /tg-api/internal/dispatch 自己返回 503，/health 仍能探活。
func buildDispatch(db *sql.DB, botToken string, now func() time.Time) *dispatch.Route {
	secret := os.Getenv("FBS_GATEWAY_SECRET")
	dep := dispatch.Dep{
		Secret:   secret,
		BotToken: botToken,
		DB:       db,
		Now:      now,
	}
	if gatewayURL := os.Getenv("FBS_GATEWAY_URL"); gatewayURL != "" && secret != "" {
		dep.Gateway = gatewayAdapter{cfg: gateway.Config{BaseURL: gatewayURL, Secret: secret, Now: now}}
	}
	return dispatch.New(dep)
}

// splitOrigins 复刻 server.js 对 CORS_ORIGINS 的处理：
// split(',') → map(s => s.trim()) → filter(Boolean)，即按逗号拆分、去首尾空白、丢掉空项。
//
// 注意：注释里若写连续两个单引号，gofmt 会把它改写成弯引号（go/printer 的
// 老式文档注释约定），所以上面对 JS 的描述用文字而不是原样代码。
// buildAjax 注册火鸟 ajax.php 兼容层的全部 service。
//
// 需要数据库的 service 在这里接上业务连接池；DB_HOST 未配置时 db 为 nil，
// 相关 action 按「查不到数据」降级，与本地纯内存模式的其它路由同口径。
// 表前缀沿用 PHP 侧的同名环境变量（entrypoint-web.sh: `${DB_PREFIX:-huoniao_}`）。
func buildAjax(db *sql.DB) *ajax.Router {
	router := ajax.NewRouter(func(line string) {
		writeLog(os.Stderr, "ajax_error", map[string]any{"error": line})
	})
	siteconfig.Register(router)
	prefix := envOr("DB_PREFIX", "huoniao_")
	var files *fburl.Resolver
	if db != nil {
		// 构造失败（前缀非法）交给 article.New 统一报错。
		files, _ = fburl.New(db, prefix, fburl.DefaultConfig())
	}
	// Identity：按 cookie `<COOKIE_PREFIX>login_user` 识别会员；构造失败（如 DB 未配置）
	// 降级为 nil（匿名 -1），不阻止启动。
	identity := buildIdentity(db, osGetenv, func(event string, fields map[string]any) {
		writeLog(os.Stderr, event, fields)
	})
	articleDepCfg := article.Dep{DB: db, TablePrefix: prefix, Files: files}
	if identity != nil { // 保持无类型 nil：nil 时 selfmediaDetail 一律按匿名
		articleDepCfg.Members = identity
	}
	articleSvc, err := article.New(articleDepCfg)
	if err != nil {
		// 前缀含非法字符是配置错误：启动期直接失败，不带病上线。
		panic(fmt.Sprintf("ajax: article 服务装配失败: %v", err))
	}
	article.Register(router, articleSvc)
	memberSvc, err := ajaxmember.New(ajaxmember.Dep{DB: db, TablePrefix: envOr("DB_PREFIX", "huoniao_"), Identity: identity})
	if err != nil {
		panic(fmt.Sprintf("ajax: member 服务装配失败: %v", err))
	}
	ajaxmember.Register(router, memberSvc)
	return router
}

func splitOrigins(raw string) []string {
	parts := strings.Split(raw, ",")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		if trimmed := strings.TrimSpace(part); trimmed != "" {
			out = append(out, trimmed)
		}
	}
	return out
}

// errCheckoutNoDB 表示「没有数据库连接池」——这是文档化的支持模式（本地只跑内存接口），
// 调用方据此降级成「不注册收银台」，而不是拒绝启动。
var errCheckoutNoDB = errors.New("收银台需要数据库连接池")

// checkoutDep 把收银台的装配收成一个可测的纯函数：任一项缺就返回错误。
//
// 为什么必须启动期就失败，而不是等第一个请求暴露：收银台的汇率源是可注入依赖，
// 漏接不会编译失败、也不会让任何一个包的测试变红 —— 它只表现为「生产环境每笔新订单
// 第一次请求 503 RATE_UNAVAILABLE」（老订单走幂等复用、不经过取价，所以更难发现）。
// 这类「静默降级成 503」的错，启动期拦一次比线上查一周便宜。
//
// Node 侧 server.js:288-295 把 getRate 与 coinsClient 两条都传进 createCheckoutRouter，
// 再由 checkoutRoute.js:54 的 `getRate: getRate || coinsRateSource(deps.coinsClient)` 决定
// 优先级；那里的 coinsClient 永远非空，所以等价于「只用 coinsClient 构造的汇率源」。
// Go 也只保留这一条路径：早期版本曾同时保留可注入的 GetRate，两条并存会让「到底哪条生效」
// 有歧义（GetRate 优先、coinsClient 静默失效，而签名的零值恰好长得像合法注入），已移除。
func checkoutDep(db *sql.DB, coinsClient *coins.Client, botToken string, now func() time.Time) (checkout.RouteDep, error) {
	if db == nil {
		return checkout.RouteDep{}, errCheckoutNoDB
	}
	if coinsClient == nil {
		return checkout.RouteDep{}, errors.New("收银台装配缺 coins 客户端：汇率源无法构造")
	}
	if botToken == "" {
		return checkout.RouteDep{}, errors.New("收银台装配缺 bot token：initData 无法验签")
	}
	if now == nil {
		now = time.Now
	}
	return checkout.RouteDep{
		Env:      os.Getenv,
		DB:       db,
		BotToken: botToken,
		Now:      now,
		GetRate:  checkout.CoinsRateSource(coinsClient, now),
	}, nil
}

// buildCheckout 返回收银台 handler；没有数据库时返回 (nil, nil) 表示「不注册」，
// 其它装配错误一律向上抛（由 main exit 1）。
func buildCheckout(db *sql.DB, coinsClient *coins.Client, botToken string, now func() time.Time) (http.HandlerFunc, error) {
	dep, err := checkoutDep(db, coinsClient, botToken, now)
	if errors.Is(err, errCheckoutNoDB) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return checkout.NewRoute(dep), nil
}

// validateAssembly 逐项检查「装配完整性」：每个可注入依赖都必须真的接上。
//
// 这是 B1 的直接回归护栏。那类漏洞不是逻辑写错，而是「少填一个字段」——
// 编译器、vet、任何单包测试都不会报（依赖在包里是可选注入，nil 会静默降级），
// 只有装配层的断言能拦住。新增可注入依赖时，把它的名字加进 missing 列表。
//
// 唯一随配置降级的是收银台（见下面 dep.DB 那条）：它没有「配错了」和「没配」之外的
// 第三种状态，而「没配数据库」是文档化的支持模式。其余依赖一律硬性必填 ——
// 宁可进程起不来，也不要带着静默降级对外服务。
func validateAssembly(bundle *authBundle, dep httpapi.Dep) error {
	missing := make([]string, 0, 8)
	if dep.Now == nil {
		missing = append(missing, "Now")
	}
	if dep.BotToken == "" {
		missing = append(missing, "BotToken")
	}
	if dep.Payments == nil {
		missing = append(missing, "Payments")
	}
	if dep.Coins == nil {
		missing = append(missing, "Coins")
	}
	// 收银台是唯一「存在性随配置走」的模块。
	//
	// Node 侧 /checkout 与 /payment/* 是无条件挂载的，但它们每条路径都要连库；
	// Go 侧没有连接池时挂上去也只会 500，所以选择「不注册」（对外 404）。
	// 因此这里跟随 dep.DB：有库就必须接上 handler（漏接 = B1 那类静默 503），
	// 无库则允许为 nil —— 无库启动与 Node 对齐：接口存在性随配置降级，不阻断进程。
	if dep.DB != nil && dep.Checkout == nil {
		missing = append(missing, "Checkout")
	}
	// 骑手 session 不依赖登录编排（只依赖 botToken / 网关 / 库），所以它在
	// 「无 auth 的降级装配」下也必须是接上的：漏接的表现是路由静默 404，
	// 正是 validateAssembly 要拦的那类「少填一个字段」。
	if dep.Rider == nil {
		missing = append(missing, "Rider")
	}
	// 派单通知同理：它只依赖 botToken / 网关 / 库，在「无 auth 的降级装配」下也必须接上。
	// 漏接的表现是 PHP 挂点收到 404（而不是 503），PHP 侧只看到「通知失败」。
	if dep.Dispatch == nil {
		missing = append(missing, "Dispatch")
	}
	// 兼容层漏接的表现是所有已切到 Go 的 action 静默 404。
	if dep.Ajax == nil {
		missing = append(missing, "Ajax")
	}
	// 商家入口同理：只依赖 botToken / 网关（无 DB / 无白名单），漏接的表现是
	// 三条 /tg-api/merchant/* 路由静默 404。
	if dep.Merchant == nil {
		missing = append(missing, "Merchant")
	}
	if bundle != nil {
		// auth 装配成功时，登录编排 / 令牌 / 凭证三者缺一都会让相关端点静默 503 或恒 401。
		if bundle.login == nil {
			missing = append(missing, "auth.loginService")
		}
		if bundle.tokens == nil {
			missing = append(missing, "auth.tokens(addrshare 也用这个)")
		}
		if bundle.creds == nil {
			missing = append(missing, "auth.credentialProvider")
		}
		if dep.Auth == nil {
			missing = append(missing, "Auth")
		} else {
			if dep.Auth.Login == nil {
				missing = append(missing, "Auth.Login")
			}
			if dep.Auth.Tokens == nil {
				missing = append(missing, "Auth.Tokens")
			}
			if dep.Auth.Credentials == nil {
				missing = append(missing, "Auth.Credentials")
			}
		}
		// fb 代理的凭证源来自同一个 provider：漏接会让会员级接口稳定 401。
		if credentialProviderOf(bundle) == nil {
			missing = append(missing, "fbproxy.credentialProvider")
		}
		if dep.Addr == nil {
			missing = append(missing, "Addr(addrshare)")
		}
	}
	if len(missing) > 0 {
		return fmt.Errorf("装配不完整，缺 %s", strings.Join(missing, " / "))
	}
	return nil
}

// gatewayAdapter 把网关包的包级函数收成一个对象，同时满足
// member.MemberGateway / credential.Gateway / tglogin.Gateway / rider.Gateway /
// dispatch.Gateway / merchant.Gateway 各最小接口。
type gatewayAdapter struct{ cfg gateway.Config }

func (g gatewayAdapter) MemberFindOrCreate(ctx context.Context, params map[string]any) (map[string]any, error) {
	return gateway.MemberFindOrCreate(ctx, g.cfg, params)
}

func (g gatewayAdapter) IssueSession(ctx context.Context, params map[string]any) (map[string]any, error) {
	return gateway.IssueSession(ctx, g.cfg, params)
}

// RiderQL 是骑手工作台直达 URL 的动作（rider.Route 的 Gateway 接口）。
func (g gatewayAdapter) RiderQL(ctx context.Context, params map[string]any) (map[string]any, error) {
	return gateway.RiderQL(ctx, g.cfg, params)
}

// RiderBind 是骑手绑定动作（rider.Route 的 Gateway 接口）。
func (g gatewayAdapter) RiderBind(ctx context.Context, params map[string]any) (map[string]any, error) {
	return gateway.RiderBind(ctx, g.cfg, params)
}

// RiderNotifyURL 是派单通知里「查看订单」按钮用的一次性订单直达 URL
// （dispatch.Gateway 接口，动作名与 PHP 端白名单一致）。
func (g gatewayAdapter) RiderNotifyURL(ctx context.Context, params map[string]any) (map[string]any, error) {
	return gateway.Call(ctx, g.cfg, "rider_notify_url", params)
}

// MerchantBind 是商家绑定动作（merchant.Route 的 Gateway 接口）。
func (g gatewayAdapter) MerchantBind(ctx context.Context, params map[string]any) (map[string]any, error) {
	return gateway.MerchantBind(ctx, g.cfg, params)
}

// MerchantSession 是商家换会话动作（merchant.Route 与 tglogin.Gateway 共用）。
func (g gatewayAdapter) MerchantSession(ctx context.Context, params map[string]any) (map[string]any, error) {
	return gateway.MerchantSession(ctx, g.cfg, params)
}

// —— 数据库 ——

// dsnFor 拼 DSN。
//
// 两个连接刻意分开：
//   - 业务池 multiStatements=false —— 多语句开关会把注入面从「单条语句」扩大到
//     「任意语句串」，业务代码不需要它，就不该给它；
//   - 迁移连接 multiStatements=true —— 迁移是仓库自带的可信 SQL，允许一次执行多语句，
//     这样含 DELIMITER/存储过程的迁移文件不会卡在驱动层。
//
// parseTime=false 与 Node 一致：时间列一律当字符串读，由业务层用 SqlTime/DBISO 转换，
// 打开自动解析会让「DATETIME 没有时区」这件事悄悄被本地时区污染。
func dsnFor(multiStatements bool) string {
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=false&loc=UTC&interpolateParams=false",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		envOr("DB_HOST", "127.0.0.1"),
		envOr("DB_PORT", "3306"),
		os.Getenv("DB_NAME"),
	)
	if multiStatements {
		dsn += "&multiStatements=true"
	}
	return dsn
}

func openPool(dsn string) (*sql.DB, error) {
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, err
	}
	db.SetMaxOpenConns(envInt("DB_MAX_OPEN", poolMaxOpen))
	db.SetMaxIdleConns(poolMaxIdle)
	db.SetConnMaxLifetime(poolConnMaxLifetime)
	return db, nil
}

// runMigrations 在一条独立连接上跑迁移，跑完立刻关掉 —— multiStatements=true
// 的连接不该混进业务池被后续请求复用。
func runMigrations() error {
	dir := envOr("MIGRATIONS_DIR", migrate.DefaultDir)
	if info, err := os.Stat(dir); err != nil || !info.IsDir() {
		// 目录缺失不是瞬态故障：重试三次再退出只是把「配置写错」拖成 15 秒的
		// 无声等待，最终报的还是一句 no such file or directory。直接失败。
		return fmt.Errorf("迁移目录不可用（MIGRATIONS_DIR=%s）: %v", dir, err)
	}

	var lastErr error
	for attempt := 1; attempt <= migrationAttempts; attempt++ {
		migrationDB, err := openPool(dsnFor(true))
		if err != nil {
			return fmt.Errorf("打开迁移连接失败: %w", err)
		}
		migrationDB.SetMaxOpenConns(1)
		migrationDB.SetMaxIdleConns(0)

		ctx, cancel := context.WithTimeout(context.Background(), migrationTimeout)
		applied, runErr := migrate.Run(ctx, migrationDB, dir)
		cancel()
		_ = migrationDB.Close()

		if runErr == nil {
			writeLog(os.Stdout, "db_migrated", map[string]any{"applied": applied, "count": len(applied)})
			return nil
		}
		lastErr = runErr
		writeLog(os.Stderr, "db_migrate_failed", map[string]any{
			"attempt": attempt,
			"of":      migrationAttempts,
			"error":   runErr.Error(),
		})
		if attempt < migrationAttempts {
			time.Sleep(migrationRetryDelay)
		}
	}
	return fmt.Errorf("迁移失败（已尝试 %d 次）: %w", migrationAttempts, lastErr)
}

// —— 杂项 ——

func envOr(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return fallback
}

// envInt 复刻 Node 的 `Number(process.env.X) || fallback`：非数字一律回落默认值。
func envInt(key string, fallback int) int {
	raw := strings.TrimSpace(os.Getenv(key))
	if raw == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(raw)
	if err != nil {
		return fallback
	}
	return parsed
}

// throwawaySecret 生成 32 字节随机密钥（hex 长度 64，远超 token 包 16 字符下限）。
func throwawaySecret() (string, error) {
	buf := make([]byte, 32)
	if _, err := rand.Read(buf); err != nil {
		return "", fmt.Errorf("生成一次性密钥失败: %w", err)
	}
	return hex.EncodeToString(buf), nil
}

// writeLog 只写一行结构化 JSON 到 stdout/stderr。
// 调用方只允许传事件名与状态类字段 —— 令牌、Cookie、initData、地址内容一律不进日志。
func writeLog(w io.Writer, event string, fields map[string]any) {
	payload := map[string]any{
		"ts":    time.Now().UTC().Format("2006-01-02T15:04:05.000Z"),
		"event": event,
		// 多副本排查时要能区分容器，否则两条日志拼不出一次请求的路径。
		"host": hostname(),
	}
	for key, value := range fields {
		payload[key] = value
	}
	line, err := json.Marshal(payload)
	if err != nil {
		return
	}
	_, _ = w.Write(append(line, '\n'))
}

func hostname() string {
	name, err := os.Hostname()
	if err != nil {
		return ""
	}
	return name
}
