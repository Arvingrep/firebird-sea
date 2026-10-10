#!/usr/bin/env bash
# gates.sh / story.sh 自测：Zero-Dep 批准清单 / 受保护路径 / _bmad-output 不计行 / Story key 解析。在临时仓库里造 base+分支，不碰当前仓库。
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT
git -C "$T" init -q -b main && cd "$T" && git config user.email t@t && git config user.name t
mkdir -p .agents && printf '# 批准\nmysql2 3.24.5  # Story 2.1\nexpress ^4.21.2\n' > .agents/approved-deps.txt
pj() { printf '{\n  "dependencies": {\n%b\n  }\n}\n' "$1" > package.json; }
pj '    "left-pad": "1.0.0"'; echo x > a.txt; git add -A; git commit -qm base
git update-ref refs/remotes/origin/main HEAD
FAIL=0
case_() { # case_ <名称> <期望退出码> <GATE_AGENT_BRANCH>
  local out rc; out="$(GATE_REPO_DIR="$T" GATE_AGENT_BRANCH="$3" bash "$ROOT/scripts/agent/gates.sh" origin/main 2>&1)"; rc=$?
  if [ "$rc" = "$2" ]; then echo "✅ $1"; else echo "❌ ${1}（期望 ${2} 实际 ${rc}）"; echo "$out" | grep -E 'FAIL'; FAIL=1; fi
}
reset() { git checkout -q -f -B work origin/main; }
reset; pj '    "mysql2": "3.24.5",\n    "express": "^4.21.2"'; git commit -qam d
case_ "已登记依赖(名称+版本一致)放行" 0 0
reset; pj '    "mysql2": "3.99.0"'; git commit -qam d
case_ "已登记名称但版本不同 → FAIL" 1 0
reset; pj '    "lodash": "^4.0.0"'; git commit -qam d
case_ "未登记依赖 → FAIL" 1 0
reset; mkdir -p svc; printf '{\n  "name": "svc",\n  "version": "1.0.0"\n}\n' > svc/package.json; git add -A; git commit -qm v
case_ "新包自身 version 字段不算依赖 → 放行" 0 0
reset; pj '    "lodash": "^4.0.0"'; echo 'lodash ^4.0.0' >> .agents/approved-deps.txt; git commit -qam d
case_ "同一 PR 自行登记无效 → FAIL" 1 0
reset; mkdir -p scripts/acceptance; echo ':' > scripts/acceptance/story-1-1.sh; git add -A; git commit -qm t
case_ "Agent 分支改 scripts/acceptance → FAIL" 1 1
case_ "非 Agent 分支改 scripts/acceptance → 放行" 0 0
reset; mkdir -p _bmad-output; seq 1 400 > _bmad-output/epics.md; git add -A; git commit -qm e
case_ "_bmad-output 不计 1200 行增量" 0 0
# --- story.sh：Story key 解析（dev.sh 注入规格/预检依赖它）---
source "$ROOT/scripts/agent/story.sh"
eq() { if [ "$2" = "$3" ]; then echo "✅ $1"; else echo "❌ $1（期望「$3」实际「$2」）"; FAIL=1; fi; }
eq "标题 [story:key] 解析（含中文）" "$(story_key 'feat [story:1-7-计划任务-cronjob] x' '')" "1-7-计划任务-cronjob"
eq "正文标记兜底" "$(story_key '普通' 'a <!-- bmad-story: 2-1-foo --> b')" "2-1-foo"
eq "无标记 → 空" "$(story_key '普通' '无')" ""
eq "story_id 取前两段数字" "$(story_id '1-7-计划任务-cronjob')|$(story_id 2.4)" "1-7|2-4"
eq "story_spec 无规格不报错" "$(cd "$T" && story_spec HEAD 9-9; echo "rc=$?")" "rc=0"
exit $FAIL
