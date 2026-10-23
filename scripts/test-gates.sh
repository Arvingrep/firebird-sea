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
# --- gates.sh：基线可解析性（dec2f8be）---
# 断言的是「人真的会看到跟谁比」，比断言 help 文案结实：基线落后只会表现为「增量虚高 / 相对 X 无改动」
# 这种看起来像真问题的 FAIL，光靠文档提示挡不住；ref 拼错（AGENT_BASE_BRANCH 多写 origin/）也要给出配置侧诊断。
reset
out="$(GATE_REPO_DIR="$T" bash "$ROOT/scripts/agent/gates.sh" origin/main 2>&1)"
if printf '%s\n' "$out" | grep -qE '^\| 基线 \| origin/main \| [0-9]{4}-[0-9]{2}-[0-9]{2} \|$'; then
  echo "✅ 报告含基线 ref 与提交日期（落后时人能看到）"
else echo "❌ 报告缺「基线」行或无日期"; printf '%s\n' "$out" | head -6; FAIL=1; fi
out="$(GATE_REPO_DIR="$T" bash "$ROOT/scripts/agent/gates.sh" origin/does-not-exist 2>&1)"; rc=$?
# 两个子串都要断言：只说「ref 不存在」人还得自己猜为什么；说「多写了 origin/」才指得动人去看 AGENT_BASE_BRANCH
if [ "$rc" != "0" ] && printf '%s\n' "$out" | grep -q 'ref 不存在：origin/does-not-exist' \
   && printf '%s\n' "$out" | grep -q '多写了 origin/'; then
  echo "✅ 基线 ref 不存在 → 显式 FAIL 且诊断同时含「ref 不存在」与「多写了 origin/」"
else echo "❌ 基线 ref 不存在时未按预期失败（rc=${rc}）"; printf '%s\n' "$out" | head -6; FAIL=1; fi
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
# --- story_id 的 T 前缀语义（0b976062「改左匹配」的护栏）---
# 该提交修的是「数字前出现过 t/T 时整条不匹配」：旧正则 ^[^0-9Tt]* 会被 [story:T1-1] / Story 1.1 / task 1-1 整条打空。
# 下面八条把修复前后的边界都钉住。分界点是「t 是不是独立前缀」：test1-2 / next2-3 里的 t 属于单词（前面紧邻字母），
# 应解析成普通 Story，不能被误判成 T Story —— 这正是 head 末字符判定（*[!a-zA-Z][Tt]）与「凡带 t 就当 T」的分野。
eq "story_id 大小写归一 t1.1 → T1-1" "$(story_id 't1.1')" "T1-1"
eq "story_id 已是 T1-1 保持原样" "$(story_id 'T1-1')" "T1-1"
eq "story_id 小数写法 T2.10 → T2-10" "$(story_id 'T2.10')" "T2-10"
eq "story_id 标题前缀 [story:T1-1] → T1-1" "$(story_id '[story:T1-1]')" "T1-1"
eq "story_id 句子前缀 Story 1.1 → 1-1" "$(story_id 'Story 1.1')" "1-1"
eq "story_id 句子前缀 task 1-1 → 1-1" "$(story_id 'task 1-1')" "1-1"
eq "story_id 词内 t 不算前缀 test1-2 → 1-2" "$(story_id 'test1-2')" "1-2"
eq "story_id 词内 t 不算前缀 next2-3 → 2-3（旧实现会误判成 T2-3）" "$(story_id 'next2-3')" "2-3"
eq "story_spec 无规格不报错" "$(cd "$T" && story_spec HEAD 9-9; echo "rc=$?")" "rc=0"
exit $FAIL
