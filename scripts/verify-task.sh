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
# .agents/tasks 已随 BMAD 体系下线（2026-10-27），目录不存在是预期状态；
# 这里只要求 .agents 本身在（RULES.md / secret-scan-allow.txt 等仍在用）。
for dir in webroot docs .agents; do
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

# 5. 流程脚本自测（门禁自测 + Makefile 自测）：快、纯本地
#    曾经这里列过 4 项，其中 2 项（scripts/bmad/*.test.js、scripts/acceptance/selftest.sh）
#    指向已下线的 BMAD 体系。判定用 `f="${t##* }"; [ -e "$f" ] || continue` 取「最后一个词」，
#    拿到的是不存在的 scripts/bmad/sync.test.js → 静默 continue，**永久失效且不留任何提示**。
#    现在改为：列在这里的脚本必须存在，不存在就 FAIL —— 假绿比红危险。
for t in "node --test scripts/makefile.test.js" "bash scripts/test-gates.sh"; do
    f="${t##* }"   # 显式列出测试文件：Node 20 对目录参数会把目录下所有 .js 当测试跑
    [ -e "$f" ] || { echo "❌ [FAIL] 自测脚本不存在：$f（列在 verify-task.sh 里就必须能被找到）"; exit 1; }
    if $t >/dev/null 2>&1; then echo "  ✅ $t [通过]"; else echo "❌ [FAIL] $t"; $t 2>&1 | tail -15; exit 1; fi
done

# 6. Node 服务单元测试 (node:test，零依赖，资金路径必须有测试)；服务目录不存在时跳过
for svc in services/api services/payment-listener services/news-sync; do
    if [ -f "$svc/package.json" ] && grep -q '"test"' "$svc/package.json"; then
        if [ -f "$svc/package-lock.json" ] && [ ! -d "$svc/node_modules" ]; then (cd "$svc" && npm ci --workspaces=false --no-audit --no-fund >/dev/null 2>&1); fi
        if (cd "$svc" && npm test --silent >/dev/null 2>&1); then echo "  ✅ $svc 单元测试 [通过]"
        else echo "❌ [FAIL] $svc 单元测试，请运行 (cd $svc && npm test) 查看详情"; exit 1; fi
    fi
done

# 6.2 TMA（Telegram Mini App）前端：类型检查 + 单元测试 + 构建
#     这是整套门禁此前最大的缺口：apps/tma 有 9 个测试文件（101 个用例）、typecheck 与 vite build，
#     但 verify-task.sh 只跑 services/ 下三个服务，TMA 的构建要等 merge 之后由 Dockerfile.api 触发。
#     结果是：TMA 编译不过或测试挂了，PR 门禁全绿，合并后才炸 —— 而且正好炸在最想推的模块上。
if [ -f apps/tma/package.json ]; then
    if [ ! -d apps/tma/node_modules ]; then
        (cd apps/tma && npm ci --no-audit --no-fund >/dev/null 2>&1) || { echo "❌ [FAIL] apps/tma 依赖安装失败（npm ci）"; exit 1; }
    fi
    if (cd apps/tma && npm run typecheck >/dev/null 2>&1); then echo "  ✅ apps/tma 类型检查 [通过]"
    else echo "❌ [FAIL] apps/tma 类型检查失败："; (cd apps/tma && npm run typecheck 2>&1 | tail -15); exit 1; fi
    if (cd apps/tma && npm test >/dev/null 2>&1); then echo "  ✅ apps/tma 单元测试 [通过]"
    else echo "❌ [FAIL] apps/tma 单元测试失败，请运行 (cd apps/tma && npm test) 查看详情"; exit 1; fi
    if (cd apps/tma && npm run build >/dev/null 2>&1); then echo "  ✅ apps/tma 构建 [通过]"
    else echo "❌ [FAIL] apps/tma 构建失败："; (cd apps/tma && npm run build 2>&1 | tail -15); exit 1; fi
fi

# 6.5 Story 6.3 完整链路替身验收(采集→去重→发布→重试→告警,零外部依赖,断言在脚本内);不存在则跳过
if [ -f services/news-sync/e2e-local.sh ]; then
    E2E_OUT="$(mktemp -d)"
    # 端口不能写死：端口是机器级资源，同机并发验收（不同 worktree 也一样）会抢同一个端口，
    # 症状是 EADDRINUSE / curl 502，报错看起来像功能坏了而不是环境冲突。这里探一个空闲端口再传进去。
    E2E_PORT="$(node -e 'const s=require("net").createServer();s.listen(0,"127.0.0.1",()=>{const p=s.address().port;s.close(()=>console.log(p))})' 2>/dev/null || true)"
    if [ -z "$E2E_PORT" ]; then
        # 只有探测失败（无 node / node 报错被 2>/dev/null 吞掉）才走到这里：回落旧值，但必须留痕。
        # 不留痕的话，下次有人撞上 EADDRINUSE / curl 502，会重新排查一遍已经查过的并发问题。
        echo "  ⚠️ [WARN] 未探到空闲端口，回落 18190（同机并发跑验收可能撞 EADDRINUSE/502）"
    fi
    if bash services/news-sync/e2e-local.sh "$E2E_OUT" "${E2E_PORT:-18190}" >/dev/null 2>&1; then echo "  ✅ news-sync 完整链路替身验收 [通过]"
    else echo "❌ [FAIL] news-sync 完整链路替身验收(末尾日志):"; tail -20 "$E2E_OUT/full-run.txt" 2>/dev/null; exit 1; fi
fi

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
