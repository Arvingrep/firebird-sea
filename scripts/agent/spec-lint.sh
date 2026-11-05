#!/usr/bin/env bash
# 规范面一致性检查（spec-lint）v1.0 —— 仓库自洽性，与 diff 无关
#
# 目的：检查「声明面」（文档/规则怎么写）与「执行面」（脚本/CI 怎么跑）是不是同一套事实。
# 与 gates.sh 的分工：gates.sh 看「本次改动能不能合」，本脚本看「仓库自己讲的话前后一致不一致」。
# 所以它不需要 base、不需要分支、不看 diff，随时可跑，也适合挂定时任务。
#
# 用法：bash scripts/agent/spec-lint.sh [repo-dir]     默认 = 本脚本上两级（仓库根）
# 输出：Markdown 表到 stdout；任一 FAIL => 退出码 1
# 只读：不写任何文件、不改 git 状态。
#
# 判据为什么这么写（每个 S 都对应一次真实的误判）：
#   S3 曾经只验「make 与脚本是否一致」，于是三处一致地默认 origin/main 时判 PASS ——
#      **一致地错也是错**。现在三处都必须等于「实际集成分支」。
#   S7 早期写成 kubectl[^"]*(exec|cp|...)，把 --context gcp-gke 里的 cp 当成 kubectl cp，
#      修完权限后仍报红 —— 检查器自己成了假信号源。现在要求写动词前必须有空格。
set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="${1:-$(cd "$HERE/../.." && pwd)}"
cd "$REPO" 2>/dev/null || { printf '| 检查 | 结果 | 说明 |\n|---|---|---|\n| 仓库 | ❌ FAIL | 目录不可进入：%s |\n' "$REPO"; exit 1; }
git rev-parse --git-dir >/dev/null 2>&1 || { printf '| 检查 | 结果 | 说明 |\n|---|---|---|\n| 仓库 | ❌ FAIL | 不是 git 仓库：%s |\n' "$REPO"; exit 1; }

FAILS=0; ROWS=""
row() { ROWS="${ROWS}| $1 | $2 | $3 |"$'\n'; [ "$2" = "❌ FAIL" ] && FAILS=$((FAILS+1)); }

# S1 文档链接：README/AGENTS 里指向仓库内的相对路径，必须真实存在（大小写敏感比较）
MISSING=""
while IFS= read -r ref; do
  [ -z "$ref" ] && continue
  # 精确大小写匹配：用 git ls-files 的索引列表比对，避免 macOS 大小写不敏感文件系统放过错误
  git ls-files --error-unmatch "$ref" >/dev/null 2>&1 || MISSING="${MISSING}${ref}; "
done < <(grep -ohE '\]\(([^)#]+\.(md|yaml|yml|json|sh))\)' README.md AGENTS.md 2>/dev/null \
          | sed -E 's/^\]\(//; s/\)$//' | grep -v '^http' | sort -u)
if [ -z "$MISSING" ]; then row "S1 文档内链可达" "✅ PASS" "README/AGENTS 引用的本地文件均在库"
else row "S1 文档内链可达" "❌ FAIL" "指向不存在的文件：$MISSING"; fi

# S2 幽灵引用：文档里提到的 agent 配置目录，要么入库有内容，要么不该被引用
GHOST=""
for p in .github/agents .agents/skills .agents/prompts; do
  if grep -rqnE --include='*.md' "$p" README.md AGENTS.md docs 2>/dev/null; then
    n=$(git ls-files "$p" | wc -l | tr -d ' ')
    [ "$n" -eq 0 ] && GHOST="${GHOST}${p}(库内 0 文件); "
  fi
done
if [ -z "$GHOST" ]; then row "S2 无幽灵引用" "✅ PASS" "被引用的 agent 目录都有入库文件"
else row "S2 无幽灵引用" "❌ FAIL" "被文档引用但库内为空：$GHOST"; fi

# S3 基线正确且唯一：make / gates.sh / lib.sh 三处默认值必须相同，且必须等于「实际集成分支」。
# v0.2 修判据：v0.1 只验「两边是否一致」，结果三处一致地默认 origin/main（main 早已不是集成分支）时判 PASS。
# 集成分支判定：origin/canary 存在即为 canary（本仓 PR 基线与发布流都指向它），否则 main。
INTEG=main
if git show-ref --verify --quiet refs/remotes/origin/canary; then INTEG=canary; fi
G_DEF=$(grep -oE 'BASE="\$\{1:-\$\{GATE_BASE:-[^}]+\}\}"' scripts/agent/gates.sh 2>/dev/null | grep -oE 'origin/[a-z]+' | head -1)
M_DEF=$(grep -E '^GATE_BASE' Makefile 2>/dev/null | grep -oE 'or \$\(AGENT_BASE_BRANCH\),[a-z]+' | grep -oE '[a-z]+$')
M_DEF="origin/${M_DEF:-?}"
L_DEF=$(grep -oE 'BASE_BRANCH="\$\{AGENT_BASE_BRANCH:-[a-z]+\}"' scripts/agent/lib.sh 2>/dev/null | grep -oE '\-[a-z]+' | tr -d '-' | head -1)
L_DEF="origin/${L_DEF:-?}"
if [ -n "$G_DEF" ] && [ "$G_DEF" = "origin/$INTEG" ] && [ "$M_DEF" = "origin/$INTEG" ] && [ "$L_DEF" = "origin/$INTEG" ]; then
  row "S3 门禁基线唯一" "✅ PASS" "make / gates.sh / lib.sh 同为 origin/${INTEG}（= 实际集成分支）"
elif [ "$G_DEF" = "$M_DEF" ] && [ "$M_DEF" = "$L_DEF" ]; then
  row "S3 门禁基线唯一" "❌ FAIL" "三处一致但都指向 ${G_DEF:-?}，而实际集成分支是 origin/$INTEG —— 一致地错：门禁比的是没人往上合的分支，diff 恒为全仓"
else
  row "S3 门禁基线唯一" "❌ FAIL" "make gates 比 ${M_DEF}，脚本直跑比 ${G_DEF:-?}，lib.sh 默认 ${L_DEF}，应同为 origin/$INTEG —— 同一门禁多种基线，增量会差一个数量级"
fi

# S4 CI 白名单 vs 规则允许的 AI 分支前缀（INFO：不判红，但必须看得见）
CI_PREFIX=$(grep -oE "startsWith\(github\.head_ref, '[a-z]+/'\)" .github/workflows/ci-verify.yml 2>/dev/null | grep -oE "'[a-z]+/'" | tr -d "'" | sort -u | tr '\n' ' ')
if [ -n "$CI_PREFIX" ]; then
  row "S4 分支前缀对齐" "ℹ️ INFO" "CI 只对 [$CI_PREFIX] 启用 agent 门禁；其余前缀（fix/ chore/ docs/ …）不受受保护路径检查与 QA 约束"
else row "S4 分支前缀对齐" "❌ FAIL" "ci-verify.yml 里读不到分支白名单"; fi

# S5 运行记录终态：每个 run 目录必须有终态产物
RUNS=0; DONE=0
for d in .agent-runs/*/*/; do
  [ -d "$d" ] || continue
  RUNS=$((RUNS+1))
  ls "$d" 2>/dev/null | grep -qE 'final-summary|verification-report|review-report' && DONE=$((DONE+1))
done
if [ "$RUNS" -eq 0 ]; then row "S5 运行记录终态" "ℹ️ INFO" "无 .agent-runs 记录（该目录未入库，本项无从判定）"
elif [ "$DONE" -eq "$RUNS" ]; then row "S5 运行记录终态" "✅ PASS" "$DONE/$RUNS 有终态"
else row "S5 运行记录终态" "❌ FAIL" "$DONE/$RUNS 有终态，$((RUNS-DONE)) 个 run 没有结论；这类 run 无法审计，也无法证明做过"; fi

# S6 契约入库：docs/api 下的契约文件不得停留在 untracked
UNTRACKED=$(git status --porcelain docs/api 2>/dev/null | grep -c '^??' || true)
CHANGED=$(git status --porcelain docs/api 2>/dev/null | grep -cE '^( M|M )' || true)
if [ "${UNTRACKED:-0}" -eq 0 ] && [ "${CHANGED:-0}" -eq 0 ]; then row "S6 契约入库干净" "✅ PASS" "docs/api 无未提交/未跟踪文件"
else row "S6 契约入库干净" "❌ FAIL" "docs/api 有 ${UNTRACKED:-0} 个未跟踪、${CHANGED:-0} 个已修改未提交 —— 接口契约不在库里就等于没有契约"; fi

# S7 权限面对抗：本地工具授权不得放行 RULES 明令禁止的写操作
BAD=""
for f in .claude/settings.local.json .claude/settings.json; do
  [ -f "$f" ] || continue
  # 词边界必须卡住：早期写成 'kubectl[^"]*(exec|cp|...)'，把 --context gcp-gke 里的 "cp" 当成 kubectl cp，
  # 修完权限后仍报红。现在要求写操作前必须有空格。
  grep -qE 'kubectl[^"]*[[:space:]](exec|cp|apply|delete|patch|edit|scale)(:|\*|[[:space:]]|")' "$f" 2>/dev/null && BAD="${BAD}${f} 放行 kubectl 写操作; "
done
if [ -z "$BAD" ]; then row "S7 权限无对抗" "✅ PASS" "本地授权未放行 kubectl 写操作"
else row "S7 权限无对抗" "❌ FAIL" "$BAD —— RULES §6.2 写的是只读，授权写的是可写，冲突时工具赢"; fi

# S8 死引用：脚本里提到的 make 目标必须存在
DEAD=""
for t in $(grep -ohE 'make [a-z][a-z-]+' scripts/agent/*.sh 2>/dev/null | awk '{print $2}' | sort -u); do
  grep -qE "^$t:" Makefile 2>/dev/null || DEAD="${DEAD}make $t; "
done
if [ -z "$DEAD" ]; then row "S8 脚本无死引用" "✅ PASS" "脚本引用的 make 目标均存在"
else row "S8 脚本无死引用" "❌ FAIL" "引用了不存在的目标：$DEAD"; fi

# S9 自测退出码是真的：scripts/test-gates.sh 最后一个非空非注释行必须是 `exit $FAIL`。
# 少了它，脚本以最后一条命令的状态退出（几乎恒 0），整套用例变成摆设：用例照打 ❌，
# rc 却是 0，CI 一路绿。2026-11-05 真实发生——一次编辑把 exit 删掉，62 条用例全绿但退出码恒 0，
# 本地「rc=0」是假的，最后是独立 QA 静态审查发现的。这条检查就是那次事故的护栏。
LAST_LINE="$(grep -vE '^[[:space:]]*(#|$)' scripts/test-gates.sh 2>/dev/null | tail -1 | tr -d '[:space:]')"
if [ "$LAST_LINE" = 'exit$FAIL' ]; then
  row "S9 自测退出码真实" "✅ PASS" "test-gates.sh 以 exit \$FAIL 收尾，用例失败会真的返回 1"
elif [ -z "$LAST_LINE" ]; then
  row "S9 自测退出码真实" "❌ FAIL" "读不到 scripts/test-gates.sh，或文件为空"
else
  row "S9 自测退出码真实" "❌ FAIL" "最后一行是「${LAST_LINE}」而不是 exit \$FAIL —— 用例失败也不会返回 1，整套自测等于摆设"
fi

printf '| 检查 | 结果 | 说明 |\n|---|---|---|\n%s\n' "$ROWS"
BR="$(git branch --show-current 2>/dev/null)"; [ -n "$BR" ] || BR="detached"
echo "结论：$([ "$FAILS" -eq 0 ] && echo '全部通过' || echo "$FAILS 项 FAIL")（基线 $(git rev-parse --short HEAD) @ ${BR}）"
[ "$FAILS" -eq 0 ] || exit 1
