package article

import (
	"context"
	"database/sql"
	"regexp"
	"strconv"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
	"github.com/arvingrep/firebird-sea/services/api-go/internal/fburl"
)

// getTypeList 的 catch 分支返回 state=200 "分类获取失败！"，
// 外层 handlers::getHandle 把 200 改写成 101（info 原样）。
const (
	stateTypeFailed = 101
	infoTypeFailed  = "分类获取失败！"
)

// typeItem 是 article.type 返回的一行。字段顺序与 PHP 数组一致
// （dsql.class.php getTypeList：id、parentid、typename、title、litpic、
// url、pinyin、py、lower）。
//
// url 暂不输出：Arvin 在 #238 裁决选项 A，url 待 #330（fburl）接入后补，
// 对比用例以 ignoreFields 忽略 url，此处不自行拼接。
type typeItem struct {
	ID       int    `json:"id"`
	ParentID int    `json:"parentid"`
	Typename string `json:"typename"`
	Title    string `json:"title"`
	// Litpic：PHP 仅在原始 litpic 为真值时才写入该键（值为 getFilePath 结果，可能是 ""），
	// 故用指针：nil → 省略键；非 nil（含 ""）→ 恒输出。
	Litpic *string `json:"litpic,omitempty"`
	Pinyin string  `json:"pinyin"`
	Py     string  `json:"py"`
	// Lower：son=true 时为 []typeItem 或 ""（无子分类）；son=false 时为子分类数量，
	// 且只在 >0 时出现。
	Lower any `json:"lower,omitempty"`
}

var leadingNumber = regexp.MustCompile(`^[ \t\n\r\x0B\x0C]*[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?`)

// phpSon 复刻 `$param['son'] == 0 ? false : true`（PHP 7.4：字符串与 0 比较时
// 取前导数字，无数字为 0）。缺参 null==0 → false；"abc"、""、"0" → false。
func phpSon(raw string) bool {
	m := leadingNumber.FindString(raw)
	if m == "" {
		return false
	}
	f, err := strconv.ParseFloat(strings.TrimLeft(m, " \t\n\r\x0B\x0C"), 64)
	return err != nil || f != 0
}

// clampPage 复刻 ajax.php 对 page/pageSize 的归一（按参数来源通道区分）：
//   - GET（ajax.php:59-62）：(int)、<=0 取默认（page=1/pageSize=10）、>50000 取 50000；
//   - POST（ajax.php:97-99）：只有 (int) 和 >50000 取 50000，没有 <=0 取默认。
//
// POST 与 GET 同名时 POST 覆盖 GET，所以参数出现在 POST 表单里就按 POST 规则。
// 未出现返回 0，交给 getTypeList 的「空 → 1 / 1000」（POST 的 0 同样落到这里；
// POST 的负数原样进入 LIMIT，由数据库报错 → 101）。
func clampPage(req *ajax.Request, key string, def int) int {
	if !req.Params.Has(key) {
		return 0
	}
	v := phpInt(req.Params.Get(key))
	if !fromPost(req, key) && v <= 0 {
		v = def
	}
	if v > 50000 {
		v = 50000
	}
	return v
}

// fromPost 判断 key 的最终取值是否来自 POST 通道（POST 覆盖 GET）。
func fromPost(req *ajax.Request, key string) bool {
	return req.HTTP != nil && req.HTTP.PostForm != nil && req.HTTP.PostForm.Has(key)
}

// typeList 迁移自 article.class.php:263-288 + dsql::getTypeList。
func (s *Service) typeList(req *ajax.Request) ajax.Response {
	if s.db == nil {
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}
	mold := phpInt(req.Params.Get("mold"))
	parent := phpInt(req.Params.Get("type"))
	son := phpSon(req.Params.Get("son"))
	page := clampPage(req, "page", 1)
	pageSize := clampPage(req, "pageSize", 10)
	if page == 0 {
		page = 1
	}
	if pageSize == 0 {
		pageSize = 1000
	}

	host := ""
	if req.HTTP != nil {
		host = req.HTTP.Host
	}
	list, err := s.loadTypes(context.Background(), host, parent, mold, son, pageSize*(page-1), pageSize)
	if err != nil {
		return ajax.Response{State: stateTypeFailed, Info: infoTypeFailed}
	}
	if len(list) == 0 {
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}
	return ajax.Response{State: ajax.StateOK, Info: list}
}

// loadTypes 对应 getTypeList：返回 parent 下的分类；无行返回空切片。
func (s *Service) loadTypes(ctx context.Context, host string, parent, mold int, son bool, offset, limit int) ([]typeItem, error) {
	q := "SELECT * FROM " + s.typeTable + " WHERE `parentid` = ? AND `mold` = ? ORDER BY `weight` LIMIT ?, ?"
	rows, err := s.db.QueryContext(ctx, q, parent, mold, offset, limit)
	if err != nil {
		return nil, err
	}
	cols, err := rows.Columns()
	if err != nil {
		_ = rows.Close()
		return nil, err
	}
	var records []map[string]string
	for rows.Next() {
		vals := make([]sql.NullString, len(cols))
		dest := make([]any, len(cols))
		for i := range vals {
			dest[i] = &vals[i]
		}
		if err := rows.Scan(dest...); err != nil {
			_ = rows.Close()
			return nil, err
		}
		rec := make(map[string]string, len(cols))
		for i, c := range cols {
			rec[c] = vals[i].String
		}
		records = append(records, rec)
	}
	err = rows.Err()
	_ = rows.Close()
	if err != nil {
		return nil, err
	}

	items := make([]typeItem, 0, len(records))
	for _, r := range records {
		item := typeItem{
			ID:       phpInt(r["id"]),
			ParentID: phpInt(r["parentid"]),
			Typename: r["typename"],
			Pinyin:   r["pinyin"],
			Py:       r["py"],
		}
		// PHP: $v['title'] ? $v['title'] : $v['typename']（"0" 也是 falsy）
		if t := r["title"]; t != "" && t != "0" {
			item.Title = t
		} else {
			item.Title = item.Typename
		}
		if l := r["litpic"]; l != "" && l != "0" {
			pic := l
			if s.files != nil {
				if pic, err = s.files.File(ctx, l, fburl.Options{Host: host}); err != nil {
					return nil, err
				}
			}
			item.Litpic = &pic
		}
		if son {
			children, err := s.loadTypes(ctx, host, item.ID, mold, true, 0, 100000)
			if err != nil {
				return nil, err
			}
			if len(children) == 0 {
				item.Lower = "" // getTypeList 无行时 return ""
			} else {
				item.Lower = children
			}
		} else {
			// 子分类数量不带 mold 条件（PHP 原样）。
			var n int
			cq := "SELECT COUNT(*) FROM " + s.typeTable + " WHERE `parentid` = ?"
			if err := s.db.QueryRowContext(ctx, cq, item.ID).Scan(&n); err != nil {
				return nil, err
			}
			if n > 0 {
				item.Lower = n
			}
		}
		items = append(items, item)
	}
	return items, nil
}
