#!/usr/bin/env bash
# 全站模块路径验收：对给定主机逐个请求模块入口并输出状态码矩阵。
# 用法: scripts/module-route-probe.sh canary.fbird.men [demo.fbird.men ...]
# 退出码: 存在 404/5xx 或指向 /404.html 的跳转时为 1。
set -u
PATHS=(/ /u /b /supplier /supplier/job /member /business /info /house /job /car /special /waimai /quanjing
       /shop /news /zhaopin /baokan /jianzhan /fenlei /zhuang)
[ $# -ge 1 ] || { echo "usage: $0 host [host...]" >&2; exit 2; }
bad=0
for host in "$@"; do
  echo "== $host"
  for p in "${PATHS[@]}"; do
    out=$(curl -s -o /dev/null -m 15 -w '%{http_code} %{redirect_url}' "https://$host$p")
    code=${out%% *}
    note=""
    case "$code" in 404|5??) note="FAIL";; esac
    case "$out" in *"/404.html"*) note="FAIL";; esac
    [ -n "$note" ] && bad=1
    printf '%-14s %s %s\n' "$p" "$out" "$note"
  done
done
exit $bad
