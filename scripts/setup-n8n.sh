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
    
    # 获取 n8n 当前项目的 Project ID (默认为个人项目)
    PROJECT_ID=$(docker exec -u node firebird-n8n node -e '
      try {
        const sqlite3 = require("better-sqlite3");
        const db = new sqlite3("/home/node/.n8n/database.sqlite");
        const row = db.prepare("SELECT id FROM project WHERE type = ? LIMIT 1").get("personal");
        if (row) console.log(row.id);
      } catch (e) {
        // fallback
      }
    ' 2>/dev/null || true)
    
    PROJECT_FLAG=""
    if [ -n "$PROJECT_ID" ]; then
        PROJECT_FLAG="--projectId=${PROJECT_ID}"
        echo "   👤 绑定所属工作空间: Project ID [${PROJECT_ID}]"
    fi

    IMPORTED_COUNT=0
    for wf in "$WORKFLOW_DIR"/*.json; do
        FILENAME="$(basename "$wf")"
        docker cp "$wf" "firebird-n8n:/tmp/${FILENAME}"
        if docker exec -u node firebird-n8n n8n import:workflow --input="/tmp/${FILENAME}" $PROJECT_FLAG > /dev/null 2>&1; then
            echo "   ✅ 成功导入: ${FILENAME}"
            IMPORTED_COUNT=$((IMPORTED_COUNT + 1))
        else
            echo "   ⚠️  导入异常: ${FILENAME}"
        fi
    done
    echo "🎉 n8n 工作流同步完成！共成功导入 ${IMPORTED_COUNT} 个核心自动化流程。"
else
    echo "💡 提示: firebird-n8n 容器尚未启动。启动后可再次运行本脚本自动导入工作流。"
fi

echo "======================================================================"
echo "🌐 访问 http://localhost:5678 查看并开启工作流 (Workflows)"
echo "======================================================================"
