#!/usr/bin/env bash
# 多 Agent 流水线公共函数（被 dev.sh / qa.sh / gates.sh source）。
# 依赖：git、gh（已用 GH_TOKEN 认证）、node。

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REPO="${GITHUB_REPOSITORY:-Arvingrep/firebird-sea}"
MAX_ATTEMPTS="${AGENT_MAX_ATTEMPTS:-3}"
QA_MARK_REJECT="<!-- agent-qa:REJECTED -->"
QA_MARK_ACCEPT="<!-- agent-qa:ACCEPTED -->"

log() { printf '[%s] %s\n' "$(date +%H:%M:%S)" "$*" >&2; }
die() { log "❌ $*"; exit 1; }

# 推送流水线事件到 n8n（n8n 负责转发 TG）。未配置 webhook 时静默跳过，绝不阻断流水线。
# 用法：notify <stage> <message> [issue] [pr]
notify() {
  local url="${N8N_AGENT_EVENT_WEBHOOK:-}"
  [ -z "$url" ] && return 0
  node -e '
    const [stage, message, issue, pr, repo, run] = process.argv.slice(1);
    process.stdout.write(JSON.stringify({ source: "github-actions", stage, message, repo,
      issue: issue ? Number(issue) : null, pr: pr ? Number(pr) : null, run_url: run || null }));
  ' "$1" "$2" "${3:-}" "${4:-}" "$REPO" "${RUN_URL:-}" \
  | curl -fsS -m 10 -H 'Content-Type: application/json' --data-binary @- "$url" >/dev/null 2>&1 \
  || log "⚠️ n8n 通知失败（忽略）: $1"
}

RUN_URL=""
[ -n "${GITHUB_RUN_ID:-}" ] && RUN_URL="${GITHUB_SERVER_URL:-https://github.com}/${REPO}/actions/runs/${GITHUB_RUN_ID}"

set_label() { # set_label <issue|pr number> <add> [remove...]
  local n="$1" add="$2"; shift 2
  local args=(--add-label "$add")
  for r in "$@"; do args+=(--remove-label "$r"); done
  gh issue edit "$n" -R "$REPO" "${args[@]}" >/dev/null 2>&1 || log "⚠️ 标签更新失败: #$n +$add"
}

# 统计某 PR 上 QA 打回次数（用于 attempt 上限，防止死循环烧额度）
qa_reject_count() {
  gh api "repos/${REPO}/issues/$1/comments" --paginate --jq \
    "[.[] | select(.body | contains(\"${QA_MARK_REJECT}\"))] | length" 2>/dev/null \
  | awk '{s+=$1} END{print s+0}'
}

ensure_labels() {
  local spec
  for spec in "agent:dev|1d76db|Dev Agent 认领施工" "agent:qa|fbca04|等待 QA Agent 独立验收" \
              "qa:accepted|0e8a16|QA 通过（自动合并）" "qa:rejected|d93f0b|QA 打回" \
              "agent:blocked|b60205|超过重试上限，需人工介入"; do
    IFS='|' read -r name color desc <<<"$spec"
    gh label create "$name" -R "$REPO" --color "$color" --description "$desc" >/dev/null 2>&1 || true
  done
}
