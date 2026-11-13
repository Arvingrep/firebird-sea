package article

import (
	"context"
	_ "embed"
	"net"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/fburl"
)

// 以下是 webroot/include/config/article.inc.php 的构建期快照（规则见 issue #248）。
// 与 siteconfig/modules.go 同做法：inc 文件是 PHP 运行期配置，Go 侧只留字面量。
const (
	cfgChannelName   = "马尼拉华人资讯"
	cfgSubDomain     = 2
	cfgChannelSwitch = 0
	cfgCloseCause    = "站点升级中。。。"
	cfgSeoTitle      = "马尼拉华人资讯 - 本地新闻动态"
	cfgSeoKeyword    = "马尼拉华人,菲律宾新闻,华人资讯,马尼拉生活,本地新闻,华人社区"
	cfgSeoDesc       = "马尼拉华人资讯平台，提供最新的本地新闻、社区动态、生活资讯，连接菲律宾华人社区"
	cfgAtlasMax      = 20
	cfgTemplate      = "skin8"
	cfgTouchTemplate = "skin4"
	cfgRewardLimit   = 100
	cfgGrantImg      = "VnpoWE1nSnFBVE1FUEZ3OQ=="
	cfgGrantTpl      = "WHpBQlpBUnNCalJXYmxNeg=="

	// customUpload=0：尺寸 / 类型取系统默认（$cfg_softSize 等），不是 inc 里的 custom_* 模块值。
	sysSoftSize  = 20480
	sysSoftType  = "zip|wa|rar|iso|doc|xsl|ppt|wps|xls|pdf|txt|csv"
	sysThumbSize = 5120
	sysThumbType = "jpg|jpeg|gif|png|swf|webp|svg"
	sysAtlasSize = 5120
	sysAtlasType = "jpg|jpeg|gif|png|webp|svg"

	// DefaultHotline 是 canary 的 $cfg_hotline。
	DefaultHotline = "Telegram / WhatsApp 在线客服支持"
)

// 配置文件里 customRewardOption 用 "\n" 换行，而 PHP 用 explode("\r\n") 切，切不开：
// floatval("1\n2\n5\n10\n20") = 1 → [1]。按现状复刻，不要"修复"。
var rewardOption = []float64{1}

//go:embed config_agreement.txt
var selfmediaAgreement string

var articleTypeOption = []string{"pic", "video", "short_video", "media", "special"}

// configInfo 字段顺序即 PHP $return 的赋值顺序。
type configInfo struct {
	ChannelName        string    `json:"channelName"`
	LogoURL            string    `json:"logoUrl"`
	SharePic           string    `json:"sharePic"`
	SubDomain          int       `json:"subDomain"`
	ChannelDomain      string    `json:"channelDomain"`
	ChannelSwitch      int       `json:"channelSwitch"`
	CloseCause         string    `json:"closeCause"`
	Title              string    `json:"title"`
	Keywords           string    `json:"keywords"`
	Description        string    `json:"description"`
	Hotline            string    `json:"hotline"`
	Submission         string    `json:"submission"`
	AtlasMax           int       `json:"atlasMax"`
	Template           string    `json:"template"`
	TouchTemplate      string    `json:"touchTemplate"`
	SoftSize           int       `json:"softSize"`
	SoftType           string    `json:"softType"`
	ThumbSize          int       `json:"thumbSize"`
	ThumbType          string    `json:"thumbType"`
	AtlasSize          int       `json:"atlasSize"`
	AtlasType          string    `json:"atlasType"`
	ListRule           int       `json:"listRule"`
	DetailRule         int       `json:"detailRule"`
	RewardSwitch       int       `json:"rewardSwitch"`
	RewardLimit        float64   `json:"rewardLimit"`
	RewardOption       []float64 `json:"rewardOption"`
	SelfmediaGrantImg  string    `json:"selfmediaGrantImg"`
	SelfmediaGrantTpl  string    `json:"selfmediaGrantTpl"`
	SelfmediaAgreement string    `json:"selfmediaAgreement"`
	ArticleTypeOption  []string  `json:"articleTypeOption"`
}

// config 迁移自 article.class.php:28-256，规则见 issue #248「业务规则」评论。
//
// 三条刻意保留的现状：
//  1. param 指定字段分支是死代码（$this->param 恒为数组），无论传不传 param 都返回全量；
//  2. customUpload=0 → 尺寸 / 类型取系统默认值；
//  3. rewardOption 恒为 [1]。
//
// 分站高级配置（siteCityAdvancedConfig）在 canary 无数据，未实现，恒走默认；
// $city 占位符在无分站时替换为空串。
func (s *Service) config(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	host := ""
	ua := ""
	if req.HTTP != nil {
		host = req.HTTP.Host
		ua = strings.ToLower(req.HTTP.UserAgent())
		ctx = req.HTTP.Context()
	}
	o := fburl.Options{Host: host}

	byteMini := strings.Contains(ua, "toutiaomicroapp") || req.Params.Get("platform_name") == "dy_miniprogram"
	rewardSwitch := 0
	if byteMini {
		rewardSwitch = 1
	}

	base := ""
	channelDomain := ""
	if s.files != nil {
		if b, err := s.files.Domain(ctx, "", 0, false, o); err == nil {
			base = b
		}
		if d, err := s.files.Domain(ctx, "article", cfgSubDomain, false, o); err == nil {
			channelDomain = d
		}
	} else {
		h := host
		if hh, _, err := net.SplitHostPort(host); err == nil {
			h = hh
		}
		base = "http://" + h
	}
	attach := func(f string) string { return base + "/include/attachment.php?f=" + f }

	sharePic := s.sharePic // customSharePic='' falsy → $cfg_sharePic
	city := ""             // 无分站：$siteCityInfo['name'] 为空
	rep := func(v string) string { return strings.ReplaceAll(v, "$city", city) }

	return ajax.Response{State: ajax.StateOK, Info: configInfo{
		ChannelName:        rep(cfgChannelName),
		LogoURL:            attach(s.webLogo),
		SharePic:           attach(sharePic),
		SubDomain:          cfgSubDomain,
		ChannelDomain:      channelDomain,
		ChannelSwitch:      cfgChannelSwitch,
		CloseCause:         cfgCloseCause,
		Title:              rep(cfgSeoTitle),
		Keywords:           rep(cfgSeoKeyword),
		Description:        rep(strings.Trim(cfgSeoDesc, " \t\n\r\x00\x0B")),
		Hotline:            s.hotline,
		Submission:         "",
		AtlasMax:           cfgAtlasMax,
		Template:           cfgTemplate,
		TouchTemplate:      cfgTouchTemplate,
		SoftSize:           sysSoftSize,
		SoftType:           sysSoftType,
		ThumbSize:          sysThumbSize,
		ThumbType:          sysThumbType,
		AtlasSize:          sysAtlasSize,
		AtlasType:          sysAtlasType,
		RewardSwitch:       rewardSwitch,
		RewardLimit:        cfgRewardLimit,
		RewardOption:       rewardOption,
		SelfmediaGrantImg:  attach(cfgGrantImg),
		SelfmediaGrantTpl:  attach(cfgGrantTpl),
		SelfmediaAgreement: selfmediaAgreement,
		ArticleTypeOption:  articleTypeOption,
	}}
}
