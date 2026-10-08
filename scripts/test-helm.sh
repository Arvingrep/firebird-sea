#!/usr/bin/env bash
# ==============================================================================
# 🔥 GKE Helm Chart 自动化静态质检与多站点渲染探针 (Helm & K8s Test Runner)
# ==============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "======================================================================"
echo "☸️  [基建: GKE Helm] 正在对火鸟门户 Helm Chart 进行全套静态校验..."
echo "======================================================================"

CHART_DIR="deploy/helm/firebird-site"

echo -n "  🔍 [1/3] Helm Lint 语法检查 ... "
helm lint "$CHART_DIR" > /tmp/helm_lint.log 2>&1
echo "✅ PASS"

echo -n "  🏙️ [2/3] 马尼拉分站 (Manila) 模板合成渲染 ... "
helm template firebird-manila "$CHART_DIR" -f "$CHART_DIR/values-manila.yaml" > /tmp/helm_manila.yaml
echo "✅ PASS"

echo -n "  🏖️ [3/3] 宿务分站 (Cebu) 模板合成渲染 ... "
helm template firebird-cebu "$CHART_DIR" -f "$CHART_DIR/values-cebu.yaml" > /tmp/helm_cebu.yaml
echo "✅ PASS"

echo "======================================================================"
echo "🎉 [通过] GKE Helm Chart 多站点配置校验 100% 正常，可安全复制分发！"
echo "======================================================================"
