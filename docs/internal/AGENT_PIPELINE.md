# 多 Agent 研发流水线（n8n → GitHub CI → ArgoCD CD）

> 最后更新：2026-10-09 · 落地 `BMAD_AUTOMATION_PIPELINE_ARCHITECTURE.md` 的方案 C（外环 n8n / 内环 GitHub + 双 Agent）。

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
        GH->>CI: push main → build+push GAR <sha>
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
| 确定性门禁 | `.github/workflows/ci-verify.yml` → `scripts/agent/gates.sh` | 只看分支 diff：非空、增量 ≤300、Docs-as-Code、Zero-Dep、密钥、调试残留、语法、Helm |
| QA Agent | `ci-verify.yml` job `agent-qa` → `scripts/agent/qa.sh` | 默认 `codex exec -s read-only`（与 Dev 不同厂商）；JSON 裁定，解析失败即打回 |
| 构建 | `.github/workflows/ci-gke.yml` | push main → GAR `firebird-php/api:<sha>`；纯 docs/任务变更不构建 |
| 发布 | homelab `platform/argocd-image-updater` + `apps/firebird-manila/application-gke.yaml` | Image Updater v1（CRD）追 40 位 SHA tag，write-back=argocd；Application 自动同步 |
| 上线通知 | `deploy/helm/firebird-site/templates/job-notify-deployed.yaml` | ArgoCD PostSync Job，`deployNotify.webhook` 为空则不创建 |

## 3. 标签状态机

| 标签 | 含义 | 谁打 |
|---|---|---|
| `agent:dev` | 待 Dev Agent 施工（打上即触发） | n8n / 人 / QA 打回 |
| `agent:qa` | PR 等待 QA | Dev Agent |
| `qa:accepted` / `qa:rejected` | QA 裁定 | QA Agent |
| `agent:blocked` | 空交付或打回 ≥ `AGENT_MAX_ATTEMPTS`，需人工 | Dev Agent |

## 4. 配置（GitHub → Settings → Secrets and variables → Actions）

| 类型 | 名称 | 必填 | 说明 |
|---|---|---|---|
| secret | `AGENT_GH_TOKEN` | ✅ | fine-grained PAT（本仓库 Contents / Issues / Pull requests 读写）。**不能用 `GITHUB_TOKEN`**：它推的提交/开的 PR/打的标签不会触发后续 workflow |
| var | `N8N_AGENT_EVENT_WEBHOOK` | 建议 | `https://n8n.k8shome.com/webhook/firebird-agent-event` |
| secret | `N8N_AGENT_EVENT_TOKEN` | 建议 | 事件 webhook 的 Header Auth token（`X-Firebird-Token`），与下方 n8n 凭据、GKE Secret 三处一致 |
| var | `AGENT_AUTO_MERGE` | | 默认 `1`；设 `0` 即改为「QA 通过后人工合并」 |
| var | `AGENT_MAX_ATTEMPTS` | | QA 打回上限，默认 `3` |
| var | `DEV_AGENT_CMD` / `QA_AGENT_CMD` | | 覆盖默认 agent 命令（按 shell 语法 `eval` 成数组，**等同于在 runner 上执行任意命令**——仅 owner 可设，勿开放给他人；提示词走 stdin；`QA_AGENT_CMD` 需以输出文件参数结尾，如 `... -o`） |
| secret | `GCP_SA_KEY` | ✅ | 已有，CI 推 GAR |

本机 runner：`scripts/agent/setup-runner.sh`（标签 `firebird-agent`，launchd 常驻，复用本机 claude/codex 登录态）。

n8n / GKE 侧：
- 导入 `agent_pipeline_events_to_tg.json` 后：Webhook 节点绑定 **Header Auth** 凭据（Name `X-Firebird-Token`，Value = 上面的 token），Telegram 节点绑定 Bot 凭据，**然后激活**——未激活时生产 webhook 路径 404，CI 与 PostSync 通知会静默失败。
- `tg_to_github_issues_project`：TG Trigger 必须是 **typeVersion 1.2** 且填 Restrict to Chat/User IDs；Agent 节点为 `promptType=define`，后接「2b. 解析 Spec JSON」Code 节点。
- GKE `default` 命名空间：`kubectl --context gcp-gke -n default create secret generic firebird-n8n-event-token --from-literal=token=<同一 token>`（PostSync 通知 Job 读取，缺失时不带鉴权头）。

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
- Dev Agent 工具白名单：`Read(./**)`、`Edit(./**)`、Glob、Grep、`php -l`、`node --check`、`helm lint deploy/helm/firebird-site`；仓库外读写与 `git diff --output` 实测被拒。
- 所有发到公开 PR / Issue 的 agent 输出先经 `redact` 脱敏（GitHub token、Authorization 头、私钥块、TG bot token）。
- 合并需同时满足：托管 runner 上的 gates job = success（`GATES_JOB_RESULT`）、本地复跑门禁通过、QA 无 blocker/major。本机缺 php/helm 时门禁记为 SKIP，以托管 runner 结果为准。
- 自动合并带 `--match-head-commit`：QA 之后再推的提交不会被带进 main。
- 门禁拦截私钥 / 助记词 / TG Bot Token 进入 diff（RULES 资金安全禁区）。

## 6. 运维

```bash
make agent-dev ISSUE=12     # 本地手动跑一次 Dev Agent（需 gh 登录）
GATES_JOB_RESULT=success make agent-qa PR=34   # 本地手动跑一次 QA（须声明托管 gates 已通过，否则一律打回）
make gates                  # 当前分支对 origin/main 跑确定性门禁

# 发布状态 / 回滚（hub 集群）
kubectl --context mac-mini-orbstack -n argocd get imageupdater firebird-manila
argocd app history firebird-manila
argocd app rollback firebird-manila <ID>   # 回滚后 Image Updater 仍会追最新 tag：
                                           # 先 kubectl -n argocd patch imageupdater firebird-manila 暂停，或 revert main
```

暂停全自动：`AGENT_AUTO_MERGE=0`（保留 QA，只停合并）；或删 issue 上的 `agent:dev` 标签。

## 7. 已知限制

- php 与 api 两个镜像由 Image Updater 各自独立追踪，CI 先推 php 后推 api，最长约一个检查周期（2 分钟）内两者版本可能错位；chart 改动（`targetRevision: main`）会先于镜像生效。当前两者接口兼容，若将来出现不兼容变更，需改为单一触发 tag 或写回 git。
- Dev / QA 均为 LLM，存在被需求文本或 diff 中的提示词注入影响的可能；入口已限定为 Arvin 本人（TG chat/user ID、GitHub owner），QA 采用异厂商模型与 fail-closed 解析降低风险。

