package fburl

import (
	"context"
	"errors"
	"github.com/DATA-DOG/go-sqlmock"
	"testing"
)

func resolver(t *testing.T, c Config) (*Resolver, sqlmock.Sqlmock) {
	t.Helper()
	db, m, e := sqlmock.New()
	if e != nil {
		t.Fatal(e)
	}
	t.Cleanup(func() {
		if e := m.ExpectationsWereMet(); e != nil {
			t.Error(e)
		}
		db.Close()
	})
	r, e := New(db, "huoniao_", c)
	if e != nil {
		t.Fatal(e)
	}
	return r, m
}
func domainRows(m sqlmock.Sqlmock) {
	m.ExpectQuery("SELECT count").WillReturnRows(sqlmock.NewRows([]string{"total"}).AddRow(28))
	m.ExpectQuery("SELECT `domain`").WithArgs("article").WillReturnRows(sqlmock.NewRows([]string{"domain"}).AddRow("news"))
}
func TestArticleGolden(t *testing.T) {
	r, m := resolver(t, DefaultConfig())
	domainRows(m)
	cases := []struct {
		p    Params
		want string
	}{
		{nil, ""},
		{Params{{"service", "custom"}, {"param", "/abc"}}, "/abc"},
		{Params{{"service", "article"}, {"template", "detail"}, {"id", "1"}, {"flag", "h"}, {"typeid", "1"}}, "https://fbird.men/news/detail-1.html"},
		{Params{{"service", "article"}, {"template", "detail"}, {"id", "1"}, {"flag", "t"}, {"redirecturl", "https://x.com/a"}}, `https://x.com/a" target="_blank`},
		{Params{{"service", "article"}, {"template", "detail"}, {"id", "0"}}, "https://fbird.men/news/detail-0.html"},
		{Params{{"service", "article"}, {"template", "detail"}, {"id", "abc"}}, "https://fbird.men/news/detail-abc.html"},
		{Params{{"service", "article"}, {"template", "list"}, {"typeid", "1"}, {"param", "page=2"}}, "https://fbird.men/news/list-1.html?page=2"},
		{Params{{"service", "article"}, {"template", "zt_detail"}, {"id", "1"}}, "https://fbird.men/news/zt_detail-1.html"},
		{Params{{"service", "article"}, {"template", "zt_list"}, {"param", "typeid=1&page=2"}}, "https://fbird.men/news/zt_list.html?typeid=1&page=2"},
		{Params{{"service", "article"}, {"template", "list"}, {"param", "keyword=测试"}}, "https://fbird.men/news/list.html?keyword=%E6%B5%8B%E8%AF%95"},
		{Params{{"service", "article"}, {"template", "mddetail"}, {"id", "1"}}, "https://fbird.men/news/mddetail-1.html"},
		{Params{{"service", "article"}, {"template", "index"}}, "https://fbird.men/news/index.html"},
	}
	for _, tt := range cases {
		t.Run(tt.want, func(t *testing.T) {
			got, e := r.URL(context.Background(), tt.p, Options{Host: "fbird.men:443"})
			if e != nil || got != tt.want {
				t.Fatalf("got %q, %v; want %q", got, e, tt.want)
			}
		})
	}
}
func TestDynamicAndFallback(t *testing.T) {
	c := DefaultConfig()
	c.Rewrite = false
	r, m := resolver(t, c)
	domainRows(m)
	for _, tt := range []struct {
		p    Params
		want string
	}{
		{Params{{"service", "article"}, {"template", "zt_detail"}, {"id", "7"}, {"param", "a=1&b=2"}}, "https://other.host/index.php?service=article&template=zt_detail&id=7&a=1&b=2"},
		{Params{{"service", "article"}, {"template", "detail"}, {"id", "7"}}, "https://other.host/news/detail-7.html"},
		{Params{{"service", "job"}, {"template", "detail"}, {"id", "7"}}, "https://other.host/index.php?service=job&template=detail&id=7"},
	} {
		got, e := r.URL(context.Background(), tt.p, Options{Host: "other.host"})
		if e != nil || got != tt.want {
			t.Fatalf("%q %v want %q", got, e, tt.want)
		}
	}
}
func TestUnsupportedApp(t *testing.T) {
	r, _ := resolver(t, DefaultConfig())
	_, e := r.URL(context.Background(), Params{{"service", "article"}}, Options{IsApp: true})
	if !errors.Is(e, ErrUnsupported) {
		t.Fatal(e)
	}
}
func TestArticleRules(t *testing.T) {
	for _, rule := range []int{1, 2} {
		t.Run(string(rune('0'+rule)), func(t *testing.T) {
			c := DefaultConfig()
			a := c.Modules["article"]
			a.ListRule = rule
			a.DetailRule = 1
			c.Modules["article"] = a
			r, m := resolver(t, c)
			domainRows(m)
			m.ExpectQuery("SELECT `pinyin`, `py`").WithArgs("1").WillReturnRows(sqlmock.NewRows([]string{"pinyin", "py"}).AddRow("bendixinwen", "bdxw"))
			folder := "bendixinwen"
			if rule == 2 {
				folder = "bdxw"
			}
			for _, tt := range []struct{ tpl, want string }{{"list", "https://x/news/" + folder + "/"}, {"detail", "https://x/news/" + folder + "/7.html"}} {
				got, e := r.URL(context.Background(), Params{{"service", "article"}, {"template", tt.tpl}, {"id", "7"}, {"typeid", "1"}}, Options{Host: "x"})
				if e != nil || got != tt.want {
					t.Fatalf("%q %v want %q", got, e, tt.want)
				}
			}
		})
	}
}
