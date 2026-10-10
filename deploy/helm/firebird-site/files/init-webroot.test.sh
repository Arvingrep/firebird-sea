#!/bin/sh
# init-webroot.sh 行为测试：在 alpine（与 php:*-alpine 同为 busybox 工具链）里执行。
#   docker run --rm -v "$PWD/deploy/helm/firebird-site/files:/f:ro" alpine:3.20 sh /f/init-webroot.test.sh
set -u
SCRIPT="$(dirname "$0")/init-webroot.sh"
T=$(mktemp -d)
pass=0; fail=0
ok()   { pass=$((pass+1)); echo "  ok   - $1"; }
bad()  { fail=$((fail+1)); echo "  FAIL - $1"; }
eq()   { [ "$2" = "$3" ] && ok "$1" || bad "$1 (got '$2', want '$3')"; }
run()  { MODE="${MODE:-baked}" IMAGE_ROOT="$T/image" SHARED="$T/shared" CONFIG_PVC="$T/pvc" UPLOADS_PVC="$T/none" sh "$SCRIPT" >"$T/out.log" 2>&1; }

reset() {
  rm -rf "$T/image" "$T/shared" "$T/pvc" "$T/out.log"
  mkdir -p "$T/image/include/config" "$T/image/data" "$T/shared" "$T/pvc"
  echo "seed" > "$T/image/data/keep.txt"
  printf '<?php\n$a = 1;\n$cfg_basehost = '"'"'x.example'"'"';\n' > "$T/image/include/config/siteConfig.inc.php"
  printf '<?php\n$w = 1;\n' > "$T/image/include/config/waimai.inc.php.example"
  printf '<?php\n$m = 1;\n' > "$T/image/include/config/member.inc.php"
}

echo "# 1. 首次播种：补齐全部出厂文件，由 .example 生成真实配置"
reset; run
eq "member.inc.php 已播种"        "$(cat "$T/pvc/member.inc.php" | tail -1)" '$m = 1;'
[ -f "$T/pvc/waimai.inc.php.example" ] && ok ".example 已补齐" || bad ".example 已补齐"
[ -f "$T/pvc/waimai.inc.php" ]         && ok "waimai.inc.php 由 example 生成" || bad "waimai.inc.php 由 example 生成"
[ -f "$T/shared/keep.txt" ]            && ok "baked: data 已播种到 shared" || bad "baked: data 已播种到 shared"
[ -d "$T/shared/cache" ]               && ok "baked: cache 目录已创建" || bad "baked: cache 目录已创建"

echo "# 2. 幂等：再跑一次不产生变化，也没有 .image-new"
run
ls "$T/pvc" | grep -q 'image-new' && bad "无 .image-new" || ok "无 .image-new"

echo "# 3. 镜像更新了未被后台修改的文件 → 自动跟随"
printf '<?php\n$m = 2;\n' > "$T/image/include/config/member.inc.php"
run
eq "member.inc.php 跟随镜像" "$(tail -1 "$T/pvc/member.inc.php")" '$m = 2;'

echo "# 4. 后台改过的文件 → 保留，镜像版本另存 .image-new"
echo '$admin_edit = 1;' >> "$T/pvc/member.inc.php"
printf '<?php\n$m = 3;\n' > "$T/image/include/config/member.inc.php"
run
grep -q 'admin_edit' "$T/pvc/member.inc.php" && ok "后台修改被保留" || bad "后台修改被保留"
eq "镜像新版另存"  "$(tail -1 "$T/pvc/member.inc.php.image-new")" '$m = 3;'
grep -q 'WARN: member.inc.php' "$T/out.log" && ok "输出 WARN" || bad "输出 WARN"

echo "# 5. entrypoint 注入的行不算'被修改'：siteConfig 仍跟随镜像"
reset; run
sed -i "s/\\\$cfg_basehost = .*/\$cfg_basehost = 'canary.fbird.men';/" "$T/pvc/siteConfig.inc.php"
printf '<?php\n$a = 2;\n$cfg_basehost = '"'"'x.example'"'"';\n' > "$T/image/include/config/siteConfig.inc.php"
run
grep -q '\$a = 2;' "$T/pvc/siteConfig.inc.php" && ok "siteConfig 跟随镜像" || bad "siteConfig 跟随镜像"

echo "# 6. 旧 PVC（无基线）：与镜像不同 → 保守保留，不覆盖"
reset; run
rm -f "$T/pvc/.image-baseline"
echo '$legacy = 1;' >> "$T/pvc/member.inc.php"
run
grep -q 'legacy' "$T/pvc/member.inc.php" && ok "旧 PVC 的差异文件被保留" || bad "旧 PVC 的差异文件被保留"
[ -f "$T/pvc/member.inc.php.image-new" ] && ok "镜像版本另存" || bad "镜像版本另存"

echo "# 7. 镜像新增文件 → 补进已有 PVC"
reset; run
printf '<?php\n$n = 1;\n' > "$T/image/include/config/newmod.inc.php"
run
[ -f "$T/pvc/newmod.inc.php" ] && ok "新增文件已补入" || bad "新增文件已补入"

echo "# 8. copy 模式：整站复制 + PVC 配置覆盖进 shared"
reset; MODE=copy run
[ -f "$T/shared/data/keep.txt" ] && ok "copy: 整站已复制" || bad "copy: 整站已复制"
echo '$c = 9;' >> "$T/pvc/member.inc.php"
MODE=copy run
grep -q '\$c = 9;' "$T/shared/include/config/member.inc.php" && ok "copy: PVC 配置覆盖进 shared" || bad "copy: PVC 配置覆盖进 shared"

echo "# 9. 无配置 PVC（persistence 关闭）：整段跳过，不报错"
reset; rm -rf "$T/pvc"; run && ok "退出码 0" || bad "退出码 0"

echo
echo "pass=$pass fail=$fail"
rm -rf "$T"
[ "$fail" -eq 0 ]
