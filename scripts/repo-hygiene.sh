#!/usr/bin/env bash
# 仓库卫生守门（repo hygiene）
#
# 目的：把「仓库不再被垃圾污染」变成机器可执行的规则，而不是靠人记得。
# 背景：2026-10 清理时发现 45 个云盘同步冲突副本（xxx 2.md）、270MB 旧安装包、
#       9 个 n8n 工作流里 6 个目标系统已不存在。这些都不该再进来。
#
# 用法：
#   bash scripts/repo-hygiene.sh                    # 全仓体检（本地，慢但彻底）
#   bash scripts/repo-hygiene.sh --diff origin/main  # 只查本次改动（CI 用）
#
# 退出码：0 通过 / 1 有问题

set -uo pipefail

BASE="${2:-origin/main}"
MODE="all"
[ "${1:-}" = "--diff" ] && MODE="diff"

cd "$(git rev-parse --show-toplevel)" || exit 1
FAIL=0
say() { printf '%s\n' "$*"; }
bad() { printf '❌ %s\n' "$*"; FAIL=1; }

# ---------- 待检文件清单 ----------
if [ "$MODE" = "diff" ]; then
  # 相对 base 新增或修改的文件（不含删除）
  # 用两点 diff：CI 里工作区=HEAD 等效 merge-base 比较；
  # 再补上未追踪文件——云盘同步产生副本时往往还没 commit，
  # 那恰恰是最该被拦住的一刻，只查已提交文件会漏掉。
  LIST=$( { git diff --name-only --diff-filter=AMR "$BASE" 2>/dev/null
            git ls-files --others --exclude-standard 2>/dev/null; } | sort -u )
  if [ -z "$LIST" ]; then
    say "ℹ️  本次改动没有新增/修改文件，跳过"
    exit 0
  fi
  say "🔍 增量模式：比对 $BASE + 未追踪文件"
else
  LIST=$(git ls-files)
  say "🔍 全仓模式：$(printf '%s\n' "$LIST" | wc -l | tr -d ' ') 个入库文件"
fi
say ""

# ---------- 1. 同步冲突副本 ----------
# 云盘同步打架的典型产物： "AGENTS 2.md"、"config 11.json"、"report (1).md"
DUP=$(printf '%s\n' "$LIST" | grep -E ' [0-9]+\.[A-Za-z0-9]+$| \([0-9]+\)\.[A-Za-z0-9]+$| (copy|kopie|conflicted copy)[^/]*\.' || true)
if [ -n "$DUP" ]; then
  bad "发现同步冲突副本（文件名带「 2」「(1)」「copy」等）："
  printf '%s\n' "$DUP" | head -20 | sed 's/^/     /'
  say "     → 删除副本，只保留正本；这类文件永远不该入库"
else
  say "✅ 无同步冲突副本"
fi

# ---------- 2. 禁止入库的路径 ----------
FORBIDDEN='^(\.agent-runs|backup_configs|node_modules|downloads|\.n8nac)/|/node_modules/'
BANNED=$(printf '%s\n' "$LIST" | grep -E "$FORBIDDEN" || true)
if [ -n "$BANNED" ]; then
  bad "发现禁止入库的目录（临时产物 / 依赖 / 备份）："
  printf '%s\n' "$BANNED" | head -20 | sed 's/^/     /'
  say "     → 加进 .gitignore 并 git rm --cached"
else
  say "✅ 无禁止入库目录"
fi

# ---------- 3. 大文件（仅增量模式检查，存量火鸟资产豁免）----------
if [ "$MODE" = "diff" ]; then
  LIMIT=$((5 * 1024 * 1024))   # 5MB
  BIG=""
  while IFS= read -r f; do
    [ -f "$f" ] || continue
    sz=$(wc -c < "$f" 2>/dev/null | tr -d ' ')
    [ -z "$sz" ] && continue
    if [ "$sz" -gt "$LIMIT" ]; then
      BIG="$BIG$(printf '%6.1fMB  %s\n' "$(echo "$sz" | awk '{print $1/1048576}')" "$f")
"
    fi
  done <<EOF
$LIST
EOF
  if [ -n "$BIG" ]; then
    bad "新增文件超过 5MB（二进制资产请确认是否真的需要入库）："
    printf '%s' "$BIG" | sed 's/^/     /'
    say "     → 大文件优先走对象存储 / 发布包，或确认后在此脚本加白名单"
  else
    say "✅ 无超限新增文件"
  fi
else
  say "⏭️  大文件检查仅增量模式执行（存量火鸟模板资产不追溯）"
fi

# ---------- 4. 文档登记表一致性（n8n）----------
if [ -f automation/n8n/REGISTRY.md ]; then
  say "✅ n8n 工作流登记表存在（automation/n8n/REGISTRY.md）"
else
  bad "缺少 automation/n8n/REGISTRY.md —— 工作流改动无从追溯"
fi

# ---------- 5. 脚本可执行位（避免 CI 里 bash 找不到）----------
NOEXEC=$(printf '%s\n' "$LIST" | grep -E '^scripts/.*\.sh$' | while read -r f; do
  [ -f "$f" ] && [ ! -x "$f" ] && echo "$f"
done || true)
if [ -n "$NOEXEC" ]; then
  say "⚠️  以下脚本没有可执行位（用 bash 调用仍可跑，建议 chmod +x）："
  printf '%s\n' "$NOEXEC" | head -10 | sed 's/^/     /'
fi

say ""
if [ "$FAIL" -eq 1 ]; then
  say "❌ 仓库卫生检查未通过"
  exit 1
fi
say "✅ 仓库卫生检查通过"
