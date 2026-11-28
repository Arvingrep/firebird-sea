// oper_ticket.go 是 travel 批次4（#373）的 operTicket（travel.class.php:2025-2275，写）。
//
// 门禁顺序：登录超时 → staff（type=2，硬编码「商家权限验证失败！」）→ 参数 →
// userType 门禁 → 店铺门禁。update 的 ticketinfo 按 notid 差集清理；add 成功返回
// $aid（数字，100）。
package travel

import (
	"context"
	"database/sql"
	"strconv"
	"strings"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

func (s *Service) operTicket(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	host := reqHost(req)

	userid := s.viewerID(ctx, req)
	if userid == -1 {
		return ajax.Response{State: stateParamFailed, Info: infoOperLoginTimeout}
	}

	m, _ := s.memberInfoOfViewer(req)
	if infoInt(m, "is_staff") == 1 {
		if !verificationStaffTravel(m, "2") {
			return ajax.Response{State: stateParamFailed, Info: infoOperAuthFailBang} // 硬编码
		}
		userid = int64(infoInt(m, "companyuid"))
	}

	id := req.Params.Get("id")
	oper := req.Params.Get("oper")
	title := operFiltered(req.ParamsEscaped.Get("title"))
	addrid := phpInt(req.Params.Get("addrid"))
	cityid := phpInt(req.Params.Get("cityid"))
	address := operRaw(req.ParamsEscaped.Get("address"))
	tag := operRaw(req.ParamsEscaped.Get("tag"))
	pics := operRaw(req.ParamsEscaped.Get("pics"))
	video := operRaw(req.ParamsEscaped.Get("video"))
	opentime := operRaw(req.ParamsEscaped.Get("opentime"))
	travelname := operRaw(req.ParamsEscaped.Get("travelname"))
	level := phpInt(req.Params.Get("level"))
	note := operFiltered(req.ParamsEscaped.Get("body"))
	jdnote := operFiltered(req.ParamsEscaped.Get("jdnote"))
	ticketlist := listOf(jsonDecodeList(req.Params.Get("ticketlist")))

	if operUserTypeGate(m) {
		return ajax.Response{State: stateParamFailed, Info: infoOperAuthFailBang} // travel[12][27]
	}

	company, resp := s.storeGate(ctx, userid)
	if resp != nil {
		return *resp
	}

	if oper == "add" || oper == "update" {
		if emptyStr(title) {
			return ajax.Response{State: stateParamFailed, Info: "请输入景点名称"} // travel[3][30]
		}
		if emptyStr(address) {
			return ajax.Response{State: stateParamFailed, Info: "请输入详细地址"} // travel[8][61]
		}
		if emptyStr(pics) {
			return ajax.Response{State: stateParamFailed, Info: "请至少上传一张图片"} // travel[3][27]
		}
		if len(ticketlist) == 0 { // PHP !$ticketlist：null / 空数组都拦
			return ajax.Response{State: stateParamFailed, Info: infoOperTicketListNeed}
		}
	} else if oper == "del" {
		if !phpNumericRe.MatchString(id) {
			return ajax.Response{State: stateParamFailed, Info: infoOperFormatError}
		}
	}

	if s.db == nil {
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}
	ticketTable := "`" + s.prefix + "travel_ticket`"
	infoTable := "`" + s.prefix + "travel_ticketinfo`"
	pubdate := time.Now().Unix()
	tid := phpInt(id)

	switch oper {
	case "add":
		ins := "INSERT INTO " + ticketTable +
			" (`note`, `jdnote`, `userid`, `company`, `title`, `cityid`, `opentime`, `addrid`, `address`, `pics`, `video`, `travelname`, `tag`, `pubdate`, `state`, `date`, `openStart`, `openEnd`, `level`) " +
			"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
		args := []any{note, jdnote, userid, company, title, cityid, opentime, addrid, address,
			pics, video, travelname, tag, pubdate, s.ticketCheck,
			operRaw(req.ParamsEscaped.Get("open_week")), operRaw(req.ParamsEscaped.Get("openStart")),
			operRaw(req.ParamsEscaped.Get("openEnd")), level}
		// PHP 按 $jdnote 是否为空拼两种 INSERT（列里有没有 jdnote）；jdnote 为空时插 NULL
		// 还是 '' 由列默认值决定——实测两语句在 jdnote='' 时等价（列 NOT NULL DEFAULT ''）。
		if emptyStr(jdnote) {
			ins = "INSERT INTO " + ticketTable +
				" (`note`, `userid`, `company`, `title`, `cityid`, `opentime`, `addrid`, `address`, `pics`, `video`, `travelname`, `tag`, `pubdate`, `state`, `date`, `openStart`, `openEnd`, `level`) " +
				"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
			args = []any{note, userid, company, title, cityid, opentime, addrid, address,
				pics, video, travelname, tag, pubdate, s.ticketCheck,
				operRaw(req.ParamsEscaped.Get("open_week")), operRaw(req.ParamsEscaped.Get("openStart")),
				operRaw(req.ParamsEscaped.Get("openEnd")), level}
		}
		res, err := s.db.ExecContext(ctx, ins, args...)
		if err != nil {
			return ajax.Response{State: stateParamFailed, Info: infoOperDBFail} // 101
		}
		aid, err := res.LastInsertId()
		if err != nil || aid == 0 {
			return ajax.Response{State: stateParamFailed, Info: infoOperDBFail}
		}

		s.operLog(req.HTTP, userid, "travel", "ticket", aid, "insert",
			"添加门票("+title+")", s.urlOf(ctx, host, "ticket-detail", strconv.FormatInt(aid, 10)),
			interpolate(ins, args...))

		for _, item := range ticketlist {
			val, ok := item.(map[string]any)
			if !ok {
				continue
			}
			_, _ = s.db.ExecContext(ctx,
				"INSERT INTO "+infoTable+
					" (`typeid`, `title`, `ticketid`, `price`, `specialtime`, `pubdate`) VALUES ('0', ?, ?, ?, ?, ?)",
				operRaw(itemStr(val, "title")), aid, operRaw(itemStr(val, "price")),
				hotelRoomSpecialtime(itemStr(val, "specialtime")), pubdate)
		}

		// PHP return $aid → handlers 包成 state=100、info 为数字。
		return ajax.Response{State: ajax.StateOK, Info: aid}

	case "update":
		// 存在性 SELECT 对非数值 id 报 SQL 错误（dsqlOper 错误串 truthy）→ UPDATE 报错
		// → results != "ok" → 200 [12][34]（101）。
		if !phpNumericRe.MatchString(id) {
			return ajax.Response{State: stateParamFailed, Info: infoOperDBFail}
		}
		var eid sql.NullString
		err := s.db.QueryRowContext(ctx,
			"SELECT l.`id` FROM "+ticketTable+" l LEFT JOIN `"+s.prefix+"travel_store` s ON s.`id` = l.`company` WHERE l.`id` = ?",
			tid).Scan(&eid)
		if err == sql.ErrNoRows || err != nil {
			return ajax.Response{State: stateParamFailed, Info: infoOperNotFound} // 101
		}

		upd := "UPDATE " + ticketTable +
			" SET `note` = ?, `jdnote` = ?, `userid` = ?, `company` = ?, `title` = ?, `cityid` = ?, `opentime` = ?, `addrid` = ?, `address` = ?, `pics` = ?, `video` = ?, `travelname` = ?, `tag` = ?, `state` = ?, `date` = ?, `openStart` = ?, `openEnd` = ?, `level` = ? WHERE `id` = ?"
		args := []any{note, jdnote, userid, company, title, cityid, opentime, addrid, address,
			pics, video, travelname, tag, s.ticketCheck,
			operRaw(req.ParamsEscaped.Get("open_week")), operRaw(req.ParamsEscaped.Get("openStart")),
			operRaw(req.ParamsEscaped.Get("openEnd")), level, tid}
		if emptyStr(jdnote) { // PHP 两种 UPDATE 的差别同样只是有没有 jdnote 列
			upd = "UPDATE " + ticketTable +
				" SET `note` = ?, `userid` = ?, `company` = ?, `title` = ?, `cityid` = ?, `opentime` = ?, `addrid` = ?, `address` = ?, `pics` = ?, `video` = ?, `travelname` = ?, `tag` = ?, `state` = ?, `date` = ?, `openStart` = ?, `openEnd` = ?, `level` = ? WHERE `id` = ?"
			args = []any{note, userid, company, title, cityid, opentime, addrid, address,
				pics, video, travelname, tag, s.ticketCheck,
				operRaw(req.ParamsEscaped.Get("open_week")), operRaw(req.ParamsEscaped.Get("openStart")),
				operRaw(req.ParamsEscaped.Get("openEnd")), level, tid}
		}
		if _, err := s.db.ExecContext(ctx, upd, args...); err != nil {
			return ajax.Response{State: stateParamFailed, Info: infoOperDBFail}
		}

		s.operLog(req.HTTP, userid, "travel", "ticket", int64(tid), "update",
			"修改门票("+title+")", s.urlOf(ctx, host, "ticket-detail", id),
			interpolate(upd, args...))

		if len(ticketlist) > 0 {
			notid := []string{} // PHP array_push 收集的保留 id
			for _, item := range ticketlist {
				val, ok := item.(map[string]any)
				if !ok {
					continue
				}
				specialtime := hotelRoomSpecialtime(itemStr(val, "specialtime"))
				vid := itemStr(val, "id")
				if vid != "" && vid != "0" { // PHP !empty($val['id'])
					_, _ = s.db.ExecContext(ctx,
						"UPDATE "+infoTable+
							" SET `typeid` = '0', `title` = ?, `ticketid` = ?, `price` = ?, `specialtime` = ? WHERE `id` = ?",
						operRaw(itemStr(val, "title")), tid, operRaw(itemStr(val, "price")),
						specialtime, phpInt(vid))
					notid = append(notid, vid)
				} else {
					res, err := s.db.ExecContext(ctx,
						"INSERT INTO "+infoTable+
							" (`typeid`, `title`, `ticketid`, `price`, `specialtime`, `pubdate`) VALUES ('0', ?, ?, ?, ?, ?)",
						operRaw(itemStr(val, "title")), tid, operRaw(itemStr(val, "price")),
						specialtime, pubdate)
					if err == nil {
						lid, _ := res.LastInsertId()
						notid = append(notid, strconv.FormatInt(lid, 10))
					}
				}
			}
			if len(notid) > 0 { // PHP if($notid)
				_, _ = s.db.ExecContext(ctx,
					"DELETE FROM "+infoTable+" WHERE `ticketid` = ? AND `id` NOT IN ("+
						strings.Join(notid, ",")+")", tid)
			}
		}

		return ajax.Response{State: ajax.StateOK, Info: infoOperModified}

	case "del":
		var rid, rtitle, rpics, rvideo, ruserid sql.NullString
		err := s.db.QueryRowContext(ctx,
			"SELECT l.`id`, l.`title`, l.`pics`, l.`video`, s.`userid` FROM "+ticketTable+
				" l LEFT JOIN `"+s.prefix+"travel_store` s ON s.`id` = l.`company` WHERE l.`id` = ?",
			tid).Scan(&rid, &rtitle, &rpics, &rvideo, &ruserid)
		if err == sql.ErrNoRows || err != nil {
			return ajax.Response{State: stateParamFailed, Info: infoOperNotFound} // 101
		}
		if !looseEqNumber(ruserid.String, userid) {
			return ajax.Response{State: stateParamFailed, Info: infoOperNoPerm} // 101
		}
		_, _ = s.db.ExecContext(ctx,
			"DELETE FROM "+infoTable+" WHERE `typeid` = 0 AND `ticketid` = ?", tid)
		_, _ = s.db.ExecContext(ctx, "DELETE FROM "+ticketTable+" WHERE `id` = ?", tid)
		s.operLog(req.HTTP, userid, "travel", "ticket", int64(tid), "delete",
			"删除门票("+rtitle.String+")", "",
			"DELETE FROM "+ticketTable+" WHERE `id` = "+id)
		return ajax.Response{State: ajax.StateOK, Info: infoOperDeleted}
	}

	return ajax.Response{State: stateNoData, Info: infoNoData}
}
