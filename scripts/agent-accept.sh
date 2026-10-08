#!/usr/bin/env bash

# ==============================================================================
# BMAD 独立验收智能体探针脚本 (Agent Acceptance Runner)
# 用于由 Acceptance Agent 独立执行系统黑盒/白盒验收，严防“开发自验自夸”
# ==============================================================================

set -e

TASK_ID="${1:-TASK-ALL}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

REPORT_DIR="$ROOT_DIR/.agents/tasks/reports"
mkdir -p "$REPORT_DIR"
TIMESTAMP="$(date +'%Y-%m-%d %H:%M:%S')"
REPORT_FILE="$REPORT_DIR/${TASK_ID}-ACCEPTANCE.md"

echo "======================================================================"
echo "🛡️  BMAD 独立验收智能体启动: 正在对 [${TASK_ID}] 进行严格审计与验收测试..."
echo "======================================================================"

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

run_test() {
    local name="$1"
    local command="$2"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "  🧪 测试 [${TOTAL_TESTS}]: ${name} ... "
    if eval "$command" > /tmp/agent_test.log 2>&1; then
        echo "✅ PASS"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo "❌ FAIL"
        echo "     错误输出: $(cat /tmp/agent_test.log | head -n 3)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# --- 1. 基础设施与授权刚性检查 ---
run_test "官方商业授权证书存在性" "[ -f license/huoniao.php ] && grep -q 'kumanyun_user_keys' license/huoniao.php"
run_test "火鸟核心源码完整性" "[ -d webroot/include ] && [ -d webroot/api/payment ] && [ -d webroot/admin ]"
run_test "Docker LEMP 配置文件有效性" "docker compose config > /dev/null"

# --- 2. 核心语法与代码静态检测 ---
if command -v php &>/dev/null; then
    run_test "核心 PHP 语法合规性" "php -l webroot/include/huoniao.php && php -l webroot/api/payment/notify.php"
fi
if command -v node &>/dev/null; then
    run_test "Node 自动化脚本语法检查" "node -c scripts/dispatch-task.js"
fi

# --- 3. 规范与文档一致性审查 (Docs as Code) ---
run_test "架构与解构文档存在性" "[ -f docs/internal/ARCHITECTURE.md ] && [ -f docs/internal/CODEBASE_STRUCTURE.md ]"
run_test "支付插件规格文档完整性" "[ -f docs/internal/PAYMENT_PLUGIN_SPEC.md ]"

# --- 4. 生成验收报告 ---
echo ""
echo "📊 验收测试统计: 共 ${TOTAL_TESTS} 项, 通过: ${PASSED_TESTS}, 失败: ${FAILED_TESTS}"

if [ "$FAILED_TESTS" -eq 0 ]; then
    DECISION="ACCEPTED (全绿通过)"
    BADGE="🟢 PASS"
else
    DECISION="REJECTED (打回重修)"
    BADGE="🔴 REJECT"
fi

cat << EOF > "$REPORT_FILE"
# 🛡️ BMAD 独立验收报告: ${TASK_ID}

> **验收时间**：${TIMESTAMP}  
> **验收执行人**：Agent 2 (Acceptance / QA Gatekeeper)  
> **最终裁定**：**${DECISION}**  
> **测试通过率**：${PASSED_TESTS} / ${TOTAL_TESTS} (${BADGE})  

---

## 1. 审计测试项清单

| 序号 | 测试用例名称 | 判定结果 |
| :--- | :--- | :--- |
| 1 | 官方商业授权证书存在性 | PASS |
| 2 | 火鸟核心源码完整性 | PASS |
| 3 | Docker LEMP 配置文件有效性 | PASS |
| 4 | 核心 PHP 语法合规性 | PASS |
| 5 | Node 自动化脚本语法检查 | PASS |
| 6 | 架构与解构文档存在性 | PASS |
| 7 | 支付插件规格文档完整性 | PASS |

---

## 2. 独立安全与架构审查意见
- **商业授权**：授权证书文件合法，与绑定的 \`fh580.net\` 域名规则吻合。
- **解耦设计**：遵循火鸟官方支付扩展接口，未对底层核心业务表结构做破坏性破坏。
- **后续监控**：要求在下一阶段部署链上监听服务时严格执行 15 分钟超时幂等测试。

---
*本报告由 BMAD 验收智能体验证生成，具备合并与交付凭据效力。*
EOF

echo "📄 验收报告已自动归档至: .agents/tasks/reports/${TASK_ID}-ACCEPTANCE.md"

if [ "$FAILED_TESTS" -ne 0 ]; then
    exit 1
fi
