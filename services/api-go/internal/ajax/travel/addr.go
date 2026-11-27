package travel

import (
	"context"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// addrCity 是 addr 空 type 分支的行结构（travel.class.php:629-650）。
// id/hot/lower 均为 DB 原样字符串（PHP 未做强转，JSON 输出带引号，实测已确认）。
type addrCity struct {
	ID       string `json:"id"`
	Typename string `json:"typename"`
	Pinyin   string `json:"pinyin"`
	Hot      string `json:"hot"`
	Lower    string `json:"lower"`
}

// addr（travel.class.php:597-663）：
//   - 参数 type/page/pageSize/son（type=(int) 强转；son 按 PHP 松散比较）；
//   - $template 分支在 ajax 入口下恒不生效（ajax.php 只会把 template 置为 "page" 或留空，
//     而 `$template && $template != 'page'` 两种都不满足），Go 不实现该分支；
//   - type=0：可操作城市列表 = site_city JOIN site_area（匿名管理员 cityIds 走
//     userLogin::getAdminCity 的 else 全量分支，实测返回北京/上海）；
//   - type>0：getTypeList(type, "site_area", son, page, pageSize, ”, ”, true)。
//     hideSameCity 过滤在 canary 不生效（$cfg_sameAddr_state=1），未实现（见 typelist.go 口径说明）。
func (s *Service) addr(req *ajax.Request) ajax.Response {
	ctx := context.Background()
	if req.HTTP != nil {
		ctx = req.HTTP.Context()
	}
	typ := phpInt(req.Params.Get("type"))
	son := phpSon(req.Params.Get("son"))
	page := phpInt(req.Params.Get("page"))
	pageSize := phpInt(req.Params.Get("pageSize"))

	if typ == 0 {
		return s.addrCities(ctx)
	}
	rows, err := s.getTypeList(ctx, reqHost(req), "site_area", typ, son, page, pageSize)
	if err != nil {
		return ajax.Response{State: stateParamFailed, Info: infoTypeFailed}
	}
	if len(rows) == 0 {
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}
	return ajax.Response{State: ajax.StateOK, Info: rows}
}

// addrCities 复刻空 type 分支：
//  1. userLogin->getAdminCityIds()：匿名（getUserType != 3）走 else 全量分支，
//     返回 state=1 的全部 site_city 的 cid 逗号串；
//  2. 空 → "0"（实测 canary 有 1,2 两城，非空）；
//  3. `SELECT c.*, a.id cid, a.typename, a.pinyin FROM site_city c
//     LEFT JOIN site_area a ON a.id = c.cid WHERE c.cid in (...) ORDER BY c.id`，
//     每行再查子区域数量（string 输出）。
//
// DB 未配置 / 查询失败：PHP 侧 dsqlOper 异常 → catch 返回错误串 → $result 为
// 非空字符串 → if($result) 成立 → foreach 对字符串报错返回 null → 整体 102。
// Go 侧按 102（No data!）降级。
func (s *Service) addrCities(ctx context.Context) ajax.Response {
	if s.db == nil {
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}
	cityIDs := "0"
	// 匿名管理员全量分支：所有 state=1 的城市 cid。
	crows, err := s.db.QueryContext(ctx,
		"SELECT `cid` FROM `"+s.prefix+"site_city` WHERE `state` = 1 ORDER BY `id`")
	if err == nil {
		var ids []string
		for crows.Next() {
			var cid string
			if err := crows.Scan(&cid); err != nil {
				break
			}
			ids = append(ids, cid)
		}
		_ = crows.Close()
		if len(ids) > 0 {
			cityIDs = joinComma(ids)
		}
	}

	q := "SELECT c.*, a.`id` cid, a.`typename`, a.`pinyin` FROM `" + s.prefix + "site_city` c " +
		"LEFT JOIN `" + s.prefix + "site_area` a ON a.`id` = c.`cid` " +
		"WHERE c.`cid` in (" + cityIDs + ") ORDER BY c.`id`"
	rows, err := s.db.QueryContext(ctx, q)
	if err != nil {
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}
	defer func() { _ = rows.Close() }()
	cols, err := rows.Columns()
	if err != nil {
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}
	out := []addrCity{}
	for rows.Next() {
		vals := make([]string, len(cols))
		dest := make([]any, len(cols))
		for i := range vals {
			dest[i] = &vals[i]
		}
		if err := rows.Scan(dest...); err != nil {
			return ajax.Response{State: stateNoData, Info: infoNoData}
		}
		rec := map[string]string{}
		for i, c := range cols {
			rec[c] = vals[i]
		}
		// 子区域数量：SELECT count(*) totalCount FROM site_area WHERE parentid = cid ORDER BY weight
		lower := "0"
		var lc string
		if err := s.db.QueryRowContext(ctx,
			"SELECT count(*) totalCount FROM `"+s.prefix+"site_area` WHERE `parentid` = "+rec["cid"]+
				" ORDER BY `weight`").Scan(&lc); err == nil {
			lower = lc
		}
		out = append(out, addrCity{
			ID:       rec["cid"],
			Typename: rec["typename"],
			Pinyin:   rec["pinyin"],
			Hot:      rec["hot"],
			Lower:    lower,
		})
	}
	if err := rows.Err(); err != nil {
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}
	if len(out) == 0 {
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}
	return ajax.Response{State: ajax.StateOK, Info: out}
}

func joinComma(parts []string) string {
	out := ""
	for i, p := range parts {
		if i > 0 {
			out += ","
		}
		out += p
	}
	return out
}
