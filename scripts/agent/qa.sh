#!/usr/bin/env bash
# Agent 2 · QA Agent（独立红队）：对 PR 做「确定性门禁 + LLM 对抗审查」，据实裁定。
#   ACCEPTED → 评论报告 + qa:accepted + 自动 squash 合并（触发 ci-gke → Image Updater → ArgoCD）
#   REJECTED → 评论缺陷清单 + issue 重新打 agent:dev（触发 Dev Agent 返工，最多 AGENT_MAX_ATTEMPTS 次）
# 独立性：默认用与 Dev Agent 不同厂商的模型（codex），只读沙箱，不能改代码。
# 用法：scripts/agent/qa.sh <pr-number>
# 环境：GH_TOKEN（PAT）、AGENT_AUTO_MERGE（默认 1）、N8N_AGENT_EVENT_WEBHOOK（可选）
#       GATES_JOB_RESULT   托管 runner 上 gates job 的结论，必须为 success 才可能 ACCEPTED
#                          （本地手动运行时需显式设置，否则一律打回）
#       QA_AGENT_CMD       可选覆盖，按 shell 语法解析，末尾须接受「输出文件」参数
# 可信边界：本脚本、gates.sh、RULES 一律取自 main（workflow 检出 base 分支后 self_copy），
#           被审查的 PR 代码只作为数据检出到工作区。
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
self_copy qa.sh "$@"
cd "$ROOT_DIR"

PR="${1:?用法: qa.sh <pr-number>}"
if [ -n "${QA_AGENT_CMD:-}" ]; then
  eval "QA_CMD=(${QA_AGENT_CMD})"   # 仓库变量，仅 owner 可设
else
  QA_CMD=(codex exec -s read-only --skip-git-repo-check -o)
fi
AUTO_MERGE="${AGENT_AUTO_MERGE:-1}"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT

ensure_labels
gh api "repos/${REPO}/pulls/${PR}" --jq '{headRefName: .head.ref, headRefOid: .head.sha, body: .body, title: .title, isCrossRepository: (.head.repo.full_name != .base.repo.full_name)}' > "$TMP/pr.json" 2>/dev/null \
  || gh pr view "$PR" -R "$REPO" --json headRefName,headRefOid,body,title,isCrossRepository > "$TMP/pr.json"
read_pr() { node -e 'const p=require(process.argv[1]);console.log(p[process.argv[2]] ?? "")' "$TMP/pr.json" "$1"; }
[ "$(read_pr isCrossRepository)" = "false" ] || die "拒绝验收 fork PR（自托管 runner 安全边界）"
HEAD_SHA="$(read_pr headRefOid)"
ISSUE="$(read_pr body | grep -oiE '(closes|fixes|resolves) #[0-9]+' | head -n1 | grep -oE '[0-9]+' || true)"

git fetch -q origin main "$(read_pr headRefName)"
git checkout -q --detach "$HEAD_SHA"
notify qa_started "QA Agent 开始验收 PR #${PR}" "$ISSUE" "$PR"

# 1. 确定性门禁（真实执行）
GATE_RC=0
GATE_REPO_DIR="$ROOT_DIR" GATE_AGENT_BRANCH=1 bash "$AGENT_SELF_DIR/gates.sh" origin/main > "$TMP/gates.md" 2>&1 || GATE_RC=$?
if [ "${GATES_JOB_RESULT:-}" != "success" ]; then
  GATE_RC=1
  printf '\n> ❌ 托管 runner 上的 gates job 结论为 `%s`（须为 success）\n' "${GATES_JOB_RESULT:-未提供}" >> "$TMP/gates.md"
fi

# 2. LLM 对抗审查
SPEC="（PR 未关联 issue）"
[ -n "$ISSUE" ] && SPEC="$(gh api "repos/${REPO}/issues/${ISSUE}" --jq '"### " + .title + "\n" + .body' 2>/dev/null || gh issue view "$ISSUE" -R "$REPO" --json title,body -q '"### " + .title + "\n" + .body')"
git diff origin/main...HEAD > "$TMP/diff.patch"
DIFF_BYTES="$(wc -c < "$TMP/diff.patch" | tr -d ' ')"
{
  echo "你是 firebird-sea 的独立验收 Agent（红队 QA）。前提：假定代码有缺陷，你的工作是找出来。"
  echo "你不能修改任何文件。只根据需求、diff、仓库现有代码、门禁结果做判断。"
  echo
  echo "## 需求（Issue #${ISSUE:-?}）"; echo "$SPEC"
  echo
  echo "## 工程铁律"; git show origin/main:.agents/RULES.md
  echo
  echo "## 确定性门禁结果"; cat "$TMP/gates.md"
  echo
  echo "## 审查清单"
  echo "1. 是否真正满足需求的每条验收标准（AC）？有无空实现/假实现/硬编码返回？"
  echo "2. 资金安全：金额精度（PHP 2 位 / USDT 6 位）、0/负数/重放/超时、私钥或敏感 Key 外泄。"
  echo "3. 鉴权与越权：受保护接口是否校验 Telegram initData HMAC；分站 A 能否看到分站 B 数据；SQL 注入/XSS。"
  echo "4. Docs-as-Code：文档描述是否与代码中的参数/字段/环境变量一致。"
  echo "5. 防臃肿：无关改动、过度抽象、死代码、重复造火鸟已有功能。"
  echo
  echo "## Diff（${DIFF_BYTES} 字节，超长已截断；需要时自行读取仓库文件）"
  echo '```diff'; head -c 120000 "$TMP/diff.patch"; echo; echo '```'
  echo
  echo "## 输出格式（严格）"
  echo "最后一条消息只输出一个 JSON 对象，不要任何其它文字："
  echo '{"verdict":"ACCEPTED|REJECTED","summary":"一句话结论","findings":[{"severity":"blocker|major|minor","file":"路径","issue":"问题","fix":"修复建议"}]}'
  echo "规则：有任何 blocker 或 major => REJECTED；只有 minor 可 ACCEPTED。"
} > "$TMP/prompt.md"

log "🛡️ 调用 QA Agent: ${QA_CMD[0]}"
agent_env "${QA_CMD[@]}" "$TMP/verdict.txt" - < "$TMP/prompt.md" > "$TMP/qa.log" 2>&1 || log "⚠️ QA Agent 非 0 退出"
[ -s "$TMP/verdict.txt" ] || tail -n 40 "$TMP/qa.log" > "$TMP/verdict.txt"

# 3. 解析裁定（解析失败 => fail-closed 判 REJECTED）
node - "$TMP/verdict.txt" "$GATE_RC" > "$TMP/result.md" <<'JS'
const fs = require('fs');
const [file, gateRc] = process.argv.slice(2);
const raw = fs.readFileSync(file, 'utf8');
let v = null;
const m = raw.match(/\{[\s\S]*"verdict"[\s\S]*\}/);
try { v = m && JSON.parse(m[0]); } catch (_) {}
if (!v || !['ACCEPTED', 'REJECTED'].includes(v.verdict)) {
  v = { verdict: 'REJECTED', summary: 'QA Agent 输出无法解析，按 fail-closed 打回', findings: [] };
}
const findings = Array.isArray(v.findings) ? v.findings : [];
if (findings.some(f => ['blocker', 'major'].includes(f.severity))) v.verdict = 'REJECTED';
if (gateRc !== '0') v.verdict = 'REJECTED';
const out = [`VERDICT=${v.verdict}`, '', `**QA 结论：** ${v.summary || ''}`, ''];
if (findings.length) {
  out.push('| 级别 | 文件 | 问题 | 修复建议 |', '| :--- | :--- | :--- | :--- |');
  for (const f of findings) {
    const c = s => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
    out.push(`| ${c(f.severity)} | \`${c(f.file)}\` | ${c(f.issue)} | ${c(f.fix)} |`);
  }
}
console.log(out.join('\n'));
JS
VERDICT="$(head -n1 "$TMP/result.md" | cut -d= -f2)"
ATTEMPT=$(( $(qa_reject_count "$PR") + 1 ))

if [ "$VERDICT" = "ACCEPTED" ]; then MARK="$QA_MARK_ACCEPT"; BADGE="🟢 ACCEPTED"; else MARK="$QA_MARK_REJECT"; BADGE="🔴 REJECTED"; fi
{
  echo "$MARK"
  echo "## 🛡️ 独立 QA 验收：${BADGE}"
  echo "> commit \`${HEAD_SHA:0:8}\` · 第 ${ATTEMPT} 轮 · QA 模型：\`${QA_CMD[0]}\`${RUN_URL:+ · [运行日志](${RUN_URL})}"
  echo
  tail -n +2 "$TMP/result.md"
  echo
  cat "$TMP/gates.md"
} | redact > "$TMP/comment.md"
gh pr comment "$PR" -R "$REPO" -F "$TMP/comment.md" >/dev/null

if [ "$VERDICT" = "ACCEPTED" ]; then
  set_label "$PR" "qa:accepted" "qa:rejected" "agent:qa"
  bmad_stage "https://github.com/${REPO}/pull/${PR}" ready-to-release
  [ -n "$ISSUE" ] && bmad_stage "https://github.com/${REPO}/issues/${ISSUE}" ready-to-release
  if [ "$AUTO_MERGE" = "1" ]; then
    # --match-head-commit：防止验收后有人又推了未验收的提交
    MERGE_OK=0
    if gh pr merge "$PR" -R "$REPO" --squash --delete-branch --match-head-commit "$HEAD_SHA" >/dev/null 2>&1; then
      MERGE_OK=1
    elif gh api -X PUT "repos/${REPO}/pulls/${PR}/merge" -f merge_method=squash -f sha="$HEAD_SHA" >/dev/null 2>&1; then
      git push origin --delete "$(read_pr headRefName)" >/dev/null 2>&1 || true
      MERGE_OK=1
    fi
    if [ "$MERGE_OK" = "1" ]; then
      notify merged "PR #${PR} QA 通过并已自动合并，CI 构建镜像中" "$ISSUE" "$PR"
    else
      notify merge_failed "PR #${PR} QA 通过但自动合并失败，请检查" "$ISSUE" "$PR"; exit 1
    fi
  else
    notify qa_accepted "PR #${PR} QA 通过，等待人工合并" "$ISSUE" "$PR"
  fi
else
  set_label "$PR" "qa:rejected" "qa:accepted" "agent:qa"
  bmad_stage "https://github.com/${REPO}/pull/${PR}" in-qa
  [ -n "$ISSUE" ] && bmad_stage "https://github.com/${REPO}/issues/${ISSUE}" in-progress
  notify qa_rejected "PR #${PR} 第 ${ATTEMPT} 轮被 QA 打回" "$ISSUE" "$PR"
  # 打回 => issue 重新进入 agent:dev，触发 Dev Agent 返工（dev.sh 内部有次数上限）
  [ -n "$ISSUE" ] && set_label "$ISSUE" "agent:dev" "agent:qa"
  exit 1
fi
