# BMAD Story → 多 Agent 流水线

> 最后更新：2026-10-10 · 把 BMAD 的 Story（文件）接入 [AGENT_PIPELINE.md](AGENT_PIPELINE.md) 的 Issue 驱动流水线。
> 测试先行机制见 [TEST_FIRST.md](TEST_FIRST.md)。

## 1. 闭环：任务质量 → 实现 → 机器验证 → 另一个 AI 验收 → 人合并

```
① 任务质量   epics.md + sprint-status.yaml ─ scripts/bmad/story-to-issue.js ─▶ Issue「[story:<key>] Story N.M 标题」
             正文：目标 / Given-When-Then / 相关 AD / 规则（含受保护路径）/ 测试先行 / 规格 / 增量上限 ≤300
② Agent 实现 打 agent:dev → agent-dev.yml → dev.sh：按 [story:<key>] 注入规格；预检验收测试为红；
             Agent（无 Bash）实现 → 受保护路径丢弃 → 推 agent/issue-N → 开 PR（标题带 [story:<key>]）
③ 机器验证   ci-verify.yml：gates.sh（增量/Docs/Zero-Dep+批准清单/密钥/语法/Helm）
             ＋ Helm 渲染 ＋ Story 验收测试（标题含 [story:] 才跑，必须绿）
             ＋ verify-task.sh（Node 单测 + 数据库集成测试 scripts/test-api-db.sh，需 docker）
④ AI 验收    agent-qa（异厂商 codex，只读，裁判脚本取自 main）
⑤ 人合并     AGENT_AUTO_MERGE=0：Arvin 点合并 → ci-gke → ArgoCD
⑥ 回写       bmad-sprint-writeback.yml：合并后开 PR 把 sprint-status 置 done（不直推 main）
```

## 2. 命令

```bash
make bmad-next ARGS="--story 1.7 --ignore-deps"       # 预览 Issue（dry-run，不调 gh）；--ignore-deps 为人工强制
node scripts/bmad/story-to-issue.js --query-gh        # 只读查询在途 Issue 再选题（仍不建单）
node scripts/bmad/story-to-issue.js --create          # 真正建单（带 agent:dev 即触发流水线）
                                                       # 退出码 10=无可建；11=缺测试先行用例（--no-test-first 显式放行）
# 回写状态（幂等；未变化不改文件、不刷新 last_updated）
node scripts/bmad/sync-sprint-status.js 1-7 done --file _bmad-output/implementation-artifacts/sprint-status.yaml
node --test scripts/bmad/                              # 单测
```

参数：`--out-dir`（默认 `_bmad-output/`）、`--epics`、`--status`、`--spine`、`--repo-root`（探测测试先行用例）、`--max-inflight`（默认 1）、`--inflight N | --inflight-file F`、`--deps-file F`。

规则：
- 依赖：同 Epic 前序 Story 全部 `review/done`；跨 Epic 依赖见脚本顶部 `EPIC_DEPS`（Epic 2 ← 1.5 为既定，其余为**待 Arvin 确认的假设**）。
- 在途上限：开放、带 `agent:dev` 且含 `bmad-story` 标记的 Issue 数 ≥ 上限即不建单；同 key 已有开放 Issue 不重复建。
- 标签只有 `agent:dev`；其它标签由流水线自己维护。
- Issue 标题约定 `[story:<sprint key>] …`：dev.sh 注入规格、ci-verify 选测试先行用例、回写工作流定位 Story，都靠它。正文还带 `<!-- bmad-story: KEY -->` 标记作兜底。

## 3. 失败与人工介入点

| 情形 | 现象 | 处理 |
| :--- | :--- | :--- |
| 建单退出 10/11 | 无输出 Issue | 看 stderr：等在途合并 / 补前序 Story / 先补测试先行用例 |
| 预检发现验收测试已绿 | dev.sh 在 Issue 留言并 blocked | 说明用例无效或 Story 已满足：人工修用例或关 Issue |
| Dev 空交付 / 连续 3 次被 QA 打回 | Issue 打 `agent:blocked` | 人工接手或拆小 Story |
| Story 超过 300 行 | gates「增量」FAIL → QA 打回 | 拆 Story（改 epics.md 并同步 sprint-status）后重新建单 |
| Story 需要新依赖 | Zero-Dep FAIL | Arvin 先在 `.agents/approved-deps.txt` 登记并合并，再放行 |
| Story 需改受保护路径 | Agent 改动被丢弃 | 由 Arvin 提交 |
| 回写 PR 未出现 | 合并后 sprint-status 仍旧 | 检查合并 PR 标题是否含 `[story:<key>]`、`AGENT_GH_TOKEN` 是否有效；或手动运行 sync 脚本并提交 |

## 4. 已知边界

- **资金路径 Story（Epic 2、4.x）与破坏性路由迁移（1.3）、生产监听器（1.8）必须人工合并**；Agent 无 Bash，行为正确性靠测试先行用例 + CI 数据库集成测试兜底，仍不等于人审。
- 300 行上限与 Story 粒度不匹配：约三分之一 Story 需先拆分。
- sprint-status 中 1.3/1.4/1.5/2.1 的 `review` 指向尚未合入 main 的分支代码；依赖它们的 Story 先确认对应 PR 已合并。
- spike（1.2）、含新依赖（1.5）的 Story 不适合 Agent，用 `--story` 跳过或人工完成。
- 跨 Epic 依赖表与 AD 映射为启发式，需 Arvin 复核。
