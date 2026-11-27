// member.pay 是「按 ordertype 分发」的路由器，不是支付逻辑本身。
//
// PHP 原文 webroot/api/handlers/member.class.php:10363-10401：
//
//	$param     = $this->param;
//	$ordertype = isset($param['ordertype']) ? $param['ordertype'] : '';
//	$ordernum  = $param['ordernum'];
//	if (empty($ordertype) && $ordernum) {                       // ① 回查 pay_log
//	    $bodyArr = unserialize(SELECT body FROM pay_log WHERE ordernum = '$ordernum');
//	    if ($bodyArr && is_array($bodyArr)) {
//	        $ordertype = $bodyArr['type'];
//	        $this->param = array_merge($param, $bodyArr);        // body 覆盖同名请求参数
//	    }
//	}
//	if (empty($ordertype)) die('操作错误！');                     // ② 纯文本、HTTP 200
//	$ordertype = explode('_filter_', $ordertype)[0];             // ③ 截掉 _filter_ 之后
//	if (method_exists($this, $ordertype)) $this->$ordertype();   // ④ 分发，返回值被丢弃
//	else die('操作错误！');
//
// 由此决定的口径（业务规则见 #241 评论 6888 与 D-5 的 Q1–Q5 裁定）：
//
//   - 分发目标的**返回值被丢弃**：pay() 没有 return，handlers.class.php 拿到 null →
//     102 "No data!"。实测 `service=member&action=pay&ordertype=message` 返回
//     {"state":102,"info":"No data!"}，所以分发成功也要落 102，不能透传目标响应。
//   - 分发白名单只含**已注册、非资金**的方法（Q2）。joinPay/recharge/withdraw/… 这类资金方法
//     永久不入表：PHP 会真的执行它们，Go 侧按「未知方法」返回操作错误，属**有意偏离**。
//   - `method_exists` 与方法调用都**不区分大小写**（ordertype=MESSAGE 能命中 message），
//     `explode('_filter_')` 区分大小写（message_FILTER_user → 未知方法 → 操作错误），
//     两者分别复刻。
//   - die() 是纯文本直出（不经 json_encode、不套 JSONP），走 ajax.Raw。
//
// 已知偏离（都写在这里，不写进正文以外的地方）：
//   - `ordertype=pay` 在 PHP 里是无限递归，实测 HTTP 500 + 空响应体；Go 直接按未知方法处理
//     （操作错误），复刻一个 500 崩溃没有意义，也不会把它写进对比用例。
//   - 分发参数（array_merge 的结果）**不会再过一遍 ajax.php 的入口归一**，这一点与 PHP 相同；
//     但当前 handler 内部仍在复刻入口归一（如 params.detailID 对 id 做 convertArrToStrWithComma），
//     于是 body 里「归一后会被改写」的值（id/cityid/sid/state 的数值化、addslashes）会被二次处理。
//     body 的类型保真也只到 url.Values 为止：PHP 的 true/false 落在 "true"/""（保 is_numeric 为假、
//     empty 为真），数组落在 key[]（保 (int)非空数组 = 1），关联键名丢失。这几条都由 #364
//     （入口 normaliser）统一收口，落地后分发子请求自动与 PHP 一致。
//   - **上述参数差异目前不可达**：要被分发到白名单目标，pay_log.body 的 type 必须是
//     message/detail/collect/... 这类名字，而仓库里 19 处 createPayForm("member", ...) 只写
//     deposit / recharge / join_pay / promotion / fabu / fenxiaoJoin / 模块名（见
//     TestPayRealBodyTypesAllDie），全在排除名单里或根本不是 member 方法。
//   - unserialize 只覆盖 N/b/i/d/s/a（复用 detail.go 的解析器）。body 是对象（O/C）时 PHP
//     的 is_array($bodyArr) 为假 → 不回填 → 操作错误，与 Go 解析失败后的走向一致。
//   - `array_merge` 的数字键：PHP 按**插入顺序**把数字键重排成 0..n-1。Go 的 url.Values 是 map，
//     请求侧插入顺序在上游 mergeParams 里已经丢失，重排只能靠猜，所以这里保留每个既有数字键
//     自己的下标、把 body 的数字键接在 max+1 之后（body 内部顺序可用，照 PHP 保留）。
//     分发目标只读命名键（$param['xxx']），不读 $param[0]，因此这条差异目前不可观测；
//     同理 body 里的关联数组退化成 key[] 后**键名丢失**（值顺序保留，`(int)$array` = 1 与 PHP 一致）。
package member

import (
	"context"
	"database/sql"
	"net/url"
	"regexp"
	"strconv"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// infoOperationError 是 pay() 两条 die 分支的文案（siteConfig[30][47]）。
const infoOperationError = "操作错误！"

// payFilterMarker 是 ③ 的截断标记。PHP explode 取 [0]，即标记之前的部分。
const payFilterMarker = "_filter_"

// payExcluded 是永久不入 pay 分发白名单的方法（全部小写）。
//
// 资金类依据 D-5/Q2 的显式名单；pay 是 Go 侧额外排除（PHP 无限递归 → 500，见文件头）。
var payExcluded = map[string]bool{
	"joinpay": true, "recharge": true, "withdraw": true, "transfer": true,
	"convert": true, "deposit": true, "upgrade": true, "promotion": true,
	"fabupay": true, "fenxiaojoinpay": true, "extract": true, "putforward": true,
	"pay": true,
}

// buildPayRoutes 生成分发白名单：只收已注册的 member action，再剔除 payExcluded。
// 键是小写方法名（PHP 方法名不区分大小写）。
func (s *Service) buildPayRoutes() map[string]ajax.Handler {
	all := map[string]ajax.Handler{
		"message": s.message, "reward": s.reward, "getComment": s.getComment,
		"detail": s.detail, "followMember": s.followMember, "collect": s.collect,
		"getZan": s.getZan, "replyComment": s.replyComment, "dingComment": s.dingComment,
		"sendComment": s.sendComment, "updateAccount": s.updateAccount,
	}
	routes := make(map[string]ajax.Handler, len(all))
	for name, h := range all {
		key := strings.ToLower(name)
		if payExcluded[key] {
			continue
		}
		routes[key] = h
	}
	return routes
}

// pay 迁移自 member.class.php:10363-10401（见文件头）。
func (s *Service) pay(req *ajax.Request) ajax.Response {
	p := newParams(req)

	// PHP 里 $param[key] 可能是标量也可能是数组（key[]）。数组在后续 explode / SQL 拼接里
	// 都走「类型不对」的路：explode 返回 null → method_exists(null) 为假 → 操作错误。
	ordertype, ordertypeIsArray := p.payString("ordertype")
	ordernum, ordernumIsArray := p.payString("ordernum")

	merged := cloneValues(req.Params)

	if phpEmptyString(ordertype) && !ordertypeIsArray && payTruthy(ordernum, ordernumIsArray) {
		if !ordernumIsArray {
			// ① 回查 pay_log。PHP 的 SQL 没有 uid 过滤、也没有 LIMIT，取第一行——
			// 越权面按 Q4 原样复刻（加固另开 issue）。
			if bodyArr, ok := s.payLogBody(req, ordernum); ok {
				// phpUnserializeRaw 只认 N/b/i/d/s/a；对象等类型解析失败 → 与 PHP
				// is_array($bodyArr) 为假同一走向：不回填，ordertype 保持空。
				if arr, isArray := bodyArr.(*phpArray); isArray && len(arr.keys) > 0 {
					switch v := arr.get2("type").(type) {
					case nil:
						// 没有 type 键或值为 null：ordertype 仍是空 → 下面 die。
					case string:
						ordertype = v
					case int64:
						ordertype = strconv.FormatInt(v, 10)
					case float64:
						ordertype = phpScalarString(v)
					case bool:
						if v {
							ordertype = "1"
						}
					default:
						// 数组：explode(array) 在 PHP 7.4 返回 null → 未知方法。
						ordertypeIsArray = true
					}
					merged = mergePayBody(merged, arr)
				}
			}
		}
	}

	if ordertypeIsArray || phpEmptyString(ordertype) {
		return payDie()
	}

	// ③ 截掉 _filter_ 及之后（如 upgrade_filter_user → upgrade）。
	if i := strings.Index(ordertype, payFilterMarker); i >= 0 {
		ordertype = ordertype[:i]
	}

	// ④ 分发。目标返回值被丢弃，成功也落 102（见文件头）。
	handler, ok := s.payRoutes[strings.ToLower(ordertype)]
	if !ok {
		return payDie()
	}
	_ = handler(&ajax.Request{
		Service: "member", Action: ordertype, Params: merged, HTTP: req.HTTP,
	})
	return noData()
}

// payDie 对应 die('操作错误！')：纯文本、HTTP 200、不套 JSONP。
func payDie() ajax.Response {
	return ajax.Response{Raw: &ajax.Raw{Body: infoOperationError}}
}

// payLogBody 取 pay_log 第一行的 body。查不到 / 无 db / SQL 出错都按「没有结果」处理，
// 与 PHP 里 $results 为空（false 或空数组）一致。
func (s *Service) payLogBody(req *ajax.Request, ordernum string) (any, bool) {
	if s.db == nil {
		return nil, false
	}
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	var body sql.NullString
	err := s.db.QueryRowContext(ctx,
		"SELECT `body` FROM "+s.payLogTable+" WHERE `ordernum` = ?", ordernum).Scan(&body)
	if err != nil {
		return nil, false
	}
	if !body.Valid {
		return nil, false // unserialize(NULL) 为 false
	}
	return phpUnserializeRaw(body.String)
}

// payString 取 PHP 里 $param[key] 的两种形态：普通标量、或 key[] 数组。
// 第二个返回值为 true 表示键的值是数组（PHP 里 empty(数组) 为假、不能当字符串用）。
func (p params) payString(key string) (string, bool) {
	if arr, ok := p.array(key); ok {
		// 空数组按 empty() 处理；非空数组交给调用方按「类型不对」处理。
		if len(arr) == 0 {
			return "", false
		}
		return "", true
	}
	return p.scalar(key), false
}

// payTruthy 复刻 `if (... && $ordernum)`：空串、"0"、null 为假，非空数组为真。
func payTruthy(v string, isArray bool) bool {
	if isArray {
		return true
	}
	return v != "" && v != "0"
}

// cloneValues 复制一份参数，供 array_merge 的结果使用（不改调用方的 url.Values）。
func cloneValues(in url.Values) url.Values {
	out := make(url.Values, len(in))
	for k, v := range in {
		out[k] = append([]string(nil), v...)
	}
	return out
}

// mergePayBody 复刻 array_merge($param, $body)：
// 字符串键被 body 覆盖（原有 key / key[] / key[sub] 一并清掉），数字键接在末尾。
// 数字键的**重排顺序**见文件头的偏离说明：请求侧的插入顺序在 url.Values 里已不可得。
func mergePayBody(param url.Values, body *phpArray) url.Values {
	out := param
	next := nextNumericIndex(out)
	var numeric []any
	for i, key := range body.keys {
		name, isString := key.(string)
		if !isString {
			numeric = append(numeric, body.vals[i])
			continue
		}
		setPayParam(out, name, body.vals[i])
	}
	for i, v := range numeric {
		out[strconv.Itoa(next+i)] = []string{payScalar(v)}
	}
	return out
}

// nextNumericIndex 返回 PHP 口径下「下一个可用的数字下标」（现有最大正下标 + 1）。
func nextNumericIndex(param url.Values) int {
	maxIndex := -1
	for k := range param {
		if n, ok := phpIntKey(k); ok && n >= 0 && int(n) > maxIndex {
			maxIndex = int(n)
		}
	}
	return maxIndex + 1
}

// phpNumericKey 是 PHP 会把字符串键转成 int 的形态：没有前导零、没有 '+'。
// "01" / "+1" / "1.0" 在 PHP 里仍是字符串键，不能当数字处理（否则会改写键、丢数据）。
var phpNumericKey = regexp.MustCompile(`^-?(0|[1-9][0-9]*)$`)

func phpIntKey(k string) (int64, bool) {
	if !phpNumericKey.MatchString(k) {
		return 0, false
	}
	n, err := strconv.ParseInt(k, 10, 64)
	if err != nil { // 溢出：PHP 也保持字符串键
		return 0, false
	}
	return n, true
}

// setPayParam 写入一个 body 键，并清掉同名键的所有既有形态。
// 数组统一落成 key[]：分发目标的 params.array(key) 能读到，且 (int)非空数组 = 1 与 PHP 一致。
func setPayParam(param url.Values, key string, v any) {
	clearPayParam(param, key)
	arr, isArray := v.(*phpArray)
	if !isArray {
		param[key] = []string{payScalar(v)}
		return
	}
	vals := make([]string, 0, len(arr.vals))
	for _, item := range arr.vals {
		vals = append(vals, payScalar(item))
	}
	param[key+"[]"] = vals
}

func clearPayParam(param url.Values, key string) {
	delete(param, key)
	delete(param, key+"[]")
	prefix := key + "["
	for k := range param {
		if strings.HasPrefix(k, prefix) {
			delete(param, k)
		}
	}
}

// payScalar 把 unserialize 出来的值转成 url.Values 里的字符串。
// 标量沿用 phpScalarString（与 PHP 的隐式转字符串一致）；数组/对象 url.Values 表达不了，
// 置空——分发目标只读命名标量键，深层结构在这里不参与业务。
func payScalar(v any) string {
	switch x := v.(type) {
	case *phpArray:
		// 数组统一落到 key[]，这里只处理「数组套数组」的内层值。
		return ""
	case bool:
		// PHP 里 true 在 is_numeric 下为假、在 empty 下为真；用 "1" 会让 is_numeric 变真，
		// 用 "true" 才能保住这两条判断（字符串拼接场景会差，但那条路无人使用）。
		if x {
			return "true"
		}
		return ""
	}
	return phpScalarString(v)
}

// get2 取字符串键的值；缺失时返回 nil（对应 PHP 的 $arr['type'] 未定义 → null）。
func (a *phpArray) get2(k string) any {
	v, _ := a.get(k)
	return v
}
