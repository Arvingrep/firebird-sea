#!/usr/bin/env bash
# run.sh 自测：在临时目录造 绿/红/缺工具 用例，验证退出码与「标题触发不影响非 Story PR」。
set -uo pipefail
RUN="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/run.sh"
D="$(mktemp -d)"; trap 'rm -rf "$D"' EXIT; export ACCEPTANCE_DIR="$D"
printf 'exit 0\n' > "$D/story-8-1.sh"; printf 'exit 1\n' > "$D/story-8-2.sh"; printf 'exit 77\n' > "$D/story-8-3.sh"
F=0
t() { local want="$1" name="$2"; shift 2; "$RUN" "$@" >/dev/null 2>&1; local rc=$?
  if [ "$rc" = "$want" ]; then echo "✅ $name"; else echo "❌ $name（期望 $want 实际 $rc）"; F=1; fi; }
t 0 "绿用例 → 0"                    --story 8-1
t 1 "红用例 → 1"                    --story 8.2
t 2 "无用例 → 2"                    --story 8-9
t 0 "预检：红 → 0"                  --expect-red --story 8-2
t 3 "预检：已绿 → 3"                --expect-red --story 8-1
t 4 "预检：缺工具 → 4"              --expect-red --story 8-3
t 0 "缺工具非严格 → SKIP(0)"        --story 8-3
GATE_REQUIRE_TOOLS=1 t 1 "缺工具严格 → 1" --story 8-3
t 0 "标题无标记 → 跳过"             --title "feat: 普通 PR"
t 1 "标题带 story 且红 → 1"         --title "feat(agent): #3 [story:8-2-某故事] x"
t 0 "标题带 story 但无用例 → 0"     --title "[story:7-7-x] y"
exit $F
