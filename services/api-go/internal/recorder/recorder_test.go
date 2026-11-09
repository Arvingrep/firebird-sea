package recorder

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/compare"
)

const log = `1.2.3.4 - - [09/Nov/2026:10:00:00 +0800] "GET /include/ajax.php?service=article&action=alist&typeid=3&page=1 HTTP/1.1" 200 512 "-" "Mozilla" "-"
1.2.3.4 - - [09/Nov/2026:10:00:01 +0800] "GET /include/ajax.php?service=article&action=alist&page=1&typeid=3 HTTP/1.1" 200 512 "-" "Mozilla" "-"
1.2.3.4 - - [09/Nov/2026:10:00:02 +0800] "GET /include/ajax.php?service=article&action=alist&typeid=4&page=1&token=SECRET123&mobile=13800138000 HTTP/1.1" 200 5 "-" "-" "-"
2026-11-09T02:00:03Z stdout F 1.2.3.4 - - [09/Nov/2026:10:00:03 +0800] "GET /include/ajax.php?service=article&action=detail&id=9&email=a%40b.com&lat=14.599512&lng=120.984222&keyword=13900139000 HTTP/1.1" 200 5 "-" "-" "-"
1.2.3.4 - - [09/Nov/2026:10:00:04 +0800] "POST /include/ajax.php?service=member&action=collect&id=1 HTTP/1.1" 200 5 "-" "-" "-"
1.2.3.4 - - [09/Nov/2026:10:00:05 +0800] "GET /index.html HTTP/1.1" 200 5 "-" "-" "-"
1.2.3.4 - - [09/Nov/2026:10:00:06 +0800] "GET /include/ajax.php?service=siteConfig&action=ping HTTP/1.1" 200 5 "-" "-" "-"
garbage line
`

func TestRecord(t *testing.T) {
	files, err := Record(strings.NewReader(log), 20)
	if err != nil {
		t.Fatal(err)
	}
	if len(files) != 3 {
		t.Fatalf("应得到 article.alist / article.detail / siteConfig.ping 三个文件，实际 %d", len(files))
	}
	alist := files["article.alist"]
	if got := len(alist.Cases); got != 2 {
		t.Fatalf("alist 参数顺序不同视为同一组合应去重，得 2 条，实际 %d", got)
	}
	if alist.Cases[1].Params["typeid"] != "4" || alist.Cases[1].Params["token"] != "" || alist.Cases[1].Params["mobile"] != "" {
		t.Fatalf("敏感参数必须被去掉: %+v", alist.Cases[1].Params)
	}
	d := files["article.detail"].Cases[0].Params
	if len(d) != 1 || d["id"] != "9" {
		t.Fatalf("email/经纬度/形如手机号的值必须被去掉，只剩 id: %+v", d)
	}
	if _, ok := files["member.collect"]; ok {
		t.Fatal("POST 不录")
	}
	if len(files["siteConfig.ping"].Cases[0].Params) != 0 {
		t.Fatal("ping 无参数")
	}
}

func TestMaxPerAction(t *testing.T) {
	var b strings.Builder
	for i := 0; i < 50; i++ {
		b.WriteString(`1.1.1.1 - - [x] "GET /include/ajax.php?service=a&action=b&page=` + string(rune('A'+i%26)) + string(rune('a'+i/26)) + ` HTTP/1.1" 200 1 "-" "-"` + "\n")
	}
	files, _ := Record(strings.NewReader(b.String()), 20)
	if n := len(files["a.b"].Cases); n != 20 {
		t.Fatalf("每个 action 最多 20 条，实际 %d", n)
	}
}

func TestWriteReadableByCompare(t *testing.T) {
	files, _ := Record(strings.NewReader(log), 20)
	dir := t.TempDir()
	if err := Write(dir, files); err != nil {
		t.Fatal(err)
	}
	raw, err := os.ReadFile(filepath.Join(dir, "article.alist.recorded.json"))
	if err != nil {
		t.Fatal(err)
	}
	if _, err := compare.ParseCaseFile(raw); err != nil {
		t.Fatalf("compare 必须能读取: %v", err)
	}
	for _, bad := range []string{"SECRET123", "13800138000", "a%40b.com", "14.5995"} {
		for _, n := range []string{"article.alist", "article.detail"} {
			r, _ := os.ReadFile(filepath.Join(dir, n+".recorded.json"))
			if strings.Contains(string(r), bad) {
				t.Fatalf("%s 含个人信息 %s", n, bad)
			}
		}
	}
}
