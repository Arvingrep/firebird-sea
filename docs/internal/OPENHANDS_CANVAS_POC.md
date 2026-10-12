# Story 7.1 OpenHands Agent Canvas 本机 POC 与管道对照

状态：**仅为 POC 协议（模板），AC1–AC4 的实测均未完成，转 owner 本机执行。** 本文件不含任何伪造的实测值；未填项一律标"待测"。
因此交付此协议的 PR **不得使用 `Closes #107`** 关闭 Issue；待 owner 填入真实数据与 PR 编号后，才可视为 Story 7.1 完成。
结论归属：Issue #106 下留评论上报 Arvin；**未经 Arvin 批准，不得将 OpenHands Canvas 设为默认编排器，也不得下线 `dev.sh`/`qa.sh` Shell 管道。**

## 执行归属
AC1–AC4 需在 owner 本机安装并实跑 Agent Canvas、开真实 PR、在 #106 留评论，Dev Agent 无法代为执行，应作为 owner 人工任务单独跟踪。
配套校验 `services/api/test/openhands-poc-doc.test.js` 在占位未清除时会失败（未挂入 `npm test`；填完后由 owner 迁入 `scripts/acceptance/story-7-1.sh`）。

## 边界（RULES §5/§6/§7）
- 仅本机与 canary 范围；PR 目标分支 `canary`；不触碰生产集群与密钥值，不用 `kubectl` 写操作。
- canary Story 须低风险、无资金路径（非 waimai / 支付相关）。
- 产出 PR 必须过 `ci-verify.yml` 门禁与独立 QA，不绕过、不新增豁免。
- 安装 `@openhands/agent-canvas` 属本机工具，不进入仓库 `package.json`（零依赖门禁）。

## 一、安装与连通记录（AC1）
前置：Node.js 22.12+、uv。命令：`npm install -g @openhands/agent-canvas && agent-canvas`。

| 项 | 结果 |
|---|---|
| 安装耗时 | 待测 |
| 是否需要额外系统权限 | 待测 |
| 能否连接现有 GitHub 仓库 | 待测 |
| 能否复用 Claude 账号登录态 | 待测 |
| 能否复用 Codex 账号登录态 | 待测 |

## 二、canary Story 实跑记录（AC2）
链路：Intake → Planner → Worktree → Dev → Test → PR。

| 项 | 结果 |
|---|---|
| canary Story / Issue | 待选 |
| 产出 PR | 待测 |
| `ci-verify.yml` 门禁结果 | 待测 |
| 独立 QA 结果 | 待测 |

## 三、与 Shell 管道（dev.sh/qa.sh）对照（AC3）

| 指标 | OpenHands Canvas | Shell 管道 |
|---|---|---|
| 完成耗时 | 待测 | 待测 |
| 人工介入次数 | 待测 | 待测 |
| Agent 失败与恢复次数 | 待测 | 待测 |
| QA 返工次数（PR 质量） | 待测 | 待测 |
| 是否值得替换 | 待测 | — |

## 三·补、判定阈值（实跑前先定，事后不得调整）
以下任一项未达标即判「不替换」或「部分替换」，并在第四节逐项列出：

| 指标 | 达标线（OpenHands Canvas 相对 Shell 管道） |
|---|---|
| Story 完成率（Intake → 开 PR） | 100%（本次 canary 必须产出 PR） |
| 人工介入次数 | ≤ 2 次，且不多于 Shell 管道 |
| Agent 失败后恢复 | 以绝对计数记「恢复次数/失败次数」，须全部恢复；失败为 0 记 N/A（单样本不用百分比） |
| QA 返工次数 | ≤ 1 轮，且不多于 Shell 管道 |
| 完成耗时 | ≤ Shell 管道的 1.5 倍 |
| 门禁 | `ci-verify.yml` 一次过，且无新增豁免 |

样本仅 1 个 canary Story，结论只作决策参考，由 Arvin 拍板。

## 四、结论与上报（AC4）
- 结论（替换 / 部分替换 / 不替换）：待定。
- 未达标阈值项与原因：待填。
- 上报：在 Issue #106 下留结论评论，并通知 Arvin 决策。
- 评论链接（形如 `…/issues/106#issuecomment-<id>`）：待填。

## 五、密钥与集群红线（AC5）
全程不读取、不记录任何密钥值；产物仅限本地与 canary；遵守 `.agents/RULES.md` 第 6、7 节。
