package article

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/url"
	"regexp"
	"strings"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// rewardSelect 是 rewardList 的期望 SQL；用正则匹配，表前缀与空白都参与校验。
func rewardSelect(prefix string) string {
	return regexp.QuoteMeta("SELECT m.`id`, m.`nickname`, m.`photo`, r.`amount`, r.`date` FROM `" +
		prefix + "member_reward` r LEFT JOIN `" + prefix + "member` m ON m.`id` = r.`uid`" +
		" WHERE r.`module` = 'article' AND r.`aid` = ? AND r.`state` = 1 ORDER BY r.`id` ASC")
}

func newTestService(t *testing.T, db *sql.DB) *Service {
	t.Helper()
	svc, err := New(Dep{DB: db, TablePrefix: "huoniao_", Site: DefaultSite()})
	if err != nil {
		t.Fatalf("New 失败：%v", err)
	}
	return svc
}

func params(pairs ...string) url.Values {
	values := url.Values{}
	for i := 0; i+1 < len(pairs); i += 2 {
		values.Set(pairs[i], pairs[i+1])
	}
	return values
}

// assertInfo 断言返回的 info 与预期 JSON 逐字节一致（字段顺序也是契约的一部分）。
func assertInfo(t *testing.T, resp ajax.Response, wantState int, wantInfo string) {
	t.Helper()
	if resp.State != wantState {
		t.Fatalf("state = %d，期望 %d", resp.State, wantState)
	}
	got, err := json.Marshal(resp.Info)
	if err != nil {
		t.Fatalf("info 无法序列化：%v", err)
	}
	if string(got) != wantInfo {
		t.Fatalf("info 不一致\n实际：%s\n期望：%s", got, wantInfo)
	}
}

// 参数非法：aid 缺失 / 0 / 非数字，PHP 都是 (int) 截断后为 0 → 101。
// 这里同时锁住「不查库」：用例没有 ExpectQuery，多一次查询会直接失败。
func TestRewardListBadRequest(t *testing.T) {
	cases := map[string]url.Values{
		"缺 aid":   params(),
		"aid=0":   params("aid", "0"),
		"aid=abc": params("aid", "abc"),
		"aid=0.9": params("aid", "0.9"),
	}
	for name, p := range cases {
		t.Run(name, func(t *testing.T) {
			db, _, err := sqlmock.New()
			if err != nil {
				t.Fatalf("sqlmock: %v", err)
			}
			defer func() { _ = db.Close() }()
			resp := newTestService(t, db).rewardList(&ajax.Request{Params: p})
			assertInfo(t, resp, stateBadRequest, `"格式错误！"`)
		})
	}
}

// 空结果：查无打赏记录时仍是 100 + 空数组，不是 102 "No data!"。
func TestRewardListEmpty(t *testing.T) {
	cases := map[string]int{"aid=1": 1, "aid=-1": -1}
	for name, aid := range cases {
		t.Run(name, func(t *testing.T) {
			db, mock, err := sqlmock.New()
			if err != nil {
				t.Fatalf("sqlmock: %v", err)
			}
			defer func() { _ = db.Close() }()

			mock.ExpectQuery(rewardSelect("huoniao_")).WithArgs(aid).
				WillReturnRows(sqlmock.NewRows([]string{"id", "nickname", "photo", "amount", "date"}))

			resp := newTestService(t, db).rewardList(&ajax.Request{Params: params("aid", strings.TrimPrefix(name, "aid="))})
			assertInfo(t, resp, ajax.StateOK, `{"pageInfo":{"totalCount":0},"list":[]}`)
			if err := mock.ExpectationsWereMet(); err != nil {
				t.Fatalf("SQL 期望未满足：%v", err)
			}
		})
	}
}

// 正常：一行有会员、一行是游客打赏（LEFT JOIN 未命中 → null）。
func TestRewardListRows(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("sqlmock: %v", err)
	}
	defer func() { _ = db.Close() }()

	rows := sqlmock.NewRows([]string{"id", "nickname", "photo", "amount", "date"}).
		AddRow("142", "张三", "photo/2020/a.jpg", "5.00", "1700000000").
		AddRow(nil, nil, nil, "1.00", "1700000001")
	mock.ExpectQuery(rewardSelect("huoniao_")).WithArgs(7).WillReturnRows(rows)

	resp := newTestService(t, db).rewardList(&ajax.Request{Params: params("aid", "7")})
	assertInfo(t, resp, ajax.StateOK, `{"pageInfo":{"totalCount":2},"list":[`+
		`{"id":"142","username":"张三",`+
		`"photo":"https://storage.googleapis.com/fbird-sea-uploads/photo/2020/a.jpg?x-image-process=image/resize,m_fill,w_4096,h_4096",`+
		`"amount":"5.00","date":"1700000000","url":"https://fbird.men/user/142"},`+
		`{"id":null,"username":null,"photo":"","amount":"1.00","date":"1700000001","url":"https://fbird.men/user/"}]}`)
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("SQL 期望未满足：%v", err)
	}
}

// 查询出错：PHP 侧 rowCount 记 0，前端看到空列表；Go 侧同样不放大成 5xx。
func TestRewardListQueryError(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("sqlmock: %v", err)
	}
	defer func() { _ = db.Close() }()
	mock.ExpectQuery(rewardSelect("huoniao_")).WithArgs(1).WillReturnError(errors.New("boom"))

	resp := newTestService(t, db).rewardList(&ajax.Request{Params: params("aid", "1")})
	assertInfo(t, resp, ajax.StateOK, `{"pageInfo":{"totalCount":0},"list":[]}`)
}

// 没有连接池（本地纯内存模式）：同样返回空列表，不 panic、不 5xx。
func TestRewardListNoDB(t *testing.T) {
	resp := newTestService(t, nil).rewardList(&ajax.Request{Params: params("aid", "1")})
	assertInfo(t, resp, ajax.StateOK, `{"pageInfo":{"totalCount":0},"list":[]}`)
}

// 装配校验：非法前缀、未实现的附件模式都在启动期失败。
func TestNewValidation(t *testing.T) {
	base := Dep{TablePrefix: "huoniao_", Site: DefaultSite()}

	bad := map[string]Dep{
		"前缀含反引号":   func() Dep { d := base; d.TablePrefix = "huoniao_`; DROP"; return d }(),
		"OSS 未实现":  func() Dep { d := base; d.Site.FTPType = 1; return d }(),
		"远程 FTP":   func() Dep { d := base; d.Site.FTPType = 0; d.Site.FTPState = 1; return d }(),
		"空域名":      func() Dep { d := base; d.Site.BaseHost = ""; return d }(),
		"空 OBS 地址": func() Dep { d := base; d.Site.OBSUrl = ""; return d }(),
		"协议写错":     func() Dep { d := base; d.Site.SecureAccess = "https"; return d }(),
	}
	for name, dep := range bad {
		t.Run(name, func(t *testing.T) {
			if _, err := New(dep); err == nil {
				t.Fatalf("期望装配失败，实际通过")
			}
		})
	}

	t.Run("本地模式可装配", func(t *testing.T) {
		dep := base
		dep.Site.FTPType = 0
		dep.Site.FTPState = 0
		if _, err := New(dep); err != nil {
			t.Fatalf("本地模式不该失败：%v", err)
		}
	})
}

func TestPHPInt(t *testing.T) {
	cases := map[string]int{
		"":      0,
		"abc":   0,
		"0":     0,
		"3abc":  3,
		"3.7":   3,
		" 12":   12,
		"-1":    -1,
		"+5":    5,
		" -2x":  -2,
		"0012":  12,
		"\t7\n": 7,
	}
	for raw, want := range cases {
		if got := phpInt(raw); got != want {
			t.Fatalf("phpInt(%q) = %d，期望 %d", raw, got, want)
		}
	}
}
