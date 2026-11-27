// Package ajax 是火鸟 webroot/include/ajax.php 的 Go 兼容层（总方案见 #298）。
//
// 每个 service 一个子包（internal/ajax/siteconfig、internal/ajax/article……），
// 子包导出 Register(*Router)，由 cmd/api 统一注册。未注册的 service/action 一律 404。
//
// 这里做入口的通用部分：分发、参数归一（NormaliseParams，#364：bootstrap + 入口两层，
// 含 RemoveXSS、page/pageSize 归一、rsaEncrypt 分支）、输出 JSON/JSONP。ajax.php 里
// 其余的通用逻辑（站点关闭、pageInfo、dataType=html）没有在骨架里实现，
// 等第一个依赖它们的 action 带着业务规则一起加。
package ajax

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"regexp"
	"strings"
)

// StateOK 是火鸟接口约定的成功状态码。
const StateOK = 100

// callbackPattern 限定 JSONP 回调名：响应体是原样拼出来的脚本，回调名不能带任意字符。
// ajax.php 走的是 RemoveXSS + htmlspecialchars + 去括号的黑名单；这里换成白名单，
// 真实前端（jQuery 生成的 jQuery123_456 和手写函数名）都能通过。
var callbackPattern = regexp.MustCompile(`^[A-Za-z_$][A-Za-z0-9_$.]{0,127}$`)

// Response 是 ajax.php 的返回结构；字段顺序与 PHP 数组一致。
type Response struct {
	State int `json:"state"`
	Info  any `json:"info"`
}

// Request 是处理函数看到的请求。
type Request struct {
	Service string
	Action  string
	// Params 对应 ajax.php 的 $param：GET 与 POST 合并，同名时 POST 优先（Cookie 不进入），
	// 不含 service、action、callback、_。值取「MySQL 字面量解析后」口径（#364），
	// 与参数化 SQL 的存原文约定一致；需要 PHP 所见的转义视图时用 ParamsEscaped。
	Params url.Values
	// ParamsEscaped 是 PHP handler 所见的转义口径（#364）。绝大多数键与 Params 相同，
	// 差异只在终态 else / rsaDecrypt 分支——转义值经实体解码后可能带裸引号/反斜杠，
	// 无法从 Params 还原。需要比较、哈希、拼 PHP 同款字面量时读它。
	ParamsEscaped url.Values
	// HTTP 是原始请求，处理函数从它取 context、cookie。
	HTTP *http.Request
}

// Handler 处理一个 action。
type Handler func(req *Request) Response

type route struct{ service, action string }

// Router 按 service + action 分发。注册只发生在启动阶段，之后只读。
type Router struct {
	handlers map[route]Handler
	logf     func(string)
}

// NewRouter 创建空路由表。logf 接收内部错误日志。
func NewRouter(logf func(string)) *Router {
	return &Router{handlers: map[route]Handler{}, logf: logf}
}

// Register 注册一个 action。重复注册直接 panic：这是启动期的编码错误，
// 静默覆盖会让其中一个实现永远不被调用。
func (r *Router) Register(service, action string, handler Handler) {
	key := route{service, action}
	if _, exists := r.handlers[key]; exists {
		panic(fmt.Sprintf("ajax: %s.%s 重复注册", service, action))
	}
	r.handlers[key] = handler
}

// ServeHTTP 实现 http.Handler。
func (r *Router) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	// 参数归一对应 common.inc.php bootstrap + ajax.php 入口循环（#364）。PHP 的 bootstrap
	// 在 service 分发之前跑完，_GET/_POST/_COOKIE 里出现 _GET/_POST/_COOKIE 前缀的键名或
	// 值会直接 exit，所以归一（含 blocked 判定）放在路由查找之前。
	params, escaped, blocked := NormaliseParams(req)
	if blocked {
		// PHP exit('Request var not allow!')：正文就是这段文本，HTTP 200。
		w.Header().Set("Content-Type", "text/html; charset=UTF-8")
		_, _ = w.Write([]byte("Request var not allow!"))
		return
	}

	// service/action 只认 URL，且取第一个同名参数，与 nginx 分流的 $arg_service/$arg_action
	// 同一口径（#234）。如果也认请求体，URL 写白名单里的 action、请求体写别的，就能绕过白名单。
	query := req.URL.Query()
	service, action := query.Get("service"), query.Get("action")
	handler, ok := r.handlers[route{service, action}]
	if !ok {
		http.NotFound(w, req)
		return
	}

	callback := requestValue(req, "callback")

	response := handler(&Request{Service: service, Action: action, Params: params, ParamsEscaped: escaped, HTTP: req})
	payload, err := encode(response)
	if err != nil {
		r.logf(fmt.Sprintf("ajax: %s.%s 返回值无法编码: %v", service, action, err))
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
	if callbackPattern.MatchString(callback) {
		payload = []byte(callback + "(" + string(payload) + ")")
	}
	// 不加 X-Content-Type-Options: nosniff：响应类型是 application/json，
	// 带上它浏览器会拒绝把 JSONP 响应当脚本执行。
	w.Header().Set("Content-Type", "application/json")
	_, _ = w.Write(payload)
}

// requestValue 对应 PHP 的 $_REQUEST[name]：GET < POST < COOKIE，后者覆盖前者（#233 裁决：
// 镜像没有 php.ini，request_order 为空，按 variables_order=EGPCS）。同名取最后一个值。
func requestValue(req *http.Request, name string) string {
	if cookie, err := req.Cookie(name); err == nil {
		return cookie.Value
	}
	if values := req.PostForm[name]; len(values) > 0 {
		return values[len(values)-1]
	}
	if values := req.URL.Query()[name]; len(values) > 0 {
		return values[len(values)-1]
	}
	return ""
}

// mergeParams 对应 ajax.php 里 foreach($_GET)、foreach($_POST) 生成 $param 的过程：
// POST 覆盖 GET；不含 service、action、callback、_；Cookie 不进入 $param。
// PHP 里 a=1&a=2 得到最后一个值，a[]=1&a[]=2 得到数组，后来源对同名键整体覆盖。
func mergeParams(sources ...url.Values) url.Values {
	params := url.Values{}
	for _, source := range sources {
		for key, values := range source {
			switch key {
			case "service", "action", "callback", "_":
				continue
			}
			// PHP 里 k 与 k[] 是同一个键 k，后来源整体覆盖先来源。
			if base, isArray := strings.CutSuffix(key, "[]"); isArray {
				delete(params, base)
				params[key] = append([]string(nil), values...)
			} else {
				delete(params, key+"[]")
				params[key] = []string{values[len(values)-1]}
			}
		}
	}
	return params
}

// encode 对应 json_encode($return, JSON_UNESCAPED_UNICODE)：不转义中文和 < > &，末尾没有换行。
// 与 PHP 的字节差异只有 PHP 会把 / 写成 \/，解析后的值相同。
func encode(response Response) ([]byte, error) {
	var buffer bytes.Buffer
	encoder := json.NewEncoder(&buffer)
	encoder.SetEscapeHTML(false)
	if err := encoder.Encode(response); err != nil {
		return nil, err
	}
	return bytes.TrimRight(buffer.Bytes(), "\n"), nil
}
