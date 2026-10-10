# 测试先行（Test-First）验收机制

> 最后更新：2026-10-10 · 目的：Dev Agent 开工前，验收测试**已存在且当前为红**；Agent 只负责让它变绿，且不让 main 上其他 PR 无故变红。
> Dev Agent 没有 Bash、无法自测，所以「验收标准」必须是它改不了、CI 一定会跑的东西。

## 1. 机制

| 环节 | 实现 | 保证 |
| :--- | :--- | :--- |
| 用例存在 | `scripts/acceptance/story-<epic>-<num>.sh`（人/架构师先写并合入 main） | `story-to-issue.js --create` 缺用例拒绝建单（退出码 11） |
| 当前为红 | `dev.sh` 开工前对 origin/main 跑 `run.sh --expect-red`；已绿→blocked 并留言（用例无效或需求已满足） | 用例确实能区分「做了/没做」 |
| Agent 改不了 | `scripts/acceptance/` 属受保护路径：dev.sh 丢弃改动，gates「受保护路径未改动」判 FAIL | 不能靠削弱用例变绿 |
| 只让它变绿 | ci-verify `gates` job 的「Story 验收用例」步骤：PR 标题含 `[story:<key>]` 才运行，必须绿；QA 的门禁结论包含它 | Agent 交付不绿即被打回 |
| 不连累他人 | 非 Story PR（标题无标记）一律跳过；main 上待实现的红用例**从不被全局运行** | main 其他 PR 不会无故变红 |

Issue 标题 `[story:<key>] …`（由 `story-to-issue.js` 生成）→ dev.sh 开的 PR 标题 `feat(agent): #N [story:<key>] …` → CI 解析同一标记。`<key>` 取 sprint-status 的 key（如 `1-7-计划任务-cronjob`），用例以其前两段数字 `1-7` 命名。

## 2. 运行

```bash
scripts/acceptance/run.sh --story 1.7              # 运行（绿 0 / 红 1 / 无用例 2）
scripts/acceptance/run.sh --expect-red --story 1.7 # 开工预检：必须当前为红
scripts/acceptance/run.sh --list
scripts/acceptance/selftest.sh                     # 运行器自测
```

## 3. 为其它 Story 复制（6 步）

1. 读 `epics.md` 中该 Story 的 Given/When/Then，挑出**可静态或渲染判定**的条件（Helm 渲染、文件/配置内容、node 纯函数输出）；运行态条件留给人工验收/`make local-accept`。
2. `cp scripts/acceptance/_template.sh scripts/acceptance/story-<N>-<M>.sh`，一条 AC 一个检查函数，失败用 `bad "…"`。
3. 在 main 上运行 `run.sh --expect-red --story N.M`，确认为红；再用一个临时的参考实现（不提交）确认能变绿，并改坏一处确认会再变红——证明用例既不空洞也不过严。
4. 用非 `agent/*` 分支提交用例（含 `docs/` 说明），合入 main。
5. `story-to-issue.js --story N.M --create`：脚本探测到用例，Issue 自动带「测试先行」段；打 `agent:dev`（人工操作）。
6. Agent 的 PR 标题含 `[story:<key>]`，CI 自动执行该用例；通过后进入 QA 与人工合并。合并后可把用例保留作回归（目前只在标题含标记的 PR 触发）。

## 4. 范围与限制

- **运行态 AC** 渲染测试覆盖不到（如 Story 1.7 的「30 分钟未支付订单→state 6」）：在 Issue/PR 里标注为人工验收，走 `make local-accept` 或 GKE canary。
- 用例是 bash：不要写成需要联网或密钥的测试；需要 docker/数据库的行为用例请走 `scripts/test-api-db.sh`（verify-task 已纳入）。
- 缺工具时本机 SKIP，托管 runner 上（`GATE_REQUIRE_TOOLS=1`）按失败处理。
- 本机预检需要 helm 等工具：自托管 runner 缺工具时预检返回 4（无法判定），dev.sh 只警告不阻断。

## 5. 示例：Story 1.7（CronJob）

`scripts/acceptance/story-1-7.sh` 对每个 `values-*.yaml` 渲染并断言：存在 `fbs-cron-<site>` CronJob、`schedule: "* * * * *"`、`concurrencyPolicy: Forbid`、`restartPolicy: OnFailure|Never`、执行 `php include/cron.php`、镜像与 php-fpm 容器一致、环境变量与 PHP 容器一致（AD-18）。目前 main 上无 CronJob 模板，故为红。
> 备注：`values-cebu.yaml` 未设 `siteId`，会继承 `values.yaml` 的 `demo`，渲染出的资源名为 `firebird-demo`；用例按渲染结果取站点名，不受影响，但这是潜在的部署命名问题，建议另行处理。
