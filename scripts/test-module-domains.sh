#!/usr/bin/env bash
# 模块域名/子目录配置静态校验（无需网络/数据库）
# 校验 values.yaml configVars 的 customSubDomain=2 与 seed_module_domains.php 的路径表一致，
# 且脚本默认 dry-run、路径不冲突、OFFLINE 模块被下线。缺 php 时 lint 步骤 SKIP（GATE_REQUIRE_TOOLS=1 时判失败）。
set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

VALUES="deploy/helm/firebird-site/values.yaml"
SEED="scripts/seed_module_domains.php"
DOC="docs/internal/MODULE_DOMAINS.md"
FAIL=0
bad() { echo "  ❌ $*"; FAIL=1; }
ok()  { echo "  ✅ $*"; }

# seed 脚本 $paths 表：每行 "module => 'path'"
seed_pairs() { sed -n "/^\$paths = \[/,/^\];/p" "$SEED" | sed -n "s/^ *'\([a-z_]*\)' *=> *'\([^']*\)'.*/\1 \2/p"; }
# values.yaml 中 customSubDomain: 2 的模块（<module>.inc.php）
values_subdir_modules() {
  awk '/^configVars:/{in_cv=1; next} in_cv && /^[^ #]/{in_cv=0}
       in_cv && /^  [a-z_]+\.inc\.php:/{gsub(/[ :]|\.inc\.php/,"",$0); mod=$0}
       in_cv && /customSubDomain: *2/{print mod}' "$VALUES"
}

echo "[1] 文件存在"
for f in "$VALUES" "$SEED" "$DOC"; do
  [ -f "$f" ] && ok "$f" || bad "缺少 $f"
done
[ "$FAIL" = 0 ] || { echo "FAIL"; exit 1; }

echo "[2] 路径表非空、路径唯一、无非法字符"
pairs="$(seed_pairs)"
[ -n "$pairs" ] && ok "共 $(echo "$pairs" | wc -l | tr -d ' ') 个模块" || bad "未解析到 \$paths"
dups="$(echo "$pairs" | awk '{print $2}' | sort | uniq -d)"
[ -z "$dups" ] && ok "路径无重复" || bad "路径重复: $dups"
echo "$pairs" | awk '$2 !~ /^[a-z0-9_-]+$/ {print $2}' | grep -q . && bad "路径含非法字符" || ok "路径格式合法"

echo "[3] values.yaml 与 seed 路径表模块集合一致"
a="$(echo "$pairs" | awk '{print $1}' | sort)"
b="$(values_subdir_modules | sort)"
[ "$a" = "$b" ] && ok "两侧一致" || bad "不一致: seed=[$(echo $a)] values=[$(echo $b)]"

echo "[4] Issue 中 404/500 的模块均已覆盖（news/shop/zhuang/baokan/jianzhan）"
for p in news shop zhuang baokan jianzhan; do
  echo "$pairs" | awk '{print $2}' | grep -qx "$p" && ok "/$p" || bad "路径 /$p 未配置"
done

echo "[5] zhaopin 服务未开通 → 下线入口"
grep -q "^\$offline = \[.*'zhaopin'" "$SEED" && ok "offline 含 zhaopin" || bad "zhaopin 未列入 \$offline"
echo "$pairs" | awk '{print $1}' | grep -qx zhaopin && bad "zhaopin 不应同时配置子目录" || ok "zhaopin 未配置子目录"

echo "[6] 安全：默认 dry-run，写库仅在 --apply 之后，且只补空不覆盖"
grep -q "in_array('--apply'" "$SEED" && ok "解析 --apply" || bad "缺少 --apply 开关"
grep -c 'if (!\$apply) { continue; }' "$SEED" | grep -qx 1 && ok "循环内 dry-run 提前 continue" || bad "路径写入未受 \$apply 保护"
grep -q 'if (\$apply)' "$SEED" && ok "offline 更新受 \$apply 保护" || bad "offline 更新未受保护"
grep -q "\$row\['domain'\] !== ''" "$SEED" && ok "已有值跳过" || bad "会覆盖已有域名"

echo "[7] PHP 语法"
if command -v php >/dev/null 2>&1; then
  php -l "$SEED" >/dev/null 2>&1 && ok "php -l" || bad "php -l 失败"
elif [ "${GATE_REQUIRE_TOOLS:-0}" = 1 ]; then
  bad "缺 php"
else
  echo "  ⏭  SKIP（本机无 php）"
fi

echo "[8] Helm 渲染不被破坏"
if command -v helm >/dev/null 2>&1; then
  helm template t deploy/helm/firebird-site >/dev/null 2>&1 && ok "helm template" || bad "helm template 失败"
elif [ "${GATE_REQUIRE_TOOLS:-0}" = 1 ]; then
  bad "缺 helm"
else
  echo "  ⏭  SKIP（本机无 helm）"
fi

[ "$FAIL" = 0 ] && echo "PASS" || { echo "FAIL"; exit 1; }
