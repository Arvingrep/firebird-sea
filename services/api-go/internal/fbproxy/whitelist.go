// Package fbproxy 是 TMA → 火鸟 ajax.php 的白名单代理（AD-20）：默认拒绝、
// 剥离客户端身份参数、写接口限流与幂等、资金类接口归属预检。
//
// 白名单分两段：匿名只读展示类（8 个）与会员级订单/地址类（8 个）。
// 新增条目必须随 PR 单独审核——每一次放宽都是一条潜在的资金路径。
package fbproxy

// Precheck 描述写操作前的归属预检：先用同一会员凭证读取该资源，读不到即视为无权。
type Precheck struct {
	Action  string
	IDParam string
}

// Rule 是一条白名单规则。零值即「会员级、无参数白名单、非写、非幂等」。
type Rule struct {
	// Auth 只允许 "anonymous" / "member"。
	Auth string
	// Params 非 nil 时是参数白名单：未列出的参数一律丢弃（防越权参数如 userid/store）。
	Params []string
	// Write 标记写接口：走更紧的写限流。
	Write bool
	// Idempotent 要求 Idempotency-Key，且必须与 Auth=member 搭配（构造期校验）。
	Idempotent bool
	// DenyStatus 上游拒绝时映射的 HTTP 状态（0 表示不映射，直接返回上游体）。
	DenyStatus int
	// Validate 指定专用参数校验器（目前只有 "deal"）。
	Validate string
	// OwnershipPrecheck 指定归属预检动作。
	OwnershipPrecheck *Precheck
}

// Whitelist 的键是 "service:action"。
type Whitelist map[string]Rule

// DefaultWhitelist 返回与 Node 版逐字一致的白名单表。
// 每次调用返回新 map：允许调用方按需删减（测试常用），不会污染全局。
func DefaultWhitelist() Whitelist {
	return Whitelist{
		// —— 匿名只读展示类 ——
		// shopList 刻意排除三个注入面：ids（直接拼进 AND s.id in (...)、lng/lat（拼进 SQL 数学表达式）、
		// cityid（上游 getCityId 内部处理）。keywords 只允许标量字符串，由上游 addslashes 兜底。
		"waimai:shopList": {
			Auth: "anonymous",
			Params: []string{"page", "pageSize", "keywords", "orderby", "typeid", "filter", "deliver", "yingye",
				"recBrand", "youhui", "fullHui", "freePei", "firstDel", "timeZhe"},
		},
		"waimai:shopType":    {Auth: "anonymous", Params: []string{"nav"}},
		"waimai:storeDetail": {Auth: "anonymous"},
		"waimai:food":        {Auth: "anonymous"},
		"waimai:foodType":    {Auth: "anonymous"},
		"article:type":       {Auth: "anonymous"},
		"article:alist":      {Auth: "anonymous"},
		"article:detail":     {Auth: "anonymous"},

		// —— 会员级（资金路径标准：仅登录会员、参数白名单、归属失败映射 404）——
		"waimai:getMemberAddress": {
			Auth:   "member",
			Params: []string{"cityid", "gettype", "lat", "lng", "shopid"},
		},
		"waimai:operAddress": {
			Auth:              "member",
			Write:             true,
			Params:            []string{"id", "address", "addressname", "areaCode", "default", "lat", "lng", "mobile", "people", "person", "street", "tel"},
			DenyStatus:        404,
			OwnershipPrecheck: &Precheck{Action: "getAddressDetail", IDParam: "id"},
		},
		"waimai:delAddress": {
			Auth:              "member",
			Write:             true,
			Params:            []string{"id"},
			DenyStatus:        404,
			OwnershipPrecheck: &Precheck{Action: "getAddressDetail", IDParam: "id"},
		},
		// deal：货到付款下单。不透传价格/优惠/积分类参数（quanid、quantype、openlevel、level、
		// usePinput、tprice、peerpay）——这些由服务端按自己的菜价重算。
		"waimai:deal": {
			Auth:       "member",
			Idempotent: true,
			Write:      true,
			DenyStatus: 404,
			Params: []string{"shop", "address", "paytype", "order_content", "preset", "note", "peitype",
				"phone", "desk", "lng", "lat", "selftime", "orderTime"},
			Validate: "deal",
		},
		"waimai:order": {
			Auth:   "member",
			Params: []string{"page", "pageSize", "state", "iscomment"},
		},
		"waimai:orderDetail": {Auth: "member", Params: []string{"id"}, DenyStatus: 404},
		// 骑手轨迹：上游连登录都不校验，纯按 orderid 查（无归属条件）。先借 orderDetail 做预检，
		// 读不到即 404 且不转发。
		"waimai:getCourierLocation": {
			Auth:              "member",
			Params:            []string{"orderid"},
			DenyStatus:        404,
			OwnershipPrecheck: &Precheck{Action: "orderDetail", IDParam: "orderid"},
		},
		"waimai:cancelOrder": {Auth: "member", Write: true, Params: []string{"id"}, DenyStatus: 404},
	}
}

// Validate 做构造期自检：幂等规则必须要求登录，否则任何人都能预占他人的幂等键。
func (w Whitelist) Validate() error {
	for name, rule := range w {
		if rule.Idempotent && rule.Auth != "member" {
			return &ConfigError{Name: name}
		}
	}
	return nil
}

// ConfigError 表示白名单配置非法（消息文案与 Node 版一致）。
type ConfigError struct{ Name string }

func (e *ConfigError) Error() string {
	return "白名单 " + e.Name + ": idempotent 规则必须 auth=member"
}
