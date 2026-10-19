# `fbs_` 表迁移（Story 1.5 / AD-5）

迁移脚本：`services/api/migrations/NNN_*.sql`；执行器：`services/api/src/migrate.js`。

运行：`DB_HOST=… DB_PORT=3306 DB_USER=… DB_PASSWORD=… DB_NAME=… node src/migrate.js`
（可选 `DB_CLIENT`，默认 `mariadb`，可设为 `mysql`）。

## 表（均只由 Node 写，网关与火鸟只读）
`fbs_charge`、`fbs_chain_tx`、`fbs_cursor`、`fbs_refund`、`fbs_audit`、`fbs_role`、`fbs_member_map`、`fbs_draft_item`、`fbs_i18n`、`fbs_outbox`，另有迁移记录表 `fbs_migrations`。

- `fbs_chain_tx`：`UNIQUE (txid, event_index)`。
- `fbs_charge`：含 `holds_tail`；MariaDB 无部分唯一索引，用生成列 `tail_key = IF(holds_tail=1, payable_micro, NULL)` + `UNIQUE`（NULL 不参与唯一性），实现"`holds_tail=1` 时 `payable_micro` 唯一"。`holds_tail` 的置位/清除由收银台负责，见 `CHECKOUT.md`。
- `fbs_role`：`shop_id NOT NULL DEFAULT 0`（0 = 无店铺），使 `UNIQUE (tg_user_id, role, shop_id)` 对全局角色同样生效。

## 幂等与版本
- 每个迁移文件按文件名只执行一次，记录在 `fbs_migrations`；文件内 DDL 也均为 `CREATE TABLE IF NOT EXISTS`。重复运行不报错、不修改已有数据。
- 后续表结构变更须新增编号迁移文件，不得改已应用的旧文件。
- 整个文件作为一次 stdin 交给客户端执行，因此语句内可含分号于字符串；但不要使用 `DELIMITER`/存储过程。

## 依赖决定（Zero-Dep）
不引入 `mysql2`：执行器通过 `child_process` 调用系统的 `mariadb`/`mysql` 命令行客户端（SQL 走 stdin，密码走 `MYSQL_PWD` 环境变量，不出现在 argv）。部署机/CI 需安装该客户端。如日后改用 `mysql2`，须先经 Arvin 人工批准并在此记录。

## 测试
`services/api/test/migrate.test.js`（`npm test`）：
- 替身测试：表齐全、约束文本、二次运行不执行任何迁移、无 mysql2。
- 真实库集成测试：设置 `DB_HOST`/`DB_USER`/`DB_NAME`（及 `DB_PASSWORD`）时运行——迁移两遍、中间数据不变，`(txid,event_index)` 与 `holds_tail=1` 的 `payable_micro` 重复插入均报错；未设置则跳过。
