#!/bin/sh
# entrypoint-web.sh + apply-config-vars.php 行为测试，需要 php 的容器环境：
#   docker run --rm -v "$PWD:/repo:ro" php:7.4-cli-alpine sh /repo/deploy/docker/entrypoint-web.test.sh
# entrypoint 写死 /var/www/html，所以在容器里搭一个假的站点根，并以 `exec cat` 收尾观察结果。
set -u
REPO="${REPO:-/repo}"
pass=0; fail=0
ok()  { pass=$((pass+1)); echo "  ok   - $1"; }
bad() { fail=$((fail+1)); echo "  FAIL - $1"; }
has() { grep -qF -- "$2" "$3" && ok "$1" || bad "$1 (missing: $2)"; }
hasnt() { grep -qF -- "$2" "$3" && bad "$1 (unexpected: $2)" || ok "$1"; }

W=/var/www/html
reset() {
  rm -rf $W /etc/firebird-config-vars /etc/firebird-configs
  mkdir -p $W/include/config $W/data /etc/firebird-config-vars
  # CRLF，与后台 fopen("w") 写出的格式一致
  printf '<?php\r\n$custom_fencheng_foodprice = 18;\r\n$custom_fencheng_delivery = 89;\r\n$customCloseCause = '"'"'0'"'"';\r\n' > $W/include/config/waimai.inc.php
  printf '<?php\n$cfg_basehost = '"'"'x'"'"';\n' > $W/include/config/siteConfig.inc.php
  cp "$REPO/deploy/helm/firebird-site/files/apply-config-vars.php" /etc/firebird-config-vars/apply-vars.php
  chown -R www-data:www-data $W   # 与镜像 COPY --chown 一致
}
www_can_write() { su -s /bin/sh www-data -c "[ -w '$1' ]" 2>/dev/null; }
www_can_create() { su -s /bin/sh www-data -c "touch '$1/.probe' 2>/dev/null && rm -f '$1/.probe'" 2>/dev/null; }
run_entry() { sh "$REPO/deploy/docker/entrypoint-web.sh" true >/tmp/entry.log 2>&1; }

echo "# 1. 变量覆盖：存在则原位替换(保留 CRLF)、缺失则追加"
reset
cat > /etc/firebird-config-vars/vars.txt <<'EOF'
waimai.inc.php custom_fencheng_foodprice 0
waimai.inc.php custom_new_var 7
waimai.inc.php customCloseCause 'it\'s ok'
EOF
run_entry
has   "foodprice 被替换为 0"       '$custom_fencheng_foodprice = 0;' $W/include/config/waimai.inc.php
has   "未声明的 delivery 保持不变"   '$custom_fencheng_delivery = 89;' $W/include/config/waimai.inc.php
has   "缺失变量被追加"             '$custom_new_var = 7;' $W/include/config/waimai.inc.php
has   "字符串字面量原样写入"        "\$customCloseCause = 'it\\'s ok';" $W/include/config/waimai.inc.php
grep -q "$(printf '\r')" $W/include/config/waimai.inc.php && ok "CRLF 保留" || bad "CRLF 保留"
php -l $W/include/config/waimai.inc.php >/dev/null 2>&1 && ok "结果是合法 PHP" || bad "结果是合法 PHP"

echo "# 2. 幂等：再跑一次内容不变"
before=$(md5sum < $W/include/config/waimai.inc.php); run_entry; after=$(md5sum < $W/include/config/waimai.inc.php)
[ "$before" = "$after" ] && ok "幂等" || bad "幂等"

echo "# 3. 安全：路径穿越 / 非法变量名被拒绝"
reset
cat > /etc/firebird-config-vars/vars.txt <<'EOF'
../dbinfo.inc.php x 1
waimai.inc.php bad-name 1
waimai.inc.php custom_fencheng_foodprice 5
EOF
run_entry
[ ! -e $W/include/dbinfo.inc.php.x ] && ok "路径穿越被拒" || bad "路径穿越被拒"
hasnt "非法变量名被拒" 'bad-name' $W/include/config/waimai.inc.php
has   "合法行仍被施加" '$custom_fencheng_foodprice = 5;' $W/include/config/waimai.inc.php

echo "# 4. 文件以 ?> 结尾：追加在其前"
reset; printf '<?php\n$a = 1;\n?>\n' > $W/include/config/waimai.inc.php
printf 'waimai.inc.php b 2\n' > /etc/firebird-config-vars/vars.txt
run_entry
php -l $W/include/config/waimai.inc.php >/dev/null 2>&1 && ok "仍是合法 PHP" || bad "仍是合法 PHP"
tail -3 $W/include/config/waimai.inc.php | tr '\n' ' ' | grep -q '\$b = 2;.*?>' && ok "变量位于 ?> 之前" || bad "变量位于 ?> 之前"

echo "# 5. ② Redis 内存缓存：按环境变量声明式写入 dbinfo.inc.php"
reset
DB_HOST=db DB_NAME=n DB_USER=u DB_PASS=p REDIS_HOST=redis.x REDIS_PORT=6380 SITE_ID=canary \
  MEMORY_CACHE_REDIS=1 MEMORY_CACHE_REDIS_DB=3 run_entry
D=$W/include/dbinfo.inc.php
has "DB 信息仍在"          "\$DB_HOST = 'db';" $D
has "分隔线(与后台一致)"    '//--------------++++--------------' $D
has "prefix 含站点"        "\$cfg_memory['prefix'] = 'fb_canary_';" $D
has "redis server"         "\$cfg_memory['redis']['server'] = 'redis.x';" $D
has "redis port"           "\$cfg_memory['redis']['port'] = '6380';" $D
has "redis db"             "\$cfg_memory['redis']['db'] = '3';" $D
has "state=1"              "\$cfg_memory['redis']['state'] = 1;" $D
php -l $D >/dev/null 2>&1 && ok "dbinfo 是合法 PHP" || bad "dbinfo 是合法 PHP"

echo "# 6. 未开启开关时不写 cfg_memory"
reset
DB_HOST=db DB_NAME=n DB_USER=u DB_PASS=p REDIS_HOST=redis.x run_entry
hasnt "无 cfg_memory" 'cfg_memory' $W/include/dbinfo.inc.php

echo "# 7. 缺 redis 扩展时告警而不是静默"
has "WARN 输出" '缺少 redis 扩展' /tmp/entry.log

echo "# 8. GitOps 配置锁：开启后 www-data 不能写/新建配置"
reset
DB_HOST=db DB_NAME=n DB_USER=u DB_PASS=p run_entry
www_can_write $W/include/config/waimai.inc.php && ok "未开启锁：可写" || bad "未开启锁：可写"
reset
DB_HOST=db DB_NAME=n DB_USER=u DB_PASS=p CONFIG_LOCK=1 run_entry
www_can_write $W/include/config/waimai.inc.php  && bad "配置文件只读" || ok "配置文件只读"
www_can_write $W/include/config/siteConfig.inc.php && bad "siteConfig 只读" || ok "siteConfig 只读"
www_can_write $W/include/dbinfo.inc.php && bad "dbinfo 只读" || ok "dbinfo 只读"
www_can_create $W/include/config && bad "目录不可新建" || ok "目录不可新建"
has "锁定提示" '已锁定' /tmp/entry.log
echo "# 9. 锁定在 configVars / 兜底之后：值已施加再上锁；writable 例外保持可写"
reset
printf 'waimai.inc.php custom_fencheng_foodprice 0\n' > /etc/firebird-config-vars/vars.txt
DB_HOST=db DB_NAME=n DB_USER=u DB_PASS=p CONFIG_LOCK=1 CONFIG_LOCK_WRITABLE="siteConfig.inc.php" run_entry
has "锁定前已施加 configVars" '$custom_fencheng_foodprice = 0;' $W/include/config/waimai.inc.php
www_can_write $W/include/config/waimai.inc.php && bad "waimai 已锁" || ok "waimai 已锁"
www_can_write $W/include/config/siteConfig.inc.php && ok "writable 例外可写" || bad "writable 例外可写"

echo
echo "pass=$pass fail=$fail"
[ "$fail" -eq 0 ]
