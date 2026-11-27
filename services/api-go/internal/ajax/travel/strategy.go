// strategy.go 是 travel 批次2（#371）的 strategyList / strategyDetail（表别名 s）。
package travel

import (
	"context"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// strategyList（travel.class.php:5547-5800）。
//
// 口径要点：
//   - typeid 等值（非 in）；keywords like 不分词不记日志；search 空格分词 OR like；
//   - 前台 store 子查询有结果时追加 OR 分支（无整体括号，会打破前置 AND 链——照抄）；
//   - `$userArr` 残留 bug 照抄；user 投影同 videoList。
func (s *Service) strategyList(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	host := reqHost(req)
	p := req.Params

	search := p.Get("search")
	keywords := strings.TrimSpace(p.Get("keywords"))
	typeid := p.Get("typeid")
	u := phpInt(p.Get("u"))
	state := p.Get("state")
	usertype := p.Get("usertype")
	page := phpDefaultPage(p.Get("page"), 1)
	pageSize := phpDefaultPage(p.Get("pageSize"), 10)
	uid := s.viewerID(ctx, req)
	if truthy(p.Get("u")) && truthy(p.Get("uid")) {
		uid = int64(phpInt(p.Get("uid")))
	}

	where := ""
	var wargs []any // 与 where 片段占位符一一对应
	if truthy(typeid) {
		where += " AND s.`typeid` = ? "
		wargs = append(wargs, typeid)
	}
	if truthy(keywords) {
		where += " AND s.`title` like ?"
		wargs = append(wargs, "%"+keywords+"%")
	}

	zjState := ""
	if u != 1 {
		where1 := ""
		if cityid := s.cityID(ctx, req, p.Get("cityid")); cityid > 0 {
			sids := s.cityStoreSids(ctx, itoa(cityid), false)
			if len(sids) > 0 {
				where1 = " AND `cityid` in (" + strings.Join(sids, ",") + ")"
			}
		}
		where += " AND s.`state` = 1 "
		rows, ok := s.queryRows(ctx, "SELECT `id` FROM `"+s.prefix+"travel_store` WHERE 1=1 "+where1)
		if ok && len(rows) > 0 {
			ids := make([]string, 0, len(rows))
			for _, r := range rows {
				ids = append(ids, r.str("id"))
			}
			// PHP bug 照抄：无括号 OR 追加在 AND 链之后，破坏整条 WHERE。
			if truthy(typeid) {
				where += " OR ( s.`typeid` = ? AND s.`usertype` = 1 AND s.`userid` in(" + strings.Join(ids, ",") + "))"
				wargs = append(wargs, typeid)
			} else {
				where += " OR ( s.`usertype` = 1 AND s.`userid` in(" + strings.Join(ids, ",") + "))"
			}
		}
		zjState = " AND z.`state` = 1"
	} else {
		if sid := s.userStoreID(ctx, uid); sid != "" {
			where += " AND s.`usertype` = 1 AND s.`userid` = " + sid
		} else {
			where += " AND s.`usertype` = 0 AND s.`userid` = " + itoa64(uid)
		}
		if state != "" {
			// PHP 无引号拼 $state：非数字 → 语法错误面（验证口径：按空结果降级）。
			if !isNumericString(state) {
				return respFail(infoNoDataCnt)
			}
			where += " AND s.`state` = " + state
		}
	}
	if usertype != "" {
		where += " AND s.`usertype` = ?"
		wargs = append(wargs, usertype)
	}
	if truthy(search) {
		conds := []string{}
		for _, seg := range strings.Split(search, " ") {
			if seg != "" {
				conds = append(conds, " s.`title` like ?")
				wargs = append(wargs, "%"+seg+"%")
			}
		}
		where += " AND (" + strings.Join(conds, " OR ") + ")"
	}

	fixed := "(s.`usertype` = 0 OR (s.`usertype` = 1 AND s.`userid` = z.`id`" + zjState + "))"
	archives := "SELECT s.`id`, s.`usertype`, s.`userid`, s.`typeid`, s.`title`, s.`pics`, s.`click`,s.`note`, s.`pubdate`, s.`state`, z.`id` as comid FROM `" +
		s.prefix + "travel_strategy` s LEFT JOIN `" + s.prefix + "travel_store` z ON z.`id` = s.`userid` WHERE " + fixed + " " + where

	totalCount := s.countTotal(ctx, "SELECT COUNT(s.`id`) total FROM `"+s.prefix+"travel_strategy` s LEFT JOIN `"+
		s.prefix+"travel_store` z ON z.`id` = s.`userid` WHERE "+fixed+" "+where, wargs...)
	if looseZero(totalCount) {
		return respFail(infoNoDataCnt)
	}

	pageinfo := basePageinfo(page, pageSize, totalCount)
	if u == 1 && uid > -1 {
		gray, audit, refuse := s.grayAuditRefuse(ctx, archives, "s.`state`", wargs)
		pageinfo.set("gray", gray)
		pageinfo.set("audit", audit)
		pageinfo.set("refuse", refuse)
	}

	q := archives + videoListOrderby(p.Get("orderby")) + limitClause(page, pageSize)
	rows, ok := s.queryRows(ctx, q, wargs...)
	if !ok {
		return respOK(pagedPayloadList(pageinfo, []any{}))
	}
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
		item.set("typeid", val.get("typeid"))
		item.set("note", strings.TrimSpace(phpStripTags(val.str("note"))))
		item.set("typename", s.typeNameDB(ctx, "travel_strategytype", val.str("typeid")))
		item.set("countcomment", s.commentTotal(ctx, "travel-strategy", val.str("id")))
		litpic := ""
		if truthy(val.str("pics")) {
			litpic = s.filePath(ctx, host, strings.Split(val.str("pics"), ",")[0])
		}
		item.set("litpic", litpic)
		item.set("url", s.urlOf(ctx, host, "strategy-detail", val.str("id")))

		if val.str("usertype") == "1" {
			rr, ok2 := s.queryRows(ctx, "SELECT m.`nickname`, m.`company`, m.`photo`, zjcom.`title`, zjcom.`pics`, zjcom.`id` zjcomid FROM `"+
				s.prefix+"member` m LEFT JOIN `"+s.prefix+"travel_store` zjcom ON m.`id` = zjcom.`userid` WHERE zjcom.`state` = 1 AND zjcom.`id` = "+val.str("userid"))
			if ok2 && len(rr) > 0 {
				m := rr[0]
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
		// PHP 值语义：赋给条目的是 $userArr 的拷贝（残留延续、后续更新不回写）。
		item.set("user", cloneOmap(userArr))
		list = append(list, item)
	}
	return respOK(pagedPayloadList(pageinfo, list))
}

// strategyDetail（travel.class.php:5801-5923）。
func (s *Service) strategyDetail(req *ajax.Request) ajax.Response {
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

	q := "SELECT s.`id`, s.`usertype`, s.`typeid`, s.`note`, s.`userid`, s.`title`, s.`litpic`, s.`pics`, s.`click`, s.`pubdate`, s.`state`, z.`id` as comid FROM `" +
		s.prefix + "travel_strategy` s LEFT JOIN `" + s.prefix + "travel_store` z ON z.`id` = s.`userid` WHERE s.`id` = " + id
	rows, ok := s.queryRows(ctx, q)
	if !ok || len(rows) == 0 {
		return respNoData()
	}
	r := rows[0]

	d := newOmap()
	d.set("id", r.get("id"))
	d.set("title", r.get("title"))
	d.set("userid", r.get("userid"))
	d.set("usertype", r.get("usertype"))
	d.set("click", r.get("click"))
	d.set("pubdate", r.get("pubdate"))
	d.set("state", r.get("state"))
	d.set("note", r.get("note"))
	d.set("typeid", r.get("typeid"))
	d.set("typename", s.typeNameDB(ctx, "travel_strategytype", r.str("typeid")))
	d.set("pics", s.pathSourceList(ctx, host, r.str("pics")))
	// litpic 也按逗号 explode 成 {path, pathSource} 数组（照抄）。
	d.set("litpic", s.pathSourceList(ctx, host, r.str("litpic")))

	// user 投影。
	if r.str("usertype") == "1" {
		rr, ok2 := s.queryRows(ctx, "SELECT m.`nickname`, m.`company`, m.`photo`, zjcom.`title`, zjcom.`pics`, zjcom.`id` zjcomid FROM `"+
			s.prefix+"member` m LEFT JOIN `"+s.prefix+"travel_store` zjcom ON m.`id` = zjcom.`userid` WHERE zjcom.`state` = 1 AND zjcom.`id` = "+r.str("userid"))
		if ok2 && len(rr) > 0 {
			m := rr[0]
			u2 := newOmap()
			pics := strings.Split(m.str("pics"), ",")
			photo := ""
			if truthy(pics[0]) {
				photo = s.filePath(ctx, host, pics[0])
			} else {
				photo = m.str("photo") // member.photo 原值，未经 getFilePath（照抄）
			}
			u2.set("photo", photo)
			u2.set("title", m.get("title"))
			nickname := m.str("nickname")
			if truthy(m.str("company")) {
				nickname = m.str("company")
			}
			u2.set("nickname", nickname)
			d.set("user", u2)
		}
	} else {
		rr, ok2 := s.queryRows(ctx, "SELECT `nickname`, `username`, `photo` FROM `"+s.prefix+
			"member` WHERE `id` = "+r.str("userid"))
		if ok2 && len(rr) > 0 {
			m := rr[0]
			u2 := newOmap()
			nickname := m.str("nickname")
			if !truthy(nickname) {
				nickname = m.str("username")
			}
			u2.set("nickname", nickname)
			photo := ""
			if truthy(m.str("photo")) {
				photo = s.filePath(ctx, host, m.str("photo"))
			}
			u2.set("photo", photo)
			d.set("user", u2)
		}
	}

	d.set("common", s.commentTotal(ctx, "travel-strategy", id))

	// companyurl 用了未 SELECT 的 company 列 → PHP null（照抄：comid 为空时 template id 空）。
	d.set("companyurl", s.urlOf(ctx, host, "store-detail", ""))

	collect := ""
	if s.collectCheck != nil {
		collect = s.collectCheck(req, "travel", "strategy-detail", "add", r.str("id"))
	}
	d.set("collect", boolInt(collect == "has"))

	return respOK(d)
}
