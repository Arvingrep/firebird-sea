package fbidentity

import (
	"context"
	"encoding/base64"
	"net/http"
	"net/url"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
)

// 测试用假密钥，不是生产密钥。
var testKey = []byte("test-only-fake-renren-key")

const nonce = "0123456789abcdef0123456789abcdef" // 固定 32 位 md5 样式随机串，保证可重复

func memberCookieValue(plain string) string {
	return base64.StdEncoding.EncodeToString([]byte(renrenEncrypt(plain, nonce, testKey)))
}

func newResolver(t *testing.T) (*Resolver, sqlmock.Sqlmock) {
	t.Helper()
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	r, err := New(Dep{DB: db, CryptKey: testKey, CookiePrefix: "HN_", TablePrefix: "huoniao_"})
	if err != nil {
		t.Fatal(err)
	}
	return r, mock
}

func reqWithCookie(name, val string) *http.Request {
	req, _ := http.NewRequest("GET", "http://x/", nil)
	if name != "" {
		// 与 PHP setcookie 一致：值经过 urlencode。
		req.AddCookie(&http.Cookie{Name: name, Value: url.QueryEscape(val)})
	}
	return req
}

func TestCryptRoundTrip(t *testing.T) {
	enc := renrenEncrypt("12&abc", nonce, testKey)
	if got := renrenDecrypt(enc, testKey); got != "12&abc" {
		t.Fatalf("got %q", got)
	}
}

func TestMemberID_LoggedIn(t *testing.T) {
	r, mock := newResolver(t)
	mock.ExpectQuery("FROM `huoniao_member`").WithArgs(int64(88), "pwdhash").
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(88))
	got, err := r.MemberID(context.Background(), reqWithCookie("HN_login_user", memberCookieValue("88&pwdhash")))
	if err != nil || got != 88 {
		t.Fatalf("got %d err %v", got, err)
	}
}

func TestMemberID_PasswordTruncatedTo47(t *testing.T) {
	r, mock := newResolver(t)
	long := "0123456789012345678901234567890123456789012345678901234567890" // 61 位
	mock.ExpectQuery("FROM `huoniao_member`").WithArgs(int64(5), long[:47]).
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(5))
	got, _ := r.MemberID(context.Background(), reqWithCookie("HN_login_user", memberCookieValue("5&"+long)))
	if got != 5 {
		t.Fatalf("got %d", got)
	}
}

func TestMemberID_Anonymous(t *testing.T) {
	cases := map[string]*http.Request{
		"无 cookie":     reqWithCookie("", ""),
		"cookie 为空":    reqWithCookie("HN_login_user", ""),
		"篡改：乱码":        reqWithCookie("HN_login_user", "not-a-valid-cookie!!"),
		"篡改：缺少密码段":     reqWithCookie("HN_login_user", memberCookieValue("88")),
		"篡改：多余分段":      reqWithCookie("HN_login_user", memberCookieValue("88&a&b")),
		"篡改：ID 非数字":    reqWithCookie("HN_login_user", memberCookieValue("abc&pwd")),
		"别的前缀的 cookie": reqWithCookie("XX_login_user", memberCookieValue("88&pwd")),
	}
	for name, req := range cases {
		t.Run(name, func(t *testing.T) {
			r, mock := newResolver(t)
			got, err := r.MemberID(context.Background(), req)
			if err != nil || got != Anonymous {
				t.Fatalf("got %d err %v", got, err)
			}
			if err := mock.ExpectationsWereMet(); err != nil { // 不应查库
				t.Fatal(err)
			}
		})
	}
}

func TestMemberID_WrongKeyIsAnonymous(t *testing.T) {
	// 用另一把密钥加密 → 解出乱码 → 不会命中任何会员
	other := base64.StdEncoding.EncodeToString([]byte(renrenEncrypt("88&pwd", nonce, []byte("other-key"))))
	r, mock := newResolver(t)
	mock.ExpectQuery("FROM `huoniao_member`").WillReturnRows(sqlmock.NewRows([]string{"id"}))
	got, err := r.MemberID(context.Background(), reqWithCookie("HN_login_user", other))
	if err != nil || got != Anonymous {
		t.Fatalf("got %d err %v", got, err)
	}
}

// 密码已改 / 账号被禁用 / 会话过期：库里查不到 → 未登录。
func TestMemberID_NoRowMeansAnonymous(t *testing.T) {
	r, mock := newResolver(t)
	mock.ExpectQuery("FROM `huoniao_member`").WithArgs(int64(88), "oldhash").
		WillReturnRows(sqlmock.NewRows([]string{"id"}))
	got, err := r.MemberID(context.Background(), reqWithCookie("HN_login_user", memberCookieValue("88&oldhash")))
	if err != nil || got != Anonymous {
		t.Fatalf("got %d err %v", got, err)
	}
}

func TestMemberID_DBErrorIsNotAnonymous(t *testing.T) {
	r, mock := newResolver(t)
	mock.ExpectQuery("FROM `huoniao_member`").WillReturnError(context.DeadlineExceeded)
	_, err := r.MemberID(context.Background(), reqWithCookie("HN_login_user", memberCookieValue("88&p")))
	if err == nil {
		t.Fatal("DB 故障必须返回 error，不能当作未登录")
	}
}

func TestCourierID(t *testing.T) {
	r, mock := newResolver(t)
	mock.ExpectQuery("FROM `huoniao_waimai_courier`").WithArgs(int64(7)).
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(7))
	got, err := r.CourierID(context.Background(), reqWithCookie("HN_courier", "7"))
	if err != nil || got != 7 {
		t.Fatalf("got %d err %v", got, err)
	}
}

func TestCourierID_Anonymous(t *testing.T) {
	r, mock := newResolver(t)
	// 被停用：查不到
	mock.ExpectQuery("FROM `huoniao_waimai_courier`").WithArgs(int64(9)).
		WillReturnRows(sqlmock.NewRows([]string{"id"}))
	if got, _ := r.CourierID(context.Background(), reqWithCookie("HN_courier", "9")); got != Anonymous {
		t.Fatalf("disabled: got %d", got)
	}
	// 缺失 / 注入式取值：不查库
	for _, v := range []string{"", "0", "7 OR 1=1", "7;DROP", "-1", "abc"} {
		name := "HN_courier"
		if v == "" {
			name = ""
		}
		if got, err := r.CourierID(context.Background(), reqWithCookie(name, v)); err != nil || got != Anonymous {
			t.Fatalf("%q: got %d err %v", v, got, err)
		}
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatal(err)
	}
}

func TestNewRejectsBadConfig(t *testing.T) {
	db, _, _ := sqlmock.New()
	defer db.Close()
	for _, d := range []Dep{
		{DB: nil, CryptKey: testKey},
		{DB: db},
		{DB: db, CryptKey: testKey, TablePrefix: "a`b"},
		{DB: db, CryptKey: testKey, CookiePrefix: "a;b"},
	} {
		if _, err := New(d); err == nil {
			t.Fatalf("应拒绝 %+v", d)
		}
	}
}

// 向量由真实 PHP（renrencrypt.php 原样拷贝，密钥换成 testKey）生成：
// base64($c->php_encrypt("88&pwdhash"))。保证 Go 解出的内容与 PHP 一致。
func TestDecryptPHPVector(t *testing.T) {
	const phpCookie = "V1dnQ2FBTWlWM0ZTSXcxc1ZUNWFPQThwVWo0PQ=="
	r, mock := newResolver(t)
	mock.ExpectQuery("FROM `huoniao_member`").WithArgs(int64(88), "pwdhash").
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(88))
	got, err := r.MemberID(context.Background(), reqWithCookie("HN_login_user", phpCookie))
	if err != nil || got != 88 {
		t.Fatalf("got %d err %v", got, err)
	}
}
