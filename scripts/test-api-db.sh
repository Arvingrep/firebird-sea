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

# 等就绪：必须用**真实认证**探测，不能用 mysqladmin ping。
#
# 为什么：mysqld 首次初始化时会先起一个临时的 skip-networking 实例（root 尚无密码），
# 此时 `mysqladmin ping` 会返回成功 —— 它只判断 server 是否存活，**不看认证结果**。
# 于是脚本在初始化还没结束时就往下跑，紧接着的连接被拒：
#   ERROR 1045 (28000): Access denied for user 'root'@'localhost' (using password: YES)
# 这是「探测条件比被测条件弱」的典型症状，且只在刚好撞上初始化窗口时复现（偶发假阳性），
# 比稳定失败更危险：本地过、CI 挂，看起来像环境抖动。
#
# 探针改成一条 SELECT，同时验证三件事：server 起来了 / 密码对 / MYSQL_DATABASE 已创建。
if [ "${DB_TEST_DEBUG:-0}" = "1" ]; then echo "  [debug] root pass=$DB_ROOT_PASS db=$DB_NAME"; fi
probe() {
  docker exec "$CONTAINER" mysql -uroot -p"$DB_ROOT_PASS" -N -e \
    "SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name='$DB_NAME';" 2>/dev/null | grep -qx 1
}
READY=0
for _ in $(seq 1 60); do
  if probe; then READY=1; break; fi
  sleep 2
done
if [ "$READY" -ne 1 ]; then
  echo "❌ MySQL 120s 内未就绪（探针：root 认证 + 目标库存在），末尾日志："
  docker logs --tail 20 "$CONTAINER" 2>&1
  exit 1
fi
echo "  ✅ MySQL 就绪（root 认证通过，库 $DB_NAME 已创建）"

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
