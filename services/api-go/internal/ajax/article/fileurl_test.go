package article

import (
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
)

// TestFileURL 覆盖 canary 配置（ftpType=3 OBS、hideUrl=0）下 getFilePath 会走到的分支。
//
// 期望值不是「按源码推的」而已：canary php-fpm 容器里 require 了 include/common.inc.php
// 后直接跑 getFilePath()，下表每一行都对过真值（含 "/photo/..." 产生双斜杠、
// "/static/..." 文件不存在时返回空串这类反直觉行为）。
func TestFileURL(t *testing.T) {
	obs := "https://storage.googleapis.com/fbird-sea-uploads/"
	resize := "?x-image-process=image/resize,m_fill,w_4096,h_4096"

	cases := map[string]string{
		"空值直接返回空串":        "",
		"绝对地址加缩放参数":       "https://cdn.example.com/a.jpg" + resize,
		"协议相对补 https":     "https://" + "cdn.example.com/a.jpg" + resize,
		"已有查询串不重复加":       "https://cdn.example.com/a.jpg?w=1",
		"相对路径走 OBS":       obs + "photo/2020/a.jpg" + resize,
		"带 uploads 前缀要去掉": obs + "/photo/2020/a.jpg" + resize,
		"以斜杠开头不去重":        obs + "/photo/2020/a.jpg" + resize,
		"static 文件不存在返空":  "",
		"视频不加缩放参数":        obs + "photo/clip.mp4",
		"多图取第一张":          obs + "photo/a.jpg" + resize,
		"竖线占位符要清掉":        obs + "photo/a.jpg" + resize,
		"插件图不缩放":          obs + "plugins/x.jpg",
		"&type 改写成 ?type": obs + "photo/a.jpg?type=big",
	}
	// 输入 → 名称 一一对应；期望值见上面的 cases。
	inputs := map[string]string{
		"空值直接返回空串":        "",
		"绝对地址加缩放参数":       "https://cdn.example.com/a.jpg",
		"协议相对补 https":     "//cdn.example.com/a.jpg",
		"已有查询串不重复加":       "https://cdn.example.com/a.jpg?w=1",
		"相对路径走 OBS":       "photo/2020/a.jpg",
		"带 uploads 前缀要去掉": "/uploads/photo/2020/a.jpg",
		"以斜杠开头不去重":        "/photo/2020/a.jpg",
		"static 文件不存在返空":  "/static/img/logo.png",
		"视频不加缩放参数":        "photo/clip.mp4",
		"多图取第一张":          "photo/a.jpg,photo/b.jpg",
		"竖线占位符要清掉":        "photo/a.jpg||",
		"插件图不缩放":          "plugins/x.jpg",
		"&type 改写成 ?type": "photo/a.jpg&type=big",
	}
	if len(inputs) != len(cases) {
		t.Fatalf("用例表长度不一致：%d vs %d", len(inputs), len(cases))
	}

	svc := newTestService(t, nil)
	for name, in := range inputs {
		t.Run(name, func(t *testing.T) {
			if got := svc.fileURL(in); got != cases[name] {
				t.Fatalf("fileURL(%q)\n实际：%s\n期望：%s", in, got, cases[name])
			}
		})
	}
}

// 数字文件 ID / 非扩展名路径：查 #@__attachment 反查真实路径，查不到返回空串。
func TestFileURLAttachmentLookup(t *testing.T) {
	obs := "https://storage.googleapis.com/fbird-sea-uploads/"
	resize := "?x-image-process=image/resize,m_fill,w_4096,h_4096"
	selectByID := regexp.QuoteMeta("SELECT `path` FROM `huoniao_attachment` WHERE `id` = ? LIMIT 1")
	selectByPath := regexp.QuoteMeta("SELECT `path` FROM `huoniao_attachment` WHERE `path` = ? LIMIT 1")

	t.Run("数字 ID 命中", func(t *testing.T) {
		db, mock, err := sqlmock.New()
		if err != nil {
			t.Fatalf("sqlmock: %v", err)
		}
		defer func() { _ = db.Close() }()
		mock.ExpectQuery(selectByID).WithArgs("123").
			WillReturnRows(sqlmock.NewRows([]string{"path"}).AddRow("/uploads/photo/2020/x.png"))

		got := newTestService(t, db).fileURL("123")
		if want := obs + "/photo/2020/x.png" + resize; got != want {
			t.Fatalf("实际：%s\n期望：%s", got, want)
		}
	})

	t.Run("路径命中", func(t *testing.T) {
		db, mock, err := sqlmock.New()
		if err != nil {
			t.Fatalf("sqlmock: %v", err)
		}
		defer func() { _ = db.Close() }()
		mock.ExpectQuery(selectByPath).WithArgs("photo-nopath-key").
			WillReturnRows(sqlmock.NewRows([]string{"path"}).AddRow("/uploads/photo/2020/y.png"))

		got := newTestService(t, db).fileURL("photo-nopath-key")
		if want := obs + "/photo/2020/y.png" + resize; got != want {
			t.Fatalf("实际：%s\n期望：%s", got, want)
		}
	})

	t.Run("查不到返回空串", func(t *testing.T) {
		db, mock, err := sqlmock.New()
		if err != nil {
			t.Fatalf("sqlmock: %v", err)
		}
		defer func() { _ = db.Close() }()
		mock.ExpectQuery(selectByPath).WithArgs("nothing").
			WillReturnRows(sqlmock.NewRows([]string{"path"}))

		if got := newTestService(t, db).fileURL("nothing"); got != "" {
			t.Fatalf("期望空串，实际 %q", got)
		}
	})

	t.Run("没有连接池不查库", func(t *testing.T) {
		if got := newTestService(t, nil).fileURL("123"); got != "" {
			t.Fatalf("期望空串，实际 %q", got)
		}
	})
}

// 本地模式（ftpType=0、未开远程 FTP）：域名是站点域名 + uploadDir。
func TestFileURLLocalMode(t *testing.T) {
	dep := Dep{TablePrefix: "huoniao_", Site: DefaultSite()}
	dep.Site.FTPType = 0
	dep.Site.FTPState = 0
	svc, err := New(dep)
	if err != nil {
		t.Fatalf("New 失败：%v", err)
	}
	if got, want := svc.fileURL("/photo/a.jpg"), "https://fbird.men/uploads/photo/a.jpg"; got != want {
		t.Fatalf("实际：%s\n期望：%s", got, want)
	}
	// 本地模式不加远程缩放参数（PHP 只给 platform != 0 加）。
	if got, want := svc.fileURL("/uploads/photo/a.jpg"), "https://fbird.men/uploads/photo/a.jpg"; got != want {
		t.Fatalf("实际：%s\n期望：%s", got, want)
	}
}

func TestSiteFromEnv(t *testing.T) {
	defaults := DefaultSite()
	got := SiteFromEnv(func(string) string { return "" })
	if got != defaults {
		t.Fatalf("空环境应等于默认值：%+v vs %+v", got, defaults)
	}

	env := map[string]string{
		"SITE_HTTP_SECURE":      "0",
		"SITE_BASEHOST":         "example.com",
		"SITE_UPLOAD_DIR":       "/files",
		"SITE_FTP_TYPE":         "3",
		"SITE_FTP_STATE":        "0",
		"SITE_OBS_URL":          "https://obs.example.com/",
		"SITE_REMOTE_FTP_UNIFY": "0",
	}
	got = SiteFromEnv(func(k string) string { return env[k] })
	want := Site{
		SecureAccess:   "http://",
		BaseHost:       "example.com",
		UploadDir:      "/files",
		FTPType:        3,
		FTPState:       0,
		OBSUrl:         "https://obs.example.com/",
		RemoteFTPUnify: false,
	}
	if got != want {
		t.Fatalf("环境覆盖结果不符：%+v vs %+v", got, want)
	}

	// 非法数字保留默认值（配置写错不该把进程打死）。
	got = SiteFromEnv(func(k string) string {
		if k == "SITE_FTP_TYPE" {
			return "abc"
		}
		return ""
	})
	if got.FTPType != defaults.FTPType {
		t.Fatalf("非法 FTPType 应保留默认值，实际 %d", got.FTPType)
	}
}
