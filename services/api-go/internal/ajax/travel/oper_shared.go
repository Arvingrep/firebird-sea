// oper_shared.go 是 travel 批次4（#373）商家后台写 9 个 action 的共用设施：
// 会员门禁（登录 / userType / staff / verifyModuleAuth）、店铺门禁、语言包文案、
// PHP serialize（specialtime 的 json_decode → serialize 链）与 strToTime 子集。
package travel

import (
	"context"
	"database/sql"
	"encoding/json"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
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
	m, ok := info.(map[string]any)
	if !ok {
		return map[string]any{}, false
	}
	return m, true
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
	autharr, ok := infoAny(m, "autharr").(map[string]any)
	if !ok {
		return false
	}
	list, ok := autharr["travel"].([]any)
	if !ok {
		return false
	}
	for _, v := range list {
		switch x := v.(type) {
		case string:
			if x == typ {
				return true
			}
		case float64:
			if strconv.Itoa(int(x)) == typ {
				return true
			}
		}
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
		return 0, &ajax.Response{State: stateParamFailed, Info: infoOperNoStore}
	}
	if looseStrEqual(state.String, "0") {
		return 0, &ajax.Response{State: stateParamFailed, Info: infoOperStoreAudit}
	}
	if looseStrEqual(state.String, "2") {
		return 0, &ajax.Response{State: stateParamFailed, Info: infoOperStoreReject}
	}
	return int64(phpInt(id.String)), nil
}

// strToTime 是 strtotime() 对常见日期格式的子集实现（应用时区 UTC+8）；失败返回 0
// （PHP 的 false 拼进 SQL 后等价 0，empty 检查同样命中）。口径同 member/reward.go。
func strToTime(v string) int64 {
	v = strings.TrimSpace(v)
	for _, layout := range []string{
		"2006-01-02 15:04:05", "2006-01-02 15:04", "2006-1-2 15:04:05", "2006-1-2", "2006-01-02",
		"2006/01/02 15:04:05", "2006/1/2", "2006/01/02", "2006-01", "2006-1", "2006/01", "2006/1",
		"20060102", "2006年1月2日", "2006年1月",
	} {
		if t, err := time.ParseInLocation(layout, v, gmt8); err == nil {
			return t.Unix()
		}
	}
	return 0
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
		// assoc 数组按 JSON 序输出（omap 保持插入序）。
		var b strings.Builder
		b.WriteString("a:" + strconv.Itoa(len(x.vals)) + ":{")
		for _, k := range x.keys {
			b.WriteString(phpSerializeString(k))
			b.WriteString(phpSerializeValue(x.vals[k]))
		}
		b.WriteString("}")
		return b.String()
	case map[string]any:
		// map 无序，按键字典序输出（与 PHP 侧 ksort 的可重复口径一致）。
		keys := make([]string, 0, len(x))
		for k := range x {
			keys = append(keys, k)
		}
		sort.Strings(keys)
		var b strings.Builder
		b.WriteString("a:" + strconv.Itoa(len(x)) + ":{")
		for _, k := range keys {
			b.WriteString(phpSerializeString(k))
			b.WriteString(phpSerializeValue(x[k]))
		}
		b.WriteString("}")
		return b.String()
	default:
		return "N;"
	}
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

// jsonDecodeList 复刻 json_decode($param, true)：JSON 数字保留字面量形态——无 . /
// e 的 token 落 int64（serialize 出 i:N），带 . / e 的落 float64（d:X），与 PHP 的
// int/float 分流一致。解析失败 → nil（PHP 的 null）。
func jsonDecodeList(raw string) any {
	if strings.TrimSpace(raw) == "" {
		return nil
	}
	dec := json.NewDecoder(strings.NewReader(raw))
	dec.UseNumber()
	var v any
	if err := dec.Decode(&v); err != nil {
		return nil
	}
	return phpJSONNumber(v)
}

// phpJSONNumber 把 json.Number 落成 int64 / float64（其余递归处理数组/对象）。
func phpJSONNumber(v any) any {
	switch x := v.(type) {
	case json.Number:
		if !strings.ContainsAny(x.String(), ".eE") {
			if n, err := strconv.ParseInt(x.String(), 10, 64); err == nil {
				return n
			}
		}
		f, _ := x.Float64()
		return f
	case []any:
		for i := range x {
			x[i] = phpJSONNumber(x[i])
		}
		return x
	case map[string]any:
		for k := range x {
			x[k] = phpJSONNumber(x[k])
		}
		return x
	}
	return v
}

// assocOf 把 json_decode 出的关联数组统一成 map（list → nil）。
func assocOf(v any) map[string]any {
	switch x := v.(type) {
	case map[string]any:
		return x
	case *omap:
		return x.vals
	}
	return nil
}

// listOf 把 json_decode 出的数组统一成 []any（assoc → nil，照 PHP foreach 语义）。
func listOf(v any) []any {
	if a, ok := v.([]any); ok {
		return a
	}
	return nil
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
