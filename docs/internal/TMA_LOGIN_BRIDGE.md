# TMA 登录桥接（Epic T2，方案 P）

依据：`_bmad-output/planning-artifacts/epics-tma-frontend.md` T2.1–T2.4；Spike 结论见 briefs/brief-tma-frontend-2026-10-12/spike-report.md（P 已在 canary 证实）。

## 流程
TMA → `POST /tg-api/auth/telegram {initData}` → Node 验签 → 限频/防重放 → 网关（`webroot/api/fbs/index.php`）按 `tg_<id>` 查找或创建火鸟会员 → Node 写 `fbs_member_map` → 签发短期令牌。浏览器不接触火鸟 Cookie。

## 接口
| 路径 | 说明 |
|---|---|
| `POST /tg-api/auth/telegram` | 体 `{initData}`；成功 `{success, data:{token, expiresAt, memberId}}`；401 验签失败/过期；429 限频或同一 initData 重放超限；503 未配置 |
| `POST /tg-api/auth/logout` | 头 `Authorization: Bearer <token>`；吊销令牌 |

错误体：`{success:false, error:{code, message}}`。

## 验签规则（T2.1）
- HMAC-SHA256，常量时间比较；`auth_date` 超过 1 小时拒绝，未来超过 60 秒拒绝；必须有 `user.id`。
- **`signature` 字段参与 HMAC 数据串，不得剔除**（官方规范：HMAC 仅排除 `hash`；Ed25519 第三方验签才排除 hash 与 signature）。此处更正了 brief 安全要点第 1 条中"剥离 signature"的表述，该表述会令真实登录失败。

## 令牌（T2.2）
- 格式 `base64url(payload).base64url(HMAC-SHA256)`；payload：`sub`(tg_id)、`mid`(会员 id)、`env`、`iat`、`exp`、`jti`。
- 默认 TTL 900 秒（`TMA_TOKEN_TTL`）；`env` 与服务的 `TMA_ENV` 不一致即拒绝（canary 令牌不能用于 prod）。
- 吊销、initData 重放计数、幂等占位保存在共享库（迁移 002：`fbs_token_revoked`、`fbs_replay`、`fbs_idem`），api 可多副本运行（Arvin 决定 3=B）。吊销在其他副本最长约 5 秒后生效（本地集合定时刷新）；登录与代理的普通限频仍为每副本独立计数（有效上限约为配置值 × 副本数）。

## 环境变量（新增，仅服务端）
| 变量 | 服务 | 说明 |
|---|---|---|
| `TMA_TOKEN_SECRET` | api | 令牌签名密钥，≥16 字符 |
| `TMA_ENV` | api | `canary` 或 `prod` |
| `TMA_TOKEN_TTL` | api | 可选，秒 |
| `TMA_LOGIN_MAX` / `TMA_REPLAY_MAX` | api | 可选，登录限频（每 tg_id 每分钟）/ 同一 initData 每小时次数 |
| `FBS_GATEWAY_URL` | api | 例：`http://firebird-<site>/api/fbs/index.php`（集群内 ClusterIP） |
| `FBS_GATEWAY_SECRET` | api、php | 网关 HMAC 密钥，两侧一致，≥16 字符 |
| `DB_HOST` `DB_PORT` `DB_NAME` `DB_USER` `DB_PASSWORD` | api | 映射与审计写库（经 mariadb 命令行客户端，与 `migrate.js` 相同） |

任一必需变量缺失时 `/auth/telegram` 返回 503，不影响其他路由。

## 网关（T2.3）
`POST /api/fbs/index.php?action=member_find_or_create`，头 `X-Fbs-Timestamp`、`X-Fbs-Signature`（见 GATEWAY_SPIKE.md）。先验签（时间偏差 ≤60 秒、`hash_equals`）再加载火鸟；幂等：`username = tg_<id>`；昵称固定 `TG_<id>`，不信任外部文本；会员 `regfrom='telegram'`；随机密码不外泄。外部访问 `/api/fbs` 由 Traefik 返回 403（AD-19）。

## 数据
`fbs_member_map(tg_user_id PK, member_id UNIQUE)`（已有迁移 001）；审计写 `fbs_audit`：`login`、`member_create`、`member_map`、`login_rate_limited`、`login_replay_limited`。

## 未包含（待排期）
- Helm 对上述环境变量与密钥的注入、api 镜像内 mariadb 客户端、PHP 容器的 `FBS_GATEWAY_SECRET`：涉及密钥与部署，需 Arvin 确认后再改。
- T2.4 前端登录流：随 apps/tma 脚手架（T4.1）落地，契约见 `apps/tma/src/auth.js`。

## 白名单代理（T3.1 / T3.3）
`/tg-api/fb/:service/:action`（GET/POST）→ 上游 `FB_UPSTREAM_URL`（`.../include/ajax.php`）。
- 默认拒绝：`service:action` 不在 `src/fbProxy.js` 的 `WHITELIST` 返回 403。首轮仅 7 个匿名只读接口：`waimai` 的 `shopList`/`storeDetail`/`food`/`foodType`，`article` 的 `type`/`alist`/`detail`。`orderDetail`、`deal` 等涉订单/资金路径的接口须单独评审后再加入。
- 剥离：`userkey`、`access_token`、`refresh_token`、`token`、`forcelogout`、`rsaEncrypt`、`uid`/`userid`、`platform_*`、`HN_*` 等客户端参数；不转发客户端 Cookie；代理固定写入 `platform_name=tma`。
- 限流：`FB_RATE_MAX`（默认每分钟 120，按会员或来源 IP + 接口）。
- 幂等：白名单项标记 `idempotent` 时要求 `Idempotency-Key`（8–64 位 `[A-Za-z0-9_-]`）；先占位再转发，同键并发返回 409，成功后同键回放首次结果（TTL 600 秒，共享库）。
- member 级接口的会话凭证由 PHP 网关 `issue_session` 在火鸟进程内生成（仅限 `regfrom='telegram'` 且 `username=tg_<数字>` 的会员，窗口 15 秒），Node 只在内存缓存 ≤120 秒，不落盘、不写日志；火鸟凭证本身不带过期时间，随会员密码哈希失效。
| 变量 | 说明 |
|---|---|
| `FB_UPSTREAM_URL` | 上游 ajax.php 完整 URL；未设置则不挂载代理路由 |
| `FB_RATE_MAX` | 可选，每分钟请求上限 |

## 运行参数补充（评审后）
| 变量 | 说明 |
|---|---|
| `TRUST_PROXY_HOPS` | 置于 Traefik 后时设为 1，使 `req.ip` 取真实客户端地址，否则匿名限流退化为全局单桶 |
| `CORS_ORIGINS` | 逗号分隔的允许来源（如 `https://canary.fbird.men`）；未设置保持原行为 |
| `FBS_GATEWAY_TIMEOUT_MS` | 网关调用超时，默认 8000；代理上游超时同为 8 秒 |

- 幂等缓存只保存火鸟 `state=100` 的成功响应；失败可用同一 `Idempotency-Key` 重试。
- `idempotent` 白名单项必须是 `auth: member`，否则代理构造时即报错。
- 限流与重放事件的审计按 tg_id 每分钟最多记录一次。


## 代理输入加固（独立评审后）
- **JSON 容器值与数组一律拒收**：上游 `ajax.php` 对「含 `[{`」「可被 json_decode 为数组」的字符串以及数组值跳过 `addslashes`，若落进 SQL 即可注入。代理对所有透传参数丢弃此类值；确需 JSON 的 `order_content` 由专用校验重新序列化。
- **`waimai:deal` 参数校验**（不合规返回 400，且不占用幂等键）：
  - `order_content` 仅接受 `[{id, count, ntitle?}]`，`id` 为 1–10 位正整数，`count` 为 1–99 整数，`ntitle` 仅限字母/数字/空格/`,.-_()/`、≤100 字符；其余键丢弃。上游对 `id` 未转义、对 `count` 未校验，故必须在代理层拦截（防 SQL 注入与负数量改价）。
  - `preset` 只能是字面 `[]`；`shop`、`address` 为正整数；`paytype`/`peitype`/`phone`/`desk`/`lng`/`lat`/`selftime`/`orderTime` 有格式限制。
- **归属预检**：火鸟对成功结果统一包装为 `{state:100, info:<行>}`，预检以 `state===100` 且 `info` 为对象为通过。
- **幂等写接口遇网络超时**：结果未知（订单可能已写入），不释放占位，返回 504；同一 `Idempotency-Key` 重试得到 409，避免重复下单，至 TTL（600 秒）后释放。上游返回业务失败（state≠100）则释放占位，可同键重试。
- **写接口独立限流**：`FB_WRITE_RATE_MAX`（默认每会员每分钟 20）覆盖 `deal`、`cancelOrder`、`operAddress`、`delAddress`；读接口仍用 `FB_RATE_MAX`。

## TMA 前端与静态托管（Epic T4 / T3.4）
- 工程：`apps/tma`（Vite + Vue 3 + TS + vue-router(hash) + Pinia + `@telegram-apps/sdk` + Vant 4）。`npm run build` 产物在 `dist/`，`base` 为 `/tma/`。
- 托管：`deploy/docker/Dockerfile.api` 增加 `tma-build` 阶段，产物复制到镜像 `/app/tma`；`TMA_STATIC_DIR` 指向该目录时，api 在 `/tma/` 提供静态资源，并设置 CSP（脚本仅限自身与 telegram.org、仅允许被 Telegram 内嵌、连接仅限同源）、`nosniff`、`no-referrer`。
- 路由：Traefik 需把 `/tma` 指向 api 服务（与 `/tg-api` 同级，优先级高于 PHP）；由 Helm 的 `tma.enabled` 打开（#95，默认关闭，canary 启用见独立 PR）。
- 开发：`npm run dev` 时 `/tg-api` 代理到 `TMA_DEV_API`（默认 `http://localhost:3000`），同源无 CORS。
- 页面（当前）：商家列表（`waimai/shopList`）、菜单（`foodType`、`food`）、购物车（跨商家需确认）。下单、地址、订单见下节。

## 下单、地址与订单页面（Epic T4.4–T4.6）
- **下单（货到付款）**：`Checkout` 页选择配送地址后提交 `waimai/deal`。前端只提交 `shop`、`address`、`order_content`（仅 `[{id,count}]`）、`preset`（固定 `[]`）、`peitype`、`note`；**不提交任何金额、优惠、积分字段**，价格由火鸟按数据库重算。同一次下单尝试复用同一个 `Idempotency-Key`，网络重试不会产生第二张订单；超时（504）表示结果未知，提示用户到订单列表确认，不要重复提交。
- **地址管理**：`Addresses` 页经 `getMemberAddress` / `operAddress` / `delAddress` 增删改；编辑和删除由代理做归属预检（读不到即 404）。
- **订单**：`Orders` 页（`waimai/order`）列表与取消，`OrderDetail` 页（`waimai/orderDetail`）详情；可取消状态为火鸟 state 0 与 2（`cancelOrder` 现有规则）。归属失败统一表现为「订单不存在或无权查看」。
- **校验**：`apps/tma/src/lib/checkout.js` 提供下单参数构造与地址校验，测试在 `apps/tma/test/checkout.test.mjs`。
- **晋升门槛**：canary 真机走通 下单 → 取消 → 地址增删改 后才允许提晋升 PR。

## 入口桥（TAPD 0002，2026-10-29）

「第五端 = 火鸟 H5 站内」的 TG 入口：Telegram 内打开落地页 → 表单 POST → 拿到火鸟 Cookie 后 302 进 H5。与方案 P 的关系：SPA（`/tma`）的 Bearer 路径**保持不动**，本桥只服务火鸟 H5 站内页；「浏览器不接触火鸟 Cookie」的结论不适用于本端——H5 本就靠 `HN_login_user` Cookie 判定登录态（见上文「火鸟校验路径」事实：PHP 与站点 JS 均读写该 Cookie），桥正是把该 Cookie 安全送达 H5 的唯一入口。

### 路由契约
| 路径 | 说明 |
|---|---|
| `GET /tg-api/auth/bridge` | 落地页（api 进程内联 HTML，无静态目录）。加载 `https://telegram.org/js/telegram-web-app.js`，取 `window.Telegram.WebApp.initData` 后以**真实表单 POST**（非 fetch，导航式提交才会跟随 302 + Set-Cookie）提交到桥端点，字段 `initData`（另带隐藏字段 `to`，来源为 query `to`）。无 initData（非 TG 环境）显示「请从 Telegram 内打开」，不提交。响应自带 CSP（`/tg-api` 无全局 CSP 中间件）：`script-src 'self' https://telegram.org 'nonce-…'`（内联脚本用一次性 nonce）、`frame-ancestors https://web.telegram.org https://*.telegram.org`，否则 TG 内嵌白屏。 |
| `POST /tg-api/auth/bridge` | 桥端点，`application/x-www-form-urlencoded`，字段 `initData`、`to`（可选）。**先过来源闸门（登录 CSRF 防护，三级判定）**：① `Origin` 存在 → 必须属于本站集合（由 `TMA_BRIDGE_COOKIE_DOMAIN` 根域 + www 与请求 Host 推导；Host 仅在其为本域/子域时收录）；② `Origin` 缺失且 `Sec-Fetch-Site` 存在 → `cross-site` 拒、其余放行；③ 两者都缺失（iOS ≤16.3 的 TG WebView 同源 form POST 可能不发 Origin，且无 Sec-Fetch-Site）→ **Referer 兜底**：Referer 的 host 属本站集合则放行，否则 403。Referer 兜底不削弱 B-1：攻击者可抹 Referer 但抹不掉 Origin（跨源 POST 在所有现代浏览器必带 Origin，会被 ①先拦）。所有拒绝分支 403 `CROSS_SITE_BLOCKED`（无 Set-Cookie、无 302）并记结构化日志 `bridge_blocked`（reason 枚举 + host + 来源头存在性，不含 initData/凭证）。通过后流程严格为：验签+限频+防重放+会员查建+审计（复用 `loginService.login`，不重写）→ `credentialProvider(memberId)` 走网关 `issue_session` 换凭证（火鸟进程内签发，如 `HN_login_user=<base64>`）→ `302` + `Set-Cookie`。loginService 非 200（401/429）按原状态码回 HTML 错误页（含 `{code,message}` 文案），**不 302、不下发 Cookie**；网关/凭证异常 502。响应均带 `Cache-Control: no-store`、`Referrer-Policy: no-referrer`、`X-Content-Type-Options: nosniff`。503 页只回通用「服务暂未配置」文案，缺失项清单只进启动日志（不向公网暴露环境变量名）。`TMA_BRIDGE_FORCE_SECURE=false` 且 `TMA_ENV=prod` 时启动打 WARN（行为不变）。凭证值不进日志、错误信息或 HTML；不返回 Node 自签 token（loginService 的 token 字段丢弃，不调 `tokens.issue`）。 |

### Cookie 属性与理由
`Set-Cookie: <name>=<value>; Path=/; Domain=<TMA_BRIDGE_COOKIE_DOMAIN>; Max-Age=<86400 默认>; SameSite=Lax[; Secure]`
- **Name/Value**：以网关 `issue_session` 返回为准（`HN_login_user=<base64>`），Node 不重签、不改写；写入前正则兜底防头注入。
- **HttpOnly 不设**：火鸟原生 `PutCookie` 对 `login_user` 即非 HttpOnly，H5 多处 JS 需要读该 Cookie；设了会让「已登录」页面被 JS 判为未登录，不额外「加固」。
- **SameSite=Lax**：TG WebView 内打开 H5 属第三方上下文，但 302 之后的顶级导航会携带 Lax Cookie，覆盖「打开即登录、刷新不掉」的验收路径。
- **Secure**：默认由 `TMA_BRIDGE_FORCE_SECURE`（默认 true）**强制追加**，不依赖代理链路配置正确（评审 M-1：无 HttpOnly 的长会话凭证不允许静默裸奔）；仅显式 `TMA_BRIDGE_FORCE_SECURE=false`（本地 http 调试）才按 `req.secure` 判定（配置 `TRUST_PROXY_HOPS` 后取 `X-Forwarded-Proto`）。
- **Max-Age 默认 86400**：保证刷新不掉登录；H5 站内 JS 对该 Cookie 本就长期读写。**需与火鸟后台 `$cfg_onlinetime`（小时）×3600 对齐**：桥长于火鸟会话时，H5 JS 判「已登录」而 PHP 侧已失效（接口 401）；部署前核对后台配置并设 `TMA_BRIDGE_COOKIE_MAX_AGE`（KNOWN_ISSUES）。

### 目标页白名单（防开放重定向）
`Location` 只允许站内相对路径：必须以单个 `/` 开头、不得以 `//` 或 `/\` 开头、不得含 `\`、不得含协议（`://`）或 `@`、不得含控制字符、长度 ≤ 200；目标来自表单/查询字段 `to`，任一规则不命中或未提供时回落 `TMA_BRIDGE_TARGET_DEFAULT`（默认 `/`）。拒绝 302 外域。

### 新增环境变量（服务端）
| 变量 | 必填 | 说明 |
|---|---|---|
| `TMA_BRIDGE_COOKIE_DOMAIN` | 是 | Set-Cookie 的 Domain，须等于火鸟后台 `$cfg_cookieDomain`（如 `fbird.men`）；同时是来源闸门的允许域（根域 + www + 请求 Host） |
| `TMA_BRIDGE_COOKIE_MAX_AGE` | 否 | Cookie Max-Age 秒数，默认 86400；**需与火鸟 `$cfg_onlinetime`×3600 对齐** |
| `TMA_BRIDGE_FORCE_SECURE` | 否 | 默认 true 强制 Set-Cookie 带 Secure；显式 `false` 仅供本地 http 调试按 `req.secure` 判定 |
| `TMA_BRIDGE_TARGET_DEFAULT` | 否 | 白名单校验失败/未提供时的回落目标，默认 `/` |

`BOT_TOKEN`、`FBS_GATEWAY_*`、`TMA_BRIDGE_COOKIE_DOMAIN` 任一缺失（或 Domain 格式非法）时，两个端点均返回 503（`BRIDGE_NOT_CONFIGURED`，页面只显示通用「服务暂未配置」文案，缺失清单进启动日志），不崩进程、不影响其他路由。

### 遗留项（KNOWN_ISSUES）
- **`TMA_BRIDGE_COOKIE_MAX_AGE` 需与火鸟后台 `$cfg_onlinetime`（小时）×3600 对齐**：当前默认 86400（24h）是假设值，canary 前须读取后台实际 `$cfg_onlinetime` 后显式设置；不做自动读取（需改火鸟代码，超出本任务范围）。桥长于会话时长会造成「JS 判已登录、PHP 接口 401」的错位。
- **来源闸门依赖浏览器发送 `Origin` / `Sec-Fetch-Site` 头**：已加第三级 Referer 兜底（iOS ≤16.3 老 WebView 不再永久 403）；仅当 Origin、Sec-Fetch-Site、Referer 三者全缺时仍 fail-closed 403。灰度期以 `bridge_blocked` 结构化日志（reason 枚举）观察 403 率，真机矩阵需覆盖 iOS 15/16.3/16.4+/Android/Desktop/TG Web。
- **Helm 已注入（2026-10-29 补齐）**：`deploy/helm/firebird-site/templates/deployment-api.yaml` 在 `tma.enabled=true` 时注入上述四个变量，取值来自 `values.yaml → tma.bridge`（`cookieDomain` 留空时回落 `ingress.hosts[0]`）。`values-canary.yaml` 显式设 `cookieDomain: fbird.men`（父域，canary/www 共用一份会话）、`forceSecure: true`；`values-manila/cebu` 未启用 tma，不注入。prod 晋升时须单独确认 `cookieDomain` 与 `$cfg_cookieDomain` 一致。
- 火鸟 `PutCookie` 会额外种一份 `www.<domain>` 域的 Cookie（双域名兼容），桥只种一份根域 Cookie，理论上已覆盖 www 子域；canary 实测时留意。
- `issue_session` 时间窗 15 秒，依赖 k8s 节点时钟同步（部署前提）。
- `credentialProvider` 有 ≤120s 内存缓存：同一会员多设备/多次登录共享同一会话值，「踢下线」语义减弱（评审 i-4，可接受）。
