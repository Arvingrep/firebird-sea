package main

import (
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
)

func envMap(m map[string]string) func(string) string {
	return func(k string) string { return m[k] }
}

func TestResolveCryptKey(t *testing.T) {
	if got := string(resolveCryptKey(envMap(map[string]string{"FB_RENREN_CRYPT_KEY": " custom "}))); got != "custom" {
		t.Fatalf("env 有值应使用 env，got %q", got)
	}
	for _, v := range []string{"", "   "} {
		if got := string(resolveCryptKey(envMap(map[string]string{"FB_RENREN_CRYPT_KEY": v}))); got != defaultRenrenCryptKey {
			t.Fatalf("env=%q 应回落常量，got %q", v, got)
		}
	}
	if defaultRenrenCryptKey != "KaCXPpoD1vyD[XUWwxhFhkXJulzS~u" {
		t.Fatal("回落常量与 PHP charset.class.php:560 不一致")
	}
}

func TestBuildIdentityOK(t *testing.T) {
	db, _, err := sqlmock.New()
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	if id := buildIdentity(db, envMap(nil), nil); id == nil {
		t.Fatal("默认配置应成功构造 resolver")
	}
}

func TestBuildIdentityFailureDegradesToNil(t *testing.T) {
	var events []string
	logf := func(e string, _ map[string]any) { events = append(events, e) }
	// DB 为 nil → ErrConfig：返回无类型 nil、记录日志、不 panic。
	if id := buildIdentity(nil, envMap(nil), logf); id != nil {
		t.Fatalf("构造失败应降级为 nil 接口，got %#v", id)
	}
	// 非法前缀同样降级。
	db, _, _ := sqlmock.New()
	defer db.Close()
	if id := buildIdentity(db, envMap(map[string]string{"COOKIE_PREFIX": "bad-prefix!"}), logf); id != nil {
		t.Fatal("非法 COOKIE_PREFIX 应降级为 nil")
	}
	if len(events) != 2 {
		t.Fatalf("应各记录一条日志，got %v", events)
	}
}

// 构造失败后 buildAjax 仍能装配（db=nil 即触发降级），服务照常启动。
func TestBuildAjaxSurvivesIdentityFailure(t *testing.T) {
	if r := buildAjax(nil); r == nil {
		t.Fatal("buildAjax 不应因 identity 失败而返回 nil")
	}
}
