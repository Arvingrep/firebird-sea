# Story 1.2 网关技术验证（spike）

目的：在写业务代码前验证 AD-2/AD-3 的假设。Node 客户端：`services/api/src/gatewayClient.js`；测试：`services/api/test/gateway-spike.test.js`。

## 调用约定（Node → `webroot/api/fbs`）
- `POST {FBS_GATEWAY_URL}/{action}`，action ∈ `deal`、`order_paid`、`cancelOrder`，JSON 体。
- 头 `X-Fbs-Timestamp`（秒）、`X-Fbs-Signature` = HMAC-SHA256(secret, `timestamp\naction\nbody`) 十六进制。
- 新增环境变量（仅测试/联调）：`FBS_GATEWAY_URL`、`FBS_GATEWAY_SECRET`、`FBS_TEST_UID`、`FBS_TEST_SID`。未设置时联机用例自动跳过。
- 网关 PHP 端（`webroot/api/fbs/`）不在本 Story 范围，待后续 Story 落地；联机用例需在其就绪后于本地 docker（8080）执行。

## 源码核对结论（`webroot/api/handlers/waimai.class.php`，静态，已由测试固化）
| 问题 | 结论 |
|---|---|
| `deal()` 是否同步创建 `pay_log` | 取决于支付方式：在线支付（应付 > 0 且非货到付款）走 `createPayForm()`，`deal()` 本身不写 `pay_log(state=1)`；余额/货到付款分支同步写 `pay_log(state=1, amount=0)`。USDT 插件须经 `createPayForm` 路径，联机时需确认 `pay_log` 行的创建时机 |
| 支付成功后订单状态 | `paySuccess()`（`order_paid` 的落点）执行 `SET state = 2`，与 AD-2 一致 |
| 已付订单取消 | `cancelOrder()` 对 state 2：`state = 6`、`refrundstate = 1`，并同步调用 `refund()`；对 state 0：仅 `state = 6`。state 7 仅为"已取消"的只读识别，不由该方法写入 |

## 对 AD-2 的修正/确认
- 确认：取消落 state 6，不使用 state 7。
- 修正：`refrundstate=1` 在火鸟中于取消时即写入（含 `refund()` 调用结果判断前的分支），不能单独作为"已退款"的可信证据；AD-7 的 `fbs_refund` 应以实际退款回执为准。该点待联机验证后定稿。

## 未完成
联机实测（`deal()` 对 `pay_log` 的实际写入、`order_paid` 后 state、取消后 refrundstate 实值）需本地 docker 与网关就绪，暂未执行。

## 付款监听器部署与网关隔离（Story 1.8，AD-19）

- 监听器：`deploy/docker/Dockerfile.payment-listener`；compose 服务 `payment-listener`（副本 1、无端口）；Helm `deployment-payment-listener.yaml`（`replicas: 1`、`strategy: Recreate`，多副本会重复入账）。
- 开关：`paymentListener.enabled`（默认 `false`，待 CI 构建 `firebird-payment-listener` 镜像后改 `true`）。
- 回调依赖：监听器 POST `${API_BASE_URL}/tg-api/payment/chain-match`；compose 无 api 服务，`API_BASE_URL` 与 `TRON_MASTER_RECEIVE_ADDRESS` 为必填（缺失即启动失败，不再回落占位地址）。
- 镜像 tag：`paymentListener.image.tag` 默认 `canary`（禁用 `latest`）；CI 构建步骤（`.github/`）需 owner 添加，生产启用前改为不可变 tag。
- 环境变量/密钥：`TRON_MASTER_RECEIVE_ADDRESS`、`TRONGRID_API_KEY` 经 `paymentListener.secretRef`（默认 `firebird-api-secret`）注入，不入 Git。
- 网关隔离：`ingressRoute.denyGateway: true` 时，Traefik 对 `PathPrefix(/api/fbs)` 的外部请求经 `ipAllowList(127.0.0.1/32)` 中间件返回 403；集群内 Pod 直连 Service 不经 IngressRoute，仍可达。
