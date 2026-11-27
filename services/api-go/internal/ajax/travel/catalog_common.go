// catalog_common.go 是 hotel/ticket/rentcar/visa/agency 五组列表共享的前台/会员态
// WHERE 构造与 pageinfo 组装（分支差异由调用方拼接）。
package travel

import (
	"context"
	"net/url"
	"strconv"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// listGate 返回会员态的归属过滤片段（PHP：u==1 时按 userid 找店）：
// 有店 → " AND `company` = <sid>"；无店 → " AND 1 = 2"。rentcarList 无店时同样是 1=2。
func (s *Service) listMemberOwn(ctx context.Context, viewer int64) string {
	if sid := s.userStoreID(ctx, viewer); sid != "" {
		return " AND `company` = " + sid
	}
	return " AND 1 = 2"
}

// listFrontCity 复刻前台分支的 cityid 过滤（dataShare=0）：
// 有店 → " AND `company` in (ids)"；无店 → " AND 0 = 1"。
func (s *Service) listFrontCity(ctx context.Context, cityid int) string {
	if cityid <= 0 {
		return ""
	}
	sids := s.cityStoreSids(ctx, strconv.Itoa(cityid), true)
	if len(sids) > 0 {
		return " AND `company` in (" + strings.Join(sids, ",") + ")"
	}
	return " AND 0 = 1"
}

// listLikeSearch 复刻 search=keywords 回退 + store.title/address 子查询 + siteSearchLog 跳过：
// 有 sidArr → " AND (title like OR company in (ids))"；无 → " AND title like"。
// storeList 特有口径（member.title 子查询）不在此列。
func (s *Service) listLikeSearch(ctx context.Context, search string, titleCol string) string {
	if !truthy(search) {
		return ""
	}
	sids := s.storeLikeSids(ctx, search)
	if len(sids) > 0 {
		return " AND (" + titleCol + " like '%" + search + "%' OR `company` in (" + strings.Join(sids, ",") + "))"
	}
	return " AND " + titleCol + " like '%" + search + "%'"
}

// grayAuditRefuse 复刻 u==1 && uid>-1 时对 state=0/1/2 的三条 rowCount 统计
// （在 $archives 基础上追加 AND <col> = X，保持 PHP 的统计口径）。
// col 由调用方传（无别名表用 `state`，video/strategy 用 s.`state`）。
// 查询错误（-1）时 PHP 的 dsqlOper 返回错误串参与 json_encode……错误面在 canary
// 不可达（$archives 恒为合法 SQL），这里按 0 降级。
func (s *Service) grayAuditRefuse(ctx context.Context, archives string, col string, args []any) (int, int, int) {
	gray := s.countRows(ctx, archives+" AND "+col+" = 0", args...)
	audit := s.countRows(ctx, archives+" AND "+col+" = 1", args...)
	refuse := s.countRows(ctx, archives+" AND "+col+" = 2", args...)
	if gray < 0 {
		gray = 0
	}
	if audit < 0 {
		audit = 0
	}
	if refuse < 0 {
		refuse = 0
	}
	return gray, audit, refuse
}

// basePageinfo 是 page/pageSize/totalPage/totalCount 四件套。
func basePageinfo(page, pageSize int, totalCount string) *omap {
	m := newOmap()
	m.set("page", page)
	m.set("pageSize", pageSize)
	m.set("totalPage", phpCeil(totalCount, float64(pageSize)))
	m.set("totalCount", totalCount)
	return m
}

// limitClause 是 ` LIMIT atpage, pageSize`。
func limitClause(page, pageSize int) string {
	return " LIMIT " + strconv.Itoa(pageSize*(page-1)) + ", " + strconv.Itoa(pageSize)
}

// nestedStore 复刻列表项里的内联 storeDetail：
// `$param['id'] = company; $this->param = $param; $store = $this->storeDetail();`
// —— param 被污染，store 为原始返回（错误数组/详情数组/空）。
func (s *Service) nestedStore(ctx context.Context, host string, req *ajax.Request, viewer int64, company string) any {
	param := url.Values{"id": []string{company}}
	raw, _ := s.storeDetailRaw(ctx, host, param, viewer, req)
	if raw == nil {
		return []any{}
	}
	return raw
}

// pathSourceList 复刻 pics/imglist 的 {path: getFilePath(v), pathSource: v} 图集。
func (s *Service) pathSourceList(ctx context.Context, host, raw string) []any {
	out := []any{}
	if truthy(raw) {
		for k, v := range strings.Split(raw, ",") {
			m := newOmap()
			m.set("path", s.filePath(ctx, host, v))
			m.set("pathSource", v)
			out = appendAt(out, k, m)
		}
	}
	return out
}

// —— 通用响应包装 ——
// handlers::getHandle：state=200/101 → 101（info 原样）；返回数组（无 state）→ 100；
// falsy → 102。

func respOK(info any) ajax.Response {
	return ajax.Response{State: ajax.StateOK, Info: info}
}

func respFail(info string) ajax.Response {
	return ajax.Response{State: stateParamFailed, Info: info}
}

func respNoData() ajax.Response {
	return ajax.Response{State: stateNoData, Info: infoNoData}
}
