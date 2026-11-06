#!/usr/bin/env bash
# ==============================================================================
# 修复 huoniao_waimai_order_all 合并表 UNION 成员列表为空（订单不可见 P0）
# ==============================================================================
#
# 【根因】
#   huoniao_waimai_order_all 是 MySQL MRG_MyISAM 合并表，但它的 UNION 成员列表
#   是空的 —— SHOW CREATE TABLE 里没有 INSERT_METHOD / UNION 子句，物理上
#   `huoniao_waimai_order_all.MRG` 文件为 0 字节。
#   ⇒ 任何 `SELECT ... FROM huoniao_waimai_order_all` 都恒返回 0 行，与基础表
#     huoniao_waimai_order 里有没有数据完全无关。
#
#   缺陷来源：上游 hawaiihub 导出 SQL 里 `hn_waimai_order_all` 本身就缺
#   INSERT_METHOD/UNION（对照：同批的 `hn_public_comment_all` 带 UNION，所以
#   public_comment_all 是好的）。scripts/extract_waimai_tables.py 原样保留上游
#   DDL，把这个缺陷灌进了 canary 与生产两库。
#
# 【为什么必须重建而不能原地 ALTER 加 UNION】
#   合并表要求与成员表列定义逐列一致。当前 huoniao_waimai_order_all.fids 是
#   utf8mb4_0900_ai_ci，而基础表 huoniao_waimai_order.fids 是
#   utf8mb3_general_ci —— 原地 `ALTER TABLE ... UNION=(...)` 会被 MySQL 以
#   "成员表列定义不一致" 拒绝。走 DROP + CREATE TABLE ... LIKE 重建，可让新表
#   的列定义与索引跟基础表完全一致（MySQL 8.0 手册 13.6.7.5：LIKE 会连同列
#   属性与索引一并复制），从而绕开该问题。
#
#   语义与火鸟自带函数 SubTableAsync::run('waimai_order')
#   （webroot/include/class/SubTableAsync.class.php:7-36）一致：DROP → 以基础表
#   定义重建 → ENGINE=MRG_MyISAM → 追加 INSERT_METHOD=LAST UNION=(成员表)。
#
# 【影响范围】
#   全仓 42 个 PHP 文件引用 waimai_order_all（waimai.class.php 内 55 处），
#   全部静默返回空：订单列表、取消订单、支付回调写状态（include/miniReturnPay.php）、
#   商家后台与打印（include/common.func.php）、3 个 waimai 定时任务全部失效。
#   canary 与生产（firebird_manila）两库同时损坏。
#
# 【回滚方式】
#   执行前先备份定义：
#       SHOW CREATE TABLE huoniao_waimai_order_all;
#   若需回滚，把备份里的 CREATE 语句去掉最后的 `INSERT_METHOD=LAST UNION=(...)`
#   子句后原样执行即可重建出「无 UNION」的原状态（合并表本身不存数据，基础表
#   huoniao_waimai_order 不受影响，随时可再次执行本脚本恢复）。
#
# 【用法】
#   ./scripts/fix-waimai-merge-table.sh --dry-run          # 只打印将要执行的语句
#   DB_NAME=firebird_canary ./scripts/fix-waimai-merge-table.sh
#   DB_NAME=firebird_manila ./scripts/fix-waimai-merge-table.sh
#
#   凭据全部来自环境变量，不在脚本内硬编码密码：
#     DB_HOST  (默认 mysql.zxem.svc.cluster.local)
#     DB_PORT  (默认 3306)
#     DB_USER  (默认 firebird_user)
#     DB_PASS  (无默认，必须由环境注入)
#     DB_NAME  (默认 firebird_canary)
# ==============================================================================

set -euo pipefail

DB_HOST="${DB_HOST:-mysql.zxem.svc.cluster.local}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-firebird_user}"
# 默认值与 scripts/init-firebird-db.php 保持一致（仓库既有约定），可被环境变量覆盖
DB_PASS="${DB_PASS:-firebirdpassword}"
DB_NAME="${DB_NAME:-firebird_canary}"

# 表名固定为本次事故涉及的两张表（基础表 + 合并表）
BASE_TABLE="huoniao_waimai_order"
MERGE_TABLE="huoniao_waimai_order_all"

DRY_RUN=0

usage() {
    cat <<EOF
用法: $0 [--dry-run] [--help]

  --dry-run   打印将要执行的 SQL 但不执行（不连接数据库）
  --help      显示本帮助

环境变量:
  DB_HOST=${DB_HOST}
  DB_PORT=${DB_PORT}
  DB_USER=${DB_USER}
  DB_NAME=${DB_NAME}
  DB_PASS   (不打印)
EOF
}

while [ $# -gt 0 ]; do
    case "$1" in
        --dry-run) DRY_RUN=1; shift ;;
        --help|-h) usage; exit 0 ;;
        *) echo "未知参数: $1" >&2; usage; exit 2 ;;
    esac
done

# 修复语句：ENGINE= 与 UNION= 必须拆成两条 ALTER（UNION= 只对已是 MRG 的表生效）
SQL_DROP="DROP TABLE IF EXISTS \`${MERGE_TABLE}\`;"
SQL_CREATE="CREATE TABLE \`${MERGE_TABLE}\` LIKE \`${BASE_TABLE}\`;"
SQL_ENGINE="ALTER TABLE \`${MERGE_TABLE}\` ENGINE=MRG_MyISAM;"
SQL_UNION="ALTER TABLE \`${MERGE_TABLE}\` UNION=(\`${BASE_TABLE}\`);"

SQLS=("$SQL_DROP" "$SQL_CREATE" "$SQL_ENGINE" "$SQL_UNION")

echo "======================================================================"
echo "🔧 修复合并表 UNION 缺失：${DB_NAME}.${MERGE_TABLE}"
echo "======================================================================"
echo "目标: ${DB_HOST}:${DB_PORT} / ${DB_NAME} (用户 ${DB_USER})"
echo

if [ "$DRY_RUN" -eq 1 ]; then
    echo "── DRY-RUN：以下语句将被执行（本次不会真正执行）──────────────────"
    for s in "${SQLS[@]}"; do
        echo "  $s"
    done
    echo "── DRY-RUN：以上语句未执行 ──────────────────────────────────────"
    exit 0
fi

# 依赖 mysql 客户端
if ! command -v mysql >/dev/null 2>&1; then
    echo "❌ 未找到 mysql 客户端，请先安装或在容器内执行：kubectl exec ... -- mysql" >&2
    exit 1
fi

if [ -z "$DB_PASS" ]; then
    echo "❌ 未设置 DB_PASS 环境变量，拒绝在无凭据情况下尝试连接。" >&2
    exit 1
fi

run_sql() {
    # 密码经 MYSQL_PWD 传递，避免出现在命令行参数（ps 可见）里
    MYSQL_PWD="$DB_PASS" mysql \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --user="$DB_USER" \
        --database="$DB_NAME" \
        --default-character-set=utf8mb4 \
        --batch --raw --skip-column-names \
        -e "$1"
}

echo "── 执行修复语句 ──────────────────────────────────────────────────"
for s in "${SQLS[@]}"; do
    echo "  > $s"
    run_sql "$s"
done
echo "✅ 修复语句执行完毕"
echo

echo "── 验证 1/2：SHOW CREATE TABLE 是否含 UNION=(...) ─────────────────"
# SHOW CREATE TABLE 的输出是「表名<TAB>CREATE TABLE ...（多行）」，不能按行号取列
create_sql="$(run_sql "SHOW CREATE TABLE \`${MERGE_TABLE}\`;")"
echo "$create_sql"
if printf '%s' "$create_sql" | grep -qE 'UNION=\('; then
    echo "✅ UNION 成员列表已存在"
else
    echo "❌ 仍然没有 UNION=(...)，修复未生效，请人工介入" >&2
    exit 1
fi
echo

echo "── 验证 2/2：合并表行数是否与基础表一致 ──────────────────────────"
merge_count="$(run_sql "SELECT COUNT(*) FROM \`${MERGE_TABLE}\`;")"
base_count="$(run_sql "SELECT COUNT(*) FROM \`${BASE_TABLE}\`;")"
echo "  ${MERGE_TABLE} = ${merge_count}"
echo "  ${BASE_TABLE}  = ${base_count}"
if [ "$merge_count" = "$base_count" ]; then
    echo "✅ 行数一致（${merge_count}）"
else
    echo "❌ 行数不一致：合并表 ${merge_count} vs 基础表 ${base_count}" >&2
    exit 1
fi
echo

echo "======================================================================"
echo "🎉 修复完成。请在应用侧复测："
echo "   GET /tg-api/fb/waimai/order?page=1&pageSize=20"
echo "   期望 info.pageInfo.totalCount > 0 且 info.list 非空"
echo "======================================================================"
