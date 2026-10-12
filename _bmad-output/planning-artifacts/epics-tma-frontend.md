---
status: final
created: 2026-10-12
inputDocuments:
  - prds/prd-tma-frontend-2026-10-12/prd.md
  - architecture/architecture-tma-frontend-2026-10-12/ARCHITECTURE-SPINE.md
  - briefs/brief-tma-frontend-2026-10-12/brief.md
note: 本文件是 TMA 新 Epic 的独立拆分，不覆盖、不修改 epics.md。
---

# Telegram Mini App 前端 - Epic Breakdown

## Overview

把 TMA PRD（TMA-FR-1 到 TMA-FR-14）与架构补充（AD 修订 + AD-20）拆成 6 个 Epic、22 个 Story。实施顺序固定：**Spike → 登录桥接 → 代理与白名单 → 外卖 → 资讯 → 安全门槛与发布**。身份与资金路径的 Story 必须带自动化测试（AD-15）。环境：Spike 与开发验收在 canary（`https://canary.fbird.men/tma/`），验收通过后晋升 prod。

### FR Coverage Map

Spike（前置阻塞）：Epic T1。TMA-FR-1 到 TMA-FR-3：Epic T2。TMA-FR-4：Epic T3。TMA-FR-5 到 TMA-FR-10、TMA-FR-12：Epic T4。TMA-FR-11：Epic T5。TMA-FR-13、TMA-FR-14 与 8 条安全 NFR 门槛：Epic T6（审计实现分布在 T2/T4 对应 Story，T6 做验收）。

## Epic List

1. Epic T1：前置 Spike（canary）
2. Epic T2：登录桥接（方案 P）
3. Epic T3：白名单代理与同域部署
4. Epic T4：外卖顾客端
5. Epic T5：资讯只读
6. Epic T6：安全门槛与发布

---

## Epic T1: 前置 Spike（canary）

验证方案 P 的关键假设、确认旁路来源、核查 IDOR。T1 不产出生产代码，产出书面结论；结论决定 T2/T3 的实现方式与 T4 的白名单范围。

### Story T1.1: 网关会话凭证 Spike（P/Q 分水岭）

As a 运营者,
I want 验证网关能否不改火鸟核心、仅凭数据库可查数据构造出 `getMemberID()` 认可的会话凭证,
So that 登录桥接方案 P 的可行性在写业务代码前得到证实。

**Acceptance Criteria:**

**Given** canary 环境与火鸟代码库
**When** 在 `webroot/api/fbs/` 扩展点内尝试按会员构造会话凭证并以该凭证调用一个需登录的火鸟接口
**Then** 产出书面结论：凭证构造方式、`getMemberID()` 是否认可、是否需要改核心

**Given** Spike 结论为「P 不可行」
**When** 记录失败原因与已尝试路径
**Then** 书面上报 Arvin，列出方案 Q（`tgkey` 分支）的改动范围与回滚方式；未经 Arvin 书面批准不启用 Q，后续 Epic 暂停

### Story T1.2: `createApiToken` 与 `$platform_userid` 旁路确认

As a 运营者,
I want 确认 `createApiToken` / `verifyApiToken` 的定义与 `$platform_userid` 的赋值来源,
So that 代理的剥离清单建立在确认过的事实上，不依赖未知旁路。

**Acceptance Criteria:**

**Given** 仓库内搜不到这两处定义
**When** 排查部署产物、加密加载器输出或向火鸟后端方确认
**Then** 产出书面结论：来源、是否构成身份旁路、代理需剥离的参数清单

**Given** 确认前或确认结果为「来源不明」
**When** 白名单代理处理任何请求
**Then** `userkey`、`access_token`、`platform_userid` 等相关参数一律剥离（默认立场，不因 Spike 未完成而放松）

### Story T1.3: 五接口 IDOR 核查

As a 运营者,
I want 对 `orderDetail`、`cancelOrder`、`operAddress`、`delAddress`、`getMemberAddress` 逐个核查 handler 是否按会员校验归属,
So that 越权风险在白名单放行前被识别。

**Acceptance Criteria:**

**Given** canary 环境里 A、B 两个测试会员及各自的订单与地址
**When** 以 A 的身份逐个调用上述五个接口访问 B 的对象 ID
**Then** 每个接口记录「拒绝 / 放行」结论，形成核查报告

**Given** 任一接口存在 IDOR
**When** 出具核查报告
**Then** 该接口标记为「不得进入白名单」，并附处理建议（修复点或替代方案），作为 Epic T6 发布门槛的输入

---

## Epic T2: 登录桥接（方案 P）

Node 验签 `initData`、签发 TMA 令牌，网关创建/查找会员并写映射。前置依赖：T1.1 结论为 P 可行。

### Story T2.1: `initData` 验签收紧

As a 顾客,
I want 打开 TMA 即被安全地验证 Telegram 身份,
So that 无需注册或密码即可登录，且身份无法伪造。

**Acceptance Criteria:**

**Given** 现有 `services/api/src/telegramAuth.js`（`auth_date` 窗口为 86400 秒）
**When** 收紧实现
**Then** HMAC 验签用常量时间比较；`auth_date` > 1 小时返回 401；剥离 Ed25519 `signature` 字段只认 `hash`；忽略 `initDataUnsafe` 与请求体用户 ID

**Given** 篡改的 `initData` 或过期 `auth_date`
**When** 调用 `POST /tg-api/auth/telegram`
**Then** 返回 401，且有 `node:test` 用例覆盖（有效、篡改、过期、缺字段）

### Story T2.2: TMA 令牌签发、吊销与防重放

As a 顾客,
I want 登录后获得一个短期令牌用于后续请求,
So that 会话可控、可吊销，泄漏影响有限。

**Acceptance Criteria:**

**Given** 验签通过的 `initData`
**When** 签发 TMA 令牌
**Then** 令牌绑定 `tg_id`、火鸟会员标识与 `env`（canary/prod）声明；TTL 短期可配置；服务端可吊销，吊销后立即失效

**Given** canary 签发的令牌
**When** 在 prod 使用（或反之）
**Then** 返回 401（环境声明校验）

**Given** 同一 `tg_id` 高频登录或同一 `initData` 哈希重复换发
**When** 超过限频/限次阈值
**Then** 返回 429，事件写审计日志；以上行为均有测试用例

### Story T2.3: 会员创建/查找与 `fbs_member_map`

As a 顾客,
I want 首次登录时自动获得对应的火鸟会员身份,
So that 下单与地址等数据归属到我名下。

**Acceptance Criteria:**

**Given** 一个从未登录过的 Telegram 用户
**When** 完成登录
**Then** 网关（`webroot/api/fbs/`）进程内创建火鸟会员（不改核心、不加表字段），Node 写入 `fbs_member_map`，一对一唯一约束

**Given** 已有映射的 Telegram 用户再次登录
**When** 完成登录
**Then** 命中已有映射，不创建第二个会员；并发重复登录也只产生一条映射（唯一约束兜底）

**Given** 任何客户端请求
**When** 尝试直接写映射
**Then** 不可能：映射仅服务端写入；登录与映射动作写审计日志

### Story T2.4: 前端登录流（内存令牌）

As a 顾客,
I want 打开 TMA 即自动登录、令牌过期无感续期,
So that 全程不需要输入任何凭据。

**Acceptance Criteria:**

**Given** TMA 在 Telegram 内启动
**When** 前端取得 `initData` 并调用登录端点
**Then** 令牌只存内存（不写 `localStorage`、不进 URL），后续请求经 `Authorization: Bearer` 携带

**Given** 令牌过期或内存丢失（WebView 回收）
**When** 下一次业务请求返回 401
**Then** 前端用有效 `initData` 自动重新换取令牌并重放请求，用户无感知；`initData` 也过期时提示重新打开 Mini App

---

## Epic T3: 白名单代理与同域部署

建 `/tg-api/fb/*` 白名单代理与 `/tma/` 静态路由，落实 AD-20。前置依赖：T1.2 剥离清单、T2 令牌可用。

### Story T3.1: 白名单代理骨架（默认拒绝 + 身份剥离）

As a 运营者,
I want 一个按 `service+action` 默认拒绝的透传代理,
So that 火鸟 `ajax.php` 不裸露给公网 Telegram 流量。

**Acceptance Criteria:**

**Given** `services/api` 新增路由 `/tg-api/fb/*`
**When** 请求的 `service+action` 不在白名单
**Then** 返回 403，不转发；白名单为代码内显式清单，变更随 PR 审核

**Given** 任何入站请求
**When** 代理转发到上游 `ajax.php`
**Then** 客户端传入的 Cookie、`userkey`、`access_token`、`platform_*` 等身份参数全部剥离；有测试覆盖「白名单外拒绝」与「身份参数剥离」

**Given** 匿名可读接口（如商家列表、资讯）
**When** 不带令牌请求
**Then** 照常转发，但仍受白名单与限流约束

### Story T3.2: 服务端凭证注入

As a 运营者,
I want 代理在服务端为已登录会员注入火鸟会话凭证,
So that 火鸟 handlers 能识别用户，而凭证永不到达浏览器。

**Acceptance Criteria:**

**Given** 带有效 TMA 令牌的请求
**When** 代理转发
**Then** 按令牌中的会员标识注入火鸟会话凭证（T1.1 验证的构造方式）；凭证即时生成或短 TTL 缓存，不落盘明文；日志对凭证脱敏

**Given** 需要身份的 `service+action`
**When** 请求不带令牌或令牌无效
**Then** 返回 401，不转发

**Given** 火鸟 handler 收到注入凭证的请求
**When** 执行 `getMemberID()`
**Then** 识别为映射的会员（canary 实测），核心代码未被修改

### Story T3.3: 限流与幂等

As a 运营者,
I want 写接口限流且 `deal` 要求幂等键,
So that `ajax.php` 无限流无幂等的缺陷在入口层被补上。

**Acceptance Criteria:**

**Given** 登录、下单、地址写入端点
**When** 超过各自限频阈值
**Then** 返回 429；阈值可配置

**Given** `deal` 请求
**When** 不带 `Idempotency-Key`
**Then** 返回 400 拒绝

**Given** 带相同 `Idempotency-Key` 的重复 `deal` 请求
**When** 第二次到达
**Then** 服务端去重，不产生第二张订单，返回首次结果；以上均有测试覆盖

### Story T3.4: Traefik 路由与同域部署

As a 运营者,
I want `/tma/` 静态资源与 `/tg-api/fb/*` 代理在 canary 同域可达,
So that TMA 无 CORS、无第三方 Cookie 问题。

**Acceptance Criteria:**

**Given** canary Traefik 配置
**When** 增加路由
**Then** `/tma/` → TMA 静态资源，`/tg-api/*` → Node（沿用 AD-9 前缀），其余仍归 PHP；`/api/fbs/` 对公网仍拒绝（AD-19）

**Given** 公网请求裸 `/include/ajax.php`
**When** 来自 TMA 路径
**Then** TMA 前端代码不产生该请求；H5 对该路径的使用不受影响

**Given** canary 部署完成
**When** 在 Telegram 真机打开 `https://canary.fbird.men/tma/`
**Then** 页面加载、登录链路走通 [NOTE FOR PM] 入口 `t.me/fbird_men_bot/fbirdcanary`（canary）已定，授权域名须在 BotFather 确认后方可真机验证

---

## Epic T4: 外卖顾客端

TMA 前端工程与外卖全链路。前置依赖：T2、T3。

### Story T4.1: 前端工程脚手架与 fbClient

As a 开发者,
I want `apps/tma` 具备约定的技术栈与统一的 API 客户端,
So that 后续页面 Story 在一致的工程基线上开发。

**Acceptance Criteria:**

**Given** `apps/tma`（已有 Vite）
**When** 搭建工程
**Then** Vite + Vue 3 + TS + Vue Router（hash）+ Pinia + `@telegram-apps/sdk` + Vant 4 可构建可运行；适配 Telegram ThemeParams 含暗色；不引入 uni-app

**Given** `fbClient` 封装
**When** 发起业务请求
**Then** 统一拼 `service/action`、追加 `platform_name=tma`、统一处理 `state != 100`、自动带令牌、写操作带 `Idempotency-Key`；鉴权层接口化；不写死阻碍后期 USDT 收银台的假设

**Given** 中英双语要求
**When** 切换语言
**Then** 全部界面文案跟随，默认中文

**Given** `start_param` 输入
**When** 不符合白名单格式（如 `shop_<id>`）
**Then** 一律忽略，不进入路由或请求

### Story T4.2: 商家列表

As a 顾客,
I want 浏览外卖商家列表,
So that 我能挑选想吃的餐厅。

**Acceptance Criteria:**

**Given** 匿名或已登录状态
**When** 打开外卖首页
**Then** 经白名单代理取得商家列表，展示商家名与营业状态；action 名以仓库 `waimai.class.php` 核对为准并同步进白名单

**Given** `start_param=shop_<id>` 深链
**When** 校验通过
**Then** 直接进入对应商家页

### Story T4.3: 菜单浏览与购物车

As a 顾客,
I want 浏览菜单并把菜品加入购物车,
So that 我能组好一单再提交。

**Acceptance Criteria:**

**Given** 一家商家的菜单页
**When** 浏览
**Then** 菜品按分类展示名称与价格（比索两位小数）

**Given** 购物车已有 A 商家菜品
**When** 加入 B 商家菜品
**Then** 提示需清空购物车，确认后才切换

**Given** 购物车操作
**When** 增减数量、删除、清空
**Then** 状态正确更新（Pinia）；数量为 0 或负数不可提交；空购物车不能进入下单

### Story T4.4: 下单（货到付款）

As a 顾客,
I want 选择地址并提交订单、货到付款,
So that 不绑定任何支付方式也能完成点餐。

**Acceptance Criteria:**

**Given** 已登录且购物车非空
**When** 选择配送地址并提交
**Then** 经代理调 `deal`（带 `Idempotency-Key`），订单归属服务端注入的会员；成功后展示订单号与状态

**Given** 地址为空
**When** 提交
**Then** 前端拦截且服务端拒绝

**Given** 网络重试导致重复提交
**When** 相同 `Idempotency-Key` 再次到达
**Then** 不产生第二张订单

**Given** 下单动作
**When** 成功创建
**Then** 写审计日志（会员、商家、订单号、时间）

### Story T4.5: 地址管理

As a 顾客,
I want 管理自己的配送地址,
So that 下单时可以直接选用。

**Acceptance Criteria:**

**Given** 已登录
**When** 查看、新增、编辑、删除地址
**Then** 经代理调用 `getMemberAddress` / `operAddress` / `delAddress`，列表即时更新

**Given** 以 A 会员身份访问 B 会员的地址 ID
**When** 调用上述接口
**Then** 被拒绝（依赖 T1.3 核查通过；未通过则该接口不在白名单，本 Story 阻塞并上报）

### Story T4.6: 订单列表、详情与取消

As a 顾客,
I want 查看我的订单并在允许时取消,
So that 我能跟踪和控制自己的订单。

**Acceptance Criteria:**

**Given** 已登录
**When** 打开订单列表
**Then** 展示订单号、商家、金额、状态；点开详情（`orderDetail`）见菜品行、地址、状态

**Given** 一张可取消状态的订单
**When** 点取消（`cancelOrder`）
**Then** 取消成功，列表与详情状态同步更新，写审计日志；可取消状态范围以火鸟现有规则为准

**Given** 以 A 会员身份访问 B 会员的订单
**When** 调用 `orderDetail` / `cancelOrder`
**Then** 被拒绝（同 T4.5 的门槛依赖）

---

## Epic T5: 资讯只读

### Story T5.1: 资讯分类与列表

As a 顾客,
I want 按分类浏览资讯列表,
So that 我能找到感兴趣的内容。

**Acceptance Criteria:**

**Given** 资讯页
**When** 打开
**Then** 展示分类与列表（匿名可读，经白名单代理）；具体 action 名实现时核对并同步进白名单

**Given** 列表滚动到底
**When** 还有更多数据
**Then** 分页加载 [ASSUMPTION] 分页方式按火鸟接口能力实现

### Story T5.2: 资讯详情（安全渲染）

As a 顾客,
I want 阅读资讯详情,
So that 我能在 Telegram 内完成阅读。

**Acceptance Criteria:**

**Given** 一篇资讯详情
**When** 渲染正文
**Then** 文本渲染，禁用 `v-html`（确需富文本先净化）；无评论、收藏等写入口

**Given** 正文中的外链
**When** 点击
**Then** 走 `Telegram.WebApp.openLink` 并提示离开应用

---

## Epic T6: 安全门槛与发布

8 条安全要点的整体验收与 canary → prod 晋升。前置依赖：T1 到 T5 完成。

### Story T6.1: IDOR 发布门槛复核

As a 运营者,
I want 五个归属敏感接口在发布前全部通过 IDOR 复核,
So that 越权访问不会带上线。

**Acceptance Criteria:**

**Given** T1.3 的核查报告与 T4 的实现
**When** 在 canary 用 A/B 双会员复测五个接口
**Then** 全部拒绝跨会员访问；任一未通过则对应接口移出白名单、功能不发布，并出具处理方案

### Story T6.2: 安全要点整体验收

As a 运营者,
I want 按 brief 的 8 条安全要点逐条验收,
So that 安全 NFR 不是纸面要求。

**Acceptance Criteria:**

**Given** canary 完整部署
**When** 逐条核验 8 条安全要点（身份、会话、代理、越权、凭证、输入、传输与密钥、审计）
**Then** 每条有通过证据（测试输出、配置截图或日志样例），汇总成验收清单

**Given** 传输与密钥项
**When** 检查
**Then** 全站 HTTPS、CSP 生效；Bot Token 与签名密钥只在服务端环境变量（两处 `firebird-api-secret`）；仓库与前端产物无密钥

**Given** 环境隔离项
**When** 检查
**Then** canary/prod 令牌互用返回 401；`services/tg-bot` 未对 `@fbird_men_bot` Token 做 `getUpdates`

### Story T6.3: canary 真机验收与 prod 晋升

As a 运营者,
I want 在真机 Telegram 走通全部主链路后晋升 prod,
So that 上线建立在真实环境验证之上。

**Acceptance Criteria:**

**Given** canary 环境与已配置的 Bot Mini App 入口 [NOTE FOR PM] 短名已定（fbird、fbirdcanary），授权域名待 BotFather 确认
**When** 真机 Telegram 执行：浏览商家→下单货到付款→订单详情→取消，以及资讯分类→列表→详情
**Then** 全链路走通，无控制台错误级异常

**Given** T6.1、T6.2 全部通过且主链路走通
**When** 晋升 prod（`https://manila.fbird.men/tma/`）
**Then** prod 部署后重复一次主链路冒烟；申请 Bot 官方认证列入上线后事项；不设固定上线日期

---

## 待 Arvin 提供

1. ✅ 已解决（2026-10-12）：Mini App 短名已创建——prod `t.me/fbird_men_bot/fbird` → `https://manila.fbird.men/tma/`，canary `t.me/fbird_men_bot/fbirdcanary` → `https://canary.fbird.men/tma/`。canary 与 prod 以不同短名区分，各自绑定独立 Web App URL。T3.4 / T6.3 真机验证解除阻塞。
2. ✅ 已确认（2026-10-12）：Mini App 不使用 `/setdomain` 授权域名机制，域控制点即各 app 的 Web App URL；BotFather 对两个短名的成功回执即覆盖 `canary.fbird.men` 与 `manila.fbird.men`。

## Spike 授权（Arvin 拍板，2026-10-12）

- 批准在 canary 做只读实测；允许读取 `.env`，但仅限连接类配置，任何密钥值不得输出到日志/线程/产物。
- `article`、`orderDetail` 排除出首轮接口白名单（orderDetail 贴近资金/订单路径，白名单先只放纯展示类接口）。
