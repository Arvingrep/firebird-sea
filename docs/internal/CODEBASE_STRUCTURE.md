# 火鸟门户旗舰版官方源码结构解构报告 (Codebase Deconstruction)

> 检查时间：2026-10-08  
> 源码版本：火鸟商业门户系统旗舰版 (2026构建)  
> 授权域名：`fh580.net` (证书已注入 `webroot/include/huoniao.php`)

---

## 1. 核心目录与功能映射

```
webroot/
├── admin/                     # 综合管理后台业务逻辑与控制器
│   ├── business/              # 商家管理、入驻审核、云打印机配置
│   ├── app/                   # App 与小程序配置
│   └── siteConfig/            # 全局站点、货币、地图、短信通道配置
├── api/                       # 外部集成网关
│   ├── map/                   # 地图集成 (原生支持 Google Maps: maps.googleapis.com)
│   ├── login/                 # 第三方社交免密登录 (微信/QQ/Apple/快捷手机)
│   └── payment/               # 核心支付插件目录 (统一路由 notify.php / return.php)
│       ├── alipay/            # 支付宝
│       ├── wxpay/             # 微信支付
│       ├── paypal/            # PayPal 国际支付 (外汇结算标准参考)
│       ├── fomopay_paynow/    # 东南亚 PayNow 接口
│       └── usdt/              # [待开发] 一人团队 USDT TRC-20 链上支付插件
├── courier/                   # 配送骑手端核心业务
├── data/                      # 运行时缓存与临时数据
├── include/                   # 核心底层类库与配置
│   ├── huoniao.php            # 官方商业授权证书 ($kumanyun_user_keys)
│   ├── common.inc.php         # 全局初始化与 Session/数据库加载
│   └── class/                 # 数据库驱动、HTTP、分词、安全过滤
├── install/                   # 官方数据库初始结构与数据
│   ├── db_structure.txt       # 数据表 DDL
│   └── db_default.txt         # 默认系统参数与字典表
├── templates/                 # 前端模板与触屏端 (touch)
│   ├── courier/               # 骑手端接单大厅、抢单地图与提现钱包
│   ├── business/              # 商家端后台与店铺主页
│   └── member/touch/          # 用户个人中心触屏端 (嵌入 Telegram Mini App 目标)
└── static/                    # 静态资源 (CSS / JS / UI 图片)
```

---

## 2. 东南亚（菲律宾）关键本地化适配点

### 2.1 地图服务 (Google Maps)
* **代码定位**：`webroot/api/map/mark.php` 与 `shape.php`
* **配置变量**：`$cfg_map_google`（Google Maps Platform API Key）
* **接口调用**：`//maps.googleapis.com/maps/api/js?key={$cfg_map_google}&libraries=places`
* **适配状态**：**原生支持**。无需二开地图接口，直接在后台配置 Key 并开启 Google Maps 模式即可定位马尼拉/宿务。

### 2.2 货币与结算 (PHP / USDT)
* **代码定位**：`include/config/siteConfig.inc.php`
* **配置变量**：
  * `$cfg_currency_symbol = '₱';` (菲律宾比索)
  * `$cfg_currency_code = 'PHP';`
* **双币拓展**：在 USDT 支付插件中按实时汇率（PHP/USDT 或固定比率）换算并挂载尾数。

### 2.3 骑手配送端 (`templates/courier/`)
* 系统已内置完整的骑手配送体系（抢单、导航、送达拍照确认、提现），天然覆盖同城外卖与跑腿业务。
