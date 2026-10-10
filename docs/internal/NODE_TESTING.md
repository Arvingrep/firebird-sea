# Node 服务测试与 CI（Story 1.4 / AD-15）

资金路径的 Node 代码必须有 `node:test` 自动化测试（零依赖）。

| 服务 | 命令 | 覆盖 |
|------|------|------|
| `services/api` | `npm test` | `test/telegram-auth.test.js`（initData HMAC 校验、篡改、过期）、`test/payment-manager.test.js`（USDT 尾数分配、唯一性、匹配与确认）、`test/checkout.test.js`（Story 2.1 收银台：金额公式、尾数耗尽、汇率失败/过期、尾数唯一约束冲突重分配，内存假连接） 及既有用例 |
| `services/payment-listener` | `npm test` | `test/amount.test.js`（TRC-20 金额换算，`amount.js` 自 `listener.js` 抽出以便测试） |

CI：`.github/workflows/ci-verify.yml` 的 `verify-task` job 运行 `scripts/verify-task.sh`，其步骤 6 依次执行 `services/api`、`services/payment-listener`、`services/news-sync` 的 `npm test`；任一失败则 job 失败，`agent-qa` 依赖该 job，失败不会合并。

新增测试文件需显式列入各服务 `package.json` 的 `test` 脚本（Node 20 对目录参数不友好）。
