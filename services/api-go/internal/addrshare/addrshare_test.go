// 地址分享路由的正式测试套件。逐条翻译自 services/api/test/addr-share-route.test.js（12 条）。
//
// 与 Node 版的映射原则：
//   - Node 用假的 `conn.query` 收集 SQL 文本再 `includes` 匹配；Go 用 sqlmock 的
//     `regexp.QuoteMeta` 精确匹配语句 + `WithArgs` 断言每一个绑定参数。参数化查询把
//     「值」从 SQL 文本里挪到了绑定参数上，所以原本 `insert.includes('1450 Ala Moana Blvd')`
//     这类断言改成「绑定参数逐字相等」——强度不降，反而多校验了列顺序与类型。
//   - Node 走 `mariadb -N -B` 批处理，读回必须 `SELECT HEX(payload)` 再手工 hex 解码；
//     Go 用驱动读原始字节，直接 SELECT payload。往返一致性的断言因此更强（不需要 hex 中转）。
package addrshare

import (
	"database/sql"
	"database/sql/driver"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"reflect"
	"regexp"
	"strings"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/token"
)

const (
	addPrefix = "/tg-api/addr"
	addSecret = "addrshare-suite-secret-0123456789"
	addMember = int64(4242)
	addTgID   = int64(100200)
)

// addClock 对应 Node 的 NOW = 1_700_000_000（秒级固定时钟，测试里不出现真实 sleep）。
var addClock = time.Unix(1_700_000_000, 0).UTC()

// 四条语句按真实执行顺序：清理（独立，不在事务内）→ 事务内 INSERT → 裁剪 DELETE → 提交。
const (
	addSQLPurge  = "DELETE FROM fbs_addr_share WHERE expires_at <= ?"
	addSQLInsert = "INSERT INTO fbs_addr_share (token, uid, payload, created_at, expires_at) VALUES (?, ?, ?, ?, ?)"
	addSQLTrim   = "DELETE FROM fbs_addr_share WHERE uid = ? AND token NOT IN (SELECT token FROM (SELECT token FROM fbs_addr_share WHERE uid = ? ORDER BY created_at DESC, token DESC LIMIT ?) AS keep)"
	addSQLLookup = "SELECT payload FROM fbs_addr_share WHERE token = ? AND expires_at > ? LIMIT 1"
)

// addValue 记录实际绑定到某一列的值。
//
// sqlmock.AnyArg 只是「放过」，断言失败时看不到真实值；这里先记下来再按类型断言，
// 少绑参数、绑错类型都会立刻炸出来，而不是悄悄通过。
type addValue struct{ raw driver.Value }

func (v *addValue) Match(actual driver.Value) bool {
	v.raw = actual
	return true
}

func (v *addValue) str(t *testing.T, what string) string {
	t.Helper()
	text, ok := v.raw.(string)
	if !ok {
		t.Fatalf("%s：绑定值类型 = %T，期望 string（实际 %v）", what, v.raw, v.raw)
	}
	return text
}

func (v *addValue) num(t *testing.T, what string) int64 {
	t.Helper()
	number, ok := v.raw.(int64)
	if !ok {
		t.Fatalf("%s：绑定值类型 = %T，期望 int64（实际 %v）", what, v.raw, v.raw)
	}
	return number
}

// addInsert 是 INSERT 五列的实际绑定值。
type addInsert struct {
	token   addValue
	uid     addValue
	payload addValue
	created addValue
	expires addValue
}

// addSetup 是跑一次请求所需的全部装配：真实 mux + 真实 httptest 服务器 + sqlmock 库。
//
// 用真实服务器而不是 Recorder：状态码、Content-Type、路径通配符（{token} → PathValue）
// 都要真的走一遍 net/http 才作数。
type addSetup struct {
	router *Router
	server *httptest.Server
	tokens *token.Service
}

func addTokenService(t *testing.T) *token.Service {
	t.Helper()
	service, err := token.NewService(token.Dep{
		Secret: addSecret,
		Env:    "test",
		Now:    func() time.Time { return addClock },
	})
	if err != nil {
		t.Fatalf("token service: %v", err)
	}
	return service
}

// newAddSetup 装配路由。dep.DB 为 nil 时不接库（前置校验分支用不到它）。
func newAddSetup(t *testing.T, dep Dep) *addSetup {
	t.Helper()
	service := addTokenService(t)
	if dep.Tokens == nil {
		dep.Tokens = service
	}
	if dep.Now == nil {
		dep.Now = func() time.Time { return addClock }
	}
	if dep.Logf == nil {
		// 默认写 stderr 会污染测试输出；测试里必须显式接住告警。
		dep.Logf = func(string) {}
	}
	router, err := New(dep)
	if err != nil {
		t.Fatalf("new router: %v", err)
	}

	mux := http.NewServeMux()
	router.Mount(mux, addPrefix)
	server := httptest.NewServer(mux)
	t.Cleanup(server.Close)

	return &addSetup{router: router, server: server, tokens: service}
}

// addMockDB 建一个由 sqlmock 驱动的库，语句顺序严格按期望队列消费。
func addMockDB(t *testing.T) (*sql.DB, sqlmock.Sqlmock) {
	t.Helper()
	db, mock, err := sqlmock.New(sqlmock.QueryMatcherOption(sqlmock.QueryMatcherRegexp))
	if err != nil {
		t.Fatalf("sqlmock: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })
	return db, mock
}

// issue 用固定时钟签发一枚真实令牌。Node 版注入的是假 verifier，这里走真实验签链路。
func (s *addSetup) issue(mid int64) string {
	return s.tokens.Issue(addTgID, mid).Token
}

// post 发一次分享请求，返回状态码与解析后的响应体（非 JSON 时为 nil）。
func (s *addSetup) post(t *testing.T, body string, bearer string) (int, []byte, map[string]any) {
	t.Helper()
	request, err := http.NewRequest(http.MethodPost, s.server.URL+addPrefix+"/share", strings.NewReader(body))
	if err != nil {
		t.Fatalf("new request: %v", err)
	}
	request.Header.Set("Content-Type", "application/json")
	if bearer != "" {
		request.Header.Set("Authorization", "Bearer "+bearer)
	}
	return addDo(t, request)
}

// get 发一次读取请求。path 已是转义后的路径（对齐 Node 的 encodeURIComponent）。
func (s *addSetup) get(t *testing.T, path string) (int, []byte, map[string]any) {
	t.Helper()
	request, err := http.NewRequest(http.MethodGet, s.server.URL+path, nil)
	if err != nil {
		t.Fatalf("new request: %v", err)
	}
	return addDo(t, request)
}

func addDo(t *testing.T, request *http.Request) (int, []byte, map[string]any) {
	t.Helper()
	response, err := http.DefaultClient.Do(request)
	if err != nil {
		t.Fatalf("do request: %v", err)
	}
	defer func() { _ = response.Body.Close() }()
	raw, err := io.ReadAll(response.Body)
	if err != nil {
		t.Fatalf("read body: %v", err)
	}
	var decoded map[string]any
	_ = json.Unmarshal(raw, &decoded)
	return response.StatusCode, raw, decoded
}

// addErrorCode 取 error.code；缺失时返回空串（「没有 error 对象」本身也是断言对象）。
func addErrorCode(t *testing.T, body map[string]any) string {
	t.Helper()
	detail, ok := body["error"].(map[string]any)
	if !ok {
		return ""
	}
	code, _ := detail["code"].(string)
	return code
}

// addData 取 data 对象。
func addData(t *testing.T, body map[string]any) map[string]any {
	t.Helper()
	data, ok := body["data"].(map[string]any)
	if !ok {
		t.Fatalf("响应缺少 data 对象：%v", body)
	}
	return data
}

// expectShareWrite 按真实实现顺序安装「清理 → 事务 → INSERT → 裁剪 → 提交」期望。
//
// 清理语句在事务外先行（maybePurge），INSERT 与裁剪必须同事务——Node 版是两条独立
// conn.query，Go 版收进了事务，所以这里多了 ExpectBegin/ExpectCommit：
// 「只插入不裁剪」会让公开接口长期暴露历史地址，事务边界本身就是被断言的对象。
func expectShareWrite(t *testing.T, mock sqlmock.Sqlmock, now time.Time) *addInsert {
	t.Helper()
	got := &addInsert{}

	mock.ExpectExec(regexp.QuoteMeta(addSQLPurge)).
		WithArgs(now.Unix()).
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectBegin()
	mock.ExpectExec(regexp.QuoteMeta(addSQLInsert)).
		WithArgs(&got.token, &got.uid, &got.payload, &got.created, &got.expires).
		WillReturnResult(sqlmock.NewResult(1, 1))
	// Node 的断言是 `cap.includes('LIMIT 20')`；参数化后 20 是绑定值，断言它的实参更严格。
	mock.ExpectExec(regexp.QuoteMeta(addSQLTrim)).
		WithArgs(addMember, addMember, MaxPerUID).
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectCommit()
	return got
}

// payloadOf 把 INSERT 绑定的 payload 列反序列化回 Payload，便于逐字段断言。
func (i *addInsert) payloadOf(t *testing.T) Payload {
	t.Helper()
	var parsed Payload
	if err := json.Unmarshal([]byte(i.payload.str(t, "payload")), &parsed); err != nil {
		t.Fatalf("payload 不是合法 JSON：%v（%s）", err, i.payload.raw)
	}
	return parsed
}

func TestAddrShareRoute(t *testing.T) {
	// 与 Node 的 GOOD 一致：只带位置字段，不带 person/tel（服务端只接收位置）。
	const goodBody = `{"person":"Alex","tel":"@alex","street":"1450 Ala Moana Blvd",` +
		`"address":"1450 Ala Moana Blvd，5B","lat":"21.28","lng":"-157.83"}`

	t.Run("分享：缺令牌返回 401", func(t *testing.T) {
		setup := newAddSetup(t, Dep{})
		status, _, body := setup.post(t, goodBody, "")
		if status != http.StatusUnauthorized {
			t.Fatalf("status = %d, want 401", status)
		}
		if code := addErrorCode(t, body); code != "UNAUTHORIZED" {
			t.Fatalf("error.code = %q, want UNAUTHORIZED", code)
		}
	})

	t.Run("分享：缺坐标返回 400", func(t *testing.T) {
		setup := newAddSetup(t, Dep{})
		status, _, body := setup.post(t, `{"street":"X"}`, setup.issue(addMember))
		if status != http.StatusBadRequest {
			t.Fatalf("status = %d, want 400", status)
		}
		if code := addErrorCode(t, body); code != "INVALID" {
			t.Fatalf("error.code = %q, want INVALID", code)
		}
	})

	t.Run("分享：mid 非法返回 403", func(t *testing.T) {
		setup := newAddSetup(t, Dep{})
		// Node 注入 verifier 返回 mid: 0；这里签发一枚 mid=0 的真实令牌，走同一分支。
		status, _, body := setup.post(t, goodBody, setup.issue(0))
		if status != http.StatusForbidden {
			t.Fatalf("status = %d, want 403（body=%v）", status, body)
		}
	})

	t.Run("分享：成功返回 32 位 hex token 并写库，botToken 缺失时 url 为 null", func(t *testing.T) {
		db, mock := addMockDB(t)
		setup := newAddSetup(t, Dep{DB: db})
		insert := expectShareWrite(t, mock, addClock)

		status, _, body := setup.post(t, goodBody, setup.issue(addMember))
		if status != http.StatusOK {
			t.Fatalf("status = %d, want 200（body=%v）", status, body)
		}
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("语句期望未满足：%v", err)
		}

		data := addData(t, body)
		created, _ := data["token"].(string)
		if !tokenRe.MatchString(created) {
			t.Fatalf("token = %q，不符合 %s", created, TokenPattern)
		}
		if value, present := data["url"]; !present || value != nil {
			t.Fatalf("url = %v，botToken 缺失时必须是 null", value)
		}
		if got, _ := data["expiresAt"].(float64); int64(got) != addClock.Add(DefaultTTL).Unix() {
			t.Fatalf("expiresAt = %v, want %d", data["expiresAt"], addClock.Add(DefaultTTL).Unix())
		}

		// 绑定参数逐字校验：token 与响应一致，uid 是令牌里的 mid，payload 是规范化的快照
		// （person/tel 被丢弃——只接收位置，避免分享者伪造他人姓名/电话）。
		if got := insert.token.str(t, "token"); got != created {
			t.Fatalf("落库 token = %q，响应里是 %q", got, created)
		}
		if got := insert.uid.num(t, "uid"); got != addMember {
			t.Fatalf("落库 uid = %d, want %d", got, addMember)
		}
		const wantPayload = `{"street":"1450 Ala Moana Blvd","address":"1450 Ala Moana Blvd，5B","lat":"21.28","lng":"-157.83","areaCode":"1"}`
		if got := insert.payload.str(t, "payload"); got != wantPayload {
			t.Fatalf("落库 payload =\n %s\nwant\n %s", got, wantPayload)
		}
		if got := insert.created.num(t, "created_at"); got != addClock.Unix() {
			t.Fatalf("created_at = %d, want %d", got, addClock.Unix())
		}
		if got := insert.expires.num(t, "expires_at"); got != addClock.Add(DefaultTTL).Unix() {
			t.Fatalf("expires_at = %d, want %d", got, addClock.Add(DefaultTTL).Unix())
		}
	})

	t.Run("分享：超长与换行内容被裁剪成单行", func(t *testing.T) {
		db, mock := addMockDB(t)
		setup := newAddSetup(t, Dep{DB: db})
		insert := expectShareWrite(t, mock, addClock)

		// 与 Node 的 'A\nB\tC'.repeat(200) 逐字一致：1000 字符，远超 300 上限。
		longStreet := strings.Repeat("A\nB\tC", 200)
		encoded, err := json.Marshal(map[string]any{"street": longStreet, "lat": "1", "lng": "2"})
		if err != nil {
			t.Fatalf("marshal body: %v", err)
		}
		status, _, body := setup.post(t, string(encoded), setup.issue(addMember))
		if status != http.StatusOK {
			t.Fatalf("status = %d, want 200（body=%v）", status, body)
		}
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("语句期望未满足：%v", err)
		}

		// Node 断言 `!insert.includes('\\n')`：SQL 文本里不能出现换行转义序列。
		// 参数化后真实换行会原样躺在绑定参数里，所以直接断言「字段里没有控制字符」。
		stored := insert.payloadOf(t)
		if strings.ContainsAny(stored.Street, "\r\n\t") {
			t.Fatalf("street 里残留换行/制表符：%q", stored.Street)
		}
		// Node 断言 `insert.length < 1200`（整条 SQL 的长度）；这里直接断言字段被截到 300 字符。
		if got := len([]rune(stored.Street)); got != StreetLimit {
			t.Fatalf("street 长度 = %d 字符，want %d", got, StreetLimit)
		}
		wantStreet := string([]rune(strings.Repeat("A B C", 200))[:StreetLimit])
		if stored.Street != wantStreet {
			t.Fatalf("street 截断结果不符：前 40 字符 = %q，want %q", firstRunes(stored.Street, 40), firstRunes(wantStreet, 40))
		}
	})

	t.Run("分享：写入时反斜杠被转义，并限制每个会员保留 20 条", func(t *testing.T) {
		db, mock := addMockDB(t)
		setup := newAddSetup(t, Dep{DB: db})
		insert := expectShareWrite(t, mock, addClock)

		encoded, err := json.Marshal(map[string]any{"street": `Tower\A "North"`, "lat": "1", "lng": "2"})
		if err != nil {
			t.Fatalf("marshal body: %v", err)
		}
		status, _, body := setup.post(t, string(encoded), setup.issue(addMember))
		if status != http.StatusOK {
			t.Fatalf("status = %d, want 200（body=%v）", status, body)
		}
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("语句期望未满足：%v", err)
		}

		// Node 断言 `insert.includes('\\\\')`：sqlStr 把反斜杠双写。Go 侧不再拼接 SQL，
		// 转义由驱动的参数转义负责；绑定参数里应当仍是单个反斜杠，而 JSON 序列化本身
		// 会把 `\` 写成 `\\`，因此 payload 文本里出现双写、反解后必须还原成单写。
		raw := insert.payload.str(t, "payload")
		if !strings.Contains(raw, `Tower\\A`) {
			t.Fatalf("payload 里反斜杠未被 JSON 转义：%s", raw)
		}
		stored := insert.payloadOf(t)
		if stored.Street != `Tower\A "North"` {
			t.Fatalf("反斜杠/引号未逐字保留：%q", stored.Street)
		}

		// 裁剪语句本身已由 expectShareWrite 的限定量断言（ORDER BY created_at DESC + LIMIT 20）。
		if !strings.Contains(addSQLTrim, "ORDER BY created_at DESC") {
			t.Fatalf("裁剪语句缺少 ORDER BY created_at DESC：%s", addSQLTrim)
		}
	})

	t.Run("读取：含双引号/反斜杠的地址经 HEX 往返后内容完全一致", func(t *testing.T) {
		// Node 侧之所以要 HEX：cliConn 走 `mariadb -N -B`，批处理模式会二次转义输出里的
		// 反斜杠，直接 SELECT payload 时含 " 或 \ 的 JSON 读回即坏（QA 第 1 轮 major）。
		// Go 用驱动读原始字节，不需要 HEX 中转——这里把「最容易坏的那串 JSON」原样喂给
		// 驱动，断言响应逐字相等，等价且更强（少一次编解码就少一个出错点）。
		stored := `{"person":"O\"Brien\\Lee","tel":"@obrien","street":"5'10\" Tower\\A",` +
			`"address":"5'10\" Tower\\A，Unit 3","lat":"21.2","lng":"-157.8","areaCode":"1"}`
		db, mock := addMockDB(t)
		setup := newAddSetup(t, Dep{DB: db})
		mock.ExpectQuery(regexp.QuoteMeta(addSQLLookup)).
			WithArgs(strings.Repeat("a", 32), addClock.Unix()).
			WillReturnRows(sqlmock.NewRows([]string{"payload"}).AddRow([]byte(stored)))

		status, _, body := setup.get(t, addPrefix+"/shared/"+strings.Repeat("a", 32))
		if status != http.StatusOK {
			t.Fatalf("status = %d, want 200（body=%v）", status, body)
		}
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("语句期望未满足：%v", err)
		}

		want := map[string]any{
			"person":   `O"Brien\Lee`,
			"tel":      "@obrien",
			"street":   `5'10" Tower\A`,
			"address":  `5'10" Tower\A，Unit 3`,
			"lat":      "21.2",
			"lng":      "-157.8",
			"areaCode": "1",
		}
		if got := addData(t, body); !reflect.DeepEqual(got, want) {
			t.Fatalf("快照往返不一致：\n got: %#v\nwant: %#v", got, want)
		}
	})

	t.Run("读取：合法 token 返回快照", func(t *testing.T) {
		db, mock := addMockDB(t)
		setup := newAddSetup(t, Dep{DB: db})
		mock.ExpectQuery(regexp.QuoteMeta(addSQLLookup)).
			WithArgs(strings.Repeat("a", 32), addClock.Unix()).
			WillReturnRows(sqlmock.NewRows([]string{"payload"}).
				AddRow([]byte(`{"person":"Alex","street":"A","lat":"1","lng":"2"}`)))

		status, _, body := setup.get(t, addPrefix+"/shared/"+strings.Repeat("a", 32))
		if status != http.StatusOK {
			t.Fatalf("status = %d, want 200（body=%v）", status, body)
		}
		want := map[string]any{"person": "Alex", "street": "A", "lat": "1", "lng": "2"}
		if got := addData(t, body); !reflect.DeepEqual(got, want) {
			t.Fatalf("data = %#v, want %#v", got, want)
		}
	})

	t.Run("读取：token 格式非法直接 404，不查库", func(t *testing.T) {
		db, mock := addMockDB(t)
		setup := newAddSetup(t, Dep{DB: db})

		for _, bad := range []string{"short", strings.Repeat("Z", 32), "../etc/passwd"} {
			status, _, body := setup.get(t, addPrefix+"/shared/"+url.PathEscape(bad))
			if status != http.StatusNotFound {
				t.Fatalf("token %q：status = %d, want 404（body=%v）", bad, status, body)
			}
			if code := addErrorCode(t, body); code != "NOT_FOUND" {
				t.Fatalf("token %q：error.code = %q, want NOT_FOUND", bad, code)
			}
		}
		// 一条期望都没装：只要真打了库，sqlmock 会报「was not expected」并把响应变成 502，
		// 上面的 404 断言随之失败。ExpectationsWereMet 兜底确认没有悬挂期望。
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("非法 token 不应触达数据库：%v", err)
		}
	})

	t.Run("读取：库中无记录（过期或不存在）返回 404", func(t *testing.T) {
		db, mock := addMockDB(t)
		setup := newAddSetup(t, Dep{DB: db})
		// 空结果集 → database/sql 返回 sql.ErrNoRows → lookup 返回 (nil,nil) → 404。
		mock.ExpectQuery(regexp.QuoteMeta(addSQLLookup)).
			WithArgs(strings.Repeat("a", 32), addClock.Unix()).
			WillReturnRows(sqlmock.NewRows([]string{"payload"}))

		status, _, body := setup.get(t, addPrefix+"/shared/"+strings.Repeat("a", 32))
		if status != http.StatusNotFound {
			t.Fatalf("status = %d, want 404（body=%v）", status, body)
		}
		if code := addErrorCode(t, body); code != "NOT_FOUND" {
			t.Fatalf("error.code = %q, want NOT_FOUND", code)
		}
	})

	t.Run("读取：快照损坏返回 502 CORRUPT", func(t *testing.T) {
		db, mock := addMockDB(t)
		setup := newAddSetup(t, Dep{DB: db})
		mock.ExpectQuery(regexp.QuoteMeta(addSQLLookup)).
			WithArgs(strings.Repeat("a", 32), addClock.Unix()).
			WillReturnRows(sqlmock.NewRows([]string{"payload"}).AddRow([]byte("not-json")))

		status, _, body := setup.get(t, addPrefix+"/shared/"+strings.Repeat("a", 32))
		if status != http.StatusBadGateway {
			t.Fatalf("status = %d, want 502", status)
		}
		if code := addErrorCode(t, body); code != "CORRUPT" {
			t.Fatalf("error.code = %q, want CORRUPT", code)
		}
	})

	t.Run("读取：限流触发 429", func(t *testing.T) {
		db, mock := addMockDB(t)
		setup := newAddSetup(t, Dep{DB: db, AllowRead: func(string) bool { return false }})

		status, _, body := setup.get(t, addPrefix+"/shared/"+strings.Repeat("a", 32))
		if status != http.StatusTooManyRequests {
			t.Fatalf("status = %d, want 429（body=%v）", status, body)
		}
		// 限流在查库之前：同样一条期望都没装。
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("限流分支不应触达数据库：%v", err)
		}
	})
}

func firstRunes(text string, limit int) string {
	runes := []rune(text)
	if len(runes) <= limit {
		return text
	}
	return string(runes[:limit])
}
