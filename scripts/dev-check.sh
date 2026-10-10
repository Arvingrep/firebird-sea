#!/usr/bin/env bash
# ==============================================================================
# 🔥 一人 AI 团队：编码施工防臃肿质量门禁 (Dev Baseline & Anti-Bloat Gate)
# ==============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "======================================================================"
echo "🚧 [分工 2 编码基线] 运行 Dev Agent 防臃肿与代码纯净度卡点检查..."
echo "======================================================================"

FAILURES=0

# 1. 检查 Zero-Dep 依赖纯净度
echo -n "  📦 [1/4] 依赖审计 (Zero-Dep Rule) ... "
if git diff HEAD -- package.json composer.json 2>/dev/null | grep -E '^\+\s*"[a-zA-Z0-9_-]+":' | grep -v 'version' > /tmp/dep_diff.txt; then
    echo "⚠️ WARN (检测到新增第三方依赖)"
    echo "     请确认是否为原生可替代库: $(cat /tmp/dep_diff.txt)"
else
    echo "✅ PASS (零冗余外部依赖)"
fi

# 2. 检查单次变更增量行数 (<200 行推荐)
echo -n "  📏 [2/4] 代码增量脱水审计 (Diff Lines) ... "
DIFF_LINES=$(git diff --shortstat 2>/dev/null | awk '{print $4}' || echo "0")
if [ -n "$DIFF_LINES" ] && [ "$DIFF_LINES" -gt 1200 ]; then
    echo "⚠️ WARN (当前工作区增量代码达 ${DIFF_LINES} 行，超过 200 行建议上限，请检查是否存在过度封装)"
else
    echo "✅ PASS (增量在极简控制区间内: ${DIFF_LINES:-0} 行)"
fi

# 3. 检查调试垃圾与临时文件
echo -n "  🧹 [3/4] 代码纯净度审计 (No-Garbage Gate) ... "
GARBAGE_FILES=$(find . -maxdepth 3 -type f \( -name "*.bak" -o -name "*.tmp" -o -name "test_*.php" \) -not -path "*/node_modules/*" -not -path "*/.git/*" | wc -l | tr -d ' ')
if [ "$GARBAGE_FILES" -gt 0 ]; then
    echo "❌ FAIL (发现 ${GARBAGE_FILES} 个临时/备份文件，请先运行 make clean-bloat)"
    FAILURES=$((FAILURES + 1))
else
    echo "✅ PASS (无残留临时垃圾文件)"
fi

# 4. Docs-as-Code 联动卡点
echo -n "  📝 [4/4] 文档同步卡点 (Docs-as-Code) ... "
HAS_CODE_CHANGES=0
HAS_DOC_CHANGES=0

if git status --porcelain | grep -E '\.(php|js|ts|sql)' | grep -v 'scripts/' >/dev/null 2>&1; then
    HAS_CODE_CHANGES=1
fi
if git status --porcelain | grep -E 'docs/' >/dev/null 2>&1; then
    HAS_DOC_CHANGES=1
fi

if [ "$HAS_CODE_CHANGES" -eq 1 ] && [ "$HAS_DOC_CHANGES" -eq 0 ]; then
    echo "⚠️ WARN (检测到业务代码发生变更，但 docs/ 未检测到联动更新)"
else
    echo "✅ PASS (文档与代码对齐)"
fi

echo "======================================================================"
if [ "$FAILURES" -eq 0 ]; then
    echo "🎉 [通过] 编码施工基线校验全部合格！可以提交并请求独立红队验收。"
    exit 0
else
    echo "❌ [驳回] 发现 ${FAILURES} 处违规，请先修正后再提交验收！"
    exit 1
fi
