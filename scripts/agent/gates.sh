#!/usr/bin/env bash
# 确定性门禁（无 LLM）：只看「本分支相对 base 的改动」，结果据实输出，不写死 PASS。
# 用法：scripts/agent/gates.sh [base-ref]     （默认 origin/main）
# 输出：stdout 为 Markdown 报告；任一 FAIL => 退出码 1。
#       基线 ref 不可解析时只输出一行 FAIL 并退出 1（不跑任何 diff 检查，避免噪声与假 PASS）。
# 阈值：GATE_MAX_ADDED（默认 1200，不含 docs/、.agents/、_bmad-output/、_bmad/、.claude/skills/bmad-*/ 规划产物）
# 环境：GATE_REPO_DIR       被检查的仓库目录（QA 用 main 上的本脚本检查 PR 检出）
#       GATE_AGENT_BRANCH=1 Agent 分支：禁止改动 .github/、scripts/agent/、scripts/acceptance/（测试先行用例）、.agents/
#       GATE_REQUIRE_TOOLS=1 缺 php/helm 判 FAIL（托管 runner 上为权威结果）；否则记为 SKIP

set -uo pipefail
# 仓库目录必须先进得去、且真是 git 仓库：`set -uo pipefail` 没有 `-e`，cd 失败不会中止，后续所有 git diff
# 会在**调用者的当前目录**里跑 —— 于是门禁评估的是别人的仓库，还可能给出 PASS（实测 `GATE_REPO_DIR=/tmp/nope-xyz`
# 时报告出的正是调用者仓库的文件数并 rc=0）。目录存在但不是仓库时，原本会一路走到「ref 不存在 → 检查
# AGENT_BASE_BRANCH 是否多写了 origin/」，把人指去查配置而真实原因是路径。这里统一 fail-closed。
GATE_DIR="${GATE_REPO_DIR:-$(dirname "${BASH_SOURCE[0]}")/../..}"
if ! cd "$GATE_DIR" || ! git rev-parse --git-dir >/dev/null 2>&1; then
  cat <<EOF
### 🔒 确定性门禁（仓库目录不可用）

| 检查项 | 结果 | 说明 |
| :--- | :--- | :--- |
| 仓库目录 | ❌ FAIL | 不是可用的 git 仓库：${GATE_DIR}（GATE_REPO_DIR 由调用方指定；检查是否指向了错误路径） |

**结论：FAIL（1 项）— 未执行任何 diff 检查**
EOF
  exit 1
fi

# 基线 ref：位置参数优先，其次 GATE_BASE 环境变量（Makefile:6 的帮助文案承诺了这个覆盖方式），最后默认 origin/main。
# 本脚本其它开关（GATE_REPO_DIR / GATE_AGENT_BRANCH / GATE_MAX_ADDED / GATE_REQUIRE_TOOLS）都是 env，走位置参数是例外。
BASE="${1:-${GATE_BASE:-origin/main}}"
MAX_ADDED="${GATE_MAX_ADDED:-1200}"
RANGE="${BASE}...HEAD"

# 基线可解析性：**在跑任何 git diff 之前**先判定，不可解析就立刻退出。
# 为什么早退而不是照常跑完再报错：基线拼错（如 AGENT_BASE_BRANCH 多写 origin/）时，
#   1) 每个 git diff 都会甩 3 行 `fatal: ambiguous argument …` 到 stderr，把真正的结论埋到第 15 行 ——
#      而报告是攒完 ROWS 最后统一输出的，内部怎么调顺序都改不了「噪声在前」；
#   2) 结论是假的：「相对 X 无改动」「增量 +0 ✅ PASS」看起来像真问题/真通过，实际是 ref 不存在。
# 所以只输出一行 FAIL 指回配置，声明「未执行任何 diff 检查」，退出码仍是 1（与逐项 FAIL 的语义一致）。
if ! git rev-parse -q --verify "${BASE}^{commit}" >/dev/null 2>&1; then
  echo "### 🔒 确定性门禁（基线不可解析）"
  echo
  echo "| 检查项 | 结果 | 说明 |"
  echo "| :--- | :--- | :--- |"
  echo "| 基线 | ❌ FAIL | ref 不存在：${BASE}（检查 AGENT_BASE_BRANCH 是否多写了 origin/） |"
  echo
  echo "**结论：FAIL（1 项）— 未执行任何 diff 检查**"
  echo "（基线不可解析时其余检查结果无意义，故不输出；避免出现「增量 +0、结果却算通过」这类假通过）"
  exit 1
fi

# --no-renames：重命名拆成「删除源 + 新增目标」，避免把受保护文件挪走时源路径不出现
CHANGED="$(git diff --no-renames --name-only --diff-filter=ACMR "$RANGE")"
FAILS=0; ROWS=""

row() { ROWS+="| $1 | $2 | ${3:-} |"$'\n'; [ "$2" = "❌ FAIL" ] && FAILS=$((FAILS+1)); return 0; }
missing_tool() { # missing_tool <检查项> <工具>
  if [ "${GATE_REQUIRE_TOOLS:-0}" = "1" ]; then row "$1" "❌ FAIL" "runner 缺少 $2"
  else row "$1" "⚠️ SKIP" "本机缺少 $2，以托管 runner 的 gates 结果为准"; fi
}

# 基线可见性：把「和谁比」写进报告。基线是本地远端跟踪 ref（本脚本不 fetch），
# 这一行的日期就是「要不要先 git fetch」的判据 —— 落后时增量会虚高，看起来像真问题。
row "基线" "${BASE}" "$(git log -1 --format='%cs' "${BASE}")"

# 0. 受保护路径：Agent 分支不得改动流水线与规范自身（含新增文件）
if [ "${GATE_AGENT_BRANCH:-0}" = "1" ]; then
  PROT="$(git diff --no-renames --name-only "${BASE}...HEAD" | grep -E '^(\.github|scripts/agent|scripts/acceptance|\.agents)/' || true)"
  [ -z "$PROT" ] && row "受保护路径未改动" "✅ PASS" || row "受保护路径未改动" "❌ FAIL" "$(echo $PROT | head -c 160)"
fi

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
#    批准记录：base 分支上的 .agents/approved-deps.txt（每行「包名 版本串」，版本须与 package.json 完全一致）。
#    取自 base 而非 PR：同一 PR 里自己登记自己无效，须先由 Arvin 单独合并批准记录。
NEWDEP="$(git diff "$RANGE" -- '**/package.json' 'package.json' '**/composer.json' \
          | grep -E '^\+[[:space:]]*"[@a-zA-Z0-9_./-]+"[[:space:]]*:[[:space:]]*"[~^0-9*]' \
          | grep -vE '^\+[[:space:]]*"version"[[:space:]]*:' || true)"  # 包自身 version 字段不是依赖
APPROVED="$(git show "${BASE}:.agents/approved-deps.txt" 2>/dev/null | sed -E 's/#.*//; s/[[:space:]]+/ /g; s/^ //; s/ $//' | grep -v '^$' || true)"
if [ -n "$NEWDEP" ] && [ -n "$APPROVED" ]; then
  REST=""
  while IFS= read -r l; do
    nv="$(printf '%s' "$l" | sed -E 's/^\+[[:space:]]*"([^"]+)"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1 \2/')"
    printf '%s\n' "$APPROVED" | grep -qxF -- "$nv" || REST+="$l"$'\n'
  done <<< "$NEWDEP"
  NEWDEP="${REST%$'\n'}"
fi
[ -z "$NEWDEP" ] && row "Zero-Dep" "✅ PASS" || row "Zero-Dep" "❌ FAIL" "新增依赖未登记 .agents/approved-deps.txt: $(echo "$NEWDEP" | tr -s ' ' | head -c 160)"

# 6. 密钥/助记词泄漏（资金安全禁区）
#    6a 增量：本分支新增行
#    6b 存量：全仓已跟踪文件兜底
# 为什么必须有 6b：diff 扫描只在「有人新加」时报警，**已经躺在仓库里的永远扫不到**。
# 2026-10-27 审计实证：deploy/k8s-mail-server.yaml 里的 Telegram bot token 与 RSA 私钥、
# webroot/api/payment/wxpay/cert/ 下 4 份微信支付商户私钥，全都长期存活且门禁一直是绿的。
# 增量与存量共用同一套锚定正则：只认「行首（允许缩进）的真实 PEM 头」，
# 否则模板占位符（<REPLACE_ME...>）和生成 PEM 的代码（$res = "-----BEGIN ... \n"）都会被误判。
SECRET_RE='^[+[:space:]]*-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----|^[+[:space:]]*"private_key"[[:space:]]*:|mnemonic|seed phrase|TRONGRID_API_KEY=[A-Za-z0-9]{8,}|[0-9]{8,10}:AA[A-Za-z0-9_-]{30,}'
LEAK="$(git diff "$RANGE" | grep -E '^\+' | grep -iE "$SECRET_RE" || true)"
[ -z "$LEAK" ] && row "无密钥泄漏（增量）" "✅ PASS" || row "无密钥泄漏（增量）" "❌ FAIL" "疑似私钥/Token 进入 diff"

# 存量扫描用更严的正则：只认「行首（允许缩进）的真实 PEM 头」，
# 避免把生成 PEM 的代码模板（$res = "-----BEGIN RSA PRIVATE KEY-----\n"）误判为泄漏。
STOCK_RE='^[[:space:]]*-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----|"private_key"[[:space:]]*:|[0-9]{8,10}:AA[A-Za-z0-9_-]{30,}|TRONGRID_API_KEY=[A-Za-z0-9]{8,}'
ALLOW_F=".agents/secret-scan-allow.txt"
NOW_EPOCH="$(date +%s)"
STOCK_NEW=""; STOCK_DEBT=""; STOCK_EXPIRED=""; STOCK_N=0
while IFS= read -r f; do
  [ -z "$f" ] && continue
  STOCK_N=$((STOCK_N+1))
  line="$(grep -m1 -F -- "$f" "$ALLOW_F" 2>/dev/null || true)"
  if [ -z "$line" ]; then STOCK_NEW+="$f "; continue; fi
  # 白名单格式：<路径> <到期日 YYYY-MM-DD> <原因>
  exp="$(printf '%s' "$line" | awk '{print $2}')"
  exp_epoch="$(date -j -f "%Y-%m-%d" "$exp" +%s 2>/dev/null || date -d "$exp" +%s 2>/dev/null || echo 0)"
  # 到期日解析失败按 0（已过期）处理：宁严勿松
  if [ "${exp_epoch:-0}" -lt "$NOW_EPOCH" ]; then STOCK_EXPIRED+="${f}(${exp}) "
  else STOCK_DEBT+="${f}→${exp} "; fi
done <<< "$(git grep -lIE "$STOCK_RE" -- . 2>/dev/null | sort -u)"

if [ -z "$STOCK_NEW" ]; then
  row "无密钥入库（全仓）" "✅ PASS" "扫描 $(git ls-files | wc -l | tr -d ' ') 个已跟踪文件"
else
  row "无密钥入库（全仓）" "❌ FAIL" "未登记的密钥文件：$(printf '%s' "$STOCK_NEW" | head -c 200)"
fi
# 白名单不是遮羞布：登记项必须在到期日前完成轮换，过期即 FAIL。
if [ -n "$STOCK_EXPIRED" ]; then
  row "密钥存量欠债" "❌ FAIL" "白名单已过期，必须完成轮换或重新评估：$(printf '%s' "$STOCK_EXPIRED" | head -c 200)"
elif [ -n "$STOCK_DEBT" ]; then
  row "密钥存量欠债" "⚠️ WARN" "已登记待轮换（到期即 FAIL）：$(printf '%s' "$STOCK_DEBT" | head -c 200)"
else
  row "密钥存量欠债" "✅ PASS" "无欠债"
fi

# 7. 调试残留
# deploy/ 下的 .js 是服务端运行时（如 mail-relay/server.js），启动日志是功能的一部分，
# 不是忘记删的调试语句；要拦的调试残留只针对业务代码。
DEBUG="$(git diff "$RANGE" -- '*.php' '*.js' '*.ts' '*.vue' ':(exclude)scripts/**' ':(exclude)deploy/**' | grep -E '^\+' | grep -E '\b(var_dump|print_r|console\.log|debugger)\b' || true)"
[ -z "$DEBUG" ] && row "无调试残留" "✅ PASS" || row "无调试残留" "❌ FAIL" "$(echo "$DEBUG" | head -n1 | head -c 120)"

# 8. 改动文件语法
SYN_FAIL=""; NEED_PHP=0
while IFS= read -r f; do
  [ -f "$f" ] || continue
  case "$f" in
    # 一律以 ./ 前缀传入，防止形如 --require=x.js 的文件名被解析为选项
    *.php) if command -v php >/dev/null; then php -l "./$f" >/dev/null 2>&1 || SYN_FAIL+="$f "; else NEED_PHP=1; fi ;;
    *.js)  node --check "./$f" >/dev/null 2>&1 || SYN_FAIL+="$f " ;;
    *.sh)  bash -n "./$f" 2>/dev/null || SYN_FAIL+="$f " ;;
    *.json) node -e 'JSON.parse(require("fs").readFileSync(process.argv[1]))' "./$f" 2>/dev/null || SYN_FAIL+="$f " ;;
  esac
done <<< "$CHANGED"
[ -z "$SYN_FAIL" ] && row "改动文件语法" "✅ PASS" || row "改动文件语法" "❌ FAIL" "$SYN_FAIL"
[ "$NEED_PHP" = "1" ] && missing_tool "PHP 语法" php

# 9. Helm 多站点渲染（chart 有改动时）
if printf '%s\n' "$CHANGED" | grep -q '^deploy/helm/' && ! command -v helm >/dev/null; then
  missing_tool "Helm 多站点渲染" helm
elif printf '%s\n' "$CHANGED" | grep -q '^deploy/helm/'; then
  HF=""
  helm lint deploy/helm/firebird-site >/dev/null 2>&1 || HF+="lint "
  for v in deploy/helm/firebird-site/values-*.yaml; do
    helm template t deploy/helm/firebird-site -f "$v" >/dev/null 2>&1 || HF+="$(basename "$v") "
  done
  [ -z "$HF" ] && row "Helm 多站点渲染" "✅ PASS" || row "Helm 多站点渲染" "❌ FAIL" "$HF"
fi

# 10. API 契约同步
#     docs-as-code（第 3 项）只要求「改了代码就动 docs/」，动哪一篇不管——加一条路由、
#     随手往别的文档里写一行，门禁照样绿，而 OpenAPI 悄悄落后。这里把范围收窄到 API 面：
#       ① 代码路由 / fbProxy 白名单动作 ↔ docs/api/openapi.yaml 双向一致（脚本负责，两个方向都查）；
#       ② 改了路由实现，必须同一 PR 带 services/api/test/ 下的测试与 openapi.yaml 更新。
#     ①在只要碰到 API 面时都跑（改错文档也要拦住），②只在改实现时要求。
API_ROUTE_IMPL="$(printf '%s\n' "$CHANGED" | grep -E '^services/api/src/(server|fbProxy|[A-Za-z]+Route)\.js$' || true)"
API_FACE="$(printf '%s\n' "$API_ROUTE_IMPL" ; printf '%s\n' "$CHANGED" | grep -E '^docs/api/openapi\.yaml$' || true)"
if [ -z "$API_FACE" ]; then
  row "API 契约同步" "✅ PASS" "未触及 API 面"
else
  CONTRACT_OUT="$(node scripts/api-contract-check.js 2>&1)"; CONTRACT_RC=$?
  MISS=""
  if [ -n "$API_ROUTE_IMPL" ]; then
    printf '%s\n' "$CHANGED" | grep -qE '^services/api/test/' || MISS+="缺测试文件；"
    printf '%s\n' "$CHANGED" | grep -qE '^docs/api/openapi\.yaml$' || MISS+="缺 OpenAPI 更新；"
  fi
  if [ "$CONTRACT_RC" -ne 0 ]; then
    MISS+="契约不一致；"
    CONTRACT_OUT="$(printf '%s' "$CONTRACT_OUT" | grep -E '^✗' | head -n2 | tr '\n' ' ')"
  else
    CONTRACT_OUT=""
  fi
  if [ -z "$MISS" ]; then row "API 契约同步" "✅ PASS" "路由/白名单与 openapi.yaml 一致"
  else row "API 契约同步" "❌ FAIL" "${MISS}${CONTRACT_OUT}"; fi
fi

echo "### 🔒 确定性门禁（${RANGE}）"
echo
echo "| 检查项 | 结果 | 说明 |"
echo "| :--- | :--- | :--- |"
printf '%s' "$ROWS"
echo
[ "$FAILS" -eq 0 ] && echo "**结论：PASS**" || echo "**结论：FAIL（${FAILS} 项）**"
[ "$FAILS" -eq 0 ]
