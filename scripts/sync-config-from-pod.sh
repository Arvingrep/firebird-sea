#!/usr/bin/env bash
# ==============================================================================
# 🔥 [火鸟云原生配置沉淀引擎] 从在线 Pod 反向提取后台 UI 更改并固化至 Git (Config-as-Code)
# ==============================================================================

set -euo pipefail

SITE="${1:-canary}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "======================================================================"
echo "🔄 [配置沉淀闭环] 从站点 [${SITE}] 提取后台 UI 运行配置并沉淀回本地代码库..."
echo "======================================================================"

POD=$(kubectl get pods -l "app=firebird-site,site=${SITE}" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || true)
if [ -z "$POD" ]; then
    echo "❌ 未找到站点 ${SITE} 对应的运行中 Pod！"
    exit 1
fi

echo "  📦 目标 Pod: ${POD}"

# 提取关键业务配置文件
CONFIG_FILES=(
    "siteConfig.inc.php"
    "fenxiaoConfig.inc.php"
    "waimai.inc.php"
    "wechatConfig.inc.php"
    "business.inc.php"
    "settlement.inc.php"
)

mkdir -p "${ROOT_DIR}/webroot/include/config"

for cfg in "${CONFIG_FILES[@]}"; do
    if kubectl exec -n default "${POD}" -c php-fpm -- test -f "/var/www/html/include/config/${cfg}" 2>/dev/null; then
        echo -n "  📥 提取 ${cfg} ... "
        kubectl cp "default/${POD}:/var/www/html/include/config/${cfg}" "${ROOT_DIR}/webroot/include/config/${cfg}" -c php-fpm
        echo "✅ 完成"
    fi
done

echo "======================================================================"
echo "🎉 提取完成！所有后台 UI 变动已沉淀到本地 webroot/include/config/ 目录。"
echo "   您可以直接运行: git diff 查看改动，并提交至 Git 固化版本。"
echo "======================================================================"
