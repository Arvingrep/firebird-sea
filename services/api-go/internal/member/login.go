package member

import (
	"context"
	"fmt"
	"os"
	"strconv"
	"sync"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/tgauth"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/token"
)

// defaultAuditEvery：限流事件的审计采样窗口。被限流的请求量可能很大，
// 逐条写库等于让攻击者用登录请求放大我们的写压力。
const defaultAuditEvery = 60 * time.Second

// LoginMembers 是登录编排用到的最小成员能力。
// 用接口而不是 *Map，是为了让登录流程可以脱离数据库单测（*Map 本身满足它）。
type LoginMembers interface {
	FindOrCreate(ctx context.Context, tgID int64) (int64, bool, error)
	Audit(ctx context.Context, tgID int64, action, target, detail string) error
}

// LoginDep 注入登录编排的依赖。
type LoginDep struct {
	BotToken    string
	Tokens      *token.Service
	Members     LoginMembers
	AllowLogin  func(key string) bool
	AllowReplay func(ctx context.Context, key string) (bool, error)
	Now         func() time.Time
	AuditEvery  time.Duration
}

// LoginService 编排 T2.1/T2.2/T2.3：验签 → 限频与防重放 → 映射 → 签发令牌 → 审计。
type LoginService struct {
	botToken    string
	tokens      *token.Service
	members     LoginMembers
	allowLogin  func(string) bool
	allowReplay func(context.Context, string) (bool, error)
	now         func() time.Time
	auditEvery  time.Duration

	mu        sync.Mutex
	lastAudit map[string]time.Time
}

func NewLoginService(d LoginDep) *LoginService {
	now := d.Now
	if now == nil {
		now = time.Now
	}
	every := d.AuditEvery
	if every <= 0 {
		every = defaultAuditEvery
	}
	allowLogin := d.AllowLogin
	if allowLogin == nil {
		allowLogin = func(string) bool { return true }
	}
	allowReplay := d.AllowReplay
	if allowReplay == nil {
		allowReplay = func(context.Context, string) (bool, error) { return true, nil }
	}
	return &LoginService{
		botToken:    d.BotToken,
		tokens:      d.Tokens,
		members:     d.Members,
		allowLogin:  allowLogin,
		allowReplay: allowReplay,
		now:         now,
		auditEvery:  every,
		lastAudit:   make(map[string]time.Time),
	}
}

// 响应体用结构体固定字段顺序与类型：success:false + error:{code,message} 是对象形，
// 与其它接口的 error:'字符串' 形态不同，前端按契约分别处理。

type errorDetail struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type errorBody struct {
	Success bool        `json:"success"`
	Error   errorDetail `json:"error"`
}

type loginData struct {
	Token     string `json:"token"`
	ExpiresAt int64  `json:"expiresAt"`
	MemberID  int64  `json:"memberId"`
}

type loginBody struct {
	Success bool      `json:"success"`
	Data    loginData `json:"data"`
}

// Login 返回 HTTP 状态码与响应体（由路由层直接序列化）。不为 400 做特判：
// initData 缺失/畸形统一按 401 处理，避免用状态码差异暴露校验细节。
func (s *LoginService) Login(ctx context.Context, initData string) (int, any) {
	verified := tgauth.Validate(initData, s.botToken, tgauth.Options{Now: s.now})
	if !verified.Valid {
		return 401, errorBody{Success: false, Error: errorDetail{Code: "INVALID_INIT_DATA", Message: verified.Error}}
	}

	tgID := verified.User.ID
	if !s.allowLogin("tg:" + formatID(tgID)) {
		s.auditLimited(ctx, tgID, "login_rate_limited")
		return 429, errorBody{Success: false, Error: errorDetail{Code: "RATE_LIMITED", Message: "Too many login attempts"}}
	}

	// 同一 initData 的换发次数受限（防囤积重放）：拦不住的话，攻击者拿到一次
	// initData 就能批量囤积长期可用的会话令牌。
	allowed, err := s.allowReplay(ctx, "h:"+verified.Hash)
	if err != nil {
		// 计数后端故障 ≠ 用太多次。Node 里 allowReplay 抛错会一路冒泡：
		// /auth/telegram 的 catch → 502 LOGIN_FAILED，bridge 的 catch → 502 BRIDGE_FAILED。
		// 之前这里和「超额」合并成 429 REPLAY_LIMITED，属于可观测偏差（客户端会当成自己的问题
		// 去重试/换 initData，而真实原因是我们自己的库挂了）。
		//
		// 仍然 fail-closed（不放行）：防重放失效时下发凭证正是要防的那件事。
		return s.failed("replay counter failed: " + err.Error())
	}
	if !allowed {
		s.auditLimited(ctx, tgID, "login_replay_limited")
		return 429, errorBody{Success: false, Error: errorDetail{Code: "REPLAY_LIMITED", Message: "initData reused too many times"}}
	}

	memberID, _, err := s.members.FindOrCreate(ctx, tgID)
	if err != nil {
		return s.failed("member lookup failed: " + err.Error())
	}
	issued := s.tokens.Issue(tgID, memberID)
	if err := s.members.Audit(ctx, tgID, "login", "member:"+formatID(memberID), ""); err != nil {
		return s.failed("audit failed: " + err.Error())
	}
	return 200, loginBody{
		Success: true,
		Data:    loginData{Token: issued.Token, ExpiresAt: issued.ExpiresAt, MemberID: memberID},
	}
}

// failed 统一内部错误响应：502 + LOGIN_FAILED，与 Node 路由的 catch 分支逐字一致。
// 日志只记错误消息，绝不记 initData——它是可复用的登录凭证。
func (s *LoginService) failed(reason string) (int, any) {
	logLoginFailure(reason)
	return 502, errorBody{Success: false, Error: errorDetail{Code: "LOGIN_FAILED", Message: "Login temporarily unavailable"}}
}

// auditLimited 对同 (tgId, action) 采样：窗口内只写一条，键表超过 5000 直接清空
// （被扫号时宁可丢采样精度，也不让内存无界增长）。
func (s *LoginService) auditLimited(ctx context.Context, tgID int64, action string) {
	key := formatID(tgID) + ":" + action
	now := s.now()
	s.mu.Lock()
	if last, ok := s.lastAudit[key]; ok && now.Sub(last) < s.auditEvery {
		s.mu.Unlock()
		return
	}
	s.lastAudit[key] = now
	if len(s.lastAudit) > 5000 {
		s.lastAudit = make(map[string]time.Time)
	}
	s.mu.Unlock()

	_ = s.members.Audit(ctx, tgID, action, "tg:"+formatID(tgID), "")
}

func formatID(id int64) string { return strconv.FormatInt(id, 10) }

// logLoginFailure 默认写 stderr，且截断长度：错误消息里可能夹带上游返回片段，
// 无界写入会污染日志采集。initData 永远不进这条日志。
var logLoginFailure = func(reason string) {
	message := []rune(reason)
	if len(message) > 300 {
		message = message[:300]
	}
	fmt.Fprintf(os.Stderr, "[auth/telegram] login failed: %s\n", string(message))
}
