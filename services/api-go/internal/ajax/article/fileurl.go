package article

import (
	"context"
	"strings"
)

// 本文件是 webroot/include/common.func.php 里 getFilePath → getRealFilePath
// （第 4128 / 3758 行）的**按需子集**：只实现 canary 配置下会走到的分支。
//
// canary 的站点标量（siteConfig.inc.php）：$cfg_hideUrl=0（所以恒走 getRealFilePath）、
// $cfg_ftpType=3（华为云 OBS）、$cfg_remoteFtpUnify='1'、$cfg_uploadDir='/uploads'。
//
// 明确**没有**迁移的部分（遇到时行为与 PHP 不同，必须改代码而不是改配置）：
//   - searchAttachmentByFile() 的附件浏览计数写入。它在 PHP 里是「顺手记一次访问」的
//     副作用（往 #@__attachment 累计点击），不改变返回值；本接口是只读迁移，不复制写副作用。
//   - 模块级自定义 FTP 配置（webroot/include/config/<module>.inc.php 里的 $customFtp 系列）。
//     仓库内各模块 inc 都没有开启 $customFtp=1，所以站点级地址与模块级一致；开启后会错。
//   - 阿里云 / 七牛 / 腾讯云三种存储分支：Site.validate 直接拒绝装配。
//   - /static/ 分支里 PHP 的 file_exists 校验：Go 镜像里没有 webroot 目录，
//     无法判断文件是否真的存在，按「存在」处理（等价于 PHP 里文件已存在的最常见路径）。

const (
	// obsResizeParam 是 getRemoteImageResizeParam(platform=3) 的返回值
	// （common.func.php:3693-3718，华为云分支）。
	obsResizeParam = "?x-image-process=image/resize,m_fill,w_4096,h_4096"
)

// mediaExts 是 getRealFilePath 里「按附件处理」的扩展名白名单
// （common.func.php:3812，顺序与 PHP 一致，区分大小写）。
var mediaExts = []string{".jpg", ".jpeg", ".gif", ".png", ".bmp", ".mp4", ".mov", ".wav", ".mp3", ".wma", ".amr"}

// imageExts 是 getRemoteImageResizeParam 里「可加缩放参数」的扩展名白名单
// （common.func.php:3698）。视频不在其中：视频不加缩放参数。
var imageExts = []string{".jpg", ".jpeg", ".gif", ".png", ".bmp"}

// fileURL 是 getFilePath($file) 的等价实现（$resize、$local 都取默认值 true）。
func (s *Service) fileURL(raw string) string {
	if raw == "" {
		return ""
	}
	file := strings.ReplaceAll(raw, "||", "")
	// PHP：没有 '?' 时才把 '&type=' 改成 '?type='（把误写成查询串的老数据救回来）。
	if !strings.Contains(file, "?") {
		file = strings.ReplaceAll(file, "&type=", "?type=")
	}
	// 多图字段取第一张；已经是绝对地址的不拆（PHP 同样以 "http" 判断）。
	if !strings.Contains(file, "http") {
		if i := strings.Index(file, ","); i >= 0 {
			file = file[:i]
		}
	}

	if strings.Contains(file, "http") || strings.Contains(file, "//") {
		if strings.HasPrefix(file, "//") {
			return "https:" + file + s.resizeParam(file)
		}
		return file + s.resizeParam(file)
	}

	if hasAnyExt(file, mediaExts) {
		if !strings.Contains(file, "/static/") {
			domain, stripped := s.attachmentDomain(file)
			return domain + stripped + s.resizeParam(stripped)
		}
		// /static/ 分支：PHP 先用 file_exists(HUONIAOROOT.$file) 判本地文件，存在才返回
		// 站点域名 + 路径，否则**掉到下面的附件表反查**（通常查不到，返回空串）。
		// Go 镜像里没有 webroot，无法判存在，按不存在处理 —— 与 canary 实测一致
		// （getFilePath("/static/img/logo.png") 在容器内返回空串）。
	}

	// 剩下的形态：数字文件 ID 或加密串。PHP 会用它去 #@__attachment 反查真实路径
	// （common.func.php:3898-3905），查不到就返回 ""。
	path := s.attachmentPath(file)
	if path == "" {
		return ""
	}
	path = strings.ReplaceAll(path, "/uploads", "")
	return s.obsDomain() + path + s.resizeParam(path)
}

// attachmentDomain 复刻 getRealFilePath 里的 $fileDomain 计算（ftpType=3 / 0 两种）。
// 返回值是「域名」和「去掉 /uploads 之后的相对路径」。
func (s *Service) attachmentDomain(file string) (string, string) {
	if s.site.FTPType == ftpTypeOBS {
		domain := s.obsDomain()
		if strings.Contains(file, "/uploads") {
			file = strings.ReplaceAll(file, "/uploads", "")
		}
		return domain, file
	}
	// FTPType=0 且未开远程 FTP：本地目录，等价于 $cfg_secureAccess.$cfg_basehost.$cfg_uploadDir。
	domain := s.site.SecureAccess + s.site.BaseHost
	if !strings.Contains(file, s.site.UploadDir) {
		domain += s.site.UploadDir
	}
	return domain, file
}

// obsDomain 对应 (strstr($cfg_OBSUrl,'http') ? ” : $cfg_secureAccess) . $cfg_OBSUrl。
func (s *Service) obsDomain() string {
	if strings.Contains(s.site.OBSUrl, "http") {
		return s.site.OBSUrl
	}
	return s.site.SecureAccess + s.site.OBSUrl
}

// resizeParam 对应 getRemoteImageResizeParam($cfg_ftpType, $file, true)。
//
// 注意它**不看** $cfg_remoteFtpUnify：无论附件在不在远程，只要扩展名是图片、
// 地址里还没有 '?'，PHP 就会拼上缩放参数。插件/编辑器转存的图片不缩放。
func (s *Service) resizeParam(file string) string {
	if strings.Contains(file, "plugins") || strings.Contains(file, "editor") {
		return ""
	}
	if s.site.FTPType != ftpTypeOBS || file == "" || strings.Contains(file, "?") {
		return ""
	}
	if !hasAnyExt(file, imageExts) {
		return ""
	}
	return obsResizeParam
}

// attachmentPath 按数字 ID 或路径查 #@__attachment，返回库里存的 path。
// 查不到返回 ""（PHP 侧同样 return ""）。
func (s *Service) attachmentPath(file string) string {
	if s.db == nil {
		return ""
	}
	query := "SELECT `path` FROM " + s.attachTable + " WHERE `path` = ? LIMIT 1"
	if isNumeric(file) {
		query = "SELECT `path` FROM " + s.attachTable + " WHERE `id` = ? LIMIT 1"
	}
	var path string
	err := s.db.QueryRowContext(context.Background(), query, file).Scan(&path)
	if err != nil {
		return ""
	}
	return path
}

// hasAnyExt 复刻 PHP 的 strstr 链：命中任一扩展名即真（区分大小写）。
func hasAnyExt(file string, exts []string) bool {
	for _, ext := range exts {
		if strings.Contains(file, ext) {
			return true
		}
	}
	return false
}

// isNumeric 复刻 PHP 的 is_numeric：可选正负号 + 数字（允许小数）。
func isNumeric(s string) bool {
	if s == "" {
		return false
	}
	i := 0
	if s[i] == '+' || s[i] == '-' {
		i++
	}
	digits, dot := 0, false
	for ; i < len(s); i++ {
		switch {
		case s[i] >= '0' && s[i] <= '9':
			digits++
		case s[i] == '.' && !dot:
			dot = true
		default:
			return false
		}
	}
	return digits > 0
}
