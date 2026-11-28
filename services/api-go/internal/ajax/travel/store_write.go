// store_write.go 是 travel 批次4（#373）的 storeConfig / storeConfigModule
// （travel.class.php:1076-1306，写路径仅 L1）。
//
// 副作用迁移口径：memberLog 迁移（经 Dep.MemberLog）；updateAdminNotice /
// updateCache / checkCache / clearCache / dataAsync 不迁移（Go 无缓存层 /
// 管理员通知面，已知偏差，同 member.sendComment 先例）。
package travel

import (
	"context"
	"database/sql"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// interpolate 把参数化 SQL 还原成 PHP 风格的留档串（只给 memberLog 的 sql 字段用，
// 口径同 member/sendComment.go 的 interpolate）。
func interpolate(query string, args ...any) string {
	var b strings.Builder
	i := 0
	for _, r := range query {
		if r == '?' && i < len(args) {
			b.WriteString("'" + stringifyArg(args[i]) + "'")
			i++
			continue
		}
		b.WriteRune(r)
	}
	return b.String()
}

func stringifyArg(v any) string {
	switch x := v.(type) {
	case nil:
		return ""
	case string:
		return x
	case int:
		return strconv.Itoa(x)
	case int64:
		return strconv.FormatInt(x, 10)
	case float64:
		return strconv.FormatFloat(x, 'f', -1, 64)
	case bool:
		if x {
			return "1"
		}
		return "0"
	}
	return ""
}

// operLog 记一条 memberLog（uid<=0 时 member 内部会跳过）。link 为空表示 PHP 传 ”。
func (s *Service) operLog(httpReq *http.Request, uid int64, module, temp string, aid int64,
	action, note, link, sqlText string) {
	if s.memberLog == nil {
		return
	}
	s.memberLog(httpReq, strconv.FormatInt(uid, 10), module, temp, aid, action, note, link, sqlText)
}

// operSQLLiteral 是「action 里 addslashes 过的串 + filterSensitiveWords」链的入库值：
// PHP INSERT 字面量 '$x' 被 MySQL 剥一层 → 存转义视图（同 sendCommon content）。
// 裸 $param['x'] 系（PHP 侧无 action 级转义）入库前由 PHPStripslashes 剥入口转义层。
func operFiltered(s string) string {
	return ajax.PHPStripslashes(ajax.FilterSensitiveWords(ajax.PHPAddslashes(s), true))
}

// operRaw 是「裸 $param['x']」链的入库值：PHP INSERT 字面量剥一层入口转义 → 存原文。
func operRaw(s string) string { return ajax.PHPStripslashes(s) }

// storeConfig 配置商铺（travel.class.php:1076-1230，写）。
//
// 门禁顺序：登录超时 → userType/is_staff → verifyModuleAuth（非 staff 恒拒）→
// staff（verificationStaff type=1，过则 userid=companyuid）→ title/cityid/tel/
// contact/pics 空 → 按 userid 查 store 决定 INSERT/UPDATE。两条成功路径都回文本
// （100）并 UPDATE travel_video/travel_strategy 的归属。
func (s *Service) storeConfig(req *ajax.Request) ajax.Response {
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
	if infoInt(m, "userType") != 2 && infoInt(m, "is_staff") != 1 {
		return ajax.Response{State: stateParamFailed, Info: infoOperUserTypeError}
	}
	if !verifyModuleAuthTravel() && infoInt(m, "is_staff") != 1 {
		return ajax.Response{State: stateParamFailed, Info: infoOperAuthFail}
	}
	if infoInt(m, "is_staff") == 1 {
		if !verificationStaffTravel(m, "1") {
			return ajax.Response{State: stateParamFailed, Info: infoOperAuthFailBang}
		}
		userid = int64(infoInt(m, "companyuid"))
	}

	title := operFiltered(req.ParamsEscaped.Get("title"))
	addrid := phpInt(req.Params.Get("addrid"))
	cityid := phpInt(req.Params.Get("cityid"))
	address := operRaw(req.ParamsEscaped.Get("address"))
	bindModule := operRaw(req.ParamsEscaped.Get("bind_module"))
	tel := operRaw(req.ParamsEscaped.Get("tel"))
	pics := operRaw(req.ParamsEscaped.Get("pics"))
	video := operRaw(req.ParamsEscaped.Get("video"))
	license := operRaw(req.ParamsEscaped.Get("license"))
	openweek := operRaw(req.ParamsEscaped.Get("openweek"))
	openStart := operRaw(req.ParamsEscaped.Get("openStart"))
	openEnd := operRaw(req.ParamsEscaped.Get("openEnd"))
	servicetime := operRaw(req.ParamsEscaped.Get("servicetime"))
	contact := operRaw(req.ParamsEscaped.Get("contact"))
	note := operFiltered(req.ParamsEscaped.Get("note"))

	if title == "" || title == "0" {
		return ajax.Response{State: stateParamFailed, Info: "请填写公司名称"} // travel[12][15]
	}
	if cityid == 0 {
		return ajax.Response{State: stateParamFailed, Info: "请选择所在地区"} // travel[12][16]
	}
	if tel == "" || tel == "0" {
		return ajax.Response{State: stateParamFailed, Info: "请填写联系方式"} // travel[12][17]
	}
	if contact == "" || contact == "0" {
		return ajax.Response{State: stateParamFailed, Info: "请填写联系人"} // travel[12][13]
	}
	if pics == "" || pics == "0" {
		return ajax.Response{State: stateParamFailed, Info: "请上传图集"} // travel[12][18]
	}

	if s.db == nil {
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}

	storeTable := "`" + s.prefix + "travel_store`"

	var storeID sql.NullString
	pubdate := time.Now().Unix()
	err := s.db.QueryRowContext(ctx,
		"SELECT `id` FROM "+storeTable+" WHERE `userid` = ?", userid).Scan(&storeID)
	if err == sql.ErrNoRows {
		// 新商铺：INSERT（state 固定 0）。
		ins := "INSERT INTO " + storeTable +
			" (`cityid`, `title`, `userid`, `addrid`, `address`, `tel`, `contact`, `pics`, `video`, `note`, `pubdate`, `bind_module`, `license`, `servicetime`, `state`, `date`, `openStart`, `openEnd`) " +
			"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '0', ?, ?, ?)"
		args := []any{cityid, title, userid, addrid, address, tel, contact, pics, video, note, pubdate,
			bindModule, license, servicetime, openweek, openStart, openEnd}
		res, err := s.db.ExecContext(ctx, ins, args...)
		if err != nil {
			return ajax.Response{State: stateParamFailed, Info: infoOperSaveFail}
		}
		aid, err := res.LastInsertId()
		if err != nil || aid == 0 {
			return ajax.Response{State: stateParamFailed, Info: infoOperSaveFail}
		}

		s.operLog(req.HTTP, userid, "travel", "store", aid, "insert",
			"申请店铺("+title+")", s.urlOf(ctx, host, "store-detail", strconv.FormatInt(aid, 10)),
			interpolate(ins, args...))

		// 更新当前会员下已发布信息的性质（video / strategy 归到店铺名下）。
		_, _ = s.db.ExecContext(ctx,
			"UPDATE `"+s.prefix+"travel_video` SET `usertype` = 1, `userid` = ? WHERE `userid` = ?", aid, userid)
		_, _ = s.db.ExecContext(ctx,
			"UPDATE `"+s.prefix+"travel_strategy` SET `usertype` = 1, `userid` = ? WHERE `userid` = ?", aid, userid)

		return ajax.Response{State: ajax.StateOK, Info: operStoreOKNew}
	}
	if err != nil {
		return ajax.Response{State: stateParamFailed, Info: infoOperSaveFail}
	}
	oldid := phpInt(storeID.String)

	// 已有商铺：UPDATE（state 重置 0）。
	upd := "UPDATE " + storeTable +
		" SET `cityid` = ?, `title` = ?, `userid` = ?, `addrid` = ?, `address` = ?, `tel` = ?, `contact` = ?, `pics` = ?, `video` = ?, `note` = ?, `bind_module` = ?, `license` = ?, `servicetime` = ?, `state` = '0', `date` = ?, `openStart` = ?, `openEnd` = ? WHERE `userid` = ?"
	args := []any{cityid, title, userid, addrid, address, tel, contact, pics, video, note,
		bindModule, license, servicetime, openweek, openStart, openEnd, userid}
	res, err := s.db.ExecContext(ctx, upd, args...)
	if err != nil {
		return ajax.Response{State: stateParamFailed, Info: infoOperSaveFail}
	}
	// dsqlOper "update" 成败口径：受影响 0 行也回 "ok"（PHP 只在 SQL 错误时非 ok）。
	_ = res

	s.operLog(req.HTTP, userid, "travel", "store", int64(oldid), "update",
		"修改店铺("+title+")", s.urlOf(ctx, host, "store-detail", strconv.Itoa(oldid)),
		interpolate(upd, args...))

	_, _ = s.db.ExecContext(ctx,
		"UPDATE `"+s.prefix+"travel_video` SET `usertype` = 1, `userid` = ? WHERE `userid` = ?", oldid, userid)
	_, _ = s.db.ExecContext(ctx,
		"UPDATE `"+s.prefix+"travel_strategy` SET `usertype` = 1, `userid` = ? WHERE `userid` = ?", oldid, userid)

	return ajax.Response{State: ajax.StateOK, Info: operStoreOKSave}
}

// storeConfigModule 配置商铺经营类目（travel.class.php:1231-1306，写）。
// 同 storeConfig 门禁（无字段校验）；store 不存在 → 200「还未开通旅游店铺…」；
// UPDATE bind_module → 文本「保存成功！」。
func (s *Service) storeConfigModule(req *ajax.Request) ajax.Response {
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
	if infoInt(m, "userType") != 2 && infoInt(m, "is_staff") != 1 {
		return ajax.Response{State: stateParamFailed, Info: infoOperUserTypeError}
	}
	if !verifyModuleAuthTravel() && infoInt(m, "is_staff") != 1 {
		return ajax.Response{State: stateParamFailed, Info: infoOperAuthFail}
	}
	if infoInt(m, "is_staff") == 1 {
		if !verificationStaffTravel(m, "1") {
			return ajax.Response{State: stateParamFailed, Info: infoOperAuthFailBang}
		}
		userid = int64(infoInt(m, "companyuid"))
	}

	if s.db == nil {
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}

	storeTable := "`" + s.prefix + "travel_store`"
	var id, title sql.NullString
	err := s.db.QueryRowContext(ctx,
		"SELECT `id`, `title` FROM "+storeTable+" WHERE `userid` = ?", userid).Scan(&id, &title)
	if err == sql.ErrNoRows {
		return ajax.Response{State: stateParamFailed, Info: infoOperStoreEmpty}
	}
	if err != nil {
		return ajax.Response{State: stateParamFailed, Info: infoOperStoreEmpty}
	}

	bindModule := operRaw(req.ParamsEscaped.Get("bind_module"))
	upd := "UPDATE " + storeTable + " SET `bind_module` = ? WHERE `userid` = ?"
	args := []any{bindModule, userid}
	res, err := s.db.ExecContext(ctx, upd, args...)
	if err != nil {
		return ajax.Response{State: stateParamFailed, Info: infoOperSaveFail}
	}
	_ = res

	oldid := phpInt(id.String)
	s.operLog(req.HTTP, userid, "travel", "store", int64(oldid), "update",
		"修改旅游店铺经营类目("+title.String+" => "+bindModule+")",
		s.urlOf(ctx, host, "store-detail", strconv.Itoa(oldid)), interpolate(upd, args...))

	return ajax.Response{State: ajax.StateOK, Info: operStoreOKSave}
}
