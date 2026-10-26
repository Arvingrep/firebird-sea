# 多 Agent 研发流水线（n8n → GitHub CI → ArgoCD CD）

> 最后更新：2026-10-10 · 落地 `BMAD_AUTOMATION_PIPELINE_ARCHITECTURE.md` 的方案 C（外环 n8n / 内环 GitHub + 双 Agent）。
>
> **分支与发布**：Agent PR 的目标分支已可配置（`AGENT_BASE_BRANCH`，默认 `main`；canary 验收流程启用后设为 `canary`），生产 `main` 只接收 `canary → main` 的晋升 PR。分支角色、镜像 tag、保护规则与启用步骤见 [RELEASE_FLOW.md](RELEASE_FLOW.md)。
>
> **GitOps 铁律**：一切变更以 Git 为准，`kubectl` / ArgoCD 工具只用于**查询**（logs、get、describe、events）。写操作只能走 PR；生产应急仅 owner、事后补 PR。详见 [`.agents/RULES.md`](../../.agents/RULES.md) 第 6 节。
>
> **唯一真源仓库是 GitHub `Arvingrep/firebird-sea`。不存在任何官方镜像/副本仓库。**
> `git.k8shome.com/gitea_admin/firebird-sea` 是 2026-10-16 一次性「验收 Gitea Actions 能否替代 GitHub Actions」的实验快照，**已于 2026-10-23 被 Arvin 明确放弃**，`mirror: false`（不自动同步，两边会静默分叉）。
> 该实验期间 ArgoCD `firebird-canary` 的 `repoURL` 曾被命令式改到这个 Gitea 仓库（且从未在 `devops/gitops/homelab` 里声明过），导致 canary 环境停滞 4 天未更新且不受 GitOps 管控；已在 2026-10-23 修复（`apps/firebird-canary/application-gke.yaml` 补齐声明，`repoURL` 收回 GitHub）。
> **任何 agent/人工都不要再 push 代码、开 PR、或把任何 ArgoCD Application 的 `repoURL` 指向 `git.k8shome.com/gitea_admin/firebird-sea`**——该仓库只作历史存档保留，不接收新提交。发现 ArgoCD Application 的 `spec.source.repoURL` 不是 `git@github.com:Arvingrep/firebird-sea.git` 时，视为配置漂移，立即按 `devops/gitops/homelab` PR 流程修复并上报。

## 1. 全链路

```mermaid
sequenceDiagram
    autonumber
    actor Boss as Arvin (TG)
    participant N8N as n8n (GKE)
    participant GH as GitHub Issues/PR
    participant DEV as Dev Agent<br/>(claude, 本机 runner)
    participant GATE as 确定性门禁<br/>(ubuntu runner)
    participant QA as QA Agent<br/>(codex 只读, 本机 runner)
    participant CI as ci-gke.yml
    participant IU as Image Updater (hub)
    participant ARGO as ArgoCD → GKE

    Boss->>N8N: 语音/文字需求
    N8N->>GH: 建 Issue（标签 agent:dev）
    GH->>DEV: agent-dev.yml
    DEV->>GH: 推 agent/issue-N + PR（Closes #N, agent:qa）
    GH->>GATE: ci-verify.yml / gates
    GATE->>QA: agent-qa（门禁失败也跑）
    alt REJECTED（≤3 次）
        QA->>GH: 缺陷清单评论 + issue 重打 agent:dev
        GH->>DEV: 返工（同分支，带 QA 意见）
    else ACCEPTED
        QA->>GH: squash 合并（--match-head-commit）
        GH->>CI: push canary → build :canary（验收）；晋升后 push main → build+push GAR <sha>
        CI->>N8N: image_pushed
        IU->>ARGO: 发现新 SHA → 改 Application helm 参数
        ARGO->>N8N: PostSync 钩子 deployed
    end
    N8N->>Boss: 每个阶段一条 TG
```

## 2. 组件与文件

| 环节 | 位置 | 说明 |
|---|---|---|
| 需求入口 | `automation/n8n/workflows/tg_to_github_issues_project.json` | TG → Gemini 脱水 → Issue，自带 `agent:dev` |
| 事件播报 | `automation/n8n/workflows/agent_pipeline_events_to_tg.json` | Webhook `POST /webhook/firebird-agent-event` → TG |
| Dev Agent | `.github/workflows/agent-dev.yml` → `scripts/agent/dev.sh` | 默认 `claude -p`，限定工具集，不能改 `.github/`、`scripts/agent/` |
| 确定性门禁 | `.github/workflows/ci-verify.yml` → `scripts/agent/gates.sh` | 只看分支 diff：非空、增量 ≤1200、Docs-as-Code、Zero-Dep、密钥、调试残留、语法、Helm |
| QA Agent | `ci-verify.yml` job `agent-qa` → `scripts/agent/qa.sh` | 默认 `codex exec -s read-only`（与 Dev 不同厂商）；JSON 裁定，解析失败即打回 |
| ↳ 打回分支 | `qa.sh` REJECTED | 重打 `agent:dev` **之前**先查 issue 标签：已带 `agent:blocked`（Dev 侧返工上限用尽）则摘掉 `agent:qa`、追加一条说明评论（带 `<!-- agent-blocked-limit -->` 标记，已有则跳过，不刷屏）+ `notify blocked`，不再重排返工；取不到标签按未 blocked 处理（fail-open），本次验收仍 `exit 1` |
| 构建 | `.github/workflows/ci-gke.yml` | push main → GAR `firebird-php/api/nginx:<sha40>` + `latest`；push canary → `:canary` + `:canary-<sha12>`（**不推 40 位 SHA**，防 Image Updater 误滚生产）；纯 docs/任务变更不构建 |
| 发布 | homelab `platform/argocd-image-updater` + `apps/firebird-manila/application-gke.yaml` | Image Updater v1（CRD）追 40 位 SHA tag，write-back=argocd；Application 自动同步 |
| 上线通知 | `deploy/helm/firebird-site/templates/job-notify-deployed.yaml` | ArgoCD PostSync Job，`deployNotify.webhook` 为空则不创建 |

## 3. 标签状态机

| 标签 | 含义 | 谁打 |
|---|---|---|
| `agent:dev` | 待 Dev Agent 施工（打上即触发） | n8n / 人 / QA 打回 |
| `agent:qa` | PR 等待 QA | Dev Agent |
| `qa:accepted` / `qa:rejected` | QA 裁定 | QA Agent |
| `agent:blocked` | 空交付 / CLI 失效 / 分支冲突 / 用例已绿 / 打回 ≥ `AGENT_MAX_ATTEMPTS`，需人工 | Dev Agent 打（QA 读到即停止自动返工）；Dev **正常交付成功时自动摘掉** |

## 4. 配置（GitHub → Settings → Secrets and variables → Actions）

| 类型 | 名称 | 必填 | 说明 |
|---|---|---|---|
| secret | `AGENT_GH_TOKEN` | ✅ | fine-grained PAT（本仓库 Contents / Issues / Pull requests 读写）。**不能用 `GITHUB_TOKEN`**：它推的提交/开的 PR/打的标签不会触发后续 workflow |
| var | `N8N_AGENT_EVENT_WEBHOOK` | 建议 | `https://n8n.k8shome.com/webhook/firebird-agent-event` |
| secret | `N8N_AGENT_EVENT_TOKEN` | 建议 | 事件 webhook 的 Header Auth token（`X-Firebird-Token`），与下方 n8n 凭据、GKE Secret 三处一致 |
| var | `AGENT_AUTO_MERGE` | | 默认 `1`；设 `0` 即改为「QA 通过后人工合并」 |
| var | `AGENT_MAX_ATTEMPTS` | | QA 打回上限，默认 `3` |
| var | `AGENT_BASE_BRANCH` | | Dev Agent 的基线与 PR 目标分支，默认 `main`；canary 流程启用后设为 `canary`（QA/回写取 PR 的实际目标分支，无需再设）。**填裸分支名**（`canary`，不要写 `origin/canary`）：`lib.sh` 与 `Makefile` 都自行拼 `origin/` 前缀，误填前缀虽会被归一，但别依赖它 |
| var | `DEV_AGENT_CMD` / `QA_AGENT_CMD` | | 覆盖默认 agent 命令（按 shell 语法 `eval` 成数组，**等同于在 runner 上执行任意命令**——仅 owner 可设，勿开放给他人；提示词走 stdin；`QA_AGENT_CMD` 需以输出文件参数结尾，如 `... -o`） |
| secret | `GCP_SA_KEY` | ✅ | 已有，CI 推 GAR |

本机 runner：`scripts/agent/setup-runner.sh`（标签 `firebird-agent`，launchd 常驻，复用本机 claude/codex 登录态）。

n8n / GKE 侧：
- 导入 `agent_pipeline_events_to_tg.json` 后：Webhook 节点绑定 **Header Auth** 凭据（Name `X-Firebird-Token`，Value = 上面的 token），Telegram 节点绑定 Bot 凭据，**然后激活**——未激活时生产 webhook 路径 404，CI 与 PostSync 通知会静默失败。
- `tg_to_github_issues_project`：TG Trigger 必须是 **typeVersion 1.2** 且填 Restrict to Chat/User IDs；Agent 节点为 `promptType=define`，后接「2b. 解析 Spec JSON」Code 节点。
- （Secret 不入 Git，此为 owner 一次性操作，属 GitOps 的受控例外；Agent 不得执行）GKE `default` 命名空间：`kubectl --context gcp-gke -n default create secret generic firebird-n8n-event-token --from-literal=token=<同一 token>`（PostSync 通知 Job 读取，缺失时不带鉴权头）。

## 5. 安全边界

- 仓库是**公开**的，而 Agent 跑在本机自托管 runner 上，因此：
  - `agent-dev` 只响应 `sender == 仓库 owner` 的 `agent:dev` 标签，或 owner 本人的 `workflow_dispatch`；
  - n8n TG Trigger（**typeVersion ≥ 1.2**，1.1 只显示该选项、运行时不过滤）限定 chat/user ID = Arvin 本人。**这一条是闸门的前提**：n8n 用 owner 的 OAuth 建 Issue，
    若不限制发送人，任何给 bot 发消息的人都能以 owner 身份触发 Dev Agent 并一路自动合并上线；
  - `agent-qa` 只对本仓库 `agent/*` 分支运行，拒绝 fork PR（`qa.sh` 二次校验 `isCrossRepository`）；
  - 建议在 Settings → Actions 开启「Require approval for all outside collaborators」。
- Dev Agent 不能篡改考官，三层防护：
  1. 施工后对 `.github/`、`scripts/agent/`、`.agents/` 执行 `git checkout` + `git clean`（已跟踪改动与**新增文件**都丢弃）；
  2. Agent 分支上 gates 的「受保护路径未改动」检查；
  3. QA 的脚本、`gates.sh`、`RULES.md` 一律取自 main（agent-qa 检出 base 分支并 `self_copy`），PR 代码只作为被审数据。
- Agent 进程不持有任何凭据：checkout 使用 `persist-credentials: false`，运行 agent 时清空 `GH_TOKEN` 等环境变量（`agent_env`），推送时才由 `gh auth git-credential` 临时提供。
- Dev Agent 工具白名单仅 `Read(./**)`、`Edit(./**)`、`Grep(./**)`、`Glob(./**)`（裸 Grep/Glob 实测可读仓库外），**不放行任何 Bash**（`node --check:*` 之类前缀规则可借 `-r` 等参数执行任意代码）；仓库外读写实测被拒。
- `.git` 防护：施工前快照 `.git/config`，施工后还原并清空 `.git/hooks`；之后的 git 调用一律 `-c core.hooksPath=/dev/null -c core.fsmonitor=false`，commit/push 加 `--no-verify`。
- 所有发到公开 PR / Issue 的 agent 输出先经 `redact` 脱敏（GitHub token、Authorization 头、私钥块、TG bot token）。
- 合并需同时满足：托管 runner 上的 gates job = success（`GATES_JOB_RESULT`）、本地复跑门禁通过、QA 无 blocker/major。本机缺 php/helm 时门禁记为 SKIP，以托管 runner 结果为准。
- 自动合并带 `--match-head-commit`：QA 之后再推的提交不会被带进 main。
- 门禁拦截私钥 / 助记词 / TG Bot Token 进入 diff（RULES 资金安全禁区）。
- **依赖批准清单**：Zero-Dep 门禁放行 `.agents/approved-deps.txt`（每行 `包名 版本串`，如 `mysql2 3.24.5`，`#` 起注释）中**名称与版本串都完全一致**的新增依赖。清单取自 **base 分支**，同一 PR 自己登记自己无效；清单在受保护路径 `.agents/`，只能 Arvin 提交。版本变化需重新登记。
- **测试先行用例受保护**：`scripts/acceptance/` 对 Agent 分支同样受保护（dev.sh 丢弃改动、gates 判 FAIL），Agent 不能改写「验收标准」来让自己变绿，见 [TEST_FIRST.md](TEST_FIRST.md)。
- `_bmad-output/`（BMAD 规划产物）与 `docs/`、`.agents/` 一样不计入 1200 行增量。
- 门禁自测：`scripts/test-gates.sh`（临时仓库内验证批准清单 / 受保护路径 / 增量豁免）。

## 5b. BMAD Story 增强（dev.sh）

Issue 标题含 `[story:<key>]`（或正文 `<!-- bmad-story: KEY -->`）时，dev.sh 额外：
1. 从 origin/main 读取 `_bmad-output/implementation-artifacts/spec-N-M-*.md` 注入提示词（最多 20KB）；
2. **测试先行预检**（仅首轮「新建」）：以无凭据环境对 main 运行 `scripts/acceptance/run.sh --expect-red`；用例已绿 → Issue 打 `agent:blocked` 并留言、不施工；缺用例/缺工具 → 只警告；
3. 要求 Agent 结束时输出「验收清单」（逐条 AC → 文件/测试 → 已满足/未满足），并随 PR 正文的「Dev Agent 自述」发布（Story 取末 80 行）；
4. `scripts/acceptance/` 与 `.github/`、`scripts/agent/`、`.agents/` 一样，施工后强制还原。
无标记的普通 Issue 行为不变。详见 [TEST_FIRST.md](TEST_FIRST.md)。

## 5c. 机器验证与回写（ci-verify / writeback）

- `ci-verify.yml` 三个 job：`gates`（确定性门禁 + Helm 渲染 + Story 验收用例）、`verify-task`（`CI=true scripts/verify-task.sh`：流程脚本自测 + `services/api` 单测 + `scripts/test-api-db.sh` 数据库集成测试；ubuntu runner 自带 docker，脚本内另补 PATH 并在缺 docker 时明确失败）、`agent-qa`。QA 的 `GATES_JOB_RESULT` = gates 与 verify-task 都为 success 才算 success，**qa.sh 无需改动**。
- `services/api` 与 `scripts/test-api-db.sh` 入库前，verify-task 的 6、7 步自动跳过。
- `bmad-sprint-writeback.yml`：agent PR 合并且标题含 `[story:<key>]` → 开 `bmad/sprint-done-<N-M>-pr<PR>` 分支与 PR，仅改 `sprint-status.yaml`（不直推 main）；回写 PR 由人合并。标题经 env 传入，不拼进脚本。

## 5d. API 契约同步（门禁第 10 项，2026-10-26）

**要解决的问题**：Docs-as-Code 只要求「改了业务代码就在 `docs/` 里动点东西」，动哪一篇不管。
加一条路由、顺手往别的文档里补一行，门禁照样绿——OpenAPI 可以落后几个月没人发现。
这跟合并表那次「静默空集」是同一类错：**看起来通过了，实际没验证到**。

**做法**：把「文档」收窄成机器可读的契约——`docs/api/openapi.yaml`，两个方向都查。

| 方向 | 判定 | 为什么必须查 |
| :--- | :--- | :--- |
| 代码有、spec 没写 | FAIL | 接口没文档，调用方无从下手 |
| spec 写了、代码没有 | FAIL | 比缺文档更坏：调用方会照着写不存在的接口 |

**触发条件**（`scripts/agent/gates.sh` 第 10 项）：

- 只要碰到 API 面（`services/api/src/{server,fbProxy,*Route}.js` 或 `docs/api/openapi.yaml`），
  就跑 `scripts/api-contract-check.js` 做双向比对；
- 只有改了**路由实现**时，才额外要求同一 PR 里带上 `services/api/test/` 的测试与 `openapi.yaml` 更新。

区分这两层是有意的：只改文档写错了也该拦，但不该逼人「改个错别字也补一条测试」。

**实现上的三个约束**：

1. **零依赖**：`Zero-Dep` 门禁不允许引 yaml 库，所以是受缩进约束的行解析
   （路径键缩进 2、方法键缩进 4、`x-fb-actions` 条目缩进 2）。写 spec 时别用 Tab、别改缩进。
2. **fire-and-forget 路由别漏**：上游代理是 `router.all('/fb/:service/:action')`，
   单看路径看不出/api 面。所以额外把 `fbProxy.js` 的 `WHITELIST` 动作与 spec 的
   `x-fb-actions` 对齐——加白名单动作等于加接口，必须同时进契约。
3. **fail-closed**：新写一个含 `router.xxx(` 的文件但没登记挂载前缀，直接 FAIL
   （`ROUTE_SOURCES` 在检查器里）。宁可让人改一行，也不让新路由静默漏检。

检查器自身有 7 条单测（`services/api/test/api-contract.test.js`），门禁自测另加 4 个用例
（`scripts/test-gates.sh`：不带测试 / 一致放行 / spec 多写 / spec 没跟）。**检查器错了会给出假绿**，
所以它自己也要被测——这条不省略。

手写 spec 时可以用 `node scripts/api-contract-check.js --print` 打出代码侧当前的路由与白名单动作。

## 6. 运维

```bash
make agent-dev ISSUE=12     # 本地手动跑一次 Dev Agent（需 gh 登录）
GATES_JOB_RESULT=success make agent-qa PR=34   # 本地手动跑一次 QA（须声明托管 gates 已通过，否则一律打回）
make gates                  # 对目标分支（AGENT_BASE_BRANCH 填裸分支名，默认 origin/main）跑确定性门禁；GATE_BASE=<ref> 可临时覆盖
                            # 不 fetch：比的是本地远端跟踪 ref，落后时先 git fetch，否则别人的改动会被算进本次增量

# 发布状态 / 回滚（hub 集群）
kubectl --context mac-mini-orbstack -n argocd get imageupdater firebird-manila
argocd app history firebird-manila
argocd app rollback firebird-manila <ID>   # 回滚后 Image Updater 仍会追最新 tag：
                                           # revert main 的那个 PR（GitOps 回滚）；紧急止血才由 owner 暂停 imageupdater（`kubectl -n argocd patch imageupdater firebird-manila`），事后补 PR
```

暂停全自动：`AGENT_AUTO_MERGE=0`（保留 QA，只停合并）；或删 issue 上的 `agent:dev` 标签。

已到返工上限（`agent:blocked`）后怎么办——**在打回数仍 ≥ 上限期间，只移除 `agent:blocked` 标签没用**：`qa_reject_count` 统计的是 PR 上的 QA 打回评论，只增不减，`dev.sh` 一被唤起就立刻再次 block。（`agent:blocked` 只会被「Dev 正常交付成功」摘掉，那一步之后标签就不在了。）真实可行的三条出路：

1. **调高上限**：改仓库变量 `AGENT_MAX_ATTEMPTS`（要大于当前打回数），再重新打 `agent:dev`；Dev 交付成功时会自动摘掉 `agent:blocked`；
2. **换一张工单**：关闭该 PR 并删除它的 `agent/<branch>`，重新建单（打回计数随 PR 归零）；
3. **人工收尾**：直接在该分支改代码并推到同一 PR —— 不走 Dev Agent，QA 会自动重跑。

## 7. 已知限制

- php 与 api 两个镜像由 Image Updater 各自独立追踪，CI 先推 php 后推 api，最长约一个检查周期（2 分钟）内两者版本可能错位；chart 改动（`targetRevision: main`）会先于镜像生效。当前两者接口兼容，若将来出现不兼容变更，需改为单一触发 tag 或写回 git。
- Dev / QA 均为 LLM，存在被需求文本或 diff 中的提示词注入影响的可能；入口已限定为 Arvin 本人（TG chat/user ID、GitHub owner），QA 采用异厂商模型与 fail-closed 解析降低风险。


## 8. 依赖批准记录

批准清单见 `.agents/approved-deps.txt`（机制见 §5）。首批登记：`mysql2 3.24.5`（Story 2.1，AD-5）、`express ^4.21.2`（既有依赖）。
