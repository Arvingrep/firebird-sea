package member

import (
	"testing"

	sqlmock "github.com/DATA-DOG/go-sqlmock"
)

// 迁移自 member.class.php:5738-5819 的 collect（#256）。
// SQL 用 QueryMatcherEqual 全串匹配；member_log 的去重查询与写入逐条断言。

const (
	qCollectCount  = "SELECT COUNT(*) FROM `huoniao_member_collect` WHERE `module` = ? AND `action` = ? AND `aid` = ? AND `userid` = ?"
	qCollectInsert = "INSERT INTO `huoniao_member_collect` (`module`, `action`, `aid`, `userid`, `pubdate`) VALUES (?, ?, ?, ?, ?)"
	qCollectDelete = "DELETE FROM `huoniao_member_collect` WHERE `module` = ? AND `action` = ? AND `aid` = ? AND `userid` = ?"

	noDataBody = `{"state":102,"info":"No data!"}`
)

// expectCollectLog 期待一次 memberLog 调用（去重查询 + 写入）；param 列不参与断言，放 AnyArg。
func expectCollectLog(m sqlmock.Sqlmock, uid string, seen int, action, note, sqlText string) {
	m.ExpectQuery(qLogCount).
		WithArgs(md5Hex(note), uid, testLogIP, followNow).
		WillReturnRows(count(seen))
	if seen > 0 {
		return
	}
	m.ExpectExec(qLogInsert).
		WithArgs(uid, "member", "collect", int64(0), action, argEq(note), "", testLogIP, "", "",
			argEq(sqlText), followNow, md5Hex(note), testLogURL, sqlmock.AnyArg(), "").
		WillReturnResult(sqlmock.NewResult(1, 1))
}

func collectInsertSQL(module, temp, aid, uid string) string {
	return "INSERT INTO `huoniao_member_collect` (`module`, `action`, `aid`, `userid`, `pubdate`) VALUES ('" +
		module + "', '" + temp + "', '" + aid + "', '" + uid + "', 1700000000)"
}

func collectDeleteSQL(module, temp, aid, uid string) string {
	return "DELETE FROM `huoniao_member_collect` WHERE `module` = '" + module + "' AND `action` = '" + temp +
		"' AND `aid` = '" + aid + "' AND `userid` = '" + uid + "'"
}

// 总门禁四项任一不满足 → 空返回 → 102，且完全不碰数据库。
func TestCollectGateFails(t *testing.T) {
	for _, q := range []string{
		"&temp=detail&id=9&type=add",                   // 缺 module
		"&module=0&temp=detail&id=9&type=add",          // module=0 是 empty
		"&module=article&id=9&type=add",                // 缺 temp
		"&module=article&temp=0&id=9&type=add",         // temp=0
		"&module=article&temp=detail&type=add",         // 缺 id
		"&module=article&temp=detail&id=0&type=add",    // id 归一成空串
		"&module=article&temp=detail&id=abc&type=add",  // id=abc → (int) 为 0
		"&module=article&temp=detail&id=9",             // 缺 type（单条分支落到末尾）
		"&module=article&temp=detail&id=9&type=update", // 无效 type
	} {
		svc, m := newFollowService(t, fakeIdentity(7))
		got := do(t, svc, "GET", "/include/ajax.php?service=member&action=collect"+q, "")
		eq(t, got, noDataBody)
		met(t, m)
	}
}

// 未登录（getMemberID 为 -1）→ 同样是 102，不是 101：collect 没有登录错误文案。
func TestCollectAnonymous(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(-1))
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=collect&module=article&temp=detail&id=9&type=add", "")
	eq(t, got, noDataBody)
	met(t, m)
}

// 单条 add：未收藏 → INSERT + memberLog(insert)，note 带自增 id。
func TestCollectSingleAdd(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qCollectCount).WithArgs("article", "detail", "9", "7").WillReturnRows(count(0))
	m.ExpectExec(qCollectInsert).WithArgs("article", "detail", "9", "7", followNow).
		WillReturnResult(sqlmock.NewResult(42, 1))
	expectCollectLog(m, "7", 0, "insert", "添加收藏信息(42=>article=>detail=>9)",
		collectInsertSQL("article", "detail", "9", "7"))
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=collect&module=article&temp=detail&id=9&type=add", "")
	eq(t, got, okBody)
	met(t, m)
}

// 单条 add：已收藏 → "has"，不写库也不写日志。
func TestCollectSingleAddExisting(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qCollectCount).WithArgs("article", "detail", "9", "7").WillReturnRows(count(1))
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=collect&module=article&temp=detail&id=9&type=add", "")
	eq(t, got, `{"state":100,"info":"has"}`)
	met(t, m)
}

// 单条 add：未收藏且 check=1 → "no"，不写库。
func TestCollectSingleAddCheckNo(t *testing.T) {
	for _, check := range []string{"1", "01", "1abc"} { // PHP 松散比较，'1abc' == 1 也为真
		svc, m := newFollowService(t, fakeIdentity(7))
		m.ExpectQuery(qCollectCount).WithArgs("article", "detail", "9", "7").WillReturnRows(count(0))
		got := do(t, svc, "GET", "/include/ajax.php?service=member&action=collect&module=article&temp=detail&id=9&type=add&check="+check, "")
		eq(t, got, `{"state":100,"info":"no"}`)
		met(t, m)
	}
}

// check 不是 1（abc / 1.5 / 缺省）不影响写入。
func TestCollectSingleAddCheckIgnored(t *testing.T) {
	for _, check := range []string{"abc", "1.5", "0"} {
		svc, m := newFollowService(t, fakeIdentity(7))
		m.ExpectQuery(qCollectCount).WithArgs("article", "detail", "9", "7").WillReturnRows(count(0))
		m.ExpectExec(qCollectInsert).WithArgs("article", "detail", "9", "7", followNow).
			WillReturnResult(sqlmock.NewResult(1, 1))
		expectCollectLog(m, "7", 0, "insert", "添加收藏信息(1=>article=>detail=>9)",
			collectInsertSQL("article", "detail", "9", "7"))
		got := do(t, svc, "GET", "/include/ajax.php?service=member&action=collect&module=article&temp=detail&id=9&type=add&check="+check, "")
		eq(t, got, okBody)
		met(t, m)
	}
}

// 单条 del：不判存在、删 0 行也写日志，恒 "ok"。
func TestCollectSingleDelete(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectExec(qCollectDelete).WithArgs("article", "detail", "9", "7").WillReturnResult(sqlmock.NewResult(0, 0))
	expectCollectLog(m, "7", 0, "delete", "删除收藏信息(article=>detail=>9)",
		collectDeleteSQL("article", "detail", "9", "7"))
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=collect&module=article&temp=detail&id=9&type=del", "")
	eq(t, got, okBody)
	met(t, m)
}

// 多条 add：逐段先查后插，已收藏的那段静默跳过（不写日志）。
func TestCollectMultiAdd(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qCollectCount).WithArgs("article", "detail", "1", "7").WillReturnRows(count(1))
	m.ExpectQuery(qCollectCount).WithArgs("article", "detail", "3", "7").WillReturnRows(count(0))
	m.ExpectExec(qCollectInsert).WithArgs("article", "detail", "3", "7", followNow).
		WillReturnResult(sqlmock.NewResult(7, 1))
	expectCollectLog(m, "7", 0, "insert", "添加收藏信息(7=>article=>detail=>3)",
		collectInsertSQL("article", "detail", "3", "7"))
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=collect&module=article&temp=detail&id=1,3&type=add", "")
	eq(t, got, okBody)
	met(t, m)
}

// 多条 del：每段都 DELETE 且都写日志。
func TestCollectMultiDelete(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectExec(qCollectDelete).WithArgs("article", "detail", "1", "7").WillReturnResult(sqlmock.NewResult(0, 1))
	expectCollectLog(m, "7", 0, "delete", "删除收藏信息(article=>detail=>1)",
		collectDeleteSQL("article", "detail", "1", "7"))
	m.ExpectExec(qCollectDelete).WithArgs("article", "detail", "3", "7").WillReturnResult(sqlmock.NewResult(0, 1))
	expectCollectLog(m, "7", 0, "delete", "删除收藏信息(article=>detail=>3)",
		collectDeleteSQL("article", "detail", "3", "7"))
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=collect&module=article&temp=detail&id=1,3&type=del", "")
	eq(t, got, okBody)
	met(t, m)
}

// 多条分支的无效 type：循环空转，仍返回 "ok"（与单条分支 102 不同）。
func TestCollectMultiInvalidType(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=collect&module=article&temp=detail&id=1,3&type=update", "")
	eq(t, got, okBody)
	met(t, m)
}

// 多条分支的 check 被完全忽略：check=1 也照常写入（单条分支同一参数会返回 "no"）。
func TestCollectMultiCheckIgnored(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qCollectCount).WithArgs("article", "detail", "1", "7").WillReturnRows(count(0))
	m.ExpectExec(qCollectInsert).WithArgs("article", "detail", "1", "7", followNow).
		WillReturnResult(sqlmock.NewResult(1, 1))
	expectCollectLog(m, "7", 0, "insert", "添加收藏信息(1=>article=>detail=>1)",
		collectInsertSQL("article", "detail", "1", "7"))
	m.ExpectQuery(qCollectCount).WithArgs("article", "detail", "2", "7").WillReturnRows(count(0))
	m.ExpectExec(qCollectInsert).WithArgs("article", "detail", "2", "7", followNow).
		WillReturnResult(sqlmock.NewResult(2, 1))
	expectCollectLog(m, "7", 0, "insert", "添加收藏信息(2=>article=>detail=>2)",
		collectInsertSQL("article", "detail", "2", "7"))
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=collect&module=article&temp=detail&id=1,2&type=add&check=1", "")
	eq(t, got, okBody)
	met(t, m)
}

// id[]=1&id[]=3 走数组分支，拼成 "1,3" 后不是空串，进多条分支。
func TestCollectArrayID(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qCollectCount).WithArgs("article", "detail", "1", "7").WillReturnRows(count(0))
	m.ExpectExec(qCollectInsert).WithArgs("article", "detail", "1", "7", followNow).
		WillReturnResult(sqlmock.NewResult(1, 1))
	expectCollectLog(m, "7", 0, "insert", "添加收藏信息(1=>article=>detail=>1)",
		collectInsertSQL("article", "detail", "1", "7"))
	m.ExpectQuery(qCollectCount).WithArgs("article", "detail", "3", "7").WillReturnRows(count(0))
	m.ExpectExec(qCollectInsert).WithArgs("article", "detail", "3", "7", followNow).
		WillReturnResult(sqlmock.NewResult(2, 1))
	expectCollectLog(m, "7", 0, "insert", "添加收藏信息(2=>article=>detail=>3)",
		collectInsertSQL("article", "detail", "3", "7"))
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=collect&module=article&temp=detail&id%5B%5D=1&id%5B%5D=3&type=add", "")
	eq(t, got, okBody)
	met(t, m)
}

// id="1," 经 convertArrToStrWithComma 归一成 "1,0"：空段变成 aid=0，照搬 PHP（不跳过空段）。
func TestCollectTrailingComma(t *testing.T) {
	svc, m := newFollowService(t, fakeIdentity(7))
	m.ExpectQuery(qCollectCount).WithArgs("article", "detail", "1", "7").WillReturnRows(count(0))
	m.ExpectExec(qCollectInsert).WithArgs("article", "detail", "1", "7", followNow).
		WillReturnResult(sqlmock.NewResult(1, 1))
	expectCollectLog(m, "7", 0, "insert", "添加收藏信息(1=>article=>detail=>1)",
		collectInsertSQL("article", "detail", "1", "7"))
	m.ExpectQuery(qCollectCount).WithArgs("article", "detail", "0", "7").WillReturnRows(count(0))
	m.ExpectExec(qCollectInsert).WithArgs("article", "detail", "0", "7", followNow).
		WillReturnResult(sqlmock.NewResult(2, 1))
	expectCollectLog(m, "7", 0, "insert", "添加收藏信息(2=>article=>detail=>0)",
		collectInsertSQL("article", "detail", "0", "7"))
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=collect&module=article&temp=detail&id=1,&type=add", "")
	eq(t, got, okBody)
	met(t, m)
}

// 未接数据库时，参数与登录校验之后按「查不到数据」降级，不 panic。
func TestCollectNoDatabase(t *testing.T) {
	svc, err := New(Dep{TablePrefix: "huoniao_", Identity: fakeIdentity(7)})
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	got := do(t, svc, "GET", "/include/ajax.php?service=member&action=collect&module=article&temp=detail&id=9&type=add", "")
	eq(t, got, noDataBody)
}
