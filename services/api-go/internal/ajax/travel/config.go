package travel

import (
	"context"
	"net"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/fburl"
)

// 以下是 webroot/include/config/travel.inc.php 的构建期快照（规则同 article #248）。
// $customUpload = 1：尺寸/类型用 inc 里 custom_* 值，不是系统默认。
const (
	cfgChannelName   = "旅游度假"
	cfgLogoCustom    = 0  // $customLogo
	cfgLogoURL       = "" // $customLogoUrl（customLogo=0 时不使用）
	cfgSubDomain     = 2
	cfgChannelSwitch = 0
	cfgCloseCause    = "站点升级中。。。"
	cfgSeoTitle      = "旅游度假"
	cfgSeoKeyword    = "旅游度假"
	cfgSeoDesc       = "旅游度假描述"
	cfgCustomHotline = "" // $customHotline（$hotline_config 为 0 → 用系统 $cfg_hotline）

	cfgSoftSize  = 20480
	cfgSoftType  = "zip|gz|rar|iso|doc|xsl|ppt|wps"
	cfgThumbSize = 2048
	cfgThumbType = "jpg|jpeg|gif|png|swf"

	cfgStoreAtlasMax          = 9
	cfgTravelHotelAtlasMax    = 6
	cfgTravelTicketAtlasMax   = 5
	cfgTravelStrategyAtlasMax = 4
	cfgTravelRentCarAtlasMax  = 3
	cfgTravelVisaAtlasMax     = 2
	cfgTravelAgencyAtlasMax   = 4

	cfgTravelTrainCheck    = "1"
	cfgTravelTrainTouchURL = "https://m.ly.com/universal/touch/?refid=15628257#/index"
	cfgTravelTrainPCURL    = "" // inc 未定义 $customtravelTrainPcUrl → PHP null（JSON null）
	cfgTravelPlaneCheck    = "1"
	cfgTravelPlaneTouchURL = "https://m.ly.com/flightnew?refid=15628257"
	cfgTravelPlanePCURL    = "" // inc 未定义 → null
)

// nullString 区分 PHP 的 undefined → null（JSON null）与空串（JSON ""）。
type nullString struct {
	set bool
	v   string
}

func (n nullString) MarshalJSON() ([]byte, error) {
	if !n.set {
		return []byte("null"), nil
	}
	return []byte(`"` + jsonEscape(n.v) + `"`), nil
}

func jsonEscape(s string) string {
	// 仅处理 config 快照里会出现的字符；完整转义交给 encoding/json 会引号包裹，
	// 这里手写最小转义（反斜杠、引号、控制符）。
	r := strings.NewReplacer("\\", "\\\\", "\"", "\\\"", "\n", "\\n", "\r", "\\r", "\t", "\\t")
	return r.Replace(s)
}

// configInfo 字段顺序即 PHP $return 的赋值顺序（travel.class.php:200-245 else 全量分支）。
type configInfo struct {
	ChannelName          string     `json:"channelName"`
	LogoURL              string     `json:"logoUrl"`
	SubDomain            int        `json:"subDomain"`
	ChannelDomain        string     `json:"channelDomain"`
	ChannelSwitch        int        `json:"channelSwitch"`
	CloseCause           string     `json:"closeCause"`
	Title                string     `json:"title"`
	Keywords             string     `json:"keywords"`
	Description          string     `json:"description"`
	Hotline              string     `json:"hotline"`
	Template             string     `json:"template"`
	TouchTemplate        string     `json:"touchTemplate"`
	Map                  int        `json:"map"`
	SoftSize             int        `json:"softSize"`
	SoftType             string     `json:"softType"`
	ThumbSize            int        `json:"thumbSize"`
	ThumbType            string     `json:"thumbType"`
	StoreAtlasMax        int        `json:"storeatlasMax"`
	TravelHotelAtlasMax  int        `json:"travelhotelatlasMax"`
	TravelTicketAtlasMax int        `json:"travelticketatlasMax"`
	TravelStrategyMax    int        `json:"travelstrategyatlasMax"`
	TravelRentCarMax     int        `json:"travelrentcaratlasMax"`
	TravelVisaMax        int        `json:"travelvisaatlasMax"`
	TravelAgencyMax      int        `json:"travelagencyatlasMax"`
	TravelTrainCheck     string     `json:"travelTrainCheck"`
	TravelTrainTouchURL  string     `json:"travelTrainTouchUrl"`
	TravelTrainPCURL     nullString `json:"travelTrainPcUrl"`
	TravelPlaneCheck     string     `json:"travelPlaneCheck"`
	TravelPlaneTouchURL  string     `json:"travelPlaneTouchUrl"`
	TravelPlanePCURL     nullString `json:"travelPlanePcUrl"`
}

// config 迁移自 travel.class.php:27-249。
// 刻意保留的现状：
//  1. param 指定字段分支：$this->param 恒为数组 → $params=""，恒走全量 else（同 article #248 结论）；
//  2. $hotline = $hotline_config==0 ? $cfg_hotline : $customHotline；$hotline_config 未在
//     travel.inc.php 定义 → null==0 → 恒取系统 $cfg_hotline（canary 实测 "Telegram / WhatsApp 在线客服支持"）；
//  3. $custom_map=0 → empty → 取 $cfg_map（canary 实测 map=1，构建期快照）；
//  4. 分站高级配置（siteCityAdvancedConfig）canary 无数据，未实现；
//  5. $cityName 无分站时为 null → str_replace('$city', null, ...) 替换为空串。
func (s *Service) config(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	host := ""
	if req.HTTP != nil {
		host = req.HTTP.Host
		ctx = req.HTTP.Context()
	}
	o := fburl.Options{Host: host}

	logo := ""
	channelDomain := ""
	if s.files != nil {
		var base string
		if b, err := s.files.Domain(ctx, "", 0, false, o); err == nil {
			base = b
		}
		if d, err := s.files.Domain(ctx, "travel", cfgSubDomain, false, o); err == nil {
			channelDomain = d
		}
		// PHP: customLogo==1 ? getAttachemntFile(customLogoUrl) : getAttachemntFile(cfg_weblogo)
		// canary customLogo=0 → 系统站点 logo；getAttachemntFile 走 attachment.php 包装（同 article）。
		logo = base + "/include/attachment.php?f=" + s.logo
	} else {
		// 与 article/config.go 同口径：无 resolver 时按 Host 手工拼（本地环境）。
		h := host
		if hh, _, err := net.SplitHostPort(host); err == nil {
			h = hh
		}
		base := "http://" + h
		logo = base + "/include/attachment.php?f=" + s.logo
	}

	return ajax.Response{State: ajax.StateOK, Info: configInfo{
		ChannelName:          cfgChannelName,
		LogoURL:              logo,
		SubDomain:            cfgSubDomain,
		ChannelDomain:        channelDomain,
		ChannelSwitch:        cfgChannelSwitch,
		CloseCause:           cfgCloseCause,
		Title:                cfgSeoTitle,
		Keywords:             cfgSeoKeyword,
		Description:          strings.Trim(cfgSeoDesc, " \t\n\r\x00\x0B"),
		Hotline:              s.hot,
		Template:             "skin2",
		TouchTemplate:        "skin1",
		Map:                  1,
		SoftSize:             cfgSoftSize,
		SoftType:             cfgSoftType,
		ThumbSize:            cfgThumbSize,
		ThumbType:            cfgThumbType,
		StoreAtlasMax:        cfgStoreAtlasMax,
		TravelHotelAtlasMax:  cfgTravelHotelAtlasMax,
		TravelTicketAtlasMax: cfgTravelTicketAtlasMax,
		TravelStrategyMax:    cfgTravelStrategyAtlasMax,
		TravelRentCarMax:     cfgTravelRentCarAtlasMax,
		TravelVisaMax:        cfgTravelVisaAtlasMax,
		TravelAgencyMax:      cfgTravelAgencyAtlasMax,
		TravelTrainCheck:     cfgTravelTrainCheck,
		TravelTrainTouchURL:  cfgTravelTrainTouchURL,
		TravelTrainPCURL:     nullString{set: false},
		TravelPlaneCheck:     cfgTravelPlaneCheck,
		TravelPlaneTouchURL:  cfgTravelPlaneTouchURL,
		TravelPlanePCURL:     nullString{set: false},
	}}
}
