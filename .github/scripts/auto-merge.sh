#!/usr/bin/env bash
# 自动合并进 canary 的 PR（流程闭环的最后一步）。条件全部满足才合并：
#   1. 目标分支 canary，来源分支在本仓库，非草稿，GitHub 判定可合并（mergeable_state=clean）
#   2. 头提交上所有 check run 已完成且为 success/skipped/neutral（至少一个）
#   3. 关联 issue（PR 正文 Closes #N）和 PR 本身都不带「涉及资金」（只有资金类留给 Arvin 合并）
#   4. 有一条 Arvingrep 账号发的、晚于头提交的审核通过标记：<!-- review:pass agent=<名字> -->，
#      且审核 agent ≠ 实现 agent（关联 issue 上的 agent/<名字> 标签）；之后没有 <!-- review:changes 标记
# 用本机 gh 登录态（Arvingrep）合并，这样合并会照常触发 migration-status（关 issue）和 ci-gke（构建部署 canary）。
set -euo pipefail
R=Arvingrep/firebird-sea
BLOCK='涉及资金'
ok_checks='success|skipped|neutral'

for n in $(gh api "repos/$R/pulls?state=open&base=canary&per_page=100" --jq '.[]|select(.draft|not)|select(.head.repo.full_name=="'$R'")|.number'); do
  pr=$(gh api "repos/$R/pulls/$n")
  sha=$(jq -r .head.sha <<<"$pr")
  state=$(jq -r .mergeable_state <<<"$pr")
  log(){ echo "#$n: $*"; }
  [ "$state" = clean ] || { log "跳过：mergeable_state=$state"; continue; }

  if jq -r '[.labels[].name]|join(" ")' <<<"$pr" | grep -Eq "$BLOCK"; then log "跳过：PR 涉及资金"; continue; fi
  issues=$(jq -r '.body // ""' <<<"$pr" | grep -oiE '(close[sd]?|fix(e[sd])?|resolve[sd]?)[[:space:]]+#[0-9]+' | grep -oE '[0-9]+' | sort -u || true)
  [ -n "$issues" ] || { log "跳过：没有 Closes #N"; continue; }
  impl=""; blocked=""
  for i in $issues; do
    labels=$(gh api "repos/$R/issues/$i" --jq '[.labels[].name]|join(" ")')
    if grep -Eq "$BLOCK" <<<"$labels"; then blocked=1; fi
    a=$(tr ' ' '\n' <<<"$labels" | sed -n 's#^agent/##p' | head -1); [ -n "$a" ] && impl=$a
  done
  [ -z "$blocked" ] || { log "跳过：关联 issue 涉及资金，留给 Arvin"; continue; }

  checks=$(gh api "repos/$R/commits/$sha/check-runs?per_page=100" --jq '.check_runs')
  total=$(jq length <<<"$checks")
  pending=$(jq '[.[]|select(.status!="completed")]|length' <<<"$checks")
  bad=$(jq --arg ok "$ok_checks" '[.[]|select(.status=="completed" and (.conclusion|test("^(" + $ok + ")$")|not))]|length' <<<"$checks")
  [ "$total" -gt 0 ] && [ "$pending" = 0 ] && [ "$bad" = 0 ] || { log "跳过：CI 未全绿（total=$total pending=$pending bad=$bad）"; continue; }

  since=$(gh api "repos/$R/commits/$sha" --jq .commit.committer.date)
  last=$(gh api "repos/$R/issues/$n/comments?per_page=100" --jq "[.[]|select(.user.login==\"Arvingrep\" and .created_at>=\"$since\")|select(.body|test(\"<!-- review:(pass|changes)\"))]|last|.body // \"\"")
  verdict=$(grep -oE '<!-- review:(pass|changes) agent=[a-z]+' <<<"$last" | head -1 || true)
  case "$verdict" in
    "<!-- review:pass agent="*) reviewer=${verdict##*agent=} ;;
    *) log "跳过：头提交之后还没有审核通过"; continue ;;
  esac
  [ "$reviewer" != "$impl" ] || { log "跳过：审核人和实现人都是 $impl"; continue; }

  log "合并（实现=$impl 审核=$reviewer）"
  gh api -X PUT "repos/$R/pulls/$n/merge" -f merge_method=squash -f sha="$sha" --jq .message
done
