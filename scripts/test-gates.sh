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
  # 失败时打全文尾部，不再只 grep 'FAIL'：rc 异常（如 rc=2 早退）时可能一行 FAIL 都没有，
  # 那种情况旧写法啥也不打，下次再红仍然是瞎子（本条 assertion 曾偶发 rc=2，50 次未复现，见报告）。
  if [ "$rc" = "$2" ]; then echo "✅ $1"; else echo "❌ ${1}（期望 ${2} 实际 ${rc}）"; printf '%s\n' "$out" | tail -20; FAIL=1; fi
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
# --- 基线不可解析时不得输出假 PASS（ccd75b62 前会打出「增量 ≤ 1200 行 ✅ PASS +0」）---
# 为什么单列一条：基线解析失败时所有依赖 diff 的检查都在拿空 diff 算，+0 的 PASS 是假绿，
# 人扫一眼「大多 PASS」会当成「只错了一行」；断言「任何 ✅ 都不许出现」比断言 FAIL 一行更严。
# no-fatal：旧实现把 git 的 `fatal: ambiguous argument ...` 原样打进报告（实测 9 行），
# 恰恰是配置写错、人真会去读日志的场景，报告不该被原始错误刷屏。
# 注意：必须锚定「表格结果行」（`^\| … \| ✅`），不能只 grep '✅'——ccd75b62 的说明文字里
# 本身就写着「避免出现「增量 +0 ✅ PASS」这类假 PASS」，直接匹配符号会把解释文案当成结果行（我第一版就这么红的）。
# 该文案已在 66a88202 改成不露 ✅ 的说法，但锚定写法仍要保留：文案随时可能再写回符号，
# 而 `grep -q '✅'` 一旦复活就是「假红」——会诱导后来人删断言，而不是修文案。
if printf '%s\n' "$out" | grep -qE '^\| [^|]+ \| ✅'; then
  echo "❌ 基线不可解析时仍输出 ✅ 结果行（假 PASS）"; printf '%s\n' "$out" | grep -E '^\| [^|]+ \| ✅' | head -3; FAIL=1
elif printf '%s\n' "$out" | grep -q 'fatal:'; then
  echo "❌ 报告里混入 git 原始 fatal 噪声"; printf '%s\n' "$out" | grep 'fatal:' | head -2; FAIL=1
elif ! printf '%s\n' "$out" | grep -q '未执行任何 diff 检查'; then
  echo "❌ 未说明「未执行 diff 检查」，人无法判断结论覆盖范围"; printf '%s\n' "$out" | tail -3; FAIL=1
else echo "✅ 基线不可解析 → 无 ✅ 结果行、无 fatal 噪声，且明说未执行 diff 检查"; fi
# --- gates.sh：GATE_REPO_DIR / GATE_BASE 的优先级与 fail-closed（d607178f, 0099fbd3）---
# 第 3 条防的是「三层默认值 ${1:-${GATE_BASE:-origin/main}} 被简化成 GATE_BASE 优先」：
# 那样 CI（传位置参数）与本地（export GATE_BASE）会行为分裂——gates 判的是 ref A、人以为在比 ref B。
# 这是本轮 AGENT_BASE_BRANCH 那个坑的同构版本，只是换了变量名。
# 断言只锚 rc 与表格行（^\| 仓库目录 \| / ^\| 基线 \|），不匹配「仓库目录不可用」这类解释性标题。
out="$(GATE_REPO_DIR=/tmp/nope-does-not-exist bash "$ROOT/scripts/agent/gates.sh" origin/main 2>&1)"; rc=$?
if [ "$rc" != "0" ] && printf '%s\n' "$out" | grep -qE '^\| 仓库目录 \| ❌ FAIL' \
   && ! printf '%s\n' "$out" | grep -q '结论：PASS'; then
  echo "✅ GATE_REPO_DIR 不可进入 → fail-closed（不出 PASS）"
else echo "❌ GATE_REPO_DIR 不可进入时未 fail-closed（rc=${rc}）"; printf '%s\n' "$out" | tail -6; FAIL=1; fi

out="$(GATE_BASE=origin/does-not-exist bash "$ROOT/scripts/agent/gates.sh" 2>&1)"; rc=$?
if [ "$rc" != "0" ] && printf '%s\n' "$out" | grep -q 'ref 不存在：origin/does-not-exist'; then
  echo "✅ 无位置参数时 GATE_BASE 生效"
else echo "❌ GATE_BASE 未生效（rc=${rc}）"; printf '%s\n' "$out" | tail -6; FAIL=1; fi

# 在 $T 里跑而不是真仓：真仓的「增量 ≤ 1200 行」「Zero-Dep」「无调试残留」会随分支内容变，
# 把它当 rc=0 的前提会让这条用例在别人分支上无缘无故变红（实测：真仓当前 rc=0，但那是巧合）。
# 先造一次非空交付，rc=0 才是这个场景的确定结论，而不是"当前仓库恰好干净"的副产品。
reset; echo 'x' >> a.txt; git add -A; git commit -qm d
out="$(GATE_REPO_DIR="$T" GATE_BASE=origin/does-not-exist bash "$ROOT/scripts/agent/gates.sh" origin/main 2>&1)"; rc=$?
if [ "$rc" = "0" ] && printf '%s\n' "$out" | grep -qE '^\| 基线 \| origin/main \|'; then
  echo "✅ 位置参数优先于 GATE_BASE（rc=0 且基线仍是 origin/main）"
else echo "❌ 位置参数未优先于 GATE_BASE（rc=${rc}）"; printf '%s\n' "$out" | tail -6; FAIL=1; fi
reset; mkdir -p scripts/acceptance; echo ':' > scripts/acceptance/story-1-1.sh; git add -A; git commit -qm t
case_ "Agent 分支改 scripts/acceptance → FAIL" 1 1
case_ "非 Agent 分支改 scripts/acceptance → 放行" 0 0
reset; mkdir -p _bmad-output; seq 1 400 > _bmad-output/epics.md; git add -A; git commit -qm e
case_ "_bmad-output 不计 1200 行增量" 0 0
# --- 跨文件契约：gates.sh 的每条出口都必须在**行首**打 `**结论：`（qa.sh 侧为 03e07088）---
# 这条契约此前只活在 qa.sh 的注释里，没有任何断言：qa.sh:62 用 `grep -qE '^\*\*结论：'` 判「报告是否成立」，
# 但「行首」这件事是 gates.sh 需要保证的，两个文件各写一半、谁都没测。
# 防的退化：有人给结论行加缩进或 `> ` 引用符（做对齐美化、把结论塞进引用块）→ qa.sh 恒判「无结论」
# → 整轮 QA 恒 REJECTED，而本文件**此前所有用例仍然全绿**（它们只断言报告里「有」结论，不断言行首），
# 现场表现是「门禁自己 PASS、QA 却永远打回」，没有任何一条红指向这里。
# 三个出口逐一覆盖，少一个就等于那个出口的缩进退化没人管：
#   正常收尾 gates.sh:152 / 基线不可解析 gates.sh:49(exit 51) / 仓库目录不可用 gates.sh:25(heredoc, exit 27)
# 每条都同时锚 rc 与行首：只锚行首的话，出口根本没被触发时也可能被别的行混过去（那就是「从未求值」的变体）。
concl_bol() { printf '%s\n' "$1" | grep -qE '^\*\*结论：'; }
# 出口 1/3 正常收尾：先造一次非空交付，rc=0 才是这个场景的确定结论，而不是「仓库恰好干净」的副产品。
reset; echo 'y' >> b.txt; git add -A; git commit -qm d
out="$(GATE_REPO_DIR="$T" bash "$ROOT/scripts/agent/gates.sh" origin/main 2>&1)"; rc=$?
if [ "$rc" = "0" ] && concl_bol "$out"; then
  echo "✅ 正常出口的结论行在行首（qa.sh 的 ^\\*\\*结论： 能命中）"
else echo "❌ 正常出口未在行首给结论（rc=${rc}）→ qa.sh 会恒判「无结论」"; printf '%s\n' "$out" | tail -6; FAIL=1; fi
# 出口 2/3 基线不可解析（早退，不跑任何 diff 检查）
out="$(GATE_REPO_DIR="$T" bash "$ROOT/scripts/agent/gates.sh" origin/does-not-exist 2>&1)"; rc=$?
if [ "$rc" = "1" ] && concl_bol "$out"; then
  echo "✅ 基线不可解析出口的结论行在行首"
else echo "❌ 基线不可解析出口未在行首给结论（rc=${rc}）"; printf '%s\n' "$out" | tail -6; FAIL=1; fi
# 出口 3/3 仓库目录不可用（fail-closed，结论在 heredoc 正文里——heredoc 最容易被人加缩进改坏）
out="$(GATE_REPO_DIR=/tmp/nope-xyz bash "$ROOT/scripts/agent/gates.sh" origin/main 2>&1)"; rc=$?
if [ "$rc" = "1" ] && concl_bol "$out"; then
  echo "✅ 仓库目录不可用出口的结论行在行首"
else echo "❌ 仓库目录不可用出口未在行首给结论（rc=${rc}）"; printf '%s\n' "$out" | tail -6; FAIL=1; fi
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
# 〔契约〕不是 B2 的回归用例：对 49d83449 无判别力（那版同样返回 T1-1），
# 但对 aeb9c5cc（T 支持尚不存在那版）是 1-1，因此能拦住「T 支持被整体回退」。
# 具体拦截场景：把 *[!a-zA-Z][Tt]) 改成 *[[:punct:]][Tt]) 这类「看起来更规范」的重构，
# 会让 故事T1-1 静默变 1-1 并跑到 epic 1 story 1 的验收路径上——其余断言全绿，看不出来（已实测）。
# 说「无判别力」必须指明对哪两个 commit，否则这个词会被当成绝对判断而删掉本条。
eq "story_id CJK 前导仍按分隔符处理 故事T1-1 → T1-1〔契约〕" "$(story_id '故事T1-1')" "T1-1"
eq "story_spec 无规格不报错" "$(cd "$T" && story_spec HEAD 9-9; echo "rc=$?")" "rc=0"
exit $FAIL
