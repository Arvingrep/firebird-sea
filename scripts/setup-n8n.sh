#!/usr/bin/env bash
# ==============================================================================
# 🔥 n8n 自动化中枢工作流自动挂载与同步脚本 (支持 GKE 生产与本地双引擎)
# 生产域名: https://n8n.k8shome.com (GKE namespace: n8n)
# ==============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "======================================================================"
echo "⚙️  [基建: n8n 自动化] 正在同步与预加载一人团队核心工作流..."
echo "    🎯 生产目标: https://n8n.k8shome.com (GKE 集群: zxem-prod-gke)"
echo "======================================================================"

WORKFLOW_DIR="automation/n8n/workflows"

if [ ! -d "$WORKFLOW_DIR" ]; then
    echo "❌ 缺少工作流目录: $WORKFLOW_DIR"
    exit 1
fi

echo "📋 待同步的核心工作流清单:"
for wf in "$WORKFLOW_DIR"/*.json; do
    echo "   🔹 $(basename "$wf")"
done

# --- 1. 同步至 GKE 生产集群 n8n (https://n8n.k8shome.com) ---
echo ""
echo "☸️  [1/2] 正在检查 GKE 生产命名空间 n8n..."
GKE_POD=$(kubectl get pod -n n8n -l app.kubernetes.io/name=n8n -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || true)

if [ -n "$GKE_POD" ]; then
    echo "   🚀 发现生产 Pod: [${GKE_POD}] (namespace: n8n)"
    GKE_COUNT=0
    for wf in "$WORKFLOW_DIR"/*.json; do
        FILENAME="$(basename "$wf")"
        kubectl cp "$wf" "n8n/${GKE_POD}:/tmp/${FILENAME}" > /dev/null 2>&1
        if kubectl exec -n n8n "${GKE_POD}" -- n8n import:workflow --input="/tmp/${FILENAME}" > /dev/null 2>&1; then
            echo "   ✅ [GKE] 成功注入: ${FILENAME}"
            GKE_COUNT=$((GKE_COUNT + 1))
        else
            echo "   ⚠️  [GKE] 导入警告: ${FILENAME}"
        fi
    done
    echo "   🎉 GKE 生产环境 (https://n8n.k8shome.com) 已同步 ${GKE_COUNT} 个工作流！"
else
    echo "   💡 未检测到 GKE n8n Pod，跳过云端注入。"
fi

# --- 2. 同步至本地 Docker n8n (如果正在运行) ---
echo ""
echo "🐳 [2/2] 正在检查本地 Docker 容器 firebird-n8n..."
if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "firebird-n8n"; then
    PROJECT_ID=$(docker exec -u node firebird-n8n node -e '
      try {
        const sqlite3 = require("better-sqlite3");
        const db = new sqlite3("/home/node/.n8n/database.sqlite");
        const row = db.prepare("SELECT id FROM project WHERE type = ? LIMIT 1").get("personal");
        if (row) console.log(row.id);
      } catch (e) {}
    ' 2>/dev/null || true)
    
    PROJECT_FLAG=""
    if [ -n "$PROJECT_ID" ]; then
        PROJECT_FLAG="--projectId=${PROJECT_ID}"
    fi

    LOCAL_COUNT=0
    for wf in "$WORKFLOW_DIR"/*.json; do
        FILENAME="$(basename "$wf")"
        docker cp "$wf" "firebird-n8n:/tmp/${FILENAME}" > /dev/null 2>&1
        if docker exec -u node firebird-n8n n8n import:workflow --input="/tmp/${FILENAME}" $PROJECT_FLAG > /dev/null 2>&1; then
            echo "   ✅ [Docker] 成功导入: ${FILENAME}"
            LOCAL_COUNT=$((LOCAL_COUNT + 1))
        fi
    done
    echo "   🎉 本地容器环境同步完成 (共 ${LOCAL_COUNT} 个)。"
else
    echo "   💡 本地 firebird-n8n 容器未运行，优先使用 GKE 生产实例。"
fi

echo "======================================================================"
echo "🌐 生产控制台: https://n8n.k8shome.com"
echo "🌐 本地开发台: http://localhost:5678"
echo "======================================================================"
