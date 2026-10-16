# 链监听与流水账本（Story 2.2）

实现：`services/payment-listener/ledger.js`（`listener.js` 每 10 秒调用 `scanOnce`）。监听器**只写流水**（AD-7），对账由 API 在事务内完成。

- **过滤**：仅保存合约 = 官方 USDT-TRC20（`TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`）、`to` = `TRON_MASTER_RECEIVE_ADDRESS`、`only_confirmed=true` 的转入。区块号取自 solidity 节点 `gettransactioninfobyid`；查不到（未固化）则本轮跳过、下轮重试。
- **幂等**：`fbs_chain_tx` 唯一键 `(txid, event_index)` + `INSERT IGNORE`，重复返回不重复入库（`event_index` 目前恒为 0：一笔交易对收款地址仅一次 USDT 转入）。
- **断点续扫**：`fbs_cursor`（name=`payment-listener`）记录已处理的最大区块号；重启后读取游标，跳过更早区块，同块重处理由唯一键兜底，不漏不重。
- **环境变量**：新增使用 `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` / `DB_CLIENT`（与 `services/api/src/migrate.js` 相同的 mariadb CLI 方式，零依赖；监听器镜像需提供 `mariadb`/`mysql` 客户端，部署侧 Secret/values 注入需 owner 跟进）。
- **测试**：`services/payment-listener/test/ledger.test.js`（过滤 / 去重 / 游标续扫）。
