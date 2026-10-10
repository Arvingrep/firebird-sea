# Node API 路由前缀与生产配置自检（Story 1.3，AD-9 / AD-13）

## 路由前缀
- Node API 所有路由在 `/tg-api/*`（如 `/tg-api/payment/create-charge`、`/tg-api/auth/tg-verify`）；`/` 与 `/health` 保留给探针。
- Traefik（`deploy/helm/firebird-site/templates/ingressroute.yaml`）只把 `PathPrefix(/tg-api)` 交给 Node；`/api/*`（含 `/api/payment/notify.php`）落到火鸟 PHP。
- `services/payment-listener` 计划调用 `${API_BASE_URL}/tg-api/payment/chain-match`（回调尚未启用，见 GATEWAY_SPIKE.md）。
- 前端/TMA 调用旧 `/api/...` 的地方需改到 `/tg-api/...`（本仓库内目前无调用方）。

## 生产启动自检（`services/api/src/config.js`）
`NODE_ENV=production` 时，缺少 `TELEGRAM_BOT_TOKEN` / `TRON_MASTER_RECEIVE_ADDRESS`、使用 `DEMO_*` 演示令牌、或收款地址为占位符/非 Tron 地址，进程启动即抛错退出并列出全部问题。`/tg-api/payment/mock-webhook` 仅在非生产环境注册。

## Secret 注入
`deployment-api.yaml` 通过 `secretKeyRef` 从 `api.secretRef`（默认 `firebird-api-secret`）注入：`TELEGRAM_BOT_TOKEN`、`TRON_MASTER_RECEIVE_ADDRESS`（必填）、`COINS_PH_API_KEY`、`COINS_PH_API_SECRET`、`TRONGRID_API_KEY`（可选）。Secret 由运维预先创建，不入库。
listener 的 Helm 模板为 `deployment-payment-listener.yaml`（默认关闭），按同一 Secret 注入 `TRONGRID_API_KEY` / `TRON_MASTER_RECEIVE_ADDRESS`。
