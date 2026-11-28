package travel

import (
	"context"
	"testing"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// cityID：无 cityid 参数、无 siteCityInfo cookie 时兜底站点默认分站
// （#374 compare 实证：PHP getCityId → checkDefaultCity → system_site_city.json
// cityid=10000 → 门店 cityid=0 不匹配 → AND 0=1 → 列表 101）。
func TestCityIDDefaultFallback(t *testing.T) {
	svc, _ := newService(t)
	svc.defaultCity = 10000
	if got := svc.cityID(context.Background(), &ajax.Request{}, ""); got != 10000 {
		t.Fatalf("cityID 无 cookie = %d, want 10000", got)
	}
	if got := svc.cityID(context.Background(), &ajax.Request{}, "3"); got != 3 {
		t.Fatalf("cityID param 优先 = %d, want 3", got)
	}
	svc2, _ := newService(t)
	if got := svc2.cityID(context.Background(), &ajax.Request{}, ""); got != 0 {
		t.Fatalf("cityID 未注入默认分站 = %d, want 0", got)
	}
}
