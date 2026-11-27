// video.go 是 travel 批次2（#371）的 videoList / videoDetail（表别名 s，store 别名 z）。
package travel

import (
	"context"
	"strconv"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/fburl"
)

// videoList（travel.class.php:4959-5221）。
//
// 口径要点：
//   - 前台固定条件 `(s.usertype = 0 OR (s.usertype = 1 AND s.userid = z.id AND z.state = 1))`
//   - store 子查询 or-branch（usertype=1 店 id in）；
//   - search 空格分词 OR like（s.title）；keywords 仅作回退；
//   - `$userArr` 循环外不重置（PHP 残留 bug）——用循环外 map 照抄；
//   - attachment 宽高走 RenrenCrypt 解 litpic；
//   - u==1 时 gray/audit/refuse（state 过滤只影响列表 SQL）。
func (s *Service) videoList(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	host := reqHost(req)
	p := req.Params

	search := strings.TrimSpace(p.Get("search"))
	keywords := p.Get("keywords")
	u := phpInt(p.Get("u"))
	state := p.Get("state")
	noid := p.Get("noid")
	usertype := p.Get("usertype")
	page := phpDefaultPage(p.Get("page"), 1)
	pageSize := phpDefaultPage(p.Get("pageSize"), 10)
	// PHP：$uid = ($u && $uid) ? $uid : getMemberID()（$uid 参数非空且 u 非空时用参数）。
	uid := s.viewerID(ctx, req)
	if truthy(p.Get("u")) && truthy(p.Get("uid")) {
		uid = int64(phpInt(p.Get("uid")))
	}
	// staff/companyuid 分支未复刻（#371 规则评论）。

	where := ""
	where1 := ""
	zjState := ""
	if u != 1 {
		// dataShare=0 → cityid 只进 store 子查询。
		if cityid := s.cityID(ctx, req, p.Get("cityid")); cityid > 0 {
			sids := s.cityStoreSids(ctx, itoa(cityid), false)
			if len(sids) > 0 {
				where1 = " AND `cityid` in (" + strings.Join(sids, ",") + ")"
			}
		}
		where += " AND s.`state` = 1 "
		sub := "SELECT `id` FROM `" + s.prefix + "travel_store` WHERE 1=1 " + where1
		rows, ok := s.queryRows(ctx, sub)
		if ok && len(rows) > 0 {
			ids := make([]string, 0, len(rows))
			for _, r := range rows {
				ids = append(ids, r.str("id"))
			}
			where += " AND ( s.`usertype` = 0 OR (s.`state` = 1 AND s.`usertype` = 1 AND s.`userid` in(" + strings.Join(ids, ",") + ")))"
		}
		zjState = " AND z.`state` = 1"
	} else {
		// 会员态：店存在 → usertype=1 AND userid=店id；否则 usertype=0 AND userid=uid。
		if sid := s.userStoreID(ctx, uid); sid != "" {
			where += " AND s.`usertype` = 1 AND s.`userid` = " + sid
		} else {
			where += " AND s.`usertype` = 0 AND s.`userid` = " + itoa64(uid)
		}
		if state != "" {
			where += " AND s.`state` = " + state
		}
	}
	if usertype != "" {
		where += " AND s.`usertype` = '" + usertype + "'"
	}
	if truthy(noid) {
		where += " AND s.`id` not in (" + noid + ")"
	}
	if !truthy(search) {
		search = keywords
	}
	if truthy(search) {
		// 空格分词 OR like（siteSearchLog 跳过）。
		conds := []string{}
		for _, seg := range strings.Split(search, " ") {
			if seg == "" {
				continue
			}
			conds = append(conds, "s.`title` like '%"+seg+"%'")
		}
		if len(conds) > 0 {
			where += " AND (" + strings.Join(conds, " OR ") + ")"
		}
	}

	// 前台固定条件带 $zj_state（会员态为空串）。
	fixed := "(s.`usertype` = 0 OR (s.`usertype` = 1 AND s.`userid` = z.`id`" + zjState + "))"
	archives := "SELECT s.`id`, s.`usertype`, s.`userid`, s.`title`, s.`litpic`, s.`video`, s.`click`, s.`pubdate`, s.`state`, z.`id` as comid FROM `" +
		s.prefix + "travel_video` s LEFT JOIN `" + s.prefix + "travel_store` z ON z.`id` = s.`userid` WHERE " + fixed + " " + where

	totalCount := s.countTotal(ctx, "SELECT COUNT(s.`id`) total FROM `"+s.prefix+"travel_video` s LEFT JOIN `"+s.prefix+
		"travel_store` z ON z.`id` = s.`userid` WHERE "+fixed+" "+where)
	if looseZero(totalCount) {
		return respFail(infoNoDataCnt)
	}

	pageinfo := basePageinfo(page, pageSize, totalCount)
	if u == 1 && uid > -1 {
		gray, audit, refuse := s.grayAuditRefuse(ctx, archives, "s.`state`", nil)
		pageinfo.set("gray", gray)
		pageinfo.set("audit", audit)
		pageinfo.set("refuse", refuse)
	}

	q := archives + videoListOrderby(p.Get("orderby")) + limitClause(page, pageSize)
	rows, ok := s.queryRows(ctx, q)
	if !ok {
		return respOK(pagedPayloadList(pageinfo, []any{}))
	}
	// $userArr 残留 bug：循环外建一次，跨条目保留上一轮字段。
	userArr := newOmap()
	list := make([]any, 0, len(rows))
	for _, val := range rows {
		item := newOmap()
		item.set("id", val.get("id"))
		item.set("title", val.get("title"))
		item.set("userid", val.get("userid"))
		item.set("usertype", val.get("usertype"))
		item.set("click", val.get("click"))
		item.set("pubdate", val.get("pubdate"))
		item.set("state", val.get("state"))
		litpic := ""
		if truthy(val.str("litpic")) {
			litpic = s.filePath(ctx, host, val.str("litpic"))
		}
		item.set("litpic", litpic)

		// attachment {width,height}：RenrenCrypt 解 litpic → attachment.id / path。
		w, h := s.attachmentDims(ctx, val.str("litpic"))
		att := newOmap()
		att.set("width", w)
		att.set("height", h)
		item.set("attachment", att)

		item.set("video", s.filePath(ctx, host, val.str("video")))
		item.set("countcomment", s.commentTotal(ctx, "travel-video", val.str("id")))
		item.set("url", s.urlOf(ctx, host, "video-detail", val.str("id")))

		// user 投影（usertype==1 店家 / else 会员），残留 bug 照抄。
		if val.str("usertype") == "1" {
			rr, ok2 := s.queryRows(ctx, "SELECT m.`nickname`, m.`company`, m.`photo`, zjcom.`title`, zjcom.`pics`, zjcom.`id` zjcomid FROM `"+
				s.prefix+"member` m LEFT JOIN `"+s.prefix+"travel_store` zjcom ON m.`id` = zjcom.`userid` WHERE zjcom.`state` = 1 AND zjcom.`id` = "+val.str("userid"))
			if ok2 && len(rr) > 0 {
				m := rr[0]
				// PHP 组装顺序：url, photo, title, nickname（残留键不被覆盖）。
				userArr.set("url", s.urlOf(ctx, host, "store-detail", m.str("zjcomid")))
				photo := ""
				if truthy(m.str("photo")) {
					photo = s.filePath(ctx, host, m.str("photo"))
				}
				userArr.set("photo", photo)
				userArr.set("title", m.get("title"))
				nickname := m.str("nickname")
				if truthy(m.str("company")) {
					nickname = m.str("company")
				}
				userArr.set("nickname", nickname)
			}
		} else {
			rr, ok2 := s.queryRows(ctx, "SELECT `nickname`, `username`, `photo` FROM `"+s.prefix+
				"member` WHERE `id` = "+val.str("userid"))
			if ok2 && len(rr) > 0 {
				m := rr[0]
				nickname := m.str("nickname")
				if !truthy(nickname) {
					nickname = m.str("username")
				}
				userArr.set("nickname", nickname)
				photo := ""
				if truthy(m.str("photo")) {
					photo = s.filePath(ctx, host, m.str("photo"))
				}
				userArr.set("photo", photo)
			}
		}
		item.set("user", userArr)

		list = append(list, item)
	}
	return respOK(pagedPayloadList(pageinfo, list))
}

// videoListOrderby 复刻 videoList 的 switch（无 rec 键）。
func videoListOrderby(raw string) string {
	switch phpSwitchInt(raw) {
	case 1:
		return " ORDER BY s.`click` DESC, s.`weight` DESC, s.`id` DESC"
	case 2:
		return " ORDER BY s.`pubdate` DESC, s.`weight` DESC, s.`id` DESC"
	default:
		return " ORDER BY s.`weight` DESC, s.`id` DESC"
	}
}

// attachmentDims 复刻 videoList 的 attachment 宽高查询（(int) 强转 → JSON 数字）。
func (s *Service) attachmentDims(ctx context.Context, litpic string) (int, int) {
	w, h := 0, 0
	fid := travelRenrenDecrypt(phpBase64Decode(litpic))
	var rows []rowVal
	var ok bool
	if isNumericString(fid) {
		rows, ok = s.queryRows(ctx, "SELECT `width`, `height` FROM `"+s.prefix+"attachment` WHERE `id` = "+fid)
	} else {
		rpic := strings.ReplaceAll(litpic, "/uploads", "")
		rows, ok = s.queryRows(ctx, "SELECT `width`, `height` FROM `"+s.prefix+"attachment` WHERE `path` = ?", rpic)
	}
	if ok && len(rows) > 0 {
		w = phpInt(rows[0].str("width"))
		h = phpInt(rows[0].str("height"))
	}
	return w, h
}

// videoDetail（travel.class.php:5222-5368）。
func (s *Service) videoDetail(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	host := reqHost(req)
	id := req.Params.Get("id")
	if !isNumericString(id) {
		return respFail(infoFormatError)
	}
	if s.db == nil {
		return respNoData()
	}
	uids := s.viewerID(ctx, req)

	q := "SELECT s.`id`, count(s.`id`) fabuall, s.`zan`, s.`usertype`, s.`userid`, s.`title`, s.`litpic`, s.`video`, s.`videotype`, s.`click`, s.`pubdate`, s.`state`, z.`id` as `comid`, z.`note` FROM `" +
		s.prefix + "travel_video` s LEFT JOIN `" + s.prefix + "travel_store` z ON z.`id` = s.`userid` WHERE s.`id` = " + id
	rows, ok := s.queryRows(ctx, q)
	if !ok || len(rows) == 0 {
		return respNoData()
	}
	r := rows[0]
	uid := r.str("userid")

	d := newOmap()
	d.set("id", r.get("id"))
	d.set("title", r.get("title"))
	d.set("userid", r.get("userid"))
	d.set("usertype", r.get("usertype"))
	d.set("zan", r.get("zan"))
	d.set("litpicpath", r.get("litpic"))
	litpic := ""
	if truthy(r.str("litpic")) {
		litpic = s.filePath(ctx, host, r.str("litpic"))
	}
	d.set("litpic", litpic)
	d.set("video", r.get("video"))
	videopath := ""
	if truthy(r.str("video")) {
		videopath = s.filePath(ctx, host, r.str("video"))
	}
	d.set("videopath", videopath)
	d.set("click", r.get("click"))
	d.set("fabuall", r.get("fabuall"))
	d.set("pubdate", r.get("pubdate"))
	d.set("state", r.get("state"))
	d.set("videotype", r.get("videotype"))

	// user 投影。
	// usertype==1：member+store 联查；else：仅 member。
	// PHP 的 `$member[0]['x']` 在 dsqlOper 出错（SQL 语法错误，即 userid 为 NULL/空
	// 拼出 `id = `）时返回错误字符串，字符串下标取到首字符 `{`——照抄。
	if r.str("usertype") == "1" {
		u2 := newOmap()
		if uid == "" {
			u2.set("uid", "{")
			u2.set("photo", "")
			u2.set("title", "{")
			u2.set("nickname", "{")
			u2.set("url", s.urlOf(ctx, host, "store-detail", "{"))
			d.set("user", u2)
		} else if rr, ok2 := s.queryRows(ctx, "SELECT m.`nickname`, m.`company`, m.`photo`, zjcom.`title`, zjcom.`pics`, zjcom.`id` zjcomid FROM `"+
			s.prefix+"member` m LEFT JOIN `"+s.prefix+"travel_store` zjcom ON m.`id` = zjcom.`userid` WHERE zjcom.`state` = 1 AND zjcom.`id` = "+uid); ok2 && len(rr) > 0 {
			m := rr[0]
			u2 := newOmap()
			u2.set("uid", m.get("uid"))
			photo := ""
			if truthy(m.str("photo")) {
				photo = s.filePath(ctx, host, m.str("photo"))
			} else {
				pics := strings.Split(m.str("pics"), ",")
				if truthy(pics[0]) {
					photo = s.filePath(ctx, host, pics[0])
				} else {
					photo = m.str("photo")
				}
			}
			u2.set("photo", photo)
			u2.set("title", m.get("title"))
			nickname := m.str("nickname")
			if truthy(m.str("company")) {
				nickname = m.str("company")
			}
			u2.set("nickname", nickname)
			u2.set("url", s.urlOf(ctx, host, "store-detail", m.str("zjcomid")))
			d.set("user", u2)
		}
	} else {
		// $uid = $nickname = $photo = "" 起始；member 命中则覆盖，userArr 无条件赋值。
		memberUID, nickname, photo := "", "", ""
		if uid == "" {
			// SQL `WHERE id = ` 语法错误 → $member[0]['x'] 取首字符 `{`；
			// photo 经 getFilePath("{") 落空为 ""。
			memberUID, nickname = "{", "{"
		} else if rr, ok2 := s.queryRows(ctx, "SELECT `id` uid, `nickname`, `username`, `photo` FROM `"+s.prefix+
			"member` WHERE `id` = "+uid); ok2 && len(rr) > 0 {
			m := rr[0]
			memberUID = m.str("uid")
			nickname = m.str("nickname")
			if !truthy(nickname) {
				nickname = m.str("username")
			}
			if truthy(m.str("photo")) {
				photo = s.filePath(ctx, host, m.str("photo"))
			}
		}
		u2 := newOmap()
		u2.set("uid", memberUID)
		u2.set("nickname", nickname)
		u2.set("photo", photo)
		u2.set("url", s.userPageURL(ctx, host, memberUID))
		d.set("user", u2)
	}

	// $uid = (int)$uid：后续 follow / isfollow 查询均用整型化后的 uid（如 "{" → 0）。
	uid = itoa64(int64(phpInt(uid)))

	// 登录才查 isfollow 与 up。
	if uids != -1 {
		if rr, ok2 := s.queryRows(ctx, "SELECT `id` FROM `"+s.prefix+
			"member_follow` WHERE `fortype` = '' AND `tid` = "+itoa64(uids)+" AND `fid` = "+uid); ok2 && len(rr) > 0 {
			d.set("isfollow", 1)
		}
		up := ""
		if s.zanCheck != nil {
			up = s.zanCheck(req, "travel", "video-detail", id)
		}
		d.set("up", boolInt(up == "has"))
	}

	// follow：作者粉丝数（不依赖登录）。PHP：dsqlOper(results) → $fansres[0]['fansall']。
	if fr, ok2 := s.queryRows(ctx, "SELECT count(`id`) fansall FROM `"+s.prefix+
		"member_follow` WHERE `fid` = "+uid+" AND `fortype` = ''"); ok2 && len(fr) > 0 {
		d.set("follow", fr[0].get("fansall"))
	} else {
		d.set("follow", "")
	}

	d.set("common", s.commentTotal(ctx, "travel-video", id))

	if r.str("usertype") == "1" {
		d.set("companyurl", s.urlOf(ctx, host, "store-detail", r.str("comid")))
	}

	// note：cn_substrR(trim(strip_tags(z.note)), 25)。
	d.set("note", cnSubstrR(strings.TrimSpace(phpStripTags(r.str("note"))), 25))

	// collect 恒执行（无 uid 守卫）。
	collect := ""
	if s.collectCheck != nil {
		collect = s.collectCheck(req, "travel", "video-detail", "add", r.str("id"))
	}
	d.set("collect", boolInt(collect == "has"))

	return respOK(d)
}

// userPageURL 复刻 `$cfg_secureAccess . $cfg_basehost . '/user/' . $uid`。
// cfg_secureAccess/cfg_basehost 经 fburl Resolver.Domain 派生（与 member.baseURL 同源）。
func (s *Service) userPageURL(ctx context.Context, host, uid string) string {
	if s.files == nil {
		return ""
	}
	base, err := s.files.Domain(ctx, "", 0, false, fburl.Options{Host: host})
	if err != nil || base == "" {
		return ""
	}
	return base + "/user/" + uid
}

// itoa / itoa64 是本包内 strconv.FormatInt 的短名。
func itoa(v int) string     { return strconv.Itoa(v) }
func itoa64(v int64) string { return strconv.FormatInt(v, 10) }
