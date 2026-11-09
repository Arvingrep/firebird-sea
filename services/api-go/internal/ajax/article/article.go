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

// stateBadRequest 是 ajax.php 里 handler 返回 state=200 时的外层映射值
// （handlers.class.php:66-95：handler 自己给的 state 若为 200，包装层改写为 101）。
// 对比工具比的是最终 JSON，所以这里直接给 101。
const stateBadRequest = 101

// infoBadRequest 是 rewardList 参数非法时的固定文案（article.class.php:2416）。
const infoBadRequest = "格式错误！"

// prefixPattern 约束表前缀：前缀会被拼进 SQL，必须防注入（口径同 fbidentity）。
var prefixPattern = regexp.MustCompile(`^[A-Za-z0-9_]+$`)

// Dep 是 article 服务的依赖。
type Dep struct {
	// DB 是业务连接池。nil 表示「DB_HOST 未配置、本地纯内存模式」，
	// 此时 action 按「查不到数据」降级，不让启动失败。
	DB *sql.DB
	// TablePrefix 是火鸟表前缀，对应 PHP 的 $DB_PREFIX
	// （entrypoint-web.sh: `${DB_PREFIX:-huoniao_}`，两处默认必须一致）。
	TablePrefix string
	// Site 是拼 URL 需要的站点标量（见 site.go）。
	Site Site
}

// Service 是 article 服务的实现。
type Service struct {
	db          *sql.DB
	rewardTable string
	memberTable string
	attachTable string
	site        Site
}

// New 校验依赖并预拼表名（#@__member_reward、#@__member）。
func New(dep Dep) (*Service, error) {
	if !prefixPattern.MatchString(dep.TablePrefix) {
		return nil, fmt.Errorf("article: TablePrefix %q 含非法字符", dep.TablePrefix)
	}
	if err := dep.Site.validate(); err != nil {
		return nil, err
	}
	return &Service{
		db:          dep.DB,
		rewardTable: "`" + dep.TablePrefix + "member_reward`",
		memberTable: "`" + dep.TablePrefix + "member`",
		attachTable: "`" + dep.TablePrefix + "attachment`",
		site:        dep.Site,
	}, nil
}

// Register 注册本服务的全部 action。
func Register(router *ajax.Router, s *Service) {
	router.Register("article", "rewardList", s.rewardList)
}

// rewardItem 是 rewardList 返回的一行，字段顺序与 PHP 数组一致
// （article.class.php:2431-2437）。
//
// id / username 来自 LEFT JOIN 的 member 表：游客打赏（uid=-1）或会员已删时
// join 不到，PHP 侧是 NULL，这里保持 null 而不是空串。
// amount / date 是 DECIMAL / INT 列，PDO 统一按字符串返回（"5.00"、"1700000000"）。
type rewardItem struct {
	ID       *string `json:"id"`
	Username *string `json:"username"`
	Photo    string  `json:"photo"`
	Amount   string  `json:"amount"`
	Date     string  `json:"date"`
	URL      string  `json:"url"`
}

// rewardPageInfo 是 pageInfo 对象（article.class.php:2444）。
type rewardPageInfo struct {
	TotalCount int `json:"totalCount"`
}

// rewardInfo 是 rewardList 的 info 结构。
type rewardInfo struct {
	PageInfo rewardPageInfo `json:"pageInfo"`
	List     []rewardItem   `json:"list"`
}

// rewardList 迁移自 article.class.php:2413-2447：
//
//	$aid = (int)$param['aid'];                       // 缺参/非数字 → 0
//	if(!$aid) return array("state" => 200, "info" => '格式错误！');   // 外层改写为 101
//	SELECT m.id, m.nickname, m.photo, r.amount, r.date
//	  FROM member_reward r LEFT JOIN member m ON m.id = r.uid
//	 WHERE r.module = 'article' AND r.aid = $aid AND r.state = 1
//	 ORDER BY r.id ASC
//	$totalCount > 0 才取 results；photo 走 getFilePath；url = 域名 + "/user/" + id
//
// 注意两个与其它读接口不同的点：
//   - 返回数组恒含 pageInfo / list 两个键（非空数组），所以**查无记录也是 100**，
//     不是 102 "No data!"（handlers.class.php:84-87 的判据是「返回值为假」）。
//   - 不读 page / pageSize：SQL 没有 LIMIT，一次返回该文章的全部打赏记录。
func (s *Service) rewardList(req *ajax.Request) ajax.Response {
	// PHP 的 (int) 是截断转换（"3abc"→3、"abc"→0、"-1"→-1），不是严格解析；
	// "-1" 截断后非 0，PHP 会照常查询并返回空列表，不能当参数错误。
	aid := phpInt(req.Params.Get("aid"))
	if aid == 0 {
		return ajax.Response{State: stateBadRequest, Info: infoBadRequest}
	}

	if s.db == nil {
		// 本地纯内存模式没有火鸟库：PHP 侧无库时 dsqlOper 返回 false、rowCount 记 0，
		// 可观测结果就是「100 + 空列表」，这里保持同一形状。
		return emptyRewardResponse()
	}

	query := "SELECT m.`id`, m.`nickname`, m.`photo`, r.`amount`, r.`date` FROM " +
		s.rewardTable + " r LEFT JOIN " + s.memberTable + " m ON m.`id` = r.`uid`" +
		" WHERE r.`module` = 'article' AND r.`aid` = ? AND r.`state` = 1 ORDER BY r.`id` ASC"

	rows, err := s.db.QueryContext(context.Background(), query, aid)
	if err != nil {
		// PHP 查询失败时 rowCount 为 0，前端看到的就是空列表（不是 5xx）。
		return emptyRewardResponse()
	}
	defer func() { _ = rows.Close() }()

	list := make([]rewardItem, 0, 8)
	for rows.Next() {
		var (
			id       sql.NullString
			nickname sql.NullString
			photo    sql.NullString
			amount   sql.NullString
			date     sql.NullString
		)
		if err := rows.Scan(&id, &nickname, &photo, &amount, &date); err != nil {
			return emptyRewardResponse()
		}
		item := rewardItem{
			ID:       nullableString(id),
			Username: nullableString(nickname),
			Photo:    s.fileURL(photo.String),
			Amount:   amount.String,
			Date:     date.String,
		}
		// PHP 是字符串拼接：$cfg_secureAccess.$cfg_basehost."/user/".$val['id']，
		// id 为 NULL 时拼成 ".../user/"（不是跳过该字段）。
		userID := ""
		if id.Valid {
			userID = id.String
		}
		item.URL = s.site.SecureAccess + s.site.BaseHost + "/user/" + userID
		list = append(list, item)
	}
	if err := rows.Err(); err != nil {
		return emptyRewardResponse()
	}

	return ajax.Response{State: ajax.StateOK, Info: rewardInfo{
		PageInfo: rewardPageInfo{TotalCount: len(list)},
		List:     list,
	}}
}

// emptyRewardResponse 是「查无数据」时的固定响应。
func emptyRewardResponse() ajax.Response {
	return ajax.Response{State: ajax.StateOK, Info: rewardInfo{
		PageInfo: rewardPageInfo{TotalCount: 0},
		List:     []rewardItem{},
	}}
}

// nullableString 把可空列转成 JSON 的 string | null。
func nullableString(v sql.NullString) *string {
	if !v.Valid {
		return nil
	}
	out := v.String
	return &out
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
			// aid 只是过滤参数，远超 int 范围的输入按「查不到」处理即可。
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
