// Package ajax 是火鸟 webroot/include/ajax.php 的 Go 兼容层（总方案见 #298）。
//
// 每个 service 一个子包（internal/ajax/siteconfig、internal/ajax/article……），
// 子包导出 Register(*Router)，由 cmd/api 统一注册。未注册的 service/action 一律 404。
//
// 这里只做入口的通用部分：分发、合并参数、输出 JSON/JSONP。ajax.php 里其余的通用逻辑
// （RemoveXSS、page/pageSize 归一、rsaEncrypt、站点关闭、pageInfo、dataType=html）
// 没有在骨架里实现，等第一个依赖它们的 action 带着业务规则一起加。
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
	// 不含 service、action、callback、_。值未做 RemoveXSS 等处理。
	Params url.Values
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
	// service/action 只认 URL，且取第一个同名参数，与 nginx 分流的 $arg_service/$arg_action
	// 同一口径（#234）。如果也认请求体，URL 写白名单里的 action、请求体写别的，就能绕过白名单。
	query := req.URL.Query()
	service, action := query.Get("service"), query.Get("action")
	handler, ok := r.handlers[route{service, action}]
	if !ok {
		http.NotFound(w, req)
		return
	}

	// 解析错误不拦截：畸形的键值对被跳过，其余照常可用，与 PHP 解析 $_GET/$_POST 的宽松行为一致。
	// 只解析 urlencoded 请求体；multipart 等第一个上传类 action 迁移时再加。
	_ = req.ParseForm()
	params := mergeParams(query, req.PostForm)
	callback := requestValue(req, "callback")

	response := handler(&Request{Service: service, Action: action, Params: params, HTTP: req})
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
			if strings.HasSuffix(key, "[]") {
				params[key] = append([]string(nil), values...)
			} else {
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
