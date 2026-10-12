# 一人 AI 团队工程规范 (Agent Rules)

> 本文件是所有参与该仓库编码的 AI Agent（如 Antigravity, Cursor, Claude Code 等）必须严格遵守的准则。

---

## 1. 核心铁律 (Non-Negotiable Rules)

1. **Docs as Code (强制文档同步卡点)**：
   - 只要任何代码提交涉及：① 数据库表结构/Schema 变更；② API 新增或变更；③ 环境变量增删；④ 支付与对账流程调整。
   - **必须在同一变更中同步更新 `/docs/internal` 或 `/docs/user` 下的相应 Markdown 文档**。严禁“只写代码不写文档”。
2. **资金与私钥安全禁区**：
   - 前端代码及 TMA (Telegram Mini App) 绝对不能出现任何助记词、私钥或具有资金转移权限的 API Key。
   - 链上转账监听只使用公开只读 RPC / TronGrid Read-Only Key，冷钱包私钥严禁写入代码库。
3. **极简设计原则 (KISS & DRY)**：
   - 一人团队没有冗余运维人力，优先使用成熟轻量方案（如优先网关模式、Serverless/边缘运行前端）。避免盲目引入复杂的微服务或过度设计。

---

## 2. 代码组织与模块划分

```
firebird-sea/
├── apps/
│   └── tma/                 # Telegram Mini App 前端 (Vue3/React + Vite + TailwindCSS)
├── services/
│   ├── api/                 # 主后端核心服务 (Fastify/Express TypeScript)
│   └── payment-listener/    # USDT 链上交易监听与自动对账独立脚本
├── automation/
│   └── n8n/workflows/       # n8n 工作流模板导出 (JSON)
├── docs/
│   ├── internal/            # 架构、部署、运维与环境配置文档
│   └── user/                # 商家入驻 SOP、骑手端与用户端指南
└── .agents/                 # AI Agent 规则与任务规约
```

---

## 3. 测试与验证标准

- **API 接口**：需具备标准 JSON 响应结构 `{ success: boolean, data?: any, error?: { code: string, message: string } }`。
- **TG 免密鉴权**：凡受保护的接口必须校验 Telegram `initData` 的 HMAC-SHA256 签名，未通过者直接返回 401。
- **双语与双币**：所有业务字段需支持多语言展示（zh / en），金额计算必须显式区分 `PHP`（法币单位，两位小数）与 `USDT`（加密货币，最高 6 位小数）。

---

## 4. 防臃肿代码准则 (Anti-Bloat Code Protocol)

1. **零冗余依赖 (Zero-Dep Rule)**：
   - 严禁擅自引入未批准的第三方重型 npm/composer 包（如仅为做一个 MD5/SHA256 引入大型库）。
   - 优先使用 Node.js 原生 API (`node:crypto`, `node:https`, `node:fs`) 及 PHP 内置标准库。
2. **KISS 原则与增量控制**：
   - 杜绝过度设计（严禁为 10 行逻辑写 5 层抽象类或复杂工厂模式）。
   - 单 PR 代码增量 ≤ 1200 行（gates.sh 强制，不含 docs/、.agents/、_bmad-output/）；单次提交建议 ≤ 200 行。凡火鸟系统后台已有的配置项，严禁重新写代码造轮子。
3. **零垃圾文件与死代码**：
   - 严禁遗留 `.bak`、`test_*.php`、未引用的僵尸函数或生产环境调试输出（如 `console.log`, `var_dump`）。
   - 任何开发任务完成后，必须通过 Acceptance Agent 审查；验收未通过前禁止合并。

## 5. 分支与发布（Branch & Release）

1. **`main` 是生产**，受保护：只经 PR 变更，禁止强推与删除；必需检查为「🔒 确定性门禁」与「🧪 verify-task」。
2. **功能与 Agent 的 PR 一律以 `canary` 为目标分支**（`AGENT_BASE_BRANCH=canary`），合并后在 canary 环境验收；
   验收通过后才允许开 `canary → main` 的晋升 PR。**严禁**绕过 canary 把未验收改动直接合入 main（hotfix 例外，且合并后必须回灌 canary）。
3. **镜像 tag 纪律**：canary 构建只能推 `canary` / `canary-<sha12>`，**绝不推 40 位 SHA tag**（Image Updater 追 40 位 SHA，会把未验收镜像滚进生产）；`values-canary.yaml` 的 `image.tag` 不得改回 `latest`。
4. 受保护路径（`.github/`、`scripts/agent/`、`scripts/acceptance/`、`.agents/`）只能由 owner 修改；Agent 分支触碰即门禁 FAIL。
5. 详见 `docs/internal/RELEASE_FLOW.md`。

## 6. GitOps 铁律：一切变更以 Git 为准，kubectl 只读

> 适用于所有 Agent（Dev / QA / Acceptance）与人。**集群里的期望状态 = Git（`main` 生产 / `canary` 验收）**；
> 集群只是 Git 的投影，由 CI 构建、ArgoCD 同步。凡是不在 Git 里的改动，下一次同步就会被 `selfHeal` 抹掉，且没有审计记录。

### 6.1 唯一的变更路径
```
改 Git（chart / values / 配置 / 镜像 tag 的来源）→ PR → 门禁 + 验收 → 合并 → CI 构建 → ArgoCD 自动同步
```
副本数、资源、探针、环境变量、`configVars` / `configOverrides` / `configLock`、Ingress、CronJob、镜像版本……**全部**这样改。
想改线上行为？去改 `deploy/helm/firebird-site/` 与对应 `values-*.yaml`，开 PR。

### 6.2 `kubectl`（及 ArgoCD / 集群类 MCP 工具）只用于「查询」
| 允许（只读） | 禁止（写） |
|---|---|
| `get` / `describe` / `logs` / `events` / `top` / `explain` | `apply` / `create` / `edit` / `patch` / `replace` |
| `get application` / 看 ArgoCD 同步状态、历史、资源树 | `delete`（含删 Pod、删 PVC） / `scale` / `rollout restart` / `set image` |
| 用日志与事件定位问题，把结论写进 PR / Issue | 在 Pod 里 `exec` 改文件、改配置、装包 |
| 生产环境的 `exec` 只读诊断需 owner 授权（权限策略会拦截） | 改 ArgoCD Application / 暂停 Image Updater / 手动触发 sync |

- 发现线上问题 → **先用 `logs` / `describe` / `events` 找原因 → 写成 Git 变更 → PR**。不要「顺手」在集群里修。
- 「修复没生效，需要重启 Pod」也是 Git 问题：说明镜像 tag 用了可变 tag（如 `canary` / `latest`），应改为不可变 tag（SHA），让 Git 变更自然触发滚动，而不是手动删 Pod。
- Secret 不入 Git：由 owner 一次性创建（如 `firebird-storage-secret`、`firebird-db-secret`），Agent 不创建、不读取其值。

### 6.3 唯一的例外：生产应急（仅 owner）
- 仅 owner 本人、仅为止血（如重启卡死的 Pod、暂停 Image Updater）可以直接操作集群，**Agent 一律不得**。
- 事后必须补一个 PR 把「该有的状态」写回 Git，并在 PR 说明里记录：做了什么、为什么、时间。
- 手改的内容不会被 ArgoCD 保留：`selfHeal` 会回滚漂移。不要依赖手改。

### 6.4 自检清单（合并前问自己）
1. 这次改动在 Git 里能看到吗？（不在 Git = 不存在）
2. 我有没有用过 `kubectl` 的写操作？有 → 改成 PR，或按 6.3 补记录。
3. 回滚方式是「revert 这个 PR」吗？不是 → 设计有问题。

## 7. 自主推进铁律（Autonomy — owner 授权，2026-10-12）

> Arvin 的时间是最稀缺资源。**凡是本规范已覆盖的事项，Agent 不得再向 owner 请示，直接按规范执行。**

1. **Epic/Story 自动续接**：上一个 Epic 验收通过（或其产物已合入 canary）后，Agent **自动启动下一个 Epic**，沿用标准约束：新建 `feature/<epic-slug>` 分支、只本地提交、PR 目标 canary、不碰受保护路径。禁止出现「要不要我开始下一个 Epic？」这类请示。
2. **默认保守方案先做**：遇到可选方案分歧时，选风险最小的先实现并在 PR 说明里注明备选，不停下来等拍板。
3. **仅以下四类才升级 owner**（其余一律自行推进）：
   - 费用变化（新付费服务、配额升级）
   - 架构脊柱/系统边界/技术栈变更
   - 资金路径、支付、密钥相关改动
   - 需要放宽本规范或门禁本身
   **升级豁免（确认题不升级）**：即使命中上述类别，只要候选方案中存在与既有 AD/RULES/历史决定一致的选项（不新增依赖、不新增密钥持有者、不推翻既有 AD），**直接选该选项执行**，在 PR 说明里记一行「依据 AD-xx/既有约定自行决策」即可。只有所有选项都要求推翻既有决定时才升级。
4. **升级时的格式**：一句话问题 + 两个可选项 + 自己的推荐，不开放式提问。
5. 请示型空转视为缺陷：同一问题重复请示两次而不推进，按 QA 打回处理。
