package travel

import (
	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// staticItem 是 10 个静态字典 action 的行结构；PHP $typeList[] = array('id'=>..,'typename'=>..,'lower'=>array())。
// lower 恒为空数组 → JSON []。
type staticItem struct {
	ID       int    `json:"id"`
	Typename string `json:"typename"`
	Lower    []any  `json:"lower"`
}

// 以下文案取 webroot/include/lang/zh-CN/travel.inc.php 运行时值（块.键），
// 由 docker firebird-php 从语言包实测提取（2026-11-27，#370 业务规则评论留档）。
const (
	langTravel0_7    = "旅游攻略"
	langTravel1_0    = "景点门票"
	langTravel2_0    = "一日游"
	langTravel2_13   = "跟团游"
	langTravel3_1    = "视频"
	langTravel5_0    = "旅行社"
	langTravel5_5    = "签证"
	langTravel7_13   = "酒店"
	langTravel9_2    = "租车"
	langTravel12_0   = "星级酒店"
	langTravel12_1   = "民宿"
	langTravel12_2   = "无窗"
	langTravel12_3   = "有窗"
	langTravel12_4   = "双床"
	langTravel12_5   = "多床"
	langTravel12_6   = "大床"
	langTravel12_7   = "不含早餐"
	langTravel12_8   = "含早餐"
	langTravel12_52  = "A级"
	langTravel12_53  = "2A级"
	langTravel12_54  = "3A级"
	langTravel12_55  = "4A级"
	langTravel12_56  = "5A级"
	langTravel12_81  = "亚洲"
	langTravel12_82  = "大洋洲"
	langTravel12_83  = "美洲"
	langTravel12_84  = "欧洲"
	langTravel12_85  = "非洲"
	langTravel12_86  = "免签"
	langTravel12_87  = "落地签"
	langTravel12_101 = "单次"
	langTravel12_102 = "多次"
	langTravel12_103 = "以使领馆签发为准"
	langTravel12_97  = "原件"
	langTravel12_98  = "复印件"
	langTravel12_99  = "电子稿"
	// $langData['siteConfig'][34][5][*]（周一..周日，0 是周日）
	langSC34_5_0 = "周日"
	langSC34_5_1 = "周一"
	langSC34_5_2 = "周二"
	langSC34_5_3 = "周三"
	langSC34_5_4 = "周四"
	langSC34_5_5 = "周五"
	langSC34_5_6 = "周六"
)

func staticList(items ...staticItem) ajax.Response {
	return ajax.Response{State: ajax.StateOK, Info: items}
}

// module_type（travel.class.php:9481-9497）：旅游子模块分类，7 项固定。
func (s *Service) moduleTypeList(req *ajax.Request) ajax.Response {
	return staticList(
		staticItem{1, langTravel7_13, []any{}},
		staticItem{2, langTravel1_0, []any{}},
		staticItem{3, langTravel9_2, []any{}},
		staticItem{4, langTravel5_0, []any{}},
		staticItem{5, langTravel3_1, []any{}},
		staticItem{6, langTravel0_7, []any{}},
		staticItem{7, langTravel5_5, []any{}},
	)
}

// iswindow_type（9498-9508）：有无窗。
func (s *Service) iswindowType(req *ajax.Request) ajax.Response {
	return staticList(
		staticItem{0, langTravel12_2, []any{}},
		staticItem{1, langTravel12_3, []any{}},
	)
}

// visa_type（9509-9520）：入境次数。
func (s *Service) visaTypeList(req *ajax.Request) ajax.Response {
	return staticList(
		staticItem{0, langTravel12_101, []any{}},
		staticItem{1, langTravel12_102, []any{}},
		staticItem{2, langTravel12_103, []any{}},
	)
}

// room_type（9521-9532）：床型。
func (s *Service) roomType(req *ajax.Request) ajax.Response {
	return staticList(
		staticItem{0, langTravel12_4, []any{}},
		staticItem{1, langTravel12_5, []any{}},
		staticItem{2, langTravel12_6, []any{}},
	)
}

// breakfast_type（9533-9543）：早餐。
func (s *Service) breakfastType(req *ajax.Request) ajax.Response {
	return staticList(
		staticItem{0, langTravel12_7, []any{}},
		staticItem{1, langTravel12_8, []any{}},
	)
}

// travelhotel_type（9544-9554）：住宿类型。
func (s *Service) travelhotelType(req *ajax.Request) ajax.Response {
	return staticList(
		staticItem{1, langTravel12_0, []any{}},
		staticItem{2, langTravel12_1, []any{}},
	)
}

// travelagency_type（9555-9565）：周边游类型。
func (s *Service) travelagencyType(req *ajax.Request) ajax.Response {
	return staticList(
		staticItem{0, langTravel2_0, []any{}},
		staticItem{1, langTravel2_13, []any{}},
	)
}

// star_type（9566-9579）：景区等级。
func (s *Service) starType(req *ajax.Request) ajax.Response {
	return staticList(
		staticItem{1, langTravel12_52, []any{}},
		staticItem{2, langTravel12_53, []any{}},
		staticItem{3, langTravel12_54, []any{}},
		staticItem{4, langTravel12_55, []any{}},
		staticItem{5, langTravel12_56, []any{}},
	)
}

// continent_type（9580-9593）：大洲。
func (s *Service) continentType(req *ajax.Request) ajax.Response {
	return staticList(
		staticItem{1, langTravel12_81, []any{}},
		staticItem{2, langTravel12_82, []any{}},
		staticItem{3, langTravel12_83, []any{}},
		staticItem{4, langTravel12_84, []any{}},
		staticItem{5, langTravel12_85, []any{}},
	)
}

// typeid_type（9594-9602）：签证类型。注意 PHP 第 3 项文案取 [12][101]（单次），照抄。
func (s *Service) typeidType(req *ajax.Request) ajax.Response {
	return staticList(
		staticItem{0, langTravel12_86, []any{}},
		staticItem{1, langTravel12_87, []any{}},
		staticItem{2, langTravel12_101, []any{}},
	)
}

// moduleType（9827-9841）：星期几，文案取 siteConfig[34][5][*]（0=周日）。
func (s *Service) moduleTypeWeek(req *ajax.Request) ajax.Response {
	return staticList(
		staticItem{1, langSC34_5_1, []any{}},
		staticItem{2, langSC34_5_2, []any{}},
		staticItem{3, langSC34_5_3, []any{}},
		staticItem{4, langSC34_5_4, []any{}},
		staticItem{5, langSC34_5_5, []any{}},
		staticItem{6, langSC34_5_6, []any{}},
		staticItem{7, langSC34_5_0, []any{}},
	)
}

// gettypename / getname（9603-9613 / 9842-9849）是 helper：PHP 签名
// `gettypename($fun, $id)` 需要两个必填参数，而 handlers::getHandle 以无参调用
// （`$serviceHandler->$action()`），因此 ajax 直呼必然 ArgumentCountError 致命
// —— 实测 canary PHP 返回 HTTP 500 空 body（2026-11-27 实录）。
//
// Go 无法复刻 HTTP 状态码（ajax.Router 不支持 Raw 分支改状态码），返回空 body
// （Raw），compare 对「两侧非 JSON 空 body 按字节比较」口径下与 PHP 一致；
// 状态码 200 vs 500 的偏差在 #370 业务规则评论中报备。这两个 action 无模板引用
// （模板引用计数 0），无线上调用面。
func (s *Service) gettypenameAction(req *ajax.Request) ajax.Response {
	return ajax.Response{Raw: &ajax.Raw{Body: ""}}
}

func (s *Service) getnameAction(req *ajax.Request) ajax.Response {
	return ajax.Response{Raw: &ajax.Raw{Body: ""}}
}

// typeNameByID 复刻 gettypename($fun,$id) 的查找语义（countrytype/countryDetail 内部用）：
// array_search 非严格比较（PHP 7.4：字符串与 int 比较取前导数字，非数字串为 0），
// 找不到返回 false → $list[false] = $list[0]（第一项的 typename）。列表恒非空。
func typeNameByID(list []staticItem, rawID string) string {
	f := phpLooseFloat(rawID)
	for _, item := range list {
		if float64(item.ID) == f {
			return item.Typename
		}
	}
	// PHP array_search 失败 → 下标 false → $list[0]。
	if len(list) > 0 {
		return list[0].Typename
	}
	return ""
}

// typeidTypeItems / continentTypeItems 供 countrytype / countryDetail 的
// gettypename 语义复用（与上面 action 返回同一份列表）。
func typeidTypeItems() []staticItem {
	return []staticItem{
		{0, langTravel12_86, []any{}},
		{1, langTravel12_87, []any{}},
		{2, langTravel12_101, []any{}},
	}
}

func continentTypeItems() []staticItem {
	return []staticItem{
		{1, langTravel12_81, []any{}},
		{2, langTravel12_82, []any{}},
		{3, langTravel12_83, []any{}},
		{4, langTravel12_84, []any{}},
		{5, langTravel12_85, []any{}},
	}
}
