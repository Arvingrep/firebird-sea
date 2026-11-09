// Package fbidentity 识别火鸟会员 / 外卖骑手身份，行为等价于 PHP 的
// userLogin::getMemberID() 与 waimai.controller::checkCourierAccount()（只读，不续期 cookie）。
//
// 火鸟的会员 ID 不在 PHP session 里，而在 cookie `<前缀>login_user`：
// base64(RenrenCrypt("会员ID&密码哈希"))，再回 huoniao_member 校验 id + password + state=1。
// 任何一步不符一律视为未登录（返回 Anonymous），不报错、不泄漏原因。
//
// RenrenCrypt 密钥属于机密，只能从配置/Secret 注入。
package fbidentity

import (
	"context"
	"database/sql"
	"encoding/base64"
	"errors"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"strings"
)

// Anonymous 与 PHP 一致：未登录返回 -1。
const Anonymous int64 = -1

const (
	memberCookie  = "login_user"
	courierCookie = "courier"
	// PHP 取 substr(密码串, 0, 47)。
	passwordLen = 47
)

var (
	// 表前缀、cookie 前缀会拼进 SQL / cookie 名，必须限定字符集。
	identPattern = regexp.MustCompile(`^[A-Za-z0-9_]*$`)
	digitsOnly   = regexp.MustCompile(`^[0-9]{1,18}$`)
	leadingInt   = regexp.MustCompile(`^\s*[+-]?[0-9]+`)
)

// ErrConfig 表示注入的配置不合法。
var ErrConfig = errors.New("fbidentity: invalid config")

// Dep 注入识别器依赖。
type Dep struct {
	DB *sql.DB
	// CryptKey 是 RenrenCrypt 密钥（来自 Secret）。
	CryptKey []byte
	// CookiePrefix 对应 PHP 的 $cfg_cookiePre，火鸟默认 "HN_"。
	CookiePrefix string
	// TablePrefix 对应表前缀，火鸟默认 "huoniao_"。
	TablePrefix string
}

// Resolver 是只读的身份识别器，并发安全。
type Resolver struct {
	db           *sql.DB
	key          []byte
	cookiePrefix string
	memberTable  string
	courierTable string
}

func New(d Dep) (*Resolver, error) {
	if d.DB == nil || len(d.CryptKey) == 0 ||
		!identPattern.MatchString(d.CookiePrefix) || !identPattern.MatchString(d.TablePrefix) {
		return nil, ErrConfig
	}
	return &Resolver{
		db:           d.DB,
		key:          d.CryptKey,
		cookiePrefix: d.CookiePrefix,
		memberTable:  "`" + d.TablePrefix + "member`",
		courierTable: "`" + d.TablePrefix + "waimai_courier`",
	}, nil
}

// cookieValue 取 cookie 并按 PHP $_COOKIE 的习惯做 urldecode。
func (r *Resolver) cookieValue(req *http.Request, name string) string {
	c, err := req.Cookie(r.cookiePrefix + name)
	if err != nil {
		return ""
	}
	if v, err := url.QueryUnescape(c.Value); err == nil {
		return v
	}
	return c.Value
}

// MemberID 返回当前请求的火鸟会员 ID；未登录 / cookie 被篡改 / 密码已改 / 账号被禁用返回 Anonymous。
// 只有数据库故障才返回 error（调用方应按失败处理，不能当作未登录放行或拒绝）。
func (r *Resolver) MemberID(ctx context.Context, req *http.Request) (int64, error) {
	val := r.cookieValue(req, memberCookie)
	if val == "" {
		return Anonymous, nil
	}
	// cookie 外层还有一层 base64（见包注释），先解一层再交给 RenrenCrypt。
	outer, ok := phpBase64Decode(val)
	if !ok {
		return Anonymous, nil
	}
	plain := renrenDecrypt(string(outer), r.key)
	parts := strings.Split(plain, "&")
	if len(parts) != 2 {
		return Anonymous, nil
	}
	id, ok := phpIntval(parts[0])
	if !ok || id <= 0 {
		return Anonymous, nil
	}
	password := parts[1]
	if len(password) > passwordLen {
		password = password[:passwordLen]
	}
	var got int64
	err := r.db.QueryRowContext(ctx,
		"SELECT `id` FROM "+r.memberTable+" WHERE `id` = ? AND `password` = ? AND `state` = 1 LIMIT 1",
		id, password).Scan(&got)
	if errors.Is(err, sql.ErrNoRows) {
		return Anonymous, nil
	}
	if err != nil {
		return 0, err
	}
	return got, nil
}

// CourierID 返回当前请求的骑手 ID；cookie 缺失 / 非法 / 骑手不存在或被停用返回 Anonymous。
// 与 PHP 的差异：PHP 把 cookie 原样拼进 SQL（可注入），这里只接受纯数字并参数化查询。
func (r *Resolver) CourierID(ctx context.Context, req *http.Request) (int64, error) {
	val := r.cookieValue(req, courierCookie)
	if !digitsOnly.MatchString(val) {
		return Anonymous, nil
	}
	id, err := strconv.ParseInt(val, 10, 64)
	if err != nil || id <= 0 {
		return Anonymous, nil
	}
	var got int64
	err = r.db.QueryRowContext(ctx,
		"SELECT `id` FROM "+r.courierTable+" WHERE `id` = ? AND `status` = 1 LIMIT 1", id).Scan(&got)
	if errors.Is(err, sql.ErrNoRows) {
		return Anonymous, nil
	}
	if err != nil {
		return 0, err
	}
	return got, nil
}

// phpIntval 复刻 (int)"123abc" == 123：取开头的整数；没有前导数字则 ok=false。
func phpIntval(s string) (int64, bool) {
	m := leadingInt.FindString(s)
	if m == "" {
		return 0, false
	}
	n, err := strconv.ParseInt(strings.TrimSpace(m), 10, 64)
	if err != nil {
		return 0, false
	}
	return n, true
}

func encodeStd(b []byte) string { return base64.StdEncoding.EncodeToString(b) }
