# 存量店铺费率回填 — 上线执行 Runbook

> 配套脚本：`deploy/sql/backfill-waimai-fencheng.sql`（仅写 `fencheng_*` 费率列；`privilege`/`is_vipdiscount`/`ptprofit` 不盲目覆盖，序列化字段走后台/PHP）
> 适用：W1 收尾 — 让 3% 技术服务费（0% 商品抽佣）+ 商家自配送（配送/打包费归商家）对**存量店铺**生效
> 纪律：**先快照、再只读副本预演、后生产执行、最后 4 条校验**。本环境无 DB 访问，以下命令均供运维在目标环境执行。

---

## 0. 前置确认（执行前必读）

1. **表前缀**：脚本默认 `huoniao_`（来自 `webroot/include/dbinfo.inc.php` 的 `$DB_PREFIX`）。若目标环境前缀不同，先全局替换：
   ```bash
   sed 's/huoniao_/YOURPREFIX_/g' deploy/sql/backfill-waimai-fencheng.sql > /tmp/backfill.sql
   ```
2. **configLock 已开启**（W1 已置 `values.yaml` `configLock.enabled: true`）：开启后 `include/config/*` 为 root 只读，**后台无法改配置**。因此"会员折扣特权置 10"等若尚未做，必须走 Git/configVars 而非后台（见第 4 步校验 1 与上线前清单）。
3. **结算口径依赖 `customClearingswitch=1`**：由 entrypoint 启动断言保障（`entrypoint-web.sh:85-99`，非 1 直接 `exit 1`），与本次回填解耦，但务必确认生产 Pod 启动日志有 `[OK] 启动断言通过：customClearingswitch=1`。

环境变量约定（按实际填写）：
```bash
export DB_HOST=... DB_PORT=3306 DB_NAME=... DB_USER=... DB_PASS=...
export REPLICA_HOST=...      # 只读副本
export BACKUP_DIR=/backup
```

---

## ① 执行前全量快照（必须落盘，回滚的唯一依据）

```bash
# 全量逻辑备份（--single-transaction 对 InnoDB 不锁表；MyISAM 会锁，低峰执行）
mkdir -p "$BACKUP_DIR"
TS=$(date +%Y%m%d-%H%M%S)
mysqldump -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" \
  --single-transaction --routines --triggers --events --hex-blob \
  --databases "$DB_NAME" > "$BACKUP_DIR/pre-backfill-${TS}.sql"

# 单独导出受影响表当前值（回填前后 diff 用，体积小、可快速核对）
mysqldump -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" \
  "$DB_NAME" huoniao_waimai_shop \
  --where="1=1" --no-create-info --skip-triggers \
  > "$BACKUP_DIR/pre-backfill-waimai-shop-${TS}.sql"

echo "快照已存: $BACKUP_DIR/pre-backfill-${TS}.sql"
ls -lh "$BACKUP_DIR"/pre-backfill-*.sql
```

**回滚**＝从 `pre-backfill-<TS>.sql` 全量恢复（或仅 `source pre-backfill-waimai-shop-<TS>.sql` 还原该表）。

---

## ② 只读副本预演（不写生产）

```bash
# a. 取"回填前"分布，确认脚本的 SELECT 快照能正常返回
mysql -h"$REPLICA_HOST" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" \
  -e "SELECT id, shopname, fencheng_foodprice, fencheng_delivery, fencheng_dabao \
      FROM huoniao_waimai_shop ORDER BY id LIMIT 20;"

# b. 预估受影响行数（生产 UPDATE 无 WHERE = 全表，故受影响行数 = 店铺总数）
mysql -h"$REPLICA_HOST" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" \
  -e "SELECT COUNT(*) AS affected_shops FROM huoniao_waimai_shop;"

# c. 预览 ptprofit / is_vipdiscount 的非零风险行（仅 SELECT，不修改）
mysql -h"$REPLICA_HOST" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" \
  -e "SELECT id, shopname, ptprofit, is_vipdiscount \
      FROM huoniao_waimai_shop WHERE ptprofit <> 0 OR is_vipdiscount = 1;"
```

> 副本上**不要**实际跑 UPDATE（会破坏复制）。预演只用以上 SELECT 确认数据与行数符合预期。

---

## ③ 生产执行

```bash
# 低峰期执行。脚本唯一写操作是 UPDATE huoniao_waimai_shop SET fencheng_*（全表，MyISAM 锁整表数秒）
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" \
  < /tmp/backfill.sql        # 或 < deploy/sql/backfill-waimai-fencheng.sql

# 确认受影响行数
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" \
  -e "SELECT ROW_COUNT() AS updated_rows;"
```

> ⚠ 表前缀非 `huoniao_` 时务必用 `sed` 替换后的 `/tmp/backfill.sql`，**不要**直接喂原脚本。

---

## ④ 4 条校验（生产执行后立即跑）

### 校验 1 — privilege 仍可反序列化且 `waimai = 10`（PHP 烟测）
`privilege` 是 PHP 序列化字段，SQL 无法直接校验其值。用一段 PHP 读取全表并确认：(a) 可 `unserialize`；(b) 会员折扣特权 `waimai` 键 = 10（对应"会员折扣特权置 10"动作）。
```php
<?php
// 填实际连接；在能连生产的临时机执行
$pdo = new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8", $DB_USER, $DB_PASS);
$rows = $pdo->query("SELECT id, shopname, privilege FROM huoniao_waimai_shop")->fetchAll(PDO::FETCH_ASSOC);
$bad = $warn = 0;
foreach ($rows as $r) {
    $p = @unserialize($r['privilege']);
    if ($p === false && $r['privilege'] !== 'b:0;' && $r['privilege'] !== '') { echo "BAD unserialize id={$r['id']}\n"; $bad++; continue; }
    $w = is_array($p) ? ($p['waimai'] ?? null) : null;
    if ($w !== 10) { echo "WARN waimai!=10 id={$r['id']} val=".var_export($w,true)."\n"; $warn++; }
}
echo "privilege 检查完成: 店铺数=".count($rows)." 反序列化失败=$bad 非10=$warn\n";
```
期望：`反序列化失败=0`；`非10=0`（若 >0，说明"会员折扣特权置 10"尚未完成，回后台/Git 处理，不在此脚本内强改）。

### 校验 2 — 店铺 fencheng 全为 3/0/0（纯 SQL，期望 0 行）
```sql
SELECT id, shopname
FROM huoniao_waimai_shop
WHERE fencheng_foodprice <> 3
   OR fencheng_delivery  <> 0
   OR fencheng_dabao     <> 0;
```

### 校验 3 — vip / ptprofit / additional 归零（纯 SQL，期望 0 行）
```sql
SELECT id, shopname, is_vipdiscount, ptprofit, open_additional
FROM huoniao_waimai_shop
WHERE is_vipdiscount <> 0
   OR ptprofit       <> 0
   OR open_additional <> 0;   -- 若表无 open_additional 列，删除该条件
```
> 非零行**不要**盲目 UPDATE。先与业务确认（脚本第 3 步已注释对应 UPDATE）。属"平台承担成本"类开关，确认后单独执行。

### 校验 4 — PHP 侧 unserialize 烟测（全表序列化列健康）
复用校验 1 的脚本逻辑，扩展覆盖所有序列化列（如 `privilege`、`config` 等），确保回填后站点后台读配置不报 `false`。若任一列 `unserialize === false` 且非空串，立即从快照回滚该表并排查。

---

## ⑤ 三处一致验证（人工流程，非 SQL）
按 `决策记录-2026-10-22.md` §三：
1. 后台新建测试店铺（此时从 configVars 抄到 `foodprice=3`）；
2. 该店下一单（COD 即可）并支付，确认订单行：
   ```sql
   SELECT ordernum, fencheng_foodprice, fencheng_delivery, fencheng_dabao
   FROM huoniao_waimai_order_all WHERE sid = <测试店id> ORDER BY id DESC LIMIT 1;
   -- 期望 foodprice=3, delivery=0, dabao=0
   ```
3. 商家端结算明细：平台应收 = 商品额 × 3%，配送/打包为 0、全归商家。

> ⚠ **禁止对 `*_all` 合并表写操作**（MRG_MYISAM + INSERT_METHOD=LAST，写入静默落到最后一张分表）。只读查询即可。

---

## ⑥ 回滚（若校验失败）
```bash
# 整库回滚（最稳）
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" \
  < "$BACKUP_DIR/pre-backfill-<TS>.sql"
# 或仅还原受影响表
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" \
  < "$BACKUP_DIR/pre-backfill-waimai-shop-<TS>.sql"
```
