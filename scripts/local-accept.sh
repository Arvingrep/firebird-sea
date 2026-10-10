#!/usr/bin/env bash
# 与 GKE 同构的本地验收：从 git 提交构建和线上相同的镜像，用 Helm 渲染的同一份 nginx 配置，
# 起 php-fpm + nginx(同一网络命名空间，与 Pod 一致) + api + MariaDB + Redis，再跑冒烟检查。
# 用法: make local-accept            环境: SITE(默认 manila) ACCEPT_PORT(18081) ACCEPT_API_PORT(13001) KEEP=1 保留环境
# 只验收「已提交」的内容：未提交的改动不会进入镜像（这正是要和线上一致）。
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"; cd "$ROOT"
SITE="${SITE:-manila}"; PORT="${ACCEPT_PORT:-18081}"; API_PORT="${ACCEPT_API_PORT:-13001}"
SHA="$(git rev-parse --short HEAD)"; PROJECT="fbs-accept"
WORK="$(mktemp -d)"; export WORK PORT API_PORT SITE SHA PROJECT ROOT
PW="accept$$"
dc() { docker compose -p "$PROJECT" -f "$WORK/compose.yml" "$@"; }
teardown() { [ "${KEEP:-0}" = 1 ] && { echo "KEEP=1：保留环境，工作目录 $WORK"; return; }; dc down -v --remove-orphans >/dev/null 2>&1; rm -rf "$WORK"; }
trap teardown EXIT
command -v docker >/dev/null && command -v helm >/dev/null || { echo "需要 docker 和 helm"; exit 2; }

echo "== 1/5 导出 git 提交 ${SHA}（只含已提交内容）"
if [ -n "$(git status --porcelain webroot license deploy 2>/dev/null | head -1)" ]; then
  echo "  ⚠️  webroot/license/deploy 有未提交改动：它们不会参与验收，线上构建同样不会包含它们"
fi
mkdir -p "$WORK/ctx"
git archive HEAD webroot license deploy services/api scripts/init-firebird-db.php | tar -x -C "$WORK/ctx" || { echo "导出失败"; exit 2; }
# huoniao.so 是商业加载器，被 .gitignore 排除，不在 git 里；线上镜像由构建机上的这份文件提供。
# 本地验收从主工作区（或 HUONIAO_SO 指定的路径）取同一份，找不到就明确报错，而不是悄悄构建出一个跑不起来的镜像。
MAIN_ROOT="$(cd "$(git rev-parse --git-common-dir)/.." && pwd)"
SO="${HUONIAO_SO:-$MAIN_ROOT/webroot/huoniao.so}"
[ -f "$SO" ] || { echo "❌ 找不到 huoniao.so（$SO）。它不在 git 里，请用 HUONIAO_SO 指定路径"; exit 2; }
cp "$SO" "$WORK/ctx/webroot/huoniao.so"
echo "  huoniao.so: $(md5sum "$WORK/ctx/webroot/huoniao.so" 2>/dev/null | cut -d' ' -f1 || md5 -q "$WORK/ctx/webroot/huoniao.so")"

echo "== 2/5 用 Helm 渲染 $SITE 站点的 nginx 配置（与线上同源）"
helm template t deploy/helm/firebird-site -f "deploy/helm/firebird-site/values-$SITE.yaml" 2>/dev/null \
  | awk '/^  default.conf: \|/{f=1;next} f&&(/^    /||/^$/){sub(/^    /,"");print;next} f{exit}' > "$WORK/nginx.conf"
[ -s "$WORK/nginx.conf" ] || { echo "无法从 Helm 渲染出 nginx 配置"; exit 2; }

echo "== 3/5 构建镜像（首次较慢，之后走缓存）"
docker build -q -f deploy/docker/Dockerfile.web -t "fbs-accept-php:${SHA}" "$WORK/ctx" >/dev/null || { echo "❌ web 镜像构建失败"; exit 1; }
printf 'FROM fbs-accept-php:%s AS w\nFROM nginx:alpine\nCOPY --from=w /var/www/html /var/www/html\n' "${SHA}" > "$WORK/Dockerfile.nginx"
docker build -q -f "$WORK/Dockerfile.nginx" -t "fbs-accept-nginx:${SHA}" "$WORK" >/dev/null || { echo "❌ nginx 镜像构建失败"; exit 1; }
docker build -q -f deploy/docker/Dockerfile.api -t "fbs-accept-api:${SHA}" "$WORK/ctx" >/dev/null || { echo "❌ api 镜像构建失败"; exit 1; }

echo "== 4/5 启动环境并初始化数据库"
cat > "$WORK/compose.yml" <<Y
services:
  db:
    image: mariadb:10.5
    environment: { MARIADB_ROOT_PASSWORD: "$PW", MARIADB_DATABASE: fbs, MARIADB_USER: fbs, MARIADB_PASSWORD: "$PW" }
    tmpfs: [/var/lib/mysql]
  redis:
    image: redis:7-alpine
  php:
    image: fbs-accept-php:${SHA}
    environment: { DB_HOST: db, DB_NAME: fbs, DB_USER: fbs, DB_PASS: "$PW", REDIS_HOST: redis, SITE_ID: "$SITE", DEFAULT_CURRENCY: PHP, SITE_BASEHOST: "\${SITE_BASEHOST:-localhost}" }
    ports: ["127.0.0.1:$PORT:80"]
    depends_on: [db, redis]
  nginx:
    image: fbs-accept-nginx:${SHA}
    network_mode: "service:php"
    volumes: ["$WORK/nginx.conf:/etc/nginx/conf.d/default.conf:ro"]
    depends_on: [php]
  api:
    image: fbs-accept-api:${SHA}
    environment: { NODE_ENV: production, PORT: "3000" }
    ports: ["127.0.0.1:$API_PORT:3000"]
Y
dc up -d >/dev/null 2>&1 || { echo "❌ 环境启动失败"; dc logs --tail=20 2>&1 | tail -20; exit 1; }
READY=0; for _ in $(seq 1 90); do dc exec -T db mysql -ufbs -p"$PW" -e "SELECT 1" fbs >/dev/null 2>&1 && { READY=1; break; }; sleep 1; done
[ "$READY" = 1 ] || { echo "❌ 数据库未就绪"; exit 1; }
dc exec -T php sh -c 'mkdir -p /tmp/install' && docker cp "$WORK/ctx/webroot/install/." "$(dc ps -q php):/tmp/install/" && docker cp "$WORK/ctx/scripts/init-firebird-db.php" "$(dc ps -q php):/tmp/init-firebird-db.php"
dc exec -T -e DB_HOST=db -e DB_NAME=fbs -e DB_USER=fbs -e DB_PASS="$PW" php php /tmp/init-firebird-db.php > "$WORK/dbinit.log" 2>&1 || { echo "❌ 数据库初始化失败，日志末尾:"; tail -5 "$WORK/dbinit.log"; exit 1; }
sleep 2

echo "== 5/5 冒烟检查"
bash "$ROOT/scripts/local-accept-checks.sh"
RC=$?
[ "$RC" = 0 ] && echo "✅ 本地验收通过（提交 ${SHA}）" || echo "❌ 本地验收失败（提交 ${SHA}）。KEEP=1 可保留环境排查"
exit "$RC"
