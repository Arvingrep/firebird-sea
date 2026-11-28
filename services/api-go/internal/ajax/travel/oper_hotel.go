// oper_hotel.go 是 travel 批次4（#373）的 operHotel（travel.class.php:1307-1540，写）。
//
// 门禁顺序（与 operTicket/Rentcar/Visa/Agency 的差异要保留）：登录超时 → userType
// 门禁 → staff（type=2）→ 店铺门禁。副作用：memberLog 迁移；room 子表 INSERT/UPDATE
// 迁移；updateAdminNotice / updateCache / checkCache / clearCache / dataAsync /
// delPicFile 不迁移（已知偏差）。
package travel

import (
	"context"
	"database/sql"
	"strconv"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// hotelRoomSpecialtime 复刻 specialtime 链：stripslashes → json_decode → serialize。
// json_decode 失败 → null → "N;"。
func hotelRoomSpecialtime(raw string) string {
	return phpSerializeValue(jsonDecodeList(ajax.PHPStripslashes(raw)))
}

// operHotel 操作旅游酒店（add/update/del/delhotelroom 四分支）。
func (s *Service) operHotel(req *ajax.Request) ajax.Response {
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
	if operUserTypeGate(m) {
		return ajax.Response{State: stateParamFailed, Info: infoOperAuthFailBang} // travel[12][27]
	}
	if infoInt(m, "is_staff") == 1 {
		if !verificationStaffTravel(m, "2") {
			return ajax.Response{State: stateParamFailed, Info: infoOperAuthFailBang} // travel[12][27]
		}
		userid = int64(infoInt(m, "companyuid"))
	}

	id := req.Params.Get("id")
	oper := req.Params.Get("oper")
	title := operFiltered(req.ParamsEscaped.Get("title"))
	typeid := phpInt(req.Params.Get("typeid"))
	addrid := phpInt(req.Params.Get("addrid"))
	cityid := phpInt(req.Params.Get("cityid"))
	address := operRaw(req.ParamsEscaped.Get("address"))
	price := phpFloatString(phpFloatVal(req.Params.Get("price")))
	tag := operRaw(req.ParamsEscaped.Get("tag"))
	pics := operRaw(req.ParamsEscaped.Get("pics"))
	video := operRaw(req.ParamsEscaped.Get("video"))
	roomlist := jsonDecodeList(req.Params.Get("roomlist"))
	bindModule := operRaw(req.ParamsEscaped.Get("bind_module"))

	company, resp := s.storeGate(ctx, userid)
	if resp != nil {
		return *resp
	}

	if oper == "add" || oper == "update" {
		if emptyStr(title) {
			return ajax.Response{State: stateParamFailed, Info: "请输入公司名称！"} // travel[12][31]
		}
		if addrid == 0 {
			return ajax.Response{State: stateParamFailed, Info: "请输入所在地区！"} // travel[12][32]
		}
		if emptyStr(pics) {
			return ajax.Response{State: stateParamFailed, Info: "请上传图片图片"} // travel[12][33]
		}
	} else if oper == "del" {
		if !phpNumericRe.MatchString(id) {
			return ajax.Response{State: stateParamFailed, Info: infoOperFormatError}
		}
	}

	if s.db == nil {
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}
	hotelTable := "`" + s.prefix + "travel_hotel`"
	roomTable := "`" + s.prefix + "travel_hotelroom`"
	pubdate := time.Now().Unix()

	switch oper {
	case "add":
		ins := "INSERT INTO " + hotelTable +
			" (`userid`, `company`, `title`, `cityid`, `typeid`, `addrid`, `address`, `pics`, `video`, `price`, `tag`, `pubdate`, `state`, `factag`) " +
			"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
		args := []any{userid, company, title, cityid, typeid, addrid, address, pics, video,
			price, tag, pubdate, s.hotelCheck, bindModule}
		res, err := s.db.ExecContext(ctx, ins, args...)
		if err != nil {
			return ajax.Response{State: stateParamFailed, Info: infoOperDBFail} // 101
		}
		aid, err := res.LastInsertId()
		if err != nil || aid == 0 {
			return ajax.Response{State: stateParamFailed, Info: infoOperDBFail}
		}

		s.operLog(req.HTTP, userid, "travel", "hotel", aid, "insert",
			"开通酒店店铺("+title+")", s.urlOf(ctx, host, "hotel-detail", strconv.FormatInt(aid, 10)),
			interpolate(ins, args...))

		s.insertHotelRooms(ctx, roomTable, aid, pubdate, roomlist, roomColsAdd)

		return ajax.Response{State: ajax.StateOK, Info: operHotelOK} // '发布成功！'

	case "update":
		// PHP 对 $id 不做 is_numeric 校验：非数值字面量会让存在性 SELECT 报 SQL 错误
		//（dsqlOper 返回错误串，truthy）→ 继续走 UPDATE → 再报错 → results != "ok" →
		// 200 [12][34]（外层包成 101）。数值字面量（含 "1e0"）才可能走到正常路径。
		if !phpNumericRe.MatchString(id) {
			return ajax.Response{State: stateParamFailed, Info: infoOperDBFail}
		}
		var eid sql.NullString
		err := s.db.QueryRowContext(ctx,
			"SELECT l.`id` FROM "+hotelTable+" l LEFT JOIN `"+s.prefix+"travel_store` s ON s.`id` = l.`company` WHERE l.`id` = ?",
			phpInt(id)).Scan(&eid)
		if err == sql.ErrNoRows || err != nil {
			return ajax.Response{State: stateParamFailed, Info: infoOperNotFound} // 101
		}

		upd := "UPDATE " + hotelTable +
			" SET `userid` = ?, `company` = ?, `title` = ?, `cityid` = ?, `typeid` = ?, `addrid` = ?, `address` = ?, `pics` = ?, `video` = ?, `price` = ?, `tag` = ?, `factag` = ?, `state` = ? WHERE `id` = ?"
		args := []any{userid, company, title, cityid, typeid, addrid, address, pics, video,
			price, tag, bindModule, s.hotelCheck, phpInt(id)}
		if _, err := s.db.ExecContext(ctx, upd, args...); err != nil {
			return ajax.Response{State: stateParamFailed, Info: infoOperDBFail}
		}

		s.operLog(req.HTTP, userid, "travel", "hotel", int64(phpInt(id)), "update",
			"修改酒店店铺("+title+")", s.urlOf(ctx, host, "hotel-detail", id),
			interpolate(upd, args...))

		// roomlist：有 id 的 UPDATE、无 id 的 INSERT（update 分支 INSERT 带 pubdate）。
		hotelSaveRooms(ctx, s.db, roomTable, int64(phpInt(id)), pubdate, roomlist)

		return ajax.Response{State: ajax.StateOK, Info: infoOperModified}

	case "del":
		var rid, rtitle, rpics, rvideo, ruserid sql.NullString
		err := s.db.QueryRowContext(ctx,
			"SELECT l.`id`, l.`title`, l.`pics`, l.`video`, s.`userid` FROM "+hotelTable+
				" l LEFT JOIN `"+s.prefix+"travel_store` s ON s.`id` = l.`company` WHERE l.`id` = ?",
			phpInt(id)).Scan(&rid, &rtitle, &rpics, &rvideo, &ruserid)
		if err == sql.ErrNoRows || err != nil {
			return ajax.Response{State: stateParamFailed, Info: infoOperNotFound} // 101
		}
		if !looseEqNumber(ruserid.String, userid) {
			return ajax.Response{State: stateParamFailed, Info: infoOperNoPerm} // 101
		}
		// delPicFile（pics/video 物理文件删除）不迁移。
		_, _ = s.db.ExecContext(ctx, "DELETE FROM "+roomTable+" WHERE `hotelid` = ?", phpInt(id))
		_, _ = s.db.ExecContext(ctx, "DELETE FROM "+hotelTable+" WHERE `id` = ?", phpInt(id))
		s.operLog(req.HTTP, userid, "travel", "hotel", int64(phpInt(id)), "delete",
			"删除酒店店铺("+rtitle.String+")", "", "DELETE FROM "+hotelTable+" WHERE `id` = "+id)
		return ajax.Response{State: ajax.StateOK, Info: infoOperDeleted} // {100, 删除成功！}

	case "delhotelroom":
		var rtitle sql.NullString
		err := s.db.QueryRowContext(ctx,
			"SELECT `title` FROM "+roomTable+" WHERE `id` = ?", phpInt(id)).Scan(&rtitle)
		if err == sql.ErrNoRows || err != nil {
			return ajax.Response{State: stateParamFailed, Info: infoOperNotFound} // 101
		}
		if _, err := s.db.ExecContext(ctx, "DELETE FROM "+roomTable+" WHERE `id` = ?", phpInt(id)); err != nil {
			return ajax.Response{State: stateParamFailed, Info: infoOperNoPerm} // 101
		}
		return ajax.Response{State: ajax.StateOK, Info: infoOperDeleted} // {100, 删除成功！}
	}

	// oper 不命中任何分支：PHP 隐式 return null → 102「No data!」。
	return ajax.Response{State: stateNoData, Info: infoNoData}
}

// roomColsAdd / roomColsUpdIns 是 hotelroom 两种 INSERT 的列序（PHP 两处字面量）。
var roomColsAdd = "`title`, `hotelid`, `area`, `iswindow`, `typeid`, `breakfast`, `price`, `specialtime`, `pubdate`, `pics`"

// insertHotelRooms 对应 add 分支的 roomlist 循环（全部 INSERT，pubdate 收尾列序）。
func (s *Service) insertHotelRooms(ctx context.Context, roomTable string, hotelID int64, pubdate int64,
	roomlist any, cols string) {
	saveRooms(ctx, s.db, roomTable, hotelID, pubdate, roomlist, func(val map[string]any, specialtime string) (string, []any) {
		return "INSERT INTO " + roomTable + " (" + cols + ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", []any{
			operRaw(itemStr(val, "title")), hotelID, operRaw(itemStr(val, "area")),
			operRaw(itemStr(val, "iswindow")), operRaw(itemStr(val, "typeid")),
			operRaw(itemStr(val, "breakfast")), operRaw(itemStr(val, "price")),
			specialtime, pubdate, operRaw(itemStr(val, "imgpath")),
		}
	})
}

// hotelSaveRooms 对应 update 分支：val.id 非空 → UPDATE，否则 INSERT（带 pubdate）。
func hotelSaveRooms(ctx context.Context, db *sql.DB, roomTable string, hotelID int64, pubdate int64, roomlist any) {
	saveRooms(ctx, db, roomTable, hotelID, pubdate, roomlist, func(val map[string]any, specialtime string) (string, []any) {
		vid := itemStr(val, "id")
		if vid != "" && vid != "0" { // PHP !empty($val['id'])
			q := "UPDATE " + roomTable +
				" SET `title` = ?, `hotelid` = ?, `area` = ?, `iswindow` = ?, `typeid` = ?, `breakfast` = ?, `price` = ?, `specialtime` = ?, `pics` = ? WHERE `id` = ?"
			return q, []any{
				operRaw(itemStr(val, "title")), hotelID, operRaw(itemStr(val, "area")),
				operRaw(itemStr(val, "iswindow")), operRaw(itemStr(val, "typeid")),
				operRaw(itemStr(val, "breakfast")), operRaw(itemStr(val, "price")),
				specialtime, operRaw(itemStr(val, "imgpath")), phpInt(vid),
			}
		}
		q := "INSERT INTO " + roomTable +
			" (`title`, `hotelid`, `area`, `iswindow`, `typeid`, `breakfast`, `price`, `specialtime`, `pics`, `pubdate`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
		return q, []any{
			operRaw(itemStr(val, "title")), hotelID, operRaw(itemStr(val, "area")),
			operRaw(itemStr(val, "iswindow")), operRaw(itemStr(val, "typeid")),
			operRaw(itemStr(val, "breakfast")), operRaw(itemStr(val, "price")),
			specialtime, operRaw(itemStr(val, "imgpath")), pubdate,
		}
	})
}

// saveRooms 遍历 roomlist（PHP foreach；assoc/空值不进循环）执行语句。语句失败被
// 忽略（PHP dsqlOper 失败不中断循环）。
func saveRooms(ctx context.Context, db *sql.DB, roomTable string, hotelID int64, pubdate int64,
	roomlist any, build func(val map[string]any, specialtime string) (string, []any)) {
	list, _ := roomlist.([]any)
	for _, item := range list {
		val, ok := item.(map[string]any)
		if !ok {
			continue // PHP foreach 对标量项会解包出错面，JSON 域不会出现，跳过。
		}
		specialtime := hotelRoomSpecialtime(itemStr(val, "specialtime"))
		q, args := build(val, specialtime)
		_, _ = db.ExecContext(ctx, q, args...)
	}
}

// emptyStr 复刻 PHP empty() 对字符串的判定（"" 与 "0" 都算空）。
func emptyStr(s string) bool { return s == "" || s == "0" }
