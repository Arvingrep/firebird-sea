---
title: Telegram Mini App 前端 产品简报
status: final
created: 2026-10-12
updated: 2026-10-12
relates_to: ../brief-firebird-sea-2026-10-10/brief.md
companion: ./architect-reply.md
priority: highest
---

# 产品简报：Telegram Mini App 前端（新 Epic，最高优先级）

> 独立新 Epic，不覆盖 2026-10-10 的 brief / PRD / architecture / epics。架构细节见同目录 `architect-reply.md`。

## 目标

为 firebird-sea 新增 Telegram Mini App（`apps/tma`）顾客端，补齐「外卖」与「资讯」；对接火鸟原生 API，安全机制为强制要求；USDT 支付后置。

## 范围（仅顾客端）

1. **外卖**：商家列表、菜单浏览、购物车、下单（货到付款）、地址管理、订单列表与详情、取消订单。
2. **资讯**：分类、列表、详情，只读。

## Constraints（硬性约束）

1. 复用现有后端 API，不新建后端，不改其他前端的逻辑。
2. 登录走 Telegram 账号体系（`initData` 校验），并与现有用户体系做映射打通。
3. UI 基于 Telegram WebApp SDK 开发，适配 Telegram 内嵌浏览器环境。
4. 其他前端（PC / 微信小程序 / App）只作为背景参考，明确写入 Out of Scope；H5 保留不动。
5. 接口对齐火鸟原生 API 与其规范，不另立一套。
6. 安全机制为强制要求（见下节）。
7. 火鸟核心代码不改（沿用 AD-14）；登录桥接按方案 P 实现。

## 已确认的决策

| 议题 | 决策 |
|---|---|
| 登录桥接 | 方案 P：`services/api` 验签 `initData`、签发短期可吊销令牌；火鸟身份由网关（`webroot/api/fbs/`）进程内创建或查找；映射存 `fbs_member_map`。方案 Q（火鸟加 `tgkey` 分支）仅在 Spike 书面证明 P 不可行且 Arvin 书面批准后启用。 |
| 令牌与 Cookie | 浏览器只用令牌（`Authorization` 头，存内存，过期用 `initData` 重换），不下发火鸟 Cookie。 |
| 部署 | 与火鸟同域：静态 `/tma/`，接口经 `/tg-api/fb/*` 白名单代理转发 `ajax.php`。 |
| 框架 | Vite + Vue 3 + TypeScript + Vue Router（hash）+ Pinia + `@telegram-apps/sdk` + Vant 4；不用 uni-app。 |
| 账号认领 | 首期不开放（Telegram 用户一律新建会员），后期再定。 |
| 订单收尾 | 货到付款。 |
| Bot | canary 与 prod 共用 `TELEGRAM_BOT_USERNAME=@fbird_men_bot`；令牌签发时写入 `env` 声明并校验，防跨环境互用；`services/tg-bot` 不得用该 Token 做 `getUpdates`（409）；Token 轮换需同时更新两处 `firebird-api-secret`。 |
| 环境路径 | canary 先行：`https://canary.fbird.men/tma/`；prod 后上：`https://manila.fbird.men/tma/`；接口 `/tg-api/fb/*` 同域。Spike 在 canary 做。 |
| 界面语言 | 中文 + 英文，默认中文。（默认，Arvin 可改） |
| 上线节奏 | canary 验收通过后晋升 prod，不设固定日期。（默认，Arvin 可改） |
| 成功标准 | 外卖主链路（浏览→下单货到付款→订单详情→取消）与资讯只读在 canary 真机 Telegram 走通，且安全要点门槛全部通过。（默认，Arvin 可改） |

## 安全要点（强制 NFR，8 条）

1. **身份**：服务端 HMAC 常量时间验签 `initData`；`auth_date` ≤ 1 小时（现 `telegramAuth.js` 为 24h，需收紧）；忽略 `initDataUnsafe`，只认 HMAC `hash`（更正：官方规范下 `signature` 字段仍参与 HMAC 数据串，不可剔除；见 docs/internal/TMA_LOGIN_BRIDGE.md）。
2. **会话**：令牌短期、可吊销、绑定 Telegram ID 与环境；登录限频、`initData` 哈希限次防重放。
3. **代理**：`service+action` 默认拒绝白名单；剥离客户端传入的 Cookie、`userkey`、`access_token`、`platform_*`；写接口限流；`deal` 要求 `Idempotency-Key`。
4. **越权（发布门槛）**：`orderDetail`、`cancelOrder`、`operAddress`、`delAddress`、`getMemberAddress` 逐个核实 handler 按会员校验归属（IDOR）。
5. **凭证**：服务端注入的火鸟凭证即时生成或短 TTL 缓存，不落盘明文、不下发浏览器。
6. **输入**：`start_param` 当不可信输入，白名单格式（如 `shop_<id>`）；文本禁用 `v-html`；外链走 `Telegram.WebApp.openLink`。
7. **传输与密钥**：全站 HTTPS、CSP；Bot Token 与签名密钥只放服务端环境变量。
8. **审计**：登录、映射、下单、取消写审计日志；申请 Bot 官方认证，页面不索取密码类信息。

## 前置 Spike（canary，3 项）

1. 网关能否不改核心、仅凭数据库可查数据构造出 `getMemberID()` 认可的会话凭证（P 与 Q 的分水岭）。
2. `createApiToken`、`$platform_userid` 旁路来源确认（仓库内无定义），确认前代理一律剥离。
3. 第 4 条安全要点所列五个接口的 IDOR 核查。

## Out of Scope

- 微信小程序、PC 站、原生 App 的任何修改；H5 不改动。
- 新建后端服务或新增后端业务能力（仅可复用现有 API，加薄代理与网关扩展点）。
- USDT 支付、商家端、骑手端、AI 上架、兑换、评论收藏、账号认领。

## 对旧架构的修订（补充，不覆盖原文）

- AD-1、AD-8、AD-14、AD-19 保持；AD-9 增加 `/tg-api/fb/*` 与 `/tma/` 路径。
- AD-3 拆为两条通道：Node 到网关（原有）、TMA 经白名单代理到 `ajax.php`（有限例外）。
- 新增 AD-20：TMA 到火鸟的接口访问边界。
- PRD FR-1 到 FR-4、Epic 3 与本 Epic 重叠，Story 3.4（付款页）移到后期。

## 唯一待办（须 Arvin 提供）

1. Mini App 入口已定（Arvin 提供，待 BotFather 创建成功回执确认）：prod 为 `t.me/fbird_men_bot/fbird`，指向 `manila.fbird.men/tma/`；canary 为 `t.me/fbird_men_bot/fbirdcanary`，指向 `canary.fbird.men/tma/`。区分方式为不同短名。BotFather 里登记的 Web App URL 须带 `/tma/` 路径。
2. 确认 Bot 的 Mini App 授权域名可覆盖 `canary.fbird.men` 与 `manila.fbird.men` 两个子域。

## 后期：安全专项（明确列入，Arvin 决定）

- 开发与测试阶段允许读取 `.env` 等环境配置来核对事实，不为此设置额外限制。
- 安全专项作为后期单独工作：包括 RenrenCrypt 硬编码密钥的技术债登记与处理、article `orderDetail` 与 waimai `orderDetail` 骑手路径的加固、火鸟旁路符号（`createApiToken`、`$platform_userid`）溯源、整体渗透与密钥轮换。
- 本 Epic 现阶段只保留必要的代理白名单与身份剥离，不做超出范围的安全加固。
