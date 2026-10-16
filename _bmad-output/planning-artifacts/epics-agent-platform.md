---
status: final
created: 2026-10-12
inputDocuments:
  - https://github.com/Arvingrep/firebird-sea/issues/106
note: 本文件是 Agent 平台基础设施的独立拆分，不覆盖、不修改 epics.md（产品 Story）。对应 Issue #106 的框架决策。
---

# Agent 平台基础设施 - Epic Breakdown

## Overview

把 #106（白天极速 / 夜间自治双模式 + 四层框架：BMAD → OpenHands Agent Canvas → GitHub → GitOps）拆成可验证的 Spike 与落地 Story。第一个 Epic 只做 POC，不替换现有 Shell 流水线（`story-to-issue.js` + `dev.sh` + `qa.sh`），不接入任何中国模型订阅（沿用现有 Claude/Codex 订阅）。

## Epic List

1. Epic 7：OpenHands Agent Canvas 接入 Spike（canary 对照）

## Epic 7: OpenHands Agent Canvas 接入 Spike

验证 OpenHands Agent Canvas 能否接管运行时编排（Intake → Planner → 并行 Worktree → Dev → Test → Review → PR），同时保留 GitHub 门禁/QA/合并与 GitOps 部署不变。本 Epic 只产出对照结论，不替换现有管道。Epic 编号独立于 epics.md 的 1-6（产品 Story），不冲突、不合并。

### Story 7.1: OpenHands Agent Canvas 本机 POC 与管道对照

As a owner,
I want 在本机以 OpenHands Agent Canvas 驱动 1 个真实 canary Story（从 Intake 到开 PR），并与现有 Shell 管道（dev.sh/qa.sh）跑同一类任务做对照,
So that 在替换现有编排脚本前，有真实数据（完成率、人工介入次数、耗时、PR 质量）支撑决策，而不是凭感觉切换。

**Acceptance Criteria:**

**Given** 本机已装 Node.js 22.12+ 与 uv，且 firebird-sea 仓库可本地 clone
**When** 执行 `npm install -g @openhands/agent-canvas && agent-canvas` 启动本地 Agent Canvas
**Then** 产出书面记录：安装耗时、是否需要额外系统权限、能否连接现有 GitHub 仓库与 Claude/Codex 账号登录态

**Given** Agent Canvas 本地可用
**When** 选取 1 个低风险、无资金路径的真实 canary 待办 Story（非 waimai/支付相关），通过 Agent Canvas 完成 Intake → Planner → Worktree → Dev → Test → PR
**Then** 产出一个真实 PR，且过现有 `ci-verify.yml` 门禁与独立 QA（不绕过、不新增豁免）

**Given** 同一类 Story 此前曾由现有 Shell 管道（dev.sh/qa.sh）完成过，或可平行跑一次
**When** 对比两条路径
**Then** 书面给出对照表：完成耗时、人工介入次数、Agent 失败与恢复次数、最终 PR 质量（QA 返工次数）、是否值得替换现有管道

**Given** Spike 结论为"不替换"或"部分替换"
**When** 记录原因与阈值未达标项
**Then** 书面上报 Arvin，并在 Issue #106 下留结论评论；未经 Arvin 批准不得将 OpenHands Canvas 设为默认编排器，也不得下线现有 Shell 管道

**Given** Spike 过程中涉及任何集群、密钥、生产配置
**When** 执行相关操作
**Then** 禁止触碰生产集群与密钥值；全部产物只在本地与 canary 范围内，遵守 `.agents/RULES.md` 第 6、7 节
