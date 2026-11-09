package siteconfig

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

func TestPing(t *testing.T) {
	router := ajax.NewRouter(func(string) {})
	Register(router)
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/include/ajax.php?service=siteConfig&action=ping", nil))
	if recorder.Code != http.StatusOK {
		t.Fatalf("状态码 = %d，want 200", recorder.Code)
	}
	if body := recorder.Body.String(); body != `{"state":100,"info":"pong"}` {
		t.Fatalf("响应体 = %s", body)
	}
}
