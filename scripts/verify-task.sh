#!/usr/bin/env bash

# ==========================================================
# 一人 AI 团队工程质检卡点 (Quality & Docs-as-Code Gate)
# ==========================================================

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "🔍 正在进行一人 AI 团队质量与文档卡点检查 (Verification Gate)..."

# 1. 检查授权文件完整性
if [ ! -f "license/huoniao.php" ]; then
    echo "❌ [FAIL] 缺少官方商业授权证书: license/huoniao.php"
    exit 1
fi
echo "  ✅ 官方商业授权证书 [通过]"

# 2. 检查关键目录
for dir in webroot docs .agents/tasks; do
    if [ ! -d "$dir" ]; then
        echo "❌ [FAIL] 缺失关键架构目录: $dir"
        exit 1
    fi
done
echo "  ✅ 核心架构目录完整性 [通过]"

# 3. Docs as Code 强制联动卡点 (检查 Git 暂存区或工作区)
CODE_CHANGED=0
DOCS_CHANGED=0

# 检查是否有代码变动 (PHP, JS, TS, HTML)
if git status --porcelain | grep -E '\.(php|js|ts|html|vue|json)' | grep -v 'package' &>/dev/null; then
    CODE_CHANGED=1
fi

# 检查 docs 目录是否变动
if git status --porcelain | grep -E 'docs/' &>/dev/null; then
    DOCS_CHANGED=1
fi

if [ "$CODE_CHANGED" -eq 1 ] && [ "$DOCS_CHANGED" -eq 0 ]; then
    echo "⚠️  [WARN] 检测到核心代码产生变更，但 /docs/ 目录尚未同步更新！"
    echo "    依据 .agents/RULES.md 规范，一人团队要求 AI Agent 必须在同一变更中同步更新文档。"
else
    echo "  ✅ Docs-as-Code 规范对齐 [通过]"
fi

# 4. PHP 语法检测 (如果 webroot 中存在 PHP 文件)
if command -v php &>/dev/null; then
    PHP_FILES=$(find webroot -maxdepth 3 -name "*.php" 2>/dev/null | head -n 10 || true)
    if [ -n "$PHP_FILES" ]; then
        for f in $PHP_FILES; do
            php -l "$f" > /dev/null
        done
        echo "  ✅ PHP 核心文件语法检测 [通过]"
    fi
fi

# 5. 流程脚本自测（BMAD 建单/回写、测试先行运行器、门禁）：快、纯本地
for t in "node --test scripts/bmad/" "bash scripts/acceptance/selftest.sh" "bash scripts/test-gates.sh"; do
    f="${t##* }"; [ -e "$f" ] || continue
    if $t >/dev/null 2>&1; then echo "  ✅ $t [通过]"; else echo "❌ [FAIL] $t"; $t 2>&1 | tail -15; exit 1; fi
done

# 6. Node 服务单元测试 (node:test，零依赖，资金路径必须有测试)；服务目录不存在时跳过
for svc in services/api; do
    if [ -f "$svc/package.json" ] && grep -q '"test"' "$svc/package.json"; then
        if [ -f "$svc/package-lock.json" ] && [ ! -d "$svc/node_modules" ]; then (cd "$svc" && npm ci --workspaces=false --no-audit --no-fund >/dev/null 2>&1); fi
        if (cd "$svc" && npm test --silent >/dev/null 2>&1); then echo "  ✅ $svc 单元测试 [通过]"
        else echo "❌ [FAIL] $svc 单元测试，请运行 (cd $svc && npm test) 查看详情"; exit 1; fi
    fi
done

# 7. 数据库集成测试：CI 里必跑（需要 docker）；本机用 RUN_DB_TESTS=1 开启，避免日常校验变慢
#    scripts/test-api-db.sh 随 services/api 入库；不存在则跳过。非交互 runner 的 PATH 可能不含 docker，这里补常见位置。
if [ -f scripts/test-api-db.sh ] && { [ -n "${CI:-}" ] || [ "${RUN_DB_TESTS:-0}" = "1" ]; }; then
    export PATH="$HOME/.orbstack/bin:/usr/local/bin:/opt/homebrew/bin:$PATH"
    command -v docker >/dev/null || { echo "❌ [FAIL] 数据库集成测试需要 docker，但 runner 的 PATH 里没有 docker"; exit 1; }
    if bash scripts/test-api-db.sh >/tmp/verify-task-db.log 2>&1; then echo "  ✅ 数据库集成测试 [通过]"
    else echo "❌ [FAIL] 数据库集成测试（末尾日志）："; tail -25 /tmp/verify-task-db.log; exit 1; fi
fi

echo "=========================================================="
echo "🎉 恭喜！全流程质检与文档卡点验证全部 PASS！可以安全合并/交付。"
echo "=========================================================="
