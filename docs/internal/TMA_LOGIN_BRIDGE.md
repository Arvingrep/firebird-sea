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
