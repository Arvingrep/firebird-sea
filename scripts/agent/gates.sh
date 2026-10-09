#!/usr/bin/env bash
# 确定性门禁（无 LLM）：只看「本分支相对 base 的改动」，结果据实输出，不写死 PASS。
# 用法：scripts/agent/gates.sh [base-ref]     （默认 origin/main）
# 输出：stdout 为 Markdown 报告；任一 FAIL => 退出码 1。
# 阈值：GATE_MAX_ADDED（默认 300，不含 docs/ 与 .agents/）

set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."

BASE="${1:-origin/main}"
MAX_ADDED="${GATE_MAX_ADDED:-300}"
RANGE="${BASE}...HEAD"
CHANGED="$(git diff --name-only --diff-filter=ACMR "$RANGE")"
FAILS=0; ROWS=""

row() { ROWS+="| $1 | $2 | ${3:-} |"$'\n'; [ "$2" = "❌ FAIL" ] && FAILS=$((FAILS+1)); return 0; }

# 1. 非空交付
if [ -n "$CHANGED" ]; then row "非空交付" "✅ PASS" "$(printf '%s\n' "$CHANGED" | wc -l | tr -d ' ') 个文件"
else row "非空交付" "❌ FAIL" "相对 ${BASE} 无改动"; fi

# 2. 增量控制（防臃肿）
ADDED="$(git diff --numstat "$RANGE" -- . ':(exclude)docs/**' ':(exclude).agents/**' ':(exclude)**/package-lock.json' \
         | awk '$1 != "-" {a+=$1} END{print a+0}')"
if [ "$ADDED" -le "$MAX_ADDED" ]; then row "增量 ≤ ${MAX_ADDED} 行" "✅ PASS" "+${ADDED}"
else row "增量 ≤ ${MAX_ADDED} 行" "❌ FAIL" "+${ADDED}，拆小或精简"; fi

# 3. Docs-as-Code：业务代码变更必须同 PR 更新 docs/
CODE="$(printf '%s\n' "$CHANGED" | grep -E '\.(php|js|ts|vue|sql)$' | grep -vE '^(scripts|\.github|automation)/' || true)"
if [ -z "$CODE" ]; then row "Docs-as-Code" "✅ PASS" "无业务代码变更"
elif printf '%s\n' "$CHANGED" | grep -q '^docs/'; then row "Docs-as-Code" "✅ PASS" "已同步 docs/"
else row "Docs-as-Code" "❌ FAIL" "改了业务代码但 docs/ 未更新"; fi

# 4. 垃圾文件
JUNK="$(printf '%s\n' "$CHANGED" | grep -E '(\.bak|\.tmp|\.orig|/test_[^/]*\.php)$' || true)"
[ -z "$JUNK" ] && row "无垃圾文件" "✅ PASS" || row "无垃圾文件" "❌ FAIL" "$(echo $JUNK)"

# 5. 依赖审计（Zero-Dep）：新增依赖必须人工确认
NEWDEP="$(git diff "$RANGE" -- '**/package.json' 'package.json' '**/composer.json' \
          | grep -E '^\+\s*"[@a-zA-Z0-9_./-]+"\s*:\s*"[~^0-9*]' || true)"
[ -z "$NEWDEP" ] && row "Zero-Dep" "✅ PASS" || row "Zero-Dep" "❌ FAIL" "新增依赖: $(echo "$NEWDEP" | tr -s ' ' | head -c 160)"

# 6. 密钥/助记词泄漏（资金安全禁区）
LEAK="$(git diff "$RANGE" | grep -E '^\+' | grep -iE 'BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|"private_key"|mnemonic|seed phrase|TRONGRID_API_KEY=[A-Za-z0-9]{8,}|[0-9]{8,10}:AA[A-Za-z0-9_-]{30,}' || true)"
[ -z "$LEAK" ] && row "无密钥泄漏" "✅ PASS" || row "无密钥泄漏" "❌ FAIL" "疑似私钥/Token 进入 diff"

# 7. 调试残留
DEBUG="$(git diff "$RANGE" -- '*.php' '*.js' '*.ts' '*.vue' ':(exclude)scripts/**' | grep -E '^\+' | grep -E '\b(var_dump|print_r|console\.log|debugger)\b' || true)"
[ -z "$DEBUG" ] && row "无调试残留" "✅ PASS" || row "无调试残留" "❌ FAIL" "$(echo "$DEBUG" | head -n1 | head -c 120)"

# 8. 改动文件语法
SYN_FAIL=""
while IFS= read -r f; do
  [ -f "$f" ] || continue
  case "$f" in
    *.php) command -v php >/dev/null && { php -l "$f" >/dev/null 2>&1 || SYN_FAIL+="$f "; } ;;
    *.js)  node --check "$f" >/dev/null 2>&1 || SYN_FAIL+="$f " ;;
    *.sh)  bash -n "$f" 2>/dev/null || SYN_FAIL+="$f " ;;
    *.json) node -e 'JSON.parse(require("fs").readFileSync(process.argv[1]))' "$f" 2>/dev/null || SYN_FAIL+="$f " ;;
  esac
done <<< "$CHANGED"
[ -z "$SYN_FAIL" ] && row "改动文件语法" "✅ PASS" || row "改动文件语法" "❌ FAIL" "$SYN_FAIL"

# 9. Helm 多站点渲染（chart 有改动时）
if printf '%s\n' "$CHANGED" | grep -q '^deploy/helm/' && command -v helm >/dev/null; then
  HF=""
  helm lint deploy/helm/firebird-site >/dev/null 2>&1 || HF+="lint "
  for v in deploy/helm/firebird-site/values-*.yaml; do
    helm template t deploy/helm/firebird-site -f "$v" >/dev/null 2>&1 || HF+="$(basename "$v") "
  done
  [ -z "$HF" ] && row "Helm 多站点渲染" "✅ PASS" || row "Helm 多站点渲染" "❌ FAIL" "$HF"
fi

echo "### 🔒 确定性门禁（${RANGE}）"
echo
echo "| 检查项 | 结果 | 说明 |"
echo "| :--- | :--- | :--- |"
printf '%s' "$ROWS"
echo
[ "$FAILS" -eq 0 ] && echo "**结论：PASS**" || echo "**结论：FAIL（${FAILS} 项）**"
[ "$FAILS" -eq 0 ]
