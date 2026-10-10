# BMAD Story → 多 Agent 流水线

> 最后更新：2026-10-10 · 把 BMAD 的 Story（文件）接入 [AGENT_PIPELINE.md](AGENT_PIPELINE.md) 的 Issue 驱动流水线。

## 1. 全链路

```
epics.md + sprint-status.yaml
   │  scripts/bmad/story-to-issue.js（选下一个可开工 Story，生成 Issue；默认 dry-run）
   ▼
GitHub Issue「[BMAD 1.7] …」+ 标签 agent:dev + 正文标记 <!-- bmad-story: KEY -->
   │  agent-dev.yml → dev.sh（Dev Agent，无 Bash）→ 分支 agent/issue-N + PR
   ▼
ci-verify.yml：gates（确定性）＋ verify-task（补丁 02：Node 单测 + 数据库集成测试）
   ▼
agent-qa（异厂商，只读）→ 通过 squash 合并 → ci-gke → ArgoCD
   ▼
bmad-sprint-sync.yml（补丁 01）：PR 打开 → review；合并 → done，直推 main 回写 sprint-status.yaml
```

状态映射（sprint-status）：`backlog` →（建 Issue 后由人/补丁决定）→ `in-progress` → PR 打开 `review` → 合并 `done`。
BMAD 的「review」在这里等同 PR 待 QA；QA 通过并合并即 `done`。`epic-N` 随 Story 自动 `in-progress`/`done`。

## 2. 命令

```bash
# 预览下一个可开工 Story 的 Issue（不调用 gh、不建单）
node scripts/bmad/story-to-issue.js --out-dir /path/to/_bmad-output
make bmad-next ARGS="--story 1.7 --ignore-deps"      # 指定 Story；--ignore-deps 为人工强制，正文会标注
node scripts/bmad/story-to-issue.js --query-gh        # 只读查询 GitHub 的在途 Issue 再选题（仍不建单）
node scripts/bmad/story-to-issue.js --create          # 真正建单（带 agent:dev，即触发流水线）；需 gh 登录
                                                       # 退出码 10 = 无可建（在途已满 / 依赖未满足 / 无 backlog）
# 回写状态（幂等；未变化不改文件、不刷新 last_updated）
node scripts/bmad/sync-sprint-status.js 1-7 review --file _bmad-output/implementation-artifacts/sprint-status.yaml
node --test test/bmad/                                # 测试
```

参数：`--out-dir`（默认仓库根 `_bmad-output/`）、`--epics`、`--status`、`--spine`、`--max-inflight`（默认 1）、`--inflight N | --inflight-file F`、`--deps-file F`（覆盖跨 Epic 依赖 JSON）。

规则：
- 依赖：同 Epic 前序 Story 全部 `review/done`；跨 Epic 依赖见脚本顶部 `EPIC_DEPS`（Epic 2 ← 1.5 为既定，其余 3←2.3、4←3.3、5←4.3、6←5.4 为**待 Arvin 确认的假设**）。
- 在途上限：开放且带 `agent:dev` 且含 `bmad-story` 标记的 Issue 数 ≥ 上限即不建单；同 key 已有开放 Issue 也不重复建。
- 标签只有 `agent:dev`；`agent:qa`、`qa:*`、`agent:blocked` 由流水线自己维护，脚本和正文都不输出。
- AD 编号：Story 正文显式引用优先，否则取 `STORY_AD` / `EPIC_AD` 映射（人工对应，需复核）。

## 3. 失败与人工介入点

| 情形 | 现象 | 处理 |
| :--- | :--- | :--- |
| 建单脚本退出 10 | 无输出 Issue | 看 stderr 原因：等在途合并 / 补前序 Story / 补 sprint-status |
| Dev 空交付或连续 3 次被 QA 打回 | Issue 打 `agent:blocked` | 人工接手或拆小 Story；sprint-status 仍为 in-progress，不会自动回退 |
| Story 超过 300 行 | gates「增量」FAIL → QA 打回 | 拆 Story：改 epics.md 并同步 sprint-status 后重新建单 |
| Story 需要新依赖（如 1.5 的 `mysql2`） | Zero-Dep FAIL | Arvin 先批准并人工提交依赖，再放行 |
| Story 需改 `.github/`、`scripts/agent/`、`.agents/` | Agent 的改动被丢弃 | 只能由 Arvin 提交（如 1.7/1.8 的 CI 侧改动） |
| 回写直推 main 失败 | sync workflow 红 | 手动运行 `sync-sprint-status.js` 并提交；多为分支保护未放行 PAT |
| 建单后 Story 在 sprint-status 仍是 backlog | 重复建单被标记拦住 | 手动置 `ready-for-dev` / `in-progress` |

## 4. 需 Arvin 提交的受保护改动（补丁，未应用）

位置 `docs/internal/patches/`，`git apply --check` 已在 origin/main 上通过：

| 补丁 | 内容 |
| :--- | :--- |
| `bmad-pipeline-01-sprint-sync.patch` | 新增 `.github/workflows/bmad-sprint-sync.yml`：PR 打开→review，合并→done，回写并推 main（`[skip ci]`） |
| `bmad-pipeline-02-verify-task-gate.patch` | `ci-verify.yml` 新增 `verify-task` job（`CI=true ./scripts/verify-task.sh`，含数据库集成测试）；`agent-qa` 依赖它，失败按门禁失败处理（不改 qa.sh） |
| `bmad-pipeline-03-ci-gke-ignore.patch` | `ci-gke.yml` 的 `paths-ignore` 加 `_bmad-output/**`，避免回写触发镜像构建 |

应用：`git apply docs/internal/patches/bmad-pipeline-0*.patch`，在非 `agent/*` 分支提交并开 PR。

## 5. 前置条件与已知缺口

1. `_bmad-output/` 目前只在 `feat/story-2-payments-core`，**不在 main**。Dev Agent 与建单脚本都从 main 检出读取，必须先把 `_bmad-output/`（至少 epics.md、sprint-status.yaml、ARCHITECTURE-SPINE.md）合入 main。Issue 正文自带验收条件，Dev 不依赖该目录。
2. `services/api`、`scripts/test-api-db.sh`、带数据库测试的 `verify-task.sh` 同样只在该分支；补丁 02 在它们合入 main 之前只会跑旧版 verify-task（通过但无数据库测试）。
3. verify-task 需要 docker + `npm ci` 联网，托管 ubuntu runner 可满足；耗时约数分钟。
4. 建单所需标签 `agent:dev` 须已存在（`dev.sh` 的 `ensure_labels` 首次施工才会创建）；首次手动建一个。
5. `last_updated` 格式沿用文件现有的 `DD-MM-YYYY HH:MM`（文件中 10-10 无法区分日/月，请确认）。

## 6. 综合评估

**可行且值得接**：Story 已有 Given/When/Then，天然适配 Issue；Dev→QA 异厂商双签 + 确定性门禁足以覆盖 UI/文档/配置/Helm 类 Story（1.3、1.6、1.7、1.8 一类）。

**风险与边界**：
- **资金路径 Story（Epic 2、4.x）不宜全自动合并**。Dev Agent 没有 Bash，不能自己跑测试；QA 只读，不能执行用例。即便补丁 02 加了数据库集成测试，LLM 对并发/幂等/金额精度的判断仍是弱点。建议这些 Story 设 `AGENT_AUTO_MERGE=0`，或在 Issue 上走「QA 通过 → Arvin 人工合并」。
- **300 行上限与 Story 粒度不匹配**：2.x/4.x 的 Story 多半 >300 行含测试，会反复被打回直至 blocked；建单脚本只提示不强拆，需要人工先拆 Story。
- **spike（1.2）与「依赖人工批准」的 Story（1.5 的 mysql2）不适合 Agent**，应人工做；脚本按顺序会先选 1.2，需用 `--story` 跳过或先把 1.2 手动置 `review`。
- **跨 Epic 依赖表是假设**，需 Arvin 复核；AD 映射为启发式。
- sprint-status 回写直推 main 依赖 PAT 能绕过/满足分支保护；失败不影响合并，只影响看板准确性。
- 单点：同时 1 个在途 Story ⇒ 吞吐等于「一次完整 Dev→QA→构建」；这是有意的保守默认，可用 `--max-inflight` 调高，但同 Epic 内并行会引发冲突（dev.sh 遇冲突直接 blocked）。

**建议推进顺序**：(1) 合入 `_bmad-output/` 与 `services/api`；(2) 应用补丁 01–03；(3) 先用 1.7、1.8 这类低资金风险 Story 跑通一轮真实闭环，`AGENT_AUTO_MERGE` 保持 1；(4) Epic 2 起切人工合并。
