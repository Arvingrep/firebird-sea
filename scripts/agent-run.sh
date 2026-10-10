#!/usr/bin/env bash

# ==============================================================================
# BMAD 执行器 (Dev Agent Runner) — 补上「自动认领施工」这一缺失环
# 读任务 spec + RULES → 在任务分支上跑无头编码 Agent → commit → 开 PR
#   → 交由独立验收(acceptance-runner.sh)据实裁定。不自动合并（人只批准）。
#
# 用法：
#   scripts/agent-run.sh <TASK-ID>
# 可配：
#   AGENT_CMD   无头 agent 命令（默认 agy；claude/codex 额度/登录不稳，见备注）
#               例: AGENT_CMD='claude -p' / AGENT_CMD='codex exec'
#   DRY_RUN=1   不真跑 agent，仅演练插桩（验证流水线接线）
# ==============================================================================

set -uo pipefail

TASK_ID="${1:-}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
AGENT_CMD="${AGENT_CMD:-agy --dangerously-skip-permissions --print-timeout 45m -p}"
DRY_RUN="${DRY_RUN:-0}"

[ -z "$TASK_ID" ] && { echo "❌ 用法: scripts/agent-run.sh <TASK-ID>"; exit 2; }

TASK_FILE="$(ls .agents/tasks/${TASK_ID}*.md 2>/dev/null | head -n1 || true)"
[ -z "$TASK_FILE" ] && { echo "❌ 未找到任务规格 .agents/tasks/${TASK_ID}*.md"; exit 2; }

NUM="$(printf '%s' "$TASK_ID" | grep -oE '[0-9]+' | head -n1)"
BRANCH="$(git for-each-ref --format='%(refname:short)' refs/heads 2>/dev/null \
          | grep -iE "task-0*${NUM}([^0-9]|$)" | head -n1 || true)"
SLUG="$(basename "$TASK_FILE" .md | tr '[:upper:]' '[:lower:]')"
[ -z "$BRANCH" ] && BRANCH="feat/${SLUG}"

echo "======================================================================"
echo "🤖 [执行器] 任务 ${TASK_ID} → 分支 ${BRANCH}"
echo "   规格: ${TASK_FILE}"
echo "   Agent: ${AGENT_CMD}"
echo "======================================================================"

# 1. 切到任务分支（没有就从 main 建）
git rev-parse --verify -q "$BRANCH" >/dev/null 2>&1 && git checkout -q "$BRANCH" || git checkout -q -b "$BRANCH"

# 2. 组装提示词：任务 spec + 工程铁律（Zero-Dep / Docs-as-Code / KISS）
RULES_SNIP="$( [ -f .agents/RULES.md ] && sed -n '1,30p' .agents/RULES.md || true )"
PROMPT="$(cat <<EOF
你是本仓库的 Dev Agent。严格实现下面这一条任务，只改必要的最小文件集。

【任务规格】
$(cat "$TASK_FILE")

【必须遵守的工程铁律（节选自 .agents/RULES.md）】
${RULES_SNIP}

硬性要求：
1. 只实现该任务的单一核心 AC，不扩张范围（Scope Creep）。
2. Docs-as-Code：凡涉及 schema/API/env/部署 变更，必须在同一改动里同步更新 docs/internal 下对应文档。
3. 零冗余依赖：优先标准库，严禁为小功能引入重型三方包。
4. 不要改动与本任务无关的文件；不要自己 git commit / push（由外层脚本负责）。
完成后用一句话总结改了什么。
EOF
)"

# 3. 跑 agent（DRY_RUN 用插桩验证接线）
if [ "$DRY_RUN" = "1" ]; then
  echo "🧪 [DRY_RUN] 跳过真实 agent；演练：将把下述提示交给 ‘${AGENT_CMD}’"
  echo "---- PROMPT 预览(前 20 行) ----"; printf '%s\n' "$PROMPT" | sed -n '1,20p'
else
  command -v "${AGENT_CMD%% *}" >/dev/null 2>&1 || { echo "❌ 无头 agent 不可用: ${AGENT_CMD%% *}（装它或用 AGENT_CMD 覆盖）"; exit 3; }
  echo "🚀 调用无头编码 Agent 施工中（最长 45m）..."
  printf '%s' "$PROMPT" | ${AGENT_CMD} "$(cat)" || { echo "⚠️ agent 返回非 0，仍继续检查产出"; }
fi

# 4. 收集产出并提交
if [ -n "$(git status --porcelain)" ]; then
  git add -A
  git commit -q -m "feat(agent): ${TASK_ID} 自动施工产出" || true
  echo "✅ 已提交本次施工产出到 ${BRANCH}"
else
  echo "⚠️ 无任何改动产出——独立验收将判为「空交付」(符合预期的失败信号)"
fi

# 5. 开 PR（有 gh 用 gh，否则推分支并打印对比链接；不自动合并）
if [ "$DRY_RUN" != "1" ]; then
  git push -q -u origin "$BRANCH" 2>/dev/null || echo "ℹ️ 推送跳过（无远端或已最新）"
  if command -v gh >/dev/null 2>&1; then
    gh pr create --fill --base "${AGENT_BASE_BRANCH:-main}" --head "$BRANCH" 2>/dev/null \
      && echo "✅ 已开 PR（等待独立验收 + 人工批准）" \
      || echo "ℹ️ PR 创建跳过（可能已存在）"
  else
    echo "ℹ️ 无 gh CLI：手动开 PR → https://github.com/Arvingrep/firebird-sea/compare/${AGENT_BASE_BRANCH:-main}...${BRANCH}"
  fi
fi

# 6. 交独立验收据实裁定（与施工分离；不自动合并，人只批准）
echo ""
echo "🛡️ 触发独立验收（独立进程，据实裁定）..."
bash scripts/acceptance-runner.sh "${TASK_ID}"
RC=$?
echo ""
[ $RC -eq 0 ] && echo "🟢 验收通过：等待你人工批准合并 ${BRANCH} → ${AGENT_BASE_BRANCH:-main}。" \
             || echo "🔴 验收打回：见 .agents/tasks/reports/${TASK_ID}-ACCEPTANCE.md，修复后重跑本执行器。"
exit $RC
