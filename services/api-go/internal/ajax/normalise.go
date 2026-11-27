// 入口参数归一（#364）：webroot/include/ajax.php:54-122 的逐条对齐。
//
// PHP 的实际管线（重要）：common.inc.php 的 bootstrap 归一（_RunMagicQuotes、
// rsaDecrypt、GET 二次 RemoveXSS、page/pageSize 取整、amount/id 强转等）写的是
// **全局变量**（${$_k}，如 $page、$id），并不回写 $_GET/$_POST 数组；ajax.php 入口
// 循环遍历的是 PHP 原始解析的 $_GET/$_POST。所以 handler 的 $param 只经过下面这一层
// 入口归一——page 的 touchHome 守卫、GET 默认值、rsaEncrypt 的 resetpwd 守卫都是活代码
// （compare 用例对 page=touchHome 的实测也印证了这一点）。
//
// 与 PHP 的逐条对应（GET 块 L56-92 / POST 块 L94-122，verb 不对称三处）：
//   - 键名归一：htmlspecialchars(RemoveXSS(key))，description 除外（两块相同）；
//   - 跳过 service/action/callback/_（两块相同）；
//   - page/pageSize 且值 != 'touchHome'：GET (int) 后 <=0 取默认（page 1 / pageSize 10）
//     再 clamp >50000；POST 只 clamp >50000，<=0 保留；
//   - rsaEncrypt 分支：GET 要求 ($_GET['action']=='resetpwd' && key!='data') ||
//     action!='resetpwd'，POST 无此守卫；
//   - amount (float)；id/cityid/sid/state 逗号整数；lng/lat 系 'undefined'、
//     pricePlaceholder、任意 'undefined' → ”（两块相同）；
//   - 终态 else：GET 是 RemoveXSS(addslashes(stripslashes(removeInvisibleCharacters(v))))，
//     POST 不带 removeInvisibleCharacters；含 '[{' 或能解码成 PHP 数组/关联数组的
//     JSON 原样透传。
//
// 返回口径：PHP handler 看到的 $param 是转义值，拼进 SQL 字面量后 MySQL 再解一次反斜杠；
// Go 侧全部走参数化 SQL，直接给 handler 转义值会双重转义。因此终态 else 分支的输出
// 再做一次 phpStripslashes，Params 保存「MySQL 字面量解析后」的等价值（与既有 handler
// 「参数化入库存原文」的口径一致）。handler 需要 PHP 所见的转义值时用 PHPAddslashes
// 还原（S(A(x))=x，往返无损）；member.updateAccount 的密码哈希就是这么做的。
//
// blocked：PHP 在 bootstrap 里对以 _GET/_POST/_COOKIE 开头的键名或值直接 exit
// （CheckRequest + _RunMagicQuotes 双保险，作用于原始 GPC），响应体为 exit 的消息文本。
// Go 侧以 blocked=true 返回，由 Router 输出同样的 200 + 文本。
package ajax

import (
	"encoding/json"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"unicode/utf8"
)

// gpcPrefixRe 匹配 PHP `preg_match('#^(_GET|_POST|_COOKIE)#', $val)`。
var gpcPrefixRe = regexp.MustCompile(`^(_GET|_POST|_COOKIE)`)

// NormaliseParams 复刻 ajax.php 的入口归一（见包注释）。blocked=true 表示
// PHP 会 exit('Request var not allow!')。
func NormaliseParams(req *http.Request) (params url.Values, blocked bool) {
	query := req.URL.Query()
	// 解析错误不拦截：畸形的键值对被跳过，其余照常可用，与 PHP 解析 $_GET/$_POST 的宽松行为一致。
	// 只解析 urlencoded 请求体；multipart 等第一个上传类 action 迁移时再加。
	_ = req.ParseForm()
	post := req.PostForm

	var cookieNames, cookieValues []string
	for _, c := range req.Cookies() {
		cookieNames = append(cookieNames, c.Name)
		cookieValues = append(cookieValues, c.Value)
	}

	// PHP 在 bootstrap 里对原始 GPC（含 Cookie）做 CheckRequest + _RunMagicQuotes，
	// 键名或值（任意深度）以 _GET/_POST/_COOKIE 开头直接 exit。
	if gpcBlocked(query, post, cookieNames, cookieValues) {
		return nil, true
	}

	// rsaEncrypt 取 $_REQUEST（GET < POST < COOKIE，后者覆盖；同名取最后一个值）。
	rsaActive := looseEqualsOne(requestLast(req, "rsaEncrypt"))
	// GET 分支的 resetpwd 守卫用的是 $_GET['action']——只认 URL，不认请求体。
	getAction := ""
	if vs := query["action"]; len(vs) > 0 {
		getAction = vs[len(vs)-1]
	}

	getPart := entryPass(query, true, rsaActive, getAction)
	postPart := entryPass(post, false, rsaActive, "")
	return mergeParams(getPart, postPart), false
}

func gpcBlocked(query, post url.Values, cookieNames, cookieValues []string) bool {
	check := func(key string, values []string) bool {
		if gpcPrefixRe.MatchString(key) {
			return true
		}
		for _, v := range values {
			if len(v) > 0 && gpcPrefixRe.MatchString(v) {
				return true
			}
		}
		return false
	}
	for k, v := range query {
		if check(k, v) {
			return true
		}
	}
	for k, v := range post {
		if check(k, v) {
			return true
		}
	}
	for i, name := range cookieNames {
		var one []string
		if i < len(cookieValues) {
			one = []string{cookieValues[i]}
		}
		if check(name, one) {
			return true
		}
	}
	return false
}

// requestLast 对应 PHP $_REQUEST[name]（GET < POST < COOKIE，同名取最后一个值）。
func requestLast(req *http.Request, name string) string {
	if c, err := req.Cookie(name); err == nil {
		return c.Value
	}
	if vs := req.PostForm[name]; len(vs) > 0 {
		return vs[len(vs)-1]
	}
	if vs := req.URL.Query()[name]; len(vs) > 0 {
		return vs[len(vs)-1]
	}
	return ""
}

// JSONDecodesToArray 对应 PHP is_array(json_decode($v, true))（非法 UTF-8 → false；
// 对象算关联数组）。
func JSONDecodesToArray(v string) bool {
	if !utf8.ValidString(v) {
		return false
	}
	var arr []any
	if err := json.Unmarshal([]byte(v), &arr); err == nil && arr != nil {
		return true
	}
	var obj map[string]any
	if err := json.Unmarshal([]byte(v), &obj); err == nil && obj != nil {
		return true
	}
	return false
}

// entryPass 迁移 ajax.php:54-122 的入口循环（生成 $param）。isGET 决定三处 verb
// 不对称：terminal else 的 removeInvisibleCharacters、page/pageSize 默认值、
// rsaEncrypt 的 resetpwd 守卫。
func entryPass(src url.Values, isGET bool, rsaActive bool, action string) url.Values {
	out := url.Values{}
	for key, values := range src {
		// PHP 的键名是 page（page[] 在 $_GET 里也是 'page'），所以键名归一基于 base。
		base := strings.TrimSuffix(key, "[]")
		// 键名归一：description 之外做 htmlspecialchars(RemoveXSS(key))。
		newKey := base
		if base != "description" {
			newKey = phpHTMLSpecialChars74(RemoveXSS(base))
		}
		switch newKey {
		case "service", "action", "callback", "_":
			continue
		}

		if strings.HasSuffix(key, "[]") {
			entryPassArray(out, newKey, values, isGET)
			continue
		}
		v := values[len(values)-1]

		// rsaEncrypt 分支：GET 带 resetpwd 守卫，POST 没有。
		if rsaActive && (len(v) == 172 || strings.Contains(v, "||rsa||")) {
			if !isGET || action != "resetpwd" || newKey != "data" {
				v = rsaDecryptValue(v)
			}
		}

		switch {
		case (base == "page" || base == "pageSize") && v != "touchHome":
			n := phpIntval(v)
			if isGET && n <= 0 { // POST 只做上限（<=0 留给 handler 的 empty() 兜，负数保留）
				if base == "page" {
					n = 1
				} else {
					n = 10
				}
			}
			if n > 50000 {
				n = 50000
			}
			v = strconv.Itoa(n)
		case base == "amount":
			v = phpFloatString(phpFloatVal(v))
		case base == "id" || base == "cityid" || base == "sid" || base == "state":
			v = ConvertArrToStrWithComma(v, nil, false)
		case (base == "lng" || base == "lat" || base == "userlng" || base == "userlat") && v == "undefined":
			v = ""
		case base == "price" && v == "pricePlaceholder":
			v = ""
		case v == "undefined":
			v = ""
		default:
			// JSON 透传；否则终态 else 的 RemoveXSS 链，末尾按 MySQL 字面量解析口径
			// 剥一次反斜杠（见包注释）。
			if strings.Contains(v, "[{") || JSONDecodesToArray(v) {
				// 原样保留
			} else if isGET {
				x := PHPAddslashes(PHPStripslashes(RemoveInvisibleCharacters(v)))
				v = PHPStripslashes(RemoveXSS(x))
			} else {
				x := PHPAddslashes(PHPStripslashes(v))
				v = PHPStripslashes(RemoveXSS(x))
			}
		}
		out[newKey] = []string{v}
	}
	return out
}

// entryPassArray 处理数组值：PHP 入口对数组值在特殊键分支里按 (int)/(float) 数组强转
// 拍平成 1（page/pageSize/amount）或逐项取整（id/cityid/sid/state），其余键
// is_array → 原样保留（不经过 RemoveXSS 链）。数组在 Params 里沿用「k[]」后缀键的
// 约定（与 mergeParams / member.params.array 一致）。
func entryPassArray(out url.Values, newKey string, values []string, isGET bool) {
	arrayKey := newKey + "[]"
	switch newKey {
	case "page", "pageSize":
		// $value != 'touchHome' 对数组恒真 → (int)数组 = 1（非空）/ 0（空）
		n := 0
		if len(values) > 0 {
			n = 1
		}
		if isGET && n <= 0 {
			if newKey == "page" {
				n = 1
			} else {
				n = 10
			}
		}
		if n > 50000 {
			n = 50000
		}
		out[newKey] = []string{strconv.Itoa(n)}
	case "amount":
		if len(values) > 0 {
			out[newKey] = []string{"1"}
		} else {
			out[newKey] = []string{"0"}
		}
	case "id", "cityid", "sid", "state":
		out[newKey] = []string{ConvertArrToStrWithComma("", values, true)}
	default:
		out[arrayKey] = values // is_array → 原样保留
	}
}

// rsaDecryptValue 对应 rsaDecrypt：私钥未配置（hook 为 nil）时 PHP 恒等返回原串。
func rsaDecryptValue(s string) string {
	if RSADecrypt == nil {
		return s
	}
	return RSADecrypt(s)
}
