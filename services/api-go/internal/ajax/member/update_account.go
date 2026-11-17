package member

import (
	"context"
	"crypto/md5"
	"crypto/sha1"
	"database/sql"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"net"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/fburl"
)

// updateAccount 迁移自 member.class.php:3070-3799（#261）。
//
// 门禁只有登录（-1 → 101「登录超时」），没有实名/手机/验证码前置校验；do 没有白名单，
// 未命中（含缺失、数组）→ 函数无 return → 102 "No data!"。101 是绝大多数错误的实际码
// （外层 handlers 把 state 200 统一改写成 101），只有 do 未命中才是 102。
//
// 入参口径（ajax.php:54-123，本文件 p.norm 复刻）：
//   - 'undefined' 在入口已被换成空串（函数里的 == "undefined" 判断全是死代码，不实现）；
//   - 值 = addslashes(stripslashes(removeInvisibleCharacters(v)))；RemoveXSS 黑名单过滤
//     与现有各 action 保持一致未实现（常规字符不受影响）；
//   - 含 '[{' 或能解码成 PHP 数组的 JSON 原样保留（phoneData 通常是 URL 编码串 → 会被转义）；
//   - PHP 把归一后的值拼进 SQL，MySQL 字面量再解一次反斜杠 → 落库/比较的最终值是
//     再 stripslashes 一次的结果（见 storedOf）；password/paypwd 哈希的输入则是转义后的值。
//
// 已知偏差（不影响响应口径，同 #255/#259 的注记）：
//   - member_log 的 ipaddr（getIpAddr 需要 IP 库）写空串；
//   - messageLog 的 ip 用 GetIP 明口径（无端口），memberLog 沿用 ip:port；
//   - param[] 数组形态（name[]=x）在 PHP 8 里 trim() 会 TypeError 500，Go 按 101 处理；
//   - do=chphone 的微信/抖音支路、do=certify 的 OCR 分支依赖外部服务，经 Dep 钩子注入，
//     nil 时按「解析失败 / 发送失败」口径返回（见各函数注释）。
const (
	infoNickEditDefault  = "功能维护中，暂停使用！"                 // cfg_nicknameEditInfo 未配置
	infoNickInput        = "请输入新昵称"                      // siteConfig[20][87]
	infoNickNoChange     = "昵称没有变化"                      // member.class.php:3104
	infoCompanyExists    = "公司名称已存在，请确认后重试，或者联系网站客服申诉！"  // [20][614]
	infoNickTaken        = "昵称被占用，请换一个！"                 // [20][615]
	infoModifySuccess    = "修改成功！"                       // [20][229]
	infoModifyFail       = "修改失败！"                       // [33][20]
	infoInputFull        = "请输入完整！"                      // [21][45]
	infoPwdWrong         = "您输入的当前密码不正确，请确认后重试！"         // [21][43]
	infoPwdMismatch      = "两次输入的新密码不一致，请重新输入！"          // [21][44]
	infoPaySimple        = "支付密码太过简单，请重新输入！"             // [21][46]
	infoPaySimpleNew     = "新的支付密码太过简单，请重新输入！"           // [21][47]
	infoSetSuccess       = "设置成功！"                       // [33][24]
	infoSetFail          = "设置失败！"                       // [33][25]
	infoLicenseEmpty     = "请上传营业执照！"                    // [20][109]
	infoCompanyCertDone  = "您的企业认证已经通过审核！"               // [21][48]
	infoCompanyCertPend  = "您的企业认证信息已经提交，请等待工作人员审核！"     // [21][49]
	infoCertDone         = "您的实名认证已经通过审核！"               // [21][50]
	infoCertPend         = "您的实名认证信息已经提交，请等待工作人员审核！"     // [21][51]
	infoIdcardTaken      = "您输入的身份证号码已经被其他帐号绑定！"         // [21][52]
	infoCertSubmitted    = "提交成功，请等待工作人员审核！"             // [21][53]
	infoCertPassed       = "审核通过"                        // [26][73]
	infoNoCertData       = "获取失败，您还未提交实名认证信息！"           // [21][54]
	infoNoLicenseData    = "获取失败，您还未提交公司认证信息！"           // [21][55]
	infoPhoneTaken       = "您输入的手机号码已经被其他帐号绑定！"          // [21][56]
	infoVerifyCodeWrong  = "验证码输入错误，请重试！"                // [20][99]
	infoVerifyCodeStale  = "验证码已过期，请重新获取！"               // [21][33]
	infoSmsNotConfigured = "短信平台未配置，发送失败！"               // [33][3]
	infoEmailInvalid     = "请输入正确的邮箱地址！"                 // [21][57]
	infoEmailTaken       = "您输入的邮箱已经被其他帐号绑定！"            // [21][58]
	infoMailSendFail     = "邮件发送失败，请稍候重试！"               // [21][37]
	infoMailSent         = "邮件发送成功，请在24小时内点击邮件中的链接继续操作！" // [21][38]
	infoMailDisabled     = "邮件通知功能未开启，发送失败！"             // [33][4]
	infoPhoneVerified    = "验证通过！"                       // [33][23]
	infoQuestionSet      = "您已经设置过安全保护问题！"               // [21][59]
	infoQuestionOne      = "请选择问题一！"                     // [21][60]
	infoQuestionTwo      = "请选择问题二！"                     // [21][61]
	infoQuestionAnswer   = "请输入您的问题答案！"                  // [21][62]
	infoQuestionFail     = "设置失败，请刷新页面重试！"               // [21][63]
	infoCodeParamFail    = "参数[code]传递失败，请检查后重试！"
	infoPhoneParseFail   = "手机号码解析失败，请重试，错误信息："
	infoFrontParseFail   = "身份信息正面解析失败，请重新上传清晰有效的身份证照片"
	infoBackParseFail    = "身份信息反面解析失败，请重新上传清晰有效的身份证照片"
	infoCardExpired      = "身份证件已过期，请上传最新的身份证照片"
	infoNameMismatch     = "身份证照片中的姓名和您填写的姓名不一致"
	infoNoMismatch       = "身份证照片中的身份证号码和您填写的号码不一致"
	infoIdCheckFail      = "身份信息不匹配，请核实填写的姓名和身份证号码是否正确!"
)

// notifyMailTemplate 是「会员-手机邮箱绑定-发送验证码」（getInfoTempContent 的 notify）。
const notifyMailTemplate = "会员-手机邮箱绑定-发送验证码"

var (
	emailCheckPattern = regexp.MustCompile(`(?i)^[a-z0-9]+([\+_\-\.]?[a-z0-9]+)*@([a-z0-9]+[\-]?[a-z0-9]+\.)+[a-z]{2,6}$`)
	digitPattern      = regexp.MustCompile(`\d`)
	lowerPattern      = regexp.MustCompile(`[a-z]`)
	upperPattern      = regexp.MustCompile(`[A-Z]`)
	specialPattern    = regexp.MustCompile(`[^a-zA-Z\d]`)
	// removeInvisiblePattern 迁移 common.inc.php:1820（/u 修饰符的 Unicode 区段黑名单）。
	removeInvisiblePattern = regexp.MustCompile(
		`[\x{007f}-\x{009f}]|\x{00ad}|[\x{0483}-\x{0489}]|[\x{0559}-\x{055a}]|\x{058a}|[\x{0591}-\x{05bd}]|\x{05bf}|` +
			`[\x{05c1}-\x{05c2}]|[\x{05c4}-\x{05c7}]|[\x{0606}-\x{060a}]|[\x{063b}-\x{063f}]|\x{0674}|[\x{06e5}-\x{06e6}]|\x{070f}|` +
			`[\x{076e}-\x{077f}]|\x{0a51}|\x{0a75}|\x{0b44}|[\x{0b62}-\x{0b63}]|[\x{0ce2}-\x{0ce3}]|[\x{0d62}-\x{0d63}]|\x{135f}|` +
			`[\x{200b}-\x{200f}]|[\x{2028}-\x{202e}]|\x{2044}|\x{2071}|[\x{f701}-\x{f70e}]|[\x{f710}-\x{f71a}]|\x{fb1e}|` +
			`[\x{fc5e}-\x{fc62}]|\x{feff}|\x{fffc}`)
)

// updateAccount 的 action 入口；分支实现见下方各函数。
func (s *Service) updateAccount(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	var httpReq *http.Request
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
		httpReq = req.HTTP
	}
	p := newParams(req)

	// 登录门禁：$id = getMemberID()，-1 → state 200（外层改 101）。
	id, err := s.identityID(ctx, httpReq)
	if err != nil {
		return noData()
	}
	if id == -1 {
		return fail(infoLoginTimeout)
	}
	if s.db == nil {
		return noData()
	}

	switch p.norm("do") {
	case "nick":
		return s.updateNick(ctx, httpReq, p, id)
	case "password":
		return s.updatePassword(ctx, httpReq, p, id)
	case "paypwdAdd":
		return s.updatePaypwdAdd(ctx, httpReq, p, id)
	case "paypwdEdit":
		return s.updatePaypwdEdit(ctx, httpReq, p, id)
	case "certify":
		return s.updateCertify(ctx, httpReq, p, id)
	case "getCerfityData":
		return s.getCerfityData(ctx, httpReq, id)
	case "chphone":
		return s.updateChphone(ctx, httpReq, p, id)
	case "chemail":
		return s.updateChemail(ctx, httpReq, p, id)
	case "question":
		return s.updateQuestion(ctx, httpReq, p, id)
	}
	// do 未命中：函数无 return → 外层 102 "No data!"。
	return noData()
}

// —— 参数归一（ajax.php:54-123）——

// norm 对应 updateAccount 用到的标量参数口径；数组形态（key[]）取不到值按空串处理
// （PHP 里是数组，进函数后按 "Array"/TypeError 处理的极端形态不在覆盖范围）。
func (p params) norm(key string) string { return ajaxEntryNormalize(p.req.Params.Get(key)) }

func ajaxEntryNormalize(v string) string {
	if v == "undefined" {
		return ""
	}
	if strings.Contains(v, "[{") {
		return v
	}
	var arr []any
	var obj map[string]any
	if json.Unmarshal([]byte(v), &arr) == nil && arr != nil ||
		json.Unmarshal([]byte(v), &obj) == nil && obj != nil {
		return v // json_decode 成数组/对象 → 原样保留
	}
	if !utf8.ValidString(v) {
		// preg_replace(/u) 在非法 UTF-8 上返回 null → 后续所有处理都是空串。
		return ""
	}
	return phpAddslashes(phpStripslashes(removeInvisiblePattern.ReplaceAllString(v, "")))
}

// phpAddslashes 迁移 PHP addslashes：' " \ 与 NUL 前加反斜杠。
func phpAddslashes(s string) string {
	var b strings.Builder
	for i := 0; i < len(s); i++ {
		switch s[i] {
		case 0:
			b.WriteString(`\` + "\x00")
		case '\'', '"', '\\':
			b.WriteByte('\\')
			b.WriteByte(s[i])
		default:
			b.WriteByte(s[i])
		}
	}
	return b.String()
}

// phpStripslashes 迁移 PHP stripslashes：只剥 \' \" \\ 与 \0 的反斜杠，其它保留。
func phpStripslashes(s string) string {
	var b strings.Builder
	for i := 0; i < len(s); i++ {
		if s[i] == '\\' && i+1 < len(s) {
			switch s[i+1] {
			case '\\', '\'', '"', 0:
				b.WriteByte(s[i+1])
				i++
				continue
			}
		}
		b.WriteByte(s[i])
	}
	return b.String()
}

// storedOf 对应「PHP 拼 SQL 字面量 → MySQL 解析」后的最终落库/比较值：
// 转义值被字面量解析再剥一次反斜杠。
func storedOf(escaped string) string { return phpStripslashes(escaped) }

// —— 公共算法 ——

// cnSubstrR 迁移 string.class.php:24 的宽度截断：首字节 ≥192 的字符（中文等多字节，
// UTF-8 首字节 ≥0xC2，ord() ≥192/224 两分支同口径）与大写字母计 1 宽，
// 小写字母与半角符号（含数字）计 0.5 宽。slen=20 时 21 个中文截到 20 个，
// 40 个小写字母正好 20 宽不截断。
func cnSubstrR(str string, slen int) string {
	runes := []rune(str)
	out := make([]rune, 0, len(runes))
	width := 0.0
	for i := 0; i < len(runes) && width < float64(slen); i++ {
		r := runes[i]
		out = append(out, r)
		switch {
		case r >= 128:
			width++
		case r >= 'A' && r <= 'Z':
			width++
		default:
			width += 0.5
		}
	}
	return string(out)
}

// phpValidatePassword 迁移 util.class.php:181。level 对应 (int)$cfg_pwdLevel：
// 0 不校验 / 1 只查长度 / 2 数字+字母 / 3（及其它非 0/1/2 值）走极致判定。
func phpValidatePassword(password string, level int) string {
	if level == 0 {
		return "ok"
	}
	if len(password) < 8 {
		return "密码不安全，长度不得小于8位！"
	}
	if level == 1 {
		return "ok"
	}
	hasDigit := digitPattern.MatchString(password)
	hasLower := lowerPattern.MatchString(password)
	hasUpper := upperPattern.MatchString(password)
	hasSpecial := specialPattern.MatchString(password)
	if level == 2 {
		if hasDigit && (hasLower || hasUpper) {
			return "ok"
		}
		return "密码不安全，必须包含数字和字母！"
	}
	// 极致：连续（abc/cba/123/321）与重复（aaa/111）三连检查。
	notRepeat := true
	for i := 0; i+2 < len(password); i++ {
		c1, c2, c3 := int(password[i]), int(password[i+1]), int(password[i+2])
		if absInt(c2-c1) == 1 && absInt(c3-c2) == 1 && c2-c1 == c3-c2 {
			notRepeat = false
		}
		if c1 == c2 && c2 == c3 {
			notRepeat = false
		}
	}
	if hasDigit && hasLower && hasUpper && hasSpecial && notRepeat {
		return "ok"
	}
	return "密码不安全，必须包含数字、小写字母、大写字母和特殊字符，同时不能用连续或重复的字母和数字(如abc/cba/123/321/aaa/666等)"
}

func absInt(v int) int {
	if v < 0 {
		return -v
	}
	return v
}

// newSaltedHash 迁移 userLogin.class.php:2079（无盐入参）：salt = substr(md5(time()),0,7)，
// hash = salt + sha1(salt + str)，共 47 字符。同一秒内两次调用 salt 相同，跨秒不同。
func (s *Service) newSaltedHash(str string) string {
	sum := md5.Sum([]byte(strconv.FormatInt(s.now().Unix(), 10)))
	salt := hex.EncodeToString(sum[:])[:7]
	return salt + sha1Hex(salt+str)
}

// saltedHashVerify 用已有哈希的前 7 位当盐复算（PHP 校验口径）。
// stored 为空（PHP 的 null/""，如第三方登录账号）时盐为空串，复算必与 stored 不等。
func saltedHashVerify(str, stored string) string {
	n := 7
	if len(stored) < n {
		n = len(stored)
	}
	salt := stored[:n]
	return salt + sha1Hex(salt+str)
}

func sha1Hex(s string) string {
	sum := sha1.Sum([]byte(s))
	return hex.EncodeToString(sum[:])
}

// looseEqInt 对应 PHP 8 的 `$dbValue == <int>`：数字串按数值比，非数字串把整数转回
// 字符串比（0 == "abc" 在 PHP 8 为 false），null 与 0 相等。
func looseEqInt(v sql.NullString, n int) bool {
	if !v.Valid {
		return n == 0
	}
	s := strings.TrimSpace(v.String)
	if isNumeric(s) {
		return phpFloatValue(s) == float64(n)
	}
	return s == strconv.Itoa(n)
}

// getFilePathURL 对应 getFilePath($file)：空返回空串；Files 未接入时原样返回（#330）。
func (s *Service) getFilePathURL(ctx context.Context, req *http.Request, path string) string {
	if !truthyStr(path) {
		return ""
	}
	if s.files == nil {
		return path
	}
	host := ""
	if req != nil {
		host = req.Host
	}
	u, err := s.files.File(ctx, path, fburl.Options{Host: host})
	if err != nil {
		return ""
	}
	return u
}

// accountInfo 是 getMemberInfo()（userLogin.class.php:687 → member.detail 投影）里
// updateAccount 用到的字段。会员不存在时 detail 返回空数组，字段全为 PHP 的 null：
// userType 非 1/2（nick 走个人、certify 101「设置失败！」）、pwd 假（password 不校验
// 旧密码）、nickname 为 null（命中「昵称没有变化」）。
type accountInfo struct {
	missing  bool
	nickname any // nil 或 string（mtype=2 且 company 真值时是 company）
	userType int64
	pwd      int64
}

func (s *Service) getAccountInfo(ctx context.Context, req *http.Request) (accountInfo, error) {
	var ai accountInfo
	v, err := s.userDetail(ctx, req, "", false)
	if err != nil {
		return ai, err
	}
	o, ok := v.(*Object)
	if !ok {
		ai.missing = true
		return ai, nil
	}
	ai.nickname, _ = o.Get("nickname")
	if ut, ok := o.Get("userType"); ok {
		ai.userType = int64(phpIntval(phpScalarString(ut)))
	}
	if pw, ok := o.Get("pwd"); ok {
		ai.pwd = int64(phpIntval(phpScalarString(pw)))
	}
	return ai, nil
}

// platformName 对应 $_REQUEST['platform_name']（EGPCS：Cookie > POST > GET）。
func platformName(req *http.Request) string {
	if req == nil {
		return ""
	}
	if c, err := req.Cookie("platform_name"); err == nil {
		return c.Value
	}
	if v := req.PostForm["platform_name"]; len(v) > 0 {
		return v[len(v)-1]
	}
	if v := req.URL.Query()["platform_name"]; len(v) > 0 {
		return v[len(v)-1]
	}
	return ""
}

// isWxMiniprogram 迁移 common.inc.php:1709；isByteMiniprogram 同文件 1754。
func isWxMiniprogram(req *http.Request) bool {
	if req == nil {
		return false
	}
	ua := strings.ToLower(req.UserAgent())
	if strings.Contains(ua, "micromessenger") &&
		(strings.Contains(ua, "wechatdevtools") || strings.Contains(ua, "miniprogram")) {
		return true
	}
	return platformName(req) == "wx_miniprogram"
}

func isByteMiniprogram(req *http.Request) bool {
	if req == nil {
		return false
	}
	if strings.Contains(strings.ToLower(req.UserAgent()), "toutiaomicroapp") {
		return true
	}
	return platformName(req) == "dy_miniprogram"
}

// phpUrlDecode 迁移 PHP urldecode：'+' → 空格，%XX 解码（非法序列原样保留）。
func phpUrlDecode(s string) string {
	var b strings.Builder
	for i := 0; i < len(s); i++ {
		switch {
		case s[i] == '+':
			b.WriteByte(' ')
		case s[i] == '%' && i+2 < len(s):
			hi, ok1 := unhex(s[i+1])
			lo, ok2 := unhex(s[i+2])
			if ok1 && ok2 {
				b.WriteByte(hi<<4 | lo)
				i += 2
				continue
			}
			b.WriteByte(s[i])
		default:
			b.WriteByte(s[i])
		}
	}
	return b.String()
}

func unhex(c byte) (byte, bool) {
	switch {
	case c >= '0' && c <= '9':
		return c - '0', true
	case c >= 'a' && c <= 'f':
		return c - 'a' + 10, true
	case c >= 'A' && c <= 'F':
		return c - 'A' + 10, true
	}
	return 0, false
}

// plainIP 对应 GetIP()：不带端口（memberLog 的 ip 列是 ip:port，两者口径不同）。
func plainIP(req *http.Request) string {
	ip, _ := requestIP(req)
	if host, _, err := net.SplitHostPort(ip); err == nil {
		return host
	}
	return ip
}

// —— do=nick（member.class.php:3085-3152）——

func (s *Service) updateNick(ctx context.Context, httpReq *http.Request, p params, id int64) ajax.Response {
	uid := strconv.FormatInt(id, 10)
	if s.nicknameEditState != 0 {
		info := s.nicknameEditInfo
		if !truthyStr(info) {
			info = infoNickEditDefault
		}
		return fail(info)
	}
	// filterSensitiveWords：addslashes(stripslashes()) 与入口归一互抵，cfg_moderationWB
	// 关闭时（canary）无第三方检测 → no-op；照 PHP 顺序 trim。
	name := strings.Trim(p.norm("name"), phpTrimChars)
	if phpEmptyString(name) { // empty()："" 与 "0" 都是空
		return fail(infoNickInput)
	}
	name = cnSubstrR(name, 20) // 截断在转义值上做
	nick := storedOf(name)

	mi, err := s.getAccountInfo(ctx, httpReq)
	if err != nil {
		return noData()
	}
	// 【必读】$nickname 是从未赋值的变量（PHP 8 为 null）：null == $memberInfo['nickname']
	// 只在原昵称为 null/""（含会员不存在）时成立，"昵称没有变化"实际是死分支，照搬不修。
	if mi.nickname == nil || mi.nickname == "" {
		return fail(infoNickNoChange)
	}

	var sqlText string
	if mi.userType == 2 {
		// 企业：重名查 company 或 nickname（比较值是字面量解析后的明文）。
		var total int
		if err := s.db.QueryRowContext(ctx,
			"SELECT count(`id`) totalCount FROM "+s.memberTable+" WHERE (`company` = ? OR `nickname` = ?) AND `id` != ?",
			nick, nick, id).Scan(&total); err != nil {
			total = 0
		}
		if total > 0 {
			return fail(infoCompanyExists)
		}
		if s.nicknameEditAudit != 0 {
			sqlText = "UPDATE `" + s.prefix + "member` SET `nickname_audit` = '" + name + "', `nickname_state` = '审核中' WHERE `id` = " + uid
		} else {
			sqlText = "UPDATE `" + s.prefix + "member` SET `nickname` = '" + name + "', `company` = '" + name + "' WHERE `id` = " + uid
		}
	} else {
		var total int
		if err := s.db.QueryRowContext(ctx,
			"SELECT count(`id`) totalCount FROM "+s.memberTable+" WHERE `nickname` = ? AND `id` != ?",
			nick, id).Scan(&total); err != nil {
			total = 0
		}
		if total > 0 {
			return fail(infoNickTaken)
		}
		if s.nicknameEditAudit != 0 {
			sqlText = "UPDATE `" + s.prefix + "member` SET `nickname_audit` = '" + name + "', `nickname_state` = '审核中' WHERE `id` = " + uid
		} else {
			sqlText = "UPDATE `" + s.prefix + "member` SET `nickname` = '" + name + "' WHERE `id` = " + uid
		}
	}

	// dsqlOper type=update 无论影响 0 行都返回 "ok"，只有 SQL 异常才失败。
		if s.nicknameEditAudit != 0 {
			if _, err := s.db.ExecContext(ctx,
				"UPDATE "+s.memberTable+" SET `nickname_audit` = ?, `nickname_state` = ? WHERE `id` = ?",
				nick, "审核中", id); err != nil {
				return fail(infoModifyFail)
			}
		} else if mi.userType == 2 {
		if _, err := s.db.ExecContext(ctx,
			"UPDATE "+s.memberTable+" SET `nickname` = ?, `company` = ? WHERE `id` = ?", nick, nick, id); err != nil {
			return fail(infoModifyFail)
		}
	} else {
		if _, err := s.db.ExecContext(ctx,
			"UPDATE "+s.memberTable+" SET `nickname` = ? WHERE `id` = ?", nick, id); err != nil {
			return fail(infoModifyFail)
		}
	}
	s.memberLog(ctx, httpReq, uid, "member", "", 0, "update", "修改昵称", "", sqlText)
	return ajax.Response{State: ajax.StateOK, Info: infoModifySuccess}
}

// —— do=password（member.class.php:3155-3194）——

func (s *Service) updatePassword(ctx context.Context, httpReq *http.Request, p params, id int64) ajax.Response {
	uid := strconv.FormatInt(id, 10)
	// getMemberInfo 在参数校验之前调用（detail 的查询先跑）。
	mi, err := s.getAccountInfo(ctx, httpReq)
	if err != nil {
		return noData()
	}
	// $u_pwd 是 member.detail 的 pwd（1/0）：第三方登录账号无密码 → 不校验旧密码。
	uPwd := mi.pwd == 1

	old, new, confirm := p.norm("old"), p.norm("new"), p.norm("confirm")
	if (uPwd && phpEmptyString(old)) || phpEmptyString(new) || phpEmptyString(confirm) {
		return fail(infoInputFull)
	}
	if msg := phpValidatePassword(new, s.pwdLevel); msg != "ok" { // strlen 数的是转义后的值
		return fail(msg)
	}

	// member 表的 password 不在 AES 敏感字段列表里，明文哈希存取。
	var stored sql.NullString
	pwd := ""
	if err := s.db.QueryRowContext(ctx,
		"SELECT `password` FROM "+s.memberTable+" WHERE `id` = ?", id).Scan(&stored); err == nil && stored.Valid {
		pwd = stored.String
	}
	if uPwd && saltedHashVerify(old, pwd) != pwd {
		return fail(infoPwdWrong)
	}
	if new != confirm {
		return fail(infoPwdMismatch)
	}
	newPass := s.newSaltedHash(new)
	sqlText := "UPDATE `" + s.prefix + "member` SET `password` = '" + newPass + "' WHERE `id` = " + uid
	if _, err := s.db.ExecContext(ctx,
		"UPDATE "+s.memberTable+" SET `password` = ? WHERE `id` = ?", newPass, id); err != nil {
		return fail(infoModifyFail)
	}
	s.memberLog(ctx, httpReq, uid, "member", "", 0, "update", "修改登录密码", "", sqlText)
	return ajax.Response{State: ajax.StateOK, Info: infoModifySuccess}
}

// —— do=paypwdAdd / paypwdEdit（member.class.php:3197-3251）——

func (s *Service) updatePaypwdAdd(ctx context.Context, httpReq *http.Request, p params, id int64) ajax.Response {
	uid := strconv.FormatInt(id, 10)
	pay1, pay2 := p.norm("pay1"), p.norm("pay2")
	// pay2 只判非空，不判与 pay1 相等（bug 照搬）。
	if phpEmptyString(pay1) || phpEmptyString(pay2) {
		return fail(infoInputFull)
	}
	if len(pay1) < 6 {
		return fail(infoPaySimple)
	}
	paypwd := s.newSaltedHash(pay1)
	sqlText := "UPDATE `" + s.prefix + "member` SET `paypwd` = '" + paypwd + "', `paypwdCheck` = 1 WHERE `id` = " + uid
	if _, err := s.db.ExecContext(ctx,
		"UPDATE "+s.memberTable+" SET `paypwd` = ?, `paypwdCheck` = 1 WHERE `id` = ?", paypwd, id); err != nil {
		return fail(infoSetFail)
	}
	s.memberLog(ctx, httpReq, uid, "member", "", 0, "update", "设置支付密码", "", sqlText)
	return ajax.Response{State: ajax.StateOK, Info: infoSetSuccess}
}

func (s *Service) updatePaypwdEdit(ctx context.Context, httpReq *http.Request, p params, id int64) ajax.Response {
	uid := strconv.FormatInt(id, 10)
	old, new, confirm := p.norm("old"), p.norm("new"), p.norm("confirm")
	if phpEmptyString(old) || phpEmptyString(new) || phpEmptyString(confirm) {
		return fail(infoInputFull)
	}
	if len(new) < 6 {
		return fail(infoPaySimpleNew)
	}
	// 不校验 paypwdCheck、不判 paypwd 是否为空（第三方账号 paypwd 为空 → 复算必不等 → 101）。
	var stored sql.NullString
	paypwd := ""
	if err := s.db.QueryRowContext(ctx,
		"SELECT `paypwd` FROM "+s.memberTable+" WHERE `id` = ?", id).Scan(&stored); err == nil && stored.Valid {
		paypwd = stored.String
	}
	if saltedHashVerify(old, paypwd) != paypwd {
		return fail(infoPwdWrong)
	}
	if new != confirm {
		return fail(infoPwdMismatch)
	}
	newPass := s.newSaltedHash(new)
	sqlText := "UPDATE `" + s.prefix + "member` SET `paypwd` = '" + newPass + "' WHERE `id` = " + uid
	if _, err := s.db.ExecContext(ctx,
		"UPDATE "+s.memberTable+" SET `paypwd` = ? WHERE `id` = ?", newPass, id); err != nil {
		return fail(infoModifyFail)
	}
	s.memberLog(ctx, httpReq, uid, "member", "", 0, "update", "修改支付密码", "", sqlText)
	return ajax.Response{State: ajax.StateOK, Info: infoModifySuccess}
}

// —— do=certify（member.class.php:3254-3426）——

func (s *Service) updateCertify(ctx context.Context, httpReq *http.Request, p params, id int64) ajax.Response {
	mi, err := s.getAccountInfo(ctx, httpReq)
	if err != nil {
		return noData()
	}
	realname := cnSubstrR(strings.Trim(p.norm("realname"), phpTrimChars), 20)
	idcard := cnSubstrR(strings.Trim(p.norm("idcard"), phpTrimChars), 18)
	front, back, license := p.norm("front"), p.norm("back"), p.norm("license")

	if phpEmptyString(realname) || phpEmptyString(idcard) || phpEmptyString(front) || phpEmptyString(back) {
		return fail(infoInputFull)
	}
	// 身份证占用：canary 无 $cfg_aes_key → 敏感字段（realname/idcard/email/phone/address）
	// 明文存取，dsql 的 processSensitiveFieldsInSQL 原样透传，这里直接明文条件。
	var total int
	if err := s.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM "+s.memberTable+" WHERE `idcard` = ? AND `id` != ?",
		storedOf(idcard), id).Scan(&total); err != nil {
		total = 0
	}
	if total > 0 {
		return fail(infoIdcardTaken)
	}

	if s.cardState == 1 {
		// cfg_cardState=1 的 OCR 分支（阿里云 zid.market.alicloudapi.com）——untested：
		// canary $cfg_juhe=''（AppCode 为空）且 Go 未接入第三方服务，canary 无法对比验证；
		// PHP 侧 AppCode 为空时响应不是 JSON → $cardRes 为 null → error_code 判 0 成立但
		// result 缺失 → 走「解析失败」，Go 以钩子返回非 0 error_code 等价实现。
		return s.certifyOCR(ctx, httpReq, id, mi, realname, idcard, front, back, license)
	}
	return s.certifyManual(ctx, httpReq, id, mi, realname, idcard, front, back, license)
}

// certifyManual 是 cfg_cardState=0（canary）的人工审核分支。
func (s *Service) certifyManual(ctx context.Context, httpReq *http.Request, id int64,
	mi accountInfo, realname, idcard, front, back, license string) ajax.Response {
	uid := strconv.FormatInt(id, 10)
	rn, ic := storedOf(realname), storedOf(idcard)
	fr, bk, lc := storedOf(front), storedOf(back), storedOf(license)

	if mi.userType == 2 {
		if phpEmptyString(license) {
			return fail(infoLicenseEmpty)
		}
		var state sql.NullString
		if err := s.db.QueryRowContext(ctx,
			"SELECT `licenseState` FROM "+s.memberTable+" WHERE `id` = ?", id).Scan(&state); err == nil {
			if looseEqInt(state, 1) {
				return fail(infoCompanyCertDone)
			}
			if looseEqInt(state, 3) {
				return fail(infoCompanyCertPend)
			}
		}
	}
	if mi.userType == 1 {
		var state sql.NullString
		if err := s.db.QueryRowContext(ctx,
			"SELECT `certifyState` FROM "+s.memberTable+" WHERE `id` = ?", id).Scan(&state); err == nil {
			if looseEqInt(state, 1) {
				return fail(infoCertDone)
			}
			if looseEqInt(state, 3) {
				return fail(infoCertPend)
			}
		}
	}

	// userType 既不是 1 也不是 2 时 PHP 的 $archives 未定义 → SQL 异常 → 101「设置失败！」
	// （管理员/城市管理员账号会命中）。注意写的是 certifyState=3（待审），不是 OCR 分支的 1。
	var sqlText string
	switch mi.userType {
	case 1:
		sqlText = "UPDATE `" + s.prefix + "member` SET `realname` = '" + realname + "', `idcard` = '" + idcard +
			"', `idcardFront` = '" + front + "', `idcardBack` = '" + back + "', `certifyState` = 3 WHERE `id` = " + uid
	case 2:
		sqlText = "UPDATE `" + s.prefix + "member` SET `realname` = '" + realname + "', `idcard` = '" + idcard +
			"', `idcardFront` = '" + front + "', `idcardBack` = '" + back + "', `license` = '" + license +
			"', `certifyState` = 3, `licenseState` = 3 WHERE `id` = " + uid
	default:
		return fail(infoSetFail)
	}
	var err error
	if mi.userType == 1 {
		_, err = s.db.ExecContext(ctx,
			"UPDATE "+s.memberTable+" SET `realname` = ?, `idcard` = ?, `idcardFront` = ?, `idcardBack` = ?, `certifyState` = 3 WHERE `id` = ?",
			rn, ic, fr, bk, id)
	} else {
		_, err = s.db.ExecContext(ctx,
			"UPDATE "+s.memberTable+" SET `realname` = ?, `idcard` = ?, `idcardFront` = ?, `idcardBack` = ?, `license` = ?, `certifyState` = 3, `licenseState` = 3 WHERE `id` = ?",
			rn, ic, fr, bk, lc, id)
	}
	if err != nil {
		return fail(infoSetFail)
	}
	s.memberLog(ctx, httpReq, uid, "member", "", 0, "update", "实名认证", "", sqlText)
	s.updateAdminNotice(ctx, httpReq, "member", "certify", mi, id)
	return ajax.Response{State: ajax.StateOK, Info: infoCertSubmitted}
}

// certifyOCR 是 cfg_cardState=1 的 OCR 分支（untested，canary 未开通）。
func (s *Service) certifyOCR(ctx context.Context, httpReq *http.Request, id int64,
	mi accountInfo, realname, idcard, front, back, license string) ajax.Response {
	uid := strconv.FormatInt(id, 10)
	rn, ic := storedOf(realname), storedOf(idcard)
	fr, bk, lc := storedOf(front), storedOf(back), storedOf(license)

	// 提取正面（图片参数走 getFilePath($front,true)，#330 未迁移 → Files 未接入时原样输出）。
	errCode, name, idcardNo := -1, "", ""
	if s.identCardPositive != nil {
		errCode, name, idcardNo = s.identCardPositive(ctx, s.getFilePathURL(ctx, httpReq, front))
	}
	if errCode != 0 || idcardNo == "" {
		return fail(infoFrontParseFail)
	}
	if name != realname {
		return fail(infoNameMismatch)
	}
	if idcardNo != idcard {
		return fail(infoNoMismatch)
	}

	// 提取反面有效期。
	cErrCode, imageStatus, _, endDate := -1, "", "", ""
	if s.identCardContrary != nil {
		cErrCode, imageStatus, _, endDate = s.identCardContrary(ctx, s.getFilePathURL(ctx, httpReq, back))
	}
	if cErrCode != 0 || imageStatus != "normal" {
		return fail(infoBackParseFail)
	}
	if truthyStr(endDate) && endDate < s.now().In(gmt8).Format("20060102") {
		return fail(infoCardExpired)
	}

	// 姓名身份证核验。
	chkErrCode, isok := -1, false
	if s.idCheck != nil {
		chkErrCode, isok = s.idCheck(ctx, ic, rn)
	}
	if chkErrCode != 0 {
		return fail("身份证实名错误，认证失败，错误码：" + strconv.Itoa(chkErrCode))
	}
	if !isok {
		return fail(infoIdCheckFail)
	}

	// 已通过 / 待审拦截（与人工分支相同）。
	if mi.userType == 2 {
		if phpEmptyString(license) {
			return fail(infoLicenseEmpty)
		}
		var state sql.NullString
		if err := s.db.QueryRowContext(ctx,
			"SELECT `licenseState` FROM "+s.memberTable+" WHERE `id` = ?", id).Scan(&state); err == nil {
			if looseEqInt(state, 1) {
				return fail(infoCompanyCertDone)
			}
			if looseEqInt(state, 3) {
				return fail(infoCompanyCertPend)
			}
		}
	}
	if mi.userType == 1 {
		var state sql.NullString
		if err := s.db.QueryRowContext(ctx,
			"SELECT `certifyState` FROM "+s.memberTable+" WHERE `id` = ?", id).Scan(&state); err == nil {
			if looseEqInt(state, 1) {
				return fail(infoCertDone)
			}
			if looseEqInt(state, 3) {
				return fail(infoCertPend)
			}
		}
	}

	// 根据身份证号码回填出生日期与性别（common.func.php:20592）。
	birthday, sex := int64(0), 1
	if ts, g, ok := birthAndGenderFromIdCard(idcard, s.now()); ok {
		birthday, sex = ts, g
	}

	var sqlText string
	var err error
	switch mi.userType {
	case 1:
		sqlText = "UPDATE `" + s.prefix + "member` SET `realname` = '" + realname + "', `idcard` = '" + idcard +
			"', `idcardFront` = '" + front + "', `idcardBack` = '" + back + "', `certifyState` = 1, `birthday` = '" +
			strconv.FormatInt(birthday, 10) + "', `sex` = '" + strconv.Itoa(sex) + "' WHERE `id` = " + uid
		_, err = s.db.ExecContext(ctx,
			"UPDATE "+s.memberTable+" SET `realname` = ?, `idcard` = ?, `idcardFront` = ?, `idcardBack` = ?, `certifyState` = 1, `birthday` = ?, `sex` = ? WHERE `id` = ?",
			rn, ic, fr, bk, birthday, sex, id)
	case 2:
		sqlText = "UPDATE `" + s.prefix + "member` SET `realname` = '" + realname + "', `idcard` = '" + idcard +
			"', `idcardFront` = '" + front + "', `idcardBack` = '" + back + "', `license` = '" + license +
			"', `certifyState` = 3, `licenseState` = 1, `birthday` = '" + strconv.FormatInt(birthday, 10) +
			"', `sex` = '" + strconv.Itoa(sex) + "' WHERE `id` = " + uid
		_, err = s.db.ExecContext(ctx,
			"UPDATE "+s.memberTable+" SET `realname` = ?, `idcard` = ?, `idcardFront` = ?, `idcardBack` = ?, `license` = ?, `certifyState` = 3, `licenseState` = 1, `birthday` = ?, `sex` = ? WHERE `id` = ?",
			rn, ic, fr, bk, lc, birthday, sex, id)
	default:
		return fail(infoSetFail)
	}
	if err != nil {
		return fail(infoSetFail)
	}
	s.memberLog(ctx, httpReq, uid, "member", "", 0, "update", "实名认证", "", sqlText)
	s.updateAdminNotice(ctx, httpReq, "member", "certify", mi, id)
	return ajax.Response{State: ajax.StateOK, Info: infoCertPassed}
}

// birthAndGenderFromIdCard 迁移 common.func.php:20592：18 位身份证取出生日期
// （GetMkTime 口径的时间戳）与性别（倒数第二位，奇 1 男 / 偶 0 女）。
func birthAndGenderFromIdCard(idCard string, now time.Time) (int64, int, bool) {
	if len(idCard) != 18 {
		return 0, 1, false
	}
	b := idCard[6:14]
	y, errY := strconv.Atoi(b[0:4])
	m, errM := strconv.Atoi(b[4:6])
	d, errD := strconv.Atoi(b[6:8])
	if errY != nil || errM != nil || errD != nil || m < 1 || m > 12 || d < 1 || d > 31 {
		// mktime 失败（!empty($mt) 不成立）→ PHP 回落 time()。
		return now.Unix(), 1, true
	}
	gender := 1
	if (int(idCard[16]-'0'))%2 == 0 {
		gender = 0
	}
	return time.Date(y, time.Month(m), d, 0, 0, 0, 0, gmt8).Unix(), gender, true
}

// updateAdminNotice 迁移 common.func.php:6041 的 uptype=0 支路（HN_memory/redis 推送
// 未迁移）：serialize(param) 去重后 INSERT updatemessage。
func (s *Service) updateAdminNotice(ctx context.Context, req *http.Request, module, part string, mi accountInfo, id int64) {
	nickname := ""
	if mi.nickname != nil {
		nickname = phpScalarString(mi.nickname)
	}
	contentrn := s.siteCityName + "分站\r\n申请实名认证\r\n用户昵称：" + nickname +
		"\r\n用户ID：" + strconv.FormatInt(id, 10)
	date := s.now().In(gmt8).Format("2006-01-02 15:04:05")
	var b strings.Builder
	b.WriteString(`a:4:{s:4:"type";s:0:"";s:6:"cityid";`)
	if s.siteCityID == "" {
		b.WriteString("N;")
	} else {
		b.WriteString(phpSerializeString(s.siteCityID))
	}
	b.WriteString(`s:6:"notify";` + phpSerializeString("管理员消息通知"))
	b.WriteString(`s:6:"fields";a:2:{s:9:"contentrn";` + phpSerializeString(contentrn))
	b.WriteString(`s:4:"date";` + phpSerializeString(date) + `}}`)
	jsonparam := b.String()

	var dup sql.NullString
	if err := s.db.QueryRowContext(ctx,
		"SELECT `id` FROM "+s.updateMsgTable+" WHERE `param` = ? LIMIT 1", jsonparam).Scan(&dup); err != nil {
		_, _ = s.db.ExecContext(ctx,
			"INSERT INTO "+s.updateMsgTable+" (`module`, `part`, `param`, `time`) VALUES (?, ?, ?, ?)",
			module, part, jsonparam, s.now().Unix())
	}
}

func phpSerializeString(v string) string {
	return "s:" + strconv.Itoa(len(v)) + ":\"" + v + "\";"
}

// —— do=getCerfityData（member.class.php:3428-3451，唯一只读分支）——

func (s *Service) getCerfityData(ctx context.Context, httpReq *http.Request, id int64) ajax.Response {
	var mtype, certifyState, certifyInfo, realname, idcard, idcardFront, idcardBack, license, licenseState, licenseInfo sql.NullString
	err := s.db.QueryRowContext(ctx,
		"SELECT `mtype`, `certifyState`, `certifyInfo`, `realname`, `idcard`, `idcardFront`, `idcardBack`, `license`, `licenseState`, `licenseInfo` FROM "+
			s.memberTable+" WHERE `id` = ?", id).Scan(
		&mtype, &certifyState, &certifyInfo, &realname, &idcard, &idcardFront, &idcardBack, &license, &licenseState, &licenseInfo)
	if err != nil {
		if err != sql.ErrNoRows {
			// 已知偏差：PHP 查询异常时 $uinfo 为 null、仍输出全 null 的 info（100）；这里按
			// 其余 action 同口径降级 102。查不到（ErrNoRows）走 PHP 口径。
			return noData()
		}
	}
	// 用 mtype 分流（不是 userType，与 certify 口径分裂，照搬）。
	if looseEqInt(mtype, 1) {
		if looseEqInt(certifyState, 0) {
			return fail(infoNoCertData)
		}
		if looseEqInt(certifyState, 2) {
			// info 是 certifyInfo 原值（可能是 null）。
			var info any
			if certifyInfo.Valid {
				info = certifyInfo.String
			}
			return ajax.Response{State: stateFail, Info: info}
		}
	}
	if looseEqInt(mtype, 2) {
		if looseEqInt(licenseState, 0) {
			return fail(infoNoLicenseData)
		}
		if looseEqInt(licenseState, 2) {
			var info any
			if licenseInfo.Valid {
				info = licenseInfo.String
			}
			return ajax.Response{State: stateFail, Info: info}
		}
	}
	o := NewObject()
	if looseEqInt(mtype, 2) {
		o.Set("license", s.getFilePathURL(ctx, httpReq, license.String))
	}
	if realname.Valid {
		o.Set("realname", realname.String)
	} else {
		o.Set("realname", nil)
	}
	if idcard.Valid {
		o.Set("idcard", idcard.String)
	} else {
		o.Set("idcard", nil)
	}
	o.Set("front", s.getFilePathURL(ctx, httpReq, idcardFront.String))
	o.Set("back", s.getFilePathURL(ctx, httpReq, idcardBack.String))
	return ajax.Response{State: ajax.StateOK, Info: o}
}

// —— do=chphone（member.class.php:3454-3710）——

func (s *Service) updateChphone(ctx context.Context, httpReq *http.Request, p params, id int64) ajax.Response {
	uid := strconv.FormatInt(id, 10)
	phoneData := p.norm("phoneData")
	var areaCode, phone, vdimgck string
	isPhoneData := truthyStr(phoneData)

	if isPhoneData {
		switch {
		case isWxMiniprogram(httpReq):
			// 微信小程序支路：getuserphonenumber 需要 access_token 服务（WechatJSSDK），
			// Go 未实现 → Dep.WxPhoneNumber 钩子；nil 时按「解析失败」返回。
			decoded := phpUrlDecode(phoneData)
			var m map[string]any
			code := ""
			if json.Unmarshal([]byte(decoded), &m) == nil {
				if v, ok := m["code"].(string); ok {
					code = strings.ReplaceAll(v, " ", "+")
				}
			}
			if !truthyStr(code) {
				return fail(infoCodeParamFail)
			}
			if s.wxPhoneNumber == nil {
				return fail(infoPhoneParseFail)
			}
			errCode, errMsg, a, ph := s.wxPhoneNumber(ctx, code)
			if errCode != "" {
				return fail("ErrCode:" + errCode + "，ErrMsg:" + errMsg)
			}
			areaCode, phone = a, ph
			if phpEmptyString(phone) {
				return fail(infoPhoneParseFail)
			}
		case isByteMiniprogram(httpReq):
			// 抖音小程序支路：jscode2session + WXBizDataCrypt，Go 未实现 → Dep.DyPhoneNumber 钩子。
			decoded := phpUrlDecode(phoneData)
			var m map[string]any
			code, encryptedData, iv := "", "", ""
			if json.Unmarshal([]byte(decoded), &m) == nil {
				if v, ok := m["code"].(string); ok {
					code = strings.ReplaceAll(v, " ", "+")
				}
				if v, ok := m["encryptedData"].(string); ok {
					encryptedData = strings.ReplaceAll(v, " ", "+")
				}
				if v, ok := m["iv"].(string); ok {
					iv = strings.ReplaceAll(v, " ", "+")
				}
			}
			if s.dyPhoneNumber == nil {
				return fail(infoPhoneParseFail)
			}
			errNo, errTips, a, ph := s.dyPhoneNumber(ctx, code, encryptedData, iv)
			if errNo != "" {
				return fail("ErrCode:" + errNo + "，ErrMsg:" + errTips)
			}
			areaCode, phone = a, ph
			if phpEmptyString(phone) {
				return fail(infoPhoneParseFail)
			}
		default:
			// 【必读】phoneData 非空但既不是微信也不是抖音：$areaCode/$phone 未定义（null）
			// → SQL 变成 phone=''，把自己手机号清空并标记已验证（自伤 bug，照搬）。
			areaCode, phone = "", ""
		}
	} else {
		areaCode = strconv.Itoa(phpIntval(p.norm("areaCode")))
		phone = p.norm("phone")
		vdimgck = p.norm("vdimgck")

		// sitesms.international：不支持国际区号时丢弃区号（+86）。
		var international sql.NullString
		err := s.db.QueryRowContext(ctx,
			"SELECT `international` FROM "+s.smsTable+" WHERE `state` = 1").Scan(&international)
		if err != nil {
			if err == sql.ErrNoRows {
				return fail(infoSmsNotConfigured)
			}
			return noData()
		}
		if !truthyPHP(international) {
			areaCode = ""
		}
	}

	// —— 手机号占用校验（两条支路共用；比较值是 SQL 字面量解析后的明文）——
	aEff, phEff := storedOf(areaCode), storedOf(phone)
	var total int
	if err := s.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM "+s.memberTable+" WHERE (`mtype` = 1 OR `mtype` = 2) AND `phone` = ? AND `phoneCheck` = 1 AND (`areaCode` = ? OR `areaCode` = '') AND `id` <> ?",
		phEff, aEff, id).Scan(&total); err != nil {
		total = 0
	}
	changeUid := int64(0)
	if total > 0 {
		// changeUidByPhone：RenrenCrypt 令牌（php_decrypt 内部还有一次 base64 → 双层解码）。
		// 仓库内没有生成方（令牌可伪造，密钥硬编码），只用于「解绑持有同号码的另一个账号」。
		token := p.norm("changeUidByPhone")
		if truthyStr(token) {
			inner := phpBase64Decode(string(phpBase64Decode(token)))
			changeUid = int64(phpIntval(renrenDecrypt(inner, s.cryptKey)))
		}
		if changeUid != 0 && changeUid != id {
			var rowID sql.NullString
			if err := s.db.QueryRowContext(ctx,
				"SELECT `id` FROM "+s.memberTable+" WHERE (`mtype` = 1 OR `mtype` = 2) AND `phone` = ? AND `id` = ?",
				phEff, changeUid).Scan(&rowID); err != nil {
				changeUid = 0
			}
		} else {
			changeUid = 0
		}
		if changeUid == 0 {
			// 删掉「别人的」验证码记录（type='phone' lei='verify'），照搬。
			if _, err := s.db.ExecContext(ctx,
				"DELETE FROM "+s.msgLogTable+" WHERE `type` = 'phone' AND `lei` = 'verify' AND `user` = ?",
				storedOf(areaCode+phone)); err != nil {
				return noData()
			}
			return fail(infoPhoneTaken)
		}
	}

	// —— 写库 ——
	now := s.now().Unix()
	bindSQL := "UPDATE `" + s.prefix + "member` SET `areaCode` = '" + areaCode + "', `phone` = '" + phone +
		"', `phoneCheck` = 1, `phoneBindTime` = '" + strconv.FormatInt(now, 10) + "' WHERE `id` = '" + uid + "'"
	bindExec := func() error {
		_, err := s.db.ExecContext(ctx,
			"UPDATE "+s.memberTable+" SET `areaCode` = ?, `phone` = ?, `phoneCheck` = 1, `phoneBindTime` = ? WHERE `id` = ?",
			aEff, phEff, strconv.FormatInt(now, 10), id)
		return err
	}
	unbindExec := func() error {
		_, err := s.db.ExecContext(ctx,
			"UPDATE "+s.memberTable+" SET `phone` = ?, `phoneCheck` = ? WHERE `id` = ?", "", 0, changeUid)
		return err
	}

	if isPhoneData {
		if err := bindExec(); err != nil {
			return noData()
		}
		s.memberLog(ctx, httpReq, uid, "member", "", 0, "update", "账号绑定手机(小程序端)", "", bindSQL)
		if changeUid != 0 {
			_ = unbindExec()
		}
		return ajax.Response{State: ajax.StateOK, Info: infoPhoneVerified}
	}

	// —— 验证码支路 ——
	var rowID, pubdate sql.NullString
	err := s.db.QueryRowContext(ctx,
		"SELECT `id`, `pubdate` FROM "+s.msgLogTable+" WHERE `type` = 'phone' AND `lei` = 'verify' AND `user` = ? AND `code` = ?",
		storedOf(areaCode+phone), storedOf(vdimgck)).Scan(&rowID, &pubdate)
	if err != nil {
		if err == sql.ErrNoRows {
			return fail(infoVerifyCodeWrong)
		}
		return noData()
	}
	// 5 分钟有效期（GetMkTime(time()) 是纯 Unix 秒，pubdate 同口径）。
	if now-phpInt64(pubdate.String) > 300 {
		return fail(infoVerifyCodeStale)
	}
	if _, err := s.db.ExecContext(ctx,
		"DELETE FROM "+s.msgLogTable+" WHERE `type` = 'phone' AND `lei` = 'verify' AND `user` = ? AND `code` = ?",
		storedOf(areaCode+phone), storedOf(vdimgck)); err != nil {
		return noData()
	}
	if err := bindExec(); err != nil {
		return noData()
	}
	s.memberLog(ctx, httpReq, uid, "member", "", 0, "update", "账号绑定手机", "", bindSQL)
	if changeUid != 0 {
		_ = unbindExec()
	}
	return ajax.Response{State: ajax.StateOK, Info: infoPhoneVerified}
}

// —— do=chemail（member.class.php:3713-3766）——

func (s *Service) updateChemail(ctx context.Context, httpReq *http.Request, p params, id int64) ajax.Response {
	uid := strconv.FormatInt(id, 10)
	email := p.norm("email")
	// CheckEmail（validate.class.php:13）：正则跑在转义后的值上（与 PHP 一致）。
	if !emailCheckPattern.MatchString(email) {
		return fail(infoEmailInvalid)
	}
	emailEff := storedOf(email)

	var total int
	if err := s.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM "+s.memberTable+" WHERE `email` = ? AND `id` <> ?", emailEff, id).Scan(&total); err != nil {
		total = 0
	}
	if total > 0 {
		return fail(infoEmailTaken)
	}

	now := s.now().Unix()
	ip := plainIP(httpReq)
	// data = base64(RenrenCrypt(id$$ip$$now))：php_encrypt 自带一层 base64 → 外面再一层。
	// 只用于拼 bindemail 链接（该 template 只做展示），Go 侧无消费方。
	data := base64.StdEncoding.EncodeToString([]byte(s.encryptUserID(uid + "$$" + ip + "$$" + strconv.FormatInt(now, 10))))
	host := ""
	if httpReq != nil {
		host = httpReq.Host
	}
	link := s.baseURL(ctx, host) + "/index.php?service=member&template=bindemail&data=" + data

	// 邮件模板（getInfoTempContent("mail", ...) 的邮件支路）。
	title, content := s.mailTemplate(ctx, httpReq, notifyMailTemplate, map[string]string{"link": link}, s.now())
	if title == "" && content == "" {
		return fail(infoMailDisabled)
	}

	// sendmail（common.func.php:2027）：Go 侧 Dep.SendMail 钩子；nil 视为 SMTP 段为空
	// （canary 未配置时 PHP 返回「邮件发送失败，ErrCode: 邮件配置2」）。sendmail 内部自己
	// 会写一条 messageLog（lei=''，成功 0 / 失败 1），分支里再写一条 lei='bind' →
	// site_messagelog 出现两条；钩子只返回发送结果，两条写入都由服务补齐。
	replay := ""
	sendState := 0
	if s.sendMail == nil {
		replay = "邮件发送失败，ErrCode: 邮件配置2"
		sendState = 1
	} else {
		replay = s.sendMail(ctx, emailEff, title, content)
		if replay != "" {
			sendState = 1
		}
	}
	s.messageLog(ctx, httpReq, "email", "", emailEff, title, content, id, sendState)
	if replay != "" {
		s.messageLog(ctx, httpReq, "email", "bind", emailEff, title, content, id, 1)
		return fail(infoMailSendFail)
	}

	// 邮箱「立即写入」：点链接只是仪式，不需要确认（照搬）。
	sqlText := "UPDATE `" + s.prefix + "member` SET `email` = '" + email + "' WHERE `id` = '" + uid + "'"
	if _, err := s.db.ExecContext(ctx,
		"UPDATE "+s.memberTable+" SET `email` = ? WHERE `id` = ?", emailEff, id); err != nil {
		return noData()
	}
	s.memberLog(ctx, httpReq, uid, "member", "", 0, "update", "账号绑定邮箱", "", sqlText)
	// messageLog 双写：sendmail 成功路径里 PHP 还会再写一条 state=0（site_messagelog 同内容两行）。
	s.messageLog(ctx, httpReq, "email", "bind", emailEff, title, content, id, 0)
	return ajax.Response{State: ajax.StateOK, Info: infoMailSent}
}

// mailTemplate 迁移 getInfoTempContent（common.func.php:2473）的 mail 支路：
// 取 site_notify 首行（title + state=1，ORDER BY id DESC），email_state 真值时用
// email_title/email_body，再把 $configArr（basehost/webname/shortname/weblogo/hotline/
// time + 调用方 config）逐键 str_replace。$cfg_webname 等站点变量经 Dep.NotifyVars 注入，
// 未注入时占位符原样保留（canary 无该模板行，走 101「邮件通知功能未开启」）。
func (s *Service) mailTemplate(ctx context.Context, req *http.Request, notify string, config map[string]string, now time.Time) (string, string) { //nolint:dupl
	var emailState, emailTitle, emailBody sql.NullString
	err := s.db.QueryRowContext(ctx,
		"SELECT `email_state`, `email_title`, `email_body` FROM "+s.notifyTable+
			" WHERE `title` = ? AND `state` = 1 ORDER BY `id` DESC", notify).Scan(&emailState, &emailTitle, &emailBody)
	if err != nil || !truthyPHP(emailState) {
		return "", ""
	}
	title, content := emailTitle.String, emailBody.String
	if title == "" && content == "" {
		return "", ""
	}
	vars := map[string]string{"time": now.In(gmt8).Format("2006-01-02 15:04:05")}
	for k, v := range s.notifyVars {
		vars[k] = v
	}
	for k, v := range config {
		vars[k] = v
	}
	for k, v := range vars {
		title = strings.ReplaceAll(title, "$"+k, v)
		content = strings.ReplaceAll(content, "$"+k, v)
	}
	return title, content
}

// messageLog 迁移 common.func.php:2454：INSERT site_messagelog。
// PHP 侧 body 在调用方与函数内各 addslashes 一次、MySQL 字面量再解一次 → 落库等于
// addslashes 一次的值，这里直接存 phpAddslashes(body)。
func (s *Service) messageLog(ctx context.Context, req *http.Request, typ, lei, user, title, body string, by int64, state int) {
	if s.db == nil {
		return
	}
	_, _ = s.db.ExecContext(ctx,
		"INSERT INTO "+s.msgLogTable+
			" (`type`, `lei`, `user`, `title`, `body`, `code`, `tempid`, `byid`, `state`, `pubdate`, `ip`, `reason`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
		typ, lei, user, title, phpAddslashes(body), "", "", by, state, s.now().Unix(), plainIP(req), "")
}

// —— do=question（member.class.php:3769-3798）——

func (s *Service) updateQuestion(ctx context.Context, httpReq *http.Request, p params, id int64) ajax.Response {
	uid := strconv.FormatInt(id, 10)
	// member_security 只能设一次，没有修改/重置入口。
	var total int
	if err := s.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM "+s.securityTable+" WHERE `uid` = ?", id).Scan(&total); err != nil {
		total = 0
	}
	if total > 0 {
		return fail(infoQuestionSet)
	}

	q1, q2, answer := p.norm("q1"), p.norm("q2"), p.norm("answer")
	if phpEmptyString(q1) { // empty()："" 与 "0" 都是空
		return fail(infoQuestionOne)
	}
	if phpEmptyString(q2) {
		return fail(infoQuestionTwo)
	}
	if phpEmptyString(answer) {
		return fail(infoQuestionAnswer)
	}

	question := storedOf(q1) + "$$" + storedOf(q2)
	answerEff := storedOf(answer)
	sqlText := "INSERT INTO `" + s.prefix + "member_security` (`uid`, `question`, `answer`) VALUES ('" + uid +
		"', '" + q1 + "$$" + q2 + "', '" + answer + "')"
	if _, err := s.db.ExecContext(ctx,
		"INSERT INTO "+s.securityTable+" (`uid`, `question`, `answer`) VALUES (?, ?, ?)",
		id, question, answerEff); err != nil {
		return fail(infoQuestionFail)
	}
	s.memberLog(ctx, httpReq, uid, "member", "", 0, "update", "设置密保问题", "", sqlText)
	return ajax.Response{State: ajax.StateOK, Info: infoSetSuccess}
}
