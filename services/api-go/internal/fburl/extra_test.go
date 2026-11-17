package fburl

import (
	"context"
	"errors"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
)

func TestJobTaskAndEncoding(t *testing.T) {
	c := DefaultConfig()
	c.Rewrite = false
	r, _ := resolver(t, c)
	ctx := context.Background()
	for _, tt := range []struct {
		p    Params
		want string
	}{
		// job folds every other param into one query line (always, even for Web).
		{Params{{"service", "job"}, {"template", "list"}}, "https://h/index.php?service=job&template=list&"},
		{Params{{"service", "job"}, {"template", "job"}, {"id", "3"}, {"param", "a=1"}}, "https://h/index.php?service=job&template=job&a=1&id=3"},
		// task always appends appFullScreen=1.
		{Params{{"service", "task"}, {"template", "index"}}, "https://h/index.php?service=task&template=index&appFullScreen=1"},
		// unknown service has no config file -> empty.
		{Params{{"service", "nope"}, {"template", "x"}}, ""},
		// "k=v=w" keeps only up to the second '='; a bare key becomes "k=".
		{Params{{"service", "task"}, {"param", "a=1=2&b"}}, "https://h/index.php?service=task&a=1&b=&appFullScreen=1"},
	} {
		got, err := r.URL(ctx, tt.p, Options{Host: "h"})
		if err != nil || got != tt.want {
			t.Errorf("%v: got %q, %v; want %q", tt.p, got, err, tt.want)
		}
	}
}

func TestUnsupportedBranches(t *testing.T) {
	r, _ := resolver(t, DefaultConfig())
	for _, tt := range []struct {
		p Params
		o Options
	}{
		{Params{{"service", "member"}, {"template", "index"}}, Options{}},
		{Params{{"service", "website"}, {"template", "preview1"}}, Options{}},
		{Params{{"service", "tieba"}, {"template", "detail"}}, Options{IsAndroidApp: true}},
		{Params{{"service", "job"}, {"template", "list"}}, Options{IsApp: true}},
	} {
		if _, err := r.URL(context.Background(), tt.p, tt.o); !errors.Is(err, ErrUnsupported) {
			t.Errorf("%v: %v", tt.p, err)
		}
	}
	// App flags do not affect services PHP does not special-case.
	if _, err := r.URL(context.Background(), Params{{"service", "nope"}}, Options{IsApp: true}); err != nil {
		t.Fatal(err)
	}
}

func TestRedirectAndEmptyRewrite(t *testing.T) {
	r, m := resolver(t, DefaultConfig())
	domainRows(m)
	ctx := context.Background()
	// flag t + redirecturl wins; flag t without redirecturl is a normal link.
	got, err := r.URL(ctx, Params{{"service", "article"}, {"template", "list"}, {"flag", "h,t"}, {"redirecturl", ""}}, Options{Host: "h"})
	if err != nil || got != "https://h/news/list.html" {
		t.Fatalf("%q %v", got, err)
	}
	// Nothing to put in the path: domain + "/" + after.
	got, err = r.URL(ctx, Params{{"service", "article"}, {"param", "a=1"}}, Options{Host: "h"})
	if err != nil || got != "https://h/news/?a=1" {
		t.Fatalf("%q %v", got, err)
	}
}

func TestSiteConfigProtocolTitle(t *testing.T) {
	r, m := resolver(t, DefaultConfig())
	m.ExpectQuery("SELECT `id` FROM `huoniao_site_singellist`").WithArgs("T").WillReturnRows(sqlmock.NewRows([]string{"id"}))
	m.ExpectQuery("SELECT `id` FROM `huoniao_site_singellist`").WithArgs("%T%").WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(9))
	got, err := r.URL(context.Background(), Params{{"service", "siteConfig"}, {"template", "protocol"}, {"title", "T"}}, Options{Host: "h"})
	if err != nil || got != "https://h/protocol-9.html" {
		t.Fatalf("%q %v", got, err)
	}
}

func TestResizeParams(t *testing.T) {
	for _, tt := range []struct {
		platform int
		file     string
		resize   bool
		want     string
	}{
		{1, "/a.jpg", true, "?x-oss-process=image/resize,m_fill,w_4096,h_4096"},
		{2, "/a.png", true, "?imageView2/2/interlace/1/q/90/w/4096/h/4096"},
		{4, "/a.gif", true, "?imageMogr2/gravity/center/crop/4096x4096/interlace/1"},
		{3, "/a.jpg", false, ""},
		{0, "/a.jpg", true, ""},
		{3, "/editor/a.jpg", true, ""},
		{3, "/a.jpg?x=1", true, ""},
		{3, "/a.mp4", true, ""},
	} {
		if got := resizeParam(tt.platform, tt.file, tt.resize); got != tt.want {
			t.Errorf("%+v got %q", tt, got)
		}
	}
}
