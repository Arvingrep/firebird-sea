#!/usr/bin/env bash
# 本地验收的冒烟检查。由 local-accept.sh 调用（需要其导出的 WORK/PORT/API_PORT/PROJECT/ROOT）。
set -uo pipefail
FAIL=0
ok()  { echo "  ✅ $1"; }
bad() { echo "  ❌ $1"; FAIL=1; }
dc()  { docker compose -p "$PROJECT" -f "$WORK/compose.yml" "$@"; }
code() { curl -s -o /dev/null -m 20 -w '%{http_code}' -H "Host: ${HOSTNAME_CHECK:-localhost}" "http://127.0.0.1:$PORT$1"; }
has_tree() { [ -d "$WORK/ctx/webroot/$1" ]; }

# 1. 镜像里的关键文件必须和 git 提交一致（防止镜像不是从 git 构建、文件新旧混杂）
for f in include/loop.php include/common.inc.php index.php; do
  want="$(git -C "$ROOT" show "HEAD:webroot/$f" | md5sum | cut -d' ' -f1)"
  got="$(dc exec -T php sh -c "md5sum /var/www/html/$f" | cut -d' ' -f1)"
  [ "$want" = "$got" ] && ok "镜像文件与 git 一致: $f" || bad "镜像文件与 git 不一致: $f"
done

# 2. 模板标签注册的函数必须真实存在（今天 canary 500 的根因类型：注册了但函数缺失）
MISSING="$(dc exec -T php php -r '
  $src = file_get_contents("/var/www/html/include/common.inc.php");
  preg_match_all("/registerPlugin\(\s*\"[a-z]+\"\s*,\s*[\x27\"][A-Za-z_]+[\x27\"]\s*,\s*[\x27\"]([A-Za-z_]+)[\x27\"]/", $src, $m);
  $all = "";
  foreach (["include/loop.php","include/common.func.php"] as $f) $all .= file_get_contents("/var/www/html/".$f);
  foreach (array_unique($m[1]) as $fn) if (!preg_match("/function\s+".$fn."\s*\(/", $all)) echo $fn." ";
' 2>/dev/null)"
[ -z "$MISSING" ] && ok "模板插件注册的函数都有定义" || bad "模板插件缺少函数定义: $MISSING"

# 3. 页面渲染不得 5xx
for path in / /index.php /include/ajax.php?service=siteConfig\&action=siteConfig; do
  c="$(code "$path")"; case "$c" in 5??|000) bad "页面 $path 返回 $c";; *) ok "页面 $path 返回 $c";; esac
done
if has_tree templates/waimai; then
  c="$(code /waimai/)"; case "$c" in 5??|000) bad "外卖首页 /waimai/ 返回 $c";; *) ok "外卖首页 /waimai/ 返回 $c";; esac
  c="$(code /wmsj/login.php)"; case "$c" in 5??|000) bad "商家后台 /wmsj/login.php 返回 $c";; *) ok "商家后台 /wmsj/login.php 返回 $c";; esac
fi

# 4. 路由：PHP 回调路径不能被 Node 拦截
body="$(curl -s -m 20 -H "Host: localhost" "http://127.0.0.1:$PORT/api/payment/notify.php?code=none")"
echo "$body" | grep -qiE "Cannot (GET|POST)|\"success\"" && bad "/api/payment/notify.php 被 Node 拦截" || ok "/api/payment/notify.php 由 PHP 处理"

# 5. Node API 健康
c="$(curl -s -o /dev/null -m 10 -w '%{http_code}' "http://127.0.0.1:$API_PORT/health")"; [ "$c" = 200 ] && ok "api /health 返回 200" || bad "api /health 返回 $c"

# 6. 日志里不得有致命错误
if dc logs php 2>&1 | grep -qiE "PHP Fatal|Uncaught"; then bad "php 日志里有致命错误"; else ok "php 日志无致命错误"; fi
exit "$FAIL"
