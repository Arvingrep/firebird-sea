// oper_tail.go 是 travel 批次4（#373）的 operAgency / operVideo / operStrategy
// （travel.class.php:4061-4304 / 4782-4958 / 5369-5546，写）。
//
// operVideo / operStrategy：店铺不存在不报错（usertype=0、userid=会员id）；
// operAgency 的 ticketlist 先 array_reverse 再按反转后下标写 weight；update 先
// DELETE 全部 ticketinfo（无 typeid 过滤）再带 id 重插。
package travel

import (
	"context"
	"database/sql"
	"strconv"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

func (s *Service) operAgency(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	host := reqHost(req)

	userid, resp := s.staffThenLogin(ctx, req)
	if resp != nil {
		return *resp
	}

	m, _ := s.memberInfoOfViewer(req)
	id := req.Params.Get("id")
	oper := req.Params.Get("oper")
	title := operFiltered(req.ParamsEscaped.Get("title"))
	addrid := phpInt(req.Params.Get("addrid"))
	cityid := phpInt(req.Params.Get("cityid"))
	typeid := req.ParamsEscaped.Get("typeid") // PHP 不做 (int)，字符串弱比较
	address := operRaw(req.ParamsEscaped.Get("address"))
	tag := operRaw(req.ParamsEscaped.Get("tag"))
	pics := operRaw(req.ParamsEscaped.Get("pics"))
	imglist := operRaw(req.ParamsEscaped.Get("imglist"))
	video := operRaw(req.ParamsEscaped.Get("video"))
	missiontime := operRaw(req.ParamsEscaped.Get("missiontime"))
	travelservice := operRaw(req.ParamsEscaped.Get("travelservice"))
	missiontype := phpInt(req.Params.Get("missiontype")) // PHP 键名 missiontype，变量名拼错照搬
	level := phpInt(req.Params.Get("level"))
	note := operFiltered(req.ParamsEscaped.Get("note"))
	expense := operFiltered(req.ParamsEscaped.Get("expense"))
	instructions := operFiltered(req.ParamsEscaped.Get("instructions"))
	itinerary := operRaw(req.ParamsEscaped.Get("routeList")) // PHP $itinerary = $param['routeList']
	ticketlist := jsonDecodeList(req.Params.Get("ticketlist"))

	if operUserTypeGate(m) {
		return ajax.Response{State: stateParamFailed, Info: infoOperAuthFailBang} // travel[12][27]
	}

	company, resp2 := s.storeGate(ctx, userid)
	if resp2 != nil {
		return *resp2
	}

	if oper == "add" || oper == "update" {
		if emptyStr(title) {
			return ajax.Response{State: stateParamFailed, Info: "请输入景点名称"} // travel[3][30]
		}
		if typeid == "" { // PHP `$typeid == ''`（字符串精确比较，'0' 放行）
			return ajax.Response{State: stateParamFailed, Info: "请选择旅游类型"} // travel[3][28]
		}
		if addrid == 0 {
			return ajax.Response{State: stateParamFailed, Info: "请选择区域"} // travel[3][29]
		}
		if emptyStr(address) {
			return ajax.Response{State: stateParamFailed, Info: "请输入详细地址"} // travel[8][61]
		}
		if emptyStr(pics) {
			return ajax.Response{State: stateParamFailed, Info: "请至少上传一张图片"} // travel[3][27]
		}
	} else if oper == "del" {
		if !phpNumericRe.MatchString(id) {
			return ajax.Response{State: stateParamFailed, Info: infoOperFormatError}
		}
	}

	if s.db == nil {
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}
	agencyTable := "`" + s.prefix + "travel_agency`"
	infoTable := "`" + s.prefix + "travel_ticketinfo`"
	pubdate := time.Now().Unix()
	aid0 := phpInt(id)

	// ticketlist array_reverse 后写 weight：PHP array_reverse 对数值键重排成新
	// 连续下标、字符串键原样保留——assoc 形态的 weight 是原始键（SQL 字面量 '$_k'）。
	reversed := phpArrayReverse(phpForeachItems(ticketlist))

	switch oper {
	case "add":
		ins := "INSERT INTO " + agencyTable +
			" (`tag`, `imglist`, `userid`, `company`, `title`, `typeid`, `cityid`, `addrid`, `address`, `missiontype`, `missiontime`, `pics`, `video`, `travelservice`, `note`, `itinerary`, `expense`, `instructions`, `pubdate`, `state`, `level`) " +
			"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
		args := []any{tag, imglist, userid, company, title, typeid, cityid, addrid, address,
			missiontype, missiontime, pics, video, travelservice, note, itinerary, expense,
			instructions, pubdate, s.agencyCheck, level}
		res, err := s.db.ExecContext(ctx, ins, args...)
		if err != nil {
			return ajax.Response{State: stateParamFailed, Info: infoOperDBFail} // 101
		}
		aid, err := res.LastInsertId()
		if err != nil || aid == 0 {
			return ajax.Response{State: stateParamFailed, Info: infoOperDBFail}
		}

		s.operLog(req.HTTP, userid, "travel", "agency", aid, "insert",
			"添加周边游("+title+")", s.urlOf(ctx, host, "agency-detail", strconv.FormatInt(aid, 10)),
			interpolate(ins, args...))

		for _, item := range reversed {
			val, ok := valMapOf(item.val)
			if !ok {
				continue
			}
			_, _ = s.db.ExecContext(ctx,
				"INSERT INTO "+infoTable+
					" (`typeid`, `title`, `ticketid`, `price`, `specialtime`, `pubdate`, `weight`) VALUES ('1', ?, ?, ?, ?, ?, ?)",
				operRaw(itemStr(val, "title")), aid, operRaw(itemStr(val, "price")),
				hotelRoomSpecialtime(itemStr(val, "specialtime")), pubdate, item.key)
		}

		return ajax.Response{State: ajax.StateOK, Info: aid} // PHP return $aid

	case "update":
		if !phpNumericRe.MatchString(id) {
			return ajax.Response{State: stateParamFailed, Info: infoOperDBFail}
		}
		var eid, dbLevel sql.NullString
		err := s.db.QueryRowContext(ctx,
			"SELECT l.`id`, l.`level` FROM "+agencyTable+" l LEFT JOIN `"+s.prefix+"travel_store` s ON s.`id` = l.`company` WHERE l.`id` = ?",
			aid0).Scan(&eid, &dbLevel)
		if err == sql.ErrNoRows {
			return ajax.Response{State: stateParamFailed, Info: infoOperNotFound} // 101 [12][38]
		}
		// SQL 错误面：错误串 truthy → 继续走 UPDATE（报错则 [12][34]）。

		// `$level = !$level ? $results[0]['level'] : $level;`
		levelVal := level
		if level == 0 {
			levelVal = phpInt(dbLevel.String)
		}

		upd := "UPDATE " + agencyTable +
			" SET `tag` = ?, `imglist` = ?, `userid` = ?, `company` = ?, `title` = ?, `typeid` = ?, `cityid` = ?, `addrid` = ?, `address` = ?, `missiontime` = ?, `missiontype` = ?, `pics` = ?, `video` = ?, `travelservice` = ?, `note` = ?, `itinerary` = ?, `expense` = ?, `instructions` = ?, `state` = ?, `level` = ? WHERE `id` = ?"
		args := []any{tag, imglist, userid, company, title, typeid, cityid, addrid, address,
			missiontime, missiontype, pics, video, travelservice, note, itinerary, expense,
			instructions, s.agencyCheck, levelVal, aid0}
		if _, err := s.db.ExecContext(ctx, upd, args...); err != nil {
			return ajax.Response{State: stateParamFailed, Info: infoOperDBFail}
		}

		s.operLog(req.HTTP, userid, "travel", "agency", int64(aid0), "update",
			"修改周边游("+title+")", s.urlOf(ctx, host, "agency-detail", id),
			interpolate(upd, args...))

		// 先删全部（无 typeid 过滤），再按反转序重插；val.id 非空时带显式 id INSERT。
		_, _ = s.db.ExecContext(ctx, "DELETE FROM "+infoTable+" WHERE `ticketid` = ?", aid0)
		for _, item := range reversed {
			val, ok := valMapOf(item.val)
			if !ok {
				continue
			}
			specialtime := hotelRoomSpecialtime(itemStr(val, "specialtime"))
			vid := itemStr(val, "id")
			if vid != "" && vid != "0" { // PHP !empty($val['id'])
				// VALUES 裸拼字面量：数值表达式按 MySQL 语义绑定（int 列舍入/表达式
				// 求值与裸拼一致）；非数值 → 整条 INSERT 报 SQL 错误（dsqlOper 吞掉，
				// 不插行）→ 跳过。
				if rowid, rowok := mysqlNumericExprValue(vid); rowok {
					_, _ = s.db.ExecContext(ctx,
						"INSERT INTO "+infoTable+
							" (`id`, `typeid`, `title`, `ticketid`, `price`, `specialtime`, `pubdate`, `weight`) VALUES (?, '1', ?, ?, ?, ?, ?, ?)",
						rowid, operRaw(itemStr(val, "title")), aid0,
						operRaw(itemStr(val, "price")), specialtime, pubdate, item.key)
				}
			} else {
				_, _ = s.db.ExecContext(ctx,
					"INSERT INTO "+infoTable+
						" (`typeid`, `title`, `ticketid`, `price`, `specialtime`, `pubdate`, `weight`) VALUES ('1', ?, ?, ?, ?, ?, ?)",
					operRaw(itemStr(val, "title")), aid0, operRaw(itemStr(val, "price")),
					specialtime, pubdate, item.key)
			}
		}

		return ajax.Response{State: ajax.StateOK, Info: infoOperModified}

	case "del":
		var did, dtitle, dpics, dvideo, dimglist, duserid sql.NullString
		err := s.db.QueryRowContext(ctx,
			"SELECT l.`id`, l.`title`, l.`pics`, l.`video`, l.`imglist`, s.`userid` FROM "+agencyTable+
				" l LEFT JOIN `"+s.prefix+"travel_store` s ON s.`id` = l.`company` WHERE l.`id` = ?",
			aid0).Scan(&did, &dtitle, &dpics, &dvideo, &dimglist, &duserid)
		if err == sql.ErrNoRows {
			return ajax.Response{State: stateParamFailed, Info: infoOperNotFound} // 101 [12][38]
		}
		if err != nil {
			// SQL 错误面：$results[0]['userid'] 取到 '{' → 与 userid 不等 → [12][37]。
			return ajax.Response{State: stateParamFailed, Info: infoOperNoPerm}
		}
		if !looseEqNumber(duserid.String, userid) {
			return ajax.Response{State: stateParamFailed, Info: infoOperNoPerm} // 101
		}
		_, _ = s.db.ExecContext(ctx,
			"DELETE FROM "+infoTable+" WHERE `typeid` = 1 AND `ticketid` = ?", aid0)
		_, _ = s.db.ExecContext(ctx, "DELETE FROM "+agencyTable+" WHERE `id` = ?", aid0)
		s.operLog(req.HTTP, userid, "travel", "agency", int64(aid0), "delete",
			"删除周边游("+dtitle.String+")", "",
			"DELETE FROM "+agencyTable+" WHERE `id` = "+id)
		return ajax.Response{State: ajax.StateOK, Info: infoOperDeleted}
	}

	return ajax.Response{State: stateNoData, Info: infoNoData}
}

// operVideoStoreLook 复刻 operVideo/operStrategy 的店铺探测：存在 → usertype=1、
// userid=店铺id；不存在 → usertype=0（不报错）。
func (s *Service) operVideoStoreLook(ctx context.Context, userid int64) (int64, int) {
	if s.db != nil {
		var id, state sql.NullString
		err := s.db.QueryRowContext(ctx,
			"SELECT `id`, `state` FROM `"+s.prefix+"travel_store` WHERE `userid` = ?", userid).
			Scan(&id, &state)
		if err == nil {
			return 1, phpInt(id.String)
		}
		if err != sql.ErrNoRows {
			// SQL 错误面：$userResult 错误串 truthy → 命中 if($userResult) →
			// $userResult[0]['id'] 取到 '{' → 落库等价 0。
			return 1, 0
		}
	}
	return 0, int(userid)
}

func (s *Service) operVideo(req *ajax.Request) ajax.Response {
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
	id := req.Params.Get("id")
	oper := req.Params.Get("oper")
	title := operFiltered(req.ParamsEscaped.Get("title"))
	litpic := operRaw(req.ParamsEscaped.Get("litpic"))
	video := operRaw(req.ParamsEscaped.Get("video"))

	if infoInt(m, "is_staff") == 1 {
		if !verificationStaffTravel(m, "2") {
			return ajax.Response{State: stateParamFailed, Info: infoOperAuthFailBang}
		}
		userid = int64(infoInt(m, "companyuid"))
	}
	if operUserTypeGate(m) {
		return ajax.Response{State: stateParamFailed, Info: infoOperAuthFailBang} // travel[12][27]
	}

	usertype, ownerid := s.operVideoStoreLook(ctx, userid)

	if oper == "add" || oper == "update" {
		if emptyStr(title) {
			return ajax.Response{State: stateParamFailed, Info: infoOperTitleEmpty} // travel[11][27]
		}
		if emptyStr(litpic) {
			return ajax.Response{State: stateParamFailed, Info: infoOperCoverEmpty} // travel[12][50]
		}
		if emptyStr(video) {
			return ajax.Response{State: stateParamFailed, Info: infoOperVideoEmpty} // travel[12][49]
		}
	} else if oper == "del" {
		if !phpNumericRe.MatchString(id) {
			return ajax.Response{State: stateParamFailed, Info: infoOperFormatError}
		}
	}

	if s.db == nil {
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}
	videoTable := "`" + s.prefix + "travel_video`"
	pubdate := time.Now().Unix()
	vid := phpInt(id)

	switch oper {
	case "add":
		ins := "INSERT INTO " + videoTable +
			" (`usertype`, `userid`, `title`, `litpic`, `video`, `pubdate`, `state`) VALUES (?, ?, ?, ?, ?, ?, ?)"
		args := []any{usertype, ownerid, title, litpic, video, pubdate, s.videoCheck}
		res, err := s.db.ExecContext(ctx, ins, args...)
		if err != nil {
			return ajax.Response{State: stateParamFailed, Info: infoOperDBFail} // 101
		}
		aid, err := res.LastInsertId()
		if err != nil || aid == 0 {
			return ajax.Response{State: stateParamFailed, Info: infoOperDBFail}
		}

		s.operLog(req.HTTP, int64(ownerid), "travel", "video", aid, "insert",
			"添加视频("+title+")", s.urlOf(ctx, host, "video-detail", strconv.FormatInt(aid, 10)),
			interpolate(ins, args...))

		return ajax.Response{State: ajax.StateOK, Info: aid} // PHP return $aid

	case "update":
		if !phpNumericRe.MatchString(id) {
			return ajax.Response{State: stateParamFailed, Info: infoOperDBFail}
		}
		var eid sql.NullString
		err := s.db.QueryRowContext(ctx,
			"SELECT l.`id` FROM "+videoTable+" l LEFT JOIN `"+s.prefix+"travel_store` s ON s.`id` = l.`company` WHERE l.`id` = ?",
			vid).Scan(&eid)
		if err == sql.ErrNoRows {
			return ajax.Response{State: stateParamFailed, Info: infoOperNotFound} // 101 [12][38]
		}
		// SQL 错误面：错误串 truthy → 继续走 UPDATE（报错则 [12][34]）。

		upd := "UPDATE " + videoTable +
			" SET `usertype` = ?, `userid` = ?, `title` = ?, `litpic` = ?, `video` = ?, `state` = ? WHERE `id` = ?"
		args := []any{usertype, ownerid, title, litpic, video, s.videoCheck, vid}
		if _, err := s.db.ExecContext(ctx, upd, args...); err != nil {
			return ajax.Response{State: stateParamFailed, Info: infoOperDBFail}
		}

		s.operLog(req.HTTP, int64(ownerid), "travel", "video", int64(vid), "update",
			"修改视频("+title+")", s.urlOf(ctx, host, "video-detail", id),
			interpolate(upd, args...))

		return ajax.Response{State: ajax.StateOK, Info: infoOperModified}

	case "del":
		// 只查本人（usertype=1 时按店铺 id、否则按会员 id）；命中后 PHP 的
		// `userid == $userid` 校验恒真（WHERE 已限定）。
		var did, dtitle, dlitpic, dvideo2, duserid sql.NullString
		err := s.db.QueryRowContext(ctx,
			"SELECT l.`id`, l.`title`, l.`litpic`, l.`video`, l.`userid` FROM "+videoTable+
				" l WHERE l.`id` = ? AND l.`userid` = ?", vid, ownerid).
			Scan(&did, &dtitle, &dlitpic, &dvideo2, &duserid)
		if err == sql.ErrNoRows {
			return ajax.Response{State: stateParamFailed, Info: infoOperNotFound} // 101 [12][38]
		}
		if err != nil {
			// SQL 错误面：$results[0]['userid'] 取到 '{' → 与 userid 不等 → [12][37]。
			return ajax.Response{State: stateParamFailed, Info: infoOperNoPerm}
		}
		_, _ = s.db.ExecContext(ctx, "DELETE FROM "+videoTable+" WHERE `id` = ?", vid)
		s.operLog(req.HTTP, int64(ownerid), "travel", "video", int64(vid), "delete",
			"删除视频("+dtitle.String+")", "",
			"DELETE FROM "+videoTable+" WHERE `id` = "+id)
		return ajax.Response{State: ajax.StateOK, Info: infoOperDeleted}
	}

	return ajax.Response{State: stateNoData, Info: infoNoData}
}

func (s *Service) operStrategy(req *ajax.Request) ajax.Response {
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
	id := req.Params.Get("id")
	oper := req.Params.Get("oper")
	title := operFiltered(req.ParamsEscaped.Get("title"))
	litpic := operRaw(req.ParamsEscaped.Get("litpic"))
	typeid := phpInt(req.Params.Get("typeid"))
	pics := operRaw(req.ParamsEscaped.Get("pics"))
	note := operRaw(req.ParamsEscaped.Get("note")) // PHP 裸 $param['note']，无 action 级转义

	if infoInt(m, "is_staff") == 1 {
		if !verificationStaffTravel(m, "2") {
			return ajax.Response{State: stateParamFailed, Info: infoOperAuthFailBang}
		}
		userid = int64(infoInt(m, "companyuid"))
	}
	if operUserTypeGate(m) {
		return ajax.Response{State: stateParamFailed, Info: infoOperAuthFailBang} // travel[12][27]
	}

	usertype, ownerid := s.operVideoStoreLook(ctx, userid)

	if oper == "add" || oper == "update" {
		if emptyStr(title) {
			return ajax.Response{State: stateParamFailed, Info: infoOperTitleEmpty} // travel[11][27]
		}
		if typeid == 0 {
			return ajax.Response{State: stateParamFailed, Info: "请选择攻略类型"} // travel[6][14]
		}
		if emptyStr(pics) {
			return ajax.Response{State: stateParamFailed, Info: "请至少上传一张图片"} // travel[3][27]
		}
	} else if oper == "del" {
		if !phpNumericRe.MatchString(id) {
			return ajax.Response{State: stateParamFailed, Info: infoOperFormatError}
		}
	}

	if s.db == nil {
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}
	strategyTable := "`" + s.prefix + "travel_strategy`"
	pubdate := time.Now().Unix()
	sid := phpInt(id)

	switch oper {
	case "add":
		ins := "INSERT INTO " + strategyTable +
			" (`typeid`, `usertype`, `userid`, `title`, `litpic`, `pics`, `note`, `pubdate`, `state`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
		args := []any{typeid, usertype, ownerid, title, litpic, pics, note, pubdate, s.strategyCheck}
		res, err := s.db.ExecContext(ctx, ins, args...)
		if err != nil {
			return ajax.Response{State: stateParamFailed, Info: infoOperDBFail} // 101
		}
		aid, err := res.LastInsertId()
		if err != nil || aid == 0 {
			return ajax.Response{State: stateParamFailed, Info: infoOperDBFail}
		}

		s.operLog(req.HTTP, int64(ownerid), "travel", "strategy", aid, "insert",
			"添加攻略("+title+")", s.urlOf(ctx, host, "strategy-detail", strconv.FormatInt(aid, 10)),
			interpolate(ins, args...))

		return ajax.Response{State: ajax.StateOK, Info: aid} // PHP return $aid

	case "update":
		if !phpNumericRe.MatchString(id) {
			return ajax.Response{State: stateParamFailed, Info: infoOperDBFail}
		}
		var eid sql.NullString
		err := s.db.QueryRowContext(ctx,
			"SELECT l.`id` FROM "+strategyTable+" l LEFT JOIN `"+s.prefix+"travel_store` s ON s.`id` = l.`company` WHERE l.`id` = ?",
			sid).Scan(&eid)
		if err == sql.ErrNoRows {
			return ajax.Response{State: stateParamFailed, Info: infoOperNotFound} // 101 [12][38]
		}
		// SQL 错误面：错误串 truthy → 继续走 UPDATE（报错则 [12][34]）。

		upd := "UPDATE " + strategyTable +
			" SET `typeid` = ?, `usertype` = ?, `userid` = ?, `title` = ?, `litpic` = ?, `pics` = ?, `note` = ?, `state` = ? WHERE `id` = ?"
		args := []any{typeid, usertype, ownerid, title, litpic, pics, note, s.strategyCheck, sid}
		if _, err := s.db.ExecContext(ctx, upd, args...); err != nil {
			return ajax.Response{State: stateParamFailed, Info: infoOperDBFail}
		}

		s.operLog(req.HTTP, int64(ownerid), "travel", "strategy", int64(sid), "update",
			"修改攻略("+title+")", s.urlOf(ctx, host, "strategy-detail", id),
			interpolate(upd, args...))

		return ajax.Response{State: ajax.StateOK, Info: infoOperModified}

	case "del":
		var did, dtitle, dlitpic, dpics, duserid sql.NullString
		err := s.db.QueryRowContext(ctx,
			"SELECT l.`id`, l.`title`, l.`litpic`, l.`pics`, l.`userid` FROM "+strategyTable+
				" l WHERE l.`id` = ? AND l.`userid` = ?", sid, ownerid).
			Scan(&did, &dtitle, &dlitpic, &dpics, &duserid)
		if err == sql.ErrNoRows {
			return ajax.Response{State: stateParamFailed, Info: infoOperNotFound} // 101 [12][38]
		}
		if err != nil {
			// SQL 错误面：$results[0]['userid'] 取到 '{' → 与 userid 不等 → [12][37]。
			return ajax.Response{State: stateParamFailed, Info: infoOperNoPerm}
		}
		_, _ = s.db.ExecContext(ctx, "DELETE FROM "+strategyTable+" WHERE `id` = ?", sid)
		// PHP 这里的 memberLog 传了未定义的 $url（null → 空串）。
		s.operLog(req.HTTP, int64(ownerid), "travel", "strategy", int64(sid), "delete",
			"删除攻略("+dtitle.String+")", "",
			"DELETE FROM "+strategyTable+" WHERE `id` = "+id)
		return ajax.Response{State: ajax.StateOK, Info: infoOperDeleted}
	}

	return ajax.Response{State: stateNoData, Info: infoNoData}
}
