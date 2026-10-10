# 分支与发布流：feature → canary（验收）→ main（生产）

> 最后更新：2026-10-10。与 [AGENT_PIPELINE.md](AGENT_PIPELINE.md) 配套：后者讲 Agent 与门禁，本文讲分支、镜像 tag、ArgoCD 与保护规则。

## 1. 分支角色

| 分支 | 作用 | 谁能进 | 部署到 |
|---|---|---|---|
| `main` | **生产**真源 | 只经 PR：`canary → main` 晋升，或 hotfix PR | manila / cebu（`targetRevision: main`，Image Updater 追 SHA） |
| `canary` | **验收**集成分支 | 只经 PR：feature / agent PR → canary | firebird-canary（`targetRevision: canary`，tag `canary`） |
| `feat/*` `agent/*` `chore/*` | 开发 | 作者 | 无 |

```
feat/x ──PR──▶ canary ──(canary 环境验收)──PR──▶ main ──▶ manila / cebu
                 │                                  │
        ci-gke: 推 :canary                  ci-gke: 推 :<sha40> + :latest
        ArgoCD canary 自动同步              Image Updater 追 40 位 SHA → ArgoCD 同步
```

## 2. 镜像 tag（关键安全点）

| 触发分支 | `firebird-php` / `firebird-api` / `firebird-nginx` 的 tag | 谁消费 |
|---|---|---|
| `main` | `<40 位 SHA>`、`latest` | manila / cebu（Image Updater 追 SHA） |
| `canary` | `canary-<sha12>`、`canary`（浮动） | firebird-canary（`values-canary.yaml` 的 `image.tag: canary`） |

**canary 构建绝不推 40 位 SHA tag**：Image Updater 只匹配 40 位 SHA，`canary*` 不会被选中，因此未验收的镜像不可能被滚进生产。不要把 canary 的 `image.tag` 改回 `latest`（main 构建也会推 `latest`，验收环境会吃到未验收的东西）。

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
4. 把 ArgoCD `firebird-canary` 的 `targetRevision` 由 `main` 改为 `canary`（`kubectl -n argocd patch application firebird-canary --type merge -p '{"spec":{"source":{"targetRevision":"canary"}}}'`）。
5. 仓库变量 `AGENT_BASE_BRANCH=canary`（让 Dev/QA Agent 的基线与 PR 目标改为 canary；不设则仍是 main）。
6. 保护 `main`、`canary`（见 §3）。

回滚：ArgoCD `targetRevision` 改回 `main`；删除变量 `AGENT_BASE_BRANCH`；取消 canary 的保护。

## 7. 已知限制

- canary 与生产共用同一个 Redis 与 GCS 桶（数据库独立：`firebird_canary`）；验收时的会话 key 带站点前缀隔离，但缓存/附件路径未隔离。
- 晋升是「重新构建」而非「重打 tag」：同一份源码在 main 上再构建一次，镜像 digest 与 canary 不同。需要严格不可变晋升时，改为 `docker buildx imagetools create` 重打 tag。
- `main` 保护要求检查名称与 workflow job 名称一致；改 job 名称需同步改保护规则。
