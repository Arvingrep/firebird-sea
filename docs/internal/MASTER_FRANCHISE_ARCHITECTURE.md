# 火鸟门户总代理与城市分站架构深度解析 (Master Franchise Architecture)

> 依据 `webroot/admin/siteConfig/siteCity.php`、`siteCityAdvanced.php` 与底层数据模型解构。

---

## 1. 业务拓扑结构 (菲律宾落地场景)

```mermaid
flowchart TD
    HQ[平台总部 (Platform HQ)] -->|招商授权 / 资金总池 / 基础运维| Franchise_MNL[马尼拉总代理 (Metro Manila)]
    HQ -->|招商授权 / 资金总池 / 基础运维| Franchise_CEB[宿务总代理 (Cebu Province)]
    HQ -->|招商授权 / 资金总池 / 基础运维| Franchise_CRK[克拉克特区总代理 (Clark / Angeles)]

    Franchise_MNL --> M1[BGC/马卡蒂商户]
    Franchise_MNL --> M2[趴赛/中国城商户]
    Franchise_MNL --> R1[马尼拉骑手车队]

    Franchise_CEB --> C1[宿务IT Park商户]
    Franchise_CEB --> R2[宿务本地骑手]
```

---

## 2. 底层技术实现机制

### 2.1 数据隔离与分权模型 (`site_city`)
* **核心数据表**：`#@__site_city`
  * `cid`：城市分站唯一主键。
  * `name`：城市名称（如 "Metro Manila"、"Cebu City"）。
  * `pinyin`：拼音或英文缩写（如 "manila"、"cebu"）。
  * `domain`：独立二级域名（如 `manila.fh580.net`）或顶级独立域名。
  * `admin`：关联的分站管理员账号 ID。
  * `config`：序列化数组，包含分站独立 Logo、联系方式、Google Maps 坐标中心点、独立抽成比例。
* **数据过滤隔离机制**：
  * 系统所有业务表（商户表 `business_list`、外卖订单表 `waimai_order`、跑腿单 `paotui_order`）均强制包含 `cityid` 字段。
  * 当城市总代理登录后台时，系统 Session 挂载 `adminCity` 标识，底层 SQL 查询自动追加安全拦截：
    ```sql
    SELECT * FROM `#@__waimai_order` WHERE `cityid` = 1 AND ...
    ```
  * 总代理无法跨区域越权读取其他城市的数据与资金记录。

### 2.2 域名路由自动识别 (`include/common.inc.php`)
火鸟内置了城市二级域名自动探测算法：
1. 用户在浏览器或 Telegram 中打开 `manila.fh580.net`。
2. 系统入口 `common.inc.php` 提取 `HTTP_HOST` 前缀 `manila`。
3. 从 Redis / 缓存中查询 `site_city` 命中 `cid = 1`。
4. 全局注入常量 `define('CITYID', 1)`。
5. 前台所有的外卖商家、跑腿派单、房产出租信息无需用户手动切换，自动聚焦当前城市。

### 2.3 资金清算与分账比例流转 (Commission Flow)
在订单完结并触发 `order_paid()` 后，资金流向按照以下公式自动化结算：
$$\text{用户实付金额} = \text{菜品费} + \text{包装费} + \text{骑手跑腿运费}$$
- **总部平台抽成**：例如提取实付的 $2\%$（平台技术服务费）。
- **城市总代理抽成**：从商家抽成中划扣 $5\% \sim 10\%$ 流入总代理后台虚拟账户。
- **骑手配送费**：$100\%$ 直接结算入骑手端钱包（`courier/mypocket.html`）。
- **商家所得**：扣除抽成后的净额沉淀至商家中心，商家可发起 USDT 提现。
