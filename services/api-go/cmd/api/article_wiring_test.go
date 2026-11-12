package main

import (
	"crypto/md5"
	"encoding/base64"
	"encoding/hex"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
)

// encryptMemberCookie 按 RenrenCrypt 生成 HN_login_user 的值（与 fbidentity 测试里的 renrenEncrypt 同算法；
// 那个是包内私有，这里复制一份，只为让生产装配路径吃到真 cookie）。
func encryptMemberCookie(plain, key string) string {
	const nonce = "0123456789abcdef0123456789abcdef"
	var tmp []byte
	for i := 0; i < len(plain); i++ {
		n := nonce[i%len(nonce)]
		tmp = append(tmp, n, plain[i]^n)
	}
	sum := md5.Sum([]byte(key))
	ks := []byte(hex.EncodeToString(sum[:]))
	out := make([]byte, len(tmp))
	for i := range tmp {
		out[i] = tmp[i] ^ ks[i%len(ks)]
	}
	inner := base64.StdEncoding.EncodeToString(out)
	return url.QueryEscape(base64.StdEncoding.EncodeToString([]byte(inner)))
}

// 生产装配（buildAjax → buildIdentity → articleDep）下 selfmedia 能从 cookie 拿到会员：
// 匿名 0、已关注 1、本人 2、from="0" 回退 cookie。
func TestBuildAjaxSelfmediaUsesCookieIdentity(t *testing.T) {
	cookie := encryptMemberCookie("4&pwdhash", defaultRenrenCryptKey)
	for _, c := range []struct {
		name, query string
		cookie      bool
		uid         int64 // cookie 对应的会员 id（也即 member 表查询结果）
		follow      bool
		want        string
	}{
		{"匿名", "", false, 0, false, `"isfollow":0`},
		{"已关注", "", true, 4, true, `"isfollow":1`},
		{"本人", "", true, 3, false, `"isfollow":2`},
		{"from=0 回退 cookie", "&from=0", true, 4, true, `"isfollow":1`},
	} {
		t.Run(c.name, func(t *testing.T) {
			db, mock, err := sqlmock.New()
			if err != nil {
				t.Fatal(err)
			}
			defer db.Close()
			mock.MatchExpectationsInOrder(false)
			mock.ExpectQuery("SELECT COUNT\\(`id`\\) total FROM `huoniao_article_selfmedia`").
				WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow("1"))
			mock.ExpectQuery("FROM `huoniao_article_selfmedia` WHERE").
				WillReturnRows(sqlmock.NewRows([]string{"id", "userid", "type", "ac_name", "ac_profile", "ac_field", "ac_photo", "pubdate"}).
					AddRow("1", "3", "1", "n", "p", "0", "", "1"))
			mock.ExpectQuery("COUNT\\(`id`\\) c FROM `huoniao_articlelist_all`").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("6"))
			mock.ExpectQuery("SUM\\(`click`\\) c FROM `huoniao_articlelist_all`").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("50"))
			mock.ExpectQuery("COUNT\\(`id`\\) c FROM `huoniao_member_follow`").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow("2"))
			if c.cookie {
				mock.ExpectQuery("FROM `huoniao_member` WHERE").WithArgs(int64(4), "pwdhash").
					WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(c.uid))
			}
			if c.follow {
				mock.ExpectQuery("FROM `huoniao_member_follow` WHERE `tid`").WithArgs(int64(4), int64(3)).
					WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow("9"))
			}
			req := httptest.NewRequest(http.MethodGet, "/include/ajax.php?service=article&action=selfmedia"+c.query, nil)
			if c.cookie {
				req.AddCookie(&http.Cookie{Name: "HN_login_user", Value: cookie})
			}
			rec := httptest.NewRecorder()
			buildAjax(db).ServeHTTP(rec, req)
			if !strings.Contains(rec.Body.String(), c.want) {
				t.Fatalf("响应 = %s，want %s", rec.Body.String(), c.want)
			}
			if err := mock.ExpectationsWereMet(); err != nil {
				t.Fatalf("SQL 期望未满足: %v", err)
			}
		})
	}
}

func TestArticleDepWiring(t *testing.T) {
	db, _, _ := sqlmock.New()
	defer db.Close()
	if d := articleDep(db, "huoniao_", nil, nil, envMap(nil)); d.Members != nil || d.CustomDataShare != nil {
		t.Fatalf("无 identity 时 Members 必须是无类型 nil、默认共享开: %+v", d)
	}
	id := buildIdentity(db, envMap(nil), nil)
	if d := articleDep(db, "huoniao_", nil, id, envMap(nil)); d.Members == nil {
		t.Fatal("identity 未接入 article.Dep.Members")
	}
	d := articleDep(db, "huoniao_", nil, nil, envMap(map[string]string{"FB_ARTICLE_CUSTOM_DATA_SHARE": "0", "COOKIE_PREFIX": "XX_"}))
	if d.CustomDataShare == nil || *d.CustomDataShare || d.CookiePrefix != "XX_" {
		t.Fatalf("customDataShare=0 / 前缀未生效: %+v", d)
	}
}
