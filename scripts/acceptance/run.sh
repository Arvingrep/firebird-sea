#!/usr/bin/env bash
# 测试先行验收用例运行器（机制与复制步骤见 docs/internal/TEST_FIRST.md）
# 用例文件：scripts/acceptance/story-<epic>-<num>.sh（T 前缀 Epic 为 story-T1-1.sh），退出码 0=绿 1=红 77=缺工具（SKIP）。
# 用法：
#   run.sh --story <key|N.M|N-M|T?N-M>  运行该 Story 的用例。绿=0 红=1 无用例=2
#   run.sh --title "<PR/Issue 标题>"  标题含 [story:<key>] 才运行，否则跳过(0)——非 Story 的 PR 永远不受影响
#   run.sh --expect-red --story <..>  开工预检：必须「当前为红」才返回 0；已绿=3 无用例=2 缺工具/无法判定=4
#   run.sh --list                     列出已有用例
# 环境：GATE_REQUIRE_TOOLS=1 时缺工具按失败处理（托管 runner 上为权威结果）。
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."
DIR="${ACCEPTANCE_DIR:-scripts/acceptance}"   # ACCEPTANCE_DIR 仅供 selftest 使用
# Story 编号归一：取前两段数字，保留可选 T 前缀（TMA Story）并归一大写 → `1-1` / `T1-1`。
# 必须与 scripts/agent/story.sh 的 story_id() 完全一致，否则预检与 CI 会指向不同用例文件。
# 不用 sed：`^[^0-9Tt]*([Tt]?)…` 会把「数字前出现过 t/T」的串整条判为不匹配（[story:T1-1]、Story 1.1、task 1-1 全都解析不出），
# 而 `^[^0-9]*([Tt]?)…` 又会被左最长匹配把前缀 T 吞进垃圾前缀。改成「截到第一个数字，再看紧邻字符是不是 T」。
norm() {
  local s="$1" head p=""
  head="${s%%[0-9]*}"    # 第一个数字之前的全部内容
  s="${s#"$head"}"       # 从第一个数字开始（head 为空时即为原串）
  # T 紧邻串首、或 T 前一位不是字母（如 `[story:T1-1]` 的冒号）才算前缀；`test1-2` 这类不走 T 分支
  case "$head" in [Tt]) p="T" ;; *[!a-zA-Z][Tt]) p="T" ;; esac
  if [[ "$s" =~ ^([0-9]+)[.-]([0-9]+) ]]; then printf '%s%s-%s' "$p" "${BASH_REMATCH[1]}" "${BASH_REMATCH[2]}"; fi
  return 0               # 解析不了也必须返回 0：调用方在 set -e 下用 $(norm ...)
}

EXPECT_RED=0; STORY=""; VIA_TITLE=0
while [ $# -gt 0 ]; do
  case "$1" in
    --list) ls "$DIR"/story-*.sh 2>/dev/null; exit 0 ;;
    --expect-red) EXPECT_RED=1 ;;
    --story) STORY="$(norm "${2:-}")"; shift; [ -n "$STORY" ] || { echo "无法解析 Story 编号" >&2; exit 2; } ;;
    --title)
      if [[ "${2:-}" =~ \[story:([^]]+)\] ]]; then STORY="$(norm "${BASH_REMATCH[1]}")"; VIA_TITLE=1
      else echo "ℹ️ 标题不含 [story:<key>]，跳过测试先行用例"; exit 0; fi
      # 标记存在但不是 N-M 形式的 key（如文档里写的占位符 [story:key]）：不是真 Story，跳过
      [ -n "$STORY" ] || { echo "ℹ️ [story:…] 标记无法解析为 Story 编号，跳过"; exit 0; }
      shift ;;
    *) echo "未知参数 $1" >&2; exit 2 ;;
  esac
  shift
done
[ -n "$STORY" ] || { echo "用法: run.sh --story <key> | --title <标题> | --list" >&2; exit 2; }

T="$DIR/story-${STORY}.sh"
if [ ! -f "$T" ]; then
  echo "⚠️ 没有测试先行用例 $T" >&2
  [ "$VIA_TITLE" = 1 ] && exit 0   # 标题触发：该 Story 未做测试先行，不阻断（建单阶段已提示）
  exit 2
fi
echo "▶ Story ${STORY} 验收用例：$T"
bash "$T"; rc=$?
if [ "$rc" = 77 ]; then
  if [ "$EXPECT_RED" = 1 ] || [ "${GATE_REQUIRE_TOOLS:-0}" = 1 ]; then echo "❌ 缺少运行用例所需工具"; exit $([ "$EXPECT_RED" = 1 ] && echo 4 || echo 1); fi
  echo "⚠️ SKIP：本机缺工具，以托管 runner 结果为准"; exit 0
fi
if [ "$EXPECT_RED" = 1 ]; then
  if [ "$rc" = 0 ]; then echo "❌ 预检失败：用例当前已是绿的，无法证明 Agent 的改动有效（用例无效或需求已满足）"; exit 3; fi
  echo "✅ 预检通过：用例当前为红（符合测试先行）"; exit 0
fi
exit "$rc"
