#!/usr/bin/env bash
# story: 1-7 计划任务 CronJob（AD-18）—— 测试先行验收用例，由人先写、Agent 只让它变绿（该文件对 Agent 受保护）
# 覆盖 AC1（每分钟在 PHP 镜像执行 php include/cron.php、环境与 PHP 容器一致）与 AC3（不并发重叠）。
# AC2「30 分钟未支付订单→state 6」是运行态验收，渲染测试覆盖不到，见 docs/internal/TEST_FIRST.md「运行态 AC」。
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."
command -v helm >/dev/null || { echo "缺 helm"; exit 77; }
CHART=deploy/helm/firebird-site; FAILS=0
bad() { echo "  ❌ [$site] $*"; FAILS=$((FAILS+1)); }
for vf in "$CHART"/values-*.yaml; do
  T="$(mktemp -d)"; site="$(basename "$vf" .yaml)"; site="${site#values-}"
  helm template t "$CHART" -f "$vf" 2>/dev/null | awk -v d="$T" 'BEGIN{n=0} /^---[[:space:]]*$/{n++;next} {print > (d "/doc" n ".yaml")}'
  cron=""; dep=""
  for f in "$T"/doc*.yaml; do   # 站点名取自渲染结果（values-cebu 未设 siteId 时会继承 demo）
    [ -f "$f" ] || continue
    grep -q '^kind: Deployment' "$f" && grep -q 'name: php-fpm' "$f" && dep="$f" && site="$(sed -nE 's/^  name: firebird-(.+)$/\1/p' "$f" | head -n1)"
  done
  for f in "$T"/doc*.yaml; do
    [ -f "$f" ] && grep -q '^kind: CronJob' "$f" && grep -q "^  name: fbs-cron-${site}\$" "$f" && cron="$f"
  done
  if [ -z "$cron" ]; then bad "未渲染出 CronJob fbs-cron-${site}"; rm -rf "$T"; continue; fi
  grep -Eq '^  schedule: "?\* \* \* \* \*"?[[:space:]]*$' "$cron" || bad "schedule 不是每分钟（* * * * *）"
  grep -Eq '^  concurrencyPolicy: Forbid[[:space:]]*$' "$cron" || bad "concurrencyPolicy 不是 Forbid（会并发重叠）"
  grep -Eq 'restartPolicy: (OnFailure|Never)' "$cron" || bad "缺少 restartPolicy: OnFailure|Never"
  { grep -q 'include/cron\.php' "$cron" && grep -Eq '(^|[^A-Za-z-])php([^A-Za-z-]|$)' "$cron"; } || bad "未执行 php include/cron.php"
  want="$(awk '/- name: php-fpm/{f=1} f&&/image:/{print $2; exit}' "$dep")"
  got="$(awk '/image:/{print $2; exit}' "$cron")"
  [ -n "$want" ] && [ "$want" = "$got" ] || bad "镜像与 php-fpm 容器不一致（期望 ${want:-?}，实际 ${got:-?}）"
  for n in $(awk '/- name: php-fpm/{f=1;next} /- name: nginx/{f=0} f&&/^ +- name: [A-Z][A-Z_]*$/{print $3}' "$dep"); do
    grep -Eq "name: ${n}\$" "$cron" || bad "缺少与 PHP 容器一致的环境变量 ${n}"
  done
  rm -rf "$T"
done
[ "$FAILS" = 0 ] && echo "✅ Story 1.7 验收用例全部通过" || echo "❌ Story 1.7 验收用例：${FAILS} 项未满足"
[ "$FAILS" = 0 ]
