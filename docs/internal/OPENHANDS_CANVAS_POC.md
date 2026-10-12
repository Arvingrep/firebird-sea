# Story 7.1 OpenHands Agent Canvas 本机 POC 与管道对照

状态：**协议已就绪，实测数据待 owner 在本机执行后填写**（本文件不含任何伪造的实测值；未填项一律标"待测"）。
结论归属：Issue #106 下留评论上报 Arvin；**未经 Arvin 批准，不得将 OpenHands Canvas 设为默认编排器，也不得下线 `dev.sh`/`qa.sh` Shell 管道。**

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

## 四、结论与上报（AC4）
- 结论（替换 / 部分替换 / 不替换）：待定。
- 未达标阈值项与原因：待填。
- 上报：在 Issue #106 下留结论评论，并通知 Arvin 决策。

## 五、密钥与集群红线（AC5）
全程不读取、不记录任何密钥值；产物仅限本地与 canary；遵守 `.agents/RULES.md` 第 6、7 节。
