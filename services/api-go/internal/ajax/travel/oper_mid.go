// oper_mid.go 是 travel 批次4（#373）的 operRentcar / operVisa
// （travel.class.php:2775-2962 / 3370-3582，写）。
//
// 两者都是「staff 检查在登录超时检查之前」的顺序（与 operHotel/operTicket 不同）。
// `$price == ”` 按 PHP 7.4 语义：” → 0，price 为 0 时命中校验。
package travel

import (
	"context"
	"database/sql"
	"strconv"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// staffThenLogin 是 operRentcar/operVisa/operAgency 共用的前置门禁：staff 先于登录检查。
// 返回 (userid, resp)；resp 非 nil 直接返回。
func (s *Service) staffThenLogin(ctx context.Context, req *ajax.Request) (int64, *ajax.Response) {
	m, _ := s.memberInfoOfViewer(req)
	userid := s.viewerID(ctx, req)
	if infoInt(m, "is_staff") == 1 {
		if !verificationStaffTravel(m, "2") {
			return userid, &ajax.Response{State: stateParamFailed, Info: infoOperAuthFailBang}
		}
		userid = int64(infoInt(m, "companyuid"))
	}
	if userid == -1 {
		return userid, &ajax.Response{State: stateParamFailed, Info: infoOperLoginTimeout}
	}
	return userid, nil
}

func (s *Service) operRentcar(req *ajax.Request) ajax.Response {
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
	address := operRaw(req.ParamsEscaped.Get("address"))
	pics := operRaw(req.ParamsEscaped.Get("pics"))
	video := operRaw(req.ParamsEscaped.Get("video"))
	tag := operRaw(req.ParamsEscaped.Get("tag"))
	typeid := phpInt(req.Params.Get("typeid"))
	price := phpFloatVal(req.Params.Get("price"))

	if operUserTypeGate(m) {
		return ajax.Response{State: stateParamFailed, Info: infoOperAuthFailBang} // travel[12][27]
	}

	company, resp2 := s.storeGate(ctx, userid)
	if resp2 != nil {
		return *resp2
	}

	if oper == "add" || oper == "update" {
		if emptyStr(title) {
			return ajax.Response{State: stateParamFailed, Info: "请输入汽车标题"} // travel[12][42]
		}
		if typeid == 0 {
			return ajax.Response{State: stateParamFailed, Info: "请选择车型"} // travel[9][9]
		}
		if emptyStr(address) {
			return ajax.Response{State: stateParamFailed, Info: "请输入详细地址"} // travel[8][61]
		}
		// PHP `$price == ''`（float 与 '' 比较，7.4 下 '' → 0）：price 为 0 即命中。
		if price == 0 {
			return ajax.Response{State: stateParamFailed, Info: "请输入租金"} // travel[9][11]
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
	carTable := "`" + s.prefix + "travel_rentcar`"
	pubdate := time.Now().Unix()
	priceStr := phpFloatString(price) // PHP 字面量里的 (float) 串
	rid := phpInt(id)

	switch oper {
	case "add":
		ins := "INSERT INTO " + carTable +
			" (`typeid`, `userid`, `company`, `title`, `cityid`, `addrid`, `address`, `pics`, `video`, `price`, `tag`, `pubdate`, `state`) " +
			"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
		args := []any{typeid, userid, company, title, cityid, addrid, address, pics, video,
			priceStr, tag, pubdate, s.rentcarCheck}
		res, err := s.db.ExecContext(ctx, ins, args...)
		if err != nil {
			return ajax.Response{State: stateParamFailed, Info: infoOperDBFail} // 101
		}
		aid, err := res.LastInsertId()
		if err != nil || aid == 0 {
			return ajax.Response{State: stateParamFailed, Info: infoOperDBFail}
		}

		s.operLog(req.HTTP, userid, "travel", "rentcar", aid, "insert",
			"添加租车("+title+")", s.urlOf(ctx, host, "rentcar-detail", strconv.FormatInt(aid, 10)),
			interpolate(ins, args...))

		return ajax.Response{State: ajax.StateOK, Info: aid} // PHP return $aid

	case "update":
		if !phpNumericRe.MatchString(id) { // SQL 错误面 → results != "ok" → 200 [12][34]
			return ajax.Response{State: stateParamFailed, Info: infoOperDBFail}
		}
		var eid sql.NullString
		err := s.db.QueryRowContext(ctx,
			"SELECT l.`id` FROM "+carTable+" l LEFT JOIN `"+s.prefix+"travel_store` s ON s.`id` = l.`company` WHERE l.`id` = ?",
			rid).Scan(&eid)
		if err == sql.ErrNoRows {
			return ajax.Response{State: stateParamFailed, Info: infoOperNotFound} // 101 [12][38]
		}
		// SQL 错误面：错误串 truthy → 继续走 UPDATE（报错则 [12][34]）。

		upd := "UPDATE " + carTable +
			" SET `typeid` = ?, `price` = ?, `userid` = ?, `company` = ?, `title` = ?, `cityid` = ?, `addrid` = ?, `address` = ?, `pics` = ?, `video` = ?, `tag` = ?, `state` = ? WHERE `id` = ?"
		args := []any{typeid, priceStr, userid, company, title, cityid, addrid, address, pics,
			video, tag, s.rentcarCheck, rid}
		if _, err := s.db.ExecContext(ctx, upd, args...); err != nil {
			return ajax.Response{State: stateParamFailed, Info: infoOperDBFail}
		}

		s.operLog(req.HTTP, userid, "travel", "rentcar", int64(rid), "update",
			"修改租车("+title+")", s.urlOf(ctx, host, "rentcar-detail", id),
			interpolate(upd, args...))

		return ajax.Response{State: ajax.StateOK, Info: infoOperModified}

	case "del":
		var did, dtitle, dpics, dvideo, duserid sql.NullString
		err := s.db.QueryRowContext(ctx,
			"SELECT l.`id`, l.`title`, l.`pics`, l.`video`, s.`userid` FROM "+carTable+
				" l LEFT JOIN `"+s.prefix+"travel_store` s ON s.`id` = l.`company` WHERE l.`id` = ?",
			rid).Scan(&did, &dtitle, &dpics, &dvideo, &duserid)
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
		_, _ = s.db.ExecContext(ctx, "DELETE FROM "+carTable+" WHERE `id` = ?", rid)
		s.operLog(req.HTTP, userid, "travel", "rentcar", int64(rid), "delete",
			"删除租车("+dtitle.String+")", "",
			"DELETE FROM "+carTable+" WHERE `id` = "+id)
		return ajax.Response{State: ajax.StateOK, Info: infoOperDeleted}
	}

	return ajax.Response{State: stateNoData, Info: infoNoData}
}

func (s *Service) operVisa(req *ajax.Request) ajax.Response {
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
	subtitle := operFiltered(req.ParamsEscaped.Get("subtitle"))
	pics := operRaw(req.ParamsEscaped.Get("pics"))
	video := operRaw(req.ParamsEscaped.Get("video"))
	price := phpFloatVal(req.Params.Get("price"))
	country := phpInt(req.Params.Get("country"))
	typeid := phpInt(req.Params.Get("typeid"))
	entrytimes := operRaw(req.ParamsEscaped.Get("entrytimes"))
	staytimes := operRaw(req.ParamsEscaped.Get("staytimes"))
	earliestdate := getMkTime(req.ParamsEscaped.Get("earliestdate")) // GetMkTime 全语义
	valid := operRaw(req.ParamsEscaped.Get("valid"))
	processingtime := operRaw(req.ParamsEscaped.Get("processingtime"))
	scope := operRaw(req.ParamsEscaped.Get("scope"))
	materials := operRaw(req.ParamsEscaped.Get("materials"))
	serviceincludes := operRaw(req.ParamsEscaped.Get("serviceincludes"))
	incumbentsscience := operRaw(req.ParamsEscaped.Get("incumbentsscience"))
	retiree := operRaw(req.ParamsEscaped.Get("retireescience")) // PHP 键名与列名不同，照搬
	professional := operRaw(req.ParamsEscaped.Get("professionalscience"))
	students := operRaw(req.ParamsEscaped.Get("studentsscience"))
	children := operRaw(req.ParamsEscaped.Get("childrenscience"))
	note := operFiltered(req.ParamsEscaped.Get("note"))
	others := operFiltered(req.ParamsEscaped.Get("others"))
	reminder := operFiltered(req.ParamsEscaped.Get("reminder"))
	notice := operFiltered(req.ParamsEscaped.Get("notice"))
	processingflow := operRaw(req.ParamsEscaped.Get("processingflow"))

	if operUserTypeGate(m) {
		return ajax.Response{State: stateParamFailed, Info: infoOperAuthFailBang} // travel[12][27]
	}

	company, resp2 := s.storeGate(ctx, userid)
	if resp2 != nil {
		return *resp2
	}

	if oper == "add" || oper == "update" {
		if emptyStr(title) {
			return ajax.Response{State: stateParamFailed, Info: infoOperTitleEmpty} // travel[11][27]
		}
		if emptyStr(scope) {
			return ajax.Response{State: stateParamFailed, Info: "请输入受理范围"} // travel[8][76]
		}
		if emptyStr(serviceincludes) {
			return ajax.Response{State: stateParamFailed, Info: "请输入包含的服务内容"} // travel[8][77]
		}
		if country == 0 {
			return ajax.Response{State: stateParamFailed, Info: "请选择目的地"} // travel[8][78]
		}
		if typeid == 0 {
			return ajax.Response{State: stateParamFailed, Info: "请选择签证类型"} // travel[8][70]
		}
		if price == 0 { // `$price == ''`（7.4 下 '' → 0）
			return ajax.Response{State: stateParamFailed, Info: infoOperPriceEmpty} // travel[11][47]
		}
		if emptyStr(entrytimes) {
			return ajax.Response{State: stateParamFailed, Info: "请输入签证次数"} // travel[8][71]
		}
		if emptyStr(staytimes) {
			return ajax.Response{State: stateParamFailed, Info: "请输入停留天数"} // travel[8][72]
		}
		if earliestdate == 0 {
			return ajax.Response{State: stateParamFailed, Info: "请选择最早可预订时间"} // travel[8][73]
		}
		if emptyStr(valid) {
			return ajax.Response{State: stateParamFailed, Info: "请输入有效时间"} // travel[8][74]
		}
		if emptyStr(processingtime) {
			return ajax.Response{State: stateParamFailed, Info: "请输入办理时长"} // travel[8][75]
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
	visaTable := "`" + s.prefix + "travel_visa`"
	pubdate := time.Now().Unix()
	priceStr := phpFloatString(price)
	vid := phpInt(id)

	switch oper {
	case "add":
		ins := "INSERT INTO " + visaTable +
			" (`userid`, `company`, `title`, `subtitle`, `country`, `typeid`, `price`, `entrytimes`, `staytimes`, `earliestdate`, `valid`, `processingtime`, `pics`, `video`, `scope`, `materials`, `serviceincludes`, `incumbentsscience`, `retireescience`, `professionalscience`, `studentsscience`, `childrenscience`, `others`, `reminder`, `notice`, `processingflow`, `pubdate`, `state`, `note`) " +
			"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
		args := []any{userid, company, title, subtitle, country, typeid, priceStr, entrytimes,
			staytimes, earliestdate, valid, processingtime, pics, video, scope, materials,
			serviceincludes, incumbentsscience, retiree, professional, students, children,
			others, reminder, notice, processingflow, pubdate, s.visaCheck, note}
		res, err := s.db.ExecContext(ctx, ins, args...)
		if err != nil {
			return ajax.Response{State: stateParamFailed, Info: infoOperDBFail} // 101
		}
		aid, err := res.LastInsertId()
		if err != nil || aid == 0 {
			return ajax.Response{State: stateParamFailed, Info: infoOperDBFail}
		}

		s.operLog(req.HTTP, userid, "travel", "visa", aid, "insert",
			"添加签证("+title+")", s.urlOf(ctx, host, "visa-detail", strconv.FormatInt(aid, 10)),
			interpolate(ins, args...))

		return ajax.Response{State: ajax.StateOK, Info: aid} // PHP return $aid

	case "update":
		if !phpNumericRe.MatchString(id) {
			return ajax.Response{State: stateParamFailed, Info: infoOperDBFail}
		}
		var eid sql.NullString
		err := s.db.QueryRowContext(ctx,
			"SELECT l.`id` FROM "+visaTable+" l LEFT JOIN `"+s.prefix+"travel_store` s ON s.`id` = l.`company` WHERE l.`id` = ?",
			vid).Scan(&eid)
		if err == sql.ErrNoRows {
			return ajax.Response{State: stateParamFailed, Info: infoOperNotFound} // 101 [12][38]
		}
		// SQL 错误面：错误串 truthy → 继续走 UPDATE（报错则 [12][34]）。

		upd := "UPDATE " + visaTable +
			" SET `userid` = ?, `company` = ?, `title` = ?, `subtitle` = ?, `country` = ?, `typeid` = ?, `price` = ?, `entrytimes` = ?, `staytimes` = ?, `earliestdate` = ?, `valid` = ?, `processingtime` = ?, `pics` = ?, `video` = ?, `scope` = ?, `materials` = ?, `serviceincludes` = ?, `incumbentsscience` = ?, `retireescience` = ?, `professionalscience` = ?, `studentsscience` = ?, `childrenscience` = ?, `others` = ?, `reminder` = ?, `notice` = ?, `processingflow` = ?, `state` = ?, `note` = ? WHERE `id` = ?"
		args := []any{userid, company, title, subtitle, country, typeid, priceStr, entrytimes,
			staytimes, earliestdate, valid, processingtime, pics, video, scope, materials,
			serviceincludes, incumbentsscience, retiree, professional, students, children,
			others, reminder, notice, processingflow, s.visaCheck, note, vid}
		if _, err := s.db.ExecContext(ctx, upd, args...); err != nil {
			return ajax.Response{State: stateParamFailed, Info: infoOperDBFail}
		}

		s.operLog(req.HTTP, userid, "travel", "visa", int64(vid), "update",
			"修改签证("+title+")", s.urlOf(ctx, host, "visa-detail", id),
			interpolate(upd, args...))

		return ajax.Response{State: ajax.StateOK, Info: infoOperModified}

	case "del":
		var did, dtitle, dpics, dvideo, duserid sql.NullString
		err := s.db.QueryRowContext(ctx,
			"SELECT l.`id`, l.`title`, l.`pics`, l.`video`, s.`userid` FROM "+visaTable+
				" l LEFT JOIN `"+s.prefix+"travel_store` s ON s.`id` = l.`company` WHERE l.`id` = ?",
			vid).Scan(&did, &dtitle, &dpics, &dvideo, &duserid)
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
		_, _ = s.db.ExecContext(ctx, "DELETE FROM "+visaTable+" WHERE `id` = ?", vid)
		s.operLog(req.HTTP, userid, "travel", "visa", int64(vid), "delete",
			"删除签证("+dtitle.String+")", "",
			"DELETE FROM "+visaTable+" WHERE `id` = "+id)
		return ajax.Response{State: ajax.StateOK, Info: infoOperDeleted}
	}

	return ajax.Response{State: stateNoData, Info: infoNoData}
}
