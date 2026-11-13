package member

import (
	"context"
	"database/sql/driver"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/url"
	"strings"
	"testing"

	sqlmock "github.com/DATA-DOG/go-sqlmock"
)

// detailRows 构造一条 member 行：列顺序与 memberDetailCols 一致，未覆盖的列按 NULL。
func detailRows(over map[string]any) *sqlmock.Rows {
	idx := make(map[string]int, len(memberDetailCols))
	for i, c := range memberDetailCols {
		idx[c] = i
	}
	vals := make([]driver.Value, len(memberDetailCols))
	// member 表绝大多数列是 NOT NULL DEFAULT ''，PDO 一律返回字符串；这里按同一口径造数据。
	for i := range vals {
		vals[i] = ""
	}
	defaults := map[string]any{
		"id": "2", "mtype": "1", "level": "0", "certifyState": "0", "licenseState": "0",
		"promotion": "0", "regtime": "0", "expired": "0", "delivery_count": "0", "phoneBindTime": "0",
		"money": "0", "freeze": "0", "bonus": "0", "point": "0", "cityid": "0", "addr": "0",
		"online": "0", "sex": "0", "wechat_subscribe": "0", "is_editname": "0", "tempbg": "0",
		"pctempbg": "0", "zhaopin_company": "0", "zhaopin_resume": "0", "last_level": "0",
		"last_expired": "0",
	}
	for k, v := range defaults {
		vals[idx[k]] = v
	}
	for k, v := range over {
		i, ok := idx[k]
		if !ok {
			panic("未知列 " + k)
		}
		vals[i] = v
	}
	rows := sqlmock.NewRows(memberDetailCols)
	rows.AddRow(vals...)
	return rows
}

var personalMember = map[string]any{
	"id": "2", "password": "03ba5a23f2eaa07779c6b89f00ddc706d0c23fdce9c26de",
	"mtype": "1", "nickname": "TG_99990001", "sex": "1", "wechat_subscribe": "0",
	"online": "0", "cityid": "0", "addr": "0", "regtime": "1792667830",
	"zhaopin_company": "1", "zhaopin_resume": "1",
}

const detailSel = "SELECT `id`, `password`"

func expectMember(m sqlmock.Sqlmock, id int64, over map[string]any) {
	m.ExpectQuery(detailSel + "").WithArgs(id).WillReturnRows(detailRows(over))
}

// 匿名看个人会员：与 PHP 一致，只输出公开字段，keys 按字母序。
func TestDetailAnonymousPersonal(t *testing.T) {
	svc, m := newCommentService(t, nil, nil)
	expectMember(m, 2, personalMember)
	m.ExpectQuery("SELECT s.`id`, s.`auth`, l.`uid` FROM `huoniao_staff`").
		WithArgs(int64(2)).WillReturnRows(sqlmock.NewRows([]string{"id", "auth", "uid"}))
	m.ExpectQuery("SELECT `id` FROM `huoniao_dating_member`").
		WithArgs(int64(2)).WillReturnRows(sqlmock.NewRows([]string{"id"}))

	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=detail&id=2", "")
	eq(t, got, `{"state":100,"info":{`+
		`"addrName":"","addrid":"0","autharr":[],"birthday":"","bonus":0,"certifyState":0,`+
		`"cityid":"0","companyuid":0,"cookiePre":"HN_login_user","dating_uid":0,"description":"",`+
		`"freeze":0,"hidePackage":[],"iphome":"","is_staff":0,"level":0,"levelIcon":"",`+
		`"levelName":"普通会员","licenseState":"0","money":0,"nation":"","nickname":"TG_99990001",`+
		`"online":"0","photo":"http://example.com/include/attachment.php?f=/static/images/noPhoto_100.jpg",`+
		`"photoSource":"","point":0,"promotion":0,"sex":"1","staffid":0,"userType":1,"userid":"2",`+
		`"wechat_subscribe":"0","zhaopin_company":1,"zhaopin_resume":1}}`)
	met(t, m)
}

func TestDetailEmptyIs102(t *testing.T) {
	svc, m := newCommentService(t, nil, nil)
	m.ExpectQuery(detailSel).WithArgs(int64(99999999)).
		WillReturnRows(sqlmock.NewRows(memberDetailCols))
	out := callDetail(t, svc, "id=99999999")
	if out["state"] != float64(102) || out["info"] != "No data!" {
		t.Fatalf("%v", out)
	}
	met(t, m)
}

// friend 分支在主表查不到时仍执行：100 {"isfriend":0}。
func TestDetailEmptyButFriendStillRuns(t *testing.T) {
	svc, m := newCommentService(t, nil, nil)
	m.ExpectQuery(detailSel).WithArgs(int64(99999999)).
		WillReturnRows(sqlmock.NewRows(memberDetailCols))
	m.ExpectQuery("FROM `huoniao_member_friend`").WithArgs(-1, int64(99999999), int64(99999999), -1).
		WillReturnRows(sqlmock.NewRows([]string{"delfrom", "delto"}))
	out := callDetail(t, svc, "id=99999999&friend=1")
	if out["state"] != float64(100) {
		t.Fatalf("%v", out)
	}
	info := out["info"].(map[string]any)
	if len(info) != 1 || info["isfriend"] != float64(0) {
		t.Fatalf("%v", info)
	}
	met(t, m)
}

func TestDetailParamError(t *testing.T) {
	for _, q := range []string{"", "id=abc", "id=0", "id[]="} {
		svc, m := newCommentService(t, nil, nil)
		out := callDetail(t, svc, q)
		if out["state"] != float64(101) || out["info"] != "登录超时，请重新登录！" {
			t.Fatalf("%q: %v", q, out)
		}
		met(t, m)
	}
}

// 已登录但不传 id：用登录会员 id（这是「需登录」的实际含义：匿名 + 无 id 才报错）。
func TestDetailAnonymousNoIDIsLoginTimeout(t *testing.T) {
	svc, m := newCommentService(t, nil, nil)
	out := callDetail(t, svc, "")
	if out["state"] != float64(101) || out["info"] != "登录超时，请重新登录！" {
		t.Fatalf("%v", out)
	}
	met(t, m)
}

func TestDetailSimpleSkipsOptionalBlocks(t *testing.T) {
	svc, m := newCommentService(t, nil, nil)
	expectMember(m, 2, personalMember)
	// simple=1：不查 staff / dating / addrName，也没有 addrName 键。
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=detail&id=2&simple=1", "")
	for _, want := range []string{`"addrName"`, `"hidePackage"`} {
		if strings.Contains(got, want) {
			t.Fatalf("simple=1 不应出现 %s: %s", want, got)
		}
	}
	if !strings.Contains(got, `"userType":1`) {
		t.Fatalf("%s", got)
	}
	met(t, m)
}

func TestDetailLoggedIn(t *testing.T) {
	svc, m := newCommentService(t, fakeIdentity(2), nil)
	over := map[string]any{}
	for k, v := range personalMember {
		over[k] = v
	}
	over["phone"] = " 13800138000 "
	over["email"] = "abc@example.com"
	over["areaCode"] = ""
	expectMember(m, 2, over)
	m.ExpectQuery("SELECT count(log.`id`) totalCount FROM `huoniao_member_letter_log`").
		WithArgs(int64(2)).WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow(3))
	m.ExpectQuery("SELECT SUM(`amount`) bonusPrice FROM `huoniao_member_bonus`").
		WillReturnRows(sqlmock.NewRows([]string{"s"}).AddRow(nil))
	m.ExpectQuery("SELECT `pay_config` FROM `huoniao_site_payment`").
		WillReturnRows(sqlmock.NewRows([]string{"p"}).AddRow(`a:1:{i:0;a:2:{s:4:"name";s:5:"bonus";s:5:"value";s:2:"50";}}`))
	m.ExpectQuery("SELECT SUM(`amount`) amount FROM `huoniao_member_bonus`").
		WillReturnRows(sqlmock.NewRows([]string{"s"}).AddRow(nil))
	m.ExpectQuery("SELECT s.`id`, s.`auth`, l.`uid` FROM `huoniao_staff`").
		WithArgs(int64(2)).WillReturnRows(sqlmock.NewRows([]string{"id", "auth", "uid"}))
	m.ExpectQuery("SELECT COUNT(*) FROM `huoniao_member_security`").
		WithArgs(int64(2)).WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow(0))
	m.ExpectQuery("SELECT `id` FROM `huoniao_dating_member`").
		WithArgs(int64(2)).WillReturnRows(sqlmock.NewRows([]string{"id"}))

	out := callDetail(t, svc, "id=2")
	info := out["info"].(map[string]any)
	if info["pwd"] != float64(1) || info["message"] != float64(3) {
		t.Fatalf("%v", info)
	}
	if info["phone"] != "13800138000" || info["phoneEncrypt"] != "138****8000" || info["areaCode"] != "86" {
		t.Fatalf("phone: %v %v %v", info["phone"], info["phoneEncrypt"], info["areaCode"])
	}
	// 与 PHP 实测一致：$3 仍是完整域名（规则评论里「域名丢失」的说法不成立）。
	if info["emailEncrypt"] != "abc***@example.com" {
		t.Fatalf("emailEncrypt=%v", info["emailEncrypt"])
	}
	if info["security"] != float64(0) || info["question"] != float64(0) {
		t.Fatalf("security=%v question=%v", info["security"], info["question"])
	}
	if info["monBonus"] != float64(50) || info["usebonus"] != float64(0) || info["surplusbonus"] != float64(50) {
		t.Fatalf("bonus: %v %v %v", info["usebonus"], info["monBonus"], info["surplusbonus"])
	}
	// PHP: base64_encode(php_encrypt(...))，而 php_encrypt 自身已返回 base64 → 两层，
	// 解开两层后应还原 "<id>&<password>"（RenrenCrypt::php_decrypt 语义）。
	enc, ok := info["userid_encode"].(string)
	if !ok || enc == "" {
		t.Fatalf("userid_encode=%v", info["userid_encode"])
	}
	inner := phpBase64Decode(enc)
	if plain := renrenDecrypt(phpBase64Decode(string(inner)), svc.cryptKey); plain != "2&"+over["password"].(string) {
		t.Fatalf("userid_encode 解密后=%q", plain)
	}
	met(t, m)
}

func TestDetailLevelAndIPHome(t *testing.T) {
	svc, m := newCommentService(t, nil, nil)
	over := map[string]any{}
	for k, v := range personalMember {
		over[k] = v
	}
	over["level"] = "3"
	over["lastloginipaddr"] = "江苏省苏州市 电信"
	expectMember(m, 2, over)
	m.ExpectQuery("SELECT `name`, `icon`, `privilege` FROM `huoniao_member_level`").
		WithArgs(3).WillReturnRows(sqlmock.NewRows([]string{"name", "icon", "privilege"}).
		AddRow("黄金会员", "icon.png", `a:2:{i:0;s:5:"quan1";i:1;s:5:"quan2";}`))
	m.ExpectQuery("SELECT s.`id`, s.`auth`, l.`uid` FROM `huoniao_staff`").
		WillReturnRows(sqlmock.NewRows([]string{"id", "auth", "uid"}))
	m.ExpectQuery("SELECT `id` FROM `huoniao_dating_member`").
		WillReturnRows(sqlmock.NewRows([]string{"id"}))

	out := callDetail(t, svc, "id=2")
	info := out["info"].(map[string]any)
	if info["levelName"] != "黄金会员" || info["iphome"] != "江苏苏州" {
		t.Fatalf("%v %v", info["levelName"], info["iphome"])
	}
	if info["levelIcon"] != "http://example.com/include/attachment.php?f=icon.png" {
		t.Fatalf("levelIcon=%v", info["levelIcon"])
	}
	met(t, m)
}

func TestDetailAddrName(t *testing.T) {
	svc, m := newCommentService(t, nil, nil)
	over := map[string]any{}
	for k, v := range personalMember {
		over[k] = v
	}
	over["addr"] = "100"
	expectMember(m, 2, over)
	m.ExpectQuery("FROM `huoniao_site_area` WHERE `id` = ?").WithArgs(100).
		WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow("100", "10", "苏州市", "0"))
	m.ExpectQuery("FROM `huoniao_site_area` WHERE `id` = ?").WithArgs(10).
		WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow("10", "1", "江苏省", "0"))
	m.ExpectQuery("FROM `huoniao_site_area` WHERE `id` = ?").WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "parentid", "typename", "weight"}).AddRow("1", "0", "中国", "0"))
	m.ExpectQuery("SELECT s.`id`, s.`auth`, l.`uid` FROM `huoniao_staff`").
		WillReturnRows(sqlmock.NewRows([]string{"id", "auth", "uid"}))
	m.ExpectQuery("SELECT `id` FROM `huoniao_dating_member`").
		WillReturnRows(sqlmock.NewRows([]string{"id"}))

	out := callDetail(t, svc, "id=2")
	if out["info"].(map[string]any)["addrName"] != "中国 > 江苏省 > 苏州市" {
		t.Fatal(out["info"])
	}
	met(t, m)
}

func TestDetailBusinessAnonymous(t *testing.T) {
	svc, m := newCommentService(t, nil, nil)
	over := map[string]any{
		"id": "2", "mtype": "2", "nickname": "掌柜", "company": "川香阁", "address": nil,
		"license": "lic.jpg", "money": "1000.50", "point": "100", "lastloginipaddr": "",
		"sex": "1", "wechat_subscribe": "0", "online": "1794316704", "cityid": "10000", "addr": "0",
		"regtime": "0", "zhaopin_company": "1", "zhaopin_resume": "1",
	}
	expectMember(m, 2, over)
	// business_list(state != 4)
	m.ExpectQuery("FROM `huoniao_business_list` WHERE `uid` = ? AND `state` != 4").WithArgs(int64(2)).
		WillReturnRows(sqlmock.NewRows([]string{"id", "type", "expired", "state", "package", "hidePackage", "sortPackage", "diancan_state", "dingzuo_state", "paidui_state", "maidan_state"}).
			AddRow("1", "2", "0", "1", "", "", "", "0", "0", "0", "0"))
	m.ExpectQuery("SELECT `id` FROM `huoniao_dating_member`").
		WillReturnRows(sqlmock.NewRows([]string{"id"}))

	out := callDetail(t, svc, "id=2")
	info := out["info"].(map[string]any)
	// 未登录看商家：busiState 未设置 → userType 被覆盖为 1；hidePackage 不输出。
	if info["userType"] != float64(1) {
		t.Fatalf("userType=%v", info["userType"])
	}
	if _, ok := info["hidePackage"]; ok {
		t.Fatal("未登录不应输出 hidePackage")
	}
	if info["nickname"] != "川香阁" || info["person"] != "" || info["company"] != "川香阁" {
		t.Fatalf("%v %v %v", info["nickname"], info["person"], info["company"])
	}
	if info["money"] != 1000.5 || info["point"] != float64(100) {
		t.Fatalf("%v %v", info["money"], info["point"])
	}
	if info["busiId"] != "1" || info["busiType"] != "2" {
		t.Fatalf("%v %v", info["busiId"], info["busiType"])
	}
	if info["address"] != nil {
		t.Fatalf("address=%v", info["address"])
	}
	met(t, m)
}

func TestDetailFriendWhenMemberExists(t *testing.T) {
	svc, m := newCommentService(t, fakeIdentity(5), nil)
	expectMember(m, 2, personalMember)
	m.ExpectQuery("SELECT s.`id`, s.`auth`, l.`uid` FROM `huoniao_staff`").
		WillReturnRows(sqlmock.NewRows([]string{"id", "auth", "uid"}))
	m.ExpectQuery("SELECT `id` FROM `huoniao_dating_member`").
		WillReturnRows(sqlmock.NewRows([]string{"id"}))
	m.ExpectQuery("FROM `huoniao_member_friend`").WithArgs(5, int64(2), int64(2), 5).
		WillReturnRows(sqlmock.NewRows([]string{"delfrom", "delto"}).AddRow("0", "0"))

	out := callDetail(t, svc, "id=2&friend=1")
	info := out["info"].(map[string]any)
	if info["isfriend"] != float64(1) {
		t.Fatalf("%v", info["isfriend"])
	}
	met(t, m)
}

// need_data 依赖未迁移的 action：整条 102（不做半截输出）。
func TestDetailNeedDataDegrades(t *testing.T) {
	svc, m := newCommentService(t, fakeIdentity(2), nil)
	out := callDetail(t, svc, "id=2&need_data=quan,fans")
	if out["state"] != float64(102) {
		t.Fatalf("%v", out)
	}
	met(t, m)
}

// 不在 need_data 列表里的值不影响输出。
func TestDetailUnknownNeedDataIgnored(t *testing.T) {
	svc, m := newCommentService(t, fakeIdentity(2), nil)
	expectMember(m, 2, personalMember)
	m.ExpectQuery("SELECT count(log.`id`) totalCount FROM `huoniao_member_letter_log`").
		WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow(0))
	m.ExpectQuery("SELECT SUM(`amount`) bonusPrice FROM `huoniao_member_bonus`").
		WillReturnRows(sqlmock.NewRows([]string{"s"}).AddRow(nil))
	m.ExpectQuery("SELECT `pay_config` FROM `huoniao_site_payment`").
		WillReturnRows(sqlmock.NewRows([]string{"p"}).AddRow(nil))
	m.ExpectQuery("SELECT SUM(`amount`) amount FROM `huoniao_member_bonus`").
		WillReturnRows(sqlmock.NewRows([]string{"s"}).AddRow(nil))
	m.ExpectQuery("SELECT s.`id`, s.`auth`, l.`uid` FROM `huoniao_staff`").
		WillReturnRows(sqlmock.NewRows([]string{"id", "auth", "uid"}))
	m.ExpectQuery("SELECT COUNT(*) FROM `huoniao_member_security`").
		WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow(0))
	m.ExpectQuery("SELECT `id` FROM `huoniao_dating_member`").
		WillReturnRows(sqlmock.NewRows([]string{"id"}))
	out := callDetail(t, svc, "id=2&need_data=unknown")
	if out["state"] != float64(100) {
		t.Fatalf("%v", out)
	}
	met(t, m)
}

// 主表查不到 + from=homepage：PHP 仍返回 {"homepageData":[]}。
func TestDetailHomepageEmptyMember(t *testing.T) {
	svc, m := newCommentService(t, nil, nil)
	m.ExpectQuery(detailSel).WithArgs(int64(42)).
		WillReturnRows(sqlmock.NewRows(memberDetailCols))
	out := callDetail(t, svc, "id=42&from=homepage")
	info := out["info"].(map[string]any)
	if out["state"] != float64(100) || len(info) != 1 {
		t.Fatalf("%v", out)
	}
	if l, ok := info["homepageData"].([]any); !ok || len(l) != 0 {
		t.Fatalf("%v", info)
	}
	met(t, m)
}

// 会员存在时 homepageData 依赖未迁移 action → 102。
func TestDetailHomepageDegrades(t *testing.T) {
	svc, m := newCommentService(t, nil, nil)
	expectMember(m, 2, personalMember)
	m.ExpectQuery("SELECT s.`id`, s.`auth`, l.`uid` FROM `huoniao_staff`").
		WillReturnRows(sqlmock.NewRows([]string{"id", "auth", "uid"}))
	m.ExpectQuery("SELECT `id` FROM `huoniao_dating_member`").
		WillReturnRows(sqlmock.NewRows([]string{"id"}))
	out := callDetail(t, svc, "id=2&from=homepage")
	if out["state"] != float64(102) {
		t.Fatalf("%v", out)
	}
	met(t, m)
}

func TestUserDetailHook(t *testing.T) {
	svc, m := newCommentService(t, nil, nil)
	svc.userDetail = svc.userDetailHook // 覆盖 comment_test 注入的假钩子
	m.ExpectQuery(detailSel).WithArgs(int64(2)).WillReturnRows(detailRows(personalMember))
	m.ExpectQuery("SELECT s.`id`, s.`auth`, l.`uid` FROM `huoniao_staff`").
		WillReturnRows(sqlmock.NewRows([]string{"id", "auth", "uid"}))
	m.ExpectQuery("SELECT `id` FROM `huoniao_dating_member`").
		WillReturnRows(sqlmock.NewRows([]string{"id"}))

	v, err := svc.userDetail(context.Background(), nil, "2", true)
	if err != nil {
		t.Fatal(err)
	}
	o, ok := v.(*Object)
	if !ok {
		t.Fatalf("%T", v)
	}
	if got, _ := o.Get("nickname"); got != "TG_99990001" {
		t.Fatalf("%v", got)
	}
	met(t, m)
}

func TestUserDetailHookMissingMemberReturnsEmptyArray(t *testing.T) {
	svc, m := newCommentService(t, nil, nil)
	svc.userDetail = svc.userDetailHook
	m.ExpectQuery(detailSel).WithArgs(int64(2)).WillReturnRows(sqlmock.NewRows(memberDetailCols))
	v, err := svc.userDetail(context.Background(), nil, "2", true)
	if err != nil {
		t.Fatal(err)
	}
	if arr, ok := v.([]any); !ok || len(arr) != 0 {
		t.Fatalf("%#v", v)
	}
	met(t, m)
}

func TestUserDetailHookInvalidID(t *testing.T) {
	svc, m := newCommentService(t, nil, nil)
	svc.userDetail = svc.userDetailHook
	v, err := svc.userDetail(context.Background(), nil, "", false)
	if err != nil {
		t.Fatal(err)
	}
	o := v.(*Object)
	if st, _ := o.Get("state"); st != 200 {
		t.Fatalf("%v", o)
	}
	met(t, m)
}

func callDetail(t *testing.T, svc *Service, query string) map[string]any {
	t.Helper()
	target := "/include/ajax.php?service=member&action=detail"
	if query != "" {
		target += "&" + query
	}
	body := do(t, svc, http.MethodGet, target, "")
	var out map[string]any
	if err := json.Unmarshal([]byte(body), &out); err != nil {
		t.Fatalf("响应不是 JSON: %v\n%s", err, body)
	}
	t.Log(body)
	return out
}

// userkey 分支：值是 base64(php_encrypt("<openid>@@@@<session>"))，
// PHP 侧 php_decrypt(base64_decode($userkey)) 解两层后按 openid 覆盖 id。
func TestDetailUserkeyOverridesID(t *testing.T) {
	svc, m := newCommentService(t, nil, nil)
	key := base64.StdEncoding.EncodeToString([]byte(svc.encryptUserID("openid-abc@@@@sess")))
	m.ExpectQuery("SELECT `id` FROM `huoniao_member` WHERE `wechat_mini_openid`").
		WithArgs("openid-abc").WillReturnRows(sqlmock.NewRows([]string{"id"}))

	out := callDetail(t, svc, "userkey="+url.QueryEscape(key))
	// 查不到 → $id = $id['id'] → null → 0 → 登录超时。
	if out["state"] != float64(101) {
		t.Fatalf("%v", out)
	}
	met(t, m)
}
