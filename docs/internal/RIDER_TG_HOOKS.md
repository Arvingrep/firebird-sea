# 骑手 Telegram 通知 · PHP 侧挂点与网关动作

> 生效日期：2026-11-06（修复轮 3 · 移植轮更新：网关并入 canary 注册表框架、响应包络
> `{success,data}` / `{success:false,error:{code,message}}`、动作路由 body.action、
> N3 at-most-once、N4 审计/计数 fail-closed、N5 ip 维度限频、N6 error 结果码）
> 对应实现：`webroot/api/fbs/index.php`（网关动作）、`webroot/include/common.func.php`（`fb_tg_dispatch`）、
> `webroot/admin/waimai/waimaiOrder.php` 与 `webroot/api/handlers/waimai.class.php`（派单挂点）
> Node 侧配套端点见 `services/api`（分支 `feat/tma-rider-api`、`feat/tma-rider-dispatch`，先合入）。

## 一、为什么 PHP 不直接发 Telegram

PHP 容器**不注入** `TELEGRAM_BOT_TOKEN`（密钥面收敛到 Node）。派单类动作经集群内 HTTP 转交
Node 的 `POST /tg-api/internal/dispatch`，由 Node 查 `fbs_courier_map` 得 tg_user_id 后发消息。
通知失败只记日志、返回 false，**绝不影响派单事务本身**。

## 二、网关动作（canary 注册表框架：POST /api/fbs/index.php，JSON 体 `{"action","params"}`，
HMAC 头 X-Fbs-Timestamp / X-Fbs-Signature；也兼容 `?action=` 与 PATH_INFO 形态）

响应包络（canary 新契约，与 gatewayClient.js 对齐）：
成功 200 `{"success":true,"data":{...}}`；业务失败**非 2xx** `{"success":false,"error":{"code","message"}}`，
Node 侧 gatewayClient 统一 reject（`GATEWAY_HTTP_ERROR` + `err.status` + `err.payload.error.code`），
由 `riderRoute.js` 还原成差异化文案。三个 rider 动作已注册进 `fbs_gateway_actions()` 白名单、
在 `fbs_gateway_dispatch()` 里有**显式 return 分支**（绝不直落 issue_session 兜底）。

| 动作 | 入参 | 成功 data | 说明 |
|---|---|---|---|
| `rider_bind` | `tg_user_id`, `phone`, `ip` | `{courier_id, idempotent?}` | 见下方「三、绑定规则」 |
| `rider_ql` | `courier_id` | `{courier_id, url}` | 签 10 分钟一次性 `ql.html?token=…` 工作台直达 URL（格式与 `waimai.class.php courierQlToken()` 完全一致，改动须两侧同步） |
| `rider_notify_url` | `order_id`, `courier_id` | `{url}` | 同上但 `target=detail`，打开即该订单详情；仅供 Node 派单通知做按钮 |

`rider_bind` 的错误码（Node 透传成落地页文案）：

| HTTP | `error.code` | 含义 |
|---|---|---|
| 400 | `MISSING_PARAM` | `tg_user_id` 或 `phone` 非法 |
| 404 | `COURIER_NOT_FOUND` | 手机号没有匹配到可用骑手 |
| 409 | `COURIER_ALREADY_BOUND` | 该骑手已被**别的** Telegram 绑定（原绑定不动） |
| 409 | `TG_ALREADY_BOUND` | 该 Telegram 已绑定**别的**骑手（原绑定不动） |
| 409 | `COURIER_AMBIGUOUS` | 同一手机号命中多位骑手（数据问题，宁可拒绝不猜） |
| 429 | `BIND_RATE_LIMITED` | 三维度限频命中（N5） |
| 500 | `BIND_FAILED` | 写库失败（含并发双插撞唯一键，N6 落 `result=error` 审计） |
| 503 | `AUDIT_UNAVAILABLE` | 审计/限频计数底账不可用，fail-closed 拒绝（N4，宁拒勿漏） |
| 503 | `BRIDGE_CONFIG_MISSING` / `CONFIG_MISSING` | 读不到 `$fb_bridge_token` / 站点 basehost（rider_ql、rider_notify_url） |
| 429 | `REPLAY_LIMITED` | 紧窗凭证动作（rider_ql / rider_notify_url）同一 (签名体, 时间戳) 的原样重发（见下） |

时间窗按「是否返回活凭证」分两档（最终移植轮裁决；重放语义 2026-11-06 修复轮 4 按 Ray F-B1 修正）：

- **紧窗 ±15s + 重放计数**：`issue_session` / `rider_ql` / `rider_notify_url`——三者每次成功都
  签发活凭证（会话 cookie / ql token 600s）。重放计数与 issue_session 同款文件账本（sha256 键 +
  flock），差异有两点：
  - **放行单位是 (body, ts) 二元组**：ts 虽在 header，但它参与 HMAC 签名串——同一 body 配新 ts 必须
    重新签名，攻击者没有 secret 签不出来，所以「同参换新 ts」只可能来自客户端合法重试（双击、
    几秒后再点），**放行并重记 last_ts**（账本内容 `count expiry last_ts`）；「同参同 ts」才是
    真重放，429 `REPLAY_LIMITED`。issue_session 保留 max=5 的登录防抖不变。
  - 计数放在验签之后、业务动作之前，无需 DB；账本不可写 fail-open（留痕含 action/目录/errno，
    文案与登录桥那条区分）。
- **宽窗 ±300s**：`rider_bind`——幂等（同对重绑只刷新）+ 每次尝试落审计 + 不签任何令牌，
  重放无攻击面，无需紧窗。

旧网关 rider 动作的 60s 窗口作废；Node 侧 initData 验签的 1 小时窗口不变。

已知接受项（与 bridge.php 现状一致，不另行加固）：

- **账本落在单 Pod 本地盘（baked 模式 data/ 是 emptyDir）**：重放计数只在本 Pod 内生效，请求被
  负载均衡到另一 Pod 时约 50% 概率不被拦。签名紧窗（±15s）仍是主防线，账本是 Pod 内辅助防线；
  bridge 的登录防抖账本同款现状，接受。
- **账本无 GC**：方案 A 后文件数 = 不同 (body 参数) 组合数，每文件 <10 字节，量级可控；过期后
  内容失效但文件留存，直到 emptyDir 随 Pod 重建清空。接受。
- **部署顺序**：rider 路由（A1/A2）调 `FBS_GATEWAY_URL` 的 rider 动作，PHP 网关（B）未部署时
  网关返回 `UNKNOWN_ACTION` 404 → Node 502——**A1/A2/B 三支必须同一发布窗口上线（A1 → A2 → B）**，
  不允许 A1/A2 先行单独生效。（env 层面已无阻塞：canary 已把 DB_*/TRUST_PROXY_HOPS/CORS_ORIGINS
  移出 `tma.enabled` 守卫，Node 容器不依赖 TMA 开关。）

## 三、绑定规则（B1：冲突绝不静默顶替）

1. **冲突返 409，绝不顶替**。同一对 `(tg_user_id, courier_id)` 重绑 = 幂等成功（只刷新手机号写法，
   返回 `idempotent: true`），不签任何令牌；只要两个维度里有一个指向别的对象就 409，原绑定保持原样。
   旧实现 `DELETE … WHERE tg_user_id = X OR courier_id = Y` 会把别人的绑定一起删掉，已彻底移除。
2. **手机号归一**（`fbs_normalize_phone()`，必须与 Node `riderRoute.js normalizePhone` 一致）：
   去空格 / 横线 / 括号 / 点号 → 前导 `+63` 转 `0`（`63` + 10 位也转）→ 结果须是「`0` 开头 +
   共 10-11 位数字」，否则 400。两侧都做：Node 保证用户体验，PHP 是二次防线并保证审计里格式统一。
3. **三维度限频**（N5；以 `fbs_bind_audit` 为计数底账，不依赖 Redis）：
   - `tg_user_id` 维度：60 秒内最多 5 次
   - `phone` 维度：300 秒内最多 3 次
   - `ip` 维度：300 秒内最多 20 次（N5 新增——审计早落了 ip 但没参与限频，tg 5/60s 挡不住
     「同 IP 慢速换 tg/phone 枚举」；阈值取 Node 侧落限频 10 次/60s 的两倍窗口量级，
     给手工解绑场景留余量，报告与 openapi 已同步）
   - `result = 'rate_limited'` 的行**不计入**，否则用户被拦一次就不断延长窗口，越试越锁死。
   - **fail-closed（N4）**：COUNT 失败（底账不可读）一律 503 `AUDIT_UNAVAILABLE` 拒绝并
     error_log（带 tg/phone/ip），不放行。
4. **审计**：`fbs_bind_audit`（迁移 007）成功与失败都写一行，`result` 枚举 5+1 类：
   `success` / `conflict_tg` / `conflict_courier` / `not_found` / `rate_limited` / `error`
   （`error` = 并发双插撞 `fbs_courier_map` 唯一键的最终失败，N6——否则审计与实态对不上账）；
   **INSERT 失败也 fail-closed（N4）**：503 `AUDIT_UNAVAILABLE` + error_log，宁拒勿漏；
   表上有 `created_at`、`(tg_user_id, created_at)`、`(phone, created_at)` 三个索引
   （ip 维度走 created_at 索引，量级下够用），既是追溯面也是限频计数面。
   **不写 initData、不写 token**。
5. 落地页失败文案只给用户能自己做的事（去原 Telegram 解绑 / 核对手机号），
   不写「联系管理员」这类甩锅话术。

## 四、派单挂点（`fb_tg_dispatch($event, $orderId, $courierId)`）

| 位置 | 场景 | event | 收件骑手 |
|---|---|---|---|
| `waimaiOrder.php`（UPDATE state=4 派单成功后，紧邻 `sendapppush`） | 派单 / 改派给另一骑手 | `new_order`（首次）/ `reassign`（同平台改派） | 新骑手 |
| `waimaiOrder.php`（同上 `if ($peisongid)` 分支内，M5） | 同平台改派把原骑手摘掉 | `reclaim` | 原骑手（`$peisongid`，**无按钮**） |
| `waimaiOrder.php`（改派第三方平台分支，`peisongid = '0'` 成功后） | 原骑手被摘单 | `reclaim` | 原骑手（**无按钮**） |
| `waimai.class.php qiangdan()` 抢单成功后 | 抢单 | `grab` | 抢单骑手 |

事件枚举以代码为准：`new_order` / `grab` / `reassign` / `reclaim`（Node 与 PHP 白名单双处校验）。
`reclaim` 一律不带「查看订单」按钮——订单已经不归收件人，按钮只会误导。
同一骑手自己改派给自己时不再补发 `reclaim`（否则一条 `reassign` + 一条 `reclaim` 自相矛盾）。

## 五、调用约定

- 目标地址：`http://firebird-<SITE_ID>/tg-api/internal/dispatch`（站点 nginx 的 `/tg-api/` 转发到
  `firebird-api-<site>` 服务）；特殊拓扑用 `TG_DISPATCH_URL` 覆盖。**不经 Traefik**：
  `/tg-api/internal` 在 IngressRoute 上有 ipAllowList（仅回环），外部访问一律 403。
- 超时：connect 300ms / 总 800ms（`CURLOPT_NOSIGNAL`），**不重试**。Node 侧已改成「收下即返回」——
  验签 + 去重占位写库后立刻回 `202 {accepted:true}`，Telegram 发送与重试都在响应之后异步做，
  所以 800ms 足够；原来的 1.2s + 重试会与 Node 的发送超时倒挂（PHP 先放弃、Node 还在发），
  日志里全是假失败。**不调用 `fastcgi_finish_request`**——三处挂点都在响应生成中段，
  提前结束会截断后台页/H5 接口输出。
- 返回值语义：`true` 只代表 **Node 已受理**，不代表已送达。投递保证是 **at-most-once（N3）**：
  硬崩溃时在飞通知可能丢失（残余靠带 `order_id=` 的日志定位补发）；进程收 SIGTERM
  （RollingUpdate 发版）会先排空在飞任务（上限 8s）再退出，正常发版不丢。
- 日志：失败时 `error_log('[fb_tg_dispatch] failed event=… order_id=… courier_id=… http=… errno=… err=…')`，
  带 `curl_error()` 与 HTTP 状态码；线上按 `order_id=` grep 即可定位。不记 body/签名。
- 签名：`HMAC-SHA256(FBS_GATEWAY_SECRET, ts\ndispatch\nbody)`，与 `services/api/src/gatewayClient.js`
  同算法（方向反转：PHP→Node），action 常量 `dispatch`，Node 侧 60 秒时间窗。
- 去重：Node 侧 `fbs_dispatch_dedup`，键 `(event, order_id, courier_id)`，TTL 1 天；
  同一订单改派给第二位骑手不会互相吞通知。最终发送失败时 Node 释放占位，允许下次同键重发。
