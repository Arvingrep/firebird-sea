#!/usr/bin/env bash

# ==============================================================================
# BMAD 独立验收智能体 (Acceptance Runner) — 诚实版
# 原则：报告只反映真实检查结果；绝不写死 PASS、绝不编套话。
#       专门抓两类之前被放过的假象：
#         ① Dev Agent 啥也没干（任务分支相对 main 无任何提交/改动）
#         ② 改了代码却没按 Docs-as-Code 同步 docs/
# 用法：scripts/acceptance-runner.sh <TASK-ID>
# 退出码：任一检查 FAIL => 非 0（供 make release / CI 卡点使用）
# ==============================================================================

set -uo pipefail

TASK_ID="${1:-}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ -z "$TASK_ID" ]; then
  echo "❌ 用法: scripts/acceptance-runner.sh <TASK-ID>（如 TASK-010）"
  exit 2
fi

REPORT_DIR="$ROOT_DIR/.agents/tasks/reports"
mkdir -p "$REPORT_DIR"
TIMESTAMP="$(date +'%Y-%m-%d %H:%M:%S')"
REPORT_FILE="$REPORT_DIR/${TASK_ID}-ACCEPTANCE.md"

echo "======================================================================"
echo "🛡️  独立验收: 对 [${TASK_ID}] 执行真实审计（结果据实记录，不自夸）"
echo "======================================================================"

# --- 定位任务规格与其工作分支 ---------------------------------------------
TASK_FILE="$(ls .agents/tasks/${TASK_ID}*.md 2>/dev/null | head -n1 || true)"
if [ -z "$TASK_FILE" ]; then
  echo "❌ 未找到任务规格文件 .agents/tasks/${TASK_ID}*.md —— 不能验收一个不存在的任务。"
  exit 2
fi

BASE="main"; git rev-parse --verify -q origin/main >/dev/null 2>&1 && BASE="origin/main"
NUM="$(printf '%s' "$TASK_ID" | grep -oE '[0-9]+' | head -n1)"
BRANCH="$(git for-each-ref --format='%(refname:short)' refs/heads 2>/dev/null \
          | grep -iE "task-0*${NUM}([^0-9]|$)" | head -n1 || true)"
HEAD_REF="HEAD"; [ -n "$BRANCH" ] && HEAD_REF="$BRANCH"
RANGE="${BASE}...${HEAD_REF}"

CHANGED="$(git diff --name-only "$RANGE" 2>/dev/null || true)"
ADDED_LINES="$(git diff --numstat "$RANGE" 2>/dev/null | awk '{a+=$1} END{print a+0}')"
COMMITS="$(git rev-list --count "${BASE}..${HEAD_REF}" 2>/dev/null || echo 0)"
NFILES="$(printf '%s' "$CHANGED" | grep -c . || true)"

echo "  📄 任务规格: ${TASK_FILE}"
echo "  🌿 对比区间: ${RANGE}  (提交=${COMMITS}, 改动文件=${NFILES}, 新增行=${ADDED_LINES})"
echo ""

NAMES=(); RESULTS=(); DETAILS=()
record() { NAMES+=("$1"); RESULTS+=("$2"); DETAILS+=("$3"); }
run() {
  local name="$1"; shift
  if eval "$*" >/tmp/acc_step.log 2>&1; then
    echo "  ✅ ${name}"; record "$name" PASS ""
  else
    local d; d="$(head -n2 /tmp/acc_step.log | tr '\n' ' ' | cut -c1-160)"
    echo "  ❌ ${name} — ${d}"; record "$name" FAIL "$d"
  fi
}

# 1) 实现存在性：抓「Dev Agent 啥也没干」
if [ "$COMMITS" -gt 0 ] && [ -n "$CHANGED" ]; then
  echo "  ✅ 实现存在性：${COMMITS} 提交 / ${NFILES} 文件改动"
  record "实现存在性（分支相对 main 有真实改动）" PASS ""
else
  echo "  ❌ 实现存在性：相对 ${BASE} 无任何提交/改动 —— 判为「空交付」"
  record "实现存在性（分支相对 main 有真实改动）" FAIL "0 提交/0 改动：疑似未真正施工"
fi

# 2) Docs-as-Code：AC 提到 Docs 且有代码改动时，docs/ 必须被同步修改
if grep -qiE "Docs|文档" "$TASK_FILE"; then
  if [ -z "$CHANGED" ]; then
    record "Docs-as-Code（同步更新 docs/）" FAIL "无任何改动"
    echo "  ❌ Docs-as-Code：无改动"
  elif printf '%s\n' "$CHANGED" | grep -qE '^docs/'; then
    echo "  ✅ Docs-as-Code：改动包含 docs/"
    record "Docs-as-Code（同步更新 docs/）" PASS ""
  else
    echo "  ❌ Docs-as-Code：改了代码却未同步任何 docs/（违反铁律）"
    record "Docs-as-Code（同步更新 docs/）" FAIL "改动未触及 docs/"
  fi
fi

# 3) 防臃肿增量：新增 > 200 行 => 需复审精简
if [ "${ADDED_LINES:-0}" -gt 200 ]; then
  echo "  ❌ 防臃肿增量：新增 ${ADDED_LINES} 行 > 200 阈值"
  record "防臃肿增量（≤200 行）" FAIL "新增 ${ADDED_LINES} 行超阈值"
else
  record "防臃肿增量（≤200 行）" PASS ""
fi

# 4) 仅对本次改动文件做语法检查
if [ -n "$CHANGED" ]; then
  while IFS= read -r f; do
    [ -f "$f" ] || continue
    case "$f" in
      *.php) command -v php  >/dev/null 2>&1 && run "PHP 语法: $f" "php -l '$f'" ;;
      *.js)  command -v node >/dev/null 2>&1 && run "JS 语法: $f"  "node -c '$f'" ;;
      *.sh)  run "Shell 语法: $f" "bash -n '$f'" ;;
      *.yml|*.yaml) command -v python3 >/dev/null 2>&1 && run "YAML 解析: $f" "python3 -c \"import yaml;list(yaml.safe_load_all(open('$f')))\"" ;;
    esac
  done <<< "$CHANGED"
fi

# 5) 基础设施/门禁（真实运行）
run "Docker LEMP 配置有效" "docker compose config >/dev/null"
[ -x scripts/dev-check.sh ] && run "防臃肿纯净度门禁 (dev-check)" "./scripts/dev-check.sh"
if printf '%s\n' "$CHANGED" | grep -qE '^deploy/helm/' && command -v helm >/dev/null 2>&1; then
  run "GKE Helm Chart lint" "helm lint deploy/helm/firebird-site"
fi

# --- 裁定（据真实结果）----------------------------------------------------
TOTAL=${#NAMES[@]}; PASSED=0; FAILED=0
for r in "${RESULTS[@]}"; do [ "$r" = PASS ] && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1)); done
if [ "$FAILED" -eq 0 ]; then DECISION="ACCEPTED"; BADGE="🟢 PASS"; else DECISION="REJECTED"; BADGE="🔴 REJECT"; fi

echo ""
echo "📊 真实统计: 共 ${TOTAL} 项, 通过 ${PASSED}, 失败 ${FAILED} -> ${DECISION}"

{
  echo "# 🛡️ 独立验收报告: ${TASK_ID}"
  echo ""
  echo "> 验收时间：${TIMESTAMP}  "
  echo "> 任务规格：\`${TASK_FILE}\`  "
  echo "> 对比区间：\`${RANGE}\`（提交 ${COMMITS}，改动文件 ${NFILES}，新增 ${ADDED_LINES} 行）  "
  echo "> 最终裁定：**${DECISION}** ${BADGE}  "
  echo "> 通过率：${PASSED}/${TOTAL}  "
  echo ""
  echo "## 审计项（据实记录）"
  echo ""
  echo "| # | 检查项 | 结果 | 失败详情 |"
  echo "| :--- | :--- | :--- | :--- |"
  for i in "${!NAMES[@]}"; do
    printf '| %s | %s | %s | %s |\n' "$((i+1))" "${NAMES[$i]}" "${RESULTS[$i]}" "${DETAILS[$i]:-}"
  done
  echo ""
  if [ "$FAILED" -ne 0 ]; then
    echo "## ❌ 打回原因"
    for i in "${!NAMES[@]}"; do
      [ "${RESULTS[$i]}" = FAIL ] && echo "- ${NAMES[$i]}：${DETAILS[$i]:-失败}"
    done
    echo ""
    echo "> 本报告由真实检查生成；修复后重跑 \`scripts/acceptance-runner.sh ${TASK_ID}\`。"
  else
    echo "> 全部审计项据实通过；具备合并凭据。"
  fi
} > "$REPORT_FILE"

echo "📄 报告已写入: ${REPORT_FILE}"
[ "$FAILED" -ne 0 ] && exit 1 || exit 0
