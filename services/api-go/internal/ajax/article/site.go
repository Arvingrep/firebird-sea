package article

import (
	"fmt"
	"strconv"
	"strings"
)

// Site 是拼 URL 用到的站点标量，逐项对应 webroot/include/config/siteConfig.inc.php
// 里的全局变量。为什么不直接读数据库：这些值是**文件配置**（部署时写死在仓库里），
// 不是 #@__site_config 表里的运营配置，PHP 侧也是 require 文件拿到的。
type Site struct {
	// SecureAccess 对应 $cfg_secureAccess（common.inc.php:121，由 $cfg_httpSecureAccess 派生）。
	SecureAccess string
	// BaseHost 对应 $cfg_basehost（siteConfig.inc.php:2）。
	BaseHost string
	// UploadDir 对应 $cfg_uploadDir（siteConfig.inc.php:71）。
	UploadDir string
	// FTPType 对应 $cfg_ftpType（siteConfig.inc.php:109）：0 本地/FTP、1 阿里云 OSS、
	// 2 七牛、3 华为云 OBS、4 腾讯云 COS。
	FTPType int
	// FTPState 对应 $cfg_ftpState（siteConfig.inc.php:110），只在 FTPType=0 时生效。
	FTPState int
	// OBSUrl 对应 $cfg_OBSUrl（siteConfig.inc.php:129）。
	OBSUrl string
	// RemoteFTPUnify 对应 $cfg_remoteFtpUnify（siteConfig.inc.php:139）：
	// 开启后不再按模块截取附件归属，直接用站点级远程存储地址。
	RemoteFTPUnify bool
}

// 附件存储模式常量，取值同 PHP 的 $cfg_ftpType。
const (
	ftpTypeLocal = 0
	ftpTypeOBS   = 3
)

// DefaultSite 是 canary 当前的站点标量，默认值逐项抄自仓库文件，
// 因此不配任何环境变量时行为与 PHP 一致（见 site_test.go 的对照用例）。
func DefaultSite() Site {
	return Site{
		SecureAccess:   "https://",
		BaseHost:       "fbird.men",
		UploadDir:      "/uploads",
		FTPType:        ftpTypeOBS,
		FTPState:       1,
		OBSUrl:         "https://storage.googleapis.com/fbird-sea-uploads/",
		RemoteFTPUnify: true,
	}
}

// SiteFromEnv 用环境变量覆盖默认值。缺省、空值或无法解析时保留默认值：
// 这些是部署配置，配错的表现是 URL 错位，比启动失败更容易被发现。
// 变量名与 PHP 侧配置项一一对应，方便运维对照。
func SiteFromEnv(getenv func(string) string) Site {
	site := DefaultSite()
	if v := strings.TrimSpace(getenv("SITE_HTTP_SECURE")); v != "" {
		site.SecureAccess = schemeFor(v != "0")
	}
	if v := strings.TrimSpace(getenv("SITE_BASEHOST")); v != "" {
		site.BaseHost = v
	}
	if v := strings.TrimSpace(getenv("SITE_UPLOAD_DIR")); v != "" {
		site.UploadDir = v
	}
	if v, err := strconv.Atoi(strings.TrimSpace(getenv("SITE_FTP_TYPE"))); err == nil {
		site.FTPType = v
	}
	if v, err := strconv.Atoi(strings.TrimSpace(getenv("SITE_FTP_STATE"))); err == nil {
		site.FTPState = v
	}
	if v := strings.TrimSpace(getenv("SITE_OBS_URL")); v != "" {
		site.OBSUrl = v
	}
	if v := strings.TrimSpace(getenv("SITE_REMOTE_FTP_UNIFY")); v != "" {
		site.RemoteFTPUnify = v != "0"
	}
	return site
}

// HTTPSecure 报告默认口径是否是 https（仅用于注释性判断，不参与拼串）。
func (s Site) HTTPSecure() bool { return s.SecureAccess == "https://" }

func schemeFor(secure bool) string {
	if secure {
		return "https://"
	}
	return "http://"
}

// validate 拦住两类装配错误：空域名（拼出来是 "/user/1"）和未实现的附件模式。
// 未实现的模式必须启动期失败——静默降级会让 photo 字段悄悄变空，
// 而这种差异不会让任何测试变红。
func (s Site) validate() error {
	if s.BaseHost == "" {
		return fmt.Errorf("article: Site.BaseHost 不能为空")
	}
	if s.SecureAccess != "https://" && s.SecureAccess != "http://" {
		return fmt.Errorf("article: Site.SecureAccess %q 必须是 http:// 或 https://", s.SecureAccess)
	}
	switch s.FTPType {
	case ftpTypeOBS:
		if s.OBSUrl == "" {
			return fmt.Errorf("article: FTPType=3 需要 Site.OBSUrl（对应 $cfg_OBSUrl）")
		}
	case ftpTypeLocal:
		if s.FTPState == 1 {
			// 远程 FTP 模式的域名来自 $cfg_ftpUrl + $cfg_ftpDir（canary 都是空串，
			// 从没启用过）。要支持必须先补两个标量和对应分支。
			return fmt.Errorf("article: FTPType=0 且 FTPState=1（远程 FTP）未实现，canary 用的是 OBS")
		}
	default:
		// 阿里云 / 七牛 / 腾讯云分支没迁移（canary 用的是 OBS）。要切走必须先实现
		// getRealFilePath 里对应分支，否则 photo 会指向错误域名。
		return fmt.Errorf("article: Site.FTPType=%d 的附件地址分支未实现（当前只支持 0 本地 / 3 OBS）", s.FTPType)
	}
	return nil
}
