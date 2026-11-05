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

## 遗留欠债（需要 owner 单独处理）

`.agents/approved-deps.txt` 里 vue / vue-router / pinia / vant / @telegram-apps/sdk / @vitejs/plugin-vue / typescript / vite 这些条目仍标着「apps/tma」，实际已无使用者。

**没在归档 PR 里改**，因为 Zero-Dep 门禁读的是 **base 分支**上的这份文件（D-01）：同一个 PR 里自己删登记，门禁会当作没发生。清理要单独提 PR，并且只能由 owner 做——该文件属受保护路径。

### 另外两笔

| 欠债 | 现状 | 处理 |
| :--- | :--- | :--- |
| `deploy/helm/firebird-site/templates/ingressroute.yaml` 在 `tma.enabled` 为真时仍把 `PathPrefix(/tma)` 路由到 api | canary 的 values 里 `tma.enabled` 是真，而镜像里已无 `/app/tma` → 该路由指向 404 | 要么在 ingress 里去掉 `/tma` 路由（推荐，路由应当反映真实存在的服务），要么在 values 里关掉 `tma.enabled`。两者都要动 `deploy/`，可在下一个部署侧 PR 一起做 |
| `.github/workflows/ci-verify.yml` 的 job 名与步骤名仍写「TMA 前端」「含 apps/tma 类型检查」 | job 名是 main 的必需检查上下文，不能改；步骤名由 #201 改 | 步骤名随 #201 合入解决；job 名作为长期欠债登记，清理需同时改分支保护规则 |

> 归档包本身是 `git add -f` 入库的：`.gitignore` 第 8 行有 `*.tar.gz`。`docs/archive/` 下其他归档包（`tg-bot-2026-10-27.tar.gz` 等）同样是强制添加。新增归档包时别忘了 `-f`，否则 `git add` 静默跳过——文件在工作区里看得见、仓库里没有。
