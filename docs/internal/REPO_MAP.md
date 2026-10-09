# 仓库目录地图

> 回答三个问题：这个目录是什么、归谁（第三方还是我们）、改它会影响什么。新增目录前先更新本文。

## 一眼看懂

```
firebird-sea/
├── webroot/          ★ 火鸟商业门户源码（第三方，不要随手改）
├── services/         ★ 我们自己的 Node 服务
├── apps/             ★ 我们自己的前端与看板
├── deploy/           ★ 一切部署相关（线上镜像、Helm、本地开发环境）
├── automation/       ★ n8n 工作流模板
├── docs/internal/    ★ 架构、流水线、部署等文档
├── scripts/            脚本（门禁、验收、安装、任务工具）
├── .github/            CI 工作流
├── .agents/            AI 团队的规范与任务规约
├── license/            商业授权文件（不读取、不打印、不修改）
├── docker-compose.yml  本地开发环境入口
├── Makefile            常用命令入口
└── AGENTS.md / README.md / package.json / .env.example
```

## 按职责分类

### 1. 第三方源码：`webroot/`
火鸟商业门户（PHP 7.4，Swoole 加密）。**不是我们写的**，约 2 万个文件，含外卖模块（`templates/waimai`、`wmsj`、`admin/waimai`、`api/handlers/waimai.*`）。

| 规则 | 说明 |
|---|---|
| 不随手改 | 必须改时只做最小补丁并写进文档（见架构决定 AD-14） |
| 我们自己的 PHP 只放两处 | `webroot/api/fbs/`（网关）与 `webroot/api/payment/usdt/`（支付插件） |
| `webroot/huoniao.so` | 商业加载器，被 `.gitignore` 排除，不在 git 里（构建可重现性问题见 `LOCAL_ACCEPT.md`） |
| `webroot/data/` | 运行时目录，却有一批文件被跟踪；不要往里放我们的东西 |

### 2. 我们自己的服务：`services/`、`apps/`
| 目录 | 是什么 |
|---|---|
| `services/api` | Node API：登录验签、收银台、汇率、（后续）对账与网关调用。路由前缀 `/tg-api` |
| `services/payment-listener` | 链上 USDT 监听器（独立部署，副本数 1） |
| `services/tg-bot` | Telegram 指挥机器人（开发者用，不是面向顾客的） |
| `apps/tma` | Telegram Mini App 前端（目前只有 `package.json`） |
| `apps/bmad-dashboard` | 任务看板的静态页面 |

### 3. 部署：`deploy/`
| 目录 | 用途 | 谁用 |
|---|---|---|
| `deploy/docker/` | **线上**镜像：`Dockerfile.web`、`Dockerfile.api`、`entrypoint-web.sh` | CI 构建、`make local-accept` |
| `deploy/helm/` | **线上**站点编排（manila、cebu、canary 的 values） | ArgoCD |
| `deploy/dev/` | **本地开发**用的 PHP 镜像与 nginx 配置 | 根目录 `docker-compose.yml` |
| `deploy/k8s-mail-server.yaml` | 邮件中继的清单 | 手工应用 |

> 以前根目录的 `docker/` 现在是 `deploy/dev/`。它和 `deploy/docker/` 不同：本地开发环境不能用来验收，验收用 `make local-accept`。

### 4. 自动化与流程
| 目录 | 用途 |
|---|---|
| `automation/n8n/workflows/` | n8n 工作流模板（导入后需在 UI 绑定凭据） |
| `.github/workflows/` | CI：门禁、构建、AI 开发与验收智能体、看板同步 |
| `.agents/` | 工程规范（`RULES.md`）、验收规约、`tasks/` 任务规格；`tasks` 为遗留，新需求走 GitHub Issue |
| `scripts/agent/` | 流水线脚本（Agent 分支不得改动） |

### 5. 文档：`docs/internal/`
| 想了解 | 看这份 |
|---|---|
| 整体架构 | `ARCHITECTURE.md`、`MASTER_FRANCHISE_ARCHITECTURE.md` |
| 多 Agent 流水线与配置 | `AGENT_PIPELINE.md` |
| 外卖模块与路由 | `WAIMAI_PLUGIN_SPEC.md` |
| 镜像不可变与发布 | `IMMUTABLE_RELEASE_SPEC.md` |
| 火鸟源码结构 | `CODEBASE_STRUCTURE.md` |
| 支付 | `PAYMENT_PLUGIN_SPEC.md`、`COINS_PH_INTEGRATION.md` |
| n8n | `N8N_DEPLOYMENT.md` |
| 本地化 | `LOCALIZATION_PH.md` |

## `scripts/` 速查（不挪位置，避免破坏 CI 与文档引用）
| 类别 | 脚本 |
|---|---|
| 门禁与验收 | `agent/gates.sh`、`verify-task.sh`、`acceptance-runner.sh`、`test-helm.sh`、`dev-check.sh` |
| 安装与初始化 | `setup-base.sh`、`setup-n8n.sh`、`init-firebird-db.php`、`seed_*.py` |
| 任务与看板 | `dispatch-task.js`、`bmad-spec-gen.js`、`github-sync.js`、`deploy-release.sh`、`clean-bloat.sh` |
| 智能体与 MCP | `agent-run.sh`、`agent/*`、`hermes-accept.sh`、`mcp-*.js` |
| 其他 | `test-coins-ph.js`、`mail-relay-server.js` |

## 三条规则
1. **线上与本地分开**：`deploy/docker`、`deploy/helm` 是线上；`deploy/dev`、`docker-compose.yml` 是本地开发。
2. **第三方与自己的分开**：`webroot/` 之外是我们的；`webroot/` 里我们只动 AD-14 指定的两个目录。
3. **不进 git 的东西**：`.env`、`mcp_config.json`、`webroot/huoniao.so`、`deploy/dev/nginx/ssl/` 下的本地证书。
