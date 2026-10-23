#!/usr/bin/env bash
# BMAD Story 辅助函数（被 dev.sh source；无外部依赖，便于 scripts/test-gates.sh 自测）。
# story_key <标题> <正文>   从标题 [story:<key>] 取 Story key，退而取正文 <!-- bmad-story: KEY -->；都没有则空
story_key() {
  local re_t='\[story:([^]]+)\]' re_b='<!-- bmad-story: ([^[:space:]]+) -->'
  if [[ "$1" =~ $re_t ]]; then printf '%s' "${BASH_REMATCH[1]}"
  elif [[ "$2" =~ $re_b ]]; then printf '%s' "${BASH_REMATCH[1]}"; fi
}
# story_id <key|N.M|N-M|T?N-M>    → N-M / T?N-M（取前两段数字，保留可选 T 前缀并归一大写）；解析不了则空
# 不用 sed：`^[^0-9Tt]*([Tt]?)…` 会把「数字前出现过 t/T」的串整条判为不匹配（[story:T1-1]、Story 1.1、task 1-1 全都解析不出），
# 而 `^[^0-9]*([Tt]?)…` 又会被左最长匹配把前缀 T 吞进垃圾前缀。改成「截到第一个数字，再看紧邻字符是不是 T」。
story_id() {
  local s="$1" head p=""
  head="${s%%[0-9]*}"    # 第一个数字之前的全部内容
  s="${s#"$head"}"       # 从第一个数字开始（head 为空时即为原串）
  # 判据：'T' 只有在「不是一个英文单词的内部字母」时才算 T 前缀。
  # [Tt]) 覆盖开头即 T（T1-1 / t1-1）；*[!a-zA-Z][Tt]) 覆盖中文等非 ASCII 前导（故事T1-1）。
  # 故意不匹配 next2-3 / test1-2 / xT1-1 这类词内字母——它们不是 Story 编号。
  case "$head" in [Tt]) p="T" ;; *[!a-zA-Z][Tt]) p="T" ;; esac
  if [[ "$s" =~ ^([0-9]+)[.-]([0-9]+) ]]; then printf '%s%s-%s' "$p" "${BASH_REMATCH[1]}" "${BASH_REMATCH[2]}"; fi
  return 0               # 解析不了也必须返回 0：调用方在 set -e 下用 $(story_id ...)
}
# story_spec <git-ref> <N-M>  输出 ref 上该 Story 的规格文件路径（_bmad-output/implementation-artifacts/spec-N-M-*.md），无则空
story_spec() {
  git -c core.quotepath=off ls-tree --name-only "$1" _bmad-output/implementation-artifacts/ 2>/dev/null \
    | grep -E "/spec-${2}-[^/]*\.md$" | head -n1 || true   # 无规格文件不是错误（调用方在 set -e 下）
}
