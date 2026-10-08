#!/usr/bin/env bash
# ==============================================================================
# 🔥 n8n 自动化中枢工作流自动挂载与同步脚本 (n8n Provisioning Script)
# ==============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "======================================================================"
echo "⚙️  [基建: n8n 自动化] 正在同步与预加载一人团队核心工作流..."
echo "======================================================================"

WORKFLOW_DIR="automation/n8n/workflows"

if [ ! -d "$WORKFLOW_DIR" ]; then
    echo "❌ 缺少工作流目录: $WORKFLOW_DIR"
    exit 1
fi

echo "📋 待加载的核心工作流清单:"
for wf in "$WORKFLOW_DIR"/*.json; do
    echo "   🔹 $(basename "$wf")"
done

# 如果 Docker 中的 n8n 容器处于运行状态，自动将工作流导入容器内
if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "firebird-n8n"; then
    echo "📦 正在向运行中的 firebird-n8n 容器注入工作流..."
    for wf in "$WORKFLOW_DIR"/*.json; do
        docker cp "$wf" firebird-n8n:/tmp/$(basename "$wf")
        docker exec -u node firebird-n8n n8n import:workflow --input=/tmp/$(basename "$wf") || true
    done
    echo "✅ n8n 容器工作流导入完成！"
else
    echo "💡 提示: firebird-n8n 容器尚未启动。启动后可再次运行本脚本自动导入工作流。"
fi

echo "======================================================================"
echo "🎉 [通过] n8n 自动化基建模版就绪！访问 http://localhost:5678 查看编排画板。"
echo "======================================================================"
