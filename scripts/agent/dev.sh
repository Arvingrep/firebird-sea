#!/usr/bin/env bash
# Agent 1 · Dev Agent：认领 GitHub Issue → 在 agent/issue-<N> 分支施工 → 开/更新 PR → 交 QA。
# 触发：.github/workflows/agent-dev.yml（issue 打上 agent:dev 标签）
# 用法：scripts/agent/dev.sh <issue-number>
# 环境：GH_TOKEN（必须是 PAT/App token，GITHUB_TOKEN 开的 PR 不会触发 CI）
#       DEV_AGENT_CMD（默认 claude -p，限定工具集；提示词从 stdin 传入。
#                      换 codex：DEV_AGENT_CMD='codex exec -s workspace-write -'）
#       N8N_AGENT_EVENT_WEBHOOK（可选）
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
cd "$ROOT_DIR"

ISSUE="${1:?用法: dev.sh <issue-number>}"
BRANCH="agent/issue-${ISSUE}"
DEV_AGENT_CMD="${DEV_AGENT_CMD:-claude -p --permission-mode acceptEdits --max-turns 80 --allowedTools Read,Edit,Write,Glob,Grep,Bash(git diff:*),Bash(git status:*),Bash(php -l:*),Bash(node --check:*),Bash(helm template:*),Bash(helm lint:*)}"

ensure_labels
TITLE="$(gh issue view "$ISSUE" -R "$REPO" --json title -q .title)"
BODY="$(gh issue view "$ISSUE" -R "$REPO" --json body -q .body)"
log "🤖 Dev Agent 认领 #${ISSUE}: ${TITLE}"

# 1. 分支：已有（返工）则续做，否则从 main 新建
git fetch -q origin main
if git ls-remote --exit-code --heads origin "$BRANCH" >/dev/null 2>&1; then
  git fetch -q origin "$BRANCH"; git checkout -q -B "$BRANCH" "origin/$BRANCH"
  if ! git merge -q --no-edit origin/main; then
    git merge --abort 2>/dev/null || true
    set_label "$ISSUE" "agent:blocked" "agent:dev"
    gh issue comment "$ISSUE" -R "$REPO" -b "🛑 \`${BRANCH}\` 与 main 冲突，Dev Agent 不自动解决冲突，请人工 rebase 后重新打 agent:dev。" >/dev/null
    notify blocked "#${ISSUE} 分支与 main 冲突，需人工处理" "$ISSUE"
    exit 1
  fi
  MODE="返工"
else
  git checkout -q -B "$BRANCH" origin/main
  MODE="新建"
fi

# 2. 返工上下文：取 PR 上最近一次 QA 打回意见
PR="$(gh pr list -R "$REPO" --head "$BRANCH" --state open --json number -q '.[0].number' 2>/dev/null || true)"
FEEDBACK=""
if [ -n "$PR" ]; then
  N_REJ="$(qa_reject_count "$PR")"
  if [ "$N_REJ" -ge "$MAX_ATTEMPTS" ]; then
    set_label "$ISSUE" "agent:blocked" "agent:dev"
    gh issue comment "$ISSUE" -R "$REPO" -b "🛑 QA 已打回 ${N_REJ} 次（上限 ${MAX_ATTEMPTS}），停止自动返工，请人工介入：#${PR}" >/dev/null
    notify blocked "#${ISSUE} 超过返工上限，需人工介入" "$ISSUE" "$PR"
    exit 0
  fi
  FEEDBACK="$(gh api "repos/${REPO}/issues/${PR}/comments" --jq \
    "[.[] | select(.body | contains(\"${QA_MARK_REJECT}\"))] | last | .body // \"\"")"
fi
notify dev_started "Dev Agent ${MODE} #${ISSUE}: ${TITLE}" "$ISSUE" "$PR"

# 3. 组装提示词
PROMPT_FILE="$(mktemp)"; trap 'rm -f "$PROMPT_FILE"' EXIT
{
  echo "你是 firebird-sea 仓库的 Dev Agent（实现者）。只实现下面这一个需求，改动最小文件集。"
  echo
  echo "## 需求 (GitHub Issue #${ISSUE})"
  echo "### ${TITLE}"
  echo "${BODY}"
  if [ -n "$FEEDBACK" ]; then
    echo
    echo "## ⚠️ 独立 QA 上一轮打回意见（必须逐条修复）"
    echo "${FEEDBACK}"
  fi
  echo
  echo "## 工程铁律（.agents/RULES.md 全文）"
  cat .agents/RULES.md
  echo
  echo "## 硬性要求"
  echo "1. 只实现单一核心 AC，不做范围扩张；火鸟后台已有的配置能力不要重写。"
  echo "2. Docs-as-Code：业务代码（php/js/ts/vue/sql）有改动，必须同时更新 docs/ 下对应文档。"
  echo "3. 新增代码（不含 docs）≤ 300 行；不新增依赖；不留 .bak/调试输出（var_dump/console.log）。"
  echo "4. 绝不写入任何私钥、助记词、Token。"
  echo "5. 不要执行 git commit/push，不要改 .github/ 与 scripts/agent/（由外层流水线负责）。"
  echo "6. 结束时用 3 行以内总结：改了哪些文件、如何验证。"
} > "$PROMPT_FILE"

# 4. 施工
log "🚧 调用 Dev Agent: ${DEV_AGENT_CMD%% *}"
SUMMARY_FILE="$(mktemp)"
# 提示词走 stdin（claude --allowedTools 是可变参数，会吞掉位置参数）
# shellcheck disable=SC2086
if ! ${DEV_AGENT_CMD} < "$PROMPT_FILE" > "$SUMMARY_FILE" 2>&1; then
  log "⚠️ Dev Agent 非 0 退出，继续检查产出"
fi
SUMMARY="$(tail -n 30 "$SUMMARY_FILE")"

# 防越权：Dev Agent 不得修改流水线自身
git checkout -q HEAD -- .github scripts/agent 2>/dev/null || true

if [ -z "$(git status --porcelain)" ]; then
  gh issue comment "$ISSUE" -R "$REPO" -b "⚠️ Dev Agent 本轮无任何产出（空交付）。

<details><summary>Agent 输出</summary>

\`\`\`
${SUMMARY}
\`\`\`
</details>" >/dev/null
  set_label "$ISSUE" "agent:blocked" "agent:dev"
  notify blocked "#${ISSUE} Dev Agent 空交付" "$ISSUE" "$PR"
  exit 1
fi

# 5. 提交 + 推送
git add -A
git -c user.name="firebird-dev-agent" -c user.email="dev-agent@users.noreply.github.com" \
  commit -q -m "feat(agent): #${ISSUE} ${TITLE}"
git push -q -u origin "$BRANCH"

# 6. 开/更新 PR（GH_TOKEN 为 PAT，才能触发 ci-verify / QA）
if [ -z "$PR" ]; then
  PR_URL="$(gh pr create -R "$REPO" --base main --head "$BRANCH" \
    --title "feat(agent): #${ISSUE} ${TITLE}" \
    --label "agent:qa" \
    --body "Closes #${ISSUE}

由 Dev Agent 自动施工，等待独立 QA Agent 验收（通过即自动合并 → CI 构建 → Image Updater → ArgoCD 上线）。

**Dev Agent 自述：**
\`\`\`
${SUMMARY}
\`\`\`")"
  PR="${PR_URL##*/}"
else
  set_label "$PR" "agent:qa" "qa:rejected"
fi
set_label "$ISSUE" "agent:qa" "agent:dev"
log "✅ 已推送 ${BRANCH} → PR #${PR}"
notify dev_done "Dev Agent 已交付 #${ISSUE} → PR #${PR}，等待 QA" "$ISSUE" "$PR"
