#!/bin/sh
# ==============================================================================
# init-webroot：Pod 启动时播种 / 同步运行期状态。由 ConfigMap 注入，与镜像版本解耦
# （新 chart + 旧镜像也能工作，不会出现"脚本在镜像里却还没发布"的耦合）。
#
# 环境变量（Helm 注入，默认值仅用于本地测试）:
#   MODE        copy | baked      webroot 供给方式（见 deployment.yaml 头部）
#   IMAGE_ROOT  /var/www/html     镜像里的站点根
#   SHARED      /shared           emptyDir（copy: 整站；baked: 仅 data/）
#   CONFIG_PVC  /config-pvc       配置 PVC（未启用 persistence 时目录不存在，整段跳过）
#   UPLOADS_PVC /uploads-pvc      附件 PVC（未启用时目录不存在）
# ==============================================================================
set -u

MODE="${MODE:-copy}"
IMAGE_ROOT="${IMAGE_ROOT:-/var/www/html}"
SHARED="${SHARED:-/shared}"
CONFIG_PVC="${CONFIG_PVC:-/config-pvc}"
UPLOADS_PVC="${UPLOADS_PVC:-/uploads-pvc}"

log() { echo ">>> [init] $*"; }

# ---- 1. webroot / data 播种 ---------------------------------------------------
if [ "$MODE" = "baked" ]; then
  # 代码来自镜像，只播种 data/（缓存目录），不再整站复制
  [ -d "$IMAGE_ROOT/data" ] && cp -a "$IMAGE_ROOT/data/." "$SHARED/" 2>/dev/null
  mkdir -p "$SHARED/cache"
  chmod -R 777 "$SHARED" 2>/dev/null
else
  cp -a "$IMAGE_ROOT/." "$SHARED/" && chmod -R 777 "$SHARED/data" 2>/dev/null
fi

# ---- 2. 配置 PVC 三方同步 -------------------------------------------------------
# 目标：镜像新增/修改的出厂配置能进入 PVC，同时绝不覆盖管理员在后台改过的内容。
#
# 基线文件 $CONFIG_PVC/.image-baseline 记录"上次同步时镜像出厂版本的指纹"。对镜像里每个配置文件 F：
#   PVC 无 F                         → 复制，记录基线
#   PVC 的 F 与镜像一致               → 仅更新基线
#   PVC 的 F == 基线（管理员没动过）   → 镜像有更新 → 覆盖，记录新基线
#   其它（管理员改过 / 旧 PVC 无基线）  → 保留 PVC 版本；镜像版本另存 F.image-new 供人工合并
# 指纹忽略由 entrypoint 按环境变量注入的几行（basehost / OBS 密钥 / 邮件密码），否则 siteConfig 永远"被改过"。
norm() {
  grep -v -E '^\$cfg_(basehost|OBSKeyID|OBSKeySecret|mailPass) = ' "$1" 2>/dev/null | sha256sum | cut -d' ' -f1
}

sync_config() {
  src="$IMAGE_ROOT/include/config"
  dst="$CONFIG_PVC"
  [ -d "$dst" ] || return 0
  [ -d "$src" ] || return 0

  base="$dst/.image-baseline"
  new="$dst/.image-baseline.new"
  : > "$new"

  for f in "$src"/*; do
    [ -f "$f" ] || continue
    n=$(basename "$f")
    img=$(norm "$f")
    rec=$(awk -v n="$n" '$2==n {print $1}' "$base" 2>/dev/null)

    if [ ! -f "$dst/$n" ]; then
      cp -a "$f" "$dst/$n"
      log "config add: $n"
      echo "$img $n" >> "$new"
      continue
    fi

    cur=$(norm "$dst/$n")
    if [ "$cur" = "$img" ]; then
      echo "$img $n" >> "$new"
    elif [ -n "$rec" ] && [ "$rec" != "-" ] && [ "$cur" = "$rec" ]; then
      cp -af "$f" "$dst/$n"
      log "config update: $n (后台未改动，跟随镜像)"
      echo "$img $n" >> "$new"
    else
      # 保留 PVC 版本。基线保持旧值（或 "-"），使该提示在人工合并前持续出现
      if [ "$rec" != "$img" ]; then
        cp -af "$f" "$dst/$n.image-new"
        log "config WARN: $n 已被后台修改，镜像出厂版本另存为 $n.image-new，请人工合并"
      fi
      echo "${rec:--} $n" >> "$new"
    fi
  done
  mv -f "$new" "$base"

  # 仓库以 .example 提供、被 gitignore 的真实配置（如 waimai.inc.php）：缺失则由 example 生成。
  # 缺失会让对应模块 require Fatal → 首页 500（2026-10-10 实际故障）
  for ex in "$dst"/*.inc.php.example; do
    [ -f "$ex" ] || continue
    real="${ex%.example}"
    if [ ! -f "$real" ]; then
      cp -a "$ex" "$real"
      log "config generate: ${real##*/} (from .example)"
    fi
  done

  # copy 模式下 php-fpm 看到的是 emptyDir 里的整站，需要把 PVC 配置覆盖进去；
  # baked 模式 PVC 直接挂在 include/config，无需处理
  if [ "$MODE" != "baked" ]; then
    cp -af "$dst"/*.inc.php "$SHARED/include/config/" 2>/dev/null
  fi
  chmod -R 777 "$dst" 2>/dev/null
}

sync_config

# ---- 3. 附件 PVC 权限 (AD-17) ---------------------------------------------------
if [ -d "$UPLOADS_PVC" ]; then
  chown -R www-data:www-data "$UPLOADS_PVC" 2>/dev/null || chmod -R 777 "$UPLOADS_PVC" 2>/dev/null
fi

exit 0
