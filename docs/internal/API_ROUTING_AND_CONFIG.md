# Node API 路由前缀与生产配置自检（Story 1.3，AD-9 / AD-13）

## 路由前缀
- Node API 所有路由在 `/tg-api/*`（如 `/tg-api/payment/create-charge`、`/tg-api/auth/tg-verify`）；`/` 与 `/health` 保留给探针。
- Traefik（`deploy/helm/firebird-site/templates/ingressroute.yaml`）只把 `PathPrefix(/tg-api)` 交给 Node；`/api/*`（含 `/api/payment/notify.php`）落到火鸟 PHP。
- `services/payment-listener` 计划调用 `${API_BASE_URL}/tg-api/payment/chain-match`（回调尚未启用，见 GATEWAY_SPIKE.md）。
- 前端/TMA 调用旧 `/api/...` 的地方需改到 `/tg-api/...`（本仓库内目前无调用方）。

## 生产启动自检（`services/api/src/config.js`）
`NODE_ENV=production` 时，缺少 `TELEGRAM_BOT_TOKEN` / `TRON_MASTER_RECEIVE_ADDRESS`、使用 `DEMO_*` 演示令牌、或收款地址为占位符/非 Tron 地址，进程启动即抛错退出并列出全部问题。`/tg-api/payment/mock-webhook` 仅在非生产环境注册。

## Call test 语音呼叫自动重试（`services/api/src/callTest.js`）
- `POST /tg-api/call-test`：向环境变量 `CALL_TEST_URL`（语音通道测试端点，可选；未设置返回 503 `CALL_TEST_NOT_CONFIGURED`）发起 POST。**须在请求体携带有效 Telegram `initData`**（HMAC 校验，失败 401）；仅透传白名单字段 `to`、`message`；同一时刻仅允许 1 个进行中的测试（并发返回 429 `CALL_TEST_BUSY`）；意外异常返回 500 `INTERNAL_ERROR`。`CALL_TEST_URL` 经 Helm `api.callTestUrl` 注入。
- 首次超时（单次 5s，最坏约 21s，Ingress 读超时须大于 25s）/非 2xx 时原生 `fetch` 自动重试，最多 2 次，间隔硬编码 3s；任一次成功即返回 `{ success: true, data: { attempts } }`。
- 共 3 次均失败：记录一条终态异常日志 `[call-test] FINAL FAILURE ...`，返回 502 `{ success: false, error: { code: 'CALL_TEST_FAILED', message }, data: { attempts: 3 } }`。
- 零依赖，无任务队列；测试见 `services/api/test/call-test.test.js`。

## Secret 注入
`deployment-api.yaml` 通过 `secretKeyRef` 从 `api.secretRef`（默认 `firebird-api-secret`）注入：`TELEGRAM_BOT_TOKEN`、`TRON_MASTER_RECEIVE_ADDRESS`（必填）、`COINS_PH_API_KEY`、`COINS_PH_API_SECRET`、`TRONGRID_API_KEY`（可选）。Secret 由运维预先创建，不入库。
listener 的 Helm 模板为 `deployment-payment-listener.yaml`（默认关闭），按同一 Secret 注入 `TRONGRID_API_KEY` / `TRON_MASTER_RECEIVE_ADDRESS`。
