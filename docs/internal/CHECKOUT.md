# 收银台与尾数分配（Story 2.1）

代码：`services/api/src/checkout.js`；路由：`POST /tg-api/checkout`；落库表 `fbs_charge`（见 `DB_MIGRATIONS.md`）。

## 请求 / 响应
请求体：`{ ordernum, phpCentavos(正整数, PHP 最小单位), idempotencyKey? }`。
成功：`{ success: true, data: { ordernum, payable_micro, rate_str, rate_at, expires_at, address } }`；
`address` 取环境变量 `TRON_MASTER_RECEIVE_ADDRESS`（本 Story 未新增环境变量）。
失败：`{ success: false, error: { code, message } }`，code：`BAD_REQUEST`(400)、`ORDER_EXISTS`(409)、`RATE_UNAVAILABLE` / `RATE_STALE` / `RATE_INVALID` / `TAIL_EXHAUSTED`(503)。汇率类失败与尾数耗尽均不写库。

## 金额
`payable_micro = ceil(php_centavos * 1e4 / rate) + tail * 1e4`，全程 BigInt 整数运算；`tail ∈ [1,90]`（0.01~0.90 USDT）。
注：Issue 中写作 `php_minor * 1e6 / rate`；`php_minor` 取 centavo（0.01 PHP）时 1 centavo = 1e4 / rate micro-USDT，故实现用 1e4（等价于 PHP 金额 × 1e6 / rate）。

## 汇率快照
默认取 Coins.ph `USDTPHP` 最新价（`rate_str` 保留原始字符串），`rate_at` 为取价时刻；快照距当前超过 60 秒或取价失败则拒绝。

## 尾数分配与并发
1. 先把已过期的 pending 订单置 `expired` 并清 `holds_tail`（释放尾数）。
2. 查询同一基础金额下 `holds_tail=1` 的已占尾数，从剩余尾数随机取一个；无剩余 → `TAIL_EXHAUSTED`（请稍后再试）。
3. `INSERT` 依赖 `uq_fbs_charge_tail`（`holds_tail=1` 时 `payable_micro` 唯一）；撞约束则重新查询并重选，最多 5 次。
