#!/usr/bin/env bash
# ==============================================================================
# 🔥 一人 AI 团队工程脱水剪枝工具 (Anti-Bloat Clean-up Tool)
# ==============================================================================

set -euo pipefail

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${BASE_DIR}"

echo "🧹 [1/4] 清理临时备份与中间构建文件 (*.bak, *.tmp, *~)..."
find . -type f \( -name "*.bak" -o -name "*.tmp" -o -name "*~" -o -name ".DS_Store" \) -not -path "*/node_modules/*" -not -path "*/.git/*" -delete || true

echo "🧹 [2/4] 清理悬挂大日志文件 (*.log)..."
find . -type f -name "*.log" -not -path "*/node_modules/*" -not -path "*/.git/*" -size +10M -delete || true

echo "🧹 [3/4] 归档已完成的任务 Spec..."
mkdir -p .agents/tasks/archive
if [ -d ".agents/tasks/specs" ]; then
  for spec in .agents/tasks/specs/*.md; do
    if [ -f "$spec" ] && grep -qi "status: done" "$spec" 2>/dev/null; then
      mv "$spec" .agents/tasks/archive/
      echo "   📦 已归档已完成任务: $(basename "$spec")"
    fi
  done
fi

echo "🧹 [4/4] 检查并清理本地 Docker 悬挂镜像..."
if command -v docker >/dev/null 2>&1; then
  docker image prune -f >/dev/null 2>&1 || true
fi

echo "✅ [完成] 工程体系脱水剪枝成功！保持极致敏捷与轻量状态。"
