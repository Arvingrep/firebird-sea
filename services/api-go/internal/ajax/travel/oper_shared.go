// oper_shared.go 是 travel 批次4（#373）商家后台写 9 个 action 的共用设施：
// 会员门禁（登录 / userType / staff / verifyModuleAuth）、店铺门禁、语言包文案、
// PHP serialize（specialtime 的 json_decode → serialize 链）与 strToTime 子集。
package travel

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"io"
	"math"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax/member"
)

// phpFloatPrefixRe 匹配 PHP (float) 强转的数值前缀（含科学计数法、首尾空白）。
var phpFloatPrefixRe = regexp.MustCompile(`^[ \t\n\r\v\f]*[+-]?([0-9]+(\.[0-9]*)?|\.[0-9]+)([eE][+-]?[0-9]+)?`)

// phpFloatVal 对应 PHP 7.4 的 (float) 字符串强转：取数值前缀（"5abc"→5，"abc"→0，
// "1e3"→1000）。
func phpFloatVal(s string) float64 {
	m := phpFloatPrefixRe.FindString(s)
	if m == "" {
		return 0
	}
	m = strings.TrimLeft(m, " \t\n\r\v\f")
	f, err := strconv.ParseFloat(m, 64)
	if err != nil {
		return 0
	}
	return f
}

// phpFloatString 对应 PHP precision=14 的 (string)float（(float)1000 落 SQL 字面量
// 是 "1000"，0.5 → "0.5"）。极大/极小值的科学计数法形态（PHP "1.0E+21" vs Go
// "1E+21"）存在已知偏差，价格域不会出现。
func phpFloatString(f float64) string {
	return strconv.FormatFloat(f, 'G', 14, 64)
}

// —— 语言包运行时值（docker firebird-php zh-CN 包实测，#373 规则评论）——
const (
	infoOperLoginTimeout   = "登录超时，请重新登录！"            // siteConfig[20][262]
	infoOperUserTypeError  = "账号验证错误，操作失败"            // travel[12][22]
	infoOperAuthFail       = "商家权限验证失败"               // travel[12][14]
	infoOperAuthFailBang   = "商家权限验证失败！"              // verificationStaff / oper* 硬编码
	infoOperStoreEmpty     = "还未开通旅游店铺，请开通后再操作~"      // storeConfigModule
	infoOperNoStore        = "您还未开通婚嫁公司！"             // travel[12][28]
	infoOperStoreAudit     = "您的公司信息还在审核中，请通过审核后再发布！" // travel[12][29]
	infoOperStoreReject    = "您的公司信息审核失败，请通过审核后再发布！"  // travel[12][30]
	infoOperFormatError    = "格式错误"                   // travel[12][23]
	infoOperSaveFail       = "配置失败，请查检您输入的信息是否符合要求！"  // travel[12][20]
	infoOperDBFail         = "发布到数据时发生错误，请检查字段内容！"    // travel[12][34]
	infoOperModified       = "修改成功！"                  // travel[12][35]
	infoOperDeleted        = "删除成功！"                  // travel[12][36]
	infoOperNoPerm         = "权限不足，请确认帐户信息后再进行操作！"    // travel[12][37]
	infoOperNotFound       = "信息不存在，或已经删除！"           // travel[12][38]
	infoOperTitleEmpty     = "请输入标题"                  // travel[11][27]
	infoOperCoverEmpty     = "请上传封面"                  // travel[12][50]
	infoOperVideoEmpty     = "请上传视频"                  // travel[12][49]
	infoOperPriceEmpty     = "请输入价格"                  // travel[11][47]
	infoOperTicketListNeed = "请填写门票信息！"               // operTicket 硬编码
)

// oper 成功文案。
const (
	operStoreOKNew  = "配置成功，您的商铺正在审核中，请耐心等待！" // travel[12][19]
	operStoreOKSave = "保存成功！"                 // travel[12][21]
	operHotelOK     = "发布成功！"                 // operHotel add 硬编码
)

// memberInfoOfViewer 取当前登录会员的 getMemberInfo() 投影（member.detail 的 info）。
// 返回 (map, logged)：未登录（-1 / detail 未命中）→ ([], false)。
func (s *Service) memberInfoOfViewer(req *ajax.Request) (map[string]any, bool) {
	info := s.userInfoOf(req, "")
	switch x := info.(type) {
	case *member.Object: // member.detail 生产路径的返回形态（有序对象）
		return x.Map(), true
	case map[string]any:
		return x, true
	}
	return map[string]any{}, false
}

// infoInt 取 member.info 里的数值键（PHP 侧全是 int/数字字符串混合）。
func infoInt(m map[string]any, key string) int {
	switch v := m[key].(type) {
	case float64:
		return int(v)
	case int64:
		return int(v)
	case int:
		return v
	case string:
		return phpInt(v)
	}
	return 0
}

// infoAny 取键原值；缺键返回 nil。
func infoAny(m map[string]any, key string) any { return m[key] }

// verifyModuleAuthTravel 复刻 verifyModuleAuth(array("module"=>"travel"))
// （common.func.php:8678-8710）在当前部署的运行期结果：恒为 false。
//
// 依据：$cfg_BusinessJoinConfig 在 common.inc.php:1340 被注释（wmsj/inc/config.inc.php:67
// 亦记载此事）→ memberPackage 的 $businessJoinConfig 恒 falsy → package 恒空 →
// checkShowModule 的 $modules 恒空 → bind_module 恒空数组 → isset($showModule['travel'])
// 为假；module 也不在 business/huangye/integral/sfcar 免验清单里。
// 隐含分支：未登录（userid==-1）时 PHP 返回 null，`!null` 同样为真——调用方都先做了
// 登录检查，此差异不可达。
func verifyModuleAuthTravel() bool { return false }

// verificationStaffTravel 复刻 verificationStaff(array('module'=>'travel','type'=>t))
// （common.func.php:16578-16600）：is_staff==1 且 autharr['travel'] 数组松散包含 t 才
// true。autharr 来自 member.info（staff 表 auth 反序列化）；本地无 staff 数据 → 恒 false。
// userid<=-1 或 is_staff!=1 → PHP 走到函数末尾隐式返回 null → 调用方 `if(!...)` 等价拒。
func verificationStaffTravel(m map[string]any, typ string) bool {
	if infoInt(m, "is_staff") != 1 {
		return false
	}
	// autharr 由 member.detail 的 unserializeValue 产出：关联数组是 *member.Object，
	// 顺序数组是 []any，unserialize 失败是 false（truthy 检查天然排除）。
	switch arr := infoAny(m, "autharr").(type) {
	case *member.Object:
		if v, ok := arr.Get("travel"); ok {
			return phpInArrayLooseStr(v, typ)
		}
	case map[string]any:
		if v, ok := arr["travel"]; ok {
			return phpInArrayLooseStr(v, typ)
		}
	}
	return false
}

// phpInArrayLooseStr 复刻 in_array($type(string), $arr)（松散比较）。
func phpInArrayLooseStr(list any, needle string) bool {
	switch l := list.(type) {
	case []any:
		for _, v := range l {
			if looseEqAnyStr(v, needle) {
				return true
			}
		}
	case *member.Object:
		for _, v := range l.Map() {
			if looseEqAnyStr(v, needle) {
				return true
			}
		}
	case map[string]any:
		for _, v := range l {
			if looseEqAnyStr(v, needle) {
				return true
			}
		}
	}
	return false
}

// looseEqAnyStr 复刻 PHP 7.4 的 `元素 == needle(string)` 松散相等。
func looseEqAnyStr(v any, s string) bool {
	switch x := v.(type) {
	case string:
		return looseStrEqual(x, s)
	case int:
		return phpFloatVal(s) == float64(x)
	case int64:
		return phpFloatVal(s) == float64(x)
	case float64:
		return phpFloatVal(s) == x
	case bool: // bool 与字符串比较：字符串转 bool（""/"0" 为假）
		if x {
			return s != "" && s != "0"
		}
		return s == "" || s == "0"
	}
	return false
}

// operUserTypeGate 复刻 `if($userinfo['userType'] == 2 && !verifyModuleAuth(...) &&
// $userinfo['is_staff'] != 1) return 200 商家权限验证失败！`。
func operUserTypeGate(m map[string]any) bool {
	return infoInt(m, "userType") == 2 && !verifyModuleAuthTravel() && infoInt(m, "is_staff") != 1
}

// looseEqNumber 复刻 PHP 7.4 的「字符串 == 数字」：字符串转数字（前缀数值，"abc"→0）
// 后比较。运行时是 PHP 7.4（docker firebird-php 7.4.33），不是 PHP 8 的互转规则。
// 用于 del 路径的 `$results['userid'] == $userid`（DB 数值串 vs int）。
func looseEqNumber(s string, n int64) bool {
	return phpFloatVal(s) == float64(n)
}

// storeGate 复刻 oper* 系的店铺门禁：SELECT id,state FROM travel_store WHERE userid。
// 返回 (storeID, resp)。resp 非 nil 表示应直接返回该响应（含 DB 未配置降级 102）。
// state 与 '0'/'2' 用 PHP 松散比较口径（is_numeric 语义）。
func (s *Service) storeGate(ctx context.Context, userid int64) (int64, *ajax.Response) {
	if s.db == nil {
		return 0, &ajax.Response{State: stateNoData, Info: infoNoData}
	}
	var id, state sql.NullString
	err := s.db.QueryRowContext(ctx,
		"SELECT `id`, `state` FROM `"+s.prefix+"travel_store` WHERE `userid` = ?", userid).
		Scan(&id, &state)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, &ajax.Response{State: stateParamFailed, Info: infoOperNoStore} // [12][28]
		}
		// SQL 错误面：dsqlOper 错误串 truthy → 绕过 !$userResult →
		// $userResult[0]['state'] 取到 '{' → `== 0` 为真 → [12][29]。
		return 0, &ajax.Response{State: stateParamFailed, Info: infoOperStoreAudit}
	}
	if looseStrEqual(state.String, "0") {
		return 0, &ajax.Response{State: stateParamFailed, Info: infoOperStoreAudit}
	}
	if looseStrEqual(state.String, "2") {
		return 0, &ajax.Response{State: stateParamFailed, Info: infoOperStoreReject}
	}
	return int64(phpInt(id.String)), nil
}

// getMkTime 复刻 GetMkTime 的返回值形态（webroot/include/class/time.class.php:49-90）：
//   - 纯数字（preg_match("/[^0-9]/") 不命中，含空串）原样返回字符串——PHP 直接
//     return $dtime，"00"/"0001" 不是 empty（empty 只认 ""/"0"/0），'00' 落列才转 0；
//   - 其余先做 中文单位/分隔符归一（日秒\r\n\t→空格、年→-、月→-、时:分→:），
//     再按「date time」拆分、date 按 -（缺省 .）拆 ymd、time 按 : 拆 hms，
//     缺省 [1970,1,1,0,0,0]，两位年补 20 前缀，各段剥前导零；
//   - mktime 语义（PHP 的 0-69→2000+/70-99→19xx 年映射、越界分量进位）用
//     time.Date 归一化等价实现；结果为 0（empty(0)）→ time()。
func getMkTime(dtime string) string {
	if pureDigitRe.MatchString(dtime) {
		return dtime // PHP return $dtime（含 "00"、""、超大数字串）
	}
	return strconv.FormatInt(getMkTimeCalc(dtime), 10)
}

// getMkTimeCalc 是 getMkTime 的非纯数字路径（mktime 语义），见 getMkTime。
func getMkTimeCalc(dtime string) int64 {
	dtime = strings.TrimSpace(dtime)
	for _, r := range "\r\n\t日秒" {
		dtime = strings.ReplaceAll(dtime, string(r), " ")
	}
	dtime = strings.ReplaceAll(dtime, "年", "-")
	dtime = strings.ReplaceAll(dtime, "月", "-")
	dtime = strings.ReplaceAll(dtime, "时", ":")
	dtime = strings.ReplaceAll(dtime, "分", ":")
	dtime = strings.TrimSpace(spaceCollapseRe.ReplaceAllString(dtime, " "))

	dt := [6]int64{0, 1, 1, 0, 0, 0} // 年由 token（含空覆盖）+ mktime 映射决定
	ds := strings.Split(dtime, " ")
	ymd := strings.Split(ds[0], "-")
	if len(ymd) < 2 {
		ymd = strings.Split(ds[0], ".")
	}
	// 年份：先按 PHP `strlen($dt[0])==2 → '20'.$dt[0]` 补前缀（在 mktime 映射之前，
	// "70" → 2070 而非 1970），再 (int) 化。空 token 覆盖默认 1970（PHP isset($ymd[0])）。
	yearToken := ""
	if len(ymd) > 0 {
		yearToken = ymd[0]
	}
	if len(yearToken) == 2 {
		yearToken = "20" + yearToken
	}
	dt[0] = phpInt64(yearToken)
	if len(ymd) > 1 {
		dt[1] = phpInt64(ymd[1])
	}
	if len(ymd) > 2 {
		dt[2] = phpInt64(ymd[2])
	}
	if len(ds) > 1 {
		hms := strings.Split(ds[1], ":")
		if len(hms) > 0 {
			dt[3] = phpInt64(hms[0])
		}
		if len(hms) > 1 {
			dt[4] = phpInt64(hms[1])
		}
		if len(hms) > 2 {
			dt[5] = phpInt64(hms[2])
		}
	}
	// mktime 的年份映射（0-69 → 2000+，70-99 → 19xx）。
	y := dt[0]
	if y >= 0 && y <= 69 {
		y += 2000
	} else if y >= 70 && y <= 99 {
		y += 1900
	}
	// time.Date 对越界分量（月 0/13、日 0 等）的进位归一与 mktime 一致。
	mt := time.Date(int(y), time.Month(dt[1]), int(dt[2]), int(dt[3]), int(dt[4]), int(dt[5]), 0, gmt8).Unix()
	if mt == 0 {
		return time.Now().Unix()
	}
	return mt
}

var pureDigitRe = regexp.MustCompile(`^[0-9]*$`)
var spaceCollapseRe = regexp.MustCompile(` {1,}`)

// phpInt64 对应 PHP (int) 字符串强转（前缀数值）。
func phpInt64(s string) int64 {
	return int64(phpInt(s))
}

// phpSerializeValue 复刻 PHP serialize()（json_decode 后的值域）：
//   - null → "N;"；bool → "b:0;"/"b:1;"；int → "i:N;"；
//   - float → "d:X"（serialize_precision=-1 的最短表示：整数值浮点去 .0）；
//   - string → "s:len:"...""（len 为字节数）；
//   - 数组（[]any = list，*omap / map[string]any = assoc）→ "a:N:{key;value;...}"。
//
// specialtime 的链路是 stripslashes → json_decode → serialize；json_decode 失败为
// null → "N;"。键类型：list 下标 i:N:，assoc 字符串键 s:len:""。
func phpSerializeValue(v any) string {
	switch x := v.(type) {
	case nil:
		return "N;"
	case bool:
		if x {
			return "b:1;"
		}
		return "b:0;"
	case int:
		return "i:" + strconv.Itoa(x) + ";"
	case int64:
		return "i:" + strconv.FormatInt(x, 10) + ";"
	case float64:
		return "d:" + phpSerializeDouble(x) + ";"
	case string:
		return phpSerializeString(x)
	case []any:
		var b strings.Builder
		b.WriteString("a:" + strconv.Itoa(len(x)) + ":{")
		for i, item := range x {
			b.WriteString("i:" + strconv.Itoa(i) + ";")
			b.WriteString(phpSerializeValue(item))
		}
		b.WriteString("}")
		return b.String()
	case *omap:
		// assoc 数组按 JSON 序输出（omap 保持插入序）；键按 PHP 数组键规则：
		// 规范整数字符串（无前导零、int64 域内）转 int 键输出 i:N。
		var b strings.Builder
		b.WriteString("a:" + strconv.Itoa(len(x.vals)) + ":{")
		for _, k := range x.keys {
			b.WriteString(phpSerializeKey(k))
			b.WriteString(phpSerializeValue(x.vals[k]))
		}
		b.WriteString("}")
		return b.String()
	case map[string]any:
		// map 无序，按键字典序输出（兜底口径；JSON 路径已改走 omap）。
		keys := make([]string, 0, len(x))
		for k := range x {
			keys = append(keys, k)
		}
		sort.Strings(keys)
		var b strings.Builder
		b.WriteString("a:" + strconv.Itoa(len(x)) + ":{")
		for _, k := range keys {
			b.WriteString(phpSerializeKey(k))
			b.WriteString(phpSerializeValue(x[k]))
		}
		b.WriteString("}")
		return b.String()
	default:
		return "N;"
	}
}

// dsqlOperErrorFace 是 dsqlOper 异常时返回的错误串（cfg_siteDebug=false 的形态，
// dsql.class.php:1144-1147）。拼进 SQL 即产生非法语句。
const dsqlOperErrorFace = `{"state": 200, "info": "操作失败！"}`

// phpNumListValid 检查逗号 join 的 NOT IN 列表每段是否构成 MySQL 可接受的
// 数值表达式（PHP 裸拼语义：3、3.5、3+0、(3+0)*2 等合法照删；错误串/引号/字母
// 混入即整条 SQL 报错 → dsqlOper 吞错、不删行、流程继续）。
func phpNumListValid(joined string) bool {
	for _, part := range strings.Split(joined, ",") {
		if !mysqlNumericExpr(part) {
			return false
		}
	}
	return true
}

// mysqlNumericExpr 校验单段是否构成 MySQL 数值表达式：十进制/科学计数数字面量、
// 一元 +/-、二元 + - * / %、括号嵌套，空白可忽略。这是 PHP 把 $notid 逐段裸拼进
// SQL（travel.class.php:2206-2208）后「能执行不报错」的白名单。
// 「合法但恶意」的形态（OR、子查询、引号逃逸等）不通过——与 PHP 的差异仅限该类
// 请求可控的注入输入，作为已知偏差记录在 #355（Go 侧不复现真正的 SQL 注入面）。
func mysqlNumericExpr(s string) bool {
	_, _, ok := mysqlExprParse(s, false)
	return ok
}

// mysqlNumericExprValue 在 mysqlNumericExpr 语法内求值，用于把裸拼的元素 id 字面量
// 等价成绑定值：MySQL 对 `WHERE id = <expr>` / `VALUES (<expr>)` 的数值语义与绑定
// float64 一致（3+0→3、.5e1→5、3.5→无行命中/列舍入）。除以 0 在 MySQL 得 NULL
// （比较永不命中、NOT IN 全不匹配），等价于跳过执行，故返回 !ok。
func mysqlNumericExprValue(s string) (float64, bool) {
	v, divZero, ok := mysqlExprParse(s, true)
	if divZero {
		return 0, false
	}
	return v, ok
}

// mysqlExprParse 递归下降解析；wantValue=true 时同步求值。divZero 单独上报：
// 合法性判定下 3/0 是合法 SQL（执行后语义为 NULL），求值判定下视为不命中。
func mysqlExprParse(s string, wantValue bool) (val float64, divZero, ok bool) {
	var p int
	skip := func() {
		for p < len(s) && (s[p] == ' ' || s[p] == '\t' || s[p] == '\n' || s[p] == '\r') {
			p++
		}
	}
	var expr, term func() (float64, bool)
	number := func() (float64, bool) {
		start := p
		digits := func() bool {
			n := 0
			for p < len(s) && s[p] >= '0' && s[p] <= '9' {
				p++
				n++
			}
			return n > 0
		}
		exponent := func() bool { // 两种小数形态之后都可带指数（.5e1、3e0）
			if p < len(s) && (s[p] == 'e' || s[p] == 'E') {
				p++
				if p < len(s) && (s[p] == '+' || s[p] == '-') {
					p++
				}
				if !digits() {
					return false
				}
			}
			return true
		}
		if p < len(s) && s[p] == '.' { // 前导点：.5、.5e1
			p++
			if !digits() {
				return 0, false
			}
			if !exponent() {
				return 0, false
			}
		} else { // 常规：3、3.、3.5、3e0、3.5e-2
			if !digits() {
				return 0, false
			}
			if p < len(s) && s[p] == '.' {
				p++
				digits() // 小数位可空（"3."）
			}
			if !exponent() {
				return 0, false
			}
		}
		if !wantValue {
			return 0, true
		}
		f, err := strconv.ParseFloat(strings.TrimSpace(s[start:p]), 64)
		if err != nil || math.IsNaN(f) || math.IsInf(f, 0) {
			return 0, false
		}
		return f, true
	}
	term = func() (float64, bool) {
		skip()
		if p < len(s) && s[p] == '(' {
			p++
			v, ok2 := expr()
			if !ok2 {
				return 0, false
			}
			skip()
			if p >= len(s) || s[p] != ')' {
				return 0, false
			}
			p++
			return v, true
		}
		if p < len(s) && (s[p] == '+' || s[p] == '-') { // 一元符号
			op := s[p]
			p++
			v, ok2 := term()
			if !ok2 {
				return 0, false
			}
			if op == '-' {
				v = -v
			}
			return v, true
		}
		return number()
	}
	expr = func() (float64, bool) {
		v, ok2 := term()
		if !ok2 {
			return 0, false
		}
		skip()
		for p < len(s) && (s[p] == '+' || s[p] == '-' || s[p] == '*' || s[p] == '/' || s[p] == '%') {
			op := s[p]
			p++
			r, ok3 := term()
			if !ok3 {
				return 0, false
			}
			if wantValue {
				switch op {
				case '+':
					v += r
				case '-':
					v -= r
				case '*':
					v *= r
				case '/':
					if r == 0 {
						divZero = true
					} else {
						v /= r
					}
				case '%':
					if r == 0 {
						divZero = true
					} else {
						v = math.Mod(v, r)
					}
				}
			}
			skip()
		}
		return v, true
	}
	v, ok2 := expr()
	if !ok2 {
		return 0, divZero, false
	}
	skip()
	if p != len(s) {
		return 0, divZero, false
	}
	return v, divZero, true
}

// phpIntKeyRe 是 PHP 数组的规范整数字符串键（"0"、"-5"、"123"；前导零/"+" 不算）。
var phpIntKeyRe = regexp.MustCompile(`^(0|-?[1-9][0-9]*)$`)

// phpSerializeKey 对应 PHP 数组键的整数字符串自动转换：serialize 时 "1" → i:1;。
func phpSerializeKey(k string) string {
	if phpIntKeyRe.MatchString(k) {
		if n, err := strconv.ParseInt(k, 10, 64); err == nil {
			return "i:" + strconv.FormatInt(n, 10) + ";"
		}
	}
	return phpSerializeString(k)
}

// phpSerializeDouble 复刻 serialize_precision=-1 下 PHP 8 的浮点序列化：用最短
// 可回读表示（Go strconv 'g' -1 与之等价）；整值（99.0）输出 "99"。
func phpSerializeDouble(f float64) string {
	s := strconv.FormatFloat(f, 'g', -1, 64)
	// PHP 对 INF/NaN 输出大写（JSON 域不会出现，兜底）。
	return s
}

// phpSerializeString 复刻 serialize() 的字符串片段（member 同名实现口径一致）。
func phpSerializeString(v string) string {
	return "s:" + strconv.Itoa(len(v)) + ":\"" + v + "\";"
}

// jsonDecodeList 复刻 json_decode($param, true)：
//   - JSON 数字保留字面量形态——无 . / e 的 token 落 int64（serialize 出 i:N），
//     带 . / e 的落 float64（d:X），与 PHP 的 int/float 分流一致；
//   - 对象解码成 *omap（保持插入序，PHP 关联数组的键序即插入序）；
//   - 解析失败或尾部有多余内容 → nil（PHP 的 null）。
func jsonDecodeList(raw string) any {
	if strings.TrimSpace(raw) == "" {
		return nil
	}
	dec := json.NewDecoder(strings.NewReader(raw))
	dec.UseNumber() // 数字先落 json.Number，再按 int/float 字面量分流
	v, err := decodeJSONOrdered(dec)
	if err != nil {
		return nil
	}
	if _, err := dec.Token(); !errors.Is(err, io.EOF) {
		return nil // PHP json_decode：尾部垃圾 → null
	}
	return v
}

// decodeJSONOrdered 按 token 流解码，保留对象键序。
func decodeJSONOrdered(dec *json.Decoder) (any, error) {
	t, err := dec.Token()
	if err != nil {
		return nil, err
	}
	switch tok := t.(type) {
	case json.Delim:
		if tok == '{' {
			m := newOmap()
			for dec.More() {
				kt, err := dec.Token()
				if err != nil {
					return nil, err
				}
				k, ok := kt.(string)
				if !ok {
					return nil, errors.New("json: object key is not a string")
				}
				vv, err := decodeJSONOrdered(dec)
				if err != nil {
					return nil, err
				}
				m.set(k, vv)
			}
			if _, err := dec.Token(); err != nil { // '}'
				return nil, err
			}
			return m, nil
		}
		if tok == '[' {
			arr := []any{}
			for dec.More() {
				vv, err := decodeJSONOrdered(dec)
				if err != nil {
					return nil, err
				}
				arr = append(arr, vv)
			}
			if _, err := dec.Token(); err != nil { // ']'
				return nil, err
			}
			return arr, nil
		}
		return nil, errors.New("json: unexpected delim")
	case json.Number:
		if !strings.ContainsAny(tok.String(), ".eE") {
			if n, err := strconv.ParseInt(tok.String(), 10, 64); err == nil {
				return n, nil
			}
		}
		f, _ := tok.Float64()
		return f, nil
	default:
		return t, nil // string / bool / nil
	}
}

// valMapOf 把 json_decode 出的元素值取成键值视图（map / *omap 皆可）。
func valMapOf(v any) (map[string]any, bool) {
	switch x := v.(type) {
	case map[string]any:
		return x, true
	case *omap:
		return x.vals, true
	}
	return nil, false
}

// phpItem 是 foreach 迭代的一项：key 为 PHP 数组键的字符串形态（数值键也是）。
type phpItem struct {
	key string
	val any
}

// phpForeachItems 把 json_decode 出的数组展开成 foreach 序列：list 的 key 是下标；
// assoc（*omap）按插入序给出原始键；map 无序兜底（按键字典序，仅测试域）。
func phpForeachItems(v any) []phpItem {
	switch x := v.(type) {
	case []any:
		out := make([]phpItem, len(x))
		for i, item := range x {
			out[i] = phpItem{key: strconv.Itoa(i), val: item}
		}
		return out
	case *omap:
		out := make([]phpItem, 0, len(x.keys))
		for _, k := range x.keys {
			out = append(out, phpItem{key: k, val: x.vals[k]})
		}
		return out
	case map[string]any:
		keys := make([]string, 0, len(x))
		for k := range x {
			keys = append(keys, k)
		}
		sort.Strings(keys)
		out := make([]phpItem, 0, len(keys))
		for _, k := range keys {
			out = append(out, phpItem{key: k, val: x[k]})
		}
		return out
	}
	return nil
}

// phpArrayReverse 复刻 array_reverse($arr)（preserve_keys=false）：顺序反转；
// 数值键重排成新的连续下标，字符串键原样保留（PHP 数组键语义）。
func phpArrayReverse(items []phpItem) []phpItem {
	out := make([]phpItem, 0, len(items))
	counter := 0
	for i := len(items) - 1; i >= 0; i-- {
		if isPhpIntKey(items[i].key) { // 范围感知：int64 域外的数字串是字符串键
			out = append(out, phpItem{key: strconv.Itoa(counter), val: items[i].val})
			counter++
		} else {
			out = append(out, items[i])
		}
	}
	return out
}

// isPhpIntKey 是 PHP 数组整数键判定：规范整数字符串且落在 int64 域内
// （PHP int 是 64 位；域外数字串保留字符串键）。
func isPhpIntKey(k string) bool {
	if !phpIntKeyRe.MatchString(k) {
		return false
	}
	_, err := strconv.ParseInt(k, 10, 64)
	return err == nil
}

// itemStr 取 json_decode 关联项里的字符串/数值键值（PHP 数组取值隐式转串）。
func itemStr(m map[string]any, key string) string {
	switch v := m[key].(type) {
	case nil:
		return ""
	case string:
		return v
	case int64:
		return strconv.FormatInt(v, 10)
	case int:
		return strconv.Itoa(v)
	case float64:
		if v == float64(int64(v)) {
			return strconv.FormatInt(int64(v), 10)
		}
		return phpFloatString(v)
	case bool:
		if v {
			return "1"
		}
		return ""
	}
	return ""
}
