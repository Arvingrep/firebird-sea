# 收银台与尾数分配（Story 2.1）

代码：`services/api/src/checkout.js`（域逻辑）、`src/checkoutRoute.js`（路由）、`src/payOrderRead.js`（订单读取）；路由：`POST /tg-api/checkout`；落库表 `fbs_charge`（见 `DB_MIGRATIONS.md`）。

## 请求 / 响应
请求体：`{ ordernum, idempotencyKey? }`。**金额不由客户端提交**：应付金额与订单归属一律由服务端读取（见下"订单金额与归属"），请求体中的 `phpCentavos` 等金额字段被忽略。
成功：`{ success: true, data: { ordernum, payable_micro, rate_str, rate_at, expires_at, address } }`；`address` 取环境变量 `TRON_MASTER_RECEIVE_ADDRESS`。
失败：`{ success: false, error: { code, message } }`。code → HTTP：`BAD_REQUEST` 400；`UNAUTHORIZED` 401；`ORDER_NOT_FOUND` / `ORDER_FORBIDDEN` / `ORDER_NOT_PAYABLE` / `ORDER_INVALID` 403；`ORDER_EXISTS` 409；`RATE_LIMITED` 429；`CHECKOUT_DISABLED` / `RATE_UNAVAILABLE` / `RATE_STALE` / `RATE_INVALID` / `TAIL_EXHAUSTED` 503；其他 500。汇率类失败与尾数耗尽均不写库。

## 环境变量清单（本 Story 相关）
| 变量 | 默认 | 说明 |
|---|---|---|
| `CHECKOUT_ENABLED` | 未设置（关闭） | 仅 `=1` 开放 `/tg-api/checkout`；否则 503 `CHECKOUT_DISABLED` |
| `TRON_MASTER_RECEIVE_ADDRESS` | 空 | 收银台展示收款地址（生产启动自检必填，见 AD-13） |
| `DB_CLIENT` / `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | — | 零依赖 CLI 数据库通道（`migrate.js` 既有约定） |
| `DB_TABLE_PREFIX` | `huoniao_` | 火鸟表前缀（`pay_log` 只读用） |

## 订单金额与归属（QA 第 2/4 轮 major 修复）
- 金额权威行 = 火鸟 `pay_log`（AD-4：`fbs_charge.ordernum` 与 `pay_log` 一一对应，`deal()` 下单时同步创建）。`payOrderRead.js` 读取 `amount`（decimal(8,2)，PHP 元）换算整数 centavos（×100，字符串运算避免浮点），并要求 `state=0`（待支付）；已支付 → `ORDER_NOT_PAYABLE`。
- 归属校验：请求的 Telegram 用户 id 在 `fbs_member_map` 中映射的 `member_id` 必须等于 `pay_log.uid`（火鸟会员 id）；不符 → 403 `ORDER_FORBIDDEN`。未映射 → 同样拒绝。
- 读取是**只读**的（固定列 SELECT，ordernum/前缀白名单校验），不写任何火鸟表。
- 过渡说明：AD-1/AD-3 规定订单数据经 `webroot/api/fbs` 网关读取；网关 PHP 端尚未落地（`GATEWAY_SPIKE.md`"未完成"）。网关就绪后 `payOrderRead.readPayOrder` 应替换为 `gatewayClient` 调用，`fbs_charge` 写路径不变。此为登记在案的临时通道，`CHECKOUT_ENABLED` 默认关闭兜底。

## 金额公式
`payable_micro = ceil(php_centavos * 1e4 / rate) + tail * 1e4`，全程 BigInt 整数运算；`tail ∈ [1,90]`（0.01~0.90 USDT）。
注：Issue 中写作 `php_minor * 1e6 / rate`；`php_minor` 取 centavo（0.01 PHP）时 1 centavo = 1e4 / rate micro-USDT，故实现用 1e4（等价于 PHP 金额 × 1e6 / rate）。

## 汇率快照
默认取 Coins.ph `USDTPHP` 最新价（`rate_str` 保留原始字符串），`rate_at` 为取价时刻；快照距当前超过 60 秒或取价失败则拒绝。

## 尾数分配与并发
1. 先把已过期的 pending 订单置 `expired` 并清 `holds_tail`（释放尾数）。
2. 查询同一基础金额下 `holds_tail=1` 的已占尾数，从剩余尾数随机取一个；无剩余 → `TAIL_EXHAUSTED`（请稍后再试）。
3. `INSERT` 依赖 `uq_fbs_charge_tail`（`holds_tail=1` 时 `payable_micro` 唯一）；撞约束则重新查询并重选，最多 5 次。

## 鉴权与限流（QA 第 1 轮修复）
- `POST /tg-api/checkout` 必须携带 Telegram `initData`（请求头 `x-telegram-init-data` 或 body `initData`），HMAC 校验失败返回 401 `UNAUTHORIZED`。
- 按 Telegram 用户 id 内存限流：每分钟最多 5 次，超出返回 429 `RATE_LIMITED`。多副本下内存限流不共享，需网关侧限流（已知缺口）。
- 非业务异常（如数据库故障）返回 500，并向 stderr 写一行结构化 JSON 错误日志。

## 幂等与过期复用（QA 第 4 轮 major 1 / minor 2 修复）
- 幂等检查**先于取汇率**：已有可用（pending 且未过期）收银台时直接返回，汇率故障不影响重复请求。
- `ordernum` / `idempotencyKey` 命中已过期（或非 pending 超时）的旧行时，用**单条条件 UPDATE**（`WHERE id=… AND state IN ('pending','expired')`）复用该行：写入新金额、汇率、尾数、`expires_at`，重置 `holds_tail=1`、`state='pending'`。同一订单过期后可无限次重新获得收银台，不再撞 `uq_fbs_charge_ordernum` 死锁。数据库通道 `cliConn` 每次 `query()` 都是一个新的 `mariadb` 客户端进程，`BEGIN` / `SELECT … FOR UPDATE` 不构成事务，因此续期路径**不依赖跨语句锁**（QA 第 6 轮 major 1）。
- 并发续期：UPDATE 后立即读回该行；仅当库中 `payable_micro` 与 `rate_str` 与本次计算一致才返回本次结果，否则以库中现值为准幂等返回（后写者胜，两个调用方拿到同一金额）。读回已是 `matched` / `void` 等资金终态则 409 `ORDER_EXISTS`，绝不覆盖终态（QA 第 6 轮 major 2）。
- 资金终态保护：`state` 为 `matched` / `void` 的行**不得**复用重建（返回 409 `ORDER_EXISTS`），由 Story 2.3/2.5 的状态机负责。
- `rate_at` / `expires_at` 在首次创建与幂等返回两条路径统一为落库秒精度（`YYYY-MM-DDTHH:mm:ssZ`），两次响应一致。

## QA 第 5 轮补强
- `idempotencyKey` 命中他人订单（命中行 `ordernum` 与本次请求不一致）时直接 409 `ORDER_EXISTS`，不返回他人收银台字段。
- `rate_at` 晚于当前时间超过 1 秒容差按 `RATE_STALE` 拒绝；取尾数前的过期清理现已落地为单条 `UPDATE … state='expired', holds_tail=0`（此前文档有描述但代码缺失）。

## 开关与启用条件
- `CHECKOUT_ENABLED` 默认关闭（503 `CHECKOUT_DISABLED`）。服务端金额读取 + 归属校验已就位，生产启用仍需运营确认 `pay_log` 数据一致性（`state=0` 约定）与网关限流就绪。

## 测试
`test/checkout.test.js`（域逻辑：公式、尾数、幂等、过期复用、终态守卫、真实 MariaDB 报错样例）、`test/pay-order-read.test.js`（金额/归属读取与拒绝路径）、`test/checkout-route.test.js`（路由层：开关、401、403、429、400、金额服务端化）。
