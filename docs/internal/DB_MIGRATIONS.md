# `fbs_` 表迁移（Story 1.5 / AD-5）

迁移脚本：`services/api/migrations/*.sql`；执行器：`services/api/src/migrate.js`（`node src/migrate.js`，环境变量 `DB_HOST` `DB_PORT` `DB_USER` `DB_PASSWORD` `DB_NAME`）。

## 表（均只由 Node 写，网关与火鸟只读）
`fbs_charge`、`fbs_chain_tx`、`fbs_cursor`、`fbs_refund`、`fbs_audit`、`fbs_role`、`fbs_member_map`、`fbs_draft_item`、`fbs_i18n`、`fbs_outbox`。

- `fbs_chain_tx`：`UNIQUE (txid, event_index)`。
- `fbs_charge`：含 `holds_tail`；MariaDB 无部分唯一索引，用生成列 `tail_key = IF(holds_tail=1, payable_micro, NULL)` + `UNIQUE`（NULL 不参与唯一性），实现"`holds_tail=1` 时 `payable_micro` 唯一"。`holds_tail` 的置位/清除由后续 Story（收银台）负责。

## 幂等
所有语句均为 `CREATE TABLE IF NOT EXISTS`，重复运行不报错、不修改已有数据；后续表结构变更须新增编号迁移文件，不得改旧文件。

## 依赖：`mysql2`（Zero-Dep 人工确认）
执行器连接 MariaDB 需要 `mysql2`（`require('mysql2/promise')`，仅 CLI 运行时懒加载，`migrate()` 本身只依赖带 `query()` 的对象，测试用替身）。
**状态：待 Arvin 人工批准，本变更未写入 `package.json`。** 批准后在 `services/api` 执行 `npm i mysql2` 并在此处记录批准日期与版本。

## 测试
`services/api/test/migrate.test.js`（`npm test`）：表齐全、唯一约束、幂等 DDL、重复执行、依赖文档。未连接真实 MariaDB；真实库验证待 mysql2 批准后在部署环境执行一次迁移两遍。
