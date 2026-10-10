#!/usr/bin/env bash
# 测试先行验收用例运行器（机制与复制步骤见 docs/internal/TEST_FIRST.md）
# 用例文件：scripts/acceptance/story-<epic>-<num>.sh，退出码 0=绿 1=红 77=缺工具（SKIP）。
# 用法：
#   run.sh --story <key|N.M|N-M>      运行该 Story 的用例。绿=0 红=1 无用例=2
#   run.sh --title "<PR/Issue 标题>"  标题含 [story:<key>] 才运行，否则跳过(0)——非 Story 的 PR 永远不受影响
#   run.sh --expect-red --story <..>  开工预检：必须「当前为红」才返回 0；已绿=3 无用例=2 缺工具/无法判定=4
#   run.sh --list                     列出已有用例
# 环境：GATE_REQUIRE_TOOLS=1 时缺工具按失败处理（托管 runner 上为权威结果）。
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."
DIR="${ACCEPTANCE_DIR:-scripts/acceptance}"   # ACCEPTANCE_DIR 仅供 selftest 使用
norm() { sed -nE 's/^[^0-9]*([0-9]+)[.-]([0-9]+).*/\1-\2/p' <<<"$1" | head -n1; }

EXPECT_RED=0; STORY=""; VIA_TITLE=0
while [ $# -gt 0 ]; do
  case "$1" in
    --list) ls "$DIR"/story-*.sh 2>/dev/null; exit 0 ;;
    --expect-red) EXPECT_RED=1 ;;
    --story) STORY="$(norm "${2:-}")"; shift; [ -n "$STORY" ] || { echo "无法解析 Story 编号" >&2; exit 2; } ;;
    --title)
      if [[ "${2:-}" =~ \[story:([^]]+)\] ]]; then STORY="$(norm "${BASH_REMATCH[1]}")"; VIA_TITLE=1
      else echo "ℹ️ 标题不含 [story:<key>]，跳过测试先行用例"; exit 0; fi
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
