package fburl

import (
	"context"
	"crypto/md5"
	"encoding/base64"
	"fmt"
	"github.com/DATA-DOG/go-sqlmock"
	"testing"
)

func TestFileGolden(t *testing.T) {
	r, m := resolver(t, DefaultConfig())
	suffix := "?x-image-process=image/resize,m_fill,w_4096,h_4096"
	prefix := "https://storage.googleapis.com/fbird-sea-uploads/"
	cases := []struct{ in, want string }{
		{"", ""}, {"0", ""}, {"/photo/a.jpg", prefix + "/photo/a.jpg" + suffix}, {"/uploads/photo/a.jpg", prefix + "/photo/a.jpg" + suffix},
		{"/photo/a.jpg,/photo/b.jpg", prefix + "/photo/a.jpg" + suffix}, {"/photo/a.jpg&type=small", prefix + "/photo/a.jpg?type=small"},
		{"/photo/a.mp4", prefix + "/photo/a.mp4"}, {"plugins/x.jpg", prefix + "plugins/x.jpg"},
		{"http://cdn.x.com/a.jpg", "http://cdn.x.com/a.jpg" + suffix}, {"//cdn.x.com/a.jpg", "https://cdn.x.com/a.jpg" + suffix},
		{"/static/img/notexist.png", ""}, {"/photo/A.JPG", ""}, {"12345", ""},
	}
	for _, tt := range cases {
		t.Run(tt.in, func(t *testing.T) {
			if tt.in != "" && tt.in != "0" && tt.want == "" {
				m.ExpectQuery("SELECT `id`, `path`").WithArgs(tt.in).WillReturnRows(sqlmock.NewRows([]string{"id", "path"}))
			}
			got, e := r.File(context.Background(), tt.in, Options{Host: "x"})
			if e != nil || got != tt.want {
				t.Fatalf("%q %v want %q", got, e, tt.want)
			}
		})
	}
}
func TestAttachmentResizeAndLocalFiles(t *testing.T) {
	c := DefaultConfig()
	c.LocalFiles = map[string]bool{"/static/exists.png": true}
	r, m := resolver(t, c)
	m.ExpectQuery("SELECT `id`, `path`").WithArgs("7").WillReturnRows(sqlmock.NewRows([]string{"id", "path"}).AddRow(7, "/article/a.jpg"))
	for _, tt := range []struct {
		resize bool
		want   string
	}{{false, "https://storage.googleapis.com/fbird-sea-uploads//article/a.jpg"}, {true, "https://storage.googleapis.com/fbird-sea-uploads//article/a.jpg?x-image-process=image/resize,m_fill,w_4096,h_4096"}} {
		got, e := r.RealFile(context.Background(), "7", tt.resize, true, Options{Host: "x"})
		if e != nil || got != tt.want {
			t.Fatalf("%q %v", got, e)
		}
	}
	got, e := r.File(context.Background(), "/static/exists.png", Options{Host: "y"})
	if e != nil || got != "https://y/static/exists.png" {
		t.Fatalf("%q %v", got, e)
	}
}

// renrenEncrypt ports RenrenCrypt::php_encrypt with a fixed salt (test helper only).
func renrenEncrypt(txt, salt string) string {
	k := fmt.Sprintf("%x", md5.Sum([]byte(salt)))
	var tmp []byte
	for i := 0; i < len(txt); i++ {
		tmp = append(tmp, k[i%len(k)], txt[i]^k[i%len(k)])
	}
	return base64.StdEncoding.EncodeToString([]byte(renrenKey(string(tmp), renrenCryptKey)))
}

func TestEncryptedAttachmentID(t *testing.T) {
	r, m := resolver(t, DefaultConfig())
	// PHP: getFilePath receives base64(php_encrypt(id)); getRealFilePath base64-decodes once
	// and php_decrypt decodes a second time, then looks the numeric id up.
	enc := base64.StdEncoding.EncodeToString([]byte(renrenEncrypt("12345", "7")))
	if got := renrenDecrypt(phpBase64Decode(enc)); got != "12345" {
		t.Fatalf("decrypt %q", got)
	}
	m.ExpectQuery("SELECT `id`, `path`").WithArgs("12345").WillReturnRows(sqlmock.NewRows([]string{"id", "path"}).AddRow(12345, "/article/a.jpg"))
	got, e := r.File(context.Background(), enc, Options{Host: "x"})
	want := "https://storage.googleapis.com/fbird-sea-uploads//article/a.jpg?x-image-process=image/resize,m_fill,w_4096,h_4096"
	if e != nil || got != want {
		t.Fatalf("%q %v", got, e)
	}
	// Undecryptable garbage falls back to a path lookup by the original string.
	m.ExpectQuery("SELECT `id`, `path`").WithArgs("garbage").WillReturnRows(sqlmock.NewRows([]string{"id", "path"}))
	if got, e := r.File(context.Background(), "garbage", Options{Host: "x"}); e != nil || got != "" {
		t.Fatalf("%q %v", got, e)
	}
}
