#!/usr/bin/env bash
# BMAD Story 辅助函数（被 dev.sh source；无外部依赖，便于 scripts/test-gates.sh 自测）。
# story_key <标题> <正文>   从标题 [story:<key>] 取 Story key，退而取正文 <!-- bmad-story: KEY -->；都没有则空
story_key() {
  local re_t='\[story:([^]]+)\]' re_b='<!-- bmad-story: ([^[:space:]]+) -->'
  if [[ "$1" =~ $re_t ]]; then printf '%s' "${BASH_REMATCH[1]}"
  elif [[ "$2" =~ $re_b ]]; then printf '%s' "${BASH_REMATCH[1]}"; fi
}
# story_id <key|N.M|N-M>    → N-M（取前两段数字）；解析不了则空
story_id() { sed -nE 's/^[^0-9]*([0-9]+)[.-]([0-9]+).*/\1-\2/p' <<<"$1" | head -n1; }
# story_spec <git-ref> <N-M>  输出 ref 上该 Story 的规格文件路径（_bmad-output/implementation-artifacts/spec-N-M-*.md），无则空
story_spec() {
  git -c core.quotepath=off ls-tree --name-only "$1" _bmad-output/implementation-artifacts/ 2>/dev/null \
    | grep -E "/spec-${2}-[^/]*\.md$" | head -n1 || true   # 无规格文件不是错误（调用方在 set -e 下）
}
