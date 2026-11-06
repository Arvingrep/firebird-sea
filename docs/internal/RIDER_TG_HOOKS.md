# 骑手 Telegram 通知 · PHP 侧挂点与网关动作

> 生效日期：2026-11-06（修复轮 2 更新：B1 冲突不顶替 / 限频 / 审计、M2 日志、M3 超时预算、M5 同平台改派）
> 对应实现：`webroot/api/fbs/index.php`（网关动作）、`webroot/include/common.func.php`（`fb_tg_dispatch`）、
> `webroot/admin/waimai/waimaiOrder.php` 与 `webroot/api/handlers/waimai.class.php`（派单挂点）
> Node 侧配套端点见 `services/api`（分支 `feat/tma-rider-api`、`feat/tma-rider-dispatch`，先合入）。

## 一、为什么 PHP 不直接发 Telegram

PHP 容器**不注入** `TELEGRAM_BOT_TOKEN`（密钥面收敛到 Node）。派单类动作经集群内 HTTP 转交
Node 的 `POST /tg-api/internal/dispatch`，由 Node 查 `fbs_courier_map` 得 tg_user_id 后发消息。
通知失败只记日志、返回 false，**绝不影响派单事务本身**。

## 二、网关动作（`/api/fbs/index.php?action=<action>`，HMAC 头 X-Fbs-Timestamp / X-Fbs-Signature）

| 动作 | 入参 | 出参 | 说明 |
|---|---|---|---|
| `rider_bind` | `tg_user_id`, `phone`, `ip` | `state=100 {courier_id, idempotent?}` | 见下方「三、绑定规则」 |
| `rider_ql` | `courier_id` | `state=100 {courier_id, url}` | 签 10 分钟一次性 `ql.html?token=…` 工作台直达 URL（格式与 `waimai.class.php courierQlToken()` 完全一致，改动须两侧同步） |
| `rider_notify_url` | `order_id`, `courier_id` | `state=100 {url}` | 同上但 `target=detail`，打开即该订单详情；仅供 Node 派单通知做按钮 |

`rider_bind` 的错误码（`info` 为对象，Node 直接透传成落地页文案）：

| HTTP | `info.code` | 含义 |
|---|---|---|
| 400 | — | `tg_user_id` 或 `phone` 非法 |
| 404 | `COURIER_NOT_FOUND` | 手机号没有匹配到可用骑手 |
| 409 | `COURIER_ALREADY_BOUND` | 该骑手已被**别的** Telegram 绑定（原绑定不动） |
| 409 | `TG_ALREADY_BOUND` | 该 Telegram 已绑定**别的**骑手（原绑定不动） |
| 409 | `COURIER_AMBIGUOUS` | 同一手机号命中多位骑手（数据问题，宁可拒绝不猜） |
| 429 | `BIND_RATE_LIMITED` | 双维度限频命中 |
| 500 | — | 写库失败 |

## 三、绑定规则（B1：冲突绝不静默顶替）

1. **冲突返 409，绝不顶替**。同一对 `(tg_user_id, courier_id)` 重绑 = 幂等成功（只刷新手机号写法，
   返回 `idempotent: true`），不签任何令牌；只要两个维度里有一个指向别的对象就 409，原绑定保持原样。
   旧实现 `DELETE … WHERE tg_user_id = X OR courier_id = Y` 会把别人的绑定一起删掉，已彻底移除。
2. **手机号归一**（`fbs_normalize_phone()`，必须与 Node `riderRoute.js normalizePhone` 一致）：
   去空格 / 横线 / 括号 / 点号 → 前导 `+63` 转 `0`（`63` + 10 位也转）→ 结果须是「`0` 开头 +
   共 10-11 位数字」，否则 400。两侧都做：Node 保证用户体验，PHP 是二次防线并保证审计里格式统一。
3. **双维度限频**（以 `fbs_bind_audit` 为计数底账，不依赖 Redis）：
   - `tg_user_id` 维度：60 秒内最多 5 次
   - `phone` 维度：300 秒内最多 3 次
   - `result = 'rate_limited'` 的行**不计入**，否则用户被拦一次就不断延长窗口，越试越锁死。
   - 阈值与 `docs/api/openapi.yaml` 里 Node 侧（IP 10 次/60s）描述一致，留出手工解绑场景的余量。
4. **审计**：`fbs_bind_audit`（迁移 007）成功与失败都写一行，`result` ∈
   `success` / `conflict_tg` / `conflict_courier` / `not_found` / `rate_limited`；
   表上有 `created_at`、`(tg_user_id, created_at)`、`(phone, created_at)` 三个索引，
   既是追溯面也是限频计数面。**不写 initData、不写 token**。
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
- 返回值语义：`true` 只代表 **Node 已受理**，不代表已送达。
- 日志：失败时 `error_log('[fb_tg_dispatch] failed event=… order_id=… courier_id=… http=… errno=… err=…')`，
  带 `curl_error()` 与 HTTP 状态码；线上按 `order_id=` grep 即可定位。不记 body/签名。
- 签名：`HMAC-SHA256(FBS_GATEWAY_SECRET, ts\ndispatch\nbody)`，与 `services/api/src/gatewayClient.js`
  同算法（方向反转：PHP→Node），action 常量 `dispatch`，Node 侧 60 秒时间窗。
- 去重：Node 侧 `fbs_dispatch_dedup`，键 `(event, order_id, courier_id)`，TTL 1 天；
  同一订单改派给第二位骑手不会互相吞通知。最终发送失败时 Node 释放占位，允许下次同键重发。
