// Package tgauth 校验 Telegram Mini App 传入的 initData 签名（T2.1）。
//
// 设计取向与 Node 版逐条对应：
//   - 只认 HMAC hash。官方规范的 data_check_string 仅剔除 hash，signature（Ed25519）字段照常参与；
//     一旦把 signature 也剔除，真实客户端登录会全部失败。
//   - 不实现 Ed25519 路径，避免两套验签并存。
//   - 比较一律常量时间，避免通过响应时间侧信道逐字节猜签名。
package tgauth

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io"
	"math"
	"sort"
	"strconv"
	"strings"
	"time"
)

const (
	// DefaultMaxAgeSeconds：initData 默认有效期 1 小时，调用方可覆盖（测试用）。
	DefaultMaxAgeSeconds = 3600
	// maxClockSkewSeconds：允许客户端时钟超前服务端的上限，超过即视为伪造。
	maxClockSkewSeconds = 60
	// maxSafeInteger：等价 JS 的 Number.MAX_SAFE_INTEGER，user.id 必须落在该范围内。
	maxSafeInteger = 1<<53 - 1
)

// Options 是校验参数；零值即「1 小时有效 + 真实时钟」。
type Options struct {
	MaxAgeSeconds int
	Now           func() time.Time
}

// User 是 user 字段的解析结果。Raw 保留原始 JSON，供后续需要其它字段的调用方使用。
type User struct {
	ID  int64
	Raw json.RawMessage
}

// Result 的字段语义与 Node 版返回对象一一对应（valid/user/authDate/hash/error）。
type Result struct {
	Valid    bool
	User     *User
	AuthDate int64
	Hash     string
	Error    string
}

// Validate 校验 initData 的完整性与新鲜度。Error 为英文原文，供前端/日志直接透出。
func Validate(initData, botToken string, opt Options) Result {
	maxAge := opt.MaxAgeSeconds
	if maxAge <= 0 {
		maxAge = DefaultMaxAgeSeconds
	}
	now := time.Now
	if opt.Now != nil {
		now = opt.Now
	}
	nowSec := now().Unix()

	if initData == "" {
		return Result{Error: "Missing initData"}
	}
	if botToken == "" {
		return Result{Error: "Server auth not configured"}
	}

	params := parseQuery(initData)
	hash, ok := firstValue(params, "hash")
	if !ok || !isHex64(hash) {
		return Result{Error: "Missing or malformed hash parameter"}
	}

	// dataCheckString：除 hash 外的全部参数（含 signature）按 k=v 排序后用 \n 连接。
	// 重复 key 会各自保留一行——这与 URLSearchParams.entries() 的行为一致。
	pairs := make([]string, 0, len(params))
	for _, p := range params {
		if p.key == "hash" {
			continue
		}
		pairs = append(pairs, p.key+"="+p.value)
	}
	sort.Strings(pairs)
	dataCheckString := strings.Join(pairs, "\n")

	secretKey := hmacSHA256([]byte("WebAppData"), []byte(botToken))
	calculated := hmacSHA256(secretKey, []byte(dataCheckString))
	provided, err := hex.DecodeString(strings.ToLower(hash))
	if err != nil || len(provided) != len(calculated) || !hmac.Equal(provided, calculated) {
		return Result{Error: "Hash mismatch: Potential tampering detected"}
	}

	rawAuthDate, ok := firstValue(params, "auth_date")
	if !ok {
		return Result{Error: "Missing auth_date"}
	}
	authDate, ok := jsParseInt(rawAuthDate)
	if !ok || authDate <= 0 {
		return Result{Error: "Missing auth_date"}
	}
	if nowSec-authDate > int64(maxAge) {
		return Result{Error: "initData expired"}
	}
	if authDate-nowSec > maxClockSkewSeconds {
		return Result{Error: "initData auth_date is in the future"}
	}

	userRaw, hasUser := firstValue(params, "user")
	if hasUser && userRaw != "" {
		user, err := parseUser([]byte(userRaw))
		if err != nil {
			// JSON 语法错误 vs 结构不合法，文案必须区分：前者是客户端传了坏 JSON，
			// 后者是签名有效但内容缺失，两者排查方向不同。
			var malformed errMalformedUser
			if errors.As(err, &malformed) {
				return Result{Error: "Malformed user field"}
			}
			return Result{Error: "Missing user.id"}
		}
		return Result{Valid: true, User: user, AuthDate: authDate, Hash: strings.ToLower(hash)}
	}
	return Result{Error: "Missing user.id"}
}

type errMalformedUser struct{}

func (errMalformedUser) Error() string { return "malformed user field" }

// parseUser 解析 user JSON。语法错误返回 errMalformedUser；id 非正整数返回普通错误。
func parseUser(raw []byte) (*User, error) {
	dec := json.NewDecoder(bytes.NewReader(raw))
	dec.UseNumber() // 保留数字原文，才能区分 42 与 42.5（后者不是 safe integer）
	var probe any
	if err := dec.Decode(&probe); err != nil {
		return nil, errMalformedUser{}
	}
	if _, err := dec.Token(); !errors.Is(err, io.EOF) {
		// JSON.parse 遇到尾随内容会抛错，这里保持一致。
		return nil, errMalformedUser{}
	}

	obj, ok := probe.(map[string]any)
	if !ok {
		return nil, errors.New("user is not an object")
	}
	num, ok := obj["id"].(json.Number)
	if !ok {
		return nil, errors.New("user.id is not a number")
	}
	f, err := num.Float64()
	if err != nil || f != math.Trunc(f) || f > maxSafeInteger || f < -maxSafeInteger || f <= 0 {
		return nil, errors.New("user.id is not a safe positive integer")
	}
	return &User{ID: int64(f), Raw: append(json.RawMessage(nil), raw...)}, nil
}

func hmacSHA256(key, msg []byte) []byte {
	m := hmac.New(sha256.New, key)
	m.Write(msg)
	return m.Sum(nil)
}

func isHex64(s string) bool {
	if len(s) != 64 {
		return false
	}
	for i := 0; i < len(s); i++ {
		c := s[i]
		if (c < '0' || c > '9') && (c < 'a' || c > 'f') && (c < 'A' || c > 'F') {
			return false
		}
	}
	return true
}

// queryParam 保留插入顺序与重复项，模拟 URLSearchParams 的 entries()。
type queryParam struct{ key, value string }

func parseQuery(raw string) []queryParam {
	parts := strings.Split(raw, "&")
	out := make([]queryParam, 0, len(parts))
	for _, part := range parts {
		if part == "" {
			continue
		}
		key, value, found := strings.Cut(part, "=")
		if !found {
			value = ""
		}
		out = append(out, queryParam{key: decodeComponent(key), value: decodeComponent(value)})
	}
	return out
}

// firstValue 取同名参数的第一个值。
// 必须与 URLSearchParams.get 一致：Node 版 get(k) 返回首个匹配项；
// 若取末个值，攻击者只要追加一个重复的 auth_date / user 就能让两边判定方向相反。
func firstValue(params []queryParam, key string) (string, bool) {
	for _, p := range params {
		if p.key == key {
			return p.value, true
		}
	}
	return "", false
}

// decodeComponent 做 application/x-www-form-urlencoded 解码：'+' → 空格，%XX 逐字节解码。
// 非法百分号序列原样保留——URLSearchParams 也不报错，不能让畸形输入变成 500。
func decodeComponent(s string) string {
	if !strings.ContainsAny(s, "%+") {
		return s
	}
	var b strings.Builder
	b.Grow(len(s))
	for i := 0; i < len(s); i++ {
		switch {
		case s[i] == '+':
			b.WriteByte(' ')
		case s[i] == '%' && i+2 < len(s) && isHexDigit(s[i+1]) && isHexDigit(s[i+2]):
			v, err := strconv.ParseUint(s[i+1:i+3], 16, 8)
			if err != nil {
				b.WriteByte(s[i])
				continue
			}
			b.WriteByte(byte(v))
			i += 2
		default:
			b.WriteByte(s[i])
		}
	}
	return b.String()
}

func isHexDigit(c byte) bool {
	return (c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F')
}

// jsParseInt 复刻 parseInt(s, 10)：允许前导空白与正负号，遇到非数字即停止。
func jsParseInt(s string) (int64, bool) {
	s = strings.TrimLeft(s, " \t\n\r\v\f")
	if s == "" {
		return 0, false
	}
	sign := int64(1)
	i := 0
	if s[0] == '+' || s[0] == '-' {
		if s[0] == '-' {
			sign = -1
		}
		i++
	}
	start := i
	for i < len(s) && s[i] >= '0' && s[i] <= '9' {
		i++
	}
	if i == start {
		return 0, false
	}
	n, err := strconv.ParseInt(s[:i], 10, 64)
	if err != nil {
		return 0, false
	}
	return sign * n, true
}
