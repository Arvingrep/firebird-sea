# 火鸟外卖（Waimai）与同城配送插件架构规范与路由指南

> 版本：火鸟旗舰版外卖系统 (skin2 / touch)  
> 状态：`CANARY_READY`  
> 适用站点：全站及马尼拉 / 宿务分站 (`canary.fbird.men`, `fh580.net`)

---

## 1. 模块架构解构与组成

外卖系统由五个核心子系统协同工作：

```
webroot/
├── templates/waimai/           # 1. 用户前台 (PC & 触屏端 skin2 模板)
│   ├── skin2/                  #    PC 端主页、商家页、购物车、收银台
│   └── touch/skin2/            #    移动端/H5/微信/TG WebApp 点餐页面与跑腿服务
├── wmsj/                       # 2. 外卖商家独立后台 (Waimai ShangJia)
│   ├── shop/                   #    店铺设置、菜品分类、商品发布、优惠券
│   ├── order/                  #    接单处理、订单详情、地图调度派单
│   ├── statistics/             #    营收统计图表、分时营业分析
│   └── templates/touch/        #    商家移动端工作台与极简登录
├── admin/waimai/               # 3. 平台外卖运营总控后台
│   ├── waimaiConfig.php        #    全局调度参数、自动分单、延误险设置
│   ├── waimaiShop.php          #    店铺资质审核、分店与商户列表
│   ├── waimaiOrder.php         #    全平台订单监控与售后纠纷仲裁
│   └── waimaiCourier.php       #    骑手档案管理与实时地图指派
├── templates/courier/          # 4. 骑手配送端 (Courier)
│   └── touch/                  #    抢单大厅、导航配送、取货签收、佣金提现
├── api/handlers/               # 5. 核心业务处理器与接口
│   ├── waimai.class.php        #    数据库持久层与外卖业务逻辑
│   ├── waimai.controller.php   #    Smarty 模板渲染调度器
│   └── waimai.config.php       #    模块配置与版本声明
└── include/config/waimai.inc.php # 业务配置档案 (费率、分成、超时时效)
```

---

## 2. 全链路标准路由与端点规范

| 通道 | 标准 URL / 伪静态路由 | 目标模板/脚本 | 鉴权说明 |
| :--- | :--- | :--- | :--- |
| **用户首页** | `/waimai/` 或 `/waimai/index.html` | `templates/waimai/touch/skin2/index.html` | 访客公开 |
| **店铺点餐** | `/waimai/shop.html?id={shop_id}` | `templates/waimai/touch/skin2/shop.html` | 访客公开 |
| **品类筛选** | `/waimai/list.html` | `templates/waimai/touch/skin2/list.html` | 访客公开 |
| **购物车结算** | `/waimai/cart.html` | `templates/waimai/touch/skin2/cart.html` | 会员登录拦截 |
| **同城跑腿** | `/waimai/paotui.html` | `templates/waimai/touch/skin2/paotui.html` | 会员登录拦截 |
| **骑手招募** | `/waimai/qishou.html` | `templates/waimai/touch/skin2/qishou.html` | 访客公开 |
| **骑手工作台** | `/?service=waimai&do=courier` | `templates/courier/touch/` | 骑手登录拦截 |
| **商家登录** | `/wmsj/login.php` | `wmsj/templates/touch/login.html` | 商家认证入口 |
| **商家主控** | `/wmsj/index.php` | `wmsj/templates/index.html` | 商家 Session 保护 |
| **平台管理** | `/admin/waimai/waimaiConfig.php` | `admin/templates/waimai/` | 平台超管权限 |
| **数据 API** | `/include/ajax.php?service=waimai&action={act}` | `api/handlers/waimai.class.php` | Token/Session 校验 |

---

## 3. 东南亚（菲律宾）本地化运行参数

在 `webroot/include/config/waimai.inc.php` 中固化了以下基线：
1. **自动派单半径**：`custom_autoDispatchJuli = 7000` (7 公里，符合大马尼拉 NCR 配送圈)。
2. **分成比例**：外卖骑手提成 `80%`，跑腿提成 `70%`。
3. **准时宝 / 延误险**：内置延误 10 分钟、20 分钟、30 分钟的分级赔偿机制。
4. **多币种结算**：全链路继承站点统一货币标识 `₱` (PHP 比索)。

## 原样入库基线（Story 1.1）

- 外卖模块文件（`webroot/admin/templates/waimai`、`webroot/wmsj`、`webroot/admin/waimai*`、`webroot/api/handlers/waimai.*`、静态资源）作为独立基线入库，不含授权文件、缓存、`webroot/data` 数据目录。
- `webroot/include/config/waimai.inc.php.example` 为配置样板；真实配置 `waimai.inc.php` 已停止跟踪并写入 `.gitignore`，仓库只保留脱敏的 `.example`（密钥、FTP 密码留空，服务器/用户名为占位值）。部署时由运营者将 `.example` 复制为 `waimai.inc.php` 并填入真实值（经部署环境注入，不入库）。
- 若基线提交因「增量行数」门禁失败：记录为需运营者决定的事项（人工审核 PR 或豁免），不绕过门禁。
- 校验：`services/api/test/waimai-baseline.test.js`（`npm test`，由 verify-task 步骤 6 运行）。
