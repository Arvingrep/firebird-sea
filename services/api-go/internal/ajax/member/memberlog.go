package member

import (
	"context"
	"crypto/md5"
	"encoding/hex"
	"net"
	"net/http"
	"net/url"
	"sort"
	"strings"
	"time"
)

// memberLog 迁移 common.func.php:1919-2016 的会员行为日志：往 member_log 写一行，
// 同一秒内同 (md5(note), uid, ip) 已经记过就跳过；uid 为 0 直接返回。
//
// 与 PHP 的已知差异（都只影响审计字段，不影响接口响应）：
//   - ipaddr（getIpAddr 的「省 市 运营商」）需要 IP 库，Go 侧暂无来源，写空串；
//   - url 用 Go 服务的实际请求地址（PHP 用的是 SCRIPT_NAME=/include/ajax.php）；
//   - param 用合并后的 query + form 重新编码（PHP 是 http_build_query($_REQUEST) 后再 urldecode），
//     键顺序按字典序，password 同样脱敏成「密码不记录」。
func (s *Service) memberLog(ctx context.Context, req *http.Request, uid, module, temp string, aid int64,
	action, note, link, sqlText string) {
	if s.db == nil || uid == "" || uid == "0" {
		return
	}

	now := s.now().Unix()
	s.cleanMemberLog(ctx, now)

	ip, ipaddr, useragent, pageURL, param, referer := "", "", "", "", "", ""
	if req != nil {
		ip, ipaddr = requestIP(req)
		useragent = req.Header.Get("User-Agent")
		pageURL = requestURL(req)
		param = requestParam(req)
		referer = req.Header.Get("Referer")
	}

	sum := md5.Sum([]byte(note))
	sumHex := hex.EncodeToString(sum[:])

	// 相同动作一秒钟以内记录过一次，就不再重复记录（1954-1971）。
	// 去重查询出错时 PHP 的 $ret 为 false，`if($ret && ...)` 不成立，仍会往下写；这里同样只在「确实查到」时跳过。
	// 注：PHP 还有一条 note 含「用户退出登录」时按 5 分钟去重的分支（1955-1962），followMember 的 note 不会命中，
	// 等其它 action 复用 memberLog 时再补。
	seen, err := s.count(ctx, "SELECT COUNT(*) FROM "+s.behaviorTable+
		" WHERE `md5` = ? AND `uid` = ? AND `ip` = ? AND `pubdate` = ?", sumHex, uid, ip, now)
	if err == nil && seen > 0 {
		return
	}

	// 写入失败不重试、不影响调用方（PHP 侧同样不检查返回值）。
	_, _ = s.db.ExecContext(ctx, "INSERT INTO "+s.behaviorTable+
		" (`uid`, `module`, `temp`, `aid`, `type`, `note`, `link`, `ip`, `ipaddr`, `useragent`, `sql`, `pubdate`, `md5`, `url`, `param`, `referer`) "+
		"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
		uid, module, temp, aid, action, note, link, ip, ipaddr, useragent, sqlText, now, sumHex,
		pageURL, param, referer)
}

// cleanMemberLog 对应 `max_memberBehaviorLog_save_day` 配了值时的过期清理（1929-1936）。
// PHP 用 cache 做 6 小时节流，这里用进程内时间戳；未配置（nil / 0）时完全不清理。
func (s *Service) cleanMemberLog(ctx context.Context, now int64) {
	if s.logSaveDays <= 0 {
		return
	}
	s.logCleanMu.Lock()
	defer s.logCleanMu.Unlock()
	// PHP 是 `($lastClearTime + 6h) < $time` 才清理：正好 6 小时的那一刻不清理。
	if !s.logCleanedAt.IsZero() && s.logCleanedAt.Add(6*time.Hour).Unix() >= now {
		return
	}
	deadline := now - int64(s.logSaveDays)*86400
	if _, err := s.db.ExecContext(ctx, "DELETE FROM "+s.behaviorTable+" WHERE `pubdate` < ?", deadline); err != nil {
		return
	}
	s.logCleanedAt = time.Unix(now, 0)
}

// requestIP 复刻 GetIP() + getRemotePort()：优先 X-Forwarded-For 的第一个非 unknown，
// 其次 Client-IP，最后 RemoteAddr；带端口时写成「ip:port」。
// 已知偏差：X-Forwarded-For 全为 unknown 时 PHP 不会落到后面的分支（$realip 仍是 NULL），
// 这里会继续用 Client-IP / RemoteAddr；只影响审计字段。
func requestIP(req *http.Request) (ip, ipaddr string) {
	for _, v := range strings.Split(req.Header.Get("X-Forwarded-For"), ",") {
		v = strings.TrimSpace(v)
		if v != "" && v != "unknown" {
			ip = v
			break
		}
	}
	if ip == "" {
		ip = req.Header.Get("Client-IP")
	}
	remoteIP, port := req.RemoteAddr, ""
	if host, p, err := net.SplitHostPort(req.RemoteAddr); err == nil {
		remoteIP, port = host, p
	}
	if ip == "" {
		if remoteIP != "" {
			ip = remoteIP
		} else {
			ip = "0.0.0.0"
		}
	}
	if port != "" && port != "0" {
		ip += ":" + port
	}
	// getIpAddr() 依赖 IP 库，Go 侧暂无来源；留空不编造。
	return ip, ""
}

// requestURL 对应 PHP 的 `'http(s)://' . HTTP_HOST . SCRIPT_NAME`。
func requestURL(req *http.Request) string {
	scheme := "http"
	if req.TLS != nil {
		scheme = "https"
	}
	host := req.Host
	if host == "" {
		host = "localhost"
	}
	return scheme + "://" + host + req.URL.Path
}

// requestParam 对应 `http_build_query($_REQUEST)` 再 urldecode：与响应无关，只做可读还原。
func requestParam(req *http.Request) string {
	values := url.Values{}
	if req.URL != nil {
		for k, v := range req.URL.Query() {
			values[k] = append(values[k], v...)
		}
	}
	_ = req.ParseForm()
	// $_REQUEST 里同一键 GET/POST 都出现时 POST 覆盖（ajax.php 也是先 GET 后 POST）。
	for k, v := range req.PostForm {
		values[k] = v
	}
	if len(values) == 0 {
		return ""
	}
	if _, ok := values["password"]; ok {
		values["password"] = []string{"密码不记录"}
	}
	keys := make([]string, 0, len(values))
	for k := range values {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	parts := make([]string, 0, len(keys))
	for _, k := range keys {
		for _, v := range values[k] {
			parts = append(parts, k+"="+v)
		}
	}
	return strings.Join(parts, "&")
}
