package fburl

import (
	"context"
	"github.com/DATA-DOG/go-sqlmock"
	"testing"
)

func TestCityDomains(t *testing.T) {
	cases := []struct {
		sub, typ int
		want     string
	}{
		{1, 0, "https://news.city.example/"}, {1, 1, "https://news.sz.example/"}, {1, 2, "https://example/sz/news/"},
		{2, 0, "https://example/sz/news/"}, {2, 1, "https://example/sz/news/"}, {2, 2, "https://example/sz/news/"}, {0, 2, "https://example/sz/news/"},
	}
	for _, tt := range cases {
		r, m := resolver(t, DefaultConfig())
		domainRows(m)
		cityDomain := "sz"
		if tt.typ == 0 {
			cityDomain = "www.city.example"
		}
		got, e := r.Domain(context.Background(), "article", tt.sub, false, Options{Host: "example", City: City{Count: 2, Type: tt.typ, Domain: cityDomain, URL: "https://example/sz/"}})
		if e != nil || got != tt.want {
			t.Errorf("sub=%d type=%d %q %v want %q", tt.sub, tt.typ, got, e, tt.want)
		}
	}
}
func TestOptionsAndNegativeCache(t *testing.T) {
	r, m := resolver(t, DefaultConfig())
	domainRows(m)
	o := Options{Host: "x", City: City{Count: 2, Type: 2, Domain: "sz", URL: "https://x/sz"}}
	for _, tt := range []struct {
		without    bool
		host, want string
	}{{false, "x", "https://x/sz/news"}, {true, "x", "https://x/news"}, {false, "y", "https://y/sz/news"}} {
		o.WithoutCityDomain = tt.without
		o.Host = tt.host
		got, e := r.Domain(context.Background(), "article", 2, true, o)
		if e != nil || got != tt.want {
			t.Fatalf("%q %v", got, e)
		}
	}
	m.ExpectQuery("SELECT `domain`").WithArgs("missing").WillReturnRows(sqlmock.NewRows([]string{"domain"}))
	// PHP getDomain() caches a missing row as an empty domain and getDomainFullUrl keeps going:
	// "https://x" + "/" + "" and then the no-params trailing "/" (common.func.php:11833-11916).
	for i := 0; i < 2; i++ {
		got, e := r.Domain(context.Background(), "missing", 2, false, Options{Host: "x"})
		if e != nil || got != "https://x//" {
			t.Fatalf("%q %v", got, e)
		}
	}
}
