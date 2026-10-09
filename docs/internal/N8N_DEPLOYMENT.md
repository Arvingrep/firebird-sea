# n8n 自动化平台部署与接入（GKE + Hermes MCP）

> 「一人AI团队」工作流引擎。部署在 GCP GKE，由 Hermes 经 MCP 驱动。
> 最后更新：2026-10-09

## 1. 访问入口

| 项 | 值 |
|---|---|
| 地址 | https://n8n.k8shome.com |
| 编排画板 | 登录后左侧 Workflows |
| owner 账号 | `n8n@k8shome.com`（密码由 Arvin 本人设置，不落文档/聊天） |
| 界面 | 中文版，`Execute Command` / `Local File Trigger` 等组件已解锁 |

> ⚠️ 汉化镜像 `deluxebear/n8n:2.0.0-chs` 首启会自动预置一个 owner（密码未知、不可登录）。
> 本实例已 `n8n user-management:reset` 清掉预置账号，由 Arvin 重新注册。若重建 PVC 需重复此步。

## 2. 基础设施（GitOps，SSOT 在 devops 仓库）

部署清单与权威说明在 **`~/Documents/devops/gitops/homelab/apps/n8n/`**，本节仅摘要。

| 维度 | 说明 |
|---|---|
| 集群 | GKE `zxem-prod-gke`（`kubectl --context gcp-gke`），命名空间 `n8n` |
| 镜像 | `deluxebear/n8n:2.0.0-chs`（官方 n8n 2.0 + 汉化 + 解锁组件） |
| 数据 | SQLite，PVC `n8n-data`（`standard-rwo`，2Gi）挂 `/home/node/.n8n`；单副本 `Recreate` |
| GitOps | mac-mini ArgoCD Application `n8n-gke`，destination `gcp-gke`；PR 合并 gitea `main` 后同步 |
| 入口 | Cloudflare 橙云 Full(Strict) → GKE Traefik LB `35.198.229.35` |
| TLS | 命名空间内 `n8n-origin-tls`（`*.k8shome.com` Origin CA，SealedSecret） |
| DNS | `n8n.k8shome.com → 35.198.229.35`（Terraform `infra/cloudflare/k8shome.com.tf`，显式记录覆盖 zone 通配） |
| 加密密钥 | `N8N_ENCRYPTION_KEY`（SealedSecret `n8n-secret`，PVC 丢失也能解密凭据） |

## 3. 工作流清单（automation/n8n/workflows/）

「一人AI团队」工作流（前 4 条已通过 `n8n import:workflow` 导入到 GKE 实例并验收）：

| 文件 | 名称 | 触发 | 依赖凭据 |
|---|---|---|---|
| `sentry_error_to_tg_ai_alert.json` | Sentry 异常经 AI 根因提炼推送 TG | Webhook `sentry-alert-webhook` | AI 模型、Telegram |
| `tg_to_github_issues_project.json` | TG 语音随笔转 GitHub Issue/看板 | Telegram Trigger | AI 模型、GitHub、Telegram |
| `tg_voice_to_linear_spec.json` | TG 语音/随笔提炼 TaskSpec → Linear | Telegram Trigger | AI 模型、Linear、Telegram |
| `usdt_payment_alert.json` | USDT 入账与对账超时告警 | Webhook `payment-status-webhook` | Telegram |
| `agent_pipeline_events_to_tg.json` | 多 Agent 流水线事件（Dev/QA/合并/构建/上线）推送 TG，见 `AGENT_PIPELINE.md` | Webhook `firebird-agent-event` | Telegram |

> 当前均为 **未激活（active=false）**。激活前需在 n8n UI 配好各节点凭据
> （Telegram Bot Token / GitHub / Linear / AI 模型等）——属资金/账号绑定的红线动作，由 Arvin 本人操作。
>
> 重新导入命令（容器内）：
> ```bash
> POD=$(kubectl --context gcp-gke -n n8n get pod -l app.kubernetes.io/name=n8n -o jsonpath='{.items[0].metadata.name}')
> kubectl --context gcp-gke -n n8n cp automation/n8n/workflows "$POD:/tmp/wf"
> kubectl --context gcp-gke -n n8n exec "$POD" -- n8n import:workflow --separate --input=/tmp/wf
> ```
> 导入带 webhook 的未激活工作流时「Active version not found / Could not remove webhooks」是无害告警，看结尾 `Successfully imported N`。

## 4. MCP Server（n8n 作为 MCP 服务端，供 Hermes 驱动）

n8n 2.0 内置实例级 MCP server，让 AI agent 以工具方式管理/执行工作流。

| 项 | 值 |
|---|---|
| Streamable HTTP 端点 | `https://n8n.k8shome.com/mcp-server/http` |
| SSE 端点 | `https://n8n.k8shome.com/mcp-server/sse` |
| 鉴权 | `Authorization: Bearer <JWT>`，**JWT 的 aud 必须是 `mcp-server-api`** |
| 暴露工具 | `search_workflows`、`execute_workflow`、`get_workflow_details` |

### 专用令牌（不是普通 API key）

MCP 要的是专用令牌，与 Public API key 不同（后者 aud 不对，报 `jwt audience invalid`）。签发/轮换（需 owner 会话）：

```
GET  /rest/mcp/api-key          # 查看（仅回显掩码）
POST /rest/mcp/api-key/rotate   # 轮换，响应里返回原始 JWT（仅此一次可见）
```

当前令牌存于本机 `~/.hermes/cache/scratch/n8n-mcp-token.txt`（chmod 600）。轮换会使旧令牌失效。

### Hermes 接入（已配置）

`~/.hermes/config.yaml` 的 `mcp_servers.n8n`：

```yaml
mcp_servers:
  n8n:
    url: https://n8n.k8shome.com/mcp-server/http
    enabled: true
    connect_timeout: 60
    headers:
      Authorization: Bearer <令牌>   # 内联，勿外泄
```

验证：`hermes mcp test n8n` → `✓ Connected`，发现 3 工具。重启 Hermes 后工具注册为
`mcp_n8n_search_workflows` / `mcp_n8n_execute_workflow` / `mcp_n8n_get_workflow_details`，
在每个会话可直接调用。

> 分工：Claude（军师）出主意 → Hermes（执行者）经此 MCP 调 n8n 工作流。
> claude.ai 网页版不支持自定义 MCP，故接 Hermes 而非网页端。

## 5. 运维排障要点

- **间歇 `503 no available server`**：这是 **Traefik 在 n8n 无就绪后端时的报错**，不是 n8n 功能被禁。
  根因多为 n8n 在 CPU 争抢下 `/healthz` 慢过探针 timeout 被摘后端。本实例已通过
  「CPU request 500m 逼调度到有余量节点 + 放宽探针 + `N8N_RUNNERS_MODE=internal`」治本（见 devops 仓库 PR #192）。
- **task runner 403 空转**：不设 `N8N_RUNNERS_MODE=internal` 时 n8n 默认按 external 期待外部 runner，
  日志刷 `Task runner connection attempt failed 403` 死循环、空载吃 ~600m CPU。已设 internal。
- **节点共租**：n8n 与 zxem mysql 可能被调度到同一 web 节点；mysql 峰值 ~916m CPU 会挤爆节点。
  靠 n8n 的 CPU request 做调度隔离，必要时 web 池自动扩容（autoscale 看 requests 不看实时用量）。
- `N8N_RELEASE_TYPE=custom` 告警、无 Python3 导致 Python task runner 启动失败 —— 均无害，不影响 JS 工作流。

## 6. 待办

- [ ] 激活 4 条工作流前，在 UI 配好各节点凭据（Arvin 本人，红线动作）。
- [ ] devops 仓库 `infra/cloudflare/k8shome.com.tf` 的 `n8n_gke` DNS 记录：`terraform apply` 已生效但待单独 commit，否则后续 `terraform plan` 报假删除差异。
