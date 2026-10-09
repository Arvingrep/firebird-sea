#!/usr/bin/env bash
# Agent 1 · Dev Agent：认领 GitHub Issue → 在 agent/issue-<N> 分支施工 → 开/更新 PR → 交 QA。
# 触发：.github/workflows/agent-dev.yml（issue 打上 agent:dev 标签）
# 用法：scripts/agent/dev.sh <issue-number>
# 环境：GH_TOKEN（必须是 PAT/App token，GITHUB_TOKEN 开的 PR 不会触发 CI）
#       DEV_AGENT_CMD（可选，覆盖默认命令，按 shell 语法解析；提示词从 stdin 传入。
#                      例：DEV_AGENT_CMD="codex exec -s workspace-write -"）
#       N8N_AGENT_EVENT_WEBHOOK / N8N_AGENT_EVENT_TOKEN（可选）
# 安全：agent 进程不持有任何 token（agent_env）；工具限定在仓库目录内；
#       对 .github/、scripts/agent/、.agents/ 的任何改动（含新增文件）都会被丢弃。
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
self_copy dev.sh "$@"
cd "$ROOT_DIR"
PROTECTED=(.github scripts/agent .agents)

ISSUE="${1:?用法: dev.sh <issue-number>}"
BRANCH="agent/issue-${ISSUE}"
# 用数组保存命令：参数可能含空格，不能靠字符串分词
if [ -n "${DEV_AGENT_CMD:-}" ]; then
  eval "DEV_CMD=(${DEV_AGENT_CMD})"   # 仓库变量，仅 owner 可设
else
  DEV_CMD=(claude -p --permission-mode acceptEdits --max-turns 80
    --allowedTools "Read(./**)" "Edit(./**)" "Grep(./**)" "Glob(./**)")
  # Grep/Glob 必须带路径限定：裸 "Grep"/"Glob" 实测可读仓库外（/etc/hosts），限定后被拒
  # 不放行任何 Bash：带 :* 的前缀规则可借参数执行任意代码（如 node --check -r ./x.js），
  # 语法/Helm 检查由 gates.sh 负责
fi

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
  git show origin/main:.agents/RULES.md
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
# .git 不在受保护路径的 git 跟踪范围内：先快照 config，施工后还原并清空 hooks，
# 之后所有 git 调用禁用 hooks/fsmonitor（防止 agent 借 .git 植入在带 token 环境下执行的代码）
GIT_SNAP="$(mktemp -d)"; cp .git/config "$GIT_SNAP/config"
SAFE_GIT=(git -c core.hooksPath=/dev/null -c core.fsmonitor=false)
log "🚧 调用 Dev Agent: ${DEV_CMD[0]}"
SUMMARY_FILE="$(mktemp)"
# 提示词走 stdin（claude --allowedTools 是可变参数，会吞掉位置参数）
if ! agent_env "${DEV_CMD[@]}" < "$PROMPT_FILE" > "$SUMMARY_FILE" 2>&1; then
  log "⚠️ Dev Agent 非 0 退出，继续检查产出"
fi
SUMMARY="$(tail -n 30 "$SUMMARY_FILE" | redact)"

cp "$GIT_SNAP/config" .git/config
rm -rf .git/hooks && mkdir .git/hooks

# 防越权：丢弃对受保护路径的一切改动——已跟踪文件还原 + 未跟踪新文件删除
# 逐个路径还原：多路径一次 checkout 时只要有一个不存在于 HEAD，整条命令失败、其余也不还原
for p in "${PROTECTED[@]}"; do
  if "${SAFE_GIT[@]}" cat-file -e "HEAD:$p" 2>/dev/null; then "${SAFE_GIT[@]}" checkout -q HEAD -- "$p"; fi
done
"${SAFE_GIT[@]}" clean -fdq -- "${PROTECTED[@]}"

if [ -z "$("${SAFE_GIT[@]}" status --porcelain)" ]; then
  gh issue comment "$ISSUE" -R "$REPO" -b "⚠️ Dev Agent 本轮无任何产出（空交付）。

<details><summary>Agent 输出</summary>

\`\`\`\`
${SUMMARY}
\`\`\`\`
</details>" >/dev/null
  set_label "$ISSUE" "agent:blocked" "agent:dev"
  notify blocked "#${ISSUE} Dev Agent 空交付" "$ISSUE" "$PR"
  exit 1
fi

# 5. 提交 + 推送
"${SAFE_GIT[@]}" add -A
"${SAFE_GIT[@]}" -c user.name="firebird-dev-agent" -c user.email="dev-agent@users.noreply.github.com" \
  commit -q --no-verify -m "feat(agent): #${ISSUE} ${TITLE}"
# checkout 不持久化凭据（persist-credentials: false），推送时由 gh 临时提供
"${SAFE_GIT[@]}" -c credential.helper= -c 'credential.helper=!gh auth git-credential' push -q --no-verify -u origin "$BRANCH"

# 6. 开/更新 PR（GH_TOKEN 为 PAT，才能触发 ci-verify / QA）
if [ -z "$PR" ]; then
  PR_URL="$(gh pr create -R "$REPO" --base main --head "$BRANCH" \
    --title "feat(agent): #${ISSUE} ${TITLE}" \
    --label "agent:qa" \
    --body "Closes #${ISSUE}

由 Dev Agent 自动施工，等待独立 QA Agent 验收（通过即自动合并 → CI 构建 → Image Updater → ArgoCD 上线）。

**Dev Agent 自述：**
\`\`\`\`
${SUMMARY}
\`\`\`\`")"
  PR="${PR_URL##*/}"
else
  set_label "$PR" "agent:qa" "qa:rejected"
fi
set_label "$ISSUE" "agent:qa" "agent:dev"
log "✅ 已推送 ${BRANCH} → PR #${PR}"
notify dev_done "Dev Agent 已交付 #${ISSUE} → PR #${PR}，等待 QA" "$ISSUE" "$PR"
