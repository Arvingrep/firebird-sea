#!/usr/bin/env bash
# gates.sh 自测：Zero-Dep 批准清单 / 受保护路径 / _bmad-output 不计行。在临时仓库里造 base+分支，不碰当前仓库。
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
reset; pj '    "lodash": "^4.0.0"'; echo 'lodash ^4.0.0' >> .agents/approved-deps.txt; git commit -qam d
case_ "同一 PR 自行登记无效 → FAIL" 1 0
reset; mkdir -p scripts/acceptance; echo ':' > scripts/acceptance/story-1-1.sh; git add -A; git commit -qm t
case_ "Agent 分支改 scripts/acceptance → FAIL" 1 1
case_ "非 Agent 分支改 scripts/acceptance → 放行" 0 0
reset; mkdir -p _bmad-output; seq 1 400 > _bmad-output/epics.md; git add -A; git commit -qm e
case_ "_bmad-output 不计 300 行增量" 0 0
exit $FAIL
