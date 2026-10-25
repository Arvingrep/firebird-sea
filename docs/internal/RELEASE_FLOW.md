# 分支与发布流：feature → canary（验收）→ main（生产）

> 最后更新：2026-10-10。与 [AGENT_PIPELINE.md](AGENT_PIPELINE.md) 配套：后者讲 Agent 与门禁，本文讲分支、镜像 tag、ArgoCD 与保护规则。

## 0. 原则：一切以 Git 为准

集群期望状态 = Git（`main` → 生产，`canary` → 验收）。**所有变更只能通过 PR 修改 Git**，由 CI 构建、ArgoCD 同步；`kubectl` 与 ArgoCD 工具只用于查询（logs / get / describe / events）。生产应急仅 owner 可手动操作，事后必须补 PR。详见 [`.agents/RULES.md`](../../.agents/RULES.md) 第 6 节。

## 1. 分支角色

| 分支 | 作用 | 谁能进 | 部署到 |
|---|---|---|---|
| `main` | **生产**真源 | 只经 PR：`canary → main` 晋升，或 hotfix PR | manila / cebu（`targetRevision: main`，Image Updater 追 SHA） |
| `canary` | **验收**集成分支 | 只经 PR：feature / agent PR → canary | firebird-canary（`targetRevision: canary`，Image Updater 追 `canary-<sha12>`） |
| `feat/*` `agent/*` `chore/*` | 开发 | 作者 | 无 |

```
feat/x ──PR──▶ canary ──(canary 环境验收)──PR──▶ main ──▶ manila / cebu
                 │                                  │
        ci-gke: 推 :canary-<sha12>          ci-gke: 推 :<sha40> + :latest
        Image Updater CR 追 canary-<sha12>  Image Updater 追 40 位 SHA → ArgoCD 同步
        → ArgoCD 同步（合并即上线）
```

## 2. 镜像 tag（关键安全点）

| 触发分支 | `firebird-php` / `firebird-api` / `firebird-nginx` 的 tag | 谁消费 |
|---|---|---|
| `main` | `<40 位 SHA>`、`latest` | manila / cebu（Image Updater 追 SHA） |
| `canary` | `canary-<sha12>`、`canary`（浮动） | firebird-canary（`values-canary.yaml` 的 `image.tag: canary`） |

**canary 构建绝不推 40 位 SHA tag**：Image Updater 只匹配 40 位 SHA，`canary*` 不会被选中，因此未验收的镜像不可能被滚进生产。不要把 canary 的 `image.tag` 改回 `latest`（main 构建也会推 `latest`，验收环境会吃到未验收的东西）。

> ✅ **缺口已修复（2026-10-25）**：canary 现由 Image Updater v1.3 的 `ImageUpdater` CR 自动接管。PR 合并进 canary → CI 推 `canary-<sha12>` → updater 按 `allowTags: regexp:^canary-[0-9a-f]{12}$` + `updateStrategy: newest-build` 发现新镜像 → 写回 Application 的 helm 参数（`image.tag` / `api.image.tag` / `nginx.image.tag`）→ ArgoCD 自动同步滚动。**合并即上线，无需人工步骤。**
>
> 配置位于 ArgoCD 集群（`mac-mini-orbstack` / `argocd` ns）的 `ImageUpdater/firebird-canary` CR，与 `firebird-manila` CR 同构（manila 追 40 位 SHA，canary 追 `canary-<sha12>`，二者模式互不重叠，未验收镜像不可能滚进生产）。CR 状态验证：`kubectl --context mac-mini-orbstack -n argocd get imageupdaters` 应显示 firebird-canary Ready 且 `images_considered=3, errors=0`。
>
> ⚠ **两笔遗留债务**：① `Application/firebird-canary`（含其 helm 参数覆盖）是**手工 `kubectl apply` 的**，清单不在本仓库——重建集群时按 `argocd-image-updater` CR + 本节参数重建；② v1.3 控制器只认 `ImageUpdater` CR，**不再读 Application 上的旧式注解**，不要往 Application 上加 `argocd-image-updater.argoproj.io/*` 注解（无效）。

## 3. 分支保护

| 规则 | `main` | `canary` |
|---|---|---|
| 必须经 PR | ✅（0 个必需审批：一人团队） | ✅ |
| 必需状态检查 | `🔒 确定性门禁`、`🧪 verify-task（…）` | 同左 |
| 禁止强推 / 禁止删除 | ✅ | ✅ |
| 管理员绕过 | ✅（`enforce_admins=false`，仅应急） | ✅ |

门禁「增量 ≤ 1200 行」对 `canary → main` 的晋升 PR 豁免（改动已在进入 canary 时逐个过门禁），其余门禁照常。

## 4. 日常流程

1. `feat/*`（或 Agent 的 `agent/issue-*`）→ PR 目标 **canary** → 门禁 + verify-task（+ Agent QA）→ 合并。
2. push `canary` → `ci-gke` 构建 `:canary` → ArgoCD 同步 firebird-canary → **在 canary.fbird.men 验收**（冒烟 Job 会先挡一道）。
3. 验收通过 → 开 `canary → main` 的 PR（标题建议 `release: <日期> <摘要>`）→ 门禁通过 → 合并。
4. push `main` → `ci-gke` 构建 `<sha>` + `latest` → Image Updater（≤2 分钟）→ ArgoCD 同步 manila。
5. 验收不通过：在 canary 上继续提 PR 修复；**不要**往 main 直接补丁（hotfix 例外，见下）。

## 5. Hotfix（生产故障）

- 允许直接 PR → `main`（仍需过检查）。合并后**必须**回灌：`main → canary`（`git merge --ff-only` 或 PR），否则下次晋升会冲突/回退修复。
- 紧急绕过保护仅限 owner，并在事后补 PR 记录。

## 6. 一次性启用步骤（顺序重要）

1. 合并本流程的 PR（目前 main 仍是唯一分支）。
2. 创建 `canary` 并与 main 对齐：`git push origin main:refs/heads/canary`。**先别保护 canary**——此时它还需要一次对齐。
3. 等 `canary` 的 `ci-gke` 构建成功（确认 `firebird-php:canary`、`firebird-nginx:canary`、`firebird-api:canary` 已推送）。
4. 把 ArgoCD `firebird-canary` 的 `targetRevision` 由 `main` 改为 `canary`——**在 Application 清单所在的仓库里改并走 PR**（homelab `apps/firebird-*/application-gke.yaml`；若该 Application 当初是手工 `kubectl apply` 的，先把清单提交进 homelab 仓库再改），不要 `kubectl patch`。
5. 仓库变量 `AGENT_BASE_BRANCH=canary`（让 Dev/QA Agent 的基线与 PR 目标改为 canary；不设则仍是 main）。
6. 保护 `main`、`canary`（见 §3）。

回滚：ArgoCD `targetRevision` 改回 `main`；删除变量 `AGENT_BASE_BRANCH`；取消 canary 的保护。

## 7. 已知限制

- canary 与生产共用同一个 Redis 与 GCS 桶（数据库独立：`firebird_canary`）；验收时的会话 key 带站点前缀隔离，但缓存/附件路径未隔离。
- 晋升是「重新构建」而非「重打 tag」：同一份源码在 main 上再构建一次，镜像 digest 与 canary 不同。需要严格不可变晋升时，改为 `docker buildx imagetools create` 重打 tag。
- `main` 保护要求检查名称与 workflow job 名称一致；改 job 名称需同步改保护规则。
