# TMA 前端归档说明（2026-11-04）

> 一句话：`apps/tma/` 这个目录**不再存在于仓库**，代码在 `docs/archive/tma-legacy-2026-11-04.tar.gz`。
> 想复活，按文末「复活步骤」做，**不要**只把目录解压回来——镜像构建、门禁、根脚本三处都改过了。

## 为什么归档

Telegram Mini App 这条业务线已放弃。留着它的代价是实打实的：

- 50 个文件、9 个测试文件 101 个用例要跟着每次改动跑
- `Dockerfile.api` 为它多一个构建阶段，每次镜像构建都装一遍 vite 依赖
- 一堆文档与脚本引用它，删别的东西时容易踩到断引用（见 M-14）

## 归档时一起改了什么

| 位置 | 改动 |
| :--- | :--- |
| `apps/tma/**` | 删除（50 个文件），完整快照进 `docs/archive/tma-legacy-2026-11-04.tar.gz`（97KB，58 条目，路径前缀就是 `apps/tma/`，解包即还原到原位） |
| `deploy/docker/Dockerfile.api` | 删 Stage 1b（`tma-build`）、`COPY --from=tma-build`、`TMA_STATIC_DIR`、`VITE_GOOGLE_MAPS_API_KEY` ARG |
| `scripts/verify-task.sh` | 删 `if [ -f apps/tma/package.json ]` 整段（守卫恒为假，只会静默跳过） |
| `package.json` | 删 `dev:tma`；`build` 只构建 `services/api` |
| `.github/workflows/ci-gke.yml` | 删 `--build-arg VITE_GOOGLE_MAPS_API_KEY`（ARG 已不存在，buildx 会告警）——**属受保护路径，由 owner PR #201 处理** |
| `docs/` | `REPO_CONVENTIONS` / `REPO_MAP` / `TMA_UI` / `TMA_LOGIN_BRIDGE` / `AGENT_PIPELINE` 同步 |

## 运行时行为变化

- `/tma/` 不再由 api 镜像托管 → 返回 **404**。`server.js` 的静态托管有 `existsSync` 守卫，目录不存在就不挂载路由，**不会 500，也不影响其他端点**。
- 守卫代码没有删：复活时只需恢复构建阶段，不必再改 `server.js`。

## 仍然存活的后端部分（不在本次归档范围）

归档的是**前端**。以下仍在跑，不要一起删：

- `services/api/src/` 里的 Telegram `initData` 验签、`fbs_member_map` 写库、`/tg-api` 路由
- `docs/internal/TMA_LOGIN_BRIDGE.md` 描述的登录桥接契约（文档已加归档横幅，但契约本身仍有效）

## 复活步骤

1. 在仓库根解包：`tar xzf docs/archive/tma-legacy-2026-11-04.tar.gz` —— 包内路径就是 `apps/tma/…`，解完即回到原位，**不要**再 `mv`
2. 恢复 `Dockerfile.api` 的 Stage 1b（见归档提交的反向 diff），并重新声明 `VITE_GOOGLE_MAPS_API_KEY` ARG
3. 恢复 `verify-task.sh` 的 6.2 段（typecheck / test / build）
4. 恢复 `package.json` 的 `dev:tma`，并把 `build` 加回 `npm --prefix apps/tma run build`
5. 重新跑 `bash scripts/test-gates.sh` 与 `bash scripts/agent/gates.sh origin/canary`

## 遗留欠债

### 已清（2026-11-05）

| 欠债 | 怎么清的 | 为什么当时不能顺手做 |
| :--- | :--- | :--- |
| `deploy/helm/firebird-site/templates/ingressroute.yaml` 在 `tma.enabled` 为真时仍把 `PathPrefix(/tma)` 路由到 api | 本 PR：整条 Rule 删除。`tma.enabled` 保留——它还给 api 注入登录桥的环境变量（`deployment-api.yaml`），那部分后端逻辑仍在跑 | 与归档 PR 不同区（`deploy/` 是全局串行锁），拆开走 |
| `.agents/approved-deps.txt` 里 vue / vue-router / pinia / vant / @telegram-apps/sdk / @vitejs/plugin-vue / typescript / vite 八条仍标「apps/tma」 | 单独 PR（`owner/tma-residue`）：八行全删，全仓 `package.json` 已验 0 处引用 | Zero-Dep 门禁读 **base 分支**的这份文件（D-01）：同 PR 里自己删登记，门禁会当作没发生 |

删除 `/tma` 路由后的行为（`helm template -f values.yaml -f values-canary.yaml` 实测：渲染 975 行，
`PathPrefix(`/tma`)` 出现 0 次）：`/tma/*` 落到「同 Host 兜底」规则，由站点自己返 404 页。
对用户是等价的 404，区别在于**路由表不再声称存在一个已经不存在的服务**。

### 仍未清（需要 owner 决策，不是能顺手改的）

| 欠债 | 现状 | 为什么卡住 |
| :--- | :--- | :--- |
| `.github/workflows/ci-verify.yml` 的 **job 名**仍含「TMA 前端」 | 步骤名已由 #201 改干净，job 名保留 | job 名是 `main` 分支保护里的**必需检查上下文**。改名不会报错，只会让所有 PR 合进 `main` 时静默 `BLOCKED`（checks 全绿、merge 按钮灰）。清理必须「改 workflow」与「改分支保护」同一分钟内完成，属一次性运维动作 |

> 归档包本身是 `git add -f` 入库的：`.gitignore` 第 8 行有 `*.tar.gz`。`docs/archive/` 下其他归档包（`tg-bot-2026-10-27.tar.gz` 等）同样是强制添加。新增归档包时别忘了 `-f`，否则 `git add` 静默跳过——文件在工作区里看得见、仓库里没有。
