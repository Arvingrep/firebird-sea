# 骑手 Telegram 通知 · PHP 侧挂点与网关动作

> 生效日期：2026-11-06
> 对应实现：`webroot/api/fbs/index.php`（网关动作）、`webroot/include/common.func.php`（`fb_tg_dispatch`）、
> `webroot/admin/waimai/waimaiOrder.php` 与 `webroot/api/handlers/waimai.class.php`（派单挂点）
> Node 侧配套端点见 `services/api`（分支 `feat/tma-rider-api`，先合入）。

## 一、为什么 PHP 不直接发 Telegram

PHP 容器**不注入** `TELEGRAM_BOT_TOKEN`（密钥面收敛到 Node）。派单类动作经集群内 HTTP 转交
Node 的 `POST /tg-api/internal/dispatch`，由 Node 查 `fbs_courier_map` 得 tg_user_id 后发消息。
通知失败只记日志、返回 false，**绝不影响派单事务本身**。

## 二、网关动作（`/api/fbs/index.php?action=<action>`，HMAC 头 X-Fbs-Timestamp / X-Fbs-Signature）

| 动作 | 入参 | 出参（state=100） | 说明 |
|---|---|---|---|
| `rider_bind` | `tg_user_id`, `phone` | `{courier_id}` | 按手机号查唯一可用骑手（`quit != 1 && status = 1`，与 `courierQlToken` 同口径），幂等重绑 `fbs_courier_map`（DELETE+INSERT，双向唯一键） |
| `rider_ql` | `courier_id` | `{courier_id, url}` | 签 10 分钟一次性 `ql.html?token=…` 工作台直达 URL（格式与 `waimai.class.php courierQlToken()` 完全一致，改动须两侧同步） |
| `rider_notify_url` | `order_id`, `courier_id` | `{url}` | 同上但 `target=detail`，打开即该订单详情；仅供 Node 派单通知做按钮 |

## 三、派单挂点（`fb_tg_dispatch($event, $orderId, $courierId)`）

| 位置 | 场景 | event | 收件骑手 |
|---|---|---|---|
| `waimaiOrder.php`（UPDATE state=4 派单成功后，紧邻 `sendapppush`） | 派单 / 改派给另一骑手 | `new_order`（首次）/ `reassign`（改派） | 新骑手 |
| `waimaiOrder.php`（改派第三方平台分支，`peisongid = '0'` 成功后） | 原骑手被摘单 | `reclaim` | 原骑手（**无按钮**，文案「订单已被客服收回，无需继续配送」） |
| `waimai.class.php courierOrderStatistics` 抢单成功后 | 抢单 | `grab` | 抢单骑手 |

事件枚举以代码为准：`new_order` / `grab` / `reassign` / `reclaim`（Node 与 PHP 白名单双处校验）。

## 四、调用约定

- 目标地址：`http://firebird-<SITE_ID>/tg-api/internal/dispatch`（站点 nginx 的 `/tg-api/` 转发到
  `firebird-api-<site>` 服务）；特殊拓扑用 `TG_DISPATCH_URL` 覆盖。
- 超时：connect 800ms / 总 1.2s（`CURLOPT_NOSIGNAL`）。**不调用 `fastcgi_finish_request`**——
  三处挂点都在响应生成中段，提前结束会截断后台页/H5 接口输出；1.2s 是不可达时的最坏延迟。
- 签名：`HMAC-SHA256(FBS_GATEWAY_SECRET, ts\ndispatch\nbody)`，与 `services/api/src/gatewayClient.js`
  同算法（方向反转：PHP→Node），action 常量 `dispatch`，Node 侧 60 秒时间窗。
- 去重：Node 侧 `fbs_dispatch_dedup`，键 `(event, order_id, courier_id)`，TTL 1 天；
  同一订单改派给第二位骑手不会互相吞通知。
