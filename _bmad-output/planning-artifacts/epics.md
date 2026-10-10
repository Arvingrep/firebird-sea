---
status: final
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - prds/prd-firebird-sea-2026-10-10/prd.md
  - architecture/architecture-firebird-sea-2026-10-10/ARCHITECTURE-SPINE.md
---

# firebird-sea - Epic Breakdown

## Overview

本文把 PRD（28 条需求）与架构说明（AD-1 到 AD-15）拆成可实施的 Epic 与 Story。优先级：v1-α（第一笔真实订单）→ v1（AI 上架）→ v1.1。每个 Story 的验收条件都可测试，资金路径的 Story 必须带自动化测试（AD-15）。

## Requirements Inventory

### Functional Requirements

FR-1 免密登录；FR-2 三语菜单；FR-3 下单；FR-4 订单通知；FR-5 收银台；FR-6 自动对账；FR-7 对账异常队列；FR-8 订单与尾数持久化；FR-9 接单与拒单；FR-10 配送状态；FR-11 提交菜单照片；FR-12 生成待确认清单；FR-13 价格逐条确认；FR-14 AI 翻译；FR-15 上架后修改（v1.1）；FR-16 到 FR-21 兑换（v1.1）；FR-22、FR-23 AI 新闻（v1.1）；FR-24 订单状态转移；FR-25 接单超时；FR-26 退款规则；FR-27 角色与对象级授权；FR-28 密钥与收款地址保护。

### NonFunctional Requirements

NFR-1 安全（无私钥入库、只读链接口、签名校验与对象级授权）；NFR-2 金额精度（PHP 两位小数、USDT 六位）；NFR-3 可靠性（持久化、每日备份、监听器告警）；NFR-4 变更经 CI 门禁；NFR-5 界面三语并回退英文。

### Additional Requirements

AR-1 外卖模块原样入库（AD-14）；AR-2 网关与火鸟交互的技术验证（AD-3）；AR-3 `/tg-api` 路由前缀（AD-9）；AR-4 生产启动自检与密钥注入（AD-13）；AR-5 `fbs_` 表迁移与 `mysql2` 依赖批准（AD-5、AD-15）；AR-6 CI 增加 `npm test`（AD-15）；AR-7 可写状态持久化、计划任务 CronJob、监听器部署、网关仅内部可达（AD-16 到 AD-19）。

### UX Design Requirements

无独立 UX 文档；Mini App 的界面细节在对应 Story 中以验收条件描述。

### FR Coverage Map

FR-1 到 FR-4：Epic 3。FR-5 到 FR-8：Epic 2。FR-9、FR-10、FR-24 到 FR-28：Epic 4。FR-11 到 FR-14：Epic 5。FR-15 到 FR-23：Epic 6（v1.1）。AR-1 到 AR-6：Epic 1。

## Epic List

1. 基线与可部署底座（v1-α）
2. 可信的 USDT 付款（v1-α）
3. 顾客下单（v1-α）
4. 商家接单、退款与授权（v1-α）
5. AI 菜单照片上架（v1）
6. v1.1 扩展：兑换、新闻、上架后修改

## Epic 1: 基线与可部署底座

让火鸟外卖模块受控入库、路由与配置安全、Node 服务可测试，后面的 Epic 才能安全地构建。

### Story 1.1: 外卖模块原样入库

As a 运营者,
I want 把火鸟外卖模块文件作为一个独立的"原样入库"提交放进仓库,
So that 后续所有修改都有干净的基线，且不会混入无关改动。

**Acceptance Criteria:**

**Given** 主目录 `webroot/` 里有未入库的外卖文件（`templates/waimai`、`wmsj`、`admin/waimai`、`api/handlers/waimai.*`、静态资源）
**When** 从 `origin/main` 建独立分支并只复制选定路径
**Then** 提交只包含外卖相关文件，不含授权文件、缓存、数据目录和主目录的其他改动
**And** `waimai.inc.php` 只入库 `.example` 版本，真实配置不入库

**Given** 该提交需要过 CI 门禁
**When** 门禁因增量行数失败
**Then** 记录为需要运营者决定的事项（人工审核 PR 或豁免），不绕过门禁

### Story 1.2: 网关技术验证（spike）

As a 运营者,
I want 验证 Node 经 `webroot/api/fbs` 网关能调用火鸟的下单、支付成功、取消流程,
So that 架构里的关键假设在写业务代码前得到证实。

**Acceptance Criteria:**

**Given** 本地 docker 环境已能访问外卖站点（经 8080 端口）
**When** 编写最小网关调用 `deal()`、`order_paid()`、`cancelOrder()`
**Then** 记录 `deal()` 是否同步创建 `pay_log`，`order_paid` 后订单是否变为 state 2

**Given** 一个已付款订单
**When** 调用取消
**Then** 记录 state 值与 `refrundstate`，据此修正 AD-2 的假设或确认它

### Story 1.3: 路由前缀与生产配置自检

As a 运营者,
I want Node API 迁移到 `/tg-api` 并在生产启动时自检配置,
So that 火鸟的支付回调不被 Node 拦截，且不会带着演示配置上线。

**Acceptance Criteria:**

**Given** Traefik 路由当前把 `/api` 前缀交给 Node
**When** 把 Node 路由改为 `/tg-api`
**Then** `/api/payment/notify.php` 由 PHP 处理，现有 Node 路由全部在新前缀下可用

**Given** 生产环境
**When** 服务启动时发现演示令牌、占位符收款地址或缺少必填环境变量
**Then** 服务拒绝启动并输出明确错误
**And** `mock-webhook` 在生产环境不注册

**Given** Helm 部署
**When** 渲染 api 与 listener 的模板
**Then** Telegram、Coins.ph、TronGrid 的密钥通过 Secret 注入

### Story 1.4: Node 测试与 CI

As a 运营者,
I want Node 服务有内置测试并在 CI 中运行,
So that 资金路径的改动不会无测试上线。

**Acceptance Criteria:**

**Given** `services/api` 与 `services/payment-listener`
**When** 运行 `npm test`
**Then** 使用 `node:test` 执行测试，至少包含 `telegramAuth` 与尾数分配的用例

**Given** CI 工作流
**When** 触发验证
**Then** 执行各服务的 `npm test`，失败则阻止合并

### Story 1.5: `fbs_` 表迁移

As a 运营者,
I want 一组可重复执行的迁移脚本创建 `fbs_` 表,
So that 账本、退款、审计等数据有持久化的家。

**Acceptance Criteria:**

**Given** 空的 MariaDB
**When** 运行迁移
**Then** 创建 AD-5 列出的全部表，`fbs_chain_tx` 对 `(txid, event_index)` 唯一，`fbs_charge` 有 `holds_tail` 与部分唯一约束

**Given** 已迁移的数据库
**When** 再次运行迁移
**Then** 不报错、不改动已有数据

**Given** 迁移需要 `mysql2` 依赖
**When** 新增依赖
**Then** 经 Zero-Dep 人工确认并记录在 `docs/internal/` 中

### Story 1.6: 可写状态持久化

As a 运营者,
I want 上传的图片、会话和日志不随 Pod 重启丢失,
So that 菜单图片和登录状态在发布后依然可用。

**Acceptance Criteria:**

**Given** 商家上传的菜品图片和附件
**When** PHP Pod 被重建
**Then** 这些文件仍然可访问（PVC 或对象存储）

**Given** 已登录的会员
**When** PHP Pod 重启
**Then** 会话不丢失（Redis 存会话）

**Given** 模板缓存和日志
**When** 部署
**Then** 缓存留在 `emptyDir`，日志输出到标准输出

### Story 1.7: 计划任务 CronJob

As a 运营者,
I want 集群每分钟触发火鸟的计划任务,
So that 订单超时、自动派单和超时提醒真正运行。

**Acceptance Criteria:**

**Given** Helm 部署
**When** 渲染模板
**Then** 存在 `fbs-cron-<site>` CronJob，每分钟在 PHP 镜像中执行 `php include/cron.php`

**Given** 一个 30 分钟未支付的订单
**When** CronJob 运行
**Then** 订单被置为 state 6

**Given** 上一次运行尚未结束
**When** 下一个周期到来
**Then** 不并发重叠运行

### Story 1.8: 付款监听器部署

As a 运营者,
I want 付款监听器作为独立服务部署,
So that 链上到账能被持续监听。

**Acceptance Criteria:**

**Given** `services/payment-listener`
**When** 构建镜像
**Then** 有 Dockerfile，并在 compose 与 Helm 中加入服务，副本数为 1，更新策略为 Recreate

**Given** 部署
**When** 渲染模板
**Then** 密钥通过 Secret 注入，且网关 `/api/fbs/` 对外被拒绝（AD-19）

## Epic 2: 可信的 USDT 付款

让顾客能用 USDT 付款，系统能可靠、幂等、可追溯地对账；这是整个项目最关键的资金路径。

### Story 2.1: 收银台与尾数分配

As a 顾客,
I want 下单后看到准确的 USDT 应付金额、收款地址和倒计时,
So that 我知道该转多少钱。

**Acceptance Criteria:**

**Given** 一个待支付订单和 Coins.ph 买价
**When** 创建收银台
**Then** 应付金额按 `ceil(php_minor * 1e6 / rate) + tail * 1e4` 生成，保存汇率快照与时间，响应返回 `payable_micro`、`rate_str`、`rate_at`

**Given** 已有 90 个占用中的尾数
**When** 再创建收银台
**Then** 请求被拒绝并提示稍后再试

**Given** 汇率获取失败或快照超过 60 秒
**When** 创建收银台
**Then** 不创建订单，返回明确错误

**Given** 并发创建收银台
**When** 两个请求算出相同的 `payable_micro`
**Then** 数据库唯一约束保证只有一个成功，另一个重新分配尾数

### Story 2.2: 链监听与流水账本

As a 运营者,
I want 监听器可靠地把链上 USDT 转入记录写入数据库,
So that 对账有可信的原始数据。

**Acceptance Criteria:**

**Given** TronGrid 返回转入记录
**When** 监听器处理
**Then** 仅保存合约为官方 USDT-TRC20、收款地址等于配置地址、已固化确认的转账到 `fbs_chain_tx`

**Given** 同一笔交易重复返回
**When** 再次处理
**Then** 唯一约束保证不重复入库

**Given** 监听器重启
**When** 启动
**Then** 从 `fbs_cursor` 记录的区块继续扫描，不漏不重

### Story 2.3: 对账结算与 USDT 支付插件

As a 顾客,
I want 转账到账后订单自动变为已付款,
So that 我不需要手动通知商家。

**Acceptance Criteria:**

**Given** 一笔与某个收银台金额完全相等的已确认转账
**When** 执行 `reconcile()`
**Then** 本地事务把 `fbs_charge` 置为 `matched` 并写 `fbs_outbox`，再经网关调用 `order_paid`，订单变为 state 2

**Given** 网关调用失败
**When** 投递任务重试
**Then** 按 `fbs_outbox` 重试直到成功，不产生第二次状态变化

**Given** USDT 支付插件 `api/payment/usdt/usdt.php`
**When** 火鸟加载它
**Then** 实现 `get_code` 与 `respond`，且结算路径只调用 `order_paid`

**Given** 同时发生的对账和订单超时
**When** 两者竞争
**Then** 以先成功的条件更新为准，另一方得到明确失败

### Story 2.4: 对账异常队列与告警

As a 运营者,
I want 无法自动对账的转账进入队列并收到 Telegram 告警,
So that 没有顾客的钱被悄悄遗漏。

**Acceptance Criteria:**

**Given** 付错金额、迟到付款、无匹配订单或重复付款的转账
**When** `reconcile()` 无法匹配
**Then** 在 `fbs_refund` 写入对应类型的工单，含交易哈希、金额、到账时间，并向运营者发 Telegram 告警

**Given** 工单超过 48 小时未处理
**When** 定时任务运行
**Then** 再次告警

### Story 2.5: 超时、宽限期与重启恢复

As a 运营者,
I want 超时订单和尾数宽限期在重启后仍然正确,
So that 重启不会让订单永不过期或尾数被永久占用。

**Acceptance Criteria:**

**Given** 15 分钟倒计时结束
**When** 订单超时
**Then** 订单变为 state 6，尾数继续保持 30 分钟后才释放

**Given** 超时后 30 分钟内到账的转账
**When** 对账
**Then** 进入迟到付款异常，不会匹配到新订单

**Given** 服务重启
**When** 启动
**Then** 扫描待支付订单并按保存的到期时间重建超时任务

## Epic 3: 顾客下单

让顾客在 Telegram 里登录、浏览菜单、下单并看到付款与订单状态。

### Story 3.1: Telegram 登录与会员映射

As a 顾客,
I want 打开 Mini App 就自动登录,
So that 不需要注册账号。

**Acceptance Criteria:**

**Given** 有效的 `initData`
**When** 调用登录接口
**Then** 返回短期会话令牌，网关创建或查找火鸟会员并由 Node 写入 `fbs_member_map`

**Given** 签名错误或 `auth_date` 超过 1 小时
**When** 调用登录接口
**Then** 返回 401

### Story 3.2: Mini App 外壳与菜单浏览

As a 顾客,
I want 在 Mini App 里浏览商家和菜单并切换中文与英文,
So that 我能看懂并选择想吃的东西。

**Acceptance Criteria:**

**Given** 商家和菜品数据在火鸟中
**When** 打开菜单页
**Then** 菜单由 Node 提供，默认语言取自 Telegram 语言设置，缺省为英文，缺失语言回退到英文

**Given** 切换语言
**When** 点击语言选项
**Then** 菜品名与描述立即显示对应语言

### Story 3.3: 下单

As a 顾客,
I want 选择菜品、填写地址并下单,
So that 订单进入待支付状态。

**Acceptance Criteria:**

**Given** 非空购物车、有效数量、非空地址
**When** 提交订单
**Then** 经网关调用 `deal()` 创建订单，订单行保存价格与名称快照，状态为 state 0

**Given** 同一幂等键重复提交
**When** 再次调用
**Then** 返回同一订单，不创建第二张

**Given** 空购物车、数量为 0 或负数、地址为空或跨多家商家
**When** 提交
**Then** 被拒绝并提示原因

### Story 3.4: 付款页、订单状态与通知

As a 顾客,
I want 看到付款页、订单状态并收到 Telegram 通知,
So that 我知道订单进展。

**Acceptance Criteria:**

**Given** 待支付订单
**When** 打开付款页
**Then** 显示比索金额、USDT 应付金额、收款地址二维码、倒计时，并标注"仅限 TRC-20"

**Given** 订单状态变化
**When** 状态转移完成
**Then** 向顾客发送 Telegram 通知，发送失败时重试并记录日志

**Given** 页面倒计时刚结束而链上刚到账
**When** 页面刷新
**Then** 以服务端状态为准显示

## Epic 4: 商家接单、退款与授权

让商家能处理订单，退款有规则可循，所有操作按角色授权并可审计。

### Story 4.1: 角色与对象级授权

As a 运营者,
I want 顾客、商家、运营者三种角色各自只能做自己的事,
So that 没有人能越权读取或修改别人的订单。

**Acceptance Criteria:**

**Given** 顾客访问他人订单 ID
**When** 请求
**Then** 返回 404

**Given** 商家只绑定了自己的店铺
**When** 操作其他店铺的订单
**Then** 被拒绝

**Given** 运营者操作（异常队列、退款回写、开关）
**When** 请求
**Then** 仅配置的运营者 Telegram ID 白名单可执行，并写入 `fbs_audit`

### Story 4.2: 状态转移网关

As a 运营者,
I want 所有订单状态变更都经统一的 `transition()`,
So that 状态机规则只有一处。

**Acceptance Criteria:**

**Given** FR-24 的状态转移表
**When** 请求表外转移
**Then** 返回 409 并记录日志

**Given** 合法转移
**When** 执行
**Then** 使用条件更新，并写入 `fbs_audit`（时间、操作者、原因）

**Given** 商家后台原生按钮绕开该网关
**When** 发现此情形
**Then** 在 `docs/internal/patches/` 登记并改为钩子或关闭

### Story 4.3: 商家接单与配送

As a 商家,
I want 在商家后台接单、开始配送、标记完成,
So that 顾客知道餐什么时候到。

**Acceptance Criteria:**

**Given** 已付款待接单的订单
**When** 商家接单
**Then** 状态变为备餐中，商家和顾客收到 Telegram 通知

**Given** 商家拒单
**When** 提交拒单原因
**Then** 订单取消为 state 6，并创建 `fbs_refund` 待退款工单

**Given** 配送中的订单
**When** 同一商家标记送达
**Then** 状态变为已完成

### Story 4.4: 接单超时自动处理

As a 顾客,
I want 商家一直不接单时订单自动退款,
So that 我的钱不会被无限期占住。

**Acceptance Criteria:**

**Given** 订单处于已付款待接单
**When** 10 分钟无响应
**Then** 再通知商家并提醒运营者

**Given** 20 分钟仍无响应
**When** 定时任务运行
**Then** 订单取消并创建待退款工单，顾客收到通知（两个时限后端可配）

**Given** 商家接单与系统超时同时发生
**When** 并发写入
**Then** 先写入者生效，另一方收到明确失败

### Story 4.5: 退款工单与运营者回写

As a 运营者,
I want 管理待退款工单并回写退款交易哈希,
So that 每一笔退款都有记录。

**Acceptance Criteria:**

**Given** 待退款工单
**When** 运营者手工链上退款并回写交易哈希
**Then** 工单变为已退款，订单页向顾客显示哈希

**Given** 退款金额
**When** 计算
**Then** 等于实收 USDT 扣除链上手续费（由顾客承担），少付的转账原路退回

**Given** 付款来源是交易所充值地址
**When** 处理退款
**Then** 须先与顾客确认收款地址才可置为已退款

### Story 4.6: 收款地址与密钥保护

As a 运营者,
I want 收款地址变更必须经运营者操作并告警,
So that 资金不会被悄悄改道。

**Acceptance Criteria:**

**Given** 收款地址配置被修改
**When** 服务读取到变化
**Then** 向运营者发送 Telegram 告警，并在 `fbs_audit` 记录前后地址

**Given** 仓库、前端、镜像
**When** 门禁扫描
**Then** 不包含私钥或可转移资金的密钥

## Epic 5: AI 菜单照片上架

商家发一张菜单照片，AI 起草三语菜单，商家逐条确认价格后上架。

### Story 5.1: 商家绑定与照片接收

As a 商家,
I want 向后台机器人发送菜单照片,
So that 开始上架流程。

**Acceptance Criteria:**

**Given** 已由运营者绑定的商家
**When** 发送菜单照片
**Then** 照片被接收并创建一个待处理任务

**Given** 陌生用户发送照片或非图片、过大文件
**When** 机器人收到
**Then** 陌生用户被忽略并计数，其余情形回复明确提示

### Story 5.2: AI 识别与待确认清单

As a 商家,
I want AI 从照片生成菜品清单,
So that 我不用手工录入。

**Acceptance Criteria:**

**Given** 一张清晰的菜单照片
**When** AI 处理
**Then** 在 `fbs_draft_item` 写入每条菜品的价格、分类、配图和中文名称，识别不确定的字段被标记

**Given** AI 调用失败或返回非法结果
**When** 处理
**Then** 通知商家并可重试，不写入半成品

**Given** 价格为 0、负数或带非比索货币符号
**When** 写入
**Then** 该条被标记为待人工处理

**Given** 重复提交同一张照片或多张照片中的重复菜品
**When** 处理
**Then** 合并，不产生重复条目

### Story 5.3: 逐条价格确认与上架

As a 商家,
I want 逐条核对价格后上架,
So that 不会因为 AI 识别错误而卖错价。

**Acceptance Criteria:**

**Given** 待确认清单
**When** 商家确认某一条
**Then** 记录确认人和时间；没有"全部确认"

**Given** 被标记为不确定的字段
**When** 未编辑也未显式确认
**Then** 该条不能提交

**Given** 已确认的条目
**When** 提交上架
**Then** 依序通过网关创建菜品并取得 id，再在同一事务内写入 `fbs_i18n`，未确认的条目不出现在顾客菜单

### Story 5.4: 三语翻译与编辑保护

As a 商家,
I want 菜名和描述自动生成中、英、菲律宾语,
So that 顾客能用自己的语言浏览。

**Acceptance Criteria:**

**Given** 一条确认的菜品
**When** 生成翻译
**Then** 英文与菲律宾语写入 `fbs_i18n`，`source=ai`，标注为"AI 翻译"

**Given** 商家手工修改了某种语言
**When** 之后重新翻译
**Then** `edited=1` 的条目不被覆盖

## Epic 6: v1.1 扩展

v1-α 与 v1 跑通后再启动，逐项细化，此处只列范围。

### Story 6.1: 上架后修改菜品

As a 商家,
I want 修改已上架菜品并在改价时重新确认,
So that 价格变化可控。

**Acceptance Criteria:**

**Given** 已上架菜品被改价
**When** 提交
**Then** 须重新确认，已存在的订单仍使用下单时的价格快照

### Story 6.2: USDT 兑换比索（默认关闭）

As a 商家,
I want 提交兑换单并按 Coins.ph 买卖价之间的价格兑换,
So that 我能把收到的 USDT 换成比索。

**Acceptance Criteria:**

**Given** 兑换开关默认关闭
**When** 商家访问兑换入口
**Then** 入口不显示，接口拒绝请求

**Given** 开关开启、报价有效、额度未超
**When** 运营者批准并双方确认交付
**Then** 兑换单完成并写入追加式记录

### Story 6.3: AI 新闻同步到门户

As a 运营者,
I want AI 新闻自动采集并发布到门户,
So that 站点有持续的内容。

**Acceptance Criteria:**

**Given** 已有的新闻工作流（TASK-016）
**When** 在真实环境运行一轮
**Then** 去重后发布，失败重试，失败告警发给运营者
