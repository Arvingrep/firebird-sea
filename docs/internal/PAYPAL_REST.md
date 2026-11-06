# PayPal 插件升级：NVP/SOAP → REST Orders v2

## 改动文件
- `webroot/api/payment/paypal/paypal.php`：整体重写（唯一代码改动）。`notify.php` / `return.php` 未改，沿用 `respond()` 入口。
- 新增表 `#@__paypal_txn`（插件首次使用时 `CREATE TABLE IF NOT EXISTS` 自动建）：`paypal_order_id` 唯一、`capture_id` 唯一，记录 `order_sn / status / amount / currency / env`，用于幂等与对账/退款。

## 后台配置字段
| 字段 | 说明 |
|---|---|
| Client ID / Secret | PayPal 开发者后台 Apps & Credentials |
| 环境 | `sandbox`（默认）/ `live` |
| Webhook ID | 在 PayPal 后台创建 Webhook 后生成；不填则 Webhook 兜底不可用 |
| 支付货币 | 沿用原字段名 `type`，默认第一项 PHP |
| 手续费比例 | 沿用 |
旧的 API 用户名 / 密码 / 签名已删除。

## 流程
1. `get_code`：换 token（缓存于系统临时目录，0600，过期前 60 秒刷新）→ `POST /v2/checkout/orders`（`intent=CAPTURE`，`reference_id` 与 `custom_id` = 火鸟订单号，金额取 `pay_log`）→ 302 到 `payer-action`/`approve` 链接。
2. 回跳 `return.php?code=paypal&token=<PayPal order id>`：核对 `token` 属于该订单号 → `GET order` → `APPROVED` 则 Capture → 校验 `COMPLETED`、币种、金额与 `pay_log` 一致 → `order_paid($sn, $capture_id)`。
3. Webhook `notify.php?code=paypal`：用 `/v1/notifications/verify-webhook-signature` 验签（Webhook ID）→ 仅处理 `PAYMENT.CAPTURE.COMPLETED`，同样校验后入账。瞬时失败返回 5xx 让 PayPal 重试，签名无效返回 400。
4. 取消 `cancel=1`：订单保持未支付，显示「Payment cancelled / 付款已取消」页。
5. 幂等：`claim`（UPDATE 抢锁，60 秒后可重抢）+ `order_paid` 只处理 `pay_log.state=0`；回跳与 Webhook 并发只有一方入账。同一订单被第二笔 PayPal 付款，记 `duplicate` 日志待人工退款。
6. 安全：Secret 仅服务端；日志不含 Secret/token/请求头；金额一律以服务端 `pay_log` 为准；cURL 开启证书校验（旧代码关闭了）。

## 验证情况
- 已验证（PHP 7.4 / 8.2 语法检查通过）。
- 已验证：对 PayPal **沙盒真实接口**完成 OAuth 与 Create Order（PHP 币种，返回 `PAYER_ACTION_REQUIRED` 与 `payer-action` 链接）。
- 已验证（模拟 PayPal 接口 + sqlite 替身）：回跳入账、重复回跳、仅 Webhook、Webhook 重放不重复入账、金额不符拒入账、验签失败拒绝、错订单/注入式订单号拒绝。
- **未验证**：买家在沙盒登录并批准后的真实 Capture；真实 Webhook 验签（需公网回调地址与 Webhook ID）；手机浏览器与 Telegram Mini App 内的跳转与回跳；取消页的实际展示；火鸟后台配置页对新字段的渲染。

## 联调步骤
1. 后台填 Sandbox 的 Client ID/Secret，环境选 Sandbox，货币 PHP。
2. PayPal 后台 Webhooks 添加 `https://<域名>/api/payment/notify.php?code=paypal`，订阅 `PAYMENT.CAPTURE.COMPLETED`，把 Webhook ID 填回后台。
3. 用沙盒买家账号分别在手机浏览器和 Telegram Mini App 下一单并付款；再测取消、关闭页面只靠 Webhook。
4. 注意：`site_payment` 表有文件缓存，后台改完配置若不生效，参见 `HN_DSQL_CACHE_SKIP`。

## Sandbox → Live
1. PayPal 后台切到 Live，创建 Live App，取得 Live Client ID/Secret。
2. 在 Live 下重新创建 Webhook，得到新的 Webhook ID（Sandbox 与 Live 的 Webhook ID 不通用）。
3. 火鸟后台把 Client ID、Secret、Webhook ID 换成 Live 值，环境选 Live。
4. 用小额真实订单走一遍付款与退款。
5. token 缓存按「Client ID + 环境」分文件，切换无需清理。
