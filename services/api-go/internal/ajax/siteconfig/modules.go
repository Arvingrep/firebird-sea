package siteconfig

// moduleMeta 是各模块 config/<name>.inc.php 里 siteModule 会用到的字面量
// （webroot/include/config/*.inc.php，构建期快照）。
//
// PHP 的 siteModule 对每个模块 require 该 inc 文件，再调用模块 handler 的 config()；
// config() 的 title / description / channelDomain 全部来自这些字面量：
//
//	title       = str_replace('$city', $cityName, $customSeoTitle)   // ajax 直调时 $cityName 未定义 → '$city' 被删掉
//	description = str_replace('$city', $cityName, trim($customSeoDescription))
//	channelDomain = getDomainFullUrl(name, $customSubDomain)
//
// 注意 waimai 在仓库里只有 waimai.inc.php.example（运行环境的 inc 不入库），这里取 example 的值。
// 不在表里的模块名，PHP 里要么没有 handler 类（config 返回 state=200），要么没有 inc 文件，
// 一律按「handler 返回非 100」处理。
type moduleMeta struct {
	title, description string
	subDomain          int
	// sharePic 对应 inc 里的 $customSharePic；hasSharePic=false 表示该 inc 没有定义它
	// （此时 siteModule 方法作用域里的同名局部变量保持上一个模块留下的值）。
	sharePic    string
	hasSharePic bool
}

var moduleTable = map[string]moduleMeta{
	"article":    {"马尼拉华人资讯 - 本地新闻动态", "马尼拉华人资讯平台，提供最新的本地新闻、社区动态、生活资讯，连接菲律宾华人社区", 2, "", true},
	"awardlegou": {"有奖乐购", "有奖乐购", 2, "", true},
	"business":   {"商家标题", "商家描述", 2, "", false},
	"car":        {"汽车首页", "汽车描述", 2, "", true},
	"circle":     {"圈子动态", "圈子描述", 2, "", true},
	"education":  {"$city教育培训", "教育培训描述", 2, "", true},
	"homemaking": {"$city家政服务", "$city家政服务描述", 2, "", true},
	"house":      {"房产首页", "房产描述", 2, "", true},
	"huodong":    {"活动标题", "活动描述", 2, "", true},
	"image":      {"图说新闻", "", 2, "", false},
	"info":       {"马尼拉华人分类信息 - 本地生活服务平台", "马尼拉华人分类信息平台，提供房产租售、招聘求职、二手交易、生活服务等本地化信息服务，连接菲律宾华人社区", 2, "", true},
	"integral":   {"", "", 2, "", false},
	"job":        {"招聘求职", "火鸟招聘网是本地权威的求职找工作平台,为您提供真实准确的本地求职招聘信息,每天几万的高薪职位招聘信息供您选择,找工作上火鸟门户", 2, "", true},
	"live":       {"", "", 2, "", false},
	"marry":      {"婚宴酒店预订系统", "提供专业婚宴预订,一对一贴心服务,为您找到满意的婚庆酒店。", 2, "", true},
	"paimai":     {"", "", 2, "", true},
	"paper":      {"报刊首页", "报刊描述", 2, "", false},
	"pension":    {"养老机构", "养老机构描述", 2, "", true},
	"quanjing":   {"全景标题", "全景描述", 2, "", false},
	"renovation": {"装修首页", "装修描述", 2, "", true},
	"sfcar":      {"火鸟门户为您提供车找人、人找车、车找货、货找车信息", "拼车顺风车长途拼车网是私家车长途拼车信息发布、查询平台,是乘客寻找长途顺风车的明智选择,乘客可以根据需求自行联系车主,提倡绿色环保出行。", 2, "", true},
	"shop":       {"商城首页", "商城描述", 2, "", true},
	"special":    {"", "", 2, "", false},
	"task":       {"任务悬赏-口袋里的赚钱宝典", "任务悬赏是一款手机赚钱软件，手机赚钱随时随地想赚就赚！让你充分利用自己的碎片时间，任务发布一键完成，做单极速审核，提现秒到帐！", 2, "", true},
	"tieba":      {"贴吧社区", "贴吧描述", 2, "", true},
	"travel":     {"旅游度假", "旅游度假描述", 2, "", true},
	"tuan":       {"", "", 2, "", false},
	"video":      {"", "", 2, "", false},
	"vote":       {"投票", "投票描述", 2, "", false},
	"waimai": {"菲鸟外卖 - 东南亚品质美食与即时配送", "菲鸟外卖是菲鸟生活旗下的专业本地生活即时配送平台，汇聚马尼拉及东南亚优质餐饮、特色中餐与商超便利，极速送达，为您提供省心便捷的用餐体验。", 2,
		"https://storage.googleapis.com/fbird-sea-uploads/siteConfig/logo/fbird_logo.png", true},
	"website": {"自助建站首页", "自助建站描述", 2, "", false},
}
