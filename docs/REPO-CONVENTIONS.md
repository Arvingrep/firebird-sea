# 仓库规范（Repository Conventions）

> 生效日期：2026-10-27
> 适用对象：**人 + 所有 AI Agent**。任何 Agent 在动手前必须先读这一页。
> 为什么有这份文件：2026-10 的审计发现仓库里躺着 45 个同步冲突副本、270MB 旧安装包、
> 9 个 n8n 工作流里 6 个的目标系统早已不存在。这些不是技术问题，是**没有边界**造成的。
> 本文件把边界写死，机器负责守（`scripts/repo-hygiene.sh` + CI `Repo Hygiene`）。

---

## 一、总原则

**一个文件进仓库，必须能回答三个问题：**

1. 它属于哪个运行时？（PHP 站点 / TG 前端 / Node 服务 / n8n / 部署 / 文档）
2. 谁在读它？（有人在跑 / 有 CI 在跑 / 只有人看）
3. 它失效时会怎样？（业务中断 / 门禁红 / 无感）

**答不出第三条的，不要入库。** 无感失效的东西最容易变成化石。

---

## 二、目录职责表

| 目录 | 职责 | 运行时 | 允许谁改 |
|---|---|---|---|
| `webroot/` | 火鸟 PHP 主站（H5 + 后台 + API） | k8s `zxem-gke-h5` | 后端 Agent |
| `apps/tma/` | Telegram Mini App（Vue 3 + Vite） | 静态托管 `/tma/` | 前端 Agent |
| `services/api/` | TG 客户端 API（WebApp Auth、结算） | k8s `/tg-api` | 后端 Agent |
| `services/news-sync/` | 资讯抓取 / AI 去重 / 发布重试 | n8n 容器内挂载 | 后端 Agent |
| `services/payment-listener/` | TRC-20 USDT 链上监听 | 独立容器（当前关闭） | 待定，改动前先问 |
| `automation/n8n/` | n8n 工作流源码 + **REGISTRY.md 登记表** | n8n 实例 | 自动化 Agent |
| `deploy/` | Helm / K8s / Docker 部署清单 | ArgoCD + Image Updater | 运维 Agent |
| `.github/` | CI 流水线 | GitHub Actions | 运维 Agent |
| `scripts/` | 门禁、部署、数据种子脚本 | 人 + CI | 按需，改动要跑 `test-gates.sh` |
| `docs/` | 文档 + `archive/` 归档包 | 只有人看 | 任何人 |
| `webroot/templates/`、`webroot/static/` | 火鸟历史模板与静态资产 | 站点 | **只读**，不新增 |

### 已下线，不要重新引入

| 东西 | 下线时间 | 原因 |
|---|---|---|
| `_bmad/`、`_bmad-output/`、BMAD 技能包（`.claude/skills/bmad-*` 29 个）、`bmad-*` workflow | 2026-10-27 | 流程已沉淀成真实代码，脚手架无用 |
| `scripts/acceptance/`、`acceptance-runner.sh`、`agent/{dev,story}.sh`、`agent-run.sh` | 2026-10-27 | 施工侧 Agent 已下线；Story 验收体系依赖的脚本已不存在 |
| `scripts/deploy-release.sh`（`make release`） | 2026-10-27 | 「假发布」：只 helm template + 打印成功卡片，不 apply、不推镜像、不触发 ArgoCD |
| `scripts/mcp-acceptance-test.js`（`make test-mcp`） | 2026-10-27 | 断言的是已停用的 4 个废弃工作流必须 active，逻辑与现状相反，必然失败 |
| `services/tg-bot/`、6 个断链 n8n 工作流 | 2026-10-27 | 目标系统均不存在 |
| `agent-dev.yml`、`dispatch-task.js`、`hermes-accept.sh` | 2026-10-27 | 单线串行，已被多 Agent 直接开发取代 |
| `services/tg-bot/` | 2026-10-27 | 三处全断（调已删脚本 + webhook 不存在 + 生产未部署） |
| `tg_photo_menu_to_json` / `usdt_payment_alert` / `sentry_error_to_tg_ai_alert` / `tg_voice_to_linear_spec` / `arvino_github_issue_to_run` / `tg_to_github_issues_project` | 2026-10-27 | 目标系统均不存在，见 `automation/n8n/REGISTRY.md` |
| `backup_configs/`、`.agent-runs/`、`.n8nac/` | 2026-10-27 | 本地临时产物，已进 `.gitignore` |

归档包在 `docs/archive/`，需要时解包即可，**不要重建目录**。

---

## 三、新增文件往哪放（决策树）

```
新文件
├─ 是站点页面 / PHP 接口？        → webroot/ 对应子目录
├─ 是 TG 前端页面 / 组件？         → apps/tma/src/pages|components/
├─ 是独立 Node 服务？              → services/<新服务名>/
├─ 是 n8n 工作流？                 → automation/n8n/workflows/ + 更新 REGISTRY.md
├─ 是部署清单？                    → deploy/
├─ 是脚本？                        → scripts/（门禁类）/ scripts/ 下按用途命名
└─ 是说明文档？                    → docs/（过程文档放 docs/internal/）
```

**禁止**在仓库根目录新增文件。根目录只允许：`README.md`、`Makefile`、`docker-compose.yml`、
`AGENTS.md`（n8n-as-code 生成）、`package.json`、`.gitignore`、`.env.example`。

---

## 四、入库红线（CI 会拦）

| 红线 | 检测方式 |
|---|---|
| 同步冲突副本：`xxx 2.md`、`xxx (1).py`、`xxx conflicted copy` | `repo-hygiene.sh` |
| 临时目录：`.agent-runs/`、`backup_configs/`、`node_modules/`、`downloads/`、`.n8nac/` | `repo-hygiene.sh` |
| 新增文件 > 5MB | `repo-hygiene.sh`（存量火鸟模板资产不追溯） |
| 明文密钥 / token | `ci-verify.yml` 密钥门禁 |
| n8n 工作流改了但没更新 `REGISTRY.md` | 人工 + Review |

---

## 五、多 Agent 并行作业规则

仓库支持多个 Agent 同时干活，但**必须按目录分区**，否则并行会互相踩。

### 分区（一个 Agent 一次只占一个区）

| 区 | 路径 | 可并行的前提 |
|---|---|---|
| A 前端 | `apps/tma/**` | 独立，可随时并行 |
| B PHP 后端 | `webroot/api/**`、`webroot/include/config/**` | 独立，可随时并行 |
| C 自动化 | `automation/n8n/**` | 独立，但同一工作流同一时间只能一个 Agent 改 |
| D 服务 | `services/**` | 同服务内串行，跨服务并行 |
| E 部署 | `deploy/**`、`.github/**` | **全局串行**——部署变更必须单线 |
| F 文档 | `docs/**` | 独立，可随时并行 |

### 强制规则

1. **跨区改动 = 拆 PR**。一个 PR 只动一个区。跨区（如前端 + API）必须两个 PR，先后有序，PR 描述里写明依赖。
2. **同一文件同一时间只有一个 Agent 持有**。开工前先 `git pull`，改完尽快推，不要长时间占着分支。
3. **`deploy/` 与 `.github/` 是全局锁**。任何 Agent 动这两处，其他 Agent 必须等待。
4. **改接口必同步契约**：`webroot/api/**` 改动要跑 `node scripts/api-contract-check.js`。
5. **改 n8n 工作流必更登记表**：`automation/n8n/REGISTRY.md` 是唯一真相源，实例与仓库必须一致。

---

## 六、提交前必跑

```bash
bash scripts/repo-hygiene.sh          # 仓库卫生（新增文件是否合规）
bash scripts/agent/gates.sh           # 业务门禁（diff / Docs-as-Code / Zero-Dep / 密钥 / 语法 / Helm）
bash scripts/test-gates.sh            # 门禁自测（改了 scripts/ 或 .github/ 时必跑）
node scripts/api-contract-check.js    # 改了 PHP 接口时必跑
```

CI 会自动跑前两项，但**本地先跑能少一轮返工**。

---

## 七、月度体检（每月第一个工作日）

```bash
bash scripts/repo-hygiene.sh                                  # 全仓模式
# 核对线上与登记表是否一致
curl -H "X-N8N-API-KEY: $N8N_API_KEY" "$N8N_BASE_URL/api/v1/workflows?limit=50" | \
  python3 -c "import json,sys;[print(w['id'],w['name'],w['active']) for w in json.load(sys.stdin)['data']]"
```

体检要回答三个问题：
1. 仓库里有没有文件超过 90 天没被任何东西引用？
2. 线上跑的东西，仓库里都有源码吗？仓库里的源码，线上都在跑吗？
3. 有没有新的 `.tar.gz` / 备份目录 / 副本混进来？

**任何一项答不上来，说明规范被绕过了，当场修。**

---

## 八、效力

- 本文件与 `automation/n8n/REGISTRY.md` 优先于任何 Agent 的默认习惯。
- 与本文件冲突的旧文档（`docs/internal/` 下的历史设计稿）以本文件为准。
- 修改本文件需 PR + 人工确认，不允许 Agent 自行放宽红线。
