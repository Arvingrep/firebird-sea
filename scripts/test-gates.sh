#!/usr/bin/env bash
# gates.sh 自测：Zero-Dep 批准清单 / 受保护路径 / _bmad-output 不计行。在临时仓库里造 base+分支，不碰当前仓库。
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT
# 下面三行必须分开写，不能写成 `git init && cd "$T" && git config …`：本脚本是 set -uo pipefail（没有 -e），
# init 失败时 `cd` 会被 && 短路跳过，脚本继续在**调用者目录**里跑，紧接着造 base 提交的那句
# `git add -A` 就落进别人的仓库。
# 实测（用只让 init 返回 128 的 git 桩）：调用者仓库里凭空出现 .agents/ package.json a.txt b.txt、
# 多出 base/d 两个提交，且 `git update-ref refs/remotes/origin/main HEAD` 把调用者的 origin/main
# 指向了合成的 base 提交 —— 而 `git status --porcelain` 是**空的**（全都已提交），人从外部看不出来被污染。
# 所以这里改成硬失败（exit 2 = 场地故障，不是用例失败）：宁可这一轮测试根本不跑，
# 也不能在别人的仓库里 add -A。
# 另外 `${T}` 必须带花括号：写成 `$T）` 时 bash 会把全角右括号当成变量名的一部分（实测报
# `T）: unbound variable`），于是这两条 fail-fast 自己先崩、`exit 2` 根本不执行 —— 加固措施
# 本身成了新的静默点。这条对任何「$变量 紧跟中文」的写法都成立。
git -C "$T" init -q -b main || { echo "❌ 无法在临时目录建 git 仓（${T}），已中止：后续 git add -A 会落在调用者目录" >&2; exit 2; }
cd "$T" || { echo "❌ 无法进入临时目录（${T}），已中止" >&2; exit 2; }  # 兜底，未证明可达：init 成功后 $T 必定可进，别把它算进覆盖
git config user.email t@t && git config user.name t
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
# --- 受保护路径的 owner 通道（2026-11-05）：身份 ≠ 授权，授权 ≠ 身份 ---
# 背景：此前 owner/ 与 agent/ 同权、无豁免分支，升级护栏的 PR 永远红 → 唯一出路是直推 canary，
# 而直推没有 review 记录。三条用例锁住新判据，少一条就等于那个方向没人测：
case_owner() { # case_owner <名称> <期望rc> <GATE_AGENT_BRANCH> <GATE_OWNER_BRANCH> <GATE_OWNER_APPROVED>
  local out rc
  out="$(GATE_REPO_DIR="$T" GATE_AGENT_BRANCH="$3" GATE_OWNER_BRANCH="$4" GATE_OWNER_APPROVED="$5" \
         bash "$ROOT/scripts/agent/gates.sh" origin/main 2>&1)"; rc=$?
  if [ "$rc" = "$2" ]; then echo "✅ $1"; else echo "❌ ${1}（期望 ${2} 实际 ${rc}）"; printf '%s\n' "$out" | tail -20; FAIL=1; fi
}
reset; mkdir -p scripts/acceptance; echo ':' > scripts/acceptance/story-2-1.sh; git add -A; git commit -qm t
case_owner "owner 分支 + owner-approved 标签改受保护路径 → 放行" 0 1 1 1
out="$(GATE_REPO_DIR="$T" GATE_AGENT_BRANCH=1 GATE_OWNER_BRANCH=1 GATE_OWNER_APPROVED=1 bash "$ROOT/scripts/agent/gates.sh" origin/main 2>&1)"
if printf '%s\n' "$out" | grep -q '受保护路径改动 | ⚠️ WARN'; then
  echo "✅ owner 通道放行时报告记 WARN（不判 PASS，留痕）"
else echo "❌ owner 通道放行未在报告留 WARN 痕迹（等于看起来像没动过护栏）"; printf '%s\n' "$out" | head -8; FAIL=1; fi
case_owner "owner 分支缺 owner-approved 标签 → 仍 FAIL" 1 1 1 0
case_owner "只有标签、分支不是 owner/ → 仍 FAIL（身份不可用标签替代）" 1 1 0 1
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
# --- gates.sh 第 10 项：API 契约同步 ---
# 三种失效模式都要挡住：①改了路由不带测试 ②带了测试但 OpenAPI 没跟 ③OpenAPI 写成与代码不一致。
# 夹具要自包含：门禁在 $T 里跑，而检查器是 `node scripts/api-contract-check.js`（相对 cwd），
# 所以把真脚本拷进夹具，并造最小 services/api/src + docs/api。
reset
mkdir -p scripts services/api/src services/api/test docs/api
cp "$ROOT/scripts/api-contract-check.js" scripts/
printf "router.get('/health', h);\n" > services/api/src/server.js
printf '' > services/api/src/addrShareRoute.js
printf '' > services/api/test/.gitkeep   # git 不追踪空目录，reset 后 test/ 会消失
printf 'openapi: 3.0.3\npaths:\n  /tg-api/health:\n    get:\n      summary: x\n' > docs/api/openapi.yaml
git add -A; git commit -qm api-fixture
git update-ref refs/remotes/origin/main HEAD   # 夹具进基线，后面 reset 才回得到

reset
printf "router.get('/health', h);\nrouter.get('/new', h);\n" > services/api/src/server.js
printf 'openapi: 3.0.3\npaths:\n  /tg-api/health:\n    get:\n      summary: x\n  /tg-api/new:\n    get:\n      summary: y\n' > docs/api/openapi.yaml
git commit -qam d
case_ "改路由+同步 OpenAPI 但没带测试 → FAIL" 1 0

reset
printf "router.get('/health', h);\nrouter.get('/new', h);\n" > services/api/src/server.js
printf 'openapi: 3.0.3\npaths:\n  /tg-api/health:\n    get:\n      summary: x\n  /tg-api/new:\n    get:\n      summary: y\n' > docs/api/openapi.yaml
printf "require('node:test')('x', () => {});\n" > services/api/test/new.test.js
git add -A; git commit -qm d
case_ "改路由+测试+OpenAPI 且契约一致 → 放行" 0 0

reset
printf 'openapi: 3.0.3\npaths:\n  /tg-api/health:\n    get:\n      summary: x\n  /tg-api/ghost:\n    get:\n      summary: 描述了不存在的接口\n' > docs/api/openapi.yaml
git commit -qam d
case_ "OpenAPI 写了代码里没有的接口 → FAIL" 1 0

reset
mkdir -p services/api/test
printf "router.get('/health', h);\nrouter.get('/new', h);\n" > services/api/src/server.js
printf "require('node:test')('x', () => {});\n" > services/api/test/new.test.js
git add -A; git commit -qm d
case_ "改路由+带测试但 OpenAPI 未更新 → FAIL" 1 0

# --- gates.sh 第 10 项：PHP 接口契约（webroot/api/handlers ↔ openapi-waimai-article.yaml）---
# 判据是**双向集合比对**，不是「改了 handler 就得改文档」：修 bug 不动接口签名是常见且正确的
# 改动，若按「碰了文件就必须动文档」判，会把它误杀，人就会开始用 chore/ 前缀绕过整条门禁。
# 夹具自包含：拷真检查器 + 造最小 handlers / spec / 台账。
reset
mkdir -p webroot/api/handlers docs/api .agents
cp "$ROOT/scripts/api-contract-check-php.js" scripts/
cat > webroot/api/handlers/demo.class.php <<'PHP'
<?php
class demo {
    public function list() { return array("state" => 100); }
    public function detail() { return array("state" => 100); }
}
PHP
cat > docs/api/openapi-waimai-article.yaml <<'YML'
openapi: 3.0.3
paths:
  /demo/list:
    get:
      summary: x
  /demo/detail:
    get:
      summary: y
YML
printf '# 无欠债\n' > .agents/api-contract-debt.txt
git add -A; git commit -qm php-fixture
git update-ref refs/remotes/origin/main HEAD   # 夹具进基线，后面 reset 才回得到

reset
cat > webroot/api/handlers/demo.class.php <<'PHP'
<?php
class demo {
    public function list() { return array("state" => 100); }
    public function detail() { return array("state" => 100); }
    public function brandNew() { return array("state" => 100); }
}
PHP
printf '# 契约\n' > docs/api/README.md
git add -A; git commit -qm d
case_ "PHP 新增接口未补文档 → FAIL" 1 0

reset
cat > webroot/api/handlers/demo.class.php <<'PHP'
<?php
class demo {
    public function list() { return array("state" => 100); }
    public function detail() { return array("state" => 100); }
    public function brandNew() { return array("state" => 100); }
}
PHP
cat >> docs/api/openapi-waimai-article.yaml <<'YML'
  /demo/brandNew:
    get:
      summary: z
YML
git commit -qam d
case_ "PHP 新增接口并同步文档 → 放行" 0 0

reset
cat >> docs/api/openapi-waimai-article.yaml <<'YML'
  /demo/ghost:
    get:
      summary: 描述了不存在的接口
YML
git commit -qam d
case_ "PHP 文档写了代码里没有的接口 → FAIL" 1 0

reset
cat > webroot/api/handlers/fresh.class.php <<'PHP'
<?php
class fresh {
    public function a() { return array("state" => 100); }
}
PHP
printf '# 契约\n' > docs/api/README.md
git add -A; git commit -qm d
case_ "新增 handler 未登记欠债 → FAIL" 1 0

reset
cat > webroot/api/handlers/fresh.class.php <<'PHP'
<?php
class fresh {
    public function a() { return array("state" => 100); }
}
PHP
printf 'fresh 2099-12-31 新业务待补文档\n' >> .agents/api-contract-debt.txt
# 新增的是业务 PHP 文件，会另外触发 Docs-as-Code（要求同 PR 动 docs/）——那是另一条门禁，
# 这里补一个 docs 改动把它隔离掉，否则这条用例测的就不是契约台账了。
printf '# 契约\n' > docs/api/README.md
git add -A; git commit -qm d
case_ "新增 handler 登记欠债且未到期 → 放行" 0 0

# 下面两条针对检查器自己的漏报（QA 第 8 轮指出）。漏报比误报危险：接口被漏掉时门禁是绿的，
# 没有人会去看一份通过的日志。
reset
cat > webroot/api/handlers/demo.class.php <<'PHP'
<?php
class demo {
    public function list() { return array("state" => 100); }
    public function detail() { return array("state" => 100); }
    public static function ping() { return array("state" => 100); }
}
PHP
printf '# 契约\n' > docs/api/README.md
git add -A; git commit -qm d
case_ "public static 方法也算接口（未补文档 → FAIL）" 1 0

reset
# `$re = "/*"` 这种字符串字面量里出现 `/*`：按正则整体剥注释，会从这里一路吃到**后面**那个
# `*/`，把中间的方法一起吞掉。所以 detail 放在字符串与尾注释之间——被吞掉时它就成了
# 「文档有、代码没有」，门禁反而报错；修好后应当放行。
cat > webroot/api/handlers/demo.class.php <<'PHP'
<?php
class demo {
    public function list() { $re = "/*"; return array("state" => 100); }
    public function detail() { return array("state" => 100); }
    /* 尾巴注释 */
}
PHP
printf '# 契约\n' > docs/api/README.md
git add -A; git commit -qm d
case_ "字符串里的 /* 不吞掉中间的方法 → 放行" 0 0

# PHP 里不写可见性 = public，分发器 `method_exists()` + `$obj->$action()` 能直接调。
# article.class.php 的 getCommonList / rewardList 就是这种写法，此前被漏掉，
# 导致「143 个接口零差异」的结论本身是错的（真实 145）。
reset
cat > webroot/api/handlers/demo.class.php <<'PHP'
<?php
class demo {
    public function list() { return array("state" => 100); }
    public function detail() { return array("state" => 100); }
    function legacyNoModifier() { return array("state" => 100); }
}
PHP
printf '# 契约\n' > docs/api/README.md
git add -A; git commit -qm d
case_ "不写可见性的方法也算接口（PHP 默认 public → FAIL）" 1 0

# 反方向：放宽别放过头。private / protected 不该被当成接口，否则每个内部辅助函数
# 都会被要求写进契约，人就会开始往台账里塞垃圾。
reset
cat > webroot/api/handlers/demo.class.php <<'PHP'
<?php
class demo {
    public function list() { return array("state" => 100); }
    public function detail() { return array("state" => 100); }
    private function helperA() { return 1; }
    protected function helperB() { return 2; }
}
PHP
printf '# 契约\n' > docs/api/README.md
git add -A; git commit -qm d
case_ "private / protected 方法不算接口 → 放行" 0 0

# 类外的顶层函数不是 action：分发器是 `new $service()` + `$obj->$action()`，类外函数调不到。
# 若把它们算成接口，每个 handler 里的旧 shim 都会被要求写契约，人就会往台账里塞垃圾。
reset
cat > webroot/api/handlers/demo.class.php <<'PHP'
<?php
class demo {
    public function list() { return array("state" => 100); }
    public function detail() { return array("state" => 100); }
}
function legacyGlobal() { return 1; }
PHP
printf '# 契约\n' > docs/api/README.md
git add -A; git commit -qm d
case_ "类外顶层函数不算接口 → 放行" 0 0

# --- 门禁基线默认值：三处必须一致，且必须等于实际集成分支（canary）---
# 为什么单列一条：#188 的 QA 指出 Makefile 与 gates.sh 的默认值各写一份，改一处漏一处就永远"看起来对齐"。
# 更隐蔽的是三处一致地指向 main —— 一致地错，diff 恒为全仓，报告里每项都"有数"却没人用得着。
# 所以判据不是"两边相等"，而是"三处都等于集成分支"。改错任何一处都必须变红。
G_DEF="$(grep -oE 'GATE_BASE:-origin/[a-z]+' "$ROOT/scripts/agent/gates.sh" 2>/dev/null | head -1 | sed 's/^GATE_BASE:-//')"
M_DEF="$(grep -E '^GATE_BASE' "$ROOT/Makefile" 2>/dev/null | grep -oE 'AGENT_BASE_BRANCH\),[a-z]+' | grep -oE '[a-z]+$')"
L_DEF="$(grep -oE 'AGENT_BASE_BRANCH:-[a-z]+' "$ROOT/scripts/agent/lib.sh" 2>/dev/null | head -1 | grep -oE '[a-z]+$')"
if [ "$G_DEF" = "origin/canary" ] && [ "$M_DEF" = "canary" ] && [ "$L_DEF" = "canary" ]; then
  echo "✅ 门禁基线三处默认值一致，且等于集成分支 canary"
else echo "❌ 门禁基线默认值不一致或未指向 canary：gates.sh=${G_DEF:-读不到} Makefile=origin/${M_DEF:-读不到} lib.sh=origin/${L_DEF:-读不到}（应同为 origin/canary）"; FAIL=1; fi


# =====================================================================
# 检查环补全（rules.yaml 里 10 条「无故意违反必红用例」+ O-02 执行环）
# 原则：每条 hard 规则至少一条「故意违反 → 指定检查项 FAIL」的用例；
#       只断 rc=1 不够——那可能被别的检查项顶包（假红顶真绿），
#       所以这里统一断「指定行的指定结果 + rc」，用 row_is 代替 case_。
# =====================================================================
assert_ok() { # assert_ok <名称> <命令…>：命令成功 → ✅；失败 → ❌ 计 FAIL（检查器型断言的统一出口）
  local n="$1"; shift
  if "$@"; then echo "✅ $n"; else echo "❌ $n"; FAIL=1; fi
}
row_is() { # row_is <名称> <检查项名> <期望rc> <期望标记 PASS|FAIL|WARN> [GATE_AGENT_BRANCH]
  local out rc want
  case "$4" in PASS) want='✅ PASS';; FAIL) want='❌ FAIL';; WARN) want='⚠️ WARN';; *) want="$4";; esac
  out="$(GATE_REPO_DIR="$T" GATE_AGENT_BRANCH="${5:-0}" bash "$ROOT/scripts/agent/gates.sh" origin/main 2>&1)"; rc=$?
  if [ "$rc" = "$3" ] && printf '%s\n' "$out" | grep -qF "| $2 | $want"; then
    echo "✅ $1"
  else
    echo "❌ $1（期望 rc=$3 且「$2」=${want}）"; printf '%s\n' "$out" | grep -E '^\| ' | head -20; FAIL=1
  fi
}

# --- Q-04 非空交付 ---
reset
row_is "Q-04 相对基线无改动 → 非空交付 FAIL" "非空交付" 1 FAIL

# --- C-01 Docs-as-Code：改业务代码必须同 PR 动 docs/ ---
reset; mkdir -p app; printf '<?php\nreturn 1;\n' > app/svc.php; git add -A; git commit -qm d
row_is "C-01 改业务代码不带 docs → FAIL" "Docs-as-Code" 1 FAIL
reset; mkdir -p app docs; printf '<?php\nreturn 1;\n' > app/svc.php; printf '# svc\n' > docs/svc.md; git add -A; git commit -qm d
row_is "C-01 改业务代码同 PR 更新 docs → 放行" "Docs-as-Code" 0 PASS

# --- S-01 增量密钥 ---
# 夹具在运行时拼接：本文件里不能出现完整的密钥字面量。
# 原因（QA 第 2 轮 blocker）：QA 跑的是**基线版** gates.sh，分支上新加的排除对它无效；
# 靠「排除文件」会让这个 PR 过不了自己的门禁，靠「拼接」则与门禁版本无关。
reset; printf '%s=%s\n' 'TRONGRID_API_KEY' 'abcd1234efgh' > cfg.env; git add -A; git commit -qm d
row_is "S-01 新增行含 TRONGRID_API_KEY → 增量泄漏 FAIL" "无密钥泄漏（增量）" 1 FAIL

# --- Q-01 垃圾文件 ---
reset; echo x > a.bak; git add -A; git commit -qm d
row_is "Q-01 新增 .bak 垃圾文件 → FAIL" "无垃圾文件" 1 FAIL

# --- Q-02 调试残留 + scripts/ 豁免 ---
reset; mkdir -p app; printf '<?php\nvar_dump(1);\n' > app/svc.php; git add -A; git commit -qm d
row_is "Q-02 业务代码 var_dump → FAIL" "无调试残留" 1 FAIL
reset; mkdir -p scripts; printf 'console.log("boot");\n' > scripts/boot.js; git add -A; git commit -qm d
row_is "Q-02 scripts/ 下 console.log 豁免 → 放行" "无调试残留" 0 PASS

# --- Q-03 改动文件语法 ---
reset; printf 'function broken( {\n' > bad.js; printf '{"a":\n' > bad.json; git add -A; git commit -qm d
row_is "Q-03 语法错误的 .js/.json → FAIL" "改动文件语法" 1 FAIL

# --- O-02 kubectl/ArgoCD 只读（配合 gates.sh 新第 11 项）---
# 反例故意带参数：`kubectl -n prod delete` / `kubectl --context c apply` 是 QA 指出的绕过形态，
# 只测单空格形态等于没测那条正则（旧实现正是「一个空格」）。
reset; mkdir -p ops; printf '#!/bin/bash\nkubectl -n prod delete pod demo\nkubectl --context c apply -f .\n' > ops/cleanup.sh; git add -A; git commit -qm d
row_is "O-02 kubectl 写操作 → FAIL" "kubectl/ArgoCD 只读" 1 FAIL
reset; mkdir -p ops; printf '#!/bin/bash\nkubectl delete pod demo\n' > ops/cleanup.sh; git add -A; git commit -qm d
out="$(GATE_REPO_DIR="$T" GATE_AGENT_BRANCH=1 GATE_OWNER_BRANCH=1 GATE_OWNER_APPROVED=1 bash "$ROOT/scripts/agent/gates.sh" origin/main 2>&1)"; rc=$?
if [ "$rc" = "0" ] && printf '%s\n' "$out" | grep -qF '| kubectl/ArgoCD 只读 | ⚠️ WARN'; then
  echo "✅ O-02 owner 双信号应急写 → WARN 放行"
else echo "❌ O-02 owner 应急未按 WARN 放行（rc=${rc}）"; printf '%s\n' "$out" | grep -E '^\| ' | head -20; FAIL=1; fi
reset; mkdir -p ops; printf '#!/bin/bash\nkubectl -n prod get pods\nkubectl top node\nkubectl rollout status deploy/x\n' > ops/check.sh; git add -A; git commit -qm d
row_is "O-02 kubectl 只读命令 → 放行" "kubectl/ArgoCD 只读" 0 PASS
# 文档里描述写命令是操作指引，不是执行：deploy/ 的 NOTES/README 必然出现这类句子，
# 判红等于逼人改措辞（误报比漏报更逼人绕路）——只扫可执行类文件才拦得住该拦的。
reset; mkdir -p deploy; printf '# 运维说明\nkubectl create secret generic x --from-literal=a=b\n' > deploy/NOTES.md; git add -A; git commit -qm d
row_is "O-02 文档里写 kubectl 写命令 → 不误伤" "kubectl/ArgoCD 只读" 0 PASS

# --- C-05 Helm 多站点渲染（本机无 helm 时跳过，以 CI runner 为准）---
if command -v helm >/dev/null; then
  reset; mkdir -p deploy/helm/firebird-site/templates
  printf 'apiVersion: v2\nname: firebird-site\nversion: 0.1.0\n' > deploy/helm/firebird-site/Chart.yaml
  printf 'replicas: 1\n' > deploy/helm/firebird-site/values-a.yaml
  printf 'apiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: x\n' > deploy/helm/firebird-site/templates/cm.yaml
  git add -A; git commit -qm chart
  git update-ref refs/remotes/origin/main HEAD   # 健康 chart 进基线
  reset; printf 'site:\n  name: [unclosed\n' > deploy/helm/firebird-site/values-zz.yaml; git add -A; git commit -qm d
  row_is "C-05 values 文件 YAML 损坏 → 渲染 FAIL" "Helm 多站点渲染" 1 FAIL
  reset; printf 'replicas: 2\n' > deploy/helm/firebird-site/values-a.yaml; git commit -qam d
  row_is "C-05 合法 chart 改动 → 放行" "Helm 多站点渲染" 0 PASS
else
  echo "⚠️ 本机无 helm，C-05 两条用例跳过（CI runner 以 gates 实跑为准）"
fi

# --- B-08 分支前缀触发门禁：workflow 白名单四前缀 × 两个 job（gates 与 agent-qa）都不能少 ---
# 检查器本体：`startsWith(github.head_ref, '<前缀>')` 每个前缀至少出现 2 次。
# 只 grep 文件存在是不够的——历史上真发生过「改 workflow 时顺手删了一个前缀」，门禁对那类分支静默失效。
B08_FILE="$ROOT/.github/workflows/ci-verify.yml"
b08_ok() {
  local p
  for p in 'agent/' 'arvino/' 'feature/' 'owner/'; do
    [ "$(grep -c "startsWith(github.head_ref, '$p')" "$B08_FILE")" -ge 2 ] || return 1
  done
}
assert_ok "B-08 四前缀在两个 job 均触发门禁" b08_ok
# 故意违反必红：删掉 feature/ 的副本必须变红，否则这条断言是常绿摆设
sed "s|startsWith(github.head_ref, 'feature/')||g" "$B08_FILE" > "$T/b08-bad.yml"
B08_FILE="$T/b08-bad.yml"
if b08_ok; then echo "❌ B-08 反例未红（删 feature/ 后检查器仍绿 = 失效）"; FAIL=1
else echo "✅ B-08 反例：删掉 feature/ → 检查器变红"; fi
B08_FILE="$ROOT/.github/workflows/ci-verify.yml"

# --- T-02 返工上限：默认 3 + agent:blocked 机制 ---
# 判据用整行字面量，防止「默认值 3 改成 9、用例只 grep 变量名」这种假绿。
t02_ok() { grep -qF 'MAX_ATTEMPTS="${AGENT_MAX_ATTEMPTS:-3}"' "$1" && grep -q 'agent:blocked' "$1"; }
assert_ok "T-02 返工上限默认 3 且有 agent:blocked 机制" t02_ok "$ROOT/scripts/agent/lib.sh"
sed 's/AGENT_MAX_ATTEMPTS:-3/AGENT_MAX_ATTEMPTS:-9/' "$ROOT/scripts/agent/lib.sh" > "$T/lib-bad.sh"
if t02_ok "$T/lib-bad.sh"; then echo "❌ T-02 反例未红（默认 3→9 后检查器仍绿 = 失效）"; FAIL=1
else echo "✅ T-02 反例：默认 3→9 → 检查器变红"; fi

# --- C-06 Dockerfile 引用路径存在（#189 断引用的执行环）---
# 这条不是「有没有写检查」，而是「删了目录之后有没有人发现」：#189 删 apps/tma，
# Dockerfile.api 仍 COPY apps/tma/，当时门禁 14 项全绿、CI 4 个 job 全绿，只有 QA 靠人读出来的。
reset; mkdir -p deploy services/api/src; printf 'FROM node:20 AS builder\nCOPY services/api/src ./src\nCOPY apps/gone/ ./gone\n' > deploy/Dockerfile.api; git add -A; git commit -qm d
row_is "C-06 Dockerfile COPY 断引用 → FAIL" "Dockerfile 引用路径存在" 1 FAIL
reset; mkdir -p deploy; printf 'FROM node:20 AS builder\nWORKDIR /app\nFROM node:20 AS runner\nCOPY --from=nope /x ./y\n' > deploy/Dockerfile.api; git add -A; git commit -qm d
row_is "C-06 COPY --from 指向不存在的阶段 → FAIL" "Dockerfile 引用路径存在" 1 FAIL
# 反例中的反例：多阶段构建的 --from 源路径是阶段内部绝对路径（/app/node_modules），
# 不能拿宿主仓库校验。首版就在这里误判，canary 自己的 Dockerfile.api 被红了两项。
reset; mkdir -p deploy services/api/src; printf 'FROM node:20 AS builder\nCOPY services/api/src ./src\nFROM node:20 AS runner\nCOPY --from=builder /app/src ./src\n' > deploy/Dockerfile.api; git add -A; git commit -qm d
row_is "C-06 多阶段 COPY --from 不误伤 → 放行" "Dockerfile 引用路径存在" 0 PASS

# --- S-02 存量欠债：key.pem + 未到期登记先固化进 base（此后所有用例都带 WARN 欠债，rc 不受影响）---
# PEM 头同样运行时拼接，本文件不留完整私钥头字面量
reset; mkdir -p srv; printf -- '-----BEGIN RSA %s KEY-----\nabc\n-----END RSA PRIVATE KEY-----\n' PRIVATE > srv/key.pem
printf 'srv/key.pem 2099-01-01 审计登记待轮换\n' >> .agents/secret-scan-allow.txt
git add -A; git commit -qm key-fixture
git update-ref refs/remotes/origin/main HEAD
# 用覆盖写而不是 sed -i：-i '' 是 macOS/BSD 写法，GNU sed 会把 '' 当文件名（CI 上必炸）
reset; printf 'srv/key.pem 2020-01-01 审计登记待轮换\n' > .agents/secret-scan-allow.txt; git commit -qam d
row_is "S-02 白名单已过期 → 存量欠债 FAIL" "密钥存量欠债" 1 FAIL
# 注意：空交付本身是非空交付 FAIL（rc=1），WARN 断言必须配一个真实提交才能拿到 rc=0
reset; echo y >> a.txt; git commit -qam d
row_is "S-02 白名单未到期 → WARN 放行" "密钥存量欠债" 0 WARN


# --- 规则真相源 ↔ 门禁项：门禁在白拦，必须有规则为它背书 ---
# 为什么需要这条：#188 那轮照「命名规律」给方案表填了 9 个 enforce 签名
# （gates.sh#protected / #max_added / …），gates.sh 里一个都不存在。**指错的锚点比没有锚点更坏**——
# 它看起来有人管。所以两个方向都要能抓：
#   规则→门禁：写了签名但文件里没有（BAD_ENFORCE，抄错锚点）
#   门禁→规则：门禁有个检查项，但没有任何规则指向它（白拦：坏了没人知道为什么它存在）
if ! command -v node >/dev/null 2>&1; then
  # 不能"跳过"：静默跳过就是 verify-task.sh 里那 30 行恒假守卫的翻版。缺工具是环境问题，要红。
  echo "❌ 规则真相源体检缺少 node（环境缺失，不是跳过）"; FAIL=1
else
  out="$(node "$ROOT/scripts/agent/check-rings.js" "$ROOT" 2>&1)"; rc=$?
  if [ "$rc" = 0 ] && printf '%s\n' "$out" | grep -q '无背书 0'; then
    echo "✅ 规则真相源：四环 100% 且 gates.sh 每个检查项都有规则背书"
  else
    echo "❌ 规则真相源体检未通过（rc=${rc}）"
    printf '%s\n' "$out" | grep -E '❌|无背书 [1-9]|坏执行|无用例' | head -8; FAIL=1
  fi

  # 反例 A（门禁→规则）：凭空多一项没人背书的检查，必须变红并点名
  F2="$T/rules-fixture"; rm -rf "$F2"; mkdir -p "$F2/scripts/agent" "$F2/docs/agent"
  cp "$ROOT/scripts/agent/gates.sh" "$F2/scripts/agent/gates.sh"
  printf 'row "凭空多出来的检查项" "✅ PASS"\n' >> "$F2/scripts/agent/gates.sh"
  cp "$ROOT/docs/agent/rules.yaml" "$F2/docs/agent/rules.yaml"
  out="$(node "$ROOT/scripts/agent/check-rings.js" "$F2" 2>&1)"; rc=$?
  if [ "$rc" = 1 ] && printf '%s\n' "$out" | grep -q '凭空多出来的检查项'; then
    echo "✅ 反例：门禁多一项无人背书 → 体检变红并点名"
  else echo "❌ 反例未红（多出的检查项没被抓住，rc=${rc}）"; printf '%s\n' "$out" | tail -4; FAIL=1; fi

  # 反例 B（规则→门禁）：把 enforce 签名改成不存在的，必须变红且指出找不到哪个签名
  F3="$T/rules-fixture-bad"; rm -rf "$F3"; mkdir -p "$F3/scripts/agent" "$F3/docs/agent"
  cp "$ROOT/scripts/agent/gates.sh" "$F3/scripts/agent/gates.sh"
  sed 's|gates.sh#无垃圾文件|gates.sh#这个检查项不存在|' "$ROOT/docs/agent/rules.yaml" > "$F3/docs/agent/rules.yaml"
  out="$(node "$ROOT/scripts/agent/check-rings.js" "$F3" 2>&1)"; rc=$?
  if [ "$rc" = 1 ] && printf '%s\n' "$out" | grep -q '这个检查项不存在'; then
    echo "✅ 反例：enforce 指向不存在的检查项 → 体检变红并点名"
  else echo "❌ 反例未红（编造的签名没被抓住，rc=${rc}）"; printf '%s\n' "$out" | tail -4; FAIL=1; fi
fi

