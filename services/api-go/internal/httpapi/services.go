package httpapi

import "net/http"

// 四大核心模块的静态元数据（首页/服务入口用）。字段名与 Node 版逐字一致，
// priceUsdt 用 float64 —— 21.5 / 6.8 / 4.5 / 10.8 / 800 / 390 必须原样输出，
// 用整数或字符串都会让前端价格显示错。
type moduleItem struct {
	ID        string  `json:"id"`
	NameZh    string  `json:"nameZh"`
	NameEn    string  `json:"nameEn"`
	PricePhp  int64   `json:"pricePhp"`
	PriceUsdt float64 `json:"priceUsdt"`
}

type module struct {
	ID           string       `json:"id"`
	Icon         string       `json:"icon"`
	NameZh       string       `json:"nameZh"`
	NameEn       string       `json:"nameEn"`
	DescZh       string       `json:"descZh"`
	DescEn       string       `json:"descEn"`
	PopularItems []moduleItem `json:"popularItems"`
}

var serviceModules = []module{
	{
		ID:     "food",
		Icon:   "🍜",
		NameZh: "美食外卖",
		NameEn: "Food Delivery",
		DescZh: "马尼拉/BGC/Makati 华人热销餐厅准时必达",
		DescEn: "Authentic dining delivered fast across Metro Manila",
		PopularItems: []moduleItem{
			{ID: "f1", NameZh: "川味老火锅双人餐", NameEn: "Sichuan Hotpot Set", PricePhp: 1200, PriceUsdt: 21.5},
			{ID: "f2", NameZh: "港式烧腊双拼饭", NameEn: "Cantonese Roast Duo", PricePhp: 380, PriceUsdt: 6.8},
		},
	},
	{
		ID:     "errands",
		Icon:   "🛵",
		NameZh: "同城跑腿",
		NameEn: "City Errands",
		DescZh: "专人取送文件、代买生鲜药品、海关清关帮办",
		DescEn: "On-demand couriers & urgent errands across Manila",
		PopularItems: []moduleItem{
			{ID: "e1", NameZh: "BGC专人闪送 (5公里内)", NameEn: "BGC Express Courier", PricePhp: 250, PriceUsdt: 4.5},
			{ID: "e2", NameZh: "机场/码头证件加急代递", NameEn: "NAIA Airport Expedited Document", PricePhp: 600, PriceUsdt: 10.8},
		},
	},
	{
		ID:     "housing",
		Icon:   "🏢",
		NameZh: "房产租赁",
		NameEn: "Real Estate",
		DescZh: "BGC / Makati / 趴赛 高档公寓整租、免中介费直租",
		DescEn: "Luxury Condos & Apartments for Rent/Sale in Manila",
		PopularItems: []moduleItem{
			{ID: "h1", NameZh: "BGC Uptown Parksuites 1BR", NameEn: "BGC Uptown Parksuites 1BR", PricePhp: 45000, PriceUsdt: 800},
			{ID: "h2", NameZh: "Makati Jazz Residences Studio", NameEn: "Makati Jazz Residences Studio", PricePhp: 22000, PriceUsdt: 390},
		},
	},
	{
		ID:     "jobs",
		Icon:   "💼",
		NameZh: "招聘求职",
		NameEn: "Jobs & Careers",
		DescZh: "中英双语客服、技术研发、财务人事急聘直聊",
		DescEn: "Bilingual Tech, CS & Admin Careers in SEA",
		PopularItems: []moduleItem{
			{ID: "j1", NameZh: "双语高级客服专家 (月薪 80k-120k PHP)", NameEn: "Bilingual Customer Specialist", PricePhp: 0, PriceUsdt: 0},
			{ID: "j2", NameZh: "资深全栈工程师 (Remote / Pasay)", NameEn: "Senior Fullstack Engineer", PricePhp: 0, PriceUsdt: 0},
		},
	},
}

func (s *Server) services(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, successData{Success: true, Data: serviceModules})
}
