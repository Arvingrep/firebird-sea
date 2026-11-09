// Package article 是 ajax.php 的 article 服务（迁移进行中，总方案见 #298）。
package article

import (
	"context"
	"database/sql"
	"fmt"
	"regexp"
	"strings"

	"github.com/arvingrep/firebird-sea/services/api-go/internal/ajax"
)

// stateNoData 对应 handlers.class.php:84-87：action 返回「空数组 / false」时
// 外层包装固定为 state=102、info="No data!"。selfmedia_field 查不到行时 PHP
// 返回空数组（空数组在 PHP 里是 falsy），所以走的是这条分支而不是 state=100。
const stateNoData = 102

// infoNoData 是 state=102 时固定的提示文案（handlers.class.php:86）。
const infoNoData = "No data!"

// prefixPattern 约束表前缀：前缀会被拼进 SQL，必须防注入（口径同 fbidentity）。
var prefixPattern = regexp.MustCompile(`^[A-Za-z0-9_]+$`)

// Dep 是 article 服务的依赖。
type Dep struct {
	// DB 是业务连接池。nil 表示「DB_HOST 未配置、本地纯内存模式」，
	// 此时所有 action 按「查不到数据」降级（state=102），不让启动失败。
	DB *sql.DB
	// TablePrefix 是火鸟表前缀，对应 PHP 的 $DB_PREFIX
	// （entrypoint-web.sh: `${DB_PREFIX:-huoniao_}`，两处默认必须一致）。
	TablePrefix string
}

// Service 是 article 服务的实现。
type Service struct {
	db         *sql.DB
	fieldTable string
}

// New 校验依赖并预拼表名（#@__article_selfmedia_field）。
func New(dep Dep) (*Service, error) {
	if !prefixPattern.MatchString(dep.TablePrefix) {
		return nil, fmt.Errorf("article: TablePrefix %q 含非法字符", dep.TablePrefix)
	}
	return &Service{
		db:         dep.DB,
		fieldTable: "`" + dep.TablePrefix + "article_selfmedia_field`",
	}, nil
}

// Register 注册本服务的全部 action。
func Register(router *ajax.Router, s *Service) {
	router.Register("article", "selfmedia_field", s.selfmediaField)
}

// fieldItem 是 selfmedia_field 返回的一行。字段顺序与 PHP 数组一致
// （article.class.php:3221-3224）；lower 恒为空数组，是 PHP 写死的占位
// （分级字段在后台单独维护，前台接口从未填充过它）。
type fieldItem struct {
	ID       int    `json:"id"`
	Typename string `json:"typename"`
	Lower    []any  `json:"lower"`
}

// selfmediaField 迁移自 article.class.php:3207-3229：
//
//	$type = (int)$param['type'];                      // 缺参/非数字 → 0
//	SELECT * FROM article_selfmedia_field [WHERE type = $type] ORDER BY weight ASC
//	每行只取 id、typename，lower 固定 []；查不到行 → 空数组 → 外层 102 "No data!"
func (s *Service) selfmediaField(req *ajax.Request) ajax.Response {
	if s.db == nil {
		// 本地纯内存模式没有火鸟库：按「查不到数据」降级，与 PHP 无库时的
		// 可观测行为（dsqlOper 返回 false → 102）一致。
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}

	query := "SELECT `id`, `typename` FROM " + s.fieldTable
	var args []any
	// PHP 的 (int) 是截断转换（"3abc"→3、"3.7"→3、"abc"→0），不是严格解析；
	// type=0 表示「不过滤」，所以这里不能像 Atoi 那样把 "3abc" 当参数错误。
	if t := phpInt(req.Params.Get("type")); t != 0 {
		query += " WHERE `type` = ?"
		args = append(args, t)
	}
	query += " ORDER BY `weight` ASC"

	rows, err := s.db.QueryContext(context.Background(), query, args...)
	if err != nil {
		// PHP 侧查询出错时 dsqlOper 返回 false，可观测结果同样是 102 "No data!"。
		// 这里保持同一口径（查询失败不放大成 5xx，避免前端拿到与 PHP 不同的形状）。
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}
	defer func() { _ = rows.Close() }()

	list := []fieldItem{}
	for rows.Next() {
		var (
			id       int
			typename sql.NullString
		)
		if err := rows.Scan(&id, &typename); err != nil {
			return ajax.Response{State: stateNoData, Info: infoNoData}
		}
		list = append(list, fieldItem{ID: id, Typename: typename.String, Lower: []any{}})
	}
	if err := rows.Err(); err != nil {
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}

	// handlers.class.php:67/84：空返回 → 102 "No data!"；非空且无 state 键 → 100 + 原样数组。
	if len(list) == 0 {
		return ajax.Response{State: stateNoData, Info: infoNoData}
	}
	return ajax.Response{State: ajax.StateOK, Info: list}
}

// phpInt 复刻 PHP `(int)` 对字符串的截断转换：跳过前导空白、可选正负号、
// 取连续数字；没有数字就是 0（"abc"→0、""→0、"3abc"→3、"3.7"→3、" 12"→12）。
func phpInt(raw string) int {
	trimmed := strings.TrimLeft(raw, " \t\n\r\x0B\x0C")
	i, negative := 0, false
	if i < len(trimmed) && (trimmed[i] == '+' || trimmed[i] == '-') {
		negative = trimmed[i] == '-'
		i++
	}
	start := i
	value := 0
	for ; i < len(trimmed) && trimmed[i] >= '0' && trimmed[i] <= '9'; i++ {
		value = value*10 + int(trimmed[i]-'0')
		if value > 1<<31 {
			// PHP 在 64 位机器上溢出会继续累积成大整数，再截断回 int；
			// type 只是过滤参数，远超 int 范围的输入按「无此类型」处理即可。
			value = 1 << 31
			break
		}
	}
	if i == start {
		return 0
	}
	if negative {
		return -value
	}
	return value
}
