#!/usr/bin/env bash
# 数据库集成测试：在临时 MySQL 容器里真跑一遍 services/api/migrations/*.sql
#
# 为什么要有这个脚本
# ------------------
# verify-task.sh 第 7 项一直写着「数据库集成测试：CI 里必跑」，但判断条件是
# `[ -f scripts/test-api-db.sh ]` —— 而这个文件根本不存在，整段被静默跳过。
# 于是 CI 的 job 名写着「含数据库集成测试」，实际一次都没跑过。这是典型的假绿：
# 报告是绿的，看的人以为覆盖了，schema 漂移永远发现不了。
#
# 这个脚本把那条断言变成真的：起一个一次性 MySQL，按序号执行全部 migration，
# 断言关键表存在，再跑第二遍验证幂等性（migration 全用 IF NOT EXISTS，可重复执行）。
#
# 用法：bash scripts/test-api-db.sh
# 依赖：docker（本地 OrbStack / CI ubuntu-latest 均自带）
#       docker 不可用时**明确 FAIL**，不静默跳过 —— 跳过就是假绿。
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MIG_DIR="$ROOT/services/api/migrations"
CONTAINER="firebird-dbtest-$$"
IMAGE="${DB_TEST_IMAGE:-mysql:8.0}"
DB_ROOT_PASS="dbtest-root-$$"
DB_NAME="firebird_test"

# 非交互 runner 的 PATH 可能不含 docker（self-hosted mac 常见）
export PATH="$HOME/.orbstack/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:$PATH"

if ! command -v docker >/dev/null 2>&1; then
  echo "❌ 数据库集成测试需要 docker，但 PATH 里没有"
  exit 1
fi
if ! docker info >/dev/null 2>&1; then
  echo "❌ docker 守护进程不可用（容器引擎未启动？）"
  exit 1
fi
if [ ! -d "$MIG_DIR" ]; then
  echo "❌ 找不到 migration 目录: $MIG_DIR"
  exit 1
fi

MIGS=$(ls "$MIG_DIR"/*.sql 2>/dev/null | sort)
if [ -z "$MIGS" ]; then
  echo "❌ migration 目录为空"; exit 1
fi

cleanup() { docker rm -f "$CONTAINER" >/dev/null 2>&1 || true; }
trap cleanup EXIT INT TERM

echo "🐳 启动临时 MySQL（${IMAGE}）..."
docker run -d --name "$CONTAINER" \
  -e "MYSQL_ROOT_PASSWORD=$DB_ROOT_PASS" \
  -e "MYSQL_DATABASE=$DB_NAME" \
  "$IMAGE" >/dev/null || { echo "❌ 容器启动失败"; exit 1; }

# 等就绪：mysqladmin ping 比固定 sleep 可靠
READY=0
for _ in $(seq 1 60); do
  if docker exec "$CONTAINER" mysqladmin ping -uroot -p"$DB_ROOT_PASS" --silent >/dev/null 2>&1; then
    READY=1; break
  fi
  sleep 2
done
if [ "$READY" -ne 1 ]; then
  echo "❌ MySQL 60s 内未就绪，末尾日志："
  docker logs --tail 20 "$CONTAINER" 2>&1
  exit 1
fi
echo "  ✅ MySQL 就绪"

sql() { docker exec -i "$CONTAINER" mysql -uroot -p"$DB_ROOT_PASS" "$DB_NAME" "$@"; }

# 第一轮：按序执行全部 migration
echo "▶ 执行 migration（第 1 轮）"
for f in $MIGS; do
  name=$(basename "$f")
  if ! OUT=$(sql < "$f" 2>&1); then
    echo "❌ $name 执行失败："
    printf '%s\n' "$OUT" | tail -10
    exit 1
  fi
  echo "  ✅ $name"
done

# 幂等性：同样的文件再跑一遍必须依然成功（全部 IF NOT EXISTS）
echo "▶ 重复执行（第 2 轮，验证幂等）"
for f in $MIGS; do
  name=$(basename "$f")
  if ! OUT=$(sql < "$f" 2>&1); then
    echo "❌ $name 第二轮执行失败（migration 不幂等）："
    printf '%s\n' "$OUT" | tail -10
    exit 1
  fi
done
echo "  ✅ 全部 migration 可重复执行"

# 断言：migration 里 CREATE TABLE 的表名必须真的存在
echo "▶ 校验建表结果"
EXPECTED=$(grep -ohiE 'CREATE TABLE (IF NOT EXISTS )?`?[a-zA-Z0-9_]+`?' "$MIG_DIR"/*.sql \
  | sed -E 's/[`;]//g' | awk '{print $NF}' | sort -u)
if [ -z "$EXPECTED" ]; then
  echo "⚠️ migration 里没有检测到 CREATE TABLE（只做了 ALTER/INSERT？）"
else
  MISSING=""
  for t in $EXPECTED; do
    n=$(sql -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$DB_NAME' AND table_name='$t';" 2>/dev/null)
    [ "${n:-0}" = "1" ] || MISSING+="$t "
  done
  if [ -n "$MISSING" ]; then
    echo "❌ 以下表未创建：$MISSING"; exit 1
  fi
  echo "  ✅ $(echo "$EXPECTED" | wc -l | tr -d ' ') 张表全部就位"
fi

echo "✅ 数据库集成测试通过"
