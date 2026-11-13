package siteconfig

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	sqlmock "github.com/DATA-DOG/go-sqlmock"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

const touchStaticVersion = "1794275238"

// ---- app_config 造数：PHP serialize（a:N:{...}） ----

func phpStr(v string) string { return fmt.Sprintf(`s:%d:"%s";`, len(v), v) }

// serArr 拼 PHP 关联数组；入参是「已序列化好的值」，键按传入顺序。
func serArr(keys []string, vals []string) string {
	var b strings.Builder
	fmt.Fprintf(&b, "a:%d:{", len(keys))
	for i, k := range keys {
		if n, ok := numKey(k); ok {
			fmt.Fprintf(&b, "i:%d;", n)
		} else {
			b.WriteString(phpStr(k))
		}
		b.WriteString(vals[i])
	}
	b.WriteString("}")
	return b.String()
}

func numKey(k string) (int, bool) {
	n := 0
	if k == "" {
		return 0, false
	}
	for _, c := range k {
		if c < '0' || c > '9' {
			return 0, false
		}
		n = n*10 + int(c-'0')
	}
	return n, true
}

// customItem 是一套完整字段的自定义菜单项（PHP 后台保存的形态）。
func customItem(name, url string) string {
	return serArr(
		[]string{"name", "icon", "icon_h", "url", "miniPath", "fabu", "message", "code"},
		[]string{phpStr(name), phpStr(""), phpStr(""), phpStr(url), phpStr(""), "i:0;", "i:0;", phpStr("")},
	)
}

// customMenu 把若干菜单项塞进模块下标（module -> list）。
func customMenu(module string, items ...string) string {
	listKeys := make([]string, 0, len(items))
	for i := range items {
		listKeys = append(listKeys, fmt.Sprint(i))
	}
	return serArr([]string{module}, []string{serArr(listKeys, items)})
}

// expectAppConfig 期望第 0 层的 app_config 查询；raw 为空表示该列是空串。
func expectAppConfig(mock sqlmock.Sqlmock, raw string) {
	rows := sqlmock.NewRows([]string{"customBottomButton"}).AddRow(raw)
	mock.ExpectQuery("SELECT * FROM `huoniao_app_config` LIMIT 1").WillReturnRows(rows)
}

// touch 发一次 touchHomePageFooter 请求。
func touch(t *testing.T, svc *Service, query string, opts ...reqOpt) result {
	t.Helper()
	router := ajax.NewRouter(func(string) {})
	Register(router, svc)
	req := httptest.NewRequest(http.MethodGet, "/include/ajax.php?service=siteConfig&action=touchHomePageFooter"+query, nil)
	for _, o := range opts {
		o(req)
	}
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)
	var r result
	if err := json.Unmarshal(rec.Body.Bytes(), &r); err != nil {
		t.Fatalf("响应不是 JSON: %s", rec.Body.String())
	}
	return r
}

// touchSvc 建一个注入了 StaticVersion 的服务（sqlmock 不校验期望顺序，member 域名查询可能多次）。
func touchSvc(t *testing.T) (*Service, sqlmock.Sqlmock) {
	t.Helper()
	db, mock, err := sqlmock.New(sqlmock.QueryMatcherOption(sqlmock.QueryMatcherFunc(func(expected, actual string) error {
		if strings.Contains(actual, expected) {
			return nil
		}
		return &mismatch{expected, actual}
	})))
	if err != nil {
		t.Fatalf("sqlmock: %v", err)
	}
	mock.MatchExpectationsInOrder(false)
	t.Cleanup(func() { _ = db.Close() })
	svc, err := New(Dep{DB: db, TablePrefix: "huoniao_", StaticVersion: touchStaticVersion,
		UserSubDomain: 2, BusiSubDomain: 2})
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	return svc, mock
}

// expectMemberDomain 期望 getDomain('member', part) 查 #@__domain。
func expectMemberDomain(mock sqlmock.Sqlmock) {
	rows := sqlmock.NewRows([]string{"domain"}).AddRow("")
	mock.ExpectQuery("SELECT `domain` FROM `huoniao_domain` WHERE `module` = 'member'").WillReturnRows(rows)
}

// keysOf 返回 info[i] 的键顺序（PHP 数组键序是对比工具逐字节比对的依据）。
func keysOf(t *testing.T, r result, idx int) []string {
	t.Helper()
	var items []json.RawMessage
	if err := json.Unmarshal(r.Info, &items); err != nil {
		t.Fatalf("info 不是数组: %v (%s)", err, r.Info)
	}
	if idx >= len(items) {
		t.Fatalf("info 只有 %d 项，取不到第 %d 项", len(items), idx)
	}
	return topKeys(items[idx])
}

// topKeys 扫一遍 JSON 对象，按出现顺序取顶层键（不依赖 map 的顺序）。
func topKeys(raw []byte) []string {
	var keys []string
	depth := 0
	for i := 0; i < len(raw); i++ {
		switch raw[i] {
		case '{', '[':
			depth++
		case '}', ']':
			depth--
		case '"':
			j := i + 1
			for j < len(raw) {
				if raw[j] == '\\' {
					j += 2
					continue
				}
				if raw[j] == '"' {
					break
				}
				j++
			}
			k := j + 1
			for k < len(raw) && (raw[k] == ' ' || raw[k] == '\t' || raw[k] == '\n') {
				k++
			}
			isKey := depth == 1 && k < len(raw) && raw[k] == ':'
			if isKey {
				keys = append(keys, string(raw[i+1:j]))
			}
			// 跳过这个字符串（值或键）。
			i = j
			if isKey {
				// 跳过冒号，让值从下一个字符开始被扫描（容器会被 depth 统计）。
				i = k
			}
		}
	}
	return keys
}

func wantKeys(t *testing.T, r result, idx int, want ...string) {
	t.Helper()
	got := keysOf(t, r, idx)
	if strings.Join(got, ",") != strings.Join(want, ",") {
		t.Fatalf("info[%d] 键序 = %v，want %v", idx, got, want)
	}
}

func wantState(t *testing.T, r result) {
	t.Helper()
	if r.State != 100 {
		t.Fatalf("state = %d (%s)，touchHomePageFooter 恒 100", r.State, r.Info)
	}
}

func wantItems(t *testing.T, r result, want ...string) {
	t.Helper()
	var list []map[string]any
	if err := json.Unmarshal(r.Info, &list); err != nil {
		t.Fatalf("info 不是数组: %s", r.Info)
	}
	var got []string
	for _, it := range list {
		got = append(got, fmt.Sprint(it["name"]))
	}
	if strings.Join(got, ",") != strings.Join(want, ",") {
		t.Fatalf("菜单 = %v，want %v", got, want)
	}
}

// ---- 旧版（version != '2.0'） ----

// 旧版固定 5 项：不看 module、不看 platform，图标无 /2.0/、无 ?v=，只有 4 个键。
func TestTouchOldVersionIgnoresModuleAndPlatform(t *testing.T) {
	svc, mock := touchSvc(t)
	expectAppConfig(mock, "")
	expectMemberDomain(mock)

	r := touch(t, svc, "&module=article&platform=android")
	wantState(t, r)
	wantItems(t, r, "首页", "同城圈", "发布", "逛附近", "我的")
	wantKeys(t, r, 0, "name", "icon", "icon_h", "url")

	var list []map[string]any
	if err := json.Unmarshal(r.Info, &list); err != nil {
		t.Fatal(err)
	}
	if got := list[0]["icon"]; got != "http://example.com/static/images/ficon1.png" {
		t.Fatalf("旧版图标 = %v，want 无 /2.0/、无 ?v=", got)
	}
	if got := list[0]["url"]; got != "http://example.com" {
		t.Fatalf("首页 url = %v，want $ios_index", got)
	}
	met(t, mock)
}

// version=3.0 与缺省同为旧版（严格等于 '2.0' 才走新版）。
func TestTouchVersionThreeIsOldMenu(t *testing.T) {
	svc, mock := touchSvc(t)
	expectAppConfig(mock, "")
	expectMemberDomain(mock)

	r := touch(t, svc, "&version=3.0&module=article")
	wantState(t, r)
	wantItems(t, r, "首页", "同城圈", "发布", "逛附近", "我的")
	met(t, mock)
}

// ---- 2.0 硬编码分支 ----

// 无自定义菜单 → 模块硬编码；键序 name, icon_h, icon, url, [miniPath], fabu, message, code。
func TestTouchHardcodeArticle(t *testing.T) {
	svc, mock := touchSvc(t)
	expectAppConfig(mock, "")
	expectMemberDomain(mock)

	r := touch(t, svc, "&version=2.0&module=article", withUA(desktopUA))
	wantState(t, r)
	wantItems(t, r, "资讯", "媒体号", "发布", "消息", "我的")
	wantKeys(t, r, 0, "name", "icon_h", "icon", "url", "miniPath", "fabu", "message", "code")

	var list []map[string]any
	if err := json.Unmarshal(r.Info, &list); err != nil {
		t.Fatal(err)
	}
	if got := list[0]["icon_h"]; got != "http://example.com/static/images/touchHomePageFooter/2.0/article/ficon1.png?v="+touchStaticVersion {
		t.Fatalf("icon_h = %v", got)
	}
	if got := list[0]["icon"]; got != "http://example.com/static/images/touchHomePageFooter/2.0/article/aficon1.png?v="+touchStaticVersion {
		t.Fatalf("icon = %v", got)
	}
	if _, ok := list[4]["miniPath"]; ok {
		t.Fatalf("「我的」不应有 miniPath")
	}
	if got := list[4]["code"]; got != "" {
		t.Fatalf("「我的」code = %v，want ''（PHP 3079 恒空）", got)
	}
	if _, ok := list[4]["miniPath"]; ok {
		t.Fatalf("article「我的」不应有 miniPath（PHP 3078 无该键）")
	}
	met(t, mock)
}

// 未知模块 → 兜底默认 5 项（不是空数组、不是 102）。
func TestTouchUnknownModuleFallsBackToDefaultMenu(t *testing.T) {
	svc, mock := touchSvc(t)
	expectAppConfig(mock, "")
	expectMemberDomain(mock)

	r := touch(t, svc, "&version=2.0&module=unknownmod")
	wantState(t, r)
	wantItems(t, r, "首页", "圈子", "发布", "消息", "我的")
	met(t, mock)
}

// cart 重写成 shop（2994），购物车项带 cartNum（匿名恒 0）。
func TestTouchCartRewritesToShop(t *testing.T) {
	svc, mock := touchSvc(t)
	expectAppConfig(mock, "")
	expectMemberDomain(mock)

	r := touch(t, svc, "&version=2.0&module=cart")
	wantState(t, r)
	wantItems(t, r, "商城", "分类", "购物车", "消息", "我的")
	wantKeys(t, r, 2, "name", "icon_h", "icon", "url", "miniPath", "fabu", "message", "code", "cartNum")

	var list []map[string]any
	if err := json.Unmarshal(r.Info, &list); err != nil {
		t.Fatal(err)
	}
	if got := list[2]["cartNum"]; got != float64(0) {
		t.Fatalf("cartNum = %v，want 0", got)
	}
	if _, ok := list[0]["cartNum"]; ok {
		t.Fatalf("非「购物车」项不应有 cartNum")
	}
	met(t, mock)
}

// paotui 在 2916 已重写成 waimai，3424 的 paotui 分支是死代码 → 返回外卖菜单。
func TestTouchPaotuiRewritesToWaimai(t *testing.T) {
	svc, mock := touchSvc(t)
	expectAppConfig(mock, "")
	expectMemberDomain(mock)

	r := touch(t, svc, "&version=2.0&module=paotui")
	wantState(t, r)
	wantItems(t, r, "外卖", "跑腿", "订单", "我的")
	met(t, mock)
}

// ---- 自定义菜单 ----

// 不带 platform：命中模块自定义菜单（键序含 miniPath、cartNum 每项都有，3031 在 if 外）。
func TestTouchCustomModuleMenu(t *testing.T) {
	svc, mock := touchSvc(t)
	cb := customMenu("article", customItem("自定义一", "/a"), customItem("自定义二", "/b"))
	expectAppConfig(mock, cb)

	r := touch(t, svc, "&version=2.0&module=article", withUA(desktopUA))
	wantState(t, r)
	wantItems(t, r, "自定义一", "自定义二")
	wantKeys(t, r, 0, "name", "icon", "icon_h", "url", "miniPath", "fabu", "message", "code", "cartNum")
	met(t, mock)
}

// 带 platform：第 1 层用终端下标整体覆盖模块字典 → 自定义菜单失效，落回硬编码（照搬现状）。
func TestTouchPlatformDisablesCustomMenu(t *testing.T) {
	svc, mock := touchSvc(t)
	cb := customMenu("article", customItem("自定义一", "/a"))
	expectAppConfig(mock, cb)
	expectMemberDomain(mock)

	r := touch(t, svc, "&version=2.0&module=article&platform=android", withUA(desktopUA))
	wantState(t, r)
	wantItems(t, r, "资讯", "媒体号", "发布", "消息", "我的")
	met(t, mock)
}

// default=1 跳过自定义菜单（`!$default` 条件）。
func TestTouchDefaultSkipsCustomMenu(t *testing.T) {
	svc, mock := touchSvc(t)
	cb := customMenu("siteConfig", customItem("自定义一", "/a"))
	expectAppConfig(mock, cb)
	expectMemberDomain(mock)

	r := touch(t, svc, "&version=2.0&default=1")
	wantState(t, r)
	wantItems(t, r, "首页", "圈子", "发布", "消息", "我的")
	met(t, mock)
}

// 平铺 100 项（count==100 && module==siteConfig && !default）：9 键恒存在、cartNum 恒 0。
func TestTouchFlatHundredItems(t *testing.T) {
	svc, mock := touchSvc(t)
	items := make([]string, 0, 100)
	for i := 0; i < 100; i++ {
		items = append(items, customItem(fmt.Sprintf("项%d", i), fmt.Sprintf("/p%d", i)))
	}
	listKeys := make([]string, 0, 100)
	for i := range items {
		listKeys = append(listKeys, fmt.Sprint(i))
	}
	expectAppConfig(mock, serArr(listKeys, items))

	r := touch(t, svc, "&version=2.0&module=siteConfig", withUA(desktopUA))
	wantState(t, r)
	wantKeys(t, r, 0, "name", "icon", "icon_h", "url", "miniPath", "fabu", "message", "code", "cartNum")

	var list []map[string]any
	if err := json.Unmarshal(r.Info, &list); err != nil {
		t.Fatal(err)
	}
	if len(list) != 100 {
		t.Fatalf("平铺项数 = %d，want 100", len(list))
	}
	if got := list[99]["name"]; got != "项99" {
		t.Fatalf("最后一项 = %v", got)
	}
	met(t, mock)
}

// app_config 查不到行时 $customBottomButton 未定义 → 按 falsy 处理，仍返回菜单。
func TestTouchNoAppConfigRow(t *testing.T) {
	svc, mock := touchSvc(t)
	mock.ExpectQuery("SELECT * FROM `huoniao_app_config` LIMIT 1").
		WillReturnRows(sqlmock.NewRows([]string{"customBottomButton"}))
	expectMemberDomain(mock)

	r := touch(t, svc, "&version=2.0&module=article", withUA(desktopUA))
	wantState(t, r)
	wantItems(t, r, "资讯", "媒体号", "发布", "消息", "我的")
	met(t, mock)
}

// 无 DB（兼容层未接库）时：仍是 100 + 旧版菜单，不是 102。
func TestTouchNilDB(t *testing.T) {
	svc, err := New(Dep{TablePrefix: "huoniao_"})
	if err != nil {
		t.Fatal(err)
	}
	r := touch(t, svc, "")
	wantState(t, r)
	wantItems(t, r, "首页", "同城圈", "发布", "逛附近", "我的")
}

// member 链接的 param 要按 PHP 口径补尾 `=`：`appIndex=1&appTitle` → `appIndex=1&appTitle=`。
func TestTouchMemberParamTrailingEqual(t *testing.T) {
	svc, mock := touchSvc(t)
	expectAppConfig(mock, "")
	expectMemberDomain(mock)

	r := touch(t, svc, "&version=2.0&module=article&platform=android", withUA(desktopUA))
	wantState(t, r)

	var list []map[string]any
	if err := json.Unmarshal(r.Info, &list); err != nil {
		t.Fatal(err)
	}
	if got := list[2]["url"]; got != "http://example.com/fabu-article.html?appIndex=1&appTitle=" {
		t.Fatalf("发布 url = %v", got)
	}
	if got := list[3]["url"]; got != "http://example.com/message.html?appIndex=1&appFullScreen=" {
		t.Fatalf("消息 url = %v", got)
	}
	met(t, mock)
}

// PHP 的 `$version == '2.0'` 是宽松比较：数字串按数值比，"2"、"2.00"、"2.0 " 都进新版。
func TestTouchVersionLooseEqual(t *testing.T) {
	for _, v := range []string{"2", "2.00", "2.0%20", "02"} {
		t.Run(v, func(t *testing.T) {
			svc, mock := touchSvc(t)
			expectAppConfig(mock, "")
			expectMemberDomain(mock)
			r := touch(t, svc, "&version="+v+"&module=task", withUA(desktopUA))
			wantState(t, r)
			wantItems(t, r, "首页", "推荐", "推广", "消息", "我的")
			met(t, mock)
		})
	}
	// 非数字串（"2.0.0"、"abc"）按字符串比 → 不等于 "2.0" → 旧版。
	for _, v := range []string{"2.0.0", "abc"} {
		t.Run("old-"+v, func(t *testing.T) {
			svc, mock := touchSvc(t)
			expectAppConfig(mock, "")
			expectMemberDomain(mock)
			r := touch(t, svc, "&version="+v+"&module=task", withUA(desktopUA))
			wantState(t, r)
			wantItems(t, r, "首页", "同城圈", "发布", "逛附近", "我的")
			met(t, mock)
		})
	}
}

// App UA 下 fburl 的 App 分支未迁：不能整页降级，member 链接仍要正常输出。
func TestTouchAppUAStillReturnsMenu(t *testing.T) {
	svc, mock := touchSvc(t)
	expectAppConfig(mock, "")
	expectMemberDomain(mock)

	r := touch(t, svc, "&version=2.0&module=article&platform=android", withUA(androidUA))
	wantState(t, r)
	wantItems(t, r, "资讯", "媒体号", "发布", "消息", "我的")
	met(t, mock)
}
