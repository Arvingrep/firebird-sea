package main

import (
	"database/sql"
	"errors"
	"os"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax/article"
	ajaxmember "github.com/arvingrep/firebird-sea/services/api-go/internal/ajax/member"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/fbidentity"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/fburl"
)

// defaultRenrenCryptKey 是 PHP 侧硬编码的 RenrenCrypt 密钥，
// 来源 webroot/include/class/charset.class.php:560。
// 仓库里没有任何 env 注入它，这里回落到同一常量以与 PHP 行为一致；
// 如需轮换，设置 FB_RENREN_CRYPT_KEY 覆盖。
const defaultRenrenCryptKey = "KaCXPpoD1vyD[XUWwxhFhkXJulzS~u"

// resolveCryptKey 优先取 FB_RENREN_CRYPT_KEY，未设置（或全空白）回落到 PHP 常量。
func resolveCryptKey(getenv func(string) string) []byte {
	if v := strings.TrimSpace(getenv("FB_RENREN_CRYPT_KEY")); v != "" {
		return []byte(v)
	}
	return []byte(defaultRenrenCryptKey)
}

// buildIdentity 构造会员识别器。失败（ErrConfig，如 DB 未配置 / 前缀非法）时
// 记录日志并返回 nil，让 member.message 按匿名处理，不阻止服务启动。
//
// 注意必须返回「无类型 nil」接口：把 (*Resolver)(nil) 塞进接口会得到非 nil 接口，
// 调用 MemberID 时空指针 panic。
func buildIdentity(db *sql.DB, getenv func(string) string, logf func(event string, fields map[string]any)) ajaxmember.Identity {
	tablePrefix := strings.TrimSpace(getenv("DB_PREFIX"))
	if tablePrefix == "" {
		tablePrefix = "huoniao_"
	}
	cookiePrefix := strings.TrimSpace(getenv("COOKIE_PREFIX"))
	if cookiePrefix == "" {
		cookiePrefix = "HN_"
	}
	r, err := fbidentity.New(fbidentity.Dep{
		DB:           db,
		CryptKey:     resolveCryptKey(getenv),
		CookiePrefix: cookiePrefix,
		TablePrefix:  tablePrefix,
	})
	if err != nil {
		if logf != nil {
			logf("identity_disabled", map[string]any{"error": err.Error(), "errConfig": errors.Is(err, fbidentity.ErrConfig)})
		}
		return nil
	}
	return r
}

func osGetenv(k string) string { return os.Getenv(k) }

// articleDep 组装 article 服务依赖。identity 为 nil 接口时 Members 必须保持无类型 nil
// （selfmedia 据此按匿名处理）；
//
// customDataShare 对应 PHP config/article.inc.php 的 $customDataShare，由
// FB_ARTICLE_CUSTOM_DATA_SHARE 控制：未设置 / 非 "0" 取 1（canary 现状，不按城市过滤）；"0" 关闭共享。
func articleDep(db *sql.DB, prefix string, files *fburl.Resolver, identity ajaxmember.Identity, getenv func(string) string) article.Dep {
	dep := article.Dep{DB: db, TablePrefix: prefix, Files: files, CookiePrefix: strings.TrimSpace(getenv("COOKIE_PREFIX"))}
	if identity != nil {
		dep.Members = identity // Identity 与 article.MemberResolver 方法集相同
	}
	if strings.TrimSpace(getenv("FB_ARTICLE_CUSTOM_DATA_SHARE")) == "0" {
		off := false
		dep.CustomDataShare = &off
	}
	return dep
}
