- source_spec: none
  summary: Story 2.2 链监听与流水账本（`src/db/ledger.js`、迁移 002）
  evidence: 与 Story 2.1 分属两个可独立交付的目标；代码已写好但未通过集成测试，已单独提交为 wip
- source_spec: none
  summary: Story 2.3 对账结算与待投递任务（`src/db/reconcile.js`、`src/db/outbox.js`）
  evidence: 依赖 2.1 的收银台与 2.2 的流水；代码已写好但未验证，已单独提交为 wip
- source_spec: `_bmad-output/implementation-artifacts/spec-2-1-收银台与尾数分配.md`
  summary: `sweep` 的调度（定时清扫）与批量上限
  evidence: 评审指出没有调用方；属于 Story 2.5
- source_spec: `_bmad-output/implementation-artifacts/spec-2-1-收银台与尾数分配.md`
  summary: `matched`/`void` 状态释放尾数分支的测试
  evidence: 目前没有任何代码写入 `void`；引入时一并补
