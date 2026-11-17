// Package httpbody 复刻 express 的 body 解析口径，供所有读请求体的路由共用。
//
// 为什么需要它：Node 版挂的是 `express.json()` + `express.urlencoded({extended:true})`
// 两个中间件，它们的共同点是 —— **解析方式由 Content-Type 决定，不看内容长什么样**：
//   - `application/json`（含 `application/*+json`）→ JSON.parse；
//   - `application/x-www-form-urlencoded` → qs.parse（本项目只用到平铺键值，用 url.ParseQuery 等价）；
//   - 其它类型（含未带 Content-Type）→ 不解析，`req.body` 是空对象。
//
// 之前 Go 侧按「body 首字节是不是 {」嗅探，看起来更宽容，实际是把类型契约放宽了：
// 一个 `Content-Type: text/plain` 的 JSON 请求在 Node 里 req.body 是空的（路由随后 400/401），
// 在 Go 里却会被当成合法 JSON 参与业务判断。
//
// 另外把「解析一次、多处复用」做进 context：装配层中间件解析后写入，下游
// bridge / tglogin / checkout / addrshare 直接取，不再各自 ParseForm 或重读 Body。
package httpbody

import (
	"bytes"
	"encoding/json"
	"io"
	"mime"
	"net/http"
	"net/url"
	"strings"
)

// fallbackLimit 是「未经装配层中间件」时现读 body 的上限。
// 生产路径由 httpapi 的中间件先读并限量（100KB，与 express.json 默认一致），这个值只影响
// 直接调用处理函数的场景（测试、内部复用）。
const fallbackLimit = 1 << 20

type contextKey struct{}

// Parse 按 Content-Type 解析请求体，返回与 Node `req.body` 等价的字段表。
//
// 解析失败一律返回空表：Node 侧 body-parser 会抛 400，但那个 400 是 express 默认错误页
// （HTML），与本项目的统一 JSON 错误体完全不同；这里让路由按自己的参数校验返回 400/401，
// 对外契约（状态码 4xx + 项目自己的错误体）反而更一致。
func Parse(contentType string, raw []byte) map[string]any {
	empty := map[string]any{}
	if len(raw) == 0 {
		return empty
	}
	mediaType := mediaTypeOf(contentType)
	switch {
	case mediaType == "application/json" || strings.HasSuffix(mediaType, "+json"):
		fields := map[string]any{}
		if err := json.Unmarshal(bytes.TrimSpace(raw), &fields); err != nil {
			return empty
		}
		return fields
	case mediaType == "application/x-www-form-urlencoded":
		values, err := url.ParseQuery(string(raw))
		if err != nil {
			return empty
		}
		fields := make(map[string]any, len(values))
		for key := range values {
			// 重复键取首个。
			//
			// ⚠️ 这与 Node 不一致，别按下面这句话去推断对齐：express 的
			// urlencoded({ extended: true }) 走 qs，重复键解析成**数组**而不是取首值，
			// 于是 `req.body.initData` 是数组、`typeof !== 'string'`，telegramAuth 直接判非法
			// → 401。本实现取首值 → 验签照常进行（首值仍须通过 HMAC，所以不是鉴权漏洞，
			// 只是「Node 拒、Go 收」这一方向的放宽）。
			// 已实测：POST body=initData=<合法>&initData=<同一合法>，Node 401 / Go 200。
			// 是否收紧到「重复键视为缺失」需先定口径（会同时影响其它收 form 的路由），
			// 故此处只把注释改成事实，行为保持不动。
			fields[key] = values.Get(key)
		}
		return fields
	}
	return empty
}

// mediaTypeOf 取出规范化的媒体类型（去掉 charset 等参数、统一小写）。
// 解析失败时退回「分号前那段」，避免 `application/json;` 这种畸形串直接变成空。
func mediaTypeOf(contentType string) string {
	if contentType == "" {
		return ""
	}
	if parsed, _, err := mime.ParseMediaType(contentType); err == nil {
		return strings.ToLower(parsed)
	}
	before, _, _ := strings.Cut(contentType, ";")
	return strings.ToLower(strings.TrimSpace(before))
}

// With 把原始 body 与解析结果挂到请求 context。
func With(req *http.Request, raw []byte, fields map[string]any) *http.Request {
	ctx := WithFields(req.Context(), fields)
	ctx = WithRaw(ctx, raw)
	return req.WithContext(ctx)
}

// FieldsOf 取解析后的字段表。
//
// 命中装配层写入的结果直接用；没有（直接用处理函数构造的请求，例如包级测试）时
// 按同一套 Content-Type 规则现解析一次 —— 但**不**退回首字节嗅探，
// 否则「Content-Type 决定解析方式」这条等价关系会在两条路径上不一致。
func FieldsOf(req *http.Request) map[string]any {
	if fields, ok := fieldsFrom(req); ok {
		return fields
	}
	raw := RawOf(req)
	if len(raw) == 0 {
		if req.Body == nil {
			return map[string]any{}
		}
		read, err := io.ReadAll(io.LimitReader(req.Body, fallbackLimit))
		if err != nil {
			return map[string]any{}
		}
		// 读完把 body 放回去：同一请求可能被读第二次（例如 bridge 先看字段再看原始体）。
		req.Body = io.NopCloser(bytes.NewReader(read))
		raw = read
	}
	return Parse(req.Header.Get("Content-Type"), raw)
}

// Text 取字符串字段；非字符串（数组/对象/数字/布尔）一律当作缺失。
//
// 这条口径直接对应 Node：`req.body.initData` 若是对象，各路由做的都是「当成不可用」，
// 而不是把它 String() 成 "[object Object]" 再拿去验签。
func Text(fields map[string]any, key string) string {
	value, ok := fields[key].(string)
	if !ok {
		return ""
	}
	return value
}
