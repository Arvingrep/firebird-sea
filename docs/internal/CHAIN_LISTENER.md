# 链监听与流水账本（Story 2.2）

实现：`services/payment-listener/ledger.js`（`listener.js` 每 10 秒调用 `scanOnce`）。监听器**只写流水**（AD-7），对账由 API 在事务内完成。

- **过滤**：仅保存合约 = 官方 USDT-TRC20（`TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`）、`to` = `TRON_MASTER_RECEIVE_ADDRESS`、`only_confirmed=true` 的转入。区块号取自 solidity 节点 `gettransactioninfobyid`；查不到（未固化）则本轮跳过、下轮重试。
- **幂等**：`fbs_chain_tx` 唯一键 `(txid, event_index)` + `INSERT ... ON DUPLICATE KEY UPDATE txid=txid`（不吞截断等其它错误），重复返回不重复入库（`event_index` 目前恒为 0：一笔交易对收款地址仅一次 USDT 转入）。
- **断点续扫**：`fbs_cursor`（name=`payment-listener`）记录已处理的最大区块号；重启后读取游标，游标仅作进度记录、**不用于丢弃记录**：块号低于游标但未入库的交易（如 solidity 节点此前暂未返回）仍会入库，重复由本地 txid 查询与唯一键兜底，不漏不重。
- **环境变量**：新增使用 `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` / `DB_CLIENT`（与 `services/api/src/migrate.js` 相同的 mariadb CLI 方式，零依赖；镜像已 `apk add mariadb-client`；Helm 模板按 `database.*` 注入 `DB_HOST`/`DB_NAME`/`DB_USER`/`DB_PASSWORD`）。
- **增量扫描**：按 `fingerprint` 翻页（≤10 页），本地已入库的 txid 不再查 solidity 节点；整页都已入库即停止。**首次部署**（库为空）最多翻 10 页（≤2000 笔），更早的历史不会入库。
- **错误日志**：只有 TronGrid HTTP 404 / 未配 key 视为“待命”；DB、spawn 等本地错误一律写 stderr。
- **测试范围**：`ledger.test.js` 用内存假库验证逻辑层，不覆盖真实 SQL 唯一键行为（由 `ON DUPLICATE KEY UPDATE` + 迁移中的唯一键保证）。
- **测试**：`services/payment-listener/test/ledger.test.js`（过滤 / 去重 / 游标续扫）。
