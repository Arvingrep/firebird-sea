package member

import (
	"database/sql/driver"
	"net/http"
	"strings"
	"testing"
	"time"

	sqlmock "github.com/DATA-DOG/go-sqlmock"
)

// 正则匹配器：reward 的 SQL 太长，只用片段区分语句。
func newRewardService(t *testing.T, uid int64, mut func(*Dep)) (*Service, sqlmock.Sqlmock) {
	t.Helper()
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("sqlmock: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })
	dep := Dep{DB: db, TablePrefix: "huoniao_", Identity: fakeIdentity(uid)}
	if mut != nil {
		mut(&dep)
	}
	svc, err := New(dep)
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	return svc, mock
}

const (
	rCount  = "SELECT COUNT\\(\\*\\) FROM \\(SELECT"
	rSum    = "SELECT SUM\\(`amount`\\) allamount FROM"
	rList   = "ORDER BY `date` DESC LIMIT \\?, \\?$"
	rMember = "FROM `huoniao_member` WHERE `state` = 1"
)

var rowCols = []string{"hid", "reward_userid", "amount", "settle", "date", "num", "gift_id", "module", "aid", "rewardtype"}

func expectTotals(m sqlmock.Sqlmock, count int, sum any, countArgs ...driver.Value) {
	q := m.ExpectQuery(rCount)
	if countArgs != nil {
		q.WithArgs(countArgs...)
	}
	q.WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow(count))
	m.ExpectQuery(rSum).WillReturnRows(sqlmock.NewRows([]string{"s"}).AddRow(sum))
}

func expectNoMember(m sqlmock.Sqlmock) {
	m.ExpectQuery(rMember).WillReturnRows(sqlmock.NewRows([]string{"id"}))
}

func expectModule(m sqlmock.Sqlmock, name, title, subject string) {
	m.ExpectQuery("FROM `huoniao_site_module` WHERE `name` = \\?").WithArgs(name).
		WillReturnRows(sqlmock.NewRows([]string{"title", "subject"}).AddRow(title, subject))
}

func get(t *testing.T, svc *Service, target string) string {
	t.Helper()
	return do(t, svc, http.MethodGet, "/ajax.php?service=member&action=reward&"+target, "")
}

func contains(t *testing.T, got string, want ...string) {
	t.Helper()
	for _, w := range want {
		if !strings.Contains(got, w) {
			t.Fatalf("响应体缺少 %s\n响应体 = %s", w, got)
		}
	}
}

func TestRewardAnonymousIsEmpty(t *testing.T) {
	svc, m := newRewardService(t, -1, nil)
	expectTotals(m, 0, nil)
	contains(t, get(t, svc, ""), `"state":101`, "暂无数据！")
	met(t, m)
}

func TestRewardMemberBranch(t *testing.T) {
	svc, m := newRewardService(t, 7, func(d *Dep) {
		d.ModuleURL = func(service, template string, id int64) string {
			return "/" + service + "/" + template + "/" + strings.TrimSpace(time.Duration(id).String())
		}
	})
	expectTotals(m, 1, "12.5")
	m.ExpectQuery(rList).WithArgs(0, 10).WillReturnRows(sqlmock.NewRows(rowCols).
		AddRow("", 5, "12.50", "", 1700000000, "", "", "article", 3, "member"))
	m.ExpectQuery("FROM `huoniao_articlelist` WHERE `id` = \\?").WithArgs(3).
		WillReturnRows(sqlmock.NewRows([]string{"title"}).AddRow("好文"))
	expectNoMember(m)
	expectModule(m, "article", "资讯", "")
	got := get(t, svc, "")
	contains(t, got,
		`"pageInfo":{"page":1,"pageSize":10,"totalPage":1.0,"totalCount":1,"totalmoney":12.5}`,
		// 键顺序：id,type,title,url,userinfo,amount,date,module,reward_userid,user
		`"list":[{"id":3,"type":0,"title":"好文","url":"/article/detail/3ns","userinfo":"No data!","amount":"12.50","date":"2023-11-15 06:13:20","module":"资讯","reward_userid":5,"user":"匿名"}]`)
	met(t, m)
}

func TestRewardMemberUserinfoProjection(t *testing.T) {
	svc, m := newRewardService(t, 7, nil)
	expectTotals(m, 1, "1")
	m.ExpectQuery(rList).WillReturnRows(sqlmock.NewRows(rowCols).AddRow("", 5, "1", "", 1700000000, "", "", "chat", 3, "member"))
	m.ExpectQuery("FROM `huoniao_chatlist`").WillReturnRows(sqlmock.NewRows([]string{"title"}))
	cols := []string{"id", "mtype", "level", "certifyState", "nation", "licenseState", "promotion", "birthday", "lastloginipaddr", "money", "freeze", "bonus", "point", "company", "nickname", "realname", "photo", "sex", "wechat_subscribe", "online", "cityid", "addr", "description", "address", "license", "zhaopin_company", "zhaopin_resume"}
	m.ExpectQuery(rMember).WillReturnRows(sqlmock.NewRows(cols).AddRow(
		"5", "1", "2", "1", "86", "0", "0.00", "2000-01-01", "", "1.50", "0.00", "0.00", "9", "", "小明", "", "", "1", "0", "0", "3", "0", "a\nb", "", "", "1", "2"))
	m.ExpectQuery("FROM `huoniao_member_level` WHERE `id` = \\?").WithArgs(2).WillReturnRows(sqlmock.NewRows([]string{"name", "icon"}).AddRow("金牌", ""))
	m.ExpectQuery("FROM `huoniao_staff` s").WillReturnRows(sqlmock.NewRows([]string{"id", "auth", "uid"}).AddRow("4", `a:2:{i:0;s:1:"x";i:1;s:1:"y";}`, "9"))
	got := get(t, svc, "")
	// userinfo 键按 ksort 排序；非 mtype=2 有 hidePackage；userType 恒 1；point 受 cfg_pointState 控制（默认 0）。
	contains(t, got,
		`"userinfo":{"addrName":"","addrid":"0","autharr":["x","y"],"birthday":"2000-01-01","bonus":0.0,"certifyState":1,"cityid":"3","companyuid":9,"cookiePre":"login_user","dating_uid":0,"description":"a\u003cbr /\u003eb","freeze":0.0,"hidePackage":[],"iphome":"","is_staff":1,"level":2,"levelIcon":"","levelName":"金牌","licenseState":"0","money":1.5,"nation":"86","nickname":"小明","online":"0","photo":"/static/images/noPhoto_100.jpg","photoSource":"","point":0,"promotion":0.0,"sex":"1","staffid":4,"userType":1,"userid":"5","wechat_subscribe":"0","zhaopin_company":1,"zhaopin_resume":2}`,
		`"module":"在线聊天"`, `"user":"小明"`)
	met(t, m)
}

func TestRewardLiveBranches(t *testing.T) {
	tests := []struct {
		name   string
		row    []driver.Value
		gift   bool
		wanted []string
	}{
		{"礼物 fee=100%", []driver.Value{"1", -1, "10.00", "0.00", 1700000000, "3", "2", "", 8, "live"}, true,
			// reward_userid=-1 → getMemberInfo 空数组 → 昵称 null
			[]string{`{"url":"/live/h_detail/8","id":8,"type":1,"title":"直播:在夜话中送了3个火箭","amount":"10.00","fee":"100%","module":"直播","reward_userid":-1,"user":null,"date":"2023-11-15 06:13:20"}`}},
		{"打赏 无 settle", []driver.Value{"1", 5, "10.005", "", 1700000000, "1", "0", "", 8, "live"}, false,
			[]string{`"type":0,"title":"直播:匿名在夜话打赏了10.01元","amount":"10.01","fee":"100%"`}},
		{"settle>0", []driver.Value{"1", 5, "10.00", "8.00", 1700000000, "1", "0", "", 8, "live"}, false,
			[]string{`"amount":"8.00","fee":"80.00%"`}},
		{"settle>0 amount=0", []driver.Value{"1", 5, "0.00", "8.00", 1700000000, "1", "0", "", 8, "live"}, false,
			[]string{`"amount":"8.00","fee":"INF%"`}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			svc, m := newRewardService(t, 7, func(d *Dep) {
				d.ModuleURL = func(s, tpl string, id int64) string { return "/" + s + "/" + tpl + "/8" }
			})
			expectTotals(m, 1, "10")
			m.ExpectQuery(rList).WillReturnRows(sqlmock.NewRows(rowCols).AddRow(tt.row...))
			m.ExpectQuery("FROM `huoniao_livelist` WHERE `id` = \\?").WithArgs(8).WillReturnRows(sqlmock.NewRows([]string{"title"}).AddRow("夜话"))
			if tt.row[1] != -1 {
				expectNoMember(m)
			}
			if tt.gift {
				m.ExpectQuery("FROM `huoniao_live_gift` WHERE `id` = \\?").WithArgs(2).
					WillReturnRows(sqlmock.NewRows([]string{"gift_name", "gift_litpic"}).AddRow("火箭", ""))
			}
			expectModule(m, "live", "live", "直播")
			contains(t, get(t, svc, ""), tt.wanted...)
			met(t, m)
		})
	}
}

func TestRewardHongbaoBranch(t *testing.T) {
	svc, m := newRewardService(t, 7, nil)
	expectTotals(m, 1, "2")
	m.ExpectQuery(rList).WillReturnRows(sqlmock.NewRows(rowCols).AddRow("", 5, "2.00", "", 1700000000, "", "", "", 8, "hongbao"))
	m.ExpectQuery("FROM `huoniao_livelist` WHERE `id` = \\?").WillReturnRows(sqlmock.NewRows([]string{"title"}).AddRow("夜话"))
	expectNoMember(m)
	expectModule(m, "live", "直播间", "")
	contains(t, get(t, svc, ""),
		`{"id":8,"url":"","type":0,"title":"直播:夜话中获得红包","amount":"2.00","module":"直播间","reward_userid":5,"user":"匿名","date":"2023-11-15 06:13:20"}`)
	met(t, m)
}

// 站点模块查不到时 module 是 null（getModuleTitle 无返回值），不是 ""。
func TestRewardModuleTitleNull(t *testing.T) {
	svc, m := newRewardService(t, 7, nil)
	expectTotals(m, 1, "2")
	m.ExpectQuery(rList).WillReturnRows(sqlmock.NewRows(rowCols).AddRow("", 5, "2.00", "", 1700000000, "", "", "", 8, "hongbao"))
	m.ExpectQuery("FROM `huoniao_livelist`").WillReturnRows(sqlmock.NewRows([]string{"title"}))
	expectNoMember(m)
	m.ExpectQuery("FROM `huoniao_site_module`").WillReturnRows(sqlmock.NewRows([]string{"title", "subject"}))
	contains(t, get(t, svc, ""), `"title":"直播:中获得红包"`, `"module":null`)
	met(t, m)
}

func TestRewardFilters(t *testing.T) {
	end := time.Date(2024, 5, 31, 23, 59, 59, 0, gmt8).Unix()
	start := time.Date(2024, 5, 1, 0, 0, 0, 0, gmt8).Unix()
	tests := []struct {
		name  string
		query string
		args  []driver.Value
		empty bool // 直接返回，不发 SQL
		sqlRe string
	}{
		{"type=1 soure=article 直接暂无数据", "type=1&soure=article", nil, true, ""},
		{"soure=article 绑定 module", "soure=article", []driver.Value{"article"}, false, "(?s)FROM \\(SELECT '' hid,`uid` reward_userid.*module` = \\?\\) as alls  WHERE  1 = 1\\) t"},
		{"type=1 只 livesql 且 gift_id>0", "type=1", nil, false, "gift_id` > 0\\) t"},
		{"type=2 单独不进改写分支，三路 UNION（livesql 带 r.gift_id=0）", "type=2", nil, false, "(?s)AND r\\.`gift_id` = 0 \\).*UNION ALL .*as alls WHERE 1 = 1\\) t"},
		{"soure=live type=2 live+hongbao 且 gift_id=0", "soure=live&type=2", nil, false, "(?s)UNION ALL .*\\)as alls WHERE  1 = 1 AND `gift_id` = 0\\) t"},
		{"soure=live type=1 同 type=1", "soure=live&type=1", nil, false, "gift_id` > 0\\) t"},
		{"soure=live 无 type 走默认三路", "soure=live", nil, false, "(?s)UNION ALL .*UNION ALL .*as alls WHERE 1 = 1\\) t"},
		{"soure=article type=2 以 member 为准", "soure=article&type=2", []driver.Value{"article"}, false, "member' rewardtype FROM `huoniao_member_reward`"},
		{"date 整月", "date=2024-05-12", []driver.Value{start + 11*86400, end}, false, "`date` >= \\? AND `date` <= \\?\\) t"},
		{"date 非法=0 与 1970-01 月末", "date=abc", []driver.Value{int64(0), time.Date(1970, 1, 31, 23, 59, 59, 0, gmt8).Unix()}, false, "`date` >= \\?"},
		{"price 5,10 BETWEEN", "price=5,10", []driver.Value{5.0, 10.0}, false, "BETWEEN \\? AND \\?\\) t"},
		{"price ,10 小于", "price=,10", []driver.Value{10.0}, false, "`amount` < \\?\\) t"},
		{"price 5, 大于", "price=5,", []driver.Value{5.0}, false, "`amount` > \\?\\) t"},
		{"price 5 单段 → e=0 → 大于", "price=5", []driver.Value{5.0}, false, "`amount` > \\?\\) t"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			svc, m := newRewardService(t, 7, nil)
			if tt.empty {
				contains(t, get(t, svc, tt.query), `"state":101`, "暂无数据！")
				met(t, m)
				return
			}
			q := m.ExpectQuery(tt.sqlRe)
			if tt.args != nil {
				if tt.name == "date 整月" {
					tt.args[0] = driver.Value(strToTimeForTest("2024-05-12"))
				}
				q.WithArgs(tt.args...)
			}
			q.WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow(0))
			m.ExpectQuery(rSum).WillReturnRows(sqlmock.NewRows([]string{"s"}).AddRow(nil))
			contains(t, get(t, svc, tt.query), `"state":101`)
			met(t, m)
		})
	}
}

func strToTimeForTest(v string) int64 { return strToTime(v) }

// totalmoney 的 SQL 恒为三路 UNION，不认 type 的外层改写（只带 membersql / livesql 里已拼好的条件）。
func TestRewardTotalmoneyIgnoresTypeWrapper(t *testing.T) {
	svc, m := newRewardService(t, 7, nil)
	m.ExpectQuery("(?s)SELECT COUNT\\(\\*\\) FROM \\(SELECT \\* FROM \\(\\(SELECT '' hid,`uid`").WillReturnRows(sqlmock.NewRows([]string{"c"}).AddRow(1))
	m.ExpectQuery("(?s)SUM\\(`amount`\\) allamount FROM \\(\\(SELECT '' hid,`uid`.*UNION ALL \\(SELECT r\\.`id` hid.*AND r\\.`gift_id` = 0 \\).*UNION ALL \\(SELECT '' hid,`recv_user`").
		WillReturnRows(sqlmock.NewRows([]string{"s"}).AddRow("99.999"))
	m.ExpectQuery(rList).WillReturnRows(sqlmock.NewRows(rowCols))
	contains(t, get(t, svc, "type=2&price=1,2"), `"totalmoney":100.0`, `"list":[]`)
	met(t, m)
}

func TestRewardPaging(t *testing.T) {
	tests := []struct {
		name         string
		query, form  string
		page, size   int
		limit, count int
		pageInfo     string
	}{
		{"默认 page=1 pageSize=10", "", "", 1, 10, 0, 25, `"page":1,"pageSize":10,"totalPage":3.0,"totalCount":25`},
		{"越界页 list 为空但 state 100", "page=9&pageSize=2", "", 9, 2, 16, 3, `"page":9,"pageSize":2,"totalPage":2.0,"totalCount":3`},
		{"GET page/pageSize<=0 取默认", "page=-3&pageSize=0", "", 1, 10, 0, 3, `"page":1,"pageSize":10,"totalPage":1.0`},
		{"超过上限 cap 50000", "page=99999999&pageSize=1", "", 50000, 1, 49999, 3, `"page":50000,"pageSize":1,"totalPage":3.0`},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			svc, m := newRewardService(t, 7, nil)
			expectTotals(m, tt.count, "1")
			m.ExpectQuery(rList).WithArgs(tt.limit, tt.size).WillReturnRows(sqlmock.NewRows(rowCols))
			got := get(t, svc, tt.query)
			contains(t, got, `"state":100`, tt.pageInfo, `"list":[]`)
			met(t, m)
		})
	}
}

func TestRewardNoDBOrIdentityError(t *testing.T) {
	svc, _ := New(Dep{TablePrefix: "huoniao_"})
	contains(t, get(t, svc, ""), `"state":102`)
}

func TestFmt2(t *testing.T) {
	for in, want := range map[float64]string{1.005: "1.01", 10.005: "10.01", 0: "0.00", 12.5: "12.50", 0.999: "1.00", 80: "80.00", 1234567.891: "1234567.89", -0.126: "-0.13"} {
		if got := fmt2(in); got != want {
			t.Errorf("fmt2(%v) = %s, want %s", in, got, want)
		}
	}
}

func TestMonthEnd(t *testing.T) {
	got := monthEnd(strToTime("2024-02-10"))
	if want := time.Date(2024, 2, 29, 23, 59, 59, 0, gmt8).Unix(); got != want {
		t.Fatalf("monthEnd = %d, want %d", got, want)
	}
	// strtotime 失败 → 0 → date('m')=01, date('y')=70 → 1970-01-31 23:59:59
	if want := time.Date(1970, 1, 31, 23, 59, 59, 0, gmt8).Unix(); monthEnd(0) != want {
		t.Fatalf("monthEnd(0) = %d, want %d", monthEnd(0), want)
	}
}
